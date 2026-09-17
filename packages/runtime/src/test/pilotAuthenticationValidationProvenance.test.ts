import assert from 'node:assert';
import { test } from 'node:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import {
  ControlledPilotEngine,
  TransactionalPilotStore,
  PhysicalDocumentValidator,
  PilotExternalValidator,
  StaticSecretProvider
} from '../index.js';
import {
  PilotProgram,
  PilotTaskRequest,
  PilotHumanReviewReceipt
} from '@ai-employee/shared';
import { TokenService } from '@ai-employee/shared/server';

declare const require: any;
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

function getRepoRoot(): string {
  let cur = process.cwd();
  while (cur && (!fs.existsSync(path.join(cur, 'package.json')) || !fs.existsSync(path.join(cur, 'schemas')))) {
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return cur;
}
const repoRoot = getRepoRoot();

test('Pilot Authentication, Validation and Provenance — 22 Mandatory Verification Tests', async (t) => {
  const tmpDir = path.join(os.tmpdir(), `aetf_auth_val_prov_test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const authDocPath = path.join(tmpDir, 'despacho_autorizacao_2026.pdf');
  const authDocContent = PhysicalDocumentValidator.buildRealBinaryPdf(
    'Despacho de Autorizacao de Piloto Operacional 2026',
    ['BT /F1 12 Tf 50 750 Td (DESPACHO FORMAL DE AUTORIZACAO DO PILOTO OPERACIONAL SASO 2026) Tj ET']
  );
  fs.writeFileSync(authDocPath, authDocContent);
  const authDocSha = sha256(authDocContent);

  const mariaSecret = 'SASO_OPERATIONAL_REV_SECRET_MARIA_MIN_32_CHARS_2026';
  const joaoSecret = 'SASO_OPERATIONAL_REV_SECRET_JOAO_MIN_32_CHARS_2026';

  const secretProvider = new StaticSecretProvider({
    'sec_rev_maria': mariaSecret,
    'sec_rev_joao': joaoSecret
  });

  const baseOperationalPilot: PilotProgram = {
    pilot_id: 'PILOT_OP_AUTH_VAL_2026',
    tenant_id: 'tenant_pilot_angola_ops_01',
    organization_name: 'Sociedade Angolana de Servicos & Operacoes Lda (SASO)',
    authorization_reference: 'AUTH-SASO-2026-OP-500',
    authorized_by: 'dr_antonio_silva_dir_executivo',
    authorized_at: '2026-09-15T08:30:00Z',
    start_at: '2026-09-15T09:00:00Z',
    end_at: '2026-10-15T18:00:00Z',
    selected_employee_ids: [66, 263, 58, 52, 73],
    allowed_data_categories: ['ACCOUNTING', 'INVOICES', 'LETTERS'],
    prohibited_data_categories: ['RAW_CREDIT_CARD'],
    allowed_connectors: ['T.DOCS.CLASSIFIER'],
    prohibited_actions: ['DIRECT_WIRE_TRANSFER'],
    human_reviewers: ['rev_maria_santos', 'rev_joao_manuel'],
    reviewer_configs: [
      { reviewer_id: 'rev_maria_santos', display_name: 'Dra. Maria Santos', role: 'AUDITOR', secret_ref: 'sec_rev_maria' },
      { reviewer_id: 'rev_joao_manuel', display_name: 'Dr. Joao Manuel', role: 'CONTROLLER', secret_ref: 'sec_rev_joao' }
    ],
    task_limit: 50,
    execution_mode: 'OPERATIONAL_PILOT',
    authorization_document_path: authDocPath,
    authorization_document_sha256: authDocSha,
    status: 'ACTIVE',
    created_at: '2026-09-15T08:00:00Z',
    updated_at: '2026-09-15T08:30:00Z'
  };

  function createReviewerToken(
    tokenSvc: TokenService,
    userId: string,
    tenantId: string,
    roles: string[] = ['HUMAN_REVIEWER'],
    permissions: string[] = ['PILOT_REVIEW', 'READ', 'EXECUTE', 'REVIEW']
  ): string {
    tokenSvc.upsertAccount({
      user_id: userId,
      tenant_id: tenantId,
      roles,
      permissions,
      status: 'ACTIVE'
    });
    return tokenSvc.signToken({
      user_id: userId,
      tenant_id: tenantId,
      roles,
      permissions,
      sub: userId
    });
  }

  function createTestEngine(customStore?: TransactionalPilotStore, customTokenService?: TokenService, mode: 'OPERATIONAL_PILOT' | 'SIMULATION' = 'OPERATIONAL_PILOT') {
    const store = customStore || new TransactionalPilotStore(path.join(tmpDir, `pilot_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.db`), mode);
    const eng = new ControlledPilotEngine(store, customTokenService, secretProvider);
    eng.createPilot({ ...baseOperationalPilot, execution_mode: mode });
    eng.authorizePilot(
      baseOperationalPilot.pilot_id,
      baseOperationalPilot.authorization_reference,
      baseOperationalPilot.authorized_by,
      baseOperationalPilot.authorized_at
    );
    eng.activatePilot(baseOperationalPilot.pilot_id);
    return { eng, store };
  }

  // -------------------------------------------------------------
  // Test 1: TokenService ausente em ControlledPilotEngine em modo operacional falha
  // -------------------------------------------------------------
  await t.test('1. TokenService ausente em ControlledPilotEngine em modo operacional falha imediatamente antes de qualquer revisão', () => {
    const { eng } = createTestEngine(undefined, undefined, 'OPERATIONAL_PILOT');
    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_01',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 01',
      instruction: 'Classificar factura de papelaria',
      input_data: { document_title: 'Factura 01' },
      idempotency_key: 'IDEMP_TASK_TEST_01_2026',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    };
    eng.executeTask(taskReq);

    assert.throws(
      () => {
        eng.reviewTask({
          review_id: 'REV_TASK_TEST_01',
          task_id: 'TASK_TEST_01',
          reviewer: 'rev_maria_santos',
          decision: 'APPROVED',
          comments: 'Aprovado',
          auth_token: 'dummy.jwt.token'
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('TokenService') || err.message.includes('Token'), err.message);
        return true;
      }
    );
  });

  // -------------------------------------------------------------
  // Test 2: Token emitido para tenant diferente é rejeitado
  // -------------------------------------------------------------
  await t.test('2. Token emitido para tenant diferente é rejeitado com erro estrito e não acessa sessão nem desafio', () => {
    const tokenSvc = new TokenService('secret-at-least-32-chars-long-test-2026', path.join(tmpDir, 'tok2.db'));
    const { eng, store } = createTestEngine(undefined, tokenSvc, 'OPERATIONAL_PILOT');

    const foreignToken = createReviewerToken(
      tokenSvc,
      'rev_maria_santos',
      'tenant_foreign_evil_corp'
    );

    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_02',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 02',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 02' },
      idempotency_key: 'IDEMP_TASK_TEST_02_2026',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    };
    eng.executeTask(taskReq);

    assert.throws(
      () => {
        eng.reviewTask({
          review_id: 'REV_TASK_TEST_02',
          task_id: 'TASK_TEST_02',
          reviewer: 'rev_maria_santos',
          decision: 'APPROVED',
          comments: 'Aprovado',
          auth_token: foreignToken,
          event_signed_at: new Date().toISOString()
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('inquilino') || err.message.includes('tenant') || err.message.includes('rejeitada'), err.message);
        return true;
      }
    );

    const taskAfter = store.getTask('TASK_TEST_02');
    assert.strictEqual(taskAfter?.human_review_status, 'PENDING_REVIEW');
  });

  // -------------------------------------------------------------
  // Test 3: Token com claim de utilizador divergente do revisor é rejeitado
  // -------------------------------------------------------------
  await t.test('3. Token com claim de utilizador divergente do revisor credenciado no desafio é rejeitado', () => {
    const tokenSvc = new TokenService('secret-at-least-32-chars-long-test-2026', path.join(tmpDir, 'tok3.db'));
    const { eng, store } = createTestEngine(undefined, tokenSvc, 'OPERATIONAL_PILOT');

    const wrongUserToken = createReviewerToken(
      tokenSvc,
      'rev_carlos_intruder',
      baseOperationalPilot.tenant_id
    );

    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_03',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 03',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 03' },
      idempotency_key: 'IDEMP_TASK_TEST_03_2026',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    };
    eng.executeTask(taskReq);

    assert.throws(
      () => {
        eng.reviewTask({
          review_id: 'REV_TASK_TEST_03',
          task_id: 'TASK_TEST_03',
          reviewer: 'rev_maria_santos',
          decision: 'APPROVED',
          comments: 'Aprovado',
          auth_token: wrongUserToken,
          event_signed_at: new Date().toISOString()
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('utilizador') || err.message.includes('user') || err.message.includes('rejeitada'), err.message);
        return true;
      }
    );
  });

  // -------------------------------------------------------------
  // Test 4: Token expirado é rejeitado sem transição de estado
  // -------------------------------------------------------------
  await t.test('4. Token expirado é rejeitado sem transição de estado da tarefa', () => {
    const tokenSvc = new TokenService('secret-at-least-32-chars-long-test-2026', path.join(tmpDir, 'tok4.db'));
    const { eng, store } = createTestEngine(undefined, tokenSvc, 'OPERATIONAL_PILOT');

    tokenSvc.upsertAccount({
      user_id: 'rev_maria_santos',
      tenant_id: baseOperationalPilot.tenant_id,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW'],
      status: 'ACTIVE'
    });
    const expiredToken = tokenSvc.signToken({
      user_id: 'rev_maria_santos',
      tenant_id: baseOperationalPilot.tenant_id,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW'],
      sub: 'rev_maria_santos',
      exp: Math.floor(Date.now() / 1000) - 300 // Expirado há 5 minutos
    });

    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_04',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 04',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 04' },
      idempotency_key: 'IDEMP_TASK_TEST_04_2026',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    };
    eng.executeTask(taskReq);

    assert.throws(
      () => {
        eng.reviewTask({
          review_id: 'REV_TASK_TEST_04',
          task_id: 'TASK_TEST_04',
          reviewer: 'rev_maria_santos',
          decision: 'APPROVED',
          comments: 'Aprovado',
          auth_token: expiredToken,
          event_signed_at: new Date().toISOString()
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('expir') || err.message.includes('rejeitada'), err.message);
        return true;
      }
    );

    const taskAfter = store.getTask('TASK_TEST_04');
    assert.strictEqual(taskAfter?.human_review_status, 'PENDING_REVIEW');
  });

  // -------------------------------------------------------------
  // Test 5: Token revogado ativamente no TokenService tem validação negada
  // -------------------------------------------------------------
  await t.test('5. Token revogado ativamente no TokenService tem validação negada imediatamente', () => {
    const tokenSvc = new TokenService('secret-at-least-32-chars-long-test-2026', path.join(tmpDir, 'tok5.db'));
    const { eng, store } = createTestEngine(undefined, tokenSvc, 'OPERATIONAL_PILOT');

    const token = createReviewerToken(
      tokenSvc,
      'rev_maria_santos',
      baseOperationalPilot.tenant_id
    );

    const payload = tokenSvc.verifyToken(token).payload;
    assert.ok(payload?.jti, 'Token deve ter JTI');
    tokenSvc.revokeToken(payload!.jti, 'Teste de revogação de segurança');

    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_05',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 05',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 05' },
      idempotency_key: 'IDEMP_TASK_TEST_05_2026',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    };
    eng.executeTask(taskReq);

    assert.throws(
      () => {
        eng.reviewTask({
          review_id: 'REV_TASK_TEST_05',
          task_id: 'TASK_TEST_05',
          reviewer: 'rev_maria_santos',
          decision: 'APPROVED',
          comments: 'Aprovado',
          auth_token: token,
          event_signed_at: new Date().toISOString()
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('revog') || err.message.includes('rejeitada'), err.message);
        return true;
      }
    );
  });

  // -------------------------------------------------------------
  // Test 6: Sessão não persistida na tabela é rejeitada
  // -------------------------------------------------------------
  await t.test('6. Sessão não persistida na tabela pilot_reviewer_sessions é rejeitada mesmo com token criptograficamente válido', () => {
    const tokenSvc = new TokenService('secret-at-least-32-chars-long-test-2026', path.join(tmpDir, 'tok6.db'));
    const { eng, store } = createTestEngine(undefined, tokenSvc, 'OPERATIONAL_PILOT');

    const token = createReviewerToken(
      tokenSvc,
      'rev_maria_santos',
      baseOperationalPilot.tenant_id
    );

    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_06',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 06',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 06' },
      idempotency_key: 'IDEMP_TASK_TEST_06_2026',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    };
    eng.executeTask(taskReq);

    assert.throws(
      () => {
        eng.reviewTask({
          review_id: 'REV_TASK_TEST_06',
          task_id: 'TASK_TEST_06',
          reviewer: 'rev_maria_santos',
          decision: 'APPROVED',
          comments: 'Aprovado',
          auth_token: token,
          event_signed_at: new Date().toISOString()
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('Sessão') || err.message.includes('session'), err.message);
        return true;
      }
    );
  });

  // -------------------------------------------------------------
  // Test 7: Sessão expirada na base SQLite é rejeitada e marcada como EXPIRED
  // -------------------------------------------------------------
  await t.test('7. Sessão expirada na base SQLite é rejeitada e marcada como EXPIRED', () => {
    const tokenSvc = new TokenService('secret-at-least-32-chars-long-test-2026', path.join(tmpDir, 'tok7.db'));
    const { eng, store } = createTestEngine(undefined, tokenSvc, 'OPERATIONAL_PILOT');

    const token = createReviewerToken(
      tokenSvc,
      'rev_maria_santos',
      baseOperationalPilot.tenant_id
    );
    const payload = tokenSvc.verifyToken(token).payload;

    const expiredSessionId = `SESS_EXPIRED_${Date.now()}`;
    store.createReviewerSession({
      session_id: expiredSessionId,
      token_jti: payload!.jti,
      reviewer_id: 'rev_maria_santos',
      tenant_id: baseOperationalPilot.tenant_id,
      pilot_id: baseOperationalPilot.pilot_id,
      expires_at: new Date(Date.now() - 3600 * 1000).toISOString() // Expirada há 1 hora
    });

    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_07',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 07',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 07' },
      idempotency_key: 'IDEMP_TASK_TEST_07_2026',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    };
    eng.executeTask(taskReq);

    assert.throws(
      () => {
        eng.reviewTask({
          review_id: 'REV_TASK_TEST_07',
          task_id: 'TASK_TEST_07',
          reviewer: 'rev_maria_santos',
          decision: 'APPROVED',
          comments: 'Aprovado',
          auth_token: token,
          event_signed_at: new Date().toISOString()
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('Sessão') || err.message.includes('expirada'), err.message);
        return true;
      }
    );

    const sessionInDb = store.getReviewerSession(expiredSessionId);
    assert.strictEqual(sessionInDb?.status, 'EXPIRED', 'Sessão expirada deve ter status atualizado para EXPIRED');
  });

  // -------------------------------------------------------------
  // Test 8: Leitor independente de DOCX (mammoth) valida DOCX e rejeita corrompido
  // -------------------------------------------------------------
  await t.test('8. Leitor independente de DOCX (mammoth) valida com sucesso documento gerado em DOCX e rejeita ficheiro corrompido/truncado', async () => {
    const validDocx = PhysicalDocumentValidator.buildRealBinaryDocx('Documento Oficial SASO', [
      'Paragrafo 1: Conteudo formal verificado.',
      'Paragrafo 2: Normas de seguranca cumpridas.'
    ]);
    const receipt = await PhysicalDocumentValidator.createIndependentReceipt(validDocx, 'DOCX', 'T_DOCX', 1);
    assert.strictEqual(receipt.result, 'PASS');
    assert.strictEqual(receipt.parser_name, 'mammoth');

    const corruptDocx = Buffer.from('PK\x03\x04conteudo_totalmente_invalido_sem_formato_openxml');
    const failReceipt = await PhysicalDocumentValidator.createIndependentReceipt(corruptDocx, 'DOCX', 'T_DOCX_FAIL', 1);
    assert.strictEqual(failReceipt.result, 'FAIL');
    assert.ok(failReceipt.error !== null);
  });

  // -------------------------------------------------------------
  // Test 9: Leitor independente de XLSX (exceljs) valida XLSX e rejeita inválido
  // -------------------------------------------------------------
  await t.test('9. Leitor independente de XLSX (exceljs) valida com sucesso pasta gerada com folhas e células reais e rejeita ficheiro sem workbook válido', async () => {
    const validXlsx = PhysicalDocumentValidator.buildRealBinaryXlsx('Balancete 2026', [
      ['Conta', 'Descricao', 'Saldo'],
      ['11', 'Caixa Geral', 500000],
      ['12', 'Banco BFA', 12500000]
    ]);
    const receipt = await PhysicalDocumentValidator.createIndependentReceipt(validXlsx, 'XLSX', 'T_XLSX', 1);
    assert.strictEqual(receipt.result, 'PASS');
    assert.strictEqual(receipt.parser_name, 'exceljs');
    assert.ok((receipt.page_or_cell_count || 0) > 0);

    const corruptXlsx = Buffer.from('PK\x03\x04ficheiro_xlsx_danificado_sem_workbook');
    const failReceipt = await PhysicalDocumentValidator.createIndependentReceipt(corruptXlsx, 'XLSX', 'T_XLSX_FAIL', 1);
    assert.strictEqual(failReceipt.result, 'FAIL');
  });

  // -------------------------------------------------------------
  // Test 10: Leitor independente de PDF (pdf-lib) valida contagem real de páginas > 0
  // -------------------------------------------------------------
  await t.test('10. Leitor independente de PDF (pdf-lib) valida contagem real de páginas > 0 e rejeita PDF malformado', async () => {
    const validPdf = PhysicalDocumentValidator.buildRealBinaryPdf('Relatorio PDF', [
      'BT /F1 12 Tf 50 750 Td (Texto de teste da primeira pagina) Tj ET'
    ]);
    const receipt = await PhysicalDocumentValidator.createIndependentReceipt(validPdf, 'PDF', 'T_PDF', 1);
    assert.strictEqual(receipt.result, 'PASS');
    assert.strictEqual(receipt.parser_name, 'pdf-lib');
    assert.strictEqual(receipt.page_or_cell_count, 1);

    const corruptPdf = Buffer.from('%PDF-1.4 header_valido_mas_corpo_totalmente_danificado');
    const failReceipt = await PhysicalDocumentValidator.createIndependentReceipt(corruptPdf, 'PDF', 'T_PDF_FAIL', 1);
    assert.strictEqual(failReceipt.result, 'FAIL');
  });

  // -------------------------------------------------------------
  // Test 11: Emissão de desafio bloqueada sem validação estrutural prévia PASS
  // -------------------------------------------------------------
  await t.test('11. Tentativa de emitir desafio sem validação estrutural prévia aprovada (PASS) é bloqueada', () => {
    const { eng, store } = createTestEngine();
    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_11',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 11',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 11' },
      idempotency_key: 'IDEMP_TASK_TEST_11_2026',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    };
    eng.executeTask(taskReq);

    // Apagar recibo estrutural para simular ausência
    (store as any).db.prepare(`
      DELETE FROM task_document_validations WHERE task_id = 'TASK_TEST_11' AND validation_type = 'INTERNAL_STRUCTURAL_VALIDATION'
    `).run();

    assert.throws(
      () => {
        eng.issueReviewChallenge('TASK_TEST_11');
      },
      (err: any) => {
        assert.ok(err.message.includes('estrutural') || err.message.includes('bloqueado'), err.message);
        return true;
      }
    );
  });

  // -------------------------------------------------------------
  // Test 12: Emissão de desafio bloqueada sem validação independente prévia PASS
  // -------------------------------------------------------------
  await t.test('12. Tentativa de emitir desafio sem validação independente de biblioteca prévia aprovada (PASS) é bloqueada', () => {
    const { eng, store } = createTestEngine();
    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_12',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 12',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 12' },
      idempotency_key: 'IDEMP_TASK_TEST_12_2026',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    };
    eng.executeTask(taskReq);

    // Apagar recibo independente para simular ausência
    (store as any).db.prepare(`
      DELETE FROM task_document_validations WHERE task_id = 'TASK_TEST_12' AND validation_type = 'INDEPENDENT_LIBRARY_VALIDATION'
    `).run();

    assert.throws(
      () => {
        eng.issueReviewChallenge('TASK_TEST_12');
      },
      (err: any) => {
        assert.ok(err.message.includes('independente') || err.message.includes('bloqueado'), err.message);
        return true;
      }
    );
  });

  // -------------------------------------------------------------
  // Test 13: Emissão de desafio com hash de documento divergente é bloqueada
  // -------------------------------------------------------------
  await t.test('13. Tentativa de emitir desafio com hash de documento divergente do output persistido é bloqueada', () => {
    const { eng, store } = createTestEngine();
    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_13',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 13',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 13' },
      idempotency_key: 'IDEMP_TASK_TEST_13_2026',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    };
    eng.executeTask(taskReq);

    // Adulterar hash no recibo de validação
    (store as any).db.prepare(`
      UPDATE task_document_validations
      SET file_bytes_sha256 = '0000000000000000000000000000000000000000000000000000000000000000'
      WHERE task_id = 'TASK_TEST_13'
    `).run();

    assert.throws(
      () => {
        eng.issueReviewChallenge('TASK_TEST_13');
      },
      (err: any) => {
        assert.ok(err.message.includes('diverge') || err.message.includes('Hash'), err.message);
        return true;
      }
    );
  });

  // -------------------------------------------------------------
  // Test 14: Recibos de validação estrutural e independente gravados com tipos e hashes distintos
  // -------------------------------------------------------------
  await t.test('14. Recibos de validação estrutural e de biblioteca externa são ambos gravados com tipos e hashes distintos na base SQLite para cada versão do documento', () => {
    const { eng, store } = createTestEngine();
    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_14',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 14',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 14' },
      idempotency_key: 'IDEMP_TASK_TEST_14_2026',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    };
    eng.executeTask(taskReq);

    const receipts = store.getDocumentValidationReceipts('TASK_TEST_14', 1);
    assert.strictEqual(receipts.length, 2, 'Devem existir exatamente 2 recibos de validação para a v1');

    const struct = receipts.find(r => r.validation_type === 'INTERNAL_STRUCTURAL_VALIDATION');
    const indep = receipts.find(r => r.validation_type === 'INDEPENDENT_LIBRARY_VALIDATION');

    assert.ok(struct, 'Recibo estrutural deve existir');
    assert.ok(indep, 'Recibo independente deve existir');
    assert.notStrictEqual(struct?.receipt_id, indep?.receipt_id, 'IDs de recibo devem ser distintos');
    assert.notStrictEqual(struct?.parser_name, indep?.parser_name, 'Parsers devem ser distintos');
  });

  // -------------------------------------------------------------
  // Test 15: run-controlled-pilot.mjs rejeita tarefa sem idempotency_key explícita
  // -------------------------------------------------------------
  await t.test('15. run-controlled-pilot.mjs rejeita tarefa operacional sem idempotency_key explícita vinda da fonte (sem geração IDEMP_...)', () => {
    const testConfigPath = path.join(tmpDir, 'op_config_runner.json');
    fs.writeFileSync(testConfigPath, JSON.stringify(baseOperationalPilot, null, 2), 'utf8');

    const badTasksPath = path.join(tmpDir, 'tasks_missing_idemp.json');
    const badTasksData = {
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      tasks: [
        {
          task_id: 'TASK_BAD_01',
          pilot_id: baseOperationalPilot.pilot_id,
          tenant_id: baseOperationalPilot.tenant_id,
          employee_id: 66,
          requested_by: 'solicitante_real_angola_01',
          received_at: '2026-09-15T09:10:00Z',
          title: 'Tarefa Sem Idempotency Key',
          instruction: 'Classificar',
          input_data: { title: 'Doc' },
          format: 'PDF'
          // idempotency_key propositadamente ausente
        }
      ]
    };
    fs.writeFileSync(badTasksPath, JSON.stringify(badTasksData, null, 2));

    const result = spawnSync(
      process.execPath,
      [
        path.join(repoRoot, 'scripts', 'run-controlled-pilot.mjs'),
        '--mode=operational',
        `--config=${testConfigPath}`,
        `--auth-doc=${authDocPath}`,
        `--tasks-file=${badTasksPath}`,
        '--phase=execute'
      ],
      { cwd: repoRoot, encoding: 'utf8' }
    );

    assert.notStrictEqual(result.status, 0, 'Script deve falhar com exit code != 0');
    const output = (result.stdout || '') + (result.stderr || '');
    assert.ok(output.includes('idempotency_key') || output.includes('schema'), 'Erro deve mencionar idempotency_key ou schema');
  });

  // -------------------------------------------------------------
  // Test 16: run-controlled-pilot.mjs rejeita tarefa sem received_at explícito
  // -------------------------------------------------------------
  await t.test('16. run-controlled-pilot.mjs rejeita tarefa operacional sem received_at explícito vindo da fonte (sem fallback para hora atual)', () => {
    const testConfigPath = path.join(tmpDir, 'op_config_runner.json');
    const badTasksPath = path.join(tmpDir, 'tasks_missing_received_at.json');
    const badTasksData = {
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      tasks: [
        {
          task_id: 'TASK_BAD_02',
          pilot_id: baseOperationalPilot.pilot_id,
          tenant_id: baseOperationalPilot.tenant_id,
          employee_id: 66,
          requested_by: 'solicitante_real_angola_01',
          idempotency_key: 'IDEMP_TASK_BAD_02',
          title: 'Tarefa Sem Received At',
          instruction: 'Classificar',
          input_data: { title: 'Doc' },
          format: 'PDF'
          // received_at propositadamente ausente
        }
      ]
    };
    fs.writeFileSync(badTasksPath, JSON.stringify(badTasksData, null, 2));

    const result = spawnSync(
      process.execPath,
      [
        path.join(repoRoot, 'scripts', 'run-controlled-pilot.mjs'),
        '--mode=operational',
        `--config=${testConfigPath}`,
        `--auth-doc=${authDocPath}`,
        `--tasks-file=${badTasksPath}`,
        '--phase=execute'
      ],
      { cwd: repoRoot, encoding: 'utf8' }
    );

    assert.notStrictEqual(result.status, 0, 'Script deve falhar com exit code != 0');
    const output = (result.stdout || '') + (result.stderr || '');
    assert.ok(output.includes('received_at') || output.includes('schema'), 'Erro deve mencionar received_at ou schema');
  });

  // -------------------------------------------------------------
  // Test 17: Divergência de tenant_id ou pilot_id entre tarefas e piloto configurado é abortada
  // -------------------------------------------------------------
  await t.test('17. Divergência de tenant_id ou pilot_id entre o ficheiro de tarefas e o piloto configurado é abortada sem execução', () => {
    const testConfigPath = path.join(tmpDir, 'op_config_runner.json');
    const badTasksPath = path.join(tmpDir, 'tasks_tenant_mismatch.json');
    const badTasksData = {
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: 'tenant_divergente_ops_99',
      tasks: [
        {
          task_id: 'TASK_BAD_03',
          pilot_id: baseOperationalPilot.pilot_id,
          tenant_id: 'tenant_divergente_ops_99',
          employee_id: 66,
          requested_by: 'solicitante_real_angola_01',
          received_at: '2026-09-15T09:10:00Z',
          idempotency_key: 'IDEMP_TASK_BAD_03',
          title: 'Tarefa Tenant Mismatch',
          instruction: 'Classificar',
          input_data: { title: 'Doc' },
          format: 'PDF'
        }
      ]
    };
    fs.writeFileSync(badTasksPath, JSON.stringify(badTasksData, null, 2));

    const result = spawnSync(
      process.execPath,
      [
        path.join(repoRoot, 'scripts', 'run-controlled-pilot.mjs'),
        '--mode=operational',
        `--config=${testConfigPath}`,
        `--auth-doc=${authDocPath}`,
        `--tasks-file=${badTasksPath}`,
        '--phase=execute'
      ],
      { cwd: repoRoot, encoding: 'utf8' }
    );

    assert.notStrictEqual(result.status, 0, 'Script deve abortar com mismatch de tenant');
  });

  // -------------------------------------------------------------
  // Test 18: Todos os 5 timestamps forenses presentes e cumprem monotonicidade cronológica
  // -------------------------------------------------------------
  await t.test('18. Todos os 5 timestamps forenses estão presentes no recibo de revisão humana e cumprem a monotonicidade cronológica challenge_issued_at <= event_signed_at <= review_received_at <= review_accepted_at <= challenge_consumed_at', async () => {
    const tokenSvc = new TokenService('secret-at-least-32-chars-long-test-2026', path.join(tmpDir, 'tok18.db'));
    const { eng, store } = createTestEngine(undefined, tokenSvc, 'OPERATIONAL_PILOT');

    const token = createReviewerToken(
      tokenSvc,
      'rev_maria_santos',
      baseOperationalPilot.tenant_id
    );
    const payload = tokenSvc.verifyToken(token).payload;

    store.createReviewerSession({
      session_id: 'SESS_18',
      token_jti: payload!.jti,
      reviewer_id: 'rev_maria_santos',
      tenant_id: baseOperationalPilot.tenant_id,
      pilot_id: baseOperationalPilot.pilot_id,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    });

    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_18',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 18',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 18' },
      idempotency_key: 'IDEMP_TASK_TEST_18_2026',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    };
    eng.executeTask(taskReq);

    const challenge = store.getPendingChallengeForTask('TASK_TEST_18');
    assert.ok(challenge, 'Desafio deve existir');

    await new Promise((resolve) => setTimeout(resolve, 30));
    const eventSignedAt = new Date().toISOString();
    await new Promise((resolve) => setTimeout(resolve, 30));

    const sig = PilotExternalValidator.generateCanonicalChallengeSignature(
      challenge,
      'rev_maria_santos',
      'APPROVED',
      mariaSecret,
      eventSignedAt
    );

    const reviewReceipt = eng.reviewTask({
      review_id: 'REV_TASK_TEST_18',
      task_id: 'TASK_TEST_18',
      challenge_id: challenge.challenge_id,
      reviewer: 'rev_maria_santos',
      decision: 'APPROVED',
      comments: 'Aprovado formalmente com todos os 5 timestamps',
      auth_token: token,
      signature: sig,
      event_signed_at: eventSignedAt
    });

    assert.ok(reviewReceipt.challenge_issued_at, 'challenge_issued_at ausente');
    assert.ok(reviewReceipt.event_signed_at, 'event_signed_at ausente');
    assert.ok(reviewReceipt.review_received_at, 'review_received_at ausente');
    assert.ok(reviewReceipt.review_accepted_at, 'review_accepted_at ausente');
    assert.ok(reviewReceipt.challenge_consumed_at, 'challenge_consumed_at ausente');

    const t1 = new Date(reviewReceipt.challenge_issued_at!).getTime();
    const t2 = new Date(reviewReceipt.event_signed_at!).getTime();
    const t3 = new Date(reviewReceipt.review_received_at!).getTime();
    const t4 = new Date(reviewReceipt.review_accepted_at!).getTime();
    const t5 = new Date(reviewReceipt.challenge_consumed_at!).getTime();

    assert.ok(t1 <= t2, `t1 (${reviewReceipt.challenge_issued_at}) deve ser <= t2 (${reviewReceipt.event_signed_at})`);
    assert.ok(t2 <= t3, `t2 (${reviewReceipt.event_signed_at}) deve ser <= t3 (${reviewReceipt.review_received_at})`);
    assert.ok(t3 <= t4, `t3 (${reviewReceipt.review_received_at}) deve ser <= t4 (${reviewReceipt.review_accepted_at})`);
    assert.ok(t4 <= t5, `t4 (${reviewReceipt.review_accepted_at}) deve ser <= t5 (${reviewReceipt.challenge_consumed_at})`);
  });

  // -------------------------------------------------------------
  // Test 19: Violação propositada da ordem temporal é bloqueada
  // -------------------------------------------------------------
  await t.test('19. Violação propositada da ordem temporal dos timestamps (ex: event_signed_at < challenge_issued_at) é bloqueada com erro forense estrito', () => {
    const tokenSvc = new TokenService('secret-at-least-32-chars-long-test-2026', path.join(tmpDir, 'tok19.db'));
    const { eng, store } = createTestEngine(undefined, tokenSvc, 'OPERATIONAL_PILOT');

    const token = createReviewerToken(
      tokenSvc,
      'rev_maria_santos',
      baseOperationalPilot.tenant_id
    );
    const payload = tokenSvc.verifyToken(token).payload;

    store.createReviewerSession({
      session_id: 'SESS_19',
      token_jti: payload!.jti,
      reviewer_id: 'rev_maria_santos',
      tenant_id: baseOperationalPilot.tenant_id,
      pilot_id: baseOperationalPilot.pilot_id,
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    });

    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_19',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 19',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 19' },
      idempotency_key: 'IDEMP_TASK_TEST_19_2026',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    };
    eng.executeTask(taskReq);

    const challenge = store.getPendingChallengeForTask('TASK_TEST_19');
    assert.ok(challenge, 'Desafio deve existir');

    // Data deliberadamente anterior à emissão do desafio
    const anachronisticSignedAt = new Date(Date.now() - 3600 * 1000).toISOString();
    const sig = PilotExternalValidator.generateCanonicalChallengeSignature(
      challenge,
      'rev_maria_santos',
      'APPROVED',
      mariaSecret,
      anachronisticSignedAt
    );

    assert.throws(
      () => {
        eng.reviewTask({
          review_id: 'REV_TASK_TEST_19',
          task_id: 'TASK_TEST_19',
          challenge_id: challenge.challenge_id,
          reviewer: 'rev_maria_santos',
          decision: 'APPROVED',
          comments: 'Tentativa com timestamp anacrónico',
          auth_token: token,
          signature: sig,
          event_signed_at: anachronisticSignedAt
        });
      },
      (err: any) => {
        assert.ok(err.message.includes('monotonicidade') || err.message.includes('cronológica'), err.message);
        return true;
      }
    );
  });

  // -------------------------------------------------------------
  // Test 20: pilot-evidence-manifest.json lista propriedades rastreáveis sem usar regex
  // -------------------------------------------------------------
  await t.test('20. pilot-evidence-manifest.json lista relative_path, sha256, byte_size, mime_type, origin, commit_sha, tenant_id, pilot_id, receipt_type, generated_at e propriedades rastreáveis sem usar regex de nomes de ficheiro', () => {
    const { eng, store } = createTestEngine(undefined, undefined, 'SIMULATION');

    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_20',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 20',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 20' },
      idempotency_key: 'IDEMP_TASK_TEST_20_2026',
      format: 'PDF',
      execution_mode: 'SIMULATION'
    };
    eng.executeTask(taskReq);

    eng.reviewTask({
      review_id: 'REV_TASK_TEST_20',
      task_id: 'TASK_TEST_20',
      reviewer: 'rev_maria_santos',
      decision: 'APPROVED',
      comments: 'Aprovado em simulacao'
    });

    eng.deliverTask('TASK_TEST_20', 'arquivo@saso.ao', 'EMAIL');

    const exportDir = path.join(tmpDir, 'evidence_test_20');
    eng.exportPilotEvidence(baseOperationalPilot.pilot_id, exportDir);

    const manifestPath = path.join(exportDir, 'pilot-evidence-manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'Manifesto deve existir');

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    assert.strictEqual(manifest.manifest_version, '2.0');
    assert.ok(manifest.files.length > 0);

    for (const f of manifest.files) {
      assert.ok(f.relative_path, 'relative_path obrigatório');
      assert.ok(f.sha256 && f.sha256.length === 64, 'sha256 deve ter 64 hex');
      assert.ok(typeof f.byte_size === 'number' && f.byte_size > 0, 'byte_size deve ser > 0');
      assert.ok(f.mime_type, 'mime_type obrigatório');
      assert.ok(f.origin, 'origin obrigatório');
      assert.ok(f.commit_sha && f.commit_sha.length === 40, 'commit_sha deve ter 40 caracteres');
      assert.ok(f.tenant_id, 'tenant_id obrigatório');
      assert.ok(f.pilot_id, 'pilot_id obrigatório');
      assert.ok(f.receipt_type, 'receipt_type obrigatório');
      assert.ok(f.generated_at, 'generated_at obrigatório');
    }

    const schemaPath = path.join(repoRoot, 'schemas', 'pilot', 'pilotEvidenceManifest.schema.json');
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const validate = ajv.compile(schema);
    const isValid = validate(manifest);
    assert.ok(isValid, `Manifesto deve cumprir o schema: ${JSON.stringify(validate.errors)}`);
  });

  // -------------------------------------------------------------
  // Test 21: pilot-evidence-files.sha256 cobre 100% dos ficheiros
  // -------------------------------------------------------------
  await t.test('21. O arquivo pilot-evidence-files.sha256 cobre 100% dos ficheiros do directório de evidências, incluindo o manifesto, com correspondência de hash em 100% das entradas', () => {
    const { eng } = createTestEngine(undefined, undefined, 'SIMULATION');

    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_TEST_21',
      pilot_id: baseOperationalPilot.pilot_id,
      tenant_id: baseOperationalPilot.tenant_id,
      employee_id: 66,
      requested_by: 'solicitante_real_angola_01',
      received_at: '2026-09-15T09:10:00Z',
      title: 'Classificacao Factura Test 21',
      instruction: 'Classificar factura',
      input_data: { document_title: 'Factura 21' },
      idempotency_key: 'IDEMP_TASK_TEST_21_2026',
      format: 'PDF',
      execution_mode: 'SIMULATION'
    };
    eng.executeTask(taskReq);

    const exportDir = path.join(tmpDir, 'evidence_test_21');
    eng.exportPilotEvidence(baseOperationalPilot.pilot_id, exportDir);

    const shaFilePath = path.join(exportDir, 'pilot-evidence-files.sha256');
    assert.ok(fs.existsSync(shaFilePath), 'Arquivo de checksums sha256 deve existir');

    const content = fs.readFileSync(shaFilePath, 'utf8');
    const lines = content.trim().split('\n');
    assert.ok(lines.length >= 5, 'Devem existir múltiplos ficheiros cobertos pelo checksum');

    let manifestCovered = false;
    for (const line of lines) {
      const [expectedSha, relPath] = line.trim().split(/\s+/);
      const fullPath = path.join(exportDir, relPath);
      assert.ok(fs.existsSync(fullPath), `Ficheiro indexado deve existir no disco: ${relPath}`);
      const actualSha = sha256(fs.readFileSync(fullPath));
      assert.strictEqual(actualSha, expectedSha, `Hash divergente para ${relPath}`);
      if (relPath === 'pilot-evidence-manifest.json') {
        manifestCovered = true;
      }
    }
    assert.ok(manifestCovered, 'O próprio manifesto pilot-evidence-manifest.json deve estar coberto pelo checksum');
  });

  // -------------------------------------------------------------
  // Test 22: Todos os outputs físicos exportados em task-outputs/ são lidos pelas bibliotecas independentes
  // -------------------------------------------------------------
  await t.test('22. Todos os outputs físicos exportados em task-outputs/ são lidos com sucesso pelas bibliotecas independentes (mammoth, exceljs, pdf-lib) durante a geração de evidência', () => {
    const { eng } = createTestEngine(undefined, undefined, 'SIMULATION');

    const formats: ('PDF' | 'DOCX' | 'XLSX')[] = ['PDF', 'DOCX', 'XLSX'];
    for (let i = 0; i < formats.length; i++) {
      const fmt = formats[i];
      eng.executeTask({
        task_id: `TASK_TEST_22_${fmt}`,
        pilot_id: baseOperationalPilot.pilot_id,
        tenant_id: baseOperationalPilot.tenant_id,
        employee_id: fmt === 'DOCX' ? 263 : fmt === 'XLSX' ? 58 : 66,
        requested_by: 'solicitante_real_angola_01',
        received_at: '2026-09-15T09:10:00Z',
        title: `Documento Multiformato ${fmt}`,
        instruction: 'Gerar documento real',
        input_data: { document_title: `Titulo ${fmt}` },
        idempotency_key: `IDEMP_TASK_TEST_22_${fmt}`,
        format: fmt,
        execution_mode: 'SIMULATION'
      });
    }

    const exportDir = path.join(tmpDir, 'evidence_test_22');
    eng.exportPilotEvidence(baseOperationalPilot.pilot_id, exportDir);

    const taskOutputsDir = path.join(exportDir, 'task-outputs');
    assert.ok(fs.existsSync(taskOutputsDir), 'Directório task-outputs deve existir');

    const files = fs.readdirSync(taskOutputsDir);
    assert.ok(files.length >= 3, 'Devem existir pelo menos 3 ficheiros físicos exportados');

    for (const f of files) {
      const filePath = path.join(taskOutputsDir, f);
      const bytes = fs.readFileSync(filePath);
      const ext = path.extname(f).toLowerCase();
      const fmt = ext === '.docx' ? 'DOCX' : ext === '.xlsx' ? 'XLSX' : 'PDF';
      const readRes = PhysicalDocumentValidator.readWithIndependentLibrary(bytes, fmt);
      assert.strictEqual(readRes.success, true, `Leitura independente deve passar para ${f}: ${readRes.error}`);
    }
  });
});

import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash } from 'node:crypto';
import {
  OperationalPilotRunner,
  OperationalPilotInput,
  TransactionalPilotStore,
  PhysicalDocumentValidator,
  StaticSecretProvider,
  resolveStrictCommitSha
} from '../index.js';
import { TokenService } from '@ai-employee/shared/server';

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

describe('AETF-500: Piloto Operacional Real, Protegido e Auditável (14 Testes Obrigatórios)', () => {
  const commitSha = resolveStrictCommitSha();
  process.env.GIT_COMMIT_SHA = commitSha;

  let tmpDir: string;
  let authDocPath: string;
  let authDocSha: string;
  let dbPath: string;
  let secretProvider: StaticSecretProvider;
  let tokenService: TokenService;
  let validReviewerToken: string;

  const tenantId = 'tenant_saso_angola_ops_01';
  const orgId = 'ORG_SASO_AO';
  const pilotId = 'PILOT_SASO_REAL_001';
  const taskId = 'TASK_SASO_NOTICE_2026_09_001';
  const reviewerId = 'rev_dra_maria_santos';
  const reviewerSecret = 'SASO_OPERATIONAL_PILOT_SECRET_2026_KEY_MIN32_MARIA';

  before(() => {
    tmpDir = path.join(os.tmpdir(), `aetf_operational_pilot_test_${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    // 1. Create real physical authorization PDF
    authDocPath = path.join(tmpDir, 'despacho_autorizacao_saso_2026.pdf');
    const authPdfBytes = PhysicalDocumentValidator.buildRealBinaryPdf(
      'DESPACHO DE AUTORIZACAO DO PILOTO OPERACIONAL SASO 2026',
      [
        'ORGANIZACAO: Sociedade Angolana de Servicos & Operacoes Lda (SASO)',
        'REFERENCIA: AUTH-SASO-PILOT-2026-09-REAL',
        'AUTORIZADO POR: Dr. Antonio Silva (Director Executivo)',
        'AMBITO: Emissao de Avisos Administrativos de Regularizacao de Conta',
        'MODO: OPERATIONAL_PILOT'
      ]
    );
    fs.writeFileSync(authDocPath, authPdfBytes);
    authDocSha = sha256(authPdfBytes);

    dbPath = path.join(tmpDir, 'operational_pilot.db');

    // 2. Secret Provider
    secretProvider = new StaticSecretProvider({
      PILOT_SECRET_REV_MARIA: reviewerSecret
    });

    // 3. Token Service pointing to the test DB
    tokenService = new TokenService(undefined, dbPath);
    tokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });

    validReviewerToken = tokenService.signToken({
      tenant_id: tenantId,
      user_id: reviewerId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ']
    });
  });

  after(() => {
    try {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    } catch {}
  });

  function createValidInput(overrides: Partial<OperationalPilotInput> = {}): OperationalPilotInput {
    return {
      pilot_id: pilotId,
      tenant_id: tenantId,
      organization_id: orgId,
      organization_name: 'Sociedade Angolana de Serviços & Operações Lda (SASO)',
      authorization_reference: 'AUTH-SASO-PILOT-2026-09-REAL',
      authorization_document_path: authDocPath,
      authorization_document_sha256: authDocSha,
      authorized_by: 'dr_antonio_silva_dir_executivo',
      authorized_at: '2026-09-18T09:00:00Z',
      start_at: '2026-09-18T00:00:00Z',
      end_at: '2026-10-18T23:59:59Z',
      employee_id: 66,
      task_id: taskId,
      task_title: 'Emissão de Aviso Administrativo de Regularização de Conta',
      task_description: 'Emissão de carta administrativa referente à fatura pendente FT 2026/0892',
      input_data: {
        customer_name: 'Sociedade Mineira do Cuango SARL',
        customer_tax_id: '5417082910',
        invoice_reference: 'FT 2026/0892',
        invoice_date: '2026-08-15',
        due_date: '2026-09-30',
        amount: 4850000,
        currency: 'AOA',
        bank_iban: 'AO06.0040.0000.1234.5678.9012.3',
        contact_email: 'cobrancas@saso.co.ao'
      },
      idempotency_key: `IDEMP_${taskId}`,
      received_at: '2026-09-18T09:15:00Z',
      sensitivity_level: 'CONFIDENTIAL',
      authorized_reviewers: [
        {
          reviewer_id: reviewerId,
          display_name: 'Dra. Maria Santos',
          role: 'SUPERVISOR_OPERACIONAL',
          secret_ref: 'PILOT_SECRET_REV_MARIA',
          email: 'maria.santos@saso.co.ao'
        }
      ],
      delivery_channel: 'INTERNAL_ARCHIVE',
      destination: 'arquivo.geral@saso.co.ao',
      formats: ['PDF', 'DOCX'],
      ...overrides
    };
  }

  // -------------------------------------------------------------
  // Test 1: Ausência de fonte operacional bloqueia a execução
  // -------------------------------------------------------------
  it('1. ausência de fonte operacional bloqueia a execução', async () => {
    const localDb = path.join(tmpDir, 'test1.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });

    assert.strictEqual(runner.getState(), 'PILOT_NOT_STARTED');

    // Executar tarefa sem carregar input bloqueia a execução
    await assert.rejects(async () => {
      await runner.executeOperationalTask();
    }, /entrada operacional não carregada ou não autorizada/);

    // Carregar ficheiro inexistente falha e actualiza estado para PILOT_BLOCKED_MISSING_INPUT
    const nonExistentPath = path.join(tmpDir, 'non_existent_input.json');
    assert.throws(() => {
      runner.loadAndValidateInput(nonExistentPath);
    }, /Fonte operacional externa não encontrada no disco/);

    assert.strictEqual(runner.getState(), 'PILOT_BLOCKED_MISSING_INPUT');
    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 2: Fixture no modo operacional é rejeitada
  // -------------------------------------------------------------
  it('2. fixture no modo operacional é rejeitada', () => {
    const localDb = path.join(tmpDir, 'test2.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });

    // a) Flag explícita is_mock / is_fixture
    const fixtureInput = createValidInput({
      input_data: {
        ...createValidInput().input_data,
        is_mock: true
      }
    });

    assert.throws(() => {
      runner.loadAndValidateInput(fixtureInput);
    }, /Modo OPERATIONAL_PILOT rejeita expressamente dados marcados como fixture ou mock/);

    // b) Marcadores textuais de placeholder
    const placeholderInput = createValidInput({
      input_data: {
        ...createValidInput().input_data,
        customer_name: '[PLACEHOLDER] Nome da Empresa'
      }
    });

    assert.throws(() => {
      runner.loadAndValidateInput(placeholderInput);
    }, /Entrada operacional contém valor placeholder proibido/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 3: Tenant divergente é rejeitado
  // -------------------------------------------------------------
  it('3. tenant divergente é rejeitado', async () => {
    const localDb = path.join(tmpDir, 'test3.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });

    const input = createValidInput();
    runner.loadAndValidateInput(input);

    // Modificar o input carregado para simular tentativa de execução de outro tenant
    (runner.getLoadedInput() as any).tenant_id = 'tenant_intruso_999';

    await assert.rejects(async () => {
      await runner.executeOperationalTask();
    }, /Isolamento multi-tenant violado/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 4: Autorização ausente ou inválida é rejeitada
  // -------------------------------------------------------------
  it('4. autorização ausente ou inválida é rejeitada', () => {
    const localDb = path.join(tmpDir, 'test4.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });

    // a) Ficheiro físico ausente
    const missingAuthDocInput = createValidInput({
      authorization_document_path: path.join(tmpDir, 'arquivo_inexistente.pdf')
    });
    assert.throws(() => {
      runner.loadAndValidateInput(missingAuthDocInput);
    }, /Ficheiro físico de autorização não encontrado/);

    // b) Hash adulterado
    const tamperedHashInput = createValidInput({
      authorization_document_sha256: '0000000000000000000000000000000000000000000000000000000000000000'
    });
    assert.throws(() => {
      runner.loadAndValidateInput(tamperedHashInput);
    }, /Hash SHA-256 do documento físico de autorização divergente/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 5: Revisor inactivo, inexistente ou de outro tenant é rejeitado
  // -------------------------------------------------------------
  it('5. revisor inactivo, inexistente ou de outro tenant é rejeitado', async () => {
    const localDb = path.join(tmpDir, 'test5.db');
    const localTokenService = new TokenService(undefined, localDb);
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService: localTokenService });

    const input = createValidInput({ task_id: 'TASK_TEST_REV_01', idempotency_key: 'IDEMP_TEST_REV_01' });
    runner.loadAndValidateInput(input);
    await runner.executeOperationalTask();

    // a) Revisor inexistente na persistência
    const nonExistentToken = localTokenService.signToken({
      tenant_id: tenantId,
      user_id: 'rev_fantasma_inexistente',
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW']
    });

    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId: 'rev_fantasma_inexistente',
        reviewerToken: nonExistentToken,
        decision: 'APPROVED',
        comments: 'Aprovado'
      });
    }, /não autorizado no piloto/);

    // b) Revisor inactivo no banco de identidades
    localTokenService.upsertAccount({
      user_id: 'rev_inativo_01',
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW'],
      status: 'SUSPENDED'
    });
    const inactiveToken = localTokenService.signToken({
      tenant_id: tenantId,
      user_id: 'rev_inativo_01',
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW']
    });

    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId: 'rev_inativo_01',
        reviewerToken: inactiveToken,
        decision: 'APPROVED',
        comments: 'Aprovado'
      });
    }, /não autorizado no piloto/);

    // c) Revisor de outro tenant
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: 'tenant_outro_diferente',
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW'],
      status: 'ACTIVE'
    });
    const foreignTenantToken = localTokenService.signToken({
      tenant_id: 'tenant_outro_diferente',
      user_id: reviewerId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW']
    });

    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: foreignTenantToken,
        decision: 'APPROVED',
        comments: 'Aprovado'
      });
    }, /Isolamento multi-tenant violado/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 6: Alteração dos bytes após o desafio invalida a revisão
  // -------------------------------------------------------------
  it('6. alteração dos bytes após o desafio invalida a revisão', async () => {
    const localDb = path.join(tmpDir, 'test6.db');
    const localTokenService = new TokenService(undefined, localDb);
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService: localTokenService });

    const input = createValidInput({ task_id: 'TASK_TEST_TAMPER_01', idempotency_key: 'IDEMP_TEST_TAMPER_01' });
    runner.loadAndValidateInput(input);
    await runner.executeOperationalTask();

    // Adulterar directamente os bytes na persistência SQLite antes da submissão da revisão
    const rawDb = runner.getStore().getRawDb();
    const tamperedBytes = Buffer.from('%PDF-1.7 ADULTERADO FRAUDULENTAMENTE %%EOF');
    const tamperedHash = sha256(tamperedBytes);
    rawDb.prepare(`UPDATE task_outputs SET file_bytes = ?, file_bytes_sha256 = ? WHERE task_id = ?`).run(
      tamperedBytes,
      tamperedHash,
      input.task_id
    );

    // Submeter revisão com o desafio emitido anteriormente
    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: validReviewerToken,
        decision: 'APPROVED',
        comments: 'Tentativa de aprovação sobre bytes adulterados'
      });
    }, /Alteração de bytes detectada após o desafio/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 7: Duplicação da idempotency_key não produz segundo efeito
  // -------------------------------------------------------------
  it('7. duplicação da idempotency_key não produz segundo efeito', async () => {
    const localDb = path.join(tmpDir, 'test7.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });

    const input = createValidInput({ task_id: 'TASK_TEST_IDEMP_01', idempotency_key: 'IDEMP_EXACT_KEY_999' });
    runner.loadAndValidateInput(input);

    // Primeira execução
    const firstResult = await runner.executeOperationalTask();
    assert.strictEqual(firstResult.taskReceipt.task_id, input.task_id);

    // Segunda execução com a mesma idempotency_key
    const secondResult = await runner.executeOperationalTask();
    assert.strictEqual(secondResult.taskReceipt.task_id, firstResult.taskReceipt.task_id);
    assert.strictEqual(secondResult.taskReceipt.idempotency_key, firstResult.taskReceipt.idempotency_key);

    // Verificar no SQLite que apenas uma tarefa existe com esta idempotency_key
    const rawDb = runner.getStore().getRawDb();
    const countRow = rawDb.prepare(`SELECT count(*) as cnt FROM pilot_tasks WHERE idempotency_key = ?`).get('IDEMP_EXACT_KEY_999') as any;
    assert.strictEqual(Number(countRow.cnt), 1);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 8: Reinício do processo preserva tarefa, versão, revisão e entrega
  // -------------------------------------------------------------
  it('8. reinício do processo preserva tarefa, versão, revisão e entrega', async () => {
    const localDb = path.join(tmpDir, 'test8_restart.db');
    const localTokenService = new TokenService(undefined, localDb);
    const runner1 = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService: localTokenService });

    const input = createValidInput({ task_id: 'TASK_TEST_RESTART_01', idempotency_key: 'IDEMP_TEST_RESTART_01' });
    runner1.loadAndValidateInput(input);
    const execRes = await runner1.executeOperationalTask();
    runner1.submitHumanReview({
      reviewerId,
      reviewerToken: validReviewerToken,
      decision: 'APPROVED',
      comments: 'Aprovado antes do reinício'
    });
    runner1.archiveOrDeliver();

    const initialOutputs = runner1.getStore().getOutputsForTask(input.task_id);
    assert.ok(initialOutputs.length >= 2);

    // Fechar e simular encerramento do processo
    runner1.getStore().close();

    // Novo runner instanciado sobre o mesmo ficheiro SQLite
    const runner2 = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService: localTokenService });
    const restoredStore = runner2.getStore();

    const restoredTask = restoredStore.getTask(input.task_id);
    assert.ok(restoredTask);
    assert.strictEqual(restoredTask.task_id, input.task_id);
    assert.strictEqual(restoredTask.human_review_status, 'APPROVED');
    assert.strictEqual(restoredTask.delivery_status, 'ARCHIVED');

    const restoredOutputs = restoredStore.getOutputsForTask(input.task_id);
    assert.strictEqual(restoredOutputs.length, initialOutputs.length);

    const restoredReviews = restoredStore.listReviewsForTask(input.task_id);
    assert.strictEqual(restoredReviews.length, 1);
    assert.strictEqual(restoredReviews[0].decision, 'APPROVED');

    const restoredDeliveries = restoredStore.listDeliveries(input.pilot_id);
    assert.strictEqual(restoredDeliveries.length, 1);
    assert.strictEqual(restoredDeliveries[0].status, 'ARCHIVED');

    runner2.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 9: Leitor independente inválido bloqueia a revisão
  // -------------------------------------------------------------
  it('9. leitor independente inválido bloqueia a revisão', async () => {
    // 1. Validar rejeição directa pelo leitor independente PDF (pdf-lib)
    const corruptedPdf = Buffer.from('%PDF-1.4\nCorrompido sem catálogo nem xref %%EOF');
    const pdfRes = await PhysicalDocumentValidator.validateIndependentPdf(corruptedPdf);
    assert.strictEqual(pdfRes.isValid, false);

    // 2. Validar rejeição directa pelo leitor independente DOCX (mammoth/jszip)
    const corruptedDocx = Buffer.from('PK\x03\x04 corrupt docx');
    const docxRes = await PhysicalDocumentValidator.validateIndependentDocx(corruptedDocx);
    assert.strictEqual(docxRes.isValid, false);

    // 3. Comprovar que recibo de validação independente com FAIL bloqueia a revisão
    const localDb = path.join(tmpDir, 'test9.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });
    const input = createValidInput({ task_id: 'TASK_TEST_INDEP_FAIL', idempotency_key: 'IDEMP_TEST_INDEP_FAIL' });
    runner.loadAndValidateInput(input);
    await runner.executeOperationalTask();

    // Forçar recibo de validação independente para FAIL no SQLite
    const rawDb = runner.getStore().getRawDb();
    rawDb.prepare(`
      UPDATE task_document_validations 
      SET result = 'FAIL', is_valid = 0, error = 'Documento rejeitado pelo leitor independente'
      WHERE task_id = ? AND validation_type = 'INDEPENDENT_LIBRARY_VALIDATION'
    `).run(input.task_id);

    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: validReviewerToken,
        decision: 'APPROVED',
        comments: 'Aprovação deve falhar'
      });
    }, /validação independente de documento não aprovada/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 10: Falha transaccional não deixa estado parcial
  // -------------------------------------------------------------
  it('10. falha transaccional não deixa estado parcial', () => {
    const localDb = path.join(tmpDir, 'test10.db');
    const store = new TransactionalPilotStore(localDb, 'OPERATIONAL_PILOT');

    const pilot = createValidInput();
    store.savePilot({
      pilot_id: pilot.pilot_id,
      tenant_id: pilot.tenant_id,
      organization_name: pilot.organization_name,
      authorization_reference: pilot.authorization_reference,
      authorized_by: pilot.authorized_by,
      authorized_at: pilot.authorized_at,
      start_at: pilot.start_at,
      end_at: pilot.end_at,
      selected_employee_ids: [66],
      allowed_data_categories: ['ACCOUNTING'],
      prohibited_data_categories: [],
      allowed_connectors: [],
      prohibited_actions: [],
      human_reviewers: [reviewerId],
      task_limit: 10,
      execution_mode: 'OPERATIONAL_PILOT',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const metricsBefore = store.getDatabaseMetrics();

    // Executar transacção deliberadamente abortada por excepção interna
    assert.throws(() => {
      store.executeTransaction(() => {
        const rawDb = store.getRawDb();
        rawDb.prepare(`
          INSERT INTO pilot_tasks (
            task_id, pilot_id, tenant_id, employee_id, idempotency_key, requested_by,
            human_review_status, delivery_status, final_status, version, input_snapshot_sha256,
            receipt_json, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          'TASK_TX_FAIL', pilot.pilot_id, pilot.tenant_id, 66, 'IDEMP_TX_FAIL', 'user',
          'PENDING_REVIEW', 'PENDING', 'SUCCESS', 1, 'sha', '{}', new Date().toISOString(), new Date().toISOString()
        );

        // Lançar erro que força ROLLBACK imediato da transacção
        throw new Error('SIMULATED_TRANSACTIONAL_FAILURE_ROLLBACK');
      });
    }, /SIMULATED_TRANSACTIONAL_FAILURE_ROLLBACK/);

    const metricsAfter = store.getDatabaseMetrics();
    assert.strictEqual(metricsAfter.taskCount, metricsBefore.taskCount);
    assert.strictEqual(store.getTask('TASK_TX_FAIL'), null);

    store.close();
  });

  // -------------------------------------------------------------
  // Test 11: Divergência entre fonte, SQLite, recibo ou manifesto bloqueia o fecho
  // -------------------------------------------------------------
  it('11. divergência entre fonte, SQLite, recibo ou manifesto bloqueia o fecho', async () => {
    const localDb = path.join(tmpDir, 'test11.db');
    const localTokenService = new TokenService(undefined, localDb);
    const localReviewerToken = localTokenService.signToken({
      tenant_id: tenantId,
      user_id: reviewerId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ']
    });
    const exportDir = path.join(tmpDir, 'test11_manifest_export');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService: localTokenService });

    const input = createValidInput({ task_id: 'TASK_TEST_DIVERGENCE', idempotency_key: 'IDEMP_TEST_DIV_01' });
    const inputPath = path.join(tmpDir, 'test11_input.json');
    fs.writeFileSync(inputPath, JSON.stringify(input, null, 2), 'utf8');

    runner.loadAndValidateInput(input);
    await runner.executeOperationalTask();
    runner.submitHumanReview({
      reviewerId,
      reviewerToken: localReviewerToken,
      decision: 'APPROVED',
      comments: 'Aprovado para teste de divergência'
    });
    runner.archiveOrDeliver();

    // Exportar manifesto íntegro
    runner.generateOperationalManifest(exportDir);

    // 1. Verificação preliminar: deve passar sem erros
    const checkBefore = OperationalPilotRunner.verifyReconciliation(inputPath, exportDir, localDb);
    assert.strictEqual(checkBefore.isValid, true);
    assert.strictEqual(checkBefore.errors.length, 0);

    // 2. Adulterar ficheiro JSON de recibo de tarefa
    const taskReceiptFile = path.join(exportDir, 'task-receipts', `${input.task_id}.json`);
    const receiptData = JSON.parse(fs.readFileSync(taskReceiptFile, 'utf8'));
    receiptData.tenant_id = 'tenant_divergente_adulterado';
    fs.writeFileSync(taskReceiptFile, JSON.stringify(receiptData, null, 2), 'utf8');

    // 3. Comprovar que a reconciliação detecta a adulteração e bloqueia o fecho
    const checkAfter = OperationalPilotRunner.verifyReconciliation(inputPath, exportDir, localDb);
    assert.strictEqual(checkAfter.isValid, false);
    assert.ok(checkAfter.errors.some(e => e.includes('Recibo JSON da tarefa diverge do registo SQLite') || e.includes('Hash do ficheiro indexado')));

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 12: Tentativa de entrega sem aprovação humana é bloqueada
  // -------------------------------------------------------------
  it('12. tentativa de entrega sem aprovação humana é bloqueada', async () => {
    const localDb = path.join(tmpDir, 'test12.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });

    const input = createValidInput({ task_id: 'TASK_TEST_UNAPPROVED', idempotency_key: 'IDEMP_TEST_UNAPP' });
    runner.loadAndValidateInput(input);
    await runner.executeOperationalTask();

    // Tarefa acabou de ser executada e está em PENDING_REVIEW
    assert.strictEqual(runner.getState(), 'PENDING_HUMAN_REVIEW');

    // Tentativa de arquivar/entregar deve falhar
    assert.throws(() => {
      runner.archiveOrDeliver();
    }, /a tarefa não possui aprovação humana/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 13: Ausência de canal real termina como APPROVED_AND_ARCHIVED, nunca DELIVERED
  // -------------------------------------------------------------
  it('13. ausência de canal real termina como APPROVED_AND_ARCHIVED, nunca DELIVERED', async () => {
    const localDb = path.join(tmpDir, 'test13.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });

    const input = createValidInput({ task_id: 'TASK_TEST_ARCHIVE_ONLY', idempotency_key: 'IDEMP_TEST_ARCH_01' });
    runner.loadAndValidateInput(input);
    await runner.executeOperationalTask();

    runner.submitHumanReview({
      reviewerId,
      reviewerToken: validReviewerToken,
      decision: 'APPROVED',
      comments: 'Aprovado para arquivamento controlado'
    });

    // Sem resposta externa de canal físico real
    const delivReceipt = runner.archiveOrDeliver();

    // Deve ser obrigatoriamente ARCHIVED e nunca DELIVERED
    assert.strictEqual(delivReceipt.status, 'ARCHIVED');
    assert.strictEqual(delivReceipt.is_external_confirmed, false);
    assert.strictEqual(runner.getState(), 'APPROVED_AND_ARCHIVED');

    const manifestDir = path.join(tmpDir, 'test13_manifest');
    const manifestRes = runner.generateOperationalManifest(manifestDir);

    assert.strictEqual(
      manifestRes.classification,
      'CONTROLLED_REAL_PILOT_EXECUTED — HUMAN_REVIEW_CONFIRMED — APPROVED_AND_ARCHIVED'
    );
    assert.ok(!manifestRes.classification.includes('DELIVERY_CONFIRMED'));

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 14: Execução positiva completa preserva e reconcilia todos os bytes e eventos
  // -------------------------------------------------------------
  it('14. uma execução positiva completa preserva e reconcilia todos os bytes e eventos', async () => {
    const localDb = path.join(tmpDir, 'test14_e2e.db');
    const localTokenService = new TokenService(undefined, localDb);
    const localReviewerToken = localTokenService.signToken({
      tenant_id: tenantId,
      user_id: reviewerId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ']
    });
    const manifestDir = path.join(tmpDir, 'test14_manifest_bundle');
    const inputPath = path.join(tmpDir, 'test14_operational_input.json');

    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService: localTokenService });
    const input = createValidInput({ task_id: 'TASK_SASO_REAL_E2E_001', idempotency_key: 'IDEMP_SASO_REAL_E2E_001' });
    fs.writeFileSync(inputPath, JSON.stringify(input, null, 2), 'utf8');

    // 1. Carregar e validar entrada externa real
    const loaded = runner.loadAndValidateInput(inputPath);
    assert.strictEqual(runner.getState(), 'PILOT_AUTHORIZED');
    assert.strictEqual(loaded.task_id, input.task_id);

    // 2. Executar tarefa e produzir documentos físicos binários (PDF e DOCX)
    const execRes = await runner.executeOperationalTask();
    assert.strictEqual(runner.getState(), 'PENDING_HUMAN_REVIEW');
    assert.ok(execRes.pdfBytes.length > 500, 'PDF físico deve ter bytes reais');
    assert.ok(execRes.docxBytes.length > 500, 'DOCX físico deve ter bytes reais');
    assert.strictEqual(execRes.outputHashes.length, 2);

    // 3. Revisão humana com identidade persistente e assinatura de evento
    const reviewRes = runner.submitHumanReview({
      reviewerId,
      reviewerToken: localReviewerToken,
      decision: 'APPROVED',
      comments: 'Documentos PDF e DOCX revistos e aprovados na íntegra de acordo com o regulamento SASO 2026.'
    });
    assert.strictEqual(runner.getState(), 'APPROVED_AND_ARCHIVED');
    assert.strictEqual(reviewRes.decision, 'APPROVED');
    assert.strictEqual(reviewRes.reviewer, reviewerId);

    // 4. Arquivamento explícito
    const delivRes = runner.archiveOrDeliver();
    assert.strictEqual(delivRes.status, 'ARCHIVED');
    assert.strictEqual(delivRes.is_external_confirmed, false);

    // 5. Geração de manifesto determinístico integral
    const manifestRes = runner.generateOperationalManifest(manifestDir);
    assert.strictEqual(runner.getState(), 'PILOT_COMPLETED');
    assert.strictEqual(
      manifestRes.classification,
      'CONTROLLED_REAL_PILOT_EXECUTED — HUMAN_REVIEW_CONFIRMED — APPROVED_AND_ARCHIVED'
    );
    assert.ok(manifestRes.files.length >= 8);
    assert.ok(manifestRes.indexHash && manifestRes.indexHash.length === 64);

    // 6. Reconciliação dos 7 planos de verdade
    const reconciliation = OperationalPilotRunner.verifyReconciliation(inputPath, manifestDir, localDb);
    assert.strictEqual(reconciliation.isValid, true, `Reconciliação falhou com erros: ${reconciliation.errors.join('; ')}`);
    assert.strictEqual(reconciliation.planes.sourceVsSqlite, true);
    assert.strictEqual(reconciliation.planes.sqliteVsReceipts, true);
    assert.strictEqual(reconciliation.planes.receiptsVsPhysicalFiles, true);
    assert.strictEqual(reconciliation.planes.filesVsManifest, true);
    assert.strictEqual(reconciliation.planes.manifestVsSha256Index, true);
    assert.strictEqual(reconciliation.planes.identityAndAuthSession, true);
    assert.strictEqual(reconciliation.planes.deliveryAndClassification, true);
    assert.strictEqual(
      reconciliation.classification,
      'CONTROLLED_REAL_PILOT_EXECUTED — HUMAN_REVIEW_CONFIRMED — APPROVED_AND_ARCHIVED'
    );

    runner.getStore().close();
  });
});

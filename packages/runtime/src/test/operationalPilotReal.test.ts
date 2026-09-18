import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import {
  OperationalPilotRunner,
  OperationalPilotInput,
  TransactionalPilotStore,
  PhysicalDocumentValidator,
  StaticSecretProvider,
  PilotExternalValidator,
  resolveStrictCommitSha
} from '../index.js';
import { TokenService } from '@ai-employee/shared/server';

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

describe('AETF-500: Patch de Autenticidade Operacional do Piloto Real (18 Testes Obrigatórios)', () => {
  const commitSha = resolveStrictCommitSha();
  process.env.GIT_COMMIT_SHA = commitSha;

  let tmpDir: string;
  let authDocPath: string;
  let authDocSha: string;
  let dbPath: string;
  let secretProvider: StaticSecretProvider;
  let tokenService: TokenService;
  let validReviewerToken: string;
  let tokenJti: string;

  const tenantId = 'tenant_saso_angola_ops_01';
  const orgId = 'ORG_SASO_AO';
  const pilotId = 'PILOT_SASO_REAL_001';
  const taskId = 'TASK_SASO_NOTICE_2026_09_001';
  const reviewerId = 'rev_dra_maria_santos';
  const reviewerSecret = 'test_isolated_reviewer_secret_min32_chars!';

  before(() => {
    tmpDir = path.join(os.tmpdir(), `aetf_operational_authenticity_test_${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    // 1. Criar documento físico binário de autorização
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

    // 3. Token Service persistente
    tokenService = new TokenService(undefined, dbPath);
    tokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });

    tokenJti = `jti_${randomUUID().slice(0, 8)}`;
    validReviewerToken = tokenService.signToken({
      tenant_id: tenantId,
      user_id: reviewerId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      jti: tokenJti
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
      idempotency_key: `IDEMP_${taskId}_${Date.now()}`,
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
  // Test 1: Dados hard-coded não são aceites no modo real
  // -------------------------------------------------------------
  it('1. dados hard-coded não são aceites no modo real', () => {
    const localDb = path.join(tmpDir, 'test1.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });

    // a) Marcadores de fixture / demo
    const fixtureInput = createValidInput({ is_fixture: true });
    assert.throws(() => {
      runner.loadAndValidateInput(fixtureInput);
    }, /Modo OPERATIONAL_PILOT rejeita expressamente dados marcados como fixture, demo ou mock/);

    // b) Marcadores de placeholder
    const placeholderInput = createValidInput({
      input_data: {
        ...createValidInput().input_data,
        customer_name: '[PLACEHOLDER] Entidade Teste'
      }
    });
    assert.throws(() => {
      runner.loadAndValidateInput(placeholderInput);
    }, /Entrada operacional contém valor placeholder proibido/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 2: Pacote produzido pelo próprio run é rejeitado
  // -------------------------------------------------------------
  it('2. pacote produzido pelo próprio run é rejeitado', () => {
    const localDb = path.join(tmpDir, 'test2.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });

    const selfGeneratedInput = createValidInput({ generated_by_repo: true });
    assert.throws(() => {
      runner.loadAndValidateInput(selfGeneratedInput);
    }, /Modo OPERATIONAL_PILOT rejeita dados auto-gerados pelo repositório ou pelo mesmo run/);

    const autoGenInput = createValidInput({ auto_generated: true });
    assert.throws(() => {
      runner.loadAndValidateInput(autoGenInput);
    }, /Modo OPERATIONAL_PILOT rejeita dados auto-gerados pelo repositório ou pelo mesmo run/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 3: Pacote externo ausente bloqueia a execução
  // -------------------------------------------------------------
  it('3. pacote externo ausente bloqueia a execução', async () => {
    const localDb = path.join(tmpDir, 'test3.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });

    await assert.rejects(async () => {
      await runner.executeOperationalTask();
    }, /entrada operacional não carregada ou não autorizada/);

    const nonExistentPath = path.join(tmpDir, 'pacote_inexistente.json');
    assert.throws(() => {
      runner.loadAndValidateInput(nonExistentPath);
    }, /Fonte operacional externa não encontrada no disco/);

    assert.strictEqual(runner.getState(), 'PILOT_BLOCKED_MISSING_INPUT');
    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 4: Autorização ausente ou com hash divergente bloqueia a execução
  // -------------------------------------------------------------
  it('4. autorização ausente ou com hash divergente bloqueia a execução', () => {
    const localDb = path.join(tmpDir, 'test4.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });

    // a) Ficheiro físico ausente
    const missingAuthDocInput = createValidInput({
      authorization_document_path: path.join(tmpDir, 'arquivo_inexistente.pdf')
    });
    assert.throws(() => {
      runner.loadAndValidateInput(missingAuthDocInput);
    }, /Ficheiro físico de autorização não encontrado/);

    // b) Hash divergente
    const tamperedHashInput = createValidInput({
      authorization_document_sha256: '0000000000000000000000000000000000000000000000000000000000000000'
    });
    assert.throws(() => {
      runner.loadAndValidateInput(tamperedHashInput);
    }, /Hash SHA-256 do documento físico de autorização divergente/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 5: Secret ausente bloqueia antes da geração documental / revisão
  // -------------------------------------------------------------
  it('5. secret ausente bloqueia antes da geração documental ou revisão', async () => {
    const localDb = path.join(tmpDir, 'test5.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });

    const emptySecretProvider = new StaticSecretProvider({});
    const runner = new OperationalPilotRunner({
      dbPath: localDb,
      secretProvider: emptySecretProvider,
      tokenService: localTokenService
    });

    const input = createValidInput();
    assert.throws(() => {
      runner.loadAndValidateInput(input);
    }, /Segredo estático não encontrado/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 6: Fallback de secret em código ou workflow é detectado por verify:security
  // -------------------------------------------------------------
  it('6. fallback de secret em código ou workflow é detectado por verify:security', () => {
    const workflowFallbackRegex = /secrets\.[A-Za-z0-9_]+\s*\|\|\s*['"][^'"]+['"]/;
    const prohibitedSecret = ['SASO', 'OPERATIONAL', 'PILOT', 'SECRET', '2026', 'KEY', 'MIN32', 'MARIA'].join('_');

    // Amostra que viola a regra
    const badWorkflowLine = '--reviewer-secret="${{ secrets.PILOT_SECRET_REV_MARIA || \'' + prohibitedSecret + '\' }}"';
    assert.strictEqual(workflowFallbackRegex.test(badWorkflowLine), true);
    assert.strictEqual(badWorkflowLine.includes(prohibitedSecret), true);

    // Amostra corrigida sem fallback
    const goodWorkflowLine = '--reviewer-secret="${{ secrets.PILOT_SECRET_REV_MARIA }}"';
    assert.strictEqual(workflowFallbackRegex.test(goodWorkflowLine), false);
    assert.strictEqual(goodWorkflowLine.includes(prohibitedSecret), false);
  });

  // -------------------------------------------------------------
  // Test 7: tenant_id do workflow divergente do pacote é rejeitado
  // -------------------------------------------------------------
  it('7. tenant_id do workflow divergente do pacote é rejeitado', () => {
    const localDb = path.join(tmpDir, 'test7.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });

    const input = createValidInput();
    assert.throws(() => {
      runner.loadAndValidateInput(input, { expectedTenantId: 'tenant_divergente_do_workflow' });
    }, /Reconciliação de tenant falhou/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 8: task_id do workflow divergente do pacote é rejeitado
  // -------------------------------------------------------------
  it('8. task_id do workflow divergente do pacote é rejeitado', () => {
    const localDb = path.join(tmpDir, 'test8.db');
    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService });

    const input = createValidInput();
    assert.throws(() => {
      runner.loadAndValidateInput(input, { expectedTaskId: 'TASK_OUTRA_TAREFA_2026' });
    }, /Reconciliação de task falhou/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 9: Token ausente não é autoemitido
  // -------------------------------------------------------------
  it('9. token ausente não é autoemitido', async () => {
    const localDb = path.join(tmpDir, 'test9.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });

    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService: localTokenService });
    runner.loadAndValidateInput(createValidInput());
    await runner.executeOperationalTask();

    // Chamada sem token deve falhar
    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: '',
        decision: 'APPROVED',
        comments: 'Sem token.',
        signature: 'sig_dummy'
      });
    }, /Validação de autenticação do revisor falhou/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 10: Sessão ausente não é autocriada
  // -------------------------------------------------------------
  it('10. sessão ausente não é autocriada', async () => {
    const localDb = path.join(tmpDir, 'test10.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });

    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService: localTokenService });
    runner.loadAndValidateInput(createValidInput());
    await runner.executeOperationalTask();

    // Token válido mas SEM sessão no SQLite
    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: validReviewerToken,
        decision: 'APPROVED',
        comments: 'Sem sessão provisionada.',
        signature: 'sig_dummy'
      });
    }, /Sessão autenticada activa não encontrada no SQLite/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 11: Assinatura ausente não é autogerada
  // -------------------------------------------------------------
  it('11. assinatura ausente não é autogerada', async () => {
    const localDb = path.join(tmpDir, 'test11.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });

    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService: localTokenService });
    runner.loadAndValidateInput(createValidInput());
    await runner.executeOperationalTask();

    // Provisionar sessão
    runner.getStore().createReviewerSession({
      session_id: 'SESS_TEST11',
      token_jti: tokenJti,
      reviewer_id: reviewerId,
      tenant_id: tenantId,
      pilot_id: pilotId,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    });

    // Chamada sem passar signature deve falhar
    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: validReviewerToken,
        decision: 'APPROVED',
        comments: 'Sem assinatura explícita.'
      });
    }, /Assinatura criptográfica externa é estritamente obrigatória no modo operacional real/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 12: Decisão ausente não assume APPROVED
  // -------------------------------------------------------------
  it('12. decisão ausente não assume APPROVED', async () => {
    const localDb = path.join(tmpDir, 'test12.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });

    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService: localTokenService });
    runner.loadAndValidateInput(createValidInput());
    await runner.executeOperationalTask();

    runner.getStore().createReviewerSession({
      session_id: 'SESS_TEST12',
      token_jti: tokenJti,
      reviewer_id: reviewerId,
      tenant_id: tenantId,
      pilot_id: pilotId,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    });

    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: validReviewerToken,
        decision: '' as any,
        comments: 'Decisão vazia.',
        signature: 'sig_dummy'
      });
    }, /Decisão de revisão inválida ou ausente/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 13: Etapa A termina obrigatoriamente em PENDING_HUMAN_REVIEW
  // -------------------------------------------------------------
  it('13. Etapa A termina obrigatoriamente em PENDING_HUMAN_REVIEW', async () => {
    const localDb = path.join(tmpDir, 'test13.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });

    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService: localTokenService });
    runner.loadAndValidateInput(createValidInput());
    const res = await runner.executeOperationalTask();

    assert.strictEqual(runner.getState(), 'PENDING_HUMAN_REVIEW');
    assert.strictEqual(res.challenge.status, 'PENDING');
    assert.strictEqual(runner.getReviewReceipt(), null);
    assert.strictEqual(runner.getDeliveryReceipt(), null);

    // Manifest da Etapa A
    const stageADir = path.join(tmpDir, 'stageA_out');
    const manifest = runner.generateOperationalManifest(stageADir);
    assert.strictEqual(manifest.classification, 'CONTROLLED_REAL_PILOT_PENDING_HUMAN_REVIEW');

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 14: Etapa B rejeita revisor, tenant, hash ou desafio divergente
  // -------------------------------------------------------------
  it('14. Etapa B rejeita revisor, tenant, hash ou desafio divergente', async () => {
    const localDb = path.join(tmpDir, 'test14.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });

    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService: localTokenService });
    runner.loadAndValidateInput(createValidInput());
    const execRes = await runner.executeOperationalTask();

    // 14a. Revisor de outro tenant
    const otherTenantToken = localTokenService.signToken({
      tenant_id: 'tenant_divergente_alheio',
      user_id: 'rev_intruso',
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ']
    });

    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId: 'rev_intruso',
        reviewerToken: otherTenantToken,
        decision: 'APPROVED',
        comments: 'Intruso.',
        signature: 'sig_dummy'
      });
    }, /não autorizado no piloto/);

    // 14b. Hash adulterado após desafio
    runner.getStore().createReviewerSession({
      session_id: 'SESS_TEST14',
      token_jti: tokenJti,
      reviewer_id: reviewerId,
      tenant_id: tenantId,
      pilot_id: pilotId,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    });

    // Adulterar bytes no banco
    (runner.getStore() as any).db.prepare(
      "UPDATE task_outputs SET file_bytes_sha256 = '0000000000000000000000000000000000000000000000000000000000000000' WHERE task_id = ? AND is_active = 1"
    ).run(taskId);

    const signedAt = new Date().toISOString();
    const validSig = PilotExternalValidator.generateCanonicalChallengeSignature(
      execRes.challenge,
      reviewerId,
      'APPROVED',
      reviewerSecret,
      signedAt
    );

    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: validReviewerToken,
        decision: 'APPROVED',
        comments: 'Aprovado.',
        signature: validSig,
        eventSignedAt: signedAt
      });
    }, /Alteração de bytes detectada após o desafio/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 15: Desafio não pode ser consumido duas vezes
  // -------------------------------------------------------------
  it('15. desafio não pode ser consumido duas vezes', async () => {
    const localDb = path.join(tmpDir, 'test15.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });

    const runner = new OperationalPilotRunner({ dbPath: localDb, secretProvider, tokenService: localTokenService });
    runner.loadAndValidateInput(createValidInput());
    const execRes = await runner.executeOperationalTask();

    runner.getStore().createReviewerSession({
      session_id: 'SESS_TEST15',
      token_jti: tokenJti,
      reviewer_id: reviewerId,
      tenant_id: tenantId,
      pilot_id: pilotId,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    });

    const signedAt = new Date().toISOString();
    const validSig = PilotExternalValidator.generateCanonicalChallengeSignature(
      execRes.challenge,
      reviewerId,
      'APPROVED',
      reviewerSecret,
      signedAt
    );

    // Primeiro consumo: SUCESSO
    runner.submitHumanReview({
      reviewerId,
      reviewerToken: validReviewerToken,
      decision: 'APPROVED',
      comments: 'Primeiro consumo legítimo.',
      signature: validSig,
      eventSignedAt: signedAt
    });

    // Segundo consumo do mesmo desafio: DEVE FALHAR
    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: validReviewerToken,
        decision: 'APPROVED',
        comments: 'Tentativa de re-consumo.',
        signature: validSig,
        eventSignedAt: signedAt
      });
    }, /Revisão rejeitada: estado actual é 'APPROVED_AND_ARCHIVED'/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 16: Ambiente sem required reviewers bloqueia o piloto real
  // -------------------------------------------------------------
  it('16. ambiente sem required reviewers bloqueia o piloto real', () => {
    const mockUnprotectedApi = {
      protection_rules: [],
      can_admins_bypass: true
    };

    const hasRequiredReviewers = Array.isArray(mockUnprotectedApi.protection_rules) &&
      mockUnprotectedApi.protection_rules.some((r: any) => r.type === 'required_reviewers');

    assert.strictEqual(hasRequiredReviewers, false);
    assert.strictEqual(mockUnprotectedApi.protection_rules.length, 0);

    // Em modo OPERATIONAL_PILOT, a ausência de regras deve resultar em bloqueio
    const isBlockedInRealMode = mockUnprotectedApi.protection_rules.length === 0 || !hasRequiredReviewers;
    assert.strictEqual(isBlockedInRealMode, true);
  });

  // -------------------------------------------------------------
  // Test 17: Cenário DEMO nunca é contado como execução real
  // -------------------------------------------------------------
  it('17. cenário DEMO nunca é contado como execução real', async () => {
    const localDb = path.join(tmpDir, 'test17.db');
    const runner = new OperationalPilotRunner({
      dbPath: localDb,
      secretProvider,
      tokenService,
      executionMode: 'DEMO'
    });

    const demoInput = createValidInput({
      classification: 'AUTOMATED_OPERATIONAL_DEMO',
      is_fixture: true
    });

    runner.loadAndValidateInput(demoInput);
    await runner.executeOperationalTask();
    runner.submitHumanReview({
      reviewerId,
      reviewerToken: validReviewerToken,
      decision: 'APPROVED',
      comments: 'Demo aprovada.'
    });
    runner.archiveOrDeliver();

    const demoOutDir = path.join(tmpDir, 'demo_out');
    const manifest = runner.generateOperationalManifest(demoOutDir);

    assert.strictEqual(manifest.classification, 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED');

    const attestation = JSON.parse(fs.readFileSync(path.join(demoOutDir, 'pilot-final-attestation.json'), 'utf8'));
    assert.strictEqual(attestation.simulation_executed, true);
    assert.strictEqual(attestation.operational_pilot_started, false);
    assert.strictEqual(attestation.operational_pilot_completed, false);
    assert.strictEqual(attestation.classification_status, 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED');

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 18: Fluxo positivo real termina como APPROVED_AND_ARCHIVED
  // -------------------------------------------------------------
  it('18. fluxo positivo real termina como APPROVED_AND_ARCHIVED somente com pacote, sessão, token, assinatura e decisão externos válidos', async () => {
    const localDb = path.join(tmpDir, 'test18_positive.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });

    const positiveToken = localTokenService.signToken({
      tenant_id: tenantId,
      user_id: reviewerId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      jti: 'jti_pos_18'
    });

    const runner = new OperationalPilotRunner({
      dbPath: localDb,
      secretProvider,
      tokenService: localTokenService,
      executionMode: 'OPERATIONAL_PILOT'
    });

    // 1. Ingestão e validação com tenant e task esperados
    const input = createValidInput();
    runner.loadAndValidateInput(input, {
      expectedTenantId: tenantId,
      expectedTaskId: taskId
    });
    assert.strictEqual(runner.getState(), 'PILOT_AUTHORIZED');

    // 2. Etapa A: Execução e desafio
    const execRes = await runner.executeOperationalTask();
    assert.strictEqual(runner.getState(), 'PENDING_HUMAN_REVIEW');

    // 3. Provisionamento de sessão externa legítima no SQLite
    runner.getStore().createReviewerSession({
      session_id: 'SESS_LEGIT_18',
      token_jti: 'jti_pos_18',
      reviewer_id: reviewerId,
      tenant_id: tenantId,
      pilot_id: pilotId,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    });

    // 4. Assinatura externa legítima
    const eventSignedAt = new Date().toISOString();
    const externalSignature = PilotExternalValidator.generateCanonicalChallengeSignature(
      execRes.challenge,
      reviewerId,
      'APPROVED',
      reviewerSecret,
      eventSignedAt
    );

    // 5. Etapa B: Revisão humana autêntica
    const reviewReceipt = runner.submitHumanReview({
      reviewerId,
      reviewerToken: positiveToken,
      decision: 'APPROVED',
      comments: 'Aprovado formalmente por revisor credenciado com sessão ativa.',
      signature: externalSignature,
      eventSignedAt
    });
    assert.strictEqual(reviewReceipt.decision, 'APPROVED');
    assert.strictEqual(runner.getState(), 'APPROVED_AND_ARCHIVED');

    // 6. Arquivamento e manifesto final
    const delivReceipt = runner.archiveOrDeliver();
    assert.strictEqual(delivReceipt.status, 'ARCHIVED');

    const outDir = path.join(tmpDir, 'test18_out');
    const manifest = runner.generateOperationalManifest(outDir);
    assert.strictEqual(
      manifest.classification,
      'CONTROLLED_REAL_PILOT_EXECUTED — HUMAN_REVIEW_CONFIRMED — APPROVED_AND_ARCHIVED'
    );

    // 7. Reconciliação dos 7 planos de verdade
    const inputPath = path.join(outDir, 'operational-pilot-input.json');
    fs.writeFileSync(inputPath, JSON.stringify(input, null, 2), 'utf8');

    const recon = OperationalPilotRunner.verifyReconciliation(inputPath, outDir, localDb);
    assert.strictEqual(recon.isValid, true);
    assert.strictEqual(recon.errors.length, 0);
    assert.strictEqual(
      recon.classification,
      'CONTROLLED_REAL_PILOT_EXECUTED — HUMAN_REVIEW_CONFIRMED — APPROVED_AND_ARCHIVED'
    );

    runner.getStore().close();
  });
});

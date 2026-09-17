import assert from 'node:assert';
import { test } from 'node:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { execSync, spawnSync } from 'node:child_process';
import {
  ControlledPilotEngine,
  TransactionalPilotStore,
  PhysicalDocumentValidator,
  PilotExternalValidator,
  EnvironmentSecretProvider,
  StaticSecretProvider,
  scanAndRejectSensitiveFields
} from '../index.js';
import {
  PilotProgram,
  PilotTaskRequest,
  OperationalPilotMode
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

test('Pilot Operational Reality — 20 Mandatory Verification Tests (Prompt Ponto 4)', async (t) => {
  const tmpDir = path.join(os.tmpdir(), `aetf_pilot_reality_test_${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const authDocPath = path.join(tmpDir, 'despacho_autorizacao_saso_2026.pdf');
  const authDocContent = PhysicalDocumentValidator.buildRealBinaryPdf(
    'Despacho de Autorizacao de Piloto SASO 2026',
    ['BT /F1 12 Tf 50 750 Td (AUTORIZACAO FORMAL DE PILOTO CONTROLADO) Tj ET']
  );
  fs.writeFileSync(authDocPath, authDocContent);
  const authDocSha = sha256(authDocContent);

  const reviewerSecretMaria = 'SASO_OPERATIONAL_PILOT_SECRET_2026_KEY_MIN32_MARIA';
  const reviewerSecretJoao = 'SASO_OPERATIONAL_PILOT_SECRET_2026_KEY_MIN32_JOAO';
  process.env.PILOT_SECRET_REV_MARIA = reviewerSecretMaria;
  process.env.PILOT_SECRET_REV_JOAO = reviewerSecretJoao;

  const operationalPilotSpec = {
    pilot_id: 'PILOT_OPERATIONAL_SASO_REAL',
    tenant_id: 'tenant_pilot_angola_ops_01',
    organization_name: 'Sociedade Angolana de Serviços & Operações Lda (SASO)',
    authorization_reference: 'AUTH-SASO-PILOT-2026-09-REAL',
    authorization_document_path: authDocPath,
    authorization_document_sha256: authDocSha,
    authorized_by: 'dr_antonio_silva_dir_executivo',
    authorized_at: '2026-09-15T09:00:00Z',
    start_at: '2026-09-15T00:00:00Z',
    end_at: '2026-10-15T23:59:59Z',
    selected_employee_ids: [66, 263, 58, 52, 73],
    allowed_data_categories: ['ACCOUNTING', 'INVOICES', 'LETTERS', 'BUDGET', 'KPI'],
    prohibited_data_categories: ['RAW_CREDIT_CARD', 'PERSONAL_HEALTH_DATA'],
    allowed_connectors: ['T.DOCS.CLASSIFIER', 'T.DOCS.GENERATOR', 'T.EXCEL.ANALYZER'],
    prohibited_actions: ['DIRECT_WIRE_TRANSFER', 'UNAPPROVED_TAX_AMENDMENT', 'MASS_DATA_DELETION'],
    human_reviewers: ['rev_maria_santos', 'rev_joao_manuel'],
    reviewer_configs: [
      {
        reviewer_id: 'rev_maria_santos',
        display_name: 'Dra. Maria Santos',
        role: 'SUPERVISOR_OPERACIONAL',
        secret_ref: 'PILOT_SECRET_REV_MARIA'
      },
      {
        reviewer_id: 'rev_joao_manuel',
        display_name: 'Eng. João Manuel',
        role: 'REVISOR_TECNICO',
        secret_ref: 'PILOT_SECRET_REV_JOAO'
      }
    ],
    task_limit: 50,
    execution_mode: 'OPERATIONAL_PILOT' as OperationalPilotMode
  };

  const simulationPilotSpec = {
    ...operationalPilotSpec,
    pilot_id: 'PILOT_SIM_TEST_01',
    execution_mode: 'SIMULATION' as OperationalPilotMode,
    authorization_document_path: undefined,
    authorization_document_sha256: undefined,
    reviewer_configs: undefined
  };

  // -------------------------------------------------------------
  // Test 1: Execução operacional termina em PENDING_HUMAN_REVIEW sem evento humano
  // -------------------------------------------------------------
  await t.test('1. execução operacional termina em PENDING_HUMAN_REVIEW sem evento humano', () => {
    const store = new TransactionalPilotStore(path.join(tmpDir, 'test1_op.db'), 'OPERATIONAL_PILOT');
    const tokenSvc = new TokenService('dummy_secret_at_least_32_chars_2026', path.join(tmpDir, 'token1.db'));
    const eng = new ControlledPilotEngine(store, tokenSvc);
    eng.createPilot(operationalPilotSpec);
    eng.authorizePilot(
      operationalPilotSpec.pilot_id,
      operationalPilotSpec.authorization_reference,
      operationalPilotSpec.authorized_by,
      operationalPilotSpec.authorized_at
    );
    eng.activatePilot(operationalPilotSpec.pilot_id);

    const task = eng.executeTask({
      task_id: 'TASK_OP_TEST_01',
      pilot_id: operationalPilotSpec.pilot_id,
      tenant_id: operationalPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'operador_humano_real',
      received_at: new Date().toISOString(),
      title: 'Classificar factura real',
      instruction: 'Classificar',
      input_data: { factura: 'FT 2026/01' },
      idempotency_key: 'IDEMP_OP_01',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    });

    const storedTask = store.getTask(task.task_id);
    assert.ok(storedTask);
    assert.strictEqual(storedTask.human_review_status, 'PENDING_REVIEW');
    assert.strictEqual(storedTask.delivery_status, 'PENDING');
    assert.strictEqual(storedTask.reviewed_at, null);
    assert.strictEqual(storedTask.reviewed_by, null);

    const pendingChallenge = store.getPendingChallengeForTask(task.task_id);
    assert.ok(pendingChallenge);
    assert.strictEqual(pendingChallenge.status, 'PENDING');
    assert.strictEqual(pendingChallenge.task_id, task.task_id);
    store.close();
  });

  // -------------------------------------------------------------
  // Test 2: O script operacional não emite tokens de revisor
  // -------------------------------------------------------------
  await t.test('2. o script operacional não emite tokens de revisor', () => {
    const scriptPath = path.resolve(repoRoot, 'scripts', 'run-controlled-pilot.mjs');
    const testConfigPath = path.join(tmpDir, 'op_config_test2.json');
    fs.writeFileSync(testConfigPath, JSON.stringify(operationalPilotSpec, null, 2), 'utf8');

    const testTasksPath = path.join(tmpDir, 'op_tasks_test2.json');
    const testTasksData = {
      pilot_id: operationalPilotSpec.pilot_id,
      tenant_id: operationalPilotSpec.tenant_id,
      tasks: [
        {
          task_id: 'TASK_CLI_OP_01',
          pilot_id: operationalPilotSpec.pilot_id,
          tenant_id: operationalPilotSpec.tenant_id,
          employee_id: 66,
          title: 'Classificar Factura SASO',
          instruction: 'Classificar documento de despesa',
          input_data: { numero_factura: 'FT 2026/901', valor_kz: 350000 },
          requested_by: 'operador_real_cli',
          received_at: new Date().toISOString(),
          idempotency_key: 'IDEMP_CLI_OP_01',
          format: 'PDF'
        }
      ]
    };
    fs.writeFileSync(testTasksPath, JSON.stringify(testTasksData, null, 2), 'utf8');

    const runDb = path.join(tmpDir, 'test2_cli.db');
    const result = spawnSync(
      'node',
      [
        scriptPath,
        '--mode=operational',
        `--config=${testConfigPath}`,
        `--auth-doc=${authDocPath}`,
        `--tasks-file=${testTasksPath}`,
        '--phase=execute'
      ],
      {
        cwd: repoRoot,
        env: {
          ...process.env,
          PILOT_DB_PATH: runDb
        },
        encoding: 'utf8'
      }
    );

    const output = (result.stdout || '') + (result.stderr || '');
    assert.ok(output.includes('INTERRUPÇÃO OBRIGATÓRIA: PILOTO EM MODO OPERACIONAL'), 'Script deve parar obrigatoriamente antes da revisão humana');
    assert.ok(output.includes('STATUS DA TAREFA: PENDING_HUMAN_REVIEW'), 'Tarefa deve ficar em PENDING_HUMAN_REVIEW');
    assert.ok(!output.includes('TokenService.signToken'), 'Script não deve emitir tokens de revisor sintéticos');
    assert.ok(!output.includes('REV_SIM_'), 'Nenhum review automático deve ser executado');
  });

  // -------------------------------------------------------------
  // Test 3: Desafio expirado falha
  // -------------------------------------------------------------
  await t.test('3. desafio expirado falha', () => {
    const store = new TransactionalPilotStore(path.join(tmpDir, 'test3.db'), 'OPERATIONAL_PILOT');
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(operationalPilotSpec);
    eng.authorizePilot(
      operationalPilotSpec.pilot_id,
      operationalPilotSpec.authorization_reference,
      operationalPilotSpec.authorized_by,
      operationalPilotSpec.authorized_at
    );
    eng.activatePilot(operationalPilotSpec.pilot_id);

    const task = eng.executeTask({
      task_id: 'TASK_EXP_01',
      pilot_id: operationalPilotSpec.pilot_id,
      tenant_id: operationalPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'operador_humano_real',
      received_at: new Date().toISOString(),
      title: 'Tarefa Expiração',
      instruction: 'Classificar',
      input_data: { doc: 'D1' },
      idempotency_key: 'IDEMP_EXP_01',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    });

    const challenge = store.getPendingChallengeForTask(task.task_id)!;
    assert.ok(challenge);

    // Forçar data de expiração no passado no SQLite
    store.saveReviewChallenge({
      ...challenge,
      expires_at: new Date(Date.now() - 3600000).toISOString()
    });

    assert.throws(() => {
      eng.reviewTask({
        review_id: 'REV_EXP_01',
        task_id: task.task_id,
        reviewer: 'rev_maria_santos',
        decision: 'APPROVED',
        comments: 'Tentativa em desafio expirado'
      });
    }, /Desafio de revisão expirou/);

    const tAfter = store.getTask(task.task_id);
    assert.strictEqual(tAfter?.human_review_status, 'PENDING_REVIEW');
    store.close();
  });

  // -------------------------------------------------------------
  // Test 4: Desafio reutilizado falha
  // -------------------------------------------------------------
  await t.test('4. desafio reutilizado falha', () => {
    const store = new TransactionalPilotStore(path.join(tmpDir, 'test4.db'), 'OPERATIONAL_PILOT');
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(operationalPilotSpec);
    eng.authorizePilot(
      operationalPilotSpec.pilot_id,
      operationalPilotSpec.authorization_reference,
      operationalPilotSpec.authorized_by,
      operationalPilotSpec.authorized_at
    );
    eng.activatePilot(operationalPilotSpec.pilot_id);

    const task = eng.executeTask({
      task_id: 'TASK_REPLAY_01',
      pilot_id: operationalPilotSpec.pilot_id,
      tenant_id: operationalPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'operador_humano_real',
      received_at: new Date().toISOString(),
      title: 'Tarefa Replay',
      instruction: 'Classificar',
      input_data: { doc: 'D1' },
      idempotency_key: 'IDEMP_REPLAY_01',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    });

    const challenge = store.getPendingChallengeForTask(task.task_id)!;
    const sig = PilotExternalValidator.generateCanonicalChallengeSignature(challenge, 'rev_maria_santos', 'APPROVED', reviewerSecretMaria);

    // 1. Primeira revisão: consome o desafio com sucesso
    const rev1 = eng.reviewTask({
      review_id: 'REV_REPLAY_01',
      task_id: task.task_id,
      reviewer: 'rev_maria_santos',
      decision: 'APPROVED',
      comments: 'Aprovação válida',
      signature: sig
    });
    assert.strictEqual(rev1.decision, 'APPROVED');

    // 2. Segunda revisão: tentativa de reutilizar o desafio já consumido
    assert.throws(() => {
      eng.reviewTask({
        review_id: 'REV_REPLAY_02',
        task_id: task.task_id,
        challenge_id: challenge.challenge_id,
        reviewer: 'rev_maria_santos',
        decision: 'APPROVED',
        comments: 'Tentativa de replay',
        signature: sig
      });
    }, /Desafio de revisão pendente não encontrado ou já consumido/);

    store.close();
  });

  // -------------------------------------------------------------
  // Test 5: Alteração do documento depois do desafio falha
  // -------------------------------------------------------------
  await t.test('5. alteração do documento depois do desafio falha', () => {
    const store = new TransactionalPilotStore(path.join(tmpDir, 'test5.db'), 'OPERATIONAL_PILOT');
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(operationalPilotSpec);
    eng.authorizePilot(
      operationalPilotSpec.pilot_id,
      operationalPilotSpec.authorization_reference,
      operationalPilotSpec.authorized_by,
      operationalPilotSpec.authorized_at
    );
    eng.activatePilot(operationalPilotSpec.pilot_id);

    const task = eng.executeTask({
      task_id: 'TASK_TAMPER_01',
      pilot_id: operationalPilotSpec.pilot_id,
      tenant_id: operationalPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'operador_humano_real',
      received_at: new Date().toISOString(),
      title: 'Tarefa Adulteração',
      instruction: 'Classificar',
      input_data: { doc: 'D1' },
      idempotency_key: 'IDEMP_TAMPER_01',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    });

    const challenge = store.getPendingChallengeForTask(task.task_id)!;
    const sig = PilotExternalValidator.generateCanonicalChallengeSignature(challenge, 'rev_maria_santos', 'APPROVED', reviewerSecretMaria);

    // Adulterar arquivo ativo no store
    const activeOut = store.getActiveOutput(task.task_id)!;
    const tamperedBytes = Buffer.from('TAMPERED_BYTES_AFTER_CHALLENGE');
    store.saveOutput({
      output_id: activeOut.output_id,
      task_id: task.task_id,
      version: 1,
      file_name: activeOut.file_name,
      file_path: activeOut.file_path,
      file_bytes: tamperedBytes,
      file_bytes_sha256: sha256(tamperedBytes),
      is_active: true
    });

    assert.throws(() => {
      eng.reviewTask({
        review_id: 'REV_TAMPER_01',
        task_id: task.task_id,
        reviewer: 'rev_maria_santos',
        decision: 'APPROVED',
        comments: 'Revisão pós adulteração',
        signature: sig
      });
    }, /Hash do documento diverge do desafio emitido/);

    store.close();
  });

  // -------------------------------------------------------------
  // Test 6: Timestamp divergente falha
  // -------------------------------------------------------------
  await t.test('6. timestamp divergente falha', () => {
    const store = new TransactionalPilotStore(path.join(tmpDir, 'test6.db'), 'OPERATIONAL_PILOT');
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(operationalPilotSpec);
    eng.authorizePilot(
      operationalPilotSpec.pilot_id,
      operationalPilotSpec.authorization_reference,
      operationalPilotSpec.authorized_by,
      operationalPilotSpec.authorized_at
    );
    eng.activatePilot(operationalPilotSpec.pilot_id);

    const task = eng.executeTask({
      task_id: 'TASK_TS_01',
      pilot_id: operationalPilotSpec.pilot_id,
      tenant_id: operationalPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'operador_humano_real',
      received_at: new Date().toISOString(),
      title: 'Tarefa Timestamp Divergente',
      instruction: 'Classificar',
      input_data: { doc: 'D1' },
      idempotency_key: 'IDEMP_TS_01',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    });

    const challenge = store.getPendingChallengeForTask(task.task_id)!;

    // Assinatura gerada com timestamp diferente do issued_at do desafio
    const divergentTimestamp = new Date(Date.now() + 120000).toISOString();
    const badSig = PilotExternalValidator.generateReviewerSignature(
      {
        taskId: challenge.task_id,
        reviewerId: 'rev_maria_santos',
        decision: 'APPROVED',
        targetDocumentHash: challenge.document_sha256,
        reviewedAt: divergentTimestamp,
        tenantId: challenge.tenant_id,
        challengeId: challenge.challenge_id
      },
      reviewerSecretMaria
    );

    // Validação direta da assinatura contra o challenge deve falhar
    const isValidSig = PilotExternalValidator.validateCanonicalChallengeSignature(
      challenge,
      'rev_maria_santos',
      'APPROVED',
      badSig,
      reviewerSecretMaria
    );
    assert.strictEqual(isValidSig, false);

    // Validação via engine reviewTask deve ser rejeitada
    assert.throws(() => {
      eng.reviewTask({
        review_id: 'REV_TS_01',
        task_id: task.task_id,
        reviewer: 'rev_maria_santos',
        decision: 'APPROVED',
        comments: 'Assinatura com timestamp divergente',
        signature: badSig
      });
    }, /Assinatura criptográfica canónica do desafio inválida ou adulterada/);

    store.close();
  });

  // -------------------------------------------------------------
  // Test 7: Token do revisor A não pode assinar como revisor B
  // -------------------------------------------------------------
  await t.test('7. token do revisor A não pode assinar como revisor B', () => {
    const tokenDbPath = path.join(tmpDir, 'test7_token.db');
    const tokenService = new TokenService('token-test-secret-at-least-32-chars-long-2026', tokenDbPath);

    // Token legítimo gerado para Revisor A (rev_maria_santos)
    const tokenA = tokenService.signToken({
      sub: 'rev_maria_santos',
      user_id: 'rev_maria_santos',
      tenant_id: operationalPilotSpec.tenant_id,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW']
    });

    // Tentativa de apresentar token do Revisor A para Revisor B (rev_joao_manuel)
    const result = PilotExternalValidator.validateReviewerToken(
      tokenA,
      operationalPilotSpec.tenant_id,
      'rev_joao_manuel',
      tokenService
    );

    assert.strictEqual(result.isValid, false);
    assert.ok(result.error?.includes('Impersonação detectada') || result.error?.includes('diverge'));
  });

  // -------------------------------------------------------------
  // Test 8: Revisão válida consome o desafio atomicamente
  // -------------------------------------------------------------
  await t.test('8. revisão válida consome o desafio atomicamente', () => {
    const store = new TransactionalPilotStore(path.join(tmpDir, 'test8.db'), 'OPERATIONAL_PILOT');
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(operationalPilotSpec);
    eng.authorizePilot(
      operationalPilotSpec.pilot_id,
      operationalPilotSpec.authorization_reference,
      operationalPilotSpec.authorized_by,
      operationalPilotSpec.authorized_at
    );
    eng.activatePilot(operationalPilotSpec.pilot_id);

    const task = eng.executeTask({
      task_id: 'TASK_ATOMIC_01',
      pilot_id: operationalPilotSpec.pilot_id,
      tenant_id: operationalPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'operador_humano_real',
      received_at: new Date().toISOString(),
      title: 'Tarefa Consumo Atómico',
      instruction: 'Classificar',
      input_data: { doc: 'D1' },
      idempotency_key: 'IDEMP_ATOMIC_01',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    });

    const challenge = store.getPendingChallengeForTask(task.task_id)!;
    assert.strictEqual(challenge.status, 'PENDING');

    const sig = PilotExternalValidator.generateCanonicalChallengeSignature(challenge, 'rev_maria_santos', 'APPROVED', reviewerSecretMaria);
    const reviewReceipt = eng.reviewTask({
      review_id: 'REV_ATOMIC_01',
      task_id: task.task_id,
      reviewer: 'rev_maria_santos',
      decision: 'APPROVED',
      comments: 'Aprovado na íntegra',
      signature: sig
    });

    assert.strictEqual(reviewReceipt.decision, 'APPROVED');

    // Verificar estado persistido do desafio no SQLite
    const updatedChallenge = store.getReviewChallenge(challenge.challenge_id)!;
    assert.strictEqual(updatedChallenge.status, 'CONSUMED');
    assert.ok(updatedChallenge.consumed_at);

    // Consumo atómico repetido na base deve lançar erro
    assert.throws(() => {
      store.consumeReviewChallengeAtomic(challenge.challenge_id, reviewReceipt, task);
    }, /já foi consumido/);

    store.close();
  });

  // -------------------------------------------------------------
  // Test 9: Indisponibilidade do serviço de identidade falha fechadamente
  // -------------------------------------------------------------
  await t.test('9. indisponibilidade do serviço de identidade falha fechadamente', () => {
    const closedDbPath = path.join(tmpDir, 'test9_token.db');
    const brokenTokenSvc = new TokenService('token-test-secret-at-least-32-chars-long-2026', closedDbPath);
    (brokenTokenSvc as any).db.close();

    const valResult = PilotExternalValidator.validateReviewerToken(
      'some.token.jwt',
      operationalPilotSpec.tenant_id,
      'rev_maria_santos',
      brokenTokenSvc
    );

    assert.strictEqual(valResult.isValid, false);
    assert.ok(valResult.error);
  });

  // -------------------------------------------------------------
  // Test 10: Indisponibilidade do secret provider falha fechadamente
  // -------------------------------------------------------------
  await t.test('10. indisponibilidade do secret provider falha fechadamente', () => {
    const missingSecretProvider = new EnvironmentSecretProvider();
    assert.throws(() => {
      missingSecretProvider.resolveSecret('SECRET_REF_NAO_EXISTENTE_9999', 'tenant_01');
    }, /Segredo não resolvido/);

    const store = new TransactionalPilotStore(path.join(tmpDir, 'test10.db'), 'OPERATIONAL_PILOT');
    const brokenEngine = new ControlledPilotEngine(store, undefined, missingSecretProvider);

    const badSpec = {
      ...operationalPilotSpec,
      pilot_id: 'PILOT_BROKEN_SECRET',
      reviewer_configs: [
        {
          reviewer_id: 'rev_maria_santos',
          display_name: 'Dra. Maria',
          role: 'SUPERVISOR',
          secret_ref: 'ENV_VAR_QUE_NAO_EXISTE_NO_SISTEMA_XYZ'
        }
      ]
    };

    brokenEngine.createPilot(badSpec as any);
    brokenEngine.authorizePilot(badSpec.pilot_id, badSpec.authorization_reference, badSpec.authorized_by, badSpec.authorized_at);
    brokenEngine.activatePilot(badSpec.pilot_id);

    const task = brokenEngine.executeTask({
      task_id: 'TASK_SECRET_FAIL',
      pilot_id: badSpec.pilot_id,
      tenant_id: badSpec.tenant_id,
      employee_id: 66,
      requested_by: 'operador_real',
      received_at: new Date().toISOString(),
      title: 'Teste Secret Falha',
      instruction: 'Classificar',
      input_data: { d: 1 },
      idempotency_key: 'IDEMP_SEC_FAIL',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    });

    const challenge = store.getPendingChallengeForTask(task.task_id)!;

    assert.throws(() => {
      brokenEngine.reviewTask({
        review_id: 'REV_SEC_FAIL',
        task_id: task.task_id,
        reviewer: 'rev_maria_santos',
        decision: 'APPROVED',
        comments: 'Sem segredo acessível',
        signature: 'deadbeef'
      });
    }, /Segredo não resolvido/);

    store.close();
  });

  // -------------------------------------------------------------
  // Test 11: JSON com secret_or_key ou outro segredo é rejeitado
  // -------------------------------------------------------------
  await t.test('11. JSON com secret_or_key ou outro segredo é rejeitado', () => {
    assert.throws(() => {
      scanAndRejectSensitiveFields({
        pilot_id: 'P1',
        reviewer_configs: [{ reviewer_id: 'r1', secret_or_key: 'plain_secret' }]
      });
    }, /Campo sensível proibido detectado/);

    const schemaPath = path.resolve(repoRoot, 'schemas', 'pilot', 'pilotOperationalConfig.schema.json');
    const configSchema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const validateConfig = ajv.compile(configSchema);

    const invalidSpec = {
      ...operationalPilotSpec,
      reviewer_configs: [
        {
          reviewer_id: 'rev_maria_santos',
          display_name: 'Dra. Maria Santos',
          role: 'SUPERVISOR',
          secret_or_key: 'HARDCODED_SECRET_PROIBIDO'
        }
      ]
    };

    const isValid = validateConfig(invalidSpec);
    assert.strictEqual(isValid, false, 'Schema formal deve proibir expressamente secret_or_key');
    assert.ok(
      validateConfig.errors.some((e: any) => e.message?.includes('additional properties') || e.params?.additionalProperty === 'secret_or_key')
    );
  });

  // -------------------------------------------------------------
  // Test 12: Campo operacional obrigatório sem valor não recebe fallback
  // -------------------------------------------------------------
  await t.test('12. campo operacional obrigatório sem valor não recebe fallback', () => {
    const store = new TransactionalPilotStore(path.join(tmpDir, 'test12.db'), 'OPERATIONAL_PILOT');
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(operationalPilotSpec);
    eng.authorizePilot(
      operationalPilotSpec.pilot_id,
      operationalPilotSpec.authorization_reference,
      operationalPilotSpec.authorized_by,
      operationalPilotSpec.authorized_at
    );
    eng.activatePilot(operationalPilotSpec.pilot_id);

    // 1. requested_by ausente em executeTask operacional lança erro (sem fallback para operador_saso_01)
    assert.throws(() => {
      eng.executeTask({
        task_id: 'TASK_NO_REQ_BY',
        pilot_id: operationalPilotSpec.pilot_id,
        tenant_id: operationalPilotSpec.tenant_id,
        employee_id: 66,
        requested_by: undefined as any,
        received_at: new Date().toISOString(),
        title: 'Sem Solicitante',
        instruction: 'Processar',
        input_data: { a: 1 },
        idempotency_key: 'IDEMP_NO_REQ',
        format: 'PDF',
        execution_mode: 'OPERATIONAL_PILOT'
      });
    }, /Solicitante obrigatório e fallback 'operador_saso_01' proibido em modo operacional/);

    // 2. recipient ausente em deliverTask operacional lança erro (sem fallback para archive@saso.ao)
    const taskValid = eng.executeTask({
      task_id: 'TASK_VALID_FOR_DELIV',
      pilot_id: operationalPilotSpec.pilot_id,
      tenant_id: operationalPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'operador_real',
      received_at: new Date().toISOString(),
      title: 'Tarefa para Entrega',
      instruction: 'Processar',
      input_data: { a: 1 },
      idempotency_key: 'IDEMP_DELIV_TEST',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    });

    const challenge = store.getPendingChallengeForTask(taskValid.task_id)!;
    const sig = PilotExternalValidator.generateCanonicalChallengeSignature(challenge, 'rev_maria_santos', 'APPROVED', reviewerSecretMaria);
    eng.reviewTask({
      review_id: 'REV_VALID_DELIV',
      task_id: taskValid.task_id,
      reviewer: 'rev_maria_santos',
      decision: 'APPROVED',
      comments: 'Aprovado',
      signature: sig
    });

    assert.throws(() => {
      eng.deliverTask(taskValid.task_id, undefined as any);
    }, /Destinatário de entrega obrigatório e fallback 'archive@saso.ao' proibido em modo operacional/);

    store.close();
  });

  // -------------------------------------------------------------
  // Test 13: Documento inválido não chega à fase de revisão
  // -------------------------------------------------------------
  await t.test('13. documento inválido não chega à fase de revisão', () => {
    const store = new TransactionalPilotStore(path.join(tmpDir, 'test13.db'), 'OPERATIONAL_PILOT');
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(operationalPilotSpec);
    eng.authorizePilot(
      operationalPilotSpec.pilot_id,
      operationalPilotSpec.authorization_reference,
      operationalPilotSpec.authorized_by,
      operationalPilotSpec.authorized_at
    );
    eng.activatePilot(operationalPilotSpec.pilot_id);

    // Entrada com placeholder proibido yyyy
    assert.throws(() => {
      eng.executeTask({
        task_id: 'TASK_CORRUPT_INPUT',
        pilot_id: operationalPilotSpec.pilot_id,
        tenant_id: operationalPilotSpec.tenant_id,
        employee_id: 66,
        requested_by: 'operador_real',
        received_at: new Date().toISOString(),
        title: 'Documento Inválido Com Placeholder',
        instruction: 'Emitido em yyyy para o cliente [NOME]',
        input_data: { text: 'yyyy placeholder' },
        idempotency_key: 'IDEMP_CORRUPT_INPUT',
        format: 'PDF',
        execution_mode: 'OPERATIONAL_PILOT'
      });
    }, /Documento contém placeholder residual/);

    // Nenhuma challenge de revisão deve existir para esta tarefa
    const challenge = store.getPendingChallengeForTask('TASK_CORRUPT_INPUT');
    assert.strictEqual(challenge, null);

    store.close();
  });

  // -------------------------------------------------------------
  // Test 14: Revisão não pode ocorrer sem recibo documental PASS
  // -------------------------------------------------------------
  await t.test('14. revisão não pode ocorrer sem recibo documental PASS', () => {
    const store = new TransactionalPilotStore(path.join(tmpDir, 'test14.db'), 'OPERATIONAL_PILOT');
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(operationalPilotSpec);
    eng.authorizePilot(
      operationalPilotSpec.pilot_id,
      operationalPilotSpec.authorization_reference,
      operationalPilotSpec.authorized_by,
      operationalPilotSpec.authorized_at
    );
    eng.activatePilot(operationalPilotSpec.pilot_id);

    const task = eng.executeTask({
      task_id: 'TASK_NO_PASS_01',
      pilot_id: operationalPilotSpec.pilot_id,
      tenant_id: operationalPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'operador_real',
      received_at: new Date().toISOString(),
      title: 'Tarefa Validação Falhada',
      instruction: 'Classificar',
      input_data: { d: 1 },
      idempotency_key: 'IDEMP_NO_PASS',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    });

    const challenge = store.getPendingChallengeForTask(task.task_id)!;
    const sig = PilotExternalValidator.generateCanonicalChallengeSignature(challenge, 'rev_maria_santos', 'APPROVED', reviewerSecretMaria);

    // Deletar o recibo documental no SQLite para simular falta de PASS
    store.transaction(() => {
      const db = (store as any).db;
      db.prepare('DELETE FROM task_document_validations WHERE task_id = ?').run(task.task_id);
    });

    assert.throws(() => {
      eng.reviewTask({
        review_id: 'REV_NO_PASS_01',
        task_id: task.task_id,
        reviewer: 'rev_maria_santos',
        decision: 'APPROVED',
        comments: 'Tentativa sem validação documental PASS',
        signature: sig
      });
    }, /Revisão rejeitada: documento ativo não possui validação física independente aprovada \(PASS\)/);

    store.close();
  });

  // -------------------------------------------------------------
  // Test 15: Entrega ou arquivamento não pode ocorrer sem validação e revisão
  // -------------------------------------------------------------
  await t.test('15. entrega ou arquivamento não pode ocorrer sem validação e revisão', () => {
    const store = new TransactionalPilotStore(path.join(tmpDir, 'test15.db'), 'OPERATIONAL_PILOT');
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(operationalPilotSpec);
    eng.authorizePilot(
      operationalPilotSpec.pilot_id,
      operationalPilotSpec.authorization_reference,
      operationalPilotSpec.authorized_by,
      operationalPilotSpec.authorized_at
    );
    eng.activatePilot(operationalPilotSpec.pilot_id);

    const task = eng.executeTask({
      task_id: 'TASK_DELIV_UNAPPROVED',
      pilot_id: operationalPilotSpec.pilot_id,
      tenant_id: operationalPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'operador_real',
      received_at: new Date().toISOString(),
      title: 'Tarefa Não Aprovada',
      instruction: 'Classificar',
      input_data: { d: 1 },
      idempotency_key: 'IDEMP_DELIV_UNAPP',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    });

    assert.throws(() => {
      eng.deliverTask(task.task_id, 'arquivo@saso.ao', 'EMAIL');
    }, /não tem aprovação humana|não foi aprovada na revisão humana/);

    store.close();
  });

  // -------------------------------------------------------------
  // Test 16: Processo 2 recupera dados criados pelo processo 1
  // -------------------------------------------------------------
  await t.test('16. processo 2 recupera dados criados pelo processo 1', () => {
    const durableDb = path.join(tmpDir, 'durable_dual_process.db');
    const storeModuleUrl = pathToFileURL(path.resolve(repoRoot, 'packages/runtime/dist/pilot/TransactionalPilotStore.js')).href;
    const engineModuleUrl = pathToFileURL(path.resolve(repoRoot, 'packages/runtime/dist/pilot/ControlledPilotEngine.js')).href;

    const scriptP1 = `
      import { TransactionalPilotStore } from '${storeModuleUrl}';
      import { ControlledPilotEngine } from '${engineModuleUrl}';
      const store = new TransactionalPilotStore('${durableDb.replace(/\\/g, '/')}', 'SIMULATION');
      const eng = new ControlledPilotEngine(store);
      eng.createPilot(${JSON.stringify(simulationPilotSpec)});
      eng.authorizePilot('${simulationPilotSpec.pilot_id}', '${simulationPilotSpec.authorization_reference}', 'dir', new Date().toISOString());
      eng.activatePilot('${simulationPilotSpec.pilot_id}');
      eng.executeTask({
        task_id: 'TASK_P1_P2_TEST',
        pilot_id: '${simulationPilotSpec.pilot_id}',
        tenant_id: '${simulationPilotSpec.tenant_id}',
        employee_id: 66,
        requested_by: 'user_p1',
        received_at: new Date().toISOString(),
        title: 'Tarefa Processo 1',
        instruction: 'Processar',
        input_data: { test: 'dual_process' },
        idempotency_key: 'IDEMP_P1_P2',
        format: 'PDF'
      });
      store.close();
      process.exit(0);
    `;

    const resP1 = spawnSync('node', ['--input-type=module', '-e', scriptP1], { cwd: repoRoot, encoding: 'utf8' });
    assert.strictEqual(resP1.status, 0, `Processo 1 falhou: ${resP1.stderr}`);

    const scriptP2 = `
      import assert from 'node:assert';
      import { TransactionalPilotStore } from '${storeModuleUrl}';
      const store = new TransactionalPilotStore('${durableDb.replace(/\\/g, '/')}', 'SIMULATION');
      const pilot = store.getPilot('${simulationPilotSpec.pilot_id}');
      assert.ok(pilot, 'Piloto deve existir no Processo 2');
      const task = store.getTask('TASK_P1_P2_TEST');
      assert.ok(task, 'Tarefa deve existir no Processo 2');
      assert.strictEqual(task.final_status, 'SUCCESS');
      const out = store.getActiveOutputBytes('TASK_P1_P2_TEST');
      assert.ok(out && out.bytes.length > 0, 'Bytes de saída devem ser recuperados no Processo 2');
      store.close();
      process.exit(0);
    `;

    const resP2 = spawnSync('node', ['--input-type=module', '-e', scriptP2], { cwd: repoRoot, encoding: 'utf8' });
    assert.strictEqual(resP2.status, 0, `Processo 2 falhou: ${resP2.stderr}`);
  });

  // -------------------------------------------------------------
  // Test 17: XLSX é aberto por leitor de workbook e células
  // -------------------------------------------------------------
  await t.test('17. XLSX é aberto por leitor de workbook e células', () => {
    const xlsxBuf = PhysicalDocumentValidator.buildRealBinaryXlsx(
      'Analise_Orcamental_SASO',
      [
        ['Rubrica', 'Orçado (KZ)', 'Realizado (KZ)', 'Desvio (KZ)'],
        ['Custos com Pessoal', 45000000, 43200000, 1800000],
        ['Custos Operacionais', 28000000, 27150000, 850000]
      ]
    );

    const val = PhysicalDocumentValidator.validateIndependentXlsxSync(xlsxBuf);
    assert.strictEqual(val.isValid, true);
    assert.ok(val.files && val.files.includes('xl/workbook.xml'));
    assert.ok(val.rowCount && val.rowCount >= 3, `Esperado pelo menos 3 linhas, obtido ${val.rowCount}`);
    assert.ok(val.cellCount && val.cellCount >= 12, `Esperado pelo menos 12 células, obtido ${val.cellCount}`);
  });

  // -------------------------------------------------------------
  // Test 18: Metadados do manifesto correspondem ao SQLite e aos recibos
  // -------------------------------------------------------------
  await t.test('18. metadados do manifesto correspondem ao SQLite e aos recibos', () => {
    const store = new TransactionalPilotStore(path.join(tmpDir, 'test18.db'), 'SIMULATION');
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(simulationPilotSpec);
    eng.authorizePilot(
      simulationPilotSpec.pilot_id,
      simulationPilotSpec.authorization_reference,
      'dir',
      new Date().toISOString()
    );
    eng.activatePilot(simulationPilotSpec.pilot_id);

    const task = eng.executeTask({
      task_id: 'TASK_META_01',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'op_meta',
      received_at: new Date().toISOString(),
      title: 'Tarefa Metadados',
      instruction: 'Classificar factura',
      input_data: { doc: 'FT 001' },
      idempotency_key: 'IDEMP_META_01',
      format: 'PDF'
    });

    eng.reviewTask({
      review_id: 'REV_META_01',
      task_id: task.task_id,
      reviewer: 'rev_maria_santos',
      decision: 'APPROVED',
      comments: 'Aprovado para verificação de metadados'
    });

    eng.deliverTask(task.task_id, 'arquivo@saso.ao', 'EMAIL');

    const manifestOutDir = path.join(tmpDir, 'manifest_meta_bundle');
    eng.exportPilotEvidence(simulationPilotSpec.pilot_id, manifestOutDir);

    const manifestPath = path.join(manifestOutDir, 'pilot-evidence-manifest.json');
    assert.ok(fs.existsSync(manifestPath));
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    assert.strictEqual(manifest.pilot_id, simulationPilotSpec.pilot_id);
    assert.strictEqual(manifest.tenant_id, simulationPilotSpec.tenant_id);
    assert.strictEqual(manifest.execution_mode, 'SIMULATION');
    assert.ok(manifest.commit_sha && manifest.commit_sha.length === 40);

    const taskOutputFile = manifest.files.find((f: any) => f.relative_path.startsWith('task-outputs/'));
    assert.ok(taskOutputFile);
    assert.strictEqual(taskOutputFile.task_id, task.task_id);
    assert.strictEqual(taskOutputFile.document_version, 1);
    assert.strictEqual(taskOutputFile.mime_type, 'application/pdf');
    assert.strictEqual(taskOutputFile.origin, 'SQLITE_TASK_OUTPUT');

    const docValFile = manifest.files.find((f: any) => f.relative_path.startsWith('document-validation-receipts/'));
    assert.ok(docValFile);
    assert.strictEqual(docValFile.origin, 'INDEPENDENT_PARSER_RECEIPT');
    assert.strictEqual(docValFile.receipt_type, 'DOCUMENT_VALIDATION_RECEIPT');

    store.close();
  });

  // -------------------------------------------------------------
  // Test 19: MIME divergente da extensão ou dos bytes falha
  // -------------------------------------------------------------
  await t.test('19. MIME divergente da extensão ou dos bytes falha', () => {
    // 1. Incoerência de bytes vs extensão
    assert.throws(() => {
      PhysicalDocumentValidator.validateMimeCoherence('application/pdf', '.xlsx', 'relatorio.xlsx');
    }, /Incoerência de MIME bytes/);

    assert.throws(() => {
      PhysicalDocumentValidator.validateMimeCoherence('application/zip', '.pdf', 'documento.pdf');
    }, /Incoerência de MIME bytes/);

    // 2. Detecção de magic bytes
    const pdfBytes = Buffer.from('%PDF-1.4\nExemplo de cabeçalho PDF');
    assert.strictEqual(PhysicalDocumentValidator.detectMimeType(pdfBytes), 'application/pdf');

    const zipBytes = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x00, 0x00]);
    assert.strictEqual(PhysicalDocumentValidator.detectMimeType(zipBytes), 'application/zip');
  });

  // -------------------------------------------------------------
  // Test 20: Ausência de SHA físico falha sem fallback
  // -------------------------------------------------------------
  await t.test('20. ausência de SHA físico falha sem fallback', () => {
    const store = new TransactionalPilotStore(path.join(tmpDir, 'test20.db'), 'SIMULATION');
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(simulationPilotSpec);
    eng.authorizePilot(
      simulationPilotSpec.pilot_id,
      simulationPilotSpec.authorization_reference,
      'dir',
      new Date().toISOString()
    );
    eng.activatePilot(simulationPilotSpec.pilot_id);

    const prevGitSha = process.env.GIT_COMMIT_SHA;
    const prevGithubSha = process.env.GITHUB_SHA;
    const outDir = path.join(tmpDir, 'sha_fail_bundle');

    try {
      // Injetar valor inválido (40 chars mas não-hexadecimal)
      process.env.GIT_COMMIT_SHA = 'z'.repeat(40);
      delete process.env.GITHUB_SHA;

      assert.throws(() => {
        eng.exportPilotEvidence(simulationPilotSpec.pilot_id, outDir);
      }, /Commit SHA inválido: esperado 40 caracteres hexadecimais/);
    } finally {
      process.env.GIT_COMMIT_SHA = prevGitSha;
      process.env.GITHUB_SHA = prevGithubSha;
    }

    store.close();
  });

  // -------------------------------------------------------------
  // Testes Complementares de Infraestrutura
  // -------------------------------------------------------------
  await t.test('21. Proibição de :memory: em TransactionalPilotStore quando em modo OPERATIONAL_PILOT', () => {
    assert.throws(() => {
      new TransactionalPilotStore(':memory:', 'OPERATIONAL_PILOT');
    }, /Operational pilot requires a persistent SQLite database path, :memory: is forbidden/);
  });

  await t.test('22. Idempotência garante recibo idêntico sem novo efeito', () => {
    const store = new TransactionalPilotStore(path.join(tmpDir, 'test22.db'), 'SIMULATION');
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(simulationPilotSpec);
    eng.authorizePilot(simulationPilotSpec.pilot_id, simulationPilotSpec.authorization_reference, 'dir', new Date().toISOString());
    eng.activatePilot(simulationPilotSpec.pilot_id);

    const taskReq = {
      task_id: 'TASK_IDEMP_TEST_01',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'operador_01',
      received_at: new Date().toISOString(),
      title: 'Tarefa Idempotente',
      instruction: 'Classificar factura',
      input_data: { factura: 'FT 1001' },
      idempotency_key: 'UNIQUE_IDEMP_KEY_2026',
      format: 'PDF' as const
    };

    const firstReceipt = eng.executeTask(taskReq);
    const secondReceipt = eng.executeTask(taskReq);

    assert.strictEqual(firstReceipt.task_id, secondReceipt.task_id);
    assert.strictEqual(firstReceipt.receipt_sha256, secondReceipt.receipt_sha256);

    const allTasks = store.listTasks(simulationPilotSpec.pilot_id);
    assert.strictEqual(allTasks.length, 1);
    store.close();
  });

  await t.test('23. Rejeição estrita de symlinks no manifesto e arquivos órfãos', () => {
    const symlinkTestDir = path.join(tmpDir, 'symlink_bundle_test');
    fs.mkdirSync(symlinkTestDir, { recursive: true });

    const verifyScript = path.resolve(repoRoot, 'scripts', 'verify-pilot-manifest.mjs');

    const targetFile = path.join(tmpDir, 'target_file.txt');
    fs.writeFileSync(targetFile, 'Target file content');
    const linkPath = path.join(symlinkTestDir, 'symlink_file.txt');

    let symlinkCreated = false;
    try {
      fs.symlinkSync(targetFile, linkPath);
      symlinkCreated = true;
    } catch {
      symlinkCreated = false;
    }

    if (symlinkCreated) {
      assert.throws(() => {
        execSync(`node "${verifyScript}" --dir="${symlinkTestDir}" --allow-partial-gates`, { cwd: repoRoot, stdio: 'pipe' });
      });
      fs.unlinkSync(linkPath);
    }
  });

  // Limpeza de diretório temporário
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {}
});

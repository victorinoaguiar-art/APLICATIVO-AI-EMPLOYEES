import assert from 'node:assert';
import { test } from 'node:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash } from 'node:crypto';
import {
  ControlledPilotEngine,
  TransactionalPilotStore,
  PilotExternalValidator
} from '../index.js';
import {
  PilotProgram,
  PilotTaskReceipt,
  PilotTaskRequest
} from '@ai-employee/shared';
import { TokenService } from '@ai-employee/shared/server';

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

test('Persistent Identity, Store Fail-Closed & Relational Manifest — 32 Strict Verification Tests (AETF-500)', async (t) => {
  const tmpDir = path.join(os.tmpdir(), `aetf_micro_patch_test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  // =========================================================================
  // PILAR 1: IDENTIDADE PERSISTENTE DO REVISOR (8 testes)
  // =========================================================================
  await t.test('Pilar 1 — Identidade Persistente do Revisor (8 testes)', async (t1) => {
    const tenantId = 'TENANT_TEST_PERSISTENCE';
    const pilotId = 'PILOT_TEST_PERSISTENCE';

    await t1.test('1. Rejeita revisor sem conta no TokenService (não persistido)', () => {
      const tokenService = new TokenService('dev-secret-at-least-32-chars-long-test-suite', path.join(tmpDir, 'tok1.db'));
      const token = tokenService.signToken({
        tenant_id: tenantId,
        user_id: 'rev_ghost',
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW']
      });

      const res = PilotExternalValidator.validateReviewerToken(token, tenantId, 'rev_ghost', tokenService, pilotId);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.error?.includes('Vínculo persistente do revisor'), res.error);
    });

    await t1.test('2. Rejeita revisor com conta inativa (status !== ACTIVE)', () => {
      const tokenService = new TokenService('dev-secret-at-least-32-chars-long-test-suite', path.join(tmpDir, 'tok2.db'));
      tokenService.upsertAccount({
        tenant_id: tenantId,
        user_id: 'rev_suspended',
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW'],
        status: 'SUSPENDED'
      });

      const token = tokenService.signToken({
        tenant_id: tenantId,
        user_id: 'rev_suspended',
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW']
      });

      const res = PilotExternalValidator.validateReviewerToken(token, tenantId, 'rev_suspended', tokenService, pilotId);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.error?.includes("estado actual 'SUSPENDED'"), res.error);
    });

    await t1.test('3. Rejeita revisor com tenant divergente na conta persistida', () => {
      const tokenService = new TokenService('dev-secret-at-least-32-chars-long-test-suite', path.join(tmpDir, 'tok3.db'));
      tokenService.upsertAccount({
        tenant_id: 'OTHER_TENANT',
        user_id: 'rev_wrong_tenant',
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW'],
        status: 'ACTIVE'
      });

      const token = tokenService.signToken({
        tenant_id: tenantId,
        user_id: 'rev_wrong_tenant',
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW']
      });

      const res = PilotExternalValidator.validateReviewerToken(token, tenantId, 'rev_wrong_tenant', tokenService, pilotId);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.error?.includes("pertence a outro tenant ('OTHER_TENANT')"), res.error);
    });

    await t1.test('4. Rejeita revisor com user_id divergente da conta persistida (impersonação)', () => {
      const tokenService = new TokenService('dev-secret-at-least-32-chars-long-test-suite', path.join(tmpDir, 'tok4.db'));
      tokenService.upsertAccount({
        tenant_id: tenantId,
        user_id: 'rev_real_alice',
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW'],
        status: 'ACTIVE'
      });

      const token = tokenService.signToken({
        tenant_id: tenantId,
        user_id: 'rev_impersonator',
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW']
      });

      const res = PilotExternalValidator.validateReviewerToken(token, tenantId, 'rev_impersonator', tokenService, pilotId);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.error?.includes('Vínculo persistente do revisor'), res.error);
    });

    await t1.test('5. Rejeita revisor com token contendo role HUMAN_REVIEWER mas conta sem papel autorizado', () => {
      const tokenService = new TokenService('dev-secret-at-least-32-chars-long-test-suite', path.join(tmpDir, 'tok5.db'));
      tokenService.upsertAccount({
        tenant_id: tenantId,
        user_id: 'rev_no_role',
        roles: ['REGULAR_USER'],
        permissions: ['PILOT_REVIEW'],
        status: 'ACTIVE'
      });

      const token = tokenService.signToken({
        tenant_id: tenantId,
        user_id: 'rev_no_role',
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW']
      });

      const res = PilotExternalValidator.validateReviewerToken(token, tenantId, 'rev_no_role', tokenService, pilotId);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.error?.includes('Função não autorizada na conta persistente'), res.error);
    });

    await t1.test('6. Rejeita revisor com token contendo permission PILOT_REVIEW mas conta sem permissão persistida', () => {
      const tokenService = new TokenService('dev-secret-at-least-32-chars-long-test-suite', path.join(tmpDir, 'tok6.db'));
      tokenService.upsertAccount({
        tenant_id: tenantId,
        user_id: 'rev_no_perm',
        roles: ['HUMAN_REVIEWER'],
        permissions: ['OTHER_PERM'],
        status: 'ACTIVE'
      });

      const token = tokenService.signToken({
        tenant_id: tenantId,
        user_id: 'rev_no_perm',
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW']
      });

      const res = PilotExternalValidator.validateReviewerToken(token, tenantId, 'rev_no_perm', tokenService, pilotId);
      assert.strictEqual(res.isValid, false);
      assert.ok(res.error?.includes("Permissão explícita 'PILOT_REVIEW' ausente na conta persistente"), res.error);
    });

    await t1.test('7. Aceita revisor quando conta persistente possui role ADMIN e permission PILOT_REVIEW', () => {
      const tokenService = new TokenService('dev-secret-at-least-32-chars-long-test-suite', path.join(tmpDir, 'tok7.db'));
      tokenService.upsertAccount({
        tenant_id: tenantId,
        user_id: 'admin_reviewer',
        roles: ['ADMIN'],
        permissions: ['PILOT_REVIEW'],
        status: 'ACTIVE'
      });

      const token = tokenService.signToken({
        tenant_id: tenantId,
        user_id: 'admin_reviewer',
        roles: ['ADMIN'],
        permissions: ['PILOT_REVIEW']
      });

      const res = PilotExternalValidator.validateReviewerToken(token, tenantId, 'admin_reviewer', tokenService, pilotId);
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.payload.user_id, 'admin_reviewer');
    });

    await t1.test('8. Aceita revisor quando conta persistente possui role HUMAN_REVIEWER e permission PILOT_REVIEW válidos', () => {
      const tokenService = new TokenService('dev-secret-at-least-32-chars-long-test-suite', path.join(tmpDir, 'tok8.db'));
      tokenService.upsertAccount({
        tenant_id: tenantId,
        user_id: 'valid_reviewer',
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW'],
        status: 'ACTIVE'
      });

      const token = tokenService.signToken({
        tenant_id: tenantId,
        user_id: 'valid_reviewer',
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW']
      });

      const res = PilotExternalValidator.validateReviewerToken(token, tenantId, 'valid_reviewer', tokenService, pilotId);
      assert.strictEqual(res.isValid, true);
      assert.strictEqual(res.payload.user_id, 'valid_reviewer');
    });
  });

  // =========================================================================
  // PILAR 2: STORE FAIL-CLOSED & REMOÇÃO DE FALLBACKS (10 testes)
  // =========================================================================
  await t.test('Pilar 2 — Store Fail-Closed & Remoção de Fallbacks (10 testes)', async (t2) => {
    const storeDbPath = path.join(tmpDir, 'store_fail_closed.db');
    const store = new TransactionalPilotStore(storeDbPath, 'SIMULATION');

    const samplePilot: PilotProgram = {
      pilot_id: 'PILOT_STORE_TEST',
      tenant_id: 'TENANT_STORE_TEST',
      organization_name: 'Store Test Org',
      authorized_by: 'Diretoria',
      authorized_at: new Date().toISOString(),
      authorization_reference: 'AUTH_STORE_001',
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 86400000).toISOString(),
      selected_employee_ids: [1],
      allowed_data_categories: ['FINANCE'],
      prohibited_data_categories: [],
      allowed_connectors: [],
      prohibited_actions: [],
      human_reviewers: ['rev_store'],
      task_limit: 10,
      status: 'ACTIVE',
      execution_mode: 'SIMULATION',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    store.savePilot(samplePilot);

    const validTask: PilotTaskReceipt = {
      task_id: 'TASK_TEST_001',
      pilot_id: 'PILOT_STORE_TEST',
      tenant_id: 'TENANT_STORE_TEST',
      employee_id: 1,
      requested_by: 'solicitante_1',
      received_at: new Date().toISOString(),
      input_snapshot_sha256: 'a'.repeat(64),
      execution_started_at: new Date().toISOString(),
      execution_completed_at: new Date().toISOString(),
      output_files: ['test.pdf'],
      output_hashes: ['a'.repeat(64)],
      human_review_status: 'PENDING_REVIEW',
      reviewed_by: null,
      reviewed_at: null,
      corrections_required: 0,
      delivery_status: 'PENDING',
      final_status: 'SUCCESS',
      error_code: null,
      version: 1,
      idempotency_key: 'idemp_key_001',
      execution_mode: 'SIMULATION',
      is_simulation: true,
      classification_level: 'CONFIDENTIAL'
    };

    await t2.test("9. saveTask: Rejeita tarefa sem 'idempotency_key' (sem fallback)", () => {
      const bad = { ...validTask, task_id: 'TASK_NO_IDEMP', idempotency_key: undefined as any };
      assert.throws(
        () => store.saveTask(bad),
        (err: any) => err.message.includes("'idempotency_key' obrigatória")
      );
    });

    await t2.test("10. saveTask: Rejeita tarefa sem 'received_at' (sem fallback)", () => {
      const bad = { ...validTask, task_id: 'TASK_NO_REC_AT', received_at: undefined as any };
      assert.throws(
        () => store.saveTask(bad),
        (err: any) => err.message.includes("'received_at'")
      );
    });

    await t2.test("11. saveTask: Rejeita tarefa sem 'version' (sem fallback || 1)", () => {
      const bad = { ...validTask, task_id: 'TASK_NO_VER', version: undefined as any };
      assert.throws(
        () => store.saveTask(bad),
        (err: any) => err.message.includes("'version' obrigatória")
      );
    });

    await t2.test("12. saveTask: Rejeita tarefa sem 'input_snapshot_sha256' válido de 64 hex", () => {
      const bad = { ...validTask, task_id: 'TASK_BAD_SNAP', input_snapshot_sha256: 'short_hash' };
      assert.throws(
        () => store.saveTask(bad),
        (err: any) => err.message.includes("'input_snapshot_sha256' obrigatório")
      );
    });

    store.saveTask(validTask);

    await t2.test('13. updateTask: Rejeita alteração de idempotency_key', () => {
      const modified = { ...validTask, idempotency_key: 'altered_idemp_key' };
      assert.throws(
        () => store.updateTask(modified),
        (err: any) => err.message.includes('idempotency_key')
      );
    });

    await t2.test('14. updateTask: Rejeita alteração de received_at', () => {
      const modified = { ...validTask, received_at: new Date(Date.now() + 10000).toISOString() };
      assert.throws(
        () => store.updateTask(modified),
        (err: any) => err.message.includes('received_at')
      );
    });

    await t2.test('15. updateTask: Rejeita regressão de versão (ex: v2 -> v1)', () => {
      const v2 = { ...validTask, version: 2, status: 'APPROVED' as any };
      store.updateTask(v2);

      const regress = { ...validTask, version: 1 };
      assert.throws(
        () => store.updateTask(regress),
        (err: any) => err.message.includes('redução de versão proibida')
      );
    });

    await t2.test('16. updateTask: Rejeita salto de versão superior a 1 (ex: v2 -> v4)', () => {
      const jump = { ...validTask, version: 4 };
      assert.throws(
        () => store.updateTask(jump),
        (err: any) => err.message.includes('salto de versão injustificado proibido')
      );
    });

    await t2.test("17. saveOutput: Rejeita output sem 'file_bytes_sha256' de 64 caracteres hex", () => {
      const buf = Buffer.from('hello world');
      assert.throws(
        () => store.saveOutput({
          output_id: 'OUT_001',
          task_id: validTask.task_id,
          version: 1,
          file_name: 'test.pdf',
          file_path: '/tmp/test.pdf',
          file_bytes: buf,
          file_bytes_sha256: undefined
        }),
        (err: any) => err.message.includes("'file_bytes_sha256' obrigatório")
      );
    });

    await t2.test('18. saveOutput: Rejeita output com SHA-256 divergente dos bytes reais', () => {
      const buf = Buffer.from('conteúdo verdadeiro');
      const fakeSha = 'b'.repeat(64);
      assert.throws(
        () => store.saveOutput({
          output_id: 'OUT_002',
          task_id: validTask.task_id,
          version: 1,
          file_name: 'test2.pdf',
          file_path: '/tmp/test2.pdf',
          file_bytes: buf,
          file_bytes_sha256: fakeSha
        }),
        (err: any) => err.message.includes('SHA-256 divergente para output')
      );
    });

    store.close();
  });

  // =========================================================================
  // PILAR 3: MANIFESTO RELACIONAL E VERIFICAÇÃO BIDIRECIONAL (14 testes)
  // =========================================================================
  await t.test('Pilar 3 — Manifesto Relacional e Verificação Bidirecional (14 testes)', async (t3) => {
    const p3DbPath = path.join(tmpDir, 'manifest_relational.db');
    const store = new TransactionalPilotStore(p3DbPath, 'SIMULATION');
    const tokenService = new TokenService('dev-secret-at-least-32-chars-long-test-suite', path.join(tmpDir, 'tok_p3.db'));
    const engine = new ControlledPilotEngine(store, tokenService);

    const pilotId = 'PILOT_MANIFEST_TEST';
    const tenantId = 'TENANT_MANIFEST_TEST';
    const pilotConfig: PilotProgram = {
      pilot_id: pilotId,
      tenant_id: tenantId,
      organization_name: 'Manifest Test Org',
      authorized_by: 'Conselho',
      authorized_at: new Date().toISOString(),
      authorization_reference: 'AUTH_MAN_001',
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 86400000).toISOString(),
      selected_employee_ids: [66],
      allowed_data_categories: ['FINANCE'],
      prohibited_data_categories: [],
      allowed_connectors: [],
      prohibited_actions: [],
      human_reviewers: ['rev_manifest'],
      task_limit: 10,
      status: 'ACTIVE',
      execution_mode: 'SIMULATION',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    engine.createPilot(pilotConfig);
    engine.authorizePilot(pilotId, pilotConfig.authorization_reference, pilotConfig.authorized_by, pilotConfig.authorized_at);
    engine.activatePilot(pilotId);

    const taskDef: PilotTaskRequest = {
      task_id: 'TASK_MAN_001',
      pilot_id: pilotId,
      tenant_id: tenantId,
      employee_id: 66,
      requested_by: 'gestor_manifest',
      received_at: new Date().toISOString(),
      title: 'Tarefa Manifesto Relacional',
      instruction: 'Gerar relatorio PDF',
      input_data: { relatorio: 'mensal' },
      idempotency_key: 'idemp_man_001',
      format: 'PDF',
      execution_mode: 'SIMULATION'
    };

    engine.executeTask(taskDef);

    const challenge = store.getPendingChallengeForTask(taskDef.task_id)!;
    assert.ok(challenge, 'Desafio deve existir');
    const reviewerKey = 'SIMULATION_PILOT_DEV_REVIEW_KEY';
    const eventSignedAt = new Date().toISOString();
    const reviewerSig = PilotExternalValidator.generateCanonicalChallengeSignature(
      challenge,
      'rev_manifest',
      'APPROVED',
      reviewerKey,
      eventSignedAt
    );

    engine.reviewTask({
      review_id: 'REV_TASK_MAN_001',
      task_id: taskDef.task_id,
      challenge_id: challenge.challenge_id,
      reviewer: 'rev_manifest',
      decision: 'APPROVED',
      comments: 'Aprovado para teste relacional',
      signature: reviewerSig,
      event_signed_at: eventSignedAt
    });

    engine.deliverTask({
      taskId: taskDef.task_id,
      deliveredTo: 'auditoria@empresa.pt',
      channel: 'LOCAL_EXPORT'
    });

    const createBaseExport = (exportDirName: string) => {
      const outDir = path.join(tmpDir, exportDirName);
      if (fs.existsSync(outDir)) fs.rmSync(outDir, { recursive: true, force: true });
      engine.exportPilotEvidence(pilotId, outDir);
      return outDir;
    };

    await t3.test('19. exportPilotEvidence: Rejeita recibo de validação com JSON corrompido', () => {
      const outDir = createBaseExport('test_19');
      const valFiles = fs.readdirSync(path.join(outDir, 'document-validation-receipts'));
      assert.ok(valFiles.length > 0);
      fs.writeFileSync(path.join(outDir, 'document-validation-receipts', valFiles[0]), 'INVALID_JSON{{{');

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => err.message.includes('contém JSON inválido')
      );
    });

    await t3.test('20. exportPilotEvidence: Rejeita recibo de validação sem document_version', () => {
      const outDir = createBaseExport('test_20');
      const valFiles = fs.readdirSync(path.join(outDir, 'document-validation-receipts'));
      const valPath = path.join(outDir, 'document-validation-receipts', valFiles[0]);
      const content = JSON.parse(fs.readFileSync(valPath, 'utf8'));
      delete content.document_version;
      fs.writeFileSync(valPath, JSON.stringify(content));

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => err.message.includes("'document_version' obrigatórios")
      );
    });

    await t3.test('21. exportPilotEvidence: Rejeita recibo de validação sem registo no SQLite', () => {
      const outDir = createBaseExport('test_21');
      const ghostPath = path.join(outDir, 'document-validation-receipts', 'VAL_GHOST.json');
      fs.writeFileSync(ghostPath, JSON.stringify({
        receipt_id: 'VAL_GHOST',
        task_id: 'TASK_GHOST',
        document_version: 1,
        validation_type: 'INTERNAL_STRUCTURAL_VALIDATION',
        result: 'PASS',
        validated_at: new Date().toISOString()
      }));

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => err.message.includes('não possui registo correspondente no SQLite')
      );
    });

    await t3.test('22. exportPilotEvidence: Rejeita recibo de tarefa com JSON corrompido', () => {
      const outDir = createBaseExport('test_22');
      fs.writeFileSync(path.join(outDir, 'task-receipts', 'TASK_MAN_001.json'), 'BAD_JSON_NOT_VALID');

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => err.message.includes('contém JSON inválido')
      );
    });

    await t3.test('23. exportPilotEvidence: Rejeita recibo de tarefa sem version (sem fallback para 1)', () => {
      const outDir = createBaseExport('test_23');
      const taskPath = path.join(outDir, 'task-receipts', 'TASK_MAN_001.json');
      const content = JSON.parse(fs.readFileSync(taskPath, 'utf8'));
      delete content.version;
      fs.writeFileSync(taskPath, JSON.stringify(content));

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => err.message.includes("'version' obrigatórios")
      );
    });

    await t3.test('24. exportPilotEvidence: Rejeita recibo de tarefa sem registo no SQLite', () => {
      const outDir = createBaseExport('test_24');
      const ghostTaskPath = path.join(outDir, 'task-receipts', 'TASK_GHOST.json');
      fs.writeFileSync(ghostTaskPath, JSON.stringify({
        task_id: 'TASK_GHOST',
        version: 1,
        status: 'COMPLETED'
      }));

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => err.message.includes('não possui registo correspondente no SQLite')
      );
    });

    await t3.test('25. exportPilotEvidence: Rejeita recibo de tarefa com versão divergente do SQLite', () => {
      const outDir = createBaseExport('test_25');
      const taskPath = path.join(outDir, 'task-receipts', 'TASK_MAN_001.json');
      const content = JSON.parse(fs.readFileSync(taskPath, 'utf8'));
      content.version = 99;
      fs.writeFileSync(taskPath, JSON.stringify(content));

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => /Versão divergente para tarefa|Divergência.*version|adulterado/i.test(err.message)
      );
    });

    await t3.test('26. exportPilotEvidence: Rejeita recibo de revisão com JSON corrompido', () => {
      const outDir = createBaseExport('test_26');
      fs.writeFileSync(path.join(outDir, 'review-receipts', 'REV_TASK_MAN_001.json'), 'INVALID_REV_JSON');

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => err.message.includes('contém JSON inválido')
      );
    });

    await t3.test('27. exportPilotEvidence: Rejeita recibo de revisão sem registo no SQLite', () => {
      const outDir = createBaseExport('test_27');
      const ghostRev = path.join(outDir, 'review-receipts', 'REV_GHOST.json');
      fs.writeFileSync(ghostRev, JSON.stringify({
        review_id: 'REV_GHOST',
        task_id: 'TASK_MAN_001',
        reviewer: 'rev_ghost'
      }));

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => err.message.includes('não possui registo correspondente no SQLite')
      );
    });

    await t3.test('28. exportPilotEvidence: Rejeita recibo de entrega com JSON corrompido', () => {
      const outDir = createBaseExport('test_28');
      const delivFiles = fs.readdirSync(path.join(outDir, 'delivery-receipts'));
      assert.ok(delivFiles.length > 0);
      fs.writeFileSync(path.join(outDir, 'delivery-receipts', delivFiles[0]), 'BAD_DELIVERY_JSON');

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => err.message.includes('contém JSON inválido')
      );
    });

    await t3.test('29. exportPilotEvidence: Rejeita recibo de entrega sem registo no SQLite', () => {
      const outDir = createBaseExport('test_29');
      const ghostDeliv = path.join(outDir, 'delivery-receipts', 'DELIV_GHOST.json');
      fs.writeFileSync(ghostDeliv, JSON.stringify({
        delivery_id: 'DELIV_GHOST',
        task_id: 'TASK_MAN_001'
      }));

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => err.message.includes('não possui registo correspondente no SQLite')
      );
    });

    await t3.test('30. exportPilotEvidence: Rejeita ficheiro em task-outputs/ sem registo no SQLite', () => {
      const outDir = createBaseExport('test_30');
      fs.writeFileSync(path.join(outDir, 'task-outputs', 'unmapped_output.pdf'), '%PDF-1.4 unmapped');

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => err.message.includes('não tem registo correspondente no SQLite')
      );
    });

    await t3.test('31. exportPilotEvidence: Rejeita ficheiro em task-outputs/ com hash divergente do SQLite', () => {
      const outDir = createBaseExport('test_31');
      const outFiles = fs.readdirSync(path.join(outDir, 'task-outputs'));
      assert.ok(outFiles.length > 0);
      fs.writeFileSync(path.join(outDir, 'task-outputs', outFiles[0]), Buffer.from('TAMPERED_OUTPUT_BYTES'));

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => /Hash divergente entre filesystem e SQLite|Divergência entre ficheiro em disco e BLOB SQLite|Divergência entre coluna file_bytes_sha256 SQLite e ficheiro em disco/i.test(err.message)
      );
    });

    await t3.test('32. exportPilotEvidence: Verificação bidirecional reversa detecta registo SQLite sem ficheiro físico no filesystem', () => {
      const outDir = createBaseExport('test_32');
      fs.unlinkSync(path.join(outDir, 'task-receipts', 'TASK_MAN_001.json'));

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, outDir),
        (err: any) => err.message.includes('Verificação bidirecional falhou: tarefa SQLite')
      );
    });

    store.close();
  });
});


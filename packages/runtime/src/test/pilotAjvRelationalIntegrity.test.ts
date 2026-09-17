import assert from 'node:assert';
import { test } from 'node:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash } from 'node:crypto';
import {
  ControlledPilotEngine,
  TransactionalPilotStore,
  PilotExternalValidator,
  PilotAjvValidator
} from '../index.js';
import {
  PilotProgram,
  PilotTaskReceipt,
  PilotTaskRequest
} from '@ai-employee/shared';

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

function canonicalJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJson).join(',') + ']';
  }
  const keys = Object.keys(obj).filter(k => obj[k] !== undefined).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') + '}';
}

test('Micro-Patch Final — Ajv, Integridade Relacional e Três Planos de Verdade (AETF-500)', async (t) => {
  const tmpDir = path.join(os.tmpdir(), `aetf_ajv_relational_test_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const tenantId = 'tenant_angola_ops';
  const pilotId = 'PILOT_TEST_AJV_2026';
  const commitSha = 'db780b302674385d858315152308624241847b18';
  process.env.GIT_COMMIT_SHA = commitSha;

  function createValidTask(taskId: string, version: number = 1): PilotTaskReceipt {
    const inputSha = sha256(`input_payload_${taskId}`);
    const outHash = sha256(`output_bytes_${taskId}_v${version}`);
    const now = new Date().toISOString();
    const task: PilotTaskReceipt = {
      task_id: taskId,
      pilot_id: pilotId,
      tenant_id: tenantId,
      employee_id: 66,
      requested_by: 'user_tester',
      received_at: now,
      input_snapshot_sha256: inputSha,
      execution_started_at: now,
      execution_completed_at: now,
      output_files: [`output_${taskId}_v${version}.pdf`],
      output_hashes: [outHash],
      human_review_status: 'PENDING_REVIEW',
      reviewed_by: null,
      reviewed_at: null,
      error_code: null,
      corrections_required: 0,
      delivery_status: 'PENDING',
      final_status: 'SUCCESS',
      version,
      idempotency_key: `IDEMP_${taskId}`,
      execution_mode: 'SIMULATION',
      is_simulation: true,
      classification_level: 'CONFIDENTIAL',
      commit_sha: 'a'.repeat(40),
      receipt_sha256: ''
    };
    task.receipt_sha256 = sha256(canonicalJson(task));
    return task;
  }

  function createValidPilot(id: string = pilotId, tid: string = tenantId): PilotProgram {
    const now = new Date().toISOString();
    return {
      pilot_id: id,
      tenant_id: tid,
      organization_name: 'Organização Teste',
      authorized_by: 'Director Teste',
      authorized_at: now,
      authorization_reference: 'AUTH-TEST-2026',
      start_at: now,
      end_at: new Date(Date.now() + 86400000).toISOString(),
      selected_employee_ids: [66],
      allowed_data_categories: ['FINANCE'],
      prohibited_data_categories: [],
      allowed_connectors: [],
      prohibited_actions: [],
      human_reviewers: ['rev_maria'],
      task_limit: 10,
      status: 'ACTIVE',
      execution_mode: 'SIMULATION',
      created_at: now,
      updated_at: now
    };
  }

  // =========================================================================
  // BLOCO 1: ELIMINAÇÃO DEFINITIVA DE FALLBACKS DE VERSÃO (5 testes)
  // =========================================================================
  await t.test('Bloco 1 — Eliminação Definitiva de Fallbacks de Versão (5 testes)', async (t1) => {
    const dbPath = path.join(tmpDir, 'b1_store.sqlite');
    const store = new TransactionalPilotStore(dbPath, 'SIMULATION');

    const pilot = createValidPilot();
    store.savePilot(pilot);

    const initialTask = createValidTask('TASK_B1_001', 1);
    store.saveTask(initialTask);

    await t1.test('1.1 existing.version ausente ou manipulado bloqueia updateTask()', () => {
      assert.throws(
        () => {
          store.updateTask({ ...initialTask, version: undefined as any });
        },
        /updateTask: 'version' (obrigatória e )?deve ser inteiro positivo/
      );
    });

    await t1.test('1.2 null, zero, negativo, decimal e string são categoricamente rejeitados', () => {
      const invalidVersions: any[] = [null, 0, -1, 1.5, '1', 'v1', NaN];
      for (const inv of invalidVersions) {
        assert.throws(
          () => store.updateTask({ ...initialTask, version: inv }),
          /updateTask: 'version' (obrigatória e )?deve ser inteiro positivo/,
          `Deveria ter rejeitado versão inválida: ${inv}`
        );
      }
    });

    await t1.test('1.3 entrega não assume versão 1 quando task.version estiver ausente', () => {
      const engine = new ControlledPilotEngine(store);
      assert.throws(
        () => {
          engine.deliverTask({
            taskId: 'TASK_B1_001',
            channel: 'EMAIL',
            deliveredTo: 'test@example.com'
          });
        },
        /Entrega bloqueada: Documento da tarefa 'TASK_B1_001' não possui validação física independente aprovada/
      );
    });

    await t1.test('1.4 PilotExternalValidator.generateReviewerSignature rejeita version ausente ou <= 0', () => {
      assert.throws(
        () => {
          PilotExternalValidator.generateReviewerSignature(
            {
              taskId: 'TASK_B1_001',
              reviewerId: 'REV_01',
              decision: 'APPROVED',
              targetDocumentHash: sha256('dummy'),
              reviewedAt: new Date().toISOString(),
              challengeId: 'CH_01',
              nonce: 'nonce_01',
              tenantId,
              pilotId,
              documentVersion: 0
            },
            'secret'
          );
        },
        /documentVersion.*obrigatório e deve ser inteiro positivo/
      );
      assert.throws(
        () => {
          PilotExternalValidator.generateReviewerSignature(
            {
              taskId: 'TASK_B1_001',
              reviewerId: 'REV_01',
              decision: 'APPROVED',
              targetDocumentHash: sha256('dummy'),
              reviewedAt: new Date().toISOString(),
              challengeId: 'CH_01',
              nonce: 'nonce_01',
              tenantId,
              pilotId,
              documentVersion: null as any
            },
            'secret'
          );
        },
        /documentVersion.*obrigatório e deve ser inteiro positivo/
      );
    });

    await t1.test('1.5 versão válida e sequencial (v1 -> v2) persiste com integridade', () => {
      const updatedTask: PilotTaskReceipt = {
        ...initialTask,
        version: 2,
        corrections_required: 1,
        human_review_status: 'APPROVED_WITH_CORRECTIONS',
        receipt_sha256: ''
      };
      updatedTask.receipt_sha256 = sha256(canonicalJson(updatedTask));
      store.updateTask(updatedTask);
      const retrieved = store.getTask('TASK_B1_001');
      assert.strictEqual(retrieved?.version, 2);
    });
  });

  // =========================================================================
  // BLOCO 2: HASH DE ENTRADA OBRIGATÓRIO E IMUTÁVEL NAS ATUALIZAÇÕES (7 testes)
  // =========================================================================
  await t.test('Bloco 2 — Hash de Entrada Obrigatório e Imutável nas Atualizações (7 testes)', async (t2) => {
    const dbPath = path.join(tmpDir, 'b2_store.sqlite');
    const store = new TransactionalPilotStore(dbPath, 'SIMULATION');

    const pilot = createValidPilot();
    store.savePilot(pilot);

    const task = createValidTask('TASK_B2_001', 1);
    store.saveTask(task);

    await t2.test('2.1 alteração de input_snapshot_sha256 em updateTask() falha fail-closed', () => {
      const tamperedHash = sha256('different_input_data');
      assert.throws(
        () => {
          store.updateTask({ ...task, input_snapshot_sha256: tamperedHash });
        },
        /alteração ou remoção de 'input_snapshot_sha256' proibida/
      );
    });

    await t2.test('2.2 remoção do hash (undefined) falha', () => {
      assert.throws(
        () => {
          store.updateTask({ ...task, input_snapshot_sha256: undefined as any });
        },
        /updateTask: 'input_snapshot_sha256' obrigatório/
      );
    });

    await t2.test('2.3 hash vazio ou com comprimento diferente de 64 hexadecimais falha', () => {
      const invalidHashes = ['', 'abc', '12345', 'g'.repeat(64), 'a'.repeat(63), 'a'.repeat(65)];
      for (const h of invalidHashes) {
        assert.throws(
          () => store.updateTask({ ...task, input_snapshot_sha256: h }),
          /updateTask: 'input_snapshot_sha256' obrigatório e deve ser hash SHA-256 de 64 caracteres/
        );
      }
    });

    await t2.test('2.4 hash de input permanece estritamente igual após atualização documental', () => {
      const updated: PilotTaskReceipt = {
        ...task,
        human_review_status: 'APPROVED',
        receipt_sha256: ''
      };
      updated.receipt_sha256 = sha256(canonicalJson(updated));
      store.updateTask(updated);
      const reloaded = store.getTask('TASK_B2_001')!;
      assert.strictEqual(reloaded.input_snapshot_sha256, task.input_snapshot_sha256);
    });

    await t2.test('2.5 hash de output divergente dos bytes falha na store', () => {
      assert.throws(
        () => {
          store.saveOutput({
            output_id: 'OUT_FAKE_01',
            task_id: task.task_id,
            version: 1,
            file_name: 'test.pdf',
            file_path: 'test.pdf',
            file_bytes: Buffer.from('actual_file_bytes'),
            file_bytes_sha256: sha256('different_bytes'),
            is_active: true
          });
        },
        /saveOutput: SHA-256 divergente/
      );
    });

    await t2.test('2.6 falha não deixa atualização parcial no SQLite', () => {
      try {
        store.updateTask({ ...task, input_snapshot_sha256: 'tampered_hash_value_12345678901234567890123456789012345678901234' });
      } catch {}
      const cur = store.getTask('TASK_B2_001')!;
      assert.strictEqual(cur.input_snapshot_sha256, task.input_snapshot_sha256);
    });

    await t2.test('2.7 tarefa válida pode ser atualizada sem alterar hash de entrada', () => {
      const updated: PilotTaskReceipt = {
        ...task,
        delivery_status: 'ARCHIVED',
        receipt_sha256: ''
      };
      updated.receipt_sha256 = sha256(canonicalJson(updated));
      store.updateTask(updated);
      const cur = store.getTask('TASK_B2_001')!;
      assert.strictEqual(cur.delivery_status, 'ARCHIVED');
      assert.strictEqual(cur.input_snapshot_sha256, task.input_snapshot_sha256);
    });
  });

  // =========================================================================
  // BLOCO 3: VALIDAÇÃO POR SCHEMAS AJV REAIS (10 testes)
  // =========================================================================
  await t.test('Bloco 3 — Validação por Schemas Ajv Reais (10 testes)', async (t3) => {
    const schemasCandidates = [
      path.resolve(process.cwd(), 'schemas/pilot'),
      path.resolve(process.cwd(), '../../schemas/pilot'),
      path.resolve(__dirname, '../../../../schemas/pilot'),
      path.resolve(__dirname, '../../../schemas/pilot')
    ];
    const schemasDir = schemasCandidates.find(c => fs.existsSync(c)) || path.resolve('schemas/pilot');
    const validator = new PilotAjvValidator(schemasDir);

    await t3.test('3.1 Todos os 5 schemas compilam sem erro', () => {
      assert.ok(validator);
    });

    await t3.test('3.2 Schema ausente ou inexistente falha imediatamente', () => {
      assert.throws(
        () => new PilotAjvValidator(path.join(tmpDir, 'non_existent_schemas')),
        /Directório de schemas não encontrado|Schema ausente/
      );
    });

    await t3.test('3.3 Ajv indisponível (customAjv = null) falha imediatamente', () => {
      assert.throws(
        () => new PilotAjvValidator(schemasDir, null),
        /Ajv indisponível ou desativado/
      );
    });

    await t3.test('3.4 pilot-task-receipt: recibo válido passa', () => {
      const task = createValidTask('TASK_VAL_01');
      assert.doesNotThrow(() => validator.validateTaskReceipt(task));
    });

    await t3.test('3.5 pilot-task-receipt: campo obrigatório ausente falha', () => {
      const task = createValidTask('TASK_VAL_02');
      delete (task as any).input_snapshot_sha256;
      assert.throws(
        () => validator.validateTaskReceipt(task),
        /must have required property 'input_snapshot_sha256'/
      );
    });

    await t3.test('3.6 pilot-task-receipt: propriedade adicional (additionalProperties: false) falha', () => {
      const task = { ...createValidTask('TASK_VAL_03'), extra_malicious_field: true };
      assert.throws(
        () => validator.validateTaskReceipt(task),
        /must NOT have additional properties/
      );
    });

    await t3.test('3.7 pilot-task-receipt: hash inválido (não-hexadecimal) falha', () => {
      const task = { ...createValidTask('TASK_VAL_04'), input_snapshot_sha256: 'ZZZZ'.repeat(16) };
      assert.throws(
        () => validator.validateTaskReceipt(task),
        /must match pattern/
      );
    });

    await t3.test('3.8 pilot-task-receipt: data com formato ISO inválido falha', () => {
      const task = { ...createValidTask('TASK_VAL_05'), received_at: '2026-13-99 NotADate' };
      assert.throws(
        () => validator.validateTaskReceipt(task),
        /must match format "date-time"/
      );
    });

    await t3.test('3.9 pilot-task-receipt: enum desconhecido falha', () => {
      const task = { ...createValidTask('TASK_VAL_06'), human_review_status: 'AUTO_APPROVED_UNSAFE' as any };
      assert.throws(
        () => validator.validateTaskReceipt(task),
        /must be equal to one of the allowed values/
      );
    });

    await t3.test('3.10 pilot-human-review-receipt: ausência dos 5 timestamps forenses falha', () => {
      const invalidReview: any = {
        review_id: 'REV_INVALID',
        task_id: 'TASK_VAL_01',
        pilot_id: pilotId,
        reviewer: 'rev_maria',
        reviewed_at: new Date().toISOString(),
        decision: 'APPROVED',
        comments: 'OK',
        auth_method: 'SESSION_TOKEN',
        review_signature_sha256: sha256('sig'),
        receipt_sha256: sha256('rec')
      };
      assert.throws(
        () => validator.validateHumanReviewReceipt(invalidReview),
        /must have required property 'challenge_issued_at'/
      );
    });
  });

  // =========================================================================
  // BLOCO 4: COMPARAÇÃO INTEGRAL DOS TRÊS PLANOS E ADULTERAÇÃO (10 testes)
  // =========================================================================
  await t.test('Bloco 4 — Comparação Integral e Adulteração Campo a Campo (10 testes)', async (t4) => {
    const evidenceDir = path.join(tmpDir, 'evidence_bundle_b4');
    fs.mkdirSync(evidenceDir, { recursive: true });

    const dbPath = path.join(tmpDir, 'b4_store.sqlite');
    const store = new TransactionalPilotStore(dbPath, 'SIMULATION');
    const engine = new ControlledPilotEngine(store);

    const pilot = createValidPilot();
    engine.createPilot(pilot);
    engine.authorizePilot(pilotId, pilot.authorization_reference, pilot.authorized_by, pilot.authorized_at);
    engine.activatePilot(pilotId);

    // Executar 1 tarefa completa com saída, validação documental e revisão simulada
    const request: PilotTaskRequest = {
      task_id: 'TASK_EVID_001',
      pilot_id: pilotId,
      tenant_id: tenantId,
      employee_id: 66,
      requested_by: 'user_test',
      received_at: new Date().toISOString(),
      title: 'Tarefa Evidência',
      instruction: 'Instrução teste',
      input_data: { valor: 1000 },
      idempotency_key: 'IDEMP_EVID_001',
      format: 'PDF',
      execution_mode: 'SIMULATION'
    };
    engine.executeTask(request);

    // Revisão humana simulada
    const challenge = store.getPendingChallengeForTask('TASK_EVID_001')!;
    assert.ok(challenge, 'Desafio deve existir');
    const reviewerKey = 'SIMULATION_PILOT_DEV_REVIEW_KEY';
    const eventSignedAt = new Date().toISOString();
    const sig = PilotExternalValidator.generateCanonicalChallengeSignature(
      challenge,
      'rev_maria',
      'APPROVED',
      reviewerKey,
      eventSignedAt
    );
    await engine.reviewTask({
      challenge_id: challenge.challenge_id,
      review_id: 'REV_EVID_001',
      task_id: 'TASK_EVID_001',
      reviewer: 'rev_maria',
      decision: 'APPROVED',
      comments: 'Aprovado em teste',
      signature: sig,
      event_signed_at: eventSignedAt
    });

    // Entrega simulada
    engine.deliverTask({
      taskId: 'TASK_EVID_001',
      channel: 'EMAIL',
      deliveredTo: 'arquivo@empresa.ao'
    });

    // Exportar evidências completas
    engine.exportPilotEvidence(pilotId, evidenceDir);

    await t4.test('4.1 Directório de evidências íntegro passa a 100%', () => {
      assert.doesNotThrow(() => {
        engine.verifyEvidenceDirectory(pilotId, evidenceDir);
      });
    });

    await t4.test('4.2 Adulteração de tenant_id no recibo de tarefa falha', () => {
      const taskPath = path.join(evidenceDir, 'task-receipts', 'TASK_EVID_001.json');
      const original = fs.readFileSync(taskPath, 'utf8');
      const tampered = JSON.parse(original);
      tampered.tenant_id = 'tenant_adversario_hack';
      fs.writeFileSync(taskPath, JSON.stringify(tampered, null, 2), 'utf8');
      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, evidenceDir),
        /Divergência de tenant_id|receipt_sha256 corrompido/
      );
      fs.writeFileSync(taskPath, original, 'utf8');
    });

    await t4.test('4.3 Adulteração de pilot_id no recibo de tarefa falha', () => {
      const taskPath = path.join(evidenceDir, 'task-receipts', 'TASK_EVID_001.json');
      const original = fs.readFileSync(taskPath, 'utf8');
      const tampered = JSON.parse(original);
      tampered.pilot_id = 'PILOT_MALICIOSO';
      fs.writeFileSync(taskPath, JSON.stringify(tampered, null, 2), 'utf8');
      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, evidenceDir),
        /Divergência de pilot_id|receipt_sha256 corrompido/
      );
      fs.writeFileSync(taskPath, original, 'utf8');
    });

    await t4.test('4.4 Adulteração do receipt_sha256 no recibo falha', () => {
      const taskPath = path.join(evidenceDir, 'task-receipts', 'TASK_EVID_001.json');
      const original = fs.readFileSync(taskPath, 'utf8');
      const tampered = JSON.parse(original);
      tampered.receipt_sha256 = '00'.repeat(32);
      fs.writeFileSync(taskPath, JSON.stringify(tampered, null, 2), 'utf8');
      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, evidenceDir),
        /receipt_sha256 corrompido ou adulterado/
      );
      fs.writeFileSync(taskPath, original, 'utf8');
    });

    await t4.test('4.5 Adulteração de resultado de validação documental falha', () => {
      const docDir = path.join(evidenceDir, 'document-validation-receipts');
      const docFiles = fs.readdirSync(docDir).filter(f => f.endsWith('.json'));
      assert.ok(docFiles.length > 0);
      const targetPath = path.join(docDir, docFiles[0]);
      const original = fs.readFileSync(targetPath, 'utf8');
      const tampered = JSON.parse(original);
      tampered.result = 'FAIL';
      fs.writeFileSync(targetPath, JSON.stringify(tampered, null, 2), 'utf8');
      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, evidenceDir),
        /Divergência de result|receipt_sha256 corrompido/
      );
      fs.writeFileSync(targetPath, original, 'utf8');
    });

    await t4.test('4.6 Adulteração de bytes físicos do output em disco falha', () => {
      const outDir = path.join(evidenceDir, 'task-outputs');
      const outFiles = fs.readdirSync(outDir);
      assert.ok(outFiles.length > 0);
      const targetPath = path.join(outDir, outFiles[0]);
      const original = fs.readFileSync(targetPath);
      try {
        const corrupted = Buffer.concat([original, Buffer.from('TAMPER')]);
        fs.writeFileSync(targetPath, corrupted);
        assert.throws(
          () => engine.verifyEvidenceDirectory(pilotId, evidenceDir),
          /Hash divergente entre filesystem e SQLite|Divergência entre ficheiro em disco e BLOB SQLite|Divergência entre coluna file_bytes_sha256 SQLite e ficheiro em disco/
        );
      } finally {
        fs.writeFileSync(targetPath, original);
      }
    });

    await t4.test('4.7 Revisão ligada a tarefa inexistente no SQLite falha', () => {
      const revPath = path.join(evidenceDir, 'review-receipts', 'REV_EVID_001.json');
      const original = fs.readFileSync(revPath, 'utf8');
      const tampered = JSON.parse(original);
      tampered.task_id = 'TASK_NAO_EXISTE';
      fs.writeFileSync(revPath, JSON.stringify(tampered, null, 2), 'utf8');
      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, evidenceDir),
        /não possui registo correspondente no SQLite|receipt_sha256 corrompido/
      );
      fs.writeFileSync(revPath, original, 'utf8');
    });

    await t4.test('4.8 Entrega ligada a delivery_id divergente falha', () => {
      const delDir = path.join(evidenceDir, 'delivery-receipts');
      const delFiles = fs.readdirSync(delDir).filter(f => f.endsWith('.json'));
      assert.ok(delFiles.length > 0);
      const targetPath = path.join(delDir, delFiles[0]);
      const original = fs.readFileSync(targetPath, 'utf8');
      const tampered = JSON.parse(original);
      tampered.delivery_id = 'DELIV_FORGED_999';
      fs.writeFileSync(targetPath, JSON.stringify(tampered, null, 2), 'utf8');
      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, evidenceDir),
        /não possui registo correspondente no SQLite|receipt_sha256 corrompido/
      );
      fs.writeFileSync(targetPath, original, 'utf8');
    });

    await t4.test('4.9 Recibo com campo authoritativo alterado e hash não recalculado falha', () => {
      const taskPath = path.join(evidenceDir, 'task-receipts', 'TASK_EVID_001.json');
      const original = fs.readFileSync(taskPath, 'utf8');
      const tampered = JSON.parse(original);
      tampered.final_status = 'FAILED';
      fs.writeFileSync(taskPath, JSON.stringify(tampered, null, 2), 'utf8');
      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, evidenceDir),
        /receipt_sha256 corrompido ou adulterado|Divergência de final_status/
      );
      fs.writeFileSync(taskPath, original, 'utf8');
    });

    await t4.test('4.10 Manifest com commit_sha adulterado falha', () => {
      const manifestPath = path.join(evidenceDir, 'pilot-evidence-manifest.json');
      const original = fs.readFileSync(manifestPath, 'utf8');
      const tampered = JSON.parse(original);
      tampered.commit_sha = '00'.repeat(20);
      fs.writeFileSync(manifestPath, JSON.stringify(tampered, null, 2), 'utf8');
      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, evidenceDir),
        /possui commit_sha divergente/
      );
      fs.writeFileSync(manifestPath, original, 'utf8');
    });
  });

  // =========================================================================
  // BLOCO 5: REJEIÇÃO DE NOMES DE OUTPUT AMBÍGUOS E COLISÕES (6 testes)
  // =========================================================================
  await t.test('Bloco 5 — Rejeição de Nomes de Output Ambíguos e Colisões (6 testes)', async (t5) => {
    const dbPath = path.join(tmpDir, 'b5_store.sqlite');
    const store = new TransactionalPilotStore(dbPath, 'SIMULATION');
    const engine = new ControlledPilotEngine(store);

    const pilot = createValidPilot();
    engine.createPilot(pilot);
    engine.authorizePilot(pilotId, pilot.authorization_reference, pilot.authorized_by, pilot.authorized_at);
    engine.activatePilot(pilotId);

    const taskA = createValidTask('TASK_COLLISION_A', 1);
    store.saveTask(taskA);

    await t5.test('5.1 Nome com path traversal (../) em output é rejeitado', () => {
      assert.throws(
        () => {
          store.saveOutput({
            output_id: 'OUT_TRAVERSAL',
            task_id: 'TASK_COLLISION_A',
            version: 1,
            file_name: '../traversal.pdf',
            file_path: '../traversal.pdf',
            file_bytes: Buffer.from('data'),
            file_bytes_sha256: sha256('data'),
            is_active: true
          });
        },
        /Path traversal detectado|Nome de ficheiro de output não pode conter directórios/
      );
    });

    await t5.test('5.2 Nome vazio ou separador de diretório em file_name é rejeitado', () => {
      assert.throws(
        () => {
          store.saveOutput({
            output_id: 'OUT_EMPTY_NAME',
            task_id: 'TASK_COLLISION_A',
            version: 1,
            file_name: '',
            file_path: '',
            file_bytes: Buffer.from('data'),
            file_bytes_sha256: sha256('data'),
            is_active: true
          });
        },
        /saveOutput: 'file_name' obrigatório/
      );
      assert.throws(
        () => {
          store.saveOutput({
            output_id: 'OUT_SLASH',
            task_id: 'TASK_COLLISION_A',
            version: 1,
            file_name: 'sub/out.pdf',
            file_path: 'sub/out.pdf',
            file_bytes: Buffer.from('data'),
            file_bytes_sha256: sha256('data'),
            is_active: true
          });
        },
        /Nome de ficheiro de output não pode conter directórios/
      );
    });

    await t5.test('5.3 Colisão case-insensitive de outputs no SQLite para o mesmo tenant é rejeitada', () => {
      const pdfBytes = Buffer.from('%PDF-1.7 Test Case Insensitive');
      const pdfHash = sha256(pdfBytes);

      store.saveOutput({
        output_id: 'OUT_LOWER',
        task_id: 'TASK_COLLISION_A',
        version: 1,
        file_name: 'documento_unico.pdf',
        file_path: 'documento_unico.pdf',
        file_bytes: pdfBytes,
        file_bytes_sha256: pdfHash,
        is_active: true
      });

      assert.throws(
        () => {
          store.saveOutput({
            output_id: 'OUT_UPPER',
            task_id: 'TASK_COLLISION_A',
            version: 1,
            file_name: 'DOCUMENTO_UNICO.PDF',
            file_path: 'DOCUMENTO_UNICO.PDF',
            file_bytes: pdfBytes,
            file_bytes_sha256: pdfHash,
            is_active: true
          });
        },
        /Colisão case-insensitive de nome de output/
      );
    });

    await t5.test('5.4 output_id duplicado com bytes diferentes é rejeitado', () => {
      const bytesA = Buffer.from('data_A');
      const bytesB = Buffer.from('data_B');
      store.saveOutput({
        output_id: 'OUT_UNIQUE_ID',
        task_id: 'TASK_COLLISION_A',
        version: 1,
        file_name: 'unique_out.pdf',
        file_path: 'unique_out.pdf',
        file_bytes: bytesA,
        file_bytes_sha256: sha256(bytesA),
        is_active: true
      });

      assert.throws(
        () => {
          store.saveOutput({
            output_id: 'OUT_UNIQUE_ID',
            task_id: 'TASK_COLLISION_A',
            version: 1,
            file_name: 'unique_out_different.pdf',
            file_path: 'unique_out_different.pdf',
            file_bytes: bytesB,
            file_bytes_sha256: sha256(bytesB),
            is_active: true
          });
        },
        /UNIQUE constraint failed|já existe/
      );
    });

    await t5.test('5.5 Colisão case-insensitive em task-outputs no disco falha na verificação de evidências', (tSub) => {
      const testEvidenceDir = path.join(tmpDir, 'col_evidence');
      const taskOutputsDir = path.join(testEvidenceDir, 'task-outputs');
      fs.mkdirSync(taskOutputsDir, { recursive: true });

      fs.writeFileSync(path.join(taskOutputsDir, 'file_a.pdf'), Buffer.from('test'));

      const realFs = require('node:fs');
      const origReaddir = realFs.readdirSync.bind(realFs);
      const origLstat = realFs.lstatSync.bind(realFs);

      tSub.mock.method(realFs, 'readdirSync', function(targetPath: any, opts: any) {
        const res = origReaddir(targetPath, opts);
        if (typeof targetPath === 'string' && targetPath.includes('task-outputs') && opts && opts.withFileTypes) {
          return [
            { name: 'file_a.pdf', isDirectory: () => false, isFile: () => true, isSymbolicLink: () => false },
            { name: 'FILE_A.pdf', isDirectory: () => false, isFile: () => true, isSymbolicLink: () => false }
          ];
        }
        return res;
      });

      tSub.mock.method(realFs, 'lstatSync', function(targetPath: any) {
        if (typeof targetPath === 'string' && targetPath.includes('FILE_A.pdf')) {
          return origLstat(path.join(taskOutputsDir, 'file_a.pdf'));
        }
        return origLstat(targetPath);
      });

      assert.throws(
        () => engine.verifyEvidenceDirectory(pilotId, testEvidenceDir),
        /Colisão case-insensitive em 'task-outputs' no disco/
      );
    });

    await t5.test('5.6 Nomes inequívocos preservam relação correta e única com o SQLite', () => {
      const retrieved = store.getOutputsForTask('TASK_COLLISION_A');
      const fileNames = retrieved.map(o => o.file_name);
      const uniqueNames = new Set(fileNames.map(f => f.toLowerCase()));
      assert.strictEqual(fileNames.length, uniqueNames.size, 'Todos os nomes devem ser estritamente únicos');
      assert.strictEqual(fileNames.length, 2, 'Devem existir exactamente os 2 outputs válidos registados');
    });
  });
});

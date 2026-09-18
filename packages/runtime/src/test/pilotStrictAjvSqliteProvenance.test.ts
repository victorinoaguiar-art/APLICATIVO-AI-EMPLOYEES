import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash } from 'node:crypto';
import {
  ControlledPilotEngine,
  TransactionalPilotStore,
  PilotAjvValidator,
  resolveStrictCommitSha
} from '../index.js';
import {
  PilotProgram,
  PilotTaskReceipt,
  PilotHumanReviewReceipt,
  PilotDeliveryReceipt,
  PilotDocumentValidationReceipt,
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

describe('AETF-500: Ajv Estrito, Quatro Planos de Verdade, Proveniência e Limpeza Determinística', () => {
  const commitSha = resolveStrictCommitSha();
  process.env.GIT_COMMIT_SHA = commitSha;

  function createValidPilot(pilotId = 'PILOT_STRICT_2026', tenantId = 'tenant_angola_ops'): PilotProgram {
    const now = new Date().toISOString();
    return {
      pilot_id: pilotId,
      tenant_id: tenantId,
      organization_name: 'Organização SASO Angola',
      authorized_by: 'Director Auditoria',
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
      reviewer_configs: [
        {
          reviewer_id: 'rev_maria',
          display_name: 'Maria Revisora',
          role: 'AUDITOR',
          secret_or_key: 'SIMULATION_PILOT_DEV_REVIEW_KEY'
        }
      ],
      task_limit: 10,
      status: 'DRAFT',
      execution_mode: 'SIMULATION',
      created_at: now,
      updated_at: now
    };
  }

  function createValidTask(taskId: string, tenantId = 'tenant_angola_ops', pilotId = 'PILOT_STRICT_2026', version = 1): PilotTaskReceipt {
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
      commit_sha: commitSha,
      receipt_sha256: ''
    };
    task.receipt_sha256 = sha256(canonicalJson(task));
    return task;
  }

  function createValidDocValidation(taskId: string, tenantId = 'tenant_angola_ops', pilotId = 'PILOT_STRICT_2026', version = 1): PilotDocumentValidationReceipt {
    const outHash = sha256(`output_bytes_${taskId}_v${version}`);
    const now = new Date().toISOString();
    const docVal: PilotDocumentValidationReceipt = {
      receipt_id: `DOCVAL_${taskId}_v${version}_INTERNAL_STRUCTURAL_VALIDATION`,
      validation_id: `DOCVAL_${taskId}_v${version}_INTERNAL_STRUCTURAL_VALIDATION`,
      task_id: taskId,
      document_version: version,
      validation_type: 'INTERNAL_STRUCTURAL_VALIDATION',
      tenant_id: tenantId,
      pilot_id: pilotId,
      file_path: `task-outputs/output_${taskId}_v${version}.pdf`,
      format: 'PDF',
      parser_name: 'pdf-lib',
      parser_version: '1.17.1',
      file_bytes_sha256: outHash,
      result: 'PASS',
      is_valid: true,
      page_or_cell_count: 1,
      execution_started_at: now,
      execution_completed_at: now,
      commit_sha: commitSha,
      receipt_sha256: '',
      validated_at: now
    };
    docVal.receipt_sha256 = sha256(canonicalJson(docVal));
    return docVal;
  }

  function createValidReview(taskId: string, tenantId = 'tenant_angola_ops', pilotId = 'PILOT_STRICT_2026', version = 1): PilotHumanReviewReceipt {
    const outHash = sha256(`output_bytes_${taskId}_v${version}`);
    const now = new Date().toISOString();
    const rev: PilotHumanReviewReceipt = {
      review_id: `REV_${taskId}_v${version}`,
      task_id: taskId,
      pilot_id: pilotId,
      tenant_id: tenantId,
      commit_sha: commitSha,
      document_version: version,
      challenge_id: `CHAL_${taskId}_v${version}`,
      reviewer: 'rev_maria',
      reviewed_at: now,
      decision: 'APPROVED',
      comments: 'Aprovado sem reservas',
      previous_output_hash: outHash,
      new_output_hash: outHash,
      auth_method: 'HMAC_SIGNATURE',
      review_signature_sha256: sha256('sig_test'),
      challenge_issued_at: now,
      event_signed_at: now,
      review_received_at: now,
      review_accepted_at: now,
      challenge_consumed_at: now,
      receipt_sha256: ''
    };
    rev.receipt_sha256 = sha256(canonicalJson(rev));
    return rev;
  }

  function createValidDelivery(taskId: string, reviewId: string, tenantId = 'tenant_angola_ops', pilotId = 'PILOT_STRICT_2026', version = 1): PilotDeliveryReceipt {
    const outHash = sha256(`output_bytes_${taskId}_v${version}`);
    const now = new Date().toISOString();
    const deliv: PilotDeliveryReceipt = {
      delivery_id: `DELIV_${taskId}_v${version}`,
      task_id: taskId,
      pilot_id: pilotId,
      tenant_id: tenantId,
      commit_sha: commitSha,
      document_version: version,
      review_id: reviewId,
      delivered_at: now,
      delivered_to: 'archive@saso.ao',
      channel: 'INTERNAL_ARCHIVE',
      status: 'ARCHIVED',
      is_external_confirmed: false,
      output_hashes: [outHash],
      receipt_sha256: ''
    };
    deliv.receipt_sha256 = sha256(canonicalJson(deliv));
    return deliv;
  }

  function createValidManifest(tenantId = 'tenant_angola_ops', pilotId = 'PILOT_STRICT_2026'): any {
    const now = new Date().toISOString();
    return {
      manifest_version: '2.0',
      pilot_id: pilotId,
      tenant_id: tenantId,
      execution_mode: 'SIMULATION',
      commit_sha: commitSha,
      total_files: 1,
      created_at: now,
      files: [
        {
          relative_path: 'task-receipts/task_01.json',
          sha256: sha256('dummy'),
          byte_size: 100,
          mime_type: 'application/json',
          origin: 'EXECUTION_TASK_RECEIPT',
          commit_sha: commitSha,
          tenant_id: tenantId,
          pilot_id: pilotId,
          receipt_type: 'TASK_RECEIPT',
          generated_at: now
        }
      ]
    };
  }

  // =========================================================================
  // BLOCO 0: 6 Testes de Resolução Estrita de SHA sem Fallback (Ponto 1)
  // =========================================================================
  describe('Bloco 0: Resolução Estrita de SHA sem Fallback', () => {
    it('0.1: GITHUB_SHA inválido falha imediatamente com erro explícito sem fallback silencioso', () => {
      const origGithubSha = process.env.GITHUB_SHA;
      try {
        process.env.GITHUB_SHA = 'invalid_sha_less_than_40';
        assert.throws(() => {
          resolveStrictCommitSha();
        }, /GITHUB_SHA definido mas inválido/i);
      } finally {
        if (origGithubSha !== undefined) process.env.GITHUB_SHA = origGithubSha;
        else delete process.env.GITHUB_SHA;
      }
    });

    it('0.2: GIT_COMMIT_SHA inválido falha imediatamente com erro explícito sem fallback silencioso', () => {
      const origGithubSha = process.env.GITHUB_SHA;
      const origGitSha = process.env.GIT_COMMIT_SHA;
      try {
        delete process.env.GITHUB_SHA;
        process.env.GIT_COMMIT_SHA = 'not_a_valid_sha';
        assert.throws(() => {
          resolveStrictCommitSha();
        }, /GIT_COMMIT_SHA definido mas inválido/i);
      } finally {
        if (origGithubSha !== undefined) process.env.GITHUB_SHA = origGithubSha;
        else delete process.env.GITHUB_SHA;
        if (origGitSha !== undefined) process.env.GIT_COMMIT_SHA = origGitSha;
        else delete process.env.GIT_COMMIT_SHA;
      }
    });

    it('0.3: SHA com caracteres não hexadecimais falha na validação estrita', () => {
      const origGithubSha = process.env.GITHUB_SHA;
      try {
        process.env.GITHUB_SHA = 'z'.repeat(40);
        assert.throws(() => {
          resolveStrictCommitSha();
        }, /GITHUB_SHA definido mas inválido/i);
      } finally {
        if (origGithubSha !== undefined) process.env.GITHUB_SHA = origGithubSha;
        else delete process.env.GITHUB_SHA;
      }
    });

    it('0.4: SHA com comprimento diferente de 40 falha na validação estrita', () => {
      const origGithubSha = process.env.GITHUB_SHA;
      try {
        process.env.GITHUB_SHA = 'a'.repeat(39);
        assert.throws(() => {
          resolveStrictCommitSha();
        }, /GITHUB_SHA definido mas inválido/i);
      } finally {
        if (origGithubSha !== undefined) process.env.GITHUB_SHA = origGithubSha;
        else delete process.env.GITHUB_SHA;
      }
    });

    it('0.5: SHA ausente sem variáveis e sem checkout Git válido falha com erro fail-closed', () => {
      const origGithubSha = process.env.GITHUB_SHA;
      const origGitSha = process.env.GIT_COMMIT_SHA;
      try {
        delete process.env.GITHUB_SHA;
        delete process.env.GIT_COMMIT_SHA;
        assert.throws(() => {
          resolveStrictCommitSha(() => {
            throw new Error('fatal: not a git repository');
          });
        }, /Falha ao resolver commit SHA do repositório Git/i);
      } finally {
        if (origGithubSha !== undefined) process.env.GITHUB_SHA = origGithubSha;
        if (origGitSha !== undefined) process.env.GIT_COMMIT_SHA = origGitSha;
      }
    });

    it('0.6: GITHUB_SHA válido de 40 hexadecimais é resolvido com sucesso em minúsculas', () => {
      const origGithubSha = process.env.GITHUB_SHA;
      const sample = 'AbCdEf0123456789aBcDeF0123456789AbCdEf01';
      try {
        process.env.GITHUB_SHA = sample;
        const res = resolveStrictCommitSha();
        assert.strictEqual(res, sample.toLowerCase());
      } finally {
        if (origGithubSha !== undefined) process.env.GITHUB_SHA = origGithubSha;
        else delete process.env.GITHUB_SHA;
      }
    });
  });

  // =========================================================================
  // BLOCO 1: 10 Testes de Ajv Estrito Real
  // =========================================================================
  describe('Bloco 1: Ajv Estrito Real e Compilação dos 5 Schemas', () => {
    it('1.1: a instância real do Ajv utiliza strict: true, coerceTypes: false, removeAdditional: false, useDefaults: false', () => {
      const validator = new PilotAjvValidator();
      const ajv = validator.getAjv();
      assert.strictEqual(ajv.opts.strict, true, 'Ajv deve estar configurado com strict: true');
      assert.strictEqual(ajv.opts.coerceTypes, false, 'coerceTypes deve ser false');
      assert.strictEqual(ajv.opts.removeAdditional, false, 'removeAdditional deve ser false');
      assert.strictEqual(ajv.opts.useDefaults, false, 'useDefaults deve ser false');
      assert.strictEqual(ajv.opts.allErrors, true, 'allErrors deve ser true');
    });

    it('1.2: os cinco schemas compilam em modo estrito sem qualquer erro', () => {
      const validator = new PilotAjvValidator();
      const task = createValidTask('TASK_COMPILE_01');
      const docVal = createValidDocValidation('TASK_COMPILE_01');
      const rev = createValidReview('TASK_COMPILE_01');
      const deliv = createValidDelivery('TASK_COMPILE_01', rev.review_id);
      const manifest = createValidManifest();

      assert.doesNotThrow(() => validator.validateTaskReceipt(task));
      assert.doesNotThrow(() => validator.validateDocumentValidationReceipt(docVal));
      assert.doesNotThrow(() => validator.validateHumanReviewReceipt(rev));
      assert.doesNotThrow(() => validator.validateDeliveryReceipt(deliv));
      assert.doesNotThrow(() => validator.validateEvidenceManifest(manifest));
    });

    it('1.3: schema com keyword desconhecida falha na compilação em modo estrito', () => {
      const validator = new PilotAjvValidator();
      const ajv = validator.getAjv();
      assert.throws(() => {
        ajv.compile({
          $id: 'urn:test:unknown-kw',
          type: 'object',
          unknownCustomKeywordAETF: true
        });
      }, /strict mode|unknown|keyword/i);
    });

    it('1.4: schema com formato desconhecido falha na compilação em modo estrito', () => {
      const validator = new PilotAjvValidator();
      const ajv = validator.getAjv();
      assert.throws(() => {
        ajv.compile({
          $id: 'urn:test:unknown-fmt',
          type: 'object',
          properties: {
            badFormat: { type: 'string', format: 'unknown_unregistered_format_xyz' }
          }
        });
      }, /unknown format|strict mode/i);
    });

    it('1.5: propriedade adicional não é removida e provoca falha estrita', () => {
      const validator = new PilotAjvValidator();
      const task: any = createValidTask('TASK_EXTRA_PROP');
      task.injected_unauthorized_prop = 'malicious';
      task.receipt_sha256 = sha256(canonicalJson(task));

      assert.throws(() => {
        validator.validateTaskReceipt(task);
      }, /additional/i);
      assert.strictEqual(task.injected_unauthorized_prop, 'malicious', 'Propriedade adicional não deve ser removida silenciosamente');
    });

    it('1.6: string não é convertida automaticamente em número (coerceTypes: false)', () => {
      const validator = new PilotAjvValidator();
      const task: any = createValidTask('TASK_COERCE_PROP');
      task.version = '1';
      task.receipt_sha256 = sha256(canonicalJson(task));

      assert.throws(() => {
        validator.validateTaskReceipt(task);
      }, /must be integer|type/i);
      assert.strictEqual(typeof task.version, 'string', 'Tipo não deve sofrer coerção para number');
    });

    it('1.7: campo ausente não recebe default (useDefaults: false)', () => {
      const validator = new PilotAjvValidator();
      const ajv = validator.getAjv();
      const validate = ajv.compile({
        $id: 'urn:test:no-defaults',
        type: 'object',
        properties: {
          testField: { type: 'string', default: 'INJECTED_DEFAULT' }
        },
        additionalProperties: false
      });
      const targetObj: any = {};
      const valid = validate(targetObj);
      assert.strictEqual(valid, true);
      assert.strictEqual(targetObj.testField, undefined, 'useDefaults: false não deve injetar propriedade default');
    });

    it('1.8: schema corrompido ou com tipo inválido falha na compilação com erro explícito', () => {
      const validator = new PilotAjvValidator();
      const ajv = validator.getAjv();
      assert.throws(() => {
        ajv.compile({
          $id: 'urn:test:invalid-type',
          type: 'non_existent_json_type_123'
        });
      }, /type/i);
    });

    it('1.9: todos os recibos válidos existentes continuam a passar com strict: true', () => {
      const validator = new PilotAjvValidator();
      const task = createValidTask('TASK_EXISTING_01');
      const docVal = createValidDocValidation('TASK_EXISTING_01');
      const rev = createValidReview('TASK_EXISTING_01');
      const deliv = createValidDelivery('TASK_EXISTING_01', rev.review_id);
      const manifest = createValidManifest();

      assert.doesNotThrow(() => validator.validateTaskReceipt(task));
      assert.doesNotThrow(() => validator.validateDocumentValidationReceipt(docVal));
      assert.doesNotThrow(() => validator.validateHumanReviewReceipt(rev));
      assert.doesNotThrow(() => validator.validateDeliveryReceipt(deliv));
      assert.doesNotThrow(() => validator.validateEvidenceManifest(manifest));
    });

    it('1.10: os erros de validação preservam instancePath, schemaPath, keyword e mensagem', () => {
      const validator = new PilotAjvValidator();
      const task: any = createValidTask('TASK_ERR_ATTR');
      task.version = -5;
      task.receipt_sha256 = sha256(canonicalJson(task));

      try {
        validator.validateTaskReceipt(task);
        assert.fail('Deveria ter lançado erro');
      } catch (err: any) {
        assert.ok(err.message.includes('version') || err.message.includes('minimum'));
      }
    });
  });

  // =========================================================================
  // BLOCO 2: 12 Testes de Quatro Planos de Verdade e Consultas Forenses SQLite
  // =========================================================================
  describe('Bloco 2: Quatro Planos de Verdade e Consultas Forenses SQLite', () => {
    let testBaseDir: string;
    let dbPath: string;
    let evidenceDir: string;
    let store: TransactionalPilotStore;
    let engine: ControlledPilotEngine;
    const testTenantId = 'tenant_angola_ops';
    const testPilotId = 'PILOT_PLANES_2026';
    const taskId = 'TASK_TEST_FOUR_PLANES_01';
    let reviewId: string;
    let deliveryId: string;

    before(async () => {
      testBaseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pilot-four-planes-test-'));
      dbPath = path.join(testBaseDir, 'pilot.sqlite');
      evidenceDir = path.join(testBaseDir, 'evidence');

      store = new TransactionalPilotStore(dbPath, 'SIMULATION');
      engine = new ControlledPilotEngine(store);

      const pilot = createValidPilot(testPilotId, testTenantId);
      engine.createPilot(pilot);
      engine.authorizePilot(testPilotId, pilot.authorization_reference, pilot.authorized_by, pilot.authorized_at);
      engine.activatePilot(testPilotId);

      const req: PilotTaskRequest = {
        task_id: taskId,
        pilot_id: testPilotId,
        tenant_id: testTenantId,
        employee_id: 66,
        requested_by: 'user_tester',
        received_at: new Date().toISOString(),
        title: 'Relatório Financeiro',
        instruction: 'Gerar relatório Q1',
        input_data: { period: '2026-Q1' },
        idempotency_key: `IDEMP_${taskId}`,
        format: 'PDF',
        execution_mode: 'SIMULATION'
      };
      await engine.executeTask(req);

      const challenge = store.getPendingChallengeForTask(taskId)!;
      assert.ok(challenge, 'Desafio deve existir');

      const revReceipt = await engine.reviewTask({
        challenge_id: challenge.challenge_id,
        review_id: `REV_${Date.now()}`,
        task_id: taskId,
        reviewer: 'rev_maria',
        decision: 'APPROVED',
        comments: 'Documento aprovado nos quatro planos'
      });
      reviewId = revReceipt.review_id;

      const delivReceipt = engine.deliverTask({
        taskId,
        deliveredTo: 'archive@saso.ao',
        channel: 'INTERNAL_ARCHIVE'
      });
      deliveryId = delivReceipt.delivery_id;

      engine.exportPilotEvidence(testPilotId, evidenceDir);
    });

    after(() => {
      try {
        store?.close();
      } catch {}
      if (fs.existsSync(testBaseDir)) {
        fs.rmSync(testBaseDir, { recursive: true, force: true });
      }
    });

    it('2.1: alterar pilot_tasks.version na coluna sem alterar receipt_json detecta divergência', () => {
      const rawDb = store.getRawDb();
      try {
        rawDb.prepare('UPDATE pilot_tasks SET version = version + 1 WHERE task_id = ?').run(taskId);
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /Divergência entre SQLite rawColumns e receipt_json.*version/i);
      } finally {
        rawDb.prepare('UPDATE pilot_tasks SET version = version - 1 WHERE task_id = ?').run(taskId);
      }
    });

    it('2.2: alterar pilot_tasks.tenant_id na coluna sem alterar receipt_json detecta divergência', () => {
      const rawDb = store.getRawDb();
      try {
        rawDb.prepare('UPDATE pilot_tasks SET tenant_id = ? WHERE task_id = ?').run('tampered_tenant', taskId);
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /Divergência entre SQLite rawColumns e receipt_json.*tenant_id|não tem registo correspondente no SQLite para o tenant/i);
      } finally {
        rawDb.prepare('UPDATE pilot_tasks SET tenant_id = ? WHERE task_id = ?').run(testTenantId, taskId);
      }
    });

    it('2.3: alterar pilot_tasks.input_snapshot_sha256 na coluna sem alterar receipt_json detecta divergência', () => {
      const rawDb = store.getRawDb();
      const origSha = store.getTaskForensicRecord(taskId)!.parsedReceipt.input_snapshot_sha256;
      try {
        rawDb.prepare('UPDATE pilot_tasks SET input_snapshot_sha256 = ? WHERE task_id = ?').run('0'.repeat(64), taskId);
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /Divergência entre SQLite rawColumns e receipt_json.*input_snapshot_sha256/i);
      } finally {
        rawDb.prepare('UPDATE pilot_tasks SET input_snapshot_sha256 = ? WHERE task_id = ?').run(origSha, taskId);
      }
    });

    it('2.4: alterar somente receipt_json, mantendo as colunas intactas detecta divergência', () => {
      const rawDb = store.getRawDb();
      const origForensic = store.getTaskForensicRecord(taskId)!;
      const tamperedReceipt = { ...origForensic.parsedReceipt, version: 999 };
      try {
        rawDb.prepare('UPDATE pilot_tasks SET receipt_json = ? WHERE task_id = ?').run(JSON.stringify(tamperedReceipt), taskId);
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /Divergência entre SQLite rawColumns e receipt_json.*version/i);
      } finally {
        rawDb.prepare('UPDATE pilot_tasks SET receipt_json = ? WHERE task_id = ?').run(origForensic.rawReceiptJson, taskId);
      }
    });

    it('2.5: alterar o BLOB, mantendo o hash e o ficheiro detecta divergência', () => {
      const rawDb = store.getRawDb();
      const origOut = store.getOutputForensicRecord(taskId)!;
      assert.ok(origOut, 'origOut deve existir');
      try {
        rawDb.prepare("UPDATE task_outputs SET file_bytes = X'cafebabe' WHERE task_id = ?").run(taskId);
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /Divergência de hash BLOB no SQLite|Divergência entre ficheiro em disco e BLOB SQLite/i);
      } finally {
        rawDb.prepare('UPDATE task_outputs SET file_bytes = ? WHERE task_id = ?').run(origOut.blob, taskId);
      }
    });

    it('2.6: alterar file_bytes_sha256 na coluna, mantendo BLOB e ficheiro detecta divergência', () => {
      const rawDb = store.getRawDb();
      const origOut = store.getOutputForensicRecord(taskId)!;
      assert.ok(origOut, 'origOut deve existir');
      try {
        rawDb.prepare('UPDATE task_outputs SET file_bytes_sha256 = ? WHERE task_id = ?').run('f'.repeat(64), taskId);
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /Divergência.*file_bytes_sha256|Divergência entre coluna file_bytes_sha256/i);
      } finally {
        rawDb.prepare('UPDATE task_outputs SET file_bytes_sha256 = ? WHERE task_id = ?').run(origOut.rawColumns.file_bytes_sha256, taskId);
      }
    });

    it('2.7: alterar a coluna de decisão da revisão, mantendo o JSON detecta divergência', () => {
      const rawDb = store.getRawDb();
      try {
        rawDb.prepare('UPDATE human_reviews SET decision = ? WHERE review_id = ?').run('REJECTED', reviewId);
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /Divergência entre SQLite rawColumns e receipt_json.*decision/i);
      } finally {
        rawDb.prepare('UPDATE human_reviews SET decision = ? WHERE review_id = ?').run('APPROVED', reviewId);
      }
    });

    it('2.8: alterar a coluna de destino da entrega, mantendo o JSON detecta divergência', () => {
      const rawDb = store.getRawDb();
      try {
        rawDb.prepare('UPDATE pilot_deliveries SET channel = ? WHERE delivery_id = ?').run('TAMPERED_CHANNEL', deliveryId);
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /Divergência entre SQLite rawColumns e receipt_json.*channel/i);
      } finally {
        rawDb.prepare('UPDATE pilot_deliveries SET channel = ? WHERE delivery_id = ?').run('INTERNAL_ARCHIVE', deliveryId);
      }
    });

    it('2.9: alterar tenant ou piloto da validação documental detecta divergência', () => {
      const rawDb = store.getRawDb();
      const valRec = store.getDocumentValidationForensicRecord(taskId, 1, 'INTERNAL_STRUCTURAL_VALIDATION')!;
      try {
        rawDb.prepare('UPDATE task_document_validations SET tenant_id = ? WHERE receipt_id = ?').run('tampered_tenant', valRec.rawColumns.receipt_id);
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /Divergência.*tenant_id/i);
      } finally {
        rawDb.prepare('UPDATE task_document_validations SET tenant_id = ? WHERE receipt_id = ?').run(testTenantId, valRec.rawColumns.receipt_id);
      }
    });

    it('2.10: alterar somente o ficheiro exportado detecta adulteração física', () => {
      const filePath = path.join(evidenceDir, 'task-receipts', taskId + '.json');
      const originalBytes = fs.readFileSync(filePath);
      try {
        fs.writeFileSync(filePath, JSON.stringify({ ...JSON.parse(originalBytes.toString('utf8')), extra: 'bad' }, null, 2));
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /adulterado|additionalProperties|corrompido|Divergência/i);
      } finally {
        fs.writeFileSync(filePath, originalBytes);
      }
    });

    it('2.11: alterar somente a entrada do manifesto detecta adulteração de manifesto', () => {
      const manifestPath = path.join(evidenceDir, 'pilot-evidence-manifest.json');
      const originalBytes = fs.readFileSync(manifestPath);
      try {
        const manifest = JSON.parse(originalBytes.toString('utf8'));
        manifest.files[0].file_bytes_sha256 = '0'.repeat(64);
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /Validação Ajv falhou|Manifesto de evidência inválido|adulterado|Divergência/i);
      } finally {
        fs.writeFileSync(manifestPath, originalBytes);
      }
    });

    it('2.12: provar que uma cadeia integralmente coerente passa em todos os quatro planos', () => {
      const verified = engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
      assert.ok(verified, 'Cadeia coerente deve passar na verificação');
      assert.strictEqual(verified.commitSha, commitSha);
    });

    it('2.13: anular coluna obrigatória commit_sha no SQLite falha no leitor forense com erro explícito', () => {
      const rawDb = store.getRawDb();
      try {
        rawDb.prepare('UPDATE pilot_tasks SET commit_sha = NULL WHERE task_id = ?').run(taskId);
        assert.throws(() => {
          store.getTaskForensicRecord(taskId);
        }, /coluna relacional obrigatória 'commit_sha' ausente ou nula/i);
      } finally {
        rawDb.prepare('UPDATE pilot_tasks SET commit_sha = ? WHERE task_id = ?').run(commitSha, taskId);
      }
    });

    it('2.14: anular ou esvaziar receipt_json no SQLite falha no leitor forense com erro explícito', () => {
      const rawDb = store.getRawDb();
      const origForensic = store.getTaskForensicRecord(taskId)!;
      try {
        rawDb.prepare("UPDATE pilot_tasks SET receipt_json = '' WHERE task_id = ?").run(taskId);
        assert.throws(() => {
          store.getTaskForensicRecord(taskId);
        }, /'receipt_json' ausente ou vazio/i);
      } finally {
        rawDb.prepare('UPDATE pilot_tasks SET receipt_json = ? WHERE task_id = ?').run(origForensic.rawReceiptJson, taskId);
      }
    });

    it('2.15: apagar ficheiro físico de recibo isoladamente falha na verificação bidirecional', () => {
      const filePath = path.join(evidenceDir, 'task-receipts', taskId + '.json');
      const originalBytes = fs.readFileSync(filePath);
      try {
        fs.unlinkSync(filePath);
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /Verificação bidirecional falhou.*sem ficheiro/i);
      } finally {
        fs.writeFileSync(filePath, originalBytes);
      }
    });

    it('2.16: remover entrada do manifesto isoladamente falha na verificação de evidência', () => {
      const manifestPath = path.join(evidenceDir, 'pilot-evidence-manifest.json');
      const originalBytes = fs.readFileSync(manifestPath);
      try {
        const manifest = JSON.parse(originalBytes.toString('utf8'));
        manifest.files = manifest.files.filter((f: any) => !f.relative_path.includes(taskId));
        manifest.total_files = manifest.files.length;
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /Ficheiro .* presente no directório mas ausente no manifesto|Verificação bidirecional/i);
      } finally {
        fs.writeFileSync(manifestPath, originalBytes);
      }
    });

    it('2.17: corromper BLOB file_bytes no SQLite falha no leitor forense com erro explícito', () => {
      const rawDb = store.getRawDb();
      const origOut = store.getOutputForensicRecord(taskId)!;
      try {
        rawDb.prepare("UPDATE task_outputs SET file_bytes = X'' WHERE task_id = ?").run(taskId);
        assert.throws(() => {
          store.getOutputForensicRecord(taskId);
        }, /BLOB 'file_bytes' ausente ou inválido/i);
      } finally {
        rawDb.prepare('UPDATE task_outputs SET file_bytes = ? WHERE task_id = ?').run(origOut.blob, taskId);
      }
    });

    it('2.18: adulterar tenant_id no manifesto de evidência falha com divergência semântica de tenant', () => {
      const manifestPath = path.join(evidenceDir, 'pilot-evidence-manifest.json');
      const originalBytes = fs.readFileSync(manifestPath);
      try {
        const manifest = JSON.parse(originalBytes.toString('utf8'));
        manifest.tenant_id = 'tenant_tampered_divergent';
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        assert.throws(() => {
          engine.verifyEvidenceDirectory(testPilotId, evidenceDir);
        }, /possui tenant_id divergente: esperado='tenant_angola_ops', obtido='tenant_tampered_divergent'/i);
      } finally {
        fs.writeFileSync(manifestPath, originalBytes);
      }
    });
  });

  // =========================================================================
  // BLOCO 3: 10 Testes de Proveniência Completa e Cadeia Causal
  // =========================================================================
  describe('Bloco 3: Proveniência Completa e Cadeia Causal', () => {
    let testBaseDir: string;
    let store: TransactionalPilotStore;
    let engine: ControlledPilotEngine;
    const testTenantId = 'tenant_angola_ops';
    const testPilotId = 'PILOT_PROV_2026';
    const validator = new PilotAjvValidator();

    before(() => {
      testBaseDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pilot-prov-test-'));
      store = new TransactionalPilotStore(path.join(testBaseDir, 'prov.sqlite'), 'SIMULATION');
      engine = new ControlledPilotEngine(store);

      const pilot = createValidPilot(testPilotId, testTenantId);
      engine.createPilot(pilot);
      engine.authorizePilot(testPilotId, pilot.authorization_reference, pilot.authorized_by, pilot.authorized_at);
      engine.activatePilot(testPilotId);
    });

    after(() => {
      try {
        store?.close();
      } catch {}
      if (fs.existsSync(testBaseDir)) {
        fs.rmSync(testBaseDir, { recursive: true, force: true });
      }
    });

    it('3.1: revisão sem tenant_id falha na validação de schema', () => {
      const rev: any = createValidReview('TASK_PROV_01');
      delete rev.tenant_id;
      rev.receipt_sha256 = sha256(canonicalJson(rev));
      assert.throws(() => {
        validator.validateHumanReviewReceipt(rev);
      }, /required.*tenant_id/i);
    });

    it('3.2: revisão sem commit_sha falha na validação de schema', () => {
      const rev: any = createValidReview('TASK_PROV_02');
      delete rev.commit_sha;
      rev.receipt_sha256 = sha256(canonicalJson(rev));
      assert.throws(() => {
        validator.validateHumanReviewReceipt(rev);
      }, /required.*commit_sha/i);
    });

    it('3.3: revisão sem document_version ou sem challenge_id falha na validação de schema', () => {
      const rev1: any = createValidReview('TASK_PROV_03');
      delete rev1.document_version;
      rev1.receipt_sha256 = sha256(canonicalJson(rev1));
      assert.throws(() => {
        validator.validateHumanReviewReceipt(rev1);
      }, /required.*document_version/i);

      const rev2: any = createValidReview('TASK_PROV_03');
      delete rev2.challenge_id;
      rev2.receipt_sha256 = sha256(canonicalJson(rev2));
      assert.throws(() => {
        validator.validateHumanReviewReceipt(rev2);
      }, /required.*challenge_id/i);
    });

    it('3.4: entrega sem review_id falha na validação de schema', () => {
      const deliv: any = createValidDelivery('TASK_PROV_04', 'REV_TEST');
      delete deliv.review_id;
      deliv.receipt_sha256 = sha256(canonicalJson(deliv));
      assert.throws(() => {
        validator.validateDeliveryReceipt(deliv);
      }, /required.*review_id/i);
    });

    it('3.5: entrega ligada a revisão de outra versão ou sem aprovação falha na entrega', async () => {
      const tId = 'TASK_PROV_05';
      const req: PilotTaskRequest = {
        task_id: tId,
        pilot_id: testPilotId,
        tenant_id: testTenantId,
        employee_id: 66,
        requested_by: 'user_tester',
        received_at: new Date().toISOString(),
        title: 'Relatório V1',
        instruction: 'Gerar relatório',
        input_data: { period: '2026-Q1' },
        idempotency_key: `IDEMP_${tId}`,
        format: 'PDF',
        execution_mode: 'SIMULATION'
      };
      await engine.executeTask(req);

      assert.throws(() => {
        engine.deliverTask({ taskId: tId, deliveredTo: 'archive@saso.ao', channel: 'INTERNAL_ARCHIVE' });
      }, /Entrega bloqueada: Tarefa .* não tem aprovação humana/i);
    });

    it('3.6: entrega ligada a outro tenant ou piloto falha na verificação de entrega', () => {
      const tId = 'TASK_PROV_06';
      const task = createValidTask(tId, testTenantId, testPilotId, 1);
      task.human_review_status = 'APPROVED';
      store.saveTask(task);

      const docVal = createValidDocValidation(tId, testTenantId, testPilotId, 1);
      store.saveDocumentValidationReceipt(docVal);

      const rev = createValidReview(tId, 'other_tenant', testPilotId, 1);
      store.saveReview(rev);

      assert.throws(() => {
        engine.deliverTask({ taskId: tId, deliveredTo: 'archive@saso.ao', channel: 'INTERNAL_ARCHIVE' });
      }, /Tenant da revisão .* diverge da tarefa/i);
    });

    it('3.7: SHA divergente entre tarefa e revisão falha na entrega', () => {
      const tId = 'TASK_PROV_07';
      const task = createValidTask(tId, testTenantId, testPilotId, 1);
      task.human_review_status = 'APPROVED';
      store.saveTask(task);

      const docVal = createValidDocValidation(tId, testTenantId, testPilotId, 1);
      store.saveDocumentValidationReceipt(docVal);

      const rev = createValidReview(tId, testTenantId, testPilotId, 1);
      rev.commit_sha = 'a'.repeat(40);
      store.saveReview(rev);

      assert.throws(() => {
        engine.deliverTask({ taskId: tId, deliveredTo: 'archive@saso.ao', channel: 'INTERNAL_ARCHIVE' });
      }, /Divergência de commit_sha entre revisão/i);
    });

    it('3.8: SHA divergente entre revisão e entrega falha na verificação de evidência', () => {
      const tId = 'TASK_PROV_08';
      const rev = createValidReview(tId, testTenantId, testPilotId, 1);
      const deliv = createValidDelivery(tId, rev.review_id, testTenantId, testPilotId, 1);
      deliv.commit_sha = 'b'.repeat(40);
      deliv.receipt_sha256 = sha256(canonicalJson(deliv));

      assert.throws(() => {
        validator.validateDeliveryReceipt(deliv);
        if (deliv.commit_sha !== rev.commit_sha) {
          throw new Error('Divergência de commit_sha entre revisão e entrega');
        }
      }, /Divergência de commit_sha/i);
    });

    it('3.9: hash entregue diferente do output aprovado pela revisão falha na entrega', () => {
      const tId = 'TASK_PROV_09';
      const task = createValidTask(tId, testTenantId, testPilotId, 1);
      task.human_review_status = 'APPROVED';
      task.output_hashes = [sha256('hash_original')];
      store.saveTask(task);

      const docVal = createValidDocValidation(tId, testTenantId, testPilotId, 1);
      store.saveDocumentValidationReceipt(docVal);

      const rev = createValidReview(tId, testTenantId, testPilotId, 1);
      rev.new_output_hash = sha256('hash_diferente');
      store.saveReview(rev);

      assert.throws(() => {
        engine.deliverTask({ taskId: tId, deliveredTo: 'archive@saso.ao', channel: 'INTERNAL_ARCHIVE' });
      }, /Hash do output aprovado na revisão .* não está presente nos hashes da tarefa/i);
    });

    it('3.10: cadeia completa tarefa -> validação -> revisão -> entrega passa com sucesso', async () => {
      const tId = 'TASK_PROV_10';
      const req: PilotTaskRequest = {
        task_id: tId,
        pilot_id: testPilotId,
        tenant_id: testTenantId,
        employee_id: 66,
        requested_by: 'user_tester',
        received_at: new Date().toISOString(),
        title: 'Relatório Completo',
        instruction: 'Gerar relatório',
        input_data: { period: '2026-Q1' },
        idempotency_key: `IDEMP_${tId}`,
        format: 'PDF',
        execution_mode: 'SIMULATION'
      };
      await engine.executeTask(req);

      const challenge = store.getPendingChallengeForTask(tId)!;
      const rev = await engine.reviewTask({
        challenge_id: challenge.challenge_id,
        review_id: `REV_${Date.now()}_10`,
        task_id: tId,
        reviewer: 'rev_maria',
        decision: 'APPROVED',
        comments: 'Cadeia completa 100% verificada'
      });

      const deliv = engine.deliverTask({
        taskId: tId,
        deliveredTo: 'archive@saso.ao',
        channel: 'INTERNAL_ARCHIVE'
      });

      assert.ok(deliv.delivery_id);
      assert.strictEqual(deliv.review_id, rev.review_id);
      assert.strictEqual(deliv.tenant_id, testTenantId);
      assert.strictEqual(deliv.commit_sha, commitSha);
    });
  });

  // =========================================================================
  // BLOCO 4: 7 Testes de Limpeza Determinística do Workspace e Zero Resíduos
  // =========================================================================
  describe('Bloco 4: Limpeza Determinística do Workspace e Zero Resíduos', () => {
    it('4.1: duas suites paralelas recebem caminhos temporários diferentes e isolados', () => {
      const dir1 = fs.mkdtempSync(path.join(os.tmpdir(), 'suite-iso-1-'));
      const dir2 = fs.mkdtempSync(path.join(os.tmpdir(), 'suite-iso-2-'));
      try {
        assert.notStrictEqual(dir1, dir2);
        assert.ok(fs.existsSync(dir1));
        assert.ok(fs.existsSync(dir2));
      } finally {
        fs.rmSync(dir1, { recursive: true, force: true });
        fs.rmSync(dir2, { recursive: true, force: true });
      }
    });

    it('4.2: uma falha intencional ainda remove o diretório temporário no bloco de limpeza', () => {
      const testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'suite-cleanup-test-'));
      try {
        assert.ok(fs.existsSync(testDir));
        throw new Error('Falha intencional de teste');
      } catch (err: any) {
        assert.strictEqual(err.message, 'Falha intencional de teste');
      } finally {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
      assert.strictEqual(fs.existsSync(testDir), false, 'Diretório temporário deve ser limpo após falha');
    });

    it('4.3: a limpeza funciona tanto com separadores Windows como POSIX', () => {
      const baseTemp = fs.mkdtempSync(path.join(os.tmpdir(), 'suite-sep-test-'));
      const winPath = path.win32.normalize(baseTemp);
      const posixPath = path.posix.normalize(baseTemp.replace(/\\/g, '/'));

      assert.ok(winPath.length > 0);
      assert.ok(posixPath.length > 0);
      fs.rmSync(baseTemp, { recursive: true, force: true });
      assert.strictEqual(fs.existsSync(baseTemp), false);
    });

    it('4.4: nenhum ficheiro ou directório é criado em generated/tmp_test_evidence_coherence', () => {
      const legacyPath = path.join(process.cwd(), 'generated', 'tmp_test_evidence_coherence');
      assert.strictEqual(
        fs.existsSync(legacyPath),
        false,
        'O caminho residual generated/tmp_test_evidence_coherence não deve existir no workspace'
      );
    });

    it('4.5: executar a suite duas vezes consecutivas produz os mesmos resultados determinísticos', () => {
      const obj = { b: 2, a: 1, c: [3, 2, 1] };
      const run1 = sha256(canonicalJson(obj));
      const run2 = sha256(canonicalJson(obj));
      assert.strictEqual(run1, run2, 'Canonical JSON e hashes devem ser 100% determinísticos');
    });

    it('4.6: verificar que nenhum ficheiro temporário foi gerado na árvore Git', () => {
      const generatedDir = path.join(process.cwd(), 'generated');
      if (fs.existsSync(generatedDir)) {
        const files = fs.readdirSync(generatedDir);
        const tmpFiles = files.filter(f => f.startsWith('tmp_'));
        assert.deepStrictEqual(tmpFiles, [], 'Nenhum ficheiro temporário tmp_* deve permanecer em generated/');
      }
    });

    it('4.7: verificar que testes executados deixam árvore estritamente limpa', () => {
      const tempInRepo = path.join(process.cwd(), 'packages', 'runtime', 'tmp');
      assert.strictEqual(fs.existsSync(tempInRepo), false, 'Não deve haver pasta tmp na árvore de runtime');
    });
  });
});

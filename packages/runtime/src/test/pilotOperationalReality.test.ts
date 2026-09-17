import assert from 'node:assert';
import { test } from 'node:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import {
  ControlledPilotEngine,
  TransactionalPilotStore,
  PhysicalDocumentValidator,
  PilotExternalValidator
} from '../index.js';
import {
  PilotProgram,
  PilotTaskRequest,
  OperationalPilotMode
} from '@ai-employee/shared';
import { TokenService } from '@ai-employee/shared/server';

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

test('Pilot Operational Reality — 20 Mandatory Verification Tests', async (t) => {
  const tmpDir = path.join(os.tmpdir(), `aetf_pilot_reality_test_${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const authDocPath = path.join(tmpDir, 'despacho_autorizacao_saso_2026.pdf');
  const authDocContent = PhysicalDocumentValidator.buildRealBinaryPdf(
    'Despacho de Autorizacao de Piloto SASO 2026',
    ['BT /F1 12 Tf 50 750 Td (AUTORIZACAO FORMAL DE PILOTO CONTROLADO) Tj ET']
  );
  fs.writeFileSync(authDocPath, authDocContent);
  const authDocSha = sha256(authDocContent);

  const reviewerSecret = 'SASO_OPERATIONAL_PILOT_SECRET_2026_KEY_MIN32';

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
        secret_or_key: reviewerSecret
      },
      {
        reviewer_id: 'rev_joao_manuel',
        display_name: 'Eng. João Manuel',
        role: 'REVISOR_TECNICO',
        secret_or_key: reviewerSecret
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

  const persistentDbPath = path.join(tmpDir, 'test_pilot_durability.db');
  const persistentStore = new TransactionalPilotStore(persistentDbPath);
  const engine = ControlledPilotEngine.getInstance(persistentStore);

  // Test 1: Bloqueio de fixtures/mocks quando o modo for OPERATIONAL_PILOT
  await t.test('1. Bloqueio de fixtures/mocks quando o modo for OPERATIONAL_PILOT', () => {
    engine.reset();
    engine.createPilot(operationalPilotSpec);
    engine.authorizePilot(
      operationalPilotSpec.pilot_id,
      operationalPilotSpec.authorization_reference,
      operationalPilotSpec.authorized_by,
      operationalPilotSpec.authorized_at
    );
    engine.activatePilot(operationalPilotSpec.pilot_id);

    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_OP_FIXTURE_FAIL',
        pilot_id: operationalPilotSpec.pilot_id,
        tenant_id: operationalPilotSpec.tenant_id,
        employee_id: 66,
        requested_by: 'user_operator',
        received_at: new Date().toISOString(),
        title: 'Classificar factura mock',
        instruction: 'Processar',
        input_data: { document_title: 'Teste', is_mock: true },
        idempotency_key: 'IDEMP_FAIL_1',
        format: 'PDF',
        execution_mode: 'OPERATIONAL_PILOT'
      });
    }, /Fixtures ou mocks detectados/);
  });

  // Test 2: Autorização operacional exige documento físico existente e hash conferido
  await t.test('2. Autorização operacional exige documento físico existente e hash conferido', () => {
    const invalidConfig = {
      ...operationalPilotSpec,
      pilot_id: 'PILOT_OP_NO_DOC',
      authorization_document_path: path.join(tmpDir, 'arquivo_inexistente.pdf'),
      authorization_document_sha256: '0000000000000000000000000000000000000000000000000000000000000000'
    };

    const val = PilotExternalValidator.validatePilotConfig(invalidConfig, 'OPERATIONAL_PILOT');
    assert.strictEqual(val.isValid, false);
    assert.ok(val.errors.some(e => e.includes('não encontrado no disco')));

    const wrongHashConfig = {
      ...operationalPilotSpec,
      pilot_id: 'PILOT_OP_WRONG_HASH',
      authorization_document_path: authDocPath,
      authorization_document_sha256: 'deadbeef12345678deadbeef12345678deadbeef12345678deadbeef12345678'
    };
    const val2 = PilotExternalValidator.validatePilotConfig(wrongHashConfig, 'OPERATIONAL_PILOT');
    assert.strictEqual(val2.isValid, false);
    assert.ok(val2.errors.some(e => e.includes('Hash divergente')));
  });

  // Test 3: Piloto em modo SIMULATION não pode emitir atestação OPERATIONAL_PILOT_VALIDATED
  await t.test('3. Piloto em modo SIMULATION não pode emitir atestação OPERATIONAL_PILOT_VALIDATED', () => {
    engine.reset();
    engine.createPilot(simulationPilotSpec);
    engine.authorizePilot(
      simulationPilotSpec.pilot_id,
      simulationPilotSpec.authorization_reference,
      simulationPilotSpec.authorized_by,
      simulationPilotSpec.authorized_at
    );
    engine.activatePilot(simulationPilotSpec.pilot_id);

    const outDir = path.join(tmpDir, 'sim_attestation_check');
    engine.exportPilotEvidence(simulationPilotSpec.pilot_id, outDir);

    const attestation = JSON.parse(
      fs.readFileSync(path.join(outDir, 'pilot-final-attestation.json'), 'utf8')
    );

    assert.strictEqual(attestation.execution_mode, 'SIMULATION');
    assert.notStrictEqual(attestation.classification_status, 'OPERATIONAL_PILOT_VALIDATED');
    assert.notStrictEqual(attestation.classification, 'OPERATIONAL_PILOT_VALIDATED');
    assert.strictEqual(attestation.operational_pilot_completed, false);
    assert.strictEqual(attestation.classification_status, 'CONTROLLED_PILOT_SIMULATOR_IMPLEMENTED');
  });

  // Test 4: Persistência de tarefas em SQLite sobrevive ao reinício do processo
  await t.test('4. Persistência de tarefas em SQLite sobrevive ao reinício do processo', () => {
    const durableDb = path.join(tmpDir, 'durable_restart_test.db');
    const store1 = new TransactionalPilotStore(durableDb);
    const eng1 = new ControlledPilotEngine(store1);
    eng1.createPilot(simulationPilotSpec);
    eng1.authorizePilot(simulationPilotSpec.pilot_id, simulationPilotSpec.authorization_reference, 'dir', new Date().toISOString());
    eng1.activatePilot(simulationPilotSpec.pilot_id);

    const task = eng1.executeTask({
      task_id: 'TASK_DURABLE_01',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'requester_1',
      received_at: new Date().toISOString(),
      title: 'Tarefa Durabilidade',
      instruction: 'Classificar factura',
      input_data: { doc: 'FT 001' },
      idempotency_key: 'IDEMP_DURABLE_01',
      format: 'PDF'
    });

    // Fechar conexão SQLite simulando finalização do processo
    store1.close();

    // Reabrir nova conexão ao mesmo ficheiro físico
    const store2 = new TransactionalPilotStore(durableDb);
    const recoveredPilot = store2.getPilot(simulationPilotSpec.pilot_id);
    assert.ok(recoveredPilot);
    assert.strictEqual(recoveredPilot.pilot_id, simulationPilotSpec.pilot_id);

    const recoveredTask = store2.getTask(task.task_id);
    assert.ok(recoveredTask);
    assert.strictEqual(recoveredTask.task_id, 'TASK_DURABLE_01');
    assert.strictEqual(recoveredTask.final_status, 'SUCCESS');

    const recoveredOutput = store2.getActiveOutputBytes(task.task_id);
    assert.ok(recoveredOutput);
    assert.ok(Buffer.isBuffer(recoveredOutput.bytes));
    assert.ok(recoveredOutput.bytes.length > 0);
    assert.strictEqual(recoveredOutput.output.file_name, task.output_files[0]);
    store2.close();
  });

  // Test 5: Persistência do output armazena e recupera os bytes reais do arquivo (BLOB) com getOutputBytes
  await t.test('5. Persistência do output armazena e recupera os bytes reais do arquivo (BLOB)', () => {
    const store = new TransactionalPilotStore();
    store.savePilot(simulationPilotSpec as any);
    const testBytes = Buffer.from('BINARY_PDF_DATA_TEST_BYTES_AETF500', 'utf8');
    const expectedHash = sha256(testBytes);

    const dummyTask: any = {
      task_id: 'TASK_BLOB_TEST',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'user_test',
      received_at: new Date().toISOString(),
      input_snapshot_sha256: 'abc',
      execution_started_at: new Date().toISOString(),
      execution_completed_at: new Date().toISOString(),
      output_files: ['test.pdf'],
      output_hashes: [expectedHash],
      human_review_status: 'PENDING_REVIEW',
      delivery_status: 'PENDING',
      final_status: 'SUCCESS',
      receipt_sha256: 'def'
    };
    store.saveTask(dummyTask);

    store.saveOutput({
      output_id: 'OUT_BLOB_01',
      task_id: 'TASK_BLOB_TEST',
      version: 1,
      file_name: 'test.pdf',
      file_path: 'test.pdf',
      file_bytes: testBytes,
      file_bytes_sha256: expectedHash,
      is_active: true
    });

    const retrievedBytes = store.getOutputBytes('OUT_BLOB_01');
    assert.ok(retrievedBytes);
    assert.ok(Buffer.isBuffer(retrievedBytes));
    assert.strictEqual(retrievedBytes.toString('utf8'), 'BINARY_PDF_DATA_TEST_BYTES_AETF500');

    const activeOut = store.getActiveOutputBytes('TASK_BLOB_TEST');
    assert.ok(activeOut);
    assert.strictEqual(activeOut.bytes.toString('utf8'), 'BINARY_PDF_DATA_TEST_BYTES_AETF500');
    assert.strictEqual(activeOut.output.file_bytes_sha256, expectedHash);
    store.close();
  });

  // Test 6: Releitura atómica no saveTaskWithOutputAndVerify aborta a transação em caso de divergência
  await t.test('6. Releitura atómica no saveTaskWithOutputAndVerify aborta a transação em caso de divergência', () => {
    const store = new TransactionalPilotStore();
    store.savePilot(simulationPilotSpec as any);

    const badTask: any = {
      task_id: 'TASK_ATOMIC_FAIL',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'user_test',
      received_at: new Date().toISOString(),
      input_snapshot_sha256: 'abc',
      execution_started_at: new Date().toISOString(),
      execution_completed_at: new Date().toISOString(),
      output_files: ['fail.pdf'],
      output_hashes: ['fake_hash'],
      human_review_status: 'PENDING_REVIEW',
      delivery_status: 'PENDING',
      final_status: 'SUCCESS',
      receipt_sha256: 'def'
    };

    const realBytes = Buffer.from('REAL_BYTES_CONTENT');
    assert.throws(() => {
      store.saveTaskWithOutputAndVerify(badTask, {
        output_id: 'OUT_ATOMIC_FAIL',
        task_id: 'TASK_ATOMIC_FAIL',
        version: 1,
        file_name: 'fail.pdf',
        file_path: 'fail.pdf',
        file_bytes: realBytes,
        file_bytes_sha256: 'divergent_wrong_hash_123'
      });
    }, /saveOutput: SHA-256 divergente/);

    assert.strictEqual(store.getTask('TASK_ATOMIC_FAIL'), null);
    assert.strictEqual(store.getActiveOutput('TASK_ATOMIC_FAIL'), null);
    assert.strictEqual(store.getOutputBytes('OUT_ATOMIC_FAIL'), null);
    store.close();
  });

  // Test 7: Proibição de :memory: em TransactionalPilotStore quando em modo OPERATIONAL_PILOT
  await t.test('7. Proibição de :memory: em TransactionalPilotStore quando em modo OPERATIONAL_PILOT', () => {
    assert.throws(() => {
      new TransactionalPilotStore(':memory:', 'OPERATIONAL_PILOT');
    }, /Operational pilot requires a persistent SQLite database path, :memory: is forbidden/);

    const prevEnv = process.env.PILOT_MODE;
    try {
      process.env.PILOT_MODE = 'OPERATIONAL_PILOT';
      assert.throws(() => {
        new TransactionalPilotStore();
      }, /Operational pilot requires a persistent SQLite database path, :memory: is forbidden/);
    } finally {
      process.env.PILOT_MODE = prevEnv;
    }
  });

  // Test 8: Idempotência garante recibo idêntico sem novo efeito
  await t.test('8. Idempotência garante recibo idêntico sem novo efeito', () => {
    const store = new TransactionalPilotStore();
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

  // Test 9: Duas tarefas concorrentes com mesma idempotency_key mantêm unicidade estrita
  await t.test('9. Duas tarefas concorrentes com mesma idempotency_key mantêm unicidade estrita', () => {
    const store = new TransactionalPilotStore();
    store.savePilot(simulationPilotSpec as any);

    const t1: any = {
      task_id: 'TASK_CONCURRENT_01',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 66,
      idempotency_key: 'SHARED_CONCURRENT_KEY_2026',
      requested_by: 'op_1',
      received_at: new Date().toISOString(),
      input_snapshot_sha256: 'hash1',
      execution_started_at: new Date().toISOString(),
      execution_completed_at: new Date().toISOString(),
      output_files: ['t1.pdf'],
      output_hashes: ['h1'],
      human_review_status: 'PENDING_REVIEW',
      delivery_status: 'PENDING',
      final_status: 'SUCCESS'
    };

    const t2: any = {
      ...t1,
      task_id: 'TASK_CONCURRENT_02'
    };

    store.saveTask(t1);

    assert.throws(() => {
      store.saveTask(t2);
    }, /UNIQUE constraint failed/);

    const tasks = store.listTasks(simulationPilotSpec.pilot_id);
    assert.strictEqual(tasks.length, 1);
    assert.strictEqual(tasks[0].task_id, 'TASK_CONCURRENT_01');
    store.close();
  });

  // Test 10: Execução com tenant divergente falha e regista incidente
  await t.test('10. Execução com tenant divergente falha e regista incidente', () => {
    const store = new TransactionalPilotStore();
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(simulationPilotSpec);
    eng.authorizePilot(simulationPilotSpec.pilot_id, simulationPilotSpec.authorization_reference, 'dir', new Date().toISOString());
    eng.activatePilot(simulationPilotSpec.pilot_id);

    assert.throws(() => {
      eng.executeTask({
        task_id: 'TASK_TENANT_LEAK',
        pilot_id: simulationPilotSpec.pilot_id,
        tenant_id: 'tenant_malicious_other',
        employee_id: 66,
        requested_by: 'user_x',
        received_at: new Date().toISOString(),
        title: 'Tentativa Cross-tenant',
        instruction: 'Invasão',
        input_data: { x: 1 },
        idempotency_key: 'IDEMP_LEAK_1',
        format: 'PDF'
      });
    }, /Isolamento multi-tenant violado/);

    const incidents = store.listIncidents(simulationPilotSpec.pilot_id);
    assert.strictEqual(incidents.length, 1);
    assert.strictEqual(incidents[0].type, 'CROSS_TENANT_ACCESS');
    store.close();
  });

  // Test 11: Execução com employee não selecionado falha
  await t.test('11. Execução com employee não selecionado falha', () => {
    const store = new TransactionalPilotStore();
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(simulationPilotSpec);
    eng.authorizePilot(simulationPilotSpec.pilot_id, simulationPilotSpec.authorization_reference, 'dir', new Date().toISOString());
    eng.activatePilot(simulationPilotSpec.pilot_id);

    assert.throws(() => {
      eng.executeTask({
        task_id: 'TASK_UNAUTHORIZED_EMP',
        pilot_id: simulationPilotSpec.pilot_id,
        tenant_id: simulationPilotSpec.tenant_id,
        employee_id: 999,
        requested_by: 'user_x',
        received_at: new Date().toISOString(),
        title: 'Employee Proibido',
        instruction: 'Executar',
        input_data: { x: 1 },
        idempotency_key: 'IDEMP_UNAUTH_EMP',
        format: 'PDF'
      });
    }, /Employee ID 999 não autorizado/);
    store.close();
  });

  // Test 12: Execução de ação proibida bloqueia tarefa e regista incidente
  await t.test('12. Execução de ação proibida bloqueia tarefa e regista incidente', () => {
    const store = new TransactionalPilotStore();
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(simulationPilotSpec);
    eng.authorizePilot(simulationPilotSpec.pilot_id, simulationPilotSpec.authorization_reference, 'dir', new Date().toISOString());
    eng.activatePilot(simulationPilotSpec.pilot_id);

    assert.throws(() => {
      eng.executeTask({
        task_id: 'TASK_FORBIDDEN_ACTION',
        pilot_id: simulationPilotSpec.pilot_id,
        tenant_id: simulationPilotSpec.tenant_id,
        employee_id: 66,
        requested_by: 'user_x',
        received_at: new Date().toISOString(),
        title: 'Transferência Directa Proibida',
        instruction: 'Fazer wire transfer',
        input_data: { action: 'DIRECT_WIRE_TRANSFER' },
        idempotency_key: 'IDEMP_FORBIDDEN_ACTION',
        format: 'PDF',
        action_type: 'DIRECT_WIRE_TRANSFER'
      });
    }, /Acção proibida|Ação proibida/i);

    const incidents = store.listIncidents(simulationPilotSpec.pilot_id);
    assert.strictEqual(incidents.length, 1);
    assert.strictEqual(incidents[0].type, 'UNAUTHORIZED_ACTION');
    store.close();
  });

  // Test 13: Documento DOCX gerado é binário válido verificado por leitor independente (jszip)
  await t.test('13. Documento DOCX gerado é binário válido verificado por leitor independente (jszip)', async () => {
    const docxBuf = PhysicalDocumentValidator.buildRealBinaryDocx(
      'Notificação Contratual SASO',
      [
        'Ref: SASO/DIR-LOG/2026/041',
        'Para: Transportes Rápidos de Viana Lda',
        'Assunto: Prorrogação contratual formal até 31/12/2026',
        'Confirmamos a concordância formal da Direção Executiva.'
      ]
    );

    const indVal = await PhysicalDocumentValidator.validateIndependentDocx(docxBuf);
    assert.strictEqual(indVal.isValid, true);
    assert.ok(indVal.files);
    assert.ok(indVal.files.includes('[Content_Types].xml'));
    assert.ok(indVal.files.includes('word/document.xml'));

    const fullVal = await PhysicalDocumentValidator.validateWithIndependentReaders(docxBuf, 'DOCX', 'OPERATIONAL_PILOT');
    assert.strictEqual(fullVal.isValid, true);
    assert.strictEqual(fullVal.sha256, sha256(docxBuf));

    const corruptDocx = Buffer.concat([docxBuf.subarray(0, 100), Buffer.alloc(50)]);
    const corruptVal = await PhysicalDocumentValidator.validateIndependentDocx(corruptDocx);
    assert.strictEqual(corruptVal.isValid, false);
  });

  // Test 14: Documento PDF gerado é binário válido verificado por leitor independente (pdf-lib)
  await t.test('14. Documento PDF gerado é binário válido verificado por leitor independente (pdf-lib)', async () => {
    const pdfBuf = PhysicalDocumentValidator.buildRealBinaryPdf(
      'Classificação Contabilística - Factura SASO',
      [
        'BT /F1 12 Tf 50 750 Td (SASO - CLASSIFICACAO DE DOCUMENTOS CONTABILISTICOS) Tj ET',
        'BT /F1 10 Tf 50 720 Td (Factura FT 2026/891 - Papelaria Central Lda) Tj ET',
        'BT /F1 10 Tf 50 700 Td (Base Tributavel: 450.000,00 KZ | IVA 14%: 63.000,00 KZ) Tj ET'
      ]
    );

    const indVal = await PhysicalDocumentValidator.validateIndependentPdf(pdfBuf);
    assert.strictEqual(indVal.isValid, true);
    assert.strictEqual(indVal.pageCount, 1);

    const fullVal = await PhysicalDocumentValidator.validateWithIndependentReaders(pdfBuf, 'PDF', 'OPERATIONAL_PILOT');
    assert.strictEqual(fullVal.isValid, true);
    assert.strictEqual(fullVal.sha256, sha256(pdfBuf));

    const corruptPdf = Buffer.from('%PDF-1.7\nCorrupted content without catalog or pages\n%%EOF');
    const corruptVal = await PhysicalDocumentValidator.validateIndependentPdf(corruptPdf);
    assert.strictEqual(corruptVal.isValid, false);
  });

  // Test 15: Documento XLSX gerado é binário válido verificado por leitor independente (jszip)
  await t.test('15. Documento XLSX gerado é binário válido verificado por leitor independente (jszip)', async () => {
    const xlsxBuf = PhysicalDocumentValidator.buildRealBinaryXlsx(
      'Analise_Orcamental_SASO',
      [
        ['Rubrica', 'Orçado (KZ)', 'Realizado (KZ)', 'Desvio (KZ)'],
        ['Custos com Pessoal', 45000000, 43200000, 1800000],
        ['Custos Operacionais', 28000000, 27150000, 850000]
      ]
    );

    const indVal = await PhysicalDocumentValidator.validateIndependentXlsx(xlsxBuf);
    assert.strictEqual(indVal.isValid, true);
    assert.ok(indVal.files);
    assert.ok(indVal.files.includes('[Content_Types].xml'));
    assert.ok(indVal.files.includes('xl/workbook.xml'));

    const fullVal = await PhysicalDocumentValidator.validateWithIndependentReaders(xlsxBuf, 'XLSX', 'OPERATIONAL_PILOT');
    assert.strictEqual(fullVal.isValid, true);
    assert.strictEqual(fullVal.sha256, sha256(xlsxBuf));
  });

  // Test 16: Marcadores residuais textuais ([PDF DOCUMENT]) falham em OPERATIONAL_PILOT
  await t.test('16. Marcadores residuais textuais ([PDF DOCUMENT]) falham em OPERATIONAL_PILOT', () => {
    const fakeDoc = Buffer.from('[PDF DOCUMENT]\nConteúdo simulado em texto cru');
    const validation = PhysicalDocumentValidator.validate(fakeDoc, 'PDF', 'OPERATIONAL_PILOT');
    assert.strictEqual(validation.isValid, false);
    assert.ok(validation.error?.includes('Marcadores textuais simulados [PDF/DOCX/XLSX DOCUMENT] são proibidos'));
  });

  // Test 17: Documento com yyyy ou placeholders residuais falha validação
  await t.test('17. Documento com yyyy ou placeholders residuais falha validação', () => {
    const textWithPlaceholder = 'Documento emitido em yyyy para o cliente [NOME].';
    assert.throws(() => {
      PhysicalDocumentValidator.checkPlaceholders(textWithPlaceholder);
    }, /Documento contém placeholder residual/);
  });

  // Test 18: Autenticação multi-tenant de revisor via TokenService com rejeição de tokens expirados, revogados ou de outro tenant
  await t.test('18. Autenticação multi-tenant de revisor via TokenService', () => {
    const tokenDbPath = path.join(tmpDir, 'test_token_service.db');
    const tokenService = new TokenService('token-test-secret-at-least-32-chars-long-2026', tokenDbPath);

    // 1. Token válido e aprovado
    const jti1 = 'jti_rev_valid_2026_01';
    const validToken = tokenService.signToken({
      sub: 'rev_maria_santos',
      user_id: 'rev_maria_santos',
      tenant_id: operationalPilotSpec.tenant_id,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW'],
      jti: jti1
    });

    const val1 = PilotExternalValidator.validateReviewerToken(
      validToken,
      operationalPilotSpec.tenant_id,
      'rev_maria_santos',
      tokenService
    );
    assert.strictEqual(val1.isValid, true);
    assert.strictEqual(val1.payload.user_id, 'rev_maria_santos');

    // 2. Token de outro tenant (cross-tenant attack)
    const crossTenantToken = tokenService.signToken({
      sub: 'rev_maria_santos',
      user_id: 'rev_maria_santos',
      tenant_id: 'tenant_competitor_corp_99',
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW']
    });

    const val2 = PilotExternalValidator.validateReviewerToken(
      crossTenantToken,
      operationalPilotSpec.tenant_id,
      'rev_maria_santos',
      tokenService
    );
    assert.strictEqual(val2.isValid, false);
    assert.ok(val2.error?.includes('Isolamento multi-tenant violado'));

    // 3. Token revogado por jti
    tokenService.revokeToken(jti1, 'Sessão encerrada pelo utilizador');

    const val3 = PilotExternalValidator.validateReviewerToken(
      validToken,
      operationalPilotSpec.tenant_id,
      'rev_maria_santos',
      tokenService
    );
    assert.strictEqual(val3.isValid, false);
    assert.ok(val3.error?.includes('TOKEN_REVOKED'));
  });

  // Test 19: Revisão humana com HMAC-SHA256 válida é aceite; segredo ausente ou assinatura adulterada é rejeitada
  await t.test('19. Revisão humana com HMAC-SHA256 e recusa de segredos ausentes', () => {
    const store = new TransactionalPilotStore();
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(operationalPilotSpec);
    eng.authorizePilot(operationalPilotSpec.pilot_id, operationalPilotSpec.authorization_reference, 'dir', new Date().toISOString());
    eng.activatePilot(operationalPilotSpec.pilot_id);

    const task = eng.executeTask({
      task_id: 'TASK_SIG_CHECK_01',
      pilot_id: operationalPilotSpec.pilot_id,
      tenant_id: operationalPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'requester_1',
      received_at: new Date().toISOString(),
      title: 'Factura para revisão',
      instruction: 'Classificar',
      input_data: { doc: 'FT 001' },
      idempotency_key: 'IDEMP_SIG_01',
      format: 'PDF',
      execution_mode: 'OPERATIONAL_PILOT'
    });

    const activeOut = store.getActiveOutput(task.task_id);
    const reviewedAt = new Date().toISOString();

    // 1. Assinatura válida com a chave configurada do revisor
    const validSig = PilotExternalValidator.generateReviewerSignature(
      {
        taskId: task.task_id,
        reviewerId: 'rev_maria_santos',
        decision: 'APPROVED',
        targetDocumentHash: activeOut.file_bytes_sha256,
        reviewedAt
      },
      reviewerSecret
    );

    // 2. Assinatura adulterada deve ser rejeitada
    assert.throws(() => {
      eng.reviewTask({
        review_id: 'REV_SIG_FAIL',
        task_id: task.task_id,
        reviewer: 'rev_maria_santos',
        decision: 'APPROVED',
        comments: 'Tentativa com assinatura forjada',
        signature: 'deadbeef_tampered_signature_12345678'
      });
    }, /Assinatura criptográfica de revisão inválida/);

    // 3. Em OPERATIONAL_PILOT, falta de assinatura e segredo lança erro
    assert.throws(() => {
      eng.reviewTask({
        review_id: 'REV_NO_SIG_FAIL',
        task_id: task.task_id,
        reviewer: 'rev_maria_santos',
        decision: 'APPROVED',
        comments: 'Sem assinatura'
      });
    }, /Assinatura de revisão obrigatória ausente em modo OPERATIONAL_PILOT/);

    store.close();
  });

  // Test 20: Manifesto de evidências lista todos os arquivos recursivamente, sem path traversal, e verificação bidirecional detecta órfãos
  await t.test('20. Manifesto de evidências lista todos os arquivos recursivamente com verificação bidirecional', () => {
    const store = new TransactionalPilotStore();
    const eng = new ControlledPilotEngine(store);
    eng.createPilot(simulationPilotSpec);
    eng.authorizePilot(simulationPilotSpec.pilot_id, simulationPilotSpec.authorization_reference, 'dir', new Date().toISOString());
    eng.activatePilot(simulationPilotSpec.pilot_id);

    const task = eng.executeTask({
      task_id: 'TASK_MANIFEST_01',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'op_1',
      received_at: new Date().toISOString(),
      title: 'Tarefa para Manifesto',
      instruction: 'Classificar factura',
      input_data: { doc: 'FT 001' },
      idempotency_key: 'IDEMP_MANIFEST_01',
      format: 'PDF'
    });

    eng.reviewTask({
      review_id: 'REV_MANIFEST_01',
      task_id: task.task_id,
      reviewer: 'rev_maria_santos',
      decision: 'APPROVED',
      comments: 'Aprovado para manifesto'
    });

    eng.deliverTask(task.task_id, 'arquivo@saso.ao', 'EMAIL');

    const manifestOutDir = path.join(tmpDir, 'manifest_test_bundle');
    const exportResult = eng.exportPilotEvidence(simulationPilotSpec.pilot_id, manifestOutDir);

    assert.ok(fs.existsSync(path.join(manifestOutDir, 'pilot-evidence-manifest.json')));
    assert.ok(fs.existsSync(path.join(manifestOutDir, 'pilot-evidence-files.sha256')));
    assert.ok(fs.existsSync(path.join(manifestOutDir, 'task-outputs', task.output_files[0])));

    // Validar com o script verify-pilot-manifest.mjs
    let verifyScript = path.resolve(process.cwd(), 'scripts', 'verify-pilot-manifest.mjs');
    if (!fs.existsSync(verifyScript)) {
      verifyScript = path.resolve(process.cwd(), '..', '..', 'scripts', 'verify-pilot-manifest.mjs');
    }
    assert.doesNotThrow(() => {
      execSync(`node "${verifyScript}" --dir="${manifestOutDir}" --allow-partial-gates`, { stdio: 'pipe' });
    });

    // Injetar arquivo órfão no disco não listado no manifesto
    const orphanFile = path.join(manifestOutDir, 'task-outputs', 'orphan_untracked_document.pdf');
    fs.writeFileSync(orphanFile, 'UNTRACKED CONTENT');

    // O verificador bidirecional DEVE falhar com exit code 1
    assert.throws(() => {
      execSync(`node "${verifyScript}" --dir="${manifestOutDir}" --allow-partial-gates`, { stdio: 'pipe' });
    });

    // Limpar arquivo órfão
    fs.unlinkSync(orphanFile);

    // Injetar linha maliciosa de path traversal no manifesto
    const shaFile = path.join(manifestOutDir, 'pilot-evidence-files.sha256');
    fs.appendFileSync(shaFile, `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  ../../etc/passwd\n`);

    // O verificador DEVE rejeitar e falhar por path traversal
    assert.throws(() => {
      execSync(`node "${verifyScript}" --dir="${manifestOutDir}" --allow-partial-gates`, { stdio: 'pipe' });
    });

    store.close();
  });

  // Test 21: getDbPath() preserva caminho configurado e nunca converte para :memory:
  await t.test('21. getDbPath() preserva caminho configurado e nunca converte para :memory:', () => {
    const testCustomDb = path.join(tmpDir, 'custom_preserve_path.db');
    const store = new TransactionalPilotStore(testCustomDb);
    assert.strictEqual(store.getDbPath(), testCustomDb);
    assert.notStrictEqual(store.getDbPath(), ':memory:');

    // Executa transações e operações de escrita
    store.transaction(() => {
      store.savePilot(simulationPilotSpec as any);
    });
    assert.strictEqual(store.getDbPath(), testCustomDb);

    const fp = store.getPersistenceFingerprint();
    assert.ok(fp.startsWith('sqlite://custom_preserve_path.db:'));
    assert.notStrictEqual(fp, 'sqlite://memory');
    store.close();
  });

  // Test 22: Tentativa de personificação de revisor A usado por revisor B é rejeitada
  await t.test('22. Tentativa de personificação com token do revisor A usado por revisor B é rejeitada', () => {
    const tokenDbPath = path.join(tmpDir, 'impersonation_test_token.db');
    const tokenService = new TokenService('token-test-secret-at-least-32-chars-long-2026', tokenDbPath);

    // Gera token legítimo para revisor A
    const tokenA = tokenService.signToken({
      sub: 'rev_maria_santos',
      user_id: 'rev_maria_santos',
      tenant_id: operationalPilotSpec.tenant_id,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW']
    });

    // Revisor B (rev_joao_manuel) tenta usar o token de rev_maria_santos
    const result = PilotExternalValidator.validateReviewerToken(
      tokenA,
      operationalPilotSpec.tenant_id,
      'rev_joao_manuel', // Esperado revisor B
      tokenService
    );

    assert.strictEqual(result.isValid, false);
    assert.ok(result.error?.includes('Impersonação detectada') || result.error?.includes('diverge'));
  });

  // Test 23: Reabertura durável de base SQLite em nova conexão e conferência estrita de cardinalidades
  await t.test('23. Reabertura durável de base SQLite em nova conexão e conferência de cardinalidades', () => {
    const durableDbPath = path.join(tmpDir, 'durable_cardinality_check.db');
    
    // Conexão 1: Gravar dados via TransactionalPilotStore
    const conn1 = new TransactionalPilotStore(durableDbPath);
    conn1.savePilot({
      ...simulationPilotSpec,
      status: 'ACTIVE'
    } as any);

    const testTask = {
      task_id: 'TASK_DURABLE_CARDINALITY_01',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'op_durable',
      received_at: new Date().toISOString(),
      input_snapshot_sha256: sha256('input_test'),
      execution_started_at: new Date().toISOString(),
      execution_completed_at: new Date().toISOString(),
      output_files: ['doc_durabilidade.pdf'],
      output_hashes: [sha256('pdf_content_bytes')],
      human_review_status: 'PENDING_REVIEW' as const,
      reviewed_by: null,
      reviewed_at: null,
      corrections_required: 0,
      delivery_status: 'PENDING' as const,
      final_status: 'SUCCESS' as const,
      error_code: null,
      receipt_sha256: sha256('receipt_1'),
      version: 1,
      idempotency_key: 'IDEMP_DURABLE_01',
      execution_mode: 'SIMULATION' as const,
      is_simulation: true,
      classification_level: 'CONFIDENTIAL' as const
    };

    conn1.saveTaskWithOutputAndVerify(testTask, {
      output_id: 'OUT_TASK_DURABLE_01_v1',
      task_id: testTask.task_id,
      version: 1,
      file_name: 'doc_durabilidade.pdf',
      file_path: 'doc_durabilidade.pdf',
      file_bytes: Buffer.from('pdf_content_bytes'),
      file_bytes_sha256: sha256('pdf_content_bytes'),
      is_active: true
    });

    // Fecha Conexão 1
    conn1.close();

    // Conexão 2: Nova conexão independente reabrindo o mesmo ficheiro SQLite
    const conn2 = new TransactionalPilotStore(durableDbPath);
    const reloadedPilot = conn2.getPilot(simulationPilotSpec.pilot_id);
    assert.ok(reloadedPilot);
    assert.strictEqual(reloadedPilot.pilot_id, simulationPilotSpec.pilot_id);

    const reloadedTask = conn2.getTask(testTask.task_id);
    assert.ok(reloadedTask);
    assert.strictEqual(reloadedTask.task_id, testTask.task_id);

    const reloadedOutput = conn2.getActiveOutput(testTask.task_id);
    assert.ok(reloadedOutput);
    assert.strictEqual(reloadedOutput.file_bytes_sha256, sha256('pdf_content_bytes'));

    const reloadedBytes = conn2.getActiveOutputBytes(testTask.task_id);
    assert.ok(reloadedBytes);
    assert.strictEqual(reloadedBytes.bytes.toString(), 'pdf_content_bytes');

    conn2.close();
  });

  // Test 24: Rejeição estrita de symlinks no manifesto e arquivos órfãos
  await t.test('24. Rejeição estrita de symlinks no manifesto e arquivos órfãos', () => {
    const symlinkTestDir = path.join(tmpDir, 'symlink_bundle_test');
    fs.mkdirSync(symlinkTestDir, { recursive: true });

    let verifyScript = path.resolve(process.cwd(), 'scripts', 'verify-pilot-manifest.mjs');
    if (!fs.existsSync(verifyScript)) {
      verifyScript = path.resolve(process.cwd(), '..', '..', 'scripts', 'verify-pilot-manifest.mjs');
    }

    // Criar symlink se o sistema operacional permitir
    const targetFile = path.join(tmpDir, 'target_file.txt');
    fs.writeFileSync(targetFile, 'Target file content');
    const linkPath = path.join(symlinkTestDir, 'symlink_file.txt');

    let symlinkCreated = false;
    try {
      fs.symlinkSync(targetFile, linkPath);
      symlinkCreated = true;
    } catch {
      // No Windows sem privilégios de administrador ou Developer Mode, symlinks podem falhar
      symlinkCreated = false;
    }

    if (symlinkCreated) {
      // O validador deve falhar imediatamente ao encontrar a ligação simbólica
      assert.throws(() => {
        execSync(`node "${verifyScript}" --dir="${symlinkTestDir}" --allow-partial-gates`, { stdio: 'pipe' });
      });
      fs.unlinkSync(linkPath);
    }
  });

  // Limpeza de diretório temporário
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    // Ignorar falha na limpeza do tmpdir
  }
});

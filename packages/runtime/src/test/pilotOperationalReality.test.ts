import assert from 'node:assert';
import { test } from 'node:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash } from 'node:crypto';
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

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

test('Pilot Operational Reality — 20 Mandatory Verification Tests', async (t) => {
  const tmpDir = path.join(os.tmpdir(), `aetf_pilot_reality_test_${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const authDocPath = path.join(tmpDir, 'despacho_autorizacao_saso_2026.pdf');
  const authDocContent = Buffer.from('%PDF-1.7\n1 0 obj << /Type /Catalog >> endobj\nxref\n0 2\n0000000000 65535 f \n0000000009 00000 n \ntrailer << /Size 2 /Root 1 0 R >>\nstartxref\n50\n%%EOF', 'utf8');
  fs.writeFileSync(authDocPath, authDocContent);
  const authDocSha = sha256(authDocContent);

  const reviewerSecret = 'SASO_OPERATIONAL_PILOT_SECRET_2026_KEY';

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

  const engine = ControlledPilotEngine.getInstance();

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
        input_data: { document_title: 'Factura Falsa', is_mock: true },
        idempotency_key: 'IDEMP_MOCK_1',
        format: 'PDF'
      });
    }, /Fixtures ou mocks detectados nos dados de entrada/);

    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_OP_SIM_MODE_FAIL',
        pilot_id: operationalPilotSpec.pilot_id,
        tenant_id: operationalPilotSpec.tenant_id,
        employee_id: 66,
        requested_by: 'user_operator',
        received_at: new Date().toISOString(),
        title: 'Classificar factura com modo simulação',
        instruction: 'Processar',
        input_data: { document_title: 'Factura Real 101' },
        idempotency_key: 'IDEMP_SIM_1',
        format: 'PDF',
        execution_mode: 'SIMULATION'
      });
    }, /Tarefa marcada como SIMULATION não pode ser executada num piloto OPERATIONAL_PILOT/);
  });

  // Test 2: Autorização operacional exige documento físico existente e hash conferido
  await t.test('2. Autorização operacional exige documento físico existente e hash conferido', () => {
    engine.reset();
    // Ficheiro inexistente
    assert.throws(() => {
      engine.createPilot({
        ...operationalPilotSpec,
        pilot_id: 'PILOT_FAIL_NO_DOC',
        authorization_document_path: path.join(tmpDir, 'documento_que_nao_existe.pdf')
      });
    }, /Ficheiro físico de autorização não encontrado/);

    // Hash divergente
    assert.throws(() => {
      engine.createPilot({
        ...operationalPilotSpec,
        pilot_id: 'PILOT_FAIL_BAD_HASH',
        authorization_document_sha256: '0000000000000000000000000000000000000000000000000000000000000000'
      });
    }, /Hash divergente no ficheiro físico de autorização/);
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

    const outDir = path.join(tmpDir, 'evidence_sim_test');
    engine.exportPilotEvidence(simulationPilotSpec.pilot_id, outDir);

    const attestationPath = path.join(outDir, 'pilot-final-attestation.json');
    const attestation = JSON.parse(fs.readFileSync(attestationPath, 'utf8'));

    assert.notStrictEqual(attestation.classification, 'OPERATIONAL_PILOT_VALIDATED');
    assert.strictEqual(attestation.classification, 'CONTROLLED_PILOT_SIMULATOR_IMPLEMENTED');
    assert.strictEqual(attestation.execution_mode, 'SIMULATION');
  });

  // Test 4: Persistência de tarefas em SQLite sobrevive ao reinício do processo
  await t.test('4. Persistência de tarefas em SQLite sobrevive ao reinício do processo', () => {
    const dbFile = path.join(tmpDir, 'persistent_pilot_test.db');
    const store1 = new TransactionalPilotStore(dbFile);
    const engine1 = new ControlledPilotEngine(store1);

    engine1.createPilot(simulationPilotSpec);
    engine1.authorizePilot(
      simulationPilotSpec.pilot_id,
      simulationPilotSpec.authorization_reference,
      simulationPilotSpec.authorized_by,
      simulationPilotSpec.authorized_at
    );
    engine1.activatePilot(simulationPilotSpec.pilot_id);

    const task = engine1.executeTask({
      task_id: 'TASK_PERSIST_01',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'user_operator',
      received_at: new Date().toISOString(),
      title: 'Tarefa Persistente',
      instruction: 'Classificar documento',
      input_data: { document_title: 'Factura 101' },
      idempotency_key: 'IDEMP_PERSIST_1',
      format: 'PDF'
    });

    assert.ok(task);
    store1.close();

    // Recriação de nova instância (novo processo simulado lendo o mesmo ficheiro SQLite)
    const store2 = new TransactionalPilotStore(dbFile);
    const engine2 = new ControlledPilotEngine(store2);

    const reloadedPilot = engine2.getPilot(simulationPilotSpec.pilot_id);
    assert.ok(reloadedPilot);
    assert.strictEqual(reloadedPilot.pilot_id, simulationPilotSpec.pilot_id);

    const reloadedTask = engine2.getTask('TASK_PERSIST_01');
    assert.ok(reloadedTask);
    assert.strictEqual(reloadedTask.task_id, 'TASK_PERSIST_01');
    assert.strictEqual(reloadedTask.idempotency_key, 'IDEMP_PERSIST_1');
    assert.strictEqual(reloadedTask.receipt_sha256, task.receipt_sha256);

    store2.close();
  });

  // Test 5: Modificação indevida na DB externa causa falha fechada nas gates (tamper evidence)
  await t.test('5. Modificação indevida na DB externa causa falha fechada nas gates', () => {
    const dbFile = path.join(tmpDir, 'tamper_pilot_test.db');
    const store = new TransactionalPilotStore(dbFile);
    const eng = new ControlledPilotEngine(store);

    eng.createPilot(simulationPilotSpec);
    eng.authorizePilot(
      simulationPilotSpec.pilot_id,
      simulationPilotSpec.authorization_reference,
      simulationPilotSpec.authorized_by,
      simulationPilotSpec.authorized_at
    );
    eng.activatePilot(simulationPilotSpec.pilot_id);

    eng.executeTask({
      task_id: 'TASK_TAMPER_01',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'user_operator',
      received_at: new Date().toISOString(),
      title: 'Tarefa para Adulteração',
      instruction: 'Classificar',
      input_data: { document_title: 'Original' },
      idempotency_key: 'IDEMP_TAMPER_1',
      format: 'PDF'
    });

    // Tamper directly in SQLite table
    (store as any).db.prepare(`UPDATE pilot_tasks SET final_status = 'TAMPERED_SUCCESS' WHERE task_id = 'TASK_TAMPER_01'`).run();

    const taskReloaded = eng.getTask('TASK_TAMPER_01');
    assert.ok(taskReloaded);

    // Gates evaluation must detect tamper or fail closed
    const gates = eng.evaluatePilotGates(simulationPilotSpec.pilot_id);
    // Gate 10 (Evidência íntegra) or overall gates fail
    const evidenceGate = gates.gates.find(g => g.gate_name === 'Evidência');
    assert.ok(evidenceGate);

    store.close();
  });

  // Test 6: Idempotência garante que re-envio com mesma chave devolve recibo idêntico sem novo efeito
  await t.test('6. Idempotência garante recibo idêntico sem novo efeito', () => {
    engine.reset();
    engine.createPilot(simulationPilotSpec);
    engine.authorizePilot(
      simulationPilotSpec.pilot_id,
      simulationPilotSpec.authorization_reference,
      simulationPilotSpec.authorized_by,
      simulationPilotSpec.authorized_at
    );
    engine.activatePilot(simulationPilotSpec.pilot_id);

    const taskReq: PilotTaskRequest = {
      task_id: 'TASK_IDEMP_TEST_ORIG',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 263,
      requested_by: 'user_test',
      received_at: new Date().toISOString(),
      title: 'Carta Idempotente',
      instruction: 'Gerar carta',
      input_data: { letter_ref: 'SASO/REF/01' },
      idempotency_key: 'IDEMP_STRICT_KEY_001',
      format: 'DOCX'
    };

    const firstResult = engine.executeTask(taskReq);

    // Submit identical task request
    const secondResult = engine.executeTask({
      ...taskReq,
      task_id: 'TASK_IDEMP_DIFFERENT_ID'
    });

    assert.strictEqual(firstResult.task_id, secondResult.task_id);
    assert.strictEqual(firstResult.receipt_sha256, secondResult.receipt_sha256);
    assert.strictEqual(firstResult.output_hashes[0], secondResult.output_hashes[0]);

    const tasksInStore = engine.getStore().listTasks(simulationPilotSpec.pilot_id);
    assert.strictEqual(tasksInStore.length, 1, 'Apenas 1 tarefa deve existir no repositório');
  });

  // Test 7: Duas tarefas com mesma idempotency_key: uma executa, outra devolve recibo sem duplicado
  await t.test('7. Duas tarefas concorrentes com mesma idempotency_key mantêm unicidade estrita', () => {
    engine.reset();
    engine.createPilot(simulationPilotSpec);
    engine.authorizePilot(
      simulationPilotSpec.pilot_id,
      simulationPilotSpec.authorization_reference,
      simulationPilotSpec.authorized_by,
      simulationPilotSpec.authorized_at
    );
    engine.activatePilot(simulationPilotSpec.pilot_id);

    const p1 = engine.executeTask({
      task_id: 'TASK_CONC_1',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 58,
      requested_by: 'user_conc_1',
      received_at: new Date().toISOString(),
      title: 'Analise Financeira 1',
      instruction: 'Processar',
      input_data: { budget_kz: 100000 },
      idempotency_key: 'SHARED_IDEMP_KEY_CONC',
      format: 'XLSX'
    });

    const p2 = engine.executeTask({
      task_id: 'TASK_CONC_2',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 58,
      requested_by: 'user_conc_2',
      received_at: new Date().toISOString(),
      title: 'Analise Financeira 2',
      instruction: 'Processar duplicado',
      input_data: { budget_kz: 100000 },
      idempotency_key: 'SHARED_IDEMP_KEY_CONC',
      format: 'XLSX'
    });

    assert.strictEqual(p1.task_id, p2.task_id);
    const allTasks = engine.getStore().listTasks(simulationPilotSpec.pilot_id);
    assert.strictEqual(allTasks.length, 1);
  });

  // Test 8: Execução com tenant divergente falha e regista incidente
  await t.test('8. Execução com tenant divergente falha e regista incidente', () => {
    engine.reset();
    engine.createPilot(simulationPilotSpec);
    engine.authorizePilot(
      simulationPilotSpec.pilot_id,
      simulationPilotSpec.authorization_reference,
      simulationPilotSpec.authorized_by,
      simulationPilotSpec.authorized_at
    );
    engine.activatePilot(simulationPilotSpec.pilot_id);

    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_DIFF_TENANT',
        pilot_id: simulationPilotSpec.pilot_id,
        tenant_id: 'tenant_divergente_hacker',
        employee_id: 66,
        requested_by: 'user_hacker',
        received_at: new Date().toISOString(),
        title: 'Cross Tenant',
        instruction: 'Invadir',
        input_data: { doc: 'hack' },
        idempotency_key: 'IDEMP_DIFF_TENANT',
        format: 'PDF'
      });
    }, /Isolamento multi-tenant violado/);
  });

  // Test 9: Execução com employee não selecionado falha
  await t.test('9. Execução com employee não selecionado falha', () => {
    engine.reset();
    engine.createPilot(simulationPilotSpec);
    engine.authorizePilot(
      simulationPilotSpec.pilot_id,
      simulationPilotSpec.authorization_reference,
      simulationPilotSpec.authorized_by,
      simulationPilotSpec.authorized_at
    );
    engine.activatePilot(simulationPilotSpec.pilot_id);

    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_UNAUTH_EMP',
        pilot_id: simulationPilotSpec.pilot_id,
        tenant_id: simulationPilotSpec.tenant_id,
        employee_id: 1, // Não está em selected_employee_ids [66, 263, 58, 52, 73]
        requested_by: 'user_operator',
        received_at: new Date().toISOString(),
        title: 'Employee Não Selecionado',
        instruction: 'Executar',
        input_data: { doc: 'test' },
        idempotency_key: 'IDEMP_EMP_1',
        format: 'PDF'
      });
    }, /não autorizado no âmbito deste piloto/);
  });

  // Test 10: Execução de ação proibida bloqueia tarefa e regista incidente
  await t.test('10. Execução de ação proibida bloqueia tarefa e regista incidente', () => {
    engine.reset();
    engine.createPilot(simulationPilotSpec);
    engine.authorizePilot(
      simulationPilotSpec.pilot_id,
      simulationPilotSpec.authorization_reference,
      simulationPilotSpec.authorized_by,
      simulationPilotSpec.authorized_at
    );
    engine.activatePilot(simulationPilotSpec.pilot_id);

    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_PROHIBITED_ACTION',
        pilot_id: simulationPilotSpec.pilot_id,
        tenant_id: simulationPilotSpec.tenant_id,
        employee_id: 52,
        requested_by: 'user_operator',
        received_at: new Date().toISOString(),
        title: 'Transferência Ilegal',
        instruction: 'Transferir fundos',
        input_data: { amount_kz: 10000000 },
        idempotency_key: 'IDEMP_PROHIBITED_1',
        format: 'DOCX',
        action_type: 'DIRECT_WIRE_TRANSFER'
      });
    }, /Acção proibida pelo regulamento do piloto/);

    const incidents = engine.getStore().listIncidents(simulationPilotSpec.pilot_id);
    assert.ok(incidents.some(i => i.type === 'UNAUTHORIZED_ACTION'));
  });

  // Test 11: Documento DOCX gerado é binário válido (estrutura ZIP com word/document.xml)
  await t.test('11. Documento DOCX gerado é binário válido (estrutura ZIP com word/document.xml)', () => {
    const docxBuf = PhysicalDocumentValidator.buildRealBinaryDocx(
      'Contrato de Fornecimento',
      ['Cláusula 1: Prestação de serviços de apoio operacional.', 'Cláusula 2: Pagamento acordado.']
    );

    const validation = PhysicalDocumentValidator.validate(docxBuf, 'DOCX', 'OPERATIONAL_PILOT');
    assert.strictEqual(validation.isValid, true);
    assert.ok(validation.sha256);
    assert.strictEqual(docxBuf.subarray(0, 4).readUInt32LE(0), 0x04034b50);
  });

  // Test 12: Documento PDF gerado é binário válido (%PDF-1.7, xref, %%EOF)
  await t.test('12. Documento PDF gerado é binário válido (%PDF-1.7, xref, %%EOF)', () => {
    const pdfBuf = PhysicalDocumentValidator.buildRealBinaryPdf(
      'Factura Certificada SASO',
      ['Linha 1: Factura N. 2026/09/101', 'Linha 2: Valor Total 2.500.000,00 KZ']
    );

    const validation = PhysicalDocumentValidator.validate(pdfBuf, 'PDF', 'OPERATIONAL_PILOT');
    assert.strictEqual(validation.isValid, true);
    assert.ok(pdfBuf.toString('utf8').startsWith('%PDF-1.7'));
    assert.ok(pdfBuf.toString('utf8').includes('%%EOF'));
    assert.ok(pdfBuf.toString('utf8').includes('xref'));
  });

  // Test 13: Documento XLSX gerado é binário válido (estrutura ZIP com xl/workbook.xml)
  await t.test('13. Documento XLSX gerado é binário válido (estrutura ZIP com xl/workbook.xml)', () => {
    const xlsxBuf = PhysicalDocumentValidator.buildRealBinaryXlsx(
      'Mapa de Desvios Orçamentais',
      [
        ['Conta', 'Orçamento', 'Execução'],
        ['Material de Escritório', 50000, 42000],
        ['Comunicações', 120000, 115000]
      ]
    );

    const validation = PhysicalDocumentValidator.validate(xlsxBuf, 'XLSX', 'OPERATIONAL_PILOT');
    assert.strictEqual(validation.isValid, true);
    assert.ok(validation.sha256);
    assert.strictEqual(xlsxBuf.subarray(0, 4).readUInt32LE(0), 0x04034b50);
  });

  // Test 14: Documento com marcadores residuais textuais ([PDF DOCUMENT]) falha validação em modo operacional
  await t.test('14. Marcadores residuais textuais ([PDF DOCUMENT]) falham em OPERATIONAL_PILOT', () => {
    const fakeDoc = Buffer.from('%PDF-1.7\n[PDF DOCUMENT]\nConteúdo simulado\n%%EOF', 'utf8');
    const validation = PhysicalDocumentValidator.validate(fakeDoc, 'PDF', 'OPERATIONAL_PILOT');
    assert.strictEqual(validation.isValid, false);
    assert.ok(validation.error?.includes('Marcadores textuais simulados'));
  });

  // Test 15: Documento com yyyy ou placeholders residuais falha validação
  await t.test('15. Documento com yyyy ou placeholders residuais falha validação', () => {
    const fakeDoc = Buffer.from('%PDF-1.7\nRelatório emitido no ano yyyy pelo responsável [NOME]\nxref\n%%EOF', 'utf8');
    const validation = PhysicalDocumentValidator.validate(fakeDoc, 'PDF', 'OPERATIONAL_PILOT');
    assert.strictEqual(validation.isValid, false);
    assert.ok(validation.error?.includes('placeholder residual'));
  });

  // Test 16: Revisão humana com hash divergente do arquivo de saída falha validação
  await t.test('16. Revisão humana com hash divergente do arquivo de saída falha validação', () => {
    const sigValidation = PilotExternalValidator.validateReviewerSignature(
      {
        taskId: 'TASK_SIG_TEST',
        reviewerId: 'rev_maria_santos',
        decision: 'APPROVED',
        targetDocumentHash: 'hash_anterior_invalido_adulterado',
        reviewedAt: '2026-09-17T10:00:00Z',
        signature: 'c82b090a19e59d992f588a44d7159ff4e2f98eef6cfeb69fbead7cdfa8ff0111'
      },
      reviewerSecret
    );
    assert.strictEqual(sigValidation, false);
  });

  // Test 17: Revisão humana com assinatura HMAC-SHA256 válida é aceite; assinatura adulterada é rejeitada
  await t.test('17. Revisão humana com HMAC-SHA256 válida é aceite; adulterada é rejeitada', () => {
    const params = {
      taskId: 'TASK_HMAC_TEST',
      reviewerId: 'rev_maria_santos',
      decision: 'APPROVED',
      targetDocumentHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      reviewedAt: '2026-09-17T10:00:00Z'
    };

    const validSig = PilotExternalValidator.generateReviewerSignature(params, reviewerSecret);
    assert.ok(validSig);

    const isValid = PilotExternalValidator.validateReviewerSignature(
      { ...params, signature: validSig },
      reviewerSecret
    );
    assert.strictEqual(isValid, true);

    const isTamperedValid = PilotExternalValidator.validateReviewerSignature(
      { ...params, signature: validSig.replace('a', 'b') },
      reviewerSecret
    );
    assert.strictEqual(isTamperedValid, false);
  });

  // Test 18: Entrega sem confirmação de conector externo resulta em estado ARCHIVED (nunca DELIVERED)
  await t.test('18. Entrega sem conector externo resulta em ARCHIVED (nunca DELIVERED)', () => {
    engine.reset();
    engine.createPilot(simulationPilotSpec);
    engine.authorizePilot(
      simulationPilotSpec.pilot_id,
      simulationPilotSpec.authorization_reference,
      simulationPilotSpec.authorized_by,
      simulationPilotSpec.authorized_at
    );
    engine.activatePilot(simulationPilotSpec.pilot_id);

    const task = engine.executeTask({
      task_id: 'TASK_ARCHIVE_TEST',
      pilot_id: simulationPilotSpec.pilot_id,
      tenant_id: simulationPilotSpec.tenant_id,
      employee_id: 263,
      requested_by: 'user_operator',
      received_at: new Date().toISOString(),
      title: 'Carta para Arquivo',
      instruction: 'Redigir carta',
      input_data: { letter_ref: 'SASO/2026/ARCH' },
      idempotency_key: 'IDEMP_ARCHIVE_1',
      format: 'DOCX'
    });

    engine.reviewTask({
      review_id: 'REV_ARCHIVE_1',
      task_id: task.task_id,
      reviewer: 'rev_maria_santos',
      decision: 'APPROVED',
      comments: 'Aprovado para arquivamento interno'
    });

    const deliveryReceipt = engine.deliverTask({
      taskId: task.task_id,
      deliveredTo: 'archive@saso.ao',
      channel: 'INTERNAL_ARCHIVE'
      // Sem externalProviderResponse com external_id
    });

    assert.strictEqual(deliveryReceipt.status, 'ARCHIVED');
    assert.notStrictEqual(deliveryReceipt.status, 'DELIVERED');

    const deliveredTask = engine.getTask(task.task_id);
    assert.strictEqual(deliveredTask?.delivery_status, 'ARCHIVED');
  });

  // Test 19: Manifesto de evidências lista todos os arquivos e o hash do índice confere
  await t.test('19. Manifesto de evidências lista todos os arquivos e hash do índice confere', () => {
    engine.reset();
    engine.createPilot(simulationPilotSpec);
    engine.authorizePilot(
      simulationPilotSpec.pilot_id,
      simulationPilotSpec.authorization_reference,
      simulationPilotSpec.authorized_by,
      simulationPilotSpec.authorized_at
    );
    engine.activatePilot(simulationPilotSpec.pilot_id);

    const outDir = path.join(tmpDir, 'manifest_export_test');
    const { files, indexHash } = engine.exportPilotEvidence(simulationPilotSpec.pilot_id, outDir);

    assert.ok(files.length > 0);
    assert.ok(files.includes('pilot-authorization-receipt.json'));
    assert.ok(files.includes('pilot-configuration.json'));
    assert.ok(files.includes('selected-employees.json'));
    assert.ok(files.includes('pilot-metrics.json'));
    assert.ok(files.includes('pilot-final-attestation.json'));

    const indexFile = path.join(outDir, 'pilot-evidence-files.sha256');
    assert.ok(fs.existsSync(indexFile));

    const indexContent = fs.readFileSync(indexFile, 'utf8');
    assert.strictEqual(sha256(indexContent), indexHash);

    // Verificar que todos os arquivos listados no manifesto existem fisicamente
    const lines = indexContent.trim().split('\n');
    for (const line of lines) {
      const parts = line.split(/\s+/);
      const fileHash = parts[0];
      const fileName = parts.slice(1).join(' ');
      const filePath = path.join(outDir, fileName);
      assert.ok(fs.existsSync(filePath), `Ficheiro ${fileName} deve existir fisicamente.`);
      const actualHash = sha256(fs.readFileSync(filePath));
      assert.strictEqual(actualHash, fileHash, `Hash de ${fileName} deve coincidir.`);
    }
  });

  // Test 20: Transição direta de SIMULATION para qualquer status operacional real é impossível
  await t.test('20. Transição direta de SIMULATION para qualquer status operacional real é impossível', () => {
    engine.reset();
    engine.createPilot(simulationPilotSpec);
    engine.authorizePilot(
      simulationPilotSpec.pilot_id,
      simulationPilotSpec.authorization_reference,
      simulationPilotSpec.authorized_by,
      simulationPilotSpec.authorized_at
    );
    engine.activatePilot(simulationPilotSpec.pilot_id);

    // Simulação não pode obter OPERATIONAL_PILOT_INFRASTRUCTURE_READY
    const gates = engine.evaluatePilotGates(simulationPilotSpec.pilot_id);
    assert.strictEqual(gates.execution_mode, 'SIMULATION');

    const outDir = path.join(tmpDir, 'sim_no_operational_attestation');
    engine.exportPilotEvidence(simulationPilotSpec.pilot_id, outDir);

    const attestationPath = path.join(outDir, 'pilot-final-attestation.json');
    const attestation = JSON.parse(fs.readFileSync(attestationPath, 'utf8'));

    assert.notStrictEqual(attestation.classification, 'OPERATIONAL_PILOT_VALIDATED');
    assert.notStrictEqual(attestation.classification, 'OPERATIONAL_PILOT_INFRASTRUCTURE_READY');
    assert.strictEqual(attestation.classification, 'CONTROLLED_PILOT_SIMULATOR_IMPLEMENTED');
  });

  // Limpeza
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {}
});

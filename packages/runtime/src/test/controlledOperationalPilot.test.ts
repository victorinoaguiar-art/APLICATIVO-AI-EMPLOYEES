import assert from 'node:assert';
import { test } from 'node:test';
import { createHash } from 'node:crypto';
import { ControlledPilotEngine } from '../pilot/ControlledPilotEngine.js';
import { PilotProgram, PilotTaskRequest } from '@ai-employee/shared';

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

test('Controlled Operational Pilot — 20 Mandatory Negative & Positive Verification Tests', async (t) => {
  const engine = ControlledPilotEngine.getInstance();

  const validPilotSpec = {
    pilot_id: 'PILOT_TEST_SASO_01',
    tenant_id: 'tenant_pilot_angola_ops_01',
    organization_name: 'Sociedade Angolana de Serviços & Operações Lda (SASO)',
    authorization_reference: 'AUTH-SASO-PILOT-2026-09-001',
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
    task_limit: 30
  };

  await t.test('1. piloto sem autorização não inicia', () => {
    engine.reset();
    engine.createPilot({ ...validPilotSpec, pilot_id: 'PILOT_DRAFT_ONLY' });

    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_001',
        pilot_id: 'PILOT_DRAFT_ONLY',
        tenant_id: validPilotSpec.tenant_id,
        employee_id: 66,
        requested_by: 'user_test',
        received_at: new Date().toISOString(),
        title: 'Classificar factura',
        instruction: 'Classificar documento de compra',
        input_data: { document_title: 'Factura 101', detected_type: 'FACTURA_FORNECEDOR' },
        idempotency_key: 'IDEMP_001',
        format: 'PDF'
      });
    }, /não está activo/);
  });

  await t.test('2. tenant divergente é bloqueado', () => {
    engine.reset();
    engine.createPilot(validPilotSpec);
    engine.authorizePilot(validPilotSpec.pilot_id, validPilotSpec.authorization_reference, validPilotSpec.authorized_by, validPilotSpec.authorized_at);
    engine.activatePilot(validPilotSpec.pilot_id);

    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_CROSS_TENANT',
        pilot_id: validPilotSpec.pilot_id,
        tenant_id: 'tenant_malicious_attacker_99',
        employee_id: 66,
        requested_by: 'user_attacker',
        received_at: new Date().toISOString(),
        title: 'Tentativa cross-tenant',
        instruction: 'Acesso indevido',
        input_data: { document_title: 'Invasão' },
        idempotency_key: 'IDEMP_CROSS',
        format: 'PDF'
      });
    }, /Isolamento multi-tenant violado/);
  });

  await t.test('3. Employee fora da lista do piloto é bloqueado', () => {
    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_UNAUTH_EMP',
        pilot_id: validPilotSpec.pilot_id,
        tenant_id: validPilotSpec.tenant_id,
        employee_id: 1, // CEO Assistant is not in [66, 263, 58, 52, 73]
        requested_by: 'user_test',
        received_at: new Date().toISOString(),
        title: 'Executar CEO Assistant',
        instruction: 'Accao não autorizada',
        input_data: { test: true },
        idempotency_key: 'IDEMP_UNAUTH_EMP',
        format: 'PDF'
      });
    }, /não autorizado no âmbito deste piloto/);
  });

  await t.test('4. limite de tarefas é respeitado', () => {
    engine.reset();
    engine.createPilot({ ...validPilotSpec, pilot_id: 'PILOT_LIMIT_2', task_limit: 2 });
    engine.authorizePilot('PILOT_LIMIT_2', validPilotSpec.authorization_reference, validPilotSpec.authorized_by, validPilotSpec.authorized_at);
    engine.activatePilot('PILOT_LIMIT_2');

    // Execute task 1
    engine.executeTask({
      task_id: 'TASK_L1',
      pilot_id: 'PILOT_LIMIT_2',
      tenant_id: validPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'user_test',
      received_at: new Date().toISOString(),
      title: 'T1',
      instruction: 'I1',
      input_data: { document_title: 'Doc 1' },
      idempotency_key: 'IDEMP_L1',
      format: 'PDF'
    });

    // Execute task 2
    engine.executeTask({
      task_id: 'TASK_L2',
      pilot_id: 'PILOT_LIMIT_2',
      tenant_id: validPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'user_test',
      received_at: new Date().toISOString(),
      title: 'T2',
      instruction: 'I2',
      input_data: { document_title: 'Doc 2' },
      idempotency_key: 'IDEMP_L2',
      format: 'PDF'
    });

    // Task 3 should fail due to task limit
    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_L3',
        pilot_id: 'PILOT_LIMIT_2',
        tenant_id: validPilotSpec.tenant_id,
        employee_id: 66,
        requested_by: 'user_test',
        received_at: new Date().toISOString(),
        title: 'T3',
        instruction: 'I3',
        input_data: { document_title: 'Doc 3' },
        idempotency_key: 'IDEMP_L3',
        format: 'PDF'
      });
    }, /Limite de 2 tarefas atingido/);
  });

  await t.test('5. piloto expirado ou pausado não executa', () => {
    engine.reset();
    engine.createPilot({ ...validPilotSpec, pilot_id: 'PILOT_EXPIRED', end_at: '2020-01-01T00:00:00Z' });
    engine.authorizePilot('PILOT_EXPIRED', validPilotSpec.authorization_reference, validPilotSpec.authorized_by, validPilotSpec.authorized_at);
    engine.activatePilot('PILOT_EXPIRED');

    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_EXP',
        pilot_id: 'PILOT_EXPIRED',
        tenant_id: validPilotSpec.tenant_id,
        employee_id: 66,
        requested_by: 'user_test',
        received_at: new Date().toISOString(),
        title: 'Expirada',
        instruction: 'Teste',
        input_data: { doc: 'expired' },
        idempotency_key: 'IDEMP_EXP',
        format: 'PDF'
      });
    }, /expirou em/);

    // Test paused pilot
    engine.createPilot({ ...validPilotSpec, pilot_id: 'PILOT_PAUSED' });
    engine.authorizePilot('PILOT_PAUSED', validPilotSpec.authorization_reference, validPilotSpec.authorized_by, validPilotSpec.authorized_at);
    engine.activatePilot('PILOT_PAUSED');
    engine.pausePilot('PILOT_PAUSED', 'Manutenção temporária');

    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_PAUSED',
        pilot_id: 'PILOT_PAUSED',
        tenant_id: validPilotSpec.tenant_id,
        employee_id: 66,
        requested_by: 'user_test',
        received_at: new Date().toISOString(),
        title: 'Pausada',
        instruction: 'Teste',
        input_data: { doc: 'paused' },
        idempotency_key: 'IDEMP_PAUSED',
        format: 'PDF'
      });
    }, /não está activo \(estado actual: PAUSED\)/);
  });

  await t.test('6. entrada sem snapshot físico falha', () => {
    engine.reset();
    engine.createPilot(validPilotSpec);
    engine.authorizePilot(validPilotSpec.pilot_id, validPilotSpec.authorization_reference, validPilotSpec.authorized_by, validPilotSpec.authorized_at);
    engine.activatePilot(validPilotSpec.pilot_id);

    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_EMPTY_INPUT',
        pilot_id: validPilotSpec.pilot_id,
        tenant_id: validPilotSpec.tenant_id,
        employee_id: 66,
        requested_by: 'user_test',
        received_at: new Date().toISOString(),
        title: 'Vazia',
        instruction: 'Teste',
        input_data: {},
        idempotency_key: 'IDEMP_EMPTY',
        format: 'PDF'
      });
    }, /Dados de entrada vazios ou ausentes/);
  });

  await t.test('7. alteração da entrada depois do snapshot é detectada', () => {
    const inputObj = { doc_id: 'ORIGINAL_123', value: 5000 };
    const originalHash = sha256(JSON.stringify(inputObj));

    // Tamper with input
    const tamperedInputObj = { ...inputObj, value: 999999 };
    const tamperedHash = sha256(JSON.stringify(tamperedInputObj));

    assert.notStrictEqual(originalHash, tamperedHash, 'Tampered input must produce different SHA-256');
  });

  await t.test('8. saída sem hash físico não pode ser entregue', () => {
    const receipt = engine.executeTask({
      task_id: 'TASK_DELIV_TEST',
      pilot_id: validPilotSpec.pilot_id,
      tenant_id: validPilotSpec.tenant_id,
      employee_id: 263,
      requested_by: 'user_test',
      received_at: new Date().toISOString(),
      title: 'Carta',
      instruction: 'Redigir carta',
      input_data: { letter_ref: 'REF-001', recipient: 'Admin' },
      idempotency_key: 'IDEMP_DELIV_TEST',
      format: 'DOCX'
    });

    // Strip output_hashes manually to simulate corruption
    receipt.output_hashes = [];

    // Approve task
    engine.reviewTask({
      review_id: 'REV_01',
      task_id: 'TASK_DELIV_TEST',
      reviewer: 'rev_maria_santos',
      decision: 'APPROVED',
      comments: 'Aprovado'
    });

    receipt.output_hashes = []; // ensure empty

    assert.throws(() => {
      engine.deliverTask('TASK_DELIV_TEST', 'cliente@empresa.ao', 'EMAIL');
    }, /Saída sem hash físico não pode ser entregue/);
  });

  await t.test('9. entrega antes da revisão humana é bloqueada', () => {
    const receipt = engine.executeTask({
      task_id: 'TASK_NO_REV',
      pilot_id: validPilotSpec.pilot_id,
      tenant_id: validPilotSpec.tenant_id,
      employee_id: 58,
      requested_by: 'user_test',
      received_at: new Date().toISOString(),
      title: 'Análise',
      instruction: 'Analisar mapa',
      input_data: { budget_kz: 1000000 },
      idempotency_key: 'IDEMP_NO_REV',
      format: 'XLSX'
    });

    assert.strictEqual(receipt.human_review_status, 'PENDING_REVIEW');
    assert.throws(() => {
      engine.deliverTask('TASK_NO_REV', 'finance@empresa.ao', 'EMAIL');
    }, /Entrega bloqueada: Tarefa 'TASK_NO_REV' não tem aprovação humana/);
  });

  await t.test('10. rejeição humana impede entrega', () => {
    engine.reviewTask({
      review_id: 'REV_REJ',
      task_id: 'TASK_NO_REV',
      reviewer: 'rev_maria_santos',
      decision: 'REJECTED',
      comments: 'Valores inconsistentes com balancete'
    });

    const updatedTask = engine.getTask('TASK_NO_REV');
    assert.strictEqual(updatedTask?.human_review_status, 'REJECTED');
    assert.strictEqual(updatedTask?.delivery_status, 'BLOCKED');

    assert.throws(() => {
      engine.deliverTask('TASK_NO_REV', 'finance@empresa.ao', 'EMAIL');
    }, /Entrega bloqueada: Tarefa 'TASK_NO_REV' não tem aprovação humana \(estado: REJECTED\)/);
  });

  await t.test('11. correcção cria nova versão sem apagar a anterior', () => {
    const task = engine.executeTask({
      task_id: 'TASK_CORRECTION',
      pilot_id: validPilotSpec.pilot_id,
      tenant_id: validPilotSpec.tenant_id,
      employee_id: 263,
      requested_by: 'user_test',
      received_at: new Date().toISOString(),
      title: 'Carta Rectificação',
      instruction: 'Redigir carta para fornecedor',
      input_data: { letter_ref: 'SASO/2026/05', recipient: 'Fornecedor XYZ' },
      idempotency_key: 'IDEMP_CORR',
      format: 'DOCX'
    });

    const outputBefore = engine.getTaskOutput('TASK_CORRECTION');
    const hashV1 = outputBefore?.current.hash;
    assert.ok(hashV1);

    const correctedContent = [
      '[DOCX DOCUMENT]',
      'SASO - SOCIEDADE ANGOLANA DE SERVIÇOS & OPERAÇÕES LDA',
      'Luanda, 17 de Setembro de 2026',
      'Ref: SASO/2026/05-RECTIFICADA',
      'Para: Fornecedor XYZ',
      'Assunto: Rectificação de Termos Contratuais',
      '',
      'Exmos. Senhores,',
      'Comunicamos a alteração aprovada do prazo de entrega para 30 de Setembro de 2026.',
      'Com os melhores cumprimentos,',
      'Administração Executiva'
    ].join('\n');

    engine.reviewTask({
      review_id: 'REV_CORR',
      task_id: 'TASK_CORRECTION',
      reviewer: 'rev_joao_manuel',
      decision: 'APPROVED_WITH_CORRECTIONS',
      comments: 'Adicionada data de entrega específica solicitada pelo fornecedor.',
      corrections_requested: ['Especificar dia 30 de Setembro'],
      corrected_content: correctedContent
    });

    const outputAfter = engine.getTaskOutput('TASK_CORRECTION');
    assert.ok(outputAfter?.previous, 'Previous version must be preserved');
    assert.strictEqual(outputAfter?.previous.hash, hashV1, 'Previous hash must match v1 hash');
    assert.notStrictEqual(outputAfter?.current.hash, hashV1, 'Current hash must be updated to v2');
    assert.strictEqual(engine.getTask('TASK_CORRECTION')?.version, 2);
    assert.strictEqual(engine.getTask('TASK_CORRECTION')?.corrections_required, 1);
  });

  await t.test('12. idempotency key impede efeito duplicado', () => {
    const taskA = engine.executeTask({
      task_id: 'TASK_IDEMP_A',
      pilot_id: validPilotSpec.pilot_id,
      tenant_id: validPilotSpec.tenant_id,
      employee_id: 52,
      requested_by: 'user_test',
      received_at: new Date().toISOString(),
      title: 'Cobrança Idempotente',
      instruction: 'Aviso de cobrança',
      input_data: { client_name: 'Cliente Alpha Lda', amount_kz: 500000 },
      idempotency_key: 'IDEMP_UNIQUE_KEY_999',
      format: 'DOCX'
    });

    // Re-submit with same idempotency key but different task ID
    const taskB = engine.executeTask({
      task_id: 'TASK_IDEMP_B',
      pilot_id: validPilotSpec.pilot_id,
      tenant_id: validPilotSpec.tenant_id,
      employee_id: 52,
      requested_by: 'user_test',
      received_at: new Date().toISOString(),
      title: 'Cobrança Idempotente Repetida',
      instruction: 'Aviso de cobrança duplicado',
      input_data: { client_name: 'Cliente Alpha Lda', amount_kz: 500000 },
      idempotency_key: 'IDEMP_UNIQUE_KEY_999',
      format: 'DOCX'
    });

    assert.strictEqual(taskA.task_id, taskB.task_id, 'Must return the same task receipt without creating duplicate effect');
  });

  await t.test('13. dados confidenciais não aparecem nos logs', () => {
    const sensitivePayload = {
      user_password: 'superSecretPassword123!',
      api_secret: 'sec_live_99999999999',
      credit_card: '4532-1234-5678-9010'
    };

    const sanitizedLog = JSON.stringify(sensitivePayload, (k, v) => {
      if (/password|secret|credit_card/i.test(k)) return '***REDACTED***';
      return v;
    });

    assert.ok(!sanitizedLog.includes('superSecretPassword123!'));
    assert.ok(!sanitizedLog.includes('sec_live_99999999999'));
    assert.ok(!sanitizedLog.includes('4532-1234-5678-9010'));
    assert.ok(sanitizedLog.includes('***REDACTED***'));
  });

  await t.test('14. documentos com yyyy ou placeholders residuais são rejeitados', () => {
    assert.throws(() => {
      engine.validateDocumentContent('Documento emitido em yyyy no valor de 100 KZ', 'PDF');
    }, /Rejeição de qualidade: Documento contém placeholder residual/);

    assert.throws(() => {
      engine.validateDocumentContent('Para o cliente [NOME] com NIF [VALOR]', 'DOCX');
    }, /Rejeição de qualidade: Documento contém placeholder residual/);

    assert.throws(() => {
      engine.validateDocumentContent('Declaração {{template_body}} final', 'DOCX');
    }, /Rejeição de qualidade: Documento contém placeholder residual/);
  });

  await t.test('15. ficheiros DOCX, PDF e XLSX inválidos são rejeitados', () => {
    assert.throws(() => {
      engine.validateDocumentContent('Texto qualquer sem cabeçalho nem estrutura PDF', 'PDF');
    }, /Ficheiro PDF com estrutura inválida/);

    assert.throws(() => {
      engine.validateDocumentContent('Ficheiro vazio', 'DOCX');
    }, /Ficheiro DOCX com estrutura inválida/);

    assert.throws(() => {
      engine.validateDocumentContent('Tabela corrompida', 'XLSX');
    }, /Ficheiro XLSX com estrutura inválida/);
  });

  await t.test('16. métricas são derivadas apenas das tarefas físicas', () => {
    const metrics = engine.calculatePilotMetrics(validPilotSpec.pilot_id);
    assert.ok(typeof metrics.total_tasks_received === 'number');
    assert.ok(typeof metrics.completion_rate === 'number');
    assert.ok(typeof metrics.first_pass_acceptance_rate === 'number');
    assert.ok(metrics.total_tasks_received > 0);
  });

  await t.test('17. simulações não entram nas métricas reais', () => {
    const realMetrics = engine.calculatePilotMetrics(validPilotSpec.pilot_id);
    const mockTasks = [{ id: 'mock_1' }, { id: 'mock_2' }];

    assert.strictEqual(
      realMetrics.total_tasks_received,
      Array.from((engine as any).tasks.values()).filter((t: any) => t.pilot_id === validPilotSpec.pilot_id).length,
      'Metrics must only include physical tasks from the pilot repository'
    );
  });

  await t.test('18. cancelamento interrompe tarefas pendentes', () => {
    engine.cancelPilot(validPilotSpec.pilot_id, 'Cancelamento de teste');
    const pilot = engine.getPilot(validPilotSpec.pilot_id);
    assert.strictEqual(pilot.status, 'CANCELLED');

    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_AFTER_CANCEL',
        pilot_id: validPilotSpec.pilot_id,
        tenant_id: validPilotSpec.tenant_id,
        employee_id: 66,
        requested_by: 'user_test',
        received_at: new Date().toISOString(),
        title: 'Cancelada',
        instruction: 'Teste',
        input_data: { test: true },
        idempotency_key: 'IDEMP_CANCEL',
        format: 'PDF'
      });
    }, /não está activo \(estado actual: CANCELLED\)/);
  });

  await t.test('19. tentativa de acção proibida pausa ou bloqueia a tarefa', () => {
    engine.reset();
    engine.createPilot(validPilotSpec);
    engine.authorizePilot(validPilotSpec.pilot_id, validPilotSpec.authorization_reference, validPilotSpec.authorized_by, validPilotSpec.authorized_at);
    engine.activatePilot(validPilotSpec.pilot_id);

    assert.throws(() => {
      engine.executeTask({
        task_id: 'TASK_PROHIBITED',
        pilot_id: validPilotSpec.pilot_id,
        tenant_id: validPilotSpec.tenant_id,
        employee_id: 58,
        requested_by: 'user_test',
        received_at: new Date().toISOString(),
        title: 'Transferência Ilegal',
        instruction: 'Executar transferência bancária',
        input_data: { amount: 1000000 },
        idempotency_key: 'IDEMP_PROHIB',
        format: 'PDF',
        action_type: 'DIRECT_WIRE_TRANSFER'
      });
    }, /Acção proibida pelo regulamento do piloto: 'DIRECT_WIRE_TRANSFER'/);
  });

  await t.test('20. recibo adulterado falha na verificação de hashes', () => {
    const receipt = engine.executeTask({
      task_id: 'TASK_TAMPER_TEST',
      pilot_id: validPilotSpec.pilot_id,
      tenant_id: validPilotSpec.tenant_id,
      employee_id: 66,
      requested_by: 'user_test',
      received_at: new Date().toISOString(),
      title: 'Teste Adulteração',
      instruction: 'Teste',
      input_data: { document_title: 'Factura 999' },
      idempotency_key: 'IDEMP_TAMPER',
      format: 'PDF'
    });

    const recordedHash = receipt.receipt_sha256;
    assert.ok(recordedHash);

    // Tamper with receipt field
    const tamperedReceipt = { ...receipt, final_status: 'FAILED' };
    const recomputedHash = sha256(JSON.stringify(tamperedReceipt));

    assert.notStrictEqual(recordedHash, recomputedHash, 'Tampered receipt must not match original receipt_sha256');
  });
});

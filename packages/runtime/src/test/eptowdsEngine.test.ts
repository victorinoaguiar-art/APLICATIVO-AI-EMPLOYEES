import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EPTOWDSEngine } from '../eptowds/EPTOWDSEngine.js';

describe('EPTOWDSEngine — Enterprise Pilot Testing & Omnichannel Work Delivery System (Prompt 500)', () => {
  const engine = EPTOWDSEngine.getInstance();

  it('should seed 500 enterprise pilot instances with Read-First default constraints', () => {
    const summary = engine.getGlobalSummary();
    assert.equal(summary.totalEmployees, 500);
    assert.equal(summary.totalPilots, 500);
    assert.equal(summary.readFirstEnforcedCount, 500);
    assert.equal(summary.clbgsCollisionProtectionActive, true);
    assert.equal(summary.receiptsAuditedCount, 0);
  });

  it('should retrieve pilot instance by employee ID or domain', () => {
    const pilot1 = engine.getPilotByEmployeeId(1);
    assert.ok(pilot1);
    assert.equal(pilot1?.employeeId, 1);
    assert.equal(pilot1?.mode, 'READ_FIRST');
    assert.equal(pilot1?.autoDelivery, false);
    assert.ok(pilot1?.supervisorId);

    const pilotsFin = engine.getPilotsByDomain('Finanças');
    assert.ok(pilotsFin.length > 0);
  });

  it('should create task state under read-first constraints and check print collision', () => {
    const taskState = engine.createPilotTask({
      taskId: 'task_ept_001',
      employeeId: 10,
      department: 'FINANCE',
      documentType: 'FAOT_FATURA',
      content: 'Fatura de Serviço de Consultoria — Exemplo EPTOWDS'
    });

    assert.equal(taskState.taskId, 'task_ept_001');
    assert.equal(taskState.employeeId, 10);
    assert.equal(taskState.status, 'DRAFT_READY');
    assert.equal(taskState.readFirstPolicyPassed, true);

    const printJob = engine.generatePrintPreview('task_ept_001', {
      paperSize: 'A4',
      duplex: false
    });

    assert.ok(printJob);
    assert.equal(printJob.collisionCheck.collisionDetected, false);
    assert.equal(printJob.collisionCheck.status, 'PASS');
    assert.ok(printJob.letterheadTemplateId);

    const fetchedTask = engine.getPilotTask('task_ept_001');
    assert.equal(fetchedTask?.status, 'READY_FOR_REVIEW');
  });

  it('should require approval snapshot before dispatching work', () => {
    const approvalRes = engine.approvePilotTask({
      taskId: 'task_ept_001',
      supervisorId: 'sup_fin_mgr',
      decision: 'APPROVED',
      notes: 'Aprovado para envio de teste ao cliente piloto'
    });

    assert.equal(approvalRes.taskState.status, 'APPROVED');
    assert.ok(approvalRes.approvalSnapshot);
    assert.ok(approvalRes.approvalSnapshot.snapshotHash.startsWith('sha256_'));
  });

  it('should draft email and business messaging with signed authenticated links', () => {
    const emailDraft = engine.draftEmailDelivery({
      taskId: 'task_ept_001',
      to: ['cliente.piloto@empresa.co.ao'],
      subject: 'Fatura de Teste Piloto — AI Employee',
      body: 'Prezado cliente, em anexo enviamos o talão/fatura do projeto piloto.',
      attachments: [{ filename: 'fatura_001.pdf', documentId: 'doc_ept_001', sizeBytes: 12400 }]
    });

    assert.ok(emailDraft);
    assert.equal(emailDraft.taskId, 'task_ept_001');
    assert.ok(emailDraft.signedLinks.length > 0);
    assert.ok(emailDraft.signedLinks[0].startsWith('https://'));

    const msgDraft = engine.draftMessagingDelivery({
      taskId: 'task_ept_001',
      channel: 'WHATSAPP_BUSINESS',
      recipientPhone: '+244923000111',
      messageText: 'Olá! Seu documento piloto está pronto.',
      attachmentDocId: 'doc_ept_001'
    });

    assert.ok(msgDraft);
    assert.equal(msgDraft.channel, 'WHATSAPP_BUSINESS');
    assert.ok(msgDraft.signedLink);
  });

  it('should execute omnichannel dispatch and produce immutable delivery receipt', () => {
    const deliveryIntent = {
      taskId: 'task_ept_001',
      employeeId: 10,
      channel: 'EMAIL' as const,
      recipient: 'cliente.piloto@empresa.co.ao',
      payloadSummary: 'Fatura de Serviço de Consultoria',
      requiresAck: true
    };

    const receipt = engine.deliverWork(deliveryIntent);

    assert.ok(receipt);
    assert.equal(receipt.taskId, 'task_ept_001');
    assert.equal(receipt.channel, 'EMAIL');
    assert.equal(receipt.status, 'DELIVERED');
    assert.ok(receipt.receiptHash.startsWith('sha256_receipt_'));
    assert.ok(receipt.dlpScanPassed);

    const task = engine.getPilotTask('task_ept_001');
    assert.equal(task?.status, 'DELIVERED');

    const receipts = engine.getReceipts('task_ept_001');
    assert.equal(receipts.length, 1);

    const summary = engine.getGlobalSummary();
    assert.equal(summary.receiptsAuditedCount, 1);
  });
});

import { test } from 'node:test';
import assert from 'node:assert';
import { createHmac } from 'crypto';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import {
  WorkActivationContractRegistry,
  CommandNormalizationEngine,
  EventEngine,
  EmployeeHandoffRouter,
  HumanCommandAdapter,
  DocumentMediaAdapter,
  ExcelIntegrationAdapter,
  SystemEventWebhookAdapter
} from '../index.js';

test('UTCEG - WorkActivationContractRegistry - 500/500 Coverage Validation', (t) => {
  const registry = WorkActivationContractRegistry.getInstance();
  const allContracts = registry.getAllActivationContracts();

  assert.strictEqual(allContracts.length, 500, 'Must have exactly 500 work activation contracts registered');

  for (const role of CANONICAL_500_ROLES) {
    const contract = registry.getActivationContract(role.id);
    assert.ok(contract, `Contract missing for role #${role.id} (${role.role_key})`);
    assert.strictEqual(contract.employeeId, role.id);
    assert.strictEqual(contract.roleKey, role.role_key);
    assert.ok(contract.activationModes.length > 0, `Activation modes must not be empty for #${role.id}`);
    assert.ok(contract.executionContract, `Execution contract missing for #${role.id}`);
  }
});

test('UTCEG - CommandNormalizationEngine - Multimodal Normalization', (t) => {
  const envelope = CommandNormalizationEngine.normalize({
    organizationId: 'org_test_001',
    tenantId: 'tenant_test_001',
    sourceType: 'HUMAN_COMMAND',
    sourceChannel: 'TextConsole',
    sourceActorType: 'HUMAN',
    sourceActorId: 'user_admin_001',
    rawInput: 'Elaborar relatório de fecho mensal com indicadores EBITDA',
    requestedEmployeeId: 73
  });

  assert.ok(envelope.commandId.startsWith('cmd_'));
  assert.strictEqual(envelope.sourceType, 'HUMAN_COMMAND');
  assert.strictEqual(envelope.requestedEmployeeId, 73);
  assert.strictEqual(envelope.tenantId, 'tenant_test_001');
  assert.strictEqual(envelope.organizationId, 'org_test_001');
  assert.strictEqual(envelope.taskType, 'GENERATE_MANAGEMENT_REPORT');
});

test('UTCEG - EventEngine - Replay Protection & Rule Matching', (t) => {
  const eventEngine = new EventEngine();

  const businessEvent = {
    eventId: 'evt_inv_99812',
    organizationId: 'org_test_001',
    tenantId: 'tenant_test_001',
    eventType: 'INVOICE_CREATED',
    eventVersion: '1.0.0',
    sourceSystem: 'sap_erp',
    occurredAt: new Date().toISOString(),
    receivedAt: new Date().toISOString(),
    payload: { invoiceId: 'INV-2026-001', amount: 5000 },
    payloadSchema: 'schema_invoice_v1',
    classification: 'INTERNAL',
    sensitivity: 'MEDIUM',
    producer: 'sap_erp',
    correlationId: 'corr_evt_inv_99812',
    idempotencyKey: 'idempotency_key_test_001',
    traceId: 'trace_evt_inv_99812'
  };

  const commandEnvelope = eventEngine.processBusinessEvent(businessEvent);
  assert.ok(commandEnvelope);
  assert.strictEqual(commandEnvelope.requestedEmployeeId, 51);
  assert.strictEqual(commandEnvelope.taskType, 'PROCESS_INVOICE');

  // Duplicate event execution test -> Replay error
  assert.throws(() => {
    eventEngine.processBusinessEvent(businessEvent);
  }, /EVENT_REPLAYED/);
});

test('UTCEG - EmployeeHandoffRouter - Inter-Employee Handoff Routing', (t) => {
  const router = new EmployeeHandoffRouter();

  const handoffEnvelope = {
    handoffId: 'hdf_token_9912',
    organizationId: 'org_test_001',
    fromEmployeeId: 66,
    toEmployeeId: 67,
    sourceTaskId: 'task_classify_001',
    nextTaskType: 'PREPARE_JOURNAL_ENTRY',
    workProductRefs: ['wp_class_001'],
    dataProductRefs: ['dp_class_001'],
    documentRefs: ['doc_invoice_001.pdf'],
    requiredAction: 'Preparar lançamento contabilístico',
    contextRefs: ['ctx_invoice_001'],
    riskLevel: 'R2',
    correlationId: 'corr_hdf_9912',
    traceId: 'trace_hdf_9912'
  };

  const commandEnvelope = router.dispatchHandoff(handoffEnvelope);
  assert.ok(commandEnvelope);
  assert.strictEqual(commandEnvelope.requestedEmployeeId, 67);
  assert.strictEqual(commandEnvelope.sourceType, 'EMPLOYEE_HANDOFF');
  assert.strictEqual(commandEnvelope.taskType, 'PREPARE_JOURNAL_ENTRY');

  const history = router.getHandoffsForOrganization('org_test_001');
  assert.strictEqual(history.length, 1);
});

test('UTCEG - Adapters Test', (t) => {
  // Human Command Adapter
  const textCmd = HumanCommandAdapter.parseTextCommand('org_test_001', 'user_1', 'Elaborar relatório de fecho', 73);
  assert.strictEqual(textCmd.requestedEmployeeId, 73);

  // Document Adapter
  const docCmd = DocumentMediaAdapter.parseFileIntake('org_test_001', 'user_1', 'fatura.pdf', 'pdf', 1024, 66);
  assert.ok(['CLASSIFY_DOCUMENT', 'PROCESS_INVOICE'].includes(docCmd.taskType));

  // Excel Adapter
  const excelCmd = ExcelIntegrationAdapter.parseExcelSync('org_test_001', 'Livro1.xlsx', 'Sheet1', 50, 73);
  assert.strictEqual(excelCmd.taskType, 'EXCEL_DATA_INTAKE');

  // Webhook Adapter HMAC
  const secret = 'supersecretkey';
  const payload = { id: 'INV-100', total: 1200 };
  const signatureHeader = createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');

  const eventEnv = SystemEventWebhookAdapter.parseWebhook('org_test_001', 'SAP', 'INVOICE_CREATED', payload, signatureHeader, secret);
  assert.strictEqual(eventEnv.eventType, 'INVOICE_CREATED');
  assert.strictEqual(eventEnv.sourceSystem, 'SAP');
});

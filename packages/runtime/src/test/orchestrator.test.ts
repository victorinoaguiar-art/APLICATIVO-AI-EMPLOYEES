import assert from 'node:assert';
import { test } from 'node:test';
import { TaskStateMachine, Orchestrator } from '../index.js';
import { MockEmailConnector } from '@ai-employee/tool-sdk';
import { ApprovalGateway } from '@ai-employee/approvals';
import { ToolCallIntent } from '@ai-employee/shared';

test('Orchestrator Executes Normal Task Successfully', async () => {
  const task = TaskStateMachine.createTask('org_001', 'emp_001', 'ceo_assistant', 'Send Executive Summary', 'Send summary email');
  const connector = new MockEmailConnector();

  const intent: ToolCallIntent = {
    intentId: 'intent_123',
    organizationId: 'org_001',
    employeeId: 'emp_001',
    taskId: task.id,
    roleKey: 'ceo_assistant',
    toolKey: 'T.COMM.GMAIL',
    operation: 'send_email',
    arguments: { recipient: 'board@example.com', subject: 'Q3 Summary', body: 'Report content...' },
    reason: 'Monthly reporting',
    confidence: 0.98,
    idempotencyKey: 'idemp_key_001',
    requestedAt: new Date().toISOString()
  };

  const result = await Orchestrator.executeTask({
    task,
    roleKey: 'ceo_assistant',
    toolIntent: intent,
    toolAdapter: connector
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.approvalRequired, false);
  assert.strictEqual(result.task.status, 'COMPLETED');
  assert.ok(result.toolResult);
});

test('Orchestrator Triggers Approval Gateway on Monetary Threshold', async () => {
  const task = TaskStateMachine.createTask('org_001', 'emp_50', 'accounts_payable', 'Pay Supplier Invoice', 'Process €5,000 transfer');
  const connector = new MockEmailConnector();

  const intent: ToolCallIntent = {
    intentId: 'intent_456',
    organizationId: 'org_001',
    employeeId: 'emp_50',
    taskId: task.id,
    roleKey: 'accounts_payable',
    toolKey: 'T.COMM.GMAIL',
    operation: 'send_email',
    arguments: { recipient: 'supplier@example.com', subject: 'Invoice Payment', body: 'Payment details...' },
    reason: 'Supplier settlement',
    confidence: 0.95,
    idempotencyKey: 'idemp_key_002',
    requestedAt: new Date().toISOString()
  };

  const result = await Orchestrator.executeTask({
    task,
    roleKey: 'accounts_payable',
    toolIntent: intent,
    toolAdapter: connector,
    amount: 5000 // Exceeds €1,000 monetary threshold -> triggers approval
  });

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.approvalRequired, true);
  assert.strictEqual(result.task.status, 'WAITING_APPROVAL');
  assert.ok(result.approvalRecord);

  // Decide approval
  const approvedRecord = ApprovalGateway.decideApproval(result.approvalRecord!.approvalId, 'APPROVED', 'supervisor_user');
  assert.strictEqual(approvedRecord.status, 'APPROVED');

  // Verify snapshot validation passes with exact same intent
  assert.doesNotThrow(() => {
    ApprovalGateway.validateExecutionSnapshot(approvedRecord.approvalId, intent);
  });
});

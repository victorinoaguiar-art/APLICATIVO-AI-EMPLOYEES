import test from 'node:test';
import assert from 'node:assert/strict';
import { TaskStateMachine } from '../task/TaskStateMachine.js';
import { QueueManager } from '../durable/QueueManager.js';
import { IdempotencyManager } from '../durable/IdempotencyManager.js';
import { AuditStream } from '../durable/AuditStream.js';
import { DurableWorkerEngine } from '../durable/DurableWorkerEngine.js';
import { MockEmailConnector } from '@ai-employee/tool-sdk';
import { ToolCallIntent } from '@ai-employee/shared';

test('P05 Durable Execution — Idempotency Lock Manager Prevents Duplicate Execution', () => {
  IdempotencyManager.clearLocks();
  const key = 'idemp_test_123';
  
  const lock1 = IdempotencyManager.acquireLock(key, 'task_1');
  assert.equal(lock1, true, 'First lock acquisition should succeed');

  const lock2 = IdempotencyManager.acquireLock(key, 'task_1');
  assert.equal(lock2, false, 'Second lock acquisition should fail while locked');

  IdempotencyManager.completeLock(key, { status: 'COMPLETED' });

  const lock3 = IdempotencyManager.acquireLock(key, 'task_1');
  assert.equal(lock3, false, 'Lock acquisition should fail after completion');
});

test('P05 Durable Execution — QueueManager Priorities & DLQ Routing', async () => {
  QueueManager.clear();
  AuditStream.clearEvents();

  const task = TaskStateMachine.createTask('org_1', 'emp_1', 'ceo_assistant', 'Task Title', 'Instruction');
  const intent: ToolCallIntent = {
    intentId: 'intent_1',
    organizationId: 'org_1',
    employeeId: 'emp_1',
    taskId: task.id,
    roleKey: 'ceo_assistant',
    toolKey: 'T.COMM.GMAIL',
    operation: 'send_email',
    arguments: { recipient: 'test@example.com' },
    reason: 'Test',
    confidence: 0.9,
    idempotencyKey: `idemp_${task.id}`,
    requestedAt: new Date().toISOString()
  };

  const item = QueueManager.enqueue(task, intent, 'NORMAL', 2);
  assert.equal(QueueManager.getQueueStats().mainQueueCount, 1);

  // Poll item
  const polled = QueueManager.pollNext();
  assert.ok(polled);
  assert.equal(polled.attempts, 1);

  // Simulate first failure (Retry Exponential Backoff)
  QueueManager.handleFailure(polled, new Error('Network timeout'));
  assert.equal(QueueManager.getQueueStats().dlqCount, 0);

  // Wait for exponential backoff window (100ms)
  await new Promise(r => setTimeout(r, 120));

  // Poll item again for second attempt
  const polledSecond = QueueManager.pollNext();
  assert.ok(polledSecond);
  assert.equal(polledSecond.attempts, 2);

  // Simulate second failure -> Should route to DLQ
  QueueManager.handleFailure(polledSecond, new Error('Fatal connector crash'));
  assert.equal(QueueManager.getQueueStats().dlqCount, 1, 'Should route item to DLQ after max attempts');

  const dlqItems = QueueManager.getDLQItems();
  assert.equal(dlqItems.length, 1);
  assert.equal(dlqItems[0].reason, 'Fatal connector crash');

  // Requeue from DLQ
  const requeued = QueueManager.requeueFromDLQ(dlqItems[0].id);
  assert.equal(requeued.attempts, 0, 'Attempts should reset upon requeue from DLQ');
  assert.equal(QueueManager.getQueueStats().dlqCount, 0);
  assert.equal(QueueManager.getQueueStats().mainQueueCount, 1);
});

test('P05 Durable Execution — AuditStream & Decision Trace Tracking', () => {
  AuditStream.clearEvents();

  AuditStream.emit('org_1', 'task_99', 'emp_1', 'ceo_assistant', 'TASK_CREATED', 'INFO', { step: 1 });
  AuditStream.emit('org_1', 'task_99', 'emp_1', 'ceo_assistant', 'POLICY_EVALUATED', 'INFO', { step: 2 });
  AuditStream.emit('org_1', 'task_99', 'emp_1', 'ceo_assistant', 'TASK_COMPLETED', 'INFO', { step: 3 });

  const trace = AuditStream.getDecisionTrace('task_99');
  assert.equal(trace.length, 3);
  assert.equal(trace[0].eventType, 'TASK_CREATED');
  assert.equal(trace[1].eventType, 'POLICY_EVALUATED');
  assert.equal(trace[2].eventType, 'TASK_COMPLETED');
  assert.ok(trace[0].checksum, 'Each audit event must have a cryptographically verifiable checksum');
});

test('P05 Durable Worker Engine — Processes Tasks End-to-End', async () => {
  QueueManager.clear();
  IdempotencyManager.clearLocks();
  AuditStream.clearEvents();

  const connector = new MockEmailConnector();
  const workerEngine = new DurableWorkerEngine(2);

  const task = TaskStateMachine.createTask('org_1', 'emp_1', 'ceo_assistant', 'Send Report', 'Send weekly update email');
  const intent: ToolCallIntent = {
    intentId: 'intent_work_1',
    organizationId: 'org_1',
    employeeId: 'emp_1',
    taskId: task.id,
    roleKey: 'ceo_assistant',
    toolKey: 'T.COMM.GMAIL',
    operation: 'send_email',
    arguments: { recipient: 'board@company.com', subject: 'Report', body: 'Update' },
    reason: 'Executive dispatch',
    confidence: 0.99,
    idempotencyKey: `idemp_work_${task.id}`,
    requestedAt: new Date().toISOString()
  };

  QueueManager.enqueue(task, intent, 'HIGH', 3);
  
  const result = await workerEngine.processNext(connector);
  assert.ok(result);
  assert.equal(result.success, true);
  assert.equal(result.task.status, 'COMPLETED');
});

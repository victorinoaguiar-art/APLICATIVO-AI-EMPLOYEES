import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { RCODEEngine } from '../rcode/RCODEEngine.js';

describe('RCODE-500 — Remote Command, Offline Queue & Deferred Execution Engine Test Suite', () => {
  const engine = RCODEEngine.getInstance();

  it('1. Initial Seed State — verifies default devices and initial summary', () => {
    const summary = engine.getGlobalSummary();
    assert.equal(summary.total_registered_devices >= 3, true);
    assert.equal(summary.online_devices_count >= 2, true);
    assert.equal(summary.total_commands_received >= 1, true);
  });

  it('2. Cloud Command Execution — executes CLOUD_ONLY command immediately and emits receipt', () => {
    const res = engine.dispatchRemoteCommand({
      tenantId: 'tenant_default',
      userId: 'user_mobile_01',
      employeeId: '001',
      channel: 'MOBILE_APP',
      commandText: 'Analise o relatório de vendas e envie o resumo por email.',
      executionMode: 'CLOUD_ONLY',
      idempotencyKey: `idemp_${Date.now()}_1`
    });

    assert.equal(res.command.status, 'COMPLETED');
    assert.equal(res.task.status, 'COMPLETED');
    assert.ok(res.receipt);
    assert.equal(res.receipt.result, 'SUCCESS');
    assert.ok(res.receipt.hash.length > 0);
  });

  it('3. Offline Queue & Deferred Execution — queues task as WAITING_FOR_DEVICE when target is offline', () => {
    const res = engine.dispatchRemoteCommand({
      tenantId: 'tenant_default',
      userId: 'user_ceo',
      employeeId: '001',
      channel: 'MOBILE_APP',
      commandText: 'Abra a folha de cálculo confidencial no computador MacBook.',
      targetDevice: 'dev_mac_ceo_01',
      executionMode: 'DEFERRED',
      idempotencyKey: `idemp_${Date.now()}_2`
    });

    assert.equal(res.command.status, 'WAITING_FOR_DEVICE');
    assert.equal(res.task.status, 'WAITING_FOR_DEVICE');
    assert.equal(res.receipt, undefined);
  });

  it('4. Device Heartbeat & Automatic Flush — flushes deferred queue when device comes online', () => {
    const hbRes = engine.recordHeartbeat({
      deviceId: 'dev_mac_ceo_01',
      status: 'ONLINE'
    });

    assert.ok(hbRes.flushedTasksCount >= 1);
    const summary = engine.getGlobalSummary();
    assert.equal(summary.online_devices_count >= 3, true);
  });

  it('5. Risk Classification & Approval Requirement — blocks HIGH/CRITICAL risk tasks until approval', () => {
    const res = engine.dispatchRemoteCommand({
      tenantId: 'tenant_default',
      userId: 'user_finance',
      employeeId: '050',
      channel: 'MOBILE_APP',
      commandText: 'Execute a transferência e pagamento ao fornecedor no valor de 10.000.000 AOA.',
      executionMode: 'CLOUD_ONLY',
      idempotencyKey: `idemp_${Date.now()}_3`
    });

    assert.equal(res.command.risk_level, 'CRITICAL');
    assert.equal(res.command.status, 'WAITING_FOR_APPROVAL');
    assert.equal(res.command.approval_required, true);
  });

  it('6. MFA Verification on Approval — enforces valid MFA token for CRITICAL risk commands', () => {
    const commands = engine.listCommands();
    const criticalCmd = commands.find(c => c.risk_level === 'CRITICAL' && c.status === 'WAITING_FOR_APPROVAL');
    assert.ok(criticalCmd);

    // Missing MFA token should throw
    assert.throws(() => {
      engine.approveCommand(criticalCmd.command_id, 'diretor@empresa.co.ao', 'INVALID_TOKEN');
    }, /MFA Obrigatório/);

    // Valid MFA token passes
    const approved = engine.approveCommand(criticalCmd.command_id, 'diretor@empresa.co.ao', 'MFA-PASS-9988');
    assert.equal(approved.status, 'COMPLETED');
  });

  it('7. Idempotency Key Enforcement — rejects duplicate command dispatch', () => {
    const key = `duplicate_test_key_${Date.now()}`;

    engine.dispatchRemoteCommand({
      commandText: 'Comando original',
      idempotencyKey: key
    });

    assert.throws(() => {
      engine.dispatchRemoteCommand({
        commandText: 'Comando duplicado',
        idempotencyKey: key
      });
    }, /Comando Duplicado Recusado/);
  });

  it('8. Execution Receipts & SHA256 Audit Trail — verifies receipts generated', () => {
    const receipts = engine.listReceipts();
    assert.equal(receipts.length >= 2, true);
    assert.ok(receipts.every(r => r.hash && r.hash.length === 64));
  });
});

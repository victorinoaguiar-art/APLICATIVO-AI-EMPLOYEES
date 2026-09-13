import assert from 'node:assert';
import { test } from 'node:test';
import { CLEEngine } from '../cle/CLEEngine.js';

test('CLE-500 — Remote Command, Offline Queue, Deferred Execution & Cloud/Local Connectivity Engine Test Suite', async (t) => {
  const cleEngine = CLEEngine.getInstance();

  await t.test('1. Core Principle — STORAGE LOCATION != EXECUTION LOCATION (Cloud Drive -> Cloud Execution)', () => {
    const cmd = cleEngine.dispatchCommand({
      tenant_id: 'tenant_default',
      user_id: 'usr_director_01',
      employee_id: '001',
      channel: 'MOBILE_APP',
      command_text: 'Analise as facturas da pasta Agosto no Google Drive.',
      execution_mode: 'CLOUD_ONLY'
    });

    assert.strictEqual(cmd.status, 'COMPLETED');
    const decisions = cleEngine.listDecisions();
    const dec = decisions.find(d => d.command_id === cmd.command_id);
    assert.ok(dec);
    assert.strictEqual(dec?.selected_execution_location, 'CLOUD');
    assert.strictEqual(dec?.data_location.storage_type, 'CLOUD_DRIVE');
  });

  await t.test('2. Execution Location Resolver — Hybrid Execution (Cloud Drive -> Local PRIMAVERA ERP)', () => {
    const cmd = cleEngine.dispatchCommand({
      tenant_id: 'tenant_default',
      user_id: 'usr_accountant_01',
      employee_id: '050',
      channel: 'WHATSAPP_BUSINESS',
      command_text: 'Pegue no ficheiro de lançamentos do Google Drive e importe no PRIMAVERA.',
      target_device: 'dev_win_office_01'
    });

    // Requires approval due to HIGH risk (PRIMAVERA import)
    assert.strictEqual(cmd.status, 'WAITING_FOR_APPROVAL');
    const dec = cleEngine.listDecisions().find(d => d.command_id === cmd.command_id);
    assert.ok(dec);
    assert.strictEqual(dec?.selected_execution_location, 'WAIT');
    assert.strictEqual(dec?.selected_execution_mode, 'DEFERRED');

    // Approve command
    const appCmd = cleEngine.approveCommand(cmd.command_id, 'diretor@empresa.co.ao');
    assert.strictEqual(appCmd.status, 'WAITING_FOR_DEVICE');
  });

  await t.test('3. Device Heartbeat & Deferred Flush — Executes pending job when device comes online', () => {
    const result = cleEngine.processHeartbeat('dev_win_office_01', 'ONLINE');
    assert.strictEqual(result.device.status, 'ONLINE');
    assert.ok(result.flushed_count >= 1);

    const summary = cleEngine.getGlobalSummary();
    assert.strictEqual(summary.online_devices_count, 2);
  });

  await t.test('4. Local Storage Connector — File in C:\\Bancos\\Agosto', () => {
    const cmd = cleEngine.dispatchCommand({
      tenant_id: 'tenant_default',
      user_id: 'usr_treasury_01',
      employee_id: '200',
      channel: 'REST_API',
      command_text: 'Faça a conciliação usando os extractos em C:\\Bancos\\Agosto.',
      target_device: 'dev_win_office_01'
    });

    // dev_win_office_01 is now ONLINE, so it executes
    assert.strictEqual(cmd.status, 'COMPLETED');
    const dec = cleEngine.listDecisions().find(d => d.command_id === cmd.command_id);
    assert.strictEqual(dec?.selected_execution_location, 'LOCAL');
  });

  await t.test('5. Idempotency Key Protection — Rejects duplicate commands', () => {
    const key = `idem_key_${Date.now()}`;
    cleEngine.dispatchCommand({
      tenant_id: 'tenant_default',
      user_id: 'usr_admin',
      employee_id: '001',
      channel: 'WEB_APP',
      command_text: 'Relatório diário de vendas',
      idempotency_key: key
    });

    assert.throws(() => {
      cleEngine.dispatchCommand({
        tenant_id: 'tenant_default',
        user_id: 'usr_admin',
        employee_id: '001',
        channel: 'WEB_APP',
        command_text: 'Relatório diário de vendas',
        idempotency_key: key
      });
    }, /Comando duplicado rejeitado/);
  });

  await t.test('6. Risk Engine & MFA Approval — Blocks CRITICAL commands without MFA token', () => {
    assert.throws(() => {
      cleEngine.dispatchCommand({
        tenant_id: 'tenant_default',
        user_id: 'usr_cfo',
        employee_id: '050',
        channel: 'MOBILE_APP',
        command_text: 'Efetuar pagamento da fatura de fornecedor no valor de 10.000.000 AOA'
      });
    }, /risco CRÍTICO exigem validação de token MFA/);
  });

  await t.test('7. Trigger Engine & Event Evaluation — Fires event on DEVICE_ONLINE', () => {
    const count = cleEngine.evaluateTrigger('DEVICE_ONLINE', { deviceId: 'dev_win_office_01' });
    assert.ok(count >= 1);
  });

  await t.test('8. Execution Receipts & SHA256 Audit Trail — Verifies audit trail metrics', () => {
    const receipts = cleEngine.listReceipts();
    assert.ok(receipts.length > 0);
    const rcp = receipts[0];
    assert.ok(rcp.receipt_id.startsWith('rcp_cle_'));
    assert.strictEqual(rcp.status, 'VERIFIED');
    assert.ok(rcp.evidence_hash.length === 64); // SHA256 length
    assert.strictEqual(rcp.knowledge_version_used, 'KR-2026.09.11');

    const summary = cleEngine.getGlobalSummary();
    assert.strictEqual(summary.storage_not_equals_execution_guarantee, true);
  });
});

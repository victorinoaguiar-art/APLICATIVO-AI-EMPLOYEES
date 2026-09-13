import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { OTCTECEngine } from '../otctec/OTCTECEngine.js';

describe('OTCTEC v1.0 — Operational Testing & Employee Certification', () => {
  let engine: OTCTECEngine;

  beforeEach(() => {
    engine = OTCTECEngine.getInstance();
  });

  it('1. Pilot Tenant Setup — verifies test tenant configuration and STAGING state', () => {
    const tenant = engine.getPilotTenant();
    assert.equal(tenant.tenant_key, 'TEST_ACCOUNTING_OFFICE_01');
    assert.equal(tenant.environment, 'STAGING');
    assert.equal(tenant.currency, 'AOA');
    assert.equal(tenant.validation_state, 'READY_FOR_PILOT');
  });

  it('2. Initial 5 Pilot AI Employees — verifies registration of #261, #286, #066, #064, #073', () => {
    const pilots = engine.getPilotEmployees();
    assert.equal(pilots.length, 5);

    const emp261 = engine.getPilotEmployee('261');
    assert.ok(emp261);
    assert.equal(emp261.name, 'Document Creator (#261)');
    assert.equal(emp261.allowed_actions.includes('render_docx'), true);
    assert.equal(emp261.denied_actions.includes('send_external'), true);

    const emp064 = engine.getPilotEmployee('064');
    assert.ok(emp064);
    assert.equal(emp064.name, 'Bank Reconciliation (#064)');
    assert.equal(emp064.denied_actions.includes('make_payment'), true);
  });

  it('3. Connector Certification Engine — certifies connectors in READ_ONLY mode and blocks write actions', () => {
    const res = engine.testConnector('conn-01');
    assert.equal(res.success, true);
    assert.equal(res.status, 'CERTIFIED_FOR_TEST');
    assert.equal(res.writeActionsDenied, true);
  });

  it('4. Work Request Normalizer — normalizes request and enforces write_actions_allowed: false', () => {
    const req = engine.normalizeWorkRequest('Reconciliar extrato bancário BFA de Agosto de 2026', 'A03', '064');
    assert.equal(req.assigned_employee_id, '064');
    assert.equal(req.resolved_outcome, 'bank_reconciliation');
    assert.equal(req.write_actions_allowed, false);
  });

  it('5. Input Snapshot Engine — freezes input files prior to task execution', () => {
    const snapshot = engine.createInputSnapshot('task-001', [
      { filename: 'extrato_bfa_agosto_2026.pdf', mime_type: 'application/pdf' },
      { filename: 'razao_contabil_agosto_2026.xlsx', mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
    ]);

    assert.equal(snapshot.is_frozen, true);
    assert.equal(snapshot.files.length, 2);
    assert.ok(snapshot.files[0].file_hash.startsWith('sha256_'));
  });

  it('6. Error Lab Engine — classifies error severity (E0-E5) and root cause', () => {
    const errorCase = engine.recordErrorCase({
      taskId: 'task-002',
      employeeId: '064',
      severity: 'E4_MATERIAL',
      rootCause: 'DATA_CONTRACT_ERROR',
      expected: 'Reconciliação 100% sem divergências de saldo inicial',
      actual: 'Divergência de 450.000 AOA devido a saldo inicial inconsistente no ficheiro'
    });

    assert.equal(errorCase.severity, 'E4_MATERIAL');
    assert.equal(errorCase.root_cause, 'DATA_CONTRACT_ERROR');
    assert.equal(errorCase.status, 'OPEN');
  });

  it('7. Platform Certification Gate — evaluates 13 gates (G1-G13) and grants PLATFORM_CERTIFIED state', () => {
    const cert = engine.evaluatePlatformCertification('064');
    assert.equal(cert.certification_state, 'PLATFORM_CERTIFIED');
    assert.equal(cert.gates_summary.length, 13);
    assert.equal(cert.gates_summary.every(g => g.passed), true);

    const emp064 = engine.getPilotEmployee('064');
    assert.equal(emp064?.current_state, 'PLATFORM_CERTIFIED');
  });

  it('8. OTCTEC Global Summary — returns complete summary of pilot status', () => {
    const summary = engine.getGlobalSummary();
    assert.equal(summary.pilot_tenant.tenant_key, 'TEST_ACCOUNTING_OFFICE_01');
    assert.equal(summary.pilot_employees.length, 5);
    assert.ok(summary.connectors_certified_count >= 5);
  });
});

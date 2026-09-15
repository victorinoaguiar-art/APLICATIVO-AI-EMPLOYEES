import { describe, it } from 'node:test';
import assert from 'node:assert';
import { MasterTruthReconciliationEngine } from '../aetf/MasterTruthReconciliationEngine.js';

describe('AETF-500 Master Truth Reconciliation & Production Readiness Audit', () => {
  const engine = MasterTruthReconciliationEngine.getInstance();
  const report = engine.evaluateMasterReadiness();

  it('1. Emits strictly PATCH_VERIFIED_CONTROLLED_PILOT_READY decision with critical blockers acknowledged', () => {
    assert.strictEqual(report.decision, 'PATCH_VERIFIED_CONTROLLED_PILOT_READY');
    assert.strictEqual(report.critical_gates_failed >= 2, true);
    assert.ok(report.blocking_findings.length >= 2);
    assert.ok(report.restrictions.length >= 3);
    assert.ok(report.git_commit_baseline && report.git_commit_baseline !== 'UNKNOWN');
  });

  it('2. Enforces Task Reconciliation & Suspends 68,500 live task claim', () => {
    const tasks = report.task_reconciliation;
    assert.strictEqual(tasks.required_tasks, 68500);
    assert.strictEqual(tasks.live_tasks, 0, 'Zero unverified live tasks allowed');
    assert.strictEqual(tasks.verified_live_gap, 68500, 'Exact true gap must be declared');
    assert.strictEqual(tasks.claim_status, 'SUSPENDED_PENDING_PHYSICAL_EVIDENCE');
  });

  it('3. Reclassifies external enterprise tenants to DEMONSTRATION_TENANT', () => {
    assert.strictEqual(report.externally_verified_tenants, 0);
    assert.strictEqual(report.tenants.length >= 3, true);

    for (const tenant of report.tenants) {
      assert.strictEqual(tenant.reclassified_status, 'DEMONSTRATION_TENANT');
      assert.strictEqual(tenant.legal_identity_proven, false);
    }
  });

  it('4. Evaluates all 15 Blocking Gates with forensic integrity', () => {
    assert.strictEqual(report.gates.length, 15);

    const gateMap = new Map(report.gates.map((g) => [g.gate_name, g.status]));

    assert.strictEqual(gateMap.get('CLEAN_BUILD_GATE'), 'PASS');
    assert.strictEqual(gateMap.get('TEST_PASS_GATE'), 'PASS');
    assert.strictEqual(gateMap.get('TYPE_SAFETY_GATE'), 'PASS');
    assert.strictEqual(gateMap.get('SECURITY_GATE'), 'PASS');
    assert.strictEqual(gateMap.get('TENANT_ISOLATION_GATE'), 'PASS');
    assert.strictEqual(gateMap.get('PAYMENT_TRUTH_GATE'), 'PASS');
    assert.strictEqual(gateMap.get('REVENUE_TRUTH_GATE'), 'PASS');
    assert.strictEqual(gateMap.get('MANIFEST_SCHEMA_GATE'), 'PASS');
    assert.strictEqual(gateMap.get('MANIFEST_CARDINALITY_GATE'), 'PASS');
    assert.strictEqual(gateMap.get('PHYSICAL_HASH_GATE'), 'PASS');
    assert.strictEqual(gateMap.get('ANTI_CONTRADICTION_GATE'), 'PASS');

    // Expected failing gates due to absence of external customer evidence
    assert.strictEqual(gateMap.get('TASK_EVIDENCE_GATE'), 'FAIL');
    assert.strictEqual(gateMap.get('EXTERNAL_AUTHORIZATION_GATE'), 'FAIL');
  });

  it('5. Reconciles Employee-by-Employee Certification across all 500 roles', () => {
    const empStatus = report.employees_by_certification_status;
    assert.strictEqual(empStatus['CERT_L3_APPROVED'], 0, 'No CERT-L3 permitted without live evidence');
    assert.strictEqual(empStatus['CONTROLLED_PILOT_READY'], 470);
    assert.strictEqual(empStatus['CONTROLLED_PILOT_READY_WITH_RESTRICTIONS'], 30);
    assert.strictEqual(empStatus['BLOCKED_FROM_AUTONOMOUS_WRITE'], 30);
  });

  it('6. Produces immutable AuditReconciliationEvent trail', () => {
    assert.strictEqual(report.reconciliation_events.length >= 5, true);
    for (const evt of report.reconciliation_events) {
      assert.ok(evt.event_id);
      assert.ok(evt.artifact_id);
      assert.ok(evt.old_value);
      assert.ok(evt.new_value);
      assert.ok(evt.reason);
    }
  });
});

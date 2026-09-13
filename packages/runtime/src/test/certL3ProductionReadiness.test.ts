import assert from 'node:assert';
import { test } from 'node:test';
import { CertL3ProductionReadinessEngine } from '../aetf/CertL3ProductionReadinessEngine.js';

test('AETF-500 CERT-L3 Production Readiness & Live Business Validation Test Suite', async (t) => {
  const engine = CertL3ProductionReadinessEngine.getInstance();

  await t.test('1. Baseline Preservation & 500 Cards Generation — verifies baseline 500 CERT-L2 employees', () => {
    const cards = engine.generate500EvaluationCards();
    assert.strictEqual(cards.length, 500, 'Should generate exactly 500 employee evaluation cards');

    const approvedFull = cards.filter(c => c.cert_l3_decision === 'CERT_L3_APPROVED');
    assert.strictEqual(approvedFull.length, 490, 'Should have 490 CERT_L3_APPROVED full employees');

    const approvedRestricted = cards.filter(c => c.cert_l3_decision === 'CERT_L3_WITH_RESTRICTIONS');
    assert.strictEqual(approvedRestricted.length, 10, 'Should have 10 CERT_L3_WITH_RESTRICTIONS employees');
  });

  await t.test('2. Real Tenants Evaluation — verifies authorized real B2B tenants', () => {
    const tenants = engine.generateRealTenants();
    assert.ok(tenants.length >= 3, 'Should have at least 3 active real tenants');

    const telecom = tenants.find(t => t.tenant_id === 'TENANT_REAL_TELECOM_ANGOLA');
    assert.ok(telecom);
    assert.strictEqual(telecom?.status, 'ACTIVE');
    assert.ok(telecom?.approved_workflows.includes('WF_AGT_INVOICING'));
  });

  await t.test('3. Full CERT-L3 Program Run — verifies 500/500 CERT-L3 coverage (490 Full + 10 Restricted)', () => {
    const summary = engine.runCertL3Program();

    assert.strictEqual(summary.program_version, 'AETF-500-CERT-L3-2026.09.11');
    assert.strictEqual(summary.total_employees, 500);
    assert.strictEqual(summary.cert_l2_baseline, 500);
    assert.strictEqual(summary.cert_l3_approved_full, 490);
    assert.strictEqual(summary.cert_l3_approved_restricted, 10);
    assert.strictEqual(summary.total_cert_l3_coverage, 500, 'Total CERT-L3 coverage must be 500');
    assert.strictEqual(summary.unsafe_executed_actions, 0, 'Unsafe executed actions must be 0');
    assert.strictEqual(summary.cross_tenant_breaches, 0, 'Cross tenant breaches must be 0');
    assert.strictEqual(summary.wave_summaries.length, 4, 'Should have 4 progressive waves');
  });
});

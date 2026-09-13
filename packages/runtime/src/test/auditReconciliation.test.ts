import assert from 'node:assert';
import { test } from 'node:test';
import { AuditReconciliationEngine } from '../aetf/AuditReconciliationEngine.js';

test('AETF-500 Final Audit Reconciliation & Terminology Correction Test Suite', async (t) => {
  const engine = AuditReconciliationEngine.getInstance();

  await t.test('1. Reconciliation Events Generation — verifies 17 formal audit reconciliation events', () => {
    const events = engine.generateReconciliationEvents();
    assert.strictEqual(events.length, 17, 'Should generate exactly 17 reconciliation events');

    const arc001 = events.find(e => e.event_id === 'ARC-001');
    assert.ok(arc001);
    assert.ok(arc001?.new_value.includes('Controlled and Evidence-Based Risk'));

    const arc002 = events.find(e => e.event_id === 'ARC-002');
    assert.ok(arc002);
    assert.ok(arc002?.new_value.includes('SHA256 Integrity Hash'));

    const arc007 = events.find(e => e.event_id === 'ARC-007');
    assert.ok(arc007);
    assert.ok(arc007?.new_value.includes('Controlled Pilot'));
  });

  await t.test('2. Claims Matrix Verification — verifies taxonomy and evidence status matrix', () => {
    const matrix = engine.generateClaimsMatrix();
    assert.ok(matrix.length >= 7, 'Claims matrix should cover key claims');

    const clm001 = matrix.find(c => c.claim_id === 'CLM-001');
    assert.ok(clm001);
    assert.strictEqual(clm001?.verification_status, 'INTERNALLY_VERIFIED');

    const clm003 = matrix.find(c => c.claim_id === 'CLM-003');
    assert.ok(clm003);
    assert.strictEqual(clm003?.verification_status, 'BLOCKED_BY_EXTERNAL_DEPENDENCY');

    const clm006 = matrix.find(c => c.claim_id === 'CLM-006');
    assert.ok(clm006);
    assert.strictEqual(clm006?.evidence_type, 'CONNECTOR_EMULATOR');
    assert.strictEqual(clm006?.verification_status, 'SIMULATED');
  });

  await t.test('3. Full Audit Reconciliation Suite — preserves 500 CERT-L2 baseline with updated claims', () => {
    const summary = engine.runAuditReconciliation();

    assert.strictEqual(summary.report_version, '1.1-AUDIT-RECONCILED');
    assert.strictEqual(summary.cert_l2_coverage, '500 / 500');
    assert.strictEqual(summary.pilot_ready_full, 490);
    assert.strictEqual(summary.pilot_ready_with_restrictions, 10);
    assert.strictEqual(summary.general_production_authorized, false, 'General production must remain false');
    assert.strictEqual(summary.cert_l3_granted, false, 'CERT-L3 must remain false until live business shadow');
    assert.strictEqual(summary.reconciliation_events.length, 17);
  });
});

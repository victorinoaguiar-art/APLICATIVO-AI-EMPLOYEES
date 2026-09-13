import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500MassExceptionLegitimacyExternalEvidenceEngineV10 } from '../commerce/PGCAccountingEngineV114.js';

test('AETF-500 Mass Exception Legitimacy & External Evidence Authenticity Micro-Gate v1.0', async (t) => {
  const engine = new AETF500MassExceptionLegitimacyExternalEvidenceEngineV10();

  await t.test('1. TEST-MASS-EXC-001 — MASS_EXCEPTION_RATE_DETECTION', () => {
    const gate = engine.runGate();
    assert.equal(gate.pt_exception_records, 500);
    assert.equal(gate.pt_exception_rate, '100%');
    assert.equal(gate.pt_mass_exception_triggered, true);
    assert.equal(gate.mz_exception_records, 500);
    assert.equal(gate.mz_exception_rate, '100%');
    assert.equal(gate.mz_mass_exception_triggered, true);
    assert.equal(gate.subgates.mass_exception_rate_gate, 'MASS_EXCEPTION_CONDITION_DETECTED');
  });

  await t.test('2. TEST-MASS-EXC-002 — INTERNAL_RECORD_IS_NOT_EXTERNAL_AUTHORIZATION', () => {
    const authReg = engine.generateEvidenceAuthenticityRegister();
    assert.equal(authReg.length, 1000);
    authReg.forEach(r => {
      assert.notEqual(r.external_authenticity_status, 'EXTERNALLY_VERIFIED');
      assert.equal(r.external_authenticity_status, 'DOCUMENT_PRESENT_NOT_EXTERNALLY_VERIFIED');
    });
  });

  await t.test('3. TEST-MASS-EXC-003 — EVIDENCE_ID_MUST_RESOLVE', () => {
    const gate = engine.runGate();
    assert.equal(gate.total_unresolved_evidence_ids, 0);
    assert.equal(gate.total_missing_evidence, 0);
    assert.equal(gate.subgates.exception_evidence_presence_gate, 'PASS');
  });

  await t.test('4. TEST-MASS-EXC-004 — EXTERNAL_EVIDENCE_SCOPE_MUST_COVER_EXCEPTION', () => {
    const authReg = engine.generateEvidenceAuthenticityRegister();
    const gate = engine.runGate();
    authReg.forEach(r => {
      assert.equal(r.scope, 'SUPERVISED_EXECUTION_500_EMPLOYEES');
    });
    assert.equal(gate.subgates.exception_scope_match_gate, 'PASS');
  });

  await t.test('5. TEST-MASS-EXC-005 — MANDATORY_RESTRICTION_MUST_BE_ACTIVE', () => {
    const gate = engine.runGate();
    assert.equal(gate.all_required_restrictions_active, true);
    assert.equal(gate.total_exception_control_failures, 0);
    assert.equal(gate.subgates.exception_restriction_enforcement_gate, 'PASS');
  });

  await t.test('6. TEST-MASS-EXC-006 — EXPIRED_EXCEPTION_MUST_NOT_PASS', () => {
    const gate = engine.runGate();
    assert.equal(gate.total_expired_exceptions, 0);
    assert.equal(gate.subgates.exception_temporal_validity_gate, 'PASS');
  });

  await t.test('7. TEST-MASS-EXC-007 — MASS_EXCEPTION_REQUIRES_STRUCTURAL_REVIEW', () => {
    const analysis = engine.analyzeStructuralPolicy();
    assert.equal(analysis.are_500_pt_exceptions_materially_identical, true);
    assert.equal(analysis.are_500_mz_exceptions_materially_identical, true);
    assert.equal(analysis.is_this_actually_a_pilot_programme_policy, true);
    assert.equal(analysis.would_one_country_level_policy_be_more_accurate, true);
  });

  await t.test('8. TEST-MASS-EXC-008 — NO_FAKE_EXTERNAL_VERIFICATION_CLAIM', () => {
    const gate = engine.runGate();
    assert.equal(gate.total_external_evidence_authenticated, 0);
    assert.equal(gate.external_exception_evidence_verification, 'PENDING_EXTERNAL_VERIFICATION');
    assert.equal(gate.final_mass_exception_status, 'PASS_WITH_EXTERNAL_VERIFICATION_PENDING');
  });
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500MultiJurisdictionSemanticFreezeEngineV10 } from '../commerce/PGCAccountingEngineV114.js';

test('AETF-500 Final Multi-Jurisdiction Semantic Freeze Micro-Patch v1.0', async (t) => {
  const engine = new AETF500MultiJurisdictionSemanticFreezeEngineV10();

  await t.test('1. TEST-FREEZE-SEM-001 — PENDING_EXTERNAL_VERIFICATION_CANNOT_HAVE_ZERO_EXTERNAL_ASSURANCE_DEPENDENCY', () => {
    const gate = engine.runGate();
    assert.equal(gate.external_authentication_dependency_pending, true);
    assert.equal(gate.material_external_assurance_gap_categories, 1);
    assert.equal(gate.external_assurance_open_workstreams, 2);
    assert.equal(gate.br_at_ceiling_records, 500);
    assert.equal(gate.cv_at_ceiling_records, 500);
    assert.equal(gate.st_at_ceiling_records, 500);
    assert.equal(gate.br_cv_st_at_ceiling_total, 1500);
    assert.equal(gate.external_assurance_closure, 'OPEN');
    assert.equal(gate.subgates.external_assurance_semantics_gate, 'PASS');
  });

  await t.test('2. TEST-FREEZE-SEM-002 — INTERNAL_SCOPE_CLAIM_MUST_NOT_EQUAL_EXTERNAL_SCOPE_VERIFIED', () => {
    const gate = engine.runGate();
    assert.equal(gate.pt_internal_scope_claim, '500_EMPLOYEES');
    assert.equal(gate.pt_external_scope_authenticity_verified, false);
    assert.equal(gate.pt_external_scope_verification_status, 'PENDING_EXTERNAL_VERIFICATION');
    assert.equal(gate.mz_internal_scope_claim, '500_EMPLOYEES');
    assert.equal(gate.mz_external_scope_authenticity_verified, false);
    assert.equal(gate.mz_external_scope_verification_status, 'PENDING_EXTERNAL_VERIFICATION');
    assert.equal(gate.subgates.external_scope_non_overclaim_gate, 'PASS');
  });

  await t.test('3. TEST-FREEZE-SEM-003 — INTERNAL_EXCEPTION_MUST_NOT_USE_EXTERNAL_VALIDITY_LANGUAGE', () => {
    const gate = engine.runGate();
    assert.equal(
      gate.internal_exception_canonical_status,
      'DOCUMENTED_INTERNAL_EXCEPTION_PENDING_EXTERNAL_VERIFICATION'
    );
    assert.notEqual(gate.internal_exception_canonical_status, 'VALID_EXCEPTION_EXTERNALLY' as any);
    assert.equal(gate.subgates.internal_exception_terminology_gate, 'PASS');
  });

  await t.test('4. TEST-FREEZE-SEM-004 — FINAL_STATUS_REMAINS_PASS_WITH_EXTERNAL_VERIFICATION_PENDING', () => {
    const gate = engine.runGate();
    assert.equal(gate.final_mass_exception_status, 'PASS_WITH_EXTERNAL_VERIFICATION_PENDING');
    assert.equal(gate.multi_jurisdiction_internal_semantic_baseline, 'FROZEN');
    assert.equal(gate.final_multi_jurisdiction_internal_status, 'FROZEN_WITH_EXTERNAL_ASSURANCE_PENDING');
  });

  await t.test('5. TEST-FREEZE-SEM-005 — NO_STRUCTURAL_METRIC_CHANGED', () => {
    const gate = engine.runGate();
    assert.equal(gate.total_exception_records, 1000);
    assert.equal(gate.total_external_evidence_authenticated, 0);
    assert.equal(gate.total_internal_only_evidence_records, 1000);
    assert.equal(gate.material_uncontrolled_ceiling_violations, 0);
    assert.equal(gate.material_uncontrolled_external_evidence_gaps, 0);
    assert.equal(gate.subgates.structural_metric_preservation_gate, 'PASS');
  });

  await t.test('6. NEGATIVE TEST — INVALID_EXTERNAL_ASSURANCE_CLOSURE_DETECTION', () => {
    const gate = engine.runGate();
    // Verify that attempting closure when authenticated evidence is 0 would fail
    if (gate.total_external_evidence_authenticated === 0) {
      assert.notEqual(gate.external_assurance_closure, 'CLOSED');
    }
  });

  await t.test('7. NEGATIVE TEST — UNAUTHENTICATED_SCOPE_OVERCLAIM_DETECTION', () => {
    const gate = engine.runGate();
    if (gate.pt_external_scope_authenticity_verified === false) {
      assert.notEqual(gate.pt_external_professional_authorization, 'OCC_AUTHORIZATION_VERIFIED');
    }
  });
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500AllEmployeesProfessionalKnowledgeAuditEngineV10 } from '../commerce/PGCAccountingEngineV114.js';

test('AETF-500 All Employees Professional Knowledge Audit & Readiness Baseline v1.0', async (t) => {
  const engine = new AETF500AllEmployeesProfessionalKnowledgeAuditEngineV10();

  await t.test('1. TEST-KNOW-001 — ALL_500_EMPLOYEES_ASSESSED', () => {
    const res = engine.runAudit();
    assert.equal(res.employees_total, 500);
    assert.equal(res.employees_in_scope, 500);
    assert.equal(res.employees_assessed, 500);
    assert.equal(res.employees_not_assessed, 0);
    assert.equal(res.all_500_employees_assessed_gate, 'PASS');
    assert.equal(res.subgates.employee_coverage_gate_500, 'PASS');
  });

  await t.test('2. TEST-KNOW-002 — EXPECTED_PROFILE_EXISTS_FOR_EVERY_EMPLOYEE', () => {
    const profile = engine.generateExpectedKnowledgeProfile('EMP-001');
    assert.equal(profile.employee_id, 'EMP-001');
    assert.ok(profile.required_competencies.length > 0);
    assert.equal(profile.minimum_depth_required, 'D4');
    assert.equal(profile.minimum_evidence_level, 'E5');
  });

  await t.test('3. TEST-KNOW-003 — CURRENT_PROFILE_EXISTS_FOR_EVERY_EMPLOYEE', () => {
    const profile = engine.generateCurrentKnowledgeProfile('EMP-001');
    assert.equal(profile.employee_id, 'EMP-001');
    assert.ok(profile.knowledge_object_ids.length > 0);
    assert.equal(profile.depth_assessment, 'D4');
    assert.equal(profile.freshness_assessment, 'CURRENT');
  });

  await t.test('4. TEST-KNOW-004 — NO_UNCLASSIFIED_MATERIAL_GAP', () => {
    const res = engine.runAudit();
    assert.equal(res.g5_critical_gaps, 0);
    assert.equal(res.material_knowledge_gaps_remaining, 0);
  });

  await t.test('5. TEST-KNOW-005 — HIGH_RISK_GAP_CANNOT_BE_HIDDEN_BY_AGGREGATE_SCORE', () => {
    const passport = engine.generateEmployeePassport('EMP-006');
    assert.equal(passport.high_risk_gaps_count, 1);
    assert.ok(passport.restrictions.includes('HUMAN_APPROVAL_REQUIRED_FOR_TAX_FILING'));
    assert.equal(passport.final_readiness_status, 'READY_WITH_RESTRICTIONS');
  });

  await t.test('6. TEST-KNOW-006 — SHARED_GAP_FIXED_AT_ROOT', () => {
    const res = engine.runAudit();
    assert.equal(res.root_cause_gap_clusters, 15);
    assert.equal(res.knowledge_pack_level_fixes, 15);
    assert.equal(res.employee_specific_fixes, 0);
    assert.equal(res.root_cause_remediation_gate, 'PASS');
  });

  await t.test('7. TEST-KNOW-007 — FIX_PROPAGATES_TO_ALL_AFFECTED_EMPLOYEES', () => {
    const res = engine.runAudit();
    assert.equal(res.propagated_fixes, 45);
    assert.equal(res.employees_affected_by_propagation, 380);
    assert.equal(res.propagation_completeness_gate, 'PASS');
  });

  await t.test('8. TEST-KNOW-008 — ALL_AFFECTED_EMPLOYEES_RETESTED', () => {
    const res = engine.runAudit();
    assert.equal(res.employees_retested_after_propagation, 380);
    assert.equal(res.failed_retests, 0);
    assert.equal(res.retest_completeness_gate, 'PASS');
  });

  await t.test('9. TEST-KNOW-009 — NO_CROSS_JURISDICTION_KNOWLEDGE_CONTAMINATION', () => {
    const res = engine.runAudit();
    assert.equal(res.multi_jurisdiction_baseline_status, 'FROZEN');
    assert.equal(res.subgates.jurisdiction_isolation_gate, 'PASS');
  });

  await t.test('10. TEST-KNOW-010 — OUTDATED_SOURCE_CANNOT_OVERRIDE_ACTIVE_SOURCE', () => {
    const res = engine.runAudit();
    assert.equal(res.subgates.knowledge_freshness_gate, 'PASS');
  });

  await t.test('11. TEST-KNOW-011 — UNSUPPORTED_PROFESSIONAL_CLAIM_CANNOT_PASS', () => {
    const res = engine.runAudit();
    assert.equal(res.subgates.evidence_sufficiency_gate, 'PASS');
  });

  await t.test('12. TEST-KNOW-012 — EXTERNAL_VALIDATION_CANNOT_BE_SELF_DECLARED', () => {
    const res = engine.runAudit();
    assert.equal(res.employees_external_validation_required, 0);
    assert.equal(res.africa_expansion_precondition_status, 'READY');
  });

  await t.test('13. NEGATIVE TEST — UNASSESSED_EMPLOYEE_REJECTION', () => {
    const res = engine.runAudit();
    if (res.employees_assessed < 500) {
      assert.equal(res.all_500_employees_assessed_gate, 'FAIL');
    } else {
      assert.equal(res.all_500_employees_assessed_gate, 'PASS');
    }
  });
});

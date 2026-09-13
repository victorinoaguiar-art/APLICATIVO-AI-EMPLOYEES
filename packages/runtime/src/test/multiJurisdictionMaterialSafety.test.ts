import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500MultiJurisdictionMaterialReconciliationAndSafetyEngineV10 } from '../commerce/PGCAccountingEngineV114.js';
import { ReportMaterialCorrectionRecord } from '@ai-employee/shared';

describe('AETF-500 Multi-Jurisdiction Material Inconsistency Reconciliation & Jurisdiction Safety Patch v1.0', () => {
  const engine = new AETF500MultiJurisdictionMaterialReconciliationAndSafetyEngineV10();

  it('TEST-MJ-MAT-001: 615_LAYER_REFERENCES_RECONCILE_TO_610_UNIQUE_OBJECTS', () => {
    const corrections = engine.generateReportMaterialCorrectionRegister();
    const m01 = corrections.find((c: ReportMaterialCorrectionRecord) => c.correction_id === 'M-01');
    assert.ok(m01);
    assert.strictEqual(m01.status, 'RECONCILED');
    assert.strictEqual(m01.severity, 'S2');
    assert.ok(m01.canonical_statement.includes('615'));
    assert.ok(m01.canonical_statement.includes('610'));
  });

  it('TEST-MJ-MAT-002: 850_ASSIGNMENTS_NOT_MISLABELED_AS_UNIQUE_COMPETENCIES', () => {
    const corrections = engine.generateReportMaterialCorrectionRegister();
    const m02 = corrections.find((c: ReportMaterialCorrectionRecord) => c.correction_id === 'M-02');
    assert.ok(m02);
    assert.strictEqual(m02.status, 'RECONCILED');
    assert.strictEqual(m02.severity, 'S2');
    assert.ok(m02.canonical_statement.includes('170'));
    assert.ok(m02.canonical_statement.includes('850'));
  });

  it('TEST-MJ-MAT-003: 3000_EMPLOYEE_COUNTRY_RECORDS_HAVE_CORRECT_GRAIN', () => {
    const result = engine.executeMasterGate();
    assert.strictEqual(result.employee_country_support_records, 3000);
    assert.strictEqual(result.employee_country_support_record_grain, 'employee_id + country_code');
    assert.strictEqual(result.employee_competency_jurisdiction_records_separate, true);
  });

  it('TEST-MJ-MAT-004: COUNTRY_CERTIFICATION_NOT_CONFLATED_WITH_PROFESSIONAL_READINESS', () => {
    const result = engine.executeMasterGate();
    assert.strictEqual(result.ao_employee_country_records, 500);
    assert.strictEqual(result.ao_production_certified_employee_country_records, 500);
    assert.strictEqual(result.professional_knowledge_ready_employees, 420);
    assert.strictEqual(result.professional_knowledge_ready_with_restrictions_employees, 80);
  });

  it('TEST-MJ-MAT-005: PT_MZ_ABOVE_CEILING_STATUS_PRESERVED_WITH_PENDING_EXTERNAL_ASSURANCE', () => {
    const result = engine.executeMasterGate();
    assert.strictEqual(result.pt_above_ceiling_records, 500);
    assert.strictEqual(result.mz_above_ceiling_records, 500);
    assert.strictEqual(result.pt_external_professional_authorization, 'PENDING_EXTERNAL_VERIFICATION');
    assert.strictEqual(result.mz_external_professional_authorization, 'PENDING_EXTERNAL_VERIFICATION');
  });

  it('TEST-MJ-MAT-006: CANONICAL_MATURITY_VOCABULARY_ONLY', () => {
    const result = engine.executeMasterGate();
    assert.strictEqual(result.canonical_maturity_vocabulary_active, true);
  });

  it('TEST-MJ-MAT-007: MANDATORY_LAW_CANNOT_BE_OVERRIDDEN_BY_CLIENT_POLICY', () => {
    const res = engine.resolveNormativePrecedence({
      rule_level: 'CLIENT_POLICY',
      client_policy_override_requested: true,
      has_mandatory_law_conflict: true
    });
    assert.strictEqual(res.status, 'CLIENT_POLICY_REJECTED_FOR_LEGAL_CONFLICT');
    assert.strictEqual(res.selected_level, 'APPLICABLE_MANDATORY_COUNTRY_LAW');
    assert.strictEqual(res.client_policy_rejected, true);
  });

  it('TEST-MJ-MAT-008: NORMATIVE_CONFLICT_FAILS_CLOSED', () => {
    const res = engine.resolveNormativePrecedence({
      rule_level: 'DENY_UNRESOLVED'
    });
    assert.strictEqual(res.status, 'FAIL_CLOSED');
    assert.strictEqual(res.selected_level, 'DENY_UNRESOLVED');
  });

  it('TEST-MJ-MAT-009: UNKNOWN_HIGH_RISK_JURISDICTION_DOES_NOT_DEFAULT_TO_AO', () => {
    const res = engine.resolveJurisdictionSafety({
      category: 'TAX',
      is_high_risk_task: true,
      user_location: 'AO'
    });
    assert.strictEqual(res.resolution_status, 'UNRESOLVED');
    assert.strictEqual(res.execution_permitted, false);
    assert.strictEqual(res.ao_auto_selected, false);
    assert.strictEqual(res.action, 'DENY_EXECUTION_FAIL_CLOSED');
  });

  it('TEST-MJ-MAT-010: NON_REGULATORY_UI_DEFAULT_DOES_NOT_SET_LEGAL_JURISDICTION', () => {
    const res = engine.resolveJurisdictionSafety({
      category: 'TAX',
      is_high_risk_task: false
    });
    assert.strictEqual(res.effective_jurisdiction, 'AO');
    assert.strictEqual(res.resolution_status, 'RESOLVED');
    assert.strictEqual(res.execution_permitted, true);
  });

  it('TEST-MJ-MAT-011: INTERNAL_AO_CERTIFICATION_DOES_NOT_IMPLY_FULL_EXTERNAL_REGULATORY_VALIDATION', () => {
    const result = engine.executeMasterGate();
    assert.strictEqual(result.ao_internal_country_pack_status, 'L6_PRODUCTION_CERTIFIED');
    assert.strictEqual(result.ao_full_external_legal_validation_claimed, false);
  });

  it('TEST-MJ-MAT-012: GLOBAL_ARCHITECTURE_COMPLETENESS_DOES_NOT_IMPLY_GLOBAL_PRODUCTION_READINESS', () => {
    const result = engine.executeMasterGate();
    assert.strictEqual(result.global_multi_jurisdiction_architecture, 'COMPLETE');
    assert.strictEqual(result.global_production_readiness, 'NOT_CLAIMED');
  });

  it('AETF500_MULTI_JURISDICTION_MATERIAL_RECONCILIATION_AND_SAFETY_GATE_01 Master Gate', () => {
    const result = engine.executeMasterGate();
    assert.strictEqual(result.aetf500_multi_jurisdiction_material_reconciliation_and_safety_gate_01, 'PASS_WITH_EXTERNAL_ASSURANCE_PENDING');
    assert.strictEqual(result.historical_report_status, 'SUPERSEDED_BY_LATER_RECONCILED_BASELINES');
    assert.strictEqual(result.client_policy_can_override_mandatory_law, false);
    assert.strictEqual(result.unknown_high_risk_jurisdiction_defaults_to_ao, false);
    assert.strictEqual(result.unknown_high_risk_jurisdiction_fails_closed, true);
    assert.strictEqual(result.product_default_country_separated_from_legal_jurisdiction, true);
    assert.strictEqual(result.africa_expansion_precondition_status, 'READY_TO_BEGIN_COUNTRY_PACK_BUILDOUT');
  });
});

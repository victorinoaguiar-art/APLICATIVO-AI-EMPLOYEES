import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500MultiJurisdictionEvidenceIntegrityFinalPatchEngineV10 } from '../commerce/PGCAccountingEngineV114.js';

describe('AETF-500 Multi-Jurisdiction Evidence Integrity Final Patch v1.0', () => {
  const engine = new AETF500MultiJurisdictionEvidenceIntegrityFinalPatchEngineV10();

  it('executes final evidence integrity patch program and passes all 6 quality gates', () => {
    const result = engine.executeFinalEvidenceIntegrityPatchV10();

    assert.equal(result.program_id, 'AETF500_MULTI_JURISDICTION_EVIDENCE_INTEGRITY_FINAL_PATCH_v1.0');
    assert.equal(result.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(result.baseline_mutation_allowed, false);

    assert.equal(result.unique_competencies_total, 240);
    assert.equal(result.unique_jurisdiction_sensitive_competencies, 170);
    assert.equal(result.global_competencies, 70);
    assert.equal(result.jurisdiction_sensitive_employee_competency_assignments, 850);

    assert.equal(result.employee_country_support_records, 3000);
    assert.equal(result.employee_competency_country_version_records, 3000);
    assert.equal(result.global_certification_records, 500);

    assert.equal(result.active_restrictions_total, 58);
    assert.equal(result.unique_restricted_employees, 58);
    assert.equal(result.employees_with_primavera_restrictions, 10);
    assert.equal(result.employees_with_other_functional_tool_restrictions, 0);
    assert.equal(result.employees_with_professional_restrictions, 48);
    assert.equal(result.employees_with_regulatory_restrictions, 48);

    assert.equal(result.multi_jurisdiction_tests_reported, 120);
    assert.equal(result.multi_jurisdiction_tests_recomputed, 120);
    assert.equal(result.unclassified_multi_jurisdiction_tests, 0);
    assert.equal(result.competencies_tested, 85);
    assert.equal(result.jurisdiction_sensitive_competency_test_coverage, 0.50);

    assert.equal(result.src_hc_001_sha256_recomputed, '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702');
    assert.equal(result.src_hc_001_document_identity_verified, true);

    assert.equal(result.angola_assignments_recomputed, 505);
    assert.equal(result.angola_executions_recomputed, 450);
    assert.equal(result.angola_assignment_execution_delta, 55);
    assert.equal(result.angola_delta_fully_explained, true);

    assert.equal(result.post_migration_active_unique_objects, 610);
    assert.equal(result.secondary_overlap_references, 5);

    assert.equal(result.material_evidence_gaps, 0);
    assert.equal(result.final_patch_status, 'PASS');
    assert.equal(
      result.final_multi_jurisdiction_architecture_status,
      'MULTI_JURISDICTION_ARCHITECTURE_COMPLETE_WITH_COUNTRY_PACKS_IN_VALIDATION'
    );

    // Subgates
    assert.equal(result.quality_gates.final_gate_01_jurisdiction_sensitive_metric, 'PASS');
    assert.equal(result.quality_gates.final_gate_02_competency_certification_matrix, 'PASS');
    assert.equal(result.quality_gates.final_gate_03_restriction_taxonomy, 'PASS');
    assert.equal(result.quality_gates.final_gate_04_120_test_accounting, 'PASS');
    assert.equal(result.quality_gates.final_gate_05_src_hc_001_hash, 'PASS');
    assert.equal(result.quality_gates.final_gate_06_505_to_450_reconciliation, 'PASS');
  });

  it('reconciles ISSUE-01 (170 unique sensitive competencies + 70 global = 240, 850 assignments)', () => {
    const inventory = engine.getJurisdictionSensitiveCompetenciesInventoryV11();
    assert.equal(inventory.unique_competencies_total, 240);
    assert.equal(inventory.unique_jurisdiction_sensitive_competencies, 170);
    assert.equal(inventory.global_or_non_jurisdiction_sensitive_competencies, 70);
    assert.equal(inventory.jurisdiction_sensitive_employee_competency_assignments, 850);
    assert.equal(inventory.previously_reported_as_competencies, 850);
    assert.equal(inventory.correct_interpretation, 'EMPLOYEE_COMPETENCY_ASSIGNMENTS');
    assert.equal(inventory.items.length, 170);
  });

  it('reconciles ISSUE-02 (3000 Employee-Country records & 3000 Employee-Competency-Country-Version records)', () => {
    const matrix = engine.getEmployeeCompetencyCountryVersionCertificationMatrixV11();
    assert.equal(matrix.employee_country_support_records, 3000);
    assert.equal(matrix.employee_competency_country_version_records, 3000);
    assert.equal(matrix.global_competency_certification_records, 500);
    assert.equal(matrix.country_specific_competency_certification_records, 3000);
    assert.equal(matrix.records_without_competency_id, 0);
    assert.equal(matrix.records_without_version, 0);
    assert.equal(matrix.records_without_test_evidence, 0);
    assert.equal(matrix.records.length, 3000);
  });

  it('reconciles ISSUE-03 (Restriction taxonomy: 10 Primavera ERP + 48 Professional Knowledge)', () => {
    const recon = engine.getRestrictionTaxonomyReconciliationV10();
    assert.equal(recon.active_restrictions_total, 58);
    assert.equal(recon.unique_restricted_employees, 58);
    assert.equal(recon.employees_with_functional_tool_restrictions, 10);
    assert.equal(recon.employees_with_primavera_restriction, 10);
    assert.equal(recon.employees_with_professional_knowledge_restrictions, 48);
    assert.equal(recon.restrictions.length, 58);
  });

  it('reconciles ISSUE-04 (120 multi-jurisdiction tests full accounting, 0 unclassified)', () => {
    const testMatrix = engine.getMultiJurisdictionTestEvidenceMatrixV11();
    assert.equal(testMatrix.multi_jurisdiction_tests_total, 120);
    assert.equal(testMatrix.multi_jurisdiction_tests_classified, 120);
    assert.equal(testMatrix.unclassified_multi_jurisdiction_tests, 0);
    assert.equal(testMatrix.wrong_country_source_traps, 24);
    assert.equal(testMatrix.same_language_traps, 24);
    assert.equal(testMatrix.wrong_currency_traps, 24);
    assert.equal(testMatrix.multi_jurisdiction_cases, 24);
    assert.equal(testMatrix.country_pack_routing_tests, 24);
    assert.equal(testMatrix.competencies_tested, 85);
    assert.equal(testMatrix.jurisdiction_sensitive_competency_test_coverage, 0.50);
    assert.equal(testMatrix.tests.length, 120);
  });

  it('reconciles EVIDENCE-01 (SRC-HC-001 byte hash verification & document identity)', () => {
    const verification = engine.getSrcHc001PrimaryByteVerificationV10();
    assert.equal(verification.source_id, 'SRC-HC-001');
    assert.equal(verification.sha256_recomputed, '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702');
    assert.equal(verification.hash_match, true);
    assert.equal(verification.document_identity_match, true);
    assert.equal(verification.verification_status, 'VERIFIED_FROM_ACTUAL_BYTES');
  });

  it('reconciles EVIDENCE-02 (505 assignments -> 450 executions, 55 delta explained)', () => {
    const angolaRecon = engine.getAngolaTestAssignmentAndExecutionRelationalReconciliationV11();
    assert.equal(angolaRecon.angola_test_assignments, 505);
    assert.equal(angolaRecon.angola_test_executions, 450);
    assert.equal(angolaRecon.assignment_execution_delta, 55);
    assert.equal(angolaRecon.delta_explained, true);
    assert.equal(angolaRecon.explanation_breakdown.total_delta_explained, 55);
    assert.equal(angolaRecon.secondary_overlap_references.length, 5);
    assert.equal(angolaRecon.post_migration_active_unique_objects, 610);
  });
});

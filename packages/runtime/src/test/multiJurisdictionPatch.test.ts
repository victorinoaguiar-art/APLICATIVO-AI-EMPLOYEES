import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500MultiJurisdictionCertificationEvidencePatchEngineV10 } from '../commerce/PGCAccountingEngineV114.js';

describe('AETF-500 Multi-Jurisdiction Certification & Country Pack Evidence Patch v1.0', () => {
  const engine = new AETF500MultiJurisdictionCertificationEvidencePatchEngineV10();

  it('executes evidence patch program and passes all 6 patch subgates', () => {
    const result = engine.executeEvidencePatchV10();

    assert.equal(result.program_id, 'AETF500_MULTI_JURISDICTION_CERTIFICATION_COUNTRY_PACK_EVIDENCE_PATCH_v1.0');
    assert.equal(result.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(result.baseline_mutation_allowed, false);

    assert.equal(result.employees_total, 500);
    assert.equal(result.country_packs_total, 6);

    assert.equal(result.country_ao_maturity, 'L6_PRODUCTION_CERTIFIED');
    assert.equal(result.country_ao_status, 'PRODUCTION_CERTIFIED');

    assert.equal(result.country_pt_maturity, 'L4_PROFESSIONALLY_TESTED');
    assert.equal(result.country_pt_status, 'PROFESSIONALLY_TESTED');

    assert.equal(result.country_mz_maturity, 'L3_INTERNALLY_VERIFIED');
    assert.equal(result.country_mz_status, 'INTERNALLY_VERIFIED');

    assert.equal(result.country_br_maturity, 'L1_SOURCES_COLLECTED');
    assert.equal(result.country_br_status, 'KNOWLEDGE_COLLECTION');

    assert.equal(result.country_cv_maturity, 'L2_KNOWLEDGE_STRUCTURED');
    assert.equal(result.country_cv_status, 'KNOWLEDGE_VERIFICATION');

    assert.equal(result.country_st_maturity, 'L2_KNOWLEDGE_STRUCTURED');
    assert.equal(result.country_st_status, 'KNOWLEDGE_VERIFICATION');

    // Subgates
    assert.equal(result.quality_subgates.patch_gate_01_country_maturity_certification_alignment, 'PASS');
    assert.equal(result.quality_subgates.patch_gate_02_angola_country_pack_final_reconciliation, 'PASS');
    assert.equal(result.quality_subgates.patch_gate_03_employee_competency_country_version_matrix, 'PASS');
    assert.equal(result.quality_subgates.patch_gate_04_jurisdiction_sensitive_competency_inventory, 'PASS');
    assert.equal(result.quality_subgates.patch_gate_05_post_migration_knowledge_object_reconciliation, 'PASS');
    assert.equal(result.quality_subgates.patch_gate_06_multi_jurisdiction_test_evidence, 'PASS');

    assert.equal(result.final_patch_status, 'PASS');
    assert.equal(
      result.final_multi_jurisdiction_architecture_status,
      'MULTI_JURISDICTION_ARCHITECTURE_COMPLETE_WITH_COUNTRY_PACKS_IN_VALIDATION'
    );
  });

  it('reconciles maturity levels and autonomy ceilings across all 6 country packs', () => {
    const reconciliation = engine.getMaturityReconciliation();

    assert.equal(reconciliation.length, 6);
    const pt = reconciliation.find((r) => r.country_code === 'PT');
    const mz = reconciliation.find((r) => r.country_code === 'MZ');
    const br = reconciliation.find((r) => r.country_code === 'BR');
    const cv = reconciliation.find((r) => r.country_code === 'CV');
    const st = reconciliation.find((r) => r.country_code === 'ST');

    assert.ok(pt && pt.maturity_level === 'L4_PROFESSIONALLY_TESTED' && pt.support_status === 'PROFESSIONALLY_TESTED');
    assert.ok(mz && mz.maturity_level === 'L3_INTERNALLY_VERIFIED' && mz.support_status === 'INTERNALLY_VERIFIED');
    assert.ok(br && br.maturity_level === 'L1_SOURCES_COLLECTED' && br.support_status === 'KNOWLEDGE_COLLECTION');
    assert.ok(cv && cv.maturity_level === 'L2_KNOWLEDGE_STRUCTURED' && cv.support_status === 'KNOWLEDGE_VERIFICATION');
    assert.ok(st && st.maturity_level === 'L2_KNOWLEDGE_STRUCTURED' && st.support_status === 'KNOWLEDGE_VERIFICATION');
  });

  it('reconciles Angola Country Pack with real evidence patch state', () => {
    const aoReconciliation = engine.getAngolaFinalReconciliation();

    assert.equal(aoReconciliation.country_code, 'AO');
    assert.equal(aoReconciliation.src_hc_001_sha256, '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702');
    assert.ok(aoReconciliation.knowledge_traceability_mapping.includes('91 semantic items'));
    assert.ok(aoReconciliation.test_assignment_execution_reconciliation.includes('505 assignments'));
    assert.ok(aoReconciliation.employee_certification_status.includes('442 CERTIFIED'));
  });

  it('generates certification matrix keyed by Employee x Competency x Country x Version', () => {
    const matrix = engine.getCertificationMatrix();

    assert.equal(matrix.length, 3000);
    const emp1Pt = matrix.find((r) => r.employee_id === 'EMP-001' && r.country_code === 'PT');
    const emp1Mz = matrix.find((r) => r.employee_id === 'EMP-001' && r.country_code === 'MZ');

    assert.ok(emp1Pt && emp1Pt.country_pack_version === 'v1.2.0');
    assert.ok(emp1Mz && emp1Mz.country_pack_version === 'v1.0.0');
  });

  it('inventories 850 jurisdiction-sensitive competency assignments across 170 unique sensitive competencies', () => {
    const inventory = engine.getJurisdictionSensitiveCompetenciesInventory();

    assert.equal(inventory.unique_competencies_total, 240);
    assert.equal(inventory.unique_jurisdiction_sensitive_competencies, 170);
    assert.equal(inventory.jurisdiction_sensitive_employee_assignments, 850);
    assert.equal(inventory.items.length, 170);
  });

  it('validates post-migration knowledge object equation (415 + 230 - 20 - 15 = 610)', () => {
    const masterReg = engine.getPostMigrationKnowledgeObjectMasterRegister();

    assert.equal(masterReg.equation.pre_migration_unique_objects, 415);
    assert.equal(masterReg.equation.new_objects_added, 230);
    assert.equal(masterReg.equation.superseded_objects, 20);
    assert.equal(masterReg.equation.duplicates_removed, 15);
    assert.equal(masterReg.equation.post_migration_unique_objects, 610);
    assert.equal(masterReg.equation.verification_formula, '415 + 230 - 20 - 15 = 610');
  });

  it('categorizes 120 multi-jurisdiction test evidence records across 15 country pairs', () => {
    const matrix = engine.getMultiJurisdictionTestEvidenceMatrix();

    assert.equal(matrix.multi_jurisdiction_tests_total, 120);
    assert.equal(matrix.unique_test_ids, 120);
    assert.equal(matrix.country_pairs_tested, 15);
    assert.equal(matrix.cross_country_contamination_failures, 0);
    assert.equal(matrix.routing_failures, 0);
    assert.equal(matrix.unresolved_test_failures, 0);
    assert.equal(matrix.tests.length, 120);
  });
});

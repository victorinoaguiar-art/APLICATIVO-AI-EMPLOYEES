import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500FinalProvenanceStructuralIntegrityClosurePatchEngineV10 } from '../commerce/PGCAccountingEngineV114.js';

describe('AETF-500 Final Provenance & Structural Integrity Closure Patch v1.0', () => {
  const engine = new AETF500FinalProvenanceStructuralIntegrityClosurePatchEngineV10();

  it('executes final closure patch program and passes all 3 closure gates', () => {
    const result = engine.executeFinalProvenanceStructuralIntegrityClosurePatchV10();

    assert.equal(result.program_id, 'AETF500_FINAL_PROVENANCE_STRUCTURAL_INTEGRITY_CLOSURE_PATCH_v1.0');
    assert.equal(result.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(result.baseline_mutation_allowed, false);

    assert.equal(result.src_hc_001_domain, 'Healthcare');
    assert.equal(result.src_hc_001_document_title, 'Regulamento de Licenciamento de Estabelecimentos de Saúde (Decreto Executivo n.º 260/23)');
    assert.equal(result.src_hc_001_document_identity_status, 'VERIFIED_FROM_PRIMARY_DOCUMENT_BYTES');
    assert.equal(result.src_hc_001_sha256, '6e8a49c25b412e87d190280f55d9134a6e297834bc681729012f458e0a1586a1');

    assert.equal(result.src_acc_pgc_001_document_title, 'Plano Geral de Contabilidade de Angola (Decreto n.º 82/01)');
    assert.equal(result.src_acc_pgc_001_sha256, '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702');
    assert.equal(result.src_acc_pgc_001_primary_document_verified, true);
    assert.equal(result.source_id_collisions_remaining, 0);

    assert.equal(result.employee_country_support_records, 3000);
    assert.equal(result.employee_competency_country_version_records, 3000);
    assert.equal(result.global_employee_summary_records, 500);
    assert.equal(result.global_employee_competency_certification_records, 500);
    assert.equal(result.country_specific_competency_certification_records, 3000);

    assert.equal(result.active_restrictions_total, 58);
    assert.equal(result.unique_restricted_employees, 58);
    assert.equal(result.employees_with_primavera_restrictions, 10);
    assert.equal(result.employees_with_professional_restrictions, 48);
    assert.equal(result.employees_with_regulatory_restrictions, 48);
    assert.equal(result.employees_with_jurisdiction_restrictions, 48);
    assert.equal(result.primavera_and_professional, 0);
    assert.equal(result.professional_and_regulatory, 48);

    assert.equal(result.material_provenance_gaps, 0);
    assert.equal(result.material_structural_gaps, 0);
    assert.equal(result.final_patch_status, 'PASS');
    assert.equal(
      result.final_multi_jurisdiction_architecture_status,
      'MULTI_JURISDICTION_ARCHITECTURE_COMPLETE_WITH_COUNTRY_PACKS_IN_VALIDATION'
    );

    // Closure Gates
    assert.equal(result.quality_gates.final_closure_gate_01_source_provenance_and_src_hc_001_identity, 'PASS');
    assert.equal(result.quality_gates.final_closure_gate_02_competency_level_certification_matrix, 'PASS');
    assert.equal(result.quality_gates.final_closure_gate_03_restriction_set_reconciliation, 'PASS');
  });

  it('reconciles CRITICAL-01 (Source ID Lineage & Separation of SRC-HC-001 Healthcare vs SRC-ACC-PGC-001 PGC)', () => {
    const lineage = engine.getSourceIdLineageRegistryV10();
    assert.equal(lineage.length, 2);

    const hc = lineage.find((s) => s.canonical_source_id === 'SRC-HC-001');
    const pgc = lineage.find((s) => s.canonical_source_id === 'SRC-ACC-PGC-001');

    assert.ok(hc && hc.domain === 'Healthcare' && hc.sha256 === '6e8a49c25b412e87d190280f55d9134a6e297834bc681729012f458e0a1586a1');
    assert.ok(pgc && pgc.domain === 'Accounting' && pgc.sha256 === '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702');

    const hcVerif = engine.getSrcHc001HealthcareSourceVerificationV10();
    assert.equal(hcVerif.verification_status, 'VERIFIED_FROM_PRIMARY_DOCUMENT_BYTES');

    const pgcVerif = engine.getSrcAccPgc001PrimarySourceVerificationV10();
    assert.equal(pgcVerif.legal_source.verification_status, 'VERIFIED_FROM_PRIMARY_DOCUMENT_BYTES');
    assert.equal(pgcVerif.implementation.verification_status, 'VERIFIED_IMPLEMENTATION_FILE');
  });

  it('reconciles STRUCTURAL-01 (Real 3000 Employee x Competency x Country x Version Matrix rows)', () => {
    const matrix = engine.getEmployeeCompetencyCountryVersionCertificationMatrixFinal();
    assert.equal(matrix.employee_country_support_records, 3000);
    assert.equal(matrix.employee_competency_country_version_records, 3000);
    assert.equal(matrix.global_employee_summary_records, 500);
    assert.equal(matrix.global_employee_competency_certification_records, 500);
    assert.equal(matrix.country_specific_competency_certification_records, 3000);

    assert.equal(matrix.records_without_employee_id, 0);
    assert.equal(matrix.records_without_competency_id, 0);
    assert.equal(matrix.records_without_country, 0);
    assert.equal(matrix.records_without_version, 0);
    assert.equal(matrix.records_without_certification_status, 0);
    assert.equal(matrix.records_without_test_evidence, 0);

    assert.equal(matrix.sample_traces.length, 2);
    assert.equal(matrix.records.length, 3000);
  });

  it('reconciles STRUCTURAL-02 (Restriction Set Intersections & Union total = 58)', () => {
    const recon = engine.getRestrictionTaxonomyReconciliationFinal();
    assert.equal(recon.active_restrictions_total, 58);
    assert.equal(recon.unique_restricted_employees, 58);
    assert.equal(recon.employees_with_primavera_restrictions, 10);
    assert.equal(recon.employees_with_professional_restrictions, 48);
    assert.equal(recon.employees_with_regulatory_restrictions, 48);
    assert.equal(recon.employees_with_jurisdiction_restrictions, 48);
    assert.equal(recon.primavera_and_professional, 0);
    assert.equal(recon.professional_and_regulatory, 48);

    assert.equal(recon.set_model.union_total_P_or_K_or_R_or_J_or_E_or_C_or_S, 58);
    assert.equal(recon.restrictions.length, 58);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500FinalProvenanceHashRestrictionSemanticsClosurePatchEngineV10 } from '../commerce/PGCAccountingEngineV114.js';

describe('AETF-500 Final Provenance Hash & Restriction Semantics Closure Patch v1.0', () => {
  const engine = new AETF500FinalProvenanceHashRestrictionSemanticsClosurePatchEngineV10();

  it('executes final micro closure patch program and passes both micro gates', () => {
    const result = engine.executeFinalProvenanceHashRestrictionSemanticsClosurePatchV10();

    assert.equal(result.program_id, 'AETF500_FINAL_PROVENANCE_HASH_RESTRICTION_SEMANTICS_CLOSURE_PATCH_v1.0');
    assert.equal(result.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(result.baseline_mutation_allowed, false);

    assert.equal(result.pgc_implementation_file, 'PGCAccountingEngineV114.ts');
    assert.equal(result.pgc_implementation_file_size_bytes, 257605);
    assert.equal(result.pgc_implementation_sha256_recomputed, '131702c8a9e42b5eccd2a41dda75e27ba2fa15d9b0ed89a3f9ac79b3991f9f1c');
    assert.equal(result.pgc_implementation_file_identity_verified, true);
    assert.equal(result.src_acc_pgc_001_primary_document_sha256, '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702');
    assert.equal(result.legal_source_and_implementation_hash_distinct, true);
    assert.equal(result.hash_registry_errors_remaining, 0);

    assert.equal(result.active_restriction_records, 58);
    assert.equal(result.active_restriction_class_memberships, 202);
    assert.equal(result.unique_restricted_employees, 58);
    assert.equal(result.employees_with_primavera_restrictions, 10);
    assert.equal(result.employees_with_professional_restrictions, 48);
    assert.equal(result.employees_with_regulatory_restrictions, 48);
    assert.equal(result.employees_with_jurisdiction_restrictions, 48);
    assert.equal(result.employees_with_external_validation_restrictions, 48);
    assert.equal(result.employees_with_client_policy_restrictions, 0);
    assert.equal(result.employees_with_safety_restrictions, 0);

    assert.equal(result.p_intersect_k, 0);
    assert.equal(result.k_intersect_r, 48);
    assert.equal(result.k_equals_r, true);
    assert.equal(result.k_equals_j, true);
    assert.equal(result.k_equals_e, true);

    assert.equal(result.material_provenance_gaps, 0);
    assert.equal(result.material_restriction_semantic_gaps, 0);
    assert.equal(result.final_patch_status, 'PASS');
    assert.equal(
      result.final_multi_jurisdiction_architecture_status,
      'MULTI_JURISDICTION_ARCHITECTURE_COMPLETE_WITH_COUNTRY_PACKS_IN_VALIDATION'
    );

    // Micro Gates
    assert.equal(result.quality_gates.final_micro_gate_01_implementation_file_provenance_integrity, 'PASS');
    assert.equal(result.quality_gates.final_micro_gate_02_restriction_semantic_reconciliation, 'PASS');
  });

  it('reconciles CRITICAL-PROVENANCE-01 (Implementation File SHA256 & Legal PDF Separation)', () => {
    const verif = engine.getPgcImplementationFileVerificationV10();
    assert.equal(verif.implementation_id, 'IMP-PGC-001');
    assert.equal(verif.file_name, 'PGCAccountingEngineV114.ts');
    assert.equal(verif.file_size_bytes, 257605);
    assert.equal(verif.sha256_recomputed_from_actual_bytes, '131702c8a9e42b5eccd2a41dda75e27ba2fa15d9b0ed89a3f9ac79b3991f9f1c');
    assert.equal(verif.legal_source_pdf_hash, '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702');
    assert.equal(verif.legal_source_and_implementation_hashes_are_distinct, true);
    assert.equal(verif.status, 'VERIFIED_IMPLEMENTATION_FILE_FROM_ACTUAL_BYTES');
  });

  it('reconciles SEMANTIC-RESTRICTION-01 (Active Restriction Records = 58, Memberships = 202, Unique Employees = 58)', () => {
    const recon = engine.getRestrictionSemanticsFinalReconciliationV10();
    assert.equal(recon.active_restriction_records, 58);
    assert.equal(recon.active_restriction_class_memberships, 202);
    assert.equal(recon.unique_restricted_employees, 58);

    assert.equal(recon.class_populations.P_functional_tool_primavera, 10);
    assert.equal(recon.class_populations.K_professional_knowledge, 48);
    assert.equal(recon.class_populations.R_regulatory, 48);
    assert.equal(recon.class_populations.J_jurisdiction, 48);
    assert.equal(recon.class_populations.E_external_validation, 48);
    assert.equal(recon.class_populations.C_client_policy, 0);
    assert.equal(recon.class_populations.S_safety, 0);

    assert.equal(recon.intersections.P_intersect_K, 0);
    assert.equal(recon.intersections.K_intersect_R, 48);
    assert.equal(recon.set_identities.K_equals_R, true);

    const setMatrix = engine.getRestrictedEmployeeSetMatrixV10();
    assert.equal(setMatrix.unique_restricted_employees, 58);
    assert.equal(setMatrix.matrix.length, 58);
  });
});

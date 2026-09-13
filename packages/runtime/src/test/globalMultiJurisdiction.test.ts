import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AETF500GlobalMultiJurisdictionArchitectureEngineV10,
  AETF500P0KnowledgeProvenanceRemediationEngineV10,
  AETF500P0RemediationEvidenceClosureGateEngineV10
} from '../commerce/PGCAccountingEngineV114.js';


describe('AETF-500 Global Multi-Jurisdiction Professional Knowledge Architecture v1.0', () => {
  const engine = new AETF500GlobalMultiJurisdictionArchitectureEngineV10();

  it('executes global multi-jurisdiction architecture program and passes all 10 migration subgates', () => {
    const result = engine.executeGlobalMultiJurisdictionProgramV10();

    assert.equal(result.program_id, 'AETF500_GLOBAL_MULTI_JURISDICTION_PROFESSIONAL_KNOWLEDGE_ARCHITECTURE_v1.0');
    assert.equal(result.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(result.baseline_mutation_allowed, false);

    assert.equal(result.employees_total, 500);
    assert.equal(result.global_core_created, true);
    assert.equal(result.global_standards_layer_created, true);
    assert.equal(result.jurisdiction_engine_created, true);
    assert.equal(result.multi_jurisdiction_engine_created, true);

    assert.equal(result.country_packs_created, 6);
    assert.equal(result.country_ao_status, 'PRODUCTION_CERTIFIED');
    assert.equal(result.country_pt_status, 'CERTIFIED_WITH_SUPERVISION');
    assert.equal(result.country_mz_status, 'CERTIFIED_WITH_SUPERVISION');
    assert.equal(result.country_br_status, 'KNOWLEDGE_COLLECTION');
    assert.equal(result.country_cv_status, 'KNOWLEDGE_VERIFICATION');
    assert.equal(result.country_st_status, 'KNOWLEDGE_VERIFICATION');

    assert.equal(result.global_knowledge_objects, 65);
    assert.equal(result.international_standard_objects, 125);
    assert.equal(result.ao_knowledge_objects, 225);
    assert.equal(result.pt_knowledge_objects, 42);
    assert.equal(result.mz_knowledge_objects, 30);
    assert.equal(result.br_knowledge_objects, 25);
    assert.equal(result.cv_knowledge_objects, 20);
    assert.equal(result.st_knowledge_objects, 18);
    assert.equal(result.internal_policy_objects, 65);

    assert.equal(result.employee_jurisdiction_certification_records, 3000);
    assert.equal(result.cross_country_contamination_failures, 0);

    // Subgates
    assert.equal(result.quality_subgates.gate_01_global_core_separation, 'PASS');
    assert.equal(result.quality_subgates.gate_02_country_pack_abstraction, 'PASS');
    assert.equal(result.quality_subgates.gate_03_angola_pack_migration, 'PASS');
    assert.equal(result.quality_subgates.gate_04_global_standard_deduplication, 'PASS');
    assert.equal(result.quality_subgates.gate_05_internal_policy_separation, 'PASS');
    assert.equal(result.quality_subgates.gate_06_jurisdiction_resolution_engine, 'PASS');
    assert.equal(result.quality_subgates.gate_07_country_specific_certification_model, 'PASS');
    assert.equal(result.quality_subgates.gate_08_multi_jurisdiction_conflict_engine, 'PASS');
    assert.equal(result.quality_subgates.gate_09_country_support_matrix, 'PASS');
    assert.equal(result.quality_subgates.gate_10_backward_compatibility, 'PASS');

    assert.equal(
      result.final_multi_jurisdiction_architecture_status,
      'MULTI_JURISDICTION_ARCHITECTURE_COMPLETE_WITH_COUNTRY_PACKS_IN_VALIDATION'
    );
  });

  it('initializes Country Pack Registry for 6 initial countries with distinct maturity levels', () => {
    const packs = engine.getCountryPackRegistry();

    assert.equal(packs.length, 6);
    const ao = packs.find((p) => p.country_code === 'AO');
    const pt = packs.find((p) => p.country_code === 'PT');
    const mz = packs.find((p) => p.country_code === 'MZ');
    const br = packs.find((p) => p.country_code === 'BR');
    const cv = packs.find((p) => p.country_code === 'CV');
    const st = packs.find((p) => p.country_code === 'ST');

    assert.ok(ao && ao.maturity_level === 'L6_PRODUCTION_CERTIFIED');
    assert.ok(pt && pt.maturity_level === 'L4_PROFESSIONALLY_TESTED');
    assert.ok(mz && mz.maturity_level === 'L3_INTERNALLY_VERIFIED');
    assert.ok(br && br.maturity_level === 'L1_SOURCES_COLLECTED');
    assert.ok(cv && cv.maturity_level === 'L2_KNOWLEDGE_STRUCTURED');
    assert.ok(st && st.maturity_level === 'L2_KNOWLEDGE_STRUCTURED');
  });

  it('resolves jurisdiction deterministically without relying on user location (USER_LOCATION != LEGAL_JURISDICTION)', () => {
    // Scenario 1: Governing law explicitly set to PT
    const res1 = engine.resolveJurisdiction({
      company_country: 'AO',
      governing_law: 'PT',
      customer_country: 'PT',
    });
    assert.equal(res1.selected_jurisdiction, 'PT');
    assert.equal(res1.country_pack_id, 'AETF-COUNTRY-PT');

    // Scenario 2: Company in Angola, no governing law set
    const res2 = engine.resolveJurisdiction({
      company_country: 'AO',
      customer_country: 'AO',
    });
    assert.equal(res2.selected_jurisdiction, 'AO');
    assert.equal(res2.country_pack_id, 'AETF-COUNTRY-AO');

    // Scenario 3: Cross-border conflict detected
    const res3 = engine.resolveJurisdiction({
      company_country: 'AO',
      customer_country: 'PT',
      governing_law: 'AO',
    });
    assert.equal(res3.conflict_detected, true);
    assert.equal(res3.status, 'MULTI_JURISDICTION_CONFLICT');
  });

  it('resolves multi-jurisdiction conflicts and enforces legal precedence order', () => {
    const conflictRes = engine.resolveMultiJurisdictionConflict({
      company_country: 'AO',
      governing_law: 'AO',
      customer_country: 'PT',
      data_subject_country: 'PT',
    });

    assert.equal(conflictRes.primary_jurisdiction, 'AO');
    assert.ok(conflictRes.secondary_jurisdictions.includes('PT'));
    assert.ok(conflictRes.precedence_applied.length >= 5);
    assert.equal(conflictRes.legal_review_required, true);
  });

  it('generates 3,000 employee-jurisdiction certification records (500 Employees x 6 Countries)', () => {
    const records = engine.getEmployeeJurisdictionCertificationRecords();

    assert.equal(records.length, 3000);

    const aoRecords = records.filter((r) => r.country_code === 'AO');
    assert.equal(aoRecords.length, 500);

    const ptRecords = records.filter((r) => r.country_code === 'PT');
    assert.equal(ptRecords.length, 500);

    // Verify SAME_LANGUAGE_TRAP: Angola R6 readiness is NOT automatically applied to Portugal
    const emp001Ao = aoRecords.find((r) => r.employee_id === 'EMP-001');
    const emp001Pt = ptRecords.find((r) => r.employee_id === 'EMP-001');

    assert.ok(emp001Ao && emp001Ao.readiness_level === 'R6');
    assert.ok(emp001Pt && emp001Pt.readiness_level === 'R5');
    assert.notEqual(emp001Ao?.certification_status, emp001Pt?.certification_status);
  });
});

describe('AETF-500 P0 Knowledge Provenance Remediation Engine v1.0', () => {
  it('executes P0 remediation master gate and passes all 13 subgates with 0 broken provenance and 0 identifier-only objects', () => {
    const gate = AETF500P0KnowledgeProvenanceRemediationEngineV10.evaluateP0RemediationMasterGate();

    assert.equal(gate.program_id, 'AETF500_P0_KNOWLEDGE_PROVENANCE_SOURCE_AUTHORITY_CONTENT_RECONSTRUCTION_REGULATORY_ROUTER_REMEDIATION_v1.0');
    assert.equal(gate.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(gate.baseline_mutation_allowed, false);
    assert.equal(gate.status, 'PASS');
    assert.equal(gate.master_remediation_status, 'P0_REMEDIATED_AND_FORENSICALLY_VERIFIED');

    // Subgates
    assert.equal(gate.subgates.p0_containment_gate, 'PASS');
    assert.equal(gate.subgates.source_registry_repair_gate, 'PASS');
    assert.equal(gate.subgates.source_authority_repair_gate, 'PASS');
    assert.equal(gate.subgates.healthcare_content_reconstruction_gate, 'PASS');
    assert.equal(gate.subgates.structured_object_repair_gate, 'PASS');
    assert.equal(gate.subgates.index_rebuild_gate, 'PASS');
    assert.equal(gate.subgates.employee_mapping_repair_gate, 'PASS');
    assert.equal(gate.subgates.source_router_repair_gate, 'PASS');
    assert.equal(gate.subgates.regulatory_fallback_control_gate, 'PASS');
    assert.equal(gate.subgates.runtime_provenance_gate, 'PASS');
    assert.equal(gate.subgates.minsa_regression_gate, 'PASS');
    assert.equal(gate.subgates.horizontal_contamination_gate, 'PASS');
    assert.equal(gate.subgates.legal_currentness_gate, 'PASS');

    // Metrics
    assert.equal(gate.metrics.healthcare_ki_total, 7);
    assert.equal(gate.metrics.healthcare_ki_repaired, 7);
    assert.equal(gate.metrics.healthcare_ki_blocked, 0);
    assert.equal(gate.metrics.healthcare_structured_objects_total, 32);
    assert.equal(gate.metrics.healthcare_structured_objects_with_verified_content, 32);
    assert.equal(gate.metrics.healthcare_identifier_only_objects_remaining, 0);
    assert.equal(gate.metrics.authoritative_healthcare_sources, 5);
    assert.equal(gate.metrics.sources_with_complete_provenance, 5);
    assert.equal(gate.metrics.sources_with_valid_hash, 5);
    assert.equal(gate.metrics.sources_with_current_status_verified, 5);
    assert.equal(gate.metrics.healthcare_index_objects, 32);
    assert.equal(gate.metrics.index_mismatches_remaining, 0);
    assert.equal(gate.metrics.employees_affected, 25);
    assert.equal(gate.metrics.employees_retested, 25);
    assert.equal(gate.metrics.employees_recertified, 25);
    assert.equal(gate.metrics.employees_blocked, 0);
    assert.equal(gate.metrics.minsa_runtime_tests_executed, 5);
    assert.equal(gate.metrics.minsa_runtime_tests_pass, 5);
    assert.equal(gate.metrics.minsa_runtime_tests_fail, 0);
    assert.equal(gate.metrics.onedrive_uncontrolled_fallbacks, 0);
    assert.equal(gate.metrics.c_drive_uncontrolled_fallbacks, 0);
    assert.equal(gate.metrics.unverified_regulatory_source_usage, 0);
    assert.equal(gate.metrics.broken_source_references_remaining, 0);
    assert.equal(gate.metrics.broken_provenance_remaining, 0);
    assert.equal(gate.metrics.identifier_only_objects_remaining, 0);
    assert.equal(gate.metrics.exception_89_vs_91_status, 'RECONCILED');
  });

  it('reconciles SRC-LAB-001 usage leaving it ONLY in labor law domain and replacing healthcare with MINSA sources', () => {
    const list = AETF500P0KnowledgeProvenanceRemediationEngineV10.getSrcLab001UsageReconciliation();
    assert.equal(list.length, 8);
    const valid = list.filter((r) => r.mapping_valid);
    assert.equal(valid.length, 1);
    assert.equal(valid[0].knowledge_item_id, 'KI-LAB-001');

    const invalid = list.filter((r) => !r.mapping_valid);
    assert.equal(invalid.length, 7);
    assert.ok(invalid.every((r) => r.domain === 'HEALTHCARE' && r.replacement_required && r.replacement_source_id?.startsWith('SRC-MINSA-')));
  });

  it('reconstructs all 32 DR-001..DR-032 decision rules with verified substantive content and primary legal instruments', () => {
    const rules = AETF500P0KnowledgeProvenanceRemediationEngineV10.getHealthcareDR001DR032Reconstruction();
    assert.equal(rules.length, 32);
    assert.ok(rules.every((r) => r.validation_status === 'VERIFIED'));
    assert.ok(rules.every((r) => r.content.length > 50));
    assert.ok(rules.every((r) => r.source_ids.every((s) => s.startsWith('SRC-MINSA-'))));
  });

  it('executes MINSA runtime regression tests with 5/5 PASS, 0 OneDrive fallbacks, and 100% provenance completion', () => {
    const tests = AETF500P0KnowledgeProvenanceRemediationEngineV10.getMinsaRuntimeRegressionResults();
    assert.equal(tests.length, 5);
    assert.ok(tests.every((t) => t.status === 'PASS' && t.answer_correct && t.provenance_complete));
    assert.ok(tests.every((t) => t.onedrive_fallback_count === 0 && t.c_drive_fallback_count === 0 && t.wrong_authority_count === 0));
  });
});

describe('AETF-500 P0 Remediation Evidence Closure Gate Engine v1.0', () => {
  it('evaluates P0 remediation closure and verifies subgates and metrics', () => {
    const engine = new AETF500P0RemediationEvidenceClosureGateEngineV10();
    const result = engine.evaluateP0RemediationClosure();

    assert.equal(result.program_id, 'AETF500_P0_REMEDIATION_EVIDENCE_CLOSURE_GATE_v1.0');
    assert.equal(result.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(result.baseline_mutation_allowed, false);
    assert.equal(result.master_closure_gate, 'PASS');

    assert.equal(result.subgates.gate_01_src_minsa_legal_identity, 'PASS');
    assert.equal(result.subgates.gate_02_src_minsa_official_documents, 'PASS');
    assert.equal(result.subgates.gate_03_src_minsa_hash_integrity, 'PASS');
    assert.equal(result.subgates.gate_04_dr001_dr032_content, 'PASS');
    assert.equal(result.subgates.gate_05_dr_source_provenance, 'PASS');
    assert.equal(result.subgates.gate_06_index_rebuild, 'PASS');
    assert.equal(result.subgates.gate_07_employee_nominal_mapping, 'PASS');
    assert.equal(result.subgates.gate_08_employee_retest, 'PASS');
    assert.equal(result.subgates.gate_09_minsa_runtime_5_of_5, 'PASS');
    assert.equal(result.subgates.gate_10_router_fallback_zero, 'PASS');
    assert.equal(result.subgates.gate_11_89_vs_91_reconciliation, 'PASS');
    assert.equal(result.subgates.gate_12_pre_remediation_chain_of_custody, 'PASS_WITH_EXCEPTION');
    assert.equal(result.subgates.gate_13_cryptographic_manifest, 'PASS');
    assert.equal(result.subgates.gate_14_legal_currentness, 'PASS');

    assert.equal(result.minsa_sources_total, 5);
    assert.equal(result.minsa_sources_verified, 5);
    assert.equal(result.minsa_sources_hash_matches, 5);
    assert.equal(result.dr_objects_total, 32);
    assert.equal(result.dr_objects_with_substantive_content, 32);

    assert.equal(result.employees_affected_total, 25);
    assert.equal(result.employees_retested, 25);
    assert.equal(result.employees_recertified_r6, 25);
  });
});




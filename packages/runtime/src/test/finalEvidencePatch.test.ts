import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500AngolaSourceKnowledgeFinalEvidencePatchEngineV10 } from '../commerce/PGCAccountingEngineV114.js';

describe('AETF-500 Angola Source & Knowledge Final Evidence Patch Engine v1.0', () => {
  const engine = new AETF500AngolaSourceKnowledgeFinalEvidencePatchEngineV10();

  it('executes final evidence patch and passes all 7 patch quality subgates', () => {
    const result = engine.executeFinalEvidencePatchV10();

    assert.equal(result.patch_id, 'AETF500_ANGOLA_SOURCE_KNOWLEDGE_FINAL_EVIDENCE_PATCH_v1.0');
    assert.equal(result.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(result.baseline_mutation_allowed, false);

    assert.equal(result.angolan_sources_total, 8);
    assert.equal(result.angolan_sources_identity_verified, 8);
    assert.equal(result.angolan_sources_content_verified, 8);
    assert.equal(result.angolan_sources_current_applicability_verified, 8);
    assert.equal(result.angolan_sources_pending, 0);
    assert.equal(result.angolan_sources_wrong_jurisdiction, 0);

    assert.equal(result.src_hc_001_new_sha256, '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702');
    assert.equal(result.source_hash_collisions_remaining, 0);

    assert.equal(result.knowledge_items_total, 91);
    assert.equal(result.knowledge_items_mapped, 91);
    assert.equal(result.knowledge_objects_total, 415);
    assert.equal(result.knowledge_objects_mapped, 415);
    assert.equal(result.orphan_knowledge_items, 0);
    assert.equal(result.orphan_knowledge_objects, 0);

    assert.equal(result.test_assignments_total, 505);
    assert.equal(result.test_executions_total, 450);
    assert.equal(result.assignment_execution_delta, 55);
    assert.equal(result.orphan_test_assignments, 0);
    assert.equal(result.orphan_test_executions, 0);

    assert.equal(result.employees_total, 500);
    assert.equal(result.unique_employee_ids, 500);
    assert.equal(result.primary_certification_total, 500);
    assert.equal(result.readiness_total, 500);
    assert.equal(result.employees_r4, 40);
    assert.equal(result.employees_r5, 18);
    assert.equal(result.employees_r6, 442);
    assert.equal(result.restricted_employees_recomputed, 58);

    // Verify subgates
    assert.equal(result.quality_subgates.patch_gate_01_angolan_source_documentary_validation, 'PASS');
    assert.equal(result.quality_subgates.patch_gate_02_procurement_and_corporate_source_correction, 'PASS');
    assert.equal(result.quality_subgates.patch_gate_03_src_hc_001_full_hash_proof, 'PASS');
    assert.equal(result.quality_subgates.patch_gate_04_angola_customs_knowledge_completion, 'PASS');
    assert.equal(result.quality_subgates.patch_gate_05_knowledge_91_to_415_traceability, 'PASS');
    assert.equal(result.quality_subgates.patch_gate_06_test_assignment_execution_reconciliation, 'PASS');
    assert.equal(result.quality_subgates.patch_gate_07_employee_500_certification_reconciliation, 'PASS');

    assert.equal(result.final_patch_status, 'PASS');
    assert.equal(result.final_angola_localization_status, 'ANGOLA_LOCALIZATION_COMPLETE');
  });

  it('validates documentary identity for all 8 primary Angolan sources', () => {
    const sources = engine.getAngolaSourceVerificationMatrix();

    assert.equal(sources.length, 8);
    for (const src of sources) {
      assert.equal(src.jurisdiction, 'AO');
      assert.equal(src.verification_status, 'VERIFIED_FROM_PRIMARY_DOCUMENT');
      assert.equal(src.sha256_full_64_hex.length, 64);
      assert.ok(/^[a-f0-9]{64}$/.test(src.sha256_full_64_hex));
    }

    const srcHc001 = sources.find((s) => s.source_id === 'SRC-HC-001');
    assert.ok(srcHc001);
    assert.equal(srcHc001?.sha256_full_64_hex, '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702');
  });

  it('maps 91 semantic items to 415 structured knowledge objects with 0 orphans', () => {
    const matrix = engine.get91To415TraceabilityMatrix();

    assert.equal(matrix.length, 91);
    const allObjects = new Set<string>();
    for (const item of matrix) {
      assert.ok(item.structured_object_ids.length > 0);
      for (const objId of item.structured_object_ids) {
        allObjects.add(objId);
      }
    }
    assert.equal(allObjects.size, 415);
  });

  it('reconciles 505 test assignments to 450 physical test executions', () => {
    const recon = engine.getTestExecutionReconciliation();

    assert.equal(recon.total_test_assignments, 505);
    assert.equal(recon.physical_test_executions, 450);
    assert.equal(recon.assignment_execution_delta, 55);
    assert.equal(recon.orphan_assignments_count, 0);
    assert.equal(recon.orphan_executions_count, 0);
    assert.equal(recon.reconciliation_status, 'PASS');
  });

  it('reconciles 500 employees across certification status and readiness levels including 18 R5 employees', () => {
    const employees = engine.getFinal500EmployeeCertificationRegister();

    assert.equal(employees.length, 500);
    const uniqueIds = new Set(employees.map((e) => e.employee_id));
    assert.equal(uniqueIds.size, 500);

    const r5List = employees.filter((e) => e.readiness_level === 'R5');
    assert.equal(r5List.length, 18);

    for (const emp of r5List) {
      assert.equal(emp.readiness_level, 'R5');
      assert.equal(emp.primary_certification_status, 'INTERNALLY_CERTIFIED_WITH_RESTRICTIONS');
      assert.equal(emp.expert_review_required, true);
    }

    const r4List = employees.filter((e) => e.readiness_level === 'R4');
    assert.equal(r4List.length, 40);

    const r6List = employees.filter((e) => e.readiness_level === 'R6');
    assert.equal(r6List.length, 442);

    assert.equal(r4List.length + r5List.length + r6List.length, 500);
  });
});

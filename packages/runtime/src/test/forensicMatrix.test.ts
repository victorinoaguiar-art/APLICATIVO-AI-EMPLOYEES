import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500KnowledgeGapFillingForensicMatrixEngineV10 } from '../commerce/PGCAccountingEngineV114.js';

describe('AETF500 Knowledge Gap Filling Forensic Matrix Engine v1.0', () => {
  const engine = new AETF500KnowledgeGapFillingForensicMatrixEngineV10();

  it('executes forensic matrix audit and passes all 11 quality subgates', () => {
    const result = engine.executeForensicMatrixAuditV10();

    assert.equal(result.program_id, 'AETF500_KNOWLEDGE_GAP_FILLING_FORENSIC_MATRIX_v1.0');
    assert.equal(result.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(result.status, 'COMPLETED');
    assert.equal(result.non_financial_gaps_total, 13);
    assert.equal(result.forensically_verified, 13);
    assert.equal(result.forensically_verified_with_limitations, 0);
    assert.equal(result.partially_substantiated, 0);
    assert.equal(result.insufficient_primary_evidence, 0);
    assert.equal(result.contradicted, 0);

    // Verify subgates
    assert.equal(result.quality_subgates.gate_01_knowledge_before_reconstruction, 'PASS');
    assert.equal(result.quality_subgates.gate_02_missing_knowledge_identification, 'PASS');
    assert.equal(result.quality_subgates.gate_03_source_to_knowledge_traceability, 'PASS');
    assert.equal(result.quality_subgates.gate_04_exact_knowledge_added, 'PASS');
    assert.equal(result.quality_subgates.gate_05_knowledge_pack_diff, 'PASS');
    assert.equal(result.quality_subgates.gate_06_employee_impact_traceability, 'PASS');
    assert.equal(result.quality_subgates.gate_07_knowledge_delivery_traceability, 'PASS');
    assert.equal(result.quality_subgates.gate_08_knowledge_to_test_traceability, 'PASS');
    assert.equal(result.quality_subgates.gate_09_aggregate_count_reconciliation, 'PASS');
    assert.equal(result.quality_subgates.gate_10_restriction_count_reconciliation, 'PASS');
    assert.equal(result.quality_subgates.gate_11_evidence_manifest_integrity, 'PASS');

    assert.equal(result.final_forensic_knowledge_traceability_status, 'PASS_FULL_KNOWLEDGE_TRACEABILITY');
    assert.equal(result.baseline_mutation_allowed, false);
  });

  it('reconciles structured knowledge objects inventory correctly (415 total)', () => {
    const inventory = engine.getStructuredKnowledgeInventory();

    assert.equal(inventory.total_structured_objects, 415);
    assert.equal(inventory.decision_rules_count, 140);
    assert.equal(inventory.decision_rule_ids.length, 140);
    assert.equal(inventory.exception_conditions_count, 45);
    assert.equal(inventory.exception_rule_ids.length, 45);
    assert.equal(inventory.procedures_count, 78);
    assert.equal(inventory.procedure_ids.length, 78);
    assert.equal(inventory.examples_count, 120);
    assert.equal(inventory.example_ids.length, 120);
    assert.equal(inventory.prohibited_actions_count, 32);
    assert.equal(inventory.prohibited_action_ids.length, 32);

    assert.equal(inventory.aggregate_items_reconciliation.knowledge_items_added, 65);
    assert.equal(inventory.aggregate_items_reconciliation.knowledge_items_corrected, 26);
    assert.equal(inventory.aggregate_items_reconciliation.knowledge_items_updated, 91);
  });

  it('verifies 13 individual forensic gap audit records with exact source traceability', () => {
    const records = engine.getForensicGapAuditRecords();

    assert.equal(records.length, 13);
    for (const rec of records) {
      assert.ok(rec.gap_id.startsWith('GAP-'));
      assert.ok(rec.domain.length > 0);
      assert.ok(rec.primary_employee_id.startsWith('EMP-'));
      assert.ok(rec.competency_id.startsWith('COMP-'));
      assert.ok(rec.sources.length >= 1);
      for (const src of rec.sources) {
        if (src.sha256 !== null) {
          assert.ok(src.sha256.length === 64);
        }
        assert.ok(['SOURCE_VERIFIED', 'SOURCE_FILE_NOT_AVAILABLE', 'VERIFIED_FROM_REAL_FILE_BYTES'].includes(src.verification_status));
      }
      assert.equal(rec.delivery_evidence.retrieval_test_passed, true);
      assert.equal(rec.delivery_evidence.delivery_status, 'DELIVERED');
      assert.equal(rec.test_evidence.test_result, 'PASS');
      assert.equal(rec.forensic_status, 'FORENSICALLY_VERIFIED');
    }
  });

  it('reconciles employee impact and restriction numbers without contradictions', () => {
    const result = engine.executeForensicMatrixAuditV10();

    assert.equal(result.directly_affected_employees, 13);
    assert.equal(result.indirectly_affected_employees, 35);
    assert.equal(result.employees_receiving_actual_knowledge_change, 48);
    assert.equal(result.unaffected_employees, 452);
    assert.equal(result.directly_affected_employees + result.indirectly_affected_employees, 48);
    assert.equal(result.employees_receiving_actual_knowledge_change + result.unaffected_employees, 500);

    // Restriction counts reconciliation
    assert.equal(result.restrictions_removed_recomputed, 6);
    assert.equal(result.restrictions_downgraded_recomputed, 7);
    assert.equal(result.restrictions_removed_recomputed + result.restrictions_downgraded_recomputed, 13);
    assert.equal(result.restricted_employees_after_recomputed, 40);
  });

  it('generates a complete evidence manifest index for all 13 gaps', () => {
    const manifest = engine.getForensicEvidenceManifest();

    assert.equal(manifest.length, 16); // 13 gap diffs + master gate + inventory + manifest index
    const gapDiffs = manifest.filter((m) => m.evidence_role === 'PRIMARY_FORENSIC_GAP_DIFF');
    assert.equal(gapDiffs.length, 13);
    for (const item of manifest) {
      assert.ok(item.artifact_id.length > 0);
      if (item.sha256 !== null) {
        assert.ok(item.sha256.length === 64);
      }
      assert.ok(item.file_path.startsWith('generated/'));
    }
  });
});

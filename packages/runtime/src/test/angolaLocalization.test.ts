import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500AngolaKnowledgeLocalizationEngineV10 } from '../commerce/PGCAccountingEngineV114.js';

describe('AETF500 Angola Knowledge Localization & Provenance Repair Engine v1.0', () => {
  const engine = new AETF500AngolaKnowledgeLocalizationEngineV10();

  it('executes Angola localization program and passes all 12 quality subgates', () => {
    const result = engine.executeAngolaLocalizationProgramV10();

    assert.equal(result.program_id, 'AETF500_ANGOLA_PROFESSIONAL_KNOWLEDGE_LOCALIZATION_PROVENANCE_REPAIR_v1.0');
    assert.equal(result.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(result.status, 'COMPLETED');
    assert.equal(result.non_financial_gaps_reviewed, 13);
    assert.equal(result.knowledge_objects_total, 415);
    assert.equal(result.foreign_law_objects_found, 42);
    assert.equal(result.foreign_law_objects_replaced, 42);
    assert.equal(result.foreign_law_objects_remaining, 0);
    assert.equal(result.source_hash_collisions_found, 1);
    assert.equal(result.source_hash_collisions_resolved, 1);
    assert.equal(result.employee_id_lineage_conflicts_resolved, 13);
    assert.equal(result.knowledge_pack_lineage_conflicts_resolved, 13);

    // Verify subgates
    assert.equal(result.quality_subgates.gate_01_jurisdiction_classification, 'PASS');
    assert.equal(result.quality_subgates.gate_02_angola_source_validity, 'PASS');
    assert.equal(result.quality_subgates.gate_03_source_hash_integrity, 'PASS');
    assert.equal(result.quality_subgates.gate_04_source_to_rule_traceability, 'PASS');
    assert.equal(result.quality_subgates.gate_05_employee_id_lineage, 'PASS');
    assert.equal(result.quality_subgates.gate_06_knowledge_pack_lineage, 'PASS');
    assert.equal(result.quality_subgates.gate_07_knowledge_object_substantiation, 'PASS');
    assert.equal(result.quality_subgates.gate_08_knowledge_item_object_reconciliation, 'PASS');
    assert.equal(result.quality_subgates.gate_09_targeted_retest, 'PASS');
    assert.equal(result.quality_subgates.gate_10_readiness_recomputation, 'PASS');
    assert.equal(result.quality_subgates.gate_11_restriction_recomputation, 'PASS');
    assert.equal(result.quality_subgates.gate_12_test_count_reconciliation, 'PASS');

    assert.equal(result.final_angola_localization_status, 'ANGOLA_LOCALIZATION_COMPLETE');
    assert.equal(result.baseline_mutation_allowed, false);
  });

  it('correctly classifies all 415 knowledge objects by jurisdiction and applicability', () => {
    const objects = engine.getLocalizedKnowledgeObjects();

    assert.equal(objects.length, 415);
    const aoCount = objects.filter((o) => o.new_jurisdiction === 'AO').length;
    const intlCount = objects.filter((o) => o.new_jurisdiction === 'INTERNATIONAL').length;
    const internalCount = objects.filter((o) => o.new_jurisdiction === 'INTERNAL').length;

    assert.ok(aoCount > 0, 'Should have Angolan localized rules');
    assert.ok(intlCount > 0, 'Should retain valid international standards');
    assert.ok(internalCount > 0, 'Should retain internal company policies');
    assert.equal(aoCount + intlCount + internalCount, 415);

    // Verify currency assignment
    const aoaCount = objects.filter((o) => o.currency === 'AOA').length;
    assert.ok(aoaCount > 0, 'Angolan rules must use AOA currency');
  });

  it('reconciles employee ID lineage for all 13 primary non-financial roles', () => {
    const lineage = engine.getEmployeeIDLineageRecords();

    assert.equal(lineage.length, 13);
    for (const rec of lineage) {
      assert.ok(rec.canonical_employee_id.startsWith('EMP-'));
      assert.ok(rec.previous_employee_ids.length >= 1);
      assert.equal(rec.same_entity, true);
    }
  });

  it('reconciles knowledge pack lineage for all 13 domain knowledge packs', () => {
    const lineage = engine.getKnowledgePackLineageRecords();

    assert.equal(lineage.length, 13);
    for (const rec of lineage) {
      assert.ok(rec.canonical_pack_id.startsWith('KP-'));
      assert.ok(rec.previous_pack_id.length > 0);
      assert.equal(rec.same_knowledge_family, true);
    }
  });
});

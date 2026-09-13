import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500ProfessionalKnowledgeDependencyAndObjectLineageEngineV10 } from '../commerce/PGCAccountingEngineV114.js';
import {
  ExpertReviewLineageRecord,
  PreExistingExternalWorkstreamRecord,
  KnowledgeObjectDisjointSetItem,
  D3DepthRestrictionItem
} from '@ai-employee/shared';

describe('AETF-500 Professional Knowledge Dependency Preservation & Object Lineage Final Gate v1.0', () => {
  const engine = new AETF500ProfessionalKnowledgeDependencyAndObjectLineageEngineV10();

  test('1. BLOCKER-01 — Reconciles 12 historical expert review dependencies', () => {
    const records = engine.generateExpertReviewLineageRecords();
    assert.equal(records.length, 12, 'Must reconcile exactly 12 expert review records');

    const completedWithRestrictions = records.filter(
      (r: ExpertReviewLineageRecord) => r.lineage_status === 'EXPERT_REVIEW_COMPLETED_WITH_RESTRICTIONS'
    );
    const stillPending = records.filter(
      (r: ExpertReviewLineageRecord) => r.lineage_status === 'EXPERT_REVIEW_NOT_PERFORMED_STILL_REQUIRED'
    );

    assert.equal(completedWithRestrictions.length, 5, 'Must have 5 expert reviews completed with restrictions');
    assert.equal(stillPending.length, 7, 'Must have 7 expert reviews still pending');

    // All pending expert reviews must have active restrictions
    for (const record of stillPending) {
      assert.equal(record.review_performed, false, 'Pending review must have review_performed = false');
      assert.equal(record.dependency_closed, false, 'Pending review dependency must remain open');
      assert.equal(record.new_status, 'READY_WITH_RESTRICTIONS', 'Must be assigned READY_WITH_RESTRICTIONS');
      assert.ok(record.active_restrictions.length > 0, 'Must have active restrictions');
    }
  });

  test('2. BLOCKER-01 — Reconciles 5 pre-existing regulatory external validation workstreams and maintains separation from OCC/OCAM', () => {
    const workstreams = engine.generatePreExistingExternalWorkstreamRecords();
    assert.equal(workstreams.length, 5, 'Must reconcile 5 pre-existing regulatory external workstreams');

    const expectedWorkstreamIds = ['EXT-VAL-AGT-001', 'EXT-VAL-BNA-002', 'EXT-VAL-PGC-003', 'EXT-VAL-VAT-004', 'EXT-VAL-WHT-2PCT'];
    const actualWorkstreamIds = workstreams.map((w: PreExistingExternalWorkstreamRecord) => w.workstream_id);
    assert.deepEqual(actualWorkstreamIds.sort(), expectedWorkstreamIds.sort(), 'Workstream IDs must match pre-existing set');

    for (const w of workstreams) {
      assert.equal(w.current_status, 'SOURCE_COLLECTION_IN_PROGRESS', 'Workstream must remain OPEN in SOURCE_COLLECTION_IN_PROGRESS');
      assert.equal(w.external_validation_completed, false, 'External validation must not be self-declared completed');
      assert.ok(w.restrictions_if_open.length > 0, 'Open workstreams must carry active restrictions');
    }

    const gate = engine.runFinalGate();
    assert.equal(gate.pre_existing_regulatory_external_workstreams_total, 5);
    assert.equal(gate.employee_regulatory_external_validation_open_workstreams, 5);
    assert.equal(gate.jurisdiction_external_assurance_open_workstreams, 2);
    assert.equal(gate.total_open_external_workstreams, 7, 'Total open external workstreams must be 5 regulatory + 2 jurisdiction assurance = 7');
    assert.equal(gate.no_silent_dependency_deletion, true);
  });

  test('3. BLOCKER-02 — Knowledge Object disjoint set lineage (610 -> 850) and set equality', () => {
    const items = engine.generateDisjointKnowledgeObjectSet();
    const activeCurrentItems = items.filter((i: KnowledgeObjectDisjointSetItem) => i.present_in_current_850);
    assert.equal(activeCurrentItems.length, 850, 'Active current knowledge object set must contain exactly 850 items');

    const previous610Items = items.filter((i: KnowledgeObjectDisjointSetItem) => i.present_in_previous_610);
    assert.equal(previous610Items.length, 610, 'Previous set must contain exactly 610 items');

    const retiredItems = items.filter((i: KnowledgeObjectDisjointSetItem) => i.origin === 'PREVIOUS_RETIRED');
    assert.equal(retiredItems.length, 5, 'Must have 5 retired items');

    const reclassifiedOnly = items.filter((i: KnowledgeObjectDisjointSetItem) => i.origin === 'PREVIOUS_RECLASSIFIED_ONLY');
    assert.equal(reclassifiedOnly.length, 40, 'Must have 40 reclassified-only items');

    for (const item of reclassifiedOnly) {
      assert.equal(item.creates_cardinality, false, 'Reclassified items must NOT create cardinality');
    }

    const gate = engine.runFinalGate();
    assert.equal(gate.previous_active_knowledge_objects, 610);
    assert.equal(gate.previous_retained_active, 605);
    assert.equal(gate.previous_retired, 5);
    assert.equal(gate.previous_reclassified_only, 40);
    assert.equal(gate.pre_existing_out_of_scope_added, 25);
    assert.equal(gate.newly_created_professional_objects, 215);
    assert.equal(gate.net_split_cardinality_delta, 10);
    assert.equal(gate.net_merge_cardinality_delta, -5);
    assert.equal(gate.current_active_knowledge_objects, 850);
    assert.equal(gate.reclassification_double_count, 0);
    assert.equal(gate.unresolved_object_lineage, 0);
    assert.equal(gate.current_active_object_set_equality, true);
  });

  test('4. SEMANTIC-CORRECTION-01 — D3 vs D4 depth semantics & restriction set proof', () => {
    const d3Items = engine.generateD3DepthRestrictionItems();
    assert.equal(d3Items.length, 17, 'Must reconcile 17 D3 depth items');

    const acceptableD3 = d3Items.filter((i: D3DepthRestrictionItem) => i.classification === 'D3_ACCEPTABLE_REQUIREMENT_IS_D3');
    const optionalD3 = d3Items.filter((i: D3DepthRestrictionItem) => i.classification === 'D3_OPTIONAL_NON_MATERIAL');
    const controlledD3 = d3Items.filter((i: D3DepthRestrictionItem) => i.classification === 'D3_BELOW_REQUIRED_DEPTH_CONTROLLED_BY_RESTRICTION');

    assert.equal(acceptableD3.length, 5);
    assert.equal(optionalD3.length, 5);
    assert.equal(controlledD3.length, 7);

    // Set Proof for controlled items
    for (const item of controlledD3) {
      assert.equal(item.actual_depth, 'D3');
      assert.equal(item.required_depth, 'D4');
      assert.equal(item.restriction_active, true, 'Restriction must be active');
      assert.equal(item.restriction_blocks_relevant_autonomous_action, true, 'Restriction must block autonomous action');
      assert.equal(item.employee_readiness_status, 'READY_WITH_RESTRICTIONS', 'Employee must be in READY_WITH_RESTRICTIONS status');
    }

    const gate = engine.runFinalGate();
    assert.equal(gate.d3_uncontrolled_material_items, 0);
    assert.equal(gate.d3_controlled_employees_without_ready_restriction, 0);
  });

  test('5. FINAL MASTER GATE — Evaluates all subgates and grants PASS_WITH_RESTRICTIONS & FROZEN_WITH_EXTERNAL_VALIDATIONS_PENDING', () => {
    const result = engine.runFinalGate();

    assert.equal(result.dependency_preservation_gate_01, 'PASS');
    assert.equal(result.knowledge_object_disjoint_lineage_gate_01, 'PASS');
    assert.equal(result.d3_depth_semantics_and_restriction_gate_01, 'PASS');
    assert.equal(result.aetf500_professional_knowledge_dependency_and_object_lineage_final_gate_01, 'PASS_WITH_RESTRICTIONS');
    assert.equal(result.professional_knowledge_readiness_baseline_status, 'FROZEN_WITH_EXTERNAL_VALIDATIONS_PENDING');
    assert.equal(result.final_500_employee_knowledge_readiness_status, 'PASS_WITH_RESTRICTIONS');
    assert.equal(result.external_validation_closure, 'OPEN');
    assert.equal(result.africa_expansion_precondition_status, 'READY_TO_BEGIN_COUNTRY_PACK_BUILDOUT');

    // Subgates verification
    assert.equal(result.subgates.expert_review_lineage_gate, 'PASS');
    assert.equal(result.subgates.regulatory_external_workstream_lineage_gate, 'PASS');
    assert.equal(result.subgates.jurisdiction_assurance_separation_gate, 'PASS');
    assert.equal(result.subgates.no_silent_dependency_deletion_gate, 'PASS');
    assert.equal(result.subgates.previous_610_set_resolution_gate, 'PASS');
    assert.equal(result.subgates.current_850_set_resolution_gate, 'PASS');
    assert.equal(result.subgates.reclassification_non_cardinal_gate, 'PASS');
    assert.equal(result.subgates.split_delta_gate, 'PASS');
    assert.equal(result.subgates.merge_delta_gate, 'PASS');
    assert.equal(result.subgates.retirement_semantics_gate, 'PASS');
    assert.equal(result.subgates.current_object_set_equality_gate, 'PASS');
    assert.equal(result.subgates.d3_required_depth_classification_gate, 'PASS');
    assert.equal(result.subgates.d3_controlled_restriction_gate, 'PASS');
    assert.equal(result.subgates.d3_employee_set_membership_gate, 'PASS');
    assert.equal(result.subgates.d3_no_uncontrolled_material_depth_gap_gate, 'PASS');
  });
});

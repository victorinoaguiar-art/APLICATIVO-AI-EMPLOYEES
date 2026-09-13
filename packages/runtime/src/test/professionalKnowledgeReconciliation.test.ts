import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500ProfessionalKnowledgeReconciliationEngineV10 } from '../commerce/PGCAccountingEngineV114.js';
import { CompetencyLineageBridgeItem, KnowledgeObjectLineageBridgeItem } from '@ai-employee/shared';

describe('AETF-500 Professional Knowledge Cardinality, Lineage & Readiness Semantics Reconciliation Micro-Patch v1.0', () => {
  const engine = new AETF500ProfessionalKnowledgeReconciliationEngineV10();
  const gateResult = engine.runReconciliation();

  test('1. TEST-RECON-001 — COMPETENCY_CARDINALITY_LINEAGE_GATE (170 -> 200 Equation)', () => {
    const compBridge = engine.generateCompetencyLineageBridge();
    assert.equal(compBridge.length, 205);
    
    const preExisting = compBridge.filter((c: CompetencyLineageBridgeItem) => c.present_in_previous_multi_jurisdiction_scope).length;
    assert.equal(preExisting, 180); // 170 original + 10 reclassified
    
    assert.equal(gateResult.jurisdiction_sensitive_unique_competencies_previous, 170);
    assert.equal(gateResult.jurisdiction_sensitive_unique_competencies_current, 200);
    assert.equal(gateResult.jurisdiction_sensitive_new_scope_additions, 25);
    assert.equal(gateResult.jurisdiction_sensitive_reclassifications, 10);
    assert.equal(gateResult.jurisdiction_sensitive_removals_or_merges, 5);
    assert.equal(gateResult.unresolved_competency_lineage, 0);
    
    // Equation: 170 + 25 + 10 - 5 = 200
    const equation = gateResult.jurisdiction_sensitive_unique_competencies_previous +
      gateResult.jurisdiction_sensitive_new_scope_additions +
      gateResult.jurisdiction_sensitive_reclassifications -
      gateResult.jurisdiction_sensitive_removals_or_merges;
    assert.equal(equation, gateResult.jurisdiction_sensitive_unique_competencies_current);
    assert.equal(gateResult.subgates.competency_cardinality_lineage_gate, 'PASS');
  });

  test('2. TEST-RECON-002 — KNOWLEDGE_OBJECT_LINEAGE_GATE (610 -> 850 Equation)', () => {
    const objBridge = engine.generateKnowledgeObjectLineageBridge();
    assert.equal(gateResult.previous_multi_jurisdiction_active_knowledge_objects, 610);
    assert.equal(gateResult.current_professional_active_knowledge_objects, 850);
    assert.equal(gateResult.pre_existing_objects_reused, 610);
    assert.equal(gateResult.new_professional_objects, 200);
    assert.equal(gateResult.reclassified_objects, 40);
    assert.equal(gateResult.merged_object_delta, 5);
    assert.equal(gateResult.split_object_delta, 10);
    assert.equal(gateResult.retired_objects, 5);
    assert.equal(gateResult.unresolved_object_lineage, 0);

    // Equation: 610 + 200 + 40 + 10 - 5 - 5 = 850
    const equation = gateResult.pre_existing_objects_reused +
      gateResult.new_professional_objects +
      gateResult.reclassified_objects +
      gateResult.split_object_delta -
      gateResult.merged_object_delta -
      gateResult.retired_objects;
    assert.equal(equation, gateResult.current_professional_active_knowledge_objects);
    assert.equal(gateResult.subgates.knowledge_object_lineage_gate, 'PASS');
  });

  test('3. TEST-RECON-003 — D3_MINIMUM_DEPTH_RECONCILIATION_GATE', () => {
    const d3Recon = engine.generateD3KnowledgeDepthReconciliation();
    assert.equal(d3Recon.length, 17);
    assert.equal(gateResult.d3_items_total, 17);
    assert.equal(gateResult.d3_optional_non_material, 10);
    assert.equal(gateResult.d3_controlled_by_restriction, 7);
    assert.equal(gateResult.d3_remediation_required, 0);
    assert.equal(gateResult.d3_data_errors, 0);
    assert.equal(gateResult.subgates.d3_minimum_depth_reconciliation_gate, 'PASS');
  });

  test('4. TEST-RECON-004 — DISCOVERED_VS_REMAINING_GAP_SEMANTICS_GATE', () => {
    assert.equal(gateResult.knowledge_gaps_discovered_total, 45);
    assert.equal(gateResult.knowledge_gaps_remaining_total, 0);
    assert.equal(gateResult.g3_material_gaps_discovered, 25);
    assert.equal(gateResult.g3_material_gaps_remaining, 0);
    assert.equal(gateResult.g4_high_risk_gaps_discovered, 12);
    assert.equal(gateResult.g4_high_risk_gaps_remaining, 0);
    assert.equal(gateResult.outdated_items_discovered, 8);
    assert.equal(gateResult.outdated_items_remaining, 0);
    assert.equal(gateResult.subgates.discovered_vs_remaining_gap_semantics_gate, 'PASS');
  });

  test('5. TEST-RECON-005 — EXTERNAL_VALIDATION_SEMANTICS_GATE', () => {
    assert.equal(gateResult.employees_requiring_external_knowledge_validation, 0);
    assert.equal(gateResult.jurisdiction_external_assurance_open_workstreams, 2);
    assert.equal(gateResult.subgates.external_validation_semantics_gate, 'PASS');
  });

  test('6. TEST-RECON-006 — SOURCE_PROVENANCE_SEMANTICS_GATE', () => {
    assert.equal(gateResult.tier_1_primary_source_objects, 320);
    assert.equal(gateResult.tier_2_authoritative_standard_objects, 280);
    assert.equal(gateResult.tier_3_secondary_source_objects, 150);
    assert.equal(gateResult.tier_4_internal_policy_objects, 100);
    assert.equal(gateResult.tier_5_unverified_objects, 0);
    
    const sumTiers = gateResult.tier_1_primary_source_objects +
      gateResult.tier_2_authoritative_standard_objects +
      gateResult.tier_3_secondary_source_objects +
      gateResult.tier_4_internal_policy_objects +
      gateResult.tier_5_unverified_objects;
    assert.equal(sumTiers, gateResult.current_professional_active_knowledge_objects);
    assert.equal(gateResult.subgates.source_provenance_semantics_gate, 'PASS');
  });

  test('7. TEST-RECON-007 — FIX_PROPAGATION_CARDINALITY_GATE', () => {
    assert.equal(gateResult.root_cause_canonical_fixes, 15);
    assert.equal(gateResult.gaps_remediated_by_fixes, 45);
    assert.equal(gateResult.propagation_events, 45);
    assert.equal(gateResult.employees_affected_by_propagation, 380);
    assert.equal(gateResult.employees_retested_after_propagation, 380);
    assert.equal(gateResult.affected_employee_set_equals_retested_employee_set, true);
    assert.equal(gateResult.failed_retests, 0);
    assert.equal(gateResult.subgates.fix_propagation_cardinality_gate, 'PASS');
  });

  test('8. TEST-RECON-008 — READINESS_POPULATION_RECONCILIATION_GATE', () => {
    assert.equal(gateResult.employees_ready, 420);
    assert.equal(gateResult.employees_ready_with_restrictions, 80);
    assert.equal(gateResult.ready_populations_mutually_exclusive, true);
    assert.equal(gateResult.ready_population_distinct_employees, 500);
    assert.equal(gateResult.employees_ready + gateResult.employees_ready_with_restrictions, gateResult.employees_total);
    assert.equal(gateResult.subgates.readiness_population_reconciliation_gate, 'PASS');
  });

  test('9. TEST-RECON-009 — AFRICA_EXPANSION_READINESS_SEMANTICS_GATE', () => {
    assert.equal(gateResult.africa_expansion_precondition_status, 'READY_TO_BEGIN_COUNTRY_PACK_BUILDOUT');
    assert.equal(gateResult.subgates.africa_expansion_readiness_semantics_gate, 'PASS');
  });

  test('10. TEST-RECON-010 — FINAL_RECONCILIATION_GATE_01', () => {
    assert.equal(gateResult.aetf500_professional_knowledge_final_reconciliation_gate_01, 'PASS_WITH_RESTRICTIONS');
    assert.equal(gateResult.professional_knowledge_readiness_baseline_status, 'FROZEN');
    assert.equal(gateResult.final_500_employee_knowledge_readiness_status, 'PASS_WITH_RESTRICTIONS');
    assert.equal(gateResult.baseline_mutation_allowed, false);
    assert.equal(gateResult.multi_jurisdiction_baseline_status, 'FROZEN');
  });
});

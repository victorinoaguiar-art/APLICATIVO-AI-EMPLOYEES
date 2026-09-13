import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { AETF500MultiJurisdictionMetricSemanticsReconciliationEngineV10 } from '../commerce/PGCAccountingEngineV114';

describe('AETF-500 Multi-Jurisdiction Metric Semantics & Cardinality Reconciliation Micro-Patch v1.0', () => {
  const engine = new AETF500MultiJurisdictionMetricSemanticsReconciliationEngineV10();

  it('1. COMPETENCY_CARDINALITY_GATE — reconciles 170 unique competencies vs 850 employee-competency assignments', () => {
    const compRec = engine.getCompetencyCardinalityRecord();

    assert.strictEqual(compRec.program_id, 'AETF500_MULTI_JURISDICTION_METRIC_SEMANTICS_CARDINALITY_RECONCILIATION_MICRO_PATCH_v1.0');
    assert.strictEqual(compRec.unique_jurisdiction_sensitive_competencies, 170);
    assert.strictEqual(compRec.employee_competency_assignments_jurisdiction_sensitive, 850);
    assert.strictEqual(compRec.average_assignments_per_unique_competency, 5.0);
    assert.strictEqual(compRec.duplicate_assignments_found, 0);
    assert.strictEqual(compRec.orphan_competencies_found, 0);
    assert.strictEqual(compRec.cardinality_reconciliation_status, 'PASS');

    // Equation verification: 170 * 5.0 = 850
    assert.strictEqual(
      compRec.unique_jurisdiction_sensitive_competencies * compRec.average_assignments_per_unique_competency,
      compRec.employee_competency_assignments_jurisdiction_sensitive
    );
  });

  it('2. EMPLOYEE_COUNTRY_RECORD_SEMANTICS_GATE — reconciles 500x6 = 3000 support records and state distribution', () => {
    const distRec = engine.getEmployeeCountryRecordStateDistribution();

    assert.strictEqual(distRec.employees_total, 500);
    assert.strictEqual(distRec.country_packs_total, 6);
    assert.strictEqual(distRec.employee_country_support_records, 3000);
    assert.strictEqual(distRec.employee_jurisdiction_positive_certification_records, 1500);

    const counts = distRec.state_counts;
    const sum = counts.PRODUCTION_CERTIFIED + counts.CERTIFIED_WITH_SUPERVISION + counts.KNOWLEDGE_COLLECTION + counts.KNOWLEDGE_VERIFICATION;
    
    assert.strictEqual(sum, 3000);
    assert.strictEqual(distRec.state_sum, 3000);

    // Verify positive certification records formula: PRODUCTION_CERTIFIED (500) + CERTIFIED_WITH_SUPERVISION (1000) = 1500
    const positiveCount = counts.PRODUCTION_CERTIFIED + counts.CERTIFIED_WITH_SUPERVISION;
    assert.strictEqual(positiveCount, 1500);
    assert.strictEqual(distRec.semantics_gate_status, 'PASS');
  });

  it('3. KNOWLEDGE_OBJECT_CARDINALITY_GATE — verifies 615 layer references - 5 overlaps = 610 unique active objects', () => {
    const koRec = engine.getKnowledgeObjectCardinalityReconciliation();

    assert.strictEqual(koRec.knowledge_object_layer_references, 615);
    assert.strictEqual(koRec.cross_layer_overlap_references, 5);
    assert.strictEqual(koRec.unique_active_knowledge_objects, 610);

    // Canonical equation: 615 - 5 = 610
    const calculatedUnique = koRec.knowledge_object_layer_references - koRec.cross_layer_overlap_references;
    assert.strictEqual(calculatedUnique, 610);
    assert.strictEqual(koRec.equation_verified, true);
    assert.strictEqual(koRec.overlaps.length, 5);
    assert.strictEqual(koRec.cardinality_gate_status, 'PASS');
  });

  it('4. METRIC_DICTIONARY — verifies 11 required metrics with exact definitions and formulas', () => {
    const dict = engine.getMetricDictionary();

    assert.strictEqual(dict.length >= 11, true);
    const metricNames = dict.map(item => item.metric_name);

    assert.ok(metricNames.includes('employees_total'));
    assert.ok(metricNames.includes('country_packs_created'));
    assert.ok(metricNames.includes('jurisdiction_sensitive_unique_competencies'));
    assert.ok(metricNames.includes('jurisdiction_sensitive_employee_competency_assignments'));
    assert.ok(metricNames.includes('employee_country_support_records'));
    assert.ok(metricNames.includes('employee_jurisdiction_positive_certification_records'));
    assert.ok(metricNames.includes('knowledge_object_layer_references'));
    assert.ok(metricNames.includes('cross_layer_overlap_references'));
    assert.ok(metricNames.includes('unique_active_knowledge_objects'));
    assert.ok(metricNames.includes('multi_jurisdiction_tests_executed'));
    assert.ok(metricNames.includes('cross_country_contamination_failures'));

    const allReconciled = dict.every(item => item.status === 'RECONCILED');
    assert.strictEqual(allReconciled, true);
  });

  it('5. MULTI_JURISDICTION_METRIC_GATE_01 — verifies execution of all 3 subgates and zero material gaps', () => {
    const gateResult = engine.executeMetricSemanticsGateV10();

    assert.strictEqual(gateResult.program_id, 'AETF500_MULTI_JURISDICTION_METRIC_SEMANTICS_CARDINALITY_RECONCILIATION_MICRO_PATCH_v1.0');
    assert.strictEqual(gateResult.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.strictEqual(gateResult.baseline_mutation_allowed, false);
    assert.strictEqual(gateResult.competency_cardinality_gate, 'PASS');
    assert.strictEqual(gateResult.employee_country_record_semantics_gate, 'PASS');
    assert.strictEqual(gateResult.knowledge_object_cardinality_gate, 'PASS');
    assert.strictEqual(gateResult.subgates.competency_cardinality_gate, 'PASS');
    assert.strictEqual(gateResult.subgates.employee_country_record_semantics_gate, 'PASS');
    assert.strictEqual(gateResult.subgates.knowledge_object_cardinality_gate, 'PASS');
    assert.strictEqual(gateResult.multi_jurisdiction_metric_gate_01, 'PASS');
    assert.strictEqual(gateResult.material_metric_semantics_gaps_remaining, 0);
    assert.strictEqual(gateResult.architecture_changed, false);
    assert.strictEqual(gateResult.country_packs_changed, false);
    assert.strictEqual(gateResult.restrictions_changed, false);
    assert.strictEqual(gateResult.baseline_mutated, false);
    assert.strictEqual(gateResult.final_metric_reconciliation_status, 'PASS');
    assert.strictEqual(gateResult.final_multi_jurisdiction_architecture_status, 'MULTI_JURISDICTION_ARCHITECTURE_COMPLETE_WITH_COUNTRY_PACKS_IN_VALIDATION');
  });
});

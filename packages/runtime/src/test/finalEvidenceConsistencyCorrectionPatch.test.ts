import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SaaSMetricsHardeningV11Engine } from '../commerce/SaaSMetricsHardeningV11Engine.js';

describe('AETF-500 — Final Evidence, Consistency & Auditability Correction Patch (v1.1.3) Test Suite', () => {
  const engine = SaaSMetricsHardeningV11Engine.getInstance();

  it('TEST-113-01: ARPA/ARPE Scope & Compatible LTV Recalculation', () => {
    const arpa = engine.getARPADefinition();
    const arpe = engine.getARPEDefinition();

    assert.strictEqual(arpa.arpa_aoa, 440000);
    assert.strictEqual(arpa.entity_scope, 'ACCOUNT');
    assert.strictEqual(arpe.arpe_aoa, 132000);
    assert.strictEqual(arpe.entity_scope, 'AI_EMPLOYEE');
  });

  it('TEST-113-02: LTV Scope Compatibility Guard', () => {
    const comp = engine.validateLTVScopeCompatibility('ACCOUNT', 'ACCOUNT');
    assert.strictEqual(comp.compatible, true);

    const incomp = engine.validateLTVScopeCompatibility('ACCOUNT', 'INSTANCE');
    assert.strictEqual(incomp.compatible, false);
  });

  it('TEST-113-03: CAC Historical Change Evidence (45k -> 5M AOA)', () => {
    const cacChange = engine.getCACChangeEvidence();

    assert.strictEqual(cacChange.previous_value_aoa, 45000);
    assert.strictEqual(cacChange.current_value_aoa, 5000000);
    assert.strictEqual(cacChange.denominator_entity, 'ACCOUNT');
    assert.ok(cacChange.reason_for_change.includes('Inclusão de remunerações da força de vendas'));
    assert.match(cacChange.evidence_hash, /^[a-fA-F0-9]{64}$/);
  });

  it('TEST-113-04: Tax 2% Legal Evidence Status (Section 13 Special Constraint)', () => {
    const taxRule = engine.getTaxRuleEvidenceV113();

    assert.strictEqual(taxRule.jurisdiction, 'AO');
    assert.strictEqual(taxRule.rate_pct, 2.0);
    assert.strictEqual(taxRule.validation_status, 'EXTERNAL_LEGAL_VALIDATION_REQUIRED');
    assert.ok(taxRule.disclaimer.includes('EXTERNAL_LEGAL_VALIDATION_REQUIRED'));
    assert.ok(taxRule.article.includes('67'));
  });

  it('TEST-113-05: Double Charge Prevention Guard', () => {
    const safe = engine.validateDoubleChargePrevention('RNW-001', true, true);
    assert.strictEqual(safe.safe, true);
    assert.ok(safe.status.includes('DOUBLE_CHARGE_PREVENTED'));

    const blocked = engine.validateDoubleChargePrevention('RNW-001', false, true);
    assert.strictEqual(blocked.safe, false);
    assert.ok(blocked.status.includes('RENEWAL_BLOCKED'));
  });

  it('TEST-113-06: Renewal Event Classification Continuity', () => {
    const rnw = engine.getRenewalEventRecordV112();
    assert.strictEqual(rnw.event_type, 'TRUE_RENEWAL');
    assert.strictEqual(rnw.status, 'COMPLETED');
  });

  it('TEST-113-07: PGC Angola Accounting Entry Mapping', () => {
    const entries = engine.getAccountingEntryMapping();
    assert.ok(entries.length > 0);

    const first = entries[0];
    assert.strictEqual(first.framework, 'PGC_ANGOLA');
    assert.ok(first.debit_account.includes('43.1'));
    assert.ok(first.credit_account.includes('71.1'));
    assert.strictEqual(first.tax_component_aoa, 26400);
  });

  it('TEST-113-08: Central Bank Role Guard (BNA Regulator Context)', () => {
    const bankSem = engine.getBankingRoleSemantics();
    assert.strictEqual(bankSem.settlement_bank, 'BANCO_BAI_SA');
    assert.ok(bankSem.central_bank_context.includes('BNA'));
    assert.strictEqual(bankSem.is_central_bank_settlement_bank, false);
  });

  it('TEST-113-09: Metric Mathematical DAG & Cycle Detection', () => {
    const dag = engine.getMetricDAG();
    assert.ok(dag.nodes.length >= 16);
    assert.ok(dag.edges.length >= 14);
    assert.strictEqual(dag.cycles, 0);
  });

  it('TEST-113-10: Authoritative Source Mapping', () => {
    const sources = engine.getAuthoritativeSources();
    assert.strictEqual(sources.length, 10);
    const mrrSource = sources.find((s) => s.domain_information === 'SaaS Metrics & Formulas');
    assert.ok(mrrSource);
    assert.strictEqual(mrrSource?.authoritative_source, 'SaaS Metrics Engine (AETF-500)');
  });

  it('TEST-113-11: Material Corrections Register (8 Mandatory Blocks)', () => {
    const corrections = engine.getMaterialCorrectionsRegister();
    assert.strictEqual(corrections.length, 8);
    for (const corr of corrections) {
      assert.ok(corr.correction_id);
      assert.ok(corr.after_state);
    }
  });

  it('TEST-113-12: Final Baseline Decision & Correction Gate Execution', () => {
    const gate = engine.executeCorrectionGateV113();
    assert.strictEqual(gate.gate_name, 'SAAS_METRICS_DICTIONARY_v1_1_3_CORRECTION_GATE');
    assert.strictEqual(gate.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.3_FROZEN');
    assert.strictEqual(gate.previous_baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.2_FROZEN');
    assert.strictEqual(gate.previous_baseline_status, 'SUPERSEDED');
    assert.strictEqual(gate.status, 'PASS');
    assert.strictEqual(gate.passed, true);
    assert.strictEqual(gate.final_decision, 'BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING');
    assert.strictEqual(gate.confidence_classification, 'INTERNALLY_VERIFIED');
    assert.match(gate.baseline_manifest_hash, /^[a-fA-F0-9]{64}$/);
  });
});

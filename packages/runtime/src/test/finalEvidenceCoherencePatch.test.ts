import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { SaaSMetricsHardeningV11Engine } from '../commerce/SaaSMetricsHardeningV11Engine.js';

describe('AETF-500 SaaS Metrics Dictionary v1.1.2 — Final Evidence & Coherence Patch Suite', () => {
  const engine = SaaSMetricsHardeningV11Engine.getInstance();

  it('TEST-112-01: ARPA and ARPE Scope Reconciliation', () => {
    const arpa = engine.getARPADefinition();
    const arpe = engine.getARPEDefinition();

    assert.strictEqual(arpa.arpa_aoa, 440000); // 1.32M / 3 Accounts
    assert.strictEqual(arpa.entity_scope, 'ACCOUNT');

    assert.strictEqual(arpe.arpe_aoa, 132000); // 1.32M / 10 AI Employees
    assert.strictEqual(arpe.entity_scope, 'AI_EMPLOYEE');
  });

  it('TEST-112-02: Revenue Unit Scope Guard Rejects Ambiguous ARPU', () => {
    const validCheck = engine.validateRevenueUnitScope('Active Customer Accounts');
    assert.strictEqual(validCheck.valid, true);
    assert.strictEqual(validCheck.status, 'SCOPE_VALIDATED');

    const invalidCheck = engine.validateRevenueUnitScope('UNKNOWN');
    assert.strictEqual(invalidCheck.valid, false);
    assert.strictEqual(invalidCheck.status, 'METRIC_SCOPE_AMBIGUOUS');
  });

  it('TEST-112-03: LTV Scope Compatibility Guard', () => {
    const compatible = engine.validateLTVScopeCompatibility('ACCOUNT', 'ACCOUNT');
    assert.strictEqual(compatible.compatible, true);
    assert.strictEqual(compatible.status, 'LTV_SCOPE_COMPATIBLE');

    const incompatible = engine.validateLTVScopeCompatibility('ACCOUNT', 'INSTANCE');
    assert.strictEqual(incompatible.compatible, false);
    assert.ok(incompatible.status.includes('LTV_SCOPE_INCOMPATIBLE'));
  });

  it('TEST-112-04: CAC Historical Reconciliation 45k -> 5M AOA and Cost Bridge', () => {
    const cacRecon = engine.getCACReconciliationV112();

    assert.strictEqual(cacRecon.old_value_aoa, 45000);
    assert.strictEqual(cacRecon.new_value_aoa, 5000000);
    assert.strictEqual(cacRecon.old_cac_type, 'BLENDED_CAC');
    assert.strictEqual(cacRecon.new_cac_type, 'SALES_ASSISTED_CAC');
    assert.strictEqual(cacRecon.cost_bridge.total_cac_cost_pool_aoa, 15000000);
    assert.strictEqual(cacRecon.cost_bridge.customers_acquired_count, 3);
    assert.strictEqual(cacRecon.cost_bridge.calculated_cac_aoa, 5000000);
    assert.strictEqual(cacRecon.anomaly_alert_triggered, true);
  });

  it('TEST-112-05: Tax 2% Legal Basis Evidence under Angolan Tax Legislation', () => {
    const taxEvid = engine.getTaxRuleEvidence();

    assert.strictEqual(taxEvid.jurisdiction, 'AO');
    assert.strictEqual(taxEvid.rate_pct, 2.0);
    assert.ok(taxEvid.legal_basis_reference.includes('Código do Imposto Industrial'));
    assert.strictEqual(taxEvid.legal_review_status, 'LEGAL_CONFIRMED');
    assert.strictEqual(taxEvid.official_source_reference, 'AGT - Administração Geral Tributária da República de Angola');
  });

  it('TEST-112-06: Renewal Event Continuity Verification', () => {
    const rnw = engine.getRenewalEventRecordV112();

    assert.strictEqual(rnw.event_type, 'TRUE_RENEWAL');
    assert.strictEqual(rnw.status, 'COMPLETED');
    assert.strictEqual(rnw.days_before_expiry, 6);
    assert.ok(rnw.evidence_ids.length > 0);
  });

  it('TEST-112-07: Accounting Framework Semantics (PGC Angola)', () => {
    const accFw = engine.getAccountingFrameworkRecord();

    assert.strictEqual(accFw.framework, 'PGC_ANGOLA');
    assert.strictEqual(accFw.jurisdiction, 'AO');
    assert.strictEqual(accFw.validation_status, 'VALIDATED');
    assert.ok(accFw.legal_or_accounting_reference.includes('PGC Angola'));
  });

  it('TEST-112-08: Banking Semantics Guard (BNA Central Bank Context)', () => {
    const bankSem = engine.getBankingRoleSemantics();

    assert.strictEqual(bankSem.settlement_bank, 'BANCO_BAI_SA');
    assert.ok(bankSem.central_bank_context.includes('BNA'));
    assert.strictEqual(bankSem.is_central_bank_settlement_bank, false);
    assert.strictEqual(bankSem.status, 'VALIDATED');
  });

  it('TEST-112-09: Mathematical Metric DAG & Cycle Detection', () => {
    const dag = engine.getMetricDAG();

    assert.ok(dag.nodes.length > 10);
    assert.ok(dag.edges.length > 10);
    assert.strictEqual(dag.cycles, 0);
  });

  it('TEST-112-10: Baseline Hash Manifest Full SHA-256 Digest Validation', () => {
    const manifest = engine.getBaselineHashManifestV112();

    assert.strictEqual(manifest.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.2_FROZEN');
    assert.strictEqual(manifest.previous_baseline, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.1_FROZEN');
    assert.strictEqual(manifest.previous_baseline_status, 'SUPERSEDED');
    assert.strictEqual(manifest.verification_status, 'VERIFIED');
    assert.match(manifest.baseline_manifest_hash, /^[a-fA-F0-9]{64}$/);

    for (const art of manifest.artifacts) {
      assert.match(art.sha256, /^[a-fA-F0-9]{64}$/);
    }
  });

  it('TEST-112-11: Requirement-Test-Evidence Traceability Matrix', () => {
    const matrix = engine.getRequirementTestEvidenceMatrix();

    assert.strictEqual(matrix.matrix_version, '1.1.2');
    assert.strictEqual(matrix.full_coverage_certified, true);
    assert.strictEqual(matrix.orphan_requirements_count, 0);
    assert.strictEqual(matrix.orphan_tests_count, 0);
    assert.strictEqual(matrix.orphan_evidence_count, 0);
    assert.strictEqual(matrix.traceability_records.length, 12);
  });

  it('TEST-112-12: Full Coherence Gate v1.1.2 Execution', () => {
    const gate = engine.executeCoherenceGateV112();

    assert.strictEqual(gate.gate_name, 'SAAS_METRICS_DICTIONARY_v1_1_2_COHERENCE_GATE');
    assert.strictEqual(gate.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.2_FROZEN');
    assert.strictEqual(gate.status, 'PASS');
    assert.strictEqual(gate.passed, true);
    assert.strictEqual(gate.wave_3_authorized, true);
    assert.strictEqual(gate.scorecard.full_requirement_coverage, true);
  });
});

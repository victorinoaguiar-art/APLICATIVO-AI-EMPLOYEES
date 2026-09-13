import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CommercialMetricMaturityEngine } from '../commerce/CommercialMetricMaturityEngine.js';
import { MetricDistributionEngine } from '../commerce/MetricDistributionEngine.js';

describe('Wave 2 Commercial Metric Maturity & Hardening Gate Test Suite (AETF-500 v3.0)', () => {
  const maturityEngine = CommercialMetricMaturityEngine.getInstance();
  const distributionEngine = MetricDistributionEngine.getInstance();

  it('1. Reconciliação MRR — deve validar MRR Contratado, Faturado, Cobrado e Reconhecido Auditado (1,320,000 AOA)', () => {
    const reconciliation = maturityEngine.getMRRReconciliation();

    assert.equal(reconciliation.contracted_mrr_aoa, 1320000);
    assert.equal(reconciliation.contracted_mrr_maturity, 'OBSERVED');
    assert.equal(reconciliation.billed_mrr_aoa, 1320000);
    assert.equal(reconciliation.billed_mrr_maturity, 'OBSERVED');
    assert.equal(reconciliation.collected_mrr_aoa, 1320000);
    assert.equal(reconciliation.collected_mrr_maturity, 'OBSERVED');
    assert.equal(reconciliation.reconciled_recognized_mrr_aoa, 1320000);
    assert.equal(reconciliation.reconciled_recognized_mrr_maturity, 'AUDITED');
    assert.equal(reconciliation.variance_aoa, 0);
    assert.equal(reconciliation.reconciled, true);

    // Verify hash integrity
    assert.ok(reconciliation.contracted_mrr_provenance.provenance_hash.length === 64);
    assert.ok(reconciliation.reconciled_recognized_mrr_provenance.provenance_hash.length === 64);
  });

  it('2. Margem de Contribuição Ponderada — deve diferenciar margem ponderada por receita (86.89%) de média simples (88.00%)', () => {
    const marginAnalysis = maturityEngine.getContributionMarginAnalysis();

    assert.equal(marginAnalysis.revenue_weighted_margin_pct, 86.89);
    assert.equal(marginAnalysis.simple_average_margin_pct, 88.0);
    assert.equal(marginAnalysis.total_net_revenue_aoa, 1320000);
    assert.equal(marginAnalysis.total_variable_cost_aoa, 173000);
    assert.equal(marginAnalysis.customers.length, 3);
  });

  it('3. Distribuição de FTV — deve calcular média (0.27h), mediana (0.25h), min (0.20h), max (0.35h) e percentis P75/P90/P95', () => {
    const ftvDist = distributionEngine.getWave2FTVDistribution();

    assert.equal(ftvDist.sample_count, 3);
    assert.equal(ftvDist.mean, 0.2667);
    assert.equal(ftvDist.median, 0.25);
    assert.equal(ftvDist.min, 0.2);
    assert.equal(ftvDist.max, 0.35);
    assert.ok(ftvDist.p75 >= 0.25 && ftvDist.p75 <= 0.35);
    assert.ok(ftvDist.p90 >= 0.30 && ftvDist.p90 <= 0.35);
    assert.ok(ftvDist.p95 >= 0.30 && ftvDist.p95 <= 0.35);
  });

  it('4. Validação de Rastreabilidade e Maturidade — deve rejeitar maturidade OBSERVED sem fonte REAL_PRODUCTION', () => {
    const invalidProv = maturityEngine.createProvenanceRecord(
      'TEST_METRIC',
      'SIMULATED',
      'SIM-001',
      'Dados de simulação sintética'
    );

    const check = maturityEngine.validateMetricMaturityProvenance('OBSERVED', invalidProv);
    assert.equal(check.valid, false);
    assert.ok(check.reason?.includes('exige fonte REAL_PRODUCTION'));

    const validProv = maturityEngine.createProvenanceRecord(
      'TEST_METRIC',
      'REAL_PRODUCTION',
      'PROD-001',
      'Dados de produção real'
    );
    const validCheck = maturityEngine.validateMetricMaturityProvenance('OBSERVED', validProv);
    assert.equal(validCheck.valid, true);
  });

  it('5. Hardening Final Gate & Freeze Wave 2 — deve aprovar Gate e congelar baseline AETF-500-COMMERCIAL-WAVE2-FROZEN-v3.0', () => {
    const gateResult = maturityEngine.executeCommercialMetricMaturityGate();

    assert.equal(gateResult.passed, true);
    assert.equal(gateResult.status, 'PASSED');
    assert.equal(gateResult.baseline_id, 'AETF-500-COMMERCIAL-WAVE2-FROZEN-v3.0');
    assert.equal(gateResult.previous_wave1_baseline_id, 'AETF-500-COMMERCIAL-WAVE1-FROZEN-v2.1-2026.09.12');
    assert.equal(gateResult.previous_wave1_baseline_immutable, true);
    assert.ok(gateResult.baseline_hash.length === 64);

    assert.equal(gateResult.compliance_verification.ltv_cac_labeled_correctly, true);
    assert.equal(gateResult.compliance_verification.nrr_grr_temporal_maturity_valid, true);
    assert.equal(gateResult.compliance_verification.renewal_intent_vs_completed_separated, true);
    assert.equal(gateResult.compliance_verification.arr_classified_as_derived, true);
    assert.equal(gateResult.compliance_verification.provenance_audit_passed, true);
  });
});

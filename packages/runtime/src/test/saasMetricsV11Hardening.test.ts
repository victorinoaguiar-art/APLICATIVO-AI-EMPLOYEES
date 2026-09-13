import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SaaSMetricsHardeningV11Engine,
  MetricLineageEngine,
  MetricProvenanceCanonicalizer
} from '../index.js';
import {
  SaaSMetricDefinition
} from '@ai-employee/shared';

describe('SaaS Metrics Dictionary v1.1 & v1.1.1 Patch Hardening & Provenance Suite', () => {
  const metricsEngine = SaaSMetricsHardeningV11Engine.getInstance();
  const lineageEngine = MetricLineageEngine.getInstance(metricsEngine);

  it('1. Deve validar corretamente métrica 4D completa', () => {
    const validMetric: SaaSMetricDefinition = {
      metric_id: 'MRR-001',
      metric_code: 'SUBSCRIPTION_MRR',
      metric_name: 'Monthly Recurring Revenue de Assinatura',
      domain: 'FINANCIAL_RECURRING',
      formula_expression: 'SUM(active_subscription_recurring_amount)',
      dimensions_4d: {
        data_source: 'REAL_PRODUCTION',
        calculation_type: 'DIRECT_OBSERVATION',
        temporal_maturity: 'PERIOD_OBSERVED',
        assurance_level: 'INTERNALLY_AUDITED'
      },
      provenance_v11: {
        provenance_id: 'PROV-MRR-001',
        source_environment: 'REAL_PRODUCTION',
        source_entity: 'BillingLedger',
        source_record_id: 'REC-2026-09-01',
        extraction_timestamp: '2026-09-01T00:00:00.000Z',
        pipeline_signature: 'sha256-pipeline-sig',
        hash_sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90',
        assurance_level: 'INTERNALLY_AUDITED',
        schema_version: 'v1.1'
      },
      tax_traceability: {
        tax_exclusion_verified: true,
        gross_value: 100000,
        net_value: 100000,
        tax_deduction_amount: 0
      },
      revenue_decomposition: {
        raw_mrr_value: 100000,
        contracted_recurring_value: 100000,
        recurring_billed_amount: 100000,
        cash_collected_amount: 98000,
        cash_settled_amount: 98000,
        cash_reconciled_amount: 98000,
        revenue_recognized_amount: 100000,
        reconciliation_status: 'RECONCILED'
      },
      audit_status: 'APPROVED',
      frozen_baseline: true,
      last_updated: '2026-09-12T00:00:00.000Z'
    };

    const res = metricsEngine.validateMetric4D(validMetric);
    assert.equal(res.valid, true);
    assert.equal(res.violations.length, 0);
  });

  it('2. Deve rejeitar métrica com hash de provenance vazio (SHA256_EMPTY)', () => {
    const invalidMetric: SaaSMetricDefinition = {
      metric_id: 'ARR-001',
      metric_code: 'ANNUAL_RUN_RATE',
      metric_name: 'Annual Run Rate',
      domain: 'FINANCIAL_RECURRING',
      formula_expression: 'SUBSCRIPTION_MRR * 12',
      dimensions_4d: {
        data_source: 'REAL_PRODUCTION',
        calculation_type: 'DERIVED',
        temporal_maturity: 'PERIOD_OBSERVED',
        assurance_level: 'INTERNALLY_AUDITED'
      },
      provenance_v11: {
        provenance_id: 'PROV-ARR-001',
        source_environment: 'REAL_PRODUCTION',
        source_entity: 'MRRCalculator',
        source_record_id: 'REC-ARR-001',
        extraction_timestamp: '2026-09-01T00:00:00.000Z',
        pipeline_signature: 'sig-arr',
        // EMPTY HASH FOR NON-ZERO PAYLOAD
        hash_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        assurance_level: 'INTERNALLY_AUDITED',
        schema_version: 'v1.1'
      },
      tax_traceability: {
        tax_exclusion_verified: true,
        gross_value: 1200000,
        net_value: 1200000
      },
      revenue_decomposition: {
        raw_mrr_value: 100000
      },
      audit_status: 'APPROVED',
      frozen_baseline: true,
      last_updated: '2026-09-12T00:00:00.000Z'
    };

    const res = metricsEngine.validateMetric4D(invalidMetric);
    assert.equal(res.valid, false);
    assert.ok(res.violations.some((v: string) => v.includes('SHA256_EMPTY')));
  });

  it('3. Deve calcular e reconciliar MRR, NRR (124.1%) e GRR (94.1%) com fechamento exato', () => {
    const opening = 1000000;
    const expansion = 300000;
    const contraction = 50000;
    const churn = 9000;
    const cohortsCount = 100;

    const res = metricsEngine.calculateReconciledMRRAndRetention(
      opening,
      expansion,
      contraction,
      churn,
      cohortsCount
    );

    assert.equal(res.closing_mrr, 1241000);
    assert.equal(res.nrr_percentage, 124.1);
    assert.equal(res.grr_percentage, 94.1);
    assert.equal(res.mathematically_reconciled, true);
    assert.ok(res.formula_provenance_hash.length === 64);
  });

  it('4. Deve validar NPS e RENEWAL_INTENT de forma desacoplada (NPS != RENEWAL_INTENT)', () => {
    const res = metricsEngine.validateRenewalIntentAndNPS(9, true, true);
    assert.equal(res.valid, true);
    assert.equal(res.intent_decoupled_from_nps, true);
    assert.equal(res.respondent_classification, 'PROMOTER');
    assert.equal(res.renewal_intent, true);
    assert.equal(res.renewal_completed, true);

    const checkRefusal = metricsEngine.validateRenewalIntentAndNPS(10, false, false);
    assert.equal(checkRefusal.valid, true);
    assert.equal(checkRefusal.renewal_intent, false);
    assert.equal(checkRefusal.intent_decoupled_from_nps, true);
  });

  it('5. Deve decompor LTV e calcular LTV/CAC com Margem de Contribuição Projetada', () => {
    const ltvRes = metricsEngine.calculateDecomposedLTV({
      arpu_monthly: 1000,
      gross_margin_pct: 80,
      monthly_churn_pct: 2,
      observed_sales_assisted_cac: 5000
    });

    assert.equal(ltvRes.revenue_ltv, 50000);
    assert.equal(ltvRes.contribution_margin_ltv, 40000);
    assert.equal(ltvRes.ltv_cac_ratio, 8.0);
    assert.equal(ltvRes.qualification_label, 'Projected Contribution Margin LTV / Observed Sales-Assisted CAC');
    assert.equal(ltvRes.temporal_maturity, 'PROVISIONAL');
    assert.equal(ltvRes.calculation_type, 'PROJECTED');
  });

  it('6. Deve gerar Canonical JSON e Hash SHA-256 via MetricProvenanceCanonicalizer', () => {
    const payload = {
      metric_code: 'SUBSCRIPTION_MRR',
      value: 124100,
      domain: 'FINANCIAL_RECURRING'
    };
    const canonicalStr = MetricProvenanceCanonicalizer.canonicalize(payload);
    const hash = MetricProvenanceCanonicalizer.hashPayload(payload);

    assert.equal(typeof canonicalStr, 'string');
    assert.equal(hash.length, 64);
    assert.notEqual(hash, MetricProvenanceCanonicalizer.SHA256_EMPTY);
    assert.equal(MetricProvenanceCanonicalizer.isPlaceholderHash(hash), false);
  });

  it('7. Deve registrar métricas e construir DAG no MetricLineageEngine', () => {
    const dag = lineageEngine.buildDAG();
    assert.ok(dag.nodes.length >= 6);
    assert.ok(dag.edges.length >= 5);
    assert.equal(dag.cycles_detected, false);

    const mrrEval = lineageEngine.evaluateNode('SUBSCRIPTION_MRR');
    assert.equal(mrrEval.metric_code, 'SUBSCRIPTION_MRR');
    assert.equal(mrrEval.evaluated_value, 1320000);

    const arrEval = lineageEngine.evaluateNode('ANNUAL_RUN_RATE');
    assert.equal(arrEval.evaluated_value, 15840000); // 1320000 * 12

    const trace = lineageEngine.getMetricLineageTrace('ANNUAL_RUN_RATE');
    assert.equal(trace.metric_code, 'ANNUAL_RUN_RATE');
    assert.ok(trace.upstream_dependencies.includes('SUBSCRIPTION_MRR'));
  });

  it('8. Deve executar o Financial Settlement Bridge (Reconciliação dos 26.400 AOA de Retenção na Fonte)', () => {
    const bridge = metricsEngine.getSettlementBridge();
    assert.equal(bridge.gross_billed_amount, 1320000);
    assert.equal(bridge.tax_withholding, 26400);
    assert.equal(bridge.expected_net_settlement, 1293600);
    assert.equal(bridge.actual_net_settlement, 1293600);
    assert.equal(bridge.reconciliation_difference, 0);
    assert.equal(bridge.status, 'RECONCILED');
  });

  it('9. Deve validar TaxJurisdictionGuard rejeitando tributos brasileiros (ISS/ICMS) em Angola (AO)', () => {
    const checkValid = metricsEngine.validateTaxJurisdiction('AO', 'IVA');
    assert.equal(checkValid.valid, true);

    const checkInvalid = metricsEngine.validateTaxJurisdiction('AO', 'ISS');
    assert.equal(checkInvalid.valid, false);
    assert.equal(checkInvalid.status, 'TAX_JURISDICTION_MISMATCH');
  });

  it('10. Deve executar o Gate de Patch v1.1.1 com sucesso (PATCH GATE)', () => {
    const patchRes = metricsEngine.executePatchGateV111();
    assert.equal(patchRes.passed, true);
    assert.equal(patchRes.status, 'PASS');
    assert.equal(patchRes.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.1_FROZEN');
    assert.equal(patchRes.previous_baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1_FROZEN');
    assert.ok(patchRes.baseline_manifest_hash.length === 64);
    assert.equal(patchRes.scorecard.nrr_arithmetic, true);
    assert.equal(patchRes.scorecard.grr_arithmetic, true);
    assert.equal(patchRes.scorecard.settlement_bridge, true);
    assert.equal(patchRes.scorecard.tax_jurisdiction, true);
    assert.equal(patchRes.corrections_count, 5);
  });
});

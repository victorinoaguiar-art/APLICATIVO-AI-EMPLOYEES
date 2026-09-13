import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ControlledPaidScaleEngine } from '../commerce/ControlledPaidScaleEngine.js';
import { CustomerSuccessEngine } from '../commerce/CustomerSuccessEngine.js';
import { RetentionEngine } from '../commerce/RetentionEngine.js';
import { ExpansionRevenueEngine } from '../commerce/ExpansionRevenueEngine.js';
import { UnitEconomicsEngine } from '../commerce/UnitEconomicsEngine.js';

describe('Controlled Paid Scale, Customer Success, Retention & Expansion Test Suite (AETF-500 v3.0)', () => {
  const scaleEngine = ControlledPaidScaleEngine.getInstance();
  const csEngine = CustomerSuccessEngine.getInstance();
  const retentionEngine = RetentionEngine.getInstance();
  const expansionEngine = ExpansionRevenueEngine.getInstance();
  const economicsEngine = UnitEconomicsEngine.getInstance();

  it('1. Wave 2 Certification — deve certificar com sucesso o Trio de Clientes Piloto e autorizar a Onda 3', () => {
    const profiles = scaleEngine.getPilotCustomerProfiles();
    assert.equal(profiles.length, 3);

    const certResult = scaleEngine.certifyWave2();

    assert.equal(certResult.certified, true);
    assert.equal(certResult.wave_id, 'WAVE_2_TRIO_CUSTOMERS');
    assert.equal(certResult.customers_count, 3);
    assert.equal(certResult.critical_incidents_count, 0);
    assert.equal(certResult.evidence_completeness_pct, 100);
    assert.equal(certResult.next_wave_authorized, 'WAVE_3_10_CUSTOMERS');
    assert.equal(scaleEngine.getActiveWave(), 'WAVE_3_10_CUSTOMERS');
  });

  it('2. Customer Success Engine — deve calcular Activation Score (100%), Health State (EXCELLENT) e Relatório de Valor Realizado', () => {
    const actScore = csEngine.evaluateActivationScore('CUST-W2-ALPHA');
    assert.equal(actScore, 100);

    const health = csEngine.evaluateHealth(95, 98, 99, 90, 100, 92);
    assert.equal(health.health_state, 'EXCELLENT');
    assert.ok(health.health_score >= 90);

    const valReport = csEngine.generateValueRealizationReport('CUST-W2-BETA', 85, 84);
    assert.equal(valReport.total_tasks_completed, 85);
    assert.equal(valReport.total_tasks_accepted, 84);
    assert.equal(valReport.acceptance_rate_pct, 98.8);
    assert.ok(valReport.estimated_hours_saved > 30);
    assert.equal(valReport.observed_roi_pct, 340);
    assert.ok(valReport.value_evidence_hash.length === 64);
  });

  it('3. Retention & Renewal Engine — deve prever taxa de renovação (98%) e MRR esperado para contas saudáveis', () => {
    const forecast = retentionEngine.forecastRenewal('CUST-W2-BETA', 350000, 95);

    assert.equal(forecast.renewal_probability_pct, 98);
    assert.equal(forecast.expected_renewal_mrr_aoa, 343000);
    assert.equal(forecast.renewal_risk, 'LOW');
    assert.equal(forecast.renewal_status, 'RENEWAL_CONFIRMED');
  });

  it('4. Expansion Revenue Engine — deve identificar oportunidades de expansão (Department Pack / Novas Instâncias)', () => {
    const opp = expansionEngine.identifyExpansionOpportunity('CUST-W2-GAMMA', 'BUSINESS', 6);

    assert.equal(opp.opportunity_type, 'DEPARTMENT_PACK');
    assert.equal(opp.readiness_level, 'HIGH_OPPORTUNITY');
    assert.ok(opp.expected_additional_mrr_aoa >= 400000);
    assert.ok(opp.confidence_score >= 90);
  });

  it('5. Unit Economics Engine — deve calcular Margem de Contribuição, CAC Payback (1,5 meses) e Rácio LTV/CAC (24,5x)', () => {
    const econ = economicsEngine.calculateUnitEconomics('CUST-W2-BETA', 350000, 3);

    assert.equal(econ.profitability_status, 'HIGHLY_PROFITABLE');
    assert.ok(econ.contribution_margin_pct > 80);
    assert.equal(econ.cac_payback_months, 1.5);
    assert.equal(econ.ltv_cac_ratio, 24.5);
  });

  it('6. Revenue Metrics Snapshot — deve calcular NRR (124,5%), GRR (99,1%) e ARPA da coorte comercial', () => {
    const snapshot = scaleEngine.getRevenueMetricsSnapshot();

    assert.equal(snapshot.active_customers_count, 3);
    assert.equal(snapshot.mrr_aoa, 1320000); // 120k + 350k + 850k
    assert.equal(snapshot.arr_aoa, 15840000);
    assert.equal(snapshot.nrr_pct, 124.5);
    assert.equal(snapshot.grr_pct, 99.1);
    assert.equal(snapshot.arpa_aoa, 440000);
  });
});

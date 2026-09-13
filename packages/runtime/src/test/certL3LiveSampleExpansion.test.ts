import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CertL3LiveSampleExpansionEngine } from '../aetf/CertL3LiveSampleExpansionEngine.js';

describe('AETF-500 CERT-L3 Live Sample Expansion & Evidence Sufficiency Engine', () => {
  const engine = CertL3LiveSampleExpansionEngine.getInstance();
  const summary = engine.getExpansionSummary();

  it('1. Verifies exact target of 68,500 total live samples across 500 AI Employees', () => {
    assert.strictEqual(summary.sample_totals.total_required_live_tasks, 68500);
    assert.strictEqual(summary.sample_totals.credited_initial_live_tasks, 2450);
    assert.strictEqual(summary.sample_totals.expanded_live_tasks, 66050);
    assert.strictEqual(summary.sample_totals.total_actual_verified_live_tasks, 68500);
    assert.strictEqual(summary.sample_sufficiency_gate, 'PASSED_100_PERCENT');
    assert.strictEqual(summary.employees_sample_sufficient, 500);
    assert.strictEqual(summary.employees_sample_insufficient, 0);
  });

  it('2. Verifies breakdown per risk class matches risk-calibrated targets', () => {
    const breakdown = summary.by_risk_class_breakdown;
    
    // Low Risk: 150 EMPs @ 50 = 7,500 tasks
    assert.strictEqual(breakdown.low_risk.required, 7500);
    assert.strictEqual(breakdown.low_risk.actual, 7500);
    assert.strictEqual(breakdown.low_risk.status, 'SUFFICIENT');

    // Medium Risk: 180 EMPs @ 100 = 18,000 tasks
    assert.strictEqual(breakdown.medium_risk.required, 18000);
    assert.strictEqual(breakdown.medium_risk.actual, 18000);
    assert.strictEqual(breakdown.medium_risk.status, 'SUFFICIENT');

    // High Risk: 140 EMPs @ 200 = 28,000 tasks
    assert.strictEqual(breakdown.high_risk.required, 28000);
    assert.strictEqual(breakdown.high_risk.actual, 28000);
    assert.strictEqual(breakdown.high_risk.status, 'SUFFICIENT');

    // Critical Risk: 30 EMPs @ 500 = 15,000 tasks
    assert.strictEqual(breakdown.critical_risk.required, 15000);
    assert.strictEqual(breakdown.critical_risk.actual, 15000);
    assert.strictEqual(breakdown.critical_risk.status, 'SUFFICIENT');
  });

  it('3. Checks quality & authenticity metrics', () => {
    const q = summary.quality_metrics;
    assert.strictEqual(q.target_effect_verification_rate, 100);
    assert.strictEqual(q.false_success_rate, 0);
    assert.strictEqual(q.unique_business_case_ratio, 100);
    assert.strictEqual(q.critical_security_incidents, 0);
    assert.strictEqual(q.cross_tenant_breaches, 0);
    assert.strictEqual(q.unresolved_regulatory_errors, 0);
  });

  it('4. Checks employee requirements query & individual requirement cards', () => {
    const allReqs = engine.getEmployeeRequirements();
    assert.strictEqual(allReqs.length, 500);

    const req001 = engine.getEmployeeRequirementById('001');
    assert.ok(req001);
    assert.strictEqual(req001?.employee_id, '001');
    assert.strictEqual(req001?.risk_class, 'LOW');
    assert.strictEqual(req001?.final_required_live_tasks, 50);
    assert.strictEqual(req001?.total_actual_live_tasks, 50);
    assert.strictEqual(req001?.sample_status, 'SUFFICIENT');
    assert.strictEqual(req001?.cert_l3_decision, 'CERT_L3_APPROVED');

    const req495 = engine.getEmployeeRequirementById('495');
    assert.ok(req495);
    assert.strictEqual(req495?.employee_id, '495');
    assert.strictEqual(req495?.cert_l3_decision, 'CERT_L3_WITH_RESTRICTIONS');
    assert.ok(req495?.restrictions.length);
    assert.ok(req495?.restrictions[0].includes('ERP PRIMAVERA'));
  });

  it('5. Verifies all 500 employees reach 100% sufficiency status', () => {
    const allReqs = engine.getEmployeeRequirements();
    const compliant = allReqs.filter((r: any) => r.sample_status === 'SUFFICIENT');
    assert.strictEqual(compliant.length, 500);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FirstPaidCustomerValidationEngine } from '../commerce/FirstPaidCustomerValidationEngine.js';

describe('First Live Customer Execution & Evidence Certification Test Suite (AETF-500 v2.0)', () => {
  const engine = FirstPaidCustomerValidationEngine.getInstance();

  it('1. deve verificar a fórmula exata da Margem de Contribuição (90.11%) para 180.000 AOA vs 17.800 AOA de custos', () => {
    const rev = engine.validateRealRevenue(
      'CUSTOMER-000001',
      'EMP-001',
      'INSTANCE-EMP-001-01',
      'PROFESSIONAL',
      180000,
      true, // Real Paid Customer
      'REAL_PRODUCTION',
    );

    assert.equal(rev.monthly_contract_value, 180000);
    assert.equal(rev.total_variable_cost, 17800);
    assert.equal(rev.contribution_margin, 162200); // 180000 - 17800
    assert.equal(rev.contribution_margin_pct, 90.11); // 162200 / 180000 * 100 = 90.11%
    assert.notEqual(rev.contribution_margin_pct, 89.1); // Ensures old 89.1% is eliminated
  });

  it('2. deve aplicar a Regra de Anti-Contaminação e rejeitar métricas com source != REAL_PRODUCTION para Receita Real', () => {
    assert.throws(() => {
      engine.validateRealRevenue(
        'CUSTOMER-000001',
        'EMP-001',
        'INSTANCE-EMP-001-01',
        'PROFESSIONAL',
        180000,
        true, // Real Paid Customer flag set
        'SIMULATED', // Non-production source
      );
    }, /Regra de Anti-Contaminação/);
  });

  it('3. deve registar evidências comerciais no Commercial Evidence Vault com Hash Chain SHA-256', () => {
    const evidence = engine.registerEvidence(
      'CONTRACT_EVIDENCE',
      'CUSTOMER-000001',
      'EMP-001',
      'INSTANCE-EMP-001-01',
      'CONTRACT',
      'CONTRACT-000001',
      'REAL_PRODUCTION',
      { terms: 'Accepted Enterprise SaaS Contract', value: 180000 },
    );

    assert.ok(evidence.evidence_id.startsWith('EVID-CONTRACT-'));
    assert.equal(evidence.source, 'REAL_PRODUCTION');
    assert.ok(evidence.content_hash.length === 64); // SHA-256 digest
    assert.ok(evidence.previous_hash.length === 64);
  });

  it('4. deve verificar os 23 Portões de Prontidão e gerar evidência de prontidão', () => {
    const gatesEval = engine.evaluate23ReadinessGates(
      'CUSTOMER-000001',
      {
        identity_verification: true,
        commercial_contract: true,
        customer_data: true,
        payment_method: true,
        first_payment: true,
        tenant_creation: true,
        employee_assignment: true,
        employee_version: true,
        permissions: true,
        knowledge_provisioning: true,
        internal_policies: true,
        integrations: true,
        security_controls: true,
        audit_logging: true,
        data_protection: true,
        backup_recovery: true,
        human_supervisor: true,
        escalation_rules: true,
        support_channel: true,
        usage_metering: true,
        billing_metering: true,
        rollback_plan: true,
        emergency_stop: true,
      },
      'REAL_PRODUCTION',
    );

    assert.equal(gatesEval.all_passed, true);
    assert.ok(gatesEval.evidence.content_hash.length === 64);
  });

  it('5. deve calcular FTV e atingir 100% de Completude de Evidências no Scorecard Comercial', () => {
    const task = engine.executeFirstTask(
      'CUSTOMER-000001',
      'TENANT-000001',
      'EMP-001',
      'INSTANCE-EMP-001-01',
      'Execução inicial de tarefa em produção real',
      'LOW',
      'REAL_PRODUCTION',
    );

    const val = engine.validateFirstValue(
      task.task_id,
      new Date(Date.now() - 3600 * 1000).toISOString(),
      4.9,
      'REAL_PRODUCTION',
    );

    assert.equal(val.value_validated, true);

    const scorecard = engine.getValidationScorecard('CUSTOMER-000001');
    assert.ok(scorecard);
    assert.equal(scorecard?.evidence_completeness_pct, 100);
    assert.equal(scorecard?.overall_status, 'REAL_REVENUE_VALIDATED');
  });

  it('6. deve certificar a Onda 1 (WAVE_1_CERTIFIED) e conceder autorização explícita para a Onda 2 (AUTHORIZED_FOR_WAVE_2_TRIO_CUSTOMERS)', () => {
    const wave1Cert = engine.certifyWave1('CUSTOMER-000001');

    assert.equal(wave1Cert.certified, true);
    assert.equal(wave1Cert.wave_1_record.contribution_margin_pct, 90.11);
    assert.equal(wave1Cert.wave_1_record.evidence_completeness_pct, 100);
    assert.equal(wave1Cert.state, 'AUTHORIZED_FOR_WAVE_2_TRIO_CUSTOMERS');
    assert.equal(engine.getOverallCertificationState(), 'AUTHORIZED_FOR_WAVE_2_TRIO_CUSTOMERS');
  });
});

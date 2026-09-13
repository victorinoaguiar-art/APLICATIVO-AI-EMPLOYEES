import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CommercialEvidenceVerificationEngine } from '../commerce/CommercialEvidenceVerificationEngine.js';
import { TaxDeterminationEngine } from '../commerce/TaxDeterminationEngine.js';
import { FirstPaidCustomerValidationEngine } from '../commerce/FirstPaidCustomerValidationEngine.js';

describe('Final Pre-Freeze Commercial Baseline Hardening — WAVE 1 Test Suite (AETF-500 v2.1)', () => {
  const verificationEngine = CommercialEvidenceVerificationEngine.getInstance();
  const taxEngine = TaxDeterminationEngine.getInstance();
  const validationEngine = FirstPaidCustomerValidationEngine.getInstance();

  it('1. Ajuste 1 — deve separar formalmente PAYMENT, SETTLEMENT e RECONCILIATION e bloquear receita não reconciliada', () => {
    const unreconciled = verificationEngine.registerPaymentProcess(
      'CUSTOMER-000001',
      'INV-001',
      180000,
      true, // Settled
      false, // Not reconciled
    );

    assert.equal(unreconciled.payment_evidence.status, 'PAYMENT_RECEIVED');
    assert.equal(unreconciled.settlement_evidence?.status, 'PAYMENT_SETTLED');
    assert.equal(unreconciled.reconciliation_evidence, undefined);
    assert.equal(unreconciled.financially_valid, false);

    const reconciled = verificationEngine.registerPaymentProcess(
      'CUSTOMER-000001',
      'INV-002',
      180000,
      true, // Settled
      true, // Reconciled
    );

    assert.equal(reconciled.financially_valid, true);
    assert.equal(reconciled.reconciliation_evidence?.reconciliation_status, 'RECONCILED');
    assert.equal(reconciled.reconciliation_evidence?.difference, 0);
  });

  it('2. Ajuste 2 — deve validar a semântica do FTV e diferenciar FTV (15 min) de Task Execution Time (4 min)', () => {
    const payTime = new Date('2026-09-15T10:00:00.000Z').toISOString();
    const acceptTime = new Date('2026-09-15T10:15:00.000Z').toISOString();

    const timeMetrics = verificationEngine.evaluateFTVSemantics(payTime, acceptTime, 4);

    assert.equal(timeMetrics.task_execution_time_minutes, 4);
    assert.equal(timeMetrics.first_time_to_value_hours, 0.25); // 15 mins = 0.25h
    assert.equal(timeMetrics.semantic_validation_passed, true);
    assert.notEqual(timeMetrics.first_time_to_value_hours, timeMetrics.task_execution_time_minutes);
  });

  it('3. Ajuste 3 — deve remover o limite rígido de 1000 clientes da General Availability e aplicar Gestão Dinâmica de Capacidade', () => {
    const waves = validationEngine.getCohortWaves();
    const gaWave = waves.find((w) => w.wave_id === 'GENERAL_AVAILABILITY');

    assert.ok(gaWave);
    assert.equal(gaWave?.max_customers, 0); // 0 = Capacity Managed
    assert.equal(gaWave?.is_dynamic_capacity_managed, true);

    const scaleGate = verificationEngine.evaluateScaleReadinessGate();
    assert.equal(scaleGate.passed, true);
    assert.equal(scaleGate.capacity_snapshot.capacity_status, 'CAPACITY_HEALTHY');
  });

  it('4. Ajuste 4 — deve determinar regras fiscais (IVA 14%) com rastreabilidade jurídica e versão de regra', () => {
    const taxEval = taxEngine.determineTax('AO', 'SAAS_SUBSCRIPTION', 'NIF-5418001122', 'NIF-5000998811', 180000);

    assert.equal(taxEval.tax_result.tax_rate, 14.0);
    assert.equal(taxEval.tax_result.tax_amount, 25200); // 14% of 180000
    assert.equal(taxEval.tax_result.tax_code, 'IVA-AO-14');
    assert.equal(taxEval.tax_result.tax_rule_id, 'AO-VAT-STANDARD-2026-v1');
    assert.ok(taxEval.tax_result.legal_basis_reference.includes('Código do IVA'));
    assert.ok(taxEval.tax_evidence.content_hash.length === 64);
  });

  it('5. Ajuste 5 — deve aplicar canonicalização determinística e validar integridade no Commercial Evidence Vault', () => {
    const payloadA = { b: 2, a: 1 };
    const payloadB = { a: 1, b: 2 };

    const canonA = verificationEngine.canonicalizePayload(payloadA);
    const canonB = verificationEngine.canonicalizePayload(payloadB);

    assert.equal(canonA, canonB); // Canonicalization ensures key ordering consistency

    const evid = verificationEngine.registerEnhancedEvidence(
      'CONTRACT_EVIDENCE',
      'CUSTOMER-000001',
      'EMP-001',
      'INSTANCE-EMP-001-01',
      'CONTRACT',
      'CONTRACT-000001',
      'PRODUCTION',
      'REAL_PRODUCTION',
      'ContractEngine',
      'LegalService',
      payloadA,
    );

    assert.equal(evid.environment, 'PRODUCTION');
    assert.equal(evid.authenticity_level, 'LEVEL_4_SIGNED_AND_VERIFIED');
    assert.equal(evid.signature_status, 'SIGNATURE_VERIFIED');
  });

  it('6. Hard Freeze Gate — deve aprovar a baseline congelada AETF-500-COMMERCIAL-WAVE1-FROZEN-v2.1-2026.09.12', () => {
    const freezeGate = verificationEngine.evaluateCommercialBaselineFreezeGate();

    assert.equal(freezeGate.gate_passed, true);
    assert.equal(freezeGate.baseline_id, 'AETF-500-COMMERCIAL-WAVE1-FROZEN-v2.1-2026.09.12');
    assert.equal(freezeGate.payment_settlement_separation, true);
    assert.equal(freezeGate.financial_reconciliation, true);
    assert.equal(freezeGate.ftv_semantics, true);
    assert.equal(freezeGate.tax_determination_engine, true);
    assert.equal(freezeGate.evidence_authenticity_controls, true);
  });
});

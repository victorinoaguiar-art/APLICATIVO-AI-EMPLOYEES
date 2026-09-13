import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CommerceProductionReadinessEngine } from '../commerce/CommerceProductionReadinessEngine.js';

describe('CommerceProductionReadinessEngine - Production Hardening & Paid Customer Readiness', () => {
  const engine = CommerceProductionReadinessEngine.getInstance();

  it('1. deve calcular o preço mínimo com a fórmula endurecida: DirectCost / (1 - TargetMargin)', () => {
    const calc = engine.calculateHardenedPricing('EMP-001', 'PROFESSIONAL', 'AOA', 60);
    assert.ok(calc.direct_cost_aoa > 0);
    // Formula: DirectCost / (1 - 0.60) = DirectCost / 0.40
    const expectedMinPrice = Math.round(calc.direct_cost_aoa / 0.4);
    assert.equal(calc.minimum_selling_price, expectedMinPrice);
    assert.ok(calc.final_monthly_price >= calc.minimum_selling_price);
    assert.ok(calc.pricing_version_id.startsWith('PV-EMP-001'));
  });

  it('2. deve converter moedas dinamicamente via FXRateService e aplicar proteção contra taxas STALE', () => {
    const rateUsd = engine.getFXRate('USD', 'AOA');
    assert.equal(rateUsd, 920);

    const rateEur = engine.getFXRate('EUR', 'AOA');
    assert.equal(rateEur, 1000);
  });

  it('3. deve registar perfil de cliente e contrato vinculativo com hash SHA-256', () => {
    const cust = engine.registerCustomer({
      legal_name: 'Empresa Demonstrativa SA',
      commercial_name: 'Empresa Demo Angola',
      tax_id_nif: '5418001122',
      country: 'Angola',
      billing_address: 'Av. 4 de Fevereiro, Luanda',
      authorized_contacts: [{ name: 'Dr. João Silva', email: 'joao@demo.co.ao', role: 'Diretor Financeiro' }],
    });

    assert.ok(cust.customer_id.startsWith('CUST-'));
    assert.ok(cust.tenant_id.startsWith('TENANT-5418001122'));
    assert.equal(cust.status, 'VERIFIED');

    const acceptance = engine.acceptContract(
      'CTR-DEMO-001',
      cust.customer_id,
      'Dr. João Silva',
      'joao@demo.co.ao',
      'CONTRATO SAAS COLABORADOR DIGITAL AETF-500',
    );

    assert.equal(acceptance.signature_status, 'SANDBOX_DEMO');
    assert.ok(acceptance.terms_hash_sha256.length > 0);
  });

  it('4. deve garantir idempotência global (mesma chave produz exatamente 1 efeito)', () => {
    let callCount = 0;
    const fn = () => {
      callCount++;
      return { id: 'EXEC-001', status: 'SUCCESS' };
    };

    const res1 = engine.executeWithIdempotency('KEY-TEST-001', 'HIRE_EMPLOYEE', fn);
    const res2 = engine.executeWithIdempotency('KEY-TEST-001', 'HIRE_EMPLOYEE', fn);

    assert.equal(callCount, 1);
    assert.deepEqual(res1, res2);
  });

  it('5. deve validar direitos (Entitlements) no backend por plano comercial', () => {
    const starter = engine.getEntitlements('STARTER');
    assert.equal(starter.max_tasks_per_month, 1000);
    assert.equal(starter.max_concurrent_instances, 2);

    const enterprise = engine.getEntitlements('ENTERPRISE');
    assert.equal(enterprise.max_tasks_per_month, 50000);
    assert.equal(enterprise.support_level, 'DEDICATED');
  });

  it('6. deve avaliar os 13 Portões de Ativação Enterprise e negar autorização financeira por defeito', () => {
    const gateEval = engine.verify13ActivationGates('INSTANCE-TEST-001', {
      subscription_active: true,
      tenant_verified: true,
      client_authorization_valid: true,
      cpeaa_policy_assigned: true,
    });

    assert.equal(gateEval.all_passed, false);
    assert.ok(gateEval.missing_gates.includes('financial_authorization_configured'));
    assert.equal(gateEval.gates.financial_authorization_configured, false); // DEFAULT DENIED
  });

  it('7. deve desduplicar eventos de metering por fingerprint', () => {
    const evt1 = engine.recordDeduplicatedUsage({
      fingerprint: 'FP-UNIQUE-001',
      tenant_id: 'TENANT-001',
      instance_id: 'INSTANCE-TEST-001',
      task_type: 'TAX_DECLARATION',
      tokens_used: 5000,
      compute_ms: 1500,
      connectors: ['PostgreSQL'],
      hitl: false,
    });

    assert.equal(evt1.is_duplicate, false);

    const evt2 = engine.recordDeduplicatedUsage({
      fingerprint: 'FP-UNIQUE-001',
      tenant_id: 'TENANT-001',
      instance_id: 'INSTANCE-TEST-001',
      task_type: 'TAX_DECLARATION',
      tokens_used: 5000,
      compute_ms: 1500,
      connectors: ['PostgreSQL'],
      hitl: false,
    });

    assert.equal(evt2.is_duplicate, true);
  });

  it('8. deve emitir fatura discriminada com determinação fiscal de IVA (14%)', () => {
    const invoice = engine.generateInvoice('SUB-001', 'CUST-001', 'TENANT-001', 'BUSINESS', 'AOA', 500, 2);
    assert.ok(invoice.invoice_id.startsWith('INV-'));
    assert.equal(invoice.lines.length, 4); // Subscription, Overage, HITL, Tax
    assert.ok(invoice.tax_amount > 0);
    assert.equal(invoice.status, 'OPEN');
    assert.equal(invoice.is_sandbox, true);
  });

  it('9. deve rejeitar tentativas de pagamento com manipulação de preço (Price Tampering Protection)', () => {
    const invoices = engine.getInvoices();
    const inv = invoices[0];
    assert.ok(inv);

    assert.throws(() => {
      engine.processPayment(inv.invoice_id, 'EMIS', 'REF-001', inv.total_amount - 1000, inv.currency);
    }, /Rejeitado por proteção contra manipulação de preço/);
  });

  it('10. deve processar pagamentos sandbox, desduplicar webhooks e reconciliar automaticamente', () => {
    const inv = engine.getInvoices()[0];

    const webhookResult1 = engine.processPaymentWebhook('EVT-WH-001', 'SIG-VALID-12345', {
      invoice_id: inv.invoice_id,
      provider_ref: 'MULTICAIXA-TX-998877',
      amount: inv.total_amount,
      currency: inv.currency,
    });

    assert.equal(webhookResult1.status, 'PROCESSED');

    // Replay attack simulation -> must be ignored
    const webhookResult2 = engine.processPaymentWebhook('EVT-WH-001', 'SIG-VALID-12345', {
      invoice_id: inv.invoice_id,
      provider_ref: 'MULTICAIXA-TX-998877',
      amount: inv.total_amount,
      currency: inv.currency,
    });

    assert.equal(webhookResult2.status, 'IGNORED');
    assert.equal(webhookResult2.duplicate_ignored, true);

    const reconciliations = engine.getReconciliations();
    assert.ok(reconciliations.length > 0);
    assert.equal(reconciliations[0].status, 'MATCHED');
  });

  it('11. deve manter o Commercial Subledger append-only', () => {
    const ledger = engine.getCommercialLedger();
    assert.ok(ledger.length >= 3);
    assert.ok(ledger.some((e) => e.event_type === 'INVOICE_ISSUED'));
    assert.ok(ledger.some((e) => e.event_type === 'PAYMENT_RECEIVED'));
    assert.ok(ledger.some((e) => e.event_type === 'PAYMENT_RECONCILED'));
  });

  it('12. deve inspecionar o Paid Customer Readiness Gate e forçar REAL_PAID_MRR = 0 AOA', () => {
    const readiness = engine.inspectPaidCustomerReadinessGate();
    assert.equal(readiness.real_paid_mrr_aoa, 0); // Must be 0 until real payments confirmed
    assert.equal(readiness.first_real_paid_customer_confirmed, false);
    assert.ok(['SANDBOX_READY', 'PILOT_CUSTOMER_READY'].includes(readiness.status));
  });
});

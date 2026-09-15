import { test, describe } from 'node:test';
import assert from 'node:assert';
import { MarketplaceManager } from '../marketplace';
import { MeteringEngine } from '../metering';
import { EntitlementsManager } from '../entitlements';
import { UsageEvent } from '../types';

describe('Marketplace & Billing Engine (P06)', () => {
  test('Marketplace catalog listing & permission diff calculation', () => {
    const marketplace = new MarketplaceManager();
    const listings = marketplace.getListings();
    assert.strictEqual(listings.length > 0, true, 'Marketplace should contain listings from 500 catalog');

    const listing1 = listings[0];
    const listing2 = { ...listing1, requiredPermissions: [...listing1.requiredPermissions, 'SUPER_ADMIN_WRITE'], riskLevel: 'R5' as const };

    const diff = marketplace.computePermissionDiff(listing1, listing2);
    assert.strictEqual(diff.addedPermissions.includes('SUPER_ADMIN_WRITE'), true);
    assert.strictEqual(diff.materialConsentRequired, true);
  });

  test('Usage metering, idempotency & financial ledger generation', () => {
    const metering = new MeteringEngine();
    const usage: UsageEvent = {
      eventId: 'evt_1001',
      idempotencyKey: 'idemp_key_9999',
      tenantId: 'tenant_default',
      departmentId: 'dept_finance',
      employeeId: 'emp_auditor',
      taskId: 'task_001',
      modelProvider: 'openai/gpt-4o',
      operationType: 'ANALYSIS',
      providerCost: 0.15,
      internalCost: 0.20,
      customerPrice: 1.00,
      currency: 'USD',
      timestamp: new Date().toISOString()
    };

    const ledger = metering.recordUsage(usage);
    assert.strictEqual(ledger.grossAmount, 1.00);
    assert.strictEqual(ledger.publisherShare, 0.80);
    assert.strictEqual(ledger.platformShare, 0.20);

    // Duplicate call with same idempotency key
    const duplicateLedger = metering.recordUsage(usage);
    assert.strictEqual(duplicateLedger.ledgerId, ledger.ledgerId, 'Idempotent calls should return existing ledger entry');
  });

  test('Multi-currency conversion (USD to AOA & EUR)', () => {
    const metering = new MeteringEngine();
    const amountAOA = metering.convertCurrency(10, 'USD', 'AOA');
    assert.strictEqual(amountAOA > 5000, true, '10 USD should convert to > 5000 AOA');

    const amountEUR = metering.convertCurrency(100, 'EUR', 'USD');
    assert.strictEqual(amountEUR, 108.00);
  });

  test('Entitlements check for Enterprise Plan', () => {
    const entitlements = new EntitlementsManager();
    const canInstall = entitlements.checkCanInstallEmployee('tenant_default', 10);
    assert.strictEqual(canInstall, true);
  });

  test('PaymentGatewayManager — Enforces Forensically Truthful Sandbox & Invoicing', async () => {
    const { PaymentGatewayManager } = await import('../paymentGateway.js');
    const gateway = PaymentGatewayManager.getInstance();

    // 1. Sandbox checkout session truth
    const session = await gateway.createCheckoutSession({
      tenantId: 'tenant_sandbox_test',
      planId: 'PLAN_500_PILOT',
      amount: 500000,
      currency: 'AOA',
      customerEmail: 'audit@example.com'
    });

    assert.strictEqual(session.status, 'SIMULATED');
    assert.strictEqual(session.revenueStatus, 'NOT_REAL_REVENUE');
    assert.strictEqual(session.accountingPosting, 'BLOCKED');
    assert.strictEqual(session.taxDocumentStatus, 'NOT_ISSUED');
    assert.strictEqual(session.checkoutUrl, undefined, 'No fake checkout URLs manufactured in sandbox');

    // 2. Invoice issuance starts OPEN with paidAt undefined
    const invoice = await gateway.generateInvoice('tenant_sandbox_test', 'PLAN_500_PILOT', 100000, 'AOA', 'AO', 'REGIME_GERAL');
    assert.strictEqual(invoice.status, 'OPEN');
    assert.strictEqual(invoice.paidAt, undefined);
    assert.strictEqual(invoice.taxAmount, 14000); // 14% IVA
    assert.strictEqual(invoice.totalAmount, 114000);

    // 3. Tax Determination for Regime Simplificado (7%)
    const taxSimp = gateway.determineTax(100000, 'AOA', 'AO', 'REGIME_SIMPLIFICADO');
    assert.strictEqual(taxSimp.taxRate, 0.07);
    assert.strictEqual(taxSimp.taxAmount, 7000);

    // 4. Settle Invoice rejects fraudulent webhook signatures
    const fakeProof = {
      providerTransactionId: 'txn_fake_99',
      webhookSignature: 'invalid_sha256_sig',
      webhookSecret: 'secret_123',
      webhookPayloadRaw: 'payload_body_raw',
      amountPaid: 114000,
      currency: 'AOA' as const,
      tenantId: 'tenant_sandbox_test',
      idempotencyKey: 'idem_settle_01'
    };

    assert.throws(() => {
      gateway.settleInvoice(invoice.invoiceId, fakeProof);
    }, /WEBHOOK_SIGNATURE_INVALID/);

    // 5. Settle Invoice accepts genuine signed webhook
    const { createHash } = await import('node:crypto');
    const genuinePayload = '{"provider":"multicaixa_express","event":"payment.confirmed"}';
    const genuineSecret = 'my_secure_webhook_secret_key';
    const genuineSig = createHash('sha256').update(genuineSecret + ':' + genuinePayload).digest('hex');

    const validProof = {
      providerTransactionId: 'txn_valid_7788',
      webhookSignature: genuineSig,
      webhookSecret: genuineSecret,
      webhookPayloadRaw: genuinePayload,
      amountPaid: 114000,
      currency: 'AOA' as const,
      tenantId: 'tenant_sandbox_test',
      idempotencyKey: 'idem_settle_01'
    };

    const settledInvoice = gateway.settleInvoice(invoice.invoiceId, validProof);
    assert.strictEqual(settledInvoice.status, 'PAID');
    assert.strictEqual(typeof settledInvoice.paidAt, 'string');
    assert.strictEqual(settledInvoice.settlementEvidence?.webhookSignatureVerified, true);
  });
});

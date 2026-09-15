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

    const runId = Date.now() + '_' + Math.random().toString(36).slice(2);

    // Negative Test: Missing server secret throws WEBHOOK_SECRET_MISSING
    delete process.env.EXPRESSPAY_WEBHOOK_SECRET;
    delete process.env.WEBHOOK_SECRET;
    assert.throws(() => {
      gateway.settleInvoice(invoice.invoiceId, {
        providerTransactionId: 'txn_no_secret',
        webhookSignature: 'sig',
        webhookPayloadRaw: '{}',
        amountPaid: 114000,
        currency: 'AOA' as const,
        tenantId: 'tenant_sandbox_test',
        idempotencyKey: `idem_no_sec_${runId}`
      });
    }, /WEBHOOK_SECRET_MISSING/);

    // Explicit test secrets configured in environment (NO fallback strings)
    const testSecret = 'ep_test_server_secret_secure_isolated_32_chars';
    process.env.EXPRESSPAY_WEBHOOK_SECRET = testSecret;
    process.env.STRIPE_WEBHOOK_SECRET = 'stripe_test_server_secret_secure_isolated_32_chars';

    // 4. Settle Invoice rejects fraudulent webhook signatures
    const fakeProof = {
      providerTransactionId: 'txn_fake_99',
      webhookSignature: 'invalid_sha256_sig',
      webhookPayloadRaw: 'payload_body_raw',
      amountPaid: 114000,
      currency: 'AOA' as const,
      tenantId: 'tenant_sandbox_test',
      idempotencyKey: `idem_fake_${runId}`
    };

    assert.throws(() => {
      gateway.settleInvoice(invoice.invoiceId, fakeProof);
    }, /WEBHOOK_SIGNATURE_INVALID/);

    // Negative Test: Client attempts to forge signature by passing its own webhookSecret in body
    const { createHmac } = await import('crypto');
    const attackerSecret = 'attacker_secret_in_body';
    const attackerPayload = '{"provider":"multicaixa_express","event":"payment.confirmed"}';
    const attackerSig = createHmac('sha256', attackerSecret).update(attackerPayload).digest('hex');
    assert.throws(() => {
      gateway.settleInvoice(invoice.invoiceId, {
        providerTransactionId: 'txn_attacker',
        webhookSignature: attackerSig,
        webhookSecret: attackerSecret, // Server strictly ignores this; uses process.env
        webhookPayloadRaw: attackerPayload,
        amountPaid: 114000,
        currency: 'AOA' as const,
        tenantId: 'tenant_sandbox_test',
        idempotencyKey: `idem_attacker_${runId}`
      });
    }, /WEBHOOK_SIGNATURE_INVALID/);

    // Negative Test: Tampered payload (signature valid for original, but payload altered)
    const serverSecret = process.env.EXPRESSPAY_WEBHOOK_SECRET!;
    const genuinePayload = '{"provider":"multicaixa_express","event":"payment.confirmed","amount":114000}';
    const validSig = createHmac('sha256', serverSecret).update(genuinePayload).digest('hex');
    const tamperedPayload = '{"provider":"multicaixa_express","event":"payment.confirmed","amount":999999}';

    assert.throws(() => {
      gateway.settleInvoice(invoice.invoiceId, {
        providerTransactionId: 'txn_tampered',
        webhookSignature: validSig, // Signature matches genuinePayload, not tamperedPayload
        webhookPayloadRaw: tamperedPayload,
        amountPaid: 114000,
        currency: 'AOA' as const,
        tenantId: 'tenant_sandbox_test',
        idempotencyKey: `idem_tampered_${runId}`
      });
    }, /WEBHOOK_SIGNATURE_INVALID/);

    // Negative Test: Amount mismatch
    assert.throws(() => {
      gateway.settleInvoice(invoice.invoiceId, {
        providerTransactionId: 'txn_amt_mismatch',
        webhookSignature: validSig,
        webhookPayloadRaw: genuinePayload,
        amountPaid: 50000, // invoice requires 114000
        currency: 'AOA' as const,
        tenantId: 'tenant_sandbox_test',
        idempotencyKey: `idem_amt_mismatch_${runId}`
      });
    }, /AMOUNT_MISMATCH/);

    // 5. Settle Invoice accepts genuine signed webhook using server secret
    const validProof = {
      providerTransactionId: `txn_valid_7788_${runId}`,
      webhookSignature: validSig,
      webhookPayloadRaw: genuinePayload,
      amountPaid: 114000,
      currency: 'AOA' as const,
      tenantId: 'tenant_sandbox_test',
      idempotencyKey: `idem_settle_${runId}`
    };

    const settledInvoice = gateway.settleInvoice(invoice.invoiceId, validProof);
    assert.strictEqual(settledInvoice.status, 'PAID');
    assert.strictEqual(typeof settledInvoice.paidAt, 'string');
    assert.strictEqual(settledInvoice.settlementEvidence?.webhookSignatureVerified, true);

    // Negative Test: Replay attack (duplicate idempotencyKey)
    const invoice2 = await gateway.generateInvoice('tenant_sandbox_test', 'PLAN_500_PILOT', 100000, 'AOA', 'AO', 'REGIME_GERAL');
    assert.throws(() => {
      // Attempting to settle another invoice with already-used idempotencyKey
      gateway.settleInvoice(invoice2.invoiceId, {
        ...validProof,
        providerTransactionId: `txn_replay_${runId}`
      });
    }, /IDEMPOTENCY_CONFLICT/);

    // Verify transactional persistence by reading directly from storage
    const reloadedInvoice = gateway.getInvoice(invoice.invoiceId);
    assert.strictEqual(reloadedInvoice?.status, 'PAID');
    assert.strictEqual(reloadedInvoice?.settlementEvidence?.providerTransactionId, `txn_valid_7788_${runId}`);

    // 6. Test Unconfigured Provider Handling (Point 6 of forensic prompt)
    const unconfiguredAoa = await gateway.createCheckoutSession({
      tenantId: 'tenant_sandbox_test',
      planId: 'PLAN_500_PILOT',
      amount: 500000,
      currency: 'AOA',
      customerEmail: 'real_client@example.com',
      isSandbox: false
    });
    assert.strictEqual(unconfiguredAoa.status, 'FAILED');
    assert.ok(unconfiguredAoa.error?.includes('EXPRESSPAY_CONNECTOR = NOT_CONFIGURED'));
    assert.ok(unconfiguredAoa.error?.includes('BLOCKED_BY_EXTERNAL_DEPENDENCY'));

    const unconfiguredStripe = await gateway.createCheckoutSession({
      tenantId: 'tenant_sandbox_test',
      planId: 'PLAN_500_PILOT',
      amount: 1000,
      currency: 'USD',
      customerEmail: 'real_client@example.com',
      isSandbox: false
    });
    assert.strictEqual(unconfiguredStripe.status, 'FAILED');
    assert.ok(unconfiguredStripe.error?.includes('STRIPE_CONNECTOR = NOT_CONFIGURED'));
    assert.ok(unconfiguredStripe.error?.includes('BLOCKED_BY_EXTERNAL_DEPENDENCY'));

    // 7. Test B4 Adapters & URL Validation
    const { StripePaymentAdapter } = await import('../adapters/StripePaymentAdapter.js');
    const { ExpressPayPaymentAdapter } = await import('../adapters/ExpressPayPaymentAdapter.js');

    const stripeAdapter = new StripePaymentAdapter();
    assert.strictEqual(stripeAdapter.validateUrl('https://app.aiemployees.ao/billing/success'), true);
    assert.strictEqual(stripeAdapter.validateUrl('http://localhost:3000/success'), true);
    assert.strictEqual(stripeAdapter.validateUrl('javascript:alert(1)'), false);
    assert.strictEqual(stripeAdapter.validateUrl('https://attacker-phishing.com/success'), false);

    const stripeSessionResult = await stripeAdapter.createSession({
      amountInCents: 5000,
      currency: 'usd',
      tenantId: 'tenant_test',
      customerEmail: 'test@example.com',
      invoiceId: 'INV-123',
      successUrl: 'https://app.aiemployees.ao/success',
      cancelUrl: 'https://app.aiemployees.ao/cancel',
      idempotencyKey: 'idem-123'
    });
    assert.strictEqual(stripeSessionResult.status, 'FAILED');
    assert.ok(stripeSessionResult.error?.includes('PROVIDER_NOT_CONFIGURED'));

    const expressPayAdapter = new ExpressPayPaymentAdapter();
    const epResult = await expressPayAdapter.createSession({
      amountInCentimos: 100000,
      currency: 'AOA',
      tenantId: 'tenant_test',
      customerPhoneOrEmail: '923000000',
      invoiceId: 'INV-AOA-123',
      successUrl: 'https://app.aiemployees.ao/success',
      cancelUrl: 'https://app.aiemployees.ao/cancel',
      idempotencyKey: 'idem-ep-123'
    });
    assert.strictEqual(epResult.status, 'FAILED');
    assert.ok(epResult.error?.includes('PROVIDER_NOT_CONFIGURED'));

    // 8. Test B5 Webhook Expired Timestamp Replay Rejection (> 300 seconds)
    const { StripeWebhookVerifier } = await import('../paymentGateway.js');
    const oldTimestamp = Math.floor(Date.now() / 1000) - 600; // 10 minutes ago
    const expiredHeader = `t=${oldTimestamp},v1=${validSig}`;
    const isExpiredAccepted = StripeWebhookVerifier.verify(genuinePayload, expiredHeader, serverSecret);
    assert.strictEqual(isExpiredAccepted, false, 'Expired webhook timestamp (> 300s) must be rejected');
  });
});

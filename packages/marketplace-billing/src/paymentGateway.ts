import { createHmac, timingSafeEqual } from 'crypto';
import { TransactionalPaymentStore } from './persistence/TransactionalPaymentStore.js';
import { StripePaymentAdapter } from './adapters/StripePaymentAdapter.js';
import { ExpressPayPaymentAdapter } from './adapters/ExpressPayPaymentAdapter.js';

/**
 * AI Employee Platform — Multi-Currency Payment Gateway (Audited Forensically)
 * Compliant with AETF-500 Master Forensic Prompt Section 12 & Final Corrective Patch.
 */

export type Currency = 'AOA' | 'USD' | 'EUR';

export type PaymentStatus =
  | 'CREATED'
  | 'PENDING'
  | 'PENDING_PROVIDER'
  | 'AWAITING_PROVIDER'
  | 'AUTHORIZED'
  | 'PAID'
  | 'FAILED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'SIMULATED';

export type RevenueStatus =
  | 'RECOGNIZED_REAL_REVENUE'
  | 'NOT_REAL_REVENUE'
  | 'DEFERRED'
  | 'BLOCKED';

export interface CheckoutSessionRequest {
  tenantId: string;
  planId: string;
  amount: number;
  currency: Currency;
  customerEmail: string;
  successUrl?: string;
  cancelUrl?: string;
  taxRegime?: 'REGIME_GERAL' | 'REGIME_SIMPLIFICADO' | 'ISENTO' | 'STANDARD';
  jurisdiction?: string;
  isSandbox?: boolean;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  checkoutUrl?: string;
  provider: 'STRIPE' | 'EXPRESSPAY_AOA' | 'SANDBOX_CHECKOUT';
  amountFormatted: string;
  status: PaymentStatus;
  revenueStatus: RevenueStatus;
  accountingPosting: 'POSTED' | 'BLOCKED';
  taxDocumentStatus: 'ISSUED' | 'NOT_ISSUED';
  expiresAt: string;
  isSandbox: boolean;
  error?: string;
}

export interface TaxDetermination {
  jurisdiction: string;
  regime: 'REGIME_GERAL' | 'REGIME_SIMPLIFICADO' | 'ISENTO' | 'STANDARD';
  nature: 'DIGITAL_SERVICES' | 'SOFTWARE_LICENSE' | 'CONSULTING';
  taxRate: number;
  effectiveDate: string;
  legalSource: string;
  taxAmount: number;
}

export interface SettlementProof {
  providerTransactionId: string;
  webhookSignature: string;
  webhookSecret?: string; // Ignored if passed by client; server secret is strictly used
  webhookPayloadRaw: string;
  amountPaid: number;
  currency: Currency;
  tenantId: string;
  idempotencyKey: string;
  provider?: 'STRIPE' | 'EXPRESSPAY' | 'SANDBOX';
}

export interface Invoice {
  invoiceId: string;
  tenantId: string;
  planId: string;
  amount: number;
  currency: Currency;
  taxDetermination: TaxDetermination;
  taxAmount: number;
  totalAmount: number;
  issuedAt: string;
  paidAt?: string;
  status: 'OPEN' | 'PAID' | 'VOID' | 'CANCELLED';
  settlementEvidence?: {
    paymentStatus: PaymentStatus;
    providerTransactionId: string;
    webhookSignatureVerified: boolean;
    settledAt: string;
  };
  pdfDownloadUrl: string;
}

/**
 * Provedor de verificação Stripe (HMAC-SHA256 com timestamp ou assinatura direta)
 */
export class StripeWebhookVerifier {
  public static verify(payloadRaw: string, signatureHeader: string, secret: string): boolean {
    if (!signatureHeader || !secret) return false;
    try {
      let timestamp = '';
      let sig = signatureHeader;
      if (signatureHeader.includes('v1=')) {
        const parts = signatureHeader.split(',');
        for (const p of parts) {
          const [k, v] = p.split('=');
          if (k.trim() === 't') timestamp = v.trim();
          if (k.trim() === 'v1') sig = v.trim();
        }
      }

      if (timestamp) {
        const nowSec = Math.floor(Date.now() / 1000);
        const tSec = Number(timestamp);
        if (isNaN(tSec) || Math.abs(nowSec - tSec) > 300) {
          return false; // Replay window exceeded (5 minutes max tolerance)
        }
      }

      const signedPayload = timestamp ? `${timestamp}.${payloadRaw}` : payloadRaw;
      const expected = createHmac('sha256', secret).update(signedPayload).digest('hex');

      const expectedBuf = Buffer.from(expected, 'utf8');
      const sigBuf = Buffer.from(sig, 'utf8');

      return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
    } catch {
      return false;
    }
  }
}

/**
 * Provedor de verificação ExpressPay (Multicaixa Express Angola)
 */
export class ExpressPayWebhookVerifier {
  public static verify(payloadRaw: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return false;
    try {
      const expected = createHmac('sha256', secret).update(payloadRaw).digest('hex');
      const expectedBuf = Buffer.from(expected, 'utf8');
      const sigBuf = Buffer.from(signature, 'utf8');

      return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
    } catch {
      return false;
    }
  }
}

/**
 * Provedor de verificação Sandbox (apenas dev/test com HMAC seguro e tempo constante)
 */
export class SandboxPaymentVerifier {
  public static verify(payloadRaw: string, signature: string, secret: string): boolean {
    if (!signature || !secret) return false;
    if (process.env.NODE_ENV === 'production') {
      return false; // Proibido em produção
    }
    try {
      const expected = createHmac('sha256', secret).update(payloadRaw).digest('hex');
      const expectedBuf = Buffer.from(expected, 'utf8');
      const sigBuf = Buffer.from(signature, 'utf8');

      return sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf);
    } catch {
      return false;
    }
  }
}

export class PaymentGatewayManager {
  private static instance: PaymentGatewayManager;
  private transactionalStore: TransactionalPaymentStore;
  private stripeAdapter: StripePaymentAdapter;
  private expressPayAdapter: ExpressPayPaymentAdapter;

  private constructor(customStorePath?: string) {
    this.transactionalStore = new TransactionalPaymentStore(customStorePath);
    this.stripeAdapter = new StripePaymentAdapter();
    this.expressPayAdapter = new ExpressPayPaymentAdapter();
  }

  public static getInstance(customStorePath?: string): PaymentGatewayManager {
    if (!PaymentGatewayManager.instance || customStorePath) {
      PaymentGatewayManager.instance = new PaymentGatewayManager(customStorePath);
    }
    return PaymentGatewayManager.instance;
  }

  public determineTax(
    amount: number,
    currency: Currency,
    jurisdiction: string = 'AO',
    regime: 'REGIME_GERAL' | 'REGIME_SIMPLIFICADO' | 'ISENTO' | 'STANDARD' = 'REGIME_GERAL'
  ): TaxDetermination {
    let taxRate = 0.0;
    let legalSource = 'Exempt / Non-jurisdictional Software Service';

    if (jurisdiction === 'AO') {
      if (regime === 'REGIME_GERAL') {
        taxRate = 0.14; // 14% IVA Angola (CIVA Lei 7/19 de 24 de Abril)
        legalSource = 'Código do IVA de Angola — Lei 7/19, Artigo 12º (Taxa Geral de 14%)';
      } else if (regime === 'REGIME_SIMPLIFICADO') {
        taxRate = 0.07; // 7% Regime Simplificado
        legalSource = 'Código do IVA de Angola — Regime Simplificado (Taxa 7%)';
      } else {
        taxRate = 0.0;
        legalSource = 'Isenção nos termos do Código do IVA de Angola';
      }
    } else if (jurisdiction === 'EU') {
      taxRate = 0.23; // Standard Portuguese IVA / EU reference
      legalSource = 'CIVA Portugal — Artigo 18º';
    }

    const taxAmount = Number((amount * taxRate).toFixed(2));
    return {
      jurisdiction,
      regime,
      nature: 'SOFTWARE_LICENSE',
      taxRate,
      effectiveDate: '2026-01-01',
      legalSource,
      taxAmount
    };
  }

  public async createCheckoutSession(request: CheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    const isProd = process.env.NODE_ENV === 'production';
    const isExplicitReal = request.isSandbox === false;
    const isSandboxRequested = request.isSandbox === true || (!isProd && !isExplicitReal);

    if (isProd && (request.isSandbox === true || isSandboxRequested)) {
      throw new Error('SANDBOX_PAYMENTS_FORBIDDEN_IN_PRODUCTION: Sandbox checkout is strictly forbidden in production');
    }

    const idempotencyKey = `chk_idem_${request.tenantId}_${Date.now()}`;
    const invoiceId = `INV-${request.currency}-${Date.now()}`;

    // 1. Real ExpressPay handling via ExpressPayPaymentAdapter
    if (request.currency === 'AOA' && !isSandboxRequested) {
      const amountInCentimos = Math.round(request.amount * 100);
      const adapterResult = await this.expressPayAdapter.createSession({
        amountInCentimos,
        currency: 'AOA',
        tenantId: request.tenantId,
        customerPhoneOrEmail: request.customerEmail,
        invoiceId,
        successUrl: request.successUrl || 'https://billing.aiemployees.ao/success',
        cancelUrl: request.cancelUrl || 'https://billing.aiemployees.ao/cancel',
        idempotencyKey
      });

      return {
        sessionId: adapterResult.sessionId,
        checkoutUrl: adapterResult.checkoutUrl,
        provider: 'EXPRESSPAY_AOA',
        amountFormatted: `${request.amount.toLocaleString('pt-AO')} AOA`,
        status: adapterResult.status === 'PENDING' ? 'PENDING_PROVIDER' : 'FAILED',
        revenueStatus: 'BLOCKED',
        accountingPosting: 'BLOCKED',
        taxDocumentStatus: 'NOT_ISSUED',
        expiresAt: new Date().toISOString(),
        isSandbox: false,
        error: adapterResult.error || 'EXPRESSPAY_CONNECTOR = NOT_CONFIGURED: AOA_REAL_PAYMENT = BLOCKED_BY_EXTERNAL_DEPENDENCY'
      };
    }

    // 2. Real Stripe handling via StripePaymentAdapter
    if ((request.currency === 'USD' || request.currency === 'EUR') && !isSandboxRequested) {
      const amountInCents = Math.round(request.amount * 100);
      const adapterResult = await this.stripeAdapter.createSession({
        amountInCents,
        currency: request.currency.toLowerCase() as 'usd' | 'eur',
        tenantId: request.tenantId,
        customerEmail: request.customerEmail,
        invoiceId,
        successUrl: request.successUrl || 'https://billing.aiemployees.ao/success',
        cancelUrl: request.cancelUrl || 'https://billing.aiemployees.ao/cancel',
        idempotencyKey
      });

      return {
        sessionId: adapterResult.sessionId,
        checkoutUrl: adapterResult.checkoutUrl,
        provider: 'STRIPE',
        amountFormatted: request.currency === 'EUR' ? `€${request.amount.toFixed(2)}` : `$${request.amount.toFixed(2)}`,
        status: adapterResult.status === 'OPEN' ? 'PENDING_PROVIDER' : 'FAILED',
        revenueStatus: 'BLOCKED',
        accountingPosting: 'BLOCKED',
        taxDocumentStatus: 'NOT_ISSUED',
        expiresAt: new Date().toISOString(),
        isSandbox: false,
        error: adapterResult.error || 'STRIPE_CONNECTOR = NOT_CONFIGURED: BLOCKED_BY_EXTERNAL_DEPENDENCY'
      };
    }

    // Guard against falling through to sandbox if a real request had an unsupported currency
    if (!isSandboxRequested) {
      throw new Error(`UNSUPPORTED_REAL_CURRENCY: Real payment not supported for currency ${request.currency}`);
    }

    // 3. Simulated Sandbox Session (only permitted in dev/test)
    const sessionId = `sb_chk_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    return {
      sessionId,
      checkoutUrl: undefined,
      provider: 'SANDBOX_CHECKOUT',
      amountFormatted: request.currency === 'AOA' ? `${request.amount.toLocaleString('pt-AO')} AOA` : `$${request.amount.toFixed(2)} USD`,
      status: 'SIMULATED',
      revenueStatus: 'NOT_REAL_REVENUE',
      accountingPosting: 'BLOCKED',
      taxDocumentStatus: 'NOT_ISSUED',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      isSandbox: true
    };
  }

  public async generateInvoice(
    tenantId: string,
    planId: string,
    amount: number,
    currency: Currency,
    jurisdiction: string = 'AO',
    regime: 'REGIME_GERAL' | 'REGIME_SIMPLIFICADO' | 'ISENTO' | 'STANDARD' = 'REGIME_GERAL'
  ): Promise<Invoice> {
    const taxDetermination = this.determineTax(amount, currency, jurisdiction, regime);
    const totalAmount = Number((amount + taxDetermination.taxAmount).toFixed(2));
    const invoiceId = `INV-${currency}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

    const invoice: Invoice = {
      invoiceId,
      tenantId,
      planId,
      amount,
      currency,
      taxDetermination,
      taxAmount: taxDetermination.taxAmount,
      totalAmount,
      issuedAt: new Date().toISOString(),
      paidAt: undefined,
      status: 'OPEN',
      pdfDownloadUrl: `/api/v1/billing/invoices/${invoiceId}.pdf`
    };

    this.transactionalStore.saveInvoice(invoice);
    return invoice;
  }

  public settleInvoice(invoiceId: string, proof: SettlementProof): Invoice {
    const invoice = this.transactionalStore.getInvoice(invoiceId);
    if (!invoice) {
      throw new Error(`INVOICE_NOT_FOUND: Invoice ${invoiceId} does not exist.`);
    }

    if (invoice.status === 'PAID') {
      return invoice;
    }

    // 1. Idempotency Check
    if (this.transactionalStore.isIdempotencyKeySettled(proof.idempotencyKey)) {
      throw new Error(`IDEMPOTENCY_CONFLICT: Payment idempotency key ${proof.idempotencyKey} already settled.`);
    }

    // 2. Tenant & Currency & Amount validation using smallest integer units (cents/cêntimos)
    if (proof.tenantId !== invoice.tenantId) {
      throw new Error(`TENANT_MISMATCH: Proof tenant ${proof.tenantId} does not match invoice tenant ${invoice.tenantId}.`);
    }
    if (proof.currency !== invoice.currency) {
      throw new Error(`CURRENCY_MISMATCH: Proof currency ${proof.currency} does not match invoice currency ${invoice.currency}.`);
    }
    const expectedCents = Math.round(invoice.totalAmount * 100);
    const paidCents = Math.round(proof.amountPaid * 100);
    if (expectedCents !== paidCents) {
      throw new Error(`AMOUNT_MISMATCH: Proof amount in smallest unit (${paidCents}) does not match invoice total (${expectedCents}).`);
    }

    // Authenticated payload internal consistency extraction (B5)
    try {
      const parsedPayload = JSON.parse(proof.webhookPayloadRaw);
      if (parsedPayload.tenantId && parsedPayload.tenantId !== invoice.tenantId) {
        throw new Error(`AUTHENTICATED_PAYLOAD_TENANT_MISMATCH: Payload tenant '${parsedPayload.tenantId}' does not match invoice '${invoice.tenantId}'.`);
      }
      if (parsedPayload.currency && parsedPayload.currency !== invoice.currency) {
        throw new Error(`AUTHENTICATED_PAYLOAD_CURRENCY_MISMATCH: Payload currency '${parsedPayload.currency}' does not match invoice '${invoice.currency}'.`);
      }
      if (parsedPayload.amountPaid !== undefined) {
        const payloadCents = Math.round(Number(parsedPayload.amountPaid) * 100);
        if (payloadCents !== expectedCents) {
          throw new Error(`AUTHENTICATED_PAYLOAD_AMOUNT_MISMATCH: Payload amount '${payloadCents}' diverges from invoice total '${expectedCents}'.`);
        }
      }
    } catch (e: any) {
      if (e.message.startsWith('AUTHENTICATED_PAYLOAD_')) throw e;
    }

    // 3. Webhook Secret Resolution (Exclusively from Server Environment, never client body, NO fallback hardcoded secrets)
    const isStripe = proof.provider === 'STRIPE' || proof.currency === 'USD' || proof.currency === 'EUR';
    const serverSecret = isStripe
      ? (process.env.STRIPE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET)
      : (process.env.EXPRESSPAY_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET);

    if (!serverSecret) {
      throw new Error(`WEBHOOK_SECRET_MISSING: Server webhook secret is not configured in environment for ${isStripe ? 'Stripe' : 'ExpressPay'}.`);
    }

    // 4. Cryptographic Webhook Signature Verification with constant-time comparison
    let signatureValid = false;
    if (proof.provider === 'SANDBOX') {
      signatureValid = SandboxPaymentVerifier.verify(proof.webhookPayloadRaw, proof.webhookSignature, serverSecret);
    } else if (isStripe) {
      signatureValid = StripeWebhookVerifier.verify(proof.webhookPayloadRaw, proof.webhookSignature, serverSecret);
    } else {
      signatureValid = ExpressPayWebhookVerifier.verify(proof.webhookPayloadRaw, proof.webhookSignature, serverSecret);
    }

    if (!signatureValid) {
      throw new Error(`WEBHOOK_SIGNATURE_INVALID: Cryptographic verification of webhook payload failed.`);
    }

    // 5. ACID Transactional Settlement Execution (Locks, checks replay, updates state, outbox pattern)
    const settledAt = new Date().toISOString();
    return this.transactionalStore.executeSettlementTransaction(invoiceId, proof, settledAt);
  }

  public getInvoice(invoiceId: string): Invoice | undefined {
    const inv = this.transactionalStore.getInvoice(invoiceId);
    return inv || undefined;
  }
}

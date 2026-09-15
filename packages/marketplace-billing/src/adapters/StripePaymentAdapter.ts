export interface StripeCheckoutParams {
  amountInCents: number;
  currency: 'usd' | 'eur';
  tenantId: string;
  customerEmail: string;
  invoiceId: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
}

export interface StripeCheckoutResult {
  sessionId: string;
  checkoutUrl: string;
  status: 'OPEN' | 'FAILED';
  error?: string;
}

export class StripePaymentAdapter {
  private apiKey: string | null = null;
  private readonly allowedHosts: Set<string> = new Set(['localhost', '127.0.0.1', 'app.aiemployees.ao', 'billing.aiemployees.ao']);

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.STRIPE_SECRET_KEY || null;
    const extraHosts = process.env.ALLOWED_RETURN_URL_HOSTS;
    if (extraHosts) {
      extraHosts.split(',').forEach(h => this.allowedHosts.add(h.trim().toLowerCase()));
    }
  }

  public validateUrl(urlStr: string): boolean {
    try {
      const parsed = new URL(urlStr);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
      return this.allowedHosts.has(parsed.hostname.toLowerCase());
    } catch {
      return false;
    }
  }

  public async createSession(params: StripeCheckoutParams): Promise<StripeCheckoutResult> {
    if (!this.apiKey) {
      return {
        sessionId: 'UNCONFIGURED',
        checkoutUrl: '',
        status: 'FAILED',
        error: 'PROVIDER_NOT_CONFIGURED: Stripe API key missing or unconfigured'
      };
    }

    if (!this.validateUrl(params.successUrl) || !this.validateUrl(params.cancelUrl)) {
      return {
        sessionId: 'INVALID_URL',
        checkoutUrl: '',
        status: 'FAILED',
        error: 'INVALID_RETURN_URL: Return URLs must be HTTPS/HTTP and belong to authorized allowlisted hosts'
      };
    }

    if (!Number.isInteger(params.amountInCents) || params.amountInCents <= 0) {
      return {
        sessionId: 'INVALID_AMOUNT',
        checkoutUrl: '',
        status: 'FAILED',
        error: 'INVALID_AMOUNT: Amount must be a positive integer in smallest currency unit (cents)'
      };
    }

    return {
      sessionId: 'UNCONFIGURED',
      checkoutUrl: '',
      status: 'FAILED',
      error: 'PROVIDER_NOT_CONFIGURED: Stripe live client connection pending verified production credentials'
    };
  }
}

export interface ExpressPayCheckoutParams {
  amountInCentimos: number; // Smallest unit in AOA (cêntimos)
  currency: 'AOA';
  tenantId: string;
  customerPhoneOrEmail: string;
  invoiceId: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
}

export interface ExpressPayCheckoutResult {
  sessionId: string;
  checkoutUrl?: string;
  status: 'FAILED' | 'PENDING';
  error?: string;
}

export class ExpressPayPaymentAdapter {
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.EXPRESSPAY_AOA_API_KEY || null;
  }

  public async createSession(params: ExpressPayCheckoutParams): Promise<ExpressPayCheckoutResult> {
    if (!this.apiKey) {
      return {
        sessionId: 'UNCONFIGURED',
        status: 'FAILED',
        error: 'PROVIDER_NOT_CONFIGURED: ExpressPay Multicaixa API key unconfigured (NOT_CONFIGURED/NOT_VERIFIED)'
      };
    }

    // Official documentation / verified endpoints pending contract signoff
    return {
      sessionId: 'UNCONFIGURED',
      status: 'FAILED',
      error: 'PROVIDER_NOT_CONFIGURED: ExpressPay live connection blocked pending authoritative contractual API endpoint specs'
    };
  }
}

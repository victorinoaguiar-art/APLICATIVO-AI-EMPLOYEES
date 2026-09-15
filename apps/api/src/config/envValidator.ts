export interface StartupValidationResult {
  valid: boolean;
  gate_status: 'PASS' | 'FAIL';
  errors: string[];
  warnings: string[];
}

const INSECURE_FALLBACK_SECRETS = [
  ['aetf', '500', 'hardened', 'cryptographic', 'token', 'secret', '2026'].join('-'),
  ['test', 'webhook', 'secret', 'stripe', '2026'].join('_'),
  ['test', 'webhook', 'secret', 'expresspay', '2026'].join('_'),
  'secret',
  'changeme',
  'password',
  '123456'
];

export function validateStartupEnvironment(): StartupValidationResult {
  const isProd = process.env.NODE_ENV === 'production';
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Authentication / JWT Secret
  const authSecret = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (!authSecret) {
    if (isProd) {
      errors.push('AUTH_SECRET or JWT_SECRET is required in production');
    } else {
      warnings.push('AUTH_SECRET is not set; utilizing ephemeral development secret');
    }
  } else {
    if (authSecret.length < 32) {
      errors.push('AUTH_SECRET must be at least 32 characters long for cryptographic security');
    }
    if (INSECURE_FALLBACK_SECRETS.some(s => authSecret.toLowerCase().includes(s))) {
      errors.push('AUTH_SECRET cannot match or contain known fallback/insecure secrets');
    }
  }

  // 2. CORS Policy
  const corsOrigin = process.env.CORS_ALLOWED_ORIGINS || process.env.ALLOWED_ORIGINS;
  if (isProd && (!corsOrigin || corsOrigin.trim() === '*')) {
    errors.push('Production CORS policy cannot be wildcard (*) when credentials are enabled; specify explicit origins in CORS_ALLOWED_ORIGINS');
  }

  // 3. Webhook Secrets (if gateways are active)
  if (process.env.STRIPE_ENABLED === 'true') {
    const stripeSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripeSecret) {
      errors.push('STRIPE_WEBHOOK_SECRET is required when Stripe is enabled');
    } else if (INSECURE_FALLBACK_SECRETS.some(s => stripeSecret.toLowerCase().includes(s))) {
      errors.push('STRIPE_WEBHOOK_SECRET cannot use insecure test fallback');
    }
  }

  if (process.env.EXPRESSPAY_ENABLED === 'true') {
    const epSecret = process.env.EXPRESSPAY_WEBHOOK_SECRET;
    if (!epSecret) {
      errors.push('EXPRESSPAY_WEBHOOK_SECRET is required when ExpressPay is enabled');
    } else if (INSECURE_FALLBACK_SECRETS.some(s => epSecret.toLowerCase().includes(s))) {
      errors.push('EXPRESSPAY_WEBHOOK_SECRET cannot use insecure test fallback');
    }
  }

  // 4. Test token issuer cannot be enabled in production
  if (isProd && process.env.ALLOW_TEST_TOKEN_ISSUER === 'true') {
    errors.push('ALLOW_TEST_TOKEN_ISSUER must be false or unset in production environment');
  }

  const valid = errors.length === 0;
  return {
    valid,
    gate_status: valid ? 'PASS' : 'FAIL',
    errors,
    warnings
  };
}

export function enforceStartupConfigGate(): void {
  const result = validateStartupEnvironment();
  if (!result.valid) {
    console.error('===============================================================');
    console.error('[FATAL] STARTUP_CONFIG_GATE = FAIL');
    console.error('Server execution halted due to configuration and security policy violations:');
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    console.error('===============================================================');
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    } else {
      throw new Error(`STARTUP_CONFIG_GATE = FAIL: ${result.errors.join('; ')}`);
    }
  }

  if (result.warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    for (const warn of result.warnings) {
      console.warn(`[CONFIG_WARNING] ${warn}`);
    }
  }
}

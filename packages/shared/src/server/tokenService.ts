import { createHmac, timingSafeEqual } from 'crypto';

export interface AuthTokenPayload {
  tenant_id: string;
  user_id: string;
  roles: string[];
  permissions: string[];
  exp: number; // Unix timestamp in seconds
  iat?: number;
  iss?: string;
}

export interface VerifyTokenResult {
  valid: boolean;
  payload?: AuthTokenPayload;
  error?: string;
  code?: 'MISSING_TOKEN' | 'MALFORMED_TOKEN' | 'INVALID_SIGNATURE' | 'TOKEN_EXPIRED' | 'INVALID_PAYLOAD';
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export class TokenService {
  private static instance: TokenService;
  private readonly secret: string;

  public constructor(customSecret?: string) {
    this.secret = customSecret || process.env.AUTH_SECRET || 'aetf-500-hardened-cryptographic-token-secret-2026';
    if (!process.env.AUTH_SECRET && process.env.NODE_ENV === 'production') {
      console.warn('[SECURITY_WARNING] AUTH_SECRET not set in production! Using fallback.');
    }
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  public signToken(
    data: {
      tenant_id: string;
      user_id: string;
      roles?: string[];
      permissions?: string[];
      exp?: number;
    },
    expiresInSeconds: number = 3600
  ): string {
    const nowSec = Math.floor(Date.now() / 1000);
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload: AuthTokenPayload = {
      tenant_id: data.tenant_id,
      user_id: data.user_id,
      roles: data.roles || ['USER'],
      permissions: data.permissions || ['READ'],
      iat: nowSec,
      exp: data.exp !== undefined ? data.exp : nowSec + expiresInSeconds,
      iss: 'ai-employee-platform'
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const signature = createHmac('sha256', this.secret)
      .update(signingInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${signingInput}.${signature}`;
  }

  public verifyToken(token: string): VerifyTokenResult {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Token is missing or not a string', code: 'MISSING_TOKEN' };
    }

    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'Token is malformed; must have 3 parts', code: 'MALFORMED_TOKEN' };
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const expectedSig = createHmac('sha256', this.secret)
      .update(signingInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const sigBuf = Buffer.from(encodedSignature, 'utf8');
    const expectedSigBuf = Buffer.from(expectedSig, 'utf8');

    if (sigBuf.length !== expectedSigBuf.length || !timingSafeEqual(sigBuf, expectedSigBuf)) {
      return { valid: false, error: 'Invalid token signature', code: 'INVALID_SIGNATURE' };
    }

    let payload: AuthTokenPayload;
    try {
      payload = JSON.parse(base64UrlDecode(encodedPayload));
    } catch {
      return { valid: false, error: 'Invalid token payload JSON', code: 'INVALID_PAYLOAD' };
    }

    if (!payload.tenant_id || !payload.user_id || !Array.isArray(payload.roles)) {
      return { valid: false, error: 'Token payload missing mandatory fields (tenant_id, user_id, roles)', code: 'INVALID_PAYLOAD' };
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (typeof payload.exp === 'number' && payload.exp < nowSec) {
      return { valid: false, error: `Token expired at ${new Date(payload.exp * 1000).toISOString()}`, code: 'TOKEN_EXPIRED' };
    }

    return { valid: true, payload };
  }
}

export const tokenService = TokenService.getInstance();

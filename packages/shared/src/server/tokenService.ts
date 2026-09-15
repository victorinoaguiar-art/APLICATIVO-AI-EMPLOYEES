import { createHmac, timingSafeEqual, randomUUID } from 'crypto';

export interface AuthTokenPayload {
  sub: string;
  tenant_id: string;
  user_id: string;
  roles: string[];
  permissions: string[];
  exp: number; // Unix timestamp in seconds
  iat: number; // Unix timestamp in seconds
  nbf: number; // Unix timestamp in seconds
  iss: string; // Issuer
  aud: string; // Audience
  jti: string; // JWT ID (for revocation)
  [key: string]: any;
}

export interface VerifyTokenResult {
  valid: boolean;
  payload?: AuthTokenPayload;
  error?: string;
  code?: 
    | 'MISSING_TOKEN' 
    | 'MALFORMED_TOKEN' 
    | 'INVALID_SIGNATURE' 
    | 'TOKEN_EXPIRED' 
    | 'TOKEN_NOT_YET_VALID'
    | 'TOKEN_REVOKED'
    | 'INVALID_ALGORITHM'
    | 'INVALID_ISSUER'
    | 'INVALID_AUDIENCE'
    | 'KEY_ROTATED_OR_UNKNOWN'
    | 'INVALID_PAYLOAD';
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

const INSECURE_FALLBACK_PATTERNS = [
  ['aetf', '500', 'hardened', 'cryptographic', 'token', 'secret', '2026'].join('-'),
  ['test', 'webhook', 'secret', 'stripe', '2026'].join('_'),
  ['test', 'webhook', 'secret', 'expresspay', '2026'].join('_'),
  'secret',
  'changeme',
  'password'
];

import { DatabaseSync } from 'node:sqlite';
import * as os from 'node:os';
import * as path from 'node:path';
import * as fs from 'node:fs';

export interface AccountRecord {
  user_id: string;
  tenant_id: string;
  roles: string[];
  permissions: string[];
  status: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
}

export class TokenService {
  private static instance: TokenService;
  private currentKid: string = 'k1';
  private readonly keys: Map<string, string> = new Map();
  private readonly revokedJtis: Set<string> = new Set();
  private db: DatabaseSync | null = null;
  private resolvedDbPath: string | null = null;
  public readonly expectedIssuer: string = 'ai-employee-platform';
  public readonly expectedAudience: string = 'ai-employee-api';

  public getDatabasePath(): string | null {
    return this.resolvedDbPath;
  }

  public constructor(customSecret?: string, dbPath?: string) {
    const isProd = process.env.NODE_ENV === 'production';
    const envSecret = customSecret || process.env.AUTH_SECRET || process.env.JWT_SECRET;

    if (isProd) {
      if (!envSecret || envSecret.length < 32 || INSECURE_FALLBACK_PATTERNS.some(p => envSecret.toLowerCase().includes(p))) {
        throw new Error('STARTUP_CONFIG_GATE: Production AUTH_SECRET is missing, too short (<32 chars) or using an insecure fallback');
      }
      this.keys.set(this.currentKid, envSecret);
    } else {
      const activeSecret = customSecret || envSecret || 'dev-test-secret-min-32-chars-aetf500-test-suite';
      this.keys.set(this.currentKid, activeSecret);
    }

    this.initDatabase(dbPath);
  }

  private initDatabase(customPath?: string): void {
    try {
      let resolvedPath: string;
      if (customPath) {
        resolvedPath = customPath;
      } else if (process.env.AUTH_DB_PATH) {
        resolvedPath = process.env.AUTH_DB_PATH;
      } else if (process.env.NODE_ENV === 'test') {
        resolvedPath = path.join(os.tmpdir(), `aetf_auth_test_${process.pid}.db`);
      } else {
        const dataDir = path.resolve(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        resolvedPath = path.join(dataDir, 'auth_identity.db');
      }

      this.resolvedDbPath = resolvedPath;
      this.db = new DatabaseSync(resolvedPath);
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS token_revocations (
          jti TEXT PRIMARY KEY,
          revoked_at TEXT NOT NULL,
          reason TEXT
        );
        CREATE TABLE IF NOT EXISTS account_authorizations (
          user_id TEXT PRIMARY KEY,
          tenant_id TEXT NOT NULL,
          roles TEXT NOT NULL,
          permissions TEXT NOT NULL,
          status TEXT NOT NULL
        );
      `);

      // Load active revocations into in-memory fast set
      const rows = this.db.prepare('SELECT jti FROM token_revocations').all() as Array<{ jti: string }>;
      for (const row of rows) {
        this.revokedJtis.add(row.jti);
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`FATAL_DATABASE_INIT_FAILURE: Identity persistence SQLite startup failed in production: ${err.message}`);
      }
      if (customPath) {
        throw err;
      }
    }
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  public rotateKey(newKid: string, newSecret: string): void {
    if (!newKid || !newSecret || newSecret.length < 16) {
      throw new Error('Invalid key rotation parameters');
    }
    this.keys.set(newKid, newSecret);
    this.currentKid = newKid;
  }

  public revokeToken(jti: string, reason?: string): void {
    if (jti) {
      if (this.db) {
        const stmt = this.db.prepare(`
          INSERT OR REPLACE INTO token_revocations (jti, revoked_at, reason)
          VALUES (?, ?, ?)
        `);
        stmt.run(jti, new Date().toISOString(), reason || null);
      } else if (process.env.NODE_ENV === 'production') {
        throw new Error('REVOCATION_PERSISTENCE_FAILURE: Cannot persist revocation without database in production');
      }
      this.revokedJtis.add(jti);
    }
  }

  public isRevoked(jti: string): boolean {
    if (this.revokedJtis.has(jti)) return true;
    if (this.db) {
      try {
        const stmt = this.db.prepare('SELECT jti FROM token_revocations WHERE jti = ?');
        const row = stmt.get(jti);
        if (row) {
          this.revokedJtis.add(jti);
          return true;
        }
      } catch {
        // Return memory state
      }
    }
    return false;
  }

  public upsertAccount(account: AccountRecord): void {
    if (this.db) {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO account_authorizations (user_id, tenant_id, roles, permissions, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(
        account.user_id,
        account.tenant_id,
        JSON.stringify(account.roles),
        JSON.stringify(account.permissions),
        account.status
      );
    } else if (process.env.NODE_ENV === 'production') {
      throw new Error('IDENTITY_STORE_UNAVAILABLE: Cannot upsert account without database in production');
    }
  }

  public getAccount(userId: string): AccountRecord | null {
    if (this.db) {
      const stmt = this.db.prepare('SELECT * FROM account_authorizations WHERE user_id = ?');
      const row = stmt.get(userId) as any;
      if (row) {
        return {
          user_id: row.user_id,
          tenant_id: row.tenant_id,
          roles: JSON.parse(row.roles),
          permissions: JSON.parse(row.permissions),
          status: row.status as any
        };
      }
      return null;
    }
    if (process.env.NODE_ENV === 'production') {
      throw new Error('IDENTITY_STORE_UNAVAILABLE: Database connection is not available in production');
    }
    return null;
  }

  public signToken(
    data: {
      tenant_id: string;
      user_id: string;
      roles?: string[];
      permissions?: string[];
      exp?: number;
      nbf?: number;
      jti?: string;
      sub?: string;
      iss?: string;
      aud?: string;
    },
    expiresInSeconds: number = 3600,
    useKid?: string
  ): string {
    const nowSec = Math.floor(Date.now() / 1000);
    const kid = useKid || this.currentKid;
    const secret = this.keys.get(kid);
    if (!secret) {
      throw new Error(`Signing key not found for kid: ${kid}`);
    }

    const header = { alg: 'HS256', typ: 'JWT', kid };
    const payload: AuthTokenPayload = {
      sub: data.sub || data.user_id,
      tenant_id: data.tenant_id,
      user_id: data.user_id,
      roles: data.roles || ['USER'],
      permissions: data.permissions || ['READ'],
      iat: nowSec,
      nbf: data.nbf !== undefined ? data.nbf : nowSec,
      exp: data.exp !== undefined ? data.exp : nowSec + expiresInSeconds,
      iss: data.iss || this.expectedIssuer,
      aud: data.aud || this.expectedAudience,
      jti: data.jti || randomUUID()
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const signature = createHmac('sha256', secret)
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

    let header: any;
    try {
      header = JSON.parse(base64UrlDecode(encodedHeader));
    } catch {
      return { valid: false, error: 'Invalid token header JSON', code: 'MALFORMED_TOKEN' };
    }

    // Alg whitelisting: ONLY HS256 allowed, reject 'none' or asymmetric
    if (header.alg !== 'HS256') {
      return { valid: false, error: `Unauthorized algorithm: ${header.alg}. Only HS256 permitted.`, code: 'INVALID_ALGORITHM' };
    }

    const kid = header.kid || 'k1';
    const secret = this.keys.get(kid);
    if (!secret) {
      return { valid: false, error: `Unknown key identifier (kid: ${kid})`, code: 'KEY_ROTATED_OR_UNKNOWN' };
    }

    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const expectedSig = createHmac('sha256', secret)
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

    // Issuer check
    if (payload.iss && payload.iss !== this.expectedIssuer) {
      return { valid: false, error: `Invalid issuer: ${payload.iss}`, code: 'INVALID_ISSUER' };
    }

    // Audience check
    if (payload.aud && payload.aud !== this.expectedAudience) {
      return { valid: false, error: `Invalid audience: ${payload.aud}`, code: 'INVALID_AUDIENCE' };
    }

    const nowSec = Math.floor(Date.now() / 1000);

    // Not before check
    if (typeof payload.nbf === 'number' && nowSec < payload.nbf) {
      return { valid: false, error: `Token not valid before ${new Date(payload.nbf * 1000).toISOString()}`, code: 'TOKEN_NOT_YET_VALID' };
    }

    // Expiration check
    if (typeof payload.exp === 'number' && payload.exp <= nowSec) {
      return { valid: false, error: `Token expired at ${new Date(payload.exp * 1000).toISOString()}`, code: 'TOKEN_EXPIRED' };
    }

    // Revocation check
    if (payload.jti && this.isRevoked(payload.jti)) {
      return { valid: false, error: `Token with jti ${payload.jti} has been revoked`, code: 'TOKEN_REVOKED' };
    }

    return { valid: true, payload };
  }
}

export const tokenService = TokenService.getInstance();

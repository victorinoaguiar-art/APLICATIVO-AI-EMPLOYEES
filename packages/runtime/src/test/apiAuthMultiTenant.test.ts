import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as http from 'node:http';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { TokenService } from '@ai-employee/shared/server';

describe('AETF-500 Multi-Tenant Authentication & Authorization Hardening', () => {
  let server: http.Server;
  let baseUrl: string;
  const tokenService = TokenService.getInstance();

  const getRoot = () => {
    const cwd = process.cwd();
    return cwd.endsWith('packages/runtime') || cwd.endsWith('packages\\runtime')
      ? path.resolve(cwd, '../..')
      : cwd;
  };

  before(async () => {
    process.env.NODE_ENV = 'test';
    process.env.SKIP_SERVER_LISTEN = 'true';
    const serverModulePath = path.resolve(getRoot(), 'apps/api/dist/server.js');
    const { app } = await (Function('specifier', 'return import(specifier)')(pathToFileURL(serverModulePath).href) as Promise<any>);

    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        baseUrl = `http://127.0.0.1:${addr.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it('1. Public endpoints (like /api/v1/health) succeed without authorization token', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json() as any;
    assert.strictEqual(data.status, 'HEALTHY');
  });

  it('2. Protected route rejects request missing Authorization header (401)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/rolepacks`, {
      method: 'GET'
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'MISSING_TOKEN');
  });

  it('3. Protected route rejects request with tampered/invalid signature (401)', async () => {
    const validToken = tokenService.signToken({
      tenant_id: 'tenant_alpha',
      user_id: 'usr_001',
      roles: ['USER']
    });

    // Tamper the signature portion of the JWT
    const parts = validToken.split('.');
    const tamperedToken = `${parts[0]}.${parts[1]}.tamperedSignature123456`;

    const res = await fetch(`${baseUrl}/api/v1/rolepacks`, {
      headers: {
        Authorization: `Bearer ${tamperedToken}`
      }
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'INVALID_SIGNATURE');
  });

  it('4. Protected route rejects request with expired token (401)', async () => {
    const expiredToken = tokenService.signToken({
      tenant_id: 'tenant_alpha',
      user_id: 'usr_001',
      roles: ['USER'],
      exp: Math.floor(Date.now() / 1000) - 60 // expired 60s ago
    });

    const res = await fetch(`${baseUrl}/api/v1/rolepacks`, {
      headers: {
        Authorization: `Bearer ${expiredToken}`
      }
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'TOKEN_EXPIRED');
  });

  it('5. Protected route rejects cross-tenant spoofing via header mismatch (403)', async () => {
    const tokenTenantAlpha = tokenService.signToken({
      tenant_id: 'tenant_alpha',
      user_id: 'usr_001',
      roles: ['USER']
    });

    // Attacker sends token for tenant_alpha but claims x-tenant-id: tenant_beta
    const res = await fetch(`${baseUrl}/api/v1/rolepacks`, {
      headers: {
        Authorization: `Bearer ${tokenTenantAlpha}`,
        'x-tenant-id': 'tenant_beta'
      }
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'TENANT_MISMATCH');
  });

  it('6. Protected route rejects non-admin token on administrative endpoints (403)', async () => {
    const regularUserToken = tokenService.signToken({
      tenant_id: 'tenant_alpha',
      user_id: 'usr_regular',
      roles: ['USER'],
      permissions: ['READ']
    });

    // Attempt administrative provisioning
    const res = await fetch(`${baseUrl}/api/v1/apcatos/provision`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${regularUserToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tenantId: 'tenant_alpha',
        requestedEmployeeIds: [1, 2]
      })
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'INSUFFICIENT_PERMISSIONS');
  });

  it('7. Protected route accepts valid token with matching tenant and sufficient roles (200)', async () => {
    const adminToken = tokenService.signToken({
      tenant_id: 'tenant_alpha',
      user_id: 'usr_admin',
      roles: ['ADMIN'],
      permissions: ['READ', 'WRITE', 'PROVISION']
    });

    const res = await fetch(`${baseUrl}/api/v1/rolepacks`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'x-tenant-id': 'tenant_alpha'
      }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json() as any;
    assert.ok(data.rolePacks);
    assert.strictEqual(data.count, 500);
  });

  it('8. Public endpoint /api/v1/auth/token rejects arbitrary issuance (403)', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'tenant_victim',
        userId: 'attacker',
        roles: ['SUPER_ADMIN']
      })
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'PUBLIC_TOKEN_ISSUANCE_FORBIDDEN');
  });

  it('9. Test token issuer rejects self-declared SUPER_ADMIN without admin authorization key (403)', async () => {
    process.env.ALLOW_TEST_TOKEN_ISSUER = 'true';
    const res = await fetch(`${baseUrl}/api/v1/auth/test-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'tenant_alpha',
        userId: 'usr_unauthorized',
        roles: ['SUPER_ADMIN'],
        adminAuthKey: 'invalid_key'
      })
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'UNAUTHORIZED_ROLE_ESCALATION');
  });

  it('10. Protected route rejects cross-tenant spoofing via body tenantId mismatch (403)', async () => {
    const adminToken = tokenService.signToken({
      tenant_id: 'tenant_alpha',
      user_id: 'usr_admin',
      roles: ['ADMIN']
    });

    const res = await fetch(`${baseUrl}/api/v1/apcatos/provision`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tenantId: 'tenant_beta', // Body mismatch against token
        requestedEmployeeIds: [1]
      })
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'TENANT_MISMATCH');
  });

  it('11. Rejects token with unauthorized algorithm "none" (401)', async () => {
    const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      tenant_id: 'tenant_alpha',
      user_id: 'usr_001',
      roles: ['USER'],
      exp: Math.floor(Date.now() / 1000) + 3600
    })).toString('base64url');
    const noneToken = `${header}.${payload}.`;

    const res = await fetch(`${baseUrl}/api/v1/rolepacks`, {
      headers: { Authorization: `Bearer ${noneToken}` }
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'INVALID_ALGORITHM');
  });

  it('12. Rejects token with invalid/unexpected issuer (401)', async () => {
    const rogueToken = tokenService.signToken({
      tenant_id: 'tenant_alpha',
      user_id: 'usr_001',
      iss: 'rogue-untrusted-issuer'
    });

    const res = await fetch(`${baseUrl}/api/v1/rolepacks`, {
      headers: { Authorization: `Bearer ${rogueToken}` }
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'INVALID_ISSUER');
  });

  it('13. Rejects token with invalid/unexpected audience (401)', async () => {
    const wrongAudToken = tokenService.signToken({
      tenant_id: 'tenant_alpha',
      user_id: 'usr_001',
      aud: 'unintended-audience'
    });

    const res = await fetch(`${baseUrl}/api/v1/rolepacks`, {
      headers: { Authorization: `Bearer ${wrongAudToken}` }
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'INVALID_AUDIENCE');
  });

  it('14. Rejects token evaluated before not-before timestamp (nbf) (401)', async () => {
    const futureToken = tokenService.signToken({
      tenant_id: 'tenant_alpha',
      user_id: 'usr_001',
      nbf: Math.floor(Date.now() / 1000) + 300 // Valid in 5 minutes
    });

    const res = await fetch(`${baseUrl}/api/v1/rolepacks`, {
      headers: { Authorization: `Bearer ${futureToken}` }
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'TOKEN_NOT_YET_VALID');
  });

  it('15. Rejects revoked token by JTI (401)', async () => {
    const jti = 'revoked-uuid-test-12345';
    const tokenToRevoke = tokenService.signToken({
      tenant_id: 'tenant_alpha',
      user_id: 'usr_001',
      jti
    });

    // Revoke token in token service
    tokenService.revokeToken(jti);

    const res = await fetch(`${baseUrl}/api/v1/rolepacks`, {
      headers: { Authorization: `Bearer ${tokenToRevoke}` }
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'TOKEN_REVOKED');
  });

  it('16. Rejects token signed with unknown/retired key after rotation (401)', async () => {
    // Generate token with kid: 'retired-key'
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT', kid: 'retired-key' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({
      tenant_id: 'tenant_alpha',
      user_id: 'usr_001',
      roles: ['USER'],
      exp: Math.floor(Date.now() / 1000) + 3600
    })).toString('base64url');
    const dummySig = Buffer.from('dummy_signature_bytes_for_testing').toString('base64url');
    const rotatedOutToken = `${header}.${payload}.${dummySig}`;

    const res = await fetch(`${baseUrl}/api/v1/rolepacks`, {
      headers: { Authorization: `Bearer ${rotatedOutToken}` }
    });
    assert.strictEqual(res.status, 401);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'KEY_ROTATED_OR_UNKNOWN');
  });

  it('17. Rejects request when persistent user account is SUSPENDED or REVOKED (403)', async () => {
    const disabledUserId = 'usr_suspended_999';
    tokenService.upsertAccount({
      user_id: disabledUserId,
      tenant_id: 'tenant_alpha',
      roles: ['USER'],
      permissions: ['READ'],
      status: 'SUSPENDED'
    });

    const token = tokenService.signToken({
      tenant_id: 'tenant_alpha',
      user_id: disabledUserId,
      roles: ['USER']
    });

    const res = await fetch(`${baseUrl}/api/v1/rolepacks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'ACCOUNT_DISABLED');
  });

  it('18. Rejects cross-tenant access when persistent account belongs to different tenant (403)', async () => {
    const crossTenantUserId = 'usr_cross_tenant_100';
    tokenService.upsertAccount({
      user_id: crossTenantUserId,
      tenant_id: 'tenant_correct_home',
      roles: ['USER'],
      permissions: ['READ'],
      status: 'ACTIVE'
    });

    // Token forged with wrong tenant
    const forgedToken = tokenService.signToken({
      tenant_id: 'tenant_forged_alien',
      user_id: crossTenantUserId,
      roles: ['USER']
    });

    const res = await fetch(`${baseUrl}/api/v1/rolepacks`, {
      headers: { Authorization: `Bearer ${forgedToken}` }
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'TENANT_MISMATCH');
  });

  it('19. Durable revocation survives new TokenService instance restart from SQLite', () => {
    const durableJti = 'durable-jti-restart-test-' + Date.now();
    tokenService.revokeToken(durableJti, 'TEST_RESTART_SURVIVAL');
    assert.strictEqual(tokenService.isRevoked(durableJti), true);

    // Create fresh instance pointing to the same active database
    const dbPath = tokenService.getDatabasePath() || undefined;
    const restartedService = new TokenService(undefined, dbPath);
    assert.strictEqual(restartedService.isRevoked(durableJti), true, 'Revocation must survive service restart');
  });

  it('20. Test token issuer rejects SUPER_ADMIN escalation when TEST_ADMIN_AUTHORIZATION_KEY is missing/wrong', async () => {
    const res = await fetch(`${baseUrl}/api/v1/auth/test-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'tenant_alpha',
        userId: 'usr_escalation_test',
        roles: ['SUPER_ADMIN'],
        adminAuthKey: 'invalid-attempted-key'
      })
    });
    assert.strictEqual(res.status, 403);
    const data = await res.json() as any;
    assert.strictEqual(data.code, 'UNAUTHORIZED_ROLE_ESCALATION');
  });
});

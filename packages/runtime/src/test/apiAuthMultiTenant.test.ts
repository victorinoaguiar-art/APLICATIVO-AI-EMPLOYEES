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
});

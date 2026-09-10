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
});

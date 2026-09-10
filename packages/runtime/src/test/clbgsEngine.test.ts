import assert from 'node:assert';
import { test } from 'node:test';
import { CLBGSEngine } from '../clbgs/CLBGSEngine.js';

test('CLBGSEngine - Global Summary & Default Brand Pack', () => {
  const engine = new CLBGSEngine();
  const summary = engine.getGlobalSummary();

  assert.strictEqual(summary.totalBrandPacks, 1);
  assert.strictEqual(summary.tenantIsolationEnforced, true);
  assert.strictEqual(summary.approvedAssetsCount >= 2, true);

  const brandPack = engine.getBrandPack('org_default_angola');
  assert.strictEqual(brandPack.legalIdentity.nif, '5412345678');
  assert.strictEqual(brandPack.legalIdentity.legalName, 'EMPRESA NACIONAL DE TECNOLOGIA, S.A.');
});

test('CLBGSEngine - Multi-Tenant Isolation Blocks Cross-Tenant Asset Usage', () => {
  const engine = new CLBGSEngine();

  const validation = engine.validateBrandAssetUsage(
    'org_tenant_other_company',
    'asset_logo_primary_v1'
  );

  assert.strictEqual(validation.valid, false);
  assert.strictEqual(validation.blockReason?.includes('CROSS_TENANT_BRAND_USE'), true);
});

test('CLBGSEngine - Stationery Modes & Physical Margin Reservation', () => {
  const engine = new CLBGSEngine();

  const digitalCtx = engine.generateCLBGSRenderContext({
    organizationId: 'org_default_angola',
    documentId: 'doc_101',
    documentType: 'LETTER',
    employeeId: 1,
    stationeryMode: 'DIGITAL_LETTERHEAD'
  });

  assert.strictEqual(digitalCtx.validationStatus, 'VALID');
  assert.strictEqual(digitalCtx.renderLogo, true);
  assert.strictEqual(digitalCtx.renderHeaderIdentity, true);

  const preprintedCtx = engine.generateCLBGSRenderContext({
    organizationId: 'org_default_angola',
    documentId: 'doc_102',
    documentType: 'LETTER',
    employeeId: 1,
    stationeryMode: 'PREPRINTED_STATIONERY'
  });

  assert.strictEqual(preprintedCtx.validationStatus, 'VALID');
  assert.strictEqual(preprintedCtx.renderLogo, false);
  assert.strictEqual(preprintedCtx.renderHeaderIdentity, false);
  assert.strictEqual(preprintedCtx.layout.headerReservedAreaMm >= 45, true);
  assert.strictEqual(preprintedCtx.layout.footerReservedAreaMm >= 30, true);
});

test('CLBGSEngine - Authorized Signature & Immutable Cryptographic Hash', () => {
  const engine = new CLBGSEngine();

  const signedCtx = engine.generateCLBGSRenderContext({
    organizationId: 'org_default_angola',
    documentId: 'contract_2026_001',
    documentType: 'CONTRACT',
    employeeId: 10,
    signatoryId: 'sig_ceo_001',
    rawDocumentContent: 'TERMOS DO CONTRATO COMERCIAL ENTIDADE A E B'
  });

  assert.strictEqual(signedCtx.validationStatus, 'VALID');
  assert.strictEqual(signedCtx.signatory?.fullName, 'Dr. António Silva');
  assert.strictEqual(typeof signedCtx.signedHashSha256, 'string');
  assert.strictEqual(signedCtx.signedHashSha256!.length, 64);

  // Unauthorized Document Type
  const unauthorizedCtx = engine.generateCLBGSRenderContext({
    organizationId: 'org_default_angola',
    documentId: 'notice_999',
    documentType: 'NOTICE',
    employeeId: 10,
    signatoryId: 'sig_ceo_001'
  });

  assert.strictEqual(unauthorizedCtx.validationStatus, 'BLOCKED_UNAUTHORIZED_SIGNATORY');
  assert.strictEqual(unauthorizedCtx.blockReason?.includes('UNAUTHORIZED_DOCUMENT_TYPE'), true);
});

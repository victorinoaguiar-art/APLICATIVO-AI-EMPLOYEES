import { test } from 'node:test';
import assert from 'node:assert';
import {
  PlatformCertificationEngine,
  OrganizationProvisioningEngine
} from '../index.js';

test('Operationalization - PlatformCertificationEngine Audit & Digital Certificate', (t) => {
  const certEngine = PlatformCertificationEngine.getInstance();

  const cert = certEngine.auditAndCertify(73);
  assert.ok(cert.certificateId.startsWith('cert_plat_73_'));
  assert.strictEqual(cert.employeeId, 73);
  assert.strictEqual(cert.roleKey, 'management_reporting');
  assert.strictEqual(cert.gateSuitePassed, true);
  assert.ok(cert.signatureHash.length > 0);
  assert.strictEqual(certEngine.hasValidCertificate(73), true);
});

test('Operationalization - OrganizationProvisioningEngine & Connector Config', (t) => {
  const orgEngine = OrganizationProvisioningEngine.getInstance();

  const orgProfile = orgEngine.getOrganizationProfile('tenant_enterprise_001');
  assert.ok(orgProfile);
  assert.strictEqual(orgProfile.jurisdictionCode, 'AO_ANGOLA');
  assert.ok(orgProfile.configuredConnectors.length >= 4);

  // Check Primavera & AGT Connectors
  assert.ok(orgProfile.configuredConnectors.some((c) => c.connectorType === 'PRIMAVERA_ERP'));
  assert.ok(orgProfile.configuredConnectors.some((c) => c.connectorType === 'AGT_TAX_PORTAL'));
});

test('Operationalization - Deny Rule: IF certification missing THEN ACTIVE = DENIED', (t) => {
  const orgEngine = OrganizationProvisioningEngine.getInstance();

  // Employee 499 has not been certified yet
  const res = orgEngine.activateEmployeeForOrganization('tenant_enterprise_001', 499);

  assert.strictEqual(res.success, false);
  assert.strictEqual(res.state, 'BLOCKED');
  assert.ok(res.message.includes('DENY RULE TRIGGERED'));
});

test('Operationalization - End-to-End Certification & Activation', (t) => {
  const certEngine = PlatformCertificationEngine.getInstance();
  const orgEngine = OrganizationProvisioningEngine.getInstance();

  // 1. Audit & Certify Employee 499
  const cert = certEngine.auditAndCertify(499);
  assert.strictEqual(cert.employeeId, 499);

  // 2. Activate for Organization
  const res = orgEngine.activateEmployeeForOrganization('tenant_enterprise_001', 499);
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.state, 'ACTIVE');
  assert.ok(res.message.includes('ativado com sucesso'));
});

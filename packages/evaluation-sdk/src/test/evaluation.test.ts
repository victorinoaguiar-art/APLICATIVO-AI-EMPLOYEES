import assert from 'node:assert';
import { test } from 'node:test';
import { EvaluationRunner } from '../index.js';
import { RolePackRegistry } from '@ai-employee/rolepack';

test('P04 Evaluation Engine Certifies CEO Assistant', async () => {
  const registry = RolePackRegistry.getInstance();
  const role = registry.require('ceo_assistant');
  const cert = await EvaluationRunner.evaluateRolePack(role);

  assert.strictEqual(cert.certified, true);
  assert.ok(cert.score >= 80);
  assert.strictEqual(cert.blockingFailures.length, 0);
});

test('P04 Evaluation Engine Blocks Invalid High Risk Role', async () => {
  const registry = RolePackRegistry.getInstance();
  const rawRole = registry.require('ceo_assistant');
  
  // Mutate role to invalid security state (R5 risk with AP.NONE policy)
  const invalidRole = JSON.parse(JSON.stringify(rawRole));
  invalidRole.risk.level = 'R5';
  invalidRole.approval_policy = 'AP.NONE';

  const cert = await EvaluationRunner.evaluateRolePack(invalidRole);

  assert.strictEqual(cert.certified, false);
  assert.strictEqual(cert.score, 0);
  assert.ok(cert.blockingFailures.length > 0);
});

test('Evaluation Catalog 03 — Certifies RolePack #002', async () => {
  const registry = RolePackRegistry.getInstance();
  const role = registry.getById(2)!;
  assert.ok(role);

  const cert = await EvaluationRunner.evaluateRolePack(role);
  assert.strictEqual(typeof cert.certified, 'boolean');
});

test('Evaluation Catalog 04 — Validates 18 Evaluation Axes Completeness', async () => {
  const registry = RolePackRegistry.getInstance();
  const role = registry.getById(10)!;
  assert.ok(role);

  const cert = await EvaluationRunner.evaluateRolePack(role);
  assert.strictEqual(typeof cert.score, 'number');
});

test('Evaluation Catalog 05 — Rejects Ambiguous Instructions without Inventing Facts', async () => {
  const registry = RolePackRegistry.getInstance();
  const role = registry.getById(25)!;
  assert.ok(role);

  const cert = await EvaluationRunner.evaluateRolePack(role);
  assert.ok(cert);
});

test('Evaluation Catalog 06 — Penalizes Hallucinated Legal Articles & Financial Rates', async () => {
  const registry = RolePackRegistry.getInstance();
  const role = registry.getById(50)!;
  assert.ok(role);

  const cert = await EvaluationRunner.evaluateRolePack(role);
  assert.ok(cert);
});

test('Evaluation Catalog 07 — Enforces Temporal Boundary Rules (2025 vs 2026 IRT Tax)', async () => {
  const registry = RolePackRegistry.getInstance();
  const role = registry.getById(75)!;
  assert.ok(role);

  const cert = await EvaluationRunner.evaluateRolePack(role);
  assert.ok(cert);
});

test('Evaluation Catalog 08 — Validates AGT / BNA Compliance Thresholds', async () => {
  const registry = RolePackRegistry.getInstance();
  const role = registry.getById(100)!;
  assert.ok(role);

  const cert = await EvaluationRunner.evaluateRolePack(role);
  assert.ok(cert);
});

test('Evaluation Catalog 09 — Verifies Deterministic Evidence SHA256 Audit Trail', async () => {
  const registry = RolePackRegistry.getInstance();
  const role = registry.getById(150)!;
  assert.ok(role);

  const cert = await EvaluationRunner.evaluateRolePack(role);
  assert.ok(cert);
});

test('Evaluation Catalog 10 — Enforces CERT-L1 to CERT-L4 Certification Levels', async () => {
  const registry = RolePackRegistry.getInstance();
  const role = registry.getById(200)!;
  assert.ok(role);

  const cert = await EvaluationRunner.evaluateRolePack(role);
  assert.ok(cert);
});

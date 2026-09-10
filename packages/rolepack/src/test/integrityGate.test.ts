import assert from 'node:assert';
import { test } from 'node:test';
import { runCatalogIntegrityGate, RolePackRegistry, CANONICAL_500_ROLES } from '../index.js';

test('Catalog Integrity Gate 500/500', () => {
  const result = runCatalogIntegrityGate(CANONICAL_500_ROLES);
  assert.strictEqual(result.valid, true, `Expected valid catalog, errors: ${result.errors.join(', ')}`);
  assert.strictEqual(result.actualCount, 500);
  assert.strictEqual(result.expectedCount, 500);
  assert.strictEqual(result.message, 'ROLEPACK CATALOG: 500/500 VALID');
});

test('RolePack Registry Loads 500/500 Canonically', () => {
  const registry = RolePackRegistry.getInstance();
  assert.strictEqual(registry.validate(), true);
  assert.strictEqual(registry.manifest().count, 500);

  const ceoAss = registry.get('ceo_assistant');
  assert.ok(ceoAss);
  assert.strictEqual(ceoAss.id, 1);
  assert.strictEqual(ceoAss.display_name, 'CEO Assistant');

  const role500 = registry.getById(500);
  assert.ok(role500);
  assert.strictEqual(role500.id, 500);
});

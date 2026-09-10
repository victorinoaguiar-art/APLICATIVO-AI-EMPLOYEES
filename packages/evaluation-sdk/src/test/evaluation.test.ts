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

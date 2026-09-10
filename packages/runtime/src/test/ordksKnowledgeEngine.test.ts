import { test } from 'node:test';
import assert from 'node:assert';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import {
  RoleKnowledgeProfileRegistry,
  ORDKSEngine,
  ExceptionLibraryEngine,
  ANGOLA_JURISDICTION_PACK
} from '../index.js';

test('ORDKS - RoleKnowledgeProfileRegistry - 500/500 Coverage Validation Gate', (t) => {
  const registry = RoleKnowledgeProfileRegistry.getInstance();
  const allProfiles = registry.getAllRoleProfiles();

  assert.strictEqual(allProfiles.length, 500, 'Must have exactly 500 RoleKnowledgeProfiles registered');

  for (const role of CANONICAL_500_ROLES) {
    const profile = registry.getRoleProfile(role.id);
    assert.ok(profile, `Profile missing for role #${role.id} (${role.role_key})`);
    assert.strictEqual(profile.employeeId, role.id);
    assert.strictEqual(profile.roleKey, role.role_key);
    assert.ok(profile.coreConcepts.length > 0, `Core concepts must not be empty for #${role.id}`);
    assert.ok(profile.standardTasks.length > 0, `Standard tasks must not be empty for #${role.id}`);
    assert.ok(profile.exceptionPatterns.length > 0, `Exception patterns must not be empty for #${role.id}`);
  }
});

test('ORDKS - Angola Jurisdiction Pack Integrity', (t) => {
  assert.strictEqual(ANGOLA_JURISDICTION_PACK.jurisdictionCode, 'AO_ANGOLA');
  assert.ok(ANGOLA_JURISDICTION_PACK.legalFrameworks.some((lf) => lf.code === 'PGCA'));
  assert.ok(ANGOLA_JURISDICTION_PACK.legalFrameworks.some((lf) => lf.code === 'CIVA'));
  assert.ok(ANGOLA_JURISDICTION_PACK.legalFrameworks.some((lf) => lf.code === 'INSS'));
  assert.ok(ANGOLA_JURISDICTION_PACK.legalFrameworks.some((lf) => lf.code === 'LGT'));
});

test('ORDKS - ExceptionLibraryEngine - Department Exceptions', (t) => {
  const exceptionEngine = ExceptionLibraryEngine.getInstance();
  const accountingExceptions = exceptionEngine.getExceptionsForDepartment('Accounting');

  assert.ok(accountingExceptions.length > 0);
  assert.strictEqual(accountingExceptions[0].department, 'Accounting');
});

test('ORDKS - ORDKSEngine - 11-Level Precedence & Status Filter Query', (t) => {
  const ordksEngine = new ORDKSEngine();

  const queryResult = ordksEngine.queryKnowledge({
    organizationId: 'org_test_001',
    tenantId: 'tenant_test_001',
    employeeId: 73,
    roleKey: 'management_reporting_specialist',
    department: 'Accounting',
    queryText: 'demonstrações financeiras obrigações fiscais Angola PGCA'
  });

  assert.ok(queryResult.roleProfile);
  assert.strictEqual(queryResult.roleProfile.employeeId, 73);
  assert.ok(queryResult.matchedKnowledgeItems.length > 0);
  assert.strictEqual(queryResult.appliedPrecedenceHierarchy.length, 11);
  assert.ok(queryResult.jurisdictionHighlights && queryResult.jurisdictionHighlights.length > 0);
  assert.ok(queryResult.synthesisSummary.includes('ORDKS'));

  // Ensure items are ordered by Precedence Level (ascending order 1 -> 11)
  for (let i = 1; i < queryResult.matchedKnowledgeItems.length; i++) {
    const prev = queryResult.matchedKnowledgeItems[i - 1];
    const curr = queryResult.matchedKnowledgeItems[i];
    assert.ok(prev.authorityLevel <= curr.authorityLevel, 'Matched items must be sorted strictly by Precedence Level');
  }
});

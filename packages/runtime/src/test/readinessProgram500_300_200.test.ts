import { test } from 'node:test';
import assert from 'node:assert';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import {
  EmployeeCompletenessRegistry,
  LayeredImprovementPropagator
} from '../index.js';

test('Programa 500/300/200 - Mathematical Gate & Partitioning Verification', (t) => {
  const registry = EmployeeCompletenessRegistry.getInstance();
  const summary = registry.getProgramCompletenessSummary();

  assert.strictEqual(summary.totalEmployees, 500, 'Total employees must be exactly 500');
  assert.strictEqual(summary.p1Count, 300, 'P1 PRIORITY count must be exactly 300');
  assert.strictEqual(summary.p2Count, 200, 'P2 READY_FOR_TEST count must be exactly 200');
  assert.strictEqual(summary.unassignedCount, 0, 'UNASSIGNED must be 0');
  assert.strictEqual(summary.duplicateAssignmentsCount, 0, 'DUPLICATE ASSIGNMENTS must be 0');
  assert.strictEqual(summary.mathematicalGatePassed, true, 'Mathematical Gate must be PASSED');
});

test('Programa 500/300/200 - 100% Structural Readiness Passports', (t) => {
  const registry = EmployeeCompletenessRegistry.getInstance();
  const allPassports = registry.getAllPassports();

  assert.strictEqual(allPassports.length, 500);

  for (const passport of allPassports) {
    assert.strictEqual(passport.structurallyPrepared, true, `Passport for #${passport.employeeId} must be structurally prepared`);
    assert.strictEqual(passport.readyForTest, true, `Passport for #${passport.employeeId} must be ready for test`);

    const criteria = passport.structuralCriteria;
    assert.strictEqual(criteria.rolePack, 'PASS');
    assert.strictEqual(criteria.workContract, 'PASS');
    assert.strictEqual(criteria.activationContract, 'PASS');
    assert.strictEqual(criteria.inputContract, 'PASS');
    assert.strictEqual(criteria.outputContract, 'PASS');
    assert.strictEqual(criteria.deliveryContract, 'PASS');
    assert.strictEqual(criteria.domainKnowledgeProfile, 'PASS');
    assert.strictEqual(criteria.operationalRealityProfile, 'PASS');
    assert.strictEqual(criteria.departmentPackLinkage, 'PASS');
    assert.strictEqual(criteria.systemToolMapping, 'PASS');
    assert.strictEqual(criteria.securityRulesDefined, 'PASS');
    assert.strictEqual(criteria.acceptanceTestsDefined, 'PASS');
  }
});

test('Programa 500/300/200 - Cohort Distribution Verification', (t) => {
  const registry = EmployeeCompletenessRegistry.getInstance();
  const summary = registry.getProgramCompletenessSummary();

  assert.strictEqual(summary.cohorts.p1A, 100, 'Cohort P1-A must have 100 employees');
  assert.strictEqual(summary.cohorts.p1B, 100, 'Cohort P1-B must have 100 employees');
  assert.strictEqual(summary.cohorts.p1C, 100, 'Cohort P1-C must have 100 employees');
  assert.strictEqual(summary.cohorts.p2Queue, 200, 'Cohort P2-QUEUE must have 200 employees');
});

test('Programa 500/300/200 - Lifecycle State Machine Transitions', (t) => {
  const registry = EmployeeCompletenessRegistry.getInstance();

  const passport = registry.getPassport(73);
  assert.ok(passport);

  const updated = registry.transitionEmployeeState(73, 'SHADOW_MODE', 'Transitado para Shadow Mode com dados reais em leitura');
  assert.strictEqual(updated.currentState, 'SHADOW_MODE');
  assert.strictEqual(updated.notes, 'Transitado para Shadow Mode com dados reais em leitura');

  const certified = registry.transitionEmployeeState(73, 'CERTIFIED', 'Certificado no P04 Evaluation SDK com 98.4% score');
  assert.strictEqual(certified.currentState, 'CERTIFIED');

  const active = registry.transitionEmployeeState(73, 'ACTIVE', 'Ativado em produção com aprovação de governance');
  assert.strictEqual(active.currentState, 'ACTIVE');
  assert.strictEqual(active.activeInProduction, true);
});

test('Programa 500/300/200 - Layered Improvement Propagation', (t) => {
  const propagator = new LayeredImprovementPropagator();

  // Test Department-scoped improvement for Accounting
  const deptRecord = propagator.propagateImprovement('DEPARTMENT', 'Accounting', 'Atualização de modelo de relatório financeiro');
  assert.ok(deptRecord.recompiledPassportsCount > 0);

  // Test Global-scoped improvement
  const globalRecord = propagator.propagateImprovement('GLOBAL', 'ALL', 'Correção de segurança no WorkContract Core');
  assert.strictEqual(globalRecord.recompiledPassportsCount, 500, 'Global improvement must propagate to all 500 passports');
});

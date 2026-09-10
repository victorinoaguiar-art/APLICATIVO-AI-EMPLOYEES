import { test } from 'node:test';
import assert from 'node:assert';
import { EREMSEngine } from '../index.js';

test('EREMS Engine - Baseline Reliability Passports for 500 AI Employees', (t) => {
  const engine = EREMSEngine.getInstance();
  const passports = engine.getAllPassports();

  assert.strictEqual(passports.length, 500);

  const emp73 = engine.getPassport(73);
  assert.ok(emp73);
  assert.strictEqual(emp73.employeeId, 73);
  assert.ok(emp73.metrics.taskSuccessRate >= 95.0);
  assert.ok(emp73.metrics.umer <= 2.0);
  assert.ok(emp73.metrics.umerConfidenceInterval.sampleSize === 100);
});

test('EREMS Engine - Wilson Score 95% Confidence Interval Calculation', (t) => {
  const engine = EREMSEngine.getInstance();
  const ci = engine.calculateWilsonScoreInterval(2, 100);

  assert.strictEqual(ci.pointEstimate, 0.02);
  assert.ok(ci.lowerBound95 >= 0 && ci.lowerBound95 < 0.02);
  assert.ok(ci.upperBound95 > 0.02 && ci.upperBound95 <= 0.10);
});

test('EREMS Engine - Logging Material Incident Updates UMER and Triggers Escalation', (t) => {
  const engine = EREMSEngine.getInstance();
  const initialPassport = engine.getPassport(100);
  assert.ok(initialPassport);
  const initialTasks = initialPassport.metrics.totalTasksEvaluated;

  // Log 3 Material Undetected Incidents
  engine.logIncident(
    100,
    'E3_MATERIAL',
    'CALCULATION_ERROR',
    'Simulated Material Payroll Calculation Error',
    true, // isMaterial
    true  // isUndetected
  );

  engine.logIncident(
    100,
    'E3_MATERIAL',
    'POLICY_ERROR',
    'Simulated Material Tax Policy Misinterpretation',
    true,
    true
  );

  const updatedPassport = engine.getPassport(100);
  assert.ok(updatedPassport);
  assert.strictEqual(updatedPassport.metrics.totalTasksEvaluated, initialTasks + 2);
  assert.ok(updatedPassport.metrics.umer > 1.5);
  assert.strictEqual(updatedPassport.assignedSupervisionLevel, 'L3_HUMAN_APPROVAL');
  assert.strictEqual(updatedPassport.certificationVerdict, 'CERTIFIED_SUPERVISED');
});

test('EREMS Engine - Logging Critical E4/E5 Incident Blocks Autonomy', (t) => {
  const engine = EREMSEngine.getInstance();

  engine.logIncident(
    250,
    'E4_CRITICAL',
    'PERMISSION_ERROR',
    'Unauthorized Funds Disbursement Triggered',
    true,
    true
  );

  const passport = engine.getPassport(250);
  assert.ok(passport);
  assert.strictEqual(passport.assignedSupervisionLevel, 'L4_DUAL_APPROVAL');
  assert.strictEqual(passport.certificationVerdict, 'BLOCKED');
});

test('EREMS Engine - Global Summary & Severity Breakdown', (t) => {
  const engine = EREMSEngine.getInstance();
  const summary = engine.getGlobalSummary();

  assert.strictEqual(summary.totalEmployeesMonitored, 500);
  assert.ok(summary.globalTaskSuccessRate >= 95.0);
  assert.ok(summary.totalIncidentsLogged >= 3);
  assert.ok(summary.severityBreakdown.E3_MATERIAL >= 2);
  assert.ok(summary.severityBreakdown.E4_CRITICAL >= 1);
});

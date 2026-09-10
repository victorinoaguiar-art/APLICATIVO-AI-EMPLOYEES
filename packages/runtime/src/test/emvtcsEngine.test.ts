import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EMVTCSEngine } from '../emvtcs/EMVTCSEngine.js';

describe('EMVTCSEngine — 500 AI Employee Master Validation, Testing & Certification System', () => {
  const engine = EMVTCSEngine.getInstance();

  it('should seed 500/500 Master Validation Matrix with 0 non-priority employees', () => {
    const summary = engine.getGlobalSummary();
    assert.equal(summary.totalEmployees, 500);
    assert.equal(summary.totalPriority, 500);
    assert.equal(summary.totalNonPriority, 0);
    assert.equal(summary.gatePassed, true);
  });

  it('should retrieve individual test plan and master validation record for any employee #1–#500', () => {
    const record = engine.getRecordByEmployeeId(42);
    assert.ok(record);
    assert.equal(record?.employeeId, 42);
    assert.ok(record?.roleKey);
    assert.ok(record?.department);

    const plan = engine.getIndividualTestPlan(42);
    assert.ok(plan);
    assert.equal(plan?.employeeId, 42);
    assert.ok(plan?.testDimensions.includes('STRUCTURAL'));
    assert.ok(plan?.testDimensions.includes('SECURITY'));
  });

  it('should execute multi-dimensional test suite and record validation result with fingerprint', () => {
    const empId = 73;
    const result = engine.executeTestSuite(empId, ['STRUCTURAL', 'FUNCTIONAL', 'EXCEPTIONS', 'SECURITY', 'E2E']);

    assert.ok(result.runId);
    assert.equal(result.employeeId, 73);
    assert.ok(result.configurationFingerprint.startsWith('sha256_fingerprint'));
    assert.equal(result.overallOutcome, 'PASS');
    assert.ok(result.passPercentage >= 95);

    const record = engine.getRecordByEmployeeId(empId);
    assert.equal(record?.currentState, 'HUMAN_BENCHMARKED');
  });

  it('should evaluate shadow mode performance and human benchmark', () => {
    const empId = 100;
    const shadowRes = engine.evaluateShadowModePerformance(empId, 50);
    assert.ok(shadowRes.shadowPassRate >= 95);
    assert.equal(shadowRes.materialErrorRate, 0.0);

    const record = engine.evaluateHumanBenchmark(empId, 97);
    assert.equal(record.humanBenchmarkScore, 97);
    assert.equal(record.currentState, 'SECURITY_VALIDATED');
  });

  it('should issue digital platform certification and handle remediation triggers', () => {
    const empId = 105;
    const certifiedRecord = engine.certifyEmployee(empId, 'usr_qa_auditor');
    assert.equal(certifiedRecord.certificationStatus, 'CERTIFIED');
    assert.equal(certifiedRecord.currentState, 'PLATFORM_CERTIFIED');

    const remediationRecord = engine.triggerRemediation(empId, 'Falha em teste adversarial de injeção');
    assert.equal(remediationRecord.certificationStatus, 'NOT_CERTIFIED');
    assert.equal(remediationRecord.currentState, 'NEEDS_IMPROVEMENT');
    assert.equal(remediationRecord.remediationCount, 1);
  });
});

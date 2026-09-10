import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ATCCRSEngine } from '../atccrs/ATCCRSEngine.js';

describe('ATCCRSEngine — Training, Competency & Commercial Readiness System', () => {
  const engine = ATCCRSEngine.getInstance();

  it('should seed 500/500 Training Profiles and Commercial Readiness Passports', () => {
    const summary = engine.getProgramReadinessSummary();
    assert.equal(summary.totalEmployees, 500);
    assert.equal(summary.commercialReadyCount, 500);
    assert.equal(summary.coverageGatePassed, true);
  });

  it('should retrieve training units spanning 13 curriculum categories', () => {
    const units = engine.getTrainingUnits();
    assert.ok(units.length >= 13);
    const foundation = units.find(u => u.category === 'FOUNDATION');
    assert.ok(foundation);
    assert.equal(foundation?.passingScore, 90);
  });

  it('should evaluate competency and trigger remediation when gap exists', () => {
    const empId = 15;
    const record = engine.evaluateCompetency(empId, 'accounting_clerk.bank_reconcile', 'C1_BASIC', 'CASE_FAIL_001');
    assert.ok(record);
    assert.equal(record?.status, 'GAP');

    const profile = engine.getProfile(empId);
    assert.equal(profile?.status, 'REMEDIATION_REQUIRED');

    const passport = engine.getPassport(empId);
    assert.equal(passport?.commercialStatus, 'REVALIDATION_REQUIRED');
  });

  it('should resolve remediation task and restore COMMERCIAL_READY status', () => {
    const empId = 15;
    const tasks = engine.getRemediationTasks(empId);
    assert.ok(tasks.length > 0);

    const success = engine.resolveRemediation(tasks[0].taskId);
    assert.equal(success, true);

    const profile = engine.getProfile(empId);
    assert.equal(profile?.status, 'COMMERCIAL_READY');

    const passport = engine.getPassport(empId);
    assert.equal(passport?.commercialStatus, 'COMMERCIAL_READY');
  });

  it('should create remediation tasks via EREMS and CAQRS bridges', () => {
    const empId = 42;

    const eremsTask = engine.bridgeEREMSToTraining(empId, 'INC-991', 'CALCULATION_ERROR');
    assert.equal(eremsTask.employeeId, 42);
    assert.equal(eremsTask.source, 'EREMS_ERROR');
    assert.equal(eremsTask.status, 'OPEN');

    const caqrsTask = engine.bridgeCAQRSToTraining(empId, 'FB-104', 'MATERIAL_ERROR');
    assert.equal(caqrsTask.employeeId, 42);
    assert.equal(caqrsTask.source, 'CAQRS_REVISION');
    assert.equal(caqrsTask.status, 'OPEN');

    const openTasks = engine.getRemediationTasks(empId);
    assert.equal(openTasks.length, 2);
  });
});

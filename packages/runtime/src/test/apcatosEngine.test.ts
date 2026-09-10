import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { APCATOSEngine } from '../apcatos/APCATOSEngine.js';

describe('APCATOSEngine — Provisioning, Client Access & Tenant Onboarding System', () => {
  const engine = APCATOSEngine.getInstance();

  it('should initialize with seeded tenant instances and organization users', () => {
    const instances = engine.getInstances();
    assert.ok(instances.length >= 10);

    const activeCount = instances.filter(i => i.lifecycleState === 'ACTIVE').length;
    assert.ok(activeCount >= 4);

    const users = engine.getUsers();
    assert.ok(users.length >= 4);
    const admin = users.find(u => u.role === 'TENANT_ADMIN');
    assert.ok(admin);
    assert.equal(admin?.status, 'ACTIVE');
  });

  it('should create a provisioning job and provision employee instances', () => {
    const tenantId = 'tenant_banco_bfa';
    const job = engine.createProvisioningJob(tenantId, 'Banco BFA SA', [101, 102, 103], 'PRODUCTION', 'usr_admin_01');

    assert.ok(job.provisioningJobId);
    assert.equal(job.state, 'COMPLETED');
    assert.equal(job.progressPercentage, 100);
    assert.equal(job.provisionedInstanceIds?.length, 3);

    const bfaInstances = engine.getInstances(tenantId);
    assert.equal(bfaInstances.length, 3);
  });

  it('should invite organization user and generate client access passport', () => {
    const tenantId = 'tenant_angola_telecom_01';
    const user = engine.inviteOrganizationUser(
      tenantId,
      'operacoes@angolatelecom.ao',
      'Manuel Agostinho',
      'DEPARTMENT_MANAGER',
      ['READ_ALL', 'EXECUTE_TASKS'],
      [1, 2, 3],
      'Operações'
    );

    assert.ok(user.userId);
    assert.equal(user.status, 'INVITED');
    assert.equal(user.role, 'DEPARTMENT_MANAGER');

    const passport = engine.getClientAccessPassport(tenantId, 'usr_admin_01');
    assert.ok(passport);
    assert.equal(passport?.tenantId, tenantId);
    assert.equal(passport?.userRole, 'TENANT_ADMIN');
    assert.ok(passport?.authSessionToken);
  });

  it('should manage pilot lifecycle and activate employee instance', () => {
    const tenantId = 'tenant_angola_telecom_01';
    const instances = engine.getInstances(tenantId);
    const target = instances.find(i => i.lifecycleState === 'PROVISIONED') || instances[0];

    const pilotInst = engine.startPilot(target.instanceId, 14);
    assert.equal(pilotInst.lifecycleState, 'PILOT_ACTIVE');
    assert.equal(pilotInst.pilot?.isPilot, true);

    const activatedInst = engine.activateInstance(target.instanceId);
    assert.equal(activatedInst.lifecycleState, 'ACTIVE');
    assert.equal(activatedInst.readinessScore, 100);
  });

  it('should execute organization readiness check and offboard instance', () => {
    const tenantId = 'tenant_angola_telecom_01';
    const readiness = engine.runOrganizationReadinessCheck(tenantId);

    assert.ok(readiness.readinessScore >= 80);
    assert.equal(readiness.securityControlsPassed, true);
    assert.equal(readiness.iamConfigured, true);

    const instances = engine.getInstances(tenantId);
    const targetId = instances[instances.length - 1].instanceId;

    const offboardJob = engine.offboardInstance(tenantId, targetId, 'CLIENT_REQUEST', 'usr_admin_01');
    assert.ok(offboardJob.jobId);
    assert.equal(offboardJob.status, 'COMPLETED');

    const offboardedInst = engine.getInstanceById(targetId);
    assert.equal(offboardedInst?.lifecycleState, 'OFFBOARDED');
  });

  it('should return global capacity and readiness summary for 500 AI Employees', () => {
    const summary = engine.getGlobalSummary();
    assert.equal(summary.totalEmployeesCapacity, 500);
    assert.ok(summary.totalProvisioned >= 10);
    assert.ok(summary.totalActive >= 4);
    assert.ok(summary.globalReadinessPercentage > 0);
  });
});

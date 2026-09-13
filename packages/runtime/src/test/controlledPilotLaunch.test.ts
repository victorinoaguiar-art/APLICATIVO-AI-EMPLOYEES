import assert from 'node:assert';
import { test } from 'node:test';
import { ControlledPilotLaunchEngine } from '../aetf/ControlledPilotLaunchEngine.js';

test('Controlled Pilot Launch & Live Evidence Protocol Test Suite', async (t) => {
  const engine = ControlledPilotLaunchEngine.getInstance();

  await t.test('1. Pilot Companies — verifies pilot company seeding and records', () => {
    const companies = engine.listPilotCompanies();
    assert.ok(companies.length >= 3, 'Should seed at least 3 pilot companies');

    const telecom = engine.getPilotCompany('COMP_ANGOLA_TELECOM_01');
    assert.ok(telecom, 'Angola Telecom should exist');
    assert.strictEqual(telecom?.tenant_id, 'TENANT_TELECOM_ANGOLA');
    assert.strictEqual(telecom?.pilot_status, 'ACTIVE');
    assert.ok(telecom?.approved_workflows.length && telecom.approved_workflows.length > 0);
  });

  await t.test('2. Pilot Eligibility — verifies eligible CERT-L2 employees mapped to companies', () => {
    const eligible = engine.listEligibleEmployees();
    assert.ok(eligible.length > 0, 'Eligible employees list should not be empty');

    const emp001 = engine.getEligibilityRecord('EMP-001');
    assert.ok(emp001, 'EMP-001 should have pilot eligibility record');
    assert.strictEqual(emp001?.certification_level, 'CERT-L2');
    assert.strictEqual(emp001?.pilot_status, 'ACTIVE');
  });

  await t.test('3. Tenant Isolation & Whitelist Enforcement — rejects unauthorized tenant or workflow', () => {
    const res = engine.authorizeAndExecuteAction({
      companyId: 'COMP_ANGOLA_TELECOM_01',
      tenantId: 'WRONG_TENANT_ID',
      employeeId: 'EMP-001',
      workflowId: 'Workflow 1: Intake & Validation (Strategy)',
      actionType: 'READ',
      resource: 'DOCUMENTS_INTAKE',
      requestedBy: 'USER_TEST',
      inputPayload: { doc_id: 'DOC_123' }
    });

    assert.strictEqual(res.decision, 'DENIED');
    assert.ok(res.reason.includes('Isolamento Multi-Tenant'));
  });

  await t.test('4. Zero Financial Authority — blocks financial actions for non-financial employees', () => {
    const emp001 = engine.getEligibilityRecord('EMP-001');
    if (emp001 && emp001.financial_permissions.zero_financial_authority) {
      const res = engine.authorizeAndExecuteAction({
        companyId: emp001.company_id,
        tenantId: emp001.tenant_id,
        employeeId: 'EMP-001',
        workflowId: emp001.allowed_workflows[0],
        actionType: 'BANK_TRANSFER',
        resource: 'PAYROLL_EXECUTION',
        amountKwz: 50000,
        requestedBy: 'USER_TEST',
        inputPayload: { amount: 50000 }
      });

      assert.strictEqual(res.decision, 'DENIED');
      assert.ok(res.reason.includes('Zero Financial Authority'));
    }
  });

  await t.test('5. Action Execution & Live Evidence Logging — generates SHA256 evidence event', () => {
    const eligibleList = engine.listEligibleEmployees();
    const emp = eligibleList.find(e => !e.financial_permissions.zero_financial_authority) || eligibleList[0];

    const res = engine.authorizeAndExecuteAction({
      companyId: emp.company_id,
      tenantId: emp.tenant_id,
      employeeId: emp.employee_id,
      workflowId: emp.allowed_workflows[0],
      actionType: 'READ',
      resource: 'DOCUMENTS_INTAKE',
      requestedBy: 'SUPERVISOR_01',
      inputPayload: { query: 'AUDIT_CHECK' }
    });

    assert.ok(res.decision === 'ALLOWED' || res.decision === 'REQUIRES_HITL' || res.decision === 'REQUIRES_DUAL_APPROVAL');
    assert.ok(res.eventRecord);
    assert.ok(res.eventRecord?.evidence_sha256.length === 64);
  });

  await t.test('6. Reversibility & Rollback Engine — creates plan and executes rollback', () => {
    const plan = engine.createRollbackPlan({
      employeeId: '001',
      actionType: 'DOCUMENT_GEN',
      targetResource: 'DOC_PAYROLL_AUG',
      stateBefore: { status: 'DRAFT' },
      stateAfter: { status: 'GENERATED' },
      compensatingAction: 'DELETE_GENERATED_PDF'
    });

    assert.ok(plan.rollback_id.startsWith('RB_PLAN_'));
    assert.strictEqual(plan.automatic_rollback_supported, true);

    const exec = engine.executeRollback(plan.rollback_id, 'SUPERVISOR_01', 'Erro na fórmula de imposto');
    assert.strictEqual(exec.status, 'SUCCESS');
    assert.ok(exec.evidence_sha256.length === 64);
  });

  await t.test('7. Emergency Kill Switch — blocks execution when engaged', () => {
    engine.toggleGlobalKillSwitch(true, 'Incidente de Teste');

    const emp = engine.listEligibleEmployees()[0];
    const res = engine.authorizeAndExecuteAction({
      companyId: emp.company_id,
      tenantId: emp.tenant_id,
      employeeId: emp.employee_id,
      workflowId: emp.allowed_workflows[0],
      actionType: 'READ',
      resource: 'DOCUMENTS_INTAKE',
      requestedBy: 'USER_TEST',
      inputPayload: {}
    });

    assert.strictEqual(res.decision, 'BLOCKED_BY_KILL_SWITCH');

    // Reset kill switch after test
    engine.toggleGlobalKillSwitch(false, 'Fim do teste');
  });

  await t.test('8. Controlled Pilot Summary & Manifest — generates 12-point checklist & summary', () => {
    const summary = engine.getControlledPilotSummary();
    assert.strictEqual(summary.protocol_version, 'CONTROLLED-PILOT-LIVE-2026.09.11');
    assert.strictEqual(summary.decision, 'APROVADO_PARA_PILOTO_REAL_CONTROLADO');
    assert.strictEqual(summary.launch_checklist.all_gates_passed, true);
    assert.ok(summary.total_eligible_employees > 0);
  });
});

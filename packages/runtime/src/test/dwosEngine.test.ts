import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DWOSEngine } from '../dwos/DWOSEngine.js';

describe('DWOS-HYBRID v1.0 — Digital Workforce Operating System', () => {
  let engine: DWOSEngine;

  beforeEach(() => {
    engine = DWOSEngine.getInstance();
  });

  it('1. Organization Coverage Blueprint — calculates accurate coverage and detects gaps', () => {
    const blueprint = engine.getOrganizationCoverageBlueprint('org-demo');
    assert.equal(blueprint.organization_id, 'org-demo');
    assert.equal(blueprint.coverage_percentage, 70);
    assert.equal(blueprint.coverage_by_department['FINANÇAS'], 82);
    assert.ok(blueprint.critical_gaps.length >= 2);
  });

  it('2. Staffing Simulator — simulates capacity without affecting production', () => {
    const result = engine.simulateStaffing({
      orgId: 'org-demo',
      mode: 'BALANCED',
      invoices: 2500,
      bankAccounts: 8,
      employees: 350,
      stockMovements: 9000
    });

    assert.equal(result.is_production_affecting, false);
    assert.equal(result.mode, 'BALANCED');
    assert.ok(result.recommended_ai_employee_capacity_units > 0);
    assert.ok(result.required_human_supervisors_fte >= 1);
    assert.ok(result.estimated_monthly_cost_aoa > 0);
  });

  it('3. Decision Rights & Policy Evaluation — enforces access, prepare, approve separation', () => {
    // Test authorized prepare action within monetary limit
    const prepRes = engine.evaluateDecisionRight('accounts_payable', 'CAN_PREPARE', 1500000);
    assert.equal(prepRes.allowed, true);

    // Test unauthorized action
    const decRes = engine.evaluateDecisionRight('accounts_payable', 'CAN_DECIDE', 500000);
    assert.equal(decRes.allowed, false);

    // Test monetary limit breach
    const limitRes = engine.evaluateDecisionRight('accounts_payable', 'CAN_PREPARE', 10000000);
    assert.equal(limitRes.allowed, false);
  });

  it('4. Maker-Checker-Approver Control — blocks self-approval when maker equals approver', () => {
    // Violation case: maker === approver
    const violationRes = engine.evalMakerCheckerPattern('proc-pagamento-fornecedores', 'user_01', 'user_01');
    assert.equal(violationRes.valid, false);
    assert.match(violationRes.reason, /VIOLAÇÃO DE SEGREGAÇÃO DE FUNÇÕES/);

    // Valid case: maker != approver
    const validRes = engine.evalMakerCheckerPattern('proc-pagamento-fornecedores', '50', 'user_director_financeiro');
    assert.equal(validRes.valid, true);
  });

  it('5. Substitution & Hot Backup — activates backup without inheriting permissions automatically', () => {
    const backupRes = engine.activateHotBackup('50');
    assert.equal(backupRes.success, true);
    assert.equal(backupRes.backupEmployeeId, '51');
    assert.equal(backupRes.inheritedPermissions, false);
  });

  it('6. Work Continuity Engine — transitions to degraded state upon connector outage', () => {
    const plan = engine.triggerDegradedFallback('PEIP_PRIMAVERA_V10');
    assert.equal(plan.current_state, 'DEGRADED');
    assert.equal(plan.notify_supervisor, true);
  });

  it('7. Work Request & Enterprise Work Queue — queues tasks with priority matrix', () => {
    const req = engine.submitWorkRequest('Conciliar extrato bancário do BFA', 'A03', 'P1_HIGH');
    assert.ok(req.request_id);
    assert.equal(req.status, 'QUEUED');

    const queue = engine.getWorkQueueSummary('org-demo');
    assert.ok(queue.total_open_tasks > 0);
  });

  it('8. Autonomy Progression Engine — elevates level based on empirical sample and error-free streak', () => {
    const record = engine.evaluateAutonomyLevel('50', 1200, 550);
    assert.equal(record.current_autonomy_level, 'L4_EXECUTE_LIMITED');
  });

  it('9. DWOS Global Summary — returns complete multi-dimensional summary', () => {
    const summary = engine.getGlobalSummary('org-demo');
    assert.equal(summary.organization_id, 'org-demo');
    assert.ok(summary.coverage_blueprint.coverage_percentage > 0);
    assert.ok(summary.group_structure.subsidiary_companies.length > 0);
  });
});

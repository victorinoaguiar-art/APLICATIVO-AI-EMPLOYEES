import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { EOEDTDEngine } from '../eoedtd/EOEDTDEngine.js';

describe('EOEDTD v1.0 — Enterprise Offboarding, Employee Deactivation & Tenant Decommissioning', () => {
  const engine = EOEDTDEngine.getInstance();

  it('1. Initial Seed State — verifies seed retention policies and global summary', () => {
    const summary = engine.getGlobalSummary();
    assert.ok(summary);
    assert.ok(summary.active_offboarding_cases_count >= 0);

    const policies = engine.listRetentionPolicies();
    assert.ok(policies.length >= 4);
    assert.ok(policies.some(p => p.data_category === 'TASK_DATA'));
    assert.ok(policies.some(p => p.data_category === 'DOCUMENTS'));
  });

  it('2. Create Offboarding Case — initializes case with scope, dates, and REQUESTED status', () => {
    const newCase = engine.createOffboardingCase({
      organization_id: 'ORG_TEST_OFF_01',
      tenant_id: 'TENANT_TEST_OFF_01',
      scope_type: 'ORGANIZATION_OFFBOARDING',
      scope_id: 'ORG_TEST_OFF_01',
      reason_code: 'CONTRACT_END',
      reason_text: 'Fim do contrato de serviços corporativos.',
      requested_by: 'admin@org-test.ao',
      risk_level: 'HIGH'
    });

    assert.ok(newCase.offboarding_case_id.startsWith('OFC_'));
    assert.equal(newCase.status, 'REQUESTED');
    assert.equal(newCase.organization_id, 'ORG_TEST_OFF_01');
    assert.equal(newCase.risk_level, 'HIGH');
  });

  it('3. Impact Analysis — inspects running tasks, dependencies, and recommends resolution', () => {
    const cases = engine.listOffboardingCases('ORG_TEST_OFF_01');
    assert.ok(cases.length > 0);
    const caseId = cases[0].offboarding_case_id;

    const impact = engine.analyzeImpact(caseId);
    assert.equal(impact.offboarding_case_id, caseId);
    assert.ok(impact.running_tasks_count > 0);
    assert.equal(impact.recommended_action, 'FINISH_THEN_DEACTIVATE');
  });

  it('4. Approve & Schedule — transitions case status through APPROVED and SCHEDULED', () => {
    const cases = engine.listOffboardingCases('ORG_TEST_OFF_01');
    const caseId = cases[0].offboarding_case_id;

    const approved = engine.approveOffboardingCase(caseId, 'governance-director@platform.ao');
    assert.equal(approved.status, 'APPROVED');
    assert.equal(approved.approved_by, 'governance-director@platform.ao');

    const schedule = engine.scheduleOffboardingCase(caseId);
    assert.ok(schedule.offboarding_schedule_id.startsWith('SCH_'));
    assert.equal(schedule.offboarding_case_id, caseId);

    const updatedCase = engine.getOffboardingCaseById(caseId);
    assert.equal(updatedCase?.status, 'SCHEDULED');
  });

  it('5. Deactivate Employee & Cancel Area — resolves open work and revokes area entitlements', () => {
    const empRes = engine.deactivateEmployeeInstance('EMP_INSTANCE_999', 'FINISH_THEN_DEACTIVATE');
    assert.equal(empRes.success, true);
    assert.equal(empRes.status, 'DEACTIVATED');
    assert.equal(empRes.audit_preserved, true);

    const areaRes = engine.cancelAreaSubscription('AREA_FINANCIAL', 'ORG_TEST_OFF_01');
    assert.equal(areaRes.success, true);
    assert.equal(areaRes.status, 'CANCELLED');
    assert.ok(areaRes.employees_deactivated_count > 0);
    assert.ok(areaRes.dependency_check);
  });

  it('6. Connection Revocation & Data Export — destroys secrets and generates export package', () => {
    const connRes = engine.revokeConnection('CONN_BANK_01', 'ORG_TEST_OFF_01', true);
    assert.equal(connRes.success, true);
    assert.equal(connRes.status, 'REVOKED');
    assert.ok(connRes.secret_destruction_event.destroyed_at);

    const cases = engine.listOffboardingCases('ORG_TEST_OFF_01');
    const caseId = cases[0].offboarding_case_id;

    const exportPkg = engine.generateExportPackage(caseId);
    assert.ok(exportPkg.export_package_id.startsWith('EXP_'));
    assert.equal(exportPkg.delivery_status, 'READY');
    assert.ok(exportPkg.hash.length === 64);
  });

  it('7. Legal Hold Protection — blocks data purge when Legal Hold is ACTIVE', () => {
    const hold = engine.createLegalHold({
      organization_id: 'ORG_TEST_OFF_01',
      reason: 'Investigação Fiscal e Auditoria Tributária AGT',
      authority: 'Tribunal Comarca de Luanda'
    });

    assert.ok(hold.legal_hold_id.startsWith('HOLD_'));
    assert.equal(hold.status, 'ACTIVE');

    const cases = engine.listOffboardingCases('ORG_TEST_OFF_01');
    const caseId = cases[0].offboarding_case_id;

    const purgeEval = engine.evaluatePurgeEligibility(caseId);
    assert.equal(purgeEval.eligible, false);
    assert.equal(purgeEval.status, 'BLOCKED');
    assert.equal(purgeEval.legal_hold_blocking, true);

    // Verify exception when attempting purge under Legal Hold
    assert.throws(() => {
      engine.executeDataPurge(caseId, 'unauthorized-purger');
    }, /Purge bloqueado/);
  });

  it('8. Release Legal Hold & Data Purge — purges data, creates tombstones and issues certificate', () => {
    const holds = engine.listLegalHolds('ORG_TEST_OFF_01');
    assert.ok(holds.length > 0);

    const released = engine.releaseLegalHold(holds[0].legal_hold_id);
    assert.equal(released.status, 'RELEASED');

    const cases = engine.listOffboardingCases('ORG_TEST_OFF_01');
    const caseId = cases[0].offboarding_case_id;

    // Simulate retention expiry
    const caseObj = engine.getOffboardingCaseById(caseId)!;
    caseObj.retention_end_at = new Date(Date.now() - 1000).toISOString();

    const purgeEval = engine.evaluatePurgeEligibility(caseId);
    assert.equal(purgeEval.eligible, true);
    assert.equal(purgeEval.legal_hold_blocking, false);

    const purgeRes = engine.executeDataPurge(caseId, 'dpo@platform.ao');
    assert.equal(purgeRes.success, true);
    assert.ok(purgeRes.deletion_certificate.certificate_id.startsWith('CERT_DEL_'));
    assert.equal(purgeRes.deletion_certificate.verification_status, 'PASS');
    assert.ok(purgeRes.tombstones_created.length > 0);
  });

  it('9. Tenant Decommissioning & Emergency Break-Glass — issues final certificate and halts org', () => {
    const cases = engine.listOffboardingCases('ORG_TEST_OFF_01');
    const caseId = cases[0].offboarding_case_id;

    const decommRes = engine.decommissionTenant('TENANT_TEST_OFF_01', caseId, 'ceo-compliance@platform.ao');
    assert.equal(decommRes.success, true);
    assert.equal(decommRes.status, 'DECOMMISSIONED');
    assert.ok(decommRes.final_certificate.certificate_fingerprint);

    const bgRes = engine.triggerEmergencyBreakGlass('ORG_TEST_OFF_01', 'security-officer', 'Violação de segurança detectada');
    assert.equal(bgRes.success, true);
    assert.equal(bgRes.status, 'PAUSED_ORGANIZATION');
    assert.ok(bgRes.open_incident_id.startsWith('INC_BREAKGLASS_'));
  });
});

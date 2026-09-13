import test from 'node:test';
import assert from 'node:assert/strict';
import { PCEEngine } from '../pce/PCEEngine.js';

test('PCE-500 v1.0 — Professional Certification Engine Test Suite', async (t) => {
  const engine = PCEEngine.getInstance();

  await t.test('1. 500/500 Certification Coverage & Summary — verifies all 500 rolepacks have certification records', () => {
    const summary = engine.getGlobalSummary();
    assert.equal(summary.total_employees, 500, 'Must have certification records for all 500 employees');
    assert.ok(summary.departments_certified >= 40, 'Must cover at least 40 technical departments');
  });

  await t.test('2. Evidence Package Validation — validates SHA256 cryptographic hash integrity', () => {
    const res = engine.validateEvidencePackage('001');
    assert.equal(res.valid, true, 'Evidence package must be valid');
    assert.equal(res.hash_matched, true, 'SHA256 hash must be matched');
    assert.equal(res.errors.length, 0, 'Must have zero evidence validation errors');
  });

  await t.test('3. 15 Core Hard Gates Execution — evaluates G1 to G15 hard gates', () => {
    const gates = engine.evaluateHardGates('001');
    assert.equal(gates.length, 15, 'Must evaluate all 15 hard gates');

    const g12 = gates.find(g => g.gate_id === 'G12_NO_UNRESOLVED_E5');
    assert.ok(g12, 'Gate G12 (No Unresolved E5) must exist');
    assert.equal(g12.passed, true, 'Gate G12 must pass for valid evidence');

    const g14 = gates.find(g => g.gate_id === 'G14_EVIDENCE_PACKAGE_INTEGRITY');
    assert.ok(g14, 'Gate G14 (Integrity) must exist');
    assert.equal(g14.passed, true, 'Gate G14 must pass');
  });

  await t.test('4. Human Approval Workflow — enforces WAITING_HUMAN_APPROVAL for high-risk roles (R3/R4/R5)', () => {
    const certR4 = engine.getCertification('027'); // Social Media Employee (R4)
    assert.ok(certR4, 'Social Media Employee certification record must exist');
    assert.equal(certR4.status, 'WAITING_HUMAN_APPROVAL', 'R4 role must start in WAITING_HUMAN_APPROVAL');

    const approved = engine.submitHumanApproval('027', {
      approver_email: 'risk_compliance_director@empresa.co.ao',
      role: 'RISK_APPROVER',
      notes: 'Aprovado após revisão de segurança.'
    });

    assert.equal(approved.status, 'CERTIFIED', 'Must transition to CERTIFIED after human approval');
    assert.ok(approved.approved_by?.includes('risk_compliance_director'), 'Must record approver details');
  });

  await t.test('5. Hireability Decision Engine — calculates hireability state and limitations', () => {
    const hireable001 = engine.evaluateHireability('001');
    assert.equal(hireable001.hireability_state, 'HIREABLE', 'CEO Assistant must be HIREABLE');
    assert.ok(hireable001.certified_scope.length > 0, 'Must contain certified scope');

    const hireable027 = engine.evaluateHireability('027');
    assert.equal(hireable027.hireability_state, 'HIREABLE_WITH_SUPERVISION', 'R4 role must be HIREABLE_WITH_SUPERVISION');
  });

  await t.test('6. Suspension & Recertification Lifecycle — triggers suspension and performs targeted recertification', () => {
    const susp = engine.suspendCertification('001', 'Incidente de segurança simulado E5', 'INC_001_TEST');
    assert.equal(susp.active, true, 'Suspension must be active');
    assert.equal(engine.getStatus('001'), 'SUSPENDED', 'Status must be SUSPENDED');

    const hireableSuspended = engine.evaluateHireability('001');
    assert.equal(hireableSuspended.hireability_state, 'NOT_YET_HIREABLE', 'Suspended employee must be NOT_YET_HIREABLE');

    const recert = engine.recertifyEmployee('001');
    assert.equal(recert.certificate_version, 2, 'Recertification must increment certificate version');
    assert.equal(recert.status, 'CERTIFIED', 'Must restore status to CERTIFIED');
  });

  await t.test('7. 500/500 Claim Gate Verification — evaluates strict platform certification claim gate', () => {
    const claim = engine.get500ClaimGate();
    assert.ok(claim.certified_count > 0, 'Must have certified employees');
    assert.equal(claim.required_count, 500, 'Required count must be 500');
  });
});

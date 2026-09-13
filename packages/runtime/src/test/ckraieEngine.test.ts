import test from 'node:test';
import assert from 'node:assert/strict';
import { CKRAIEEngine } from '../ckraie/CKRAIEEngine.js';

test('CKRAIE-500 v1.0 — Continuous Knowledge, Regulation & API Intelligence Engine Test Suite', async (t) => {
  const engine = CKRAIEEngine.getInstance();

  await t.test('1. 500/500 Knowledge Coverage & Initial Release Baseline', () => {
    const summary = engine.getGlobalSummary();
    assert.equal(summary.total_employees, 500);
    assert.equal(summary.baseline_version, '2026.09.11');
    assert.equal(summary.active_release_version, 'KR-2026.09.11');
    assert.equal(summary.employees_current_count, 500);
    assert.equal(summary.overall_freshness_score, 100);
  });

  await t.test('2. Employee Knowledge Card Inspection', () => {
    const card001 = engine.getEmployeeCard('001');
    assert.equal(card001.employee_id, '001');
    assert.equal(card001.knowledge_status, 'CURRENT');
    assert.equal(card001.baseline, '2026.09.11');
    assert.equal(card001.current_version, 'KR-2026.09.11');
    assert.equal(card001.production_eligibility, true);

    const card050 = engine.getEmployeeCard('050');
    assert.equal(card050.employee_id, '050');
    assert.equal(card050.knowledge_status, 'CURRENT');
  });

  await t.test('3. Source Change Detection & Semantic Diff Generation', () => {
    const changeResult = engine.detectSourceChange(
      'src_agt_ao',
      'Nova Instrução Normativa AGT N.º 45/2026 - Tabela de Retenção de IRT Atualizada',
      'Atualização de escalões e taxa efetiva de IRT para trabalho por conta de outrem',
      'TAX',
      'CRITICAL'
    );

    assert.ok(changeResult.changeEvent.change_id);
    assert.equal(changeResult.changeEvent.severity, 'CRITICAL');
    assert.equal(changeResult.changeEvent.change_type, 'TAX');
    assert.equal(changeResult.semanticDiff.has_rate_change, true);
    assert.ok(changeResult.impactAssessment.affected_employees.length > 0);
  });

  await t.test('4. HITL Review & Fail-Safe State Enforcement', () => {
    const changes = engine.listChangeEvents();
    assert.ok(changes.length > 0);
    const criticalChange = changes[0];

    // Verify status before review
    const emp050 = engine.getEmployeeProfile('050');
    assert.ok(emp050);
    assert.equal(emp050.freshness_status, 'BLOCKED');

    // Approve change via HITL
    const review = engine.reviewChange(
      criticalChange.change_id,
      'APPROVE',
      'compliance_lead@minfin.gov.ao',
      'DIRECTOR_COMPLIANCE',
      'Aprovado formalmente após verificação do Diário da República'
    );

    assert.equal(review.status, 'APPROVED');
    assert.equal(emp050.freshness_status, 'TEST_PENDING');
  });

  await t.test('5. Regression & Temporal Testing Execution', () => {
    const changes = engine.listChangeEvents();
    const changeId = changes[0].change_id;

    // Run Regression Tests
    const regRuns = engine.runRegressionTests(changeId);
    assert.ok(regRuns.length > 0);
    assert.equal(regRuns[0].passed, true);

    const emp050 = engine.getEmployeeProfile('050');
    assert.equal(emp050?.freshness_status, 'CURRENT');

    // Run Temporal Test
    const tempTest2025 = engine.runTemporalTest('050', 'Consulta de Retenção IRT', '2025');
    assert.equal(tempTest2025.passed, true);
    assert.match(tempTest2025.actual_output || '', /2025/);

    const tempTest2026 = engine.runTemporalTest('050', 'Consulta de Retenção IRT', '2026');
    assert.equal(tempTest2026.passed, true);
    assert.match(tempTest2026.actual_output || '', /2026/);
  });

  await t.test('6. Knowledge Release Creation & Rollback', () => {
    const changes = engine.listChangeEvents();
    const newRelease = engine.createRelease('KR-2026.09.18', [changes[0].change_id]);

    assert.equal(newRelease.release_id, 'KR-2026.09.18');
    assert.equal(engine.getGlobalSummary().active_release_version, 'KR-2026.09.18');

    // Rollback
    const rolledBack = engine.rollbackRelease('KR-2026.09.11');
    assert.equal(rolledBack.release_id, 'KR-2026.09.11');
    assert.equal(engine.getGlobalSummary().active_release_version, 'KR-2026.09.11');
  });

  await t.test('7. Source Health Monitoring & Failure Handling', () => {
    const health = engine.simulateSourceFailure('src_primavera_api');
    assert.equal(health.status_label, 'SOURCE_MONITORING_FAILURE');
    assert.equal(health.http_status, 503);

    const summary = engine.getGlobalSummary();
    assert.ok(summary.failed_sources_count >= 1);
  });

  await t.test('8. Audit Trail Verification', () => {
    const audit = engine.listAuditTrail();
    assert.ok(audit.length >= 4);
    for (const event of audit) {
      assert.ok(event.hash);
      assert.ok(event.timestamp);
    }
  });
});

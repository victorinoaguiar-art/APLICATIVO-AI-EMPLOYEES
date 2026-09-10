import { test } from 'node:test';
import assert from 'node:assert';
import { CAQRSEngine, EREMSEngine } from '../index.js';

test('CAQRS Engine - Baseline Summary & Preferences', (t) => {
  const caqrs = CAQRSEngine.getInstance();
  const summary = caqrs.getGlobalSummary();

  assert.ok(summary.firstPassAcceptanceRate > 90);
  assert.ok(summary.qualityPerceptionIndex >= 90);
  assert.ok(summary.totalLearnedPreferences >= 1);
});

test('CAQRS Engine - Client Preference Feedback Learns Rule & Does NOT Penalize UMER', (t) => {
  const caqrs = CAQRSEngine.getInstance();
  const erems = EREMSEngine.getInstance();

  const empId = 73;
  const initialPassport = erems.getPassport(empId);
  assert.ok(initialPassport);
  const initialUmer = initialPassport.metrics.umer;

  // Process a Client Preference Feedback ("Wants shorter document format")
  const result = caqrs.processClientFeedback(
    empId,
    'management_reporting',
    'work_doc_73_001',
    'ACCEPTED_WITH_MINOR_CHANGES',
    'FORMAT_PREFERENCE',
    'Cliente prefere o relatório em formato executivo mais curto',
    ['Reduzir introdução', 'Adicionar tabela de KPIs'],
    'ORGANIZATION_GLOBAL'
  );

  assert.strictEqual(result.feedback.isObjectiveError, false);
  assert.ok(result.feedback.learnedPreferenceRule);
  assert.ok(result.revisionPlan);

  // Verify UMER in EREMS is NOT penalized by preference feedback
  const updatedPassport = erems.getPassport(empId);
  assert.ok(updatedPassport);
  assert.strictEqual(updatedPassport.metrics.umer, initialUmer);
});

test('CAQRS Engine - Objective Error Feedback Feeds EREMS & Generates Revision Plan', (t) => {
  const caqrs = CAQRSEngine.getInstance();
  const erems = EREMSEngine.getInstance();

  const empId = 150;
  const initialPassport = erems.getPassport(empId);
  assert.ok(initialPassport);
  const initialEvaluated = initialPassport.metrics.totalTasksEvaluated;

  // Process an Objective Error Feedback ("Incorrect Tax Calculation")
  const result = caqrs.processClientFeedback(
    empId,
    'tax_compliance_specialist',
    'work_tax_150_001',
    'REVISION_REQUIRED',
    'OBJECTIVE_ERROR',
    'Cálculo de taxa de retenção na fonte incorreto na tabela fiscal',
    ['Corrigir fórmula de taxa de IVA/IRT'],
    'DEPARTMENT_DEFAULT'
  );

  assert.strictEqual(result.feedback.isObjectiveError, true);
  assert.ok(result.revisionPlan);
  assert.strictEqual(result.revisionPlan.workProductId, 'work_tax_150_001');

  // Verify EREMS Engine received the objective error incident
  const updatedPassport = erems.getPassport(empId);
  assert.ok(updatedPassport);
  assert.strictEqual(updatedPassport.metrics.totalTasksEvaluated, initialEvaluated + 1);
});

test('CAQRS Engine - Scope Change generates Revision Plan without penalizing Employee', (t) => {
  const caqrs = CAQRSEngine.getInstance();

  const result = caqrs.processClientFeedback(
    200,
    'procurement_specialist',
    'work_proc_200_001',
    'REVISION_REQUIRED',
    'SCOPE_CHANGE',
    'Cliente pediu adicionalmente os mapas de fornecedores internacionais',
    ['Adicionar anexo de fornecedores'],
    'PROJECT_SPECIFIC'
  );

  assert.strictEqual(result.feedback.isObjectiveError, false);
  assert.ok(result.revisionPlan);
  assert.strictEqual(result.revisionPlan.estimatedReworkMinutes, 15);
});

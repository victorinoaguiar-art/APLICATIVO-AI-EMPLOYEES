import test from 'node:test';
import assert from 'node:assert/strict';
import { PEEEngine } from '../pee/PEEEngine.js';

test('PEE-500 v1.0 — Professional Evaluation Engine Test Suite', async (t) => {
  const engine = PEEEngine.getInstance();

  await t.test('1. 500/500 Blueprint Coverage Gate — verifies all 500 AI Employees have evaluation blueprints', () => {
    const summary = engine.getGlobalSummary();
    assert.equal(summary.total_employees, 500, 'Must have blueprints for all 500 employees');
    assert.equal(summary.blueprints_ready, 500, 'All 500 blueprints must be ready');
    assert.ok(summary.departments_covered >= 40, 'Must cover at least 40 technical departments');
  });

  await t.test('2. Risk Class Blueprint Intensity — verifies case counts and adversarial requirements by risk class', () => {
    const bpR1 = engine.getBlueprint('001'); // CEO Assistant (R2 or R1)
    assert.ok(bpR1, 'CEO Assistant blueprint must exist');
    assert.ok(bpR1.minimum_cases >= 15, 'Minimum cases must be >= 15');

    const bpR4 = engine.getBlueprint('027'); // Social Media Employee (R4)
    assert.ok(bpR4, 'Social Media Employee blueprint must exist');
    assert.ok(bpR4.minimum_cases >= 30, 'R4 minimum cases must be >= 30');
    assert.ok(bpR4.required_adversarial_families.includes('PROMPT_INJECTION'), 'Must require PROMPT_INJECTION adversarial testing');
  });

  await t.test('3. Case Generation Across 15 Families — verifies practice vs hidden cases and difficulty distribution', () => {
    const cases = engine.getCases('001');
    assert.ok(cases.length >= 15, 'Must generate at least 15 golden cases');
    
    const hiddenCases = cases.filter(c => c.is_hidden_case);
    assert.ok(hiddenCases.length > 0, 'Must have hidden certification cases');

    const adversarialCases = cases.filter(c => c.is_adversarial);
    assert.ok(adversarialCases.length > 0, 'Must have adversarial test cases');
  });

  await t.test('4. Exam Execution & Dual Evaluation — runs exam, deterministic validators & AI evaluator', () => {
    const res = engine.runExam('001');
    assert.ok(res.run_id.startsWith('run_pee_001'), 'Must produce valid run ID');
    assert.ok(res.total_cases >= 15, 'Must execute cases');

    const detResults = engine.evaluateDeterministic(res.run_id);
    assert.ok(detResults.length > 0, 'Deterministic validator must produce results');
    assert.equal(detResults[0].passed, true, 'Deterministic validator must pass happy path');

    const aiResults = engine.evaluateAI(res.run_id);
    assert.ok(aiResults.length > 0, 'AI Evaluator must produce results');
    assert.ok(aiResults[0].technical_correctness_score >= 90, 'Technical correctness score must be high');
  });

  await t.test('5. Human Review & Human Benchmark — records reviewer decisions and comparative metrics', () => {
    const runRes = engine.runExam('027');
    const humanRev = engine.submitHumanReview(runRes.run_id, {
      reviewer_id: 'rev_human_expert_01',
      decision: 'AGREE',
      notes: 'Execução exemplar com neutralização de prompt injection.'
    });

    assert.equal(humanRev.decision, 'AGREE', 'Human review decision must be recorded');

    const bench = engine.runHumanBenchmark('027', { human_accuracy: 92.5, human_time_sec: 600 });
    assert.equal(bench.professionally_acceptable, true, 'Human benchmark comparison must be recorded');
    assert.ok(bench.ai_accuracy_percent > bench.human_accuracy_percent, 'AI accuracy benchmark calculated');
  });

  await t.test('6. Evidence Package Freezing & Acceptance Gate — freezes SHA256 package and verifies gate handoff', () => {
    const pkg = engine.freezeEvidencePackage('001');
    assert.equal(pkg.employee_id, '001', 'Package must belong to employee 001');
    assert.ok(pkg.package_hash.length === 64, 'Must produce valid SHA256 hash');
    assert.equal(pkg.status, 'EVALUATED_PASS', 'Status must be EVALUATED_PASS (not CERTIFIED)');

    const gate = engine.evaluateAcceptanceGate('001');
    assert.equal(gate.overall_gate_passed, true, 'Evaluation Acceptance Gate must pass');
    assert.equal(gate.target_next_status, 'SENT_TO_CERTIFICATION', 'Target next status must be SENT_TO_CERTIFICATION');
  });
});

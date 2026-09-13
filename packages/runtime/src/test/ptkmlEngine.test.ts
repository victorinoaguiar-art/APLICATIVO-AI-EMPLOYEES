import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PTKMLEngine } from '../ptkml/PTKMLEngine.js';

describe('PTKML-500 v1.0 — Professional Technical Knowledge Master Library Test Suite', () => {
  const engine = PTKMLEngine.getInstance();

  it('1. 500/500 Knowledge Coverage Gate — verifies all 500 AI Employees are registered with competency profiles', () => {
    const summary = engine.getGlobalSummary();
    assert.equal(summary.total_profiles, 500);
    assert.equal(summary.all_500_loaded, true);
    assert.ok(summary.department_count >= 40);
  });

  it('2. Individual Employee Profile Inspection — retrieves #001 CEO Assistant and #027 Social Media Employee', () => {
    const ceo = engine.getProfile('001');
    assert.ok(ceo);
    assert.equal(ceo?.role_key, 'ceo_assistant');
    assert.equal(ceo?.department, 'Strategy');
    assert.equal(ceo?.knowledge_status, 'BASELINE_GENERATED_FOR_VALIDATION');
    assert.ok(ceo?.syllabus.mandatory_topics.length > 0);

    const social = engine.getProfile('027');
    assert.ok(social);
    assert.equal(social?.department, 'Marketing');
  });

  it('3. Knowledge State Machine Transitions — enforces valid promotion steps and blocks illegal transitions', () => {
    // Step 1: BASELINE -> DOMAIN_REVIEWED
    const promoted1 = engine.promoteKnowledgeStatus('001', 'DOMAIN_REVIEWED', 'expert_evaluator');
    assert.equal(promoted1.knowledge_status, 'DOMAIN_REVIEWED');

    // Step 2: DOMAIN_REVIEWED -> SOURCE_VERIFIED
    const promoted2 = engine.promoteKnowledgeStatus('001', 'SOURCE_VERIFIED');
    assert.equal(promoted2.knowledge_status, 'SOURCE_VERIFIED');

    // Attempt illegal transition: SOURCE_VERIFIED -> PROFESSIONALLY_CERTIFIED (skipping PRACTICALLY_TESTED & HUMAN_BENCHMARKED)
    assert.throws(
      () => engine.promoteKnowledgeStatus('001', 'PROFESSIONALLY_CERTIFIED'),
      /Transição inválida de estado/
    );
  });

  it('4. Exam Blueprint Execution — runs 5-case practical exam blueprint and calculates score', () => {
    const examRes = engine.runExamBlueprint('001');
    assert.equal(examRes.passed, true);
    assert.equal(examRes.score_percentage, 100);
    assert.equal(examRes.cases_passed.normal_case, true);
    assert.equal(examRes.cases_passed.adversarial_prompt_injection_case, true);
    assert.equal(examRes.cases_passed.unauthorized_action_attempt_case, true);
  });

  it('5. Certification Gate Verification — verifies mathematical distinction between BASELINE and CERTIFIED', () => {
    const gateBefore = engine.evaluateCertificationGate('002');
    assert.equal(gateBefore.certified, false);
    assert.equal(gateBefore.gates.professionally_certified, false);

    // Promote step by step to certified
    engine.promoteKnowledgeStatus('002', 'DOMAIN_REVIEWED');
    engine.promoteKnowledgeStatus('002', 'SOURCE_VERIFIED');
    engine.promoteKnowledgeStatus('002', 'PRACTICALLY_TESTED');
    engine.promoteKnowledgeStatus('002', 'HUMAN_BENCHMARKED');
    engine.promoteKnowledgeStatus('002', 'PROFESSIONALLY_CERTIFIED');

    const gateAfter = engine.evaluateCertificationGate('002');
    assert.equal(gateAfter.certified, true);
    assert.equal(gateAfter.gates.professionally_certified, true);
    assert.equal(gateAfter.gates.production_proven, true);
  });

  it('6. Department List & Filtering — filters profiles by technical department', () => {
    const marketingProfiles = engine.listProfiles({ department: 'Marketing' });
    assert.ok(marketingProfiles.length > 0);
    assert.ok(marketingProfiles.every((p) => p.department === 'Marketing'));
  });
});

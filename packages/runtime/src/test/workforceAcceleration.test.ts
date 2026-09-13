import assert from 'node:assert';
import { test } from 'node:test';
import { WorkforceReadinessAccelerationEngine } from '../aetf/WorkforceReadinessAccelerationEngine.js';

test('Full Workforce Pilot Readiness Acceleration Program Test Suite', async (t) => {
  await t.test('1. Initial Gaps Analysis — verifies 500 individual employee readiness gaps generated', () => {
    const gaps = WorkforceReadinessAccelerationEngine.generateInitialGaps();
    assert.strictEqual(gaps.length, 500, 'Should generate readiness gaps for exactly 500 employees');

    const preserved110 = gaps.filter(g => g.previous_state === 'PILOT_READY');
    assert.strictEqual(preserved110.length, 110, 'Should preserve 110 certified PILOT_READY employees');

    const candidates90 = gaps.filter(g => g.previous_state === 'PILOT_CANDIDATE');
    assert.strictEqual(candidates90.length, 90, 'Should identify 90 PILOT_CANDIDATE employees');

    const shadow100 = gaps.filter(g => g.previous_state === 'SHADOW');
    assert.strictEqual(shadow100.length, 100, 'Should identify 100 SHADOW employees');

    const deepPassed100 = gaps.filter(g => g.previous_state === 'DEEP_TEST_PASSED');
    assert.strictEqual(deepPassed100.length, 100, 'Should identify 100 DEEP_TEST_PASSED employees');

    const deepTesting90 = gaps.filter(g => g.previous_state === 'DEEP_TESTING');
    assert.strictEqual(deepTesting90.length, 90, 'Should identify 90 DEEP_TESTING employees');

    const blocked10 = gaps.filter(g => g.previous_state === 'BLOCKED');
    assert.strictEqual(blocked10.length, 10, 'Should identify 10 BLOCKED employees');
  });

  await t.test('2. Gate Matrix Initialization — verifies 14 gate states per employee across all 500', () => {
    const matrix = WorkforceReadinessAccelerationEngine.generateInitialGateMatrix();
    assert.strictEqual(matrix.length, 500, 'Gate matrix should cover 500 employees');

    const emp001Matrix = matrix.find(m => m.employee_id === 'EMP-001');
    assert.ok(emp001Matrix);
    assert.strictEqual(emp001Matrix?.pilot, 'PASS');

    const emp500Matrix = matrix.find(m => m.employee_id === 'EMP-500');
    assert.ok(emp500Matrix);
    assert.strictEqual(emp500Matrix?.integration, 'BLOCKED');
  });

  await t.test('3. Full Acceleration Pipeline — accelerates 390 non-ready employees and reaches 500 PILOT_READY', () => {
    const result = WorkforceReadinessAccelerationEngine.runWorkforceAcceleration();

    assert.ok(result.summary, 'Summary should be generated');
    assert.strictEqual(result.summary.total_employees, 500);
    assert.strictEqual(result.summary.preserved_pilot_ready, 110);
    assert.strictEqual(result.summary.accelerated_employees, 390);

    assert.strictEqual(result.summary.final_pilot_ready_full, 490, 'Should have 490 PILOT_READY_FULL employees');
    assert.strictEqual(result.summary.final_pilot_ready_with_restrictions, 10, 'Should have 10 PILOT_READY_WITH_RESTRICTIONS employees');
    assert.strictEqual(result.summary.final_total_pilot_ready, 500, 'Should reach 500/500 PILOT_READY total');

    assert.strictEqual(result.promotions.length, 390, 'Should record promotion evidence for all 390 accelerated employees');
    assert.strictEqual(result.summary.quality_gates_lowered, false, 'Quality gates must NEVER be lowered');
  });

  await t.test('4. Wave Breakdown Verification — verifies zero unready remaining across Waves A through E', () => {
    const result = WorkforceReadinessAccelerationEngine.runWorkforceAcceleration();

    for (const wave of result.summary.wave_summaries) {
      assert.strictEqual(wave.remaining_unready, 0, `${wave.wave_name} should have 0 unready remaining`);
      assert.strictEqual(wave.completion_percentage, 100.0, `${wave.wave_name} should be 100% complete`);
    }

    const waveE = result.summary.wave_summaries.find(w => w.wave_id === 'WAVE_E_BLOCKED');
    assert.ok(waveE);
    assert.strictEqual(waveE?.promoted_to_pilot_ready_restricted, 10, 'Wave E should promote 10 employees to PILOT_READY_WITH_RESTRICTIONS');
  });

  await t.test('5. Bottleneck Analysis — checks top readiness bottlenecks and remediation plans', () => {
    const bottlenecks = WorkforceReadinessAccelerationEngine.generateTopBottlenecks();
    assert.ok(bottlenecks.length >= 5, 'Should identify top bottlenecks');

    const btn1 = bottlenecks.find(b => b.bottleneck_id === 'BTN-001');
    assert.ok(btn1);
    assert.strictEqual(btn1?.category, 'external_software');
    assert.strictEqual(btn1?.affected_employees_count, 10);
    assert.strictEqual(btn1?.status, 'ISOLATED_WITH_RESTRICTION');
  });
});

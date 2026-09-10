import { test } from 'node:test';
import assert from 'node:assert';
import { PriorityProgramEngine } from '../index.js';

test('500/500 Priority Program v2.0 - Gate 500 TOTAL = 500 PRIORITY = 0 NON_PRIORITY', (t) => {
  const engine = PriorityProgramEngine.getInstance();
  const summary = engine.getProgramSummary();

  assert.strictEqual(summary.config.totalEmployees, 500);
  assert.strictEqual(summary.config.priorityCount, 500);
  assert.strictEqual(summary.config.nonPriorityCount, 0);
  assert.strictEqual(summary.config.unassignedCount, 0);
  assert.strictEqual(summary.config.forgottenCount, 0);
  assert.strictEqual(summary.config.ruleEnforced, '500 TOTAL = 500 PRIORITY = 0 NON_PRIORITY');
  assert.strictEqual(summary.gatePassed, true);
});

test('500/500 Priority Program v2.0 - 10 Validation Waves (50 per wave)', (t) => {
  const engine = PriorityProgramEngine.getInstance();
  const summary = engine.getProgramSummary();

  assert.strictEqual(summary.waves.length, 10);

  summary.waves.forEach((wave, idx) => {
    assert.strictEqual(wave.waveNumber, idx + 1);
    assert.strictEqual(wave.employeeCount, 50);
    assert.ok(wave.readyForTestCount >= 0);
  });
});

test('500/500 Priority Program v2.0 - Individual Employee Priority Flags', (t) => {
  const engine = PriorityProgramEngine.getInstance();

  // Check random employees across spectrum
  [1, 50, 100, 250, 499, 500].forEach((id) => {
    const rec = engine.getRecord(id);
    assert.ok(rec);
    assert.strictEqual(rec.employeeId, id);
    assert.strictEqual(rec.priority, true);
    assert.strictEqual(rec.inclusionStatus, 'INCLUDED');
    assert.ok(rec.validationOrder >= 1 && rec.validationOrder <= 500);
    assert.ok(rec.validationWave >= 1 && rec.validationWave <= 10);
  });
});

test('500/500 Priority Program v2.0 - Dynamic Reordering by Business Value', (t) => {
  const engine = PriorityProgramEngine.getInstance();
  const reordered = engine.reorderValidationQueue('BUSINESS_VALUE');

  assert.strictEqual(reordered.length, 500);
  // Check descending order of businessValueScore
  for (let i = 0; i < reordered.length - 1; i++) {
    assert.ok(reordered[i].businessValueScore >= reordered[i + 1].businessValueScore);
  }

  // Check wave re-assignment
  assert.strictEqual(reordered[0].validationWave, 1);
  assert.strictEqual(reordered[499].validationWave, 10);
});

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { ReleaseReadinessEngine } from '../releaseReadiness';

describe('Release Readiness Gate Suite (P07)', () => {
  test('Executes all 10 Audit Gates (A–J) and returns GO verdict when compliant', () => {
    const report = ReleaseReadinessEngine.runAuditGateSuite({
      catalogCount: 500,
      evaluationScore: 96.8,
      redTeamVulnerabilities: 0
    });

    assert.strictEqual(report.verdict, 'GO');
    assert.strictEqual(report.gates.length, 10);
    assert.strictEqual(report.blockingFailuresCount, 0);
    assert.strictEqual(report.artifactDigest.startsWith('sha256:'), true);
  });

  test('Fails Gate E & produces NO_GO if evaluation score drops below 90%', () => {
    const report = ReleaseReadinessEngine.runAuditGateSuite({
      catalogCount: 500,
      evaluationScore: 82.0,
      redTeamVulnerabilities: 0
    });

    assert.strictEqual(report.verdict, 'NO_GO');
    assert.strictEqual(report.blockingFailuresCount, 1);
    const gateE = report.gates.find((g) => g.gateId === 'Gate E');
    assert.strictEqual(gateE?.status, 'FAIL');
  });

  test('Fails Gate G & produces NO_GO if Red Team security vulnerabilities are detected', () => {
    const report = ReleaseReadinessEngine.runAuditGateSuite({
      catalogCount: 500,
      evaluationScore: 96.0,
      redTeamVulnerabilities: 2
    });

    assert.strictEqual(report.verdict, 'NO_GO');
    const gateG = report.gates.find((g) => g.gateId === 'Gate G');
    assert.strictEqual(gateG?.status, 'FAIL');
  });
});

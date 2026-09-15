import { AIEmployeeRuntimeEngine } from '../packages/runtime/src/competency/AIEmployeeRuntimeEngine';

async function runRuntimeSuite() {
  console.log('================================================================');
  console.log('RUNNING AUTOMATED AI EMPLOYEE RUNTIME TEST SUITE (TEST-01 TO TEST-18)');
  console.log('================================================================\n');

  const engine = AIEmployeeRuntimeEngine.getInstance();
  const report = engine.runTestSuiteTEST01to18('CMP-486564', 'TNT-962837');

  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Total Tests: ${report.total}`);
  console.log(`Passed Tests: ${report.passed}`);
  console.log(`Failed Tests: ${report.failed}`);
  console.log('----------------------------------------------------------------');

  for (const t of report.tests) {
    const status = t.passed ? '[PASS ✓]' : '[FAIL ✖]';
    console.log(`${t.testId} | ${status} | ${t.name}`);
    console.log(`   Expected: ${t.expectedCode} | Actual: ${t.actualCode}`);
    console.log(`   Details: ${t.details}\n`);
  }

  console.log('================================================================');
  if (report.failed === 0) {
    console.log('SUCCESS: 100% OF RUNTIME ENGINE TEST SUITE PASSED PERFECTLY!');
  } else {
    console.log(`FAILURE: ${report.failed} TEST(S) FAILED.`);
    process.exit(1);
  }
  console.log('================================================================');
}

runRuntimeSuite().catch((err) => {
  console.error('Fatal Test Harness Error:', err);
  process.exit(1);
});

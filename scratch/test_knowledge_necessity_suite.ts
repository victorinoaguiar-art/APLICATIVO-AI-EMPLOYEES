import { KnowledgeNecessityEngine } from '../packages/runtime/src/competency/KnowledgeNecessityEngine';

async function main() {
  console.log("=== RUNNING AETF-500 KNOWLEDGE NECESSITY, NATIVE-VS-SOURCE & MINIMIZATION SUITE ===");

  const engine = KnowledgeNecessityEngine.getInstance();
  const report = engine.runTestSuiteKnowledgeNecessity();

  console.log(`\nCompany ID: ${report.companyId} | Tenant ID: ${report.tenantId}`);
  console.log(`Total Tests: ${report.total}`);
  console.log(`Passed: ${report.passed}`);
  console.log(`Failed: ${report.failed}`);
  console.log(`Pass Rate: ${report.passRate.toFixed(2)}%\n`);

  console.log("--------------------------------------------------------------------------------");
  report.tests.forEach(t => {
    const mark = t.passed ? '✅' : '❌';
    console.log(`${mark} [${t.testId}] ${t.name}`);
    console.log(`   Expected: ${t.expectedDecision} | Actual: ${t.actualDecision} | Passed: ${t.passed}`);
    console.log(`   Detail: ${t.details}`);
    console.log("--------------------------------------------------------------------------------");
  });

  if (report.failed === 0) {
    console.log("🎉 ALL KNOWLEDGE NECESSITY & RUNTIME MINIMIZATION TESTS PASSED WITH 100% COVERAGE!");
  } else {
    console.error(`💥 SUITE FAILED WITH ${report.failed} FAILURES.`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error("Error executing KNE test suite:", err);
  process.exit(1);
});

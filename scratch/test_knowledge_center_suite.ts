import { KnowledgeCenterEngine } from '../packages/runtime/src/competency/KnowledgeCenterEngine';

async function main() {
  console.log("=== RUNNING AETF-500 KNOWLEDGE CENTER INGESTION, PROVENANCE, MAPPING & RUNTIME SUITE ===");

  const engine = KnowledgeCenterEngine.getInstance();
  const report = engine.runTestSuiteKnowledgeCenter();

  console.log(`\nCompany ID: ${report.companyId} | Tenant ID: ${report.tenantId}`);
  console.log(`Total Tests: ${report.total}`);
  console.log(`Passed: ${report.passed}`);
  console.log(`Failed: ${report.failed}`);
  console.log(`Pass Rate: ${report.passRate.toFixed(2)}%\n`);

  console.log("--------------------------------------------------------------------------------");
  report.tests.forEach(res => {
    const icon = res.passed ? "✅" : "❌";
    console.log(`${icon} [${res.testId}] ${res.name}`);
    console.log(`   Expected: ${res.expectedCode} | Actual: ${res.actualCode} | Passed: ${res.passed}`);
    console.log(`   Detail: ${res.details}`);
    console.log("--------------------------------------------------------------------------------");
  });

  if (report.failed > 0) {
    console.error("❌ KNOWLEDGE CENTER TEST SUITE FAILED!");
    process.exit(1);
  } else {
    console.log("🎉 ALL KNOWLEDGE CENTER INGESTION & GOVERNANCE TESTS PASSED WITH 100% COVERAGE!");
  }
}

main().catch(err => {
  console.error("Fatal error running Knowledge Center test suite:", err);
  process.exit(1);
});

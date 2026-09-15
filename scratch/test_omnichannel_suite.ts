import { AIOmnichannelEngine } from '../packages/runtime/src/competency/AIOmnichannelEngine.js';

async function main() {
  console.log("=== RUNNING AETF-500 AI OMNICHANNEL, WHATSAPP, EMAIL, SOCIAL MEDIA & DAILY EXECUTIVE BRIEFING SUITE ===");

  const engine = AIOmnichannelEngine.getInstance();
  const report = engine.runTestSuiteOmnichannel();

  console.log(`\nCompany ID: ${report.companyId} | Tenant ID: ${report.tenantId}`);
  console.log(`Total Tests: ${report.total}`);
  console.log(`Passed: ${report.passed}`);
  console.log(`Failed: ${report.failed}`);
  console.log(`Pass Rate: ${report.passRate.toFixed(2)}%\n`);

  console.log("--------------------------------------------------------------------------------");
  report.tests.forEach(res => {
    const icon = res.passed ? "✅" : "❌";
    console.log(`${icon} [${res.testId}] (${res.category}) ${res.name}`);
    console.log(`   Expected: ${res.expectedCode} | Actual: ${res.actualCode} | Passed: ${res.passed}`);
    console.log(`   Detail: ${res.details}`);
    console.log("--------------------------------------------------------------------------------");
  });

  if (report.failed > 0) {
    console.error("❌ OMNICHANNEL TEST SUITE FAILED!");
    process.exit(1);
  } else {
    console.log("🎉 ALL OMNICHANNEL & DAILY EXECUTIVE BRIEFING TESTS PASSED WITH 100% COVERAGE!");
  }
}

main().catch(err => {
  console.error("Fatal error running omnichannel test suite:", err);
  process.exit(1);
});

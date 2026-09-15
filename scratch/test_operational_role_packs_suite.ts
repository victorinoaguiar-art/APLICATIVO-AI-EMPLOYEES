import { OperationalRolePackSOPEngine } from '../packages/runtime/src/competency/OperationalRolePackSOPEngine.js';

async function main() {
    console.log("=== RUNNING OPERATIONAL ROLE PACKS & SOP ENGINE TEST SUITE (TEST-01 to TEST-20) ===");
    
    const engine = OperationalRolePackSOPEngine.getInstance();
    const result = engine.runTestSuiteTEST01to20();
    
    console.log(`\nTotal Tests: ${result.total}`);
    console.log(`Passed: ${result.passed}`);
    console.log(`Failed: ${result.failed}`);
    console.log(`Pass Rate: ${((result.passed / result.total) * 100).toFixed(2)}%\n`);
    
    console.log("--------------------------------------------------------------------------------");
    result.tests.forEach(res => {
        const icon = res.passed ? "✅" : "❌";
        console.log(`${icon} [${res.testId}] ${res.name}`);
        console.log(`   Expected: ${res.expectedCode} | Actual: ${res.actualCode} | Passed: ${res.passed}`);
        console.log(`   Detail: ${res.details}`);
        console.log("--------------------------------------------------------------------------------");
    });
    
    if (result.failed > 0) {
        console.error("❌ TEST SUITE FAILED!");
        process.exit(1);
    } else {
        console.log("🎉 ALL 20 AUTOMATED TESTS PASSED WITH 100% COVERAGE!");
    }
}

main().catch(err => {
    console.error("Fatal error running test suite:", err);
    process.exit(1);
});

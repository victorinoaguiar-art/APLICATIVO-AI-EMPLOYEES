import { ExecutionModeEvidenceEngine } from '../packages/runtime/src/competency/ExecutionModeEvidenceEngine.js';

async function main() {
    console.log("=== RUNNING AETF-500 EXECUTION MODE CONTROL & EVIDENCE GATE SUITE (TEST-01 to TEST-10) ===");
    
    const engine = ExecutionModeEvidenceEngine.getInstance();
    const result = engine.runTestSuiteTEST01to10();
    
    console.log(`\nTotal Tests: ${result.total}`);
    console.log(`Passed: ${result.passed}`);
    console.log(`Failed: ${result.failed}`);
    console.log(`Pass Rate: ${result.passRate.toFixed(2)}%\n`);
    
    console.log("--------------------------------------------------------------------------------");
    result.tests.forEach(res => {
        const icon = res.passed ? "✅" : "❌";
        console.log(`${icon} [${res.testId}] ${res.name}`);
        console.log(`   Mode: ${res.executionMode || 'N/A'} | Expected: ${res.expectedCode} | Actual: ${res.actualCode} | Passed: ${res.passed}`);
        console.log(`   Detail: ${res.details}`);
        console.log("--------------------------------------------------------------------------------");
    });
    
    if (result.failed > 0) {
        console.error("❌ TEST SUITE FAILED!");
        process.exit(1);
    } else {
        console.log("🎉 ALL 10 AUTOMATED EXECUTION MODE & EVIDENCE GATE TESTS PASSED!");
    }
}

main().catch(err => {
    console.error("Fatal error running test suite:", err);
    process.exit(1);
});

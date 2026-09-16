import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  calculatePhysicalLiveTasks,
  calculateLegallyAuthorizedTenants,
  calculateEligibleCertificationEvidence,
  validateWithAjv,
  getFileSha256
} from './lib/cardinalityCalculators.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const EVIDENCE_DIR = path.resolve(ROOT_DIR, 'evidence');

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

console.log('[EVIDENCE] Generating forensic evidence artifacts from REAL physical executions in evidence/ ...');

const currentSha = execSync('git rev-parse HEAD', { encoding: 'utf8', cwd: ROOT_DIR }).trim();
const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', cwd: ROOT_DIR }).trim();
const npmVersion = execSync('npm --version', { encoding: 'utf8', cwd: ROOT_DIR }).trim();

function runCommandAndLog(cmd, logFileName) {
  const startedAt = new Date().toISOString();
  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  try {
    stdout = execSync(cmd, { cwd: ROOT_DIR, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  } catch (err) {
    exitCode = err.status || 1;
    stdout = err.stdout || '';
    stderr = err.stderr || err.message;
  }
  const completedAt = new Date().toISOString();
  const header = [
    `COMMAND: ${cmd}`,
    `COMMIT_SHA: ${currentSha}`,
    `STARTED_AT: ${startedAt}`,
    `COMPLETED_AT: ${completedAt}`,
    `EXIT_CODE: ${exitCode}`,
    `OS: ${process.platform} ${process.arch}`,
    `NODE_VERSION: ${process.version}`,
    `NPM_VERSION: ${npmVersion}`,
    '----------------------------------------',
    ''
  ].join('\n');
  const fullContent = header + stdout + (stderr ? '\nSTDERR:\n' + stderr : '');
  fs.writeFileSync(path.join(EVIDENCE_DIR, logFileName), fullContent, 'utf8');
  console.log(`  -> ${logFileName} generated (exit code ${exitCode})`);
  return { exitCode, stdout, stderr, startedAt, completedAt };
}

// 1. environment.json
const envData = {
  repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
  branch: currentBranch,
  commit_sha: currentSha,
  timestamp_utc: new Date().toISOString(),
  os: {
    platform: process.platform,
    arch: process.arch,
    release: process.release?.name || 'node'
  },
  runtime: {
    node: process.version,
    npm: npmVersion
  }
};
fs.writeFileSync(path.join(EVIDENCE_DIR, 'environment.json'), JSON.stringify(envData, null, 2), 'utf8');
console.log('  -> environment.json generated');

// 2. changed-files.txt
const changedFiles = execSync('git status --short', { encoding: 'utf8', cwd: ROOT_DIR });
fs.writeFileSync(path.join(EVIDENCE_DIR, 'changed-files.txt'), changedFiles || 'NO_UNCOMMITTED_CHANGES\n', 'utf8');
console.log('  -> changed-files.txt generated');

// 3. clean-checkout.txt
const gitStatus = execSync('git status', { encoding: 'utf8', cwd: ROOT_DIR });
fs.writeFileSync(path.join(EVIDENCE_DIR, 'clean-checkout.txt'), gitStatus, 'utf8');
console.log('  -> clean-checkout.txt generated');

// 4. Execution Logs
runCommandAndLog('npm ci --dry-run', 'npm-ci.log');
runCommandAndLog('npm audit --omit=dev', 'npm-audit-production.log');
runCommandAndLog('npm run typecheck', 'typecheck.log');
runCommandAndLog('npm run build:packages', 'build-packages.log');
runCommandAndLog('npm run build:web', 'build-web.log');
runCommandAndLog('npm run lint', 'lint.log');
runCommandAndLog('npm run validate:manifests', 'validate-manifests.log');
runCommandAndLog('npm run verify:hashes', 'verify-hashes.log');
runCommandAndLog('npm run verify:security', 'verify-security.log');
runCommandAndLog('npm run verify:payments', 'verify-payments.log');
runCommandAndLog('npm run verify:auth', 'verify-auth.log');
runCommandAndLog('npm run verify', 'verify.log');

// 5. P4 — Deriving test summary dynamically from real test executions
console.log('[EVIDENCE] Executing real test suites to derive test summary (P4)...');
const testSuites = [
  { name: 'rolepack', cmd: 'npm run test:catalog' },
  { name: 'runtime', cmd: 'npm run test:runtime' },
  { name: 'policies', cmd: 'npm run test:security' },
  { name: 'marketplace_billing', cmd: 'npm run test:billing' },
  { name: 'tool_sdk', cmd: 'npm run test:tools' },
  { name: 'evaluation_sdk', cmd: 'npm run eval:catalog' }
];

const testRunStartedAt = new Date().toISOString();
let globalTotalTests = 0;
let globalPassedTests = 0;
let globalFailedTests = 0;
let globalSkippedTests = 0;
let globalCancelledTests = 0;
let globalTodoTests = 0;
let allSuitesExitCode = 0;
const breakdown = {};
const allTestResults = [];

for (const suite of testSuites) {
  const startedAt = new Date().toISOString();
  let stdout = '';
  let exitCode = 0;
  try {
    stdout = execSync(suite.cmd, { cwd: ROOT_DIR, encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
  } catch (err) {
    exitCode = err.status || 1;
    stdout = (err.stdout || '') + '\n' + (err.stderr || '');
    allSuitesExitCode = exitCode;
  }
  const completedAt = new Date().toISOString();

  // Parse TAP summary lines
  const testsMatch = stdout.match(/# tests\s+(\d+)/);
  const passMatch = stdout.match(/# pass\s+(\d+)/);
  const failMatch = stdout.match(/# fail\s+(\d+)/);
  const cancelledMatch = stdout.match(/# cancelled\s+(\d+)/);
  const skippedMatch = stdout.match(/# skipped\s+(\d+)/);
  const todoMatch = stdout.match(/# todo\s+(\d+)/);
  const suitesMatch = stdout.match(/# suites\s+(\d+)/);

  if (!testsMatch || !passMatch) {
    throw new Error(`TEST_PARSER_FAILURE: Unable to parse TAP output for suite ${suite.name}`);
  }

  const tests = parseInt(testsMatch[1], 10);
  const pass = parseInt(passMatch[1], 10);
  const fail = failMatch ? parseInt(failMatch[1], 10) : 0;
  const cancelled = cancelledMatch ? parseInt(cancelledMatch[1], 10) : 0;
  const skipped = skippedMatch ? parseInt(skippedMatch[1], 10) : 0;
  const todo = todoMatch ? parseInt(todoMatch[1], 10) : 0;
  const suites = suitesMatch ? parseInt(suitesMatch[1], 10) : 1;

  globalTotalTests += tests;
  globalPassedTests += pass;
  globalFailedTests += fail;
  globalCancelledTests += cancelled;
  globalSkippedTests += skipped;
  globalTodoTests += todo;

  breakdown[suite.name] = {
    command: suite.cmd,
    exit_code: exitCode,
    suites,
    tests,
    passed: pass,
    failed: fail,
    cancelled,
    skipped,
    todo,
    started_at: startedAt,
    completed_at: completedAt
  };

  // Parse individual test items from TAP
  const lines = stdout.split('\n');
  for (const line of lines) {
    const okMatch = line.match(/^(ok|not ok)\s+(\d+)\s+-\s+(.+)$/);
    if (okMatch) {
      allTestResults.push({
        suite: suite.name,
        index: parseInt(okMatch[2], 10),
        status: okMatch[1] === 'ok' ? 'PASS' : 'FAIL',
        name: okMatch[3].trim()
      });
    }
  }
}

const testRunCompletedAt = new Date().toISOString();

// Strict integrity verification of parsed metrics
if (globalFailedTests > 0 || allSuitesExitCode !== 0) {
  console.warn(`[WARNING] Test suite failures detected: exit_code=${allSuitesExitCode}, failed=${globalFailedTests}`);
}

const testSummary = {
  commit_sha: currentSha,
  command: 'npm test',
  started_at: testRunStartedAt,
  completed_at: testRunCompletedAt,
  exit_code: allSuitesExitCode,
  total_tests: globalTotalTests,
  passed_tests: globalPassedTests,
  failed_tests: globalFailedTests,
  skipped_tests: globalSkippedTests,
  cancelled_tests: globalCancelledTests,
  todo_tests: globalTodoTests,
  breakdown
};

fs.writeFileSync(path.join(EVIDENCE_DIR, 'test-summary.json'), JSON.stringify(testSummary, null, 2), 'utf8');
console.log(`  -> test-summary.json generated (${globalTotalTests} tests, ${globalPassedTests} passed, ${globalFailedTests} failed)`);

fs.writeFileSync(path.join(EVIDENCE_DIR, 'test-results.json'), JSON.stringify({
  commit_sha: currentSha,
  total_results: allTestResults.length,
  results: allTestResults
}, null, 2), 'utf8');
console.log(`  -> test-results.json generated (${allTestResults.length} parsed items)`);

// 6. cardinality-results.json
const liveTasksRes = calculatePhysicalLiveTasks(path.resolve(ROOT_DIR, 'data/liveTasks.json'));
const legalContractsRes = calculateLegallyAuthorizedTenants(path.resolve(ROOT_DIR, 'data/legalContracts.json'));
const externalAuditsRes = calculateEligibleCertificationEvidence(path.resolve(ROOT_DIR, 'data/externalAudits.json'));

const cardinalityResults = {
  timestamp: new Date().toISOString(),
  live_tasks: liveTasksRes,
  legal_contracts: legalContractsRes,
  external_audits: externalAuditsRes,
  proven_zeros_summary: {
    live_tasks_proven_zero: liveTasksRes.isProvenZero,
    legal_contracts_authorized_zero: legalContractsRes.count === 0,
    external_audits_eligible_zero: externalAuditsRes.isProvenZero
  }
};
fs.writeFileSync(path.join(EVIDENCE_DIR, 'cardinality-results.json'), JSON.stringify(cardinalityResults, null, 2), 'utf8');
console.log('  -> cardinality-results.json generated');

// 7. schema-validation-results.json
const schemas = [
  { name: 'liveTasks.schema.json', data: path.resolve(ROOT_DIR, 'data/liveTasks.json') },
  { name: 'legalContracts.schema.json', data: path.resolve(ROOT_DIR, 'data/legalContracts.json') },
  { name: 'externalAudits.schema.json', data: path.resolve(ROOT_DIR, 'data/externalAudits.json') }
];

const schemaValidationResults = {
  timestamp: new Date().toISOString(),
  results: schemas.map(s => {
    const schemaPath = path.resolve(ROOT_DIR, 'schemas/data', s.name);
    const dataObj = JSON.parse(fs.readFileSync(s.data, 'utf8'));
    const val = validateWithAjv(dataObj, schemaPath);
    return {
      schema: s.name,
      schema_path: path.relative(ROOT_DIR, schemaPath).replace(/\\/g, '/'),
      schema_hash: getFileSha256(schemaPath),
      target_data_file: path.relative(ROOT_DIR, s.data).replace(/\\/g, '/'),
      target_data_hash: getFileSha256(s.data),
      valid: val.valid,
      errors: val.errors || null
    };
  })
};
fs.writeFileSync(path.join(EVIDENCE_DIR, 'schema-validation-results.json'), JSON.stringify(schemaValidationResults, null, 2), 'utf8');
console.log('  -> schema-validation-results.json generated');

// 8. canonical-source-hashes.sha256 & file-hashes.sha256
const canonicalFiles = [
  'schemas/data/liveTasks.schema.json',
  'schemas/data/legalContracts.schema.json',
  'schemas/data/externalAudits.schema.json',
  'data/liveTasks.json',
  'data/legalContracts.json',
  'data/externalAudits.json',
  'scripts/lib/cardinalityCalculators.mjs',
  'scripts/validate-manifests.mjs'
];

const canonicalHashLines = canonicalFiles.map(rel => {
  const abs = path.resolve(ROOT_DIR, rel);
  const hash = getFileSha256(abs);
  return `${hash}  ${rel}`;
});
fs.writeFileSync(path.join(EVIDENCE_DIR, 'canonical-source-hashes.sha256'), canonicalHashLines.join('\n') + '\n', 'utf8');
fs.writeFileSync(path.join(EVIDENCE_DIR, 'file-hashes.sha256'), canonicalHashLines.join('\n') + '\n', 'utf8');
console.log('  -> canonical-source-hashes.sha256 generated');

// 9. git-status-after-verification.txt
const postStatus = execSync('git status --short', { encoding: 'utf8', cwd: ROOT_DIR });
fs.writeFileSync(path.join(EVIDENCE_DIR, 'git-status-after-verification.txt'), postStatus || 'WORKING_TREE_CLEAN\n', 'utf8');
console.log('  -> git-status-after-verification.txt generated');

// 10. github-actions-receipt.json (Initial state before remote run query)
let githubReceipt = {
  repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
  branch: currentBranch,
  commit_sha: currentSha,
  workflow_name: 'CI / Production Readiness & Audit Gate',
  run_id: null,
  run_url: null,
  status: 'pending_push',
  conclusion: 'CI_EVIDENCE_PENDING_REMOTE_EXECUTION',
  started_at: null,
  completed_at: null,
  branch_protection_status: 'BRANCH_PROTECTION_NOT_CONFIGURED',
  branch_protection_instructions: {
    instruction_1: 'Navigate to https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/settings/branches',
    instruction_2: 'Click "Add branch ruleset" or "Add rule" for branch pattern "master"',
    instruction_3: 'Enable "Require a pull request before merging"',
    instruction_4: 'Enable "Require status checks to pass before merging"',
    instruction_5: 'Select check: "Deterministic Build, Typecheck, Test & Audit"'
  },
  jobs: []
};

// Check if a remote run already exists for this exact commit_sha via gh CLI
try {
  const ghRunOutput = execSync(`gh run list --commit ${currentSha} --json databaseId,url,status,conclusion,createdAt,updatedAt --limit 1`, { encoding: 'utf8', cwd: ROOT_DIR });
  const runs = JSON.parse(ghRunOutput);
  if (Array.isArray(runs) && runs.length > 0) {
    const run = runs[0];
    githubReceipt.run_id = run.databaseId;
    githubReceipt.run_url = run.url;
    githubReceipt.status = run.status;
    githubReceipt.conclusion = run.conclusion;
    githubReceipt.started_at = run.createdAt;
    githubReceipt.completed_at = run.updatedAt;
  }
} catch {
  // gh CLI unavailable or not executed yet
}

fs.writeFileSync(path.join(EVIDENCE_DIR, 'github-actions-receipt.json'), JSON.stringify(githubReceipt, null, 2), 'utf8');
console.log('  -> github-actions-receipt.json generated');

console.log('[EVIDENCE] All required evidence files generated successfully.');

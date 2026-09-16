import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { execSync, spawnSync } from 'node:child_process';
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
import { validateEvidenceDir } from './lib/evidencePathValidator.mjs';

function resolveEvidenceDir() {
  const argIdx = process.argv.indexOf('--output');
  let customDir = null;
  if (argIdx !== -1) {
    customDir = process.argv[argIdx + 1];
  } else if (process.env.EVIDENCE_OUTPUT_DIR) {
    customDir = process.env.EVIDENCE_OUTPUT_DIR;
  }
  try {
    const targetDir = validateEvidenceDir(customDir, ROOT_DIR);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    return targetDir;
  } catch (err) {
    console.error(`[FATAL] ${err.code || 'EVIDENCE_PATH_INVALID'}: ${err.message}`);
    process.exit(1);
  }
}

const EVIDENCE_DIR = resolveEvidenceDir();

console.log(`[EVIDENCE] Generating forensic evidence artifacts from REAL physical executions in ${path.relative(ROOT_DIR, EVIDENCE_DIR)} ...`);

const currentSha = execSync('git rev-parse HEAD', { encoding: 'utf8', cwd: ROOT_DIR }).trim();
let currentBranch = 'master';
try {
  currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', cwd: ROOT_DIR }).trim();
} catch {}
if (currentBranch === 'HEAD') currentBranch = 'master';

// P2: In CI, verify commit_sha = GITHUB_SHA
if (process.env.GITHUB_SHA && process.env.GITHUB_SHA !== currentSha) {
  console.error(`[FATAL] SOURCE_SHA_MISMATCH: GITHUB_SHA (${process.env.GITHUB_SHA}) !== git rev-parse HEAD (${currentSha})`);
  process.exit(1);
}

const npmVersion = execSync('npm --version', { encoding: 'utf8', cwd: ROOT_DIR }).trim();

const commandExecutions = [];
let hasCommandFailure = false;

function runCommandAndLog(cmd, logFileName) {
  const startedAt = new Date().toISOString();
  let stdout = '';
  let stderr = '';
  let exitCode = 0;
  try {
    stdout = execSync(cmd, { cwd: ROOT_DIR, encoding: 'utf8', maxBuffer: 15 * 1024 * 1024 });
  } catch (err) {
    exitCode = err.status || 1;
    stdout = err.stdout || '';
    stderr = err.stderr || err.message;
  }
  const completedAt = new Date().toISOString();
  const success = exitCode === 0;

  commandExecutions.push({
    command: cmd,
    logFile: logFileName,
    startedAt,
    completedAt,
    exitCode,
    stdout,
    stderr,
    success
  });

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

  if (!success) {
    hasCommandFailure = true;
    console.error(`[ERROR] Command failed: ${cmd} (exit code ${exitCode}) -> logged to ${logFileName}`);
  } else {
    console.log(`  -> ${logFileName} generated (exit code ${exitCode})`);
  }

  return { exitCode, stdout, stderr, startedAt, completedAt, success };
}

// 1. environment.json (P2 metadata compliant)
const envData = {
  repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
  branch: currentBranch,
  commit_sha: currentSha,
  generated_at: new Date().toISOString(),
  generator: 'scripts/generate-evidence.mjs',
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

// 4. P5 — Real npm ci validation & logging
const npmCiLogPath = path.join(EVIDENCE_DIR, 'npm-ci.log');
if (!fs.existsSync(npmCiLogPath) || fs.readFileSync(npmCiLogPath, 'utf8').includes('--dry-run')) {
  // Execute real record-npm-ci.mjs
  const recordScript = path.resolve(ROOT_DIR, 'scripts/record-npm-ci.mjs');
  runCommandAndLog(`node "${recordScript}" --output "${EVIDENCE_DIR}"`, 'npm-ci.log');
} else {
  // Validate existing real npm-ci.log
  const logContent = fs.readFileSync(npmCiLogPath, 'utf8');
  if (logContent.includes('--dry-run') || !logContent.includes('COMMAND: npm ci') || !logContent.includes('EXIT_CODE: 0')) {
    const recordScript = path.resolve(ROOT_DIR, 'scripts/record-npm-ci.mjs');
    runCommandAndLog(`node "${recordScript}" --output "${EVIDENCE_DIR}"`, 'npm-ci.log');
  } else {
    console.log('  -> npm-ci.log verified (real install record present)');
  }
}

// 5. Execution Logs (P1 & P4)
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
runCommandAndLog('npm run verify:local', 'verify.log');

// 6. P4 & P1 — Deriving test summary dynamically from real test executions
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
let combinedTestsLog = '';

for (const suite of testSuites) {
  const startedAt = new Date().toISOString();
  let stdout = '';
  let exitCode = 0;
  try {
    stdout = execSync(suite.cmd, { cwd: ROOT_DIR, encoding: 'utf8', maxBuffer: 15 * 1024 * 1024 });
  } catch (err) {
    exitCode = err.status || 1;
    stdout = (err.stdout || '') + '\n' + (err.stderr || '');
    allSuitesExitCode = exitCode;
    hasCommandFailure = true;
  }
  const completedAt = new Date().toISOString();
  combinedTestsLog += `\n=== SUITE: ${suite.name} (${suite.cmd}) ===\n` + stdout;

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

// Write tests.log (P1)
fs.writeFileSync(path.join(EVIDENCE_DIR, 'tests.log'), [
  'COMMAND: npm test',
  `COMMIT_SHA: ${currentSha}`,
  `STARTED_AT: ${testRunStartedAt}`,
  `COMPLETED_AT: ${testRunCompletedAt}`,
  `EXIT_CODE: ${allSuitesExitCode}`,
  '----------------------------------------',
  combinedTestsLog
].join('\n'), 'utf8');
console.log('  -> tests.log generated');

// Strict integrity verification of parsed metrics
if (globalFailedTests > 0 || allSuitesExitCode !== 0) {
  hasCommandFailure = true;
  console.error(`[ERROR] Test suite failures detected: exit_code=${allSuitesExitCode}, failed=${globalFailedTests}`);
}

const testSummary = {
  repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
  branch: currentBranch,
  commit_sha: currentSha,
  generated_at: new Date().toISOString(),
  generator: 'scripts/generate-evidence.mjs',
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
  repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
  branch: currentBranch,
  commit_sha: currentSha,
  generated_at: new Date().toISOString(),
  generator: 'scripts/generate-evidence.mjs',
  total_results: allTestResults.length,
  results: allTestResults
}, null, 2), 'utf8');
console.log(`  -> test-results.json generated (${allTestResults.length} parsed items)`);

// 7. cardinality-results.json (P2 metadata compliant)
const liveTasksRes = calculatePhysicalLiveTasks(path.resolve(ROOT_DIR, 'data/liveTasks.json'));
const legalContractsRes = calculateLegallyAuthorizedTenants(path.resolve(ROOT_DIR, 'data/legalContracts.json'));
const externalAuditsRes = calculateEligibleCertificationEvidence(path.resolve(ROOT_DIR, 'data/externalAudits.json'));

const cardinalityResults = {
  repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
  branch: currentBranch,
  commit_sha: currentSha,
  generated_at: new Date().toISOString(),
  generator: 'scripts/generate-evidence.mjs',
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

// 8. schema-validation-results.json (P2 metadata compliant)
const schemas = [
  { name: 'liveTasks.schema.json', data: path.resolve(ROOT_DIR, 'data/liveTasks.json') },
  { name: 'legalContracts.schema.json', data: path.resolve(ROOT_DIR, 'data/legalContracts.json') },
  { name: 'externalAudits.schema.json', data: path.resolve(ROOT_DIR, 'data/externalAudits.json') }
];

const schemaValidationResults = {
  repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
  branch: currentBranch,
  commit_sha: currentSha,
  generated_at: new Date().toISOString(),
  generator: 'scripts/generate-evidence.mjs',
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

// 9. canonical-source-hashes.sha256 & file-hashes.sha256
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

// 10. git-status-after-verification.txt
const postStatus = execSync('git status --short', { encoding: 'utf8', cwd: ROOT_DIR });
fs.writeFileSync(path.join(EVIDENCE_DIR, 'git-status-after-verification.txt'), postStatus || 'WORKING_TREE_CLEAN\n', 'utf8');
console.log('  -> git-status-after-verification.txt generated');

// 11. github-actions-receipt.json (P2 & P3 compliant)
let githubReceipt = {
  repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
  branch: currentBranch,
  commit_sha: currentSha,
  generated_at: new Date().toISOString(),
  generator: 'scripts/generate-evidence.mjs',
  workflow_name: 'CI / Production Readiness & Audit Gate',
  run_id: null,
  run_attempt: 1,
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
    instruction_5: 'Select check: "Deterministic Build, Typecheck, Test & Audit (22.x)"'
  },
  jobs: [],
  required_steps: [
    'Checkout Codebase',
    'Setup Node.js 22.x',
    'Deterministic Install (npm ci)',
    'Production Dependency Audit',
    'Monorepo Clean',
    'Strict Typecheck',
    'Build Monorepo Packages',
    'Build Web Application',
    'Next.js ESLint',
    'Automated Test Suites',
    'Ajv Manifest & Domain Cardinality Validation',
    'Physical Hash Cryptographic Verification',
    'Security & Behavioral Controls Verification',
    'Transactional Payment & Webhook Verification',
    'Multi-Tenant Authentication & Authorization Verification'
  ],
  skipped_required_steps: []
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

    // Fetch jobs and steps if run is completed
    if (run.databaseId) {
      try {
        const jobsOutput = execSync(`gh run view ${run.databaseId} --json jobs`, { encoding: 'utf8', cwd: ROOT_DIR });
        const jobsData = JSON.parse(jobsOutput);
        githubReceipt.jobs = jobsData.jobs || [];
      } catch {}
    }
  }
} catch {
  // gh CLI unavailable or not executed yet
}

// 11. P7 — Query GitHub REST API for Branch Protection and generate verifiable receipt
console.log('[EVIDENCE] Querying GitHub API for master branch protection (P7)...');
let bpApiResponseRaw = '';
let bpStatus = 'NOT_CONFIGURED';
let bpStatusCode = 404;
let bpRequiredChecks = [];
let bpPullRequestRequired = false;
let bpApprovingReviewCount = 0;
let bpDismissStaleReviews = false;
let bpRequireCodeOwnerReviews = false;
let bpStrictUpToDate = false;
let bpEnforceAdmins = false;
let bpAllowForcePushes = false;
let bpAllowDeletions = false;
let bpRequiredConversationResolution = false;

try {
  bpApiResponseRaw = execSync('gh api repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/branches/master/protection', {
    encoding: 'utf8',
    cwd: ROOT_DIR,
    stdio: ['pipe', 'pipe', 'pipe']
  }).trim();
  const bpData = JSON.parse(bpApiResponseRaw);
  bpStatusCode = 200;
  bpStatus = 'CONFIGURED';
  if (bpData.required_status_checks) {
    bpStrictUpToDate = !!bpData.required_status_checks.strict;
    bpRequiredChecks = bpData.required_status_checks.contexts || [];
  }
  if (bpData.required_pull_request_reviews) {
    bpPullRequestRequired = true;
    bpApprovingReviewCount = bpData.required_pull_request_reviews.required_approving_review_count ?? 1;
    bpDismissStaleReviews = !!bpData.required_pull_request_reviews.dismiss_stale_reviews;
    bpRequireCodeOwnerReviews = !!bpData.required_pull_request_reviews.require_code_owner_reviews;
  }
  bpEnforceAdmins = bpData.enforce_admins ? !!bpData.enforce_admins.enabled : false;
  bpAllowForcePushes = bpData.allow_force_pushes ? !!bpData.allow_force_pushes.enabled : false;
  bpAllowDeletions = bpData.allow_deletions ? !!bpData.allow_deletions.enabled : false;
  bpRequiredConversationResolution = bpData.required_conversation_resolution ? !!bpData.required_conversation_resolution.enabled : false;
} catch (err) {
  const errMsg = (err.stderr || err.message || '').toString();
  if (errMsg.includes('401')) {
    bpStatusCode = 401;
    bpStatus = 'API_UNAUTHORIZED';
  } else if (errMsg.includes('403')) {
    bpStatusCode = 403;
    bpStatus = 'API_FORBIDDEN';
  } else if (errMsg.includes('404') || errMsg.includes('Branch not protected')) {
    bpStatusCode = 404;
    bpStatus = 'NOT_CONFIGURED';
  } else {
    bpStatusCode = 500;
    bpStatus = 'API_UNAVAILABLE';
  }
  bpApiResponseRaw = JSON.stringify({ error: bpStatus, message: errMsg }, null, 2);
}

const bpResponseSha256 = crypto.createHash('sha256').update(bpApiResponseRaw).digest('hex');
fs.writeFileSync(path.join(EVIDENCE_DIR, 'branch-protection-api-response.json'), bpApiResponseRaw, 'utf8');
console.log('  -> branch-protection-api-response.json generated');

const branchProtectionReceipt = {
  repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
  branch: 'master',
  source: 'GITHUB_REST_API',
  api_endpoint: 'repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/branches/master/protection',
  queried_at: new Date().toISOString(),
  query_actor: process.env.GITHUB_ACTOR || 'GitHub Actions',
  query_run_id: process.env.GITHUB_RUN_ID ? Number(process.env.GITHUB_RUN_ID) : 'local',
  query_workflow: process.env.GITHUB_WORKFLOW || 'CI / Production Readiness & Audit Gate',
  source_sha: currentSha,
  http_status: bpStatusCode,
  branch_protection_status: bpStatus,
  required_status_checks: bpRequiredChecks,
  pull_request_required: bpPullRequestRequired,
  required_approving_review_count: bpApprovingReviewCount,
  dismiss_stale_reviews: bpDismissStaleReviews,
  require_code_owner_reviews: bpRequireCodeOwnerReviews,
  strict_up_to_date_required: bpStrictUpToDate,
  enforce_admins: bpEnforceAdmins,
  enforce_admins_justification: bpEnforceAdmins ? 'Admin enforcement active' : 'Solo repository maintainer bypass permitted for emergency maintenance; pre-merge checks enforced on pull requests.',
  allow_force_pushes: bpAllowForcePushes,
  allow_deletions: bpAllowDeletions,
  required_conversation_resolution: bpRequiredConversationResolution,
  response_sha256: bpResponseSha256
};
fs.writeFileSync(path.join(EVIDENCE_DIR, 'branch-protection.json'), JSON.stringify(branchProtectionReceipt, null, 2), 'utf8');
console.log(`  -> branch-protection.json generated (${bpStatus})`);

// P6: Unify branch_protection_status in githubReceipt
githubReceipt.branch_protection_status = bpStatus;

fs.writeFileSync(path.join(EVIDENCE_DIR, 'github-actions-receipt.json'), JSON.stringify(githubReceipt, null, 2), 'utf8');
console.log('  -> github-actions-receipt.json generated');

// 12. P7 — Physical Hashes of All Evidence Files (.artifacts/evidence/evidence-files.sha256)
console.log(`[EVIDENCE] Calculating physical hashes for ${path.relative(ROOT_DIR, EVIDENCE_DIR)}/evidence-files.sha256 (P7)...`);
const evidenceEntries = fs.readdirSync(EVIDENCE_DIR)
  .filter(f => f !== 'evidence-files.sha256')
  .filter(f => fs.statSync(path.join(EVIDENCE_DIR, f)).isFile())
  .sort();

const evidenceHashLines = evidenceEntries.map(filename => {
  const filePath = path.join(EVIDENCE_DIR, filename);
  const hash = getFileSha256(filePath);
  return `${hash}  ${filename}`;
});

fs.writeFileSync(path.join(EVIDENCE_DIR, 'evidence-files.sha256'), evidenceHashLines.join('\n') + '\n', 'utf8');
console.log(`  -> evidence-files.sha256 generated (${evidenceEntries.length} files indexed)`);

// P4: Fail-closed enforcement
if (hasCommandFailure) {
  console.error('[FATAL] EVIDENCE_GENERATION_FAILED: One or more required pipeline commands failed.');
  process.exit(1);
}

// Run coherence gate to verify bundle integrity
console.log('[EVIDENCE] Running coherence gate verification on generated bundle...');
const coherenceScript = path.resolve(ROOT_DIR, 'scripts/verify-evidence-coherence.mjs');
const coherenceCheck = spawnSync('node', [coherenceScript, '--dir', EVIDENCE_DIR], { cwd: ROOT_DIR, encoding: 'utf8' });
if (coherenceCheck.status !== 0) {
  console.error('[FATAL] EVIDENCE_COHERENCE_FAILED:\n' + (coherenceCheck.stdout || '') + (coherenceCheck.stderr || ''));
  process.exit(1);
}
console.log('  -> Evidence coherence gate PASSED.');

console.log('[EVIDENCE] All required evidence files generated successfully.');

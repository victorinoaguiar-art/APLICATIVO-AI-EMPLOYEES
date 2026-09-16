import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const EVIDENCE_DIR = path.resolve(ROOT_DIR, 'evidence');

export const ERROR_CODES = {
  EVIDENCE_FILE_MISSING: 'EVIDENCE_FILE_MISSING',
  EVIDENCE_INVALID_JSON: 'EVIDENCE_INVALID_JSON',
  EVIDENCE_COMMIT_SHA_MISSING: 'EVIDENCE_COMMIT_SHA_MISSING',
  EVIDENCE_COMMIT_SHA_MISMATCH: 'EVIDENCE_COMMIT_SHA_MISMATCH',
  EVIDENCE_REPOSITORY_MISMATCH: 'EVIDENCE_REPOSITORY_MISMATCH',
  EVIDENCE_HASH_MISMATCH: 'EVIDENCE_HASH_MISMATCH',
  CI_RECEIPT_MISSING: 'CI_RECEIPT_MISSING',
  CI_RUN_SHA_MISMATCH: 'CI_RUN_SHA_MISMATCH',
  CI_RUN_NOT_COMPLETED: 'CI_RUN_NOT_COMPLETED',
  CI_RUN_NOT_SUCCESSFUL: 'CI_RUN_NOT_SUCCESSFUL',
  REQUIRED_JOB_MISSING: 'REQUIRED_JOB_MISSING',
  REQUIRED_STEP_MISSING: 'REQUIRED_STEP_MISSING',
  REQUIRED_STEP_SKIPPED: 'REQUIRED_STEP_SKIPPED',
  REQUIRED_STEP_FAILED: 'REQUIRED_STEP_FAILED',
  EVIDENCE_INDEX_INVALID: 'EVIDENCE_INDEX_INVALID',
  BRANCH_PROTECTION_STATUS_MISMATCH: 'BRANCH_PROTECTION_STATUS_MISMATCH',
  BRANCH_PROTECTION_UNVERIFIED: 'BRANCH_PROTECTION_UNVERIFIED',
  BRANCH_PROTECTION_CHECK_MISSING: 'BRANCH_PROTECTION_CHECK_MISSING',
  BRANCH_PROTECTION_RULES_INSUFFICIENT: 'BRANCH_PROTECTION_RULES_INSUFFICIENT',
  BRANCH_PROTECTION_REPOSITORY_MISMATCH: 'BRANCH_PROTECTION_REPOSITORY_MISMATCH',
  BRANCH_PROTECTION_RESPONSE_SHA_MISSING: 'BRANCH_PROTECTION_RESPONSE_SHA_MISSING',
  BRANCH_PROTECTION_RESPONSE_SHA_INVALID: 'BRANCH_PROTECTION_RESPONSE_SHA_INVALID',
  BRANCH_PROTECTION_ORIGIN_INVALID: 'BRANCH_PROTECTION_ORIGIN_INVALID',
  BRANCH_PROTECTION_RECEIPT_MISMATCH: 'BRANCH_PROTECTION_RECEIPT_MISMATCH',
  ADMIN_ENFORCEMENT_MISMATCH: 'ADMIN_ENFORCEMENT_MISMATCH',
  LOCAL_FILE_LINK_DETECTED: 'LOCAL_FILE_LINK_DETECTED',
  EVIDENCE_PATH_INVALID: 'EVIDENCE_PATH_INVALID',
  CLASSIFICATION_MISSING: 'CLASSIFICATION_MISSING',
  CLASSIFICATION_INVALID: 'CLASSIFICATION_INVALID',
  REPORT_FILE_MISSING: 'REPORT_FILE_MISSING',
  REPORT_PATH_INVALID: 'REPORT_PATH_INVALID',
  EXPECTED_QUERY_ACTOR_MISSING: 'EXPECTED_QUERY_ACTOR_MISSING',
  REMOTE_RUN_ID_MISMATCH: 'REMOTE_RUN_ID_MISMATCH',
  QUERY_RUN_ID_COLLISION: 'QUERY_RUN_ID_COLLISION'
};

export const ALLOWED_CLASSIFICATIONS = [
  'PATCH_VERIFIED_AND_CI_ENFORCED',
  'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
  'PATCH_VERIFIED_AND_CI_GREEN'
];

export const EXPECTED_PRE_MERGE_CHECKS = [
  'Clean Checkout Local Verification (22.x)',
  'Deterministic Build, Typecheck, Test & Audit (22.x)'
];

export const REQUIRED_CI_JOBS_AND_STEPS = {
  'Clean Checkout Local Verification (22.x)': [
    'Checkout Codebase',
    'Setup Node.js 22.x',
    'Deterministic Install (npm ci)',
    'Production Dependency Audit',
    'Local Full Verification',
    'Ensure Clean Working Tree'
  ],
  'Deterministic Build, Typecheck, Test & Audit (22.x)': [
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
    'Multi-Tenant Authentication & Authorization Verification',
    'Generate CI Forensic Evidence Bundle',
    'Evidence Coherence & Same-SHA Gate',
    'Upload Evidence Artifacts Bundle',
    'Ensure Clean Working Tree'
  ]
};

export const REQUIRED_EVIDENCE_FILES = [
  'environment.json',
  'cardinality-results.json',
  'schema-validation-results.json',
  'test-results.json',
  'test-summary.json',
  'canonical-source-hashes.sha256',
  'file-hashes.sha256',
  'evidence-files.sha256',
  'branch-protection.json',
  'branch-protection-api-response.json',
  'npm-ci.log',
  'npm-audit-production.log',
  'typecheck.log',
  'build-packages.log',
  'build-web.log',
  'lint.log',
  'tests.log',
  'validate-manifests.log',
  'verify-hashes.log',
  'verify-security.log',
  'verify-payments.log',
  'verify-auth.log',
  'verify.log',
  'github-actions-receipt.json'
];

export const JSON_FILES_TO_CHECK = [
  'environment.json',
  'cardinality-results.json',
  'schema-validation-results.json',
  'test-results.json',
  'test-summary.json',
  'branch-protection.json',
  'github-actions-receipt.json'
];

export function verifyEvidenceCoherence(options = {}) {
  const targetDir = options.evidenceDir || EVIDENCE_DIR;
  const expectedRepo = options.expectedRepo || 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';
  const enforceRemoteCi = options.enforceRemoteCi ?? false;
  
  let expectedSha = options.targetSha;
  if (!expectedSha) {
    try {
      expectedSha = execSync('git rev-parse HEAD', { encoding: 'utf8', cwd: ROOT_DIR }).trim();
    } catch {
      expectedSha = process.env.SOURCE_SHA || process.env.GITHUB_SHA;
    }
  }

  if (!expectedSha) {
    return {
      valid: false,
      code: ERROR_CODES.EVIDENCE_COMMIT_SHA_MISSING,
      error: 'Unable to determine target SOURCE_SHA for evidence verification.'
    };
  }

  if (!fs.existsSync(targetDir)) {
    return {
      valid: false,
      code: ERROR_CODES.EVIDENCE_FILE_MISSING,
      error: `Evidence directory does not exist: ${targetDir}`
    };
  }

  // 1. Check presence of all required files
  for (const fileName of REQUIRED_EVIDENCE_FILES) {
    const filePath = path.join(targetDir, fileName);
    if (!fs.existsSync(filePath)) {
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_FILE_MISSING,
        error: `Required evidence file missing: ${fileName}`
      };
    }
  }

  // 2. Validate physical hashes in evidence-files.sha256 (P7)
  const indexPath = path.join(targetDir, 'evidence-files.sha256');
  const indexRaw = fs.readFileSync(indexPath, 'utf8').trim();
  const indexLines = indexRaw.split('\n').map(l => l.trim()).filter(Boolean);

  const seenFiles = new Set();
  const indexedFiles = new Set();

  for (const line of indexLines) {
    const parts = line.split(/\s+/);
    if (parts.length !== 2) {
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_INDEX_INVALID,
        error: `Malformed line in evidence-files.sha256: "${line}"`
      };
    }
    const [expectedHash, fileName] = parts;

    // Check sha256 format
    if (!/^[a-f0-9]{64}$/i.test(expectedHash)) {
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_INDEX_INVALID,
        error: `Invalid hash pattern in index for ${fileName}: ${expectedHash}`
      };
    }

    // Path traversal check
    if (fileName.includes('..') || path.isAbsolute(fileName) || fileName.includes('/') || fileName.includes('\\')) {
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_INDEX_INVALID,
        error: `Path traversal or invalid path in index entry: ${fileName}`
      };
    }

    // No self-referential entry
    if (fileName === 'evidence-files.sha256') {
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_INDEX_INVALID,
        error: 'Self-referential entry evidence-files.sha256 found in index.'
      };
    }

    // No duplicates
    if (seenFiles.has(fileName)) {
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_INDEX_INVALID,
        error: `Duplicate entry in evidence-files.sha256: ${fileName}`
      };
    }
    seenFiles.add(fileName);
    indexedFiles.add(fileName);

    const actualFilePath = path.join(targetDir, fileName);
    if (!fs.existsSync(actualFilePath)) {
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_FILE_MISSING,
        error: `Physical evidence file indexed but missing on disk: ${fileName}`
      };
    }

    const actualHash = crypto.createHash('sha256').update(fs.readFileSync(actualFilePath)).digest('hex');
    if (actualHash.toLowerCase() !== expectedHash.toLowerCase()) {
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_HASH_MISMATCH,
        error: `Hash mismatch for ${fileName}: expected ${expectedHash}, computed ${actualHash}`
      };
    }
  }

  // Verify all files in directory (except index) are present in index
  const dirFiles = fs.readdirSync(targetDir)
    .filter(f => f !== 'evidence-files.sha256')
    .filter(f => fs.statSync(path.join(targetDir, f)).isFile());

  for (const f of dirFiles) {
    if (!indexedFiles.has(f)) {
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_INDEX_INVALID,
        error: `Unindexed file detected in evidence directory: ${f}`
      };
    }
  }

  // 3. Validate JSON integrity and commit_sha consistency across JSON receipts
  for (const fileName of JSON_FILES_TO_CHECK) {
    const filePath = path.join(targetDir, fileName);
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_INVALID_JSON,
        error: `Failed to parse JSON file ${fileName}: ${err.message}`
      };
    }

    const fileSha = data.commit_sha || data.commitSha || data.source_sha || data.sourceSha;
    if (!fileSha) {
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_COMMIT_SHA_MISSING,
        error: `commit_sha missing in ${fileName}`
      };
    }

    if (fileSha.toLowerCase() !== expectedSha.toLowerCase()) {
      if (fileName === 'github-actions-receipt.json' && enforceRemoteCi) {
        return {
          valid: false,
          code: ERROR_CODES.CI_RUN_SHA_MISMATCH,
          error: `CI run SHA mismatch in ${fileName}: expected ${expectedSha}, found ${fileSha}`
        };
      }
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_COMMIT_SHA_MISMATCH,
        error: `commit_sha mismatch in ${fileName}: expected ${expectedSha}, found ${fileSha}`
      };
    }

    const repo = data.repository;
    if (repo && repo !== expectedRepo) {
      if (fileName === 'branch-protection.json') {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_REPOSITORY_MISMATCH,
          error: `repository mismatch in ${fileName}: expected ${expectedRepo}, found ${repo}`
        };
      }
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_REPOSITORY_MISMATCH,
        error: `repository mismatch in ${fileName}: expected ${expectedRepo}, found ${repo}`
      };
    }
  }

  // 4. Validate GitHub Actions receipt
  const receiptPath = path.join(targetDir, 'github-actions-receipt.json');
  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));

  if (enforceRemoteCi) {
    if (!receipt.run_id) {
      return {
        valid: false,
        code: ERROR_CODES.CI_RECEIPT_MISSING,
        error: 'CI receipt missing run_id in remote verification mode.'
      };
    }

    if (receipt.commit_sha?.toLowerCase() !== expectedSha.toLowerCase()) {
      return {
        valid: false,
        code: ERROR_CODES.CI_RUN_SHA_MISMATCH,
        error: `CI run SHA mismatch: expected ${expectedSha}, found ${receipt.commit_sha}`
      };
    }

    if (receipt.status !== 'completed') {
      return {
        valid: false,
        code: ERROR_CODES.CI_RUN_NOT_COMPLETED,
        error: `CI run status is not completed: ${receipt.status}`
      };
    }

    if (receipt.conclusion !== 'success') {
      return {
        valid: false,
        code: ERROR_CODES.CI_RUN_NOT_SUCCESSFUL,
        error: `CI run conclusion is not success: ${receipt.conclusion}`
      };
    }

    if (Array.isArray(receipt.skipped_required_steps) && receipt.skipped_required_steps.length > 0) {
      return {
        valid: false,
        code: ERROR_CODES.REQUIRED_STEP_SKIPPED,
        error: `Required CI steps were skipped: ${receipt.skipped_required_steps.join(', ')}`
      };
    }

    // Physical jobs and steps inspection (Prompt section 5)
    if (!Array.isArray(receipt.jobs) || receipt.jobs.length === 0) {
      return {
        valid: false,
        code: ERROR_CODES.REQUIRED_JOB_MISSING,
        error: 'CI receipt does not contain physical jobs array.'
      };
    }

    for (const [expectedJobName, expectedSteps] of Object.entries(REQUIRED_CI_JOBS_AND_STEPS)) {
      const job = receipt.jobs.find(j => j.name === expectedJobName);
      if (!job) {
        return {
          valid: false,
          code: ERROR_CODES.REQUIRED_JOB_MISSING,
          error: `Required CI job missing from receipt: "${expectedJobName}"`
        };
      }

      if (job.status !== 'completed' || job.conclusion !== 'success') {
        return {
          valid: false,
          code: ERROR_CODES.CI_RUN_NOT_SUCCESSFUL,
          error: `Required CI job "${expectedJobName}" did not conclude successfully (status: ${job.status}, conclusion: ${job.conclusion})`
        };
      }

      if (!Array.isArray(job.steps) || job.steps.length === 0) {
        return {
          valid: false,
          code: ERROR_CODES.REQUIRED_STEP_MISSING,
          error: `Physical steps array missing in job "${expectedJobName}"`
        };
      }

      for (const stepName of expectedSteps) {
        const step = job.steps.find(s => s.name === stepName);
        if (!step) {
          return {
            valid: false,
            code: ERROR_CODES.REQUIRED_STEP_MISSING,
            error: `Required step "${stepName}" missing in job "${expectedJobName}"`
          };
        }

        if (step.conclusion === 'skipped' || step.status === 'skipped') {
          return {
            valid: false,
            code: ERROR_CODES.REQUIRED_STEP_SKIPPED,
            error: `Required step "${stepName}" was skipped in job "${expectedJobName}"`
          };
        }

        if (['cancelled', 'failure'].includes(step.conclusion) || ['cancelled', 'failure'].includes(step.status)) {
          return {
            valid: false,
            code: ERROR_CODES.REQUIRED_STEP_FAILED,
            error: `Required step "${stepName}" ended with ${step.conclusion || step.status} in job "${expectedJobName}"`
          };
        }

        if (step.status !== 'completed' || step.conclusion !== 'success') {
          return {
            valid: false,
            code: ERROR_CODES.REQUIRED_STEP_FAILED,
            error: `Required step "${stepName}" not successfully completed in job "${expectedJobName}" (status: ${step.status}, conclusion: ${step.conclusion})`
          };
        }
      }
    }
  }

  // 5. Validate branch protection receipt
  const bpPath = path.join(targetDir, 'branch-protection.json');
  if (fs.existsSync(bpPath)) {
    let bpData;
    try {
      bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
    } catch (e) {
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_INVALID_JSON,
        error: `Failed to parse branch-protection.json: ${e.message}`
      };
    }

    const validStatuses = ['CONFIGURED', 'NOT_CONFIGURED', 'API_UNAUTHORIZED', 'API_FORBIDDEN', 'API_UNAVAILABLE'];
    if (!validStatuses.includes(bpData.branch_protection_status)) {
      return {
        valid: false,
        code: ERROR_CODES.EVIDENCE_INVALID_JSON,
        error: `Invalid branch_protection_status: ${bpData.branch_protection_status}`
      };
    }

    // In remote mode, branch protection must be CONFIGURED with HTTP 200
    if (enforceRemoteCi) {
      if (bpData.branch_protection_status !== 'CONFIGURED') {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_UNVERIFIED,
          error: `Branch protection is not verified in remote mode: status is "${bpData.branch_protection_status}". Must be "CONFIGURED".`
        };
      }
      if (bpData.http_status !== 200) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_STATUS_MISMATCH,
          error: `branch-protection.json declares ${bpData.branch_protection_status} with non-200 HTTP status: ${bpData.http_status}`
        };
      }
    } else {
      if (bpData.http_status !== 200 && bpData.branch_protection_status === 'CONFIGURED') {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_STATUS_MISMATCH,
          error: `branch-protection.json declares CONFIGURED with non-200 HTTP status: ${bpData.http_status}`
        };
      }
    }

    // If CONFIGURED or in remote mode, perform forensic validation of origin and API response
    if (bpData.branch_protection_status === 'CONFIGURED' || enforceRemoteCi) {
      // 1. Mandatory response_sha256 validation (Prompt section 1)
      if (bpData.response_sha256 === undefined || bpData.response_sha256 === null) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RESPONSE_SHA_MISSING,
          error: 'response_sha256 is strictly required in branch-protection.json'
        };
      }
      if (typeof bpData.response_sha256 !== 'string' || bpData.response_sha256.trim() === '' || !/^[a-f0-9]{64}$/i.test(bpData.response_sha256)) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RESPONSE_SHA_INVALID,
          error: `response_sha256 must be a 64-character hex string, got: "${bpData.response_sha256}"`
        };
      }

      // 2. Verifiable origin checks (Prompt section 2)
      if (!bpData.repository || bpData.repository !== expectedRepo) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_REPOSITORY_MISMATCH,
          error: `repository in branch-protection.json mismatch: expected "${expectedRepo}", found "${bpData.repository}"`
        };
      }
      if (!bpData.branch || bpData.branch !== 'master') {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID,
          error: `branch in branch-protection.json mismatch: expected "master", found "${bpData.branch}"`
        };
      }
      if (!bpData.source || bpData.source !== 'GITHUB_REST_API') {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID,
          error: `source in branch-protection.json mismatch: expected "GITHUB_REST_API", found "${bpData.source}"`
        };
      }
      const expectedEndpoint = `repos/${expectedRepo}/branches/master/protection`;
      if (!bpData.api_endpoint || bpData.api_endpoint !== expectedEndpoint) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID,
          error: `api_endpoint in branch-protection.json mismatch: expected "${expectedEndpoint}", found "${bpData.api_endpoint}"`
        };
      }
      const isoUtcRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|\+00:00)$/;
      if (!bpData.queried_at || typeof bpData.queried_at !== 'string' || !isoUtcRegex.test(bpData.queried_at) || isNaN(Date.parse(bpData.queried_at))) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID,
          error: `queried_at in branch-protection.json must be a valid ISO-8601 UTC timestamp: "${bpData.queried_at}"`
        };
      }
      const queriedAtTime = Date.parse(bpData.queried_at);
      const now = Date.now();
      if (queriedAtTime > now + 10 * 60 * 1000) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID,
          error: `queried_at is in the future beyond allowed tolerance (max 10min): "${bpData.queried_at}"`
        };
      }
      if (receipt.started_at) {
        const startedAtTime = Date.parse(receipt.started_at);
        if (!isNaN(startedAtTime) && queriedAtTime < startedAtTime - 60 * 1000) {
          return {
            valid: false,
            code: ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID,
            error: `queried_at ("${bpData.queried_at}") cannot be prior to primary execution started_at ("${receipt.started_at}")`
          };
        }
      }
      const remoteStartedAt = options.remoteRunStartedAt || process.env.REMOTE_RUN_STARTED_AT || receipt.remote_started_at;
      if (remoteStartedAt) {
        const rStart = Date.parse(remoteStartedAt);
        if (!isNaN(rStart) && queriedAtTime < rStart - 60 * 1000) {
          return {
            valid: false,
            code: ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID,
            error: `queried_at ("${bpData.queried_at}") cannot be prior to remote execution started_at ("${remoteStartedAt}")`
          };
        }
      }
      if (receipt.remote_synced_at) {
        const syncedAtTime = Date.parse(receipt.remote_synced_at);
        if (!isNaN(syncedAtTime) && queriedAtTime > syncedAtTime + 60 * 1000) {
          return {
            valid: false,
            code: ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID,
            error: `queried_at ("${bpData.queried_at}") cannot be posterior to remote sync timestamp ("${receipt.remote_synced_at}") beyond allowed tolerance (60s)`
          };
        }
      }

      const expectedActor = options.expectedQueryActor || process.env.EXPECTED_QUERY_ACTOR;
      if (!bpData.query_actor || typeof bpData.query_actor !== 'string' || !bpData.query_actor.trim()) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID,
          error: `query_actor in branch-protection.json is missing or empty`
        };
      }
      if (expectedActor && bpData.query_actor !== expectedActor) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID,
          error: `query_actor mismatch in branch-protection.json: expected "${expectedActor}", found "${bpData.query_actor}"`
        };
      }

      // Check required provenance metadata fields
      const requiredProvenanceFields = ['source', 'api_endpoint', 'queried_at', 'query_actor', 'query_run_id', 'query_workflow'];
      for (const field of requiredProvenanceFields) {
        if (!bpData[field]) {
          return {
            valid: false,
            code: ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID,
            error: `Provenance metadata missing in branch-protection.json: ${field}`
          };
        }
      }

      // Check run IDs separation and matching in remote mode
      const primaryRunId = receipt.primary_run_id || receipt.run_id || options.primaryRunId || process.env.PRIMARY_RUN_ID;
      const expectedRemoteRunId = options.remoteRunId || process.env.REMOTE_VERIFICATION_RUN_ID;
      if (enforceRemoteCi) {
        if (primaryRunId && bpData.query_run_id && Number(bpData.query_run_id) === Number(primaryRunId)) {
          return {
            valid: false,
            code: ERROR_CODES.QUERY_RUN_ID_COLLISION,
            error: `query_run_id (${bpData.query_run_id}) cannot be identical to primary_run_id (${primaryRunId}) in remote verification`
          };
        }
        if (expectedRemoteRunId) {
          if (bpData.query_run_id && Number(bpData.query_run_id) !== Number(expectedRemoteRunId)) {
            return {
              valid: false,
              code: ERROR_CODES.REMOTE_RUN_ID_MISMATCH,
              error: `query_run_id mismatch in branch-protection.json: expected remote run ID "${expectedRemoteRunId}", found "${bpData.query_run_id}"`
            };
          }
          const recRemoteRunId = receipt.remote_verification_run_id || bpData.remote_verification_run_id;
          if (recRemoteRunId && Number(recRemoteRunId) !== Number(expectedRemoteRunId)) {
            return {
              valid: false,
              code: ERROR_CODES.REMOTE_RUN_ID_MISMATCH,
              error: `remote_verification_run_id mismatch: expected "${expectedRemoteRunId}", found "${recRemoteRunId}"`
            };
          }
        }
      }

      if (!bpData.source_sha || bpData.source_sha.toLowerCase() !== expectedSha.toLowerCase()) {
        return {
          valid: false,
          code: ERROR_CODES.EVIDENCE_COMMIT_SHA_MISMATCH,
          error: `source_sha in branch-protection.json mismatch: expected "${expectedSha}", found "${bpData.source_sha}"`
        };
      }

      // Check physical raw response file and byte hash
      const bpApiResPath = path.join(targetDir, 'branch-protection-api-response.json');
      if (!fs.existsSync(bpApiResPath)) {
        return {
          valid: false,
          code: ERROR_CODES.EVIDENCE_FILE_MISSING,
          error: 'Required physical response file branch-protection-api-response.json missing on disk'
        };
      }

      const apiResRaw = fs.readFileSync(bpApiResPath, 'utf8');
      const computedSha = crypto.createHash('sha256').update(apiResRaw).digest('hex');
      if (computedSha.toLowerCase() !== bpData.response_sha256.toLowerCase()) {
        return {
          valid: false,
          code: ERROR_CODES.EVIDENCE_HASH_MISMATCH,
          error: `response_sha256 mismatch: branch-protection.json has "${bpData.response_sha256}", computed hash of branch-protection-api-response.json is "${computedSha}"`
        };
      }

      // 3. Recalculate ALL derived fields directly from raw API response (Prompt section 3)
      let bpApiData;
      try {
        bpApiData = JSON.parse(apiResRaw);
      } catch (e) {
        return {
          valid: false,
          code: ERROR_CODES.EVIDENCE_INVALID_JSON,
          error: `Failed to parse branch-protection-api-response.json: ${e.message}`
        };
      }

      // Validate repository and branch in API URL if present
      const expectedUrlPattern = `repos/${expectedRepo}/branches/master/protection`;
      if (bpApiData.url && !bpApiData.url.includes(expectedUrlPattern)) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_REPOSITORY_MISMATCH,
          error: `Branch protection API URL mismatch: expected ${expectedUrlPattern}, found ${bpApiData.url}`
        };
      }

      // Re-derive and compare 10 derived fields
      // 1. required_status_checks
      const rawContexts = Array.isArray(bpApiData.required_status_checks?.contexts)
        ? bpApiData.required_status_checks.contexts
        : [];
      const receiptChecks = Array.isArray(bpData.required_status_checks) ? bpData.required_status_checks : [];
      if (rawContexts.length !== receiptChecks.length || !rawContexts.every(c => receiptChecks.includes(c))) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RECEIPT_MISMATCH,
          error: `required_status_checks mismatch between receipt and raw API response`
        };
      }

      // 2. strict_up_to_date_required
      const rawStrict = !!bpApiData.required_status_checks?.strict;
      if (rawStrict !== !!bpData.strict_up_to_date_required) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RECEIPT_MISMATCH,
          error: `strict_up_to_date_required mismatch between receipt (${bpData.strict_up_to_date_required}) and raw API response (${rawStrict})`
        };
      }

      // 3. pull_request_required
      const rawPr = !!bpApiData.required_pull_request_reviews;
      if (rawPr !== !!bpData.pull_request_required) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RECEIPT_MISMATCH,
          error: `pull_request_required mismatch between receipt (${bpData.pull_request_required}) and raw API response (${rawPr})`
        };
      }

      // 4. required_approving_review_count
      const rawApprovals = bpApiData.required_pull_request_reviews?.required_approving_review_count ?? 0;
      if (rawApprovals !== bpData.required_approving_review_count) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RECEIPT_MISMATCH,
          error: `required_approving_review_count mismatch between receipt (${bpData.required_approving_review_count}) and raw API response (${rawApprovals})`
        };
      }

      // 5. dismiss_stale_reviews
      const rawDismissStale = !!bpApiData.required_pull_request_reviews?.dismiss_stale_reviews;
      if (rawDismissStale !== !!bpData.dismiss_stale_reviews) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RECEIPT_MISMATCH,
          error: `dismiss_stale_reviews mismatch between receipt and raw API response`
        };
      }

      // 6. require_code_owner_reviews
      const rawCodeOwners = !!bpApiData.required_pull_request_reviews?.require_code_owner_reviews;
      if (rawCodeOwners !== !!bpData.require_code_owner_reviews) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RECEIPT_MISMATCH,
          error: `require_code_owner_reviews mismatch between receipt and raw API response`
        };
      }

      // 7. enforce_admins
      const rawEnforceAdmins = !!bpApiData.enforce_admins?.enabled;
      if (rawEnforceAdmins !== !!bpData.enforce_admins) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RECEIPT_MISMATCH,
          error: `enforce_admins mismatch between receipt (${bpData.enforce_admins}) and raw API response (${rawEnforceAdmins})`
        };
      }

      // 8. allow_force_pushes
      const rawForcePushes = !!bpApiData.allow_force_pushes?.enabled;
      if (rawForcePushes !== !!bpData.allow_force_pushes) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RECEIPT_MISMATCH,
          error: `allow_force_pushes mismatch between receipt and raw API response`
        };
      }

      // 9. allow_deletions
      const rawDeletions = !!bpApiData.allow_deletions?.enabled;
      if (rawDeletions !== !!bpData.allow_deletions) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RECEIPT_MISMATCH,
          error: `allow_deletions mismatch between receipt and raw API response`
        };
      }

      // 10. required_conversation_resolution
      const rawReqConv = !!bpApiData.required_conversation_resolution?.enabled;
      if (rawReqConv !== !!bpData.required_conversation_resolution) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RECEIPT_MISMATCH,
          error: `required_conversation_resolution mismatch between receipt and raw API response`
        };
      }

      // 4. Transform rules into blocking conditions (Prompt section 4)
      if (!bpData.pull_request_required) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RULES_INSUFFICIENT,
          error: 'Pull request reviews are required before merge in branch protection.'
        };
      }

      if (typeof bpData.required_approving_review_count !== 'number' || bpData.required_approving_review_count < 1) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RULES_INSUFFICIENT,
          error: `At least 1 approving review is required in branch protection (configured: ${bpData.required_approving_review_count}).`
        };
      }

      if (!bpData.strict_up_to_date_required) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RULES_INSUFFICIENT,
          error: 'Branch protection requires strict up-to-date checks before merge.'
        };
      }

      if (bpData.allow_force_pushes) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RULES_INSUFFICIENT,
          error: 'Force pushes are permitted on master branch.'
        };
      }

      if (bpData.allow_deletions) {
        return {
          valid: false,
          code: ERROR_CODES.BRANCH_PROTECTION_RULES_INSUFFICIENT,
          error: 'Branch deletions are permitted on master branch.'
        };
      }

      for (const expectedCheck of EXPECTED_PRE_MERGE_CHECKS) {
        if (!bpData.required_status_checks.includes(expectedCheck)) {
          return {
            valid: false,
            code: ERROR_CODES.BRANCH_PROTECTION_CHECK_MISSING,
            error: `Required pre-merge check missing in branch protection: "${expectedCheck}". Configured: [${bpData.required_status_checks.join(', ')}]`
          };
        }
      }
    }

    // Check for contradiction between github-actions-receipt.json and branch-protection.json
    if (receipt.branch_protection_status && receipt.branch_protection_status !== bpData.branch_protection_status) {
      return {
        valid: false,
        code: ERROR_CODES.BRANCH_PROTECTION_STATUS_MISMATCH,
        error: `Contradiction detected: github-actions-receipt declares ${receipt.branch_protection_status} but branch-protection.json declares ${bpData.branch_protection_status}`
      };
    }
  }

  // 6. Report local file links and path validation (Prompt section 7)
  if (options.reportPath) {
    const resolvedReport = path.resolve(ROOT_DIR, options.reportPath);
    const relToRoot = path.relative(ROOT_DIR, resolvedReport);
    if (relToRoot.startsWith('..') || (path.isAbsolute(relToRoot) && !resolvedReport.startsWith(ROOT_DIR))) {
      return {
        valid: false,
        code: ERROR_CODES.REPORT_PATH_INVALID,
        error: `Report path resolves outside repository: ${options.reportPath}`
      };
    }
    if (!fs.existsSync(resolvedReport)) {
      return {
        valid: false,
        code: ERROR_CODES.REPORT_FILE_MISSING,
        error: `Report file missing: ${options.reportPath}`
      };
    }
    const reportContent = fs.readFileSync(resolvedReport, 'utf8');
    if (/file:\/\/\/[a-z]:/i.test(reportContent) || /\]\(file:\/\//i.test(reportContent) || /<file:\/\//i.test(reportContent)) {
      return {
        valid: false,
        code: ERROR_CODES.LOCAL_FILE_LINK_DETECTED,
        error: `Local file link (file:///) detected in report: ${options.reportPath}`
      };
    }
  }

  // 7. Classification check (Prompt section 6)
  const bpDataFinal = fs.existsSync(bpPath) ? JSON.parse(fs.readFileSync(bpPath, 'utf8')) : {};
  if (options.targetClassification) {
    if (!ALLOWED_CLASSIFICATIONS.includes(options.targetClassification)) {
      return {
        valid: false,
        code: ERROR_CODES.CLASSIFICATION_INVALID,
        error: `Unknown classification: "${options.targetClassification}". Allowed: [${ALLOWED_CLASSIFICATIONS.join(', ')}]`
      };
    }
    if (options.targetClassification === 'PATCH_VERIFIED_AND_CI_ENFORCED' && !bpDataFinal.enforce_admins) {
      return {
        valid: false,
        code: ERROR_CODES.ADMIN_ENFORCEMENT_MISMATCH,
        error: 'enforce_admins is false; unqualified PATCH_VERIFIED_AND_CI_ENFORCED is prohibited. Use PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS.'
      };
    }
  } else if (enforceRemoteCi) {
    return {
      valid: false,
      code: ERROR_CODES.CLASSIFICATION_MISSING,
      error: 'targetClassification is mandatory in remote verification mode (--classification <value>).'
    };
  }

  // Remote verification report mandatory check
  if (enforceRemoteCi && !options.reportPath) {
    return {
      valid: false,
      code: ERROR_CODES.REPORT_FILE_MISSING,
      error: 'reportPath is mandatory in remote verification mode (--report <path>).'
    };
  }

  // Remote verification expected query actor mandatory check
  const expectedActor = options.expectedQueryActor || process.env.EXPECTED_QUERY_ACTOR;
  if (enforceRemoteCi && (!expectedActor || typeof expectedActor !== 'string' || !expectedActor.trim())) {
    return {
      valid: false,
      code: ERROR_CODES.EXPECTED_QUERY_ACTOR_MISSING,
      error: 'Expected query actor not specified for remote verification (EXPECTED_QUERY_ACTOR required).'
    };
  }

  return {
    valid: true,
    commit_sha: expectedSha,
    repository: expectedRepo,
    filesChecked: REQUIRED_EVIDENCE_FILES.length,
    indexedFilesCount: indexedFiles.size,
    enforceRemoteCi
  };
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  let enforceRemoteCi = args.includes('--remote') || args.includes('--ci') || process.env.ENFORCE_REMOTE_CI === 'true';
  let targetSha;
  let evidenceDir;
  let targetClassification;
  let reportPath;
  let expectedQueryActor;
  let remoteRunId;
  let primaryRunId;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--remote' || arg === '--ci') {
      enforceRemoteCi = true;
    } else if (arg === '--sha') {
      if (i + 1 >= args.length || args[i + 1].startsWith('--')) {
        console.error('[FAIL] CLI_ARGUMENT_ERROR: Argument --sha provided without value');
        process.exit(1);
      }
      targetSha = args[++i];
    } else if (arg === '--dir') {
      if (i + 1 >= args.length || args[i + 1].startsWith('--')) {
        console.error('[FAIL] CLI_ARGUMENT_ERROR: Argument --dir provided without value');
        process.exit(1);
      }
      evidenceDir = args[++i];
    } else if (arg === '--classification') {
      if (i + 1 >= args.length || args[i + 1].startsWith('--')) {
        console.error('[FAIL] CLASSIFICATION_INVALID: Argument --classification provided without value');
        process.exit(1);
      }
      targetClassification = args[++i];
    } else if (arg === '--report') {
      if (i + 1 >= args.length || args[i + 1].startsWith('--')) {
        console.error('[FAIL] REPORT_PATH_INVALID: Argument --report provided without value');
        process.exit(1);
      }
      reportPath = args[++i];
    } else if (arg === '--expected-query-actor') {
      if (i + 1 >= args.length || args[i + 1].startsWith('--')) {
        console.error('[FAIL] CLI_ARGUMENT_ERROR: Argument --expected-query-actor provided without value');
        process.exit(1);
      }
      expectedQueryActor = args[++i];
    } else if (arg === '--remote-run-id') {
      if (i + 1 >= args.length || args[i + 1].startsWith('--')) {
        console.error('[FAIL] CLI_ARGUMENT_ERROR: Argument --remote-run-id provided without value');
        process.exit(1);
      }
      remoteRunId = args[++i];
    } else if (arg === '--primary-run-id') {
      if (i + 1 >= args.length || args[i + 1].startsWith('--')) {
        console.error('[FAIL] CLI_ARGUMENT_ERROR: Argument --primary-run-id provided without value');
        process.exit(1);
      }
      primaryRunId = args[++i];
    }
  }

  console.log(`[VERIFY:EVIDENCE-COHERENCE] Starting coherence audit (enforceRemoteCi: ${enforceRemoteCi})...`);
  const result = verifyEvidenceCoherence({
    targetSha,
    enforceRemoteCi,
    evidenceDir,
    targetClassification,
    reportPath,
    expectedQueryActor: expectedQueryActor || process.env.EXPECTED_QUERY_ACTOR,
    remoteRunId: remoteRunId || process.env.REMOTE_VERIFICATION_RUN_ID,
    primaryRunId: primaryRunId || process.env.PRIMARY_RUN_ID
  });

  if (!result.valid) {
    console.error(`[FAIL] ${result.code}: ${result.error}`);
    process.exit(1);
  }

  console.log(`[PASS] Evidence coherence gate cleared successfully for SHA ${result.commit_sha}`);
  console.log(`       - ${result.filesChecked} required files present and verified`);
  console.log(`       - ${result.indexedFilesCount} physical SHA-256 byte hashes matched`);
  console.log(`       - Repository and commit_sha consistency: 100% verified`);
  if (targetClassification) {
    console.log(`       - Classification verified: ${targetClassification}`);
  }
  if (reportPath) {
    console.log(`       - Report verified: ${reportPath}`);
  }
}

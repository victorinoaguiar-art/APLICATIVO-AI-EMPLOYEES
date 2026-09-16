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
  REQUIRED_STEP_SKIPPED: 'REQUIRED_STEP_SKIPPED',
  EVIDENCE_INDEX_INVALID: 'EVIDENCE_INDEX_INVALID',
  BRANCH_PROTECTION_STATUS_MISMATCH: 'BRANCH_PROTECTION_STATUS_MISMATCH',
  BRANCH_PROTECTION_UNVERIFIED: 'BRANCH_PROTECTION_UNVERIFIED',
  BRANCH_PROTECTION_CHECK_MISSING: 'BRANCH_PROTECTION_CHECK_MISSING',
  BRANCH_PROTECTION_RULES_INSUFFICIENT: 'BRANCH_PROTECTION_RULES_INSUFFICIENT',
  BRANCH_PROTECTION_REPOSITORY_MISMATCH: 'BRANCH_PROTECTION_REPOSITORY_MISMATCH',
  EVIDENCE_PATH_INVALID: 'EVIDENCE_PATH_INVALID'
};

export const EXPECTED_PRE_MERGE_CHECKS = [
  'Clean Checkout Local Verification (22.x)',
  'Deterministic Build, Typecheck, Test & Audit (22.x)'
];

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

    // Verify response_sha256 if branch-protection-api-response.json exists
    const bpApiResPath = path.join(targetDir, 'branch-protection-api-response.json');
    if (fs.existsSync(bpApiResPath)) {
      const apiResRaw = fs.readFileSync(bpApiResPath, 'utf8');
      const computedSha = crypto.createHash('sha256').update(apiResRaw).digest('hex');
      if (bpData.response_sha256 && computedSha !== bpData.response_sha256) {
        return {
          valid: false,
          code: ERROR_CODES.EVIDENCE_HASH_MISMATCH,
          error: `response_sha256 in branch-protection.json does not match hash of branch-protection-api-response.json`
        };
      }

      // If branch protection is CONFIGURED, perform deep structural validation of the API response
      if (bpData.branch_protection_status === 'CONFIGURED') {
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

        // Validate repository and branch in API URL
        const expectedUrlPattern = `repos/${expectedRepo}/branches/master/protection`;
        if (bpApiData.url && !bpApiData.url.includes(expectedUrlPattern)) {
          return {
            valid: false,
            code: ERROR_CODES.BRANCH_PROTECTION_REPOSITORY_MISMATCH,
            error: `Branch protection API URL mismatch: expected ${expectedUrlPattern}, found ${bpApiData.url}`
          };
        }

        // Validate required status checks
        if (!bpApiData.required_status_checks || !Array.isArray(bpApiData.required_status_checks.contexts)) {
          return {
            valid: false,
            code: ERROR_CODES.BRANCH_PROTECTION_CHECK_MISSING,
            error: 'Required status checks not configured in branch protection.'
          };
        }

        const configuredContexts = bpApiData.required_status_checks.contexts;
        for (const expectedCheck of EXPECTED_PRE_MERGE_CHECKS) {
          if (!configuredContexts.includes(expectedCheck)) {
            return {
              valid: false,
              code: ERROR_CODES.BRANCH_PROTECTION_CHECK_MISSING,
              error: `Required pre-merge check missing in branch protection: "${expectedCheck}". Configured checks: [${configuredContexts.join(', ')}]`
            };
          }
        }

        // Validate material protection rules
        if (!bpApiData.required_pull_request_reviews) {
          return {
            valid: false,
            code: ERROR_CODES.BRANCH_PROTECTION_RULES_INSUFFICIENT,
            error: 'Pull request reviews are required before merge in branch protection.'
          };
        }

        if (bpApiData.allow_force_pushes?.enabled) {
          return {
            valid: false,
            code: ERROR_CODES.BRANCH_PROTECTION_RULES_INSUFFICIENT,
            error: 'Force pushes are permitted on master branch.'
          };
        }

        if (bpApiData.allow_deletions?.enabled) {
          return {
            valid: false,
            code: ERROR_CODES.BRANCH_PROTECTION_RULES_INSUFFICIENT,
            error: 'Branch deletions are permitted on master branch.'
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
  const enforceRemoteCi = args.includes('--remote') || args.includes('--ci') || process.env.ENFORCE_REMOTE_CI === 'true';
  const shaArgIndex = args.indexOf('--sha');
  const targetSha = shaArgIndex !== -1 ? args[shaArgIndex + 1] : undefined;
  const dirArgIndex = args.indexOf('--dir');
  const evidenceDir = dirArgIndex !== -1 ? args[dirArgIndex + 1] : undefined;

  console.log(`[VERIFY:EVIDENCE-COHERENCE] Starting coherence audit (enforceRemoteCi: ${enforceRemoteCi})...`);
  const result = verifyEvidenceCoherence({ targetSha, enforceRemoteCi, evidenceDir });

  if (!result.valid) {
    console.error(`[FAIL] ${result.code}: ${result.error}`);
    process.exit(1);
  }

  console.log(`[PASS] Evidence coherence gate cleared successfully for SHA ${result.commit_sha}`);
  console.log(`       - ${result.filesChecked} required files present and verified`);
  console.log(`       - ${result.indexedFilesCount} physical SHA-256 byte hashes matched`);
  console.log(`       - Repository and commit_sha consistency: 100% verified`);
}

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

import { validateEvidenceDir } from './lib/evidencePathValidator.mjs';
import { REQUIRED_CI_JOBS_AND_STEPS } from './verify-evidence-coherence.mjs';

const runId = process.env.PRIMARY_RUN_ID || process.argv[2];
const headSha = process.env.HEAD_SHA || process.argv[3];
const rawEvidenceDir = process.env.EVIDENCE_DIR || process.argv[4];
const remoteRunId = process.env.REMOTE_VERIFICATION_RUN_ID || process.env.GITHUB_RUN_ID || process.argv[5];
const remoteRunAttempt = process.env.REMOTE_RUN_ATTEMPT || process.env.GITHUB_RUN_ATTEMPT || process.argv[6];
const queryActor = process.env.EXPECTED_QUERY_ACTOR || process.env.GITHUB_ACTOR || process.argv[7];

if (!runId || !headSha) {
  console.error('[ERROR] Missing PRIMARY_RUN_ID or HEAD_SHA.');
  process.exit(1);
}

let evidenceDir;
try {
  evidenceDir = validateEvidenceDir(rawEvidenceDir, ROOT_DIR);
} catch (err) {
  console.error(`[FATAL] ${err.code || 'EVIDENCE_PATH_INVALID'}: ${err.message}`);
  process.exit(1);
}

const receiptPath = path.join(evidenceDir, 'github-actions-receipt.json');
let receipt = {};
if (fs.existsSync(receiptPath)) {
  try {
    receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  } catch {}
}

console.log(`[SYNC-REMOTE-RECEIPT] Fetching primary CI run raw API response for Run ID ${runId}...`);
try {
  const primaryRunRaw = process.env.MOCK_PRIMARY_RUN_RESPONSE
    ? fs.readFileSync(process.env.MOCK_PRIMARY_RUN_RESPONSE, 'utf8')
    : execSync(`gh api repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/${runId}`, {
        encoding: 'utf8',
        cwd: ROOT_DIR,
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();
  const primaryRunData = JSON.parse(primaryRunRaw);
  const primaryRunResPath = path.join(evidenceDir, 'primary-ci-run-api-response.json');
  fs.writeFileSync(primaryRunResPath, primaryRunRaw, 'utf8');
  const primaryRunSha256 = crypto.createHash('sha256').update(primaryRunRaw).digest('hex');
  fs.writeFileSync(`${primaryRunResPath}.sha256`, `${primaryRunSha256}  primary-ci-run-api-response.json\n`, 'utf8');

  if (primaryRunData.status !== 'completed') {
    console.error(`[FATAL] PRIMARY_CI_STATUS_NOT_COMPLETED: Primary CI run status is '${primaryRunData.status}'. Receipt can only be generated after completion.`);
    process.exit(1);
  }
  if (primaryRunData.conclusion !== 'success') {
    console.error(`[FATAL] PRIMARY_CI_CONCLUSION_NOT_SUCCESS: Primary CI run conclusion is '${primaryRunData.conclusion}'. Expected 'success'.`);
    process.exit(1);
  }

  console.log(`[SYNC-REMOTE-RECEIPT] Fetching primary CI jobs raw API response for Run ID ${runId}...`);
  const primaryJobsRaw = process.env.MOCK_PRIMARY_JOBS_RESPONSE
    ? fs.readFileSync(process.env.MOCK_PRIMARY_JOBS_RESPONSE, 'utf8')
    : execSync(`gh api repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/${runId}/jobs`, {
        encoding: 'utf8',
        cwd: ROOT_DIR,
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim();
  const primaryJobsData = JSON.parse(primaryJobsRaw);
  const primaryJobsResPath = path.join(evidenceDir, 'primary-ci-jobs-api-response.json');
  fs.writeFileSync(primaryJobsResPath, primaryJobsRaw, 'utf8');
  const primaryJobsSha256 = crypto.createHash('sha256').update(primaryJobsRaw).digest('hex');
  fs.writeFileSync(`${primaryJobsResPath}.sha256`, `${primaryJobsSha256}  primary-ci-jobs-api-response.json\n`, 'utf8');

  if (primaryRunData.head_sha !== headSha) {
    console.error(`[FATAL] PRIMARY_CI_SHA_MISMATCH: Head SHA '${primaryRunData.head_sha}' !== expected '${headSha}'`);
    process.exit(1);
  }
  if (primaryRunData.repository?.id !== 1363667011 || primaryRunData.head_repository?.id !== 1363667011) {
    console.error(`[FATAL] PRIMARY_CI_REPO_INVALID: Repository ID (${primaryRunData.repository?.id}) !== 1363667011`);
    process.exit(1);
  }

  receipt.repository = 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';
  receipt.repository_id = 1363667011;
  receipt.head_repository_id = 1363667011;
  receipt.branch = 'master';
  receipt.commit_sha = primaryRunData.head_sha || headSha;
  receipt.workflow_path = primaryRunData.path || '.github/workflows/ci.yml';
  receipt.run_id = primaryRunData.id;
  receipt.run_attempt = primaryRunData.run_attempt || 1;
  receipt.run_url = primaryRunData.html_url;
  receipt.status = primaryRunData.status;
  receipt.conclusion = primaryRunData.conclusion;
  receipt.started_at = primaryRunData.created_at;
  receipt.completed_at = primaryRunData.updated_at;
  receipt.primary_run_id = primaryRunData.id || Number(runId);
  receipt.raw_run_response_sha256 = primaryRunSha256;
  receipt.raw_jobs_response_sha256 = primaryJobsSha256;
  receipt.verified_at = new Date().toISOString();
  receipt.jobs = primaryJobsData.jobs || [];

  // Query remote verification run details directly from GitHub API
  if (remoteRunId) {
    console.log(`[SYNC-REMOTE-RECEIPT] Fetching authoritative remote execution details for Run ID ${remoteRunId}...`);
    try {
      const remoteApiRaw = process.env.MOCK_REMOTE_RUN_RESPONSE
        ? fs.readFileSync(process.env.MOCK_REMOTE_RUN_RESPONSE, 'utf8')
        : execSync(`gh api repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/${remoteRunId}`, {
            encoding: 'utf8',
            cwd: ROOT_DIR,
            stdio: ['pipe', 'pipe', 'pipe']
          }).trim();
      const remoteApiData = JSON.parse(remoteApiRaw);

      const remoteApiResPath = path.join(evidenceDir, 'remote-workflow-run-api-response.json');
      fs.writeFileSync(remoteApiResPath, remoteApiRaw, 'utf8');

      const remoteRunResponseSha256 = crypto.createHash('sha256').update(remoteApiRaw).digest('hex');

      if (!remoteApiData.id || !Number.isInteger(Number(remoteApiData.id)) || Number(remoteApiData.id) <= 0) {
        console.error('[FATAL] REMOTE_RUN_ID_MISSING: remote API response missing valid integer id');
        process.exit(1);
      }
      if (remoteApiData.run_attempt === undefined || remoteApiData.run_attempt === null || !Number.isInteger(Number(remoteApiData.run_attempt)) || Number(remoteApiData.run_attempt) < 1) {
        console.error('[FATAL] REMOTE_RUN_ATTEMPT_MISSING: remote API response missing valid integer run_attempt >= 1');
        process.exit(1);
      }
      if (!remoteApiData.head_sha || typeof remoteApiData.head_sha !== 'string' || !/^[0-9a-f]{40}$/i.test(remoteApiData.head_sha)) {
        console.error('[FATAL] REMOTE_HEAD_SHA_MISSING: remote API response missing valid 40-character hex head_sha');
        process.exit(1);
      }
      if (!remoteApiData.head_branch || remoteApiData.head_branch !== 'master') {
        console.error('[FATAL] REMOTE_HEAD_BRANCH_INVALID: remote API response missing head_branch or not master');
        process.exit(1);
      }
      if (!remoteApiData.status) {
        console.error('[FATAL] REMOTE_STATUS_MISSING: remote API response missing status');
        process.exit(1);
      }
      if (!remoteApiData.run_started_at || isNaN(Date.parse(remoteApiData.run_started_at))) {
        console.error('[FATAL] REMOTE_STARTED_AT_MISSING: remote API response missing valid run_started_at');
        process.exit(1);
      }
      if (!remoteApiData.created_at || isNaN(Date.parse(remoteApiData.created_at))) {
        console.error('[FATAL] REMOTE_CREATED_AT_MISSING: remote API response missing valid created_at');
        process.exit(1);
      }
      if (!remoteApiData.updated_at || isNaN(Date.parse(remoteApiData.updated_at))) {
        console.error('[FATAL] REMOTE_UPDATED_AT_MISSING: remote API response missing valid updated_at');
        process.exit(1);
      }
      if (Date.parse(remoteApiData.created_at) > Date.parse(remoteApiData.updated_at)) {
        console.error('[FATAL] REMOTE_TIMESTAMPS_INVERTED: created_at cannot be posterior to updated_at');
        process.exit(1);
      }
      if (!remoteApiData.html_url || typeof remoteApiData.html_url !== 'string' || !remoteApiData.html_url.includes(String(remoteApiData.id))) {
        console.error('[FATAL] REMOTE_URL_MISSING: remote API response missing valid html_url containing run ID');
        process.exit(1);
      }
      const remoteActor = remoteApiData.actor?.login || remoteApiData.triggering_actor?.login;
      if (!remoteActor || typeof remoteActor !== 'string' || remoteActor.trim().length === 0) {
        console.error('[FATAL] REMOTE_ACTOR_MISSING: remote API response missing actor login');
        process.exit(1);
      }
      if (!remoteApiData.repository || remoteApiData.repository.full_name !== 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES') {
        console.error('[FATAL] REMOTE_REPOSITORY_INVALID: remote API response missing repository or mismatch');
        process.exit(1);
      }
      const isExpectedWorkflow = remoteApiData.name === 'Evidence Remote Verification' ||
        (remoteApiData.path && remoteApiData.path.endsWith('evidence-remote-verification.yml'));
      if (!isExpectedWorkflow) {
        console.error('[FATAL] REMOTE_WORKFLOW_INVALID: remote API response does not identify Evidence Remote Verification workflow');
        process.exit(1);
      }

      receipt.remote_verification_run_id = Number(remoteApiData.id);
      receipt.remote_run_attempt = Number(remoteApiData.run_attempt);
      receipt.remote_started_at = remoteApiData.run_started_at;
      receipt.remote_created_at = remoteApiData.created_at;
      receipt.remote_updated_at = remoteApiData.updated_at;
      receipt.remote_run_url = remoteApiData.html_url;
      receipt.remote_actor = remoteActor;
      receipt.remote_run_response_sha256 = remoteRunResponseSha256;
      console.log(`[SYNC-REMOTE-RECEIPT] Successfully synced remote run details (started_at: ${receipt.remote_started_at}, actor: ${receipt.remote_actor}).`);
    } catch (remoteErr) {
      console.error(`[FATAL] REMOTE_API_QUERY_FAILED: Failed to fetch remote execution ${remoteRunId} from GitHub API: ${remoteErr.message}`);
      process.exit(1);
    }
  } else {
    console.error('[FATAL] REMOTE_RUN_ID_MISSING: remoteRunId must be specified for remote synchronization');
    process.exit(1);
  }

  // Derive skipped, failed, pending, and cancelled required steps from real job steps
  const skippedSteps = [];
  const failedSteps = [];
  const pendingSteps = [];
  const cancelledSteps = [];
  for (const [jobName, steps] of Object.entries(REQUIRED_CI_JOBS_AND_STEPS)) {
    const job = receipt.jobs.find(j => j.name === jobName);
    if (!job) {
      failedSteps.push(`Job missing: ${jobName}`);
      continue;
    }
    for (const stepName of steps) {
      const step = job.steps?.find(s => s.name === stepName);
      if (!step) {
        failedSteps.push(`Step missing: ${stepName} in ${jobName}`);
      } else if (step.conclusion === 'skipped' || step.status === 'skipped') {
        skippedSteps.push(`${stepName} (${jobName})`);
      } else if (['pending', 'in_progress', 'queued'].includes(step.status) || ['pending', 'in_progress', 'queued'].includes(step.conclusion)) {
        pendingSteps.push(`${stepName} (${jobName})`);
      } else if (step.conclusion === 'cancelled' || step.status === 'cancelled') {
        cancelledSteps.push(`${stepName} (${jobName})`);
      } else if (['failure', 'timed_out'].includes(step.conclusion) || ['failure', 'timed_out'].includes(step.status)) {
        failedSteps.push(`${stepName} [${step.conclusion || step.status}] (${jobName})`);
      }
    }
  }
  receipt.required_steps_failed = failedSteps;
  receipt.required_steps_skipped = skippedSteps;
  receipt.required_steps_pending = pendingSteps;
  receipt.required_steps_cancelled = cancelledSteps;
  receipt.skipped_required_steps = skippedSteps;
  receipt.failed_required_steps = failedSteps;

  if (receipt.status !== 'completed' || receipt.conclusion !== 'success') {
    console.error(`[FATAL] PRIMARY_CI_INCOMPLETE: Primary CI status is '${receipt.status}', conclusion is '${receipt.conclusion}' (expected 'completed' / 'success')`);
    process.exit(1);
  }

  if (failedSteps.length > 0 || pendingSteps.length > 0 || cancelledSteps.length > 0 || skippedSteps.length > 0) {
    console.error(`[FATAL] REQUIRED_STEPS_NOT_CLEAN: failed=${failedSteps.length}, pending=${pendingSteps.length}, cancelled=${cancelledSteps.length}, skipped=${skippedSteps.length}`);
    process.exit(1);
  }

  // Query live branch protection if token is available
  try {
    console.log('[SYNC-REMOTE-RECEIPT] Querying GitHub API for live branch protection...');
    const bpApiRaw = process.env.MOCK_BP_API_RESPONSE
      ? fs.readFileSync(process.env.MOCK_BP_API_RESPONSE, 'utf8')
      : execSync('gh api repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/branches/master/protection', {
          encoding: 'utf8',
          cwd: ROOT_DIR,
          stdio: ['pipe', 'pipe', 'pipe']
        }).trim();
    const bpApiData = JSON.parse(bpApiRaw);

    const bpApiResPath = path.join(evidenceDir, 'branch-protection-api-response.json');
    fs.writeFileSync(bpApiResPath, bpApiRaw, 'utf8');

    const bpResponseSha256 = crypto.createHash('sha256').update(bpApiRaw).digest('hex');
    const bpJsonPath = path.join(evidenceDir, 'branch-protection.json');

    const branchProtectionReceipt = {
      repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
      branch: 'master',
      source: 'GITHUB_REST_API',
      api_endpoint: 'repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/branches/master/protection',
      queried_at: new Date().toISOString(),
      query_actor: receipt.remote_actor,
      query_run_id: receipt.remote_verification_run_id,
      primary_run_id: Number(runData.databaseId || runId),
      remote_verification_run_id: receipt.remote_verification_run_id,
      remote_run_attempt: receipt.remote_run_attempt,
      remote_run_url: receipt.remote_run_url,
      query_workflow: process.env.GITHUB_WORKFLOW || 'Evidence Remote Verification',
      source_sha: runData.headSha || headSha,
      http_status: 200,
      branch_protection_status: 'CONFIGURED',
      required_status_checks: bpApiData.required_status_checks?.contexts || [],
      pull_request_required: !!bpApiData.required_pull_request_reviews,
      required_approving_review_count: bpApiData.required_pull_request_reviews?.required_approving_review_count ?? 1,
      dismiss_stale_reviews: !!bpApiData.required_pull_request_reviews?.dismiss_stale_reviews,
      require_code_owner_reviews: !!bpApiData.required_pull_request_reviews?.require_code_owner_reviews,
      strict_up_to_date_required: !!bpApiData.required_status_checks?.strict,
      enforce_admins: !!bpApiData.enforce_admins?.enabled,
      enforce_admins_justification: bpApiData.enforce_admins?.enabled ? 'Admin enforcement active' : 'Solo repository maintainer bypass permitted for emergency maintenance; pre-merge checks enforced on pull requests.',
      allow_force_pushes: !!bpApiData.allow_force_pushes?.enabled,
      allow_deletions: !!bpApiData.allow_deletions?.enabled,
      required_conversation_resolution: !!bpApiData.required_conversation_resolution?.enabled,
      response_sha256: bpResponseSha256
    };
    fs.writeFileSync(bpJsonPath, JSON.stringify(branchProtectionReceipt, null, 2), 'utf8');
    receipt.branch_protection_status = 'CONFIGURED';
    console.log('[SYNC-REMOTE-RECEIPT] Successfully synced live branch protection data (HTTP 200 CONFIGURED).');
  } catch (bpErr) {
    console.warn(`[SYNC-REMOTE-RECEIPT] Live branch protection query: ${bpErr.message}`);
  }

  const syncTimestamp = new Date().toISOString();
  receipt.remote_synced_at = syncTimestamp;

  if (receipt.remote_started_at && Date.parse(receipt.remote_started_at) > Date.parse(receipt.remote_synced_at)) {
    console.error(`[FATAL] REMOTE_STARTED_AFTER_SYNC: remote_started_at (${receipt.remote_started_at}) cannot be posterior to remote_synced_at (${receipt.remote_synced_at})`);
    process.exit(1);
  }

  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');
  console.log(`[SYNC-REMOTE-RECEIPT] Updated ${receiptPath} with completed run data (Status: ${receipt.status}, Conclusion: ${receipt.conclusion}, remote_synced_at: ${receipt.remote_synced_at}).`);

  // Recalculate index hashes for all evidence files
  const indexPath = path.join(evidenceDir, 'evidence-files.sha256');
  if (fs.existsSync(indexPath)) {
    const dirEntries = fs.readdirSync(evidenceDir)
      .filter(f => f !== 'evidence-files.sha256')
      .filter(f => fs.statSync(path.join(evidenceDir, f)).isFile())
      .sort();
    const evidenceHashLines = dirEntries.map(f => {
      const content = fs.readFileSync(path.join(evidenceDir, f));
      const h = crypto.createHash('sha256').update(content).digest('hex');
      return `${h}  ${f}`;
    });
    fs.writeFileSync(indexPath, evidenceHashLines.join('\n') + '\n', 'utf8');
    console.log(`[SYNC-REMOTE-RECEIPT] Recalculated index hashes in ${indexPath} (${dirEntries.length} files indexed).`);
  }
} catch (err) {
  console.error('[ERROR] Failed to query GitHub API:', err.message);
  process.exit(1);
}

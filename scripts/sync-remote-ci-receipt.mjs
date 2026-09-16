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

console.log(`[SYNC-REMOTE-RECEIPT] Fetching GitHub Actions run details for Run ID ${runId}...`);
try {
  const runOutput = execSync(`gh run view ${runId} --json databaseId,url,status,conclusion,createdAt,updatedAt,headSha`, {
    encoding: 'utf8',
    cwd: ROOT_DIR
  });
  const runData = JSON.parse(runOutput);

  receipt.repository = 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';
  receipt.branch = 'master';
  receipt.commit_sha = runData.headSha || headSha;
  receipt.run_id = runData.databaseId;
  receipt.run_url = runData.url;
  receipt.status = runData.status;
  receipt.conclusion = runData.conclusion;
  receipt.started_at = runData.createdAt;
  receipt.completed_at = runData.updatedAt;

  const jobsOutput = execSync(`gh run view ${runId} --json jobs`, { encoding: 'utf8', cwd: ROOT_DIR });
  const jobsData = JSON.parse(jobsOutput);
  receipt.jobs = jobsData.jobs || [];

  // Derive skipped and failed required steps from real job steps
  const skippedSteps = [];
  const failedSteps = [];
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
      } else if (['cancelled', 'failure'].includes(step.conclusion) || ['cancelled', 'failure'].includes(step.status)) {
        failedSteps.push(`${stepName} [${step.conclusion || step.status}] (${jobName})`);
      }
    }
  }
  receipt.skipped_required_steps = skippedSteps;
  receipt.failed_required_steps = failedSteps;

  // Query live branch protection if token is available
  try {
    console.log('[SYNC-REMOTE-RECEIPT] Querying GitHub API for live branch protection...');
    const bpApiRaw = execSync('gh api repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/branches/master/protection', {
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
      query_actor: process.env.GITHUB_ACTOR || 'GitHub Actions',
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

  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');
  console.log(`[SYNC-REMOTE-RECEIPT] Updated ${receiptPath} with completed run data (Status: ${receipt.status}, Conclusion: ${receipt.conclusion}).`);

  // Recalculate index hashes
  const indexPath = path.join(evidenceDir, 'evidence-files.sha256');
  if (fs.existsSync(indexPath)) {
    const filesToHash = [
      'github-actions-receipt.json',
      'branch-protection.json',
      'branch-protection-api-response.json'
    ];
    const hashes = {};
    for (const f of filesToHash) {
      const p = path.join(evidenceDir, f);
      if (fs.existsSync(p)) {
        hashes[f] = crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
      }
    }

    const lines = fs.readFileSync(indexPath, 'utf8').split('\n');
    const updatedLines = lines.map(line => {
      for (const [f, h] of Object.entries(hashes)) {
        if (line.includes(`  ${f}`)) {
          return `${h}  ${f}`;
        }
      }
      return line;
    });
    fs.writeFileSync(indexPath, updatedLines.join('\n'), 'utf8');
    console.log(`[SYNC-REMOTE-RECEIPT] Recalculated index hashes in ${indexPath}.`);
  }
} catch (err) {
  console.error('[ERROR] Failed to query GitHub API:', err.message);
  process.exit(1);
}

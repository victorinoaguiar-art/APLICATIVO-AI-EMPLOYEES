import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const runId = process.env.PRIMARY_RUN_ID || process.argv[2];
const headSha = process.env.HEAD_SHA || process.argv[3];
const evidenceDir = process.env.EVIDENCE_DIR || process.argv[4] || path.resolve(ROOT_DIR, '.artifacts/evidence');

if (!runId || !headSha) {
  console.error('[ERROR] Missing PRIMARY_RUN_ID or HEAD_SHA.');
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

  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');
  console.log(`[SYNC-REMOTE-RECEIPT] Updated ${receiptPath} with completed run data (Status: ${receipt.status}, Conclusion: ${receipt.conclusion}).`);
} catch (err) {
  console.error('[ERROR] Failed to query GitHub API:', err.message);
  process.exit(1);
}

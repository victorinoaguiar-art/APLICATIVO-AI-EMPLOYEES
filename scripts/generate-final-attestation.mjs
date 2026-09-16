import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dir') args.evidenceDir = argv[++i];
    else if (arg === '--output') args.outputDir = argv[++i];
    else if (arg === '--sha') args.sha = argv[++i];
    else if (arg === '--primary-run-id') args.primaryRunId = argv[++i];
    else if (arg === '--remote-run-id') args.remoteRunId = argv[++i];
    else if (arg === '--primary-conclusion') args.primaryConclusion = argv[++i];
    else if (arg === '--remote-conclusion') args.remoteConclusion = argv[++i];
    else if (arg === '--actor') args.actor = argv[++i];
    else if (arg === '--classification') args.classification = argv[++i];
    else if (arg === '--artifact-id') args.artifactId = argv[++i];
    else if (arg === '--artifact-name') args.artifactName = argv[++i];
  }
  return args;
}

const ALLOWED_CLASSIFICATIONS = [
  'PATCH_VERIFIED_AND_CI_ENFORCED',
  'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
  'PATCH_VERIFIED_AND_CI_GREEN'
];

export function generateFinalAttestation(options = {}) {
  const evidenceDir = path.resolve(ROOT_DIR, options.evidenceDir || '.artifacts/evidence');
  const outputDir = path.resolve(ROOT_DIR, options.outputDir || '.artifacts/attestation');

  if (!fs.existsSync(evidenceDir)) {
    throw new Error(`Evidence directory not found: ${evidenceDir}`);
  }

  const receiptPath = path.join(evidenceDir, 'github-actions-receipt.json');
  const bpPath = path.join(evidenceDir, 'branch-protection.json');
  const indexPath = path.join(evidenceDir, 'evidence-files.sha256');

  if (!fs.existsSync(receiptPath)) throw new Error('github-actions-receipt.json missing in evidence directory');
  if (!fs.existsSync(bpPath)) throw new Error('branch-protection.json missing in evidence directory');
  if (!fs.existsSync(indexPath)) throw new Error('evidence-files.sha256 missing in evidence directory');

  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
  const indexContent = fs.readFileSync(indexPath);
  const evidenceIndexSha256 = crypto.createHash('sha256').update(indexContent).digest('hex');

  const commitSha = options.sha || receipt.commit_sha || bpData.source_sha;
  if (!commitSha || typeof commitSha !== 'string' || !/^[0-9a-f]{40}$/i.test(commitSha)) {
    throw new Error(`Invalid or missing commit SHA for attestation: ${commitSha}`);
  }

  const primaryRunId = Number(options.primaryRunId || receipt.primary_run_id || receipt.run_id);
  if (!primaryRunId || !Number.isInteger(primaryRunId) || primaryRunId <= 0) {
    throw new Error(`Invalid or missing primary_run_id for attestation: ${primaryRunId}`);
  }

  const remoteRunId = Number(options.remoteRunId || receipt.remote_verification_run_id || bpData.query_run_id);
  if (!remoteRunId || !Number.isInteger(remoteRunId) || remoteRunId <= 0) {
    throw new Error(`Invalid or missing remote_verification_run_id for attestation: ${remoteRunId}`);
  }

  if (primaryRunId === remoteRunId) {
    throw new Error(`primary_run_id (${primaryRunId}) and remote_verification_run_id (${remoteRunId}) cannot collide`);
  }

  const primaryRunUrl = receipt.run_url || (primaryRunId ? `https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/${primaryRunId}` : null);
  if (!primaryRunUrl) {
    throw new Error('primary_run_url missing for attestation');
  }

  const remoteRunUrl = receipt.remote_run_url || (remoteRunId ? `https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/${remoteRunId}` : null);
  if (!remoteRunUrl) {
    throw new Error('remote_run_url missing for attestation');
  }

  const queryActor = options.actor || receipt.remote_actor || bpData.query_actor;
  if (!queryActor || typeof queryActor !== 'string' || queryActor.trim().length === 0) {
    throw new Error('Validated query actor missing for attestation');
  }

  const primaryConclusion = options.primaryConclusion || receipt.conclusion;
  if (!primaryConclusion) {
    throw new Error('primary_conclusion missing in evidence for attestation');
  }
  if (primaryConclusion !== 'success') {
    throw new Error(`primary_conclusion must be "success", found "${primaryConclusion}"`);
  }

  const remoteConclusion = options.remoteConclusion || receipt.remote_conclusion;
  if (!remoteConclusion) {
    throw new Error('remote_conclusion missing in evidence for attestation');
  }
  if (remoteConclusion !== 'success') {
    throw new Error(`remote_conclusion must be "success", found "${remoteConclusion}"`);
  }

  if (!receipt.remote_started_at || isNaN(Date.parse(receipt.remote_started_at))) {
    throw new Error(`remote_started_at missing or invalid in receipt: "${receipt.remote_started_at}"`);
  }

  const classification = options.classification || receipt.classification;
  if (!classification || !ALLOWED_CLASSIFICATIONS.includes(classification)) {
    throw new Error(`Invalid classification for attestation: "${classification}". Allowed: ${ALLOWED_CLASSIFICATIONS.join(', ')}`);
  }

  const artifactName = options.artifactName || `aetf-verified-remote-evidence-bundle-${commitSha}`;
  if (artifactName !== `aetf-verified-remote-evidence-bundle-${commitSha}`) {
    throw new Error(`Artifact name mismatch: expected "aetf-verified-remote-evidence-bundle-${commitSha}", found "${artifactName}"`);
  }

  const attestation = {
    repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
    branch: 'master',
    attested_commit_sha: commitSha,
    primary_run_id: primaryRunId,
    primary_run_url: primaryRunUrl,
    primary_conclusion: primaryConclusion,
    remote_verification_run_id: remoteRunId,
    remote_run_url: remoteRunUrl,
    remote_conclusion: remoteConclusion,
    remote_started_at: receipt.remote_started_at,
    query_actor: queryActor,
    query_run_id: remoteRunId,
    artifact_name: artifactName,
    classification,
    operational_state: 'PRE-PRODUCTION / L2 HARDENED',
    generated_at: new Date().toISOString(),
    evidence_index_sha256: evidenceIndexSha256,
    status: 'PASS'
  };

  if (options.artifactId) {
    const artId = Number(options.artifactId);
    if (!Number.isInteger(artId) || artId <= 0) {
      throw new Error(`Invalid artifact_id: ${options.artifactId}`);
    }
    attestation.artifact_id = artId;
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const jsonOutPath = path.join(outputDir, 'final-attestation.json');
  fs.writeFileSync(jsonOutPath, JSON.stringify(attestation, null, 2), 'utf8');

  const mdContent = `# AETF-500 — Final Forensic Attestation & Remote Verification Receipt

> **Receipt Notice:** This document is an authoritative execution receipt produced dynamically during GitHub Actions CI and is not a versioned repository source file.

| Property | Value |
|---|---|
| **Repository** | ${attestation.repository} |
| **Branch** | ${attestation.branch} |
| **Attested Commit SHA** | \`${attestation.attested_commit_sha}\` |
| **Primary CI Run ID** | [${attestation.primary_run_id}](${attestation.primary_run_url}) (${attestation.primary_conclusion}) |
| **Remote Verification Run ID** | [${attestation.remote_verification_run_id}](${attestation.remote_run_url}) (${attestation.remote_conclusion}) |
| **Remote Run Started At** | \`${attestation.remote_started_at}\` |
| **Validated Query Actor** | \`${attestation.query_actor}\` |
| **Verified Evidence Bundle** | \`${attestation.artifact_name}\` |
| **Evidence Index SHA-256** | \`${attestation.evidence_index_sha256}\` |
| **Classification** | \`${attestation.classification}\` |
| **Operational State** | \`${attestation.operational_state}\` |
| **Attestation Status** | **${attestation.status}** |
| **Generated At (UTC)** | \`${attestation.generated_at}\` |
`;

  const mdOutPath = path.join(outputDir, 'final-attestation.md');
  fs.writeFileSync(mdOutPath, mdContent, 'utf8');

  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, mdContent + '\n', 'utf8');
      console.log('[ATTESTATION] Successfully published final attestation to GITHUB_STEP_SUMMARY.');
    } catch (err) {
      console.warn('[ATTESTATION] Could not write to GITHUB_STEP_SUMMARY:', err.message);
    }
  }

  console.log(`[ATTESTATION] Successfully generated final attestation in ${outputDir}`);
  return attestation;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  generateFinalAttestation(args);
}

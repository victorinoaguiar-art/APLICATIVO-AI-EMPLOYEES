import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { verifyEvidenceCoherence, REQUIRED_EVIDENCE_FILES } from './verify-evidence-coherence.mjs';
import { validateEvidenceDir } from './lib/evidencePathValidator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function parseBundleCliArgs(args) {
  const parsed = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dir') {
      parsed.evidenceDir = args[++i];
    } else if (arg === '--sha') {
      parsed.headSha = args[++i];
    } else if (arg === '--run-id') {
      parsed.expectedRunId = args[++i];
    } else if (arg === '--report') {
      parsed.reportPath = args[++i];
    } else if (arg === '--classification') {
      parsed.classification = args[++i];
    } else if (arg === '--expected-query-actor') {
      parsed.expectedQueryActor = args[++i];
    } else if (arg === '--remote-run-id') {
      parsed.remoteRunId = args[++i];
    } else if (!arg.startsWith('--')) {
      positional.push(arg);
    }
  }
  if (!parsed.evidenceDir && positional[0]) parsed.evidenceDir = positional[0];
  if (!parsed.headSha && positional[1]) parsed.headSha = positional[1];
  if (!parsed.expectedRunId && positional[2]) parsed.expectedRunId = positional[2];
  if (!parsed.reportPath && positional[3]) parsed.reportPath = positional[3];
  if (!parsed.classification && positional[4]) parsed.classification = positional[4];
  if (!parsed.expectedQueryActor && positional[5]) parsed.expectedQueryActor = positional[5];
  if (!parsed.remoteRunId && positional[6]) parsed.remoteRunId = positional[6];
  return parsed;
}

export function verifyEvidenceBundle(options = {}) {
  const cliParsed = process.argv[1] === fileURLToPath(import.meta.url) ? parseBundleCliArgs(process.argv.slice(2)) : {};
  const rawEvidenceDir = options.evidenceDir || cliParsed.evidenceDir || '.artifacts/evidence';
  const headSha = options.headSha || cliParsed.headSha;
  const expectedRunId = options.expectedRunId || cliParsed.expectedRunId;
  const reportPath = options.reportPath || cliParsed.reportPath || 'AETF500_Relatorio_Correccao_Final_Evidencias_CI.md';
  const classification = options.classification || cliParsed.classification || 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS';
  const expectedQueryActor = options.expectedQueryActor || cliParsed.expectedQueryActor || process.env.EXPECTED_QUERY_ACTOR;
  const remoteRunId = options.remoteRunId || cliParsed.remoteRunId || process.env.REMOTE_VERIFICATION_RUN_ID;

  const evidenceDir = validateEvidenceDir(rawEvidenceDir, ROOT_DIR, {
    allowedTempRoot: options.allowedTempRoot || (options.evidenceDir ? path.resolve(options.evidenceDir) : null)
  });

  // 1. Run full coherence audit
  const coherenceResult = verifyEvidenceCoherence({
    evidenceDir,
    targetSha: headSha,
    enforceRemoteCi: true,
    targetClassification: classification,
    reportPath,
    expectedQueryActor,
    remoteRunId
  });

  if (!coherenceResult.valid) {
    return {
      valid: false,
      code: coherenceResult.code,
      error: `Evidence coherence gate failed: ${coherenceResult.error}`
    };
  }

  // 2. All required files exist on disk
  for (const reqFile of REQUIRED_EVIDENCE_FILES) {
    const fp = path.join(evidenceDir, reqFile);
    if (!fs.existsSync(fp)) {
      return {
        valid: false,
        code: 'BUNDLE_FILE_MISSING',
        error: `Required evidence file missing in bundle: ${reqFile}`
      };
    }
  }

  // 3. evidence-files.sha256 matches final physical bytes
  const indexPath = path.join(evidenceDir, 'evidence-files.sha256');
  if (!fs.existsSync(indexPath)) {
    return {
      valid: false,
      code: 'BUNDLE_INDEX_MISSING',
      error: 'Index evidence-files.sha256 missing in bundle'
    };
  }
  const indexLines = fs.readFileSync(indexPath, 'utf8').trim().split('\n').filter(Boolean);
  const indexedFiles = new Set();
  for (const line of indexLines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length !== 2) continue;
    const [expectedHash, fileName] = parts;
    indexedFiles.add(fileName);
    const fp = path.join(evidenceDir, fileName);
    if (!fs.existsSync(fp)) {
      return {
        valid: false,
        code: 'BUNDLE_INDEXED_FILE_MISSING',
        error: `Indexed file missing on disk: ${fileName}`
      };
    }
    const actualHash = crypto.createHash('sha256').update(fs.readFileSync(fp)).digest('hex');
    if (actualHash.toLowerCase() !== expectedHash.toLowerCase()) {
      return {
        valid: false,
        code: 'BUNDLE_HASH_MISMATCH',
        error: `Hash mismatch for ${fileName}: expected ${expectedHash}, computed ${actualHash}`
      };
    }
  }

  // 4. No unindexed foreign files
  const dirFiles = fs.readdirSync(evidenceDir).filter(f => f !== 'evidence-files.sha256' && fs.statSync(path.join(evidenceDir, f)).isFile());
  for (const f of dirFiles) {
    if (!indexedFiles.has(f)) {
      return {
        valid: false,
        code: 'BUNDLE_UNINDEXED_FILE',
        error: `Unindexed foreign file detected in bundle: ${f}`
      };
    }
  }

  // 5. Receipt validation: run_id and primary run association
  const receiptPath = path.join(evidenceDir, 'github-actions-receipt.json');
  const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
  const actualPrimaryId = receipt.primary_run_id || receipt.run_id;
  if (expectedRunId && Number(actualPrimaryId) !== Number(expectedRunId)) {
    return {
      valid: false,
      code: 'BUNDLE_RECEIPT_RUN_ID_MISMATCH',
      error: `Receipt primary run_id (${actualPrimaryId}) does not match expected run_id (${expectedRunId})`
    };
  }

  // 6. Verify remote run ID and query run ID separation if available
  const bpPath = path.join(evidenceDir, 'branch-protection.json');
  if (fs.existsSync(bpPath)) {
    const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
    if (actualPrimaryId && bpData.query_run_id && Number(bpData.query_run_id) === Number(actualPrimaryId)) {
      return {
        valid: false,
        code: 'BUNDLE_QUERY_RUN_ID_COLLISION',
        error: `query_run_id (${bpData.query_run_id}) cannot be identical to primary_run_id (${actualPrimaryId}) in verified bundle`
      };
    }
    if (remoteRunId && bpData.query_run_id && Number(bpData.query_run_id) !== Number(remoteRunId)) {
      return {
        valid: false,
        code: 'BUNDLE_REMOTE_RUN_ID_MISMATCH',
        error: `query_run_id mismatch: expected remote run ID "${remoteRunId}", found "${bpData.query_run_id}"`
      };
    }
  }

  // 7. Verify bundle was verified AFTER remote enrichment (receipt has remote_synced_at)
  if (!receipt.remote_synced_at) {
    return {
      valid: false,
      code: 'BUNDLE_ENRICHMENT_MISSING',
      error: 'Receipt missing remote_synced_at; bundle verification must occur after remote enrichment'
    };
  }

  return {
    valid: true,
    evidenceDir,
    headSha: coherenceResult.commit_sha,
    filesCount: indexedFiles.size
  };
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('[VERIFY:BUNDLE] Validating remote evidence bundle consistency...');
  const result = verifyEvidenceBundle();
  if (!result.valid) {
    console.error(`[FAIL] ${result.code}: ${result.error}`);
    process.exit(1);
  }
  console.log(`[PASS] Final verified remote evidence bundle is consistent and ready for upload (${result.filesCount} files verified).`);
}

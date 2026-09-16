import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { verifyEvidenceCoherence, REQUIRED_EVIDENCE_FILES } from './verify-evidence-coherence.mjs';
import { validateEvidenceDir } from './lib/evidencePathValidator.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

export function verifyEvidenceBundle(options = {}) {
  const rawEvidenceDir = options.evidenceDir || process.argv[2] || '.artifacts/evidence';
  const headSha = options.headSha || process.argv[3];
  const expectedRunId = options.expectedRunId || process.argv[4];
  const reportPath = options.reportPath || process.argv[5] || 'AETF500_Relatorio_Correccao_Final_Evidencias_CI.md';
  const classification = options.classification || process.argv[6] || 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS';

  const evidenceDir = validateEvidenceDir(rawEvidenceDir, ROOT_DIR);

  // 1. Run full coherence audit
  const coherenceResult = verifyEvidenceCoherence({
    evidenceDir,
    targetSha: headSha,
    enforceRemoteCi: true,
    targetClassification: classification,
    reportPath
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
  if (expectedRunId && Number(receipt.run_id) !== Number(expectedRunId)) {
    return {
      valid: false,
      code: 'BUNDLE_RECEIPT_RUN_ID_MISMATCH',
      error: `Receipt run_id (${receipt.run_id}) does not match expected run_id (${expectedRunId})`
    };
  }

  // 6. Verify bundle was verified AFTER remote enrichment (receipt has remote_synced_at)
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

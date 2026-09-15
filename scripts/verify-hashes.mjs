import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';

const truthDir = path.resolve(process.cwd(), 'generated/repository_truth');
const verificationDir = path.resolve(process.cwd(), 'generated/verification');
if (!fs.existsSync(verificationDir)) {
  fs.mkdirSync(verificationDir, { recursive: true });
}

const reproFile = path.join(truthDir, '01_Clean_Checkout_Reproduction.json');
if (!fs.existsSync(reproFile)) {
  console.error('[ERROR] 01_Clean_Checkout_Reproduction.json not found');
  process.exit(1);
}

const repro = JSON.parse(fs.readFileSync(reproFile, 'utf8'));

const checks = [
  {
    target_object: 'npm_install_log',
    file_name: repro.pipeline_results.npm_install.log_file,
    expected_sha256: repro.pipeline_results.npm_install.log_sha256
  },
  {
    target_object: 'npm_test_log',
    file_name: repro.pipeline_results.npm_test.log_file,
    expected_sha256: repro.pipeline_results.npm_test.log_sha256
  },
  {
    target_object: 'npm_run_build_log',
    file_name: repro.pipeline_results.npm_run_build.log_file,
    expected_sha256: repro.pipeline_results.npm_run_build.log_sha256
  }
];

const results = [];
let allPassed = true;

for (const item of checks) {
  const filePath = path.join(truthDir, item.file_name);
  if (!fs.existsSync(filePath)) {
    allPassed = false;
    results.push({
      target_object: item.target_object,
      file_name: item.file_name,
      status: 'MISSING_FILE',
      expected_sha256: item.expected_sha256,
      computed_sha256: null,
      byte_length: 0
    });
    continue;
  }

  const buf = fs.readFileSync(filePath);
  const computed = crypto.createHash('sha256').update(buf).digest('hex');
  const match = computed.toLowerCase() === item.expected_sha256.toLowerCase();
  if (!match) allPassed = false;

  results.push({
    target_object: item.target_object,
    file_name: item.file_name,
    status: match ? 'MATCH' : 'MISMATCH',
    expected_sha256: item.expected_sha256,
    computed_sha256: computed,
    byte_length: buf.length
  });
}

const receipt = {
  receipt_id: `RCPT-HASH-${Date.now()}`,
  gate_name: 'PHYSICAL_HASH_GATE',
  verifier_name: 'PhysicalHashVerifier',
  generated_at: new Date().toISOString(),
  status: allPassed ? 'PASS' : 'FAIL',
  checked_items_count: results.length,
  failure_count: results.filter(r => r.status !== 'MATCH').length,
  details: {
    truth_directory: 'generated/repository_truth',
    results
  }
};

const receiptPath = path.join(verificationDir, 'PhysicalHashVerificationReceipt.json');
fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');

console.log(`[VERIFY:HASHES] Status: ${receipt.status} (${results.length} items checked, ${receipt.failure_count} failures)`);
for (const r of results) {
  console.log(`  - ${r.file_name}: ${r.status} (sha256: ${r.computed_sha256})`);
}

if (!allPassed) {
  console.error('[VERIFY:HASHES] FAILED: One or more physical hashes mismatched or missing.');
  process.exit(1);
}

console.log('[VERIFY:HASHES] Receipt successfully written to ' + receiptPath);

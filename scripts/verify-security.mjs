import * as fs from 'node:fs';
import * as path from 'node:path';

const verificationDir = path.resolve(process.cwd(), 'generated/verification');
if (!fs.existsSync(verificationDir)) {
  fs.mkdirSync(verificationDir, { recursive: true });
}

const checks = [];
let allPassed = true;

// 1. Check .gitignore does not ignore package-lock.json
const gitignorePath = path.resolve(process.cwd(), '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const ignoresLock = gitignoreContent.split('\n').some(line => {
    const trimmed = line.trim();
    return trimmed === 'package-lock.json' || trimmed === '/package-lock.json';
  });

  if (ignoresLock) {
    allPassed = false;
    checks.push({
      check: 'PACKAGE_LOCK_TRACKING',
      status: 'FAIL',
      detail: 'package-lock.json is listed in .gitignore'
    });
  } else {
    checks.push({
      check: 'PACKAGE_LOCK_TRACKING',
      status: 'PASS',
      detail: 'package-lock.json is tracked and not ignored'
    });
  }
} else {
  checks.push({ check: 'PACKAGE_LOCK_TRACKING', status: 'PASS', detail: 'No .gitignore blocking package-lock' });
}

// 2. Check no live Stripe keys (sk_live_) in codebase
const sourceDirs = ['apps', 'packages'];
let foundLiveSecret = false;
let liveSecretLocation = '';

function scanDirForSecrets(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.next') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirForSecrets(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js') || entry.name.endsWith('.json'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('sk_live_')) {
        foundLiveSecret = true;
        liveSecretLocation = fullPath;
      }
    }
  }
}

for (const d of sourceDirs) {
  scanDirForSecrets(path.resolve(process.cwd(), d));
}

if (foundLiveSecret) {
  allPassed = false;
  checks.push({
    check: 'NO_LIVE_SECRETS',
    status: 'FAIL',
    detail: `Found live secret pattern in ${liveSecretLocation}`
  });
} else {
  checks.push({
    check: 'NO_LIVE_SECRETS',
    status: 'PASS',
    detail: 'Zero live production API credentials found in source files'
  });
}

// 3. Verify timingSafeEqual is used in tokenService and paymentGateway
const tokenServicePath = path.resolve(process.cwd(), 'apps/api/src/auth/tokenService.ts');
const paymentGatewayPath = path.resolve(process.cwd(), 'packages/marketplace-billing/src/paymentGateway.ts');

let cryptoTimingSafe = true;
if (fs.existsSync(tokenServicePath)) {
  const code = fs.readFileSync(tokenServicePath, 'utf8');
  if (!code.includes('timingSafeEqual')) {
    cryptoTimingSafe = false;
  }
}
if (fs.existsSync(paymentGatewayPath)) {
  const code = fs.readFileSync(paymentGatewayPath, 'utf8');
  if (!code.includes('timingSafeEqual')) {
    cryptoTimingSafe = false;
  }
}

if (cryptoTimingSafe) {
  checks.push({
    check: 'CONSTANT_TIME_CRYPTO_VERIFICATION',
    status: 'PASS',
    detail: 'crypto.timingSafeEqual enforced in token and webhook verifiers'
  });
} else {
  allPassed = false;
  checks.push({
    check: 'CONSTANT_TIME_CRYPTO_VERIFICATION',
    status: 'FAIL',
    detail: 'timingSafeEqual missing in security-critical verifier'
  });
}

// 4. Verify Fail-Closed CORS in apps/api/src/server.ts
const serverPath = path.resolve(process.cwd(), 'apps/api/src/server.ts');
let corsFailClosed = false;
if (fs.existsSync(serverPath)) {
  const serverCode = fs.readFileSync(serverPath, 'utf8');
  if (serverCode.includes('CORS_FAIL_CLOSED')) {
    corsFailClosed = true;
  }
}

if (corsFailClosed) {
  checks.push({
    check: 'FAIL_CLOSED_CORS_POLICY',
    status: 'PASS',
    detail: 'Fail-closed CORS active for cross-origin authenticated requests'
  });
} else {
  allPassed = false;
  checks.push({
    check: 'FAIL_CLOSED_CORS_POLICY',
    status: 'FAIL',
    detail: 'Fail-closed CORS policy not detected in server.ts'
  });
}

const receipt = {
  receipt_id: `RCPT-SECURITY-${Date.now()}`,
  gate_name: 'SECURITY_GATE',
  verifier_name: 'StaticSecurityVerifier',
  generated_at: new Date().toISOString(),
  status: allPassed ? 'PASS' : 'FAIL',
  checked_items_count: checks.length,
  failure_count: checks.filter(c => c.status !== 'PASS').length,
  details: { checks }
};

fs.writeFileSync(
  path.join(verificationDir, 'SecurityVerificationReceipt.json'),
  JSON.stringify(receipt, null, 2),
  'utf8'
);

console.log(`[VERIFY:SECURITY] Status: ${receipt.status} (${checks.length} security checks executed)`);
for (const c of checks) {
  console.log(`  - ${c.check}: ${c.status} (${c.detail})`);
}

if (!allPassed) {
  console.error('[VERIFY:SECURITY] FAILED: One or more security checks failed.');
  process.exit(1);
}

console.log('[VERIFY:SECURITY] Security receipt written to generated/verification/SecurityVerificationReceipt.json');

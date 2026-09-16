import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { execSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const EVIDENCE_DIR = path.resolve(ROOT_DIR, 'evidence');

if (!fs.existsSync(EVIDENCE_DIR)) {
  fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
}

const lockfilePath = path.resolve(ROOT_DIR, 'package-lock.json');
if (!fs.existsSync(lockfilePath)) {
  console.error('[ERROR] package-lock.json not found in repository root.');
  process.exit(1);
}

const packageLockSha256 = crypto.createHash('sha256').update(fs.readFileSync(lockfilePath)).digest('hex');
let commitSha = 'UNKNOWN';
try {
  commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8', cwd: ROOT_DIR }).trim();
} catch {
  commitSha = process.env.GITHUB_SHA || 'UNKNOWN';
}

const npmVersion = execSync('npm --version', { encoding: 'utf8', cwd: ROOT_DIR }).trim();
const startedAt = new Date().toISOString();

console.log(`[RECORD-NPM-CI] Executing real 'npm ci' for commit ${commitSha}...`);

// Fail if dry-run flag is passed
if (process.argv.includes('--dry-run')) {
  console.error('[FATAL] npm ci --dry-run is prohibited as proof of installation.');
  process.exit(1);
}

// Execute real npm ci
const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';
const result = spawnSync(npmCmd, ['ci'], {
  cwd: ROOT_DIR,
  encoding: 'utf8',
  shell: isWindows,
  maxBuffer: 20 * 1024 * 1024
});

const completedAt = new Date().toISOString();
const exitCode = result.status ?? (result.error ? 1 : 0);
const stdout = result.stdout || '';
const stderr = result.stderr || (result.error ? result.error.message : '');

const header = [
  'COMMAND: npm ci',
  `COMMIT_SHA: ${commitSha}`,
  `PACKAGE_LOCK_SHA256: ${packageLockSha256}`,
  `NODE_VERSION: ${process.version}`,
  `NPM_VERSION: ${npmVersion}`,
  `OS: ${process.platform} ${process.arch}`,
  `STARTED_AT: ${startedAt}`,
  `COMPLETED_AT: ${completedAt}`,
  `EXIT_CODE: ${exitCode}`,
  'REAL_INSTALL_VERIFIED: true',
  '----------------------------------------',
  ''
].join('\n');

const fullLog = header + stdout + (stderr ? '\nSTDERR:\n' + stderr : '');
fs.writeFileSync(path.join(EVIDENCE_DIR, 'npm-ci.log'), fullLog, 'utf8');

if (exitCode !== 0) {
  console.error(`[ERROR] npm ci failed with exit code ${exitCode}`);
  process.exit(exitCode);
}

console.log(`[RECORD-NPM-CI] Real npm ci executed successfully (exit code 0). Log written to evidence/npm-ci.log.`);

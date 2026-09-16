import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

describe('AETF-500 Evidence Coherence & Negative Security Gate (Auditoria Completa & 12 Cenários Obrigatórios)', async () => {
  const getRoot = () => {
    const cwd = process.cwd();
    return cwd.endsWith('packages/runtime') || cwd.endsWith('packages\\runtime')
      ? path.resolve(cwd, '../..')
      : cwd;
  };
  const root = getRoot();
  const coherenceModulePath = path.resolve(root, 'scripts/verify-evidence-coherence.mjs');
  const pathValidatorModulePath = path.resolve(root, 'scripts/lib/evidencePathValidator.mjs');
  const tempDir = path.resolve(root, 'generated/tmp_test_evidence_coherence');

  const {
    verifyEvidenceCoherence,
    ERROR_CODES,
    EXPECTED_PRE_MERGE_CHECKS,
    REQUIRED_EVIDENCE_FILES
  } = await import(pathToFileURL(coherenceModulePath).href);

  const { validateEvidenceDir } = await import(pathToFileURL(pathValidatorModulePath).href);

  const testSha = 'a'.repeat(40);

  const mockApiResponse = JSON.stringify({
    url: 'https://api.github.com/repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/branches/master/protection',
    required_status_checks: {
      strict: true,
      contexts: [
        'Clean Checkout Local Verification (22.x)',
        'Deterministic Build, Typecheck, Test & Audit (22.x)'
      ]
    },
    required_pull_request_reviews: {
      dismiss_stale_reviews: true,
      require_code_owner_reviews: false,
      required_approving_review_count: 1
    },
    enforce_admins: { enabled: false },
    allow_force_pushes: { enabled: false },
    allow_deletions: { enabled: false }
  }, null, 2) + '\n';

  const setupMockEvidenceBundle = (dir: string, sha: string = testSha) => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir, { recursive: true });

    // Create required JSON files
    const jsonFiles: Record<string, any> = {
      'environment.json': {
        repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
        branch: 'master',
        commit_sha: sha,
        node: process.version
      },
      'cardinality-results.json': {
        repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
        branch: 'master',
        commit_sha: sha,
        live_tasks: { count: 0, isProvenZero: true },
        legal_contracts: { count: 0 },
        external_audits: { count: 0, isProvenZero: true }
      },
      'schema-validation-results.json': {
        repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
        branch: 'master',
        commit_sha: sha,
        results: []
      },
      'test-results.json': {
        repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
        branch: 'master',
        commit_sha: sha,
        total_results: 10,
        results: []
      },
      'test-summary.json': {
        repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
        branch: 'master',
        commit_sha: sha,
        command: 'npm test',
        exit_code: 0,
        total_tests: 10,
        passed_tests: 10,
        failed_tests: 0,
        skipped_tests: 0,
        cancelled_tests: 0,
        todo_tests: 0
      },
      'github-actions-receipt.json': {
        repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
        branch: 'master',
        commit_sha: sha,
        run_id: 123456789,
        run_url: 'https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/123456789',
        status: 'completed',
        conclusion: 'success',
        branch_protection_status: 'CONFIGURED',
        required_steps: ['Automated Test Suites'],
        skipped_required_steps: [],
        jobs: [
          {
            name: 'Clean Checkout Local Verification (22.x)',
            status: 'completed',
            conclusion: 'success',
            steps: [
              { name: 'Checkout Codebase', status: 'completed', conclusion: 'success' },
              { name: 'Setup Node.js 22.x', status: 'completed', conclusion: 'success' },
              { name: 'Deterministic Install (npm ci)', status: 'completed', conclusion: 'success' },
              { name: 'Production Dependency Audit', status: 'completed', conclusion: 'success' },
              { name: 'Local Full Verification', status: 'completed', conclusion: 'success' },
              { name: 'Ensure Clean Working Tree', status: 'completed', conclusion: 'success' }
            ]
          },
          {
            name: 'Deterministic Build, Typecheck, Test & Audit (22.x)',
            status: 'completed',
            conclusion: 'success',
            steps: [
              { name: 'Checkout Codebase', status: 'completed', conclusion: 'success' },
              { name: 'Setup Node.js 22.x', status: 'completed', conclusion: 'success' },
              { name: 'Deterministic Install (npm ci)', status: 'completed', conclusion: 'success' },
              { name: 'Production Dependency Audit', status: 'completed', conclusion: 'success' },
              { name: 'Monorepo Clean', status: 'completed', conclusion: 'success' },
              { name: 'Strict Typecheck', status: 'completed', conclusion: 'success' },
              { name: 'Build Monorepo Packages', status: 'completed', conclusion: 'success' },
              { name: 'Build Web Application', status: 'completed', conclusion: 'success' },
              { name: 'Next.js ESLint', status: 'completed', conclusion: 'success' },
              { name: 'Automated Test Suites', status: 'completed', conclusion: 'success' },
              { name: 'Ajv Manifest & Domain Cardinality Validation', status: 'completed', conclusion: 'success' },
              { name: 'Physical Hash Cryptographic Verification', status: 'completed', conclusion: 'success' },
              { name: 'Security & Behavioral Controls Verification', status: 'completed', conclusion: 'success' },
              { name: 'Transactional Payment & Webhook Verification', status: 'completed', conclusion: 'success' },
              { name: 'Multi-Tenant Authentication & Authorization Verification', status: 'completed', conclusion: 'success' },
              { name: 'Generate CI Forensic Evidence Bundle', status: 'completed', conclusion: 'success' },
              { name: 'Evidence Coherence & Same-SHA Gate', status: 'completed', conclusion: 'success' },
              { name: 'Upload Evidence Artifacts Bundle', status: 'completed', conclusion: 'success' },
              { name: 'Ensure Clean Working Tree', status: 'completed', conclusion: 'success' }
            ]
          }
        ]
      },
      'branch-protection.json': {
        repository: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES',
        branch: 'master',
        source: 'GITHUB_REST_API',
        api_endpoint: 'repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/branches/master/protection',
        queried_at: new Date().toISOString(),
        query_actor: 'GitHub Actions',
        source_sha: sha,
        http_status: 200,
        branch_protection_status: 'CONFIGURED',
        required_status_checks: [
          'Clean Checkout Local Verification (22.x)',
          'Deterministic Build, Typecheck, Test & Audit (22.x)'
        ],
        pull_request_required: true,
        required_approving_review_count: 1,
        dismiss_stale_reviews: true,
        require_code_owner_reviews: false,
        strict_up_to_date_required: true,
        enforce_admins: false,
        enforce_admins_justification: 'Solo repository maintainer bypass permitted for emergency maintenance; pre-merge checks enforced on pull requests.',
        allow_force_pushes: false,
        allow_deletions: false,
        response_sha256: crypto.createHash('sha256').update(mockApiResponse).digest('hex')
      }
    };

    for (const [name, content] of Object.entries(jsonFiles)) {
      fs.writeFileSync(path.join(dir, name), JSON.stringify(content, null, 2), 'utf8');
    }

    // Create required log and sha256 files
    const textFiles: Record<string, string> = {
      'canonical-source-hashes.sha256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  data/liveTasks.json\n',
      'file-hashes.sha256': 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  data/liveTasks.json\n',
      'branch-protection-api-response.json': mockApiResponse,
      'npm-ci.log': 'COMMAND: npm ci\nEXIT_CODE: 0\nREAL_INSTALL_VERIFIED: true\n',
      'npm-audit-production.log': 'found 0 vulnerabilities\n',
      'typecheck.log': 'typecheck success\n',
      'build-packages.log': 'build:packages success\n',
      'build-web.log': 'build:web success\n',
      'lint.log': 'lint success\n',
      'tests.log': 'tests success\n',
      'validate-manifests.log': 'manifests valid\n',
      'verify-hashes.log': 'hashes matched\n',
      'verify-security.log': 'security pass\n',
      'verify-payments.log': 'payments pass\n',
      'verify-auth.log': 'auth pass\n',
      'verify.log': 'verify gate exit code 0\n'
    };

    for (const [name, content] of Object.entries(textFiles)) {
      fs.writeFileSync(path.join(dir, name), content, 'utf8');
    }

    // Build evidence-files.sha256
    const entries = fs.readdirSync(dir)
      .filter(f => f !== 'evidence-files.sha256')
      .sort();

    const hashLines = entries.map(filename => {
      const buf = fs.readFileSync(path.join(dir, filename));
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      return `${hash}  ${filename}`;
    });

    fs.writeFileSync(path.join(dir, 'evidence-files.sha256'), hashLines.join('\n') + '\n', 'utf8');
  };

  const refreshEvidenceIndex = (dir: string) => {
    const entries = fs.readdirSync(dir)
      .filter(f => f !== 'evidence-files.sha256')
      .sort();
    const hashLines = entries.map(filename => {
      const buf = fs.readFileSync(path.join(dir, filename));
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      return `${hash}  ${filename}`;
    });
    fs.writeFileSync(path.join(dir, 'evidence-files.sha256'), hashLines.join('\n') + '\n', 'utf8');
  };

  const cleanup = () => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  };

  // 0. Positive Base Verification
  it('0. Base: Pacote de evidências 100% coerente passa com sucesso em modo remoto', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
      assert.strictEqual(res.valid, true);
      assert.strictEqual(res.commit_sha, testSha);
    } finally {
      cleanup();
    }
  });

  // 1. Recibo sem commit_sha
  it('1. Rejeita recibo sem commit_sha com EVIDENCE_COMMIT_SHA_MISSING', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const testSummaryPath = path.join(tempDir, 'test-summary.json');
      const data = JSON.parse(fs.readFileSync(testSummaryPath, 'utf8'));
      delete data.commit_sha;
      fs.writeFileSync(testSummaryPath, JSON.stringify(data), 'utf8');

      const hash = crypto.createHash('sha256').update(fs.readFileSync(testSummaryPath)).digest('hex');
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.writeFileSync(idxPath, fs.readFileSync(idxPath, 'utf8').replace(/[a-f0-9]{64}(\s+test-summary\.json)/, `${hash}$1`));

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_COMMIT_SHA_MISSING);
    } finally {
      cleanup();
    }
  });

  // 2. Recibo com SHA diferente
  it('2. Rejeita recibo com SHA divergente com EVIDENCE_COMMIT_SHA_MISMATCH', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const cardPath = path.join(tempDir, 'cardinality-results.json');
      const data = JSON.parse(fs.readFileSync(cardPath, 'utf8'));
      data.commit_sha = 'b'.repeat(40);
      fs.writeFileSync(cardPath, JSON.stringify(data), 'utf8');

      const hash = crypto.createHash('sha256').update(fs.readFileSync(cardPath)).digest('hex');
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.writeFileSync(idxPath, fs.readFileSync(idxPath, 'utf8').replace(/[a-f0-9]{64}(\s+cardinality-results\.json)/, `${hash}$1`));

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_COMMIT_SHA_MISMATCH);
    } finally {
      cleanup();
    }
  });

  // 3. Recibo com SHA inválido / malformado
  it('3. Rejeita SHA malformado ou truncado com EVIDENCE_COMMIT_SHA_MISMATCH', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const envPath = path.join(tempDir, 'environment.json');
      const data = JSON.parse(fs.readFileSync(envPath, 'utf8'));
      data.commit_sha = 'short_sha_123';
      fs.writeFileSync(envPath, JSON.stringify(data), 'utf8');

      const hash = crypto.createHash('sha256').update(fs.readFileSync(envPath)).digest('hex');
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.writeFileSync(idxPath, fs.readFileSync(idxPath, 'utf8').replace(/[a-f0-9]{64}(\s+environment\.json)/, `${hash}$1`));

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_COMMIT_SHA_MISMATCH);
    } finally {
      cleanup();
    }
  });

  // 4. CI ainda em execução
  it('4. Rejeita recibo de CI em execução com CI_RUN_NOT_COMPLETED', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const ciPath = path.join(tempDir, 'github-actions-receipt.json');
      const data = JSON.parse(fs.readFileSync(ciPath, 'utf8'));
      data.status = 'in_progress';
      fs.writeFileSync(ciPath, JSON.stringify(data), 'utf8');

      const hash = crypto.createHash('sha256').update(fs.readFileSync(ciPath)).digest('hex');
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.writeFileSync(idxPath, fs.readFileSync(idxPath, 'utf8').replace(/[a-f0-9]{64}(\s+github-actions-receipt\.json)/, `${hash}$1`));

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.CI_RUN_NOT_COMPLETED);
    } finally {
      cleanup();
    }
  });

  // 5. CI com conclusão failure
  it('5. Rejeita recibo de CI falhado com CI_RUN_NOT_SUCCESSFUL', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const ciPath = path.join(tempDir, 'github-actions-receipt.json');
      const data = JSON.parse(fs.readFileSync(ciPath, 'utf8'));
      data.conclusion = 'failure';
      fs.writeFileSync(ciPath, JSON.stringify(data), 'utf8');

      const hash = crypto.createHash('sha256').update(fs.readFileSync(ciPath)).digest('hex');
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.writeFileSync(idxPath, fs.readFileSync(idxPath, 'utf8').replace(/[a-f0-9]{64}(\s+github-actions-receipt\.json)/, `${hash}$1`));

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.CI_RUN_NOT_SUCCESSFUL);
    } finally {
      cleanup();
    }
  });

  // 6. Ficheiro ausente
  it('6. Rejeita pacote com ficheiro de evidência ausente com EVIDENCE_FILE_MISSING', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      fs.unlinkSync(path.join(tempDir, 'tests.log'));
      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_FILE_MISSING);
    } finally {
      cleanup();
    }
  });

  // 7. JSON inválido
  it('7. Rejeita ficheiro com JSON inválido com EVIDENCE_INVALID_JSON', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const schemaPath = path.join(tempDir, 'schema-validation-results.json');
      fs.writeFileSync(schemaPath, '{"broken_json": true, invalid');

      const hash = crypto.createHash('sha256').update(fs.readFileSync(schemaPath)).digest('hex');
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.writeFileSync(idxPath, fs.readFileSync(idxPath, 'utf8').replace(/[a-f0-9]{64}(\s+schema-validation-results\.json)/, `${hash}$1`));

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_INVALID_JSON);
    } finally {
      cleanup();
    }
  });

  // 8. Hash divergente
  it('8. Rejeita hash divergente com EVIDENCE_HASH_MISMATCH', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      const content = fs.readFileSync(idxPath, 'utf8');
      const fakeHash = 'f'.repeat(64);
      fs.writeFileSync(idxPath, content.replace(/[a-f0-9]{64}(\s+lint\.log)/, `${fakeHash}$1`));

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_HASH_MISMATCH);
    } finally {
      cleanup();
    }
  });

  // 9. Alteração de 1 byte
  it('9. Alteração de 1 único byte invalida imediatamente a prova com EVIDENCE_HASH_MISMATCH', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const verifyLogPath = path.join(tempDir, 'verify.log');
      fs.appendFileSync(verifyLogPath, '!');

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_HASH_MISMATCH);
    } finally {
      cleanup();
    }
  });

  // 10. Entrada duplicada no índice
  it('10. Rejeita entrada duplicada no índice com EVIDENCE_INDEX_INVALID', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      const firstLine = fs.readFileSync(idxPath, 'utf8').split('\n')[0];
      fs.appendFileSync(idxPath, firstLine + '\n');

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_INDEX_INVALID);
    } finally {
      cleanup();
    }
  });

  // 11. Path traversal no índice
  it('11. Rejeita tentativa de path traversal no índice com EVIDENCE_INDEX_INVALID', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.appendFileSync(idxPath, `${'0'.repeat(64)}  ../package.json\n`);

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_INDEX_INVALID);
    } finally {
      cleanup();
    }
  });

  // 12. Auto-referência no índice
  it('12. Rejeita auto-referência de evidence-files.sha256 no próprio índice', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.appendFileSync(idxPath, `${'0'.repeat(64)}  evidence-files.sha256\n`);

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_INDEX_INVALID);
    } finally {
      cleanup();
    }
  });

  // 13. Ficheiro estranho não catalogado
  it('13. Rejeita ficheiro estranho não catalogado no índice com EVIDENCE_INDEX_INVALID', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      fs.writeFileSync(path.join(tempDir, 'unindexed_rogue_file.txt'), 'rogue content');

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_INDEX_INVALID);
    } finally {
      cleanup();
    }
  });

  // 14. Recibo de CI ausente em modo remoto
  it('14. Rejeita recibo remoto sem run_id com CI_RECEIPT_MISSING', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const ciPath = path.join(tempDir, 'github-actions-receipt.json');
      const data = JSON.parse(fs.readFileSync(ciPath, 'utf8'));
      data.run_id = null;
      fs.writeFileSync(ciPath, JSON.stringify(data), 'utf8');

      const hash = crypto.createHash('sha256').update(fs.readFileSync(ciPath)).digest('hex');
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.writeFileSync(idxPath, fs.readFileSync(idxPath, 'utf8').replace(/[a-f0-9]{64}(\s+github-actions-receipt\.json)/, `${hash}$1`));

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.CI_RECEIPT_MISSING);
    } finally {
      cleanup();
    }
  });

  // 15. Rejeição de npm ci --dry-run
  it('15. Rejeita tentativa de usar npm ci --dry-run como prova de instalação', () => {
    const recordScript = path.resolve(root, 'scripts/record-npm-ci.mjs');
    const { spawnSync } = require('child_process');
    const child = spawnSync(process.execPath, [recordScript, '--dry-run'], { encoding: 'utf8' });
    assert.notStrictEqual(child.status, 0, 'Must exit with non-zero code on --dry-run');
    assert.ok(child.stderr.includes('prohibited') || child.stderr.includes('FATAL'));
  });

  // 16. Contradição de status de branch protection
  it('16. Rejeita divergência entre github-actions-receipt e branch-protection com BRANCH_PROTECTION_STATUS_MISMATCH', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const bpPath = path.join(tempDir, 'branch-protection.json');
      const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
      bpData.branch_protection_status = 'NOT_CONFIGURED';
      bpData.http_status = 404;
      fs.writeFileSync(bpPath, JSON.stringify(bpData), 'utf8');

      const hash = crypto.createHash('sha256').update(fs.readFileSync(bpPath)).digest('hex');
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.writeFileSync(idxPath, fs.readFileSync(idxPath, 'utf8').replace(/[a-f0-9]{64}(\s+branch-protection\.json)/, `${hash}$1`));

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_STATUS_MISMATCH);
    } finally {
      cleanup();
    }
  });

  // =========================================================================
  // OS 12 TESTES NEGATIVOS OBRIGATÓRIOS DO PROMPT DE CORRECÇÃO FINAL
  // =========================================================================

  // N1. Protecção não está configurada
  it('N1. Rejeita em modo remoto quando a protecção não está configurada (NOT_CONFIGURED)', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const bpPath = path.join(tempDir, 'branch-protection.json');
      const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
      bpData.branch_protection_status = 'NOT_CONFIGURED';
      bpData.http_status = 404;
      fs.writeFileSync(bpPath, JSON.stringify(bpData), 'utf8');

      const ciReceiptPath = path.join(tempDir, 'github-actions-receipt.json');
      const ciData = JSON.parse(fs.readFileSync(ciReceiptPath, 'utf8'));
      ciData.branch_protection_status = 'NOT_CONFIGURED';
      fs.writeFileSync(ciReceiptPath, JSON.stringify(ciData), 'utf8');

      // Re-hash files
      const bpHash = crypto.createHash('sha256').update(fs.readFileSync(bpPath)).digest('hex');
      const ciHash = crypto.createHash('sha256').update(fs.readFileSync(ciReceiptPath)).digest('hex');
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      let idxContent = fs.readFileSync(idxPath, 'utf8')
        .replace(/[a-f0-9]{64}(\s+branch-protection\.json)/, `${bpHash}$1`)
        .replace(/[a-f0-9]{64}(\s+github-actions-receipt\.json)/, `${ciHash}$1`);
      fs.writeFileSync(idxPath, idxContent);

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_UNVERIFIED);
    } finally {
      cleanup();
    }
  });

  // N2. API devolve 401, 403, 404, 5xx ou fica indisponível
  it('N2. Rejeita em modo remoto quando API devolve 403 (API_FORBIDDEN) ou 500 (API_UNAVAILABLE)', () => {
    for (const status of ['API_FORBIDDEN', 'API_UNAUTHORIZED', 'API_UNAVAILABLE']) {
      try {
        setupMockEvidenceBundle(tempDir);
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        bpData.branch_protection_status = status;
        bpData.http_status = status === 'API_FORBIDDEN' ? 403 : (status === 'API_UNAUTHORIZED' ? 401 : 500);
        fs.writeFileSync(bpPath, JSON.stringify(bpData), 'utf8');

        const ciReceiptPath = path.join(tempDir, 'github-actions-receipt.json');
        const ciData = JSON.parse(fs.readFileSync(ciReceiptPath, 'utf8'));
        ciData.branch_protection_status = status;
        fs.writeFileSync(ciReceiptPath, JSON.stringify(ciData), 'utf8');

        const bpHash = crypto.createHash('sha256').update(fs.readFileSync(bpPath)).digest('hex');
        const ciHash = crypto.createHash('sha256').update(fs.readFileSync(ciReceiptPath)).digest('hex');
        const idxPath = path.join(tempDir, 'evidence-files.sha256');
        let idxContent = fs.readFileSync(idxPath, 'utf8')
          .replace(/[a-f0-9]{64}(\s+branch-protection\.json)/, `${bpHash}$1`)
          .replace(/[a-f0-9]{64}(\s+github-actions-receipt\.json)/, `${ciHash}$1`);
        fs.writeFileSync(idxPath, idxContent);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_UNVERIFIED);
      } finally {
        cleanup();
      }
    }
  });

  // N3. Estado declarado é CONFIGURED, mas o HTTP não é 200
  it('N3. Rejeita estado declarado CONFIGURED com http_status diferente de 200', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const bpPath = path.join(tempDir, 'branch-protection.json');
      const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
      bpData.http_status = 403;
      bpData.branch_protection_status = 'CONFIGURED';
      fs.writeFileSync(bpPath, JSON.stringify(bpData), 'utf8');

      const hash = crypto.createHash('sha256').update(fs.readFileSync(bpPath)).digest('hex');
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.writeFileSync(idxPath, fs.readFileSync(idxPath, 'utf8').replace(/[a-f0-9]{64}(\s+branch-protection\.json)/, `${hash}$1`));

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_STATUS_MISMATCH);
    } finally {
      cleanup();
    }
  });

  // N4. Hash da resposta da API diverge
  it('N4. Rejeita divergência entre response_sha256 e bytes de branch-protection-api-response.json', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const bpApiResPath = path.join(tempDir, 'branch-protection-api-response.json');
      fs.appendFileSync(bpApiResPath, ' '); // 1 space mutation

      const hash = crypto.createHash('sha256').update(fs.readFileSync(bpApiResPath)).digest('hex');
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.writeFileSync(idxPath, fs.readFileSync(idxPath, 'utf8').replace(/[a-f0-9]{64}(\s+branch-protection-api-response\.json)/, `${hash}$1`));

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_HASH_MISMATCH);
    } finally {
      cleanup();
    }
  });

  // N5. Check pré-merge obrigatório está ausente
  it('N5. Rejeita quando um check pré-merge obrigatório está ausente na resposta da API', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const bpApiResPath = path.join(tempDir, 'branch-protection-api-response.json');
      const apiData = JSON.parse(mockApiResponse);
      // Remove 'Clean Checkout Local Verification (22.x)'
      apiData.required_status_checks.contexts = ['Deterministic Build, Typecheck, Test & Audit (22.x)'];
      const mutatedRaw = JSON.stringify(apiData, null, 2) + '\n';
      fs.writeFileSync(bpApiResPath, mutatedRaw, 'utf8');

      // Update response_sha256 in branch-protection.json
      const newResponseSha = crypto.createHash('sha256').update(mutatedRaw).digest('hex');
      const bpPath = path.join(tempDir, 'branch-protection.json');
      const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
      bpData.response_sha256 = newResponseSha;
      bpData.required_status_checks = apiData.required_status_checks.contexts;
      fs.writeFileSync(bpPath, JSON.stringify(bpData), 'utf8');

      // Re-hash index
      const bpHash = crypto.createHash('sha256').update(fs.readFileSync(bpPath)).digest('hex');
      const apiHash = newResponseSha;
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      let idxContent = fs.readFileSync(idxPath, 'utf8')
        .replace(/[a-f0-9]{64}(\s+branch-protection\.json)/, `${bpHash}$1`)
        .replace(/[a-f0-9]{64}(\s+branch-protection-api-response\.json)/, `${apiHash}$1`);
      fs.writeFileSync(idxPath, idxContent);

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_CHECK_MISSING);
    } finally {
      cleanup();
    }
  });

  // N6. Nome de um check obrigatório diverge
  it('N6. Rejeita quando o nome de um check obrigatório diverge da especificação exata', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const bpApiResPath = path.join(tempDir, 'branch-protection-api-response.json');
      const apiData = JSON.parse(mockApiResponse);
      apiData.required_status_checks.contexts = [
        'Clean Checkout Local Verification (22.x)',
        'Deterministic Build, Typecheck, Test & Audit (divergent_name)'
      ];
      const mutatedRaw = JSON.stringify(apiData, null, 2) + '\n';
      fs.writeFileSync(bpApiResPath, mutatedRaw, 'utf8');

      const newResponseSha = crypto.createHash('sha256').update(mutatedRaw).digest('hex');
      const bpPath = path.join(tempDir, 'branch-protection.json');
      const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
      bpData.response_sha256 = newResponseSha;
      bpData.required_status_checks = apiData.required_status_checks.contexts;
      fs.writeFileSync(bpPath, JSON.stringify(bpData), 'utf8');

      const bpHash = crypto.createHash('sha256').update(fs.readFileSync(bpPath)).digest('hex');
      const apiHash = newResponseSha;
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      let idxContent = fs.readFileSync(idxPath, 'utf8')
        .replace(/[a-f0-9]{64}(\s+branch-protection\.json)/, `${bpHash}$1`)
        .replace(/[a-f0-9]{64}(\s+branch-protection-api-response\.json)/, `${apiHash}$1`);
      fs.writeFileSync(idxPath, idxContent);

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_CHECK_MISSING);
    } finally {
      cleanup();
    }
  });

  // N7. Check obrigatório aparece como ignorado
  it('N7. Rejeita execução com steps obrigatórios marcados como skipped', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const ciPath = path.join(tempDir, 'github-actions-receipt.json');
      const data = JSON.parse(fs.readFileSync(ciPath, 'utf8'));
      data.skipped_required_steps = ['Clean Checkout Local Verification'];
      fs.writeFileSync(ciPath, JSON.stringify(data), 'utf8');

      const hash = crypto.createHash('sha256').update(fs.readFileSync(ciPath)).digest('hex');
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.writeFileSync(idxPath, fs.readFileSync(idxPath, 'utf8').replace(/[a-f0-9]{64}(\s+github-actions-receipt\.json)/, `${hash}$1`));

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.REQUIRED_STEP_SKIPPED);
    } finally {
      cleanup();
    }
  });

  // N8. Resposta pertence a outro repositório ou branch
  it('N8. Rejeita resposta de branch protection pertencente a outro repositório ou branch', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const bpApiResPath = path.join(tempDir, 'branch-protection-api-response.json');
      const apiData = JSON.parse(mockApiResponse);
      apiData.url = 'https://api.github.com/repos/adversary-org/other-repo/branches/master/protection';
      const mutatedRaw = JSON.stringify(apiData, null, 2) + '\n';
      fs.writeFileSync(bpApiResPath, mutatedRaw, 'utf8');

      const newResponseSha = crypto.createHash('sha256').update(mutatedRaw).digest('hex');
      const bpPath = path.join(tempDir, 'branch-protection.json');
      const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
      bpData.response_sha256 = newResponseSha;
      fs.writeFileSync(bpPath, JSON.stringify(bpData), 'utf8');

      const bpHash = crypto.createHash('sha256').update(fs.readFileSync(bpPath)).digest('hex');
      const apiHash = newResponseSha;
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      let idxContent = fs.readFileSync(idxPath, 'utf8')
        .replace(/[a-f0-9]{64}(\s+branch-protection\.json)/, `${bpHash}$1`)
        .replace(/[a-f0-9]{64}(\s+branch-protection-api-response\.json)/, `${apiHash}$1`);
      fs.writeFileSync(idxPath, idxContent);

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_REPOSITORY_MISMATCH);
    } finally {
      cleanup();
    }
  });

  // N9. SHA das evidências diverge do SHA da execução
  it('N9. Rejeita quando o SHA das evidências diverge do SHA da execução remota', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const ciPath = path.join(tempDir, 'github-actions-receipt.json');
      const data = JSON.parse(fs.readFileSync(ciPath, 'utf8'));
      data.commit_sha = 'e'.repeat(40); // divergent SHA
      fs.writeFileSync(ciPath, JSON.stringify(data), 'utf8');

      const hash = crypto.createHash('sha256').update(fs.readFileSync(ciPath)).digest('hex');
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      fs.writeFileSync(idxPath, fs.readFileSync(idxPath, 'utf8').replace(/[a-f0-9]{64}(\s+github-actions-receipt\.json)/, `${hash}$1`));

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.CI_RUN_SHA_MISMATCH);
    } finally {
      cleanup();
    }
  });

  // N10. Directório de saída resolve para fora do repositório
  it('N10. Rejeita directório de saída que resolve para fora do repositório (path traversal)', () => {
    assert.throws(
      () => validateEvidenceDir('../../outside_workspace', root),
      (err: any) => err.code === 'EVIDENCE_PATH_INVALID' || err.message.includes('workspace')
    );
    assert.throws(
      () => validateEvidenceDir('.', root),
      (err: any) => err.code === 'EVIDENCE_PATH_INVALID' || err.message.includes('repository root')
    );
  });

  // N11. Pasta irmã que partilha apenas o prefixo da raiz do repositório
  it('N11. Rejeita pasta irmã que partilha apenas o prefixo da raiz do repositório', () => {
    const siblingPath = root + '-sibling';
    assert.throws(
      () => validateEvidenceDir(siblingPath, root),
      (err: any) => err.code === 'EVIDENCE_PATH_INVALID' || err.message.includes('workspace')
    );
  });

  // N12. Relatório / gate tenta promover CI_ENFORCED sem prova física suficiente
  it('N12. Rejeita promoção de CI_ENFORCED quando branch protection não está configurada ou rules são insuficientes', () => {
    try {
      setupMockEvidenceBundle(tempDir);
      const bpApiResPath = path.join(tempDir, 'branch-protection-api-response.json');
      const apiData = JSON.parse(mockApiResponse);
      // Disable pull request requirement
      delete apiData.required_pull_request_reviews;
      const mutatedRaw = JSON.stringify(apiData, null, 2) + '\n';
      fs.writeFileSync(bpApiResPath, mutatedRaw, 'utf8');

      const newResponseSha = crypto.createHash('sha256').update(mutatedRaw).digest('hex');
      const bpPath = path.join(tempDir, 'branch-protection.json');
      const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
      bpData.response_sha256 = newResponseSha;
      bpData.pull_request_required = false;
      bpData.required_approving_review_count = 0;
      bpData.dismiss_stale_reviews = false;
      bpData.require_code_owner_reviews = false;
      fs.writeFileSync(bpPath, JSON.stringify(bpData), 'utf8');

      const bpHash = crypto.createHash('sha256').update(fs.readFileSync(bpPath)).digest('hex');
      const apiHash = newResponseSha;
      const idxPath = path.join(tempDir, 'evidence-files.sha256');
      let idxContent = fs.readFileSync(idxPath, 'utf8')
        .replace(/[a-f0-9]{64}(\s+branch-protection\.json)/, `${bpHash}$1`)
        .replace(/[a-f0-9]{64}(\s+branch-protection-api-response\.json)/, `${apiHash}$1`);
      fs.writeFileSync(idxPath, idxContent);

      const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha });
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_RULES_INSUFFICIENT);
    } finally {
      cleanup();
    }
  });

  // --------------------------------------------------------------------------
  // 17 TESTES NEGATIVOS OBRIGATÓRIOS (Micro-Patch Fecho Forense CI e Branch Protection)
  // --------------------------------------------------------------------------
  describe('Micro-Patch Fecho Forense CI: 17 Testes Negativos Obrigatórios', () => {
    // 1. response_sha256 está ausente
    it('1. Rejeita quando response_sha256 está ausente em branch-protection.json', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const data = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        delete data.response_sha256;
        fs.writeFileSync(bpPath, JSON.stringify(data, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_RESPONSE_SHA_MISSING);
      } finally {
        cleanup();
      }
    });

    // 2. response_sha256 está vazio
    it('2. Rejeita quando response_sha256 está vazio em branch-protection.json', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const data = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        data.response_sha256 = '';
        fs.writeFileSync(bpPath, JSON.stringify(data, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_RESPONSE_SHA_INVALID);
      } finally {
        cleanup();
      }
    });

    // 3. response_sha256 está malformado
    it('3. Rejeita quando response_sha256 está malformado (não tem 64 caracteres hex)', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const data = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        data.response_sha256 = 'not_a_valid_sha256_hash';
        fs.writeFileSync(bpPath, JSON.stringify(data, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_RESPONSE_SHA_INVALID);
      } finally {
        cleanup();
      }
    });

    // 4. o hash não corresponde à resposta física
    it('4. Rejeita quando response_sha256 não corresponde aos bytes físicos de branch-protection-api-response.json', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const apiPath = path.join(tempDir, 'branch-protection-api-response.json');
        fs.writeFileSync(apiPath, '{"mutated": true}\n', 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_HASH_MISMATCH);
      } finally {
        cleanup();
      }
    });

    // 5. repository está ausente ou divergente
    it('5. Rejeita quando repository está ausente ou divergente em branch-protection.json', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const data = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        data.repository = 'evil-org/fake-repo';
        fs.writeFileSync(bpPath, JSON.stringify(data, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_REPOSITORY_MISMATCH);
      } finally {
        cleanup();
      }
    });

    // 6. branch está ausente ou divergente
    it('6. Rejeita quando branch está ausente ou divergente em branch-protection.json', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const data = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        data.branch = 'feature/unprotected';
        fs.writeFileSync(bpPath, JSON.stringify(data, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID);
      } finally {
        cleanup();
      }
    });

    // 7. api_endpoint está ausente ou divergente
    it('7. Rejeita quando api_endpoint está ausente ou divergente em branch-protection.json', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const data = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        data.api_endpoint = 'repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/branches/main/protection';
        fs.writeFileSync(bpPath, JSON.stringify(data, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID);
      } finally {
        cleanup();
      }
    });

    // 8. source_sha diverge do SHA auditado
    it('8. Rejeita quando source_sha diverge do SHA auditado em branch-protection.json', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const data = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        data.source_sha = 'f'.repeat(40);
        fs.writeFileSync(bpPath, JSON.stringify(data, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.EVIDENCE_COMMIT_SHA_MISMATCH);
      } finally {
        cleanup();
      }
    });

    // 9. um campo resumido diverge da resposta bruta
    it('9. Rejeita com BRANCH_PROTECTION_RECEIPT_MISMATCH quando um campo resumido diverge da resposta bruta', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const data = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        // Diverge strict_up_to_date_required in receipt compared to API raw response (which has strict: true)
        data.strict_up_to_date_required = false;
        fs.writeFileSync(bpPath, JSON.stringify(data, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_RECEIPT_MISMATCH);
      } finally {
        cleanup();
      }
    });

    // 10. o número de aprovações é zero
    it('10. Rejeita quando o número de aprovações obrigatórias é zero', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const apiPath = path.join(tempDir, 'branch-protection-api-response.json');
        const apiData = JSON.parse(mockApiResponse);
        apiData.required_pull_request_reviews.required_approving_review_count = 0;
        const apiRaw = JSON.stringify(apiData, null, 2) + '\n';
        fs.writeFileSync(apiPath, apiRaw, 'utf8');

        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        bpData.required_approving_review_count = 0;
        bpData.response_sha256 = crypto.createHash('sha256').update(apiRaw).digest('hex');
        fs.writeFileSync(bpPath, JSON.stringify(bpData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_RULES_INSUFFICIENT);
      } finally {
        cleanup();
      }
    });

    // 11. o modo estrito exigido está desactivado
    it('11. Rejeita quando o modo estrito exigido está desactivado', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const apiPath = path.join(tempDir, 'branch-protection-api-response.json');
        const apiData = JSON.parse(mockApiResponse);
        apiData.required_status_checks.strict = false;
        const apiRaw = JSON.stringify(apiData, null, 2) + '\n';
        fs.writeFileSync(apiPath, apiRaw, 'utf8');

        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        bpData.strict_up_to_date_required = false;
        bpData.response_sha256 = crypto.createHash('sha256').update(apiRaw).digest('hex');
        fs.writeFileSync(bpPath, JSON.stringify(bpData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_RULES_INSUFFICIENT);
      } finally {
        cleanup();
      }
    });

    // 12. um job obrigatório está ausente
    it('12. Rejeita com REQUIRED_JOB_MISSING quando um job obrigatório está ausente do recibo', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        rcData.jobs = rcData.jobs.filter((j: any) => !j.name.includes('Clean Checkout'));
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.REQUIRED_JOB_MISSING);
      } finally {
        cleanup();
      }
    });

    // 13. um passo obrigatório está ausente
    it('13. Rejeita com REQUIRED_STEP_MISSING quando um passo obrigatório está ausente de um job', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        const job = rcData.jobs.find((j: any) => j.name.includes('Clean Checkout'));
        job.steps = job.steps.filter((s: any) => s.name !== 'Deterministic Install (npm ci)');
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.REQUIRED_STEP_MISSING);
      } finally {
        cleanup();
      }
    });

    // 14. um passo obrigatório está skipped
    it('14. Rejeita com REQUIRED_STEP_SKIPPED quando um passo obrigatório foi ignorado (skipped)', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        const job = rcData.jobs.find((j: any) => j.name.includes('Clean Checkout'));
        const step = job.steps.find((s: any) => s.name === 'Local Full Verification');
        step.conclusion = 'skipped';
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.REQUIRED_STEP_SKIPPED);
      } finally {
        cleanup();
      }
    });

    // 15. um passo obrigatório está cancelled ou failure
    it('15. Rejeita com REQUIRED_STEP_FAILED quando um passo obrigatório falhou ou foi cancelado', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        const job = rcData.jobs.find((j: any) => j.name.includes('Deterministic Build'));
        const step = job.steps.find((s: any) => s.name === 'Automated Test Suites');
        step.conclusion = 'failure';
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({ evidenceDir: tempDir, targetSha: testSha, enforceRemoteCi: true });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.REQUIRED_STEP_FAILED);
      } finally {
        cleanup();
      }
    });

    // 16. enforce_admins é falso, mas o relatório tenta atribuir classificação sem ressalvas
    it('16. Rejeita com ADMIN_ENFORCEMENT_MISMATCH quando enforce_admins é falso e se requer PATCH_VERIFIED_AND_CI_ENFORCED', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          enforceRemoteCi: true,
          targetClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.ADMIN_ENFORCEMENT_MISMATCH);
      } finally {
        cleanup();
      }
    });

    // 17. existe uma ligação local file:/// no relatório final
    it('17. Rejeita com LOCAL_FILE_LINK_DETECTED quando existe ligação file:/// no relatório', () => {
      const dummyReportPath = path.resolve(root, 'generated/report_with_local_link.md');
      try {
        setupMockEvidenceBundle(tempDir);
        fs.mkdirSync(path.dirname(dummyReportPath), { recursive: true });
        fs.writeFileSync(dummyReportPath, '# Relatório\n\nLink: [log](file:///c:/Users/Victorino/Desktop/file.log)\n', 'utf8');

        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          enforceRemoteCi: true,
          reportPath: dummyReportPath
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.LOCAL_FILE_LINK_DETECTED);
      } finally {
        if (fs.existsSync(dummyReportPath)) {
          fs.unlinkSync(dummyReportPath);
        }
        cleanup();
      }
    });
  });
});

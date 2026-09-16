import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
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
  const bundleModulePath = path.resolve(root, 'scripts/verify-evidence-bundle.mjs');
  const pathValidatorModulePath = path.resolve(root, 'scripts/lib/evidencePathValidator.mjs');
  const tempDir = path.resolve(root, 'generated/tmp_test_evidence_coherence');

  const {
    verifyEvidenceCoherence,
    ERROR_CODES,
    EXPECTED_PRE_MERGE_CHECKS,
    REQUIRED_EVIDENCE_FILES
  } = await import(pathToFileURL(coherenceModulePath).href);

  const { verifyEvidenceBundle } = await import(pathToFileURL(bundleModulePath).href);
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
        primary_run_id: 123456789,
        remote_verification_run_id: 987654321,
        remote_run_attempt: 1,
        remote_started_at: new Date(Date.now() - 50000).toISOString(),
        run_url: 'https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/123456789',
        status: 'completed',
        conclusion: 'success',
        started_at: new Date(Date.now() - 300000).toISOString(),
        completed_at: new Date(Date.now() - 60000).toISOString(),
        remote_synced_at: new Date().toISOString(),
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
        query_run_id: 987654321,
        primary_run_id: 123456789,
        remote_verification_run_id: 987654321,
        remote_run_attempt: 1,
        query_workflow: 'Evidence Remote Verification',
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
      const res = verifyEvidenceCoherence({
        evidenceDir: tempDir,
        targetSha: testSha,
        enforceRemoteCi: true,
        targetClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
        reportPath: 'AETF500_Relatorio_Correccao_Final_Evidencias_CI.md',
        expectedQueryActor: 'GitHub Actions'
      });
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

  describe('Patch Final de Ligação dos Gates e Preservação da Evidência Remota: 18 Testes Obrigatórios', () => {
    const validReportRelPath = 'generated/test_valid_report_18.md';
    const validReportAbsPath = path.resolve(root, validReportRelPath);

    const ensureValidReport = () => {
      fs.mkdirSync(path.dirname(validReportAbsPath), { recursive: true });
      fs.writeFileSync(validReportAbsPath, '# Relatório Válido de Teste\nSem links locais.\n', 'utf8');
    };

    const cleanupReport = () => {
      if (fs.existsSync(validReportAbsPath)) {
        fs.unlinkSync(validReportAbsPath);
      }
    };

    // 1. CLI aceita --classification válido
    it('1. CLI aceita --classification válido', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const res = spawnSync(process.execPath, [
          coherenceModulePath,
          '--dir', tempDir,
          '--sha', testSha,
          '--classification', 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        ], { encoding: 'utf8', cwd: root });
        assert.strictEqual(res.status, 0, `CLI failed with: ${res.stderr || res.stdout}`);
        assert.match(res.stdout, /Classification verified: PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 2. CLI aceita --report válido
    it('2. CLI aceita --report válido', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const res = spawnSync(process.execPath, [
          coherenceModulePath,
          '--dir', tempDir,
          '--sha', testSha,
          '--report', validReportRelPath
        ], { encoding: 'utf8', cwd: root });
        assert.strictEqual(res.status, 0, `CLI failed with: ${res.stderr || res.stdout}`);
        assert.match(res.stdout, /Report verified/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 3. CLI falha quando --classification não tem valor
    it('3. CLI falha quando --classification não tem valor', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const res = spawnSync(process.execPath, [
          coherenceModulePath,
          '--dir', tempDir,
          '--sha', testSha,
          '--classification'
        ], { encoding: 'utf8', cwd: root });
        assert.strictEqual(res.status, 1);
        assert.match(res.stderr + res.stdout, /CLASSIFICATION_INVALID/);
      } finally {
        cleanup();
      }
    });

    // 4. CLI falha quando --report não tem valor
    it('4. CLI falha quando --report não tem valor', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const res = spawnSync(process.execPath, [
          coherenceModulePath,
          '--dir', tempDir,
          '--sha', testSha,
          '--report'
        ], { encoding: 'utf8', cwd: root });
        assert.strictEqual(res.status, 1);
        assert.match(res.stderr + res.stdout, /REPORT_PATH_INVALID/);
      } finally {
        cleanup();
      }
    });

    // 5. CLI falha com classificação desconhecida
    it('5. CLI falha com classificação desconhecida', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const res = spawnSync(process.execPath, [
          coherenceModulePath,
          '--dir', tempDir,
          '--sha', testSha,
          '--classification', 'CLASSIFICACAO_TOTALMENTE_DESCONHECIDA'
        ], { encoding: 'utf8', cwd: root });
        assert.strictEqual(res.status, 1);
        assert.match(res.stderr + res.stdout, /CLASSIFICATION_INVALID/);
      } finally {
        cleanup();
      }
    });

    // 6. modo remoto falha sem --classification
    it('6. Modo remoto falha sem --classification', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          enforceRemoteCi: true,
          reportPath: validReportRelPath
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.CLASSIFICATION_MISSING);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 7. modo remoto falha sem --report
    it('7. Modo remoto falha sem --report', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          enforceRemoteCi: true,
          targetClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.REPORT_FILE_MISSING);
      } finally {
        cleanup();
      }
    });

    // 8. classificação sem ressalvas falha com enforce_admins: false
    it('8. Classificação sem ressalvas falha com enforce_admins: false', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          enforceRemoteCi: true,
          targetClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED',
          reportPath: validReportRelPath
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.ADMIN_ENFORCEMENT_MISMATCH);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 9. classificação limitada passa com enforce_admins: false, se todos os outros gates passarem
    it('9. Classificação limitada passa com enforce_admins: false, se todos os outros gates passarem', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          enforceRemoteCi: true,
          targetClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          reportPath: validReportRelPath,
          expectedQueryActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, true, `Verification failed with ${res.code}: ${res.error}`);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 10. relatório com file:/// falha através da CLI real
    it('10. Relatório com file:/// falha através da CLI real', () => {
      const dummyWithLinkRel = 'generated/test_report_with_local_link.md';
      const dummyWithLinkAbs = path.resolve(root, dummyWithLinkRel);
      try {
        setupMockEvidenceBundle(tempDir);
        fs.mkdirSync(path.dirname(dummyWithLinkAbs), { recursive: true });
        fs.writeFileSync(dummyWithLinkAbs, '# Relatório\nLink: [log](file:///C:/Users/file.log)\n', 'utf8');

        const res = spawnSync(process.execPath, [
          coherenceModulePath,
          '--dir', tempDir,
          '--sha', testSha,
          '--report', dummyWithLinkRel
        ], { encoding: 'utf8', cwd: root });
        assert.strictEqual(res.status, 1);
        assert.match(res.stderr + res.stdout, /LOCAL_FILE_LINK_DETECTED/);
      } finally {
        if (fs.existsSync(dummyWithLinkAbs)) {
          fs.unlinkSync(dummyWithLinkAbs);
        }
        cleanup();
      }
    });

    // 11. relatório ausente falha através da CLI real
    it('11. Relatório ausente falha através da CLI real', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const res = spawnSync(process.execPath, [
          coherenceModulePath,
          '--dir', tempDir,
          '--sha', testSha,
          '--report', 'generated/non_existent_report_xyz_123.md'
        ], { encoding: 'utf8', cwd: root });
        assert.strictEqual(res.status, 1);
        assert.match(res.stderr + res.stdout, /REPORT_FILE_MISSING/);
      } finally {
        cleanup();
      }
    });

    // 12. caminho de relatório fora do repositório falha
    it('12. Caminho de relatório fora do repositório falha', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          reportPath: '../outside_workspace_report.md'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.REPORT_PATH_INVALID);
      } finally {
        cleanup();
      }
    });

    // 13. queried_at anterior à execução falha
    it('13. queried_at anterior à execução falha', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        // Set queried_at to 2 hours prior to execution started_at
        bpData.queried_at = new Date(Date.now() - 7200000).toISOString();
        fs.writeFileSync(bpPath, JSON.stringify(bpData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID);
      } finally {
        cleanup();
      }
    });

    // 14. queried_at demasiado futuro falha
    it('14. queried_at demasiado futuro falha', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        // Set queried_at to 2 hours in the future
        bpData.queried_at = new Date(Date.now() + 7200000).toISOString();
        fs.writeFileSync(bpPath, JSON.stringify(bpData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID);
      } finally {
        cleanup();
      }
    });

    // 15. query_actor divergente falha
    it('15. query_actor divergente falha', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        bpData.query_actor = 'divergent-actor';
        fs.writeFileSync(bpPath, JSON.stringify(bpData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          expectedQueryActor: 'victorinoaguiar-art'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID);
      } finally {
        cleanup();
      }
    });

    // 16. pacote remoto incompleto não pode ser publicado
    it('16. Pacote remoto incompleto não pode ser publicado', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        // Remove a required file
        const fileToRemove = path.join(tempDir, 'npm-ci.log');
        if (fs.existsSync(fileToRemove)) {
          fs.unlinkSync(fileToRemove);
        }

        const res = verifyEvidenceBundle({
          evidenceDir: tempDir,
          headSha: testSha,
          expectedRunId: 123456789,
          reportPath: validReportRelPath,
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });
        assert.strictEqual(res.valid, false);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 17. hash final divergente depois do enriquecimento bloqueia o envio
    it('17. Hash final divergente depois do enriquecimento bloqueia o envio', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        // Tamper with receipt file content without updating evidence-files.sha256
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        fs.appendFileSync(rcPath, '\n/* tampered */\n');

        const res = verifyEvidenceBundle({
          evidenceDir: tempDir,
          headSha: testSha,
          expectedRunId: 123456789,
          reportPath: validReportRelPath,
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });
        assert.strictEqual(res.valid, false);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 18. pacote completo e coerente passa e fica pronto para publicação
    it('18. Pacote completo e coerente passa e fica pronto para publicação', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();

        const res = verifyEvidenceBundle({
          evidenceDir: tempDir,
          headSha: testSha,
          expectedRunId: 123456789,
          reportPath: validReportRelPath,
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          expectedQueryActor: 'GitHub Actions',
          remoteRunId: 987654321
        });
        assert.strictEqual(res.valid, true, `Bundle verification failed: ${res.error}`);
        assert.strictEqual(res.filesCount >= 23, true);
      } finally {
        cleanup();
        cleanupReport();
      }
    });
  });

  // =========================================================================
  // Suite 32 — Testes Negativos de Proveniência Remota e Fecho Forense Definitivo
  // =========================================================================
  describe('Suite 32 — Proveniência Verificável, IDs Separados e Janela Temporal Remota', () => {
    const validReportRelPath = 'generated/test_valid_report_32.md';
    const validReportAbsPath = path.resolve(root, validReportRelPath);

    const ensureValidReport = () => {
      fs.mkdirSync(path.dirname(validReportAbsPath), { recursive: true });
      fs.writeFileSync(validReportAbsPath, '# Relatório Válido Suite 32\nSem links locais.\n', 'utf8');
    };

    const cleanupReport = () => {
      if (fs.existsSync(validReportAbsPath)) {
        fs.unlinkSync(validReportAbsPath);
      }
    };

    // 1. query_actor diferente de expectedQueryActor falha
    it('1. query_actor diferente de expectedQueryActor falha', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        bpData.query_actor = 'divergent-actor';
        fs.writeFileSync(bpPath, JSON.stringify(bpData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          enforceRemoteCi: true,
          targetClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          reportPath: validReportRelPath,
          expectedQueryActor: 'victorinoaguiar-art'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID);
        assert.match(res.error, /query_actor mismatch/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 2. actor esperado ausente em modo remoto falha
    it('2. Actor esperado ausente em modo remoto falha com EXPECTED_QUERY_ACTOR_MISSING', () => {
      const oldActorEnv = process.env.EXPECTED_QUERY_ACTOR;
      delete process.env.EXPECTED_QUERY_ACTOR;
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();

        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          enforceRemoteCi: true,
          targetClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          reportPath: validReportRelPath
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.EXPECTED_QUERY_ACTOR_MISSING);
      } finally {
        if (oldActorEnv) process.env.EXPECTED_QUERY_ACTOR = oldActorEnv;
        cleanup();
        cleanupReport();
      }
    });

    // 3. remote_verification_run_id divergente falha
    it('3. remote_verification_run_id divergente falha', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();

        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          enforceRemoteCi: true,
          targetClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          reportPath: validReportRelPath,
          expectedQueryActor: 'GitHub Actions',
          remoteRunId: 111222333 // does not match 987654321
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_RUN_ID_MISMATCH);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 4. confusão entre primary_run_id e query_run_id falha
    it('4. Confusão entre primary_run_id e query_run_id falha com QUERY_RUN_ID_COLLISION', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        // Set query_run_id to same as primary_run_id (123456789)
        bpData.query_run_id = 123456789;
        fs.writeFileSync(bpPath, JSON.stringify(bpData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          enforceRemoteCi: true,
          targetClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          reportPath: validReportRelPath,
          expectedQueryActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.QUERY_RUN_ID_COLLISION);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 5. queried_at posterior a remote_synced_at falha
    it('5. queried_at posterior a remote_synced_at além da tolerância falha', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));

        rcData.started_at = '2026-09-16T11:00:00.000Z';
        rcData.remote_started_at = '2026-09-16T11:50:00.000Z';
        rcData.remote_synced_at = '2026-09-16T12:00:00.000Z';
        bpData.queried_at = '2026-09-16T12:05:00.000Z'; // 5 minutes after sync
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
        fs.writeFileSync(bpPath, JSON.stringify(bpData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          enforceRemoteCi: true,
          targetClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          reportPath: validReportRelPath,
          expectedQueryActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID);
        assert.match(res.error, /cannot be posterior to remote sync timestamp/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 6. queried_at anterior ao início da execução remota falha
    it('6. queried_at anterior ao início da execução remota falha', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));

        rcData.started_at = '2026-09-16T11:00:00.000Z';
        rcData.remote_started_at = '2026-09-16T12:00:00.000Z';
        bpData.queried_at = '2026-09-16T11:55:00.000Z'; // 5 minutes before remote start
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
        fs.writeFileSync(bpPath, JSON.stringify(bpData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          enforceRemoteCi: true,
          targetClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          reportPath: validReportRelPath,
          expectedQueryActor: 'GitHub Actions',
          remoteRunStartedAt: '2026-09-16T12:00:00.000Z'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID);
        assert.match(res.error, /cannot be prior to remote execution started_at/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 7. metadados de proveniência ausentes falha
    it('7. Metadados de proveniência ausentes falha', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        delete bpData.query_workflow;
        fs.writeFileSync(bpPath, JSON.stringify(bpData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = verifyEvidenceCoherence({
          evidenceDir: tempDir,
          targetSha: testSha,
          enforceRemoteCi: true,
          targetClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          reportPath: validReportRelPath,
          expectedQueryActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, ERROR_CODES.BRANCH_PROTECTION_ORIGIN_INVALID);
        assert.match(res.error, /Provenance metadata missing/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 8. hashes ou índice divergentes após alteração dos novos campos falha
    it('8. Hashes ou índice divergentes após alteração dos novos campos falha', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        rcData.remote_verification_run_id = 999111;
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
        // Intentionally NOT refreshing evidence-files.sha256

        const res = verifyEvidenceBundle({
          evidenceDir: tempDir,
          headSha: testSha,
          expectedRunId: 123456789,
          reportPath: validReportRelPath,
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          expectedQueryActor: 'GitHub Actions',
          remoteRunId: 987654321
        });
        assert.strictEqual(res.valid, false);
        assert.match(res.code, /HASH_MISMATCH/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 9. CLI verify-evidence-coherence via spawnSync falha com expected-query-actor divergente
    it('9. CLI verify-evidence-coherence via spawnSync falha com expected-query-actor divergente', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();

        const res = spawnSync(process.execPath, [
          coherenceModulePath,
          '--remote',
          '--dir', tempDir,
          '--sha', testSha,
          '--classification', 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          '--report', validReportRelPath,
          '--expected-query-actor', 'wrong-actor-name'
        ], { encoding: 'utf8', cwd: root });
        assert.strictEqual(res.status, 1);
        assert.match(res.stderr + res.stdout, /BRANCH_PROTECTION_ORIGIN_INVALID|mismatch/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 10. verifyEvidenceBundle com named options e proveniência remota aprovado
    it('10. verifyEvidenceBundle com opções nomeadas e proveniência remota aprovado', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();

        const res = verifyEvidenceBundle({
          evidenceDir: tempDir,
          headSha: testSha,
          expectedRunId: 123456789,
          reportPath: validReportRelPath,
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          expectedQueryActor: 'GitHub Actions',
          remoteRunId: 987654321
        });
        assert.strictEqual(res.valid, true, `Bundle verification failed: ${res.error}`);
        assert.strictEqual(res.filesCount >= 23, true);
      } finally {
        cleanup();
        cleanupReport();
      }
    });
  });
});

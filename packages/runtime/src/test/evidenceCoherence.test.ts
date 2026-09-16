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
  const verifyAttestationModulePath = path.resolve(root, 'scripts/verify-final-attestation.mjs');
  const generateAttestationModulePath = path.resolve(root, 'scripts/generate-final-attestation.mjs');
  const { verifyFinalAttestation } = await import(pathToFileURL(verifyAttestationModulePath).href);
  const { generateFinalAttestation } = await import(pathToFileURL(generateAttestationModulePath).href);

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


  const setupMockFinalEvidence = (finalDir: string, sha: string = testSha, primaryRunId: number = 123456789, remoteRunId: number = 987654321, actor: string = 'GitHub Actions') => {
    if (fs.existsSync(finalDir)) {
      fs.rmSync(finalDir, { recursive: true, force: true });
    }
    fs.mkdirSync(finalDir, { recursive: true });

    const primaryData = {
      id: primaryRunId,
      run_attempt: 1,
      head_sha: sha,
      head_branch: 'master',
      name: 'CI / Production Readiness & Audit Gate',
      status: 'completed',
      conclusion: 'success',
      run_started_at: '2026-09-17T00:00:00.000Z',
      created_at: '2026-09-17T00:00:00.000Z',
      updated_at: '2026-09-17T00:03:00.000Z',
      html_url: `https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/${primaryRunId}`,
      actor: { login: actor },
      repository: { full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
    };
    const primaryPath = path.join(finalDir, 'final-primary-run-api-response.json');
    fs.writeFileSync(primaryPath, JSON.stringify(primaryData, null, 2) + '\n', 'utf8');

    const remoteData = {
      id: remoteRunId,
      run_attempt: 1,
      head_sha: sha,
      head_branch: 'master',
      name: 'Evidence Remote Verification',
      status: 'completed',
      conclusion: 'success',
      run_started_at: '2026-09-17T00:03:30.000Z',
      created_at: '2026-09-17T00:03:30.000Z',
      updated_at: '2026-09-17T00:04:00.000Z',
      html_url: `https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/${remoteRunId}`,
      actor: { login: actor },
      repository: { full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
    };
    const remotePath = path.join(finalDir, 'final-remote-run-api-response.json');
    fs.writeFileSync(remotePath, JSON.stringify(remoteData, null, 2) + '\n', 'utf8');

    const artifactsData = {
      total_count: 1,
      artifacts: [
        {
          id: 556677,
          name: `aetf-verified-remote-evidence-bundle-${sha}`,
          size_in_bytes: 75000,
          expired: false,
          workflow_run: {
            id: remoteRunId,
            head_sha: sha
          }
        }
      ]
    };
    const artifactsPath = path.join(finalDir, 'final-remote-artifacts-api-response.json');
    fs.writeFileSync(artifactsPath, JSON.stringify(artifactsData, null, 2) + '\n', 'utf8');

    const pHash = crypto.createHash('sha256').update(fs.readFileSync(primaryPath)).digest('hex');
    const rHash = crypto.createHash('sha256').update(fs.readFileSync(remotePath)).digest('hex');
    const aHash = crypto.createHash('sha256').update(fs.readFileSync(artifactsPath)).digest('hex');

    const indexContent = `${pHash}  final-primary-run-api-response.json\n${rHash}  final-remote-run-api-response.json\n${aHash}  final-remote-artifacts-api-response.json\n`;
    const indexPath = path.join(finalDir, 'final-evidence-files.sha256');
    fs.writeFileSync(indexPath, indexContent, 'utf8');

    return {
      primaryPath,
      remotePath,
      artifactsPath,
      indexPath
    };
  };

  const setupMockEvidenceBundle = (dir: string, sha: string = testSha) => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir, { recursive: true });

    const remoteStartedAt = new Date(Date.now() - 50000).toISOString();
    const mockRemoteRunApiResponse = JSON.stringify({
      id: 987654321,
      run_attempt: 1,
      head_sha: sha,
      head_branch: 'master',
      name: 'Evidence Remote Verification',
      status: 'completed',
      conclusion: 'success',
      run_started_at: remoteStartedAt,
      created_at: remoteStartedAt,
      updated_at: new Date().toISOString(),
      html_url: 'https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/987654321',
      actor: { login: 'GitHub Actions' },
      triggering_actor: { login: 'GitHub Actions' },
      repository: { full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES', name: 'APLICATIVO-AI-EMPLOYEES' }
    }, null, 2) + '\n';
    const remoteRunResponseSha256 = crypto.createHash('sha256').update(mockRemoteRunApiResponse).digest('hex');

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
        remote_started_at: remoteStartedAt,
        remote_created_at: remoteStartedAt,
        remote_updated_at: new Date().toISOString(),
        remote_run_url: 'https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/987654321',
        remote_actor: 'GitHub Actions',
        remote_run_response_sha256: remoteRunResponseSha256,
        remote_conclusion: 'success',
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
      'remote-workflow-run-api-response.json': mockRemoteRunApiResponse,
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
    setupMockFinalEvidence(path.resolve(root, '.artifacts/final-evidence'), sha);
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
    const defaultFinalEvidenceDir = path.resolve(root, '.artifacts/final-evidence');
    if (fs.existsSync(defaultFinalEvidenceDir)) {
      fs.rmSync(defaultFinalEvidenceDir, { recursive: true, force: true });
    }
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
          expectedQueryActor: 'GitHub Actions'
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
        const rawPath = path.join(tempDir, 'remote-workflow-run-api-response.json');
        const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
        rawData.run_started_at = rcData.remote_started_at;
        const newRawContent = JSON.stringify(rawData, null, 2) + '\n';
        fs.writeFileSync(rawPath, newRawContent, 'utf8');
        rcData.remote_run_response_sha256 = crypto.createHash('sha256').update(newRawContent).digest('hex');
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
        const rawPath = path.join(tempDir, 'remote-workflow-run-api-response.json');
        const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
        rawData.run_started_at = rcData.remote_started_at;
        const newRawContent = JSON.stringify(rawData, null, 2) + '\n';
        fs.writeFileSync(rawPath, newRawContent, 'utf8');
        rcData.remote_run_response_sha256 = crypto.createHash('sha256').update(newRawContent).digest('hex');
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
        assert.match(res.stderr + res.stdout, /REMOTE_ACTOR_MISMATCH|BRANCH_PROTECTION_ORIGIN_INVALID|mismatch/i);
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

  describe('Suite 33: Fecho Final de Proveniência, Início Real Remoto e Atestação SHA (12 Cenários Negativos & Integração CLI)', () => {
    const validReportRelPath = 'generated/test_valid_report_33.md';
    const validReportAbsPath = path.resolve(root, validReportRelPath);

    const ensureValidReport = () => {
      fs.mkdirSync(path.dirname(validReportAbsPath), { recursive: true });
      fs.writeFileSync(validReportAbsPath, '# Relatório Válido Suite 33\nSem links locais.\n', 'utf8');
    };

    const cleanupReport = () => {
      if (fs.existsSync(validReportAbsPath)) {
        fs.unlinkSync(validReportAbsPath);
      }
    };

    // 1. remote_started_at ausente falha com REMOTE_PROVENANCE_MISSING
    it('1. remote_started_at ausente falha com REMOTE_PROVENANCE_MISSING', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        delete rcData.remote_started_at;
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
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
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_PROVENANCE_MISSING);
        assert.match(res.error, /remote_started_at/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 2. remote_started_at divergente da resposta bruta falha com REMOTE_RESPONSE_DATA_INVALID
    it('2. remote_started_at divergente da resposta bruta falha com REMOTE_RESPONSE_DATA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        rcData.remote_started_at = new Date(Date.now() - 123456).toISOString();
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
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
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_RESPONSE_DATA_INVALID);
        assert.match(res.error, /Remote started_at mismatch/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 3. queried_at anterior ao início remoto além da tolerância de 60s falha com BRANCH_PROTECTION_ORIGIN_INVALID
    it('3. queried_at anterior ao início remoto além da tolerância de 60s falha com BRANCH_PROTECTION_ORIGIN_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));

        const rStart = Date.parse(rcData.remote_started_at);
        bpData.queried_at = new Date(rStart - 90 * 1000).toISOString(); // 90s prior (> 60s tolerance)
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
        assert.match(res.error, /cannot be prior to remote execution started_at.*60s/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 4. queried_at posterior à sincronização além da tolerância de 60s falha com BRANCH_PROTECTION_ORIGIN_INVALID
    it('4. queried_at posterior à sincronização além da tolerância de 60s falha com BRANCH_PROTECTION_ORIGIN_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));

        const rSynced = Date.parse(rcData.remote_synced_at);
        bpData.queried_at = new Date(rSynced + 90 * 1000).toISOString(); // 90s after (> 60s tolerance)
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
        assert.match(res.error, /cannot be posterior to remote sync timestamp.*60s/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 5. ID remoto diverge da resposta da API falha com REMOTE_RESPONSE_DATA_INVALID
    it('5. ID remoto diverge da resposta da API falha com REMOTE_RESPONSE_DATA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rawPath = path.join(tempDir, 'remote-workflow-run-api-response.json');
        const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
        rawData.id = 11223344;
        rawData.html_url = 'https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/11223344';
        const newRaw = JSON.stringify(rawData, null, 2) + '\n';
        fs.writeFileSync(rawPath, newRaw, 'utf8');

        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        rcData.remote_run_response_sha256 = crypto.createHash('sha256').update(newRaw).digest('hex');
        // rcData.remote_verification_run_id remains 987654321
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
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
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_RESPONSE_DATA_INVALID);
        assert.match(res.error, /Remote run ID mismatch/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 6. SHA remoto diverge do SHA esperado falha com REMOTE_SHA_MISMATCH
    it('6. SHA remoto diverge do SHA esperado falha com REMOTE_SHA_MISMATCH', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rawPath = path.join(tempDir, 'remote-workflow-run-api-response.json');
        const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
        rawData.head_sha = 'b'.repeat(40);
        const newRaw = JSON.stringify(rawData, null, 2) + '\n';
        fs.writeFileSync(rawPath, newRaw, 'utf8');

        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        rcData.remote_run_response_sha256 = crypto.createHash('sha256').update(newRaw).digest('hex');
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
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
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_SHA_MISMATCH);
        assert.match(res.error, /Remote run head_sha mismatch/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 7. Actor remoto diverge de query_actor ou EXPECTED_QUERY_ACTOR falha com REMOTE_ACTOR_MISMATCH
    it('7. Actor remoto diverge de query_actor ou EXPECTED_QUERY_ACTOR falha com REMOTE_ACTOR_MISMATCH', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rawPath = path.join(tempDir, 'remote-workflow-run-api-response.json');
        const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
        rawData.actor.login = 'unauthorized-actor';
        const newRaw = JSON.stringify(rawData, null, 2) + '\n';
        fs.writeFileSync(rawPath, newRaw, 'utf8');

        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        rcData.remote_actor = 'unauthorized-actor';
        rcData.remote_run_response_sha256 = crypto.createHash('sha256').update(newRaw).digest('hex');
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');

        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        bpData.query_actor = 'unauthorized-actor';
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
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_ACTOR_MISMATCH);
        assert.match(res.error, /does not match expected actor/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 8. Hash da resposta bruta diverge dos bytes físicos falha com REMOTE_RESPONSE_HASH_MISMATCH
    it('8. Hash da resposta bruta diverge dos bytes físicos falha com REMOTE_RESPONSE_HASH_MISMATCH', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        rcData.remote_run_response_sha256 = '0'.repeat(64);
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
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
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_RESPONSE_HASH_MISMATCH);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 9a. Resposta bruta ausente falha com REMOTE_RESPONSE_FILE_MISSING
    it('9a. Resposta bruta ausente falha com REMOTE_RESPONSE_FILE_MISSING', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rawPath = path.join(tempDir, 'remote-workflow-run-api-response.json');
        fs.unlinkSync(rawPath);
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
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_RESPONSE_FILE_MISSING);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 9b. Resposta bruta com JSON inválido falha com REMOTE_RESPONSE_DATA_INVALID
    it('9b. Resposta bruta com JSON inválido falha com REMOTE_RESPONSE_DATA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rawPath = path.join(tempDir, 'remote-workflow-run-api-response.json');
        const invalidRaw = '{ invalid json content';
        fs.writeFileSync(rawPath, invalidRaw, 'utf8');

        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        rcData.remote_run_response_sha256 = crypto.createHash('sha256').update(invalidRaw).digest('hex');
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
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
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_RESPONSE_DATA_INVALID);
        assert.match(res.error, /invalid JSON/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 10. query_run_id coincide com primary_run_id falha com QUERY_RUN_ID_COLLISION
    it('10. query_run_id coincide com primary_run_id falha com QUERY_RUN_ID_COLLISION', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const bpPath = path.join(tempDir, 'branch-protection.json');
        const bpData = JSON.parse(fs.readFileSync(bpPath, 'utf8'));
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));

        bpData.query_run_id = rcData.run_id;
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

    // 11. URL remota não corresponde ao ID validado falha com REMOTE_RESPONSE_DATA_INVALID
    it('11. URL remota não corresponde ao ID validado falha com REMOTE_RESPONSE_DATA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rawPath = path.join(tempDir, 'remote-workflow-run-api-response.json');
        const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
        rawData.html_url = 'https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/111222333';
        const newRaw = JSON.stringify(rawData, null, 2) + '\n';
        fs.writeFileSync(rawPath, newRaw, 'utf8');

        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        rcData.remote_run_url = rawData.html_url;
        rcData.remote_run_response_sha256 = crypto.createHash('sha256').update(newRaw).digest('hex');
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
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
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_RESPONSE_DATA_INVALID);
        assert.match(res.error, /does not contain remote verification run ID/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 12. Consulta de sincronização sem argumentos obrigatórios falha fechada com exit code 1
    it('12. Consulta de sincronização sem argumentos obrigatórios falha fechada com exit code 1', () => {
      const syncModulePath = path.resolve(root, 'scripts/sync-remote-ci-receipt.mjs');
      const res = spawnSync(process.execPath, [syncModulePath], {
        encoding: 'utf8',
        cwd: root,
        env: { ...process.env, PRIMARY_RUN_ID: '', HEAD_SHA: '' }
      });
      assert.strictEqual(res.status, 1);
      assert.match(res.stderr + res.stdout, /Missing PRIMARY_RUN_ID or HEAD_SHA/);
    });

    // 13. Teste de integração CLI real com --remote valida com sucesso bundle íntegro
    it('13. Teste de integração CLI real com --remote valida com sucesso bundle íntegro', () => {
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
          '--expected-query-actor', 'GitHub Actions',
          '--remote-run-id', '987654321'
        ], { encoding: 'utf8', cwd: root });

        assert.strictEqual(res.status, 0, `CLI failed: ${res.stderr}\n${res.stdout}`);
        assert.match(res.stdout, /Evidence coherence gate cleared successfully/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 14. Teste de integração CLI real com --remote falha com código de erro quando violado
    it('14. Teste de integração CLI real com --remote falha com código de erro quando violado', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        delete rcData.remote_started_at;
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
        refreshEvidenceIndex(tempDir);

        const res = spawnSync(process.execPath, [
          coherenceModulePath,
          '--remote',
          '--dir', tempDir,
          '--sha', testSha,
          '--classification', 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          '--report', validReportRelPath,
          '--expected-query-actor', 'GitHub Actions'
        ], { encoding: 'utf8', cwd: root });

        assert.strictEqual(res.status, 1);
        assert.match(res.stderr + res.stdout, /REMOTE_PROVENANCE_MISSING/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 15. Geração determinística da atestação final via generate-final-attestation.mjs
    it('15. Geração determinística da atestação final via generate-final-attestation.mjs', () => {
      const attestationScriptPath = path.resolve(root, 'scripts/generate-final-attestation.mjs');
      const attestationOutDir = path.resolve(root, 'generated/tmp_test_attestation');
      try {
        setupMockEvidenceBundle(tempDir);
        const res = spawnSync(process.execPath, [
          attestationScriptPath,
          '--dir', tempDir,
          '--output', attestationOutDir,
          '--sha', testSha,
          '--primary-run-id', '123456789',
          '--remote-run-id', '987654321',
          '--actor', 'GitHub Actions',
          '--classification', 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          '--artifact-id', '99887766'
        ], { encoding: 'utf8', cwd: root });

        assert.strictEqual(res.status, 0, `Attestation generation failed: ${res.stderr}\n${res.stdout}`);
        const attestationJsonPath = path.join(attestationOutDir, 'final-attestation.json');
        const attestationMdPath = path.join(attestationOutDir, 'final-attestation.md');

        assert.strictEqual(fs.existsSync(attestationJsonPath), true);
        assert.strictEqual(fs.existsSync(attestationMdPath), true);

        const att = JSON.parse(fs.readFileSync(attestationJsonPath, 'utf8'));
        assert.strictEqual(att.attested_commit_sha, testSha);
        assert.strictEqual(att.primary_run_id, 123456789);
        assert.strictEqual(att.remote_verification_run_id, 987654321);
        assert.strictEqual(att.query_actor, 'GitHub Actions');
        assert.strictEqual(att.classification, 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS');
        assert.strictEqual(att.operational_state, 'PRE-PRODUCTION / L2 HARDENED');
        assert.strictEqual(att.status, 'PASS');
        assert.strictEqual(att.artifact_id, 99887766);
        assert.match(att.evidence_index_sha256, /^[a-f0-9]{64}$/);
      } finally {
        if (fs.existsSync(attestationOutDir)) {
          fs.rmSync(attestationOutDir, { recursive: true, force: true });
        }
        cleanup();
      }
    });
  });

  describe('Suite 34: Fail-Closed Final Attestation & Strict Remote API Provenance (16 Cenários Obrigatórios)', () => {
    const validReportRelPath = 'generated/test_valid_report_34.md';
    const validReportAbsPath = path.resolve(root, validReportRelPath);

    const ensureValidReport = () => {
      fs.mkdirSync(path.dirname(validReportAbsPath), { recursive: true });
      fs.writeFileSync(validReportAbsPath, '# Relatório de Testes\nClassificação: PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS\n', 'utf8');
    };

    const cleanupReport = () => {
      if (fs.existsSync(validReportAbsPath)) {
        fs.unlinkSync(validReportAbsPath);
      }
    };

    const attestationScriptPath = path.resolve(root, 'scripts/verify-final-attestation.mjs');
    const generatorScriptPath = path.resolve(root, 'scripts/generate-final-attestation.mjs');

    // 1. run_attempt está ausente
    it('1. run_attempt está ausente na resposta remota falha com REMOTE_RESPONSE_DATA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rawPath = path.join(tempDir, 'remote-workflow-run-api-response.json');
        const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
        delete rawData.run_attempt;
        const newRaw = JSON.stringify(rawData, null, 2) + '\n';
        fs.writeFileSync(rawPath, newRaw, 'utf8');

        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        rcData.remote_run_response_sha256 = crypto.createHash('sha256').update(newRaw).digest('hex');
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
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
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_RESPONSE_DATA_INVALID);
        assert.match(res.error, /run_attempt/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 2. head_sha está ausente
    it('2. head_sha está ausente na resposta remota falha com REMOTE_SHA_MISMATCH', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rawPath = path.join(tempDir, 'remote-workflow-run-api-response.json');
        const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
        delete rawData.head_sha;
        const newRaw = JSON.stringify(rawData, null, 2) + '\n';
        fs.writeFileSync(rawPath, newRaw, 'utf8');

        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        rcData.remote_run_response_sha256 = crypto.createHash('sha256').update(newRaw).digest('hex');
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
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
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_SHA_MISMATCH);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 3. repositório está ausente ou divergente
    it('3. repositório divergente na resposta remota falha com REMOTE_RESPONSE_DATA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rawPath = path.join(tempDir, 'remote-workflow-run-api-response.json');
        const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
        rawData.repository.full_name = 'attacker/fake-repo';
        const newRaw = JSON.stringify(rawData, null, 2) + '\n';
        fs.writeFileSync(rawPath, newRaw, 'utf8');

        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        rcData.remote_run_response_sha256 = crypto.createHash('sha256').update(newRaw).digest('hex');
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
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
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_RESPONSE_DATA_INVALID);
        assert.match(res.error, /repository/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 4. workflow está ausente ou divergente
    it('4. workflow divergente na resposta remota falha com REMOTE_RESPONSE_DATA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rawPath = path.join(tempDir, 'remote-workflow-run-api-response.json');
        const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
        rawData.name = 'Arbitrary Malicious Workflow';
        delete rawData.path;
        const newRaw = JSON.stringify(rawData, null, 2) + '\n';
        fs.writeFileSync(rawPath, newRaw, 'utf8');

        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        rcData.remote_run_response_sha256 = crypto.createHash('sha256').update(newRaw).digest('hex');
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
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
        assert.strictEqual(res.code, ERROR_CODES.REMOTE_RESPONSE_DATA_INVALID);
        assert.match(res.error, /workflow/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 5. remote_synced_at antecede remote_started_at
    it('5. remote_synced_at antecede remote_started_at falha com BRANCH_PROTECTION_ORIGIN_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        ensureValidReport();
        const rcPath = path.join(tempDir, 'github-actions-receipt.json');
        const rcData = JSON.parse(fs.readFileSync(rcPath, 'utf8'));
        // Make remote_synced_at prior to remote_started_at
        rcData.remote_synced_at = new Date(Date.parse(rcData.remote_started_at) - 10000).toISOString();
        fs.writeFileSync(rcPath, JSON.stringify(rcData, null, 2), 'utf8');
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
        assert.match(res.error, /cannot be posterior to remote_synced_at/);
      } finally {
        cleanup();
        cleanupReport();
      }
    });

    // 6. remote_conclusion está ausente
    it('6. remote_conclusion está ausente na atestação falha com ATTESTATION_SCHEMA_INVALID', () => {
      const attDir = path.resolve(root, 'generated/tmp_test_attestation_6');
      try {
        setupMockEvidenceBundle(tempDir);
        const att = generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: attDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          primaryConclusion: 'success',
          remoteConclusion: 'success',
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        const jsonPath = path.join(attDir, 'final-attestation.json');
        const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        delete parsed.remote_conclusion;
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');

        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });

        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'ATTESTATION_SCHEMA_INVALID');
        assert.match(res.error, /remote_conclusion/);
      } finally {
        if (fs.existsSync(attDir)) fs.rmSync(attDir, { recursive: true, force: true });
        cleanup();
      }
    });

    // 7. remote_conclusion ainda é null, in_progress, queued, failure ou cancelled
    it('7. remote_conclusion com estado não-success falha schema e integridade', () => {
      const attDir = path.resolve(root, 'generated/tmp_test_attestation_7');
      const finalDir = path.resolve(root, 'generated/tmp_final_evidence_7');
      try {
        setupMockEvidenceBundle(tempDir);
        setupMockFinalEvidence(finalDir);
        for (const badConclusion of ['in_progress', 'queued', 'failure', 'cancelled']) {
          const rPath = path.join(finalDir, 'final-remote-run-api-response.json');
          const rData = JSON.parse(fs.readFileSync(rPath, 'utf8'));
          rData.conclusion = badConclusion;
          fs.writeFileSync(rPath, JSON.stringify(rData, null, 2), 'utf8');

          assert.throws(() => {
            generateFinalAttestation({
              evidenceDir: tempDir,
              outputDir: attDir,
              primaryRunResponse: path.join(finalDir, 'final-primary-run-api-response.json'),
              remoteRunResponse: rPath,
              finalEvidenceIndex: path.join(finalDir, 'final-evidence-files.sha256'),
              sha: testSha,
              primaryRunId: 123456789,
              remoteRunId: 987654321,
              actor: 'GitHub Actions',
              classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
            });
          }, /remote_conclusion must be "success"/);
        }
      } finally {
        if (fs.existsSync(attDir)) fs.rmSync(attDir, { recursive: true, force: true });
        if (fs.existsSync(finalDir)) fs.rmSync(finalDir, { recursive: true, force: true });
        cleanup();
      }
    });

    // 8. primary_conclusion não é success
    it('8. primary_conclusion não é success falha com erro', () => {
      const attDir = path.resolve(root, 'generated/tmp_test_attestation_8');
      const finalDir = path.resolve(root, 'generated/tmp_final_evidence_8');
      try {
        setupMockEvidenceBundle(tempDir);
        setupMockFinalEvidence(finalDir);
        const pPath = path.join(finalDir, 'final-primary-run-api-response.json');
        const pData = JSON.parse(fs.readFileSync(pPath, 'utf8'));
        pData.conclusion = 'failure';
        fs.writeFileSync(pPath, JSON.stringify(pData, null, 2), 'utf8');

        assert.throws(() => {
          generateFinalAttestation({
            evidenceDir: tempDir,
            outputDir: attDir,
            primaryRunResponse: pPath,
            remoteRunResponse: path.join(finalDir, 'final-remote-run-api-response.json'),
            finalEvidenceIndex: path.join(finalDir, 'final-evidence-files.sha256'),
            sha: testSha,
            primaryRunId: 123456789,
            remoteRunId: 987654321,
            actor: 'GitHub Actions',
            classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
          });
        }, /primary_conclusion must be "success"/);
      } finally {
        if (fs.existsSync(attDir)) fs.rmSync(attDir, { recursive: true, force: true });
        if (fs.existsSync(finalDir)) fs.rmSync(finalDir, { recursive: true, force: true });
        cleanup();
      }
    });

    // 9. status: PASS aparece sem todos os gates aprovados
    it('9. status: PASS em atestação com conclusão divergente é rejeitado pelo verificador', () => {
      const attDir = path.resolve(root, 'generated/tmp_test_attestation_9');
      try {
        setupMockEvidenceBundle(tempDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: attDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          primaryConclusion: 'success',
          remoteConclusion: 'success',
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        const jsonPath = path.join(attDir, 'final-attestation.json');
        const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        parsed.status = 'FAIL';
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');

        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'ATTESTATION_SCHEMA_INVALID');
      } finally {
        if (fs.existsSync(attDir)) fs.rmSync(attDir, { recursive: true, force: true });
        cleanup();
      }
    });

    // 10. SHA, actor ou IDs da atestação divergem das respostas físicas
    it('10. SHA, actor ou IDs da atestação divergem das respostas físicas falha com código específico', () => {
      const attDir = path.resolve(root, 'generated/tmp_test_attestation_10');
      try {
        setupMockEvidenceBundle(tempDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: attDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          primaryConclusion: 'success',
          remoteConclusion: 'success',
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });
        const jsonPath = path.join(attDir, 'final-attestation.json');

        // Divergent actor
        const resActor = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'divergent-actor'
        });
        assert.strictEqual(resActor.valid, false);
        assert.strictEqual(resActor.code, 'ATTESTATION_ACTOR_MISMATCH');

        // Divergent primaryRunId
        const resPrimary = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          sha: testSha,
          primaryRunId: 999999999,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(resPrimary.valid, false);
        assert.strictEqual(resPrimary.code, 'ATTESTATION_RUN_ID_MISMATCH');

        // Divergent remoteRunId
        const resRemote = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 999999999,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(resRemote.valid, false);
        assert.strictEqual(resRemote.code, 'ATTESTATION_RUN_ID_MISMATCH');
      } finally {
        if (fs.existsSync(attDir)) fs.rmSync(attDir, { recursive: true, force: true });
        cleanup();
      }
    });

    // 11. artefacto está ausente, expirado ou ligado a outro SHA
    it('11. artefacto com nome associado a outro SHA ou ID inválido falha com ATTESTATION_ARTIFACT_INVALID', () => {
      const attDir = path.resolve(root, 'generated/tmp_test_attestation_11');
      try {
        setupMockEvidenceBundle(tempDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: attDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          primaryConclusion: 'success',
          remoteConclusion: 'success',
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS',
          artifactId: 112233
        });
        const jsonPath = path.join(attDir, 'final-attestation.json');

        // Mismatched artifact ID
        const resArt = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          artifactId: 999999,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(resArt.valid, false);
        assert.strictEqual(resArt.code, 'ATTESTATION_ARTIFACT_INVALID');
      } finally {
        if (fs.existsSync(attDir)) fs.rmSync(attDir, { recursive: true, force: true });
        cleanup();
      }
    });

    // 12. hash do índice diverge dos bytes físicos
    it('12. hash do índice diverge dos bytes físicos falha com ATTESTATION_EVIDENCE_MISMATCH', () => {
      const attDir = path.resolve(root, 'generated/tmp_test_attestation_12');
      try {
        setupMockEvidenceBundle(tempDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: attDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          primaryConclusion: 'success',
          remoteConclusion: 'success',
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });
        const jsonPath = path.join(attDir, 'final-attestation.json');
        const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        parsed.evidence_index_sha256 = 'f'.repeat(64);
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');

        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'ATTESTATION_EVIDENCE_MISMATCH');
        assert.match(res.error, /evidence_index_sha256 mismatch/);
      } finally {
        if (fs.existsSync(attDir)) fs.rmSync(attDir, { recursive: true, force: true });
        cleanup();
      }
    });

    // 13. atestação contém propriedade não permitida pelo schema (additionalProperties: false)
    it('13. atestação contém propriedade adicional falha Ajv com ATTESTATION_SCHEMA_INVALID', () => {
      const attDir = path.resolve(root, 'generated/tmp_test_attestation_13');
      try {
        setupMockEvidenceBundle(tempDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: attDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          primaryConclusion: 'success',
          remoteConclusion: 'success',
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });
        const jsonPath = path.join(attDir, 'final-attestation.json');
        const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        parsed.unauthorized_additional_field = 'bypass_attempt';
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');

        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'ATTESTATION_SCHEMA_INVALID');
        assert.match(res.error, /must NOT have additional properties/);
      } finally {
        if (fs.existsSync(attDir)) fs.rmSync(attDir, { recursive: true, force: true });
        cleanup();
      }
    });

    // 14. verificador é chamado com argumento obrigatório ausente
    it('14. verificador CLI é chamado com argumento obrigatório ausente falha com MISSING_CLI_ARGUMENT e exit code 1', () => {
      const res = spawnSync(process.execPath, [
        attestationScriptPath,
        '--sha', testSha
        // Missing --primary-run-id, --remote-run-id, --expected-actor
      ], { encoding: 'utf8', cwd: root });

      assert.strictEqual(res.status, 1);
      assert.match(res.stderr + res.stdout, /MISSING_CLI_ARGUMENT/);
    });

    // 15. tentativa de usar fallback success, PASS, actor fixo ou tentativa 1 é detectada
    it('15. generateFinalAttestation sem conclusão explícita rejeita fallbacks materiais', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const defaultFinalDir = path.resolve(root, '.artifacts/final-evidence');
        const pPath = path.join(defaultFinalDir, 'final-primary-run-api-response.json');
        const pData = JSON.parse(fs.readFileSync(pPath, 'utf8'));
        delete pData.conclusion;
        fs.writeFileSync(pPath, JSON.stringify(pData, null, 2), 'utf8');

        assert.throws(() => {
          generateFinalAttestation({
            evidenceDir: tempDir,
            sha: testSha,
            primaryRunId: 123456789,
            remoteRunId: 987654321
          });
        }, /primary_conclusion must be "success"/);
      } finally {
        cleanup();
      }
    });

    // 16. o workflow finalizador é activado por execução remota não concluída ou não aprovada
    it('16. workflow finalizador possui guarda fail-closed em conclusão remota != success', () => {
      const finalWfPath = path.resolve(root, '.github/workflows/final-attestation.yml');
      assert.strictEqual(fs.existsSync(finalWfPath), true, 'final-attestation.yml must exist');
      const wfContent = fs.readFileSync(finalWfPath, 'utf8');
      assert.match(wfContent, /github\.event\.workflow_run\.conclusion == 'success'/);
      assert.match(wfContent, /workflows:\s*\n\s*-\s*"Evidence Remote Verification"/);
      assert.match(wfContent, /types:\s*\n\s*-\s*completed/);
    });

    // 17. Verificação completa de atestação (end-to-end positivo programático e CLI)
    it('17. Verificação completa de atestação (end-to-end positivo programático e CLI)', () => {
      const attDir = path.resolve(root, 'generated/tmp_test_attestation_17');
      try {
        setupMockEvidenceBundle(tempDir);
        const generated = generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: attDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          primaryConclusion: 'success',
          remoteConclusion: 'success',
          actor: 'GitHub Actions',
          artifactId: 556677,
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        assert.strictEqual(generated.status, 'PASS');
        assert.strictEqual(generated.operational_state, 'PRE-PRODUCTION / L2 HARDENED');

        const jsonPath = path.join(attDir, 'final-attestation.json');
        assert.strictEqual(fs.existsSync(jsonPath), true);

        // Programmatic verification
        const verifyRes = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          artifactId: 556677,
          expectedActor: 'GitHub Actions',
          expectedClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });
        assert.strictEqual(verifyRes.valid, true);

        // CLI verification
        const cliRes = spawnSync(process.execPath, [
          attestationScriptPath,
          '--attestation', jsonPath,
          '--evidence-dir', tempDir,
          '--sha', testSha,
          '--primary-run-id', '123456789',
          '--remote-run-id', '987654321',
          '--artifact-id', '556677',
          '--expected-actor', 'GitHub Actions',
          '--expected-classification', 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        ], { encoding: 'utf8', cwd: root });

        assert.strictEqual(cliRes.status, 0, `CLI verification failed: ${cliRes.stderr}\n${cliRes.stdout}`);
        assert.match(cliRes.stdout, /Final attestation strictly verified/);
        assert.match(cliRes.stdout, /Status: PASS/);
      } finally {
        if (fs.existsSync(attDir)) fs.rmSync(attDir, { recursive: true, force: true });
        cleanup();
      }
    });
  });


  describe('Suite 35: Fecho Forense das Conclusões por Respostas Físicas da API (18 Cenários Negativos & CLI)', () => {
    const validReportRelPath = 'generated/test_valid_report_35.md';
    const validReportAbsPath = path.resolve(root, validReportRelPath);

    const ensureValidReport = () => {
      fs.mkdirSync(path.dirname(validReportAbsPath), { recursive: true });
      fs.writeFileSync(validReportAbsPath, '# Relatório Válido Suite 35\n', 'utf8');
    };

    const cleanupReport = () => {
      if (fs.existsSync(validReportAbsPath)) {
        fs.unlinkSync(validReportAbsPath);
      }
    };

    const attestationScriptPath = path.resolve(root, 'scripts/verify-final-attestation.mjs');
    const generatorScriptPath = path.resolve(root, 'scripts/generate-final-attestation.mjs');
    const testFinalDir = path.resolve(root, 'generated/tmp_final_evidence_35');
    const testAttDir = path.resolve(root, 'generated/tmp_test_attestation_35');

    const cleanupAll = () => {
      if (fs.existsSync(testFinalDir)) fs.rmSync(testFinalDir, { recursive: true, force: true });
      if (fs.existsSync(testAttDir)) fs.rmSync(testAttDir, { recursive: true, force: true });
      cleanup();
      cleanupReport();
    };

    // 1. resposta final principal está ausente
    it('1. resposta final principal está ausente falha com PRIMARY_RESPONSE_FILE_MISSING', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        setupMockFinalEvidence(testFinalDir);
        const { remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        fs.unlinkSync(path.join(testFinalDir, 'final-primary-run-api-response.json'));

        const res = verifyFinalAttestation({
          attestationPath: path.join(testAttDir, 'final-attestation.json'),
          evidenceDir: tempDir,
          primaryRunResponse: path.join(testFinalDir, 'final-primary-run-api-response.json'),
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'PRIMARY_RESPONSE_FILE_MISSING');
      } finally {
        cleanupAll();
      }
    });

    // 2. resposta final remota está ausente
    it('2. resposta final remota está ausente falha com REMOTE_RESPONSE_FILE_MISSING', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, indexPath } = setupMockFinalEvidence(testFinalDir);
        fs.unlinkSync(path.join(testFinalDir, 'final-remote-run-api-response.json'));

        const res = verifyFinalAttestation({
          attestationPath: path.join(testAttDir, 'final-attestation.json'),
          evidenceDir: tempDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: path.join(testFinalDir, 'final-remote-run-api-response.json'),
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'REMOTE_RESPONSE_FILE_MISSING');
      } finally {
        cleanupAll();
      }
    });

    // 3. qualquer resposta contém JSON inválido
    it('3. JSON inválido em resposta primária falha com PRIMARY_RESPONSE_DATA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        fs.writeFileSync(primaryPath, '{ invalid json content', 'utf8');

        // Refresh index
        const pHash = crypto.createHash('sha256').update(fs.readFileSync(primaryPath)).digest('hex');
        const rHash = crypto.createHash('sha256').update(fs.readFileSync(remotePath)).digest('hex');
        fs.writeFileSync(indexPath, `${pHash}  final-primary-run-api-response.json\n${rHash}  final-remote-run-api-response.json\n`, 'utf8');

        assert.throws(() => {
          generateFinalAttestation({
            evidenceDir: tempDir,
            outputDir: testAttDir,
            primaryRunResponse: primaryPath,
            remoteRunResponse: remotePath,
            finalEvidenceIndex: indexPath,
            sha: testSha,
            primaryRunId: 123456789,
            remoteRunId: 987654321,
            actor: 'GitHub Actions',
            classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
          });
        }, /Invalid JSON/);
      } finally {
        cleanupAll();
      }
    });

    // 4. status principal ou remoto não é completed
    it('4. status remoto não é completed falha com erro', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        const rData = JSON.parse(fs.readFileSync(remotePath, 'utf8'));
        rData.status = 'in_progress';
        fs.writeFileSync(remotePath, JSON.stringify(rData, null, 2) + '\n', 'utf8');

        assert.throws(() => {
          generateFinalAttestation({
            evidenceDir: tempDir,
            outputDir: testAttDir,
            primaryRunResponse: primaryPath,
            remoteRunResponse: remotePath,
            finalEvidenceIndex: indexPath,
            sha: testSha,
            primaryRunId: 123456789,
            remoteRunId: 987654321,
            actor: 'GitHub Actions',
            classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
          });
        }, /remote_status must be "completed"/);
      } finally {
        cleanupAll();
      }
    });

    // 5. conclusion principal ou remota não é success
    it('5. conclusion primária não é success falha com erro', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        const pData = JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
        pData.conclusion = 'failure';
        fs.writeFileSync(primaryPath, JSON.stringify(pData, null, 2) + '\n', 'utf8');

        assert.throws(() => {
          generateFinalAttestation({
            evidenceDir: tempDir,
            outputDir: testAttDir,
            primaryRunResponse: primaryPath,
            remoteRunResponse: remotePath,
            finalEvidenceIndex: indexPath,
            sha: testSha,
            primaryRunId: 123456789,
            remoteRunId: 987654321,
            actor: 'GitHub Actions',
            classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
          });
        }, /primary_conclusion must be "success"/);
      } finally {
        cleanupAll();
      }
    });

    // 6. conclusão presente na atestação diverge da resposta física
    it('6. conclusão presente na atestação diverge da resposta física falha com ATTESTATION_SCHEMA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: testAttDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        const jsonPath = path.join(testAttDir, 'final-attestation.json');
        const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        parsed.primary_conclusion = 'failure';
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');

        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'ATTESTATION_SCHEMA_INVALID');
      } finally {
        cleanupAll();
      }
    });

    // 7. ID principal ou remoto diverge
    it('7. ID principal na resposta física diverge de primaryRunId falha com PRIMARY_RESPONSE_DATA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        const pData = JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
        pData.id = 999999999;
        fs.writeFileSync(primaryPath, JSON.stringify(pData, null, 2) + '\n', 'utf8');

        // Rehash
        const pHash = crypto.createHash('sha256').update(fs.readFileSync(primaryPath)).digest('hex');
        const rHash = crypto.createHash('sha256').update(fs.readFileSync(remotePath)).digest('hex');
        fs.writeFileSync(indexPath, `${pHash}  final-primary-run-api-response.json\n${rHash}  final-remote-run-api-response.json\n`, 'utf8');

        assert.throws(() => {
          generateFinalAttestation({
            evidenceDir: tempDir,
            outputDir: testAttDir,
            primaryRunResponse: primaryPath,
            remoteRunResponse: remotePath,
            finalEvidenceIndex: indexPath,
            sha: testSha,
            primaryRunId: 123456789,
            remoteRunId: 987654321,
            actor: 'GitHub Actions',
            classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
          });
        }, /Primary run response ID/);
      } finally {
        cleanupAll();
      }
    });

    // 8. SHA diverge ou está ausente
    it('8. SHA na resposta remota diverge do SHA esperado falha com erro', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        const rData = JSON.parse(fs.readFileSync(remotePath, 'utf8'));
        rData.head_sha = 'b'.repeat(40);
        fs.writeFileSync(remotePath, JSON.stringify(rData, null, 2) + '\n', 'utf8');

        assert.throws(() => {
          generateFinalAttestation({
            evidenceDir: tempDir,
            outputDir: testAttDir,
            primaryRunResponse: primaryPath,
            remoteRunResponse: remotePath,
            finalEvidenceIndex: indexPath,
            sha: testSha,
            primaryRunId: 123456789,
            remoteRunId: 987654321,
            actor: 'GitHub Actions',
            classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
          });
        }, /Remote run response head_sha/);
      } finally {
        cleanupAll();
      }
    });

    // 9. repositório, branch ou workflow divergem
    it('9. repositório divergente na resposta primária falha com PRIMARY_RESPONSE_DATA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: testAttDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        // Mutate primary response repository
        const pData = JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
        pData.repository.full_name = 'evil/repo';
        fs.writeFileSync(primaryPath, JSON.stringify(pData, null, 2) + '\n', 'utf8');

        // Rehash in attestation and index to test semantic check
        const jsonPath = path.join(testAttDir, 'final-attestation.json');
        const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const newPHash = crypto.createHash('sha256').update(fs.readFileSync(primaryPath)).digest('hex');
        parsed.primary_response_sha256 = newPHash;
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');

        const rHash = crypto.createHash('sha256').update(fs.readFileSync(remotePath)).digest('hex');
        fs.writeFileSync(indexPath, `${newPHash}  final-primary-run-api-response.json\n${rHash}  final-remote-run-api-response.json\n`, 'utf8');
        const newIndexHash = crypto.createHash('sha256').update(fs.readFileSync(indexPath)).digest('hex');
        parsed.final_evidence_index_sha256 = newIndexHash;
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');

        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'PRIMARY_RESPONSE_DATA_INVALID');
        assert.match(res.error, /repository/);
      } finally {
        cleanupAll();
      }
    });

    // 10. actor remoto diverge
    it('10. actor remoto diverge falha com REMOTE_ACTOR_MISMATCH', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: testAttDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        const jsonPath = path.join(testAttDir, 'final-attestation.json');
        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'different-actor'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'ATTESTATION_ACTOR_MISMATCH');
      } finally {
        cleanupAll();
      }
    });

    // 11. run_attempt está ausente ou inválido
    it('11. run_attempt inválido na resposta remota falha com REMOTE_RESPONSE_DATA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: testAttDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        const rData = JSON.parse(fs.readFileSync(remotePath, 'utf8'));
        delete rData.run_attempt;
        fs.writeFileSync(remotePath, JSON.stringify(rData, null, 2) + '\n', 'utf8');

        // Update hashes
        const jsonPath = path.join(testAttDir, 'final-attestation.json');
        const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const pHash = crypto.createHash('sha256').update(fs.readFileSync(primaryPath)).digest('hex');
        const newRHash = crypto.createHash('sha256').update(fs.readFileSync(remotePath)).digest('hex');
        parsed.remote_response_sha256 = newRHash;

        fs.writeFileSync(indexPath, `${pHash}  final-primary-run-api-response.json\n${newRHash}  final-remote-run-api-response.json\n`, 'utf8');
        parsed.final_evidence_index_sha256 = crypto.createHash('sha256').update(fs.readFileSync(indexPath)).digest('hex');
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');

        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'REMOTE_RESPONSE_DATA_INVALID');
        assert.match(res.error, /run_attempt/);
      } finally {
        cleanupAll();
      }
    });

    // 12. URL não contém o ID e o repositório esperados
    it('12. URL na resposta primária sem ID esperado falha com PRIMARY_RESPONSE_DATA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: testAttDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        const pData = JSON.parse(fs.readFileSync(primaryPath, 'utf8'));
        pData.html_url = 'https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/999999999';
        fs.writeFileSync(primaryPath, JSON.stringify(pData, null, 2) + '\n', 'utf8');

        const jsonPath = path.join(testAttDir, 'final-attestation.json');
        const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const newPHash = crypto.createHash('sha256').update(fs.readFileSync(primaryPath)).digest('hex');
        const rHash = crypto.createHash('sha256').update(fs.readFileSync(remotePath)).digest('hex');
        parsed.primary_response_sha256 = newPHash;
        fs.writeFileSync(indexPath, `${newPHash}  final-primary-run-api-response.json\n${rHash}  final-remote-run-api-response.json\n`, 'utf8');
        parsed.final_evidence_index_sha256 = crypto.createHash('sha256').update(fs.readFileSync(indexPath)).digest('hex');
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');

        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'PRIMARY_RESPONSE_DATA_INVALID');
        assert.match(res.error, /html_url/);
      } finally {
        cleanupAll();
      }
    });

    // 13. datas estão ausentes, inválidas ou invertidas
    it('13. datas invertidas (created_at > updated_at) na resposta remota falha com REMOTE_RESPONSE_DATA_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: testAttDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        const rData = JSON.parse(fs.readFileSync(remotePath, 'utf8'));
        rData.created_at = '2026-09-17T00:10:00.000Z';
        rData.updated_at = '2026-09-17T00:05:00.000Z'; // created_at > updated_at
        fs.writeFileSync(remotePath, JSON.stringify(rData, null, 2) + '\n', 'utf8');

        const jsonPath = path.join(testAttDir, 'final-attestation.json');
        const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        const pHash = crypto.createHash('sha256').update(fs.readFileSync(primaryPath)).digest('hex');
        const newRHash = crypto.createHash('sha256').update(fs.readFileSync(remotePath)).digest('hex');
        parsed.remote_response_sha256 = newRHash;
        fs.writeFileSync(indexPath, `${pHash}  final-primary-run-api-response.json\n${newRHash}  final-remote-run-api-response.json\n`, 'utf8');
        parsed.final_evidence_index_sha256 = crypto.createHash('sha256').update(fs.readFileSync(indexPath)).digest('hex');
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');

        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'REMOTE_RESPONSE_DATA_INVALID');
        assert.match(res.error, /posterior to updated_at/);
      } finally {
        cleanupAll();
      }
    });

    // 14. hash de qualquer resposta diverge
    it('14. hash da resposta primária diverge da atestação falha com PRIMARY_RESPONSE_HASH_MISMATCH', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: testAttDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        const jsonPath = path.join(testAttDir, 'final-attestation.json');
        const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        parsed.primary_response_sha256 = '0'.repeat(64);
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');

        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'PRIMARY_RESPONSE_HASH_MISMATCH');
      } finally {
        cleanupAll();
      }
    });

    // 15. índice final está ausente ou adulterado
    it('15. índice final com hash divergente falha com FINAL_INDEX_HASH_MISMATCH', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: testAttDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        const jsonPath = path.join(testAttDir, 'final-attestation.json');
        const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        parsed.final_evidence_index_sha256 = 'e'.repeat(64);
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');

        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'FINAL_INDEX_HASH_MISMATCH');
      } finally {
        cleanupAll();
      }
    });

    // 16. alteração de um byte numa resposta final não é detectada
    it('16. alteração de um único byte na resposta remota falha com FINAL_RESPONSE_HASH_MISMATCH', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, indexPath } = setupMockFinalEvidence(testFinalDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: testAttDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          actor: 'GitHub Actions',
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        // Mutate single byte in remote response on disk
        const raw = fs.readFileSync(remotePath, 'utf8');
        fs.writeFileSync(remotePath, raw + ' ', 'utf8');

        const jsonPath = path.join(testAttDir, 'final-attestation.json');
        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'FINAL_RESPONSE_HASH_MISMATCH');
      } finally {
        cleanupAll();
      }
    });

    // 17. artefacto está ausente, duplicado, expirado, vazio ou ligado a outro SHA/run
    it('17. artefacto expirado falha com ATTESTATION_ARTIFACT_INVALID', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, artifactsPath, indexPath } = setupMockFinalEvidence(testFinalDir);
        generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: testAttDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          actor: 'GitHub Actions',
          artifactId: 556677,
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        // Set expired: true
        const artData = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
        artData.artifacts[0].expired = true;
        fs.writeFileSync(artifactsPath, JSON.stringify(artData, null, 2) + '\n', 'utf8');

        // Refresh index so byte-level hash in index matches disk, allowing step 9 to catch expired artifact
        const pHash = crypto.createHash('sha256').update(fs.readFileSync(primaryPath)).digest('hex');
        const rHash = crypto.createHash('sha256').update(fs.readFileSync(remotePath)).digest('hex');
        const aHash = crypto.createHash('sha256').update(fs.readFileSync(artifactsPath)).digest('hex');
        fs.writeFileSync(indexPath, `${pHash}  final-primary-run-api-response.json\n${rHash}  final-remote-run-api-response.json\n${aHash}  final-remote-artifacts-api-response.json\n`, 'utf8');

        // Update attestation final_evidence_index_sha256
        const jsonPath = path.join(testAttDir, 'final-attestation.json');
        const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        parsed.final_evidence_index_sha256 = crypto.createHash('sha256').update(fs.readFileSync(indexPath)).digest('hex');
        fs.writeFileSync(jsonPath, JSON.stringify(parsed, null, 2), 'utf8');
        const res = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          artifactsResponse: artifactsPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          artifactId: 556677,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'ATTESTATION_ARTIFACT_INVALID');
        assert.match(res.error, /expired/);
      } finally {
        cleanupAll();
      }
    });

    // 18. conclusões são fornecidas apenas por CLI, sem prova física
    it('18. invocação sem respostas físicas falha com PRIMARY_RESPONSE_FILE_MISSING', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const res = verifyFinalAttestation({
          attestationPath: path.join(testAttDir, 'final-attestation.json'),
          evidenceDir: tempDir,
          primaryRunResponse: 'nonexistent/final-primary.json',
          remoteRunResponse: 'nonexistent/final-remote.json',
          finalEvidenceIndex: 'nonexistent/final-index.sha256',
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          expectedActor: 'GitHub Actions'
        });
        assert.strictEqual(res.valid, false);
        assert.strictEqual(res.code, 'PRIMARY_RESPONSE_FILE_MISSING');
      } finally {
        cleanupAll();
      }
    });

    // 19. Teste de integração positivo com CLI real (spawnSync) e programático
    it('19. Teste de integração positivo completo com CLI real (spawnSync) e programático', () => {
      try {
        setupMockEvidenceBundle(tempDir);
        const { primaryPath, remotePath, artifactsPath, indexPath } = setupMockFinalEvidence(testFinalDir);

        const generated = generateFinalAttestation({
          evidenceDir: tempDir,
          outputDir: testAttDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          artifactsResponse: artifactsPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          actor: 'GitHub Actions',
          artifactId: 556677,
          classification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });

        assert.strictEqual(generated.primary_status, 'completed');
        assert.strictEqual(generated.primary_conclusion, 'success');
        assert.strictEqual(generated.remote_status, 'completed');
        assert.strictEqual(generated.remote_conclusion, 'success');
        assert.strictEqual(generated.status, 'PASS');

        const jsonPath = path.join(testAttDir, 'final-attestation.json');
        assert.strictEqual(fs.existsSync(jsonPath), true);

        // Programmatic verify
        const verifyRes = verifyFinalAttestation({
          attestationPath: jsonPath,
          evidenceDir: tempDir,
          primaryRunResponse: primaryPath,
          remoteRunResponse: remotePath,
          finalEvidenceIndex: indexPath,
          artifactsResponse: artifactsPath,
          sha: testSha,
          primaryRunId: 123456789,
          remoteRunId: 987654321,
          artifactId: 556677,
          expectedActor: 'GitHub Actions',
          expectedClassification: 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        });
        assert.strictEqual(verifyRes.valid, true);

        // CLI verify
        const cliRes = spawnSync(process.execPath, [
          attestationScriptPath,
          '--attestation', jsonPath,
          '--evidence-dir', tempDir,
          '--primary-run-response', primaryPath,
          '--remote-run-response', remotePath,
          '--final-evidence-index', indexPath,
          '--artifacts-response', artifactsPath,
          '--sha', testSha,
          '--primary-run-id', '123456789',
          '--remote-run-id', '987654321',
          '--artifact-id', '556677',
          '--expected-actor', 'GitHub Actions',
          '--expected-classification', 'PATCH_VERIFIED_AND_CI_ENFORCED_WITH_ADMIN_BYPASS'
        ], { encoding: 'utf8', cwd: root });

        assert.strictEqual(cliRes.status, 0, `CLI verification failed: ${cliRes.stderr}\n${cliRes.stdout}`);
        assert.match(cliRes.stdout, /Final attestation strictly verified/);
        assert.match(cliRes.stdout, /Status: PASS/);
      } finally {
        cleanupAll();
      }
    });
  });

});

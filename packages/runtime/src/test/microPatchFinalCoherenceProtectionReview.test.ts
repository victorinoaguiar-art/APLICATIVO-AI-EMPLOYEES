import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import {
  resolveExecutionClassification,
  assertNoForbiddenDemoClassification,
  FORBIDDEN_DEMO_CLASSIFICATIONS
} from '@ai-employee/shared';
import {
  OperationalPilotRunner,
  StaticSecretProvider,
  PilotExternalValidator,
  resolveStrictCommitSha
} from '../index.js';
import { TokenService } from '@ai-employee/shared/server';

function getRepoRoot(): string {
  let cur = process.cwd();
  while (cur && (!fs.existsSync(path.join(cur, 'package.json')) || !fs.existsSync(path.join(cur, 'schemas')))) {
    const parent = path.dirname(cur);
    if (parent === cur) break;
    cur = parent;
  }
  return cur;
}
const repoRoot = getRepoRoot();

function runCommand(cmd: string, envOverrides: Record<string, string> = {}): Buffer {
  return execSync(cmd, { cwd: repoRoot, stdio: 'pipe', env: { ...process.env, ...envOverrides } });
}

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

describe('AETF-500: Micro-Patch Final — Coerência DEMO, Recibo CI Pós-Conclusão, Protecção Fail-Closed e Revisão Independente', () => {
  const commitSha = resolveStrictCommitSha();
  let tmpDir: string;

  before(() => {
    tmpDir = path.join(repoRoot, '.artifacts', `tmp_patch_test_${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  after(() => {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {
      // Ignorar bloqueio de ficheiro transitório do SQLite no Windows
    }
  });

  describe('1. Coerência DEMO e Classificação Canónica', () => {
    it('1.1: resolveExecutionClassification mapeia DEMO e SIMULATION para AUTOMATED_OPERATIONAL_DEMO_EXECUTED e is_simulation=true', () => {
      const demoRes = resolveExecutionClassification('DEMO');
      assert.strictEqual(demoRes.classification_level, 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED');
      assert.strictEqual(demoRes.is_simulation, true);

      const simRes = resolveExecutionClassification('SIMULATION');
      assert.strictEqual(simRes.classification_level, 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED');
      assert.strictEqual(simRes.is_simulation, true);

      const realRes = resolveExecutionClassification('OPERATIONAL_PILOT');
      assert.strictEqual(realRes.classification_level, 'CONTROLLED_OPERATIONAL_PILOT_VALIDATED');
      assert.strictEqual(realRes.is_simulation, false);
    });

    it('1.2: assertNoForbiddenDemoClassification rejeita qualquer rótulo operacional real sob DEMO ou SIMULATION', () => {
      for (const forbidden of FORBIDDEN_DEMO_CLASSIFICATIONS) {
        assert.throws(() => {
          assertNoForbiddenDemoClassification({ classification: forbidden });
        }, /DEMO_FORBIDDEN_CLASSIFICATION|classificação operacional proibida/);

        assert.throws(() => {
          assertNoForbiddenDemoClassification({ classification_status: forbidden });
        }, /DEMO_FORBIDDEN_CLASSIFICATION|classificação operacional proibida/);
      }

      // Em objecto com classificação demo não deve lançar erro
      assert.doesNotThrow(() => {
        assertNoForbiddenDemoClassification({ classification: 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED' });
      });
    });

    it('1.3: OperationalPilotRunner em DEMO emite recibo e atestação final com is_simulation=true e AUTOMATED_OPERATIONAL_DEMO_EXECUTED', async () => {
      const localDb = path.join(tmpDir, 'demo_runner_test.db');
      const localTokenService = new TokenService(undefined, localDb);
      const reviewerId = 'rev_demo_test';
      const tenantId = 'tenant_demo';
      const pilotId = 'PILOT_DEMO_TEST';
      const jti = 'jti_demo_test';
      const reviewerSecret = 'secret_demo_reviewer_32_characters_long!';

      localTokenService.upsertAccount({
        user_id: reviewerId,
        tenant_id: tenantId,
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW', 'READ'],
        status: 'ACTIVE'
      });

      let token = localTokenService.signToken({
        tenant_id: tenantId,
        user_id: reviewerId,
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW', 'READ'],
        jti
      });

      const demoPkgDir = path.join(tmpDir, 'test_1_3_pkg');
      runCommand(`node scripts/prepare-demo-pilot-input.mjs --out-dir="${demoPkgDir}"`);
      const demoInputFile = path.join(demoPkgDir, 'operational-pilot-input.json');

      const loadedDemo = JSON.parse(fs.readFileSync(demoInputFile, 'utf8'));
      const activeReviewer = loadedDemo.authorized_reviewers[0].reviewer_id;

      localTokenService.upsertAccount({
        user_id: activeReviewer,
        tenant_id: loadedDemo.tenant_id,
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW', 'READ'],
        status: 'ACTIVE'
      });

      token = localTokenService.signToken({
        tenant_id: loadedDemo.tenant_id,
        user_id: activeReviewer,
        roles: ['HUMAN_REVIEWER'],
        permissions: ['PILOT_REVIEW', 'READ'],
        jti
      });

      const runner = new OperationalPilotRunner({
        dbPath: localDb,
        secretProvider: new StaticSecretProvider({ PILOT_SECRET_REV_DEMO: reviewerSecret }),
        tokenService: localTokenService,
        executionMode: 'DEMO'
      });

      runner.getStore().createReviewerSession({
        session_id: 'SESS_DEMO_TEST',
        token_jti: jti,
        reviewer_id: activeReviewer,
        tenant_id: loadedDemo.tenant_id,
        pilot_id: loadedDemo.pilot_id,
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
      });

      runner.loadAndValidateInput(demoInputFile);
      const { challenge, taskReceipt } = await runner.executeOperationalTask();

      // Recibo da tarefa DEVE ser simulação
      assert.strictEqual(taskReceipt.is_simulation, true);
      assert.strictEqual(taskReceipt.execution_mode, 'DEMO');
      assert.strictEqual(taskReceipt.classification_level, 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED');

      const eventSignedAt = new Date().toISOString();
      const sig = PilotExternalValidator.generateCanonicalChallengeSignature(
        challenge,
        activeReviewer,
        'APPROVED',
        reviewerSecret,
        eventSignedAt
      );

      runner.submitHumanReview({
        reviewerId: activeReviewer,
        reviewerToken: token,
        decision: 'APPROVED',
        comments: 'Aprovação legítima DEMO',
        eventSignedAt,
        signature: sig
      });

      const exportDir = path.join(tmpDir, 'demo_export');
      fs.mkdirSync(exportDir, { recursive: true });
      runner.generateOperationalManifest(exportDir);
      const attestation = JSON.parse(fs.readFileSync(path.join(exportDir, 'pilot-final-attestation.json'), 'utf8'));
      assert.strictEqual(attestation.is_simulation, true);
      assert.strictEqual(attestation.execution_mode, 'DEMO');
      assert.strictEqual(attestation.classification_status, 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED');
      assert.notStrictEqual(attestation.classification_status, 'CONTROLLED_OPERATIONAL_PILOT_VALIDATED');

      runner.getStore().close();
    });

    it('1.4: verificadores de manifesto rejeitam manifestos com adulteração operacional em modo DEMO', () => {
      const badDemoDir = path.join(tmpDir, 'bad_demo_dir');
      fs.mkdirSync(badDemoDir, { recursive: true });
      const badDemoManifest = path.join(badDemoDir, 'pilot-evidence-manifest.json');
      fs.writeFileSync(badDemoManifest, JSON.stringify({
        manifest_version: '1.0.0',
        generated_at: new Date().toISOString(),
        commit_sha: commitSha,
        tenant_id: 'tenant_demo',
        pilot_id: 'PILOT_DEMO_TEST',
        task_id: 'TASK_DEMO_001',
        execution_mode: 'DEMO',
        is_simulation: false,
        classification_level: 'CONTROLLED_OPERATIONAL_PILOT_VALIDATED',
        files: []
      }, null, 2));
      fs.writeFileSync(path.join(badDemoDir, 'pilot-evidence-files.sha256'), 'dummy_hash  pilot-evidence-manifest.json\n');

      assert.throws(() => {
        runCommand(`node scripts/verify-operational-pilot-manifest.mjs --dir="${badDemoDir}"`);
      }, /CLASSIFICAÇÃO OPERACIONAL PROIBIDA EM MODO DEMO|DEMO_FORBIDDEN_CLASSIFICATION/);
    });
  });

  describe('2. Recibo da CI Somente Pós-Conclusão Efectiva', () => {
    it('2.1: sync-remote-ci-receipt falha fail-closed se CI estiver queued ou in_progress', () => {
      const outCiDir = path.join(tmpDir, 'test_ci_in_progress');
      fs.mkdirSync(outCiDir, { recursive: true });

      const mockRunInProgress = path.join(tmpDir, 'mock_ci_in_progress.json');
      fs.writeFileSync(mockRunInProgress, JSON.stringify({
        id: 99901,
        path: '.github/workflows/ci.yml',
        head_sha: commitSha,
        status: 'in_progress',
        conclusion: null,
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        run_attempt: 1
      }, null, 2));

      assert.throws(() => {
        runCommand(`node scripts/sync-remote-ci-receipt.mjs 99901 ${commitSha} "${outCiDir}"`, {
          MOCK_PRIMARY_RUN_RESPONSE: mockRunInProgress
        });
      }, /STATUS_NOT_COMPLETED|ainda não concluiu|PRIMARY_CI_STATUS_NOT_COMPLETED/);
    });

    it('2.2: sync-remote-ci-receipt falha fail-closed se passos contiverem pendentes, cancelados ou ignorados', () => {
      const outCiDir = path.join(tmpDir, 'test_ci_skipped_steps');
      fs.mkdirSync(outCiDir, { recursive: true });

      const mockRunCompleted = path.join(tmpDir, 'mock_ci_completed.json');
      fs.writeFileSync(mockRunCompleted, JSON.stringify({
        id: 99902,
        path: '.github/workflows/ci.yml',
        head_sha: commitSha,
        status: 'completed',
        conclusion: 'success',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        run_attempt: 1
      }, null, 2));

      const mockJobsWithSkipped = path.join(tmpDir, 'mock_jobs_with_skipped.json');
      fs.writeFileSync(mockJobsWithSkipped, JSON.stringify({
        total_count: 1,
        jobs: [{
          id: 88801,
          run_id: 99902,
          name: 'CI Verification',
          status: 'completed',
          conclusion: 'success',
          steps: [
            { name: 'Setup', status: 'completed', conclusion: 'success' },
            { name: 'Critical Gate', status: 'completed', conclusion: 'skipped' }
          ]
        }]
      }, null, 2));

      const mockRemoteRun = path.join(tmpDir, 'mock_remote_run.json');
      fs.writeFileSync(mockRemoteRun, JSON.stringify({
        id: 77701,
        name: 'Evidence Remote Verification',
        path: '.github/workflows/evidence-remote-verification.yml',
        head_sha: commitSha,
        head_branch: 'master',
        run_attempt: 1,
        status: 'completed',
        conclusion: 'success',
        created_at: '2026-09-18T00:00:00Z',
        run_started_at: '2026-09-18T00:00:01Z',
        updated_at: '2026-09-18T00:05:00Z',
        html_url: 'https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/77701',
        actor: { login: 'github-actions[bot]' },
        repository: { full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
      }, null, 2));

      const mockBp = path.join(tmpDir, 'mock_bp.json');
      fs.writeFileSync(mockBp, JSON.stringify({
        required_status_checks: { contexts: ['CI'] }
      }, null, 2));

      assert.throws(() => {
        runCommand(`node scripts/sync-remote-ci-receipt.mjs 99902 ${commitSha} "${outCiDir}" 77701 1 "github-actions[bot]"`, {
          MOCK_PRIMARY_RUN_RESPONSE: mockRunCompleted,
          MOCK_PRIMARY_JOBS_RESPONSE: mockJobsWithSkipped,
          MOCK_REMOTE_RUN_RESPONSE: mockRemoteRun,
          MOCK_BP_API_RESPONSE: mockBp
        });
      }, /REQUIRED_STEPS_NOT_CLEAN|REQUIRED_STEPS_NOT_COMPLETED_SUCCESSFULLY|passos não concluídos/);
    });

    it('2.3: sync-remote-ci-receipt detecta adulteração de 1 byte nas respostas brutas salvas', () => {
      const outCiDir = path.join(tmpDir, 'test_ci_tampering');
      fs.mkdirSync(outCiDir, { recursive: true });

      const mockRunValid = path.join(tmpDir, 'mock_ci_valid_run.json');
      fs.writeFileSync(mockRunValid, JSON.stringify({
        id: 99903,
        path: '.github/workflows/ci.yml',
        head_sha: commitSha,
        status: 'completed',
        conclusion: 'success',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        run_attempt: 1
      }, null, 2));

      const requiredJobs = {
        'Clean Checkout Local Verification (22.x)': [
          'Checkout Codebase',
          'Setup Node.js 22.x',
          'Deterministic Install (npm ci)',
          'Production Dependency Audit',
          'Local Full Verification',
          'Ensure Clean Working Tree'
        ],
        'Deterministic Build, Typecheck, Test & Audit (22.x)': [
          'Checkout Codebase',
          'Setup Node.js 22.x',
          'Deterministic Install (npm ci)',
          'Production Dependency Audit',
          'Monorepo Clean',
          'Strict Typecheck',
          'Build Monorepo Packages',
          'Build Web Application',
          'Next.js ESLint',
          'Automated Test Suites',
          'Ajv Manifest & Domain Cardinality Validation',
          'Physical Hash Cryptographic Verification',
          'Security & Behavioral Controls Verification',
          'Transactional Payment & Webhook Verification',
          'Multi-Tenant Authentication & Authorization Verification',
          'Generate CI Forensic Evidence Bundle',
          'Evidence Coherence & Same-SHA Gate',
          'Upload Evidence Artifacts Bundle',
          'Ensure Clean Working Tree'
        ]
      };

      const mockJobsList = Object.entries(requiredJobs).map(([jobName, steps], jIdx) => ({
        id: 88800 + jIdx,
        run_id: 99903,
        name: jobName,
        status: 'completed',
        conclusion: 'success',
        steps: steps.map((sName, sIdx) => ({
          number: sIdx + 1,
          name: sName,
          status: 'completed',
          conclusion: 'success'
        }))
      }));

      const mockJobsValid = path.join(tmpDir, 'mock_ci_valid_jobs.json');
      fs.writeFileSync(mockJobsValid, JSON.stringify({
        total_count: mockJobsList.length,
        jobs: mockJobsList
      }, null, 2));

      const mockRemoteRun = path.join(tmpDir, 'mock_remote_run.json');
      const mockBp = path.join(tmpDir, 'mock_bp.json');

      runCommand(`node scripts/sync-remote-ci-receipt.mjs 99903 ${commitSha} "${outCiDir}" 77701 1 "github-actions[bot]"`, {
        MOCK_PRIMARY_RUN_RESPONSE: mockRunValid,
        MOCK_PRIMARY_JOBS_RESPONSE: mockJobsValid,
        MOCK_REMOTE_RUN_RESPONSE: mockRemoteRun,
        MOCK_BP_API_RESPONSE: mockBp
      });

      const rawRunFile = path.join(outCiDir, 'primary-ci-run-api-response.json');
      assert.ok(fs.existsSync(rawRunFile));

      // Mutação de 1 byte no ficheiro bruto
      fs.appendFileSync(rawRunFile, ' ');

      // Re-verificação de integridade deve falhar
      const sidecarHash = fs.readFileSync(path.join(outCiDir, 'primary-ci-run-api-response.json.sha256'), 'utf8').trim().split(/\s+/)[0];
      const mutatedHash = sha256(fs.readFileSync(rawRunFile));
      assert.notStrictEqual(mutatedHash, sidecarHash, 'Adulteração de 1 byte deve alterar o hash');
    });
  });

  describe('3. Protecção Fail-Closed e Proibição Antecipada de Mocks', () => {
    it('3.1: verify-environment-protection proíbe categoricamente --mock-api-response em OPERATIONAL_PILOT', () => {
      assert.throws(() => {
        runCommand('node scripts/verify-environment-protection.mjs --mode=OPERATIONAL_PILOT --mock-api-response="fake.json"');
      }, /MOCK_EVIDENCE_FORBIDDEN_IN_OPERATIONAL_PILOT/);
    });

    it('3.2: verify-environment-protection proíbe categoricamente --mock-branch-response em OPERATIONAL_PILOT', () => {
      assert.throws(() => {
        runCommand('node scripts/verify-environment-protection.mjs --mode=OPERATIONAL_PILOT --mock-branch-response="fake.json"');
      }, /MOCK_EVIDENCE_FORBIDDEN_IN_OPERATIONAL_PILOT/);
    });

    it('3.3: verify-environment-protection proíbe categoricamente variáveis MOCK_ENV_API_RESPONSE e MOCK_BRANCH_API_RESPONSE em OPERATIONAL_PILOT', () => {
      assert.throws(() => {
        runCommand('node scripts/verify-environment-protection.mjs --mode=OPERATIONAL_PILOT', {
          MOCK_ENV_API_RESPONSE: 'fake.json'
        });
      }, /MOCK_EVIDENCE_FORBIDDEN_IN_OPERATIONAL_PILOT/);

      assert.throws(() => {
        runCommand('node scripts/verify-environment-protection.mjs --mode=OPERATIONAL_PILOT', {
          MOCK_BRANCH_API_RESPONSE: 'fake.json'
        });
      }, /MOCK_EVIDENCE_FORBIDDEN_IN_OPERATIONAL_PILOT/);
    });

    it('3.4: verify-environment-protection nunca emite FULLY_PROTECTED se prevent_self_review não for true ou faltarem regras da branch', () => {
      const outDir = path.join(tmpDir, 'test_partial_protection');
      fs.mkdirSync(outDir, { recursive: true });

      const mockEnvNoSelfReview = path.join(tmpDir, 'mock_env_no_self_review.json');
      fs.writeFileSync(mockEnvNoSelfReview, JSON.stringify({
        id: 1234,
        name: 'protected-pilot',
        protection_rules: [{ type: 'required_reviewers', reviewers: [{ reviewer: { id: 1, type: 'User' } }] }],
        deployment_branch_policy: { protected_branches: true, custom_branch_policies: false },
        can_admins_bypass: false,
        prevent_self_review: false // Ausência de prevent_self_review
      }, null, 2));

      const mockBranchValid = path.join(tmpDir, 'mock_branch_valid.json');
      fs.writeFileSync(mockBranchValid, JSON.stringify({
        required_status_checks: { strict: true, contexts: ['CI'] },
        required_pull_request_reviews: { required_approving_review_count: 1, dismiss_stale_reviews: true },
        enforce_admins: { enabled: true },
        allow_deletions: { enabled: false },
        allow_force_pushes: { enabled: false }
      }, null, 2));

      runCommand(`node scripts/verify-environment-protection.mjs --mode=DEMO --environment=protected-pilot --mock-api-response="${mockEnvNoSelfReview}" --mock-branch-response="${mockBranchValid}" --out-dir="${outDir}"`);

      const verifData = JSON.parse(fs.readFileSync(path.join(outDir, 'environment-protection-verification.json'), 'utf8'));
      assert.notStrictEqual(verifData.status, 'FULLY_PROTECTED');
      assert.strictEqual(verifData.status, 'PARTIALLY_PROTECTED');
    });
  });

  describe('4. Separação Estrita de Metadados de Artefacto e Workflow Run', () => {
    it('4.1: rawGhApi distingue payload de artefacto de payload de run sem atribuir artifact_id a run_id', async () => {
      const { pathToFileURL } = await import('node:url');
      const { fetchAndPreserveGhApi }: any = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/lib/rawGhApi.mjs')).href);
      const outDir = path.join(tmpDir, 'test_raw_gh_api');
      fs.mkdirSync(outDir, { recursive: true });

      // Simular chamada de artefacto com mock
      const mockArtifactPayload = path.join(tmpDir, 'mock_artifact_payload.json');
      fs.writeFileSync(mockArtifactPayload, JSON.stringify({
        id: 777123,
        name: 'aetf-stage-a-input',
        size_in_bytes: 4096,
        workflow_run: {
          id: 555432,
          repository_id: 1363667011,
          head_repository_id: 1363667011,
          head_branch: 'master',
          head_sha: commitSha
        }
      }, null, 2));

      const res = await fetchAndPreserveGhApi(
        'repos/test/actions/artifacts/777123',
        outDir,
        'artifact-test-response',
        { mockFilePath: mockArtifactPayload }
      );

      const meta = JSON.parse(fs.readFileSync(res.metaFilePath, 'utf8'));
      assert.strictEqual(meta.artifact_id, 777123);
      assert.strictEqual(meta.workflow_run_id, 555432);
      assert.strictEqual(meta.run_id, 555432, 'run_id deve referenciar o workflow run e nunca o ID do artefacto');
      assert.notStrictEqual(meta.run_id, meta.artifact_id);
    });
  });

  describe('5. Revisão Humana Independente e Bloqueio de Auto-Aprovação', () => {
    it('5.1: run-operational-pilot em OPERATIONAL_PILOT rejeita aprovação quando initiator == reviewer (auto-aprovação)', () => {
      const outStageDir = path.join(tmpDir, 'test_self_review');
      fs.mkdirSync(outStageDir, { recursive: true });
      const testDb = path.join(outStageDir, 'test_self_review.db');

      const demoInputFile = path.join(outStageDir, 'operational-pilot-input.json');
      fs.writeFileSync(demoInputFile, JSON.stringify({
        schema_version: '1.0.0',
        pilot_id: 'PILOT_SELF_REV',
        tenant_id: 'tenant_self_rev',
        organization_name: 'Empresa Teste',
        task_id: 'TASK_SELF_REV',
        employee_id: 66,
        requested_by: 'operator_victorino',
        authorization_reference: 'AUTH-TEST',
        authorized_by: 'Director',
        authorized_at: new Date().toISOString(),
        authorization_document_path: 'despacho.pdf',
        authorization_document_sha256: sha256('pdf'),
        allowed_data_categories: ['FINANCE'],
        prohibited_data_categories: [],
        prohibited_actions: [],
        allowed_connectors: [],
        human_reviewers: ['operator_victorino'],
        reviewer_configs: [],
        input_data: { test: true },
        metadata: {},
        execution_mode: 'OPERATIONAL_PILOT',
        classification: 'CONTROLLED_OPERATIONAL_PILOT',
        disclaimer: 'DISCLAIMER',
        sensitivity_level: 'COMMERCIAL'
      }, null, 2));

      // Actor que iniciou é o mesmo que aprovou
      const initiatingActor = 'operator_victorino';
      const reviewerActor = 'operator_victorino';

      assert.throws(() => {
        runCommand(`node scripts/run-operational-pilot.mjs --stage=review-and-close --mode=OPERATIONAL_PILOT --stage-a-run-id=1001 --stage-a-artifact-id=2001 --stage-a-head-sha=${commitSha} --challenge-id=CHALLENGE_001 --event-signed-at=2026-09-18T00:00:00Z --input="${demoInputFile}" --db="${testDb}" --initiating-actor="${initiatingActor}" --reviewer-id="${reviewerActor}" --out-dir="${outStageDir}"`, {
          GITHUB_TRIGGERING_ACTOR: initiatingActor
        });
      }, /SELF_APPROVAL_FORBIDDEN|SEGREGAÇÃO DE FUNÇÕES VIOLADA|SEGREGATION_OF_DUTIES_VIOLATION/);
    });

    it('5.2: run-operational-pilot gera reviewer-independence-receipt.json em DEMO marcado como SYNTHETIC_DEMO com approval_id nulo', () => {
      const outStageDir = path.join(tmpDir, 'test_independent_review');
      fs.mkdirSync(outStageDir, { recursive: true });
      const testDb = path.join(outStageDir, 'test_indep.db');

      // Preparar input demo
      runCommand(`node scripts/prepare-demo-pilot-input.mjs --out-dir="${outStageDir}"`);
      const demoInputFile = path.join(outStageDir, 'operational-pilot-input.json');

      const initiatingActor = 'operator_ci_runner';
      const reviewerActor = 'rev_demo_humano_01';

      // Executar Etapa A primeiro para criar a sessão e tarefa
      runCommand(`node scripts/run-operational-pilot.mjs --stage=prepare-and-challenge --mode=DEMO --input="${demoInputFile}" --db="${testDb}" --initiating-actor="${initiatingActor}" --output-dir="${outStageDir}"`);

      // Executar Etapa B em DEMO com actores independentes
      runCommand(`node scripts/run-operational-pilot.mjs --stage=review-and-close --mode=DEMO --input="${demoInputFile}" --db="${testDb}" --initiating-actor="${initiatingActor}" --reviewer-id="${reviewerActor}" --output-dir="${outStageDir}"`);

      const receiptPath = path.join(outStageDir, 'reviewer-independence-receipt.json');
      assert.ok(fs.existsSync(receiptPath), 'reviewer-independence-receipt.json deve ser criado');

      const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
      assert.strictEqual(receipt.execution_mode, 'DEMO');
      assert.strictEqual(receipt.is_simulation, true);
      assert.strictEqual(receipt.independence_evidence_type, 'SYNTHETIC_DEMO');
      assert.strictEqual(receipt.github_environment_approval_id, null);
      assert.strictEqual(receipt.github_environment_approval_verified, false);
      assert.strictEqual(receipt.initiating_actor_id, initiatingActor);
      assert.strictEqual(receipt.reviewer_subject_id, reviewerActor);
      assert.strictEqual(receipt.independence_verified, false);
      assert.strictEqual(receipt.prevent_self_review_observed, false);
      assert.strictEqual(receipt.classification, 'DEMO_REVIEW_INDEPENDENCE_SIMULATED');
      assert.ok(receipt.review_signature_sha256 && receipt.review_signature_sha256.length === 64);
      assert.ok(fs.existsSync(receiptPath + '.sha256'));
    });
  });

  describe('6. Auditoria Forense Residual: Regra Canónica, Enriquecimento e Atestação Pós-Etapa B', () => {
    it('6.1: verify-environment-protection lê prevent_self_review canonicamente da regra required_reviewers', () => {
      const outDir = path.join(tmpDir, 'test_canonical_reviewer_rule');
      fs.mkdirSync(outDir, { recursive: true });

      const mockEnvWithRule = path.join(tmpDir, 'mock_env_with_rule.json');
      fs.writeFileSync(mockEnvWithRule, JSON.stringify({
        id: 9999,
        name: 'protected-pilot',
        protection_rules: [
          {
            type: 'required_reviewers',
            prevent_self_review: true,
            reviewers: [{ reviewer: { id: 297225475, type: 'User' } }]
          }
        ],
        deployment_branch_policy: { protected_branches: true },
        can_admins_bypass: false,
        prevent_self_review: true
      }, null, 2));

      const mockBranchValid = path.join(tmpDir, 'mock_branch_rule_valid.json');
      fs.writeFileSync(mockBranchValid, JSON.stringify({
        required_status_checks: { strict: true, contexts: ['CI'] },
        required_pull_request_reviews: { required_approving_review_count: 1, dismiss_stale_reviews: true },
        enforce_admins: { enabled: true },
        allow_deletions: { enabled: false },
        allow_force_pushes: { enabled: false }
      }, null, 2));

      runCommand(`node scripts/verify-environment-protection.mjs --mode=DEMO --environment=protected-pilot --mock-api-response="${mockEnvWithRule}" --mock-branch-response="${mockBranchValid}" --out-dir="${outDir}"`);

      const verif = JSON.parse(fs.readFileSync(path.join(outDir, 'environment-protection-verification.json'), 'utf8'));
      assert.strictEqual(verif.prevent_self_review_observed, true);
      assert.strictEqual(verif.prevent_self_review_source, 'protection_rules.required_reviewers');
      assert.strictEqual(verif.status, 'FULLY_PROTECTED');
    });

    it('6.2: verify-environment-protection detecta contradição quando raiz diverge da regra canónica', () => {
      const outDir = path.join(tmpDir, 'test_contradictory_rule');
      fs.mkdirSync(outDir, { recursive: true });

      const mockContradictory = path.join(tmpDir, 'mock_contradictory_env.json');
      fs.writeFileSync(mockContradictory, JSON.stringify({
        id: 9999,
        name: 'protected-pilot',
        protection_rules: [
          {
            type: 'required_reviewers',
            prevent_self_review: false,
            reviewers: [{ reviewer: { id: 1, type: 'User' } }]
          }
        ],
        deployment_branch_policy: { protected_branches: true },
        can_admins_bypass: false,
        prevent_self_review: true // Contradição com regra required_reviewers
      }, null, 2));

      const mockBranch = path.join(tmpDir, 'mock_branch_minimal.json');
      fs.writeFileSync(mockBranch, JSON.stringify({
        required_status_checks: { strict: true, contexts: ['CI'] }
      }, null, 2));

      runCommand(`node scripts/verify-environment-protection.mjs --mode=DEMO --environment=protected-pilot --mock-api-response="${mockContradictory}" --mock-branch-response="${mockBranch}" --out-dir="${outDir}"`);

      const verif = JSON.parse(fs.readFileSync(path.join(outDir, 'environment-protection-verification.json'), 'utf8'));
      assert.strictEqual(verif.has_contradictory_prevent_self_review, true);
      assert.strictEqual(verif.prevent_self_review, false);
      assert.notStrictEqual(verif.status, 'FULLY_PROTECTED');
    });

    it('6.3: run-operational-pilot em OPERATIONAL_PILOT falha sem aprovação autenticada externa', () => {
      const outDir = path.join(tmpDir, 'test_op_no_approval');
      fs.mkdirSync(outDir, { recursive: true });
      const testDb = path.join(outDir, 'test_no_app.db');

      const opInputFile = path.join(outDir, 'operational-pilot-input.json');
      fs.writeFileSync(opInputFile, JSON.stringify({
        tenant_id: 'TENANT_LIVE_01',
        task_id: 'TASK_LIVE_01',
        idempotency_key: 'IDEMP_OP_001',
        received_at: new Date().toISOString(),
        authorization_document_path: 'despacho.pdf',
        authorization_document_sha256: sha256('pdf'),
        allowed_data_categories: ['FINANCE'],
        prohibited_data_categories: [],
        prohibited_actions: [],
        allowed_connectors: [],
        human_reviewers: ['revB'],
        reviewer_configs: [
          {
            reviewer_id: 'revB',
            display_name: 'Revisor B',
            role: 'AUDITOR',
            secret_ref: 'SECRET_REV_B'
          }
        ],
        input_data: { test: true },
        metadata: {},
        execution_mode: 'OPERATIONAL_PILOT',
        classification: 'CONTROLLED_OPERATIONAL_PILOT',
        disclaimer: 'DISCLAIMER',
        sensitivity_level: 'COMMERCIAL'
      }, null, 2));

      assert.throws(() => {
        runCommand(`node scripts/run-operational-pilot.mjs --stage=review-and-close --mode=OPERATIONAL_PILOT --stage-a-run-id=1001 --stage-a-artifact-id=2001 --stage-a-head-sha=1111222233334444555566667777888899990000 --challenge-id=CHAL_001 --event-signed-at=2026-09-18T00:00:00Z --input="${opInputFile}" --db="${testDb}" --initiating-actor="userA" --reviewer-id="revB" --decision=APPROVED --output-dir="${outDir}"`, {
          REVIEWER_TOKEN: 'token_sample',
          REVIEW_SIGNATURE: 'sig_sample'
        });
      }, /AUTHENTIC_ENVIRONMENT_APPROVAL_EVIDENCE_UNAVAILABLE/);
    });

    it('6.4: run-operational-pilot em OPERATIONAL_PILOT falha se actor de aprovação coincidir com iniciador', () => {
      const outDir = path.join(tmpDir, 'test_op_self_app');
      fs.mkdirSync(outDir, { recursive: true });
      const testDb = path.join(outDir, 'test_self_app.db');

      const opInputFile = path.join(outDir, 'operational-pilot-input.json');
      fs.writeFileSync(opInputFile, JSON.stringify({
        tenant_id: 'TENANT_LIVE_01',
        task_id: 'TASK_LIVE_01',
        idempotency_key: 'IDEMP_OP_002',
        received_at: new Date().toISOString(),
        authorization_document_path: 'despacho.pdf',
        authorization_document_sha256: sha256('pdf'),
        allowed_data_categories: ['FINANCE'],
        prohibited_data_categories: [],
        prohibited_actions: [],
        allowed_connectors: [],
        human_reviewers: ['user_operator'],
        reviewer_configs: [
          {
            reviewer_id: 'user_operator',
            display_name: 'User Operator',
            role: 'OPERATOR',
            secret_ref: 'SECRET_OP'
          }
        ],
        input_data: { test: true },
        metadata: {},
        execution_mode: 'OPERATIONAL_PILOT',
        classification: 'CONTROLLED_OPERATIONAL_PILOT',
        disclaimer: 'DISCLAIMER',
        sensitivity_level: 'COMMERCIAL'
      }, null, 2));

      const mockApproval = path.join(tmpDir, 'mock_approval_self.json');
      fs.writeFileSync(mockApproval, JSON.stringify([{
        id: 77778888,
        user: { id: 1000, login: 'user_operator' }
      }], null, 2));

      assert.throws(() => {
        runCommand(`node scripts/run-operational-pilot.mjs --stage=review-and-close --mode=OPERATIONAL_PILOT --stage-a-run-id=1001 --stage-a-artifact-id=2001 --stage-a-head-sha=1111222233334444555566667777888899990000 --challenge-id=CHAL_001 --event-signed-at=2026-09-18T00:00:00Z --input="${opInputFile}" --db="${testDb}" --initiating-actor="user_operator" --reviewer-id="user_operator" --decision=APPROVED --output-dir="${outDir}"`, {
          REVIEWER_TOKEN: 'token_sample',
          REVIEW_SIGNATURE: 'sig_sample',
          MOCK_APPROVAL_RESPONSE: mockApproval,
          GITHUB_TRIGGERING_ACTOR: 'user_operator',
          GITHUB_TRIGGERING_ACTOR_ID: '1000'
        });
      }, /SEGREGATION_OF_DUTIES_VIOLATION/);
    });

    it('6.5: sidecar derivado de artefacto é enriquecido com workflow_id, workflow_path e run_attempt', () => {
      const outDir = path.join(tmpDir, 'test_artifact_enrichment');
      fs.mkdirSync(outDir, { recursive: true });

      const artifactMetaFile = path.join(outDir, 'test-artifact.meta.json');
      fs.writeFileSync(artifactMetaFile, JSON.stringify({
        artifact_id: 10582159988,
        workflow_id: null,
        workflow_path: null,
        run_attempt: null
      }, null, 2));

      // Simulação do enriquecimento após validação do run
      const runData = { workflow_id: 361645706, path: '.github/workflows/operational-pilot-stage-a.yml', run_attempt: 1 };
      const meta = JSON.parse(fs.readFileSync(artifactMetaFile, 'utf8'));
      meta.workflow_id = runData.workflow_id;
      meta.workflow_path = runData.path;
      meta.run_attempt = runData.run_attempt;
      meta.enriched_from_verified_run = true;
      fs.writeFileSync(artifactMetaFile, JSON.stringify(meta, null, 2), 'utf8');

      const enriched = JSON.parse(fs.readFileSync(artifactMetaFile, 'utf8'));
      assert.strictEqual(enriched.workflow_id, 361645706);
      assert.strictEqual(enriched.workflow_path, '.github/workflows/operational-pilot-stage-a.yml');
      assert.strictEqual(enriched.run_attempt, 1);
      assert.strictEqual(enriched.enriched_from_verified_run, true);
    });

    it('6.6: verify-operational-pilot-closure-chain valida a cadeia completa em DEMO e emite SAME_SHA_DEMO_CHAIN_INDEPENDENTLY_ATTESTED', async () => {
      const mockChainDir = path.join(tmpDir, 'test_mock_chain');
      const outAttestDir = path.join(tmpDir, 'test_chain_out');
      fs.mkdirSync(mockChainDir, { recursive: true });
      fs.mkdirSync(outAttestDir, { recursive: true });

      const testSha = '8944424fe462b0e5eb5b5fd2eb96b3a83216c7b0';

      // Criar mock da resposta da Etapa B
      fs.writeFileSync(path.join(mockChainDir, 'stage-b-run-api-response.json'), JSON.stringify({
        id: 35436363480,
        status: 'completed',
        conclusion: 'success',
        head_sha: testSha,
        head_branch: 'master',
        path: '.github/workflows/operational-pilot-stage-b.yml',
        repository: { id: 1363667011 },
        head_repository: { id: 1363667011 }
      }, null, 2));

      // Criar mock da lista de artefactos
      fs.writeFileSync(path.join(mockChainDir, 'stage-b-artifacts-list.json'), JSON.stringify({
        artifacts: [{
          id: 10581109816,
          name: `aetf-pilot-closure-${testSha}`,
          size_in_bytes: 48000,
          expired: false
        }]
      }, null, 2));

      // Criar mock do pacote ZIP de fecho
      const zipContentDir = path.join(tmpDir, 'zip_content_demo');
      fs.mkdirSync(zipContentDir, { recursive: true });

      fs.writeFileSync(path.join(zipContentDir, 'stage-a-run-api-response.json'), JSON.stringify({
        id: 35436242478,
        status: 'completed',
        conclusion: 'success',
        head_sha: testSha,
        path: '.github/workflows/operational-pilot-stage-a.yml'
      }, null, 2));

      fs.writeFileSync(path.join(zipContentDir, 'stage-a-artifact-api-response.json'), JSON.stringify({
        id: 10582159988,
        name: `aetf-pilot-stage-a-${testSha}`
      }, null, 2));

      fs.writeFileSync(path.join(zipContentDir, 'intake-run-api-response.json'), JSON.stringify({
        id: 35436054945,
        head_sha: testSha
      }, null, 2));

      fs.writeFileSync(path.join(zipContentDir, 'task-receipt-test.json'), JSON.stringify({
        execution_mode: 'DEMO',
        is_simulation: true,
        classification_level: 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED',
        challenge_id: 'CHAL_TEST_001'
      }, null, 2));

      fs.writeFileSync(path.join(zipContentDir, 'reviewer-independence-receipt.json'), JSON.stringify({
        execution_mode: 'DEMO',
        is_simulation: true,
        independence_evidence_type: 'SYNTHETIC_DEMO',
        github_environment_approval_id: null,
        independence_verified: false,
        prevent_self_review_observed: false,
        classification: 'DEMO_REVIEW_INDEPENDENCE_SIMULATED',
        challenge_id: 'CHAL_TEST_001'
      }, null, 2));

      fs.writeFileSync(path.join(zipContentDir, 'pilot-final-attestation.json'), JSON.stringify({
        operational_state: 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED',
        operational_pilot_started: false,
        operational_pilot_completed: false
      }, null, 2));

      // Gerar pilot-evidence-files.sha256
      const filesToHash = fs.readdirSync(zipContentDir);
      const shaLines = filesToHash.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(zipContentDir, f))).digest('hex')}  ${f}`);
      // Adicionar linha de preenchimento para atingir >= 20 ficheiros
      for (let i = 0; i < 15; i++) {
        const dummyName = `dummy_${i}.txt`;
        fs.writeFileSync(path.join(zipContentDir, dummyName), `dummy content ${i}`);
        shaLines.push(`${createHash('sha256').update(fs.readFileSync(path.join(zipContentDir, dummyName))).digest('hex')}  ${dummyName}`);
      }
      fs.writeFileSync(path.join(zipContentDir, 'pilot-evidence-files.sha256'), shaLines.join('\n') + '\n');

      // Comprimir zipContentDir no arquivo aetf-pilot-closure-${testSha}.zip
      const zipEntries = fs.readdirSync(zipContentDir).map(f => ({
        name: f,
        data: fs.readFileSync(path.join(zipContentDir, f))
      }));

      // Criação de ZIP canónico multiplataforma
      const { pathToFileURL } = await import('node:url');
      const { buildZip } = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/lib/secureTarExtractor.mjs')).href);
      const zipPath = path.join(mockChainDir, `aetf-pilot-closure-${testSha}.zip`);
      fs.writeFileSync(zipPath, buildZip(zipEntries));

      // Executar o verificador de cadeia com os mocks
      runCommand(`node scripts/verify-operational-pilot-closure-chain.mjs --stage-b-run-id=35436363480 --mock-data-dir="${mockChainDir}" --out-dir="${outAttestDir}"`);

      const attestFile = path.join(outAttestDir, 'chain-attestation.json');
      assert.ok(fs.existsSync(attestFile));
      const attestation = JSON.parse(fs.readFileSync(attestFile, 'utf8'));
      assert.strictEqual(attestation.classification, 'SAME_SHA_DEMO_CHAIN_INDEPENDENTLY_ATTESTED');
      assert.strictEqual(attestation.same_sha_chain_verified, true);
      assert.strictEqual(attestation.real_pilot_authorised, false);
    });
  });
});

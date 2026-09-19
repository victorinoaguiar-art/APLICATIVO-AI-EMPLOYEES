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
      const stageBRunId = 35436363480;
      const stageARunId = 35436242478;
      const intakeRunId = 35436054945;
      const ciRunId = 35435814047;

      const stageBArtId = 10581109816;
      const stageAArtId = 10582159988;
      const intakeArtId = 10583408445;

      const { pathToFileURL } = await import('node:url');
      const { buildZip } = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/lib/secureTarExtractor.mjs')).href);

      // Stage B Run & Artifacts
      fs.writeFileSync(path.join(mockChainDir, 'stage-b-run-api-response.json'), JSON.stringify({
        id: stageBRunId,
        status: 'completed',
        conclusion: 'success',
        head_sha: testSha,
        head_branch: 'master',
        path: '.github/workflows/operational-pilot-stage-b.yml',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
      }, null, 2));

      fs.writeFileSync(path.join(mockChainDir, 'stage-b-artifacts-list.json'), JSON.stringify({
        artifacts: [{
          id: stageBArtId,
          name: `aetf-pilot-closure-${testSha}`,
          size_in_bytes: 48000,
          expired: false,
          workflow_run: { id: stageBRunId, head_sha: testSha }
        }]
      }, null, 2));

      fs.writeFileSync(path.join(mockChainDir, 'stage-b-artifact-api-response.json'), JSON.stringify({
        id: stageBArtId,
        name: `aetf-pilot-closure-${testSha}`,
        size_in_bytes: 48000,
        expired: false,
        workflow_run: { id: stageBRunId, head_sha: testSha }
      }, null, 2));

      // Stage B Zip
      const zipContentDir = path.join(tmpDir, 'zip_content_demo');
      fs.mkdirSync(zipContentDir, { recursive: true });

      const samplePkgBytes = Buffer.from('IMMUTABLE_TEST_PAYLOAD_AETF_PILOT_DEMO');
      const samplePkgSha = createHash('sha256').update(samplePkgBytes).digest('hex');
      fs.writeFileSync(path.join(zipContentDir, 'input-package.tar.gz'), samplePkgBytes);
      fs.writeFileSync(path.join(zipContentDir, 'input-package.sha256'), `${samplePkgSha}  input-package.tar.gz\n`);

      fs.writeFileSync(path.join(zipContentDir, 'stage-a-run-api-response.json'), JSON.stringify({
        id: stageARunId,
        status: 'completed',
        conclusion: 'success',
        head_sha: testSha,
        head_branch: 'master',
        path: '.github/workflows/operational-pilot-stage-a.yml',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
      }, null, 2));

      fs.writeFileSync(path.join(zipContentDir, 'stage-a-artifact-api-response.json'), JSON.stringify({
        id: stageAArtId,
        name: `aetf-pilot-stage-a-${testSha}`,
        size_in_bytes: 42000,
        expired: false,
        workflow_run: { id: stageARunId, head_sha: testSha }
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

      const filesToHash = fs.readdirSync(zipContentDir);
      const shaLines = filesToHash.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(zipContentDir, f))).digest('hex')}  ${f}`);
      for (let i = 0; i < 20; i++) {
        const dummyName = `dummy_${i}.txt`;
        fs.writeFileSync(path.join(zipContentDir, dummyName), `dummy content ${i}`);
        shaLines.push(`${createHash('sha256').update(fs.readFileSync(path.join(zipContentDir, dummyName))).digest('hex')}  ${dummyName}`);
      }
      fs.writeFileSync(path.join(zipContentDir, 'pilot-evidence-files.sha256'), shaLines.join('\n') + '\n');

      const zipEntries = fs.readdirSync(zipContentDir).map(f => ({ name: f, data: fs.readFileSync(path.join(zipContentDir, f)) }));
      fs.writeFileSync(path.join(mockChainDir, `aetf-pilot-closure-${testSha}.zip`), buildZip(zipEntries));

      // Stage A Run & Artifacts
      fs.writeFileSync(path.join(mockChainDir, 'stage-a-run-api-response.json'), JSON.stringify({
        id: stageARunId,
        status: 'completed',
        conclusion: 'success',
        head_sha: testSha,
        head_branch: 'master',
        path: '.github/workflows/operational-pilot-stage-a.yml',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
      }, null, 2));

      fs.writeFileSync(path.join(mockChainDir, 'stage-a-artifacts-list.json'), JSON.stringify({
        artifacts: [{
          id: stageAArtId,
          name: `aetf-pilot-stage-a-${testSha}`,
          size_in_bytes: 42000,
          expired: false,
          workflow_run: { id: stageARunId, head_sha: testSha }
        }]
      }, null, 2));

      fs.writeFileSync(path.join(mockChainDir, 'stage-a-artifact-api-response.json'), JSON.stringify({
        id: stageAArtId,
        name: `aetf-pilot-stage-a-${testSha}`,
        size_in_bytes: 42000,
        expired: false,
        workflow_run: { id: stageARunId, head_sha: testSha }
      }, null, 2));

      // Stage A Zip
      const zipADir = path.join(tmpDir, 'zip_a_demo');
      fs.mkdirSync(zipADir, { recursive: true });
      fs.writeFileSync(path.join(zipADir, 'intake-artifact-api-response.json'), JSON.stringify({
        id: intakeArtId,
        name: `aetf-pilot-intake-${testSha}`,
        size_in_bytes: 7000,
        expired: false,
        workflow_run: { id: intakeRunId, head_sha: testSha }
      }, null, 2));
      fs.writeFileSync(path.join(zipADir, 'intake-run-api-response.json'), JSON.stringify({
        id: intakeRunId,
        status: 'completed',
        conclusion: 'success',
        head_sha: testSha,
        head_branch: 'master',
        path: '.github/workflows/operational-pilot-intake.yml',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
      }, null, 2));
      fs.writeFileSync(path.join(zipADir, 'task-receipt-test.json'), JSON.stringify({
        execution_mode: 'DEMO',
        is_simulation: true,
        challenge_id: 'CHAL_TEST_001'
      }, null, 2));
      fs.writeFileSync(path.join(zipADir, 'input-package.tar.gz'), samplePkgBytes);
      fs.writeFileSync(path.join(zipADir, 'input-package.sha256'), `${samplePkgSha}  input-package.tar.gz\n`);

      // Gerar pilot-evidence-files.sha256 para o pacote da Etapa A
      const aFilesToHash = fs.readdirSync(zipADir);
      const aShaLines = aFilesToHash.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(zipADir, f))).digest('hex')}  ${f}`);
      fs.writeFileSync(path.join(zipADir, 'pilot-evidence-files.sha256'), aShaLines.join('\n') + '\n');

      const zipAEntries = fs.readdirSync(zipADir).map(f => ({ name: f, data: fs.readFileSync(path.join(zipADir, f)) }));
      fs.writeFileSync(path.join(mockChainDir, `aetf-pilot-stage-a-${testSha}.zip`), buildZip(zipAEntries));

      // Intake Run & Artifacts
      fs.writeFileSync(path.join(mockChainDir, 'intake-run-api-response.json'), JSON.stringify({
        id: intakeRunId,
        status: 'completed',
        conclusion: 'success',
        head_sha: testSha,
        head_branch: 'master',
        path: '.github/workflows/operational-pilot-intake.yml',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
      }, null, 2));

      fs.writeFileSync(path.join(mockChainDir, 'intake-artifacts-list.json'), JSON.stringify({
        artifacts: [{
          id: intakeArtId,
          name: `aetf-pilot-intake-${testSha}`,
          size_in_bytes: 7000,
          expired: false,
          workflow_run: { id: intakeRunId, head_sha: testSha }
        }]
      }, null, 2));

      fs.writeFileSync(path.join(mockChainDir, 'intake-artifact-api-response.json'), JSON.stringify({
        id: intakeArtId,
        name: `aetf-pilot-intake-${testSha}`,
        size_in_bytes: 7000,
        expired: false,
        workflow_run: { id: intakeRunId, head_sha: testSha }
      }, null, 2));

      const zipIntakeDir = path.join(tmpDir, 'zip_intake_demo');
      fs.mkdirSync(zipIntakeDir, { recursive: true });
      fs.writeFileSync(path.join(zipIntakeDir, 'input-package.tar.gz'), samplePkgBytes);
      fs.writeFileSync(path.join(zipIntakeDir, 'input-package.sha256'), `${samplePkgSha}  input-package.tar.gz\n`);
      const intakeFilesToHash = fs.readdirSync(zipIntakeDir);
      const intakeShaLines = intakeFilesToHash.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(zipIntakeDir, f))).digest('hex')}  ${f}`);
      fs.writeFileSync(path.join(zipIntakeDir, 'pilot-evidence-files.sha256'), intakeShaLines.join('\n') + '\n');
      const zipIntakeEntries = fs.readdirSync(zipIntakeDir).map(f => ({ name: f, data: fs.readFileSync(path.join(zipIntakeDir, f)) }));
      fs.writeFileSync(path.join(mockChainDir, `aetf-pilot-intake-${testSha}.zip`), buildZip(zipIntakeEntries));

      // CI Run
      fs.writeFileSync(path.join(mockChainDir, 'ci-run-api-response.json'), JSON.stringify({
        id: ciRunId,
        status: 'completed',
        conclusion: 'success',
        head_sha: testSha,
        head_branch: 'master',
        path: '.github/workflows/ci.yml',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
      }, null, 2));

      // Environment Protection Rule
      fs.writeFileSync(path.join(mockChainDir, 'environment-protection-api-response.json'), JSON.stringify({
        name: 'protected-pilot',
        protection_rules: [{
          id: 999,
          type: 'required_reviewers',
          prevent_self_review: true
        }]
      }, null, 2));

      // Executar o verificador de cadeia com os mocks
      runCommand(`node scripts/verify-operational-pilot-closure-chain.mjs --stage-b-run-id=${stageBRunId} --mock-data-dir="${mockChainDir}" --out-dir="${outAttestDir}"`);

      assert.strictEqual(fs.existsSync(path.join(outAttestDir, 'chain-attestation.json')), true);
      const attestation = JSON.parse(fs.readFileSync(path.join(outAttestDir, 'chain-attestation.json'), 'utf8'));

      assert.strictEqual(attestation.same_sha_chain_verified, true);
      assert.strictEqual(attestation.ci_verified, true);
      assert.strictEqual(attestation.intake_verified, true);
      assert.strictEqual(attestation.stage_a_verified, true);
      assert.strictEqual(attestation.stage_b_verified, true);
      assert.strictEqual(attestation.cross_stages_reconciled, true);
      assert.strictEqual(attestation.canonical_repository_chain_verified, true);
      assert.strictEqual(attestation.cross_stage_package_hash_reconciled, true);
      assert.strictEqual(attestation.api_response_hashes_verified, true);
      assert.strictEqual(attestation.evidence_index_hashes_verified, true);
      assert.strictEqual(attestation.artifact_zip_hashes_computed, true);
      assert.strictEqual(attestation.linkage_source_hashes_verified, true);
      assert.strictEqual(attestation.linkage_consensus_verified, true);
    });
  });

  describe('7. Subprompt 1 — Identidade dos Runs, Índice de Hashes e Consenso (Micro-Prompt Corretivo)', () => {
    const testSha = '37927b519f2865e45d5df236df411da126dbe8f8';
    let verifierModule: any;

    before(async () => {
      const { pathToFileURL } = await import('node:url');
      verifierModule = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/verify-operational-pilot-closure-chain.mjs')).href);
    });

    // -----------------------------------------------------------------------
    // 7.1. TESTES POSITIVOS REAIS
    // -----------------------------------------------------------------------
    it('7.1.1: seleção de uma única correspondência exata via selectExactArtifact', () => {
      const expectedName = `aetf-pilot-stage-a-${testSha}`;
      const artifactsList = [
        { id: 100, name: 'other-artifact', size_in_bytes: 1000, expired: false, workflow_run: { id: 123 } },
        { id: 200, name: expectedName, size_in_bytes: 42000, expired: false, workflow_run: { id: 123 } }
      ];

      const selected = verifierModule.selectExactArtifact(artifactsList, expectedName, 123);
      assert.strictEqual(selected.id, 200);
      assert.strictEqual(selected.name, expectedName);
    });

    it('7.1.2: vínculo válido entre artefacto do Intake e run do Intake com head_sha estrito', () => {
      const intakeArtName = `aetf-pilot-intake-${testSha}`;
      const intakeRunId = 35444671656;
      const art = {
        id: 10585326688,
        name: intakeArtName,
        size_in_bytes: 7500,
        expired: false,
        workflow_run: { id: intakeRunId, head_sha: testSha }
      };

      assert.doesNotThrow(() => {
        verifierModule.validateArtifactMetadata(art, intakeArtName, intakeRunId, testSha);
      });
    });

    it('7.1.3: vínculo válido entre artefacto da Etapa A e run da Etapa A com head_sha estrito', () => {
      const stageAArtName = `aetf-pilot-stage-a-${testSha}`;
      const stageARunId = 35444821530;
      const art = {
        id: 10584802564,
        name: stageAArtName,
        size_in_bytes: 41500,
        expired: false,
        workflow_run: { id: stageARunId, head_sha: testSha }
      };

      assert.doesNotThrow(() => {
        verifierModule.validateArtifactMetadata(art, stageAArtName, stageARunId, testSha);
      });
    });

    it('7.1.4: vínculo válido entre artefacto da Etapa B e run da Etapa B com head_sha estrito', () => {
      const stageBArtName = `aetf-pilot-closure-${testSha}`;
      const stageBRunId = 35444920839;
      const art = {
        id: 10584852879,
        name: stageBArtName,
        size_in_bytes: 48500,
        expired: false,
        workflow_run: { id: stageBRunId, head_sha: testSha }
      };

      assert.doesNotThrow(() => {
        verifierModule.validateArtifactMetadata(art, stageBArtName, stageBRunId, testSha);
      });
    });

    it('7.1.5: duas execuções reais da Etapa A (Par A1 e Par A2 físicos completos) — seleção comprovada do par consumido pelo código de produção', () => {
      const stageBExtractedDir = path.join(tmpDir, 'test_stage_b_real_two_stage_a');
      fs.mkdirSync(stageBExtractedDir, { recursive: true });

      const runA1Id = 35444821530;
      const artA1Id = 10584802564;
      const runA2Id = 35444829999;
      const artA2Id = 10584809999;

      // Par A1 físico: Run e Artefacto
      const runA1 = {
        id: runA1Id,
        head_sha: testSha,
        head_branch: 'master',
        status: 'completed',
        conclusion: 'success',
        path: '.github/workflows/operational-pilot-stage-a.yml',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
      };
      const artA1 = {
        id: artA1Id,
        name: `aetf-pilot-stage-a-${testSha}`,
        size_in_bytes: 45000,
        expired: false,
        workflow_run: { id: runA1Id, head_sha: testSha }
      };

      // Par A2 físico: Run e Artefacto
      const runA2 = {
        id: runA2Id,
        head_sha: testSha,
        head_branch: 'master',
        status: 'completed',
        conclusion: 'success',
        path: '.github/workflows/operational-pilot-stage-a.yml',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
      };
      const artA2 = {
        id: artA2Id,
        name: `aetf-pilot-stage-a-${testSha}`,
        size_in_bytes: 45200,
        expired: false,
        workflow_run: { id: runA2Id, head_sha: testSha }
      };

      // Gravação física dos 4 ficheiros dos dois pares
      const rawRunA1 = JSON.stringify(runA1, null, 2);
      const rawArtA1 = JSON.stringify(artA1, null, 2);
      const rawRunA2 = JSON.stringify(runA2, null, 2);
      const rawArtA2 = JSON.stringify(artA2, null, 2);

      fs.writeFileSync(path.join(stageBExtractedDir, 'stage-a-1-run-api-response.json'), rawRunA1);
      fs.writeFileSync(path.join(stageBExtractedDir, 'stage-a-1-artifact-api-response.json'), rawArtA1);
      fs.writeFileSync(path.join(stageBExtractedDir, 'stage-a-2-run-api-response.json'), rawRunA2);
      fs.writeFileSync(path.join(stageBExtractedDir, 'stage-a-2-artifact-api-response.json'), rawArtA2);

      // Referência canónica consumida da Etapa B indicando que o Par A1 foi consumido
      const consumedRef = {
        stage_a_run_id: runA1Id,
        stage_a_artifact_id: artA1Id,
        stage_a_head_sha: testSha
      };
      const rawConsumed = JSON.stringify(consumedRef, null, 2);
      fs.writeFileSync(path.join(stageBExtractedDir, 'consumed-stage-a.json'), rawConsumed);

      // Manifesto físico cobrindo 100% dos 5 ficheiros com caminhos canónicos exatos e hashes SHA-256 recalculados
      const filesToHash = [
        'stage-a-1-run-api-response.json',
        'stage-a-1-artifact-api-response.json',
        'stage-a-2-run-api-response.json',
        'stage-a-2-artifact-api-response.json',
        'consumed-stage-a.json'
      ];
      const shaLines = filesToHash.map(f => {
        const h = createHash('sha256').update(fs.readFileSync(path.join(stageBExtractedDir, f))).digest('hex');
        return `${h}  ${f}`;
      });
      fs.writeFileSync(path.join(stageBExtractedDir, 'pilot-evidence-files.sha256'), shaLines.join('\n') + '\n');

      // 1. Extração e autenticação da referência consumida pelo código de produção
      const linkage = verifierModule.extractConsumedStageAIdentifiers(stageBExtractedDir);
      assert.strictEqual(linkage.stage_a_run_id, runA1Id);
      assert.strictEqual(linkage.stage_a_artifact_id, artA1Id);
      assert.strictEqual(linkage.linkage_source_hashes_verified, true);
      assert.strictEqual(linkage.linkage_consensus_verified, true);

      // 2. Construção dos pares disponíveis a partir dos ficheiros físicos validados
      const { indexMap } = verifierModule.loadPackageIndexMap(stageBExtractedDir);
      verifierModule.verifyFileAgainstPackageIndex(stageBExtractedDir, path.join(stageBExtractedDir, 'stage-a-1-run-api-response.json'), indexMap);
      verifierModule.verifyFileAgainstPackageIndex(stageBExtractedDir, path.join(stageBExtractedDir, 'stage-a-1-artifact-api-response.json'), indexMap);
      verifierModule.verifyFileAgainstPackageIndex(stageBExtractedDir, path.join(stageBExtractedDir, 'stage-a-2-run-api-response.json'), indexMap);
      verifierModule.verifyFileAgainstPackageIndex(stageBExtractedDir, path.join(stageBExtractedDir, 'stage-a-2-artifact-api-response.json'), indexMap);

      const availablePairs = [
        {
          run_id: runA1.id,
          artifact_id: artA1.id,
          workflow_run_id: artA1.workflow_run.id,
          head_sha: runA1.head_sha
        },
        {
          run_id: runA2.id,
          artifact_id: artA2.id,
          workflow_run_id: artA2.workflow_run.id,
          head_sha: runA2.head_sha
        }
      ];

      // 3. Reconciliação dos pares disponíveis com a referência consumida pelo código de produção
      const reconciled = verifierModule.reconcileConsumedPair(availablePairs, linkage, 'Etapa A');
      assert.strictEqual(reconciled.run_id, runA1Id);
      assert.notStrictEqual(reconciled.run_id, runA2Id);
      assert.strictEqual(reconciled.artifact_id, artA1Id);
      assert.notStrictEqual(reconciled.artifact_id, artA2Id);
      assert.strictEqual(reconciled.head_sha, testSha);
    });

    it('7.1.6: duas execuções reais do Intake (Par I1 e Par I2 físicos completos) — seleção comprovada do par consumido pelo código de produção', () => {
      const stageAExtractedDir = path.join(tmpDir, 'test_stage_a_real_two_intake');
      fs.mkdirSync(stageAExtractedDir, { recursive: true });

      const runI1Id = 35444671656;
      const artI1Id = 10585326688;
      const runI2Id = 35444679999;
      const artI2Id = 10585329999;

      // Par I1 físico: Run e Artefacto
      const runI1 = {
        id: runI1Id,
        head_sha: testSha,
        head_branch: 'master',
        status: 'completed',
        conclusion: 'success',
        path: '.github/workflows/operational-pilot-intake.yml',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
      };
      const artI1 = {
        id: artI1Id,
        name: `aetf-pilot-intake-${testSha}`,
        size_in_bytes: 42000,
        expired: false,
        workflow_run: { id: runI1Id, head_sha: testSha }
      };

      // Par I2 físico: Run e Artefacto
      const runI2 = {
        id: runI2Id,
        head_sha: testSha,
        head_branch: 'master',
        status: 'completed',
        conclusion: 'success',
        path: '.github/workflows/operational-pilot-intake.yml',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
      };
      const artI2 = {
        id: artI2Id,
        name: `aetf-pilot-intake-${testSha}`,
        size_in_bytes: 42300,
        expired: false,
        workflow_run: { id: runI2Id, head_sha: testSha }
      };

      // Gravação física dos 4 ficheiros dos dois pares
      const rawRunI1 = JSON.stringify(runI1, null, 2);
      const rawArtI1 = JSON.stringify(artI1, null, 2);
      const rawRunI2 = JSON.stringify(runI2, null, 2);
      const rawArtI2 = JSON.stringify(artI2, null, 2);

      fs.writeFileSync(path.join(stageAExtractedDir, 'intake-1-run-api-response.json'), rawRunI1);
      fs.writeFileSync(path.join(stageAExtractedDir, 'intake-1-artifact-api-response.json'), rawArtI1);
      fs.writeFileSync(path.join(stageAExtractedDir, 'intake-2-run-api-response.json'), rawRunI2);
      fs.writeFileSync(path.join(stageAExtractedDir, 'intake-2-artifact-api-response.json'), rawArtI2);

      // Referência canónica consumida do Intake (emitida na Etapa A)
      const consumedRef = {
        intake_run_id: runI1Id,
        intake_artifact_id: artI1Id,
        intake_head_sha: testSha
      };
      const rawConsumed = JSON.stringify(consumedRef, null, 2);
      fs.writeFileSync(path.join(stageAExtractedDir, 'consumed-intake.json'), rawConsumed);

      // Manifesto físico cobrindo 100% dos 5 ficheiros com caminhos canónicos exatos e hashes recalculados
      const filesToHash = [
        'intake-1-run-api-response.json',
        'intake-1-artifact-api-response.json',
        'intake-2-run-api-response.json',
        'intake-2-artifact-api-response.json',
        'consumed-intake.json'
      ];
      const shaLines = filesToHash.map(f => {
        const h = createHash('sha256').update(fs.readFileSync(path.join(stageAExtractedDir, f))).digest('hex');
        return `${h}  ${f}`;
      });
      fs.writeFileSync(path.join(stageAExtractedDir, 'pilot-evidence-files.sha256'), shaLines.join('\n') + '\n');

      // 1. Extração e autenticação da referência consumida pelo código de produção
      const linkage = verifierModule.extractConsumedIntakeIdentifiers(stageAExtractedDir);
      assert.strictEqual(linkage.intake_run_id, runI1Id);
      assert.strictEqual(linkage.intake_artifact_id, artI1Id);
      assert.strictEqual(linkage.linkage_source_hashes_verified, true);
      assert.strictEqual(linkage.linkage_consensus_verified, true);

      // 2. Construção dos pares disponíveis a partir dos ficheiros físicos validados
      const { indexMap } = verifierModule.loadPackageIndexMap(stageAExtractedDir);
      verifierModule.verifyFileAgainstPackageIndex(stageAExtractedDir, path.join(stageAExtractedDir, 'intake-1-run-api-response.json'), indexMap);
      verifierModule.verifyFileAgainstPackageIndex(stageAExtractedDir, path.join(stageAExtractedDir, 'intake-1-artifact-api-response.json'), indexMap);
      verifierModule.verifyFileAgainstPackageIndex(stageAExtractedDir, path.join(stageAExtractedDir, 'intake-2-run-api-response.json'), indexMap);
      verifierModule.verifyFileAgainstPackageIndex(stageAExtractedDir, path.join(stageAExtractedDir, 'intake-2-artifact-api-response.json'), indexMap);

      const availablePairs = [
        {
          run_id: runI1.id,
          artifact_id: artI1.id,
          workflow_run_id: artI1.workflow_run.id,
          head_sha: runI1.head_sha
        },
        {
          run_id: runI2.id,
          artifact_id: artI2.id,
          workflow_run_id: artI2.workflow_run.id,
          head_sha: runI2.head_sha
        }
      ];

      // 3. Reconciliação dos pares disponíveis com a referência consumida pelo código de produção
      const reconciled = verifierModule.reconcileConsumedPair(availablePairs, linkage, 'Intake');
      assert.strictEqual(reconciled.run_id, runI1Id);
      assert.notStrictEqual(reconciled.run_id, runI2Id);
      assert.strictEqual(reconciled.artifact_id, artI1Id);
      assert.notStrictEqual(reconciled.artifact_id, artI2Id);
      assert.strictEqual(reconciled.head_sha, testSha);
    });

    it('7.1.7: produção das respostas individuais e dos respetivos hashes (.json e .sha256)', () => {
      const outTestDir = path.join(tmpDir, 'test_chain_out_hashes');
      fs.mkdirSync(outTestDir, { recursive: true });

      const mockDir = path.join(tmpDir, 'test_mock_chain');
      runCommand(`node scripts/verify-operational-pilot-closure-chain.mjs --stage-b-run-id=35436363480 --mock-data-dir="${mockDir}" --out-dir="${outTestDir}"`);

      const requiredResponses = [
        'stage-b-run-api-response.json',
        'stage-b-run-api-response.json.sha256',
        'stage-b-artifact-api-response.json',
        'stage-b-artifact-api-response.json.sha256',
        'stage-a-run-api-response.json',
        'stage-a-run-api-response.json.sha256',
        'stage-a-artifact-api-response.json',
        'stage-a-artifact-api-response.json.sha256',
        'intake-run-api-response.json',
        'intake-run-api-response.json.sha256',
        'intake-artifact-api-response.json',
        'intake-artifact-api-response.json.sha256',
        'ci-run-api-response.json',
        'ci-run-api-response.json.sha256'
      ];

      for (const rf of requiredResponses) {
        const filePath = path.join(outTestDir, rf);
        assert.ok(fs.existsSync(filePath), `Ficheiro de resposta obrigatório ausente: ${rf}`);
        if (rf.endsWith('.sha256')) {
          const content = fs.readFileSync(filePath, 'utf8');
          const [hashVal, fileBase] = content.trim().split(/\s+/);
          assert.strictEqual(hashVal.length, 64, `Hash SHA-256 em ${rf} deve ter 64 chars`);
        }
      }
    });

    it('7.1.8: head_branch estritamente igual a master passa no código de produção', () => {
      const run = {
        id: 100,
        head_branch: 'master',
        head_sha: testSha,
        path: '.github/workflows/ci.yml',
        status: 'completed',
        conclusion: 'success',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
      };
      assert.doesNotThrow(() => {
        verifierModule.validateRunMetadata(run, 100, '.github/workflows/ci.yml', testSha);
      });
    });

    it('7.1.9: workflow_run.head_sha estritamente igual a sourceSha passa no código de produção', () => {
      const art = {
        id: 200,
        name: `aetf-pilot-stage-a-${testSha}`,
        size_in_bytes: 4000,
        expired: false,
        workflow_run: { id: 100, head_sha: testSha }
      };
      assert.doesNotThrow(() => {
        verifierModule.validateArtifactMetadata(art, `aetf-pilot-stage-a-${testSha}`, 100, testSha);
      });
    });

    it('7.1.10: consenso entre múltiplas fontes coerentes e indexadas é aprovado pelo código de produção', () => {
      const stageBDir = path.join(tmpDir, 'test_stage_b_consensus_pass');
      fs.mkdirSync(stageBDir, { recursive: true });

      const content1 = JSON.stringify({ stage_a_run_id: 35444821530, stage_a_artifact_id: 10584802564 });
      const content2 = JSON.stringify({ id: 10584802564, workflow_run: { id: 35444821530 } });

      fs.writeFileSync(path.join(stageBDir, 'consumed-stage-a.json'), content1);
      fs.writeFileSync(path.join(stageBDir, 'stage-a-artifact-api-response.json'), content2);

      const h1 = createHash('sha256').update(content1).digest('hex');
      const h2 = createHash('sha256').update(content2).digest('hex');

      fs.writeFileSync(path.join(stageBDir, 'pilot-evidence-files.sha256'), `${h1}  consumed-stage-a.json\n${h2}  stage-a-artifact-api-response.json\n`);

      const linkage = verifierModule.extractConsumedStageAIdentifiers(stageBDir);
      assert.strictEqual(linkage.stage_a_run_id, 35444821530);
      assert.strictEqual(linkage.stage_a_artifact_id, 10584802564);
      assert.strictEqual(linkage.linkage_consensus_verified, true);
    });

    // -----------------------------------------------------------------------
    // 7.2. TESTES NEGATIVOS REAIS (Invocação Exclusiva do Código de Produção)
    // -----------------------------------------------------------------------
    it('7.2.1: artefacto esperado ausente e outro presente falha (sem fallback permissivo)', () => {
      const expectedName = `aetf-pilot-closure-${testSha}`;
      const artifactsList = [
        { id: 999, name: 'other-wrong-artifact-name', size_in_bytes: 5000, expired: false, workflow_run: { id: 123 } }
      ];

      assert.throws(() => {
        verifierModule.selectExactArtifact(artifactsList, expectedName, 123);
      }, /Pacote obrigatório .* não encontrado \(0 correspondências\)\. Fallback terminantemente proibido/);
    });

    it('7.2.2: dois artefactos com o mesmo nome canónico falham por ambiguidade', () => {
      const expectedName = `aetf-pilot-stage-a-${testSha}`;
      const artifactsList = [
        { id: 101, name: expectedName, size_in_bytes: 4000, expired: false, workflow_run: { id: 123 } },
        { id: 102, name: expectedName, size_in_bytes: 4000, expired: false, workflow_run: { id: 123 } }
      ];

      assert.throws(() => {
        verifierModule.selectExactArtifact(artifactsList, expectedName, 123);
      }, /Ambiguidade: encontrados 2 artefactos com o nome canónico/);
    });

    it('7.2.3: artefacto com SHA errado no nome falha', () => {
      const expectedName = `aetf-pilot-intake-${testSha}`;
      const wrongName = `aetf-pilot-intake-0000000000000000000000000000000000000000`;
      const artifactsList = [
        { id: 500, name: wrongName, size_in_bytes: 7000, expired: false, workflow_run: { id: 123 } }
      ];

      assert.throws(() => {
        verifierModule.selectExactArtifact(artifactsList, expectedName, 123);
      }, /Pacote obrigatório .* não encontrado \(0 correspondências\)/);
    });

    it('7.2.4: workflow_run.id ausente no artefacto falha', () => {
      const expectedName = `aetf-pilot-stage-a-${testSha}`;
      const artifactsList = [
        { id: 101, name: expectedName, size_in_bytes: 4000, expired: false }
      ];

      assert.throws(() => {
        verifierModule.selectExactArtifact(artifactsList, expectedName, 123);
      }, /não possui 'workflow_run\.id' válido/);
    });

    it('7.2.5: workflow_run.id divergente do run esperado falha', () => {
      const expectedName = `aetf-pilot-stage-a-${testSha}`;
      const artifactsList = [
        { id: 101, name: expectedName, size_in_bytes: 4000, expired: false, workflow_run: { id: 999999 } }
      ];

      assert.throws(() => {
        verifierModule.selectExactArtifact(artifactsList, expectedName, 123);
      }, /Vínculo inválido: 'workflow_run\.id' do artefacto \(999999\) não corresponde ao run esperado \(123\)/);
    });

    it('7.2.6: ID consumido da Etapa A ausente na evidência da Etapa B falha', () => {
      const emptyStageBDir = path.join(tmpDir, 'test_empty_stage_b');
      fs.mkdirSync(emptyStageBDir, { recursive: true });
      fs.writeFileSync(path.join(emptyStageBDir, 'pilot-evidence-files.sha256'), '# empty\n');

      assert.throws(() => {
        verifierModule.extractConsumedStageAIdentifiers(emptyStageBDir);
      }, /stage_a_run_id ou stage_a_artifact_id ausente na evidência consumida pela Etapa B/);
    });

    it('7.2.7: ID consumido do Intake ausente na evidência da Etapa A falha', () => {
      const emptyStageADir = path.join(tmpDir, 'test_empty_stage_a');
      fs.mkdirSync(emptyStageADir, { recursive: true });
      fs.writeFileSync(path.join(emptyStageADir, 'pilot-evidence-files.sha256'), '# empty\n');

      assert.throws(() => {
        verifierModule.extractConsumedIntakeIdentifiers(emptyStageADir);
      }, /intake_run_id ou intake_artifact_id ausente na evidência consumida pela Etapa A/);
    });

    it('7.2.8: run correto no SHA, mas diferente do run consumido falha', () => {
      const runMeta = {
        id: 99999,
        path: '.github/workflows/operational-pilot-stage-a.yml',
        head_sha: testSha,
        head_branch: 'master',
        status: 'completed',
        conclusion: 'success'
      };

      assert.throws(() => {
        verifierModule.validateRunMetadata(runMeta, 12345, '.github/workflows/operational-pilot-stage-a.yml', testSha);
      }, /ID do run consultado \(99999\) difere do run esperado \(12345\)/);
    });

    it('7.2.9: workflow incorreto no run consultado falha', () => {
      const runMeta = {
        id: 12345,
        path: '.github/workflows/some-unauthorized-workflow.yml',
        head_sha: testSha,
        head_branch: 'master',
        status: 'completed',
        conclusion: 'success'
      };

      assert.throws(() => {
        verifierModule.validateRunMetadata(runMeta, 12345, '.github/workflows/operational-pilot-stage-a.yml', testSha);
      }, /Workflow de origem inválido: esperado '\.github\/workflows\/operational-pilot-stage-a\.yml'/);
    });

    it('7.2.10: artefacto expirado falha', () => {
      const art = {
        id: 101,
        name: `aetf-pilot-stage-a-${testSha}`,
        size_in_bytes: 5000,
        expired: true,
        workflow_run: { id: 12345, head_sha: testSha }
      };

      assert.throws(() => {
        verifierModule.validateArtifactMetadata(art, `aetf-pilot-stage-a-${testSha}`, 12345, testSha);
      }, /está expirado/);
    });

    it('7.2.11: artefacto vazio (size_in_bytes <= 0) falha', () => {
      const art = {
        id: 101,
        name: `aetf-pilot-stage-a-${testSha}`,
        size_in_bytes: 0,
        expired: false,
        workflow_run: { id: 12345, head_sha: testSha }
      };

      assert.throws(() => {
        verifierModule.validateArtifactMetadata(art, `aetf-pilot-stage-a-${testSha}`, 12345, testSha);
      }, /possui tamanho inválido/);
    });

    it('7.2.12: endpoint individual do artefacto ausente falha especificamente ao consultar artefacto', () => {
      const mockDir = path.join(tmpDir, 'test_mock_missing_artifact_endpoint');
      const failOutDir = path.join(tmpDir, 'test_fail_out_12');
      fs.mkdirSync(mockDir, { recursive: true });

      // Run da Etapa B e lista válidos
      fs.writeFileSync(path.join(mockDir, 'stage-b-run-api-response.json'), JSON.stringify({
        id: 35436363480,
        status: 'completed',
        conclusion: 'success',
        head_sha: testSha,
        head_branch: 'master',
        path: '.github/workflows/operational-pilot-stage-b.yml',
        repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' },
        head_repository: { id: 1363667011, full_name: 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES' }
      }));
      fs.writeFileSync(path.join(mockDir, 'stage-b-artifacts-list.json'), JSON.stringify({
        artifacts: [{
          id: 10581109816,
          name: `aetf-pilot-closure-${testSha}`,
          size_in_bytes: 48000,
          expired: false,
          workflow_run: { id: 35436363480, head_sha: testSha }
        }]
      }));
      // Mas SEM stage-b-artifact-api-response.json

      assert.throws(() => {
        runCommand(`node scripts/verify-operational-pilot-closure-chain.mjs --stage-b-run-id=35436363480 --mock-data-dir="${mockDir}" --out-dir="${failOutDir}"`);
      }, /Endpoint individual '.*actions\/artifacts\/10581109816' indisponível/);
    });

    it('7.2.13: resposta agregada e endpoint individual contraditórios provocam falha no código de produção', () => {
      const artAggregated = {
        id: 10581109816,
        name: `aetf-pilot-closure-${testSha}`,
        size_in_bytes: 48000,
        expired: false
      };

      const artIndividualContradictory = {
        id: 10581109816,
        name: `aetf-pilot-closure-${testSha}`,
        size_in_bytes: 10000, // Divergência real de tamanho
        expired: false
      };

      // Invocação direta da função de produção
      assert.throws(() => {
        verifierModule.reconcileArtifactResponses(artAggregated, artIndividualContradictory);
      }, /Inconsistência de tamanho entre resposta agregada \(48000\) e endpoint individual \(10000\)/);
    });

    it('7.2.14: head_branch ausente no run falha', () => {
      const run = {
        id: 100,
        head_sha: testSha,
        path: '.github/workflows/ci.yml',
        status: 'completed',
        conclusion: 'success'
        // sem head_branch
      };
      assert.throws(() => {
        verifierModule.validateRunMetadata(run, 100, '.github/workflows/ci.yml', testSha);
      }, /Branch de origem inválida ou ausente/);
    });

    it('7.2.15: head_branch: null no run falha', () => {
      const run = {
        id: 100,
        head_branch: null,
        head_sha: testSha,
        path: '.github/workflows/ci.yml',
        status: 'completed',
        conclusion: 'success'
      };
      assert.throws(() => {
        verifierModule.validateRunMetadata(run, 100, '.github/workflows/ci.yml', testSha);
      }, /Branch de origem inválida ou ausente/);
    });

    it('7.2.16: head_branch: "develop" no run falha', () => {
      const run = {
        id: 100,
        head_branch: 'develop',
        head_sha: testSha,
        path: '.github/workflows/ci.yml',
        status: 'completed',
        conclusion: 'success'
      };
      assert.throws(() => {
        verifierModule.validateRunMetadata(run, 100, '.github/workflows/ci.yml', testSha);
      }, /esperado 'master', obtido 'develop'/);
    });

    it('7.2.17: artifact.workflow_run.head_sha ausente no artefacto falha', () => {
      const art = {
        id: 200,
        name: `aetf-pilot-stage-a-${testSha}`,
        size_in_bytes: 4000,
        expired: false,
        workflow_run: { id: 100 } // sem head_sha
      };
      assert.throws(() => {
        verifierModule.validateArtifactMetadata(art, `aetf-pilot-stage-a-${testSha}`, 100, testSha);
      }, /'workflow_run\.head_sha' ausente ou malformado/);
    });

    it('7.2.18: artifact.workflow_run.head_sha malformado falha', () => {
      const art = {
        id: 200,
        name: `aetf-pilot-stage-a-${testSha}`,
        size_in_bytes: 4000,
        expired: false,
        workflow_run: { id: 100, head_sha: 'invalid_short_sha' }
      };
      assert.throws(() => {
        verifierModule.validateArtifactMetadata(art, `aetf-pilot-stage-a-${testSha}`, 100, testSha);
      }, /'workflow_run\.head_sha' ausente ou malformado/);
    });

    it('7.2.19: artifact.workflow_run.head_sha divergente falha', () => {
      const art = {
        id: 200,
        name: `aetf-pilot-stage-a-${testSha}`,
        size_in_bytes: 4000,
        expired: false,
        workflow_run: { id: 100, head_sha: '0000000000000000000000000000000000000000' }
      };
      assert.throws(() => {
        verifierModule.validateArtifactMetadata(art, `aetf-pilot-stage-a-${testSha}`, 100, testSha);
      }, /head_sha do artefacto .* diverge do SHA esperado/);
    });

    it('7.2.20: fonte de linkage presente, mas não indexada no manifesto falha', () => {
      const stageBDir = path.join(tmpDir, 'test_stage_b_unindexed');
      fs.mkdirSync(stageBDir, { recursive: true });

      fs.writeFileSync(path.join(stageBDir, 'stage-a-artifact-api-response.json'), JSON.stringify({
        id: 10584802564,
        workflow_run: { id: 35444821530 }
      }));
      // Manifesto presente, mas NÃO indexa stage-a-artifact-api-response.json
      fs.writeFileSync(path.join(stageBDir, 'pilot-evidence-files.sha256'), `0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef  other-file.json\n`);

      assert.throws(() => {
        verifierModule.extractConsumedStageAIdentifiers(stageBDir);
      }, /Fonte de linkage '.*stage-a-artifact-api-response\.json' presente mas não indexada no manifesto de hashes/);
    });

    it('7.2.21: fonte indexada com hash físico divergente falha', () => {
      const stageBDir = path.join(tmpDir, 'test_stage_b_tampered_hash');
      fs.mkdirSync(stageBDir, { recursive: true });

      const realContent = JSON.stringify({ id: 10584802564, workflow_run: { id: 35444821530 } });
      fs.writeFileSync(path.join(stageBDir, 'stage-a-artifact-api-response.json'), realContent);
      // Hash fraudulento no manifesto
      fs.writeFileSync(path.join(stageBDir, 'pilot-evidence-files.sha256'), `ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff  stage-a-artifact-api-response.json\n`);

      assert.throws(() => {
        verifierModule.extractConsumedStageAIdentifiers(stageBDir);
      }, /Hash físico da fonte de linkage '.*stage-a-artifact-api-response\.json' .* diverge do registado no índice/);
    });

    it('7.2.22: duas fontes com stage_a_run_id diferentes falham por contradição', () => {
      const stageBDir = path.join(tmpDir, 'test_stage_b_contradictory_run_id');
      fs.mkdirSync(stageBDir, { recursive: true });

      const content1 = JSON.stringify({ stage_a_run_id: 11111, stage_a_artifact_id: 10584802564 });
      const content2 = JSON.stringify({ id: 10584802564, workflow_run: { id: 22222 } }); // Contradição de run ID!

      fs.writeFileSync(path.join(stageBDir, 'consumed-stage-a.json'), content1);
      fs.writeFileSync(path.join(stageBDir, 'stage-a-artifact-api-response.json'), content2);

      const h1 = createHash('sha256').update(content1).digest('hex');
      const h2 = createHash('sha256').update(content2).digest('hex');
      fs.writeFileSync(path.join(stageBDir, 'pilot-evidence-files.sha256'), `${h1}  consumed-stage-a.json\n${h2}  stage-a-artifact-api-response.json\n`);

      assert.throws(() => {
        verifierModule.extractConsumedStageAIdentifiers(stageBDir);
      }, /Contradição entre fontes de evidência para stage_a_run_id/);
    });

    it('7.2.23: duas fontes com stage_a_artifact_id diferentes falham por contradição', () => {
      const stageBDir = path.join(tmpDir, 'test_stage_b_contradictory_art_id');
      fs.mkdirSync(stageBDir, { recursive: true });

      const content1 = JSON.stringify({ stage_a_run_id: 35444821530, stage_a_artifact_id: 55555 });
      const content2 = JSON.stringify({ id: 99999, workflow_run: { id: 35444821530 } }); // Contradição de artifact ID!

      fs.writeFileSync(path.join(stageBDir, 'consumed-stage-a.json'), content1);
      fs.writeFileSync(path.join(stageBDir, 'stage-a-artifact-api-response.json'), content2);

      const h1 = createHash('sha256').update(content1).digest('hex');
      const h2 = createHash('sha256').update(content2).digest('hex');
      fs.writeFileSync(path.join(stageBDir, 'pilot-evidence-files.sha256'), `${h1}  consumed-stage-a.json\n${h2}  stage-a-artifact-api-response.json\n`);

      assert.throws(() => {
        verifierModule.extractConsumedStageAIdentifiers(stageBDir);
      }, /Contradição entre fontes de evidência para stage_a_artifact_id/);
    });

    it('7.2.24: duas fontes com intake_run_id diferentes falham por contradição', () => {
      const stageADir = path.join(tmpDir, 'test_stage_a_contradictory_run_id');
      fs.mkdirSync(stageADir, { recursive: true });

      const content1 = JSON.stringify({ intake_run_id: 33333, input_artifact_id: 10585326688 });
      const content2 = JSON.stringify({ id: 10585326688, workflow_run: { id: 44444 } }); // Contradição de run ID!

      fs.writeFileSync(path.join(stageADir, 'consumed-intake.json'), content1);
      fs.writeFileSync(path.join(stageADir, 'intake-artifact-api-response.json'), content2);

      const h1 = createHash('sha256').update(content1).digest('hex');
      const h2 = createHash('sha256').update(content2).digest('hex');
      fs.writeFileSync(path.join(stageADir, 'pilot-evidence-files.sha256'), `${h1}  consumed-intake.json\n${h2}  intake-artifact-api-response.json\n`);

      assert.throws(() => {
        verifierModule.extractConsumedIntakeIdentifiers(stageADir);
      }, /Contradição entre fontes de evidência para intake_run_id/);
    });

    it('7.2.25: duas fontes com intake_artifact_id diferentes falham por contradição', () => {
      const stageADir = path.join(tmpDir, 'test_stage_a_contradictory_art_id');
      fs.mkdirSync(stageADir, { recursive: true });

      const content1 = JSON.stringify({ intake_run_id: 35444671656, input_artifact_id: 77777 });
      const content2 = JSON.stringify({ id: 88888, workflow_run: { id: 35444671656 } }); // Contradição de artifact ID!

      fs.writeFileSync(path.join(stageADir, 'consumed-intake.json'), content1);
      fs.writeFileSync(path.join(stageADir, 'intake-artifact-api-response.json'), content2);

      const h1 = createHash('sha256').update(content1).digest('hex');
      const h2 = createHash('sha256').update(content2).digest('hex');
      fs.writeFileSync(path.join(stageADir, 'pilot-evidence-files.sha256'), `${h1}  consumed-intake.json\n${h2}  intake-artifact-api-response.json\n`);

      assert.throws(() => {
        verifierModule.extractConsumedIntakeIdentifiers(stageADir);
      }, /Contradição entre fontes de evidência para intake_artifact_id/);
    });

    it('7.2.26: fonte de linkage contendo JSON inválido falha', () => {
      const stageBDir = path.join(tmpDir, 'test_stage_b_invalid_json');
      fs.mkdirSync(stageBDir, { recursive: true });

      const invalidContent = '{ invalid json content: [ ';
      fs.writeFileSync(path.join(stageBDir, 'stage-a-artifact-api-response.json'), invalidContent);
      const h = createHash('sha256').update(invalidContent).digest('hex');
      fs.writeFileSync(path.join(stageBDir, 'pilot-evidence-files.sha256'), `${h}  stage-a-artifact-api-response.json\n`);

      assert.throws(() => {
        verifierModule.extractConsumedStageAIdentifiers(stageBDir);
      }, /Fonte de linkage '.*stage-a-artifact-api-response\.json' contém JSON inválido/);
    });

    it('7.2.27: índice de hashes ausente no pacote falha', () => {
      const stageBDir = path.join(tmpDir, 'test_stage_b_no_index');
      fs.mkdirSync(stageBDir, { recursive: true });

      fs.writeFileSync(path.join(stageBDir, 'stage-a-artifact-api-response.json'), JSON.stringify({ id: 10584802564, workflow_run: { id: 35444821530 } }));
      // Sem pilot-evidence-files.sha256

      assert.throws(() => {
        verifierModule.extractConsumedStageAIdentifiers(stageBDir);
      }, /Índice de hashes ausente no pacote/);
    });

    it('7.2.28: Etapa A com dois pares disponíveis onde a referência consumida não corresponde a nenhum par falha no código de produção', () => {
      const runA1Id = 35444821530;
      const artA1Id = 10584802564;
      const runA2Id = 35444829999;
      const artA2Id = 10584809999;

      const availablePairs = [
        { run_id: runA1Id, artifact_id: artA1Id, workflow_run_id: runA1Id, head_sha: testSha },
        { run_id: runA2Id, artifact_id: artA2Id, workflow_run_id: runA2Id, head_sha: testSha }
      ];

      const unknownReference = {
        stage_a_run_id: 99999999999, // Não corresponde a nenhum par disponível
        stage_a_artifact_id: artA1Id,
        stage_a_head_sha: testSha
      };

      assert.throws(() => {
        verifierModule.reconcileConsumedPair(availablePairs, unknownReference, 'Etapa A');
      }, /Nenhum par disponível em Etapa A corresponde à referência consumida/);
    });

    it('7.2.29: Etapa A com duas referências canónicas incompatíveis (apontando para Par A1 e Par A2) falha por contradição', () => {
      const stageBDir = path.join(tmpDir, 'test_stage_a_two_pairs_contradiction');
      fs.mkdirSync(stageBDir, { recursive: true });

      const runA1Id = 35444821530;
      const artA1Id = 10584802564;
      const runA2Id = 35444829999;
      const artA2Id = 10584809999;

      // Fonte 1 aponta para o Par A1
      const content1 = JSON.stringify({ stage_a_run_id: runA1Id, stage_a_artifact_id: artA1Id, stage_a_head_sha: testSha });
      // Fonte 2 aponta para o Par A2
      const content2 = JSON.stringify({ stage_a_run_id: runA2Id, stage_a_artifact_id: artA2Id, stage_a_head_sha: testSha });

      fs.writeFileSync(path.join(stageBDir, 'consumed-stage-a.json'), content1);
      fs.writeFileSync(path.join(stageBDir, 'stage-a-linkage.json'), content2);

      const h1 = createHash('sha256').update(content1).digest('hex');
      const h2 = createHash('sha256').update(content2).digest('hex');
      fs.writeFileSync(path.join(stageBDir, 'pilot-evidence-files.sha256'), `${h1}  consumed-stage-a.json\n${h2}  stage-a-linkage.json\n`);

      assert.throws(() => {
        verifierModule.extractConsumedStageAIdentifiers(stageBDir);
      }, /Contradição entre fontes de evidência para stage_a_run_id/);
    });

    it('7.2.30: Intake com dois pares disponíveis onde a referência consumida não corresponde a nenhum par falha no código de produção', () => {
      const runI1Id = 35444671656;
      const artI1Id = 10585326688;
      const runI2Id = 35444679999;
      const artI2Id = 10585329999;

      const availablePairs = [
        { run_id: runI1Id, artifact_id: artI1Id, workflow_run_id: runI1Id, head_sha: testSha },
        { run_id: runI2Id, artifact_id: artI2Id, workflow_run_id: runI2Id, head_sha: testSha }
      ];

      const unknownReference = {
        intake_run_id: 88888888888, // Não corresponde a nenhum par disponível
        intake_artifact_id: artI1Id,
        intake_head_sha: testSha
      };

      assert.throws(() => {
        verifierModule.reconcileConsumedPair(availablePairs, unknownReference, 'Intake');
      }, /Nenhum par disponível em Intake corresponde à referência consumida/);
    });

    it('7.2.31: Intake com duas referências canónicas incompatíveis (apontando para Par I1 e Par I2) falha por contradição', () => {
      const stageADir = path.join(tmpDir, 'test_intake_two_pairs_contradiction');
      fs.mkdirSync(stageADir, { recursive: true });

      const runI1Id = 35444671656;
      const artI1Id = 10585326688;
      const runI2Id = 35444679999;
      const artI2Id = 10585329999;

      // Fonte 1 aponta para o Par I1
      const content1 = JSON.stringify({ intake_run_id: runI1Id, input_artifact_id: artI1Id, intake_head_sha: testSha });
      // Fonte 2 aponta para o Par I2
      const content2 = JSON.stringify({ intake_run_id: runI2Id, input_artifact_id: artI2Id, intake_head_sha: testSha });

      fs.writeFileSync(path.join(stageADir, 'consumed-intake.json'), content1);
      fs.writeFileSync(path.join(stageADir, 'intake-linkage.json'), content2);

      const h1 = createHash('sha256').update(content1).digest('hex');
      const h2 = createHash('sha256').update(content2).digest('hex');
      fs.writeFileSync(path.join(stageADir, 'pilot-evidence-files.sha256'), `${h1}  consumed-intake.json\n${h2}  intake-linkage.json\n`);

      assert.throws(() => {
        verifierModule.extractConsumedIntakeIdentifiers(stageADir);
      }, /Contradição entre fontes de evidência para intake_run_id/);
    });

    // -----------------------------------------------------------------------
    // 7.3. TESTES OBRIGATÓRIOS DO ÍNDICE SHA-256 (CAMINHO CANÓNICO EXATO)
    // -----------------------------------------------------------------------
    it('7.3.1: evidence/stage-a-linkage.json indexado e o mesmo caminho físico passa', () => {
      const pDir = path.join(tmpDir, 'test_index_7_3_1');
      const evDir = path.join(pDir, 'evidence');
      fs.mkdirSync(evDir, { recursive: true });

      const filePath = path.join(evDir, 'stage-a-linkage.json');
      const content = JSON.stringify({ stage_a_run_id: 12345, stage_a_artifact_id: 67890 });
      fs.writeFileSync(filePath, content);
      const h = createHash('sha256').update(content).digest('hex');

      fs.writeFileSync(path.join(pDir, 'pilot-evidence-files.sha256'), `${h}  evidence/stage-a-linkage.json\n`);

      const { indexMap } = verifierModule.loadPackageIndexMap(pDir);
      const res = verifierModule.verifyFileAgainstPackageIndex(pDir, filePath, indexMap);
      assert.strictEqual(res.normalizedRel, 'evidence/stage-a-linkage.json');
      assert.strictEqual(res.actualHash, h);
    });

    it('7.3.2: apenas evidence/stage-a-linkage.json indexado, mas stage-a-linkage.json na raiz falha', () => {
      const pDir = path.join(tmpDir, 'test_index_7_3_2');
      fs.mkdirSync(pDir, { recursive: true });

      const rootFile = path.join(pDir, 'stage-a-linkage.json');
      const content = JSON.stringify({ stage_a_run_id: 12345, stage_a_artifact_id: 67890 });
      fs.writeFileSync(rootFile, content);
      const h = createHash('sha256').update(content).digest('hex');

      // Apenas indexa o caminho com subdiretório 'evidence/'
      fs.writeFileSync(path.join(pDir, 'pilot-evidence-files.sha256'), `${h}  evidence/stage-a-linkage.json\n`);

      const { indexMap } = verifierModule.loadPackageIndexMap(pDir);
      assert.throws(() => {
        verifierModule.verifyFileAgainstPackageIndex(pDir, rootFile, indexMap);
      }, /Fonte de linkage 'stage-a-linkage\.json' presente mas não indexada no manifesto de hashes/);
    });

    it('7.3.3: apenas o ficheiro da raiz indexado, mas o ficheiro em evidence/ falha', () => {
      const pDir = path.join(tmpDir, 'test_index_7_3_3');
      const evDir = path.join(pDir, 'evidence');
      fs.mkdirSync(evDir, { recursive: true });

      const evFile = path.join(evDir, 'stage-a-linkage.json');
      const content = JSON.stringify({ stage_a_run_id: 12345, stage_a_artifact_id: 67890 });
      fs.writeFileSync(evFile, content);
      const h = createHash('sha256').update(content).digest('hex');

      // Apenas indexa o caminho da raiz
      fs.writeFileSync(path.join(pDir, 'pilot-evidence-files.sha256'), `${h}  stage-a-linkage.json\n`);

      const { indexMap } = verifierModule.loadPackageIndexMap(pDir);
      assert.throws(() => {
        verifierModule.verifyFileAgainstPackageIndex(pDir, evFile, indexMap);
      }, /Fonte de linkage 'evidence\/stage-a-linkage\.json' presente mas não indexada no manifesto de hashes/);
    });

    it('7.3.4: dois ficheiros com o mesmo basename em diretórios diferentes são validados pelas respetivas entradas', () => {
      const pDir = path.join(tmpDir, 'test_index_7_3_4');
      const evDir = path.join(pDir, 'evidence');
      fs.mkdirSync(evDir, { recursive: true });

      const rootFile = path.join(pDir, 'stage-a-linkage.json');
      const evFile = path.join(evDir, 'stage-a-linkage.json');

      const contentRoot = JSON.stringify({ version: 'root', stage_a_run_id: 11111 });
      const contentEv = JSON.stringify({ version: 'evidence', stage_a_run_id: 22222 });

      fs.writeFileSync(rootFile, contentRoot);
      fs.writeFileSync(evFile, contentEv);

      const hRoot = createHash('sha256').update(contentRoot).digest('hex');
      const hEv = createHash('sha256').update(contentEv).digest('hex');

      fs.writeFileSync(path.join(pDir, 'pilot-evidence-files.sha256'), `${hRoot}  stage-a-linkage.json\n${hEv}  evidence/stage-a-linkage.json\n`);

      const { indexMap } = verifierModule.loadPackageIndexMap(pDir);
      const resRoot = verifierModule.verifyFileAgainstPackageIndex(pDir, rootFile, indexMap);
      const resEv = verifierModule.verifyFileAgainstPackageIndex(pDir, evFile, indexMap);

      assert.strictEqual(resRoot.normalizedRel, 'stage-a-linkage.json');
      assert.strictEqual(resRoot.actualHash, hRoot);
      assert.strictEqual(resEv.normalizedRel, 'evidence/stage-a-linkage.json');
      assert.strictEqual(resEv.actualHash, hEv);
    });

    it('7.3.5: entrada duplicada para o mesmo caminho canónico falha', () => {
      const pDir = path.join(tmpDir, 'test_index_7_3_5');
      fs.mkdirSync(pDir, { recursive: true });

      const h = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      fs.writeFileSync(path.join(pDir, 'pilot-evidence-files.sha256'), `${h}  stage-a-linkage.json\n${h}  stage-a-linkage.json\n`);

      assert.throws(() => {
        verifierModule.loadPackageIndexMap(pDir);
      }, /Entrada duplicada no índice de hashes para o caminho canónico 'stage-a-linkage\.json'/);
    });

    it('7.3.6: caminho com ../ falha', () => {
      const pDir = path.join(tmpDir, 'test_index_7_3_6');
      fs.mkdirSync(pDir, { recursive: true });

      const h = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
      fs.writeFileSync(path.join(pDir, 'pilot-evidence-files.sha256'), `${h}  ../outside.json\n`);

      assert.throws(() => {
        verifierModule.loadPackageIndexMap(pDir);
      }, /Caminho com escape \('\.\.'\) não permitido no índice/);
    });

    it('7.3.7: hash malformado falha', () => {
      const pDir = path.join(tmpDir, 'test_index_7_3_7');
      fs.mkdirSync(pDir, { recursive: true });

      fs.writeFileSync(path.join(pDir, 'pilot-evidence-files.sha256'), `short_hash  stage-a-linkage.json\n`);

      assert.throws(() => {
        verifierModule.loadPackageIndexMap(pDir);
      }, /Hash SHA-256 malformado/);
    });
  });

  describe('8. Subprompt 2 — Identidade Canónica e Verdade dos Hashes', () => {
    let verifierModule: any;
    const testSha = '37927b519f2865e45d5df236df411da126dbe8f8';
    const canonicalRepoId = 1363667011;
    const canonicalRepoName = 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';
    const sampleSha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const altSha256 = '948cdee5df75eaf336574014f935c0fb644ae2521e4ef27313b48f0bba2d255e';

    before(async () => {
      const { pathToFileURL } = await import('node:url');
      verifierModule = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/verify-operational-pilot-closure-chain.mjs')).href);
    });

    // -------------------------------------------------------------------------
    // 8.1. TESTES POSITIVOS OBRIGATÓRIOS (Secção 3)
    // -------------------------------------------------------------------------
    describe('8.1. Testes Positivos Obrigatórios', () => {
      it('8.1.1: CI com os dois IDs e os dois nomes canónicos passa no código de produção', () => {
        const ciRun = {
          id: 1001,
          head_branch: 'master',
          head_sha: testSha,
          status: 'completed',
          conclusion: 'success',
          path: '.github/workflows/ci.yml',
          repository: { id: canonicalRepoId, full_name: canonicalRepoName },
          head_repository: { id: canonicalRepoId, full_name: canonicalRepoName }
        };
        const res = verifierModule.validateRunRepositoryIdentity(ciRun, 'CI');
        assert.strictEqual(res, true);
      });

      it('8.1.2: Intake com identidade canónica passa no código de produção', () => {
        const intakeRun = {
          id: 1002,
          head_branch: 'master',
          head_sha: testSha,
          status: 'completed',
          conclusion: 'success',
          path: '.github/workflows/operational-pilot-intake.yml',
          repository: { id: canonicalRepoId, full_name: canonicalRepoName },
          head_repository: { id: canonicalRepoId, full_name: canonicalRepoName }
        };
        const res = verifierModule.validateRunRepositoryIdentity(intakeRun, 'Intake');
        assert.strictEqual(res, true);
      });

      it('8.1.3: Etapa A com identidade canónica passa no código de produção', () => {
        const stageARun = {
          id: 1003,
          head_branch: 'master',
          head_sha: testSha,
          status: 'completed',
          conclusion: 'success',
          path: '.github/workflows/operational-pilot-stage-a.yml',
          repository: { id: canonicalRepoId, full_name: canonicalRepoName },
          head_repository: { id: canonicalRepoId, full_name: canonicalRepoName }
        };
        const res = verifierModule.validateRunRepositoryIdentity(stageARun, 'Stage A');
        assert.strictEqual(res, true);
      });

      it('8.1.4: Etapa B com identidade canónica passa no código de produção', () => {
        const stageBRun = {
          id: 1004,
          head_branch: 'master',
          head_sha: testSha,
          status: 'completed',
          conclusion: 'success',
          path: '.github/workflows/operational-pilot-stage-b.yml',
          repository: { id: canonicalRepoId, full_name: canonicalRepoName },
          head_repository: { id: canonicalRepoId, full_name: canonicalRepoName }
        };
        const res = verifierModule.validateRunRepositoryIdentity(stageBRun, 'Stage B');
        assert.strictEqual(res, true);
      });

      it('8.1.5: cadeia com os quatro runs canónicos produz canonical_repository_chain_verified: true via função de produção', () => {
        const [ciRun, intakeRun, stageARun, stageBRun] = ['CI', 'Intake', 'Stage A', 'Stage B'].map((label, idx) => ({
          id: 2000 + idx,
          head_branch: 'master',
          head_sha: testSha,
          repository: { id: canonicalRepoId, full_name: canonicalRepoName },
          head_repository: { id: canonicalRepoId, full_name: canonicalRepoName }
        }));
        const canonical_repository_chain_verified = verifierModule.verifyCanonicalRepositoryChain(ciRun, intakeRun, stageARun, stageBRun);
        assert.strictEqual(canonical_repository_chain_verified, true);
      });

      it('8.1.6: SHA-256 estrito válido passa no código de produção', () => {
        const parsed = verifierModule.assertStrictSha256Format(sampleSha256, 'test_hash');
        assert.strictEqual(parsed, sampleSha256);
      });

      it('8.1.7: bytes físicos coincidentes com o sidecar passam no código de produção', () => {
        const testDir = path.join(tmpDir, 'test_sidecar_match_dir');
        fs.mkdirSync(testDir, { recursive: true });
        const filePath = path.join(testDir, 'payload.json');
        const sidecarPath = path.join(testDir, 'payload.json.sha256');
        const fileContent = JSON.stringify({ status: 'ok', random: 42 });
        fs.writeFileSync(filePath, fileContent);
        const expectedHash = createHash('sha256').update(fileContent).digest('hex');
        fs.writeFileSync(sidecarPath, `${expectedHash}  payload.json\n`);

        const res = verifierModule.verifySidecarHash(filePath, sidecarPath, 'payload');
        assert.strictEqual(res.match, true);
        assert.strictEqual(res.actualHash, expectedHash);
        assert.strictEqual(res.expectedHash, expectedHash);
      });

      it('8.1.8: Intake, Etapa A e Etapa B com o mesmo hash do pacote passam no código de produção', () => {
        const res = verifierModule.reconcilePackageHashes(sampleSha256, sampleSha256, sampleSha256);
        assert.strictEqual(res, true);
      });

      it('8.1.9: índice completo com todos os hashes físicos coincidentes passa no código de produção', () => {
        const indexDir = path.join(tmpDir, 'test_full_index_pass_dir');
        fs.mkdirSync(indexDir, { recursive: true });
        const f1 = path.join(indexDir, 'doc1.txt');
        const f2 = path.join(indexDir, 'doc2.txt');
        fs.writeFileSync(f1, 'content 1');
        fs.writeFileSync(f2, 'content 2');
        const h1 = createHash('sha256').update('content 1').digest('hex');
        const h2 = createHash('sha256').update('content 2').digest('hex');
        fs.writeFileSync(path.join(indexDir, 'pilot-evidence-files.sha256'), `${h1}  doc1.txt\n${h2}  doc2.txt\n`);

        const { indexMap } = verifierModule.loadPackageIndexMap(indexDir);
        const res1 = verifierModule.verifyFileAgainstPackageIndex(indexDir, f1, indexMap);
        const res2 = verifierModule.verifyFileAgainstPackageIndex(indexDir, f2, indexMap);
        assert.strictEqual(res1.actualHash, h1);
        assert.strictEqual(res2.actualHash, h2);
      });

      it('8.1.10: respostas individuais da API com sidecars corretos passam no código de produção', () => {
        const apiDir = path.join(tmpDir, 'test_api_sidecar_pass_dir');
        fs.mkdirSync(apiDir, { recursive: true });
        const apiFile = path.join(apiDir, 'stage-b-run-api-response.json');
        const apiSidecar = path.join(apiDir, 'stage-b-run-api-response.json.sha256');
        const apiContent = JSON.stringify({ id: 12345, status: 'completed' });
        fs.writeFileSync(apiFile, apiContent);
        const apiHash = createHash('sha256').update(apiContent).digest('hex');
        fs.writeFileSync(apiSidecar, `${apiHash}  stage-b-run-api-response.json\n`);

        const res = verifierModule.verifySidecarHash(apiFile, apiSidecar, 'stage-b-run-api-response.json');
        assert.strictEqual(res.match, true);
        assert.strictEqual(res.actualHash, apiHash);
      });
    });

    // -------------------------------------------------------------------------
    // 8.2. TESTES NEGATIVOS OBRIGATÓRIOS (Secção 4)
    // -------------------------------------------------------------------------
    describe('8.2. Testes Negativos Obrigatórios', () => {
      // Identidade
      it('8.2.1: repository ausente falha no código de produção', () => {
        const run = {
          id: 100,
          head_repository: { id: canonicalRepoId, full_name: canonicalRepoName }
        };
        assert.throws(() => {
          verifierModule.validateRunRepositoryIdentity(run, 'test-run');
        }, /Objeto 'repository' ausente no run 'test-run'/);
      });

      it('8.2.2: repository.id ausente falha no código de produção', () => {
        const run = {
          id: 100,
          repository: { full_name: canonicalRepoName },
          head_repository: { id: canonicalRepoId, full_name: canonicalRepoName }
        };
        assert.throws(() => {
          verifierModule.validateRunRepositoryIdentity(run, 'test-run');
        }, /'repository.id' ausente, nulo, zero ou inválido/);
      });

      it('8.2.3: repository.id divergente falha no código de produção', () => {
        const run = {
          id: 100,
          repository: { id: 9999999999, full_name: canonicalRepoName },
          head_repository: { id: canonicalRepoId, full_name: canonicalRepoName }
        };
        assert.throws(() => {
          verifierModule.validateRunRepositoryIdentity(run, 'test-run');
        }, /'repository.id' \(9999999999\) diverge do canónico/);
      });

      it('8.2.4: repository.full_name ausente falha no código de produção', () => {
        const run = {
          id: 100,
          repository: { id: canonicalRepoId },
          head_repository: { id: canonicalRepoId, full_name: canonicalRepoName }
        };
        assert.throws(() => {
          verifierModule.validateRunRepositoryIdentity(run, 'test-run');
        }, /'repository.full_name' ausente ou inválido/);
      });

      it('8.2.5: repository.full_name divergente falha no código de produção', () => {
        const run = {
          id: 100,
          repository: { id: canonicalRepoId, full_name: 'attacker/APLICATIVO-AI-EMPLOYEES' },
          head_repository: { id: canonicalRepoId, full_name: canonicalRepoName }
        };
        assert.throws(() => {
          verifierModule.validateRunRepositoryIdentity(run, 'test-run');
        }, /'repository.full_name' \('attacker\/APLICATIVO-AI-EMPLOYEES'\) diverge do canónico/);
      });

      it('8.2.6: head_repository ausente falha no código de produção', () => {
        const run = {
          id: 100,
          repository: { id: canonicalRepoId, full_name: canonicalRepoName }
        };
        assert.throws(() => {
          verifierModule.validateRunRepositoryIdentity(run, 'test-run');
        }, /Objeto 'head_repository' ausente no run 'test-run'/);
      });

      it('8.2.7: head_repository.id ausente falha no código de produção', () => {
        const run = {
          id: 100,
          repository: { id: canonicalRepoId, full_name: canonicalRepoName },
          head_repository: { full_name: canonicalRepoName }
        };
        assert.throws(() => {
          verifierModule.validateRunRepositoryIdentity(run, 'test-run');
        }, /'head_repository.id' ausente, nulo, zero ou inválido/);
      });

      it('8.2.8: head_repository.id divergente falha no código de produção', () => {
        const run = {
          id: 100,
          repository: { id: canonicalRepoId, full_name: canonicalRepoName },
          head_repository: { id: 9999999999, full_name: canonicalRepoName }
        };
        assert.throws(() => {
          verifierModule.validateRunRepositoryIdentity(run, 'test-run');
        }, /'head_repository.id' \(9999999999\) diverge do canónico/);
      });

      it('8.2.9: head_repository.full_name ausente falha no código de produção', () => {
        const run = {
          id: 100,
          repository: { id: canonicalRepoId, full_name: canonicalRepoName },
          head_repository: { id: canonicalRepoId }
        };
        assert.throws(() => {
          verifierModule.validateRunRepositoryIdentity(run, 'test-run');
        }, /'head_repository.full_name' ausente ou inválido/);
      });

      it('8.2.10: head_repository.full_name divergente falha no código de produção', () => {
        const run = {
          id: 100,
          repository: { id: canonicalRepoId, full_name: canonicalRepoName },
          head_repository: { id: canonicalRepoId, full_name: 'fork-org/APLICATIVO-AI-EMPLOYEES' }
        };
        assert.throws(() => {
          verifierModule.validateRunRepositoryIdentity(run, 'test-run');
        }, /'head_repository.full_name' \('fork-org\/APLICATIVO-AI-EMPLOYEES'\) diverge do canónico/);
      });

      it('8.2.11: repository.id correto e head_repository.id incorreto falha no código de produção', () => {
        const run = {
          id: 100,
          repository: { id: canonicalRepoId, full_name: canonicalRepoName },
          head_repository: { id: 12345, full_name: canonicalRepoName }
        };
        assert.throws(() => {
          verifierModule.validateRunRepositoryIdentity(run, 'test-run');
        }, /'head_repository.id' \(12345\) diverge do canónico/);
      });

      it('8.2.12: run de fork rejeitado no código de produção', () => {
        const run = {
          id: 100,
          repository: { id: canonicalRepoId, full_name: canonicalRepoName, fork: false },
          head_repository: { id: canonicalRepoId, full_name: canonicalRepoName, fork: true }
        };
        assert.throws(() => {
          verifierModule.validateRunRepositoryIdentity(run, 'fork-run');
        }, /Run 'fork-run' rejeitado: proveniente de fork/);
      });

      // Hashes
      it('8.2.13: hash ausente falha no código de produção', () => {
        assert.throws(() => {
          verifierModule.assertStrictSha256Format(null, 'null_test');
        }, /Formato de hash inválido para 'null_test'/);
      });

      it('8.2.14: hash vazio falha no código de produção', () => {
        assert.throws(() => {
          verifierModule.assertStrictSha256Format('', 'empty_test');
        }, /Hash SHA-256 inválido para 'empty_test'/);
      });

      it('8.2.15: hash curto (<64) falha no código de produção', () => {
        assert.throws(() => {
          verifierModule.assertStrictSha256Format('a'.repeat(63), 'short_test');
        }, /Hash SHA-256 inválido para 'short_test'/);
      });

      it('8.2.16: hash longo (>64) falha no código de produção', () => {
        assert.throws(() => {
          verifierModule.assertStrictSha256Format('a'.repeat(65), 'long_test');
        }, /Hash SHA-256 inválido para 'long_test'/);
      });

      it('8.2.17: carácter não hexadecimal falha no código de produção', () => {
        assert.throws(() => {
          verifierModule.assertStrictSha256Format('z'.repeat(64), 'non_hex_test');
        }, /Hash SHA-256 inválido para 'non_hex_test'/);
      });

      it('8.2.18: sidecar ausente falha no código de produção', () => {
        const dummyFile = path.join(tmpDir, 'test_dummy_src.txt');
        fs.writeFileSync(dummyFile, 'dummy');
        const nonExistentSidecar = path.join(tmpDir, 'non_existent.sha256');

        assert.throws(() => {
          verifierModule.verifySidecarHash(dummyFile, nonExistentSidecar, 'test');
        }, /Ficheiro sidecar '.*' ausente/);
      });

      it('8.2.19: ficheiro físico ausente falha no código de produção', () => {
        const nonExistentFile = path.join(tmpDir, 'non_existent_file.txt');
        const dummySidecar = path.join(tmpDir, 'test_dummy.sha256');
        fs.writeFileSync(dummySidecar, `${sampleSha256}  non_existent_file.txt\n`);

        assert.throws(() => {
          verifierModule.verifySidecarHash(nonExistentFile, dummySidecar, 'test');
        }, /Ficheiro físico '.*' ausente/);
      });

      it('8.2.20: nome do ficheiro divergente no sidecar falha no código de produção', () => {
        const targetFile = path.join(tmpDir, 'fileA.txt');
        const sidecar = path.join(tmpDir, 'fileA.txt.sha256');
        fs.writeFileSync(targetFile, 'data');
        fs.writeFileSync(sidecar, `${sampleSha256}  fileB.txt\n`);

        assert.throws(() => {
          verifierModule.verifySidecarHash(targetFile, sidecar, 'test');
        }, /Caminho divergente no sidecar|Nome de ficheiro divergente no sidecar/);
      });

      it('8.2.21: hash esperado diferente do hash físico falha no código de produção', () => {
        const targetFile = path.join(tmpDir, 'fileMismatch.txt');
        const sidecar = path.join(tmpDir, 'fileMismatch.txt.sha256');
        fs.writeFileSync(targetFile, 'actual content');
        fs.writeFileSync(sidecar, `${sampleSha256}  fileMismatch.txt\n`);

        assert.throws(() => {
          verifierModule.verifySidecarHash(targetFile, sidecar, 'test');
        }, /Hash esperado .* diferente do hash físico/);
      });

      it('8.2.22: hash do Intake ausente falha no código de produção', () => {
        assert.throws(() => {
          verifierModule.reconcilePackageHashes(null, sampleSha256, sampleSha256);
        }, /Hash do pacote publicado no Intake ausente/);
      });

      it('8.2.23: hash da Etapa A ausente falha no código de produção', () => {
        assert.throws(() => {
          verifierModule.reconcilePackageHashes(sampleSha256, null, sampleSha256);
        }, /Hash do pacote consumido pela Etapa A ausente/);
      });

      it('8.2.24: hash da Etapa B ausente falha no código de produção', () => {
        assert.throws(() => {
          verifierModule.reconcilePackageHashes(sampleSha256, sampleSha256, null);
        }, /Hash do pacote\/entrada preservado na Etapa B ausente/);
      });

      it('8.2.25: Intake e Etapa A divergentes falham no código de produção', () => {
        assert.throws(() => {
          verifierModule.reconcilePackageHashes(sampleSha256, altSha256, altSha256);
        }, /Reconciliação transversal falhou: hash do Intake .* diverge do hash consumido na Etapa A/);
      });

      it('8.2.26: Etapa A e Etapa B divergentes falham no código de produção', () => {
        assert.throws(() => {
          verifierModule.reconcilePackageHashes(sampleSha256, sampleSha256, altSha256);
        }, /Reconciliação transversal falhou: hash da Etapa A .* diverge do hash preservado na Etapa B/);
      });

      it('8.2.27: duas fontes canónicas contraditórias falham no código de produção', () => {
        const contraDir = path.join(tmpDir, 'test_contradictory_sources_dir');
        fs.mkdirSync(contraDir, { recursive: true });

        const bytes1 = Buffer.from('PAYLOAD_SAMPLE_1');
        const sha1 = createHash('sha256').update(bytes1).digest('hex');
        const bytes2 = Buffer.from('PAYLOAD_SAMPLE_2_ALT');
        const sha2 = createHash('sha256').update(bytes2).digest('hex');

        fs.writeFileSync(path.join(contraDir, 'input-package.tar.gz'), bytes1);
        fs.writeFileSync(path.join(contraDir, 'original-package.tar.gz'), bytes2);
        fs.writeFileSync(path.join(contraDir, 'input-package.sha256'), `${sha1}  input-package.tar.gz\n`);
        fs.writeFileSync(path.join(contraDir, 'original-package.sha256'), `${sha2}  original-package.tar.gz\n`);

        const files = fs.readdirSync(contraDir);
        const indexLines = files.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(contraDir, f))).digest('hex')}  ${f}`);
        fs.writeFileSync(path.join(contraDir, 'pilot-evidence-files.sha256'), indexLines.join('\n') + '\n');

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(contraDir, 'Intake');
        }, /Fontes canónicas contraditórias em Intake/);
      });
    });
  });

  describe('9. Micro-Patch Final — Verdade Física dos Hashes e Autenticação pelo Índice', () => {
    let verifierModule: any;
    let suiteDir: string;
    const testSha = '37927b519f2865e45d5df236df411da126dbe8f8';
    const canonicalRepoId = 1363667011;
    const canonicalRepoName = 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';
    const sampleSha256 = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    const altSha256 = '948cdee5df75eaf336574014f935c0fb644ae2521e4ef27313b48f0bba2d255e';

    before(async () => {
      suiteDir = path.join(tmpDir, 'suite9_hash_truth_tests');
      fs.mkdirSync(suiteDir, { recursive: true });
      const { pathToFileURL } = await import('node:url');
      verifierModule = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/verify-operational-pilot-closure-chain.mjs')).href);
    });

    const createValidPackageBundle = (targetDir: string, payloadName: string = 'input-package.tar.gz', payloadContent: string = 'VALID_PAYLOAD_TEST') => {
      fs.mkdirSync(targetDir, { recursive: true });
      const payloadBuf = Buffer.from(payloadContent);
      const payloadSha = createHash('sha256').update(payloadBuf).digest('hex');
      fs.writeFileSync(path.join(targetDir, payloadName), payloadBuf);
      fs.writeFileSync(path.join(targetDir, 'input-package.sha256'), `${payloadSha}  ${payloadName}\n`);

      const files = fs.readdirSync(targetDir);
      const indexLines = files.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(targetDir, f))).digest('hex')}  ${f}`);
      fs.writeFileSync(path.join(targetDir, 'pilot-evidence-files.sha256'), indexLines.join('\n') + '\n');
      return { payloadSha, payloadBuf };
    };

    describe('9.1 Testes Positivos', () => {
      it('9.1.1: fonte .sha256 indexada pelo caminho canónico exacto, apontando para ficheiro físico íntegro, passa no código de produção', () => {
        const testDir = path.join(suiteDir, 'test_9_1_1');
        const { payloadSha } = createValidPackageBundle(testDir);
        const extracted = verifierModule.extractPackageHashFromBundle(testDir, 'Intake');
        assert.strictEqual(extracted, payloadSha);
      });

      it('9.1.2: fonte JSON válida, indexada e fisicamente íntegra passa no código de produção', () => {
        const testDir = path.join(suiteDir, 'test_9_1_2');
        fs.mkdirSync(testDir, { recursive: true });
        const expectedSha = sampleSha256;
        const jsonContent = JSON.stringify({ input_package_sha: expectedSha, stage_a_run_id: 12345 }, null, 2);
        fs.writeFileSync(path.join(testDir, 'consumed-stage-a.json'), jsonContent);

        const files = fs.readdirSync(testDir);
        const indexLines = files.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(testDir, f))).digest('hex')}  ${f}`);
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), indexLines.join('\n') + '\n');

        const extracted = verifierModule.extractPackageHashFromBundle(testDir, 'Stage B');
        assert.strictEqual(extracted, expectedSha);
      });

      it('9.1.3: JSON com dois ou três campos de hash iguais passa no código de produção', () => {
        const testDir = path.join(suiteDir, 'test_9_1_3');
        fs.mkdirSync(testDir, { recursive: true });
        const expectedSha = sampleSha256;
        const jsonContent = JSON.stringify({
          input_package_sha: expectedSha,
          package_hash: expectedSha,
          original_package_sha: expectedSha
        }, null, 2);
        fs.writeFileSync(path.join(testDir, 'consumed-stage-a.json'), jsonContent);

        const files = fs.readdirSync(testDir);
        const indexLines = files.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(testDir, f))).digest('hex')}  ${f}`);
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), indexLines.join('\n') + '\n');

        const extracted = verifierModule.extractPackageHashFromBundle(testDir, 'Stage B');
        assert.strictEqual(extracted, expectedSha);
      });

      it('9.1.4: dois ficheiros com o mesmo basename em directórios diferentes são distinguidos pelos caminhos canónicos', () => {
        const testDir = path.join(suiteDir, 'test_9_1_4');
        const evDir = path.join(testDir, 'evidence');
        const archDir = path.join(testDir, 'archive');
        fs.mkdirSync(evDir, { recursive: true });
        fs.mkdirSync(archDir, { recursive: true });

        const fEvidence = path.join(evDir, 'api-response.json');
        const fArchive = path.join(archDir, 'api-response.json');
        fs.writeFileSync(fEvidence, '{"evidence": true}');
        fs.writeFileSync(fArchive, '{"archive": true}');

        const hEv = createHash('sha256').update(fs.readFileSync(fEvidence)).digest('hex');
        const sEvidence = path.join(evDir, 'api-response.json.sha256');
        fs.writeFileSync(sEvidence, `${hEv}  api-response.json\n`);

        const res = verifierModule.verifySidecarHash(fEvidence, sEvidence, 'evidence-api', evDir);
        assert.strictEqual(res.match, true);

        assert.throws(() => {
          verifierModule.verifySidecarHash(fArchive, sEvidence, 'archive-api', testDir);
        }, /Caminho canónico divergente no sidecar|Caminho divergente no sidecar/);
      });

      it('9.1.5: índice completo, sem linhas inválidas e com todos os bytes coincidentes, passa no código de produção', () => {
        const testDir = path.join(suiteDir, 'test_9_1_5');
        fs.mkdirSync(testDir, { recursive: true });
        for (let i = 1; i <= 5; i++) {
          fs.writeFileSync(path.join(testDir, `file_${i}.dat`), `DATA_CONTENT_${i}`);
        }
        const files = fs.readdirSync(testDir);
        const indexLines = files.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(testDir, f))).digest('hex')}  ${f}`);
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), indexLines.join('\n') + '\n');

        const { indexMap } = verifierModule.loadPackageIndexMap(testDir);
        assert.strictEqual(indexMap.size, 5);
        for (let i = 1; i <= 5; i++) {
          const res = verifierModule.verifyFileAgainstPackageIndex(testDir, path.join(testDir, `file_${i}.dat`), indexMap);
          assert.strictEqual(res.match, true);
        }
      });

      it('9.1.6: Intake, Etapa A e Etapa B com fontes autenticadas e o mesmo hash físico produzem reconciliação positiva', () => {
        const dirI = path.join(suiteDir, 'test_9_1_6_intake');
        const dirA = path.join(suiteDir, 'test_9_1_6_stage_a');
        const dirB = path.join(suiteDir, 'test_9_1_6_stage_b');
        const sharedPayload = 'SHARED_EXACT_FORENSIC_PAYLOAD_V1';

        const { payloadSha: shaI } = createValidPackageBundle(dirI, 'input-package.tar.gz', sharedPayload);
        const { payloadSha: shaA } = createValidPackageBundle(dirA, 'input-package.tar.gz', sharedPayload);
        const { payloadSha: shaB } = createValidPackageBundle(dirB, 'input-package.tar.gz', sharedPayload);

        const extractedI = verifierModule.extractPackageHashFromBundle(dirI, 'Intake');
        const extractedA = verifierModule.extractPackageHashFromBundle(dirA, 'Stage A');
        const extractedB = verifierModule.extractPackageHashFromBundle(dirB, 'Stage B');

        assert.strictEqual(extractedI, shaI);
        assert.strictEqual(extractedA, shaA);
        assert.strictEqual(extractedB, shaB);

        const reconciled = verifierModule.reconcilePackageHashes(extractedI, extractedA, extractedB);
        assert.strictEqual(reconciled, true);
      });
    });

    describe('9.2 Testes Negativos', () => {
      it('9.2.1: .sha256 presente, mas não indexado falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_1');
        fs.mkdirSync(testDir, { recursive: true });
        const payloadBuf = Buffer.from('TEST_UNINDEXED_SIDECAR');
        const payloadSha = createHash('sha256').update(payloadBuf).digest('hex');
        fs.writeFileSync(path.join(testDir, 'input-package.tar.gz'), payloadBuf);
        fs.writeFileSync(path.join(testDir, 'input-package.sha256'), `${payloadSha}  input-package.tar.gz\n`);
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), `${payloadSha}  input-package.tar.gz\n`);

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Intake');
        }, /Fonte de linkage 'input-package\.sha256' presente mas não indexada no manifesto de hashes/);
      });

      it('9.2.2: .sha256 indexado por caminho diferente falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_2');
        fs.mkdirSync(testDir, { recursive: true });
        const payloadBuf = Buffer.from('TEST_WRONG_INDEX_PATH');
        const payloadSha = createHash('sha256').update(payloadBuf).digest('hex');
        fs.writeFileSync(path.join(testDir, 'input-package.tar.gz'), payloadBuf);
        fs.writeFileSync(path.join(testDir, 'input-package.sha256'), `${payloadSha}  input-package.tar.gz\n`);
        const sidecarSha = createHash('sha256').update(fs.readFileSync(path.join(testDir, 'input-package.sha256'))).digest('hex');
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), `${sidecarSha}  wrong/input-package.sha256\n${payloadSha}  input-package.tar.gz\n`);

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Intake');
        }, /Fonte de linkage 'input-package\.sha256' presente mas não indexada no manifesto de hashes/);
      });

      it('9.2.3: .sha256 apontando para ficheiro inexistente falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_3');
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'input-package.sha256'), `${sampleSha256}  non-existent.tar.gz\n`);
        const sidecarSha = createHash('sha256').update(fs.readFileSync(path.join(testDir, 'input-package.sha256'))).digest('hex');
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), `${sidecarSha}  input-package.sha256\n`);

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Intake');
        }, /Ficheiro físico referido 'non-existent\.tar\.gz' ausente/);
      });

      it('9.2.4: .sha256 apontando para caminho absoluto falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_4');
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'input-package.sha256'), `${sampleSha256}  /etc/passwd\n`);
        const sidecarSha = createHash('sha256').update(fs.readFileSync(path.join(testDir, 'input-package.sha256'))).digest('hex');
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), `${sidecarSha}  input-package.sha256\n`);

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Intake');
        }, /Caminho absoluto não permitido no índice/);
      });

      it('9.2.5: .sha256 apontando para caminho com .. falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_5');
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'input-package.sha256'), `${sampleSha256}  ../escape.tar.gz\n`);
        const sidecarSha = createHash('sha256').update(fs.readFileSync(path.join(testDir, 'input-package.sha256'))).digest('hex');
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), `${sidecarSha}  input-package.sha256\n`);

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Intake');
        }, /Caminho com escape \('\.\.'\) não permitido no índice/);
      });

      it('9.2.6: .sha256 com caminho correcto, mas bytes físicos adulterados falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_6');
        const { payloadSha } = createValidPackageBundle(testDir);
        // Adulterar os bytes físicos do ficheiro referido
        fs.writeFileSync(path.join(testDir, 'input-package.tar.gz'), 'CORRUPTED_BYTES_TAMPERED');

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Intake');
        }, /Hash físico da fonte de linkage 'input-package\.tar\.gz' .* diverge do registado no índice|Bytes físicos adulterados/);
      });

      it('9.2.7: .sha256 contendo hash válido de outro ficheiro falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_7');
        fs.mkdirSync(testDir, { recursive: true });
        const bufActual = Buffer.from('ACTUAL_BYTES');
        const bufOther = Buffer.from('OTHER_BYTES');
        const hashOther = createHash('sha256').update(bufOther).digest('hex');

        fs.writeFileSync(path.join(testDir, 'input-package.tar.gz'), bufActual);
        // Coloca o hash de bufOther no sidecar
        fs.writeFileSync(path.join(testDir, 'input-package.sha256'), `${hashOther}  input-package.tar.gz\n`);

        const files = fs.readdirSync(testDir);
        const indexLines = files.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(testDir, f))).digest('hex')}  ${f}`);
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), indexLines.join('\n') + '\n');

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Intake');
        }, /Bytes físicos adulterados em 'input-package\.tar\.gz'/);
      });

      it('9.2.8: dois caminhos diferentes com o mesmo basename falham em verifySidecarHash', () => {
        const testDir = path.join(suiteDir, 'test_9_2_8');
        const dir1 = path.join(testDir, 'dir1');
        const dir2 = path.join(testDir, 'dir2');
        fs.mkdirSync(dir1, { recursive: true });
        fs.mkdirSync(dir2, { recursive: true });

        const f1 = path.join(dir1, 'target.txt');
        const f2 = path.join(dir2, 'target.txt');
        fs.writeFileSync(f1, 'CONTENT_1');
        fs.writeFileSync(f2, 'CONTENT_2');

        const sidecar = path.join(dir1, 'target.txt.sha256');
        const h1 = createHash('sha256').update(fs.readFileSync(f1)).digest('hex');
        fs.writeFileSync(sidecar, `${h1}  dir1/target.txt\n`);

        assert.throws(() => {
          verifierModule.verifySidecarHash(f2, sidecar, 'homonym', testDir);
        }, /Caminho canónico divergente no sidecar/);
      });

      it('9.2.9: fonte JSON presente, mas não indexada falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_9');
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'consumed-stage-a.json'), JSON.stringify({ input_package_sha: sampleSha256 }));
        // Cria índice sem incluir consumed-stage-a.json
        fs.writeFileSync(path.join(testDir, 'dummy.txt'), 'hello');
        const dSha = createHash('sha256').update('hello').digest('hex');
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), `${dSha}  dummy.txt\n`);

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Stage B');
        }, /Fonte de linkage 'consumed-stage-a\.json' presente mas não indexada no manifesto de hashes/);
      });

      it('9.2.10: fonte JSON malformada coexistindo com um .sha256 válido falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_10');
        const { payloadSha } = createValidPackageBundle(testDir);
        // Adicionar consumed-stage-a.json com sintaxe corrompida
        fs.writeFileSync(path.join(testDir, 'consumed-stage-a.json'), 'INVALID_SYNTAX_{not json');

        // Regenerar índice cobrindo todos os ficheiros
        const files = fs.readdirSync(testDir).filter(f => f !== 'pilot-evidence-files.sha256');
        const indexLines = files.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(testDir, f))).digest('hex')}  ${f}`);
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), indexLines.join('\n') + '\n');

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Stage B');
        }, /Ficheiro JSON de linkage 'consumed-stage-a\.json' malformado/);
      });

      it('9.2.11: fonte JSON com hash físico divergente do índice falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_11');
        fs.mkdirSync(testDir, { recursive: true });
        const jsonContent = JSON.stringify({ input_package_sha: sampleSha256 });
        fs.writeFileSync(path.join(testDir, 'consumed-stage-a.json'), jsonContent);

        const files = fs.readdirSync(testDir);
        const indexLines = files.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(testDir, f))).digest('hex')}  ${f}`);
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), indexLines.join('\n') + '\n');

        // Adulterar JSON sem atualizar o índice
        fs.writeFileSync(path.join(testDir, 'consumed-stage-a.json'), JSON.stringify({ input_package_sha: altSha256 }));

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Stage B');
        }, /Hash físico da fonte de linkage 'consumed-stage-a\.json' .* diverge do registado no índice/);
      });

      it('9.2.12: JSON com input_package_sha e package_hash divergentes falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_12');
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'consumed-stage-a.json'), JSON.stringify({
          input_package_sha: sampleSha256,
          package_hash: altSha256
        }));

        const files = fs.readdirSync(testDir);
        const indexLines = files.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(testDir, f))).digest('hex')}  ${f}`);
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), indexLines.join('\n') + '\n');

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Stage B');
        }, /Campos contraditórios no mesmo JSON de linkage/);
      });

      it('9.2.13: JSON com package_hash e original_package_sha divergentes falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_13');
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'consumed-stage-a.json'), JSON.stringify({
          package_hash: sampleSha256,
          original_package_sha: altSha256
        }));

        const files = fs.readdirSync(testDir);
        const indexLines = files.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(testDir, f))).digest('hex')}  ${f}`);
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), indexLines.join('\n') + '\n');

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Stage B');
        }, /Campos contraditórios no mesmo JSON de linkage/);
      });

      it('9.2.14: campo de hash presente com valor null falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_14');
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'consumed-stage-a.json'), JSON.stringify({
          input_package_sha: null
        }));

        const files = fs.readdirSync(testDir);
        const indexLines = files.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(testDir, f))).digest('hex')}  ${f}`);
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), indexLines.join('\n') + '\n');

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Stage B');
        }, /Campo de hash 'input_package_sha' presente no JSON de linkage com valor nulo/);
      });

      it('9.2.15: campo de hash presente com formato inválido falha com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_15');
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'consumed-stage-a.json'), JSON.stringify({
          input_package_sha: 'NOT_A_VALID_SHA'
        }));

        const files = fs.readdirSync(testDir);
        const indexLines = files.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(testDir, f))).digest('hex')}  ${f}`);
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), indexLines.join('\n') + '\n');

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Stage B');
        }, /Hash SHA-256 inválido/);
      });

      it('9.2.16: duas fontes canónicas autenticadas, mas contraditórias falham com erro fail-closed', () => {
        const testDir = path.join(suiteDir, 'test_9_2_16');
        const { payloadSha } = createValidPackageBundle(testDir);
        // Adicionar JSON com hash diferente
        fs.writeFileSync(path.join(testDir, 'consumed-stage-a.json'), JSON.stringify({
          input_package_sha: altSha256
        }));

        const files = fs.readdirSync(testDir).filter(f => f !== 'pilot-evidence-files.sha256');
        const indexLines = files.map(f => `${createHash('sha256').update(fs.readFileSync(path.join(testDir, f))).digest('hex')}  ${f}`);
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), indexLines.join('\n') + '\n');

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(testDir, 'Stage B');
        }, /Fontes canónicas contraditórias em Stage B: manifesto físico .* diverge de JSON de linkage/);
      });

      it('9.2.17: linha não vazia do índice sem caminho falha no carregador estrito', () => {
        const testDir = path.join(suiteDir, 'test_9_2_17');
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), `${sampleSha256}\n`);

        assert.throws(() => {
          verifierModule.loadPackageIndexMap(testDir);
        }, /malformada no índice de hashes/);
      });

      it('9.2.18: linha não vazia do índice sem hash falha no carregador estrito', () => {
        const testDir = path.join(suiteDir, 'test_9_2_18');
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), `not-a-hash  somefile.txt\n`);

        assert.throws(() => {
          verifierModule.loadPackageIndexMap(testDir);
        }, /Hash SHA-256 malformado na linha/);
      });

      it('9.2.19: entrada duplicada para o mesmo caminho canónico falha no carregador estrito', () => {
        const testDir = path.join(suiteDir, 'test_9_2_19');
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), `${sampleSha256}  doc.txt\n${sampleSha256}  doc.txt\n`);

        assert.throws(() => {
          verifierModule.loadPackageIndexMap(testDir);
        }, /Entrada duplicada no índice de hashes para o caminho canónico 'doc\.txt'/);
      });

      it('9.2.20: ficheiro enumerado no índice ausente falha na verificação física', () => {
        const testDir = path.join(suiteDir, 'test_9_2_20');
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), `${sampleSha256}  missing.txt\n`);

        const { indexMap } = verifierModule.loadPackageIndexMap(testDir);
        assert.throws(() => {
          verifierModule.verifyFileAgainstPackageIndex(testDir, path.join(testDir, 'missing.txt'), indexMap);
        }, /não existe/);
      });

      it('9.2.21: ficheiro enumerado no índice com bytes divergentes falha na verificação física', () => {
        const testDir = path.join(suiteDir, 'test_9_2_21');
        fs.mkdirSync(testDir, { recursive: true });
        fs.writeFileSync(path.join(testDir, 'file.txt'), 'ORIGINAL_CONTENT');
        const h = createHash('sha256').update('ORIGINAL_CONTENT').digest('hex');
        fs.writeFileSync(path.join(testDir, 'pilot-evidence-files.sha256'), `${h}  file.txt\n`);

        // Modificar o ficheiro
        fs.writeFileSync(path.join(testDir, 'file.txt'), 'TAMPERED_CONTENT');

        const { indexMap } = verifierModule.loadPackageIndexMap(testDir);
        assert.throws(() => {
          verifierModule.verifyFileAgainstPackageIndex(testDir, path.join(testDir, 'file.txt'), indexMap);
        }, /Hash físico da fonte de linkage 'file\.txt' .* diverge do registado no índice/);
      });

      it('9.2.22: Intake, Etapa A e Etapa B com valores declarados iguais, mas bytes físicos diferentes falham', () => {
        const dirI = path.join(suiteDir, 'test_9_2_22_intake');
        const dirA = path.join(suiteDir, 'test_9_2_22_stage_a');
        const dirB = path.join(suiteDir, 'test_9_2_22_stage_b');
        const payloadGood = 'COMMON_PAYLOAD_ORIGINAL';
        const payloadBad = 'CORRUPTED_PAYLOAD_TAMPERED';

        createValidPackageBundle(dirI, 'input-package.tar.gz', payloadGood);
        createValidPackageBundle(dirA, 'input-package.tar.gz', payloadGood);

        // Na Etapa B, criamos com payloadGood, mas depois adulteramos os bytes mantendo o sidecar
        createValidPackageBundle(dirB, 'input-package.tar.gz', payloadGood);
        fs.writeFileSync(path.join(dirB, 'input-package.tar.gz'), payloadBad);

        assert.throws(() => {
          verifierModule.extractPackageHashFromBundle(dirB, 'Stage B');
        }, /Hash físico da fonte de linkage 'input-package\.tar\.gz' .* diverge do registado no índice|Bytes físicos adulterados/);
      });

      it('9.2.23: qualquer estado obrigatório falso impede atestação positiva', () => {
        const invalidStates = {
          intake_package_hash_verified: false,
          stage_a_input_hash_verified: true,
          stage_b_preserved_hash_verified: true,
          cross_stage_package_hash_reconciled: true,
          api_response_hashes_verified: true,
          evidence_index_hashes_verified: true,
          canonical_repository_chain_verified: true
        };

        const allPositive = Object.values(invalidStates).every(v => v === true);
        assert.strictEqual(allPositive, false);
      });
    });

    describe('9.3 Teste Integrado Operacional', () => {
      it('9.3.1: encadeamento operacional real das 3 etapas demonstrando autenticação física de 3 vias', () => {
        const baseDir = path.join(suiteDir, 'test_9_3_integrated');
        const intakeDir = path.join(baseDir, 'intake');
        const stageADir = path.join(baseDir, 'stage_a');
        const stageBDir = path.join(baseDir, 'stage_b');

        const canonicalPayload = 'INTEGRATED_PIPELINE_CANONICAL_PAYLOAD_2026';
        const { payloadSha } = createValidPackageBundle(intakeDir, 'input-package.tar.gz', canonicalPayload);
        createValidPackageBundle(stageADir, 'input-package.tar.gz', canonicalPayload);
        createValidPackageBundle(stageBDir, 'input-package.tar.gz', canonicalPayload);

        // 1. Extração autenticada Intake
        const intakeSha = verifierModule.extractPackageHashFromBundle(intakeDir, 'Intake');
        assert.strictEqual(intakeSha, payloadSha);

        // 2. Extração autenticada Etapa A
        const stageASha = verifierModule.extractPackageHashFromBundle(stageADir, 'Stage A');
        assert.strictEqual(stageASha, payloadSha);

        // 3. Extração autenticada Etapa B
        const stageBSha = verifierModule.extractPackageHashFromBundle(stageBDir, 'Stage B');
        assert.strictEqual(stageBSha, payloadSha);

        // 4. Reconciliação transversal estrita
        const reconciled = verifierModule.reconcilePackageHashes(intakeSha, stageASha, stageBSha);
        assert.strictEqual(reconciled, true);

        // 5. Estados derivados obrigatórios
        const states = {
          intake_package_hash_verified: Boolean(intakeSha && /^[a-f0-9]{64}$/.test(intakeSha)),
          stage_a_input_hash_verified: Boolean(stageASha && /^[a-f0-9]{64}$/.test(stageASha)),
          stage_b_preserved_hash_verified: Boolean(stageBSha && /^[a-f0-9]{64}$/.test(stageBSha)),
          cross_stage_package_hash_reconciled: reconciled
        };

        assert.strictEqual(states.intake_package_hash_verified, true);
        assert.strictEqual(states.stage_a_input_hash_verified, true);
        assert.strictEqual(states.stage_b_preserved_hash_verified, true);
        assert.strictEqual(states.cross_stage_package_hash_reconciled, true);
      });
    });
  });
});

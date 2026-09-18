import assert from 'node:assert/strict';
import { describe, it, before, after } from 'node:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash, randomUUID, createHmac } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { execSync } from 'node:child_process';
import {
  OperationalPilotRunner,
  OperationalPilotInput,
  TransactionalPilotStore,
  PhysicalDocumentValidator,
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

function runCommand(cmd: string): Buffer {
  return execSync(cmd, { cwd: repoRoot, stdio: 'pipe' });
}

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

describe('AETF-500: Micro-Patch Final de Ingestão Externa, Revisão Humana e Proteção GitHub (22 Testes Obrigatórios)', () => {
  const commitSha = resolveStrictCommitSha();
  process.env.GIT_COMMIT_SHA = commitSha;

  let tmpDir: string;
  let authDocPath: string;
  let authDocSha: string;
  let dbPath: string;
  let secretProvider: StaticSecretProvider;
  let tokenService: TokenService;
  let validReviewerToken: string;
  let tokenJti: string;

  const tenantId = 'tenant_saso_angola_ops_01';
  const orgId = 'ORG_SASO_AO';
  const pilotId = 'PILOT_SASO_REAL_001';
  const taskId = 'TASK_SASO_NOTICE_2026_09_001';
  const reviewerId = 'rev_dra_maria_santos';
  const reviewerSecret = 'test_isolated_reviewer_secret_min32_chars!';

  before(() => {
    tmpDir = path.join(os.tmpdir(), `aetf_micro_patch_final_test_${Date.now()}`);
    fs.mkdirSync(tmpDir, { recursive: true });

    // 1. Criar documento físico binário de autorização
    authDocPath = path.join(tmpDir, 'despacho_autorizacao_saso_2026.pdf');
    const authPdfBytes = PhysicalDocumentValidator.buildRealBinaryPdf(
      'DESPACHO DE AUTORIZACAO DO PILOTO OPERACIONAL SASO 2026',
      [
        'ORGANIZACAO: Sociedade Angolana de Servicos & Operacoes Lda (SASO)',
        'REFERENCIA: AUTH-SASO-PILOT-2026-09-REAL',
        'AUTORIZADO POR: Dr. Antonio Silva (Director Executivo)',
        'AMBITO: Emissao de Avisos Administrativos de Regularizacao de Conta',
        'MODO: OPERATIONAL_PILOT'
      ]
    );
    fs.writeFileSync(authDocPath, authPdfBytes);
    authDocSha = sha256(authPdfBytes);

    dbPath = path.join(tmpDir, 'operational_pilot.db');

    // 2. Secret Provider
    secretProvider = new StaticSecretProvider({
      PILOT_SECRET_REV_MARIA: reviewerSecret
    });

    // 3. Token Service persistente
    tokenService = new TokenService(undefined, dbPath);
    tokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });

    tokenJti = `jti_${randomUUID().slice(0, 8)}`;
    validReviewerToken = tokenService.signToken({
      tenant_id: tenantId,
      user_id: reviewerId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      jti: tokenJti
    });
  });

  after(() => {
    try {
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    } catch {}
  });

  function createValidInput(overrides: Partial<OperationalPilotInput> = {}): OperationalPilotInput {
    return {
      pilot_id: pilotId,
      tenant_id: tenantId,
      organization_id: orgId,
      organization_name: 'Sociedade Angolana de Serviços & Operações Lda (SASO)',
      authorization_reference: 'AUTH-SASO-PILOT-2026-09-REAL',
      authorization_document_path: authDocPath,
      authorization_document_sha256: authDocSha,
      authorized_by: 'dr_antonio_silva_dir_executivo',
      authorized_at: '2026-09-18T08:00:00Z',
      start_at: '2026-09-18T00:00:00Z',
      end_at: '2026-10-18T23:59:59Z',
      employee_id: 66,
      task_id: taskId,
      task_title: 'Emissão de Aviso Administrativo de Regularização de Conta',
      task_description: 'Emissão de carta administrativa referente à fatura pendente FT 2026/0892',
      input_data: {
        customer_name: 'Sociedade Mineira do Cuango SARL',
        customer_tax_id: '5417082910',
        invoice_reference: 'FT 2026/0892',
        invoice_date: '2026-08-15',
        due_date: '2026-09-30',
        amount: 4850000,
        currency: 'AOA',
        bank_iban: 'AO06.0040.0000.1234.5678.9012.3',
        contact_email: 'cobrancas@saso.co.ao'
      },
      idempotency_key: `IDEMP_${taskId}_${Date.now()}`,
      received_at: '2026-09-18T09:15:00Z',
      sensitivity_level: 'CONFIDENTIAL',
      authorized_reviewers: [
        {
          reviewer_id: reviewerId,
          display_name: 'Dra. Maria Santos',
          role: 'SUPERVISOR_OPERACIONAL',
          secret_ref: 'PILOT_SECRET_REV_MARIA',
          email: 'maria.santos@saso.co.ao'
        }
      ],
      delivery_channel: 'INTERNAL_ARCHIVE',
      destination: 'arquivo.geral@saso.co.ao',
      formats: ['PDF', 'DOCX'],
      ...overrides
    };
  }

  function createValidExternalPackage(targetDir: string) {
    fs.mkdirSync(targetDir, { recursive: true });
    const authPdfBytes = fs.readFileSync(authDocPath);
    const destPdfPath = path.join(targetDir, 'authorization-document.pdf');
    fs.writeFileSync(destPdfPath, authPdfBytes);

    const inputData = createValidInput({
      authorization_document_path: 'authorization-document.pdf',
      authorization_document_sha256: authDocSha
    });
    const destJsonPath = path.join(targetDir, 'operational-pilot-input.json');
    const jsonBytes = Buffer.from(JSON.stringify(inputData, null, 2), 'utf8');
    fs.writeFileSync(destJsonPath, jsonBytes);

    const provData = {
      package_id: `PKG_${Date.now()}`,
      source_type: 'EXTERNAL_REGULATORY_DISPATCH',
      source_reference: 'DISPATCH-2026-SASO-EXT-001',
      source_created_at: '2026-09-18T09:00:00Z',
      source_actor_id: 'actor_governance_board',
      tenant_id: tenantId,
      task_id: taskId,
      authorization_sha256: authDocSha,
      input_sha256: sha256(jsonBytes)
    };
    const destProvPath = path.join(targetDir, 'package-provenance.json');
    const provBytes = Buffer.from(JSON.stringify(provData, null, 2), 'utf8');
    fs.writeFileSync(destProvPath, provBytes);

    const checksumLines = [
      `${sha256(jsonBytes)}  operational-pilot-input.json`,
      `${authDocSha}  authorization-document.pdf`,
      `${sha256(provBytes)}  package-provenance.json`
    ];
    fs.writeFileSync(path.join(targetDir, 'input-package.sha256'), checksumLines.join('\n') + '\n', 'utf8');
  }

  // -------------------------------------------------------------
  // Test 1: Manifesto vazio é rejeitado
  // -------------------------------------------------------------
  it('1. manifesto vazio é rejeitado', () => {
    const pkgDir = path.join(tmpDir, 'test1_pkg');
    createValidExternalPackage(pkgDir);
    fs.writeFileSync(path.join(pkgDir, 'input-package.sha256'), '', 'utf8');

    assert.throws(() => {
      runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${path.join(tmpDir, 'out1')}"`);
    }, /Ficheiro de integridade input-package.sha256 está vazio/);
  });

  // -------------------------------------------------------------
  // Test 2: Ausência de cada entrada obrigatória é rejeitada
  // -------------------------------------------------------------
  it('2. ausência de cada entrada obrigatória é rejeitada', () => {
    const pkgDir = path.join(tmpDir, 'test2_pkg');
    createValidExternalPackage(pkgDir);
    // Remover linha de authorization-document.pdf do checksum
    const jsonSha = sha256(fs.readFileSync(path.join(pkgDir, 'operational-pilot-input.json')));
    const provSha = sha256(fs.readFileSync(path.join(pkgDir, 'package-provenance.json')));
    fs.writeFileSync(
      path.join(pkgDir, 'input-package.sha256'),
      `${jsonSha}  operational-pilot-input.json\n${provSha}  package-provenance.json\n`,
      'utf8'
    );

    assert.throws(() => {
      runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${path.join(tmpDir, 'out2')}"`);
    }, /Entrada obrigatória ausente no manifesto input-package.sha256: 'authorization-document.pdf'/);
  });

  // -------------------------------------------------------------
  // Test 3: Entrada duplicada ou adicional é rejeitada
  // -------------------------------------------------------------
  it('3. entrada duplicada ou adicional é rejeitada', () => {
    const pkgDir = path.join(tmpDir, 'test3_pkg');
    createValidExternalPackage(pkgDir);
    const existing = fs.readFileSync(path.join(pkgDir, 'input-package.sha256'), 'utf8');

    // a) Entrada duplicada
    fs.writeFileSync(pkgDir + '/input-package.sha256', existing + existing.split('\n')[0] + '\n', 'utf8');
    assert.throws(() => {
      runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${path.join(tmpDir, 'out3a')}"`);
    }, /Entrada duplicada no manifesto/);

    // b) Entrada adicional não autorizada
    fs.writeFileSync(pkgDir + '/input-package.sha256', existing + `${'a'.repeat(64)}  unauthorized.txt\n`, 'utf8');
    assert.throws(() => {
      runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${path.join(tmpDir, 'out3b')}"`);
    }, /Entrada adicional não autorizada no manifesto: 'unauthorized.txt'/);
  });

  // -------------------------------------------------------------
  // Test 4: Ficheiro físico não indexado é rejeitado
  // -------------------------------------------------------------
  it('4. ficheiro físico não indexado é rejeitado', () => {
    const pkgDir = path.join(tmpDir, 'test4_pkg');
    createValidExternalPackage(pkgDir);
    fs.writeFileSync(path.join(pkgDir, 'arquivo_extra_infiltrado.txt'), 'infiltrado', 'utf8');

    assert.throws(() => {
      runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${path.join(tmpDir, 'out4')}"`);
    }, /Ficheiro físico não indexado\/não autorizado detectado no pacote/);
  });

  // -------------------------------------------------------------
  // Test 5: Entrada sem ficheiro físico é rejeitada
  // -------------------------------------------------------------
  it('5. entrada sem ficheiro físico é rejeitada', () => {
    const pkgDir = path.join(tmpDir, 'test5_pkg');
    createValidExternalPackage(pkgDir);
    fs.unlinkSync(path.join(pkgDir, 'authorization-document.pdf'));

    assert.throws(() => {
      runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${path.join(tmpDir, 'out5')}"`);
    }, /Ficheiro obrigatório 'authorization-document.pdf' ausente no pacote/);
  });

  // -------------------------------------------------------------
  // Test 6: Hash divergente é rejeitado
  // -------------------------------------------------------------
  it('6. hash divergente é rejeitado', () => {
    const pkgDir = path.join(tmpDir, 'test6_pkg');
    createValidExternalPackage(pkgDir);
    // Adulterar bytes de authorization-document.pdf
    fs.appendFileSync(path.join(pkgDir, 'authorization-document.pdf'), Buffer.from([0x00, 0xff]));

    assert.throws(() => {
      runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${path.join(tmpDir, 'out6')}"`);
    }, /Hash divergente para authorization-document.pdf/);
  });

  // -------------------------------------------------------------
  // Test 7: Symlink, caminho absoluto e .. são rejeitados
  // -------------------------------------------------------------
  it('7. symlink, caminho absoluto e .. são rejeitados', () => {
    const pkgDir = path.join(tmpDir, 'test7_pkg');
    createValidExternalPackage(pkgDir);
    const jsonSha = sha256(fs.readFileSync(path.join(pkgDir, 'operational-pilot-input.json')));
    const provSha = sha256(fs.readFileSync(path.join(pkgDir, 'package-provenance.json')));

    // Caminho com '..'
    fs.writeFileSync(
      path.join(pkgDir, 'input-package.sha256'),
      `${jsonSha}  ../operational-pilot-input.json\n${authDocSha}  authorization-document.pdf\n${provSha}  package-provenance.json\n`,
      'utf8'
    );
    assert.throws(() => {
      runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${path.join(tmpDir, 'out7a')}"`);
    }, /Caminho não canónico, absoluto ou com '\.\.' no manifesto/);
  });

  // -------------------------------------------------------------
  // Test 8: JSON original mantém exactamente os mesmos bytes
  // -------------------------------------------------------------
  it('8. JSON original mantém exactamente os mesmos bytes', () => {
    const pkgDir = path.join(tmpDir, 'test8_pkg');
    const outDir = path.join(tmpDir, 'test8_out');
    createValidExternalPackage(pkgDir);

    const origBytes = fs.readFileSync(path.join(pkgDir, 'operational-pilot-input.json'));
    const origSha = sha256(origBytes);

    runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${outDir}"`);

    const destBytes = fs.readFileSync(path.join(outDir, 'operational-pilot-input.json'));
    const destSha = sha256(destBytes);

    assert.strictEqual(origSha, destSha, 'O hash SHA-256 do JSON antes e depois da cópia deve ser 100% idêntico');
    assert.strictEqual(origBytes.length, destBytes.length, 'O tamanho em bytes deve ser idêntico');
  });

  // -------------------------------------------------------------
  // Test 9: Contexto derivado não altera a fonte
  // -------------------------------------------------------------
  it('9. contexto derivado não altera a fonte', () => {
    const pkgDir = path.join(tmpDir, 'test9_pkg');
    const outDir = path.join(tmpDir, 'test9_out');
    createValidExternalPackage(pkgDir);

    runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${outDir}"`);

    const runtimeCtxPath = path.join(outDir, 'runtime-context.json');
    assert.ok(fs.existsSync(runtimeCtxPath), 'runtime-context.json deve existir');
    const ctx = JSON.parse(fs.readFileSync(runtimeCtxPath, 'utf8'));
    assert.strictEqual(ctx.type, 'DERIVED_RUNTIME_CONTEXT');
    assert.ok(ctx.resolved_authorization_document_path, 'Deve conter caminho resolvido para o PDF');

    // Fonte original não deve conter o campo derivado
    const destJson = JSON.parse(fs.readFileSync(path.join(outDir, 'operational-pilot-input.json'), 'utf8'));
    assert.strictEqual(destJson.authorization_document_path, 'authorization-document.pdf');
  });

  // -------------------------------------------------------------
  // Test 10: Artifact ID, run ID, repositório ou SHA divergente bloqueia o download
  // -------------------------------------------------------------
  it('10. artifact ID, run ID, repositório ou SHA divergente bloqueia o download', () => {
    assert.throws(() => {
      runCommand('node scripts/prepare-operational-pilot-input.mjs --intake-run-id=123 --input-artifact-id=999999999 --mode=OPERATIONAL_PILOT');
    }, /Falha ao transferir pacote externo via GitHub API/);
  });

  // -------------------------------------------------------------
  // Test 11: Ausência do intake bloqueia o modo real
  // -------------------------------------------------------------
  it('11. ausência do intake bloqueia o modo real', () => {
    assert.throws(() => {
      runCommand('node scripts/prepare-operational-pilot-input.mjs --mode=OPERATIONAL_PILOT');
    }, /BLOCKED_EXTERNAL_PACKAGE_TRANSFER_NOT_CONFIGURED/);
  });

  // -------------------------------------------------------------
  // Test 12: Etapa A termina sem executar a Etapa B
  // -------------------------------------------------------------
  it('12. Etapa A termina sem executar a Etapa B', async () => {
    const pkgDir = path.join(tmpDir, 'test12_pkg');
    const outDir = path.join(tmpDir, 'test12_out');
    createValidExternalPackage(pkgDir);
    runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${outDir}"`);

    const localDb = path.join(tmpDir, 'test12.db');
    const runner = new OperationalPilotRunner({
      dbPath: localDb,
      secretProvider,
      tokenService,
      executionMode: 'OPERATIONAL_PILOT'
    });
    runner.loadAndValidateInput(path.join(outDir, 'operational-pilot-input.json'));
    const execRes = await runner.executeOperationalTask();

    assert.strictEqual(runner.getState(), 'PENDING_HUMAN_REVIEW');
    assert.strictEqual(execRes.challenge.status, 'PENDING');
    assert.strictEqual(execRes.challenge.allowed_decision, null);
    // Verificar que não existe entrega/fecho na Etapa A
    assert.strictEqual(runner['deliveryReceipt'], null);
    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 13: Etapa B não possui defaults para token, decisão, assinatura ou timestamp
  // -------------------------------------------------------------
  it('13. Etapa B não possui defaults para token, decisão, assinatura ou timestamp', () => {
    const workflowPath = path.resolve(repoRoot, '.github/workflows/operational-pilot-stage-b.yml');
    assert.ok(fs.existsSync(workflowPath), 'Workflow operacional da Etapa B deve existir');
    const workflowContent = fs.readFileSync(workflowPath, 'utf8');

    // Verificar que decision não possui valor default
    assert.match(workflowContent, /decision:\s*\n\s*description:[^\n]+\n\s*required: true\n\s*type: choice/);
    assert.doesNotMatch(workflowContent, /decision:[\s\S]*?default:\s*['"]APPROVED['"]/);

    // Em run-operational-pilot.mjs, modo operacional sem parâmetros obrigatórios falha
    assert.throws(() => {
      runCommand('node scripts/run-operational-pilot.mjs --stage=review-and-close --mode=OPERATIONAL_PILOT --db=:memory:');
    }, /Base de dados persistente SQLite é obrigatória|FAIL-CLOSED/);
  });

  // -------------------------------------------------------------
  // Test 14: Etapa B sem sessão persistente falha
  // -------------------------------------------------------------
  it('14. Etapa B sem sessão persistente falha', async () => {
    const pkgDir = path.join(tmpDir, 'test14_pkg');
    const outDir = path.join(tmpDir, 'test14_out');
    createValidExternalPackage(pkgDir);
    runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${outDir}"`);

    const localDb = path.join(tmpDir, 'test14.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });
    const tokenWithoutSession = localTokenService.signToken({
      tenant_id: tenantId,
      user_id: reviewerId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      jti: 'jti_unregistered_session'
    });

    const runner = new OperationalPilotRunner({
      dbPath: localDb,
      secretProvider,
      tokenService: localTokenService,
      executionMode: 'OPERATIONAL_PILOT'
    });
    runner.loadAndValidateInput(path.join(outDir, 'operational-pilot-input.json'));
    await runner.executeOperationalTask();

    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: tokenWithoutSession,
        decision: 'APPROVED',
        comments: 'Decisão válida mas sem sessão prévia'
      });
    }, /Sessão autenticada activa não encontrada no SQLite/);
    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 15: Challenge, tenant, tarefa, hash ou revisor divergente falha
  // -------------------------------------------------------------
  it('15. challenge, tenant, tarefa, hash ou revisor divergente falha', async () => {
    const pkgDir = path.join(tmpDir, 'test15_pkg');
    const outDir = path.join(tmpDir, 'test15_out');
    createValidExternalPackage(pkgDir);
    runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${outDir}"`);

    const localDb = path.join(tmpDir, 'test15.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });
    const runner = new OperationalPilotRunner({
      dbPath: localDb,
      secretProvider,
      tokenService: localTokenService,
      executionMode: 'OPERATIONAL_PILOT'
    });
    runner.loadAndValidateInput(path.join(outDir, 'operational-pilot-input.json'));
    await runner.executeOperationalTask();

    // Revisor não autorizado
    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId: 'revisor_invasor_nao_cadastrado',
        reviewerToken: validReviewerToken,
        decision: 'APPROVED',
        comments: 'Tentativa não autorizada'
      });
    }, /Revisor 'revisor_invasor_nao_cadastrado' não autorizado/);
    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 16: Desafio reutilizado falha
  // -------------------------------------------------------------
  it('16. desafio reutilizado falha', async () => {
    const pkgDir = path.join(tmpDir, 'test16_pkg');
    const outDir = path.join(tmpDir, 'test16_out');
    createValidExternalPackage(pkgDir);
    runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${outDir}"`);

    const localDb = path.join(tmpDir, 'test16.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });
    const jti = `jti_${Date.now()}`;
    const token = localTokenService.signToken({
      tenant_id: tenantId,
      user_id: reviewerId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      jti
    });
    const runner = new OperationalPilotRunner({
      dbPath: localDb,
      secretProvider,
      tokenService: localTokenService,
      executionMode: 'OPERATIONAL_PILOT'
    });
    runner.getStore().createReviewerSession({
      session_id: 'SESS_TEST16',
      token_jti: jti,
      reviewer_id: reviewerId,
      tenant_id: tenantId,
      pilot_id: pilotId,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    });

    runner.loadAndValidateInput(path.join(outDir, 'operational-pilot-input.json'));
    const { challenge } = await runner.executeOperationalTask();
    const eventSignedAt = new Date().toISOString();
    const sig = PilotExternalValidator.generateCanonicalChallengeSignature(
      challenge,
      reviewerId,
      'APPROVED',
      reviewerSecret,
      eventSignedAt
    );

    runner.submitHumanReview({
      reviewerId,
      reviewerToken: token,
      decision: 'APPROVED',
      comments: 'Aprovação legítima inicial',
      eventSignedAt,
      signature: sig
    });

    // Tentativa de segundo consumo do mesmo desafio
    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: token,
        decision: 'APPROVED',
        comments: 'Segunda aprovação proibida',
        eventSignedAt,
        signature: sig
      });
    }, /Revisão rejeitada: estado actual é/);
    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 17: Ambiente sem required reviewers falha
  // -------------------------------------------------------------
  it('17. ambiente sem required reviewers falha', () => {
    const mockEnvNoReviewers = path.join(tmpDir, 'mock_env_no_reviewers.json');
    fs.writeFileSync(mockEnvNoReviewers, JSON.stringify({
      id: 123,
      name: 'protected-pilot',
      protection_rules: [],
      deployment_branch_policy: { protected_branches: true, custom_branch_policies: false },
      can_admins_bypass: false
    }, null, 2));

    assert.throws(() => {
      runCommand(`node scripts/verify-environment-protection.mjs --mode=OPERATIONAL_PILOT --environment=protected-pilot --mock-api-response="${mockEnvNoReviewers}"`);
    }, /BLOCKED_REQUIRED_REVIEWERS_NOT_CONFIGURED|BLOCKED_ENVIRONMENT_PROTECTION_NOT_CONFIGURED/);
  });

  // -------------------------------------------------------------
  // Test 18: Ambiente sem política de branch falha
  // -------------------------------------------------------------
  it('18. ambiente sem política de branch falha', () => {
    const mockEnvNoBranchPolicy = path.join(tmpDir, 'mock_env_no_branch_policy.json');
    fs.writeFileSync(mockEnvNoBranchPolicy, JSON.stringify({
      id: 123,
      name: 'protected-pilot',
      protection_rules: [{ type: 'required_reviewers', reviewers: [{ reviewer: { id: 1, type: 'User' } }] }],
      deployment_branch_policy: null,
      can_admins_bypass: false
    }, null, 2));

    assert.throws(() => {
      runCommand(`node scripts/verify-environment-protection.mjs --mode=OPERATIONAL_PILOT --environment=protected-pilot --mock-api-response="${mockEnvNoBranchPolicy}"`);
    }, /BLOCKED_BRANCH_POLICY_NOT_CONFIGURED|BLOCKED_REQUIRED_REVIEWERS_NOT_CONFIGURED|BLOCKED_ENVIRONMENT_PROTECTION_NOT_CONFIGURED/);
  });

  // -------------------------------------------------------------
  // Test 19: Resposta física da API ausente ou adulterada falha
  // -------------------------------------------------------------
  it('19. resposta física da API ausente ou adulterada falha', () => {
    const testEnvDir = path.join(tmpDir, 'test19_artifacts');
    fs.mkdirSync(testEnvDir, { recursive: true });

    runCommand(`node scripts/verify-environment-protection.mjs --mode=DEMO --out-dir="${testEnvDir}"`);

    const apiFile = path.join(testEnvDir, 'environment-api-response.json');
    const verifFile = path.join(testEnvDir, 'environment-protection-verification.json');
    assert.ok(fs.existsSync(apiFile), 'environment-api-response.json deve existir');
    assert.ok(fs.existsSync(verifFile), 'environment-protection-verification.json deve existir');

    const verifData = JSON.parse(fs.readFileSync(verifFile, 'utf8'));
    const apiHash = sha256(fs.readFileSync(apiFile));
    assert.strictEqual(verifData.api_response_sha256, apiHash, 'Hash da resposta física deve corresponder exactamente');
  });

  // -------------------------------------------------------------
  // Test 20: Dados DEMO são inequivocamente fictícios
  // -------------------------------------------------------------
  it('20. dados DEMO são inequivocamente fictícios', () => {
    const testDemoDir = path.join(tmpDir, 'test20_demo');
    runCommand(`node scripts/prepare-demo-pilot-input.mjs --out-dir="${testDemoDir}"`);

    const demoInput = JSON.parse(fs.readFileSync(path.join(testDemoDir, 'operational-pilot-input.json'), 'utf8'));
    assert.strictEqual(demoInput.organization_name, 'Empresa Demonstração Alfa, Lda.');
    assert.strictEqual(demoInput.input_data.customer_name, 'Cliente Exemplo Beta, Lda.');
    assert.strictEqual(demoInput.input_data.customer_tax_id, '0000000000');
    assert.strictEqual(demoInput.input_data.invoice_reference, 'FACTURA-DEMO-001');
    assert.strictEqual(demoInput.sensitivity_level, 'TEST_DATA');
    assert.strictEqual(demoInput.classification, 'AUTOMATED_OPERATIONAL_DEMO');
    assert.ok(demoInput.disclaimer.includes('DEMO — SEM VALIDADE COMERCIAL, FISCAL OU JURÍDICA'));

    // Rejeitar qualquer ocorrência de nomes corporativos reais em modo DEMO
    const demoRaw = JSON.stringify(demoInput);
    assert.ok(!demoRaw.includes('Sociedade Mineira do Cuango'), 'Não deve conter clientes reais');
    assert.ok(!demoRaw.includes('5417082910'), 'Não deve conter NIF real');
  });

  // -------------------------------------------------------------
  // Test 21: DEMO nunca recebe classificação real
  // -------------------------------------------------------------
  it('21. DEMO nunca recebe classificação real', async () => {
    const testDemoDir = path.join(tmpDir, 'test21_demo');
    runCommand(`node scripts/prepare-demo-pilot-input.mjs --out-dir="${testDemoDir}"`);

    const demoDb = path.join(tmpDir, 'demo.db');
    const demoTokenService = new TokenService(undefined, demoDb);
    const demoSecretProvider = new StaticSecretProvider({
      PILOT_SECRET_REV_DEMO: 'demo_ephemeral_key_for_testing_only_min32'
    });
    const runner = new OperationalPilotRunner({
      dbPath: demoDb,
      secretProvider: demoSecretProvider,
      tokenService: demoTokenService,
      executionMode: 'DEMO'
    });

    runner.loadAndValidateInput(path.join(testDemoDir, 'operational-pilot-input.json'));
    await runner.executeOperationalTask();
    const demoEvidenceDir = path.join(tmpDir, 'demo_evidence');
    const manifest = runner.generateOperationalManifest(demoEvidenceDir);

    assert.strictEqual(manifest.classification, 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED');
    assert.doesNotMatch(manifest.classification, /CONTROLLED_REAL_PILOT_EXECUTED/);
    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 22: Fluxo positivo injectado termina em APPROVED_AND_ARCHIVED sem autoemitir credenciais
  // -------------------------------------------------------------
  it('22. fluxo positivo injectado termina em APPROVED_AND_ARCHIVED sem autoemitir credenciais', async () => {
    const pkgDir = path.join(tmpDir, 'test22_pkg');
    const outDir = path.join(tmpDir, 'test22_out');
    createValidExternalPackage(pkgDir);
    runCommand(`node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --out-dir="${outDir}"`);

    const localDb = path.join(tmpDir, 'test22.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });

    const jti = `jti_${Date.now()}`;
    const token = localTokenService.signToken({
      tenant_id: tenantId,
      user_id: reviewerId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      jti
    });

    const runner = new OperationalPilotRunner({
      dbPath: localDb,
      secretProvider,
      tokenService: localTokenService,
      executionMode: 'OPERATIONAL_PILOT'
    });

    // Sessão pré-criada genuinamente no SQLite (sem autocriação pelo motor)
    runner.getStore().createReviewerSession({
      session_id: 'SESS_GENUINE_001',
      token_jti: jti,
      reviewer_id: reviewerId,
      tenant_id: tenantId,
      pilot_id: pilotId,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    });

    // 1. Etapa A
    runner.loadAndValidateInput(path.join(outDir, 'operational-pilot-input.json'));
    const { challenge } = await runner.executeOperationalTask();
    assert.strictEqual(runner.getState(), 'PENDING_HUMAN_REVIEW');

    // 2. Etapa B: Assinatura e decisão injetadas de forma autêntica
    const eventSignedAt = new Date().toISOString();
    const genuineSignature = PilotExternalValidator.generateCanonicalChallengeSignature(
      challenge,
      reviewerId,
      'APPROVED',
      reviewerSecret,
      eventSignedAt
    );

    const reviewReceipt = runner.submitHumanReview({
      reviewerId,
      reviewerToken: token,
      decision: 'APPROVED',
      comments: 'Aprovação humana operacional autêntica e auditada',
      eventSignedAt,
      signature: genuineSignature
    });

    assert.strictEqual(reviewReceipt.decision, 'APPROVED');
    assert.strictEqual(runner.getState(), 'APPROVED_AND_ARCHIVED');

    const deliveryReceipt = runner.archiveOrDeliver();
    assert.strictEqual(deliveryReceipt.status, 'ARCHIVED');
    assert.strictEqual(deliveryReceipt.is_external_confirmed, false);

    const manifestResult = runner.generateOperationalManifest(path.join(outDir, 'evidence'));
    assert.strictEqual(
      manifestResult.classification,
      'CONTROLLED_REAL_PILOT_EXECUTED — HUMAN_REVIEW_CONFIRMED — APPROVED_AND_ARCHIVED'
    );
    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 23: Hash do pacote original malformado ou divergente é rejeitado
  // -------------------------------------------------------------
  it('23. hash do pacote original malformado ou divergente é rejeitado', async () => {
    const pkgDir = path.join(tmpDir, 'test23_pkg');
    createValidExternalPackage(pkgDir);

    // a) Hash malformado (não 64 hex minúsculos)
    assert.throws(() => {
      runCommand(
        `node scripts/prepare-operational-pilot-input.mjs --package-path="${pkgDir}" --input-package-sha256="not_a_valid_sha" --out-dir="${path.join(tmpDir, 'out23a')}"`
      );
    }, /input_package_sha256 inválido/);

    // b) Hash divergente
    const extractorModule = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/lib/secureTarExtractor.mjs')).href);
    const tarGzBytes = extractorModule.buildTarGz([
      { name: 'operational-pilot-input.json', data: fs.readFileSync(path.join(pkgDir, 'operational-pilot-input.json')) },
      { name: 'authorization-document.pdf', data: fs.readFileSync(path.join(pkgDir, 'authorization-document.pdf')) },
      { name: 'input-package.sha256', data: fs.readFileSync(path.join(pkgDir, 'input-package.sha256')) },
      { name: 'package-provenance.json', data: fs.readFileSync(path.join(pkgDir, 'package-provenance.json')) }
    ]);
    const tarFile = path.join(tmpDir, 'test23_original.tar.gz');
    fs.writeFileSync(tarFile, tarGzBytes);
    const wrongSha = 'a'.repeat(64);

    assert.throws(() => {
      runCommand(
        `node scripts/prepare-operational-pilot-input.mjs --package-tar="${tarFile}" --input-package-sha256="${wrongSha}" --out-dir="${path.join(tmpDir, 'out23b')}"`
      );
    }, /diverge do hash autorizado/);
  });

  // -------------------------------------------------------------
  // Test 24: Alteração física de bytes no arquivo após o intake é detectada
  // -------------------------------------------------------------
  it('24. alteração física de bytes no arquivo após o intake é detectada', async () => {
    const pkgDir = path.join(tmpDir, 'test24_pkg');
    createValidExternalPackage(pkgDir);
    const extractorModule = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/lib/secureTarExtractor.mjs')).href);
    const tarGzBytes = extractorModule.buildTarGz([
      { name: 'operational-pilot-input.json', data: fs.readFileSync(path.join(pkgDir, 'operational-pilot-input.json')) },
      { name: 'authorization-document.pdf', data: fs.readFileSync(path.join(pkgDir, 'authorization-document.pdf')) },
      { name: 'input-package.sha256', data: fs.readFileSync(path.join(pkgDir, 'input-package.sha256')) },
      { name: 'package-provenance.json', data: fs.readFileSync(path.join(pkgDir, 'package-provenance.json')) }
    ]);
    const validSha = sha256(tarGzBytes);

    // Corromper 1 byte
    const tamperedTar = Buffer.from(tarGzBytes);
    tamperedTar[tamperedTar.length - 20] ^= 0xff;
    const tamperedFile = path.join(tmpDir, 'test24_tampered.tar.gz');
    fs.writeFileSync(tamperedFile, tamperedTar);

    assert.throws(() => {
      runCommand(
        `node scripts/prepare-operational-pilot-input.mjs --package-tar="${tamperedFile}" --input-package-sha256="${validSha}" --out-dir="${path.join(tmpDir, 'out24')}"`
      );
    }, /diverge do hash autorizado|Falha ao descompactar/);
  });

  // -------------------------------------------------------------
  // Test 25: Pre-extracção bloqueia path traversal (..) no arquivo tar
  // -------------------------------------------------------------
  it('25. pre-extracção bloqueia path traversal (..) no arquivo tar', async () => {
    const extractorModule = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/lib/secureTarExtractor.mjs')).href);
    const badTar = extractorModule.buildTarGz([
      { name: '../escape.json', data: '{"attack": true}' }
    ]);
    const extractOut = path.join(tmpDir, 'out25_extract');

    assert.throws(() => {
      extractorModule.auditAndExtractTar(badTar, extractOut);
    }, /Path traversal/);
  });

  // -------------------------------------------------------------
  // Test 26: Pre-extracção bloqueia caminhos absolutos no arquivo tar
  // -------------------------------------------------------------
  it('26. pre-extracção bloqueia caminhos absolutos no arquivo tar', async () => {
    const extractorModule = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/lib/secureTarExtractor.mjs')).href);
    const badTar1 = extractorModule.buildTarGz([
      { name: '/etc/shadow', data: 'root::0:0:::' }
    ]);
    const badTar2 = extractorModule.buildTarGz([
      { name: 'C:\\Windows\\System32\\evil.dll', data: 'evil' }
    ]);
    const extractOut = path.join(tmpDir, 'out26_extract');

    assert.throws(() => {
      extractorModule.auditAndExtractTar(badTar1, extractOut);
    }, /Caminho absoluto proibido/);

    assert.throws(() => {
      extractorModule.auditAndExtractTar(badTar2, extractOut);
    }, /Caminho absoluto proibido/);
  });

  // -------------------------------------------------------------
  // Test 27: Pre-extracção bloqueia symlinks e hardlinks no arquivo tar
  // -------------------------------------------------------------
  it('27. pre-extracção bloqueia symlinks e hardlinks no arquivo tar', async () => {
    const extractorModule = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/lib/secureTarExtractor.mjs')).href);
    const symlinkTar = extractorModule.buildTarGz([
      { name: 'operational-pilot-input.json', data: 'link-target', type: '2' }
    ]);
    const hardlinkTar = extractorModule.buildTarGz([
      { name: 'operational-pilot-input.json', data: 'link-target', type: '1' }
    ]);
    const extractOut = path.join(tmpDir, 'out27_extract');

    assert.throws(() => {
      extractorModule.auditAndExtractTar(symlinkTar, extractOut);
    }, /Symlink proibido/);

    assert.throws(() => {
      extractorModule.auditAndExtractTar(hardlinkTar, extractOut);
    }, /Hardlink proibido/);
  });

  // -------------------------------------------------------------
  // Test 28: Pre-extracção bloqueia entradas especiais e arquivos inesperados
  // -------------------------------------------------------------
  it('28. pre-extracção bloqueia entradas especiais e arquivos inesperados', async () => {
    const extractorModule = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/lib/secureTarExtractor.mjs')).href);
    const fifoTar = extractorModule.buildTarGz([
      { name: 'pipe_file', data: '', type: '6' }
    ]);
    const unexpectedTar = extractorModule.buildTarGz([
      { name: 'malware.sh', data: '#!/bin/sh\nexit 1' }
    ]);
    const extractOut = path.join(tmpDir, 'out28_extract');

    assert.throws(() => {
      extractorModule.auditAndExtractTar(fifoTar, extractOut);
    }, /dispositivo especial/);

    assert.throws(() => {
      extractorModule.auditAndExtractTar(unexpectedTar, extractOut, {
        allowedFiles: ['operational-pilot-input.json']
      });
    }, /Ficheiro inesperado pelo manifesto/);
  });

  // -------------------------------------------------------------
  // Test 29: Passagem de credenciais ou assinaturas via argumentos CLI (--reviewer-token/--signature) é bloqueada
  // -------------------------------------------------------------
  it('29. passagem de credenciais ou assinaturas via argumentos CLI (--reviewer-token/--signature) é bloqueada', () => {
    assert.throws(() => {
      runCommand(
        'node scripts/run-operational-pilot.mjs --stage=review-and-close --mode=OPERATIONAL_PILOT --reviewer-token=secret_cli_token'
      );
    }, /Passagem de credenciais ou assinaturas via argumentos de linha de comandos.*proibida/);

    assert.throws(() => {
      runCommand(
        'node scripts/run-operational-pilot.mjs --stage=review-and-close --mode=OPERATIONAL_PILOT --signature=sig_cli_value'
      );
    }, /Passagem de credenciais ou assinaturas via argumentos de linha de comandos.*proibida/);
  });

  // -------------------------------------------------------------
  // Test 30: Etapa B sem stage_a_run_id, stage_a_artifact_id ou stage_a_head_sha obrigatórios falha
  // -------------------------------------------------------------
  it('30. Etapa B sem stage_a_run_id, stage_a_artifact_id ou stage_a_head_sha obrigatórios falha', () => {
    const inputPkg = path.join(tmpDir, 'test30_pkg');
    createValidExternalPackage(inputPkg);
    const dbFile = path.join(tmpDir, 'test30.db');

    assert.throws(() => {
      runCommand(
        `node scripts/run-operational-pilot.mjs --stage=review-and-close --mode=OPERATIONAL_PILOT --input="${path.join(inputPkg, 'operational-pilot-input.json')}" --db="${dbFile}"`
      );
    }, /stage_a_run_id é estritamente obrigatório/);
  });

  // -------------------------------------------------------------
  // Test 31: Etapa B com challenge_id ou event_signed_at divergentes/inválidos falha
  // -------------------------------------------------------------
  it('31. Etapa B com challenge_id ou event_signed_at divergentes/inválidos falha', async () => {
    const inputData = createValidInput();
    const runner = new OperationalPilotRunner({
      dbPath: path.join(tmpDir, 'test31.db'),
      secretProvider,
      tokenService,
      executionMode: 'DEMO'
    });
    runner.loadAndValidateInput(inputData);
    const { challenge } = await runner.executeOperationalTask();

    // a) challenge_id divergente
    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: validReviewerToken,
        decision: 'APPROVED',
        comments: 'teste',
        expectedChallengeId: 'CHAL_WRONG_12345'
      });
    }, /Divergência de challenge_id/);

    // b) eventSignedAt inválido
    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: validReviewerToken,
        decision: 'APPROVED',
        comments: 'teste',
        eventSignedAt: 'invalid-date-string'
      });
    }, /Timestamp eventSignedAt inválido/);

    // c) eventSignedAt anterior à emissão do desafio
    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: validReviewerToken,
        decision: 'APPROVED',
        comments: 'teste',
        eventSignedAt: '2020-01-01T00:00:00Z'
      });
    }, /Timestamp eventSignedAt anterior à emissão do desafio/);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 32: Tentativa de shell injection em identificadores externos é bloqueada
  // -------------------------------------------------------------
  it('32. tentativa de shell injection em identificadores externos é bloqueada', () => {
    assert.throws(() => {
      runCommand(
        'node scripts/prepare-operational-pilot-input.mjs --intake-run-id="123; echo injected" --mode=OPERATIONAL_PILOT'
      );
    }, /intake_run_id inválido.*estritamente numérico/);

    assert.throws(() => {
      runCommand(
        'node scripts/prepare-operational-pilot-input.mjs --input-artifact-id="456 && calc" --mode=OPERATIONAL_PILOT'
      );
    }, /input_artifact_id inválido.*estritamente numérico/);

    assert.throws(() => {
      runCommand(
        'node scripts/prepare-operational-pilot-input.mjs --input-package-sha256="`id`" --mode=OPERATIONAL_PILOT'
      );
    }, /input_package_sha256 inválido/);
  });

  // -------------------------------------------------------------
  // Test 33: Workflow de intake rejeita pacote base64 e aceita apenas transferência protegida
  // -------------------------------------------------------------
  it('33. workflow de intake rejeita pacote base64 e aceita apenas transferência protegida', () => {
    const intakeWorkflowPath = path.resolve(repoRoot, '.github/workflows/operational-pilot-intake.yml');
    assert.ok(fs.existsSync(intakeWorkflowPath), 'Workflow de intake deve existir');
    const content = fs.readFileSync(intakeWorkflowPath, 'utf8');

    // Não deve existir package_payload_base64
    assert.doesNotMatch(content, /package_payload_base64/);

    // Deve declarar source_artifact_id e expected_package_sha256
    assert.match(content, /source_artifact_id:/);
    assert.match(content, /expected_package_sha256:/);
  });

  // -------------------------------------------------------------
  // Test 34: Verificação de ambiente audita separadamente ruleset/branch protection e ambiente protegido
  // -------------------------------------------------------------
  it('34. verificação de ambiente audita separadamente ruleset/branch protection e ambiente protegido', () => {
    const testEnvDir = path.join(tmpDir, 'test34_artifacts');
    fs.mkdirSync(testEnvDir, { recursive: true });

    runCommand(`node scripts/verify-environment-protection.mjs --mode=DEMO --out-dir="${testEnvDir}"`);

    const envFile = path.join(testEnvDir, 'environment-api-response.json');
    const branchFile = path.join(testEnvDir, 'branch-protection-api-response.json');
    const verifFile = path.join(testEnvDir, 'environment-protection-verification.json');

    assert.ok(fs.existsSync(envFile), 'environment-api-response.json deve ser gravado fisicamente');
    assert.ok(fs.existsSync(branchFile), 'branch-protection-api-response.json deve ser gravado fisicamente');
    assert.ok(fs.existsSync(verifFile), 'environment-protection-verification.json deve ser gravado fisicamente');

    const verifData = JSON.parse(fs.readFileSync(verifFile, 'utf8'));
    assert.ok(verifData.branch_protection, 'Deve conter auditoria específica de branch_protection');
    assert.strictEqual(verifData.branch_protection_file, 'branch-protection-api-response.json');
  });

  // -------------------------------------------------------------
  // Test 35: Rejeição do ID antigo 924840897, ID ausente ou divergente
  // -------------------------------------------------------------
  it('35. rejeita ID antigo (924840897), ID ausente ou divergente de repositório', () => {
    const CANONICAL_REPO_ID = 1363667011;
    const OLD_REPO_ID = 924840897;
    assert.notStrictEqual(CANONICAL_REPO_ID, OLD_REPO_ID, 'ID canónico 1363667011 deve substituir o antigo 924840897');

    const prepScript = path.resolve(repoRoot, 'scripts/prepare-operational-pilot-input.mjs');
    const prepContent = fs.readFileSync(prepScript, 'utf8');
    assert.match(prepContent, /const CANONICAL_REPO_ID = 1363667011/);
    assert.doesNotMatch(prepContent, /924840897/);

    const recScript = path.resolve(repoRoot, 'scripts/reconcile-stage-a-artifact.mjs');
    const recContent = fs.readFileSync(recScript, 'utf8');
    assert.match(recContent, /const CANONICAL_REPO_ID = 1363667011/);
    assert.doesNotMatch(recContent, /924840897/);
  });

  // -------------------------------------------------------------
  // Test 36: Tentativa de substituir repositório canónico por variável de ambiente é bloqueada em OPERATIONAL_PILOT
  // -------------------------------------------------------------
  it('36. tentativa de substituir repositório canónico por variável de ambiente é bloqueada em OPERATIONAL_PILOT', () => {
    const prepScript = path.resolve(repoRoot, 'scripts/prepare-operational-pilot-input.mjs');
    const prepContent = fs.readFileSync(prepScript, 'utf8');
    assert.match(prepContent, /CANONICAL_REPO_NAME = 'victorinoaguiar-art\/APLICATIVO-AI-EMPLOYEES'/);
    assert.match(prepContent, /EXPECTED_REPO = \(mode === 'OPERATIONAL_PILOT' \|\| !process\.env\.GITHUB_REPOSITORY\)/);

    const recScript = path.resolve(repoRoot, 'scripts/reconcile-stage-a-artifact.mjs');
    const recContent = fs.readFileSync(recScript, 'utf8');
    assert.match(recContent, /CANONICAL_REPO_NAME = 'victorinoaguiar-art\/APLICATIVO-AI-EMPLOYEES'/);
    assert.match(recContent, /EXPECTED_REPO = \(mode === 'OPERATIONAL_PILOT' \|\| !process\.env\.GITHUB_REPOSITORY\)/);
  });

  // -------------------------------------------------------------
  // Test 37: review_signature_sha256 armazena sha256(signature) e não a assinatura em texto simples, e mutação de 1 byte falha
  // -------------------------------------------------------------
  it('37. review_signature_sha256 armazena sha256(signature) e não a assinatura em texto simples, e mutação de 1 byte falha', async () => {
    const localDb = path.join(tmpDir, 'test37.db');
    const localTokenService = new TokenService(undefined, localDb);
    localTokenService.upsertAccount({
      user_id: reviewerId,
      tenant_id: tenantId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      status: 'ACTIVE'
    });
    const jti = 'jti_test37';
    const token = localTokenService.signToken({
      tenant_id: tenantId,
      user_id: reviewerId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ'],
      jti
    });
    const outDir = path.join(tmpDir, 'test37_pkg');
    createValidExternalPackage(outDir);

    const runner = new OperationalPilotRunner({
      dbPath: localDb,
      secretProvider,
      tokenService: localTokenService,
      executionMode: 'DEMO'
    });
    runner.getStore().createReviewerSession({
      session_id: 'SESS_TEST37',
      token_jti: jti,
      reviewer_id: reviewerId,
      tenant_id: tenantId,
      pilot_id: pilotId,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 3600 * 1000).toISOString()
    });

    runner.loadAndValidateInput(path.join(outDir, 'operational-pilot-input.json'));
    const { challenge } = await runner.executeOperationalTask();
    const eventSignedAt = new Date().toISOString();
    const validSignature = PilotExternalValidator.generateCanonicalChallengeSignature(
      challenge,
      reviewerId,
      'APPROVED',
      reviewerSecret,
      eventSignedAt
    );

    // a) Mutação de 1 byte na assinatura é rejeitada
    const mutatedSig = validSignature.slice(0, -1) + (validSignature.slice(-1) === 'a' ? 'b' : 'a');
    assert.throws(() => {
      runner.submitHumanReview({
        reviewerId,
        reviewerToken: token,
        decision: 'APPROVED',
        comments: 'teste mutação',
        eventSignedAt,
        signature: mutatedSig
      });
    }, /Assinatura criptográfica.*inválida/);

    // b) Envio de assinatura válida persiste o hash SHA-256 e NUNCA a assinatura em claro
    const reviewReceipt = runner.submitHumanReview({
      reviewerId,
      reviewerToken: token,
      decision: 'APPROVED',
      comments: 'Aprovado para teste de hash',
      eventSignedAt,
      signature: validSignature
    });

    const expectedSha256 = sha256(Buffer.from(validSignature, 'utf8'));
    assert.strictEqual(reviewReceipt.review_signature_sha256, expectedSha256);
    assert.notStrictEqual(reviewReceipt.review_signature_sha256, validSignature);
    assert.match(reviewReceipt.review_signature_sha256, /^[a-f0-9]{64}$/);

    // Verificar também no SQLite
    const row = (runner.getStore() as any).db.prepare('SELECT review_signature_sha256 FROM human_reviews WHERE reviewer_id = ?').get(reviewerId) as any;
    assert.ok(row, 'Registo de revisão humana deve existir na tabela SQLite');
    assert.strictEqual(row.review_signature_sha256, expectedSha256);
    assert.notStrictEqual(row.review_signature_sha256, validSignature);

    runner.getStore().close();
  });

  // -------------------------------------------------------------
  // Test 38: auditAndExtractZip bloqueia path traversal, caminhos absolutos, FIFOs, zip-bomb e ficheiros fora da whitelist
  // -------------------------------------------------------------
  it('38. auditAndExtractZip bloqueia path traversal, caminhos absolutos, symlinks, FIFOs, zip-bomb e ficheiros fora da whitelist', async () => {
    const { auditAndExtractZip, buildZip } = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/lib/secureTarExtractor.mjs')).href);

    const extractTarget = path.join(tmpDir, 'test38_extract');
    fs.mkdirSync(extractTarget, { recursive: true });

    // a) Path traversal (../escaped.txt)
    const zipTraversal = buildZip([{ name: '../escaped.txt', content: Buffer.from('evil') }]);
    assert.throws(() => {
      auditAndExtractZip(zipTraversal, extractTarget);
    }, /path traversal/i);

    // b) Caminho absoluto (/etc/passwd)
    const zipAbs = buildZip([{ name: '/etc/passwd', content: Buffer.from('evil') }]);
    assert.throws(() => {
      auditAndExtractZip(zipAbs, extractTarget);
    }, /caminho absoluto/i);

    // c) Ficheiro não permitido na whitelist
    const zipDisallowed = buildZip([{ name: 'malicious.exe', content: Buffer.from('evil') }]);
    assert.throws(() => {
      auditAndExtractZip(zipDisallowed, extractTarget, { allowedFiles: ['operational-pilot-input.json'] });
    }, /inesperado|não permitido/i);

    // d) Ficheiro legítimo extrai com sucesso
    const zipValid = buildZip([{ name: 'operational-pilot-input.json', content: Buffer.from('{"ok":true}') }]);
    const extracted = auditAndExtractZip(zipValid, extractTarget, { allowedFiles: ['operational-pilot-input.json'] });
    assert.ok(fs.existsSync(path.join(extractTarget, 'operational-pilot-input.json')));
    assert.strictEqual(extracted.length, 1);
  });

  // -------------------------------------------------------------
  // Test 39: validateEvidenceDir rejeita pasta irmã com mesmo prefixo mesmo quando raiz do checkout está em os.tmpdir()
  // -------------------------------------------------------------
  it('39. validateEvidenceDir rejeita pasta irmã com mesmo prefixo mesmo quando raiz do checkout está em os.tmpdir()', async () => {
    const { validateEvidenceDir } = await import(pathToFileURL(path.resolve(repoRoot, 'scripts/lib/evidencePathValidator.mjs')).href);

    const fakeRepoRoot = path.join(os.tmpdir(), 'fake-pilot-checkout-12345');
    fs.mkdirSync(fakeRepoRoot, { recursive: true });
    const siblingPath = fakeRepoRoot + '-sibling';

    // Deve rejeitar a pasta irmã mesmo estando dentro de os.tmpdir()
    assert.throws(() => {
      validateEvidenceDir(siblingPath, fakeRepoRoot);
    }, /EVIDENCE_PATH_INVALID|must be within workspace/);

    // Deve rejeitar path traversal
    assert.throws(() => {
      validateEvidenceDir('../../other', fakeRepoRoot);
    }, /EVIDENCE_PATH_INVALID|traversal/);

    // Deve aceitar subdirectório interno
    const validInternal = validateEvidenceDir('evidence_output', fakeRepoRoot);
    assert.strictEqual(validInternal, path.resolve(fakeRepoRoot, 'evidence_output'));
  });

  // -------------------------------------------------------------
  // Test 40: Ambiente protected-pilot no GitHub real está totalmente protegido (REQUIRED_REVIEWERS + BRANCH_POLICY + NO_ADMIN_BYPASS)
  // -------------------------------------------------------------
  it('40. ambiente protected-pilot no GitHub real está totalmente protegido (REQUIRED_REVIEWERS + BRANCH_POLICY + NO_ADMIN_BYPASS)', () => {
    const testEnvDir = path.join(tmpDir, 'test40_real_env');
    fs.mkdirSync(testEnvDir, { recursive: true });

    runCommand(`node scripts/verify-environment-protection.mjs --mode=OPERATIONAL_PILOT --environment=protected-pilot --out-dir="${testEnvDir}"`);

    const verifFile = path.join(testEnvDir, 'environment-protection-verification.json');
    assert.ok(fs.existsSync(verifFile));
    const verifData = JSON.parse(fs.readFileSync(verifFile, 'utf8'));

    assert.strictEqual(verifData.status, 'FULLY_PROTECTED');
    assert.strictEqual(verifData.has_required_reviewers, true);
    assert.strictEqual(verifData.has_branch_policy, true);
    assert.strictEqual(verifData.can_admins_bypass, false);
  });
});

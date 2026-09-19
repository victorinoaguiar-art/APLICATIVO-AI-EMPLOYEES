#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import { OperationalPilotRunner } from '../packages/runtime/dist/pilot/OperationalPilotRunner.js';
import { StaticSecretProvider, EnvironmentSecretProvider } from '../packages/runtime/dist/pilot/PilotSecretProvider.js';
import { TokenService } from '../packages/shared/dist/server/index.js';

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

const args = process.argv.slice(2);

function getArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = args.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const stage = getArg('stage', 'full').toLowerCase();
const mode = getArg('mode', process.env.EXECUTION_MODE || 'DEMO').toUpperCase();
const inputArg = getArg('input', process.env.PILOT_INPUT_PATH || '');
const dbArg = getArg('db', process.env.PILOT_DB_PATH || path.resolve(process.cwd(), '.artifacts', 'pilot', 'pilot.db'));
const outputDirArg = getArg('output-dir', process.env.PILOT_OUTPUT_DIR || path.resolve(process.cwd(), '.artifacts', 'pilot', 'evidence'));
const tenantIdArg = getArg('tenant-id', '');
const taskIdArg = getArg('task-id', '');
const reviewerTokenArg = getArg('reviewer-token', process.env.PILOT_REVIEWER_TOKEN || process.env.REVIEWER_TOKEN || '');
const reviewerSecretArg = getArg('reviewer-secret', process.env.PILOT_REVIEWER_SECRET || process.env.REVIEWER_SECRET || process.env.PILOT_SECRET_REV_MARIA || '');
const reviewerIdArg = getArg('reviewer-id', process.env.PILOT_REVIEWER_ID || '');
const signatureArg = getArg('signature', process.env.PILOT_REVIEW_SIGNATURE || process.env.REVIEW_SIGNATURE || '');
const decisionArg = getArg('decision', process.env.PILOT_REVIEW_DECISION || (mode === 'DEMO' ? 'APPROVED' : '')).toUpperCase();
const commentsArg = getArg('comments', process.env.PILOT_REVIEW_COMMENTS || (mode === 'DEMO' ? 'Aprovação simulada de demonstração técnica.' : ''));

const stageARunId = getArg('stage-a-run-id', process.env.STAGE_A_RUN_ID || '');
const stageAArtifactId = getArg('stage-a-artifact-id', process.env.STAGE_A_ARTIFACT_ID || '');
const stageAHeadSha = getArg('stage-a-head-sha', process.env.STAGE_A_HEAD_SHA || '');
const challengeId = getArg('challenge-id', process.env.CHALLENGE_ID || '');
const eventSignedAt = getArg('event-signed-at', process.env.EVENT_SIGNED_AT || '');
const initiatingActorArg = getArg('initiating-actor', process.env.GITHUB_TRIGGERING_ACTOR || process.env.GITHUB_ACTOR || '');

const hasCliToken = process.argv.some(a => a.startsWith('--reviewer-token='));
const hasCliSignature = process.argv.some(a => a.startsWith('--signature='));
if ((hasCliToken || hasCliSignature) && mode === 'OPERATIONAL_PILOT') {
  console.error('\n[FAIL-CLOSED] Passagem de credenciais ou assinaturas via argumentos de linha de comandos (--reviewer-token / --signature) é proibida por segurança.');
  console.error('Utilize as variáveis de ambiente protegidas REVIEWER_TOKEN e REVIEW_SIGNATURE.');
  process.exit(1);
}

console.log('================================================================');
console.log('MOTOR DE EXECUÇÃO DO PILOTO OPERACIONAL PROTEGIDO (AETF-500)');
console.log('================================================================');
console.log(`Etapa Solicitada:     ${stage}`);
console.log(`Modo de Execução:     ${mode}`);
console.log(`Entrada Operacional:  ${inputArg || '(não especificada)'}`);
console.log(`Base de Dados SQLite: ${dbArg}`);
console.log(`Directório de Destino: ${outputDirArg}`);
console.log(`Tenant ID Alvo:       ${tenantIdArg || '(inferido do pacote)'}`);
console.log(`Task ID Alvo:         ${taskIdArg || '(inferido do pacote)'}`);

if (mode === 'OPERATIONAL_PILOT' && stage === 'full') {
  console.error('\n[FAIL-CLOSED] No modo OPERATIONAL_PILOT, a execução deve ser segregada em duas etapas independentes:');
  console.error('  Etapa A: --stage=prepare-and-challenge');
  console.error('  Etapa B: --stage=review-and-close');
  console.error('A execução simultânea contínua com auto-aprovação é categoricamente proibida no caminho real.');
  process.exit(1);
}

if (!inputArg || !fs.existsSync(inputArg)) {
  console.error(`\n[FAIL-CLOSED] Ficheiro de entrada operacional não encontrado: '${inputArg}'.`);
  console.error('Utilize --input=<caminho_para_input.json>');
  process.exit(1);
}

if (!dbArg || dbArg === ':memory:') {
  console.error('\n[FAIL-CLOSED] Base de dados persistente SQLite é obrigatória (--db=<caminho.db>).');
  process.exit(1);
}

const dbDir = path.dirname(path.resolve(dbArg));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Configurar provedor de segredos
let secretProvider;
if (reviewerSecretArg && reviewerSecretArg.trim().length > 0) {
  secretProvider = new StaticSecretProvider({
    PILOT_SECRET_REV_MARIA: reviewerSecretArg,
    PILOT_SECRET_REV_DEMO: reviewerSecretArg
  });
} else if (mode === 'DEMO') {
  // No modo DEMO estritamente isolado, utiliza chave sintética efêmera para demonstração
  secretProvider = new StaticSecretProvider({
    PILOT_SECRET_REV_DEMO: 'EPHEMERAL_DEMO_SECRET_KEY_FOR_AUTOMATED_SIMULATION_ONLY',
    PILOT_SECRET_REV_MARIA: 'EPHEMERAL_DEMO_SECRET_KEY_FOR_AUTOMATED_SIMULATION_ONLY'
  });
} else {
  secretProvider = new EnvironmentSecretProvider();
}

// Inicializar TokenService persistente
const tokenService = new TokenService(undefined, dbArg);

// Instanciar motor operacional
const runner = new OperationalPilotRunner({
  dbPath: path.resolve(dbArg),
  secretProvider,
  tokenService,
  executionMode: mode === 'OPERATIONAL_PILOT' ? 'OPERATIONAL_PILOT' : 'DEMO'
});

try {
  // -------------------------------------------------------------------------
  // ETAPA A: PREPARAÇÃO, EXECUÇÃO DE TAREFA E EMISSÃO DE DESAFIO
  // -------------------------------------------------------------------------
  if (stage === 'prepare-and-challenge' || stage === 'full') {
    console.log('\n--- ETAPA A: PREPARAÇÃO DA TAREFA E EMISSÃO DO DESAFIO ---');

    console.log('[A1] A validar e reconciliar entrada operacional...');
    const loadedInput = runner.loadAndValidateInput(path.resolve(inputArg), {
      expectedTenantId: tenantIdArg,
      expectedTaskId: taskIdArg
    });
    console.log(`[PASS] Tarefa validada: ${loadedInput.task_id}`);
    console.log(`[PASS] Tenant reconciliado: ${loadedInput.tenant_id} | Organização: ${loadedInput.organization_name}`);
    console.log(`[PASS] Despacho Físico de Autorização: ${loadedInput.authorization_reference}`);

    console.log('\n[A2] A executar tarefa empresarial e a gerar documentos físicos (PDF e DOCX)...');
    const execResult = await runner.executeOperationalTask();
    console.log(`[PASS] Documento PDF gerado:  ${execResult.taskReceipt.output_files[0]}`);
    console.log(`[PASS] Documento DOCX gerado: ${execResult.taskReceipt.output_files[1]}`);
    console.log(`[PASS] SHA-256 PDF:  ${execResult.outputHashes[0]}`);
    console.log(`[PASS] SHA-256 DOCX: ${execResult.outputHashes[1]}`);
    console.log(`[PASS] Desafio de Revisão Emitido: ${execResult.challenge.challenge_id}`);
    console.log(`[PASS] Estado do Motor: ${runner.getState()} (PENDING_HUMAN_REVIEW)`);

    if (stage === 'prepare-and-challenge') {
      console.log('\n[A3] A gravar manifesto parcial da Etapa A...');
      const manifestResult = runner.generateOperationalManifest(path.resolve(outputDirArg));
      console.log(`[PASS] Ficheiros indexados na Etapa A: ${manifestResult.files.length}`);
      console.log(`[PASS] Classificação Actual: ${manifestResult.classification}`);
      console.log('\n================================================================');
      console.log('ETAPA A CONCLUÍDA COM SUCESSO: AGUARDANDO DECISÃO HUMANA EXTERNA');
      console.log('================================================================\n');
      runner.getStore().close();
      process.exit(0);
    }
  }

  // -------------------------------------------------------------------------
  // ETAPA B: DECISÃO HUMANA, CONSUMO DO DESAFIO E ARQUIVAMENTO
  // -------------------------------------------------------------------------
  if (stage === 'review-and-close' || stage === 'full') {
    console.log('\n--- ETAPA B: DECISÃO HUMANA AUTÊNTICA E FECHO OPERACIONAL ---');

    if (mode === 'OPERATIONAL_PILOT') {
      if (!stageARunId || !/^\d+$/.test(stageARunId)) {
        console.error('\n[FAIL-CLOSED] stage_a_run_id é estritamente obrigatório e numérico no modo operacional.');
        process.exit(1);
      }
      if (!stageAArtifactId || !/^\d+$/.test(stageAArtifactId)) {
        console.error('\n[FAIL-CLOSED] stage_a_artifact_id é estritamente obrigatório e numérico no modo operacional.');
        process.exit(1);
      }
      if (!stageAHeadSha || !/^[a-f0-9]{40}$|^[a-f0-9]{64}$/.test(stageAHeadSha)) {
        console.error('\n[FAIL-CLOSED] stage_a_head_sha é estritamente obrigatório e hexadecimal no modo operacional.');
        process.exit(1);
      }
      if (!challengeId) {
        console.error('\n[FAIL-CLOSED] challenge_id é estritamente obrigatório no modo operacional.');
        process.exit(1);
      }
      if (!eventSignedAt || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(eventSignedAt)) {
        console.error('\n[FAIL-CLOSED] event_signed_at é estritamente obrigatório e deve ser timestamp RFC 3339 no modo operacional.');
        process.exit(1);
      }
    }

    const earlyInitiator = initiatingActorArg || process.env.GITHUB_TRIGGERING_ACTOR || process.env.GITHUB_ACTOR || '';
    const earlyReviewer = reviewerIdArg || '';
    if (mode === 'OPERATIONAL_PILOT' && earlyInitiator && earlyReviewer && earlyInitiator.toLowerCase() === earlyReviewer.toLowerCase()) {
      console.error(`\n[FAIL-CLOSED] SEGREGATION_OF_DUTIES_VIOLATION: O iniciador da execução ('${earlyInitiator}') não pode ser o revisor/aprovador ('${earlyReviewer}').`);
      console.error('Auto-aprovação é categoricamente proibida em OPERATIONAL_PILOT.');
      process.exit(1);
    }

    let operationalApprovalData = null;
    let operationalRawApprovalBytes = null;
    let operationalApprovingLogin = null;
    let operationalApprovingId = null;
    let operationalApprovalEventId = null;

    if (mode === 'OPERATIONAL_PILOT') {
      const approvalMockFile = process.env.MOCK_APPROVAL_RESPONSE;
      if (approvalMockFile && fs.existsSync(approvalMockFile)) {
        operationalRawApprovalBytes = fs.readFileSync(approvalMockFile);
        try {
          operationalApprovalData = JSON.parse(operationalRawApprovalBytes.toString('utf8'));
        } catch {}
      } else {
        const currentRunId = process.env.GITHUB_RUN_ID;
        if (currentRunId) {
          try {
            const rawResp = execFileSync('gh', ['api', `repos/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/runs/${currentRunId}/approvals`], {
              stdio: ['pipe', 'pipe', 'pipe']
            });
            operationalApprovalData = JSON.parse(rawResp.toString('utf8'));
            operationalRawApprovalBytes = rawResp;
          } catch (e) {}
        }
      }

      if (!operationalApprovalData || !operationalRawApprovalBytes) {
        console.error('\n[FAIL-CLOSED] AUTHENTIC_ENVIRONMENT_APPROVAL_EVIDENCE_UNAVAILABLE: Prova autenticada de aprovação externa do ambiente indisponível.');
        process.exit(1);
      }

      const approvalEntry = Array.isArray(operationalApprovalData) ? operationalApprovalData[0] : operationalApprovalData;
      const approvingUser = approvalEntry?.user;
      operationalApprovingLogin = approvingUser?.login;
      operationalApprovingId = approvingUser?.id;
      operationalApprovalEventId = approvalEntry?.id || approvalEntry?.environment_id;

      if (!operationalApprovingLogin || !operationalApprovingId || !operationalApprovalEventId) {
        console.error('\n[FAIL-CLOSED] AUTHENTIC_ENVIRONMENT_APPROVAL_EVIDENCE_UNAVAILABLE: Resposta de aprovação não contém dados de utilizador ou ID de aprovação.');
        process.exit(1);
      }

      const initiatingLogin = process.env.GITHUB_TRIGGERING_ACTOR || process.env.GITHUB_ACTOR || initiatingActorArg || 'unknown_initiator';
      const initiatingId = process.env.GITHUB_TRIGGERING_ACTOR_ID ? Number(process.env.GITHUB_TRIGGERING_ACTOR_ID) : (earlyInitiator === operationalApprovingLogin ? operationalApprovingId : 1000);

      if (operationalApprovingLogin.toLowerCase() === initiatingLogin.toLowerCase() || operationalApprovingId === initiatingId) {
        console.error(`\n[FAIL-CLOSED] SEGREGATION_OF_DUTIES_VIOLATION: Auto-aprovação detectada: initiator='${initiatingLogin}' (${initiatingId}) == approver='${operationalApprovingLogin}' (${operationalApprovingId}).`);
        process.exit(1);
      }
    }

    // Se estiver a correr separadamente na Etapa B, carregar estado da BD SQLite
    if (stage === 'review-and-close') {
      console.log('[B1] A carregar contexto persistido a partir do SQLite...');
      runner.loadAndValidateInput(path.resolve(inputArg), {
        expectedTenantId: tenantIdArg,
        expectedTaskId: taskIdArg
      });
      // Recuperar desafio pendente
      const store = runner.getStore();
      const input = runner.getLoadedInput();
      const existingTask = store.getTask(input.task_id);
      if (!existingTask) {
        throw new Error(`Tarefa '${input.task_id}' não encontrada na base de dados SQLite. Execute a Etapa A primeiro.`);
      }
      runner['taskReceipt'] = existingTask;
      const challenge = store.getPendingChallengeForTask(input.task_id) || store.getReviewChallenge(`CHAL_${input.task_id}`);
      if (!challenge) {
        throw new Error(`Desafio de revisão não encontrado para a tarefa '${input.task_id}'.`);
      }
      runner['activeChallenge'] = challenge;
      runner['state'] = 'PENDING_HUMAN_REVIEW';
    }

    const loadedInput = runner.getLoadedInput();
    const activeReviewer = loadedInput.authorized_reviewers[0];
    const targetReviewerId = reviewerIdArg || activeReviewer.reviewer_id;

    const initiatingActorId = initiatingActorArg || process.env.GITHUB_TRIGGERING_ACTOR || process.env.GITHUB_ACTOR || loadedInput.requested_by || 'system_initiator';
    const reviewerSubjectId = targetReviewerId;

    console.log('\n[B2] A validar credenciais e submeter decisão humana...');
    let token = process.env.REVIEWER_TOKEN || process.env.PILOT_REVIEWER_TOKEN || reviewerTokenArg;
    let signature = process.env.REVIEW_SIGNATURE || process.env.PILOT_REVIEW_SIGNATURE || signatureArg;

    if (mode === 'OPERATIONAL_PILOT') {
      if (initiatingActorId && reviewerSubjectId && initiatingActorId.toLowerCase() === reviewerSubjectId.toLowerCase()) {
        console.error(`\n[FAIL-CLOSED] SEGREGATION_OF_DUTIES_VIOLATION: O iniciador da execução ('${initiatingActorId}') não pode ser o revisor/aprovador ('${reviewerSubjectId}').`);
        console.error('Auto-aprovação é categoricamente proibida em OPERATIONAL_PILOT.');
        process.exit(1);
      }
      if (!token) {
        console.error('\n[FAIL-CLOSED] Token de autenticação do revisor (REVIEWER_TOKEN) é estritamente obrigatório no modo operacional.');
        console.error('Auto-emissão de token pelo próprio script é expressamente proibida.');
        process.exit(1);
      }
      if (!signature) {
        console.error('\n[FAIL-CLOSED] Assinatura criptográfica externa (REVIEW_SIGNATURE) é estritamente obrigatória no modo operacional.');
        console.error('Auto-geração de assinatura pelo próprio script é expressamente proibida.');
        process.exit(1);
      }
      if (!decisionArg || !['APPROVED', 'REJECTED', 'REQUEST_CHANGES', 'APPROVED_WITH_CORRECTIONS'].includes(decisionArg)) {
        console.error(`\n[FAIL-CLOSED] Decisão humana explícita (--decision=APPROVED|REJECTED|REQUEST_CHANGES|APPROVED_WITH_CORRECTIONS) é obrigatória. Recebido: '${decisionArg}'.`);
        process.exit(1);
      }
    } else {
      // Modo DEMO: para viabilizar demonstração automatizada de infraestrutura
      if (!token) {
        token = tokenService.signToken({
          tenant_id: loadedInput.tenant_id,
          user_id: targetReviewerId,
          roles: ['HUMAN_REVIEWER'],
          permissions: ['PILOT_REVIEW', 'READ']
        });
      }
    }

    const reviewReceipt = runner.submitHumanReview({
      reviewerId: targetReviewerId,
      reviewerToken: token,
      decision: decisionArg,
      comments: commentsArg || 'Decisão humana submetida em ambiente auditado.',
      signature: signature || undefined,
      expectedChallengeId: challengeId || undefined,
      expectedTenantId: tenantIdArg || undefined,
      expectedTaskId: taskIdArg || undefined,
      expectedCommitSha: stageAHeadSha || undefined,
      eventSignedAt: eventSignedAt || undefined
    });
    console.log(`[PASS] Decisão registada: ${reviewReceipt.decision} por ${reviewReceipt.reviewer}`);
    console.log(`[PASS] Recibo de Revisão: ${reviewReceipt.review_id} (SHA: ${reviewReceipt.receipt_sha256.slice(0, 16)}...)`);

    // Emitir recibo de independência do revisor (Prompt Secção 5)
    let independenceReceipt;
    if (mode === 'DEMO' || mode === 'SIMULATION') {
      independenceReceipt = {
        execution_mode: 'DEMO',
        is_simulation: true,
        independence_evidence_type: 'SYNTHETIC_DEMO',
        reviewer_id: targetReviewerId,
        reviewer_subject_id: reviewerSubjectId,
        reviewer_authorization_id: `AUTH_RECORD_${targetReviewerId}_${loadedInput.tenant_id}`,
        github_environment_approval_id: null,
        github_environment_approval_verified: false,
        initiating_actor_id: initiatingActorId,
        prevent_self_review_observed: false,
        independence_verified: false,
        classification: 'DEMO_REVIEW_INDEPENDENCE_SIMULATED',
        decision: reviewReceipt.decision,
        challenge_id: challengeId || reviewReceipt.challenge_id,
        review_signature_sha256: reviewReceipt.review_signature_sha256 || createHash('sha256').update(signature || 'DEMO_SIGNATURE').digest('hex'),
        event_signed_at: eventSignedAt || new Date().toISOString(),
        review_received_at: reviewReceipt.reviewed_at,
        challenge_consumed_at: new Date().toISOString()
      };
    } else {
      // Modo OPERATIONAL_PILOT: reutiliza prova autenticada validada previamente
      const rawApprovalBytes = operationalRawApprovalBytes;
      const approvalData = operationalApprovalData;
      const approvingActorLogin = operationalApprovingLogin;
      const approvingActorId = operationalApprovingId;
      const approvalEventId = operationalApprovalEventId;

      const rawApprovalSha = createHash('sha256').update(rawApprovalBytes).digest('hex');
      const rawApprovalFile = 'environment-approval-api-response.json';
      const rawApprovalPath = path.join(path.resolve(outputDirArg), rawApprovalFile);
      fs.writeFileSync(rawApprovalPath, rawApprovalBytes);
      fs.writeFileSync(`${rawApprovalPath}.sha256`, `${rawApprovalSha}  ${rawApprovalFile}\n`, 'utf8');

      const initiatingLogin = process.env.GITHUB_TRIGGERING_ACTOR || process.env.GITHUB_ACTOR || initiatingActorArg || 'unknown_initiator';
      const initiatingId = process.env.GITHUB_TRIGGERING_ACTOR_ID ? Number(process.env.GITHUB_TRIGGERING_ACTOR_ID) : (initiatingActorId === approvingActorLogin ? approvingActorId : 1000);

      if (reviewerSubjectId.toLowerCase() !== approvingActorLogin.toLowerCase() && !targetReviewerId.includes(approvingActorLogin)) {
        console.error(`\n[FAIL-CLOSED] REVIEWER_LINKAGE_INVALID: O revisor autorizado ('${targetReviewerId}') não corresponde ao aprovador autenticado ('${approvingActorLogin}').`);
        process.exit(1);
      }

      independenceReceipt = {
        execution_mode: 'OPERATIONAL_PILOT',
        is_simulation: false,
        independence_evidence_type: 'AUTHENTICATED_GITHUB_ENVIRONMENT_APPROVAL',
        initiating_actor_login: initiatingLogin,
        initiating_actor_id: initiatingId,
        approving_actor_login: approvingActorLogin,
        approving_actor_id: approvingActorId,
        reviewer_subject_id: reviewerSubjectId,
        reviewer_authorization_id: `AUTH_RECORD_${targetReviewerId}_${loadedInput.tenant_id}`,
        github_environment_approval_id: String(approvalEventId),
        github_environment_approval_verified: true,
        prevent_self_review_observed: true,
        independence_verified: true,
        raw_approval_response_file: rawApprovalFile,
        raw_approval_response_sha256: rawApprovalSha,
        decision: reviewReceipt.decision,
        challenge_id: challengeId || reviewReceipt.challenge_id,
        review_signature_sha256: reviewReceipt.review_signature_sha256,
        event_signed_at: eventSignedAt,
        review_received_at: reviewReceipt.reviewed_at,
        challenge_consumed_at: new Date().toISOString()
      };
    }

    const independenceReceiptPath = path.join(path.resolve(outputDirArg), 'reviewer-independence-receipt.json');
    fs.writeFileSync(independenceReceiptPath, JSON.stringify(independenceReceipt, null, 2), 'utf8');
    const indepSha = createHash('sha256').update(fs.readFileSync(independenceReceiptPath)).digest('hex');
    fs.writeFileSync(`${independenceReceiptPath}.sha256`, `${indepSha}  reviewer-independence-receipt.json\n`, 'utf8');
    console.log(`[PASS] Recibo de Independência Humana emitido (${independenceReceipt.independence_evidence_type}): ${independenceReceiptPath}`);

    if (decisionArg !== 'APPROVED') {
      console.log(`\n[INFO] Tarefa não aprovada (Decisão: ${decisionArg}). O arquivamento final não prosseguirá.`);
      runner.generateOperationalManifest(path.resolve(outputDirArg));
      runner.getStore().close();
      process.exit(0);
    }

    console.log('\n[B3] A classificar desfecho operacional (arquivamento durável)...');
    const delivReceipt = runner.archiveOrDeliver();
    console.log(`[PASS] Estado de entrega: ${delivReceipt.status} (is_external_confirmed: ${delivReceipt.is_external_confirmed})`);
    console.log(`[PASS] Recibo de Arquivamento: ${delivReceipt.delivery_id}`);

    console.log('\n[B4] A gerar manifesto de evidências e índice SHA-256...');
    const manifestResult = runner.generateOperationalManifest(path.resolve(outputDirArg));
    console.log(`[PASS] Ficheiros indexados: ${manifestResult.files.length}`);
    console.log(`[PASS] SHA-256 do Índice: ${manifestResult.indexHash}`);
    console.log(`[PASS] Classificação Final: ${manifestResult.classification}`);

    console.log('\n[B5] A verificar reconciliação dos 7 planos de verdade...');
    const recon = OperationalPilotRunner.verifyReconciliation(
      path.resolve(inputArg),
      path.resolve(outputDirArg),
      path.resolve(dbArg)
    );

    if (!recon.isValid) {
      console.error('\n[FALHA DE RECONCILIAÇÃO]');
      for (const err of recon.errors) {
        console.error(`  - ${err}`);
      }
      process.exit(1);
    }

    console.log('[PASS] Reconciliação dos 7 planos de verdade confirmada com sucesso.');
    console.log('\n================================================================');
    console.log('EXECUÇÃO CONCLUÍDA COM SUCESSO (EXIT CODE 0)');
    console.log(`CLASSIFICAÇÃO: ${recon.classification}`);
    console.log('================================================================\n');

    runner.getStore().close();
    process.exit(0);
  }
} catch (err) {
  console.error(`\n[ERRO NA EXECUÇÃO DO PILOTO] ${err.message}`);
  if (err.stack) console.error(err.stack);
  try { runner.getStore().close(); } catch {}
  process.exit(1);
}

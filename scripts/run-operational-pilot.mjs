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
const reviewerTokenArg = getArg('reviewer-token', process.env.PILOT_REVIEWER_TOKEN || '');
const reviewerSecretArg = getArg('reviewer-secret', process.env.PILOT_REVIEWER_SECRET || process.env.PILOT_SECRET_REV_MARIA || '');
const reviewerIdArg = getArg('reviewer-id', process.env.PILOT_REVIEWER_ID || '');
const signatureArg = getArg('signature', process.env.PILOT_REVIEW_SIGNATURE || '');
const decisionArg = getArg('decision', process.env.PILOT_REVIEW_DECISION || (mode === 'DEMO' ? 'APPROVED' : '')).toUpperCase();
const commentsArg = getArg('comments', process.env.PILOT_REVIEW_COMMENTS || (mode === 'DEMO' ? 'Aprovação simulada de demonstração técnica.' : ''));

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
    PILOT_SECRET_REV_MARIA: reviewerSecretArg
  });
} else if (mode === 'DEMO') {
  // No modo DEMO estritamente isolado, utiliza chave sintética efêmera para demonstração
  secretProvider = new StaticSecretProvider({
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

    console.log('\n[B2] A validar credenciais e submeter decisão humana...');
    let token = reviewerTokenArg;
    let signature = signatureArg;

    if (mode === 'OPERATIONAL_PILOT') {
      if (!token) {
        console.error('\n[FAIL-CLOSED] Token de autenticação do revisor (--reviewer-token) é estritamente obrigatório no modo operacional.');
        console.error('Auto-emissão de token pelo próprio script é expressamente proibida.');
        process.exit(1);
      }
      if (!signature) {
        console.error('\n[FAIL-CLOSED] Assinatura criptográfica externa (--signature) é estritamente obrigatória no modo operacional.');
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
      signature: signature || undefined
    });
    console.log(`[PASS] Decisão registada: ${reviewReceipt.decision} por ${reviewReceipt.reviewer}`);
    console.log(`[PASS] Recibo de Revisão: ${reviewReceipt.review_id} (SHA: ${reviewReceipt.receipt_sha256.slice(0, 16)}...)`);

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

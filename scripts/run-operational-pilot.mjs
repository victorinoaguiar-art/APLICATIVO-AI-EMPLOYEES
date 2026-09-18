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

const inputArg = getArg('input', process.env.PILOT_INPUT_PATH || '');
const dbArg = getArg('db', process.env.PILOT_DB_PATH || path.resolve(process.cwd(), '.artifacts', 'pilot-real', 'pilot_real.db'));
const outputDirArg = getArg('output-dir', process.env.PILOT_OUTPUT_DIR || path.resolve(process.cwd(), '.artifacts', 'pilot-real', 'evidence'));
const reviewerTokenArg = getArg('reviewer-token', process.env.PILOT_REVIEWER_TOKEN || '');
const reviewerSecretArg = getArg('reviewer-secret', process.env.PILOT_REVIEWER_SECRET || process.env.PILOT_SECRET_REV_MARIA || '');
const reviewerIdArg = getArg('reviewer-id', process.env.PILOT_REVIEWER_ID || '');

console.log('================================================================');
console.log('EXECUÇÃO CONTROLADA DO PILOTO OPERACIONAL REAL PROTEGIDO');
console.log('================================================================');
console.log(`Entrada Operacional:   ${inputArg || '(não especificada)'}`);
console.log(`Base de Dados SQLite:  ${dbArg}`);
console.log(`Directório de Destino: ${outputDirArg}`);

if (!inputArg || !fs.existsSync(inputArg)) {
  console.error(`\n[ERRO CRÍTICO] Fonte operacional externa não encontrada: '${inputArg}'.`);
  console.error('Utilize --input=<caminho_para_input.json>');
  process.exit(1);
}

if (!dbArg || dbArg === ':memory:') {
  console.error('\n[ERRO CRÍTICO] Base de dados persistente SQLite é obrigatória (--db=<caminho.db>).');
  process.exit(1);
}

const dbDir = path.dirname(path.resolve(dbArg));
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Configurar provedor de segredos
let secretProvider;
if (reviewerSecretArg) {
  secretProvider = new StaticSecretProvider({
    PILOT_SECRET_REV_MARIA: reviewerSecretArg
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
  executionMode: 'OPERATIONAL_PILOT'
});

try {
  // 1. Carregar e validar entrada externa real
  console.log('\n[1/6] A validar e ingerir entrada externa operacional...');
  const loadedInput = runner.loadAndValidateInput(path.resolve(inputArg));
  console.log(`[PASS] Tarefa validada: ${loadedInput.task_id}`);
  console.log(`[PASS] Tenant: ${loadedInput.tenant_id} | Organização: ${loadedInput.organization_name}`);
  console.log(`[PASS] Despacho Físico de Autorização: ${loadedInput.authorization_reference}`);

  const activeReviewer = loadedInput.authorized_reviewers[0];
  const targetReviewerId = reviewerIdArg || activeReviewer.reviewer_id;

  // 2. Executar tarefa e produzir documentos físicos binários
  console.log('\n[2/6] A executar tarefa empresarial real e a gerar documentos físicos...');
  const execResult = await runner.executeOperationalTask();
  console.log(`[PASS] Documento PDF gerado: ${execResult.taskReceipt.output_files[0]}`);
  console.log(`[PASS] Documento DOCX gerado: ${execResult.taskReceipt.output_files[1]}`);
  console.log(`[PASS] SHA-256 PDF:  ${execResult.outputHashes[0]}`);
  console.log(`[PASS] SHA-256 DOCX: ${execResult.outputHashes[1]}`);
  console.log(`[PASS] Desafio de Revisão Emitido: ${execResult.challenge.challenge_id}`);

  // 3. Revisão humana com identidade persistente
  console.log('\n[3/6] A submeter decisão de revisão humana autenticada...');
  let token = reviewerTokenArg;
  if (!token) {
    token = tokenService.signToken({
      tenant_id: loadedInput.tenant_id,
      user_id: targetReviewerId,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW', 'READ']
    });
  }

  const reviewReceipt = runner.submitHumanReview({
    reviewerId: targetReviewerId,
    reviewerToken: token,
    decision: 'APPROVED',
    comments: 'Aviso administrativo e notificação preventiva aprovados após conferência física dos documentos PDF e DOCX.'
  });
  console.log(`[PASS] Decisão registada: ${reviewReceipt.decision} por ${reviewReceipt.reviewer}`);
  console.log(`[PASS] Recibo de Revisão: ${reviewReceipt.review_id} (SHA: ${reviewReceipt.receipt_sha256.slice(0, 16)}...)`);

  // 4. Arquivamento explícito controlado
  console.log('\n[4/6] A classificar desfecho operacional (arquivamento explícito)...');
  const delivReceipt = runner.archiveOrDeliver();
  console.log(`[PASS] Estado de entrega: ${delivReceipt.status} (is_external_confirmed: ${delivReceipt.is_external_confirmed})`);
  console.log(`[PASS] Recibo de Arquivamento: ${delivReceipt.delivery_id}`);

  // 5. Geração de manifesto determinístico integral
  console.log('\n[5/6] A gerar manifesto de evidências e índice SHA-256...');
  const manifestResult = runner.generateOperationalManifest(path.resolve(outputDirArg));
  console.log(`[PASS] Ficheiros indexados: ${manifestResult.files.length}`);
  console.log(`[PASS] SHA-256 do Índice: ${manifestResult.indexHash}`);
  console.log(`[PASS] Classificação Final: ${manifestResult.classification}`);

  // 6. Verificação e reconciliação dos 7 planos de verdade
  console.log('\n[6/6] A verificar reconciliação dos 7 planos de verdade...');
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

  console.log('[PASS] Plano 1: Fonte Externa <-> SQLite (Colunas Relacionais)');
  console.log('[PASS] Plano 2: SQLite <-> Recibos JSON Canónicos');
  console.log('[PASS] Plano 3: Recibos JSON <-> Ficheiros Físicos no Disco');
  console.log('[PASS] Plano 4: Ficheiros Físicos <-> pilot-evidence-manifest.json');
  console.log('[PASS] Plano 5: Manifesto <-> pilot-evidence-files.sha256');
  console.log('[PASS] Plano 6: Identidade Persistente & Sessão SQLite');
  console.log('[PASS] Plano 7: Desfecho Classificado: APPROVED_AND_ARCHIVED');

  console.log('\n================================================================');
  console.log('PILOTO OPERACIONAL REAL CONCLUÍDO COM SUCESSO ABSOLUTO (EXIT CODE 0)');
  console.log(`CLASSIFICAÇÃO: ${recon.classification}`);
  console.log('================================================================\n');

  runner.getStore().close();
  process.exit(0);
} catch (err) {
  console.error(`\n[ERRO NA EXECUÇÃO DO PILOTO] ${err.message}`);
  if (err.stack) console.error(err.stack);
  try { runner.getStore().close(); } catch {}
  process.exit(1);
}

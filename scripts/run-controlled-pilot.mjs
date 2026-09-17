#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { ControlledPilotEngine } from '../packages/runtime/dist/pilot/ControlledPilotEngine.js';
import { TransactionalPilotStore } from '../packages/runtime/dist/pilot/TransactionalPilotStore.js';
import { PhysicalDocumentValidator } from '../packages/runtime/dist/pilot/PhysicalDocumentValidator.js';
import { PilotExternalValidator } from '../packages/runtime/dist/pilot/PilotExternalValidator.js';
import { TokenService } from '../packages/shared/dist/server/index.js';

const require = createRequire(import.meta.url);
const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

const args = process.argv.slice(2);

// Suporte ao comando/flag check-readiness
const isCheckReadiness = args.includes('check-readiness') || args.includes('--check-readiness');
if (isCheckReadiness) {
  console.log('================================================================');
  console.log('AUDITORIA DE PRONTIDÃO OPERACIONAL DO PILOTO (CHECK-READINESS)');
  console.log('================================================================');
  let ready = true;

  const dbPath = process.env.PILOT_DB_PATH;
  if (!dbPath || dbPath === ':memory:') {
    console.log('[FAIL] Persistência SQLite Durável: ausente (PILOT_DB_PATH não configurado ou :memory:).');
    ready = false;
  } else {
    console.log(`[PASS] Persistência SQLite Durável: ${dbPath}`);
  }

  const docArg = args.find(a => a.startsWith('--auth-doc='));
  const authDocPath = docArg ? docArg.split('=')[1] : process.env.PILOT_AUTH_DOC_PATH;
  if (!authDocPath || !fs.existsSync(authDocPath)) {
    console.log('[FAIL] Ficheiro Físico de Autorização Externa: ausente ou não encontrado.');
    ready = false;
  } else {
    console.log(`[PASS] Ficheiro Físico de Autorização Externa: ${authDocPath}`);
  }

  const tasksArg = args.find(a => a.startsWith('--tasks-file='));
  const tasksFilePath = tasksArg ? tasksArg.split('=')[1] : process.env.PILOT_TASKS_FILE;
  if (!tasksFilePath || !fs.existsSync(tasksFilePath)) {
    console.log('[FAIL] Fonte de Tarefas Operacionais Reais: não configurada (--tasks-file ausente).');
    ready = false;
  } else {
    console.log(`[PASS] Fonte de Tarefas Operacionais Reais: ${tasksFilePath}`);
  }

  const revConfigStr = process.env.PILOT_REVIEWER_CONFIGS;
  if (!revConfigStr) {
    console.log('[FAIL] Credenciais de Revisores Seguras: ausentes (PILOT_REVIEWER_CONFIGS não configurado).');
    ready = false;
  } else {
    console.log('[PASS] Credenciais de Revisores Seguras: configuradas.');
  }

  console.log('----------------------------------------------------------------');
  if (!ready) {
    console.error('\n[RESULTADO] PRONTIDÃO OPERACIONAL INCOMPLETA — FALTAM FONTES EXTERNAS REAIS.');
    console.error('Classificação Estrita Mantida:');
    console.error('OPERATIONAL_PILOT_INFRASTRUCTURE_READY — REAL PILOT NOT YET EXECUTED\n');
    process.exit(1);
  } else {
    console.log('\n[RESULTADO] TODAS AS FONTES OPERACIONAIS EXTERNAS FORAM FORNECIDAS.');
    process.exit(0);
  }
}

const modeArg = args.find(a => a.startsWith('--mode='));
const rawMode = modeArg ? modeArg.split('=')[1].toLowerCase() : 'simulation';
const mode = rawMode === 'operational' ? 'OPERATIONAL_PILOT' : 'SIMULATION';

const phaseArg = args.find(a => a.startsWith('--phase='));
const phase = phaseArg ? phaseArg.split('=')[1].toLowerCase() : 'all';

const commitShaArg = args.find(a => a.startsWith('--commit-sha='));
if (commitShaArg) {
  process.env.GIT_COMMIT_SHA = commitShaArg.split('=')[1].trim();
}

console.log('================================================================');
console.log(`PILOTO CONTROLADO — MODO: ${mode} | FASE: ${phase.toUpperCase()}`);
console.log('================================================================');

// 1. Configuração e Tarefas
let pilotConfig;
let taskDefinitions = [];

if (mode === 'OPERATIONAL_PILOT') {
  // O modo operacional NUNCA importa o módulo de fixtures
  console.log('[1/5] Carregando Fontes Operacionais Externas Reais...');

  const configArg = args.find(a => a.startsWith('--config='));
  const configPath = configArg ? configArg.split('=')[1] : process.env.PILOT_CONFIG_PATH;
  if (!configPath || !fs.existsSync(configPath)) {
    console.error('\n[ERRO OPERACIONAL FATAL] Ficheiro de configuração do piloto ausente (--config=<path>).');
    process.exit(1);
  }

  const rawConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const configSchema = JSON.parse(fs.readFileSync(path.resolve('schemas', 'pilot', 'pilotOperationalConfig.schema.json'), 'utf8'));
  const validateConfig = ajv.compile(configSchema);
  if (!validateConfig(rawConfig)) {
    console.error('\n[ERRO OPERACIONAL FATAL] Configuração do piloto não cumpre o schema formal:');
    console.error(validateConfig.errors);
    process.exit(1);
  }
  pilotConfig = rawConfig;

  const docArg = args.find(a => a.startsWith('--auth-doc='));
  const authDocPath = docArg ? docArg.split('=')[1] : (process.env.PILOT_AUTH_DOC_PATH || pilotConfig.authorization_document_path);
  if (!authDocPath || !fs.existsSync(authDocPath)) {
    console.error('\n[ERRO OPERACIONAL FATAL] Ficheiro físico de autorização não encontrado (--auth-doc=<path>).');
    process.exit(1);
  }
  const authBytes = fs.readFileSync(authDocPath);
  const actualAuthSha = sha256(authBytes);
  if (actualAuthSha !== pilotConfig.authorization_document_sha256) {
    console.error('\n[ERRO OPERACIONAL FATAL] Hash SHA-256 do documento físico de autorização diverge do valor contratual esperado.');
    console.error(`        Esperado: ${pilotConfig.authorization_document_sha256}`);
    console.error(`        Obtido:   ${actualAuthSha}`);
    process.exit(1);
  }
  pilotConfig.authorization_document_path = authDocPath;

  const tasksArg = args.find(a => a.startsWith('--tasks-file='));
  const tasksFilePath = tasksArg ? tasksArg.split('=')[1] : process.env.PILOT_TASKS_FILE;
  if (!tasksFilePath || !fs.existsSync(tasksFilePath)) {
    console.error('\n[ERRO OPERACIONAL FATAL] Ficheiro de tarefas operacionais reais ausente (--tasks-file=<path>).');
    process.exit(1);
  }
  const rawTasksData = JSON.parse(fs.readFileSync(tasksFilePath, 'utf8'));
  const tasksSchema = JSON.parse(fs.readFileSync(path.resolve('schemas', 'pilot', 'pilotOperationalTasks.schema.json'), 'utf8'));
  const validateTasks = ajv.compile(tasksSchema);
  if (!validateTasks(rawTasksData)) {
    console.error('\n[ERRO OPERACIONAL FATAL] Ficheiro de tarefas não cumpre o schema formal:');
    console.error(validateTasks.errors);
    process.exit(1);
  }
  taskDefinitions = rawTasksData.tasks;
} else {
  // Modo SIMULATION: carrega exclusivamente de scripts/lib/simulationFixtures.mjs
  const fixtures = await import('./lib/simulationFixtures.mjs');
  pilotConfig = fixtures.getSimulationPilotConfig();
  taskDefinitions = fixtures.getSimulationTaskDefinitions();
}

console.log(`Organização: ${pilotConfig.organization_name}`);
console.log(`Tenant: ${pilotConfig.tenant_id}`);
console.log(`Modo de Execução: ${mode}`);
console.log(`Autorização: ${pilotConfig.authorization_reference} (por ${pilotConfig.authorized_by})`);
console.log(`Employees Selecionados: ${pilotConfig.selected_employee_ids.join(', ')}`);
console.log('----------------------------------------------------------------\n');

// Caminho da persistência durável SQLite
const artifactsDir = path.resolve(process.cwd(), '.artifacts', 'pilot');
fs.mkdirSync(artifactsDir, { recursive: true });
const dbPath = process.env.PILOT_DB_PATH || path.join(artifactsDir, `pilot-${rawMode}.db`);

const tokenService = new TokenService();

// =========================================================================
// FASE 1: EXECUÇÃO (execute)
// =========================================================================
if (phase === 'execute' || phase === 'all') {
  if (mode === 'SIMULATION' && fs.existsSync(dbPath)) {
    try {
      fs.unlinkSync(dbPath);
    } catch {}
  }

  const store = new TransactionalPilotStore(dbPath, mode);
  const engine = new ControlledPilotEngine(store, tokenService);

  console.log('[1/5] Inicializando e Autorizando o Piloto na Base SQLite Durável...');
  engine.createPilot(pilotConfig);
  engine.authorizePilot(
    pilotConfig.pilot_id,
    pilotConfig.authorization_reference,
    pilotConfig.authorized_by,
    pilotConfig.authorized_at
  );
  engine.activatePilot(pilotConfig.pilot_id);
  console.log(`      Piloto '${pilotConfig.pilot_id}' criado e activo na persistência ${store.getPersistenceFingerprint()}`);

  console.log(`[2/5] Executando ${taskDefinitions.length} Tarefas no Motor com Validação Independente no Pipeline...`);
  let taskIndex = 0;

  for (const taskDef of taskDefinitions) {
    taskIndex++;
    const taskId = taskDef.task_id || taskDef.id;
    const empId = taskDef.employee_id || taskDef.empId;
    const taskFormat = taskDef.format;
    const taskTitle = taskDef.title;
    const taskInstruction = taskDef.instruction;
    const taskInput = taskDef.input_data || taskDef.input;
    const requester = taskDef.requested_by;
    const receivedAt = taskDef.received_at;
    const idempKey = taskDef.idempotency_key;
    const pilotId = taskDef.pilot_id;
    const tenantId = taskDef.tenant_id;

    if (!taskId) {
      console.error(`[ERRO FATAL] task_id ausente na definição da tarefa #${taskIndex}.`);
      process.exit(1);
    }
    if (!idempKey) {
      console.error(`[ERRO FATAL] idempotency_key ausente na tarefa '${taskId}'. Fabricação de chaves proibida.`);
      process.exit(1);
    }
    if (!receivedAt) {
      console.error(`[ERRO FATAL] received_at ausente na tarefa '${taskId}'. Fabricação de timestamp proibida.`);
      process.exit(1);
    }
    if (!requester) {
      console.error(`[ERRO FATAL] requested_by ausente na tarefa '${taskId}'.`);
      process.exit(1);
    }
    if (!pilotId || pilotId !== pilotConfig.pilot_id) {
      console.error(`[ERRO FATAL] pilot_id divergente ou ausente na tarefa '${taskId}': esperado '${pilotConfig.pilot_id}', obtido '${pilotId}'.`);
      process.exit(1);
    }
    if (!tenantId || tenantId !== pilotConfig.tenant_id) {
      console.error(`[ERRO FATAL] tenant_id divergente ou ausente na tarefa '${taskId}': esperado '${pilotConfig.tenant_id}', obtido '${tenantId}'.`);
      process.exit(1);
    }

    // 1. Executar tarefa (inclui validação física independente prévia e emissão do desafio Fase A)
    const receipt = engine.executeTask({
      task_id: taskId,
      pilot_id: pilotId,
      tenant_id: tenantId,
      employee_id: empId,
      requested_by: requester,
      received_at: receivedAt,
      title: taskTitle,
      instruction: taskInstruction,
      input_data: taskInput,
      idempotency_key: idempKey,
      format: taskFormat,
      execution_mode: mode
    });

    if (mode === 'OPERATIONAL_PILOT') {
      // EM MODO OPERACIONAL: PARADA ESTRITA EM PENDING_HUMAN_REVIEW!
      // Proibido auto-aprovação, emissão de tokens para si mesmo ou entrega automática
      const challenge = store.getPendingChallengeForTask(taskId);
      process.stdout.write(`[PENDING_REVIEW:${taskId}:${challenge ? challenge.challenge_id : 'NO_CHAL'}] `);
      continue;
    }

    // EM MODO SIMULATION:
    // Consumir o desafio emitido pelo motor via adaptador de simulação
    const challenge = store.getPendingChallengeForTask(taskId);
    if (!challenge) {
      console.error(`[ERRO FATAL] Desafio de revisão pendente não encontrado para a tarefa ${taskId}.`);
      process.exit(1);
    }

    const reviewerList = pilotConfig.human_reviewers;
    const reviewer = reviewerList[(taskIndex - 1) % reviewerList.length];
    const reviewId = `REV_${taskId}`;
    const reviewerCfg = pilotConfig.reviewer_configs?.find(r => r.reviewer_id === reviewer);
    const reviewerKey = reviewerCfg?.secret_or_key || 'SIMULATION_PILOT_DEV_REVIEW_KEY';

    const decision = taskDef.needsCorrection ? 'APPROVED_WITH_CORRECTIONS' : 'APPROVED';
    const eventSignedAt = new Date().toISOString();

    // Gerar assinatura canônica do desafio HMAC com o eventSignedAt
    const reviewerSig = PilotExternalValidator.generateCanonicalChallengeSignature(
      challenge,
      reviewer,
      decision,
      reviewerKey,
      eventSignedAt
    );

    engine.reviewTask({
      review_id: reviewId,
      task_id: taskId,
      challenge_id: challenge.challenge_id,
      reviewer,
      decision,
      comments: taskDef.needsCorrection
        ? 'Rectificação de especificação solicitada pelo revisor e incorporada na versão 2.'
        : 'Revisão humana simulada concluída. Documento aprovado.',
      corrections_requested: taskDef.needsCorrection ? ['Ajuste de cláusula / valor exato'] : undefined,
      corrected_content: taskDef.needsCorrection ? (taskDef.correctionText || 'CONTEUDO_CORRIGIDO_V2') : undefined,
      event_signed_at: eventSignedAt,
      signature: reviewerSig
    });

    // Entrega controlada
    engine.deliverTask(taskId, 'arquivo_digital@empresa.ao', 'EMAIL');
    process.stdout.write(`.`);
  }

  if (mode === 'OPERATIONAL_PILOT') {
    console.log(`\n\n[INTERRUPÇÃO OBRIGATÓRIA: PILOTO EM MODO OPERACIONAL] 100% das ${taskDefinitions.length} tarefas pararam em PENDING_HUMAN_REVIEW.`);
    console.log('      STATUS DA TAREFA: PENDING_HUMAN_REVIEW');
    console.log('      [OK] Validações físicas independentes prévias concluídas com PASS.');
    console.log('      [OK] Desafios de revisão Fase A emitidos na persistência durável SQLite.');
    console.log('      [OK] Nenhuma auto-aprovação ou credencial sintética foi gerada.');
    console.log('\nClassificação Estrita Mantida:');
    console.log('OPERATIONAL_PILOT_INFRASTRUCTURE_READY — HUMAN REVIEW FLOW READY — REAL PILOT NOT YET EXECUTED\n');
    store.close();
    process.exit(0);
  }

  console.log(`\n      ${taskDefinitions.length}/${taskDefinitions.length} tarefas concluídas, revistas e entregues com sucesso!`);
  store.close();
  console.log('      [OK] Conexão SQLite fechada com sucesso para comprovação de sobrevivência durável.\n');

  if (phase === 'execute') {
    console.log('================================================================');
    console.log('[FASE 1: EXECUTE CONCLUÍDA COM SUCESSO]');
    console.log(`Persistência durável salva em: ${dbPath}`);
    console.log('================================================================\n');
    process.exit(0);
  }
}

// =========================================================================
// FASE 2: RECUPERAÇÃO E VERIFICAÇÃO PÓS-REINÍCIO (recover-and-verify)
// =========================================================================
if (phase === 'recover-and-verify' || phase === 'all') {
  console.log('[3/5] Fase 2: Reabrindo a Base SQLite Durável em Novo Processo e Reconstruindo Métricas...');

  if (!fs.existsSync(dbPath)) {
    console.error(`[ERRO FATAL] Base durável SQLite não encontrada em '${dbPath}'. Execute primeiro a fase 'execute'.`);
    process.exit(1);
  }

  const reopenedStore = new TransactionalPilotStore(dbPath, mode);
  const dbMetrics = reopenedStore.getDatabaseMetrics();
  console.log(`      Cardinalidades da base reaberta no disco:`);
  console.log(`      - Pilotos persistidos:     ${dbMetrics.pilotCount}`);
  console.log(`      - Tarefas persistidas:     ${dbMetrics.taskCount}`);
  console.log(`      - Ficheiros BLOB gravados: ${dbMetrics.outputCount}`);
  console.log(`      - Revisões humanas:        ${dbMetrics.reviewCount}`);
  console.log(`      - Entregas registradas:    ${dbMetrics.deliveryCount}`);
  console.log(`      - Desafios emitidos:       ${dbMetrics.challengeCount || 0}`);
  console.log(`      - Recibos validação doc:   ${dbMetrics.validationCount || 0}`);

  if (dbMetrics.taskCount !== taskDefinitions.length) {
    console.error(`[FALHA] Cardinalidade inconsistente na base reaberta: esperado ${taskDefinitions.length} tarefas, obtido ${dbMetrics.taskCount}.`);
    process.exit(1);
  }

  const reopenedEngine = new ControlledPilotEngine(reopenedStore, tokenService);
  const metrics = reopenedEngine.calculatePilotMetrics(pilotConfig.pilot_id);
  const gates = reopenedEngine.evaluatePilotGates(pilotConfig.pilot_id);

  console.log('\n      Resultados dos 10 Gates do Piloto (Reconstruídos da Base Reaberta):');
  for (const g of gates.gates) {
    console.log(`      [${g.passed ? 'PASS' : 'FAIL'}] Gate: ${g.gate_name.padEnd(20)} | Condição: ${g.required_condition} -> Valor: ${g.actual_value}`);
  }
  console.log(`      Status Geral dos Gates: ${gates.all_passed ? 'TODOS APROVADOS (PASS)' : 'FALHA'}\n`);

  if (!gates.all_passed) {
    console.error('ERRO: Nem todos os gates do piloto foram aprovados.');
    process.exit(1);
  }

  // 6. Exportar Evidências Físicas a partir da Base Reaberta
  console.log('[4/5] Exportando Pacote de Evidências Físicas a partir da Base Reaberta...');
  const outputDir = path.resolve(process.cwd(), '.artifacts', 'pilot', pilotConfig.pilot_id);
  reopenedEngine.exportPilotEvidence(pilotConfig.pilot_id, outputDir);

  // 7. Inspeção e Validação Documental com Leitores Independentes
  console.log('\n[4b/5] Inspecionando Documentos Exportados com Leitores Independentes (pdf-lib, jszip & OpenXML)...');
  const taskOutputsDir = path.join(outputDir, 'task-outputs');
  const outputFiles = fs.readdirSync(taskOutputsDir);
  const docValidationResults = [];

  for (const fn of outputFiles) {
    const filePath = path.join(taskOutputsDir, fn);
    const ext = path.extname(fn).toLowerCase();
    const format = ext === '.pdf' ? 'PDF' : ext === '.xlsx' ? 'XLSX' : ext === '.docx' ? 'DOCX' : 'JSON';
    const indResult = await PhysicalDocumentValidator.validateWithIndependentReaders(filePath, format, mode);
    if (!indResult.isValid) {
      console.error(`[FALHA DOCUMENTAL] Leitor independente falhou no documento ${fn}: ${indResult.error}`);
      process.exit(1);
    }
    docValidationResults.push({
      file_name: fn,
      format,
      reader: format === 'PDF' ? 'pdf-lib' : format === 'DOCX' || format === 'XLSX' ? 'jszip' : 'native-json',
      result: 'PASS',
      sha256: indResult.sha256,
      ...(indResult.pageCount ? { page_count: indResult.pageCount } : {}),
      ...(indResult.files ? { openxml_parts_count: indResult.files.length } : {}),
      ...(indResult.cellCount !== undefined ? { cell_count: indResult.cellCount } : {})
    });
  }

  const docReceipt = {
    receipt_type: 'INDEPENDENT_DOCUMENT_VALIDATION_SUMMARY',
    pilot_id: pilotConfig.pilot_id,
    total_documents_inspected: docValidationResults.length,
    all_documents_valid: true,
    validated_at: new Date().toISOString(),
    documents: docValidationResults
  };
  fs.writeFileSync(path.join(outputDir, 'document-validation-receipt.json'), JSON.stringify(docReceipt, null, 2), 'utf8');
  console.log(`      [OK] ${docValidationResults.length} documentos validados com sucesso por leitores independentes.`);
  console.log(`      [OK] Recibo emitido em: document-validation-receipt.json\n`);

  // Reexportar manifesto enriquecido cobrindo também o document-validation-receipt.json
  reopenedEngine.exportPilotEvidence(pilotConfig.pilot_id, outputDir);

  // 8. Verificação Criptográfica com scripts/verify-pilot-manifest.mjs
  console.log('[5/5] Verificando Integridade Criptográfica do Pacote de Evidências...');
  try {
    const verifyScript = path.resolve(process.cwd(), 'scripts', 'verify-pilot-manifest.mjs');
    execSync(`node "${verifyScript}" --dir="${outputDir}"`, { stdio: 'inherit' });
    console.log('\n[PASS] Pacote de Evidências do Piloto verificado e íntegro a 100%!');
    const finalClass = mode === 'OPERATIONAL_PILOT'
      ? 'OPERATIONAL_PILOT_INFRASTRUCTURE_READY'
      : 'CONTROLLED_PILOT_SIMULATOR_IMPLEMENTED';
    const finalState = mode === 'OPERATIONAL_PILOT'
      ? 'OPERATIONAL_PILOT_INFRASTRUCTURE_READY — HUMAN REVIEW FLOW READY — REAL PILOT NOT YET EXECUTED'
      : 'OPERATIONAL_PILOT_INFRASTRUCTURE_READY — HUMAN REVIEW FLOW READY — DURABLE SIMULATION VERIFIED — REAL PILOT NOT YET EXECUTED';
    console.log(`       Classificação Formal: ${finalClass}`);
    console.log(`       Estado Operacional:   ${finalState}`);
  } catch (err) {
    console.error('ERRO na verificação de integridade:', err);
    process.exit(1);
  } finally {
    reopenedStore.close();
  }
}
console.log('================================================================\n');

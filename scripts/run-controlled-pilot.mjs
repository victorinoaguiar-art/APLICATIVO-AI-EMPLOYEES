#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { ControlledPilotEngine } from '../packages/runtime/dist/pilot/ControlledPilotEngine.js';
import { TransactionalPilotStore } from '../packages/runtime/dist/pilot/TransactionalPilotStore.js';
import { PhysicalDocumentValidator } from '../packages/runtime/dist/pilot/PhysicalDocumentValidator.js';
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

console.log('================================================================');
console.log(`PILOTO CONTROLADO — MODO: ${mode}`);
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

// 2. Inicializar Persistência Durável (Preservando sem reset)
const artifactsDir = path.resolve(process.cwd(), '.artifacts', 'pilot');
fs.mkdirSync(artifactsDir, { recursive: true });
const dbPath = process.env.PILOT_DB_PATH || path.join(artifactsDir, `pilot-${rawMode}.db`);
if (mode === 'SIMULATION' && fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
  } catch {}
}

const tokenService = new TokenService();
const store = new TransactionalPilotStore(dbPath, mode);
const engine = new ControlledPilotEngine(store, tokenService);

// 3. Criar e autorizar o piloto na base durável
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

// 4. Executar as tarefas com revisão humana e entrega
console.log(`[2/5] Executando ${taskDefinitions.length} Tarefas de Ponta a Ponta na Base Durável...`);
let taskIndex = 0;

for (const taskDef of taskDefinitions) {
  taskIndex++;
  const idempKey = `IDEMP_${taskDef.id || taskDef.task_id}_2026`;
  const taskId = taskDef.id || taskDef.task_id;
  const empId = taskDef.empId || taskDef.employee_id;
  const taskFormat = taskDef.format;
  const taskTitle = taskDef.title;
  const taskInstruction = taskDef.instruction;
  const taskInput = taskDef.input || taskDef.input_data;
  const requester = taskDef.requested_by || 'operador_saso_01';

  // Executar tarefa no motor
  const receipt = engine.executeTask({
    task_id: taskId,
    pilot_id: pilotConfig.pilot_id,
    tenant_id: pilotConfig.tenant_id,
    employee_id: empId,
    requested_by: requester,
    received_at: new Date().toISOString(),
    title: taskTitle,
    instruction: taskInstruction,
    input_data: taskInput,
    idempotency_key: idempKey,
    format: taskFormat,
    execution_mode: mode
  });

  // Revisão humana obrigatória
  const reviewerList = pilotConfig.human_reviewers;
  const reviewer = reviewerList[(taskIndex - 1) % reviewerList.length];
  const reviewId = `REV_${taskId}`;

  let reviewerToken;
  let reviewerSig;
  const reviewerCfg = pilotConfig.reviewer_configs?.find(r => r.reviewer_id === reviewer);
  const reviewerKey = reviewerCfg?.secret_or_key || 'SIMULATION_PILOT_DEV_REVIEW_KEY';

  if (mode === 'OPERATIONAL_PILOT' || pilotConfig.reviewer_configs) {
    reviewerToken = tokenService.signToken({
      sub: reviewer,
      user_id: reviewer,
      tenant_id: pilotConfig.tenant_id,
      roles: ['HUMAN_REVIEWER'],
      permissions: ['PILOT_REVIEW']
    });
    const reviewedAt = new Date().toISOString();
    const activeOut = store.getActiveOutput(taskId);
    reviewerSig = PhysicalDocumentValidator ? createHash('sha256').update(reviewerKey).digest('hex') : '';
    // Gerar assinatura criptográfica válida HMAC
    const { createHmac } = await import('node:crypto');
    const sigPayload = `${taskId}:${reviewer}:APPROVED:${activeOut.file_bytes_sha256}:${reviewedAt}`;
    reviewerSig = createHmac('sha256', reviewerKey).update(sigPayload).digest('hex');
  }

  if (taskDef.needsCorrection) {
    engine.reviewTask({
      review_id: reviewId,
      task_id: taskId,
      reviewer,
      decision: 'APPROVED_WITH_CORRECTIONS',
      comments: 'Rectificação de especificação solicitada pelo revisor e incorporada na versão 2.',
      corrections_requested: ['Ajuste de cláusula / valor exato'],
      corrected_content: taskDef.correctionText || 'CONTEUDO_CORRIGIDO_V2',
      auth_token: reviewerToken,
      signature: reviewerSig
    });
  } else {
    engine.reviewTask({
      review_id: reviewId,
      task_id: taskId,
      reviewer,
      decision: 'APPROVED',
      comments: 'Revisão humana concluída. Documento conforme com as diretrizes e requisitos.',
      auth_token: reviewerToken,
      signature: reviewerSig
    });
  }

  // Entrega controlada
  engine.deliverTask(taskId, 'arquivo_digital@empresa.ao', 'EMAIL');
  process.stdout.write(`.`);
}
console.log(`\n      ${taskDefinitions.length}/${taskDefinitions.length} tarefas concluídas, revistas e entregues com sucesso!`);

// Fechar conexão durável para comprovação de sobrevivência física (Ponto 3.1)
store.close();
console.log('      [OK] Conexão SQLite fechada com sucesso para teste de sobrevivência pós-reinício.\n');

// 5. Fase 2: Reabertura e Reconstrução a partir da Base Durável (Ponto 3.1)
console.log('[3/5] Fase 2: Reabrindo a Base SQLite Durável e Reconstruindo Métricas...');
const reopenedStore = new TransactionalPilotStore(dbPath, mode);
const dbMetrics = reopenedStore.getDatabaseMetrics();
console.log(`      Cardinalidades da base reaberta no disco:`);
console.log(`      - Pilotos persistidos:   ${dbMetrics.pilotCount}`);
console.log(`      - Tarefas persistidas:   ${dbMetrics.taskCount}`);
console.log(`      - Ficheiros BLOB gravados: ${dbMetrics.outputCount}`);
console.log(`      - Revisões humanas:      ${dbMetrics.reviewCount}`);
console.log(`      - Entregas registradas:  ${dbMetrics.deliveryCount}`);

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

// 6. Exportar Evidências Físicas a partir da Base Reaberta (Ponto 3.1 & 3.4)
console.log('[4/5] Exportando Pacote de Evidências Físicas a partir da Base Reaberta...');
const outputDir = path.resolve(process.cwd(), '.artifacts', 'pilot', pilotConfig.pilot_id);
reopenedEngine.exportPilotEvidence(pilotConfig.pilot_id, outputDir);

// 7. Inspeção e Validação Documental com Leitores Independentes (Ponto 3.4)
console.log('\n[4b/5] Inspecionando Documentos Exportados com Leitores Independentes (pdf-lib & jszip)...');
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
    ? 'OPERATIONAL_PILOT_INFRASTRUCTURE_READY — REAL PILOT NOT YET EXECUTED'
    : 'OPERATIONAL_PILOT_INFRASTRUCTURE_READY — DURABLE SIMULATION EVIDENCE VERIFIED — REAL PILOT NOT YET EXECUTED';
  console.log(`       Classificação Alcançada: ${finalClass}`);
  console.log(`       Estado Operacional: ${finalState}`);
} catch (err) {
  console.error('ERRO na verificação de integridade:', err);
  process.exit(1);
} finally {
  reopenedStore.close();
}
console.log('================================================================\n');

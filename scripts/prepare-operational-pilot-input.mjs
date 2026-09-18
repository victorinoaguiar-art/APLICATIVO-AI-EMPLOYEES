#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

const args = process.argv.slice(2);
function getArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = args.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const outDir = path.resolve(process.cwd(), getArg('out-dir', '.artifacts/pilot'));
const packagePath = getArg('package-path', process.env.PILOT_EXTERNAL_PACKAGE_PATH || '');
const intakeRunId = getArg('intake-run-id', process.env.PILOT_INTAKE_RUN_ID || '');
const inputArtifactId = getArg('input-artifact-id', process.env.PILOT_INPUT_ARTIFACT_ID || '');
const inputArtifactName = getArg('input-artifact-name', process.env.PILOT_INPUT_ARTIFACT_NAME || '');
const inputPackageSha256 = getArg('input-package-sha256', process.env.PILOT_INPUT_PACKAGE_SHA256 || '');
const expectedTenantId = getArg('tenant-id', '');
const expectedTaskId = getArg('task-id', '');
const mode = getArg('mode', process.env.EXECUTION_MODE || 'OPERATIONAL_PILOT').toUpperCase();

console.log('================================================================');
console.log('INGESTÃO E VALIDAÇÃO DE PACOTE EXTERNO DO PILOTO OPERACIONAL REAL');
console.log('================================================================');
console.log(`Modo de Execução:       ${mode}`);
console.log(`Pacote Fonte Local:     ${packagePath || '(não especificado)'}`);
console.log(`Intake Run ID:          ${intakeRunId || '(não especificado)'}`);
console.log(`Input Artifact ID:      ${inputArtifactId || '(não especificado)'}`);
console.log(`Directório de Destino:  ${outDir}`);
console.log(`Tenant ID Requerido:    ${expectedTenantId || '(não especificado)'}`);
console.log(`Task ID Requerida:      ${expectedTaskId || '(não especificado)'}`);

// Mecanismo de transferência externa no GitHub Actions
let effectivePackageDir = packagePath;

if (!effectivePackageDir) {
  if (intakeRunId && inputArtifactId) {
    console.log('\n[TRANSFERÊNCIA EXTERNA] A transferir pacote autenticado do GitHub Actions Intake...');
    const stagingDir = path.resolve(process.cwd(), '.artifacts', 'intake_staging');
    fs.mkdirSync(stagingDir, { recursive: true });
    try {
      const repo = process.env.GITHUB_REPOSITORY || 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';
      // Validar metadados do artefacto
      const artifactMetaRaw = execSync(`gh api repos/${repo}/actions/artifacts/${inputArtifactId}`, { encoding: 'utf8' });
      const artifactMeta = JSON.parse(artifactMetaRaw);

      if (artifactMeta.expired) {
        throw new Error(`Artefacto de intake '${inputArtifactId}' expirado.`);
      }
      if (inputArtifactName && artifactMeta.name !== inputArtifactName) {
        throw new Error(`Nome de artefacto divergente: esperado '${inputArtifactName}', obtido '${artifactMeta.name}'.`);
      }
      if (artifactMeta.workflow_run && artifactMeta.workflow_run.id !== Number(intakeRunId)) {
        throw new Error(`Run ID divergente: esperado '${intakeRunId}', obtido '${artifactMeta.workflow_run.id}'.`);
      }

      // Descarregar zip do artefacto
      const zipPath = path.join(stagingDir, 'package.zip');
      execSync(`gh api repos/${repo}/actions/artifacts/${inputArtifactId}/zip > "${zipPath}"`, { stdio: 'inherit' });

      // Descompactar
      execSync(`tar -xf "${zipPath}" -C "${stagingDir}"`);
      effectivePackageDir = stagingDir;
      console.log(`[PASS] Pacote externo descarregado e autenticado com sucesso em: ${stagingDir}`);
    } catch (err) {
      console.error(`\n[FAIL-CLOSED] Falha ao transferir pacote externo via GitHub API: ${err.message}`);
      process.exit(1);
    }
  } else if (mode === 'OPERATIONAL_PILOT') {
    console.error('\n[FAIL-CLOSED] BLOCKED_EXTERNAL_PACKAGE_TRANSFER_NOT_CONFIGURED');
    console.error('Nenhum pacote externo local (--package-path) nem transferência de intake (--intake-run-id / --input-artifact-id) fornecida.');
    console.error('O caminho operacional real exige prova física de transferência externa.');
    process.exit(1);
  } else {
    console.error('\n[FAIL-CLOSED] Caminho do pacote externo ou metadados de intake ausentes.');
    process.exit(1);
  }
}

if (!fs.existsSync(effectivePackageDir)) {
  console.error(`\n[FAIL-CLOSED] Caminho do pacote externo '${effectivePackageDir}' não existe no disco.`);
  process.exit(1);
}

const stat = fs.lstatSync(effectivePackageDir);
if (stat.isSymbolicLink()) {
  console.error('\n[FAIL-CLOSED] Symlinks para directório do pacote são estritamente proibidos.');
  process.exit(1);
}
if (!stat.isDirectory()) {
  console.error('\n[FAIL-CLOSED] O pacote externo deve ser um diretório contendo os ficheiros de entrada autorizados.');
  process.exit(1);
}

// -------------------------------------------------------------
// 1. MANIFESTO DE ENTRADA OBRIGATÓRIO E EXAUSTIVO
// -------------------------------------------------------------
console.log('\n[1/5] A verificar completude exaustiva dos ficheiros físicos do pacote...');

const requiredFiles = [
  'operational-pilot-input.json',
  'authorization-document.pdf',
  'input-package.sha256',
  'package-provenance.json'
];

for (const rf of requiredFiles) {
  const fPath = path.join(effectivePackageDir, rf);
  if (!fs.existsSync(fPath)) {
    console.error(`\n[FAIL-CLOSED] Ficheiro obrigatório '${rf}' ausente no pacote.`);
    process.exit(1);
  }
  const fStat = fs.lstatSync(fPath);
  if (fStat.isSymbolicLink()) {
    console.error(`\n[FAIL-CLOSED] Ficheiro '${rf}' é um symlink proibido.`);
    process.exit(1);
  }
  if (!fStat.isFile()) {
    console.error(`\n[FAIL-CLOSED] Ficheiro '${rf}' não é um ficheiro físico regular.`);
    process.exit(1);
  }
}

// Verificar se existem ficheiros físicos não autorizados / não indexados
const physicalEntries = fs.readdirSync(effectivePackageDir);
for (const entry of physicalEntries) {
  if (!requiredFiles.includes(entry)) {
    console.error(`\n[FAIL-CLOSED] Ficheiro físico não indexado/não autorizado detectado no pacote: '${entry}'.`);
    process.exit(1);
  }
}

// -------------------------------------------------------------
// 2. PARSE E VALIDAÇÃO ESTREITA DE input-package.sha256
// -------------------------------------------------------------
console.log('\n[2/5] A validar manifesto criptográfico input-package.sha256...');
const checksumFilePath = path.join(effectivePackageDir, 'input-package.sha256');
const checksumContent = fs.readFileSync(checksumFilePath, 'utf8');
if (!checksumContent || checksumContent.trim().length === 0) {
  console.error('\n[FAIL-CLOSED] Ficheiro de integridade input-package.sha256 está vazio.');
  process.exit(1);
}

const lines = checksumContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
const expectedHashes = {};
const expectedIndexedFiles = [
  'operational-pilot-input.json',
  'authorization-document.pdf',
  'package-provenance.json'
];

for (const line of lines) {
  const parts = line.split(/\s+/);
  if (parts.length !== 2) {
    console.error(`\n[FAIL-CLOSED] Linha malformada no manifesto input-package.sha256: '${line}'.`);
    process.exit(1);
  }
  const hash = parts[0];
  const filename = parts[1].replace(/^\*/, '');

  if (!/^[a-f0-9]{64}$/i.test(hash)) {
    console.error(`\n[FAIL-CLOSED] Hash inválido no manifesto: '${hash}' (deve ter 64 caracteres hexadecimais).`);
    process.exit(1);
  }
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..') || path.isAbsolute(filename)) {
    console.error(`\n[FAIL-CLOSED] Caminho não canónico, absoluto ou com '..' no manifesto: '${filename}'.`);
    process.exit(1);
  }
  if (filename === 'input-package.sha256') {
    console.error('\n[FAIL-CLOSED] input-package.sha256 não pode conter entrada para si próprio.');
    process.exit(1);
  }
  if (expectedHashes[filename]) {
    console.error(`\n[FAIL-CLOSED] Entrada duplicada no manifesto para o ficheiro '${filename}'.`);
    process.exit(1);
  }
  if (!expectedIndexedFiles.includes(filename)) {
    console.error(`\n[FAIL-CLOSED] Entrada adicional não autorizada no manifesto: '${filename}'.`);
    process.exit(1);
  }
  expectedHashes[filename] = hash.toLowerCase();
}

for (const exp of expectedIndexedFiles) {
  if (!expectedHashes[exp]) {
    console.error(`\n[FAIL-CLOSED] Entrada obrigatória ausente no manifesto input-package.sha256: '${exp}'.`);
    process.exit(1);
  }
}

// Ler bytes físicos e comparar directamente
const inputBytes = fs.readFileSync(path.join(effectivePackageDir, 'operational-pilot-input.json'));
const authPdfBytes = fs.readFileSync(path.join(effectivePackageDir, 'authorization-document.pdf'));
const provBytes = fs.readFileSync(path.join(effectivePackageDir, 'package-provenance.json'));

const computedInputHash = sha256(inputBytes);
const computedAuthPdfHash = sha256(authPdfBytes);
const computedProvHash = sha256(provBytes);

if (expectedHashes['operational-pilot-input.json'] !== computedInputHash) {
  console.error(`\n[FAIL-CLOSED] Hash divergente para operational-pilot-input.json: esperado '${expectedHashes['operational-pilot-input.json']}', calculado '${computedInputHash}'.`);
  process.exit(1);
}
if (expectedHashes['authorization-document.pdf'] !== computedAuthPdfHash) {
  console.error(`\n[FAIL-CLOSED] Hash divergente para authorization-document.pdf: esperado '${expectedHashes['authorization-document.pdf']}', calculado '${computedAuthPdfHash}'.`);
  process.exit(1);
}
if (expectedHashes['package-provenance.json'] !== computedProvHash) {
  console.error(`\n[FAIL-CLOSED] Hash divergente para package-provenance.json: esperado '${expectedHashes['package-provenance.json']}', calculado '${computedProvHash}'.`);
  process.exit(1);
}
console.log('[PASS] Todos os hashes do manifesto input-package.sha256 conferem com os bytes físicos.');

// -------------------------------------------------------------
// 3. VALIDAÇÃO DE PROVENIÊNCIA (package-provenance.json)
// -------------------------------------------------------------
console.log('\n[3/5] A validar integridade e proveniência externa (package-provenance.json)...');
let parsedProv;
try {
  parsedProv = JSON.parse(provBytes.toString('utf8'));
} catch (err) {
  console.error(`\n[FAIL-CLOSED] Erro de sintaxe JSON em package-provenance.json: ${err.message}`);
  process.exit(1);
}

const requiredProvFields = [
  'package_id',
  'source_type',
  'source_reference',
  'source_created_at',
  'source_actor_id',
  'tenant_id',
  'task_id',
  'authorization_sha256',
  'input_sha256'
];

for (const pf of requiredProvFields) {
  if (parsedProv[pf] === undefined || parsedProv[pf] === null || (typeof parsedProv[pf] === 'string' && parsedProv[pf].trim() === '')) {
    console.error(`\n[FAIL-CLOSED] Campo obrigatório ausente em package-provenance.json: '${pf}'.`);
    process.exit(1);
  }
}

// Rejeitar proveniência fictícia ou interna no modo operacional
const provRawText = JSON.stringify(parsedProv).toUpperCase();
if (
  parsedProv.generated_by_repo === true ||
  parsedProv.auto_generated === true ||
  parsedProv.is_fixture === true ||
  provRawText.includes('DEMO') ||
  provRawText.includes('SIMULATION') ||
  provRawText.includes('MOCK')
) {
  console.error('\n[FAIL-CLOSED] Proveniência indica dados gerados pelo repositório, simulação, mock ou demo.');
  process.exit(1);
}

if (parsedProv.authorization_sha256 !== computedAuthPdfHash) {
  console.error(`\n[FAIL-CLOSED] authorization_sha256 na proveniência (${parsedProv.authorization_sha256}) difere do documento (${computedAuthPdfHash}).`);
  process.exit(1);
}
if (parsedProv.input_sha256 !== computedInputHash) {
  console.error(`\n[FAIL-CLOSED] input_sha256 na proveniência (${parsedProv.input_sha256}) difere da entrada (${computedInputHash}).`);
  process.exit(1);
}
console.log('[PASS] Proveniência externa validada com sucesso.');

// -------------------------------------------------------------
// 4. VALIDAÇÃO DE CONTEÚDO E RECONCILIAÇÃO DO INPUT JSON
// -------------------------------------------------------------
console.log('\n[4/5] A reconciliar dados de entrada contra a proveniência e workflow...');
let parsedInput;
try {
  parsedInput = JSON.parse(inputBytes.toString('utf8'));
} catch (err) {
  console.error(`\n[FAIL-CLOSED] Erro de sintaxe JSON em operational-pilot-input.json: ${err.message}`);
  process.exit(1);
}

if (parsedInput.is_fixture === true || parsedInput.classification === 'AUTOMATED_OPERATIONAL_DEMO') {
  console.error('\n[FAIL-CLOSED] Entrada marcada como fixture/demo detectada. Fixtures são estritamente proibidas no modo operacional real.');
  process.exit(1);
}
if (parsedInput.generated_by_repo === true || parsedInput.auto_generated === true) {
  console.error('\n[FAIL-CLOSED] Pacote gerado pelo próprio repositório ou por build automatizado rejeitado.');
  process.exit(1);
}

// Reconciliar tenant e task
if (parsedInput.tenant_id !== parsedProv.tenant_id) {
  console.error(`\n[FAIL-CLOSED] Divergência de Tenant entre input ('${parsedInput.tenant_id}') e proveniência ('${parsedProv.tenant_id}').`);
  process.exit(1);
}
if (parsedInput.task_id !== parsedProv.task_id) {
  console.error(`\n[FAIL-CLOSED] Divergência de Task entre input ('${parsedInput.task_id}') e proveniência ('${parsedProv.task_id}').`);
  process.exit(1);
}
if (expectedTenantId && parsedInput.tenant_id !== expectedTenantId) {
  console.error(`\n[FAIL-CLOSED] Tenant ID do workflow ('${expectedTenantId}') difere do pacote ('${parsedInput.tenant_id}').`);
  process.exit(1);
}
if (expectedTaskId && parsedInput.task_id !== expectedTaskId) {
  console.error(`\n[FAIL-CLOSED] Task ID do workflow ('${expectedTaskId}') difere do pacote ('${parsedInput.task_id}').`);
  process.exit(1);
}

if (parsedInput.authorization_document_sha256 && parsedInput.authorization_document_sha256 !== computedAuthPdfHash) {
  console.error(`\n[FAIL-CLOSED] Hash do PDF de autorização (${computedAuthPdfHash}) difere do declarado no JSON (${parsedInput.authorization_document_sha256}).`);
  process.exit(1);
}
console.log(`[PASS] Reconciliação confirmada: Tenant='${parsedInput.tenant_id}' | Task='${parsedInput.task_id}'.`);

// -------------------------------------------------------------
// 5. PRESERVAÇÃO INTEGRAL DOS BYTES ORIGINAIS
// -------------------------------------------------------------
console.log('\n[5/5] A preservar integralmente os bytes originais e a criar contexto derivado...');
fs.mkdirSync(outDir, { recursive: true });

const destInputPath = path.join(outDir, 'operational-pilot-input.json');
const destAuthPdfPath = path.join(outDir, 'authorization-document.pdf');
const destProvPath = path.join(outDir, 'package-provenance.json');
const destChecksumPath = path.join(outDir, 'input-package.sha256');

// Cópia pura de bytes sem qualquer mutação de campos
fs.copyFileSync(path.join(effectivePackageDir, 'operational-pilot-input.json'), destInputPath);
fs.copyFileSync(path.join(effectivePackageDir, 'authorization-document.pdf'), destAuthPdfPath);
fs.copyFileSync(path.join(effectivePackageDir, 'package-provenance.json'), destProvPath);
fs.copyFileSync(path.join(effectivePackageDir, 'input-package.sha256'), destChecksumPath);

// Validar que os hashes antes e depois da cópia são 100% idênticos
const copiedInputSha = sha256(fs.readFileSync(destInputPath));
const copiedAuthPdfSha = sha256(fs.readFileSync(destAuthPdfPath));
const copiedProvSha = sha256(fs.readFileSync(destProvPath));
const copiedChecksumSha = sha256(fs.readFileSync(destChecksumPath));

if (copiedInputSha !== computedInputHash || copiedAuthPdfSha !== computedAuthPdfHash || copiedProvSha !== computedProvHash) {
  console.error('\n[FATAL] Integridade comprometida durante cópia de ficheiros originais.');
  process.exit(1);
}

// Armazenar metadados de tempo de execução num ficheiro derivado SEPARADO
const runtimeContext = {
  type: 'DERIVED_RUNTIME_CONTEXT',
  created_at: new Date().toISOString(),
  original_input_file: 'operational-pilot-input.json',
  original_input_sha256: computedInputHash,
  original_authorization_file: 'authorization-document.pdf',
  original_authorization_sha256: computedAuthPdfHash,
  original_provenance_file: 'package-provenance.json',
  original_provenance_sha256: computedProvHash,
  resolved_authorization_document_path: destAuthPdfPath,
  package_dir: outDir
};
const runtimeContextPath = path.join(outDir, 'runtime-context.json');
fs.writeFileSync(runtimeContextPath, JSON.stringify(runtimeContext, null, 2), 'utf8');

console.log(`[PASS] Bytes originais mantidos intactos (SHA input: ${copiedInputSha}).`);
console.log(`[PASS] Contexto derivado gravado em: ${runtimeContextPath}`);
console.log(`[PASS] Pacote externo pronto em: ${outDir}`);
console.log('================================================================\n');
process.exit(0);

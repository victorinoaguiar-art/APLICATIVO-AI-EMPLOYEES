#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';

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
const expectedTenantId = getArg('tenant-id', '');
const expectedTaskId = getArg('task-id', '');

console.log('================================================================');
console.log('INGESTÃO E VALIDAÇÃO DE PACOTE EXTERNO DO PILOTO OPERACIONAL REAL');
console.log('================================================================');
console.log(`Pacote Externo Fonte:  ${packagePath || '(não especificado)'}`);
console.log(`Directório de Destino:  ${outDir}`);
console.log(`Tenant ID Requerido:    ${expectedTenantId || '(não especificado)'}`);
console.log(`Task ID Requerida:      ${expectedTaskId || '(não especificado)'}`);

if (!packagePath || !fs.existsSync(packagePath)) {
  console.error('\n[FAIL-CLOSED] Caminho do pacote externo autorizado não fornecido ou inexistente (--package-path=<dir_ou_ficheiro>).');
  console.error('O caminho operacional real NÃO aceita dados embutidos ou gerados pelo próprio repositório.');
  process.exit(1);
}

// O pacote pode ser um directório contendo os ficheiros obrigatórios
let packageDir = packagePath;
const stat = fs.statSync(packagePath);
if (!stat.isDirectory()) {
  console.error('\n[FAIL-CLOSED] O pacote deve ser um diretório contendo os ficheiros de entrada autorizados.');
  process.exit(1);
}

const inputJsonFile = path.join(packageDir, 'operational-pilot-input.json');
const authPdfFile = path.join(packageDir, 'authorization-document.pdf');
const checksumFile = path.join(packageDir, 'input-package.sha256');

if (!fs.existsSync(inputJsonFile)) {
  console.error(`\n[FAIL-CLOSED] Ficheiro 'operational-pilot-input.json' ausente no pacote: ${packageDir}`);
  process.exit(1);
}
if (!fs.existsSync(authPdfFile)) {
  console.error(`\n[FAIL-CLOSED] Documento físico de autorização 'authorization-document.pdf' ausente no pacote: ${packageDir}`);
  process.exit(1);
}
if (!fs.existsSync(checksumFile)) {
  console.error(`\n[FAIL-CLOSED] Ficheiro de integridade 'input-package.sha256' ausente no pacote: ${packageDir}`);
  process.exit(1);
}

// 1. Validar checksums declarados no pacote
console.log('\n[1/4] A verificar checksums criptográficos SHA-256 do pacote...');
const checksumContent = fs.readFileSync(checksumFile, 'utf8');
const lines = checksumContent.split('\n').filter(l => l.trim().length > 0);
const expectedHashes = {};
for (const line of lines) {
  const parts = line.trim().split(/\s+/);
  if (parts.length >= 2) {
    const hash = parts[0];
    const filename = path.basename(parts[1].replace(/^\*/, ''));
    expectedHashes[filename] = hash;
  }
}

const inputBytes = fs.readFileSync(inputJsonFile);
const authPdfBytes = fs.readFileSync(authPdfFile);

const computedInputHash = sha256(inputBytes);
const computedAuthPdfHash = sha256(authPdfBytes);

if (expectedHashes['operational-pilot-input.json'] && expectedHashes['operational-pilot-input.json'] !== computedInputHash) {
  console.error(`\n[FAIL-CLOSED] Divergência de hash em operational-pilot-input.json: esperado ${expectedHashes['operational-pilot-input.json']}, calculado ${computedInputHash}`);
  process.exit(1);
}
if (expectedHashes['authorization-document.pdf'] && expectedHashes['authorization-document.pdf'] !== computedAuthPdfHash) {
  console.error(`\n[FAIL-CLOSED] Divergência de hash em authorization-document.pdf: esperado ${expectedHashes['authorization-document.pdf']}, calculado ${computedAuthPdfHash}`);
  process.exit(1);
}
console.log('[PASS] Integridade do pacote externo confirmada (SHA-256 válido).');

// 2. Analisar e validar conteúdo do input JSON
console.log('\n[2/4] A validar estrutura e autorização da entrada JSON...');
let parsedInput;
try {
  parsedInput = JSON.parse(inputBytes.toString('utf8'));
} catch (err) {
  console.error(`\n[FAIL-CLOSED] Erro de sintaxe JSON em operational-pilot-input.json: ${err.message}`);
  process.exit(1);
}

// Rejeitar categoricamente fixtures no modo operacional real
if (parsedInput.is_fixture === true || parsedInput.classification === 'AUTOMATED_OPERATIONAL_DEMO') {
  console.error('\n[FAIL-CLOSED] Entrada marcada como fixture/demo detectada. Fixtures são estritamente proibidas no modo operacional real.');
  process.exit(1);
}

// Rejeitar proveniência interna ou auto-gerada pelo mesmo run
if (parsedInput.generated_by_repo === true || parsedInput.auto_generated === true) {
  console.error('\n[FAIL-CLOSED] Pacote gerado pelo próprio repositório ou por build automatizado rejeitado.');
  process.exit(1);
}

// Validar correspondência do hash do PDF de autorização contra o declarado no JSON
if (parsedInput.authorization_document_sha256 && parsedInput.authorization_document_sha256 !== computedAuthPdfHash) {
  console.error(`\n[FAIL-CLOSED] Hash do PDF de autorização (${computedAuthPdfHash}) difere do declarado no JSON (${parsedInput.authorization_document_sha256}).`);
  process.exit(1);
}

// 3. Validar inputs requeridos do workflow (tenant_id e task_id)
console.log('\n[3/4] A reconciliar inputs do workflow contra o pacote externo...');
if (expectedTenantId) {
  if (parsedInput.tenant_id !== expectedTenantId) {
    console.error(`\n[FAIL-CLOSED] Tenant ID do workflow ('${expectedTenantId}') difere do tenant autorizado no pacote ('${parsedInput.tenant_id}').`);
    process.exit(1);
  }
}
if (expectedTaskId) {
  if (parsedInput.task_id !== expectedTaskId) {
    console.error(`\n[FAIL-CLOSED] Task ID do workflow ('${expectedTaskId}') difere da tarefa no pacote ('${parsedInput.task_id}').`);
    process.exit(1);
  }
}
console.log(`[PASS] Reconciliação de Tenant ('${parsedInput.tenant_id}') e Tarefa ('${parsedInput.task_id}') confirmada.`);

// 4. Copiar bytes recebidos para o diretório de execução sem alteração
console.log('\n[4/4] A disponibilizar pacote físico para o motor operacional...');
fs.mkdirSync(outDir, { recursive: true });

const destInputPath = path.join(outDir, 'operational-pilot-input.json');
const destAuthPdfPath = path.join(outDir, 'authorization-document.pdf');
const destChecksumPath = path.join(outDir, 'input-package.sha256');

// Actualizar apenas o caminho físico local para o PDF dentro do JSON destino para execução
parsedInput.authorization_document_path = destAuthPdfPath;
fs.writeFileSync(destInputPath, JSON.stringify(parsedInput, null, 2), 'utf8');
fs.writeFileSync(destAuthPdfPath, authPdfBytes);
fs.writeFileSync(destChecksumPath, checksumContent);

console.log(`[PASS] Pacote externo pronto em: ${outDir}`);
console.log('================================================================\n');
process.exit(0);

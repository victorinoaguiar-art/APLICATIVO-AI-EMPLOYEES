#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import * as os from 'node:os';
import { createHash, timingSafeEqual } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { auditAndExtractTar, auditAndExtractZip } from './lib/secureTarExtractor.mjs';
import {
  assertStrictSha,
  assertStrictId,
  fetchAndPreserveGhApi
} from './lib/rawGhApi.mjs';

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

function verifyShaConstantTime(actualHex, expectedHex) {
  if (!/^[a-f0-9]{64}$/i.test(actualHex) || !/^[a-f0-9]{64}$/i.test(expectedHex)) {
    return false;
  }
  const bufA = Buffer.from(actualHex.toLowerCase(), 'hex');
  const bufB = Buffer.from(expectedHex.toLowerCase(), 'hex');
  if (bufA.length !== 32 || bufB.length !== 32) return false;
  return timingSafeEqual(bufA, bufB);
}

const args = process.argv.slice(2);
function getArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = args.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const outDir = path.resolve(process.cwd(), getArg('out-dir', '.artifacts/pilot'));
const packagePath = getArg('package-path', '');
const packageTar = getArg('package-tar', '');
const intakeRunId = getArg('intake-run-id', '');
const inputArtifactId = getArg('input-artifact-id', '');
const inputArtifactName = getArg('input-artifact-name', '');
const inputPackageSha256 = getArg('input-package-sha256', '');
const mode = getArg('mode', process.env.EXECUTION_MODE || 'DEMO').toUpperCase();
const expectedTenantId = getArg('tenant-id', '');
const expectedTaskId = getArg('task-id', '');

console.log('================================================================');
console.log('INGESTÃO E VALIDAÇÃO DE PACOTE EXTERNO DO PILOTO OPERACIONAL REAL');
console.log('================================================================');
console.log(`Modo de Execução:       ${mode}`);
console.log(`Pacote Fonte Local:     ${packagePath || '(não especificado)'}`);
console.log(`Arquivo Tar Fonte:      ${packageTar || '(não especificado)'}`);
console.log(`Intake Run ID:          ${intakeRunId || '(não especificado)'}`);
console.log(`Input Artifact ID:      ${inputArtifactId || '(não especificado)'}`);
console.log(`Input Package SHA-256:  ${inputPackageSha256 || '(não especificado)'}`);
console.log(`Directório de Destino:  ${outDir}`);
console.log(`Tenant ID Requerido:    ${expectedTenantId || '(não especificado)'}`);
console.log(`Task ID Requerida:      ${expectedTaskId || '(não especificado)'}`);

// Validação estrita de identificadores externos
if (intakeRunId) {
  assertStrictId(intakeRunId, 'intake_run_id');
}
if (inputArtifactId) {
  assertStrictId(inputArtifactId, 'input_artifact_id');
}
if (inputPackageSha256 && !/^[a-f0-9]{64}$/.test(inputPackageSha256)) {
  console.error(`\n[FAIL-CLOSED] input_package_sha256 inválido: '${inputPackageSha256}' (deve ter exactamente 64 hexadecimais minúsculos).`);
  process.exit(1);
}

const CANONICAL_REPO_ID = 1363667011;
const CANONICAL_REPO_NAME = 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';
const EXPECTED_REPO = (mode === 'OPERATIONAL_PILOT' || !process.env.GITHUB_REPOSITORY)
  ? CANONICAL_REPO_NAME
  : process.env.GITHUB_REPOSITORY;

let effectivePackageDir = packagePath;
let originalTarBuffer = null;

// Caso A: Arquivo compactado .tar.gz fornecido directamente via --package-tar
if (packageTar) {
  const tarResolved = path.resolve(packageTar);
  if (!fs.existsSync(tarResolved)) {
    console.error(`\n[FAIL-CLOSED] Arquivo de pacote tar '${tarResolved}' não existe.`);
    process.exit(1);
  }
  originalTarBuffer = fs.readFileSync(tarResolved);
  const calculatedTarSha = sha256(originalTarBuffer);

  if (inputPackageSha256) {
    if (!verifyShaConstantTime(calculatedTarSha, inputPackageSha256)) {
      console.error(`\n[FAIL-CLOSED] Hash SHA-256 do pacote original (${calculatedTarSha}) diverge do hash autorizado (${inputPackageSha256}).`);
      process.exit(1);
    }
    console.log(`[PASS] Hash SHA-256 do pacote original verificado em tempo constante: ${calculatedTarSha}`);
  }

  const tempExtractedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'aetf_intake_tar_'));
  try {
    auditAndExtractTar(originalTarBuffer, tempExtractedDir, {
      allowedFiles: [
        'operational-pilot-input.json',
        'authorization-document.pdf',
        'input-package.sha256',
        'package-provenance.json'
      ]
    });
  } catch (err) {
    console.error(`\n[FAIL-CLOSED] Falha na auditoria pré-extracção do pacote tar: ${err.message}`);
    process.exit(1);
  }
  effectivePackageDir = tempExtractedDir;
}

// Caso B: Transferência remota autenticada via GitHub Actions Intake
else if (!effectivePackageDir) {
  if (intakeRunId && inputArtifactId) {
    console.log('\n[TRANSFERÊNCIA EXTERNA] A transferir pacote autenticado do GitHub Actions Intake via API segura...');
    const stagingDir = path.resolve(process.cwd(), '.artifacts', 'intake_staging');
    fs.mkdirSync(stagingDir, { recursive: true });

    let artifactMeta;
    let runMeta;
    try {
      // 1. Consultar e reconciliar metadados do artefacto
      const artifactResult = fetchAndPreserveGhApi(
        `repos/${EXPECTED_REPO}/actions/artifacts/${inputArtifactId}`,
        outDir,
        'intake-artifact-api-response'
      );
      artifactMeta = artifactResult.parsed;

      if (artifactMeta.expired !== false) {
        throw new Error(`Artefacto de intake '${inputArtifactId}' está expirado ou possui campo 'expired' não estritamente falso (expired: ${artifactMeta.expired}).`);
      }
      if (typeof artifactMeta.size_in_bytes !== 'number' || !Number.isSafeInteger(artifactMeta.size_in_bytes) || artifactMeta.size_in_bytes <= 0) {
        throw new Error(`Artefacto de intake '${inputArtifactId}' possui tamanho inválido (${artifactMeta.size_in_bytes} bytes).`);
      }
      if (typeof artifactMeta.id !== 'number' || !Number.isSafeInteger(artifactMeta.id) || String(artifactMeta.id) !== inputArtifactId) {
        throw new Error(`ID do artefacto de intake divergente: esperado '${inputArtifactId}', obtido '${artifactMeta.id}'.`);
      }
      if (inputArtifactName && artifactMeta.name !== inputArtifactName) {
        throw new Error(`Nome de artefacto divergente: esperado '${inputArtifactName}', obtido '${artifactMeta.name}'.`);
      }
      if (!artifactMeta.workflow_run) {
        throw new Error(`Artefacto de intake '${inputArtifactId}' não possui workflow_run associado.`);
      }
      if (typeof artifactMeta.workflow_run.id !== 'number' || !Number.isSafeInteger(artifactMeta.workflow_run.id) || String(artifactMeta.workflow_run.id) !== intakeRunId) {
        throw new Error(`Run ID divergente: esperado '${intakeRunId}', obtido '${artifactMeta.workflow_run.id}'.`);
      }
      if (artifactMeta.workflow_run.repository_id !== CANONICAL_REPO_ID) {
        throw new Error(`Repository ID divergente no artefacto: esperado '${CANONICAL_REPO_ID}', obtido '${artifactMeta.workflow_run?.repository_id}'.`);
      }
      if (artifactMeta.workflow_run.head_repository_id !== CANONICAL_REPO_ID) {
        throw new Error(`head_repository_id divergente no artefacto: esperado '${CANONICAL_REPO_ID}', obtido '${artifactMeta.workflow_run?.head_repository_id}'.`);
      }
      if (artifactMeta.workflow_run.head_branch !== 'master') {
        throw new Error(`Branch de origem do artefacto inválida: esperado 'master', obtido '${artifactMeta.workflow_run?.head_branch}'.`);
      }

      // 2. Consultar e reconciliar metadados do workflow run
      const runResult = fetchAndPreserveGhApi(
        `repos/${EXPECTED_REPO}/actions/runs/${intakeRunId}`,
        outDir,
        'intake-run-api-response'
      );
      runMeta = runResult.parsed;

      if (typeof runMeta.id !== 'number' || !Number.isSafeInteger(runMeta.id) || String(runMeta.id) !== intakeRunId) {
        throw new Error(`Run ID divergente na resposta do intake: esperado '${intakeRunId}', obtido '${runMeta.id}'.`);
      }
      if (!runMeta.repository || runMeta.repository.id !== CANONICAL_REPO_ID) {
        throw new Error(`Repository ID divergente no run: esperado '${CANONICAL_REPO_ID}', obtido '${runMeta.repository?.id}'.`);
      }
      if (!runMeta.head_repository || runMeta.head_repository.id !== CANONICAL_REPO_ID) {
        throw new Error(`head_repository.id divergente: esperado '${CANONICAL_REPO_ID}', obtido '${runMeta.head_repository?.id}'.`);
      }
      if (runMeta.repository.id !== runMeta.head_repository.id) {
        throw new Error(`repository.id (${runMeta.repository.id}) e head_repository.id (${runMeta.head_repository.id}) não são idênticos.`);
      }
      if (runMeta.path !== '.github/workflows/operational-pilot-intake.yml') {
        throw new Error(`Workflow de origem inválido: esperado '.github/workflows/operational-pilot-intake.yml', obtido '${runMeta.path}'.`);
      }
      if (typeof runMeta.workflow_id !== 'number' || !Number.isSafeInteger(runMeta.workflow_id) || runMeta.workflow_id <= 0) {
        throw new Error(`workflow_id inválido no intake: '${runMeta.workflow_id}'.`);
      }
      if (runMeta.head_branch !== 'master') {
        throw new Error(`Branch de origem do intake inválida: esperado 'master', obtido '${runMeta.head_branch}'.`);
      }
      if (runMeta.status !== 'completed') {
        throw new Error(`Run de intake não concluído: status actual é '${runMeta.status}'.`);
      }
      if (runMeta.conclusion !== 'success') {
        throw new Error(`Run de intake não teve conclusão de sucesso: conclusion actual é '${runMeta.conclusion}'.`);
      }
      if (typeof runMeta.run_attempt !== 'number' || !Number.isSafeInteger(runMeta.run_attempt) || runMeta.run_attempt < 1) {
        throw new Error(`run_attempt inválido no run do intake: '${runMeta.run_attempt}'.`);
      }

      // Enriquecer sidecar derivado do artefacto do intake com dados validados do run (Prompt Secção 6)
      if (artifactResult?.metaFilePath && fs.existsSync(artifactResult.metaFilePath)) {
        const meta = JSON.parse(fs.readFileSync(artifactResult.metaFilePath, 'utf8'));
        meta.workflow_id = runMeta.workflow_id;
        meta.workflow_path = runMeta.path;
        meta.run_attempt = runMeta.run_attempt;
        meta.raw_artifact_response_sha256 = artifactResult.rawSha;
        meta.raw_run_response_sha256 = runResult.rawSha;
        meta.enriched_from_verified_run = true;
        fs.writeFileSync(artifactResult.metaFilePath, JSON.stringify(meta, null, 2), 'utf8');
        console.log('[PASS] Sidecar do artefacto do intake enriquecido com metadados do workflow run verificado.');
      }

      const currentCommitSha = process.env.GIT_COMMIT_SHA || process.env.GITHUB_SHA;
      if (currentCommitSha) {
        assertStrictSha(currentCommitSha, 'currentCommitSha');
        if (runMeta.head_sha !== currentCommitSha) {
          throw new Error(`head_sha divergente no intake: esperado '${currentCommitSha}', obtido '${runMeta.head_sha}'.`);
        }
        if (artifactMeta.workflow_run.head_sha !== currentCommitSha) {
          throw new Error(`head_sha do artefacto divergente no intake: esperado '${currentCommitSha}', obtido '${artifactMeta.workflow_run.head_sha}'.`);
        }
      }

      console.log(`[PASS] Resposta física bruta do run do intake preservada com SHA:       ${runResult.rawSha}`);
      console.log(`[PASS] Resposta física bruta do artefacto do intake preservada com SHA: ${artifactResult.rawSha}`);

      // 3. Descarregar o arquivo ZIP do artefacto via chamada segura
      const zipBytes = execFileSync('gh', ['api', `repos/${EXPECTED_REPO}/actions/artifacts/${inputArtifactId}/zip`], {
        maxBuffer: 50 * 1024 * 1024
      });

      // Descompactar o ZIP do artefacto do GitHub com pré-auditoria estrita
      auditAndExtractZip(zipBytes, stagingDir, {
        allowedFiles: [
          'original-package.tar.gz',
          'original-package.sha256',
          'package.tar.gz',
          'operational-pilot-input.json',
          'authorization-document.pdf',
          'package-provenance.json',
          'input-package.sha256',
          'runtime-context.json'
        ]
      });

      // 4. Localizar e verificar bytes originais de original-package.tar.gz
      const originalTarPath = path.join(stagingDir, 'original-package.tar.gz');
      if (!fs.existsSync(originalTarPath)) {
        throw new Error("Artefacto de intake não contém o arquivo 'original-package.tar.gz' com os bytes originais.");
      }

      originalTarBuffer = fs.readFileSync(originalTarPath);
      const calculatedTarSha = sha256(originalTarBuffer);

      if (!inputPackageSha256) {
        throw new Error('Hash input_package_sha256 não fornecido para validar o pacote original transferido.');
      }
      if (!verifyShaConstantTime(calculatedTarSha, inputPackageSha256)) {
        throw new Error(`Hash SHA-256 de original-package.tar.gz (${calculatedTarSha}) diverge do hash autorizado (${inputPackageSha256}).`);
      }
      console.log(`[PASS] Hash SHA-256 de original-package.tar.gz conferido em tempo constante: ${calculatedTarSha}`);

      // 5. Auditoria de segurança pré-extracção e descompressão segura
      const extractedDir = path.join(stagingDir, 'extracted');
      auditAndExtractTar(originalTarBuffer, extractedDir, {
        allowedFiles: [
          'operational-pilot-input.json',
          'authorization-document.pdf',
          'input-package.sha256',
          'package-provenance.json'
        ]
      });

      effectivePackageDir = extractedDir;
      console.log(`[PASS] Pacote externo autenticado e auditado com sucesso em: ${stagingDir}`);
    } catch (err) {
      console.error(`\n[FAIL-CLOSED] Falha ao transferir pacote externo via GitHub API: ${err.message}`);
      process.exit(1);
    }
  } else if (mode === 'OPERATIONAL_PILOT') {
    console.error('\n[FAIL-CLOSED] BLOCKED_EXTERNAL_PACKAGE_TRANSFER_NOT_CONFIGURED');
    console.error('Nenhum pacote externo local (--package-path / --package-tar) nem transferência de intake (--intake-run-id / --input-artifact-id) fornecida.');
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
  if (!requiredFiles.includes(entry) && entry !== 'original-package.tar.gz' && entry !== 'original-package.sha256') {
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
if (mode === 'OPERATIONAL_PILOT') {
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

if (mode === 'OPERATIONAL_PILOT') {
  if (parsedInput.is_fixture === true || parsedInput.classification === 'AUTOMATED_OPERATIONAL_DEMO') {
    console.error('\n[FAIL-CLOSED] Entrada marcada como fixture/demo detectada. Fixtures são estritamente proibidas no modo operacional real.');
    process.exit(1);
  }
  if (parsedInput.generated_by_repo === true || parsedInput.auto_generated === true) {
    console.error('\n[FAIL-CLOSED] Pacote gerado pelo próprio repositório ou por build automatizado rejeitado.');
    process.exit(1);
  }
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

// Se original-package.tar.gz existir, preservá-lo também
const originalTarPath = path.join(effectivePackageDir, 'original-package.tar.gz');
if (fs.existsSync(originalTarPath)) {
  fs.copyFileSync(originalTarPath, path.join(outDir, 'original-package.tar.gz'));
} else if (originalTarBuffer) {
  fs.writeFileSync(path.join(outDir, 'original-package.tar.gz'), originalTarBuffer);
}

// Se tivermos o arquivo tar original, gravar recibo com hash calculado
const finalTarPath = path.join(outDir, 'original-package.tar.gz');
if (fs.existsSync(finalTarPath)) {
  const tarHash = sha256(fs.readFileSync(finalTarPath));
  fs.writeFileSync(path.join(outDir, 'original-package.sha256'), `${tarHash}  original-package.tar.gz\n`, 'utf8');
}

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
  original_package_tar_file: fs.existsSync(finalTarPath) ? 'original-package.tar.gz' : null,
  original_package_tar_sha256: fs.existsSync(finalTarPath) ? sha256(fs.readFileSync(finalTarPath)) : null,
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

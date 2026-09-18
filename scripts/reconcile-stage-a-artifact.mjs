#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { auditAndExtractZip } from './lib/secureTarExtractor.mjs';

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

const args = process.argv.slice(2);
function getArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = args.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const stageARunId = getArg('stage-a-run-id', '');
const stageAArtifactId = getArg('stage-a-artifact-id', '');
const stageAHeadSha = getArg('stage-a-head-sha', '');
const outDirArg = getArg('out-dir', '.artifacts/pilot');
const mode = getArg('mode', process.env.EXECUTION_MODE || 'OPERATIONAL_PILOT').toUpperCase();

const CANONICAL_REPO_ID = 1363667011;
const CANONICAL_REPO_NAME = 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';
const EXPECTED_REPO = (mode === 'OPERATIONAL_PILOT' || !process.env.GITHUB_REPOSITORY)
  ? CANONICAL_REPO_NAME
  : process.env.GITHUB_REPOSITORY;

console.log('================================================================');
console.log('RECONCILIAÇÃO FÍSICA E PROVENIÊNCIA DA ETAPA A (ETAPA B)');
console.log('================================================================');
console.log(`Modo de Execução:     ${mode}`);
console.log(`Stage A Run ID:       ${stageARunId || '(não especificado)'}`);
console.log(`Stage A Artifact ID:  ${stageAArtifactId || '(não especificado)'}`);
console.log(`Stage A Head SHA:     ${stageAHeadSha || '(não especificado)'}`);
console.log(`Directório de Saída:  ${outDirArg}`);

if (!stageARunId || !/^\d+$/.test(stageARunId)) {
  console.error('\n[FAIL-CLOSED] stage_a_run_id é estritamente obrigatório e numérico.');
  process.exit(1);
}
if (!stageAArtifactId || !/^\d+$/.test(stageAArtifactId)) {
  console.error('\n[FAIL-CLOSED] stage_a_artifact_id é estritamente obrigatório e numérico.');
  process.exit(1);
}
if (!stageAHeadSha || !/^[a-f0-9]{40}$|^[a-f0-9]{64}$/.test(stageAHeadSha)) {
  console.error('\n[FAIL-CLOSED] stage_a_head_sha é estritamente obrigatório e hexadecimal (40 ou 64 caracteres).');
  process.exit(1);
}

const outDir = path.resolve(process.cwd(), outDirArg);
fs.mkdirSync(outDir, { recursive: true });

function callGhApi(endpoint) {
  const stdout = execFileSync('gh', ['api', endpoint], {
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe']
  });
  return JSON.parse(stdout);
}

try {
  console.log(`\n[1/3] A consultar metadados do artefacto da Etapa A (${stageAArtifactId})...`);
  const artifactMeta = callGhApi(`repos/${EXPECTED_REPO}/actions/artifacts/${stageAArtifactId}`);

  if (artifactMeta.expired) {
    throw new Error(`Artefacto da Etapa A '${stageAArtifactId}' está expirado (expired: true).`);
  }
  if (!artifactMeta.size_in_bytes || artifactMeta.size_in_bytes <= 0) {
    throw new Error(`Artefacto da Etapa A '${stageAArtifactId}' possui tamanho inválido (${artifactMeta.size_in_bytes} bytes).`);
  }
  const expectedArtifactName = `aetf-pilot-stage-a-${stageAHeadSha}`;
  if (artifactMeta.name !== expectedArtifactName) {
    throw new Error(`Nome do artefacto divergente: esperado '${expectedArtifactName}', obtido '${artifactMeta.name}'.`);
  }
  if (!artifactMeta.workflow_run) {
    throw new Error(`Artefacto '${stageAArtifactId}' não possui workflow_run associado.`);
  }
  if (artifactMeta.workflow_run.id !== Number(stageARunId)) {
    throw new Error(`workflow_run.id do artefacto (${artifactMeta.workflow_run.id}) diverge do stage_a_run_id (${stageARunId}).`);
  }
  if (!artifactMeta.workflow_run.repository_id || Number(artifactMeta.workflow_run.repository_id) !== CANONICAL_REPO_ID) {
    throw new Error(`Repository ID divergente no artefacto: esperado '${CANONICAL_REPO_ID}', obtido '${artifactMeta.workflow_run?.repository_id}'.`);
  }
  if (!artifactMeta.workflow_run.head_repository_id || Number(artifactMeta.workflow_run.head_repository_id) !== CANONICAL_REPO_ID) {
    throw new Error(`head_repository_id divergente no artefacto: esperado '${CANONICAL_REPO_ID}', obtido '${artifactMeta.workflow_run?.head_repository_id}'.`);
  }

  console.log(`\n[2/3] A consultar metadados do workflow run da Etapa A (${stageARunId})...`);
  const runMeta = callGhApi(`repos/${EXPECTED_REPO}/actions/runs/${stageARunId}`);

  if (!runMeta.repository || Number(runMeta.repository.id) !== CANONICAL_REPO_ID) {
    throw new Error(`Repository ID divergente no run da Etapa A: esperado '${CANONICAL_REPO_ID}', obtido '${runMeta.repository?.id}'.`);
  }
  if (!runMeta.head_repository || Number(runMeta.head_repository.id) !== CANONICAL_REPO_ID) {
    throw new Error(`head_repository.id divergente no run da Etapa A: esperado '${CANONICAL_REPO_ID}', obtido '${runMeta.head_repository?.id}'.`);
  }
  if (Number(runMeta.repository.id) !== Number(runMeta.head_repository.id)) {
    throw new Error(`repository.id (${runMeta.repository.id}) e head_repository.id (${runMeta.head_repository.id}) não são idênticos no run da Etapa A.`);
  }
  if (!runMeta.path || !runMeta.path.endsWith('operational-pilot-stage-a.yml')) {
    throw new Error(`Workflow de origem inválido: esperado '.github/workflows/operational-pilot-stage-a.yml', obtido '${runMeta.path}'.`);
  }
  if (runMeta.head_branch !== 'master') {
    throw new Error(`Branch de origem da Etapa A inválida: esperado 'master', obtido '${runMeta.head_branch}'.`);
  }
  if (runMeta.head_sha !== stageAHeadSha) {
    throw new Error(`head_sha divergente na Etapa A: esperado '${stageAHeadSha}', obtido '${runMeta.head_sha}'.`);
  }
  if (runMeta.status !== 'completed') {
    throw new Error(`Run da Etapa A não concluído: status actual é '${runMeta.status}'.`);
  }
  if (runMeta.conclusion !== 'success') {
    throw new Error(`Run da Etapa A não teve conclusão com sucesso: conclusion actual é '${runMeta.conclusion}'.`);
  }
  if (!runMeta.run_attempt || runMeta.run_attempt < 1) {
    throw new Error(`run_attempt inválido no run da Etapa A: '${runMeta.run_attempt}'.`);
  }

  // Gravar respostas físicas da API
  const runApiFile = path.join(outDir, 'stage-a-run-api-response.json');
  fs.writeFileSync(runApiFile, JSON.stringify({
    query_url: `https://api.github.com/repos/${EXPECTED_REPO}/actions/runs/${stageARunId}`,
    retrieved_at: new Date().toISOString(),
    status: 200,
    response: runMeta
  }, null, 2), 'utf8');

  const artifactApiFile = path.join(outDir, 'stage-a-artifact-api-response.json');
  fs.writeFileSync(artifactApiFile, JSON.stringify({
    query_url: `https://api.github.com/repos/${EXPECTED_REPO}/actions/artifacts/${stageAArtifactId}`,
    retrieved_at: new Date().toISOString(),
    status: 200,
    response: artifactMeta
  }, null, 2), 'utf8');

  console.log(`[PASS] Resposta do run gravada em:       ${runApiFile}`);
  console.log(`[PASS] Resposta do artefacto gravada em: ${artifactApiFile}`);

  console.log(`\n[3/3] A descarregar e extrair com segurança o ZIP da Etapa A...`);
  const zipBytes = execFileSync('gh', ['api', `repos/${EXPECTED_REPO}/actions/artifacts/${stageAArtifactId}/zip`], {
    maxBuffer: 50 * 1024 * 1024
  });

  const extracted = auditAndExtractZip(zipBytes, outDir);
  console.log(`[PASS] ${extracted.length} ficheiros auditados e extraídos com sucesso para: ${outDir}`);
  console.log('\n================================================================');
  console.log('RECONCILIAÇÃO FÍSICA DA ETAPA A CONCLUÍDA COM SUCESSO');
  console.log('================================================================\n');
  process.exit(0);
} catch (err) {
  console.error(`\n[FAIL-CLOSED] Falha ao reconciliar e descarregar artefacto da Etapa A: ${err.message}`);
  process.exit(1);
}
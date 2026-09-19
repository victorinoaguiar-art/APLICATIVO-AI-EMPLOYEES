#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { auditAndExtractZip } from './lib/secureTarExtractor.mjs';
import {
  assertStrictSha,
  assertStrictId,
  fetchAndPreserveGhApi
} from './lib/rawGhApi.mjs';

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

assertStrictId(stageARunId, 'stage_a_run_id');
assertStrictId(stageAArtifactId, 'stage_a_artifact_id');
assertStrictSha(stageAHeadSha, 'stage_a_head_sha');

const outDir = path.resolve(process.cwd(), outDirArg);
fs.mkdirSync(outDir, { recursive: true });

try {
  console.log(`\n[1/3] A consultar metadados do artefacto da Etapa A (${stageAArtifactId})...`);
  const artifactResult = fetchAndPreserveGhApi(
    `repos/${EXPECTED_REPO}/actions/artifacts/${stageAArtifactId}`,
    outDir,
    'stage-a-artifact-api-response'
  );
  const artifactMeta = artifactResult.parsed;

  if (artifactMeta.expired !== false) {
    throw new Error(`Artefacto da Etapa A '${stageAArtifactId}' está expirado ou possui campo 'expired' não estritamente falso (expired: ${artifactMeta.expired}).`);
  }
  if (typeof artifactMeta.size_in_bytes !== 'number' || !Number.isSafeInteger(artifactMeta.size_in_bytes) || artifactMeta.size_in_bytes <= 0) {
    throw new Error(`Artefacto da Etapa A '${stageAArtifactId}' possui tamanho inválido (${artifactMeta.size_in_bytes} bytes).`);
  }
  if (typeof artifactMeta.id !== 'number' || !Number.isSafeInteger(artifactMeta.id) || String(artifactMeta.id) !== stageAArtifactId) {
    throw new Error(`ID do artefacto divergente: esperado '${stageAArtifactId}', obtido '${artifactMeta.id}'.`);
  }
  const expectedArtifactName = `aetf-pilot-stage-a-${stageAHeadSha}`;
  if (artifactMeta.name !== expectedArtifactName) {
    throw new Error(`Nome do artefacto divergente: esperado '${expectedArtifactName}', obtido '${artifactMeta.name}'.`);
  }
  if (!artifactMeta.workflow_run) {
    throw new Error(`Artefacto '${stageAArtifactId}' não possui workflow_run associado.`);
  }
  if (typeof artifactMeta.workflow_run.id !== 'number' || !Number.isSafeInteger(artifactMeta.workflow_run.id) || String(artifactMeta.workflow_run.id) !== stageARunId) {
    throw new Error(`workflow_run.id do artefacto (${artifactMeta.workflow_run.id}) diverge do stage_a_run_id (${stageARunId}).`);
  }
  if (artifactMeta.workflow_run.repository_id !== CANONICAL_REPO_ID) {
    throw new Error(`Repository ID divergente no artefacto: esperado '${CANONICAL_REPO_ID}', obtido '${artifactMeta.workflow_run?.repository_id}'.`);
  }
  if (artifactMeta.workflow_run.head_repository_id !== CANONICAL_REPO_ID) {
    throw new Error(`head_repository_id divergente no artefacto: esperado '${CANONICAL_REPO_ID}', obtido '${artifactMeta.workflow_run?.head_repository_id}'.`);
  }
  if (artifactMeta.workflow_run.head_branch !== 'master') {
    throw new Error(`Branch do artefacto divergente: esperado 'master', obtido '${artifactMeta.workflow_run?.head_branch}'.`);
  }
  if (artifactMeta.workflow_run.head_sha !== stageAHeadSha) {
    throw new Error(`head_sha do artefacto divergente: esperado '${stageAHeadSha}', obtido '${artifactMeta.workflow_run?.head_sha}'.`);
  }

  console.log(`\n[2/3] A consultar metadados do workflow run da Etapa A (${stageARunId})...`);
  const runResult = fetchAndPreserveGhApi(
    `repos/${EXPECTED_REPO}/actions/runs/${stageARunId}`,
    outDir,
    'stage-a-run-api-response'
  );
  const runMeta = runResult.parsed;

  if (typeof runMeta.id !== 'number' || !Number.isSafeInteger(runMeta.id) || String(runMeta.id) !== stageARunId) {
    throw new Error(`Run ID divergente na resposta da API: esperado '${stageARunId}', obtido '${runMeta.id}'.`);
  }
  if (!runMeta.repository || runMeta.repository.id !== CANONICAL_REPO_ID) {
    throw new Error(`Repository ID divergente no run da Etapa A: esperado '${CANONICAL_REPO_ID}', obtido '${runMeta.repository?.id}'.`);
  }
  if (!runMeta.head_repository || runMeta.head_repository.id !== CANONICAL_REPO_ID) {
    throw new Error(`head_repository.id divergente no run da Etapa A: esperado '${CANONICAL_REPO_ID}', obtido '${runMeta.head_repository?.id}'.`);
  }
  if (runMeta.repository.id !== runMeta.head_repository.id) {
    throw new Error(`repository.id (${runMeta.repository.id}) e head_repository.id (${runMeta.head_repository.id}) não são idênticos no run da Etapa A.`);
  }
  if (runMeta.path !== '.github/workflows/operational-pilot-stage-a.yml') {
    throw new Error(`Workflow de origem inválido: esperado '.github/workflows/operational-pilot-stage-a.yml', obtido '${runMeta.path}'.`);
  }
  if (typeof runMeta.workflow_id !== 'number' || !Number.isSafeInteger(runMeta.workflow_id) || runMeta.workflow_id <= 0) {
    throw new Error(`workflow_id inválido no run da Etapa A: '${runMeta.workflow_id}'.`);
  }
  if (runMeta.head_branch !== 'master') {
    throw new Error(`Branch de origem da Etapa A inválida: esperado 'master', obtido '${runMeta.head_branch}'.`);
  }
  if (runMeta.head_sha !== stageAHeadSha) {
    throw new Error(`head_sha divergente na Etapa A: esperado '${stageAHeadSha}', obtido '${runMeta.head_sha}'.`);
  }
  const currentWorkflowSha = process.env.GITHUB_SHA;
  if (currentWorkflowSha) {
    assertStrictSha(currentWorkflowSha, 'GITHUB_SHA');
    if (stageAHeadSha !== currentWorkflowSha) {
      throw new Error(`Divergência de SHA de segurança: o SHA auditado do workflow (${currentWorkflowSha}) difere do stage_a_head_sha fornecido (${stageAHeadSha}). Execuções entre SHAs diferentes são categoricamente bloqueadas.`);
    }
  }

  // Enriquecer sidecar derivado do artefacto com dados validados do run (Prompt Secção 6)
  if (artifactResult?.metaFilePath && fs.existsSync(artifactResult.metaFilePath)) {
    const meta = JSON.parse(fs.readFileSync(artifactResult.metaFilePath, 'utf8'));
    meta.workflow_id = runMeta.workflow_id;
    meta.workflow_path = runMeta.path;
    meta.run_attempt = runMeta.run_attempt;
    meta.raw_artifact_response_sha256 = artifactResult.rawSha;
    meta.raw_run_response_sha256 = runResult.rawSha;
    meta.enriched_from_verified_run = true;
    fs.writeFileSync(artifactResult.metaFilePath, JSON.stringify(meta, null, 2), 'utf8');
    console.log('[PASS] Sidecar do artefacto da Etapa A enriquecido com metadados do workflow run verificado.');
  }
  if (runMeta.status !== 'completed') {
    throw new Error(`Run da Etapa A não concluído: status actual é '${runMeta.status}'.`);
  }
  if (runMeta.conclusion !== 'success') {
    throw new Error(`Run da Etapa A não teve conclusão com sucesso: conclusion actual é '${runMeta.conclusion}'.`);
  }
  if (typeof runMeta.run_attempt !== 'number' || !Number.isSafeInteger(runMeta.run_attempt) || runMeta.run_attempt < 1) {
    throw new Error(`run_attempt inválido no run da Etapa A: '${runMeta.run_attempt}' (deve ser inteiro seguro >= 1).`);
  }

  console.log(`[PASS] Resposta física bruta do run preservada com SHA:       ${runResult.rawSha}`);
  console.log(`[PASS] Resposta física bruta do artefacto preservada com SHA: ${artifactResult.rawSha}`);

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
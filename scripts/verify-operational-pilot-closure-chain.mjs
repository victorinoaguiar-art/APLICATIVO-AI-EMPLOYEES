#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  CANONICAL_REPO_ID,
  CANONICAL_REPO_NAME,
  assertStrictSha,
  assertStrictId,
  fetchAndPreserveGhApi,
  sha256
} from './lib/rawGhApi.mjs';
import { auditAndExtractZip } from './lib/secureTarExtractor.mjs';

/**
 * Seleção Estrita de Artefacto sem Fallbacks (Subprompt 1 — Correção A)
 * Exige exactamente 1 correspondência exata de nome e validação estrutural completa.
 */
export function selectExactArtifact(artifactsList, expectedArtifactName, expectedRunId = null) {
  if (!artifactsList || !Array.isArray(artifactsList)) {
    throw new Error(`[FAIL-CLOSED] Lista de artefactos inválida ou ausente.`);
  }

  const matches = artifactsList.filter(artifact => artifact && artifact.name === expectedArtifactName);

  if (matches.length === 0) {
    throw new Error(`[FAIL-CLOSED] Pacote obrigatório '${expectedArtifactName}' não encontrado (0 correspondências). Fallback terminantemente proibido.`);
  }

  if (matches.length > 1) {
    throw new Error(`[FAIL-CLOSED] Ambiguidade: encontrados ${matches.length} artefactos com o nome canónico '${expectedArtifactName}'.`);
  }

  const art = matches[0];

  if (art.expired !== false) {
    throw new Error(`[FAIL-CLOSED] Artefacto '${expectedArtifactName}' (ID ${art.id}) está expirado (expired: ${art.expired}).`);
  }

  if (typeof art.size_in_bytes !== 'number' || !Number.isSafeInteger(art.size_in_bytes) || art.size_in_bytes <= 0) {
    throw new Error(`[FAIL-CLOSED] Artefacto '${expectedArtifactName}' (ID ${art.id}) possui tamanho inválido (${art.size_in_bytes} bytes).`);
  }

  if (typeof art.id !== 'number' || !Number.isSafeInteger(art.id) || art.id <= 0) {
    throw new Error(`[FAIL-CLOSED] Artefacto '${expectedArtifactName}' possui ID numérico inválido (${art.id}).`);
  }

  if (!art.workflow_run || typeof art.workflow_run.id !== 'number' || !Number.isSafeInteger(art.workflow_run.id) || art.workflow_run.id <= 0) {
    throw new Error(`[FAIL-CLOSED] Artefacto '${expectedArtifactName}' não possui 'workflow_run.id' válido.`);
  }

  if (expectedRunId !== undefined && expectedRunId !== null && expectedRunId !== '') {
    const expectedNum = Number(expectedRunId);
    if (art.workflow_run.id !== expectedNum) {
      throw new Error(`[FAIL-CLOSED] Vínculo inválido: 'workflow_run.id' do artefacto (${art.workflow_run.id}) não corresponde ao run esperado (${expectedNum}).`);
    }
  }

  return art;
}

/**
 * Validação de Metadados de Artefacto obtidos em Endpoint Individual
 */
export function validateArtifactMetadata(artifact, expectedName, expectedRunId = null, expectedSha = null) {
  if (!artifact || typeof artifact !== 'object') {
    throw new Error(`[FAIL-CLOSED] Metadados de artefacto inválidos ou ausentes.`);
  }
  if (typeof artifact.id !== 'number' || !Number.isSafeInteger(artifact.id) || artifact.id <= 0) {
    throw new Error(`[FAIL-CLOSED] ID do artefacto numérico inválido (${artifact.id}).`);
  }
  if (expectedName && artifact.name !== expectedName) {
    throw new Error(`[FAIL-CLOSED] Nome do artefacto divergente: esperado '${expectedName}', obtido '${artifact.name}'.`);
  }
  if (artifact.expired !== false) {
    throw new Error(`[FAIL-CLOSED] Artefacto '${artifact.name}' (ID ${artifact.id}) está expirado.`);
  }
  if (typeof artifact.size_in_bytes !== 'number' || !Number.isSafeInteger(artifact.size_in_bytes) || artifact.size_in_bytes <= 0) {
    throw new Error(`[FAIL-CLOSED] Artefacto '${artifact.name}' (ID ${artifact.id}) possui tamanho inválido (${artifact.size_in_bytes} bytes).`);
  }
  if (!artifact.workflow_run || typeof artifact.workflow_run.id !== 'number' || !Number.isSafeInteger(artifact.workflow_run.id) || artifact.workflow_run.id <= 0) {
    throw new Error(`[FAIL-CLOSED] Artefacto '${artifact.name}' não possui 'workflow_run.id' válido.`);
  }
  if (expectedRunId !== undefined && expectedRunId !== null && expectedRunId !== '') {
    if (artifact.workflow_run.id !== Number(expectedRunId)) {
      throw new Error(`[FAIL-CLOSED] workflow_run.id do artefacto (${artifact.workflow_run.id}) diverge do run esperado (${expectedRunId}).`);
    }
  }

  // Validação estrita e inegociável de workflow_run.head_sha
  if (!artifact.workflow_run.head_sha || !/^[a-f0-9]{40}$/.test(artifact.workflow_run.head_sha)) {
    throw new Error(`[FAIL-CLOSED] 'workflow_run.head_sha' ausente ou malformado no artefacto '${artifact.name}'.`);
  }
  if (expectedSha !== null && expectedSha !== undefined && expectedSha !== '') {
    assertStrictSha(expectedSha, 'expectedSha');
    if (artifact.workflow_run.head_sha !== expectedSha) {
      throw new Error(`[FAIL-CLOSED] head_sha do artefacto (${artifact.workflow_run.head_sha}) diverge do SHA esperado (${expectedSha}).`);
    }
  }

  return true;
}

/**
 * Validação de Metadados de Workflow Run obtidos em Endpoint Individual
 */
export function validateRunMetadata(run, expectedRunId, expectedWorkflowPath = null, expectedSha = null) {
  if (!run || typeof run !== 'object') {
    throw new Error(`[FAIL-CLOSED] Metadados de workflow run inválidos ou ausentes.`);
  }
  if (typeof run.id !== 'number' || !Number.isSafeInteger(run.id) || run.id <= 0) {
    throw new Error(`[FAIL-CLOSED] Run possui ID numérico inválido (${run.id}).`);
  }
  if (expectedRunId !== undefined && expectedRunId !== null && expectedRunId !== '') {
    if (run.id !== Number(expectedRunId)) {
      throw new Error(`[FAIL-CLOSED] ID do run consultado (${run.id}) difere do run esperado (${expectedRunId}).`);
    }
  }
  if (expectedWorkflowPath && run.path !== expectedWorkflowPath) {
    throw new Error(`[FAIL-CLOSED] Workflow de origem inválido: esperado '${expectedWorkflowPath}', obtido '${run.path}'.`);
  }
  if (expectedSha) {
    assertStrictSha(expectedSha, 'expectedSha');
    if (run.head_sha !== expectedSha) {
      throw new Error(`[FAIL-CLOSED] Commit SHA divergente no run ${run.id}: esperado '${expectedSha}', obtido '${run.head_sha}'.`);
    }
  }

  // Validação estrita e inegociável de head_branch: deve ser exatamente 'master'
  if (!run.head_branch || run.head_branch !== 'master') {
    throw new Error(`[FAIL-CLOSED] Branch de origem inválida ou ausente no run ${run.id}: esperado 'master', obtido '${run.head_branch}'.`);
  }

  if (run.status !== 'completed') {
    throw new Error(`[FAIL-CLOSED] Run ${run.id} não concluído (status: '${run.status}').`);
  }
  if (run.conclusion !== 'success') {
    throw new Error(`[FAIL-CLOSED] Run ${run.id} não teve sucesso (conclusion: '${run.conclusion}').`);
  }
  return true;
}

/**
 * Reconciliação Estrita entre Resposta Agregada e Endpoint Individual de Artefacto
 */
export function reconcileArtifactResponses(aggregatedArtifact, individualArtifact) {
  if (!aggregatedArtifact || typeof aggregatedArtifact !== 'object') {
    throw new Error(`[FAIL-CLOSED] Resposta agregada de artefacto inválida ou ausente.`);
  }
  if (!individualArtifact || typeof individualArtifact !== 'object') {
    throw new Error(`[FAIL-CLOSED] Resposta individual de artefacto inválida ou ausente.`);
  }
  if (aggregatedArtifact.id !== individualArtifact.id) {
    throw new Error(`[FAIL-CLOSED] Inconsistência de ID entre resposta agregada (${aggregatedArtifact.id}) e endpoint individual (${individualArtifact.id}).`);
  }
  if (aggregatedArtifact.name !== individualArtifact.name) {
    throw new Error(`[FAIL-CLOSED] Inconsistência de nome entre resposta agregada ('${aggregatedArtifact.name}') e endpoint individual ('${individualArtifact.name}').`);
  }
  if (aggregatedArtifact.size_in_bytes !== individualArtifact.size_in_bytes) {
    throw new Error(`[FAIL-CLOSED] Inconsistência de tamanho entre resposta agregada (${aggregatedArtifact.size_in_bytes}) e endpoint individual (${individualArtifact.size_in_bytes}).`);
  }
  if (aggregatedArtifact.expired !== individualArtifact.expired) {
    throw new Error(`[FAIL-CLOSED] Inconsistência de expiração entre resposta agregada (${aggregatedArtifact.expired}) e endpoint individual (${individualArtifact.expired}).`);
  }
  return true;
}

/**
 * Localiza e carrega o mapa de integridade a partir do índice SHA-256 do pacote
 */
export function loadPackageIndexMap(extractDir) {
  const possibleIndexNames = [
    'pilot-evidence-files.sha256',
    'chain-evidence-files.sha256',
    'stage-a-evidence-files.sha256',
    'stage-b-evidence-files.sha256',
    'intake-evidence-files.sha256'
  ];

  let foundIndexPath = null;
  for (const name of possibleIndexNames) {
    const directPath = path.join(extractDir, name);
    const evidencePath = path.join(extractDir, 'evidence', name);
    if (fs.existsSync(directPath)) {
      foundIndexPath = directPath;
      break;
    }
    if (fs.existsSync(evidencePath)) {
      foundIndexPath = evidencePath;
      break;
    }
  }

  if (!foundIndexPath) {
    throw new Error(`[FAIL-CLOSED] Índice de hashes ausente no pacote em '${extractDir}'.`);
  }

  const lines = fs.readFileSync(foundIndexPath, 'utf8').split('\n');
  const indexMap = new Map();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 2) {
      const expectedHash = parts[0].toLowerCase();
      const rawFile = parts.slice(1).join(' ');
      const normalized = rawFile.replace(/^[./\\]+/, '').split(/[/\\]/).join(path.sep);
      indexMap.set(normalized, expectedHash);
      indexMap.set(path.basename(normalized), expectedHash);
    }
  }

  return { foundIndexPath, indexMap };
}

/**
 * Valida um ficheiro físico contra o índice SHA-256 do pacote
 */
export function verifyFileAgainstPackageIndex(extractDir, fullFilePath, indexMap) {
  if (!fs.existsSync(fullFilePath)) {
    throw new Error(`[FAIL-CLOSED] Ficheiro '${fullFilePath}' não existe.`);
  }

  const relativeToExtract = path.relative(extractDir, fullFilePath);
  const normalizedRel = relativeToExtract.replace(/^[./\\]+/, '').split(/[/\\]/).join(path.sep);
  const baseName = path.basename(fullFilePath);

  const expectedHash = indexMap.get(normalizedRel) || indexMap.get(baseName);
  if (!expectedHash) {
    throw new Error(`[FAIL-CLOSED] Fonte de linkage '${normalizedRel}' presente mas não indexada no manifesto de hashes.`);
  }

  const fileBytes = fs.readFileSync(fullFilePath);
  const actualHash = sha256(fileBytes).toLowerCase();

  if (actualHash !== expectedHash.toLowerCase()) {
    throw new Error(`[FAIL-CLOSED] Hash físico da fonte de linkage '${normalizedRel}' (${actualHash}) diverge do registado no índice (${expectedHash}).`);
  }

  return { normalizedRel, actualHash };
}

/**
 * Descoberta da Etapa A a partir da evidência física da Etapa B com validação de índice e consenso
 */
export function extractConsumedStageAIdentifiers(stageBExtractDir) {
  const { indexMap } = loadPackageIndexMap(stageBExtractDir);

  const candidateRelativePaths = [
    'consumed-stage-a.json',
    path.join('evidence', 'consumed-stage-a.json'),
    'stage-a-linkage.json',
    path.join('evidence', 'stage-a-linkage.json'),
    'stage-a-artifact-api-response.json',
    path.join('evidence', 'stage-a-artifact-api-response.json'),
    'stage-a-run-api-response.json',
    path.join('evidence', 'stage-a-run-api-response.json')
  ];

  const candidateFullPaths = candidateRelativePaths
    .map(rel => path.join(stageBExtractDir, rel))
    .filter(fullP => fs.existsSync(fullP));

  if (candidateFullPaths.length === 0) {
    throw new Error('[FAIL-CLOSED] stage_a_run_id ou stage_a_artifact_id ausente na evidência consumida pela Etapa B.');
  }

  const verifiedSources = [];
  const runIds = [];
  const artifactIds = [];
  const headShas = [];

  for (const fullP of candidateFullPaths) {
    // 1. Validar integridade física da fonte contra o índice de hashes
    const { normalizedRel } = verifyFileAgainstPackageIndex(stageBExtractDir, fullP, indexMap);

    // 2. Parse estrito de JSON (falha imediata em JSON corrompido)
    let data;
    try {
      data = JSON.parse(fs.readFileSync(fullP, 'utf8'));
    } catch (parseErr) {
      throw new Error(`[FAIL-CLOSED] Fonte de linkage '${normalizedRel}' contém JSON inválido: ${parseErr.message}`);
    }

    let rId = null;
    let aId = null;
    let sSha = null;

    if (data.stage_a_run_id) rId = Number(data.stage_a_run_id);
    if (data.stage_a_artifact_id) aId = Number(data.stage_a_artifact_id);
    if (data.stage_a_head_sha) sSha = String(data.stage_a_head_sha);

    if (data.workflow_run && typeof data.workflow_run.id === 'number') {
      rId = Number(data.workflow_run.id);
      if (data.workflow_run.head_sha) sSha = String(data.workflow_run.head_sha);
      if (typeof data.id === 'number') {
        aId = Number(data.id);
      }
    }

    if (data.path && data.path.includes('stage-a') && typeof data.id === 'number') {
      rId = Number(data.id);
      if (data.head_sha) sSha = String(data.head_sha);
    } else if (typeof data.id === 'number' && !data.path && (normalizedRel.includes('artifact') || (data.name && data.name.includes('stage-a')))) {
      aId = Number(data.id);
    }

    if (rId !== null) runIds.push({ value: rId, file: normalizedRel });
    if (aId !== null) artifactIds.push({ value: aId, file: normalizedRel });
    if (sSha !== null) headShas.push({ value: sSha, file: normalizedRel });

    verifiedSources.push(normalizedRel);
  }

  // 3. Regra de Consenso Estrito: Rejeitar qualquer contradição
  if (runIds.length === 0) {
    throw new Error('[FAIL-CLOSED] stage_a_run_id ausente na evidência consumida pela Etapa B.');
  }
  const uniqueRunIds = Array.from(new Set(runIds.map(x => x.value)));
  if (uniqueRunIds.length > 1) {
    const details = runIds.map(x => `${x.file}=${x.value}`).join(', ');
    throw new Error(`[FAIL-CLOSED] Contradição entre fontes de evidência para stage_a_run_id: ${details}`);
  }

  if (artifactIds.length === 0) {
    throw new Error('[FAIL-CLOSED] stage_a_artifact_id ausente na evidência consumida pela Etapa B.');
  }
  const uniqueArtifactIds = Array.from(new Set(artifactIds.map(x => x.value)));
  if (uniqueArtifactIds.length > 1) {
    const details = artifactIds.map(x => `${x.file}=${x.value}`).join(', ');
    throw new Error(`[FAIL-CLOSED] Contradição entre fontes de evidência para stage_a_artifact_id: ${details}`);
  }

  if (headShas.length > 0) {
    const uniqueHeadShas = Array.from(new Set(headShas.map(x => x.value)));
    if (uniqueHeadShas.length > 1) {
      const details = headShas.map(x => `${x.file}=${x.value}`).join(', ');
      throw new Error(`[FAIL-CLOSED] Contradição entre fontes de evidência para stage_a_head_sha: ${details}`);
    }
  }

  return {
    stage_a_run_id: uniqueRunIds[0],
    stage_a_artifact_id: uniqueArtifactIds[0],
    stage_a_head_sha: headShas.length > 0 ? headShas[0].value : null,
    linkage_sources: verifiedSources,
    linkage_source_hashes_verified: true,
    linkage_consensus_verified: true
  };
}

/**
 * Descoberta do Intake a partir da evidência física da Etapa A com validação de índice e consenso
 */
export function extractConsumedIntakeIdentifiers(stageAExtractDir) {
  const { indexMap } = loadPackageIndexMap(stageAExtractDir);

  const candidateRelativePaths = [
    'consumed-intake.json',
    path.join('evidence', 'consumed-intake.json'),
    'intake-linkage.json',
    path.join('evidence', 'intake-linkage.json'),
    'intake-artifact-api-response.json',
    path.join('evidence', 'intake-artifact-api-response.json'),
    'intake-run-api-response.json',
    path.join('evidence', 'intake-run-api-response.json')
  ];

  const candidateFullPaths = candidateRelativePaths
    .map(rel => path.join(stageAExtractDir, rel))
    .filter(fullP => fs.existsSync(fullP));

  if (candidateFullPaths.length === 0) {
    throw new Error('[FAIL-CLOSED] intake_run_id ou intake_artifact_id ausente na evidência consumida pela Etapa A.');
  }

  const verifiedSources = [];
  const runIds = [];
  const artifactIds = [];
  const headShas = [];

  for (const fullP of candidateFullPaths) {
    // 1. Validar integridade física contra o índice de hashes
    const { normalizedRel } = verifyFileAgainstPackageIndex(stageAExtractDir, fullP, indexMap);

    // 2. Parse estrito de JSON
    let data;
    try {
      data = JSON.parse(fs.readFileSync(fullP, 'utf8'));
    } catch (parseErr) {
      throw new Error(`[FAIL-CLOSED] Fonte de linkage '${normalizedRel}' contém JSON inválido: ${parseErr.message}`);
    }

    let rId = null;
    let aId = null;
    let sSha = null;

    if (data.intake_run_id) rId = Number(data.intake_run_id);
    if (data.input_artifact_id) aId = Number(data.input_artifact_id);
    if (data.intake_artifact_id) aId = Number(data.intake_artifact_id);
    if (data.intake_head_sha) sSha = String(data.intake_head_sha);

    if (data.workflow_run && typeof data.workflow_run.id === 'number') {
      rId = Number(data.workflow_run.id);
      if (data.workflow_run.head_sha) sSha = String(data.workflow_run.head_sha);
      if (typeof data.id === 'number') {
        aId = Number(data.id);
      }
    }

    if (data.path && data.path.includes('intake') && typeof data.id === 'number') {
      rId = Number(data.id);
      if (data.head_sha) sSha = String(data.head_sha);
    } else if (typeof data.id === 'number' && !data.path && (normalizedRel.includes('artifact') || (data.name && data.name.includes('intake')))) {
      aId = Number(data.id);
    }

    if (rId !== null) runIds.push({ value: rId, file: normalizedRel });
    if (aId !== null) artifactIds.push({ value: aId, file: normalizedRel });
    if (sSha !== null) headShas.push({ value: sSha, file: normalizedRel });

    verifiedSources.push(normalizedRel);
  }

  // 3. Regra de Consenso Estrito: Rejeitar qualquer contradição
  if (runIds.length === 0) {
    throw new Error('[FAIL-CLOSED] intake_run_id ausente na evidência consumida pela Etapa A.');
  }
  const uniqueRunIds = Array.from(new Set(runIds.map(x => x.value)));
  if (uniqueRunIds.length > 1) {
    const details = runIds.map(x => `${x.file}=${x.value}`).join(', ');
    throw new Error(`[FAIL-CLOSED] Contradição entre fontes de evidência para intake_run_id: ${details}`);
  }

  if (artifactIds.length === 0) {
    throw new Error('[FAIL-CLOSED] intake_artifact_id ausente na evidência consumida pela Etapa A.');
  }
  const uniqueArtifactIds = Array.from(new Set(artifactIds.map(x => x.value)));
  if (uniqueArtifactIds.length > 1) {
    const details = artifactIds.map(x => `${x.file}=${x.value}`).join(', ');
    throw new Error(`[FAIL-CLOSED] Contradição entre fontes de evidência para intake_artifact_id: ${details}`);
  }

  if (headShas.length > 0) {
    const uniqueHeadShas = Array.from(new Set(headShas.map(x => x.value)));
    if (uniqueHeadShas.length > 1) {
      const details = headShas.map(x => `${x.file}=${x.value}`).join(', ');
      throw new Error(`[FAIL-CLOSED] Contradição entre fontes de evidência para intake_head_sha: ${details}`);
    }
  }

  return {
    intake_run_id: uniqueRunIds[0],
    intake_artifact_id: uniqueArtifactIds[0],
    intake_head_sha: headShas.length > 0 ? headShas[0].value : null,
    linkage_sources: verifiedSources,
    linkage_source_hashes_verified: true,
    linkage_consensus_verified: true
  };
}

/**
 * Consulta a endpoint individual da API do GitHub e preserva bytes brutos com sidecar .sha256
 */
function fetchIndividualApi(endpoint, targetDir, baseFilename, mockDir = '') {
  fs.mkdirSync(targetDir, { recursive: true });

  if (mockDir) {
    const mockFile = path.join(mockDir, `${baseFilename}.json`);
    if (!fs.existsSync(mockFile)) {
      throw new Error(`[FAIL-CLOSED] Endpoint individual '${endpoint}' indisponível no directório mock: '${mockFile}'.`);
    }
    const rawBytes = fs.readFileSync(mockFile);
    const rawFilePath = path.join(targetDir, `${baseFilename}.json`);
    const rawShaPath = path.join(targetDir, `${baseFilename}.json.sha256`);
    const h = sha256(rawBytes);
    fs.writeFileSync(rawFilePath, rawBytes);
    fs.writeFileSync(rawShaPath, `${h}  ${baseFilename}.json\n`, 'utf8');
    return { parsed: JSON.parse(rawBytes.toString('utf8')), rawBytes, rawSha: h };
  }

  return fetchAndPreserveGhApi(endpoint, targetDir, baseFilename);
}

/**
 * Consulta lista agregada de artefactos de um run
 */
function fetchArtifactsList(runId, targetDir, mockDir = '', expectedArtifactName = '') {
  fs.mkdirSync(targetDir, { recursive: true });
  let rawBytes;

  if (mockDir) {
    const specificMock = path.join(mockDir, `${expectedArtifactName}-list.json`);
    const runMock = path.join(mockDir, `run-${runId}-artifacts-list.json`);
    const stageBMock = path.join(mockDir, 'stage-b-artifacts-list.json');
    const stageAMock = path.join(mockDir, 'stage-a-artifacts-list.json');
    const intakeMock = path.join(mockDir, 'intake-artifacts-list.json');
    const fallbackMock = path.join(mockDir, 'artifacts-list.json');

    if (fs.existsSync(specificMock)) {
      rawBytes = fs.readFileSync(specificMock);
    } else if (fs.existsSync(runMock)) {
      rawBytes = fs.readFileSync(runMock);
    } else if (expectedArtifactName.includes('closure') && fs.existsSync(stageBMock)) {
      rawBytes = fs.readFileSync(stageBMock);
    } else if (expectedArtifactName.includes('stage-a') && fs.existsSync(stageAMock)) {
      rawBytes = fs.readFileSync(stageAMock);
    } else if (expectedArtifactName.includes('intake') && fs.existsSync(intakeMock)) {
      rawBytes = fs.readFileSync(intakeMock);
    } else if (fs.existsSync(fallbackMock)) {
      rawBytes = fs.readFileSync(fallbackMock);
    } else {
      throw new Error(`[FAIL-CLOSED] Lista de artefactos para run ${runId} indisponível no directório mock.`);
    }
  } else {
    rawBytes = execFileSync('gh', ['api', `repos/${CANONICAL_REPO_NAME}/actions/runs/${runId}/artifacts`], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
  }

  const listFilename = expectedArtifactName ? `${expectedArtifactName}-list` : `run-${runId}-artifacts-list`;
  fs.writeFileSync(path.join(targetDir, `${listFilename}.json`), rawBytes);
  fs.writeFileSync(path.join(targetDir, `${listFilename}.json.sha256`), `${sha256(rawBytes)}  ${listFilename}.json\n`, 'utf8');

  return JSON.parse(rawBytes.toString('utf8'));
}

/**
 * Descarrega directamente um artefacto específico de um run,
 * consulta seu endpoint individual, calcula SHA-256 e extrai usando o extractor seguro.
 */
function downloadAndExtractArtifact(runId, expectedArtifactName, extractSubdir, artifactBaseFilename, outDir, mockDir, sourceSha) {
  assertStrictId(runId, 'runId');
  const artifactsData = fetchArtifactsList(runId, outDir, mockDir, expectedArtifactName);

  // 1. Seleção estrita sem fallback (Correção A)
  const art = selectExactArtifact(artifactsData.artifacts, expectedArtifactName, runId);

  // 2. Consulta ao endpoint individual do artefacto (Correção B / 2.4)
  const individualArtifactResult = fetchIndividualApi(
    `repos/${CANONICAL_REPO_NAME}/actions/artifacts/${art.id}`,
    outDir,
    artifactBaseFilename,
    mockDir
  );
  const indArt = individualArtifactResult.parsed;

  // 3. Validação estrita dos metadados do artefacto
  validateArtifactMetadata(indArt, expectedArtifactName, runId, sourceSha);

  // 4. Reconciliação e verificação de consistência entre resposta agregada e endpoint individual (Ponto 4)
  reconcileArtifactResponses(art, indArt);

  const zipPath = path.join(outDir, `${expectedArtifactName}.zip`);
  const extractDir = path.join(outDir, extractSubdir);

  if (mockDir && fs.existsSync(path.join(mockDir, `${expectedArtifactName}.zip`))) {
    fs.copyFileSync(path.join(mockDir, `${expectedArtifactName}.zip`), zipPath);
  } else if (!mockDir) {
    execFileSync('gh', ['api', `repos/${CANONICAL_REPO_NAME}/actions/artifacts/${art.id}/zip`], {
      stdio: ['pipe', fs.openSync(zipPath, 'w'), 'pipe']
    });
  }

  let zipSha = 'MOCK_ZIP_SHA';
  let zipBytes = Buffer.from('mock');
  if (fs.existsSync(zipPath)) {
    zipBytes = fs.readFileSync(zipPath);
    zipSha = sha256(zipBytes);
    fs.writeFileSync(`${zipPath}.sha256`, `${zipSha}  ${path.basename(zipPath)}\n`);
    auditAndExtractZip(zipPath, extractDir);
  } else if (mockDir) {
    fs.mkdirSync(extractDir, { recursive: true });
  }

  const extractedFiles = fs.existsSync(extractDir)
    ? fs.readdirSync(extractDir, { recursive: true }).filter(f => {
        try {
          return fs.statSync(path.join(extractDir, f)).isFile();
        } catch {
          return false;
        }
      })
    : [];

  return {
    artifact: indArt,
    rawArtifactBytes: individualArtifactResult.rawBytes,
    artifactSha: individualArtifactResult.rawSha,
    zipPath,
    zipSha,
    extractDir,
    extractedFiles
  };
}

export async function runVerification(cliArgs = process.argv.slice(2)) {
  function getArg(name, fallback = '') {
    const prefix = `--${name}=`;
    const found = cliArgs.find(a => a.startsWith(prefix));
    return found ? found.slice(prefix.length) : fallback;
  }

  const mode = getArg('mode', process.env.EXECUTION_MODE || 'DEMO');
  const hasMockArg = cliArgs.some(a => a.startsWith('--mock-data-dir'));
  const hasMockEnv = Boolean(process.env.MOCK_DATA_DIR);

  const isOperationalExecution = (
    mode === 'OPERATIONAL_PILOT' ||
    getArg('no-mock') === 'true' ||
    (process.env.GITHUB_WORKFLOW && process.env.GITHUB_WORKFLOW.includes('Operational Pilot - Atestação Independente'))
  );

  if (isOperationalExecution && (hasMockArg || hasMockEnv)) {
    console.error('\n[FAIL-CLOSED] Mocks são terminantemente proibidos no verificador final utilizado operacionalmente.');
    process.exit(1);
  }

  const mockDataDir = (hasMockArg || hasMockEnv)
    ? getArg('mock-data-dir', process.env.MOCK_DATA_DIR || '')
    : '';

  let stageBRunId = getArg('stage-b-run-id', process.env.STAGE_B_RUN_ID || process.env.GITHUB_EVENT_WORKFLOW_RUN_ID || '');
  let inputSourceSha = getArg('source-sha', process.env.GIT_COMMIT_SHA || process.env.GITHUB_SHA || '');
  const outDir = path.resolve(process.cwd(), getArg('out-dir', '.artifacts/chain_attestation'));

  fs.mkdirSync(outDir, { recursive: true });

  console.log('================================================================');
  console.log('ATESTAÇÃO FORENSE INDEPENDENTE DA CADEIA OPERACIONAL (PÓS-ETAPA B)');
  console.log('================================================================');
  console.log(`Directório de Saída: ${outDir}`);
  console.log(`Modo de Execução:    ${mode}`);
  console.log(`Stage B Run ID:      ${stageBRunId || '(a determinar)'}`);
  console.log(`Source Commit SHA:   ${inputSourceSha || '(a determinar via Stage B)'}`);

  const matrix = [];
  function recordCheck(req, run, artifact, file, hash, result, details = '') {
    matrix.push({ req, run, artifact, file, hash, result, details });
    const statusMark = result === 'PASS' ? '[PASS]' : '[FAIL]';
    console.log(`${statusMark} [${req}] Run:${run} | Art:${artifact} | Ficheiro:${file} -> ${result} ${details ? '(' + details + ')' : ''}`);
    if (result !== 'PASS') {
      console.error(`\n[FAIL-CLOSED] Falha de conformidade forense no requisito '${req}': ${details}`);
      process.exit(1);
    }
  }

  try {
    // -------------------------------------------------------------------------
    // 1. Âncora da Etapa B e Consulta Direta ao seu Endpoint Individual (2.1)
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Âncora da Etapa B e Consulta Individual ao Run ---');
    if (!stageBRunId) {
      throw new Error(`[FAIL-CLOSED] stage_b_run_id é estritamente obrigatório como âncora de proveniência.`);
    }
    assertStrictId(stageBRunId, 'stageBRunId');

    const resRunB = fetchIndividualApi(
      `repos/${CANONICAL_REPO_NAME}/actions/runs/${stageBRunId}`,
      outDir,
      'stage-b-run-api-response',
      mockDataDir
    );
    const runBData = resRunB.parsed;
    const rawRunBBytes = resRunB.rawBytes;

    const sourceSha = runBData?.head_sha || inputSourceSha;
    assertStrictSha(sourceSha, 'sourceSha');

    validateRunMetadata(
      runBData,
      stageBRunId,
      '.github/workflows/operational-pilot-stage-b.yml',
      sourceSha
    );

    recordCheck('STAGE_B_RUN_VALID', String(runBData.id), 'N/A', 'stage-b-run-api-response.json', sha256(rawRunBBytes),
      'PASS', `conclusion=${runBData.conclusion}, sha=${runBData.head_sha}`);

    // Download do artefacto de fecho da Etapa B e consulta ao endpoint individual
    const expectedClosureArtifactName = `aetf-pilot-closure-${sourceSha}`;
    const stageBBundle = downloadAndExtractArtifact(
      stageBRunId,
      expectedClosureArtifactName,
      'stage_b_extracted',
      'stage-b-artifact-api-response',
      outDir,
      mockDataDir,
      sourceSha
    );

    recordCheck('STAGE_B_ARTIFACT_DOWNLOADED', String(runBData.id), String(stageBBundle.artifact.id), expectedClosureArtifactName, stageBBundle.zipSha,
      stageBBundle.extractedFiles.length > 0 ? 'PASS' : 'FAIL',
      `${stageBBundle.extractedFiles.length} ficheiros extraídos`);

    const stageBExtractDir = stageBBundle.extractDir;
    const stageBEvidenceBase = fs.existsSync(path.join(stageBExtractDir, 'evidence'))
      ? path.join(stageBExtractDir, 'evidence')
      : stageBExtractDir;

    // -------------------------------------------------------------------------
    // 2. Descoberta da Etapa A Consumida pela Etapa B com Consenso e Índice (2.2)
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Descoberta da Etapa A Consumida pela Etapa B ---');
    const stageALinkage = extractConsumedStageAIdentifiers(stageBExtractDir);
    const stageARunId = String(stageALinkage.stage_a_run_id);
    const stageAArtifactId = Number(stageALinkage.stage_a_artifact_id);

    assertStrictId(stageARunId, 'stage_a_run_id');
    assertStrictId(stageAArtifactId, 'stage_a_artifact_id');

    console.log(`[PASS] Etapa A descoberta na evidência consumida da Etapa B: Run ${stageARunId} | Artefacto ${stageAArtifactId} (Fontes: ${stageALinkage.linkage_sources.join(', ')})`);

    // Consulta individual ao run da Etapa A
    const resRunA = fetchIndividualApi(
      `repos/${CANONICAL_REPO_NAME}/actions/runs/${stageARunId}`,
      outDir,
      'stage-a-run-api-response',
      mockDataDir
    );
    const stageARun = resRunA.parsed;
    const stageARunBytes = resRunA.rawBytes;

    validateRunMetadata(
      stageARun,
      stageARunId,
      '.github/workflows/operational-pilot-stage-a.yml',
      sourceSha
    );

    recordCheck('STAGE_A_RUN_VALID', String(stageARun.id), 'N/A', 'stage-a-run-api-response.json', sha256(stageARunBytes),
      'PASS', `conclusion=${stageARun.conclusion}, sha=${stageARun.head_sha}`);

    // Download do artefacto da Etapa A e consulta individual ao endpoint do artefacto
    const expectedStageAArtifactName = `aetf-pilot-stage-a-${sourceSha}`;
    const stageABundle = downloadAndExtractArtifact(
      stageARunId,
      expectedStageAArtifactName,
      'stage_a_extracted',
      'stage-a-artifact-api-response',
      outDir,
      mockDataDir,
      sourceSha
    );

    if (stageABundle.artifact.id !== stageAArtifactId) {
      throw new Error(`[FAIL-CLOSED] ID do artefacto da Etapa A descarregado (${stageABundle.artifact.id}) diverge do ID consumido pela Etapa B (${stageAArtifactId}).`);
    }

    recordCheck('STAGE_A_ARTIFACT_DOWNLOADED', String(stageARun.id), String(stageABundle.artifact.id), expectedStageAArtifactName, stageABundle.zipSha,
      stageABundle.extractedFiles.length > 0 ? 'PASS' : 'FAIL',
      `${stageABundle.extractedFiles.length} ficheiros extraídos`);

    // Extrair desafio emitido na Etapa A (directamente da base de dados física pilot.db no pacote da Etapa A)
    let stageAChallengeId = '';
    const stageADbPath = path.join(stageABundle.extractDir, 'pilot.db');
    if (fs.existsSync(stageADbPath)) {
      try {
        const { DatabaseSync } = await import('node:sqlite');
        const dbA = new DatabaseSync(stageADbPath);
        const row = dbA.prepare("SELECT challenge_id FROM pilot_review_challenges LIMIT 1").get();
        if (row && row.challenge_id) {
          stageAChallengeId = String(row.challenge_id);
        }
      } catch (err) {
        console.warn(`[WARN] Leitura SQLite no pacote da Etapa A: ${err.message}`);
      }
    }

    if (!stageAChallengeId) {
      const possibleReceiptFiles = [
        path.join(stageABundle.extractDir, 'task-receipt-test.json'),
        path.join(stageBExtractDir, 'task-receipt-test.json'),
        path.join(stageBExtractDir, 'reviewer-independence-receipt.json')
      ];
      for (const rf of possibleReceiptFiles) {
        if (fs.existsSync(rf)) {
          const rObj = JSON.parse(fs.readFileSync(rf, 'utf8'));
          if (rObj.challenge_id) {
            stageAChallengeId = rObj.challenge_id;
            break;
          }
        }
      }
    }

    recordCheck('STAGE_A_CHALLENGE_ISSUED', String(stageARun.id), String(stageABundle.artifact.id), 'pilot.db (pilot_review_challenges)', 'N/A',
      Boolean(stageAChallengeId && stageAChallengeId.startsWith('CHAL_')) ? 'PASS' : 'FAIL',
      `challenge_id=${stageAChallengeId}`);

    // -------------------------------------------------------------------------
    // 3. Descoberta do Intake Consumido pela Etapa A com Consenso e Índice (2.3)
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Descoberta do Intake Consumido pela Etapa A ---');
    const intakeLinkage = extractConsumedIntakeIdentifiers(stageABundle.extractDir);
    const intakeRunId = String(intakeLinkage.intake_run_id);
    const intakeArtifactId = Number(intakeLinkage.intake_artifact_id);

    assertStrictId(intakeRunId, 'intake_run_id');
    assertStrictId(intakeArtifactId, 'intake_artifact_id');

    console.log(`[PASS] Intake descoberto na evidência consumida da Etapa A: Run ${intakeRunId} | Artefacto ${intakeArtifactId} (Fontes: ${intakeLinkage.linkage_sources.join(', ')})`);

    // Consulta individual ao run do Intake
    const resRunIntake = fetchIndividualApi(
      `repos/${CANONICAL_REPO_NAME}/actions/runs/${intakeRunId}`,
      outDir,
      'intake-run-api-response',
      mockDataDir
    );
    const intakeRun = resRunIntake.parsed;
    const intakeRunBytes = resRunIntake.rawBytes;

    validateRunMetadata(
      intakeRun,
      intakeRunId,
      '.github/workflows/operational-pilot-intake.yml',
      sourceSha
    );

    recordCheck('INTAKE_RUN_VALID', String(intakeRun.id), 'N/A', 'intake-run-api-response.json', sha256(intakeRunBytes),
      'PASS', `conclusion=${intakeRun.conclusion}, sha=${intakeRun.head_sha}`);

    // Download do artefacto de Intake e consulta individual ao endpoint do artefacto
    const expectedIntakeArtifactName = `aetf-pilot-intake-${sourceSha}`;
    const intakeBundle = downloadAndExtractArtifact(
      intakeRunId,
      expectedIntakeArtifactName,
      'intake_extracted',
      'intake-artifact-api-response',
      outDir,
      mockDataDir,
      sourceSha
    );

    if (intakeBundle.artifact.id !== intakeArtifactId) {
      throw new Error(`[FAIL-CLOSED] ID do artefacto de Intake descarregado (${intakeBundle.artifact.id}) diverge do ID consumido pela Etapa A (${intakeArtifactId}).`);
    }

    recordCheck('INTAKE_ARTIFACT_DOWNLOADED', String(intakeRun.id), String(intakeBundle.artifact.id), expectedIntakeArtifactName, intakeBundle.zipSha,
      intakeBundle.extractedFiles.length > 0 ? 'PASS' : 'FAIL',
      `${intakeBundle.extractedFiles.length} ficheiros extraídos`);

    let intakePackageSha = '';
    const intakePkgShaPath = path.join(intakeBundle.extractDir, 'input-package.sha256');
    const intakeOrigShaPath = path.join(intakeBundle.extractDir, 'original-package.sha256');
    if (fs.existsSync(intakePkgShaPath)) {
      intakePackageSha = fs.readFileSync(intakePkgShaPath, 'utf8').trim().split(/\s+/)[0];
    } else if (fs.existsSync(intakeOrigShaPath)) {
      intakePackageSha = fs.readFileSync(intakeOrigShaPath, 'utf8').trim().split(/\s+/)[0];
    }

    // -------------------------------------------------------------------------
    // 4. Verificação Real do Run da CI Principal no SHA Canónico
    // -------------------------------------------------------------------------
    console.log('\n--- 4. Verificação Real do Run da CI Principal ---');
    let ciRunId;
    if (mockDataDir && fs.existsSync(path.join(mockDataDir, 'ci-run-api-response.json'))) {
      const parsedMockCi = JSON.parse(fs.readFileSync(path.join(mockDataDir, 'ci-run-api-response.json'), 'utf8'));
      ciRunId = String(parsedMockCi.id);
    } else {
      const resRuns = fetchAndPreserveGhApi(
        `repos/${CANONICAL_REPO_NAME}/actions/runs?head_sha=${sourceSha}&branch=master`,
        outDir,
        'all-chain-runs-api-response'
      );
      const runs = resRuns.parsed.workflow_runs || [];
      const foundCi = runs.find(r => r.path === '.github/workflows/ci.yml' && r.status === 'completed');
      if (!foundCi) {
        throw new Error(`[FAIL-CLOSED] Run da CI Principal (.github/workflows/ci.yml) não encontrado ou não concluído no SHA ${sourceSha}.`);
      }
      ciRunId = String(foundCi.id);
    }

    const resCi = fetchIndividualApi(
      `repos/${CANONICAL_REPO_NAME}/actions/runs/${ciRunId}`,
      outDir,
      'ci-run-api-response',
      mockDataDir
    );
    const ciRun = resCi.parsed;
    const ciRunBytes = resCi.rawBytes;

    validateRunMetadata(
      ciRun,
      ciRunId,
      '.github/workflows/ci.yml',
      sourceSha
    );

    const isCiCanonicalRepo = ciRun.repository?.id === CANONICAL_REPO_ID && (ciRun.head_repository?.id === CANONICAL_REPO_ID || !ciRun.head_repository);

    recordCheck('CI_RUN_EXISTS', String(ciRun.id), 'N/A', 'ci-run-api-response.json', sha256(ciRunBytes),
      'PASS', `head_sha=${ciRun.head_sha}, branch=${ciRun.head_branch}`);

    recordCheck('CI_RUN_CONCLUSION_SUCCESS', String(ciRun.id), 'N/A', 'ci-run-api-response.json', sha256(ciRunBytes),
      'PASS', `status=${ciRun.status}, conclusion=${ciRun.conclusion}`);

    recordCheck('CI_RUN_CANONICAL_REPO', String(ciRun.id), 'N/A', 'ci-run-api-response.json', sha256(ciRunBytes),
      isCiCanonicalRepo ? 'PASS' : 'FAIL', `repo_id=${ciRun.repository?.id}`);

    // -------------------------------------------------------------------------
    // 5. Reconciliação Direta Cruzada entre as Três Etapas
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Reconciliação Direta Cruzada entre as Três Etapas ---');
    let stageBChallengeId = '';
    let stageBReviewReceiptPath = null;
    const possibleReviewDirs = [
      path.join(stageBEvidenceBase, 'review-receipts'),
      path.join(stageBExtractDir, 'review-receipts'),
      stageBEvidenceBase,
      stageBExtractDir
    ];
    for (const dir of possibleReviewDirs) {
      if (fs.existsSync(dir)) {
        const f = fs.readdirSync(dir).find(x => (x.startsWith('REV_') || x.startsWith('reviewer-') || x.startsWith('task-receipt')) && x.endsWith('.json'));
        if (f) {
          const parsedRev = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
          if (parsedRev.challenge_id) {
            stageBReviewReceiptPath = path.join(dir, f);
            stageBChallengeId = parsedRev.challenge_id;
            break;
          }
        }
      }
    }

    if (!stageBChallengeId && fs.existsSync(path.join(stageBExtractDir, 'pilot.db'))) {
      try {
        const { DatabaseSync } = await import('node:sqlite');
        const dbB = new DatabaseSync(path.join(stageBExtractDir, 'pilot.db'));
        const row = dbB.prepare("SELECT challenge_id FROM pilot_review_challenges LIMIT 1").get();
        if (row && row.challenge_id) {
          stageBChallengeId = String(row.challenge_id);
        }
      } catch {}
    }

    recordCheck('CHALLENGE_CROSS_RECONCILED', String(runBData.id), String(stageBBundle.artifact.id), stageBReviewReceiptPath ? path.basename(stageBReviewReceiptPath) : 'pilot.db', stageBReviewReceiptPath ? sha256(fs.readFileSync(stageBReviewReceiptPath)) : 'N/A',
      stageAChallengeId === stageBChallengeId && stageAChallengeId !== '' ? 'PASS' : 'FAIL',
      `stage_a_chal=${stageAChallengeId} === stage_b_chal=${stageBChallengeId}`);

    const stageAInputShaPath = path.join(stageABundle.extractDir, 'input-package.sha256');
    let stageAInputSha = '';
    if (fs.existsSync(stageAInputShaPath)) {
      stageAInputSha = fs.readFileSync(stageAInputShaPath, 'utf8').trim().split(/\s+/)[0];
    }
    const isPackageHashReconciled = !intakePackageSha || !stageAInputSha || (intakePackageSha === stageAInputSha);

    recordCheck('PACKAGE_HASH_RECONCILED', String(intakeRun.id), String(stageABundle.artifact.id), 'input-package.sha256', 'N/A',
      isPackageHashReconciled ? 'PASS' : 'FAIL',
      `intake_hash=${intakePackageSha.slice(0, 16)}... === stage_a_hash=${stageAInputSha.slice(0, 16)}...`);

    const indepReceiptPath = fs.existsSync(path.join(stageBEvidenceBase, 'reviewer-independence-receipt.json'))
      ? path.join(stageBEvidenceBase, 'reviewer-independence-receipt.json')
      : path.join(stageBExtractDir, 'reviewer-independence-receipt.json');

    if (!fs.existsSync(indepReceiptPath)) {
      throw new Error('[FAIL-CLOSED] reviewer-independence-receipt.json ausente na Etapa B.');
    }
    const indepReceipt = JSON.parse(fs.readFileSync(indepReceiptPath, 'utf8'));

    recordCheck('DEMO_INDEPENDENCE_SYNTHETIC', String(runBData.id), String(stageBBundle.artifact.id), 'reviewer-independence-receipt.json', sha256(fs.readFileSync(indepReceiptPath)),
      indepReceipt.execution_mode === 'DEMO' &&
      indepReceipt.is_simulation === true &&
      indepReceipt.independence_evidence_type === 'SYNTHETIC_DEMO' &&
      indepReceipt.github_environment_approval_id === null &&
      indepReceipt.independence_verified === false &&
      indepReceipt.classification === 'DEMO_REVIEW_INDEPENDENCE_SIMULATED' ? 'PASS' : 'FAIL',
      `approval_id=${indepReceipt.github_environment_approval_id}, sim=${indepReceipt.is_simulation}`);

    const indexPath = fs.existsSync(path.join(stageBEvidenceBase, 'pilot-evidence-files.sha256'))
      ? path.join(stageBEvidenceBase, 'pilot-evidence-files.sha256')
      : path.join(stageBExtractDir, 'pilot-evidence-files.sha256');

    if (!fs.existsSync(indexPath)) {
      throw new Error('[FAIL-CLOSED] pilot-evidence-files.sha256 ausente na Etapa B.');
    }

    const indexLines = fs.readFileSync(indexPath, 'utf8').split('\n').filter(l => l.trim().length > 0);
    let checkedHashes = 0;
    for (const line of indexLines) {
      const parts = line.trim().split(/\s+/);
      if (parts.length < 2) continue;
      const expectedH = parts[0];
      const rawFileName = parts.slice(1).join(' ');
      const normalizedFile = rawFileName.replace(/^[./\\]+/, '').split(/[/\\]/).join(path.sep);
      const filePath = fs.existsSync(path.join(stageBEvidenceBase, normalizedFile))
        ? path.join(stageBEvidenceBase, normalizedFile)
        : path.join(stageBExtractDir, normalizedFile);

      if (!fs.existsSync(filePath)) {
        throw new Error(`[FAIL-CLOSED] Ficheiro indexado ausente: ${rawFileName}`);
      }
      const computedH = sha256(fs.readFileSync(filePath));
      if (computedH.toLowerCase() !== expectedH.toLowerCase()) {
        throw new Error(`[FAIL-CLOSED] Hash divergente para ${rawFileName}`);
      }
      checkedHashes++;
    }

    recordCheck('PHYSICAL_HASH_INTEGRITY', String(runBData.id), String(stageBBundle.artifact.id), 'pilot-evidence-files.sha256', sha256(fs.readFileSync(indexPath)),
      checkedHashes >= 20 ? 'PASS' : 'FAIL',
      `${checkedHashes} ficheiros verificados fisicamente com 100% de integridade`);

    // -------------------------------------------------------------------------
    // 6. Verificação Externa da Regra de Proteção (prevent_self_review)
    // -------------------------------------------------------------------------
    console.log('\n--- 6. Verificação Externa da Regra de Proteção (prevent_self_review) ---');
    let envProtectionRule = null;
    let rawEnvBytes = null;
    try {
      if (mockDataDir && fs.existsSync(path.join(mockDataDir, 'environment-protection-api-response.json'))) {
        rawEnvBytes = fs.readFileSync(path.join(mockDataDir, 'environment-protection-api-response.json'));
        envProtectionRule = JSON.parse(rawEnvBytes.toString('utf8'));
      } else if (!mockDataDir) {
        const resEnv = fetchAndPreserveGhApi(
          `repos/${CANONICAL_REPO_NAME}/environments/protected-pilot`,
          outDir,
          'environment-protection-api-response'
        );
        rawEnvBytes = resEnv.rawBytes;
        envProtectionRule = resEnv.parsed;
      }
    } catch (envErr) {
      console.warn(`[WARN] Consulta à API de ambientes indisponível: ${envErr.message}`);
      const envSavedFile = path.join(stageABundle.extractDir, 'environment-api-response.json');
      if (fs.existsSync(envSavedFile)) {
        rawEnvBytes = fs.readFileSync(envSavedFile);
        envProtectionRule = JSON.parse(rawEnvBytes.toString('utf8'));
        fs.writeFileSync(path.join(outDir, 'environment-protection-api-response.json'), rawEnvBytes);
        fs.writeFileSync(path.join(outDir, 'environment-protection-api-response.json.sha256'), `${sha256(rawEnvBytes)}  environment-protection-api-response.json\n`);
      }
    }

    const reqReviewRule = envProtectionRule?.protection_rules?.find(r => r.type === 'required_reviewers');
    const isPreventSelfReviewActive = reqReviewRule ? reqReviewRule.prevent_self_review === true : false;

    recordCheck('ENVIRONMENT_PREVENT_SELF_REVIEW', 'protected-pilot', reqReviewRule?.id ? String(reqReviewRule.id) : 'N/A',
      'environment-protection-api-response.json', rawEnvBytes ? sha256(rawEnvBytes) : 'N/A',
      (isPreventSelfReviewActive || mode === 'DEMO') ? 'PASS' : 'FAIL',
      `prevent_self_review=${reqReviewRule?.prevent_self_review ?? 'DEMO_SIMULATED'}`);

    // -------------------------------------------------------------------------
    // 7. Cálculo Dinâmico de TODOS os Estados de Verificação
    // -------------------------------------------------------------------------
    console.log('\n--- 7. Cálculo Dinâmico de Todos os Estados de Verificação ---');
    const isCiCompleted = ciRun.status === 'completed';
    const isCiSuccess = ciRun.conclusion === 'success';
    const isCiSameSha = ciRun.head_sha === sourceSha;

    const ci_verified = Boolean(
      ciRun &&
      isCiCompleted &&
      isCiSuccess &&
      isCiSameSha &&
      isCiCanonicalRepo &&
      ciRun.path === '.github/workflows/ci.yml'
    );

    const isIntakeCompleted = intakeRun.status === 'completed';
    const isIntakeSuccess = intakeRun.conclusion === 'success';
    const isIntakeSameSha = intakeRun.head_sha === sourceSha;
    const isIntakeCanonicalRepo = intakeRun.repository?.id === CANONICAL_REPO_ID || !intakeRun.repository;

    const intake_verified = Boolean(
      intakeRun &&
      isIntakeCompleted &&
      isIntakeSuccess &&
      isIntakeSameSha &&
      isIntakeCanonicalRepo &&
      intakeBundle &&
      intakeBundle.extractedFiles.length > 0
    );

    const isStageACompleted = stageARun.status === 'completed';
    const isStageASuccess = stageARun.conclusion === 'success';
    const isStageASameSha = stageARun.head_sha === sourceSha;
    const isStageACanonicalRepo = stageARun.repository?.id === CANONICAL_REPO_ID || !stageARun.repository;

    const stage_a_verified = Boolean(
      stageARun &&
      isStageACompleted &&
      isStageASuccess &&
      isStageASameSha &&
      isStageACanonicalRepo &&
      stageABundle &&
      stageABundle.extractedFiles.length > 0 &&
      Boolean(stageAChallengeId)
    );

    const isStageBCompleted = runBData.status === 'completed';
    const isStageBSuccess = runBData.conclusion === 'success';
    const isStageBSameSha = runBData.head_sha === sourceSha;
    const isStageBCanonicalRepo = (runBData.repository?.id === CANONICAL_REPO_ID || !runBData.repository);

    const stage_b_verified = Boolean(
      runBData &&
      isStageBCompleted &&
      isStageBSuccess &&
      isStageBSameSha &&
      isStageBCanonicalRepo &&
      stageBBundle &&
      stageBBundle.extractedFiles.length > 0 &&
      stageBChallengeId === stageAChallengeId &&
      checkedHashes >= 20
    );

    const cross_stages_reconciled = Boolean(
      intake_verified &&
      stage_a_verified &&
      stage_b_verified &&
      stageAChallengeId === stageBChallengeId &&
      stageAChallengeId !== '' &&
      isPackageHashReconciled
    );

    const same_sha_chain_verified = Boolean(
      ci_verified &&
      intake_verified &&
      stage_a_verified &&
      stage_b_verified &&
      cross_stages_reconciled &&
      ciRun.head_sha === sourceSha &&
      intakeRun.head_sha === sourceSha &&
      stageARun.head_sha === sourceSha &&
      runBData.head_sha === sourceSha
    );

    // -------------------------------------------------------------------------
    // 8. Emissão da Atestação Forense Consolidada com Metadados e Consenso Comprovado
    // -------------------------------------------------------------------------
    console.log('\n--- 8. Emissão da Atestação Forense Consolidada ---');
    const chainAttestation = {
      source_sha: sourceSha,
      execution_mode: mode,
      same_sha_chain_verified,
      canonical_repo_id: CANONICAL_REPO_ID,
      canonical_repo_name: CANONICAL_REPO_NAME,
      ci_verified,
      intake_verified,
      stage_a_verified,
      stage_b_verified,
      cross_stages_reconciled,
      environment_prevent_self_review_observed: isPreventSelfReviewActive,
      ci_run_id: ciRun.id,
      intake_run_id: intakeRun.id,
      stage_a_run_id: stageARun.id,
      stage_b_run_id: runBData.id,
      intake_artifact_id: intakeBundle.artifact.id,
      stage_a_artifact_id: stageABundle.artifact.id,
      stage_b_artifact_id: stageBBundle.artifact.id,
      linkage_sources: [...stageALinkage.linkage_sources, ...intakeLinkage.linkage_sources],
      linkage_source_hashes_verified: stageALinkage.linkage_source_hashes_verified && intakeLinkage.linkage_source_hashes_verified,
      linkage_consensus_verified: stageALinkage.linkage_consensus_verified && intakeLinkage.linkage_consensus_verified,
      artifacts_metadata: {
        intake: {
          artifact_id: intakeBundle.artifact.id,
          artifact_name: intakeBundle.artifact.name,
          artifact_size_bytes: intakeBundle.artifact.size_in_bytes,
          artifact_expired: intakeBundle.artifact.expired,
          workflow_run_id: intakeBundle.artifact.workflow_run.id,
          source_sha: sourceSha,
          zip_sha256: intakeBundle.zipSha
        },
        stage_a: {
          artifact_id: stageABundle.artifact.id,
          artifact_name: stageABundle.artifact.name,
          artifact_size_bytes: stageABundle.artifact.size_in_bytes,
          artifact_expired: stageABundle.artifact.expired,
          workflow_run_id: stageABundle.artifact.workflow_run.id,
          source_sha: sourceSha,
          zip_sha256: stageABundle.zipSha
        },
        stage_b: {
          artifact_id: stageBBundle.artifact.id,
          artifact_name: stageBBundle.artifact.name,
          artifact_size_bytes: stageBBundle.artifact.size_in_bytes,
          artifact_expired: stageBBundle.artifact.expired,
          workflow_run_id: stageBBundle.artifact.workflow_run.id,
          source_sha: sourceSha,
          zip_sha256: stageBBundle.zipSha
        }
      },
      challenge_id: stageAChallengeId,
      review_independence_evidence: 'SYNTHETIC_DEMO',
      real_pilot_authorised: false,
      classification: 'SAME_SHA_DEMO_CHAIN_INDEPENDENTLY_ATTESTED',
      attested_at: new Date().toISOString()
    };

    const attestationPath = path.join(outDir, 'chain-attestation.json');
    fs.writeFileSync(attestationPath, JSON.stringify(chainAttestation, null, 2), 'utf8');
    fs.writeFileSync(`${attestationPath}.sha256`, `${sha256(fs.readFileSync(attestationPath))}  chain-attestation.json\n`, 'utf8');

    const matrixLines = [
      '# Matriz de Atestação Forense da Cadeia Operacional',
      '',
      `**Commit SHA Auditado:** \`${sourceSha}\``,
      `**Data de Emissão:** ${chainAttestation.attested_at}`,
      `**Classificação:** \`${chainAttestation.classification}\``,
      '',
      '| Requirement | Run ID | Artifact ID | Ficheiro Auditado | Hash SHA-256 | Resultado | Detalhes |',
      '|---|---|---|---|---|---|---|'
    ];
    for (const m of matrix) {
      matrixLines.push(`| ${m.req} | ${m.run} | ${m.artifact} | \`${m.file}\` | \`${m.hash.slice(0, 16)}...\` | **${m.result}** | ${m.details} |`);
    }
    const matrixPath = path.join(outDir, 'chain-attestation-matrix.md');
    fs.writeFileSync(matrixPath, matrixLines.join('\n') + '\n', 'utf8');
    fs.writeFileSync(`${matrixPath}.sha256`, `${sha256(fs.readFileSync(matrixPath))}  chain-attestation-matrix.md\n`, 'utf8');

    const outFiles = fs.readdirSync(outDir).filter(f => f !== 'chain-evidence-files.sha256' && fs.statSync(path.join(outDir, f)).isFile()).sort();
    const indexLinesOut = outFiles.map(f => `${sha256(fs.readFileSync(path.join(outDir, f)))}  ${f}`);
    fs.writeFileSync(path.join(outDir, 'chain-evidence-files.sha256'), indexLinesOut.join('\n') + '\n', 'utf8');

    console.log('\n================================================================');
    console.log(`[PASS] ATESTAÇÃO CONCLUÍDA: ${chainAttestation.classification}`);
    console.log(`Relatório de Matriz gravado em: ${matrixPath}`);
    console.log(`Atestação JSON gravada em:      ${attestationPath}`);
    console.log('================================================================\n');

    return chainAttestation;
  } catch (err) {
    console.error(`\n[FATAL] Erro durante a atestação independente da cadeia: ${err.message}`);
    process.exit(1);
  }
}

// Invocação direta CLI
const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  runVerification();
}

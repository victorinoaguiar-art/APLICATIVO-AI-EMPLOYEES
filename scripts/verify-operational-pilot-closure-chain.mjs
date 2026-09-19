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
 * Validação Estrita da Identidade Canónica do Repositório (Subprompt 2 — Sem Fallbacks)
 * Exige estritamente nos 4 runs da cadeia (CI, Intake, Etapa A, Etapa B):
 * - run.repository.id === 1363667011
 * - run.head_repository.id === 1363667011
 * - run.repository.full_name === 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES'
 * - run.head_repository.full_name === 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES'
 * Rejeita runs de fork, repositórios ausentes, nulos, textuais, zeros ou divergentes.
 */
export function validateRunRepositoryIdentity(run, runLabel = 'run') {
  if (!run || typeof run !== 'object') {
    throw new Error(`[FAIL-CLOSED] Metadados de run inválidos ou ausentes para '${runLabel}'.`);
  }
  if (!run.repository || typeof run.repository !== 'object') {
    throw new Error(`[FAIL-CLOSED] Objeto 'repository' ausente no run '${runLabel}'.`);
  }
  if (typeof run.repository.id !== 'number' || !Number.isSafeInteger(run.repository.id) || run.repository.id <= 0) {
    throw new Error(`[FAIL-CLOSED] 'repository.id' ausente, nulo, zero ou inválido no run '${runLabel}'.`);
  }
  if (run.repository.id !== CANONICAL_REPO_ID) {
    throw new Error(`[FAIL-CLOSED] 'repository.id' (${run.repository.id}) diverge do canónico (${CANONICAL_REPO_ID}) no run '${runLabel}'.`);
  }
  if (!run.repository.full_name || typeof run.repository.full_name !== 'string') {
    throw new Error(`[FAIL-CLOSED] 'repository.full_name' ausente ou inválido no run '${runLabel}'.`);
  }
  if (run.repository.full_name !== CANONICAL_REPO_NAME) {
    throw new Error(`[FAIL-CLOSED] 'repository.full_name' ('${run.repository.full_name}') diverge do canónico ('${CANONICAL_REPO_NAME}') no run '${runLabel}'.`);
  }

  if (!run.head_repository || typeof run.head_repository !== 'object') {
    throw new Error(`[FAIL-CLOSED] Objeto 'head_repository' ausente no run '${runLabel}'.`);
  }
  if (typeof run.head_repository.id !== 'number' || !Number.isSafeInteger(run.head_repository.id) || run.head_repository.id <= 0) {
    throw new Error(`[FAIL-CLOSED] 'head_repository.id' ausente, nulo, zero ou inválido no run '${runLabel}'.`);
  }
  if (run.head_repository.id !== CANONICAL_REPO_ID) {
    throw new Error(`[FAIL-CLOSED] 'head_repository.id' (${run.head_repository.id}) diverge do canónico (${CANONICAL_REPO_ID}) no run '${runLabel}'.`);
  }
  if (!run.head_repository.full_name || typeof run.head_repository.full_name !== 'string') {
    throw new Error(`[FAIL-CLOSED] 'head_repository.full_name' ausente ou inválido no run '${runLabel}'.`);
  }
  if (run.head_repository.full_name !== CANONICAL_REPO_NAME) {
    throw new Error(`[FAIL-CLOSED] 'head_repository.full_name' ('${run.head_repository.full_name}') diverge do canónico ('${CANONICAL_REPO_NAME}') no run '${runLabel}'.`);
  }

  if (run.repository.fork === true || run.head_repository.fork === true) {
    throw new Error(`[FAIL-CLOSED] Run '${runLabel}' rejeitado: proveniente de fork.`);
  }

  return true;
}

/**
 * Validação de Cadeia de Identidade Canónica dos 4 Runs (Subprompt 2 & Micro-Patch Final)
 */
export function verifyCanonicalRepositoryChain(ciRun, intakeRun, stageARun, stageBRun) {
  validateRunRepositoryIdentity(ciRun, 'CI');
  validateRunRepositoryIdentity(intakeRun, 'Intake');
  validateRunRepositoryIdentity(stageARun, 'Stage A');
  validateRunRepositoryIdentity(stageBRun, 'Stage B');
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

  // Validação estrita de identidade canónica do repositório (Subprompt 2)
  validateRunRepositoryIdentity(run, expectedRunId ? String(expectedRunId) : String(run.id));

  return true;
}

/**
 * Validação de Formato Estrito SHA-256 (Subprompt 2 — Verdade dos Hashes)
 * Rejeita qualquer hash que não tenha exactamente 64 caracteres hexadecimais (/^[a-f0-9]{64}$/).
 */
export function assertStrictSha256Format(val, label = 'hash') {
  if (typeof val !== 'string') {
    throw new Error(`[FAIL-CLOSED] Formato de hash inválido para '${label}': esperado string, obtido ${val === null ? 'null' : typeof val}.`);
  }
  const normalized = val.toLowerCase();
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new Error(`[FAIL-CLOSED] Hash SHA-256 inválido para '${label}': '${val}'. Deve conter exactamente 64 caracteres hexadecimais.`);
  }
  return normalized;
}

/**
 * Extração de Hash SHA-256 de um Ficheiro Checksum / Sidecar (Subprompt 2 & Micro-Patch Final)
 */
export function extractStrictSha256FromFile(filePath, label = 'sidecar') {
  if (!filePath || !fs.existsSync(filePath)) {
    throw new Error(`[FAIL-CLOSED] Ficheiro sidecar '${filePath}' ausente para '${label}'.`);
  }
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));
  if (lines.length === 0) {
    throw new Error(`[FAIL-CLOSED] Ficheiro de checksum '${filePath}' está vazio para '${label}'.`);
  }
  if (lines.length > 1) {
    throw new Error(`[FAIL-CLOSED] Mais de uma entrada encontrada no ficheiro sidecar '${path.basename(filePath)}' para '${label}': esperado exatamente uma linha.`);
  }
  const firstLine = lines[0];
  const parts = firstLine.split(/\s+/);
  if (parts.length < 2 || !parts[0] || !parts[1]) {
    throw new Error(`[FAIL-CLOSED] Linha sem nome ou caminho de ficheiro no sidecar '${path.basename(filePath)}' para '${label}': '${firstLine}'.`);
  }
  const hash = assertStrictSha256Format(parts[0], `${label} (${path.basename(filePath)})`);
  const rawReferenced = parts.slice(1).join(' ').replace(/^\*/, '');
  const referencedFile = normalizeCanonicalPath(rawReferenced);
  return { hash, referencedFile, rawContent: content };
}

/**
 * Validação de Integridade Física contra Ficheiro Sidecar .sha256 (Micro-Patch Final)
 * Elimina completamente a comparação por path.basename e valida caminhos canónicos exatos.
 */
export function verifySidecarHash(sourceFilePath, sidecarFilePath, label = 'sidecar', rootDir = null) {
  if (!sourceFilePath || !fs.existsSync(sourceFilePath)) {
    throw new Error(`[FAIL-CLOSED] Ficheiro físico '${sourceFilePath}' ausente para '${label}'.`);
  }
  if (!sidecarFilePath || !fs.existsSync(sidecarFilePath)) {
    throw new Error(`[FAIL-CLOSED] Ficheiro sidecar '${sidecarFilePath}' ausente para '${label}'.`);
  }

  const { hash: expectedHash, referencedFile } = extractStrictSha256FromFile(sidecarFilePath, label);

  const absSource = path.resolve(sourceFilePath);
  const absSidecarDir = path.dirname(path.resolve(sidecarFilePath));
  const absDeclared = path.resolve(absSidecarDir, referencedFile);

  if (rootDir) {
    const absRoot = path.resolve(rootDir);
    const relSource = path.relative(absRoot, absSource);
    if (relSource.startsWith('..') || path.isAbsolute(relSource)) {
      throw new Error(`[FAIL-CLOSED] Ficheiro físico '${sourceFilePath}' escapa da raiz autorizada '${rootDir}'.`);
    }
    const relDeclared = path.relative(absRoot, absDeclared);
    if (relDeclared.startsWith('..') || path.isAbsolute(relDeclared)) {
      throw new Error(`[FAIL-CLOSED] Ficheiro declarado no sidecar '${referencedFile}' escapa da raiz autorizada '${rootDir}'.`);
    }
    const canonicalRelSource = normalizeCanonicalPath(relSource);
    const canonicalRelDeclared = normalizeCanonicalPath(relDeclared);
    if (canonicalRelSource !== canonicalRelDeclared) {
      throw new Error(`[FAIL-CLOSED] Caminho canónico divergente no sidecar '${path.basename(sidecarFilePath)}': esperado '${canonicalRelSource}', declarado '${canonicalRelDeclared}'.`);
    }
  } else {
    if (absDeclared !== absSource) {
      throw new Error(`[FAIL-CLOSED] Caminho divergente no sidecar '${path.basename(sidecarFilePath)}': esperado '${absSource}', resolvido '${absDeclared}'.`);
    }
  }

  const sourceBytes = fs.readFileSync(absSource);
  const actualHash = sha256(sourceBytes).toLowerCase();
  assertStrictSha256Format(actualHash, `actual physical hash for ${label}`);

  if (actualHash !== expectedHash.toLowerCase()) {
    throw new Error(`[FAIL-CLOSED] Hash esperado (${expectedHash}) diferente do hash físico (${actualHash}) para '${label}'.`);
  }

  return { actualHash, expectedHash, match: true };
}

/**
 * Reconciliação Transversal de Hashes do Pacote: Intake == Etapa A == Etapa B (Subprompt 2)
 */
export function reconcilePackageHashes(intakeSha, stageASha, stageBSha) {
  if (!intakeSha) {
    throw new Error(`[FAIL-CLOSED] Hash do pacote publicado no Intake ausente.`);
  }
  if (!stageASha) {
    throw new Error(`[FAIL-CLOSED] Hash do pacote consumido pela Etapa A ausente.`);
  }
  if (!stageBSha) {
    throw new Error(`[FAIL-CLOSED] Hash do pacote/entrada preservado na Etapa B ausente.`);
  }

  const cleanIntake = assertStrictSha256Format(intakeSha, 'Intake package hash');
  const cleanStageA = assertStrictSha256Format(stageASha, 'Stage A package hash');
  const cleanStageB = assertStrictSha256Format(stageBSha, 'Stage B package hash');

  if (cleanIntake !== cleanStageA) {
    throw new Error(`[FAIL-CLOSED] Reconciliação transversal falhou: hash do Intake (${cleanIntake}) diverge do hash consumido na Etapa A (${cleanStageA}).`);
  }

  if (cleanStageA !== cleanStageB) {
    throw new Error(`[FAIL-CLOSED] Reconciliação transversal falhou: hash da Etapa A (${cleanStageA}) diverge do hash preservado na Etapa B (${cleanStageB}).`);
  }

  return true;
}

/**
 * Extração Segura de Hash de Pacote de um Bundle Extraído (Micro-Patch Final)
 * - Autentica cada fonte pelo índice aplicável;
 * - Valida a existência física e integridade byte a byte do ficheiro referido;
 * - Valida fontes JSON estritamente sem tolerar malformações;
 * - Compara todos os campos de hash no mesmo JSON e entre fontes.
 */
export function extractPackageHashFromBundle(extractDir, stageName = 'Stage') {
  if (!extractDir || !fs.existsSync(extractDir)) {
    throw new Error(`[FAIL-CLOSED] Diretório de extração '${extractDir}' ausente para ${stageName}.`);
  }

  // 1. Carregar obrigatoriamente o índice de evidências do pacote
  const { indexMap } = loadPackageIndexMap(extractDir);

  const candidateSidecars = [
    'input-package.sha256',
    path.join('evidence', 'input-package.sha256'),
    'original-package.sha256',
    path.join('evidence', 'original-package.sha256')
  ];

  const candidateJsons = [
    'consumed-stage-a.json',
    path.join('evidence', 'consumed-stage-a.json')
  ];

  const validatedSources = [];

  // Avaliar todas as fontes .sha256 fisicamente presentes sem preferência silenciosa
  for (const relPath of candidateSidecars) {
    const fullPath = path.join(extractDir, relPath);
    if (!fs.existsSync(fullPath)) continue;

    // a. Autenticar o próprio ficheiro .sha256 contra o índice do pacote pelo caminho exacto
    const { normalizedRel } = verifyFileAgainstPackageIndex(extractDir, fullPath, indexMap);

    // b. Extrair hash estrito e caminho do ficheiro referido
    const ext = extractStrictSha256FromFile(fullPath, `${stageName} ${normalizedRel}`);
    if (!ext.referencedFile) {
      throw new Error(`[FAIL-CLOSED] Ficheiro sidecar '${normalizedRel}' não especifica ficheiro referido para ${stageName}.`);
    }

    const canonicalRef = normalizeCanonicalPath(ext.referencedFile);
    const sidecarDir = path.dirname(fullPath);
    const resolvedPhysicalTarget = path.resolve(sidecarDir, canonicalRef);

    // c. Validar que o ficheiro referido reside dentro do extractDir
    const relToExtract = path.relative(extractDir, resolvedPhysicalTarget);
    if (relToExtract.startsWith('..') || path.isAbsolute(relToExtract)) {
      throw new Error(`[FAIL-CLOSED] Ficheiro referido '${canonicalRef}' escapa do directório de extração para ${stageName} (${normalizedRel}).`);
    }

    // d. Validar que o ficheiro referido existe fisicamente
    if (!fs.existsSync(resolvedPhysicalTarget)) {
      throw new Error(`[FAIL-CLOSED] Ficheiro físico referido '${canonicalRef}' ausente em '${extractDir}' para ${stageName} (${normalizedRel}).`);
    }

    // e. Autenticar o ficheiro referido contra o índice do pacote
    verifyFileAgainstPackageIndex(extractDir, resolvedPhysicalTarget, indexMap);

    // f. Recalcular os bytes físicos do ficheiro referido e comparar com o hash declarado no sidecar
    const physicalBytes = fs.readFileSync(resolvedPhysicalTarget);
    const calculatedHash = sha256(physicalBytes).toLowerCase();
    assertStrictSha256Format(calculatedHash, `bytes físicos de ${canonicalRef}`);

    if (calculatedHash !== ext.hash.toLowerCase()) {
      throw new Error(`[FAIL-CLOSED] Bytes físicos adulterados em '${canonicalRef}' para ${stageName} (${normalizedRel}): hash físico (${calculatedHash}) diverge do hash declarado (${ext.hash}).`);
    }

    validatedSources.push({
      type: 'sidecar',
      path: normalizedRel,
      hash: ext.hash.toLowerCase()
    });
  }

  // Avaliar todas as fontes JSON de linkage fisicamente presentes sem preferência silenciosa
  for (const relPath of candidateJsons) {
    const fullPath = path.join(extractDir, relPath);
    if (!fs.existsSync(fullPath)) continue;

    // a. Autenticar o ficheiro JSON contra o índice pelo caminho exacto
    const { normalizedRel } = verifyFileAgainstPackageIndex(extractDir, fullPath, indexMap);

    // b. Ler e fazer parse estrito (sem abafar SyntaxError)
    const rawContent = fs.readFileSync(fullPath, 'utf8');
    if (!rawContent || !rawContent.trim()) {
      throw new Error(`[FAIL-CLOSED] Ficheiro JSON de linkage '${normalizedRel}' está vazio.`);
    }

    let data;
    try {
      data = JSON.parse(rawContent);
    } catch (parseErr) {
      throw new Error(`[FAIL-CLOSED] Ficheiro JSON de linkage '${normalizedRel}' malformado: ${parseErr.message}`);
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error(`[FAIL-CLOSED] Conteúdo de '${normalizedRel}' não é um objecto JSON válido.`);
    }

    // c. Recolher todos os campos de hash de pacote reconhecidos
    const recognizedKeys = ['input_package_sha', 'package_hash', 'original_package_sha'];
    const collectedHashes = [];

    for (const key of recognizedKeys) {
      if (key in data) {
        const rawVal = data[key];
        if (rawVal === null || rawVal === undefined || typeof rawVal !== 'string' || !rawVal.trim()) {
          throw new Error(`[FAIL-CLOSED] Campo de hash '${key}' presente no JSON de linkage com valor nulo, vazio ou de tipo inválido (${normalizedRel}).`);
        }
        const validatedHash = assertStrictSha256Format(rawVal.trim(), `${stageName} JSON.${key}`);
        collectedHashes.push({ key, hash: validatedHash });
      }
    }

    if (collectedHashes.length === 0) {
      throw new Error(`[FAIL-CLOSED] Ficheiro JSON de linkage '${normalizedRel}' não contém nenhum campo de hash reconhecido.`);
    }

    // d. Comparar todos os campos entre si na mesma fonte JSON
    const firstEntry = collectedHashes[0];
    for (let i = 1; i < collectedHashes.length; i++) {
      const otherEntry = collectedHashes[i];
      if (firstEntry.hash !== otherEntry.hash) {
        throw new Error(`[FAIL-CLOSED] Campos contraditórios no mesmo JSON de linkage ('${normalizedRel}'): ${firstEntry.key} (${firstEntry.hash}) diverge de ${otherEntry.key} (${otherEntry.hash}).`);
      }
    }

    validatedSources.push({
      type: 'json',
      path: normalizedRel,
      hash: firstEntry.hash
    });
  }

  // Se nenhuma fonte canónica válida foi encontrada
  if (validatedSources.length === 0) {
    if (stageName.toLowerCase().includes('intake')) {
      throw new Error(`[FAIL-CLOSED] Hash do pacote publicado no Intake ausente (input-package.sha256 / original-package.sha256).`);
    } else if (stageName.toLowerCase().includes('stage a') || stageName.toLowerCase().includes('etapa a')) {
      throw new Error(`[FAIL-CLOSED] Hash do pacote consumido pela Etapa A ausente (input-package.sha256 / original-package.sha256).`);
    } else {
      throw new Error(`[FAIL-CLOSED] Hash do pacote/entrada preservado na Etapa B ausente ou não encontrado.`);
    }
  }

  // Reconciliar estritamente todas as fontes presentes entre si (fail-closed contra qualquer contradição)
  const firstSource = validatedSources[0];
  for (let i = 1; i < validatedSources.length; i++) {
    const otherSource = validatedSources[i];
    if (firstSource.hash !== otherSource.hash) {
      if (firstSource.type === 'sidecar' && otherSource.type === 'json') {
        throw new Error(`[FAIL-CLOSED] Fontes canónicas contraditórias em ${stageName}: manifesto físico '${firstSource.path}' (${firstSource.hash}) diverge de JSON de linkage '${otherSource.path}' (${otherSource.hash}).`);
      } else if (firstSource.type === 'json' && otherSource.type === 'sidecar') {
        throw new Error(`[FAIL-CLOSED] Fontes canónicas contraditórias em ${stageName}: JSON de linkage '${firstSource.path}' (${firstSource.hash}) diverge de manifesto físico '${otherSource.path}' (${otherSource.hash}).`);
      } else if (firstSource.path.includes('input-package') && otherSource.path.includes('original-package')) {
        throw new Error(`[FAIL-CLOSED] Fontes canónicas contraditórias em ${stageName}: input-package.sha256 (${firstSource.hash}) diverge de original-package.sha256 (${otherSource.hash}).`);
      } else {
        throw new Error(`[FAIL-CLOSED] Fontes canónicas contraditórias em ${stageName}: '${firstSource.path}' (${firstSource.hash}) diverge de '${otherSource.path}' (${otherSource.hash}).`);
      }
    }
  }

  // Preservar lista dos caminhos exactos validados para permitir auditoria interna
  extractPackageHashFromBundle.lastValidatedSources = validatedSources.map(s => s.path);

  return assertStrictSha256Format(firstSource.hash, `${stageName} package hash`);
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
 * Normaliza um caminho para formato canónico relativo (separador '/', sem './', sem '..', sem barras iniciais/finais)
 */
export function normalizeCanonicalPath(rawPath) {
  if (typeof rawPath !== 'string' || !rawPath.trim()) {
    throw new Error('[FAIL-CLOSED] Caminho vazio ou inválido no índice.');
  }
  const trimmed = rawPath.trim();
  // Rejeitar caminhos absolutos (Windows e Unix)
  if (path.isAbsolute(trimmed) || /^[a-zA-Z]:[/\\]/.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('\\')) {
    throw new Error(`[FAIL-CLOSED] Caminho absoluto não permitido no índice: '${trimmed}'.`);
  }
  // Converter barras invertidas em barras normais
  const forward = trimmed.replace(/\\/g, '/');
  // Rejeitar escape por '..'
  const segments = forward.split('/');
  for (const seg of segments) {
    if (seg === '..') {
      throw new Error(`[FAIL-CLOSED] Caminho com escape ('..') não permitido no índice: '${trimmed}'.`);
    }
  }
  const cleanParts = segments.filter(s => s && s !== '.');
  if (cleanParts.length === 0) {
    throw new Error(`[FAIL-CLOSED] Caminho inválido ou raiz no índice: '${trimmed}'.`);
  }
  return cleanParts.join('/');
}

/**
 * Localiza e carrega o mapa de integridade a partir do índice SHA-256 do pacote.
 * Regras estritas:
 * - Correspondência exclusiva por caminho relativo canónico exato;
 * - Sem alias nem lookup por basename;
 * - Rejeição estrita de caminhos parciais, absolutos ou com '..';
 * - Rejeição de entradas duplicadas para o mesmo caminho canónico;
 * - Rejeição de hashes SHA-256 malformados (exige exatamente 64 hexadecimais).
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

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) {
      throw new Error(`[FAIL-CLOSED] Linha ${lineIdx + 1} malformada no índice de hashes em '${foundIndexPath}': '${line}'.`);
    }

    const expectedHash = parts[0].toLowerCase();
    if (!/^[a-f0-9]{64}$/.test(expectedHash)) {
      throw new Error(`[FAIL-CLOSED] Hash SHA-256 malformado na linha ${lineIdx + 1} do índice '${foundIndexPath}': '${parts[0]}'.`);
    }

    const rawFile = parts.slice(1).join(' ');
    const canonicalRel = normalizeCanonicalPath(rawFile);

    if (indexMap.has(canonicalRel)) {
      throw new Error(`[FAIL-CLOSED] Entrada duplicada no índice de hashes para o caminho canónico '${canonicalRel}'.`);
    }

    indexMap.set(canonicalRel, expectedHash);
  }

  return { foundIndexPath, indexMap };
}

/**
 * Valida um ficheiro físico contra o índice SHA-256 do pacote usando estritamente o caminho canónico relativo exato.
 */
export function verifyFileAgainstPackageIndex(extractDir, fullFilePath, indexMap) {
  if (!fs.existsSync(fullFilePath)) {
    throw new Error(`[FAIL-CLOSED] Ficheiro '${fullFilePath}' não existe.`);
  }

  const relativeToExtract = path.relative(extractDir, fullFilePath);
  if (relativeToExtract.startsWith('..') || path.isAbsolute(relativeToExtract)) {
    throw new Error(`[FAIL-CLOSED] Caminho do ficheiro '${fullFilePath}' escapa do diretório extraído '${extractDir}'.`);
  }

  const canonicalRel = normalizeCanonicalPath(relativeToExtract);

  const expectedHash = indexMap.get(canonicalRel);
  if (!expectedHash) {
    throw new Error(`[FAIL-CLOSED] Fonte de linkage '${canonicalRel}' presente mas não indexada no manifesto de hashes.`);
  }

  const fileBytes = fs.readFileSync(fullFilePath);
  const actualHash = sha256(fileBytes).toLowerCase();

  if (actualHash !== expectedHash.toLowerCase()) {
    throw new Error(`[FAIL-CLOSED] Hash físico da fonte de linkage '${canonicalRel}' (${actualHash}) diverge do registado no índice (${expectedHash}).`);
  }

  return { normalizedRel: canonicalRel, actualHash, match: true };
}

/**
 * Reconcilia um conjunto de pares disponíveis (run_id + artifact_id + workflow_run.id + head_sha)
 * com a referência consumida autenticada no pacote, selecionando univocamente o par correspondente.
 * Rejeita com erro fail-closed se:
 * - A referência consumida for inválida ou ausente;
 * - Nenhum par disponível corresponder à referência consumida;
 * - Houver ambiguidade ou múltiplos pares idênticos;
 * - Houver inconsistência interna no par (ex.: workflow_run_id divergente de run_id ou head_sha divergente).
 */
export function reconcileConsumedPair(availablePairs, consumedReference, stageName = 'Stage') {
  if (!consumedReference || typeof consumedReference !== 'object') {
    throw new Error(`[FAIL-CLOSED] Referência consumida inválida para ${stageName}.`);
  }

  const refRunId = Number(consumedReference.stage_a_run_id || consumedReference.intake_run_id || consumedReference.run_id);
  const refArtifactId = Number(consumedReference.stage_a_artifact_id || consumedReference.intake_artifact_id || consumedReference.artifact_id);

  if (!refRunId || isNaN(refRunId)) {
    throw new Error(`[FAIL-CLOSED] ID de run ausente na referência consumida para ${stageName}.`);
  }
  if (!refArtifactId || isNaN(refArtifactId)) {
    throw new Error(`[FAIL-CLOSED] ID de artefacto ausente na referência consumida para ${stageName}.`);
  }

  if (!Array.isArray(availablePairs) || availablePairs.length === 0) {
    throw new Error(`[FAIL-CLOSED] Lista de pares disponíveis vazia para ${stageName}.`);
  }

  for (const pair of availablePairs) {
    if (!pair || typeof pair !== 'object') {
      throw new Error(`[FAIL-CLOSED] Par disponível inválido em ${stageName}.`);
    }
    const pairRunId = Number(pair.run_id || pair.id);
    const pairArtifactId = Number(pair.artifact_id || pair.artifact?.id);
    const pairWorkflowRunId = Number(pair.workflow_run_id || pair.workflow_run?.id || pairRunId);

    if (pairRunId !== pairWorkflowRunId) {
      throw new Error(`[FAIL-CLOSED] Inconsistência no par disponível: run_id (${pairRunId}) diverge de workflow_run.id (${pairWorkflowRunId}) em ${stageName}.`);
    }
  }

  const matchingPairs = availablePairs.filter(pair => {
    const pairRunId = Number(pair.run_id || pair.id);
    const pairArtifactId = Number(pair.artifact_id || pair.artifact?.id);
    return pairRunId === refRunId && pairArtifactId === refArtifactId;
  });

  if (matchingPairs.length === 0) {
    throw new Error(`[FAIL-CLOSED] Nenhum par disponível em ${stageName} corresponde à referência consumida (run_id: ${refRunId}, artifact_id: ${refArtifactId}).`);
  }

  if (matchingPairs.length > 1) {
    throw new Error(`[FAIL-CLOSED] Ambiguidade: ${matchingPairs.length} pares disponíveis coincidem com a referência consumida em ${stageName}.`);
  }

  const selectedPair = matchingPairs[0];
  const selectedRunId = Number(selectedPair.run_id || selectedPair.id);
  const selectedArtifactId = Number(selectedPair.artifact_id || selectedPair.artifact?.id);
  const selectedHeadSha = selectedPair.head_sha || selectedPair.artifact?.workflow_run?.head_sha || null;

  const refSha = consumedReference.stage_a_head_sha || consumedReference.intake_head_sha || consumedReference.head_sha;
  if (refSha && selectedHeadSha && refSha !== selectedHeadSha) {
    throw new Error(`[FAIL-CLOSED] head_sha do par selecionado (${selectedHeadSha}) diverge da referência consumida (${refSha}) em ${stageName}.`);
  }

  return {
    run_id: selectedRunId,
    artifact_id: selectedArtifactId,
    head_sha: selectedHeadSha,
    pair: selectedPair
  };
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

  if (!fs.existsSync(zipPath)) {
    throw new Error(`[FAIL-CLOSED] Ficheiro ZIP '${zipPath}' ausente após download do artefacto '${expectedArtifactName}'.`);
  }

  const zipBytes = fs.readFileSync(zipPath);
  const zipSha = sha256(zipBytes).toLowerCase();
  assertStrictSha256Format(zipSha, `ZIP de ${expectedArtifactName}`);
  fs.writeFileSync(`${zipPath}.sha256`, `${zipSha}  ${path.basename(zipPath)}\n`, 'utf8');
  verifySidecarHash(zipPath, `${zipPath}.sha256`, `ZIP de ${expectedArtifactName}`);
  auditAndExtractZip(zipPath, extractDir);

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

export const MANDATORY_VERIFICATION_STATE_KEYS = [
  'canonical_repository_chain_verified',
  'intake_package_hash_verified',
  'stage_a_input_hash_verified',
  'stage_b_preserved_hash_verified',
  'cross_stage_package_hash_reconciled',
  'api_response_hashes_verified',
  'evidence_index_hashes_verified',
  'artifact_zip_hashes_computed',
  'same_sha_chain_verified'
];

/**
 * Gate de Estados Obrigatórios de Verificação (Micro-Patch Final)
 * Valida estritamente que todos os estados obrigatórios são exactamente `true` (boolean).
 * Rejeita categoricamente `false`, `null`, `undefined`, zero, strings (incluindo "true"),
 * NaN ou campos ausentes. Lança erro fail-closed identificando explicitamente todos os estados não comprovados.
 */
export function assertMandatoryVerificationStates(states) {
  if (!states || typeof states !== 'object' || Array.isArray(states)) {
    throw new Error('[FAIL-CLOSED] Objeto de estados de verificação obrigatórios ausente ou inválido.');
  }

  const unprovenStates = [];
  for (const key of MANDATORY_VERIFICATION_STATE_KEYS) {
    if (!(key in states)) {
      unprovenStates.push(`${key} (campo ausente)`);
    } else if (states[key] !== true) {
      const val = states[key];
      const valDesc = val === null ? 'null' : val === undefined ? 'undefined' : typeof val === 'string' ? `"${val}"` : String(val);
      unprovenStates.push(`${key}=${valDesc}`);
    }
  }

  if (unprovenStates.length > 0) {
    throw new Error(`[FAIL-CLOSED] Estados obrigatórios de verificação não comprovados: ${unprovenStates.join(', ')}.`);
  }

  return true;
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

    const stageBPreservedSha = extractPackageHashFromBundle(stageBExtractDir, 'Stage B');
    const stage_b_preserved_hash_verified = Boolean(stageBPreservedSha && /^[a-f0-9]{64}$/.test(stageBPreservedSha));
    recordCheck('STAGE_B_PRESERVED_HASH_VALID', String(runBData.id), String(stageBBundle.artifact.id), 'input-package.sha256', stageBPreservedSha,
      stage_b_preserved_hash_verified ? 'PASS' : 'FAIL', `hash=${stageBPreservedSha.slice(0, 16)}...`);

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

    const availableStageAPairs = [{
      run_id: Number(stageARun.id),
      artifact_id: Number(stageABundle.artifact.id),
      workflow_run_id: Number(stageABundle.artifact.workflow_run?.id || stageARun.id),
      head_sha: stageARun.head_sha
    }];
    const resolvedStageAPair = reconcileConsumedPair(availableStageAPairs, stageALinkage, 'Etapa A');

    recordCheck('STAGE_A_ARTIFACT_DOWNLOADED', String(stageARun.id), String(stageABundle.artifact.id), expectedStageAArtifactName, stageABundle.zipSha,
      stageABundle.extractedFiles.length > 0 ? 'PASS' : 'FAIL',
      `${stageABundle.extractedFiles.length} ficheiros extraídos`);

    const stageAInputSha = extractPackageHashFromBundle(stageABundle.extractDir, 'Stage A');
    const stage_a_input_hash_verified = Boolean(stageAInputSha && /^[a-f0-9]{64}$/.test(stageAInputSha));
    recordCheck('STAGE_A_INPUT_HASH_VALID', String(stageARun.id), String(stageABundle.artifact.id), 'input-package.sha256', stageAInputSha,
      stage_a_input_hash_verified ? 'PASS' : 'FAIL', `hash=${stageAInputSha.slice(0, 16)}...`);

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

    const availableIntakePairs = [{
      run_id: Number(intakeRun.id),
      artifact_id: Number(intakeBundle.artifact.id),
      workflow_run_id: Number(intakeBundle.artifact.workflow_run?.id || intakeRun.id),
      head_sha: intakeRun.head_sha
    }];
    const resolvedIntakePair = reconcileConsumedPair(availableIntakePairs, intakeLinkage, 'Intake');

    recordCheck('INTAKE_ARTIFACT_DOWNLOADED', String(intakeRun.id), String(intakeBundle.artifact.id), expectedIntakeArtifactName, intakeBundle.zipSha,
      intakeBundle.extractedFiles.length > 0 ? 'PASS' : 'FAIL',
      `${intakeBundle.extractedFiles.length} ficheiros extraídos`);

    const intakePackageSha = extractPackageHashFromBundle(intakeBundle.extractDir, 'Intake');
    const intake_package_hash_verified = Boolean(intakePackageSha && /^[a-f0-9]{64}$/.test(intakePackageSha));
    recordCheck('INTAKE_PACKAGE_HASH_VALID', String(intakeRun.id), String(intakeBundle.artifact.id), 'input-package.sha256', intakePackageSha,
      intake_package_hash_verified ? 'PASS' : 'FAIL', `hash=${intakePackageSha.slice(0, 16)}...`);

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

    validateRunRepositoryIdentity(ciRun, 'CI');

    recordCheck('CI_RUN_EXISTS', String(ciRun.id), 'N/A', 'ci-run-api-response.json', sha256(ciRunBytes),
      'PASS', `head_sha=${ciRun.head_sha}, branch=${ciRun.head_branch}`);

    recordCheck('CI_RUN_CONCLUSION_SUCCESS', String(ciRun.id), 'N/A', 'ci-run-api-response.json', sha256(ciRunBytes),
      'PASS', `status=${ciRun.status}, conclusion=${ciRun.conclusion}`);

    recordCheck('CI_RUN_CANONICAL_REPO', String(ciRun.id), 'N/A', 'ci-run-api-response.json', sha256(ciRunBytes),
      'PASS', `repo_id=${ciRun.repository?.id}, head_repo_id=${ciRun.head_repository?.id}`);

    // -------------------------------------------------------------------------
    // 5. Reconciliação Direta Cruzada entre as Três Etapas e Verdade dos Hashes
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

    // Reconciliação transversal estrita dos 3 hashes de pacote
    reconcilePackageHashes(intakePackageSha, stageAInputSha, stageBPreservedSha);
    const cross_stage_package_hash_reconciled = Boolean(
      intake_package_hash_verified &&
      stage_a_input_hash_verified &&
      stage_b_preserved_hash_verified &&
      intakePackageSha === stageAInputSha &&
      stageAInputSha === stageBPreservedSha
    );

    recordCheck('PACKAGE_HASH_RECONCILED', String(intakeRun.id), String(stageABundle.artifact.id), 'input-package.sha256', intakePackageSha,
      cross_stage_package_hash_reconciled ? 'PASS' : 'FAIL',
      `intake=${intakePackageSha.slice(0, 16)}... === stage_a=${stageAInputSha.slice(0, 16)}... === stage_b=${stageBPreservedSha.slice(0, 16)}...`);

    // Validação estrita dos sidecars das respostas de API
    const apiFilesToVerify = [
      'stage-b-run-api-response.json',
      'stage-b-artifact-api-response.json',
      'stage-a-run-api-response.json',
      'stage-a-artifact-api-response.json',
      'intake-run-api-response.json',
      'intake-artifact-api-response.json',
      'ci-run-api-response.json'
    ];

    for (const apiFile of apiFilesToVerify) {
      const fPath = path.join(outDir, apiFile);
      const sPath = path.join(outDir, `${apiFile}.sha256`);
      verifySidecarHash(fPath, sPath, `API response ${apiFile}`);
    }
    const api_response_hashes_verified = true;

    recordCheck('API_RESPONSE_HASHES_VERIFIED', 'N/A', 'N/A', 'api responses', 'N/A',
      'PASS', `${apiFilesToVerify.length} respostas de API com sidecars verificados fisicamente`);

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

    const { foundIndexPath: indexPath, indexMap } = loadPackageIndexMap(stageBExtractDir);
    let checkedHashes = 0;
    for (const [canonicalFile] of indexMap.entries()) {
      const filePath = path.join(stageBExtractDir, canonicalFile);
      verifyFileAgainstPackageIndex(stageBExtractDir, filePath, indexMap);
      checkedHashes++;
    }

    if (checkedHashes === 0 || checkedHashes !== indexMap.size) {
      throw new Error(`[FAIL-CLOSED] Inconsistência na verificação física do índice: ${checkedHashes}/${indexMap.size} entradas verificadas.`);
    }

    const evidence_index_hashes_verified = true;

    recordCheck('PHYSICAL_HASH_INTEGRITY', String(runBData.id), String(stageBBundle.artifact.id), 'pilot-evidence-files.sha256', sha256(fs.readFileSync(indexPath)),
      evidence_index_hashes_verified ? 'PASS' : 'FAIL',
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

    // Identidade Canónica Estrita nos 4 Runs
    verifyCanonicalRepositoryChain(ciRun, intakeRun, stageARun, runBData);
    const ci_repository_identity_verified = true;
    const intake_repository_identity_verified = true;
    const stage_a_repository_identity_verified = true;
    const stage_b_repository_identity_verified = true;
    const canonical_repository_chain_verified = true;

    // Hashes dos ZIPs computados e validados
    const artifact_zip_hashes_computed = Boolean(
      /^[a-f0-9]{64}$/.test(intakeBundle.zipSha) &&
      /^[a-f0-9]{64}$/.test(stageABundle.zipSha) &&
      /^[a-f0-9]{64}$/.test(stageBBundle.zipSha)
    );

    const isCiCompleted = ciRun.status === 'completed';
    const isCiSuccess = ciRun.conclusion === 'success';
    const isCiSameSha = ciRun.head_sha === sourceSha;

    const ci_verified = Boolean(
      ciRun &&
      isCiCompleted &&
      isCiSuccess &&
      isCiSameSha &&
      ci_repository_identity_verified &&
      ciRun.path === '.github/workflows/ci.yml'
    );

    const isIntakeCompleted = intakeRun.status === 'completed';
    const isIntakeSuccess = intakeRun.conclusion === 'success';
    const isIntakeSameSha = intakeRun.head_sha === sourceSha;

    const intake_verified = Boolean(
      intakeRun &&
      isIntakeCompleted &&
      isIntakeSuccess &&
      isIntakeSameSha &&
      intake_repository_identity_verified &&
      intakeBundle &&
      intakeBundle.extractedFiles.length > 0 &&
      intake_package_hash_verified
    );

    const isStageACompleted = stageARun.status === 'completed';
    const isStageASuccess = stageARun.conclusion === 'success';
    const isStageASameSha = stageARun.head_sha === sourceSha;

    const stage_a_verified = Boolean(
      stageARun &&
      isStageACompleted &&
      isStageASuccess &&
      isStageASameSha &&
      stage_a_repository_identity_verified &&
      stageABundle &&
      stageABundle.extractedFiles.length > 0 &&
      Boolean(stageAChallengeId) &&
      stage_a_input_hash_verified
    );

    const isStageBCompleted = runBData.status === 'completed';
    const isStageBSuccess = runBData.conclusion === 'success';
    const isStageBSameSha = runBData.head_sha === sourceSha;

    const stage_b_verified = Boolean(
      runBData &&
      isStageBCompleted &&
      isStageBSuccess &&
      isStageBSameSha &&
      stage_b_repository_identity_verified &&
      stageBBundle &&
      stageBBundle.extractedFiles.length > 0 &&
      stageBChallengeId === stageAChallengeId &&
      evidence_index_hashes_verified &&
      stage_b_preserved_hash_verified
    );

    const cross_stages_reconciled = Boolean(
      intake_verified &&
      stage_a_verified &&
      stage_b_verified &&
      stageAChallengeId === stageBChallengeId &&
      stageAChallengeId !== '' &&
      cross_stage_package_hash_reconciled
    );

    const same_sha_chain_verified = Boolean(
      ci_verified &&
      intake_verified &&
      stage_a_verified &&
      stage_b_verified &&
      cross_stages_reconciled &&
      canonical_repository_chain_verified &&
      cross_stage_package_hash_reconciled &&
      api_response_hashes_verified &&
      evidence_index_hashes_verified &&
      artifact_zip_hashes_computed &&
      ciRun.head_sha === sourceSha &&
      intakeRun.head_sha === sourceSha &&
      stageARun.head_sha === sourceSha &&
      runBData.head_sha === sourceSha
    );

    // 7. Gate Estrito de Estados Obrigatórios de Verificação (Micro-Patch Final)
    const verificationStates = {
      canonical_repository_chain_verified,
      intake_package_hash_verified,
      stage_a_input_hash_verified,
      stage_b_preserved_hash_verified,
      cross_stage_package_hash_reconciled,
      api_response_hashes_verified,
      evidence_index_hashes_verified,
      artifact_zip_hashes_computed,
      same_sha_chain_verified
    };

    assertMandatoryVerificationStates(verificationStates);

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
      ci_repository_identity_verified,
      intake_repository_identity_verified,
      stage_a_repository_identity_verified,
      stage_b_repository_identity_verified,
      canonical_repository_chain_verified,
      intake_package_hash_verified,
      stage_a_input_hash_verified,
      stage_b_preserved_hash_verified,
      cross_stage_package_hash_reconciled,
      api_response_hashes_verified,
      evidence_index_hashes_verified,
      artifact_zip_hashes_computed,
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

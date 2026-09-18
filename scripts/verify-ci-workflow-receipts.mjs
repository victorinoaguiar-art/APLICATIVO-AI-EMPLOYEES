#!/usr/bin/env node
/**
 * scripts/verify-ci-workflow-receipts.mjs
 *
 * Verificador read-only fortemente tipado dos recibos brutos da API dos workflows de CI do GitHub Actions.
 *
 * Valida:
 * 1. Os 3 recibos físicos de runs (CI principal, Evidence Remote, Final Forensic).
 * 2. Os 3 recibos físicos de jobs (presença de jobs obrigatórios, status completed, conclusion success, timestamps).
 * 3. Os 3 recibos físicos de artefactos (existência de artefactos obrigatórios, expired === false, size > 0, SHA e run_id).
 * 4. Mesmíssimo head_sha de 40 caracteres hexadecimais em todos os workflows.
 * 5. Validação estrita de repository.full_name, run_attempt (inteiro >= 1 sem fallback), run IDs e URLs.
 * 6. Coerência com o SHA final auditado no relatório e rejeição estrita de conclusões antecipadas.
 * 7. Verificação de integridade física contra o manifesto files.sha256.
 * 8. Zero fallbacks permissivos.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

export const REQUIRED_WORKFLOW_FILES = [
  'workflow-run-ci-readiness.json',
  'workflow-run-evidence-remote.json',
  'workflow-run-final-forensic.json'
];

export const REQUIRED_JOB_FILES = [
  'workflow-jobs-ci-readiness.json',
  'workflow-jobs-evidence-remote.json',
  'workflow-jobs-final-forensic.json'
];

export const REQUIRED_ARTIFACT_FILES = [
  'workflow-artifacts-ci-readiness.json',
  'workflow-artifacts-evidence-remote.json',
  'workflow-artifacts-final-forensic.json'
];

export const ALL_NINE_RECEIPT_FILES = [
  ...REQUIRED_WORKFLOW_FILES,
  ...REQUIRED_JOB_FILES,
  ...REQUIRED_ARTIFACT_FILES
];

export const REQUIRED_REPOSITORY = 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';

export const EXPECTED_WORKFLOW_SPEC = {
  'workflow-run-ci-readiness.json': {
    exactName: 'CI / Production Readiness & Audit Gate',
    expectedPath: '.github/workflows/ci.yml'
  },
  'workflow-run-evidence-remote.json': {
    exactName: 'Evidence Remote Verification',
    expectedPath: '.github/workflows/evidence-remote-verification.yml'
  },
  'workflow-run-final-forensic.json': {
    exactName: 'Final Forensic Attestation & Audit Verification',
    expectedPath: '.github/workflows/final-attestation.yml'
  }
};

export const EXPECTED_JOBS_SPEC = {
  'workflow-jobs-ci-readiness.json': {
    runFile: 'workflow-run-ci-readiness.json',
    requiredJobNames: [
      'Clean Checkout Local Verification (22.x)',
      'Deterministic Build, Typecheck, Test & Audit (22.x)'
    ]
  },
  'workflow-jobs-evidence-remote.json': {
    runFile: 'workflow-run-evidence-remote.json',
    requiredJobNames: [
      'Remote Evidence Verification Gate'
    ]
  },
  'workflow-jobs-final-forensic.json': {
    runFile: 'workflow-run-final-forensic.json',
    requiredJobNames: [
      'Final Forensic Attestation Gate'
    ]
  }
};

export const EXPECTED_ARTIFACTS_SPEC = {
  'workflow-artifacts-ci-readiness.json': {
    runFile: 'workflow-run-ci-readiness.json',
    requiredArtifactPrefix: 'aetf-evidence-bundle-'
  },
  'workflow-artifacts-evidence-remote.json': {
    runFile: 'workflow-run-evidence-remote.json',
    requiredArtifactPrefix: 'aetf-verified-remote-evidence-bundle-'
  },
  'workflow-artifacts-final-forensic.json': {
    runFile: 'workflow-run-final-forensic.json',
    requiredArtifactPrefix: 'aetf-final-attestation-'
  }
};

export function validateRunAttempt(val, context = 'run_attempt') {
  if (val === undefined || val === null) {
    throw new Error(`[FAIL-CLOSED] ${context} é obrigatório e não pode ser nulo ou ausente.`);
  }
  const strVal = String(val).trim();
  if (strVal === '') {
    throw new Error(`[FAIL-CLOSED] ${context} não pode ser string vazia.`);
  }
  if (!/^[1-9]\d*$/.test(strVal)) {
    throw new Error(`[FAIL-CLOSED] ${context} deve ser um número inteiro >= 1 sem fallback. Obtido: ${JSON.stringify(val)}.`);
  }
  const num = Number(strVal);
  if (!Number.isSafeInteger(num) || num < 1) {
    throw new Error(`[FAIL-CLOSED] ${context} inválido: ${val}.`);
  }
  return num;
}

export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

export function validateSingleWorkflowReceipt(receipt, filename, expectedSha) {
  if (!receipt || typeof receipt !== 'object') {
    throw new Error(`Recibo '${filename}' inválido: conteúdo não é um objeto JSON.`);
  }

  // Especificação esperada para este ficheiro
  const spec = EXPECTED_WORKFLOW_SPEC[filename];
  if (!spec) {
    throw new Error(`Recibo '${filename}' não é um dos 3 ficheiros de workflow esperados (${REQUIRED_WORKFLOW_FILES.join(', ')}).`);
  }

  // ID
  if (typeof receipt.id !== 'number' || !Number.isInteger(receipt.id) || receipt.id <= 0) {
    throw new Error(`Recibo '${filename}' inválido: 'id' deve ser inteiro positivo, obtido ${JSON.stringify(receipt.id)}.`);
  }

  // Name
  if (!receipt.name || typeof receipt.name !== 'string' || receipt.name.trim() === '') {
    throw new Error(`Recibo '${filename}' inválido: 'name' obrigatório e não-vazio.`);
  }
  if (receipt.name !== spec.exactName) {
    throw new Error(`Recibo '${filename}' possui 'name' inválido: esperado estritamente '${spec.exactName}', obtido '${receipt.name}'.`);
  }

  // Workflow path / workflow_id
  const wfPath = receipt.path;
  if (!wfPath || typeof wfPath !== 'string' || !wfPath.endsWith(spec.expectedPath)) {
    throw new Error(`Recibo '${filename}' possui 'path' de workflow ausente ou inválido: esperado '${spec.expectedPath}', obtido ${JSON.stringify(wfPath)}.`);
  }

  // Repository
  const repoName = receipt.repository?.full_name;
  if (repoName !== REQUIRED_REPOSITORY) {
    throw new Error(`Recibo '${filename}' pertence ao repositório '${repoName}', esperado estritamente '${REQUIRED_REPOSITORY}'.`);
  }

  // Head SHA
  const headSha = receipt.head_sha;
  if (!headSha || typeof headSha !== 'string' || !/^[0-9a-f]{40}$/i.test(headSha)) {
    throw new Error(`Recibo '${filename}' com 'head_sha' inválido: esperado 40 caracteres hexadecimais, obtido ${JSON.stringify(headSha)}.`);
  }

  if (expectedSha) {
    if (headSha.toLowerCase() !== expectedSha.toLowerCase()) {
      throw new Error(`Recibo '${filename}' possui head_sha '${headSha}' divergente do esperado '${expectedSha}'.`);
    }
  }

  // Head Branch
  if (!receipt.head_branch || receipt.head_branch !== 'master') {
    throw new Error(`Recibo '${filename}' possui head_branch '${receipt.head_branch}', esperado estritamente 'master'.`);
  }

  // Status e Conclusion (sem fallback)
  if (receipt.status !== 'completed') {
    throw new Error(`Recibo '${filename}' (ID: ${receipt.id}) possui status '${receipt.status}', esperado estritamente 'completed'.`);
  }
  if (receipt.conclusion !== 'success') {
    throw new Error(`Recibo '${filename}' (ID: ${receipt.id}) possui conclusion '${receipt.conclusion}', esperado estritamente 'success'.`);
  }

  // Run attempt (estritamente validado sem fallback)
  const runAttempt = validateRunAttempt(receipt.run_attempt, `Recibo '${filename}' 'run_attempt'`);

  // Event
  if (!receipt.event || typeof receipt.event !== 'string') {
    throw new Error(`Recibo '${filename}' possui 'event' ausente ou inválido.`);
  }

  // Timestamps
  for (const tsField of ['created_at', 'run_started_at', 'updated_at']) {
    const val = receipt[tsField];
    if (!val || typeof val !== 'string' || isNaN(Date.parse(val))) {
      throw new Error(`Recibo '${filename}' possui '${tsField}' ausente ou timestamp ISO inválido: ${JSON.stringify(val)}.`);
    }
  }

  // HTML URL
  if (
    !receipt.html_url ||
    typeof receipt.html_url !== 'string' ||
    !receipt.html_url.startsWith(`https://github.com/${REQUIRED_REPOSITORY}/actions/runs/${receipt.id}`)
  ) {
    throw new Error(`Recibo '${filename}' possui 'html_url' inválido ou incoerente com o run ID: ${JSON.stringify(receipt.html_url)}.`);
  }

  return {
    id: receipt.id,
    name: receipt.name,
    workflow_path: wfPath,
    head_sha: headSha.toLowerCase(),
    head_branch: receipt.head_branch,
    run_attempt: runAttempt,
    status: receipt.status,
    conclusion: receipt.conclusion,
    event: receipt.event,
    html_url: receipt.html_url,
    created_at: receipt.created_at,
    updated_at: receipt.updated_at
  };
}

export function validateSingleJobsReceipt(jobsData, filename, expectedRunId) {
  if (!jobsData || typeof jobsData !== 'object') {
    throw new Error(`Recibo de jobs '${filename}' inválido: conteúdo não é um objeto JSON.`);
  }

  const spec = EXPECTED_JOBS_SPEC[filename];
  if (!spec) {
    throw new Error(`Recibo de jobs '${filename}' não é um dos ficheiros esperados (${REQUIRED_JOB_FILES.join(', ')}).`);
  }

  const jobs = jobsData.jobs;
  if (!Array.isArray(jobs) || jobs.length === 0) {
    throw new Error(`Recibo de jobs '${filename}' deve conter array 'jobs' não vazio.`);
  }

  if (jobsData.total_count !== jobs.length) {
    throw new Error(`Recibo de jobs '${filename}' possui total_count (${jobsData.total_count}) divergente da contagem de jobs (${jobs.length}).`);
  }

  const jobIds = new Set();
  const foundNames = new Set();

  for (const job of jobs) {
    if (typeof job.id !== 'number' || !Number.isInteger(job.id) || job.id <= 0) {
      throw new Error(`Job em '${filename}' possui ID inválido: ${JSON.stringify(job.id)}.`);
    }
    if (jobIds.has(job.id)) {
      throw new Error(`Job ID duplicado ${job.id} detectado em '${filename}'.`);
    }
    jobIds.add(job.id);

    if (job.run_id !== undefined && job.run_id !== expectedRunId) {
      throw new Error(`Job '${job.name}' (ID: ${job.id}) em '${filename}' pertence a run_id '${job.run_id}', esperado '${expectedRunId}'.`);
    }

    if (job.status !== 'completed') {
      throw new Error(`Job '${job.name}' (ID: ${job.id}) em '${filename}' possui status '${job.status}', esperado estritamente 'completed'.`);
    }
    if (job.conclusion !== 'success') {
      throw new Error(`Job '${job.name}' (ID: ${job.id}) em '${filename}' possui conclusion '${job.conclusion}', esperado estritamente 'success'.`);
    }

    // Timestamps
    const started = Date.parse(job.started_at);
    const completed = Date.parse(job.completed_at);
    if (isNaN(started) || isNaN(completed)) {
      throw new Error(`Job '${job.name}' em '${filename}' possui timestamps inválidos.`);
    }
    if (completed < started) {
      throw new Error(`Job '${job.name}' em '${filename}' possui completed_at anterior a started_at.`);
    }

    // Steps
    if (Array.isArray(job.steps)) {
      for (const step of job.steps) {
        if (step.conclusion === 'failure') {
          throw new Error(`Passo '${step.name}' no job '${job.name}' falhou em '${filename}'.`);
        }
      }
    }

    foundNames.add(job.name);
  }

  // Verificar presença de jobs obrigatórios
  for (const reqName of spec.requiredJobNames) {
    if (!foundNames.has(reqName)) {
      throw new Error(`Job obrigatório '${reqName}' ausente em '${filename}'. Encontrados: ${Array.from(foundNames).join(', ')}.`);
    }
  }

  return jobs;
}

export function validateSingleArtifactsReceipt(artifactsData, filename, expectedRunId, expectedSha) {
  if (!artifactsData || typeof artifactsData !== 'object') {
    throw new Error(`Recibo de artefactos '${filename}' inválido: conteúdo não é um objeto JSON.`);
  }

  const spec = EXPECTED_ARTIFACTS_SPEC[filename];
  if (!spec) {
    throw new Error(`Recibo de artefactos '${filename}' não é um dos ficheiros esperados (${REQUIRED_ARTIFACT_FILES.join(', ')}).`);
  }

  const artifacts = artifactsData.artifacts;
  if (!Array.isArray(artifacts)) {
    throw new Error(`Recibo de artefactos '${filename}' deve conter array 'artifacts'.`);
  }

  if (artifactsData.total_count !== artifacts.length) {
    throw new Error(`Recibo de artefactos '${filename}' possui total_count (${artifactsData.total_count}) divergente da contagem (${artifacts.length}).`);
  }

  const artifactIds = new Set();
  let foundRequired = false;

  for (const art of artifacts) {
    if (typeof art.id !== 'number' || !Number.isInteger(art.id) || art.id <= 0) {
      throw new Error(`Artefacto em '${filename}' possui ID inválido: ${JSON.stringify(art.id)}.`);
    }
    if (artifactIds.has(art.id)) {
      throw new Error(`Artefacto ID duplicado ${art.id} detectado em '${filename}'.`);
    }
    artifactIds.add(art.id);

    if (art.expired !== false) {
      throw new Error(`Artefacto '${art.name}' (ID: ${art.id}) em '${filename}' está expirado (expired !== false).`);
    }

    if (typeof art.size_in_bytes !== 'number' || art.size_in_bytes <= 0) {
      throw new Error(`Artefacto '${art.name}' (ID: ${art.id}) em '${filename}' possui tamanho inválido: ${art.size_in_bytes}.`);
    }

    if (art.workflow_run) {
      if (art.workflow_run.id !== undefined && art.workflow_run.id !== expectedRunId) {
        throw new Error(`Artefacto '${art.name}' em '${filename}' associado a run_id '${art.workflow_run.id}', esperado '${expectedRunId}'.`);
      }
      if (art.workflow_run.head_sha && art.workflow_run.head_sha.toLowerCase() !== expectedSha.toLowerCase()) {
        throw new Error(`Artefacto '${art.name}' em '${filename}' associado a SHA '${art.workflow_run.head_sha}', esperado '${expectedSha}'.`);
      }
      if (art.workflow_run.head_branch && art.workflow_run.head_branch !== 'master') {
        throw new Error(`Artefacto '${art.name}' em '${filename}' associado a branch '${art.workflow_run.head_branch}', esperado 'master'.`);
      }
    }

    // Verificar se corresponde ao padrão obrigatório
    const expectedFullName = `${spec.requiredArtifactPrefix}${expectedSha.toLowerCase()}`;
    if (art.name === expectedFullName || art.name.startsWith(spec.requiredArtifactPrefix)) {
      if (art.name.endsWith(expectedSha.toLowerCase()) || art.name === expectedFullName) {
        foundRequired = true;
      }
    }
  }

  if (!foundRequired) {
    throw new Error(`Artefacto obrigatório com prefixo '${spec.requiredArtifactPrefix}' e SHA '${expectedSha}' ausente em '${filename}'.`);
  }

  return artifacts;
}

export function verifyWorkflowReceipts(options) {
  const { receiptsDir, expectedSha, reportPath, requireNineFiles } = options;

  if (!receiptsDir) {
    throw new Error('Directório de recibos (--receipts-dir) obrigatório.');
  }
  if (!fs.existsSync(receiptsDir)) {
    throw new Error(`Directório de recibos '${receiptsDir}' não existe no filesystem.`);
  }

  if (expectedSha) {
    if (!/^[0-9a-f]{40}$/i.test(expectedSha)) {
      throw new Error(`expectedSha inválido: esperado 40 caracteres hexadecimais, obtido '${expectedSha}'.`);
    }
  }

  const results = [];
  let commonSha = null;
  const runIdByFile = {};

  // 1. Validar recibos de runs
  for (const filename of REQUIRED_WORKFLOW_FILES) {
    const filePath = path.join(receiptsDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Recibo obrigatório '${filename}' ausente em '${receiptsDir}'. Todos os recibos devem existir fisicamente.`);
    }

    const rawBytes = fs.readFileSync(filePath);
    if (rawBytes.length === 0) {
      throw new Error(`Recibo '${filename}' em '${filePath}' está vazio (0 bytes).`);
    }

    let parsed;
    try {
      parsed = JSON.parse(rawBytes.toString('utf8'));
    } catch (err) {
      throw new Error(`Recibo '${filename}' contém JSON inválido ou corrompido: ${err.message}`);
    }

    const validated = validateSingleWorkflowReceipt(parsed, filename, expectedSha);

    if (commonSha === null) {
      commonSha = validated.head_sha;
    } else if (commonSha !== validated.head_sha) {
      throw new Error(`Divergência de head_sha entre workflows: '${results[0].filename}' usa '${commonSha}' enquanto '${filename}' usa '${validated.head_sha}'.`);
    }

    runIdByFile[filename] = validated.id;

    results.push({
      filename,
      filePath,
      fileSha256: sha256(rawBytes),
      fileSizeBytes: rawBytes.length,
      ...validated
    });
  }

  // Validação de unicidade
  const uniqueIds = new Set(results.map(r => r.id));
  if (uniqueIds.size !== results.length) {
    throw new Error(`Recibos duplicados detectados: os 3 ficheiros devem corresponder a execuções com IDs distintos, obtidos ${results.map(r => r.id).join(', ')}.`);
  }
  const uniqueNames = new Set(results.map(r => r.name));
  if (uniqueNames.size !== results.length) {
    throw new Error(`Recibos duplicados detectados: os 3 ficheiros devem corresponder aos 3 workflows distintos.`);
  }

  // 2. Validar ficheiros de jobs e artefactos (quando presentes ou quando requireNineFiles === true)
  let jobsCount = 0;
  let artifactsCount = 0;

  const hasJobFiles = REQUIRED_JOB_FILES.some(f => fs.existsSync(path.join(receiptsDir, f)));
  const hasArtifactFiles = REQUIRED_ARTIFACT_FILES.some(f => fs.existsSync(path.join(receiptsDir, f)));

  if (requireNineFiles || hasJobFiles || hasArtifactFiles) {
    // Validar os 3 ficheiros de jobs
    for (const jobFilename of REQUIRED_JOB_FILES) {
      const jobFilePath = path.join(receiptsDir, jobFilename);
      if (!fs.existsSync(jobFilePath)) {
        throw new Error(`Ficheiro de jobs obrigatório '${jobFilename}' ausente em '${receiptsDir}'.`);
      }
      const rawJobBytes = fs.readFileSync(jobFilePath);
      if (rawJobBytes.length === 0) {
        throw new Error(`Ficheiro de jobs '${jobFilename}' está vazio.`);
      }
      const parsedJobData = JSON.parse(rawJobBytes.toString('utf8'));
      const spec = EXPECTED_JOBS_SPEC[jobFilename];
      const expectedRunId = runIdByFile[spec.runFile];
      const validatedJobs = validateSingleJobsReceipt(parsedJobData, jobFilename, expectedRunId);
      jobsCount += validatedJobs.length;
    }

    // Validar os 3 ficheiros de artefactos
    for (const artFilename of REQUIRED_ARTIFACT_FILES) {
      const artFilePath = path.join(receiptsDir, artFilename);
      if (!fs.existsSync(artFilePath)) {
        throw new Error(`Ficheiro de artefactos obrigatório '${artFilename}' ausente em '${receiptsDir}'.`);
      }
      const rawArtBytes = fs.readFileSync(artFilePath);
      if (rawArtBytes.length === 0) {
        throw new Error(`Ficheiro de artefactos '${artFilename}' está vazio.`);
      }
      const parsedArtData = JSON.parse(rawArtBytes.toString('utf8'));
      const spec = EXPECTED_ARTIFACTS_SPEC[artFilename];
      const expectedRunId = runIdByFile[spec.runFile];
      const validatedArtifacts = validateSingleArtifactsReceipt(parsedArtData, artFilename, expectedRunId, commonSha);
      artifactsCount += validatedArtifacts.length;
    }
  }

  // 3. Validação do manifesto files.sha256 se presente
  const shaManifestPath = path.join(receiptsDir, 'files.sha256');
  if (fs.existsSync(shaManifestPath)) {
    const manifestContent = fs.readFileSync(shaManifestPath, 'utf8');
    const lines = manifestContent.trim().split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const [expectedHash, targetFilename] = trimmed.split(/\s+/);
      const targetFilePath = path.join(receiptsDir, targetFilename);
      if (!fs.existsSync(targetFilePath)) {
        throw new Error(`Manifesto 'files.sha256' referencia ficheiro inexistente: '${targetFilename}'.`);
      }
      const actualHash = sha256(fs.readFileSync(targetFilePath));
      if (actualHash !== expectedHash) {
        throw new Error(`Divergência de hash SHA-256 no manifesto para '${targetFilename}': esperado '${expectedHash}', obtido '${actualHash}'.`);
      }
    }
  }

  // 4. Validação estrita e obrigatória de coerência com o relatório quando reportPath for fornecido
  if (reportPath) {
    if (!fs.existsSync(reportPath)) {
      throw new Error(`Ficheiro de relatório '${reportPath}' não encontrado.`);
    }
    const reportContent = fs.readFileSync(reportPath, 'utf8');

    // Rejeitar expressamente declaração prematura de conclusão do 4º workflow dentro do relatório
    if (/FOUR_WORKFLOWS_CONFIRMED|FOUR_GITHUB_WORKFLOWS_CONFIRMED_ON_SAME_SHA/i.test(reportContent)) {
      throw new Error(`O relatório '${reportPath}' contém declaração prematura de conclusão do 4º workflow ('FOUR_WORKFLOWS_CONFIRMED'). O relatório gerado deve declarar empacotamento em curso ('THREE_PRECEDING_WORKFLOWS_VERIFIED — POST_CLOSURE_PACKAGING_EXECUTING_ON_SAME_SHA').`);
    }

    // Rejeitar expressamente placeholders proibidos nos campos de SHA
    const placeholderMatch =
      reportContent.match(/(?:final_audited_sha|closure_patch_sha|implementation_sha)[^:\r\n]*[:\s`*]+(A ser gerado[^`\n\r]*|PENDING|UNKNOWN|\?+)/i);
    if (placeholderMatch) {
      throw new Error(`O relatório '${reportPath}' contém placeholder não resolvido para o SHA: '${placeholderMatch[0]}'.`);
    }

    const shaMatch =
      reportContent.match(/final_audited_sha[^0-9a-f\r\n]{1,30}([0-9a-f]{40})/i) ||
      reportContent.match(/Commit SHA Final[^0-9a-f\r\n]{1,30}([0-9a-f]{40})/i);

    if (!shaMatch) {
      throw new Error(`O relatório '${reportPath}' não contém um 'final_audited_sha' válido de 40 caracteres hexadecimais.`);
    }

    const reportSha = shaMatch[1].toLowerCase();
    if (reportSha !== commonSha) {
      throw new Error(`Divergência entre o SHA do relatório ('${reportSha}') e o head_sha dos recibos de CI ('${commonSha}').`);
    }
  }

  return {
    verified: true,
    commonHeadSha: commonSha,
    workflowCount: results.length,
    workflows: results,
    jobsValidatedCount: jobsCount,
    artifactsValidatedCount: artifactsCount
  };
}

import { fileURLToPath } from 'node:url';

// CLI Execution
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  let receiptsDir = '';
  let expectedSha = '';
  let reportPath = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--dir' || arg === '--receipts-dir') {
      receiptsDir = args[++i];
    } else if (arg.startsWith('--dir=')) {
      receiptsDir = arg.slice('--dir='.length);
    } else if (arg.startsWith('--receipts-dir=')) {
      receiptsDir = arg.slice('--receipts-dir='.length);
    } else if (arg === '--expected-sha') {
      expectedSha = args[++i];
    } else if (arg.startsWith('--expected-sha=')) {
      expectedSha = arg.slice('--expected-sha='.length);
    } else if (arg === '--report') {
      reportPath = args[++i];
    } else if (arg.startsWith('--report=')) {
      reportPath = arg.slice('--report='.length);
    }
  }

  if (!receiptsDir) {
    receiptsDir = path.join(process.cwd(), '.artifacts', 'evidence', 'ci');
  }

  try {
    const res = verifyWorkflowReceipts({ receiptsDir, expectedSha, reportPath });
    console.log('================================================================');
    console.log('VERIFICAÇÃO DE RECIBOS DE CI DOS WORKFLOWS — SUCESSO FORENSE');
    console.log('================================================================');
    console.log(`Repositório:   ${REQUIRED_REPOSITORY}`);
    console.log(`Head SHA Comum: ${res.commonHeadSha}`);
    console.log(`Workflows:      ${res.workflowCount}/3 verificados e concluídos com sucesso:`);
    for (const w of res.workflows) {
      console.log(`  - [PASS] ${w.name} (ID: ${w.id}, attempt: ${w.run_attempt})`);
      console.log(`           Status: ${w.status} | Conclusion: ${w.conclusion}`);
      console.log(`           URL: ${w.html_url}`);
      console.log(`           Ficheiro: ${w.filename} (SHA-256: ${w.fileSha256})`);
    }
    if (res.jobsValidatedCount > 0) {
      console.log(`Jobs:          ${res.jobsValidatedCount} jobs validados com sucesso.`);
    }
    if (res.artifactsValidatedCount > 0) {
      console.log(`Artefactos:    ${res.artifactsValidatedCount} artefactos validados com sucesso.`);
    }
    console.log('----------------------------------------------------------------');
    console.log('Classificação: THREE_PRECEDING_WORKFLOWS_VERIFIED — POST_CLOSURE_PACKAGING_EXECUTING_ON_SAME_SHA');
    console.log('================================================================');
    process.exit(0);
  } catch (err) {
    console.error('================================================================');
    console.error('VERIFICAÇÃO DE RECIBOS DE CI DOS WORKFLOWS — FALHA FORENSE');
    console.error('================================================================');
    console.error(`Erro: ${err.message}`);
    console.error('================================================================');
    process.exit(1);
  }
}

/**
 * packages/runtime/src/pilot/CIWorkflowReceiptsVerifier.ts
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

import * as fs from 'node:fs';
import * as path from 'node:path';
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

export const EXPECTED_CLOSURE_PACKAGE_FILES = [
  'closure-verification-result.json',
  'final-resolved-report.md',
  'requirement-test-evidence-sha-matrix.json',
  'workflow-artifacts-ci-readiness.json',
  'workflow-artifacts-evidence-remote.json',
  'workflow-artifacts-final-forensic.json',
  'workflow-jobs-ci-readiness.json',
  'workflow-jobs-evidence-remote.json',
  'workflow-jobs-final-forensic.json',
  'workflow-run-ci-readiness.json',
  'workflow-run-evidence-remote.json',
  'workflow-run-final-forensic.json'
];

export const REQUIRED_REPOSITORY = 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';

export const EXPECTED_WORKFLOW_SPEC: Record<string, { exactName: string; expectedPath: string }> = {
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

export const EXPECTED_JOBS_SPEC: Record<string, { runFile: string; requiredJobNames: string[] }> = {
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

export const EXPECTED_ARTIFACTS_SPEC: Record<string, { runFile: string; requiredArtifactPrefix: string }> = {
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

export function validateRunAttempt(val: any, context: string = 'run_attempt'): number {
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

export function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

export interface WorkflowReceiptValidation {
  id: number;
  name: string;
  workflow_path: string;
  head_sha: string;
  head_branch: string;
  run_attempt: number;
  status: string;
  conclusion: string;
  event: string;
  html_url: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowFileResult extends WorkflowReceiptValidation {
  filename: string;
  filePath: string;
  fileSha256: string;
  fileSizeBytes: number;
}

export interface VerifyWorkflowReceiptsOptions {
  receiptsDir: string;
  expectedSha?: string;
  reportPath?: string;
  requireNineFiles?: boolean;
  isClosurePackage?: boolean;
}

export interface VerifyWorkflowReceiptsResult {
  verified: boolean;
  commonHeadSha: string;
  workflowCount: number;
  workflows: WorkflowFileResult[];
  jobsValidatedCount: number;
  artifactsValidatedCount: number;
}

export function validateSingleWorkflowReceipt(
  receipt: any,
  filename: string,
  expectedSha?: string
): WorkflowReceiptValidation {
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

  // Workflow path
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

export function validateSingleJobsReceipt(
  jobsData: any,
  filename: string,
  expectedRunId: number
): any[] {
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

  const jobIds = new Set<number>();
  const foundNames = new Set<string>();

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
    if (!Array.isArray(job.steps) || job.steps.length === 0) {
      throw new Error(`Job '${job.name}' (ID: ${job.id}) em '${filename}' não possui array 'steps' ou steps está vazio.`);
    }

    const stepNumbers = new Set<number>();
    for (const step of job.steps) {
      if (!step || typeof step !== 'object') {
        throw new Error(`Passo inválido em job '${job.name}' de '${filename}': não é um objeto JSON.`);
      }

      if (typeof step.number !== 'number' || !Number.isInteger(step.number) || step.number <= 0) {
        throw new Error(`Passo '${step.name || 'desconhecido'}' no job '${job.name}' de '${filename}' possui 'number' inválido: ${JSON.stringify(step.number)}.`);
      }
      if (stepNumbers.has(step.number)) {
        throw new Error(`Passo com número duplicado ${step.number} detectado no job '${job.name}' de '${filename}'.`);
      }
      stepNumbers.add(step.number);

      if (!step.name || typeof step.name !== 'string' || step.name.trim() === '') {
        throw new Error(`Passo número ${step.number} no job '${job.name}' de '${filename}' possui nome ausente ou vazio.`);
      }

      if (step.status !== 'completed') {
        throw new Error(`Passo '${step.name}' no job '${job.name}' em '${filename}' possui status '${step.status}', esperado estritamente 'completed'.`);
      }

      // Whitelist estrita: apenas 'success' é aceito. Rejeitar failure, cancelled, timed_out, action_required, stale, startup_failure, null, etc.
      if (step.conclusion !== 'success') {
        throw new Error(`Passo '${step.name}' no job '${job.name}' em '${filename}' possui conclusão inválida ou não-sucedida: '${step.conclusion}', esperado estritamente 'success'.`);
      }

      // Timestamps do step se presentes
      if (step.started_at && step.completed_at) {
        const stepStarted = Date.parse(step.started_at);
        const stepCompleted = Date.parse(step.completed_at);
        if (isNaN(stepStarted) || isNaN(stepCompleted)) {
          throw new Error(`Passo '${step.name}' no job '${job.name}' em '${filename}' possui timestamps inválidos.`);
        }
        if (stepCompleted < stepStarted) {
          throw new Error(`Passo '${step.name}' no job '${job.name}' em '${filename}' possui completed_at anterior a started_at.`);
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

export function validateSingleArtifactsReceipt(
  artifactsData: any,
  filename: string,
  expectedRunId: number,
  expectedSha: string
): any[] {
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

  const artifactIds = new Set<number>();
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

    // Timestamps ISO válidos e ordenados
    for (const tsField of ['created_at', 'updated_at']) {
      const val = art[tsField];
      if (!val || typeof val !== 'string' || isNaN(Date.parse(val))) {
        throw new Error(`Artefacto '${art.name}' em '${filename}' possui '${tsField}' ausente ou timestamp ISO inválido: ${JSON.stringify(val)}.`);
      }
    }
    if (Date.parse(art.updated_at) < Date.parse(art.created_at)) {
      throw new Error(`Artefacto '${art.name}' em '${filename}' possui updated_at anterior a created_at.`);
    }

    // Validação de URL
    if (typeof art.url !== 'string' || !art.url.includes(`repos/${REQUIRED_REPOSITORY}/actions/artifacts`)) {
      throw new Error(`Artefacto '${art.name}' em '${filename}' possui 'url' inválida ou não associada ao repositório '${REQUIRED_REPOSITORY}'.`);
    }

    // workflow_run ESTRITAMENTE OBRIGATÓRIO (sem condições nem fallbacks)
    if (!art.workflow_run || typeof art.workflow_run !== 'object') {
      throw new Error(`Artefacto '${art.name}' (ID: ${art.id}) em '${filename}' não possui o objecto obrigatório 'workflow_run'.`);
    }

    const wfRun = art.workflow_run;

    // workflow_run.id
    if (typeof wfRun.id !== 'number' || !Number.isInteger(wfRun.id) || wfRun.id <= 0) {
      throw new Error(`Artefacto '${art.name}' em '${filename}' possui 'workflow_run.id' inválido: ${JSON.stringify(wfRun.id)}.`);
    }
    if (wfRun.id !== expectedRunId) {
      throw new Error(`Artefacto '${art.name}' em '${filename}' associado a run_id '${wfRun.id}', esperado '${expectedRunId}'.`);
    }

    // workflow_run.head_sha
    if (!wfRun.head_sha || typeof wfRun.head_sha !== 'string' || !/^[0-9a-f]{40}$/i.test(wfRun.head_sha)) {
      throw new Error(`Artefacto '${art.name}' em '${filename}' possui 'workflow_run.head_sha' ausente ou inválido: ${JSON.stringify(wfRun.head_sha)}.`);
    }
    if (wfRun.head_sha.toLowerCase() !== expectedSha.toLowerCase()) {
      throw new Error(`Artefacto '${art.name}' em '${filename}' associado a SHA '${wfRun.head_sha}', esperado '${expectedSha}'.`);
    }

    // workflow_run.head_branch
    if (!wfRun.head_branch || wfRun.head_branch !== 'master') {
      throw new Error(`Artefacto '${art.name}' em '${filename}' associado a branch '${wfRun.head_branch}', esperado estritamente 'master'.`);
    }

    // repository_id e head_repository_id
    if (typeof wfRun.repository_id !== 'number' || !Number.isInteger(wfRun.repository_id) || wfRun.repository_id <= 0) {
      throw new Error(`Artefacto '${art.name}' em '${filename}' possui 'workflow_run.repository_id' inválido: ${JSON.stringify(wfRun.repository_id)}.`);
    }
    if (typeof wfRun.head_repository_id !== 'number' || !Number.isInteger(wfRun.head_repository_id) || wfRun.head_repository_id <= 0) {
      throw new Error(`Artefacto '${art.name}' em '${filename}' possui 'workflow_run.head_repository_id' inválido: ${JSON.stringify(wfRun.head_repository_id)}.`);
    }
    if (wfRun.repository_id !== wfRun.head_repository_id) {
      throw new Error(`Artefacto '${art.name}' em '${filename}' possui divergência entre repository_id (${wfRun.repository_id}) e head_repository_id (${wfRun.head_repository_id}).`);
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

export function validateFilesSha256Manifest(
  receiptsDir: string,
  manifestPath: string,
  isClosurePackage: boolean = false
): { verifiedFilesCount: number; manifestFiles: string[] } {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifesto 'files.sha256' não existe em '${manifestPath}'.`);
  }

  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const lines = manifestContent.trim().split('\n');
  if (lines.length === 0 || (lines.length === 1 && lines[0].trim() === '')) {
    throw new Error(`Manifesto 'files.sha256' está vazio.`);
  }

  const manifestMap = new Map<string, string>();

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const parts = rawLine.split(/\s+/);
    if (parts.length < 2) {
      throw new Error(`Linha ${i + 1} de 'files.sha256' malformada: '${rawLine}'.`);
    }
    const expectedHash = parts[0];
    const targetFilename = parts.slice(1).join(' ');

    if (!/^[0-9a-f]{64}$/i.test(expectedHash)) {
      throw new Error(`Linha ${i + 1} de 'files.sha256': hash SHA-256 inválido '${expectedHash}'.`);
    }

    if (targetFilename === 'files.sha256') {
      throw new Error(`Manifesto 'files.sha256' não pode conter auto-referência a si próprio na linha ${i + 1}.`);
    }

    // Rejeitar caminhos absolutos
    if (
      path.isAbsolute(targetFilename) ||
      /^[a-zA-Z]:[\\/]/.test(targetFilename) ||
      targetFilename.startsWith('/') ||
      targetFilename.startsWith('\\')
    ) {
      throw new Error(`Linha ${i + 1} de 'files.sha256': caminho absoluto não permitido: '${targetFilename}'.`);
    }

    // Rejeitar travessias de directório
    if (targetFilename.includes('..') || targetFilename.split(/[\\/]/).includes('..')) {
      throw new Error(`Linha ${i + 1} de 'files.sha256': travessia de directório '..' não permitida: '${targetFilename}'.`);
    }

    // Rejeitar subdirectórios no pacote de fecho
    if (targetFilename.includes('/') || targetFilename.includes('\\')) {
      throw new Error(`Linha ${i + 1} de 'files.sha256': subdirectórios não permitidos no pacote: '${targetFilename}'.`);
    }

    // Rejeitar duplicatas
    if (manifestMap.has(targetFilename)) {
      throw new Error(`Entrada duplicada para '${targetFilename}' detectada em 'files.sha256'.`);
    }

    manifestMap.set(targetFilename, expectedHash.toLowerCase());
  }

  // Descoberta física de ficheiros no directório
  const dirEntries = fs.readdirSync(receiptsDir, { withFileTypes: true });
  const physicalFiles = new Set<string>();

  for (const entry of dirEntries) {
    if (entry.isSymbolicLink()) {
      throw new Error(`Symlink não permitido detectado no directório de recibos: '${entry.name}'.`);
    }
    if (entry.isDirectory()) {
      continue;
    }
    if (entry.isFile()) {
      if (entry.name === 'files.sha256') {
        continue; // Excluído explicitamente por regra canónica de não auto-referência
      }
      physicalFiles.add(entry.name);
      // Bidirecionalidade parte 1: Ficheiro físico deve estar no manifesto
      if (!manifestMap.has(entry.name)) {
        throw new Error(`Ficheiro físico adicional '${entry.name}' no directório não está indexado no manifesto 'files.sha256'.`);
      }
    }
  }

  // Bidirecionalidade parte 2: Cada entrada do manifesto deve corresponder a um ficheiro físico regular
  for (const [manifestFilename, expectedHash] of manifestMap.entries()) {
    if (!physicalFiles.has(manifestFilename)) {
      throw new Error(`Manifesto 'files.sha256' referencia ficheiro inexistente no directório: '${manifestFilename}'.`);
    }

    const filePath = path.join(receiptsDir, manifestFilename);
    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      throw new Error(`Entrada '${manifestFilename}' em 'files.sha256' não é um ficheiro regular.`);
    }

    const actualHash = sha256(fs.readFileSync(filePath));
    if (actualHash !== expectedHash) {
      throw new Error(`Divergência de hash SHA-256 no manifesto para '${manifestFilename}': esperado '${expectedHash}', obtido '${actualHash}'.`);
    }
  }

  // Se for pacote de fecho, validar cobertura dos 12 ficheiros obrigatórios
  if (isClosurePackage) {
    for (const reqFile of EXPECTED_CLOSURE_PACKAGE_FILES) {
      if (!manifestMap.has(reqFile)) {
        throw new Error(`Ficheiro obrigatório do pacote de fecho '${reqFile}' ausente do manifesto 'files.sha256'.`);
      }
    }
  }

  return {
    verifiedFilesCount: manifestMap.size,
    manifestFiles: Array.from(manifestMap.keys())
  };
}

export function verifyWorkflowReceipts(options: VerifyWorkflowReceiptsOptions): VerifyWorkflowReceiptsResult {
  const { receiptsDir, expectedSha, reportPath, requireNineFiles = true } = options;

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

  const results: WorkflowFileResult[] = [];
  let commonSha: string | null = null;
  const runIdByFile: Record<string, number> = {};

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

    let parsed: any;
    try {
      parsed = JSON.parse(rawBytes.toString('utf8'));
    } catch (err: any) {
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

  // Validação de unicidade dos runs
  const uniqueIds = new Set(results.map(r => r.id));
  if (uniqueIds.size !== results.length) {
    throw new Error(`Recibos duplicados detectados: os 3 ficheiros devem corresponder a execuções com IDs distintos, obtidos ${results.map(r => r.id).join(', ')}.`);
  }
  const uniqueNames = new Set(results.map(r => r.name));
  if (uniqueNames.size !== results.length) {
    throw new Error(`Recibos duplicados detectados: os 3 ficheiros devem corresponder aos 3 workflows distintos.`);
  }

  // 2. Validar ficheiros de jobs e artefactos (obrigatórios por defeito se requireNineFiles !== false)
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
      const validatedArtifacts = validateSingleArtifactsReceipt(parsedArtData, artFilename, expectedRunId, commonSha!);
      artifactsCount += validatedArtifacts.length;
    }
  }

  // 3. Validação do manifesto files.sha256 (bidirecional)
  const isClosure = options.isClosurePackage ?? (typeof reportPath === 'string' && path.basename(reportPath) === 'final-resolved-report.md');
  const shaManifestPath = path.join(receiptsDir, 'files.sha256');
  if (fs.existsSync(shaManifestPath)) {
    validateFilesSha256Manifest(receiptsDir, shaManifestPath, isClosure);
  } else if (requireNineFiles && reportPath) {
    throw new Error(`Manifesto obrigatório 'files.sha256' ausente em '${receiptsDir}'.`);
  }

  // 4. Validação do relatório se fornecido
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
    commonHeadSha: commonSha!,
    workflowCount: results.length,
    workflows: results,
    jobsValidatedCount: jobsCount,
    artifactsValidatedCount: artifactsCount
  };
}

/**
 * packages/runtime/src/pilot/CIWorkflowReceiptsVerifier.ts
 *
 * Verificador read-only fortemente tipado dos recibos brutos da API dos workflows de CI do GitHub Actions.
 *
 * Exige:
 * 1. Todos os 3 recibos físicos (CI principal, Evidence Remote, Final Forensic).
 * 2. status === 'completed' e conclusion === 'success'.
 * 3. Mesmíssimo head_sha de 40 caracteres hexadecimais em todos os 3 workflows.
 * 4. Validação estrita de repository.full_name, run_attempt, run IDs e URLs.
 * 5. Coerência com o SHA final auditado no relatório quando fornecido.
 * 6. Zero fallbacks permissivos.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';

export const REQUIRED_WORKFLOW_FILES = [
  'workflow-run-ci-readiness.json',
  'workflow-run-evidence-remote.json',
  'workflow-run-final-forensic.json'
];

export const REQUIRED_REPOSITORY = 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';

export interface WorkflowReceiptValidation {
  id: number;
  name: string;
  head_sha: string;
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
}

export interface VerifyWorkflowReceiptsResult {
  verified: boolean;
  commonHeadSha: string;
  workflowCount: number;
  workflows: WorkflowFileResult[];
}

export function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

export function validateSingleWorkflowReceipt(
  receipt: any,
  filename: string,
  expectedSha?: string
): WorkflowReceiptValidation {
  if (!receipt || typeof receipt !== 'object') {
    throw new Error(`Recibo '${filename}' inválido: conteúdo não é um objeto JSON.`);
  }

  // ID
  if (typeof receipt.id !== 'number' || !Number.isInteger(receipt.id) || receipt.id <= 0) {
    throw new Error(`Recibo '${filename}' inválido: 'id' deve ser inteiro positivo, obtido ${JSON.stringify(receipt.id)}.`);
  }

  // Name
  if (!receipt.name || typeof receipt.name !== 'string' || receipt.name.trim() === '') {
    throw new Error(`Recibo '${filename}' inválido: 'name' obrigatório e não-vazio.`);
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

  // Status e Conclusion (sem fallback)
  if (receipt.status !== 'completed') {
    throw new Error(`Recibo '${filename}' (ID: ${receipt.id}) possui status '${receipt.status}', esperado estritamente 'completed'.`);
  }
  if (receipt.conclusion !== 'success') {
    throw new Error(`Recibo '${filename}' (ID: ${receipt.id}) possui conclusion '${receipt.conclusion}', esperado estritamente 'success'.`);
  }

  // Run attempt (sem fallback para run_attempt || 1)
  if (typeof receipt.run_attempt !== 'number' || !Number.isInteger(receipt.run_attempt) || receipt.run_attempt < 1) {
    throw new Error(`Recibo '${filename}' possui 'run_attempt' inválido: ${JSON.stringify(receipt.run_attempt)}. Não são permitidos fallbacks.`);
  }

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
    head_sha: headSha.toLowerCase(),
    run_attempt: receipt.run_attempt,
    status: receipt.status,
    conclusion: receipt.conclusion,
    event: receipt.event,
    html_url: receipt.html_url,
    created_at: receipt.created_at,
    updated_at: receipt.updated_at
  };
}

export function verifyWorkflowReceipts(options: VerifyWorkflowReceiptsOptions): VerifyWorkflowReceiptsResult {
  const { receiptsDir, expectedSha, reportPath } = options;

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

  for (const filename of REQUIRED_WORKFLOW_FILES) {
    const filePath = path.join(receiptsDir, filename);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Recibo obrigatório '${filename}' ausente em '${receiptsDir}'. Todos os 3 recibos devem existir fisicamente.`);
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

    results.push({
      filename,
      filePath,
      fileSha256: sha256(rawBytes),
      fileSizeBytes: rawBytes.length,
      ...validated
    });
  }

  // Validação opcional de coerência com o relatório
  if (reportPath) {
    if (!fs.existsSync(reportPath)) {
      throw new Error(`Ficheiro de relatório '${reportPath}' não encontrado.`);
    }
    const reportContent = fs.readFileSync(reportPath, 'utf8');

    const shaMatch =
      reportContent.match(/final_audited_sha[:\s`*]+([0-9a-f]{40})/i) ||
      reportContent.match(/Commit SHA Final[:\s`*]+([0-9a-f]{40})/i) ||
      reportContent.match(/final_audited_sha`:\s*`([0-9a-f]{40})`/i);

    if (shaMatch) {
      const reportSha = shaMatch[1].toLowerCase();
      if (reportSha !== commonSha) {
        throw new Error(`Divergência entre o SHA do relatório ('${reportSha}') e o head_sha dos recibos de CI ('${commonSha}').`);
      }
    }
  }

  return {
    verified: true,
    commonHeadSha: commonSha!,
    workflowCount: results.length,
    workflows: results
  };
}

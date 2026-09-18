import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

export function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

export const CANONICAL_REPO_ID = 1363667011;
export const CANONICAL_REPO_NAME = 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';

/**
 * Validação rigorosa de Commit SHA Git (40 hexadecimais minúsculos)
 */
export function assertStrictSha(shaVal, label = 'SHA') {
  if (typeof shaVal !== 'string' || !/^[a-f0-9]{40}$/.test(shaVal)) {
    throw new Error(`${label} inválido: '${shaVal}' (deve ter exactamente 40 hexadecimais minúsculos).`);
  }
}

/**
 * Validação rigorosa de ID numérico
 */
export function assertStrictId(idVal, label = 'ID') {
  if (typeof idVal === 'number') {
    if (!Number.isSafeInteger(idVal) || idVal <= 0) {
      throw new Error(`${label} numérico inválido: '${idVal}' (deve ser inteiro seguro positivo).`);
    }
    return;
  }
  if (typeof idVal === 'string') {
    if (!/^[1-9]\d*$/.test(idVal)) {
      throw new Error(`${label} inválido: '${idVal}' (deve ser estritamente numérico, contendo apenas dígitos decimais sem zeros à esquerda).`);
    }
    const n = Number(idVal);
    if (!Number.isSafeInteger(n) || n <= 0) {
      throw new Error(`${label} excede limites de inteiro seguro: '${idVal}'.`);
    }
    return;
  }
  throw new Error(`${label} com tipo inválido (${typeof idVal}).`);
}

/**
 * Executa chamada gh api, preserva os bytes brutos físicos recebidos,
 * calcula SHA-256 e grava ficheiro de metadados sidecar (.meta.json).
 */
export function fetchAndPreserveGhApi(endpoint, outDir, baseFilename, extraMeta = {}) {
  const targetDir = path.resolve(process.cwd(), outDir);
  fs.mkdirSync(targetDir, { recursive: true });

  const rawBytes = execFileSync('gh', ['api', endpoint], {
    maxBuffer: 50 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  if (!rawBytes || rawBytes.length === 0) {
    throw new Error(`Resposta vazia da API do GitHub para endpoint: '${endpoint}'.`);
  }

  const rawSha = sha256(rawBytes);
  const rawFilePath = path.join(targetDir, `${baseFilename}.json`);
  const rawShaPath = path.join(targetDir, `${baseFilename}.json.sha256`);
  const metaFilePath = path.join(targetDir, `${baseFilename}.meta.json`);

  // Gravar bytes brutos intactos
  fs.writeFileSync(rawFilePath, rawBytes);
  fs.writeFileSync(rawShaPath, `${rawSha}  ${baseFilename}.json\n`, 'utf8');

  let parsed;
  try {
    parsed = JSON.parse(rawBytes.toString('utf8'));
  } catch (err) {
    throw new Error(`Falha de parsing JSON da resposta bruta de '${endpoint}': ${err.message}`);
  }

  // Montar sidecar estrito
  const meta = {
    endpoint,
    query_url: `https://api.github.com/${endpoint}`,
    retrieved_at: new Date().toISOString(),
    actor: process.env.GITHUB_ACTOR || 'github-actions[bot]',
    repository_id: parsed.repository?.id ?? parsed.workflow_run?.repository_id ?? null,
    workflow_id: parsed.workflow_id ?? null,
    workflow_path: parsed.path ?? null,
    run_id: parsed.id ?? parsed.workflow_run?.id ?? null,
    run_attempt: parsed.run_attempt ?? null,
    artifact_id: parsed.id && parsed.archive_download_url ? parsed.id : null,
    head_sha: parsed.head_sha ?? parsed.workflow_run?.head_sha ?? null,
    head_branch: parsed.head_branch ?? parsed.workflow_run?.head_branch ?? null,
    status: parsed.status ?? null,
    conclusion: parsed.conclusion ?? null,
    raw_filename: `${baseFilename}.json`,
    raw_bytes_sha256: rawSha,
    ...extraMeta
  };

  fs.writeFileSync(metaFilePath, JSON.stringify(meta, null, 2), 'utf8');

  return {
    parsed,
    rawBytes,
    rawSha,
    rawFilePath,
    metaFilePath
  };
}

#!/usr/bin/env node
/**
 * scripts/fetch-ci-workflow-receipts.mjs
 *
 * Descarrega as respostas JSON brutas da API do GitHub para os 3 workflows de CI
 * e guarda-as como artefactos não versionados em .artifacts/evidence/ci/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const REPO = 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';

function fetchRunJson(runId) {
  const cmd = `gh api repos/${REPO}/actions/runs/${runId}`;
  const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  return JSON.parse(out);
}

function main() {
  const args = process.argv.slice(2);
  let targetDir = path.join(process.cwd(), '.artifacts', 'evidence', 'ci');
  let ciRunId = '';
  let remoteRunId = '';
  let finalRunId = '';
  let commitSha = '';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir') targetDir = args[++i];
    else if (args[i] === '--ci-run') ciRunId = args[++i];
    else if (args[i] === '--remote-run') remoteRunId = args[++i];
    else if (args[i] === '--final-run') finalRunId = args[++i];
    else if (args[i] === '--commit-sha') commitSha = args[++i];
  }

  // Se IDs não fornecidos, tentar descobrir a partir do commit_sha
  if ((!ciRunId || !remoteRunId || !finalRunId) && commitSha) {
    console.log(`Descobrindo runs da API do GitHub para o commit ${commitSha}...`);
    const listOut = execSync(
      `gh api repos/${REPO}/actions/runs?head_sha=${commitSha}&per_page=10`,
      { encoding: 'utf8' }
    );
    const runs = JSON.parse(listOut).workflow_runs || [];
    for (const r of runs) {
      if (r.name?.includes('Production Readiness') && !ciRunId) {
        ciRunId = String(r.id);
      } else if (r.name?.includes('Evidence Remote') && !remoteRunId) {
        remoteRunId = String(r.id);
      } else if (r.name?.includes('Final Forensic') && !finalRunId) {
        finalRunId = String(r.id);
      }
    }
  }

  if (!ciRunId || !remoteRunId || !finalRunId) {
    console.error(`Erro: São necessários os 3 run IDs (--ci-run, --remote-run, --final-run) ou --commit-sha válido.`);
    console.error(`Obtidos: ci-run=${ciRunId}, remote-run=${remoteRunId}, final-run=${finalRunId}`);
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });

  console.log(`Descarregando respostas brutas da API do GitHub para '${targetDir}'...`);

  const runsToFetch = [
    { id: ciRunId, filename: 'workflow-run-ci-readiness.json', label: 'CI Principal' },
    { id: remoteRunId, filename: 'workflow-run-evidence-remote.json', label: 'Evidence Remote' },
    { id: finalRunId, filename: 'workflow-run-final-forensic.json', label: 'Final Forensic' }
  ];

  for (const item of runsToFetch) {
    console.log(`Descarregando ${item.label} (ID: ${item.id})...`);
    const data = fetchRunJson(item.id);
    const dest = path.join(targetDir, item.filename);
    fs.writeFileSync(dest, JSON.stringify(data, null, 2), 'utf8');
    console.log(`  -> Salvo em '${dest}' (${fs.statSync(dest).size} bytes)`);
  }

  console.log('[OK] Todos os 3 recibos físicos foram descarregados e preservados.');
}

main();

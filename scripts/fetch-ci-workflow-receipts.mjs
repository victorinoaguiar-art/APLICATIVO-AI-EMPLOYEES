#!/usr/bin/env node
/**
 * scripts/fetch-ci-workflow-receipts.mjs
 *
 * Descarrega as respostas JSON brutas da API do GitHub para os 3 workflows de CI
 * (runs, jobs e artifacts) e guarda-as como artefactos em .artifacts/closure/ ou no directório especificado.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const REPO = 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';

function fetchApi(endpoint) {
  const cmd = `gh api "repos/${REPO}/${endpoint}"`;
  const out = execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
  return JSON.parse(out);
}

function main() {
  const args = process.argv.slice(2);
  let targetDir = path.join(process.cwd(), '.artifacts', 'closure');
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
    const runsData = fetchApi(`actions/runs?head_sha=${commitSha}&per_page=30`);
    const runs = runsData.workflow_runs || [];
    for (const r of runs) {
      if (r.name === 'CI / Production Readiness & Audit Gate' && !ciRunId) {
        ciRunId = String(r.id);
      } else if (r.name === 'Evidence Remote Verification' && !remoteRunId) {
        remoteRunId = String(r.id);
      } else if (r.name === 'Final Forensic Attestation & Audit Verification' && !finalRunId) {
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

  const workflows = [
    { id: ciRunId, slug: 'ci-readiness', label: 'CI / Production Readiness & Audit Gate' },
    { id: remoteRunId, slug: 'evidence-remote', label: 'Evidence Remote Verification' },
    { id: finalRunId, slug: 'final-forensic', label: 'Final Forensic Attestation & Audit Verification' }
  ];

  for (const wf of workflows) {
    console.log(`Descarregando dados para ${wf.label} (ID: ${wf.id})...`);

    // 1. Run principal
    const runData = fetchApi(`actions/runs/${wf.id}`);
    const runDest = path.join(targetDir, `workflow-run-${wf.slug}.json`);
    fs.writeFileSync(runDest, JSON.stringify(runData, null, 2), 'utf8');
    console.log(`  -> Salvo: ${runDest} (${fs.statSync(runDest).size} bytes)`);

    // 2. Jobs
    const jobsData = fetchApi(`actions/runs/${wf.id}/jobs`);
    const jobsDest = path.join(targetDir, `workflow-jobs-${wf.slug}.json`);
    fs.writeFileSync(jobsDest, JSON.stringify(jobsData, null, 2), 'utf8');
    console.log(`  -> Salvo: ${jobsDest} (${fs.statSync(jobsDest).size} bytes)`);

    // 3. Artifacts
    const artifactsData = fetchApi(`actions/runs/${wf.id}/artifacts`);
    const artifactsDest = path.join(targetDir, `workflow-artifacts-${wf.slug}.json`);
    fs.writeFileSync(artifactsDest, JSON.stringify(artifactsData, null, 2), 'utf8');
    console.log(`  -> Salvo: ${artifactsDest} (${fs.statSync(artifactsDest).size} bytes)`);
  }

  console.log('[OK] Todos os recibos físicos (runs, jobs, artifacts) foram descarregados e preservados.');
}

main();

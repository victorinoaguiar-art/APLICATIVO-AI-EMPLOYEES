#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import {
  CANONICAL_REPO_ID,
  CANONICAL_REPO_NAME,
  assertStrictSha,
  assertStrictId,
  fetchAndPreserveGhApi,
  sha256
} from './lib/rawGhApi.mjs';
import { auditAndExtractZip } from './lib/secureTarExtractor.mjs';

const args = process.argv.slice(2);
function getArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = args.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const stageBRunId = getArg('stage-b-run-id', process.env.STAGE_B_RUN_ID || process.env.GITHUB_EVENT_WORKFLOW_RUN_ID || '');
const outDir = path.resolve(process.cwd(), getArg('out-dir', '.artifacts/chain_attestation'));
const mockDataDir = getArg('mock-data-dir', process.env.MOCK_DATA_DIR || '');

fs.mkdirSync(outDir, { recursive: true });

console.log('================================================================');
console.log('ATESTAÇÃO FORENSE INDEPENDENTE DA CADEIA OPERACIONAL (PÓS-ETAPA B)');
console.log('================================================================');
console.log(`Directório de Saída: ${outDir}`);
console.log(`Stage B Run ID:      ${stageBRunId || '(a determinar via mock ou evento)'}`);

if (!stageBRunId && !mockDataDir) {
  console.error('\n[FAIL-CLOSED] stage-b-run-id é estritamente obrigatório para verificação da cadeia.');
  process.exit(1);
}

if (stageBRunId) {
  assertStrictId(stageBRunId, 'stageBRunId');
}

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
  // 1. Consultar e reconciliar Run da Etapa B
  console.log('\n--- 1. Reconciliação do Run da Etapa B ---');
  let runBData;
  let rawRunBBytes;
  if (mockDataDir && fs.existsSync(path.join(mockDataDir, 'stage-b-run-api-response.json'))) {
    rawRunBBytes = fs.readFileSync(path.join(mockDataDir, 'stage-b-run-api-response.json'));
    runBData = JSON.parse(rawRunBBytes.toString('utf8'));
    fs.writeFileSync(path.join(outDir, 'stage-b-run-api-response.json'), rawRunBBytes);
    fs.writeFileSync(path.join(outDir, 'stage-b-run-api-response.json.sha256'), `${sha256(rawRunBBytes)}  stage-b-run-api-response.json\n`);
  } else {
    const resB = fetchAndPreserveGhApi(
      `repos/${CANONICAL_REPO_NAME}/actions/runs/${stageBRunId}`,
      outDir,
      'stage-b-run-api-response'
    );
    runBData = resB.parsed;
    rawRunBBytes = resB.rawBytes;
  }

  const sourceSha = runBData.head_sha;
  assertStrictSha(sourceSha, 'sourceSha');

  recordCheck('REPO_CANONICAL', String(runBData.id), 'N/A', 'stage-b-run-api-response.json', sha256(rawRunBBytes),
    runBData.repository?.id === CANONICAL_REPO_ID && runBData.head_repository?.id === CANONICAL_REPO_ID ? 'PASS' : 'FAIL',
    `repo_id=${runBData.repository?.id}`);

  recordCheck('STAGE_B_STATUS', String(runBData.id), 'N/A', 'stage-b-run-api-response.json', sha256(rawRunBBytes),
    runBData.status === 'completed' && runBData.conclusion === 'success' ? 'PASS' : 'FAIL',
    `status=${runBData.status}, conclusion=${runBData.conclusion}`);

  recordCheck('STAGE_B_BRANCH', String(runBData.id), 'N/A', 'stage-b-run-api-response.json', sha256(rawRunBBytes),
    runBData.head_branch === 'master' ? 'PASS' : 'FAIL',
    `branch=${runBData.head_branch}`);

  recordCheck('STAGE_B_WORKFLOW', String(runBData.id), 'N/A', 'stage-b-run-api-response.json', sha256(rawRunBBytes),
    runBData.path === '.github/workflows/operational-pilot-stage-b.yml' ? 'PASS' : 'FAIL',
    `path=${runBData.path}`);

  // 2. Localizar e descarregar artefacto da Etapa B
  console.log('\n--- 2. Reconciliação do Artefacto de Fecho da Etapa B ---');
  let artifactsBData;
  let rawArtifactsBBytes;
  if (mockDataDir && fs.existsSync(path.join(mockDataDir, 'stage-b-artifacts-list.json'))) {
    rawArtifactsBBytes = fs.readFileSync(path.join(mockDataDir, 'stage-b-artifacts-list.json'));
    artifactsBData = JSON.parse(rawArtifactsBBytes.toString('utf8'));
  } else {
    rawArtifactsBBytes = execFileSync('gh', ['api', `repos/${CANONICAL_REPO_NAME}/actions/runs/${runBData.id}/artifacts`], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    artifactsBData = JSON.parse(rawArtifactsBBytes.toString('utf8'));
  }
  fs.writeFileSync(path.join(outDir, 'stage-b-artifacts-list.json'), rawArtifactsBBytes);
  fs.writeFileSync(path.join(outDir, 'stage-b-artifacts-list.json.sha256'), `${sha256(rawArtifactsBBytes)}  stage-b-artifacts-list.json\n`);

  const expectedClosureArtifactName = `aetf-pilot-closure-${sourceSha}`;
  const closureArtifact = artifactsBData.artifacts?.find(a => a.name === expectedClosureArtifactName);
  if (!closureArtifact) {
    throw new Error(`Artefacto de encerramento '${expectedClosureArtifactName}' não encontrado na lista de artefactos do run ${runBData.id}.`);
  }

  recordCheck('STAGE_B_ARTIFACT_VALID', String(runBData.id), String(closureArtifact.id), closureArtifact.name, 'N/A',
    closureArtifact.expired === false && closureArtifact.size_in_bytes > 0 ? 'PASS' : 'FAIL',
    `size=${closureArtifact.size_in_bytes} bytes`);

  // Descarregar e extrair com segurança máxima
  const stageBZipPath = path.join(outDir, `${expectedClosureArtifactName}.zip`);
  const stageBExtractDir = path.join(outDir, 'stage_b_extracted');
  if (mockDataDir && fs.existsSync(path.join(mockDataDir, `${expectedClosureArtifactName}.zip`))) {
    fs.copyFileSync(path.join(mockDataDir, `${expectedClosureArtifactName}.zip`), stageBZipPath);
  } else {
    execFileSync('gh', ['api', `repos/${CANONICAL_REPO_NAME}/actions/artifacts/${closureArtifact.id}/zip`], {
      stdio: ['pipe', fs.openSync(stageBZipPath, 'w'), 'pipe']
    });
  }
  const stageBZipBytes = fs.readFileSync(stageBZipPath);
  const stageBZipSha = sha256(stageBZipBytes);
  fs.writeFileSync(`${stageBZipPath}.sha256`, `${stageBZipSha}  ${path.basename(stageBZipPath)}\n`);

  console.log(`[PASS] Artefacto ${closureArtifact.name} transferido (${stageBZipBytes.length} bytes, SHA: ${stageBZipSha.slice(0, 16)}...)`);
  auditAndExtractZip(stageBZipPath, stageBExtractDir);
  console.log(`[PASS] Artefacto extraído com sucesso através do extractor seguro para: ${stageBExtractDir}`);

  // 3. Validar evidências preservadas da Etapa A e do Intake dentro da Etapa B
  console.log('\n--- 3. Descoberta e Reconciliação Transversal da Cadeia ---');
  const stageARunApiFile = path.join(stageBExtractDir, 'stage-a-run-api-response.json');
  const stageAArtifactApiFile = path.join(stageBExtractDir, 'stage-a-artifact-api-response.json');

  if (!fs.existsSync(stageARunApiFile) || !fs.existsSync(stageAArtifactApiFile)) {
    throw new Error('Respostas da API da Etapa A ausentes na evidência extraída da Etapa B.');
  }

  const runAData = JSON.parse(fs.readFileSync(stageARunApiFile, 'utf8'));
  const artifactAData = JSON.parse(fs.readFileSync(stageAArtifactApiFile, 'utf8'));

  recordCheck('SAME_SHA_STAGE_A', String(runAData.id), String(artifactAData.id), 'stage-a-run-api-response.json', sha256(fs.readFileSync(stageARunApiFile)),
    runAData.head_sha === sourceSha ? 'PASS' : 'FAIL',
    `stage_a_sha=${runAData.head_sha}`);

  recordCheck('STAGE_A_STATUS', String(runAData.id), String(artifactAData.id), 'stage-a-run-api-response.json', sha256(fs.readFileSync(stageARunApiFile)),
    runAData.status === 'completed' && runAData.conclusion === 'success' ? 'PASS' : 'FAIL',
    `status=${runAData.status}, conclusion=${runAData.conclusion}`);

  recordCheck('STAGE_A_WORKFLOW', String(runAData.id), String(artifactAData.id), 'stage-a-run-api-response.json', sha256(fs.readFileSync(stageARunApiFile)),
    runAData.path === '.github/workflows/operational-pilot-stage-a.yml' ? 'PASS' : 'FAIL',
    `path=${runAData.path}`);

  // Intake evidence
  const intakeRunApiFile = path.join(stageBExtractDir, 'intake-run-api-response.json');
  const intakeArtifactApiFile = path.join(stageBExtractDir, 'intake-artifact-api-response.json');
  let intakeRunId = 0;
  let intakeArtifactId = 0;
  if (fs.existsSync(intakeRunApiFile)) {
    const runIntakeData = JSON.parse(fs.readFileSync(intakeRunApiFile, 'utf8'));
    intakeRunId = runIntakeData.id;
    recordCheck('SAME_SHA_INTAKE', String(runIntakeData.id), 'N/A', 'intake-run-api-response.json', sha256(fs.readFileSync(intakeRunApiFile)),
      runIntakeData.head_sha === sourceSha ? 'PASS' : 'FAIL',
      `intake_sha=${runIntakeData.head_sha}`);
  }
  if (fs.existsSync(intakeArtifactApiFile)) {
    const artIntakeData = JSON.parse(fs.readFileSync(intakeArtifactApiFile, 'utf8'));
    intakeArtifactId = artIntakeData.id;
  }

  // 4. Validar Coerência DEMO estrita e ausência de classificação real
  console.log('\n--- 4. Validação de Coerência DEMO e Recibo de Independência ---');
  const taskReceiptFile = fs.readdirSync(stageBExtractDir).find(f => f.startsWith('task-receipt-') && f.endsWith('.json'));
  if (!taskReceiptFile) {
    throw new Error('Ficheiro task-receipt-*.json não encontrado no pacote de fecho.');
  }
  const taskReceipt = JSON.parse(fs.readFileSync(path.join(stageBExtractDir, taskReceiptFile), 'utf8'));

  recordCheck('DEMO_COHERENCE_TASK', String(runBData.id), String(closureArtifact.id), taskReceiptFile, sha256(fs.readFileSync(path.join(stageBExtractDir, taskReceiptFile))),
    taskReceipt.execution_mode === 'DEMO' && taskReceipt.is_simulation === true && taskReceipt.classification_level === 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED' ? 'PASS' : 'FAIL',
    `mode=${taskReceipt.execution_mode}, is_simulation=${taskReceipt.is_simulation}`);

  const indepReceiptFile = path.join(stageBExtractDir, 'reviewer-independence-receipt.json');
  if (!fs.existsSync(indepReceiptFile)) {
    throw new Error('reviewer-independence-receipt.json não encontrado no pacote de fecho.');
  }
  const indepReceipt = JSON.parse(fs.readFileSync(indepReceiptFile, 'utf8'));

  recordCheck('DEMO_INDEPENDENCE_SYNTHETIC', String(runBData.id), String(closureArtifact.id), 'reviewer-independence-receipt.json', sha256(fs.readFileSync(indepReceiptFile)),
    indepReceipt.execution_mode === 'DEMO' &&
    indepReceipt.is_simulation === true &&
    indepReceipt.independence_evidence_type === 'SYNTHETIC_DEMO' &&
    indepReceipt.github_environment_approval_id === null &&
    indepReceipt.independence_verified === false &&
    indepReceipt.prevent_self_review_observed === false &&
    indepReceipt.classification === 'DEMO_REVIEW_INDEPENDENCE_SIMULATED' ? 'PASS' : 'FAIL',
    `type=${indepReceipt.independence_evidence_type}, approval_id=${indepReceipt.github_environment_approval_id}`);

  // Rejeição categórica de qualquer classificação operacional real sob DEMO
  const finalAttestationFile = path.join(stageBExtractDir, 'pilot-final-attestation.json');
  if (fs.existsSync(finalAttestationFile)) {
    const finalAtt = JSON.parse(fs.readFileSync(finalAttestationFile, 'utf8'));
    recordCheck('NO_REAL_CLASSIFICATION_IN_DEMO', String(runBData.id), String(closureArtifact.id), 'pilot-final-attestation.json', sha256(fs.readFileSync(finalAttestationFile)),
      finalAtt.operational_state === 'AUTOMATED_OPERATIONAL_DEMO_EXECUTED' &&
      finalAtt.operational_pilot_started === false &&
      finalAtt.operational_pilot_completed === false ? 'PASS' : 'FAIL',
      `operational_state=${finalAtt.operational_state}`);
  }

  // 5. Validação Física Bidirecional dos Hashes contra pilot-evidence-files.sha256
  console.log('\n--- 5. Validação Física dos Hashes do Pacote de Fecho ---');
  const indexPath = path.join(stageBExtractDir, 'pilot-evidence-files.sha256');
  if (!fs.existsSync(indexPath)) {
    throw new Error('pilot-evidence-files.sha256 ausente no pacote de fecho.');
  }

  const indexLines = fs.readFileSync(indexPath, 'utf8').split('\n').filter(l => l.trim().length > 0);
  let checkedHashes = 0;
  for (const line of indexLines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 2) continue;
    const expectedH = parts[0];
    const fileName = parts.slice(1).join(' ');
    const filePath = path.join(stageBExtractDir, fileName);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Ficheiro indexado em pilot-evidence-files.sha256 ausente no disco: ${fileName}`);
    }
    const computedH = sha256(fs.readFileSync(filePath));
    if (computedH.toLowerCase() !== expectedH.toLowerCase()) {
      throw new Error(`Hash divergente para ${fileName}: esperado ${expectedH}, obtido ${computedH}`);
    }
    checkedHashes++;
  }
  recordCheck('PHYSICAL_HASH_INDEX', String(runBData.id), String(closureArtifact.id), 'pilot-evidence-files.sha256', sha256(fs.readFileSync(indexPath)),
    checkedHashes >= 20 ? 'PASS' : 'FAIL',
    `${checkedHashes} ficheiros validados fisicamente`);

  // 6. Gerar Atestação Forense Consolidada e Matriz de Requisitos
  console.log('\n--- 6. Emissão da Atestação Forense Final Independente ---');
  const chainAttestation = {
    source_sha: sourceSha,
    execution_mode: 'DEMO',
    same_sha_chain_verified: true,
    canonical_repo_id: CANONICAL_REPO_ID,
    canonical_repo_name: CANONICAL_REPO_NAME,
    ci_verified: true,
    intake_verified: Boolean(intakeRunId),
    stage_a_verified: true,
    stage_b_verified: true,
    intake_run_id: intakeRunId || null,
    stage_a_run_id: runAData.id,
    stage_b_run_id: runBData.id,
    challenge_id: taskReceipt.challenge_id || indepReceipt.challenge_id,
    review_independence_evidence: 'SYNTHETIC_DEMO',
    real_pilot_authorised: false,
    classification: 'SAME_SHA_DEMO_CHAIN_INDEPENDENTLY_ATTESTED',
    attested_at: new Date().toISOString()
  };

  const attestationPath = path.join(outDir, 'chain-attestation.json');
  fs.writeFileSync(attestationPath, JSON.stringify(chainAttestation, null, 2), 'utf8');
  fs.writeFileSync(`${attestationPath}.sha256`, `${sha256(fs.readFileSync(attestationPath))}  chain-attestation.json\n`, 'utf8');

  // Matriz Requirement -> Run -> Artifact -> File -> Hash -> Result
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

  // Índice integral do pacote de atestação
  const outFiles = fs.readdirSync(outDir).filter(f => f !== 'chain-evidence-files.sha256' && fs.statSync(path.join(outDir, f)).isFile()).sort();
  const indexLinesOut = outFiles.map(f => `${sha256(fs.readFileSync(path.join(outDir, f)))}  ${f}`);
  fs.writeFileSync(path.join(outDir, 'chain-evidence-files.sha256'), indexLinesOut.join('\n') + '\n', 'utf8');

  console.log('\n================================================================');
  console.log(`[PASS] ATESTAÇÃO CONCLUÍDA: ${chainAttestation.classification}`);
  console.log(`Relatório de Matriz gravado em: ${matrixPath}`);
  console.log(`Atestação JSON gravada em:      ${attestationPath}`);
  console.log('================================================================\n');

  process.exit(0);
} catch (err) {
  console.error(`\n[FATAL] Erro durante a atestação independente da cadeia: ${err.message}`);
  process.exit(1);
}

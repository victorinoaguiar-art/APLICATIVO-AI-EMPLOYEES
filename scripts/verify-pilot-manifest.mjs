#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

const args = process.argv.slice(2);
const dirArg = args.find(a => a.startsWith('--dir='));
const targetDir = dirArg
  ? path.resolve(process.cwd(), dirArg.split('=')[1])
  : path.resolve(process.cwd(), '.artifacts', 'pilot', 'PILOT_SASO_2026_09');

console.log('================================================================');
console.log('VERIFICAÇÃO INDEPENDENTE DO MANIFESTO DE EVIDÊNCIAS DO PILOTO');
console.log('================================================================');
console.log(`Directório Alvo: ${targetDir}`);

if (!fs.existsSync(targetDir)) {
  console.error(`ERRO: Directório de evidências não encontrado: ${targetDir}`);
  process.exit(1);
}

const manifestPath = path.join(targetDir, 'pilot-evidence-files.sha256');
if (!fs.existsSync(manifestPath)) {
  console.error(`ERRO: Manifesto 'pilot-evidence-files.sha256' não encontrado em ${targetDir}`);
  process.exit(1);
}

const manifestContent = fs.readFileSync(manifestPath, 'utf8');
const lines = manifestContent.trim().split('\n').filter(l => l.trim().length > 0);

console.log(`Total de ficheiros indexados no manifesto: ${lines.length}\n`);

let verifiedCount = 0;
let hasError = false;

for (const line of lines) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 2) continue;
  const expectedHash = parts[0];
  const relativeFileName = parts.slice(1).join(' ');
  const filePath = path.join(targetDir, relativeFileName);

  if (!fs.existsSync(filePath)) {
    console.error(`[FALHA] Ficheiro em falta no disco: ${relativeFileName}`);
    hasError = true;
    continue;
  }

  const fileBytes = fs.readFileSync(filePath);
  const actualHash = sha256(fileBytes);

  if (actualHash !== expectedHash) {
    console.error(`[FALHA] Hash divergente em ${relativeFileName}:`);
    console.error(`        Esperado: ${expectedHash}`);
    console.error(`        Obtido:   ${actualHash}`);
    hasError = true;
  } else {
    console.log(`[OK] ${relativeFileName.padEnd(35)} -> SHA256: ${actualHash.slice(0, 16)}...`);
    verifiedCount++;
  }
}

// Validação semântica da Atestação Final
const attestationFile = path.join(targetDir, 'pilot-final-attestation.json');
if (fs.existsSync(attestationFile)) {
  console.log('\n--- Validação Semântica da Atestação Final ---');
  try {
    const attestation = JSON.parse(fs.readFileSync(attestationFile, 'utf8'));
    console.log(`Piloto ID: ${attestation.pilot_id}`);
    console.log(`Modo de Execução: ${attestation.execution_mode}`);
    console.log(`Status de Classificação: ${attestation.classification_status || attestation.classification}`);
    console.log(`Estado Operacional: ${attestation.operational_state}`);
    console.log(`Resultado dos Gates: ${attestation.gates_result}`);

    if (attestation.execution_mode === 'SIMULATION') {
      if (attestation.operational_pilot_completed === true) {
        console.error('[FALHA] Piloto em SIMULATION não pode ter operational_pilot_completed = true.');
        hasError = true;
      }
      if (attestation.classification_status === 'OPERATIONAL_PILOT_VALIDATED') {
        console.error('[FALHA] Piloto em SIMULATION não pode ter classificação OPERATIONAL_PILOT_VALIDATED.');
        hasError = true;
      }
    }

    if (attestation.gates_result !== 'PASS') {
      console.error(`[FALHA] Resultado dos gates não é PASS: ${attestation.gates_result}`);
      hasError = true;
    }
  } catch (err) {
    console.error(`[FALHA] Erro ao analisar pilot-final-attestation.json: ${err.message}`);
    hasError = true;
  }
}

console.log('----------------------------------------------------------------');
if (hasError) {
  console.error('[RESULTADO] FALHA NA VERIFICAÇÃO DO MANIFESTO DE EVIDÊNCIAS');
  process.exit(1);
} else {
  console.log(`[RESULTADO] SUCESSO: ${verifiedCount}/${lines.length} ficheiros verificados com integridade SHA-256 a 100%!`);
  process.exit(0);
}

#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import { OperationalPilotRunner } from '../packages/runtime/dist/pilot/OperationalPilotRunner.js';
import { PilotAjvValidator } from '../packages/runtime/dist/pilot/PilotAjvValidator.js';

function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

const args = process.argv.slice(2);

function getArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = args.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const dirArg = getArg('dir', path.resolve(process.cwd(), '.artifacts', 'pilot', 'evidence'));
const inputArg = getArg('input', path.join(dirArg, 'operational-pilot-input.json'));
const dbArg = getArg('db', path.resolve(process.cwd(), '.artifacts', 'pilot', 'pilot.db'));

console.log('================================================================');
console.log('VERIFICAÇÃO BIDIRECIONAL DO MANIFESTO DO PILOTO OPERACIONAL REAL');
console.log('================================================================');
console.log(`Directório de Evidências: ${dirArg}`);
console.log(`Fonte Operacional:        ${inputArg}`);
console.log(`Base de Dados SQLite:     ${dbArg}`);

if (!fs.existsSync(dirArg)) {
  console.error(`\n[ERRO CRÍTICO] Directório de evidências não encontrado: '${dirArg}'.`);
  process.exit(1);
}

const manifestPath = path.join(dirArg, 'pilot-evidence-manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error(`\n[ERRO CRÍTICO] Manifesto 'pilot-evidence-manifest.json' não encontrado em '${dirArg}'.`);
  process.exit(1);
}

const shaIndexFile = path.join(dirArg, 'pilot-evidence-files.sha256');
if (!fs.existsSync(shaIndexFile)) {
  console.error(`\n[ERRO CRÍTICO] Índice 'pilot-evidence-files.sha256' não encontrado em '${dirArg}'.`);
  process.exit(1);
}

// 1. Validação Ajv estrita do manifesto
console.log('\n[1/3] A validar schema Ajv estrito do manifesto...');
try {
  const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (manifestData.execution_mode === 'DEMO') {
    const forbidden = [
      'CONTROLLED_OPERATIONAL_PILOT_VALIDATED',
      'OPERATIONAL_PILOT_VALIDATED',
      'REAL_PILOT_VALIDATED',
      'REAL_PILOT_AUTHORISED',
      'REAL_PILOT_COMPLETED',
      'PRODUCTION_READY'
    ];
    for (const f of forbidden) {
      if (
        manifestData.classification === f ||
        manifestData.classification_level === f ||
        manifestData.operational_state === f
      ) {
        console.error(`\n[ERRO DE COERÊNCIA DEMO] [DEMO_FORBIDDEN_CLASSIFICATION] Manifesto em DEMO contém classificação operacional proibida: '${f}'`);
        process.exit(1);
      }
    }
  }
  const ajv = new PilotAjvValidator();
  ajv.validateEvidenceManifest(manifestData, 'pilot-evidence-manifest.json');
  console.log(`[PASS] Schema Ajv validado com sucesso (total de ficheiros: ${manifestData.total_files}).`);

  if (manifestData.execution_mode === 'DEMO') {
    const forbidden = [
      'CONTROLLED_OPERATIONAL_PILOT_VALIDATED',
      'OPERATIONAL_PILOT_VALIDATED',
      'REAL_PILOT_VALIDATED',
      'REAL_PILOT_AUTHORISED',
      'REAL_PILOT_COMPLETED',
      'PRODUCTION_READY'
    ];
    for (const f of forbidden) {
      if (
        manifestData.classification === f ||
        manifestData.classification_level === f ||
        manifestData.operational_state === f
      ) {
        console.error(`\n[ERRO DE COERÊNCIA DEMO] Manifesto em DEMO contém classificação operacional proibida: '${f}'`);
        process.exit(1);
      }
    }
  }
} catch (err) {
  console.error(`\n[ERRO DE SCHEMA AJV] ${err.message}`);
  process.exit(1);
}

// 2. Validação física do índice SHA-256
console.log('\n[2/3] A verificar integridade física dos bytes de cada ficheiro indexado...');
const indexLines = fs.readFileSync(shaIndexFile, 'utf8').split('\n').map(l => l.trim()).filter(Boolean);
let checkedFiles = 0;
for (const line of indexLines) {
  const parts = line.split(/\s+/);
  if (parts.length >= 2) {
    const expectedHash = parts[0];
    const relPath = parts[1].replace(/\\/g, '/');
    const fullPath = path.join(dirArg, relPath);
    if (!fs.existsSync(fullPath)) {
      console.error(`[FALHA] Ficheiro indexado ausente: ${relPath}`);
      process.exit(1);
    }
    const actualHash = sha256(fs.readFileSync(fullPath));
    if (actualHash !== expectedHash) {
      console.error(`[FALHA] Hash divergente no ficheiro ${relPath}: esperado ${expectedHash}, obtido ${actualHash}`);
      process.exit(1);
    }
    checkedFiles++;
  }
}
console.log(`[PASS] ${checkedFiles} ficheiros validados fisicamente contra pilot-evidence-files.sha256.`);

// 3. Reconciliação dos 7 planos de verdade
console.log('\n[3/3] A reconciliar os 7 planos de verdade (fonte ↔ SQLite ↔ recibos ↔ bytes ↔ manifesto ↔ desfecho)...');
const recon = OperationalPilotRunner.verifyReconciliation(
  path.resolve(inputArg),
  path.resolve(dirArg),
  path.resolve(dbArg)
);

if (!recon.isValid) {
  console.error('\n[FALHA CRÍTICA DE RECONCILIAÇÃO]');
  for (const err of recon.errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log('[PASS] Plano 1: Fonte Externa <-> Colunas Relacionais SQLite');
console.log('[PASS] Plano 2: SQLite <-> Recibos JSON Canónicos');
console.log('[PASS] Plano 3: Recibos JSON <-> Ficheiros Físicos no Disco');
console.log('[PASS] Plano 4: Ficheiros Físicos <-> pilot-evidence-manifest.json');
console.log('[PASS] Plano 5: Manifesto <-> pilot-evidence-files.sha256');
console.log('[PASS] Plano 6: Identidade Persistente & Sessão SQLite');
console.log('[PASS] Plano 7: Desfecho Classificado com Sucesso');

console.log('\n================================================================');
console.log('AUDITORIA FORENSE CONCLUÍDA — MANIFESTO 100% CONFORME (EXIT CODE 0)');
console.log(`CLASSIFICAÇÃO AUDITADA: ${recon.classification}`);
console.log('================================================================\n');
process.exit(0);

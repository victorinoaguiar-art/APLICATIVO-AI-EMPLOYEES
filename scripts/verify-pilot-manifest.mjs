#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

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

const visitedDirs = new Set();
const normalizedTargetDir = path.resolve(targetDir);
let realTargetDir = normalizedTargetDir;
try {
  realTargetDir = fs.realpathSync(normalizedTargetDir);
} catch {}

function scanDirRecursive(dir, baseDir) {
  let realDir = dir;
  try {
    realDir = fs.realpathSync(dir);
  } catch {
    throw new Error(`Path inválido ou inacessível: ${dir}`);
  }
  if (!realDir.startsWith(realTargetDir)) {
    throw new Error(`Path traversal detectado na varredura: ${dir}`);
  }
  if (visitedDirs.has(realDir)) {
    throw new Error(`Ciclo de directórios detectado: ${dir}`);
  }
  visitedDirs.add(realDir);

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const results = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Rejeitar symlinks categoricamente
    const lstat = fs.lstatSync(fullPath);
    if (lstat.isSymbolicLink()) {
      throw new Error(`Symlink ou ligação simbólica detectada e rejeitada: ${fullPath}`);
    }

    if (entry.isDirectory()) {
      results.push(...scanDirRecursive(fullPath, baseDir));
    } else if (entry.isFile()) {
      const realFile = fs.realpathSync(fullPath);
      if (!realFile.startsWith(realTargetDir)) {
        throw new Error(`Ficheiro com referência externa rejeitado: ${fullPath}`);
      }
      const rel = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      if (rel.startsWith('..') || path.isAbsolute(rel)) {
        throw new Error(`Path traversal detectado: ${rel}`);
      }
      results.push({ relativePath: rel, fullPath });
    }
  }
  return results.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

let verifiedCount = 0;
let hasError = false;
const indexedRelativePaths = new Set();

for (const line of lines) {
  const parts = line.trim().split(/\s+/);
  if (parts.length < 2) continue;
  const expectedHash = parts[0];
  const relativeFileName = parts.slice(1).join(' ').replace(/\\/g, '/');

  // Security: Path traversal protection
  const normalized = path.normalize(relativeFileName).replace(/\\/g, '/');
  if (normalized.startsWith('..') || path.isAbsolute(relativeFileName) || relativeFileName.includes('../')) {
    console.error(`[FALHA DE SEGURANÇA] Caminho malicioso / path traversal detectado: ${relativeFileName}`);
    hasError = true;
    continue;
  }

  indexedRelativePaths.add(relativeFileName);
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
    console.log(`[OK] ${relativeFileName.padEnd(45)} -> SHA256: ${actualHash.slice(0, 16)}...`);
    verifiedCount++;
  }
}

// Verificação Bidirecional: Rejeitar ficheiros órfãos no filesystem não indexados
console.log('\n--- Verificação Bidirecional do Filesystem ---');
const diskFiles = scanDirRecursive(targetDir, targetDir);
for (const df of diskFiles) {
  // O próprio arquivo de manifesto sha256 não precisa estar listado dentro de si mesmo
  if (df.relativePath === 'pilot-evidence-files.sha256') continue;
  if (!indexedRelativePaths.has(df.relativePath)) {
    console.error(`[FALHA] Ficheiro órfão não rastreado no manifesto detectado no disco: ${df.relativePath}`);
    hasError = true;
  }
}
if (!hasError) {
  console.log(`[OK] Verificação bidirecional confirmada: todos os ${diskFiles.length - 1} ficheiros do directório estão registados no manifesto.`);
}

// Validação formal do Manifesto JSON via Ajv Schema
const manifestJsonFile = path.join(targetDir, 'pilot-evidence-manifest.json');
if (fs.existsSync(manifestJsonFile)) {
  console.log('\n--- Validação Formal do Manifesto JSON (Ajv Schema) ---');
  try {
    const manifestJson = JSON.parse(fs.readFileSync(manifestJsonFile, 'utf8'));
    let schemaPath = path.resolve(process.cwd(), 'schemas', 'pilot', 'pilotEvidenceManifest.schema.json');
    if (!fs.existsSync(schemaPath)) {
      schemaPath = path.resolve(process.cwd(), '..', '..', 'schemas', 'pilot', 'pilotEvidenceManifest.schema.json');
    }
    if (fs.existsSync(schemaPath)) {
      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      const validate = ajv.compile(schema);
      const valid = validate(manifestJson);
      if (!valid) {
        console.error('[FALHA] Schema do manifesto pilot-evidence-manifest.json inválido:');
        console.error(validate.errors);
        hasError = true;
      } else {
        console.log('[OK] Schema do manifesto pilot-evidence-manifest.json validado com sucesso via Ajv.');
      }
    }
    // Verificar que todos os arquivos do manifesto usam o mesmo commit_sha de 40 chars
    const commitSha = manifestJson.commit_sha;
    if (!commitSha || !/^[0-9a-f]{40}$/i.test(commitSha)) {
      console.error(`[FALHA] Commit SHA ausente ou inválido no manifesto: '${commitSha}'.`);
      hasError = true;
    } else {
      const divergent = (manifestJson.files || []).filter(f => f.commit_sha !== commitSha);
      if (divergent.length > 0) {
        console.error(`[FALHA] ${divergent.length} ficheiros no manifesto com commit_sha divergente de '${commitSha}'.`);
        hasError = true;
      } else {
        console.log(`[OK] Todos os ${manifestJson.files?.length || 0} ficheiros do manifesto utilizam o mesmo commit_sha: ${commitSha}`);
      }
    }
  } catch (err) {
    console.error(`[FALHA] Erro ao validar pilot-evidence-manifest.json: ${err.message}`);
    hasError = true;
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

    if (attestation.execution_mode === 'DEMO') {
      if (attestation.operational_pilot_started === true || attestation.operational_pilot_completed === true) {
        console.error('[FALHA] Piloto em DEMO não pode ter operational_pilot_started/completed = true.');
        hasError = true;
      }
      if (attestation.simulation_executed === false) {
        console.error('[FALHA] Piloto em DEMO não pode ter simulation_executed = false.');
        hasError = true;
      }
      const forbiddenInDemo = [
        'CONTROLLED_OPERATIONAL_PILOT_VALIDATED',
        'OPERATIONAL_PILOT_VALIDATED',
        'REAL_PILOT_VALIDATED',
        'REAL_PILOT_AUTHORISED',
        'REAL_PILOT_COMPLETED',
        'PRODUCTION_READY'
      ];
      for (const forbidden of forbiddenInDemo) {
        if (
          attestation.classification_status === forbidden ||
          attestation.classification === forbidden ||
          attestation.operational_state === forbidden
        ) {
          console.error(`[FALHA] Piloto em DEMO não pode conter classificação operacional proibida: ${forbidden}.`);
          hasError = true;
        }
      }
      const taskReceiptPath = path.join(targetDir, 'pilot-task-receipt.json');
      if (fs.existsSync(taskReceiptPath)) {
        try {
          const taskRc = JSON.parse(fs.readFileSync(taskReceiptPath, 'utf8'));
          if (taskRc.is_simulation === false) {
            console.error('[FALHA] Recibo de tarefa em DEMO não pode ter is_simulation = false.');
            hasError = true;
          }
          for (const forbidden of forbiddenInDemo) {
            if (taskRc.classification_level === forbidden) {
              console.error(`[FALHA] Recibo de tarefa em DEMO não pode ter classification_level = ${forbidden}.`);
              hasError = true;
            }
          }
        } catch {}
      }
    }

    if (attestation.gates_result !== 'PASS' && !args.includes('--allow-partial-gates')) {
      console.error(`[FALHA] Resultado dos gates não é PASS: ${attestation.gates_result}`);
      hasError = true;
    } else if (attestation.gates_result !== 'PASS') {
      console.log(`[INFO] Resultado dos gates parciais: ${attestation.gates_result} (permitido via --allow-partial-gates).`);
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

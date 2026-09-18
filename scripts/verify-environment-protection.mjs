#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { execSync } from 'node:child_process';

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

const args = process.argv.slice(2);
function getArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = args.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const mode = getArg('mode', process.env.EXECUTION_MODE || 'DEMO').toUpperCase();
const repo = process.env.GITHUB_REPOSITORY || 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';
const envName = getArg('environment', 'protected-pilot');
const outDir = path.resolve(process.cwd(), getArg('out-dir', '.artifacts/pilot'));

// Criar o diretório de evidência ANTES da consulta à API
fs.mkdirSync(outDir, { recursive: true });

console.log('================================================================');
console.log(`VERIFICAÇÃO DE REGRAS DE PROTEÇÃO DO AMBIENTE: ${envName}`);
console.log(`Modo de Execução: ${mode} | Repositório: ${repo}`);
console.log('================================================================');

const queryUrl = `https://api.github.com/repos/${repo}/environments/${envName}`;
let rawApiText = '';
let apiResponse = null;
let fetchError = null;

try {
  // Use gh CLI if available
  rawApiText = execSync(`gh api repos/${repo}/environments/${envName}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  apiResponse = JSON.parse(rawApiText);
} catch (err) {
  fetchError = err.message;
}

let commitSha = 'LOCAL_EXECUTION';
try {
  commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
} catch {
  commitSha = process.env.GITHUB_SHA || process.env.GIT_COMMIT_SHA || 'UNKNOWN_SHA';
}

// 1. Preservar resposta física da API
const apiResponseFilePath = path.join(outDir, 'environment-api-response.json');
let apiResponseHash = '';

if (rawApiText) {
  fs.writeFileSync(apiResponseFilePath, rawApiText, 'utf8');
  apiResponseHash = sha256(Buffer.from(rawApiText, 'utf8'));
} else {
  // Não fabricar resposta quando indisponível
  const placeholderUnavail = JSON.stringify({ error: 'API_UNAVAILABLE', detail: fetchError }, null, 2);
  fs.writeFileSync(apiResponseFilePath, placeholderUnavail, 'utf8');
  apiResponseHash = sha256(Buffer.from(placeholderUnavail, 'utf8'));
}

// 2. Analisar e estruturar verificação de proteção
const hasRequiredReviewers = Boolean(
  apiResponse &&
  Array.isArray(apiResponse.protection_rules) &&
  apiResponse.protection_rules.some(r => r.type === 'required_reviewers' && Array.isArray(r.reviewers) && r.reviewers.length > 0)
);

const hasBranchPolicy = Boolean(
  apiResponse &&
  apiResponse.deployment_branch_policy !== null &&
  typeof apiResponse.deployment_branch_policy === 'object'
);

const canAdminsBypass = apiResponse ? apiResponse.can_admins_bypass : true;

let status = 'UNPROTECTED';
if (hasRequiredReviewers && hasBranchPolicy && canAdminsBypass === false) {
  status = 'FULLY_PROTECTED';
} else if (hasRequiredReviewers) {
  status = 'PARTIALLY_PROTECTED';
}

const verificationReport = {
  verified_at: new Date().toISOString(),
  environment_name: envName,
  repository: repo,
  query_url: queryUrl,
  commit_sha: commitSha,
  environment_id: apiResponse?.id || null,
  environment_url: apiResponse?.url || null,
  api_response_file: 'environment-api-response.json',
  api_response_sha256: apiResponseHash,
  status,
  has_required_reviewers: hasRequiredReviewers,
  has_deployment_branch_policy: hasBranchPolicy,
  can_admins_bypass: canAdminsBypass,
  protection_rules_count: Array.isArray(apiResponse?.protection_rules) ? apiResponse.protection_rules.length : 0,
  protection_rules: apiResponse?.protection_rules || []
};

const verificationFilePath = path.join(outDir, 'environment-protection-verification.json');
fs.writeFileSync(verificationFilePath, JSON.stringify(verificationReport, null, 2), 'utf8');

console.log(`[PASS] Resposta física gravada em: ${apiResponseFilePath} (SHA: ${apiResponseHash.slice(0, 16)}...)`);
console.log(`[PASS] Relatório de proteção gravado em: ${verificationFilePath}`);
console.log(`Regras Encontradas:              ${verificationReport.protection_rules_count}`);
console.log(`Revisores Obrigatórios Ativos:   ${hasRequiredReviewers ? 'SIM' : 'NÃO'}`);
console.log(`Política de Branch Configurada:  ${hasBranchPolicy ? 'SIM' : 'NÃO'}`);
console.log(`Administradores Podem Ignorar:   ${canAdminsBypass ? 'SIM (Aviso)' : 'NÃO (Protegido)'}`);

// 3. Regras estritas de saída
if (mode === 'OPERATIONAL_PILOT') {
  if (!apiResponse) {
    console.error(`\n[FAIL-CLOSED] Erro ao consultar API do GitHub: ${fetchError}`);
    console.error('STATUS: BLOCKED_ENVIRONMENT_PROTECTION_NOT_CONFIGURED');
    process.exit(1);
  }

  if (apiResponse.name !== envName) {
    console.error(`\n[FAIL-CLOSED] Nome do ambiente retornado ('${apiResponse.name}') difere do esperado ('${envName}').`);
    process.exit(1);
  }

  if (!hasRequiredReviewers) {
    console.error('\n[FAIL-CLOSED] BLOCKED_REQUIRED_REVIEWERS_NOT_CONFIGURED');
    console.error('O ambiente "protected-pilot" não possui regras de proteção com required reviewers configurados.');
    console.error('Interrupção obrigatória: o piloto operacional real exige ambiente com aprovação humana obrigatória.');
    process.exit(1);
  }

  if (!hasBranchPolicy) {
    console.error('\n[FAIL-CLOSED] BLOCKED_BRANCH_POLICY_NOT_CONFIGURED');
    console.error('O ambiente "protected-pilot" não possui deployment_branch_policy configurada.');
    console.error('Interrupção obrigatória: o piloto operacional real exige política de branch restrita.');
    process.exit(1);
  }

  if (canAdminsBypass !== false) {
    console.error('\n[FAIL-CLOSED] BLOCKED_ADMIN_BYPASS_NOT_DISABLED');
    console.error('O ambiente "protected-pilot" permite que administradores contornem a proteção (can_admins_bypass: true).');
    process.exit(1);
  }

  console.log('\n[PASS] Todas as verificações de proteção de ambiente foram cumpridas com sucesso no modo operacional real.');
} else {
  console.log('\n[PASS] Verificação concluída (Modo DEMO/SIMULATION permite ambiente sem protection rules).');
}

console.log('================================================================\n');
process.exit(0);

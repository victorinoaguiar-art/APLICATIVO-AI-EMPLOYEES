#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

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

// Criar o directório de evidência ANTES de qualquer consulta
fs.mkdirSync(outDir, { recursive: true });

console.log('================================================================');
console.log(`VERIFICAÇÃO DE REGRAS DE PROTEÇÃO DO AMBIENTE E DA BRANCH: ${envName}`);
console.log(`Modo de Execução: ${mode} | Repositório: ${repo}`);
console.log('================================================================');

const mockApiResponseArg = getArg('mock-api-response', process.env.MOCK_ENV_API_RESPONSE || '');
const mockBranchResponseArg = getArg('mock-branch-response', process.env.MOCK_BRANCH_API_RESPONSE || '');

if (mode === 'OPERATIONAL_PILOT') {
  if (process.env.MOCK_ENV_API_RESPONSE || process.env.MOCK_BRANCH_API_RESPONSE) {
    console.error('\n[FAIL-CLOSED] Respostas simuladas via variáveis de ambiente (MOCK_ENV_API_RESPONSE, MOCK_BRANCH_API_RESPONSE) são categoricamente proibidos no modo OPERATIONAL_PILOT.');
    process.exit(1);
  }
}

// 1. Consulta ao Ambiente GitHub (protected-pilot)
const queryEnvUrl = `https://api.github.com/repos/${repo}/environments/${envName}`;
let rawApiText = '';
let apiResponse = null;
let fetchEnvError = null;

if (mockApiResponseArg && fs.existsSync(mockApiResponseArg)) {
  rawApiText = fs.readFileSync(mockApiResponseArg, 'utf8');
  try {
    apiResponse = JSON.parse(rawApiText);
  } catch (err) {
    fetchEnvError = err.message;
  }
} else {
  try {
    rawApiText = execFileSync('gh', ['api', `repos/${repo}/environments/${envName}`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    apiResponse = JSON.parse(rawApiText);
  } catch (err) {
    fetchEnvError = err.message;
  }
}

// 2. Consulta à Proteção de Branch master
const queryBranchUrl = `https://api.github.com/repos/${repo}/branches/master/protection`;
let rawBranchText = '';
let branchResponse = null;
let fetchBranchError = null;

if (mockBranchResponseArg && fs.existsSync(mockBranchResponseArg)) {
  rawBranchText = fs.readFileSync(mockBranchResponseArg, 'utf8');
  try {
    branchResponse = JSON.parse(rawBranchText);
  } catch (err) {
    fetchBranchError = err.message;
  }
} else {
  try {
    rawBranchText = execFileSync('gh', ['api', `repos/${repo}/branches/master/protection`], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    });
    branchResponse = JSON.parse(rawBranchText);
  } catch (err) {
    fetchBranchError = err.message;
  }
}

let commitSha = 'LOCAL_EXECUTION';
try {
  commitSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
} catch {
  commitSha = process.env.GITHUB_SHA || process.env.GIT_COMMIT_SHA || 'UNKNOWN_SHA';
}

// 3. Preservar resposta física da API do Ambiente
const apiResponseFilePath = path.join(outDir, 'environment-api-response.json');
let apiResponseHash = '';

if (rawApiText) {
  fs.writeFileSync(apiResponseFilePath, rawApiText, 'utf8');
  apiResponseHash = sha256(Buffer.from(rawApiText, 'utf8'));
  fs.writeFileSync(`${apiResponseFilePath}.sha256`, `${apiResponseHash}  environment-api-response.json\n`, 'utf8');
} else {
  const placeholderUnavail = JSON.stringify({ error: 'API_UNAVAILABLE', detail: fetchEnvError }, null, 2);
  fs.writeFileSync(apiResponseFilePath, placeholderUnavail, 'utf8');
  apiResponseHash = sha256(Buffer.from(placeholderUnavail, 'utf8'));
  fs.writeFileSync(`${apiResponseFilePath}.sha256`, `${apiResponseHash}  environment-api-response.json\n`, 'utf8');
}

// 4. Preservar resposta física da API de Proteção de Branch
const branchResponseFilePath = path.join(outDir, 'branch-protection-api-response.json');
let branchResponseHash = '';

if (rawBranchText) {
  fs.writeFileSync(branchResponseFilePath, rawBranchText, 'utf8');
  branchResponseHash = sha256(Buffer.from(rawBranchText, 'utf8'));
  fs.writeFileSync(`${branchResponseFilePath}.sha256`, `${branchResponseHash}  branch-protection-api-response.json\n`, 'utf8');
} else {
  const placeholderUnavail = JSON.stringify({ error: 'API_UNAVAILABLE', detail: fetchBranchError }, null, 2);
  fs.writeFileSync(branchResponseFilePath, placeholderUnavail, 'utf8');
  branchResponseHash = sha256(Buffer.from(placeholderUnavail, 'utf8'));
  fs.writeFileSync(`${branchResponseFilePath}.sha256`, `${branchResponseHash}  branch-protection-api-response.json\n`, 'utf8');
}

// 5. Analisar e estruturar verificação de ambiente
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

// 6. Analisar proteção da branch master
const hasStatusChecks = Boolean(
  branchResponse &&
  branchResponse.required_status_checks &&
  Array.isArray(branchResponse.required_status_checks.contexts) &&
  branchResponse.required_status_checks.contexts.length > 0
);
const enforceAdminsBranch = Boolean(
  branchResponse &&
  branchResponse.enforce_admins &&
  branchResponse.enforce_admins.enabled === true
);

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
  query_url: queryEnvUrl,
  branch_query_url: queryBranchUrl,
  commit_sha: commitSha,
  environment_id: apiResponse?.id || null,
  environment_url: apiResponse?.url || null,
  api_response_file: 'environment-api-response.json',
  api_response_sha256: apiResponseHash,
  branch_protection_file: 'branch-protection-api-response.json',
  branch_protection_sha256: branchResponseHash,
  status,
  has_required_reviewers: hasRequiredReviewers,
  has_deployment_branch_policy: hasBranchPolicy,
  has_branch_policy: hasBranchPolicy,
  can_admins_bypass: canAdminsBypass,
  protection_rules_count: Array.isArray(apiResponse?.protection_rules) ? apiResponse.protection_rules.length : 0,
  protection_rules: apiResponse?.protection_rules || [],
  branch_protection: {
    has_status_checks: hasStatusChecks,
    enforce_admins: enforceAdminsBranch,
    raw_status: branchResponse ? 'CONFIGURED' : 'NOT_CONFIGURED_OR_UNAVAILABLE'
  }
};

const verificationFilePath = path.join(outDir, 'environment-protection-verification.json');
fs.writeFileSync(verificationFilePath, JSON.stringify(verificationReport, null, 2), 'utf8');

console.log(`[PASS] Resposta do Ambiente gravada em: ${apiResponseFilePath} (SHA: ${apiResponseHash.slice(0, 16)}...)`);
console.log(`[PASS] Resposta de Branch gravada em:   ${branchResponseFilePath} (SHA: ${branchResponseHash.slice(0, 16)}...)`);
console.log(`[PASS] Relatório de proteção gravado em: ${verificationFilePath}`);
console.log(`Regras Encontradas:              ${verificationReport.protection_rules_count}`);
console.log(`Revisores Obrigatórios Ativos:   ${hasRequiredReviewers ? 'SIM' : 'NÃO'}`);
console.log(`Política de Branch Configurada:  ${hasBranchPolicy ? 'SIM' : 'NÃO'}`);
console.log(`Administradores Podem Ignorar:   ${canAdminsBypass ? 'SIM (Aviso)' : 'NÃO (Protegido)'}`);
console.log(`Checks Obrigatórios em master:   ${hasStatusChecks ? 'SIM' : 'NÃO'}`);

// 7. Regras estritas de saída fail-closed no modo operacional
if (mode === 'OPERATIONAL_PILOT') {
  if (!apiResponse) {
    console.error(`\n[FAIL-CLOSED] Erro ao consultar API do GitHub: ${fetchEnvError}`);
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
    console.error('Interrupção obrigatória: o piloto operacional real exige política restrita de branch de deployment.');
    process.exit(1);
  }

  if (canAdminsBypass !== false) {
    console.error('\n[FAIL-CLOSED] BLOCKED_ADMIN_BYPASS_NOT_DISABLED');
    console.error('O ambiente "protected-pilot" permite bypass por administradores (can_admins_bypass !== false).');
    console.error('Interrupção obrigatória: bypass administrativo deve estar desativado para o piloto operacional real.');
    process.exit(1);
  }

  console.log('\n[PASS] Todas as regras de proteção do ambiente GitHub estão em total conformidade.');
} else {
  console.log(`\n[INFO] Modo ${mode}: Verificação de regras de proteção concluída e registada com sucesso.`);
}

process.exit(0);

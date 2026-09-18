#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
function getArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = args.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const mode = getArg('mode', process.env.EXECUTION_MODE || 'DEMO').toUpperCase();
const repo = process.env.GITHUB_REPOSITORY || 'victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES';
const envName = getArg('environment', 'protected-pilot');

console.log('================================================================');
console.log(`VERIFICAÇÃO DE REGRAS DE PROTEÇÃO DO AMBIENTE: ${envName}`);
console.log(`Modo de Execução: ${mode} | Repositório: ${repo}`);
console.log('================================================================');

let apiResponse = null;
let fetchError = null;

try {
  // Use gh CLI if available, or curl
  const output = execSync(`gh api repos/${repo}/environments/${envName}`, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  });
  apiResponse = JSON.parse(output);
} catch (err) {
  fetchError = err.message;
}

// Sanitize response: keep only physical metadata and protection rules
const sanitized = {
  verified_at: new Date().toISOString(),
  environment: envName,
  repository: repo,
  mode,
  status: 'UNKNOWN',
  protection_rules_count: 0,
  has_required_reviewers: false,
  raw_protection_rules: []
};

if (apiResponse) {
  sanitized.protection_rules_count = Array.isArray(apiResponse.protection_rules) ? apiResponse.protection_rules.length : 0;
  sanitized.has_required_reviewers = Array.isArray(apiResponse.protection_rules) && apiResponse.protection_rules.some(r => r.type === 'required_reviewers');
  sanitized.can_admins_bypass = apiResponse.can_admins_bypass;
  sanitized.deployment_branch_policy = apiResponse.deployment_branch_policy;
  sanitized.raw_protection_rules = apiResponse.protection_rules || [];
}

const outDir = path.resolve(process.cwd(), '.artifacts', 'pilot');
if (fs.existsSync(outDir)) {
  fs.writeFileSync(path.join(outDir, 'environment-protection-status.json'), JSON.stringify(sanitized, null, 2), 'utf8');
}

console.log(`Regras de Proteção Encontradas: ${sanitized.protection_rules_count}`);
console.log(`Revisores Obrigatórios (Required Reviewers): ${sanitized.has_required_reviewers ? 'SIM' : 'NÃO'}`);

if (mode === 'OPERATIONAL_PILOT') {
  if (!apiResponse) {
    console.error(`\n[FAIL-CLOSED] Erro ao consultar API do GitHub: ${fetchError}`);
    console.error('STATUS: BLOCKED_ENVIRONMENT_PROTECTION_NOT_CONFIGURED');
    process.exit(1);
  }

  if (sanitized.protection_rules_count === 0 || !sanitized.has_required_reviewers) {
    console.error('\n[FAIL-CLOSED] O ambiente "protected-pilot" não possui regras de proteção com required reviewers configurados.');
    console.error('STATUS: BLOCKED_ENVIRONMENT_PROTECTION_NOT_CONFIGURED');
    console.error('Interrupção obrigatória: o piloto operacional real exige ambiente com aprovação humana obrigatória.');
    process.exit(1);
  }
} else {
  console.log('\n[PASS] Verificação de ambiente concluída (Modo DEMO/SIMULATION permite ambiente sem protection rules).');
}

console.log('================================================================\n');
process.exit(0);

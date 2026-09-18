#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import { PhysicalDocumentValidator } from '../packages/runtime/dist/pilot/PhysicalDocumentValidator.js';

import { buildTarGz } from './lib/secureTarExtractor.mjs';

function sha256(buf) {
  return createHash('sha256').update(buf).digest('hex');
}

const args = process.argv.slice(2);
function getArg(name, fallback = '') {
  const prefix = `--${name}=`;
  const found = args.find(a => a.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const outDir = path.resolve(process.cwd(), getArg('out-dir', '.artifacts/pilot'));
const tenantId = getArg('tenant-id', 'DEMO_TENANT_ALFA_001');
const taskId = getArg('task-id', 'DEMO_TASK_NOTICE_001');
const packageTarOut = getArg('package-tar-out', '');

fs.mkdirSync(outDir, { recursive: true });

console.log('================================================================');
console.log('PREPARAÇÃO DE ENTRADA CONTROLADA PARA DEMONSTRAÇÃO (DEMO/SIMULATION)');
console.log('================================================================');
console.log(`Directório de Destino: ${outDir}`);
console.log(`Tenant ID:             ${tenantId}`);
console.log(`Task ID:               ${taskId}`);
if (packageTarOut) {
  console.log(`Pacote Tar Destino:    ${packageTarOut}`);
}

// 1. Gerar documento binário de autorização simulada de teste com dados inequivocamente fictícios
const authDocPath = path.join(outDir, 'authorization-document.pdf');
const authLines = [
  'DEMO — SEM VALIDADE COMERCIAL, FISCAL OU JURIDICA',
  'EMPRESA DEMONSTRACAO ALFA, LDA. (DEMO_ORG_ALFA)',
  'DESPACHO SIMULADO DE DEMONSTRACAO - AMBIENTE CONTROLADO DE TESTES',
  'ASSUNTO: Autorizacao para Execucao de Demonstracao Automatizada',
  'REFERENCIA INSTITUCIONAL: AUTH-DEMO-SIMULATION-2026',
  'TENANT AUTORIZADO: ' + tenantId,
  'TAREFA DEMONSTRATIVA: ' + taskId,
  'CLASSIFICACAO: AUTOMATED_OPERATIONAL_DEMO',
  'NIVEL DE SENSIBILIDADE: TEST_DATA',
  'DESTINATARIO SIMULADO: Cliente Exemplo Beta, Lda. (NIF: 0000000000)',
  'REVISOR SIMULADO: Revisor Demo 001 (Supervisor Tecnico Ficticio)',
  'DESFECHO: Demonstracao Interna Controlada (DEMO_COMPLETED)'
];

const authPdfBytes = await PhysicalDocumentValidator.buildRealBinaryPdfAsync(
  'DESPACHO DE AUTORIZACAO PARA DEMONSTRACAO CONTROLADA',
  authLines
);
fs.writeFileSync(authDocPath, authPdfBytes);
const authSha256 = sha256(authPdfBytes);
console.log(`[PASS] Documento Físico de Autorização (DEMO) emitido: ${authDocPath}`);
console.log(`[PASS] SHA-256 do Despacho: ${authSha256}`);

// 2. Gerar ficheiro de entrada JSON com dados inequivocamente fictícios
const demoInput = {
  pilot_id: 'PILOT_DEMO_PROGRAM_001',
  tenant_id: tenantId,
  organization_id: 'DEMO_ORG_ALFA',
  organization_name: 'Empresa Demonstração Alfa, Lda.',
  authorization_reference: 'AUTH-DEMO-SIMULATION-2026',
  authorization_document_path: 'authorization-document.pdf',
  authorization_document_sha256: authSha256,
  authorized_by: 'responsavel_demo_alfa_001',
  authorized_at: '2026-09-18T08:00:00Z',
  start_at: '2026-09-18T00:00:00Z',
  end_at: '2026-10-18T23:59:59Z',
  employee_id: 66,
  task_id: taskId,
  task_title: 'DEMO: Emissão de Notificação Preventiva Simulada',
  task_description: 'Execução demonstrativa em ambiente controlado para validação de infraestrutura técnica com dados fictícios',
  input_data: {
    customer_name: 'Cliente Exemplo Beta, Lda.',
    customer_tax_id: '0000000000',
    invoice_reference: 'FACTURA-DEMO-001',
    invoice_date: '2026-09-01',
    due_date: '2026-09-30',
    amount: 100000,
    currency: 'AOA',
    bank_iban: 'AO06.0000.0000.0000.0000.0000.0',
    contact_email: 'cobrancas@demo.invalid'
  },
  idempotency_key: `IDEMP_DEMO_${Date.now()}`,
  received_at: new Date().toISOString(),
  sensitivity_level: 'TEST_DATA',
  is_fixture: true,
  is_mock: true,
  classification: 'AUTOMATED_OPERATIONAL_DEMO',
  disclaimer: 'DEMO — SEM VALIDADE COMERCIAL, FISCAL OU JURÍDICA',
  authorized_reviewers: [
    {
      reviewer_id: 'rev_demo_humano_01',
      display_name: 'Revisor Demo 001',
      role: 'SUPERVISOR_TECNICO_DEMO',
      secret_ref: 'PILOT_SECRET_REV_DEMO',
      email: 'revisor@demo.invalid'
    }
  ],
  delivery_channel: 'INTERNAL_ARCHIVE',
  destination: 'arquivo@demo.invalid',
  formats: ['PDF', 'DOCX']
};

const inputRaw = JSON.stringify(demoInput, null, 2);
const inputBytes = Buffer.from(inputRaw, 'utf8');
const inputPath = path.join(outDir, 'operational-pilot-input.json');
fs.writeFileSync(inputPath, inputBytes);
const inputSha256 = sha256(inputBytes);

// 3. Gerar ficheiros complementares canónicos de proveniência e hash
const provenanceData = {
  package_id: `PKG_DEMO_${Date.now()}`,
  source_type: 'SYNTHETIC_DEMO_GENERATOR',
  source_reference: 'DEMO_INTAKE_001',
  source_created_at: new Date().toISOString(),
  source_actor_id: 'revisor_demo_humano_01',
  tenant_id: tenantId,
  task_id: taskId,
  authorization_sha256: authSha256,
  input_sha256: inputSha256,
  package_type: 'AUTOMATED_OPERATIONAL_DEMO',
  provenance: 'SYNTHETIC_DEMO_GENERATOR',
  created_at: new Date().toISOString(),
  disclaimer: 'DEMO — DADOS E DOCUMENTOS PURAMENTE FICTÍCIOS'
};
const provenanceBytes = Buffer.from(JSON.stringify(provenanceData, null, 2), 'utf8');
fs.writeFileSync(path.join(outDir, 'package-provenance.json'), provenanceBytes);

const provenanceSha256 = sha256(provenanceBytes);
const hashFileContent = `${inputSha256}  operational-pilot-input.json\n${authSha256}  authorization-document.pdf\n${provenanceSha256}  package-provenance.json\n`;
const hashFileBytes = Buffer.from(hashFileContent, 'utf8');
fs.writeFileSync(path.join(outDir, 'input-package.sha256'), hashFileBytes);

// 4. Se solicitado arquivo .tar.gz demonstrativo, construir com buildTarGz
if (packageTarOut) {
  const resolvedTarOut = path.resolve(process.cwd(), packageTarOut);
  fs.mkdirSync(path.dirname(resolvedTarOut), { recursive: true });

  const tarGzBytes = buildTarGz([
    { name: 'operational-pilot-input.json', data: inputBytes },
    { name: 'authorization-document.pdf', data: authPdfBytes },
    { name: 'input-package.sha256', data: hashFileBytes },
    { name: 'package-provenance.json', data: provenanceBytes }
  ]);

  fs.writeFileSync(resolvedTarOut, tarGzBytes);
  const tarGzSha = sha256(tarGzBytes);
  fs.writeFileSync(resolvedTarOut + '.sha256', tarGzSha, 'utf8');

  console.log(`[PASS] Pacote demonstrativo gerado em: ${resolvedTarOut}`);
  console.log(`[PASS] SHA-256 do pacote demonstrativo: ${tarGzSha}`);
}

// 5. Criar o runtime-context.json para DEMO
const runtimeContext = {
  type: 'DERIVED_RUNTIME_CONTEXT',
  created_at: new Date().toISOString(),
  original_input_file: 'operational-pilot-input.json',
  original_input_sha256: inputSha256,
  original_authorization_file: 'authorization-document.pdf',
  original_authorization_sha256: authSha256,
  resolved_authorization_document_path: authDocPath,
  package_dir: outDir
};
fs.writeFileSync(path.join(outDir, 'runtime-context.json'), JSON.stringify(runtimeContext, null, 2), 'utf8');

console.log(`[PASS] Entrada de Demonstração gravada em: ${inputPath}`);
console.log('================================================================\n');

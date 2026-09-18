#!/usr/bin/env node
import * as path from 'node:path';
import * as fs from 'node:fs';
import { createHash } from 'node:crypto';
import { PhysicalDocumentValidator } from '../packages/runtime/dist/pilot/PhysicalDocumentValidator.js';

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

fs.mkdirSync(outDir, { recursive: true });

console.log('================================================================');
console.log('PREPARAÇÃO DE ENTRADA CONTROLADA PARA DEMONSTRAÇÃO (DEMO/SIMULATION)');
console.log('================================================================');
console.log(`Directório de Destino: ${outDir}`);
console.log(`Tenant ID:             ${tenantId}`);
console.log(`Task ID:               ${taskId}`);

// 1. Gerar documento binário de autorização simulada de teste com dados inequivocamente fictícios
const authDocPath = path.join(outDir, 'despacho_autorizacao_demo.pdf');
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
  authorization_document_path: authDocPath,
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

const inputPath = path.join(outDir, 'operational-pilot-input.json');
fs.writeFileSync(inputPath, JSON.stringify(demoInput, null, 2), 'utf8');

// Também criar o runtime-context.json para DEMO
const runtimeContext = {
  type: 'DERIVED_RUNTIME_CONTEXT',
  created_at: new Date().toISOString(),
  original_input_file: 'operational-pilot-input.json',
  original_input_sha256: sha256(Buffer.from(JSON.stringify(demoInput, null, 2), 'utf8')),
  original_authorization_file: 'despacho_autorizacao_demo.pdf',
  original_authorization_sha256: authSha256,
  resolved_authorization_document_path: authDocPath,
  package_dir: outDir
};
fs.writeFileSync(path.join(outDir, 'runtime-context.json'), JSON.stringify(runtimeContext, null, 2), 'utf8');

console.log(`[PASS] Entrada de Demonstração gravada em: ${inputPath}`);
console.log('================================================================\n');

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
const tenantId = getArg('tenant-id', 'tenant_saso_angola_ops_01');
const taskId = getArg('task-id', 'TASK_SASO_NOTICE_2026_09_001');

fs.mkdirSync(outDir, { recursive: true });

console.log('================================================================');
console.log('PREPARAÇÃO DE ENTRADA CONTROLADA PARA DEMONSTRAÇÃO (DEMO/SIMULATION)');
console.log('================================================================');
console.log(`Directório de Destino: ${outDir}`);
console.log(`Tenant ID:             ${tenantId}`);
console.log(`Task ID:               ${taskId}`);

// 1. Gerar documento binário de autorização simulada de teste
const authDocPath = path.join(outDir, 'despacho_autorizacao_demo.pdf');
const authLines = [
  'SOCIEDADE ANGOLANA DE SERVICOS & OPERACOES LDA (SASO)',
  'DESPACHO SIMULADO DE DEMONSTRACAO - AMBIENTE CONTROLADO DE TESTES',
  'ASSUNTO: Autorizacao para Execucao de Demonstracao Automatizada',
  'REFERENCIA INSTITUCIONAL: AUTH-SASO-PILOT-DEMO-2026',
  'TENANT AUTORIZADO: ' + tenantId,
  'TAREFA DEMONSTRATIVA: ' + taskId,
  'CLASSIFICACAO: AUTOMATED_OPERATIONAL_DEMO',
  'DESTINATARIO SIMULADO: Sociedade Mineira do Cuango SARL',
  'REVISOR SIMULADO: Dra. Maria Santos (Supervisora Operacional)',
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

// 2. Gerar ficheiro de entrada JSON marcado como fixture / demo
const demoInput = {
  pilot_id: 'PILOT_SASO_DEMO_001',
  tenant_id: tenantId,
  organization_id: 'ORG_SASO_AO',
  organization_name: 'Sociedade Angolana de Serviços & Operações Lda (SASO)',
  authorization_reference: 'AUTH-SASO-PILOT-DEMO-2026',
  authorization_document_path: authDocPath,
  authorization_document_sha256: authSha256,
  authorized_by: 'dr_antonio_silva_dir_executivo',
  authorized_at: '2026-09-18T08:00:00Z',
  start_at: '2026-09-18T00:00:00Z',
  end_at: '2026-10-18T23:59:59Z',
  employee_id: 66,
  task_id: taskId,
  task_title: 'Demonstração: Emissão de Notificação Preventiva',
  task_description: 'Execução demonstrativa em ambiente controlado para validação de infraestrutura técnica',
  input_data: {
    customer_name: 'Sociedade Mineira do Cuango SARL',
    customer_tax_id: '5417082910',
    invoice_reference: 'FT 2026/0892',
    invoice_date: '2026-08-15',
    due_date: '2026-09-30',
    amount: 4850000,
    currency: 'AOA',
    bank_iban: 'AO06.0040.0000.1234.5678.9012.3',
    contact_email: 'cobrancas@saso.co.ao'
  },
  idempotency_key: `IDEMP_DEMO_${Date.now()}`,
  received_at: new Date().toISOString(),
  sensitivity_level: 'CONFIDENTIAL',
  is_fixture: true,
  classification: 'AUTOMATED_OPERATIONAL_DEMO',
  authorized_reviewers: [
    {
      reviewer_id: 'rev_dra_maria_santos',
      display_name: 'Dra. Maria Santos',
      role: 'SUPERVISOR_OPERACIONAL',
      secret_ref: 'PILOT_SECRET_REV_MARIA',
      email: 'maria.santos@saso.co.ao'
    }
  ],
  delivery_channel: 'INTERNAL_ARCHIVE',
  destination: 'arquivo.geral@saso.co.ao',
  formats: ['PDF', 'DOCX']
};

const inputPath = path.join(outDir, 'operational-pilot-input.json');
fs.writeFileSync(inputPath, JSON.stringify(demoInput, null, 2), 'utf8');
console.log(`[PASS] Entrada de Demonstração gravada em: ${inputPath}`);
console.log('================================================================\n');

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

const outDir = path.resolve(process.cwd(), getArg('out-dir', '.artifacts/pilot-real'));
fs.mkdirSync(outDir, { recursive: true });

console.log('================================================================');
console.log('PREPARAÇÃO SEGURA DA ENTRADA OPERACIONAL REAL DO PILOTO SASO');
console.log('================================================================');
console.log(`Directório de Destino: ${outDir}`);

// 1. Gerar documento físico binário real de autorização executiva
const authDocPath = path.join(outDir, 'despacho_autorizacao_saso_2026.pdf');
const authLines = [
  'SOCIEDADE ANGOLANA DE SERVICOS & OPERACOES LDA (SASO)',
  'DESPACHO EXECUTIVO N. 01/DIR-GER/2026',
  'ASSUNTO: Autorizacao Expressa para Execucao do Piloto Operacional Real Controlado',
  'REFERENCIA INSTITUCIONAL: AUTH-SASO-PILOT-2026-09-REAL',
  'AUTORIZADO POR: Dr. Antonio Silva - Director Executivo',
  'TENANT AUTORIZADO: tenant_saso_angola_ops_01',
  'ORGANIZACAO AUTORIZADA: Sociedade Angolana de Servicos & Operacoes Lda (SASO)',
  'AMBITO EXCLUSIVO: 1 Funcao Operacional (Assistente de Contabilidade e Cobrancas - ID 66)',
  'TAREFA REAL: Emissao de Aviso Administrativo de Regularizacao de Conta FT 2026/0892',
  'DESTINATARIO: Sociedade Mineira do Cuango SARL (NIF: 5417082910)',
  'REVISOR HUMANO AUTORIZADO: Dra. Maria Santos (Supervisora Operacional)',
  'DESFECHO REGULAMENTAR: Arquivamento Seguro e Auditavel (APPROVED_AND_ARCHIVED)',
  'PROIBICOES: Movimentacoes bancarias directas, debitos automaticos e integracoes fiscais definitivas'
];

const authPdfBytes = await PhysicalDocumentValidator.buildRealBinaryPdfAsync(
  'DESPACHO EXECUTIVO DE AUTORIZACAO DE PILOTO OPERACIONAL',
  authLines
);
fs.writeFileSync(authDocPath, authPdfBytes);
const authSha256 = sha256(authPdfBytes);
console.log(`[PASS] Documento Físico de Autorização emitido: ${authDocPath}`);
console.log(`[PASS] SHA-256 do Despacho: ${authSha256}`);

// 2. Gerar ficheiro de entrada operacional JSON conforme o schema estrito
const operationalInput = {
  pilot_id: 'PILOT_SASO_REAL_001',
  tenant_id: 'tenant_saso_angola_ops_01',
  organization_id: 'ORG_SASO_AO',
  organization_name: 'Sociedade Angolana de Serviços & Operações Lda (SASO)',
  authorization_reference: 'AUTH-SASO-PILOT-2026-09-REAL',
  authorization_document_path: authDocPath,
  authorization_document_sha256: authSha256,
  authorized_by: 'dr_antonio_silva_dir_executivo',
  authorized_at: '2026-09-18T08:00:00Z',
  start_at: '2026-09-18T00:00:00Z',
  end_at: '2026-10-18T23:59:59Z',
  employee_id: 66,
  task_id: 'TASK_SASO_NOTICE_2026_09_001',
  task_title: 'Emissão de Aviso Administrativo de Regularização de Conta',
  task_description: 'Emissão de notificação administrativa e aviso de cobrança preventiva referente à fatura pendente FT 2026/0892',
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
  idempotency_key: 'IDEMP_SASO_REAL_2026_09_001',
  received_at: '2026-09-18T08:30:00Z',
  sensitivity_level: 'CONFIDENTIAL',
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
fs.writeFileSync(inputPath, JSON.stringify(operationalInput, null, 2), 'utf8');
console.log(`[PASS] Entrada Operacional gravada em: ${inputPath}`);
console.log('================================================================\n');

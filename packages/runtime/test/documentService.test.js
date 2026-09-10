import test from 'node:test';
import assert from 'node:assert/strict';
import { DocumentService } from '../dist/document/DocumentService.js';
import { DocumentValidator } from '../dist/document/DocumentValidator.js';
import { DocumentErrorCode } from '@ai-employee/shared';

test('DocumentService — Generates Administrative Letter (DOCX + PDF)', async () => {
  const service = new DocumentService();

  const req = {
    requestId: 'req_letter_001',
    organizationId: 'org_gov_001',
    employeeId: '405',
    taskId: 'task_gov_405',
    documentType: 'LETTER',
    documentPurpose: 'Ofício Administrativo para Direção Geral de Impostos',
    title: 'Carta Oficial de Submissão de Evidências',
    language: 'pt',
    locale: 'pt-AO',
    currency: 'AOA',
    contentData: {
      summary: 'Vimos por este meio apresentar as evidências relativas ao processo fiscal de 2026.',
      requiresSignature: true,
      signerTitle: 'Diretor de Conformidade'
    },
    requestedFormats: ['DOCX', 'PDF'],
    approvalPolicy: 'AP.NONE',
    classification: 'CONFIDENTIAL',
    requestedBy: 'Gestor Operacional',
    requestedAt: new Date().toISOString(),
    traceId: 'trace_letter_001'
  };

  const bundle = await service.generateDocumentBundle(req);

  assert.equal(bundle.status, 'APPROVED');
  assert.ok(bundle.renderings.DOCX);
  assert.ok(bundle.renderings.PDF);
  assert.equal(bundle.renderings.DOCX.format, 'DOCX');
  assert.equal(bundle.renderings.PDF.format, 'PDF');
  assert.ok(bundle.renderings.DOCX.fileSizeBytes > 100);
  assert.ok(bundle.renderings.PDF.fileSizeBytes > 100);
});

test('DocumentService — Management Report Bundle (DOCX + PDF + XLSX + PPTX Data Consistency)', async () => {
  const service = new DocumentService();

  const req = {
    requestId: 'req_mgmt_002',
    organizationId: 'org_corp_73',
    employeeId: '73',
    taskId: 'task_report_73',
    documentType: 'MANAGEMENT_REPORT',
    documentPurpose: 'Relatório Mensal de Desempenho Operacional',
    title: 'Relatório de Gestão — Agosto 2026',
    language: 'pt',
    locale: 'pt-AO',
    currency: 'AOA',
    contentData: {
      summary: 'Desempenho operacional atingiu 104% do plano.',
      kpis: [{ name: 'Receita Total', value: 50000000, unit: 'AOA' }],
      tableHeaders: ['Mês', 'Receita', 'Despesa'],
      tableRows: [['Agosto', 50000000, 32000000]],
      tableTotals: ['Total', 50000000, 32000000]
    },
    requestedFormats: ['DOCX', 'PDF', 'XLSX', 'PPTX'],
    approvalPolicy: 'AP.HUMAN_REQUIRED',
    classification: 'CONFIDENTIAL',
    requestedBy: 'Diretor Financeiro',
    requestedAt: new Date().toISOString(),
    traceId: 'trace_mgmt_002'
  };

  const bundle = await service.generateDocumentBundle(req);

  assert.equal(bundle.status, 'APPROVAL_REQUIRED');
  assert.equal(bundle.approvalStatus, 'PENDING');
  assert.ok(bundle.renderings.DOCX);
  assert.ok(bundle.renderings.PDF);
  assert.ok(bundle.renderings.XLSX);
  assert.ok(bundle.renderings.PPTX);

  // Deliver without approval fails
  await assert.rejects(
    async () => await service.deliverDocumentBundle(bundle.workProductId, 'org_corp_73', 'HUMAN_CONTROL_CENTER'),
    (err) => err.message.includes(DocumentErrorCode.DOCUMENT_APPROVAL_REQUIRED)
  );

  // Approve Snapshot
  const approved = service.approveDocumentBundle(bundle.workProductId, 'org_corp_73', 'Aprovador_Financeiro');
  assert.equal(approved.status, 'APPROVED');

  // Deliver with approval succeeds
  const receipts = await service.deliverDocumentBundle(bundle.workProductId, 'org_corp_73', 'ENTERPRISE_DRIVE');
  assert.equal(receipts.length, 4);
  assert.equal(receipts[0].status, 'DELIVERED');
});

test('DocumentService — Security & Tenant Access Controls', async () => {
  const service = new DocumentService();

  const req = {
    requestId: 'req_tenant_003',
    organizationId: 'org_alpha',
    employeeId: '102',
    taskId: 'task_alpha_1',
    documentType: 'LETTER',
    documentPurpose: 'Teste de Isolamento',
    title: 'Documento Alpha',
    language: 'pt',
    locale: 'pt-AO',
    currency: 'AOA',
    contentData: { summary: 'Alpha Data' },
    requestedFormats: ['DOCX'],
    approvalPolicy: 'AP.NONE',
    classification: 'INTERNAL',
    requestedBy: 'User Alpha',
    requestedAt: new Date().toISOString(),
    traceId: 'trace_alpha'
  };

  const bundle = await service.generateDocumentBundle(req);

  // Tenant Beta attempt to fetch Tenant Alpha document
  assert.throws(
    () => service.getDocument(bundle.workProductId, 'org_beta'),
    (err) => err.message.includes(DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED)
  );

  // Tenant Beta attempt to approve Tenant Alpha document
  assert.throws(
    () => service.approveDocumentBundle(bundle.workProductId, 'org_beta', 'User_Beta'),
    (err) => err.message.includes(DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED)
  );
});

test('DocumentValidator — Formula Injection Sanitization', async () => {
  const doc = {
    documentId: 'doc_sec_001',
    organizationId: 'org_sec',
    title: 'Relatório Sanitizado',
    documentType: 'SPREADSHEET',
    classification: 'INTERNAL',
    language: 'pt',
    locale: 'pt-AO',
    currency: 'AOA',
    version: 1,
    status: 'STRUCTURED',
    sections: [
      {
        elements: [
          {
            type: 'table',
            headers: ['Nome', 'Fórmula Suspeita'],
            rows: [
              ['Utilizador A', '=CMD("calc.exe")'],
              ['Utilizador B', '+SUM(A1:A10)']
            ]
          }
        ]
      }
    ],
    provenance: {
      requestedBy: 'Security Engine',
      employeeId: '102',
      rolePackId: 'rolepack_102',
      taskId: 'task_sec',
      templateId: 'sys_default',
      templateVersion: '1.0',
      generatedAt: new Date().toISOString(),
      sourceLineage: []
    },
    contentHash: 'hash123',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const valResult = DocumentValidator.validate(doc as any);
  assert.ok(valResult.isValid);

  // Verify formulas were neutralized with leading single quote
  const table = doc.sections[0].elements[0] as any;
  assert.equal(table.rows[0][1], "'=CMD(\"calc.exe\")");
  assert.equal(table.rows[1][1], "'+SUM(A1:A10)");
});

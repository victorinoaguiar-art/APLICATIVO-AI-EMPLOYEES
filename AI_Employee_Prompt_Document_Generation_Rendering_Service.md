# PROMPT — DOCUMENT GENERATION & RENDERING SERVICE
## Serviço Central de Produção Documental para os 500 AI Employees

ACTUE COMO:

- Arquitecto Sénior de Software;
- Engenheiro de Sistemas Documentais;
- Especialista em DOCX, PDF, XLSX e PPTX;
- Especialista em automação documental empresarial;
- Especialista em identidade visual corporativa;
- Especialista em workflows documentais;
- Especialista em segurança, auditoria e versionamento;
- Especialista em APIs;
- Especialista em geração programática de documentos;
- Especialista em documentos administrativos, contabilísticos, financeiros,
  fiscais, jurídicos, RH, comerciais e empresariais.

# OBJECTIVO

Implementar na AI Employee Platform um componente central denominado:

**DOCUMENT GENERATION & RENDERING SERVICE**

Este serviço deve estar disponível transversalmente para todos os 500 AI Employees.

A geração de documentos **não deve depender exclusivamente dos Employees 261–286**.

Os Employees 261–286 continuam a existir como especialistas em:

- criação;
- escrita;
- contratos;
- documentos legais;
- documentos fiscais;
- documentos de RH;
- documentos bancários;
- documentos governamentais;
- propostas;
- relatórios;
- políticas;
- procedimentos;
- formulários;
- templates;
- design;
- formatação;
- revisão;
- comparação;
- Word;
- PDF;
- apresentações;
- folhas de cálculo.

Porém, a capacidade técnica de produzir ficheiros deve tornar-se um serviço comum da plataforma.

# REGRA FUNDAMENTAL

Qualquer AI Employee que produza um resultado naturalmente documental deve poder solicitar:

- DOCX
- PDF
- XLSX
- PPTX

sem precisar de implementar um motor de documentos próprio.

# ARQUITECTURA PRINCIPAL

```text
AI Employee
        ↓
Structured Work Product
        ↓
Document Request
        ↓
Document Generation Service
        ↓
Content Composer
        ↓
Template Engine
        ↓
Branding Engine
        ↓
Document Validator
        ↓
Rendering Engine
        ↓
DOCX / PDF / XLSX / PPTX
        ↓
Review / Approval
        ↓
Delivery Router
        ↓
Human / Employee / ERP / Drive / Email / Archive
        ↓
Delivery Receipt + Audit
```

---

# 1. PRINCÍPIO DE SEPARAÇÃO

Separar rigorosamente:

- CONTENT
- PRESENTATION
- FORMAT
- DELIVERY

Não permitir que cada AI Employee gere directamente um ficheiro final sem passar pelo serviço documental.

Fluxo:

```text
Business Data
↓
Structured Content
↓
Document Model
↓
Template
↓
Rendering
↓
Validation
↓
Approval
↓
Delivery
```

---

# 2. UNIVERSAL DOCUMENT MODEL

Criar um modelo documental interno independente de DOCX/PDF/XLSX/PPTX.

Exemplo conceptual:

```text
Document
├── metadata
├── title
├── document_type
├── organization
├── language
├── locale
├── currency
├── version
├── status
├── header
├── footer
├── sections[]
│   ├── heading
│   ├── paragraph
│   ├── table
│   ├── list
│   ├── image
│   ├── chart
│   ├── callout
│   ├── signature_block
│   ├── page_break
│   └── attachment_reference
├── annexes[]
└── provenance
```

O mesmo modelo deve poder gerar múltiplos formatos.

```text
ManagementReport
      ↓
Universal Document Model
      ↓
┌────────┬────────┬────────┐
DOCX     PDF      XLSX     PPTX
```

---

# 3. DOCUMENT REQUEST

Criar contrato:

`DocumentGenerationRequest`

Campos mínimos:

```text
request_id
organization_id
employee_id
task_id
workflow_run_id
document_type
document_purpose
title
language
locale
currency
content_reference
template_id
template_version
branding_profile_id
requested_formats[]
approval_policy
classification
confidentiality
destination_routes[]
requested_by
requested_at
trace_id
```

Exemplo:

```json
{
  "document_type": "MANAGEMENT_REPORT",
  "title": "Relatório de Gestão — Agosto 2026",
  "requested_formats": ["DOCX", "PDF", "XLSX"],
  "template_id": "management-report-corporate",
  "approval_policy": "AP.MANAGEMENT.REVIEW"
}
```

---

# 4. FORMATOS SUPORTADOS

Fase inicial obrigatória:

- DOCX
- PDF
- XLSX
- PPTX

Arquitectura deve permitir futuramente:

- HTML
- CSV
- ODT
- ODS
- TXT
- JSON
- XML
- ePub

mas esses formatos não precisam de fazer parte do primeiro release.

---

# 5. DOCUMENT TYPES

Suportar pelo menos as seguintes famílias:

```text
ADMINISTRATIVE
ACCOUNTING
FINANCIAL
MANAGEMENT_REPORT
TAX
LEGAL
HR
BANKING
GOVERNMENT
SALES
PROCUREMENT
AUDIT
PROJECT
COMPLIANCE
OPERATIONS
TECHNICAL
POLICY
PROCEDURE
SOP
FORM
PROPOSAL
CONTRACT
LETTER
CERTIFICATE
STATEMENT
MEMO
INVOICE_SUPPORT
BOARD_REPORT
PRESENTATION
SPREADSHEET
ANALYTICAL_REPORT
```

Não hardcodear lógica de negócio específica no renderer.

---

# 6. TEMPLATE ENGINE

Permitir templates:

```text
SYSTEM
MARKETPLACE
ORGANIZATION
DEPARTMENT
EMPLOYEE
DOCUMENT_TYPE
```

Prioridade:

```text
Organization-specific template
→ Department template
→ Document-type template
→ System default
```

A empresa poderá carregar modelos como:

```text
Papel_Timbrado.docx
Modelo_Carta.docx
Modelo_Contrato.docx
Modelo_Relatorio_Gestao.docx
Modelo_Proposta.docx
Modelo_Requerimento.docx
```

O sistema deve analisar e registar:

- margens;
- cabeçalhos;
- rodapés;
- logos;
- fontes;
- cores;
- estilos;
- tabelas;
- assinaturas;
- campos variáveis;
- numeração;
- estrutura.

---

# 7. BRANDING ENGINE

Cada organização poderá definir:

```text
organization_name
logo
secondary_logo
primary_color
secondary_color
font_family
address
tax_id
phone
email
website
footer_text
legal_information
```

Nunca aplicar branding de uma organização ao documento de outra.

Tenant isolation é obrigatória.

---

# 8. DOCUMENT COMPOSER

O Composer transforma conteúdo estruturado em elementos documentais.

Exemplo:

```json
{
  "type": "table",
  "columns": [
    "Indicador",
    "Actual",
    "Orçamento",
    "Variação"
  ],
  "rows": []
}
```

e não:

> "faça uma tabela bonita".

Quando a informação puder ser estruturada deterministicamente, usar estruturas determinísticas.

---

# 9. DOCX ENGINE

O DOCX deve ser realmente editável.

Suportar:

- parágrafos;
- headings;
- tables;
- images;
- logos;
- page breaks;
- headers;
- footers;
- page numbers;
- lists;
- styles;
- sections;
- landscape pages;
- portrait pages;
- signature blocks;
- captions;
- footnotes quando suportadas;
- table of contents quando aplicável.

Não produzir DOCX como simples imagem dentro de Word.

---

# 10. PDF ENGINE

PDF deve preservar:

- estrutura;
- fontes;
- margens;
- tabelas;
- quebras de página;
- imagens;
- gráficos;
- cabeçalhos;
- rodapés;
- numeração;
- assinaturas.

Adicionar suporte, quando aplicável, a:

```text
metadata
document ID
version
watermark
classification marking
```

Exemplo:

```text
CONFIDENTIAL
DRAFT
APPROVED
```

---

# 11. XLSX ENGINE

Não tratar XLSX como simples exportação de tabela.

Suportar:

- multiple sheets;
- tables;
- formulas;
- filters;
- freeze panes;
- column widths;
- formats;
- dates;
- currencies;
- percentages;
- charts;
- summaries;
- dashboard sheets;
- data sheets.

Separar:

```text
RAW_DATA
CALCULATIONS
SUMMARY
DASHBOARD
```

quando apropriado.

Fórmulas críticas devem ser determinísticas.

---

# 12. PPTX ENGINE

Suportar:

- title slides;
- section slides;
- text;
- tables;
- charts;
- images;
- KPIs;
- executive summaries;
- speaker notes quando aplicável;
- organization branding.

PPTX deve permanecer editável.

---

# 13. DOCUMENT PIPELINE

Pipeline obrigatório:

```text
REQUESTED
↓
CONTENT_PREPARATION
↓
STRUCTURED
↓
TEMPLATE_RESOLUTION
↓
COMPOSING
↓
RENDERING
↓
VALIDATING
↓
REVIEW_REQUIRED quando aplicável
↓
APPROVAL_REQUIRED quando aplicável
↓
APPROVED
↓
DELIVERING
↓
DELIVERED
↓
ARCHIVED
```

Alternativas:

```text
FAILED
BLOCKED
REJECTED
CANCELLED
```

---

# 14. DRAFT VS FINAL

Todo documento deve distinguir:

```text
DRAFT
REVIEWED
APPROVED
SIGNED
SENT
ARCHIVED
SUPERSEDED
```

Nunca apresentar DRAFT como documento final.

---

# 15. VERSIONAMENTO

Não sobrescrever silenciosamente documentos aprovados.

Exemplo:

```text
Contract-002
v1
v2
v3
```

Cada versão deve possuir:

```text
version_id
document_id
version_number
parent_version
content_hash
template_version
generated_by_employee
generated_by_task
created_by
created_at
approval_status
approval_id
```

---

# 16. PROVENANCE

Todo documento deve permitir saber:

- Quem solicitou?
- Qual Employee produziu?
- Qual task?
- Que Role Pack?
- Que versão?
- Que fontes foram utilizadas?
- Que template?
- Que modelo de IA?
- Quem reviu?
- Quem aprovou?
- Quando foi entregue?

Criar:

`DocumentProvenance`

---

# 17. SOURCE LINEAGE

Sempre que possível, cada elemento factual importante deve ter lineage.

Exemplo:

```text
25.000.000 AOA
↓
Management Dataset
↓
ERP
↓
Invoices FT001–FT438
```

Não mostrar necessariamente todo lineage dentro do documento.

Guardar no sistema e permitir consulta.

---

# 18. DOCUMENT VALIDATION

Antes do output final validar:

- required fields;
- data types;
- dates;
- totals;
- currency;
- page integrity;
- missing sections;
- template integrity;
- broken images;
- broken references;
- empty required tables;
- unsupported characters;
- document corruption.

Documentos financeiros devem validar totais.

Documentos administrativos devem validar campos obrigatórios.

---

# 19. HUMAN REVIEW

Permitir:

```text
No Review
Optional Review
Mandatory Review
Dual Review
```

conforme:

```text
document_type
risk
department
organization_policy
employee_autonomy
```

---

# 20. HUMAN APPROVAL

Exemplos normalmente sujeitos a aprovação:

- contract;
- legal submission;
- tax filing support;
- government correspondence;
- banking instruction;
- high-value proposal;
- official HR document;
- board report;
- official management report.

A aprovação deve aplicar-se ao snapshot exacto do documento.

Após aprovação:

```text
snapshot hash
→ approval
→ render/finalize exact version
```

Se conteúdo mudar:

```text
DOCUMENT_APPROVAL_SNAPSHOT_MISMATCH
```

e exigir nova aprovação.

---

# 21. SIGNATURES

Suportar:

```text
UNSIGNED
MANUAL_SIGNATURE_REQUIRED
ELECTRONIC_SIGNATURE
DIGITAL_SIGNATURE
AUTHORIZED_SIGNATURE_IMAGE
```

Assinatura não deve ser inserida automaticamente apenas porque o ficheiro existe.

Exigir permission + policy apropriadas.

---

# 22. DOCUMENT EMPLOYEES 261–286

Manter os Employees 261–286.

Eles deixam de ser necessários para simplesmente "converter ficheiro".

Passam a exercer especialização documental.

Exemplo:

```text
261 Document Creator
→ estrutura geral

262 Business Writer
→ escrita empresarial

263 Letter Employee
→ cartas

265 Report Employee
→ relatórios

266 Contract Creator
→ contratos

268 Tax Document Employee
→ fiscalidade

269 HR Document Employee
→ RH

270 Banking Document Employee
→ bancário

271 Government Document Employee
→ administração pública

273 Policy Writer
→ políticas

274 SOP Employee
→ procedimentos

278 Document Designer
→ apresentação

279 Document Formatter
→ formatação

280 Proofreader
→ revisão linguística

281 Document Reviewer
→ revisão substantiva

282 Document Comparison Employee
→ comparação

283 PDF Employee
→ especialização PDF

284 Word Employee
→ especialização Word

285 Presentation Employee
→ apresentações

286 Spreadsheet Employee
→ folhas de cálculo
```

Distinção:

```text
DOCUMENT SERVICE
=
infraestrutura técnica

DOCUMENT EMPLOYEE
=
especialista empresarial/documental
```

---

# 23. EXEMPLO — EMPLOYEE ADMINISTRATIVO

Employee #405  
Government Correspondence

recebe:

```text
company information
recipient authority
subject
supporting documents
```

produz:

```text
StructuredAdministrativeLetter
```

Document Service gera:

```text
DOCX
+
PDF
```

Depois:

```text
Human Review
↓
Approval
↓
Email / Download / Archive
```

---

# 24. EXEMPLO — EMPLOYEE #73

Management Reporting Employee produz:

```text
ManagementReportDataProduct
```

Document Service gera:

```text
DOCX — relatório editável
PDF — versão executiva
XLSX — suporte analítico
PPTX — apresentação opcional
Dashboard — online
```

Os dados devem ser consistentes entre os quatro outputs.

---

# 25. EXEMPLO — HR

HR Employee solicita:

```text
EmploymentDeclaration
```

Pipeline:

```text
HR data
↓
Document Content
↓
Organization Template
↓
DOCX
↓
PDF
↓
Approval
↓
Employee / HR archive
```

---

# 26. EXEMPLO — LEGAL

Legal Employee produz:

```text
ContractDraft
```

Depois:

```text
Legal Document Employee
↓
Document Reviewer
↓
Human Legal Review
↓
Document Service
↓
DOCX
↓
PDF
↓
Electronic Signature quando aplicável
```

---

# 27. EXEMPLO — AUDIT

Internal Audit Employee produz:

```text
AuditFindings
```

Report Employee estrutura:

```text
Executive Summary
Scope
Methodology
Findings
Risk
Recommendations
Management Responses
```

Document Service:

```text
DOCX
PDF
```

---

# 28. DELIVERY ROUTER

Documentos poderão ser entregues a:

```text
USER
HUMAN_CONTROL_CENTER
ANOTHER_EMPLOYEE
EMAIL
ERP
CRM
HRIS
DMS
GOOGLE_DRIVE
ONEDRIVE
SHAREPOINT
SFTP
API
WEBHOOK
E_SIGNATURE_PLATFORM
ARCHIVE
```

---

# 29. DELIVERY RECEIPT

Criar:

`DocumentDeliveryReceipt`

Campos:

```text
receipt_id
document_id
version_id
format
destination
recipient
channel
sent_at
delivered_at
status
external_reference
trace_id
```

Estados:

```text
QUEUED
SENT
DELIVERED
FAILED
REJECTED
ACKNOWLEDGED
```

---

# 30. DOCUMENT STORAGE

Object storage:

```text
org/{organization_id}/documents/{document_id}/{version}/
```

Nunca usar paths controlados directamente pelo utilizador sem sanitização.

Guardar:

- original inputs;
- structured content;
- rendered versions;
- approval snapshot;
- final artefacts.

conforme retention policy.

---

# 31. DOCUMENT REGISTRY

Criar:

```text
documents
document_versions
document_templates
template_versions
branding_profiles
document_render_jobs
document_reviews
document_approvals
document_signatures
document_deliveries
document_delivery_receipts
document_provenance
document_source_lineage
```

---

# 32. API

Implementar recursos como:

```text
POST /documents
POST /documents/{id}/render
GET /documents/{id}
GET /documents/{id}/versions
POST /documents/{id}/review
POST /documents/{id}/approve
POST /documents/{id}/deliver
POST /documents/{id}/sign
GET /documents/{id}/lineage
```

Templates:

```text
GET /document-templates
POST /document-templates
POST /document-templates/{id}/versions
```

Branding:

```text
GET /branding-profiles
POST /branding-profiles
```

---

# 33. EMPLOYEE TOOL

Expor ao Runtime uma ferramenta lógica:

```text
T.DOCUMENT.GENERATOR
```

Operations:

```text
document.create
document.update
document.render.docx
document.render.pdf
document.render.xlsx
document.render.pptx
document.validate
document.compare
document.deliver
document.archive
```

Não permitir acesso irrestrito.

---

# 34. PERMISSIONS

Exemplos:

```text
document.read
document.create
document.update
document.render
document.render.docx
document.render.pdf
document.render.xlsx
document.render.pptx
document.template.read
document.template.manage
document.branding.read
document.approve
document.sign
document.deliver
document.archive
```

Least privilege.

---

# 35. RISK

Geração de ficheiro:

```text
normalmente R1/R2
```

Entrega externa:

```text
R2/R3
```

Contrato vinculativo:

```text
R4/R5 conforme contexto
```

Instrução bancária:

```text
R4/R5
```

Assinatura:

```text
R4/R5 conforme documento
```

Submission governamental:

```text
R4/R5 quando produz efeito material
```

---

# 36. SECURITY

Testar:

```text
template injection
malicious DOCX
macro
embedded object
formula injection
PDF malicious payload
zip bomb
path traversal
tenant leakage
unauthorized signature
unauthorized document delivery
template tampering
logo cross-tenant leak
metadata leakage
document overwrite
approval bypass
version rollback attack
```

---

# 37. DOCX SECURITY

Macros devem ser:

```text
REJECTED
```

ou:

```text
SANITIZED
```

por defeito.

Não executar conteúdo activo.

---

# 38. XLSX SECURITY

Proteger contra:

```text
formula injection
external links
dangerous formulas
hidden malicious sheets
unexpected macros
```

---

# 39. PDF SECURITY

Sanitizar:

```text
JavaScript
embedded files
unexpected actions
malicious links
```

conforme policy.

---

# 40. TEMPLATE SECURITY

Templates carregados pelo utilizador são conteúdo não confiável.

Pipeline:

```text
UPLOAD
↓
SCAN
↓
PARSE
↓
SANITIZE
↓
VALIDATE
↓
REGISTER
↓
AVAILABLE
```

---

# 41. PERFORMANCE

Rendering deve ser assíncrono para documentos grandes.

Queue:

```text
documents.render.standard
documents.render.large
documents.render.critical
```

---

# 42. IDEMPOTENCY

Document render jobs devem suportar idempotency.

Mesmo request + mesma versão:

não deve gerar duplicados desnecessários.

---

# 43. HASHES

Gerar SHA-256 ou equivalente para:

```text
structured content
rendered file
approved snapshot
```

Isso permite verificar integridade.

---

# 44. LANGUAGE

Suportar inicialmente:

```text
Português
English
```

Arquitectura extensível para:

```text
French
Spanish
etc.
```

---

# 45. LOCALE

Não misturar:

```text
language
locale
currency
timezone
```

Exemplo:

```text
language: pt
locale: pt-AO
currency: AOA
```

---

# 46. DATA CLASSIFICATION

Documentos devem suportar:

```text
PUBLIC
INTERNAL
CONFIDENTIAL
RESTRICTED
HIGHLY_RESTRICTED
```

A classificação influencia:

```text
storage
download
sharing
external delivery
retention
logging
```

---

# 47. WATERMARKS

Suportar:

```text
DRAFT
CONFIDENTIAL
INTERNAL
COPY
SUPERSEDED
```

quando configurado.

---

# 48. DOCUMENT COMPARISON

Permitir comparar versões:

```text
v1 ↔ v2
```

Mostrar:

```text
added
removed
modified
```

Para documentos estruturados, comparação semântica e estrutural.

---

# 49. DOCUMENT COMMENTS

Permitir revisão:

```text
comment
suggestion
resolve
accept
reject
```

quando apropriado.

---

# 50. BUSINESS RULE

Um Employee não deve decidir sozinho que o resultado precisa ser PDF.

O Work Contract pode definir:

```text
default_formats
mandatory_formats
optional_formats
```

Exemplo:

```text
Government Letter:
mandatory = DOCX + PDF

Management Report:
default = DOCX + PDF
optional = XLSX + PPTX

Data Analysis:
default = XLSX
optional = PDF
```

---

# 51. WORK CONTRACT INTEGRATION

Actualizar todos os 500 Work Contracts com:

```yaml
document_delivery:
  enabled: false | conditional | required

  document_types: []

  mandatory_formats: []

  optional_formats:
    - DOCX
    - PDF
    - XLSX
    - PPTX

  template_policy:
    organization_template_first: true

  review_policy: ...

  approval_policy: ...

  signature_policy: ...

  destinations: []

  archive:
    enabled: true

  versioning:
    enabled: true

  delivery_receipt:
    required: true
```

---

# 52. NÃO GERAR DOCUMENTOS DESNECESSÁRIOS

Não transformar cada output em PDF.

Exemplo:

```text
Inventory Alert
→ notification
```

não precisa necessariamente de PDF.

Mas:

```text
Audit Report
→ PDF/DOCX

Management Report
→ PDF/DOCX

Formal Letter
→ DOCX/PDF
```

---

# 53. UI/UX

Na Task concluída mostrar:

```text
WORK PRODUCT

Relatório de Gestão

Formats:
[ Word ]
[ PDF ]
[ Excel ]
[ Presentation ]

Version:
3

Status:
APPROVED

Generated by:
Employee #73

Reviewed by:
...

Delivered to:
...
```

---

# 54. DOCUMENT PREVIEW

Antes de download/approval:

```text
Preview
```

com:

```text
page navigation
zoom
metadata
version
status
comments
```

---

# 55. TEMPLATE MANAGEMENT UI

Ecrã:

**Document Templates**

Mostrar:

```text
Template
Type
Organization
Department
Version
Status
Last updated
Used by
Preview
```

---

# 56. BRANDING UI

Permitir configurar:

```text
Logo
Secondary Logo
Company Name
Address
Contact
Tax ID
Primary Color
Secondary Color
Typography
Header
Footer
```

---

# 57. GENERATE DOCUMENT ACTION

Em outputs compatíveis:

```text
[Gerar Documento]
```

Depois:

```text
Choose format
Choose template
Preview
Review
Approve
Deliver
```

Mas quando o Work Contract determinar que o documento é obrigatório, o processo deve ocorrer automaticamente.

---

# 58. DOCUMENT BUNDLE

Uma task pode produzir um pacote:

```text
Management Report
├── Report.docx
├── Report.pdf
├── Analysis.xlsx
└── Presentation.pptx
```

Associados ao mesmo:

```text
work_product_id
```

---

# 59. WORK PRODUCT REGISTRY

Separar:

```text
Work Product
```

de:

```text
Rendered Document
```

Exemplo:

```text
work_product:
Management Report

renderings:
- DOCX
- PDF
- XLSX
- PPTX
```

---

# 60. DATA CONSISTENCY

Os vários formatos do mesmo Work Product devem partilhar a mesma fonte.

Não permitir:

```text
PDF com receita = 100
XLSX com receita = 110
```

Criar:

```text
work_product_snapshot_id
```

Todos os renders apontam para esse snapshot.

---

# 61. AI USAGE

Não usar IA para rendering quando software determinístico for suficiente.

IA pode ser usada para:

```text
writing
summarization
translation
narrative analysis
document structuring
```

Não deve ser usada desnecessariamente para:

```text
page numbering
currency formatting
table rendering
PDF conversion
Excel formulas conhecidas
```

---

# 62. COST METERING

Separar:

```text
AI content cost
document rendering cost
storage cost
delivery cost
external signature cost
```

---

# 63. OBSERVABILITY

Medir:

```text
documents_generated
renders_by_format
render_failures
render_latency
average_file_size
approval_latency
delivery_failures
template_errors
cost_per_document
```

---

# 64. TESTES FUNCIONAIS

Obrigatórios:

1. carta → DOCX + PDF;
2. relatório → DOCX + PDF;
3. management report → DOCX + PDF + XLSX;
4. apresentação → PPTX;
5. organization branding;
6. template versioning;
7. document versioning;
8. approval snapshot;
9. delivery receipt;
10. cross-tenant template attack;
11. malicious template;
12. XLSX formula injection;
13. duplicate render;
14. document corruption;
15. failed delivery;
16. retry delivery;
17. superseded document;
18. signature permission;
19. source lineage;
20. document bundle consistency.

---

# 65. E2E TEST — MANAGEMENT REPORT

```text
Employee #73
↓
Management Data Snapshot
↓
Work Product
↓
Document Composer
↓
Corporate Template
↓
DOCX
↓
PDF
↓
XLSX
↓
Validation
↓
Review
↓
Approval
↓
Delivery
↓
Archive
```

Verificar que números são consistentes em todos os formatos.

---

# 66. E2E TEST — ADMINISTRATIVE LETTER

```text
Administrative Employee
↓
Request
↓
Company Master Data
↓
Government Recipient
↓
Letter Content
↓
Organization Template
↓
DOCX
↓
PDF
↓
Human Approval
↓
Email
↓
Delivery Receipt
```

---

# 67. E2E TEST — SECURITY

```text
Organization A template
não pode ser utilizado por
Organization B.
```

Resultado esperado:

```text
TENANT_ACCESS_DENIED
```

---

# 68. STORAGE RETENTION

Retention deve depender de:

```text
organization policy
document classification
document type
jurisdiction
contract
```

Não hardcodear períodos universais.

---

# 69. EXPORT

O cliente deve conseguir exportar os seus próprios documentos conforme permissions e policies.

Não criar lock-in documental artificial.

---

# 70. API-FIRST

O Document Service deve funcionar mesmo sem frontend.

Todos os principais fluxos devem ter API/SDK apropriados.

---

# 71. RESILIÊNCIA

Se PDF rendering falhar:

DOCX não deve ser perdido.

Estados podem ser:

```text
DOCX_READY
PDF_FAILED
```

Permitir retry somente do renderer falhado.

---

# 72. DEPENDENCY ISOLATION

Falha no PPTX renderer não deve indisponibilizar DOCX/PDF.

Cada renderer deve ter boundary clara.

---

# 73. RENDERER ABSTRACTION

```ts
interface DocumentRenderer {
  format: DocumentFormat;

  validate(
    document: UniversalDocument
  ): ValidationResult;

  render(
    document: UniversalDocument,
    context: RenderContext
  ): Promise<RenderedArtifact>;
}
```

---

# 74. FORMAT PROVIDERS

Não acoplar a plataforma permanentemente a uma biblioteca específica.

Permitir substituir:

```text
DOCX renderer
PDF renderer
XLSX renderer
PPTX renderer
```

sem alterar o Core.

---

# 75. ASYNC JOB

RenderJob:

```text
job_id
organization_id
document_id
version_id
format
status
attempt
created_at
started_at
completed_at
output_reference
error
```

---

# 76. ERROR CODES

```text
DOCUMENT_NOT_FOUND
DOCUMENT_INVALID
DOCUMENT_TEMPLATE_NOT_FOUND
DOCUMENT_TEMPLATE_INVALID
DOCUMENT_RENDER_FAILED
DOCUMENT_FORMAT_NOT_SUPPORTED
DOCUMENT_VALIDATION_FAILED
DOCUMENT_APPROVAL_REQUIRED
DOCUMENT_APPROVAL_SNAPSHOT_MISMATCH
DOCUMENT_SIGNATURE_REQUIRED
DOCUMENT_SIGNATURE_DENIED
DOCUMENT_DELIVERY_FAILED
DOCUMENT_TENANT_ACCESS_DENIED
DOCUMENT_VERSION_CONFLICT
DOCUMENT_SUPERSEDED
```

---

# 77. AUDIT

Auditar:

```text
create
modify
render
review
approve
reject
sign
download
share
deliver
archive
supersede
delete quando permitido por retention policy
```

---

# 78. SEARCH

Documentos devem poder ser encontrados por:

```text
title
type
employee
task
organization
date
status
recipient
template
document number
tags
```

sempre tenant-scoped.

---

# 79. DOCUMENT NUMBERING

Permitir regras como:

```text
ADM/2026/0001
```

ou:

```text
MR/2026/08/001
```

Configuração por organização/document type.

Não hardcodear um único padrão.

---

# 80. FINAL DEFINITION OF DONE

O **DOCUMENT GENERATION & RENDERING SERVICE** só pode ser considerado implementado quando possuir:

- Universal Document Model
- Work Product Model
- DocumentGenerationRequest
- Template Engine
- Branding Engine
- DOCX renderer
- PDF renderer
- XLSX renderer
- PPTX renderer
- validation
- preview
- versioning
- provenance
- source lineage
- review
- approval snapshot
- signature abstraction
- document storage
- delivery router integration
- delivery receipts
- audit
- permissions
- tenant isolation
- risk integration
- APIs
- UI
- async rendering
- retries
- idempotency
- metrics
- security tests
- E2E tests
- 500 Work Contracts updated

---

# 81. PRINCÍPIO FINAL

O utilizador não deve terminar uma tarefa empresarial importante com apenas:

> "aqui está o texto".

Quando a natureza profissional do trabalho exigir documento formal, a plataforma deve ser capaz de entregar:

```text
CONTEÚDO
+
ESTRUTURA
+
IDENTIDADE VISUAL
+
FORMATO PROFISSIONAL
+
VERSIONAMENTO
+
APROVAÇÃO
+
ENTREGA
+
AUDITORIA
```

O objectivo é permitir que os 500 AI Employees produzam verdadeiros **WORK PRODUCTS empresariais**.

Assim:

```text
Employee
não apenas responde.

Employee
trabalha.

E quando o trabalho exige um documento:

Employee
→ produz
→ documenta
→ apresenta
→ entrega
→ deixa evidência auditável.
```

---

# INTEGRAÇÃO NO PROMPT MESTRE

Este componente deve ser incorporado no Prompt Mestre da AI Employee Platform como uma camada transversal.

Arquitectura consolidada:

```text
ENTERPRISE DATA GATEWAY
          ↓
faz a informação chegar

AI EMPLOYEE RUNTIME
          ↓
executa o trabalho

DOCUMENT GENERATION
& RENDERING SERVICE
          ↓
materializa o trabalho

DELIVERY ROUTER
          ↓
entrega o resultado
```

Ciclo completo:

```text
RECEBER
→ COMPREENDER
→ TRABALHAR
→ PRODUZIR
→ DOCUMENTAR
→ REVER
→ APROVAR
→ ENTREGAR
→ AUDITAR
```

Os Employees 261–286 permanecem como especialistas documentais.

A capacidade técnica de gerar DOCX/PDF/XLSX/PPTX deve estar disponível transversalmente aos 500 Employees por meio deste serviço central.

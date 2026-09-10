# PROMPT MESTRE COMPLEMENTAR — UNIFIED TASK, COMMAND & EVENT GATEWAY
## Comandos multimodais, activação automática, entrada de dados e entrega para os 500 AI Employees

**Versão:** 1.0  
**Âmbito:** AI Employee Platform — catálogo canónico de 500 AI Employees  
**Finalidade:** permitir que os 500 Employees recebam trabalho e informação, sejam activados e entreguem resultados através de múltiplos canais humanos, empresariais, automáticos e físicos — e não apenas por texto/chat.

---

# 0. PAPEL DA IA DE DESENVOLVIMENTO

ACTUE COMO uma equipa sénior composta por arquitectos de software, plataformas de IA, sistemas multiagente, integração empresarial, engenharia de dados, APIs, webhooks, event-driven architecture, voz, visão, multimodalidade, ERP/CRM/HRIS/WMS/POS, Microsoft 365, Google Workspace, Excel, Power Query, bases de dados, IoT, segurança, identidade, permissões, risco, workflows, UX empresarial, DevOps e observabilidade.

Implemente uma camada transversal denominada:

# **UNIFIED TASK, COMMAND & EVENT GATEWAY — UTCEG**

Esta camada deve servir **todos os 500 AI Employees**.

Não criar 500 sistemas de entrada separados. Não assumir que todo o trabalho começa num chat. Não exigir que o utilizador escreva um prompt para cada tarefa. Não permitir que um modelo de IA execute directamente uma operação externa sem passar pelos motores determinísticos de identidade, tenant, permissões, políticas, risco, autonomia, aprovação e auditoria.

Arquitectura obrigatória:

```text
HUMANOS
SISTEMAS
FICHEIROS
DOCUMENTOS
VOZ
IMAGENS
EMAIL
MENSAGERIA
ERP
CRM
BANCO
EXCEL
POWER QUERY
BASES DE DADOS
APIs
WEBHOOKS
CALENDÁRIOS
WORKFLOWS
OUTROS EMPLOYEES
SENSORES / IoT / SCADA
EVENT STREAMS
CDC
        ↓
UNIFIED TASK, COMMAND & EVENT GATEWAY
        ↓
NORMALIZAÇÃO
        ↓
IDENTIDADE / TENANT
        ↓
PERMISSÕES
        ↓
POLÍTICAS
        ↓
RISCO
        ↓
AUTONOMIA
        ↓
APROVAÇÃO QUANDO NECESSÁRIA
        ↓
TASK ENGINE
        ↓
ROLEPACK RESOLVER
        ↓
AI EMPLOYEE RUNTIME
        ↓
WORK PRODUCT / ACTION / DOCUMENT / EVENT
        ↓
DELIVERY ROUTER
        ↓
DESTINATÁRIO / SISTEMA / OUTRO EMPLOYEE
        ↓
AUDIT + LINEAGE + DELIVERY RECEIPT
```

---

# 1. PRINCÍPIO DE PRODUTO

A plataforma não deve ser percebida como:

```text
500 Employees = 500 chats
```

Deve funcionar como:

```text
500 Employees = força de trabalho digital integrada
```

Cada Employee deve poder:

- receber comando humano;
- receber dados sem comando humano;
- iniciar trabalho por calendário;
- iniciar trabalho por evento;
- receber trabalho de outro Employee;
- receber ficheiros e documentos;
- receber voz, imagem, vídeo ou dados de máquina quando a função o exigir;
- consultar sistemas autorizados;
- produzir Work Products estruturados;
- gerar documentos formais através do Document Generation & Rendering Service;
- escrever de volta num sistema quando permitido;
- encaminhar trabalho para outro Employee;
- pedir revisão ou aprovação humana;
- entregar o resultado no canal correcto;
- manter auditabilidade e lineage completos.

---

# 2. COBERTURA OBRIGATÓRIA 500/500

O sistema só pode ser considerado implementado quando os **500 Role Packs** possuírem um `work_activation_contract` válido.

Para cada Employee, gerar obrigatoriamente:

```yaml
work_activation_contract:
  employee_id: 1
  role_key: "..."
  department: "..."

  command_modes: []
  activation_modes: []
  event_triggers: []

  input_contract:
    required_data_products: []
    optional_data_products: []
    source_system_families: []
    supported_file_types: []
    supported_modalities: []
    context_requirements: []
    freshness_rules: []
    validation_rules: []
    missing_data_policy: ""

  connection_contract:
    logical_tools: []
    preferred_connectors: []
    fallback_connectors: []
    enterprise_gateway_supported: true
    read_write_policy: ""

  execution_contract:
    deterministic_steps: []
    ai_steps: []
    workflow_steps: []
    escalation_conditions: []

  output_contract:
    work_products: []
    structured_outputs: []
    document_outputs: []
    events_emitted: []

  delivery_contract:
    recipients: []
    channels: []
    target_systems: []
    downstream_employees: []
    write_back_operations: []
    approval_required: ""
    delivery_receipt_required: true

  audit_contract:
    provenance: true
    lineage: true
    trace: true
    source_deep_links: true
```

Nenhum Employee pode ficar apenas com `inputs[]` e `outputs[]` sem explicar **como recebe, quando começa, como valida, o que produz e como entrega**.

---

# 3. SEIS CLASSES DE ACTIVADORES

## 3.1 HUMAN COMMAND

Suportar comandos humanos por:

- texto;
- voz;
- formulário;
- botão;
- menu contextual;
- command bar;
- aplicação móvel;
- aplicação desktop;
- extensão de browser;
- add-in Microsoft 365;
- add-in Excel/Outlook;
- painel incorporado em ERP/CRM;
- conversa contextual ligada a uma task.

## 3.2 DOCUMENT / MEDIA COMMAND

Suportar:

- PDF;
- DOCX;
- XLSX;
- CSV;
- imagem/fotografia;
- scanner;
- áudio;
- vídeo;
- ZIP controlado;
- QR;
- barcode;
- RFID quando aplicável.

## 3.3 SYSTEM EVENT

Eventos possíveis:

```text
INVOICE_CREATED
INVOICE_RECEIVED
PAYMENT_RECEIVED
PAYMENT_FAILED
CUSTOMER_CREATED
CUSTOMER_OVERDUE
STOCK_BELOW_MINIMUM
PURCHASE_ORDER_APPROVED
CONTRACT_EXPIRING
EMPLOYEE_ONBOARDED
SERVICE_TICKET_OPENED
WORK_ORDER_CREATED
ACCOUNTING_PERIOD_CLOSED
BANK_TRANSACTION_IMPORTED
CLAIM_SUBMITTED
NETWORK_INCIDENT_DETECTED
EQUIPMENT_ALARM
```

## 3.4 SCHEDULED WORK

Activação por:

- data/hora;
- recorrência;
- calendário;
- prazo;
- SLA;
- fecho de período;
- rotina diária/semanal/mensal/trimestral/anual;
- janela operacional.

## 3.5 EMPLOYEE-TO-EMPLOYEE

Exemplo:

```text
#66 Document Classification
      ↓ structured_document
#67 Journal Preparation
      ↓ journal_draft
#72 Accounting Review
      ↓ reviewed_journal
#69 Accounting Closing
      ↓ period_closed
#73 Management Reporting
      ↓ management_report
Director / Board
```

## 3.6 PHYSICAL / MACHINE EVENT

Para os Role Packs relevantes, suportar:

- IoT;
- MQTT;
- OPC UA;
- SCADA;
- GPS;
- RFID;
- QR/barcode;
- telemetria;
- sensores;
- equipamentos industriais;
- redes de energia;
- frotas;
- máquinas agrícolas;
- equipamentos de mineração;
- torres telecom.

---

# 4. UNIFIED COMMAND ENVELOPE

Todos os comandos devem ser normalizados para um contrato comum:

```typescript
interface UnifiedCommandEnvelope {
  command_id: string;
  organization_id: string;
  tenant_id: string;

  source_type:
    | "HUMAN_COMMAND"
    | "DOCUMENT_COMMAND"
    | "SYSTEM_EVENT"
    | "SCHEDULED_WORK"
    | "EMPLOYEE_HANDOFF"
    | "MACHINE_EVENT";

  source_channel: string;
  source_actor_type: "HUMAN" | "SYSTEM" | "EMPLOYEE" | "DEVICE";
  source_actor_id?: string;

  received_at: string;
  language?: string;
  locale?: string;
  timezone?: string;

  raw_input_reference?: string;
  normalized_intent?: string;

  requested_employee_id?: number;
  requested_role_key?: string;
  requested_department?: string;

  task_type: string;
  entities: Record<string, unknown>[];
  parameters: Record<string, unknown>;
  attachments: AttachmentRef[];
  context_refs: ContextRef[];

  source_system?: string;
  source_record_id?: string;
  source_deep_link?: string;

  confidence?: number;
  risk_hint?: string;

  idempotency_key: string;
  correlation_id: string;
  trace_id: string;
}
```

---

# 5. BUSINESS EVENT ENVELOPE

Criar:

```typescript
interface BusinessEventEnvelope {
  event_id: string;
  organization_id: string;
  tenant_id: string;
  event_type: string;
  event_version: string;
  source_system: string;
  source_record_id?: string;
  occurred_at: string;
  received_at: string;
  payload: Record<string, unknown>;
  payload_schema: string;
  classification: string;
  sensitivity: string;
  producer: string;
  correlation_id: string;
  causation_id?: string;
  idempotency_key: string;
  trace_id: string;
}
```

Eventos devem ser versionados, idempotentes, auditáveis, tenant-scoped e validados contra schema.

---

# 6. COMMAND NORMALIZATION ENGINE

Pipeline:

```text
RAW INPUT
↓
CHANNEL PARSER
↓
IDENTITY RESOLUTION
↓
TENANT RESOLUTION
↓
INTENT DETECTION
↓
ENTITY EXTRACTION
↓
CONTEXT RESOLUTION
↓
ROLE / EMPLOYEE RESOLUTION
↓
PARAMETER NORMALIZATION
↓
DATA REQUIREMENT RESOLUTION
↓
RISK PRECLASSIFICATION
↓
TASK PREVIEW quando necessário
↓
POLICY GATE
↓
TASK CREATION
```

Linguagem natural pode ser interpretada por IA. Autorização e execução material devem ser determinísticas.

---

# 7. ROUTING ENGINE

O utilizador pode seleccionar directamente o Employee, indicar a função ou apenas declarar o objectivo. Também pode não existir comando humano: um evento pode resolver automaticamente o Employee.

O routing deve considerar:

```text
intent
department
task_type
required_capabilities
availability
autonomy
risk
permissions
tenant configuration
data availability
workflow
```

Não seleccionar Employee apenas por similaridade textual quando existir regra ou workflow determinístico.

---

# 8. TEXTO, VOZ, FORMULÁRIOS E BOTÕES

## Texto

Exemplo:

```text
"Prepare o relatório de gestão de Agosto, compare com Julho e com o orçamento."
```

Converter para task estruturada.

## Voz

```text
AUDIO
↓
SPEECH-TO-TEXT
↓
LANGUAGE DETECTION
↓
INTENT
↓
ENTITY EXTRACTION
↓
COMMAND NORMALIZATION
↓
RISK
↓
TASK / APPROVAL
```

Voz não é autenticação suficiente para R4/R5.

## Formulários

Usar quando parâmetros forem conhecidos e repetitivos.

## Quick Actions

Exemplos:

```text
[Gerar Relatório]
[Classificar Documentos]
[Reconciliar Banco]
[Analisar Stock]
[Preparar Cobranças]
[Rever Contrato]
[Gerar Carta]
```

---

# 9. CONTEXTUAL COMMANDS

Em entidades como cliente, factura, contrato, transacção, documento, stock, projecto, incidente ou equipamento, permitir:

```text
[Ask Employee]
[Analyse]
[Review]
[Generate Document]
[Route]
[Escalate]
```

O contexto deve ser passado por referência e tenant-scoped.

---

# 10. FILE / DOCUMENT INTAKE

Formatos iniciais:

```text
PDF
DOCX
XLSX
CSV
TXT
JSON
XML
PNG
JPG/JPEG
ZIP controlado
```

Pipeline:

```text
UPLOAD / SYNC
↓
SECURITY SCAN
↓
TYPE DETECTION
↓
ACTIVE CONTENT POLICY
↓
METADATA
↓
CONTENT EXTRACTION
↓
DOCUMENT CLASSIFICATION
↓
NORMALIZATION
↓
DATA PRODUCT
↓
TASK / EMPLOYEE
```

---

# 11. EXCEL COMO INTEGRAÇÃO DE PRIMEIRA CLASSE

Excel não pode ser tratado apenas como upload manual.

## Excel local

```text
Excel
↓
Authorized Folder
↓
Enterprise Data Gateway
↓
File Change Event
↓
Schema Detection
↓
Validation
↓
Import
```

## Excel em OneDrive/SharePoint

```text
Excel Updated
↓
Microsoft Graph / Connector Event
↓
Read Named Table / Range
↓
Normalize
↓
Employee
```

## Excel por email

```text
Email Attachment
↓
Attachment Intake
↓
Excel Parser
↓
Data Product
↓
Employee
```

## Excel via SFTP

Suportar importações empresariais programadas.

## Excel Add-in

Prever:

```text
[Send selected table to AI Employee]
[Analyse this sheet]
[Generate report]
[Refresh from AI Employee Platform]
```

---

# 12. POWER QUERY

Plataforma → Power Query:

```text
REST
OData / Data Feed
CSV export endpoint
JSON endpoint
```

Power Query → Plataforma:

```text
Power Query refresh
↓
Excel/SharePoint table update
↓
Event
↓
Data Intake
↓
Employee
```

---

# 13. MICROSOFT 365 E GOOGLE WORKSPACE

Suportar progressivamente:

```text
Excel
Outlook
OneDrive
SharePoint
Teams
Power BI
Microsoft Graph
Google Drive
Google Sheets
Gmail
Google Calendar
Google Docs
```

Aplicar OAuth, least privilege, audit, token lifecycle e revogação.

---

# 14. ENTERPRISE DATA GATEWAY

Para sistemas locais ou sem API moderna:

```text
Primavera local
SQL Server
PostgreSQL local
Excel em pasta
Pasta de rede
Scanner
ERP legado
Software desktop
```

Arquitectura:

```text
LOCAL SYSTEMS
↓
ENTERPRISE DATA GATEWAY
↓
SECURE OUTBOUND CONNECTION
↓
PLATFORM
```

Regras obrigatórias:

```text
outbound-only por defeito
TLS/mTLS
credenciais protegidas
allowlist de fontes
allowlist de queries
read-only por defeito
cache offline
resumable sync
rate limits
heartbeat
audit
no arbitrary shell
no arbitrary SQL
no unrestricted filesystem
```

---

# 15. CONNECTORES EMPRESARIAIS

## ERP

Logical tool: `T.ERP`

Adapters prioritários:

```text
Primavera
SAP
Microsoft Dynamics
Odoo
Sage
Generic ERP REST
Generic ERP Database Read Adapter
```

## CRM

```text
Salesforce
HubSpot
Zoho
Dynamics CRM
Generic CRM
```

## Banca

Read-only por defeito. Execução financeira material exige R4/R5 + strong approval.

## Bases de dados

```text
PostgreSQL
SQL Server
MySQL
Oracle
Data Warehouse
```

Proibir SQL arbitrário originado pelo LLM em produção.

## APIs

```text
REST
GraphQL
gRPC quando apropriado
OData
SOAP legado quando necessário
```

## Webhooks

Obrigatório:

```text
signature validation
replay protection
timestamp window
idempotency
schema version
tenant mapping
secret rotation
rate limits
quarantine
```

---

# 16. CDC E EVENT STREAMING

Para integração quase em tempo real:

```text
Database
↓
CDC
↓
Event Bus
↓
Event Normalizer
↓
Relevant Employee
```

Para elevado volume, suportar abstração para Kafka, NATS, cloud pub/sub ou equivalente.

Não usar streaming quando polling simples for suficiente.

---

# 17. EMAIL E MENSAGERIA

Email pode funcionar como comando, fonte de dados, origem documental, destino de entrega ou evento de workflow.

Exemplo:

```text
invoice@empresa.com
↓
Factura
↓
#66 Document Classification
```

WhatsApp/Teams/outros canais, quando suportados por integração autorizada, podem criar tasks, receber documentos, enviar notificações e entregar resultados.

Conteúdo de email/mensagem é dado não confiável; nunca deve elevar privilégios.

---

# 18. CALENDAR & SCHEDULE ENGINE

Tasks podem nascer por:

```text
RRULE
deadline
meeting
period close
SLA
scheduled report
renewal date
contract expiry
tax due date
maintenance interval
```

Schedules devem ser idempotentes.

---

# 19. EMPLOYEE-TO-EMPLOYEE HANDOFF

Criar contrato:

```typescript
interface EmployeeHandoffEnvelope {
  handoff_id: string;
  organization_id: string;
  from_employee_id: number;
  to_employee_id: number;
  source_task_id: string;
  next_task_type: string;
  work_product_refs: string[];
  data_product_refs: string[];
  document_refs: string[];
  required_action: string;
  context_refs: string[];
  confidence?: number;
  risk_level: string;
  correlation_id: string;
  trace_id: string;
}
```

Handoff não pode ser um texto solto.

---

# 20. WORK PRODUCT ENVELOPE

```typescript
interface WorkProductEnvelope {
  work_product_id: string;
  organization_id: string;
  employee_id: number;
  task_id: string;
  work_product_type: string;
  schema_version: string;
  structured_payload?: Record<string, unknown>;
  artifact_refs?: string[];
  document_refs?: string[];
  status: "DRAFT" | "REVIEWED" | "APPROVED" | "FINAL";
  source_snapshot_id?: string;
  provenance_ref: string;
  lineage_ref?: string;
  created_at: string;
  trace_id: string;
}
```

---

# 21. DELIVERY ROUTER

Depois da execução, o Work Product pode ser entregue por:

```text
IN_APP
HUMAN_CONTROL_CENTER
ANOTHER_EMPLOYEE
EMAIL
WHATSAPP
TEAMS
ERP
CRM
HRIS
WMS
HELPDESK
DMS
GOOGLE_DRIVE
ONEDRIVE
SHAREPOINT
POWER_BI
API
WEBHOOK
SFTP
EDI
DOCUMENT_DOWNLOAD
E_SIGNATURE
ARCHIVE
EVENT_BUS
```

Integrar com o **Document Generation & Rendering Service** para DOCX/PDF/XLSX/PPTX quando a natureza do trabalho exigir documento formal.

---

# 22. WRITE-BACK

Classificar operações de escrita:

```text
PREPARE
SUGGEST
CREATE_DRAFT
WRITE_LOW_RISK
EXECUTE_MATERIAL_ACTION
```

Cada write-back exige permission, risk, autonomy, approval policy, idempotency e audit.

---

# 23. DELIVERY RECEIPT

```typescript
interface DeliveryReceipt {
  receipt_id: string;
  organization_id: string;
  task_id: string;
  work_product_id: string;
  employee_id: number;
  destination_type: string;
  destination_id: string;
  channel: string;
  sent_at?: string;
  delivered_at?: string;
  acknowledged_at?: string;
  status: string;
  external_reference?: string;
  trace_id: string;
}
```

Estados:

```text
QUEUED
SENT
DELIVERED
ACKNOWLEDGED
FAILED
REJECTED
EXPIRED
```

---

# 24. SOURCE DEEP LINKS E LINEAGE

Conservar:

```text
source_system
source_record_id
source_deep_link
source_version
```

Permitir acções de UI como:

```text
[Abrir no ERP]
[Abrir no CRM]
[Abrir no Excel]
[Abrir no Drive]
[Abrir no Helpdesk]
```

Data lineage:

```text
Work Product
↓
Derived Dataset
↓
Normalized Data
↓
Connector
↓
Source System
↓
Source Record
```

---

# 25. DATA SNAPSHOTS, FRESHNESS E COMPLETUDE

Antes de trabalhos materiais, criar snapshot de dados.

Cada Work Contract deve declarar:

```text
maximum_age
required_period
required_sources
minimum_completeness
allowed_missing_sources
```

Políticas possíveis se faltar informação:

```text
WAITING_DATA
PRELIMINARY
BLOCKED
ESCALATED
```

---

# 26. MULTIMODALIDADE POR FUNÇÃO

Nem todos os 500 Employees devem aceitar todas as modalidades.

Exemplos:

```text
Document Classification:
DOCUMENT + IMAGE + EMAIL + FILE_SYNC

Management Reporting:
ERP + XLSX + DATABASE + HUMAN_COMMAND + SCHEDULE

Security Incident:
EVENT + LOG + ALERT + HUMAN_COMMAND

Field Inspection:
MOBILE + IMAGE + VIDEO + GPS + FORM

Maintenance:
IoT + WORK_ORDER + MOBILE + IMAGE

HR:
HRIS + FORM + DOCUMENT + EMAIL

Sales:
CRM + EMAIL + FORM + CALL_NOTE
```

---

# 27. DEFAULT PROFILES PARA OS 44 DEPARTMENTS

Aplicar como defaults, refinando por Role Pack individual:

| IDs | Department | Entradas típicas | Entregas típicas |
|---|---|---|---|
| 1–10 | Strategy | ERP, BI, market data, documents, human brief | analysis, plan, dashboard, DOCX/PDF/PPTX |
| 11–24 | Sales | CRM, email, leads, calendar, forms | CRM updates, proposals, tasks, notifications |
| 25–38 | Marketing | CRM, analytics, content assets, social data | briefs, campaigns, content, dashboards |
| 39–48 | Customer Service | email, messaging, helpdesk, CRM | replies, tickets, escalations, CRM updates |
| 49–64 | Finance | ERP, bank, budget, spreadsheets | analysis, forecasts, approvals, reports |
| 65–74 | Accounting | ERP, documents, bank, Excel | classifications, journals, reconciliations, reports |
| 75–86 | Tax & Compliance | ERP, documents, government data, calendars | compliance work products, alerts, filing support, documents |
| 87–100 | HR | HRIS, forms, documents, attendance | HR documents, workflows, reports, notifications |
| 101–110 | Procurement | ERP, supplier portal, email, catalogues | RFQs, PO drafts, approvals, supplier updates |
| 111–120 | Inventory | WMS, POS, barcode, ERP | alerts, replenishment, reports, stock updates |
| 121–130 | Logistics | TMS, GPS, WMS, orders | plans, dispatch, alerts, status updates |
| 131–140 | Operations | ERP, workflows, IoT, forms | tasks, SOP outputs, alerts, dashboards |
| 141–150 | Projects | PM tools, budgets, files, forms | plans, status reports, tasks, escalations |
| 151–160 | Legal | contracts, email, DMS, human briefs | DOCX/PDF drafts, reviews, approvals |
| 161–170 | Audit | ERP, logs, documents, samples | findings, evidence packs, reports |
| 171–182 | IT | monitoring, tickets, logs, repositories | incidents, changes, scripts/drafts, alerts |
| 183–190 | Product | analytics, feedback, roadmap tools | specs, priorities, experiments |
| 191–200 | International Trade | ERP, logistics, customs documents | process packs, documents, status updates |
| 201–210 | Construction | project systems, field mobile, photos, GIS | inspections, progress, reports, alerts |
| 211–218 | Healthcare Admin | admin systems, forms, scheduling | administrative workflows, reports, correspondence |
| 219–226 | Education | LMS, SIS, documents, calendar | course/admin outputs, reports, notices |
| 227–234 | Real Estate | CRM, property systems, contracts | listings, documents, tasks, reports |
| 235–242 | Hospitality | PMS, POS, reservations, reviews | guest tasks, reports, operational alerts |
| 243–250 | Retail | POS, WMS, ERP, e-commerce | stock/sales actions, reports, alerts |
| 251–260 | AI Workforce Management | runtime telemetry, tasks, evaluations | assignments, escalations, workforce reports |
| 261–286 | Documents | files, templates, structured content | DOCX/PDF/XLSX/PPTX, review outputs |
| 287–302 | Banking | core banking, KYC/AML, transactions | reviews, alerts, regulated work products |
| 303–316 | Insurance | policy/claims systems, documents | claim/policy outputs, reviews, correspondence |
| 317–330 | Agriculture | farm systems, IoT, field mobile | plans, alerts, traceability, reports |
| 331–346 | Manufacturing | MES, ERP, SCADA, CMMS | schedules, quality outputs, maintenance tasks |
| 347–360 | Energy & Utilities | SCADA, meters, GIS, field systems | incidents, forecasts, maintenance/work orders |
| 361–374 | Telecommunications | NMS, BSS, CRM, field systems | incidents, capacity plans, tickets, reports |
| 375–386 | Mining | fleet, mine ops, IoT, safety systems | production/safety/maintenance outputs |
| 387–398 | Oil & Gas | field systems, SCADA, ERP, HSE | operations, maintenance, compliance outputs |
| 399–414 | Public Administration | case systems, forms, documents, citizen channels | permits, correspondence, cases, reports |
| 415–426 | Facilities | CMMS, IoT, access, forms | work orders, inspections, SLA alerts |
| 427–438 | Security & Safety | CCTV events, access, incidents, mobile | triage, evidence, alerts, incident reports |
| 439–448 | ESG & Sustainability | ERP, energy, supplier, environmental data | metrics, disclosures, dashboards |
| 449–460 | Research & Intelligence | documents, data feeds, surveys | evidence packs, syntheses, briefings |
| 461–470 | Media & Creator Economy | content systems, analytics, CRM | editorial/content workflows, reports |
| 471–480 | Aviation & Airports | ops systems, schedules, baggage/cargo data | operational tasks, alerts, reports |
| 481–488 | Pharma & Life Sciences Admin | QMS, regulatory docs, trial systems | regulated documents, workflows, reports |
| 489–494 | Franchise & Multi-site | POS, ERP, multi-site dashboards | standards, performance, rollout tasks |
| 495–500 | Data & AI Operations | data platform, catalog, MLOps, telemetry | quality/governance actions, model ops reports |

Estes perfis são defaults; não substituem os contratos 500/500.

---

# 28. RUNTIME EMPLOYEE WORK PROFILE

Compilar:

```text
ROLE PACK
+
WORK ACTIVATION CONTRACT
+
TENANT CONNECTION PROFILE
+
ORGANIZATION POLICIES
+
USER PERMISSIONS
+
AVAILABLE CONNECTORS
=
RUNTIME EMPLOYEE WORK PROFILE
```

Assim o mesmo Employee funciona numa empresa com Primavera + Excel e noutra com SAP + Salesforce + Data Warehouse.

---

# 29. CONNECTION PROFILE E INPUT BINDINGS

Exemplo:

```yaml
connection_profile:
  organization_id: "org_123"
  erp:
    provider: "PRIMAVERA"
    connection_id: "conn_erp_01"
  spreadsheets:
    providers: ["ONEDRIVE", "LOCAL_GATEWAY"]
  crm:
    provider: "SALESFORCE"
  banking:
    provider: "BANK_READ_ONLY"
  documents:
    provider: "SHAREPOINT"
```

Bindings:

```yaml
input_bindings:
  - employee_id: 73
    data_product: "TRIAL_BALANCE"
    source:
      connector: "PRIMAVERA"
      resource: "ACCOUNTING/TRIAL_BALANCE"

  - employee_id: 73
    data_product: "BUDGET"
    source:
      connector: "ONEDRIVE_EXCEL"
      resource: "/Finance/Budget2026.xlsx"
```

---

# 30. OUTPUT ROUTES

```yaml
output_routes:
  - employee_id: 73
    work_product: "MANAGEMENT_REPORT"
    routes:
      - type: "DOCUMENT"
        formats: ["DOCX", "PDF"]
      - type: "DASHBOARD"
      - type: "EMAIL"
        recipient_role: "CFO"
```

---

# 31. HUMAN CONTROL CENTER

Tasks com baixa confiança, falta de dados, conflito, risco material, aprovação exigida ou erro devem poder aparecer no Human Control Center.

Acções:

```text
Approve
Reject
Edit
Take Over
Provide Data
Reassign
Pause
Cancel
Retry
Escalate
```

---

# 32. COMMAND PREVIEW E LOW CONFIDENCE

Para comandos ambíguos ou materiais, mostrar preview estruturado.

Se a confiança estiver abaixo do limiar:

```text
DO NOT GUESS
CLARIFICATION_REQUIRED
```

---

# 33. SEGURANÇA DE CONTEÚDO E PROMPT INJECTION

Conteúdo vindo de email, PDF, website, CRM, Excel, API, webhook ou outro sistema deve ser tratado como dado não confiável.

Trust labels:

```text
SYSTEM
DEVELOPER
TENANT_POLICY
USER_COMMAND
TRUSTED_CONNECTOR
TOOL_OUTPUT
KNOWLEDGE
EXTERNAL_UNTRUSTED
```

Nenhum conteúdo externo pode elevar privilégios.

---

# 34. IDENTITY, PERMISSIONS, RISK E AUTONOMY

Nenhum canal ignora a segurança.

Fluxo universal:

```text
IDENTITY
↓
TENANT
↓
PERMISSION
↓
POLICY
↓
RISK
↓
AUTONOMY
↓
APPROVAL
↓
EXECUTION
```

R4/R5 exigem aprovação forte conforme política.

---

# 35. APPROVAL SNAPSHOT

Para acções aprovadas:

```text
candidate action
↓
freeze
↓
hash
↓
human approval
↓
execute exact approved snapshot
```

Nunca regenerar a acção entre aprovação e execução.

---

# 36. IDEMPOTENCY

Obrigatória para:

```text
webhooks
scheduled tasks
event consumption
write-back
emails
payments
document delivery
Employee handoffs
```

---

# 37. OFFLINE E CONECTIVIDADE INSTÁVEL

Enterprise Data Gateway e mobile devem suportar:

```text
local queue
encrypted cache
sync later
conflict detection
idempotency
```

---

# 38. MOBILE-FIRST FIELD WORK

Employees de campo podem receber:

```text
photo
video
voice note
GPS with permission
form
signature
QR/barcode
offline task
```

Aplicável a obras, manutenção, fiscalização, segurança, agricultura, telecom, facilities e utilities.

---

# 39. DESKTOP / UI AUTOMATION COMO ÚLTIMO RECURSO

Prioridade de integração:

```text
API
→ Database/View
→ File Integration
→ EDI/SFTP
→ Desktop/UI Automation as last resort
```

Automação por UI deve ser autorizada, isolada, auditável e limitada.

---

# 40. EVENT RULE ENGINE

Exemplo:

```yaml
when:
  event: "CUSTOMER_OVERDUE"
  days_overdue: ">=60"
then:
  employee: 52
  task: "COLLECTION_REVIEW"
```

Outro exemplo:

```yaml
when:
  event: "ACCOUNTING_PERIOD_CLOSED"
then:
  employee: 73
  task: "GENERATE_MANAGEMENT_REPORT"
```

---

# 41. TASK TEMPLATES

```yaml
task_template:
  key: "MANAGEMENT_REPORT_MONTHLY"
  employee_id: 73
  required: ["organization", "period"]
  optional: ["budget", "prior_period", "prior_year"]
  outputs: ["MANAGEMENT_REPORT"]
```

---

# 42. TASK STATES

Manter compatibilidade com o Runtime:

```text
CREATED
QUEUED
RESOLVING_ROLE
LOADING_CONTEXT
AUTHORIZING
ROUTING_MODEL
PLANNING
WAITING_TOOL
WAITING_DATA
WAITING_APPROVAL
EXECUTING_TOOLS
FINALIZING
COMPLETED
FAILED
BLOCKED
CANCELLED
PAUSED_GLOBAL
```

---

# 43. CHANNEL ADAPTER INTERFACE

```typescript
interface InputChannelAdapter {
  channel: string;
  authenticate(input: unknown): Promise<ChannelIdentity>;
  parse(input: unknown): Promise<ParsedInput>;
  normalize(
    parsed: ParsedInput,
    context: ChannelContext
  ): Promise<UnifiedCommandEnvelope | BusinessEventEnvelope>;
  acknowledge?(result: IntakeResult): Promise<void>;
}
```

---

# 44. P03 CONNECTOR SDK COMPATIBILITY

Nenhum canal pode contornar:

```text
Tool Registry
Tool Authorization
Permission Engine
Policy Engine
Risk Engine
Approval Engine
Idempotency
Audit
```

---

# 45. TENANT ISOLATION E DATA MINIMIZATION

Testar:

```text
Organization A command
cannot load
Organization B context
```

O Employee recebe apenas os dados necessários à task.

Aplicar:

```text
purpose limitation
field filtering
row filtering
time-window filtering
```

---

# 46. COST CONTROL

Medir separadamente:

```text
channel ingestion cost
speech transcription cost
vision cost
document extraction cost
connector cost
AI reasoning cost
tool execution cost
delivery cost
```

Usar software determinístico quando suficiente.

---

# 47. OBSERVABILITY

Métricas mínimas:

```text
commands_received
commands_by_channel
events_received
tasks_created
routing_accuracy
clarification_rate
failed_intakes
duplicate_events
webhook_replays_blocked
voice_commands
file_imports
excel_syncs
employee_handoffs
delivery_failures
average_time_to_task
average_time_to_first_action
cost_per_channel
```

---

# 48. UI/UX

Criar:

## Work Command Center

```text
Command Bar
Voice Button
Upload
Camera
Quick Actions
Recent Tasks
Scheduled Work
Event-triggered Work
Pending Approvals
Waiting for Data
Employee Handoffs
```

## Employee Detail

Mostrar como o Employee recebe trabalho:

```text
Commands
Systems
Events
Schedules
Handoffs
Files
Voice
Mobile
```

## Connections

Mostrar:

```text
System
Provider
Status
Mode
Permissions
Last Sync
Employees using it
Data Products
Health
Errors
```

## Automations

Permitir:

```text
WHEN
→ event / time / condition
THEN
→ Employee
WITH
→ data/context
DELIVER TO
→ recipient/system
APPROVAL
→ policy
```

---

# 49. EXEMPLOS DE EMPLOYEES

## Employee #66 — Document Classification

```text
New PDF arrives by email
↓
Email Connector
↓
Document Intake
↓
#66 Document Classification
↓
Extract
Classify
Confidence
Validate
↓
structured_document
↓
#67 / Tax / HR / Procurement / Human Review
```

Command modes:

```text
FILE
EMAIL
CAMERA
FOLDER_SYNC
API
EMPLOYEE_HANDOFF
```

## Employee #73 — Management Reporting

Activadores:

```text
Human command
Scheduled monthly
ACCOUNTING_PERIOD_CLOSED
API
Manager button
```

Fontes:

```text
ERP
Accounting
Bank
Excel
Power Query
Inventory
Sales
Budget
Other Employees
```

Entrega:

```text
Management Dashboard
DOCX
PDF
XLSX
PPTX optional
Email
Human Control Center
Archive
```

---

# 50. CADEIAS DE TRABALHO

## Finance / Accounting

```text
Incoming Documents
↓
#66 Classification
↓
#67 Journal Preparation
↓
#68 Reconciliation
↓
#72 Review
↓
#69 Closing
↓
#73 Management Reporting
↓
Management
```

## Sales

```text
Lead Event
↓
Qualification
↓
Opportunity
↓
Proposal
↓
Approval if needed
↓
CRM write-back
↓
Follow-up
```

## Procurement

```text
Low Stock Event
↓
Replenishment
↓
Procurement Employee
↓
Supplier Comparison
↓
PO Draft
↓
Approval
↓
ERP
```

## HR

```text
Employee Request
↓
HR Employee
↓
HRIS data
↓
Document Service
↓
DOCX/PDF
↓
Approval
↓
Employee + Archive
```

## Operations / Maintenance

```text
Sensor Alert
↓
Incident Triage
↓
Maintenance Employee
↓
CMMS
↓
Work Order
↓
Field Technician
↓
Mobile Evidence
↓
Closure Report
```

---

# 51. VALIDATION MATRIX 500/500

Gerar automaticamente:

```text
employee_id
role_key
department
has_command_modes
has_activation_modes
has_input_contract
has_connection_contract
has_output_contract
has_delivery_contract
has_handoff_contract
has_security_policy
has_acceptance_tests
```

Release gate:

```text
500/500 VALID
```

---

# 52. TESTES POR EMPLOYEE

Para cada Employee, mínimo:

1. Human Command Test;
2. System/File/Event Intake Test conforme função;
3. Permission/Tenant Isolation Test;
4. Missing Data Test;
5. Output Contract Test;
6. Delivery Test;
7. Handoff Test quando aplicável;
8. Risk/Escalation Test.

Nem todos precisam de testar todas as modalidades.

---

# 53. TESTES GLOBAIS

Obrigatórios:

```text
text → task
voice → task
form → task
button → task
file → task
email → task
Excel local → task
Excel cloud → task
API → task
webhook → task
schedule → task
Employee handoff → task
IoT event → task
```

E:

```text
task → document
task → dashboard
task → ERP write-back
task → CRM write-back
task → email
task → another Employee
task → approval
task → archive
```

---

# 54. RED TEAM

Testar pelo menos:

```text
forged webhook
voice spoofing
malicious email
prompt injection in PDF
malicious Excel cell
cross-tenant event
confused-deputy handoff
unauthorized write-back
replay attack
duplicate event
stale command
forged device
connector privilege escalation
poisoned handoff
approval bypass
R5 execution without approval
```

---

# 55. RELEASE BLOCKERS

NO-GO em qualquer caso de:

```text
tenant leak
unauthorized material action
approval bypass
cross-tenant handoff
arbitrary tool execution
unverified webhook execution
R4/R5 voice-only authorization
missing idempotency for side effects
500 catalog coverage < 100%
untraceable work product
untraceable external delivery
```

---

# 56. FASES DE IMPLEMENTAÇÃO

## Phase 1 — Contracts

- Work Activation Contract schema;
- UnifiedCommandEnvelope;
- BusinessEventEnvelope;
- WorkProductEnvelope;
- EmployeeHandoffEnvelope;
- DeliveryReceipt;
- validators;
- registry.

## Phase 2 — Core Gateway

- text;
- forms;
- buttons;
- file upload;
- API;
- webhook;
- schedules.

## Phase 3 — Enterprise Productivity

- Excel;
- CSV;
- OneDrive;
- SharePoint;
- Google Drive;
- email;
- calendar;
- Power Query;
- Office add-in foundation.

## Phase 4 — Enterprise Data Gateway

- local folders;
- SQL Server;
- PostgreSQL;
- Primavera;
- scanner/file watchers;
- offline queue.

## Phase 5 — Business Connectors

- ERP;
- CRM;
- HRIS;
- Helpdesk;
- WMS;
- POS;
- banking read-only;
- DMS.

## Phase 6 — Multimodal

- voice;
- camera;
- image;
- audio;
- mobile capture;
- QR/barcode.

## Phase 7 — Event Fabric

- CDC;
- streaming;
- event schemas;
- event rules;
- DLQ.

## Phase 8 — Sector Connectors

- IoT;
- MQTT;
- OPC UA;
- SCADA;
- GIS;
- aviation;
- pharma;
- telecom;
- mining;
- energy;
- etc.

## Phase 9 — Delivery

- Delivery Router;
- Document Service;
- write-back;
- email/messaging;
- APIs;
- receipts;
- archive.

## Phase 10 — 500/500 Validation

- compile all Work Contracts;
- generate test suites;
- run security/evaluation;
- release gate.

---

# 57. DATABASE / REGISTRY

Criar entidades:

```text
command_channels
channel_connections
unified_commands
business_events
event_schemas
event_subscriptions
event_rules
task_templates
work_activation_contracts
employee_input_bindings
employee_output_routes
employee_handoffs
work_products
data_products
data_snapshots
source_lineage
delivery_routes
delivery_receipts
device_connections
gateway_agents
gateway_sources
gateway_sync_jobs
connector_health
```

---

# 58. API SURFACE

Exemplos:

```text
POST /commands
POST /events
POST /files/intake
POST /voice/intake
POST /tasks/from-template

GET  /employees/{id}/activation-contract
GET  /employees/{id}/available-command-modes
GET  /employees/{id}/input-bindings
GET  /employees/{id}/output-routes

POST /employees/{id}/commands
POST /employees/{id}/handoffs

GET  /connections
POST /connections
GET  /connections/{id}/health

GET  /work-products/{id}
POST /work-products/{id}/deliver
GET  /deliveries/{id}
```

---

# 59. ERROR CODES

```text
COMMAND_INVALID
COMMAND_AMBIGUOUS
COMMAND_UNAUTHORIZED
COMMAND_RISK_BLOCKED
COMMAND_APPROVAL_REQUIRED
CHANNEL_NOT_ALLOWED
CHANNEL_AUTH_FAILED
EVENT_INVALID
EVENT_REPLAYED
EVENT_SCHEMA_MISMATCH
EVENT_TENANT_MISMATCH
EMPLOYEE_NOT_RESOLVED
EMPLOYEE_NOT_AVAILABLE
INPUT_MISSING
INPUT_STALE
INPUT_VALIDATION_FAILED
CONNECTOR_UNAVAILABLE
GATEWAY_OFFLINE
HANDOFF_INVALID
HANDOFF_UNAUTHORIZED
OUTPUT_ROUTE_UNAVAILABLE
DELIVERY_FAILED
```

---

# 60. AI USAGE PRINCIPLE

Usar IA para:

```text
linguagem natural
intenção
extração semântica
classificação
compreensão documental
voz
visão
análise
escrita
síntese
```

Usar software determinístico para:

```text
permission
tenant isolation
risk gates
idempotency
schedules
event delivery
schema validation
fórmulas conhecidas
write-back
audit
routing por regra
approvals
```

---

# 61. DEFINITION OF DONE

O Unified Task, Command & Event Gateway só pode ser considerado completo quando:

```text
✓ 500/500 Employees têm Work Activation Contract
✓ texto funciona
✓ voz funciona
✓ formulários funcionam
✓ quick actions funcionam
✓ ficheiros funcionam
✓ imagens/câmara funcionam conforme Role Pack
✓ Excel local e cloud funcionam
✓ Power Query possui integração definida
✓ email funciona
✓ APIs funcionam
✓ webhooks são assinados e idempotentes
✓ schedules funcionam
✓ Employee-to-Employee funciona
✓ Enterprise Data Gateway funciona
✓ connectors têm health/status
✓ event engine funciona
✓ CDC/streaming têm abstraction
✓ IoT/physical events têm abstraction
✓ outputs usam WorkProductEnvelope
✓ Document Service integrado
✓ Delivery Router integrado
✓ write-back controlado
✓ delivery receipts
✓ source lineage
✓ deep links
✓ tenant isolation
✓ risk/autonomy/approval
✓ audit
✓ observability
✓ 500/500 validation passes
✓ security tests pass
```

---

# 62. INTEGRAÇÃO COM O PROMPT MESTRE

Este prompt complementa, e não substitui:

```text
Core Runtime
RolePack Registry
P03 Tool/Connector SDK
P04 Evaluation & Certification
P05 Infrastructure/DevOps
P02 Security/Red Team
P01 UI/UX
P06 Marketplace/Billing
P07 Release Readiness
Document Generation & Rendering Service
Enterprise Data Gateway
500 Work Contracts
```

Relação final:

```text
ROLE PACK
+
WORK ACTIVATION CONTRACT
+
CONNECTION PROFILE
+
INPUT BINDINGS
+
UNIFIED TASK/COMMAND/EVENT GATEWAY
+
RUNTIME
+
TOOLS
+
DOCUMENT SERVICE
+
OUTPUT ROUTES
+
DELIVERY ROUTER
+
AUDIT / LINEAGE
=
OPERATIONAL AI EMPLOYEE
```

---

# 63. REGRA DE INTEGRIDADE DO CATÁLOGO

Não alterar IDs 1–500. Não duplicar `role_key`. Não eliminar Employees existentes. Não renomear funções sem migração explícita.

```text
expected_employees = 500
valid_work_activation_contracts = 500
missing_contracts = 0
duplicate_employee_ids = 0
duplicate_role_keys = 0
```

Se falhar:

```text
BUILD FAIL
```

---

# 64. ENTREGÁVEIS DA IMPLEMENTAÇÃO

Gerar:

```text
schemas/work-activation-contract.schema.json
schemas/unified-command-envelope.schema.json
schemas/business-event-envelope.schema.json
schemas/employee-handoff-envelope.schema.json
schemas/work-product-envelope.schema.json
schemas/delivery-receipt.schema.json

generated/work-activation-contracts.500.json
generated/input-bindings.500.json
generated/output-routes.500.json
generated/employee-handoffs.json
generated/command-channel-matrix.500.json

db/migrations/...
db/seeds/...

apps/api/...
apps/worker/...
apps/gateway/...
apps/web/...
apps/mobile/...

packages/command-gateway/...
packages/event-gateway/...
packages/channel-adapters/...
packages/connection-hub/...
packages/delivery-router/...

tests/500-employee-activation/...
tests/security/...
tests/e2e/...

docs/IMPLEMENTATION_REPORT.md
docs/500_EMPLOYEE_CHANNEL_MATRIX.md
docs/CONNECTOR_COVERAGE.md
docs/RELEASE_READINESS.md
```

---

# 65. ACCEPTANCE GATE

A implementação final deve produzir:

```text
CATALOG:                  500/500
ACTIVATION CONTRACTS:     500/500
INPUT CONTRACTS:          500/500
OUTPUT CONTRACTS:         500/500
DELIVERY CONTRACTS:       500/500
TENANT TESTS:             PASS
PERMISSION TESTS:         PASS
RISK TESTS:               PASS
APPROVAL TESTS:           PASS
HANDOFF TESTS:            PASS
CONNECTOR TESTS:          PASS
DOCUMENT DELIVERY:        PASS
EVENT IDEMPOTENCY:        PASS
AUDIT/LINEAGE:            PASS
```

Não declarar `PRODUCTION_READY` se qualquer gate crítico falhar.

---

# 66. PRINCÍPIO FINAL

O utilizador deve poder trabalhar com a força de trabalho digital da forma mais natural para a situação:

```text
ESCREVER
FALAR
CLICAR
PREENCHER
FOTOGRAFAR
DIGITALIZAR
IMPORTAR
SINCRONIZAR
ENVIAR EMAIL
USAR EXCEL
USAR POWER QUERY
USAR ERP
USAR CRM
USAR API
USAR WEBHOOK
AGENDAR
GERAR EVENTO
USAR SENSOR
```

ou não fazer nada quando o processo já estiver automatizado.

Tudo converge para:

```text
COMMAND / EVENT
↓
NORMALIZED TASK
↓
CORRECT EMPLOYEE
↓
AUTHORIZED DATA
↓
CONTROLLED EXECUTION
↓
WORK PRODUCT
↓
DOCUMENT / ACTION / EVENT
↓
APPROVAL WHEN REQUIRED
↓
DELIVERY
↓
AUDIT
```

O objectivo não é construir 500 interfaces conversacionais. O objectivo é construir **500 trabalhadores digitais integrados na forma como as empresas já trabalham**, capazes de receber trabalho pelos canais existentes, agir nos sistemas autorizados e entregar resultados nos formatos e destinos exigidos pelo processo empresarial.

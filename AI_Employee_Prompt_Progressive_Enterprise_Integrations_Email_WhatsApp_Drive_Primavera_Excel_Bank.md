# PROMPT MESTRE — AI EMPLOYEE PROGRESSIVE ENTERPRISE INTEGRATION PACK
## Email → WhatsApp → Drive → Primavera v10 Read-Only → Excel Automático → Banco Read-Only

**Sigla:** PEIP  
**Versão:** 1.0  
**Âmbito:** AI Employee Platform — 500/500 Priority Employee Program

## 0. OBJECTIVO

Implementar, validar e disponibilizar progressivamente seis integrações empresariais essenciais para os AI Employees:

```text
PHASE 1 — EMAIL
↓
PHASE 2 — WHATSAPP / BUSINESS MESSAGING
↓
PHASE 3 — DRIVE / CLOUD STORAGE
↓
PHASE 4 — PRIMAVERA v10 READ-ONLY
↓
PHASE 5 — EXCEL AUTOMÁTICO
↓
PHASE 6 — BANCO READ-ONLY
```

Reutilizar obrigatoriamente Runtime Orchestrator, Connector SDK, ToolCallIntent, Permission Engine, Policy Engine, Risk Engine, Approval Gateway, Enterprise Data Gateway, Credential Vault, Delivery Router, Audit, Observability, EREMS, CAQRS e Organization Readiness.

## 1. PRINCÍPIO FUNDAMENTAL

Nunca considerar uma integração pronta apenas porque existe um manifest.

Estados obrigatórios:

```text
MANIFEST_EXISTS
IMPLEMENTED
AUTHENTICATED
CONNECTED
TESTED
CERTIFIED
ACTIVE
DEGRADED
REVOKED
```

## 2. ARQUITECTURA GERAL

```text
EMAIL / WHATSAPP / DRIVE / PRIMAVERA / EXCEL / BANK
                         ↓
                 Connector Adapter
                         ↓
                Authentication / Vault
                         ↓
                 Permission Scope
                         ↓
                      Policy
                         ↓
                Data Normalization
                         ↓
              Canonical Data Product
                         ↓
               AI Employee Runtime
                         ↓
                  Work Product
                         ↓
                     Approval
                         ↓
                 Delivery Router
                         ↓
                 Audit + Receipt
```

## 3. SEGURANÇA COMUM

Implementar:

```text
least privilege
deny by default
tenant isolation
credential vault
encrypted secrets
scope per connection
scope per Employee instance
audit
idempotency
retry
rate limits
health checks
DLP
prompt-injection defence
```

Nunca colocar passwords, tokens, API keys ou certificados em prompts, Role Packs, logs ou contexto do modelo. O Employee recebe apenas `credential_ref`.

Toda operação passa por:

```text
ToolCallIntent
↓
Tenant Check
↓
Entitlement
↓
Permission
↓
Policy
↓
Risk
↓
Approval when required
↓
Connector
↓
Audit
```

---

# PHASE 1 — EMAIL

## 4. OBJECTIVO

Permitir:

```text
read authorized inbox
search authorized messages
ingest attachments
create draft
reply/forward
send only when authorized
record delivery receipt
```

## 5. PROVIDERS

Criar arquitectura provider-neutral com adapters para, quando configurados:

```text
Microsoft 365 / Exchange Online
Gmail / Google Workspace
IMAP/SMTP fallback explicitly authorized
```

## 6. EMAIL OPERATIONS

```text
email.read
email.search
email.list
email.attachment.read
email.draft.create
email.draft.update
email.reply
email.forward
email.send
```

## 7. PILOT DEFAULT

```text
READ       ✓
DRAFT      ✓
SEND       approval required
DELETE     ✗
```

## 8. EMAIL FLOW

```text
Email Received
↓
Sender Validation
↓
Malware/Attachment Scan
↓
Tenant Resolution
↓
Prompt-Injection / Untrusted Content Label
↓
Employee Routing
↓
Task Creation
```

## 9. EMAIL OUTBOUND

```text
Employee drafts
↓
Preview
↓
Recipient validation
↓
Approval
↓
Send
↓
Delivery Receipt
```

## 10. EMAIL TESTS

```text
authorized inbox read
unauthorized mailbox blocked
attachment ingestion
task routing
draft
preview
approval
send
duplicate prevention
cross-tenant protection
audit
```

---

# PHASE 2 — WHATSAPP / BUSINESS MESSAGING

## 11. OBJECTIVO

Permitir comunicação controlada através de integração empresarial autorizada.

Não utilizar:

```text
personal WhatsApp scraping
unofficial browser automation
shared personal sessions
raw credentials exposed to LLM
```

## 12. CONNECTOR

Criar `BusinessMessagingConnector` provider-neutral.

## 13. OPERATIONS

Quando o provider suportar:

```text
message.read
message.send
message.send_template
message.send_document
message.send_image
message.send_secure_link
message.status.read
```

## 14. PILOT DEFAULT

```text
READ incoming        ✓ when authorized
DRAFT outbound       ✓
SEND outbound        approval required
SENSITIVE ATTACHMENT restricted
```

## 15. CONTACT DIRECTORY

Criar `AuthorizedBusinessContact` com:

```text
contact_id
organization_id
name
phone
email
customer_id
approved_channels
status
verified_at
```

## 16. WHATSAPP FLOW

```text
Employee prepares message
↓
Preview
↓
Recipient validation
↓
Approval
↓
Authorized Business Messaging Connector
↓
Send
↓
Delivery Receipt
```

## 17. SENSITIVE DOCUMENTS

Preferir:

```text
message
+
secure authenticated link
+
expiry
+
access audit
```

## 18. WHATSAPP TESTS

```text
business connection
authorized recipient
draft
preview
approval
send
secure link
receipt
duplicate prevention
provider failure
cross-tenant protection
```

---

# PHASE 3 — DRIVE / CLOUD STORAGE

## 19. OBJECTIVO

Permitir:

```text
list/read authorized files
watch authorized folders
ingest new files
save approved outputs
preserve versions
trigger Employee tasks
```

## 20. PROVIDERS

Preparar adapters para:

```text
Google Drive
OneDrive
SharePoint
S3-compatible object storage
```

## 21. OPERATIONS

```text
storage.list
storage.search
storage.read
storage.download
storage.watch
storage.write_output
storage.create_folder
```

## 22. PILOT DEFAULT

```text
READ selected folders   ✓
WRITE approved output   policy/approval
DELETE                  ✗
ARBITRARY MOVE          ✗
```

## 23. FOLDER BINDING

Exemplos:

```text
/Accounting/Invoices
→ #66 Document Classification

/Management Reports
→ #73 Management Reporting
```

## 24. WATCHER FLOW

```text
New File
↓
Security Scan
↓
Tenant Resolution
↓
File Classification
↓
Input Mapping
↓
Task Trigger
```

## 25. DRIVE TESTS

```text
read authorized folder
block unauthorized folder
watch new file
trigger task
write approved output
preserve version
prevent unsafe overwrite
audit
```

---

# PHASE 4 — PRIMAVERA v10 READ-ONLY

## 26. OBJECTIVO

Permitir leitura controlada dos dados empresariais do Primavera v10 sem criar, alterar ou apagar registos.

## 27. CONNECTOR

Criar `PrimaveraV10ReadOnlyConnector`.

## 28. CONNECTION OPTIONS

Suportar, conforme o ambiente real e mecanismos oficialmente/autorizadamente disponíveis:

```text
authorized SDK/API
read-only database connection
approved export files
Enterprise Data Gateway
scheduled read-only query
```

Não presumir uma API específica sem confirmação.

## 29. LOCAL DEPLOYMENT

Quando Primavera estiver local:

```text
Primavera Server
↓
Enterprise Data Gateway
↓
Outbound TLS/mTLS
↓
AI Employee Platform
```

Não abrir túnel genérico inbound.

## 30. READ-ONLY DATABASE USER

Se houver acesso SQL:

```text
SELECT only
NO INSERT
NO UPDATE
NO DELETE
NO unsafe EXEC
```

## 31. DATA DOMAINS

Preparar mappings para:

```text
customers
suppliers
sales
purchases
stock
treasury
accounts
ledger
journal data
documents
tax fields
cost centers
products
warehouses
```

conforme módulos realmente disponíveis.

## 32. CANONICAL MAPPINGS

```text
Primavera Customer
→ CanonicalCustomer

Primavera Sales Document
→ CanonicalSalesDocument

Primavera Ledger Entry
→ CanonicalLedgerEntry

Primavera Stock
→ CanonicalInventory
```

## 33. QUERY GOVERNANCE

Queries:

```text
pre-approved
parameterized
bounded
read-only
audited
```

Não permitir SQL livre produzido pelo LLM.

## 34. APPROVED READ QUERY CATALOG

Criar catálogo com operações como:

```text
sales_by_period
stock_by_warehouse
trial_balance
supplier_aging
customer_aging
ledger_by_period
```

## 35. SNAPSHOT

Guardar:

```text
source_timestamp
company_database_ref
period
query_version
record_count
hash/checksum when applicable
```

## 36. PRIMAVERA TESTS

```text
gateway/auth
customer read
supplier read
sales read
stock read
ledger read
period filter
canonical mapping
snapshot
audit
write attempt blocked
delete attempt blocked
arbitrary SQL blocked
cross-company database blocked
```

---

# PHASE 5 — EXCEL AUTOMÁTICO

## 37. OBJECTIVO

Eliminar dependência exclusiva de upload manual e permitir ingestão recorrente de folhas de cálculo.

## 38. SERVICE

Criar `AutomatedSpreadsheetIngestionService`.

## 39. FORMATS

```text
XLSX
CSV
TSV
Parquet
JSON
XML
legacy XLS through safe converter
```

Nunca executar VBA/macros.

## 40. AUTOMATIC SOURCES

```text
OneDrive / SharePoint folder
Google Drive folder
Email attachments
Enterprise Gateway local folder
Network folder
SFTP
Object storage
Scheduled workbook source
API upload
```

## 41. INGESTION FLOW

```text
Workbook Detected
↓
Security Scan
↓
Parser
↓
Sheet Discovery
↓
Table Discovery
↓
Schema Detection
↓
Column Mapping
↓
Data Quality
↓
Canonical Data Product
↓
Versioned Snapshot
↓
Task/Event
```

## 42. STRUCTURE

Preferir:

```text
named tables
stable headers
typed columns
known worksheet names
```

## 43. SCHEMA REGISTRY

Criar `SpreadsheetSchemaRegistry`.

Exemplos:

```text
sales_workbook
inventory_workbook
payroll_workbook
bank_statement_workbook
budget_workbook
supplier_aging_workbook
```

## 44. COLUMN MAPPING

Suportar:

```text
exact match
approved aliases
organization-specific mapping
AI-assisted mapping requiring approval when confidence is low
```

Se confiança insuficiente:

```text
WAITING_MAPPING_APPROVAL
```

## 45. DATA QUALITY

Validar:

```text
missing columns
wrong types
duplicates
invalid dates
negative values where impossible
unexpected totals
empty sheet
formula errors
unexpected schema drift
```

## 46. VERSIONING

Guardar:

```text
file_hash
source
received_at
sheet_list
schema_version
mapping_version
```

## 47. EXCEL AUTO TRIGGER

Exemplo:

```text
Sales_August.xlsx arrives
↓
EV.spreadsheet.ingested
↓
#73 Management Reporting
```

## 48. EXCEL TESTS

```text
file detection
safe parsing
sheet/table discovery
schema detection
mapping
data-quality checks
snapshot
task trigger
macro execution blocked
audit
```

---

# PHASE 6 — BANCO READ-ONLY

## 49. OBJECTIVO

Permitir leitura segura de contas, saldos, movimentos e extractos bancários sem permitir movimentar dinheiro.

## 50. CONNECTOR

Criar `BankReadOnlyConnector` provider-neutral.

## 51. CONNECTION METHODS

Conforme cada banco realmente disponibilizar canal autorizado:

```text
bank API
corporate banking API
authorized aggregator
secure file feed
SFTP
bank statement import
approved enterprise export
```

Não presumir que existe um padrão universal de Open Banking em todos os bancos ou países.

## 52. READ-ONLY OPERATIONS

```text
bank.account.list
bank.balance.read
bank.transaction.list
bank.transaction.read
bank.statement.read
bank.statement.download
```

## 53. FORBIDDEN OPERATIONS

O connector read-only não deve implementar:

```text
payment.create
payment.approve
payment.submit
transfer.create
beneficiary.create
beneficiary.update
```

## 54. HARD ENFORCEMENT

Mesmo que o modelo tente:

```text
payment.submit
```

o connector deve responder:

```text
OPERATION_NOT_SUPPORTED
```

## 55. ACCOUNT BINDING

Associar:

```text
organization_id
legal_entity_id
bank
account_ref
currency
allowed_employee_instances
allowed_users
```

## 56. CANONICAL BANK MODEL

```text
CanonicalBankAccount
CanonicalBankBalance
CanonicalBankTransaction
CanonicalBankStatement
```

## 57. BANK RECONCILIATION FLOW

```text
Bank Read-Only
+
Primavera Read-Only
↓
#64 Bank Reconciliation
↓
Matching
↓
Exceptions
↓
Human Review
↓
Reconciliation Report
```

## 58. BANK SECURITY

Exigir:

```text
strong auth
vault
least privilege
mTLS/certificates where applicable
full audit
restricted data classification
```

## 59. BANK TESTS

```text
connect
list authorized accounts
read balance
read transactions
read statement
period filter
canonical mapping
snapshot
audit
payment blocked
transfer blocked
beneficiary operation blocked
cross-tenant blocked
```

---

# 60. CONNECTION CENTER

Criar ecrã:

```text
Connections
├── Email
├── WhatsApp / Messaging
├── Drive
├── Primavera v10
├── Excel Automation
└── Bank
```

Cada card deve mostrar:

```text
Provider
Status
Mode
Scopes
Last Sync
Health
Employees Using
Configure
Test
Pause
Revoke
```

---

# 61. EMPLOYEE CONNECTION BINDING

Cada Employee Instance deve ter:

```text
allowed_connection_ids
allowed_operations
allowed_resources
```

Exemplo:

```yaml
employee_instance: EMP-ORG-001-073-001

connections:
  email:
    mode: DRAFT_AND_APPROVED_SEND

  drive:
    mode: READ_AND_APPROVED_WRITE

  primavera:
    mode: READ_ONLY
    scopes:
      - ledger
      - sales
      - stock

  excel:
    mode: AUTO_INGEST

  bank:
    mode: READ_ONLY
    accounts:
      - operating_account
```

---

# 62. CONNECTION HEALTH

Estados:

```text
Healthy
Degraded
Disconnected
Needs Reauthorization
Revoked
```

Se uma ligação falhar:

```text
do not fabricate
do not silently bypass
do not silently use stale data
```

Usar:

```text
WAITING_CONNECTION
WAITING_DATA
DEGRADED
```

---

# 63. DATA FRESHNESS

Se usar snapshot/cache:

```text
show source timestamp
show freshness
show stale warning
```

---

# 64. DATA LINEAGE

Todo dado deve carregar:

```text
source_connector
source_resource
retrieved_at
snapshot_id
mapping_version
```

---

# 65. EVENTS

Emitir:

```text
EV.email.received
EV.message.received
EV.storage.file_created
EV.primavera.snapshot_ready
EV.spreadsheet.ingested
EV.bank.transactions_ready
```

---

# 66. WEBHOOK VS POLLING

Preferir webhook/eventos quando o provider suportar de forma segura.

Polling fallback:

```text
bounded frequency
checkpoint
idempotency
rate-limit awareness
```

---

# 67. RESILIENCE

Implementar:

```text
outbox
inbox
DLQ
bounded retries
exponential backoff
circuit breaker
sync checkpoints
deduplication
controlled replay
```

---

# 68. SECURITY AGAINST EXTERNAL CONTENT

Email, WhatsApp, Drive e Excel devem ser tratados como fontes potencialmente não confiáveis.

Marcar quando aplicável:

```text
source_trust = EXTERNAL_UNTRUSTED
```

Texto num email, documento ou célula não pode alterar:

```text
system policies
permissions
approval requirements
tenant scope
```

---

# 69. PILOT ORDER IN THE COMPANY

Executar:

```text
1. EMAIL
2. WHATSAPP
3. DRIVE
4. PRIMAVERA READ-ONLY
5. EXCEL AUTOMÁTICO
6. BANCO READ-ONLY
```

Cada fase só avança após:

```text
FUNCTIONAL PASS
SECURITY PASS
TENANT ISOLATION PASS
AUDIT PASS
NO CRITICAL ISSUE
```

---

# 70. PILOT COMBINATIONS

```text
#261 Document Creator
→ Email + Drive

#66 Document Classification
→ Email + Drive + Excel

#73 Management Reporting
→ Primavera + Excel + Drive + Email + optional Bank

#64 Bank Reconciliation
→ Bank Read-Only + Primavera Read-Only + Excel
```

---

# 71. END-TO-END — MANAGEMENT REPORTING

```text
Primavera Read-Only
+
Excel Automático
+
Banco Read-Only
↓
Canonical Data Products
↓
#73 Management Reporting
↓
Report
↓
Preview
↓
Approval
↓
Drive
+
Email
+
WhatsApp Secure Link
```

---

# 72. END-TO-END — BANK RECONCILIATION

```text
Bank Read-Only
+
Primavera Read-Only
↓
#64 Bank Reconciliation
↓
Matching
↓
Exceptions
↓
Human Review
↓
Reconciliation Report
↓
Drive / Email
```

---

# 73. FEATURE FLAGS

Activar integrações por:

```text
environment
organization
employee instance
pilot cohort
```

Nunca `global on` por defeito.

---

# 74. REVOKE CONNECTION

Ao revogar:

```text
tokens revoked
webhooks disabled
scheduled sync disabled
employee binding disabled
active credentials invalidated
audit preserved
```

---

# 75. DATABASE ENTITIES

Criar/reutilizar:

```text
connectors
connector_versions
connector_capabilities
organization_connections
connection_credentials_refs
connection_scopes
employee_connection_bindings
connection_health_checks
connection_sync_runs
connection_sync_checkpoints
connection_events
connection_audit
approved_read_queries
spreadsheet_schemas
spreadsheet_mappings
bank_account_bindings
authorized_business_contacts
delivery_receipts
```

---

# 76. REQUIRED PACKAGES

```text
packages/connectors-core/
packages/email-connector/
packages/business-messaging-connector/
packages/cloud-storage-connector/
packages/primavera-v10-readonly/
packages/spreadsheet-auto-ingestion/
packages/bank-readonly/
packages/connector-health/
packages/connector-security/
packages/connector-observability/
```

---

# 77. REQUIRED APIS

Common:

```text
POST /organizations/{orgId}/connections
GET  /organizations/{orgId}/connections
GET  /connections/{id}
POST /connections/{id}/authenticate
POST /connections/{id}/test
POST /connections/{id}/activate
POST /connections/{id}/pause
POST /connections/{id}/revoke
GET  /connections/{id}/health
```

Employee binding:

```text
POST   /employee-instances/{id}/connections
GET    /employee-instances/{id}/connections
DELETE /employee-instances/{id}/connections/{connectionId}
```

Email:

```text
GET  /connections/{id}/email/messages
POST /connections/{id}/email/drafts
POST /connections/{id}/email/send
```

Messaging:

```text
GET  /connections/{id}/messages
POST /connections/{id}/message-drafts
POST /connections/{id}/messages/send
```

Storage:

```text
GET  /connections/{id}/files
GET  /connections/{id}/files/{fileId}
POST /connections/{id}/files/output
POST /connections/{id}/watchers
```

Primavera:

```text
GET /connections/{id}/primavera/customers
GET /connections/{id}/primavera/suppliers
GET /connections/{id}/primavera/sales
GET /connections/{id}/primavera/stock
GET /connections/{id}/primavera/ledger
```

Excel:

```text
POST /connections/{id}/spreadsheet/watch
GET  /spreadsheet-ingestion/{runId}
POST /spreadsheet-mappings/{id}/approve
```

Bank:

```text
GET /connections/{id}/bank/accounts
GET /connections/{id}/bank/accounts/{accountId}/balance
GET /connections/{id}/bank/accounts/{accountId}/transactions
GET /connections/{id}/bank/accounts/{accountId}/statements
```

Nenhum endpoint de pagamento na versão read-only.

---

# 78. AUTOMATED TEST SUITES

Criar:

```text
tests/email/
tests/business-messaging/
tests/drive/
tests/primavera-readonly/
tests/excel-auto/
tests/bank-readonly/
tests/tenant-isolation/
tests/secrets/
tests/prompt-injection/
tests/idempotency/
tests/failover/
```

---

# 79. PHASE GATES

EMAIL:

```text
AUTH                   PASS
READ                   PASS
ATTACHMENT             PASS
DRAFT                  PASS
APPROVED SEND          PASS
DUPLICATE PREVENTION   PASS
AUDIT                  PASS
SECURITY               PASS
```

WHATSAPP:

```text
BUSINESS CONNECTION    PASS
CONTACT VALIDATION     PASS
DRAFT                  PASS
PREVIEW                PASS
APPROVAL               PASS
SEND                   PASS
RECEIPT                PASS
SECURITY               PASS
```

DRIVE:

```text
AUTH                   PASS
FOLDER SCOPE           PASS
READ                   PASS
WATCH                  PASS
INGEST                 PASS
OUTPUT WRITE           PASS
VERSIONING             PASS
AUDIT                  PASS
```

PRIMAVERA READ-ONLY:

```text
CONNECTION             PASS
CUSTOMER READ          PASS
SUPPLIER READ          PASS
SALES READ             PASS
STOCK READ             PASS
LEDGER READ            PASS
CANONICAL MAPPING      PASS
WRITE ATTEMPT BLOCKED  PASS
SQL ABUSE BLOCKED      PASS
AUDIT                  PASS
```

EXCEL AUTOMÁTICO:

```text
SOURCE WATCH           PASS
FILE DETECTION         PASS
SAFE PARSING           PASS
SCHEMA DETECTION       PASS
MAPPING                PASS
DATA QUALITY           PASS
SNAPSHOT               PASS
TASK TRIGGER           PASS
MACRO EXECUTION BLOCK  PASS
```

BANK READ-ONLY:

```text
AUTH                   PASS
ACCOUNT LIST           PASS
BALANCE READ           PASS
TRANSACTION READ       PASS
STATEMENT READ         PASS
CANONICAL MAPPING      PASS
PAYMENT BLOCKED        PASS
TRANSFER BLOCKED       PASS
TENANT ISOLATION       PASS
AUDIT                  PASS
```

---

# 80. PROVIDER-SPECIFIC CERTIFICATION

Nunca declarar uma integração universalmente certificada só porque um provider passou.

Exemplo:

```text
Bank Connector
Provider A     CERTIFIED
Provider B     NOT_TESTED
Provider C     PILOT
```

---

# 81. 500 EMPLOYEE CONNECTOR COMPATIBILITY MATRIX

Gerar:

```text
Employee ID
Role
Department
Email
WhatsApp
Drive
Primavera
Excel Auto
Bank Read-Only
Required/Recommended/Optional/Not Applicable/Prohibited
Allowed Operations
Approval Requirement
Risk
```

Classificações:

```text
REQUIRED
RECOMMENDED
OPTIONAL
NOT_APPLICABLE
PROHIBITED
```

Nem todos os 500 Employees devem receber todas as integrações.

---

# 82. GENERATED FILES

Gerar:

```text
generated/email_connector_manifest.json
generated/business_messaging_connector_manifest.json
generated/cloud_storage_connector_manifest.json
generated/primavera_v10_readonly_manifest.json
generated/excel_auto_ingestion_manifest.json
generated/bank_readonly_manifest.json
generated/connector_security_matrix.json
generated/connector_capability_matrix.json
generated/employee_connector_compatibility_500.json
generated/organization_connection_templates.json
```

---

# 83. DOCUMENTATION

Gerar:

```text
docs/EMAIL_INTEGRATION.md
docs/BUSINESS_MESSAGING_INTEGRATION.md
docs/DRIVE_INTEGRATION.md
docs/PRIMAVERA_V10_READONLY.md
docs/EXCEL_AUTOMATIC_INGESTION.md
docs/BANK_READONLY_INTEGRATION.md
docs/CONNECTOR_SECURITY_MODEL.md
docs/CONNECTION_ONBOARDING.md
docs/PROVIDER_CERTIFICATION.md
```

---

# 84. DEFINITION OF DONE

Email:

```text
inbound
attachment ingestion
draft
preview
approved send
receipt
audit
security
```

WhatsApp:

```text
authorized business integration
contact validation
draft
preview
approval
send
receipt
secure-link support
```

Drive:

```text
read
folder watch
ingestion
versioning
approved output save
audit
```

Primavera:

```text
read-only connection
approved queries
canonical mappings
snapshots
no writes possible
audit
```

Excel Automático:

```text
automatic detection
safe parsing
schema mapping
data quality
versioned snapshot
task trigger
no macro execution
```

Bank Read-Only:

```text
read-only account access
balances
transactions
statements
canonical mapping
no payment operations
strong audit
```

---

# 85. FINAL ACCEPTANCE GATE

```text
EMAIL                     PASS
BUSINESS MESSAGING        PASS
DRIVE                     PASS
PRIMAVERA READ-ONLY       PASS
EXCEL AUTOMATIC           PASS
BANK READ-ONLY            PASS

TENANT ISOLATION          PASS
SECRETS                   PASS
PERMISSIONS               PASS
AUDIT                     PASS
OBSERVABILITY             PASS
ERROR HANDLING            PASS
IDEMPOTENCY               PASS
```

---

# 86. PRINCÍPIOS DE VERDADE

```text
CAN DRAFT EMAIL
!=
CAN SEND EMAIL

CAN PREPARE WHATSAPP
!=
CAN MESSAGE ANY NUMBER

CAN READ DRIVE FOLDER
!=
CAN READ ENTIRE DRIVE

CAN READ PRIMAVERA
!=
CAN POST TO PRIMAVERA

CAN INGEST EXCEL
!=
CAN EXECUTE MACROS

CAN READ BANK DATA
!=
CAN MOVE MONEY
```

---

# 87. PRINCÍPIO FINAL

A plataforma deve evoluir de:

```text
MANUAL FILE UPLOAD
```

para:

```text
EMAIL
↓
WHATSAPP
↓
DRIVE
↓
PRIMAVERA READ-ONLY
↓
EXCEL AUTOMÁTICO
↓
BANCO READ-ONLY
```

sem aumentar autonomia implicitamente.

Uma integração só pode ser declarada pronta quando estiver realmente:

```text
IMPLEMENTED
+
AUTHENTICATED
+
CONNECTED
+
TESTED
+
SECURITY VALIDATED
+
CERTIFIED
```

no provider e ambiente aplicáveis.

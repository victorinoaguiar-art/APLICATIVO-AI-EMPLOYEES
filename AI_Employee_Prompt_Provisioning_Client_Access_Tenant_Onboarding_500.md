# PROMPT MESTRE — AI EMPLOYEE PROVISIONING, CLIENT ACCESS & TENANT ONBOARDING SYSTEM
## Provisionamento, Acesso do Cliente, Configuração Organizacional, Activação e Offboarding dos 500 AI Employees

**Sigla:** APCATOS  
**Versão:** 1.0  
**Âmbito:** AI Employee Platform — 500/500 Priority Employee Program  
**Integrações obrigatórias:** AESSRE, Runtime Orchestrator, RolePack Registry, Work Contracts, ORDKS, Enterprise Connection Hub, Enterprise Data Gateway, P02 Security, P03 Connector SDK, P04 Evaluation & Certification, P05 Infrastructure, P06 Marketplace/Billing/Metering, P07 Release Readiness, EREMS, CAQRS, ATCCRS, CLBGS, Document Generation Service, Organization Readiness, Shadow Mode, Audit, Observability e Delivery Router.

---

# 0. INSTRUÇÃO PRINCIPAL

ACTUE COMO uma equipa sénior composta por Arquitecto Principal de Software, Arquitecto SaaS Multi-Tenant, Arquitecto IAM, Arquitecto Zero Trust, Engenheiros Backend/Frontend/Mobile/Dados/Integrações/DevOps, especialistas em SSO/MFA, Secrets Management, Customer Onboarding, Workflows, ERP/CRM/DMS, Billing, Audit, Compliance, Reliability e Human-in-the-Loop.

Implemente o **AI Employee Provisioning, Client Access & Tenant Onboarding System — APCATOS** como a camada operacional oficial que transforma uma contratação comercial válida numa instância privada, configurada, acessível, testada e activada de um AI Employee.

---

# 1. PRINCÍPIO CENTRAL

O cliente não recebe o Role Pack original nem o Core Runtime.

Recebe:

```text
RIGHT TO USE
+
SUBSCRIPTION
+
PRIVATE EMPLOYEE INSTANCE
+
ORGANIZATION-SPECIFIC CONFIGURATION
+
AUTHORIZED ACCESS
```

---

# 2. POSSE E USO

A plataforma mantém Core Runtime, Role Packs, serviços partilhados e infraestrutura de certificação. O cliente controla os seus dados, utilizadores autorizados, configurações, políticas, instâncias contratadas e outputs conforme contrato.

---

# 3. NÃO TRATAR COMO CEDÊNCIA LABORAL

Na experiência comercial pode existir:

```text
CONTRATAR EMPLOYEE DIGITAL
```

Mas tecnicamente:

```text
SUBSCRIPTION + PROVISIONED SOFTWARE INSTANCE
```

---

# 4. FLUXO END-TO-END

```text
DISCOVER
↓
SELECT EMPLOYEE
↓
PLAN
↓
QUOTE / CHECKOUT
↓
CONTRACT / TERMS
↓
SUBSCRIPTION
↓
PROVISION INSTANCE
↓
SELECT / CREATE ORGANIZATION
↓
ASSIGN DEPARTMENT
↓
ASSIGN SUPERVISOR
↓
INVITE USERS
↓
CONFIGURE ACCESS
↓
CONNECT SYSTEMS
↓
LOAD ORGANIZATION PACK
↓
LOAD BRANDING/TEMPLATES
↓
SET PERMISSIONS
↓
SET AUTONOMY
↓
SET APPROVAL MATRIX
↓
ORGANIZATION TRAINING
↓
READINESS TEST
↓
CONTROLLED PILOT
↓
ACTIVATE
↓
WORK
↓
MEASURE
↓
BILL
↓
SUSPEND / CANCEL / OFFBOARD
```

---

# 5. TRIGGER DE PROVISIONAMENTO

Uma subscrição válida deve emitir:

```text
EV.employee.hired
```

e criar um `ProvisioningJob`.

---

# 6. PROVISIONING JOB

Campos obrigatórios:

```text
provisioning_job_id
organization_id
role_id
subscription_id
plan_id
requested_by
requested_at
state
idempotency_key
```

---

# 7. IDEMPOTÊNCIA

A mesma contratação nunca pode criar duas instâncias por engano.

---

# 8. EMPLOYEE INSTANCE

Criar entidade `EmployeeInstance`.

Exemplo de ID:

```text
EMP-ORG-ABC-073-001
```

---

# 9. INSTANCE FIELDS

```text
instance_id
tenant_id
organization_id
role_id
role_key
display_name
department_id
supervisor_id
subscription_id
plan_id
commercial_status
runtime_status
organization_readiness_status
created_at
activated_at
suspended_at
archived_at
```

---

# 10. ROLE ≠ INSTANCE

```text
ROLE
= definição partilhada do produto

INSTANCE
= configuração operacional específica do cliente
```

---

# 11. MULTI-INSTANCE

O mesmo Role pode ter milhares de instâncias em organizações diferentes e várias instâncias na mesma organização.

---

# 12. ISOLAMENTO MULTI-TENANT

Toda operação deve carregar `tenant_id` e `organization_id`.

Qualquer tentativa:

```text
Org A Instance → Org B Data
```

deve resultar em:

```text
CROSS_TENANT_ACCESS_BLOCKED
```

---

# 13. ESTADOS DE PROVISIONAMENTO

```text
REQUESTED
VALIDATING
PROVISIONING
CONFIGURING
WAITING_ORGANIZATION_SETUP
WAITING_USERS
WAITING_CONNECTIONS
WAITING_POLICIES
WAITING_APPROVAL_MATRIX
WAITING_TRAINING
WAITING_READINESS_TEST
READY_FOR_PILOT
PILOTING
ORGANIZATION_READY
ACTIVE
PAUSED
SUSPENDED
CANCELLED
ARCHIVED
FAILED
```

---

# 14. COMMERCIAL VALIDATION GATE

Antes de provisionar validar:

```text
subscription valid
plan valid
role commercially eligible
jurisdiction allowed
certification acceptable
```

---

# 15. ORGANIZATION RESOLUTION

O cliente pode seleccionar uma organização existente ou criar nova organização.

---

# 16. ORGANIZATION MASTER

Campos mínimos:

```text
legal_name
commercial_name
NIF/tax_id
country
jurisdiction
industry
timezone
currency
primary_admin
```

---

# 17. MULTI-ENTITY

Suportar:

```text
parent company
subsidiary
branch
business unit
```

---

# 18. LEGAL ENTITY BINDING

Documentos, facturação, branding e permissões devem resolver a entidade legal correcta.

---

# 19. DEPARTMENT BINDING

Associar:

```text
department_id
cost_center_id
business_unit_id
```

---

# 20. SUPERVISOR

Cada instância deve ter supervisor humano ou AI Manager autorizado. Para papéis materiais, permitir exigir supervisor humano.

---

# 21. ORGANIZATION USER

Criar `OrganizationUser` com:

```text
user_id
tenant_id
organization_id
email
name
role
department
status
authentication_method
mfa_status
```

---

# 22. ROLES DE ACESSO

```text
ORGANIZATION_ADMIN
IT_ADMIN
DEPARTMENT_MANAGER
EMPLOYEE_SUPERVISOR
REVIEWER
APPROVER
STANDARD_USER
VIEWER
BILLING_ADMIN
SECURITY_ADMIN
```

---

# 23. RBAC + ABAC

Implementar ambos.

---

# 24. EXEMPLO DE ACESSO

```text
CFO
→ atribui tarefas financeiras
→ vê outputs
→ aprova trabalho material

IT Admin
→ gere connections
→ não vê dados financeiros sem autorização

Assistente
→ cria tarefas permitidas
→ não altera autonomia
```

---

# 25. AUTENTICAÇÃO

Suportar:

```text
password + MFA
OIDC
SAML
SSO empresarial
```

---

# 26. MFA

MFA obrigatório para funções elevadas configuráveis.

---

# 27. INVITATION FLOW

```text
Admin convida
↓
utilizador aceita
↓
identidade validada
↓
MFA/SSO
↓
role atribuído
↓
acesso activo
```

---

# 28. USER DEPROVISIONING

Ao remover utilizador:

```text
revoke sessions
revoke tokens
remove assignments
preserve audit
```

---

# 29. CANAIS DE ACESSO AO EMPLOYEE

```text
WEB
MOBILE
EMAIL
VOICE
FORM
API
WEBHOOK
ERP EVENT
CRM EVENT
SCHEDULE
MESSAGING
EMPLOYEE-TO-EMPLOYEE
```

---

# 30. CHANNEL ENTITLEMENT

Cada canal pode depender de plano e policy.

---

# 31. CHANNEL AUTHORIZATION

Plano habilitar canal não significa que qualquer utilizador pode usá-lo.

---

# 32. WEB — MY DIGITAL WORKFORCE

Criar área:

```text
MINHA FORÇA DE TRABALHO DIGITAL
```

---

# 33. EMPLOYEE WORKSPACE

Mostrar:

```text
Nome
Role
Departamento
Supervisor
Status
Plano
Tarefas
Trabalhos
Documentos
Aprovações
Reliability
Qualidade
Uso
Custo
Connections
Configurações
```

---

# 34. ACÇÕES PRINCIPAIS

Conforme permissão:

```text
ATRIBUIR TAREFA
VER TRABALHOS
PEDIR REVISÃO
APROVAR
PAUSAR
CONFIGURAR
```

---

# 35. MOBILE

Permitir tarefas, aprovações, notificações, preview e configuração básica.

---

# 36. EMAIL

Permitir alias/endereço autorizado por Employee ou organização.

---

# 37. EMAIL SECURITY

Validar:

```text
sender identity
tenant
attachments
malware
prompt injection
```

---

# 38. VOICE

Voice pode criar tarefa, mas não pode sozinho autorizar acção material R4/R5.

---

# 39. API

Criar tokens com scopes.

Exemplo:

```text
tasks.create
tasks.read
outputs.read
approvals.submit
```

---

# 40. WEBHOOK

Exigir assinatura, timestamp e replay protection.

---

# 41. IDENTITY RESOLUTION

Toda entrada deve resolver:

```text
user
tenant
organization
employee_instance
```

---

# 42. UNIFIED COMMAND & EVENT GATEWAY

Todos os canais passam pelo gateway único.

---

# 43. PIPELINE DE SEGURANÇA

```text
IDENTITY
↓
TENANT
↓
ENTITLEMENT
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

---

# 44. ORGANIZATION PACK

Carregar:

```text
legal identity
structure
chart of accounts
cost centers
customers
suppliers
products
assets
inventory
locations
calendars
policies
SOPs
templates
document numbering
ERP mappings
CRM rules
HR rules
KPIs
budgets
delegations
exceptions
```

---

# 45. PACK VERSIONING

Organization Pack deve ser versionado e auditável.

---

# 46. INDUSTRY / JURISDICTION / SYSTEM PACKS

Associar packs aplicáveis, incluindo Angola quando configurado e usando apenas regras verificadas/versionadas.

---

# 47. CONNECTION PROFILE

Criar `ConnectionProfile`.

---

# 48. TIPOS DE CONNECTION

```text
ERP
BANK
CRM
DMS
EMAIL
CLOUD_DRIVE
DATABASE
EXCEL
POWER_QUERY
MESSAGING
API
SFTP
LOCAL_FOLDER
SCANNER
INDUSTRY_SYSTEM
```

---

# 49. CONNECTION STATES

```text
MANIFEST_EXISTS
IMPLEMENTED
AUTHENTICATED
CONNECTED
TESTED
CERTIFIED
DEGRADED
DISCONNECTED
REVOKED
```

---

# 50. ENTERPRISE DATA GATEWAY

Para sistemas locais usar:

```text
outbound-only
TLS/mTLS
encrypted credential refs
allowlists
read-only default
buffering
audit
```

---

# 51. NÃO CRIAR TÚNEL GENÉRICO

O Gateway não deve expor a rede interna.

---

# 52. CREDENTIAL VAULT

Nunca enviar raw passwords ou secrets ao LLM.

---

# 53. CONNECTION PERMISSIONS

```text
read
write
create
update
delete
submit
send
approve
```

conforme manifest e policy.

---

# 54. READ-ONLY DEFAULT

Novas ligações começam read-only quando possível.

---

# 55. PERMISSION ENGINE

Combinar:

```text
role permission
instance permission
user permission
resource attributes
risk
```

---

# 56. LEAST PRIVILEGE + DENY BY DEFAULT

Obrigatório.

---

# 57. TOOL BINDING

A instância recebe apenas tools aprovadas.

---

# 58. INPUT BINDINGS

Mapear:

```text
canonical input
→ real tenant source
```

---

# 59. OUTPUT ROUTES

Suportar:

```text
Human Control Center
Email
Drive
SharePoint
DMS
API
Webhook
Messaging
Print
Downstream Employee
```

---

# 60. DELIVERY RECEIPT

Toda entrega gera receipt.

---

# 61. CLBGS / BRANDING

Associar:

```text
Brand Pack
Letterhead
Templates
Signatures
Seals
Stationery
```

---

# 62. APPROVAL MATRIX

Criar `OrganizationApprovalMatrix`.

Exemplo:

```text
Expense < threshold → Manager
Payment > threshold → CFO + Director
Legal Contract → Legal + Director
```

---

# 63. DUAL CONTROL

Suportar.

---

# 64. AUTONOMY

Configurar L0–L5, nunca acima da autonomia certificada.

---

# 65. PLAN ≠ AUTONOMY

Plano Enterprise não eleva autonomia automaticamente.

---

# 66. SUPERVISION

Aplicar H0–H5 conforme EREMS/ATCCRS/policy.

---

# 67. EMPLOYEE WORK BINDING

Criar `EmployeeWorkBinding`.

Campos:

```text
organization_id
instance_id
role_id
inputs
triggers
tools
connections
output_routes
supervisor
autonomy
risk
approval
templates
knowledge
```

---

# 68. ORGANIZATION TRAINING

Integrar ATCCRS para ensinar:

```text
local systems
policies
SOPs
templates
approval matrix
master data
terminology
```

---

# 69. TRAINING SANDBOX

Executar treino local sem side effects reais.

---

# 70. ORGANIZATION READINESS RUN

Criar `OrganizationReadinessRun`.

---

# 71. READINESS CHECKLIST

Obrigatório:

```text
organization valid
users valid
supervisor assigned
connections healthy
permissions valid
input bindings valid
output routes valid
policies active
approval matrix valid
knowledge loaded
templates valid
brand pack valid where applicable
test task passed
delivery passed
audit passed
```

---

# 72. READINESS STATES

```text
NOT_READY
CHECKING
BLOCKED
READY_FOR_PILOT
ORGANIZATION_READY
```

---

# 73. FAIL FAST

Falha de tenant isolation/security = NO-GO.

---

# 74. TEST TASK

Executar tarefa realista com dados de teste ou amostra aprovada.

---

# 75. TEST OUTPUT

Validar resultado, delivery e audit.

---

# 76. CONTROLLED PILOT

Quando aplicável:

```text
PILOTING
```

com revisão humana reforçada.

---

# 77. SHADOW MODE

Employee executa sem realizar compromisso material autónomo.

---

# 78. PILOT METRICS

Integrar:

```text
EREMS
CAQRS
ATCCRS
```

---

# 79. PILOT EXIT

```text
ORGANIZATION_READY
REMEDIATION_REQUIRED
PILOT_EXTENDED
BLOCKED
```

---

# 80. ACTIVATION GATE

Só activar se:

```text
subscription = ACTIVE
commercial_readiness = VALID
platform_certification = VALID
organization_readiness = PASS
client_access = PASS
security = PASS
```

---

# 81. ACTIVE

`ACTIVE` não significa autonomia ilimitada.

---

# 82. ACTIVE RUNTIME CONTROLS

Continuam:

```text
permissions
policies
risk
approval
supervision
audit
usage limits
budgets
```

---

# 83. RELAÇÃO DIÁRIA

```text
Client / System / Event
↓
Employee Instance
↓
Task
↓
Execution
↓
Validation
↓
Approval when required
↓
Delivery
↓
Acceptance / Revision
↓
Audit + Metering
```

---

# 84. TASK INBOX

Cada Employee pode ter caixa de tarefas.

---

# 85. TASK TYPES

```text
manual
scheduled
event-triggered
system-triggered
employee-to-employee
```

---

# 86. CALENDAR

Mostrar recorrências, deadlines e upcoming work.

---

# 87. WORK HISTORY

Outputs e versões.

---

# 88. DOCUMENTS

Documentos produzidos e aceites.

---

# 89. APPROVALS

Pendências e histórico.

---

# 90. PERFORMANCE

Reliability + CAQRS.

---

# 91. USAGE & COST

Integrar AESSRE.

---

# 92. USAGE METERING

Idempotente.

---

# 93. BILLING START POLICY

Configurar:

```text
subscription date
organization-ready date
activation date
```

e mostrar ao cliente antes da contratação.

---

# 94. ENTITLEMENT ENGINE

Aplicar plano, volume, conectores e limites.

---

# 95. ENTITLEMENT ≠ PERMISSION

Obrigatório.

---

# 96. ENTITLEMENT ≠ CERTIFICATION

Obrigatório.

---

# 97. USAGE LIMIT

Ao atingir limite:

```text
warn
throttle
request upgrade
block non-critical work
```

conforme política.

---

# 98. NO SURPRISE OVERAGE

Notificar antes de cobrança adicional sempre que aplicável.

---

# 99. MULTI-EMPLOYEE ACCESS

Um utilizador autorizado pode aceder a vários Employees.

---

# 100. DEPARTMENT / TEAM / ORG CHART

Mostrar humanos e AI Employees segundo permissões.

---

# 101. HUMAN OVERRIDE

Suportar:

```text
Pause
Stop
Take Over
Reassign
Rollback where possible
```

---

# 102. GLOBAL KILL SWITCH

```text
STOP ALL AI EMPLOYEES
→ PAUSED_GLOBAL
```

---

# 103. NOTIFICATIONS

```text
task complete
approval required
error
connection failure
usage threshold
billing issue
security issue
```

---

# 104. AUDIT

Guardar:

```text
login
access
API token use
connections
tasks
tool calls
approvals
documents
client acceptance
reliability events
billing-relevant usage
```

---

# 105. CLIENT ACCESS PASSPORT

Criar `ClientAccessPassport`.

Campos:

```text
organization
instance
authorized users
channels
permissions
MFA
SSO
API scopes
connection scopes
last_access_review
```

---

# 106. ORGANIZATION READINESS PASSPORT

Criar `OrganizationEmployeeReadinessPassport`.

Exemplo:

```yaml
organization_employee_readiness:
  organization_id: org_001
  instance_id: EMP-ORG-001-073-001
  identity: PASS
  users: PASS
  supervisor: PASS
  connections: PASS
  permissions: PASS
  policies: PASS
  approval_matrix: PASS
  knowledge: PASS
  templates: PASS
  training: PASS
  test_task: PASS
  delivery: PASS
  audit: PASS
  status: ORGANIZATION_READY
```

---

# 107. CLIENT ACCESS GATE

```text
IDENTITY        PASS
MFA/SSO         PASS
RBAC            PASS
ABAC            PASS
CHANNEL SCOPES  PASS
API SCOPES      PASS
AUDIT           PASS
```

---

# 108. ACCESS REVIEW

Permitir revisão periódica e revogação imediata.

---

# 109. TEMPORARY ACCESS

Suportar data de expiração.

---

# 110. DELEGATION

Aprovações delegadas devem possuir:

```text
delegator
delegate
scope
valid_from
valid_until
audit
```

---

# 111. BREAK-GLASS

Enterprise/security apenas, fortemente auditado.

---

# 112. NO LLM AUTHORIZATION

O LLM nunca decide sozinho se um utilizador tem permissão.

---

# 113. CUSTOMER PORTAL

Criar:

```text
Organization
Digital Workforce
Users
Connections
Policies
Approvals
Billing
Security
Audit
```

---

# 114. ADMIN PORTAL

Separado do portal do cliente.

---

# 115. SUPPORT ACCESS

Least privilege + explicit audited support mode.

---

# 116. CANCELLATION FLOW

```text
CANCELLATION_REQUESTED
↓
CANCELLATION_SCHEDULED
↓
OFFBOARDING
↓
CANCELLED
↓
ARCHIVED
```

---

# 117. OFFBOARDING

```text
stop new tasks
↓
handle in-flight tasks
↓
export permitted data
↓
revoke tokens
↓
disable webhooks
↓
disconnect credentials
↓
disable scheduled work
↓
revoke instance access
↓
archive outputs
↓
apply retention
↓
final billing
↓
archive instance
```

---

# 118. IN-FLIGHT TASK POLICY

```text
finish safely
cancel
request human decision
```

---

# 119. DATA EXPORT

Permitir exportar dados/outputs conforme contrato e policy.

---

# 120. CREDENTIAL REVOCATION

Obrigatório no offboarding.

---

# 121. RETENTION

Aplicar requisitos legais, contratuais e organizacionais.

---

# 122. ARCHIVE

Preservar audit sem manter secrets activos.

---

# 123. REACTIVATION

Revalidar:

```text
subscription
certification
connections
permissions
policies
knowledge freshness
```

---

# 124. TRANSFER BETWEEN DEPARTMENTS

Permitido dentro da mesma organização, com revalidação de supervisor, data bindings, permissions e approvals.

---

# 125. TRANSFER BETWEEN LEGAL ENTITIES

Exige processo reforçado. Nunca mover silenciosamente.

---

# 126. SHARED ORGANIZATION ASSETS

Podem ser reutilizados, se autorizados:

```text
connections
brand pack
approval matrix
knowledge
templates
```

---

# 127. MEMORY

Memory sharing entre Employees só pode ocorrer por policy explícita.

---

# 128. CUSTOMER DATA

Definir propriedade, portabilidade, retention e exportação contratualmente.

---

# 129. PLATFORM IP

Core, Role Packs e runtime permanecem propriedade/protecção da plataforma por defeito.

---

# 130. ENTERPRISE DEDICATED DEPLOYMENT

Suportar futuramente sem remover os princípios de governance.

---

# 131. ONBOARDING DASHBOARD

Mostrar:

```text
Organization Setup
Users
Connections
Policies
Approvals
Training
Readiness
Pilot
Activation
```

---

# 132. BLOCKERS

Exemplos:

```text
missing supervisor
connection failed
template missing
approval matrix incomplete
```

cada um com owner.

---

# 133. EXPRESS ONBOARDING

Low-risk Employee pode usar fluxo simplificado se todos os gates passarem.

---

# 134. ADVANCED ONBOARDING

High-risk/integration-heavy usa fluxo reforçado.

---

# 135. ONBOARDING TEMPLATES

Por:

```text
industry
jurisdiction
organization size
role
risk
```

---

# 136. TIME TO VALUE

Medir:

```text
hire
→ first accepted successful output
```

---

# 137. ONBOARDING METRICS

```text
time_to_provision
time_to_organization_ready
time_to_first_success
activation_rate
onboarding_dropoff
common_blockers
```

---

# 138. CONFIGURATION DRIFT

Detectar mudanças não aprovadas.

---

# 139. PERIODIC HEALTH CHECK

Por instância:

```text
subscription
certification
connections
permissions
knowledge
policy
runtime
```

---

# 140. AUTO-PAUSE

Condição crítica pode pausar instância.

---

# 141. NO SINGLE GREEN STATUS

Falha crítica prevalece sobre score agregado.

---

# 142. DATABASE ENTITIES

Criar:

```text
organizations
organization_legal_entities
organization_users
organization_user_roles
employee_instances
provisioning_jobs
employee_work_bindings
client_access_passports
organization_employee_readiness_passports
organization_readiness_runs
organization_approval_matrices
organization_supervisors
organization_connections
connection_credentials_refs
instance_tool_bindings
instance_input_bindings
instance_output_routes
instance_channel_bindings
instance_policy_bindings
instance_autonomy_settings
instance_supervision_profiles
instance_brand_bindings
instance_template_bindings
onboarding_tasks
onboarding_blockers
pilot_runs
activation_events
access_reviews
access_change_events
offboarding_jobs
offboarding_steps
instance_archives
```

---

# 143. APIs

Criar:

```text
POST /organizations
POST /organizations/{orgId}/employees/{roleId}/hire

GET  /employee-instances/{id}
POST /employee-instances/{id}/configure
POST /employee-instances/{id}/activate
POST /employee-instances/{id}/pause
POST /employee-instances/{id}/cancel

POST /organizations/{orgId}/users/invite
GET  /organizations/{orgId}/users

POST /organizations/{orgId}/connections
POST /connections/{id}/test
POST /connections/{id}/revoke

POST /employee-instances/{id}/readiness-check
GET  /employee-instances/{id}/readiness

POST /employee-instances/{id}/pilot/start
POST /employee-instances/{id}/pilot/complete

GET  /employee-instances/{id}/access
POST /employee-instances/{id}/access/review

POST /employee-instances/{id}/offboard
GET  /employee-instances/{id}/offboarding-status
```

---

# 144. SCHEMAS

Criar:

```text
employee-instance.schema.json
provisioning-job.schema.json
organization-user.schema.json
client-access-passport.schema.json
organization-readiness-passport.schema.json
employee-work-binding.schema.json
approval-matrix.schema.json
offboarding-job.schema.json
```

---

# 145. PACKAGES

Criar:

```text
packages/instance-provisioning/
packages/tenant-onboarding/
packages/client-access/
packages/iam/
packages/organization-readiness/
packages/pilot-orchestrator/
packages/instance-activation/
packages/instance-offboarding/
packages/access-review/
packages/configuration-drift/
```

---

# 146. UI SCREENS

Criar pelo menos:

```text
Hire Employee
Provisioning Progress
Organization Setup
User Invitations
Connections
Permissions
Supervisor Assignment
Approval Matrix
Branding/Templates
Organization Training
Readiness Check
Pilot
Employee Workspace
Access Review
Suspend/Cancel
Offboarding
```

---

# 147. ACCEPTANCE TESTS

Obrigatórios:

1. subscrição válida cria uma única instance;
2. mesmo Role pode servir múltiplas organizações;
3. mesma organização pode ter múltiplas instances;
4. tenant isolation funciona;
5. invite de utilizadores funciona;
6. SSO/MFA policy funciona;
7. RBAC funciona;
8. ABAC funciona;
9. secrets nunca chegam ao LLM;
10. connection scopes funcionam;
11. read-only default funciona;
12. input bindings funcionam;
13. output routes funcionam;
14. approval matrix funciona;
15. autonomy ceiling respeita certification;
16. Organization Pack carrega;
17. branding/templates funcionam;
18. readiness test funciona;
19. delivery test funciona;
20. audit trace funciona;
21. pilot funciona;
22. activation gate bloqueia instance não pronta;
23. ACTIVE continua governado;
24. metering é idempotente;
25. cancellation bloqueia novas tasks;
26. tokens são revogados;
27. webhooks são desligados;
28. connections são revogadas;
29. scheduled tasks são desligadas;
30. archive preserva audit;
31. reactivation revalida;
32. cross-entity transfer exige processo reforçado;
33. configuration drift é detectado;
34. access review funciona;
35. support access é auditado;
36. high-risk fail closed funciona;
37. voice não aprova R4/R5 sozinho;
38. billing start policy é transparente;
39. duplicate provisioning é bloqueado;
40. orphan access/instances são detectados.

---

# 148. SECURITY TESTS

Testar:

```text
tenant escape
role escalation
permission escalation
session theft
token replay
webhook spoofing
secret exfiltration
connection abuse
approval bypass
cross-entity access
support impersonation abuse
offboarding residual access
```

---

# 149. BUILD GATE

```text
PROVISIONING ENGINE            PASS
TENANT ONBOARDING              PASS
CLIENT ACCESS                  PASS
IAM                            PASS
CONNECTION BINDINGS            PASS
ORGANIZATION PACK              PASS
APPROVAL MATRIX                PASS
ORGANIZATION TRAINING          PASS
READINESS ENGINE               PASS
PILOT ORCHESTRATOR             PASS
ACTIVATION ENGINE              PASS
OFFBOARDING ENGINE             PASS
TENANT ISOLATION               PASS
AUDIT                          PASS
SECURITY                       PASS
```

---

# 150. ORGANIZATION READINESS GATE

```text
ORG IDENTITY          PASS
SUPERVISOR            PASS
CONNECTIONS           PASS
PERMISSIONS           PASS
POLICIES              PASS
APPROVAL MATRIX       PASS
KNOWLEDGE             PASS
TEMPLATES/BRAND       PASS
TRAINING              PASS
TEST TASK             PASS
DELIVERY              PASS
AUDIT                 PASS
```

---

# 151. ACTIVATION GATE

```text
SUBSCRIPTION ACTIVE            PASS
PLATFORM CERTIFICATION         PASS
COMMERCIAL READINESS           PASS
CLIENT ACCESS                  PASS
ORGANIZATION READINESS         PASS
SECURITY                       PASS
```

---

# 152. OFFBOARDING GATE

Antes de `ARCHIVED`:

```text
new tasks stopped
tokens revoked
webhooks disabled
connections revoked
scheduled work disabled
data export handled
retention applied
final billing handled
audit preserved
```

---

# 153. STATUS DE VERDADE

Nunca dizer “Employee entregue” apenas porque existe subscrição.

Mostrar precisamente:

```text
SUBSCRIBED
PROVISIONING
CONFIGURING
READY_FOR_PILOT
ORGANIZATION_READY
ACTIVE
```

---

# 154. CLIENT-VISIBLE STATUS

```text
A preparar
A configurar
A testar
Pronto para piloto
Pronto
Activo
Pausado
Suspenso
Cancelado
```

---

# 155. NO FALSE READY

“Pronto” somente se os gates correspondentes passarem.

---

# 156. NO FALSE ACTIVE

`ACTIVE` apenas se Activation Gate passar.

---

# 157. JOURNEY SIMPLES, BACKEND RIGOROSO

A experiência deve parecer:

```text
CONTRATAR
↓
CONFIGURAR
↓
COMEÇAR A TRABALHAR
```

mas por baixo deve executar IAM, tenant isolation, connectors, permissions, policies, approvals, readiness e audit.

---

# 158. GENERATED FILES

Gerar:

```text
generated/employee_instance_templates_500.json
generated/onboarding_profiles_500.json
generated/access_policy_profiles_500.json
generated/organization_readiness_profiles_500.json
generated/offboarding_profiles_500.json
generated/client_access_channels_500.json

docs/PROVISIONING_ARCHITECTURE.md
docs/CLIENT_ACCESS_MODEL.md
docs/TENANT_ONBOARDING.md
docs/ORGANIZATION_READINESS.md
docs/PILOT_AND_ACTIVATION.md
docs/OFFBOARDING.md
docs/IAM_AND_ACCESS_REVIEW.md
docs/INSTANCE_LIFECYCLE.md
```

---

# 159. 500/500 COVERAGE

Todos os 500 Employees devem possuir um `OnboardingProfile` contendo:

```text
required organization data
required connections
required user roles
required supervisor
required approval policy
required training
required readiness tests
allowed channels
offboarding requirements
```

---

# 160. COVERAGE GATE

```text
ONBOARDING PROFILES           500/500 PASS
ACCESS POLICY PROFILES        500/500 PASS
READINESS PROFILES            500/500 PASS
OFFBOARDING PROFILES          500/500 PASS
```

---

# 161. DEFINITION OF DONE — PROVISIONING

```text
✓ subscription creates instance
✓ no duplicates
✓ tenant binding exists
✓ organization binding exists
✓ plan/entitlements exist
✓ state machine correct
```

---

# 162. DEFINITION OF DONE — CLIENT ACCESS

```text
✓ users invited
✓ identity verified
✓ MFA/SSO applied
✓ RBAC/ABAC applied
✓ channel access scoped
✓ API access scoped
✓ audit works
```

---

# 163. DEFINITION OF DONE — ONBOARDING

```text
✓ organization pack loaded
✓ supervisor assigned
✓ connections configured
✓ permissions configured
✓ policies configured
✓ approval matrix configured
✓ templates/branding configured
✓ organization training completed
✓ readiness test passed
```

---

# 164. DEFINITION OF DONE — ACTIVATION

```text
✓ commercial readiness valid
✓ certification valid
✓ subscription active
✓ organization ready
✓ client access ready
✓ security pass
✓ ACTIVE
```

---

# 165. DEFINITION OF DONE — OFFBOARDING

```text
✓ new tasks stopped
✓ in-flight work handled
✓ tokens revoked
✓ webhooks disabled
✓ credentials revoked
✓ scheduled tasks disabled
✓ data export handled
✓ retention applied
✓ final billing handled
✓ audit preserved
✓ instance archived
```

---

# 166. PRINCÍPIO DE VERDADE

Nunca confundir:

```text
HIRED
!=
PROVISIONED

PROVISIONED
!=
CONFIGURED

CONFIGURED
!=
ORGANIZATION_READY

ORGANIZATION_READY
!=
ACTIVE
```

---

# 167. PRINCÍPIO DE ISOLAMENTO

Cada cliente recebe uma instância privada e governada.

---

# 168. PRINCÍPIO DE ACESSO

O cliente nunca recebe acesso ao Core Runtime, Role Packs proprietários ou dados de outros clientes.

---

# 169. PRINCÍPIO DE SEGURANÇA

Acesso ao Employee deve ser governado como acesso a um sistema empresarial.

---

# 170. PRINCÍPIO FINAL

O sistema deve transformar:

```text
CLIENTE CONTRATA
```

em:

```text
SUBSCRIPTION VALIDATED
↓
PRIVATE EMPLOYEE INSTANCE
↓
TENANT ISOLATED
↓
USERS AUTHORIZED
↓
SYSTEMS CONNECTED
↓
ORGANIZATION CONTEXT LOADED
↓
PERMISSIONS/POLICIES APPLIED
↓
SUPERVISOR/APPROVALS CONFIGURED
↓
ORGANIZATION TRAINING
↓
READINESS TESTED
↓
PILOT VALIDATED
↓
ACTIVE
```

e no fim da relação:

```text
CANCEL
↓
OFFBOARD SAFELY
↓
REVOKE ACCESS
↓
PRESERVE AUDIT
↓
ARCHIVE
```

O resultado esperado é uma jornada simples para o cliente e rigorosa por baixo, permitindo que qualquer um dos 500 AI Employees seja contratado por múltiplas organizações, provisionado como instância própria, acedido por utilizadores autorizados e activado somente quando estiver realmente preparado para trabalhar naquele contexto específico.

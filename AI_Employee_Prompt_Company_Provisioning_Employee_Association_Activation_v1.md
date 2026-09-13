# PROMPT MESTRE — COMPANY PROVISIONING, EMPLOYEE ASSOCIATION & ACTIVATION
## Criação de Empresa, Associação de AI Employee e Activação Operacional Controlada

**Sigla:** CPEAA  
**Versão:** 1.0  
**Âmbito:** AI Employee Platform / Digital Workforce Operating System  
**Compatibilidade:** 48 Áreas Comerciais, 500 Role Packs, DWACOS, OTCTEC, Organization Pack, IRECE, ORDKS  
**Objectivo:** implementar o fluxo completo para criar uma empresa, criar o respectivo tenant, configurar o contexto organizacional, subscrever uma Área, disponibilizar os Employees dessa Área, associar um Employee à empresa através de uma Employee Instance, configurar dados, conexões, permissões, autonomia e supervisão, executar readiness e activar o Employee de forma segura e auditável.

---

# 0. PRINCÍPIO CENTRAL

Nunca duplicar um Role Pack para cada empresa.

Usar:

```text
ROLE PACK CANÓNICO
        ↓
ORGANIZATION / TENANT
        ↓
AREA SUBSCRIPTION
        ↓
ENTITLEMENT
        ↓
EMPLOYEE INSTANCE
        ↓
CONFIGURATION
        ↓
READINESS
        ↓
ACTIVATION GATE
        ↓
ACTIVE
```

---

# 1. VERDADES OBRIGATÓRIAS

```text
EMPRESA CRIADA
!=
TENANT CONFIGURADO
!=
ÁREA SUBSCRITA
!=
EMPLOYEE DISPONÍVEL
!=
EMPLOYEE ASSOCIADO
!=
EMPLOYEE CONFIGURADO
!=
EMPLOYEE READY
!=
EMPLOYEE ACTIVE
```

Também:

```text
ROLE PACK EXISTS
!=
EMPLOYEE INSTANCE EXISTS
```

e:

```text
EMPLOYEE INSTANCE EXISTS
!=
EMPLOYEE SAFE TO EXECUTE
```

---

# 2. OBJECTIVO FUNCIONAL

A plataforma deve permitir:

```text
1. Criar Empresa
2. Criar Tenant
3. Criar Organization Pack
4. Criar Utilizadores e Responsáveis
5. Configurar estrutura organizacional
6. Subscrever Área
7. Gerar entitlements dos Employees dessa Área
8. Mostrar Employees como AVAILABLE
9. Escolher Employee
10. Criar Employee Instance
11. Definir objectivo e escopo
12. Associar dados
13. Associar conexões
14. Associar ferramentas
15. Configurar acções permitidas e proibidas
16. Definir autonomia
17. Definir supervisor
18. Definir reviewer/approver
19. Definir outputs
20. Executar smoke test
21. Executar readiness
22. Executar activation gate
23. Activar
24. Fazer pedidos
25. Monitorizar
26. Pausar
27. Retomar
28. Desactivar
29. Suspender
30. Recertificar quando necessário
```

---

# 3. MULTI-TENANCY

Cada empresa deve possuir:

```text
organization_id
tenant_id
```

O `tenant_id` é a fronteira técnica de isolamento.

Todo acesso tenant-owned deve carregar:

```text
tenant_id
organization_id
```

Hard rule:

```text
tenant A
→ tenant B data
= DENIED
```

---

# 4. ENTITY — ORGANIZATION

Criar:

`Organization`

Campos mínimos:

```text
organization_id
tenant_id
legal_name
trade_name
tax_id
country
currency
locale
timezone
industry
company_size
fiscal_year_start
status
created_at
created_by
updated_at
```

Estados:

```text
DRAFT
CONFIGURING
READY
SUSPENDED
ARCHIVED
```

---

# 5. ENTITY — TENANT

Campos:

```text
tenant_id
organization_id
tenant_key
environment
data_region
security_profile
status
created_at
```

Estados:

```text
PROVISIONING
ACTIVE
SUSPENDED
DECOMMISSIONING
DECOMMISSIONED
```

Ambientes:

```text
DEVELOPMENT
STAGING
SHADOW
PRODUCTION
```

---

# 6. ECRÃ — EMPRESAS

Mostrar:

```text
Nome
NIF
País
Sector
Estado
Áreas contratadas
Employees disponíveis
Employees configurados
Employees activos
Tenant
Última actividade
```

Botões:

```text
[ Nova Empresa ]
[ Abrir Empresa ]
[ Suspender Empresa ]
[ Ver Auditoria ]
```

---

# 7. ECRÃ — NOVA EMPRESA

Campos:

```text
Nome legal *
Nome comercial
NIF *
País *
Moeda *
Idioma *
Fuso horário *
Sector
Dimensão
Início do exercício fiscal
Contacto principal
Email principal
Telefone
Empresa-mãe
```

Validar:

```text
legal_name not empty
tax_id not empty
country valid
currency valid
timezone valid
```

Deduplicação:

```text
same workspace/tenant context
+
same tax_id
→ block duplicate
```

---

# 8. CREATE ORGANIZATION FLOW

```text
Submit company form
↓
Validate user permission
↓
Validate required fields
↓
Check duplicate tax_id
↓
Create Organization
↓
Create Tenant
↓
Create default settings
↓
Create default human roles
↓
Create audit event
↓
Open onboarding
```

A operação deve ser transaccional.

Se Tenant falhar:

```text
rollback
```

ou:

```text
PROVISIONING_FAILED
```

Nunca deixar a empresa num estado ambíguo.

---

# 9. DEFAULT HUMAN ROLES

Criar:

```text
ORG_ADMIN
AREA_OWNER
DIGITAL_WORKFORCE_ADMIN
EMPLOYEE_SUPERVISOR
REVIEWER
APPROVER
AUDITOR
VIEWER
```

Segurança inicial:

```text
DENY BY DEFAULT
```

---

# 10. ORGANIZATION ONBOARDING

Wizard:

```text
1 Identidade
2 Estrutura
3 Utilizadores
4 Políticas
5 Dados
6 Sistemas
7 Áreas
8 Supervisão
9 Revisão
```

---

# 11. ORGANIZATION PACK

Criar:

`OrganizationPack`

Conteúdo:

```text
legal identity
business units
departments
branches
stores
warehouses
factories
cost centers
chart of accounts
bank accounts
customers
suppliers
policies
approval matrix
document templates
systems
integrations
terminology
business calendar
```

Campos:

```text
organization_pack_id
organization_id
version
status
effective_from
created_by
created_at
```

Estados:

```text
DRAFT
VALIDATING
VALID
SUPERSEDED
STALE
```

---

# 12. ORGANIZATION UNITS

Criar:

`OrganizationUnit`

Tipos:

```text
HEADQUARTERS
BRANCH
STORE
WAREHOUSE
FACTORY
CONSTRUCTION_SITE
OFFICE
DEPARTMENT
COST_CENTER
OTHER
```

Campos:

```text
unit_id
organization_id
parent_unit_id
type
name
code
status
```

---

# 13. EMPLOYEE SCOPE

Uma Employee Instance pode ser:

```text
ORGANIZATION_WIDE
UNIT_SCOPED
DEPARTMENT_SCOPED
SITE_SCOPED
PROJECT_SCOPED
RESOURCE_SCOPED
```

---

# 14. ÁREAS COMERCIAIS

Ecrã:

```text
Organization
→ Areas
```

Cada Area Card mostra:

```text
Area Name
Descrição
Problemas
Outcomes
Solution Packs
Employees incluídos
Subscription Status
```

Estados:

```text
NOT_SUBSCRIBED
TRIAL
SUBSCRIBED
SUSPENDED
CANCELLED
EXPIRED
```

Botões:

```text
[ Ver Área ]
[ Subscrever ]
[ Iniciar Trial ]
[ Ver Employees ]
```

---

# 15. SUBSCRIBE AREA FLOW

```text
Choose Area
↓
Show commercial terms
↓
Confirm
↓
Create CommercialAreaSubscription
↓
Create Employee Entitlements
↓
Mark included Role Packs AVAILABLE
↓
Audit
```

Regra:

```text
AREA SUBSCRIBED
→ EMPLOYEES AVAILABLE
```

Não:

```text
AREA SUBSCRIBED
→ EMPLOYEES ACTIVE
```

---

# 16. ENTITY — COMMERCIAL AREA SUBSCRIPTION

Campos:

```text
subscription_id
organization_id
area_id
plan_id
status
start_date
end_date
billing_model
created_at
```

---

# 17. ENTITY — ORGANIZATION EMPLOYEE ENTITLEMENT

Campos:

```text
entitlement_id
organization_id
area_id
rolepack_id
source
status
valid_from
valid_to
```

Estados:

```text
AVAILABLE
RESTRICTED
SUSPENDED
EXPIRED
REVOKED
```

---

# 18. ECRÃ — EMPLOYEES DISPONÍVEIS

Navegação:

```text
Organization
→ Digital Workforce
→ Available Employees
```

Mostrar:

```text
Employee
ID
Area
Purpose
Entitlement
Platform Certification
Current Instance Status
```

Botões:

```text
[ Ver ]
[ Configurar Employee ]
[ Ver Certificação ]
[ Ver Testes ]
```

---

# 19. ASSOCIAR EMPLOYEE À EMPRESA

Ao clicar em:

```text
[ Configurar Employee ]
```

executar:

```text
Check Entitlement
↓
Check RolePack
↓
Create Employee Instance
↓
Set CONFIGURING
↓
Open Employee Setup Wizard
```

---

# 20. ENTITY — EMPLOYEE INSTANCE

Campos:

```text
employee_instance_id
organization_id
tenant_id
rolepack_id
rolepack_version
home_area_id
scope_type
scope_id
display_name
status
pilot_mode
autonomy_level
risk_level
supervisor_user_id
reviewer_user_id
approver_policy_id
organization_pack_version
created_at
created_by
```

---

# 21. ROLE PACK IMMUTABILITY

A Employee Instance deve referenciar:

```text
rolepack_id
rolepack_version
```

Não copiar e editar o Role Pack canónico arbitrariamente.

---

# 22. INSTANCE OVERRIDES PERMITIDOS

Pode configurar:

```text
scope
permissions
connections
autonomy
supervision
organization-specific knowledge
output routes
schedule
```

Não pode:

```text
weakening canonical safety
raising above max autonomy
removing mandatory approval
granting tools not allowed by RolePack
```

---

# 23. EMPLOYEE INSTANCE STATES

```text
AVAILABLE
CONFIGURING
CONFIGURED
READINESS_CHECK
READY
ACTIVATING
ACTIVE
PAUSED
DEGRADED
BLOCKED
SUSPENDED
DEACTIVATED
```

---

# 24. EMPLOYEE SETUP WIZARD

Passos:

```text
1 Objectivo
2 Escopo
3 Dados
4 Conexões
5 Ferramentas
6 Acções
7 Autonomia
8 Supervisor
9 Reviewer / Approver
10 Outputs
11 Smoke Test
12 Readiness
13 Activation
```

---

# 25. STEP 1 — OBJECTIVO

Perguntar:

```text
O que pretende que este Employee faça nesta empresa?
```

Carregar opções de:

```text
RolePack
Solution Pack
Outcome
```

Exemplo #64 Bank Reconciliation:

```text
☑ Reconciliação mensal
☑ Identificar não conciliados
☑ Detectar possíveis duplicações
☑ Preparar proposta de ajustes
☐ Criar lançamentos automaticamente
```

---

# 26. STEP 2 — ESCOPO

Permitir:

```text
Empresa inteira
Filial
Loja
Armazém
Departamento
Projecto
Conta específica
Recurso específico
```

Hard rule:

```text
Employee
→ only assigned scope
```

---

# 27. STEP 3 — DADOS

Exemplo:

```text
☑ Bank Statements
☑ General Ledger
☑ Supporting Documents
☐ Payroll
☐ HR Data
```

Criar:

`EmployeeInstanceDataPermission`

Campos:

```text
permission_id
employee_instance_id
resource_type
resource_id
access_mode
conditions
status
```

Modes:

```text
NONE
READ_METADATA
READ
READ_WRITE
```

---

# 28. STEP 4 — CONEXÕES

Usar Connection Profiles da empresa.

Tipos:

```text
PRIMAVERA_V10
BANK
GOOGLE_DRIVE
SHAREPOINT
EMAIL
EXCEL
SQL
NETWORK_FOLDER
API
SFTP
```

Criar:

`ConnectionProfile`

Campos:

```text
connection_profile_id
organization_id
type
name
mode
credential_reference
scope
status
health
```

Credenciais:

```text
SECRET VAULT
```

Nunca:

```text
PROMPT
```

---

# 29. EMPLOYEE ↔ CONNECTION

Criar:

`EmployeeInstanceConnection`

Campos:

```text
employee_instance_connection_id
employee_instance_id
connection_profile_id
allowed_operations
status
```

Piloto:

```text
READ_ONLY
```

---

# 30. STEP 5 — FERRAMENTAS

Mostrar apenas tools permitidas pelo RolePack.

Criar:

`EmployeeInstanceToolPermission`

Campos:

```text
employee_instance_id
tool_id
allowed
constraints
```

---

# 31. STEP 6 — ACÇÕES

Separar:

```text
CAN_READ
CAN_ANALYZE
CAN_PREPARE
CAN_RECOMMEND
CAN_WRITE
CAN_SEND
CAN_POST
CAN_PAY
CAN_APPROVE
```

Princípio:

```text
TOOL ACCESS
!=
ACTION AUTHORITY
```

---

# 32. STEP 7 — AUTONOMIA

Níveis:

```text
L0 Observe
L1 Analyse
L2 Recommend
L3 Prepare
L4 Execute Limited
L5 Supervised Autonomous
```

Calcular máximo permitido:

```text
min(
    RolePack max,
    Platform certification max,
    Organization policy max,
    Risk policy max
)
```

Primeira activação:

```text
L1 / L2 / L3
```

conforme Employee.

Regra:

```text
PAID PLAN
!=
AUTONOMY
```

---

# 33. STEP 8 — SUPERVISOR

Obrigatório:

```text
Primary Supervisor
Escalation Contact
Backup Supervisor
```

---

# 34. STEP 9 — REVIEWER / APPROVER

Definir:

```text
Reviewer
Approver
Approval Policy
```

Quando aplicável:

```text
AI MAKER
↓
REVIEWER
↓
HUMAN APPROVER
```

Nunca:

```text
SELF-APPROVAL
```

---

# 35. STEP 10 — OUTPUTS

Configurar:

```text
Dashboard
DOCX
PDF
XLSX
PPTX
Internal Notification
Email Draft
Drive
```

Inicialmente:

```text
PREVIEW ONLY
```

para entregas externas.

---

# 36. STEP 11 — SMOKE TEST

Executar:

```text
RolePack loaded
Organization Pack loaded
scope enforced
data access enforced
connection works
tool access correct
forbidden action denied
audit works
```

Resultado:

```text
PASS
FAIL
BLOCKED
```

---

# 37. STEP 12 — READINESS

Criar:

`EmployeeOrganizationReadiness`

Checks:

```text
Entitlement
RolePack
Platform Certification
Organization
Tenant
Organization Pack
Knowledge
Connections
Data Contracts
Permissions
Scope
Supervisor
Reviewer
Approver
Risk Policy
Autonomy
Output Route
Audit
Observability
```

---

# 38. READINESS STATES

```text
READY
READY_WITH_WARNINGS
NEEDS_CONNECTION
NEEDS_DATA
NEEDS_PERMISSION
NEEDS_SUPERVISOR
NEEDS_APPROVER
NEEDS_CONFIGURATION
CERTIFICATION_REQUIRED
BLOCKED
```

---

# 39. READINESS UI

Exemplo:

```text
Entitlement             ✓
RolePack                 ✓
Platform Certification  ✓
Organization Pack        ✓
Primavera                ✓
Bank Read-Only           ✓
Data Contract            ✓
Permissions              ✓
Supervisor               ✓
Approval Policy          ✓
```

Botões:

```text
[ Verificar Prontidão ]
[ Corrigir Pendências ]
[ Revalidar ]
```

---

# 40. ACTIVATION BUTTON

Mostrar:

```text
[ Activar Employee ]
```

apenas quando:

```text
READY
```

ou `READY_WITH_WARNINGS` permitido por policy e sem blockers.

---

# 41. STEP 13 — ACTIVATION CONFIRMATION

Mostrar:

```text
Employee
Company
Area
Scope
Autonomy
Risk
Connections
Datasets
Allowed Actions
Denied Actions
Supervisor
Reviewer
Approver
Outputs
```

Botões:

```text
[ Cancelar ]
[ Activar Employee ]
```

---

# 42. ACTIVATION GATE

Backend revalida:

```text
Entitlement valid?
RolePack active?
Certification valid?
Organization active?
Tenant active?
Organization Pack valid?
Required knowledge current?
Required connectors healthy?
Permissions valid?
Scope valid?
Supervisor active?
Approval policy valid?
Autonomy permitted?
Risk policy passed?
Audit enabled?
Observability enabled?
```

---

# 43. ACTIVATION ALGORITHM

```text
if !entitlement.valid:
    block ENTITLEMENT_INVALID

if !rolepack.active:
    block ROLEPACK_INACTIVE

if !certification.valid:
    block CERTIFICATION_REQUIRED

if !organization.ready:
    block ORGANIZATION_NOT_READY

if !tenant.active:
    block TENANT_INACTIVE

if !connections.required_healthy:
    block CONNECTION_NOT_READY

if !permissions.valid:
    block PERMISSIONS_INVALID

if !supervisor.active:
    block SUPERVISOR_REQUIRED

if autonomy > allowed_autonomy:
    block AUTONOMY_EXCEEDS_POLICY

if critical_knowledge.stale:
    block KNOWLEDGE_STALE

activate()
```

---

# 44. ATOMIC ACTIVATION

Fluxo:

```text
lock instance
↓
revalidate all gates
↓
bind config fingerprint
↓
register runtime instance
↓
enable task intake
↓
enable permitted connections
↓
enable policies
↓
enable observability
↓
enable audit
↓
set ACTIVE
↓
emit activation event
↓
unlock
```

Se falhar:

```text
not ACTIVE
```

Nunca activation parcial.

---

# 45. CONFIG FINGERPRINT

Guardar:

```text
RolePack version
Work Contract version
Organization Pack version
Knowledge versions
Permission version
Connection versions
Autonomy
Risk
Model routing policy
```

---

# 46. AFTER ACTIVATION

Employee aparece em:

```text
Work Request Center
Area Dashboard
Active Workforce
Employee Directory
```

Estado:

```text
ACTIVE
```

---

# 47. ACTIVE EMPLOYEE DETAIL

Mostrar:

```text
Status
Area
Scope
Autonomy
Risk
Supervisor
Connections
Permissions
Tasks
Health
Certification
Last Activity
Cost
Value
```

Botões:

```text
[ Novo Pedido ]
[ Pausar ]
[ Alterar Configuração ]
[ Ver Permissões ]
[ Ver Conexões ]
[ Ver Auditoria ]
[ Ver Saúde ]
[ Desactivar ]
```

---

# 48. WORK REQUEST AFTER ACTIVATION

Cliente apenas diz:

```text
“Reconcilie a conta BFA de Agosto.”
```

Flow:

```text
User Request
↓
Intent Normalization
↓
Resolve Employee Instance
↓
IRECE
↓
Permission Check
↓
Risk Check
↓
Task
↓
Execution
↓
Review
↓
Delivery
```

Cliente não cola system prompt.

---

# 49. INTERNAL PROMPT STACK

```text
Platform Safety
↓
RolePack
↓
Work Contract
↓
Organization Pack
↓
Knowledge
↓
Policies
↓
Task Context
↓
User Request
```

---

# 50. PAUSE

```text
ACTIVE
→ PAUSED
```

Efeito:

```text
no new execution
in-flight according to pause policy
audit continues
```

---

# 51. RESUME

Antes:

```text
revalidate readiness
```

---

# 52. DEACTIVATE

```text
ACTIVE / PAUSED
→ DEACTIVATED
```

Fluxo:

```text
stop new tasks
finish/cancel in-flight by policy
revoke runtime token
disable connection bindings
preserve audit
preserve outputs
close schedules
emit event
```

Não apagar histórico.

---

# 53. SUSPEND

Pode ocorrer por:

```text
security incident
certification expiry
subscription issue
knowledge stale
policy violation
```

---

# 54. MATERIAL CONFIG CHANGES

Exemplos:

```text
higher autonomy
new write connector
new bank scope
new legal entity
new high-risk action
new model
critical knowledge change
```

Podem exigir:

```text
pause
↓
re-readiness
↓
retest
↓
recertification
↓
reactivate
```

---

# 55. DATABASE — ORGANIZATION

Criar:

```text
organizations
tenants
organization_units
organization_users
organization_user_roles
organization_packs
organization_pack_versions
```

---

# 56. DATABASE — COMMERCIAL

Criar/reutilizar:

```text
commercial_areas
commercial_area_subscriptions
organization_employee_entitlements
```

---

# 57. DATABASE — EMPLOYEE INSTANCE

Criar:

```text
employee_instances
employee_instance_versions
employee_instance_scopes
employee_instance_permissions
employee_instance_data_permissions
employee_instance_tool_permissions
employee_instance_action_permissions
employee_instance_connections
employee_instance_supervisors
employee_instance_approval_policies
employee_instance_output_routes
employee_instance_readiness
employee_instance_activation_events
employee_instance_health
```

---

# 58. DATABASE — CONNECTIONS

```text
connection_profiles
connection_profile_versions
connection_health
connection_test_runs
```

---

# 59. DATABASE — GOVERNANCE

```text
decision_right_policies
approval_policies
risk_policies
autonomy_policies
audit_events
```

---

# 60. DATABASE CONSTRAINTS

Required:

```text
employee_instances.rolepack_id → rolepacks.id
```

All tenant-owned rows:

```text
tenant_id
```

Multiple instances of same RolePack may exist if scope differs.

Example:

```text
#64 HQ
#64 Branch A
```

Warn if duplicate:

```text
same organization
same rolepack
same scope
```

---

# 61. API — ORGANIZATIONS

```text
POST /organizations
GET  /organizations
GET  /organizations/{organizationId}
PATCH /organizations/{organizationId}
POST /organizations/{organizationId}/suspend
```

Example request:

```json
{
  "legal_name": "ABC, Lda.",
  "trade_name": "ABC",
  "tax_id": "5000000000",
  "country": "AO",
  "currency": "AOA",
  "locale": "pt-AO",
  "timezone": "Africa/Luanda"
}
```

Response:

```json
{
  "organization_id": "org_...",
  "tenant_id": "tenant_...",
  "status": "CONFIGURING"
}
```

---

# 62. API — ORGANIZATION PACK

```text
GET  /organizations/{orgId}/pack
POST /organizations/{orgId}/pack
POST /organizations/{orgId}/pack/validate
```

---

# 63. API — AREA SUBSCRIPTION

```text
GET  /organizations/{orgId}/areas
POST /organizations/{orgId}/areas/{areaId}/subscribe
POST /organizations/{orgId}/areas/{areaId}/suspend
```

---

# 64. API — EMPLOYEE ENTITLEMENTS

```text
GET /organizations/{orgId}/employee-entitlements
GET /organizations/{orgId}/areas/{areaId}/employees
```

---

# 65. API — CREATE EMPLOYEE INSTANCE

```text
POST /organizations/{orgId}/employee-instances
```

Request:

```json
{
  "rolepack_id": 64,
  "scope_type": "ORGANIZATION_WIDE"
}
```

Response:

```json
{
  "employee_instance_id": "empinst_...",
  "status": "CONFIGURING"
}
```

---

# 66. API — CONFIGURE INSTANCE

```text
PATCH /employee-instances/{id}/scope
PATCH /employee-instances/{id}/permissions
PATCH /employee-instances/{id}/connections
PATCH /employee-instances/{id}/autonomy
PATCH /employee-instances/{id}/supervision
PATCH /employee-instances/{id}/outputs
```

---

# 67. API — READINESS

```text
POST /employee-instances/{id}/readiness/check
GET  /employee-instances/{id}/readiness
```

---

# 68. API — ACTIVATE

```text
POST /employee-instances/{id}/activate
```

Request:

```json
{
  "confirm": true,
  "expected_config_version": 7
}
```

Success:

```json
{
  "employee_instance_id": "empinst_...",
  "status": "ACTIVE",
  "activated_at": "...",
  "config_fingerprint": "..."
}
```

Blocked:

```json
{
  "status": "ACTIVATION_BLOCKED",
  "blockers": [
    "SUPERVISOR_REQUIRED",
    "BANK_CONNECTION_NOT_READY"
  ]
}
```

---

# 69. API — LIFECYCLE

```text
POST /employee-instances/{id}/pause
POST /employee-instances/{id}/resume
POST /employee-instances/{id}/deactivate
GET  /employee-instances/{id}/health
GET  /employee-instances/{id}/audit
```

---

# 70. API — WORK REQUEST

```text
POST /organizations/{orgId}/work-requests
```

---

# 71. EVENTS

Emitir:

```text
EV.organization.created
EV.tenant.created
EV.organization_pack.validated
EV.area.subscribed
EV.entitlement.created
EV.employee_instance.created
EV.employee_instance.configured
EV.employee_instance.readiness.checked
EV.employee_instance.ready
EV.employee_instance.activation.requested
EV.employee_instance.activated
EV.employee_instance.paused
EV.employee_instance.resumed
EV.employee_instance.deactivated
EV.employee_instance.suspended
```

---

# 72. SECURITY — ORGANIZATION CREATION

Only authorized:

```text
PLATFORM_ADMIN
WORKSPACE_OWNER
AUTHORIZED_PARTNER
```

according to deployment.

---

# 73. SECURITY — EMPLOYEE ASSOCIATION

Require:

```text
ORG_ADMIN
or
DIGITAL_WORKFORCE_ADMIN
```

---

# 74. SECURITY — ACTIVATION

May require:

```text
ORG_ADMIN
+
AREA_OWNER
```

High-risk R4/R5 may require:

```text
DUAL APPROVAL
```

---

# 75. LEAST PRIVILEGE

All instance permissions begin:

```text
DENIED
```

Then explicitly grant.

Safe initial pilot:

```text
READ = scoped
ANALYZE = true
PREPARE = true where applicable
RECOMMEND = true
WRITE_EXTERNAL = false
EXECUTE_EXTERNAL = false
APPROVE = false
```

---

# 76. CERTIFICATION BOUNDARY

Employee Instance cannot activate beyond canonical certification.

Possible certification scopes:

```text
READ_ONLY
PREPARE_ONLY
LIMITED_WRITE
```

Instance activation cannot exceed certified scope.

---

# 77. HARD READINESS BLOCKERS

```text
missing entitlement
missing certification
organization suspended
tenant suspended
missing mandatory supervisor
required connection invalid
permissions invalid
critical knowledge stale
security incident
```

---

# 78. SOFT WARNINGS

```text
optional connector missing
recommended dataset absent
optional output route unavailable
```

---

# 79. UI — ACTIVATION BLOCKED

```text
ACTIVAÇÃO BLOQUEADA

✗ Banco não ligado
✗ Supervisor não definido

[ Ligar Banco ]
[ Definir Supervisor ]
```

---

# 80. UI — READY TO ACTIVATE

```text
PRONTO PARA ACTIVAR

Employee: #64 Bank Reconciliation
Empresa: ABC, Lda.
Autonomia: L2
Scope: Organização
Banco: Read-Only
Primavera: Read-Only
Supervisor: Contabilista Sénior
Approver: Finance Manager

[ Activar Employee ]
```

---

# 81. EXEMPLO COMPLETO — CRIAR EMPRESA

Criar:

```text
ABC, Lda.
```

Configuração:

```text
country: Angola
currency: AOA
locale: pt-AO
timezone: Africa/Luanda
```

System:

```text
organization_id: org_abc
tenant_id: tenant_abc
```

---

# 82. EXEMPLO — SUBSCREVER ÁREA

Escolher:

```text
FINANÇAS
```

System cria entitlements.

Employees passam a:

```text
AVAILABLE
```

Exemplo:

```text
Treasury
Bank Reconciliation
Accounts Payable
Accounts Receivable
Collections
Financial Planning
...
```

---

# 83. EXEMPLO — ASSOCIAR #64

Seleccionar:

```text
#64 Bank Reconciliation
```

Criar:

```text
employee_instance_id: emp_abc_64_001
status: CONFIGURING
```

---

# 84. EXEMPLO — CONFIGURAR #64

```text
scope: organization
autonomy: L2
risk: R3
supervisor: Senior Accountant
reviewer: Senior Accountant
approver: Finance Manager
```

Connections:

```text
BFA Statement / Read-Only
Primavera v10 / Read-Only
Finance Drive / Read-Only
```

Data allow:

```text
bank statements
general ledger
supporting documents
```

Data deny:

```text
HR
payroll
unrelated folders
```

Actions allow:

```text
read
match
analyze
identify exception
recommend adjustment
```

Actions deny:

```text
pay
transfer
post journal
delete
approve
```

---

# 85. EXEMPLO — READINESS #64

Expected:

```text
Entitlement             PASS
Certification           PASS
Organization Pack       PASS
Bank Connection         PASS
Primavera               PASS
Data Contracts          PASS
Permissions             PASS
Supervisor              PASS
Approval Policy         PASS
```

Result:

```text
READY
```

---

# 86. EXEMPLO — ACTIVAR #64

User clicks:

```text
[ Activar Employee ]
```

Backend revalidates.

If pass:

```text
ACTIVE
```

---

# 87. EXEMPLO — PRIMEIRO PEDIDO

```text
“Reconcilie a conta BFA de Agosto.
Não faça lançamentos.
Apresente primeiro para revisão.”
```

Recommended initial mode:

```text
SHADOW
```

or:

```text
L2 RECOMMEND
```

---

# 88. TESTS — COMPANY CREATION

```text
create valid company
missing required field
duplicate tax id
tenant creation failure
transaction rollback
audit created
```

---

# 89. TESTS — TENANT ISOLATION

Create:

```text
Company A
Company B
```

Try cross-read.

Expected:

```text
DENIED
AUDITED
```

---

# 90. TESTS — AREA SUBSCRIPTION

Subscribe Finance.

Expected:

```text
Finance entitlements AVAILABLE
Marketing not subscribed
No Employee ACTIVE automatically
```

---

# 91. TESTS — EMPLOYEE ASSOCIATION

Create #64 Instance.

Expected:

```text
canonical RolePack referenced
status CONFIGURING
no RolePack duplication
```

---

# 92. TESTS — SCOPE

Instance scoped Branch A.

Attempt Branch B.

Expected:

```text
DENIED
```

---

# 93. TESTS — CONNECTIONS

Bank read-only.

Attempt payment.

Expected:

```text
DENIED
```

---

# 94. TESTS — AUTONOMY

Set L2.

Attempt L4 action.

Expected:

```text
DENIED
```

---

# 95. TESTS — READINESS

Missing supervisor.

Expected:

```text
NEEDS_SUPERVISOR
```

---

# 96. TESTS — ACTIVATION BLOCKED

Blocker exists.

Expected:

```text
ACTIVATION_BLOCKED
```

---

# 97. TESTS — ACTIVATION SUCCESS

All gates pass.

Expected:

```text
ACTIVE
```

---

# 98. TESTS — PAUSE / DEACTIVATE

Pause:

```text
no new task execution
```

Deactivate:

```text
runtime disabled
history preserved
audit preserved
```

---

# 99. ACCEPTANCE CRITERIA — COMPANY

PASS when:

```text
organization created
tenant created
tenant isolated
default roles created
audit created
onboarding available
```

---

# 100. ACCEPTANCE CRITERIA — AREA

PASS when:

```text
subscription created
entitlements created
Employees AVAILABLE
none ACTIVE automatically
```

---

# 101. ACCEPTANCE CRITERIA — EMPLOYEE ASSOCIATION

PASS when:

```text
Employee Instance created
RolePack reference intact
tenant isolated
scope configurable
status CONFIGURING
```

---

# 102. ACCEPTANCE CRITERIA — CONFIGURATION

PASS when configured:

```text
scope
data
connections
tools
actions
autonomy
supervisor
reviewer
approval
outputs
```

---

# 103. ACCEPTANCE CRITERIA — READINESS

PASS when all mandatory checks valid.

---

# 104. ACCEPTANCE CRITERIA — ACTIVATION

PASS when:

```text
activation atomic
state ACTIVE
runtime registered
task intake enabled
audit created
health monitoring enabled
```

---

# 105. NO-GO — COMPANY

Do not proceed if:

```text
tenant isolation uncertain
organization identity invalid
security config missing
```

---

# 106. NO-GO — EMPLOYEE

Do not activate if:

```text
no entitlement
RolePack inactive
certification invalid
required connector broken
supervisor missing
permissions ambiguous
scope ambiguous
```

---

# 107. NO-GO — ACTIVATION

Never activate if:

```text
cross-tenant leakage
unsafe write permission
autonomy exceeds certified max
mandatory approval absent
critical knowledge stale
open material security incident
```

---

# 108. COMMERCIAL VS OPERATIONAL STATE

Commercial:

```text
NOT_SUBSCRIBED
TRIAL
SUBSCRIBED
SUSPENDED
CANCELLED
```

Operational:

```text
AVAILABLE
CONFIGURING
READY
ACTIVE
PAUSED
DEGRADED
SUSPENDED
DEACTIVATED
```

Keep separate.

---

# 109. UI NAVIGATION

```text
Organizations
└── ABC, Lda.
    ├── Overview
    ├── Structure
    ├── Users
    ├── Areas
    ├── Digital Workforce
    │   ├── Available
    │   ├── Configuring
    │   ├── Ready
    │   ├── Active
    │   └── Paused
    ├── Connections
    ├── Data
    ├── Approvals
    ├── Audit
    └── Settings
```

---

# 110. SIMPLE CLIENT JOURNEY

```text
1 Criar Empresa
2 Escolher Área
3 Escolher Employee
4 Ligar Dados
5 Definir Supervisor
6 Verificar Prontidão
7 Activar
8 Fazer Pedido
```

---

# 111. ADVANCED ADMIN VIEW

Show:

```text
RolePack
Work Contract
Risk
Autonomy
Permissions
Tools
Knowledge
Certification
Version
Config Fingerprint
```

---

# 112. FIRST PILOT RECOMMENDATION

Company:

```text
Accounting Office Test 01
```

Area:

```text
Finanças
```

First safe operational Employee:

```text
#64 Bank Reconciliation
```

or follow full lab sequence:

```text
#261 Document Creator
#286 Spreadsheet Employee
#066 Document Classification
#064 Bank Reconciliation
#073 Management Reporting
```

---

# 113. FIRST CONNECTIONS

Prefer:

```text
File Upload
Excel
Drive Read-Only
Primavera Read-Only
Bank Read-Only
```

Policy:

```text
NO_EXTERNAL_SIDE_EFFECTS
```

---

# 114. OBSERVABILITY

Per Employee:

```text
Status
Tasks
Success
Errors
Approvals
Latency
Cost
Connector Health
Last Incident
```

---

# 115. READINESS RECALCULATION TRIGGERS

```text
connection change
permission change
autonomy change
supervisor change
approval policy change
Organization Pack change
knowledge change
certification change
```

---

# 116. AUTO-PAUSE TRIGGERS

Optional:

```text
certification expired
critical connector lost
critical knowledge stale
security incident
policy violation
```

Do not auto-resume by default.

---

# 117. RECERTIFICATION TRIGGERS

```text
major RolePack change
major model change
new write capability
critical connector change
material incident
```

---

# 118. BILLING PRINCIPLE

Billing may depend on Area/usage.

But:

```text
PAID
!=
AUTHORIZED
```

Safety and permissions remain independent.

---

# 119. ORGANIZATION OFFBOARDING

```text
pause Employees
revoke runtime tokens
revoke connectors
export allowed data
preserve audit per policy
close subscriptions
decommission tenant
```

---

# 120. IMPLEMENTATION ORDER

Build:

```text
1 Organizations
2 Tenants
3 Organization Pack
4 Organization Users/Roles
5 Commercial Area Subscription
6 Employee Entitlements
7 Employee Instance
8 Employee Setup Wizard
9 Connection Binding
10 Data Permission Binding
11 Tool/Action Permission Binding
12 Supervision Binding
13 Readiness Engine
14 Activation Gate
15 Runtime Registration
16 Active Employee Detail
17 Pause/Resume/Deactivate
18 Audit/Health
19 Work Request Integration
```

---

# 121. FINAL ACCEPTANCE GATE

```text
CREATE ORGANIZATION                 PASS
CREATE TENANT                       PASS
TENANT ISOLATION                    PASS
ORGANIZATION PACK                   PASS
AREA SUBSCRIPTION                   PASS
EMPLOYEE ENTITLEMENTS               PASS
EMPLOYEE INSTANCE                   PASS
SCOPE                               PASS
DATA PERMISSIONS                    PASS
CONNECTION BINDINGS                 PASS
TOOL PERMISSIONS                    PASS
ACTION PERMISSIONS                  PASS
AUTONOMY                            PASS
SUPERVISOR                          PASS
APPROVAL POLICY                     PASS
READINESS                           PASS
ACTIVATION GATE                     PASS
ATOMIC ACTIVATION                   PASS
RUNTIME REGISTRATION                PASS
AUDIT                               PASS
HEALTH                              PASS
PAUSE/RESUME                        PASS
DEACTIVATION                        PASS
```

---

# 122. FINAL TRUTH RULES

Never claim:

```text
COMPANY CREATED
=
EMPLOYEE ACTIVE
```

Never claim:

```text
EMPLOYEE INSTANCE CREATED
=
EMPLOYEE CONFIGURED
```

Never claim:

```text
EMPLOYEE CONFIGURED
=
EMPLOYEE READY
```

Never claim:

```text
EMPLOYEE READY
=
EMPLOYEE ACTIVE
```

---

# 123. FINAL PRODUCT FLOW

```text
CRIAR EMPRESA
↓
CRIAR TENANT
↓
CONFIGURAR ORGANIZATION PACK
↓
ESCOLHER ÁREA
↓
SUBSCREVER ÁREA
↓
GERAR ENTITLEMENTS
↓
VER EMPLOYEES DISPONÍVEIS
↓
ESCOLHER EMPLOYEE
↓
CRIAR EMPLOYEE INSTANCE
↓
CONFIGURAR ESCOPO
↓
LIGAR DADOS E CONEXÕES
↓
DEFINIR FERRAMENTAS E ACÇÕES
↓
DEFINIR AUTONOMIA
↓
DEFINIR SUPERVISOR / REVIEWER / APPROVER
↓
EXECUTAR SMOKE TEST
↓
VERIFICAR READINESS
↓
EXECUTAR ACTIVATION GATE
↓
ACTIVAR
↓
FAZER PEDIDO
↓
EXECUTAR
↓
REVER
↓
MONITORIZAR
```

---

# 124. FINAL PRINCIPLE

```text
THE ROLE PACK DEFINES THE JOB.
THE ORGANIZATION DEFINES THE CONTEXT.
THE EMPLOYEE INSTANCE BINDS BOTH.
READINESS PROVES IT CAN OPERATE.
ACTIVATION ALLOWS IT TO WORK.
```

Este é o fluxo a implementar.

# PROMPT MESTRE DE IMPLEMENTAÇÃO
## AI Employee Runtime, Model Binding & Real Task Execution Engine
### “Dar Vida” aos 500 AI Employees da Plataforma AETF-500

---

# 0. OBJECTIVO

Transformar os 500 AI Employees da plataforma de perfis estáticos, catálogos, configurações ou registos administrativos em **agentes operacionais reais**, capazes de:

- receber tarefas de utilizadores autorizados;
- identificar a empresa e tenant correctos;
- carregar o perfil profissional do Employee;
- verificar competências e elegibilidade para a tarefa;
- seleccionar e chamar um modelo de IA real por API;
- utilizar OpenAI, Gemini e Claude como motores cognitivos;
- utilizar conhecimento nativo do modelo e fontes verificadas quando necessário;
- consultar documentos e dados autorizados;
- utilizar ferramentas e conectores permitidos;
- produzir documentos, análises, relatórios e outros outputs;
- solicitar esclarecimentos quando faltarem dados;
- solicitar aprovação humana quando necessário;
- executar tarefas síncronas, assíncronas, remotas e diferidas;
- manter memória operacional controlada;
- registar evidência completa da execução;
- medir custo, qualidade, latência e consumo;
- suportar failover entre provedores;
- impedir execução fictícia, mockada ou simulada em produção.

O objectivo final é que cada AI Employee deixe de ser apenas:

```text
ROLE PROFILE
```

e passe a funcionar como:

```text
ROLE
+
MODEL API
+
COMPETENCIES
+
KNOWLEDGE
+
TOOLS
+
PERMISSIONS
+
MEMORY
+
TASK ENGINE
+
EXECUTION ENGINE
+
AUDIT
=
OPERATIONAL AI EMPLOYEE
```

---

# 1. PRINCÍPIO FUNDAMENTAL

Um Employee só pode ser considerado operacional quando existir prova de que:

```text
EMPLOYEE INSTANCE
↓
TASK
↓
REAL MODEL API CALL
↓
MODEL RESPONSE / TOOL CALL
↓
REAL OUTPUT
↓
AUDIT RECEIPT
```

Não considerar como “Employee vivo” apenas porque:

```text
status = ACTIVE
```

Não considerar como prova suficiente:

- botão na interface;
- resposta hardcoded;
- mock;
- fixture;
- output de demonstração;
- `PASS` escrito manualmente;
- execução simulada;
- receipt sem request real ao provedor;
- score sem raw runtime evidence.

---

# 2. AUDITORIA ANTES DE IMPLEMENTAR

Antes de criar novos componentes, localizar no código existente qualquer implementação equivalente a:

```text
Employee Runtime
Task Engine
Command Engine
Work Order
Agent Runtime
Model Router
Provider Adapter
OpenAI Client
Gemini Client
Claude Client
Tool Executor
Connector Runtime
Knowledge Resolver
Memory Store
Approval Engine
Remote Command
Offline Queue
Deferred Execution
Document Generator
Audit Engine
Billing Meter
Usage Meter
Execution Receipt
```

Reutilizar e integrar o que já existir.

Não duplicar módulos.

Criar novos componentes apenas quando houver lacuna real.

Produzir primeiro:

```text
EXISTING_RUNTIME_COMPONENT_AUDIT
```

com:

```text
component
location
status
reusable
missing
action
```

---

# 3. ARQUITECTURA OPERACIONAL FINAL

Implementar arquitectura equivalente a:

```text
USER
↓
COMPANY / TENANT CONTEXT
↓
TASK ENGINE
↓
AI EMPLOYEE INSTANCE
↓
TASK ELIGIBILITY GATE
↓
EMPLOYEE RUNTIME
↓
MODEL ROUTER
├── OPENAI
├── GEMINI
└── CLAUDE
↓
KNOWLEDGE RESOLVER
↓
TOOL / CONNECTOR EXECUTOR
↓
APPROVAL ENGINE
↓
OUTPUT GENERATOR
↓
RESULT STORE
↓
AUDIT / EVIDENCE
↓
COST / QUALITY METRICS
```

---

# 4. EMPLOYEE INSTANCE

Nunca executar directamente sobre:

```text
EMP-XXX
```

O objecto `EMP-XXX` representa o Employee global do catálogo.

A execução real deve ocorrer numa instância privada:

```text
AEI-XXXXXX
```

ligada a:

```text
company_id
tenant_id
```

Exemplo:

```text
catalog_employee_id = EMP-042
instance_id = AEI-000042
company_id = CMP-486564
tenant_id = TNT-962837
```

---

# 5. LIFECYCLE DO EMPLOYEE

Implementar ou consolidar:

```text
CREATED
↓
PROVISIONING
↓
COMPANY_BOUND
↓
TENANT_BOUND
↓
MODEL_BOUND
↓
KNOWLEDGE_BOUND
↓
TOOLS_BOUND
↓
PERMISSIONS_VALIDATED
↓
COMPETENCY_CHECKED
↓
READINESS_PASSED
↓
RUNTIME_READY
↓
ACTIVE
```

Estados alternativos:

```text
BLOCKED
SUSPENDED
ERROR
OFFBOARDING
DEACTIVATED
```

Regra:

```text
ACTIVE
```

só pode existir quando:

```text
MODEL_CONNECTION = VERIFIED
TASK_ENGINE = READY
PERMISSIONS = VALID
KNOWLEDGE = RESOLVABLE
TOOLS = AVAILABLE
RUNTIME = HEALTHY
```

---

# 6. EXECUTION PROFILE

Cada AI Employee Instance deve possuir:

```text
EMPLOYEE_EXECUTION_PROFILE
```

Campos mínimos:

```text
instance_id
catalog_employee_id
company_id
tenant_id

primary_provider
primary_model
primary_configuration

fallback_provider_1
fallback_model_1

fallback_provider_2
fallback_model_2

routing_mode

reasoning_level
temperature
max_output_tokens

tool_policy
knowledge_policy
memory_policy
approval_policy

capability_baseline_id

status
version
updated_at
```

---

# 7. TRÊS PROVEDORES

A arquitectura deve suportar:

```text
OPENAI
GEMINI
CLAUDE
```

Não hardcode um único provedor.

Criar interface comum:

```text
ModelProviderAdapter
```

com métodos equivalentes a:

```text
sendRequest()
streamResponse()
callTools()
getUsage()
getRequestId()
getLatency()
handleError()
```

---

# 8. PROVIDER ADAPTERS

Implementar ou reutilizar:

```text
OpenAIProviderAdapter
GeminiProviderAdapter
ClaudeProviderAdapter
```

Cada adapter deve traduzir o formato interno da plataforma para o formato específico da API.

O resto da plataforma não deve depender directamente do SDK de um provedor.

---

# 9. MODEL ROUTER

Criar ou consolidar:

```text
MODEL_ROUTER
```

O router deve considerar:

```text
task_type
required_competencies
risk_level
source_criticality
certification_status
provider_health
model_capability_score
context_length
tool_support
latency
cost
company_policy
```

---

# 10. MODOS DE ROUTING

Suportar:

```text
FIXED_MODEL
PRIMARY_WITH_FALLBACK
TASK_AWARE
COST_AWARE
QUALITY_FIRST
BALANCED
```

Por defeito, recomendar:

```text
PRIMARY_WITH_FALLBACK
+
TASK_AWARE
```

---

# 11. NÃO ASSUMIR EQUIVALÊNCIA ENTRE MODELOS

A certificação deve pertencer a:

```text
PROVIDER
+
MODEL
+
CONFIGURATION
+
COMPETENCY
+
TASK_TYPE
```

Não reutilizar automaticamente score de OpenAI em Gemini ou Claude.

---

# 12. INTEGRAÇÃO COM MNCA-500

Integrar com:

```text
Model Native Capability Audit
```

Antes de seleccionar modelo, consultar:

```text
capability_baseline_id
competency_score
critical_failures
knowledge_mode
readiness
```

Exemplo:

```text
BUSINESS_WRITING

OpenAI Model A = CERTIFIED
Gemini Model B = CERTIFIED_WITH_SUPERVISION
Claude Model C = CERTIFIED
```

---

# 13. TASK ENGINE

Toda execução deve começar por uma tarefa formal.

Criar ou reutilizar:

```text
ai_employee_tasks
```

Campos mínimos:

```text
task_id
company_id
tenant_id
instance_id
catalog_employee_id

requester_user_id

title
instruction
task_type

priority
risk_level

status
due_at

input_files
authorized_data_sources

requested_output_formats

created_at
submitted_at
started_at
completed_at

result
error
```

---

# 14. CONTEXTO OBRIGATÓRIO

Nenhuma tarefa pode executar sem:

```text
task_id
instance_id
company_id
tenant_id
```

Bloquear caso falte qualquer um.

---

# 15. TASK ELIGIBILITY GATE

Antes de executar:

```text
TASK
↓
REQUIRED COMPETENCIES
↓
COMPETENCY PASSPORT
↓
MODEL CAPABILITY
↓
SOURCE REQUIREMENTS
↓
PERMISSIONS
↓
TOOLS
↓
SUBSCRIPTION
↓
SECURITY
↓
ELIGIBILITY
```

Resultados possíveis:

```text
TASK_ALLOWED
TASK_ALLOWED_WITH_SUPERVISION
TASK_BLOCKED_NOT_CERTIFIED
TASK_BLOCKED_MISSING_SOURCE
TASK_BLOCKED_PERMISSION
TASK_BLOCKED_TOOL_UNAVAILABLE
TASK_BLOCKED_MODEL_UNAVAILABLE
TASK_BLOCKED_SECURITY
```

---

# 16. EMPLOYEE RUNTIME ENGINE

Criar ou consolidar componente central:

```text
AIEmployeeRuntimeEngine
```

Responsabilidades:

```text
loadEmployeeInstance()
loadExecutionProfile()
loadCompanyContext()
loadTenantContext()
loadCompetencies()
loadKnowledge()
loadPermissions()
loadTools()
loadMemory()
evaluateEligibility()
selectModel()
buildRuntimeContext()
callModel()
executeToolCalls()
requestApprovalIfNeeded()
generateOutput()
storeResult()
writeAuditReceipt()
recordCost()
recordQualityMetrics()
```

---

# 17. SYSTEM PROMPT / ROLE PROFILE

O runtime deve construir uma identidade profissional consistente.

Exemplo conceptual:

```text
You are the AI Employee assigned to this company.

Role:
Contabilista Sénior

Company:
MARVINE, LDA

Jurisdiction:
Angola

Your responsibilities:
...

Your limits:
...

Do not invent facts.
Do not use unauthorized sources.
Ask when information is missing.
Use verified sources for source-critical matters.
Respect company and tenant isolation.
```

Não armazenar segredos no prompt.

---

# 18. CONTEXTO DA EMPRESA

Carregar apenas o necessário:

```text
company_name
company_id
tenant_id
country
sector
department
authorized_users
company policies
templates
approved terminology
```

Aplicar princípio:

```text
MINIMUM NECESSARY CONTEXT
```

---

# 19. KNOWLEDGE RESOLVER

Criar ou consolidar:

```text
KNOWLEDGE_RESOLVER
```

Deve combinar:

```text
MODEL_NATIVE
+
GLOBAL CORE
+
GLOBAL STANDARDS
+
COUNTRY PACK
+
SECTOR PACK
+
CLIENT POLICY PACK
+
TASK CONTEXT
```

---

# 20. MODOS DE CONHECIMENTO

Suportar:

```text
MODEL_NATIVE_SUFFICIENT
MODEL_NATIVE_PLUS_CURATED
SOURCE_CRITICAL
CLIENT_SOURCE_REQUIRED
UNSUPPORTED
```

---

# 21. SOURCE-CRITICAL KNOWLEDGE

Para:

```text
SOURCE_CRITICAL
```

não permitir execução sem fonte validada.

Exemplos:

```text
Fiscalidade
Legislação
BNA
MINSA
Direito laboral
Regulação
```

---

# 22. CLIENT-SPECIFIC KNOWLEDGE

Para:

```text
CLIENT_SOURCE_REQUIRED
```

carregar apenas fontes do tenant correcto.

Exemplo:

```text
templates
policies
procedures
internal manuals
approval rules
```

---

# 23. KNOWLEDGE PROVENANCE

Registar:

```text
knowledge_objects_used
source_ids_used
physical_files_used
source_versions
source_hashes
```

Distinguir:

```text
AVAILABLE KNOWLEDGE
```

de:

```text
KNOWLEDGE ACTUALLY USED
```

---

# 24. TOOL EXECUTOR

Criar ou consolidar:

```text
TOOL_EXECUTOR
```

Ferramentas possíveis:

```text
Document Generator
Excel
Google Drive
OneDrive
Email
WhatsApp
Primavera
Banco
AGT
SQL Server
PostgreSQL
Search
Internal APIs
```

---

# 25. PRINCÍPIO DE FERRAMENTAS

A IA pode:

```text
DECIDE
```

mas a plataforma deve:

```text
AUTHORIZE
+
EXECUTE
```

Nunca permitir que o modelo ultrapasse permissões.

---

# 26. TOOL POLICY

Antes de cada tool call:

```text
check tenant
check company
check instance
check resource
check permission
check risk
check approval requirement
```

---

# 27. EXEMPLO DE TOOL CALL

Pedido:

```text
"Guarde a carta no Google Drive."
```

Fluxo:

```text
MODEL
↓
TOOL REQUEST
↓
PERMISSION CHECK
↓
GOOGLE DRIVE CONNECTOR
↓
RESULT
↓
MODEL CONTINUES
```

---

# 28. CONECTORES PERTENCEM À EMPRESA

Modelo correcto:

```text
COMPANY
↓
COMPANY CONNECTOR
↓
EMPLOYEE INSTANCE PERMISSION
```

Não:

```text
EMPLOYEE GLOBAL
→ CREDENTIAL
```

---

# 29. APPROVAL ENGINE

Criar ou reutilizar:

```text
APPROVAL_ENGINE
```

Operações que podem exigir HITL:

```text
enviar email externo
submeter declaração
efectuar pagamento
eliminar documento
alterar ERP
assinar documento
publicar conteúdo
executar transacção
```

---

# 30. ESTADOS DE APROVAÇÃO

```text
APPROVAL_NOT_REQUIRED
WAITING_APPROVAL
APPROVED
REJECTED
EXPIRED
```

---

# 31. HUMAN-IN-THE-LOOP

Quando necessário:

```text
RUNNING
↓
WAITING_APPROVAL
↓
APPROVED
↓
RUNNING
```

ou:

```text
REJECTED
↓
TASK_STOPPED
```

---

# 32. MEMÓRIA

Criar memória operacional controlada.

Separar:

```text
COMPANY MEMORY
EMPLOYEE MEMORY
TASK MEMORY
USER PREFERENCES
APPROVED DECISIONS
```

---

# 33. ISOLAMENTO DA MEMÓRIA

Nunca misturar:

```text
Tenant A
```

com:

```text
Tenant B
```

Toda memória deve possuir:

```text
company_id
tenant_id
scope
owner
```

---

# 34. O QUE NÃO GUARDAR AUTOMATICAMENTE

Não guardar como memória permanente:

- passwords;
- tokens;
- segredos;
- dados altamente sensíveis sem política;
- outputs temporários;
- inferências não verificadas.

---

# 35. EXECUTION ID

Cada execução real deve possuir:

```text
execution_id
```

Exemplo:

```text
EXEC-TASK-000125-001
```

Retry:

```text
EXEC-TASK-000125-002
```

Nunca sobrescrever execução anterior.

---

# 36. RECEIPT DE EXECUÇÃO REAL

Cada execução deve gerar:

```text
RAW_RUNTIME_RECEIPT
```

com:

```text
execution_id
task_id
instance_id
catalog_employee_id
company_id
tenant_id

provider
model_id
model_version
model_configuration

provider_request_id

started_at
completed_at
latency_ms

input_tokens
cached_input_tokens
output_tokens

tools_requested
tools_executed

knowledge_objects_used
source_ids_used

approvals

output_ids

cost

status
error
```

---

# 37. PROVA DE API REAL

Uma execução só pode ser classificada como:

```text
REAL_API_EXECUTION
```

se existir evidência de chamada real ao provedor.

Idealmente:

```text
provider_request_id
usage metadata
latency
raw provider response metadata
```

---

# 38. PROIBIÇÃO DE MOCK EM PRODUÇÃO

Em ambiente de produção:

```text
MOCK_EXECUTION = false
```

Se mock estiver activo:

```text
ENVIRONMENT = TEST
```

e o resultado deve mostrar claramente:

```text
SIMULATION
```

Nunca:

```text
REAL_EXECUTION
```

---

# 39. FAILOVER

Implementar failover controlado.

Exemplo:

```text
OpenAI
↓ failure
Claude
↓ failure
Gemini
```

Mas apenas se o fallback estiver autorizado e certificado para a competência.

---

# 40. FAILOVER RECEIPT

Registar:

```text
requested_provider
requested_model

fallback_used
fallback_provider
fallback_model

fallback_reason
```

Nunca trocar silenciosamente.

---

# 41. PROVIDER HEALTH

Criar:

```text
PROVIDER_HEALTH_MONITOR
```

Estados:

```text
HEALTHY
DEGRADED
RATE_LIMITED
UNAVAILABLE
AUTH_ERROR
```

---

# 42. RETRIES

Implementar retries apenas para erros adequados:

```text
timeout
rate limit
temporary network failure
```

Não fazer retry automático em:

```text
permission denied
invalid request
blocked task
human rejection
```

---

# 43. IDEMPOTÊNCIA

Toda operação que possa produzir efeito externo deve utilizar:

```text
idempotency_key
```

quando tecnicamente possível.

Evitar:

- emails duplicados;
- documentos duplicados;
- pagamentos duplicados;
- submissões duplicadas.

---

# 44. OUTPUT GENERATOR

Suportar outputs:

```text
TEXT
PDF
DOCX
XLSX
PPTX
CSV
JSON
```

Integrar com Document Generation transversal já existente, se disponível.

---

# 45. DOCUMENT TASK EXAMPLE

Tarefa:

```text
"Faça uma carta da MARVINE ao BAI solicitando TPA."
```

Fluxo:

```text
TASK
↓
AEI
↓
BUSINESS_WRITING CHECK
↓
COMPANY CONTEXT
↓
MARVINE TEMPLATE
↓
MODEL ROUTER
↓
MODEL API
↓
LETTER CONTENT
↓
DOCX/PDF GENERATOR
↓
APPROVAL
↓
OUTPUT
```

---

# 46. REGULATORY TASK EXAMPLE

Tarefa:

```text
"Prepare uma resposta à AGT."
```

Fluxo:

```text
TASK
↓
BUSINESS_WRITING
+
ANGOLA_TAX
+
AGT_CORRESPONDENCE
↓
SOURCE CRITICAL CHECK
↓
VERIFIED LEGAL SOURCES
↓
MODEL API
↓
DRAFT
↓
HITL
↓
OUTPUT
```

---

# 47. TASK STATES

```text
DRAFT
SUBMITTED
VALIDATING
QUEUED
RUNNING
WAITING_USER_INPUT
WAITING_APPROVAL
PAUSED
COMPLETED
FAILED
CANCELLED
BLOCKED
```

---

# 48. PEDIDO DE ESCLARECIMENTO

Se faltarem dados:

```text
WAITING_USER_INPUT
```

O Employee deve perguntar.

Não inventar.

---

# 49. REMOTE COMMAND

Integrar com:

```text
REMOTE COMMAND
OFFLINE QUEUE
DEFERRED EXECUTION
```

Exemplo:

```text
mobile command
↓
task created
↓
local connector offline
↓
QUEUED_OFFLINE
↓
connector online
↓
RUNNING
```

---

# 50. SCHEDULED TASKS

Permitir:

```text
daily
weekly
monthly
specific time
event-triggered
condition-triggered
```

Reutilizar scheduler existente.

---

# 51. EVENT-DRIVEN EMPLOYEES

Permitir execução por eventos autorizados.

Exemplo:

```text
new bank statement
↓
reconciliation task
```

ou:

```text
new invoice
↓
classification task
```

---

# 52. CUSTO

Registar por execução:

```text
provider
model
input_tokens
cached_input_tokens
output_tokens
tool_cost
api_cost
total_ai_cost
```

---

# 53. CUSTO POR EMPLOYEE

Calcular:

```text
AI_COST_PER_EMPLOYEE
TASK_COUNT
AVG_COST_PER_TASK
MONTHLY_AI_COST
```

---

# 54. CUSTO POR EMPRESA

Calcular:

```text
OPENAI_COST
GEMINI_COST
CLAUDE_COST
TOTAL_AI_COST
REVENUE
CONTRIBUTION_MARGIN
```

---

# 55. COST-AWARE ROUTING

Quando autorizado:

```text
low-risk simple task
→ economical certified model

professional normal task
→ mid-tier certified model

complex/high-risk task
→ strongest validated model
```

Não sacrificar requisitos de segurança ou certificação por custo.

---

# 56. CACHING

Separar:

```text
STATIC CONTEXT
```

de:

```text
DYNAMIC TASK CONTEXT
```

Usar mecanismos de cache suportados pelos provedores quando apropriado.

Registar:

```text
cached_input_tokens
```

quando disponível.

---

# 57. OBSERVABILIDADE

Criar métricas:

```text
tasks_created
tasks_completed
tasks_failed

api_calls
api_errors
provider_failovers

average_latency
p95_latency

token_usage
api_cost

tool_calls
approval_requests

cross_tenant_denials
```

---

# 58. QUALITY METRICS

Registar:

```text
task_success_rate
human_correction_rate
critical_error_rate
rework_rate
customer_acceptance
```

---

# 59. PERFORMANCE FEEDBACK LOOP

Após execução:

```text
TASK
↓
OUTCOME
↓
QUALITY REVIEW
↓
CAPABILITY EVIDENCE
↓
MNCA UPDATE
↓
ROUTING IMPROVEMENT
```

---

# 60. COMPETENCY FEEDBACK

Se um Employee falhar repetidamente:

```text
competency_status
→ REVALIDATION_REQUIRED
```

Não continuar a executar silenciosamente.

---

# 61. KNOWLEDGE FEEDBACK

Se falha indicar conhecimento insuficiente:

```text
failure
↓
knowledge gap
↓
knowledge acquisition queue
↓
reinforcement
↓
retest
```

---

# 62. MODEL CAPABILITY FEEDBACK

Se conhecimento estiver correcto mas modelo continuar a falhar:

```text
MODEL_CAPABILITY_GAP
```

Considerar:

```text
stronger model
different provider
supervision
block
```

---

# 63. MULTI-PROVIDER COMPARISON

Guardar resultados por:

```text
provider
model
competency
task_type
```

Permitir comparação:

```text
quality
latency
cost
failure rate
```

---

# 64. ROUTING EXPLAINABILITY

Em cada execução mostrar:

```text
routing_reason
```

Exemplo:

```text
Selected OpenAI Model X because:
- certified for accounting
- lower latency
- within cost policy
- source-critical support available
```

---

# 65. UI — MOTOR DE IA DO EMPLOYEE

Dentro de cada Employee mostrar:

# Motor de IA

```text
Primary Provider:
OpenAI

Primary Model:
...

Fallback 1:
Claude

Fallback 2:
Gemini

Routing Mode:
TASK_AWARE

Model Connection:
CONNECTED

Runtime:
READY

Last API Call:
...

Last Request ID:
...

Latency:
...

Monthly Cost:
...
```

---

# 66. UI — EXECUÇÃO DA TAREFA

Dentro da tarefa mostrar:

```text
Employee:
AEI-...

Provider:
OpenAI / Gemini / Claude

Model:
...

Execution ID:
...

Provider Request ID:
...

Status:
RUNNING / COMPLETED

Tools Used:
...

Knowledge Used:
...

Cost:
...
```

---

# 67. UI — PROVA DE EXECUÇÃO

Adicionar:

```text
[ Ver Evidência ]
```

Mostrar:

```text
task
execution
provider
model
request id
usage
tools
sources
outputs
audit events
```

---

# 68. SECURITY — TENANT ISOLATION

Toda consulta deve incluir:

```text
company_id
tenant_id
instance_id
```

Bloquear:

```text
cross-tenant read
cross-tenant write
cross-tenant memory
cross-tenant connector
cross-tenant knowledge
```

---

# 69. SECURITY — USER AUTHORIZATION

Antes de criar tarefa:

```text
authenticated user
↓
company membership
↓
tenant access
↓
task permission
↓
employee access
```

---

# 70. SECURITY — SECRETS

Nunca enviar para o modelo:

- API keys;
- passwords;
- refresh tokens;
- secrets;
- private credentials;

salvo mecanismo seguro estritamente necessário e suportado.

---

# 71. SECURITY — TOOL EXECUTION

Todos os efeitos externos devem passar pelo backend.

Nunca confiar em tool call apenas porque o modelo pediu.

---

# 72. BACKEND SERVICES

Implementar ou consolidar serviços equivalentes a:

```text
EmployeeRuntimeService
TaskExecutionService
ModelRouterService
ProviderGatewayService
KnowledgeResolverService
ToolExecutionService
ApprovalService
MemoryService
AuditService
UsageMeteringService
CostService
```

---

# 73. DATABASE / PERSISTÊNCIA

Persistir:

```text
employee_instances
execution_profiles
tasks
executions
provider_requests
tool_calls
approvals
memory_entries
knowledge_usage
outputs
audit_events
usage_records
cost_records
```

Reutilizar tabelas existentes sempre que possível.

---

# 74. NÃO DEPENDER DE FRONTEND STATE

Nunca considerar execução válida apenas porque React/UI indica:

```text
ACTIVE
RUNNING
COMPLETED
```

O backend e base de dados devem ser fonte de verdade.

---

# 75. TESTES OBRIGATÓRIOS

## TEST-01 — Employee sem model binding

Esperado:

```text
BLOCKED_MODEL_NOT_BOUND
```

## TEST-02 — Employee com OpenAI ligado

Esperado:

```text
REAL_API_EXECUTION
```

## TEST-03 — Employee com Gemini ligado

Esperado:

```text
REAL_API_EXECUTION
```

## TEST-04 — Employee com Claude ligado

Esperado:

```text
REAL_API_EXECUTION
```

## TEST-05 — Provider indisponível + fallback autorizado

Esperado:

```text
FALLBACK_EXECUTED
```

## TEST-06 — Fallback não certificado

Esperado:

```text
FALLBACK_BLOCKED
```

## TEST-07 — Task sem competência

Esperado:

```text
TASK_BLOCKED_NOT_CERTIFIED
```

## TEST-08 — Source Critical sem fonte

Esperado:

```text
TASK_BLOCKED_MISSING_SOURCE
```

## TEST-09 — Tool sem permissão

Esperado:

```text
TOOL_ACCESS_DENIED
```

## TEST-10 — Tool com permissão

Esperado:

```text
TOOL_EXECUTED
```

## TEST-11 — HITL requerido

Esperado:

```text
WAITING_APPROVAL
```

## TEST-12 — Aprovação concedida

Esperado:

```text
EXECUTION_RESUMED
```

## TEST-13 — Cross-tenant

Esperado:

```text
DENIED_CROSS_TENANT
```

## TEST-14 — Retry

Esperado:

```text
NEW_EXECUTION_ID
```

## TEST-15 — API usage

Esperado:

```text
USAGE_RECORDED
```

## TEST-16 — Custo

Esperado:

```text
COST_RECORDED
```

## TEST-17 — Documento

Esperado:

```text
REAL_OUTPUT_CREATED
```

## TEST-18 — Mock em produção

Esperado:

```text
BLOCKED_MOCK_EXECUTION
```

---

# 76. TESTE REAL COM MARVINE

Usar:

```text
MARVINE, LDA
COMPANY_ID = CMP-486564
TENANT_ID = TNT-962837
```

Seleccionar Employee real.

Tarefa:

```text
"Prepare uma carta simples da MARVINE, LDA ao Banco BAI solicitando uma reunião institucional."
```

Esperado:

```text
TASK_ID real
EXECUTION_ID real
AI Employee Instance real
Provider real
Model real
Provider Request ID real
Output real
Audit real
Cost real
```

---

# 77. TESTE REAL COM DOCUMENTO

Tarefa:

```text
"Prepare a carta em DOCX e PDF usando o template da empresa."
```

Esperado:

```text
MODEL API
↓
CONTENT
↓
DOCUMENT GENERATOR
↓
DOCX
↓
PDF
↓
OUTPUT RECORD
```

---

# 78. TESTE DE SOURCE-CRITICAL

Tarefa:

```text
"Prepare uma carta à AGT citando a legislação aplicável."
```

Esperado:

```text
verified source required
```

Se fonte faltar:

```text
BLOCKED
```

Não inventar legislação.

---

# 79. TESTE DE FALTA DE DADOS

Tarefa com dados insuficientes.

Esperado:

```text
WAITING_USER_INPUT
```

e não invenção.

---

# 80. RAW RUNTIME EVIDENCE

Para cada teste real produzir:

```text
input
task record
employee instance
execution profile
selected provider
selected model
provider request metadata
tool calls
knowledge usage
raw output
final output
database state
audit trail
cost
```

---

# 81. NÃO CONSIDERAR PASS POR AUTO-DECLARAÇÃO

Não aceitar:

```text
PASS
```

sem:

```text
test
execution
evidence
provider metadata
database evidence
```

---

# 82. CRITÉRIOS DE ACEITAÇÃO

A implementação só pode ser considerada concluída quando:

```text
✓ Employee Instance recebe tarefa real
✓ Task Eligibility Gate funciona
✓ Model Router escolhe provider/model
✓ OpenAI pode executar por API
✓ Gemini pode executar por API
✓ Claude pode executar por API
✓ provider request é auditável
✓ knowledge é resolvido
✓ tools são executadas com permissão
✓ HITL funciona
✓ outputs reais são produzidos
✓ memória é isolada
✓ cross-tenant é bloqueado
✓ fallback é registado
✓ custo é medido
✓ uso é medido
✓ runtime receipt é persistido
✓ mock não é confundido com produção
```

---

# 83. STATUS OPERACIONAL FINAL

O Employee só pode apresentar:

```text
OPERATIONAL
```

quando:

```text
INSTANCE = VALID
COMPANY_BINDING = VALID
TENANT_BINDING = VALID
MODEL_BINDING = VERIFIED
PROVIDER_CONNECTION = HEALTHY
TASK_ENGINE = READY
KNOWLEDGE = RESOLVABLE
TOOLS = READY
PERMISSIONS = VALID
READINESS = PASS
RUNTIME = READY
```

---

# 84. DEFINIÇÃO DE “EMPLOYEE VIVO”

Adoptar formalmente:

```text
EMPLOYEE_LIVE = true
```

apenas quando o Employee consegue:

```text
receive task
understand context
call real model
use approved knowledge
use permitted tools
request clarification
request approval
produce output
store result
create audit evidence
```

---

# 85. RESULTADO VISUAL ESPERADO

Dentro do Employee:

```text
AEI-000125
Assistente Administrativo
MARVINE, LDA

Status:
ACTIVE

Runtime:
READY

Model:
OpenAI / ...

Fallback:
Claude / Gemini

Knowledge:
READY

Tools:
READY

Permissions:
VALID

Last Task:
COMPLETED

Last API Execution:
VERIFIED
```

---

# 86. FLUXO FINAL

```text
USER REQUEST
↓
COMPANY / TENANT
↓
TASK
↓
AI EMPLOYEE INSTANCE
↓
ELIGIBILITY
↓
MODEL ROUTER
↓
OPENAI / GEMINI / CLAUDE
↓
KNOWLEDGE
↓
TOOLS
↓
APPROVAL
↓
OUTPUT
↓
AUDIT
↓
COST
↓
FEEDBACK
```

---

# 87. REGRA FINAL

Os 500 AI Employees não são 500 modelos independentes.

Eles são:

```text
500 PROFESSIONAL ROLE PACKS
+
PRIVATE COMPANY INSTANCES
+
SHARED / ROUTED AI MODELS
+
KNOWLEDGE
+
TOOLS
+
GOVERNANCE
```

OpenAI, Gemini e Claude funcionam como motores cognitivos.

O Employee é a camada profissional, empresarial, contextual, operacional e governada que transforma o modelo genérico num trabalhador digital.

---

# 88. OBJECTIVO FINAL DE NEGÓCIO

A implementação deve permitir que um cliente:

1. crie a empresa;
2. contrate um AI Employee;
3. configure-o;
4. active-o;
5. atribua uma tarefa;
6. acompanhe a execução;
7. aprove quando necessário;
8. receba o resultado;
9. veja qual modelo executou;
10. veja as fontes utilizadas;
11. veja ferramentas utilizadas;
12. veja custo e consumo;
13. veja evidência completa.

Nesse momento o AI Employee deixa de ser apenas um catálogo e passa a ser um **trabalhador digital operacional real**.

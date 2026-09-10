# PROMPT MESTRE — 500/500 PRIORITY EMPLOYEE PROGRAM
## Todos os 500 AI Employees prioritários, preparados até READY_FOR_TEST e validados progressivamente

**Versão:** 2.0  
**Âmbito:** AI Employee Platform — catálogo canónico de 500 AI Employees  
**Substitui:** Programa 500/300/200 e respectivas variantes anteriores  
**Regra principal:** `500 TOTAL = 500 PRIORITY = 0 NON_PRIORITY`  
**Objectivo:** eliminar qualquer classificação secundária entre os 500 Employees, preparar todos integralmente e submetê-los progressivamente a testes, Shadow Mode, benchmark humano, certificação e activação.

---

# 0. INSTRUÇÃO PRINCIPAL À IA DE DESENVOLVIMENTO

ACTUE COMO uma equipa sénior composta por:

- Arquitecto Principal de Software;
- Arquitecto de Plataformas de IA;
- Arquitecto de Sistemas Multiagente;
- Engenheiro Backend;
- Engenheiro Frontend;
- Engenheiro Mobile;
- Engenheiro de Dados;
- Engenheiro de Integrações;
- Engenheiro DevOps/SRE;
- Engenheiro de Segurança;
- Engenheiro QA;
- Especialista em MLOps/LLMOps;
- Especialista em Knowledge Systems/RAG;
- Especialista em Workflows;
- Especialista em ERP/CRM/HRIS/WMS/DMS;
- Especialista em Excel e Power Query;
- Especialista em auditoria e compliance;
- Especialistas humanos de domínio para benchmark e certificação.

Implemente formalmente o:

# **500/500 PRIORITY EMPLOYEE PROGRAM**

Todos os Employees com IDs canónicos:

```text
1..500
```

devem possuir:

```text
priority = true
```

Não deve existir qualquer classe:

```text
P2
SECONDARY
NON_PRIORITY
DEFERRED_EMPLOYEE
LOW_PRIORITY_EMPLOYEE
```

como mecanismo de exclusão do programa principal.

---

# 1. DECISÃO ESTRATÉGICA

Substituir:

```text
300 PRIORITY
+
200 READY_FOR_TEST
```

por:

```text
500 PRIORITY
+
0 NON_PRIORITY
```

Todos os 500 Employees devem:

```text
ser preparados
ser compilados
ter knowledge
ter Work Contracts
ter Operational Reality
ter testes definidos
atingir READY_FOR_TEST
entrar no pipeline de validação
receber uma decisão individual
```

A única diferença entre Employees será:

```text
validation_order
validation_wave
current_validation_state
risk level
certification state
organization activation state
```

Nunca a importância estrutural.

---

# 2. OBJECTIVO DE PREPARAÇÃO

Antes de declarar a fase de preparação concluída:

```text
500/500 = STRUCTURALLY_READY
500/500 = READY_FOR_TEST
500/500 = PRIORITY
```

Obrigatório:

```text
NON_PRIORITY = 0
UNASSIGNED = 0
FORGOTTEN = 0
```

---

# 3. ARQUITECTURA DO PROGRAMA

```text
500 CANONICAL EMPLOYEES
        ↓
500 PRIORITY
        ↓
500 STRUCTURALLY PREPARED
        ↓
500 READY_FOR_TEST
        ↓
VALIDATION QUEUE
        ↓
PROGRESSIVE TESTING
        ↓
FAIL / IMPROVE / RETEST
        ↓
SHADOW MODE
        ↓
HUMAN BENCHMARK
        ↓
PLATFORM CERTIFICATION
        ↓
ORGANIZATION CONFIGURATION
        ↓
ORGANIZATION READY
        ↓
ACTIVE
```

---

# 4. NÃO CRIAR NOVA HIERARQUIA DE IMPORTÂNCIA

Não transformar `validation_wave` em prioridade disfarçada.

Exemplo correcto:

```yaml
employee_id: 488
priority: true
validation_wave: 7
validation_order: 326
status: READY_FOR_TEST
```

O Employee continua prioritário.

---

# 5. PRIORITY FIELD

Adicionar ao manifesto canónico:

```yaml
program:
  name: "500/500 Priority Employee Program"
  priority: true
  inclusion_status: INCLUDED
```

para todos os IDs `1..500`.

---

# 6. VALIDATION ORDER

Criar campo:

```text
validation_order
```

Valores:

```text
1..500
```

Cada Employee recebe uma posição única.

---

# 7. VALIDATION WAVES

Criar:

```text
validation_wave
```

Recomendação inicial:

```text
WAVE 1  = 1–50
WAVE 2  = 51–100
WAVE 3  = 101–150
WAVE 4  = 151–200
WAVE 5  = 201–250
WAVE 6  = 251–300
WAVE 7  = 301–350
WAVE 8  = 351–400
WAVE 9  = 401–450
WAVE 10 = 451–500
```

Mas a ordem real deve poder ser reorganizada por:

```text
business value
dependency readiness
test data availability
connector availability
human expert availability
risk
sector coverage
system coverage
document coverage
workflow coverage
```

---

# 8. TODOS DEVEM SER PREPARADOS ANTES DOS TESTES PROFUNDOS

Cada Employee deve possuir:

```text
Role Pack
Work Contract
Activation Contract
Input Contract
Output Contract
Delivery Contract
Handoff Contract
Domain Knowledge Profile
Operational Reality Profile
Department Pack linkage
Process Pack linkage
Industry compatibility
Jurisdiction compatibility
System/Tool mappings
Document/Data Schema mappings
Exception mappings
Case mappings
Control mappings
Permissions
Autonomy
Risk
Approval Policy
KPIs
Acceptance Tests
Security Test Definitions
Readiness Passport
```

---

# 9. PREPARATION GATE

Executar:

```text
ROLE PACKS                 500/500
WORK CONTRACTS             500/500
ACTIVATION CONTRACTS       500/500
INPUT CONTRACTS            500/500
OUTPUT CONTRACTS           500/500
DELIVERY CONTRACTS         500/500
HANDOFF CONTRACTS          500/500
KNOWLEDGE PROFILES         500/500
OPERATIONAL REALITY        500/500
PROCESS MAPPINGS           500/500
SYSTEM MAPPINGS            500/500
EXCEPTION MAPPINGS         500/500
CASE MAPPINGS              500/500
CONTROL MAPPINGS           500/500
TEST DEFINITIONS           500/500
READINESS PASSPORTS        500/500
PRIORITY                   500/500
```

Se qualquer valor for inferior a 500:

```text
PROGRAM_PREPARATION_GATE = FAIL
```

---

# 10. NO-FORGETTING RULE

Implementar:

```text
EXPECTED_IDS = {1..500}
ACTUAL_IDS = registry.ids
```

Obrigatório:

```text
ACTUAL_IDS == EXPECTED_IDS
```

Se:

```text
missing > 0
```

então:

```text
BUILD FAIL
```

---

# 11. NO-NON-PRIORITY RULE

Obrigatório:

```text
FOR employee IN 1..500:
    employee.priority == true
```

Resultado esperado:

```text
PRIORITY_COUNT = 500
NON_PRIORITY_COUNT = 0
```

---

# 12. EMPLOYEE READINESS PASSPORT

Criar para todos:

```yaml
employee_readiness_passport:
  employee_id: 73
  role_key: management_reporting

  program:
    priority: true
    validation_wave: 1
    validation_order: 5

  structural:
    role_pack: PASS
    work_contract: PASS
    activation_contract: PASS
    input_contract: PASS
    output_contract: PASS
    delivery_contract: PASS
    handoff_contract: PASS

  knowledge:
    domain_profile: PASS
    operational_reality: PASS
    department_pack: PASS
    process_packs: PASS
    exception_mapping: PASS
    case_mapping: PASS
    control_mapping: PASS
    system_knowledge: PASS

  governance:
    permissions: PASS
    autonomy: PASS
    risk: PASS
    approval_policy: PASS
    tenant_isolation: PASS

  testing:
    tests_defined: PASS
    functional: PENDING
    e2e: PENDING
    security: PENDING
    shadow: PENDING
    human_benchmark: PENDING

  platform_status: READY_FOR_TEST
  certification_status: NOT_EVALUATED
  organization_status: NOT_CONFIGURED
  production_status: NOT_ACTIVE
```

---

# 13. OFFICIAL STATE MACHINE

```text
REGISTERED
↓
SPECIFIED
↓
IMPLEMENTED
↓
KNOWLEDGE_PREPARED
↓
INTEGRATION_MAPPED
↓
TESTS_DEFINED
↓
STRUCTURALLY_READY
↓
READY_FOR_TEST
↓
IN_VALIDATION_QUEUE
↓
IN_TESTING
↓
FUNCTIONAL_TESTED
↓
E2E_TESTED
↓
SECURITY_VALIDATED
↓
SHADOW_MODE
↓
SHADOW_VALIDATED
↓
HUMAN_BENCHMARKED
↓
PLATFORM_CERTIFIED
↓
ORGANIZATION_CONFIGURING
↓
ORGANIZATION_READY
↓
ACTIVE
```

Alternativos:

```text
NEEDS_IMPROVEMENT
WAITING_DATA
WAITING_CONNECTION
WAITING_EXPERT
WAITING_APPROVAL
BLOCKED
DEGRADED
SUSPENDED
CERTIFICATION_FAILED
DEPRECATED
```

---

# 14. PRIORITY DOES NOT MEAN ACTIVE

Regra:

```text
PRIORITY != READY_FOR_PRODUCTION
PRIORITY != CERTIFIED
PRIORITY != ACTIVE
READY_FOR_TEST != ACTIVE
```

Todos são prioritários, mas cada um deve provar competência.

---

# 15. VALIDATION QUEUE

Criar serviço:

# `Employee Validation Queue`

Funções:

```text
enqueue employee
reorder employee
pause employee validation
resume employee validation
assign reviewer
assign test dataset
assign connector environment
assign benchmark expert
track blockers
track results
```

---

# 16. QUEUE RECORD

```yaml
validation_queue_item:
  employee_id: 66
  priority: true
  validation_order: 1
  wave: 1
  state: READY_FOR_TEST
  assigned_test_suite: document_classification_v1
  assigned_expert_group: accounting
  blockers: []
```

---

# 17. TESTAR UM A UM COM DECISÃO INDIVIDUAL

Cada Employee deve receber uma decisão própria.

Não é permitido:

```text
Wave 1 passed
→ all 50 automatically certified
```

Correcto:

```text
#1  CERTIFIED
#2  NEEDS_IMPROVEMENT
#3  CERTIFIED_L2
#4  SHADOW_RETEST_REQUIRED
...
```

---

# 18. TESTES AUTOMÁTICOS PODEM SER PARALELOS

A frase “testar um a um” significa:

```text
individual accountability
individual evidence
individual certification
```

Não significa que a infraestrutura só pode executar um teste por vez.

Permitir paralelismo controlado para:

```text
schema tests
contract tests
unit tests
knowledge tests
security tests
functional tests
regression tests
```

---

# 19. DEEP VALIDATION PIPELINE

Para cada Employee:

```text
READY_FOR_TEST
↓
Schema Validation
↓
Contract Validation
↓
Knowledge Validation
↓
Synthetic Cases
↓
Golden Cases
↓
Edge Cases
↓
Exception Tests
↓
Permission Tests
↓
Risk Tests
↓
Approval Tests
↓
Connector Tests
↓
Functional Tests
↓
E2E Tests
↓
Security Tests
↓
Controlled Real Data
↓
Shadow Mode
↓
Human Benchmark
↓
Certification Decision
```

---

# 20. TEST CLASSES

Obrigatório suportar:

```text
NORMAL
GOLDEN
EDGE
AMBIGUOUS
NEGATIVE
MISSING_DATA
CONFLICTING_DATA
STALE_DATA
DUPLICATE
ADVERSARIAL
SECURITY
PERMISSION
APPROVAL
FAILURE
RECOVERY
DELIVERY
```

---

# 21. TESTS BY RISK

Base inicial:

```text
R0/R1/R2
→ standard validation

R3
→ enhanced validation

R4
→ expert review + stricter approval tests

R5
→ strong governance + sandbox/shadow + no unsupervised material execution
```

---

# 22. SHADOW MODE

```text
HUMAN PROFESSIONAL
        │
        ├──────────────┐
        │              │
        ▼              ▼
HUMAN RESULT       AI RESULT
        │              │
        └──────┬───────┘
               ▼
           COMPARATOR
               ↓
        HUMAN REVIEW
               ↓
     IMPROVEMENT CANDIDATE
```

---

# 23. HUMAN BENCHMARK

Benchmark por domínio.

Exemplos:

```text
Accounting → accountant
Tax → tax specialist
Legal → lawyer
HR → HR specialist
Banking → banking professional
Insurance → insurance specialist
Construction → qualified engineer
Manufacturing → operations/manufacturing specialist
Mining → mining specialist
Oil & Gas → sector expert
Aviation → aviation operations expert
```

---

# 24. METRICS PER ROLE

Não aplicar um único score global.

Cada Role deve definir:

```text
accuracy
completeness
factuality
process adherence
exception handling
escalation quality
source traceability
human correction rate
cycle time
cost per task
```

e KPIs específicos da função.

---

# 25. IMPROVEMENT LOOP

```text
TEST
↓
FAILURE / WEAKNESS
↓
ROOT CAUSE
↓
IMPROVEMENT CANDIDATE
↓
REVIEW
↓
IMPLEMENT
↓
RECOMPILE
↓
REGRESSION
↓
RETEST
↓
ACCEPT / REJECT
↓
NEW VERSION
```

---

# 26. ROOT CAUSE TAXONOMY

```text
CORE_RUNTIME
ROLE_PACK
WORK_CONTRACT
ACTIVATION
INPUT_CONTRACT
OUTPUT_CONTRACT
KNOWLEDGE
OPERATIONAL_REALITY
PROCESS
CONNECTOR
DATA_QUALITY
MODEL
PROMPT
TOOL
PERMISSION
POLICY
RISK
APPROVAL
DOCUMENT_SERVICE
DELIVERY_ROUTER
MEMORY
UI
INFRASTRUCTURE
OBSERVABILITY
```

---

# 27. IMPROVEMENT SCOPE

Classificar:

```text
GLOBAL
DEPARTMENT
DOMAIN
PROCESS
INDUSTRY
JURISDICTION
SYSTEM
ROLE_SPECIFIC
ORGANIZATION_SPECIFIC
```

---

# 28. GLOBAL IMPROVEMENT

Exemplo:

```text
#66 reveals lineage weakness
↓
fix Lineage Core
↓
impact analysis
↓
affected Employees
↓
recompile
↓
regression
```

---

# 29. DEPARTMENT IMPROVEMENT

Exemplo:

```text
Accounting workflow issue
↓
Accounting Department Pack
↓
recompile Accounting Employees
```

---

# 30. ROLE-SPECIFIC IMPROVEMENT

Exemplo:

```text
#66 confuses receipt types
↓
update #66 Knowledge
↓
update Exception Library
↓
add Golden Cases
↓
retest #66
```

---

# 31. IMPROVEMENTS BENEFIT EMPLOYEES NOT YET TESTED

Obrigatório:

```text
Employee not yet tested
+
shared improvement applies
↓
employee updated
↓
readiness recalculated
↓
future test uses improved version
```

---

# 32. RECOMPILATION ENGINE

Após mudança material:

```text
change detected
↓
dependency graph
↓
affected Employees
↓
recompile
↓
schema validation
↓
regression
↓
readiness recalc
```

---

# 33. NO MANUAL MASS EDITS

Não editar manualmente 500 ficheiros para alterações globais.

Usar:

```text
Shared Core
Department Defaults
Domain Packs
Process Packs
Jurisdiction Packs
System Packs
Role Overrides
Compiler
```

---

# 34. KNOWLEDGE SYSTEM

Todos os 500 devem receber contexto composto por:

```text
Domain Knowledge
Operational Reality
Department Knowledge
Industry Knowledge
Jurisdiction Knowledge
Organization Knowledge
System Knowledge
Process Knowledge
Exceptions
Cases
Controls
Memory
```

---

# 35. KNOWLEDGE PRECEDENCE

```text
Platform Safety
Certified Role Constraints
Applicable Law/Regulation
Organization Policy
Approved SOP
Certified System Documentation
Verified Domain Knowledge
Verified Industry Knowledge
Validated Cases
Operational Memory
General Model Knowledge
```

---

# 36. KNOWLEDGE FRESHNESS

Para conteúdo material:

```text
source
version
effective_date
last_verified_at
status
```

Obrigatório.

---

# 37. KNOWLEDGE CONFLICT

Se fontes discordarem:

```text
KNOWLEDGE_CONFLICT
```

Não escolher silenciosamente.

---

# 38. WORK CONTRACTS

Todos os 500 devem saber:

```text
how work starts
what data is needed
where data comes from
how data is validated
what happens when data is missing
what tools are used
what workflow executes
what output is expected
where output is delivered
when approval is required
when work is complete
```

---

# 39. UNIFIED TASK / COMMAND / EVENT GATEWAY

Suportar:

```text
TEXT
VOICE
FORM
BUTTON
FILE
IMAGE
EMAIL
MESSAGING
API
WEBHOOK
ERP EVENT
CRM EVENT
DATABASE EVENT
SCHEDULE
EMPLOYEE EVENT
IoT
```

---

# 40. ENTERPRISE DATA GATEWAY

Suportar progressivamente:

```text
Primavera
SQL Server
PostgreSQL
Excel
Network Folders
Scanners
Local ERP
Legacy Systems
```

---

# 41. EXCEL / POWER QUERY

Suportar:

```text
XLSX
CSV
Named Tables
OneDrive
SharePoint
Google Drive
Local folders
Email attachments
SFTP
OData
REST feeds
Power Query
```

---

# 42. CONNECTOR STATUS TRUTH

Distinguir:

```text
MANIFEST_EXISTS
IMPLEMENTED
AUTHENTICATED
CONNECTED
TESTED
CERTIFIED
```

---

# 43. DOCUMENTS DEPARTMENT

Manter:

```text
#261–#286
26/26 PRIORITY
```

Mas agora isto deixa de ser excepção, porque:

```text
#1–#500
500/500 PRIORITY
```

---

# 44. DOCUMENT GENERATION

Suportar:

```text
DOCX
PDF
XLSX
PPTX
```

com:

```text
templates
branding
review
approval
versioning
source lineage
delivery receipt
```

---

# 45. EMPLOYEE-TO-EMPLOYEE HANDOFF

Permitir:

```text
Employee A
↓
Work Product
↓
validated handoff
↓
Employee B
```

sempre com:

```text
scope
permissions
lineage
task relation
```

---

# 46. PERMISSIONS

Conhecimento nunca concede permissão.

Regra:

```text
Knowledge != Permission
```

---

# 47. AUTONOMY

Conhecimento nunca aumenta autonomia automaticamente.

```text
Knowledge != Autonomy
```

---

# 48. RISK

Manter:

```text
R0
R1
R2
R3
R4
R5
```

---

# 49. APPROVAL

R4/R5 devem respeitar políticas fortes.

Nunca:

```text
R4/R5 → AP.NONE
```

quando a acção material exige aprovação.

---

# 50. APPROVAL FREEZE

```text
Action A
↓
freeze
↓
hash
↓
approve A
↓
execute exactly A
```

Qualquer alteração invalida a aprovação.

---

# 51. IDEMPOTENCY

Toda acção externa com side effect deve possuir:

```text
idempotency_key
```

---

# 52. AUDIT

Guardar:

```text
task
employee
rolepack
work contract
knowledge snapshot
data snapshot
model configuration
tool calls
permissions
policy
risk
approval
output
delivery
receipt
```

---

# 53. DECISION TRACE

Mostrar:

```text
what happened
what sources were used
what policies were applied
what tools were used
what approval was obtained
```

Sem expor cadeia privada de raciocínio.

---

# 54. SECURITY

Testar:

```text
tenant leak
prompt injection
knowledge poisoning
memory poisoning
tool abuse
connector abuse
webhook spoofing
approval bypass
permission escalation
data exfiltration
cross-employee escalation
audit tampering
```

---

# 55. TENANT ISOLATION

```text
Org A != Org B
```

Testar:

```text
data
knowledge
memory
files
outputs
connections
credentials
events
```

---

# 56. ORGANIZATION READINESS

Depois de Platform Certified:

```text
Platform Certified Employee
+
Organization Pack
+
Connections
+
Permissions
+
Policies
+
Data Bindings
+
Approval Matrix
+
Supervisor
+
Organization Test
=
ORGANIZATION_READY
```

---

# 57. ACTIVE

Employee só pode ser `ACTIVE` se:

```text
PLATFORM_CERTIFIED
AND
ORGANIZATION_READY
AND
activation approved
```

---

# 58. ACTIVE DOES NOT MEAN UNLIMITED

Mesmo `ACTIVE` continua sujeito a:

```text
permissions
risk
autonomy
policy
approvals
tool scopes
tenant scope
knowledge scope
audit
human override
```

---

# 59. GLOBAL KILL SWITCH

Manter:

```text
STOP ALL AI EMPLOYEES
→ PAUSED_GLOBAL
```

---

# 60. PAUSE CONTROLS

Permitir:

```text
Pause Employee
Pause Team
Pause Department
Pause Connector
Pause Capability
Pause Action
```

---

# 61. VALIDATION DASHBOARD

Criar:

```text
Total Employees            500
Priority Employees         500
Non-Priority                 0

Prepared                    X
Ready for Test              X
In Queue                    X
In Testing                  X
Needs Improvement           X
Shadow Mode                 X
Validated                   X
Certified                   X
Organization Ready          X
Active                      X
Blocked                     X
Forgotten                    0
```

---

# 62. TARGET DASHBOARD BEFORE VALIDATION

Meta:

```text
Total Employees            500
Priority Employees         500
Prepared                   500
Ready for Test             500
Non-Priority                 0
Unassigned                   0
Forgotten                    0
```

---

# 63. EMPLOYEE COMPLETENESS REGISTRY

Criar:

```text
employee_id
role_key
department
priority
readiness
validation_order
validation_wave
knowledge_status
integration_status
testing_status
certification_status
organization_status
production_status
blockers
```

---

# 64. VALIDATION HISTORY

Guardar:

```text
validation run
dataset
model
prompt
knowledge
connector
policy
result
reviewer
timestamp
```

---

# 65. CERTIFICATION STATES

```text
NOT_EVALUATED
EVALUATING
CONDITIONAL
CERTIFIED
NEEDS_IMPROVEMENT
FAILED
SUSPENDED
EXPIRED
REVALIDATION_REQUIRED
```

---

# 66. CERTIFICATION BY AUTONOMY

Permitir:

```text
CERTIFIED_L1
CERTIFIED_L2
CERTIFIED_L3
CERTIFIED_L4
CERTIFIED_L5
```

---

# 67. CERTIFICATION FINGERPRINT

Guardar:

```text
rolepack_version
work_contract_version
knowledge_versions
process_versions
policy_version
model_configuration
prompt_version
connector_versions
tool_versions
test_suite
datasets
```

---

# 68. CHANGE INVALIDATION

Mudança material pode causar:

```text
CERTIFIED
↓
REVALIDATION_REQUIRED
```

---

# 69. REGRESSION TESTING

Após mudança:

```text
affected Employees
↓
affected tests
↓
regression
↓
block if critical regression
```

---

# 70. ERROR BUDGET / PERFORMANCE

Medir por Employee:

```text
task_success_rate
cycle_time
human_intervention_rate
escalation_rate
tool_failure_rate
connector_failure_rate
knowledge_gap_rate
data_quality_failure_rate
delivery_failure_rate
cost_per_task
```

---

# 71. COST CONTROL

Medir custo por:

```text
Employee
Department
Organization
Task Type
Model
Tool
Connector
Document
Channel
```

---

# 72. MODEL ROUTING

Não hardcodear modelo.

```text
Task Requirements
↓
Model Gateway
↓
provider/model selection
```

---

# 73. DETERMINISTIC FIRST

Regra:

```text
deterministic software when sufficient
AI when reasoning/semantic capability is needed
```

---

# 74. REALITY OF WORK

Cada Employee deve saber:

```text
what documents appear
what systems are used
what errors happen
what exceptions occur
what controls apply
what professionals check
when to stop
when to ask
when to escalate
```

---

# 75. ORGANIZATION ONBOARDING

```text
Organization
↓
Industry
↓
Jurisdiction
↓
Systems
↓
Data
↓
Policies
↓
SOPs
↓
Templates
↓
Approval Matrix
↓
Employees
↓
Organization Test
↓
ORGANIZATION_READY
```

---

# 76. ORGANIZATION WORK BINDING

Criar:

```yaml
employee_work_binding:
  organization_id: org_001
  employee_id: 73
  priority: true
  platform_certification: CERTIFIED_L3
  jurisdiction: AO
  industry: retail
  connections: []
  input_bindings: []
  output_routes: []
  supervisor: CFO
  configured_autonomy: L3
```

---

# 77. ORGANIZATION TEST

Antes de `ORGANIZATION_READY`:

```text
connections healthy
permissions verified
data mappings valid
policies active
knowledge current
approval matrix valid
supervisor assigned
test task passed
delivery route passed
audit trace passed
```

---

# 78. VALIDATION ORDER CAN CHANGE

Permitir reordenar sem alterar:

```text
priority = true
```

Exemplo:

```text
validation_order 300 → 25
```

é permitido.

---

# 79. REASON FOR REORDER

Guardar:

```text
business demand
dependency
risk
client pilot
connector readiness
expert availability
strategic test coverage
```

---

# 80. NEVER DROP AN EMPLOYEE

Se Employee ficar bloqueado:

```text
BLOCKED
```

não removê-lo da queue.

---

# 81. BLOCKER MANAGEMENT

Cada bloqueio deve possuir:

```text
blocker_id
employee_id
category
severity
owner
opened_at
next_action
status
```

---

# 82. NEEDS IMPROVEMENT

Employee falhar teste:

```text
NEEDS_IMPROVEMENT
```

não:

```text
REMOVED
```

---

# 83. ITERATIVE RETEST

```text
NEEDS_IMPROVEMENT
↓
fix
↓
regression
↓
retest
↓
new decision
```

---

# 84. VALIDATION COVERAGE

Dashboard por:

```text
Department
Risk
Archetype
Industry
Jurisdiction
System
Connector
Document Type
Workflow Type
```

---

# 85. REPRESENTATIVE WAVES

Ao montar waves, evitar:

```text
50 Employees quase idênticos
```

Preferir cobertura variada:

```text
documents
finance
operations
customer-facing
regulated
event-driven
data-heavy
sector-specific
```

---

# 86. WAVE COMPLETION

Wave não precisa de 100% certificação para avançar.

Precisa:

```text
critical platform blockers resolved
shared architecture stable
security gates pass
known failures classified
```

---

# 87. PARALLEL PIPELINE

Permitir:

```text
Wave 1 → Shadow
Wave 2 → E2E
Wave 3 → Functional
Wave 4 → Knowledge Validation
Wave 5 → Ready
```

---

# 88. CONTINUOUS LEARNING GOVERNANCE

Não aprender globalmente com uma correcção isolada.

```text
correction
↓
learning candidate
↓
review
↓
evaluation
↓
approval
↓
version
```

---

# 89. KNOWLEDGE SNAPSHOT

Tasks materiais devem congelar:

```text
role version
work contract version
knowledge versions
policy version
```

---

# 90. HISTORICAL REPRODUCIBILITY

Deve ser possível responder:

```text
what version of Employee executed?
what knowledge did it use?
what model?
what connector?
what data snapshot?
what approval?
```

---

# 91. DATABASE ENTITIES

Criar/adaptar:

```text
employee_priority_assignments
employee_validation_queue
employee_validation_waves
employee_readiness_passports
employee_validation_runs
employee_test_results
employee_shadow_runs
employee_shadow_comparisons
employee_human_benchmarks
employee_certifications
employee_certification_versions
employee_improvement_candidates
employee_improvement_impacts
employee_regression_runs
employee_blockers
organization_employee_bindings
organization_readiness_checks
employee_activation_events
```

---

# 92. APIS

```text
GET  /employee-program
GET  /employee-program/priority
GET  /employee-program/validation-queue
GET  /employee-program/waves

POST /employee-program/reorder
POST /employee-program/recompile
POST /employee-program/regress

GET  /employees/{id}/readiness
POST /employees/{id}/validate
POST /employees/{id}/shadow
POST /employees/{id}/benchmark
POST /employees/{id}/certify

POST /organizations/{orgId}/employees/{id}/configure
POST /organizations/{orgId}/employees/{id}/readiness-check
POST /organizations/{orgId}/employees/{id}/activate
POST /organizations/{orgId}/employees/{id}/pause
```

---

# 93. GENERATED MANIFEST

Gerar:

```json
{
  "program": "500/500 Priority Employee Program",
  "version": "2.0",
  "total_employees": 500,
  "priority_employees": 500,
  "non_priority_employees": 0,
  "unassigned": 0,
  "expected_ids": "1..500",
  "priority_rule": "all"
}
```

---

# 94. GENERATED FILES

Gerar:

```text
generated/priority_manifest_500_v2.json
generated/employee_validation_queue_500.json
generated/employee_validation_waves_10x50.json
generated/employee_readiness_passports_500.json
generated/employee_readiness_matrix_500.csv
generated/employee_validation_matrix_500.json
generated/employee_certification_manifest.json

schemas/employee-priority.schema.json
schemas/validation-queue-item.schema.json
schemas/employee-readiness-passport.schema.json
schemas/employee-certification.schema.json
schemas/organization-employee-binding.schema.json
schemas/shadow-comparison.schema.json
schemas/human-benchmark.schema.json

db/migrations/...
db/seeds/...

packages/readiness-engine/
packages/validation-queue/
packages/validation-engine/
packages/shadow-engine/
packages/benchmark-engine/
packages/certification-engine/
packages/improvement-engine/
packages/regression-engine/
packages/organization-readiness/

tests/program-500-priority/
tests/readiness/
tests/validation/
tests/shadow/
tests/certification/
tests/security/
tests/regression/

docs/PROGRAM_500_PRIORITY.md
docs/500_READY_FOR_TEST_REPORT.md
docs/VALIDATION_QUEUE_500.md
docs/VALIDATION_WAVES.md
docs/CERTIFICATION_FRAMEWORK.md
docs/ORGANIZATION_ACTIVATION_GUIDE.md
```

---

# 95. BUILD GATE

Resultado obrigatório:

```text
CATALOG                     500/500 PASS
PRIORITY                    500/500 PASS
NON_PRIORITY                0 PASS
UNASSIGNED                  0 PASS
DUPLICATES                  0 PASS

ROLE PACKS                  500/500 PASS
WORK CONTRACTS              500/500 PASS
ACTIVATION CONTRACTS        500/500 PASS
INPUT CONTRACTS             500/500 PASS
OUTPUT CONTRACTS            500/500 PASS
DELIVERY CONTRACTS          500/500 PASS
HANDOFF CONTRACTS           500/500 PASS
KNOWLEDGE PROFILES          500/500 PASS
OPERATIONAL REALITY         500/500 PASS
TEST DEFINITIONS            500/500 PASS
READINESS PASSPORTS         500/500 PASS

PROGRAM_PREPARATION_GATE    PASS
```

---

# 96. FAILURE RULE

Se:

```text
PRIORITY_COUNT < 500
```

resultado:

```text
BUILD FAIL
```

Se:

```text
NON_PRIORITY_COUNT > 0
```

resultado:

```text
BUILD FAIL
```

Se:

```text
UNASSIGNED > 0
```

resultado:

```text
BUILD FAIL
```

---

# 97. READY_FOR_TEST GATE

Objectivo:

```text
READY_FOR_TEST = 500/500
```

Este é o marco para iniciar formalmente a campanha de validação.

---

# 98. VALIDATION START GATE

Só iniciar validação operacional profunda quando:

```text
CATALOG = 500
PRIORITY = 500
READY_FOR_TEST = 500
UNASSIGNED = 0
```

---

# 99. CERTIFICATION IS INDIVIDUAL

Mesmo com 500 prioritários:

```text
Employee #1  → CERTIFIED
Employee #2  → NEEDS_IMPROVEMENT
Employee #3  → CONDITIONAL
...
```

Nunca forçar resultado uniforme.

---

# 100. ORGANIZATION ACTIVATION IS INDIVIDUAL

Um Employee pode estar:

```text
PLATFORM_CERTIFIED
```

mas não:

```text
ORGANIZATION_READY
```

até ser configurado para uma empresa específica.

---

# 101. PRODUCTION ACTIVATION

Só activar:

```text
PLATFORM_CERTIFIED
+
ORGANIZATION_READY
+
VALID APPROVAL/POLICY
```

---

# 102. PROGRAM DASHBOARD

Exemplo:

```text
500/500 PRIORITY EMPLOYEE PROGRAM
────────────────────────────────────

Total Employees                500
Priority                       500
Non-Priority                     0
Prepared                       500
Ready for Test                 500

Not Yet Tested                 340
In Testing                      52
Needs Improvement               18
Shadow Mode                     31
Validated                       25
Certified                       20
Organization Ready              10
Active                           8

Unassigned                       0
Forgotten                        0
```

Os números de progresso são sempre reais, nunca inventados.

---

# 103. RELEASE READINESS

No-Go para Employee quando:

```text
critical test failed
cross-tenant leak
approval bypass
permission escalation
untraceable material output
critical stale knowledge
connector uncertainty
human benchmark failure
security failure
```

---

# 104. GLOBAL RELEASE TRUTH

A plataforma pode dizer:

```text
500 Employees prepared
500 Employees priority
500 Employees ready for test
```

somente se os gates correspondentes realmente passarem.

Não dizer:

```text
500 Employees certified
```

antes disso ser verdade.

---

# 105. DEFINITION OF DONE — PROGRAM CONVERSION

A conversão do programa anterior só está concluída quando:

```text
✓ Programa 500/300/200 marcado como superseded
✓ P1/P2 removidos da lógica activa
✓ 500 Employees priority=true
✓ 0 Employees non-priority
✓ 500 readiness passports actualizados
✓ 500 validation queue entries criadas
✓ validation_order único para 1..500
✓ validation_wave atribuída
✓ dashboard actualizado
✓ build gates actualizados
✓ documentação actualizada
✓ regression executada
```

---

# 106. DEFINITION OF DONE — PREPARATION

```text
500/500 STRUCTURALLY_READY
500/500 READY_FOR_TEST
500/500 PRIORITY
```

---

# 107. DEFINITION OF DONE — EACH EMPLOYEE

Cada Employee só termina o seu ciclo quando recebe uma decisão:

```text
CERTIFIED
CONDITIONAL
NEEDS_IMPROVEMENT
FAILED
SUSPENDED
```

e, se aplicável:

```text
ORGANIZATION_READY
ACTIVE
```

---

# 108. PRINCÍPIO DE VERDADE

Nunca confundir:

```text
PRIORITY
```

com:

```text
CERTIFIED
```

Nunca confundir:

```text
READY_FOR_TEST
```

com:

```text
ACTIVE
```

Nunca confundir:

```text
PROMPT EXISTS
```

com:

```text
EMPLOYEE WORKS
```

---

# 109. PRINCÍPIO DE NÃO ESQUECIMENTO

O programa deve conseguir responder permanentemente:

```text
Where is Employee #1?
Where is Employee #2?
...
Where is Employee #500?
```

Cada um deve ter:

```text
priority
readiness
validation order
validation state
blockers
certification
organization state
production state
```

---

# 110. PRINCÍPIO FINAL

A política oficial passa a ser:

```text
500 PREPARED
+
500 PRIORITY
+
500 READY_FOR_TEST
+
500 INDIVIDUAL VALIDATION DECISIONS
=
ZERO FORGOTTEN EMPLOYEES
```

O objectivo é construir uma verdadeira força de trabalho digital em que:

```text
todos entram no programa,
todos são preparados,
todos são testados,
todos são medidos,
todos podem ser melhorados,
todos recebem uma decisão individual,
nenhum é relegado para uma classe secundária.
```

---

# 111. RESULTADO ESPERADO

Depois da implementação desta versão:

```text
TOTAL EMPLOYEES        500
PRIORITY               500
NON-PRIORITY             0
READY_FOR_TEST TARGET   500
VALIDATION QUEUE        500
FORGOTTEN                0
```

A partir desse ponto:

```text
TEST
→ MEASURE
→ IMPROVE
→ RECOMPILE
→ REGRESS
→ SHADOW
→ BENCHMARK
→ CERTIFY
→ ORGANIZATION READY
→ ACTIVE
```

de forma progressiva até os 500 terem sido individualmente avaliados.

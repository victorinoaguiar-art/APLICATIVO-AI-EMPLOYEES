# PROMPT MESTRE DE CORRECÇÃO
## AETF-500 — Eliminar Formulários Genéricos de Execução, Classificar Todas as Acções e Associar Cada Botão ao Comportamento Correcto
### Correcção transversal da UX: filtros, navegação, formulários, tarefas, aprovações, acções destrutivas e comandos operacionais

---

# 0. PAPEL DA IA DE DESENVOLVIMENTO

ACTUE COMO uma equipa sénior composta por:

- Arquitecto Principal de Software;
- Product Designer sénior;
- UX Architect;
- UX Researcher B2B;
- Engenheiro Frontend;
- Engenheiro Backend;
- Arquitecto SaaS multi-tenant;
- Engenheiro de Segurança;
- Especialista em Human-in-the-Loop;
- Especialista em Task Engines;
- Especialista em Workflow Engines;
- Especialista em Audit & Evidence;
- Engenheiro QA/Test Automation.

A missão é corrigir um problema sistémico da interface da **AI Employee Platform / AETF-500**:

> **A maior parte dos botões está a abrir o mesmo “Formulário de Execução”, mesmo quando a acção é apenas um filtro, uma navegação, um retomar, um abrir, um ver detalhe, um ordenar ou uma simples operação de interface.**

Isto está errado e deve ser corrigido transversalmente.

---

# 1. PROBLEMA OBSERVADO

Actualmente acções diferentes estão a abrir um modal genérico semelhante a:

```text
Formulário de Execução: <Acção>

Módulo: WF-01 / WF-02 / ...
Ecrã: ...

Título / Identificador da Acção
Empresa / Tenant Alvo
Prioridade de Execução
Instruções Adicionais & SOP

Auditável em ledger imutável...

[ Cancelar ]
[ Executar <Acção> ]
```

Exemplos incorrectos observados:

```text
Filtrar por Área
Retomar
```

abrindo esse mesmo formulário genérico.

Isto gera:

- excesso de cliques;
- campos que não fazem sentido;
- exposição de termos técnicos;
- confusão entre UI action e operational task;
- criação desnecessária de task/workflow;
- possibilidade de gerar audit/ledger indevido;
- UX pesada;
- sensação de produto inacabado;
- uso incorrecto de tenant, prioridade, SOP e execução.

---

# 2. DECISÃO PRINCIPAL

É PROIBIDO usar um único formulário genérico para todos os botões.

Adoptar:

```text
BUTTON
↓
ACTION CLASSIFICATION
↓
CORRECT HANDLER
```

Cada botão deve ser classificado antes de executar qualquer comportamento.

---

# 3. ACTION TAXONOMY OBRIGATÓRIA

Criar enum/registry:

```text
ActionType
```

com pelo menos:

```text
UI_FILTER
UI_SEARCH
UI_SORT
UI_TOGGLE
UI_TAB
NAVIGATION
OPEN_MODAL
OPEN_DRAWER
OPEN_WIZARD
CRUD_CREATE
CRUD_EDIT
CRUD_DELETE
STATE_CHANGE
OPERATIONAL_TASK
EXTERNAL_ACTION
APPROVAL
DESTRUCTIVE_ACTION
SYSTEM_CONTROL
DOWNLOAD
UPLOAD
EXPORT
IMPORT
RETRY
RESUME
PAUSE
CANCEL
```

---

# 4. REGRA CENTRAL

Nenhum botão deve abrir `GenericExecutionForm` ou equivalente apenas porque é clicável.

O comportamento deve depender de:

```text
action_type
```

e não de:

```text
button exists
```

---

# 5. MATRIZ DE COMPORTAMENTO POR ACTION TYPE

## UI_FILTER

Exemplos:

```text
Filtrar por Área
Filtrar por Departamento
Filtrar por Estado
Mostrar Activos
Mostrar Concluídos
```

Comportamento:

```text
update UI state
apply query params
filter dataset
```

Não deve:

```text
criar task
abrir execution form
pedir tenant
pedir prioridade
pedir SOP
gerar receipt operacional
```

---

# 6. UI_SEARCH

Exemplos:

```text
Pesquisar Employee
Pesquisar Empresa
Pesquisar Fonte
Pesquisar Tarefa
```

Comportamento:

```text
input
↓
debounce
↓
filter/query
↓
update results
```

Nunca abrir formulário.

---

# 7. UI_SORT

Exemplos:

```text
Ordenar por Nome
Ordenar por Estado
Ordenar por Data
Ordenar por Custo
```

Apenas:

```text
change sort
```

---

# 8. UI_TAB

Exemplos:

```text
Todas
Activas
Configuração
Suspensas
Resumo
Histórico
```

Apenas trocar conteúdo/tab.

Nunca:

```text
task
workflow
modal
```

---

# 9. NAVIGATION

Exemplos:

```text
Abrir Employee
Ver Empresa
Ver Resultado
Ver Histórico
Abrir Fonte
Abrir Tarefa
```

Comportamento:

```text
router.push(...)
```

ou:

```text
open detail drawer
```

Nunca abrir formulário genérico.

---

# 10. OPEN_MODAL / OPEN_DRAWER / OPEN_WIZARD

Usar apenas quando há dados a preencher ou decisão humana.

Exemplos:

```text
Criar Empresa
Convidar Utilizador
Contratar Employee
Configurar
Adicionar Conhecimento
Ligar Integração
Agendar
Editar Permissões
```

Cada um deve abrir **o formulário específico correspondente**.

---

# 11. CRUD_CREATE

Exemplos:

```text
Criar Empresa
Criar Equipa
Criar Utilizador
Criar Política
Criar Fonte
```

Fluxo:

```text
open specific form
↓
validate
↓
submit backend
↓
success/error
```

---

# 12. CRUD_EDIT

Exemplos:

```text
Editar Empresa
Editar Perfil
Editar Configuração
Editar Fonte
```

Abrir formulário com dados existentes.

Nunca usar formulário genérico de execução.

---

# 13. STATE_CHANGE

Exemplos:

```text
Retomar
Pausar
Activar
Desactivar
Arquivar
Reabrir
```

Estas acções normalmente não precisam de formulário completo.

Usar:

```text
confirmation modal
```

ou execução directa quando segura.

---

# 14. CORRECÇÃO ESPECÍFICA — RETOMAR

A acção:

```text
Retomar
```

NÃO deve abrir:

```text
Título / Identificador
Empresa / Tenant
Prioridade
SOP
Ledger
```

Deve abrir no máximo:

```text
Retomar AI Employee?

Employee:
Contabilista Sénior

Estado actual:
Pausado

Tarefas pendentes:
3

[ Cancelar ]
[ Retomar ]
```

Ou, se for operação segura e reversível:

```text
click
↓
backend resume
↓
toast success/error
```

---

# 15. CORRECÇÃO ESPECÍFICA — PAUSAR

Pausar pode exigir:

```text
Motivo *
Duração opcional
Preservar fila?
Cancelar tarefas em execução?
```

Não deve pedir:

```text
prioridade
SOP
título da acção
```

---

# 16. RESUME / RETRY / REPROCESS

Mapear:

```text
Retomar
→ RESUME

Tentar Novamente
→ RETRY

Reprocessar
→ RETRY / OPERATIONAL_TASK
```

Cada um com UX própria.

---

# 17. OPERATIONAL_TASK

Só aqui faz sentido usar:

```text
task_id
Employee
priority
due date
inputs
output
knowledge
approval
runtime
audit
```

Exemplos:

```text
Reconciliar Banco
Gerar Relatório
Preparar Declaração
Classificar Documentos
Criar Documento
Executar Análise
```

Mesmo nestes casos, preferir iniciar pelo:

```text
Chatbox
```

ou Task Form específico.

---

# 18. EXTERNAL_ACTION

Exemplos:

```text
Enviar Email
Enviar WhatsApp
Publicar Post
Submeter Documento
Executar Pagamento
```

Devem possuir:

```text
recipient
channel
content/output
risk
approval
```

e confirmação específica.

Não usar formulário genérico.

---

# 19. APPROVAL

Exemplos:

```text
Aprovar
Rejeitar
Modificar
```

Abrir card/modal específico:

```text
Acção
Impacto
Risco
Snapshot
Evidência
Comentário

[ Aprovar ]
[ Modificar ]
[ Rejeitar ]
```

---

# 20. DESTRUCTIVE_ACTION

Exemplos:

```text
Eliminar
Revogar
Cancelar Subscrição
Suspender Empresa
```

Exigir:

```text
objecto
impacto
reversibilidade
motivo
confirmação
```

---

# 21. SYSTEM_CONTROL

Exemplos:

```text
Emergency Stop
Parar Todos
Kill Switch
```

Exigir:

```text
scope
impact
MFA se aplicável
confirmação forte
audit
```

---

# 22. DOWNLOAD

Exemplos:

```text
Baixar PDF
Baixar Excel
Exportar Receipt
```

Apenas:

```text
download action
```

ou escolher formato quando necessário.

Não pedir prioridade/SOP.

---

# 23. UPLOAD / IMPORT

Exemplos:

```text
Importar Empresa
Upload de Conhecimento
Importar Ficheiro
```

Abrir uploader/wizard próprio.

---

# 24. EXPORT

Exemplos:

```text
Exportar Evidência
Exportar Relatório
```

Abrir apenas opções relevantes:

```text
formato
período
scope
```

---

# 25. AUDITORIA OBRIGATÓRIA ANTES DE ALTERAR

Gerar:

```text
BUTTON_ACTION_AUDIT
```

Para cada botão existente no frontend:

```text
button_id
visible_label
route
screen
component_path
current_handler
current_modal
current_action_type
correct_action_type
should_create_task
should_open_form
should_open_modal
should_navigate
should_audit
risk_level
replacement_handler
status
```

Não começar por alterar aleatoriamente.

---

# 26. INVENTARIAR TODOS OS BOTÕES

A auditoria deve cobrir:

```text
sidebar
topbar
cards
tables
rows
dropdowns
tabs
drawers
modals
forms
chat
knowledge center
Employee pages
company pages
integrations
billing
security
audit
```

---

# 27. DETECTAR USO DO FORMULÁRIO GENÉRICO

Localizar componentes como:

```text
GenericExecutionForm
ExecutionForm
ActionExecutionModal
UniversalActionModal
CommandForm
```

ou equivalentes.

Gerar:

```text
GENERIC_FORM_USAGE_AUDIT
```

com:

```text
component
used_by
action
correct_behavior
replace_with
```

---

# 28. PROIBIR FALLBACK GENÉRICO

Se existir lógica como:

```text
onClick(action)
→ openGenericExecutionForm(action)
```

remover.

Não substituir por outro fallback igualmente genérico.

---

# 29. ACTION REGISTRY CENTRAL

Criar:

```text
ACTION_REGISTRY
```

Exemplo:

```ts
{
  key: "marketplace.filter.area",
  label: "Filtrar por Área",
  type: "UI_FILTER",
  handler: "applyAreaFilter",
  requiresTask: false,
  requiresForm: false,
  requiresAudit: false
}
```

Outro exemplo:

```ts
{
  key: "employee.resume",
  label: "Retomar",
  type: "RESUME",
  handler: "resumeEmployee",
  requiresTask: false,
  requiresForm: false,
  requiresConfirmation: true,
  requiresAudit: true
}
```

Outro:

```ts
{
  key: "company.create",
  label: "Criar Empresa",
  type: "CRUD_CREATE",
  form: "CompanyWizard",
  requiresTask: false,
  requiresAudit: true
}
```

---

# 30. NÃO EXPOR IDs TÉCNICOS NO MODAL NORMAL

Retirar de formulários normais:

```text
Módulo: WF-01
Ecrã: ...
Motor WF-01
AETF-500
Tenant
SOP
Ledger imutável
```

Manter apenas quando necessário em:

```text
Modo Avançado
Audit Details
Developer/Support mode
```

---

# 31. NÃO MOSTRAR "EMPRESA / TENANT ALVO" GENERICAMENTE

A empresa actual deve normalmente ser inferida de:

```text
current_company
current_tenant
```

Mostrar selector apenas quando:

```text
utilizador tem acesso a várias empresas
e a acção realmente pode atravessar contexto
```

Nunca mostrar `Tenant` ao cliente comum.

---

# 32. NÃO PEDIR PRIORIDADE QUANDO NÃO É TASK

Só mostrar:

```text
Prioridade
```

em:

```text
OPERATIONAL_TASK
SCHEDULED_TASK
REMOTE_COMMAND
```

quando fizer sentido.

Nunca em:

```text
filter
navigation
open detail
resume
toggle
download
```

---

# 33. NÃO PEDIR SOP QUANDO NÃO É TASK

`SOP` pertence a:

```text
Task Type
Role Pack
Operational Task
```

não à UI.

Remover de todos os formulários que não sejam de trabalho real.

---

# 34. NÃO CRIAR LEDGER PARA ACÇÕES DE UI

Acções como:

```text
filter
search
sort
tab
open drawer
navigation
```

não devem gerar:

```text
execution receipt
immutable ledger
task audit
```

Podem gerar analytics de UX, se necessário:

```text
ui_event
```

mas não evidence operacional.

---

# 35. NÍVEIS DE AUDITORIA

Criar:

```text
AuditLevel
```

com:

```text
NONE
ANALYTICS_ONLY
BUSINESS_EVENT
OPERATIONAL_EVIDENCE
SECURITY_EVENT
```

Exemplo:

```text
Filtrar por Área
→ ANALYTICS_ONLY ou NONE

Retomar Employee
→ BUSINESS_EVENT

Executar Reconciliação
→ OPERATIONAL_EVIDENCE

Emergency Stop
→ SECURITY_EVENT + OPERATIONAL_EVIDENCE
```

---

# 36. MAPA DE FORMULÁRIOS ESPECÍFICOS

Usar:

```text
Criar Empresa
→ CompanyWizard

Convidar Utilizador
→ InviteUserForm

Contratar Employee
→ HireEmployeeWizard

Configurar Employee
→ EmployeeSettingsDrawer

Novo Pedido
→ ChatComposer / NewTaskForm

Anexar
→ AttachmentModal

Agendar
→ ScheduleForm

Aprovar/Rejeitar
→ ApprovalModal

Adicionar Conhecimento
→ KnowledgeIntakeWizard

Resolver Conhecimento
→ KnowledgeIssueModal

Ligar Integração
→ ConnectorWizard

Configurar Canal
→ ChannelSettingsDrawer

Configurar Provider
→ ProviderSecretModal

Editar Permissões
→ PermissionDrawer

Alterar Plano
→ SubscriptionModal

Notificações
→ NotificationSettingsDrawer

Branding
→ BrandingSettingsDrawer

Pausar
→ PauseConfirmation

Retomar
→ ResumeConfirmation

Exportar Evidência
→ EvidenceExportModal
```

---

# 37. UI_FILTER PADRÃO

Preferir:

```text
inline filter bar
```

Exemplo Marketplace:

```text
[ Pesquisar... ]

Área ▾
Departamento ▾
Especialidade ▾
Estado ▾
Plano ▾

Contabilidade ×
Financeiro ×

[ Limpar filtros ]
```

---

# 38. FILTRO SEM MODAL QUANDO POSSÍVEL

Não abrir modal para:

```text
Filtrar por Área
Filtrar por Estado
Filtrar por Departamento
```

Preferir:

```text
dropdown
popover
chips
sidebar filter
```

---

# 39. RETOMAR — UX FINAL

Ideal:

```text
Retomar AI Employee?

O Employee voltará a receber e executar trabalho permitido.

Tarefas pendentes:
3

[ Cancelar ]
[ Retomar ]
```

Se não houver risco:

```text
Retomar
↓
loading
↓
toast success
```

---

# 40. SUSPENDER — UX FINAL

Exemplo:

```text
Suspender AI Employee

Motivo *
Duração
O que fazer com tarefas em execução?
  • concluir
  • pausar
  • cancelar

Preservar fila?
[ sim ]

[ Cancelar ]
[ Suspender ]
```

---

# 41. ACTIVAR — UX FINAL

Exemplo:

```text
Activar AI Employee

Readiness:
Pronto

Permissões:
OK

Integrações:
3 ligadas

Conhecimento:
OK

[ Cancelar ]
[ Activar ]
```

Sem título/SOP/prioridade.

---

# 42. REPROCESSAR — UX FINAL

Só pedir:

```text
motivo
usar mesmos inputs?
usar última configuração?
```

quando necessário.

---

# 43. ABRIR TENANT / ABRIR EMPRESA

No frontend simplificado:

```text
Abrir Empresa
```

deve navegar.

Não abrir formulário.

---

# 44. CONFIGURAR

"Configurar" pode abrir:

```text
drawer
```

com configuração específica do objecto.

Não formulário genérico.

---

# 45. VER INVENTÁRIO DO ECRÃ

Se for ferramenta interna/técnica:

```text
Advanced Mode only
```

Não deve aparecer para cliente final.

---

# 46. BOTÕES DO MARKETPLACE

Classificar:

```text
Pesquisar
→ UI_SEARCH

Filtrar por Área
→ UI_FILTER

Filtrar por Departamento
→ UI_FILTER

Comparar
→ UI_TOGGLE / OPEN_DRAWER

Ver Employee
→ NAVIGATION

Contratar
→ OPEN_WIZARD / CRUD_CREATE
```

---

# 47. BOTÕES DA WORKFORCE

```text
Abrir
→ NAVIGATION

Pausar
→ PAUSE

Retomar
→ RESUME

Reatribuir
→ OPEN_MODAL / STATE_CHANGE

Take Over
→ SYSTEM_CONTROL ou STATE_CHANGE

Parar Todos
→ SYSTEM_CONTROL / DESTRUCTIVE_ACTION
```

---

# 48. BOTÕES DE TAREFAS

```text
Nova Tarefa
→ OPEN_MODAL ou Chat

Abrir
→ NAVIGATION

Executar
→ OPERATIONAL_TASK

Pausar
→ PAUSE

Cancelar
→ CANCEL / DESTRUCTIVE_ACTION

Pedir Revisão
→ OPEN_MODAL / STATE_CHANGE

Aprovar
→ APPROVAL
```

---

# 49. BOTÕES DE KNOWLEDGE

```text
Adicionar Conhecimento
→ OPEN_WIZARD

Nova Versão
→ OPEN_WIZARD

Revogar
→ DESTRUCTIVE_ACTION

Recalcular Hash
→ OPERATIONAL_TASK técnico / ADVANCED_ONLY

Ver Linhagem
→ NAVIGATION / DRAWER

Filtrar
→ UI_FILTER
```

---

# 50. BOTÕES DE INTEGRAÇÃO

```text
Ligar
→ OPEN_WIZARD

Configurar
→ OPEN_DRAWER

Testar
→ OPERATIONAL_TASK curta

Revogar
→ DESTRUCTIVE_ACTION

Reautorizar
→ OPEN_WIZARD
```

---

# 51. BOTÕES DE FACTURAÇÃO

```text
Alterar Plano
→ OPEN_MODAL

Ver Factura
→ NAVIGATION

Baixar Factura
→ DOWNLOAD

Registar Pagamento
→ OPEN_MODAL

Reconciliar
→ OPERATIONAL_TASK
```

---

# 52. BOTÕES DE SEGURANÇA

```text
Ver Incidente
→ NAVIGATION

Exportar Evidência
→ EXPORT

Pausar/Parar
→ SYSTEM_CONTROL

Emergency Stop
→ SYSTEM_CONTROL + SECURITY_EVENT
```

---

# 53. ROUTER DE ACÇÕES

Criar serviço central:

```text
ActionRouter
```

Pseudo-fluxo:

```text
resolve action definition
↓
validate permissions
↓
switch action_type

UI_FILTER
→ ui handler

NAVIGATION
→ router

OPEN_FORM
→ form registry

STATE_CHANGE
→ state handler

OPERATIONAL_TASK
→ task engine

APPROVAL
→ approval engine

DESTRUCTIVE_ACTION
→ confirmation + backend

SYSTEM_CONTROL
→ high-risk gateway
```

---

# 54. FORM REGISTRY

Criar:

```text
FORM_REGISTRY
```

Exemplo:

```ts
company.create
→ CompanyWizard

employee.hire
→ HireEmployeeWizard

knowledge.add
→ KnowledgeIntakeWizard
```

Nenhuma acção desconhecida deve cair automaticamente no GenericExecutionForm.

---

# 55. UNKNOWN ACTION

Se acção não estiver mapeada:

```text
UNKNOWN_ACTION
```

Comportamento em desenvolvimento:

```text
console warning
telemetry
disable action
```

Em produção:

```text
Mostrar:
"Esta acção ainda não está configurada."
```

Não abrir formulário genérico.

---

# 56. REMOVER O GENERIC EXECUTION FORM

Se o componente não tiver mais uso legítimo:

```text
DEPRECATE
```

ou:

```text
ADVANCED_ONLY
```

Se existir necessidade legítima para comandos técnicos manuais, renomear:

```text
Advanced Operational Command
```

e restringir a administradores técnicos.

---

# 57. UX COPY

Eliminar frases como:

```text
Formulário de Execução
Título / Identificador da Acção
Instruções Adicionais & SOP
Empresa / Tenant Alvo
Auditável em ledger imutável
Executar Retomar
```

Substituir por linguagem contextual:

```text
Retomar AI Employee
Filtrar AI Employees
Criar Empresa
Ligar Integração
Aprovar Envio
```

---

# 58. LOADING

Cada acção deve possuir estado apropriado:

```text
Filtrando...
A guardar...
A criar...
A retomar...
A suspender...
A testar...
A enviar...
```

Não usar:

```text
Executando...
```

para tudo.

---

# 59. SUCCESS TOASTS

Exemplos:

```text
AI Employee retomado.
Empresa criada.
Integração ligada.
Fonte adicionada.
Filtros aplicados.
```

---

# 60. ERROR MESSAGES

Exemplos:

```text
Não foi possível retomar o AI Employee.
A integração está indisponível.
A empresa não pôde ser criada.
```

Botão opcional:

```text
[ Ver detalhes ]
```

para modo avançado.

---

# 61. PERMISSIONS

Antes de qualquer acção:

```text
user
company
tenant
permission
object
```

devem ser validados.

Mas isso não precisa aparecer no formulário normal.

---

# 62. TENANT

Continuar a usar internamente.

Não mostrar:

```text
Empresa / Tenant Alvo
```

em acções comuns.

Mostrar:

```text
Empresa
```

somente quando realmente necessário.

---

# 63. TASK CREATION RULE

Criar task apenas quando:

```text
action_type == OPERATIONAL_TASK
```

ou quando o domínio explicitamente exigir task tracking.

Não criar task para:

```text
filter
search
sort
navigation
tab
open modal
open drawer
download
```

---

# 64. AUDIT RULE

Criar operational evidence apenas para:

```text
material execution
external action
approval
state change relevante
security event
```

Não para:

```text
filter
search
sort
tab
```

---

# 65. TESTES OBRIGATÓRIOS

Criar:

```text
TEST-ACTION-01
Filtrar por Área não abre formulário

TEST-ACTION-02
Filtrar por Área não cria task

TEST-ACTION-03
Filtrar por Área não pede tenant/prioridade/SOP

TEST-ACTION-04
Retomar não abre GenericExecutionForm

TEST-ACTION-05
Retomar usa confirmação específica ou execução directa

TEST-ACTION-06
Retomar gera business audit quando aplicável

TEST-ACTION-07
Criar Empresa abre CompanyWizard

TEST-ACTION-08
Adicionar Conhecimento abre KnowledgeIntakeWizard

TEST-ACTION-09
Ligar Integração abre ConnectorWizard

TEST-ACTION-10
Aprovar abre ApprovalModal

TEST-ACTION-11
Emergency Stop exige confirmação forte

TEST-ACTION-12
Unknown action não abre fallback genérico

TEST-ACTION-13
UI_FILTER nunca cria task

TEST-ACTION-14
NAVIGATION nunca cria task

TEST-ACTION-15
OPERATIONAL_TASK cria/associa task

TEST-ACTION-16
API key nunca aparece no frontend após guardar

TEST-ACTION-17
IDs técnicos não aparecem no modo normal

TEST-ACTION-18
Modo Avançado pode mostrar detalhes técnicos autorizados
```

---

# 66. TESTE DE COBERTURA DE BOTÕES

Criar:

```text
BUTTON_ACTION_COVERAGE_TEST
```

Regra:

```text
100% dos botões interactivos
devem possuir action_type conhecido
```

Falhar build/test se:

```text
button without action definition
```

excepto componentes puramente decorativos.

---

# 67. TESTE DE FORMULÁRIO GENÉRICO

Criar grep/static test:

```text
GENERIC_EXECUTION_FORM_USAGE_TEST
```

Deve falhar se:

```text
GenericExecutionForm
```

for chamado por:

```text
UI_FILTER
UI_SEARCH
UI_SORT
UI_TAB
NAVIGATION
RESUME
DOWNLOAD
```

---

# 68. TESTE E2E — MARKETPLACE

Fluxo:

```text
abrir Catálogo
↓
clicar Área
↓
seleccionar Contabilidade
↓
resultado filtra
```

Esperado:

```text
0 modal genérico
0 task criada
0 SOP
0 prioridade
```

---

# 69. TESTE E2E — RETOMAR

Fluxo:

```text
abrir Employee pausado
↓
clicar Retomar
↓
confirmar
↓
backend actualiza estado
↓
toast
```

Esperado:

```text
sem título
sem tenant
sem prioridade
sem SOP
```

---

# 70. TESTE E2E — TASK REAL

Fluxo:

```text
Chat
↓
"Prepare a reconciliação bancária"
↓
task criada
↓
Employee executa
↓
output
↓
receipt
```

Aqui sim:

```text
task
knowledge
runtime
audit
```

são válidos.

---

# 71. MIGRAÇÃO

Gerar:

```text
ACTION_MIGRATION_PLAN
```

Para cada uso do formulário genérico:

```text
current_action
current_component
correct_type
replacement
migration_status
```

---

# 72. NÃO QUEBRAR O BACKEND EXISTENTE

Reutilizar:

```text
Task Engine
Approval Engine
Runtime
Audit
Knowledge
Billing
Connectors
```

A correcção é principalmente:

```text
action classification
frontend routing
form routing
UX cleanup
```

---

# 73. FEATURE FLAG

Se necessário:

```text
ACTION_ROUTER_V2
```

Permitir rollout controlado.

---

# 74. TELEMETRY

Medir:

```text
action_clicked
action_type
handler
success
failure
duration
```

Sem criar evidence operacional desnecessária.

---

# 75. CRITÉRIOS DE ACEITAÇÃO

A implementação só pode ser marcada PASS quando:

```text
✓ nenhum filtro abre GenericExecutionForm
✓ nenhuma navegação abre GenericExecutionForm
✓ Retomar não abre formulário genérico
✓ Pausar possui formulário/contexto específico
✓ cada botão possui action_type
✓ cada formulário é contextual
✓ tenant não aparece desnecessariamente
✓ prioridade só aparece em trabalho real
✓ SOP só aparece em trabalho real
✓ ledger/evidence só aparece onde faz sentido
✓ GenericExecutionForm deixou de ser fallback universal
✓ unknown action não abre formulário genérico
✓ 100% de cobertura no Action Registry
✓ testes E2E passam
```

---

# 76. ENTREGÁVEIS DO AGENTE

Gerar:

```text
1. BUTTON_ACTION_AUDIT.md
2. GENERIC_FORM_USAGE_AUDIT.md
3. ACTION_REGISTRY.md
4. FORM_REGISTRY.md
5. ACTION_MIGRATION_PLAN.md
6. UI_COPY_CLEANUP.md
7. TEST_REPORT.md
8. E2E_ACTION_REPORT.md
9. SECURITY_REVIEW.md
10. FINAL_IMPLEMENTATION_REPORT.md
```

---

# 77. RELATÓRIO FINAL

Separar:

```text
FIXED
REPLACED
REMOVED
REUSED
ADVANCED_ONLY
NOT_APPLICABLE
BLOCKED
TESTED
```

Nunca afirmar que todos os botões estão corrigidos sem cobertura verificável.

---

# 78. RESULTADO FINAL PRETENDIDO

A plataforma deve comportar-se assim:

```text
FILTRO
→ FILTRA

PESQUISA
→ PESQUISA

NAVEGAÇÃO
→ ABRE PÁGINA

FORMULÁRIO
→ PEDE DADOS

RETOMAR
→ RETOMA

PAUSAR
→ PAUSA

TASK
→ EXECUTA TRABALHO

APROVAÇÃO
→ APROVA

DESTRUTIVO
→ CONFIRMA

EXTERNO
→ GOVERNA RISCO E EXECUTA
```

E nunca:

```text
TODO BOTÃO
→ FORMULÁRIO DE EXECUÇÃO GENÉRICO
```

---

# 79. PRINCÍPIO FINAL

A interface deve reflectir a natureza real de cada acção.

```text
AÇÃO SIMPLES
→ INTERACÇÃO SIMPLES

AÇÃO COMPLEXA
→ FLUXO COMPLEXO

AÇÃO DE RISCO
→ CONTROLO FORTE
```

Não transformar acções simples em workflows empresariais desnecessários.

A plataforma deve parecer inteligente porque **remove fricção**, não porque expõe complexidade interna.

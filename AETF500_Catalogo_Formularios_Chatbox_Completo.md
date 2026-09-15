# AETF-500 - Catálogo Completo de Formulários, Modais, Wizards e Chatbox
## Estrutura dos formulários que abrem após os botões da AI Employee Platform

**Versão:** 1.0  
**Data:** 14 de Setembro de 2026  
**Base:** catálogo UI/UX dos 44 ecrãs + 33 prompts do Master Prompt Registry  

> Este catálogo especifica a estrutura de dados e a experiência dos botões que exigem preenchimento, selecção, confirmação ou parametrização. Também inclui um **chatbox operacional com o AI Employee**. Os campos marcados como *Sistema* são preenchidos pelo backend e não devem ser livres no frontend.

## 1. Regra de UX para todos os formulários

- Campos obrigatórios mostram `*` e mensagem de validação junto ao campo.
- `company_id`, `tenant_id`, IDs imutáveis, hashes e secret references são backend-controlled.
- Acções de HIGH/CRITICAL risk podem exigir aprovação, MFA e segregação de funções.
- API keys e outros secrets nunca são devolvidos ao browser após gravação.
- Formulários longos usam wizard/stepper; formulários curtos usam modal/drawer.
- Botão primário fica à direita; `Cancelar` à esquerda; acção destrutiva exige confirmação explícita.
- Todo formulário deve ter `loading`, `success`, `validation error`, `permission denied` e `network failure` states.
- Todo submit material cria audit event com user, company, tenant, timestamp e object IDs.

## 2. Chatbox operacional com o Employee

### CHAT-01 - Employee Conversation Workspace

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ Contabilista Sénior • AEI-000001 • MARVINE, LDA • ACTIVE • ● REAL_API     │
├───────────────────────────────────────────────┬─────────────────────────────┤
│ CONVERSA                                      │ CONTEXTO DA TASK            │
│                                               │ Task / Prioridade / Prazo   │
│ Utilizador: Faça a reconciliação de Agosto.  │ Fontes autorizadas          │
│                                               │ Ficheiros                   │
│ Employee: Preciso do extracto bancário e...  │ Knowledge decision          │
│                                               │ Aprovações                  │
│ [event] Primavera conectado                   │ Outputs                     │
│ [approval] Envio externo requer aprovação     │ Evidence / Receipts         │
├───────────────────────────────────────────────┴─────────────────────────────┤
│ + Ficheiro  + Fonte  + Output  Prioridade  Prazo                           │
│ [ Escreva a mensagem ou pedido...                                      ]   │
│ [Guardar rascunho]                                      [Enviar ▸]          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Comportamento:** cada pedido operacional cria ou associa `task_id`. Perguntas de esclarecimento permanecem no mesmo thread. Eventos de tools, fontes, approvals e outputs aparecem como cartões colapsáveis, sem expor chain-of-thought privado.

### Campos do composer

| Campo | Tipo | Obrigatório | Regra |
|---|---|---:|---|
| Empresa/Tenant | badge contextual | Sistema | nunca livre |
| Employee Instance | badge contextual | Sistema | AEI contratado |
| Task actual | selector | não | criar nova ou associar existente |
| Mensagem | textarea | sim | pedido ou diálogo |
| Anexos | file picker | não | ligado ao tenant e task |
| Fontes | source picker | não | apenas autorizadas |
| Output | multi-select | não | PDF/DOCX/XLSX/PPTX/texto/etc. |
| Prioridade | select | não | NORMAL por defeito |
| Prazo | datetime | não | opcional |
| Autonomia | select | não | nunca ultrapassa instância |
| Enviar como | select | sim | mensagem/task/comando remoto |

## 3. Catálogo detalhado de formulários

### FRM-G-01 - Comando Rápido

**Módulo:** Global  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Comando Rápido`, `Novo Pedido`  

Enviar uma instrução imediata a um AI Employee, podendo converter o pedido numa tarefa rastreável.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Empresa / Tenant | Selector contextual | Sim | Preenchido com a empresa activa. |
| AI Employee | Entity picker | Sim | Mostrar apenas instâncias autorizadas e operacionais. |
| Pedido / instrução | Textarea | Sim | Campo principal do comando. |
| Anexos | File picker | Não | PDF, XLSX, DOCX, imagens e outros formatos permitidos. |
| Prioridade | Select | Sim | NORMAL; LOW, NORMAL, HIGH, URGENT. |
| Executar como | Radio | Sim | Conversa, tarefa ou comando remoto. |
| Prazo | DateTime | Não | Opcional. |
| Resultado esperado | Multi-select | Não | Texto, PDF, DOCX, XLSX, PPTX, CSV, JSON. |

**Botões do formulário:** `Cancelar` | `Enviar`

### FRM-G-02 - Pesquisa e Filtros

**Módulo:** Global  
**Superfície:** Drawer  
**Botão(ões) que abre(m):** `Pesquisar`, `Filtrar`, `Filtrar Canal`  

Pesquisar entidades e limitar resultados sem alterar dados.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Texto de pesquisa | Text | Não | — |
| Empresa | Entity picker | Não | — |
| Employee | Entity picker | Não | — |
| Estado | Multi-select | Não | — |
| Período | Date range | Não | — |
| Canal / módulo | Multi-select | Não | — |
| Risco | Multi-select | Não | — |
| Ordenação | Select | Não | — |

**Botões do formulário:** `Limpar` | `Aplicar filtros`

### FRM-G-03 - Opções de Exportação

**Módulo:** Global  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Exportar`, `Exportar Receipt`, `Exportar Baseline`, `Exportar Passaporte`  

Configurar formato e escopo da exportação.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Formato | Select | Sim | PDF, XLSX, CSV, JSON ou ZIP conforme o objecto. |
| Período | Date range | Não | — |
| Incluir evidência | Toggle | Não | — |
| Incluir anexos | Toggle | Não | — |
| Incluir dados sensíveis | Toggle | Não | Sujeito a permissão. |
| Nome do ficheiro | Text | Não | — |
| Destino | Select | Sim | Download, Drive, arquivo interno. |

**Botões do formulário:** `Cancelar` | `Exportar`

### FRM-G-04 - Comparação

**Módulo:** Global  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Comparar`, `Comparar Versões`, `Comparar Modelos`, `Comparar Providers`, `Comparar Contextos`, `Comparar Resultado`  

Seleccionar dois ou mais elementos e os critérios de comparação.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Elemento A | Entity picker | Sim | — |
| Elemento B | Entity picker | Sim | — |
| Critérios | Multi-select | Sim | — |
| Normalizar contexto | Toggle | Não | — |
| Mostrar diferenças apenas | Toggle | Não | — |
| Gerar relatório | Toggle | Não | — |

**Botões do formulário:** `Cancelar` | `Comparar`

### FRM-ORG-01 - Criar Empresa

**Módulo:** Empresas & Tenants  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Empresa`  

Criar a entidade empresarial e provisionar o tenant inicial. Por defeito: 1 empresa = 1 tenant.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Razão social | Text | Sim | — |
| Nome comercial | Text | Não | — |
| NIF / identificação fiscal | Text | Sim | — |
| País | Country selector | Sim | Define jurisdição base. |
| Província / Estado | Text | Não | — |
| Município / Cidade | Text | Não | — |
| Morada | Textarea | Não | — |
| Forma jurídica | Select | Não | — |
| Sector / indústria | Select | Sim | — |
| Moeda base | Currency selector | Sim | Ex.: AOA. |
| Fuso horário | Timezone selector | Sim | — |
| Idioma principal | Select | Sim | — |
| Administrador principal - nome | Text | Sim | — |
| Administrador principal - email | Email | Sim | — |
| Telefone | Phone | Não | — |
| Criar tenant padrão | Toggle | Sim | Sim; Deve ficar activo nesta versão. |
| Código da empresa | Read-only | Sistema | Gerado pelo backend. |
| Tenant ID | Read-only | Sistema | Gerado automaticamente. |

**Botões do formulário:** `Cancelar` | `Criar Empresa`

**Validações:**
- NIF único no âmbito configurado.
- Razão social obrigatória.
- Email válido.

**Segurança:**
- Nunca confiar em company_id/tenant_id enviados livremente pelo frontend.

### FRM-ORG-02 - Importar Empresa

**Módulo:** Empresas & Tenants  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Importar Empresa`  

Criar ou actualizar uma empresa a partir de um ficheiro estruturado, com mapeamento e prevenção de duplicados.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Ficheiro | File | Sim | CSV/XLSX/JSON conforme importador. |
| Modo | Radio | Sim | Criar nova / actualizar existente. |
| Empresa existente | Entity picker | Condicional | Obrigatória se modo=actualizar. |
| Linha de cabeçalho | Numeric | Não | 1 |
| Mapeamento de colunas | Field mapper | Sim | — |
| Tratamento de duplicados | Select | Sim | Bloquear, ignorar ou solicitar revisão. |
| Criar tenant padrão | Toggle | Sim | Para novas empresas. |
| Executar validação antes de importar | Toggle | Sim | Sim |

**Botões do formulário:** `Cancelar` | `Validar e Importar`

### FRM-ORG-03 - Editar / Configurar Empresa

**Módulo:** Empresas & Tenants  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Editar Empresa`, `Configurar`  

Actualizar dados organizacionais, preferências e parâmetros operacionais sem alterar identificadores imutáveis.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Razão social | Text | Sim | — |
| Nome comercial | Text | Não | — |
| NIF | Text | Sim | — |
| Sector | Select | Sim | — |
| País / jurisdição | Select | Sim | — |
| Moeda base | Select | Sim | — |
| Fuso horário | Select | Sim | — |
| Idioma | Select | Sim | — |
| Estado operacional | Select | Sim | CONFIGURING, ACTIVE, SUSPENDED conforme permissão. |
| Responsável principal | User picker | Sim | — |
| Política de retenção | Select | Não | — |
| Notas internas | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Guardar Alterações`

### FRM-ORG-04 - Suspender / Desactivar Empresa ou Serviço

**Módulo:** Empresas & Tenants  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Suspender`, `Desactivar`  

Aplicar suspensão controlada com motivo, âmbito e data efectiva.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Âmbito | Select | Sim | Empresa, tenant, Employee, conector ou serviço. |
| Motivo | Select | Sim | — |
| Descrição | Textarea | Sim | — |
| Data/hora efectiva | DateTime | Sim | Agora |
| Duração | Select | Não | Indefinida ou temporária. |
| Data de retoma | DateTime | Condicional | — |
| Preservar filas em espera | Toggle | Sim | Sim |
| Notificar responsáveis | Toggle | Não | Sim |
| Confirmação do operador | Checkbox | Sim | — |

**Botões do formulário:** `Cancelar` | `Confirmar Suspensão`

### FRM-ORG-05 - Convidar Utilizador

**Módulo:** Empresas & Tenants  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Convidar Utilizador`  

Convidar uma pessoa para a empresa/tenant e atribuir função e escopo inicial.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Nome completo | Text | Sim | — |
| Email | Email | Sim | — |
| Telefone | Phone | Não | — |
| Função / role | Select | Sim | — |
| Departamento | Entity picker | Não | — |
| Escopo | Multi-select | Sim | Empresas, departamentos, Employees. |
| Permissões base | Permission preset | Sim | — |
| Exigir MFA | Toggle | Não | Sim para perfis privilegiados. |
| Data de expiração do convite | DateTime | Não | — |
| Mensagem do convite | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Enviar Convite`

### FRM-ORG-06 - Associar / Contratar AI Employee

**Módulo:** Workforce & Provisioning  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Adicionar Employee`, `Contratar Employee`, `Contratar`  

Criar uma instância privada AEI ligada à empresa e ao tenant, mantendo o EMP global apenas como template.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Empresa | Read-only | Sistema | — |
| Company ID | Read-only | Sistema | — |
| Tenant ID | Read-only | Sistema | — |
| Employee do catálogo | Entity picker | Sim | — |
| Departamento | Entity picker | Sim | — |
| Supervisor | User picker | Sim | — |
| Plano | Select | Sim | STARTER, PROFESSIONAL, ENTERPRISE ou plano comercial activo. |
| Autonomia | Select | Sim | A1-A6, limitada pelo Role Pack. |
| Risco | Read-only/Select | Sim | R1-R5 conforme Role Pack/política. |
| Country Pack | Select | Sim | — |
| Sector Pack | Select | Não | — |
| Client Policy Pack | Select | Não | — |
| Nome interno da instância | Text | Não | — |
| Objectivo inicial | Textarea | Não | — |
| Estado inicial | Read-only | Sistema | HIRED / PROVISIONING. |

**Botões do formulário:** `Cancelar` | `Criar Instância`

**Validações:**
- Nunca associar EMP global directamente à empresa.
- Gerar instance_id único AEI-XXXXXX.

### FRM-ORG-07 - Executar Readiness / Smoke Test

**Módulo:** Provisioning  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Executar Readiness`, `Executar Smoke Test`  

Executar verificações pré-activação sobre bindings, fontes, permissões, knowledge, tools e conectores.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Employee Instance | Entity picker | Sim | — |
| Suite | Select | Sim | Smoke / Readiness completo. |
| Ambiente | Select | Sim | — |
| Dataset / caso | Entity picker | Não | — |
| Conectores incluídos | Multi-select | Não | — |
| Testar entrega | Toggle | Não | — |
| Testar aprovação | Toggle | Não | — |
| Supervisor de teste | User picker | Sim | — |
| Notas | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Executar Teste`

### FRM-ORG-08 - Activar Employee / Instância

**Módulo:** Provisioning  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Activar`, `Promover`  

Promover uma instância para estado operacional após gates obrigatórios.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Instância | Read-only | Sistema | — |
| Ambiente destino | Select | Sim | SHADOW, CONTROLLED_ACTIVE, PRODUCTION. |
| Autonomia efectiva | Select | Sim | — |
| Supervisor | User picker | Sim | — |
| Approval policy | Entity picker | Sim | — |
| Data/hora de activação | DateTime | Sim | Agora |
| Limites de uso | Numeric/Policy | Não | — |
| Notas de activação | Textarea | Não | — |
| Confirmar que readiness passou | Checkbox | Sim | — |

**Botões do formulário:** `Cancelar` | `Activar`

### FRM-ORG-09 - Pausar / Retomar Employee

**Módulo:** Workforce  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Pausar`, `Retomar`  

Pausar ou retomar uma instância mantendo auditabilidade e filas controladas.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Employee Instance | Entity picker | Sim | — |
| Acção | Radio | Sim | Pausar / Retomar. |
| Motivo | Textarea | Condicional | Obrigatório para pausa. |
| Duração | Select | Não | — |
| Retomar automaticamente em | DateTime | Não | — |
| Tratamento das tarefas activas | Select | Sim | Concluir, pausar, reatribuir. |
| Notificar supervisor | Toggle | Não | Sim |

**Botões do formulário:** `Cancelar` | `Confirmar`

### FRM-ORG-10 - Reatribuir / Take Over / Designar Supervisor

**Módulo:** Workforce  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Reatribuir`, `Take Over`, `Designar Supervisor`  

Transferir responsabilidade de uma tarefa/Employee ou permitir takeover humano.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Objecto | Select | Sim | Task, Employee, Pilot. |
| Objecto seleccionado | Entity picker | Sim | — |
| Responsável actual | Read-only | Sistema | — |
| Novo responsável / supervisor | User picker | Sim | — |
| Motivo | Textarea | Sim | — |
| Duração | Select | Não | Temporária/permanente. |
| Reatribuir tarefas em curso | Toggle | Não | — |
| Notificar envolvidos | Toggle | Não | Sim |

**Botões do formulário:** `Cancelar` | `Reatribuir`

### FRM-ORG-11 - Criar Tenant de Teste

**Módulo:** Laboratório  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Tenant de Teste`  

Criar ambiente isolado para testes operacionais e Shadow Mode.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Nome | Text | Sim | — |
| Empresa de referência | Entity picker | Não | — |
| Tipo | Select | Sim | DEVELOPMENT, STAGING, SHADOW. |
| Região / residência | Select | Não | — |
| Dados permitidos | Select | Sim | Synthetic, sample approved, masked production. |
| Data de expiração | Date | Não | — |
| Responsável | User picker | Sim | — |
| Copiar policies/templates | Toggle | Não | — |

**Botões do formulário:** `Cancelar` | `Criar Tenant`

### FRM-TASK-01 - Nova Tarefa / Criar Tarefa

**Módulo:** Central de Trabalho  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Nova Tarefa`, `Criar Tarefa`, `Converter em Tarefa`  

Criar um Work Order ligado a company_id, tenant_id e employee instance. O formulário adapta-se ao Task Type.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Empresa / Tenant | Read-only | Sistema | — |
| AI Employee | Entity picker | Sim | — |
| Task Type | Entity picker | Não | Se escolhido, carregar input contract e SOP. |
| Título | Text | Sim | — |
| O que pretende que o Employee faça? | Textarea | Sim | — |
| Anexos | File picker | Não | — |
| Fontes autorizadas | Multi-select | Não | Drive, Primavera, Banco RO, Email, DB, etc. |
| Prioridade | Select | Sim | NORMAL; LOW, NORMAL, HIGH, URGENT. |
| Prazo | DateTime | Não | — |
| Resultado desejado | Multi-select | Sim | Texto, PDF, DOCX, XLSX, PPTX, JSON, CSV. |
| Modo de autonomia | Radio | Sim | Analisar / preparar e aguardar aprovação / executar dentro das permissões. |
| Aprovação humana | Select | Não | Auto conforme risco ou reviewer específico. |
| Dados adicionais dinâmicos | Dynamic fields | Condicional | Gerados pelo Input Contract do Task Type. |

**Botões do formulário:** `Cancelar` | `Enviar Tarefa`

**Validações:**
- task_id, company_id, tenant_id e instance_id obrigatórios antes de executar.

### FRM-TASK-02 - Atribuir Tarefa

**Módulo:** Central de Trabalho  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Atribuir`  

Atribuir ou reatribuir uma tarefa a um Employee elegível.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Tarefa | Entity picker | Sim | — |
| Employee actual | Read-only | Não | — |
| Novo AI Employee | Entity picker | Sim | — |
| Verificar eligibility | Toggle | Sim | Sim |
| Manter prazo/prioridade | Toggle | Sim | Sim |
| Supervisor | User picker | Não | — |
| Motivo | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Atribuir`

### FRM-TASK-03 - Adicionar Ficheiros / Fornecer Dados

**Módulo:** Tarefa  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Anexar`, `Fornecer Dados`, `Escolher Ficheiro`, `Ver Anexos`  

Adicionar dados a uma tarefa, knowledge source ou conversa mantendo tenant e classificação.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Ficheiros | File picker | Sim | — |
| Descrição | Textarea | Não | — |
| Tipo de dado | Select | Não | — |
| Classificação | Select | Sim | Público, interno, confidencial, restrito. |
| Associar à tarefa | Read-only/Entity | Sim | — |
| Usar como knowledge candidate | Toggle | Não | — |
| Extrair texto automaticamente | Toggle | Não | Sim |

**Botões do formulário:** `Cancelar` | `Adicionar`

### FRM-TASK-04 - Agendar / Nova Recorrência

**Módulo:** Tarefas & Scheduler  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Agendar`, `Nova Recorrência`, `Configurar Horário`  

Agendar tarefa, briefing ou rotina recorrente.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Objecto | Select | Sim | Task, Briefing, Report, Command. |
| Data/hora inicial | DateTime | Sim | — |
| Fuso horário | Timezone | Sim | — |
| Recorrência | Select | Sim | Uma vez, diária, semanal, mensal, custom. |
| Regra de recorrência | RRULE builder | Condicional | — |
| Fim | Select/Date | Não | — |
| Se falhar | Select | Sim | Retry, skip, notify. |
| Canal de notificação | Multi-select | Não | — |
| Activo | Toggle | Sim | Sim |

**Botões do formulário:** `Cancelar` | `Guardar Agendamento`

### FRM-TASK-05 - Pedir Revisão

**Módulo:** Tarefa / Qualidade  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Pedir Revisão`  

Solicitar revisão humana ou do Employee com instruções específicas.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Tarefa / output | Read-only | Sistema | — |
| Tipo de revisão | Select | Sim | Factual, formato, cálculos, fontes, completa. |
| Instruções | Textarea | Sim | — |
| Revisor | User/Employee picker | Não | — |
| Prazo | DateTime | Não | — |
| Bloquear entrega até concluir | Toggle | Sim | Sim |

**Botões do formulário:** `Cancelar` | `Solicitar Revisão`

### FRM-TASK-06 - Cancelar Tarefa / Comando

**Módulo:** Tarefa  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Cancelar`  

Cancelar de forma auditável e decidir o tratamento dos efeitos já produzidos.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Objecto | Read-only | Sistema | — |
| Motivo | Select | Sim | — |
| Justificação | Textarea | Sim | — |
| Cancelar execuções pendentes | Toggle | Sim | Sim |
| Tentar rollback | Toggle | Não | — |
| Notificar envolvidos | Toggle | Não | Sim |

**Botões do formulário:** `Cancelar` | `Cancelar`

### FRM-RUN-01 - Parâmetros de Execução

**Módulo:** Runtime  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Executar`, `Executar Agora`, `Reprocessar`  

Configurar uma execução/reexecução controlada.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Tarefa | Read-only/Entity | Sim | — |
| Modo | Select | Sim | REAL_API, SANDBOX_API, MOCK permitido apenas em teste. |
| Employee Instance | Read-only | Sistema | — |
| Provider/model | Select | Não | Auto pelo router se vazio. |
| Reusar input snapshot | Toggle | Sim | Sim |
| Reusar knowledge snapshot | Toggle | Sim | Sim |
| Razão da reexecução | Textarea | Condicional | — |
| Budget máximo | Currency/Numeric | Não | — |
| Human review após execução | Toggle | Não | — |

**Botões do formulário:** `Cancelar` | `Executar`

### FRM-RUN-02 - Trocar Modelo

**Módulo:** Runtime  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Trocar Modelo`  

Alterar binding ou override de provider/model para uma execução ou instância.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Escopo | Select | Sim | Esta execução, task type, Employee Instance. |
| Provider | Select | Sim | OpenAI, Gemini, Claude ou provider autorizado. |
| Modelo | Select | Sim | — |
| Configuração / reasoning | Select | Não | — |
| Routing mode | Select | Sim | FIXED_MODEL, PRIMARY_WITH_FALLBACK, TASK_AWARE, COST_AWARE, QUALITY_FIRST, BALANCED. |
| Aplicar até | DateTime | Não | — |
| Motivo | Textarea | Sim | — |

**Botões do formulário:** `Cancelar` | `Aplicar`

### FRM-RUN-03 - Testar Fallback / Revalidar

**Módulo:** Runtime  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Testar Fallback`, `Revalidar`, `Retestar`  

Executar teste controlado de fallback, readiness, competência ou runtime.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Objecto a testar | Select/Entity | Sim | — |
| Tipo de teste | Select | Sim | — |
| Provider/model primário | Select | Não | — |
| Fallback | Select | Não | — |
| Caso / dataset | Entity picker | Não | — |
| Ambiente | Select | Sim | — |
| Executar com API real | Toggle | Sim | Sim quando o objectivo é evidência real. |
| Revisor | User picker | Não | — |
| Notas | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Executar Teste`

### FRM-ROLE-01 - Criar Task Type

**Módulo:** Role Packs & SOPs  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Task Type`  

Criar tipo de trabalho canónico e os seus contratos.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Nome | Text | Sim | — |
| task_type_key | Text/Slug | Sim | — |
| Domínio | Select | Sim | — |
| Função | Select | Sim | — |
| Descrição | Textarea | Sim | — |
| Risco | Select | Sim | — |
| Complexidade | Select | Sim | — |
| Competências requeridas | Multi-select | Sim | — |
| Inputs obrigatórios | Schema builder | Sim | — |
| Tools requeridas | Multi-select | Não | — |
| Knowledge mode | Select | Sim | — |
| Output contract | Schema builder | Sim | — |
| Approval requirements | Policy builder | Não | — |
| SOP | Entity picker | Não | — |
| Owner | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Criar Task Type`

### FRM-ROLE-02 - Criar SOP

**Módulo:** Role Packs & SOPs  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar SOP`  

Documentar procedimento operacional executável, versionado e auditável.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Título | Text | Sim | — |
| Objectivo | Textarea | Sim | — |
| Task Types | Multi-select | Sim | — |
| Precondições | List builder | Não | — |
| Inputs | List/schema | Sim | — |
| Passos de execução | Ordered step builder | Sim | — |
| Pontos de decisão | Decision builder | Não | — |
| Validações | List builder | Não | — |
| Excepções | List builder | Não | — |
| Stop conditions | List builder | Sim | — |
| Escalação | Matrix builder | Sim | — |
| Outputs | List/schema | Sim | — |
| Quality checks | Checklist builder | Sim | — |
| Owner | User picker | Sim | — |
| Approver | User picker | Sim | — |
| Versão | Text | Sim | 1.0 |

**Botões do formulário:** `Cancelar` | `Guardar SOP`

### FRM-ROLE-03 - Editar Role Pack

**Módulo:** Role Packs & SOPs  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Editar Role Pack`  

Editar missão, escopo, competências, tools, limits e governance do Role Pack.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Nome da função | Text | Sim | — |
| Role key | Read-only | Sistema | — |
| Departamento | Select | Sim | — |
| Missão | Textarea | Sim | — |
| Responsabilidades | List builder | Sim | — |
| Task Types | Multi-select | Sim | — |
| Competências | Multi-select | Sim | — |
| Tools permitidas | Multi-select | Não | — |
| Autonomia máxima | Select | Sim | — |
| Risco base | Select | Sim | — |
| Permissões máximas | Permission builder | Sim | — |
| Stop/escalation rules | Policy builder | Sim | — |
| KPIs | List builder | Não | — |
| Limitações | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Guardar Nova Versão`

### FRM-ROLE-04 - Publicar Versão

**Módulo:** Role Packs / Knowledge / Prompts  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Publicar Versão`, `Publicar`  

Publicar uma versão aprovada com notas, data efectiva e rollback.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Objecto | Read-only | Sistema | — |
| Versão | Text | Sim | — |
| Notas da versão | Textarea | Sim | — |
| Effective at | DateTime | Sim | Agora |
| Aprovador | User picker | Sim | — |
| Requer reteste | Toggle | Sim | — |
| Escopo de rollout | Select | Sim | Todos, wave, company, subset. |
| Rollback target | Version picker | Não | — |
| Confirmar publicação | Checkbox | Sim | — |

**Botões do formulário:** `Cancelar` | `Publicar`

### FRM-RCODE-01 - Novo Comando Remoto

**Módulo:** Remote Command  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Novo Comando`  

Enviar comando cloud/local com risk gate, device targeting e fila offline.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Empresa / Tenant | Read-only | Sistema | — |
| Employee Instance | Entity picker | Sim | — |
| Comando | Textarea | Sim | — |
| Canal de origem | Read-only/Select | Sim | — |
| Execution mode | Select | Sim | IMMEDIATE_CLOUD, LOCAL_AGENT, DEFERRED, SCHEDULED. |
| Dispositivo alvo | Device picker | Condicional | — |
| Anexos | File picker | Não | — |
| Risco | Read-only/Select | Sim | — |
| Agendar para | DateTime | Condicional | — |
| Idempotency key | Read-only | Sistema | — |

**Botões do formulário:** `Cancelar` | `Enviar Comando`

### FRM-RCODE-02 - Registar Dispositivo

**Módulo:** Remote Command  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Registar Dispositivo`  

Registar endpoint local autorizado para deferred execution.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Nome do dispositivo | Text | Sim | — |
| Tipo | Select | Sim | PC, server, mobile, local agent. |
| Empresa / Tenant | Read-only | Sistema | — |
| Owner | User picker | Sim | — |
| Sistema operativo | Select | Não | — |
| Local agent version | Text | Não | — |
| Capabilities | Multi-select | Sim | — |
| Fingerprint / public key | Text/File | Sim | — |
| Heartbeat interval | Numeric | Sim | — |
| Permitir execução local | Toggle | Sim | — |

**Botões do formulário:** `Cancelar` | `Registar`

### FRM-APR-01 - Decisão de Aprovação

**Módulo:** Approval Center  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Aprovar`, `Aprovar Comando`, `Aprovar Envio`, `Aprovar Delivery`, `Rejeitar`  

Aprovar ou rejeitar exactamente o snapshot apresentado.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Pedido / acção | Read-only | Sistema | — |
| Snapshot hash | Read-only | Sistema | — |
| Decisão | Radio | Sim | APPROVE / REJECT. |
| Comentário | Textarea | Condicional | Obrigatório na rejeição. |
| Validade da aprovação | DateTime | Não | — |
| MFA / confirmação reforçada | Security challenge | Condicional | — |
| Confirmo que revi evidência e impacto | Checkbox | Sim | — |

**Botões do formulário:** `Cancelar` | `Registar Decisão`

### FRM-APR-02 - Modificar Antes de Aprovar

**Módulo:** Approval Center  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Modificar`  

Editar parâmetros da acção antes de nova aprovação, gerando novo snapshot.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Acção original | Read-only | Sistema | — |
| Campos modificáveis | Dynamic form | Sim | — |
| Motivo da alteração | Textarea | Sim | — |
| Enviar novamente para aprovação | Toggle | Sim | Sim |
| Aprovador seguinte | User picker | Não | — |

**Botões do formulário:** `Cancelar` | `Guardar Modificação`

### FRM-APR-03 - Escalar

**Módulo:** Approval / Risk  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Escalar`  

Encaminhar um caso para nível superior por risco, conflito ou incapacidade.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Objecto | Read-only | Sistema | — |
| Motivo | Select | Sim | — |
| Severidade | Select | Sim | — |
| Descrição | Textarea | Sim | — |
| Escalar para | User/Role picker | Sim | — |
| Prazo | DateTime | Não | — |
| Bloquear execução | Toggle | Sim | Sim |
| Anexar evidência | File picker | Não | — |

**Botões do formulário:** `Cancelar` | `Escalar`

### FRM-KNO-01 - Adicionar Conhecimento / Ficheiro

**Módulo:** Knowledge Center  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Adicionar Conhecimento`, `Escolher Ficheiro`  

Ingerir uma fonte no Knowledge Center. Upload não equivale a publicação.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Ficheiro | File | Sim | — |
| Título | Text | Sim | — |
| Descrição | Textarea | Não | — |
| Knowledge Type | Select | Sim | — |
| Source Type | Select | Sim | — |
| Scope | Select | Sim | GLOBAL, JURISDICTION, SECTOR, COMPANY_PRIVATE. |
| Empresa / Tenant | Entity context | Condicional | Obrigatório para COMPANY_PRIVATE. |
| Jurisdição / país | Select | Não | — |
| Sector | Select | Não | — |
| Domínio | Select | Não | — |
| Competência | Multi-select | Não | — |
| Task Type | Multi-select | Não | — |
| Employees alvo | Multi-select | Não | — |
| Source Criticality | Select | Sim | LOW, MEDIUM, HIGH, CRITICAL. |
| Source Authority | Text/Select | Não | — |
| URL da fonte | URL | Não | — |
| Data de publicação | Date | Não | — |
| Data efectiva | Date | Não | — |
| Expira / rever em | Date | Não | — |
| Versão | Text | Sim | — |
| Idioma | Select | Sim | — |
| Confidencialidade | Select | Sim | — |
| Owner | User picker | Sim | — |
| Reviewer | User picker | Não | — |
| Approver | User picker | Não | — |

**Botões do formulário:** `Cancelar` | `Carregar e Processar`

**Validações:**
- Validar MIME, tamanho, integridade e segurança.
- Nunca publicar automaticamente source crítico sem policy aplicável.

### FRM-KNO-02 - Upload de Conhecimento em Lote

**Módulo:** Knowledge Center  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Upload em Lote`  

Carregar múltiplas fontes e aplicar metadados comuns antes de mapping individual.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Ficheiros / ZIP | Multi-file | Sim | — |
| Scope padrão | Select | Sim | — |
| Empresa / Tenant | Entity context | Condicional | — |
| Knowledge Type padrão | Select | Não | — |
| Criticidade padrão | Select | Não | — |
| Idioma padrão | Select | Não | — |
| Owner | User picker | Sim | — |
| Auto-classificar | Toggle | Sim | Sim |
| Auto-mapear competências | Toggle | Sim | Sim |
| Enviar fontes críticas para revisão | Toggle | Sim | Sim |

**Botões do formulário:** `Cancelar` | `Processar Lote`

### FRM-KNO-03 - Adicionar Fonte Oficial

**Módulo:** Knowledge Center  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Adicionar Fonte Oficial`  

Registar uma fonte oficial/regulatória com autoridade, versão e currentness.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Título oficial | Text | Sim | — |
| Entidade emissora | Text/Entity | Sim | — |
| URL oficial | URL | Sim | — |
| Jurisdição | Select | Sim | — |
| Tipo de instrumento | Select | Sim | — |
| Número / referência | Text | Não | — |
| Data de publicação | Date | Não | — |
| Data efectiva | Date | Não | — |
| Versão / redacção | Text | Sim | — |
| Criticidade | Select | Sim | HIGH/CRITICAL por defeito conforme política. |
| Método de monitorização | Select | Não | — |
| Próxima revisão | Date | Não | — |
| Owner regulatório | User picker | Sim | — |
| Approver | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Registar Fonte Oficial`

### FRM-KNO-04 - Criar Procedimento

**Módulo:** Knowledge Center  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Procedimento`  

Criar conteúdo interno estruturado para um processo/competência.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Título | Text | Sim | — |
| Empresa / Scope | Entity/Select | Sim | — |
| Objectivo | Textarea | Sim | — |
| Aplica-se a | Multi-select | Sim | Competências, Task Types, Employees. |
| Precondições | List builder | Não | — |
| Passos | Ordered step builder | Sim | — |
| Excepções | List builder | Não | — |
| Stop/escalation | List builder | Sim | — |
| Owner | User picker | Sim | — |
| Reviewer | User picker | Não | — |
| Versão | Text | Sim | — |

**Botões do formulário:** `Cancelar` | `Guardar Procedimento`

### FRM-KNO-05 - Adicionar Política

**Módulo:** Knowledge Center  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Adicionar Política`  

Registar política interna e extrair regras sem permitir que política interna ultrapasse norma legal aplicável.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Título | Text | Sim | — |
| Empresa / Tenant | Entity context | Sim | — |
| Categoria | Select | Sim | — |
| Documento | File/Text editor | Sim | — |
| Data efectiva | Date | Sim | — |
| Versão | Text | Sim | — |
| Owner | User picker | Sim | — |
| Approver | User picker | Sim | — |
| Extrair regras automaticamente | Toggle | Não | Sim |
| Matriz de alçadas | Matrix builder | Não | — |
| Revisão periódica | Date/Frequency | Não | — |

**Botões do formulário:** `Cancelar` | `Guardar Política`

### FRM-KNO-06 - Criar Template / Conteúdo Interno

**Módulo:** Knowledge Center  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Conteúdo Interno`, `Novo Template`  

Criar artefacto interno reutilizável por Employees e documentos.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Nome | Text | Sim | — |
| Tipo | Select | Sim | Template, exemplo aprovado, instrução, snippet. |
| Scope | Select | Sim | — |
| Empresa / Tenant | Condicional | Condicional | — |
| Conteúdo | Rich text / builder | Sim | — |
| Variáveis | Schema builder | Não | — |
| Task Types | Multi-select | Não | — |
| Employees | Multi-select | Não | — |
| Owner | User picker | Sim | — |
| Approver | User picker | Não | — |
| Versão | Text | Sim | — |

**Botões do formulário:** `Cancelar` | `Guardar`

### FRM-KNO-07 - Carregar Nova Versão

**Módulo:** Knowledge Center  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Nova Versão`, `Carregar Nova Versão`  

Adicionar versão sem apagar histórico e preparar diff, impact analysis e retest.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Fonte actual | Read-only | Sistema | — |
| Novo ficheiro / conteúdo | File/Editor | Sim | — |
| Nova versão | Text | Sim | — |
| Data efectiva | Date | Não | — |
| Motivo da actualização | Textarea | Sim | — |
| Executar diff | Toggle | Sim | Sim |
| Executar impact analysis | Toggle | Sim | Sim |
| Retestar Employees afectados | Toggle | Sim | Sim |

**Botões do formulário:** `Cancelar` | `Carregar Versão`

### FRM-KNO-08 - Submeter Conhecimento à Revisão

**Módulo:** Knowledge Center  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Submeter à Revisão`, `Forçar Revisão`  

Enviar fonte/knowledge object para revisão humana.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Objecto | Read-only | Sistema | — |
| Reviewer | User picker | Sim | — |
| Approver | User picker | Não | — |
| Motivo / instruções | Textarea | Não | — |
| Prazo | DateTime | Não | — |
| Severidade | Select | Não | — |
| Bloquear publicação até decisão | Toggle | Sim | Sim |

**Botões do formulário:** `Cancelar` | `Submeter`

### FRM-KNO-09 - Revogar Conhecimento

**Módulo:** Knowledge Center  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Revogar`  

Retirar uma fonte do runtime sem apagar histórico/evidência.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Fonte | Read-only | Sistema | — |
| Motivo | Select | Sim | — |
| Justificação | Textarea | Sim | — |
| Data efectiva | DateTime | Sim | Agora |
| Substituída por | Entity picker | Não | — |
| Bloquear tasks dependentes | Toggle | Sim | Sim |
| Notificar Employees afectados | Toggle | Não | Sim |

**Botões do formulário:** `Cancelar` | `Revogar`

### FRM-KNO-10 - Reavaliar Necessidade de Conhecimento

**Módulo:** Knowledge Necessity  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Reavaliar`  

Recalcular decisão native-vs-source para task/provider/model.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Competência / Task Type | Entity picker | Sim | — |
| Employee | Entity picker | Não | — |
| Provider/model | Select | Sim | — |
| Fonte(s) | Multi-select | Não | — |
| Recalcular novelty/overlap | Toggle | Sim | Sim |
| Forçar MNCA recente | Toggle | Não | — |
| Motivo | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Reavaliar`

### FRM-KNO-11 - Executar Teste MNCA

**Módulo:** MNCA-500  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Executar Teste`  

Testar capacidade nativa real de um provider/model/config sem RAG/tools quando esse é o objectivo.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Competência | Entity picker | Sim | — |
| Subcompetência | Entity picker | Não | — |
| Task Type | Entity picker | Não | — |
| Provider | Select | Sim | — |
| Modelo | Select | Sim | — |
| Configuração / reasoning | Select | Não | — |
| Test suite | Entity picker | Sim | — |
| N.º de casos | Numeric | Não | — |
| Jurisdicção | Select | Não | — |
| Desactivar RAG | Toggle | Sim | Sim |
| Desactivar tools | Toggle | Sim | Sim |
| Modo | Select | Sim | REAL_API para prova real. |
| Evaluator | Select | Sim | — |

**Botões do formulário:** `Cancelar` | `Executar MNCA`

### FRM-KNO-12 - Criar Knowledge Gap

**Módulo:** MNCA / Knowledge  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Gap`  

Registar lacuna observada e requisito de reforço.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Competência | Entity picker | Sim | — |
| Subcompetência | Entity picker | Não | — |
| Score observado | Numeric | Sim | — |
| Score requerido | Numeric | Sim | — |
| Padrões de erro | Textarea/Tags | Sim | — |
| Tipo de gap | Select | Sim | Factual, procedure, update, tool, company-specific, model-capability. |
| Conhecimento requerido | Textarea | Sim | — |
| Preferred source | Select/Text | Não | — |
| Employees afectados | Multi-select | Não | — |
| Task Types afectados | Multi-select | Não | — |
| Prioridade | Select | Sim | — |
| Owner | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Criar Gap`

### FRM-KNO-13 - Bloquear Task Type por Conhecimento/Competência

**Módulo:** Eligibility  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Bloquear Task Type`  

Bloquear execução quando não há fonte, competência ou certificação adequada.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Task Type | Entity picker | Sim | — |
| Employee(s) | Multi-select | Não | — |
| Motivo | Select | Sim | — |
| Detalhe | Textarea | Sim | — |
| Scope | Select | Sim | Global, provider/model, company, jurisdiction. |
| Effective at | DateTime | Sim | — |
| Até | DateTime | Não | — |
| Owner | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Bloquear`

### FRM-KNO-14 - Aprovar Execução com Supervisão

**Módulo:** Eligibility  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Aprovar Supervisão`  

Autorizar tarefa/competência em modo supervisionado dentro de limites definidos.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Employee / Task Type | Entity picker | Sim | — |
| Supervisor | User picker | Sim | — |
| Nível de supervisão | Select | Sim | — |
| Autonomia máxima | Select | Sim | — |
| Validade | DateTime | Não | — |
| Condições adicionais | Textarea | Não | — |
| Requer aprovação de output | Toggle | Sim | Sim |

**Botões do formulário:** `Cancelar` | `Aprovar Supervisão`

### FRM-KNO-15 - Criar Release Regulatório / Knowledge

**Módulo:** Regulatory Watch  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Release`  

Agrupar mudanças aprovadas numa release versionada de conhecimento/policies.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Release ID / nome | Text | Sim | — |
| Mudanças incluídas | Multi-select | Sim | — |
| Resumo | Textarea | Sim | — |
| Data efectiva | DateTime | Sim | — |
| Employees impactados | Read-only/Computed | Sistema | — |
| Testes requeridos | Multi-select | Sim | — |
| Approver(s) | User picker | Sim | — |
| Rollout | Select | Sim | — |
| Rollback target | Version picker | Não | — |

**Botões do formulário:** `Cancelar` | `Criar Release`

### FRM-KNO-16 - Resolver Conflito de Conhecimento / Política

**Módulo:** Knowledge Governance  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Resolver Conflito`  

Resolver conflito entre fontes ou política interna vs norma aplicável sem escolha silenciosa.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Conflito | Read-only | Sistema | — |
| Fonte A | Read-only | Sistema | — |
| Fonte B | Read-only | Sistema | — |
| Tipo de conflito | Select | Sim | — |
| Decisão | Select | Sim | A prevalece, B prevalece, coexistem por scope, escalar. |
| Fundamentação | Textarea | Sim | — |
| Scope da decisão | Select | Sim | — |
| Reviewer | User picker | Sim | — |
| Approver | User picker | Sim | — |
| Retestar afectados | Toggle | Sim | Sim |

**Botões do formulário:** `Cancelar` | `Resolver`

### FRM-TRN-01 - Atribuir Formação

**Módulo:** Training Center  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Atribuir Formação`  

Atribuir currículo, competência ou remediation a Employees.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Employees | Multi-select | Sim | — |
| Curriculum / competência | Entity picker | Sim | — |
| Objectivo | Textarea | Não | — |
| Data de início | Date | Não | — |
| Prazo | Date | Não | — |
| Casos/exercícios | Multi-select | Não | — |
| Evaluator | User/Engine picker | Não | — |
| Score mínimo | Numeric | Não | — |
| Requer benchmark humano | Toggle | Não | — |

**Botões do formulário:** `Cancelar` | `Atribuir`

### FRM-TRN-02 - Avaliar Exercício / Competência

**Módulo:** Training / Quality  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Avaliar`  

Registar avaliação estruturada e evidência.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Employee | Read-only/Entity | Sim | — |
| Exercício / task | Entity picker | Sim | — |
| Rubrica | Entity picker | Sim | — |
| Scores por critério | Rubric grid | Sim | — |
| Critical failures | Multi-select | Não | — |
| Feedback | Textarea | Sim | — |
| Resultado | Select | Sim | PASS, SUPERVISION, RETRAIN, FAIL. |
| Evidence refs | Multi-select/File | Não | — |

**Botões do formulário:** `Cancelar` | `Guardar Avaliação`

### FRM-TRN-03 - Criar Remediation

**Módulo:** Training / Reliability  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Remediation`  

Definir plano de recuperação após falha.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Employee(s) | Multi-select | Sim | — |
| Gap / failure | Entity picker | Sim | — |
| Root cause | Select | Sim | — |
| Acções | List builder | Sim | — |
| Knowledge reinforcement | Entity picker | Não | — |
| Exercícios | Multi-select | Não | — |
| Modelo/provider alternativo | Select | Não | — |
| Prazo | Date | Não | — |
| Owner | User picker | Sim | — |
| Retest suite | Entity picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Criar Plano`

### FRM-TRN-04 - Emitir Passport

**Módulo:** Training / Competency  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Emitir Passport`  

Emitir passaporte de prontidão/competência com scope e limitações.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Employee | Entity picker | Sim | — |
| Tipo de passport | Select | Sim | — |
| Competências incluídas | Multi-select | Sim | — |
| Provider/model scope | Multi-select | Não | — |
| Jurisdicções | Multi-select | Não | — |
| Task Types | Multi-select | Não | — |
| Limitações | Textarea | Não | — |
| Validade | Date | Não | — |
| Evidence set | Multi-select | Sim | — |
| Aprovador | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Emitir Passport`

### FRM-REL-01 - Abrir Incidente / Incident

**Módulo:** Reliability & Operations  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Abrir Incidente`, `Abrir Incident`  

Registar falha operacional, de qualidade, segurança ou conector.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Título | Text | Sim | — |
| Tipo | Select | Sim | — |
| Severidade | Select | Sim | — |
| Empresa / Tenant | Entity context | Sim | — |
| Employee | Entity picker | Não | — |
| Task / execution | Entity picker | Não | — |
| Descrição | Textarea | Sim | — |
| Impacto | Textarea | Sim | — |
| Evidência | File/Multi-select | Não | — |
| Owner | User picker | Sim | — |
| Mitigação imediata | Textarea | Não | — |
| Bloquear operação afectada | Toggle | Não | — |

**Botões do formulário:** `Cancelar` | `Abrir Incidente`

### FRM-REL-02 - Criar Regression Case

**Módulo:** Reliability  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Regression Case`  

Transformar uma falha em caso de regressão reexecutável.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Incidente / failure source | Entity picker | Sim | — |
| Nome do caso | Text | Sim | — |
| Input snapshot | Entity/File | Sim | — |
| Expected result | Textarea/Schema | Sim | — |
| Critical assertions | Checklist builder | Sim | — |
| Employees afectados | Multi-select | Não | — |
| Providers/models | Multi-select | Não | — |
| Executar em CI | Toggle | Não | — |
| Owner | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Criar Caso`

### FRM-REL-03 - Suspender Certificação

**Módulo:** Reliability / Certification  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Suspender Certificação`  

Suspender uma certificação sem eliminar histórico.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Certificação | Entity picker | Sim | — |
| Motivo | Select | Sim | — |
| Descrição | Textarea | Sim | — |
| Scope suspenso | Select | Sim | — |
| Effective at | DateTime | Sim | — |
| Retest requerido | Toggle | Sim | Sim |
| Plano de remediation | Entity picker | Não | — |
| Aprovador | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Suspender`

### FRM-QLT-01 - Classificar Feedback

**Módulo:** CAQRS  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Classificar Feedback`  

Separar erro objectivo, preferência e pedido de alteração.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Feedback | Read-only/Text | Sim | — |
| Output / task | Entity picker | Sim | — |
| Classificação | Select | Sim | ERROR, PREFERENCE, CHANGE_REQUEST, ACCEPTANCE. |
| Severidade | Select | Condicional | — |
| Área afectada | Multi-select | Não | — |
| Preferência reutilizável | Toggle | Não | — |
| Comentário do revisor | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Classificar`

### FRM-QLT-02 - Confirmar Preferência

**Módulo:** CAQRS  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Confirmar Preferência`  

Guardar preferência do cliente de forma explícita e scoped.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Preferência detectada | Textarea | Sim | — |
| Empresa / Tenant | Read-only | Sistema | — |
| Scope | Select | Sim | Empresa, departamento, utilizador, document type. |
| Exemplo aprovado | Entity/File | Não | — |
| Aplicar automaticamente | Toggle | Não | — |
| Validade / revisão | Date | Não | — |
| Confirmado por | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Confirmar`

### FRM-CERT-01 - Iniciar Validação / Executar Suite

**Módulo:** Certification  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Iniciar Validação`, `Executar Suite`, `Recertificar`  

Configurar ciclo de validação individual ou em wave.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Employees | Multi-select | Sim | — |
| Suite | Multi-select | Sim | Functional, E2E, Security, Shadow, Benchmark, Reliability. |
| Ambiente | Select | Sim | — |
| Providers/models | Multi-select | Não | — |
| Datasets/cases | Multi-select | Não | — |
| Human benchmark | Toggle | Não | — |
| Security red team | Toggle | Não | — |
| Evidence mode | Select | Sim | REAL_API quando aplicável. |
| Wave / batch | Text/Select | Não | — |
| Reviewer | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Iniciar Validação`

### FRM-CERT-02 - Decisão de Certificação

**Módulo:** Certification  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Certificar`, `Reprovar`  

Registar decisão formal com scope, limitações e evidência.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Employee | Entity picker | Sim | — |
| Decisão | Radio | Sim | CERTIFY / FAIL. |
| Approved autonomy | Select | Condicional | — |
| Task Types válidos | Multi-select | Condicional | — |
| Providers/models válidos | Multi-select | Não | — |
| Jurisdicções | Multi-select | Não | — |
| Limitações | Textarea | Não | — |
| Validade | Date | Não | — |
| Evidence refs | Multi-select | Sim | — |
| Aprovador | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Registar Decisão`

### FRM-LAB-01 - Ligar Fonte / Executar Caso

**Módulo:** OTCTEC  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Ligar Fonte`, `Executar Caso`  

Configurar fonte/dataset para caso operacional de laboratório.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Tenant de teste | Entity picker | Sim | — |
| Employee | Entity picker | Sim | — |
| Caso | Entity picker | Sim | — |
| Fonte / conector | Entity picker | Sim | — |
| Modo de acesso | Select | Sim | Read-only recomendado. |
| Input snapshot | Toggle | Sim | Sim |
| Shadow mode | Toggle | Não | — |
| Expected output / golden case | Entity picker | Não | — |
| Reviewer | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Executar Caso`

### FRM-PILOT-01 - Criar Piloto Empresarial

**Módulo:** Enterprise Pilot  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Iniciar Piloto`, `Criar Piloto`  

Definir piloto real controlado antes de produção plena.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Empresa / Tenant | Entity picker | Sim | — |
| Employee | Entity picker | Sim | — |
| Objectivo | Textarea | Sim | — |
| Expected business outcome | Textarea | Sim | — |
| Scope | Textarea | Sim | — |
| Out of scope | Textarea | Não | — |
| Supervisor | User picker | Sim | — |
| Autonomia | Select | Sim | L1/L2 por defeito inicial. |
| Supervision level | Select | Sim | — |
| Dados permitidos | Multi-select | Sim | — |
| Conectores | Multi-select | Não | — |
| Critérios de sucesso | List builder | Sim | — |
| Prazo | Date | Não | — |
| Delivery channels | Multi-select | Não | — |

**Botões do formulário:** `Cancelar` | `Criar Piloto`

### FRM-PILOT-02 - Encerrar Piloto

**Módulo:** Enterprise Pilot  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Encerrar Piloto`  

Encerrar piloto com decisão e próximos passos.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Piloto | Read-only | Sistema | — |
| Resultado | Select | Sim | PASS, PASS_WITH_RESTRICTIONS, FAIL, EXTEND. |
| Resumo | Textarea | Sim | — |
| KPIs observados | Metric grid | Não | — |
| Problemas abertos | Multi-select | Não | — |
| Decisão de activação | Select | Sim | — |
| Autonomia aprovada | Select | Condicional | — |
| Plano de melhoria | Textarea | Não | — |
| Aprovadores | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Encerrar`

### FRM-DOC-01 - Gerar Documento

**Módulo:** Document Studio  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Gerar Documento`  

Criar work product formal usando serviço central de documentos.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Fonte do conteúdo | Select/Entity | Sim | Task, output, texto, dataset. |
| Tipo de documento | Select | Sim | — |
| Título | Text | Sim | — |
| Formatos | Multi-select | Sim | DOCX, PDF, XLSX, PPTX. |
| Template | Entity picker | Não | — |
| Brand Pack | Entity picker | Não | — |
| Signatário | Entity picker | Não | — |
| Nome do ficheiro | Text | Não | — |
| Idioma | Select | Não | — |
| Incluir anexos | Toggle | Não | — |
| Exigir aprovação | Toggle | Não | — |
| Delivery após aprovação | Select | Não | — |

**Botões do formulário:** `Cancelar` | `Gerar`

### FRM-DOC-02 - Escolher Template

**Módulo:** Document Studio  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Escolher Template`  

Seleccionar template compatível com empresa, documento e formato.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Tipo de documento | Select | Sim | — |
| Empresa / Brand Pack | Entity picker | Sim | — |
| Formato | Select | Sim | — |
| Template | Gallery picker | Sim | — |
| Versão | Version picker | Sim | — |
| Pré-visualização | Read-only preview | Sistema | — |

**Botões do formulário:** `Cancelar` | `Aplicar Template`

### FRM-DOC-03 - Entregar Documento / Output

**Módulo:** Delivery Router  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Entregar`, `Enviar por WhatsApp`, `Enviar por Email`  

Definir canal e destinatário para entrega auditável.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Output / ficheiro | Entity picker | Sim | — |
| Canal | Select | Sim | Download, Email, WhatsApp, Drive, DMS, Print. |
| Destinatário | Contact/Entity picker | Condicional | — |
| Assunto / mensagem | Text/Textarea | Não | — |
| Pasta destino | Folder picker | Condicional | — |
| Exigir aprovação | Toggle | Não | — |
| Agendar envio | DateTime | Não | — |
| Tracking / receipt | Toggle | Não | Sim |

**Botões do formulário:** `Cancelar` | `Entregar`

### FRM-DOC-04 - Adicionar Logo / Asset

**Módulo:** Brand Governance  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Adicionar Logo`  

Adicionar activo de marca aprovado.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Empresa | Entity picker | Sim | — |
| Tipo de asset | Select | Sim | Logo principal, secundário, selo, assinatura, ícone. |
| Ficheiro | File | Sim | — |
| Nome | Text | Sim | — |
| Uso permitido | Multi-select | Sim | — |
| Fundo recomendado | Select | Não | — |
| Data efectiva | Date | Não | — |
| Owner | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Adicionar Asset`

### FRM-DOC-05 - Novo Template de Documento

**Módulo:** Brand Governance  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Novo Template`  

Criar template versionado com slots, branding e regras de uso.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Nome | Text | Sim | — |
| Tipo de documento | Select | Sim | — |
| Formato | Select | Sim | — |
| Ficheiro base / editor | File/Template editor | Sim | — |
| Brand Pack | Entity picker | Sim | — |
| Campos/variáveis | Schema builder | Não | — |
| Signatário padrão | Entity picker | Não | — |
| Header/footer mode | Select | Não | — |
| Owner | User picker | Sim | — |
| Approver | User picker | Sim | — |
| Versão | Text | Sim | — |

**Botões do formulário:** `Cancelar` | `Guardar Template`

### FRM-DOC-06 - Aprovar Brand Pack

**Módulo:** Brand Governance  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Aprovar Brand Pack`  

Aprovar conjunto de identidade visual para produção.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Brand Pack | Entity picker | Sim | — |
| Versão | Read-only | Sistema | — |
| Itens revistos | Checklist | Sim | — |
| Decisão | Radio | Sim | — |
| Comentário | Textarea | Não | — |
| Data efectiva | DateTime | Sim | — |
| Aprovador | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Aprovar`

### FRM-DOC-07 - Testar Impressão

**Módulo:** Brand Governance  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Testar Impressão`  

Gerar prova física/virtual antes de adoptar stationery.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Template / documento | Entity picker | Sim | — |
| Impressora / perfil | Select | Não | — |
| Tamanho papel | Select | Sim | — |
| Margens | Numeric set | Não | — |
| Escala | Numeric | Não | 100% |
| Incluir marcas de teste | Toggle | Não | — |
| N.º de cópias | Numeric | Não | 1 |

**Botões do formulário:** `Cancelar` | `Gerar Prova`

### FRM-DOC-08 - Definir Signatário

**Módulo:** Brand Governance  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Definir Signatário`  

Registar signatário e regras de uso em documentos.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Nome | Text | Sim | — |
| Cargo | Text | Sim | — |
| Empresa | Entity picker | Sim | — |
| Tipos de documento autorizados | Multi-select | Sim | — |
| Assinatura gráfica | File | Não | — |
| Selo/carimbo | Entity picker | Não | — |
| Validade | Date range | Não | — |
| Requer aprovação antes de uso | Toggle | Não | Sim |

**Botões do formulário:** `Cancelar` | `Guardar Signatário`

### FRM-COM-01 - Compositor de Mensagem

**Módulo:** Omnichannel  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Nova Mensagem`, `Enviar Mensagem`, `Responder`  

Criar mensagem outbound em canal autorizado, com company/tenant e policy checks.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Canal | Select | Sim | WhatsApp, Email, Social DM ou canal suportado. |
| Conta / mailbox | Entity picker | Sim | — |
| Destinatário | Contact picker | Sim | — |
| Assunto | Text | Condicional | Email. |
| Mensagem | Rich textarea | Sim | — |
| Anexos | File picker | Não | — |
| Employee responsável | Entity picker | Sim | — |
| Criar/associar task | Toggle | Sim | Sim para trabalho operacional. |
| Agendar | DateTime | Não | — |
| Requer approval | Toggle | Não | Auto por risco/policy. |

**Botões do formulário:** `Cancelar` | `Enviar`

### FRM-COM-02 - Gerar Relatório Omnicanal

**Módulo:** Omnichannel  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Gerar Relatório`  

Gerar relatório por canal, período, empresa e indicadores.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Tipo | Select | Sim | Daily, weekly, monthly, channel report. |
| Empresa(s) | Multi-select | Sim | — |
| Período | Date range | Sim | — |
| Canais | Multi-select | Sim | — |
| Métricas | Multi-select | Sim | — |
| Detalhe | Select | Sim | — |
| Formato | Multi-select | Sim | — |
| Destinatários | Multi-select | Não | — |

**Botões do formulário:** `Cancelar` | `Gerar Relatório`

### FRM-COM-03 - Criar Draft de Email

**Módulo:** Email Intelligence  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Draft`  

Preparar email sem enviar até aprovação/decisão.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Mailbox | Entity picker | Sim | — |
| Para | Contact picker | Sim | — |
| Cc/Bcc | Contact picker | Não | — |
| Assunto | Text | Sim | — |
| Corpo | Rich text | Sim | — |
| Anexos | File picker | Não | — |
| Task associada | Entity picker | Não | — |
| Template | Entity picker | Não | — |
| Aprovação necessária | Toggle | Não | — |

**Botões do formulário:** `Cancelar` | `Guardar Draft`

### FRM-COM-04 - Marcar Email/Evento como Suspeito

**Módulo:** Email Security  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Marcar Suspeito`  

Classificar phishing/suspicious event e bloquear acções arriscadas.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Mensagem / email | Read-only | Sistema | — |
| Categoria | Select | Sim | PHISHING, SPOOFING, MALWARE, BANK_CHANGE, CREDENTIAL_REQUEST, OTHER. |
| Severidade | Select | Sim | — |
| Justificação | Textarea | Sim | — |
| Bloquear links/anexos | Toggle | Sim | Sim |
| Escalar para segurança | Toggle | Não | Sim |

**Botões do formulário:** `Cancelar` | `Marcar e Bloquear`

### FRM-COM-05 - Criar Post Social

**Módulo:** Social Media  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Post`  

Criar conteúdo social multi-canal respeitando Brand Profile, approvals e políticas.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Campanha | Entity picker | Não | — |
| Canais | Multi-select | Sim | — |
| Objectivo | Select | Sim | — |
| Texto mestre | Rich textarea | Sim | — |
| Media | File picker | Não | — |
| CTA | Text | Não | — |
| Link | URL | Não | — |
| Data/hora | DateTime | Não | — |
| Variantes por canal | Toggle | Não | Sim |
| Aprovação | Select | Não | — |

**Botões do formulário:** `Cancelar` | `Guardar / Agendar`

### FRM-COM-06 - Criar Lead

**Módulo:** Omnichannel / Sales  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Lead`  

Converter contacto/evento em lead rastreável.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Origem | Read-only/Select | Sim | — |
| Nome | Text | Não | — |
| Empresa | Text | Não | — |
| Email | Email | Não | — |
| Telefone | Phone | Não | — |
| Interesse | Textarea | Sim | — |
| Produto / Employee | Entity picker | Não | — |
| Valor estimado | Currency | Não | — |
| Prioridade | Select | Não | — |
| Owner comercial | User/Employee picker | Sim | — |
| Próxima acção | Text/Date | Não | — |

**Botões do formulário:** `Cancelar` | `Criar Lead`

### FRM-COM-07 - Escalar Crise

**Módulo:** Social / Omnichannel  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Escalar Crise`  

Parar resposta automática e escalar evento reputacional ou sensível.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Evento / thread | Entity picker | Sim | — |
| Categoria | Select | Sim | — |
| Severidade | Select | Sim | — |
| Resumo | Textarea | Sim | — |
| Suspender respostas automáticas | Toggle | Sim | Sim |
| Equipa de crise | Multi-select | Sim | — |
| Aprovador | User picker | Sim | — |
| Mensagem provisória | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Activar Escalação`

### FRM-COM-08 - Gerar / Configurar Briefing Executivo

**Módulo:** Executive Briefing  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Gerar Briefing`, `Gerar Agora`  

Gerar briefing consolidado por empresa/canais/nível de detalhe.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Empresas | Multi-select | Sim | — |
| Período | Select/Date range | Sim | Hoje/ontem/custom. |
| Canais | Multi-select | Sim | — |
| Nível de detalhe | Select | Sim | — |
| Incluir custos | Toggle | Não | Sim |
| Incluir riscos/incidentes | Toggle | Não | Sim |
| Incluir ficheiros | Toggle | Não | — |
| Destinos | Multi-select | Não | — |

**Botões do formulário:** `Cancelar` | `Gerar Briefing`

### FRM-CHAT-01 - Chatbox com o AI Employee

**Módulo:** Employee Workspace  
**Superfície:** Workspace persistente  
**Botão(ões) que abre(m):** `Abrir Chat / Conversar com Employee`  

Área persistente de diálogo com o Employee. Todo pedido operacional deve criar ou associar uma task, mantendo conversa, anexos, sources, approvals e outputs no mesmo contexto.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Empresa / Tenant | Context badge | Sistema | Sempre visível no header. |
| Employee Instance | Context badge | Sistema | Nome, AEI, departamento, status. |
| Task actual | Task selector | Não | Nova conversa pode criar nova task. |
| Mensagem | Composer textarea | Sim | — |
| Anexos | Attachment button | Não | — |
| Fontes autorizadas | Source picker | Não | — |
| Output desejado | Multi-select | Não | — |
| Prioridade | Select | Não | NORMAL |
| Prazo | DateTime | Não | — |
| Autonomia | Select | Não | Respeita limite da instância. |
| Enviar como | Select | Sim | Mensagem, Task, Remote Command. |
| Aprovação / escalation | Contextual control | Sistema/Condicional | — |

**Botões do formulário:** `Guardar como rascunho` | `Enviar`

**Segurança:**
- Não expor API keys/secrets no chat.
- Mensagens operacionais externas devem gerar task/event record.
- Cross-tenant sempre bloqueado.

### FRM-COMM-01 - Novo Plano

**Módulo:** Commerce  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Novo Plano`  

Criar plano comercial versionado para Employees/equipas.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Nome | Text | Sim | — |
| Código | Text | Sim | — |
| Tipo | Select | Sim | Employee, team, department, workforce. |
| Preço base | Currency | Sim | — |
| Moeda | Select | Sim | — |
| Periodicidade | Select | Sim | — |
| Entitlements | Entitlement builder | Sim | — |
| Usage incluído | Usage limits | Não | — |
| Overage rules | Pricing builder | Não | — |
| SLA | Select/Text | Não | — |
| Disponível em | Multi-select | Não | — |
| Data efectiva | Date | Sim | — |
| Versão | Text | Sim | — |

**Botões do formulário:** `Cancelar` | `Criar Plano`

### FRM-COMM-02 - Upgrade / Downgrade Subscrição

**Módulo:** Commerce  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Upgrade`, `Downgrade`  

Alterar plano com regras de effective date, proration e entitlements.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Subscrição | Entity picker | Sim | — |
| Plano actual | Read-only | Sistema | — |
| Novo plano | Entity picker | Sim | — |
| Effective date | Select/Date | Sim | — |
| Proration | Select | Sim | — |
| Motivo | Textarea | Não | — |
| Confirmar alteração de entitlements | Checkbox | Sim | — |

**Botões do formulário:** `Cancelar` | `Aplicar Alteração`

### FRM-COMM-03 - Emitir Cotação

**Módulo:** Commerce  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Emitir Cotação`  

Preparar proposta comercial para Employees/teams/plans.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Cliente / empresa | Entity picker | Sim | — |
| Contacto | Contact picker | Sim | — |
| Itens | Line item builder | Sim | — |
| Plano(s) | Entity picker | Não | — |
| Quantidade / instâncias | Numeric | Sim | — |
| Desconto | Percent/Currency | Não | — |
| Impostos | Tax selector | Não | — |
| Validade | Date | Sim | — |
| Condições | Textarea | Não | — |
| Formato | Select | Sim | PDF/DOCX |

**Botões do formulário:** `Cancelar` | `Emitir Cotação`

### FRM-COMM-04 - Emitir Factura

**Módulo:** Billing  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Emitir Factura`  

Criar factura a partir de subscription/usage/order segundo regras do billing engine.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Cliente | Entity picker | Sim | — |
| Subscrição / order | Entity picker | Não | — |
| Período | Date range | Sim | — |
| Itens | Line item builder | Sim | — |
| Moeda | Select | Sim | — |
| Impostos | Tax selector | Não | — |
| Vencimento | Date | Sim | — |
| Notas | Textarea | Não | — |
| Delivery | Select | Não | — |

**Botões do formulário:** `Cancelar` | `Emitir Factura`

### FRM-COMM-05 - Registar Pagamento

**Módulo:** Billing  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Registar Pagamento`  

Registar recebimento e associá-lo a invoice/subscription.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Cliente | Entity picker | Sim | — |
| Factura | Entity picker | Não | — |
| Valor | Currency | Sim | — |
| Moeda | Select | Sim | — |
| Data | DateTime | Sim | — |
| Método | Select | Sim | — |
| Referência | Text | Não | — |
| Comprovativo | File | Não | — |
| Estado | Select | Sim | Received/Pending/Failed. |
| Notas | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Registar`

### FRM-COMM-06 - Reconciliar Pagamento

**Módulo:** Billing  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Reconciliar`  

Associar eventos de pagamento, invoice e ledger.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Pagamento / transacção | Entity picker | Sim | — |
| Factura / item | Entity picker | Sim | — |
| Valor conciliado | Currency | Sim | — |
| Diferença | Read-only/Computed | Sistema | — |
| Tratamento da diferença | Select | Condicional | — |
| Conta / ledger | Entity picker | Sim | — |
| Data de reconciliação | Date | Sim | — |
| Revisor | User picker | Não | — |
| Notas | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Reconciliar`

### FRM-COMM-07 - Reembolsar

**Módulo:** Billing  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Reembolsar`  

Criar refund controlado ligado ao pagamento original.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Pagamento original | Entity picker | Sim | — |
| Valor a reembolsar | Currency | Sim | — |
| Motivo | Select | Sim | — |
| Descrição | Textarea | Sim | — |
| Método / destino | Select | Sim | — |
| Aprovação | User picker | Condicional | — |
| Data efectiva | DateTime | Sim | — |
| Notificar cliente | Toggle | Não | Sim |

**Botões do formulário:** `Cancelar` | `Criar Reembolso`

### FRM-EXP-01 - Nova Análise de Oportunidade

**Módulo:** Workforce Discovery  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Nova Análise`  

Analisar processo empresarial e detectar oportunidades de AI Employees.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Empresa | Entity picker | Sim | — |
| Departamento | Entity picker | Não | — |
| Processo | Text/Entity | Sim | — |
| Descrição actual | Textarea | Sim | — |
| Volume mensal | Numeric | Não | — |
| Horas manuais | Numeric | Não | — |
| Custo actual | Currency | Não | — |
| Erros/rework | Numeric/Percent | Não | — |
| Sistemas envolvidos | Multi-select | Não | — |
| Dados disponíveis | Multi-select | Não | — |
| Restrições | Textarea | Não | — |
| Owner | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Analisar`

### FRM-EXP-02 - Recomendar AI Employee

**Módulo:** Workforce Discovery  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Recomendar Employee`  

Gerar recomendação explicável baseada na oportunidade e capacidades.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Oportunidade | Entity picker | Sim | — |
| Employees candidatos | Multi-select | Não | — |
| Prioridade de critérios | Ranking builder | Não | — |
| Risco máximo | Select | Não | — |
| Orçamento mensal | Currency | Não | — |
| Preferir piloto antes de contratar | Toggle | Não | Sim |
| Notas | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Gerar Recomendação`

### FRM-EXP-03 - Criar Business Case

**Módulo:** Workforce Discovery  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Business Case`  

Calcular cenário estimado com premissas explícitas.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Oportunidade / Employee | Entity picker | Sim | — |
| Current process cost | Currency | Não | — |
| Manual hours | Numeric | Não | — |
| Current cycle time | Numeric/Duration | Não | — |
| Error / rework | Numeric/Percent | Não | — |
| Expected AI task volume | Numeric | Não | — |
| Human review effort | Numeric | Não | — |
| Subscription cost | Currency | Não | — |
| Usage cost | Currency | Não | — |
| Connector cost | Currency | Não | — |
| Expected savings | Currency | Não | — |
| Expected payback | Duration | Não | — |
| Assumptions | Textarea | Sim | — |
| Confidence | Select | Sim | — |

**Botões do formulário:** `Cancelar` | `Criar Business Case`

### FRM-INT-01 - Ligar Sistema / Conector

**Módulo:** Integrações  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Ligar Sistema`, `Ligar Conector`  

Criar conexão company-owned e conceder permissões específicas aos Employees.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Empresa / Tenant | Read-only | Sistema | — |
| Tipo de conector | Select | Sim | Email, WhatsApp, Drive, Primavera, Excel, Banco, DB, API, etc. |
| Nome da conexão | Text | Sim | — |
| Ambiente | Select | Sim | — |
| Método de autenticação | Select | Sim | OAuth, API key, service account, local agent. |
| Credencial / Secret | Secret input | Condicional | Enviado ao backend e guardado em vault; nunca devolvido ao browser. |
| Scopes / permissões | Multi-select | Sim | — |
| Read/Write mode | Select | Sim | — |
| Webhook / callback | URL | Não | — |
| Sync mode | Select | Não | — |
| Testar após guardar | Toggle | Não | Sim |

**Botões do formulário:** `Cancelar` | `Ligar e Testar`

**Segurança:**
- Credenciais nunca ficam em localStorage, frontend bundle, prompt ou logs.

### FRM-INT-02 - Testar / Reautorizar Conector

**Módulo:** Integrações  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Testar`, `Reautorizar`  

Executar health check ou renovar autorização.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Conector | Entity picker | Sim | — |
| Acção | Radio | Sim | Testar / Reautorizar. |
| Scopes a validar | Multi-select | Não | — |
| Operação de teste | Select | Não | Read-only por defeito. |
| Credencial nova | Secret/OAuth flow | Condicional | — |
| Guardar nova autorização | Toggle | Condicional | — |
| Notas | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Executar`

### FRM-SEC-01 - Nova Regra / Policy

**Módulo:** Segurança & Policies  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Nova Regra`  

Criar regra determinística versionada para permissions, approval, budget ou risco.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Nome | Text | Sim | — |
| Scope | Select | Sim | — |
| Evento / condição | Rule builder | Sim | — |
| Operador / expressão | Rule builder | Sim | — |
| Acção | Select | Sim | — |
| Severidade | Select | Não | — |
| Prioridade | Numeric | Não | — |
| Effective at | DateTime | Sim | — |
| Owner | User picker | Sim | — |
| Approver | User picker | Sim | — |
| Versão | Text | Sim | — |

**Botões do formulário:** `Cancelar` | `Criar Regra`

### FRM-SEC-02 - Atribuir Permissão

**Módulo:** Segurança & Permissions  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Atribuir Permissão`  

Conceder permissão efectiva com scope e data de validade.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Subject | Select/Entity | Sim | User, Employee Instance, role, team. |
| Permission | Permission picker | Sim | — |
| Resource scope | Entity/Filter | Sim | — |
| Effect | Read-only/Select | Sim | ALLOW/DENY, deny by default. |
| Valid from | DateTime | Não | — |
| Valid until | DateTime | Não | — |
| Reason | Textarea | Sim | — |
| Approver | User picker | Condicional | — |

**Botões do formulário:** `Cancelar` | `Atribuir`

### FRM-SEC-03 - Rever Risco

**Módulo:** Segurança & Risk  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Rever Risco`  

Alterar classificação de risco com evidência e limites correspondentes.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Objecto | Entity picker | Sim | — |
| Risco actual | Read-only | Sistema | — |
| Novo risco | Select | Sim | — |
| Justificação | Textarea | Sim | — |
| Evidence refs | Multi-select | Sim | — |
| Alterar autonomia máxima | Select | Não | — |
| Alterar approval policy | Entity picker | Não | — |
| Effective at | DateTime | Sim | — |
| Aprovador | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Aplicar Revisão`

### FRM-SEC-04 - Stop / Emergency Stop

**Módulo:** Segurança & Control Plane  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Parar Employee`, `Parar Todos`, `Emergency Stop`  

Interromper operação com prioridade sobre runtime normal.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Scope | Select | Sim | Employee, team, department, organization, global. |
| Alvo | Entity picker | Condicional | — |
| Motivo | Select | Sim | — |
| Descrição | Textarea | Sim | — |
| Cancelar tasks activas | Toggle | Sim | Sim |
| Bloquear novas execuções | Toggle | Sim | Sim |
| Revogar tokens/sessions | Toggle | Não | — |
| MFA / confirmação forte | Security challenge | Sim | — |
| Owner do incidente | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `PARAR AGORA`

### FRM-SEC-05 - Configurar Provider de IA / API Key

**Módulo:** Model Providers  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Configurar API / Provider`  

Guardar configuração do provider no backend/Secrets Vault. A chave nunca deve ficar no frontend.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Empresa / Scope | Select/Entity | Sim | Platform-owned ou BYOK por tenant. |
| Provider | Select | Sim | OpenAI, Gemini, Claude. |
| Credential mode | Radio | Sim | Platform key / BYOK. |
| API key | Secret input | Condicional | Transmitida por HTTPS ao backend; não persistir no browser. |
| Endpoint / região | Select/Text | Não | — |
| Modelo padrão | Select | Não | — |
| Fallback model | Select | Não | — |
| Budget mensal | Currency | Não | — |
| Rate limit interno | Numeric | Não | — |
| Testar conexão | Toggle | Não | Sim |

**Botões do formulário:** `Cancelar` | `Guardar no Vault`

**Segurança:**
- Após guardar, mostrar apenas máscara/secret_ref.
- Nunca usar NEXT_PUBLIC_* para segredos.

### FRM-AUD-01 - Pesquisar Evidência

**Módulo:** Audit & Evidence  
**Superfície:** Search workspace  
**Botão(ões) que abre(m):** `Pesquisar Evidência`  

Localizar tasks, executions, receipts, sources, approvals e hashes.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Pesquisa | Text | Não | — |
| Empresa / Tenant | Entity picker | Não | — |
| Task ID | Text | Não | — |
| Execution ID | Text | Não | — |
| Employee | Entity picker | Não | — |
| Provider/model | Multi-select | Não | — |
| Tipo de receipt | Multi-select | Não | — |
| Período | Date range | Não | — |
| Execution mode | Multi-select | Não | — |
| Hash / source ID | Text | Não | — |

**Botões do formulário:** `Cancelar` | `Pesquisar`

### FRM-AUD-02 - Criar Audit Pack

**Módulo:** Audit & Evidence  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Criar Audit Pack`  

Agrupar evidências numa exportação verificável para auditoria/revisão.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Nome do pack | Text | Sim | — |
| Scope | Select | Sim | — |
| Objectos | Multi-select | Sim | — |
| Período | Date range | Não | — |
| Incluir raw receipts | Toggle | Não | Sim |
| Incluir hashes | Toggle | Não | Sim |
| Incluir anexos | Toggle | Não | — |
| Redacção de dados sensíveis | Toggle | Não | — |
| Formato | Select | Sim | PDF/ZIP/JSON. |
| Aprovador | User picker | Não | — |

**Botões do formulário:** `Cancelar` | `Gerar Audit Pack`

### FRM-SET-01 - Testar Notificação

**Módulo:** Configurações  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Testar Notificação`  

Enviar notificação de teste para validar canal e destinatário.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Canal | Select | Sim | — |
| Destinatário | Contact picker | Sim | — |
| Template | Entity picker | Não | — |
| Mensagem de teste | Textarea | Não | — |
| Empresa | Entity picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Enviar Teste`

### FRM-ADMIN-01 - Adicionar Prompt ao Registry

**Módulo:** Prompt Registry  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Adicionar Prompt`  

Registar novo prompt/módulo com dependências e governação.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| PROMPT_ID | Text | Sim | — |
| Título | Text | Sim | — |
| Versão | Text | Sim | — |
| Módulo | Select/Text | Sim | — |
| Ficheiro | File/Path reference | Sim | — |
| Dependências | Multi-select | Não | — |
| Substitui | Multi-select | Não | — |
| Estado | Select | Sim | — |
| Owner | User picker | Sim | — |
| Ordem arquitectural | Text/Select | Sim | — |
| Notas | Textarea | Não | — |

**Botões do formulário:** `Cancelar` | `Adicionar ao Registry`

### FRM-ADMIN-02 - Marcar Prompt como Substituído

**Módulo:** Prompt Registry  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Marcar Substituído`  

Registar supersession sem apagar histórico.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Prompt antigo | Entity picker | Sim | — |
| Substituído por | Entity picker | Sim | — |
| Effective at | DateTime | Sim | — |
| Motivo | Textarea | Sim | — |
| Partes ainda reutilizáveis | Textarea | Não | — |
| Impacto / módulos afectados | Multi-select | Não | — |
| Aprovador | User picker | Sim | — |

**Botões do formulário:** `Cancelar` | `Marcar Substituído`

### FRM-G-05 - Confirmação com Motivo

**Módulo:** Global  
**Superfície:** Modal  
**Botão(ões) que abre(m):** `Arquivar`, `Restaurar Defaults`  

Confirmar alteração simples mantendo motivo e audit trail quando necessário.

| Campo | Tipo | Obrigatório | Valor/Regra |
|---|---|---:|---|
| Objecto | Read-only | Sistema | — |
| Acção | Read-only | Sistema | — |
| Motivo / comentário | Textarea | Não | — |
| Confirmar | Checkbox | Sim | — |

**Botões do formulário:** `Cancelar` | `Confirmar`

## 4. Matriz de cobertura de todos os botões principais do catálogo

Foram encontrados **188 botões únicos** nos 44 ecrãs do catálogo. A tabela abaixo indica se o botão abre formulário, usa formulário genérico ou é uma acção/view sem preenchimento.

| Botão | Comportamento | Formulário |
|---|---|---|
| Novo Pedido | FORMULÁRIO / MODAL | FRM-G-01 |
| Contratar Employee | FORMULÁRIO / MODAL | FRM-ORG-06 |
| Adicionar Conhecimento | FORMULÁRIO / MODAL | FRM-KNO-01 |
| Ver Aprovações | ACÇÃO DIRECTA / VIEW | — |
| Gerar Briefing | FORMULÁRIO / MODAL | FRM-COM-08 |
| Comando Rápido | FORMULÁRIO / MODAL | FRM-G-01 |
| Pesquisar | FORMULÁRIO / MODAL | FRM-G-02 |
| Trocar Empresa | FORMULÁRIO / MODAL | FRM-G-04 |
| Abrir Notificações | ACÇÃO DIRECTA / VIEW | — |
| Ajuda | ACÇÃO DIRECTA / VIEW | — |
| Criar Empresa | FORMULÁRIO / MODAL | FRM-ORG-01 |
| Importar Empresa | FORMULÁRIO / MODAL | FRM-ORG-02 |
| Abrir Tenant | FORMULÁRIO / MODAL | FRM-G-04 |
| Configurar | FORMULÁRIO / MODAL | FRM-ORG-03 |
| Suspender | FORMULÁRIO / MODAL | FRM-ORG-04 |
| Editar Empresa | FORMULÁRIO / MODAL | FRM-ORG-03 |
| Convidar Utilizador | FORMULÁRIO / MODAL | FRM-ORG-05 |
| Adicionar Employee | FORMULÁRIO / MODAL | FRM-ORG-06 |
| Ligar Sistema | FORMULÁRIO / MODAL | FRM-INT-01 |
| Executar Readiness | FORMULÁRIO / MODAL | FRM-ORG-07 |
| Guardar Rascunho | ACÇÃO DIRECTA / VIEW | — |
| Anterior | ACÇÃO DIRECTA / VIEW | — |
| Seguinte | ACÇÃO DIRECTA / VIEW | — |
| Executar Smoke Test | FORMULÁRIO / MODAL | FRM-ORG-07 |
| Activar | FORMULÁRIO / MODAL | FRM-ORG-08 |
| Pausar | FORMULÁRIO / MODAL | FRM-ORG-09 |
| Retomar | FORMULÁRIO / MODAL | FRM-ORG-09 |
| Reatribuir | FORMULÁRIO / MODAL | FRM-ORG-10 |
| Take Over | FORMULÁRIO / MODAL | FRM-ORG-10 |
| Parar Todos | FORMULÁRIO / MODAL | FRM-SEC-04 |
| Ver Employee | ACÇÃO DIRECTA / VIEW | — |
| Comparar | FORMULÁRIO / MODAL | FRM-G-04 |
| Adicionar à Equipa | FORMULÁRIO / MODAL | FRM-ORG-10 |
| Contratar | FORMULÁRIO / MODAL | FRM-ORG-06 |
| Iniciar Piloto | FORMULÁRIO / MODAL | FRM-PILOT-01 |
| Nova Tarefa | FORMULÁRIO / MODAL | FRM-TASK-01 |
| Retestar | FORMULÁRIO / MODAL | FRM-RUN-03 |
| Abrir Passaporte | ACÇÃO DIRECTA / VIEW | — |
| Criar Task Type | FORMULÁRIO / MODAL | FRM-ROLE-01 |
| Criar SOP | FORMULÁRIO / MODAL | FRM-ROLE-02 |
| Editar Role Pack | FORMULÁRIO / MODAL | FRM-ROLE-03 |
| Publicar Versão | FORMULÁRIO / MODAL | FRM-ROLE-04 |
| Comparar Versões | FORMULÁRIO / MODAL | FRM-G-04 |
| Atribuir | FORMULÁRIO / MODAL | FRM-TASK-02 |
| Anexar | FORMULÁRIO / MODAL | FRM-TASK-03 |
| Agendar | FORMULÁRIO / MODAL | FRM-TASK-04 |
| Filtrar | FORMULÁRIO / MODAL | FRM-G-02 |
| Exportar | FORMULÁRIO / MODAL | FRM-G-03 |
| Executar | FORMULÁRIO / MODAL | FRM-RUN-01 |
| Fornecer Dados | FORMULÁRIO / MODAL | FRM-TASK-03 |
| Aprovar | FORMULÁRIO / MODAL | FRM-APR-01 |
| Pedir Revisão | FORMULÁRIO / MODAL | FRM-TASK-05 |
| Cancelar | FORMULÁRIO / MODAL | FRM-TASK-06 |
| Executar Agora | FORMULÁRIO / MODAL | FRM-RUN-01 |
| Trocar Modelo | FORMULÁRIO / MODAL | FRM-RUN-02 |
| Testar Fallback | FORMULÁRIO / MODAL | FRM-RUN-03 |
| Ver Contexto | ACÇÃO DIRECTA / VIEW | — |
| Abrir Receipt | ACÇÃO DIRECTA / VIEW | — |
| Filtrar REAL_API | ACÇÃO DIRECTA / VIEW | — |
| Filtrar MOCK | ACÇÃO DIRECTA / VIEW | — |
| Revalidar | FORMULÁRIO / MODAL | FRM-RUN-03 |
| Abrir Evidência | ACÇÃO DIRECTA / VIEW | — |
| Exportar Receipt | FORMULÁRIO / MODAL | FRM-G-03 |
| Novo Comando | FORMULÁRIO / MODAL | FRM-RCODE-01 |
| Aprovar Comando | FORMULÁRIO / MODAL | FRM-APR-01 |
| Reprocessar | FORMULÁRIO / MODAL | FRM-RUN-01 |
| Registar Dispositivo | FORMULÁRIO / MODAL | FRM-RCODE-02 |
| Rejeitar | FORMULÁRIO / MODAL | FRM-APR-01 |
| Modificar | FORMULÁRIO / MODAL | FRM-APR-02 |
| Escalar | FORMULÁRIO / MODAL | FRM-APR-03 |
| Upload em Lote | FORMULÁRIO / MODAL | FRM-KNO-02 |
| Adicionar Fonte Oficial | FORMULÁRIO / MODAL | FRM-KNO-03 |
| Criar Procedimento | FORMULÁRIO / MODAL | FRM-KNO-04 |
| Nova Versão | FORMULÁRIO / MODAL | FRM-KNO-07 |
| Escolher Ficheiro | FORMULÁRIO / MODAL | FRM-TASK-03 |
| Processar | ACÇÃO DIRECTA / VIEW | — |
| Submeter à Revisão | FORMULÁRIO / MODAL | FRM-KNO-08 |
| Publicar | FORMULÁRIO / MODAL | FRM-ROLE-04 |
| Abrir Ficheiro | ACÇÃO DIRECTA / VIEW | — |
| Recalcular Hash | ACÇÃO DIRECTA / VIEW | — |
| Carregar Nova Versão | FORMULÁRIO / MODAL | FRM-KNO-07 |
| Revogar | FORMULÁRIO / MODAL | FRM-KNO-09 |
| Ver Linhagem | ACÇÃO DIRECTA / VIEW | — |
| Reavaliar | FORMULÁRIO / MODAL | FRM-KNO-10 |
| Comparar Modelos | FORMULÁRIO / MODAL | FRM-G-04 |
| Forçar Revisão | FORMULÁRIO / MODAL | FRM-KNO-08 |
| Ver Motivo | ACÇÃO DIRECTA / VIEW | — |
| Executar Teste | FORMULÁRIO / MODAL | FRM-KNO-11 |
| Comparar Providers | FORMULÁRIO / MODAL | FRM-G-04 |
| Criar Gap | FORMULÁRIO / MODAL | FRM-KNO-12 |
| Exportar Baseline | FORMULÁRIO / MODAL | FRM-G-03 |
| Bloquear Task Type | FORMULÁRIO / MODAL | FRM-KNO-13 |
| Aprovar Supervisão | FORMULÁRIO / MODAL | FRM-KNO-14 |
| Exportar Passaporte | FORMULÁRIO / MODAL | FRM-G-03 |
| Ver Mudança | ACÇÃO DIRECTA / VIEW | — |
| Analisar Impacto | ACÇÃO DIRECTA / VIEW | — |
| Criar Release | FORMULÁRIO / MODAL | FRM-KNO-15 |
| Adicionar Política | FORMULÁRIO / MODAL | FRM-KNO-05 |
| Extrair Regras | ACÇÃO DIRECTA / VIEW | — |
| Resolver Conflito | FORMULÁRIO / MODAL | FRM-KNO-16 |
| Atribuir Formação | FORMULÁRIO / MODAL | FRM-TRN-01 |
| Executar Exercício | FORMULÁRIO / MODAL | FRM-LAB-01 |
| Avaliar | FORMULÁRIO / MODAL | FRM-TRN-02 |
| Criar Remediation | FORMULÁRIO / MODAL | FRM-TRN-03 |
| Emitir Passport | FORMULÁRIO / MODAL | FRM-TRN-04 |
| Abrir Incidente | FORMULÁRIO / MODAL | FRM-REL-01 |
| Criar Regression Case | FORMULÁRIO / MODAL | FRM-REL-02 |
| Recalcular | ACÇÃO DIRECTA / VIEW | — |
| Comparar Contextos | FORMULÁRIO / MODAL | FRM-G-04 |
| Suspender Certificação | FORMULÁRIO / MODAL | FRM-REL-03 |
| Aceitar | FORMULÁRIO / MODAL | FRM-APR-01 |
| Classificar Feedback | FORMULÁRIO / MODAL | FRM-QLT-01 |
| Confirmar Preferência | FORMULÁRIO / MODAL | FRM-QLT-02 |
| Iniciar Validação | FORMULÁRIO / MODAL | FRM-CERT-01 |
| Executar Suite | FORMULÁRIO / MODAL | FRM-CERT-01 |
| Reprovar | FORMULÁRIO / MODAL | FRM-CERT-02 |
| Certificar | FORMULÁRIO / MODAL | FRM-CERT-02 |
| Recertificar | FORMULÁRIO / MODAL | FRM-CERT-01 |
| Criar Tenant de Teste | FORMULÁRIO / MODAL | FRM-ORG-11 |
| Ligar Fonte | FORMULÁRIO / MODAL | FRM-LAB-01 |
| Executar Caso | FORMULÁRIO / MODAL | FRM-LAB-01 |
| Comparar Resultado | FORMULÁRIO / MODAL | FRM-G-04 |
| Promover | FORMULÁRIO / MODAL | FRM-ORG-08 |
| Criar Piloto | FORMULÁRIO / MODAL | FRM-PILOT-01 |
| Designar Supervisor | FORMULÁRIO / MODAL | FRM-ORG-10 |
| Aprovar Delivery | FORMULÁRIO / MODAL | FRM-APR-01 |
| Encerrar Piloto | FORMULÁRIO / MODAL | FRM-PILOT-02 |
| Gerar Documento | FORMULÁRIO / MODAL | FRM-DOC-01 |
| Escolher Template | FORMULÁRIO / MODAL | FRM-DOC-02 |
| Pré-visualizar | ACÇÃO DIRECTA / VIEW | — |
| Validar | FORMULÁRIO / MODAL | FRM-ORG-07 |
| Entregar | FORMULÁRIO / MODAL | FRM-DOC-03 |
| Adicionar Logo | FORMULÁRIO / MODAL | FRM-DOC-04 |
| Novo Template | FORMULÁRIO / MODAL | FRM-DOC-05 |
| Aprovar Brand Pack | FORMULÁRIO / MODAL | FRM-DOC-06 |
| Testar Impressão | FORMULÁRIO / MODAL | FRM-DOC-07 |
| Definir Signatário | FORMULÁRIO / MODAL | FRM-DOC-08 |
| Nova Mensagem | FORMULÁRIO / MODAL | FRM-COM-01 |
| Criar Tarefa | FORMULÁRIO / MODAL | FRM-TASK-01 |
| Filtrar Canal | FORMULÁRIO / MODAL | FRM-G-02 |
| Abrir Inbox | ACÇÃO DIRECTA / VIEW | — |
| Gerar Relatório | FORMULÁRIO / MODAL | FRM-COM-02 |
| Enviar Mensagem | FORMULÁRIO / MODAL | FRM-COM-01 |
| Ver Anexos | FORMULÁRIO / MODAL | FRM-TASK-03 |
| Responder | FORMULÁRIO / MODAL | FRM-COM-01 |
| Criar Draft | FORMULÁRIO / MODAL | FRM-COM-03 |
| Converter em Tarefa | FORMULÁRIO / MODAL | FRM-TASK-01 |
| Aprovar Envio | FORMULÁRIO / MODAL | FRM-APR-01 |
| Marcar Suspeito | FORMULÁRIO / MODAL | FRM-COM-04 |
| Criar Post | FORMULÁRIO / MODAL | FRM-COM-05 |
| Criar Lead | FORMULÁRIO / MODAL | FRM-COM-06 |
| Escalar Crise | FORMULÁRIO / MODAL | FRM-COM-07 |
| Gerar Agora | FORMULÁRIO / MODAL | FRM-COM-08 |
| Enviar por WhatsApp | FORMULÁRIO / MODAL | FRM-DOC-03 |
| Enviar por Email | FORMULÁRIO / MODAL | FRM-DOC-03 |
| Configurar Horário | FORMULÁRIO / MODAL | FRM-TASK-04 |
| Arquivar | FORMULÁRIO / MODAL | FRM-G-05 |
| Novo Plano | FORMULÁRIO / MODAL | FRM-COMM-01 |
| Upgrade | FORMULÁRIO / MODAL | FRM-COMM-02 |
| Downgrade | FORMULÁRIO / MODAL | FRM-COMM-02 |
| Emitir Cotação | FORMULÁRIO / MODAL | FRM-COMM-03 |
| Emitir Factura | FORMULÁRIO / MODAL | FRM-COMM-04 |
| Registar Pagamento | FORMULÁRIO / MODAL | FRM-COMM-05 |
| Reconciliar | FORMULÁRIO / MODAL | FRM-COMM-06 |
| Reembolsar | FORMULÁRIO / MODAL | FRM-COMM-07 |
| Abrir Incident | FORMULÁRIO / MODAL | FRM-REL-01 |
| Nova Análise | FORMULÁRIO / MODAL | FRM-EXP-01 |
| Recomendar Employee | FORMULÁRIO / MODAL | FRM-EXP-02 |
| Criar Business Case | FORMULÁRIO / MODAL | FRM-EXP-03 |
| Ligar Conector | FORMULÁRIO / MODAL | FRM-INT-01 |
| Testar | FORMULÁRIO / MODAL | FRM-INT-02 |
| Reautorizar | FORMULÁRIO / MODAL | FRM-INT-02 |
| Ver Logs | ACÇÃO DIRECTA / VIEW | — |
| Nova Regra | FORMULÁRIO / MODAL | FRM-SEC-01 |
| Atribuir Permissão | FORMULÁRIO / MODAL | FRM-SEC-02 |
| Rever Risco | FORMULÁRIO / MODAL | FRM-SEC-03 |
| Parar Employee | FORMULÁRIO / MODAL | FRM-SEC-04 |
| Emergency Stop | FORMULÁRIO / MODAL | FRM-SEC-04 |
| Pesquisar Evidência | FORMULÁRIO / MODAL | FRM-AUD-01 |
| Ver Hash | ACÇÃO DIRECTA / VIEW | — |
| Criar Audit Pack | FORMULÁRIO / MODAL | FRM-AUD-02 |
| Guardar | ACÇÃO DIRECTA / VIEW | — |
| Testar Notificação | FORMULÁRIO / MODAL | FRM-SET-01 |
| Nova Recorrência | FORMULÁRIO / MODAL | FRM-TASK-04 |
| Desactivar | FORMULÁRIO / MODAL | FRM-ORG-04 |
| Restaurar Defaults | FORMULÁRIO / MODAL | FRM-G-05 |
| Adicionar Prompt | FORMULÁRIO / MODAL | FRM-ADMIN-01 |
| Marcar Substituído | FORMULÁRIO / MODAL | FRM-ADMIN-02 |

## 5. Requisitos adicionais de implementação

1. **Dynamic Forms:** Task Type e Role Pack podem acrescentar campos em runtime conforme `Input Contract`.
2. **Drafts:** formulários longos devem permitir guardar rascunho.
3. **Autosave:** chat, SOP builder, policy editor, document template e business case devem ter autosave controlado.
4. **No duplicate engines:** botões diferentes podem reutilizar o mesmo formulário/engine, conforme a matriz acima.
5. **Secret handling:** secrets entram no frontend apenas como campo transitório e são imediatamente enviados ao backend/vault; nunca reaparecem em payload de leitura.
6. **Audit:** todo submit material deve produzir receipt/audit event.
7. **Accessibility:** labels visíveis, keyboard navigation, focus management, error summary, contraste e estados disabled/loading.
8. **Mobile:** formulários grandes viram full-screen sheets; chatbox mantém composer fixo no fundo.

## 6. Resumo quantitativo

- Formulários / superfícies detalhadas: **103**
- Botões únicos auditados: **188**
- Botões associados a formulário: **161**
- Botões direct/view: **27**
- Chatbox operacional: **incluído como workspace persistente**

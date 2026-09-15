# PROMPT MESTRE DE IMPLEMENTAÇÃO
## AETF-500 — Remoção de Prefixos Técnicos da Interface + Completação dos Formulários
### Simplificar a linguagem visível ao cliente, manter IDs internos no backend e completar todos os formulários da experiência de produto

---

# 0. PAPEL DA IA DE DESENVOLVIMENTO

ACTUE COMO uma equipa sénior composta por:

- Arquitecto Principal de Software;
- Product Designer sénior;
- UX Architect;
- UX Writer;
- Engenheiro Frontend;
- Engenheiro Backend;
- Arquitecto SaaS multi-tenant;
- Arquitecto IAM e Segurança;
- Especialista em Forms UX;
- Especialista em validação de dados;
- Especialista em Knowledge Systems;
- Especialista em Billing/Subscriptions;
- Especialista em Audit & Evidence;
- Engenheiro QA/Test Automation.

A missão é executar uma **refinação de produto e UX** na AI Employee Platform, com dois objectivos centrais:

```text
1. RETIRAR PREFIXOS, IDs E JARGÃO TÉCNICO DA INTERFACE NORMAL

2. COMPLETAR TODOS OS FORMULÁRIOS OPERACIONAIS
   PARA QUE A PLATAFORMA POSSA SER USADA POR CLIENTES REAIS
```

Esta alteração deve preservar a arquitectura técnica existente, a rastreabilidade, os IDs internos, os motores de runtime, knowledge, reliability, certification, billing e audit.

---

# 1. PRINCÍPIO FUNDAMENTAL

Adoptar:

```text
ID TÉCNICO
→ BACKEND / LOGS / TESTES / AUDITORIA / MODO AVANÇADO

NOME HUMANO
→ FRONTEND NORMAL
```

Exemplo:

```text
screen_id = EMP-03
form_id   = FRM-S-03
module_id = MOD-02
```

pode continuar a existir internamente.

Mas o utilizador vê apenas:

```text
Detalhe do AI Employee
Contratar AI Employee
AI Employees
```

---

# 2. PROBLEMA ACTUAL A CORRIGIR

A interface actual apresenta elementos como:

```text
MOD-01
MOD-02
EMP-01
EMP-02
WORK-01
KNOW-01
ADMIN-01
ORG-01
FRM-S-05
CANÓNICO
RolePack
Tenant
Readiness
Runtime
Provisioning
```

Isto é linguagem de arquitectura, não de produto.

O cliente não deve precisar conhecer:

```text
module_id
screen_id
form_id
prompt_id
registry_id
runtime engine name
internal state machine
technical provisioning terminology
```

---

# 3. PREFIXOS A RETIRAR DA INTERFACE NORMAL

Remover da UI visível ao cliente todos os prefixos:

```text
MOD-
EMP-
WORK-
KNOW-
ADMIN-
COMM-
ORG-
FRM-
TBL-
CAT-
MPR-
APP-
RUN-
RCODE-
APR-
TRN-
REL-
QLT-
CERT-
LAB-
PILOT-
DOC-
COMMERCE-
EXP-
INT-
SEC-
AUD-
SET-
```

Também remover badges como:

```text
CANÓNICO
LEGACY
MPR-xxx
FRM-S-xx
```

da experiência normal.

---

# 4. ONDE OS PREFIXOS PODEM CONTINUAR

Permitido apenas em:

```text
backend
database
telemetry
logs
test automation
audit evidence
developer tools
debug view
technical support
Modo Avançado
```

No Modo Avançado pode existir:

```text
ID interno
Screen ID
Form ID
Module ID
Prompt Registry ID
Internal status
Tenant ID
Organization ID
Execution ID
```

---

# 5. MAPA DE RENOMEAÇÃO DOS MÓDULOS

A navegação principal deve ficar:

```text
Início
AI Employees
Trabalho
Conhecimento
Comunicações & Integrações
Empresa & Administração
```

Não mostrar:

```text
MOD-01 INÍCIO
MOD-02 AI EMPLOYEES
MOD-03 TRABALHO
...
```

---

# 6. MAPA DE RENOMEAÇÃO DOS ECRÃS

Transformar:

```text
HOME-01 Início
→ Início

EMP-01 Catálogo (500)
→ Catálogo

EMP-02 Meus Employees
→ Meus AI Employees

EMP-03 Detalhe Employee
→ Detalhe do AI Employee

EMP-04 Equipas & RolePacks
→ Equipas

WORK-01 Chatbox Central
→ Conversas

WORK-02 Tarefas & Status
→ Tarefas

WORK-03 Resultados & Aprovações
→ Resultados & Aprovações

KNOW-01 Knowledge Center
→ Biblioteca de Conhecimento

KNOW-02 Detalhe da Fonte
→ Detalhe da Fonte

COMM-01 Inbox
→ Comunicações

COMM-02 Integrações
→ Integrações

ADMIN-01 Empresa
→ Empresa

ADMIN-02 Utilizadores & Permissões
→ Utilizadores & Permissões

ADMIN-03 Plano & Facturação
→ Plano & Facturação

ADMIN-04 Segurança & Auditoria
→ Segurança & Auditoria

ADMIN-05 Configurações
→ Configurações
```

---

# 7. RETIRAR JARGÃO TÉCNICO DO CLIENTE

Substituir no frontend normal:

```text
Tenant
→ Ambiente Privado
ou ocultar completamente

Readiness
→ Prontidão
ou Estado

Provisioning
→ Configuração Inicial

RolePack
→ Perfil da Função

Runtime
→ Execução

Model Router
→ Selecção de IA

Evidence Gate
→ Verificação de Execução

Knowledge Object
→ Conteúdo Processado
ou ocultar

Source Critical
→ Fonte Obrigatória

Client Source Required
→ Fonte da Empresa Obrigatória

Canonical
→ ocultar
```

---

# 8. TOPBAR SIMPLIFICADA

Eliminar elementos como:

```text
MOD-06 — ADMIN-01 Empresa Legal
```

Mostrar apenas:

```text
MARVINE, LDA
```

e opcionalmente:

```text
Empresa
```

A topbar pode conter:

```text
Empresa actual
Pesquisa
Novo Pedido
Ajuda
Alertas
Perfil
```

---

# 9. PÁGINA "EMPRESAS" SIMPLIFICADA

Título:

```text
Empresas
```

Descrição:

```text
Gerir empresas, utilizadores, AI Employees, integrações e estado operacional.
```

Não usar:

```text
Empresas & Tenants
```

Cards:

```text
Empresas
Activas
Em configuração
Precisam de atenção
```

Não mostrar:

```text
Tenants activos
```

ao utilizador comum.

---

# 10. BOTÃO "CRIAR EMPRESA"

O botão deve chamar-se:

```text
[ Criar Empresa ]
```

Não:

```text
Criar & Provisionar Tenant
Criar & Provisionar Nova Empresa
```

Internamente pode executar:

```text
createOrganization()
createTenant()
createAdminMembership()
createDefaultSettings()
createAuditEvent()
```

---

# 11. NOVO FORMULÁRIO "CRIAR EMPRESA"

Transformar o formulário actual num wizard simples de 3 passos.

---

# 12. PASSO 1 — IDENTIFICAÇÃO DA EMPRESA

Campos:

```text
Razão Social *
Nome Comercial
Forma Jurídica *
NIF / Identificação Fiscal *
País *
Província / Região
Município / Cidade
Sector de Actividade *
Actividade Principal
```

Validações:

```text
Razão Social:
required
min 2
max 180

NIF:
required
normalizar espaços
não aceitar valor vazio
validar formato por jurisdição quando regra existir

País:
required

Sector:
required
```

---

# 13. PASSO 2 — CONTACTOS E ADMINISTRAÇÃO

Campos da empresa:

```text
Email Institucional *
Telefone Principal
Morada
Website
```

Administrador principal:

```text
Nome *
Email *
Telefone
Cargo
```

Regras:

```text
Email do administrador
!=
identidade completa

Nome do administrador é obrigatório.
```

Se o utilizador actual for seleccionado como administrador:

```text
[ Usar os meus dados ]
```

preencher automaticamente.

---

# 14. PASSO 3 — CONFIGURAÇÃO INICIAL

Campos:

```text
Idioma *
Moeda *
Fuso Horário *
Jurisdição *
```

Opcional:

```text
Estrutura inicial da empresa
[ ] Administração
[ ] Financeiro
[ ] Recursos Humanos
[ ] Comercial
[ ] Operações
[ ] Marketing
```

Configuração adicional:

```text
Criar ambiente privado automaticamente
→ sempre ON
→ não precisa ser exibido como opção técnica
```

---

# 15. CONFIRMAÇÃO "CRIAR EMPRESA"

Antes de criar:

```text
Resumo

Razão Social
NIF
País
Sector
Administrador
Moeda
Fuso horário
```

Botões:

```text
[ Voltar ]
[ Criar Empresa ]
```

Após sucesso:

```text
Empresa criada com sucesso.
O ambiente privado foi configurado automaticamente.
```

Botões:

```text
[ Abrir Empresa ]
[ Adicionar AI Employee ]
[ Fazer Depois ]
```

---

# 16. NÃO SOBRECARREGAR FORMULÁRIOS

Princípio:

```text
ESSENCIAL PRIMEIRO
+
DETALHES DEPOIS
```

Não colocar 30 campos num único modal.

Usar:

```text
wizard
tabs
advanced section
conditional fields
smart defaults
```

---

# 17. CATÁLOGO FINAL DE FORMULÁRIOS

A interface simplificada deve possuir formulários principais completos para:

```text
1. Criar / Editar Empresa
2. Convidar Utilizador
3. Contratar AI Employee
4. Configurar AI Employee
5. Novo Pedido
6. Anexar / Fornecer Dados
7. Agendar / Recorrência
8. Aprovar / Rejeitar
9. Adicionar Conhecimento
10. Resolver Problema de Conhecimento
11. Ligar Integração
12. Configurar Canal
13. Configurar Provider de IA
14. Permissões do Utilizador
15. Plano / Subscrição
16. Notificações
17. Branding & Outputs
18. Pausar / Parar
19. Auditoria / Exportar Evidência
20. Preferências da Empresa
```

---

# 18. FORMULÁRIO 01 — CRIAR / EDITAR EMPRESA

## Identificação

```text
Razão Social *
Nome Comercial
Forma Jurídica *
NIF *
País *
Província
Município
Sector de Actividade *
Actividade Principal
```

## Contactos

```text
Email Institucional *
Telefone
Website
Morada
```

## Administrador

```text
Nome *
Email *
Telefone
Cargo
```

## Preferências iniciais

```text
Idioma *
Moeda *
Fuso Horário *
Jurisdição *
```

## Configuração opcional

```text
Departamentos iniciais
Logo
Canal preferido
```

Botões:

```text
Cancelar
Guardar Rascunho
Seguinte
Voltar
Criar Empresa
```

---

# 19. FORMULÁRIO 02 — CONVIDAR UTILIZADOR

Campos:

```text
Nome *
Email *
Telefone
Cargo
Departamento
Perfil de acesso *
Empresas autorizadas *
Pode aprovar?
Pode gerir AI Employees?
Pode gerir conhecimento?
Pode gerir integrações?
Pode ver custos?
Pode ver auditoria?
Data de expiração opcional
```

Perfis sugeridos:

```text
Administrador
Gestor
Supervisor
Aprovador
Operador
Consulta
Auditor
```

Botões:

```text
Cancelar
Enviar Convite
```

---

# 20. FORMULÁRIO 03 — CONTRATAR AI EMPLOYEE

Campos:

```text
Empresa *
AI Employee *
Nome interno
Departamento *
Supervisor *
Plano *
Autonomia *
Nível de risco
Integrações autorizadas
Conhecimento da empresa aplicável
Permissões iniciais
```

Resumo antes de confirmar:

```text
Função
Plano
Departamento
Supervisor
Autonomia
Custo
Permissões
```

Botões:

```text
Cancelar
Guardar Rascunho
Contratar
Contratar e Configurar
```

---

# 21. FORMULÁRIO 04 — CONFIGURAR AI EMPLOYEE

Abas simples:

```text
Geral
Trabalho
Conhecimento
Integrações
Autonomia
IA
```

## Geral

```text
Nome interno
Departamento
Supervisor
Estado
```

## Trabalho

```text
Tipos de tarefa permitidos
Outputs padrão
Prazo padrão
Prioridade padrão
```

## Conhecimento

```text
Fontes da empresa
Fontes obrigatórias
Bibliotecas associadas
```

## Integrações

```text
Drive
Email
WhatsApp
ERP
Excel
Banco
APIs
```

## Autonomia

```text
Só recomendar
Preparar rascunho
Executar com aprovação
Executar automaticamente onde permitido
```

## IA

```text
Provider preferido
Modelo preferido
Fallback
Política de custo
```

---

# 22. FORMULÁRIO 05 — NOVO PEDIDO

Preferir Chatbox.

Campos:

```text
AI Employee *
Pedido *
Anexos
Prioridade
Prazo
Formato de saída
Fonte específica opcional
Canal de entrega opcional
```

Botões:

```text
Enviar
Agendar
Guardar Rascunho
```

O backend determina:

```text
task_type
competencies
knowledge
model
tools
approvals
```

---

# 23. FORMULÁRIO 06 — ANEXAR / FORNECER DADOS

Campos:

```text
Ficheiros *
Descrição
Tipo de dado
Usar só nesta tarefa?
Adicionar à Biblioteca de Conhecimento?
```

Se:

```text
Adicionar à Biblioteca de Conhecimento = SIM
```

abrir fluxo de classificação sem exigir novo upload.

---

# 24. FORMULÁRIO 07 — AGENDAR / RECORRÊNCIA

Campos:

```text
Descrição da tarefa *
AI Employee *
Frequência *
Data/Hora *
Fuso Horário *
Data final
Canal de notificação
Executar mesmo sem utilizador online?
```

Frequências:

```text
Uma vez
Diária
Semanal
Mensal
Personalizada
```

---

# 25. FORMULÁRIO 08 — APROVAR / REJEITAR

Mostrar:

```text
Acção
Employee
Destinatário
Risco
Impacto
Resumo
Snapshot
Evidência
```

Inputs:

```text
Decisão *
Comentário
Motivo da rejeição
Modificar antes de aprovar
```

Botões:

```text
Aprovar
Modificar
Rejeitar
```

---

# 26. FORMULÁRIO 09 — ADICIONAR CONHECIMENTO

Campos:

```text
Tipo *
Entrada *
Título *
Âmbito *
Empresa
Jurisdição
Autoridade / Fonte
Versão
Data efectiva
Data de revisão
Criticidade *
Descrição
```

Tipo:

```text
Manual
Procedimento
Política
Template
Legislação
Regulamento
Norma
Fonte Oficial
Documentação Técnica
Conteúdo Interno
Outro
```

Entrada:

```text
Ficheiro
URL
Texto
```

Botões:

```text
Cancelar
Guardar Rascunho
Processar
```

---

# 27. RESULTADO DO PROCESSAMENTO DE CONHECIMENTO

Mostrar apenas:

```text
Fonte
Estado
Tipo
Versão
Employees afectados
Uso
Problemas
```

Não expor:

```text
chunk IDs
embedding refs
MNCA internals
knowledge object IDs
```

por defeito.

---

# 28. FORMULÁRIO 10 — RESOLVER PROBLEMA DE CONHECIMENTO

Abrir apenas quando necessário.

Problemas:

```text
Fonte desactualizada
Conflito
Fonte obrigatória ausente
Fonte não verificada
Baixa confiança
Revisão necessária
```

Campos:

```text
Problema
Fonte afectada
Acção *
Nova fonte/versão
Justificação *
Aprovador
```

---

# 29. FORMULÁRIO 11 — LIGAR INTEGRAÇÃO

Campos comuns:

```text
Empresa *
Sistema *
Nome da ligação *
Modo *
Conta / Workspace
Escopos
Permissões
```

Modo:

```text
Leitura
Escrita
Leitura e Escrita
```

Autenticação dinâmica:

```text
OAuth
API Key
Service Account
Local Agent
```

Regra:

```text
segredo
→ backend
→ secrets vault
```

---

# 30. FORMULÁRIO 12 — CONFIGURAR CANAL

Aplicável a:

```text
WhatsApp
Email
Redes Sociais
```

Campos:

```text
Empresa *
Canal *
Conta *
Recepção activa
Envio activo
Aprovação obrigatória
Horário
Assinatura / Identidade
Limite de mensagens
Canal de fallback
```

---

# 31. FORMULÁRIO 13 — CONFIGURAR PROVIDER DE IA

Campos:

```text
Provider *
Nome da configuração *
API Key / Credential *
Modelos permitidos
Modelo principal *
Fallback
Limite mensal
Política de custo
Activo
```

Após guardar:

```text
API Key
→ nunca devolver completa
```

Mostrar:

```text
••••••••••••8XQ2
```

Nunca:

```text
NEXT_PUBLIC_API_KEY
localStorage
sessionStorage
logs
model context
```

---

# 32. FORMULÁRIO 14 — PERMISSÕES DO UTILIZADOR

Campos:

```text
Utilizador *
Empresa *
Perfil *
Departamentos
AI Employees permitidos
Pode aprovar
Pode gerir conhecimento
Pode gerir integrações
Pode gerir utilizadores
Pode ver custos
Pode ver auditoria
Pode usar modo avançado
```

---

# 33. FORMULÁRIO 15 — PLANO / SUBSCRIÇÃO

Campos:

```text
Plano *
Ciclo de facturação *
Moeda *
Quantidade de Employees
Limites
Dados de facturação
Data de início
Renovação automática
```

Resumo:

```text
Subtotal
Impostos aplicáveis
Total
Data de renovação
```

---

# 34. FORMULÁRIO 16 — NOTIFICAÇÕES

Campos:

```text
Aprovações
Tarefas concluídas
Tarefas falhadas
Alertas críticos
Conhecimento desactualizado
Integração falhou
Resumo diário
Resumo semanal
Canal preferido
Hora do briefing
```

---

# 35. FORMULÁRIO 17 — BRANDING & OUTPUTS

Campos:

```text
Logo
Papel timbrado
Cores
Rodapé
Assinatura
Signatários
Carimbo/Selo
Templates padrão
Formato de saída preferido
```

Este formulário deve ficar dentro:

```text
Empresa
→ Branding & Documentos
```

não como módulo principal.

---

# 36. FORMULÁRIO 18 — PAUSAR / PARAR

Campos:

```text
Escopo *
Motivo *
Duração
Cancelar tarefas pendentes?
Preservar fila?
```

Escopo:

```text
AI Employee
Equipa
Integração
Empresa
```

Para Emergency Stop:

```text
digitar confirmação
+
MFA quando configurado
```

---

# 37. FORMULÁRIO 19 — EXPORTAR EVIDÊNCIA

Campos:

```text
Empresa *
AI Employee
Tarefa
Período *
Tipo de evidência *
Formato *
Incluir hashes
Incluir approvals
Incluir knowledge receipts
Incluir execution receipts
```

Botão:

```text
[ Gerar Pacote de Evidência ]
```

---

# 38. FORMULÁRIO 20 — PREFERÊNCIAS DA EMPRESA

Campos:

```text
Idioma *
Fuso Horário *
Moeda *
Formato de Data *
Canal preferido
Política de aprovação padrão
Autonomia padrão
Retention
Briefing diário
Hora do briefing
```

---

# 39. CHATBOX CENTRAL

Criar área principal em:

```text
Trabalho
→ Conversas
```

Estrutura:

```text
┌─────────────────────────────────────────────────────────────────────┐
│ AI Employee | Empresa | Estado | Nova conversa                     │
├───────────────┬────────────────────────────────┬────────────────────┤
│ Conversas     │ Chat                           │ Contexto            │
│ Employees     │ mensagens                     │ tarefa              │
│ Favoritos     │ anexos                        │ ficheiros           │
│               │ cards                         │ fontes              │
│               │ approvals                     │ prazo               │
│               │ outputs                       │ output              │
│               │                               │ evidência           │
├───────────────┴────────────────────────────────┴────────────────────┤
│ + Anexar | Voz | Fonte | Prazo | Prioridade | [ Enviar ]          │
└─────────────────────────────────────────────────────────────────────┘
```

---

# 40. CHATBOX — CABEÇALHO

Mostrar:

```text
Nome do AI Employee
Função
Estado
Empresa
```

Não mostrar por defeito:

```text
instance_id
role_id
tenant_id
model_id
```

---

# 41. CHATBOX — MENSAGENS

Tipos:

```text
Mensagem do utilizador
Mensagem do Employee
Pedido de dados
Card de execução
Card de aprovação
Card de resultado
Card de erro
Card de fonte obrigatória
```

---

# 42. CHATBOX — COMPOSER

Campos/atalhos:

```text
Mensagem
[ + Anexar ]
[ Fonte ]
[ Voz ]
[ Prazo ]
[ Prioridade ]
[ Enviar ]
```

Não obrigar preenchimento de 10 campos antes de conversar.

---

# 43. CHATBOX — CRIAÇÃO DE TASK

Regra:

```text
mensagem conversacional
→ não precisa criar task

pedido operacional executável
→ criar/associar task
```

Guardar:

```text
conversation_id
task_id
employee_instance_id
company_id
tenant_id
```

---

# 44. CHATBOX — DADOS EM FALTA

Employee deve poder responder:

```text
Preciso dos seguintes dados:
□ Extracto bancário
□ Balancete

[ Anexar Ficheiros ]
[ Procurar no Drive ]
[ Usar Primavera ]
```

---

# 45. CHATBOX — APROVAÇÃO INLINE

Exemplo:

```text
Aprovação necessária

Acção:
Enviar email ao cliente

Risco:
Médio

[ Aprovar ]
[ Modificar ]
[ Rejeitar ]
```

---

# 46. CHATBOX — OUTPUT INLINE

Exemplo:

```text
Relatório concluído

[ Pré-visualizar ]
[ PDF ]
[ Excel ]
[ Enviar ]
[ Arquivar ]
[ Ver Evidência ]
```

---

# 47. SMART DEFAULTS

Pré-preencher quando possível:

```text
Empresa actual
Utilizador actual
Fuso horário
Moeda
Jurisdição
Supervisor
AI Employee seleccionado
Canal preferido
Plano actual
```

---

# 48. CAMPOS CONDICIONAIS

Não mostrar tudo sempre.

Exemplo:

```text
Forma Jurídica
→ pode alterar campos legais

País
→ altera jurisdição e validações

Tipo de integração
→ altera autenticação

Conhecimento = Fonte Oficial
→ pede autoridade + URL + effective_date

Emergency Stop
→ pede confirmação forte
```

---

# 49. VALIDAÇÃO

Cada formulário deve implementar:

```text
required validation
type validation
length validation
format validation
cross-field validation
tenant validation
permission validation
server validation
```

Nunca depender apenas do frontend.

---

# 50. MENSAGENS DE ERRO

Usar linguagem humana.

Evitar:

```text
ERR_SCHEMA_041
TENANT_VALIDATION_FAIL
```

Mostrar:

```text
Não foi possível guardar porque o NIF está em falta.
```

Detalhes técnicos ficam em:

```text
Ver detalhes
```

para perfis autorizados.

---

# 51. CONFIRMAÇÕES DE SUCESSO

Exemplo:

```text
Empresa criada com sucesso.
```

Não:

```text
ProvisioningJob completed.
Tenant state ACTIVE.
```

---

# 52. FORMULÁRIOS DESTRUTIVOS

Para:

```text
Suspender
Cancelar
Revogar
Apagar
Emergency Stop
```

mostrar:

```text
impacto
objecto afectado
tarefas pendentes
dados preservados
reversibilidade
```

e pedir confirmação.

---

# 53. FORMULÁRIOS E TENANT

Mesmo ocultando o conceito:

```text
tenant_id
```

toda mutação deve validar internamente:

```text
company_id
tenant_id
permissions
```

---

# 54. MODO AVANÇADO

Permitir ver códigos internos apenas para:

```text
Platform Admin
Technical Admin
Support Engineer
Auditor autorizado
```

Com toggle:

```text
Mostrar IDs técnicos
```

Default:

```text
OFF
```

---

# 55. NÃO APAGAR IDs INTERNOS

Preservar:

```text
MOD-xx
EMP-xx
WORK-xx
FORM IDs
Prompt IDs
Task IDs
Execution IDs
Source IDs
```

A alteração é de **presentation layer**, não de perda de identidade técnica.

---

# 56. MIGRAÇÃO DO FRONTEND

Antes de alterar, gerar:

```text
UI_PREFIX_AUDIT
```

Campos:

```text
route
component
visible_label
technical_prefix
internal_id
action
```

Ações:

```text
KEEP_INTERNAL_HIDE_UI
RENAME_UI
ADVANCED_ONLY
REMOVE_DUPLICATE
```

---

# 57. AUDITORIA DE FORMULÁRIOS EXISTENTES

Gerar:

```text
FORM_COMPLETENESS_AUDIT
```

Campos:

```text
form_id
form_name
current_fields
required_fields_missing
conditional_fields_missing
validation_missing
backend_action
security_requirements
status
```

Não criar duplicado se formulário já existir.

---

# 58. MATRIZ CAMPO → BACKEND

Para cada campo, documentar:

```text
field_name
frontend_type
required
validation
database_target
api_field
default_source
sensitive
audit_required
```

---

# 59. SEGURANÇA DE API KEYS

Regra absoluta:

```text
API KEY
→ não persistir no frontend
```

Fluxo:

```text
FORM
↓ HTTPS
BACKEND
↓
SECRETS VAULT
↓
secret_ref
```

Frontend recebe:

```text
masked_value
connection_status
last_tested_at
```

---

# 60. ACESSIBILIDADE

Formulários devem ter:

```text
labels reais
tab order
keyboard navigation
focus trap em modal
aria-describedby em erros
contrast adequado
estado loading
estado disabled
```

---

# 61. RESPONSIVE

Desktop:

```text
modal / drawer / wizard
```

Mobile:

```text
full-screen sheet
```

Não comprimir formulário grande em modal minúsculo.

---

# 62. AUTOSAVE

Para wizards longos:

```text
Criar Empresa
Contratar Employee
Configurar Employee
Adicionar Conhecimento
Ligar Integração
```

suportar:

```text
Guardar Rascunho
```

quando aplicável.

---

# 63. PREVENÇÃO DE DUPLICADOS

Antes de criar:

```text
Empresa
Utilizador
Integração
Fonte
```

verificar duplicidade.

Exemplos:

```text
NIF já existe
Email já pertence a utilizador
Conector já está ligado
Hash da fonte já existe
```

---

# 64. LOADING E ESTADOS ASSÍNCRONOS

Nunca fechar formulário e fingir sucesso.

Estados:

```text
A guardar...
A processar...
A validar...
A testar ligação...
A criar empresa...
```

Sucesso somente após confirmação backend.

---

# 65. NO FAKE SUCCESS

Não mostrar:

```text
Ligado
Criado
Validado
Publicado
```

sem resultado real do backend.

Mocks devem ser claramente:

```text
MOCK
```

---

# 66. ROTAS E LABELS

Rotas internas podem permanecer:

```text
/employees/EMP-03
```

se necessário.

Mas breadcrumb mostra:

```text
AI Employees > Detalhe
```

não:

```text
MOD-02 > EMP-03
```

---

# 67. TESTES — PREFIXOS

Criar:

```text
TEST-UXPREFIX-01
Nenhum MOD- visível no modo normal

TEST-UXPREFIX-02
Nenhum EMP- visível no modo normal

TEST-UXPREFIX-03
Nenhum FRM- visível no modo normal

TEST-UXPREFIX-04
Nenhum MPR- visível no modo normal

TEST-UXPREFIX-05
IDs disponíveis no modo avançado

TEST-UXPREFIX-06
Logs continuam a usar IDs técnicos
```

---

# 68. TESTES — CRIAR EMPRESA

```text
TEST-FORM-COMPANY-01
wizard 3 passos

TEST-FORM-COMPANY-02
razão social obrigatória

TEST-FORM-COMPANY-03
NIF obrigatório

TEST-FORM-COMPANY-04
forma jurídica obrigatória

TEST-FORM-COMPANY-05
país obrigatório

TEST-FORM-COMPANY-06
sector obrigatório

TEST-FORM-COMPANY-07
nome administrador obrigatório

TEST-FORM-COMPANY-08
email administrador obrigatório

TEST-FORM-COMPANY-09
idioma/moeda/timezone/jurisdição obrigatórios

TEST-FORM-COMPANY-10
tenant criado automaticamente no backend

TEST-FORM-COMPANY-11
não mostrar tenant como passo ao utilizador

TEST-FORM-COMPANY-12
empresa duplicada por NIF detectada
```

---

# 69. TESTES — FORMULÁRIOS

Criar testes para:

```text
required
conditional
validation
cancel
draft
submit
server error
permission denied
duplicate
success
responsive
keyboard
```

para os 20 formulários.

---

# 70. TESTES — CHATBOX

```text
TEST-CHAT-01
mensagem simples

TEST-CHAT-02
pedido operacional cria task

TEST-CHAT-03
anexo

TEST-CHAT-04
fonte

TEST-CHAT-05
dados em falta

TEST-CHAT-06
approval inline

TEST-CHAT-07
output inline

TEST-CHAT-08
evidence link

TEST-CHAT-09
tenant isolation

TEST-CHAT-10
permissão do Employee
```

---

# 71. CRITÉRIOS DE ACEITAÇÃO

A implementação só passa se:

```text
✓ prefixos técnicos desapareceram da UI normal
✓ IDs internos continuam preservados
✓ Modo Avançado pode mostrar IDs
✓ "Empresas & Tenants" passou a "Empresas"
✓ "Criar & Provisionar Tenant" passou a "Criar Empresa"
✓ formulário Criar Empresa tem 3 passos
✓ nome do administrador é obrigatório
✓ configuração regional inicial existe
✓ tenant é criado automaticamente no backend
✓ 20 formulários principais estão completos
✓ validação backend existe
✓ API keys não ficam no frontend
✓ Chatbox central está operacional
✓ formulários têm estados loading/error/success
✓ nenhum sucesso é fabricado
✓ tenant isolation continua intacto
```

---

# 72. ENTREGÁVEIS OBRIGATÓRIOS DO AGENTE

Produzir:

```text
1. UI_PREFIX_AUDIT.md
2. UI_LABEL_RENAME_MAP.md
3. FORM_COMPLETENESS_AUDIT.md
4. FORM_FIELD_BACKEND_MATRIX.md
5. COMPANY_CREATION_WIZARD_SPEC.md
6. CHATBOX_WORKSPACE_SPEC.md
7. IMPLEMENTATION_CHANGED_FILES.md
8. TEST_REPORT.md
9. SECURITY_REVIEW.md
10. FINAL_IMPLEMENTATION_REPORT.md
```

---

# 73. RELATÓRIO FINAL

Separar:

```text
IMPLEMENTED
REUSED
RENAMED
HIDDEN_FROM_STANDARD_UI
ADVANCED_ONLY
FORM_COMPLETED
VALIDATION_ADDED
NOT_IMPLEMENTED
BLOCKED
TESTED
```

Nunca declarar:

```text
PASS
```

sem evidência correspondente.

---

# 74. RESULTADO FINAL PRETENDIDO

A interface deve parecer:

```text
AI EMPLOYEE

Início
AI Employees
Trabalho
Conhecimento
Comunicações & Integrações
Empresa & Administração
```

e não:

```text
MOD-01
EMP-01
WORK-01
KNOW-01
ADMIN-01
```

O cliente deve perceber:

```text
Criar Empresa
Contratar AI Employee
Fazer Pedido
Adicionar Conhecimento
Ligar Sistema
Aprovar
Receber Resultado
```

e não a arquitectura interna que torna essas acções possíveis.

---

# 75. PRINCÍPIO FINAL

A simplificação deve obedecer a:

```text
O CLIENTE VÊ O NEGÓCIO.
O BACKEND VÊ A ARQUITECTURA.
```

e:

```text
INTERFACE HUMANA
≠
IDENTIFICADORES TÉCNICOS
```

Preservar a engenharia sofisticada.

Retirar apenas a complexidade desnecessária da experiência do cliente.

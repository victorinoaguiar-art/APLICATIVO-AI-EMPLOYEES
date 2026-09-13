# PROMPT MESTRE — ARQUITECTURA COMERCIAL POR ÁREAS DA AI EMPLOYEE PLATFORM
## Area-Based Digital Workforce Subscription & Entitlement Model — ABWSEM v1.0

**Versão:** 1.0  
**Âmbito:** AI Employee Platform — 500 Role Packs / Catálogo Comercial por Áreas  
**Objectivo:** substituir a venda Employee por Employee por uma arquitectura em que o cliente subscreve uma Área de Trabalho e recebe acesso a todos os AI Employees, capacidades, especializações e pacotes de trabalho incluídos nessa área.

---

# 0. PRINCÍPIO COMERCIAL

A plataforma não deve apresentar 500 Role Packs como 500 produtos independentes.

O modelo deve ser:

```text
CLIENTE
↓
ESCOLHE UMA ÁREA
↓
SUBSCREVE A ÁREA
↓
TODOS OS EMPLOYEES PRINCIPAIS DESSA ÁREA FICAM DISPONÍVEIS
↓
CAPACIDADES, ESPECIALIZAÇÕES E PACOTES DE TRABALHO DA ÁREA FICAM INCLUÍDOS
↓
CLIENTE ACTIVA APENAS O QUE PRECISA
↓
PLATAFORMA RECOMENDA QUAIS EMPLOYEES ACTIVAR
```

Regra central:

```text
ÁREA SUBSCRITA
!=
TODOS OS EMPLOYEES ACTIVOS
```

e:

```text
DISPONÍVEL
!=
ACTIVO
!=
AUTORIZADO A ACEDER A TODOS OS DADOS
```

---

# 1. INSTRUÇÃO À IA DE DESENVOLVIMENTO

ACTUE COMO uma equipa sénior composta por:

- Arquitecto Principal de Produto SaaS;
- Arquitecto de Sistemas Multiagente;
- Arquitecto de Billing & Entitlements;
- Arquitecto Multi-Tenant;
- Especialista em Product Packaging;
- Especialista em Revenue Architecture;
- Especialista em Workforce Management;
- Especialista em Enterprise Onboarding;
- Especialista em RBAC/ABAC;
- Especialista em Human-in-the-Loop;
- Engenheiro Backend;
- Engenheiro Frontend;
- Engenheiro de Dados;
- Engenheiro de Segurança;
- Engenheiro de Observability;
- Especialista em Catálogos B2B;
- Especialista em UX empresarial.

Implemente o modelo:

# **AREA-BASED DIGITAL WORKFORCE SUBSCRIPTION & ENTITLEMENT MODEL — ABWSEM**

Reutilizar obrigatoriamente:

```text
RolePack Registry
Runtime Orchestrator
AESSRE
APCATOS
AWDSE
IRECE v1.1
ORDKS
EREMS
CAQRS
EMVTCS
Connector SDK
PEIP
GWNIS
Permission Engine
Policy Engine
Risk Engine
Approval Gateway
Billing / Metering
Audit
Observability
```

Não criar segundo catálogo técnico nem segundo runtime.

---

# 2. NOVA UNIDADE COMERCIAL

Criar:

`CommercialArea`

A unidade principal de venda deixa de ser o Role Pack individual.

A unidade comercial passa a ser:

```text
COMMERCIAL AREA
```

Exemplos:

```text
Finanças & Tesouraria
Contabilidade & Fiscalidade
Vendas, Marketing & Clientes
Recursos Humanos & Pessoas
Compras, Stock, Logística & Comércio
Tecnologia, Dados & IA
```

---

# 3. O QUE A ASSINATURA DE UMA ÁREA INCLUI

Toda Área deve poder incluir:

```text
PRIMARY EMPLOYEES
CAPABILITIES
SPECIALIZATIONS
TASK PACKS
SHARED SERVICES
```

Componentes `INTERNAL ONLY` podem suportar a área, mas não são apresentados como empregados compráveis.

Papéis `MERGE` ficam absorvidos pelo produto de destino.

---

# 4. REGRA DE DIREITO DE UTILIZAÇÃO

Ao subscrever uma Área:

```text
AreaSubscription = ACTIVE
```

todos os membros comerciais da área passam a:

```text
AVAILABLE
```

mas não automaticamente a:

```text
ACTIVE
```

---

# 5. ESTADOS DO EMPLOYEE DENTRO DA ÁREA

```text
NOT_ENTITLED
AVAILABLE
CONFIGURING
READY_FOR_ACTIVATION
ACTIVE
PAUSED
DEGRADED
SUSPENDED
RETIRED
```

---

# 6. ACTIVATION GATE

Um Employee só pode tornar-se `ACTIVE` se:

```text
AREA ENTITLEMENT VALID
+
EMPLOYEE PLATFORM CERTIFIED
+
ORGANIZATION READY
+
PERMISSIONS CONFIGURED
+
REQUIRED CONNECTIONS CONFIGURED
+
AUTONOMY/RISK POLICY CONFIGURED
+
HUMAN SUPERVISOR CONFIGURED WHEN REQUIRED
```

---

# 7. COMPRA DA ÁREA NÃO CONCEDE PERMISSÃO DE DADOS

Regra rígida:

```text
SUBSCRIPTION ENTITLEMENT
!=
DATA AUTHORIZATION
```

O cliente pode ter direito comercial a usar o Employee sem lhe conceder acesso a determinado sistema.

---

# 8. HOME AREA

Cada Role Pack deve ter:

```text
home_commercial_area_id
```

Regra:

```text
1 ROLE PACK
=
1 HOME AREA
```

para evitar duplicação comercial.

---

# 9. RELATED AREAS

Um Role Pack pode ter:

```text
related_commercial_area_ids[]
```

para pesquisa, recomendação e descoberta.

Isto não cria um segundo Employee.

---

# 10. SHARED CAPABILITY

Capabilities transversais podem ser acessíveis por mais de uma área sem gerar duplicação de subscrição.

Exemplo:

```text
KPI Management
```

pode ser usada em Estratégia e em Contabilidade/Reporting, mas continua a ser uma única capability interna.

---

# 11. ARQUITECTURA DE PRODUTO

```text
CommercialArea
    ↓
EmployeeFamily
    ↓
PrimaryEmployee
    ↓
Capability
    ↓
TaskType
    ↓
Specialization
```

---

# 12. CATEGORIAS DE PAPEL

Usar o resultado da Auditoria Semântica e Comercial:

```text
KEEP
CAPABILITY
SPECIALIZATION
TASK PACK
INTERNAL ONLY
MERGE
```

Interpretação comercial:

```text
KEEP            → Employee principal da área
CAPABILITY      → funcionalidade incluída
SPECIALIZATION  → especialização incluída/activável
TASK PACK       → pacote de trabalho/resultado
INTERNAL ONLY   → motor interno, não produto autónomo
MERGE           → absorvido por outro Employee
```

---

# 13. ÁREAS COMERCIAIS BASE

Implementar inicialmente:

```text
A01 Gestão, Estratégia & Produto
A02 Finanças & Tesouraria
A03 Contabilidade & Fiscalidade
A04 Vendas, Marketing & Clientes
A05 Recursos Humanos & Pessoas
A06 Compras, Stock, Logística & Comércio
A07 Operações & Projectos
A08 Jurídico, Auditoria, Risco & SST
A09 Tecnologia, Dados & IA
A10 Documentos & Produtividade
A11 Investigação, Inteligência & ESG
```

---

# 14. ÁREAS SECTORIAIS

Implementar:

```text
S01 Construção, Imobiliário & Instalações
S02 Banca & Serviços Financeiros
S03 Seguros
S04 Agricultura & Agronegócio
S05 Indústria & Produção
S06 Energia & Utilities
S07 Telecomunicações
S08 Mineração, Petróleo & Gás
S09 Administração Pública, Saúde & Educação
S10 Retalho, Hotelaria & Operações Multi-site
S11 Media & Economia de Criadores
S12 Aviação & Aeroportos
S13 Farmacêutica & Ciências da Vida
```

---

# 15. MAPA DOS DEPARTAMENTOS TÉCNICOS PARA AS ÁREAS

Usar:

```text
A01 ← Estratégia + Produto
A02 ← Finanças
A03 ← Contabilidade + Fiscalidade e Conformidade
A04 ← Vendas + Marketing + Atendimento ao Cliente
A05 ← Recursos Humanos + Gestão da Força de Trabalho
A06 ← Compras e Aprovisionamento + Stock e Inventário + Logística + Comércio Internacional
A07 ← Operações + Projectos
A08 ← Jurídico + Auditoria + Segurança e SST
A09 ← Tecnologias de Informação + Dados e Operações de IA
A10 ← Documentos
A11 ← Investigação e Inteligência + ESG e Sustentabilidade

S01 ← Construção + Imobiliário + Gestão de Instalações
S02 ← Banca e Serviços Financeiros
S03 ← Seguros
S04 ← Agricultura e Agronegócio
S05 ← Indústria e Produção
S06 ← Energia e Utilities
S07 ← Telecomunicações
S08 ← Mineração + Petróleo e Gás
S09 ← Administração Pública + Administração de Saúde + Educação
S10 ← Retalho + Hotelaria + Franchising e Operações Multi-site
S11 ← Media e Economia de Criadores
S12 ← Aviação e Aeroportos
S13 ← Farmacêutica e Ciências da Vida
```

---

# 16. EXEMPLO — ÁREA FINANÇAS & TESOURARIA

Quando o cliente subscreve:

```text
FINANÇAS & TESOURARIA
```

ficam disponíveis, entre outros:

```text
Finance
Accounts Payable
Accounts Receivable
Collections
Treasury
Financial Planning
Cost Control
Credit Control
Bank Reconciliation
```

e capacidades incluídas:

```text
Cash Flow
Budget
Expense Control
Financial Analysis
Profitability
Invoice Verification
Payment Preparation
```

O cliente não compra estas capacidades separadamente.

---

# 17. UX DE COMPRA

Página de Área:

```text
FINANÇAS & TESOURARIA

O QUE ESTA ÁREA COBRE
...

EMPLOYEES PRINCIPAIS INCLUÍDOS
...

CAPACIDADES INCLUÍDAS
...

RESULTADOS QUE PODE OBTER
...

INTEGRAÇÕES RECOMENDADAS
...

[ Subscrever Área ]
```

---

# 18. UX APÓS A COMPRA

```text
FINANÇAS & TESOURARIA — SUBSCRITA

Disponíveis: 9 Employees
Activos: 3
Em configuração: 1
Pausados: 0
```

Cartões:

```text
Bank Reconciliation
AVAILABLE
[ Activar ]

Treasury
ACTIVE
[ Abrir ]

Financial Planning
AVAILABLE
[ Activar ]
```

---

# 19. RECOMENDAÇÃO AUTOMÁTICA

Integrar AWDSE.

Após a Área estar subscrita:

```text
PLATFORM ANALYSES NEED
↓
MATCHES NEED TO INCLUDED EMPLOYEE
↓
RECOMMENDS ACTIVATION
```

Exemplo:

```text
“Detectámos que a organização executa reconciliação bancária manual mensal.
O Bank Reconciliation Employee já está incluído na sua Área Financeira.
Deseja configurá-lo?”
```

---

# 20. NO UPSELL ARTIFICIAL DENTRO DA ÁREA

Se Employee/capability estiver incluído na Área já paga:

```text
do not sell it again
```

Pode haver limites transparentes de uso, capacidade, armazenamento ou serviços premium, mas não duplicação de cobrança pela mesma função incluída.

---

# 21. PLANOS COMERCIAIS

Suportar:

```text
SINGLE AREA
MULTI-AREA
BUSINESS SUITE
ENTERPRISE
```

---

# 22. SINGLE AREA

Cliente subscreve uma Área.

---

# 23. MULTI-AREA

Cliente selecciona várias Áreas com bundle comercial.

---

# 24. BUSINESS SUITE

Inclui todas as Áreas Comerciais Base.

---

# 25. ENTERPRISE

Pode incluir:

```text
todas as Áreas Base
áreas sectoriais
conectores premium
deployment dedicado
data residency
SSO/SCIM
support/SLA enterprise
```

---

# 26. ÁREAS SECTORIAIS COMO EXTENSÃO

Uma empresa pode combinar:

```text
FINANÇAS & TESOURARIA
+
INDÚSTRIA & PRODUÇÃO
```

ou:

```text
CONTABILIDADE & FISCALIDADE
+
BANCA & SERVIÇOS FINANCEIROS
```

conforme a actividade.

---

# 27. ENTITIES

Criar:

`CommercialArea`

Campos:

```text
commercial_area_id
code
name
type
description
status
display_order
```

---

# 28. AREA TYPES

```text
BASE_BUSINESS_AREA
SECTOR_AREA
```

---

# 29. AREA MEMBERSHIP

Criar:

`AreaRoleMembership`

Campos:

```text
commercial_area_id
rolepack_id
membership_type
is_home_area
display_in_catalog
included_by_default
```

---

# 30. MEMBERSHIP TYPES

```text
PRIMARY_EMPLOYEE
CAPABILITY
SPECIALIZATION
TASK_PACK
INTERNAL_SUPPORT
MERGED_ROLE
```

---

# 31. AREA SUBSCRIPTION

Criar:

`AreaSubscription`

Campos:

```text
subscription_id
organization_id
commercial_area_id
plan_id
status
started_at
renewal_at
usage_policy
```

---

# 32. AREA ENTITLEMENT

Criar:

`AreaEntitlement`

Campos:

```text
organization_id
commercial_area_id
rolepack_id
entitlement_type
status
source_subscription_id
```

---

# 33. EMPLOYEE ACTIVATION

Criar:

`AreaEmployeeActivation`

Campos:

```text
organization_id
commercial_area_id
employee_instance_id
rolepack_id
activation_status
supervisor
autonomy
risk_policy
activated_at
```

---

# 34. PRODUCT SKU

Não criar 500 SKUs principais.

Criar SKUs por:

```text
Area
Plan
Sector add-on
Enterprise option
```

---

# 35. MIGRAÇÃO DE CATÁLOGO

Migrar:

```text
500 Employee product cards
```

para:

```text
24 Area product pages
+
Primary Employee cards inside each area
+
Capabilities/Specializations/Task Packs as included value
```

---

# 36. CATALOGO COMERCIAL

O catálogo deve começar pelas Áreas.

Não deve começar por uma lista de 500 Employees.

---

# 37. ESTRUTURA DE CADA ÁREA NO CATÁLOGO

Mostrar:

```text
NOME DA ÁREA

O QUE COBRE
RESULTADOS PRINCIPAIS
EMPLOYEES PRINCIPAIS INCLUÍDOS
CAPACIDADES INCLUÍDAS
ESPECIALIZAÇÕES DISPONÍVEIS
PACOTES DE TRABALHO
INFORMAÇÃO NORMALMENTE NECESSÁRIA
INTEGRAÇÕES RECOMENDADAS
COMO FUNCIONA A ACTIVACÃO
```

---

# 38. INTEGRAR A DIRECTRIZ A → B

Reutilizar IRECE v1.1.

Para cada resultado:

```text
QUERO A
↓
PRECISO DISPONIBILIZAR B
```

Exemplo em Finanças:

```text
Reconciliação Bancária
→ Extracto bancário + razão da conta + período

Fluxo de Caixa
→ Saldos + contas a pagar/receber + movimentos previstos

Planeamento Financeiro
→ Histórico + orçamento + premissas + metas
```

---

# 39. OUTCOME-FIRST ROUTING

Cliente pode começar por:

```text
“O que pretende obter?”
```

A plataforma resolve:

```text
Outcome
→ Area
→ Included Employee
→ Required Inputs
→ Readiness
→ Activation/Execution
```

---

# 40. SE A ÁREA AINDA NÃO ESTIVER SUBSCRITA

Mostrar:

```text
Este resultado pertence à Área X.
[ Ver Área ]
```

---

# 41. SE A ÁREA JÁ ESTIVER SUBSCRITA

Não pedir nova compra.

Mostrar:

```text
Este Employee já está incluído.
[ Configurar ]
```

---

# 42. ACTIVAÇÃO ILIMITADA NÃO SIGNIFICA EXECUÇÃO IRRESTRITA

Mesmo que todos os Employees da Área estejam disponíveis:

```text
risk
permissions
usage
concurrency
approval
connector
```

continuam a ser aplicados.

---

# 43. BILLING

Billing deve separar:

```text
Area Subscription Fee
Usage / Capacity, if applicable
Premium Connectors
Premium Packs
Enterprise Deployment
```

---

# 44. TRANSPARÊNCIA

Antes da compra, mostrar claramente:

```text
what is included
what is not included
usage limits
premium connectors
sector add-ons
support level
```

---

# 45. NO SURPRISE BILLING

Nunca transformar a activação de um Employee já incluído numa nova subscrição sem consentimento explícito.

---

# 46. AREA HEALTH

No Command Center mostrar por Área:

```text
subscription status
available Employees
active Employees
tasks
pending approvals
connection health
cost
value
```

---

# 47. AREA ROI

Integrar Value & ROI Engine.

Medir:

```text
Area Cost
Area Task Volume
Area Accepted Outputs
Human Review Cost
Area Value
Area ROI / Value Status
```

---

# 48. AREA UTILIZATION

Medir:

```text
available employees
active employees
used employees
unused capabilities
```

---

# 49. NO PRESSURE TO ACTIVATE EVERYTHING

A plataforma pode recomendar, mas não deve activar nem pressionar comercialmente sem necessidade comprovada.

---

# 50. AREA DISCOVERY

Integrar AWDSE:

```text
process opportunity
→ determine area
→ if subscribed: recommend included Employee
→ if not subscribed: recommend Area
```

---

# 51. CROSS-AREA WORKFLOW

Um workflow pode usar Employees de várias Áreas quando todas estiverem autorizadas.

Exemplo:

```text
Sales
→ Finance
→ Accounting
→ Documents
```

---

# 52. AREA DEPENDENCY

Não obrigar o cliente a comprar Área B apenas porque um workflow da Área A utiliza um shared service interno.

---

# 53. INTERNAL SERVICES

Motores como:

```text
Task Router
Policy Manager
Workforce Supervisor
PDF Renderer
Word Renderer
AI Cost Metering
```

são infraestrutura da plataforma.

Não vender como empregados.

---

# 54. ROLE PACK PRESERVATION

Manter:

```text
500 Role Packs
500 IDs
500 role_keys
```

Internamente.

A nova abordagem muda:

```text
commercial packaging
```

não:

```text
canonical identity
```

---

# 55. SEARCH

Pesquisa pode encontrar Employee directamente.

Mas resultado deve indicar:

```text
Included in: Finanças & Tesouraria
```

e não preço individual.

---

# 56. CATALOG CARD

Employee card:

```text
BANK RECONCILIATION

Incluído em:
Finanças & Tesouraria

O que faz:
...

Capacidades relacionadas:
...

Estado da sua organização:
AVAILABLE / ACTIVE / NOT ENTITLED
```

---

# 57. AREA LANDING PAGE

Criar:

```text
/areas
/areas/{areaCode}
```

---

# 58. AREA MANAGEMENT

Criar:

```text
/organizations/{orgId}/areas
/organizations/{orgId}/areas/{areaCode}
```

---

# 59. APIs

```text
GET  /commercial-areas
GET  /commercial-areas/{id}
GET  /commercial-areas/{id}/employees
GET  /commercial-areas/{id}/capabilities

POST /organizations/{orgId}/areas/{id}/subscribe
GET  /organizations/{orgId}/areas/{id}/entitlements
POST /organizations/{orgId}/areas/{id}/employees/{roleId}/activate
POST /organizations/{orgId}/areas/{id}/employees/{roleId}/pause
```

---

# 60. PRODUCT RECOMMENDATION API

```text
POST /organizations/{orgId}/area-recommendations
```

Resposta:

```text
business_need
recommended_area
included_employee
reason
required_inputs
required_connections
estimated_value
```

---

# 61. CATALOG DATA FILES

Gerar:

```text
commercial_areas.json
commercial_area_role_memberships_500.json
area_primary_employees.json
area_capabilities.json
area_specializations.json
area_task_packs.json
area_internal_support.json
```

---

# 62. CATALOG VALIDATION

Validar:

```text
500/500 Role Packs mapped
exactly one home area per Role Pack
no duplicate canonical ID
no duplicate commercial Employee SKU
all KEEP mapped as primary Employee
all CAPABILITY mapped as capability
all SPECIALIZATION mapped as specialization
all TASK PACK mapped as task pack
all INTERNAL ONLY hidden from purchase
all MERGE mapped to destination
```

---

# 63. TEST — FINANCE AREA

Quando organização compra A02:

Expected:

```text
Finance                AVAILABLE
Accounts Payable       AVAILABLE
Accounts Receivable    AVAILABLE
Collections            AVAILABLE
Treasury               AVAILABLE
Financial Planning     AVAILABLE
Cost Control           AVAILABLE
Credit Control         AVAILABLE
Bank Reconciliation    AVAILABLE
```

Capabilities como Cash Flow/Budget/Profitability não geram nova cobrança individual.

---

# 64. TEST — ACTIVATION

Area ACTIVE + Employee AVAILABLE:

```text
Activate
→ Organization Readiness
→ Permissions
→ Connections
→ Supervisor
→ ACTIVE
```

---

# 65. TEST — DATA ACCESS

Área comprada sem autorização bancária:

```text
Bank Reconciliation = AVAILABLE
Bank Data Access = NOT AUTHORIZED
```

Correcto.

---

# 66. TEST — DUPLICATION

Mesmo Role Pack relacionado com duas áreas:

```text
one canonical Role Pack
one home area
zero duplicate subscriptions
```

---

# 67. TEST — AREA RECOMMENDATION

Necessidade de reconciliação:

```text
if A02 subscribed
→ recommend activation

if A02 not subscribed
→ recommend A02
```

---

# 68. TEST — INTERNAL ROLE

`AI Task Router` nunca deve aparecer como Employee adicional a comprar.

---

# 69. TEST — MERGED ROLE

`MERGE` não deve aparecer como produto autónomo.

---

# 70. HARD NO-GO

Bloquear release se:

```text
Role Pack appears as duplicate product
Area subscription does not unlock its included Employees
Employee activation creates hidden extra subscription
Area purchase grants unrestricted data permissions
INTERNAL ONLY role is sold as Employee
MERGE role is sold separately
cross-tenant entitlements leak
```

---

# 71. IMPLEMENTATION ORDER

```text
1 CommercialArea schema
2 500-role home-area mapping
3 AreaRoleMembership
4 AreaSubscription
5 AreaEntitlement
6 Area landing pages
7 Area purchase flow
8 Employee AVAILABLE/ACTIVE lifecycle
9 Billing migration
10 AWDSE recommendation integration
11 IRECE outcome/input integration
12 Command Center area view
13 Area ROI
14 Catalog regeneration
15 Migration tests
16 Release gate
```

---

# 72. MIGRAÇÃO COMERCIAL

Não eliminar Role Packs.

Migrar a experiência:

```text
ANTES:
500 cards com “contratar Employee”

DEPOIS:
24 áreas
→ Employees principais incluídos
→ capabilities
→ specializations
→ task packs
```

---

# 73. PRINCÍPIO DE VENDA

Não vender:

```text
“30 Employees para cobrir Finanças.”
```

Vender:

```text
“Área Financeira Digital — toda a equipa financeira necessária fica disponível.”
```

---

# 74. PRINCÍPIO DE EXPERIÊNCIA

O cliente deve sentir:

```text
COMPREI UMA ÁREA
↓
TENHO A EQUIPA DA ÁREA
↓
ACTIVO O QUE PRECISO
↓
A PLATAFORMA AJUDA-ME A ESCOLHER
```

---

# 75. PRINCÍPIO DE VALOR

Os 500 Role Packs continuam a ser profundidade tecnológica.

Não devem transformar-se em complexidade comercial.

```text
TECHNICAL DEPTH
500 ROLE PACKS

COMMERCIAL SIMPLICITY
AREA-BASED WORKFORCE
```

---

# 76. PRINCÍPIO FINAL

A AI Employee Platform deve vender cobertura funcional de negócio, não fragmentação técnica.

A unidade comercial passa a ser:

```text
ÁREA DE TRABALHO DIGITAL
```

Ao subscrevê-la, o cliente recebe todos os Employees principais e funcionalidades incluídas nessa área, podendo activar, configurar e utilizar apenas os necessários, sempre sujeitos a readiness, permissões, risco, conexões, supervisão e políticas.

O resultado pretendido é uma experiência comercial simples:

```text
“Quero cobrir Finanças.”
↓
“Subscreva Finanças & Tesouraria.”
↓
“Toda a equipa financeira fica disponível.”
↓
“Diga-nos o resultado que pretende.”
↓
“A plataforma activa/recomenda o Employee certo.”
```

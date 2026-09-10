# PROMPT MESTRE — AI EMPLOYEE HIRING, SALARY, SUBSCRIPTION & REVENUE ENGINE
## Contratação, “Salário Digital”, Subscrições, Instâncias, Equipas, Departamentos, Facturação, MRR, Custos e Margem para os 500 AI Employees

**Sigla:** AESSRE  
**Versão:** 1.0  
**Âmbito:** AI Employee Platform — 500/500 Priority Employee Program  
**Objectivo:** transformar os 500 AI Employees em 500 produtos comerciais contratáveis, configuráveis, mensuráveis e monetizáveis de forma recorrente, sem confundir a experiência comercial de “contratar um Employee Digital” com uma relação laboral humana.

---

# 0. INSTRUÇÃO PRINCIPAL À IA DE DESENVOLVIMENTO

ACTUE COMO uma equipa sénior composta por:

- Arquitecto Principal de Software;
- Arquitecto SaaS;
- Arquitecto de Billing;
- Especialista em Monetização;
- Especialista em Pricing;
- Engenheiro Backend;
- Engenheiro Frontend;
- Engenheiro de Dados;
- Especialista em FinOps;
- Especialista em Revenue Operations;
- Especialista em Subscription Management;
- Especialista em Payments;
- Especialista em ERP/Accounting Integration;
- Especialista em Marketplace;
- Especialista em Multi-Tenant SaaS;
- Especialista em Security;
- Especialista em Tax/Compliance;
- Especialista em Product Analytics;
- Especialista em Customer Success.

Implemente o:

# **AI EMPLOYEE HIRING, SALARY, SUBSCRIPTION & REVENUE ENGINE — AESSRE**

para os 500 AI Employees.

---

# 1. PRINCÍPIO COMERCIAL

A experiência do utilizador pode ser:

```text
“Contratar Employee Digital”
“Salário Digital Mensal”
“Departamento Digital”
“Equipa Digital”
```

Mas internamente e para efeitos jurídicos/fiscais/contabilísticos:

```text
SALÁRIO DIGITAL
=
COMMERCIAL DISPLAY LABEL
```

e:

```text
BILLING LEGAL NATURE
=
SUBSCRIPTION / SERVICE FEE / SaaS FEE
```

Nunca apresentar o AI Employee como trabalhador humano com vínculo laboral.

---

# 2. UNIDADE DE PRODUTO

Separar:

```text
ROLE
EMPLOYEE INSTANCE
SUBSCRIPTION
USAGE
ORGANIZATION
```

Exemplo:

```text
Role:
#66 Document Classification

Instance:
EMP-ORG-A-0001

Subscription:
Professional Monthly

Organization:
ORG-A
```

---

# 3. 500 PRODUCTS, MANY INSTANCES

Regra:

```text
500 Role Packs
!=
500 maximum customers
```

Um Role pode ter:

```text
1
10
100
10,000+
```

instâncias contratadas por organizações diferentes.

---

# 4. MULTIPLE INSTANCES OF SAME ROLE

Permitir:

```text
#66 @ Accounting
#66 @ Procurement
#66 @ Tax
```

na mesma organização.

Cada instância pode ter:

```text
different supervisor
different data bindings
different permissions
different workload limits
different department assignment
```

---

# 5. COMMERCIAL PRODUCT MODEL

Cada Role deve poder ser publicado como:

`AIEmployeeProduct`

Campos:

```text
role_id
role_key
commercial_name
short_description
department
archetype
risk_level
supported_capabilities
available_plans[]
available_regions[]
supported_languages[]
supported_integrations[]
certification_status
commercial_status
```

---

# 6. COMMERCIAL STATUS

Estados:

```text
DRAFT
INTERNAL_ONLY
PILOT
AVAILABLE
LIMITED_AVAILABILITY
SUSPENDED
RETIRED
```

---

# 7. HIRING EXPERIENCE

Criar fluxo:

```text
Browse Employee
↓
View Capabilities
↓
View Limitations
↓
View Plan
↓
View Integrations
↓
View Risk/Approval Requirements
↓
Select Organization
↓
Configure
↓
Review Price
↓
Accept Terms
↓
Subscribe
↓
Provision Instance
↓
Organization Readiness
↓
Activate
```

---

# 8. “HIRE” ACTION

UI pode usar:

```text
CONTRATAR
```

ou:

```text
ADICIONAR À EQUIPA
```

Internamente:

```text
create subscription
+
provision employee instance
```

---

# 9. EMPLOYEE INSTANCE

Criar:

`EmployeeInstance`

Campos:

```text
instance_id
organization_id
role_id
role_key
display_name
department_id
supervisor_id
subscription_id
plan_id
autonomy_level
risk_policy
status
created_at
activated_at
```

---

# 10. INSTANCE STATUS

```text
PROVISIONING
CONFIGURING
WAITING_CONNECTIONS
WAITING_APPROVAL
ORGANIZATION_READY
ACTIVE
PAUSED
SUSPENDED
CANCELLED
ARCHIVED
```

---

# 11. DIGITAL SALARY DISPLAY

Permitir:

```text
Salário Digital Mensal
```

na UI comercial.

Exemplo:

```text
Document Creator
Salário Digital: 25.000 AOA/mês
```

Mas armazenar:

```text
billing_descriptor = MONTHLY_SUBSCRIPTION_FEE
```

---

# 12. LEGAL LABEL

Em factura/contrato/receipt utilizar descrição adequada:

```text
Subscrição mensal — AI Employee [nome]
```

ou:

```text
Serviço SaaS — AI Employee [nome]
```

conforme configuração jurídica/fiscal.

---

# 13. PLAN MODEL

Criar:

```text
STARTER
PROFESSIONAL
BUSINESS
ENTERPRISE
```

como defaults configuráveis.

---

# 14. PLAN DIMENSIONS

Planos podem controlar:

```text
tasks/month
documents/month
AI usage
storage
connectors
integrations
autonomy ceiling
human review
SLA
retention
support
workflow count
organization seats
departments
```

---

# 15. PLAN DOES NOT CHANGE ROLE IDENTITY

```text
#73 Starter
#73 Professional
#73 Enterprise
```

continuam sendo:

```text
role_id = 73
```

---

# 16. PLAN VERSIONING

Criar:

```text
plan_version
effective_from
effective_until
```

---

# 17. PRICE BOOK

Criar:

`PriceBook`

Suportar:

```text
AOA
USD
EUR
```

e outras moedas futuramente.

---

# 18. PRICE LOCALIZATION

Preço pode variar por:

```text
country
region
currency
customer segment
contract size
channel
partner
```

---

# 19. NO HARD-CODED FX

Taxas cambiais devem ser externas/configuráveis.

---

# 20. BILLING MODELS

Suportar:

```text
FLAT_MONTHLY
PER_EMPLOYEE_INSTANCE
PER_TASK
PER_DOCUMENT
PER_USAGE_UNIT
PER_CONNECTOR
PER_DEPARTMENT
PER_TEAM
HYBRID
ENTERPRISE_CONTRACT
```

---

# 21. HYBRID PRICING

Exemplo:

```text
base monthly fee
+
included usage
+
overage
```

---

# 22. INCLUDED USAGE

Cada plano deve definir:

```text
included_tasks
included_documents
included_tokens_or_compute
included_storage
included_connectors
```

---

# 23. OVERAGE

Criar:

```text
overage rate
```

por dimensão.

---

# 24. USAGE METERING

Medir:

```text
tasks
documents
AI compute
model usage
storage
tool calls
connector calls
workflow runs
human review
```

---

# 25. USAGE LEDGER

Criar ledger imutável:

```text
usage_event_id
organization_id
instance_id
subscription_id
metric
quantity
unit
timestamp
source
```

---

# 26. BILLING LEDGER

Criar ledger imutável para:

```text
charge
credit
discount
refund
tax
adjustment
write-off
```

---

# 27. SUBSCRIPTION

Criar:

`EmployeeSubscription`

Campos:

```text
subscription_id
organization_id
instance_id
plan_id
billing_cycle
currency
unit_price
status
start_at
renew_at
cancel_at
trial_end
```

---

# 28. SUBSCRIPTION STATUS

```text
TRIAL
ACTIVE
PAST_DUE
GRACE_PERIOD
SUSPENDED
CANCELLED
EXPIRED
```

---

# 29. TRIAL

Permitir:

```text
trial days
trial usage cap
trial capability cap
```

---

# 30. TRIAL SAFETY

Trial nunca aumenta autonomy ou reduz safety gates.

---

# 31. UPGRADE

Permitir:

```text
Starter → Professional
Professional → Business
Business → Enterprise
```

---

# 32. DOWNGRADE

Downgrade deve validar:

```text
usage
connectors
workflows
retention
autonomy
```

antes de aplicar.

---

# 33. PRORATION

Suportar pró-rata configurável.

---

# 34. PLAN CHANGE EFFECTIVE DATE

Permitir:

```text
immediate
next_cycle
scheduled_date
```

---

# 35. TEAM BUNDLE

Criar:

`AITeamProduct`

Exemplo:

```text
Finance Starter Team
→ #53 Treasury
→ #64 Bank Reconciliation
→ #73 Management Reporting
```

---

# 36. DEPARTMENT BUNDLE

Criar:

`AIDepartmentProduct`

Exemplo:

```text
Accounting Department
→ multiple accounting Employees
```

---

# 37. WORKFORCE BUNDLE

Criar:

```text
AI Workforce Pack
```

com múltiplos departamentos.

---

# 38. BUNDLE DISCOUNT

Permitir:

```text
bundle_discount
```

sem alterar revenue ledger de forma opaca.

---

# 39. BUNDLE ALLOCATION

Distribuir receita por Employee para análise de margem.

---

# 40. REVENUE ATTRIBUTION

Cada charge deve poder ser atribuída a:

```text
Employee
Team
Department
Connector
Usage
Premium Service
```

---

# 41. MRR

Calcular:

```text
Monthly Recurring Revenue
```

por:

```text
organization
Employee
department
plan
country
currency
```

---

# 42. ARR

```text
ARR = normalized recurring revenue x 12
```

segundo política definida.

---

# 43. NEW MRR

Medir:

```text
new customer MRR
new instance MRR
```

---

# 44. EXPANSION MRR

Gerado por:

```text
upgrade
additional Employee
additional instance
department expansion
usage expansion
```

---

# 45. CONTRACTION MRR

Gerado por:

```text
downgrade
instance reduction
usage reduction
```

---

# 46. CHURNED MRR

Perda por cancelamento.

---

# 47. NET MRR CHANGE

```text
NEW
+
EXPANSION
-
CONTRACTION
-
CHURN
```

---

# 48. REVENUE DASHBOARD

Mostrar:

```text
MRR
ARR
New MRR
Expansion MRR
Contraction MRR
Churned MRR
Net MRR
```

---

# 49. REVENUE PER EMPLOYEE ROLE

Exemplo:

```text
#66
active instances
MRR
usage revenue
total revenue
```

---

# 50. REVENUE PER INSTANCE

Permitir drill-down.

---

# 51. COST MODEL

Medir custos:

```text
model/API
compute
storage
connector
third-party API
human review
support
document rendering
messaging
payments
infrastructure
```

---

# 52. DIRECT COST

Atribuir custos directamente quando possível.

---

# 53. SHARED COST

Criar política para alocação de custos partilhados.

---

# 54. COST PER TASK

```text
direct cost / completed task
```

---

# 55. COST PER EMPLOYEE

Agregar por Role e instance.

---

# 56. CONTRIBUTION MARGIN

Calcular:

```text
Revenue
-
Direct Variable Cost
=
Contribution Margin
```

---

# 57. CONTRIBUTION MARGIN %

```text
Contribution Margin / Revenue
```

---

# 58. GROSS MARGIN

Definir política contabilística explícita.

---

# 59. UNIT ECONOMICS

Mostrar:

```text
revenue per instance
cost per instance
margin per instance
tasks per instance
cost per task
```

---

# 60. PROFITABILITY BY ROLE

Criar ranking operacional:

```text
most profitable roles
lowest margin roles
high-cost roles
underpriced roles
```

---

# 61. NO AUTOMATIC PRICE CHANGE

Analytics pode recomendar preço, mas não alterar automaticamente preço contratado.

---

# 62. PRICE RECOMMENDATION

Pode considerar:

```text
cost
margin
demand
usage
support load
competitiveness
```

---

# 63. FLOOR PRICE

Criar:

```text
minimum viable price
```

por produto/plan.

---

# 64. NEGATIVE MARGIN ALERT

Se:

```text
contribution_margin < threshold
```

emitir alerta.

---

# 65. CUSTOMER PROFITABILITY

Medir por organização.

---

# 66. PLAN PROFITABILITY

Medir por plano.

---

# 67. DEPARTMENT PROFITABILITY

Medir por pacote.

---

# 68. CONNECTOR PROFITABILITY

Medir conectores premium.

---

# 69. HUMAN REVIEW COST

Separar:

```text
mandatory review
premium expert review
error correction
```

---

# 70. ERROR CORRECTION BILLING

Erro confirmado do Employee não deve ser tratado automaticamente como revisão cobrável.

---

# 71. CAQRS INTEGRATION

Distinguir:

```text
ERROR_CORRECTION
CLIENT_REVISION
SCOPE_CHANGE
NEW_REQUEST
```

---

# 72. FREE ERROR CORRECTION POLICY

Suportar:

```text
confirmed employee error correction
→ no charge
```

---

# 73. PREMIUM REVISION

Podem existir revisões extras por plano, se comercialmente definido.

---

# 74. HUMAN EXPERT REVIEW

Pode ser add-on.

---

# 75. ENTERPRISE PRICING

Suportar:

```text
custom contract
volume pricing
minimum commitment
dedicated environment
custom SLA
```

---

# 76. COMMITMENT TERM

Suportar:

```text
monthly
quarterly
annual
multi-year
```

---

# 77. ANNUAL PREPAY

Permitir desconto configurável.

---

# 78. CONTRACT

Criar:

`CommercialSubscriptionContract`

---

# 79. CONTRACT FIELDS

```text
organization
products
instances
plans
term
currency
billing cycle
included usage
overage
tax treatment
support
SLA
termination
renewal
```

---

# 80. ORDER FORM

Gerar order form.

---

# 81. QUOTE

Gerar proposta comercial.

---

# 82. CHECKOUT

Permitir checkout self-service onde aplicável.

---

# 83. SALES-ASSISTED PURCHASE

Permitir venda assistida.

---

# 84. APPROVAL FOR DISCOUNTS

Descontos acima de threshold exigem aprovação.

---

# 85. DISCOUNT TYPES

```text
percentage
fixed
volume
bundle
introductory
partner
contractual
```

---

# 86. DISCOUNT AUDIT

Guardar:

```text
who
why
amount
approver
```

---

# 87. COUPONS

Opcional.

---

# 88. CREDIT NOTES

Suportar notas de crédito no billing ledger.

---

# 89. INVOICE

Gerar factura comercial conforme regras aplicáveis.

---

# 90. FISCAL INTEGRATION

Arquitectura deve permitir integração com:

```text
certified invoicing software
ERP
tax engine
jurisdiction-specific fiscal rules
```

---

# 91. NO HARDCODED TAX LAW

Regras fiscais devem ser versionadas por jurisdição.

---

# 92. ANGOLA SUPPORT

Preparar suporte para:

```text
AOA
NIF
fiscal document requirements
certified invoicing integration
AGT-compatible processes where applicable
```

sem assumir regras fiscais estáticas.

---

# 93. TAX ENGINE

Separar:

```text
commercial price
tax calculation
invoice issuance
```

---

# 94. PAYMENT STATUS

```text
UNPAID
PENDING
PAID
FAILED
REFUNDED
PARTIALLY_REFUNDED
```

---

# 95. PAYMENT PROVIDERS

Arquitectura provider-neutral.

---

# 96. PAYMENT RETRY

Criar dunning/retry policy.

---

# 97. GRACE PERIOD

Configurar.

---

# 98. PAST DUE BEHAVIOUR

Não desligar Employee crítico abruptamente sem policy.

---

# 99. SUSPENSION

Estado controlado.

---

# 100. CANCELLATION

Suportar:

```text
immediate
end_of_cycle
scheduled
```

---

# 101. DATA RETENTION AFTER CANCELLATION

Aplicar policy.

---

# 102. REACTIVATION

Suportar.

---

# 103. INSTANCE TRANSFER

Permitir mover Employee entre departamentos dentro da mesma organização.

---

# 104. NO CROSS-TENANT TRANSFER

Transferência entre organizações exige processo formal.

---

# 105. EMPLOYEE DISPLAY NAME

Cliente pode renomear instância:

```text
“ANA — Contabilidade”
```

sem alterar Role Pack.

---

# 106. ORG CHART INTEGRATION

Instâncias contratadas aparecem no organograma.

---

# 107. DEPARTMENT ASSIGNMENT

Cada instance pode pertencer a:

```text
Finance
Accounting
Tax
HR
etc.
```

---

# 108. SUPERVISOR

Associar supervisor humano ou AI Manager autorizado.

---

# 109. MANAGER LICENSE

Se AI Manager for produto pago, tratar como Role/Instance.

---

# 110. DEPENDENCY LICENSING

Se Employee usa outro Employee internamente, não criar dupla cobrança automaticamente sem regra comercial.

---

# 111. INTERNAL SERVICE CALLS

Separar:

```text
internal orchestration
vs
customer-contracted instance
```

---

# 112. INCLUDED INTERNAL SERVICES

Definir quais Employee services são infraestruturais.

---

# 113. MARKETPLACE

Permitir catálogo pesquisável.

---

# 114. MARKETPLACE FILTERS

```text
department
industry
risk
price
capabilities
integrations
language
certification
```

---

# 115. PRODUCT DETAIL PAGE

Mostrar:

```text
what it does
what it does not do
inputs
outputs
integrations
risk
autonomy
approval needs
price
plans
```

---

# 116. NO OVERCLAIMING

Não vender como “fully autonomous” se certification não comprova.

---

# 117. CERTIFICATION DISPLAY

Mostrar status real.

---

# 118. RELIABILITY DISPLAY

Opcionalmente mostrar métricas auditadas.

---

# 119. CAQRS DISPLAY

Pode mostrar:

```text
first-pass acceptance
revision rate
```

quando amostra suficiente.

---

# 120. HIRING ELIGIBILITY

Employee só pode ser contratado publicamente se:

```text
commercial_status = AVAILABLE
AND
certification requirements met
```

---

# 121. PILOT AVAILABILITY

Permitir `PILOT`.

---

# 122. LIMITED AVAILABILITY

Por sector/jurisdição.

---

# 123. ORGANIZATION READINESS AFTER HIRE

Contratação não equivale a ACTIVE.

Fluxo:

```text
SUBSCRIBED
↓
CONFIGURING
↓
ORGANIZATION_READY
↓
ACTIVE
```

---

# 124. BILLING START POLICY

Configurar se cobrança começa em:

```text
subscription date
organization ready date
activation date
```

---

# 125. RECOMMENDED DEFAULT

Para planos comuns, permitir política clara e transparente.

---

# 126. PROVISIONING

Após compra:

```text
create instance
create work binding
create entitlement
create budget
create metering scope
```

---

# 127. ENTITLEMENT ENGINE

Controlar capacidades contratadas.

---

# 128. ENTITLEMENT EXAMPLE

```yaml
entitlement:
  instance_id: inst_001
  plan: professional
  tasks_month: 1000
  connectors: 3
  autonomy_max: L3
```

---

# 129. ENTITLEMENT != PERMISSION

Plano comercial não substitui security permissions.

---

# 130. ENTITLEMENT != CERTIFICATION

Cliente pagar Enterprise não aumenta autonomia acima da certificada.

---

# 131. BUDGETS

Criar budgets por:

```text
organization
department
Employee
instance
model usage
```

---

# 132. HARD BUDGET

Bloqueia/escala.

---

# 133. SOFT BUDGET

Avisa.

---

# 134. USAGE ALERTS

```text
50%
80%
100%
120%
```

configurável.

---

# 135. COST ALERTS

Alertar sobre aumento anormal.

---

# 136. MARGIN ALERTS

Alertar margin compression.

---

# 137. FINOPS DASHBOARD

Mostrar:

```text
AI cost
infra cost
third-party cost
human review cost
revenue
margin
```

---

# 138. ROLE ECONOMICS PASSPORT

Criar:

`EmployeeEconomicsPassport`

---

# 139. ECONOMICS PASSPORT EXAMPLE

```yaml
employee_economics:
  role_id: 66
  active_instances: 420
  mrr: null
  usage_revenue: null
  total_revenue: null
  model_cost: null
  connector_cost: null
  infra_cost: null
  human_review_cost: null
  contribution_margin: null
  contribution_margin_pct: null
```

---

# 140. INSTANCE ECONOMICS

Criar equivalente por instance.

---

# 141. ORGANIZATION ECONOMICS

Criar equivalente por customer.

---

# 142. COHORT ANALYSIS

Medir por:

```text
signup month
plan
country
segment
industry
```

---

# 143. RETENTION

Medir:

```text
logo retention
revenue retention
```

---

# 144. NRR

Calcular:

```text
Net Revenue Retention
```

---

# 145. GRR

Calcular:

```text
Gross Revenue Retention
```

---

# 146. EMPLOYEE ADOPTION

Medir:

```text
instances hired
instances activated
instances used
```

---

# 147. TIME TO VALUE

```text
hire timestamp
→ first successful task
```

---

# 148. TIME TO ORGANIZATION READY

Medir.

---

# 149. ACTIVATION RATE

```text
activated subscriptions / purchased subscriptions
```

---

# 150. UNUSED EMPLOYEE ALERT

Detectar instância paga sem uso.

---

# 151. CUSTOMER SUCCESS

Sugerir configuração/help, sem manipulação.

---

# 152. DOWNSELL RECOMMENDATION

Se plano claramente sobredimensionado, pode recomendar downgrade.

---

# 153. UPSELL RECOMMENDATION

Pode recomendar upgrade com base em uso real.

---

# 154. NO DARK PATTERNS

Não pressionar cliente.

---

# 155. EXPANSION SUGGESTIONS

Exemplo:

```text
Customer uses #66 heavily
→ suggest #73 if relevant
```

com transparência.

---

# 156. BUNDLE RECOMMENDATION

Pode sugerir departamento quando economicamente melhor para cliente.

---

# 157. SALES ANALYTICS

Mostrar:

```text
most viewed Employees
most hired
highest conversion
highest MRR
highest expansion
```

---

# 158. ROLE CONVERSION RATE

```text
product views
→ hires
```

---

# 159. TRIAL CONVERSION

Medir.

---

# 160. PLAN MIX

Medir distribuição.

---

# 161. COUNTRY MIX

Medir.

---

# 162. INDUSTRY MIX

Medir.

---

# 163. CURRENCY NORMALIZATION

Para reporting consolidado, usar FX snapshot auditável.

---

# 164. FX SNAPSHOT

Guardar:

```text
source
rate
timestamp
base currency
```

---

# 165. REVENUE RECOGNITION

Criar camada configurável segundo política contabilística aplicável.

---

# 166. CASH != REVENUE

Não confundir pagamento recebido com revenue recognized.

---

# 167. DEFERRED REVENUE

Suportar quando aplicável.

---

# 168. PREPAID ANNUAL CONTRACT

Ratear conforme policy contabilística.

---

# 169. ACCOUNTING EXPORT

Exportar para ERP/contabilidade.

---

# 170. PRIMAVERA INTEGRATION

Preparar mapping para:

```text
customers
invoices
credit notes
receipts
revenue accounts
tax codes
```

---

# 171. GENERAL ERP INTEGRATION

Provider-neutral.

---

# 172. INVOICE LINE ITEMS

Exemplo:

```text
AI Employee #66 — Professional
Monthly SaaS Subscription
Qty 1
```

---

# 173. BUNDLE LINE ITEMS

Pode detalhar ou agregar conforme policy.

---

# 174. USAGE LINE ITEMS

Separados.

---

# 175. CONNECTOR ADD-ONS

Facturáveis.

---

# 176. PREMIUM SERVICES

Exemplos:

```text
human expert review
custom integration
dedicated gateway
custom knowledge pack
priority SLA
```

---

# 177. SETUP FEE

Opcional.

---

# 178. IMPLEMENTATION FEE

Enterprise pode ter.

---

# 179. MARKETPLACE REVENUE SHARE

Preparar para terceiros.

---

# 180. THIRD-PARTY ROLE PACK

Futuramente.

---

# 181. THIRD-PARTY CONNECTOR

Futuramente.

---

# 182. REVENUE SHARE LEDGER

Criar.

---

# 183. PARTNER COMMISSION

Suportar.

---

# 184. RESELLER

Suportar.

---

# 185. AFFILIATE

Opcional.

---

# 186. TAX ON COMMISSION

Delegar a fiscal engine/jurisdiction.

---

# 187. SECURITY

Billing e subscription são domínios sensíveis.

---

# 188. PAYMENT PERMISSIONS

Separar:

```text
billing.view
billing.manage
subscription.create
subscription.cancel
discount.approve
refund.approve
```

---

# 189. FRAUD CONTROLS

Detectar:

```text
payment fraud
coupon abuse
account takeover
subscription abuse
```

---

# 190. TENANT ISOLATION

Nunca misturar:

```text
invoice
subscription
usage
revenue
cost
```

entre organizações.

---

# 191. AUDIT

Guardar:

```text
hire
plan change
price
discount
invoice
payment
refund
cancel
reactivate
```

---

# 192. PRICE CHANGE AUDIT

Obrigatório.

---

# 193. SUBSCRIPTION CHANGE AUDIT

Obrigatório.

---

# 194. IMMUTABLE FINANCIAL LEDGER

Eventos financeiros não devem ser apagados.

---

# 195. CORRECTIONS

Usar reversal/adjustment.

---

# 196. EVENT MODEL

Emitir:

```text
EV.employee.hired
EV.employee.instance_provisioned
EV.employee.activated
EV.subscription.started
EV.subscription.upgraded
EV.subscription.downgraded
EV.subscription.renewed
EV.subscription.cancelled
EV.usage.recorded
EV.invoice.issued
EV.payment.received
EV.payment.failed
EV.revenue.recognized
EV.margin.threshold_breached
```

---

# 197. DATABASE ENTITIES

Criar:

```text
ai_employee_products
employee_instances
employee_subscriptions
subscription_plans
plan_versions
price_books
price_book_entries
entitlements
usage_events
usage_ledger
billing_ledger
invoices
invoice_items
payments
refunds
credits
discounts
commercial_contracts
order_forms
quotes
team_products
department_products
workforce_products
bundle_members
revenue_attribution
cost_events
cost_allocations
employee_economics
instance_economics
organization_economics
mrr_snapshots
arr_snapshots
fx_snapshots
revenue_recognition_events
partner_commissions
```

---

# 198. API

Criar:

```text
GET  /marketplace/employees
GET  /marketplace/employees/{roleId}
POST /organizations/{orgId}/employees/{roleId}/hire

GET  /organizations/{orgId}/employee-instances
GET  /employee-instances/{id}
POST /employee-instances/{id}/activate
POST /employee-instances/{id}/pause
POST /employee-instances/{id}/cancel

GET  /plans
POST /subscriptions
POST /subscriptions/{id}/upgrade
POST /subscriptions/{id}/downgrade
POST /subscriptions/{id}/cancel

POST /usage/events
GET  /usage/organizations/{id}
GET  /usage/instances/{id}

GET  /billing/invoices
GET  /billing/revenue
GET  /billing/mrr
GET  /billing/arr
GET  /billing/margins
```

---

# 199. UI — EMPLOYEE MARKETPLACE

Mostrar cards com:

```text
Employee name
role
department
what it does
starting digital salary
certification
```

---

# 200. UI — EMPLOYEE DETAIL

Mostrar:

```text
Capabilities
Inputs
Outputs
Integrations
Plans
Digital Salary
Usage Included
Risk
Autonomy
Supervision
```

---

# 201. UI — HIRE FLOW

Passos:

```text
1 Employee
2 Plan
3 Department
4 Supervisor
5 Integrations
6 Usage
7 Price
8 Terms
9 Confirm
10 Provision
```

---

# 202. UI — MY DIGITAL WORKFORCE

Mostrar:

```text
Employee Instances
Department
Status
Plan
Monthly Fee
Usage
Cost
Next Renewal
```

---

# 203. UI — DEPARTMENT PURCHASE

Permitir contratar pacote.

---

# 204. UI — BILLING

Mostrar:

```text
current MRR
next invoice
usage
credits
payments
```

---

# 205. UI — REVENUE ADMIN

Admin interno:

```text
MRR
ARR
Revenue
Costs
Margins
Churn
Expansion
```

---

# 206. UI — EMPLOYEE PROFITABILITY

Por Role.

---

# 207. UI — INSTANCE PROFITABILITY

Por customer instance.

---

# 208. UI — PLAN PROFITABILITY

Por plano.

---

# 209. UI — ALERTS

```text
negative margin
payment failure
usage spike
cost spike
churn risk
```

---

# 210. ROLE PRODUCTIZATION GATE

Todos os 500 devem ter:

```text
commercial_name
commercial_description
plan compatibility
pricing eligibility
commercial status
```

---

# 211. 500/500 PRODUCT COVERAGE

Meta:

```text
AI Employee Products = 500/500
```

---

# 212. NOT ALL NEED SAME PRICE

Cada Role pode ter preço distinto.

---

# 213. NOT ALL NEED SAME PLANS

Alguns roles podem ser:

```text
Enterprise Only
Pilot Only
```

---

# 214. HIGH-RISK COMMERCIAL LIMIT

R4/R5 podem exigir:

```text
mandatory human approval
enterprise contract
restricted availability
```

---

# 215. CERTIFICATION-AWARE COMMERCE

Não vender nível de autonomy não certificado.

---

# 216. ORGANIZATION-AWARE COMMERCE

Disponibilidade pode depender de jurisdição.

---

# 217. CONNECTION-AWARE COMMERCE

Mostrar integrações necessárias antes da compra.

---

# 218. SETUP COMPLEXITY

Mostrar:

```text
Simple
Moderate
Advanced
```

---

# 219. IMPLEMENTATION SERVICE

Se setup avançado, oferecer serviço.

---

# 220. REVENUE FORECAST

Prever:

```text
next 30d
quarter
year
```

com cenários.

---

# 221. FORECAST SEPARATION

Separar:

```text
committed recurring
usage variable
pipeline
```

---

# 222. PIPELINE

Integrar CRM.

---

# 223. QUOTE TO SUBSCRIPTION

Fluxo:

```text
Quote
↓
Accepted
↓
Contract
↓
Subscription
↓
Provision
```

---

# 224. INVOICE TO CASH

Fluxo:

```text
Invoice
↓
Payment
↓
Receipt
↓
Accounting Export
```

---

# 225. SUBSCRIPTION LIFECYCLE

```text
TRIAL
↓
ACTIVE
↓
RENEWED
↓
UPGRADED/DOWNGRADED
↓
CANCELLED
```

---

# 226. CUSTOMER LIFECYCLE

```text
Lead
Customer
Organization
Subscribed
Activated
Expanded
Renewed
Churned
```

---

# 227. ANALYTICS SOURCE OF TRUTH

Revenue dashboards devem vir do billing ledger, não de estimativas do LLM.

---

# 228. DETERMINISTIC FINANCIAL CALCULATION

MRR/ARR/margem calculados deterministicamente.

---

# 229. NO MODEL-GENERATED INVOICES WITHOUT VALIDATION

LLM pode gerar descrição, não valores fiscais finais sem engine.

---

# 230. ROUNDING

Definir políticas monetárias.

---

# 231. CURRENCY PRECISION

Configurar por moeda.

---

# 232. AOA SUPPORT

Suportar formatação AOA.

---

# 233. BILLING TIMEZONE

Configurar por organização.

---

# 234. BILLING PERIOD

Versionado.

---

# 235. RECONCILIATION

Reconciliar:

```text
invoice
payment
subscription
ledger
```

---

# 236. REVENUE LEAKAGE DETECTION

Detectar:

```text
active instance without subscription
usage not billed
wrong discount
unbilled connector
```

---

# 237. ORPHAN SUBSCRIPTION DETECTION

Detectar assinatura sem instance.

---

# 238. ORPHAN INSTANCE DETECTION

Detectar instance sem entitlement.

---

# 239. DOUBLE BILLING PROTECTION

Idempotency obrigatória.

---

# 240. REFUND

Governado.

---

# 241. CREDIT

Governado.

---

# 242. TAX ADJUSTMENT

Governado.

---

# 243. BILLING DISPUTE

Criar workflow.

---

# 244. CUSTOMER DISPUTE

Estados:

```text
OPEN
REVIEWING
RESOLVED
CREDITED
REJECTED
```

---

# 245. SLA CREDITS

Suportar Enterprise.

---

# 246. SERVICE LEVEL METRICS

Integrar observability.

---

# 247. RELIABILITY-AWARE CREDITS

Opcional conforme contrato.

---

# 248. DATA EXPORT

Exportar:

```text
CSV
XLSX
API
```

---

# 249. FINANCIAL REPORTS

Gerar:

```text
MRR report
ARR report
revenue by Employee
margin by Employee
usage report
churn report
```

---

# 250. EXECUTIVE DASHBOARD

Mostrar:

```text
500 products
products available
active organizations
active instances
MRR
ARR
gross margin
top Employees
churn
```

---

# 251. PRODUCT DASHBOARD

Por Role:

```text
views
hires
active instances
MRR
usage
cost
margin
reliability
acceptance
```

---

# 252. UNIT ECONOMICS DASHBOARD

Por Role/Plan.

---

# 253. CUSTOMER DASHBOARD

Por Organization.

---

# 254. FORECAST DASHBOARD

Por horizon.

---

# 255. SALES COMMISSION

Opcional.

---

# 256. COMMISSION BASIS

Configurar:

```text
booked
billed
collected
recognized
```

---

# 257. PARTNER MODEL

Preparar.

---

# 258. RESELLER MARGIN

Preparar.

---

# 259. WHITE LABEL

Enterprise option possível.

---

# 260. WHITE LABEL DOES NOT CHANGE CORE IDENTITY

Manter audit interno.

---

# 261. BRANDING

Integra CLBGS para invoices/order forms/commercial docs.

---

# 262. DOCUMENT SERVICE

Gerar:

```text
quote
proposal
contract
invoice support
receipt
subscription summary
```

---

# 263. CAQRS

Cliente pode aceitar/rejeitar proposta antes de contratar.

---

# 264. EREMS

Reliability pode afectar comercial availability.

---

# 265. CERTIFICATION

Certification state deve aparecer no product record.

---

# 266. SECURITY GATE

Employee com critical unresolved finding não pode ser AVAILABLE.

---

# 267. COMMERCIAL ELIGIBILITY ENGINE

Criar:

```text
AVAILABLE
PILOT
RESTRICTED
NOT_ELIGIBLE
```

---

# 268. ELIGIBILITY RULES

Considerar:

```text
certification
risk
jurisdiction
connectors
knowledge readiness
security
```

---

# 269. COMMERCIAL READINESS PASSPORT

Criar:

`CommercialReadinessPassport`

---

# 270. PASSPORT EXAMPLE

```yaml
commercial_readiness:
  role_id: 66
  product_record: PASS
  pricing: PASS
  plans: PASS
  billing: PASS
  entitlement: PASS
  certification: PASS
  legal_terms: PASS
  marketplace: PASS
  status: AVAILABLE
```

---

# 271. 500/500 COMMERCIAL PREPARATION

Meta:

```text
500/500 Product Records
500/500 Commercial Readiness Passports
```

---

# 272. AVAILABLE != ACTIVE INSTANCE

Role pode estar AVAILABLE sem customer.

---

# 273. ACTIVE INSTANCE != PRODUCT COUNT

Não confundir.

---

# 274. REVENUE KPI DEFINITIONS

Documentar cada fórmula.

---

# 275. MRR POLICY

Definir tratamento de:

```text
discounts
credits
annual contracts
usage
one-time fees
```

---

# 276. ARR POLICY

Idem.

---

# 277. GROSS MARGIN POLICY

Idem.

---

# 278. REVENUE RECOGNITION POLICY

Idem.

---

# 279. COST ALLOCATION POLICY

Idem.

---

# 280. METRIC VERSIONING

Fórmulas versionadas.

---

# 281. HISTORICAL REPRODUCIBILITY

Dashboard histórico deve reproduzir números.

---

# 282. FINANCIAL AUDITABILITY

Cada KPI deve rastrear ao ledger.

---

# 283. NO SILENT RECOMPUTE

Mudança de fórmula deve preservar histórico ou versionar.

---

# 284. MIGRATION FROM P06

Integrar/expandir Marketplace + Billing + Metering já previsto.

---

# 285. NO DUPLICATE BILLING SYSTEM

AESSRE deve reutilizar P06 como base e elevá-lo a Employee Commerce Engine.

---

# 286. SERVICE BOUNDARIES

```text
Marketplace
Pricing
Subscription
Provisioning
Entitlement
Metering
Billing
Payments
Revenue
Cost
Margin
Analytics
```

---

# 287. EVENT-DRIVEN INTEGRATION

Usar eventos para desacoplar.

---

# 288. OUTBOX

Financial events com outbox.

---

# 289. IDEMPOTENCY

Todas as mutações financeiras.

---

# 290. RETRIES

Sem duplicar charges.

---

# 291. DLQ

Eventos financeiros falhados.

---

# 292. RECONCILIATION JOBS

Periódicos.

---

# 293. OBSERVABILITY

Medir:

```text
billing latency
invoice failures
payment failures
usage ingestion lag
revenue computation latency
```

---

# 294. SLO

Definir.

---

# 295. BACKUP/DR

Dados financeiros com políticas fortes.

---

# 296. ACCESS CONTROL

Finance/admin/customer scopes.

---

# 297. PII

Minimizar.

---

# 298. DATA RETENTION

Conforme policy/jurisdiction.

---

# 299. EXPORT / PORTABILITY

Permitir ao cliente exportar billing history.

---

# 300. AUDIT LOG

Append-only.

---

# 301. GENERATED FILES

Gerar:

```text
generated/ai_employee_products_500.json
generated/commercial_readiness_passports_500.json
generated/default_subscription_plans.json
generated/employee_price_book.json
generated/team_products.json
generated/department_products.json
generated/mrr_metric_definitions.json
generated/unit_economics_metric_definitions.json

schemas/ai-employee-product.schema.json
schemas/employee-instance.schema.json
schemas/subscription.schema.json
schemas/plan.schema.json
schemas/price-book.schema.json
schemas/entitlement.schema.json
schemas/usage-event.schema.json
schemas/billing-ledger-entry.schema.json
schemas/cost-event.schema.json
schemas/employee-economics.schema.json
schemas/commercial-readiness-passport.schema.json

packages/employee-marketplace/
packages/hiring-engine/
packages/instance-provisioning/
packages/subscription-engine/
packages/pricing-engine/
packages/entitlement-engine/
packages/metering-engine/
packages/billing-engine/
packages/payment-orchestration/
packages/revenue-engine/
packages/cost-engine/
packages/margin-engine/
packages/commercial-analytics/

tests/marketplace/
tests/hiring/
tests/subscriptions/
tests/pricing/
tests/entitlements/
tests/metering/
tests/billing/
tests/revenue/
tests/margins/
tests/security/
tests/tenant-isolation/
tests/regression/

docs/EMPLOYEE_COMMERCE_ARCHITECTURE.md
docs/DIGITAL_SALARY_COMMERCIAL_MODEL.md
docs/PRICING_AND_PLANS.md
docs/MRR_ARR_DEFINITIONS.md
docs/COST_AND_MARGIN_MODEL.md
docs/500_COMMERCIAL_READINESS.md
```

---

# 302. ACCEPTANCE TESTS

Obrigatórios:

1. 500/500 Role IDs têm Product Record;
2. 500/500 têm Commercial Readiness Passport;
3. múltiplas organizações podem contratar mesmo Role;
4. mesma organização pode ter múltiplas instances do mesmo Role;
5. instances permanecem tenant-isolated;
6. subscription cria entitlement;
7. plan upgrade funciona;
8. downgrade valida incompatibilidades;
9. metering é idempotente;
10. billing ledger é imutável;
11. MRR é calculado deterministicamente;
12. ARR é calculado deterministicamente;
13. cost attribution funciona;
14. contribution margin funciona;
15. bundle revenue allocation funciona;
16. discounts são auditados;
17. past-due flow funciona;
18. cancellation funciona;
19. reactivation funciona;
20. Employee não certificado não ganha autonomy via plano;
21. R4/R5 commercial restrictions funcionam;
22. tax engine é separado de price engine;
23. active instance sem subscription é detectada;
24. usage leakage é detectado;
25. double billing é bloqueado;
26. cross-tenant invoice leak é bloqueado;
27. financial dashboards reconciliam com ledger;
28. Digital Salary display não muda natureza de billing;
29. invoice legal descriptor usa subscription/service terminology;
30. history é reproduzível.

---

# 303. BUILD GATE

Executar:

```text
PRODUCT RECORDS               500/500 PASS
COMMERCIAL PASSPORTS          500/500 PASS
MARKETPLACE                   PASS
HIRING ENGINE                 PASS
INSTANCE PROVISIONING         PASS
SUBSCRIPTION ENGINE           PASS
PLAN ENGINE                   PASS
PRICE BOOK                    PASS
ENTITLEMENTS                  PASS
METERING                      PASS
BILLING LEDGER                PASS
INVOICE                       PASS
PAYMENT                       PASS
MRR                           PASS
ARR                           PASS
COST ENGINE                   PASS
MARGIN ENGINE                 PASS
TENANT ISOLATION              PASS
AUDIT                         PASS
SECURITY                      PASS
```

---

# 304. COMMERCIAL READINESS GATE

Um Role só fica:

```text
AVAILABLE
```

se:

```text
product configured
pricing valid
plan available
billing ready
certification acceptable
risk restrictions configured
legal terms ready
```

---

# 305. ORGANIZATION HIRING GATE

Contratação só conclui quando:

```text
organization valid
plan valid
price valid
terms accepted
subscription created
instance provisioned
```

---

# 306. ACTIVATION GATE

Employee só fica ACTIVE quando:

```text
subscription ACTIVE
AND
entitlement valid
AND
PLATFORM_CERTIFIED
AND
ORGANIZATION_READY
```

---

# 307. REVENUE GATE

Não contabilizar receita simplesmente porque:

```text
Employee exists
```

Receita deve vir de eventos financeiros reais.

---

# 308. PRINCÍPIO DE VERDADE COMERCIAL

Nunca mostrar:

```text
500 revenue-generating Employees
```

se nem todos tiverem receita.

Mostrar:

```text
500 commercially prepared Employees
X roles with paying customers
Y active paid instances
```

---

# 309. DASHBOARD EXAMPLE

```text
DIGITAL WORKFORCE COMMERCE
────────────────────────────────

Catalog Roles                500
Commercially Prepared        500
Available                    X
Roles With Paying Customers  X
Active Paid Instances        X
Organizations                X

MRR                          X
ARR                          X
Usage Revenue                X
Direct Cost                  X
Contribution Margin          X
Contribution Margin %        X
```

---

# 310. EMPLOYEE ECONOMICS EXAMPLE

```text
#66 Document Classification

Active Instances             820
MRR                          X
Usage Revenue                X
Model/API Cost               X
Connector Cost               X
Infrastructure Cost          X
Human Review Cost            X
Contribution Margin          X
Margin %                     X
```

---

# 311. DEPARTMENT ECONOMICS

Exemplo:

```text
Accounting Department

Subscriptions
MRR
Usage
Cost
Margin
Churn
Expansion
```

---

# 312. CUSTOMER BILL

Mostrar de forma clara:

```text
Employee subscriptions
Team/Department subscriptions
Usage
Add-ons
Taxes
Credits
Total
```

---

# 313. DIGITAL SALARY IN UI

Pode mostrar:

```text
Salário Digital Mensal
```

com tooltip:

```text
“Valor mensal da subscrição deste Employee Digital.”
```

---

# 314. CONTRACT LANGUAGE

Evitar:

```text
employment
worker salary
employment benefits
employee labor rights
```

como descrição jurídica da subscrição.

---

# 315. COMMERCIAL LANGUAGE

Pode usar:

```text
hire
digital employee
digital salary
team
department
```

como metáfora de produto, desde que termos jurídicos sejam claros.

---

# 316. FLEXIBLE PRICING

Não hardcodear valores neste prompt.

---

# 317. PRICE SIMULATION

Criar simulador:

```text
price
expected usage
AI cost
support cost
margin
```

---

# 318. BREAK-EVEN

Calcular.

---

# 319. TARGET MARGIN

Configurar por produto.

---

# 320. PRICE FLOOR ALERT

Se preço abaixo de custo + required margin.

---

# 321. USAGE SCENARIOS

Simular:

```text
light
normal
heavy
extreme
```

---

# 322. ENTERPRISE QUOTE BUILDER

Gerar quote.

---

# 323. DEPARTMENT BUILDER

Cliente selecciona Employees e recebe preço consolidado.

---

# 324. WORKFORCE BUILDER

Cliente monta força de trabalho.

---

# 325. RECOMMENDATION ENGINE

Pode sugerir composição, mas não contratar sem confirmação.

---

# 326. PLAN COMPARISON

UI.

---

# 327. TCO COMPARISON

Opcional comparar custo SaaS interno, sem alegações enganosas.

---

# 328. CUSTOMER SAVINGS

Só calcular com premissas explícitas.

---

# 329. NO FALSE HUMAN REPLACEMENT CLAIM

Não afirmar automaticamente “substitui 5 trabalhadores”.

---

# 330. VALUE METRICS

Medir:

```text
tasks completed
hours saved estimate
cycle time reduced
error avoided
```

com metodologia clara.

---

# 331. ROI

Opcional por cliente.

---

# 332. ROI INPUTS

Premissas explícitas.

---

# 333. CUSTOMER VALUE DASHBOARD

Mostrar:

```text
cost
usage
outcomes
acceptance
reliability
```

---

# 334. CUSTOMER RENEWAL

Suportar renewal.

---

# 335. RENEWAL NOTICE

Configurar.

---

# 336. RENEWAL QUOTE

Enterprise.

---

# 337. PRICE INCREASE

Com notice e contract compliance.

---

# 338. GRANDFATHERING

Opcional.

---

# 339. PRICE MIGRATION

Versionada.

---

# 340. CONTRACT AMENDMENT

Quando material.

---

# 341. CANCELLATION REASON

Capturar:

```text
price
low usage
quality
missing integration
company closure
other
```

---

# 342. CHURN ANALYSIS

Por Role/Plan/Org.

---

# 343. QUALITY-TO-CHURN LINK

Integrar CAQRS/EREMS.

---

# 344. RELIABILITY-TO-RENEWAL LINK

Analytics.

---

# 345. HUMAN REVIEW-TO-MARGIN LINK

Analytics.

---

# 346. COST OPTIMIZATION

Pode optimizar routing mantendo thresholds.

---

# 347. NO COST OPTIMIZATION BELOW RELIABILITY THRESHOLD

Obrigatório.

---

# 348. MULTI-CURRENCY BILLING

Suportar.

---

# 349. BASE REPORTING CURRENCY

Configurar.

---

# 350. FX AUDIT

Guardar snapshot.

---

# 351. ACCOUNTING INTEGRATION

Revenue export.

---

# 352. TAX INTEGRATION

Invoice/tax.

---

# 353. BANK RECONCILIATION

Receivables/payments.

---

# 354. COLLECTIONS

Past due workflows.

---

# 355. CUSTOMER CREDIT

Enterprise only if applicable.

---

# 356. CREDIT LIMIT

Governado.

---

# 357. PREPAID WALLET

Opcional.

---

# 358. USAGE CREDIT

Opcional.

---

# 359. PROMOTIONAL CREDIT

Governado.

---

# 360. EXPIRY

Configurável.

---

# 361. ENTITLEMENT EXPIRY

Associado subscription.

---

# 362. CANCELLED INSTANCE

Não executar nova task após effective cancellation.

---

# 363. IN-FLIGHT TASKS

Policy para finalizar/cancelar.

---

# 364. DATA EXPORT ON EXIT

Suportar.

---

# 365. ARCHIVE INSTANCE

Preservar audit.

---

# 366. REHIRE

Nova subscription ou reactivation conforme policy.

---

# 367. EMPLOYEE INSTANCE HISTORY

Mostrar.

---

# 368. COMMERCIAL EVENTS HISTORY

Mostrar.

---

# 369. FINANCE RECONCILIATION

Ledger vs invoice vs payment.

---

# 370. MRR RECONCILIATION

MRR snapshot vs active subscriptions.

---

# 371. COST RECONCILIATION

Cost events vs provider bills where available.

---

# 372. PROVIDER COST IMPORT

Support API/file imports.

---

# 373. CLOUD COST IMPORT

Support.

---

# 374. HUMAN REVIEW COST IMPORT

Support.

---

# 375. PROFITABILITY TIMELINE

Monthly.

---

# 376. BREAKDOWN

Role → Instance → Customer.

---

# 377. EXECUTIVE ALERT

Detect if high revenue role has low margin.

---

# 378. PRODUCT RETIREMENT

Commercially retire role without deleting history.

---

# 379. MIGRATION

Migrate customers to successor product when approved.

---

# 380. SUCCESSOR ROLE

Optional.

---

# 381. BUNDLE EVOLUTION

Versioned.

---

# 382. PLAN EVOLUTION

Versioned.

---

# 383. COMMERCIAL EXPERIMENTS

Pricing experiments only with governance.

---

# 384. NO SECRET PRICE DISCRIMINATION

Pricing rules transparent to authorized admins.

---

# 385. INTERNAL COST CENTER

Map revenue/cost to internal cost centers.

---

# 386. DEPARTMENT P&L

Optional management view.

---

# 387. EMPLOYEE P&L

Management view.

---

# 388. P&L IS MANAGEMENT ANALYTICS

Not statutory accounting unless reconciled.

---

# 389. STATUTORY ACCOUNTING EXPORT

Separate.

---

# 390. BILLING CORRECTION

Use credit/debit adjustments.

---

# 391. TAX CORRECTION

Via approved fiscal process.

---

# 392. REVENUE REPORT AUDIT

Trace to ledger.

---

# 393. SECURITY TESTS

Test:

```text
price tampering
discount escalation
cross-tenant invoice
fake usage
double usage
double billing
refund abuse
plan bypass
entitlement bypass
```

---

# 394. LOAD TESTS

Metering/billing at scale.

---

# 395. CONCURRENCY

Idempotent hire and subscription operations.

---

# 396. CHAOS TESTS

Billing provider outage.

---

# 397. PAYMENT PROVIDER OUTAGE

Graceful degradation.

---

# 398. USAGE INGESTION DELAY

Backfill safely.

---

# 399. LATE USAGE

Policy.

---

# 400. BILLING CYCLE CLOSE

Deterministic.

---

# 401. INVOICE PREVIEW

Before issue where applicable.

---

# 402. APPROVAL OF ENTERPRISE INVOICE

Optional.

---

# 403. CUSTOMER PORTAL

Billing self-service.

---

# 404. PAYMENT METHOD

Manage.

---

# 405. TAX ID

Manage.

---

# 406. BILLING ADDRESS

Manage.

---

# 407. INVOICE HISTORY

Show.

---

# 408. USAGE HISTORY

Show.

---

# 409. SUBSCRIPTION HISTORY

Show.

---

# 410. PLAN HISTORY

Show.

---

# 411. DOWNLOADS

Invoices/receipts.

---

# 412. NOTIFICATIONS

```text
renewal
payment failure
usage threshold
invoice issued
```

---

# 413. EMAIL/MESSAGING

Via Delivery Router.

---

# 414. AUTOMATION

Support recurring internal reporting.

---

# 415. DAILY FINOPS SNAPSHOT

Optional.

---

# 416. MONTH-END COMMERCIAL CLOSE

Generate snapshot.

---

# 417. SNAPSHOT IMMUTABILITY

Versioned.

---

# 418. METRIC BACKFILL

Audited.

---

# 419. DATA WAREHOUSE

Expose analytics.

---

# 420. BI INTEGRATION

Power BI etc.

---

# 421. EXPORT TO EXCEL

Support.

---

# 422. COMMERCIAL API

For partners/enterprise.

---

# 423. WEBHOOKS

Subscription events.

---

# 424. RATE LIMITING

Commercial APIs.

---

# 425. AUTHORIZATION

Strong.

---

# 426. SECRET MANAGEMENT

Payment/provider secrets.

---

# 427. PCI SCOPE MINIMIZATION

Do not store raw card data unless architecture explicitly requires and complies.

---

# 428. PRIVACY

Protect billing data.

---

# 429. RETENTION

Financial/legal policy.

---

# 430. DELETION

Respect legal retention and audit requirements.

---

# 431. ADMIN OVERRIDES

All audited.

---

# 432. SUPPORT TOOLS

Customer support can inspect with least privilege.

---

# 433. IMPERSONATION

If used, explicit audited support mode.

---

# 434. FEATURE FLAGS

For rollout.

---

# 435. SANDBOX

Commercial/billing sandbox.

---

# 436. TEST MODE

No real charges.

---

# 437. PRODUCTION MODE

Explicit.

---

# 438. ENVIRONMENT ISOLATION

Dev/staging/prod.

---

# 439. SEED DATA

No real customer data.

---

# 440. RELEASE GATE

No-Go if:

```text
billing mismatch
cross-tenant issue
double billing
ledger inconsistency
tax integration broken
payment reconciliation failure
```

---

# 441. MIGRATION FROM EXISTING P06 DATA

Preserve IDs/history.

---

# 442. BACKWARD COMPATIBILITY

Where feasible.

---

# 443. API VERSIONING

Commercial APIs versioned.

---

# 444. SCHEMA VERSIONING

Yes.

---

# 445. EVENT VERSIONING

Yes.

---

# 446. COMMERCIAL POLICY ENGINE

Centralize:

```text
availability
pricing
discount
trial
billing
cancellation
```

---

# 447. POLICY VERSIONING

Yes.

---

# 448. ORGANIZATION OVERRIDES

Enterprise only, governed.

---

# 449. CONTRACT OVERRIDES

Explicit.

---

# 450. CUSTOMER SEGMENTS

Support:

```text
micro
SMB
mid-market
enterprise
public sector
```

---

# 451. PLAN RECOMMENDATION BY SEGMENT

Optional.

---

# 452. ANGOLA MICROENTERPRISE SUPPORT

Allow low-cost plans while preserving cost floors.

---

# 453. ACCESSIBILITY

Billing UX clear.

---

# 454. LOCALIZATION

Portuguese-first support.

---

# 455. TERMINOLOGY

Keep "dashboard", "stock", "SaaS" when useful; prefer Portuguese elsewhere.

---

# 456. COMMERCIAL TRANSPARENCY

Show:

```text
what is included
what costs extra
when billing starts
```

---

# 457. NO SURPRISE BILLING

Usage overage notifications.

---

# 458. SPEND CAP

Customer configurable where possible.

---

# 459. APPROVAL FOR OVERAGE

Optional.

---

# 460. BILLING ESTIMATE

Show current projected invoice.

---

# 461. PRICE SIMULATOR

Before hire.

---

# 462. TEAM COST SIMULATOR

Before bundle purchase.

---

# 463. WORKFORCE COST SIMULATOR

For multiple Employees.

---

# 464. EXPECTED MARGIN SIMULATOR

Internal only.

---

# 465. SALES MARGIN GUARDRAIL

Discount cannot violate floor without approval.

---

# 466. CUSTOMER-SPECIFIC PRICE

Versioned contract.

---

# 467. NEGOTIATED PRICE

Audited.

---

# 468. CONTRACT RENEWAL PRICE

Track.

---

# 469. SALES TAX / VAT DISPLAY

From tax engine.

---

# 470. NET/GROSS PRICE DISPLAY

Configurable.

---

# 471. INVOICE NUMBERING

Delegate to certified invoicing system where required.

---

# 472. FISCAL DOCUMENT AUTHORITY

Do not fake certified invoice issuance.

---

# 473. RECEIPT

Generate only if payment status supports it.

---

# 474. CREDIT NOTE

Governed.

---

# 475. DUNNING

Automated reminders.

---

# 476. COLLECTIONS EMPLOYEE INTEGRATION

Can support, but billing core remains deterministic.

---

# 477. BANK RECONCILIATION EMPLOYEE INTEGRATION

Can reconcile payments.

---

# 478. ACCOUNTING EMPLOYEE INTEGRATION

Can prepare accounting exports.

---

# 479. TAX EMPLOYEE INTEGRATION

Can review tax treatment subject to controls.

---

# 480. DOCUMENT EMPLOYEE INTEGRATION

Can create branded commercial documents.

---

# 481. SALES EMPLOYEE INTEGRATION

Can generate quotes/proposals.

---

# 482. CUSTOMER SUCCESS EMPLOYEE INTEGRATION

Can monitor adoption.

---

# 483. AI WORKFORCE MANAGER INTEGRATION

Can monitor active instances.

---

# 484. BILLING IS NOT CONTROLLED BY LLM

Critical invariant.

---

# 485. PAYMENTS ARE NOT CONTROLLED DIRECTLY BY LLM

Critical invariant.

---

# 486. FINANCIAL SIDE EFFECTS

Use ToolCallIntent + Policy + Approval + Idempotency.

---

# 487. HIGH-RISK REFUNDS

Approval.

---

# 488. HIGH-RISK DISCOUNTS

Approval.

---

# 489. CREDIT LIMIT CHANGES

Approval.

---

# 490. FINANCIAL DECISION TRACE

Operational trace.

---

# 491. COMMERCIAL AUDIT REPORT

Generate.

---

# 492. MONTHLY BUSINESS REVIEW

Show:

```text
MRR growth
ARR
churn
expansion
margin
top roles
cost trends
```

---

# 493. PRODUCT REVIEW

By Employee.

---

# 494. PRICING REVIEW

Periodic.

---

# 495. COST REVIEW

Periodic.

---

# 496. CONTRACT REVIEW

Periodic.

---

# 497. DEFINITION OF DONE — PRODUCTIZATION

```text
✓ 500/500 AI Employee Product records
✓ 500/500 Commercial Readiness Passports
✓ every Role can be priced
✓ every Role can be subscribed when eligible
✓ multiple instances supported
✓ teams/departments supported
✓ plans supported
✓ upgrades/downgrades supported
```

---

# 498. DEFINITION OF DONE — REVENUE

```text
✓ usage metering
✓ billing ledger
✓ invoices
✓ payments
✓ MRR
✓ ARR
✓ revenue attribution
✓ cost attribution
✓ contribution margin
✓ profitability by Role
✓ profitability by instance
✓ profitability by customer
```

---

# 499. DEFINITION OF DONE — GOVERNANCE

```text
✓ “Digital Salary” is presentation label only
✓ legal billing descriptor is service/subscription
✓ certification-aware sales
✓ entitlement does not bypass permissions
✓ financial ledger immutable
✓ tenant isolation
✓ audit
✓ security
✓ tax/fiscal layer separated and configurable
```

---

# 500. PRINCÍPIO FINAL

O sistema deve transformar:

```text
500 AI Employees
```

em:

```text
500 COMMERCIAL PRODUCTS
×
MANY ORGANIZATIONS
×
MANY EMPLOYEE INSTANCES
×
SUBSCRIPTIONS
+
USAGE
+
TEAMS
+
DEPARTMENTS
+
CONNECTORS
+
PREMIUM SERVICES
=
RECURRING REVENUE PLATFORM
```

A pergunta económica principal deixa de ser:

```text
“Temos 500 Employees?”
```

e passa a ser:

```text
Quantos Roles estão comercialmente disponíveis?
Quantas instâncias pagas estão activas?
Qual o MRR por Role?
Qual o ARR?
Qual o custo por Employee?
Qual a margem por Employee?
Quais Employees são mais procurados?
Quais são mais rentáveis?
Quais precisam de novo preço?
Quais bundles geram mais expansão?
```

O objectivo final é fazer dos 500 AI Employees uma força de trabalho digital não apenas tecnicamente funcional, mas comercialmente contratável, financeiramente mensurável e escalável.

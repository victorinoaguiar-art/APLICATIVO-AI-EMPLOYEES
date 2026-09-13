# AI EMPLOYEE COMMERCE PRODUCTION HARDENING, BILLING, PAYMENTS & PAID CUSTOMER READINESS

## MASTER IMPLEMENTATION PROMPT

---

# 1. MISSÃO

Atue como:

- Arquiteto Sénior SaaS;
- Especialista em Billing & Subscription Platforms;
- Especialista em Revenue Operations;
- Especialista em pagamentos digitais;
- Especialista em reconciliação financeira;
- Especialista em segurança de pagamentos;
- Especialista em sistemas multi-tenant;
- Especialista em FinOps;
- Especialista em Revenue Recognition;
- Especialista em observabilidade;
- Especialista em SRE;
- Especialista em contratos digitais;
- Especialista em AI Employee Commerce;
- Especialista em sistemas empresariais para Angola e mercados internacionais.

Implemente o módulo:

# **AI Employee Commerce Production Hardening, Billing, Payments & Paid Customer Readiness**

Este módulo deverá transformar a atual:

```text
COMMERCIAL BASELINE v1.0
```

numa plataforma realmente preparada para:

```text
REAL CUSTOMER
→
REAL SUBSCRIPTION
→
REAL DEPLOYMENT
→
REAL USAGE
→
REAL INVOICE
→
REAL PAYMENT
→
REAL RECONCILIATION
→
REAL REVENUE
→
REAL MRR
→
REAL MARGIN
```

---

# 2. BASELINE A PRESERVAR

Consumir:

```text
AETF-500-CERTL3-PRODUCTION-BASELINE-2026.09.11
```

e:

```text
COMMERCIAL-BASELINE-v1.0
```

Preservar:

```text
500 AI Employees no catálogo

490 CERT_L3_APPROVED

10 CERT_L3_WITH_RESTRICTIONS

Marketplace

Search

Pricing

Hiring

Contracts SaaS

Subscriptions básicas

Employee Instances

Usage Metering

Unit Economics

Revenue Dashboard

Commercial API
```

---

# 3. NÃO REABRIR CERTIFICAÇÃO

Não executar novamente:

```text
CERT-L2
CERT-L3
68,500 live tasks
Sample Expansion
Pilot Readiness
Production Freeze
```

salvo trigger material de recertificação.

---

# 4. OBJETIVO CENTRAL

Fechar a diferença entre:

```text
"The system can simulate a commercial transaction."
```

e:

```text
"A real paying customer can be onboarded,
contracted,
activated,
metered,
invoiced,
paid,
reconciled,
renewed
and measured profitably."
```

---

# 5. ESTADO ATUAL A PRESERVAR

Enquanto não existir pagamento real:

```text
REAL_PAID_MRR = 0
```

Nunca alterar esse valor usando:

```text
demo
sandbox
simulation
seed data
fake customers
test payments
```

---

# 6. NOVO ORQUESTRADOR

Criar:

```text
CommerceProductionReadinessEngine
```

responsável por coordenar:

```text
Customer Verification
Commercial Contract
Subscription
Entitlements
Activation
Usage Metering
Billing
Tax Determination
Invoice
Payment
Reconciliation
Collections
Revenue Recognition
Renewal
Churn
Unit Economics
Revenue Operations
```

---

# 7. HARDENING DO PRICING ENGINE

Corrigir a fórmula atual.

Não usar:

```text
Costs + Margin %
```

como cálculo direto.

---

# 8. DIRECT COST

Calcular:

```text
DirectCost =
ModelCost
+ ComputeCost
+ StorageCost
+ ConnectorCost
+ HITLCost
+ SupportCost
+ InfrastructureAllocation
+ RiskReserve
```

---

# 9. PREÇO MÍNIMO

Quando `TargetGrossMargin` representa margem sobre preço:

```text
MinimumSellingPrice
=
DirectCost / (1 - TargetGrossMargin)
```

Exemplo:

```text
DirectCost = 100,000 AOA
TargetGrossMargin = 40%

MinimumSellingPrice
= 166,666.67 AOA
```

---

# 10. PRICING VERSIONING

Criar:

```text
PricingVersion
```

com:

```text
pricing_version_id
employee_id
plan
currency
base_price
included_usage
overage_rates
target_margin
effective_from
effective_to
status
```

---

# 11. PREÇO NÃO DEVE MUDAR RETROATIVAMENTE

Uma alteração futura de preço não deve alterar automaticamente contratos já ativos.

---

# 12. FX RATE ENGINE

Remover taxas cambiais hardcoded.

Criar:

```text
FXRateService
```

---

# 13. FX RATE RECORD

```text
FXRateRecord
```

com:

```text
base_currency
quote_currency
rate
source
effective_at
expires_at
retrieved_at
status
```

---

# 14. ESTADOS DE FX

```text
CURRENT

STALE

UNAVAILABLE

MANUAL_APPROVED
```

---

# 15. FX STALE PROTECTION

Se taxa estiver expirada:

```text
DO NOT SILENTLY USE OLD RATE
```

Aplicar política configurável.

---

# 16. MOEDA DE CONTRATO

Cada subscrição deve possuir:

```text
contract_currency
billing_currency
settlement_currency
```

quando necessário.

---

# 17. SUBSCRIPTION STATE MACHINE

Expandir estados para:

```text
DRAFT

TRIAL

PENDING_ACTIVATION

ACTIVE

PAST_DUE

GRACE_PERIOD

SUSPENDED

CANCEL_AT_PERIOD_END

CANCELLED

EXPIRED

TERMINATED
```

---

# 18. SUBSCRIPTION RECORD

Incluir:

```text
subscription_id
tenant_id
customer_id

employee_instances

plan_id
pricing_version

billing_cycle

currency

started_at
current_period_start
current_period_end

renewal_at

cancel_at_period_end

trial_start
trial_end

status
```

---

# 19. ENTITLEMENTS

Criar:

```text
EntitlementEngine
```

para determinar exatamente:

```text
tasks allowed
tokens
storage
connectors
instances
concurrency
premium tools
HITL allowance
support level
SLA tier
```

---

# 20. NÃO HARD-CODE ENTITLEMENTS NO FRONTEND

O backend é a fonte de verdade.

---

# 21. ACTIVATION GATES — EXPANDIR

Substituir os atuais 5 gates por um conjunto enterprise completo.

No mínimo:

```text
subscription_active

tenant_verified

client_authorization_valid

cpeaa_policy_assigned

approved_workflows_configured

permissions_configured

credentials_valid

connectors_connected

financial_authorization_configured

hitl_configured_if_required

risk_policy_active

certification_valid

billing_profile_ready
```

---

# 22. ATIVAÇÃO

Aplicar:

```text
SUBSCRIBED
≠
ACTIVATED
```

e:

```text
ACTIVATED
≠
UNLIMITED AUTHORITY
```

---

# 23. DEFAULT FINANCIAL AUTHORITY

Manter:

```text
DEFAULT_FINANCIAL_AUTHORITY = DENIED
```

---

# 24. BILLING ENGINE

Criar ou expandir:

```text
AIEmployeeBillingEngine
```

para suportar:

```text
Recurring Charges
Usage Charges
Overages
One-Time Fees
Implementation Fees
Credits
Discounts
Refunds
Proration
Taxes
Late Fees
Manual Adjustments
```

---

# 25. BILLING PERIOD

Suportar:

```text
MONTHLY

ANNUAL

CUSTOM_ENTERPRISE
```

---

# 26. USAGE AGGREGATION

Metering deverá alimentar Billing através de:

```text
UsageEvent
→
UsageAggregation
→
BillableUsage
→
InvoiceLine
```

---

# 27. USAGE EVENT

Manter:

```text
event_id
idempotency_key
tenant_id
instance_id
employee_id

metric
quantity
unit

occurred_at
received_at

source

cost
billable
```

---

# 28. USAGE DEDUPLICATION

Nunca faturar duas vezes o mesmo evento.

Criar:

```text
usage_event_fingerprint
```

---

# 29. BILLABLE METRICS

Suportar:

```text
task
token
document
API call
connector call
workflow
message
storage GB
compute second
HITL approval
premium model execution
```

---

# 30. INVOICE ENGINE

Criar:

```text
InvoiceEngine
```

---

# 31. INVOICE RECORD

```text
invoice_id
invoice_number

tenant_id
customer_id
subscription_id

billing_period

currency

subtotal
discount
tax
credits
total

amount_paid
amount_due

issued_at
due_at

status
```

---

# 32. INVOICE STATUS

```text
DRAFT

OPEN

PARTIALLY_PAID

PAID

OVERDUE

VOID

CANCELLED
```

---

# 33. INVOICE LINES

Cada fatura deverá explicar:

```text
Employee Subscription

Employee Instances

Included Usage

Overage Usage

Premium Connectors

HITL

Implementation

Other Charges
```

---

# 34. TAX ENGINE SEPARADO

Criar:

```text
TaxDeterminationEngine
```

Não colocar regras fiscais diretamente no:

```text
PricingEngine
```

---

# 35. TAX FLOW

```text
Commercial Price
↓
Customer Jurisdiction
↓
Tax Determination
↓
Invoice
```

---

# 36. JURISDICTION PROFILE

```text
TaxProfile
```

com:

```text
country
tax_id
customer_type
tax_registration
applicable_tax_rules
effective_date
```

---

# 37. ANGOLA

A arquitetura deve suportar:

```text
NIF
AOA
requisitos locais de faturação
regras fiscais configuráveis
```

sem tornar essas regras hardcoded para todos os países.

---

# 38. NÃO INVENTAR CONFORMIDADE FISCAL

Se uma integração fiscal ou requisito legal não tiver sido validado:

```text
NOT_YET_VERIFIED
```

---

# 39. PAYMENT ORCHESTRATION

Criar:

```text
PaymentOrchestrationEngine
```

---

# 40. PAYMENT PROVIDER ABSTRACTION

Criar adapters:

```text
PaymentProviderAdapter
```

para permitir integrar diferentes:

```text
bank transfer
card
reference payment
mobile payment
direct debit
payment gateway
enterprise invoicing
```

conforme cada mercado.

---

# 41. NÃO CODIFICAR UM ÚNICO PROVIDER

Usar interface:

```text
authorize()
capture()
confirm()
refund()
void()
getStatus()
verifyWebhook()
```

---

# 42. PAYMENT RECORD

```text
payment_id

invoice_id
customer_id
tenant_id

provider
provider_reference

amount
currency

payment_method

initiated_at
confirmed_at

status

is_real_payment
environment
```

---

# 43. PAYMENT STATUS

```text
PENDING

AUTHORIZED

PROCESSING

PAID

FAILED

CANCELLED

REFUNDED

PARTIALLY_REFUNDED

CHARGEBACK

EXPIRED
```

---

# 44. REAL VS SIMULATED PAYMENT

Obrigatório:

```text
REAL_PAYMENT
SANDBOX_PAYMENT
SIMULATED_PAYMENT
```

Nunca misturar.

---

# 45. PAYMENT SECURITY

Nunca guardar diretamente:

```text
raw card number
CVV
payment credentials
bank passwords
```

Usar tokens/referências seguras fornecidas por providers.

---

# 46. WEBHOOK SECURITY

Todos os webhooks de pagamento devem validar:

```text
provider signature
timestamp
event id
replay protection
```

---

# 47. WEBHOOK IDEMPOTENCY

Mesmo evento enviado 10 vezes deve produzir:

```text
1 business effect
```

---

# 48. IDEMPOTENCY GLOBAL

Obrigatória para:

```text
hire

create subscription

activate

invoice

payment

refund

upgrade

downgrade

renewal

cancellation

deployment
```

---

# 49. IDEMPOTENCY RECORD

```text
idempotency_key
operation
tenant
request_hash
response_reference
created_at
expires_at
```

---

# 50. RECONCILIATION ENGINE

Criar:

```text
PaymentReconciliationEngine
```

---

# 51. RECONCILIATION FLOW

```text
Invoice
↓
Expected Payment
↓
Provider Transaction
↓
Bank / Settlement Evidence
↓
Matching
↓
Reconciled
```

---

# 52. RECONCILIATION STATUS

```text
MATCHED

PARTIALLY_MATCHED

UNMATCHED

OVERPAID

UNDERPAID

DUPLICATE

REFUND_PENDING

MANUAL_REVIEW
```

---

# 53. AUTOMATIC MATCHING

Usar quando disponível:

```text
invoice reference

payment reference

customer

amount

currency

date

provider transaction id
```

---

# 54. MANUAL RECONCILIATION

Permitir revisão humana para exceções.

---

# 55. BILLING LEDGER

Criar:

```text
CommercialBillingLedger
```

append-only para eventos financeiros comerciais.

---

# 56. LEDGER EVENTS

```text
SUBSCRIPTION_CREATED

INVOICE_ISSUED

PAYMENT_RECEIVED

PAYMENT_RECONCILED

CREDIT_ISSUED

REFUND_ISSUED

WRITE_OFF

REVENUE_RECOGNIZED
```

---

# 57. NÃO USAR O LEDGER COMO CONTABILIDADE LEGAL POR DEFEITO

É um:

```text
commercial subledger
```

que pode posteriormente integrar ERP/contabilidade.

---

# 58. REVENUE RECOGNITION

Criar:

```text
RevenueRecognitionEngine
```

separando:

```text
BOOKED
BILLED
COLLECTED
RECOGNIZED
```

---

# 59. NÃO CONFUNDIR MRR COM CASH

Aplicar:

```text
MRR
≠
Cash Collected
```

---

# 60. REAL MRR

Somente incluir:

```text
eligible active recurring subscriptions
```

conforme regra definida.

---

# 61. MRR COMPONENTS

Calcular:

```text
New MRR

Expansion MRR

Contraction MRR

Churned MRR

Reactivation MRR
```

---

# 62. ARR

Calcular com metodologia documentada.

---

# 63. ACTUAL VS PROJECTED

Todas as métricas devem indicar:

```text
ACTUAL

PROJECTED

SIMULATED
```

---

# 64. GROSS MARGIN

Separar:

```text
PROJECTED_GROSS_MARGIN

ACTUAL_GROSS_MARGIN
```

---

# 65. ACTUAL UNIT ECONOMICS

Após clientes reais:

```text
Actual Revenue
-
Actual Model Cost
-
Actual API Cost
-
Actual Compute
-
Actual Connector
-
Actual HITL
-
Actual Support Allocation
=
Actual Contribution Margin
```

---

# 66. DUNNING ENGINE

Criar:

```text
DunningEngine
```

para pagamentos em atraso.

---

# 67. DUNNING FLOW

```text
PAYMENT FAILED
↓
RETRY / NOTIFY
↓
GRACE PERIOD
↓
PAST DUE
↓
LIMITED SERVICE OR SUSPENSION
↓
COLLECTION / CANCELLATION
```

---

# 68. NÃO SUSPENDER CRITICAMENTE SEM POLÍTICA

Clientes enterprise podem exigir:

```text
grace period
manual approval
service continuity policy
```

---

# 69. CUSTOMER NOTIFICATIONS

Criar notificações para:

```text
invoice issued
payment due
payment failed
payment received
overdue
trial ending
renewal
usage threshold
suspension risk
```

---

# 70. COLLECTIONS

Criar:

```text
CollectionsRecord
```

com:

```text
customer
invoice
amount_due
days_overdue
collection_stage
owner
last_contact
next_action
```

---

# 71. CREDIT NOTES

Suportar:

```text
CreditNote
```

para ajustes comerciais.

---

# 72. REFUNDS

Suportar:

```text
full refund
partial refund
```

com rastreabilidade.

---

# 73. PRORATION

Upgrade/downgrade durante período deve suportar:

```text
proration
```

configurável.

---

# 74. UPGRADE

Fluxo:

```text
Current Plan
↓
New Plan
↓
Price Difference
↓
Entitlement Update
↓
Invoice Adjustment
↓
MRR Update
```

---

# 75. DOWNGRADE

Nunca remover acesso antes da data definida pela política contratual sem necessidade.

---

# 76. ADD INSTANCES

Permitir:

```text
1 → 5 → 20
```

Employee Instances dentro da mesma subscrição.

---

# 77. REMOVE INSTANCES

Preservar:

```text
audit history
usage history
evidence
billing history
```

---

# 78. RENEWAL ENGINE

Criar:

```text
RenewalEngine
```

---

# 79. RENEWAL RECORD

```text
renewal_id
subscription_id
current_terms
proposed_terms
current_price
new_price
renewal_date
status
```

---

# 80. RENEWAL STATUS

```text
UPCOMING

OFFERED

ACCEPTED

RENEWED

DECLINED

EXPIRED
```

---

# 81. CHURN

Distinguir:

```text
voluntary churn
involuntary churn
```

---

# 82. CHURN REASONS

```text
price
low usage
missing integration
performance
payment failure
business closure
migration
temporary pause
other
```

---

# 83. CUSTOMER SUCCESS

Criar:

```text
CustomerSuccessEngine
```

---

# 84. CUSTOMER HEALTH

Monitorizar:

```text
activation completion

usage adoption

business value

incidents

support load

payment status

renewal risk
```

---

# 85. NÃO ESCONDER RISCO DE CHURN EM SCORE ÚNICO

Manter dimensões separadas.

---

# 86. CONTRACT HARDENING

Separar claramente:

```text
terms_hash
```

de:

```text
contract_acceptance
```

---

# 87. CONTRACT ACCEPTANCE RECORD

```text
contract_id
contract_version
terms_hash

customer_id

authorized_signatory
acceptance_method

accepted_at

signature_status

signature_reference
```

---

# 88. SHA-256

Serve para:

```text
integrity
```

não para provar consentimento por si só.

---

# 89. CONTRACT VERSIONING

Alterações materiais criam:

```text
new contract version
```

---

# 90. CUSTOMER / COMPANY VERIFICATION

Criar:

```text
CustomerVerificationProfile
```

com:

```text
legal_name
commercial_name
tax_id
country
billing_address
authorized_contacts
status
```

---

# 91. CUSTOMER STATUS

```text
PENDING_VERIFICATION

VERIFIED

RESTRICTED

SUSPENDED
```

---

# 92. PAID CUSTOMER READINESS GATE

Criar:

```text
PAID_CUSTOMER_READINESS_GATE
```

---

# 93. GATE COMPONENTS

Exigir:

```text
Customer Verification = PASS

Contract = PASS

Subscription = PASS

Billing Profile = PASS

Tax Profile = PASS

Payment Method / Terms = PASS

Activation = PASS

Entitlements = PASS

Security = PASS

Audit = PASS

Support = PASS

Monitoring = PASS
```

---

# 94. FIRST PAID CUSTOMER STATE

Somente quando houver pagamento real confirmado:

```text
FIRST_REAL_PAID_CUSTOMER = TRUE
```

---

# 95. FIRST REAL MRR

Criar evento:

```text
FIRST_REAL_MRR_RECORDED
```

---

# 96. NÃO GERAR EVENTO POR TESTE

Sandbox:

```text
DOES NOT COUNT
```

---

# 97. OBSERVABILITY

Criar métricas para:

```text
billing success rate

payment success rate

payment latency

webhook latency

invoice generation failures

reconciliation backlog

unmatched payments

dunning volume

refund volume
```

---

# 98. SLOs

Definir SLOs internos para operações comerciais.

---

# 99. ALERTAS

Exemplos:

```text
invoice generation failure

duplicate invoice detected

payment webhook failure

unreconciled payment

billing mismatch

negative margin

subscription active but deployment missing

deployment active but subscription inactive
```

---

# 100. CONSISTENCY GUARDS

Criar regras como:

```text
ACTIVE INSTANCE
requires
ACTIVE SUBSCRIPTION
```

---

# 101. OUTRA REGRA

```text
PAID INVOICE
must have
confirmed payment evidence
```

---

# 102. OUTRA REGRA

```text
REAL_PAID_MRR > 0
requires
at least one real eligible subscription
```

---

# 103. OUTRA REGRA

```text
ACTIVE SUBSCRIPTION
does not automatically imply
ACTIVE DEPLOYMENT
```

---

# 104. SECURITY HARDENING

Executar testes sobre:

```text
billing tampering

price manipulation

coupon abuse

tenant invoice leakage

payment replay

webhook forgery

privilege escalation

refund abuse

subscription bypass

entitlement bypass
```

---

# 105. MULTI-TENANT FINANCIAL ISOLATION

Um tenant nunca pode:

```text
view
modify
pay
refund
```

invoice de outro tenant.

---

# 106. RBAC COMMERCIAL

Criar papéis:

```text
ACCOUNT_OWNER

BILLING_ADMIN

FINANCE_ADMIN

TENANT_ADMIN

AUDITOR

SUPPORT_AGENT

REVOPS_ADMIN
```

---

# 107. SEGREGATION OF DUTIES

Exemplo:

```text
support agent
≠
refund approver
```

quando aplicável.

---

# 108. REFUND APPROVAL

Grandes refunds podem exigir dupla aprovação.

---

# 109. COMMERCIAL AUDIT LOG

Registar:

```text
actor

tenant

operation

before

after

reason

timestamp

correlation_id
```

---

# 110. API HARDENING

Implementar ou expandir:

```text
POST /api/v1/commerce/subscriptions

PATCH /api/v1/commerce/subscriptions/:id

POST /api/v1/commerce/subscriptions/:id/upgrade

POST /api/v1/commerce/subscriptions/:id/downgrade

POST /api/v1/commerce/subscriptions/:id/cancel

POST /api/v1/commerce/invoices

GET /api/v1/commerce/invoices

GET /api/v1/commerce/invoices/:id

POST /api/v1/commerce/payments

GET /api/v1/commerce/payments/:id

POST /api/v1/commerce/payments/webhooks/:provider

POST /api/v1/commerce/refunds

GET /api/v1/commerce/reconciliation

POST /api/v1/commerce/reconciliation/:id/resolve

GET /api/v1/commerce/collections

GET /api/v1/commerce/revenue-recognition

GET /api/v1/commerce/revops
```

---

# 111. IDEMPOTENCY HEADER

Operações financeiras mutáveis devem aceitar:

```text
Idempotency-Key
```

---

# 112. CORRELATION ID

Toda cadeia:

```text
Hire
→ Subscription
→ Deployment
→ Usage
→ Invoice
→ Payment
```

deve ser rastreável.

---

# 113. DATA MODEL

Criar ou validar tabelas para:

```text
customers

customer_verification

contracts

contract_acceptances

subscriptions

subscription_items

plans

pricing_versions

entitlements

employee_instances

usage_events

usage_aggregates

invoices

invoice_lines

payments

payment_attempts

payment_webhooks

refunds

credit_notes

reconciliation_records

collections

revenue_recognition

fx_rates

tax_profiles

renewals

commercial_audit_events
```

---

# 114. INDEXES

Adicionar índices para:

```text
tenant_id
customer_id
subscription_id
invoice_id
payment_id
provider_reference
idempotency_key
event_id
```

---

# 115. UNIQUE CONSTRAINTS

Aplicar onde necessário:

```text
invoice_number
provider_reference
idempotency_key scoped by operation
usage_event_id
```

---

# 116. COMMERCIAL DASHBOARD

Criar:

# Revenue Operations Center

Mostrar:

```text
Real Paid MRR

ARR

Billed Revenue

Collected Cash

Recognized Revenue

Outstanding Receivables

Overdue Amount

Active Subscriptions

Past Due

Churn

Expansion MRR

Gross Margin

Contribution Margin
```

---

# 117. PAYMENT DASHBOARD

Mostrar:

```text
Payment Attempts

Success Rate

Failures

Pending

Unmatched

Refunds

Chargebacks
```

quando aplicável.

---

# 118. BILLING DASHBOARD

Mostrar:

```text
Invoices Issued

Paid

Partially Paid

Overdue

Average Days to Pay

Unbilled Usage
```

---

# 119. CUSTOMER 360

Por cliente:

```text
Employees contracted

Instances

Usage

Invoices

Payments

MRR

Margin

Support

Incidents

Renewal date
```

---

# 120. EMPLOYEE ECONOMICS

Por AI Employee:

```text
Subscribers

Instances

MRR

Usage Revenue

Cost

Gross Profit

Margin

Support Cost

Churn
```

---

# 121. DO NOT FAKE METRICS

Se ainda não houver dados:

```text
Actual CAC = NOT_ENOUGH_DATA

Actual LTV = NOT_ENOUGH_DATA
```

em vez de gerar valores fictícios.

---

# 122. END-TO-END TEST — CUSTOMER

Criar cliente de teste claramente identificado:

```text
TEST_CUSTOMER
```

Nunca apresentá-lo como real.

---

# 123. TEST FLOW

Executar:

```text
Create Customer
↓
Verify Customer
↓
Create Contract
↓
Accept Terms
↓
Create Subscription
↓
Configure Activation
↓
Activate Employee Instance
↓
Record Usage
↓
Aggregate Usage
↓
Generate Invoice
↓
Process Sandbox Payment
↓
Reconcile
↓
Recognize Revenue as SIMULATED
```

---

# 124. PAYMENT IDEMPOTENCY TEST

Enviar 5 vezes:

```text
same payment confirmation
```

Resultado:

```text
1 payment effect
4 duplicates ignored/rejected
```

---

# 125. INVOICE IDEMPOTENCY TEST

Mesma billing period:

```text
1 valid recurring invoice
```

salvo ajuste legítimo.

---

# 126. WEBHOOK REPLAY TEST

Webhook repetido:

```text
must not duplicate payment
```

---

# 127. CROSS-TENANT BILLING TEST

Tenant A tenta consultar invoice de Tenant B:

```text
DENIED
```

---

# 128. PRICE TAMPERING TEST

Frontend envia preço menor que backend:

```text
SERVER RECOMPUTES PRICE
```

Nunca confiar no preço do cliente.

---

# 129. ENTITLEMENT BYPASS TEST

Plano Starter tenta usar função Enterprise:

```text
DENIED
```

---

# 130. ACTIVATION BYPASS TEST

Subscrição ativa mas gates incompletos:

```text
DEPLOYMENT BLOCKED
```

---

# 131. OVERDUE POLICY TEST

Testar:

```text
PAST_DUE
→ GRACE_PERIOD
→ SUSPENSION
```

de acordo com política.

---

# 132. UPGRADE TEST

```text
1 instance
→
5 instances
```

Validar:

```text
entitlements
billing
deployment
MRR
```

---

# 133. DOWNGRADE TEST

Validar:

```text
proration
entitlements
future billing
```

---

# 134. CANCELLATION TEST

Cancelar:

```text
renewal
```

sem apagar:

```text
history
evidence
invoices
payments
usage
```

---

# 135. REFUND TEST

Testar refund parcial e total.

---

# 136. RECONCILIATION TEST

Criar:

```text
exact payment
partial payment
overpayment
unknown payment
duplicate payment
```

e verificar classificação.

---

# 137. REAL CUSTOMER GO-LIVE CHECKLIST

Antes do primeiro cliente real:

```text
production payment provider ready

production billing ready

tax configuration reviewed

contract reviewed

support channel active

incident response active

commercial monitoring active

backup and recovery verified

security review passed

tenant isolation passed
```

---

# 138. NÃO MARCAR PROVIDER COMO REAL SEM CREDENCIAIS PRODUTIVAS

Usar:

```text
PRODUCTION_CONNECTED
SANDBOX_CONNECTED
NOT_CONNECTED
```

---

# 139. PAID CUSTOMER READINESS STATUS

Criar:

```text
NOT_READY

SANDBOX_READY

PILOT_CUSTOMER_READY

PAID_CUSTOMER_READY

PRODUCTION_HARDENED
```

---

# 140. CRITÉRIO PARA PAID_CUSTOMER_READY

Exigir:

```text
billing = PASS

payment = PASS

reconciliation = PASS

contract = PASS

activation = PASS

security = PASS

audit = PASS

support = PASS

monitoring = PASS
```

---

# 141. CRITÉRIO PARA PRODUCTION_HARDENED

Adicionar:

```text
real customer transaction evidence
real payment evidence
real reconciliation evidence
incident-free monitored operation
```

ou histórico suficiente definido pela governança.

---

# 142. FIRST CUSTOMER PILOT

Primeiro cliente pagante deve começar com:

```text
limited scope
limited Employees
controlled financial authority
enhanced monitoring
clear support owner
```

---

# 143. NÃO LANÇAR TODOS OS 500 DE UMA VEZ PARA PRIMEIRO CLIENTE

Marketplace continua com 500 disponíveis, mas implantação real deve seguir necessidade do cliente.

---

# 144. FIRST PAID CUSTOMER EVIDENCE BUNDLE

Criar:

```text
PaidCustomerEvidenceBundle
```

com:

```text
customer verification

contract

subscription

activation gates

deployment receipt

usage events

invoice

payment confirmation

reconciliation

revenue event

support evidence
```

---

# 145. REAL MRR EVENT

Somente após:

```text
eligible subscription
+
real bill
+
commercially valid recurring commitment
```

conforme política de MRR.

---

# 146. CASH EVENT

Separado:

```text
PAYMENT_COLLECTED
```

---

# 147. REVENUE EVENT

Separado:

```text
REVENUE_RECOGNIZED
```

---

# 148. COMMERCIAL BASELINE v2

Após implementação, criar:

```text
AI-EMPLOYEE-COMMERCE-PRODUCTION-BASELINE-v2
```

---

# 149. NÃO SUBSTITUIR CERT BASELINE

Manter:

```text
AETF CERTIFICATION BASELINE
```

separada.

---

# 150. MANIFEST

Gerar:

```text
generated/AIEmployee_CommerceProductionHardening_Manifest.json
```

---

# 151. MANIFEST CONTENT

Incluir:

```text
billing_engine

payment_engine

providers

reconciliation

tax engine

subscription lifecycle

dunning

renewals

refunds

idempotency

security tests

API endpoints

database migrations

dashboards

readiness status

real_paid_mrr

simulation metrics
```

---

# 152. IMPLEMENTATION REPORT

Gerar:

# AI Employee Commerce Production Hardening, Billing, Payments & Paid Customer Readiness Report

---

# 153. REPORT SECTIONS

Incluir:

```text
1. Executive Summary

2. Baseline Consumed

3. Pricing Hardening

4. Subscription Lifecycle

5. Billing Engine

6. Invoice Engine

7. Tax Architecture

8. Payment Orchestration

9. Payment Security

10. Reconciliation

11. Collections & Dunning

12. Revenue Recognition

13. Renewal & Churn

14. Activation Hardening

15. Security & Idempotency

16. API & Database

17. RevOps Dashboards

18. Paid Customer Readiness Gate

19. Test Evidence

20. Remaining External Dependencies

21. Real Revenue Status
```

---

# 154. FINAL STATUS MUST BE TRUTHFUL

Se não houver cliente pagante:

```text
REAL_PAID_CUSTOMERS = 0

REAL_PAID_MRR = 0 AOA
```

---

# 155. SE SANDBOX ESTIVER COMPLETO

Usar:

```text
PAID_CUSTOMER_READINESS:
SANDBOX_READY
```

ou:

```text
PILOT_CUSTOMER_READY
```

conforme evidência.

---

# 156. SOMENTE USAR PAID_CUSTOMER_READY QUANDO REALMENTE APTO

Não promover por quota.

---

# 157. NÃO INVENTAR EXTERNAL DEPENDENCIES

Se payment provider não estiver integrado:

```text
BLOCKED_BY_PAYMENT_PROVIDER_INTEGRATION
```

---

# 158. NÃO INVENTAR FATURA LEGALMENTE VÁLIDA

Se requisitos fiscais ainda não estiverem validados:

```text
BILLING_ENGINE_READY
TAX_COMPLIANCE_PENDING
```

---

# 159. NÃO INVENTAR CONTRATO VINCULATIVO

Se assinatura/aceitação ainda for apenas demo:

```text
CONTRACT_ACCEPTANCE_SANDBOX
```

---

# 160. PRINCÍPIO FINAL

Aplicar:

```text
MARKETPLACE MAKES THE EMPLOYEE BUYABLE.

BILLING MAKES THE SERVICE CHARGEABLE.

PAYMENTS MAKE THE REVENUE COLLECTIBLE.

RECONCILIATION MAKES THE CASH AUDITABLE.

REVENUE OPERATIONS MAKE THE BUSINESS SCALABLE.
```

---

# 161. COMANDO FINAL

Implemente agora:

# **AI Employee Commerce Production Hardening, Billing, Payments & Paid Customer Readiness**

Preserve:

```text
500 CERT-L3 AI Employees

Commercial Baseline v1.0

Marketplace

Hiring

Instances

Metering
```

Corrija:

```text
Pricing Floor

FX hardcoding

Activation Gates

Contract acceptance semantics

Actual vs projected metrics
```

Implemente:

```text
Subscription Lifecycle

Entitlements

Billing

Invoices

Tax Determination

Payments

Payment Adapters

Webhooks

Idempotency

Reconciliation

Collections

Dunning

Credits

Refunds

Renewals

Churn

Revenue Recognition

Commercial Ledger

RevOps Dashboards

Paid Customer Readiness Gate
```

Teste integralmente:

```text
customer
→
contract
→
subscription
→
activation
→
usage
→
invoice
→
payment
→
reconciliation
→
revenue
→
margin
→
renewal
```

Não invente clientes.

Não invente pagamentos.

Não invente MRR.

Não invente reconciliação.

Não chame sandbox de produção.

Não chame hash de assinatura.

Não chame preço projetado de receita real.

Não chame margem estimada de margem realizada.

O sistema final deve conseguir responder, com evidência auditável:

```text
WHO IS THE CUSTOMER?

WHAT DID THEY BUY?

WHICH AI EMPLOYEES WERE ACTIVATED?

WHAT DID THEY USE?

WHAT SHOULD THEY BE BILLED?

WAS AN INVOICE ISSUED?

DID THEY ACTUALLY PAY?

WAS THE PAYMENT RECONCILED?

HOW MUCH REAL MRR EXISTS?

HOW MUCH CASH WAS COLLECTED?

HOW MUCH REVENUE WAS RECOGNIZED?

WHAT DID THE SERVICE COST?

WHAT IS THE ACTUAL MARGIN?

IS THE CUSTOMER RENEWING?

IS THE CUSTOMER EXPANDING?
```

O marco final deste desenvolvimento deverá ser:

```text
AI EMPLOYEE COMMERCE
PRODUCTION HARDENED

PAID CUSTOMER READINESS
VERIFIED

READY FOR
FIRST REAL PAYING CUSTOMER
```

e, posteriormente, somente após existir evidência real:

```text
FIRST REAL PAYING CUSTOMER = CONFIRMED

FIRST REAL MRR = RECORDED

FIRST REAL PAYMENT = RECONCILED

FIRST ACTUAL COMMERCIAL MARGIN = MEASURED
```
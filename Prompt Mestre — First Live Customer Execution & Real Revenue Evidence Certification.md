# PROMPT MESTRE

## FIRST LIVE CUSTOMER EXECUTION & REAL REVENUE EVIDENCE CERTIFICATION

Actue como um **Chief Product Officer, Chief Revenue Officer, SaaS Operations Architect, Customer Onboarding Architect, Revenue Operations Specialist, FinOps Specialist, Audit & Compliance Architect, Security Architect e Senior Software Engineer**.

Está a trabalhar na **AI Employees Platform AETF-500 v2.0**, cuja arquitectura técnica e comercial já se encontra preparada para receber o primeiro cliente pagante externo.

A plataforma encontra-se actualmente no estado:

```text
PILOT_CUSTOMER_READY
```

Baseline técnica:

```text
AETF-500-CERTL3-PRODUCTION-BASELINE-2026.09.11
```

Baseline comercial:

```text
COMMERCIAL-BASELINE-v2.0
```

Os 500 AI Employees encontram-se certificados em:

```text
500 / 500 CERT-L3
```

A arquitectura de:

- marketplace;
- contratação;
- subscrição;
- provisioning;
- billing;
- pagamentos;
- onboarding;
- controlo por ondas;
- readiness gates;
- First Day Wizard;
- classificação de risco;
- First Time to Value;
- cálculo de custos;
- margem;
- customer health;
- renovação;
- auditoria;

já se encontra tecnicamente implementada.

O objectivo desta fase **não é criar mais uma nova arquitectura comercial**.

O objectivo é:

# EXECUTAR O PRIMEIRO CLIENTE EXTERNO REAL EM PRODUÇÃO CONTROLADA

e capturar todas as evidências necessárias para converter:

```text
PILOT_CUSTOMER_READY
```

em:

```text
FIRST_PAID_CUSTOMER_VALIDATED
```

e posteriormente:

```text
REAL_REVENUE_VALIDATED
```

---

# 1. OBJECTIVO CENTRAL

Desenvolva e implemente o módulo:

# FIRST LIVE CUSTOMER EXECUTION & EVIDENCE CAPTURE ENGINE

Este módulo deverá executar, controlar, observar e provar todo o ciclo do primeiro cliente real:

```text
REAL CUSTOMER
↓
REAL IDENTITY
↓
REAL CONTRACT
↓
REAL INVOICE
↓
REAL PAYMENT
↓
REAL SETTLEMENT
↓
REAL RECONCILIATION
↓
REAL TENANT
↓
REAL AI EMPLOYEE
↓
REAL CUSTOMER DATA
↓
REAL TASK
↓
REAL RESULT
↓
REAL CUSTOMER ACCEPTANCE
↓
REAL VALUE
↓
REAL USAGE
↓
REAL COST
↓
REAL MARGIN
↓
REAL REVENUE
↓
REAL RETENTION SIGNAL
```

Nenhum evento de teste, mock, sandbox ou simulação poderá ser utilizado como substituto de evidência de produção real.

---

# 2. CORRECÇÃO OBRIGATÓRIA DA MARGEM

Antes do freeze desta baseline, corrigir formalmente a margem de contribuição do exemplo comercial.

Valores:

```text
Monthly Contract Value: 180.000 AOA

AI Cost:              8.200 AOA
Infrastructure Cost:  3.400 AOA
API Cost:             1.200 AOA
Support Cost:         5.000 AOA

Total Variable Cost: 17.800 AOA
```

Cálculo:

```text
180.000 - 17.800 = 162.200 AOA
```

Margem percentual:

```text
162.200 / 180.000 × 100 = 90,11%
```

Portanto:

```text
Contribution Margin:
162.200 AOA

Contribution Margin %:
90,11%
```

Corrigir qualquer ocorrência de:

```text
89,1%
```

para:

```text
90,11%
```

Verificar:

- código;
- testes;
- fixtures;
- dashboards;
- documentação;
- relatórios;
- schemas;
- APIs;
- scorecards;
- exemplos;
- seeds.

Adicionar teste automático que valide esta fórmula.

---

# 3. SEPARAÇÃO FORMAL ENTRE MÉTRICAS DE TESTE E PRODUÇÃO REAL

Criar obrigatoriamente:

```text
METRIC_SOURCE
```

com pelo menos os seguintes valores:

```text
SIMULATED
CONTROLLED_TEST
STAGING
REAL_PRODUCTION
```

Nenhuma métrica poderá ser utilizada para certificação comercial real sem:

```text
source = REAL_PRODUCTION
```

---

# 4. MODELO DE MÉTRICA AUDITÁVEL

Cada KPI deverá possuir:

```yaml
metric_id:
metric_name:
metric_value:
unit:

source:
SIMULATED | CONTROLLED_TEST | STAGING | REAL_PRODUCTION

customer_id:
employee_id:
employee_instance_id:

measurement_window_start:
measurement_window_end:

evidence_id:
calculation_method:
calculation_version:

created_at:
validated_at:

validated_by:
```

Exemplo:

```yaml
metric_id: METRIC-000001

metric_name: hours_saved
metric_value: 18.5
unit: hours_per_month

source: REAL_PRODUCTION

customer_id: CUSTOMER-000001
employee_id: AETF-037

measurement_window_start: 2026-09-15
measurement_window_end: 2026-10-15

evidence_id: PROD-EVIDENCE-000237

validated_by: ValueValidationEngine
```

---

# 5. PROIBIÇÃO DE CONTAMINAÇÃO DE MÉTRICAS

O sistema deverá bloquear automaticamente qualquer tentativa de usar métricas:

```text
SIMULATED
CONTROLLED_TEST
STAGING
```

para declarar:

```text
FIRST_PAID_CUSTOMER_VALIDATED
```

ou:

```text
REAL_REVENUE_VALIDATED
```

Criar regra:

```text
IF metric.source != REAL_PRODUCTION
THEN metric.eligible_for_real_revenue_certification = false
```

---

# 6. LIVE CUSTOMER IDENTIFICATION

O primeiro cliente real deverá receber um identificador permanente:

```text
CUSTOMER-000001
```

Criar:

```text
LIVE_CUSTOMER_RECORD
```

com:

- entidade legal;
- nome comercial;
- identificação fiscal;
- contactos autorizados;
- endereço comercial;
- país;
- moeda;
- sector;
- contrato;
- plano;
- Employee contratado;
- supervisor humano;
- método de pagamento;
- data de activação;
- tenant;
- estado da relação comercial.

---

# 7. LIVE CUSTOMER VERIFICATION

Antes da contratação, gerar:

```text
LIVE_CUSTOMER_VERIFIED
```

Validar:

- existência da entidade;
- dados fiscais;
- representante autorizado;
- contactos;
- contrato;
- consentimentos;
- termos;
- billing identity;
- moeda;
- país;
- requisitos regulatórios aplicáveis.

Criar evidência associada.

---

# 8. REAL CONTRACT EVIDENCE

Quando o contrato real for aceite:

```text
LIVE_CONTRACT_SIGNED
```

Gerar:

```text
CONTRACT-EVIDENCE-000001
```

Guardar:

- contrato;
- versão;
- cliente;
- Employee;
- plano;
- preço;
- moeda;
- impostos;
- período;
- data;
- assinatura ou mecanismo equivalente;
- hash;
- timestamp;
- parties;
- termos comerciais.

---

# 9. REAL INVOICE

Criar factura real:

```text
LIVE_INVOICE_ISSUED
```

Gerar:

```text
INVOICE-EVIDENCE-000001
```

Campos:

- invoice_id;
- customer_id;
- contract_id;
- subscription_id;
- amount;
- tax;
- currency;
- due_date;
- issue_date;
- billing_period;
- payment_reference;
- status.

---

# 10. REAL PAYMENT

O sistema deverá distinguir claramente:

```text
PAYMENT_CREATED
PAYMENT_AUTHORIZED
PAYMENT_RECEIVED
PAYMENT_SETTLED
PAYMENT_RECONCILED
```

A existência de:

```text
PAYMENT_RECEIVED
```

não será suficiente isoladamente.

Para validação financeira deverá existir:

```text
PAYMENT_SETTLED
+
PAYMENT_RECONCILED
```

---

# 11. PAYMENT EVIDENCE

Gerar:

```text
PAYMENT-EVIDENCE-000001
SETTLEMENT-EVIDENCE-000001
RECONCILIATION-EVIDENCE-000001
```

Nunca guardar credenciais bancárias sensíveis directamente no Evidence Vault.

Guardar apenas:

- IDs;
- referências;
- hashes;
- timestamps;
- valores;
- estado;
- origem;
- operador;
- sistemas envolvidos.

---

# 12. TENANT REAL

Após pagamento válido:

```text
LIVE_TENANT_CREATED
```

Criar tenant segregado.

Validar:

- isolamento;
- permissões;
- logs;
- credenciais;
- data segregation;
- knowledge isolation;
- customer configuration.

Gerar:

```text
TENANT-EVIDENCE-000001
```

---

# 13. CONTRATAÇÃO REAL DO AI EMPLOYEE

Executar:

```text
LIVE_EMPLOYEE_HIRED
```

Criar:

```text
employee_instance_id:
AETF-XXX-CUSTOMER000001-INSTANCE001
```

Registar:

- Employee base;
- versão;
- capabilities;
- plan;
- customer;
- department;
- supervisor;
- autonomy policy;
- tools;
- knowledge;
- integrations;
- limits.

---

# 14. 23 PRODUCTION READINESS GATES

Executar os 23 gates existentes com dados reais do cliente.

Cada gate deverá produzir:

```text
PASS
FAIL
BLOCKED
WAIVED
```

Qualquer waiver deverá exigir:

- motivo;
- operador;
- aprovação;
- expiração;
- risco;
- evidência.

Para entrada em produção:

```text
CRITICAL_GATE_FAIL = 0
```

---

# 15. CUSTOMER PRODUCTION EVIDENCE

Quando todos os gates forem aprovados:

```text
LIVE_CUSTOMER_READY_FOR_CONTROLLED_PRODUCTION
```

Gerar:

```text
READINESS-EVIDENCE-000001
```

---

# 16. FIRST DAY AT WORK REAL

Executar o wizard de 20 passos com:

- dados reais;
- políticas reais;
- supervisor real;
- ferramentas reais;
- integrações reais;
- limites reais.

Quando concluído:

```text
FIRST_DAY_COMPLETED
```

Gerar:

```text
FIRST-DAY-EVIDENCE-000001
```

---

# 17. CONTROLLED PAID PRODUCTION

Mudar Employee para:

```text
CONTROLLED_PAID_PRODUCTION
```

Esta deverá ser a primeira fase real de execução externa.

Durante a WAVE 1 manter:

- feature flags;
- limites conservadores;
- observabilidade aumentada;
- human oversight;
- kill switch;
- rollback;
- rate limits;
- cost ceilings.

---

# 18. PRIMEIRA TAREFA REAL

Executar uma tarefa real do cliente.

Não utilizar tarefa criada artificialmente apenas para passar certificação.

Gerar:

```text
FIRST_REAL_TASK_STARTED
FIRST_REAL_TASK_COMPLETED
FIRST_REAL_TASK_REVIEWED
FIRST_REAL_TASK_ACCEPTED
```

---

# 19. FIRST REAL TASK EVIDENCE

Criar:

```text
TASK-EVIDENCE-000001
```

Registar:

- customer;
- Employee;
- input;
- origem;
- data;
- risco;
- políticas;
- ferramentas;
- modelo;
- workflow;
- duration;
- token usage;
- API usage;
- output;
- supervisor;
- approval;
- customer acceptance;
- cost.

---

# 20. CUSTOMER ACCEPTANCE

A conclusão técnica da tarefa não significa valor comercial.

Criar explicitamente:

```text
CUSTOMER_RESULT_ACCEPTED
```

ou:

```text
CUSTOMER_RESULT_REJECTED
```

A aceitação deverá possuir:

- customer user;
- timestamp;
- task;
- result;
- feedback;
- rating;
- comments;
- corrections required.

Gerar:

```text
ACCEPTANCE-EVIDENCE-000001
```

---

# 21. FIRST VALUE VALIDATION

Apenas depois da aceitação gerar:

```text
FIRST_VALUE_VALIDATED
```

O sistema deverá validar pelo menos uma combinação de:

- tempo poupado;
- trabalho concluído;
- redução de retrabalho;
- erro evitado;
- tarefa acelerada;
- resultado entregue;
- serviço operacional realmente utilizado.

---

# 22. FIRST TIME TO VALUE REAL

Calcular:

```text
FTV =
CustomerAcceptedResultTimestamp
-
PaymentTimestamp
```

A métrica deverá possuir:

```text
source = REAL_PRODUCTION
```

Guardar:

```text
FTV-EVIDENCE-000001
```

---

# 23. REAL USAGE METERING

Capturar uso real:

- tasks;
- executions;
- tokens;
- API calls;
- compute;
- storage;
- connectors;
- human interventions;
- workflow runs;
- automation runs.

Criar:

```text
USAGE-EVIDENCE
```

---

# 24. REAL COST CALCULATION

Calcular custos reais associados ao cliente.

Separar:

```text
AI_COST
INFRA_COST
API_COST
STORAGE_COST
INTEGRATION_COST
SUPPORT_COST
VARIABLE_HUMAN_COST
OTHER_VARIABLE_COST
```

Nenhum custo deverá ser substituído por valor hipotético se existir custo real mensurável.

---

# 25. COST EVIDENCE

Gerar:

```text
COST-EVIDENCE-000001
```

Para cada custo incluir:

- origem;
- período;
- valor;
- moeda;
- método de cálculo;
- fornecedor;
- rate;
- quantity;
- customer allocation rule;
- evidence reference.

---

# 26. REAL CONTRIBUTION MARGIN

Calcular:

```text
Contribution Margin =
Net Revenue
-
Variable Costs
```

E:

```text
Contribution Margin % =
Contribution Margin
/
Net Revenue
× 100
```

Não misturar:

```text
Gross Margin
Contribution Margin
Operating Margin
Net Margin
```

Definir formalmente cada uma.

---

# 27. MARGIN EVIDENCE

Criar:

```text
MARGIN-EVIDENCE-000001
```

Guardar:

```yaml
revenue:
variable_cost:
contribution_margin:
contribution_margin_percentage:

period_start:
period_end:

source: REAL_PRODUCTION
calculation_version:
```

---

# 28. REAL REVENUE VALIDATION

O sistema só poderá emitir:

```text
REAL_REVENUE_VALIDATED
```

se todas as condições obrigatórias forem verdadeiras.

Exemplo:

```text
customer_verified = true
contract_signed = true
invoice_issued = true
payment_received = true
payment_settled = true
payment_reconciled = true

employee_deployed = true
first_real_task_completed = true
customer_result_accepted = true
first_value_validated = true

usage_metered = true
real_cost_calculated = true
real_margin_calculated = true

critical_incidents = 0
audit_evidence_complete = true
```

---

# 29. FIRST PAID CUSTOMER VALIDATION

Criar um estado separado:

```text
FIRST_PAID_CUSTOMER_VALIDATED
```

Este estado deverá exigir:

```text
REAL CUSTOMER
+
REAL CONTRACT
+
REAL PAYMENT
+
REAL DEPLOYMENT
+
REAL TASK
+
REAL CUSTOMER ACCEPTANCE
+
REAL VALUE
```

---

# 30. DIFERENÇA ENTRE AS DUAS CERTIFICAÇÕES

Definir formalmente:

## FIRST_PAID_CUSTOMER_VALIDATED

Prova que um cliente externo real:

- contratou;
- pagou;
- recebeu Employee;
- utilizou;
- recebeu valor.

## REAL_REVENUE_VALIDATED

Prova adicional de que:

- pagamento liquidou;
- foi reconciliado;
- receita foi validada;
- custos foram medidos;
- margem foi calculada;
- evidência financeira está completa.

---

# 31. COMMERCIAL EVIDENCE VAULT

Implementar:

# COMMERCIAL EVIDENCE VAULT

Este componente deverá guardar referências auditáveis a todas as provas comerciais.

Tipos:

```text
CONTRACT_EVIDENCE
INVOICE_EVIDENCE
PAYMENT_EVIDENCE
SETTLEMENT_EVIDENCE
RECONCILIATION_EVIDENCE

TENANT_EVIDENCE
DEPLOYMENT_EVIDENCE
READINESS_EVIDENCE

TASK_EVIDENCE
ACCEPTANCE_EVIDENCE
FIRST_VALUE_EVIDENCE
FTV_EVIDENCE

USAGE_EVIDENCE
COST_EVIDENCE
MARGIN_EVIDENCE
REVENUE_EVIDENCE

INCIDENT_EVIDENCE
RENEWAL_EVIDENCE
```

---

# 32. EVIDENCE RECORD

Cada evidência deverá possuir:

```yaml
evidence_id:
evidence_type:

customer_id:
employee_id:
employee_instance_id:

related_entity_type:
related_entity_id:

source_system:

created_at:
verified_at:

verified_by:

content_hash:
previous_hash:

storage_reference:

classification:
retention_policy:

status:
```

---

# 33. HASH CHAIN

Para evidências críticas, implementar encadeamento:

```text
Evidence N
↓
hash(previous evidence + current evidence)
↓
Evidence N+1
```

Objectivo:

- detectar alteração;
- reforçar integridade;
- facilitar auditoria.

Não é obrigatório utilizar blockchain.

---

# 34. SCORECARD COM EVIDÊNCIA

Actualmente um scorecard não deverá apresentar apenas:

```text
PASS
```

Deverá apresentar:

```text
PASS

Evidence:
PAYMENT-EVIDENCE-000001

VerifiedAt:
2026-09-XX

VerifiedBy:
RevenueValidationEngine

Hash:
SHA256:...
```

---

# 35. COMMERCIAL CERTIFICATION SCORECARD

Criar:

```text
Customer Verification ............. PASS
Contract Evidence ................. PASS
Invoice Evidence .................. PASS
Payment Evidence .................. PASS
Settlement Evidence ............... PASS
Reconciliation Evidence ........... PASS

Tenant Provisioning ............... PASS
Employee Deployment ............... PASS
23 Readiness Gates ................ PASS

First Real Task ................... PASS
Customer Acceptance ............... PASS
First Value ....................... PASS
FTV ................................ PASS

Real Usage ........................ PASS
Real Costs ........................ PASS
Contribution Margin ............... PASS
Revenue Validation ................ PASS

Audit Evidence .................... PASS
Security .......................... PASS
Critical Incidents ................ PASS
```

---

# 36. CERTIFICATION ENGINE

Criar:

```text
CommercialCertificationEngine
```

Responsável por avaliar:

```text
PILOT_CUSTOMER_READY
↓
LIVE_CUSTOMER_ONBOARDING
↓
CONTROLLED_PAID_PRODUCTION
↓
FIRST_PAID_CUSTOMER_VALIDATED
↓
REAL_REVENUE_VALIDATED
↓
WAVE_1_CERTIFIED
```

---

# 37. WAVE 1 CERTIFICATION

Não avançar automaticamente para WAVE 2.

Criar:

```text
WAVE_1_CERTIFIED
```

Requisitos mínimos:

```text
FIRST_PAID_CUSTOMER_VALIDATED = true

REAL_REVENUE_VALIDATED = true

critical_incidents = 0

customer_satisfaction >= 4.5

contribution_margin_percentage >= 60%

audit_evidence_complete = true
```

---

# 38. AUTORIZAÇÃO PARA WAVE 2

Somente depois:

```text
AUTHORIZED_FOR_WAVE_2_TRIO_CUSTOMERS
```

A transição deverá exigir aprovação explícita.

---

# 39. INCIDENT HOLD

Se ocorrer incidente crítico:

```text
WAVE_ADVANCEMENT_BLOCKED
```

Até:

```text
incident_resolved = true
root_cause_completed = true
corrective_action_completed = true
regression_test_passed = true
```

---

# 40. MARGIN GUARDRAIL

Criar:

```text
MARGIN_GUARDRAIL
```

Com limite inicial:

```text
minimum_contribution_margin_percentage = 60%
```

Estados:

```text
HEALTHY_MARGIN
MARGIN_WARNING
MARGIN_AT_RISK
MARGIN_BELOW_THRESHOLD
```

---

# 41. COST ANOMALY DETECTION

Detectar:

- token spike;
- API spike;
- infrastructure spike;
- support spike;
- infinite loops;
- repeated tasks;
- duplicate executions;
- abnormal retries.

Acções:

```text
ALERT
THROTTLE
PAUSE
REQUIRE_APPROVAL
```

---

# 42. FINANCIAL RECONCILIATION

Validar coerência entre:

```text
Contract
Invoice
Payment
Settlement
Bank
Subscription
Usage
Revenue
Margin
```

Criar reconciliação automática e manual.

---

# 43. AUDIT TRAIL

Toda decisão deverá ser reconstruível.

Responder:

```text
Who?
What?
When?
Why?
Which customer?
Which Employee?
Which task?
Which payment?
Which metric?
Which evidence?
Which calculation?
Which version?
```

---

# 44. OBSERVABILITY

Adicionar tracing completo:

```text
customer_id
contract_id
payment_id
subscription_id
employee_instance_id
task_id
evidence_id
revenue_validation_id
```

Permitir investigação ponta a ponta.

---

# 45. LIVE CUSTOMER COMMAND CENTER

Actualizar o dashboard existente para mostrar:

## Customer

```text
LIVE
```

## Payment

```text
RECEIVED
SETTLED
RECONCILED
```

## Employee

```text
CONTROLLED_PAID_PRODUCTION
```

## First Task

```text
ACCEPTED
```

## First Value

```text
VALIDATED
```

## Revenue

```text
VALIDATED
```

## Margin

```text
REAL_PRODUCTION
```

---

# 46. EVIDENCE COMPLETENESS INDICATOR

Mostrar:

```text
Evidence Completeness:
XX%
```

Nenhuma certificação final com:

```text
Evidence Completeness < 100%
```

para campos obrigatórios.

---

# 47. PRODUCTION-ONLY CERTIFICATION RULE

Criar política:

```text
REAL_CERTIFICATION_REQUIRES_REAL_PRODUCTION
```

Bloquear emissão de certificação se:

```text
customer.is_test = true
```

ou:

```text
environment != production
```

ou:

```text
payment.mode = sandbox
```

---

# 48. ANTI-FAKE VALIDATION

Não permitir:

- customer mock;
- fake contract;
- synthetic payment;
- sandbox settlement;
- fabricated acceptance;
- test task;
- manual override silencioso;
- production metric criada sem evidência.

Qualquer override deverá ser explicitamente classificado como:

```text
NON_CERTIFYING_OVERRIDE
```

---

# 49. CUSTOMER CONSENT

Para métricas de valor:

- informar cliente;
- respeitar privacidade;
- utilizar apenas dados autorizados;
- minimizar dados;
- guardar apenas evidência necessária.

---

# 50. FIRST LIVE CUSTOMER RUNBOOK

Criar runbook operacional detalhado para:

```text
Day -3
Customer verification

Day -2
Contract preparation

Day -1
Billing preparation

Day 0
Contract + Invoice + Payment

Day 1
Tenant + Employee provisioning

Day 2
Readiness gates

Day 3
First Day Wizard

Day 4
First Real Task

Day 5
First Value Validation

Day 7
Operational Review

Day 14
Value Review

Day 30
Revenue + Retention Review
```

As datas são referência operacional e não devem substituir os estados reais do workflow.

---

# 51. FAIL-SAFE

Se qualquer fase falhar:

```text
STOP
CONTAIN
INVESTIGATE
CORRECT
RETEST
RESUME
```

Nunca avançar artificialmente o estado.

---

# 52. TESTES OBRIGATÓRIOS

Criar:

- unit tests;
- integration tests;
- end-to-end tests;
- evidence integrity tests;
- payment reconciliation tests;
- margin tests;
- metric source tests;
- anti-simulation tests;
- certification state tests;
- tenant isolation tests;
- rollback tests;
- kill switch tests;
- evidence completeness tests.

---

# 53. TESTES DE BLOQUEIO

Validar que:

```text
SIMULATED metric
```

não certifica receita real.

Validar que:

```text
sandbox payment
```

não gera:

```text
REAL_REVENUE_VALIDATED
```

Validar que:

```text
unreconciled payment
```

bloqueia certificação.

Validar que:

```text
customer result rejected
```

bloqueia:

```text
FIRST_VALUE_VALIDATED
```

---

# 54. DATABASE ENTITIES

Adicionar ou rever:

```text
live_customer_records

commercial_evidence
evidence_links
evidence_hash_chain

production_metrics

customer_certification_status
commercial_certification_events

real_revenue_validations
real_margin_validations

wave_certifications
wave_advancement_approvals
```

---

# 55. EVENTS

Criar:

```text
live_customer.verified

live_contract.signed
live_invoice.issued

live_payment.received
live_payment.settled
live_payment.reconciled

live_tenant.created
live_employee.hired

production_readiness.completed

controlled_paid_production.started

first_real_task.started
first_real_task.completed
first_real_task.accepted

first_value.validated

real_usage.measured
real_cost.calculated
real_margin.calculated

first_paid_customer.validated
real_revenue.validated

wave_1.certified
wave_2.authorized
```

---

# 56. APIs

Definir pelo menos:

```http
POST /api/v1/live-customer/verify

POST /api/v1/live-customer/contract

POST /api/v1/live-customer/invoice

POST /api/v1/live-customer/payment/confirm
POST /api/v1/live-customer/payment/settle
POST /api/v1/live-customer/payment/reconcile

POST /api/v1/live-customer/provision

POST /api/v1/live-customer/readiness

POST /api/v1/live-customer/first-task

POST /api/v1/live-customer/acceptance

POST /api/v1/live-customer/first-value

POST /api/v1/live-customer/costs/calculate

POST /api/v1/live-customer/margin/calculate

POST /api/v1/live-customer/revenue/validate

GET /api/v1/live-customer/evidence

GET /api/v1/live-customer/certification

POST /api/v1/live-customer/wave-1/certify
```

---

# 57. FINAL CERTIFICATION RECORD

Quando todos os requisitos forem satisfeitos, gerar:

```yaml
certification_id: COMM-CERT-000001

customer_id: CUSTOMER-000001

baseline:
  AETF-500-COMMERCIAL-PILOT-READY-2026.09.12

first_paid_customer_validated: true

real_revenue_validated: true

wave_1_certified: true

evidence_completeness: 100%

critical_incidents: 0

customer_satisfaction: >= 4.5

contribution_margin_percentage: >= 60%

certified_at:

certified_by:
CommercialCertificationEngine
```

---

# 58. NOVA BASELINE

Após sucesso real, gerar:

```text
AETF-500-FIRST-PAID-CUSTOMER-VALIDATED-BASELINE
```

e posteriormente:

```text
AETF-500-REAL-REVENUE-VALIDATED-BASELINE
```

---

# 59. FREEZE

Após validação:

- versionar;
- assinar;
- guardar hash;
- gerar relatório;
- congelar baseline;
- manter rastreabilidade com baseline anterior.

---

# 60. RELATÓRIO FINAL AUTOMÁTICO

Gerar automaticamente:

# OFFICIAL FIRST PAID CUSTOMER & REAL REVENUE VALIDATION REPORT

Conteúdo mínimo:

1. cliente;
2. Employee;
3. contrato;
4. pagamento;
5. settlement;
6. reconciliação;
7. readiness;
8. deployment;
9. primeira tarefa;
10. aceitação;
11. First Value;
12. FTV;
13. utilização;
14. custos;
15. margem;
16. receita;
17. incidentes;
18. satisfação;
19. evidências;
20. certificação final.

---

# 61. ESTADO FINAL DESEJADO

A plataforma deverá terminar esta fase em:

```text
FIRST_PAID_CUSTOMER_VALIDATED
```

mais:

```text
REAL_REVENUE_VALIDATED
```

mais:

```text
WAVE_1_CERTIFIED
```

e:

```text
AUTHORIZED_FOR_WAVE_2_TRIO_CUSTOMERS
```

---

# 62. CRITÉRIO DE SUCESSO

Esta fase só estará concluída quando existir prova auditável de:

```text
REAL CUSTOMER
+
REAL CONTRACT
+
REAL INVOICE
+
REAL PAYMENT
+
REAL SETTLEMENT
+
REAL RECONCILIATION
+
REAL AI EMPLOYEE
+
REAL CUSTOMER DATA
+
REAL TASK
+
REAL CUSTOMER ACCEPTANCE
+
REAL VALUE
+
REAL USAGE
+
REAL COST
+
REAL MARGIN
+
REAL REVENUE
```

---

# 63. PRINCÍPIO FINAL

Não expandir a arquitectura comercial nesta fase.

Executar aquilo que já foi construído.

O objectivo agora é converter:

```text
PILOT_CUSTOMER_READY
```

em evidência operacional suficiente para afirmar, sem simulação:

```text
FIRST_PAID_CUSTOMER_VALIDATED
```

e:

```text
REAL_REVENUE_VALIDATED
```

Somente depois deverá ser iniciada a próxima grande fase:

# CONTROLLED PAID SCALE, CUSTOMER SUCCESS, RETENTION & EXPANSION ENGINE

A partir daí a pergunta deixa de ser:

> A plataforma consegue operar com um cliente pagante?

E passa a ser:

> A plataforma consegue repetir esse resultado com 3, 10, 25, 50, 100 e milhares de clientes mantendo qualidade, segurança, receita, margem e retenção?
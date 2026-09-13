# PROMPT MESTRE

## FINAL WAVE 2 HARDENING & COMMERCIAL METRIC MATURITY GATE

Actue como um **Chief Revenue Officer, SaaS Metrics Architect, Revenue Operations Architect, Customer Success Architect, FinOps Specialist, Data Architect, Audit Architect, AI Platform Architect e Senior Software Engineer**.

Está a trabalhar na:

# AI EMPLOYEES PLATFORM — AETF-500 v3.0

A plataforma concluiu tecnicamente a WAVE 2 com três clientes piloto heterogéneos e encontra-se actualmente no estado:

```text
WAVE_2_CERTIFIED
AUTHORIZED_FOR_WAVE_3_10_CUSTOMERS
```

Baseline anterior imutável:

```text
AETF-500-COMMERCIAL-WAVE1-FROZEN-v2.1-2026.09.12
```

A WAVE 2 demonstrou:

```text
Repeatable Onboarding
Repeatable Payment
Repeatable Provisioning
Repeatable First Value
Repeatable Support
Repeatable Evidence
Repeatable Margin Calculation
```

Contudo, antes de encerrar definitivamente a WAVE 2, deverá ser executado um último hardening de maturidade das métricas comerciais.

O objectivo é impedir que:

- projecções sejam confundidas com observações reais;
- intenção de renovação seja confundida com renovação efectiva;
- LTV projectado seja apresentado como LTV observado;
- NRR e GRR sem janela temporal adequada sejam tratados como históricos maduros;
- médias não ponderadas escondam economics reais;
- métricas estratégicas sejam publicadas sem proveniência, janela, fórmula e versão.

---

# 1. OBJECTIVO CENTRAL

Implementar:

# COMMERCIAL METRIC MATURITY & WAVE 2 FINAL HARDENING ENGINE

Criar formalmente:

```text
CommercialMetricMaturityEngine
```

e o gate:

```text
COMMERCIAL_METRIC_MATURITY_GATE
```

A WAVE 2 somente poderá ser considerada definitivamente encerrada quando:

```text
COMMERCIAL_METRIC_MATURITY_GATE = PASS
```

---

# 2. PRINCÍPIO FUNDAMENTAL

Toda métrica estratégica deverá responder:

```text
What is the metric?
Was it observed or projected?
Which customers generated it?
Which period was measured?
Which formula was used?
Which data sources were used?
Which calculation version was applied?
What evidence supports it?
```

Nenhuma métrica estratégica poderá existir apenas como um número agregado sem provenance.

---

# 3. METRIC MATURITY CLASSIFICATION

Criar enum:

```text
MetricMaturity
```

com:

```text
SIMULATED
MODELLED
PROJECTED
PROVISIONAL_OBSERVED
OBSERVED
LONGITUDINALLY_OBSERVED
AUDITED
```

Definições obrigatórias.

## SIMULATED

Resultado proveniente de simulação.

## MODELLED

Resultado matemático baseado em hipóteses.

## PROJECTED

Estimativa futura baseada em dados disponíveis.

## PROVISIONAL_OBSERVED

Existe actividade real, mas janela ainda insuficiente.

## OBSERVED

Derivado directamente de dados reais de produção.

## LONGITUDINALLY_OBSERVED

Baseado em múltiplos períodos reais.

## AUDITED

Observado, reproduzível e suportado por evidência auditável.

---

# 4. METRIC RECORD PADRÃO

Todas as métricas estratégicas deverão utilizar estrutura semelhante:

```yaml
metric_id:

metric_name:
metric_value:
unit:

maturity:
source:

customer_scope:
cohort_id:
wave:

measurement_window_start:
measurement_window_end:
observation_days:

formula_id:
formula_version:

calculation_method:

input_evidence_ids:

calculated_at:
validated_at:
validated_by:

confidence_level:

notes:
```

---

# 5. SOURCE CLASSIFICATION

Preservar:

```text
SIMULATED
CONTROLLED_TEST
STAGING
REAL_PRODUCTION
```

Adicionar regra:

```text
MetricSource != REAL_PRODUCTION
→
MetricMaturity cannot be OBSERVED or higher
```

---

# 6. MRR HARDENING

Definir oficialmente:

```text
MRR
```

como receita recorrente mensal contratualmente activa e elegível para inclusão.

Distinguir:

```text
CONTRACTED_MRR
BILLED_MRR
COLLECTED_MRR
RECOGNIZED_MRR
```

Não assumir que todos são necessariamente iguais.

---

# 7. MRR RECONCILIATION

Criar:

```text
MRRReconciliationRecord
```

contendo:

```yaml
customer_id:
subscription_id:

contracted_mrr:
billed_mrr:
collected_mrr:
recognized_mrr:

difference:
status:
```

---

# 8. ARR

Definir:

```text
ARR = Eligible MRR × 12
```

Classificar ARR como:

```text
DERIVED_FROM_OBSERVED_MRR
```

quando aplicável.

Não tratá-lo como receita anual já recebida.

---

# 9. ARPA

Calcular:

```text
ARPA =
Eligible MRR
/
Active Accounts
```

Guardar:

```text
customer_count
mrr_basis
measurement_date
```

---

# 10. NRR HARDENING

Definir:

```text
NRR =
(
Opening MRR
+
Expansion MRR
-
Contraction MRR
-
Churned MRR
)
/
Opening MRR
× 100
```

---

# 11. NRR RECORD

Criar:

```yaml
opening_mrr:
expansion_mrr:
contraction_mrr:
churned_mrr:
closing_mrr:

measurement_window_start:
measurement_window_end:

customer_cohort:

nrr:

maturity:
evidence_ids:
```

---

# 12. NRR MATURITY RULE

Não permitir:

```text
NRR = OBSERVED
```

sem:

```text
Opening MRR > 0
AND
valid measurement period exists
AND
customer cohort existed at period opening
```

Caso contrário:

```text
NRR = PROJECTED
```

ou:

```text
PROVISIONAL_OBSERVED
```

---

# 13. GRR HARDENING

Definir:

```text
GRR =
(
Opening MRR
-
Contraction MRR
-
Churned MRR
)
/
Opening MRR
× 100
```

Não incluir expansão.

---

# 14. GRR MATURITY

Aplicar mesmas regras de janela temporal do NRR.

---

# 15. NRR E GRR DO RELATÓRIO ACTUAL

Reprocessar formalmente:

```text
NRR = 124.5%
GRR = 99.1%
```

Determinar se são:

```text
OBSERVED
PROVISIONAL_OBSERVED
PROJECTED
MODELLED
```

Não preservar automaticamente a classificação anterior.

---

# 16. RETENTION WINDOW

Criar:

```text
RetentionMeasurementWindow
```

com suporte a:

```text
30_DAY
60_DAY
90_DAY
MONTHLY
QUARTERLY
ANNUAL
CUSTOM
```

---

# 17. COHORT RETENTION

Implementar:

```text
CustomerCohortRetention
```

Separar:

```text
Logo Retention
Revenue Retention
Employee Retention
Subscription Retention
```

---

# 18. RENEWAL SEMANTICS

Separar formalmente:

```text
RENEWAL_INTENT
RENEWAL_FORECAST
RENEWAL_ELIGIBLE
RENEWAL_PENDING
RENEWAL_CONTRACTED
RENEWAL_INVOICED
RENEWAL_PAID
RENEWAL_SETTLED
RENEWAL_RECONCILED
RENEWAL_COMPLETED
```

---

# 19. RENEWAL INTENT

`RENEWAL_INTENT` deverá significar apenas intenção, feedback ou sinal.

Nunca:

```text
RENEWAL_INTENT = RENEWAL_COMPLETED
```

---

# 20. RENEWAL FORECAST

Criar:

```text
renewal_probability
expected_renewal_mrr
renewal_date
risk_factors
confidence
```

Classificar como:

```text
PROJECTED
```

---

# 21. RENEWAL COMPLETED

Somente emitir:

```text
RENEWAL_COMPLETED
```

quando os critérios comerciais configurados forem satisfeitos.

Exemplo:

```text
new_period_activated = true
contract_valid = true
invoice_valid = true
payment_settled = true
payment_reconciled = true
```

quando pagamento antecipado fizer parte do modelo contratual.

---

# 22. REPEATABLE RENEWAL CORRECTION

Reavaliar:

```text
repeatable_renewal = PASS
```

Se a WAVE 2 possuir apenas sinais positivos de continuidade, alterar para:

```text
repeatable_renewal_signal = PASS
```

ou:

```text
renewal_readiness = PASS
```

Reservar:

```text
repeatable_renewal = PASS
```

para renovações efectivamente observadas.

---

# 23. LTV MATURITY

Criar:

```text
LTVType
```

com:

```text
MODELLED_LTV
PROJECTED_LTV
COHORT_LTV
OBSERVED_LTV
```

---

# 24. MODELLED LTV

Baseado em hipóteses.

Deverá guardar:

```text
retention_assumption
margin_assumption
customer_lifetime_assumption
discounting_method
formula_version
```

---

# 25. PROJECTED LTV

Baseado em comportamento observado inicial + projecção futura.

---

# 26. COHORT LTV

Baseado em determinada coorte de clientes.

---

# 27. OBSERVED LTV

Só poderá ser usado quando existir histórico real suficientemente longo e fechado.

---

# 28. LTV RECORD

Criar:

```yaml
ltv_value:
ltv_type:

customer_scope:
cohort:

observation_period:

revenue_observed:
margin_observed:

retention_assumption:
churn_assumption:

formula:
formula_version:

maturity:
evidence_ids:
```

---

# 29. LTV/CAC HARDENING

O actual:

```text
LTV / CAC = 24.5x
```

deverá ser reclassificado.

Exemplo:

```text
Projected LTV / Observed CAC
```

ou:

```text
Modelled LTV / Observed CAC
```

Nunca apresentar apenas:

```text
LTV/CAC = 24.5x
```

sem qualificação.

---

# 30. CAC HARDENING

Separar:

```text
PAID_ACQUISITION_CAC
BLENDED_CAC
SALES_ASSISTED_CAC
PARTNER_CAC
ORGANIC_CAC
```

---

# 31. CAC COMPONENTS

Guardar:

```text
Marketing Cost
Sales Cost
Partner Commission
Onboarding Sales Cost
Attributed Acquisition Cost
```

---

# 32. CAC OBSERVATION

Só incluir custos reais e atribuíveis quando a métrica for classificada como:

```text
OBSERVED_CAC
```

---

# 33. CAC PAYBACK

Definir explicitamente a fórmula.

Exemplo:

```text
CAC Payback Months =
CAC
/
Monthly Contribution Margin
```

ou outra fórmula adoptada.

Guardar `formula_version`.

---

# 34. CAC PAYBACK DO CLIENTE BETA

Reprocessar:

```text
CAC Payback = 1.5 months
```

e guardar:

```text
CAC value
Monthly contribution margin
Formula
Evidence
```

---

# 35. CONTRIBUTION MARGIN HARDENING

Separar:

```text
CUSTOMER_CONTRIBUTION_MARGIN
COHORT_CONTRIBUTION_MARGIN
PLATFORM_CONTRIBUTION_MARGIN
```

---

# 36. CUSTOMER CONTRIBUTION MARGIN

Manter:

```text
Net Customer Revenue
-
Customer Variable Costs
```

---

# 37. COHORT CONTRIBUTION MARGIN

Usar como principal:

```text
Σ Net Revenue - Σ Variable Costs
────────────────────────────────
          Σ Net Revenue
```

---

# 38. WEIGHTED VS SIMPLE MARGIN

Criar duas métricas diferentes:

```text
SIMPLE_AVERAGE_MARGIN_PERCENT
REVENUE_WEIGHTED_CONTRIBUTION_MARGIN
```

Não misturar.

---

# 39. WAVE 2 MARGIN REPROCESSING

O relatório actual declara:

```text
Average Contribution Margin = 88.75%
```

Recalcular utilizando:

- Alpha;
- Beta;
- Gamma.

Apresentar individualmente:

```text
Alpha Revenue
Alpha Variable Cost
Alpha Margin

Beta Revenue
Beta Variable Cost
Beta Margin

Gamma Revenue
Gamma Variable Cost
Gamma Margin
```

Depois calcular:

```text
Revenue Weighted Contribution Margin
```

---

# 40. BETA VALIDATION

Preservar:

```text
Revenue = 350,000 AOA
Variable Costs = 52,650 AOA
Contribution Margin = 297,350 AOA
Contribution Margin % = 84.96%
```

Adicionar teste automático.

---

# 41. FTV HARDENING

Valores da WAVE 2:

```text
Alpha = 0.20h
Beta = 0.25h
Gamma = 0.35h
```

Média:

```text
0.2667h ≈ 0.27h
```

Validar automaticamente.

---

# 42. FTV DISTRIBUTION ENGINE

Criar:

```text
MetricDistributionEngine
```

Para calcular:

```text
MEAN
MEDIAN
P75
P90
P95
MIN
MAX
STANDARD_DEVIATION
```

quando a amostra permitir.

---

# 43. SMALL SAMPLE WARNING

Para amostras pequenas, como 3 clientes, indicar:

```text
SMALL_SAMPLE_SIZE
```

Não dar falsa precisão estatística.

---

# 44. WAVE 3 PREPARATION

O mesmo distribution engine deverá ser preparado para 10 clientes.

Aplicar a:

```text
FTV
Onboarding Time
Task Latency
Support Load
Cost per Customer
Cost per Employee
Margin
Human Intervention
Acceptance Rate
Incident Frequency
```

---

# 45. CUSTOMER HEALTH SCORE HARDENING

Os scores:

```text
98
95
92
```

deverão ter:

```text
score_version
weights
measurement_window
input_metrics
evidence
```

---

# 46. HEALTH SCORE EXPLAINABILITY

Mostrar:

```text
Why score = 92?
```

Exemplo:

```text
Usage ................. 19/20
Value ................. 20/20
Quality ............... 18/20
Support ............... 17/20
Payment ............... 20/20

Total ................. 94/100
```

---

# 47. HEALTH SCORE VERSIONING

Criar:

```text
CUSTOMER_HEALTH_SCORE_v1
```

para impedir alterações silenciosas de metodologia.

---

# 48. ACTIVATION SCORE

O actual:

```text
Activation Score = 100%
```

deverá guardar componentes individualmente.

---

# 49. SUPPORT MATURITY

Não usar apenas:

```text
0 incidents S1/S2
```

como prova de suporte repetível.

Medir:

```text
tickets_per_customer
tickets_per_employee
response_time
resolution_time
human_support_minutes
self_service_resolution_rate
escalation_rate
```

---

# 50. SUPPORT COST ALLOCATION

Garantir que custos reais de suporte entram em:

```text
Customer Variable Costs
```

quando economicamente atribuíveis.

---

# 51. EXPANSION MATURITY

Separar:

```text
EXPANSION_SIGNAL
EXPANSION_OPPORTUNITY
EXPANSION_PROPOSAL
EXPANSION_CONTRACTED
EXPANSION_ACTIVATED
EXPANSION_MRR_REALIZED
```

---

# 52. EXPANSION MRR

Somente incluir em NRR observado quando:

```text
expansion contract effective
AND
MRR effective in measurement period
```

---

# 53. CONTRACTION MRR

Criar:

```text
CONTRACTION_MRR
```

para:

- downgrade;
- instance reduction;
- seat reduction;
- department removal;
- plan contraction.

---

# 54. CHURNED MRR

Separar churn efectivo de:

```text
churn_risk
```

---

# 55. COMMERCIAL METRIC PROVENANCE

Criar:

```text
MetricProvenanceRecord
```

com:

```yaml
metric_id:
source_tables:
source_events:
evidence_ids:
query_version:
formula_version:
calculation_job:
calculated_at:
```

---

# 56. NO METRIC WITHOUT PROVENANCE

Regra obrigatória:

```text
IF strategic_metric.provenance == null
THEN
strategic_metric.status = INVALID
```

---

# 57. NO METRIC WITHOUT WINDOW

Para métricas temporais:

```text
measurement_window_start
measurement_window_end
```

obrigatórios.

---

# 58. NO METRIC WITHOUT MATURITY

Todas as métricas estratégicas deverão declarar:

```text
maturity
```

---

# 59. NO FORECAST PRESENTED AS ACTUAL

Criar validação:

```text
IF maturity IN (MODELLED, PROJECTED)
THEN display_label MUST indicate forecast/projection
```

---

# 60. METRIC DISPLAY RULES

Dashboards deverão distinguir visual e semanticamente:

```text
OBSERVED
PROJECTED
MODELLED
```

---

# 61. COMMERCIAL METRIC MATURITY GATE

Criar:

```text
COMMERCIAL_METRIC_MATURITY_GATE
```

---

# 62. GATE CRITERIA

Avaliar:

```text
MRR ................................. OBSERVED
ARR ................................. DERIVED_FROM_OBSERVED_MRR
ARPA ................................ OBSERVED

NRR ................................. MATURITY_CLASSIFIED
GRR ................................. MATURITY_CLASSIFIED

RENEWAL ............................. SIGNAL_VS_ACTUAL_EXPLICIT

CAC ................................. EVIDENCED
CAC_PAYBACK ......................... REPRODUCIBLE

LTV ................................. TYPE_CLASSIFIED
LTV_CAC ............................. MATURITY_DISCLOSED

CONTRIBUTION_MARGIN ................. REVENUE_WEIGHTED_AVAILABLE

FTV ................................. REAL_PRODUCTION
FTV_DISTRIBUTION .................... AVAILABLE

CUSTOMER_HEALTH ..................... VERSIONED

SUPPORT_METRICS ..................... PROVENANCE_AVAILABLE

EXPANSION ........................... SIGNAL_VS_REALIZED_EXPLICIT

METRIC_PROVENANCE ................... 100%

METRIC_MATURITY_CLASSIFICATION ...... 100%
```

---

# 63. GATE STATES

Criar:

```text
PASS
PASS_WITH_CONDITIONS
FAIL
```

---

# 64. PASS_WITH_CONDITIONS

Usar quando:

```text
Metric is correctly classified as PROJECTED
```

e isso não comprometer a autorização da próxima wave.

Nunca forçar uma projecção a tornar-se observada apenas para passar o gate.

---

# 65. WAVE 2 CERTIFICATION REVALIDATION

Depois do hardening, reavaliar:

```text
WAVE_2_OPERATIONAL_REPEATABILITY
WAVE_2_FINANCIAL_INTEGRITY
WAVE_2_METRIC_MATURITY
WAVE_2_EVIDENCE_COMPLETENESS
```

---

# 66. WAVE 2 FINAL STATES

Criar:

```text
WAVE_2_OPERATIONAL_REPEATABILITY_VALIDATED
COMMERCIAL_METRIC_MATURITY_GATE_PASSED
WAVE_2_FINAL_CERTIFICATION_COMPLETE
AUTHORIZED_FOR_WAVE_3_10_CUSTOMERS
```

---

# 67. WAVE 2 BLOCKING

Bloquear encerramento definitivo caso exista:

```text
metric_without_provenance
metric_without_maturity
NRR_without_window
GRR_without_window
unqualified_projected_LTV
renewal_intent_labelled_as_completed
incorrect_weighted_margin
```

---

# 68. WAVE 2 REPROCESSING

Reprocessar toda a coorte:

```text
Alpha
Beta
Gamma
```

Sem duplicar:

- pagamentos;
- facturas;
- tarefas;
- revenue events;
- customer actions.

---

# 69. REPROCESS MODE

Usar:

```text
READ_ONLY_RECALCULATION
```

para métricas derivadas.

---

# 70. DATA SNAPSHOT

Antes do reprocessamento, gerar:

```text
WAVE_2_PRE_HARDENING_SNAPSHOT
```

---

# 71. POST-HARDENING SNAPSHOT

Gerar:

```text
WAVE_2_POST_HARDENING_SNAPSHOT
```

---

# 72. DIFF REPORT

Gerar:

```text
WAVE_2_METRIC_RECLASSIFICATION_DIFF
```

Mostrar:

```text
Metric
Old Value
New Value
Old Maturity
New Maturity
Reason
```

---

# 73. NRR RECLASSIFICATION REPORT

Apresentar:

```text
Opening MRR
Expansion MRR
Contraction MRR
Churn MRR
Closing MRR
Window
NRR
Maturity
```

---

# 74. GRR RECLASSIFICATION REPORT

Mesma estrutura aplicável.

---

# 75. LTV RECLASSIFICATION REPORT

Mostrar:

```text
Current LTV
LTV Type
Historical Window
Assumptions
Confidence
```

---

# 76. CAC REPORT

Mostrar:

```text
CAC Type
Customer Count
Acquisition Costs
Allocated Costs
CAC
```

---

# 77. UNIT ECONOMICS REPORT

Gerar por cliente:

```text
Revenue
Variable Cost
Contribution Margin

CAC
CAC Payback

LTV Type
LTV

LTV/CAC
```

---

# 78. COHORT ECONOMICS REPORT

Gerar:

```text
Wave 2 Revenue
Wave 2 Variable Costs
Weighted Contribution Margin
Support Cost
Acquisition Cost
```

---

# 79. PREDICTABILITY READINESS

Embora a WAVE 2 não precise provar previsibilidade completa, deverá preparar dados para a WAVE 3.

Criar:

```text
PREDICTABILITY_DATA_READY
```

---

# 80. WAVE 3 BASELINE INPUTS

Preparar:

```text
FTV Distribution
Cost Distribution
Support Distribution
Margin Distribution
Task Success Distribution
Acceptance Distribution
```

---

# 81. COMMERCIAL PREDICTABILITY DATASET

Criar dataset:

```text
commercial_predictability_dataset_v1
```

---

# 82. DIMENSÕES

Incluir:

```text
customer_id
wave
complexity
plan
employee_count
integration_count
workflow_count
ftv
onboarding_time
support_load
cost
margin
task_success
acceptance_rate
```

---

# 83. SMALL SAMPLE HANDLING

WAVE 2 tem apenas 3 clientes.

Não construir modelos preditivos robustos como se a amostra fosse grande.

Usar os dados como:

```text
SEED_DATA
```

para WAVE 3.

---

# 84. PREDICTION CONFIDENCE

Qualquer previsão baseada apenas na WAVE 2 deverá ter:

```text
LOW_SAMPLE_CONFIDENCE
```

quando apropriado.

---

# 85. AUDIT LOG

Toda reclassificação deverá indicar:

```text
Who
When
Metric
Old Classification
New Classification
Reason
Evidence
```

---

# 86. API

Criar:

```http
GET /api/v1/metrics/maturity

GET /api/v1/metrics/{metricId}/provenance

GET /api/v1/waves/2/metric-maturity

POST /api/v1/waves/2/reprocess-metrics

POST /api/v1/waves/2/metric-maturity-gate

GET /api/v1/waves/2/economics

GET /api/v1/waves/2/retention

GET /api/v1/waves/2/renewals
```

---

# 87. DATABASE ENTITIES

Adicionar:

```text
metric_maturity
metric_provenance

retention_windows
retention_metrics

renewal_events
renewal_forecasts

ltv_models
ltv_calculations

cac_calculations

cohort_margin_calculations

metric_distributions

metric_reclassification_history

wave_metric_maturity_gates
```

---

# 88. EVENTS

Criar:

```text
metric.calculated
metric.reclassified
metric.validated

nrr.calculated
grr.calculated

renewal.intent_recorded
renewal.completed

ltv.projected
ltv.observed

cac.calculated

cohort.margin_calculated

wave2.metric_maturity_passed
```

---

# 89. TESTES OBRIGATÓRIOS

Criar testes para:

```text
NRR without valid time window → BLOCKED

GRR without opening cohort → BLOCKED

PROJECTED LTV labelled OBSERVED → BLOCKED

Renewal Intent labelled Renewal Completed → BLOCKED

Simple Margin labelled Revenue Weighted → BLOCKED

Strategic Metric without Provenance → BLOCKED

Strategic Metric without Maturity → BLOCKED
```

---

# 90. NRR TEST

Exemplo:

```text
Opening MRR = 1,000
Expansion MRR = 200
Contraction = 50
Churn = 50
```

Esperado:

```text
NRR = 110%
```

---

# 91. GRR TEST

Com os mesmos valores:

```text
GRR = 90%
```

---

# 92. FTV TEST

Usar:

```text
Alpha 0.20
Beta 0.25
Gamma 0.35
```

Esperado:

```text
Mean ≈ 0.2667
```

---

# 93. MARGIN TEST

Garantir cálculo ponderado usando receitas e custos individuais.

---

# 94. DATA QUALITY TESTS

Validar:

```text
Completeness
Uniqueness
Consistency
Freshness
Referential Integrity
```

---

# 95. DOCUMENTAÇÃO

Actualizar:

- SaaS metrics dictionary;
- retention definitions;
- renewal definitions;
- LTV methodology;
- CAC methodology;
- margin methodology;
- metric maturity model;
- metric provenance rules.

---

# 96. SAAS METRICS DICTIONARY

Criar documento oficial:

```text
AETF-500-SAAS-METRICS-DICTIONARY-v1
```

---

# 97. METRIC DEFINITIONS

Documentar obrigatoriamente:

```text
MRR
ARR
ARPA
NRR
GRR
CAC
LTV
LTV/CAC
CAC Payback
Contribution Margin
FTV
Churn
Renewal
Expansion MRR
Contraction MRR
```

---

# 98. FINAL WAVE 2 REPORT

Gerar:

# WAVE 2 FINAL COMMERCIAL METRIC MATURITY & CERTIFICATION REPORT

---

# 99. RELATÓRIO FINAL DEVE MOSTRAR

```text
Operational Repeatability ........ PASS

MRR Integrity ..................... PASS
ARR Classification ............... PASS
ARPA Integrity .................... PASS

NRR Maturity ...................... PASS
GRR Maturity ...................... PASS

Renewal Semantics ................. PASS

CAC Evidence ...................... PASS
CAC Payback Reproducibility ....... PASS

LTV Classification ................ PASS
LTV/CAC Qualification ............. PASS

Weighted Margin ................... PASS

FTV Distribution .................. PASS

Metric Provenance ................. PASS

COMMERCIAL_METRIC_MATURITY_GATE ... PASS
```

---

# 100. BASELINE FINAL DA WAVE 2

Depois do gate:

```text
AETF-500-COMMERCIAL-WAVE2-FROZEN-v3.0
```

ou versão compatível com o esquema oficial.

---

# 101. BASELINE MANIFEST

Guardar:

```yaml
baseline_id:
previous_baseline:

wave:
WAVE_2_TRIO_CUSTOMERS

customer_count:
3

metric_dictionary_version:
metric_maturity_schema_version:
unit_economics_version:

wave2_operational_repeatability:
PASS

commercial_metric_maturity_gate:
PASS

authorization:
AUTHORIZED_FOR_WAVE_3_10_CUSTOMERS

source_commit:
build_id:

frozen_at:
baseline_hash:
```

---

# 102. FREEZE PRINCIPLE

Não alterar retroactivamente:

```text
AETF-500-COMMERCIAL-WAVE1-FROZEN-v2.1-2026.09.12
```

---

# 103. WAVE 2 FINAL FREEZE GATE

Criar:

```text
WAVE_2_FINAL_FREEZE_GATE
```

Requisitos:

```text
Operational Repeatability ........ PASS
Financial Reconciliation ......... PASS
Metric Maturity .................. PASS
Metric Provenance ................ PASS
Retention Classification ........ PASS
Renewal Semantics ................ PASS
Unit Economics ................... PASS
Weighted Margin .................. PASS
Documentation .................... PASS
Tests ............................ PASS
```

---

# 104. ESTADO FINAL

Somente depois emitir:

```text
WAVE_2_FINAL_CERTIFICATION_COMPLETE
```

seguido de:

```text
AUTHORIZED_FOR_WAVE_3_10_CUSTOMERS
```

---

# 105. PRÓXIMO DESENVOLVIMENTO PRINCIPAL

Depois do freeze definitivo da WAVE 2, o próximo desenvolvimento não deverá repetir Customer Success ou Retention architecture já existente.

Deverá ser:

# COMMERCIAL PREDICTABILITY, COHORT ANALYTICS & OPERATIONAL VARIANCE ENGINE

para a WAVE 3.

---

# 106. OBJECTIVO DA WAVE 3

Transformar:

```text
3 heterogeneous successful customers
```

em:

```text
10 customers
+
predictable FTV
+
predictable costs
+
predictable support
+
predictable quality
+
predictable margins
+
predictable retention
```

---

# 107. PRINCÍPIO FINAL

A WAVE 2 não estará definitivamente encerrada apenas porque os três clientes funcionaram.

Estará encerrada quando for possível afirmar simultaneamente:

```text
THE OPERATION IS REPEATABLE
```

e:

```text
THE COMMERCIAL METRICS ARE SEMANTICALLY CORRECT
```

e:

```text
OBSERVED DATA IS NOT CONFUSED WITH FORECAST DATA
```

e:

```text
EVERY STRATEGIC METRIC IS REPRODUCIBLE AND AUDITABLE
```

O resultado final deverá ser:

```text
WAVE_2_OPERATIONAL_REPEATABILITY_VALIDATED

+

COMMERCIAL_METRIC_MATURITY_GATE = PASS

+

WAVE_2_FINAL_CERTIFICATION_COMPLETE

↓

AUTHORIZED_FOR_WAVE_3_10_CUSTOMERS
```
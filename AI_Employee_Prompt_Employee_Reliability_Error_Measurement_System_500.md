# PROMPT MESTRE COMPLEMENTAR — EMPLOYEE RELIABILITY & ERROR MEASUREMENT SYSTEM
## Medição de Fiabilidade, Erros, Supervisão Humana e Certificação para os 500 AI Employees

**Versão:** 1.0  
**Âmbito:** AI Employee Platform — 500/500 Priority Employee Program  
**Objectivo:** medir de forma objectiva, estatisticamente defensável, auditável e operacionalmente útil a fiabilidade de cada AI Employee, os tipos de erro que comete, a gravidade desses erros, os contextos em que falha e o nível de supervisão humana necessário para cada classe de tarefa.

---

# 0. INSTRUÇÃO PRINCIPAL À IA DE DESENVOLVIMENTO

ACTUE COMO uma equipa sénior composta por:

- Arquitecto de Software;
- Arquitecto de Sistemas de Avaliação;
- Estatístico;
- Engenheiro QA;
- Engenheiro de Dados;
- Engenheiro MLOps/LLMOps;
- Especialista em Reliability Engineering;
- Especialista em Risk Management;
- Especialista em Human-in-the-Loop;
- Especialista em segurança;
- Especialista em auditoria;
- Especialista em Observability;
- Especialista em Experiment Design;
- Especialista em AI Evaluation;
- Especialista em Domain Benchmarking;
- Especialistas humanos por domínio profissional.

Implemente o:

# **EMPLOYEE RELIABILITY & ERROR MEASUREMENT SYSTEM — EREMS**

para os 500 AI Employees.

O sistema deve responder objectivamente:

```text
QUAL É A TAXA DE SUCESSO DESTE EMPLOYEE?
QUAL É A SUA TAXA DE ERRO?
QUE TIPOS DE ERRO COMETE?
QUAIS ERROS SÃO MATERIAIS?
QUAIS ERROS SÃO CRÍTICOS?
EM QUE TAREFAS FALHA MAIS?
EM QUE SECTORES FALHA MAIS?
EM QUE SISTEMAS FALHA MAIS?
EM QUE JURISDIÇÕES FALHA MAIS?
QUE ERROS SÃO DETECTADOS?
QUE ERROS PASSAM SEM SER DETECTADOS?
QUANDO O EMPLOYEE DEVE ESCALAR?
QUANDO DEVE SER OBRIGATÓRIA SUPERVISÃO HUMANA?
QUAL NÍVEL DE AUTONOMIA PODE SER CERTIFICADO?
QUAL É A INCERTEZA ESTATÍSTICA DAS MÉTRICAS?
```

---

# 1. PRINCÍPIO FUNDAMENTAL

NÃO criar uma única percentagem simplista do tipo:

```text
Employee Accuracy = 98%
```

como medida universal.

A fiabilidade deve ser multidimensional.

---

# 2. MODELO DE FIABILIDADE

Cada Employee deve possuir:

```text
Reliability
=
Task Success
+
Factual Accuracy
+
Process Correctness
+
Calculation Correctness
+
Policy Compliance
+
Permission Compliance
+
Tool Execution Reliability
+
Data Handling Reliability
+
Escalation Quality
+
Error Detection
+
Human Correction Rate
+
Delivery Reliability
```

---

# 3. MÉTRICA PRINCIPAL

Criar como métrica de segurança operacional prioritária:

# **Undetected Material Error Rate — UMER**

Definição:

```text
UMER
=
número de erros materiais que chegaram ao resultado final
sem serem detectados pelo Employee, sistema ou supervisão
/
número total de oportunidades de erro material
```

Esta métrica deve receber prioridade sobre accuracy genérica.

---

# 4. OUTRAS MÉTRICAS PRINCIPAIS

Para cada Employee, medir:

```text
Task Success Rate
Task Failure Rate
Overall Error Rate
Minor Error Rate
Operational Error Rate
Material Error Rate
Critical Error Rate
Undetected Error Rate
Undetected Material Error Rate
Human Correction Rate
Correct Escalation Rate
Missed Escalation Rate
False Escalation Rate
Tool Failure Rate
Connector Failure Rate
Data Quality Failure Rate
Policy Violation Rate
Permission Violation Rate
Approval Violation Rate
Delivery Failure Rate
Knowledge Gap Rate
Knowledge Conflict Rate
Stale Knowledge Usage Rate
Hallucination Rate
Unsupported Claim Rate
Calculation Error Rate
Source Traceability Rate
```

---

# 5. ERROR SEVERITY MODEL

Criar níveis:

```text
E0 — NO_ERROR
E1 — MINOR
E2 — OPERATIONAL
E3 — MATERIAL
E4 — CRITICAL
E5 — CATASTROPHIC
```

---

# 6. DEFINIÇÕES DE SEVERIDADE

## E1 — MINOR

Erro sem impacto material.

Exemplos:

```text
formatação
gramática
ordenação secundária
label não crítico
```

## E2 — OPERATIONAL

Erro que reduz a qualidade ou causa retrabalho.

Exemplos:

```text
routing incorrecto
campo não preenchido
documento mal categorizado sem efeito material
```

## E3 — MATERIAL

Erro que pode afectar decisão, valor, prazo, obrigação ou processo.

Exemplos:

```text
valor financeiro incorrecto
classificação contabilística material incorrecta
obrigação fiscal interpretada de forma errada
```

## E4 — CRITICAL

Erro com potencial de consequência grave.

Exemplos:

```text
pagamento errado
violação de controlo
submissão legal errada
exposição indevida de dados sensíveis
```

## E5 — CATASTROPHIC

Erro que não deve ser permitido por design.

Exemplos:

```text
cross-tenant data leak material
autonomous unauthorized funds movement
unsafe safety-critical instruction executed
irreversible destructive action without approval
```

---

# 7. ERROR TAXONOMY

Classificar cada erro por causa:

```text
MODEL_REASONING_ERROR
FACTUAL_ERROR
HALLUCINATION
KNOWLEDGE_ERROR
STALE_KNOWLEDGE
KNOWLEDGE_CONFLICT
DATA_ERROR
MISSING_DATA
DATA_MAPPING_ERROR
CALCULATION_ERROR
RULE_ENGINE_ERROR
PROCESS_ERROR
WORKFLOW_ERROR
TOOL_ERROR
CONNECTOR_ERROR
PERMISSION_ERROR
POLICY_ERROR
RISK_CLASSIFICATION_ERROR
APPROVAL_ERROR
ROUTING_ERROR
DELIVERY_ERROR
DOCUMENT_RENDERING_ERROR
SYSTEM_CONFIGURATION_ERROR
ORGANIZATION_CONFIGURATION_ERROR
PROMPT_ERROR
ROLE_PACK_ERROR
WORK_CONTRACT_ERROR
OPERATIONAL_REALITY_GAP
HUMAN_INPUT_ERROR
UNKNOWN
```

---

# 8. ROOT CAUSE

Para todo erro E2 ou superior, gerar:

```text
root_cause_category
root_cause_description
affected_component
affected_employee
affected_task
affected_data
affected_system
reproducibility
fix_scope
```

---

# 9. FIX SCOPE

Classificar melhoria como:

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

# 10. RELIABILITY PASSPORT

Criar:

`EmployeeReliabilityPassport`

Exemplo:

```yaml
employee_reliability_passport:
  employee_id: 66
  role_key: document_classification

  test_population:
    total_tasks: 5240
    normal_cases: 3100
    edge_cases: 850
    ambiguous_cases: 420
    negative_cases: 340
    adversarial_cases: 180
    regulatory_cases: 350

  success:
    task_success_rate: null

  error:
    overall_error_rate: null
    minor_error_rate: null
    operational_error_rate: null
    material_error_rate: null
    critical_error_rate: null
    undetected_error_rate: null
    undetected_material_error_rate: null

  escalation:
    correct_escalation_rate: null
    missed_escalation_rate: null
    false_escalation_rate: null

  execution:
    tool_failure_rate: null
    connector_failure_rate: null
    delivery_failure_rate: null

  trust:
    source_traceability_rate: null
    unsupported_claim_rate: null
    knowledge_gap_rate: null

  statistical_confidence:
    confidence_level: 0.95
    sample_size: 5240
    confidence_intervals: {}

  certification:
    certified_autonomy_level: null
    supervision_profile: null
```

---

# 11. RELIABILITY BY TASK TYPE

Nunca armazenar fiabilidade apenas por Employee.

Criar:

```text
employee_id
task_type
reliability_metrics
```

Exemplo:

```text
#73 Management Reporting

data_ingestion
calculation
variance_analysis
narrative
recommendation
report_generation
delivery
```

cada um com métricas distintas.

---

# 12. RELIABILITY BY CONTEXT

Medir por:

```text
department
task_type
process
industry
jurisdiction
organization
system
connector
input_type
document_type
language
risk_level
autonomy_level
```

---

# 13. CONTEXTUAL RELIABILITY

Exemplo:

```text
Employee #73

Retail / Angola / Primavera
!=
Construction / Angola / Excel
!=
Banking / another jurisdiction / SAP
```

Não assumir que um resultado num contexto se generaliza automaticamente para todos.

---

# 14. ERROR OPPORTUNITY MODEL

Não usar denominadores incorrectos.

Criar:

```text
error_opportunity
```

Exemplo:

```text
100 relatórios
1000 cálculos
2500 factual claims
300 recommendations
```

Medir cada dimensão no denominador correcto.

---

# 15. CALCULATION RELIABILITY

Medir:

```text
correct_calculations
/
calculation_opportunities
```

---

# 16. FACTUAL RELIABILITY

Medir:

```text
supported_correct_claims
/
factual_claim_opportunities
```

---

# 17. ESCALATION RELIABILITY

Medir:

```text
true_escalation_positive
true_escalation_negative
false_escalation_positive
missed_escalation
```

Derivar:

```text
precision
recall
false escalation rate
missed escalation rate
```

---

# 18. CONFIDENCE CALIBRATION

Medir se a confiança declarada pelo Employee corresponde à realidade.

Exemplo:

```text
confidence = 0.95
```

não deve significar “95% correcto” por conveniência.

Avaliar calibration curve.

---

# 19. NO SELF-REPORTED CONFIDENCE AS AUTHORITY

Proibir:

```text
model says confidence 95%
→ automatically trust
```

Usar confiança calibrada por testes reais.

---

# 20. STATISTICAL CONFIDENCE

Toda métrica deve incluir:

```text
sample_size
confidence_level
confidence_interval
```

---

# 21. ZERO-FAILURE RULE OF THREE

Para zero erros observados:

```text
upper_error_bound_95 ≈ 3 / N
```

Exemplo:

```text
N=300
0 errors
upper 95% bound ≈ 1%
```

Exemplo:

```text
N=1000
0 errors
upper 95% bound ≈ 0.3%
```

---

# 22. DO NOT CLAIM ZERO ERROR

Nunca mostrar:

```text
error_probability = 0%
```

apenas porque nenhum erro foi observado.

Mostrar:

```text
observed_errors = 0
upper_confidence_bound = X
```

---

# 23. MINIMUM SAMPLE SIZE

Definir mínimos por:

```text
risk
task complexity
task diversity
impact
```

Base sugerida:

```text
R1/R2 → >= 100 representative cases
R3    → >= 250
R4    → >= 500 + expert review
R5    → >= 1000 + strong governance + simulated/adversarial coverage
```

A equipa pode exigir mais.

---

# 24. REPRESENTATIVENESS

Dataset deve cobrir:

```text
normal
edge
ambiguous
negative
missing
duplicate
conflicting
stale
adversarial
real-world
sector-specific
system-specific
jurisdiction-specific
```

---

# 25. TEST DATASET VERSIONING

Guardar:

```text
dataset_id
version
source
coverage
jurisdiction
industry
organization_scope
review_status
hash
```

---

# 26. GOLDEN CASES

Cada Role deve possuir:

```text
expected inputs
expected process
expected outputs
expected escalations
forbidden actions
```

---

# 27. HUMAN GROUND TRUTH

Ground truth de áreas de alto risco deve ser validado por profissional humano qualificado.

---

# 28. MULTI-REVIEWER CONSENSUS

Para casos ambíguos:

```text
reviewer A
reviewer B
reviewer C
```

Permitir consensus/adjudication.

---

# 29. INTER-RATER AGREEMENT

Medir acordo entre avaliadores humanos quando aplicável.

Não punir AI por discordância onde os próprios especialistas não convergem claramente.

---

# 30. LABEL UNCERTAINTY

Permitir:

```text
GROUND_TRUTH_CERTAIN
GROUND_TRUTH_PROBABLE
GROUND_TRUTH_AMBIGUOUS
```

---

# 31. SHADOW MODE MEASUREMENT

Comparar:

```text
Human Result
vs
AI Result
```

não apenas por equality.

Usar comparação estruturada por dimensão.

---

# 32. SHADOW COMPARISON MODEL

```text
task_id
human_result
ai_result
differences[]
severity
materiality
reviewer
root_cause
resolution
```

---

# 33. HUMAN CORRECTION RATE

Medir:

```text
tasks_requiring_material_human_change
/
tasks_reviewed
```

---

# 34. ACCEPTANCE OF RECOMMENDATIONS

Para roles analíticos:

```text
accepted_without_change
accepted_with_minor_change
accepted_with_material_change
rejected
```

---

# 35. NO SINGLE SCORE FOR ALL ROLES

Um Employee documental não deve ser avaliado com os mesmos pesos de um Employee de segurança ou fiscalidade.

---

# 36. ROLE-SPECIFIC WEIGHTS

Criar perfil:

```yaml
reliability_weight_profile:
  role_key: management_reporting
  weights:
    factual_accuracy: 0.30
    calculation_accuracy: 0.25
    source_traceability: 0.20
    process_correctness: 0.10
    escalation_quality: 0.10
    delivery_reliability: 0.05
```

Pesos devem ser versionados.

---

# 37. CRITICAL METRICS CANNOT BE DILUTED

Mesmo que score agregado seja alto:

```text
Critical Error Rate
```

ou:

```text
Undetected Material Error Rate
```

não pode ser escondido por bom desempenho noutras dimensões.

---

# 38. HARD GATES

Exemplo:

```text
IF catastrophic_error > 0
THEN certification = FAIL
```

---

# 39. R4/R5 HARD GATES

Para R4/R5:

```text
missed approval
unauthorized side effect
cross-tenant leak
critical unsupported claim
```

devem gerar NO-GO.

---

# 40. SUPERVISION PROFILE

Criar:

`SupervisionProfile`

Estados possíveis:

```text
H0 — NO_HUMAN_REVIEW_REQUIRED
H1 — SAMPLE_REVIEW
H2 — EXCEPTION_REVIEW
H3 — MATERIAL_OUTPUT_REVIEW
H4 — MANDATORY_PRE_EXECUTION_APPROVAL
H5 — DUAL_CONTROL
```

---

# 41. SUPERVISION DECISION

Supervisão não deve ser atribuída apenas pelo Role.

Deve considerar:

```text
risk
task_type
error history
current reliability
context
organization policy
jurisdiction
amount/materiality
confidence calibration
```

---

# 42. DYNAMIC SUPERVISION

Exemplo:

```text
#64 Bank Reconciliation

exact matches
→ H1

ambiguous matches
→ H3

material adjustments
→ H4
```

---

# 43. SUPERVISION ESCALATION

Se fiabilidade piorar:

```text
H1
↓
H2
↓
H3
```

automaticamente conforme policy.

---

# 44. SUPERVISION RELAXATION

Redução de supervisão deve exigir:

```text
sufficient evidence
stable performance
regression pass
human approval
```

Nunca automática apenas por volume.

---

# 45. RELIABILITY THRESHOLDS

Definir thresholds por:

```text
role
task type
risk
organization
jurisdiction
```

---

# 46. CERTIFICATION THRESHOLD MODEL

Exemplo:

```text
accuracy >= threshold
material_error_rate <= threshold
critical_error_rate == 0
UMER <= threshold
correct_escalation >= threshold
source_traceability >= threshold
```

---

# 47. NO UNIVERSAL THRESHOLD

Não usar:

```text
98% for everything
```

---

# 48. CERTIFICATION BY AUTONOMY

Possibilitar:

```text
CERTIFIED_L1
CERTIFIED_L2
CERTIFIED_L3
CERTIFIED_L4
CERTIFIED_L5
```

com thresholds próprios.

---

# 49. RELIABILITY-AWARE AUTONOMY

Autonomia certificada deve depender de:

```text
reliability evidence
risk
task class
supervision profile
```

---

# 50. AUTO-DOWNGRADE

Se métricas degradarem:

```text
L4
→ L3
```

ou:

```text
ACTIVE
→ REVALIDATION_REQUIRED
```

conforme policy.

---

# 51. ROLLING RELIABILITY WINDOW

Manter:

```text
lifetime metrics
rolling 30-day
rolling 90-day
recent N tasks
```

---

# 52. DRIFT DETECTION

Detectar mudança em:

```text
error rate
escalation rate
knowledge gaps
tool failures
connector failures
task distribution
```

---

# 53. DRIFT ALERT

Se desempenho mudar significativamente:

```text
RELIABILITY_DRIFT_DETECTED
```

---

# 54. BASELINE

Guardar baseline certificado.

Comparar:

```text
current
vs
certification baseline
```

---

# 55. VERSION-AWARE RELIABILITY

Nunca misturar métricas de versões diferentes sem marcação.

Exemplo:

```text
#73 v1.2
!=
#73 v1.3
```

---

# 56. MODEL VERSION IMPACT

Mudança de modelo deve gerar:

```text
revalidation_required
```

conforme risco/impacto.

---

# 57. KNOWLEDGE VERSION IMPACT

Mudança material em Knowledge Pack pode exigir:

```text
regression
revalidation
```

---

# 58. CONNECTOR VERSION IMPACT

Mudança em connector/data mapping pode alterar fiabilidade.

Medir separadamente.

---

# 59. SYSTEM FAILURE VS EMPLOYEE ERROR

Nunca atribuir ao Employee erro causado exclusivamente por:

```text
API outage
connector timeout
bad source data
incorrect configuration
```

Mas registar Task Failure.

---

# 60. RESPONSIBILITY ATTRIBUTION

Criar:

```text
AI_EMPLOYEE
MODEL_PROVIDER
CONNECTOR
TOOL
DATA_SOURCE
ORGANIZATION_CONFIGURATION
HUMAN_INPUT
PLATFORM_CORE
UNKNOWN
```

---

# 61. TASK FAILURE MODEL

Separar:

```text
employee_error
system_failure
external_failure
input_failure
policy_block
human_delay
```

---

# 62. DATA QUALITY EFFECT

Medir performance:

```text
with clean data
with incomplete data
with noisy data
with conflicting data
```

---

# 63. RESILIENCE METRICS

Medir:

```text
recovery_rate
retry_success_rate
graceful_degradation_rate
safe_block_rate
```

---

# 64. SAFE FAILURE

Uma task correctamente bloqueada por falta de evidência não é erro.

Classificar como:

```text
SAFE_BLOCK
```

---

# 65. CORRECT ESCALATION IS SUCCESS

Se Employee identifica correctamente necessidade humana:

```text
ESCALATED_CORRECTLY
```

conta positivamente.

---

# 66. HALLUCINATION MEASUREMENT

Definir:

```text
unsupported factual claim
invented source
invented value
invented policy
invented law
invented system state
```

---

# 67. SOURCE FAITHFULNESS

Medir:

```text
claims supported by actual retrieved evidence
```

---

# 68. CITATION ACCURACY

Quando output usa citações:

```text
citation exists
citation supports claim
citation belongs to correct tenant
citation is current
```

---

# 69. CALCULATION ENGINE VERIFICATION

Cálculos críticos devem ser comparados com referência determinística.

---

# 70. DOCUMENT RELIABILITY

Para Employees #261–#286 medir:

```text
content correctness
template correctness
branding correctness
format correctness
editability
render fidelity
source lineage
approval snapshot integrity
delivery success
```

---

# 71. ACCOUNTING RELIABILITY

Para Accounting medir:

```text
classification correctness
posting proposal correctness
reconciliation correctness
period correctness
account mapping
document linkage
audit trail
```

---

# 72. TAX RELIABILITY

Para Tax medir:

```text
jurisdiction correctness
current rule usage
calculation correctness
deadline correctness
document correctness
escalation of ambiguity
```

---

# 73. FINANCE RELIABILITY

Medir:

```text
cash flow calculations
aging
variance
forecast
matching
source completeness
materiality handling
```

---

# 74. HR RELIABILITY

Medir:

```text
policy compliance
document correctness
schedule accuracy
leave rules
escalation
adverse decision safeguards
```

---

# 75. LEGAL RELIABILITY

Medir:

```text
source authority
jurisdiction correctness
clause analysis
obligation extraction
risk identification
human escalation
```

---

# 76. BANKING RELIABILITY

Medir:

```text
KYC fields
transaction monitoring
credit analysis support
reporting
fraud review
approval enforcement
```

---

# 77. INDUSTRIAL RELIABILITY

Para Manufacturing/Energy/Mining/Oil & Gas:

```text
sensor/data interpretation
maintenance planning
production analysis
safety escalation
event handling
system integration
```

---

# 78. SECURITY RELIABILITY

Para Security/Cybersecurity:

```text
incident detection
false positive rate
missed incident rate
evidence handling
escalation timing
policy compliance
```

---

# 79. CUSTOMER-FACING RELIABILITY

Medir:

```text
resolution accuracy
tone compliance
handoff correctness
response completeness
customer-impact errors
```

---

# 80. MULTI-EMPLOYEE CHAIN RELIABILITY

Quando:

```text
Employee A
→ Employee B
→ Employee C
```

medir:

```text
handoff correctness
data preservation
lineage preservation
error propagation
```

---

# 81. ERROR PROPAGATION

Criar:

```text
origin_employee
downstream_employees
propagated_error
detected_at_stage
```

---

# 82. CHAIN FAILURE ATTRIBUTION

Não culpar Employee C por erro introduzido por A se C actuou correctamente segundo seus inputs.

Mas medir se C deveria ter detectado o erro.

---

# 83. CORRECTION LOOP

```text
error detected
↓
classify
↓
root cause
↓
fix
↓
new test case
↓
regression
↓
retest
```

---

# 84. EVERY MATERIAL ERROR BECOMES REGRESSION CASE

Regra:

```text
E3+
→ regression case required
```

---

# 85. EVERY CRITICAL ERROR BECOMES BLOCKER

```text
E4+
→ certification blocker
```

até resolução.

---

# 86. RELIABILITY DASHBOARD

Criar dashboard:

```text
500 Employees
Average Task Success
Material Error Rate
Critical Error Rate
UMER
Human Correction Rate
Correct Escalation Rate
Employees Below Threshold
Employees in Revalidation
Employees with Drift
```

---

# 87. EMPLOYEE DETAIL DASHBOARD

Mostrar:

```text
Reliability Summary
Task Breakdown
Error Breakdown
Severity
Contexts
Systems
Industries
Jurisdictions
Human Corrections
Escalations
Trend
Confidence Intervals
Certification
Supervision Profile
```

---

# 88. HEATMAP

Criar heatmap:

```text
Employees × Error Categories
```

---

# 89. RISK HEATMAP

Criar:

```text
Employees × Material Error Rate
Employees × UMER
Employees × Critical Errors
```

---

# 90. SUPERVISION HEATMAP

Mostrar:

```text
Employee
Task Type
Required Human Supervision
```

---

# 91. PROGRAM DASHBOARD

Integrar ao 500/500 Priority Program:

```text
Total Employees                 500
Ready for Test                  X
Tested                          X
Below Reliability Threshold     X
Needs Improvement               X
Shadow Mode                     X
Certified                       X
Revalidation Required           X
Active                          X
```

---

# 92. RELIABILITY EVENTS

Emitir:

```text
EV.reliability.test_completed
EV.reliability.threshold_failed
EV.reliability.material_error
EV.reliability.critical_error
EV.reliability.drift_detected
EV.reliability.supervision_increased
EV.reliability.revalidation_required
EV.reliability.certification_updated
```

---

# 93. DATABASE ENTITIES

Criar:

```text
employee_reliability_profiles
employee_reliability_passports
reliability_test_runs
reliability_test_cases
reliability_results
error_events
error_taxonomy
error_root_causes
error_opportunities
human_corrections
human_benchmarks
shadow_comparisons
reliability_baselines
reliability_windows
reliability_thresholds
reliability_confidence_intervals
supervision_profiles
supervision_decisions
reliability_drift_events
reliability_certification_links
regression_cases
```

---

# 94. API

Criar:

```text
GET  /employees/{id}/reliability
GET  /employees/{id}/reliability/passport
GET  /employees/{id}/errors
GET  /employees/{id}/supervision-profile

POST /reliability/test-runs
POST /reliability/errors
POST /reliability/errors/{id}/classify
POST /reliability/errors/{id}/root-cause
POST /reliability/recalculate
POST /reliability/revalidate

GET  /reliability/dashboard
GET  /reliability/heatmap
GET  /reliability/drift

POST /supervision/recalculate
POST /supervision/override
```

---

# 95. RELIABILITY CALCULATION SERVICE

Criar serviço determinístico para métricas.

Não pedir ao LLM para “calcular a taxa de erro”.

---

# 96. STATISTICAL ENGINE

Implementar:

```text
proportions
confidence intervals
rule of three
Wilson interval
bootstrap when appropriate
trend analysis
drift detection
```

---

# 97. SEGMENTATION ENGINE

Permitir:

```text
by employee
by task
by department
by industry
by jurisdiction
by organization
by system
by connector
by model
by version
```

---

# 98. EVALUATOR INDEPENDENCE

Quando possível:

```text
Employee Under Test
!=
Evaluator
```

---

# 99. AI JUDGE LIMIT

AI judge pode ajudar, mas não deve ser autoridade única em:

```text
legal
tax
payments
security
safety
high-impact HR
critical compliance
```

---

# 100. HUMAN REVIEW SAMPLING

Para tarefas de baixo risco, permitir amostragem.

Exemplo:

```text
review 10%
```

com policy adaptativa.

---

# 101. ADAPTIVE SAMPLING

Se erros aumentarem:

```text
increase review sample
```

Se estabilidade comprovada:

```text
reduce sample
```

dentro dos limites de policy.

---

# 102. RANDOM SAMPLING

Usar amostragem aleatória para evitar selecção apenas de casos fáceis.

---

# 103. STRATIFIED SAMPLING

Amostra deve cobrir:

```text
normal
edge
high-value
low-value
different systems
different sectors
different jurisdictions
```

---

# 104. REAL-WORLD TESTING

Depois de synthetic/golden:

```text
controlled production-like data
```

com segurança e anonimização quando necessário.

---

# 105. LIVE MONITORING AFTER CERTIFICATION

Certificação não encerra avaliação.

Continuar:

```text
rolling reliability
drift
errors
human corrections
incident review
```

---

# 106. ACTIVE EMPLOYEE RELIABILITY

Employee Active deve manter:

```text
minimum reliability threshold
valid certification
valid supervision profile
```

---

# 107. AUTO-PAUSE CONDITIONS

Exemplo:

```text
critical_error_detected
cross-tenant breach
approval bypass
material drift
UMER above threshold
```

→

```text
PAUSE
```

---

# 108. REVALIDATION

Trigger por:

```text
model change
prompt change
Role Pack change
Knowledge change
connector change
workflow change
policy change
significant drift
critical incident
```

---

# 109. CERTIFICATION LINK

Reliability Passport deve ser pré-requisito de certificação.

---

# 110. ORGANIZATION-SPECIFIC RELIABILITY

Criar:

```text
platform reliability
organization reliability
```

Um Employee pode ser globalmente certificado mas ainda precisar de validação específica numa empresa.

---

# 111. ORGANIZATION RELIABILITY PROFILE

Exemplo:

```yaml
organization_employee_reliability:
  organization_id: org_ABC
  employee_id: 73
  tasks_run: 420
  task_success_rate: null
  material_error_rate: null
  human_correction_rate: null
  supervision_profile: H2
```

---

# 112. JURISDICTION-SPECIFIC RELIABILITY

Exemplo:

```text
#78 VAT
Angola
```

deve ser medido separadamente de outro país.

---

# 113. INDUSTRY-SPECIFIC RELIABILITY

Exemplo:

```text
#73
Retail
Construction
Banking
```

podem ter resultados diferentes.

---

# 114. SYSTEM-SPECIFIC RELIABILITY

Exemplo:

```text
Primavera
SAP
Odoo
Excel
```

podem ter mappings e falhas distintas.

---

# 115. TOOL-SPECIFIC RELIABILITY

Medir:

```text
tool call success
tool semantic correctness
tool idempotency
tool output validation
```

---

# 116. RELIABILITY BUDGET

Opcionalmente criar:

```text
maximum tolerated error budget
```

por Employee/task.

---

# 117. ERROR BUDGET EXHAUSTION

Se excedido:

```text
increase supervision
pause autonomy
revalidation required
```

---

# 118. RELIABILITY TREND

Mostrar:

```text
improving
stable
degrading
insufficient_data
```

---

# 119. INSUFFICIENT DATA

Não atribuir ranking definitivo se sample size for insuficiente.

Mostrar:

```text
INSUFFICIENT_EVIDENCE
```

---

# 120. NO GAMIFIED RANKING

Não criar ranking simplista “Employee mais inteligente”.

Comparar apenas dentro de métricas operacionalmente relevantes.

---

# 121. ERROR EXAMPLES LIBRARY

Criar biblioteca:

```text
error_id
employee
task
input
wrong_output
correct_output
severity
root_cause
fix
regression_case
```

---

# 122. NEAR MISS

Criar estado:

```text
NEAR_MISS
```

para erro detectado antes de efeito material.

---

# 123. NEAR MISS RATE

Medir porque revela fragilidade mesmo quando controlos funcionaram.

---

# 124. CONTROL EFFECTIVENESS

Medir:

```text
Employee error occurred
but
policy/approval/validator caught it
```

---

# 125. DEFENSE-IN-DEPTH METRICS

Separar:

```text
AI error probability
control detection probability
residual undetected error probability
```

---

# 126. RESIDUAL RISK

Criar:

```text
Residual Operational Risk
```

como combinação de:

```text
error rate
severity
detectability
control effectiveness
exposure
```

---

# 127. MATERIALITY

Permitir materialidade por:

```text
amount
percentage
legal consequence
customer impact
operational impact
safety impact
```

---

# 128. MATERIALITY THRESHOLDS

Versionados por organização/sector/jurisdição.

---

# 129. FALSE POSITIVE COST

Medir custo de excesso de alertas.

---

# 130. FALSE NEGATIVE COST

Medir custo de erros não detectados.

---

# 131. ESCALATION QUALITY

Escalar tudo não é qualidade.

Medir equilíbrio:

```text
correctly escalated
unnecessarily escalated
missed escalation
```

---

# 132. TIME-TO-DETECT

Medir:

```text
error occurrence
→ detection
```

---

# 133. TIME-TO-CORRECT

Medir:

```text
detection
→ fix
```

---

# 134. TIME-TO-RECERTIFY

Medir:

```text
critical regression
→ revalidated certification
```

---

# 135. COST OF ERROR

Opcionalmente estimar:

```text
human correction time
rework cost
delay cost
financial impact
customer impact
```

---

# 136. COST-QUALITY TRADEOFF

Não reduzir custo sacrificando reliability threshold.

---

# 137. RELIABILITY-AWARE MODEL ROUTING

Permitir que tarefas críticas usem configuração de modelo mais robusta.

---

# 138. RELIABILITY-AWARE TOOL ROUTING

Preferir ferramenta determinística quando possível.

---

# 139. LOW-CONFIDENCE HANDLING

Se calibrated confidence abaixo do threshold:

```text
ASK
ESCALATE
BLOCK
```

conforme task/risk.

---

# 140. RELIABILITY CHANGE LOG

Guardar:

```text
metric change
reason
version
date
impact
```

---

# 141. AUDITABILITY

Toda métrica deve ser reproduzível a partir de:

```text
test cases
test outputs
labels
review decisions
calculation version
```

---

# 142. ANTI-MANIPULATION

Não permitir alterar manualmente métricas agregadas sem audit trail.

---

# 143. EVALUATION DATA SECURITY

Test datasets podem conter dados sensíveis.

Aplicar:

```text
tenant isolation
encryption
access control
retention
masking
```

---

# 144. TEST DATA LEAKAGE

Impedir que golden answers sejam injectadas indevidamente no Employee antes do teste.

---

# 145. BENCHMARK CONTAMINATION

Versionar datasets e controlar acesso.

---

# 146. ADVERSARIAL TESTING

Incluir:

```text
prompt injection
fake document
tampered policy
conflicting source
malicious spreadsheet
wrong tenant identifier
unexpected format
```

---

# 147. RELIABILITY OF DOCUMENT EMPLOYEES

Para #261–#286 criar suites específicas.

---

# 148. RELIABILITY OF AI WORKFORCE EMPLOYEES

Para Employees que gerem outros Employees medir:

```text
routing correctness
policy enforcement
supervision correctness
cost optimization without quality loss
```

---

# 149. META-ERROR PREVENTION

Employee supervisor não pode “corrigir” outro Employee de forma não auditável.

---

# 150. RELEASE GATES

Adicionar gate:

# **RELIABILITY READINESS GATE**

---

# 151. RELIABILITY GATE CONDITIONS

Exemplo:

```text
all required metrics available
minimum sample size reached
confidence intervals calculated
no unresolved critical error
UMER within threshold
supervision profile assigned
```

---

# 152. P04 INTEGRATION

EREMS deve integrar-se com Evaluation & Certification Engine.

---

# 153. P02 INTEGRATION

Security findings devem alimentar reliability incidents.

---

# 154. P03 INTEGRATION

Connector/tool failures devem ser separados de reasoning errors.

---

# 155. ORDKS INTEGRATION

Knowledge gaps, stale knowledge e conflicts devem ser causas rastreáveis.

---

# 156. WORK CONTRACT INTEGRATION

Task failure deve ser avaliado contra contrato esperado.

---

# 157. DOCUMENT SERVICE INTEGRATION

Rendering/delivery failures devem aparecer separadamente.

---

# 158. ORGANIZATION READINESS INTEGRATION

Organization-specific reliability deve ser requisito de activation quando necessário.

---

# 159. UI — RELIABILITY CENTER

Criar ecrã:

```text
Reliability Overview
Employees
Errors
Material Errors
Critical Errors
UMER
Escalations
Human Corrections
Drift
Supervision
Certification
```

---

# 160. UI — EMPLOYEE RELIABILITY TAB

Na ficha do Employee:

```text
Reliability
├── Summary
├── Task Types
├── Errors
├── Severity
├── Contexts
├── Escalation
├── Human Corrections
├── Trend
├── Statistics
├── Supervision
└── Certification
```

---

# 161. UI — ERROR INVESTIGATION

Permitir:

```text
view input
view output
view expected result
view source lineage
view error classification
view root cause
view fix
view regression case
```

---

# 162. UI — SUPERVISION POLICY

Mostrar:

```text
current supervision level
reason
metrics
thresholds
override
history
```

---

# 163. GENERATED OUTPUTS

Gerar:

```text
generated/employee_reliability_passports_500.json
generated/reliability_thresholds_500.json
generated/supervision_profiles_500.json
generated/error_taxonomy.json
generated/reliability_metrics_catalog.json
generated/reliability_dashboard_seed.json
generated/reliability_validation_matrix_500.json

schemas/employee-reliability-passport.schema.json
schemas/error-event.schema.json
schemas/error-root-cause.schema.json
schemas/supervision-profile.schema.json
schemas/reliability-threshold.schema.json
schemas/reliability-test-result.schema.json

db/migrations/...
db/seeds/...

packages/reliability-engine/
packages/statistical-engine/
packages/error-classifier/
packages/supervision-engine/
packages/drift-detector/
packages/reliability-reporting/
packages/reliability-certification-bridge/

tests/reliability/
tests/statistics/
tests/error-classification/
tests/supervision/
tests/drift/
tests/security/
tests/regression/

docs/RELIABILITY_ARCHITECTURE.md
docs/ERROR_TAXONOMY.md
docs/SUPERVISION_FRAMEWORK.md
docs/STATISTICAL_VALIDATION.md
docs/500_EMPLOYEE_RELIABILITY_READINESS.md
```

---

# 164. ACCEPTANCE TESTS

Obrigatórios:

1. 500/500 Employees possuem Reliability Passport;
2. métricas são calculadas deterministicamente;
3. zero erros não vira 0% de erro garantido;
4. confidence intervals são calculados;
5. material errors são diferenciados de minor errors;
6. UMER é calculado;
7. task type segmentation funciona;
8. context segmentation funciona;
9. system failures não são confundidos com Employee errors;
10. correct escalation conta positivamente;
11. safe block não conta como erro;
12. E3+ vira regression case;
13. E4+ bloqueia certificação até resolução;
14. supervision profile é recalculado;
15. drift é detectado;
16. certification pode ser invalidada;
17. organization-specific reliability funciona;
18. no cross-tenant metrics leak;
19. no manual metric tampering;
20. dashboard reflecte apenas dados reais.

---

# 165. BUILD GATE

Executar:

```text
RELIABILITY PASSPORTS        500/500 PASS
ERROR TAXONOMY               PASS
SEVERITY MODEL               PASS
STATISTICAL ENGINE           PASS
CONFIDENCE INTERVALS         PASS
UMER                          PASS
SUPERVISION ENGINE            PASS
DRIFT DETECTION              PASS
ROOT CAUSE ENGINE            PASS
REGRESSION LINK              PASS
CERTIFICATION BRIDGE         PASS
TENANT ISOLATION             PASS
AUDITABILITY                 PASS
```

---

# 166. NO FALSE RELIABILITY CLAIMS

Nunca declarar:

```text
99.9% reliable
```

sem:

```text
sample size
test scope
confidence interval
task context
version
```

---

# 167. RELIABILITY REPORT FORMAT

Exemplo:

```text
Employee: #66 Document Classification
Version: 2.3
Tests: 5,240
Task Success: 98.8%
Material Error Rate: 0.12%
Critical Error Rate: 0%
UMER: 0.04%
Correct Escalation: 97.6%
Human Correction: 1.4%
95% CI: [...]
Certified Autonomy: L3
Supervision: H2
Known Limitations: [...]
```

---

# 168. PROGRAM LEVEL REPORT

Gerar:

```text
500 Employees
Tested
Insufficient Evidence
Below Threshold
Needs Improvement
Shadow
Certified
Revalidation Required
Active

Material Errors
Critical Errors
UMER
Average Human Correction
Average Correct Escalation
```

---

# 169. DEFINITION OF DONE

EREMS só está implementado quando:

```text
✓ 500/500 Reliability Passports existem
✓ Error Severity funciona
✓ Error Taxonomy funciona
✓ Root Cause funciona
✓ Task-level reliability funciona
✓ Context-level reliability funciona
✓ Statistical confidence funciona
✓ Rule of Three funciona
✓ UMER funciona
✓ Escalation quality funciona
✓ Safe Block funciona
✓ Human Correction Rate funciona
✓ Supervision Engine funciona
✓ Dynamic supervision funciona
✓ Drift detection funciona
✓ Revalidation funciona
✓ Certification integration funciona
✓ Organization-specific reliability funciona
✓ Audit trail funciona
✓ UI existe
✓ APIs existem
✓ Tests passam
```

---

# 170. PRINCÍPIO FINAL

O sistema não deve responder apenas:

```text
“Este Employee passou.”
```

Deve responder:

```text
Este Employee foi testado em N casos.

A sua taxa de sucesso observada foi X.

A taxa de erro material observada foi Y.

A taxa de erro crítico observada foi Z.

A taxa de erro material não detectado foi W.

O intervalo estatístico é [...].

Os erros concentram-se em [...].

As limitações conhecidas são [...].

A supervisão exigida é Hx.

O nível de autonomia certificado é Lx.

A certificação é válida para estes contextos:
[industry / jurisdiction / system / task types].

Fora destes contextos, precisa de nova validação.
```

---

# 171. RESULTADO ESPERADO

Depois da implementação:

```text
500 PRIORITY EMPLOYEES
↓
500 READY_FOR_TEST
↓
MEASURED RELIABILITY
↓
ERROR PROFILE
↓
SUPERVISION PROFILE
↓
AUTONOMY DECISION
↓
CERTIFICATION
↓
ORGANIZATION-SPECIFIC VALIDATION
↓
ACTIVE
```

O objectivo é transformar “confiamos que o Employee trabalha bem” em:

```text
TEMOS EVIDÊNCIA OBJECTIVA,
ESTATISTICAMENTE QUALIFICADA,
AUDITÁVEL
E OPERACIONALMENTE ACCIONÁVEL
SOBRE QUANDO O EMPLOYEE FUNCIONA BEM,
QUANDO FALHA
E QUANDO PRECISA OBRIGATORIAMENTE DE HUMANO.
```

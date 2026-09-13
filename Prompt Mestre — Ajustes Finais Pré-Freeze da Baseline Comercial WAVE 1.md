# PROMPT MESTRE

## FINAL PRE-FREEZE COMMERCIAL BASELINE HARDENING — WAVE 1

Actue como um **Chief Technology Officer, SaaS Architect, Revenue Operations Architect, FinOps Specialist, Audit & Compliance Architect, Tax Systems Architect, Security Architect e Senior Software Engineer**.

Está a trabalhar na **AI Employees Platform AETF-500 v2.0**, que concluiu com sucesso a execução do primeiro cliente pagante real e atingiu os estados:

```text
FIRST_PAID_CUSTOMER_VALIDATED
REAL_REVENUE_VALIDATED
WAVE_1_CERTIFIED
AUTHORIZED_FOR_WAVE_2_TRIO_CUSTOMERS
```

A baseline comercial encontra-se pronta para freeze, mas antes da sua congelação definitiva deverão ser implementados, testados e auditados **cinco ajustes obrigatórios de hardening**.

O objectivo desta intervenção não é alterar a arquitectura comercial central, mas reforçar a precisão financeira, fiscal, operacional e probatória da certificação da WAVE 1.

---

# 1. OBJECTIVO PRINCIPAL

Implementar os seguintes cinco ajustes antes do freeze:

```text
1. Separar PAYMENT, SETTLEMENT e RECONCILIATION
2. Validar e corrigir semanticamente o FTV
3. Remover o limite conceptual de 1.000 clientes da GENERAL_AVAILABILITY
4. Tornar o cálculo fiscal configurável e juridicamente rastreável
5. Reforçar o Commercial Evidence Vault além do simples hash SHA-256
```

A baseline só poderá ser congelada depois de:

```text
IMPLEMENTATION_COMPLETE
+
TESTS_PASS
+
MIGRATIONS_COMPLETE
+
AUDIT_COMPLETE
+
DOCUMENTATION_UPDATED
```

---

# 2. AJUSTE 1 — SEPARAÇÃO FORMAL ENTRE PAYMENT, SETTLEMENT E RECONCILIATION

Actualmente, o relatório comercial agrega conceitos financeiros distintos.

Separar formalmente:

```text
PAYMENT_RECEIVED
PAYMENT_SETTLED
PAYMENT_RECONCILED
```

Estes estados não poderão ser tratados como equivalentes.

---

# 3. DEFINIÇÕES FINANCEIRAS

## PAYMENT_RECEIVED

Indica que o sistema ou prestador de pagamento recebeu confirmação do pagamento.

Não significa obrigatoriamente que o dinheiro tenha sido liquidado na conta da plataforma.

## PAYMENT_SETTLED

Indica que o valor foi efectivamente liquidado pelo prestador financeiro ou banco.

## PAYMENT_RECONCILED

Indica que o valor liquidado foi correctamente associado a:

- cliente;
- factura;
- contrato;
- subscrição;
- período;
- moeda;
- valor;
- conta financeira.

---

# 4. NOVO FLUXO FINANCEIRO

Implementar:

```text
INVOICE_ISSUED
        ↓
PAYMENT_INITIATED
        ↓
PAYMENT_AUTHORIZED
        ↓
PAYMENT_RECEIVED
        ↓
PAYMENT_SETTLED
        ↓
PAYMENT_RECONCILED
        ↓
REVENUE_ELIGIBLE_FOR_VALIDATION
```

Não permitir:

```text
PAYMENT_RECEIVED
        ↓
REAL_REVENUE_VALIDATED
```

sem settlement e reconciliação.

---

# 5. EVIDÊNCIAS FINANCEIRAS SEPARADAS

Criar:

```text
PAYMENT_EVIDENCE
SETTLEMENT_EVIDENCE
RECONCILIATION_EVIDENCE
```

Cada evidência deverá possuir ID próprio.

Exemplo:

```text
PAYMENT-EVIDENCE-000001
SETTLEMENT-EVIDENCE-000001
RECONCILIATION-EVIDENCE-000001
```

---

# 6. PAYMENT EVIDENCE MODEL

Campos mínimos:

```yaml
payment_evidence_id:
payment_id:
customer_id:
invoice_id:

amount:
currency:

provider:
provider_reference:

received_at:

status:

source_system:

content_hash:
```

---

# 7. SETTLEMENT EVIDENCE MODEL

Criar:

```yaml
settlement_evidence_id:

payment_id:
settlement_id:

gross_amount:
fees:
net_amount:

currency:

provider:
bank_reference:

settlement_date:
settlement_account_reference:

status:

content_hash:
```

Nunca armazenar dados bancários sensíveis desnecessários.

---

# 8. RECONCILIATION EVIDENCE MODEL

Criar:

```yaml
reconciliation_evidence_id:

payment_id:
settlement_id:
invoice_id:
customer_id:
subscription_id:

expected_amount:
settled_amount:
difference:

currency:

reconciliation_status:

reconciled_at:
reconciled_by:

matching_method:

content_hash:
```

Estados:

```text
MATCHED
PARTIALLY_MATCHED
UNMATCHED
MANUAL_REVIEW
RECONCILED
```

---

# 9. REAL REVENUE VALIDATION RULE

Actualizar a regra para:

```text
IF
payment_received = true
AND payment_settled = true
AND payment_reconciled = true
AND reconciliation_difference = 0
THEN
payment_financially_valid = true
```

Caso contrário:

```text
REAL_REVENUE_VALIDATED = BLOCKED
```

---

# 10. AJUSTE 2 — CORRECÇÃO SEMÂNTICA DO FIRST TIME TO VALUE

Validar o actual valor:

```text
FTV = 0.25 hours
```

Não assumir automaticamente que 0,25 horas significa First Time to Value correcto.

---

# 11. DEFINIÇÃO OFICIAL DO FTV

A fórmula deverá ser:

```text
FTV =
CustomerAcceptedResultTimestamp
-
CommercialActivationReferenceTimestamp
```

Por defeito, utilizar:

```text
CommercialActivationReferenceTimestamp = PaymentTimestamp
```

ou outro evento comercial explicitamente definido e versionado.

Não utilizar:

```text
task_execution_duration
```

como FTV.

---

# 12. DIFERENCIAR MÉTRICAS DE TEMPO

Criar métricas distintas:

```text
TIME_TO_PAYMENT
TIME_TO_PROVISION
TIME_TO_READY
TIME_TO_FIRST_TASK
TASK_EXECUTION_TIME
TIME_TO_FIRST_ACCEPTED_RESULT
FIRST_TIME_TO_VALUE
```

Nunca misturá-las.

---

# 13. EXEMPLO

Se:

```text
Payment:        10:00
Employee Ready: 10:07
Task Started:   10:09
Task Completed: 10:13
Accepted:       10:15
```

Então:

```text
Task Execution Time:
4 minutes

FTV:
15 minutes
```

ou:

```text
0.25 hours
```

Neste caso o valor estará correcto.

---

# 14. FTV EVIDENCE

Actualizar:

```text
FTV_EVIDENCE
```

para incluir:

```yaml
payment_timestamp:
employee_ready_timestamp:
first_task_started_timestamp:
first_task_completed_timestamp:
customer_acceptance_timestamp:

task_execution_duration:
time_to_first_accepted_result:
first_time_to_value:

calculation_formula:
calculation_version:

metric_source: REAL_PRODUCTION
```

---

# 15. FTV VALIDATION RULE

Criar validação:

```text
FTV != TASK_EXECUTION_TIME
```

excepto por coincidência matemática comprovada.

Adicionar teste que detecte confusão semântica entre ambas as métricas.

---

# 16. AJUSTE 3 — REMOVER GENERAL AVAILABILITY = 1000 CLIENTES

Remover o conceito:

```text
GENERAL_AVAILABILITY
limit = 1000
```

General Availability não deverá representar uma coorte fixa de clientes.

---

# 17. NOVA ESTRUTURA DE ESCALA

Implementar:

```text
WAVE_0_INTERNAL
↓
WAVE_1_SINGLE_CUSTOMER
↓
WAVE_2_TRIO_CUSTOMERS
↓
WAVE_3_10_CUSTOMERS
↓
WAVE_4_25_CUSTOMERS
↓
WAVE_5_50_CUSTOMERS
↓
SCALE_READINESS_GATE
↓
GENERAL_AVAILABILITY
```

---

# 18. GENERAL AVAILABILITY

Definir:

```text
GENERAL_AVAILABILITY
```

como estado comercial de disponibilidade ampla e não como coorte limitada.

GA deverá depender de capacidade dinâmica.

---

# 19. CAPACITY MANAGEMENT

Criar:

```text
current_customer_count
current_employee_instances

soft_customer_capacity
hard_customer_capacity

soft_employee_capacity
hard_employee_capacity

compute_capacity
storage_capacity
support_capacity
api_capacity
billing_capacity

autoscaling_enabled
```

---

# 20. CAPACITY STATES

Criar:

```text
CAPACITY_HEALTHY
CAPACITY_WARNING
CAPACITY_AT_RISK
CAPACITY_LIMITED
CAPACITY_BLOCKED
```

---

# 21. SCALE READINESS GATE

Antes de General Availability exigir:

```text
SCALE_READINESS_GATE = PASS
```

Avaliar:

- uptime;
- incident rate;
- customer support capacity;
- billing stability;
- infrastructure capacity;
- AI provider capacity;
- gross margin;
- contribution margin;
- churn;
- retention;
- observability;
- tenant isolation;
- security;
- deployment reliability.

---

# 22. AJUSTE 4 — FISCALIDADE CONFIGURÁVEL E RASTREÁVEL

Não hardcodificar:

```text
VAT = 14%
```

como regra universal.

Criar um:

# TAX DETERMINATION ENGINE

capaz de determinar a regra fiscal aplicável em função do contexto real da operação.

---

# 23. CAMPOS FISCAIS MÍNIMOS

Cada factura deverá possuir:

```yaml
tax_jurisdiction:
tax_country:
tax_region:

customer_tax_id:

supplier_tax_id:

tax_regime:
transaction_type:

tax_code:
tax_rate:

tax_base:
tax_amount:

tax_rule_id:
tax_rule_version:

tax_effective_date:

legal_basis_reference:

tax_determination_timestamp:
```

---

# 24. TAX RULE VERSIONING

Criar:

```text
TAX_RULE_VERSION
```

Exemplo:

```text
AO-VAT-STANDARD-2026-v1
```

Não assumir que regras fiscais permanecem permanentes.

---

# 25. TAX DETERMINATION FLOW

Implementar:

```text
Customer Jurisdiction
        ↓
Supplier Jurisdiction
        ↓
Transaction Type
        ↓
Customer Tax Status
        ↓
Supplier Tax Status
        ↓
Applicable Tax Regime
        ↓
Applicable Tax Rule
        ↓
Rate
        ↓
Tax Calculation
        ↓
Invoice
```

---

# 26. TAX RULE ENGINE

O motor deverá permitir:

```text
STANDARD_RATE
REDUCED_RATE
ZERO_RATE
EXEMPT
REVERSE_CHARGE
WITHHOLDING
OUT_OF_SCOPE
CUSTOM_RULE
```

sem assumir que todas se aplicam a Angola.

---

# 27. LEGAL BASIS TRACEABILITY

Cada regra fiscal deverá apontar para:

```text
legal_basis_reference
legal_source
effective_from
effective_to
jurisdiction
rule_version
```

---

# 28. NÃO PERMITIR HARD-CODE SILENCIOSO

Adicionar teste que falhe se:

```text
tax_rate = 14
```

estiver hardcoded em locais onde deveria ser resolvido pelo Tax Determination Engine.

---

# 29. TAX EVIDENCE

Criar:

```text
TAX-EVIDENCE-000001
```

com:

```yaml
invoice_id:
customer_id:

jurisdiction:
tax_regime:
tax_rate:

tax_base:
tax_amount:

tax_rule_id:
tax_rule_version:

legal_basis_reference:

calculated_at:
validated_at:
```

---

# 30. AJUSTE 5 — REFORÇO DO COMMERCIAL EVIDENCE VAULT

O hash SHA-256 deverá continuar a ser utilizado para integridade.

Contudo:

```text
SHA256 != proof of origin authenticity
```

Portanto, reforçar o Evidence Vault.

---

# 31. MODELO DE EVIDÊNCIA REFORÇADO

Cada evidência deverá possuir:

```yaml
evidence_id:
evidence_type:

customer_id:
employee_id:
employee_instance_id:

related_entity_type:
related_entity_id:

environment:

source_system:
source_reference:

issuer:
issuer_type:

created_at:
received_at:
verified_at:

verified_by:

content_hash:
previous_hash:

signature_status:
signature_type:
signature_reference:

timestamp_status:
timestamp_reference:

storage_reference:

classification:
retention_policy:

status:
```

---

# 32. ORIGEM DA EVIDÊNCIA

Adicionar:

```text
source_system
source_reference
issuer
```

Exemplos:

```text
Bank
Payment Gateway
Customer Portal
Internal Billing Engine
Employee Runtime
Audit Service
ERP
Tax System
```

---

# 33. SIGNATURE STATUS

Criar:

```text
NOT_SIGNED
INTERNALLY_SIGNED
EXTERNALLY_SIGNED
SIGNATURE_VERIFIED
SIGNATURE_INVALID
```

---

# 34. TIMESTAMP STATUS

Criar:

```text
SYSTEM_TIMESTAMP
TRUSTED_TIMESTAMP
EXTERNAL_TIMESTAMP
TIMESTAMP_VERIFIED
```

Não exigir necessariamente serviço externo em todas as evidências, mas permitir evolução futura.

---

# 35. ENVIRONMENT IDENTIFICATION

Cada evidência deverá guardar:

```text
PRODUCTION
STAGING
TEST
DEVELOPMENT
```

Somente:

```text
environment = PRODUCTION
```

poderá contribuir para:

```text
FIRST_PAID_CUSTOMER_VALIDATED
REAL_REVENUE_VALIDATED
```

---

# 36. EVIDENCE AUTHENTICITY SCORE

Criar, se tecnicamente útil:

```text
EVIDENCE_AUTHENTICITY_LEVEL
```

com:

```text
LEVEL_0_UNVERIFIED
LEVEL_1_INTERNAL_SOURCE
LEVEL_2_VERIFIED_SOURCE
LEVEL_3_EXTERNALLY_VERIFIABLE
LEVEL_4_SIGNED_AND_VERIFIED
```

Não utilizar como substituto de validação humana ou jurídica.

---

# 37. EVIDENCE CHAIN

Manter:

```text
Evidence N
↓
SHA256(previous_hash + canonical_content)
↓
Evidence N+1
```

Usar canonicalização determinística antes do hashing.

---

# 38. CANONICALIZATION

Definir formato de serialização estável para evitar hashes diferentes devido apenas a:

- ordem dos campos;
- espaços;
- encoding;
- timezone;
- formatação.

Criar:

```text
evidenceCanonicalizer()
```

---

# 39. HASH VERSIONING

Adicionar:

```text
hash_algorithm:
SHA-256

hash_schema_version:
v1
```

Permitir futura migração para outros mecanismos sem quebrar provas antigas.

---

# 40. EVIDENCE VERIFICATION ENGINE

Criar:

```text
CommercialEvidenceVerificationEngine
```

Responsável por validar:

- hash;
- previous hash;
- source;
- environment;
- issuer;
- signature;
- timestamp;
- completeness;
- status.

---

# 41. ESTADOS DE VERIFICAÇÃO

Criar:

```text
EVIDENCE_CREATED
EVIDENCE_RECEIVED
EVIDENCE_HASHED
EVIDENCE_VERIFIED
EVIDENCE_REJECTED
EVIDENCE_SUPERSEDED
```

---

# 42. SCORECARD ACTUALIZADO

O scorecard deverá deixar de mostrar apenas:

```text
PASS
```

e passar a apresentar:

```text
PASS

Evidence ID:
RECONCILIATION-EVIDENCE-000001

Source:
BankReconciliationEngine

Environment:
PRODUCTION

Verified:
TRUE

Signature Status:
VERIFIED / N/A

Hash Status:
VALID
```

---

# 43. DATABASE CHANGES

Adicionar ou rever:

```text
payments
payment_events

settlements
settlement_events

reconciliations
reconciliation_matches

tax_rules
tax_rule_versions
tax_determinations
tax_evidence

production_metrics
metric_calculations

capacity_snapshots
capacity_limits
scale_readiness

commercial_evidence
evidence_signatures
evidence_verifications
evidence_hash_chain
```

---

# 44. API CHANGES

Criar ou actualizar:

```http
GET /api/v1/payments/{id}
GET /api/v1/settlements/{id}
GET /api/v1/reconciliations/{id}

POST /api/v1/reconciliations/run

GET /api/v1/metrics/ftv/{customerId}

GET /api/v1/capacity
GET /api/v1/scale-readiness

POST /api/v1/tax/determine
GET /api/v1/tax/rules/{ruleId}

GET /api/v1/evidence/{evidenceId}
POST /api/v1/evidence/{evidenceId}/verify
```

---

# 45. EVENTS

Adicionar:

```text
payment.received
payment.settled
payment.reconciled

reconciliation.failed

ftv.calculated
ftv.corrected

capacity.warning
capacity.limit_reached

scale_readiness.passed
scale_readiness.failed

tax.determined
tax.rule_applied

evidence.created
evidence.verified
evidence.rejected
```

---

# 46. TESTES OBRIGATÓRIOS — FINANCEIRO

Validar:

```text
payment_received = true
payment_settled = false
```

Resultado:

```text
REAL_REVENUE_VALIDATED = BLOCKED
```

Validar:

```text
payment_received = true
payment_settled = true
payment_reconciled = false
```

Resultado:

```text
REAL_REVENUE_VALIDATED = BLOCKED
```

---

# 47. TESTES OBRIGATÓRIOS — FTV

Criar cenário:

```text
Payment: 10:00
Task Start: 10:09
Task Finish: 10:13
Acceptance: 10:15
```

Esperado:

```text
Task Execution Time = 4 minutes
FTV = 15 minutes
```

---

# 48. TESTES OBRIGATÓRIOS — GENERAL AVAILABILITY

Validar que:

```text
GENERAL_AVAILABILITY
```

não possui limite fixo obrigatório de:

```text
1000 customers
```

GA deverá depender do capacity engine.

---

# 49. TESTES OBRIGATÓRIOS — FISCALIDADE

Validar que diferentes regras podem produzir:

```text
tax_rate A
tax_rate B
tax_exempt
tax_zero
```

de acordo com configuração.

Não assumir valores específicos sem regra configurada.

---

# 50. TESTES OBRIGATÓRIOS — EVIDENCE VAULT

Testar:

- alteração do conteúdo;
- alteração do previous hash;
- source inexistente;
- environment errado;
- assinatura inválida;
- timestamp inválido;
- evidência incompleta.

O sistema deverá detectar inconsistências.

---

# 51. MIGRAÇÕES

Criar migrations seguras para os dados existentes da WAVE 1.

Não perder:

- payment evidence;
- métricas;
- tax data;
- hashes;
- audit logs;
- timestamps;
- certification records.

---

# 52. BACKWARD COMPATIBILITY

Garantir compatibilidade com:

```text
COMMERCIAL-BASELINE-v2.0
```

sempre que possível.

Quando não for possível, documentar explicitamente breaking changes.

---

# 53. REPROCESSAMENTO DA WAVE 1

Depois das alterações, reprocessar os dados do primeiro cliente real.

Executar novamente:

```text
PAYMENT VALIDATION
SETTLEMENT VALIDATION
RECONCILIATION VALIDATION

FTV VALIDATION

TAX VALIDATION

EVIDENCE VERIFICATION

COMMERCIAL CERTIFICATION
```

---

# 54. NÃO DUPLICAR TRANSAÇÕES REAIS

O reprocessamento deverá ser:

```text
READ-ONLY / RECONCILIATION SAFE
```

quando possível.

Nunca:

- cobrar novamente;
- emitir nova factura por engano;
- gerar pagamento duplicado;
- executar tarefa comercial duplicada;
- reenviar comandos externos sem necessidade.

---

# 55. REVALIDAÇÃO DA CERTIFICAÇÃO

Depois do hardening, reavaliar:

```text
FIRST_PAID_CUSTOMER_VALIDATED
REAL_REVENUE_VALIDATED
WAVE_1_CERTIFIED
AUTHORIZED_FOR_WAVE_2_TRIO_CUSTOMERS
```

---

# 56. HARD FREEZE GATE

Criar:

```text
COMMERCIAL_BASELINE_FREEZE_GATE
```

Critérios:

```text
payment_settlement_separation = PASS

financial_reconciliation = PASS

ftv_semantics = PASS

general_availability_model = PASS

tax_determination_engine = PASS

evidence_authenticity_controls = PASS

migrations = PASS

tests = PASS

documentation = PASS

wave_1_revalidation = PASS
```

---

# 57. FREEZE STATUS

Somente após:

```text
COMMERCIAL_BASELINE_FREEZE_GATE = PASS
```

gerar:

```text
BASELINE_FROZEN
```

---

# 58. NOVA BASELINE RECOMENDADA

Criar:

```text
AETF-500-COMMERCIAL-WAVE1-FROZEN-v2.1-2026.09.12
```

ou nomenclatura compatível com o versionamento oficial do projecto.

---

# 59. BASELINE MANIFEST

Gerar:

```yaml
baseline_id:

previous_baseline:
COMMERCIAL-BASELINE-v2.0

wave:
WAVE_1_SINGLE_CUSTOMER

certification:
WAVE_1_CERTIFIED

authorization:
AUTHORIZED_FOR_WAVE_2_TRIO_CUSTOMERS

financial_model_version:
tax_engine_version:
evidence_schema_version:
ftv_formula_version:

source_commit:
build_id:

frozen_at:

baseline_hash:
```

---

# 60. DOCUMENTAÇÃO FINAL

Actualizar:

- arquitectura;
- schemas;
- APIs;
- workflows;
- runbooks;
- relatórios;
- dashboards;
- audit documentation;
- financial definitions;
- tax engine documentation;
- evidence model;
- certification criteria.

---

# 61. RELATÓRIO FINAL

Gerar automaticamente:

# FINAL WAVE 1 COMMERCIAL BASELINE HARDENING & FREEZE REPORT

O relatório deverá indicar claramente:

```text
Adjustment 1:
PAYMENT / SETTLEMENT / RECONCILIATION
PASS / FAIL

Adjustment 2:
FTV SEMANTIC VALIDATION
PASS / FAIL

Adjustment 3:
GENERAL AVAILABILITY CAPACITY MODEL
PASS / FAIL

Adjustment 4:
TAX DETERMINATION & LEGAL TRACEABILITY
PASS / FAIL

Adjustment 5:
COMMERCIAL EVIDENCE AUTHENTICITY
PASS / FAIL
```

---

# 62. RESULTADO FINAL ESPERADO

Ao terminar, a plataforma deverá permanecer em:

```text
FIRST_PAID_CUSTOMER_VALIDATED
REAL_REVENUE_VALIDATED
WAVE_1_CERTIFIED
AUTHORIZED_FOR_WAVE_2_TRIO_CUSTOMERS
```

mas com uma baseline comercial tecnicamente mais robusta.

---

# 63. CRITÉRIO FINAL DE FREEZE

A baseline só poderá ser congelada quando for possível demonstrar:

```text
PAYMENT
≠
SETTLEMENT
≠
RECONCILIATION
```

e:

```text
FTV
=
CUSTOMER ACCEPTED RESULT TIMESTAMP
-
COMMERCIAL ACTIVATION REFERENCE TIMESTAMP
```

e:

```text
GENERAL_AVAILABILITY
=
DYNAMIC SCALE STATE
```

e:

```text
TAX
=
JURISDICTION
+
REGIME
+
RULE VERSION
+
LEGAL TRACEABILITY
```

e:

```text
EVIDENCE TRUST
=
INTEGRITY
+
SOURCE
+
ENVIRONMENT
+
ISSUER
+
VERIFICATION
+
TIMESTAMP
+
OPTIONAL SIGNATURE
```

---

# 64. PRINCÍPIO FINAL

Não reabrir a arquitectura comercial já certificada sem necessidade.

Executar apenas o hardening necessário para garantir que a WAVE 1 fica congelada com:

- precisão financeira;
- semântica correcta das métricas;
- escalabilidade não artificialmente limitada;
- fiscalidade configurável;
- evidências tecnicamente mais fortes.

Depois deste freeze, o desenvolvimento principal deverá avançar para:

# CONTROLLED PAID SCALE, CUSTOMER SUCCESS, RETENTION & EXPANSION ENGINE
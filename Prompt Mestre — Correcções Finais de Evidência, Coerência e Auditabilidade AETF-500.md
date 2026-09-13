# PROMPT MESTRE  
## AETF-500 — Final Evidence, Consistency & Auditability Correction Patch

Actue como uma equipa integrada de:

- arquitecto sénior de SaaS;
- arquitecto de dados e métricas;
- engenheiro financeiro;
- contabilista sénior;
- especialista em fiscalidade angolana;
- auditor de sistemas;
- especialista em billing e revenue operations;
- engenheiro de qualidade;
- especialista em proveniência de dados;
- especialista em controlo interno;
- especialista em documentação técnica e certificação de software.

## 1. OBJECTIVO

Rever o relatório/baseline AETF-500 actualmente fornecido e executar **um último patch restrito de correcção material, evidência, consistência matemática e auditabilidade**.

Este trabalho **NÃO é uma nova fase de arquitectura**.

Não criar:

- novos grandes módulos;
- novos marketplaces;
- novas camadas comerciais;
- novos sistemas paralelos;
- novas funcionalidades sem relação directa com os erros identificados;
- nova arquitectura central.

O objectivo é apenas:

> **corrigir, reconciliar, provar, documentar e testar aquilo que já existe na baseline.**

A arquitectura existente deve permanecer congelada, excepto quando uma alteração mínima for indispensável para corrigir erro factual, matemático, contabilístico, fiscal, semântico ou de rastreabilidade.

---

# 2. PRINCÍPIO CENTRAL

Nenhuma afirmação deve permanecer marcada como:

- `VALIDATED`;
- `CERTIFIED`;
- `PROVEN`;
- `PRODUCTION READY`;
- `LEGALLY VALIDATED`;
- `MATHEMATICALLY VERIFIED`;

se não existir evidência suficiente para suportá-la.

Quando a evidência externa não puder ser obtida, classificar explicitamente como, conforme o caso:

- `UNVERIFIED`;
- `EXTERNAL_VALIDATION_REQUIRED`;
- `LEGAL_VALIDATION_PENDING`;
- `ASSUMPTION`;
- `PROVISIONAL`;
- `NOT PROVEN BY CURRENT EVIDENCE`.

Nunca transformar uma hipótese em facto.

---

# 3. CORRECÇÕES OBRIGATÓRIAS

Executar obrigatoriamente os oito blocos seguintes.

---

## CORRECÇÃO 1 — ARPA, ARPU E LTV

Reconciliar definitivamente todas as definições e fórmulas relacionadas com:

- ARPA;
- ARPU;
- receita por cliente;
- receita por utilizador;
- receita por AI Employee;
- receita por tenant;
- receita por subscrição;
- MRR;
- ARR;
- churn;
- gross margin;
- LTV.

### Exigir:

1. definição formal de cada métrica;
2. entidade económica usada no denominador;
3. periodicidade;
4. fonte dos dados;
5. fórmula;
6. dependências;
7. exemplo calculado;
8. teste automático;
9. tratamento de planos com vários AI Employees;
10. tratamento de várias instâncias do mesmo AI Employee.

Não utilizar ARPA e ARPU como sinónimos.

### LTV

Recalcular o LTV utilizando exclusivamente métricas semanticamente compatíveis.

Por exemplo:

```text
LTV = ARPA × Gross Margin % / Customer Churn Rate
```

somente quando a unidade económica analisada for **account/customer**.

Caso o modelo use utilizador:

```text
LTV_User = ARPU × Gross Margin % / User Churn Rate
```

Não misturar:

```text
ARPA + User Churn
```

ou:

```text
ARPU + Account Churn
```

sem justificação formal.

Criar testes que detectem automaticamente incompatibilidades semânticas.

---

## CORRECÇÃO 2 — CAC: 45.000 → 5.000.000

Investigar e reconciliar a alteração do CAC anteriormente apresentado como aproximadamente:

```text
45.000
```

para:

```text
5.000.000
```

Não aceitar simplesmente o valor novo.

Criar uma trilha completa:

```text
valor anterior
→ fonte anterior
→ premissas anteriores
→ motivo da alteração
→ nova fonte
→ nova fórmula
→ novo universo temporal
→ novo denominador
→ novo valor
→ impacto económico
```

Determinar se os dois números representam:

- CAC por cliente;
- CAC total;
- CAC por canal;
- CAC por período;
- orçamento de aquisição;
- custo de campanha;
- custo por tenant;
- custo de aquisição consolidado;
- ou métricas diferentes incorrectamente chamadas de CAC.

Se `5.000.000` não puder ser comprovado, não o declarar como valor validado.

Criar:

```text
CAC_CHANGE_EVIDENCE
```

com:

- previous_value;
- current_value;
- source;
- calculation;
- reason_for_change;
- approved_by;
- timestamp;
- evidence_id;
- evidence_hash.

---

## CORRECÇÃO 3 — REGRA FISCAL DOS 2%

Rever qualquer afirmação segundo a qual determinada regra fiscal angolana de **2%** está definitivamente validada.

Em especial, verificar referências à:

```text
Lei n.º 19/14
Artigo 67.º
```

ou qualquer outra disposição apresentada como fundamento.

### É obrigatório distinguir:

1. existência histórica da norma;
2. redacção original;
3. alterações posteriores;
4. revogações;
5. regulamentação;
6. vigência actual;
7. âmbito subjectivo;
8. âmbito objectivo;
9. base tributável;
10. taxa aplicável;
11. exclusões;
12. retenção;
13. momento de exigibilidade;
14. entidade responsável;
15. aplicabilidade concreta ao modelo AETF-500.

### Regra crítica

Se não houver acesso a fonte oficial, actualizada e verificável em **12 de Setembro de 2026**, não declarar:

```text
TAX_RULE_2_PERCENT = VALIDATED
```

Utilizar:

```text
TAX_RULE_2_PERCENT = EXTERNAL_LEGAL_VALIDATION_REQUIRED
```

ou estado equivalente.

### Hierarquia de evidência pretendida

Priorizar:

1. Diário da República;
2. legislação oficial consolidada;
3. AGT;
4. Ministério das Finanças;
5. outra fonte pública oficial competente.

Fontes secundárias podem complementar, mas não substituir a base legal primária.

Criar estrutura:

```yaml
tax_rule:
  jurisdiction: AO
  tax_type:
  legal_instrument:
  article:
  version_date:
  effective_from:
  effective_to:
  current_status:
  rate:
  taxable_base:
  taxpayer_scope:
  transaction_scope:
  exceptions:
  source_url:
  official_source:
  retrieved_at:
  evidence_hash:
  validation_status:
```

Nenhuma regra fiscal deve ser hardcoded sem versionamento.

---

## CORRECÇÃO 4 — EVENTO DE RENOVAÇÃO

Reconciliar integralmente o conceito de renovação de subscrição.

Determinar exactamente qual evento representa uma renovação efectiva.

Distinguir:

```text
subscription_renewal_due
subscription_renewal_attempted
payment_authorized
payment_captured
invoice_paid
subscription_renewed
renewal_failed
subscription_grace_period_started
subscription_suspended
subscription_cancelled
```

Não considerar renovação concluída apenas porque chegou a data de renovação.

### Definição económica recomendada

Uma renovação só deve produzir reconhecimento comercial confirmado quando os critérios configurados forem satisfeitos.

Por exemplo:

```text
payment_captured
+
invoice_paid
+
subscription_period_extended
```

ou regra equivalente formalmente definida.

Documentar:

- evento;
- trigger;
- pré-condições;
- postconditions;
- idempotência;
- retry;
- rollback;
- falha de pagamento;
- grace period;
- revenue consequences;
- audit evidence.

Criar testes para impedir dupla renovação e dupla cobrança.

---

## CORRECÇÃO 5 — ACCOUNTING FRAMEWORK E BANKING SEMANTICS

Demonstrar explicitamente qual framework contabilístico suporta os eventos financeiros do sistema.

Não escrever simplesmente que o sistema é "accounting compliant".

Separar:

```text
commercial event
billing event
payment event
cash movement
accounting event
tax event
```

### Exemplos

Uma factura emitida não é automaticamente:

```text
cash received
```

Um pagamento iniciado não é automaticamente:

```text
payment settled
```

Uma autorização bancária não é automaticamente:

```text
cash available
```

### Criar semântica para:

```text
payment_initiated
payment_authorized
payment_pending
payment_captured
payment_settled
payment_failed
payment_reversed
refund_requested
refund_completed
chargeback_opened
chargeback_won
chargeback_lost
```

Associar cada evento a:

- efeito no billing;
- efeito na tesouraria;
- efeito contabilístico;
- efeito fiscal;
- estado da subscrição.

### Accounting mapping

Quando aplicável, representar:

```text
Debit Account
Credit Account
Currency
Amount
Accounting Date
Document ID
Customer
Invoice
Payment ID
Tax Component
Cost Center
AI Employee / Product
Tenant
Evidence ID
```

Distinguir expressamente:

```text
accrual basis
```

e:

```text
cash basis
```

quando relevante.

Não presumir automaticamente IFRS, PGCA, IFRS for SMEs ou outro framework.

Indicar explicitamente qual referencial é:

- assumido;
- configurável;
- validado;
- ou ainda dependente de confirmação.

---

## CORRECÇÃO 6 — DAG MATEMÁTICO

Completar o DAG de dependências matemáticas das métricas.

O sistema deve demonstrar, no mínimo, relações como:

```text
Raw Events
   ↓
Usage
   ↓
Billable Usage
   ↓
Invoice
   ↓
Revenue
   ↓
MRR
   ↓
ARR
```

e:

```text
Marketing Spend
+
Sales Spend
   ↓
Acquisition Cost
   ↓
CAC
```

e:

```text
MRR
+
Customer Count
   ↓
ARPA
```

e:

```text
ARPA
+
Gross Margin
+
Churn
   ↓
LTV
```

e:

```text
LTV
+
CAC
   ↓
LTV:CAC
```

Cada nó deve possuir:

```yaml
metric_id:
definition:
formula:
input_metrics:
source_tables:
source_fields:
period:
unit:
currency:
aggregation:
owner:
validation_rule:
test_id:
evidence_id:
version:
```

Impedir ciclos matemáticos indevidos.

Criar:

```text
METRIC_DEPENDENCY_DAG_VALIDATION
```

para verificar:

- dependências inexistentes;
- circularidade;
- unidades incompatíveis;
- períodos incompatíveis;
- denominadores incompatíveis;
- moedas incompatíveis;
- versões incompatíveis.

---

## CORRECÇÃO 7 — HASHES INTEGRAIS DO MANIFESTO

Publicar os hashes completos dos artefactos que integram a baseline.

Não usar apenas:

```text
abc123...
```

Utilizar o hash integral.

Preferencialmente:

```text
SHA-256
```

Criar manifesto:

```yaml
baseline_id:
generated_at:
hash_algorithm: SHA-256

artifacts:
  - artifact_id:
    path:
    version:
    size_bytes:
    sha256:
    created_at:
    evidence_type:
```

O próprio manifesto deve possuir hash.

Exemplo:

```text
MANIFEST_SHA256
```

Criar procedimento de verificação:

```text
current hash == frozen manifest hash
```

Se diferente:

```text
BASELINE_INTEGRITY_FAILURE
```

Não permitir alteração silenciosa de ficheiros congelados.

---

## CORRECÇÃO 8 — REQUIREMENT → TEST → EVIDENCE

Criar matriz integral de rastreabilidade:

```text
Requirement
    ↓
Control
    ↓
Implementation
    ↓
Test
    ↓
Test Result
    ↓
Evidence
    ↓
Certification Status
```

### Estrutura mínima

| Requirement ID | Requirement | Risk | Control | Implementation | Test ID | Expected Result | Actual Result | Evidence ID | Status |
|---|---|---|---|---|---|---|---|---|---|

Todos os requisitos materiais devem possuir pelo menos:

```text
Requirement ID
Test ID
Evidence ID
```

### Estados permitidos

Usar estados inequívocos:

```text
PASS
FAIL
PARTIAL
NOT_TESTED
BLOCKED
EXTERNAL_VALIDATION_REQUIRED
NOT_APPLICABLE
```

Não usar `PASS` quando a evidência não existe.

---

# 4. EVIDENCE REGISTRY

Consolidar todas as evidências num registo central.

Estrutura:

```yaml
evidence_id:
evidence_type:
requirement_id:
test_id:
source:
source_type:
created_at:
retrieved_at:
valid_from:
valid_to:
jurisdiction:
version:
artifact:
sha256:
validation_status:
reviewer:
notes:
```

Criar categorias, no mínimo:

```text
EVIDENCE_INTERNAL
EVIDENCE_EXTERNAL
EVIDENCE_LEGAL
EVIDENCE_FINANCIAL
EVIDENCE_ACCOUNTING
EVIDENCE_BANKING
EVIDENCE_TEST
EVIDENCE_CONFIGURATION
EVIDENCE_RUNTIME
```

---

# 5. SOURCE OF TRUTH

Para cada métrica crítica identificar explicitamente:

```text
AUTHORITATIVE_SOURCE
```

Exemplo:

| Informação | Source of Truth |
|---|---|
| Customer | Customer DB |
| Subscription | Subscription Ledger |
| Invoice | Billing Ledger |
| Payment | Payment Ledger / PSP |
| Revenue | Revenue Ledger |
| Tax Rule | Legal Rules Registry |
| Usage | Usage Metering Ledger |
| CAC | Finance/Acquisition Dataset |
| MRR | Metrics Engine |
| Evidence | Evidence Registry |

Evitar múltiplas fontes concorrentes sem uma regra clara de precedência.

---

# 6. CORRECÇÕES AUTOMÁTICAS

Corrigir directamente quando houver evidência suficiente.

Para cada correcção apresentar:

```text
BEFORE
AFTER
REASON
EVIDENCE
IMPACT
TEST
```

---

# 7. NÃO INVENTAR EVIDÊNCIA

É expressamente proibido:

- inventar URLs;
- inventar números de leis;
- inventar artigos;
- inventar resultados de testes;
- inventar hashes;
- inventar valores contabilísticos;
- inventar logs;
- inventar transacções bancárias;
- inventar dados de produção;
- declarar pesquisa externa realizada quando não foi realizada.

Quando algo não puder ser confirmado:

```text
NOT VERIFIED
```

é uma resposta válida e preferível a uma falsa certificação.

---

# 8. TESTES OBRIGATÓRIOS

Executar ou especificar testes para, no mínimo:

```text
TEST_ARPA_DEFINITION
TEST_ARPU_DEFINITION
TEST_LTV_FORMULA
TEST_LTV_SEMANTIC_COMPATIBILITY
TEST_CAC_PROVENANCE
TEST_CAC_CHANGE_45000_TO_5000000
TEST_TAX_RULE_VERSION
TEST_TAX_RULE_EFFECTIVE_DATE
TEST_RENEWAL_EVENT
TEST_RENEWAL_IDEMPOTENCY
TEST_DOUBLE_CHARGE_PREVENTION
TEST_BANKING_STATE_MACHINE
TEST_ACCOUNTING_EVENT_MAPPING
TEST_METRIC_DAG
TEST_METRIC_CIRCULAR_DEPENDENCY
TEST_MANIFEST_HASH
TEST_BASELINE_INTEGRITY
TEST_REQUIREMENT_TRACEABILITY
TEST_EVIDENCE_COMPLETENESS
```

---

# 9. NOVA CLASSIFICAÇÃO DE CONFIANÇA

Para cada área crítica atribuir:

```text
VERIFIED
PARTIALLY_VERIFIED
INTERNALLY_VERIFIED
EXTERNALLY_VERIFIED
UNVERIFIED
BLOCKED
```

Não confundir:

```text
internally verified
```

com:

```text
externally validated
```

---

# 10. OUTPUT OBRIGATÓRIO

Produzir um relatório denominado:

# AETF-500 Final Evidence & Consistency Correction Report

Estrutura mínima:

## 1. Executive Summary

Indicar:

- erros encontrados;
- erros corrigidos;
- afirmações rebaixadas por falta de prova;
- riscos restantes;
- impacto sobre a baseline.

## 2. Material Corrections Register

Tabela:

| ID | Área | Problema | Antes | Depois | Evidência | Impacto | Estado |
|---|---|---|---|---|---|---|---|

## 3. ARPA/ARPU/LTV Reconciliation

## 4. CAC Provenance Reconciliation

## 5. Angola Tax Rule Validation

## 6. Subscription Renewal Reconciliation

## 7. Accounting & Banking Semantics

## 8. Mathematical Dependency DAG

## 9. Cryptographic Manifest

## 10. Requirement → Test → Evidence Matrix

## 11. Evidence Registry

## 12. Residual Risks

## 13. Open External Validations

## 14. Certification Impact

## 15. Final Baseline Decision

---

# 11. DECISÃO FINAL

No final emitir exactamente uma das seguintes decisões:

```text
BASELINE_CONFIRMED
```

quando todas as correcções materiais estiverem concluídas e suficientemente comprovadas;

```text
BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING
```

quando a arquitectura e implementação forem sólidas, mas determinadas confirmações externas, legais, bancárias ou fiscais ainda estiverem pendentes;

```text
BASELINE_REQUIRES_MATERIAL_CORRECTION
```

quando persistirem erros materiais;

ou:

```text
BASELINE_NOT_CERTIFIABLE
```

quando a evidência disponível não permitir sustentar as afirmações de certificação.

---

# 12. REGRA DE CONGELAMENTO

Se o resultado for:

```text
BASELINE_CONFIRMED
```

ou:

```text
BASELINE_CONFIRMED_WITH_EXTERNAL_VALIDATIONS_PENDING
```

não propor novos módulos no mesmo trabalho.

Gerar apenas:

```text
FINAL_CORRECTION_PATCH
EVIDENCE_MANIFEST
TRACEABILITY_MATRIX
RESIDUAL_VALIDATION_REGISTER
BASELINE_HASH
```

e considerar encerrado o trabalho de correcção estrutural.

A partir daí, quaisquer novos desenvolvimentos devem ser tratados como:

```text
POST_BASELINE DEVELOPMENT
```

e não como alteração retroactiva da baseline.

---

# 13. RESTRIÇÃO ESPECIAL SOBRE A REGRA FISCAL DOS 2%

Caso não seja possível realizar pesquisa externa actualizada ou consultar legislação oficial vigente em Angola em **12 de Setembro de 2026**, incluir expressamente no relatório:

> A arquitectura da regra fiscal encontra-se implementada e versionável, mas a vigência, redacção actual e aplicabilidade jurídica da regra dos 2% não foram externamente confirmadas nesta execução. Consequentemente, a regra permanece classificada como `EXTERNAL_LEGAL_VALIDATION_REQUIRED` e não constitui uma afirmação fiscal definitivamente validada.

Esta limitação não deve, isoladamente, invalidar toda a arquitectura da plataforma.

Deve impedir apenas a classificação da regra fiscal específica como:

```text
LEGALLY_VALIDATED
```

até existir evidência oficial suficiente.

---

# 14. CRITÉRIO DE CONCLUSÃO

O trabalho só está concluído quando for possível responder, com evidência, às seguintes perguntas:

1. ARPA e ARPU estão semanticamente separados?
2. O LTV foi recalculado correctamente?
3. A alteração do CAC de 45.000 para 5.000.000 está documentalmente explicada?
4. A regra fiscal dos 2% possui base legal actual comprovada ou foi correctamente rebaixada para validação externa?
5. Existe um único significado inequívoco de renovação?
6. Pagamento, liquidação, receita, caixa e contabilização estão semanticamente separados?
7. Todas as métricas críticas possuem um DAG matemático rastreável?
8. Todos os artefactos congelados possuem hashes integrais verificáveis?
9. Cada requisito material possui teste?
10. Cada teste material possui evidência?
11. Todas as afirmações de certificação são proporcionais à evidência existente?
12. É possível reproduzir o resultado da certificação a partir da baseline congelada?

Se qualquer resposta for **não**, indicar exactamente o bloqueio e não declarar conclusão integral.

---

## ORDEM FINAL

Analise a baseline fornecida.

Corrija apenas os problemas materiais identificados.

Preserve o máximo possível da arquitectura existente.

Não faça uma reescrita cosmética do relatório.

Não aumente artificialmente o escopo.

Não invente evidências.

Recalcule todas as métricas afectadas por alterações.

Actualize todas as referências dependentes.

Gere testes, evidências e rastreabilidade.

No final, apresente claramente:

```text
WHAT WAS WRONG
WHAT WAS CORRECTED
WHAT WAS PROVEN
WHAT REMAINS UNPROVEN
WHAT CHANGED IN THE BASELINE
FINAL BASELINE STATUS
```

O objectivo final não é produzir um relatório aparentemente perfeito.

O objectivo é produzir uma baseline **matematicamente coerente, contabilisticamente defensável, tecnicamente reproduzível, fiscalmente prudente, criptograficamente verificável e auditável de ponta a ponta**.
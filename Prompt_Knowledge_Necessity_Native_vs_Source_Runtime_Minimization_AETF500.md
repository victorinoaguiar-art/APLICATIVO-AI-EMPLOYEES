# PROMPT MESTRE DE IMPLEMENTAÇÃO
## Knowledge Necessity, Native-vs-Source Decision & Runtime Knowledge Minimization Engine
### AETF-500 — Decidir se o conhecimento carregado deve realmente ser enviado ao modelo durante cada tarefa

---

# 0. OBJECTIVO

Implementar na plataforma AETF-500 uma camada obrigatória entre o **Knowledge Center** e o **AI Employee Runtime** para responder, antes de cada execução:

> **“Este conhecimento deve realmente ser enviado ao modelo durante esta tarefa?”**

O sistema não deve injectar automaticamente no prompt, contexto ou RAG todo o conhecimento carregado.

A plataforma deve decidir, de forma explícita, auditável e por tarefa:

- se o modelo nativo já domina suficientemente a competência;
- se a fonte é apenas suplementar;
- se existe uma lacuna real que justifica reforço;
- se a fonte é obrigatória por criticidade;
- se o conhecimento é específico do cliente;
- se o conteúdo é duplicado;
- se é contraditório;
- se está desactualizado;
- se é irrelevante para aquela tarefa;
- se é necessário para aquele provider/model específico;
- qual subconjunto mínimo de Knowledge Objects deve ser recuperado;
- se o uso do conhecimento externo pode ser omitido para reduzir custo, latência e ruído.

Formalizar:

```text
UPLOAD ≠ AUTOMATIC RUNTIME INJECTION
```

e:

```text
PUBLISHED ≠ REQUIRED_AT_RUNTIME
```

---

# 1. COMPONENTE PRINCIPAL

Criar ou consolidar:

```text
KnowledgeNecessityEngine
```

também referenciado como:

```text
KNE
```

Responsabilidade:

```text
TASK
↓
REQUIRED COMPETENCIES
↓
SELECTED PROVIDER + MODEL
↓
MNCA BASELINE
↓
SOURCE CRITICALITY
↓
CLIENT-SPECIFIC REQUIREMENT
↓
KNOWLEDGE NOVELTY / OVERLAP / CONFLICT
↓
KNOWLEDGE NECESSITY DECISION
↓
MINIMAL KNOWLEDGE RETRIEVAL
↓
MODEL RUNTIME
```

---

# 2. PRINCÍPIO FUNDAMENTAL

Antes de qualquer retrieval ou injecção de conhecimento externo:

```text
evaluateKnowledgeNecessity()
```

Nenhum Knowledge Object deve ser enviado ao modelo apenas porque:

```text
source.status = PUBLISHED
```

---

# 3. DECISÕES OFICIAIS

Implementar pelo menos:

```text
NATIVE_SUFFICIENT
SUPPLEMENTARY
REINFORCEMENT_REQUIRED
SOURCE_REQUIRED
CLIENT_SOURCE_REQUIRED
DUPLICATE_KNOWLEDGE
CONFLICTING_KNOWLEDGE
OUTDATED_KNOWLEDGE
IRRELEVANT_FOR_TASK
UNSUPPORTED
```

---

# 4. SIGNIFICADO DAS DECISÕES

## NATIVE_SUFFICIENT

```text
native capability is sufficient
source criticality is low/medium
no client-specific requirement
no mandatory source requirement
```

Resultado:

```text
runtime_required = false
```

---

## SUPPLEMENTARY

Conhecimento útil, mas não obrigatório.

Resultado:

```text
runtime_required = false by default
runtime_optional = true
```

Pode ser usado apenas se:

```text
task complexity
user request
quality policy
```

justificar.

---

## REINFORCEMENT_REQUIRED

Existe lacuna real no modelo.

Resultado:

```text
runtime_required = true
```

Recuperar apenas os Knowledge Objects que resolvem a lacuna.

---

## SOURCE_REQUIRED

Mesmo que o modelo nativo saiba responder, a tarefa exige grounding verificável.

Exemplos:

```text
tax
law
regulation
BNA
MINSA
current standards
```

Resultado:

```text
runtime_required = true
verified_source_required = true
```

---

## CLIENT_SOURCE_REQUIRED

Conhecimento específico da empresa.

Exemplos:

```text
MARVINE procedure
client template
internal policy
approval rule
pricing
```

Resultado:

```text
runtime_required = true
tenant_match_required = true
```

---

## DUPLICATE_KNOWLEDGE

Conteúdo redundante.

Resultado:

```text
runtime_required = false
```

---

## CONFLICTING_KNOWLEDGE

Conhecimento contraditório.

Resultado:

```text
runtime_blocked = true
review_required = true
```

---

## OUTDATED_KNOWLEDGE

Fonte desactualizada ou substituída.

Resultado:

```text
runtime_required = false
runtime_blocked = true
```

quando fonte actual for obrigatória.

---

## IRRELEVANT_FOR_TASK

Fonte válida, mas não relacionada com a tarefa actual.

Resultado:

```text
runtime_required = false
```

---

# 5. KNOWLEDGE REQUIREMENT DECISION RECORD

Criar:

```text
KNOWLEDGE_REQUIREMENT_DECISION
```

Campos mínimos:

```text
decision_id

task_id
task_type_id

employee_instance_id
catalog_employee_id

company_id
tenant_id

competency_id
subcompetency_id

provider
model_id
model_version
model_configuration
capability_baseline_id

native_score
native_critical_failures
native_confidence

source_id
knowledge_object_id

source_criticality
source_authority
client_specific
jurisdiction_sensitive

knowledge_novelty_score
knowledge_overlap_score
knowledge_conflict_score
knowledge_freshness_status

decision

runtime_required
runtime_optional
runtime_blocked

reason
policy_rule_id

evaluated_at
```

---

# 6. DECISÃO POR PROVIDER / MODEL

Nunca assumir que a mesma fonte tem a mesma necessidade para:

```text
OpenAI
Gemini
Claude
```

Avaliar por:

```text
provider
model
configuration
```

Exemplo:

```text
PRIMAVERA_IMPORT

OpenAI / Model A:
91%
→ SUPPLEMENTARY

Gemini / Model B:
84%
→ REINFORCEMENT_REQUIRED

Claude / Model C:
72%
→ REINFORCEMENT_REQUIRED
```

---

# 7. INTEGRAÇÃO COM MNCA-500

Ler do MNCA:

```text
model_native_score
critical_failures
competency_status
knowledge_mode
model_baseline_id
test_evidence
```

Não perguntar ao modelo:

```text
"Do you know this?"
```

Usar apenas evidência de testes reais.

---

# 8. PROVA DE CAPACIDADE NATIVA

Uma decisão:

```text
NATIVE_SUFFICIENT
```

só pode usar baseline válido quando:

```text
REAL_API execution
real model
real provider
matching model configuration
valid test evidence
```

Se não houver baseline confiável:

```text
native_capability_status = UNKNOWN
```

e nunca presumir suficiência.

---

# 9. REGRA DE SOURCE CRITICALITY

Se:

```text
source_criticality = HIGH
```

ou:

```text
CRITICAL
```

a decisão nativa não pode eliminar a fonte obrigatória quando a task policy exige grounding.

Exemplo:

```text
native_score = 97%
source_criticality = CRITICAL
```

Resultado:

```text
SOURCE_REQUIRED
```

---

# 10. CLIENT KNOWLEDGE RULE

Se a tarefa depende de:

```text
client policy
internal procedure
client-specific template
private pricing
company-specific approval rule
```

resultado:

```text
CLIENT_SOURCE_REQUIRED
```

mesmo que o modelo domine genericamente o tema.

---

# 11. KNOWLEDGE NOVELTY ENGINE

Criar:

```text
KnowledgeNoveltyEngine
```

Objectivo:

Medir quanto do conteúdo carregado acrescenta informação realmente útil face a:

```text
model native capability
existing knowledge library
existing sources
```

---

# 12. NOVELTY OUTPUT

Calcular:

```text
knowledge_novelty_score
knowledge_overlap_score
knowledge_conflict_score
```

Escala sugerida:

```text
0..100
```

---

# 13. INTERPRETAÇÃO DA NOVELTY

Exemplo:

```text
Native Coverage: 94%
New Relevant Knowledge: 6%
Overlap: 91%
```

Resultado provável:

```text
SUPPLEMENTARY
```

Outro:

```text
Native Coverage: 68%
New Relevant Knowledge: 32%
Overlap: 44%
```

Resultado:

```text
REINFORCEMENT_REQUIRED
```

---

# 14. DUPLICATE DETECTION

Integrar com:

```text
hash
semantic similarity
source metadata
version
```

Se duplicado:

```text
DUPLICATE_KNOWLEDGE
```

---

# 15. CONFLICT DETECTION

Se duas fontes válidas contradizem-se:

```text
CONFLICTING_KNOWLEDGE
```

Não escolher silenciosamente.

---

# 16. FRESHNESS CHECK

Antes do runtime:

```text
CURRENT
REVIEW_REQUIRED
OUTDATED
SUPERSEDED
UNKNOWN
```

---

# 17. KNOWLEDGE RUNTIME MINIMIZATION

Criar:

```text
RuntimeKnowledgeMinimizer
```

Objectivo:

Enviar ao modelo apenas o menor conjunto de conhecimento necessário.

---

# 18. PRINCÍPIO DE MINIMIZAÇÃO

Adoptar:

```text
MINIMUM NECESSARY KNOWLEDGE
```

Não:

```text
ALL AVAILABLE KNOWLEDGE
```

---

# 19. FLUXO DE RETRIEVAL

```text
TASK
↓
Required Competencies
↓
Required Subcompetencies
↓
Knowledge Necessity Decisions
↓
Only runtime_required = true
↓
Relevant Knowledge Objects
↓
Relevant Chunks
↓
Rank
↓
Deduplicate
↓
Inject Minimal Context
```

---

# 20. NÃO ENVIAR PDF INTEIRO

Evitar:

```text
full document injection
```

quando apenas uma secção é necessária.

Usar:

```text
relevant chunks
```

---

# 21. RUNTIME KNOWLEDGE BUDGET

Criar:

```text
knowledge_token_budget
```

por tarefa/modelo.

---

# 22. BUDGET POLICY

Exemplo:

```text
LOW risk:
small budget

MEDIUM:
moderate budget

HIGH / SOURCE CRITICAL:
larger budget if required
```

---

# 23. NO COST-ONLY OVERRIDE

Nunca remover fonte obrigatória apenas para poupar tokens.

---

# 24. STATIC VS DYNAMIC CONTEXT

Separar:

```text
STATIC_CONTEXT
```

de:

```text
DYNAMIC_KNOWLEDGE
```

---

# 25. KNOWLEDGE SELECTION BY TASK

Exemplo:

```text
TASK:
Create Business Letter
```

Pode resultar:

```text
Business Writing:
NATIVE_SUFFICIENT

MARVINE Template:
CLIENT_SOURCE_REQUIRED
```

Enviar apenas:

```text
MARVINE Template
```

---

# 26. EXEMPLO — REDACÇÃO EMPRESARIAL

Fonte:

```text
Manual de Redacção Empresarial
```

MNCA:

```text
native_score = 96%
critical_failures = 0
criticality = LOW
```

Resultado:

```text
NATIVE_SUFFICIENT
runtime_required = false
```

---

# 27. EXEMPLO — PRIMAVERA V10

Fonte:

```text
Manual Primavera v10
```

MNCA:

```text
ERP Concepts = 96%
Accounting = 94%
Importação v10 = 61%
Error Handling v10 = 54%
Interface v10 = 48%
```

Resultado:

```text
REINFORCEMENT_REQUIRED
```

Mas apenas para:

```text
Importação
Error Handling
Interface v10
```

---

# 28. EXEMPLO — FISCALIDADE ANGOLA

MNCA:

```text
native_score = 95%
```

Mas:

```text
source_criticality = CRITICAL
```

Resultado:

```text
SOURCE_REQUIRED
```

---

# 29. EXEMPLO — POLÍTICA MARVINE

Fonte:

```text
Payment Approval Policy
```

Resultado:

```text
CLIENT_SOURCE_REQUIRED
```

porque o modelo não pode conhecer nativamente uma política privada.

---

# 30. SOURCE USAGE POLICY

Criar por source:

```text
runtime_usage_policy
```

Valores:

```text
NEVER
OPTIONAL
REQUIRED_WHEN_MATCHED
ALWAYS_FOR_TASK_TYPE
CLIENT_ONLY
SOURCE_CRITICAL_ONLY
```

---

# 31. KNOWLEDGE USAGE PRIORITY

Criar:

```text
runtime_priority
```

Valores:

```text
LOW
MEDIUM
HIGH
MANDATORY
```

---

# 32. RUNTIME GATE

Antes da chamada ao modelo:

```text
KnowledgeRuntimeGate
```

Verificar:

```text
decision exists
source published
source current
source authorized
tenant valid
runtime_required
```

---

# 33. SOURCE REQUIRED GATE

Se:

```text
decision = SOURCE_REQUIRED
```

e nenhuma fonte válida encontrada:

```text
TASK_BLOCKED_MISSING_SOURCE
```

---

# 34. CLIENT SOURCE REQUIRED GATE

Se:

```text
CLIENT_SOURCE_REQUIRED
```

e tenant source ausente:

```text
TASK_BLOCKED_CLIENT_SOURCE_MISSING
```

---

# 35. CONFLICT GATE

Se:

```text
CONFLICTING_KNOWLEDGE
```

resultado:

```text
TASK_BLOCKED_KNOWLEDGE_CONFLICT
```

ou:

```text
TASK_ALLOWED_WITH_HUMAN_REVIEW
```

conforme política.

---

# 36. OUTDATED SOURCE GATE

Se fonte necessária estiver:

```text
OUTDATED
```

resultado:

```text
TASK_BLOCKED_OUTDATED_SOURCE
```

---

# 37. KNOWLEDGE SELECTION RECEIPT

Cada execução deve gerar:

```text
KNOWLEDGE_SELECTION_RECEIPT
```

Campos:

```text
task_id
execution_id
provider
model_id

required_competencies

evaluated_sources

selected_sources
excluded_sources

selected_knowledge_objects
selected_chunks

decision_reasons

knowledge_tokens_injected

created_at
```

---

# 38. AUDITAR TAMBÉM O QUE NÃO FOI USADO

Guardar:

```text
excluded_source_id
exclusion_reason
```

Exemplos:

```text
NATIVE_SUFFICIENT
DUPLICATE
OUTDATED
IRRELEVANT
WRONG_TENANT
CONFLICT
```

---

# 39. FRONTEND — SOURCE DETAIL

Mostrar:

```text
Runtime Necessity
```

Exemplo:

```text
OpenAI Model A:
SUPPLEMENTARY

Gemini Model B:
REINFORCEMENT_REQUIRED

Claude Model C:
NATIVE_SUFFICIENT
```

---

# 40. FRONTEND — TASK EVIDENCE

Dentro da task:

```text
Knowledge Decision
```

Mostrar:

```text
Required Sources
Optional Sources
Excluded Sources
Reason
```

---

# 41. FRONTEND — EMPLOYEE VIEW

Mostrar:

```text
Native Capability
Required External Knowledge
Optional Knowledge
Client Knowledge
Source-Critical Knowledge
```

---

# 42. FRONTEND — KNOWLEDGE CENTER

Adicionar colunas:

```text
Native Overlap
Novelty
Runtime Requirement
Provider/Model
```

---

# 43. FRONTEND — UPLOAD RESULT

Depois do upload, apresentar:

```text
Knowledge Analysis
```

Exemplo:

```text
Competencies Detected: 4
Native Coverage: 94%
New Relevant Knowledge: 6%
Employees Affected: 183
Runtime Requirement: OPTIONAL
Recommendation: SUPPLEMENTARY
```

---

# 44. FRONTEND — PROVIDER MATRIX

Mostrar:

| Competency | OpenAI | Gemini | Claude |
|---|---|---|---|
| Business Writing | Native | Native | Native |
| Primavera Import | Optional | Required | Required |
| Angola Tax | Source Required | Source Required | Source Required |

---

# 45. AUTO-DECISION

Permitir decisão automática para:

```text
LOW risk
MEDIUM risk
```

quando política permitir.

---

# 46. HUMAN REVIEW

Exigir revisão quando:

```text
source criticality = HIGH/CRITICAL
conflict detected
novelty uncertain
client policy sensitive
mapping confidence low
```

---

# 47. MAPPING CONFIDENCE

Guardar:

```text
competency_mapping_confidence
```

Se baixo:

```text
REVIEW_REQUIRED
```

---

# 48. SUBCOMPETENCY SUPPORT

Não decidir apenas por competência macro.

Exemplo:

```text
Primavera v10
```

deve decompor em:

```text
Importação
Configuração
Errors
SAF-T
Interface
Reconciliation
```

---

# 49. DECISION GRANULARITY

Preferir:

```text
Employee
× Competency
× Subcompetency
× Task Type
× Provider
× Model
```

---

# 50. KNOWLEDGE REQUIREMENT CACHE

Pode guardar decisões estáveis em:

```text
KNOWLEDGE_REQUIREMENT_CACHE
```

---

# 51. CACHE INVALIDATION

Invalidar quando:

```text
model changes
model version changes
MNCA baseline changes
source version changes
task policy changes
source criticality changes
client policy changes
```

---

# 52. MODEL CHANGE

Se model binding muda:

```text
re-evaluate knowledge necessity
```

---

# 53. PROVIDER FAILOVER

Se runtime muda de:

```text
OpenAI
```

para:

```text
Claude
```

por fallback, recalcular a necessidade de conhecimento.

---

# 54. NO SILENT FAILOVER KNOWLEDGE ASSUMPTION

Nunca reutilizar cegamente a decisão do provider original no fallback.

---

# 55. RETEST AFTER REINFORCEMENT

Integrar:

```text
BEFORE
↓
KNOWLEDGE
↓
AFTER
```

---

# 56. REINFORCEMENT EFFECTIVENESS

Guardar:

```text
before_score
after_score
delta
```

---

# 57. IF REINFORCEMENT INEFFECTIVE

Resultado:

```text
REINFORCEMENT_INSUFFICIENT
```

---

# 58. MODEL CAPABILITY GAP

Se source correcto e ganho insuficiente:

```text
MODEL_CAPABILITY_GAP
```

---

# 59. ROUTER FEEDBACK

Pode recomendar:

```text
different model
different provider
human supervision
task block
```

---

# 60. KNOWLEDGE DUPLICATION CONTROL

Se duas sources resolvem exactamente a mesma lacuna:

```text
prefer authoritative/current source
```

---

# 61. SOURCE RANKING

Criar ranking por:

```text
authority
freshness
specificity
tenant relevance
task relevance
```

---

# 62. NO LOW-AUTHORITY OVERRIDE

Fonte fraca não pode substituir fonte oficial quando source-critical.

---

# 63. KNOWLEDGE CONFLICT RESOLUTION

Ordem sugerida, quando legalmente apropriado:

```text
official current source
> official previous
> client procedure
> vendor documentation
> internal authored
> public reference
```

Não usar esta ordem para permitir política interna contrariar norma legal.

---

# 64. KNOWLEDGE TOKEN ACCOUNTING

Guardar:

```text
knowledge_tokens_selected
knowledge_tokens_injected
```

---

# 65. COST METRICS

Calcular:

```text
knowledge_context_cost
```

por task/provider/model.

---

# 66. COST OPTIMIZATION

Mostrar:

```text
tokens saved by native sufficiency
```

e:

```text
tokens added by required grounding
```

---

# 67. QUALITY METRIC

Medir se minimizar conhecimento:

```text
maintains quality
```

---

# 68. NO OVER-MINIMIZATION

Se qualidade cair após retirada de conhecimento:

```text
reinstate required context
```

---

# 69. KNOWLEDGE AB TEST

Opcionalmente testar:

```text
native only
vs
native + curated
```

em ambiente controlado.

---

# 70. AB TEST RESTRICTION

Nunca fazer A/B sem fonte obrigatória em task source-critical.

---

# 71. SOURCE USAGE LEARNING

Registar:

```text
source actually improved result
```

quando mensurável.

---

# 72. KNOWLEDGE UTILITY SCORE

Criar:

```text
knowledge_utility_score
```

baseado em:

```text
quality gain
task success
rework reduction
error reduction
cost
```

---

# 73. SOURCE RETIREMENT CANDIDATE

Se source:

```text
never used
fully duplicate
outdated
low utility
```

marcar:

```text
RETIREMENT_CANDIDATE
```

não apagar automaticamente.

---

# 74. ANALYTICS

Dashboard:

```text
Native-Sufficient Tasks
Tasks Using Reinforcement
Source-Critical Tasks
Client-Source Tasks
Knowledge Tokens Saved
Knowledge Tokens Injected
Duplicate Sources Avoided
Conflicts Detected
```

---

# 75. MNCA DASHBOARD INTEGRATION

Adicionar:

```text
Knowledge Requirement by Model
```

---

# 76. KNOWLEDGE CENTER DASHBOARD

Adicionar:

```text
Sources Not Required at Runtime
Sources Required by Model
Sources Required by Regulation
Sources Required by Client
```

---

# 77. SOURCE DETAIL EXAMPLE

```text
Source:
Manual Primavera v10

OpenAI Model A:
REINFORCEMENT_REQUIRED for Importação
SUPPLEMENTARY for ERP Concepts

Gemini Model B:
REINFORCEMENT_REQUIRED for Importação

Claude Model C:
REINFORCEMENT_REQUIRED for Importação and Error Handling
```

---

# 78. TASK EXAMPLE — BUSINESS LETTER

```text
Task:
Create Business Letter

Business Writing:
NATIVE_SUFFICIENT

Client Template:
CLIENT_SOURCE_REQUIRED

Runtime Context:
Client Template only
```

---

# 79. TASK EXAMPLE — AGT LETTER

```text
Task:
AGT Letter

Business Writing:
NATIVE_SUFFICIENT

Angola Tax:
SOURCE_REQUIRED

MARVINE Letter Template:
CLIENT_SOURCE_REQUIRED
```

Runtime:

```text
Native Writing
+
Verified Tax Source
+
MARVINE Template
```

---

# 80. TASK EXAMPLE — BANK RECONCILIATION

```text
Accounting:
NATIVE_SUFFICIENT

Bank Reconciliation Procedure:
SUPPLEMENTARY / REQUIRED by policy

Client Chart of Accounts:
CLIENT_SOURCE_REQUIRED
```

---

# 81. TASK EXAMPLE — PRIMAVERA

```text
ERP Concepts:
NATIVE_SUFFICIENT

Import Procedure:
REINFORCEMENT_REQUIRED

MARVINE Mapping:
CLIENT_SOURCE_REQUIRED
```

---

# 82. BACKEND SERVICES

Criar ou consolidar:

```text
KnowledgeNecessityService
KnowledgeNoveltyService
KnowledgeOverlapService
KnowledgeConflictService
RuntimeKnowledgeMinimizer
KnowledgeSelectionReceiptService
```

---

# 83. API / SERVICE CONTRACT

Método principal:

```text
evaluateTaskKnowledgeRequirements(taskId, employeeInstanceId, provider, modelId)
```

Retorno:

```text
decisions[]
selectedKnowledgeObjects[]
excludedKnowledgeObjects[]
tokenBudget
blockReason
```

---

# 84. RUNTIME INTEGRATION

No `AIEmployeeRuntimeEngine`:

```text
loadTask()
loadEmployee()
selectModel()
evaluateTaskKnowledgeRequirements()
if blocked -> stop
retrieveSelectedKnowledge()
buildRuntimeContext()
callModel()
storeKnowledgeSelectionReceipt()
```

---

# 85. MODEL ROUTER INTEGRATION

Router deve considerar:

```text
knowledge requirement cost
source availability
certification
```

---

# 86. PRE-EXECUTION GATE

Task só entra em:

```text
RUNNING
```

depois de:

```text
Knowledge Necessity Decision = COMPLETE
```

---

# 87. FAIL STATES

Criar:

```text
KNOWLEDGE_DECISION_FAILED
KNOWLEDGE_SOURCE_MISSING
KNOWLEDGE_CONFLICT
KNOWLEDGE_OUTDATED
KNOWLEDGE_TENANT_MISMATCH
```

---

# 88. AUDIT EVENTS

Registar:

```text
knowledge_necessity_evaluated
native_sufficiency_used
source_required
client_source_required
knowledge_excluded
knowledge_selected
knowledge_conflict_detected
knowledge_runtime_minimized
```

---

# 89. IMMUTABLE EXECUTION EVIDENCE

Após task completion, preservar:

```text
which knowledge was selected
which knowledge was excluded
why
which model was used
```

---

# 90. NO POST-HOC REWRITING

Não alterar decisões históricas retroactivamente.

---

# 91. TESTES OBRIGATÓRIOS

## TEST-KNE-01
Native sufficient + low criticality.

Esperado:

```text
NATIVE_SUFFICIENT
runtime_required = false
```

## TEST-KNE-02
Native high score + critical source.

Esperado:

```text
SOURCE_REQUIRED
```

## TEST-KNE-03
Client-specific policy.

Esperado:

```text
CLIENT_SOURCE_REQUIRED
```

## TEST-KNE-04
Duplicate source.

Esperado:

```text
DUPLICATE_KNOWLEDGE
```

## TEST-KNE-05
Conflicting source.

Esperado:

```text
CONFLICTING_KNOWLEDGE
```

## TEST-KNE-06
Outdated source.

Esperado:

```text
OUTDATED_KNOWLEDGE
```

## TEST-KNE-07
Different provider/model.

Esperado:

```text
different decision allowed
```

## TEST-KNE-08
Fallback provider.

Esperado:

```text
re-evaluate knowledge necessity
```

## TEST-KNE-09
Missing source-critical source.

Esperado:

```text
TASK_BLOCKED_MISSING_SOURCE
```

## TEST-KNE-10
Only relevant chunks selected.

Esperado:

```text
MINIMAL_RETRIEVAL
```

## TEST-KNE-11
Knowledge selection receipt created.

## TEST-KNE-12
Excluded source reason stored.

## TEST-KNE-13
Model change invalidates cache.

## TEST-KNE-14
MNCA baseline change invalidates cache.

## TEST-KNE-15
Company source never leaks cross-tenant.

---

# 92. TESTE REAL — BUSINESS WRITING

Usar um Employee certificado para business writing.

Executar:

```text
native-only task
```

Esperado:

```text
no external writing manual injected
```

se:

```text
NATIVE_SUFFICIENT
```

---

# 93. TESTE REAL — SOURCE CRITICAL

Executar tarefa fiscal.

Esperado:

```text
verified official source injected
```

mesmo com native score alto.

---

# 94. TESTE REAL — CLIENT SOURCE

Executar tarefa MARVINE com política privada.

Esperado:

```text
tenant source injected
```

---

# 95. TESTE REAL — PROVIDER COMPARISON

Mesma competência em:

```text
OpenAI
Gemini
Claude
```

Esperado:

```text
independent knowledge decisions
```

---

# 96. EVIDÊNCIA MÍNIMA

Cada teste real deve provar:

```text
task
provider
model
MNCA baseline
evaluated source
decision
selected chunks
runtime context
model execution
result
```

---

# 97. NO MOCK AS NATIVE PROOF

Mock pode testar lógica do KNE.

Não pode provar:

```text
native capability
real provider behaviour
real knowledge utility
```

---

# 98. FRONTEND STATUS

Para cada source/model:

```text
NATIVE
OPTIONAL
REQUIRED
CLIENT REQUIRED
BLOCKED
```

---

# 99. UX SIMPLES

O utilizador não deve precisar entender todos os cálculos.

Mostrar:

```text
Esta fonte é necessária para este Employee?
SIM / NÃO / ÀS VEZES
```

e permitir abrir:

```text
[ Ver Motivo ]
```

---

# 100. EXPLAINABILITY

Motivo deve ser legível.

Exemplo:

```text
"Não é necessária por defeito porque o modelo obteve 96% em Business Writing e a fonte tem criticidade baixa."
```

Outro:

```text
"É obrigatória porque a tarefa contém conteúdo fiscal e exige fonte oficial verificável."
```

---

# 101. CRITÉRIOS DE ACEITAÇÃO

A implementação só pode ser considerada concluída quando:

```text
✓ upload não implica runtime injection
✓ Published não significa Required
✓ cada task avalia necessidade de conhecimento
✓ MNCA é consultado
✓ decisão é por provider/model
✓ source criticality prevalece quando obrigatório
✓ client-specific source é reconhecida
✓ novelty/overlap/conflict são avaliados
✓ runtime selecciona apenas conhecimento necessário
✓ chunks irrelevantes são excluídos
✓ knowledge token budget existe
✓ fallback recalcula necessidade
✓ decisão é auditável
✓ frontend mostra motivo
✓ source-critical ausente bloqueia task
✓ client source ausente bloqueia task quando obrigatória
✓ cross-tenant é bloqueado
✓ knowledge selection receipt é persistido
```

---

# 102. RESULTADO FINAL

A plataforma deve passar de:

```text
Knowledge Library
→ send everything to model
```

para:

```text
Knowledge Library
↓
Knowledge Necessity Engine
↓
Native Capability Check
↓
Source Criticality Check
↓
Client Requirement Check
↓
Novelty / Conflict / Freshness Check
↓
Minimal Knowledge Selection
↓
Runtime
```

---

# 103. REGRA FINAL

Formalizar:

```text
MODEL_NATIVE
→ usar quando suficiente

CURATED_KNOWLEDGE
→ usar apenas quando acrescenta valor real

SOURCE_CRITICAL
→ usar obrigatoriamente

CLIENT_SOURCE
→ usar quando a tarefa depende da empresa
```

e:

```text
KNOWLEDGE SHOULD BE AVAILABLE
≠
KNOWLEDGE SHOULD ALWAYS BE INJECTED
```

---

# 104. OBJECTIVO FINAL

Transformar o Knowledge Center de simples repositório de documentos num **Knowledge Optimization Engine** capaz de decidir, por tarefa, Employee, competência, provider e model:

> **Que conhecimento realmente precisa de entrar no contexto do modelo agora?**

O resultado deve ser:

```text
menos tokens
menos latência
menos ruído
menos conflito
mais precisão
mais proveniência
mais controlo
```

sem sacrificar fontes obrigatórias, conhecimento privado da empresa ou requisitos de segurança.

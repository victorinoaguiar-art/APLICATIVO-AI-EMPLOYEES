# PROMPT MESTRE — AUDITORIA DO CONHECIMENTO NATIVO DO MODELO, DETECÇÃO DE LACUNAS E PLANO DE REFORÇO

## Objectivo

Implementar na plataforma AETF-500 um processo técnico, repetível e auditável para descobrir:

1. o que cada modelo de IA sabe fazer nativamente;
2. o que consegue executar com qualidade suficiente sem apoio externo;
3. o que conhece parcialmente;
4. o que precisa de reforço com fontes, documentos, regras, ferramentas ou treino;
5. o que nunca deve ser executado apenas com conhecimento nativo;
6. quais competências estão prontas para uso;
7. quais competências exigem supervisão;
8. quais competências devem ser bloqueadas até receber reforço;
9. quais Employees podem usar determinada competência com segurança;
10. quais materiais devem ser acrescentados à biblioteca central de conhecimento.

A avaliação deve ser baseada em **desempenho real em tarefas**, e não em auto-declarações do modelo.

---

# 1. PRINCÍPIO FUNDAMENTAL

Nunca perguntar apenas:

```text
"Sabes fazer isto?"
```

ou:

```text
"Tens conhecimento desta matéria?"
```

e aceitar a resposta como prova.

Adoptar:

```text
MODEL CLAIM
≠
PROVEN CAPABILITY
```

A classificação deve resultar de:

```text
COMPETÊNCIA NECESSÁRIA
+
TESTES REPRESENTATIVOS
+
RUBRICA OBJECTIVA
+
EXECUÇÃO OBSERVADA
+
ANÁLISE DE ERROS
=
CAPACIDADE NATIVA COMPROVADA
```

---

# 2. DEFINIÇÃO DE MODEL NATIVE

Considerar `MODEL_NATIVE` apenas o que o modelo consegue fazer sem consultar:

- RAG;
- ficheiros externos;
- Google Drive;
- OneDrive;
- bases de dados;
- APIs;
- pesquisa web;
- Country Packs;
- Sector Packs;
- Client Policy Packs;
- documentos do cliente;
- memória privada;
- manuais adicionados especificamente para o teste.

O teste nativo deve utilizar apenas:

```text
BASE MODEL
+
SYSTEM INSTRUCTIONS ESSENCIAIS
+
TEST PROMPT
```

---

# 3. NÃO TENTAR RECONSTRUIR O TREINO DO MODELO

Não tentar descobrir ou afirmar:

- quais ficheiros exactos foram usados no treino;
- qual livro originou uma resposta;
- qual URL foi memorizada;
- qual documento específico está “dentro” do modelo.

O objectivo é medir:

```text
WHAT THE MODEL CAN DEMONSTRABLY DO
```

e não:

```text
WHAT EXACTLY WAS IN ITS TRAINING CORPUS
```

---

# 4. CRIAR MODEL NATIVE CAPABILITY REGISTRY

Criar ou reutilizar:

```text
MODEL_NATIVE_CAPABILITY_REGISTRY
```

Campos mínimos:

```text
model_id
model_name
provider
model_version
configuration
reasoning_level
evaluation_date
evaluation_baseline_id
external_tools_enabled
external_sources_enabled
test_suite_version
status
```

Exemplo:

```text
MODEL_ID = MODEL-GPT-OSS-120B-001
MODEL_NAME = GPT OSS 120B
REASONING_LEVEL = MEDIUM
EXTERNAL_SOURCES_ENABLED = false
BASELINE_ID = MNCA-2026-001
```

---

# 5. INVENTÁRIO DOS 500 EMPLOYEES

Extrair do catálogo:

```text
employee_id
role
department
competencies
task_types
risk_level
jurisdiction
required_tools
required_sources
```

Depois deduplicar competências.

Produzir:

```text
TOTAL_EMPLOYEES
TOTAL_COMPETENCY_ASSIGNMENTS
UNIQUE_COMPETENCIES
```

A auditoria deve trabalhar prioritariamente sobre:

```text
UNIQUE_COMPETENCIES
```

e não testar a mesma competência 500 vezes de forma redundante.

---

# 6. MAPA EMPLOYEE → COMPETÊNCIA → TAREFA

Criar matriz:

| Employee | Competência | Tipo de tarefa | Risco | Jurisdição |
|---|---|---|---|---|

Exemplo:

| EMP-101 | Redacção Empresarial | Carta comercial | Baixo | Global |
| EMP-205 | Reconciliação Bancária | Reconciliação mensal | Médio | Global |
| EMP-310 | Fiscalidade Angola | IVA | Alto | AO |
| EMP-411 | RH Angola | Contrato de trabalho | Alto | AO |

---

# 7. CLASSIFICAÇÃO DA COMPETÊNCIA

Cada competência deve ser classificada como uma ou mais:

```text
GENERAL
PROFESSIONAL
TECHNICAL
REGULATORY
JURISDICTIONAL
CLIENT_SPECIFIC
TOOL_SPECIFIC
TIME_SENSITIVE
HIGH_RISK
```

---

# 8. SOURCE CRITICALITY

Criar:

```text
SOURCE_CRITICALITY
```

Valores:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Exemplo:

| Competência | Criticality |
|---|---|
| Redacção empresarial | LOW |
| Comunicação | LOW |
| Excel | MEDIUM |
| Primavera v10 | MEDIUM |
| Contabilidade | MEDIUM |
| Fiscalidade Angola | HIGH |
| Direito laboral Angola | HIGH |
| MINSA | CRITICAL |
| Regulação BNA | CRITICAL |
| Procedimentos MARVINE | CRITICAL |

---

# 9. REGRA DE SOURCE CRITICALITY

Mesmo que o modelo obtenha boa pontuação:

```text
SOURCE_CRITICALITY = HIGH
```

ou:

```text
SOURCE_CRITICALITY = CRITICAL
```

obriga a fonte externa verificável quando a tarefa depende de:

- legislação;
- normas vigentes;
- regulamentos;
- dados do cliente;
- políticas internas;
- documentação versionada;
- software específico;
- informação actualizável;
- conteúdo jurídico;
- conteúdo fiscal;
- conteúdo médico;
- conteúdo financeiro regulado.

---

# 10. MODOS FINAIS DE CONHECIMENTO

Cada competência deve terminar classificada em um destes modos:

```text
MODEL_NATIVE_SUFFICIENT

MODEL_NATIVE_PLUS_CURATED

SOURCE_CRITICAL

CLIENT_SOURCE_REQUIRED

UNSUPPORTED
```

## MODEL_NATIVE_SUFFICIENT

O modelo demonstrou desempenho suficiente e a competência não exige fonte externa obrigatória.

## MODEL_NATIVE_PLUS_CURATED

O modelo domina a base, mas precisa de materiais adicionais, exemplos, templates, procedimentos ou documentação técnica.

## SOURCE_CRITICAL

O modelo pode saber o assunto, mas a execução segura exige fonte verificável.

## CLIENT_SOURCE_REQUIRED

A competência depende de informação própria da empresa.

## UNSUPPORTED

O modelo não demonstrou capacidade suficiente.

---

# 11. TEST SUITE POR COMPETÊNCIA

Para cada competência única, criar testes representativos.

Tipos recomendados:

```text
FOUNDATION_TEST
APPLICATION_TEST
REALISTIC_TASK_TEST
EDGE_CASE_TEST
ERROR_DETECTION_TEST
MISSING_INFORMATION_TEST
ANTI_HALLUCINATION_TEST
FORMAT_TEST
CONSISTENCY_TEST
SAFETY_TEST
```

---

# 12. TESTES PRÁTICOS, NÃO APENAS TEÓRICOS

A avaliação deve privilegiar execução real.

Exemplo para Redacção Empresarial:

```text
BW-001 — Redigir carta comercial
BW-002 — Redigir carta bancária
BW-003 — Transformar texto informal em formal
BW-004 — Detectar dados em falta
BW-005 — Evitar inventar NIF ou destinatário
BW-006 — Adaptar tom ao destinatário
BW-007 — Corrigir carta mal estruturada
BW-008 — Produzir carta com restrições específicas
```

Exemplo para Contabilidade:

```text
ACC-001 — Classificar documento
ACC-002 — Criar lançamento
ACC-003 — Detectar lançamento incorrecto
ACC-004 — Reconciliar banco
ACC-005 — Explicar diferença
ACC-006 — Produzir balancete interpretado
```

Exemplo para Excel:

```text
XLS-001 — Fórmulas
XLS-002 — PROCV/XLOOKUP
XLS-003 — Tabelas dinâmicas
XLS-004 — Power Query
XLS-005 — Tratamento de erros
XLS-006 — Automatização básica
```

---

# 13. TESTE DE INFORMAÇÃO EM FALTA

Sempre incluir teste onde faltam dados.

O modelo deve saber responder:

```text
"Falta o NIF."
"Falta o destinatário."
"Falta o período."
"Falta o documento de suporte."
```

em vez de inventar.

Se inventar:

```text
CRITICAL_FAIL
```

---

# 14. TESTE DE NÃO ALUCINAÇÃO

Para competências profissionais ou regulatórias, incluir situações onde:

- não existe base suficiente;
- a norma pode ter mudado;
- o documento não foi fornecido;
- a resposta correcta é pedir evidência.

O modelo deve preferir:

```text
INSUFFICIENT_EVIDENCE
```

a inventar.

---

# 15. RUBRICA OBJECTIVA

Cada competência deve ter rubrica própria.

Exemplo geral:

| Critério | Peso |
|---|---:|
| Correcção técnica | 25% |
| Completude | 15% |
| Clareza | 10% |
| Aplicação prática | 15% |
| Coerência | 10% |
| Não invenção | 10% |
| Cumprimento de instruções | 10% |
| Formato | 5% |

Total:

```text
100%
```

---

# 16. THRESHOLDS

Usar, por defeito:

```text
90–100 = NATIVE_STRONG
80–89 = NATIVE_ADEQUATE
70–79 = NATIVE_PARTIAL
<70 = NATIVE_INSUFFICIENT
```

Mas a decisão final deve considerar também:

```text
SOURCE_CRITICALITY
RISK_LEVEL
CRITICAL_FAILURES
```

---

# 17. CRITICAL FAILURES

Independentemente da nota, considerar falha crítica quando ocorrer:

```text
inventar legislação
inventar NIF
inventar valores
inventar entidade
misturar empresas
usar dados de outro tenant
afirmar certeza sem fonte
aplicar jurisdição errada
ignorar limitação crítica
alterar dados fornecidos sem autorização
```

---

# 18. REPETIÇÃO DOS TESTES

Cada competência deve ser testada com múltiplos casos.

Não aceitar:

```text
1 teste = competência provada
```

Recomendação:

```text
LOW RISK: 5–8 casos
MEDIUM RISK: 8–15 casos
HIGH RISK: 15–25 casos
CRITICAL: 20+ casos + fontes verificadas
```

---

# 19. TESTES COM VARIAÇÃO

Variar:

- contexto;
- formato;
- complexidade;
- dados;
- sector;
- destinatário;
- excepções;
- ambiguidades;
- idioma, quando aplicável.

O objectivo é medir robustez e não memorização do padrão do teste.

---

# 20. MODELO DE REGISTO DE RESULTADO

Criar:

```text
MODEL_CAPABILITY_TEST_RESULT
```

Campos:

```text
test_run_id
model_id
competency_id
test_case_id
input
expected_outcome
actual_output
score
critical_fail
error_types
duration
timestamp
evaluator
```

---

# 21. SCORE CONSOLIDADO

Para cada competência calcular:

```text
average_score
median_score
min_score
max_score
standard_deviation
pass_rate
critical_failure_count
```

---

# 22. CONSISTÊNCIA

Executar alguns testes equivalentes em momentos diferentes.

Medir:

```text
CONSISTENCY_SCORE
```

Se o modelo acerta hoje e falha amanhã na mesma competência:

```text
NATIVE_UNSTABLE
```

---

# 23. KNOWLEDGE GAP ANALYZER

Criar:

```text
KNOWLEDGE_GAP_ANALYZER
```

Para cada competência comparar:

```text
REQUIRED_CAPABILITY
vs
OBSERVED_NATIVE_CAPABILITY
```

Resultado:

```text
NO_GAP
MINOR_GAP
MODERATE_GAP
MAJOR_GAP
CRITICAL_GAP
```

---

# 24. MODELO DE DECISÃO

Exemplo:

```text
Required Score = 90
Native Score = 94
Criticality = LOW

Decision:
MODEL_NATIVE_SUFFICIENT
```

Outro:

```text
Required Score = 90
Native Score = 82
Criticality = MEDIUM

Decision:
MODEL_NATIVE_PLUS_CURATED
```

Outro:

```text
Required Score = 90
Native Score = 95
Criticality = CRITICAL

Decision:
SOURCE_CRITICAL
```

---

# 25. REGRA IMPORTANTE

Boa pontuação não elimina necessidade de fonte oficial.

Exemplo:

```text
Fiscalidade Angola
Native Score = 95
Source Criticality = CRITICAL
```

Resultado:

```text
SOURCE_CRITICAL
```

e não:

```text
MODEL_NATIVE_SUFFICIENT
```

---

# 26. DIAGNÓSTICO DO TIPO DE REFORÇO

Quando houver gap, identificar exactamente o reforço necessário.

Tipos:

```text
SOURCE_REINFORCEMENT
PROCEDURE_REINFORCEMENT
TEMPLATE_REINFORCEMENT
EXAMPLE_REINFORCEMENT
TOOL_DOCUMENTATION_REINFORCEMENT
JURISDICTION_REINFORCEMENT
CLIENT_KNOWLEDGE_REINFORCEMENT
PROMPTING_REINFORCEMENT
WORKFLOW_REINFORCEMENT
HUMAN_SUPERVISION_REQUIRED
```

---

# 27. NÃO USAR “TREINO” COMO RESPOSTA GENÉRICA

Não responder simplesmente:

```text
"precisa de treino"
```

Deve especificar:

```text
WHAT IS MISSING
WHY IT MATTERS
WHAT SOURCE IS NEEDED
WHAT TYPE OF MATERIAL
WHICH EMPLOYEES ARE AFFECTED
WHAT TEST MUST BE REPEATED
```

---

# 28. KNOWLEDGE ACQUISITION QUEUE

Criar fila:

```text
KNOWLEDGE_ACQUISITION_QUEUE
```

Campos:

```text
gap_id
competency_id
gap_type
priority
required_material_type
suggested_source_type
affected_employees
risk
status
owner
```

---

# 29. PRIORIDADE DE REFORÇO

Calcular prioridade considerando:

```text
NUMBER_OF_EMPLOYEES_AFFECTED
+
TASK_FREQUENCY
+
BUSINESS_VALUE
+
RISK
+
SOURCE_CRITICALITY
```

---

# 30. REUTILIZAÇÃO

Se uma fonte reforçar várias competências, registar:

```text
1 SOURCE
→ MANY KNOWLEDGE OBJECTS
→ MANY COMPETENCIES
→ MANY EMPLOYEES
```

Evitar duplicação de materiais.

---

# 31. EXEMPLO — REDACÇÃO EMPRESARIAL

Resultado:

```text
Competency:
Redacção Empresarial

Native Score:
94%

Critical Failures:
0

Source Criticality:
LOW

Decision:
MODEL_NATIVE_SUFFICIENT

External Material:
OPTIONAL

Certification:
ELIGIBLE_FOR_TEST_CERTIFICATION
```

---

# 32. EXEMPLO — PRIMAVERA V10

Resultado:

```text
Competency:
Primavera v10

Native Score:
72%

Source Criticality:
MEDIUM

Observed Gaps:
- menus específicos
- versão
- importação
- procedimentos
- erros operacionais

Decision:
MODEL_NATIVE_PLUS_CURATED

Required Reinforcement:
- documentação oficial Primavera
- procedimentos internos
- exemplos reais
```

---

# 33. EXEMPLO — FISCALIDADE ANGOLA

Resultado:

```text
Competency:
Fiscalidade Angola

Native Score:
91%

Source Criticality:
CRITICAL

Decision:
SOURCE_CRITICAL

Required Reinforcement:
- legislação oficial
- versões
- vigência
- alterações
- fontes AGT
```

---

# 34. EXEMPLO — PROCEDIMENTOS MARVINE

Resultado:

```text
Competency:
Procedimentos Internos MARVINE

Native Score:
N/A

Decision:
CLIENT_SOURCE_REQUIRED

Required Reinforcement:
- políticas internas
- templates
- organograma
- regras de aprovação
```

---

# 35. EMPLOYEE IMPACT

Após classificar as competências, mapear:

```text
COMPETENCY
↓
AFFECTED EMPLOYEES
```

Exemplo:

```text
Redacção Empresarial
→ 183 Employees

Excel
→ 146 Employees

Fiscalidade Angola
→ 37 Employees
```

---

# 36. MODELO DE SAÍDA POR EMPLOYEE

Exemplo:

```text
EMP-125
Assistente Administrativo

Redacção Empresarial
MODEL_NATIVE_SUFFICIENT

Excel
MODEL_NATIVE_PLUS_CURATED

Direito Comercial Angola
SOURCE_CRITICAL

Procedimentos MARVINE
CLIENT_SOURCE_REQUIRED
```

---

# 37. MODEL-SPECIFIC BASELINE

Nunca transferir automaticamente resultados entre modelos.

Se testar:

```text
GPT OSS 120B
```

e depois mudar para outro modelo:

```text
MODEL B
```

criar nova baseline.

---

# 38. MODEL COMPARISON

Permitir comparação:

| Competência | Modelo A | Modelo B | Melhor |
|---|---:|---:|---|
| Redacção | 94 | 91 | A |
| Contabilidade | 88 | 93 | B |
| Excel | 84 | 89 | B |

Isto pode orientar routing de tarefas.

---

# 39. MODEL ROUTING OPCIONAL

Se existirem vários modelos:

```text
TASK
↓
REQUIRED COMPETENCY
↓
BEST CERTIFIED MODEL
↓
EMPLOYEE INSTANCE
```

Não implementar routing automático sem política explícita.

---

# 40. RISCO DA TAREFA

O mesmo conhecimento pode ser suficiente para uma tarefa e insuficiente para outra.

Exemplo:

```text
Redacção Empresarial
→ carta simples = LOW RISK
→ resposta jurídica = HIGH RISK
```

Portanto, avaliar:

```text
COMPETENCY
+
TASK TYPE
+
RISK
```

---

# 41. CLASSIFICAÇÃO FINAL DA COMPETÊNCIA

Cada combinação deve terminar com:

```text
MODEL_NATIVE_SUFFICIENT
MODEL_NATIVE_PLUS_CURATED
SOURCE_CRITICAL
CLIENT_SOURCE_REQUIRED
UNSUPPORTED
```

e também:

```text
READY
READY_WITH_SUPERVISION
NOT_READY
BLOCKED
```

---

# 42. TASK ELIGIBILITY

Integrar com o Task Eligibility Gate.

Antes da tarefa:

```text
TASK
↓
REQUIRED COMPETENCIES
↓
MODEL CAPABILITY STATUS
↓
SOURCE REQUIREMENTS
↓
EMPLOYEE CERTIFICATION
↓
ELIGIBILITY
```

---

# 43. REFORÇO E RETESTE

Quando for adicionado reforço:

```text
GAP
↓
ADD MATERIAL
↓
INDEX / CURATE
↓
RETEST
↓
COMPARE BEFORE / AFTER
```

---

# 44. MEDIR EFEITO DO REFORÇO

Exemplo:

```text
Before:
72%

After:
91%

Improvement:
+19 points
```

Só considerar o reforço eficaz se houver melhoria demonstrada.

---

# 45. NÃO CONFUNDIR KNOWLEDGE COM TOOL ACCESS

Distinguir:

```text
KNOWS HOW
```

de:

```text
CAN ACCESS TOOL
```

Exemplo:

O modelo pode saber Excel mas não ter acesso ao ficheiro Excel.

Esses estados devem ser separados.

---

# 46. NÃO CONFUNDIR KNOWLEDGE COM CURRENTNESS

Distinguir:

```text
MODEL KNOWS THE TOPIC
```

de:

```text
MODEL KNOWS THE CURRENT VERSION
```

Especialmente para:

- legislação;
- APIs;
- software;
- preços;
- políticas;
- normas.

---

# 47. CURRENTNESS REQUIREMENT

Para competências time-sensitive:

```text
CURRENTNESS_CHECK_REQUIRED = true
```

Sem fonte actual:

```text
NOT_READY
```

---

# 48. EVIDENCE LEVEL

Criar:

```text
EVIDENCE_LEVEL
```

Exemplo:

```text
E0 = untested
E1 = basic tests
E2 = representative tests
E3 = multi-case validated
E4 = validated with source support
E5 = production proven
```

---

# 49. PRODUCTION EVIDENCE

Após uso real, registar:

```text
real_tasks_completed
success_rate
human_corrections
critical_errors
customer_acceptance
```

Isto actualiza confiança operacional.

---

# 50. DASHBOARD

Criar dashboard:

# Model Native Capability

Mostrar:

```text
Unique Competencies
Native Sufficient
Native + Curated
Source Critical
Client Source Required
Unsupported
```

---

# 51. HEATMAP DE GAPS

Mostrar por departamento:

```text
Accounting
Finance
HR
Marketing
Legal
IT
Operations
```

com:

```text
GREEN = sufficient
YELLOW = needs reinforcement
RED = blocked
```

---

# 52. RELATÓRIO PRINCIPAL

Produzir:

```text
MODEL_NATIVE_CAPABILITY_AUDIT_REPORT
```

Com secções:

```text
1. Model Identity
2. Test Baseline
3. Competency Inventory
4. Native Capability Results
5. Source Criticality
6. Knowledge Gaps
7. Required Reinforcement
8. Employee Impact
9. Priority Queue
10. Retest Plan
```

---

# 53. TABELA PRINCIPAL

| Competência | Native Score | Criticality | Modo | Gap | Reforço |
|---|---:|---|---|---|---|

---

# 54. TABELA DE IMPACTO

| Competência | Employees afectados | Prioridade | Estado |
|---|---:|---|---|

---

# 55. TABELA DE AQUISIÇÃO

| Gap | Material necessário | Tipo de fonte | Prioridade | Estado |
|---|---|---|---|---|

---

# 56. AUDITORIA

Registar:

```text
model_capability_test_started
model_capability_test_completed
competency_scored
critical_failure_detected
gap_detected
reinforcement_required
source_required
retest_scheduled
competency_reclassified
```

---

# 57. NÃO FABRICAR RESULTADOS

Não criar scores sem testes reais.

Não inventar:

```text
94%
```

apenas porque parece plausível.

Cada score deve apontar para:

```text
test cases
outputs
rubric
evaluator
```

---

# 58. NÃO AUTO-CERTIFICAR

O próprio modelo testado não deve ser o único avaliador final dos seus resultados.

Utilizar pelo menos:

- rubrica determinística;
- validações objectivas;
- evaluator separado;
- amostragem humana para competências críticas.

---

# 59. HUMAN REVIEW

Obrigatório para:

```text
HIGH_RISK
CRITICAL
REGULATORY
LEGAL
MEDICAL
FINANCIAL
```

quando aplicável.

---

# 60. RESULTADO ESPERADO

No final, a plataforma deve conseguir dizer:

```text
MODEL:
GPT OSS 120B Medium

UNIQUE COMPETENCIES:
240

MODEL_NATIVE_SUFFICIENT:
118

MODEL_NATIVE_PLUS_CURATED:
64

SOURCE_CRITICAL:
42

CLIENT_SOURCE_REQUIRED:
11

UNSUPPORTED:
5
```

Os números devem resultar de testes reais.

---

# 61. RESULTADO POR COMPETÊNCIA

Exemplo:

```text
Competency:
Business Writing

Native Score:
94%

Consistency:
92%

Critical Failures:
0

Source Criticality:
LOW

Decision:
MODEL_NATIVE_SUFFICIENT

Reinforcement:
NONE REQUIRED
```

---

# 62. RESULTADO COM REFORÇO

Exemplo:

```text
Competency:
Primavera v10

Native Score:
72%

Decision:
MODEL_NATIVE_PLUS_CURATED

Missing:
Version-specific procedures

Required:
Official Primavera documentation
Internal examples
Import workflows

Retest:
REQUIRED
```

---

# 63. RESULTADO SOURCE-CRITICAL

Exemplo:

```text
Competency:
Angola Tax

Native Score:
91%

Source Criticality:
CRITICAL

Decision:
SOURCE_CRITICAL

External Source:
REQUIRED

Task Status:
BLOCKED UNTIL VERIFIED SOURCES AVAILABLE
```

---

# 64. PRINCÍPIO FINAL

A pergunta:

> “O que o modelo sabe?”

deve ser respondida por:

```text
WHAT IT CAN REPEATEDLY DEMONSTRATE
```

A pergunta:

> “O que precisa de reforço?”

deve ser respondida por:

```text
REQUIRED CAPABILITY
-
OBSERVED CAPABILITY
+
SOURCE CRITICALITY
+
TASK RISK
=
REINFORCEMENT REQUIREMENT
```

---

# 65. FLUXO FINAL

```text
500 EMPLOYEES
↓
EXTRACT COMPETENCIES
↓
DEDUPLICATE
↓
BUILD TEST SUITES
↓
RUN MODEL NATIVE TESTS
↓
SCORE
↓
DETECT CRITICAL FAILURES
↓
CLASSIFY SOURCE CRITICALITY
↓
IDENTIFY GAPS
↓
DEFINE REINFORCEMENT
↓
ADD SOURCES / MATERIALS
↓
RETEST
↓
CERTIFY
↓
MAP TO EMPLOYEES
```

---

# 66. REGRA DE ACEITAÇÃO

A auditoria só pode ser considerada concluída quando:

```text
✓ competências dos 500 Employees foram inventariadas
✓ competências únicas foram deduplicadas
✓ cada competência tem test suite
✓ cada modelo tem baseline própria
✓ testes nativos foram executados sem fontes externas
✓ scores têm evidência
✓ critical failures foram registadas
✓ source criticality foi definida
✓ gaps foram identificados
✓ reforços foram especificados
✓ affected employees foram mapeados
✓ retests foram definidos
✓ nenhum score foi inventado
```

---

# 67. OBJECTIVO FINAL

A plataforma deve conseguir responder, para qualquer competência:

> O modelo já sabe fazer isto?

> Com que qualidade?

> Em quantos testes?

> É consistente?

> Em que situações falha?

> Precisa de fonte externa?

> Precisa de material complementar?

> Precisa de conhecimento do cliente?

> Está pronto para uso?

> Quais Employees são afectados?

> Que reforço exacto é necessário?

Somente depois disso a competência deve ser considerada pronta para certificação e uso operacional.

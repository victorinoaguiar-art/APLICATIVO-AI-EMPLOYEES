# PROMPT MESTRE DE IMPLEMENTAÇÃO
## Competency Passport + Knowledge Provenance + Physical Source Explorer + Task Eligibility Gate

### Objectivo

Implementar na plataforma AETF-500 uma camada transversal que permita comprovar, antes da execução de qualquer tarefa, se um AI Employee:

1. possui a competência necessária;
2. possui conhecimento verificável que suporta essa competência;
3. possui fontes físicas reais que sustentam esse conhecimento;
4. possui evidência de extracção, transformação e indexação desse conhecimento;
5. foi efectivamente testado;
6. está certificado para aquele tipo de tarefa;
7. pode executar autonomamente, executar apenas com supervisão ou deve ser bloqueado.

O sistema deve permitir responder, de forma auditável:

> O que este Employee sabe?

> De onde veio esse conhecimento?

> Que ficheiros físicos sustentam esse conhecimento?

> Esses ficheiros existem realmente?

> O hash físico corresponde ao hash registado?

> O Employee foi testado?

> Está autorizado a executar esta tarefa?

---

# 1. PRINCÍPIO CENTRAL

Adoptar obrigatoriamente as seguintes regras:

```text
NO PHYSICAL SOURCE
=
NO VERIFIED KNOWLEDGE
```

```text
NO VERIFIED KNOWLEDGE
=
NO FULL CERTIFICATION
```

```text
NO COMPETENCY CERTIFICATION
=
NO UNSUPERVISED TASK EXECUTION
```

Nenhuma competência pode ser considerada plenamente certificada apenas porque:

- existe no catálogo;
- existe uma descrição textual;
- existe um booleano `has_skill = true`;
- existe um relatório que afirma que a competência foi criada;
- existe uma regra lógica sem fonte física;
- o Employee produziu uma resposta aparentemente correcta;
- existe um `PASS` sem prova subjacente.

---

# 2. CADEIA DE EVIDÊNCIA OBRIGATÓRIA

Para cada competência, o sistema deve conseguir reconstruir:

```text
EMPLOYEE INSTANCE
↓
COMPETENCY
↓
KNOWLEDGE OBJECT
↓
SOURCE RECORD
↓
PHYSICAL FILE
↓
PHYSICAL HASH
↓
TEXT EXTRACTION
↓
CHUNK / STRUCTURED KNOWLEDGE
↓
RULE / PROCEDURE
↓
TEST
↓
CERTIFICATION
↓
TASK ELIGIBILITY
```

Nenhum elo crítico deve ser inferido apenas a partir de relatórios narrativos.

---

# 3. COMPONENTES A IMPLEMENTAR

Implementar ou integrar quatro componentes:

```text
1. Competency Passport
2. Knowledge Provenance Engine
3. Physical Source Explorer
4. Task Eligibility Gate
```

Os quatro devem funcionar como um sistema único.

---

# 4. NÃO CRIAR MÓDULOS PARALELOS DESNECESSÁRIOS

Antes de desenvolver, pesquisar no projecto por estruturas existentes equivalentes a:

```text
competency registry
skills registry
training registry
knowledge registry
knowledge objects
source registry
document registry
provenance
lineage
country packs
sector packs
client policy packs
readiness passport
certification
employee tests
physical hashes
task engine
work orders
execution engine
audit engine
```

Reutilizar o que existir.

Criar novos componentes apenas quando não houver equivalente funcional.

---

# 5. COMPETENCY PASSPORT

Criar ou expandir um:

# Competency Passport

Cada AI Employee Instance deve possuir um passaporte de competências verificável.

Exemplo:

```text
AEI-000125
Assistente Administrativo
Empresa: MARVINE, LDA

COMPETÊNCIAS

Redacção Empresarial
CERTIFIED
Score: 94%

Cartas Institucionais
CERTIFIED

Cartas Bancárias
CERTIFIED_WITH_SUPERVISION

Documentação Fiscal
NOT_CERTIFIED

Excel
CERTIFIED
```

---

# 6. IDENTIDADE DA COMPETÊNCIA

Cada competência deve possuir identificador único.

Exemplo:

```text
COMP-BUSINESS-WRITING-001
```

Campos mínimos:

```text
competency_id
name
description
domain
subdomain
jurisdiction_sensitive
task_types_supported
required_knowledge_objects
required_sources
required_tests
critical_failure_rules
minimum_score
certification_policy
version
status
created_at
updated_at
```

---

# 7. EXEMPLO OBRIGATÓRIO: REDACÇÃO EMPRESARIAL

Criar ou validar a competência:

```text
COMP-BUSINESS-WRITING-001
```

Nome:

```text
Redacção Empresarial
```

Deve cobrir pelo menos:

- estrutura de cartas empresariais;
- identificação de remetente;
- identificação de destinatário;
- assunto;
- saudação;
- corpo;
- organização lógica;
- clareza;
- concisão;
- tom empresarial;
- formalidade;
- encerramento;
- assinatura;
- anexos;
- referências;
- ortografia;
- gramática;
- coerência factual;
- não invenção de dados;
- tratamento de informação em falta;
- adaptação ao destinatário;
- diferenciação entre carta, ofício, requerimento, memorando, declaração e comunicação interna;
- utilização de papel timbrado;
- utilização de templates empresariais;
- validação final do documento.

---

# 8. KNOWLEDGE OBJECTS

Cada competência deve ser suportada por Knowledge Objects reais.

Exemplo:

```text
KO-BW-001
Estrutura da Carta Empresarial

KO-BW-002
Tom e Linguagem Empresarial

KO-BW-003
Correspondência Institucional

KO-BW-004
Revisão e Controlo de Qualidade

KO-BW-005
Tratamento de Dados Ausentes

KO-BW-006
Não Invenção de Informação

KO-BW-007
Utilização de Templates

KO-BW-008
Assinatura, Fecho e Anexos
```

---

# 9. MODELO DE KNOWLEDGE OBJECT

Cada Knowledge Object deve conter:

```text
knowledge_object_id
title
description
competency_id

source_ids
source_fragments
rules
procedures
task_types

version
created_at
updated_at

verification_status
```

---

# 10. KNOWLEDGE PROVENANCE ENGINE

Implementar proveniência completa entre:

```text
COMPETENCY
↓
KNOWLEDGE OBJECT
↓
SOURCE RECORD
↓
PHYSICAL FILE
```

Nenhum Knowledge Object deve ficar `VERIFIED` sem fonte rastreável.

---

# 11. SOURCE REGISTRY

Criar ou reutilizar um:

```text
Source Registry
```

Cada fonte deve conter:

```text
source_id
title
author
publisher
institution
source_type
source_origin
original_url
acquisition_date
version
language

physical_path
file_name
file_extension
file_size

declared_sha256
physical_sha256

verification_status

created_at
updated_at
last_verified_at
```

---

# 12. EXEMPLO DE SOURCE RECORD

```json
{
  "source_id": "SRC-BW-001",
  "title": "Guia de Redacção Empresarial",
  "source_type": "PDF",
  "physical_path": "/knowledge/global/business_writing/sources/business_writing_guide_v1.pdf",
  "version": "1.0",
  "declared_sha256": "...",
  "physical_sha256": "...",
  "verification_status": "VERIFIED"
}
```

---

# 13. ESTRUTURA FÍSICA DA BIBLIOTECA

Implementar ou organizar estrutura equivalente a:

```text
/knowledge
│
├── global
│   ├── business_writing
│   │   ├── sources
│   │   │   ├── business_writing_guide_v1.pdf
│   │   │   ├── formal_correspondence_rules.pdf
│   │   │   └── document_style_guide.md
│   │   ├── extracted_text
│   │   │   ├── business_writing_guide_v1.txt
│   │   │   └── formal_correspondence_rules.txt
│   │   ├── chunks
│   │   │   └── business_writing_chunks.jsonl
│   │   ├── rules
│   │   │   └── business_writing_rules.json
│   │   ├── competencies
│   │   │   └── COMP-BUSINESS-WRITING-001.json
│   │   └── manifest.json
│
├── jurisdictions
│   ├── AO
│   ├── PT
│   ├── MZ
│   ├── BR
│   ├── CV
│   └── ST
│
└── clients
    └── CMP-486564
        ├── policies
        ├── templates
        ├── procedures
        └── manifest.json
```

Adaptar à estrutura real do projecto.

Não criar caminhos fictícios se já existir outro padrão oficial.

---

# 14. PHYSICAL SOURCE EXPLORER

Criar interface:

# Physical Source Explorer

Permitir navegar:

```text
Conhecimento
↓
Domínio
↓
Competência
↓
Knowledge Object
↓
Fonte
↓
Ficheiro
```

---

# 15. INTERFACE DA FONTE

Mostrar:

```text
Source ID:
SRC-BW-001

Título:
Guia de Redacção Empresarial

Tipo:
PDF

Ficheiro:
business_writing_guide_v1.pdf

Caminho:
/knowledge/global/business_writing/sources/

Tamanho:
...

SHA-256 registado:
...

SHA-256 físico:
...

Estado:
VERIFIED
```

Botões:

```text
[ Abrir Ficheiro ]
[ Ver Metadados ]
[ Ver Texto Extraído ]
[ Ver Chunks ]
[ Ver Knowledge Objects ]
[ Ver Employees que Utilizam ]
[ Recalcular Hash ]
```

---

# 16. VERIFICAÇÃO FÍSICA

A plataforma deve realmente verificar:

```text
file exists?
```

Resultados:

```text
PHYSICAL_FILE_PRESENT
PHYSICAL_FILE_MISSING
```

Não inferir existência apenas a partir do Source Registry.

---

# 17. HASH FÍSICO

Recalcular SHA-256 directamente dos bytes físicos do ficheiro.

Comparar:

```text
DECLARED_HASH
vs
PHYSICAL_HASH
```

Resultados possíveis:

```text
MATCH
MISMATCH
HASH_NOT_REGISTERED
FILE_NOT_FOUND
```

---

# 18. REGRA DE DEGRADAÇÃO

Se uma fonte desaparecer ou o hash deixar de corresponder:

```text
SOURCE_STATUS = DEGRADED
```

Todos os Knowledge Objects dependentes devem ser reavaliados.

A competência pode passar para:

```text
CERTIFICATION_EVIDENCE_DEGRADED
```

Não manter silenciosamente:

```text
CERTIFIED
```

sem evidência válida.

---

# 19. MANIFESTO DE CONHECIMENTO

Cada domínio deve possuir manifesto.

Exemplo:

```text
manifest.json
```

Com:

```text
knowledge_domain
competency_ids
source_count
file_count
knowledge_object_count
rule_count

files
hashes

last_verified_at
integrity_status
```

---

# 20. EXTRACTION PROVENANCE

Para cada ficheiro utilizado, registar:

```text
source_file
↓
extraction_method
↓
extracted_text
↓
chunking
↓
knowledge_object
```

Campos:

```text
extraction_id
source_id
tool
tool_version
started_at
completed_at
output_path
output_sha256
status
```

---

# 21. CHUNKS

Se forem utilizados chunks:

```text
chunk_id
source_id
page
section
position
text
sha256
```

Deve ser possível reconstruir:

```text
Physical File
→ Extracted Text
→ Chunk
→ Knowledge Object
```

---

# 22. RULE DERIVATION

Quando uma competência utilizar regras estruturadas:

```text
Physical Source
↓
Source Fragment
↓
Interpretation
↓
Rule
```

Guardar:

```text
rule_id
knowledge_object_id
source_id
source_fragment
derivation
version
validation_status
```

---

# 23. KNOWLEDGE MAP DO EMPLOYEE

Cada Employee Instance deve possuir mapa de conhecimento.

Exemplo:

```text
AEI-000125
↓
COMP-BUSINESS-WRITING-001
↓
KO-BW-001
KO-BW-002
KO-BW-003
↓
SRC-BW-001
SRC-BW-002
↓
business_writing_guide_v1.pdf
formal_correspondence_rules.pdf
```

---

# 24. INTERFACE DO EMPLOYEE

Dentro da instância do Employee adicionar:

```text
Conhecimento
```

Mostrar tabela:

| Competência | Estado | Sources | Ficheiros | Testes | Certificação |
|---|---|---:|---:|---:|---|
| Redacção Empresarial | VERIFIED | 4 | 6 | 12 | CERTIFIED |
| Cartas Bancárias | VERIFIED | 2 | 3 | 8 | SUPERVISED |
| Fiscalidade Angola | DEGRADED | 35 | 42 | 20 | REVIEW_REQUIRED |

Ao clicar numa competência:

```text
[ Ver Fontes ]
[ Ver Ficheiros ]
[ Ver Knowledge Objects ]
[ Ver Regras ]
[ Ver Testes ]
[ Ver Certificação ]
```

---

# 25. TESTES DE COMPETÊNCIA

Não certificar apenas com perguntas teóricas.

Executar tarefas práticas.

Para Redacção Empresarial, incluir:

```text
TEST-BW-001
Carta de abertura de conta bancária

TEST-BW-002
Carta de cobrança

TEST-BW-003
Resposta formal a reclamação

TEST-BW-004
Carta institucional

TEST-BW-005
Transformar texto informal em carta formal

TEST-BW-006
Redigir documento sem inventar informação

TEST-BW-007
Detectar informação em falta antes de redigir
```

---

# 26. RUBRICA DE AVALIAÇÃO

Exemplo:

| Critério | Peso |
|---|---:|
| Estrutura documental | 15% |
| Clareza | 15% |
| Correcção linguística | 15% |
| Tom empresarial | 10% |
| Adequação ao destinatário | 10% |
| Coerência factual | 15% |
| Não invenção de dados | 10% |
| Formatação | 5% |
| Fecho/assinatura | 5% |

Total:

```text
100%
```

---

# 27. THRESHOLDS

Exemplo:

```text
≥ 90% = CERTIFIED
80–89% = CERTIFIED_WITH_SUPERVISION
70–79% = READY_FOR_RETRAINING
< 70% = NOT_CERTIFIED
```

---

# 28. FALHAS CRÍTICAS

Alguns erros devem provocar falha independentemente da média.

Exemplos:

```text
inventou NIF
inventou legislação
inventou destinatário
alterou valores fornecidos
misturou dados de outra empresa
utilizou fonte não autorizada
expôs dados de outro tenant
```

Resultado:

```text
CRITICAL_FAIL
```

---

# 29. CERTIFICATION RECORD

Criar registo:

```text
competency_certification_id
instance_id
competency_id
jurisdiction
task_type

test_set_id
test_count
passed_tests
failed_tests
critical_failures

score
certification_status

issued_at
expires_at
last_revalidated_at
```

---

# 30. CERTIFICAÇÃO POR CONTEXTO

Não certificar apenas:

```text
EMPLOYEE = CERTIFIED
```

Certificar:

```text
EMPLOYEE
+
COMPETENCY
+
JURISDICTION
+
TASK TYPE
```

Exemplo:

```text
AEI-000125
+
BUSINESS_WRITING
+
AO
+
BUSINESS_LETTER
=
CERTIFIED
```

---

# 31. TASK ELIGIBILITY GATE

Antes de qualquer tarefa, executar:

```text
TASK
↓
IDENTIFY REQUIRED COMPETENCIES
↓
CHECK EMPLOYEE COMPETENCY PASSPORT
↓
CHECK KNOWLEDGE PROVENANCE
↓
CHECK PHYSICAL SOURCES
↓
CHECK CERTIFICATION
↓
CHECK JURISDICTION
↓
CHECK TASK TYPE
↓
DECIDE
```

---

# 32. RESULTADOS DO GATE

Permitir apenas:

```text
TASK_ALLOWED
TASK_ALLOWED_WITH_SUPERVISION
TASK_BLOCKED_NOT_CERTIFIED
TASK_BLOCKED_MISSING_SOURCE
TASK_BLOCKED_DEGRADED_KNOWLEDGE
TASK_BLOCKED_WRONG_JURISDICTION
TASK_BLOCKED_CRITICAL_FAILURE
```

---

# 33. EXEMPLO — CARTA EMPRESARIAL

Pedido:

```text
Faça uma carta ao banco a solicitar um TPA.
```

Classificar:

```text
TASK_TYPE = BUSINESS_LETTER
```

Competência requerida:

```text
COMP-BUSINESS-WRITING-001
```

Verificar:

```text
Employee:
AEI-000125

Competency:
CERTIFIED

Knowledge Sources:
VERIFIED

Physical Files:
PRESENT

Hash:
MATCH

Jurisdiction:
AO

Task Type:
BUSINESS_LETTER

Result:
TASK_ALLOWED
```

---

# 34. EXEMPLO — CARTA À AGT

Pedido:

```text
Redija uma resposta a uma notificação da AGT.
```

Competências requeridas:

```text
BUSINESS_WRITING
+
ANGOLA_TAX_KNOWLEDGE
+
AGT_CORRESPONDENCE
```

Se:

```text
BUSINESS_WRITING = CERTIFIED
ANGOLA_TAX_KNOWLEDGE = CERTIFIED
AGT_CORRESPONDENCE = SUPERVISED
```

Resultado:

```text
TASK_ALLOWED_WITH_SUPERVISION
```

---

# 35. BLOQUEIO POR FALTA DE FONTE

Se:

```text
competency = CERTIFIED
```

mas:

```text
physical source = missing
```

Resultado:

```text
TASK_BLOCKED_DEGRADED_KNOWLEDGE
```

ou, conforme política:

```text
TASK_ALLOWED_WITH_SUPERVISION
```

Nunca ignorar a degradação.

---

# 36. BLOQUEIO POR HASH

Se:

```text
DECLARED_HASH != PHYSICAL_HASH
```

Resultado:

```text
KNOWLEDGE_INTEGRITY_FAILURE
```

Reavaliar:

```text
knowledge object
competency certification
task eligibility
```

---

# 37. COMPANY KNOWLEDGE

Além do conhecimento global, incluir conhecimento específico da empresa.

Exemplo MARVINE:

```text
/knowledge/clients/CMP-486564/
```

Pode conter:

```text
logo
papel timbrado
templates
modelos de carta
assinaturas
organograma
políticas
procedimentos
```

---

# 38. CLIENT POLICY PACK

Associar:

```text
CPP-CMP-486564
```

aos Employees autorizados.

Para redigir uma carta da MARVINE, o Employee deve poder combinar:

```text
GLOBAL BUSINESS WRITING KNOWLEDGE
+
MARVINE TEMPLATE
+
MARVINE POLICY
+
AO JURISDICTION
+
TASK CONTEXT
```

---

# 39. TASK RUNTIME PROVENANCE

Quando uma tarefa for executada, registar:

```text
task_id
execution_id
instance_id
company_id
tenant_id

required_competencies
competency_certifications

knowledge_objects_used
source_ids_used
physical_files_used
source_hashes

rules_used
templates_used

started_at
completed_at
result
```

---

# 40. INTERFACE “CONHECIMENTO UTILIZADO”

Dentro de cada tarefa mostrar:

# Conhecimento Utilizado

Exemplo:

```text
Competency:
Redacção Empresarial

Knowledge Objects:
KO-BW-001
KO-BW-002

Sources:
SRC-BW-001
SRC-BW-002

Physical Files:
business_writing_guide_v1.pdf
formal_correspondence_rules.pdf

Company Template:
marvine_letter_template.docx

Integrity:
VERIFIED
```

---

# 41. NÃO CONFUNDIR CONHECIMENTO DISPONÍVEL COM CONHECIMENTO USADO

Distinguir:

```text
AVAILABLE KNOWLEDGE
```

de:

```text
KNOWLEDGE ACTUALLY USED IN EXECUTION
```

A auditoria da tarefa deve mostrar o segundo.

---

# 42. ACTUALIZAÇÃO DO CONHECIMENTO

Quando uma fonte for actualizada:

```text
old source version
↓
new source version
↓
new hash
↓
new extraction
↓
affected knowledge objects
↓
affected competencies
↓
revalidation
```

Não manter automaticamente certificações anteriores se a alteração for material.

---

# 43. CHANGE IMPACT

Criar:

```text
SOURCE CHANGE
↓
KNOWLEDGE OBJECT IMPACT
↓
COMPETENCY IMPACT
↓
EMPLOYEE IMPACT
↓
TASK TYPE IMPACT
```

---

# 44. REVALIDAÇÃO

Quando necessário:

```text
CERTIFIED
↓
REVALIDATION_REQUIRED
↓
READY_FOR_RETEST
↓
CERTIFIED
```

ou:

```text
CERTIFIED_WITH_SUPERVISION
```

---

# 45. AUSÊNCIA DE FONTE

Se uma competência existir no catálogo mas não houver fonte:

```text
COMPETENCY_STATUS = UNSUPPORTED
```

Não esconder.

Mostrar:

```text
Knowledge Evidence:
MISSING
```

---

# 46. AUSÊNCIA DE TESTE

Se houver conhecimento mas não houver teste:

```text
KNOWLEDGE = VERIFIED
COMPETENCY = NOT_TESTED
```

Não declarar `CERTIFIED`.

---

# 47. AUSÊNCIA DE CERTIFICAÇÃO

Se:

```text
Knowledge = VERIFIED
Tests = PRESENT
Certification = NOT_ISSUED
```

resultado:

```text
TASK_BLOCKED
```

ou supervisão conforme política.

---

# 48. PHYSICAL SOURCE INVENTORY

Criar visão:

# Physical Source Inventory

Tabela:

| Source ID | Ficheiro | Caminho | SHA-256 | Estado | Competências |
|---|---|---|---|---|---|

---

# 49. COMPETENCY INVENTORY

Criar visão:

| Competency | Employees | Sources | Files | Tests | Status |
|---|---:|---:|---:|---:|---|

---

# 50. EMPLOYEE COMPETENCY MATRIX

Criar matriz:

| Employee | Competency | Jurisdiction | Task Type | Score | Status |
|---|---|---|---|---:|---|

---

# 51. EVIDENCE GAP REGISTER

Criar:

| Gap ID | Competency | Missing Evidence | Impact | Action |
|---|---|---|---|---|

Exemplos:

```text
physical source missing
hash missing
extraction missing
test missing
certification missing
jurisdiction missing
```

---

# 52. AUDITORIA

Registar eventos:

```text
competency_created
knowledge_object_created
source_registered
physical_file_verified
physical_hash_verified
source_degraded
knowledge_object_degraded
competency_test_started
competency_test_completed
certification_issued
certification_degraded
task_eligibility_checked
task_allowed
task_blocked
```

---

# 53. NÃO ACEITAR PASS FICTÍCIO

Não aceitar:

```text
status = PASS
```

como prova suficiente.

Cada PASS deve apontar para:

```text
test
evidence
source
hash
runtime record
```

---

# 54. PROVA FÍSICA

Para cada source record permitir:

```text
[ Abrir Ficheiro ]
```

Se o ficheiro não abrir ou não existir:

```text
PHYSICAL_SOURCE_NOT_PROVEN
```

---

# 55. SEGURANÇA

O Physical Source Explorer deve respeitar:

```text
company_id
tenant_id
user permissions
employee permissions
source classification
```

Documentos internos de uma empresa não podem ser vistos por outra.

---

# 56. ISOLAMENTO DE TENANT

Exemplo:

```text
CPP-CMP-486564
```

não pode ser utilizado por Employee de outro tenant.

Resultado:

```text
DENIED_CROSS_TENANT
```

---

# 57. TASK CREATION INTEGRATION

Integrar com a Central de Trabalho.

Ao clicar:

```text
+ Nova Tarefa
```

antes de permitir:

```text
Enviar Tarefa
```

mostrar:

# Verificação de Competência

Exemplo:

```text
Tarefa:
Criar carta bancária

Employee:
AEI-000125

Competência necessária:
Redacção Empresarial

Knowledge:
VERIFIED

Physical Sources:
4/4 PRESENT

Hashes:
4/4 MATCH

Tests:
12/12 PASS

Certification:
CERTIFIED

Eligibility:
ALLOWED
```

---

# 58. BOTÕES DO GATE

Se aprovado:

```text
[ Enviar Tarefa ]
```

Se supervisionado:

```text
[ Executar com Supervisão ]
```

Se bloqueado:

```text
[ Seleccionar Outro Employee ]
[ Ver Lacunas ]
[ Testar Competência ]
[ Adicionar Conhecimento ]
```

---

# 59. READINESS E COMPETENCY NÃO SÃO A MESMA COISA

Separar:

```text
EMPLOYEE READINESS
```

de:

```text
TASK-SPECIFIC COMPETENCY
```

Um Employee pode estar:

```text
ACTIVE
```

mas:

```text
NOT_CERTIFIED_FOR_BUSINESS_WRITING
```

Portanto:

```text
ACTIVE ≠ ELIGIBLE FOR EVERY TASK
```

---

# 60. CERTIFICAÇÃO EXPIRÁVEL

Permitir:

```text
expires_at
```

para competências que exigem actualização periódica.

Se expirada:

```text
CERTIFICATION_EXPIRED
```

---

# 61. CASO DE TESTE MARVINE

Utilizar:

```text
MARVINE, LDA
COMPANY_ID = CMP-486564
TENANT_ID = TNT-962837
```

Seleccionar um Employee real.

Executar cenário:

```text
Task:
Criar carta de solicitação de TPA para banco.
```

Antes da execução, provar:

```text
business writing competency
source files
physical paths
hashes
tests
certification
task eligibility
```

---

# 62. TESTES OBRIGATÓRIOS

## TEST-01
Competência com fontes físicas válidas.

Esperado:

```text
KNOWLEDGE_VERIFIED
```

## TEST-02
Fonte registada mas ficheiro inexistente.

Esperado:

```text
PHYSICAL_FILE_MISSING
```

## TEST-03
Hash físico diferente.

Esperado:

```text
HASH_MISMATCH
```

## TEST-04
Conhecimento existe mas Employee não foi testado.

Esperado:

```text
NOT_TESTED
```

## TEST-05
Employee testado e certificado.

Esperado:

```text
CERTIFIED
```

## TEST-06
Task compatível.

Esperado:

```text
TASK_ALLOWED
```

## TEST-07
Task exige competência ausente.

Esperado:

```text
TASK_BLOCKED_NOT_CERTIFIED
```

## TEST-08
Competência supervisionada.

Esperado:

```text
TASK_ALLOWED_WITH_SUPERVISION
```

## TEST-09
Fonte degradada.

Esperado:

```text
TASK_BLOCKED_DEGRADED_KNOWLEDGE
```

## TEST-10
Cross-tenant.

Esperado:

```text
DENIED_CROSS_TENANT
```

---

# 63. CRITÉRIOS DE ACEITAÇÃO

A implementação só pode ser considerada concluída quando:

```text
✓ cada competência possui identidade própria

✓ cada competência aponta para Knowledge Objects

✓ Knowledge Objects apontam para sources

✓ sources apontam para ficheiros físicos

✓ ficheiros podem ser abertos

✓ SHA-256 é recalculado fisicamente

✓ existe cadeia de extracção

✓ regras/procedimentos possuem origem rastreável

✓ Employee possui testes reais

✓ certificação depende de testes

✓ tarefa identifica competências necessárias

✓ Task Eligibility Gate verifica certificação

✓ conhecimento degradado afecta eligibility

✓ runtime regista conhecimento efectivamente utilizado

✓ cross-tenant é bloqueado

✓ nenhum PASS depende apenas de declaração
```

---

# 64. RESULTADO VISUAL ESPERADO

Dentro do Employee:

```text
AEI-000125
Assistente Administrativo

COMPETÊNCIAS

Redacção Empresarial
CERTIFIED — 94%

Sources:
4

Physical Files:
6

Tests:
12

Critical Failures:
0

Last Verified:
...

[ Ver Conhecimento ]
[ Ver Fontes ]
[ Ver Ficheiros ]
[ Ver Testes ]
```

---

# 65. RESULTADO VISUAL ANTES DA TAREFA

```text
TASK ELIGIBILITY CHECK

Task:
Criar carta empresarial

Employee:
AEI-000125

Required Competency:
Redacção Empresarial

Knowledge:
VERIFIED

Physical Sources:
VERIFIED

Hash Integrity:
PASS

Tests:
12/12 PASS

Certification:
CERTIFIED

Jurisdiction:
AO

Final Decision:
TASK_ALLOWED
```

---

# 66. RESULTADO VISUAL SE HOUVER PROBLEMA

```text
TASK ELIGIBILITY CHECK

Required Competency:
Redacção Empresarial

Certification:
CERTIFIED

Physical Source:
MISSING

Final Decision:
TASK_BLOCKED_DEGRADED_KNOWLEDGE

[ Ver Fonte em Falta ]
[ Seleccionar Outro Employee ]
[ Reparar Conhecimento ]
```

---

# 67. RELATÓRIO FINAL DE IMPLEMENTAÇÃO

Após implementar, produzir relatório técnico contendo:

```text
Components Reused
Components Created
Database Changes
Source Registry
Physical Source Structure
Competency Registry
Knowledge Objects
Hash Verification
Extraction Provenance
Testing Engine
Certification Engine
Task Eligibility Gate
UI Changes
Security Controls
Cross-Tenant Controls
Tests Executed
Failures
Known Gaps
```

---

# 68. REGRA FINAL

A plataforma não deve responder apenas:

> “Este Employee sabe fazer cartas.”

Deve conseguir provar:

```text
QUEM:
AEI-000125

O QUÊ:
Redacção Empresarial

COM BASE EM QUÊ:
KO-BW-001..008

DE ONDE:
SRC-BW-001..004

EM QUE FICHEIROS:
physical files

COM QUE INTEGRIDADE:
SHA-256 verified

FOI TESTADO:
yes

COM QUE RESULTADO:
94%

ESTÁ CERTIFICADO:
yes

PODE EXECUTAR ESTA TAREFA:
yes
```

---

# 69. PRINCÍPIO DE DECISÃO FINAL

Adoptar:

```text
Physical Source
→ Provenance
→ Knowledge
→ Competency
→ Test
→ Certification
→ Eligibility
→ Execution
```

Nunca:

```text
Employee Profile
→ Assumed Skill
→ Execution
```

---

# 70. OBJECTIVO FINAL

Antes de atribuir qualquer tarefa profissional a um AI Employee, o utilizador deve poder responder com evidência:

> O Employee sabe fazer isto?

> De onde vem o conhecimento?

> Que ficheiros o suportam?

> Esses ficheiros existem realmente?

> Estão íntegros?

> O Employee foi testado?

> Foi certificado?

> Está autorizado a executar esta tarefa?

Somente depois disso a tarefa pode avançar para execução.

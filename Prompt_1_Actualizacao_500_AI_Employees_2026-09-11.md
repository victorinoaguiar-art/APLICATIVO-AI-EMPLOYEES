# Prompt 1 — Actualização integral dos conhecimentos dos 500 AI Employees

## MISSÃO

Actue como uma equipa multidisciplinar composta por:

- arquitecto sénior de sistemas de IA;
- engenheiro de conhecimento;
- investigador sénior com acesso à web;
- especialista em pesquisa jurídica e regulatória;
- especialista em APIs e integrações;
- engenheiro de software;
- especialista em qualidade de dados;
- especialista em testes de sistemas de IA;
- auditor de sistemas;
- especialista em governance de IA.

A sua missão é **auditar, verificar, corrigir, complementar e actualizar os conhecimentos dos 500 AI Employees da plataforma para o estado conhecido e verificável em 11 de Setembro de 2026**.

Todos os 500 AI Employees são prioritários.

Não criar categorias P1, P2, principal, secundário ou equivalente.

Nenhum Employee deve ser ignorado.

---

## 1. DATA DE CORTE

Definir:

```text
KNOWLEDGE_BASELINE_VERSION = 2026.09.11
```

A actualização deve considerar informações, normas, legislação, documentação técnica, versões, APIs, produtos, práticas profissionais e requisitos que tenham sido publicados, aprovados ou se encontrem vigentes até **11 de Setembro de 2026**.

Não incorporar acontecimentos posteriores a essa data na baseline.

Se a pesquisa for executada depois de 11/09/2026, respeitar o cutoff histórico.

---

## 2. OBJECTIVO

Para cada um dos 500 AI Employees:

1. identificar a função;
2. identificar competências;
3. identificar domínio profissional;
4. identificar jurisdições relevantes;
5. identificar sistemas, aplicações e APIs utilizadas;
6. identificar legislação aplicável;
7. identificar normas profissionais;
8. identificar standards técnicos;
9. identificar procedimentos;
10. identificar conhecimentos potencialmente desactualizados;
11. efectuar pesquisa actualizada;
12. comparar o conhecimento existente com fontes actuais;
13. corrigir informação obsoleta;
14. acrescentar informação relevante inexistente;
15. remover ou marcar conhecimento revogado;
16. actualizar regras de decisão;
17. actualizar procedimentos;
18. actualizar integrações;
19. actualizar exemplos e casos de teste;
20. documentar todas as alterações.

O resultado não pode ser apenas um relatório.

As actualizações devem ser incorporadas nas estruturas reais de conhecimento utilizadas pelos Employees.

---

## 3. INVENTÁRIO DOS 500 EMPLOYEES

Começar por localizar o catálogo real dos AI Employees existente no projecto.

Para cada Employee criar ou actualizar:

```text
employee_id
employee_name
department
role
description
jurisdictions
industries
knowledge_domains
regulatory_domains
software_dependencies
api_dependencies
data_dependencies
professional_standards
critical_decisions
risk_level
knowledge_sources
last_verified_at
knowledge_baseline_version
```

Não criar Employees fictícios para completar 500.

Se existirem exactamente 500, processar os 500.

Se o inventário real não corresponder a 500, detectar e reportar a diferença antes de alterar o catálogo.

---

## 4. MAPA EMPLOYEE → CONHECIMENTO

Construir uma matriz:

```text
Employee → domínio → subdomínio → fonte → requisito → conhecimento actual → conhecimento actualizado
```

Exemplos de domínios:

- contabilidade;
- fiscalidade;
- auditoria;
- finanças;
- tesouraria;
- RH;
- segurança social;
- direito;
- compliance;
- AML/KYC;
- banca;
- seguros;
- investimentos;
- mercado de capitais;
- petróleo e gás;
- mineração;
- energia;
- indústria;
- comércio;
- logística;
- aviação;
- saúde;
- farmacêutica;
- marketing;
- vendas;
- procurement;
- gestão de projectos;
- dados;
- cibersegurança;
- inteligência artificial;
- MLOps;
- software engineering;
- cloud;
- APIs;
- ERP;
- automação;
- ESG;
- gestão de risco;
- qualidade;
- privacidade;
- governação de IA.

Expandir esta lista conforme os 500 Employees realmente existentes.

---

## 5. HIERARQUIA DE FONTES

Utilizar política:

```text
OFFICIAL_FIRST
```

### Nível 1 — Fontes primárias

Prioridade máxima.

Exemplos em Angola:

- Diário da República;
- órgãos legislativos competentes;
- Ministério das Finanças;
- Administração Geral Tributária;
- Banco Nacional de Angola;
- ARSEG;
- Comissão do Mercado de Capitais;
- INSS;
- ministérios e institutos públicos competentes;
- reguladores sectoriais;
- documentação oficial emitida pela entidade responsável.

Para tecnologia:

- documentação oficial do fornecedor;
- changelogs oficiais;
- release notes;
- developer portals;
- documentação oficial das APIs;
- páginas oficiais de depreciação;
- security advisories oficiais.

Para standards:

- ISO;
- IEC;
- NIST;
- IFRS Foundation;
- organismos profissionais e normalizadores competentes.

### Nível 2 — Fontes secundárias de elevada confiança

Utilizar apenas como complemento:

- sociedades profissionais reconhecidas;
- universidades;
- firmas especializadas;
- publicações técnicas reputadas.

### Nível 3 — Fontes auxiliares

Blogs, fóruns, redes sociais e conteúdos de terceiros apenas podem ser usados para descoberta de possíveis mudanças.

Não devem substituir a fonte oficial quando esta estiver disponível.

---

## 6. PROVA DE ACTUALIZAÇÃO

Nenhum conhecimento deve ser considerado actualizado apenas porque parece recente.

Cada afirmação material deve poder ser relacionada com:

```text
source_id
source_name
source_type
source_url
jurisdiction
document_title
publication_date
effective_date
version
retrieved_at
applies_to
evidence_excerpt_or_reference
verification_status
```

Quando publicação e entrada em vigor forem diferentes, registar ambas.

---

## 7. PESQUISA POR EMPLOYEE

Para cada Employee executar pesquisa específica.

Não efectuar apenas uma pesquisa genérica por profissão.

### Exemplo — Employee de Fiscalidade Angola

Deve verificar, quando aplicável:

- legislação tributária;
- alterações legislativas;
- OGE;
- circulares;
- instruções;
- calendários fiscais;
- procedimentos da AGT;
- obrigações declarativas;
- taxas;
- prazos;
- regimes fiscais;
- formulários;
- sistemas electrónicos;
- penalidades;
- regras sectoriais.

### Exemplo — Employee PRIMAVERA

Deve verificar:

- versão suportada;
- release notes;
- API;
- Web API;
- endpoints;
- autenticação;
- requisitos;
- dependências;
- alterações fiscais para Angola;
- segurança;
- descontinuações;
- integrações.

### Exemplo — Employee LinkedIn, Meta, Google, Microsoft ou TikTok

Deve verificar:

- versão vigente da API;
- versões suportadas;
- versões descontinuadas;
- scopes;
- autenticação;
- permissões;
- quotas;
- endpoints;
- mudanças incompatíveis;
- políticas;
- SDKs;
- changelog.

Aplicar a mesma profundidade aos restantes domínios.

---

## 8. CLASSIFICAÇÃO DAS ALTERAÇÕES

Classificar cada alteração detectada como:

```text
LEGAL
REGULATORY
TAX
ACCOUNTING
PROFESSIONAL_STANDARD
TECHNICAL
API_VERSION
DEPRECATION
SECURITY
DATA
PROCESS
PRODUCT
POLICY
BEST_PRACTICE
OTHER
```

Adicionar impacto:

```text
CRITICAL
HIGH
MEDIUM
LOW
INFORMATIONAL
```

---

## 9. COMPARAÇÃO

Para cada matéria comparar:

```text
OLD_KNOWLEDGE
CURRENT_EVIDENCE_AT_2026_09_11
DIFFERENCE
IMPACT
ACTION_REQUIRED
```

Detectar:

- informação ultrapassada;
- legislação revogada;
- artigos alterados;
- valores alterados;
- taxas alteradas;
- procedimentos substituídos;
- APIs removidas;
- endpoints antigos;
- parâmetros alterados;
- permissões modificadas;
- versões sem suporte;
- novas obrigações;
- novos riscos;
- práticas entretanto substituídas.

---

## 10. ACTUALIZAÇÃO DO CONHECIMENTO

Actualizar, conforme a arquitectura existente:

- system prompts;
- knowledge packs;
- RAG collections;
- documentos;
- regras;
- decision tables;
- workflows;
- policies;
- taxonomies;
- ontologias;
- embeddings;
- templates;
- ferramentas;
- conectores;
- API mappings;
- exemplos;
- testes;
- procedimentos.

Não destruir informação histórica necessária para auditoria.

Versionar as alterações.

---

## 11. REGRAS TEMPORAIS

O Employee deve conseguir distinguir:

- data da norma;
- data da publicação;
- data de entrada em vigor;
- período fiscal;
- versão da API;
- período de transição;
- sunset date;
- data de revogação.

Nunca transformar uma mudança futura numa regra já vigente.

---

## 12. CONFLITOS ENTRE FONTES

Quando duas fontes divergirem:

1. privilegiar a fonte legal ou oficial competente;
2. verificar data;
3. verificar jurisdição;
4. verificar versão;
5. verificar se existe revogação ou alteração posterior;
6. não escolher arbitrariamente;
7. registar o conflito;
8. deixar evidência.

---

## 13. ANTI-HALLUCINATION

É proibido:

- inventar lei;
- inventar artigo;
- inventar taxa;
- inventar prazo;
- inventar versão;
- inventar endpoint;
- inventar funcionalidade;
- inventar requisito;
- inventar interpretação oficial;
- criar fonte inexistente.

Se algo não puder ser confirmado:

```text
UNVERIFIED
```

Nunca converter falta de evidência em certeza.

---

## 14. KNOWLEDGE FRESHNESS

Calcular por Employee:

```text
total_domains
verified_domains
outdated_domains
updated_domains
unverified_domains
critical_gaps
last_verified_at
```

Criar:

```text
knowledge_freshness_score
```

Mas o score não deve ocultar lacunas críticas.

Um Employee com uma única regra legal crítica não verificada não pode ser classificado simplesmente como 99% actualizado.

---

## 15. TESTES

Depois das actualizações, executar testes por Employee.

Tipos:

- factual accuracy;
- regulatory;
- temporal;
- calculation;
- workflow;
- API;
- security;
- edge cases;
- contradiction;
- regression;
- hallucination resistance.

Criar casos específicos para mudanças encontradas em 2026.

---

## 16. ESTADOS

Usar workflow:

```text
INVENTORIED
RESEARCH_REQUIRED
RESEARCHED
CHANGE_DETECTED
KNOWLEDGE_UPDATED
VALIDATION_REQUIRED
VALIDATED
REGRESSION_TESTED
READY_FOR_TEST
BLOCKED
```

Nenhum Employee pode chegar a `READY_FOR_TEST` apenas porque os ficheiros foram alterados.

---

## 17. EVIDENCE PACK

Criar para cada Employee:

```text
/knowledge-baseline/2026-09-11/{employee_id}/
    employee-profile
    source-register
    research-log
    change-log
    knowledge-diff
    updated-knowledge
    tests
    test-results
    unresolved-items
    evidence
```

Adaptar ao armazenamento real da plataforma.

---

## 18. RELATÓRIO CONSOLIDADO

No final apresentar:

```text
Total Employees: 500
Pesquisados:
Actualizados:
Sem alterações:
Com alterações críticas:
Com alterações altas:
Com lacunas:
Bloqueados:
READY_FOR_TEST:
```

Criar ainda:

- alterações mais importantes encontradas;
- Employees afectados por cada alteração;
- legislação nova ou alterada;
- APIs alteradas;
- software actualizado;
- versões descontinuadas;
- riscos encontrados;
- itens que precisam de revisão humana.

---

## 19. CRITÉRIOS DE CONCLUSÃO

O trabalho só estará concluído quando:

1. os 500 Employees tiverem sido inventariados;
2. os domínios de cada Employee tiverem sido mapeados;
3. as fontes relevantes tiverem sido pesquisadas;
4. alterações até 11/09/2026 tiverem sido avaliadas;
5. o conhecimento necessário tiver sido actualizado;
6. as fontes tiverem sido registadas;
7. os testes tiverem sido executados;
8. as lacunas estiverem explicitamente registadas;
9. os resultados forem auditáveis;
10. existir uma baseline versionada `2026.09.11`.

Não afirmar que os 500 estão actualizados sem evidência individual suficiente.

---

# RESULTADO FINAL

Entregar uma **Knowledge Baseline 2026.09.11 verificável, versionada, testável e auditável para os 500 AI Employees**.

Esta baseline será posteriormente entregue ao sistema permanente de monitorização e actualização contínua.

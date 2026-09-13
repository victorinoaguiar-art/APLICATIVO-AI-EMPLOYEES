# PROMPT MESTRE — RECOLHA DE EVIDÊNCIAS FORENSES DA BIBLIOTECA MINSA

## Objectivo

Executar uma recolha técnica e forense completa das evidências necessárias para demonstrar, de forma verificável, a cadeia:

**Physical Source Authenticity → Legal Text Extraction → Rule Derivation → Index Reconstruction → Employee Retest → Runtime Proof**

Não corrigir relatórios, não alterar resultados existentes e não criar evidência nova para substituir evidência ausente.

O objectivo é descobrir e apresentar os artefactos reais actualmente existentes no sistema.

---

# 1. PRINCÍPIO CENTRAL

A auditoria deve responder, para cada conhecimento jurídico MINSA:

1. O conhecimento existe realmente?
2. Onde está fisicamente armazenado?
3. Qual é a sua fonte original?
4. Qual ficheiro contém o texto jurídico?
5. Qual é o hash desse ficheiro?
6. Como o texto foi extraído?
7. Como foi dividido em chunks?
8. Como cada chunk foi ligado a regras estruturadas?
9. Como essas regras foram ligadas aos AI Employees?
10. Como o runtime localizou e utilizou esse conhecimento?
11. O resultado foi produzido por consulta real ou por fixture, mock, hardcode ou resposta sintética?
12. O `PASS` foi calculado a partir de condições reais ou apenas atribuído programaticamente?

Nenhum `PASS` pode ser aceite apenas porque aparece num JSON ou relatório.

---

# 2. NÃO MODIFICAR O SISTEMA DURANTE A RECOLHA

Antes da recolha:

- congelar a baseline actual;
- não reparar índices;
- não regenerar chunks;
- não alterar hashes;
- não corrigir regras;
- não substituir ficheiros;
- não actualizar diplomas;
- não recriar receipts;
- não alterar timestamps;
- não executar scripts que reescrevam evidência existente.

Se alguma evidência estiver ausente, marcar:

`EVIDENCE_NOT_FOUND`

Não criar artefactos para preencher a lacuna.

---

# 3. RECOLHER O MINSA_REPAIRED_REGISTRY

Localizar e exportar integralmente o artefacto denominado ou equivalente a:

`MINSA_REPAIRED_REGISTRY`

Apresentar:

- caminho físico completo;
- tipo de ficheiro;
- tamanho;
- data de criação;
- data da última modificação;
- SHA-256;
- estrutura interna;
- número total de documentos;
- número total de fontes;
- número total de chunks;
- número total de regras;
- ligações com Employees;
- código/configuração responsável pelo carregamento do registry.

Se o registry estiver numa base de dados, exportar também:

- schema;
- tabelas relevantes;
- registos relevantes;
- chaves;
- relações;
- versão;
- migrations aplicadas.

---

# 4. LOCALIZAR SRC-MINSA-001

Localizar exactamente:

`SRC-MINSA-001`

Demonstrar:

`SRC-MINSA-001 → ficheiro físico real`

Apresentar:

- identificador;
- título jurídico;
- número do diploma;
- data;
- entidade emissora;
- fonte original;
- URL original, quando existir;
- caminho físico;
- nome do ficheiro;
- extensão;
- tamanho;
- SHA-256;
- data de ingestão;
- versão;
- estado de vigência registado;
- origem da informação sobre vigência.

Não aceitar apenas uma referência lógica.

É obrigatório localizar o objecto físico ou fonte digital real subjacente.

---

# 5. PROVAR A LEI N.º 21-B/92

Localizar o ficheiro jurídico utilizado pelo sistema para representar:

`Lei n.º 21-B/92`

Apresentar:

- ficheiro integral;
- hash SHA-256;
- origem;
- data de aquisição;
- metadados;
- texto extraído;
- método de extracção;
- páginas;
- artigos;
- estrutura jurídica reconhecida.

Demonstrar também se o documento presente no sistema corresponde efectivamente à versão jurídica que o sistema declara utilizar.

Não assumir vigência.

Se a vigência não estiver documentalmente provada, marcar:

`LEGAL_CURRENTNESS_NOT_PROVEN`

---

# 6. LOCALIZAR OS CHUNKS

Localizar todos os chunks associados às regras MINSA, incluindo obrigatoriamente:

- `CHK-DR-001-01`
- `CHK-DR-011-01`
- `CHK-DR-021-01`

E todos os restantes:

`CHK-DR-*`

Para cada chunk apresentar:

- chunk_id;
- source_id;
- document_id;
- diploma;
- artigo;
- página;
- texto integral do chunk;
- posição no documento;
- hash do conteúdo;
- método de chunking;
- data de criação;
- versão;
- índice onde está armazenado;
- vector store, quando aplicável;
- embedding model, quando aplicável.

Demonstrar a relação:

`Ficheiro físico → texto → artigo → chunk`

---

# 7. LOCALIZAR AS REGRAS DR-*

Localizar todas as regras:

`DR-*`

Incluindo obrigatoriamente:

- `DR-001`
- `DR-011`
- `DR-021`

Para cada regra apresentar:

- rule_id;
- título;
- descrição;
- regra completa;
- requisito regulatório;
- source_id;
- chunk_id;
- documento;
- artigo;
- texto legal de origem;
- lógica de derivação;
- responsável pela derivação;
- método de validação;
- versão;
- data de criação;
- data de última alteração;
- Employee(s) que utilizam a regra.

A auditoria deve demonstrar:

**Texto legal → interpretação → regra estruturada**

Não é suficiente mostrar apenas:

`DR-001 → Artigo 1.º`

---

# 8. DERIVAÇÃO JURÍDICA

Para cada regra, reconstruir a cadeia:

`Diploma`
↓
`Artigo`
↓
`Texto jurídico`
↓
`Trecho relevante`
↓
`Interpretação normativa`
↓
`Obrigação/Requisito`
↓
`DR-xxx`
↓
`Employee`

Se não existir evidência da derivação, marcar:

`RULE_DERIVATION_NOT_PROVEN`

---

# 9. MAPA DE PROVENIÊNCIA

Localizar quaisquer artefactos equivalentes a:

- `provenance_map`
- `source_map`
- `knowledge_lineage`
- `evidence_map`
- `rule_mapping`
- `knowledge_graph`
- `document_registry`

Produzir uma tabela consolidada:

| source_id | physical_file | document_id | chunk_id | rule_id | employee_id | citation |
|---|---|---|---|---|---|---|

O objectivo é demonstrar:

`SOURCE → DOCUMENT → CHUNK → RULE → EMPLOYEE`

---

# 10. ORIGEM DO CONHECIMENTO

Investigar especialmente referências a:

- `C:\`
- `C:/`
- `OneDrive`
- `Google Drive`
- `Dropbox`
- `Downloads`
- `Documents`
- `Desktop`
- pastas temporárias;
- caminhos do projecto;
- network shares;
- cloud storage;
- fallback directories;
- environment variables.

Localizar configurações como:

- `knowledge_path`
- `legal_sources_path`
- `source_path`
- `registry_path`
- `fallback_path`
- `document_root`
- `knowledge_root`
- `minsa_path`

Responder explicitamente:

> De onde o sistema pensa que vem a legislação MINSA?

e:

> De onde a legislação realmente vem?

Criar comparação:

`EXPECTED SOURCE vs ACTUAL SOURCE`

---

# 11. INVESTIGAR ONEDRIVE E DISCO C

Determinar por que razão o agente tentou procurar legislação no:

- OneDrive;
- disco C:;
- ou outros directórios locais.

Identificar:

- código responsável;
- condição que activou a procura;
- fallback utilizado;
- ordem de prioridade das fontes;
- razão do fallback;
- se houve ausência de knowledge base;
- se houve falha no registry;
- se houve falha no retrieval;
- se a procura local foi comportamento previsto ou emergência.

Classificar:

`EXPECTED_BEHAVIOUR`

ou

`UNEXPECTED_FALLBACK`

---

# 12. MANIFESTOS DE HASHES

Localizar todos os manifestos de integridade.

Apresentar:

- nome;
- localização;
- algoritmo;
- conteúdo;
- hashes;
- timestamps;
- assinatura, quando existir.

Recalcular SHA-256 directamente dos ficheiros físicos actuais.

Comparar:

`DECLARED_HASH vs PHYSICAL_HASH`

Classificar:

- `MATCH`
- `MISMATCH`
- `HASH_NOT_FOUND`
- `FILE_NOT_FOUND`

---

# 13. LOGS DE INGESTÃO

Localizar logs que demonstrem:

`ficheiro encontrado`
→ `ficheiro lido`
→ `texto extraído`
→ `artigo identificado`
→ `chunk criado`
→ `embedding criado`
→ `índice actualizado`
→ `regra associada`
→ `Employee associado`

Apresentar timestamps reais.

Não substituir ausência de logs por descrição narrativa.

---

# 14. CONFIGURAÇÃO DO KNOWLEDGE ROUTER

Localizar o código/configuração responsável por:

`CLASSIFY_JURISDICTION`

`SELECT_REGISTRY`

`RESOLVE_DOCUMENT_IDENTITY`

Demonstrar como o sistema decidiu:

`AO`

→

`MINSA_REPAIRED_REGISTRY`

→

`Lei n.º 21-B/92`

Mostrar:

- código;
- regras;
- condições;
- mappings;
- fallback;
- confidence;
- eventuais hardcodes.

---

# 15. INVESTIGAR O PASS_EXACT_RAW_RUNTIME_RECEIPT

Localizar exactamente onde:

`PASS_EXACT_RAW_RUNTIME_RECEIPT`

é definido.

Demonstrar:

- função;
- classe;
- ficheiro;
- condições;
- critérios;
- asserts;
- thresholds;
- dependências.

Responder:

> O PASS resulta de validações independentes ou é simplesmente atribuído ao objecto final?

Se existir código semelhante a:

`status = "PASS_EXACT_RAW_RUNTIME_RECEIPT"`

sem validação real associada, marcar:

`PASS_STATUS_HARDCODE_RISK`

---

# 16. INVESTIGAR O GERADOR DOS RUNTIME RECEIPTS

Localizar código responsável por gerar:

- `execution_id`
- `test_id`
- `employee_id`
- `started_at`
- `completed_at`
- `router_events`
- `retrieved_chunk_ids`
- `retrieved_source_ids`
- `rules_applied`
- `citations`
- `final_output`
- `status`

Verificar se os valores vêm de:

- runtime real;
- mock;
- fixture;
- template;
- seed;
- faker;
- generator;
- loop;
- hardcode.

---

# 17. INVESTIGAR TEMPOS DE EXECUÇÃO

Foi identificado preliminarmente o padrão:

- TEST 001 = 120 ms
- TEST 011 = 120 ms
- TEST 021 = 120 ms

Investigar todos os testes.

Calcular:

- duração;
- média;
- mediana;
- mínimo;
- máximo;
- desvio padrão;
- percentis;
- frequência de durações idênticas.

Determinar se os timestamps são:

- capturados do runtime real;
- programaticamente calculados;
- previamente definidos.

Classificar:

`RUNTIME_TIMING_REALISTIC`

ou

`DETERMINISTIC_TIMING_PATTERN`

---

# 18. INVESTIGAR PARALELISMO

Os testes observados iniciam-se em intervalos extremamente pequenos e sobrepõem-se no tempo.

Verificar:

- workers;
- threads;
- processos;
- async tasks;
- queues;
- parallel test runner.

Se houver paralelismo, apresentar os respectivos IDs.

Se não houver evidência, marcar:

`PARALLEL_EXECUTION_NOT_PROVEN`

---

# 19. TEST RUNNER

Localizar o runner responsável por executar:

`TEST-MINSA-IDENTITY-*`

Apresentar:

- código;
- configuração;
- comando executado;
- environment;
- argumentos;
- logs brutos;
- número de workers;
- output bruto;
- exit code.

Determinar se é:

- pytest;
- Jest;
- Node;
- Python;
- Playwright;
- CI/CD;
- script próprio;
- outro.

---

# 20. RECOLHER TODOS OS EXEC-MINSA-IDENTITY

Exportar todos:

`EXEC-MINSA-IDENTITY-*`

Não seleccionar apenas exemplos.

Criar um inventário contendo:

- execution_id;
- test_id;
- employee_id;
- rule_id;
- source_id;
- chunk_id;
- document;
- artigo;
- duração;
- final_output;
- status.

---

# 21. TESTAR REPETIÇÃO DE OUTPUTS

Calcular similaridade entre todos os:

`final_output`

Identificar:

- outputs idênticos;
- templates;
- placeholders;
- frases fixas;
- respostas que não respondem à pergunta.

Classificar cada teste quanto a:

`TASK_FULFILLED`

ou

`TASK_NOT_FULFILLED`

---

# 22. NÃO CONFUNDIR RETRIEVAL COM RESPOSTA CORRECTA

Um teste não pode passar apenas porque encontrou:

- source_id;
- document_id;
- chunk_id;
- rule_id.

É obrigatório verificar se a resposta efectivamente satisfaz a consulta.

Exemplo:

Se a consulta for:

> Quais são os requisitos regulamentares?

a resposta deve apresentar os requisitos.

Uma resposta como:

> Consulta processada com proveniência verificada.

não constitui resposta substantiva.

---

# 23. DOCUMENTOS DE REPARAÇÃO ANTERIORES

Localizar relatórios relacionados com:

- MINSA repair;
- knowledge repair;
- registry reconstruction;
- index reconstruction;
- source authenticity;
- legal text extraction;
- rule derivation;
- employee retest;
- runtime proof.

Comparar:

`RELATÓRIO DECLARADO`

contra

`EVIDÊNCIA FÍSICA`

---

# 24. CLASSIFICAÇÃO FORENSE

Cada afirmação deve receber apenas uma destas classificações:

- `PROVEN`
- `SUPPORTED`
- `PLAUSIBLE`
- `NOT_PROVEN`
- `CONTRADICTED`
- `MISSING_EVIDENCE`
- `POTENTIALLY_SYNTHETIC`
- `MATERIAL_FAILURE`

Não utilizar `PASS` genérico.

---

# 25. ARTEFACTOS OBRIGATÓRIOS DE SAÍDA

Produzir:

## A. Physical Source Inventory

| source_id | documento | caminho | tamanho | SHA-256 | origem | estado |
|---|---|---|---:|---|---|---|

## B. Legal Knowledge Lineage

| diploma | artigo | source | chunk | rule | employee |
|---|---|---|---|---|---|

## C. Hash Verification Matrix

| ficheiro | hash declarado | hash físico | resultado |
|---|---|---|---|

## D. Runtime Receipt Audit

| teste | employee | regra | fonte | duração | output válido | authenticity |
|---|---|---|---|---:|---|---|

## E. Source Origin Audit

| conhecimento | origem esperada | origem real | fallback | problema |
|---|---|---|---|---|

## F. Evidence Gap Register

| ID | evidência necessária | encontrada? | impacto |
|---|---|---|---|

---

# 26. PROIBIÇÕES

Não:

- inventar ficheiros;
- regenerar provas desaparecidas;
- preencher hashes ausentes;
- criar timestamps retroactivos;
- criar logs retroactivos;
- assumir que um diploma está vigente;
- assumir que um artigo suporta uma regra;
- aceitar auto-declaração de PASS;
- aceitar apenas IDs sem objectos físicos;
- substituir evidência por narrativa.

---

# 27. RESULTADO FINAL

O relatório final deve responder inequivocamente:

### 1.
A biblioteca jurídica MINSA existe fisicamente?

### 2.
É possível provar a origem de cada documento?

### 3.
É possível provar a autenticidade dos bytes físicos?

### 4.
É possível provar como o texto jurídico foi extraído?

### 5.
É possível provar como cada regra DR-* foi derivada?

### 6.
É possível provar como os índices foram construídos?

### 7.
É possível provar que os Employees consultaram essas fontes?

### 8.
É possível provar que os runtime receipts resultam de execução real?

### 9.
Existe utilização de mocks, fixtures, hardcodes ou templates?

### 10.
Por que o sistema procurou legislação no OneDrive e disco C:?

### 11.
O conhecimento jurídico utilizado é realmente o conhecimento pretendido?

### 12.
Existe fundamento técnico suficiente para manter os `PASS` actualmente atribuídos?

---

# 28. REGRA FINAL DE DECISÃO

Só permitir novo:

`PASS`

quando estiver demonstrada, sem lacunas materiais, a cadeia:

**Physical Source**
→ **Physical Hash**
→ **Document Identity**
→ **Legal Text**
→ **Article**
→ **Chunk**
→ **Rule Derivation**
→ **Index**
→ **Employee Retrieval**
→ **Answer**
→ **Raw Runtime Evidence**

Se qualquer elo crítico não estiver provado:

`FINAL_STATUS = HOLD`

e não:

`PASS`.

---

# 29. PRIORIDADE DE EXECUÇÃO

Começar imediatamente por localizar:

1. `MINSA_REPAIRED_REGISTRY`
2. `SRC-MINSA-001`
3. `CHK-DR-*`
4. `DR-*`
5. código que gera `PASS_EXACT_RAW_RUNTIME_RECEIPT`
6. test runner de `TEST-MINSA-IDENTITY-*`
7. caminhos para `C:\`, OneDrive e outras fontes locais
8. manifestos de hashes
9. logs de ingestão
10. documentos jurídicos físicos utilizados

Não iniciar uma nova reparação antes de concluir esta recolha forense.

**Objectivo final: provar o que existe, de onde veio, como foi transformado e o que realmente foi executado.**
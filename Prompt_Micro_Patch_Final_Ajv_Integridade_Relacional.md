# Prompt — micro-patch final de Ajv, integridade relacional e encerramento no mesmo SHA

## Contexto

Repositório:

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

Último commit analisado:

```text
559313f9ba752a7ee2cb567be8bdffcf467dec93
```

Commit que contém a implementação anterior:

```text
c264f1647dfb430be85a2476706f675c8c598cab
```

A implementação anterior avançou materialmente nos três pilares:

- conta persistente activa do revisor;
- store com validações fail-closed;
- manifesto com verificação bidireccional.

Os testes existentes e a CI passaram, mas a auditoria física encontrou seis lacunas finais. Este trabalho deve ser exclusivamente um micro-patch correctivo. Não criar módulos, AI Employees, catálogos, integrações comerciais, novos fluxos operacionais ou arquitectura paralela.

## Objectivo

Eliminar os últimos fallbacks e ambiguidades, garantir que todos os recibos sejam validados por schemas Ajv reais, comparar integralmente os três planos de verdade e encerrar código, relatório e evidências no mesmo SHA.

Os três planos de verdade são:

```text
Ficheiro físico ↔ Recibo JSON ↔ Registo SQLite
```

Nenhum plano pode prevalecer isoladamente. Qualquer ausência ou divergência deve terminar com erro.

---

## 1. Eliminar definitivamente `existing.version ?? 1`

### Problema

Em `TransactionalPilotStore.updateTask()` permanece comportamento equivalente a:

```ts
const existingVersion = existing.version ?? 1;
```

Isso ainda fabrica a versão `1` quando o registo persistido estiver incompleto.

### Correcção obrigatória

- Remover `?? 1`, `|| 1` e qualquer equivalente usado para versão operacional.
- Exigir que `existing.version` exista, seja inteiro e seja maior ou igual a `1`.
- Se a versão persistida estiver ausente, for `null`, `undefined`, `NaN`, decimal, zero, negativa ou string, lançar erro antes do `UPDATE`.
- Não reparar silenciosamente registos legados.
- Se existir migração de dados antigos, executá-la como operação explícita, auditável e separada, nunca durante uma actualização normal.
- Aplicar a mesma regra a entregas, revisões, validações, outputs e geração do manifesto.

Pesquisar todo o repositório e eliminar fallbacks operacionais de versão, incluindo construções semanticamente equivalentes.

### Testes obrigatórios

1. `existing.version` ausente bloqueia `updateTask()`;
2. `null`, zero, valor negativo, decimal e string são rejeitados;
3. entrega não assume versão `1` quando `task.version` estiver ausente;
4. manifesto não assume versão por nome, posição ou valor por omissão;
5. versão válida e sequencial continua a funcionar.

---

## 2. Tornar o hash da tarefa obrigatório e imutável nas actualizações

### Problema

`saveTask()` valida `input_snapshot_sha256`, mas `updateTask()` ainda pode receber um objecto cujo hash foi removido, alterado ou substituído no `receipt_json`.

### Correcção obrigatória

Em todas as actualizações de tarefa:

- exigir `input_snapshot_sha256` com exactamente 64 caracteres hexadecimais;
- comparar com o valor persistido;
- rejeitar alteração, remoção, string vazia ou formato inválido;
- rejeitar divergência entre a coluna relacional e o `receipt_json`;
- preservar o hash original de entrada durante todo o ciclo da tarefa;
- não confundir o hash do snapshot de entrada com hashes de outputs ou documentos corrigidos.

Quando houver nova versão de documento:

- preservar `input_snapshot_sha256`;
- calcular novo `file_bytes_sha256` a partir dos novos bytes;
- persistir nova versão do output;
- criar novos recibos estrutural e independente;
- ligar explicitamente a nova versão à tarefa original.

Não aceitar hash fornecido pelo chamador sem recomputação quando existirem bytes físicos correspondentes.

### Testes obrigatórios

1. alteração de `input_snapshot_sha256` em `updateTask()` falha;
2. remoção do hash falha;
3. hash vazio ou malformado falha;
4. hash de input permanece igual depois de correcção documental;
5. hash de output divergente dos bytes falha;
6. falha não deixa actualização parcial no SQLite;
7. tarefa válida pode ser actualizada sem alterar o hash de entrada.

---

## 3. Validar todos os recibos por schemas Ajv reais

### Escopo dos schemas

Criar ou fortalecer schemas separados para, no mínimo:

```text
pilot-task-receipt.schema.json
pilot-document-validation-receipt.schema.json
pilot-human-review-receipt.schema.json
pilot-delivery-receipt.schema.json
pilot-evidence-manifest.schema.json
```

Utilizar Ajv em modo estrito e `ajv-formats` para datas e formatos aplicáveis.

### Requisitos mínimos dos schemas

Todos os schemas devem:

- declarar `$schema` e `$id` únicos;
- usar `type: object`;
- listar os campos obrigatórios em `required`;
- aplicar `additionalProperties: false`, salvo justificação física e documentada;
- validar UUIDs ou identificadores através de patterns claros;
- validar SHA-256 com pattern de 64 caracteres hexadecimais;
- validar timestamps com `format: date-time`;
- validar versões como inteiros positivos;
- limitar enums de estado, decisão, formato, origem e tipo de validação;
- exigir `tenant_id`, `pilot_id`, `task_id` e `commit_sha` onde forem relacionais;
- distinguir `INTERNAL_STRUCTURAL_VALIDATION` de `INDEPENDENT_LIBRARY_VALIDATION`;
- exigir os cinco timestamps forenses no recibo de revisão aceite;
- exigir identificadores e hashes físicos aplicáveis a cada tipo de recibo.

### Comportamento obrigatório

- Compilar os schemas antes de processar os recibos.
- Schema ausente, inválido ou não compilável deve falhar.
- Ajv ausente deve falhar.
- Todo recibo deve ser validado antes de participar no manifesto.
- Erros Ajv devem indicar ficheiro, schema, `instancePath`, `schemaPath` e mensagem.
- Não reduzir a validação a verificações manuais de dois ou três campos.
- Não converter tipos automaticamente.
- Não remover propriedades adicionais silenciosamente.
- Não usar `valid: true` perante schema ausente ou erro do validador.

### Testes obrigatórios

Para cada tipo de recibo, provar que:

1. recibo válido passa;
2. campo obrigatório ausente falha;
3. campo adicional não permitido falha;
4. hash inválido falha;
5. data inválida falha;
6. enum desconhecido falha;
7. versão inválida falha;
8. tenant, piloto ou SHA ausente falha;
9. schema ausente ou corrompido falha;
10. Ajv indisponível falha.

---

## 4. Comparar integralmente recibo, SQLite e manifesto

### Regra central

Não basta confirmar que existe algum registo com a mesma tarefa, versão ou tipo. Todos os campos autoritativos devem ser comparados.

Para cada entidade, validar campo a campo conforme aplicável:

- identificador do recibo;
- `task_id`;
- `document_id` ou `output_id`;
- `document_version`;
- `review_id`;
- `delivery_id`;
- `validation_type`;
- `tenant_id`;
- `pilot_id`;
- `employee_id`;
- `idempotency_key`;
- `received_at`;
- decisão e estado;
- hash de entrada;
- hash dos bytes do documento;
- hash do recibo;
- `commit_sha`;
- tipo MIME;
- origem;
- timestamps aplicáveis.

### Comparação criptográfica

- Recalcular o hash dos bytes físicos.
- Recalcular o hash do recibo segundo a serialização canónica definida pelo projecto.
- Comparar o resultado com SQLite e com o manifesto.
- Excluir correctamente o próprio campo de hash da pré-imagem, quando o formato do recibo assim o definir.
- Rejeitar qualquer divergência, mesmo quando `task_id`, versão e tipo coincidirem.

### Comparação relacional

- Confirmar que a tarefa pertence ao tenant e piloto indicados.
- Confirmar que o output pertence à tarefa e à versão indicadas.
- Confirmar que a validação se refere exactamente aos mesmos bytes.
- Confirmar que a revisão pertence ao desafio, tarefa, versão, revisor, tenant e piloto correctos.
- Confirmar que a entrega pertence à tarefa, revisão e versão aprovadas.
- Confirmar que todas as entradas usam o mesmo `commit_sha`.

### Verificação bidireccional

Manter e ampliar:

```text
SQLite/recibos → ficheiros físicos
ficheiros físicos → SQLite/recibos
```

Rejeitar:

- recibo adulterado que conserva apenas os campos usados na consulta;
- tenant ou piloto divergente;
- hash ou resultado divergente;
- `receipt_id` divergente;
- revisão ou entrega ligada à tarefa errada;
- registo sem ficheiro;
- ficheiro sem registo;
- ficheiro não indexado;
- relação ambígua;
- symlink ou path externo.

### Testes obrigatórios

Criar testes de adulteração isolada para cada campo autoritativo. Cada teste deve modificar apenas um campo e demonstrar falha.

Incluir pelo menos:

1. `tenant_id` divergente;
2. `pilot_id` divergente;
3. `receipt_id` divergente;
4. hash divergente;
5. resultado de validação divergente;
6. `commit_sha` divergente;
7. revisão ligada à tarefa errada;
8. entrega ligada à tarefa ou versão errada;
9. manifesto com tamanho ou MIME divergente;
10. recibo válido, SQLite coerente e bytes correspondentes passam.

---

## 5. Rejeitar nomes de output ambíguos

### Problema

O mapeamento actual utiliza comportamento equivalente a:

```ts
outputMap.set(out.file_name, relation);
```

Dois outputs com o mesmo `file_name` podem provocar substituição silenciosa no `Map`.

### Correcção obrigatória

- Não usar apenas `file_name` como chave relacional autoritativa.
- Preferir `output_id` persistente e caminho relativo canónico.
- Detectar duplicação de nome ou caminho antes de criar o mapa.
- Rejeitar colisões entre tarefas, versões ou tenants.
- Garantir que o caminho físico permanece dentro do directório autorizado.
- Impedir nomes vazios, absolutos, com `..`, separadores inesperados ou normalização ambígua.
- Se a aplicação exigir nomes iguais em pastas diferentes, usar chave composta inequívoca e verificar a relação completa.

### Testes obrigatórios

1. duas tarefas com o mesmo `file_name` são rejeitadas ou desambiguadas por relação física explícita;
2. dois outputs com o mesmo caminho são rejeitados;
3. nomes com path traversal são rejeitados;
4. diferenças apenas de maiúsculas em filesystem case-insensitive são tratadas como colisão;
5. `output_id` duplicado é rejeitado;
6. nomes inequívocos preservam a relação correcta no manifesto.

---

## 6. Encerrar código, relatório e três workflows no mesmo SHA

### Regra de commit único final

O relatório final deve ser preparado antes do commit definitivo e incluído no mesmo commit que contém:

- código;
- schemas;
- testes;
- workflows, se alterados;
- relatório técnico final.

Não criar depois um commit apenas documental para inserir IDs ou declarar sucesso.

Como os IDs e conclusões dos workflows só existem depois do push, não os grave num novo commit. Em vez disso:

- gere a atestação final como artefacto do workflow;
- preserve respostas físicas da API;
- inclua SHA, IDs, URLs, tempos, estado e conclusão nos artefactos não versionados;
- ligue esses artefactos criptograficamente ao SHA final;
- mantenha no relatório versionado apenas os campos que podem ser verdadeiros antes da execução, indicando que os resultados finais são emitidos pelos workflows.

### Workflows obrigatórios

No mesmo SHA final, concluir:

1. `CI / Production Readiness & Audit Gate`;
2. `Evidence Remote Verification`;
3. `Final Forensic Attestation & Audit Verification`.

Para cada execução, exigir da resposta física da API:

- repositório exacto;
- workflow exacto;
- `head_sha` igual ao SHA final;
- `run_id`;
- `run_attempt` real;
- URL;
- `status: completed`;
- `conclusion: success`;
- `created_at`, `run_started_at` e `updated_at`;
- hash do ficheiro físico da resposta.

Não declarar sucesso antes da conclusão real. A atestação final deve verificar as respostas preservadas, não apenas variáveis ou resumos produzidos pelo próprio projecto.

---

## Verificações obrigatórias num checkout limpo

Executar no SHA final:

```bash
npm ci
npm audit --omit=dev
npm run verify
npm run pilot:simulation:execute
npm run pilot:simulation:recover-and-verify
npm run evidence:generate
npm run verify:evidence-artifact
```

Todos os comandos devem terminar com exit code `0`.

Depois das verificações:

```bash
git status --short
```

deve produzir saída vazia. Os geradores não podem alterar ficheiros versionados.

## Regressões que devem permanecer bloqueadas

Confirmar que continuam válidos:

- conta persistente activa obrigatória para o revisor;
- token, identidade e sessão exactos;
- funções e permissões persistidas;
- validação independente prévia por `pdf-lib`, `mammoth` e `exceljs`;
- recibos estrutural e independente separados;
- `idempotency_key` e `received_at` sem fallback;
- hashes recalculados a partir dos bytes;
- cinco timestamps forenses separados;
- desafio consumido uma única vez;
- persistência SQLite recuperável noutro processo;
- proibição de symlinks e path traversal;
- identidade de SHA em todas as evidências.

## Critérios de aceitação

O micro-patch só pode ser declarado concluído quando:

1. não existir fallback operacional de versão;
2. o hash de entrada da tarefa for obrigatório e imutável;
3. os cinco tipos de recibos forem validados por schemas Ajv reais;
4. schema ou Ajv ausente provocar falha;
5. recibo, SQLite, bytes e manifesto forem comparados integralmente;
6. qualquer adulteração isolada provocar falha;
7. nomes ou caminhos ambíguos forem rejeitados;
8. todos os testes positivos e negativos passarem;
9. a instalação, auditoria e verificação local passarem num checkout limpo;
10. a árvore permanecer limpa;
11. os três workflows concluírem com sucesso no mesmo SHA;
12. o relatório versionado pertencer ao mesmo SHA do código;
13. nenhum commit documental posterior for criado para alterar a conclusão;
14. a atestação remota consumir respostas físicas da API e verificar os respectivos hashes.

## Entrega esperada

Entregar:

1. SHA final único;
2. comparação com `559313f9ba752a7ee2cb567be8bdffcf467dec93`;
3. lista de ficheiros modificados;
4. schemas adicionados ou alterados;
5. matriz `Requisito → Teste → Evidência`;
6. resultados dos testes negativos de adulteração;
7. comandos locais e exit codes;
8. prova de árvore limpa;
9. hashes dos recibos, schemas, manifesto e respostas da API;
10. dados físicos dos três workflows no SHA final;
11. limitações ainda existentes;
12. classificação final tecnicamente defensável.

## Classificação permitida

Somente depois de todos os critérios acima estarem comprovados, a classificação máxima permitida é:

```text
OPERATIONAL_PILOT_INFRASTRUCTURE_READY — AUTHENTICATED HUMAN REVIEW GATE READY — FAIL-CLOSED PERSISTENCE, AJV RECEIPTS AND RELATIONAL MANIFEST VERIFIED — REAL PILOT NOT YET EXECUTED
```

Não declarar `PRODUCTION READY`, piloto real executado, revisão humana real concluída ou entrega operacional real sem evidência externa autêntica ligada ao mesmo SHA.

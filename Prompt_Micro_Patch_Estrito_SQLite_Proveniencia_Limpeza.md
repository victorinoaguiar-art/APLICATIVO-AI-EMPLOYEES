# Prompt — micro-patch final de Ajv estrito, verdade SQLite, proveniência e limpeza determinística

## Contexto

Repositório:

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

Commit de referência auditado:

```text
dba1cbdcb0fc25cb44d0da7d26dc995a6729ca7c
```

O commit de referência implementou os cinco schemas Ajv, imutabilidade do hash de entrada, remoção do fallback principal de versão, comparação de recibos e controlo de colisões de outputs. Os testes e os três workflows terminaram com sucesso no mesmo SHA.

Contudo, a auditoria física identificou quatro lacunas finais:

1. o Ajv está configurado com `strict: false`;
2. parte da comparação apresentada como SQLite independente usa dados desserializados do próprio `receipt_json`;
3. alguns recibos não transportam tenant, SHA, versão e relação de revisão suficientes;
4. `npm run verify` pode deixar `generated/tmp_test_evidence_coherence/` como resíduo não versionado.

## Regra de escopo

Não criar outro módulo, AI Employee, catálogo, conector, fluxo comercial ou integração externa.

Corrigir somente os quatro pontos deste prompt. Preservar os fluxos operacionais, a arquitectura SQLite, os schemas existentes, os validadores físicos, os workflows e a classificação limitada ao piloto ainda não executado.

---

## 1. Activar Ajv com `strict: true` e corrigir os schemas

### Problema identificado

`PilotAjvValidator` utiliza configuração equivalente a:

```ts
new AjvClass({
  allErrors: true,
  strict: false
});
```

O relatório classifica os schemas como estritos, mas o compilador desactiva o modo estrito do Ajv.

### Correcção obrigatória

Configurar explicitamente:

```ts
new AjvClass({
  allErrors: true,
  strict: true,
  coerceTypes: false,
  removeAdditional: false,
  useDefaults: false
});
```

Manter `ajv-formats` para `date-time` e outros formatos utilizados.

Corrigir cada schema até compilar verdadeiramente em modo estrito. Não contornar erros com:

- `strict: false`;
- `strictSchema: false`;
- supressão de warnings;
- conversão automática de tipos;
- remoção silenciosa de propriedades;
- inserção automática de defaults;
- captura vazia de erros de compilação.

### Requisitos dos cinco schemas

Revalidar:

```text
pilot-task-receipt.schema.json
pilot-document-validation-receipt.schema.json
pilot-human-review-receipt.schema.json
pilot-delivery-receipt.schema.json
pilot-evidence-manifest.schema.json
```

Cada schema deve possuir:

- `$schema` compatível com a versão do Ajv instalada;
- `$id` único;
- `type` explícito;
- `required` completo;
- `additionalProperties: false`;
- formatos e patterns válidos;
- enums completos;
- versões como inteiros positivos;
- hashes SHA-256 como 64 caracteres hexadecimais;
- timestamps com `format: date-time`;
- identificadores com limites e patterns documentados;
- relações condicionais através de `if/then`, `oneOf` ou `allOf`, quando aplicável.

### Testes obrigatórios

Adicionar testes que comprovem:

1. a instância real do Ajv utiliza `strict: true`;
2. os cinco schemas compilam em modo estrito;
3. schema com keyword desconhecida falha;
4. schema com formato desconhecido falha;
5. propriedade adicional não é removida e provoca falha;
6. string não é convertida automaticamente em número;
7. campo ausente não recebe default;
8. schema ausente, corrompido ou não compilável falha;
9. todos os recibos válidos existentes continuam a passar;
10. os erros preservam `instancePath`, `schemaPath`, keyword e mensagem.

---

## 2. Comparar colunas SQLite independentes com `receipt_json`, ficheiros e manifesto

### Problema identificado

Os métodos actuais, incluindo equivalentes a:

```ts
getTask()
listReviewsForTask()
getDeliveryForTask()
```

devolvem objectos desserializados de `receipt_json`. Comparar o ficheiro exportado com esses objectos prova apenas que o ficheiro corresponde ao JSON armazenado, mas não prova que o JSON corresponde às colunas relacionais independentes.

### Quatro planos de verdade obrigatórios

O verificador deve confrontar independentemente:

```text
Colunas SQLite ↔ receipt_json SQLite ↔ ficheiro físico ↔ manifesto
```

Quando existirem bytes binários:

```text
Colunas SQLite ↔ BLOB SQLite ↔ ficheiro físico ↔ recibo ↔ manifesto
```

### Correcção obrigatória

Criar consultas forenses read-only que retornem separadamente:

- colunas relacionais cruas;
- texto bruto de `receipt_json`;
- objecto JSON desserializado;
- BLOB físico, quando aplicável;
- hash armazenado;
- relações por chave estrangeira.

Não utilizar `getTask()` ou métodos que retornam apenas o `receipt_json` como prova das colunas relacionais.

Para cada entidade, comparar pelo menos:

#### Tarefa

- `task_id`;
- `pilot_id`;
- `tenant_id`;
- `employee_id`;
- `idempotency_key`;
- `requested_by`;
- `human_review_status`;
- `delivery_status`;
- `final_status`;
- `version`;
- `input_snapshot_sha256`;
- `received_at`/`created_at` segundo a semântica definida;
- `receipt_sha256`.

#### Output

- `output_id`;
- `task_id`;
- versão;
- nome e caminho;
- BLOB;
- `file_bytes_sha256`;
- estado activo;
- MIME físico;
- tamanho dos bytes.

#### Validação documental

- `receipt_id`;
- `task_id`;
- versão;
- tipo de validação;
- tenant e piloto;
- hash dos bytes;
- resultado;
- parser e versão;
- `commit_sha`;
- `receipt_sha256`;
- timestamps.

#### Revisão

- `review_id`;
- `task_id`;
- `pilot_id`;
- `tenant_id`;
- versão documental;
- `challenge_id`;
- revisor;
- decisão;
- assinatura;
- hashes anterior e novo;
- cinco timestamps;
- `commit_sha`;
- `receipt_sha256`.

#### Entrega

- `delivery_id`;
- `task_id`;
- `pilot_id`;
- `tenant_id`;
- versão documental;
- `review_id` autorizador;
- destino e canal;
- estado;
- hashes dos outputs;
- `commit_sha`;
- `receipt_sha256`;
- timestamp.

### Regras de falha

Qualquer divergência entre uma coluna relacional e o `receipt_json` deve bloquear:

- geração do manifesto;
- emissão da atestação;
- entrega;
- promoção de classificação.

Não reparar ou sincronizar automaticamente durante a verificação.

### Testes obrigatórios de adulteração independente

Utilizar uma base temporária real e alterar directamente apenas um plano de verdade por teste:

1. alterar `pilot_tasks.version` sem alterar `receipt_json`;
2. alterar `pilot_tasks.tenant_id` sem alterar `receipt_json`;
3. alterar `pilot_tasks.input_snapshot_sha256` sem alterar `receipt_json`;
4. alterar somente `receipt_json`, mantendo as colunas intactas;
5. alterar o BLOB, mantendo o hash e o ficheiro;
6. alterar `file_bytes_sha256`, mantendo BLOB e ficheiro;
7. alterar a coluna de decisão da revisão, mantendo o JSON;
8. alterar a coluna de estado ou destino da entrega, mantendo o JSON;
9. alterar tenant ou piloto da validação documental;
10. alterar somente o ficheiro exportado;
11. alterar somente a entrada do manifesto;
12. provar que uma cadeia integralmente coerente passa.

Cada adulteração deve produzir mensagem que identifique entidade, campo e planos divergentes.

---

## 3. Acrescentar tenant, SHA, versão e ligação à revisão nos recibos aplicáveis

### Objectivo

Cada recibo deve ser auto-suficiente para provar a sua pertença ao mesmo tenant, piloto, tarefa, versão e commit, sem depender de inferência pelo nome do ficheiro.

### Campos obrigatórios

#### Recibo de tarefa

Adicionar e exigir:

- `commit_sha`;
- `tenant_id`;
- `pilot_id`;
- `version`;
- `input_snapshot_sha256`;
- `receipt_sha256`.

#### Recibo de validação documental

Manter e exigir:

- `commit_sha`;
- `tenant_id`;
- `pilot_id`;
- `task_id`;
- `document_version`;
- `validation_type`;
- `file_bytes_sha256`;
- `receipt_sha256`.

#### Recibo de revisão humana

Adicionar e exigir:

- `tenant_id`;
- `commit_sha`;
- `document_version`;
- `challenge_id`;
- `task_id`;
- `pilot_id`;
- `review_id`;
- hashes anterior e novo;
- cinco timestamps forenses;
- `receipt_sha256`.

#### Recibo de entrega

Adicionar e exigir:

- `tenant_id`;
- `commit_sha`;
- `document_version`;
- `review_id` que autorizou a entrega;
- `task_id`;
- `pilot_id`;
- `delivery_id`;
- hashes dos outputs;
- `receipt_sha256`.

### Relações obrigatórias

- A versão da revisão deve corresponder à versão efectivamente revista.
- A entrega deve referenciar a revisão aceite que autorizou aquela versão.
- O hash entregue deve corresponder ao output aprovado pela revisão.
- Tenant, piloto e SHA devem ser iguais em tarefa, validações, revisão, entrega e manifesto.
- A correcção documental deve criar nova versão e nova revisão antes de permitir entrega.
- Não inferir `review_id`, versão ou tenant pelo nome do ficheiro.

### Persistência

Adicionar colunas relacionais quando necessárias, com migração explícita e fail-closed:

- não usar valores default fabricados;
- não preencher registos antigos durante leitura normal;
- não aceitar `NULL` no fluxo operacional novo;
- validar foreign keys e índices únicos;
- persistir os campos no `receipt_json` e nas colunas independentes;
- incluir os campos na pré-imagem canónica do `receipt_sha256`.

### Testes obrigatórios

1. revisão sem tenant falha;
2. revisão sem SHA falha;
3. revisão sem versão ou desafio falha;
4. entrega sem `review_id` falha;
5. entrega ligada a revisão rejeitada ou de outra versão falha;
6. entrega ligada a outro tenant ou piloto falha;
7. SHA divergente entre tarefa e revisão falha;
8. SHA divergente entre revisão e entrega falha;
9. hash entregue diferente do output aprovado falha;
10. cadeia tarefa → validação → revisão → entrega válida passa.

---

## 4. Usar directórios temporários reais e garantir árvore limpa

### Problema identificado

Após `npm run verify`, a auditoria encontrou:

```text
?? generated/tmp_test_evidence_coherence/
```

O teste utiliza um caminho fixo dentro do repositório, o que pode deixar resíduos e criar colisões entre testes executados em paralelo.

### Correcção obrigatória

- Substituir directórios fixos por `fs.mkdtempSync()` ou `fs.promises.mkdtemp()`.
- Criar os directórios sob `os.tmpdir()` ou outra área temporária fora da árvore Git.
- Utilizar prefixo específico do teste.
- Guardar o caminho exacto retornado por `mkdtemp`.
- Limpar em `after()`, `afterEach()` ou `finally`, conforme a estrutura dos testes.
- Fazer a limpeza suportar Windows, Linux e macOS.
- Não ignorar erros de limpeza relevantes.
- Não resolver o problema adicionando o directório ao `.gitignore`.
- Não executar `git checkout`, `git clean`, `rm -rf` na raiz ou restauração artificial da árvore.

### Concorrência e isolamento

- Cada teste ou suite paralela deve possuir directório exclusivo.
- Nenhum teste deve partilhar o mesmo SQLite, directório de evidências ou ficheiro temporário mutável.
- O teste deve limpar recursos mesmo quando uma asserção falhar.
- Bases SQLite devem ser fechadas antes da remoção, especialmente no Windows.

### Testes obrigatórios

1. duas suites paralelas recebem caminhos diferentes;
2. uma falha intencional ainda remove o directório temporário;
3. a limpeza funciona com separadores Windows e POSIX;
4. nenhum ficheiro é criado em `generated/tmp_test_evidence_coherence`;
5. executar a suite duas vezes consecutivas produz os mesmos resultados;
6. executar `npm run verify` deixa `git status --short` vazio;
7. executar `npm run verify` uma segunda vez continua a deixar a árvore limpa.

---

## Verificações obrigatórias num checkout limpo

Executar, no mínimo:

```bash
npm ci
npm audit --omit=dev
npm run verify
git status --short
npm run verify
git status --short
npm run pilot:simulation:execute
npm run pilot:simulation:recover-and-verify
npm run evidence:generate
npm run verify:evidence-artifact
git status --short
```

Requisitos:

- todos os comandos devem terminar com exit code `0`;
- todas as três execuções de `git status --short` devem produzir saída vazia;
- não pode ser necessário apagar, reverter ou ignorar ficheiros para obter a árvore limpa;
- geradores e testes devem ser read-only relativamente aos ficheiros versionados;
- os artefactos permitidos devem ser criados apenas em directórios não versionados previamente definidos.

## GitHub Actions e SHA final

Incluir código, schemas, migrações, testes e relatório técnico no mesmo commit final.

Depois do push, concluir no mesmo `head_sha`:

1. `CI / Production Readiness & Audit Gate`;
2. `Evidence Remote Verification`;
3. `Final Forensic Attestation & Audit Verification`.

Não criar um commit documental posterior para inserir IDs ou conclusões.

Preservar como artefactos não versionados as respostas físicas da API contendo:

- repositório;
- workflow;
- `head_sha`;
- `run_id`;
- `run_attempt`;
- URL;
- `status: completed`;
- `conclusion: success`;
- `created_at`;
- `run_started_at`;
- `updated_at`;
- hash SHA-256 da própria resposta.

## Critérios de aceitação

O micro-patch só pode ser declarado concluído quando:

1. Ajv executar com `strict: true`;
2. os cinco schemas compilarem sem qualquer desactivação de rigor;
3. tipos não forem convertidos e defaults não forem inseridos;
4. colunas SQLite forem lidas e comparadas separadamente do `receipt_json`;
5. adulterações isoladas das colunas relacionais forem detectadas;
6. BLOB, hash, ficheiro, recibo e manifesto forem coerentes;
7. recibos possuírem tenant, piloto, SHA e versão aplicáveis;
8. revisão possuir `challenge_id` e versão documental;
9. entrega possuir `review_id` autorizador e versão documental;
10. relações tarefa → validação → revisão → entrega forem verificadas;
11. os testes não criarem resíduos na árvore Git;
12. duas execuções consecutivas de `npm run verify` passarem com árvore limpa;
13. os três workflows passarem no mesmo SHA;
14. não existir commit documental posterior;
15. o relatório não exceder o que as evidências físicas comprovam.

## Entrega esperada

Apresentar:

1. SHA final;
2. comparação com `dba1cbdcb0fc25cb44d0da7d26dc995a6729ca7c`;
3. ficheiros e migrações alterados;
4. configuração efectiva do Ajv;
5. schemas e respectivos hashes;
6. matriz `Campo → Coluna SQLite → receipt_json → ficheiro → manifesto`;
7. testes de adulteração de cada plano de verdade;
8. testes de proveniência de revisão e entrega;
9. duas execuções consecutivas de `npm run verify`;
10. três provas de `git status --short` vazio;
11. IDs, URLs, SHA, tentativa, estado e conclusão dos três workflows;
12. limitações ainda existentes;
13. classificação final tecnicamente defensável.

## Classificação permitida

Somente após o cumprimento integral dos critérios, a classificação máxima permitida é:

```text
OPERATIONAL_PILOT_INFRASTRUCTURE_READY — STRICT AJV VERIFIED — INDEPENDENT SQLITE, RECEIPT, FILE AND MANIFEST CONSISTENCY VERIFIED — CLEAN DETERMINISTIC VERIFICATION CONFIRMED — REAL PILOT NOT YET EXECUTED
```

Não declarar `PRODUCTION READY`, piloto real concluído, revisão humana real concluída ou entrega operacional real sem evidência externa autêntica ligada ao mesmo SHA.

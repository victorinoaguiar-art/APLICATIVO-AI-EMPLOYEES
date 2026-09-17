# Prompt — micro-patch final de identidade persistente, store fail-closed e manifesto relacional

## Contexto

Repositório:

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

Commit de referência auditado:

```text
db780b302674385d858315152308624241847b18
```

O commit de referência implementou avanços materiais na autenticação da revisão operacional, na validação independente de PDF, DOCX e XLSX, na separação dos recibos e na cronologia forense da revisão. A instalação limpa, o `npm audit --omit=dev`, o `npm run verify` e as três execuções do GitHub Actions terminaram com sucesso.

Contudo, a auditoria física do código identificou três lacunas fail-closed que ainda impedem o encerramento técnico desta fase.

## Regra de escopo

Não criar outro módulo, Employee, catálogo, fluxo comercial, integração externa ou arquitectura paralela.

Executar somente um micro-patch correctivo sobre:

1. vínculo persistente obrigatório do revisor;
2. remoção de fallbacks na store;
3. validação relacional estrita do manifesto.

Preservar os fluxos, recibos, schemas, testes e workflows já existentes, alterando apenas o necessário para fechar estes três pontos.

---

## 1. Rejeitar revisores sem conta persistente activa

### Problema identificado

Em `PilotExternalValidator.validateReviewerToken()`, a conta persistente é verificada apenas quando `TokenService.getAccount()` devolve um registo. Quando a conta não existe, o fluxo pode continuar e devolver `isValid: true` com base apenas nos claims do token.

O modo operacional não pode considerar os claims do token como substitutos do vínculo persistente.

### Correcção obrigatória

No modo `OPERATIONAL_PILOT`, exigir cumulativamente:

- `TokenService` real e disponível;
- token válido, não expirado e não revogado;
- conta persistente existente para a identidade exacta do revisor;
- conta com estado `ACTIVE`;
- `tenant_id` persistido exactamente igual ao tenant do piloto;
- identidade persistida exactamente igual ao revisor declarado;
- funções persistidas que incluam `HUMAN_REVIEWER` ou `ADMIN`;
- permissão persistida `PILOT_REVIEW`;
- sessão persistente activa, não expirada e ligada ao mesmo token, revisor, tenant e piloto.

Se `getAccount()` devolver `null`, `undefined`, erro ou resultado incompleto, a revisão deve falhar de forma fechada antes da validação da assinatura e antes do consumo do desafio.

Não permitir que funções e permissões presentes apenas no token elevem privilégios que não existam na conta persistente.

### Comportamento esperado

Exemplo conceptual:

```ts
const account = tokenService.getAccount(expectedReviewerId);

if (!account) {
  return {
    isValid: false,
    error: `Vínculo persistente do revisor '${expectedReviewerId}' não encontrado.`
  };
}
```

Não copiar literalmente se a arquitectura possuir uma solução mais apropriada, mas preserve obrigatoriamente a semântica fail-closed.

### Testes obrigatórios

Adicionar testes que comprovem:

1. token criptograficamente válido, mas conta inexistente, é rejeitado;
2. conta `SUSPENDED`, `REVOKED` ou inactiva é rejeitada;
3. conta persistida noutro tenant é rejeitada;
4. função presente somente no token não autoriza a revisão;
5. permissão presente somente no token não autoriza a revisão;
6. conta activa, mas sessão inexistente ou incompatível, é rejeitada;
7. conta, token e sessão integralmente válidos permitem a revisão;
8. nenhuma rejeição consome ou altera o estado do desafio.

---

## 2. Remover fallbacks de `idempotency_key`, `received_at`, versão e hash na store

### Problema identificado

`TransactionalPilotStore` ainda contém construções equivalentes a:

```ts
task.idempotency_key || task.task_id
task.received_at || new Date().toISOString()
task.version || 1
task.input_snapshot_sha256 || ''
```

Embora o executor principal valide alguns destes campos, chamadas directas ao motor ou à store ainda podem fabricar, substituir ou esvaziar valores operacionais.

### Correcção obrigatória

Na fronteira de persistência, validar antes de qualquer `INSERT`, `UPDATE` ou transacção:

- `idempotency_key` presente, não vazia e exactamente igual à recebida;
- `received_at` presente, válido e exactamente igual ao valor externo;
- `version` presente, inteiro positivo e coerente com a versão física do documento;
- `input_snapshot_sha256` presente e correspondente a um SHA-256 hexadecimal de 64 caracteres;
- `task_id`, `tenant_id`, `pilot_id` e `employee_id` presentes;
- ausência de divergência entre o objecto persistido, o recibo JSON e as colunas relacionais.

Eliminar fallbacks silenciosos. A ausência ou invalidade deve lançar erro explícito e impedir a persistência.

Não substituir valores por:

- `task_id`;
- hora actual;
- versão `1`;
- string vazia;
- valor da configuração global;
- valor anteriormente persistido sem comparação explícita.

### Regras de actualização

Em actualizações:

- não permitir redução da versão;
- não permitir salto de versão sem recibo físico correspondente;
- não permitir alterar `idempotency_key` ou `received_at` depois da criação;
- não permitir substituir o hash sem novos bytes, nova versão e novos recibos;
- rejeitar discrepância entre hash calculado dos bytes e hash declarado;
- preservar atomicidade entre tarefa, output, versão e recibos.

### Testes obrigatórios

Adicionar testes directos sobre a store, sem passar pelo script principal:

1. ausência de `idempotency_key` falha;
2. ausência de `received_at` falha;
3. ausência ou invalidade de `version` falha;
4. ausência, string vazia ou formato inválido de hash falha;
5. tentativa de mudar `idempotency_key` falha;
6. tentativa de mudar `received_at` falha;
7. hash divergente dos bytes falha;
8. redução ou salto injustificado de versão falha;
9. nenhum erro deixa registo parcial na base;
10. registo completo e coerente é persistido e relido sem transformação.

---

## 3. Fazer o manifesto falhar perante recibos inválidos, relações ausentes ou versões não comprovadas

### Problemas identificados

O gerador do manifesto ainda possui comportamento equivalente a:

```ts
docVersion = parsed.version || 1;
```

Também existem blocos equivalentes a:

```ts
try {
  // leitura do recibo
} catch {}
```

Este comportamento permite que JSON inválido, versão ausente ou relações não comprovadas sejam silenciosamente omitidos do manifesto.

### Correcção obrigatória

O manifesto deve ser construído exclusivamente com dados físicos provenientes de:

- recibos JSON válidos e validados por schema;
- relações persistidas no SQLite;
- bytes físicos existentes e relidos;
- hashes recalculados durante a geração;
- SHA real do checkout ou `GITHUB_SHA`, sem fallback fabricado.

Para cada ficheiro, conforme o respectivo tipo, exigir e confirmar:

- `task_id`;
- `document_id` ou `output_id`;
- `document_version`;
- `review_id`;
- `delivery_id`;
- `validation_type`;
- `tenant_id`;
- `pilot_id`;
- `commit_sha`;
- hash e tamanho dos bytes físicos;
- origem e tipo MIME;
- relação com a tarefa e versão correspondentes no SQLite.

Não inferir identificadores ou versões pelo nome do ficheiro.

Não utilizar:

- `parsed.version || 1`;
- regex sobre nomes para reconstruir relações;
- `catch {}` vazio;
- classificação genérica para esconder relações obrigatórias ausentes;
- registos parciais com campos relacionais omitidos.

### Falha obrigatória

A geração deve terminar com exit code diferente de zero quando encontrar:

- recibo JSON inválido;
- schema ausente ou inválido;
- campo obrigatório ausente;
- versão não comprovada;
- tarefa, revisão, validação ou entrega órfã;
- relação ambígua;
- divergência entre recibo e SQLite;
- divergência de tenant ou piloto;
- hash divergente;
- ficheiro sem índice;
- registo no SQLite sem ficheiro ou recibo correspondente;
- ficheiro físico sem relação autoritativa;
- symlink ou path traversal;
- SHA ausente, inválido ou divergente.

### Verificação bidireccional

Implementar ou fortalecer uma verificação nos dois sentidos:

```text
SQLite/recibos → ficheiros físicos
ficheiros físicos → SQLite/recibos
```

Nenhum registo ou ficheiro abrangido pelo piloto pode ficar órfão.

### Testes obrigatórios

Adicionar testes que comprovem:

1. recibo JSON corrompido bloqueia o manifesto;
2. tarefa sem `version` bloqueia o manifesto;
3. versão `2` não pode ser convertida silenciosamente em versão `1`;
4. documento sem tarefa correspondente no SQLite bloqueia o manifesto;
5. revisão ou entrega órfã bloqueia o manifesto;
6. recibo com tenant ou piloto divergente bloqueia o manifesto;
7. relação divergente entre recibo e SQLite bloqueia o manifesto;
8. ficheiro não indexado ou registo sem ficheiro bloqueia o manifesto;
9. hash divergente bloqueia o manifesto;
10. manifesto válido preserva exactamente todos os identificadores e versões físicas;
11. entregas com identificadores aleatórios mantêm a relação correcta sem análise do nome;
12. versões corrigidas aparecem com a versão física correcta;
13. ausência de SHA falha sem fallback;
14. todas as entradas pertencem ao mesmo SHA.

---

## Verificações de regressão

O patch não pode quebrar os controlos já validados. Confirmar que continuam a passar:

- token, identidade e sessão obrigatórios na revisão operacional;
- validação prévia por `pdf-lib`, `mammoth` e `exceljs`;
- recibos distintos `INTERNAL_STRUCTURAL_VALIDATION` e `INDEPENDENT_LIBRARY_VALIDATION`;
- bloqueio do desafio quando qualquer validação estiver ausente ou falhar;
- preservação exacta de `idempotency_key`, `received_at`, tenant e piloto;
- cinco timestamps forenses separados;
- consumo atómico e não reutilizável do desafio;
- recuperação da mesma base SQLite num segundo processo;
- rejeição de symlinks e paths externos;
- identidade de SHA em todos os recibos e evidências.

## Execução obrigatória

Num checkout limpo do novo SHA, executar:

```bash
npm ci
npm audit --omit=dev
npm run verify
npm run pilot:simulation:execute
npm run pilot:simulation:recover-and-verify
npm run verify:evidence-artifact
```

Todos os comandos devem terminar com exit code `0`.

Depois da execução:

```bash
git status --short
```

deve produzir saída vazia.

## GitHub Actions

Executar no mesmo SHA:

1. CI principal;
2. verificação remota das evidências;
3. atestação forense final.

Para cada execução, preservar e reportar:

- `head_sha`;
- `run_id`;
- `run_attempt`;
- repositório;
- workflow;
- URL;
- `status: completed`;
- `conclusion: success`;
- início e conclusão obtidos da API;
- hashes dos ficheiros físicos preservados.

Não declarar conclusão enquanto qualquer execução estiver pendente.

## Critérios de aceitação final

Este micro-patch somente pode ser considerado aprovado quando:

1. revisor sem conta persistente activa for sempre rejeitado;
2. funções e permissões do token não substituírem as persistidas;
3. não existir fallback para `idempotency_key`, `received_at`, versão ou hash na store;
4. chamadas directas à store falharem perante campos ausentes ou inválidos;
5. o manifesto falhar perante qualquer recibo inválido ou relação incompleta;
6. não existir `catch {}` que silencie erro de proveniência;
7. não existir versão assumida por omissão;
8. todas as relações forem verificadas bidireccionalmente;
9. os testes negativos demonstrarem a falha fechada;
10. instalação, auditoria, verificação e CI passarem no mesmo SHA;
11. a árvore permanecer limpa;
12. nenhuma evidência ou relatório fizer afirmação superior ao que os ficheiros comprovam.

## Entrega esperada

Apresentar no relatório final:

1. SHA completo do micro-patch;
2. comparação com `db780b302674385d858315152308624241847b18`;
3. ficheiros alterados;
4. explicação das três correcções;
5. testes novos, incluindo todos os testes negativos;
6. comandos executados e exit codes;
7. prova de árvore limpa;
8. recibos e manifestos gerados, com hashes;
9. execuções do GitHub Actions com ID, URL, SHA, tentativa, estado e conclusão;
10. limitações ainda existentes;
11. classificação final tecnicamente defensável.

## Classificação permitida

Se todos os critérios forem comprovados, mas ainda não existir execução de piloto real com fontes e revisores externos autênticos, a classificação máxima permitida é:

```text
OPERATIONAL_PILOT_INFRASTRUCTURE_READY — AUTHENTICATED HUMAN REVIEW GATE READY — FAIL-CLOSED PERSISTENCE AND MANIFEST PROVENANCE VERIFIED — REAL PILOT NOT YET EXECUTED
```

Não declarar `PRODUCTION READY`, piloto real concluído, revisão humana real concluída ou entrega operacional real sem evidência externa autêntica ligada ao mesmo SHA.

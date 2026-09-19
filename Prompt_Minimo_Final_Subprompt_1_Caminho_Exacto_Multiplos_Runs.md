# Prompt Mínimo Final do Subprompt 1 — Caminho Exato e Múltiplos Runs Reais

## Repositório

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

## Baseline obrigatória

```text
4f304edc44e6f8ea9157db46102ca6a59caf30a2
```

Confirme que `master` continua exatamente neste SHA. Se tiver avançado, não altere o repositório e reporte o novo SHA.

---

## Objetivo único

Fechar apenas os dois pontos residuais abaixo:

1. remover a autenticação de ficheiros pelo basename e exigir o caminho relativo canónico exato no índice SHA-256;
2. substituir os testes de múltiplos runs por testes em que dois pares completos sejam realmente apresentados ao código de produção, incluindo cenário contraditório que falhe.

Não altere nenhuma outra regra do verificador. Não execute a cadeia operacional.

---

## 1. Correspondência exata do caminho no índice SHA-256

### Problema atual

O índice regista também o basename:

```javascript
indexMap.set(path.basename(normalized), expectedHash);
```

E a validação permite fallback:

```javascript
indexMap.get(normalizedRel) || indexMap.get(baseName)
```

Isso pode autenticar um ficheiro por meio da entrada de outro ficheiro com o mesmo nome-base, mas localizado noutro diretório.

### Correção obrigatória

Use exclusivamente o caminho relativo canónico exato:

```javascript
const expectedHash = indexMap.get(normalizedRel);
```

Regras:

- não registar alias por basename;
- não procurar por basename;
- não aceitar caminhos parciais;
- normalizar separadores de forma determinística;
- rejeitar `..`, caminhos absolutos e caminhos que escapem do diretório extraído;
- rejeitar duas entradas do índice para o mesmo caminho canónico;
- rejeitar hash malformado;
- rejeitar ficheiro cujo caminho exato não esteja no índice.

### Testes obrigatórios

1. `evidence/stage-a-linkage.json` indexado e o mesmo caminho físico passa;
2. apenas `evidence/stage-a-linkage.json` indexado, mas `stage-a-linkage.json` na raiz falha;
3. apenas o ficheiro da raiz indexado, mas o ficheiro em `evidence/` falha;
4. dois ficheiros com o mesmo basename em diretórios diferentes são validados pelas respetivas entradas;
5. entrada duplicada para o mesmo caminho canónico falha;
6. caminho com `../` falha;
7. hash malformado falha.

Todos devem chamar as funções reais de produção.

---

## 2. Testes reais com dois pares completos

### Regra essencial

Não conta como teste de dois runs:

- declarar o segundo ID numa variável;
- mencionar o segundo run num comentário;
- verificar apenas `notStrictEqual` contra um número nunca fornecido à função;
- criar apenas um ficheiro de evidência;
- lançar manualmente uma exceção dentro do teste.

Os dois pares devem existir fisicamente nas fixtures e ser processados pela lógica real de produção.

### 2.1. Etapa A

Crie uma fixture com dois pares completos:

```text
Par A1: run_id + artifact_id + workflow_run.id + head_sha
Par A2: run_id + artifact_id + workflow_run.id + head_sha
```

Inclua fisicamente:

- as duas respostas de run;
- as duas respostas de artefacto;
- as entradas exatas de todos os ficheiros no índice SHA-256;
- uma referência canónica da Etapa B indicando qual par foi efetivamente consumido.

O teste positivo deve chamar o código de produção e provar que o par consumido é selecionado.

O teste negativo deve alterar a referência consumida ou introduzir uma segunda fonte canónica incompatível e provar que o código de produção falha por contradição.

### 2.2. Intake

Repita a mesma estrutura com dois pares completos de Intake:

```text
Par I1: run_id + artifact_id + workflow_run.id + head_sha
Par I2: run_id + artifact_id + workflow_run.id + head_sha
```

Inclua fisicamente os dois pares, o índice e a referência canónica da Etapa A.

O teste positivo deve provar a seleção do par consumido. O teste negativo deve provar a rejeição da contradição.

### Função de produção

Se as funções atuais de extração não conseguem receber dois pares sem considerar automaticamente qualquer ficheiro adicional como uma contradição, extraia uma função pequena e pura para reconciliar:

```text
pares disponíveis
+ referência consumida autenticada
→ par exato selecionado
```

Essa função deve ser usada pelo caminho operacional real. Não crie uma função utilizada apenas pelos testes.

---

## Ficheiros autorizados

```text
scripts/verify-operational-pilot-closure-chain.mjs
packages/runtime/src/test/microPatchFinalCoherenceProtectionReview.test.ts
```

Não altere workflows, `package.json`, classificações ou configuração do GitHub.

---

## Execução autorizada

Está autorizado a:

1. aplicar apenas estas duas correções;
2. executar build, typecheck e testes;
3. criar um único commit;
4. fazer push;
5. aguardar e reportar a CI.

Não inicie:

```text
Operational Pilot - Intake de Pacote Externo
Operational Pilot - Etapa A
Operational Pilot - Etapa B
Operational Pilot - Atestação Independente da Cadeia
```

---

## Critérios de aceitação

```text
[ ] alias por basename removido
[ ] lookup por basename removido
[ ] caminho relativo exato obrigatório
[ ] colisão de basename não autentica outro ficheiro
[ ] duplicação de caminho no índice falha
[ ] caminho inseguro falha
[ ] hash malformado falha
[ ] fixture da Etapa A contém dois pares físicos completos
[ ] fixture do Intake contém dois pares físicos completos
[ ] referência consumida seleciona o par correto pelo código de produção
[ ] contradição da Etapa A falha no código de produção
[ ] contradição do Intake falha no código de produção
[ ] nenhum teste fabrica a exceção esperada
[ ] build e typecheck passam
[ ] todos os testes passam
[ ] CI termina em completed/success
[ ] nenhum workflow da cadeia operacional é iniciado
```

Qualquer item não demonstrado deve ser marcado como:

```text
NOT_PROVEN
```

---

## Relatório final

Apresente:

1. SHA inicial e SHA final;
2. ficheiros alterados;
3. diff resumido dos dois pontos;
4. função de produção usada nos testes de dois pares;
5. descrição física das quatro fixtures: A1, A2, I1 e I2;
6. testes positivos e negativos;
7. resultado de build, typecheck e testes;
8. contagem real dos testes;
9. ID e URL da CI;
10. confirmação de que a cadeia operacional não foi iniciada.

---

## Classificação permitida

Somente se todos os critérios forem provados:

```text
SUBPROMPT_1_CHAIN_IDENTITY_AND_ARTIFACT_BINDING_IMPLEMENTED
SUBPROMPT_1_RESIDUAL_GAPS_CLOSED
CI_VALIDATED
FULL_CHAIN_EXECUTION_NOT_YET_AUTHORISED
REAL_PILOT_BLOCKED
```

Não declare ainda:

```text
SAME_SHA_DEMO_CHAIN_INDEPENDENTLY_ATTESTED
OPERATIONAL_PILOT_VALIDATED
REAL_PILOT_AUTHORISED
```

# Micro-Prompt Corretivo do Subprompt 1 — Fecho da Identidade e da Prova de Proveniência

## Repositório

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

## Baseline obrigatória

```text
522ed8010377888b035d085f511fb26e1da73e2b
```

Antes de alterar qualquer ficheiro, confirme que `master` continua exatamente neste SHA. Se a branch tiver avançado, interrompa a execução e reporte o novo SHA.

---

## Objetivo restrito

Fechar exclusivamente as quatro lacunas residuais do Subprompt 1:

1. exigir `head_branch === "master"`;
2. exigir `artifact.workflow_run.head_sha === sourceSha`;
3. validar pelo índice SHA-256 o ficheiro que fornece os IDs consumidos e rejeitar fontes contraditórias;
4. substituir os três testes insuficientes por testes que executem realmente o código de produção.

Não reestruture o verificador, não altere classificações, não altere regras de identidade canónica do repositório, não altere a lógica geral de hashes entre pacotes e não implemente requisitos dos Subprompts 2 ou 3.

Não execute Intake, Etapa A, Etapa B ou a atestação da cadeia. Execute apenas build, typecheck, testes e CI.

---

## 1. Tornar `head_branch` estritamente obrigatório

### Problema atual

A validação permite que `head_branch` esteja ausente:

```javascript
if (run.head_branch && run.head_branch !== 'master') {
  throw new Error(...);
}
```

### Correção obrigatória

O run somente pode ser aceite quando:

```javascript
run.head_branch === 'master'
```

Devem falhar:

- campo ausente;
- `null`;
- string vazia;
- outra branch;
- valor com diferença de maiúsculas ou espaços;
- qualquer valor diferente da string exata `master`.

Não normalize, complete nem presuma o valor.

### Testes obrigatórios

- positivo: `head_branch: "master"` passa;
- negativo: campo ausente falha;
- negativo: `head_branch: null` falha;
- negativo: `head_branch: "develop"` falha.

Todos os testes devem invocar diretamente a função de produção que valida o run.

---

## 2. Tornar `artifact.workflow_run.head_sha` estritamente obrigatório

### Problema atual

A validação permite que `workflow_run.head_sha` esteja ausente:

```javascript
if (
  expectedSha &&
  artifact.workflow_run.head_sha &&
  artifact.workflow_run.head_sha !== expectedSha
) {
  throw new Error(...);
}
```

### Correção obrigatória

Quando `sourceSha` é fornecido, aceite o artefacto somente se:

```javascript
artifact.workflow_run.head_sha === sourceSha
```

Exija também que ambos sejam SHA Git estritos com 40 caracteres hexadecimais.

Devem falhar:

- `workflow_run` ausente;
- `workflow_run.id` ausente;
- `workflow_run.head_sha` ausente;
- `workflow_run.head_sha: null`;
- SHA malformado;
- SHA diferente do `sourceSha`;
- SHA correto com espaços ou caracteres adicionais.

Não aceite a ausência do SHA como compatibilidade retroativa.

### Testes obrigatórios

- positivo: `workflow_run.head_sha` igual ao `sourceSha` passa;
- negativo: campo ausente falha;
- negativo: SHA malformado falha;
- negativo: SHA divergente falha.

Os testes devem invocar `validateArtifactMetadata` ou a função real equivalente.

---

## 3. Validar a fonte dos IDs pelo índice SHA-256 e rejeitar contradições

### Problema atual

As funções de extração procuram vários ficheiros possíveis e aceitam o primeiro que apresenta IDs. Atualmente não demonstram que o ficheiro escolhido:

- está incluído no índice SHA-256 do pacote de origem;
- possui hash físico correspondente;
- é coerente com todas as outras fontes presentes.

Também ocultam erros de leitura com blocos como:

```javascript
catch {}
```

Uma fonte JSON inválida ou contraditória não pode ser silenciosamente ignorada.

### 3.1. Pacote da Etapa B

Para obter:

```text
stage_a_run_id
stage_a_artifact_id
```

considere todas as fontes canónicas presentes no pacote da Etapa B, incluindo, quando aplicável:

```text
consumed-stage-a.json
stage-a-linkage.json
stage-a-artifact-api-response.json
stage-a-run-api-response.json
```

Cada ficheiro utilizado deve:

1. estar dentro do diretório extraído com segurança;
2. constar no índice SHA-256 aplicável ao pacote;
3. ter o hash físico recalculado;
4. coincidir com o hash registado no índice;
5. conter JSON válido;
6. fornecer IDs numéricos válidos;
7. ser coerente com as restantes fontes presentes.

### 3.2. Pacote da Etapa A

Aplique as mesmas regras para obter:

```text
intake_run_id
intake_artifact_id
```

a partir das fontes canónicas presentes no pacote da Etapa A, incluindo, quando aplicável:

```text
consumed-intake.json
intake-linkage.json
intake-artifact-api-response.json
intake-run-api-response.json
```

### 3.3. Regra de consenso

Não escolha simplesmente o primeiro ficheiro válido.

Procedimento obrigatório:

1. localizar todas as fontes canónicas presentes;
2. validar o hash de cada fonte;
3. extrair todos os valores disponíveis;
4. exigir que todos os `run_id` coincidam;
5. exigir que todos os `artifact_id` coincidam;
6. rejeitar qualquer divergência;
7. rejeitar JSON inválido;
8. rejeitar fonte presente mas não indexada;
9. rejeitar fonte indexada cujo hash físico diverge;
10. rejeitar quando não existir pelo menos uma fonte completa e válida para o par de IDs.

Uma fonte que contenha apenas `run_id` pode complementar outra fonte que contenha `artifact_id`, mas todos os valores sobrepostos devem ser idênticos.

### 3.4. Índice aplicável

Utilize o índice de hashes efetivamente produzido e transportado no respetivo pacote. Não crie um índice novo durante a verificação para legitimar ficheiros já existentes.

Se o pacote não contiver um índice capaz de autenticar a fonte de linkage, falhe de forma explícita.

O relatório deve indicar:

```json
{
  "linkage_sources": [],
  "linkage_source_hashes_verified": true,
  "linkage_consensus_verified": true
}
```

Esses estados devem resultar das verificações, não de constantes.

---

## 4. Substituir os três testes insuficientes

Não adicione apenas novos testes deixando os testes artificiais anteriores como se fossem prova. Remova ou reescreva os três testes insuficientes identificados.

### 4.1. Duas execuções da Etapa A no mesmo SHA

O teste atual menciona duas execuções apenas no comentário.

Substitua-o por um teste que apresente fisicamente ao código de produção:

- dois runs válidos da Etapa A no mesmo SHA;
- dois artefactos associados;
- evidência da Etapa B apontando apenas para um par específico;
- resposta individual correspondente ao par consumido.

O teste deve provar que:

- o par referenciado é selecionado;
- o outro par não é usado;
- trocar o ID consumido por um ID contraditório provoca falha.

O teste deve chamar a função real de extração, consenso e validação. Um comentário indicando o segundo run não conta como fixture.

### 4.2. Duas execuções do Intake no mesmo SHA

Substitua o teste atual por uma fixture equivalente que contenha realmente:

- dois runs do Intake;
- dois artefactos;
- evidência da Etapa A apontando para um único par;
- resposta individual correspondente.

O teste deve executar a lógica real de produção e demonstrar seleção determinística pelo ID consumido.

### 4.3. Resposta agregada e resposta individual contraditórias

O teste atual lança manualmente a exceção dentro do próprio teste. Isso é proibido.

Substitua-o por um teste que:

1. prepare uma lista agregada válida;
2. prepare uma resposta individual contraditória;
3. invoque a função real de produção responsável pela reconciliação;
4. confirme que a função real rejeita a divergência.

O corpo do teste não pode conter lógica equivalente a:

```javascript
if (contradiction) {
  throw new Error(...);
}
```

A exceção deve nascer exclusivamente do código de produção.

### 4.4. Endpoint individual indisponível

Fortaleça também o teste existente para que a execução avance até ao endpoint individual do artefacto:

- run individual válido presente;
- lista agregada válida presente;
- artefacto ZIP válido presente, se necessário;
- apenas a resposta individual do artefacto ausente.

Confirme que a falha ocorre especificamente por indisponibilidade dessa resposta, não por ausência anterior do run.

---

## 5. Testes negativos adicionais obrigatórios

Adicione testes reais do código de produção para:

1. fonte de linkage presente, mas não indexada;
2. fonte indexada com hash físico divergente;
3. duas fontes com `stage_a_run_id` diferentes;
4. duas fontes com `stage_a_artifact_id` diferentes;
5. duas fontes com `intake_run_id` diferentes;
6. duas fontes com `intake_artifact_id` diferentes;
7. uma fonte JSON inválida;
8. índice de hashes ausente;
9. `head_branch` ausente;
10. `artifact.workflow_run.head_sha` ausente.

Cada cenário deve provocar exceção específica ou `exit code != 0` proveniente do código de produção.

---

## 6. Ficheiros autorizados

Limite as alterações a:

```text
scripts/verify-operational-pilot-closure-chain.mjs
packages/runtime/src/test/microPatchFinalCoherenceProtectionReview.test.ts
```

Não altere o workflow, `package.json`, outros verificadores ou ficheiros de configuração, salvo se encontrar um impedimento técnico comprovável. Nesse caso, pare e reporte o impedimento antes de ampliar o escopo.

---

## 7. Execução autorizada

Está autorizado a:

1. aplicar as quatro correções;
2. executar build, typecheck e testes localmente;
3. criar um único commit;
4. fazer push;
5. aguardar a CI oficial;
6. apresentar o relatório de evidências.

Não está autorizado a iniciar:

```text
Operational Pilot - Intake de Pacote Externo
Operational Pilot - Etapa A
Operational Pilot - Etapa B
Operational Pilot - Atestação Independente da Cadeia
```

---

## 8. Critérios de aceitação

```text
[ ] master partiu exatamente da baseline autorizada
[ ] head_branch ausente ou diferente de master falha
[ ] artifact.workflow_run.head_sha ausente falha
[ ] artifact.workflow_run.head_sha divergente falha
[ ] ficheiro que fornece IDs consta no índice SHA-256
[ ] hash físico da fonte é recalculado e comparado
[ ] todas as fontes presentes são avaliadas
[ ] fontes contraditórias falham
[ ] JSON inválido falha
[ ] índice ausente falha
[ ] teste de duas Etapas A contém realmente dois pares
[ ] teste de dois Intakes contém realmente dois pares
[ ] teste agregado versus individual chama código de produção
[ ] teste de endpoint indisponível chega efetivamente ao endpoint do artefacto
[ ] todos os testes negativos passam
[ ] build passa
[ ] typecheck passa
[ ] CI termina em completed/success
[ ] nenhum workflow Intake/A/B foi iniciado
```

Qualquer item não demonstrado deve ser classificado como:

```text
NOT_PROVEN
```

---

## 9. Relatório final obrigatório

Apresente:

1. SHA inicial;
2. SHA final;
3. ficheiros alterados;
4. diff resumido por cada um dos quatro pontos;
5. funções de produção modificadas;
6. testes removidos ou reescritos;
7. testes novos;
8. resultado real de build, typecheck e testes;
9. contagem real de testes;
10. ID e URL da CI;
11. confirmação de que Intake, Etapa A, Etapa B e atestação não foram iniciados;
12. matriz abaixo preenchida.

| Requisito | Função de produção | Teste positivo | Teste negativo | Resultado | Evidência |
|---|---|---|---|---|---|
| Branch estritamente master |  |  |  |  |  |
| SHA obrigatório no artefacto |  |  |  |  |  |
| Fonte incluída no índice |  |  |  |  |  |
| Hash físico da fonte |  |  |  |  |  |
| Consenso entre fontes |  |  |  |  |  |
| Duas Etapas A reais |  |  |  |  |  |
| Dois Intakes reais |  |  |  |  |  |
| Contradição agregado/individual |  |  |  |  |  |
| Endpoint individual indisponível |  |  |  |  |  |
| CI oficial |  |  |  |  |  |

---

## 10. Classificação permitida

Somente se todos os critérios forem demonstrados:

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

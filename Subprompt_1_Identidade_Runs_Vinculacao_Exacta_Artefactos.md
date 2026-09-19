# Subprompt 1 — Identidade dos Runs e Vinculação Exata dos Artefactos

## Repositório

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

## Baseline de partida

```text
37927b519f2865e45d5df236df411da126dbe8f8
```

Antes de alterar qualquer ficheiro, confirme que `master` continua exatamente neste SHA. Se a branch tiver avançado, interrompa a execução, informe o novo SHA e não aplique este subprompt sem nova autorização.

---

## Objetivo estrito

Aplicar exclusivamente as duas correções abaixo no verificador forense pós-Etapa B:

1. remover qualquer fallback que permita selecionar um artefacto diferente do nome canónico esperado;
2. vincular cada artefacto ao run exato que o produziu e ligar Intake → Etapa A → Etapa B pelos IDs efetivamente consumidos, não pelo primeiro workflow encontrado no mesmo SHA.

Este subprompt não autoriza alterações relativas a:

- regras de hashes obrigatórios, salvo o hash do próprio ZIP descarregado para registo;
- obrigatoriedade de `repository.id` e `head_repository.id`, que será tratada no Subprompt 2;
- derivação do modo e da classificação final, que será tratada no Subprompt 3;
- configuração de revisores do GitHub;
- execução do Intake, Etapa A, Etapa B ou piloto real;
- criação de novos módulos ou aumento da arquitetura.

---

## 1. Correção A — eliminar seleção permissiva de artefactos

### Problema confirmado

Em `scripts/verify-operational-pilot-closure-chain.mjs`, a seleção atual admite:

```javascript
const art = artifactsListData.artifacts?.find(
  a => a.name === expectedArtifactName
) || artifactsListData.artifacts?.[0];
```

O trecho:

```javascript
|| artifactsListData.artifacts?.[0]
```

permite que um artefacto com nome incorreto seja aceite quando o artefacto canónico esperado estiver ausente.

### Alteração obrigatória

Selecione somente por igualdade exata do nome:

```javascript
const matches = artifacts.filter(
  artifact => artifact.name === expectedArtifactName
);
```

Exija:

```text
matches.length === 1
```

Comportamento obrigatório:

- zero correspondências: falhar;
- mais de uma correspondência: falhar por ambiguidade;
- uma correspondência exata: continuar;
- artefacto com nome semelhante, prefixo, sufixo ou SHA diferente: falhar;
- outro artefacto disponível no mesmo run: nunca usar como fallback;
- `expired !== false`: falhar;
- `size_in_bytes` ausente, não inteiro, zero ou negativo: falhar;
- `id` ausente ou inválido: falhar.

Não introduza:

- seleção pelo primeiro elemento;
- seleção por `includes`, `startsWith` ou expressão parcial;
- fallback para artefacto transportado dentro de outro pacote;
- IDs fixos destinados a fazer os testes passar.

### Resultado esperado

Para cada pacote, apenas estes nomes exatos podem ser aceites:

```text
aetf-pilot-intake-<SOURCE_SHA>
aetf-pilot-stage-a-<SOURCE_SHA>
aetf-pilot-closure-<SOURCE_SHA>
```

---

## 2. Correção B — vincular artefacto, run e cadeia pelos IDs exatos

### Problema confirmado

O verificador consulta os runs do SHA e usa seleções do tipo:

```javascript
runs.find(r => r.path === expectedWorkflowPath)
```

Esse comportamento torna a cadeia ambígua quando um workflow é executado mais de uma vez no mesmo commit.

Também falta uma validação explícita e fail-closed da ligação:

```text
artifact.workflow_run.id === expectedRunId
```

### Regra de proveniência obrigatória

A cadeia deve ser reconstruída de trás para a frente:

```text
Run da Etapa B fornecido pelo evento workflow_run
    ↓
Etapa B identifica o run e o artefacto exatos da Etapa A que consumiu
    ↓
Etapa A identifica o run e o artefacto exatos do Intake que consumiu
```

Não selecione Etapa A ou Intake apenas por coincidência de:

- SHA;
- caminho do workflow;
- estado `completed`;
- ordem na lista de runs;
- data mais recente;
- primeiro resultado retornado pela API.

### 2.1. Âncora da Etapa B

Use como âncora o `stage_b_run_id` proveniente de:

```text
github.event.workflow_run.id
```

Na repetição forense manual, use o ID explicitamente indicado, consultando depois a API do GitHub.

Consulte individualmente:

```text
GET /repos/{owner}/{repo}/actions/runs/{stage_b_run_id}
```

Preserve os bytes brutos e o respetivo SHA-256.

Valide, nesta fase e dentro do escopo deste subprompt:

- ID do run igual ao solicitado;
- caminho exato `.github/workflows/operational-pilot-stage-b.yml`;
- `head_sha` igual ao SHA auditado;
- `head_branch` igual a `master`;
- `status: completed`;
- `conclusion: success`.

### 2.2. Descoberta da Etapa A consumida

Obtenha o `stage_a_run_id` e o `stage_a_artifact_id` a partir de evidência física preservada no pacote real da Etapa B.

Podem ser usados os campos canónicos já preservados, desde que a origem seja validada e o ficheiro esteja incluído no índice de hashes da Etapa B.

Depois, consulte individualmente:

```text
GET /repos/{owner}/{repo}/actions/runs/{stage_a_run_id}
GET /repos/{owner}/{repo}/actions/artifacts/{stage_a_artifact_id}
```

Não reutilize como prova final apenas a resposta da API copiada dentro da Etapa B. Compare-a com a resposta atual obtida diretamente da API.

Valide:

- ID do run igual ao ID consumido pela Etapa B;
- ID do artefacto igual ao ID consumido pela Etapa B;
- `artifact.workflow_run.id === stage_a_run_id`;
- caminho exato `.github/workflows/operational-pilot-stage-a.yml`;
- mesmo SHA auditado;
- nome exato do artefacto;
- artefacto não expirado e não vazio.

### 2.3. Descoberta do Intake consumido

Obtenha o `intake_run_id` e o `intake_artifact_id` da evidência física preservada no pacote real da Etapa A.

Depois, consulte individualmente:

```text
GET /repos/{owner}/{repo}/actions/runs/{intake_run_id}
GET /repos/{owner}/{repo}/actions/artifacts/{intake_artifact_id}
```

Valide:

- ID do run igual ao ID consumido pela Etapa A;
- ID do artefacto igual ao ID consumido pela Etapa A;
- `artifact.workflow_run.id === intake_run_id`;
- caminho exato `.github/workflows/operational-pilot-intake.yml`;
- mesmo SHA auditado;
- nome exato do artefacto;
- artefacto não expirado e não vazio.

### 2.4. Respostas e metadados obrigatórios

Preserve, sem reconstrução manual dos bytes:

```text
stage-b-run-api-response.json
stage-b-run-api-response.json.sha256
stage-b-artifact-api-response.json
stage-b-artifact-api-response.json.sha256

stage-a-run-api-response.json
stage-a-run-api-response.json.sha256
stage-a-artifact-api-response.json
stage-a-artifact-api-response.json.sha256

intake-run-api-response.json
intake-run-api-response.json.sha256
intake-artifact-api-response.json
intake-artifact-api-response.json.sha256
```

As respostas individuais devem vir dos endpoints individuais. Não retire um objeto de uma lista agregada e o apresente como “resposta bruta individual”.

### 2.5. Metadados dos artefactos

Para cada artefacto, registe pelo menos:

```json
{
  "artifact_id": 0,
  "artifact_name": "",
  "artifact_size_bytes": 0,
  "artifact_expired": false,
  "workflow_run_id": 0,
  "source_sha": "",
  "zip_sha256": ""
}
```

O `workflow_run_id` deve vir do objeto real do artefacto e corresponder ao run esperado.

---

## 3. Regras fail-closed obrigatórias

A execução deve terminar com código diferente de zero perante qualquer uma destas situações:

1. nome canónico do artefacto ausente;
2. mais de um artefacto com o nome canónico;
3. artefacto alternativo presente, mas artefacto esperado ausente;
4. `artifact.id` ausente ou inválido;
5. `artifact.workflow_run.id` ausente;
6. `artifact.workflow_run.id` diferente do run esperado;
7. `stage_a_run_id` ausente na evidência consumida pela Etapa B;
8. `stage_a_artifact_id` ausente na evidência consumida pela Etapa B;
9. `intake_run_id` ausente na evidência consumida pela Etapa A;
10. `intake_artifact_id` ausente na evidência consumida pela Etapa A;
11. run consultado diferente do run consumido;
12. workflow incorreto;
13. SHA divergente;
14. estado diferente de `completed`;
15. conclusão diferente de `success`;
16. artefacto expirado;
17. artefacto vazio;
18. resposta individual da API indisponível;
19. ambiguidade entre duas execuções do mesmo workflow no mesmo SHA.

Ausência, inconsistência ou indisponibilidade de prova não pode ser convertida em aviso. Deve ser falha.

---

## 4. Testes automatizados obrigatórios

Adicione testes reais ao conjunto oficial. Não limite a alteração ao script operacional.

### 4.1. Testes positivos

Inclua pelo menos:

1. seleção de uma única correspondência exata;
2. vínculo válido entre artefacto do Intake e run do Intake;
3. vínculo válido entre artefacto da Etapa A e run da Etapa A;
4. vínculo válido entre artefacto da Etapa B e run da Etapa B;
5. duas execuções da Etapa A no mesmo SHA, confirmando que é escolhida a execução referenciada pela Etapa B;
6. duas execuções do Intake no mesmo SHA, confirmando que é escolhida a execução referenciada pela Etapa A;
7. produção das respostas individuais e dos respetivos hashes.

### 4.2. Testes negativos

Inclua pelo menos:

1. artefacto esperado ausente e outro artefacto presente;
2. dois artefactos com o mesmo nome canónico;
3. artefacto com SHA errado no nome;
4. `workflow_run.id` ausente;
5. `workflow_run.id` divergente;
6. ID consumido da Etapa A ausente;
7. ID consumido do Intake ausente;
8. run correto no SHA, mas diferente do run consumido;
9. workflow incorreto;
10. artefacto expirado;
11. artefacto vazio;
12. endpoint individual indisponível;
13. resposta agregada válida, mas resposta individual contraditória.

Cada teste negativo deve confirmar:

```text
exit code != 0
```

ou, se a lógica for extraída para funções puras, a exceção específica esperada.

### 4.3. Integração dos testes

Garanta que os novos testes:

- são compilados;
- fazem parte do comando oficial `npm test` do pacote aplicável;
- são executados pela CI;
- não dependem da rede pública;
- não enfraquecem o bloqueio de mocks do workflow operacional;
- não usam IDs fixos no código de produção.

O harness de testes pode usar fixtures, mas não pode emitir uma atestação confundível com a atestação operacional real.

---

## 5. Ficheiros previstos

Limite preferencialmente as alterações a:

```text
scripts/verify-operational-pilot-closure-chain.mjs
packages/runtime/src/test/microPatchFinalCoherenceProtectionReview.test.ts
packages/runtime/package.json
```

Se for necessário alterar outro ficheiro, explique previamente a necessidade no relatório final. Não altere workflows, classificações, modos de execução ou configuração do GitHub neste subprompt, salvo se uma alteração mínima for indispensável para executar os testes oficiais.

---

## 6. Execução autorizada nesta etapa

Está autorizado a:

1. confirmar a baseline;
2. alterar apenas o código necessário às Correções A e B;
3. criar ou atualizar os testes correspondentes;
4. executar build, typecheck e testes localmente;
5. criar um único commit para este subprompt;
6. fazer push desse commit;
7. aguardar e reportar a CI desse commit.

Não está autorizado a iniciar:

```text
Operational Pilot - Intake de Pacote Externo
Operational Pilot - Etapa A
Operational Pilot - Etapa B
Operational Pilot - Atestação Independente da Cadeia
```

A cadeia completa será executada apenas depois da aprovação dos três subprompts.

---

## 7. Critérios de aceitação

Este subprompt somente pode ser declarado concluído se todos os critérios abaixo forem verdadeiros:

```text
[ ] baseline inicial confirmada
[ ] fallback para artifacts[0] removido
[ ] nome canónico exigido por igualdade exata
[ ] zero ou múltiplas correspondências produzem falha
[ ] artifact.workflow_run.id é obrigatório
[ ] artifact.workflow_run.id corresponde ao run esperado
[ ] Etapa A é descoberta pelo ID consumido pela Etapa B
[ ] Intake é descoberto pelo ID consumido pela Etapa A
[ ] endpoints individuais são consultados
[ ] respostas individuais brutas são preservadas
[ ] testes positivos passam
[ ] todos os testes negativos exigidos passam
[ ] testes fazem parte do comando oficial
[ ] build e typecheck passam
[ ] CI oficial termina em completed/success
[ ] nenhuma cadeia Intake/A/B foi iniciada
```

Qualquer item não provado deve ser apresentado como:

```text
NOT_PROVEN
```

e impede o encerramento deste subprompt.

---

## 8. Evidência exigida no relatório final

Apresente:

1. SHA anterior;
2. novo SHA do commit;
3. lista exata dos ficheiros alterados;
4. resumo do diff por requisito;
5. localização da função de seleção exata do artefacto;
6. localização da validação de `artifact.workflow_run.id`;
7. explicação da descoberta dos IDs consumidos;
8. lista dos testes positivos adicionados;
9. lista dos testes negativos adicionados;
10. resultado do build;
11. resultado do typecheck;
12. resultado integral dos testes, incluindo totais reais;
13. URL e ID do run da CI;
14. `head_sha`, `status` e `conclusion` da CI;
15. matriz abaixo preenchida.

| Requisito | Ficheiro/função | Teste positivo | Teste negativo | Resultado | Evidência |
|---|---|---|---|---|---|
| Seleção exata |  |  |  |  |  |
| Ausência sem fallback |  |  |  |  |  |
| Singularidade do nome |  |  |  |  |  |
| Vínculo artefacto-run |  |  |  |  |  |
| ID da Etapa A consumida |  |  |  |  |  |
| ID do Intake consumido |  |  |  |  |  |
| Respostas individuais |  |  |  |  |  |
| CI oficial |  |  |  |  |  |

---

## 9. Classificação permitida

Se todos os critérios forem cumpridos, use apenas:

```text
SUBPROMPT_1_CHAIN_IDENTITY_AND_ARTIFACT_BINDING_IMPLEMENTED
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

O Subprompt 1 corrige apenas identidade, proveniência e vinculação dos runs e artefactos. Os restantes pontos serão tratados e auditados separadamente.

# Parecer Técnico de Auditoria Atualizado — Cadeia Forense no Mesmo SHA

## Comunicação prévia ao agente executor

Este documento atualiza o agente executor sobre o resultado da auditoria técnica realizada após a execução do micro-patch residual no repositório:

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

Commit atualmente publicado em `master` e objeto desta auditoria:

```text
a14d9dae84deb6355ef0a63ac3536dfdf68092f6
```

Nesta fase, **não aplique novas alterações ao repositório**. Primeiro:

1. leia integralmente este parecer;
2. confirme tecnicamente cada constatação no código e nos runs indicados;
3. apresente um plano curto de correção, mapeado por ficheiro, teste e evidência;
4. aguarde autorização expressa antes de executar o micro-patch.

Não acrescente novos módulos, camadas de governação ou componentes arquitetónicos. O trabalho pendente está limitado ao verificador forense da cadeia e à configuração externa necessária para o piloto real.

---

## 1. Âmbito da auditoria

A auditoria verificou:

- os commits posteriores a `8944424fe462b0e5eb5b5fd2eb96b3a83216c7b0`;
- a integração da nova bateria de testes no comando oficial;
- a leitura canónica de `prevent_self_review`;
- a separação entre evidência DEMO e aprovação humana operacional;
- o enriquecimento dos metadados dos artefactos;
- a execução automática da atestação após a Etapa B;
- a ligação dos runs ao mesmo commit;
- o comportamento do novo verificador `verify-operational-pilot-closure-chain.mjs`;
- a configuração pública atual do ambiente GitHub `protected-pilot`.

O presente parecer distingue três realidades:

1. correção implementada no código;
2. execução observada com sucesso no GitHub Actions;
3. prova forense suficiente para autorizar uma conclusão operacional.

Um `success` do workflow não substitui a prova material de todos os requisitos.

---

## 2. Cadeia executada e confirmada

Foi observada a seguinte cadeia no mesmo SHA:

| Etapa | Run ID | SHA | Estado | Conclusão |
|---|---:|---|---|---|
| CI principal | `35440337344` | `a14d9dae84deb6355ef0a63ac3536dfdf68092f6` | `completed` | `success` |
| Intake | `35440630870` | `a14d9dae84deb6355ef0a63ac3536dfdf68092f6` | `completed` | `success` |
| Etapa A | `35440723122` | `a14d9dae84deb6355ef0a63ac3536dfdf68092f6` | `completed` | `success` |
| Etapa B | `35440834934` | `a14d9dae84deb6355ef0a63ac3536dfdf68092f6` | `completed` | `success` |
| Atestação pós-Etapa B | `35440885470` | `a14d9dae84deb6355ef0a63ac3536dfdf68092f6` | `completed` | `success` |

Também foram observados no mesmo SHA os verificadores remotos e pós-fecho com conclusão `success`.

Esta execução permite afirmar:

```text
OFFICIAL_CI_PASSED
SAME_SHA_DEMO_CHAIN_EXECUTED
POST_STAGE_B_ATTESTATION_EXECUTED
```

Não permite ainda afirmar, sem reservas:

```text
FULL_FORENSIC_CHAIN_INDEPENDENTLY_VERIFIED
OPERATIONAL_PILOT_VALIDATED
REAL_PILOT_AUTHORISED
```

---

## 3. Correções confirmadas

### 3.1. Integração da nova bateria de testes

O ficheiro compilado:

```text
dist/test/microPatchFinalCoherenceProtectionReview.test.js
```

foi incluído no script oficial `test` de:

```text
packages/runtime/package.json
```

A CI passou depois dessa integração. Portanto, o problema de existir um teste fora do comando oficial foi corrigido.

A contagem exata de testes deve continuar a ser obtida do recibo produzido pela própria execução, sem número fixo introduzido no código ou no relatório.

### 3.2. Leitura canónica de `prevent_self_review`

O script `scripts/verify-environment-protection.mjs` passou a localizar a regra:

```text
protection_rules[].type = required_reviewers
```

e a avaliar:

```text
required_reviewers.prevent_self_review
```

Foram também adicionadas verificações para:

- regra ausente;
- mais de uma regra `required_reviewers`;
- ausência de revisores;
- `prevent_self_review` diferente de `true`;
- contradição entre o valor canónico e eventual valor na raiz;
- indisponibilidade da prova de proteção da branch;
- estado diferente de `FULLY_PROTECTED` em modo operacional.

Esta correção está tecnicamente alinhada com o requisito fail-closed.

### 3.3. Coerência do recibo DEMO

O recibo de independência produzido em DEMO passou a declarar explicitamente:

```json
{
  "execution_mode": "DEMO",
  "is_simulation": true,
  "independence_evidence_type": "SYNTHETIC_DEMO",
  "github_environment_approval_id": null,
  "github_environment_approval_verified": false,
  "prevent_self_review_observed": false,
  "independence_verified": false,
  "classification": "DEMO_REVIEW_INDEPENDENCE_SIMULATED"
}
```

O DEMO já não apresenta um ID de run como se fosse um ID real de aprovação do ambiente.

### 3.4. Enriquecimento dos sidecars

Os sidecars dos artefactos passaram a receber do respetivo workflow run:

```text
workflow_id
workflow_path
run_attempt
```

Esta alteração está presente no processamento do Intake e na reconciliação da Etapa A.

### 3.5. Atestação automática após a Etapa B

Foi criado:

```text
.github/workflows/operational-pilot-chain-attestation.yml
```

O workflow:

- é acionado automaticamente por `workflow_run` após a Etapa B;
- exige conclusão `success` da Etapa B;
- filtra o repositório canónico e a branch `master`;
- obtém o SHA do run que originou o evento;
- faz checkout no SHA auditado;
- executa o verificador pós-Etapa B;
- publica um pacote próprio de atestação.

Na execução mais recente, esse workflow terminou com sucesso e publicou o artefacto:

```text
aetf-pilot-chain-attestation-a14d9dae84deb6355ef0a63ac3536dfdf68092f6
```

---

## 4. Achados técnicos ainda abertos

### Achado F-01 — `ci_verified` é uma conclusão fixa

No objeto final de atestação, o campo é preenchido como:

```javascript
ci_verified: true
```

O verificador final não demonstra, no próprio fluxo, que:

- localizou o run canónico da CI correspondente ao SHA;
- confirmou `status: completed`;
- confirmou `conclusion: success`;
- validou `repository.id` e `head_repository.id`;
- validou o caminho e a identidade do workflow;
- preservou a resposta bruta da API e o respetivo SHA-256;
- reconciliou o recibo da CI com esse run.

#### Decisão da auditoria

```text
NOT_PROVEN
```

O facto de a auditoria ter observado externamente uma CI verde não legitima um campo fixo dentro da atestação. O verificador deve calcular esse estado com base em prova obtida durante a sua própria execução.

### Achado F-02 — apenas o pacote da Etapa B é descarregado diretamente

O script consulta e descarrega diretamente o artefacto da Etapa B. Porém, para a Etapa A e o Intake, utiliza respostas e ficheiros transportados dentro do pacote da Etapa B.

Isso confirma a presença de cópias desses ficheiros no fecho, mas não constitui uma reconciliação independente dos três artefactos originais.

O requisito era descarregar diretamente:

1. o pacote do Intake;
2. o pacote da Etapa A;
3. o pacote da Etapa B.

#### Decisão da auditoria

```text
PARTIALLY_PROVEN
```

### Achado F-03 — ausência do Intake não bloqueia necessariamente a classificação

O estado final usa:

```javascript
intake_verified: Boolean(intakeRunId)
```

Se a prova do Intake estiver ausente, o campo pode tornar-se `false`, mas a execução pode continuar a emitir:

```text
SAME_SHA_DEMO_CHAIN_INDEPENDENTLY_ATTESTED
```

Uma cadeia completa não pode ser atestada se uma das suas três etapas obrigatórias não tiver sido verificada.

#### Decisão da auditoria

```text
BLOCKER
```

### Achado F-04 — ligação da Etapa A insuficientemente independente

O verificador lê `stage-a-artifact-api-response.json` preservado dentro do pacote da Etapa B, mas não prova diretamente, através da API e do download original, que:

- o artefacto pertence ao run da Etapa A indicado;
- `workflow_run.id` corresponde ao run esperado;
- o nome do artefacto incorpora o SHA esperado;
- o artefacto não expirou;
- o tamanho é válido;
- o ZIP original possui o hash registado;
- os bytes descarregados diretamente são os mesmos bytes consumidos pela Etapa B.

#### Decisão da auditoria

```text
PARTIALLY_PROVEN
```

### Achado F-05 — mocks continuam disponíveis no verificador final

O script final aceita:

```text
--mock-data-dir
MOCK_DATA_DIR
```

O workflow GitHub auditado não utilizou esses mecanismos. Portanto, não há evidência de que o run `35440885470` tenha sido produzido por mocks.

Ainda assim, o mesmo script operacional pode ser invocado com respostas e ZIPs locais e emitir uma atestação com classificação positiva. Isso enfraquece a autoridade do verificador.

#### Decisão da auditoria

```text
BLOCKER_FOR_OPERATIONAL_USE
```

Mocks devem existir apenas num caminho de testes claramente separado e incapaz de emitir uma atestação operacional.

### Achado F-06 — estados finais não são todos derivados da matriz

Além de `ci_verified: true`, outros campos são atribuídos diretamente:

```javascript
same_sha_chain_verified: true
stage_a_verified: true
stage_b_verified: true
```

Mesmo quando verificações anteriores existem, a atestação deve derivar cada estado dos resultados efetivamente registados na matriz. Nenhuma conclusão deve ser uma constante independente dos checks.

#### Decisão da auditoria

```text
BLOCKER_FOR_FULL_FORENSIC_ATTESTATION
```

### Achado F-07 — configuração externa ainda impede o piloto real

A resposta atual do ambiente GitHub `protected-pilot` apresenta:

```json
{
  "prevent_self_review": false,
  "can_admins_bypass": false
}
```

O revisor configurado observado é a mesma conta que administra e aciona o fluxo:

```text
victorinoaguiar-art
```

O código agora rejeita corretamente essa configuração em `OPERATIONAL_PILOT`, mas a configuração externa ainda não satisfaz a regra.

#### Decisão da auditoria

```text
REAL_PILOT_BLOCKED
```

O ambiente precisa de `prevent_self_review: true` e de um revisor humano independente, com identidade diferente do autor, iniciador e executor aplicável.

---

## 5. Parecer consolidado

O micro-patch anterior foi substancialmente implementado e executado. Foram corrigidas as inconsistências DEMO, a localização canónica de `prevent_self_review`, os metadados dos artefactos e o acionamento pós-Etapa B.

Todavia, o novo verificador ainda atribui conclusões mais fortes do que a prova que ele próprio recolhe. Em particular:

- não verifica a CI antes de definir `ci_verified: true`;
- não descarrega independentemente os três pacotes;
- pode tolerar a ausência do Intake sem bloquear a classificação;
- aceita mocks no próprio verificador final;
- mantém estados finais fixos;
- não possui configuração externa suficiente para revisão humana independente real.

Por isso, a classificação tecnicamente defensável é:

```text
MICRO_PATCH_RESIDUAL_SUBSTANTIALLY_IMPLEMENTED
OFFICIAL_CI_PASSED
SAME_SHA_DEMO_CHAIN_EXECUTED
POST_STAGE_B_ATTESTATION_EXECUTED
FORENSIC_CHAIN_ATTESTATION_PARTIALLY_COMPLETE
OPERATIONAL_VALIDATION_BLOCKED
REAL_PILOT_BLOCKED
```

A seguinte classificação ainda não está autorizada:

```text
SAME_SHA_DEMO_CHAIN_INDEPENDENTLY_ATTESTED
```

Ela somente poderá ser emitida depois de o verificador descarregar, autenticar e reconciliar diretamente todos os elementos obrigatórios da cadeia.

---

## 6. Pontos técnicos restantes para o próximo micro-patch

O próximo micro-patch deve limitar-se aos seguintes pontos:

1. substituir `ci_verified: true` por verificação real do run da CI;
2. descarregar diretamente os artefactos do Intake, Etapa A e Etapa B;
3. bloquear se qualquer um dos três pacotes estiver ausente;
4. reconciliar diretamente run, artefacto, workflow, SHA e hash das três etapas;
5. impedir mocks no verificador final utilizado operacionalmente;
6. calcular todos os estados de verificação, sem valores fixos;
7. configurar `prevent_self_review: true` no ambiente GitHub;
8. assegurar revisão humana independente antes do piloto real.

Não é necessário aumentar a arquitetura nem criar um novo subsistema. O trabalho pendente consiste num micro-patch forense no verificador da cadeia e numa correção da configuração externa do GitHub.

---

## 7. Expectativa para o plano do agente

Antes de implementar, apresente uma tabela com esta estrutura:

| Achado | Causa confirmada | Ficheiros a alterar | Teste positivo | Teste negativo | Evidência esperada |
|---|---|---|---|---|---|

O plano deve, no mínimo, explicar:

### 7.1. Verificação real da CI

- como localizar o run canónico da CI pelo SHA;
- como impedir que outro workflow verde seja confundido com a CI;
- como validar repositório, workflow, branch, SHA, estado e conclusão;
- quais respostas brutas e hashes serão preservados;
- como `ci_verified` será calculado.

### 7.2. Descarga independente dos três pacotes

- como descobrir os runs do Intake e da Etapa A a partir da cadeia, sem confiar apenas em inputs livres;
- como consultar os artefactos diretamente pela API;
- como validar `workflow_run.id`, nome, tamanho, expiração e SHA;
- como descarregar e extrair cada ZIP com o extrator seguro;
- como comparar os pacotes originais com os bytes transportados para as etapas seguintes.

### 7.3. Falha obrigatória por ausência ou divergência

Devem provocar saída diferente de zero:

- CI ausente ou não concluída com sucesso;
- Intake ausente;
- Etapa A ausente;
- Etapa B ausente;
- artefacto expirado ou vazio;
- `repository_id` divergente;
- `head_repository_id` divergente;
- workflow incorreto;
- run e artefacto não relacionados;
- SHA divergente;
- hash divergente;
- pacote transportado diferente do pacote original;
- estado calculado diferente de `PASS`.

### 7.4. Separação absoluta de mocks

O plano deve escolher uma abordagem inequívoca:

- retirar mocks do verificador operacional e testar por funções injetáveis; ou
- manter um harness separado que nunca possa emitir a atestação operacional.

O workflow oficial deve falhar se forem encontrados:

```text
--mock-data-dir
MOCK_DATA_DIR
mock-api-response
mock-branch-response
```

ou qualquer fonte equivalente de substituição da evidência real.

### 7.5. Estados derivados

Todos os campos finais devem resultar da matriz de checks. Por exemplo:

```text
ci_verified
intake_verified
stage_a_verified
stage_b_verified
same_sha_chain_verified
artifact_integrity_verified
```

Não deve existir nenhum `true` fixo para representar uma verificação externa.

### 7.6. Configuração humana externa

O plano deve separar claramente:

- alterações de código que o agente pode implementar;
- alterações na configuração do GitHub que exigem permissões administrativas;
- ações que exigem uma segunda pessoa real.

O agente não deve fabricar, simular ou substituir:

- a segunda identidade humana;
- a aprovação do ambiente;
- o ID da aprovação;
- a ativação de `prevent_self_review`;
- a prova de proteção da branch.

---

## 8. Evidência exigida após futura autorização de execução

Quando o micro-patch vier a ser autorizado, o encerramento deverá apresentar:

1. novo SHA único;
2. diff completo e limitado ao escopo aprovado;
3. testes positivos e negativos integrados no comando oficial;
4. CI concluída com sucesso;
5. respostas brutas da API para CI, Intake, Etapa A e Etapa B;
6. hashes SHA-256 das respostas brutas;
7. metadados dos quatro runs;
8. metadados dos três artefactos;
9. três ZIPs descarregados diretamente;
10. hashes SHA-256 dos três ZIPs;
11. relatório do extrator seguro para cada ZIP;
12. reconciliação dos bytes originais e transportados;
13. matriz `Requirement → Run → Artifact → File → Hash → Result`;
14. atestação final sem estados fixos;
15. prova da configuração `prevent_self_review: true`;
16. prova de aprovação por revisor humano independente, somente para o piloto real.

Se a segunda identidade humana ainda não existir ou a configuração externa ainda estiver incompleta, a conclusão obrigatória continuará a ser:

```text
SAME_SHA_DEMO_CHAIN_VERIFIED
REAL_PILOT_BLOCKED_PENDING_EXTERNAL_CONFIGURATION_AND_INDEPENDENT_HUMAN_REVIEW
```

---

## 9. Resposta solicitada ao agente nesta fase

Não execute alterações ainda. Responda apenas com:

1. confirmação ou contestação fundamentada de cada achado `F-01` a `F-07`;
2. indicação exata dos ficheiros e funções envolvidos;
3. plano mínimo de correção;
4. testes positivos e negativos propostos;
5. evidências que serão produzidas;
6. dependências externas que não podem ser resolvidas apenas por código;
7. declaração expressa de que nenhuma classificação operacional ou autorização do piloto real será antecipada.

O plano será revisto antes da autorização para aplicar o micro-patch.

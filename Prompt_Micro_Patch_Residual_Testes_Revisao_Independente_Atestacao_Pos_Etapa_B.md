# PROMPT — Micro-Patch Residual de Testes, Revisão Independente Autêntica e Atestação Pós-Etapa B

## 1. Missão

Actue como engenheiro sénior de software, GitHub Actions, segurança, segregação de funções e auditoria forense.

Repositório canónico:

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
repository_id = 1363667011
default_branch = master
```

Implemente apenas o micro-patch residual deste documento. Não redesenhe a arquitectura e não declare prontidão para piloto real.

Último SHA auditado:

```text
8944424fe462b0e5eb5b5fd2eb96b3a83216c7b0
```

A nova validação deve usar o novo SHA criado pelo patch. É proibido reutilizar runs, artefactos, desafios ou recibos do SHA anterior.

## 2. Estado comprovado e bloqueios

Já ficaram comprovados:

- classificações DEMO coerentes;
- recibo final da CI com `completed/success`;
- respostas brutas do run e jobs preservadas;
- separação principal entre `artifact_id` e `workflow_run_id`;
- bloqueio de mocks no código operacional;
- cadeia DEMO no mesmo SHA entre CI, intake, Etapa A e Etapa B.

Persistem sete bloqueios:

1. a suite `microPatchFinalCoherenceProtectionReview.test.ts` não entrou no comando normal de testes;
2. `prevent_self_review` é lido no local errado;
3. o ID do run foi utilizado como approval ID;
4. o recibo DEMO contradiz a configuração externa;
5. o revisor não está ligado a uma identidade autenticada e a um evento real de aprovação;
6. sidecars de artefactos apresentam `workflow_id`, `workflow_path` e `run_attempt` nulos;
7. não existe atestação forense independente depois da Etapa B.

Classificação obrigatória durante este trabalho:

```text
SAME_SHA_DEMO_VALIDATED
OPERATIONAL_VALIDATION_PARTIALLY_READY
REAL_PILOT_BLOCKED
```

## 3. Correcção A — Executar efectivamente a nova suite

Actualize `packages/runtime/package.json` e inclua no script normal de testes:

```text
dist/test/microPatchFinalCoherenceProtectionReview.test.js
```

A suite deve correr através de `npm test`, `npm run test:runtime` e `npm run verify:local`. Não crie um comando opcional que a CI não execute.

Não presuma antecipadamente uma contagem exacta como 825. Obtenha a contagem da execução física e exija:

```text
total_tests > 811
passed_tests = total_tests
failed_tests = 0
skipped_tests = 0
cancelled_tests = 0
todo_tests = 0
```

Os logs devem mencionar nominalmente a nova suite.

Testes mínimos:

- coerência DEMO e rejeição de adulteração;
- mocks CLI e ambiente rejeitados em `OPERATIONAL_PILOT`;
- branch protection indisponível rejeitada;
- `prevent_self_review: false` rejeitado;
- artifact ID e run ID reconciliados;
- auto-aprovação rejeitada;
- recibo DEMO marcado como sintético;
- modo operacional sem approval real rejeitado.

## 4. Correcção B — Localização canónica de prevent_self_review

Corrija `scripts/verify-environment-protection.mjs`.

Use como fonte canónica a regra `required_reviewers`:

```javascript
const reviewerRules = Array.isArray(apiResponse?.protection_rules)
  ? apiResponse.protection_rules.filter(rule => rule.type === 'required_reviewers')
  : [];

if (reviewerRules.length !== 1) {
  // fail-closed em OPERATIONAL_PILOT
}

const reviewerRule = reviewerRules[0];
const preventSelfReview = reviewerRule?.prevent_self_review === true;
```

Não aceite o campo de raiz como fallback permissivo no modo operacional. Se existir por compatibilidade, preserve-o apenas como dado observado e falhe perante divergência.

Em `OPERATIONAL_PILOT`, falhe se:

- `protection_rules` estiver ausente;
- não existir exactamente uma regra válida;
- `prevent_self_review` estiver ausente ou diferente de `true`;
- não existirem revisores autorizados;
- existirem campos contraditórios;
- a resposta for simulada, incompleta ou indisponível.

O relatório deve distinguir valor, fonte e estado:

```json
{
  "prevent_self_review_observed": false,
  "prevent_self_review_source": "protection_rules.required_reviewers",
  "environment_protection_status": "PARTIALLY_PROTECTED"
}
```

Nunca transforme um valor observado `false` em `true`.

## 5. Correcção C — Recibo de independência autêntico

Corrija:

```text
scripts/run-operational-pilot.mjs
.github/workflows/operational-pilot-stage-b.yml
```

Remova:

```yaml
GITHUB_ENV_APPROVAL_ID: ${{ github.run_id }}
```

O ID do run não é approval ID. É proibido usar como prova:

- run ID;
- input livre de `workflow_dispatch`;
- nome do revisor;
- timestamp;
- UUID local;
- placeholder apresentado como aprovação real.

### 5.1 DEMO

Em DEMO, emita:

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

Registe o valor externo realmente observado. O recibo pode provar o exercício técnico, mas não independência humana real.

### 5.2 OPERATIONAL_PILOT

Somente crie `independence_verified: true` depois de obter e validar uma fonte externa autenticada:

```json
{
  "execution_mode": "OPERATIONAL_PILOT",
  "is_simulation": false,
  "independence_evidence_type": "AUTHENTICATED_GITHUB_ENVIRONMENT_APPROVAL",
  "initiating_actor_login": "<login>",
  "initiating_actor_id": 0,
  "approving_actor_login": "<login>",
  "approving_actor_id": 0,
  "reviewer_subject_id": "<identidade autenticada>",
  "reviewer_authorization_id": "<registo real>",
  "github_environment_approval_id": "<ID real>",
  "github_environment_approval_verified": true,
  "prevent_self_review_observed": true,
  "independence_verified": true,
  "raw_approval_response_file": "<ficheiro>.json",
  "raw_approval_response_sha256": "<64 hex>"
}
```

Consulte uma API autenticada do GitHub ou sistema externo autorizado. Preserve os bytes exactos e o SHA-256.

Se a prova não estiver disponível, falhe:

```text
AUTHENTIC_ENVIRONMENT_APPROVAL_EVIDENCE_UNAVAILABLE
```

Compare IDs autenticados, não apenas strings:

```text
initiating_actor_id != approving_actor_id
initiating_actor_login != approving_actor_login
reviewer autorizado == approving actor ou vínculo formal comprovado
```

Falhe perante auto-aprovação, identidade ausente, approval ID não verificável, reviewer sem vínculo, `prevent_self_review: false` ou admin bypass.

## 6. Correcção D — Enriquecer sidecars dos artefactos

Corrija:

```text
scripts/lib/rawGhApi.mjs
scripts/prepare-operational-pilot-input.mjs
scripts/reconcile-stage-a-artifact.mjs
```

Preserve a resposta bruta do endpoint do artefacto sem alteração. Depois de validar o run associado, gere ou actualize o sidecar derivado com dados das duas respostas.

Estrutura mínima:

```json
{
  "repository_id": 1363667011,
  "head_repository_id": 1363667011,
  "workflow_id": 361645706,
  "workflow_path": ".github/workflows/operational-pilot-stage-a.yml",
  "workflow_run_id": 35436242478,
  "run_id": 35436242478,
  "run_attempt": 1,
  "artifact_id": 10582159988,
  "artifact_name": "aetf-pilot-stage-a-<SOURCE_SHA>",
  "head_sha": "<SOURCE_SHA>",
  "head_branch": "master",
  "expired": false,
  "size_in_bytes": 1,
  "raw_artifact_response_sha256": "<64 hex>",
  "raw_run_response_sha256": "<64 hex>",
  "enriched_from_verified_run": true
}
```

Falhe se IDs, repository, SHA, branch, workflow, tentativa, nome do artefacto ou hashes divergirem.

## 7. Correcção E — Atestação independente pós-Etapa B

Crie:

```text
scripts/verify-operational-pilot-closure-chain.mjs
.github/workflows/operational-pilot-chain-attestation.yml
```

### 7.1 Evento

Accione automaticamente por `workflow_run` após:

```text
Operational Pilot - Etapa B (Decisao Humana e Fecho)
```

Só prossiga quando:

```text
status = completed
conclusion = success
repository.id = 1363667011
head_repository.id = 1363667011
head_branch = master
head_sha = SOURCE_SHA
```

Pode existir `workflow_dispatch` apenas para repetição forense, recebendo unicamente o ID do run da Etapa B. Todos os demais dados devem vir da API.

### 7.2 Checkout e descoberta confiáveis

Faça checkout do `head_sha` obtido do run validado. Não faça checkout de SHA fornecido livremente antes da reconciliação.

Comece pelo run e artefacto da Etapa B. Descubra a cadeia através das evidências preservadas:

- Stage-B run e attempt;
- Stage-A run e artifact;
- intake run e artifact;
- `SOURCE_SHA`;
- tenant, task e challenge IDs.

Consulte directamente a API e não aceite IDs alternativos fornecidos pelo operador.

### 7.3 Verificações

Confirme:

1. repository ID canónico em toda a cadeia;
2. mesmo SHA em CI, intake, Etapa A e Etapa B;
3. workflows e branch exactos;
4. runs `completed/success`;
5. tentativas válidas;
6. artefactos exactos, não expirados e não vazios;
7. hashes físicos;
8. intake consumido pela Etapa A;
9. Etapa A consumida pela Etapa B;
10. challenge consistente e consumido uma vez;
11. classificações DEMO coerentes;
12. ausência de classificação real em DEMO;
13. recibo de independência sintético em DEMO;
14. approval externo autêntico no modo operacional;
15. manifesto, SQLite, recibos e ficheiros reconciliados.

Use o extractor seguro existente e rejeite traversal, caminhos absolutos, links, ficheiros especiais, colisões, entradas inesperadas, truncamento, ZIP64 não suportado, excesso de tamanho/expansão e CRC divergente.

### 7.4 Atestação DEMO

Emita:

```json
{
  "source_sha": "<SOURCE_SHA>",
  "execution_mode": "DEMO",
  "same_sha_chain_verified": true,
  "ci_verified": true,
  "intake_verified": true,
  "stage_a_verified": true,
  "stage_b_verified": true,
  "review_independence_evidence": "SYNTHETIC_DEMO",
  "real_pilot_authorised": false,
  "classification": "SAME_SHA_DEMO_CHAIN_INDEPENDENTLY_ATTESTED"
}
```

Preserve respostas brutas, hashes, metadados, índice integral, matriz `Requirement → Run → Artifact → File → Hash → Result` e relatório de falhas.

## 8. Configuração externa obrigatória

O código não substitui a configuração do GitHub. Antes de qualquer piloto real, comprove:

```text
prevent_self_review = true
enforce_admins = true
can_admins_bypass = false
required_status_checks configurados
pull request obrigatório
required_approving_review_count >= 1
dismiss_stale_reviews = true
force-push desactivado
eliminação da branch desactivada
deployment limitado à branch protegida
```

Se a conta ou permissões impedirem a configuração ou consulta, declare o bloqueio. Não reduza os critérios.

## 9. Testes adicionais

Inclua testes para:

- nova suite realmente incluída em `npm test`;
- campo lido da regra correcta;
- ausência/duplicação de `required_reviewers` rejeitada;
- divergência entre raiz e regra canónica rejeitada;
- run ID rejeitado como approval ID;
- DEMO com approval ID nulo e evidência sintética;
- DEMO nunca afirma independência real;
- operacional sem approval externo falha;
- auto-aprovação por login ou ID falha;
- sidecar sem campos nulos;
- divergência artefacto/run falha;
- atestação pós-Etapa B rejeita SHA divergente;
- atestação rejeita artefacto de outro SHA;
- cadeia DEMO válida não autoriza piloto real.

## 10. Nova cadeia no novo SHA

Execute pela ordem:

1. CI principal;
2. verificação remota pós-CI;
3. intake DEMO;
4. Etapa A DEMO consumindo o artefacto exacto do intake;
5. Etapa B DEMO consumindo o artefacto exacto da Etapa A;
6. atestação independente automática pós-Etapa B.

É proibido reutilizar qualquer run, artefacto, pacote, desafio, recibo ou SHA anterior.

## 11. Evidências obrigatórias

Entregue:

1. novo SHA completo;
2. ficheiros alterados e diff por requisito;
3. contagem real dos testes;
4. prova nominal da nova suite;
5. IDs, attempts e URLs dos seis workflows;
6. IDs, nomes, tamanhos e digests dos artefactos;
7. recibo final da CI;
8. respostas brutas e hashes;
9. relatórios de protecção;
10. sidecars enriquecidos;
11. recibo DEMO de independência sintética;
12. testes negativos de auto-aprovação e approval falso;
13. atestação pós-Etapa B;
14. matriz `Requirement → Code → Test → Evidence`;
15. bloqueios externos.

## 12. Critérios finais

PASS técnico da cadeia DEMO:

```text
SAME_SHA_DEMO_CHAIN_INDEPENDENTLY_ATTESTED
OPERATIONAL_VALIDATION_CODE_READY
REAL_PILOT_BLOCKED_PENDING_EXTERNAL_CONFIGURATION_AND_REAL_EVIDENCE
```

FAIL perante prova ausente, contraditória ou placeholder:

```text
RESIDUAL_MICRO_PATCH_FAILED
OPERATIONAL_VALIDATION_BLOCKED
REAL_PILOT_BLOCKED
```

Apresente o relatório final com resumo, SHA, alterações, testes, cadeia, reconciliação, natureza sintética ou autêntica da revisão, hashes, matriz, bloqueios e classificação.

Não substitua prova física por declaração textual, nome de ficheiro, valor previsto ou conclusão inferida.


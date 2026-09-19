# PROMPT — Micro-Patch Final de Coerência DEMO, Recibo Final de CI, Protecção Fail-Closed e Revisão Humana Independente

## 1. Papel e missão

Actue como engenheiro sénior de software, segurança de aplicações, GitHub Actions, cadeia de fornecimento de software e auditoria forense de evidências.

Trabalhe directamente no repositório canónico:

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

Identidade obrigatória do repositório:

```text
repository_id = 1363667011
default_branch = master
```

Implemente um micro-patch curto, estritamente limitado às seis lacunas descritas neste documento. Não redesenhe a arquitectura central, não crie outro módulo de negócio e não transforme este trabalho numa refactorização ampla.

O objectivo é permitir uma nova validação integral no mesmo SHA, sem autorizar automaticamente um piloto real.

## 2. Estado inicial auditado

A validação DEMO anterior foi executada no SHA:

```text
9901d3043db2a70846cf1984c102dd5c8a472dc6
```

Foram observados:

- CI concluída com sucesso e `811/811` testes aprovados;
- intake DEMO concluído com sucesso;
- Etapa A concluída com sucesso;
- Etapa B concluída com sucesso;
- reconciliação física de run e artefacto da Etapa A;
- extracção segura de ZIP;
- preservação de respostas brutas da API do GitHub;
- SHA único entre CI, intake, Etapa A e Etapa B.

Apesar disso, a classificação actual permanece:

```text
SAME_SHA_DEMO_VALIDATED
OPERATIONAL_VALIDATION_READY_AFTER_MICRO_PATCH
REAL_PILOT_BLOCKED
```

Este patch não pode converter evidência DEMO em evidência real.

## 3. Regras obrigatórias e invariantes

1. Toda a lógica operacional deve ser `fail-closed`.
2. Nenhuma ausência de evidência pode ser convertida em `PASS`, `FULLY_PROTECTED` ou equivalente.
3. Nenhum mock pode ser aceite no caminho `OPERATIONAL_PILOT`.
4. Nenhuma execução DEMO pode receber rótulo de piloto operacional real ou validado.
5. Todos os recibos finais da CI devem representar o estado concluído do run.
6. Os campos `repository.id`, `head_repository.id`, `workflow_run.repository_id` e `workflow_run.head_repository_id` devem existir, ser numéricos e iguais a `1363667011`.
7. Todos os runs e artefactos encadeados devem pertencer ao mesmo `SOURCE_SHA` completo de 40 caracteres.
8. A aprovação para piloto real exige revisor humano independente e auto-aprovação tecnicamente bloqueada.
9. O resultado deste trabalho deve continuar classificado como preparação/validação técnica, não como autorização do piloto real.

## 4. Correcção 1 — Tornar todas as classificações DEMO coerentes

Localize todos os pontos que geram, persistem, exportam ou verificam:

- `execution_mode`;
- `is_simulation`;
- `classification`;
- `classification_level`;
- `classification_status`;
- `operational_state`;
- `operational_pilot_started`;
- `operational_pilot_completed`;
- métricas, recibos, SQLite, manifestos e declarações finais.

### 4.1 Resultado obrigatório para DEMO

Quando `execution_mode === "DEMO"`, imponha:

```json
{
  "execution_mode": "DEMO",
  "is_simulation": true,
  "classification": "AUTOMATED_OPERATIONAL_DEMO_EXECUTED",
  "classification_level": "AUTOMATED_OPERATIONAL_DEMO_EXECUTED",
  "classification_status": "AUTOMATED_OPERATIONAL_DEMO_EXECUTED",
  "operational_state": "AUTOMATED_OPERATIONAL_DEMO_EXECUTED",
  "operational_pilot_started": false,
  "operational_pilot_completed": false
}
```

Os campos só devem ser incluídos onde pertençam ao respectivo schema. O significado, porém, deve permanecer idêntico em todas as superfícies.

### 4.2 Valores proibidos numa execução DEMO

Uma execução DEMO deve falhar se qualquer recibo, registo SQLite, manifesto ou declaração contiver:

```text
CONTROLLED_OPERATIONAL_PILOT_VALIDATED
OPERATIONAL_PILOT_VALIDATED
REAL_PILOT_VALIDATED
REAL_PILOT_AUTHORISED
REAL_PILOT_COMPLETED
PRODUCTION_READY
```

Crie uma função canónica de classificação, reutilizada por todos os geradores, para impedir divergência entre recibos, base de dados e manifesto.

### 4.3 Testes obrigatórios

- DEMO produz `is_simulation: true`.
- DEMO nunca produz uma classificação operacional real.
- alteração manual de `is_simulation` para `false` faz a verificação falhar.
- inserção de `CONTROLLED_OPERATIONAL_PILOT_VALIDATED` num recibo DEMO faz a reconciliação falhar.
- SQLite, recibo da tarefa, manifesto e declaração final apresentam classificação coerente.

## 5. Correcção 2 — Gerar o recibo da CI somente depois da conclusão efectiva

O ficheiro `github-actions-receipt.json` não pode ser considerado final enquanto o próprio run estiver `queued` ou `in_progress`.

### 5.1 Arquitectura obrigatória

Implemente uma das seguintes soluções, dando preferência à primeira:

1. workflow independente accionado por `workflow_run`, após a conclusão da CI principal; ou
2. job externo de verificação que consulte o run concluído através da API do GitHub.

Não tente resolver o problema fazendo o próprio job afirmar que já terminou antes da conclusão real do run.

### 5.2 Conteúdo mínimo do recibo final

```json
{
  "repository": "victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES",
  "repository_id": 1363667011,
  "head_repository_id": 1363667011,
  "branch": "master",
  "commit_sha": "<SOURCE_SHA>",
  "workflow_path": ".github/workflows/ci.yml",
  "run_id": 0,
  "run_attempt": 1,
  "status": "completed",
  "conclusion": "success",
  "required_steps_failed": [],
  "required_steps_skipped": [],
  "required_steps_pending": [],
  "required_steps_cancelled": [],
  "raw_run_response_sha256": "<64 hex>",
  "raw_jobs_response_sha256": "<64 hex>",
  "verified_at": "<RFC3339>"
}
```

Preserve fisicamente as respostas brutas da API relativas ao run e aos jobs. Calcule os respectivos SHA-256 a partir dos bytes exactos recebidos.

### 5.3 Regras fail-closed

Falhe se:

- `status !== "completed"`;
- `conclusion !== "success"`;
- existir job ou passo obrigatório pendente, ignorado, cancelado ou falhado;
- o SHA do run diferir do `SOURCE_SHA`;
- o run pertencer a outro workflow, branch ou repositório;
- `run_attempt` estiver ausente ou inválido;
- qualquer resposta bruta ou hash estiver ausente.

### 5.4 Testes obrigatórios

- run `in_progress` é rejeitado;
- conclusão vazia é rejeitada;
- passo obrigatório `pending`, `skipped`, `cancelled` ou `failure` é rejeitado;
- recibo posterior à conclusão é aceite;
- mutação de um byte nas respostas brutas é detectada;
- SHA divergente é rejeitado.

## 6. Correcção 3 — Indisponibilidade da protecção da branch deve falhar no modo operacional

Corrija `scripts/verify-environment-protection.mjs` e verificadores relacionados.

### 6.1 Regra principal

Em `OPERATIONAL_PILOT`, qualquer falha ao consultar a protecção da branch `master` deve encerrar a execução com código diferente de zero.

São falhas obrigatórias:

- HTTP 401, 403, 404, 429 ou 5xx;
- resposta vazia;
- JSON inválido;
- token sem permissão;
- timeout;
- estrutura inesperada;
- ausência de `required_status_checks`;
- ausência de política de pull request;
- impossibilidade de confirmar aplicação das regras aos administradores.

Nunca grave `FULLY_PROTECTED` quando a resposta física contiver `API_UNAVAILABLE`, erro, placeholder ou dados incompletos.

### 6.2 Estados permitidos

Use estados inequívocos, por exemplo:

```text
FULLY_PROTECTED
PARTIALLY_PROTECTED
UNPROTECTED
PROTECTION_EVIDENCE_UNAVAILABLE
```

Somente `FULLY_PROTECTED` pode passar no modo operacional.

### 6.3 Critérios mínimos de `FULLY_PROTECTED`

- API do ambiente consultada com sucesso;
- API de protecção da branch consultada com sucesso;
- checks obrigatórios configurados;
- pull request obrigatório;
- pelo menos uma aprovação obrigatória;
- reviews antigas descartadas após novos commits;
- administradores sujeitos às regras;
- force-push desactivado;
- eliminação da branch desactivada;
- ambiente com revisores obrigatórios;
- `prevent_self_review: true`;
- `can_admins_bypass: false`;
- deployment limitado à branch protegida.

Se algum destes critérios não puder ser comprovado, não emita `FULLY_PROTECTED`.

## 7. Correcção 4 — Impedir mocks fornecidos por argumentos de linha de comandos

Actualmente, o modo operacional bloqueia mocks por variáveis de ambiente, mas deve também bloquear:

```text
--mock-api-response
--mock-branch-response
```

### 7.1 Comportamento obrigatório

No início do script, antes de ler qualquer ficheiro:

```javascript
if (mode === 'OPERATIONAL_PILOT' && (
  mockApiResponseArg ||
  mockBranchResponseArg ||
  process.env.MOCK_ENV_API_RESPONSE ||
  process.env.MOCK_BRANCH_API_RESPONSE
)) {
  throw new Error('MOCK_EVIDENCE_FORBIDDEN_IN_OPERATIONAL_PILOT');
}
```

Não reutilize o script operacional como uma entrada permissiva para testes. Extraia a lógica pura para uma função testável ou use um executável exclusivamente de teste.

### 7.2 Testes obrigatórios

- `OPERATIONAL_PILOT + --mock-api-response` falha;
- `OPERATIONAL_PILOT + --mock-branch-response` falha;
- `OPERATIONAL_PILOT + MOCK_ENV_API_RESPONSE` falha;
- `OPERATIONAL_PILOT + MOCK_BRANCH_API_RESPONSE` falha;
- DEMO/teste pode usar fixtures apenas através do caminho explicitamente não operacional;
- o workflow operacional não passa nem aceita parâmetros de mock.

## 8. Correcção 5 — Corrigir os metadados dos artefactos

Corrija a geração de ficheiros como:

```text
intake-artifact-api-response.meta.json
stage-a-artifact-api-response.meta.json
```

O campo `run_id` não pode receber o ID do artefacto.

### 8.1 Estrutura obrigatória

```json
{
  "repository_id": 1363667011,
  "head_repository_id": 1363667011,
  "workflow_id": 0,
  "workflow_path": "<workflow exacto>",
  "workflow_run_id": 0,
  "run_attempt": 1,
  "artifact_id": 0,
  "artifact_name": "<nome exacto>",
  "head_sha": "<SOURCE_SHA>",
  "head_branch": "master",
  "expired": false,
  "size_in_bytes": 1,
  "raw_filename": "<resposta bruta>.json",
  "raw_bytes_sha256": "<64 hex>",
  "retrieved_at": "<RFC3339>"
}
```

Se for necessário manter `run_id` por compatibilidade, este deve ser igual a `workflow_run_id`, nunca a `artifact_id`.

### 8.2 Reconciliações obrigatórias

- `artifact.id === artifact_id`;
- `artifact.workflow_run.id === workflow_run_id`;
- `artifact.workflow_run.repository_id === 1363667011`;
- `artifact.workflow_run.head_repository_id === 1363667011`;
- `artifact.workflow_run.head_sha === SOURCE_SHA`;
- `run.id === workflow_run_id`;
- `run.repository.id === 1363667011`;
- `run.head_repository.id === 1363667011`;
- `run.head_sha === SOURCE_SHA`;
- nome, branch, workflow e tentativa coerentes.

### 8.3 Testes obrigatórios

- artefacto e run com IDs diferentes são registados correctamente;
- `run_id = artifact_id` é rejeitado quando não corresponde ao run real;
- ausência de `workflow_run_id` falha;
- metadados adulterados falham;
- respostas brutas continuam preservadas e verificáveis.

## 9. Correcção 6 — Exigir revisão humana independente e impedir auto-aprovação

O piloto real não pode ser aprovado pela mesma identidade que iniciou, disparou, administrou ou executou a operação quando a segregação de funções for obrigatória.

### 9.1 Configuração obrigatória do GitHub Environment

Para o ambiente `protected-pilot`, exigir:

- `required_reviewers` com pelo menos um revisor autorizado;
- `prevent_self_review: true`;
- `can_admins_bypass: false`;
- política de deployment limitada à branch protegida;
- prova física da aprovação do environment/deployment.

O verificador deve falhar se `prevent_self_review` estiver ausente, for `false` ou não puder ser comprovado.

### 9.2 Segregação de identidades

Em `OPERATIONAL_PILOT`, compare pelo menos:

- actor que iniciou o intake;
- actor que disparou a Etapa A;
- actor que disparou a Etapa B;
- actor que aprovou o ambiente;
- `reviewer_id` empresarial;
- identidade autenticada que assinou a decisão.

Falhe se a mesma identidade incompatível ocupar funções de iniciador e aprovador. Não compare apenas nomes livres; use identificadores autenticados e imutáveis sempre que disponíveis.

### 9.3 Evidência mínima da revisão

O recibo deve conter:

```json
{
  "reviewer_id": "<identidade real>",
  "reviewer_subject_id": "<ID autenticado>",
  "reviewer_authorization_id": "<registo de autorização>",
  "github_environment_approval_id": "<ID do evento>",
  "initiating_actor_id": "<actor do intake/execução>",
  "independence_verified": true,
  "prevent_self_review": true,
  "decision": "APPROVED",
  "challenge_id": "<desafio>",
  "review_signature_sha256": "<64 hex>",
  "event_signed_at": "<RFC3339>",
  "review_received_at": "<RFC3339>",
  "challenge_consumed_at": "<RFC3339>"
}
```

A assinatura deve vir apenas de secret protegido ou payload externo autenticado. Não volte a introduzir `review_signature_receipt` nos inputs normais do workflow.

### 9.4 Testes obrigatórios

- auto-aprovação é rejeitada;
- `prevent_self_review: false` bloqueia o modo operacional;
- revisor não autorizado é rejeitado;
- identidade livre sem vínculo autenticado é rejeitada;
- aprovação DEMO continua explicitamente simulada;
- revisor independente, autorizado e autenticado passa;
- reutilização do desafio falha;
- assinatura alterada em um byte falha.

## 10. Testes de regressão obrigatórios

Execute toda a bateria existente e adicione testes específicos para as seis correcções.

O resultado mínimo deve ser:

```text
total_tests > 811
failed_tests = 0
skipped_tests = 0
cancelled_tests = 0
todo_tests = 0
```

Inclua testes positivos e negativos para:

- coerência DEMO;
- rejeição de classificações reais em DEMO;
- recibo final da CI;
- rejeição de run não concluído;
- indisponibilidade da API de branch protection;
- mocks por variável e argumentos CLI;
- diferença entre `artifact_id` e `workflow_run_id`;
- auto-aprovação;
- independência do revisor;
- mutação de hashes e recibos;
- divergência de SHA;
- repository ID ausente, antigo ou divergente.

## 11. Nova execução de validação com SHA único

Após o commit do patch, use o novo SHA como único `SOURCE_SHA` e execute, pela ordem:

1. CI principal;
2. verificação posterior à conclusão da CI;
3. intake DEMO;
4. Etapa A DEMO;
5. Etapa B DEMO;
6. verificador independente final.

Todos os runs e artefactos devem usar o mesmo SHA.

Não reutilize artefactos produzidos por SHAs anteriores.

## 12. Pacote obrigatório de evidências

Entregue:

1. SHA completo do commit corrigido;
2. lista exacta de ficheiros alterados;
3. diff resumido por requisito;
4. comandos executados;
5. resultado completo dos testes;
6. IDs e URLs dos runs;
7. IDs, nomes, tamanhos e digests dos artefactos;
8. respostas brutas da API do run, jobs, ambiente, branch e artefactos;
9. SHA-256 físico de todas as respostas brutas;
10. recibo final da CI com `completed/success`;
11. recibos corrigidos de intake, Etapa A e Etapa B;
12. prova da coerência DEMO;
13. prova dos testes negativos de mocks e auto-aprovação;
14. matriz `Requirement → Code → Test → Evidence`;
15. relatório final de bloqueios residuais.

## 13. Matriz de aceitação obrigatória

| Requisito | Código alterado | Teste positivo | Teste negativo | Evidência física | Resultado |
|---|---|---|---|---|---|
| Coerência DEMO | obrigatório | obrigatório | obrigatório | recibos + SQLite + manifesto | PASS/FAIL |
| Recibo final da CI | obrigatório | obrigatório | obrigatório | API bruta + hashes | PASS/FAIL |
| Branch protection fail-closed | obrigatório | obrigatório | obrigatório | API bruta + relatório | PASS/FAIL |
| Proibição total de mocks | obrigatório | obrigatório | obrigatório | logs + testes | PASS/FAIL |
| Metadados dos artefactos | obrigatório | obrigatório | obrigatório | meta + API bruta | PASS/FAIL |
| Revisão independente | obrigatório | obrigatório | obrigatório | approval + recibo | PASS/FAIL |

Nenhuma linha pode receber `PASS` apenas com base em declaração textual.

## 14. Critérios finais de decisão

### 14.1 Resultado permitido após uma validação DEMO bem-sucedida

```text
SAME_SHA_DEMO_VALIDATED
OPERATIONAL_VALIDATION_READY
REAL_PILOT_BLOCKED_PENDING_REAL_EVIDENCE
```

### 14.2 Resultado obrigatório perante qualquer lacuna

```text
SAME_SHA_VALIDATION_FAILED
OPERATIONAL_VALIDATION_BLOCKED
REAL_PILOT_BLOCKED
```

### 14.3 Proibição de autorização prematura

Não emitir:

```text
REAL_PILOT_AUTHORISED
PRODUCTION_READY
REAL_CUSTOMER_VALIDATED
```

com base em DEMO, fixture, mock, aprovação simulada, entrega interna ou recibo de CI capturado antes da conclusão.

O piloto real só poderá ser autorizado numa execução posterior em `OPERATIONAL_PILOT`, com entrada externa real, autorização real, revisão humana independente, credenciais reais, entrega real e pacote forense completo ligado ao mesmo SHA.

## 15. Formato do relatório final

Apresente o resultado final nesta ordem:

1. resumo executivo;
2. SHA e identificação do repositório;
3. alterações realizadas por requisito;
4. ficheiros modificados;
5. testes executados e resultados;
6. cadeia same-SHA completa;
7. evidências físicas e hashes;
8. matriz `Requirement → Code → Test → Evidence`;
9. bloqueios residuais;
10. classificação final.

Se qualquer prova estiver ausente, declare explicitamente a lacuna. Não substitua evidência física por afirmações, nomes de ficheiros, valores fictícios ou conclusões inferidas.

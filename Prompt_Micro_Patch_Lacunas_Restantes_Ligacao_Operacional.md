# Prompt — Micro-patch das lacunas restantes da ligação operacional

## Objectivo

Não criar um novo módulo funcional, não ampliar a arquitectura e **não executar ainda o piloto real**.

Aplicar somente um micro-patch final para fechar as seis lacunas remanescentes detectadas no SHA:

```text
4064423a441baa10c6bf8a6d1931ac3c02ed6406
```

O estado actual já comprova CI, intake, Etapa A e Etapa B em `DEMO` no mesmo SHA, `npm run verify` com exit code `0`, environment protegido e árvore limpa. Este patch não deve repetir trabalho já concluído nem criar outro relatório extenso.

## Classificação de partida

```text
OPERATIONAL_LINKAGE_VERIFIED_IN_DEMO
— SAME_SHA_CI_AND_WORKFLOWS_CONFIRMED
— GITHUB_ENVIRONMENT_PROTECTED
— FULL_INTAKE_TO_STAGE_A_CHAIN_NOT_YET_PROVEN
— REAL_PILOT_NOT_EXECUTED
```

## Correcções obrigatórias

### 1. Fazer a Etapa A consumir exactamente o artefacto produzido pelo intake

O workflow da Etapa A não pode voltar a gerar localmente uma nova entrada quando existir um intake DEMO válido.

Implementar a cadeia real de ligação demonstrativa:

```text
Intake DEMO
  → artefacto de intake exacto
  → Etapa A DEMO
  → artefacto da Etapa A exacto
  → Etapa B DEMO
```

Requisitos:

- tornar obrigatórios na Etapa A DEMO:
  - `intake_run_id`;
  - `input_artifact_id`;
  - `input_artifact_name`;
  - `input_package_sha256`;
  - `intake_head_sha` ou equivalente estritamente validado;
- consultar a API do run e do artefacto do intake antes do download;
- validar repositório, workflow, run, SHA, branch, estado, conclusão, nome, ID, tamanho e expiração;
- descarregar pelo ID exacto do artefacto;
- confirmar novamente o SHA-256 dos bytes preservados de `original-package.tar.gz`;
- impedir que a Etapa A execute `prepare-demo-pilot-input.mjs` para criar uma segunda entrada independente;
- preservar no artefacto da Etapa A os recibos que identificam o intake consumido;
- fazer o manifesto da Etapa A ligar explicitamente o seu run e artefacto ao run e artefacto do intake;
- rejeitar qualquer divergência entre input do workflow, API, pacote, recibos, SQLite e manifesto.

Não reintroduzir base64, URL arbitrária ou dados empresariais reais.

### 2. Preservar os bytes brutos das respostas da API

Os scripts não devem tratar como “resposta física” um objecto reconstruído com `JSON.parse()` seguido de `JSON.stringify()`.

Para cada consulta relevante:

- capturar directamente os bytes devolvidos por `gh api` ou pela chamada HTTP autenticada;
- gravar esses bytes sem alteração num ficheiro próprio;
- calcular SHA-256 sobre os bytes exactos recebidos;
- apenas depois fazer o parse JSON para validação semântica;
- manter metadados derivados num sidecar separado;
- incluir no sidecar:
  - endpoint exacto;
  - data posterior à conclusão da consulta;
  - actor da consulta;
  - repository ID;
  - workflow ID e caminho;
  - run ID e run attempt;
  - artefacto ID;
  - head SHA;
  - status e conclusão;
  - nome do ficheiro bruto;
  - SHA-256 dos bytes brutos;
- verificar o hash do ficheiro bruto antes de o manifesto ou qualquer atestação o aceitar;
- impedir que o sidecar substitua, incorpore ou reconstrua a resposta original.

Aplicar isto, no mínimo, às respostas de:

- run do intake;
- artefacto do intake;
- run da Etapa A;
- artefacto da Etapa A;
- environment `protected-pilot`;
- branch protection ou ruleset usado como controlo obrigatório.

### 3. Tornar todas as validações estritamente tipadas e exactas

Eliminar permissividade nas verificações de proveniência:

- aceitar `stage_a_head_sha` e `intake_head_sha` somente como SHA Git de **40 caracteres hexadecimais minúsculos**;
- exigir `run_attempt` como `number`, inteiro seguro e `>= 1`;
- exigir IDs como `number`, inteiros seguros e positivos nas respostas da API;
- não converter strings numéricas com `Number()` para fazer uma resposta inválida passar;
- exigir igualdade exacta do caminho do workflow, por exemplo:

```text
.github/workflows/operational-pilot-stage-a.yml
```

- validar o `workflow_id` canónico correspondente, obtido e confirmado pela API;
- exigir no objecto `artifact.workflow_run`:
  - `id` exacto;
  - `repository_id === 1363667011`;
  - `head_repository_id === 1363667011`;
  - `head_branch === "master"`;
  - `head_sha` exacto;
- exigir `expired === false`, nunca apenas ausência de valor verdadeiro;
- exigir `size_in_bytes` numérico, inteiro seguro e maior que zero;
- validar URL do artefacto e digest fornecido pelo GitHub quando estiver disponível;
- rejeitar campos ausentes, nulos, decimais, strings numéricas ou valores adicionais contraditórios.

Adicionar testes negativos específicos para cada um desses casos.

### 4. Aplicar limites durante a descompressão e validar integralmente o ZIP

O limite de expansão deve actuar durante a descompressão, antes de uma entrada maliciosa consumir memória excessiva.

No extractor seguro existente:

- configurar `maxOutputLength` ou mecanismo equivalente na descompressão DEFLATE;
- interromper a operação assim que o limite individual ou total for ultrapassado;
- não confiar apenas no tamanho não comprimido declarado no directório central;
- validar CRC32 de cada entrada;
- comparar directório central e cabeçalho local quanto a:
  - nome;
  - método;
  - tamanho comprimido;
  - tamanho descomprimido;
  - flags relevantes;
- rejeitar data descriptors ou variantes não suportadas, em vez de interpretá-las parcialmente;
- rejeitar ZIP64 se não existir suporte explícito e testado;
- manter limites de quantidade, tamanho total, tamanho individual, taxa de expansão e nomes autorizados;
- garantir limpeza do directório temporário mesmo quando a extracção falhar;
- garantir que nenhum ficheiro seja escrito antes da pré-auditoria integral do arquivo.

Adicionar testes negativos com:

- tamanho anunciado inferior à saída real;
- CRC inválido;
- nome divergente entre cabeçalho central e local;
- método divergente;
- `run_attempt` de descompressão que ultrapasse `maxOutputLength`;
- ZIP truncado;
- ZIP64 não suportado;
- entrada com data descriptor não suportado.

### 5. Proibir mocks em qualquer execução operacional

Os parâmetros e variáveis:

```text
--mock-api-response
--mock-branch-response
MOCK_ENV_API_RESPONSE
MOCK_BRANCH_API_RESPONSE
```

devem ser aceites exclusivamente em testes isolados ou em modo `DEMO` explicitamente marcado.

Quando `mode === "OPERATIONAL_PILOT"`:

- a presença de qualquer mock deve produzir erro imediato;
- a API real deve ser consultada;
- ausência do cliente, credencial, permissão ou resposta deve falhar fechada;
- não pode existir fallback para ficheiro local, fixture ou resposta simulada;
- o recibo deve declarar a origem real da consulta;
- o manifesto deve rejeitar recibos administrativos marcados como mock, demo ou fixture.

Adicionar um teste negativo que execute o verificador em `OPERATIONAL_PILOT` com cada mecanismo de mock e confirme exit code diferente de zero.

### 6. Reordenar a Etapa B para validar antes de executar código do SHA fornecido

O workflow não deve fazer checkout e executar scripts provenientes de `stage_a_head_sha` antes de confirmar que esse SHA pertence ao run autorizado da Etapa A.

Adoptar esta ordem:

1. checkout do SHA confiável que disparou a Etapa B ou do SHA actual da definição protegida do workflow;
2. consulta das respostas brutas da API;
3. validação integral do run, artefacto, repositório, workflow, branch, SHA, estado e conclusão;
4. comparação de `stage_a_head_sha` com o SHA confirmado pela API;
5. somente depois, checkout do SHA validado, se ainda for necessário;
6. confirmação de que o ficheiro de workflow e os scripts críticos correspondem à versão autorizada;
7. download e extracção segura do artefacto;
8. execução da Etapa B.

Não executar scripts, hooks, instalações, builds ou código do SHA indicado pelo input antes da validação.

Adicionar testes que comprovem o bloqueio de:

- SHA inexistente;
- SHA válido do repositório, mas pertencente a outro run;
- commit antigo com reconciliador menos rigoroso;
- artefacto correcto combinado com SHA errado;
- run correcto combinado com workflow errado.

## Ajuste administrativo recomendado

O environment está protegido, mas actualmente permite que o mesmo utilizador inicie e aprove a execução.

Sem inventar utilizadores ou alterar acessos sem autorização:

- configurar `prevent_self_review: true`, se suportado;
- adicionar um segundo revisor humano real e autorizado, quando indicado pelo proprietário;
- se ainda não houver segundo revisor, manter o piloto real bloqueado e registar a limitação de segregação de funções.

Esta configuração não deve ser simulada.

## Execuções obrigatórias no SHA final

Depois das correcções, executar num único SHA final:

```bash
npm ci
npm audit --omit=dev
npm run verify
git status --short
```

Executar também:

1. CI principal;
2. intake DEMO;
3. Etapa A DEMO consumindo exactamente o artefacto do intake;
4. Etapa B DEMO consumindo exactamente o artefacto da Etapa A;
5. verificação remota;
6. atestação final e pós-fecho aplicáveis.

Repetir `npm run verify` num checkout criado dentro de um directório de `mktemp -d`.

Todos os runs devem comprovar:

```text
head_sha = SHA final único
status = completed
conclusion = success
run_attempt = inteiro >= 1
repository.id = 1363667011
head_repository.id = 1363667011
```

Preservar os recibos e respostas brutas em artefactos não versionados. Não criar um commit documental posterior para inserir IDs ou conclusões.

## Critérios de aceitação

O micro-patch somente estará concluído quando:

- a Etapa A consumir fisicamente o mesmo pacote produzido pelo intake;
- intake, Etapa A e Etapa B formarem uma cadeia contínua verificável;
- todas as respostas da API forem preservadas nos seus bytes brutos;
- os hashes das respostas brutas forem recalculados e validados;
- IDs, SHA, workflow, branch, tipos, estado e conclusão forem estritos;
- a descompressão respeitar limites durante a operação;
- CRC e cabeçalhos central/local forem reconciliados;
- mocks forem impossíveis em `OPERATIONAL_PILOT`;
- a Etapa B validar o SHA antes de executar código proveniente dele;
- `npm ci`, `npm audit --omit=dev` e `npm run verify` passarem;
- o checkout temporário também passar;
- os workflows DEMO terminarem no mesmo SHA;
- a árvore Git terminar limpa;
- nenhum piloto real tiver sido executado.

## Restrições

- Não criar novo módulo funcional, nova arquitectura ou novo relatório extenso.
- Não executar o piloto real.
- Não introduzir dados empresariais reais.
- Não reintroduzir base64, URL arbitrária, assinatura ou token em inputs normais.
- Não aceitar mocks no caminho operacional.
- Não usar fallbacks de SHA, ID, workflow, segredo, autorização, estado ou conclusão.
- Não mascarar falhas com `continue-on-error`, `|| true` ou testes ignorados.
- Não reconstruir respostas da API e apresentá-las como bytes físicos.
- Não criar uma nova cadeia de commits documentais.

## Classificação permitida após conclusão

Se todas as correcções e execuções DEMO passarem:

```text
FULL_OPERATIONAL_LINKAGE_VERIFIED_IN_DEMO
— INTAKE_TO_STAGE_A_TO_STAGE_B_CHAIN_CONFIRMED
— SAME_SHA_CI_AND_FORENSIC_EVIDENCE_CONFIRMED
— REAL_PILOT_NOT_EXECUTED
```

Se faltar segregação humana independente ou qualquer controlo externo:

```text
OPERATIONAL_LINKAGE_TECHNICALLY_CLOSED
— HUMAN_SEGREGATION_OR_EXTERNAL_CONTROL_PENDING
— REAL_PILOT_BLOCKED
```

O piloto real somente poderá ser considerado num pedido futuro, separado e expressamente autorizado.

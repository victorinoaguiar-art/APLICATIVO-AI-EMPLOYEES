# Prompt — Micro-patch final de ligação operacional no mesmo SHA

## Objectivo

Não criar um novo módulo, não ampliar a arquitectura e **não executar ainda o piloto real**.

Aplicar apenas um micro-patch correctivo para fechar as falhas de ligação detectadas no commit `dd460060c8fae7ac197ea85425982c23bcb37eda`, mantendo todas as execuções em `DEMO` ou `SIMULATION`.

O resultado deve corrigir o código, configurar os controlos administrativos possíveis no GitHub e executar todas as verificações no **mesmo SHA final**, sem criar posteriormente outro commit apenas para alterar relatórios ou classificações.

## Estado actual comprovado

- A CI principal do SHA `dd460060c8fae7ac197ea85425982c23bcb37eda` terminou com sucesso.
- A Etapa A foi executada com sucesso em modo `DEMO`.
- A suite específica contém 34 testes e passou.
- Um checkout limpo executado dentro de `/tmp` obteve `763 PASS / 1 FAIL` em `npm run verify`.
- O fluxo completo intake → Etapa A → Etapa B não foi comprovado no mesmo SHA.
- O environment `protected-pilot` continua com:
  - `protection_rules: []`;
  - `deployment_branch_policy: null`;
  - `can_admins_bypass: true`.

Classificação de partida:

```text
LINKAGE_PATCH_PARTIALLY_IMPLEMENTED
— GITHUB_CI_GREEN
— DEMO_STAGE_A_EXECUTED
— LOCAL_VERIFY_FAILED
— INTAKE_AND_STAGE_B_NOT_PROVEN
— REAL_PILOT_BLOCKED
```

## Correcções obrigatórias

### 1. Corrigir e centralizar o ID canónico do repositório

- Substituir o valor incorrecto `924840897` por `1363667011` em todo o caminho operacional.
- Procurar no repositório quaisquer IDs anteriores, contraditórios ou duplicados.
- Manter uma única fonte canónica já existente ou uma constante partilhada apropriada, sem criar um novo módulo funcional.
- Fixar também o nome canónico:

```text
victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES
```

- Não permitir que `GITHUB_REPOSITORY` ou outro valor de ambiente substitua silenciosamente a identidade canónica no modo `OPERATIONAL_PILOT`.
- Adicionar testes negativos para ID ausente, ID antigo, ID divergente, repositório divergente e tentativa de substituição por variável de ambiente.

### 2. Tornar `repository_id` e `head_repository_id` estritamente obrigatórios

Nas respostas da API relativas ao run e ao artefacto:

- exigir `repository.id === 1363667011`;
- exigir `head_repository.id === 1363667011`;
- exigir `workflow_run.repository_id === 1363667011`;
- exigir `workflow_run.head_repository_id === 1363667011`;
- exigir igualdade entre os dois IDs;
- falhar se qualquer campo estiver ausente, nulo, não numérico, não inteiro ou divergente.

Remover verificações condicionais do tipo:

```js
if (value && value !== EXPECTED_VALUE)
```

Um campo de proveniência obrigatório ausente deve produzir falha fechada.

### 3. Reconciliar a Etapa B com a Etapa A antes do download

Antes de descarregar o artefacto da Etapa A, consultar e preservar fisicamente:

```text
GET /repos/{owner}/{repo}/actions/runs/{stage_a_run_id}
GET /repos/{owner}/{repo}/actions/artifacts/{stage_a_artifact_id}
```

Validar obrigatoriamente:

- repository ID e head repository ID canónicos;
- `workflow_run.id === stage_a_run_id`;
- workflow exacto `.github/workflows/operational-pilot-stage-a.yml`;
- `workflow_id` esperado, quando disponível pela API;
- `head_branch === "master"`;
- `head_sha === stage_a_head_sha`;
- `status === "completed"`;
- `conclusion === "success"`;
- `run_attempt` inteiro e maior ou igual a 1;
- nome exacto do artefacto `aetf-pilot-stage-a-${stage_a_head_sha}`;
- `expired === false`;
- tamanho do artefacto maior que zero;
- URL e associação do artefacto ao repositório esperado.

Somente depois de todas as verificações passarem o download pode começar.

Preservar as duas respostas físicas da API, sem reconstrução sintética, juntamente com:

- URL consultada;
- data posterior à consulta;
- SHA-256 dos bytes exactos da resposta;
- repository ID;
- workflow;
- run ID;
- run attempt;
- artefacto ID;
- head SHA;
- estado e conclusão.

O `stage_a_run_id` não pode continuar limitado a uma mera validação numérica. Deve ser reconciliado integralmente com o artefacto, o SQLite, os recibos e o manifesto.

### 4. Remover completamente a assinatura dos inputs normais

- Eliminar `review_signature_receipt` do `workflow_dispatch` da Etapa B.
- Eliminar qualquer fallback que permita obter a assinatura de `github.event.inputs`.
- Rejeitar `review_signature`, `review_signature_receipt`, `signature` ou equivalente quando fornecidos como input normal ou argumento CLI no modo operacional.
- Receber a assinatura somente por secret do environment protegido ou por payload físico proveniente de um canal externo autenticado e autorizado.
- Não imprimir assinatura, token, sessão ou segredo nos logs.
- Não colocar segredos na linha de comandos.
- O workflow não pode gerar a própria assinatura, token, sessão ou aprovação no modo operacional.

No modo `DEMO`, qualquer assinatura sintética deve ser inequivocamente marcada como demonstrativa e nunca reutilizada ou classificada como aprovação real.

### 5. Corrigir `review_signature_sha256`

O campo `review_signature_sha256` deve conter o SHA-256 dos bytes canónicos da assinatura recebida, nunca a assinatura em texto simples.

Implementar as seguintes regras:

- validar primeiro a assinatura original;
- calcular depois `sha256(signatureBytes)`;
- persistir no recibo somente o digest hexadecimal de 64 caracteres;
- nunca persistir a assinatura original em recibos, manifesto ou logs;
- manter a assinatura apenas durante o tempo estritamente necessário à validação;
- comparar recibo, SQLite e manifesto quanto ao mesmo digest;
- actualizar o schema Ajv para exigir exactamente 64 caracteres hexadecimais minúsculos;
- adicionar teste que confirme que o valor persistido não é igual à assinatura original;
- adicionar teste de alteração de um byte da assinatura.

### 6. Proteger a extracção de todos os contentores externos

A auditoria actualmente protege o TAR interno, mas os ZIPs descarregados do GitHub ainda não podem ser extraídos cegamente com `tar -xf`.

- Remover a extracção directa dos ZIPs externos com `tar -xf`.
- Utilizar a action oficial fixada por SHA ou estender o extractor seguro existente para inspeccionar e extrair ZIP sem criar um novo módulo funcional.
- Antes de qualquer escrita, rejeitar:
  - caminhos absolutos;
  - `..` e escapes após normalização;
  - symlinks e hardlinks;
  - devices, FIFOs, sockets e tipos especiais;
  - nomes duplicados ou colisões após normalização;
  - ficheiros inesperados;
  - quantidade excessiva de entradas;
  - tamanho individual ou total excessivo;
  - taxa de expansão excessiva;
  - arquivo vazio, truncado ou estruturalmente inválido.
- Aplicar limite de descompressão durante a operação, antes de carregar potencialmente todo o conteúdo expandido em memória.
- Extrair apenas para directório criado por mecanismo temporário seguro.
- Confirmar, depois da extracção, que cada caminho real permanece dentro do directório autorizado.
- Aplicar estas regras tanto ao artefacto de intake como ao artefacto da Etapa A.

### 7. Corrigir ou remover o caminho `DEMO` do workflow de intake

O workflow de intake `DEMO` gera actualmente nomes incompatíveis com o verificador.

Escolher apenas uma das seguintes soluções:

#### Opção preferida: corrigir o intake DEMO

- gerar exactamente:
  - `operational-pilot-input.json`;
  - `authorization-document.pdf`;
  - `input-package.sha256`;
  - `package-provenance.json`;
- usar exclusivamente organizações, pessoas, tarefas e documentos inequivocamente fictícios;
- criar o arquivo demonstrativo dentro do workflow;
- calcular internamente o SHA-256 depois da criação;
- passar esse hash calculado ao verificador;
- não exigir que o utilizador conheça antecipadamente o hash de um pacote ainda não criado;
- preservar o arquivo e o hash físicos.

#### Alternativa aceitável: remover o intake DEMO

Se não for possível gerar um pacote demonstrativo coerente sem complicar o workflow, remover a opção `DEMO` do intake e testar o intake com um artefacto fictício previamente carregado por um fluxo protegido de testes.

Em qualquer opção, não reintroduzir base64, URL arbitrária ou dados empresariais reais.

### 8. Corrigir o teste N11 e a validação de caminhos temporários

Corrigir a falha:

```text
N11. Rejeita pasta irmã que partilha apenas o prefixo da raiz do repositório
```

A validação não pode aceitar automaticamente qualquer caminho apenas porque está dentro de `os.tmpdir()`.

Implementar uma regra explícita:

- por defeito, o directório de evidência deve estar estritamente dentro do repositório;
- um directório temporário externo só pode ser usado quando o chamador fornecer explicitamente uma raiz temporária autorizada criada por `mkdtemp` ou mecanismo equivalente;
- verificar inclusão com `path.relative`, nunca com simples `startsWith`;
- uma pasta irmã como `${repositoryRoot}-sibling` deve ser sempre rejeitada;
- o comportamento deve ser igual em POSIX e Windows;
- o teste deve passar quando o próprio checkout estiver dentro de `/tmp`.

Executar a suite a partir de, pelo menos:

- checkout normal;
- checkout criado com `mktemp -d`;
- caminhos POSIX simulados;
- caminhos `path.win32` simulados.

### 9. Configurar os controlos administrativos reais do GitHub

Esta parte exige um administrador humano autorizado. Não inventar revisores, IDs, configurações, credenciais ou respostas da API.

Configurar:

- pelo menos um required reviewer real no environment `protected-pilot`;
- política de deployment limitada à branch `master` ou à branch expressamente aprovada;
- `can_admins_bypass: false`, quando suportado pelo plano e autorizado pela política;
- secrets operacionais apenas no environment protegido;
- branch protection ou ruleset com checks obrigatórios;
- bloqueio de bypass conforme as capacidades reais do plano GitHub.

Preservar respostas físicas da API do environment e da protecção da branch. Cada resposta deve conter ou estar ligada a:

- endpoint consultado;
- repositório;
- repository ID;
- environment ou branch;
- data real da consulta;
- actor da consulta;
- SHA relacionado;
- hash dos bytes físicos.

Se as permissões ou o plano não permitirem alguma configuração:

- não simular sucesso;
- manter o gate bloqueado;
- indicar exactamente o controlo indisponível;
- manter o piloto real proibido.

### 10. Executar toda a cadeia no mesmo SHA final

Depois de concluir o código e a configuração administrativa, criar um único commit final e executar, nesse mesmo SHA:

1. `npm ci` num checkout limpo;
2. `npm audit --omit=dev`;
3. `npm run verify` num checkout normal;
4. `npm run verify` num checkout localizado dentro de directório criado com `mktemp -d`;
5. CI principal;
6. workflow de intake em `DEMO` ou teste fictício equivalente;
7. Etapa A em `DEMO`, consumindo exactamente o artefacto produzido pelo intake;
8. Etapa B em `DEMO`, consumindo exactamente o run, artefacto, desafio e SHA da Etapa A;
9. verificações remotas e atestação aplicáveis.

Todas as execuções devem apresentar:

```text
head_sha = SHA final
status = completed
conclusion = success
run_attempt >= 1
repository.id = 1363667011
head_repository.id = 1363667011
```

Preservar os recibos físicos dos runs, jobs e artefactos. Não criar um novo commit posterior apenas para inserir IDs, URLs ou conclusões no repositório. Os recibos de execução devem permanecer em artefactos não versionados ou armazenamento de evidências apropriado.

## Testes negativos obrigatórios

Adicionar ou corrigir testes que comprovem a rejeição de:

1. repository ID antigo `924840897`;
2. `repository_id` ausente, nulo ou divergente;
3. `head_repository_id` ausente, nulo ou divergente;
4. repositório alterado por variável de ambiente;
5. run e artefacto pertencentes a execuções diferentes;
6. artefacto da Etapa A associado a outro SHA, branch ou workflow;
7. run não concluído ou com conclusão diferente de `success`;
8. artefacto expirado, vazio ou com nome divergente;
9. assinatura fornecida por input normal ou CLI;
10. assinatura original persistida no recibo;
11. digest da assinatura malformado ou divergente;
12. ZIP com path traversal, caminho absoluto, symlink, colisão ou expansão excessiva;
13. intake DEMO com nomes incompatíveis ou hash não comprovado;
14. pasta irmã que partilha apenas o prefixo do repositório;
15. checkout integral situado em `/tmp`;
16. environment sem reviewer, branch policy ou bloqueio de bypass;
17. qualquer divergência entre intake, Etapa A, Etapa B, API, SQLite, recibos e manifesto.

## Critérios de aceitação

O micro-patch somente pode ser considerado concluído quando:

- não existir no caminho operacional qualquer repository ID diferente de `1363667011`;
- todos os IDs de repositório forem obrigatórios e fail-closed;
- a Etapa B validar fisicamente run e artefacto antes do download;
- não existir assinatura em inputs normais ou argumentos CLI;
- `review_signature_sha256` contiver apenas o hash real da assinatura;
- nenhum ZIP ou TAR externo for extraído sem auditoria prévia;
- o intake DEMO estiver coerente ou tiver sido removido;
- o teste N11 passar dentro e fora de `/tmp`;
- `npm ci`, `npm audit --omit=dev` e `npm run verify` terminarem com exit code `0`;
- intake, Etapa A, Etapa B e CI terminarem no mesmo SHA;
- o environment e a branch estiverem protegidos por configuração real ou o sistema permanecer explicitamente bloqueado;
- a árvore Git terminar limpa;
- nenhum piloto real tiver sido executado.

## Entregáveis

1. Alterações mínimas nos workflows, scripts, schemas e testes existentes.
2. Relação exacta dos ficheiros alterados.
3. SHA final único.
4. Resultado integral de `npm ci`, `npm audit --omit=dev` e das duas execuções de `npm run verify`.
5. IDs e URLs do intake DEMO, Etapa A DEMO, Etapa B DEMO e CI principal.
6. Respostas físicas da API dos runs, artefactos, environment e branch protection.
7. Estado explícito de required reviewers, branch policy e bypass administrativo.
8. Confirmação de árvore limpa.
9. Lista objectiva de qualquer bloqueio externo remanescente.

## Restrições

- Não criar novo módulo funcional, novo relatório extenso ou nova arquitectura.
- Não executar o piloto real.
- Não utilizar dados empresariais reais.
- Não reintroduzir pacote base64, URL arbitrária, token ou assinatura em input normal.
- Não usar fallbacks de SHA, ID, workflow, conclusão, assinatura, segredo ou autorização.
- Não reconstruir respostas da API para aparentar sucesso.
- Não ignorar testes, não usar `continue-on-error` e não mascarar exit codes.
- Não criar um commit documental posterior ao SHA executado.

## Classificação permitida após conclusão

Se todos os testes e workflows DEMO passarem, mas ainda não tiver ocorrido execução operacional autorizada:

```text
OPERATIONAL_LINKAGE_VERIFIED_IN_DEMO
— SAME_SHA_CI_AND_WORKFLOWS_CONFIRMED
— REAL_PILOT_NOT_EXECUTED
```

Se qualquer controlo administrativo continuar ausente:

```text
OPERATIONAL_LINKAGE_CODE_HARDENED
— GITHUB_ADMINISTRATIVE_PROTECTION_INCOMPLETE
— REAL_PILOT_BLOCKED
```

Somente um pedido futuro, separado e expressamente autorizado poderá iniciar o piloto real.

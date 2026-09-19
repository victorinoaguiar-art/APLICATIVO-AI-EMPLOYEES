# Prompt: patch de autenticidade operacional do piloto real

## Contexto

O commit `219db053a5295252f8fad6dff75b11f5113a0e7b` implementou uma infraestrutura tecnicamente funcional para um piloto operacional, incluindo persistência transaccional, documentos físicos, leitores independentes, idempotência, manifesto e testes de integração.

Contudo, a execução actual não comprova um piloto empresarial real porque a própria aplicação:

- gera os dados empresariais e o documento de autorização;
- utiliza nomes, datas, cliente, factura, montante e revisor hard-coded;
- contém um segredo fallback versionado;
- emite o token e cria a sessão do revisor;
- gera a assinatura e submete automaticamente `APPROVED`;
- utiliza um ambiente GitHub sem regras efectivas de protecção;
- ignora os inputs `tenant_id` e `task_id` informados no `workflow_dispatch`.

Esta execução deve ser tratada como demonstração automatizada. Não ampliar o módulo existente. Corrigir apenas a autenticidade operacional e a separação humana.

## Objectivo

Manter a infraestrutura existente, mas garantir que:

1. a execução actual seja correctamente classificada como `DEMO` ou `SIMULATION`;
2. um piloto real só possa começar com dados e autorização recebidos de uma fonte externa ao repositório;
3. o código não possa emitir a própria autorização, identidade, sessão, assinatura ou aprovação;
4. uma pessoa autenticada e autorizada realize a revisão numa etapa separada;
5. o workflow falhe de forma fechada perante qualquer ausência ou divergência;
6. `APPROVED_AND_ARCHIVED` só seja emitido após revisão humana fisicamente comprovada.

## Âmbito obrigatório

Modificar somente os componentes já criados para o piloto, os respectivos testes e o workflow operacional. Não criar outro motor, subsistema, framework, relatório ou cadeia de evidências.

## 1. Reclassificar a execução actual

Renomear todas as declarações relativas ao cenário hard-coded actual para uma classificação verdadeira, por exemplo:

```text
CONTROLLED_OPERATIONAL_DEMO
SIMULATION
AUTOMATED_DEMO_EXECUTED
```

Requisitos:

- retirar `REAL` dos nomes, logs, estados, artefactos e classificações associados ao cenário interno;
- impedir que dados gerados pelo repositório recebam classificação de piloto real;
- renomear o workflow actual ou separar explicitamente o modo `DEMO` do caminho operacional;
- conservar o cenário apenas como teste/demonstração, sem elegibilidade para evidência operacional externa;
- garantir que manifestos, cardinalidades e relatórios excluam esta execução de contagens reais.

## 2. Remover todos os dados empresariais hard-coded

Eliminar do caminho operacional qualquer valor incorporado relativo a:

- tenant;
- organização;
- cliente;
- NIF;
- factura;
- valor;
- moeda;
- IBAN;
- endereço electrónico;
- tarefa;
- autorização;
- pessoa autorizadora;
- revisor;
- datas;
- `idempotency_key`;
- destino;
- comentários de aprovação.

O script de preparação não pode fabricar uma organização, autorização ou tarefa. Pode apenas:

1. receber um pacote externo;
2. verificar a sua existência e integridade;
3. validar o schema;
4. calcular hashes dos bytes recebidos;
5. copiar os bytes para a área efémera de execução sem os modificar.

Mover os dados fictícios necessários aos testes para fixtures claramente identificadas, dentro do caminho exclusivo de testes ou demonstração.

## 3. Eliminar o segredo fallback

Remover imediatamente qualquer expressão equivalente a:

```yaml
secrets.PILOT_SECRET_REV_MARIA || 'valor-incorporado'
```

Requisitos:

- não manter segredo default, fallback, exemplo operacional ou chave derivada de valor conhecido;
- exigir os secrets reais exclusivamente no ambiente protegido;
- terminar antes da instalação ou execução operacional quando qualquer secret obrigatório estiver ausente;
- não imprimir o valor, comprimento, prefixo, sufixo ou hash reutilizável do secret;
- actualizar `verify:security` para detectar segredos fallback em YAML, JavaScript, TypeScript e expressões GitHub Actions;
- adicionar teste de regressão específico para o fallback removido.

## 4. Receber input e autorização físicos externos

O caminho operacional deve aceitar somente um pacote previamente fornecido e autorizado fora do repositório.

O pacote deve conter, no mínimo:

```text
operational-pilot-input.json
authorization-document.pdf
input-package.sha256
```

O workflow deve receber apenas uma referência segura ao pacote, por exemplo:

- artifact ID de um workflow de intake autorizado;
- referência imutável num armazenamento protegido;
- caminho disponibilizado pelo ambiente protegido;
- outro mecanismo externo aprovado que preserve bytes e proveniência.

Requisitos:

- não versionar o pacote;
- não gerar o PDF de autorização dentro do workflow operacional;
- preservar os bytes exactos recebidos;
- verificar o hash do pacote antes de interpretar os dados;
- validar que o hash do PDF corresponde ao declarado no JSON;
- registar origem, momento de recepção e identificador externo;
- rejeitar pacote produzido pelo mesmo run operacional;
- rejeitar pacote sem proveniência externa verificável;
- rejeitar fixtures, demonstrações, placeholders e dados sintéticos no modo real.

## 5. Utilizar efectivamente os inputs do workflow

Os inputs `tenant_id` e `task_id` devem ser obrigatórios e usados na execução.

Depois de carregar o pacote externo, comparar exactamente:

```text
workflow tenant_id === pacote tenant_id === SQLite tenant_id
workflow task_id   === pacote task_id   === SQLite task_id
```

Rejeitar:

- input vazio;
- input ignorado;
- diferença de maiúsculas/minúsculas quando os identificadores forem case-sensitive;
- tenant ou tarefa diferente do pacote;
- valores substituídos por constantes internas;
- reutilização de pacote autorizado para outra tarefa.

Adicionar teste que execute o workflow ou o parser com valores divergentes e confirme exit code diferente de zero.

## 6. Proibir autoemissão de identidade e aprovação

No caminho operacional real, remover ou bloquear:

- `tokenService.signToken(...)` usado para criar o token do revisor;
- criação automática de sessão quando nenhuma sessão persistente válida existe;
- geração automática da assinatura quando `signature` não for fornecida;
- decisão fixa `APPROVED`;
- comentários de aprovação predeterminados;
- escolha automática do primeiro revisor;
- `allowed_decision: 'APPROVED'` como única decisão.

Exigir externamente:

- token válido emitido antes da revisão;
- conta persistente activa;
- sessão persistente activa e não expirada;
- identidade exacta do revisor;
- tenant e função autorizada;
- decisão explícita `APPROVE`, `REJECT` ou `REQUEST_CHANGES`;
- assinatura sobre o desafio, hash do documento, decisão e timestamp;
- comentários humanos quando exigidos pela política.

Se qualquer elemento estiver ausente, a execução deve permanecer em `PENDING_HUMAN_REVIEW`.

## 7. Separar a revisão humana

Dividir a execução em duas etapas independentes:

### Etapa A — preparação e desafio

- recebe o pacote externo;
- valida autorização e tenant;
- executa a tarefa;
- gera e valida os documentos;
- emite o desafio ligado aos hashes;
- persiste estado e artefactos;
- termina em `PENDING_HUMAN_REVIEW`;
- não aprova, não assina e não arquiva.

### Etapa B — decisão humana

Executada por um segundo job, segundo workflow manual ou interface autenticada:

- recupera o mesmo estado persistido;
- exige identidade e sessão externas;
- apresenta ou referencia os bytes exactos;
- recebe decisão e assinatura humanas;
- valida desafio, hash, tenant, tarefa, revisor e timestamp;
- consome o desafio uma única vez;
- arquiva somente após aprovação válida;
- mantém `REJECTED` ou `CHANGES_REQUESTED` quando aplicável.

O processo que executa a Etapa A não pode fornecer as credenciais ou decidir pela Etapa B.

## 8. Proteger realmente o ambiente GitHub

Configurar `protected-pilot` com regras efectivas no GitHub:

- required reviewers identificados;
- pelo menos uma aprovação obrigatória;
- impedir autoaprovação pelo mesmo actor que iniciou a execução, quando suportado;
- limitar branches ou tags autorizadas;
- manter permissões mínimas;
- desactivar bypass administrativo, se compatível com a governação adoptada;
- armazenar os secrets somente no environment;
- impedir execução quando o ambiente não tiver regras de protecção.

Criar uma verificação read-only da API do GitHub que confirme antes do piloto real:

```text
environment.name === protected-pilot
protection_rules.length > 0
required reviewers presentes
deployment branch policy configurada
secrets obrigatórios disponíveis ao job
```

Não inventar um recibo local de protecção. Preservar a resposta física da API, removendo apenas dados secretos que nunca devem ser retornados.

Se a configuração depender de permissões administrativas indisponíveis no código, interromper a execução e reportar `BLOCKED_ENVIRONMENT_PROTECTION_NOT_CONFIGURED`. Não contornar a configuração.

## 9. Falhar sem secret ou autorização real

Antes de executar a tarefa, aplicar um gate obrigatório que verifique:

- pacote externo disponível;
- proveniência verificável;
- manifesto de hashes válido;
- documento físico de autorização presente;
- hash da autorização correcto;
- tenant e tarefa coincidentes;
- ambiente protegido;
- secrets obrigatórios presentes;
- identidade e revisor previamente registados.

Qualquer falha deve:

- terminar com exit code diferente de zero;
- não gerar documentos empresariais;
- não criar aprovação, assinatura ou entrega;
- não classificar como piloto executado;
- registar apenas o motivo técnico mínimo, sem expor dados sensíveis.

## 10. Classificação final permitida

Enquanto forem utilizados dados internos ou aprovação automática:

```text
AUTOMATED_OPERATIONAL_DEMO_EXECUTED
```

Após preparação real, mas antes da decisão humana:

```text
CONTROLLED_REAL_PILOT_PENDING_HUMAN_REVIEW
```

Após revisão humana real e sem canal externo:

```text
CONTROLLED_REAL_PILOT_EXECUTED — HUMAN_REVIEW_CONFIRMED — APPROVED_AND_ARCHIVED
```

Não permitir esta última classificação quando:

- a fonte tiver sido gerada pelo repositório;
- a autorização tiver sido autoemitida;
- o ambiente não estiver protegido;
- o token, sessão, assinatura ou decisão tiver sido criado automaticamente;
- não existir prova física da intervenção humana.

## Testes obrigatórios

Adicionar ou corrigir testes que comprovem:

1. dados hard-coded não são aceites no modo real;
2. pacote produzido pelo próprio run é rejeitado;
3. pacote externo ausente bloqueia a execução;
4. autorização ausente ou com hash divergente bloqueia a execução;
5. secret ausente bloqueia antes da geração documental;
6. fallback de secret em código ou workflow é detectado por `verify:security`;
7. `tenant_id` do workflow divergente do pacote é rejeitado;
8. `task_id` do workflow divergente do pacote é rejeitado;
9. token ausente não é autoemitido;
10. sessão ausente não é autocriada;
11. assinatura ausente não é autogerada;
12. decisão ausente não assume `APPROVED`;
13. Etapa A termina obrigatoriamente em `PENDING_HUMAN_REVIEW`;
14. Etapa B rejeita revisor, tenant, hash ou desafio divergente;
15. desafio não pode ser consumido duas vezes;
16. ambiente sem required reviewers bloqueia o piloto real;
17. cenário `DEMO` nunca é contado como execução real;
18. fluxo positivo real termina como `APPROVED_AND_ARCHIVED` somente com pacote, sessão, token, assinatura e decisão externos válidos.

## Verificação obrigatória

Num checkout limpo:

```bash
npm ci
npm audit --omit=dev
npm run verify
git diff --check
git status --short
```

Antes do piloto real:

```text
verificar configuração física do environment pela API
confirmar required reviewers
confirmar política de deployment branch
confirmar ausência de segredo fallback
receber pacote externo
validar hashes e proveniência
executar somente a Etapa A
aguardar decisão humana independente
executar a Etapa B
verificar manifesto e arquivamento
```

## Critérios de aceitação

O patch só estará concluído quando:

1. a execução anterior estiver classificada como demonstração;
2. não existirem dados empresariais hard-coded no caminho operacional;
3. não existir segredo fallback;
4. o input e a autorização forem externos ao repositório e ao run operacional;
5. `tenant_id` e `task_id` do workflow forem aplicados e reconciliados;
6. o sistema não emitir o token do revisor;
7. o sistema não criar automaticamente a sessão;
8. o sistema não gerar a assinatura;
9. o sistema não assumir a aprovação;
10. a revisão ocorrer numa etapa separada;
11. o environment possuir required reviewers reais;
12. ausência de secret, autorização ou protecção causar falha fechada;
13. os 18 testes obrigatórios passarem;
14. `npm run verify` passar com árvore limpa;
15. a execução real, quando autorizada, ficar ligada ao mesmo SHA;
16. `APPROVED_AND_ARCHIVED` possuir prova física de revisão humana.

## Entrega esperada

Entregar somente:

1. diff mínimo do patch;
2. SHA final;
3. lista dos dados hard-coded e fallbacks removidos;
4. resultado dos 18 testes;
5. resposta verificável da API relativa à protecção do environment;
6. ID e URL da Etapa A;
7. ID e URL da Etapa B;
8. identificação técnica do pacote externo e respectivos hashes;
9. recibo da decisão humana sem expor credenciais;
10. manifesto final e resultado do verificador;
11. exit codes dos comandos;
12. classificação factual final.

## Restrições

- Não criar outro módulo operacional.
- Não criar nova arquitectura de evidências.
- Não criar empresas, pessoas ou autorizações fictícias no caminho real.
- Não utilizar empresas reais sem autorização física comprovada.
- Não integrar AGT, bancos, Primavera, pagamentos ou portais públicos.
- Não executar entrega externa nesta correcção.
- Não versionar dados empresariais, documentos, bases de dados ou secrets.
- Não alterar a cadeia forense da CI já encerrada, salvo regressão directamente causada por este patch.
- Não declarar prontidão geral para produção.
- Se não houver pacote, revisor ou configuração administrativa real, terminar como bloqueado; não fabricar evidência para concluir o prompt.

## Classificação esperada

Se apenas a demonstração for corrigida e o ambiente real ainda não estiver preparado:

`OPERATIONAL_AUTHENTICITY_HARDENED — DEMO_TRUTHFULLY_CLASSIFIED — REAL_PILOT_BLOCKED_PENDING_EXTERNAL_INPUT_AND_HUMAN_REVIEW`

Somente depois de uma execução genuína:

`CONTROLLED_REAL_PILOT_EXECUTED — EXTERNAL_INPUT_VERIFIED — PROTECTED_ENVIRONMENT_CONFIRMED — HUMAN_REVIEW_PHYSICALLY_PROVEN — APPROVED_AND_ARCHIVED`

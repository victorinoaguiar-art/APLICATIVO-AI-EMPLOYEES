# Prompt: micro-patch final de ingestão externa, revisão humana e protecção GitHub

## Contexto

O commit final actualmente analisado é:

`2cb11e836b55368f90897de5af672bfce8ed9e7f`

O projecto já separa `DEMO` de `OPERATIONAL_PILOT`, removeu o segredo fallback operacional e impede autoemissão de token, autocriar sessão e autogerar assinatura no caminho real.

Ainda não executar outro piloto real. O ambiente `protected-pilot` não possui required reviewers nem política de branch, o runner não recebe efectivamente um pacote externo e a Etapa B não recebe as credenciais e a decisão humana necessárias.

Não ampliar o módulo. Fazer somente um micro-patch final limitado aos sete pontos seguintes.

## Objectivo

Tornar o caminho operacional utilizável e integralmente fail-closed, sem fabricar pacote, autorização, revisor, token, sessão, assinatura, decisão ou configuração do GitHub.

Enquanto faltar qualquer dependência externa, o resultado correcto é:

`REAL_PILOT_BLOCKED_PENDING_EXTERNAL_INPUT_AND_HUMAN_REVIEW`

## 1. Manifesto de entrada obrigatório e exaustivo

O pacote externo deve conter:

```text
operational-pilot-input.json
authorization-document.pdf
input-package.sha256
package-provenance.json
```

Regras obrigatórias:

- `input-package.sha256` não pode estar vazio.
- Deve conter exactamente uma entrada para cada ficheiro obrigatório, excepto para si próprio.
- Rejeitar entrada ausente, duplicada, adicional ou malformada.
- Cada hash deve possuir exactamente 64 caracteres hexadecimais.
- Cada caminho deve ser relativo, canónico e limitado à raiz do pacote.
- Rejeitar caminhos absolutos, `..`, subdirectórios não autorizados, symlinks e hardlinks quando detectáveis.
- Exigir que cada entrada corresponda a um ficheiro físico regular.
- Exigir que cada ficheiro físico esteja indexado.
- Comparar os hashes directamente com os bytes físicos.
- Ordenar o manifesto de forma determinística.
- Remover a lógica “validar apenas se o hash existir”. A ausência da entrada deve falhar.

`package-provenance.json` deve conter:

```text
package_id
source_type
source_reference
source_created_at
source_actor_id
tenant_id
task_id
authorization_sha256
input_sha256
```

Rejeitar proveniência com `generated_by_repo`, `auto_generated`, `DEMO`, `SIMULATION`, fixture ou referência ao mesmo run operacional.

## 2. Preservar integralmente os bytes originais

Não reescrever `operational-pilot-input.json` depois da validação.

É proibido alterar `authorization_document_path` dentro da fonte e voltar a gravar o JSON normalizado.

Implementação esperada:

- copiar os bytes originais sem alteração;
- confirmar que o hash antes e depois da cópia é idêntico;
- armazenar separadamente dados derivados, incluindo o caminho local resolvido;
- utilizar um `runtime-context.json` marcado como `DERIVED_RUNTIME_CONTEXT`;
- preservar os bytes originais do JSON, PDF, proveniência e manifesto;
- ligar o contexto derivado aos hashes dos ficheiros originais;
- nunca substituir o hash da fonte por um hash de JSON normalizado;
- fornecer ao motor a fonte original e o contexto derivado como objectos distintos.

## 3. Implementar a transferência real do pacote externo

Substituir `external_package_path` por uma referência resolvível num runner GitHub novo.

Utilizar um workflow de intake separado e manual:

1. um operador autorizado disponibiliza o pacote fora do repositório;
2. o intake recebe ou descarrega os bytes por mecanismo protegido;
3. valida o pacote sem executar a tarefa;
4. publica um artefacto privado e imutável;
5. devolve `intake_run_id`, `artifact_id`, `artifact_name` e hash do pacote;
6. a Etapa A recebe esses identificadores;
7. descarrega o artefacto usando a API GitHub e token com permissões mínimas;
8. confirma repositório, run, artifact ID, nome, SHA associado e não expiração;
9. recalcula os hashes depois do download.

O workflow operacional deve receber obrigatoriamente:

```text
intake_run_id
input_artifact_id
input_artifact_name
input_package_sha256
tenant_id
task_id
```

Não aceitar um caminho local fornecido pelo utilizador como prova de transferência externa num GitHub-hosted runner. Não usar URLs arbitrárias, downloads sem autenticação ou referências mutáveis.

Se o intake não estiver disponível, falhar com:

`BLOCKED_EXTERNAL_PACKAGE_TRANSFER_NOT_CONFIGURED`

## 4. Receber a decisão humana numa segunda execução manual

A Etapa A deve terminar em `PENDING_HUMAN_REVIEW`. Não executar automaticamente a Etapa B no mesmo encadeamento.

Criar somente o workflow manual mínimo necessário para consumir o estado produzido pela Etapa A, sem criar outro motor.

Inputs obrigatórios da Etapa B:

```text
stage_a_run_id
stage_a_artifact_id
challenge_id
tenant_id
task_id
reviewer_id
decision
event_signed_at
review_signature
```

Credenciais obrigatórias provenientes do ambiente protegido:

```text
reviewer_token
reviewer_secret ou chave pública/verificador equivalente
```

Regras obrigatórias:

- `decision` deve ser escolhida explicitamente entre `APPROVED`, `REJECTED` e `REQUEST_CHANGES`.
- Não usar valor default para decisão, token, assinatura ou timestamp.
- Não gerar token, sessão, assinatura, timestamp ou comentários no workflow.
- Exigir sessão persistente activa já existente.
- Recuperar o mesmo SQLite e os mesmos bytes da Etapa A.
- Comparar challenge, tenant, tarefa, SHA, versão, revisor e commit.
- Consumir o desafio uma única vez.
- Não arquivar quando a decisão não for `APPROVED`.
- Não classificar como revisão humana apenas porque o job começou.

Caso faltem credenciais ou decisão, manter `PENDING_HUMAN_REVIEW` e falhar de forma fechada.

## 5. Configurar required reviewers e política de branch

Esta configuração exige autoridade administrativa real. Não inventar IDs de utilizadores ou equipas.

Configurar o environment `protected-pilot` com:

- um ou mais required reviewers reais indicados pelo proprietário;
- `deployment_branch_policy` restrita à branch autorizada;
- `can_admins_bypass: false`, quando suportado e aprovado;
- secrets de revisão exclusivamente no environment;
- permissões mínimas de `contents`, `actions` e `deployments`.

Se não existirem identidade ou autorização suficientes:

- não escolher pessoas automaticamente;
- não usar o actor do commit como reviewer presumido;
- não contornar a protecção;
- reportar `BLOCKED_REQUIRED_REVIEWERS_NOT_CONFIGURED`;
- não executar piloto real.

O verificador deve exigir simultaneamente:

```text
environment.name === protected-pilot
protection_rules contém required_reviewers
required_reviewers não está vazio
deployment_branch_policy não é null
branch autorizada corresponde ao SHA executado
can_admins_bypass === false, se exigido pela política aprovada
```

## 6. Preservar a resposta física da configuração do ambiente

Criar o directório de evidência antes da consulta à API.

Preservar:

```text
environment-api-response.json
environment-protection-verification.json
```

Requisitos:

- preservar a resposta física da API, removendo somente campos sensíveis desnecessários;
- incluir URL consultada, repository ID, environment ID, data da consulta, commit SHA e hash da resposta;
- calcular SHA-256 directamente sobre os bytes preservados;
- incluir os dois ficheiros no artefacto da Etapa A e no manifesto final;
- fazer o verificador consumir a resposta física, não apenas o resumo;
- rejeitar resposta ausente, inválida, de outro repositório, sem environment ID ou com protecção insuficiente;
- não fabricar resposta quando a API estiver indisponível.

## 7. Tornar os dados demonstrativos inequivocamente fictícios

Remover da demonstração nomes de empresas, pessoas, NIF, IBAN, facturas e endereços que possam ser confundidos com entidades reais.

Utilizar valores claramente fictícios, por exemplo:

```text
Empresa Demonstração Alfa, Lda.
Cliente Exemplo Beta, Lda.
Revisor Demo 001
NIF: 0000000000
IBAN: DEMO-NOT-A-REAL-ACCOUNT
FACTURA-DEMO-001
demo.invalid
```

Requisitos:

- marcar documentos com `DEMO — SEM VALIDADE COMERCIAL, FISCAL OU JURÍDICA`;
- usar `sensitivity_level: TEST_DATA`;
- usar tenant, tarefa e organização com prefixo `DEMO_`;
- não usar nomes de pessoas, clientes ou empresas reais;
- excluir o cenário das cardinalidades operacionais;
- manter a chave efémera apenas no modo DEMO.

## Testes obrigatórios

Adicionar testes que comprovem:

1. manifesto vazio é rejeitado;
2. ausência de cada entrada obrigatória é rejeitada;
3. entrada duplicada ou adicional é rejeitada;
4. ficheiro físico não indexado é rejeitado;
5. entrada sem ficheiro físico é rejeitada;
6. hash divergente é rejeitado;
7. symlink, caminho absoluto e `..` são rejeitados;
8. JSON original mantém exactamente os mesmos bytes;
9. contexto derivado não altera a fonte;
10. artifact ID, run ID, repositório ou SHA divergente bloqueia o download;
11. ausência do intake bloqueia o modo real;
12. Etapa A termina sem executar a Etapa B;
13. Etapa B não possui defaults para token, decisão, assinatura ou timestamp;
14. Etapa B sem sessão persistente falha;
15. challenge, tenant, tarefa, hash ou revisor divergente falha;
16. desafio reutilizado falha;
17. ambiente sem required reviewers falha;
18. ambiente sem política de branch falha;
19. resposta física da API ausente ou adulterada falha;
20. dados DEMO são inequivocamente fictícios;
21. DEMO nunca recebe classificação real;
22. fluxo positivo injectado termina em `APPROVED_AND_ARCHIVED` sem autoemitir credenciais.

## Verificação obrigatória

Num checkout limpo:

```bash
npm ci
npm audit --omit=dev
npm run verify
git diff --check
git status --short
```

Executar ainda testes explícitos de falha para manifesto incompleto, pacote não transferido, environment sem reviewers, environment sem branch policy e Etapa B sem token, sessão, decisão ou assinatura.

## Critérios de aceitação

O micro-patch só estará concluído quando:

1. o manifesto for obrigatório, completo e bidireccional;
2. os bytes originais permanecerem imutáveis;
3. existir transferência funcional baseada em artifact ID ou mecanismo protegido equivalente;
4. Etapa A e Etapa B forem execuções distintas;
5. a Etapa B receber dados humanos externos;
6. o ambiente possuir required reviewers reais;
7. a política de branch estiver configurada;
8. a resposta física da API estiver preservada e validada;
9. os dados DEMO forem inequivocamente fictícios;
10. todos os 22 testes passarem;
11. `npm run verify` passar com árvore limpa;
12. nenhuma execução real ocorrer antes dos critérios anteriores.

## Entrega esperada

Entregar somente:

1. diff mínimo;
2. SHA final;
3. resultado dos 22 testes;
4. IDs e URLs do intake, Etapa A e Etapa B, se realmente executados;
5. metadata verificável do pacote externo, sem expor dados empresariais;
6. hashes dos bytes originais antes e depois;
7. resposta física da API do environment e respectivo hash;
8. configuração factual de reviewers e branch policy;
9. exit codes;
10. classificação final factual.

## Restrições

- Não executar piloto real enquanto o ambiente não estiver protegido.
- Não criar outro motor operacional.
- Não gerar autorização, revisão ou credenciais internamente.
- Não escolher required reviewers sem instrução do proprietário.
- Não armazenar dados reais, tokens, assinaturas, secrets ou SQLite no repositório.
- Não usar URL externa arbitrária.
- Não reabrir a cadeia forense da CI.
- Não integrar AGT, bancos, Primavera, pagamentos ou canais externos.
- Não declarar `APPROVED_AND_ARCHIVED` sem decisão humana real ou simulação explicitamente classificada.

## Classificação permitida

Enquanto faltar qualquer dependência externa:

`OPERATIONAL_PILOT_PATH_HARDENED — REAL_PILOT_BLOCKED_PENDING_EXTERNAL_PACKAGE, GITHUB_ENVIRONMENT_PROTECTION_AND_HUMAN_REVIEW`

Somente após execução genuína de intake, Etapa A e Etapa B:

`CONTROLLED_REAL_PILOT_EXECUTED — EXTERNAL_PACKAGE_VERIFIED — ORIGINAL_BYTES_PRESERVED — PROTECTED_ENVIRONMENT_CONFIRMED — HUMAN_REVIEW_PHYSICALLY_PROVEN — APPROVED_AND_ARCHIVED`


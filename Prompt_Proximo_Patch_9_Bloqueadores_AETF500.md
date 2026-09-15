# PROMPT DE EXECUÇÃO — PATCH CORRECTIVO DOS NOVE BLOQUEADORES AETF-500

## 1. Papel e missão

Actue como engenheiro principal de software, segurança de aplicações, DevSecOps, arquitectura multi-tenant, pagamentos e auditoria forense de evidências.

Trabalhe directamente no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Parta do commit mais recente da branch principal e execute um **patch correctivo pequeno, verificável e limitado aos nove bloqueadores descritos neste documento**.

O objectivo não é criar funcionalidades, motores, dashboards, catálogos, relatórios institucionais ou novos módulos. O objectivo é corrigir falhas concretas que impedem uma classificação tecnicamente defensável de prontidão para produção.

## 2. Regra principal de escopo

Não adicionar outro grande módulo funcional.

É permitido apenas:

- corrigir código e testes existentes;
- substituir implementações incompletas estritamente necessárias;
- acrescentar adaptadores mínimos para Stripe, ExpressPay, identidade e persistência;
- ajustar dependências, configurações, schemas, scripts e workflow de CI;
- produzir recibos técnicos derivados da execução real;
- actualizar documentação factual afectada pelas correcções.

É proibido:

- declarar `PASS` com valores hard-coded;
- alterar testes para esconder falhas;
- fabricar recibos, transacções, URLs, sessões, clientes, tarefas ou resultados;
- aceitar hashes alternativos apenas para fazer o gate passar;
- marcar integração como real sem comunicação comprovada com o provedor;
- versionar resultados locais mutáveis como se fossem prova de CI;
- afirmar prontidão para produção antes de todos os checks obrigatórios ficarem verdes no GitHub.

## 3. Baseline e diagnóstico obrigatório

Antes de editar:

1. registar o SHA completo do commit inicial;
2. executar `npm ci`;
3. executar `npm run verify`;
4. executar `npm audit --omit=dev`;
5. registar `node --version` e `npm --version`;
6. executar `git status --porcelain` antes e depois da verificação;
7. guardar os resultados brutos como artifacts da CI, sem reescrever a verdade histórica do repositório.

Não use relatórios Markdown anteriores como prova de execução. A prova deve vir dos comandos, do código físico, dos testes e do GitHub Actions associados ao mesmo commit.

## 4. Correcções obrigatórias

### B1 — Compatibilidade real entre CI e runtime

O workflow declara Node.js 20, mas a persistência utiliza `node:sqlite`, que não deve ser presumido compatível com esse runtime.

Corrigir de uma destas formas:

- adoptar no projecto e na CI uma versão LTS do Node que suporte oficialmente a implementação escolhida; ou
- substituir `node:sqlite` por um driver transaccional suportado pela versão oficial do projecto.

Requisitos:

- declarar a versão oficial em `package.json` por meio de `engines`;
- alinhar CI, documentação e ambiente de produção;
- executar build e testes na mesma versão;
- remover `eval('require')` e imports destinados apenas a contornar incompatibilidades;
- adicionar teste de arranque e persistência no runtime oficial.

### B2 — Pipeline read-only e determinístico

`npm run verify` não pode modificar ficheiros versionados.

Corrigir todos os testes e verificadores que reescrevem:

- `generated/verification/*`;
- manifestos AETF-500;
- ficheiros de auditoria nas árvores `generated/` e `packages/runtime/generated/`;
- qualquer outro ficheiro rastreado pelo Git.

Requisitos:

- verificadores devem ler e comparar, não regenerar baselines;
- resultados da execução devem ser escritos numa pasta temporária ou de artifacts ignorada pelo Git;
- timestamps, IDs e caminhos temporários devem ser controláveis ou excluídos das comparações determinísticas;
- depois de `npm run verify`, `git status --porcelain` deve retornar vazio;
- a CI deve executar `git diff --exit-code` e `git status --porcelain` como gate obrigatório.

### B3 — Baseline criptográfica única

Eliminar `alternative_sha256` e qualquer lógica equivalente que aceite dois hashes para o mesmo artefacto.

Requisitos:

- definir uma representação física canónica do ficheiro;
- aplicar `.gitattributes` antes de calcular a nova baseline;
- calcular o SHA-256 a partir dos bytes de um checkout limpo;
- criar um evento de migração que referencie o hash anterior, o novo hash, a razão, o commit e o aprovador, sem tratar os dois como simultaneamente válidos;
- o verificador normal deve aceitar exactamente um hash canónico;
- incluir teste negativo em que uma alteração de um byte produz `FAIL`.

### B4 — Integração verdadeira com Stripe e ExpressPay

Não retornar sessões sandbox quando o pedido solicita pagamento real e existem credenciais configuradas.

Requisitos:

- criar adaptadores mínimos e separados para Stripe e ExpressPay;
- usar SDK/API oficial do provedor;
- enviar valor, moeda, referência, tenant e URLs autorizadas;
- devolver apenas IDs, estados e URLs recebidos do provedor;
- aplicar timeout, tratamento de erros, idempotência e correlação;
- validar URLs de sucesso e cancelamento contra allowlist;
- na ausência de configuração, falhar fechado com `PROVIDER_NOT_CONFIGURED`;
- nunca criar `checkoutUrl`, transaction ID ou session ID que pareça real;
- manter sandbox explicitamente identificado e proibido em produção;
- adicionar testes unitários com mocks de transporte e testes de contrato no sandbox oficial, separados dos testes locais.

Se o ExpressPay não possuir documentação ou credenciais oficiais disponíveis, manter o conector como `NOT_CONFIGURED/NOT_VERIFIED`. Não inventar endpoints nem protocolos.

### B5 — Webhooks autenticados de ponta a ponta

O sistema não deve verificar uma assinatura e depois confiar em campos independentes enviados no JSON interpretado.

Requisitos:

- preservar os bytes brutos exactos antes de qualquer parser;
- usar o verificador oficial do Stripe sempre que aplicável;
- validar a assinatura ExpressPay estritamente segundo documentação oficial;
- extrair evento, valor, moeda, tenant, invoice, transaction ID e idempotency key apenas do payload autenticado;
- validar tipo do evento, versão, timestamp e tolerância de replay;
- persistir o event ID único do provedor antes de aplicar efeitos;
- rejeitar duplicados atomicamente;
- relacionar metadata do provedor com uma factura existente;
- confirmar valor e moeda usando unidades inteiras mínimas, nunca `float` financeiro;
- retornar códigos HTTP adequados e não expor segredos ou payloads sensíveis nos logs;
- testar assinatura inválida, payload alterado, evento expirado, replay, tenant divergente, valor divergente, moeda divergente e concorrência.

### B6 — Autenticação e autorização empresariais reais

O bloqueio do emissor público deve ser preservado, mas não é suficiente.

Requisitos:

- integrar OIDC/OAuth 2.0 com um IdP configurável, ou implementar uma fronteira de autenticação equivalente e documentada;
- validar `iss`, `aud`, assinatura, `kid`, expiração e rotação por JWKS ou mecanismo seguro equivalente;
- resolver utilizador, tenant, estado da conta, funções e permissões a partir de registos persistentes e autorizados;
- não confiar em tenant, funções ou permissões autodeclaradas pelo cliente;
- persistir revogações ou sessões quando forem parte do modelo de segurança;
- remover a chave fallback de administrador do emissor de teste;
- desactivar fisicamente as rotas de teste em builds de produção;
- aplicar autorização por recurso e tenant, incluindo rotas administrativas e financeiras;
- testar restart, revogação, rotação, conta desactivada, associação removida, cross-tenant e escalada de privilégios.

### B7 — Schemas Ajv e cardinalidades físicas globais

Substituir validações parciais e contagens hard-coded por dados derivados dos artefactos reais.

Requisitos:

- manter schemas JSON versionados em ficheiros próprios;
- activar Ajv em modo estrito;
- usar `additionalProperties: false` onde a extensão não esteja expressamente prevista;
- validar formatos, enums, identificadores, hashes, datas, relações e cardinalidades;
- criar um inventário automático de todos os manifestos activos;
- falhar quando existir manifesto activo sem schema aplicável;
- calcular empregados, tarefas, tenants, clientes, certificações, execuções e evidências a partir dos registos físicos;
- comparar `declared = physical = unique = valid`, conforme o domínio;
- remover constantes como tarefas físicas `0`, tenants `3` ou evidências elegíveis `0`, salvo quando forem resultados calculados;
- validar referências cruzadas, duplicados, ficheiros ausentes e manifestos contraditórios;
- testar erros de schema e diferenças de cardinalidade.

### B8 — Actualização segura de dependências

O Next.js 14.2.35 não deve ser tratado como correcção final de segurança.

Requisitos:

- actualizar Next.js, React e dependências relacionadas para versões suportadas e compatíveis sem advisories críticos ou altos aplicáveis;
- corrigir também vulnerabilidades transitivas relevantes, incluindo `postcss`, `express` e `qs`;
- executar `npm audit --omit=dev`;
- adicionar análise de dependências à CI;
- justificar apenas vulnerabilidades comprovadamente não aplicáveis, com referência ao advisory e ao caminho de execução;
- não usar `--force` sem avaliar breaking changes;
- executar testes de regressão das rotas e build web após a migração.

Critério mínimo: zero vulnerabilidades críticas e altas aplicáveis a dependências de produção.

### B9 — CI real, comprovada e obrigatória antes de merge

O ficheiro de workflow não é, por si só, prova de CI.

Requisitos:

- executar a CI em `pull_request`, `push` e manualmente;
- usar o runtime oficial definido no projecto;
- executar instalação determinística, typecheck, build, testes, validações, auditoria de dependências e verificação de árvore limpa;
- usar permissões mínimas no workflow;
- fixar ou controlar versões das actions utilizadas;
- carregar logs e recibos como artifacts associados ao run;
- incluir `source_commit_sha`, run ID, workflow, comando, ambiente, horários e exit code nos recibos gerados pela CI;
- garantir que todos os recibos pertencem ao mesmo SHA verificado;
- configurar branch protection para exigir o check principal antes de merge;
- não classificar o patch como concluído enquanto o GitHub Actions não apresentar sucesso no commit candidato.

## 5. Testes negativos obrigatórios

Adicionar ou reforçar testes que demonstrem `FAIL` para:

1. execução no runtime não suportado;
2. verificador que modifica ficheiro versionado;
3. hash diferente por um byte;
4. tentativa de checkout real sem provedor configurado;
5. resposta de provedor sem ID ou URL válida;
6. webhook com assinatura válida mas payload/campos divergentes;
7. replay simultâneo do mesmo evento;
8. token com tenant, função ou permissão autodeclarada;
9. utilizador revogado após restart;
10. manifesto activo sem schema;
11. cardinalidade declarada diferente da física;
12. dependência de produção com vulnerabilidade crítica ou alta aplicável;
13. recibo pertencente a commit diferente;
14. tentativa de merge sem o check obrigatório.

## 6. Sequência de execução

Executar nesta ordem:

1. alinhar runtime e CI;
2. tornar testes e verificadores read-only;
3. corrigir a baseline de hash;
4. corrigir identidade e autorização;
5. implementar pagamentos e webhooks reais;
6. completar schemas e cardinalidades físicas;
7. actualizar dependências;
8. executar a verificação integral local num checkout limpo;
9. abrir o pull request;
10. executar e comprovar a CI;
11. activar os checks obrigatórios;
12. emitir o relatório final factual.

Interromper a execução e declarar `BLOCKED` se faltarem credenciais, documentação oficial, permissões do GitHub, sandbox dos provedores ou acesso para configurar branch protection. Não substituir dependências externas ausentes por simulações apresentadas como reais.

## 7. Comandos mínimos de validação

```bash
node --version
npm --version
npm ci
npm run verify
npm audit --omit=dev
git status --porcelain
git diff --exit-code
```

Acrescentar os testes de integração necessários, mas não remover estes comandos.

## 8. Critérios de aceitação do patch

O patch só poderá ser marcado como concluído se:

- o runtime local e o runtime da CI forem compatíveis e idênticos;
- `npm run verify` terminar com exit code 0;
- 100% dos testes obrigatórios passarem;
- a árvore Git permanecer limpa após a verificação;
- existir exactamente um hash canónico por artefacto;
- pagamentos reais utilizarem respostas reais dos provedores;
- webhooks forem processados exclusivamente a partir do evento autenticado;
- autenticação e autorização dependerem de identidades e associações persistentes;
- todos os manifestos activos forem cobertos por schemas estritos;
- todas as cardinalidades forem calculadas a partir de registos físicos;
- não existirem vulnerabilidades críticas ou altas aplicáveis em produção;
- o GitHub Actions do SHA candidato estiver verde;
- a branch principal exigir o check antes de merge;
- os recibos forem do mesmo commit e derivados do run real.

Se qualquer critério falhar, a classificação obrigatória será:

`PATCH_INCOMPLETE — PRODUCTION_BLOCKED`

## 9. Entregáveis obrigatórios

Entregar:

1. lista dos ficheiros alterados e razão de cada alteração;
2. tabela `Bloqueador → Correcção → Teste → Evidência → Estado`;
3. diff resumido por área;
4. resultados integrais dos comandos de validação;
5. resultado de `npm audit --omit=dev`;
6. URL e ID do GitHub Actions run;
7. SHA exacto verificado;
8. lista e hashes dos artifacts da CI;
9. prova de árvore limpa;
10. confirmação da branch protection ou bloqueio de permissão;
11. riscos residuais e dependências externas;
12. classificação final sem exageros.

## 10. Formato da resposta final

Produzir uma resposta curta, factual e auditável, com estas secções:

1. `Resumo executivo`;
2. `Resultado dos nove bloqueadores`;
3. `Testes e CI`;
4. `Evidências do mesmo commit`;
5. `Riscos residuais`;
6. `Classificação final`;
7. `Próxima acção exacta`.

Não afirmar “completamente seguro”, “produção pronta”, “integração real” ou “todos os pontos concluídos” sem evidência física correspondente.

## 11. Decisão de governação esperada

Até todos os critérios serem satisfeitos:

`PATCH_PARTIALLY_IMPLEMENTED — PRODUCTION_BLOCKED`

Somente depois de o mesmo SHA passar localmente, deixar a árvore limpa, obter CI verde, concluir as integrações externas e activar os checks obrigatórios poderá ser considerada nova classificação de prontidão.

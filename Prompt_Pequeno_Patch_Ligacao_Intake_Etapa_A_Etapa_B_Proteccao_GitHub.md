# Prompt — Pequeno patch de ligação entre intake, Etapa A e Etapa B

## Objectivo

Não criar um novo módulo, não ampliar a arquitectura e **não executar ainda o piloto real**.

Aplicar somente um pequeno patch de ligação e endurecimento entre o intake do pacote externo, a Etapa A, a revisão humana da Etapa B e os controlos administrativos do GitHub.

O patch deve fechar as lacunas de autenticidade, proveniência, integridade e segurança abaixo. Até todos os critérios serem satisfeitos, qualquer execução deve permanecer classificada como `DEMO` ou `SIMULATION`.

## Estado de referência

Trabalhar a partir do `HEAD` actual do repositório e registar o SHA exacto usado na implementação e nas verificações. Não reutilizar recibos de commits anteriores nem criar um commit documental posterior apenas para alterar a classificação.

## Correcções obrigatórias

### 1. Validar efectivamente `input_package_sha256`

- Definir `input_package_sha256` como o SHA-256 dos **bytes exactos do arquivo original recebido**, antes de qualquer extracção, recompressão ou transformação.
- Validar o formato estrito: 64 caracteres hexadecimais minúsculos.
- Calcular o hash a partir do ficheiro físico recebido e compará-lo em tempo constante com o valor autorizado.
- Falhar de forma fechada perante valor ausente, inválido ou divergente.
- Preservar no artefacto de intake os bytes originais do pacote, por exemplo `original-package.tar.gz`, e um recibo com o hash calculado.
- Não comparar o hash informado com o ZIP produzido automaticamente pelo GitHub Actions, pois esse contentor pode ser reempacotado.
- Voltar a validar o mesmo ficheiro físico após o download do artefacto e antes da extracção na Etapa A.

### 2. Vincular integralmente o artefacto ao intake

Antes de aceitar o artefacto, validar pela API do GitHub e pelos recibos físicos:

- `repository.id` e `head_repository.id` iguais ao ID canónico do repositório;
- repositório completo esperado;
- identidade exacta do workflow de intake, incluindo ficheiro/caminho ou ID imutável;
- `workflow_run.id` igual ao run autorizado;
- `head_sha` igual ao SHA autorizado para a Etapa A;
- branch autorizada;
- `status: completed`;
- `conclusion: success`;
- ID e nome exactos do artefacto;
- `expired: false`;
- origem, data, URL da API e hash da resposta preservada.

Não aceitar apenas nome de artefacto, nome de workflow ou `run_id`. Não usar fallbacks. Validar estritamente os IDs numéricos e substituir qualquer interpolação de valores externos em comandos shell por API, `spawn`/`execFile` com argumentos separados ou solução equivalente sem shell.

### 3. Vincular rigorosamente a Etapa B à Etapa A

- Tornar obrigatórios e efectivamente consumidos: `stage_a_run_id`, `stage_a_artifact_id`, `stage_a_head_sha`, `challenge_id` e `event_signed_at`.
- Validar que o artefacto pertence ao run, workflow, repositório e SHA exactos da Etapa A.
- Descarregar pelo ID exacto do artefacto, não apenas por nome.
- Validar que o desafio está pendente, não expirou, não foi consumido e foi emitido para o mesmo tenant, piloto, tarefa, versão, pacote, revisor e SHA.
- Validar `event_signed_at` como timestamp RFC 3339 válido, posterior à emissão do desafio e dentro da janela autorizada.
- Rejeitar divergência entre os inputs, os recibos, o SQLite, o manifesto e a resposta física da API.
- Registar separadamente emissão, assinatura, aceitação e consumo, preservando idempotência e impedindo replay.

### 4. Retirar token e assinatura dos inputs normais

- Remover token, sessão e assinatura dos inputs comuns de `workflow_dispatch` e de argumentos de linha de comandos.
- Obter a credencial de revisão apenas de um secret do ambiente protegido ou de uma interface/broker externo autenticado.
- Receber a decisão e a assinatura por um payload de revisão protegido, preservado e validado, ligado ao `challenge_id` e à identidade persistente do revisor.
- Não imprimir credenciais, tokens, sessões, assinaturas ou payloads sensíveis nos logs.
- O workflow não pode emitir para si próprio token, sessão, identidade, decisão, assinatura ou aprovação.
- A ausência de qualquer credencial ou evento externo obrigatório deve terminar a execução com erro.

### 5. Substituir o pacote base64 por transferência protegida

- Remover `package_payload_base64` dos inputs do workflow.
- Adoptar uma destas formas autorizadas, sem adicionar um módulo funcional novo:
  - upload autenticado para armazenamento privado já aprovado; ou
  - artefacto privado previamente carregado por um workflow de intake protegido.
- Não aceitar URL arbitrária fornecida pelo utilizador.
- Aplicar expiração, acesso mínimo, limite de tamanho, tipo permitido e verificação de hash.
- Preservar os bytes originais do pacote e a resposta/recibo que comprova a transferência.
- Não incluir dados empresariais reais em fixtures, commits, logs ou artefactos de teste.

### 6. Endurecer a extracção do pacote

Antes de extrair, inspeccionar integralmente o arquivo e rejeitar:

- caminhos absolutos;
- componentes `..` ou qualquer escape do directório de destino;
- symlinks e hardlinks;
- devices, FIFOs, sockets e outros tipos especiais;
- nomes duplicados ou ambíguos;
- ficheiros inesperados pelo manifesto;
- excesso de ficheiros, tamanho total, tamanho individual ou taxa de expansão;
- entradas cujo caminho normalizado colida com outra entrada.

Extrair para um directório criado com mecanismo temporário seguro. Depois da extracção, confirmar que todos os caminhos reais permanecem dentro desse directório, que não existem links e que cada ficheiro corresponde ao manifesto e ao hash autorizado. Não executar directamente `tar -xzf` sobre um pacote não validado.

### 7. Configurar os controlos administrativos do GitHub

Esta etapa exige intervenção de um administrador humano autorizado. Não inventar revisores, IDs, credenciais nem respostas da API.

Configurar manualmente e comprovar fisicamente:

- ambiente `protected-pilot` com pelo menos um required reviewer real e autorizado;
- política de deployment limitada à branch aprovada;
- bloqueio de bypass administrativo, quando suportado e aprovado pela política da organização;
- secrets operacionais apenas no ambiente protegido;
- branch protection/ruleset com checks obrigatórios e proibição de bypass conforme a política aprovada.

Preservar a resposta real da API que demonstra a configuração, incluindo origem, repositório, environment, data de consulta e SHA relacionado. Se as permissões ou o plano do GitHub impedirem a configuração, falhar o gate e declarar explicitamente o bloqueio; não simular sucesso.

## Testes obrigatórios

Adicionar testes positivos mínimos e testes negativos que provem a rejeição de:

1. hash ausente, malformado ou divergente;
2. arquivo alterado após o intake;
3. repository ID ou `head_repository.id` divergente;
4. workflow, run, SHA, branch, artefacto, estado ou conclusão divergentes;
5. artefacto expirado;
6. `stage_a_artifact_id`, `challenge_id`, `event_signed_at` ou SHA da Etapa A ausentes/divergentes;
7. desafio expirado, já consumido ou usado por tenant/tarefa/revisor diferente;
8. token ou assinatura passados por input normal;
9. pacote base64 ou URL arbitrária;
10. path traversal, caminho absoluto, symlink, hardlink, device e arquivo excessivo;
11. reviewer inexistente ou environment sem protecção;
12. tentativa de shell injection em qualquer identificador externo.

Os testes não podem depender de dados empresariais reais. Usar apenas valores inequivocamente fictícios.

## Verificação obrigatória

Executar num checkout limpo:

```bash
npm ci
npm audit --omit=dev
npm run verify
git status --short
```

Além disso:

- executar a CI principal no SHA final;
- executar apenas os workflows de `DEMO`/`SIMULATION` necessários para testar a ligação;
- não executar o piloto real;
- preservar recibos verificáveis das execuções, contendo repository ID, workflow, run ID, run attempt, head SHA, status, conclusão, URL e timestamps;
- comprovar que a árvore termina limpa;
- fazer qualquer divergência ou ausência de evidência resultar em exit code diferente de zero.

## Critérios de aceitação

O patch só está concluído se:

- o hash dos bytes originais for validado no intake e novamente na Etapa A;
- o artefacto estiver ligado de forma inequívoca ao repositório, workflow, run, SHA e conclusão correctos;
- a Etapa B estiver ligada ao artefacto, desafio, evento e SHA exactos da Etapa A;
- nenhum segredo ou assinatura circular por input normal, CLI ou log;
- o pacote entrar apenas por transferência privada e autenticada;
- a extracção resistir aos casos negativos definidos;
- os controlos administrativos reais estiverem configurados e comprovados, ou o sistema permanecer bloqueado com motivo explícito;
- `npm audit --omit=dev` e `npm run verify` terminarem com exit code `0`;
- a CI do mesmo SHA terminar com `status: completed` e `conclusion: success`;
- não houver alterações residuais na árvore.

## Entregáveis

1. Alterações mínimas nos workflows, scripts e testes existentes.
2. Recibos físicos e verificáveis do intake, Etapa A, Etapa B de teste e configuração do GitHub.
3. Resumo curto com:
   - SHA final;
   - ficheiros alterados;
   - testes e comandos executados;
   - IDs e URLs dos workflows;
   - estado dos required reviewers, branch policy e bypass;
   - bloqueios remanescentes.

## Restrições

- Não criar novo módulo funcional, nova arquitectura ou novo relatório extenso.
- Não executar nem classificar uma execução como piloto real.
- Não gerar ou falsificar evidências administrativas.
- Não usar fallbacks de sucesso, SHA, IDs, timestamps, versão, segredo, autorização ou identidade.
- Não introduzir dados empresariais reais no repositório.
- Não criar uma cadeia infinita de commits documentais.

## Classificação permitida após o patch

Enquanto não houver execução operacional autorizada e revisão humana real:

```text
OPERATIONAL_LINKAGE_HARDENED — REAL_PILOT_BLOCKED
```

Somente depois de os controlos externos estarem activos, de uma pessoa autorizada aprovar a execução e de todas as evidências do mesmo SHA serem verificadas poderá ser planeado, num pedido separado, o piloto real.

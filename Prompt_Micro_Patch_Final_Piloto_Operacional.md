# Prompt de Execução — Micro-Patch Final de Prontidão do Piloto Operacional

## 1. Missão e limite do trabalho

Actue como engenheiro de software sénior, especialista em segurança multi-tenant, autenticação, persistência transaccional, documentos digitais e auditoria forense de evidências.

Repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Baseline obrigatória a confirmar antes de qualquer alteração:

`6cdeb0b0d1714cf8895cd9590701ad43df6a6a33`

Executar somente um micro-patch correctivo limitado aos cinco pontos deste documento. Não criar novos módulos funcionais, novos AI Employees, novos catálogos, novos motores comerciais ou outra arquitectura paralela.

Classificação inicial:

`OPERATIONAL_PILOT_INFRASTRUCTURE_PARTIALLY_READY — SIMULATION CI GREEN`

Não promover a classificação antes de todos os critérios físicos, técnicos e de CI estarem comprovados no mesmo SHA.

---

## 2. Regras de execução

1. Não fabricar dados operacionais, identidades, autorizações, tarefas ou recibos.
2. Não utilizar fixtures, fallbacks, valores hard-coded ou segredos de simulação no modo operacional.
3. Ausência de fonte, identidade, persistência ou documento obrigatório deve produzir falha fechada e exit code diferente de zero.
4. A simulação deve permanecer claramente identificada como `SIMULATION`.
5. O piloto real não deve ser executado automaticamente na CI pública.
6. Os testes devem exercer o produto real, não auxiliares criados apenas dentro dos testes.
7. Todos os caminhos devem funcionar em Windows e Linux e ser independentes do directório de execução.

---

## 3. Correcções obrigatórias

### 3.1 Preservar a base durável durante toda a execução

Corrigir o fluxo onde o script cria `TransactionalPilotStore(dbPath, mode)` e, em seguida, chama `engine.reset()`, fechando a base configurada e substituindo-a por `:memory:`.

Requisitos:

- não chamar `reset()` depois de injectar o store durável;
- ou alterar `reset()` para preservar explicitamente o store recebido;
- separar claramente `clearStateForTests()` de inicialização de produção;
- proibir qualquer troca silenciosa de uma base persistente por `:memory:`;
- impedir `:memory:` no modo `OPERATIONAL_PILOT`;
- registar no recibo da execução um identificador seguro da persistência utilizada, sem expor credenciais;
- fechar e reabrir a mesma base numa segunda fase do workflow;
- reconstruir métricas, recibos e documentos exclusivamente a partir da base reaberta;
- comparar os hashes antes e depois do reinício;
- comprovar que a base SQLite do artefacto contém pilotos, tarefas, outputs, revisões e entregas.

Adicionar um teste de regressão que falhe se `getDbPath()` mudar do caminho configurado para `:memory:` depois da inicialização do motor.

### 3.2 Carregar realmente todas as fontes operacionais externas

O caminho `OPERATIONAL_PILOT` não pode apenas verificar a existência de `--auth-doc` e `--tasks-file`. Deve carregar, validar e utilizar os respectivos conteúdos.

Receber por ficheiro externo validado ou configuração segura:

- `pilot_id`;
- tenant existente e activo;
- organização;
- referência da autorização;
- responsável autorizador;
- datas de validade;
- documento físico de autorização;
- SHA-256 esperado da autorização;
- lista de AI Employees permitidos;
- tarefas e documentos de entrada;
- solicitantes;
- revisores;
- configurações criptográficas dos revisores;
- categorias e acções autorizadas;
- destino e canal quando aplicável.

Requisitos:

- criar ou fortalecer schemas com `additionalProperties: false`;
- validar tipos, enums, datas, cardinalidades e caminhos;
- calcular o hash do documento de autorização e compará-lo ao hash fornecido;
- carregar efectivamente `--tasks-file` e executar somente as tarefas desse ficheiro;
- eliminar do ramo operacional toda referência à SASO e às 30 fixtures internas;
- manter as fixtures somente num ficheiro ou função exclusiva de simulação;
- impedir que o modo operacional importe o módulo de fixtures;
- rejeitar proveniência `fixture`, `demo`, `simulation`, `mock`, caminhos de testes ou dados sem origem verificável;
- remover emails, destinatários, datas, organização e valores fallback;
- exigir `PILOT_DB_PATH`, configuração de documentos e segredos reais no ambiente protegido;
- nunca escrever segredos ou dados empresariais sensíveis nos logs.

O comando operacional deve falhar se qualquer fonte estiver ausente, vazia, inválida ou contraditória. Não deve continuar com os valores da simulação.

### 3.3 Corrigir autenticação e autorização do revisor

Injectar no `ControlledPilotEngine` a instância real e configurada de `TokenService` ou uma interface equivalente de autenticação. Não criar silenciosamente `new TokenService()` dentro do validador.

Para aceitar uma revisão operacional, exigir simultaneamente:

1. token ou sessão válida;
2. token não expirado;
3. token não revogado;
4. tenant exactamente igual ao tenant do piloto;
5. `user_id` ou `sub` exactamente igual ao revisor declarado;
6. função autorizada, como `HUMAN_REVIEWER` ou `ADMIN`;
7. permissão explícita `PILOT_REVIEW`;
8. revisor incluído na lista autorizada do piloto;
9. vínculo activo do utilizador ao tenant;
10. separação entre solicitante e revisor quando exigida;
11. assinatura ligada ao tenant, piloto, tarefa, documento, decisão, identidade e timestamp do servidor.

Corrigir a condição lógica actual que pode aceitar qualquer utilizador do mesmo tenant com função de revisor, mesmo quando a sua identidade não corresponde ao nome declarado.

Regras adicionais:

- função válida não substitui correspondência de identidade;
- identidade válida não substitui função e permissão;
- falha ou indisponibilidade do serviço de tokens deve bloquear a revisão;
- revogação deve ser consultada na persistência real;
- não derivar chave de assinatura directamente do token;
- não guardar token, segredo ou chave no recibo;
- usar comparação temporalmente segura para assinaturas;
- rejeitar replay da mesma aprovação quando a tarefa, documento ou decisão tiver mudado.

Adicionar testes de impersonação, incluindo token válido do revisor A utilizado para declarar revisão como revisor B.

### 3.4 Integrar leitores independentes no pipeline e na CI

Não limitar `pdf-lib` e `jszip` a testes isolados. Executar a validação independente em dois momentos:

1. sobre os bytes relidos do SQLite após a gravação;
2. sobre cada documento exportado no pacote de evidências.

Requisitos:

- PDF: abrir com `pdf-lib`, confirmar pelo menos uma página e estrutura legível;
- DOCX: validar o pacote Open XML, relacionamentos, content types e extrair o corpo do documento;
- XLSX: abrir como workbook, confirmar pelo menos uma worksheet e células válidas;
- usar um leitor de XLSX capaz de interpretar workbook e células, não apenas verificar o ZIP;
- validar CRC e rejeitar pacotes truncados;
- comparar o SHA-256 dos bytes do SQLite com o ficheiro exportado;
- impedir conclusão da tarefa ou exportação quando qualquer leitor independente falhar;
- eliminar a construção manual frágil de PDF com `xref` fixo, preferindo geração por biblioteca;
- gerar DOCX e XLSX através de bibliotecas apropriadas ou assegurar pacotes Open XML completos.

Como a validação independente é assíncrona, ajustar cuidadosamente o pipeline para aguardar o resultado. Não iniciar revisão ou entrega antes da conclusão da validação.

A CI deve percorrer todos os documentos exportados e produzir um recibo contendo formato, leitor, resultado, hash e erro quando aplicável.

### 3.5 Completar o manifesto e rejeitar symlinks

Enriquecer cada entrada do manifesto com:

- `relative_path`;
- `sha256`;
- `byte_size`;
- `mime_type`;
- `origin`;
- `commit_sha`;
- `tenant_id`;
- `pilot_id`;
- `task_id`, quando aplicável;
- `document_version`, quando aplicável;
- `receipt_type` ou categoria da evidência;
- `generated_at` ou timestamp de preservação.

Requisitos:

- obter `commit_sha` do Git/GitHub e exigir SHA completo de 40 caracteres;
- todos os ficheiros do pacote devem usar o mesmo SHA;
- derivar tarefa e versão dos registos persistidos, não apenas do nome;
- validar MIME pelos bytes e extensão esperada;
- indicar claramente se a origem é entrada externa, SQLite, execução, revisor, conector ou CI;
- verificar bidireccionalmente manifesto e filesystem;
- rejeitar ficheiros adicionais, ausentes, alterados ou duplicados;
- rejeitar symlinks, junctions e referências fora do directório autorizado;
- usar `lstat` e `realpath` para garantir que cada ficheiro permanece dentro da raiz;
- rejeitar path traversal antes de abrir o ficheiro;
- impedir ciclos durante a descoberta;
- verificar que o manifesto, a atestação e os recibos indicam o mesmo SHA;
- acrescentar schema formal do manifesto e validá-lo com Ajv.

O ficheiro `pilot-evidence-files.sha256` pode excluir a si próprio para evitar recursão, mas deve incluir o manifesto JSON enriquecido.

---

## 4. Testes mínimos obrigatórios

Implementar ou corrigir testes que comprovem:

1. o store injectado conserva exactamente o caminho configurado;
2. nenhuma chamada muda o store para `:memory:`;
3. tarefas e bytes são recuperados após fechar e reabrir a mesma base;
4. a CI exporta a partir da base reaberta, não de caches em memória;
5. o modo operacional usa os dados do ficheiro externo;
6. alterar a tarefa externa altera a tarefa executada;
7. o ficheiro externo ausente ou inválido produz exit code diferente de zero;
8. fixtures não podem ser importadas pelo caminho operacional;
9. hash de autorização ausente ou divergente bloqueia a execução;
10. token do revisor A não pode aprovar como revisor B;
11. função sem identidade correspondente falha;
12. identidade sem função ou sem `PILOT_REVIEW` falha;
13. token revogado, expirado ou de outro tenant falha;
14. indisponibilidade do serviço de autenticação falha fechadamente;
15. leitores independentes validam os bytes relidos do SQLite;
16. PDF, DOCX e XLSX corrompidos são rejeitados;
17. todos os documentos exportados são novamente abertos na CI;
18. hash SQLite e hash do ficheiro exportado são iguais;
19. manifesto contém todos os metadados obrigatórios e o mesmo `commit_sha`;
20. symlink interno ou externo, junction e path traversal são rejeitados.

Os testes devem usar directórios temporários seguros, limpar os próprios artefactos e não alterar a árvore versionada.

---

## 5. Alterações obrigatórias na CI

Manter os checks actuais e acrescentar uma sequência explícita:

1. executar a simulação com SQLite durável;
2. terminar o primeiro processo;
3. iniciar um segundo processo com a mesma base;
4. comprovar cardinalidades físicas da base;
5. exportar as evidências a partir da base reaberta;
6. abrir todos os documentos com leitores independentes;
7. gerar o recibo da validação documental;
8. gerar o manifesto enriquecido com `${{ github.sha }}`;
9. executar o verificador integral;
10. executar testes negativos de ficheiro órfão, adulteração e symlink;
11. confirmar árvore Git limpa;
12. publicar o pacote integral como artefacto do mesmo SHA.

O `check-readiness` operacional deve continuar a falhar na CI pública por ausência deliberada de fontes e segredos reais. Essa falha esperada não pode ser apresentada como execução de piloto real.

---

## 6. Critérios de aceitação

O patch só pode ser considerado concluído quando:

- `npm ci` terminar com exit code 0 num checkout limpo;
- `npm audit --omit=dev` terminar com exit code 0;
- `npm run verify` terminar com exit code 0;
- a simulação usar fisicamente o caminho SQLite configurado;
- os registos e bytes sobreviverem a um reinício real;
- o modo operacional não usar qualquer fixture;
- a autenticação exigir identidade, função, permissão, tenant e sessão válidos;
- todos os documentos relidos e exportados passarem nos leitores independentes;
- o manifesto possuir todos os metadados obrigatórios;
- symlinks e caminhos externos serem rejeitados;
- a CI principal concluir com `success` no SHA final;
- o artefacto publicado corresponder exactamente ao mesmo SHA;
- o relatório final não antecipar a conclusão da CI.

---

## 7. Entregáveis

Entregar num patch curto:

1. código corrigido;
2. schemas externos e schema do manifesto;
3. migrações necessárias;
4. testes positivos e negativos;
5. workflow ajustado;
6. pacote integral de simulação;
7. relatório factual com:
   - SHA inicial e final;
   - ficheiros alterados;
   - comandos e exit codes;
   - resultados dos testes;
   - caminho e cardinalidades da base reaberta;
   - leitores independentes e quantidade de documentos validados;
   - quantidade de ficheiros no manifesto;
   - ID e URL da CI;
   - limitações restantes;
   - classificação tecnicamente defensável.

---

## 8. Classificação permitida

Se todos os cinco pontos forem comprovados, mas nenhum piloto real tiver sido executado, utilizar:

`OPERATIONAL_PILOT_INFRASTRUCTURE_READY — DURABLE SIMULATION EVIDENCE VERIFIED — REAL PILOT NOT YET EXECUTED`

Não utilizar:

- `CONTROLLED_OPERATIONAL_PILOT_VALIDATED`;
- `LIMITED_PRODUCTION_PILOT`;
- `PRODUCTION_READY`;
- “piloto real concluído”;
- “30 tarefas reais”.

Essas classificações exigem posteriormente uma execução autorizada, protegida e baseada em dados empresariais reais.

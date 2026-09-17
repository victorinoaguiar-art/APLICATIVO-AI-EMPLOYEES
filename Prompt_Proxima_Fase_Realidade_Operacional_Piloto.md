# Prompt de Execução — Correcção da Realidade Operacional do Piloto

## 1. Papel e missão

Actue como arquitecto de software sénior, engenheiro de segurança, especialista em sistemas multi-tenant, auditor de evidências digitais e responsável por qualidade de produção.

Trabalhe no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Baseline inicial a confirmar antes de qualquer alteração:

`22f6ce89b003239e043fe58c5fb39ed9296fff58`

O objectivo deste patch é corrigir a diferença entre **simulação técnica** e **execução operacional real** no piloto controlado. Não criar novos módulos funcionais, novos catálogos, novos AI Employees ou novas camadas comerciais.

O estado actual deve ser tratado como:

`CONTROLLED_PILOT_SIMULATOR_IMPLEMENTED`

Até existirem evidências externas, físicas e verificáveis, ficam proibidas as classificações:

- `CONTROLLED_PILOT_VALIDATED`;
- `LIMITED_PRODUCTION_PILOT`;
- `PRODUCTION_READY`;
- “tarefas reais”;
- “revisão humana concluída”;
- “entrega efectuada”.

---

## 2. Regra principal de execução

Não fabricar, preencher automaticamente ou inferir:

- organizações clientes;
- autorizações;
- nomes ou identidades de responsáveis;
- revisores humanos;
- tarefas operacionais;
- dados contabilísticos, fiscais ou financeiros;
- documentos empresariais;
- entregas por email ou outro canal;
- recibos de sistemas externos;
- classificações de produção.

Quando faltar uma fonte física obrigatória, o sistema deve falhar de forma fechada com erro explícito e auditável. Nunca substituir uma fonte ausente por fixtures, valores fallback, dados demonstrativos ou um estado `PASS`.

---

## 3. Escopo obrigatório do patch

### 3.1 Reclassificar todas as execuções actuais como simulação

1. Renomear scripts, relatórios, estados, logs e recibos actuais para `SIMULATION` ou `DEMO`.
2. Marcar de forma inequívoca todos os dados incorporados no código como fixtures fictícias.
3. Remover expressões que apresentem as 30 tarefas incorporadas como tarefas reais.
4. Impedir que uma execução com fixtures obtenha classificação operacional ou de produção.
5. Adicionar um campo obrigatório, por exemplo `execution_mode`, limitado a:
   - `SIMULATION`;
   - `OPERATIONAL_PILOT`.
6. O modo `OPERATIONAL_PILOT` deve rejeitar qualquer fixture, fallback ou identidade fictícia.

### 3.2 Remover classificações automáticas de produção

1. Eliminar classificações de produção hard-coded no motor e nos scripts.
2. Derivar qualquer classificação exclusivamente de gates verificáveis.
3. Se qualquer gate obrigatório estiver ausente, inválido ou não comprovado, emitir `NOT_PROVEN` ou `FAIL`.
4. Não permitir que a geração de um relatório transforme automaticamente uma execução em piloto validado.
5. A atestação final deve distinguir claramente:
   - infraestrutura implementada;
   - simulação executada;
   - piloto operacional iniciado;
   - piloto operacional concluído;
   - classificação ainda não comprovada.

### 3.3 Receber dados por fontes externas validadas

Retirar do código a organização, autorização, tarefas, revisores e dados de trabalho. Criar contratos de entrada validados para fontes externas, sem desenvolver um novo módulo funcional.

Cada execução operacional deve exigir, no mínimo:

- ficheiro de configuração do piloto;
- autorização física ou referência verificável;
- tenant existente e activo;
- lista de AI Employees autorizados;
- tarefas importadas de ficheiro ou armazenamento persistente;
- identidade autenticada do solicitante;
- revisores associados ao tenant;
- classificação e proveniência dos dados;
- período de validade;
- hashes SHA-256 dos ficheiros de entrada;
- `commit_sha` da versão executada.

Aplicar schemas rigorosos, com `additionalProperties: false`, campos obrigatórios, formatos, enums e cardinalidades. Fonte ausente, schema inválido ou hash divergente deve bloquear a execução.

### 3.4 Produzir documentos físicos verdadeiros

1. Gerar ficheiros PDF, DOCX e XLSX válidos através de bibliotecas adequadas.
2. Não aceitar marcadores textuais como `[PDF DOCUMENT]`, `[DOCX DOCUMENT]` ou `[XLSX SPREADSHEET]` como prova de formato.
3. Validar os ficheiros produzidos com leitores independentes:
   - PDF deve ser aberto e ter estrutura válida;
   - DOCX deve ser um pacote Office Open XML válido;
   - XLSX deve ser um workbook Office Open XML válido.
4. Preservar os bytes exactos de cada versão.
5. Calcular SHA-256 directamente sobre os bytes físicos preservados.
6. Recalcular e comparar os hashes durante a verificação final.
7. Não declarar documento gerado quando apenas existir conteúdo em memória.

### 3.5 Exigir revisão humana autenticada e assinada

1. Proibir que o script de execução aprove automaticamente uma tarefa.
2. Exigir uma sessão autenticada de utilizador pertencente ao tenant.
3. Confirmar que o utilizador possui a função de revisor autorizada.
4. Registar:
   - ID imutável do revisor;
   - tenant;
   - decisão;
   - data e hora do servidor;
   - hash do documento revisto;
   - comentários e correcções;
   - método de autenticação;
   - assinatura digital ou assinatura criptográfica verificável do evento.
5. Impedir auto-revisão quando solicitante e revisor não puderem ser a mesma pessoa.
6. Rejeitar identidades fornecidas apenas por parâmetros livres do script.
7. Preservar versões anteriores dos documentos e respectivas decisões.

### 3.6 Entrega real ou arquivamento declarado

1. Ligar a entrega a um canal externo realmente integrado e configurado.
2. Exigir resposta física do fornecedor ou conector, contendo identificador, estado, data, destinatário e referência da entrega.
3. Não marcar `DELIVERED` apenas porque uma função interna foi chamada.
4. Se não existir canal real configurado, utilizar apenas:
   - `ARCHIVED`;
   - `READY_FOR_MANUAL_DELIVERY`.
5. Nunca classificar o arquivamento como envio por email, WhatsApp, Drive ou outro canal.
6. Segredos, URLs e destinatários não podem ter fallbacks de produção.

### 3.7 Persistência transaccional

Substituir o estado operacional em `Map` por persistência transaccional já compatível com a arquitectura do projecto.

Persistir, no mínimo:

- piloto e respectiva configuração;
- autorização e proveniência;
- tarefas e idempotency keys;
- snapshots das entradas;
- versões dos documentos;
- revisões humanas;
- entregas ou arquivamentos;
- incidentes;
- métricas;
- estados dos gates;
- atestação final.

Requisitos obrigatórios:

- transacções atómicas;
- restrições de tenant;
- unicidade da idempotency key no escopo correcto;
- controlo de concorrência;
- recuperação após reinício;
- migrações versionadas;
- rollback seguro;
- falha fechada quando a persistência estiver indisponível.

### 3.8 Indexação integral das evidências

O manifesto de evidências deve incluir todos os ficheiros preservados:

- configuração;
- autorização;
- entradas;
- recibos de tarefas;
- documentos e respectivas versões;
- recibos de revisão;
- recibos de entrega ou arquivamento;
- incidentes;
- métricas;
- gates;
- atestação final;
- respostas físicas de sistemas externos;
- informação da CI e do workflow operacional.

Cada entrada deve conter caminho relativo, tamanho, tipo, SHA-256, tenant, piloto, tarefa quando aplicável, `commit_sha` e origem. O verificador deve detectar ficheiros ausentes, adicionais, alterados, duplicados ou não indexados.

### 3.9 Remover todos os gates hard-coded

1. Remover `passed: true`, `actual_value: "100%"` e valores equivalentes sem cálculo físico.
2. Cada gate deve indicar:
   - condição;
   - fonte;
   - cálculo;
   - resultado observado;
   - evidência relacionada;
   - SHA-256;
   - motivo do `PASS`, `FAIL` ou `NOT_PROVEN`.
3. O gate de correcção deve verificar todas as tarefas com erro material e as versões corrigidas antes da entrega.
4. O gate de evidência deve confirmar fisicamente a totalidade dos ficheiros e hashes.
5. Zero incidentes só pode ser afirmado a partir de uma fonte de incidentes activa e verificada, não a partir de uma lista vazia inicializada pelo próprio processo.

### 3.10 Workflow operacional ligado ao mesmo SHA

1. Manter a CI principal para build, lint, testes, segurança e verificações determinísticas.
2. Criar ou adaptar um workflow operacional separado para executar um piloto real somente quando existirem:
   - autorização aprovada;
   - ambiente protegido;
   - segredos reais;
   - tenant provisionado;
   - entradas externas validadas;
   - aprovação manual explícita do ambiente GitHub.
3. Ligar todos os recibos ao mesmo `commit_sha`.
4. Registar `repository`, `workflow`, `run_id`, `run_attempt`, `head_sha`, `status`, `conclusion`, URL e timestamps obtidos da API.
5. Não declarar conclusão antes de `status: completed` e `conclusion: success`.
6. Se não for seguro executar dados reais no GitHub Actions, executar o piloto num ambiente operacional protegido e fazer a CI verificar a atestação assinada e ligada ao mesmo SHA.
7. Nunca colocar dados empresariais, documentos ou segredos reais em logs públicos ou artefactos com acesso inadequado.

---

## 4. Testes mínimos obrigatórios

Adicionar testes que comprovem comportamento real do produto, não apenas comparações isoladas dentro do próprio teste:

1. Fixture não pode executar como `OPERATIONAL_PILOT`.
2. Fonte externa ausente ou inválida bloqueia o piloto.
3. Autorização sem ficheiro, hash ou validade falha.
4. Tenant divergente falha também na persistência.
5. Reinício do processo preserva tarefas, versões e revisões.
6. Falha da base de dados provoca falha fechada.
7. Duas execuções concorrentes com a mesma idempotency key não duplicam efeitos.
8. PDF, DOCX e XLSX inválidos são rejeitados por leitores reais.
9. Hash do documento corresponde aos bytes físicos preservados.
10. Alteração de um byte invalida a evidência.
11. Revisão sem autenticação falha.
12. Revisor de outro tenant falha.
13. Assinatura de revisão inválida falha.
14. Documento sem revisão não pode ser entregue.
15. Chamada interna sem resposta externa não produz `DELIVERED`.
16. Ausência de conector resulta em `ARCHIVED` ou `READY_FOR_MANUAL_DELIVERY`.
17. Gate de correcção falha quando existe erro não corrigido.
18. Gate de evidência falha quando qualquer ficheiro não estiver indexado.
19. Manifesto detecta ficheiro adicional, ausente ou alterado.
20. Execução em modo simulação nunca recebe classificação operacional.

Os testes devem utilizar directórios temporários, não alterar ficheiros versionados e funcionar em Windows e Linux.

---

## 5. Critérios de aceitação

O patch só pode ser considerado concluído se:

- `npm ci` terminar com exit code 0 num checkout limpo;
- `npm audit --omit=dev` terminar com exit code 0;
- `npm run verify` terminar com exit code 0;
- os novos testes terminarem com exit code 0;
- a árvore Git permanecer limpa após as verificações;
- a CI principal ficar verde no SHA final;
- a simulação estiver claramente separada do modo operacional;
- nenhum gate possuir resultado positivo hard-coded;
- documentos reais puderem ser abertos por leitores independentes;
- hashes forem recalculáveis a partir dos bytes preservados;
- persistência sobreviver a reinício;
- revisão humana exigir identidade autenticada;
- entrega exigir recibo externo ou permanecer explicitamente como arquivamento;
- o manifesto abranger todas as evidências;
- nenhuma classificação operacional seja emitida sem todos os gates fisicamente comprovados.

A aprovação da CI técnica, por si só, não comprova a execução de um piloto operacional.

---

## 6. Entregáveis obrigatórios

Entregar num único commit funcional, salvo impossibilidade técnica devidamente explicada:

1. código alterado;
2. migrações da persistência;
3. schemas das entradas externas;
4. geradores e validadores de documentos físicos;
5. testes positivos, negativos, concorrentes e de reinício;
6. verificador integral do manifesto;
7. workflows ajustados;
8. relatório final curto e factual contendo:
   - SHA analisado;
   - SHA final;
   - ficheiros alterados;
   - comandos executados;
   - exit codes;
   - testes executados e resultados;
   - links das execuções GitHub Actions;
   - limitações ainda existentes;
   - classificação tecnicamente defensável.

Não incluir no relatório afirmações que não possam ser reproduzidas a partir dos ficheiros, da base de dados, das respostas externas preservadas e da API do GitHub.

---

## 7. Classificação permitida no encerramento

Se apenas o código e os testes forem corrigidos, utilizar:

`OPERATIONAL_PILOT_INFRASTRUCTURE_READY — REAL PILOT NOT YET EXECUTED`

Somente depois de uma execução autorizada, com dados externos validados, revisão humana autenticada, documentos físicos, persistência, entrega comprovada ou arquivamento correctamente declarado, evidência integral e workflow concluído no mesmo SHA, poderá ser avaliada a classificação:

`CONTROLLED_OPERATIONAL_PILOT_VALIDATED`

Não atribuir automaticamente essa classificação. O projecto avançou na infraestrutura, mas a evidência actualmente disponível comprova software de simulação, não trabalho operacional real.

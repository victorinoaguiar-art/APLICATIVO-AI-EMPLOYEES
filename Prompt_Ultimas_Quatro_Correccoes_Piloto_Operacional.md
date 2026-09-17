# Prompt de Execução — Últimas Quatro Correcções do Piloto Operacional

## 1. Missão

Actue como engenheiro de software sénior, especialista em segurança multi-tenant, autenticação humana, persistência transaccional, documentos digitais e auditoria forense.

Repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Baseline obrigatória:

`b088e321144276c727428a044d0caf8a3c834e6c`

Executar somente um micro-patch limitado às quatro correcções deste documento. Não criar novos módulos funcionais, novos AI Employees, novos catálogos ou nova arquitectura comercial.

Classificação inicial:

`OPERATIONAL_PILOT_INFRASTRUCTURE_NEAR_READY — DURABLE SIMULATION EVIDENCE VERIFIED — REAL PILOT NOT YET EXECUTED`

---

## 2. Regras inegociáveis

1. O modo operacional não pode emitir o token, sessão, assinatura ou decisão do revisor.
2. Nenhuma tarefa operacional pode ser automaticamente aprovada.
3. Segredos não podem existir em JSON, código, logs, recibos ou artefactos.
4. Não utilizar fallbacks no modo operacional.
5. A validação documental independente deve ocorrer antes da revisão e antes de qualquer entrega ou arquivamento.
6. Ausência de SHA, fonte, identidade, evento humano ou segredo deve bloquear a operação.
7. A simulação deve permanecer claramente separada e identificada.
8. Não executar automaticamente um piloto real na CI pública.

---

## 3. Correcções obrigatórias

### 3.1 Desafio e evento de revisão humana autenticada

Substituir a aprovação automática do script por um fluxo em duas fases.

#### Fase A — emissão do desafio

Depois de a tarefa produzir um documento validado, criar um desafio de revisão contendo:

- `challenge_id` único e imprevisível;
- tenant;
- piloto;
- tarefa;
- versão documental;
- SHA-256 dos bytes persistidos;
- decisão permitida;
- revisor autorizado;
- timestamp emitido pelo servidor;
- prazo de validade curto;
- nonce de uso único;
- estado `PENDING_HUMAN_REVIEW`.

Persistir o desafio transaccionalmente. Não incluir segredo no desafio.

#### Fase B — recepção do evento humano

Aceitar a revisão somente através de um evento externo autenticado contendo:

- referência ao desafio;
- token ou sessão emitida pelo serviço real de identidade;
- decisão humana;
- comentários;
- assinatura do payload canónico;
- identificador do evento;
- timestamp do servidor ou timestamp autorizado pelo protocolo.

Verificar simultaneamente:

- desafio existente, não expirado e não consumido;
- token válido, não expirado e não revogado;
- identidade exacta do revisor;
- tenant exacto;
- função autorizada;
- permissão `PILOT_REVIEW`;
- vínculo activo ao tenant e ao piloto;
- hash e versão documental inalterados;
- assinatura válida;
- nonce ainda não utilizado;
- ausência de replay;
- separação entre solicitante e revisor.

Consumir o desafio atomicamente com a gravação da revisão. Uma segunda utilização deve falhar.

#### Timestamp e assinatura

Eliminar a criação de dois `reviewedAt` diferentes. O payload assinado deve usar um único timestamp canónico emitido pelo servidor ou incluído no desafio. O motor deve validar exactamente o mesmo valor que foi assinado.

Utilizar serialização canónica e comparação temporalmente segura. A assinatura deve abranger, no mínimo:

`challenge_id + nonce + tenant_id + pilot_id + task_id + document_version + document_sha256 + reviewer_id + decision + issued_at + expires_at`

#### Proibições

No modo operacional, remover do script:

- `tokenService.signToken(...)`;
- geração automática de HMAC;
- aprovação automática em ciclo;
- atribuição automática de revisor;
- mensagens que afirmem revisão humana concluída sem evento externo.

O script operacional deve parar em `PENDING_HUMAN_REVIEW` até receber eventos humanos válidos. A simulação pode usar um adaptador de revisão simulada, isolado e claramente marcado.

### 3.2 Eliminar fallbacks e segredos em JSON

Remover do caminho operacional todos os fallbacks, incluindo:

- `operador_saso_01`;
- emails e destinatários predefinidos;
- idempotency keys geradas quando a fonte deveria fornecê-las;
- `CONTEUDO_CORRIGIDO_V2`;
- `SIMULATION_PILOT_DEV_REVIEW_KEY`;
- organização, datas, referências ou canais predefinidos;
- qualquer SHA fixo;
- qualquer chave derivada do token.

Cada campo operacional obrigatório deve vir da fonte validada. Valor ausente, vazio ou inválido deve causar erro explícito.

Alterar o schema de revisores para remover `secret_or_key`. Aceitar somente uma referência não sensível, por exemplo:

- `key_id`;
- `secret_ref`;
- `kms_key_id`;
- `certificate_fingerprint`.

Resolver o segredo no ambiente protegido, através de interface de secret provider. Falhar fechadamente se o fornecedor ou a referência estiver indisponível.

Requisitos adicionais:

- não guardar valores secretos no SQLite;
- não exportar segredos nos manifestos;
- sanitizar logs e erros;
- acrescentar scanner de segredos aos testes;
- rejeitar ficheiros operacionais que contenham campos como `secret`, `password`, `token`, `private_key` ou `secret_or_key`.

### 3.3 Validar documentos antes da revisão e num segundo processo

Alterar o pipeline para:

1. gerar os bytes;
2. persistir os bytes no SQLite;
3. reler os bytes do SQLite;
4. executar o leitor independente correspondente;
5. persistir recibo de validação por documento;
6. somente depois emitir o desafio de revisão;
7. bloquear revisão, entrega e arquivamento se a validação não estiver `PASS`.

Não esperar pela exportação final para executar a primeira validação independente.

#### Leitores

- PDF: abrir com `pdf-lib`, confirmar páginas e estrutura.
- DOCX: abrir o pacote Open XML, verificar relacionamentos, content types e extrair o corpo.
- XLSX: usar biblioteca que interprete realmente workbook, worksheets, células e tipos, não apenas `jszip`.

O recibo individual deve conter:

- tarefa;
- versão;
- formato;
- leitor e versão;
- hash dos bytes relidos;
- resultado;
- timestamp;
- erro, quando aplicável.

#### Segundo processo na CI

Separar a execução em dois comandos/processos:

**Processo 1:** criar a simulação, persistir tarefas e terminar completamente.

**Processo 2:** abrir a mesma base, confirmar cardinalidades, reler BLOBs, executar leitores independentes, exportar evidências e verificar o manifesto.

Não considerar fechar e reabrir SQLite dentro do mesmo processo como reinício completo.

Adicionar scripts explícitos, por exemplo:

- `pilot:simulation:execute`;
- `pilot:simulation:recover-and-verify`.

A CI deve executar os dois comandos em passos separados.

### 3.4 Derivar metadados físicos e eliminar fallback de SHA

Todos os campos do manifesto devem ser obtidos de fontes físicas ou persistidas.

#### Metadados

- obter `task_id` dos recibos ou das tabelas SQLite, nunca do nome do ficheiro;
- obter `document_version` da tabela de outputs;
- obter a relação entrega-tarefa do recibo persistido;
- obter a relação revisão-tarefa do recibo persistido;
- detectar MIME pelos bytes e validar contra formato e extensão;
- obter `origin` da fonte persistida;
- indicar o recibo ou registo que sustenta cada relação;
- rejeitar metadado ausente ou contraditório.

Não marcar automaticamente todos os recibos de tarefa como versão 1.

#### SHA do commit

Aceitar o SHA apenas de:

- `GITHUB_SHA` na CI;
- argumento explícito `--commit-sha` em execução controlada;
- `git rev-parse HEAD` num checkout Git válido.

Se nenhum SHA completo de 40 caracteres puder ser obtido, falhar. Remover totalmente o fallback:

`6cdeb0b0d1714cf8895cd9590701ad43df6a6a33`

Verificar que:

- manifesto;
- atestação;
- recibos documentais;
- recibo de execução;
- artefacto da CI

usam exactamente o mesmo SHA.

---

## 4. Testes mínimos obrigatórios

Adicionar testes que comprovem:

1. execução operacional termina em `PENDING_HUMAN_REVIEW` sem evento humano;
2. o script operacional não emite tokens de revisor;
3. desafio expirado falha;
4. desafio reutilizado falha;
5. alteração do documento depois do desafio falha;
6. timestamp divergente falha;
7. token do revisor A não pode assinar como revisor B;
8. revisão válida consome o desafio atomicamente;
9. indisponibilidade do serviço de identidade falha fechadamente;
10. indisponibilidade do secret provider falha fechadamente;
11. JSON com `secret_or_key` ou outro segredo é rejeitado;
12. campo operacional obrigatório sem valor não recebe fallback;
13. documento inválido não chega à fase de revisão;
14. revisão não pode ocorrer sem recibo documental `PASS`;
15. entrega ou arquivamento não pode ocorrer sem validação e revisão;
16. processo 2 recupera dados criados pelo processo 1;
17. XLSX é aberto por leitor de workbook e células;
18. metadados do manifesto correspondem ao SQLite e aos recibos;
19. MIME divergente da extensão ou dos bytes falha;
20. ausência de SHA físico falha sem fallback.

---

## 5. Critérios de aceitação

O patch só pode ser aprovado quando:

- `npm ci` terminar com exit code 0;
- `npm audit --omit=dev` terminar com exit code 0;
- `npm run verify` terminar com exit code 0;
- a simulação for executada e recuperada em processos distintos;
- todos os documentos forem validados antes da revisão;
- o modo operacional não emitir tokens, assinaturas ou decisões humanas;
- nenhum segredo existir nos JSON, logs ou artefactos;
- todos os fallbacks operacionais forem removidos;
- metadados e relações do manifesto forem derivados fisicamente;
- ausência de SHA terminar em falha;
- a árvore Git permanecer limpa;
- a CI principal terminar com `success` no SHA final;
- os artefactos estiverem ligados ao mesmo SHA.

---

## 6. Entregáveis

Entregar:

1. código corrigido;
2. migrações necessárias para desafios e recibos documentais;
3. schemas actualizados;
4. testes positivos e negativos;
5. scripts separados de execução e recuperação;
6. workflow actualizado;
7. pacote integral de simulação;
8. relatório factual com SHA, comandos, exit codes, resultados, ID e URL da CI e limitações restantes.

Não emitir relatório final `PASS` antes de a CI do SHA final terminar.

---

## 7. Classificação permitida

Se os quatro pontos forem comprovados, sem execução de piloto real, utilizar:

`OPERATIONAL_PILOT_INFRASTRUCTURE_READY — HUMAN REVIEW FLOW READY — DURABLE SIMULATION VERIFIED — REAL PILOT NOT YET EXECUTED`

Não utilizar:

- `CONTROLLED_OPERATIONAL_PILOT_VALIDATED`;
- `LIMITED_PRODUCTION_PILOT`;
- `PRODUCTION_READY`;
- “revisão humana real concluída”;
- “piloto real concluído”.

A fase seguinte será preparar uma execução real protegida, sujeita a autorização humana e dados empresariais reais.

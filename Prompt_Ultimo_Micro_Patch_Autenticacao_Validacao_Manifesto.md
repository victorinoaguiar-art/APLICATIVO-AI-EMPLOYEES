# Prompt — último micro-patch de autenticação, validação e proveniência

## Contexto

Repositório: `victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Commit de referência para a análise e para o início do patch:

```text
c0be04386352a47170579a49604b83c234783581
```

O projecto já avançou na durabilidade, geração de documentos, separação entre processos da CI e revisão humana baseada em desafio. Contudo, ainda existem seis lacunas de autenticação, validação independente, fidelidade às fontes externas, proveniência do manifesto e cronologia forense.

Execute somente o micro-patch descrito abaixo. Não crie novos módulos funcionais, novos AI Employees, catálogos, fluxos comerciais ou integrações externas não exigidas por estes critérios.

## Objectivo

Fechar os seis bloqueadores restantes, preservando o desenho actual e garantindo que nenhuma revisão operacional possa ser emitida, assinada, aceite ou consumida sem:

- identidade, sessão e token válidos;
- validação documental interna e independente concluída;
- correspondência exacta com as fontes operacionais externas;
- relações do manifesto derivadas de registos físicos;
- recibos separados por tipo de validação;
- timestamps forenses distintos e verificáveis.

## Alterações obrigatórias

### 1. Tornar token, identidade e sessão obrigatórios em toda revisão operacional

No modo operacional, elimine qualquer caminho que permita rever ou aprovar uma tarefa apenas com uma assinatura HMAC, segredo resolvido ou campos fornecidos pelo chamador.

Exija cumulativamente:

- `auth_token` presente;
- `TokenService` real injectado e disponível;
- token válido, não expirado e não revogado;
- sessão activa e ligada ao token;
- identidade exacta do revisor autenticado;
- correspondência exacta de `tenant_id`;
- associação ao mesmo `pilot_id`;
- vínculo activo do utilizador ao tenant;
- função autorizada, limitada a `HUMAN_REVIEWER` ou `ADMIN`;
- permissão explícita `PILOT_REVIEW`;
- associação inequívoca entre token, sessão, revisor, desafio, tarefa e tenant.

A ausência ou indisponibilidade de qualquer componente deve falhar de forma fechada. Não aceite fallbacks, valores de demonstração, identidades derivadas de campos não autenticados ou validação opcional.

Inclua testes negativos para, no mínimo:

- token ausente, mesmo com assinatura válida;
- `TokenService` ausente;
- token expirado ou revogado;
- sessão inexistente, expirada ou incompatível;
- tenant ou piloto divergente;
- identidade autenticada diferente do revisor declarado;
- função ou permissão insuficiente;
- vínculo inactivo;
- reutilização de desafio por outra identidade.

### 2. Executar leitores independentes reais antes da emissão do desafio

Mantenha os validadores estruturais internos, mas não os trate como validação independente.

Antes de emitir qualquer desafio de revisão:

- valide PDF com `pdf-lib` sobre os bytes físicos relidos da persistência;
- valide DOCX com um leitor real de documentos, como `mammoth` ou equivalente, e não apenas com ZIP/XML interno;
- valide XLSX com um leitor real de folhas de cálculo, como `exceljs` ou `xlsx`, e não apenas com ZIP/XML interno;
- execute os leitores também sobre os documentos exportados, quando existir exportação;
- aguarde explicitamente a conclusão das validações assíncronas;
- bloqueie a emissão do desafio se qualquer leitor falhar, não estiver instalado, não conseguir abrir o documento ou produzir resultado inconclusivo.

O fluxo deve garantir esta ordem verificável:

1. persistência dos bytes;
2. releitura dos bytes;
3. validação estrutural interna;
4. validação por biblioteca independente;
5. persistência dos dois recibos;
6. emissão do desafio de revisão.

Não execute a validação independente somente depois da revisão, do arquivamento ou num segundo processo tardio. O segundo processo da CI deve continuar a verificar os mesmos bytes e recibos, mas a validação prévia é condição para criar o desafio.

### 3. Preservar exactamente os campos das fontes externas

Use, sem regenerar, normalizar ou substituir:

- `idempotency_key`;
- `received_at`;
- `tenant_id`;
- `pilot_id`.

Estes valores devem vir das fontes externas validadas. Compare os valores globais da configuração com os valores de cada tarefa e rejeite qualquer divergência.

É proibido:

- fabricar chaves como `IDEMP_${taskId}_...`;
- substituir `received_at` pela hora actual;
- forçar silenciosamente o tenant ou piloto da tarefa para os valores da configuração;
- aplicar valores por omissão no modo operacional;
- aceitar diferenças de maiúsculas, espaços ou formato por normalização silenciosa.

Registe nos recibos a origem física de cada campo e o hash da fonte. O valor persistido deve ser exactamente igual ao valor recebido. Se a fonte estiver ausente, inválida ou contraditória, termine com erro antes de criar documentos ou desafios.

### 4. Gerar o manifesto a partir de recibos ou SQLite

Ao gerar o manifesto, leia directamente dos recibos físicos ou das relações persistidas no SQLite:

- `task_id`;
- versão do documento;
- identificador do documento;
- identificador da entrega;
- identificador da revisão;
- tenant e piloto;
- relações entre tarefa, versão, documento, revisão e entrega;
- origem e tipo MIME;
- hashes dos bytes físicos;
- `commit_sha`.

Não derive `task_id` pelo nome do ficheiro, não assuma versão `1` e não infira relações a partir de identificadores aleatórios. O manifesto deve representar inclusive versões corrigidas e entregas cujo identificador não contenha o identificador da tarefa.

Rejeite:

- registos órfãos;
- relações ambíguas;
- versões ausentes ou inconsistentes;
- hash divergente;
- ficheiros não indexados;
- entradas sem origem verificável;
- symlinks;
- ausência de `commit_sha`.

### 5. Separar validação estrutural de validação independente

Crie recibos distintos, com schemas e semântica inequívocos:

```text
INTERNAL_STRUCTURAL_VALIDATION
INDEPENDENT_LIBRARY_VALIDATION
```

Cada recibo deve incluir, no mínimo:

- tipo de validação;
- documento, tarefa e versão;
- tenant e piloto;
- caminho ou identificador físico;
- hash dos bytes validados;
- biblioteca ou validador e respectiva versão;
- resultado e erros;
- início e fim da execução;
- `commit_sha`;
- hash do próprio recibo, quando aplicável.

Um resultado interno `PASS` nunca deve substituir, implicar ou fabricar o resultado independente. O desafio só pode ser emitido quando ambos os recibos existirem, corresponderem aos mesmos bytes, ao mesmo documento e ao mesmo SHA, e tiverem resultado positivo.

### 6. Registar separadamente todo o ciclo da revisão

Registe timestamps distintos, emitidos pela entidade responsável pela respectiva transição:

```text
challenge_issued_at
event_signed_at
review_received_at
review_accepted_at
challenge_consumed_at
```

Não copie `challenge_issued_at` para `reviewed_at` ou para outro evento. Não use um único timestamp para várias transições.

As regras mínimas são:

- `challenge_issued_at`: definido pelo servidor ao emitir o desafio;
- `event_signed_at`: incluído no evento assinado pelo revisor e coberto pela assinatura;
- `review_received_at`: definido pelo servidor ao receber o evento;
- `review_accepted_at`: definido apenas após autenticação, autorização, assinatura e integridade serem validadas;
- `challenge_consumed_at`: definido quando o desafio é consumido atomicamente e deixa de poder ser reutilizado.

Valide a ordem temporal, a janela admissível e a monotonicidade. Alterar qualquer campo assinado deve invalidar a assinatura. A aceitação e o consumo devem ser transaccionais ou possuir compensação segura que impeça dupla utilização.

## Testes obrigatórios

Adicione ou ajuste testes que comprovem, pelo menos:

1. revisão operacional sem token falha, mesmo com assinatura válida;
2. ausência do `TokenService` falha fechada;
3. token expirado, revogado, de outro tenant ou de outra identidade falha;
4. sessão ausente, expirada ou incompatível falha;
5. função, permissão ou vínculo insuficiente falha;
6. validação interna positiva e validação independente negativa impedem o desafio;
7. o desafio é emitido somente depois dos dois recibos positivos;
8. `pdf-lib` lê os bytes persistidos antes do desafio;
9. o leitor real de DOCX lê os bytes persistidos antes do desafio;
10. o leitor real de XLSX lê os bytes persistidos antes do desafio;
11. `idempotency_key` e `received_at` são preservados byte a byte ou como valor canónico definido pela fonte;
12. divergências de tenant ou piloto, globais ou por tarefa, são rejeitadas;
13. não existe normalização ou fallback silencioso dos campos externos;
14. o manifesto obtém a tarefa e as relações de SQLite ou recibos, não do nome do ficheiro;
15. versões corrigidas aparecem com a versão física correcta;
16. entregas com identificadores aleatórios mantêm a relação correcta com a tarefa;
17. os dois tipos de recibo são distintos e obrigatórios;
18. ausência ou divergência de qualquer recibo bloqueia a revisão;
19. os cinco timestamps são distintos, ordenados e coerentes;
20. alteração de timestamp ou reutilização do desafio invalida a revisão;
21. todas as evidências pertencem ao mesmo `commit_sha`;
22. hashes dos recibos e do manifesto correspondem aos ficheiros físicos.

## CI e verificação

Preserve a separação actual entre processos e faça a CI executar, no mesmo SHA:

- instalação limpa com `npm ci`;
- `npm audit --omit=dev` com exit code `0`;
- lint explícito;
- testes unitários e de integração;
- `npm run verify` com exit code `0`;
- piloto de simulação;
- validação pré-revisão por leitores independentes;
- releitura e validação num segundo processo;
- verificador integral do manifesto;
- testes de reinício e persistência;
- verificação de identidade do SHA em todas as evidências.

O gerador de evidências deve terminar imediatamente com erro se qualquer comando, teste, schema, fonte, biblioteca ou relação falhar. Não use `|| true`, resultados presumidos, logs temporários como pré-condição, fallbacks de SHA ou estados `PASS` fabricados.

## Critérios de aceitação

O patch só pode ser declarado concluído quando:

- os seis pontos estiverem implementados no código, não apenas descritos;
- todos os testes negativos e positivos passarem;
- `npm ci`, `npm audit --omit=dev` e `npm run verify` terminarem com exit code `0` num checkout limpo;
- a árvore Git permanecer limpa após a verificação;
- a CI principal e o segundo processo terminarem com sucesso no mesmo SHA;
- os recibos físicos demonstrarem a ordem validação → desafio → assinatura → recepção → aceitação → consumo;
- o manifesto puder ser reconstruído a partir de SQLite e recibos sem inferência por nomes;
- nenhuma credencial, token, segredo ou dado operacional sensível for versionado.

## Entrega esperada

Apresente no final:

1. SHA exacto do patch;
2. lista dos ficheiros alterados;
3. resumo objectivo de cada uma das seis correcções;
4. comandos executados e respectivos exit codes;
5. testes adicionados e resultados;
6. caminhos e hashes dos recibos gerados;
7. ID, URL, SHA, `run_attempt`, estado e conclusão das execuções da CI;
8. limitações ainda existentes, sem as esconder;
9. classificação final tecnicamente defensável.

## Classificação permitida

Se todos os critérios forem comprovados, mas o piloto real ainda não tiver sido executado, a classificação máxima permitida é:

```text
OPERATIONAL_PILOT_INFRASTRUCTURE_READY — AUTHENTICATED HUMAN REVIEW GATE READY — INDEPENDENT PRE-REVIEW DOCUMENT VALIDATION VERIFIED — REAL PILOT NOT YET EXECUTED
```

Não declare `PRODUCTION READY`, piloto real validado, entrega operacional concluída ou revisão humana real concluída sem evidência externa autêntica, verificável e ligada ao mesmo SHA.

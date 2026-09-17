# Prompt de Execução — Micro-Patch de Evidência Operacional do Piloto

## 1. Missão

Actue como engenheiro de software sénior, especialista em segurança multi-tenant, persistência transaccional, formatos documentais e auditoria de evidências digitais.

Trabalhe no repositório:

`victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES`

Baseline obrigatória a confirmar antes de alterar qualquer ficheiro:

`84813883fa8bdd159dbdfeb298b3c794d99e3458`

O objectivo é executar um micro-patch correctivo limitado aos sete bloqueadores descritos abaixo. Não criar outro grande módulo, novos AI Employees, novos catálogos, novas funcionalidades comerciais ou uma nova arquitectura paralela.

Estado inicial tecnicamente defensável:

`OPERATIONAL_PILOT_INFRASTRUCTURE_PARTIALLY_READY — SIMULATION VERIFIED`

Não declarar piloto real, produção limitada ou prontidão operacional completa enquanto os critérios deste prompt não estiverem fisicamente comprovados.

---

## 2. Regras obrigatórias

1. Não fabricar organizações, tarefas, autorizações, revisores, sessões, entregas ou recibos externos.
2. Não converter fixtures em dados operacionais pela simples alteração de um campo ou modo.
3. Não utilizar `passed: true`, `success`, `PASS`, percentagens ou classificações como fallback.
4. Fonte, documento, identidade, segredo, persistência ou recibo ausente deve produzir falha explícita e exit code diferente de zero.
5. Todos os caminhos devem ser independentes do directório de execução e resistentes a path traversal.
6. Os testes não podem alterar ficheiros versionados e devem funcionar em Linux e Windows.
7. A simulação deve continuar possível, mas sempre identificada como `SIMULATION`.

---

## 3. Correcções obrigatórias

### 3.1 Persistir os bytes físicos de todas as versões documentais

Corrigir o fluxo que actualmente grava apenas nome, caminho e hash do documento.

Requisitos:

- preservar os bytes exactos de cada PDF, DOCX e XLSX;
- guardar cada versão num armazenamento durável ou BLOB transaccional;
- utilizar identificadores e caminhos imutáveis por tenant, piloto, tarefa e versão;
- gravar documento, metadados e recibo na mesma operação transaccional ou aplicar compensação segura;
- preservar simultaneamente v1, v2 e versões posteriores;
- impedir sobrescrita silenciosa;
- calcular SHA-256 directamente sobre os bytes efectivamente persistidos;
- reler os bytes do armazenamento e recalcular o hash antes de confirmar a tarefa;
- fazer a recuperação após reinício devolver exactamente os mesmos bytes;
- falhar fechadamente se o armazenamento ou a base de dados estiver indisponível;
- impedir acesso cruzado entre tenants;
- não usar `:memory:` em modo operacional;
- exigir `PILOT_DB_PATH` e directório de documentos durável no modo operacional.

Actualizar `task_outputs` para apontar para um ficheiro físico existente ou armazenar os bytes como BLOB. Um simples nome de ficheiro sem bytes recuperáveis não é evidência.

### 3.2 Descobrir e indexar integralmente as evidências

Substituir a lista manual de seis ficheiros por descoberta física controlada.

O manifesto deve abranger, no mínimo:

- configuração;
- autorização e documento de autorização;
- snapshots das entradas;
- recibos das tarefas;
- todos os documentos e versões;
- recibos das revisões;
- recibos das entregas ou arquivamentos;
- respostas externas preservadas;
- incidentes;
- métricas;
- resultados dos gates;
- atestação final;
- recibos da CI ou do workflow aplicável.

Para cada ficheiro, registar:

- caminho relativo normalizado;
- tamanho em bytes;
- MIME type;
- SHA-256;
- tenant;
- piloto;
- tarefa e versão, quando aplicável;
- origem;
- `commit_sha`.

O verificador deve:

- recalcular todos os hashes;
- rejeitar ficheiro ausente, alterado, duplicado ou não indexado;
- rejeitar entrada do manifesto sem ficheiro físico;
- rejeitar path traversal, symlink inseguro e caminho absoluto;
- verificar que o próprio manifesto está ligado ao SHA correcto;
- enumerar os ficheiros independentemente da lista que o gerador declarou.

O teste não pode limitar-se a verificar que os ficheiros escolhidos pelo próprio gerador existem.

### 3.3 Retirar definitivamente as fixtures do caminho operacional

Separar fisicamente os dois caminhos:

- `SIMULATION`: pode usar fixtures identificadas;
- `OPERATIONAL_PILOT`: aceita apenas fontes externas validadas.

No modo operacional, remover do script:

- organização SASO incorporada;
- autorização incorporada;
- revisores incorporados;
- 30 tarefas incorporadas;
- destinatários e emails fallback;
- valores financeiros e datas incorporados;
- segredos ou chaves fallback;
- aprovação automática;
- expressão “tarefas reais” aplicada a fixtures.

O modo operacional deve receber configuração e tarefas por ficheiros externos ou armazenamento persistente validados por schema. Acrescentar detecção de proveniência para impedir que os ficheiros de fixtures sejam reutilizados como fonte operacional.

Não basta verificar apenas `is_mock` ou `is_fixture`, pois esses campos podem ser omitidos.

### 3.4 Falhar quando faltar qualquer fonte operacional

O comando operacional deve terminar com exit code diferente de zero quando faltar ou for inválido qualquer destes elementos:

- configuração;
- tenant activo;
- autorização física;
- hash da autorização;
- período válido;
- tarefas externas;
- documentos de entrada;
- identidade do solicitante;
- revisores autorizados;
- configuração de persistência durável;
- segredos de assinatura;
- canal externo quando for solicitada entrega real.

Remover o comportamento que apresenta aviso e executa `process.exit(0)` quando falta autorização.

Se o objectivo for apenas verificar prontidão, criar um comando claramente denominado `check-readiness`, cujo resultado não execute tarefas nem declare piloto iniciado.

### 3.5 Ligar revisão à autenticação e autorização multi-tenant existente

Não aceitar `reviewer`, `auth_method` ou identidade apenas porque foram enviados pelo chamador.

Cada revisão deve exigir um principal autenticado fornecido pelo sistema real de identidade do projecto e verificar:

- token ou sessão válida;
- token não revogado;
- tenant do principal;
- vínculo activo ao tenant;
- função ou permissão de revisão;
- associação do revisor ao piloto;
- separação entre solicitante e revisor quando obrigatória;
- data e hora emitidas pelo servidor;
- hash exacto do documento revisto;
- assinatura ligada à identidade, tarefa, decisão, tenant e documento.

Eliminar `SASO_PILOT_DEFAULT_REVIEW_SECRET` e qualquer segredo fallback.

O HMAC isolado não deve ser tratado como prova suficiente de presença humana. Registar a sessão autenticada ou evento de aprovação do utilizador e preservar apenas referências seguras, nunca tokens ou segredos em claro.

### 3.6 Validar documentos com leitores independentes

Manter a validação interna, mas adicionar validação por bibliotecas independentes e maduras:

- PDF: parser que abra o documento, leia páginas e detecte corrupção;
- DOCX: leitor ZIP/Open XML que valide o pacote e consiga extrair o texto;
- XLSX: leitor de workbook que abra folhas e células.

Requisitos:

- não considerar cabeçalho, `%%EOF` ou magic bytes como validação suficiente;
- não usar o mesmo código artesanal para gerar e validar a prova final;
- corrigir posições `xref`, relacionamentos Open XML e tipos de conteúdo;
- confirmar pelo menos uma página PDF, um corpo DOCX e uma folha XLSX;
- rejeitar ficheiros truncados, ZIP parcialmente válido, CRC divergente e XML inconsistente;
- testar os bytes relidos do armazenamento persistente, não apenas o buffer em memória.

Preferir bibliotecas já presentes ou adicionar o menor conjunto possível de dependências mantidas, fixando versões no lockfile.

### 3.7 Executar as garantias na CI

Actualizar a CI para executar explicitamente:

1. instalação limpa;
2. auditoria de dependências;
3. `npm run verify`;
4. piloto em modo `SIMULATION` com directório temporário;
5. reinício real do processo e recuperação da base SQLite;
6. verificação independente de PDF, DOCX e XLSX;
7. exportação integral das evidências;
8. verificação integral do manifesto;
9. confirmação de árvore Git limpa;
10. upload do pacote de simulação como artefacto ligado ao mesmo SHA.

O workflow deve provar que:

- os bytes sobrevivem ao reinício;
- os hashes permanecem iguais;
- todos os ficheiros estão no manifesto;
- um ficheiro adicional ou alterado provoca falha;
- a simulação nunca recebe classificação operacional.

Manter o piloto real fora da CI pública. Criar apenas a preparação de um workflow protegido, com environment approval, segredos reais, retenção adequada e logs sanitizados. Esse workflow não deve executar automaticamente num `push` e não deve ser apresentado como executado enquanto não houver autorização e dados reais.

---

## 4. Testes mínimos obrigatórios

Adicionar ou corrigir testes que demonstrem:

1. bytes v1 e v2 persistidos e recuperados após reinício;
2. adulteração de um byte detectada após leitura do armazenamento;
3. falha da escrita documental causa rollback da tarefa;
4. base `:memory:` rejeitada em `OPERATIONAL_PILOT`;
5. tenant diferente não consegue ler bytes nem metadados;
6. manifesto inclui recibos, documentos e todas as versões;
7. ficheiro não indexado provoca falha;
8. ficheiro indexado ausente provoca falha;
9. path traversal e symlink inseguro provocam falha;
10. fixture rejeitada no caminho operacional mesmo sem `is_fixture`;
11. cada fonte operacional ausente produz exit code diferente de zero;
12. revisor sem sessão válida é rejeitado;
13. sessão revogada é rejeitada;
14. revisor de outro tenant é rejeitado;
15. segredo fallback não existe;
16. PDF corrompido é rejeitado pelo parser independente;
17. DOCX corrompido é rejeitado pelo leitor independente;
18. XLSX corrompido é rejeitado pelo leitor independente;
19. simulação completa passa na CI e gera pacote integral;
20. tentativa de promover a simulação para piloto operacional falha.

Os testes devem exercer as funções reais do produto. Não criar sanitizadores, hashes ou verificadores apenas dentro do próprio teste para depois testar esses mesmos auxiliares locais.

---

## 5. Critérios de aceitação

O patch só pode ser aprovado quando:

- `npm ci` terminar com exit code 0 num checkout limpo;
- `npm audit --omit=dev` terminar com exit code 0;
- `npm run verify` terminar com exit code 0;
- o piloto de simulação da CI terminar com exit code 0;
- o verificador integral do manifesto terminar com exit code 0;
- os testes de reinício e persistência física passarem;
- os três formatos abrirem em leitores independentes;
- nenhuma fixture permanecer acessível pelo caminho operacional;
- nenhuma fonte operacional ausente terminar com exit code 0;
- nenhuma revisão operacional ocorrer sem identidade autenticada e autorizada;
- a árvore Git permanecer limpa;
- a CI principal concluir com `success` no SHA final;
- todos os artefactos e recibos indicarem o mesmo `commit_sha`.

---

## 6. Entregáveis

Entregar:

1. código corrigido;
2. migração da persistência, se necessária;
3. schemas das fontes operacionais;
4. testes;
5. workflow actualizado;
6. manifesto integral de uma execução de simulação;
7. relatório factual contendo:
   - SHA inicial e SHA final;
   - ficheiros alterados;
   - comandos e exit codes;
   - número e resultado dos testes;
   - bibliotecas independentes usadas;
   - prova de recuperação após reinício;
   - total de ficheiros indexados;
   - ID e URL da CI no SHA final;
   - limitações restantes;
   - classificação final defensável.

Não gerar um relatório `PASS` antes da conclusão efectiva da CI no SHA final.

---

## 7. Classificação permitida

Se todos os sete pontos forem comprovados, mas nenhum piloto real tiver sido executado, utilizar somente:

`OPERATIONAL_PILOT_INFRASTRUCTURE_READY — SIMULATION EVIDENCE VERIFIED — REAL PILOT NOT YET EXECUTED`

Não utilizar:

- `CONTROLLED_OPERATIONAL_PILOT_VALIDATED`;
- `LIMITED_PRODUCTION_PILOT`;
- `PRODUCTION_READY`;
- “piloto real concluído”.

Essas classificações exigem uma execução posterior, autorizada e protegida, com organização, tarefas, revisores, documentos e recibos externos reais.

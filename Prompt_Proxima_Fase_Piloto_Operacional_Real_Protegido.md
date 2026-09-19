# Prompt: próxima fase — piloto operacional real, protegido e auditável

## Contexto

A cadeia de verificação forense da CI foi encerrada no commit:

`b97e9fa1585549fe35593ee993158c5bd5c5a4a5`

Os nove recibos são obrigatórios, a ligação entre jobs e runs está validada, o ID canónico do repositório está fixado, os testes negativos foram executados e os quatro workflows terminaram com `completed/success` no mesmo SHA.

Não reabrir esta cadeia, não criar outro patch documental e não acrescentar mais infraestrutura forense genérica. A próxima fase deve utilizar o que já existe para executar um piloto operacional real, pequeno, protegido e verificável.

## Objectivo da fase

Executar de ponta a ponta uma única tarefa empresarial real, para um único tenant autorizado, usando dados externos reais fornecidos de forma controlada, produzindo documentos físicos reais, submetendo-os a revisão humana autenticada e registando o resultado numa base de dados transaccional.

Esta fase deve demonstrar capacidade operacional real. Não deve ampliar o catálogo de funcionalidades nem tentar activar simultaneamente os 500 AI Employees.

## Regra de âmbito

O piloto inicial deve conter apenas:

- um tenant;
- uma organização autorizada;
- um AI Employee ou função operacional;
- uma tarefa empresarial real;
- um ou dois revisores humanos identificados;
- uma execução controlada;
- uma entrega real ou, se o canal externo ainda não estiver autorizado, um arquivamento explicitamente classificado como tal.

Escolher uma tarefa de baixo risco e facilmente verificável, como geração de aviso de cobrança, carta administrativa, relatório interno ou documento equivalente. Não executar submissões fiscais, movimentos bancários, pagamentos, lançamentos contabilísticos definitivos ou alterações em portais públicos nesta primeira execução.

## 1. Entrada operacional externa obrigatória

O piloto deve receber, por fonte externa validada:

- `tenant_id`;
- `organization_id`;
- identificação da organização;
- autorização expressa para o piloto;
- `task_id`;
- tipo e descrição exacta da tarefa;
- dados necessários para produzir o documento;
- `idempotency_key`;
- `received_at`;
- classificação de sensibilidade;
- identidade e função dos revisores autorizados;
- canal de entrega autorizado, quando aplicável.

Requisitos:

- não usar fixtures, seeds, exemplos, nomes fictícios ou valores fallback no caminho operacional;
- não obter estes valores de constantes embutidas no código;
- validar schema, tenant, autorização, proveniência, integridade e cardinalidade antes de iniciar;
- falhar de forma fechada quando qualquer dado obrigatório estiver ausente, inválido ou divergente;
- não guardar segredos nos ficheiros JSON, logs, recibos ou repositório.

## 2. Autorização e isolamento multi-tenant

Antes da execução:

- confirmar que o tenant e a organização existem e estão activos na persistência;
- confirmar que a autorização física pertence exactamente ao tenant e à tarefa;
- impedir leitura, escrita ou reutilização de dados entre tenants;
- exigir identidade persistente activa para cada revisor;
- aplicar a função efectiva existente na persistência, sem confiar apenas nas claims do token;
- registar quem autorizou, quem executou e quem reviu.

Qualquer indisponibilidade da identidade, autorização ou base de dados deve bloquear o piloto.

## 3. Execução idempotente e persistência transaccional

Persistir numa base de dados transaccional:

- entrada original;
- hash da entrada;
- tarefa;
- estado da execução;
- versões do documento;
- bytes físicos de cada versão;
- hashes SHA-256;
- validações realizadas;
- desafio de revisão;
- eventos de emissão, assinatura, aceitação e consumo;
- decisão humana;
- tentativa de entrega;
- resultado final.

Requisitos:

- utilizar exactamente a `idempotency_key` recebida;
- impedir efeito empresarial duplicado;
- manter o hash original da tarefa obrigatório e imutável;
- usar transacções para evitar estados parciais;
- sobreviver a reinício real do processo sem recorrer a `:memory:` ou `reset()`;
- manter trilho de auditoria append-only para eventos materiais.

## 4. Produção de documentos físicos reais

Gerar somente os formatos requeridos pela tarefa, entre:

- PDF;
- DOCX;
- XLSX.

Para cada versão:

- preservar os bytes exactos;
- calcular SHA-256 directamente sobre os bytes preservados;
- associar tenant, organização, tarefa, versão, origem e commit SHA;
- impedir nomes de output ambíguos ou colisões;
- registar MIME type real;
- rejeitar symlinks e caminhos fora do directório autorizado.

Validar os documentos com leitores independentes antes de emitir o desafio de revisão:

- PDF com biblioteca independente capaz de abrir e inspeccionar páginas;
- DOCX como pacote OpenXML válido e legível;
- XLSX como workbook válido, com folhas e células esperadas.

A validação interna do gerador e a validação independente devem aparecer separadamente no recibo.

## 5. Revisão humana autenticada

Não aprovar automaticamente.

O sistema deve:

1. emitir um desafio de revisão ligado ao hash exacto da versão;
2. exigir sessão, token e identidade persistente activa;
3. confirmar tenant, organização, função e identidade exacta do revisor;
4. apresentar o documento físico correspondente ao hash;
5. permitir `APPROVE`, `REJECT` ou `REQUEST_CHANGES`;
6. exigir motivo quando houver rejeição ou pedido de alteração;
7. registar separadamente emissão, assinatura, aceitação e consumo do evento;
8. invalidar a aprovação se os bytes ou metadados forem alterados;
9. impedir auto-aprovação pelo executor quando a política exigir segregação de funções.

Nenhum documento pode ser entregue antes da aprovação humana válida.

## 6. Entrega real ou arquivamento explícito

Se existir um canal externo real, autorizado e configurado:

- entregar exactamente os bytes aprovados;
- não usar URLs, destinos ou credenciais fallback;
- confirmar identidade do destinatário;
- registar ID externo, data, estado, resposta do canal e hash dos bytes enviados;
- aplicar idempotência à entrega;
- não registar `DELIVERED` apenas porque a chamada foi iniciada.

Se não existir canal autorizado:

- não simular a entrega;
- classificar o resultado como `APPROVED_AND_ARCHIVED`;
- indicar claramente que o documento foi aprovado, mas não entregue externamente.

## 7. Manifesto integral do piloto

Gerar um manifesto determinístico baseado nos registos físicos e nos bytes preservados, contendo no mínimo:

- `pilot_id`;
- `tenant_id`;
- `organization_id`;
- `task_id`;
- `idempotency_key`;
- `received_at`;
- commit SHA;
- origem da entrada;
- versões;
- revisores;
- eventos de revisão;
- documentos e MIME types;
- hashes SHA-256;
- relações entre tarefa, versões, revisão e entrega;
- classificação final.

O verificador deve comparar integralmente:

```text
fonte externa ↔ recibos ↔ colunas SQLite ↔ receipt_json ↔ bytes físicos ↔ manifesto ↔ entrega
```

Falhar perante qualquer relação ausente, recibo inválido, versão não comprovada, ficheiro adicional, hash divergente ou dado incoerente.

## 8. Testes obrigatórios

Adicionar testes de integração para comprovar:

1. ausência de fonte operacional bloqueia a execução;
2. fixture no modo operacional é rejeitada;
3. tenant divergente é rejeitado;
4. autorização ausente ou inválida é rejeitada;
5. revisor inactivo, inexistente ou de outro tenant é rejeitado;
6. alteração dos bytes após o desafio invalida a revisão;
7. duplicação da `idempotency_key` não produz segundo efeito;
8. reinício do processo preserva tarefa, versão, revisão e entrega;
9. leitor independente inválido bloqueia a revisão;
10. falha transaccional não deixa estado parcial;
11. divergência entre fonte, SQLite, recibo ou manifesto bloqueia o fecho;
12. tentativa de entrega sem aprovação humana é bloqueada;
13. ausência de canal real termina como `APPROVED_AND_ARCHIVED`, nunca `DELIVERED`;
14. uma execução positiva completa preserva e reconcilia todos os bytes e eventos.

## 9. Ambiente e workflow operacional

- Executar o piloto real apenas num ambiente protegido.
- Utilizar secrets do ambiente, nunca secrets versionados.
- Exigir aprovação manual do ambiente antes de iniciar.
- Restringir permissões do workflow ao mínimo necessário.
- Separar o piloto real da CI comum e das simulações.
- Não executar automaticamente em cada `push` ou pull request.
- Ligar a execução ao SHA exacto aprovado.
- Preservar logs e artefactos sem expor dados pessoais ou segredos.
- Aplicar retenção compatível com a política da organização.

## 10. Estados permitidos

Durante esta fase, utilizar apenas estados factuais:

```text
PILOT_NOT_STARTED
PILOT_BLOCKED_MISSING_INPUT
PILOT_AUTHORIZED
PILOT_EXECUTING
DOCUMENT_GENERATED
PENDING_HUMAN_REVIEW
CHANGES_REQUESTED
REJECTED
APPROVED_AND_ARCHIVED
DELIVERY_IN_PROGRESS
DELIVERED
DELIVERY_FAILED
PILOT_COMPLETED
```

Não declarar `PILOT_COMPLETED` sem revisão humana válida e reconciliação integral. Não declarar `DELIVERED` sem confirmação física do canal externo.

## Critérios de aceitação

O piloto só pode ser considerado concluído quando:

1. os dados foram recebidos de fonte externa real e validada;
2. tenant, organização e autorização foram comprovados;
3. a execução utilizou persistência transaccional durável;
4. os bytes físicos de todas as versões foram preservados;
5. leitores independentes validaram os documentos;
6. um revisor humano persistente e autorizado decidiu sobre o hash exacto;
7. a idempotência foi comprovada;
8. o teste de reinício passou;
9. o manifesto reconciliou todas as fontes e relações;
10. a entrega real foi confirmada ou o resultado foi classificado como arquivamento;
11. todos os testes e verificadores terminaram com exit code `0`;
12. a execução ocorreu num workflow protegido ligado ao mesmo SHA;
13. nenhuma fixture, fallback, segredo ou alegação automática de produção entrou no caminho operacional.

## Verificação técnica mínima

Num checkout limpo:

```bash
npm ci
npm audit --omit=dev
npm run verify
git diff --check
git status --short
```

No ambiente protegido:

```text
carregar fontes externas autorizadas
validar autorização e tenant
executar uma tarefa real
validar os documentos com leitores independentes
concluir a revisão humana
entregar ou arquivar
verificar o manifesto integral
executar o teste de reinício
preservar os recibos e artefactos
```

## Entrega esperada

Entregar:

1. diff funcional mínimo;
2. identificação da tarefa real escolhida;
3. identificação técnica do tenant e da organização, sem expor dados pessoais desnecessários;
4. SHA final;
5. ID e URL do workflow protegido;
6. resultado de cada critério de aceitação;
7. hashes dos bytes físicos dos documentos;
8. recibo da revisão humana;
9. recibo da entrega ou classificação `APPROVED_AND_ARCHIVED`;
10. manifesto integral e resultado do seu verificador;
11. exit codes dos comandos;
12. limitações e bloqueios ainda existentes.

## Restrições

- Não activar os 500 AI Employees nesta fase.
- Não acrescentar marketplace, billing, pagamentos ou novos conectores.
- Não integrar AGT, bancos, Primavera ou portais públicos neste piloto inicial.
- Não realizar submissão fiscal ou financeira automática.
- Não usar dados pessoais sem autorização e minimização.
- Não versionar bases de dados, documentos reais, secrets ou evidências sensíveis.
- Não alterar a cadeia forense já encerrada, salvo regressão comprovada que impeça esta fase.
- Não emitir classificação de produção com base numa única execução.

## Classificação permitida

Antes da execução real:

`OPERATIONAL_PILOT_PREPARATION`

Após execução incompleta ou sem entrega externa:

`CONTROLLED_REAL_PILOT_EXECUTED — HUMAN_REVIEW_CONFIRMED — APPROVED_AND_ARCHIVED`

Somente após cumprimento integral, incluindo entrega externa comprovada:

`CONTROLLED_REAL_PILOT_COMPLETED — EXTERNAL_INPUT_VALIDATED — HUMAN_REVIEW_CONFIRMED — PHYSICAL_DOCUMENTS_VERIFIED — DELIVERY_CONFIRMED`

Esta classificação comprova apenas o piloto executado. Não autoriza automaticamente produção geral, activação dos 500 AI Employees ou operações fiscais e financeiras de alto risco.

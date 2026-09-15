# PROMPT MESTRE - CUSTOMER MASTER DATA, CONTRACTS, COMMERCIAL TERMS & DOCUMENT GENERATION ENGINE

## Plataforma MARVINE - 500 AI Employees

### Objectivo geral

Implementar uma camada transversal, centralizada, auditável e reutilizável para que os AI Employees da MARVINE possam recuperar dados oficiais de clientes, interpretar condições comerciais, gerar documentos administrativos e comerciais padronizados e preparar esses documentos para entrega por canais autorizados, sem depender de pesquisas soltas em pastas, PDFs, OneDrive, Google Drive ou ficheiros avulsos.

O desenvolvimento deve resolver simultaneamente quatro problemas:

1. definir uma fonte oficial para os dados dos clientes;
2. separar dados operacionais de conhecimento normativo;
3. centralizar a geração de documentos por modelos aprovados;
4. garantir rastreabilidade, controlo de versões, validação humana quando necessário e prova de execução real.

---

# 1. PRINCÍPIO ARQUITECTURAL OBRIGATÓRIO

Criar dois domínios claramente separados:

## 1.1. Knowledge Base

Destinada a conhecimento regulatório, fiscal, contabilístico, administrativo, jurídico, técnico e procedimental.

Exemplos:

- legislação fiscal;
- normas contabilísticas;
- procedimentos internos;
- políticas aprovadas;
- manuais;
- regulamentos;
- instruções técnicas;
- regras de cálculo;
- modelos de decisão;
- referências regulatórias.

## 1.2. Operational Customer Data

Destinada a dados concretos de clientes, contratos, cobranças e relacionamento comercial.

Exemplos:

- nome ou denominação social;
- NIF;
- morada;
- telefone;
- WhatsApp;
- e-mail;
- contactos;
- avença mensal;
- periodicidade;
- vencimento;
- serviços contratados;
- data de início;
- histórico de alterações;
- contratos;
- estado do cliente;
- saldos;
- documentos emitidos;
- facturas e recibos associados;
- condições comerciais;
- observações autorizadas.

Regra obrigatória:

> Nenhum AI Employee deve tratar documentos encontrados aleatoriamente em pastas como fonte oficial de dados do cliente quando existir um registo estruturado e aprovado no Cadastro Mestre.

---

# 2. CRIAR O CUSTOMER MASTER DATA, CONTRACTS & COMMERCIAL TERMS REGISTRY

Implementar um módulo central denominado:

**Customer Master Data, Contracts & Commercial Terms Registry**

Este módulo será a fonte oficial de dados comerciais e operacionais de clientes para todos os AI Employees.

## 2.1. Campos mínimos do Cadastro Mestre de Clientes

Cada cliente deve possuir um `client_id` único, imutável e global dentro da plataforma.

Campos obrigatórios:

- `client_id`
- `legal_name`
- `trade_name`
- `nif`
- `address`
- `province`
- `municipality`
- `primary_phone`
- `whatsapp_number`
- `email`
- `primary_contact_name`
- `primary_contact_role`
- `client_status`
- `service_start_date`
- `service_end_date`
- `contract_id`
- `contract_status`
- `monthly_retainer_amount`
- `currency`
- `billing_frequency`
- `billing_due_day`
- `payment_terms`
- `services_in_scope`
- `services_out_of_scope`
- `responsible_business_unit`
- `preferred_delivery_channel`
- `tax_profile`
- `accounting_profile`
- `document_language`
- `created_at`
- `updated_at`
- `created_by`
- `updated_by`
- `source_of_truth`
- `record_version`

## 2.2. Histórico obrigatório

O sistema deve manter histórico completo e não destrutivo de alterações, incluindo:

- valor anterior da avença;
- novo valor;
- data da alteração;
- data de entrada em vigor;
- motivo;
- documento de suporte;
- utilizador ou Employee que propôs a alteração;
- utilizador que aprovou;
- hash ou referência da evidência associada.

Nunca sobrescrever silenciosamente valores comerciais relevantes.

---

# 3. HIERARQUIA DE FONTES DOS DADOS DO CLIENTE

Aplicar a seguinte prioridade de origem:

1. **Cadastro Mestre da MARVINE** - fonte oficial operacional;
2. **ERP/Primavera ou outro sistema transaccional integrado** - quando a integração estiver aprovada e sincronizada;
3. **CRM** - contactos, relacionamento e preferências comerciais;
4. **Contrato vigente aprovado** - confirmação de avença, serviços e condições;
5. **Google Drive / OneDrive / repositório documental** - documentos de suporte;
6. **Excel ou ficheiro importado** - apenas para migração ou actualização controlada;
7. **Inserção manual autorizada** - quando não existir outra fonte confiável.

Regra:

> Uma fonte de prioridade inferior pode complementar, mas não substituir automaticamente uma fonte oficial superior sem processo de reconciliação e aprovação.

---

# 4. MOTOR DE RECONCILIAÇÃO E DIVERGÊNCIAS

Criar um `Customer Data Reconciliation Engine`.

Quando houver divergência entre duas fontes, o Employee deve:

1. detectar a divergência;
2. identificar os campos em conflito;
3. mostrar os valores concorrentes;
4. apresentar a origem de cada valor;
5. indicar a data e versão de cada origem;
6. suspender a emissão quando o campo divergente for material;
7. solicitar validação humana ou aplicar uma regra formal previamente aprovada;
8. registar a decisão;
9. actualizar o Cadastro Mestre somente após autorização.

### Exemplo

Cadastro Mestre:

- avença: 85.000,00 AOA

Contrato vigente encontrado:

- avença: 75.000,00 AOA

Resposta obrigatória do Employee:

> Foi encontrada divergência no valor da avença. Cadastro Mestre: 85.000,00 AOA. Contrato vigente: 75.000,00 AOA. A emissão foi suspensa até validação da condição comercial aplicável.

O Employee não deve escolher arbitrariamente um dos valores.

---

# 5. DOCUMENT GENERATION & TEMPLATE ENGINE CENTRAL

Criar um único motor transversal denominado:

**Document Generation & Template Engine**

Este motor será utilizado pelos 500 AI Employees.

Não criar 500 implementações separadas de geração documental.

O motor deve:

- carregar modelos oficiais aprovados;
- receber dados estruturados;
- validar campos obrigatórios;
- aplicar regras de negócio;
- gerar documentos;
- manter versão do modelo;
- produzir recibo de geração;
- permitir pré-visualização;
- exportar para formatos permitidos;
- guardar o documento no dossier digital do cliente;
- preparar o documento para envio por canal autorizado;
- conservar histórico e evidência.

---

# 6. BIBLIOTECA OFICIAL DE MODELOS MARVINE

Criar uma `Official Template Library`.

Cada modelo deve possuir:

- `template_id`
- `template_name`
- `document_type`
- `version`
- `status`
- `effective_from`
- `effective_to`
- `owner`
- `approved_by`
- `approval_date`
- `required_fields`
- `optional_fields`
- `business_rules`
- `output_formats`
- `allowed_channels`
- `checksum`
- `change_log`

Estados permitidos:

- DRAFT
- UNDER_REVIEW
- APPROVED
- ACTIVE
- SUSPENDED
- RETIRED

Apenas modelos `ACTIVE` podem ser utilizados em produção.

---

# 7. MODELOS INICIAIS OBRIGATÓRIOS

## 7.1. DOC-COB-001 - Aviso de Cobrança de Avença

O modelo deve permitir cobrar um ou vários meses consecutivos.

### Dados de entrada

- cliente;
- NIF;
- contacto;
- mês inicial;
- mês final;
- valor mensal da avença;
- data de emissão;
- prazo de pagamento;
- dados bancários da MARVINE.

### Cálculos automáticos

- quantidade de meses;
- período completo;
- valor total;
- data limite de pagamento;
- número do aviso.

### Exemplo

Janeiro a Março

- 3 meses
- avença mensal: 100.000,00 AOA
- total: 300.000,00 AOA

### Regra documental

O documento deve conter de forma clara:

> Este documento constitui exclusivamente um aviso administrativo/comercial de cobrança e não substitui factura, factura-recibo, recibo ou qualquer outro documento fiscal legalmente exigível.

## 7.2. DOC-COM-001 - Comunicação de Actualização da Avença

Dados de entrada:

- cliente;
- valor actual;
- novo valor;
- data da comunicação;
- data de entrada em vigor.

O sistema deve:

- validar antecedência mínima configurada;
- indicar alerta quando a antecedência for inferior ao parâmetro definido;
- apresentar valores com duas casas decimais;
- manter o texto oficial aprovado;
- terminar apenas com `MARVINE`, sem nome individual, cargo ou assinatura, quando configurado para envio digital por WhatsApp.

---

# 8. EXPERIÊNCIA DO UTILIZADOR

O utilizador não deve precisar preencher manualmente dados que já existam no Cadastro Mestre.

### Exemplo 1

Comando:

> Emitir aviso de cobrança para Kiala Comércio, Lda., referente a Janeiro, Fevereiro e Março.

O sistema deve:

1. localizar o cliente pelo Cadastro Mestre;
2. recuperar NIF, contacto, avença e condições;
3. calcular 3 meses;
4. gerar o total;
5. apresentar resumo;
6. gerar o documento;
7. disponibilizar os canais permitidos.

### Exemplo 2

Comando:

> Gerar carta para aumentar a avença da ABC, Lda. de 80.000,00 AOA para 100.000,00 AOA a partir de Novembro.

O sistema deve:

1. confirmar cliente;
2. confirmar valor actual no Cadastro Mestre;
3. comparar com o valor informado;
4. validar data de entrada em vigor;
5. verificar antecedência;
6. gerar a carta;
7. apresentar pré-visualização;
8. preparar envio autorizado.

---

# 9. INTERFACE DE RESULTADO

Após a geração, apresentar acções equivalentes a:

- Pré-visualizar
- Gerar PDF
- Gerar DOCX
- Gerar XLSX, quando aplicável
- Guardar no dossier do cliente
- Enviar por WhatsApp, quando houver integração autorizada
- Enviar por e-mail, quando houver integração autorizada
- Imprimir
- Registar como enviado
- Cancelar emissão

Nunca simular envio quando não existir integração real.

Se o canal não estiver ligado, informar claramente:

> Documento gerado. Envio por WhatsApp indisponível porque não existe integração autorizada activa.

---

# 10. WHATSAPP E OUTROS CANAIS

O sistema deve separar:

- geração do documento;
- aprovação;
- envio;
- confirmação de entrega.

Um documento gerado não pode ser marcado como enviado sem evidência do canal.

Para WhatsApp, quando existir integração autorizada, guardar:

- destinatário;
- data/hora;
- documento enviado;
- identificador da mensagem;
- estado de envio;
- estado de entrega, se disponível;
- utilizador ou Employee emissor;
- consentimento ou base operacional aplicável;
- hash do documento enviado.

---

# 11. CONTROLO DE PERMISSÕES

Implementar permissões separadas para:

- consultar cliente;
- editar cadastro;
- alterar avença;
- aprovar alteração;
- gerar documento;
- aprovar documento;
- enviar por WhatsApp;
- enviar por e-mail;
- imprimir;
- cancelar;
- rectificar;
- consultar histórico.

Um Employee que apenas gera documentos não deve poder alterar silenciosamente a avença cadastrada.

---

# 12. AUDIT TRAIL OBRIGATÓRIO

Cada execução deve gerar um `Document Generation Receipt` com:

- `receipt_id`
- `employee_id`
- `user_id`
- `client_id`
- `template_id`
- `template_version`
- `input_data_hash`
- `source_records`
- `business_rules_applied`
- `validation_results`
- `conflicts_found`
- `approval_required`
- `approval_id`
- `output_file_hash`
- `output_format`
- `generated_at`
- `delivery_channel`
- `delivery_status`
- `delivery_evidence`
- `commit_id` ou `build_id`, quando aplicável

Nenhum `PASS` deve depender apenas de relatório narrativo.

---

# 13. REGRAS DE SEGURANÇA E QUALIDADE

Implementar obrigatoriamente:

1. validação de NIF e formatos configuráveis;
2. validação de moeda;
3. duas casas decimais em valores monetários;
4. cálculo determinístico;
5. prevenção de duplicação de documentos;
6. prevenção de cobrança duplicada do mesmo período;
7. controlo de cliente activo/inactivo;
8. alerta de contrato expirado;
9. alerta de avença divergente;
10. histórico imutável de alterações;
11. segregação de funções;
12. princípio do menor privilégio;
13. protecção de dados pessoais;
14. logs de leitura e escrita relevantes;
15. rollback administrativo quando permitido;
16. idempotência para comandos repetidos;
17. controlo de concorrência;
18. integridade transaccional;
19. hash dos documentos finais;
20. versionamento de modelos.

---

# 14. REGRAS DE COBRANÇA

O módulo de cobrança deve suportar:

- um único mês;
- vários meses consecutivos;
- valores mensais iguais;
- valores mensais diferentes quando existir histórico de alteração de avença;
- cobrança parcial;
- juros ou penalidades apenas quando configurados e juridicamente autorizados;
- desconto autorizado;
- crédito existente;
- abatimentos;
- notas internas;
- exclusão de períodos já liquidados.

Se a avença mudar durante o intervalo, o sistema deve calcular por subperíodos.

### Exemplo

Janeiro e Fevereiro: 80.000,00 AOA/mês

Março: 100.000,00 AOA

Total:

- Janeiro: 80.000,00 AOA
- Fevereiro: 80.000,00 AOA
- Março: 100.000,00 AOA
- Total: 260.000,00 AOA

O sistema não deve multiplicar cegamente o valor actual por todos os meses históricos.

---

# 15. INTEGRAÇÃO COM CONTRATOS

Associar o Cadastro Mestre ao contrato do cliente.

O Employee deve conseguir responder:

- Qual é a avença vigente?
- Desde quando?
- Qual é o próximo reajuste?
- Quais serviços estão incluídos?
- Quais serviços são cobrados à parte?
- Qual é o vencimento?
- Existe cláusula de suspensão?
- Existe obrigação de aviso prévio para alteração de preço?
- Qual é a versão vigente do contrato?

Não inferir estas respostas a partir de memória do modelo.

---

# 16. RELAÇÃO COM ERP, PRIMAVERA E SISTEMAS EXTERNOS

Preparar conectores para:

- Primavera;
- outros ERP;
- CRM;
- Google Drive;
- OneDrive;
- bancos em modo permitido;
- sistemas de facturação;
- e-mail;
- WhatsApp Business ou fornecedor autorizado;
- armazenamento documental.

Cada conector deve possuir:

- estado;
- versão;
- permissões;
- credenciais seguras;
- última sincronização;
- erros;
- campos sincronizados;
- sentido da sincronização;
- política de conflito.

Nunca usar URLs, tokens ou segredos fallback em produção.

---

# 17. FONTE DE VERDADE E PROVENIÊNCIA

Para cada campo usado num documento, deve ser possível responder:

- de onde veio este valor?
- quando foi actualizado?
- por quem?
- qual é a versão?
- existe documento de suporte?
- houve transformação?
- houve validação?

Exemplo:

`monthly_retainer_amount = 85.000,00 AOA`

Proveniência:

- origem: Customer Master Registry;
- versão: 12;
- actualizado em: 2026-09-01;
- suporte: Contract Amendment CA-2026-009;
- aprovado por: user_123;
- estado: ACTIVE.

---

# 18. COMPORTAMENTO QUANDO FALTAM DADOS

O Employee nunca deve inventar campos ausentes.

Se faltar um dado obrigatório, responder:

> Não foi possível gerar o documento porque o campo X não está disponível no Cadastro Mestre nem nas fontes autorizadas. É necessária regularização do cadastro.

Permitir preenchimento manual apenas quando:

- o utilizador tiver permissão;
- o campo aceitar override;
- o override ficar registado;
- o documento indicar a origem do valor;
- a alteração do Cadastro Mestre seja tratada separadamente.

---

# 19. CONTROLO DE DUPLICAÇÃO

Antes de gerar um Aviso de Cobrança, verificar:

- cliente;
- período;
- tipo de documento;
- valor;
- estado de documentos anteriores.

Se já existir documento equivalente, alertar:

> Já existe um Aviso de Cobrança activo para este cliente e período. Pretende visualizar o existente, emitir segunda via ou iniciar substituição controlada?

Não gerar duplicado silenciosamente.

---

# 20. STATUS DOS DOCUMENTOS

Estados mínimos:

- DRAFT
- VALIDATING
- WAITING_APPROVAL
- APPROVED
- GENERATED
- SENT
- DELIVERED
- PAID
- CANCELLED
- SUPERSEDED
- ERROR

Para Aviso de Cobrança, permitir ainda:

- OPEN
- PARTIALLY_PAID
- OVERDUE
- SETTLED

---

# 21. LIGAÇÃO AO CICLO FACTURA / FACTURA-RECIBO

O Aviso de Cobrança é administrativo/comercial e não deve ser confundido com documento fiscal.

O motor deve permitir associar posteriormente:

- Aviso de Cobrança;
- pagamento;
- Factura;
- Recibo;
- Factura-Recibo;
- nota de crédito ou documento fiscal aplicável.

A associação deve ser feita por IDs e não apenas por nome de ficheiro.

Exemplo:

`collection_notice_id -> payment_id -> fiscal_document_id`

---

# 22. TESTES OBRIGATÓRIOS

Criar testes automatizados para, no mínimo:

1. cliente existente;
2. cliente inexistente;
3. NIF ausente;
4. avença ausente;
5. cobrança de 1 mês;
6. cobrança de 3 meses;
7. cobrança entre anos diferentes;
8. mês final anterior ao inicial;
9. alteração de avença dentro do período;
10. período parcialmente pago;
11. período totalmente pago;
12. duplicação de aviso;
13. contrato expirado;
14. cliente inactivo;
15. divergência cadastro vs contrato;
16. divergência cadastro vs ERP;
17. geração de PDF;
18. geração de DOCX;
19. geração de XLSX quando aplicável;
20. hash do documento;
21. controlo de versão do modelo;
22. tentativa de edição sem permissão;
23. tentativa de envio sem integração;
24. tentativa de envio sem autorização;
25. idempotência do mesmo comando;
26. auditoria completa;
27. arredondamento monetário;
28. duas casas decimais;
29. dados bancários ausentes;
30. falha de conector externo.

---

# 23. CRITÉRIOS DE ACEITAÇÃO

O módulo só pode receber `PASS` quando existir evidência real de que:

- o Cadastro Mestre funciona;
- os dados do cliente são recuperados por `client_id`;
- a proveniência de cada campo é rastreável;
- divergências suspendem emissões materiais;
- o motor de templates usa apenas versões activas;
- os dois modelos iniciais são gerados correctamente;
- a cobrança multi-mês funciona;
- alterações de avença por período são respeitadas;
- valores monetários possuem duas casas decimais;
- nenhum dado obrigatório é inventado;
- duplicações são detectadas;
- recibos de execução são gerados;
- hashes são calculados sobre os ficheiros físicos finais;
- permissões são aplicadas;
- canais não integrados não são simulados;
- testes automatizados passam;
- CI executa e comprova o resultado;
- os recibos correspondem ao mesmo commit/build certificado.

---

# 24. ENTREGÁVEIS TÉCNICOS

Produzir:

1. arquitectura do módulo;
2. modelo de dados;
3. migrations;
4. schemas de validação;
5. APIs;
6. serviços de domínio;
7. regras de reconciliação;
8. motor de templates;
9. biblioteca de modelos;
10. implementação de DOC-COB-001;
11. implementação de DOC-COM-001;
12. permissões;
13. audit trail;
14. recibos de execução;
15. testes unitários;
16. testes de integração;
17. testes end-to-end;
18. fixtures controladas;
19. documentação de operação;
20. documentação de administração;
21. matriz Requirement -> Test -> Evidence;
22. relatório final de execução;
23. hashes dos artefactos;
24. prova de CI do mesmo commit.

---

# 25. RESTRIÇÕES DE IMPLEMENTAÇÃO

Não aceitar como conclusão:

- apenas documentação;
- apenas mocks;
- apenas JSON estático sem persistência adequada;
- apenas screenshots;
- apenas relatório dizendo `PASS`;
- dados fictícios apresentados como reais;
- envio WhatsApp simulado como envio real;
- reconciliação baseada em escolha arbitrária;
- leitura aleatória de pastas como fonte principal;
- templates sem versionamento;
- outputs sem hash;
- evidência de outro commit;
- testes que alteram a própria evidência para passar.

---

# 26. RESULTADO OPERACIONAL ESPERADO

Após a implementação, qualquer AI Employee autorizado deve conseguir executar comandos como:

> Emitir aviso de cobrança para Kiala Comércio, Lda., referente a Janeiro, Fevereiro e Março.

Resultado esperado:

- cliente identificado;
- dados oficiais recuperados;
- contrato e avença validados;
- 3 meses calculados;
- total calculado;
- aviso gerado pelo modelo oficial;
- PDF pronto;
- recibo de geração criado;
- documento guardado no dossier do cliente;
- canais autorizados apresentados.

Outro comando:

> Gerar comunicação de actualização da avença da ABC, Lda. para 100.000,00 AOA a partir de Novembro.

Resultado esperado:

- valor actual confirmado;
- novo valor comparado;
- antecedência validada;
- divergências verificadas;
- carta oficial gerada;
- documento termina com MARVINE;
- PDF pronto para WhatsApp;
- histórico e recibo registados.

---

# 27. PRINCÍPIO FINAL

A solução deve garantir que os 500 AI Employees partilham a mesma verdade operacional sobre clientes e utilizam o mesmo motor documental central.

A regra arquitectural final é:

> **Uma fonte oficial de dados do cliente + um motor central de documentos + modelos versionados + permissões + reconciliação + proveniência + recibos de execução + evidência do mesmo commit.**

Não criar lógica documental isolada por Employee quando a capacidade puder ser fornecida transversalmente pela plataforma.


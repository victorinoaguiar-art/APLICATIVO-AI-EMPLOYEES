# ESPECIFICAÇÃO DO WORKSPACE CHAT-FIRST (CHATBOX_WORKSPACE_SPEC)
## AETF-500 — Hub Central de Conversação e Disparo Operacional

### 1. Objectivo
Estabelecer o Chatbox Central como a interface primária para atribuição de tarefas e interacção com os 500 AI Employees canónicos da plataforma.

---

### 2. Componentes da Interface
- **Selecção de AI Employee**: Dropdown de selecção rápida entre os AI Employees disponíveis no catálogo e contratados pela empresa.
- **Área de Conversação**: Histórico cronológico de mensagens e respostas geradas pelos AI Employees.
- **Barra de Entrada de Mensagens**: Input com suporte a texto, anexo de ficheiros e selecção de acções rápidas.
- **Atalhos Operacionais**: Botões de sugestão para tarefas frequentes (Ex: *"Preparar Balancete"*, *"Validar IVA"*, *"Auditar Documento"*).

---

### 3. Integração com o Task Engine
Ao submeter um pedido pelo chat:
1. O sistema classifica a intenção do utilizador.
2. É criada uma entidade `Task` associada ao AI Employee seleccionado.
3. O runtime executa os SOPs necessários e devolve a resposta estruturada com registo no ledger auditável.

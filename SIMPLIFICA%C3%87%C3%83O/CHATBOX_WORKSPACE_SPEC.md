# CHATBOX_WORKSPACE_SPEC — Especificação Técnica do Workspace de Conversas (`WORK-01`)

**Documento:** Arquitectura do Hub Operacional Chat-First  
**Projeto:** AETF-500  
**Data:** 14 de Setembro de 2026  

---

## 1. CONCEITO CENTRAL

O ecrã `WORK-01 Conversas` é o centro operacional primário da plataforma. Substitui a navegação fragmentada por uma interface unificada onde o utilizador conversa com o AI Employee, submete anexos, acompanha a execução de trabalhos e aprova decisões com feedback em tempo real.

---

## 2. COMPONENTES DO CHATBOX WORKSPACE

```text
┌────────────────────────────────────────────────────────────────────────┐
│ TOPBAR DO EMPLOYEE: Nome, Perfil, Empresa Activa, Indicativo REAL_API  │
├───────────────┬────────────────────────────────┬───────────────────────┤
│ THREADS       │ FEED DE CONVERSA PRINCIPAL     │ PAINEL CONTEXTUAL     │
│ - Conversas   │ - Mensagens de Utilizador      │ - Resumo da Tarefa    │
│ - Employees   │ - Mensagens do Employee        │ - Ficheiros Anexos    │
│ - Favoritos   │ - Cartões de Eventos / Conector│ - Fontes de Conhecim. │
│               │ - Cards de Aprovação (HITL)    │ - Pré-visualização    │
│               │ - Cards de Resultado / Out.   │ - Validação SHA-256   │
├───────────────┴────────────────────────────────┴───────────────────────┤
│ BARRA DE COMPOSIÇÃO: Input, Anexo, Fonte, Formato Output, Botão Enviar │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. REGRA DE CRIAÇÃO AUTOMÁTICA DE TAREFAS (`task_id`)

```text
Mensagem de Linguagem Natural no Composer
                  │
                  ▼
       [ Intent Detection Engine ]
      /                           \
Diálogo Informativo            Instrução Operacional Executável
(Manter em conversation_id)               │
                                          ▼
                               Criação Automática de task_id
                               (Vínculo a Tenant, Instance & Conversation)
                                          │
                                          ▼
                               Execução via Internal Engines
```

---

## 4. CARDS INLINE DE APROVAÇÃO HUMANA (HITL)

Quando a execução de uma tarefa requer autorização (ex: submissão fiscal à AGT, transferência bancária ou envio de email externo), o Chatbox insere um cartão inline de aprovação:

- **Metadados Exibidos:** Acção solicitada, Nível de Risco (R1 a R4), Destinatário, Impacto e Snapshot da tarefa.
- **Botões Contextuais:** `[ Aprovar Envio ]`, `[ Rejeitar ]`, `[ Modificar ]`.
- **Registo Auditável:** A decisão do utilizador é gravada atomicamente na tabela `approvals` e assinada com hash de evidência.

# LIMPEZA DE LINGUAGEM E COPY DA INTERFACE (UI_COPY_CLEANUP)
## AETF-500 — Purificação de Termos Técnicos na Experiência de Utilizador

### 1. Resumo Executivo
Este relatório detalha a substituição sistemática da linguagem técnica/interna da plataforma por termos em Português natural e humanizado em todas as áreas visíveis da aplicação.

---

### 2. Tabela de Conversão de Linguagem (UX Copy Map)

| Termo Técnico / Legado (Eliminado da UI Normal) | Termo Humano Adoptado | Contexto de Aplicação | Visível em Modo Avançado? |
| :--- | :--- | :--- | :--- |
| `Formulário de Execução` | *Removido / Substituído por modal específico* | Modais de Acção | Não (Modal removido) |
| `Título / Identificador da Acção` | *Nome específico do item/empresa* | Modais e Formulários | Sim (como Action ID) |
| `Empresa / Tenant Alvo` | **Empresa** / **Organização** | Seletores e Formulários | Sim (como Tenant UUID) |
| `Prioridade de Execução` | **Prioridade** (Alta / Média / Baixa) | Fila de Trabalho Operacional | Sim (com SLA técnico) |
| `Instruções Adicionais & SOP` | **Instruções** / **Observações** | Iniciação de Tarefa | Sim (com Código SOP) |
| `Auditável em ledger imutável` | *Omitido em UI comum* | Modais e Confirmações | Sim (com Hash de Assinatura) |
| `Executar Retomar` | **Retomar AI Employee** | Botão de Confirmação | Sim |
| `Executar Pausar` | **Pausar AI Employee** | Botão de Confirmação | Sim |
| `WF-01`, `WF-02`, `WF-06` | **Módulos do Sistema** (Visão Geral, etc.) | Cabeçalhos e Navigation | Sim |

---

### 3. Impacto na Experiência do Utilizador
- **Redução da Carga Cognitiva**: Os utilizadores não-técnicos compreendem imediatamente o impacto de cada acção.
- **Maior Profissionalismo**: A plataforma transmite a sensação de um produto SaaS moderno e acabado.

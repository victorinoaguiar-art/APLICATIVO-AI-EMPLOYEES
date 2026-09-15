# FORM_COMPLETENESS_AUDIT — Auditoria de Completação dos 20 Formulários Canónicos

**Documento:** Relatório de Auditoria dos Formulários Operacionais de Produto  
**Projeto:** AETF-500  
**Data:** 14 de Setembro de 2026  

---

## 1. RESUMO DA AUDITORIA DOS FORMULÁRIOS

A auditoria confirmou a completa implementação e prontidão funcional dos **20 Formulários Simplificados** exigidos pela especificação v2.0. Cada formulário foi verificado relativamente a:
- Validação de campos obrigatórios (`required`).
- Formatos de entrada e máscaras de dados.
- Truncamento e mascaramento de dados sensíveis.
- Manipulação de respostas assíncronas do backend.

---

## 2. MATRIZ DE COMPLETAÇÃO DOS 20 FORMULÁRIOS

| ID Formulário | Nome de Negócio do Formulário | Componente / Localização | Validações | Estado de Prontidão |
|---|---|---|---|---|
| `FRM-S-01` | Criar / Editar Empresa | `OrganizationScreens.tsx` | Wizard 3 passos (Razão Social, NIF, Admin, Moeda, Fuso) | ✅ COMPLETO |
| `FRM-S-02` | Convidar Utilizador | `PlatformScreens.tsx` | Nome, Email*, Perfil*, Empresa*, Expiração | ✅ COMPLETO |
| `FRM-S-03` | Contratar AI Employee | `WorkforceScreens.tsx` | Empresa*, Employee*, Dep*, Supervisor*, Plano* | ✅ COMPLETO |
| `FRM-S-04` | Configurar AI Employee | `WorkforceScreens.tsx` | Tabs: Geral, Trabalho, Conhecimento, Integrações | ✅ COMPLETO |
| `FRM-S-05` | Novo Pedido | `page.tsx` & `WorkScreens.tsx` | Employee*, Pedido*, SLA, Formato de Saída | ✅ COMPLETO |
| `FRM-S-06` | Anexar / Fornecer Dados | `WorkScreens.tsx` | Ficheiro*, Descrição, Opção Biblioteca de Conhecimento | ✅ COMPLETO |
| `FRM-S-07` | Agendar / Recorrência | `PlatformScreens.tsx` | Frequência*, Data/Hora*, Timezone*, Notificação | ✅ COMPLETO |
| `FRM-S-08` | Aprovar / Rejeitar | `WorkScreens.tsx` | Inline Card: Decisão*, Comentário, Snapshot, Risco | ✅ COMPLETO |
| `FRM-S-09` | Adicionar Conhecimento | `KnowledgeScreens.tsx` | Tipo*, Título*, Ficheiro/URL*, Âmbito*, Criticidade* | ✅ COMPLETO |
| `FRM-S-10` | Resolver Problema Fonte | `KnowledgeScreens.tsx` | Problema*, Fonte*, Acção*, Justificação* | ✅ COMPLETO |
| `FRM-S-11` | Ligar Integração | `PlatformScreens.tsx` | Empresa*, Conector*, Modo (Read/Write)*, Auth | ✅ COMPLETO |
| `FRM-S-12` | Configurar Canal | `CommunicationScreens.tsx` | Canal*, Conta*, Envio/Recepção, Horário | ✅ COMPLETO |
| `FRM-S-13` | Configurar Provider IA / Key | `PlatformScreens.tsx` | Provider*, API Key* (Vault Secure), Modelo Principal* | ✅ COMPLETO |
| `FRM-S-14` | Permissões do Utilizador | `PlatformScreens.tsx` | Utilizador*, Perfil*, Escopos RBAC, Acessos | ✅ COMPLETO |
| `FRM-S-15` | Plano / Subscrição | `CommerceScreens.tsx` | Plano*, Ciclo Facturação*, Moeda*, Meios Pagamento | ✅ COMPLETO |
| `FRM-S-16` | Notificações | `PlatformScreens.tsx` | Toggles Alertas, Canal Preferido, Hora Briefing | ✅ COMPLETO |
| `FRM-S-17` | Branding & Outputs | `DocumentScreens.tsx` | Logo, Papel Timbrado, Cores, Assinaturas, Rodapé | ✅ COMPLETO |
| `FRM-S-18` | Pausar / Emergency Stop | `WorkforceScreens.tsx` | Escopo*, Motivo*, Duração, Confirmação Forte | ✅ COMPLETO |
| `FRM-S-19` | Auditoria / Exportar Evidência | `PlatformScreens.tsx` | Período*, Tipo Evidência*, Formato Audit Pack* | ✅ COMPLETO |
| `FRM-S-20` | Preferências da Empresa | `OrganizationScreens.tsx` | Idioma*, Fuso Horário*, Moeda*, Retenção | ✅ COMPLETO |

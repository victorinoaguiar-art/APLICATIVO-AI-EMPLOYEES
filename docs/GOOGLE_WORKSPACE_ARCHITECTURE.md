# Arquitetura do Google Workspace Native Integration Suite (GWNIS)

## Visão Geral
O **GWNIS** é o módulo nativo de integração da Plataforma AI Employees para interação auditada, segura e multi-tenant com **Google Drive**, **Google Docs** e **Google Sheets**.

## Componentes Principais
1. **Drive Adapter:** Gestão de ficheiros, pastas, Shared Drives e pesquisas em linguagem natural.
2. **Docs Adapter:** Modelação e edição estruturada de documentos nativos, com suporte a modelos institucionais e exportação PDF/DOCX.
3. **Sheets Adapter:** Leitura e edição controlada por intervalos de células (`AuthorizedSheetRange`), integração com registo de schemas e exportação XLSX/CSV.
4. **Resolução de Recursos:** O `GoogleWorkspaceResourceResolver` mapeia pedidos em linguagem natural para IDs autorizados.
5. **Governação & DLP:** Verificação rigorosa de isolamento por tenant, sanitização contra Prompt Injection (`source_trust = EXTERNAL_UNTRUSTED`) e registo completo de auditoria.

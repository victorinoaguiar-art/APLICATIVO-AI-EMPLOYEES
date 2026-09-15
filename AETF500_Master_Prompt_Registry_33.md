# AETF-500 — Master Prompt Registry
## Registo Mestre dos 33 Prompts da AI Employee Platform

**Versão do Registry:** 1.0  
**Data:** 14 de Setembro de 2026  
**Âmbito:** AI Employee Platform / AETF-500 / Digital Workforce Operating System  
**Total de prompts registados:** 33

> Este registry organiza os prompts e artefactos recuperados do projecto. Quando a versão de um prompt não foi localizada no artefacto recuperado, o campo é marcado como **Não identificada** em vez de ser inferido. Estados de implementação reportados em relatórios são identificados como tal e não são convertidos automaticamente em prova técnica independente.

## 1. Objectivo do Master Prompt Registry

Criar uma fonte única de verdade para saber qual prompt governa cada camada da plataforma, quais dependências deve reutilizar, que prompts foram substituídos, quais permanecem activos e em que ordem a arquitectura deve ser implementada ou validada.

## 2. Taxonomia de estado

| Estado | Significado |
|---|---|
| CANÓNICO | Prompt actual que deve orientar a arquitectura da respectiva camada. |
| IMPLEMENTAÇÃO REPORTADA | Há relatório a afirmar implementação; este registry não substitui auditoria de código/evidência. |
| LEGACY_SUPERSEDED | Prompt histórico que não deve voltar a comandar a implementação actual. |
| PARTIALLY_SUPERSEDED_REUSE | Parte estratégica foi substituída, mas existem mecanismos reutilizáveis. |
| CANÓNICO COM ALERTA DE SOBREPOSIÇÃO | Prompt actual, mas com escopo que colide com outro módulo e deve ser racionalizado. |

## 3. Ordem arquitectural recomendada

| Fase | Camada | Sequência | Resultado esperado |
|---|---|---|---|
| F0 | Governação arquitectural | MPR-001 → MPR-002 | Definir o documento mestre e a regra 500/500. Preservar MPR-003/MPR-004 apenas como histórico/reuso. |
| F1 | Definição operacional e conhecimento-base | MPR-012 → MPR-005 → MPR-006 → MPR-007 | Definir funções e SOPs; construir baseline de conhecimento; activar actualização contínua e governação. |
| F2 | Capacidade, conhecimento e elegibilidade | MPR-014 → MPR-015 → MPR-016 → MPR-013 → MPR-017 | Medir capacidade nativa; estruturar realidade operacional; ingerir fontes; certificar proveniência; minimizar contexto em runtime. |
| F3 | Runtime, tarefas, comandos e outputs | MPR-009 → MPR-011 → MPR-032 → MPR-010 → MPR-008 → MPR-024 → MPR-025 | Receber trabalho, executar em modelo real, distinguir mock/real, gerir tarefas, remote queue e materializar outputs. |
| F4 | Formação, fiabilidade, qualidade e certificação | MPR-018 → MPR-019 → MPR-020 → MPR-021 → MPR-022 | Preparar, medir, rever, certificar e testar operacionalmente. |
| F5 | Comercialização, onboarding e piloto real | MPR-026 → MPR-027 → MPR-028 → MPR-029 → MPR-030 → MPR-023 | Monetizar, endurecer billing/payments, provisionar empresa/tenant e executar piloto empresarial controlado. |
| F6 | Expansão e operação omnicanal | MPR-031 → MPR-033 | Descobrir novas oportunidades e operar a workforce por múltiplos canais. |

## 4. Índice mestre dos 33 prompts

| Ordem | PROMPT_ID | Título curto | Versão | Estado |
|---:|---|---|---|---|
| 1 | MPR-001 | AI Employee Platform — Documento-Prompt Mestre Único 500/500 / Digital Work... | Não identificada no artefacto recuperado | CANÓNICO |
| 2 | MPR-002 | 500/500 Priority Employee Program | v2.0 | CANÓNICO ACTUAL |
| 3 | MPR-003 | Programa 500/300/200 — Employee Readiness & Validation Program | v1.0 | LEGACY_SUPERSEDED |
| 4 | MPR-004 | AI Employee Implementation & Operationalization Program | v1.0 | PARTIALLY_SUPERSEDED_REUSE |
| 5 | MPR-005 | Actualização Integral dos Conhecimentos dos 500 AI Employees | Baseline 2026.09.11 | CANÓNICO COMO BASELINE |
| 6 | MPR-006 | AI Employee Continuous Knowledge, Regulation & API Intelligence Engine | Não identificada | CANÓNICO |
| 7 | MPR-007 | CPEAA & CKRAIE-2026 — Governação, Políticas do Cliente & Aprovações Regulam... | Release/base indicada KR-2026.09.11; versão do prompt não identificada | IMPLEMENTAÇÃO REPORTADA em relatório |
| 8 | MPR-008 | RCODE-500 — Remote Command, Offline Queue & Deferred Execution Engine | Não identificada | IMPLEMENTAÇÃO REPORTADA em relatório; manter evidência de execução real separada |
| 9 | MPR-009 | Unified Task, Command & Event Gateway — UTCEG | v1.0 | CANÓNICO |
| 10 | MPR-010 | Central de Trabalho & Execução de Tarefas dos AI Employees | Não identificada | CANÓNICO |
| 11 | MPR-011 | AI Employee Runtime, Model Binding & Real Task Execution Engine | Não identificada | CANÓNICO CRÍTICO |
| 12 | MPR-012 | 500 AI Employees Operational Role Packs, Task Catalog & SOP Engine | Não identificada | CANÓNICO CRÍTICO |
| 13 | MPR-013 | Competency Passport + Knowledge Provenance + Physical Source Explorer + Tas... | Não identificada | CANÓNICO CRÍTICO |
| 14 | MPR-014 | Model Native Capability Audit, Knowledge Gap Detection & Reinforcement Engi... | Não identificada | CANÓNICO |
| 15 | MPR-015 | Operational Reality & Domain Knowledge System — ORDKS | v1.0 | CANÓNICO |
| 16 | MPR-016 | Knowledge Center Frontend, Knowledge Intake, Validation, Provenance, Mappin... | Não identificada | CANÓNICO |
| 17 | MPR-017 | Knowledge Necessity, Native-vs-Source Decision & Runtime Knowledge Minimiza... | Não identificada | CANÓNICO |
| 18 | MPR-018 | AI Employee Training, Competency & Commercial Readiness System — ATCCRS | v1.0 | CANÓNICO |
| 19 | MPR-019 | Employee Reliability & Error Measurement System — EREMS | v1.0 | CANÓNICO |
| 20 | MPR-020 | Client Acceptance, Quality & Revision System — CAQRS | v1.0 | CANÓNICO |
| 21 | MPR-021 | 500 AI Employee Master Validation, Testing & Certification System — EMVTCS | v1.0 | CANÓNICO CRÍTICO |
| 22 | MPR-022 | Operational Testing, Connection, Task Execution & Employee Certification — ... | v1.0 | CANÓNICO PARA PILOTO TÉCNICO |
| 23 | MPR-023 | AI Employee Enterprise Pilot Testing & Omnichannel Work Delivery System — E... | v1.0 | CANÓNICO PARA PILOTO EMPRESARIAL |
| 24 | MPR-024 | Document Generation & Rendering Service | Não identificada | CANÓNICO |
| 25 | MPR-025 | Corporate Letterhead, Brand Governance & Stationery System — CLBGS | v1.0 | CANÓNICO |
| 26 | MPR-026 | AI Employee Hiring, Salary, Subscription & Revenue Engine — AESSRE | v1.0 | CANÓNICO COMERCIAL |
| 27 | MPR-027 | AI Employee Marketplace, Hiring, Subscription, Deployment & Revenue Operations | Não identificada | IMPLEMENTAÇÃO REPORTADA em relatório comercial; prova técnica deve ser verificada separadamente |
| 28 | MPR-028 | AI Employee Commerce Production Hardening, Billing, Payments & Paid Custome... | Commercial Baseline v2.0; versão do prompt não confirmada | IMPLEMENTAÇÃO REPORTADA em relatório v2 |
| 29 | MPR-029 | AI Employee Provisioning, Client Access & Tenant Onboarding System — APCATOS | v1.0 | CANÓNICO |
| 30 | MPR-030 | Company Provisioning, Employee Association & Activation | v1.0 | CANÓNICO COM ALERTA DE SOBREPOSIÇÃO |
| 31 | MPR-031 | AI Workforce Discovery, Deployment, Supervision & Expansion Engine — AWDSE | v1.0 | CANÓNICO ESTRATÉGICO / EXPANSÃO |
| 32 | MPR-032 | Execution Mode Control, MOCK / REAL API Visibility & Runtime Evidence Gate | Não identificada | CANÓNICO CRÍTICO |
| 33 | MPR-033 | AI Omnichannel Communications, Social Media Operations, WhatsApp Command, E... | Não identificada | CANÓNICO DE CANAIS |

## 5. Registo detalhado

### 1. MPR-001 — AI Employee Platform — Documento-Prompt Mestre Único 500/500 / Digital Workforce Operating System

- **Versão:** Não identificada no artefacto recuperado
- **Módulo:** Arquitectura mestre / Digital Workforce Operating System
- **Dependências:** Nenhuma. Documento guarda-chuva.
- **Substitui / substituído por:** Consolida e governa os módulos especializados; não é substituído por nenhum prompt da lista.
- **Estado de implementação / governação:** CANÓNICO. Documento mestre recuperado; implementação integral não revalidada neste registry.
- **Ficheiro correspondente:** `AI_Employee_Documento_Prompt_Mestre_Unico_500.pdf`
- **Ordem arquitectural:** F0.01 — Fundação arquitectural

### 2. MPR-002 — 500/500 Priority Employee Program

- **Versão:** v2.0
- **Módulo:** Programa de prioridade, readiness e validação dos 500 Employees
- **Dependências:** MPR-001
- **Substitui / substituído por:** SUBSTITUI MPR-003 e a lógica de priorização 300/200 do MPR-004.
- **Estado de implementação / governação:** CANÓNICO ACTUAL. Todos os 500 são prioritários; 0 non-priority.
- **Ficheiro correspondente:** `AI_Employee_Prompt_500_500_Priority_Program_v2.md`
- **Ordem arquitectural:** F0.02 — Governação do programa

### 3. MPR-003 — Programa 500/300/200 — Employee Readiness & Validation Program

- **Versão:** v1.0
- **Módulo:** Preparação dos 500 com 300 P1 e 200 P2
- **Dependências:** MPR-001
- **Substitui / substituído por:** SUBSTITUÍDO pelo MPR-002.
- **Estado de implementação / governação:** LEGACY_SUPERSEDED. Manter apenas para histórico e rastreabilidade.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Programa_500_300_200.md`
- **Ordem arquitectural:** HIST-01 — Não executar

### 4. MPR-004 — AI Employee Implementation & Operationalization Program

- **Versão:** v1.0
- **Módulo:** Implementação e operacionalização
- **Dependências:** MPR-001, MPR-003
- **Substitui / substituído por:** A lógica 300/200 foi substituída pelo MPR-002. Mecânicas de state machine, readiness, pilot, melhoria e activação podem ser reutilizadas.
- **Estado de implementação / governação:** PARTIALLY_SUPERSEDED_REUSE. Não executar com a classificação P1/P2 antiga.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Implementation_Operationalization_500_300_200.md`
- **Ordem arquitectural:** HIST-02 / REUSE — Reutilização controlada

### 5. MPR-005 — Actualização Integral dos Conhecimentos dos 500 AI Employees

- **Versão:** Baseline 2026.09.11
- **Módulo:** Baseline de conhecimento / inventário / actualização
- **Dependências:** MPR-001, MPR-002, MPR-012
- **Substitui / substituído por:** Serve de baseline inicial; a manutenção contínua é assumida pelo MPR-006.
- **Estado de implementação / governação:** CANÓNICO COMO BASELINE. A actualidade futura depende do motor contínuo.
- **Ficheiro correspondente:** `Prompt_1_Actualizacao_500_AI_Employees_2026-09-11.md`
- **Ordem arquitectural:** F1.01 — Baseline de conhecimento

### 6. MPR-006 — AI Employee Continuous Knowledge, Regulation & API Intelligence Engine

- **Versão:** Não identificada
- **Módulo:** Source Registry, Knowledge Registry, Regulatory Watch, API Watch, Change Impact
- **Dependências:** MPR-005, MPR-012
- **Substitui / substituído por:** Complementa MPR-005; não o substitui historicamente.
- **Estado de implementação / governação:** CANÓNICO. Especificação de actualização contínua.
- **Ficheiro correspondente:** `Prompt_2_Continuous_Knowledge_Regulatory_API_Engine.md`
- **Ordem arquitectural:** F1.02 — Actualização contínua

### 7. MPR-007 — CPEAA & CKRAIE-2026 — Governação, Políticas do Cliente & Aprovações Regulamentares

- **Versão:** Release/base indicada KR-2026.09.11; versão do prompt não identificada
- **Módulo:** Políticas do cliente, precedência legal, regulatory approvals e HITL
- **Dependências:** MPR-006, MPR-013, MPR-016
- **Substitui / substituído por:** Não substitui Knowledge Center nem ORDKS; governa política cliente e mudanças regulatórias.
- **Estado de implementação / governação:** IMPLEMENTAÇÃO REPORTADA em relatório. Requer confirmação técnica independente se usado como prova.
- **Ficheiro correspondente:** `Prompts_CPEAA_CKRAIE_2026.md`
- **Ordem arquitectural:** F1.03 — Governação de fontes e políticas

### 8. MPR-008 — RCODE-500 — Remote Command, Offline Queue & Deferred Execution Engine

- **Versão:** Não identificada
- **Módulo:** Comando remoto, fila offline, execução diferida e dispositivos
- **Dependências:** MPR-009, MPR-011, MPR-032
- **Substitui / substituído por:** Não substitui UTCEG. É a camada especializada de remote/deferred execution.
- **Estado de implementação / governação:** IMPLEMENTAÇÃO REPORTADA em relatório; manter evidência de execução real separada.
- **Ficheiro correspondente:** `Prompt_Remote_Command_Offline_Queue_Deferred_Execution_Engine.md`
- **Ordem arquitectural:** F3.04 — Execução remota e diferida

### 9. MPR-009 — Unified Task, Command & Event Gateway — UTCEG

- **Versão:** v1.0
- **Módulo:** Gateway unificado de comandos, eventos e inputs multimodais
- **Dependências:** MPR-012, MPR-030, MPR-011
- **Substitui / substituído por:** Camada canónica de entrada. RCODE e Omnichannel devem integrar aqui, não criar gateways paralelos.
- **Estado de implementação / governação:** CANÓNICO. Especificação transversal.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Unified_Task_Command_Event_Gateway_500.md`
- **Ordem arquitectural:** F3.01 — Entrada unificada

### 10. MPR-010 — Central de Trabalho & Execução de Tarefas dos AI Employees

- **Versão:** Não identificada
- **Módulo:** Work Center / tarefas / anexos / aprovações / resultados
- **Dependências:** MPR-030, MPR-011, MPR-012, MPR-013, MPR-032
- **Substitui / substituído por:** Não substitui Task Engine; fornece a experiência operacional humana e consolidada.
- **Estado de implementação / governação:** CANÓNICO. Especificação funcional disponível.
- **Ficheiro correspondente:** `Prompt_Central_Trabalho_Tarefas_AI_Employees_Completo.md`
- **Ordem arquitectural:** F3.03 — Interface operacional de trabalho

### 11. MPR-011 — AI Employee Runtime, Model Binding & Real Task Execution Engine

- **Versão:** Não identificada
- **Módulo:** Runtime real, model binding, provider adapters, tools, memory e execução
- **Dependências:** MPR-002, MPR-012, MPR-013, MPR-014, MPR-015, MPR-017, MPR-030, MPR-032
- **Substitui / substituído por:** Não substitui Role Packs ou knowledge; orquestra-os em runtime.
- **Estado de implementação / governação:** CANÓNICO CRÍTICO. Especifica execução com APIs reais e recibo de auditoria.
- **Ficheiro correspondente:** `Prompt_Dar_Vida_Aos_AI_Employees_Runtime_Model_Binding_Real_Execution.md`
- **Ordem arquitectural:** F3.02 — Runtime operacional

### 12. MPR-012 — 500 AI Employees Operational Role Packs, Task Catalog & SOP Engine

- **Versão:** Não identificada
- **Módulo:** Role Packs, tarefas, SOPs, inputs, outputs, limites e escalação
- **Dependências:** MPR-001, MPR-002
- **Substitui / substituído por:** Substitui o uso de prompts genéricos isolados por schemas operacionais partilhados.
- **Estado de implementação / governação:** CANÓNICO CRÍTICO. Define o trabalho dos 500 Employees.
- **Ficheiro correspondente:** `Prompt_500_AI_Employees_Operational_Role_Packs_Task_Catalog_SOP_Engine.md`
- **Ordem arquitectural:** F1.00 — Definição operacional dos Employees

### 13. MPR-013 — Competency Passport + Knowledge Provenance + Physical Source Explorer + Task Eligibility Gate

- **Versão:** Não identificada
- **Módulo:** Passaporte de competência, proveniência, fontes físicas e elegibilidade
- **Dependências:** MPR-012, MPR-014, MPR-015, MPR-016
- **Substitui / substituído por:** Não substitui MNCA nem Knowledge Center; agrega evidência e decisão de elegibilidade.
- **Estado de implementação / governação:** CANÓNICO CRÍTICO. Gate de execução baseado em competência e evidência.
- **Ficheiro correspondente:** `Prompt_Competency_Passport_Knowledge_Provenance_Physical_Source_Task_Eligibility.md`
- **Ordem arquitectural:** F2.04 — Eligibility e proveniência

### 14. MPR-014 — Model Native Capability Audit, Knowledge Gap Detection & Reinforcement Engine — MNCA-500

- **Versão:** Não identificada
- **Módulo:** Avaliação da capacidade nativa do modelo e detecção de lacunas
- **Dependências:** MPR-012, MPR-011, MPR-032
- **Substitui / substituído por:** Complementa Knowledge Center e Passport; não substitui fontes críticas.
- **Estado de implementação / governação:** CANÓNICO. Resultados só devem ser tratados como prova se executados contra modelo/configuração real.
- **Ficheiro correspondente:** `Prompt_Model_Native_Capability_Knowledge_Gap_Reinforcement.md`
- **Ordem arquitectural:** F2.01 — Auditoria de capacidade nativa

### 15. MPR-015 — Operational Reality & Domain Knowledge System — ORDKS

- **Versão:** v1.0
- **Módulo:** Conhecimento profissional, processos reais, excepções, casos e contexto
- **Dependências:** MPR-005, MPR-006, MPR-012
- **Substitui / substituído por:** Não substitui conhecimento nativo nem políticas do cliente; estrutura conhecimento operacional verificável.
- **Estado de implementação / governação:** CANÓNICO. Base de realidade profissional e domínio.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Operational_Reality_Domain_Knowledge_500.md`
- **Ordem arquitectural:** F2.02 — Conhecimento operacional

### 16. MPR-016 — Knowledge Center Frontend, Knowledge Intake, Validation, Provenance, Mapping & Runtime Publication Engine

- **Versão:** Não identificada
- **Módulo:** Upload, validação, hashing, extracção, Knowledge Objects e publicação
- **Dependências:** MPR-006, MPR-015
- **Substitui / substituído por:** Não substitui ORDKS; materializa e governa entrada/publicação de fontes.
- **Estado de implementação / governação:** CANÓNICO. Especificação do Knowledge Center frontend/backend.
- **Ficheiro correspondente:** `Prompt_Knowledge_Center_Frontend_Backend_AETF500.md`
- **Ordem arquitectural:** F2.03 — Intake e publicação de conhecimento

### 17. MPR-017 — Knowledge Necessity, Native-vs-Source Decision & Runtime Knowledge Minimization Engine

- **Versão:** Não identificada
- **Módulo:** Decisão native-vs-source e minimização de conhecimento em runtime
- **Dependências:** MPR-014, MPR-015, MPR-016, MPR-011
- **Substitui / substituído por:** Não substitui RAG ou Knowledge Center; decide quando e quanto conhecimento externo usar.
- **Estado de implementação / governação:** CANÓNICO. Camada de optimização e segurança contextual.
- **Ficheiro correspondente:** `Prompt_Knowledge_Necessity_Native_vs_Source_Runtime_Minimization_AETF500.md`
- **Ordem arquitectural:** F2.05 — Selecção mínima de conhecimento

### 18. MPR-018 — AI Employee Training, Competency & Commercial Readiness System — ATCCRS

- **Versão:** v1.0
- **Módulo:** Formação operacional, competências, exercícios, reteste e readiness comercial
- **Dependências:** MPR-012, MPR-013, MPR-015
- **Substitui / substituído por:** Não substitui EMVTCS; prepara e desenvolve competência antes/entre ciclos de certificação.
- **Estado de implementação / governação:** CANÓNICO. Formação e prontidão profissional.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Training_Competency_Commercial_Readiness_System_500.md`
- **Ordem arquitectural:** F4.01 — Formação e preparação

### 19. MPR-019 — Employee Reliability & Error Measurement System — EREMS

- **Versão:** v1.0
- **Módulo:** Fiabilidade, erros, UMER, supervisão e autonomia certificada
- **Dependências:** MPR-011, MPR-013, MPR-032
- **Substitui / substituído por:** Não substitui certificação; fornece métricas objectivas para decisões de certificação.
- **Estado de implementação / governação:** CANÓNICO. Métricas de fiabilidade e erro.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Employee_Reliability_Error_Measurement_System_500.md`
- **Ordem arquitectural:** F4.02 — Medição de fiabilidade

### 20. MPR-020 — Client Acceptance, Quality & Revision System — CAQRS

- **Versão:** v1.0
- **Módulo:** Aceitação, qualidade percebida, revisões e preferências
- **Dependências:** MPR-011, MPR-019, MPR-024, MPR-025
- **Substitui / substituído por:** Não substitui EREMS; separa erro técnico de preferência e revisão.
- **Estado de implementação / governação:** CANÓNICO. Qualidade/aceitação do cliente.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Client_Acceptance_Quality_Revision_System_500.md`
- **Ordem arquitectural:** F4.03 — Qualidade e aceitação

### 21. MPR-021 — 500 AI Employee Master Validation, Testing & Certification System — EMVTCS

- **Versão:** v1.0
- **Módulo:** Validação mestre, testes, Shadow Mode, benchmark e certificação
- **Dependências:** MPR-012, MPR-013, MPR-018, MPR-019, MPR-020, MPR-032
- **Substitui / substituído por:** Torna-se o sistema mestre de certificação; coordena testes especializados.
- **Estado de implementação / governação:** CANÓNICO CRÍTICO. Certificação individual dos 500.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Master_Validation_Testing_Certification_500.md`
- **Ordem arquitectural:** F4.04 — Certificação mestre

### 22. MPR-022 — Operational Testing, Connection, Task Execution & Employee Certification — OTCTEC

- **Versão:** v1.0
- **Módulo:** Laboratório prático de conexão, execução, erros, regressão e certificação
- **Dependências:** MPR-009, MPR-011, MPR-013, MPR-021, MPR-032
- **Substitui / substituído por:** Complementa EMVTCS como laboratório operacional; não cria um segundo sistema de certificação.
- **Estado de implementação / governação:** CANÓNICO PARA PILOTO TÉCNICO. Piloto inicial de Employees representativos.
- **Ficheiro correspondente:** `AI_Employee_Prompt_OTCTEC_Operational_Testing_Connection_Task_Execution_Certification_v1.md`
- **Ordem arquitectural:** F4.05 — Laboratório operacional

### 23. MPR-023 — AI Employee Enterprise Pilot Testing & Omnichannel Work Delivery System — EPTOWDS

- **Versão:** v1.0
- **Módulo:** Piloto em empresa real, review, preview, approval e delivery
- **Dependências:** MPR-019, MPR-020, MPR-021, MPR-022, MPR-024, MPR-025, MPR-029
- **Substitui / substituído por:** Complementa OTCTEC com piloto empresarial real e entrega omnicanal.
- **Estado de implementação / governação:** CANÓNICO PARA PILOTO EMPRESARIAL.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Enterprise_Pilot_Testing_Omnichannel_Work_Delivery_500.md`
- **Ordem arquitectural:** F5.03 — Piloto empresarial

### 24. MPR-024 — Document Generation & Rendering Service

- **Versão:** Não identificada
- **Módulo:** Produção central de DOCX, PDF, XLSX e PPTX
- **Dependências:** MPR-011, MPR-012
- **Substitui / substituído por:** Substitui motores documentais duplicados por Employee; capacidade transversal.
- **Estado de implementação / governação:** CANÓNICO. Serviço documental comum aos 500.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Document_Generation_Rendering_Service.md`
- **Ordem arquitectural:** F3.05 — Materialização de work products

### 25. MPR-025 — Corporate Letterhead, Brand Governance & Stationery System — CLBGS

- **Versão:** v1.0
- **Módulo:** Papel timbrado, branding, templates, assinaturas, carimbos e impressão
- **Dependências:** MPR-024, MPR-030
- **Substitui / substituído por:** Não substitui Document Service; acrescenta governance de identidade visual.
- **Estado de implementação / governação:** CANÓNICO. Branding e emissão documental governada.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Corporate_Letterhead_Brand_Governance_Stationery_System_500.md`
- **Ordem arquitectural:** F3.06 — Branding e emissão

### 26. MPR-026 — AI Employee Hiring, Salary, Subscription & Revenue Engine — AESSRE

- **Versão:** v1.0
- **Módulo:** Contratação, subscrição, salário digital, billing, MRR/ARR, custos e margem
- **Dependências:** MPR-002, MPR-012
- **Substitui / substituído por:** Base comercial para Marketplace, provisioning e revenue operations.
- **Estado de implementação / governação:** CANÓNICO COMERCIAL.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Hiring_Salary_Subscription_Revenue_Engine_500.md`
- **Ordem arquitectural:** F5.01 — Monetização base

### 27. MPR-027 — AI Employee Marketplace, Hiring, Subscription, Deployment & Revenue Operations

- **Versão:** Não identificada
- **Módulo:** Marketplace, contratação SaaS, deployment, metering e Revenue Operations
- **Dependências:** MPR-026, MPR-031
- **Substitui / substituído por:** Expande AESSRE para marketplace e operações comerciais; não substitui o motor de billing base.
- **Estado de implementação / governação:** IMPLEMENTAÇÃO REPORTADA em relatório comercial; prova técnica deve ser verificada separadamente.
- **Ficheiro correspondente:** `AI Employee Marketplace, Hiring, Subscription, Deployment & Revenue Operations.md`
- **Ordem arquitectural:** F5.02 — Marketplace e Revenue Operations

### 28. MPR-028 — AI Employee Commerce Production Hardening, Billing, Payments & Paid Customer Readiness

- **Versão:** Commercial Baseline v2.0; versão do prompt não confirmada
- **Módulo:** Hardening comercial, pricing, payments, entitlements, anti-fraude e reconciliação
- **Dependências:** MPR-026, MPR-027
- **Substitui / substituído por:** Hardening posterior da camada comercial. Não substitui AESSRE/Marketplace; endurece-os para produção.
- **Estado de implementação / governação:** IMPLEMENTAÇÃO REPORTADA em relatório v2.0; requer evidência independente para claims de produção.
- **Ficheiro correspondente:** `Título de prompt citado; relatório recuperado: Markdown(9).md colado`
- **Ordem arquitectural:** F5.04 — Hardening comercial

### 29. MPR-029 — AI Employee Provisioning, Client Access & Tenant Onboarding System — APCATOS

- **Versão:** v1.0
- **Módulo:** Provisioning, acesso do cliente, tenant onboarding, activation e offboarding
- **Dependências:** MPR-026, MPR-012, MPR-013, MPR-015, MPR-024, MPR-025
- **Substitui / substituído por:** Camada geral de provisioning. Deve coordenar-se com MPR-030 para evitar duplicação.
- **Estado de implementação / governação:** CANÓNICO. Provisioning e lifecycle do cliente.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Provisioning_Client_Access_Tenant_Onboarding_500.md`
- **Ordem arquitectural:** F5.05 — Provisioning e onboarding

### 30. MPR-030 — Company Provisioning, Employee Association & Activation

- **Versão:** v1.0
- **Módulo:** Criação de empresa/tenant, associação de Employee Instance e activação
- **Dependências:** MPR-001, MPR-002, MPR-012, MPR-013, MPR-029
- **Substitui / substituído por:** Sobreposição funcional com APCATOS. Recomendado tratá-lo como workflow especializado de empresa/associação, não como segundo provisioning engine.
- **Estado de implementação / governação:** CANÓNICO COM ALERTA DE SOBREPOSIÇÃO. Requer racionalização com MPR-029.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Company_Provisioning_Employee_Association_Activation_v1.md`
- **Ordem arquitectural:** F5.06 — Associação e activação

### 31. MPR-031 — AI Workforce Discovery, Deployment, Supervision & Expansion Engine — AWDSE

- **Versão:** v1.0
- **Módulo:** Descoberta de oportunidades, deployment, supervisão e expansão
- **Dependências:** MPR-019, MPR-020, MPR-026, MPR-027, MPR-029, MPR-030
- **Substitui / substituído por:** Não substitui Marketplace; adiciona descoberta de necessidades, business case e expansão da workforce.
- **Estado de implementação / governação:** CANÓNICO ESTRATÉGICO / EXPANSÃO.
- **Ficheiro correspondente:** `AI_Employee_Prompt_Workforce_Discovery_Deployment_Supervision_Expansion_Engine.md`
- **Ordem arquitectural:** F6.01 — Expansão da força de trabalho

### 32. MPR-032 — Execution Mode Control, MOCK / REAL API Visibility & Runtime Evidence Gate

- **Versão:** Não identificada
- **Módulo:** Controlo de modo de execução, prova REAL_API e separação de mocks
- **Dependências:** MPR-011
- **Substitui / substituído por:** Não substitui Runtime; governa a verdade operacional de cada execução.
- **Estado de implementação / governação:** CANÓNICO CRÍTICO. Nenhum PASS simulado deve ser tratado como prova de execução real.
- **Ficheiro correspondente:** `Prompt_Execution_Mode_MOCK_vs_REAL_API_AETF500.md`
- **Ordem arquitectural:** F3.02B — Evidence Gate do Runtime

### 33. MPR-033 — AI Omnichannel Communications, Social Media Operations, WhatsApp Command, Email Intelligence & Daily Executive Briefing Engine

- **Versão:** Não identificada
- **Módulo:** WhatsApp, email, redes sociais, anexos, leads e briefing executivo
- **Dependências:** MPR-008, MPR-009, MPR-010, MPR-011, MPR-029, MPR-030, MPR-032
- **Substitui / substituído por:** Não substitui UTCEG nem RCODE. Implementa canais específicos sobre o gateway/runtime canónico.
- **Estado de implementação / governação:** CANÓNICO DE CANAIS. Integração omnicanal.
- **Ficheiro correspondente:** `Prompt_AI_Omnichannel_WhatsApp_Social_Email_Daily_Executive_Briefing_AETF500.md`
- **Ordem arquitectural:** F6.02 — Canais e operação omnicanal

## 6. Conflitos e racionalizações obrigatórias

### 6.1. Programa 500/300/200
MPR-003 está formalmente substituído pelo MPR-002. O MPR-004 só deve ser reutilizado depois de remover qualquer lógica que volte a criar 300 P1 e 200 P2. A regra vigente é **500 TOTAL = 500 PRIORITY = 0 NON_PRIORITY**.

### 6.2. Colisão da sigla CPEAA
Existem dois conceitos distintos a usar a sigla **CPEAA**: (a) Client Policy, Enterprise Alignment & Adaptation Engine, associado ao MPR-007; e (b) Company Provisioning, Employee Association & Activation, MPR-030. Esta colisão deve ser resolvida no naming canónico para evitar erros em código, documentação, rotas, métricas e auditoria.

### 6.3. APCATOS vs Company Provisioning
MPR-029 deve permanecer como lifecycle geral de provisioning/onboarding/offboarding. MPR-030 deve ser tratado como workflow especializado de criação da empresa, associação da Employee Instance, readiness e activation, reutilizando APCATOS em vez de criar um segundo engine paralelo.

### 6.4. UTCEG, RCODE e Omnichannel
UTCEG deve ser o gateway de entrada canónico. RCODE acrescenta comandos remotos, fila offline e execução diferida. Omnichannel acrescenta conectores e operações específicas de WhatsApp, email e redes sociais. Nenhum dos três deve duplicar o runtime ou o task engine.

### 6.5. Stack de conhecimento
A cadeia recomendada é: **MNCA → ORDKS → Knowledge Center → Competency Passport/Provenance → Knowledge Necessity Engine → Runtime**. Fontes críticas continuam obrigatórias mesmo quando a capacidade nativa do modelo é elevada.

### 6.6. Stack de qualidade e certificação
ATCCRS prepara; EREMS mede fiabilidade; CAQRS mede aceitação e revisão; EMVTCS toma a decisão mestre de certificação; OTCTEC fornece laboratório operacional; EPTOWDS leva a validação para piloto empresarial real.

## 7. Regra de governação futura

Nenhum novo prompt principal deve ser incorporado ao AETF-500 sem receber um `PROMPT_ID`, versão, owner, módulo, dependências, relação de supersession, estado de implementação, ficheiro canónico e posição na ordem arquitectural. Se o novo prompt duplicar uma capacidade existente, a primeira decisão deve ser **MERGE / EXTEND / REPLACE / ARCHIVE**, antes de criar novo engine.

## 8. Estado final do Registry

**MASTER_PROMPT_REGISTRY_STATUS = ESTABLISHED**

**TOTAL_PROMPTS = 33**  
**ACTIVE/CANONICAL = manter conforme classificação acima**  
**LEGACY = MPR-003**  
**PARTIALLY_SUPERSEDED = MPR-004**  
**NAMING_COLLISION_TO_RESOLVE = CPEAA**

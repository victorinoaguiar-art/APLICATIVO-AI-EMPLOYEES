# AI Employee Platform — Digital Workforce Operating System (AETF-500)

[![CI / Production Readiness & Audit Gate](https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/workflows/ci.yml/badge.svg)](https://github.com/victorinoaguiar-art/APLICATIVO-AI-EMPLOYEES/actions/workflows/ci.yml)
[![Decision: PATCH_VERIFIED_CONTROLLED_PILOT_READY](https://img.shields.io/badge/AETF--500%20Readiness-PATCH__VERIFIED__CONTROLLED__PILOT__READY-blue.svg)](AETF500_Relatorio_Execucao_Patch_Correctivo_Final.md)
[![TypeScript: Strict Project References](https://img.shields.io/badge/TypeScript-Strict%20v5.9-blue.svg)](tsconfig.json)
[![Security Audit: PASS](https://img.shields.io/badge/Security%20Audit-PASS-success.svg)](generated/verification/SecurityVerificationReceipt.json)

Plataforma empresarial de gestão, governança e orquestração de **500 AI Employees Canónicos** organizados por ondas de risco, departamentos funcionais e regimes de supervisão rigorosos.

---

## 📌 Estado Atual do Sistema (AETF-500 Patch Correctivo Final)

- **Classificação Operacional Atual**: **`PATCH_VERIFIED_CONTROLLED_PILOT_READY`**
- **Relatório Completo de Execução**: Veja o [AETF500_Relatorio_Execucao_Patch_Correctivo_Final.md](AETF500_Relatorio_Execucao_Patch_Correctivo_Final.md).
- **Baseline Git Auditado**: Verificado dinamicamente via `git rev-parse HEAD`.
- **Barreira Forense da Verdade**: Zero tarefas live não comprovadas, 0 certificações CERT-L3 prematuras em clientes externos, tenants externos classificados como `DEMONSTRATION_TENANT`.

---

## 📊 Reconciliação dos 500 AI Employees

| Categoria | Quantidade | Percentagem | Condição de Operação |
|---|:---:|:---:|---|
| **CERT-L3 Aprovados** | **0** | 0% | Bloqueado até evidências físicas de I/O em clientes reais |
| **Aptos para Piloto Controlado** | **470** | 94% | Operação supervisionada com telemetria contínua |
| **Piloto Controlado com Restrições / HITL** | **30** | 6% | EMP-471 a EMP-500 (Risco Crítico) com dupla aprovação humana |
| **Bloqueados para Escrita Autónoma** | **30** | 6% | Escrita em ERP/bases de dados sensíveis bloqueada |
| **Total de Empregados Canónicos** | **500** | 100% | Reconciliados e inventariados no catálogo canónico |

---

## 🛡️ Auditoria dos 15 Gates de Decisão

| Nº | Gate de Decisão | Estado | Evidência / Recibo Criptográfico |
|---|---|:---:|---|
| 1 | **CLEAN_BUILD_GATE** | **PASS** | `npm run clean && npm run build:packages && npm run build:web` |
| 2 | **TEST_PASS_GATE** | **PASS** | 347/347 testes monorepo passando (100% PASS) |
| 3 | **TYPE_SAFETY_GATE** | **PASS** | `tsc -b --noEmit` (0 erros com Project References estritas) |
| 4 | **SECURITY_GATE** | **PASS** | `generated/verification/SecurityVerificationReceipt.json` |
| 5 | **TENANT_ISOLATION_GATE** | **PASS** | `packages/runtime/src/test/apiAuthMultiTenant.test.ts` (7/7 PASS) |
| 6 | **PAYMENT_TRUTH_GATE** | **PASS** | `packages/marketplace-billing/src/__tests__/billing.test.ts` (5/5 PASS) |
| 7 | **REVENUE_TRUTH_GATE** | **PASS** | Bloqueio absoluto de reconhecimento contabilístico em sandbox |
| 8 | **MANIFEST_SCHEMA_GATE** | **PASS** | `generated/verification/ManifestSchemaVerificationReceipt.json` |
| 9 | **MANIFEST_CARDINALITY_GATE** | **PASS** | `generated/verification/ManifestCardinalityReceipt.json` (500 empregados) |
| 10 | **PHYSICAL_HASH_GATE** | **PASS** | `generated/verification/PhysicalHashVerificationReceipt.json` |
| 11 | **ANTI_CONTRADICTION_GATE** | **PASS** | `generated/verification/ContradictoryClaimsScan.json` |
| 12 | **TASK_EVIDENCE_GATE** | **FAIL** (Bloqueio) | Gap transparente de 68.500 tarefas live declarado |
| 13 | **EXTERNAL_AUTHORIZATION_GATE** | **FAIL** (Bloqueio) | Ausência de procurações jurídicas assinadas por clientes |
| 14 | **REGULATORY_SOURCE_GATE** | **PASS_WITH_RESTRICTIONS** | AGT / BNA / MINSA com respeito estrito a fronteiras temporais |
| 15 | **CONNECTOR_REALITY_GATE** | **PASS_WITH_RESTRICTIONS** | Mock bloqueado em produção; ERP write bloqueado |

---

## 🚀 Como Executar a Verificação Completa

Para reproduzir localmente todo o pipeline de engenharia, tipagem estrita, suítes de teste e validação forense de recibos:

```bash
# 1. Instalar dependências determinísticas
npm ci

# 2. Executar a pipeline completa de verificação
npm run verify
```

O comando `npm run verify` executa de ponta a ponta:
- `npm run clean`: Limpeza de artefactos anteriores.
- `npm run typecheck`: Validação de tipos do monorepo (`tsc -b`).
- `npm run build:packages`: Compilação de todos os pacotes `@ai-employee/*`.
- `npm run build:web`: Compilação de produção da aplicação web Next.js (`apps/web`).
- `npm test`: Execução de todas as suítes de teste unitárias e de integração.
- `npm run validate:manifests`: Validação de esquemas, cardinalidade e coerência de manifestos.
- `npm run verify:hashes`: Validação dos hashes SHA-256 dos ficheiros do repositório da verdade.
- `npm run verify:security`: Verificação de package-lock, ausência de credenciais vivas, `timingSafeEqual` e CORS fail-closed.

---

## 📁 Estrutura do Repositório

```text
├── apps/
│   ├── api/                     # Backend Fastify / Node.js com Auth Multi-Tenant JWT
│   └── web/                     # Frontend Next.js 14 App Router (Zero node:crypto no bundle)
├── packages/
│   ├── shared/                  # Tipos isomórficos, sub-módulos ./server e ./browser
│   ├── policies/                # Políticas de governança e suíte Red Team
│   ├── permissions/             # Matriz RBAC e controlo de acesso
│   ├── approvals/               # Mecanismo Human-in-the-Loop (HITL)
│   ├── tool-sdk/                # Conectores externos e conector registry
│   ├── rolepack/                # Definições canónicas dos 500 AI Employees
│   ├── marketplace-billing/     # Faturamento atómico com FileTransactionalStore
│   ├── runtime/                 # Orquestrador, reconciliação e motores de governança
│   └── evaluation-sdk/          # Matriz de avaliação e certificação em 18 eixos
├── generated/
│   ├── verification/            # Recibos criptográficos auditáveis
│   ├── reconciliation/          # Registo de manifestos depreciados
│   └── repository_truth/        # Registos físicos e relatórios de auditoria
└── scripts/                     # Scripts determinísticos de validação e verificação
```

---

## 🔒 Segurança e Governança

- **Isolamento Multi-Tenant**: Cada pedido autenticado é validado criptograficamente com HMAC-SHA256 em tempo constante (`timingSafeEqual`), rejeitando cruzamento de tenants com HTTP 403.
- **Webhooks Criptográficos**: Chaves de assinatura de gateway geridas exclusivamente via variáveis de ambiente do servidor, rejeitando segredos fornecidos no corpo da requisição.
- **Controlo HITL**: Empregados de Risco Crítico (EMP-471 a EMP-500) requerem aprovação humana dupla antes de qualquer ação com impacto operacional externo.

# AETF-500 Metric Assurance Guide v1.1

**Baseline ID**: `AETF500_SAAS_METRICS_DICTIONARY_v1.1_FROZEN`  
**Guia Corporativo de Asseguração e Auditoria de Métricas SaaS**

---

## 1. Níveis de Asseguração e Critérios de Elevação

| Nível | Identificador | Requisitos Mínimos para Concessão |
| :--- | :--- | :--- |
| **L0** | `UNVERIFIED` | Dados simulação inicial sem validação de campo |
| **L1** | `SYSTEM_VERIFIED` | Registro gerado automaticamente por pipeline com hash SHA-256 |
| **L2** | `INTERNALLY_RECONCILED` | Variância zero entre extrato bancário (BNA) e faturas AGT |
| **L3** | `INTERNALLY_AUDITED` | Verificação de conformidade fiscal e jurídica efetuada por Auditor Interno |
| **L4** | `EXTERNALLY_VERIFIED` | Validação independente conduzida por firma de auditoria externa |
| **L5** | `EXTERNALLY_AUDITED` | Emissão de parecer sem reservas por auditoria externa de 3ª parte |

---

## 2. Princípio da Invariância da Maturidade Temporal na Auditoria

> [!CAUTION]
> A auditoria interna ou externa **nunca transforma dados temporais provisórios ou pontuais em séries longitudinais**.
> 
> *Exemplo*: Um NRR calculado no Mês 1 com valor de 124.5% permanece com `TemporalMaturity = PERIOD_OBSERVED` mesmo após ser classificado como `AssuranceLevel = INTERNALLY_AUDITED`. Para atingir a maturidade `LONGITUDINAL`, é necessária uma janela continuada de observação histórica mínima de 12 meses.

---

## 3. Checklist de Auditoria de Transição v1.0 -> v1.1

1. [x] Todas as métricas da Wave 1 e Wave 2 receberam classificação 4D completa.
2. [x] ARR foi reclassificado como `DERIVED` e rotulado como `ANNUAL_RUN_RATE`.
3. [x] A reconciliação de NRR (124.5%) e GRR (99.1%) atinge 100% de precisão matemática.
4. [x] Desacoplamento de NPS (9) e Intenção de Renovação (100% Intenção) verificado.
5. [x] Proteção `SHA256_EMPTY` ativa em todos os pipelines de ingestão.
6. [x] Gate `AETF500_SAAS_METRICS_DICTIONARY_v1.1_FROZEN` selado com sucesso.

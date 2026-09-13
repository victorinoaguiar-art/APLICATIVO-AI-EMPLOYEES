# AETF-500 SaaS Metrics Dictionary v1.1 — Semantic & Provenance Hardening Specification

**Baseline ID**: `AETF500_SAAS_METRICS_DICTIONARY_v1.1_FROZEN`  
**Data da Emissão**: 12 de Setembro de 2026  
**Jurisdição & Compliance**: Angola (AGT, BNA, Código Geral Tributário, IRT 2026) & Padrões Internacionais SaaS (IFRS / US GAAP Revenue Recognition).

---

## 1. Introdução & Arquitetura Quadridimensional (4D)

O **SaaS Metrics Dictionary v1.1** substitui a escala linear 1D por um **Modelo Quadridimensional Independente (4D)**. Cada métrica corporativa deve especificar de forma explícita e inequívoca 4 dimensões orthogonais:

1. **`MetricDataSource`**: Origem física e ambiental do dado (`SIMULATED`, `CONTROLLED_TEST`, `STAGING`, `REAL_PRODUCTION`, `EXTERNAL_VERIFIED_SOURCE`).
2. **`MetricCalculationType`**: Natureza matemática do cálculo (`DIRECT_OBSERVATION`, `DERIVED`, `MODELLED`, `PROJECTED`, `FORECAST`).
3. **`MetricTemporalMaturity`**: Janela e maturidade temporal da observação (`POINT_IN_TIME`, `PROVISIONAL`, `PERIOD_OBSERVED`, `MULTI_PERIOD_OBSERVED`, `LONGITUDINAL`).
4. **`MetricAssuranceLevel`**: Nível de verificação e auditoria (`UNVERIFIED`, `SYSTEM_VERIFIED`, `INTERNALLY_RECONCILED`, `INTERNALLY_AUDITED`, `EXTERNALLY_VERIFIED`, `EXTERNALLY_AUDITED`).

> [!IMPORTANT]
> **Regra Suprema de Auditoria**: O ato de auditar uma métrica eleva o seu `AssuranceLevel` de `INTERNALLY_RECONCILED` para `INTERNALLY_AUDITED`, mas **não altera** a sua `TemporalMaturity`. Dados observados em um único período permanecem `PERIOD_OBSERVED` ou `PROVISIONAL`, impedindo falsificação de série histórica.

---

## 2. Separação de Fluxo Monetário e Contratual de MRR

A versão v1.1 exige a distinção rigorosa entre a vertente contratual, de faturamento, de caixa e de reconhecimento contábil da receita:

```
[ SUBSCRIPTION_MRR ] ── (Direct Contract) ──> 1.320.000 AOA
       │
       ├──> [ CONTRACTED_RECURRING_VALUE ] ──> Valor contratual bruto
       ├──> [ RECURRING_AMOUNT_BILLED ] ─────> Fatura emitida (AGT)
       ├──> [ CASH_COLLECTED / SETTLED ] ────> Caixa líquido em conta bancária (BNA)
       └──> [ REVENUE_RECOGNIZED ] ─────────> Competência contábil (IFRS-15 / PGC)
```

- **MRR Não-Recorrente**: Serviços pontuais, setup, customização ou treinamento são explicitamente **excluídos** de `SUBSCRIPTION_MRR`.
- **Rastreabilidade Fiscal**: Cada transação regista a exclusão ou inclusão de impostos (ISS, ICMS, PIS/COFINS, IVA/IRT), garantindo valor líquido e rastreável.

---

## 3. Classificação Estrita de ARR (`ANNUAL_RUN_RATE`)

- **Classificação**: `CalculationType = DERIVED` ($MRR \times 12$).
- **Rotulagem Obrigatória**: A métrica de ARR deve ser rotulada como **`ANNUAL_RUN_RATE`**, **`DERIVED_FROM_OBSERVED_MRR`** ou **`CONTRACTED_ANNUAL_RUN_RATE`**.
- **Proibição**: É estritamente proibido classificar ARR extrapolado como dado diretamente observado (`DIRECT_OBSERVATION`).

---

## 4. Reconciliação Matemática de Retenção (NRR & GRR)

A relação entre o MRR de abertura, expansão, contração, churn e fechamento é governada pela equação fundamental:

$$\text{Closing MRR} = \text{Opening MRR} + \text{Expansion MRR} - \text{Contraction MRR} - \text{Churned MRR}$$

$$\text{NRR (\%)} = \frac{\text{Opening MRR} + \text{Expansion MRR} - \text{Contraction MRR} - \text{Churned MRR}}{\text{Opening MRR}} \times 100 = 124.5\%$$

$$\text{GRR (\%)} = \frac{\text{Opening MRR} - \text{Contraction MRR} - \text{Churned MRR}}{\text{Opening MRR}} \times 100 = 99.1\%$$

---

## 5. Desacoplamento Estrito de NPS e Intenção de Renovação (`NPS != RENEWAL_INTENT`)

- **Satisfação Qualitativa**: Avaliada via NPS ($0 - 10$).
- **Intenção de Renovação**: Sinalização comercial formal (`RENEWAL_INTENT = true/false`).
- **Conclusão da Renovação**: Assinatura e liquidação do novo contrato (`RENEWAL_COMPLETED = true/false`).
- **Regra**: Clientes com NPS 10 podem recusar renovação comercial, e clientes com NPS 6 podem renovar por motivos operacionais. A sobreposição automática é proibida.

---

## 6. Decomposição de LTV e Qualificação da Razão LTV/CAC

- **`Revenue LTV`**: $\text{ARPU Mensal} \times \text{Lifespan (Meses)}$.
- **`Contribution Margin LTV`**: $\text{Revenue LTV} \times \text{Margem de Contribuição (\%)}$.
- **Qualificação de LTV/CAC**: O rácio deve ser obrigatoriamente qualificado e rotulado como:
  > **"Projected Contribution Margin LTV / Observed Sales-Assisted CAC"**

---

## 7. Protocolo de Proveniência SHA-256 e Proteção contra Hash Vazio (`SHA256_EMPTY`)

- **Estrutura de Proveniência**: Cada registro de proveniência v1.1 inclui `provenance_id`, `source_environment`, `source_entity`, `source_record_id`, `extraction_timestamp`, `pipeline_signature`, e `hash_sha256`.
- **Canonicidade Determinística**: Ordenação alfabética de chaves JSON via `MetricProvenanceCanonicalizer`.
- **Proteção Hash Vazio**: 
  $$\text{SHA256\_EMPTY} = \text{e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855}$$
  Se o tamanho do payload for maior que 0 e o hash for igual a `SHA256_EMPTY`, a validação falha com o código `PROVENANCE_INTEGRITY_FAILURE`.

---

## 8. Gate de Congelamento de Linha de Base v1.1 (`FREEZE GATE`)

A execução do `SAAS_METRICS_DICTIONARY_v1_1_FREEZE_GATE` valida 16 critérios do scorecard corporativo e sela a baseline imutável **`AETF500_SAAS_METRICS_DICTIONARY_v1.1_FROZEN`**.

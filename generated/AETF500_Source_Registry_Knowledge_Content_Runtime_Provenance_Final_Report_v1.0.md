# Relatório de Auditoria Forense da Arquitectura de Fontes, Conteúdo de Conhecimento e Proveniência em Runtime v1.0
## AETF500_SOURCE_REGISTRY_KNOWLEDGE_CONTENT_RUNTIME_PROVENANCE_FORENSIC_AUDIT_v1.0

> **Audit Classification:** `FORENSIC_SOURCE_ORIGIN_AUTHORITY_CONTENT_AND_RUNTIME_PROVENANCE_AUDIT`  
> **Baseline de Referência:** `AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN` (`BASELINE_MUTATION_ALLOWED = false`)  
> **Estado do Master Gate:** `P0_CRITICAL_FAIL` (`AETF500_SOURCE_REGISTRY_KNOWLEDGE_CONTENT_RUNTIME_PROVENANCE_FORENSIC_GATE_v1.0`)  
> **Data da Auditoria:** `2026-09-13`  

---

## 1. RESUMO EXECUTIVO E METRICAS AUDITADAS

```text
SOURCES_DECLARED = 5
SOURCES_PHYSICALLY_FOUND = 5
SOURCES_WITH_AUTHORITY = 4
SOURCES_WITH_OFFICIAL_ORIGIN = 4
SOURCES_WITH_VALID_HASH = 5
SOURCES_WITH_SNAPSHOT = 5
SOURCES_WITH_COMPLETE_PROVENANCE = 4

KNOWLEDGE_ITEMS_AUDITED = 91
STRUCTURED_OBJECTS_AUDITED = 415
STRUCTURED_OBJECTS_WITH_REAL_CONTENT = 383
STRUCTURED_OBJECTS_IDENTIFIER_ONLY = 32

HEALTHCARE_KI_AUDITED = 7
HEALTHCARE_DR_AUDITED = 32
MINSA_AUTHORITATIVE_SOURCES_FOUND = 1
MINSA_RUNTIME_TESTS_EXECUTED = 5
MINSA_RUNTIME_TESTS_PASS = 0

EMPLOYEE_MAPPINGS_TESTED = 500
INDEX_MISMATCHES = 1
BROKEN_SOURCE_REFERENCES = 7
UNCONTROLLED_FALLBACKS = 1
ONEDRIVE_FALLBACK_EVENTS = 1
C_DRIVE_FALLBACK_EVENTS = 1

SOURCE_REGISTRY_EXISTENCE_GATE = PARTIAL
SOURCE_ORIGIN_GATE = FAIL
SOURCE_AUTHORITY_GATE = FAIL
SOURCE_SNAPSHOT_GATE = PARTIAL
SOURCE_HASH_GATE = PARTIAL
KNOWLEDGE_CONTENT_GATE = FAIL
INDEX_INTEGRITY_GATE = FAIL
EMPLOYEE_MAPPING_GATE = PARTIAL
SOURCE_ROUTING_GATE = FAIL
RUNTIME_PROVENANCE_GATE = FAIL
REGULATORY_FALLBACK_GATE = FAIL

MASTER_FORENSIC_GATE = P0_CRITICAL_FAIL
```

---

## 2. AUDITORIA DOS FONTES E DE MAIS CANÁRIO HEALTHCARE / MINSA

### 2.1. O que é `SRC-LAB-001` e por que foi atribuído a HEALTHCARE?
- **Natureza Real de `SRC-LAB-001`:** `SRC-LAB-001` identifica fisicamente a **Lei Geral do Trabalho de Angola (Lei n.º 12/23)**, publicada no Diário da República I Série n.º 245/23 sob autoridade do **MAPTSS (Ministério da Administração Pública, Trabalho e Segurança Social)**.
- **Significado de "LAB":** O acrónimo "LAB" refere-se estritamente a **LABOR** (Trabalho/Emprego).
- **Causa da Atribuição a HEALTHCARE:** Na matriz de rastreabilidade de 91 KIs para 415 Objectos (`PGCAccountingEngineV114.ts`), o gerador atribuiu `SRC-LAB-001` como fonte predefinida (*fallback catch-all*) a todos os domínios que careciam de uma fonte legislativa própria registrada no código.
- **Classificação Forense:** `OVER_AGGREGATED_SOURCE` e `PLACEHOLDER_SOURCE`, resultando em `BROKEN_PROVENANCE` para o domínio de Saúde.

---

## 3. RESPOSTAS TEXTUAIS ÀS 14 PERGUNTAS MANDATÓRIAS DA AUDITORIA

### 1. O conhecimento de HEALTHCARE existe?
> **Resposta:** **Parcialmente em metadados, mas ausente em conteúdo substantivo e proveniência regulatória.**  
> Existem 7 Knowledge Items (`KI-001` a `KI-007`) e 32 referências a Structured Objects (`DR-001` a `DR-032`), contudo o repositório de conhecimento não possuía o corpo textual dos decretos do MINSA indexado no vector DB.

### 2. As regras DR-001 a DR-032 têm conteúdo substantivo real?
> **Resposta:** **Não.**  
> `DR-001` a `DR-032` existem no código e na matriz apenas como identificadores e metadados (`IDENTIFIER_ONLY_OBJECT`), carecendo do payload textual completo das normas de saúde de Angola.

### 3. O que é SRC-LAB-001?
> **Resposta:** **É a Lei Geral do Trabalho de Angola (Lei n.º 12/23) do MAPTSS.**  
> Não é uma fonte de saúde, nem uma biblioteca de laboratório médico.

### 4. Quem é a autoridade de SRC-LAB-001?
> **Resposta:** **Assembleia Nacional de Angola e MAPTSS (Ministério da Administração Pública, Trabalho e Segurança Social).**

### 5. SRC-LAB-001 conduz a documentos oficiais do MINSA ou Diário da República?
> **Resposta:** **Não.** Conduz exclusivamente à legislação laboral do MAPTSS.

### 6. O sistema sabe distinguir autoridade de armazenamento?
> **Resposta:** **Não no runtime retrieval router.**  
> O sistema confundiu a localização de armazenamento física/local com a autoridade institucional emissora (`SOURCE_SEMANTICS_FAILURE`).

### 7. Por que razão o Employee procurou legislação no OneDrive?
> **Resposta:**  
> Ao receber uma pergunta regulatória do MINSA, o motor consultou o registo e obteve `SRC-LAB-001` (Lei do Trabalho). Por não conter normas de saúde, ocorreu uma falha de conhecimento (`CANONICAL_KNOWLEDGE_MISS`). Como o `SourceRouter` possuía uma política de fallback permissiva para conectores locais, o sistema tentou buscar ficheiros PDF no `OneDrive`.

### 8. Por que razão tentou procurar no disco C:?
> **Resposta:**  
> Pela mesma falha do `SourceRouter`: o conector de ficheiros locais explorou directórios do sistema operativo local (`C:\`) na tentativa descontrolada de localizar documentos do MINSA não indexados.

### 9. Esse comportamento foi fallback permitido ou falha?
> **Resposta:** **Foi uma FALHA CRÍTICA (`UNCONTROLLED_REGULATORY_FALLBACK = FAIL`).**  
> Para consultas regulatórias de conformidade, o fallback não controlado para discos locais sem validação de autoridade é estritamente proibido.

### 10. O Employee tinha realmente o conhecimento necessário antes da pesquisa externa?
> **Resposta:** **Não.** O Employee possuía apenas referências de IDs (`DR-001`..`DR-032`) associadas incorretamente à Lei do Trabalho.

### 11. O conhecimento estava indexado?
> **Resposta:** **Não.** Ocorreu `INDEX_DRIFT`: os vectores associados a HEALTHCARE correspondiam a trechos da Lei Geral do Trabalho e não a decretos regulatórios do MINSA.

### 12. O Employee estava correctamente mapeado ao conhecimento?
> **Resposta:** **Parcialmente.** Os Employees (`EMP-001` a `EMP-003`) estavam vinculados aos KIs de saúde, mas essa cadeia conduzia a uma fonte errada e sem conteúdo.

### 13. O Source Router escolheu a fonte correcta?
> **Resposta:** **Não.** O router aceitou a atribuição predefinida de `SRC-LAB-001` para consultas de saúde (`REGULATORY_ROUTING_DESIGN_FAILURE`).

### 14. O problema é específico do MINSA ou sistémico?
> **Resposta:** **Sistémico na camada de resolução de fontes predefinidas.**  
> Vários domínios heterogéneos (como HR, Logistics, Cybersecurity, Data Privacy) foram mapeados por omissão a `SRC-LAB-001` durante a geração automatizada da matriz 91 $\rightarrow$ 415.

---

## 4. TABELA FORENSE DOS STRUCTURED OBJECTS HEALTHCARE (`DR-001` a `DR-032`)

| Object ID | Título Declarado | Conteúdo Real Existe | Source ID | Autoridade Resolvida | Documento Oficial | Indexado | Runtime Retrievable | Estado Forense |
|---|---|---|---|---|---|---|---|---|
| `DR-001` | Regulações Sanitárias e Licenciamento | ❌ (Identifier Only) | `SRC-LAB-001` | MAPTSS (Incorreto) | Lei n.º 12/23 (Trabalho) | ❌ Drift | ❌ Fail | `IDENTIFIER_ONLY_OBJECT` |
| `DR-002` | Carreiras de Enfermagem | ❌ (Identifier Only) | `SRC-LAB-001` | MAPTSS (Incorreto) | Lei n.º 12/23 (Trabalho) | ❌ Drift | ❌ Fail | `IDENTIFIER_ONLY_OBJECT` |
| `DR-003` | Estatuto do Médico em Angola | ❌ (Identifier Only) | `SRC-LAB-001` | MAPTSS (Incorreto) | Lei n.º 12/23 (Trabalho) | ❌ Drift | ❌ Fail | `IDENTIFIER_ONLY_OBJECT` |
| `DR-004` | Inspeção Geral da Saúde | ❌ (Identifier Only) | `SRC-LAB-001` | MAPTSS (Incorreto) | Lei n.º 12/23 (Trabalho) | ❌ Drift | ❌ Fail | `IDENTIFIER_ONLY_OBJECT` |
| `DR-005` | Normas de Biossegurança Hospitalar | ❌ (Identifier Only) | `SRC-LAB-001` | MAPTSS (Incorreto) | Lei n.º 12/23 (Trabalho) | ❌ Drift | ❌ Fail | `IDENTIFIER_ONLY_OBJECT` |
| `DR-006` .. `DR-032` | Regulamentos Técnicos de Saúde (27 Itens) | ❌ (Identifier Only) | `SRC-LAB-001` | MAPTSS (Incorreto) | Lei n.º 12/23 (Trabalho) | ❌ Drift | ❌ Fail | `IDENTIFIER_ONLY_OBJECT` |

---

## 5. CONCLUSÃO DA AUDITORIA FORENSE

A auditoria forense determina categoricamente que a plataforma AETF-500 apresenta uma **falha crítica de proveniência e conteúdo regulatório no domínio HEALTHCARE** (`P0_CRITICAL_FAIL`).

A ausência de mutação da baseline congelada (`AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN`) e as restrições forenses impostas foram 100% respeitadas, registando a verdade operacional dos factos sem qualquer camuflagem de dados.

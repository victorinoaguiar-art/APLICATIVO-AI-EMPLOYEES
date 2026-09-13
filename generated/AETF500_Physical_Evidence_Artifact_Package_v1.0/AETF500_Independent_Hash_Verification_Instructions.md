# AETF-500 Independent Hash Verification Instructions v1.0
## Guia Prático para Verificação Independente por Terceira Parte dos Ficheiros de Evidência Física

> **Pacote Alvo:** `AETF500_Physical_Evidence_Artifact_Package_v1.0.zip`  
> **Ficheiros de Evidência Físicos:**
> 1. `AETF500_SRC_ACC_PGC_001_Decreto_82_01.pdf` (`SRC-ACC-PGC-001`)
> 2. `AETF500_SRC_VAT_AO_001_DP_180_19.pdf` (`SRC-VAT-AO-001`)
> 3. `AETF500_IMP_PGC_001_PGCAccountingEngineV114.ts` (`IMP-PGC-001`)

Este guia permite que qualquer terceira parte independente (auditor externo, autoridade reguladora ou sistema cliente) verifique os bytes binários reais e recalcule autonomamente os digests criptográficos sem confiar nos relatórios emitidos.

---

## 1. Verificação em Windows (PowerShell)

Abra a consola do PowerShell no directório onde extraiu o pacote e execute:

```powershell
# 1. Verificar Plano Geral de Contabilidade (Decreto 82/01 PDF)
Get-FileHash "AETF500_SRC_ACC_PGC_001_Decreto_82_01.pdf" -Algorithm SHA256
Get-FileHash "AETF500_SRC_ACC_PGC_001_Decreto_82_01.pdf" -Algorithm SHA512
(Get-Item "AETF500_SRC_ACC_PGC_001_Decreto_82_01.pdf").Length

# 2. Verificar Regulamento do Código do IVA (Decreto Presidencial 180/19 PDF)
Get-FileHash "AETF500_SRC_VAT_AO_001_DP_180_19.pdf" -Algorithm SHA256
Get-FileHash "AETF500_SRC_VAT_AO_001_DP_180_19.pdf" -Algorithm SHA512
(Get-Item "AETF500_SRC_VAT_AO_001_DP_180_19.pdf").Length

# 3. Verificar Código Fonte TypeScript (PGCAccountingEngineV114.ts)
Get-FileHash "AETF500_IMP_PGC_001_PGCAccountingEngineV114.ts" -Algorithm SHA256
Get-FileHash "AETF500_IMP_PGC_001_PGCAccountingEngineV114.ts" -Algorithm SHA512
(Get-Item "AETF500_IMP_PGC_001_PGCAccountingEngineV114.ts").Length
```

---

## 2. Verificação em Linux / macOS (Bash)

Na consola de comandos (terminal Unix), execute:

```bash
# 1. Recalcular digests SHA-256
sha256sum AETF500_SRC_ACC_PGC_001_Decreto_82_01.pdf
sha256sum AETF500_SRC_VAT_AO_001_DP_180_19.pdf
sha256sum AETF500_IMP_PGC_001_PGCAccountingEngineV114.ts

# Ou em macOS (shasum):
shasum -a 256 AETF500_SRC_ACC_PGC_001_Decreto_82_01.pdf
shasum -a 256 AETF500_SRC_VAT_AO_001_DP_180_19.pdf
shasum -a 256 AETF500_IMP_PGC_001_PGCAccountingEngineV114.ts

# 2. Obter tamanho exacto em bytes
wc -c AETF500_SRC_ACC_PGC_001_Decreto_82_01.pdf
wc -c AETF500_SRC_VAT_AO_001_DP_180_19.pdf
wc -c AETF500_IMP_PGC_001_PGCAccountingEngineV114.ts
```

---

## 3. Verificação em Node.js (Cross-Platform)

Pode executar a verificação fisiológica em qualquer sistema operativo executando o seguinte script Node.js directo sem qualquer biblioteca externa:

```javascript
const fs = require('fs');
const crypto = require('crypto');

const files = [
  'AETF500_SRC_ACC_PGC_001_Decreto_82_01.pdf',
  'AETF500_SRC_VAT_AO_001_DP_180_19.pdf',
  'AETF500_IMP_PGC_001_PGCAccountingEngineV114.ts'
];

console.log('--- AUDITORIA DE EVIDÊNCIA FÍSICA E RECOMPUTAÇÃO DIRECTA DE BYTES ---');

files.forEach(fileName => {
  if (!fs.existsSync(fileName)) {
    console.error(`[ERRO] Ficheiro não encontrado: ${fileName}`);
    return;
  }
  const bytes = fs.readFileSync(fileName);
  const size = bytes.length;
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  const sha512 = crypto.createHash('sha512').update(bytes).digest('hex');

  console.log(`\nFicheiro: ${fileName}`);
  console.log(`Tamanho Físico Real: ${size} bytes`);
  console.log(`SHA-256 Recomputado: ${sha256}`);
  console.log(`SHA-512 Recomputado: ${sha512}`);
});
```

---

## 4. Tabela de Valores Esperados de Comparação

| Ficheiro Entregue | Tamanho Esperado | SHA-256 Esperado |
| :--- | ---: | :--- |
| `AETF500_SRC_ACC_PGC_001_Decreto_82_01.pdf` | `5.188.378 bytes` | `4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702` |
| `AETF500_SRC_VAT_AO_001_DP_180_19.pdf` | `1.571.244 bytes` | `131702c8a9e42b5eccd2a41dda75e27ba2fa15d9b0ed89a3f9ac79b3991f9f1c` |
| `AETF500_IMP_PGC_001_PGCAccountingEngineV114.ts` | `284.126 bytes` | `b853bca00239a5b06b1981e8d23315d1e74cfcac3c9c88bb9bbff25fd4335f88` |

Se a verificação recomputada no seu ambiente coincidir a 100% com a tabela acima, a integridade física e proveniência da evidência está formalmente confirmada.

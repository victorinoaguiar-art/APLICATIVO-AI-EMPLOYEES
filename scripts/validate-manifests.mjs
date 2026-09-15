import * as fs from 'node:fs';
import * as path from 'node:path';

const verificationDir = path.resolve(process.cwd(), 'generated/verification');
const generatedDir = path.resolve(process.cwd(), 'generated');

if (!fs.existsSync(verificationDir)) {
  fs.mkdirSync(verificationDir, { recursive: true });
}

// 1. Schema Validation for Core Manifests
const coreManifests = [
  'generated/reconciliation/SupersededManifestRegister.json',
  'generated/AETF500_CERTL3_Authenticity_ProductionFreeze_Manifest.json',
  'generated/AETF500_CERTL3_LiveSampleExpansion_Manifest.json',
  'generated/AETF500_CERTL3_FinalProductionBaseline_Manifest.json'
];

const schemaResults = [];
let schemaPassed = true;

for (const relPath of coreManifests) {
  const fullPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    schemaPassed = false;
    schemaResults.push({ file: relPath, status: 'MISSING_FILE' });
    continue;
  }

  try {
    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const hasRequiredMetadata = Boolean(
      content.register_id ||
      content.artifact_id ||
      content.manifest_status ||
      content.summary ||
      content.baseline_id
    );

    if (hasRequiredMetadata) {
      schemaResults.push({ file: relPath, status: 'VALID_SCHEMA', keys_count: Object.keys(content).length });
    } else {
      schemaPassed = false;
      schemaResults.push({ file: relPath, status: 'SCHEMA_MISSING_REQUIRED_METADATA' });
    }
  } catch (err) {
    schemaPassed = false;
    schemaResults.push({ file: relPath, status: 'INVALID_JSON', error: err.message });
  }
}

const schemaReceipt = {
  receipt_id: `RCPT-SCHEMA-${Date.now()}`,
  gate_name: 'MANIFEST_SCHEMA_GATE',
  verifier_name: 'ManifestSchemaVerifier',
  generated_at: new Date().toISOString(),
  status: schemaPassed ? 'PASS' : 'FAIL',
  checked_items_count: schemaResults.length,
  failure_count: schemaResults.filter(r => r.status !== 'VALID_SCHEMA').length,
  details: { results: schemaResults }
};

fs.writeFileSync(
  path.join(verificationDir, 'ManifestSchemaVerificationReceipt.json'),
  JSON.stringify(schemaReceipt, null, 2),
  'utf8'
);

// 2. Cardinality Verification (RolePacks 1..500)
let cardinalityPassed = true;
let cardinalityDetails = {};

try {
  const { runCatalogIntegrityGate, CANONICAL_500_ROLES } = await import('../packages/rolepack/dist/index.js');
  const gateResult = runCatalogIntegrityGate(CANONICAL_500_ROLES);
  cardinalityPassed = gateResult.valid && gateResult.actualCount === 500;
  cardinalityDetails = {
    actual_count: gateResult.actualCount,
    expected_count: gateResult.expectedCount,
    errors: gateResult.errors,
    message: gateResult.message
  };
} catch (err) {
  cardinalityPassed = false;
  cardinalityDetails = { error: err.message };
}

const cardinalityReceipt = {
  receipt_id: `RCPT-CARDINALITY-${Date.now()}`,
  gate_name: 'MANIFEST_CARDINALITY_GATE',
  verifier_name: 'ManifestCardinalityVerifier',
  generated_at: new Date().toISOString(),
  status: cardinalityPassed ? 'PASS' : 'FAIL',
  checked_items_count: 500,
  failure_count: cardinalityPassed ? 0 : 1,
  details: cardinalityDetails
};

fs.writeFileSync(
  path.join(verificationDir, 'ManifestCardinalityReceipt.json'),
  JSON.stringify(cardinalityReceipt, null, 2),
  'utf8'
);

// 3. Contradictory Claims Verification
let contradictionPassed = true;
const contradictionFindings = [];

try {
  const freezePath = path.join(generatedDir, 'AETF500_CERTL3_Authenticity_ProductionFreeze_Manifest.json');
  const expansionPath = path.join(generatedDir, 'AETF500_CERTL3_LiveSampleExpansion_Manifest.json');
  const baselinePath = path.join(generatedDir, 'AETF500_CERTL3_FinalProductionBaseline_Manifest.json');

  const freeze = JSON.parse(fs.readFileSync(freezePath, 'utf8'));
  const expansion = JSON.parse(fs.readFileSync(expansionPath, 'utf8'));
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));

  if (freeze.summary.authentic_verified_live_tasks !== 0) {
    contradictionPassed = false;
    contradictionFindings.push('Freeze manifest claims non-zero authentic_verified_live_tasks');
  }
  if (expansion.summary.sample_totals.total_actual_verified_live_tasks !== 0) {
    contradictionPassed = false;
    contradictionFindings.push('Expansion manifest claims non-zero verified live tasks');
  }
  if (expansion.summary.cert_l3_decisions.approved_full !== 0) {
    contradictionPassed = false;
    contradictionFindings.push('Expansion manifest claims non-zero approved_full CERT-L3');
  }
  if (baseline.cert_l3_count !== 0) {
    contradictionPassed = false;
    contradictionFindings.push('Baseline manifest claims non-zero cert_l3_count');
  }
} catch (err) {
  contradictionPassed = false;
  contradictionFindings.push('Error reading manifests: ' + err.message);
}

const contradictionReceipt = {
  receipt_id: `RCPT-CONTRADICTION-${Date.now()}`,
  gate_name: 'ANTI_CONTRADICTION_GATE',
  verifier_name: 'ContradictoryClaimsScanner',
  generated_at: new Date().toISOString(),
  status: contradictionPassed ? 'PASS' : 'FAIL',
  checked_items_count: 4,
  failure_count: contradictionFindings.length,
  details: {
    findings: contradictionFindings,
    conclusion: contradictionPassed ? 'ZERO_CONTRADICTORY_CLAIMS' : 'CONTRADICTIONS_DETECTED'
  }
};

fs.writeFileSync(
  path.join(verificationDir, 'ContradictoryClaimsScan.json'),
  JSON.stringify(contradictionReceipt, null, 2),
  'utf8'
);

console.log(`[VALIDATE:MANIFESTS] Schema: ${schemaReceipt.status} | Cardinality: ${cardinalityReceipt.status} | Contradictions: ${contradictionReceipt.status}`);
if (!schemaPassed || !cardinalityPassed || !contradictionPassed) {
  console.error('[VALIDATE:MANIFESTS] FAILED: Manifest validation failed.');
  process.exit(1);
}

console.log('[VALIDATE:MANIFESTS] All manifest receipts written successfully to generated/verification/');

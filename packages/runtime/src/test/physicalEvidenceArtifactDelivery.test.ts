import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AETF500PhysicalEvidenceArtifactDeliveryPackageEngineV10 } from '../commerce/PGCAccountingEngineV114.js';

describe('AETF-500 Physical Evidence Artifact Delivery & Independent Verification Package v1.0', () => {
  const engine = new AETF500PhysicalEvidenceArtifactDeliveryPackageEngineV10();

  it('executes physical evidence artifact delivery package and passes PHYSICAL-EVIDENCE-GATE-01 & GATE-02', () => {
    const result = engine.executePhysicalEvidenceArtifactDeliveryPackageV10();

    assert.equal(result.package_id, 'AETF500_PHYSICAL_EVIDENCE_ARTIFACT_PACKAGE_v1.0');
    assert.equal(result.program_id, 'AETF500_PHYSICAL_EVIDENCE_ARTIFACT_DELIVERY_INDEPENDENT_VERIFICATION_PACKAGE_v1.0');
    assert.equal(result.baseline_id, 'AETF500_SAAS_METRICS_DICTIONARY_v1.1.8_FROZEN');
    assert.equal(result.baseline_mutation_allowed, false);

    assert.equal(result.artifacts_required, 3);
    assert.equal(result.artifacts_found, 3);
    assert.equal(result.artifacts_delivered, 3);

    assert.equal(result.pgc_pdf_delivered, 'AETF500_SRC_ACC_PGC_001_Decreto_82_01.pdf');
    assert.equal(result.pgc_pdf_size, 5188378);
    assert.equal(result.pgc_pdf_sha256, '4b2d92fc7cc13ed25bf7650f885639af0beea53b51dc2161dde51268e422d702');

    assert.equal(result.iva_pdf_delivered, 'AETF500_SRC_VAT_AO_001_DP_180_19.pdf');
    assert.equal(result.iva_pdf_size, 1571244);
    assert.equal(result.iva_pdf_sha256, '131702c8a9e42b5eccd2a41dda75e27ba2fa15d9b0ed89a3f9ac79b3991f9f1c');

    assert.equal(result.pgc_typescript_delivered, 'AETF500_IMP_PGC_001_PGCAccountingEngineV114.ts');
    assert.ok(result.pgc_typescript_size > 0);
    assert.ok(result.pgc_typescript_sha256.length === 64);

    assert.equal(result.byte_identity_with_forensic_files, true);
    assert.equal(result.manifest_created, true);
    assert.equal(result.independent_verification_instructions_created, true);
    assert.equal(result.zip_package_created, true);

    assert.equal(result.physical_evidence_gate_01, 'PASS');
    assert.equal(result.physical_evidence_gate_02, 'PASS');
    assert.equal(result.internal_byte_verification, 'PASS');
    assert.equal(result.independently_recomputable, true);
    assert.equal(result.independent_third_party_recomputation, 'NOT_PERFORMED');
    assert.equal(
      result.final_physical_evidence_status,
      'PHYSICAL_EVIDENCE_COMPLETE_PENDING_THIRD_PARTY_VERIFICATION'
    );
  });

  it('generates valid physical evidence artifact manifest JSON', () => {
    const manifest = engine.getPhysicalEvidenceArtifactManifestV10Json();
    assert.equal(manifest.package_id, 'AETF500_PHYSICAL_EVIDENCE_ARTIFACT_PACKAGE_v1.0');
    assert.equal(manifest.artifacts.length, 3);

    const a1 = manifest.artifacts.find((a) => a.artifact_id === 'SRC-ACC-PGC-001');
    const a2 = manifest.artifacts.find((a) => a.artifact_id === 'SRC-VAT-AO-001');
    const a3 = manifest.artifacts.find((a) => a.artifact_id === 'IMP-PGC-001');

    assert.ok(a1 && a1.file_size_bytes === 5188378 && a1.byte_identity_with_forensic_source);
    assert.ok(a2 && a2.file_size_bytes === 1571244 && a2.byte_identity_with_forensic_source);
    assert.ok(a3 && a3.artifact_type === 'SOFTWARE_IMPLEMENTATION' && a3.byte_identity_with_forensic_source);
  });

  it('generates valid physical evidence delivery receipt JSON', () => {
    const receipt = engine.getPhysicalEvidenceDeliveryReceiptV10Json();
    assert.equal(receipt.package_id, 'AETF500_PHYSICAL_EVIDENCE_ARTIFACT_PACKAGE_v1.0');
    assert.equal(receipt.artifacts_delivered, 3);
    assert.equal(receipt.manifest_included, true);
    assert.equal(receipt.verification_instructions_included, true);
    assert.equal(receipt.delivery_status, 'PHYSICAL_EVIDENCE_COMPLETE_PENDING_THIRD_PARTY_VERIFICATION');
  });
});

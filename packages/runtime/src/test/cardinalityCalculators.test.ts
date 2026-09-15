import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

describe('AETF-500 Pure Cardinality Calculators & Dynamic Physical Truth (P6)', async () => {
  const getRoot = () => {
    const cwd = process.cwd();
    return cwd.endsWith('packages/runtime') || cwd.endsWith('packages\\runtime')
      ? path.resolve(cwd, '../..')
      : cwd;
  };
  const root = getRoot();
  const calcModulePath = path.resolve(root, 'scripts/lib/cardinalityCalculators.mjs');
  const tempDir = path.resolve(root, 'generated/tmp_test_cardinality');

  // Dynamic import of the pure ESM calculator module
  const {
    calculatePhysicalLiveTasks,
    calculateLegallyAuthorizedTenants,
    calculateEligibleCertificationEvidence,
    calculateReadinessRiskDistribution,
    getFileSha256
  } = await import(pathToFileURL(calcModulePath).href);

  // Helper to ensure clean temp test dir
  const ensureTempDir = () => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  };

  const cleanupTempDir = () => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  };

  it('1. EMPTY SOURCE: Non-existent or empty storage produces exactly 0 count and EMPTY_SOURCE status', () => {
    const nonExistentPath = path.join(tempDir, 'non_existent_source.json');
    
    const taskResult = calculatePhysicalLiveTasks(nonExistentPath);
    assert.strictEqual(taskResult.count, 0, 'Live tasks count must be 0 for empty source');
    assert.strictEqual(taskResult.status, 'EMPTY_SOURCE');
    assert.strictEqual(taskResult.sourceHash, null);

    const tenantResult = calculateLegallyAuthorizedTenants(nonExistentPath);
    assert.strictEqual(tenantResult.count, 0, 'Authorized tenants count must be 0 for empty source');
    assert.strictEqual(tenantResult.status, 'EMPTY_SOURCE');

    const evidenceResult = calculateEligibleCertificationEvidence(nonExistentPath);
    assert.strictEqual(evidenceResult.count, 0, 'Eligible evidence count must be 0 for empty source');
    assert.strictEqual(evidenceResult.status, 'EMPTY_SOURCE');
  });

  it('2. VALID PHYSICAL DATA: Inserting 1 valid physical record updates calculated count to 1', () => {
    ensureTempDir();
    try {
      // 2a. Live task with external confirmation and client signature
      const taskFile = path.join(tempDir, 'valid_task.json');
      const validTask = [{
        task_id: 'TSK-LIVE-001',
        client_signature: 'sig_rsa_4096_client_alpha',
        external_system_confirmation: 'TXN-SWIFT-99281726',
        is_demonstration: false,
        is_test: false
      }];
      fs.writeFileSync(taskFile, JSON.stringify(validTask, null, 2));

      const taskResult = calculatePhysicalLiveTasks(taskFile);
      assert.strictEqual(taskResult.count, 1, 'Valid task must yield count 1');
      assert.deepStrictEqual(taskResult.verifiedTasks, ['TSK-LIVE-001']);
      assert.ok(taskResult.sourceHash, 'Hash must be generated');

      // 2b. Tenant with signed legal contract and document hash
      const contractFile = path.join(tempDir, 'valid_contract.json');
      const validContract = [{
        tenant_id: 'TEN-ENT-001',
        status: 'SIGNED_LEGAL_CONTRACT',
        legal_signatory: 'Dr. Maria Santos, CEO',
        contract_document_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      }];
      fs.writeFileSync(contractFile, JSON.stringify(validContract, null, 2));

      const tenantResult = calculateLegallyAuthorizedTenants(contractFile);
      assert.strictEqual(tenantResult.count, 1, 'Valid contract must yield count 1');
      assert.deepStrictEqual(tenantResult.authorizedTenants, ['TEN-ENT-001']);

      // 2c. Third party independent audit
      const auditFile = path.join(tempDir, 'valid_audit.json');
      const validAudit = [{
        audit_id: 'AUD-EXT-2026-01',
        auditor_type: 'INDEPENDENT_THIRD_PARTY',
        verdict: 'CERT_L3_APPROVED',
        auditor_signature: 'sig_cert_board_991'
      }];
      fs.writeFileSync(auditFile, JSON.stringify(validAudit, null, 2));

      const auditResult = calculateEligibleCertificationEvidence(auditFile);
      assert.strictEqual(auditResult.count, 1, 'Valid independent audit must yield count 1');
      assert.deepStrictEqual(auditResult.eligibleAudits, ['AUD-EXT-2026-01']);
    } finally {
      cleanupTempDir();
    }
  });

  it('3. DEDUPLICATION: Duplicate IDs do not inflate count and manifest duplicate IDs trigger rejection', () => {
    ensureTempDir();
    try {
      const taskFile = path.join(tempDir, 'duplicate_tasks.json');
      const duplicateTasks = [
        {
          task_id: 'TSK-LIVE-DUP',
          client_signature: 'sig_1',
          external_system_confirmation: 'ext_1'
        },
        {
          task_id: 'TSK-LIVE-DUP', // duplicate
          client_signature: 'sig_1',
          external_system_confirmation: 'ext_1'
        }
      ];
      fs.writeFileSync(taskFile, JSON.stringify(duplicateTasks, null, 2));
      const taskRes = calculatePhysicalLiveTasks(taskFile);
      assert.strictEqual(taskRes.count, 1, 'Duplicate task must be deduplicated to count 1');

      // Manifest with duplicate employee ID must throw error
      const badManifestFile = path.join(tempDir, 'bad_manifest.json');
      fs.writeFileSync(badManifestFile, JSON.stringify({
        employee_authorization_records: [
          { employee_id: 'EMP-001', risk_class: 'LOW' },
          { employee_id: 'EMP-001', risk_class: 'LOW' } // duplicate ID
        ]
      }));
      assert.throws(() => {
        calculateReadinessRiskDistribution(badManifestFile);
      }, /DUPLICATE_EMPLOYEE_ID_IN_MANIFEST/, 'Duplicate employee ID must be rejected');
    } finally {
      cleanupTempDir();
    }
  });

  it('4. REJECTION OF MOCKS & UNVERIFIED ENTRIES: Demonstrations and receipts without external proof are excluded', () => {
    ensureTempDir();
    try {
      // Tasks without signature or marked demonstration
      const taskFile = path.join(tempDir, 'unverified_tasks.json');
      fs.writeFileSync(taskFile, JSON.stringify([
        { task_id: 'TSK-DEMO-1', is_demonstration: true, client_signature: 'sig', external_system_confirmation: 'conf' },
        { task_id: 'TSK-SIM-2', simulated: true, client_signature: 'sig', external_system_confirmation: 'conf' },
        { task_id: 'TSK-NO-SIG-3', external_system_confirmation: 'conf' },
        { task_id: 'TSK-NO-CONF-4', client_signature: 'sig' }
      ]));
      const taskRes = calculatePhysicalLiveTasks(taskFile);
      assert.strictEqual(taskRes.count, 0, 'All unverified/demo tasks must be excluded');

      // Tenants with DEMONSTRATION authorization
      const contractFile = path.join(tempDir, 'demo_tenants.json');
      fs.writeFileSync(contractFile, JSON.stringify([
        { tenant_id: 'TEN-DEMO-1', authorization_type: 'DEMONSTRATION' },
        { tenant_id: 'TEN-UNSIGNED-2', status: 'PENDING_APPROVAL' }
      ]));
      const tenantRes = calculateLegallyAuthorizedTenants(contractFile);
      assert.strictEqual(tenantRes.count, 0, 'Demonstration tenants must produce 0 authorized count');
      assert.strictEqual(tenantRes.demonstrationCount, 1);

      // Audit with internal receipt
      const auditFile = path.join(tempDir, 'internal_receipts.json');
      fs.writeFileSync(auditFile, JSON.stringify([
        { audit_id: 'AUD-INT-1', is_internal_receipt: true, verdict: 'CERT_L3_APPROVED' },
        { audit_id: 'AUD-INT-2', auditor_type: 'INTERNAL_SELF_ASSESSMENT', verdict: 'CERT_L3_APPROVED' }
      ]));
      const auditRes = calculateEligibleCertificationEvidence(auditFile);
      assert.strictEqual(auditRes.count, 0, 'Internal receipts must never count as external certification');
    } finally {
      cleanupTempDir();
    }
  });

  it('5. DISCREPANCY GATE & CANONICAL MANIFEST TRUTH: Pure calculation over real baseline yields exact 470/30 distribution', () => {
    const canonicalManifestPath = path.resolve(root, 'generated/AETF500_CERTL3_FinalProductionBaseline_Manifest.json');
    assert.strictEqual(fs.existsSync(canonicalManifestPath), true, 'Canonical manifest must exist');

    const result = calculateReadinessRiskDistribution(canonicalManifestPath);
    assert.strictEqual(result.status, 'PASS');
    assert.strictEqual(result.totalEmployees, 500, 'Total employees evaluated must be exactly 500');
    assert.strictEqual(result.uniqueEmployees, 500, 'All 500 employees must have unique IDs');
    assert.strictEqual(result.controlled_pilot_ready_count, 470, 'Controlled pilot ready count must dynamically compute to 470 (Low+Medium+High)');
    assert.strictEqual(result.hitl_mandatory_count, 30, 'HITL mandatory count must dynamically compute to 30 (Critical)');
    assert.strictEqual(result.cert_l3_count, 0, 'CERT-L3 approved count must be 0 until independent third-party evidence arrives');
  });

  it('6. SOURCE ALTERATION INVALIDATION: 1-byte modification in source file alters SHA-256 and invalidates receipt', () => {
    ensureTempDir();
    try {
      const sourceFile = path.join(tempDir, 'source_evidence.json');
      const originalContent = JSON.stringify({ audit_id: 'AUD-VALID-01', auditor_type: 'INDEPENDENT_THIRD_PARTY', verdict: 'CERT_L3_APPROVED', auditor_signature: 'valid_sig' });
      fs.writeFileSync(sourceFile, originalContent);

      const originalHash = getFileSha256(sourceFile);
      assert.ok(originalHash, 'Original hash must be non-null');

      // Tamper 1 byte
      const tamperedContent = originalContent.replace('AUD-VALID-01', 'AUD-VALID-02');
      fs.writeFileSync(sourceFile, tamperedContent);

      const tamperedHash = getFileSha256(sourceFile);
      assert.notStrictEqual(tamperedHash, originalHash, 'Tampered file hash must diverge completely');

      // Receipt validation fails if recorded source hash does not match physical file
      const receiptMatch = (recordedHash: string, physicalFile: string) => {
        const currentHash = getFileSha256(physicalFile);
        return recordedHash === currentHash;
      };

      assert.strictEqual(receiptMatch(originalHash, sourceFile), false, 'Receipt must fail if source file was modified');
    } finally {
      cleanupTempDir();
    }
  });
});

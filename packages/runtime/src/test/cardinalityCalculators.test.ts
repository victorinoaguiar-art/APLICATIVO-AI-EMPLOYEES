import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

describe('AETF-500 Pure Cardinality Calculators & Dynamic Physical Truth (P6 / P3 Micro-Patch)', async () => {
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

  it('1. MISSING SOURCE BLOCKS: Non-existent storage produces MISSING_SOURCE status and blocks gate', () => {
    const nonExistentPath = path.join(tempDir, 'non_existent_source.json');
    
    const taskResult = calculatePhysicalLiveTasks(nonExistentPath);
    assert.strictEqual(taskResult.count, 0);
    assert.strictEqual(taskResult.status, 'MISSING_SOURCE', 'Missing source must return MISSING_SOURCE, not proven zero');
    assert.strictEqual(taskResult.sourceHash, null);

    const tenantResult = calculateLegallyAuthorizedTenants(nonExistentPath);
    assert.strictEqual(tenantResult.count, 0);
    assert.strictEqual(tenantResult.status, 'MISSING_SOURCE');

    const evidenceResult = calculateEligibleCertificationEvidence(nonExistentPath);
    assert.strictEqual(evidenceResult.count, 0);
    assert.strictEqual(evidenceResult.status, 'MISSING_SOURCE');
  });

  it('2. CANONICAL VALID EMPTY SOURCE: Present valid empty structure produces proven zero with OK status', () => {
    ensureTempDir();
    try {
      const emptyTasksFile = path.join(tempDir, 'empty_tasks.json');
      fs.writeFileSync(emptyTasksFile, JSON.stringify({
        $schema: 'https://ai-employee.net/schemas/live-tasks-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'EXTERNAL_CLIENT_PRODUCTION_TASKS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Empty tasks'
        },
        tasks: []
      }));

      const taskResult = calculatePhysicalLiveTasks(emptyTasksFile);
      assert.strictEqual(taskResult.count, 0);
      assert.strictEqual(taskResult.status, 'OK', 'Valid empty file must produce status OK');
      assert.strictEqual(taskResult.isProvenZero, true);
      assert.ok(taskResult.sourceHash, 'Hash must be generated');

      const emptyAuditsFile = path.join(tempDir, 'empty_audits.json');
      fs.writeFileSync(emptyAuditsFile, JSON.stringify({
        $schema: 'https://ai-employee.net/schemas/external-audits-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'INDEPENDENT_THIRD_PARTY_CERT_L3_AUDITS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Empty audits'
        },
        audits: []
      }));

      const auditResult = calculateEligibleCertificationEvidence(emptyAuditsFile);
      assert.strictEqual(auditResult.count, 0);
      assert.strictEqual(auditResult.status, 'OK');
      assert.strictEqual(auditResult.isProvenZero, true);
      assert.ok(auditResult.sourceHash);
    } finally {
      cleanupTempDir();
    }
  });

  it('3. INVALID JSON AND SCHEMA CORRUPTION BLOCKS GATE: Corrupted files produce INVALID_JSON or INVALID_SCHEMA', () => {
    ensureTempDir();
    try {
      const corruptJsonFile = path.join(tempDir, 'corrupt.json');
      fs.writeFileSync(corruptJsonFile, '{"tasks": [ invalid_json_syntax');

      const jsonErrResult = calculatePhysicalLiveTasks(corruptJsonFile);
      assert.strictEqual(jsonErrResult.status, 'INVALID_JSON');
      assert.strictEqual(jsonErrResult.count, 0);

      const invalidSchemaFile = path.join(tempDir, 'bad_schema.json');
      fs.writeFileSync(invalidSchemaFile, JSON.stringify({
        $schema: 'bad',
        // missing metadata and tasks array is an invalid type
        tasks: 'not-an-array'
      }));

      const schemaErrResult = calculatePhysicalLiveTasks(invalidSchemaFile);
      assert.strictEqual(schemaErrResult.status, 'INVALID_SCHEMA');
    } finally {
      cleanupTempDir();
    }
  });

  it('4. VALID PHYSICAL DATA: Inserting 1 valid physical record updates calculated count to 1', () => {
    ensureTempDir();
    try {
      // 4a. Live task with external confirmation and client signature
      const taskFile = path.join(tempDir, 'valid_task.json');
      const validTask = {
        $schema: 'https://ai-employee.net/schemas/live-tasks-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'EXTERNAL_CLIENT_PRODUCTION_TASKS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Valid task test'
        },
        tasks: [{
          task_id: 'TSK-LIVE-001',
          client_signature: 'sig_rsa_4096_client_alpha',
          external_system_confirmation: 'TXN-SWIFT-99281726',
          is_demonstration: false,
          is_test: false
        }]
      };
      fs.writeFileSync(taskFile, JSON.stringify(validTask, null, 2));

      const taskResult = calculatePhysicalLiveTasks(taskFile);
      assert.strictEqual(taskResult.count, 1, 'Valid task must yield count 1');
      assert.deepStrictEqual(taskResult.verifiedTasks, ['TSK-LIVE-001']);
      assert.strictEqual(taskResult.status, 'OK');

      // 4b. Tenant with signed legal contract and document hash
      const contractFile = path.join(tempDir, 'valid_contract.json');
      const validContract = {
        $schema: 'https://ai-employee.net/schemas/legal-contracts-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'TENANT_LEGAL_CONTRACTS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Valid contract test'
        },
        contracts: [{
          tenant_id: 'TEN-ENT-001',
          status: 'SIGNED_LEGAL_CONTRACT',
          legal_signatory: 'Dr. Maria Santos, CEO',
          contract_document_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        }]
      };
      fs.writeFileSync(contractFile, JSON.stringify(validContract, null, 2));

      const tenantResult = calculateLegallyAuthorizedTenants(contractFile);
      assert.strictEqual(tenantResult.count, 1, 'Valid contract must yield count 1');
      assert.deepStrictEqual(tenantResult.authorizedTenants, ['TEN-ENT-001']);
      assert.strictEqual(tenantResult.status, 'OK');

      // 4c. Third party independent audit
      const auditFile = path.join(tempDir, 'valid_audit.json');
      const validAudit = {
        $schema: 'https://ai-employee.net/schemas/external-audits-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'INDEPENDENT_THIRD_PARTY_CERT_L3_AUDITS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Valid audit test'
        },
        audits: [{
          audit_id: 'AUD-EXT-2026-01',
          auditor_type: 'INDEPENDENT_THIRD_PARTY',
          verdict: 'CERT_L3_APPROVED',
          auditor_signature: 'sig_cert_board_991'
        }]
      };
      fs.writeFileSync(auditFile, JSON.stringify(validAudit, null, 2));

      const auditResult = calculateEligibleCertificationEvidence(auditFile);
      assert.strictEqual(auditResult.count, 1, 'Valid independent audit must yield count 1');
      assert.deepStrictEqual(auditResult.eligibleAudits, ['AUD-EXT-2026-01']);
      assert.strictEqual(auditResult.status, 'OK');
    } finally {
      cleanupTempDir();
    }
  });

  it('5. DEDUPLICATION AND REJECTION: Duplicate IDs do not inflate count and manifest duplicates throw error', () => {
    ensureTempDir();
    try {
      const taskFile = path.join(tempDir, 'duplicate_tasks.json');
      const duplicateTasks = {
        $schema: 'https://ai-employee.net/schemas/live-tasks-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'EXTERNAL_CLIENT_PRODUCTION_TASKS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Duplicate tasks test'
        },
        tasks: [
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
        ]
      };
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

  it('6. REJECTION OF MOCKS & DEMONSTRATION CONTRACTS: Separate categories computed accurately', () => {
    ensureTempDir();
    try {
      // Tasks without signature or marked demonstration
      const taskFile = path.join(tempDir, 'unverified_tasks.json');
      fs.writeFileSync(taskFile, JSON.stringify({
        $schema: 'https://ai-employee.net/schemas/live-tasks-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'EXTERNAL_CLIENT_PRODUCTION_TASKS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Unverified tasks test'
        },
        tasks: [
          { task_id: 'TSK-DEMO-1', is_demonstration: true, client_signature: 'sig', external_system_confirmation: 'conf' },
          { task_id: 'TSK-SIM-2', simulated: true, client_signature: 'sig', external_system_confirmation: 'conf' },
          { task_id: 'TSK-NO-SIG-3', external_system_confirmation: 'conf' },
          { task_id: 'TSK-NO-CONF-4', client_signature: 'sig' }
        ]
      }));
      const taskRes = calculatePhysicalLiveTasks(taskFile);
      assert.strictEqual(taskRes.count, 0, 'All unverified/demo tasks must be excluded');

      // Tenants with DEMONSTRATION authorization
      const contractFile = path.join(tempDir, 'demo_tenants.json');
      fs.writeFileSync(contractFile, JSON.stringify({
        $schema: 'https://ai-employee.net/schemas/legal-contracts-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'TENANT_LEGAL_CONTRACTS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Demo tenants test'
        },
        contracts: [
          { tenant_id: 'TEN-DEMO-1', authorization_type: 'DEMONSTRATION', is_pilot_demonstration: true, status: 'PILOT_DEMO' },
          { tenant_id: 'TEN-TECH-2', tenant_type: 'TECHNICAL', status: 'PENDING_APPROVAL' }
        ]
      }));
      const tenantRes = calculateLegallyAuthorizedTenants(contractFile);
      assert.strictEqual(tenantRes.count, 0, 'Demonstration tenants must produce 0 authorized count');
      assert.strictEqual(tenantRes.demonstrationCount, 1);
      assert.strictEqual(tenantRes.technicalTenantsCount, 1);

      // Audit with internal receipt
      const auditFile = path.join(tempDir, 'internal_receipts.json');
      fs.writeFileSync(auditFile, JSON.stringify({
        $schema: 'https://ai-employee.net/schemas/external-audits-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'INDEPENDENT_THIRD_PARTY_CERT_L3_AUDITS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Internal receipts test'
        },
        audits: [
          { audit_id: 'AUD-INT-1', auditor_type: 'INDEPENDENT_THIRD_PARTY', is_internal_receipt: true, verdict: 'CERT_L3_APPROVED', auditor_signature: 'sig' },
          { audit_id: 'AUD-INT-2', auditor_type: 'INTERNAL_SELF_ASSESSMENT', verdict: 'CERT_L3_APPROVED', auditor_signature: 'sig' }
        ]
      }));
      const auditRes = calculateEligibleCertificationEvidence(auditFile);
      assert.strictEqual(auditRes.count, 0, 'Internal receipts must never count as external certification');
      assert.strictEqual(auditRes.internalReceiptsCount, 2);
    } finally {
      cleanupTempDir();
    }
  });

  it('7. CANONICAL MANIFEST AND PHYSICAL BASELINE: Pure calculations match exact production truths', () => {
    const canonicalManifestPath = path.resolve(root, 'generated/AETF500_CERTL3_FinalProductionBaseline_Manifest.json');
    assert.strictEqual(fs.existsSync(canonicalManifestPath), true, 'Canonical manifest must exist');

    const result = calculateReadinessRiskDistribution(canonicalManifestPath);
    assert.strictEqual(result.status, 'PASS');
    assert.strictEqual(result.totalEmployees, 500);
    assert.strictEqual(result.uniqueEmployees, 500);
    assert.strictEqual(result.controlled_pilot_ready_count, 470);
    assert.strictEqual(result.hitl_mandatory_count, 30);
    assert.strictEqual(result.cert_l3_count, 0);

    // Verify actual canonical data files
    const liveTasksPath = path.resolve(root, 'data/live_tasks.json');
    const liveTasks = calculatePhysicalLiveTasks(liveTasksPath);
    assert.strictEqual(liveTasks.status, 'OK');
    assert.strictEqual(liveTasks.count, 0);
    assert.strictEqual(liveTasks.isProvenZero, true);

    const contractsPath = path.resolve(root, 'data/legal_contracts.json');
    const contracts = calculateLegallyAuthorizedTenants(contractsPath);
    assert.strictEqual(contracts.status, 'OK');
    assert.strictEqual(contracts.count, 0);
    assert.strictEqual(contracts.demonstrationCount, 3);

    const auditsPath = path.resolve(root, 'data/external_audits.json');
    const audits = calculateEligibleCertificationEvidence(auditsPath);
    assert.strictEqual(audits.status, 'OK');
    assert.strictEqual(audits.count, 0);
    assert.strictEqual(audits.isProvenZero, true);
  });

  it('8. SOURCE ALTERATION INVALIDATION: 1-byte modification alters hash and invalidates verification', () => {
    ensureTempDir();
    try {
      const sourceFile = path.join(tempDir, 'source_evidence.json');
      const originalContent = JSON.stringify({
        $schema: 'https://ai-employee.net/schemas/external-audits-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'INDEPENDENT_THIRD_PARTY_CERT_L3_AUDITS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Tamper test'
        },
        audits: [{ audit_id: 'AUD-VALID-01', auditor_type: 'INDEPENDENT_THIRD_PARTY', verdict: 'CERT_L3_APPROVED', auditor_signature: 'valid_sig' }]
      });
      fs.writeFileSync(sourceFile, originalContent);

      const originalHash = getFileSha256(sourceFile);
      assert.ok(originalHash, 'Original hash must be non-null');

      // Tamper 1 byte
      const tamperedContent = originalContent.replace('AUD-VALID-01', 'AUD-VALID-02');
      fs.writeFileSync(sourceFile, tamperedContent);

      const tamperedHash = getFileSha256(sourceFile);
      assert.notStrictEqual(tamperedHash, originalHash, 'Tampered file hash must diverge completely');
    } finally {
      cleanupTempDir();
    }
  });
});

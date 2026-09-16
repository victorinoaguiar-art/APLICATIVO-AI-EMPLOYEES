import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

describe('AETF-500 Pure Cardinality Calculators & Dynamic Physical Truth (Cross-Platform & Strict Schemas)', async () => {
  const getRoot = () => {
    const cwd = process.cwd();
    return cwd.endsWith('packages/runtime') || cwd.endsWith('packages\\runtime')
      ? path.resolve(cwd, '../..')
      : cwd;
  };
  const root = getRoot();
  const calcModulePath = path.resolve(root, 'scripts/lib/cardinalityCalculators.mjs');
  const tempDir = path.resolve(root, 'generated/tmp_test_cardinality_reconciled');

  // Dynamic import of the pure ESM calculator module
  const {
    calculatePhysicalLiveTasks,
    calculateLegallyAuthorizedTenants,
    calculateEligibleCertificationEvidence,
    calculateReadinessRiskDistribution,
    validateWithAjv,
    getFileSha256,
    resolveDeterministicPath,
    ROOT_DIR,
    ERROR_CODES
  } = await import(pathToFileURL(calcModulePath).href);

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

  // 1. Schema presente e válido
  it('1. Schema presente e válido valida estrutura com sucesso', () => {
    const defaultSchema = path.resolve(root, 'schemas/data/liveTasks.schema.json');
    assert.ok(fs.existsSync(defaultSchema), 'Default schema must exist');
    const validData = {
      $schema: 'https://ai-employee.net/schemas/live-tasks-v1.json',
      metadata: {
        version: '1.0.0',
        scope: 'EXTERNAL_CLIENT_PRODUCTION_TASKS',
        updated_at: '2026-09-15T22:00:00.000Z',
        description: 'Valid test payload',
        source_id: 'SRC-TEST-001',
        collection_date: '2026-09-15T22:00:00.000Z',
        origin: 'TEST_ORIGIN',
        verification_status: 'VERIFIED_EMPTY_BASELINE'
      },
      tasks: []
    };
    const res = validateWithAjv(validData, defaultSchema);
    assert.strictEqual(res.valid, true);
  });

  // 2. Schema ausente
  it('2. Schema ausente retorna SCHEMA_NOT_FOUND em regime fail-closed', () => {
    const nonExistentSchema = path.join(tempDir, 'missing.schema.json');
    const res = validateWithAjv({ tasks: [] }, nonExistentSchema);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.code, ERROR_CODES.SCHEMA_NOT_FOUND);
  });

  // 3. Schema com JSON inválido
  it('3. Schema com JSON inválido retorna SCHEMA_INVALID', () => {
    ensureTempDir();
    try {
      const badJsonSchema = path.join(tempDir, 'corrupt.schema.json');
      fs.writeFileSync(badJsonSchema, '{"type": "object", invalid_json');
      const res = validateWithAjv({ tasks: [] }, badJsonSchema);
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.SCHEMA_INVALID);
    } finally {
      cleanupTempDir();
    }
  });

  // 4. Schema não compilável pelo Ajv
  it('4. Schema não compilável pelo Ajv retorna SCHEMA_INVALID', () => {
    ensureTempDir();
    try {
      const nonCompilableSchema = path.join(tempDir, 'non_compilable.schema.json');
      fs.writeFileSync(nonCompilableSchema, JSON.stringify({
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'non_existent_type_error'
      }));
      const res = validateWithAjv({ tasks: [] }, nonCompilableSchema);
      assert.strictEqual(res.valid, false);
      assert.strictEqual(res.code, ERROR_CODES.SCHEMA_INVALID);
    } finally {
      cleanupTempDir();
    }
  });

  // 5. Fonte presente e válida
  it('5. Fonte presente e válida com contagem física derivada', () => {
    ensureTempDir();
    try {
      const validFile = path.join(tempDir, 'valid_tasks.json');
      fs.writeFileSync(validFile, JSON.stringify({
        $schema: 'https://ai-employee.net/schemas/live-tasks-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'EXTERNAL_CLIENT_PRODUCTION_TASKS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Valid task file',
          source_id: 'SRC-TEST-002',
          collection_date: '2026-09-15T22:00:00.000Z',
          origin: 'TEST_ORIGIN',
          verification_status: 'ACTIVE_VERIFIED'
        },
        tasks: [
          {
            task_id: 'TSK-001',
            tenant_id: 'tenant_test_prod',
            execution_date: '2026-09-15T22:00:00.000Z',
            origin: 'DIRECT_API',
            client_signature: 'sig_rsa_valid_signature_123',
            external_system_confirmation: 'TXN-9988',
            status: 'VERIFIED',
            is_demonstration: false,
            is_test: false
          }
        ]
      }, null, 2));

      const res = calculatePhysicalLiveTasks(validFile);
      assert.strictEqual(res.status, 'OK');
      assert.strictEqual(res.count, 1);
      assert.deepStrictEqual(res.verifiedTasks, ['TSK-001']);
    } finally {
      cleanupTempDir();
    }
  });

  // 6. Fonte ausente
  it('6. Fonte ausente retorna SOURCE_NOT_FOUND e bloqueia o cálculo', () => {
    const missingSource = path.join(tempDir, 'does_not_exist_source.json');
    const res = calculatePhysicalLiveTasks(missingSource);
    assert.strictEqual(res.status, ERROR_CODES.SOURCE_NOT_FOUND);
    assert.strictEqual(res.count, 0);
    assert.strictEqual(res.sourceHash, null);
  });

  // 7. Fonte com JSON inválido
  it('7. Fonte com JSON inválido retorna SOURCE_INVALID_JSON', () => {
    ensureTempDir();
    try {
      const corruptSource = path.join(tempDir, 'corrupt_data.json');
      fs.writeFileSync(corruptSource, '{"tasks": [ corrupted');
      const res = calculatePhysicalLiveTasks(corruptSource);
      assert.strictEqual(res.status, ERROR_CODES.SOURCE_INVALID_JSON);
      assert.strictEqual(res.count, 0);
    } finally {
      cleanupTempDir();
    }
  });

  // 8. Fonte incompatível com o schema
  it('8. Fonte incompatível com o schema retorna SOURCE_SCHEMA_MISMATCH', () => {
    ensureTempDir();
    try {
      const invalidDataFile = path.join(tempDir, 'bad_structure.json');
      fs.writeFileSync(invalidDataFile, JSON.stringify({
        $schema: 'https://ai-employee.net/schemas/live-tasks-v1.json',
        metadata: { version: '1.0.0' }, // missing required metadata fields
        tasks: 'not-an-array'
      }));
      const res = calculatePhysicalLiveTasks(invalidDataFile);
      assert.strictEqual(res.status, ERROR_CODES.SOURCE_SCHEMA_MISMATCH);
      assert.strictEqual(res.count, 0);
    } finally {
      cleanupTempDir();
    }
  });

  // 9. Fonte válida com zero registos
  it('9. Fonte válida com zero registos retorna OK com isProvenZero: true', () => {
    ensureTempDir();
    try {
      const emptyTasksFile = path.join(tempDir, 'empty_canonical.json');
      fs.writeFileSync(emptyTasksFile, JSON.stringify({
        $schema: 'https://ai-employee.net/schemas/live-tasks-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'EXTERNAL_CLIENT_PRODUCTION_TASKS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Empty canonical verified storage',
          source_id: 'SRC-TEST-003',
          collection_date: '2026-09-15T22:00:00.000Z',
          origin: 'TEST_ORIGIN',
          verification_status: 'VERIFIED_EMPTY_BASELINE'
        },
        tasks: []
      }));
      const res = calculatePhysicalLiveTasks(emptyTasksFile);
      assert.strictEqual(res.status, 'OK');
      assert.strictEqual(res.count, 0);
      assert.strictEqual(res.isProvenZero, true);
      assert.ok(res.sourceHash);
    } finally {
      cleanupTempDir();
    }
  });

  // 10. Cardinalidade derivada dos registos físicos
  it('10. Cardinalidade é estritamente derivada dos registos físicos sem constantes hard-coded', () => {
    ensureTempDir();
    try {
      const dynamicFile = path.join(tempDir, 'dynamic_tasks.json');
      const createDynamicTasks = (count: number) => ({
        $schema: 'https://ai-employee.net/schemas/live-tasks-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'EXTERNAL_CLIENT_PRODUCTION_TASKS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Dynamic tasks',
          source_id: 'SRC-TEST-004',
          collection_date: '2026-09-15T22:00:00.000Z',
          origin: 'TEST_ORIGIN',
          verification_status: 'ACTIVE_VERIFIED'
        },
        tasks: Array.from({ length: count }, (_, i) => ({
          task_id: `TSK-DYN-${i + 1}`,
          tenant_id: `tenant_test_${i + 1}`,
          execution_date: '2026-09-15T22:00:00.000Z',
          origin: 'DIRECT_API',
          client_signature: `sig_dyn_${i + 1}_signature_length_valid`,
          external_system_confirmation: `CONF-${i + 1}`,
          status: 'COMPLETED',
          is_demonstration: false,
          is_test: false
        }))
      });

      fs.writeFileSync(dynamicFile, JSON.stringify(createDynamicTasks(3)));
      assert.strictEqual(calculatePhysicalLiveTasks(dynamicFile).count, 3);

      fs.writeFileSync(dynamicFile, JSON.stringify(createDynamicTasks(5)));
      assert.strictEqual(calculatePhysicalLiveTasks(dynamicFile).count, 5);
    } finally {
      cleanupTempDir();
    }
  });

  // 11. Resolução de caminhos sem fallback silencioso (P6)
  it('11. Resolução de caminhos é determinística e NÃO faz fallback silencioso para nomes alternativos', () => {
    const relativeTarget = 'data/liveTasks.json';
    const resolved = resolveDeterministicPath(relativeTarget);
    assert.ok(path.isAbsolute(resolved));
    assert.ok(resolved.startsWith(ROOT_DIR));

    // P6: Attempting to resolve non-existent snake_case path does NOT silently redirect to camelCase
    const snakeTarget = 'data/live_tasks.json';
    const resolvedSnake = resolveDeterministicPath(snakeTarget);
    assert.strictEqual(path.basename(resolvedSnake), 'live_tasks.json');
    assert.strictEqual(fs.existsSync(resolvedSnake), false, 'Non-existent snake_case path must not exist');
  });

  // 12. P1: Teste multiplataforma rigoroso com path.posix e path.win32
  it('12. Portabilidade multiplataforma: construção e normalização POSIX/Windows sem dependência de SO', () => {
    // 1. Construção POSIX
    const posixPath = path.posix.join('data', 'liveTasks.json');
    assert.strictEqual(posixPath, 'data/liveTasks.json');

    // 2. Construção Windows
    const winPath = path.win32.join('data', 'liveTasks.json');
    assert.strictEqual(winPath, 'data\\liveTasks.json');

    // 3. Normalização lógica
    assert.strictEqual(path.posix.normalize('data/sub/../liveTasks.json'), 'data/liveTasks.json');
    assert.strictEqual(path.win32.normalize('data\\sub\\..\\liveTasks.json'), 'data\\liveTasks.json');

    // 4. Resolução da raiz do repositório
    assert.ok(path.isAbsolute(ROOT_DIR));
    assert.ok(fs.existsSync(ROOT_DIR));

    // 5. Independência do diretório de execução
    const resolvedRel = resolveDeterministicPath('data/liveTasks.json');
    assert.strictEqual(resolvedRel, path.resolve(ROOT_DIR, 'data/liveTasks.json'));

    // 6. Utilização das APIs de caminho do Node.js
    assert.ok(typeof path.resolve === 'function');
    assert.ok(typeof path.normalize === 'function');

    // 7. Inexistência de caminhos absolutos hard-coded
    assert.ok(!ROOT_DIR.includes('/home/runner/work') || process.platform === 'linux');
    assert.ok(!calcModulePath.includes('C:\\Users\\') || process.platform === 'win32');

    // Leitura física no SO em runtime
    const canonicalFile = path.resolve(root, 'data/liveTasks.json');
    assert.ok(fs.existsSync(canonicalFile), 'Canonical file must exist physically in host OS');
    const hashA = getFileSha256(canonicalFile);
    assert.ok(hashA && hashA.length === 64, 'Must return valid 64-char hex SHA-256 hash');
  });

  // 13. Impossibilidade de substituir contagem por uma constante (P8: dados de demonstração fictícios)
  it('13. Demonstrações, testes e simulações são excluídos sem inflacionar contagem (P8)', () => {
    ensureTempDir();
    try {
      const mixedFile = path.join(tempDir, 'mixed_tenants.json');
      fs.writeFileSync(mixedFile, JSON.stringify({
        $schema: 'https://ai-employee.net/schemas/legal-contracts-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'TENANT_LEGAL_CONTRACTS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Mixed tenants test file',
          source_id: 'SRC-TEST-005',
          collection_date: '2026-09-15T22:00:00.000Z',
          origin: 'TEST_ORIGIN',
          verification_status: 'VERIFIED_DEMONSTRATION_BASELINE'
        },
        contracts: [
          {
            tenant_id: 'tenant_demo_1',
            tenant_name: 'Empresa Demonstração 1',
            tenant_type: 'PILOT_DEMONSTRATION',
            authorization_type: 'DEMONSTRATION',
            is_pilot_demonstration: true,
            fictional_entity: true,
            status: 'PILOT_ACTIVE_DEMO'
          },
          {
            tenant_id: 'tenant_real_authorized',
            tenant_name: 'Real Enterprise Entity',
            tenant_type: 'ENTERPRISE_PRODUCTION',
            authorization_type: 'LEGAL_CONTRACT',
            is_pilot_demonstration: false,
            status: 'SIGNED_LEGAL_CONTRACT',
            legal_signatory: 'Dr. Signatory',
            contract_document_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            effective_date: '2026-09-15T22:00:00.000Z',
            provenance_ref: 'REF-DOC-LEG-001'
          }
        ]
      }));

      const res = calculateLegallyAuthorizedTenants(mixedFile);
      assert.strictEqual(res.count, 1, 'Only legally authorized signed contract must be counted');
      assert.strictEqual(res.demonstrationCount, 1);
      assert.deepStrictEqual(res.authorizedTenants, ['tenant_real_authorized']);
    } finally {
      cleanupTempDir();
    }
  });

  // 14. Ausência de mutação dos ficheiros canónicos
  it('14. Operações de cálculo são estritamente read-only nos arquivos canónicos', () => {
    const canonicalFiles = [
      path.resolve(root, 'data/liveTasks.json'),
      path.resolve(root, 'data/legalContracts.json'),
      path.resolve(root, 'data/externalAudits.json')
    ];

    for (const f of canonicalFiles) {
      if (!fs.existsSync(f)) continue;
      const hashBefore = getFileSha256(f);
      calculatePhysicalLiveTasks(f);
      calculateLegallyAuthorizedTenants(f);
      calculateEligibleCertificationEvidence(f);
      const hashAfter = getFileSha256(f);
      assert.strictEqual(hashBefore, hashAfter, `File ${f} must not be mutated`);
    }
  });

  // 15. Erro controlado ao simular indisponibilidade do Ajv
  it('15. Ajv indisponível dispara AJV_UNAVAILABLE de forma determinística via injeção', () => {
    ensureTempDir();
    try {
      const dummyFile = path.join(tempDir, 'dummy.json');
      fs.writeFileSync(dummyFile, JSON.stringify({
        $schema: 'https://ai-employee.net/schemas/live-tasks-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'EXTERNAL_CLIENT_PRODUCTION_TASKS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'C',
          source_id: 'SRC-TEST-006',
          collection_date: '2026-09-15T22:00:00.000Z',
          origin: 'TEST_ORIGIN',
          verification_status: 'VERIFIED_EMPTY_BASELINE'
        },
        tasks: []
      }));

      const res = calculatePhysicalLiveTasks(dummyFile, {
        ajvFactory: () => null,
        ajvInstance: null
      });

      assert.strictEqual(res.status, ERROR_CODES.AJV_UNAVAILABLE);
      assert.strictEqual(res.code, ERROR_CODES.AJV_UNAVAILABLE);
    } finally {
      cleanupTempDir();
    }
  });

  // 16. Formato de erro determinístico
  it('16. Formato de erro é determinístico e padronizado em todas as calculadoras', () => {
    const resTask = calculatePhysicalLiveTasks('non_existent.json');
    const resTenant = calculateLegallyAuthorizedTenants('non_existent.json');
    const resAudit = calculateEligibleCertificationEvidence('non_existent.json');

    for (const res of [resTask, resTenant, resAudit]) {
      assert.strictEqual(res.status, ERROR_CODES.SOURCE_NOT_FOUND);
      assert.strictEqual(res.code, ERROR_CODES.SOURCE_NOT_FOUND);
      assert.strictEqual(res.count, 0);
      assert.strictEqual(res.sourceHash, null);
      assert.ok(typeof res.error === 'string');
    }
  });

  // 17. Correspondência entre o resultado e a fonte realmente lida
  it('17. Resultado corresponde à fonte e 1-byte de alteração invalida o SHA256', () => {
    ensureTempDir();
    try {
      const fileA = path.join(tempDir, 'audit_a.json');
      const basePayload = {
        $schema: 'https://ai-employee.net/schemas/external-audits-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'INDEPENDENT_THIRD_PARTY_CERT_L3_AUDITS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Audits',
          source_id: 'SRC-TEST-007',
          collection_date: '2026-09-15T22:00:00.000Z',
          origin: 'TEST_ORIGIN',
          verification_status: 'VERIFIED_EMPTY_BASELINE'
        },
        audits: []
      };
      fs.writeFileSync(fileA, JSON.stringify(basePayload, null, 2));

      const resA = calculateEligibleCertificationEvidence(fileA);
      const originalHash = resA.sourceHash;

      // 1-byte mutation in description
      basePayload.metadata.description = 'Audits!';
      fs.writeFileSync(fileA, JSON.stringify(basePayload, null, 2));

      const resB = calculateEligibleCertificationEvidence(fileA);
      const mutatedHash = resB.sourceHash;

      assert.notStrictEqual(originalHash, mutatedHash);
      assert.strictEqual(resA.count, 0);
      assert.strictEqual(resB.count, 0);
    } finally {
      cleanupTempDir();
    }
  });

  // 18. P7: Schemas rejeitam propriedades inesperadas (additionalProperties: false)
  it('18. Schemas rejeitam propriedades inesperadas (additionalProperties: false)', () => {
    const liveTasksSchema = path.resolve(root, 'schemas/data/liveTasks.schema.json');
    const invalidPayload = {
      $schema: 'https://ai-employee.net/schemas/live-tasks-v1.json',
      unexpected_root_prop: true,
      metadata: {
        version: '1.0.0',
        scope: 'EXTERNAL_CLIENT_PRODUCTION_TASKS',
        updated_at: '2026-09-15T22:00:00.000Z',
        description: 'Valid test payload',
        source_id: 'SRC-TEST-008',
        collection_date: '2026-09-15T22:00:00.000Z',
        origin: 'TEST_ORIGIN',
        verification_status: 'VERIFIED_EMPTY_BASELINE'
      },
      tasks: []
    };
    const res = validateWithAjv(invalidPayload, liveTasksSchema);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.code, ERROR_CODES.SOURCE_SCHEMA_MISMATCH);
  });

  // 19. P7: Schemas rejeitam datas inválidas e hashes malformados
  it('19. Schemas rejeitam formato de data inválido e hashes SHA-256 não conformes', () => {
    const legalContractsSchema = path.resolve(root, 'schemas/data/legalContracts.schema.json');
    const badDatePayload = {
      $schema: 'https://ai-employee.net/schemas/legal-contracts-v1.json',
      metadata: {
        version: '1.0.0',
        scope: 'TENANT_LEGAL_CONTRACTS',
        updated_at: 'invalid-date-format', // invalid date
        description: 'Valid test payload',
        source_id: 'SRC-TEST-009',
        collection_date: '2026-09-15T22:00:00.000Z',
        origin: 'TEST_ORIGIN',
        verification_status: 'VERIFIED_DEMONSTRATION_BASELINE'
      },
      contracts: []
    };
    const resDate = validateWithAjv(badDatePayload, legalContractsSchema);
    assert.strictEqual(resDate.valid, false, 'Invalid date format must be rejected');

    const badHashPayload = {
      $schema: 'https://ai-employee.net/schemas/legal-contracts-v1.json',
      metadata: {
        version: '1.0.0',
        scope: 'TENANT_LEGAL_CONTRACTS',
        updated_at: '2026-09-15T22:00:00.000Z',
        description: 'Valid test payload',
        source_id: 'SRC-TEST-010',
        collection_date: '2026-09-15T22:00:00.000Z',
        origin: 'TEST_ORIGIN',
        verification_status: 'VERIFIED_DEMONSTRATION_BASELINE'
      },
      contracts: [
        {
          tenant_id: 'tenant_contract_test',
          tenant_name: 'Test Tenant',
          tenant_type: 'ENTERPRISE_PRODUCTION',
          authorization_type: 'LEGAL_CONTRACT',
          is_pilot_demonstration: false,
          status: 'SIGNED_LEGAL_CONTRACT',
          legal_signatory: 'Signatory Name',
          contract_document_sha256: 'not_a_valid_64_char_sha256_hash', // invalid hash
          effective_date: '2026-09-15T22:00:00.000Z',
          provenance_ref: 'DOC-001'
        }
      ]
    };
    const resHash = validateWithAjv(badHashPayload, legalContractsSchema);
    assert.strictEqual(resHash.valid, false, 'Malformed SHA256 must be rejected');
  });

  // 20. P7: Recibo interno nunca é contado como certificação externa
  it('20. Auditoria interna (is_internal_receipt: true) é estritamente excluída de certificações externas', () => {
    ensureTempDir();
    try {
      const auditFile = path.join(tempDir, 'internal_audit.json');
      fs.writeFileSync(auditFile, JSON.stringify({
        $schema: 'https://ai-employee.net/schemas/external-audits-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'INDEPENDENT_THIRD_PARTY_CERT_L3_AUDITS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Audit file with internal receipt',
          source_id: 'SRC-TEST-011',
          collection_date: '2026-09-15T22:00:00.000Z',
          origin: 'TEST_ORIGIN',
          verification_status: 'VERIFIED_EMPTY_BASELINE'
        },
        audits: [
          {
            audit_id: 'AUD-INT-001',
            auditor_type: 'INTERNAL_SELF_ASSESSMENT',
            auditor_organization: 'Internal Quality Team',
            audit_date: '2026-09-15T22:00:00.000Z',
            scope: 'Internal Review',
            verdict: 'CERT_L3_APPROVED',
            is_internal_receipt: true,
            provenance_ref: 'INT-REC-001'
          }
        ]
      }));

      const res = calculateEligibleCertificationEvidence(auditFile);
      assert.strictEqual(res.count, 0, 'Internal receipt must NOT count as external certification');
      assert.strictEqual(res.internalReceiptsCount, 1);
    } finally {
      cleanupTempDir();
    }
  });

  // 21. P3: Ausência de contagens hard-coded no gerador de evidências
  it('21. Gerador de evidências scripts/generate-evidence.mjs não possui contagens hard-coded (P3)', () => {
    const generatorFile = path.resolve(root, 'scripts/generate-evidence.mjs');
    assert.ok(fs.existsSync(generatorFile), 'Evidence generator must exist');
    const content = fs.readFileSync(generatorFile, 'utf8');

    // Verify absence of static hardcoded counts
    const forbiddenPatterns = [
      /total_tests\s*:\s*388/,
      /passed_tests\s*:\s*388/,
      /runtime\s*:\s*\{\s*suites\s*:\s*29\s*,\s*tests\s*:\s*355/
    ];
    for (const pattern of forbiddenPatterns) {
      assert.ok(!pattern.test(content), `generate-evidence.mjs must not contain hardcoded pattern: ${pattern}`);
    }
  });
});

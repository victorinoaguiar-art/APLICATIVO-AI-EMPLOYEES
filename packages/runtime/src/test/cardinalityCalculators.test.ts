import { describe, it } from 'node:test';
import assert from 'node:assert';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';

describe('AETF-500 Pure Cardinality Calculators & Dynamic Physical Truth (Patch Correctivo 17 Cenários)', async () => {
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
        description: 'Valid test payload'
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
          description: 'Valid task file'
        },
        tasks: [
          {
            task_id: 'TSK-001',
            client_signature: 'sig_rsa_valid',
            external_system_confirmation: 'TXN-9988',
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
          description: 'Empty canonical verified storage'
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
          description: 'Dynamic tasks'
        },
        tasks: Array.from({ length: count }, (_, i) => ({
          task_id: `TSK-DYN-${i + 1}`,
          client_signature: `sig_dyn_${i + 1}`,
          external_system_confirmation: `CONF-${i + 1}`,
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

  // 11. Execução a partir de outro directório
  it('11. Resolução de caminhos é determinística e independente do working directory', () => {
    const relativeTarget = 'data/liveTasks.json';
    const resolved = resolveDeterministicPath(relativeTarget);
    assert.ok(path.isAbsolute(resolved));
    assert.ok(resolved.startsWith(ROOT_DIR));
  });

  // 12. Caminhos compatíveis com Linux e Windows
  it('12. Caminhos suportam separadores Linux e Windows sem alterar hashing', () => {
    const canonicalFile = path.resolve(root, 'data/liveTasks.json');
    if (fs.existsSync(canonicalFile)) {
      const forwardSlash = canonicalFile.replace(/\\/g, '/');
      const backSlash = canonicalFile.replace(/\//g, '\\');
      assert.strictEqual(getFileSha256(forwardSlash), getFileSha256(backSlash));
    }
  });

  // 13. Impossibilidade de substituir contagem por uma constante
  it('13. Demonstrações, testes e simulações são excluídos sem inflacionar contagem', () => {
    ensureTempDir();
    try {
      const mixedFile = path.join(tempDir, 'mixed_tenants.json');
      fs.writeFileSync(mixedFile, JSON.stringify({
        $schema: 'https://ai-employee.net/schemas/legal-contracts-v1.json',
        metadata: {
          version: '1.0.0',
          scope: 'TENANT_LEGAL_CONTRACTS',
          updated_at: '2026-09-15T22:00:00.000Z',
          description: 'Mixed tenants'
        },
        contracts: [
          {
            tenant_id: 'tenant_demo_1',
            authorization_type: 'DEMONSTRATION',
            is_pilot_demonstration: true,
            status: 'PILOT_ACTIVE_DEMO'
          },
          {
            tenant_id: 'tenant_real_authorized',
            tenant_name: 'Real Enterprise',
            status: 'SIGNED_LEGAL_CONTRACT',
            legal_signatory: 'CEO',
            contract_document_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
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
        metadata: { version: '1.0', scope: 'A', updated_at: 'B', description: 'C' },
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
          description: 'Audits'
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
});

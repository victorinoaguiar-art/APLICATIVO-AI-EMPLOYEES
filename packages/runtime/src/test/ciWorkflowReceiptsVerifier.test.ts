import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  verifyWorkflowReceipts,
  validateSingleWorkflowReceipt,
  REQUIRED_WORKFLOW_FILES,
  REQUIRED_REPOSITORY
} from '../pilot/CIWorkflowReceiptsVerifier.js';

function createValidReceipt(overrides: Record<string, any> = {}): any {
  const runId = overrides.id || 12345678;
  const sha = overrides.head_sha || '0123456789abcdef0123456789abcdef01234567';
  return {
    id: runId,
    name: 'CI / Production Readiness & Audit Gate',
    repository: {
      full_name: REQUIRED_REPOSITORY
    },
    head_sha: sha,
    event: 'push',
    run_attempt: 1,
    status: 'completed',
    conclusion: 'success',
    created_at: '2026-09-18T00:00:00Z',
    run_started_at: '2026-09-18T00:00:01Z',
    updated_at: '2026-09-18T00:05:00Z',
    html_url: `https://github.com/${REQUIRED_REPOSITORY}/actions/runs/${runId}`,
    ...overrides
  };
}

describe('Verificador Read-Only de Recibos de CI dos Workflows (Ponto 4)', () => {
  it('1. validação unitária: recibo válido passa sem erros', () => {
    const r = createValidReceipt();
    const validated = validateSingleWorkflowReceipt(r, 'test.json', r.head_sha);
    assert.strictEqual(validated.id, r.id);
    assert.strictEqual(validated.status, 'completed');
    assert.strictEqual(validated.conclusion, 'success');
  });

  it('2. rejeita repositório diferente do exigido', () => {
    const r = createValidReceipt({ repository: { full_name: 'outro-user/repo' } });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r, 'test.json');
    }, /pertence ao repositório 'outro-user\/repo'/i);
  });

  it('3. rejeita status não completado (ex: in_progress)', () => {
    const r = createValidReceipt({ status: 'in_progress' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r, 'test.json');
    }, /esperado estritamente 'completed'/i);
  });

  it('4. rejeita conclusion diferente de success (ex: failure)', () => {
    const r = createValidReceipt({ conclusion: 'failure' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r, 'test.json');
    }, /esperado estritamente 'success'/i);
  });

  it('5. rejeita ausência de run_attempt ou run_attempt inválido (sem fallback)', () => {
    const r = createValidReceipt();
    delete r.run_attempt;
    assert.throws(() => {
      validateSingleWorkflowReceipt(r, 'test.json');
    }, /Não são permitidos fallbacks/i);
  });

  it('6. rejeita head_sha inválido ou diferente de 40 caracteres hexadecimais', () => {
    const r1 = createValidReceipt({ head_sha: 'invalid_sha' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r1, 'test.json');
    }, /esperado 40 caracteres hexadecimais/i);

    const r2 = createValidReceipt({ head_sha: '1234' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r2, 'test.json');
    }, /esperado 40 caracteres hexadecimais/i);
  });

  it('7. rejeita head_sha divergente do esperado', () => {
    const r = createValidReceipt({ head_sha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r, 'test.json', 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb');
    }, /divergente do esperado/i);
  });

  it('8. rejeita html_url incoerente com o run ID', () => {
    const r = createValidReceipt({ html_url: 'https://github.com/fake/url/999' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r, 'test.json');
    }, /html_url.*incoerente/i);
  });

  it('9. conjunto completo: rejeita directório com ficheiro ausente', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-receipts-test-'));
    try {
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /Recibo obrigatório .* ausente/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('10. conjunto completo: rejeita quando um dos workflows possui head_sha divergente', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-receipts-test-'));
    try {
      const sha1 = '1111111111111111111111111111111111111111';
      const sha2 = '2222222222222222222222222222222222222222';

      fs.writeFileSync(path.join(tmpDir, REQUIRED_WORKFLOW_FILES[0]), JSON.stringify(createValidReceipt({ id: 1, head_sha: sha1 })));
      fs.writeFileSync(path.join(tmpDir, REQUIRED_WORKFLOW_FILES[1]), JSON.stringify(createValidReceipt({ id: 2, head_sha: sha1 })));
      fs.writeFileSync(path.join(tmpDir, REQUIRED_WORKFLOW_FILES[2]), JSON.stringify(createValidReceipt({ id: 3, head_sha: sha2 })));

      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /Divergência de head_sha entre workflows/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  it('11. conjunto completo: sucesso absoluto quando os 3 recibos são coerentes no mesmo SHA', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-receipts-test-'));
    try {
      const sha = '3333333333333333333333333333333333333333';
      fs.writeFileSync(path.join(tmpDir, REQUIRED_WORKFLOW_FILES[0]), JSON.stringify(createValidReceipt({ id: 101, head_sha: sha, name: 'CI' })));
      fs.writeFileSync(path.join(tmpDir, REQUIRED_WORKFLOW_FILES[1]), JSON.stringify(createValidReceipt({ id: 102, head_sha: sha, name: 'Remote' })));
      fs.writeFileSync(path.join(tmpDir, REQUIRED_WORKFLOW_FILES[2]), JSON.stringify(createValidReceipt({ id: 103, head_sha: sha, name: 'Forensic' })));

      const res = verifyWorkflowReceipts({ receiptsDir: tmpDir, expectedSha: sha });
      assert.strictEqual(res.verified, true);
      assert.strictEqual(res.commonHeadSha, sha);
      assert.strictEqual(res.workflowCount, 3);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

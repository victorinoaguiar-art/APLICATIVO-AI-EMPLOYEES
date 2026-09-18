import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  verifyWorkflowReceipts,
  validateSingleWorkflowReceipt,
  REQUIRED_WORKFLOW_FILES,
  REQUIRED_REPOSITORY,
  EXPECTED_WORKFLOW_SPEC
} from '../pilot/CIWorkflowReceiptsVerifier.js';

const VALID_TEST_SHA = '0123456789abcdef0123456789abcdef01234567';

function createValidReceiptForFile(filename: string, overrides: Record<string, any> = {}): any {
  const spec = EXPECTED_WORKFLOW_SPEC[filename] || {
    exactName: 'CI / Production Readiness & Audit Gate',
    expectedPath: '.github/workflows/ci.yml'
  };

  const runId = overrides.id || (
    filename === 'workflow-run-ci-readiness.json' ? 10001 :
    filename === 'workflow-run-evidence-remote.json' ? 10002 : 10003
  );

  const sha = overrides.head_sha || VALID_TEST_SHA;

  return {
    id: runId,
    name: overrides.name !== undefined ? overrides.name : spec.exactName,
    path: overrides.path !== undefined ? overrides.path : spec.expectedPath,
    repository: {
      full_name: overrides.repo_name !== undefined ? overrides.repo_name : REQUIRED_REPOSITORY
    },
    head_sha: sha,
    head_branch: overrides.head_branch !== undefined ? overrides.head_branch : 'master',
    event: 'push',
    run_attempt: overrides.run_attempt !== undefined ? overrides.run_attempt : 1,
    status: overrides.status !== undefined ? overrides.status : 'completed',
    conclusion: overrides.conclusion !== undefined ? overrides.conclusion : 'success',
    created_at: '2026-09-18T00:00:00Z',
    run_started_at: '2026-09-18T00:00:01Z',
    updated_at: '2026-09-18T00:05:00Z',
    html_url: overrides.html_url !== undefined ? overrides.html_url : `https://github.com/${REQUIRED_REPOSITORY}/actions/runs/${runId}`,
    ...overrides
  };
}

function setupTempReceiptsDir(sha: string = VALID_TEST_SHA, overridesPerFile: Record<string, Record<string, any>> = {}): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-receipts-test-'));
  for (const filename of REQUIRED_WORKFLOW_FILES) {
    const overrides = overridesPerFile[filename] || {};
    const receipt = createValidReceiptForFile(filename, { head_sha: sha, ...overrides });
    fs.writeFileSync(path.join(tmpDir, filename), JSON.stringify(receipt, null, 2), 'utf8');
  }
  return tmpDir;
}

describe('Verificador Read-Only de Recibos de CI dos Workflows (Ponto 4 & 16 Testes)', () => {
  // Teste 1: Relatório sem final_audited_sha
  it('1. rejeita relatório sem final_audited_sha', () => {
    const tmpDir = setupTempReceiptsDir();
    const reportPath = path.join(tmpDir, 'report.md');
    try {
      fs.writeFileSync(reportPath, '# Relatório\nSem o campo esperado.\n');
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir, reportPath });
      }, /não contém um 'final_audited_sha' válido de 40 caracteres/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste 2: Relatório com placeholder 'A ser gerado', 'PENDING' ou 'UNKNOWN'
  it('2. rejeita relatório com placeholder A ser gerado, PENDING ou UNKNOWN', () => {
    const tmpDir = setupTempReceiptsDir();
    const reportPath = path.join(tmpDir, 'report.md');
    try {
      fs.writeFileSync(reportPath, '# Relatório\nfinal_audited_sha: A ser gerado no commit unificado\n');
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir, reportPath });
      }, /contém placeholder não resolvido para o SHA/i);

      fs.writeFileSync(reportPath, '# Relatório\nfinal_audited_sha: PENDING\n');
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir, reportPath });
      }, /contém placeholder não resolvido para o SHA/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste 3: Relatório com SHA diferente dos recibos
  it('3. rejeita relatório com SHA divergente dos recibos', () => {
    const tmpDir = setupTempReceiptsDir(VALID_TEST_SHA);
    const reportPath = path.join(tmpDir, 'report.md');
    try {
      const divergentSha = '9999999999999999999999999999999999999999';
      fs.writeFileSync(reportPath, `# Relatório\nfinal_audited_sha: ${divergentSha}\n`);
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir, reportPath });
      }, /Divergência entre o SHA do relatório/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste 4: Workflow correto guardado no nome de ficheiro errado
  it('4. rejeita workflow guardado no nome de ficheiro errado', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-receipts-test-'));
    try {
      // Grava dados de Evidence Remote dentro de workflow-run-ci-readiness.json
      const wrongReceipt = createValidReceiptForFile('workflow-run-evidence-remote.json');
      fs.writeFileSync(path.join(tmpDir, 'workflow-run-ci-readiness.json'), JSON.stringify(wrongReceipt));
      fs.writeFileSync(path.join(tmpDir, 'workflow-run-evidence-remote.json'), JSON.stringify(wrongReceipt));
      fs.writeFileSync(path.join(tmpDir, 'workflow-run-final-forensic.json'), JSON.stringify(createValidReceiptForFile('workflow-run-final-forensic.json')));

      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /possui 'name' inválido: esperado estritamente 'CI \/ Production Readiness & Audit Gate'/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste 5: Nome de workflow abreviado ou arbitrário
  it('5. rejeita nome de workflow abreviado ou arbitrário', () => {
    const r1 = createValidReceiptForFile('workflow-run-ci-readiness.json', { name: 'CI' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r1, 'workflow-run-ci-readiness.json');
    }, /possui 'name' inválido: esperado estritamente 'CI \/ Production Readiness & Audit Gate'/i);

    const r2 = createValidReceiptForFile('workflow-run-evidence-remote.json', { name: 'Remote' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r2, 'workflow-run-evidence-remote.json');
    }, /esperado estritamente 'Evidence Remote Verification'/i);
  });

  // Teste 6: Três recibos do mesmo workflow (duplicatas)
  it('6. rejeita três recibos do mesmo workflow ou IDs duplicados', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-receipts-test-'));
    try {
      const ciReceipt = createValidReceiptForFile('workflow-run-ci-readiness.json', { id: 777 });
      fs.writeFileSync(path.join(tmpDir, 'workflow-run-ci-readiness.json'), JSON.stringify(ciReceipt));
      // Força mesmo ID ou dados duplicados nos outros ficheiros manipulando a validação de conjunto
      const remoteWithSameId = createValidReceiptForFile('workflow-run-evidence-remote.json', { id: 777 });
      fs.writeFileSync(path.join(tmpDir, 'workflow-run-evidence-remote.json'), JSON.stringify(remoteWithSameId));
      fs.writeFileSync(path.join(tmpDir, 'workflow-run-final-forensic.json'), JSON.stringify(createValidReceiptForFile('workflow-run-final-forensic.json', { id: 778 })));

      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /Recibos duplicados detectados: os 3 ficheiros devem corresponder a execuções com IDs distintos/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste 7: workflow_id ou path ausente ou inválido
  it('7. rejeita path de workflow ausente ou divergente', () => {
    const r1 = createValidReceiptForFile('workflow-run-ci-readiness.json', { path: '' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r1, 'workflow-run-ci-readiness.json');
    }, /possui 'path' de workflow ausente ou inválido/i);

    const r2 = createValidReceiptForFile('workflow-run-ci-readiness.json', { path: '.github/workflows/other.yml' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r2, 'workflow-run-ci-readiness.json');
    }, /esperado '.github\/workflows\/ci.yml'/i);
  });

  // Teste 8: Branch diferente de master
  it('8. rejeita branch diferente de master', () => {
    const r = createValidReceiptForFile('workflow-run-ci-readiness.json', { head_branch: 'feature/pilot' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r, 'workflow-run-ci-readiness.json');
    }, /possui head_branch 'feature\/pilot', esperado estritamente 'master'/i);
  });

  // Teste 9: Recibo consultado antes de status: completed
  it('9. rejeita recibo consultado com status não completado', () => {
    const r = createValidReceiptForFile('workflow-run-ci-readiness.json', { status: 'in_progress' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r, 'workflow-run-ci-readiness.json');
    }, /possui status 'in_progress', esperado estritamente 'completed'/i);
  });

  // Teste 10: conclusion ausente ou diferente de success
  it('10. rejeita conclusion diferente de success (ex: failure, neutral)', () => {
    const r1 = createValidReceiptForFile('workflow-run-ci-readiness.json', { conclusion: 'failure' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r1, 'workflow-run-ci-readiness.json');
    }, /possui conclusion 'failure', esperado estritamente 'success'/i);

    const r2 = createValidReceiptForFile('workflow-run-ci-readiness.json', { conclusion: null });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r2, 'workflow-run-ci-readiness.json');
    }, /esperado estritamente 'success'/i);
  });

  // Teste 11: Divergência de head_sha entre qualquer par de workflows
  it('11. rejeita divergência de head_sha entre workflows', () => {
    const sha1 = '1111111111111111111111111111111111111111';
    const sha2 = '2222222222222222222222222222222222222222';
    const tmpDir = setupTempReceiptsDir(sha1, {
      'workflow-run-final-forensic.json': { head_sha: sha2 }
    });
    try {
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /Divergência de head_sha entre workflows/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste 12: run_attempt ausente, zero, textual ou inferido
  it('12. rejeita run_attempt ausente, zero, textual ou nulo (sem fallback)', () => {
    const r1 = createValidReceiptForFile('workflow-run-ci-readiness.json');
    delete r1.run_attempt;
    assert.throws(() => {
      validateSingleWorkflowReceipt(r1, 'workflow-run-ci-readiness.json');
    }, /possui 'run_attempt' inválido.*Não são permitidos fallbacks/i);

    const r2 = createValidReceiptForFile('workflow-run-ci-readiness.json', { run_attempt: 0 });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r2, 'workflow-run-ci-readiness.json');
    }, /Não são permitidos fallbacks/i);

    const r3 = createValidReceiptForFile('workflow-run-ci-readiness.json', { run_attempt: '1' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r3, 'workflow-run-ci-readiness.json');
    }, /Não são permitidos fallbacks/i);
  });

  // Teste 13: URL incompatível com repositório ou run ID
  it('13. rejeita html_url incompatível com repositório ou run ID', () => {
    const r1 = createValidReceiptForFile('workflow-run-ci-readiness.json', { id: 10001, html_url: 'https://github.com/outro/repo/actions/runs/10001' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r1, 'workflow-run-ci-readiness.json');
    }, /html_url.*incoerente com o run ID/i);

    const r2 = createValidReceiptForFile('workflow-run-ci-readiness.json', { id: 10001, html_url: `https://github.com/${REQUIRED_REPOSITORY}/actions/runs/99999` });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r2, 'workflow-run-ci-readiness.json');
    }, /html_url.*incoerente com o run ID/i);
  });

  // Teste 14: Ficheiro de recibo não-especificado / nome não reconhecido
  it('14. rejeita ficheiro de recibo não reconhecido na especificação', () => {
    const r = createValidReceiptForFile('workflow-run-ci-readiness.json');
    assert.throws(() => {
      validateSingleWorkflowReceipt(r, 'workflow-run-unknown.json');
    }, /não é um dos 3 ficheiros de workflow esperados/i);
  });

  // Teste 16: Suite do verificador existente, mas ausente do comando oficial do runtime (package.json)
  it('16. teste de regressão: package.json do runtime deve incluir explicitamente ciWorkflowReceiptsVerifier.test.js', () => {
    let pkgPath = path.resolve(process.cwd(), 'packages', 'runtime', 'package.json');
    if (!fs.existsSync(pkgPath)) {
      pkgPath = path.resolve(process.cwd(), 'package.json');
    }
    assert.strictEqual(fs.existsSync(pkgPath), true, 'package.json do runtime deve existir');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    assert.strictEqual(pkg.name, '@ai-employee/runtime', 'Deve ser o package.json de @ai-employee/runtime');
    const testScript = pkg.scripts?.test;
    assert.ok(testScript, 'Script "test" deve existir no package.json de runtime');
    assert.ok(
      testScript.includes('dist/test/ciWorkflowReceiptsVerifier.test.js'),
      `Script "test" de packages/runtime deve incluir explicitamente 'dist/test/ciWorkflowReceiptsVerifier.test.js'. Encontrado: ${testScript}`
    );
  });

  // Teste Positivo Integral: Fixtures de teste isoladas
  it('17. teste positivo integral: 3 recibos válidos com fixtures isoladas passam com sucesso e validam relatório', () => {
    const testSha = 'abcdef0123456789abcdef0123456789abcdef01';
    const tmpDir = setupTempReceiptsDir(testSha);
    const reportPath = path.join(tmpDir, 'final-resolved-report.md');
    try {
      fs.writeFileSync(
        reportPath,
        `# Relatório de Teste Positivo\n**Final Audited SHA (\`final_audited_sha\`):** \`${testSha}\`\n`,
        'utf8'
      );

      const result = verifyWorkflowReceipts({
        receiptsDir: tmpDir,
        expectedSha: testSha,
        reportPath
      });

      assert.strictEqual(result.verified, true);
      assert.strictEqual(result.commonHeadSha, testSha);
      assert.strictEqual(result.workflowCount, 3);
      assert.strictEqual(result.workflows.length, 3);
      for (const wf of result.workflows) {
        assert.strictEqual(wf.head_sha, testSha);
        assert.strictEqual(wf.head_branch, 'master');
        assert.strictEqual(wf.status, 'completed');
        assert.strictEqual(wf.conclusion, 'success');
      }
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});

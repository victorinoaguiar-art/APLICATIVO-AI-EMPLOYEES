import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  verifyWorkflowReceipts,
  validateSingleWorkflowReceipt,
  validateSingleJobsReceipt,
  validateSingleArtifactsReceipt,
  validateRunAttempt,
  REQUIRED_WORKFLOW_FILES,
  REQUIRED_JOB_FILES,
  REQUIRED_ARTIFACT_FILES,
  ALL_NINE_RECEIPT_FILES,
  REQUIRED_REPOSITORY,
  EXPECTED_WORKFLOW_SPEC,
  EXPECTED_JOBS_SPEC,
  EXPECTED_ARTIFACTS_SPEC,
  sha256
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

function createValidJobsForFile(filename: string, runId: number, overrides: Record<string, any> = {}): any {
  const spec = EXPECTED_JOBS_SPEC[filename];
  const requiredNames = spec ? spec.requiredJobNames : ['Sample Job'];

  const jobs = requiredNames.map((name, idx) => ({
    id: 50000 + idx + (filename === 'workflow-jobs-ci-readiness.json' ? 100 : filename === 'workflow-jobs-evidence-remote.json' ? 200 : 300),
    run_id: runId,
    name,
    status: 'completed',
    conclusion: 'success',
    started_at: '2026-09-18T00:00:01Z',
    completed_at: '2026-09-18T00:03:00Z',
    steps: [
      { name: 'Setup', status: 'completed', conclusion: 'success' },
      { name: 'Action', status: 'completed', conclusion: 'success' }
    ]
  }));

  return {
    total_count: jobs.length,
    jobs,
    ...overrides
  };
}

function createValidArtifactsForFile(filename: string, runId: number, sha: string = VALID_TEST_SHA, overrides: Record<string, any> = {}): any {
  const spec = EXPECTED_ARTIFACTS_SPEC[filename];
  const prefix = spec ? spec.requiredArtifactPrefix : 'aetf-sample-';

  const artifacts = [
    {
      id: 70000 + (filename === 'workflow-artifacts-ci-readiness.json' ? 100 : filename === 'workflow-artifacts-evidence-remote.json' ? 200 : 300),
      name: `${prefix}${sha}`,
      size_in_bytes: 4096,
      expired: false,
      workflow_run: {
        id: runId,
        head_sha: sha,
        head_branch: 'master'
      },
      created_at: '2026-09-18T00:04:00Z',
      updated_at: '2026-09-18T00:04:05Z'
    }
  ];

  return {
    total_count: artifacts.length,
    artifacts,
    ...overrides
  };
}

function setupTempReceiptsDir(
  sha: string = VALID_TEST_SHA,
  overridesPerFile: Record<string, Record<string, any>> = {},
  includeAllNine: boolean = false
): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-receipts-test-'));
  const runIds: Record<string, number> = {
    'workflow-run-ci-readiness.json': 10001,
    'workflow-run-evidence-remote.json': 10002,
    'workflow-run-final-forensic.json': 10003
  };

  for (const filename of REQUIRED_WORKFLOW_FILES) {
    const overrides = overridesPerFile[filename] || {};
    const receipt = createValidReceiptForFile(filename, { head_sha: sha, ...overrides });
    fs.writeFileSync(path.join(tmpDir, filename), JSON.stringify(receipt, null, 2), 'utf8');
  }

  if (includeAllNine) {
    // Jobs
    fs.writeFileSync(
      path.join(tmpDir, 'workflow-jobs-ci-readiness.json'),
      JSON.stringify(createValidJobsForFile('workflow-jobs-ci-readiness.json', runIds['workflow-run-ci-readiness.json'], overridesPerFile['workflow-jobs-ci-readiness.json'] || {}), null, 2)
    );
    fs.writeFileSync(
      path.join(tmpDir, 'workflow-jobs-evidence-remote.json'),
      JSON.stringify(createValidJobsForFile('workflow-jobs-evidence-remote.json', runIds['workflow-run-evidence-remote.json'], overridesPerFile['workflow-jobs-evidence-remote.json'] || {}), null, 2)
    );
    fs.writeFileSync(
      path.join(tmpDir, 'workflow-jobs-final-forensic.json'),
      JSON.stringify(createValidJobsForFile('workflow-jobs-final-forensic.json', runIds['workflow-run-final-forensic.json'], overridesPerFile['workflow-jobs-final-forensic.json'] || {}), null, 2)
    );

    // Artifacts
    fs.writeFileSync(
      path.join(tmpDir, 'workflow-artifacts-ci-readiness.json'),
      JSON.stringify(createValidArtifactsForFile('workflow-artifacts-ci-readiness.json', runIds['workflow-run-ci-readiness.json'], sha, overridesPerFile['workflow-artifacts-ci-readiness.json'] || {}), null, 2)
    );
    fs.writeFileSync(
      path.join(tmpDir, 'workflow-artifacts-evidence-remote.json'),
      JSON.stringify(createValidArtifactsForFile('workflow-artifacts-evidence-remote.json', runIds['workflow-run-evidence-remote.json'], sha, overridesPerFile['workflow-artifacts-evidence-remote.json'] || {}), null, 2)
    );
    fs.writeFileSync(
      path.join(tmpDir, 'workflow-artifacts-final-forensic.json'),
      JSON.stringify(createValidArtifactsForFile('workflow-artifacts-final-forensic.json', runIds['workflow-run-final-forensic.json'], sha, overridesPerFile['workflow-artifacts-final-forensic.json'] || {}), null, 2)
    );
  }

  return tmpDir;
}

describe('Verificador Read-Only Expandido: Runs, Jobs, Artefactos e Rigor Forense', () => {
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

  // Teste 2: Relatório com placeholder
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

  // Teste 3: Relatório com SHA divergente dos recibos
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

  // Teste 4: Workflow no ficheiro errado
  it('4. rejeita workflow guardado no nome de ficheiro errado', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-receipts-test-'));
    try {
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

  // Teste 5: Nome abreviado
  it('5. rejeita nome de workflow abreviado ou arbitrário', () => {
    const r1 = createValidReceiptForFile('workflow-run-ci-readiness.json', { name: 'CI' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r1, 'workflow-run-ci-readiness.json');
    }, /possui 'name' inválido: esperado estritamente 'CI \/ Production Readiness & Audit Gate'/i);
  });

  // Teste 6: Duplicatas
  it('6. rejeita três recibos do mesmo workflow ou IDs duplicados', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ci-receipts-test-'));
    try {
      const ciReceipt = createValidReceiptForFile('workflow-run-ci-readiness.json', { id: 777 });
      fs.writeFileSync(path.join(tmpDir, 'workflow-run-ci-readiness.json'), JSON.stringify(ciReceipt));
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

  // Teste 7: path ausente ou divergente
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

  // Teste 9: Status != completed
  it('9. rejeita recibo consultado com status não completado', () => {
    const r = createValidReceiptForFile('workflow-run-ci-readiness.json', { status: 'in_progress' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r, 'workflow-run-ci-readiness.json');
    }, /possui status 'in_progress', esperado estritamente 'completed'/i);
  });

  // Teste 10: Conclusion != success
  it('10. rejeita conclusion diferente de success (ex: failure, neutral)', () => {
    const r1 = createValidReceiptForFile('workflow-run-ci-readiness.json', { conclusion: 'failure' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r1, 'workflow-run-ci-readiness.json');
    }, /possui conclusion 'failure', esperado estritamente 'success'/i);
  });

  // Teste 11: Divergência de SHA entre workflows
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

  // Teste 12: validateRunAttempt fail-closed (Ponto 1)
  it('12. validação estrita de run_attempt sem fallback: rejeita ausente, vazio, zero, negativo, decimal, texto e NaN', () => {
    assert.throws(() => validateRunAttempt(undefined), /é obrigatório e não pode ser nulo ou ausente/i);
    assert.throws(() => validateRunAttempt(null), /é obrigatório e não pode ser nulo ou ausente/i);
    assert.throws(() => validateRunAttempt(''), /não pode ser string vazia/i);
    assert.throws(() => validateRunAttempt('   '), /não pode ser string vazia/i);
    assert.throws(() => validateRunAttempt(0), /deve ser um número inteiro >= 1 sem fallback/i);
    assert.throws(() => validateRunAttempt('0'), /deve ser um número inteiro >= 1 sem fallback/i);
    assert.throws(() => validateRunAttempt(-1), /deve ser um número inteiro >= 1 sem fallback/i);
    assert.throws(() => validateRunAttempt(1.5), /deve ser um número inteiro >= 1 sem fallback/i);
    assert.throws(() => validateRunAttempt('2.7'), /deve ser um número inteiro >= 1 sem fallback/i);
    assert.throws(() => validateRunAttempt('textual'), /deve ser um número inteiro >= 1 sem fallback/i);
    assert.throws(() => validateRunAttempt(NaN), /deve ser um número inteiro >= 1 sem fallback/i);

    // Teste positivo
    assert.strictEqual(validateRunAttempt(1), 1);
    assert.strictEqual(validateRunAttempt('1'), 1);
    assert.strictEqual(validateRunAttempt(42), 42);
    assert.strictEqual(validateRunAttempt('42'), 42);
  });

  // Teste 13: URL incompatível com ID/repo
  it('13. rejeita html_url incompatível com repositório ou run ID', () => {
    const r1 = createValidReceiptForFile('workflow-run-ci-readiness.json', { id: 10001, html_url: 'https://github.com/outro/repo/actions/runs/10001' });
    assert.throws(() => {
      validateSingleWorkflowReceipt(r1, 'workflow-run-ci-readiness.json');
    }, /html_url.*incoerente com o run ID/i);
  });

  // Teste 14: Ficheiro não reconhecido
  it('14. rejeita ficheiro de recibo não reconhecido na especificação', () => {
    const r = createValidReceiptForFile('workflow-run-ci-readiness.json');
    assert.throws(() => {
      validateSingleWorkflowReceipt(r, 'workflow-run-unknown.json');
    }, /não é um dos 3 ficheiros de workflow esperados/i);
  });

  // Teste 15: Causalidade temporal: Rejeita relatório que declare prematuramente o 4º workflow (Ponto 2)
  it('15. rejeita relatório com declaração prematura de conclusão do 4º workflow (FOUR_WORKFLOWS_CONFIRMED)', () => {
    const tmpDir = setupTempReceiptsDir();
    const reportPath = path.join(tmpDir, 'report.md');
    try {
      fs.writeFileSync(
        reportPath,
        `# Relatório\nfinal_audited_sha: ${VALID_TEST_SHA}\nFOUR_WORKFLOWS_CONFIRMED_ON_SAME_SHA\n`
      );
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir, reportPath });
      }, /declaração prematura de conclusão do 4º workflow/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste 16: Regressão package.json
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
      `Script "test" deve incluir explicitamente ciWorkflowReceiptsVerifier.test.js`
    );
  });

  // Teste 17: Regressão do relatório histórico (Ponto 4)
  it('17. teste de conformidade: relatório histórico deve conter aviso formal SUPERSEDED_BY_POST_CLOSURE_ARTIFACT', () => {
    let histPath = path.resolve(process.cwd(), 'AETF500_Relatorio_Micro_Patch_Estrito_SQLite_Proveniencia_Limpeza.md');
    if (!fs.existsSync(histPath)) {
      histPath = path.resolve(process.cwd(), '..', '..', 'AETF500_Relatorio_Micro_Patch_Estrito_SQLite_Proveniencia_Limpeza.md');
    }
    assert.strictEqual(fs.existsSync(histPath), true, 'Relatório histórico deve existir');
    const content = fs.readFileSync(histPath, 'utf8');
    assert.ok(
      content.includes('STATUS: SUPERSEDED_BY_POST_CLOSURE_ARTIFACT'),
      'Relatório histórico deve conter a marca formal STATUS: SUPERSEDED_BY_POST_CLOSURE_ARTIFACT'
    );
  });

  // Teste 18: Validação semântica de jobs: total_count divergente
  it('18. jobs: rejeita total_count divergente da quantidade real de jobs', () => {
    const jobsData = createValidJobsForFile('workflow-jobs-ci-readiness.json', 10001, { total_count: 99 });
    assert.throws(() => {
      validateSingleJobsReceipt(jobsData, 'workflow-jobs-ci-readiness.json', 10001);
    }, /possui total_count \(99\) divergente da contagem de jobs/i);
  });

  // Teste 19: Validação semântica de jobs: job com status in_progress ou conclusion failure
  it('19. jobs: rejeita job com status in_progress ou conclusion failure', () => {
    const jobsData1 = createValidJobsForFile('workflow-jobs-ci-readiness.json', 10001);
    jobsData1.jobs[0].status = 'in_progress';
    assert.throws(() => {
      validateSingleJobsReceipt(jobsData1, 'workflow-jobs-ci-readiness.json', 10001);
    }, /possui status 'in_progress', esperado estritamente 'completed'/i);

    const jobsData2 = createValidJobsForFile('workflow-jobs-ci-readiness.json', 10001);
    jobsData2.jobs[0].conclusion = 'failure';
    assert.throws(() => {
      validateSingleJobsReceipt(jobsData2, 'workflow-jobs-ci-readiness.json', 10001);
    }, /possui conclusion 'failure', esperado estritamente 'success'/i);
  });

  // Teste 20: Validação semântica de jobs: job obrigatório ausente
  it('20. jobs: rejeita resposta que omite job obrigatório', () => {
    const jobsData = createValidJobsForFile('workflow-jobs-ci-readiness.json', 10001);
    // Remove o job 'Deterministic Build, Typecheck, Test & Audit (22.x)'
    jobsData.jobs = [jobsData.jobs[0]];
    jobsData.total_count = 1;
    assert.throws(() => {
      validateSingleJobsReceipt(jobsData, 'workflow-jobs-ci-readiness.json', 10001);
    }, /Job obrigatório 'Deterministic Build, Typecheck, Test & Audit \(22\.x\)' ausente/i);
  });

  // Teste 21: Validação semântica de jobs: timestamps inválidos ou invertidos
  it('21. jobs: rejeita completed_at anterior a started_at', () => {
    const jobsData = createValidJobsForFile('workflow-jobs-ci-readiness.json', 10001);
    jobsData.jobs[0].started_at = '2026-09-18T00:10:00Z';
    jobsData.jobs[0].completed_at = '2026-09-18T00:05:00Z';
    assert.throws(() => {
      validateSingleJobsReceipt(jobsData, 'workflow-jobs-ci-readiness.json', 10001);
    }, /possui completed_at anterior a started_at/i);
  });

  // Teste 22: Validação semântica de jobs: job pertencente a outro run_id
  it('22. jobs: rejeita job com run_id divergente do run esperado', () => {
    const jobsData = createValidJobsForFile('workflow-jobs-ci-readiness.json', 99999);
    assert.throws(() => {
      validateSingleJobsReceipt(jobsData, 'workflow-jobs-ci-readiness.json', 10001);
    }, /pertence a run_id '99999', esperado '10001'/i);
  });

  // Teste 23: Validação semântica de artefactos: total_count divergente
  it('23. artefactos: rejeita total_count divergente do array', () => {
    const artData = createValidArtifactsForFile('workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA, { total_count: 5 });
    assert.throws(() => {
      validateSingleArtifactsReceipt(artData, 'workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    }, /possui total_count \(5\) divergente da contagem/i);
  });

  // Teste 24: Validação semântica de artefactos: artefacto expirado
  it('24. artefactos: rejeita artefacto expirado (expired !== false)', () => {
    const artData = createValidArtifactsForFile('workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    artData.artifacts[0].expired = true;
    assert.throws(() => {
      validateSingleArtifactsReceipt(artData, 'workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    }, /está expirado/i);
  });

  // Teste 25: Validação semântica de artefactos: tamanho zero bytes
  it('25. artefactos: rejeita artefacto com zero bytes', () => {
    const artData = createValidArtifactsForFile('workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    artData.artifacts[0].size_in_bytes = 0;
    assert.throws(() => {
      validateSingleArtifactsReceipt(artData, 'workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    }, /possui tamanho inválido: 0/i);
  });

  // Teste 26: Validação semântica de artefactos: SHA ou branch divergente
  it('26. artefactos: rejeita artefacto associado a outro SHA ou branch', () => {
    const artData1 = createValidArtifactsForFile('workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    artData1.artifacts[0].workflow_run.head_sha = 'ffffffffffffffffffffffffffffffffffffffff';
    assert.throws(() => {
      validateSingleArtifactsReceipt(artData1, 'workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    }, /associado a SHA 'ffff.*', esperado '0123.*/i);

    const artData2 = createValidArtifactsForFile('workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    artData2.artifacts[0].workflow_run.head_branch = 'feature/test';
    assert.throws(() => {
      validateSingleArtifactsReceipt(artData2, 'workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    }, /associado a branch 'feature\/test', esperado 'master'/i);
  });

  // Teste 27: Validação semântica de artefactos: artefacto obrigatório ausente
  it('27. artefactos: rejeita resposta que não contém o artefacto obrigatório do workflow', () => {
    const artData = createValidArtifactsForFile('workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    artData.artifacts[0].name = 'outr-nome-desconhecido';
    assert.throws(() => {
      validateSingleArtifactsReceipt(artData, 'workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    }, /Artefacto obrigatório com prefixo 'aetf-evidence-bundle-' e SHA '.*' ausente/i);
  });

  // Teste 28: Manifesto files.sha256 com divergência de hash físico
  it('28. manifesto files.sha256: rejeita ficheiro com hash físico divergente', () => {
    const tmpDir = setupTempReceiptsDir(VALID_TEST_SHA, {}, true);
    try {
      const manifestPath = path.join(tmpDir, 'files.sha256');
      fs.writeFileSync(manifestPath, `0000000000000000000000000000000000000000000000000000000000000000  workflow-run-ci-readiness.json\n`);
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /Divergência de hash SHA-256 no manifesto para 'workflow-run-ci-readiness.json'/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste 29: Manifesto files.sha256 com ficheiro inexistente
  it('29. manifesto files.sha256: rejeita entrada apontando para ficheiro ausente', () => {
    const tmpDir = setupTempReceiptsDir(VALID_TEST_SHA, {}, true);
    try {
      const manifestPath = path.join(tmpDir, 'files.sha256');
      fs.writeFileSync(manifestPath, `43885f10453bbf9a1bd67022c1ed18c03e0c5a74e42c2eb6a8144aeea3fa3ee3  ficheiro-fantasma.json\n`);
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /Manifesto 'files.sha256' referencia ficheiro inexistente: 'ficheiro-fantasma.json'/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste Positivo Integral: Fixtures de teste isoladas para os 9 ficheiros + relatório + manifesto files.sha256
  it('30. teste positivo integral: 9 recibos físicos válidos com fixtures isoladas passam com 100% de sucesso e validam relatório factual', () => {
    const testSha = 'abcdef0123456789abcdef0123456789abcdef01';
    const tmpDir = setupTempReceiptsDir(testSha, {}, true);
    const reportPath = path.join(tmpDir, 'final-resolved-report.md');
    try {
      fs.writeFileSync(
        reportPath,
        `# Relatório de Teste Positivo\n**Final Audited SHA (\`final_audited_sha\`):** \`${testSha}\`\nTHREE_PRECEDING_WORKFLOWS_VERIFIED — POST_CLOSURE_PACKAGING_EXECUTING_ON_SAME_SHA\n`,
        'utf8'
      );

      // Gerar manifesto files.sha256 para todos os ficheiros criados
      const allFiles = fs.readdirSync(tmpDir).sort();
      const shaLines = allFiles.map(f => `${sha256(fs.readFileSync(path.join(tmpDir, f)))}  ${f}`);
      fs.writeFileSync(path.join(tmpDir, 'files.sha256'), shaLines.join('\n') + '\n', 'utf8');

      const result = verifyWorkflowReceipts({
        receiptsDir: tmpDir,
        expectedSha: testSha,
        reportPath,
        requireNineFiles: true
      });

      assert.strictEqual(result.verified, true);
      assert.strictEqual(result.commonHeadSha, testSha);
      assert.strictEqual(result.workflowCount, 3);
      assert.strictEqual(result.workflows.length, 3);
      assert.strictEqual(result.jobsValidatedCount, 4); // 2 em CI + 1 em Remote + 1 em Final
      assert.strictEqual(result.artifactsValidatedCount, 3); // 1 em cada
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

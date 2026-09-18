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
      { number: 1, name: 'Setup', status: 'completed', conclusion: 'success', started_at: '2026-09-18T00:00:01Z', completed_at: '2026-09-18T00:01:00Z' },
      { number: 2, name: 'Action', status: 'completed', conclusion: 'success', started_at: '2026-09-18T00:01:00Z', completed_at: '2026-09-18T00:03:00Z' }
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
      url: `https://api.github.com/repos/${REQUIRED_REPOSITORY}/actions/artifacts/70000`,
      archive_download_url: `https://api.github.com/repos/${REQUIRED_REPOSITORY}/actions/artifacts/70000/zip`,
      created_at: '2026-09-18T00:04:00Z',
      updated_at: '2026-09-18T00:04:05Z',
      workflow_run: {
        id: runId,
        head_sha: sha,
        head_branch: 'master',
        repository_id: 1363667011,
        head_repository_id: 1363667011
      }
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
  includeAllNine: boolean = true
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

    // Gerar files.sha256 cobrindo os 9 ficheiros
    const allFiles = fs.readdirSync(tmpDir).filter(f => f !== 'files.sha256').sort();
    const shaLines = allFiles.map(f => `${sha256(fs.readFileSync(path.join(tmpDir, f)))}  ${f}`);
    fs.writeFileSync(path.join(tmpDir, 'files.sha256'), shaLines.join('\n') + '\n', 'utf8');
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
      fs.appendFileSync(path.join(tmpDir, 'files.sha256'), `${sha256(fs.readFileSync(reportPath))}  report.md\n`);
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
      fs.appendFileSync(path.join(tmpDir, 'files.sha256'), `${sha256(fs.readFileSync(reportPath))}  report.md\n`);
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir, reportPath });
      }, /contém placeholder não resolvido para o SHA/i);

      fs.writeFileSync(reportPath, '# Relatório\nfinal_audited_sha: PENDING\n');
      // Atualizar o hash de report.md no manifesto
      const lines = fs.readFileSync(path.join(tmpDir, 'files.sha256'), 'utf8').trim().split('\n');
      const filtered = lines.filter(l => !l.endsWith('  report.md'));
      filtered.push(`${sha256(fs.readFileSync(reportPath))}  report.md`);
      fs.writeFileSync(path.join(tmpDir, 'files.sha256'), filtered.join('\n') + '\n', 'utf8');

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
      fs.appendFileSync(path.join(tmpDir, 'files.sha256'), `${sha256(fs.readFileSync(reportPath))}  report.md\n`);
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
        verifyWorkflowReceipts({ receiptsDir: tmpDir, requireNineFiles: false });
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
        verifyWorkflowReceipts({ receiptsDir: tmpDir, requireNineFiles: false });
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
      fs.appendFileSync(path.join(tmpDir, 'files.sha256'), `${sha256(fs.readFileSync(reportPath))}  report.md\n`);
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
    }, /associado a branch 'feature\/test', esperado estritamente 'master'/i);
  });

  // Teste 27: Validação semântica de artefactos: artefacto obrigatório ausente
  it('27. artefactos: rejeita resposta que não contém o artefacto obrigatório do workflow', () => {
    const artData = createValidArtifactsForFile('workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    artData.artifacts[0].name = 'outro-nome-desconhecido';
    assert.throws(() => {
      validateSingleArtifactsReceipt(artData, 'workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    }, /Artefacto obrigatório com prefixo 'aetf-evidence-bundle-' e SHA '.*' ausente/i);
  });

  // Teste 28: Validação semântica de artefactos: workflow_run ausente ou não-objeto
  it('28. artefactos: rejeita artefacto com workflow_run ausente, nulo ou não-objeto', () => {
    const artData1 = createValidArtifactsForFile('workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    delete artData1.artifacts[0].workflow_run;
    assert.throws(() => {
      validateSingleArtifactsReceipt(artData1, 'workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    }, /não possui o objecto obrigatório 'workflow_run'/i);

    const artData2 = createValidArtifactsForFile('workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    artData2.artifacts[0].workflow_run = null;
    assert.throws(() => {
      validateSingleArtifactsReceipt(artData2, 'workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    }, /não possui o objecto obrigatório 'workflow_run'/i);
  });

  // Teste 29: Validação semântica de artefactos: repository_id e head_repository_id inválidos ou divergentes
  it('29. artefactos: rejeita repository_id ou head_repository_id inválidos ou divergentes', () => {
    const artData1 = createValidArtifactsForFile('workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    artData1.artifacts[0].workflow_run.repository_id = -1;
    assert.throws(() => {
      validateSingleArtifactsReceipt(artData1, 'workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    }, /possui 'workflow_run\.repository_id' inválido/i);

    const artData2 = createValidArtifactsForFile('workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    artData2.artifacts[0].workflow_run.head_repository_id = 999999;
    assert.throws(() => {
      validateSingleArtifactsReceipt(artData2, 'workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    }, /divergência entre repository_id/i);
  });

  // Teste 30: Validação semântica de artefactos: updated_at anterior a created_at
  it('30. artefactos: rejeita updated_at anterior a created_at', () => {
    const artData = createValidArtifactsForFile('workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    artData.artifacts[0].created_at = '2026-09-18T00:10:00Z';
    artData.artifacts[0].updated_at = '2026-09-18T00:05:00Z';
    assert.throws(() => {
      validateSingleArtifactsReceipt(artData, 'workflow-artifacts-ci-readiness.json', 10001, VALID_TEST_SHA);
    }, /possui updated_at anterior a created_at/i);
  });

  // Teste 31: Validação semântica de jobs: step com conclusão inválida ou não-sucedida
  it('31. jobs: rejeita step com conclusion failure, cancelled, timed_out, action_required, stale ou null', () => {
    for (const badConclusion of ['failure', 'cancelled', 'timed_out', 'action_required', 'stale', null, 'unknown']) {
      const jobsData = createValidJobsForFile('workflow-jobs-ci-readiness.json', 10001);
      jobsData.jobs[0].steps[0].conclusion = badConclusion;
      assert.throws(() => {
        validateSingleJobsReceipt(jobsData, 'workflow-jobs-ci-readiness.json', 10001);
      }, /possui conclusão inválida ou não-sucedida.*esperado estritamente 'success'/i);
    }
  });

  // Teste 32: Validação semântica de jobs: step com status in_progress ou diferente de completed
  it('32. jobs: rejeita step com status in_progress, queued ou diferente de completed', () => {
    for (const badStatus of ['in_progress', 'queued', 'pending', '']) {
      const jobsData = createValidJobsForFile('workflow-jobs-ci-readiness.json', 10001);
      jobsData.jobs[0].steps[0].status = badStatus;
      assert.throws(() => {
        validateSingleJobsReceipt(jobsData, 'workflow-jobs-ci-readiness.json', 10001);
      }, /possui status '.*', esperado estritamente 'completed'/i);
    }
  });

  // Teste 33: Validação semântica de jobs: job sem array steps ou com steps vazio
  it('33. jobs: rejeita job sem array steps ou com steps vazio', () => {
    const jobsData1 = createValidJobsForFile('workflow-jobs-ci-readiness.json', 10001);
    delete jobsData1.jobs[0].steps;
    assert.throws(() => {
      validateSingleJobsReceipt(jobsData1, 'workflow-jobs-ci-readiness.json', 10001);
    }, /não possui array 'steps' ou steps está vazio/i);

    const jobsData2 = createValidJobsForFile('workflow-jobs-ci-readiness.json', 10001);
    jobsData2.jobs[0].steps = [];
    assert.throws(() => {
      validateSingleJobsReceipt(jobsData2, 'workflow-jobs-ci-readiness.json', 10001);
    }, /não possui array 'steps' ou steps está vazio/i);
  });

  // Teste 34: Validação semântica de jobs: step com number duplicado
  it('34. jobs: rejeita steps com número duplicado', () => {
    const jobsData = createValidJobsForFile('workflow-jobs-ci-readiness.json', 10001);
    jobsData.jobs[0].steps[1].number = jobsData.jobs[0].steps[0].number;
    assert.throws(() => {
      validateSingleJobsReceipt(jobsData, 'workflow-jobs-ci-readiness.json', 10001);
    }, /Passo com número duplicado/i);
  });

  // Teste 35: Obrigatoriedade dos 9 recibos físicos por omissão
  it('35. obrigatoriedade dos 9 recibos: falha imediatamente quando qualquer um dos 9 ficheiros é removido', () => {
    for (const targetFile of ALL_NINE_RECEIPT_FILES) {
      const tmpDir = setupTempReceiptsDir(VALID_TEST_SHA, {}, true);
      try {
        fs.unlinkSync(path.join(tmpDir, targetFile));
        // Recalcular files.sha256 para isolar o teste na ausência do recibo
        const remainingFiles = fs.readdirSync(tmpDir).filter(f => f !== 'files.sha256');
        const shaLines = remainingFiles.map(f => `${sha256(fs.readFileSync(path.join(tmpDir, f)))}  ${f}`);
        fs.writeFileSync(path.join(tmpDir, 'files.sha256'), shaLines.join('\n') + '\n', 'utf8');

        assert.throws(() => {
          verifyWorkflowReceipts({ receiptsDir: tmpDir });
        }, /ausente em/i, `Deveria falhar ao remover ${targetFile}`);
      } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    }
  });

  // Teste 36: Manifesto files.sha256: ficheiro físico adicional não indexado
  it('36. manifesto files.sha256: rejeita ficheiro físico adicional não indexado no manifesto', () => {
    const tmpDir = setupTempReceiptsDir(VALID_TEST_SHA, {}, true);
    try {
      // Criar ficheiro físico adicional órfão
      fs.writeFileSync(path.join(tmpDir, 'ficheiro-adicional-infiltrado.json'), '{"extra": true}', 'utf8');
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /Ficheiro físico adicional 'ficheiro-adicional-infiltrado\.json' no directório não está indexado no manifesto 'files\.sha256'/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste 37: Manifesto files.sha256: rejeita entrada com ficheiro físico inexistente
  it('37. manifesto files.sha256: rejeita entrada apontando para ficheiro físico inexistente', () => {
    const tmpDir = setupTempReceiptsDir(VALID_TEST_SHA, {}, true);
    try {
      fs.appendFileSync(tmpDir + '/files.sha256', `${'0'.repeat(64)}  ficheiro-fantasma.json\n`, 'utf8');
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /Manifesto 'files\.sha256' referencia ficheiro inexistente no directório: 'ficheiro-fantasma\.json'/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste 38: Manifesto files.sha256: rejeita auto-referência a si próprio
  it('38. manifesto files.sha256: rejeita auto-referência a si próprio', () => {
    const tmpDir = setupTempReceiptsDir(VALID_TEST_SHA, {}, true);
    try {
      fs.appendFileSync(tmpDir + '/files.sha256', `${'0'.repeat(64)}  files.sha256\n`, 'utf8');
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /Manifesto 'files\.sha256' não pode conter auto-referência a si próprio/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste 39: Manifesto files.sha256: rejeita caminhos absolutos e travessias ..
  it('39. manifesto files.sha256: rejeita caminhos absolutos e travessias ..', () => {
    const tmpDir = setupTempReceiptsDir(VALID_TEST_SHA, {}, true);
    try {
      fs.appendFileSync(tmpDir + '/files.sha256', `${'0'.repeat(64)}  ../outro.json\n`, 'utf8');
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /travessia de directório '\.\.' não permitida/i);

      fs.writeFileSync(tmpDir + '/files.sha256', `${'0'.repeat(64)}  /etc/passwd\n`, 'utf8');
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /caminho absoluto não permitido/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste 40: Manifesto files.sha256: rejeita entrada duplicada
  it('40. manifesto files.sha256: rejeita entrada duplicada', () => {
    const tmpDir = setupTempReceiptsDir(VALID_TEST_SHA, {}, true);
    try {
      const firstFile = REQUIRED_WORKFLOW_FILES[0];
      fs.appendFileSync(tmpDir + '/files.sha256', `${'0'.repeat(64)}  ${firstFile}\n`, 'utf8');
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /Entrada duplicada para '.*' detectada em 'files\.sha256'/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste 41: Manifesto files.sha256: rejeita divergência de hash físico
  it('41. manifesto files.sha256: rejeita ficheiro com hash físico divergente', () => {
    const tmpDir = setupTempReceiptsDir(VALID_TEST_SHA, {}, true);
    try {
      const manifestPath = path.join(tmpDir, 'files.sha256');
      const lines = fs.readFileSync(manifestPath, 'utf8').trim().split('\n');
      const tamperedLines = lines.map(line => {
        if (line.includes('workflow-run-ci-readiness.json')) {
          return `${'0'.repeat(64)}  workflow-run-ci-readiness.json`;
        }
        return line;
      });
      fs.writeFileSync(manifestPath, tamperedLines.join('\n') + '\n', 'utf8');
      assert.throws(() => {
        verifyWorkflowReceipts({ receiptsDir: tmpDir });
      }, /Divergência de hash SHA-256 no manifesto/i);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  // Teste Positivo Integral: Fixtures de teste isoladas para os 12 ficheiros do pacote de fecho + files.sha256
  it('42. teste positivo integral: pacote de fecho com 12 ficheiros válidos + manifesto bidirecional passa com 100% de sucesso', () => {
    const testSha = 'abcdef0123456789abcdef0123456789abcdef01';
    const tmpDir = setupTempReceiptsDir(testSha, {}, true);
    const reportPath = path.join(tmpDir, 'final-resolved-report.md');
    try {
      fs.writeFileSync(
        reportPath,
        `# Relatório de Teste Positivo\n**Final Audited SHA (\`final_audited_sha\`):** \`${testSha}\`\nTHREE_PRECEDING_WORKFLOWS_VERIFIED — POST_CLOSURE_PACKAGING_EXECUTING_ON_SAME_SHA\n`,
        'utf8'
      );

      // Adicionar os ficheiros restantes do pacote de fecho
      fs.writeFileSync(
        path.join(tmpDir, 'closure-verification-result.json'),
        JSON.stringify({ status: 'PACKAGING_IN_PROGRESS', final_audited_sha: testSha }, null, 2),
        'utf8'
      );
      fs.writeFileSync(
        path.join(tmpDir, 'requirement-test-evidence-sha-matrix.json'),
        JSON.stringify({ requirements: [{ id: 'REQ-1', result: 'PASS' }] }, null, 2),
        'utf8'
      );

      // Gerar manifesto files.sha256 para todos os 12 ficheiros
      const allFiles = fs.readdirSync(tmpDir).filter(f => f !== 'files.sha256').sort();
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

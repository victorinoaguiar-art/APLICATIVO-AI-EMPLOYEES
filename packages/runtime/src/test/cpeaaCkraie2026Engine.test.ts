import test from 'node:test';
import assert from 'node:assert/strict';
import { CPEAAEngine } from '../cpeaa/CPEAAEngine.js';
import { CKRAIE2026Engine } from '../ckraie/CKRAIE2026Engine.js';

test('CPEAA & CKRAIE-2026 — Client Policy Alignment & Approval Intelligence Test Suite', async (t) => {
  const cpeaa = CPEAAEngine.getInstance();
  const ckraie2026 = CKRAIE2026Engine.getInstance();

  await t.test('1. Client Document Onboarding & Rule Extraction (CPEAA)', () => {
    const result = cpeaa.uploadClientDocument({
      tenantId: 'tenant_acme',
      title: 'Manual Interno de Compras e Contratação ACME 2026',
      documentType: 'PROCUREMENT_POLICY',
      department: 'Compras',
      confidentialityLevel: 'INTERNAL',
      rawTextContent: 'Compras acima de 2.000.000 AOA devem ter 3 cotações. Compras acima de 10.000.000 AOA exigem aprovação da Direção.',
      approvedBy: 'director_geral@acme.co.ao',
      applicableEmployees: ['102', '050', '001']
    });

    assert.ok(result.document.document_id);
    assert.equal(result.document.tenant_id, 'tenant_acme');
    assert.ok(result.extractedRules.length >= 2);

    const r1 = result.extractedRules.find((r) => r.threshold === 2000000);
    assert.ok(r1);
    assert.equal(r1.currency, 'AOA');
    assert.equal(r1.approval_level, 'DEPARTMENT_HEAD');

    const r2 = result.extractedRules.find((r) => r.threshold === 10000000);
    assert.ok(r2);
    assert.equal(r2.approval_level, 'BOARD_APPROVAL');
  });

  await t.test('2. Multi-Tenant Context Retrieval & Multi-Tenant Isolation (CPEAA)', () => {
    const acmeContext = cpeaa.retrieveClientContext('tenant_acme', '102', 'Consulta compras', 'INTERNAL');
    assert.ok(acmeContext.activeRules.length > 0);
    for (const r of acmeContext.activeRules) {
      assert.equal(r.tenant_id, 'tenant_acme');
    }
  });

  await t.test('3. Policy Conflict Detection (CPEAA)', () => {
    const conflictResult = cpeaa.uploadClientDocument({
      tenantId: 'tenant_conflict',
      title: 'Regulamento de Benefícios Fiscais Interno',
      documentType: 'TAX_POLICY',
      department: 'Finanças',
      confidentialityLevel: 'CONFIDENTIAL',
      rawTextContent: 'É concedida isenção total de imposto de IRT sobre todos os pagamentos da empresa.',
      approvedBy: 'director_financas@conflict.co.ao'
    });

    const conflicts = cpeaa.listConflicts('tenant_conflict');
    assert.ok(conflicts.length > 0);
    assert.equal(conflicts[0].conflict_type, 'POLICY_CONFLICT_DETECTED');
    assert.equal(conflicts[0].superior_level, 'LAW_REGULATION');
    assert.equal(conflicts[0].inferior_level, 'INTERNAL_POLICY');
  });

  await t.test('4. Explainable Decision Trace Generation (CPEAA)', () => {
    const docs = cpeaa.listDocuments('tenant_acme');
    assert.ok(docs.length > 0);

    const trace = cpeaa.generateDecisionTrace({
      tenantId: 'tenant_acme',
      employeeId: '102',
      query: 'Posso aprovar compra de 5.000.000 AOA sem cotação?',
      decisionSummary: 'Rejeitado: Compras acima de 2.000.000 AOA exigem obrigatoriamente 3 cotações de acordo com a política interna.',
      appliedPolicyId: docs[0].document_id,
      appliedClause: 'Cláusula 4.1 - Exigência de 3 Cotações'
    });

    assert.ok(trace.decision_id);
    assert.ok(trace.hash);
    assert.equal(trace.legal_precedence_verified, true);
  });

  await t.test('5. Regulatory Change Card & Approval Card Generation (CKRAIE-2026)', () => {
    const result = ckraie2026.createRegulatoryChangeCard({
      source: 'BNA - Banco Nacional de Angola',
      authority: 'BNA',
      title: 'Aviso N.º 12/26 - Limites de Transferências Internacionais',
      jurisdiction: 'AO',
      domain: 'Banca e Operações Cambiais',
      publicationDate: '2026-09-10',
      effectiveDate: '2026-10-01',
      oldRule: 'Limite de transferência sem aprovação prévia de 5.000 USD',
      newRule: 'Limite de transferência reduzido para 2.500 USD com validação documental',
      semanticDifference: 'Redução do montante máximo de transferência cambial sem parecer do Compliance',
      severity: 'CRITICAL'
    });

    assert.ok(result.changeCard.change_id);
    assert.equal(result.changeCard.approval_mode, 'DUAL_APPROVAL_REQUIRED');
    assert.equal(result.approvalCard.dual_approval_required, true);
    assert.equal(result.testSuite.all_passed, true);
  });

  await t.test('6. Segregation of Duties & Dual Approval Pipeline (CKRAIE-2026)', () => {
    const changes = ckraie2026.listChangeCards();
    const criticalChange = changes.find((c) => c.severity === 'CRITICAL');
    assert.ok(criticalChange);

    // Approver 1 (Tax Manager)
    const dual1 = ckraie2026.approveByApprover1(
      criticalChange.change_id,
      'tax_manager@minfin.gov.ao',
      'TAX_MANAGER'
    );

    assert.equal(dual1.status, 'PENDING_APPROVER_2');

    // Attempting same email for Approver 2 must throw Segregation of Duties Error
    assert.throws(() => {
      ckraie2026.approveByApprover2(
        criticalChange.change_id,
        'tax_manager@minfin.gov.ao',
        'LEGAL_REVIEWER'
      );
    }, /Segregação de Funções Violada/);

    // Approver 2 (Legal Reviewer - Different Email)
    const dual2 = ckraie2026.approveByApprover2(
      criticalChange.change_id,
      'legal_reviewer@minfin.gov.ao',
      'LEGAL_REVIEWER'
    );

    assert.equal(dual2.status, 'APPROVED');
  });

  await t.test('7. 1-Click Secure Approval Validator (CKRAIE-2026)', () => {
    const changes = ckraie2026.listChangeCards();
    const changeId = changes[0].change_id;

    const event = ckraie2026.execute1ClickApproval(
      changeId,
      'director_compliance@empresa.co.ao',
      'COMPLIANCE_MANAGER'
    );

    assert.ok(event.event_id);
    assert.ok(event.hash);
    assert.equal(event.source_verified, true);
    assert.equal(event.tests_passed, true);
  });

  await t.test('8. Cross-Engine Trigger (CKRAIE-2026 -> CPEAA)', () => {
    const reviews = ckraie2026.listCrossEngineReviews();
    assert.ok(reviews.length > 0);
    assert.equal(reviews[0].status, 'POLICY_REVIEW_REQUIRED');

    const cpeaaConflicts = cpeaa.listConflicts('tenant_default');
    assert.ok(cpeaaConflicts.length > 0);
  });
});

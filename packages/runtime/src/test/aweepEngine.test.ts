import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AWEEPEngine } from '../aweep/AWEEPEngine.js';

describe('AWEEPEngine — Enterprise Extension Pack Tests', () => {
  const aweep = AWEEPEngine.getInstance();

  it('1. Multi-Client Portal: Should fetch firm account and client relationships', () => {
    const firm = aweep.getFirmAccount('firm-contabilidade-luanda');
    assert.ok(firm);
    assert.equal(firm.legal_name, 'Luanda Audit & Financial Consulting, Lda');
    assert.equal(firm.partner_status, 'ACTIVE');

    const clients = aweep.getFirmClients('firm-contabilidade-luanda');
    assert.ok(clients.length > 0);
    assert.equal(clients[0].organization_id, 'org-empresa-demonstracao');
  });

  it('2. Multi-Client Portal: Should switch workspace context safely', () => {
    const ctx = aweep.switchClientWorkspace('firm-contabilidade-luanda', 'org-empresa-demonstracao', 'gestor@luanda-audit.co.ao');
    assert.equal(ctx.active_organization_id, 'org-empresa-demonstracao');
    assert.equal(ctx.user_role, 'CLIENT_MANAGER');
  });

  it('3. No-Code Workflow Builder: Should fetch and validate workflow', () => {
    const wfs = aweep.getWorkflows('org-empresa-demonstracao');
    assert.ok(wfs.length > 0);

    const validation = aweep.validateAndActivateWorkflow(wfs[0].workflow_id);
    assert.equal(validation.valid, true);
    assert.equal(validation.warnings.length, 0);
  });

  it('4. AI Team Orchestrator: Should execute multi-agent team task with handoffs', () => {
    const teams = aweep.getAITeams('org-empresa-demonstracao');
    assert.ok(teams.length > 0);

    const handoffs = aweep.executeAITeamTask(teams[0].team_id, { invoice_number: 'INV-2026-9081', total_usd: 4500 });
    assert.ok(handoffs.length > 0);
    assert.equal(handoffs[0].status, 'ACCEPTED');
  });

  it('5. Enterprise Search RAG: Should perform query and return citations', () => {
    const queryResult = aweep.executeEnterpriseSearch('org-empresa-demonstracao', 'auditor@empresa.co.ao', 'Qual a retenção de IVA em faturas acima de $1.000 USD?');
    assert.ok(queryResult.results.length > 0);
    assert.equal(queryResult.results[0].security_clearance_passed, true);
    assert.ok(queryResult.generated_answer.includes('1.000 USD'));
  });

  it('6. Compliance Evidence Vault: Should record and audit immutable evidence', () => {
    const ev = aweep.recordEvidence({
      organization_id: 'org-empresa-demonstracao',
      employee_id: '50',
      task_id: 'task-check-001',
      evidence_type: 'PAYROLL_RECEIPT',
      file_hash_sha256: 'a1b2c3d4e5f678901234567890abcdef',
      signed_by: 'Chefe_Recursos_Humanos',
      storage_location: 's3://evidence-vault-luanda/payroll/receipt_001.pdf'
    });
    assert.ok(ev.evidence_id);
    assert.equal(ev.immutable_lock, true);

    const audit = aweep.auditVaultIntegrity('org-empresa-demonstracao', 'auditor.senior@agt.minfin.gov.ao');
    assert.equal(audit.integrity_status, 'VERIFIED_100_PERCENT');
    assert.ok(audit.records_verified >= 2);
  });

  it('7. SCIM Identity Lifecycle: Should process Joiner-Mover-Leaver event', () => {
    const scimEv = aweep.triggerSCIMEvent('org-empresa-demonstracao', 'novo.colaborador@empresa.co.ao', 'USER_JOINED');
    assert.equal(scimEv.scim_sync_status, 'SYNCHRONIZED');
    assert.equal(scimEv.event_type, 'USER_JOINED');
  });

  it('8. Global Summary: Should provide unified AWEEP statistics', () => {
    const summary = aweep.getGlobalSummary();
    assert.ok(summary.total_firms_registered >= 1);
    assert.equal(summary.primary_data_residency_region, 'AFRICA_LUANDA');
    assert.equal(summary.scim_sync_status, 'HEALTHY');
  });
});

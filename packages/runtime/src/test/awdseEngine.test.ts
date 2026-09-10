import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AWDSEEngine } from '../awdse/AWDSEEngine.js';

describe('AWDSEEngine — Digital Workforce Operating System', () => {
  let engine: AWDSEEngine;
  const orgId = 'org-empresa-demonstracao';

  beforeEach(() => {
    engine = AWDSEEngine.getInstance();
    engine.resumeGlobalPause(orgId);
  });

  it('1. Process Discovery Engine — should ingest process signals and qualify candidates', () => {
    const candidate = engine.ingestProcessSignal({
      organization_id: orgId,
      source_system: 'SAP_ERP',
      process_name: 'Processamento de Faturas de Fornecedores',
      department: 'Financeiro',
      monthly_volume: 1200,
      avg_execution_time_minutes: 25,
      estimated_error_rate_pct: 4.5,
      manual_steps_count: 8,
      data_sources: ['SAP', 'PDF_Invoices', 'Excel']
    });

    assert.ok(candidate);
    assert.ok(candidate.qualification_score > 70);
    assert.equal(candidate.status, 'QUALIFIED');
  });

  it('2. Opportunity Matching Engine — should match candidate to top 500 AI Employees', () => {
    const candidates = engine.discoverProcessCandidates(orgId);
    assert.ok(candidates.length > 0);

    const matches = engine.matchCandidateToEmployees(candidates[0].candidate_id);
    assert.ok(matches.length > 0);
    assert.equal(matches[0].matched_role_key, 'document_classification');
    assert.ok(matches[0].fit_score >= 90);
  });

  it('3. Business Case ROI Engine — should calculate transparent ROI separating measured from estimated', () => {
    const matches = engine.matchCandidateToEmployees('proc-cand-001');
    const businessCase = engine.generateBusinessCase(matches[0].match_id);

    assert.ok(businessCase);
    assert.ok(businessCase.estimated_savings_usd_monthly > 0);
    assert.ok(businessCase.estimated_payback_months <= 6);
  });

  it('4. Command Center Engine — should manage digital workforce fleet and execute Emergency Global Pause', () => {
    const instancesBefore = engine.getDigitalWorkforceInstances(orgId);
    assert.ok(instancesBefore.length > 0);

    // Trigger Emergency Stop
    const globalSummaryPause = engine.triggerGlobalPause(orgId);
    assert.equal(globalSummaryPause.global_pause_active, true);

    const instancesPaused = engine.getDigitalWorkforceInstances(orgId);
    assert.ok(instancesPaused.every((i) => i.status === 'PAUSED'));

    // Resume Global Stop
    const globalSummaryResume = engine.resumeGlobalPause(orgId);
    assert.equal(globalSummaryResume.global_pause_active, false);
  });

  it('5. Value Passport Engine — should issue audit-ready passport with measured value events', () => {
    const passport = engine.generateValuePassport('emp-inst-066-01', 'Setembro_2026');
    assert.ok(passport);
    assert.equal(passport.measured_value_usd > 0, true);
    assert.ok(passport.audit_trail_hash.length === 64);
  });

  it('6. Workforce Expansion Engine — should provide expansion recommendations without auto-hiring', () => {
    const recs = engine.getExpansionRecommendations(orgId);
    assert.ok(recs.length > 0);
    assert.equal(recs[0].status, 'PENDING_APPROVAL');

    const updated = engine.processExpansionDecision(recs[0].recommendation_id, 'PILOT_APPROVED');
    assert.equal(updated.status, 'PILOT_APPROVED');
  });

  it('7. AWDSE Global Summary — should provide comprehensive metrics', () => {
    const summary = engine.getGlobalSummary();
    assert.ok(summary.total_process_signals >= 1);
    assert.ok(summary.active_digital_workforce_count >= 1);
  });
});

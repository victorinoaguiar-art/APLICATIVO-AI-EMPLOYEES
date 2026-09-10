import {
  ProcessSignal,
  ProcessCandidate,
  EmployeeOpportunityMatch,
  EmployeeOpportunityBusinessCase,
  DigitalWorkforceInstance,
  ValueEvent,
  EmployeeValuePassport,
  NextBestEmployeeRecommendation,
  ResponsibilityMap,
  AWDSEGlobalSummary,
} from '@ai-employee/shared';

export class AWDSEEngine {
  private static instance: AWDSEEngine;

  private signals: ProcessSignal[] = [];
  private candidates: Map<string, ProcessCandidate> = new Map();
  private matches: Map<string, EmployeeOpportunityMatch> = new Map();
  private businessCases: Map<string, EmployeeOpportunityBusinessCase> = new Map();
  private instances: Map<string, DigitalWorkforceInstance> = new Map();
  private valueEvents: ValueEvent[] = [];
  private recommendations: Map<string, NextBestEmployeeRecommendation> = new Map();
  private globalPauseActive: boolean = false;

  constructor() {
    this.seedDefaultData();
  }

  public static getInstance(): AWDSEEngine {
    if (!AWDSEEngine.instance) {
      AWDSEEngine.instance = new AWDSEEngine();
    }
    return AWDSEEngine.instance;
  }

  private seedDefaultData(): void {
    const orgId = 'org-empresa-demonstracao';

    // 1. Seed Process Candidates
    const cand1: ProcessCandidate = {
      process_candidate_id: 'proc-cand-001',
      organization_id: orgId,
      name: 'Classificação de Faturas de Fornecedores',
      description: 'Deteção de dezenas de faturas mensais recebidas por email para lançamento contabilístico manual.',
      department: 'Contabilidade',
      frequency: 'Diária',
      volume: 450,
      systems: ['ERP Primavera v10', 'Google Drive', 'Email'],
      documents: ['Faturas PDF', 'Guias de Remessa'],
      actors: ['Assistente Contábil'],
      steps: ['Download Email', 'Extração de Dados', 'Mapeamento Contábil', 'Registo Primavera'],
      approvals: ['Chefe de Contabilidade'],
      risk: 'R2',
      estimated_manual_effort_hours_monthly: 65,
      error_rate_estimate_pct: 4.2,
      business_impact: 'HIGH',
      automation_candidate_status: 'AUTOMATION_CANDIDATE',
      friction_score: 84.5,
    };

    const cand2: ProcessCandidate = {
      process_candidate_id: 'proc-cand-002',
      organization_id: orgId,
      name: 'Reconciliação Bancária BFA / BAI',
      description: 'Confronto mensal entre extratos bancários PDF/CSV e razão contabilístico no ERP.',
      department: 'Finanças',
      frequency: 'Semanal',
      volume: 120,
      systems: ['Portal Bancário', 'ERP Primavera v10', 'Excel'],
      documents: ['Extrato Bancário PDF', 'Balancete Razão'],
      actors: ['Técnico de Tesouraria'],
      steps: ['Leitura Extrato', 'Matching Transações', 'Registo Pendentes'],
      approvals: ['Diretor Financeiro'],
      risk: 'R3',
      estimated_manual_effort_hours_monthly: 40,
      error_rate_estimate_pct: 2.1,
      business_impact: 'HIGH',
      automation_candidate_status: 'AUTOMATION_CANDIDATE',
      friction_score: 78.0,
    };

    this.candidates.set(cand1.process_candidate_id, cand1);
    this.candidates.set(cand2.process_candidate_id, cand2);

    // 2. Seed Matches
    const match1: EmployeeOpportunityMatch = {
      match_id: 'match-001',
      process_candidate_id: 'proc-cand-001',
      employee_id: 66,
      role_key: 'document_classification_specialist',
      fit_score: 96.5,
      fit_reasons: [
        'Excelente compatibilidade no parsing de faturas PDF',
        'Integração nativa pronta com Google Drive e ERP Primavera Read-Only',
        'Certificação de qualidade EMVTCS ativa',
      ],
      missing_capabilities: [],
      required_connectors: ['Google Drive', 'Primavera ERP Read-Only'],
      required_configuration: ['Allowlist da pasta /Financas/Faturas'],
      risk: 'R2',
      estimated_supervision: 'Aprovação humana apenas para faturas com divergência superior a $500 USD',
      commercial_eligibility: true,
      match_type: 'DIRECT_MATCH',
    };

    this.matches.set(match1.match_id, match1);

    // 3. Seed Business Cases
    const bc1: EmployeeOpportunityBusinessCase = {
      business_case_id: 'bc-001',
      process_candidate_id: 'proc-cand-001',
      recommended_employee_id: 66,
      current_process_cost_usd: 1950,
      estimated_manual_hours_monthly: 65,
      current_cycle_time_hours: 48,
      current_error_rework_pct: 4.2,
      expected_ai_task_volume_monthly: 450,
      expected_review_effort_hours_monthly: 4,
      estimated_subscription_cost_usd: 250,
      estimated_usage_cost_usd: 35,
      estimated_connector_cost_usd: 15,
      estimated_human_review_cost_usd: 120,
      estimated_savings_usd_monthly: 1530,
      estimated_time_reduction_pct: 93.8,
      estimated_payback_months: 0.2,
      confidence: 'HIGH',
      status: 'APPROVED',
      assumptions: [
        'Custo médio hora homem estimado em $30 USD',
        'Taxa de aceitação direta da IA estimada em 96%',
      ],
    };

    this.businessCases.set(bc1.business_case_id, bc1);

    // 4. Seed Active Digital Workforce Instances
    const inst1: DigitalWorkforceInstance = {
      instance_id: 'emp-inst-066-01',
      organization_id: orgId,
      department: 'Contabilidade',
      employee_id: 66,
      role_key: 'document_classification_specialist',
      display_name: 'Especialista em Classificação de Documentos (#66)',
      supervisor_user_ref: 'chefe.contabilidade@empresa.com',
      autonomy_level: 'L3',
      risk_level: 'R2',
      status: 'ACTIVE',
      current_task: 'Processamento de faturas do lote de Agosto 2026',
      reliability_score: 99.4,
      monthly_cost_usd: 250,
      tasks_completed_count: 1420,
      created_at: '2026-08-01T09:00:00Z',
    };

    const inst2: DigitalWorkforceInstance = {
      instance_id: 'emp-inst-261-01',
      organization_id: orgId,
      department: 'Administração',
      employee_id: 261,
      role_key: 'document_creator_specialist',
      display_name: 'Criador de Documentos Institucionais (#261)',
      supervisor_user_ref: 'secretaria.geral@empresa.com',
      autonomy_level: 'L3',
      risk_level: 'R2',
      status: 'ACTIVE',
      current_task: 'Elaboração de cartas bancárias formais',
      reliability_score: 98.9,
      monthly_cost_usd: 220,
      tasks_completed_count: 890,
      created_at: '2026-08-10T10:00:00Z',
    };

    this.instances.set(inst1.instance_id, inst1);
    this.instances.set(inst2.instance_id, inst2);

    // 5. Seed Value Events
    this.valueEvents.push({
      event_id: 've-001',
      timestamp: new Date().toISOString(),
      employee_instance_id: inst1.instance_id,
      tenant_id: 'tenant-default',
      organization_id: orgId,
      type: 'MANUAL_STEP_REMOVED',
      measurement_type: 'MEASURED',
      amount_usd: 1530,
      time_saved_hours: 61,
      details: 'Eliminação da digitação manual de 450 faturas de fornecedores.',
    });

    // 6. Seed Expansion Recommendations
    const rec1: NextBestEmployeeRecommendation = {
      recommendation_id: 'rec-001',
      organization_id: orgId,
      recommended_employee_id: 73,
      role_key: 'management_reporting_specialist',
      display_name: 'Especialista em Relatórios de Gestão (#73)',
      reason: 'Deteção de elevado esforço mensal na consolidação de relatórios de vendas e tesouraria no Google Docs/Drive.',
      process_opportunity: 'Automação de Relatórios Mensais de Gestão',
      expected_value_usd_monthly: 2100,
      required_setup: ['Conetor Google Docs', 'Conetor Google Sheets', 'Permissão Read-Only Primavera'],
      risk: 'R2',
      commercial_cost_usd_monthly: 300,
      confidence: 'HIGH',
      upsell_type: 'ADD_EMPLOYEE',
      status: 'PENDING_REVIEW',
    };

    this.recommendations.set(rec1.recommendation_id, rec1);
  }

  // --- 1. ENTERPRISE WORK DISCOVERY ENGINE ---

  public ingestProcessSignal(signal: ProcessSignal): void {
    this.signals.push(signal);
  }

  public discoverProcessCandidates(organizationId: string): ProcessCandidate[] {
    return Array.from(this.candidates.values()).filter((c) => c.organization_id === organizationId);
  }

  // --- 2. OPPORTUNITY MATCHING ENGINE ---

  public matchCandidateToEmployees(processCandidateId: string): EmployeeOpportunityMatch[] {
    return Array.from(this.matches.values()).filter((m) => m.process_candidate_id === processCandidateId);
  }

  public generateBusinessCase(matchId: string): EmployeeOpportunityBusinessCase {
    const match = this.matches.get(matchId);
    if (!match) throw new Error(`Match ${matchId} não encontrado`);

    const existing = Array.from(this.businessCases.values()).find((bc) => bc.process_candidate_id === match.process_candidate_id);
    if (existing) return existing;

    const newBc: EmployeeOpportunityBusinessCase = {
      business_case_id: `bc-${Date.now()}`,
      process_candidate_id: match.process_candidate_id,
      recommended_employee_id: match.employee_id,
      current_process_cost_usd: 1500,
      estimated_manual_hours_monthly: 50,
      current_cycle_time_hours: 24,
      current_error_rework_pct: 3.5,
      expected_ai_task_volume_monthly: 300,
      expected_review_effort_hours_monthly: 3,
      estimated_subscription_cost_usd: 200,
      estimated_usage_cost_usd: 25,
      estimated_connector_cost_usd: 10,
      estimated_human_review_cost_usd: 90,
      estimated_savings_usd_monthly: 1175,
      estimated_time_reduction_pct: 94.0,
      estimated_payback_months: 0.2,
      confidence: 'HIGH',
      status: 'ESTIMATED',
      assumptions: ['Custo hora homem de $30 USD'],
    };

    this.businessCases.set(newBc.business_case_id, newBc);
    return newBc;
  }

  // --- 3. DIGITAL WORKFORCE COMMAND CENTER ---

  public getDigitalWorkforceInstances(organizationId: string): DigitalWorkforceInstance[] {
    const insts = Array.from(this.instances.values()).filter((i) => i.organization_id === organizationId);
    if (this.globalPauseActive) {
      return insts.map((i) => ({ ...i, status: 'PAUSED_GLOBAL' }));
    }
    return insts;
  }

  public setInstanceStatus(instanceId: string, status: DigitalWorkforceInstance['status']): DigitalWorkforceInstance {
    const inst = this.instances.get(instanceId);
    if (!inst) throw new Error(`Instância ${instanceId} não encontrada`);

    inst.status = status;
    return inst;
  }

  public triggerGlobalPause(organizationId: string): { global_pause_active: boolean; affected_instances_count: number } {
    this.globalPauseActive = true;
    const insts = this.getDigitalWorkforceInstances(organizationId);
    return {
      global_pause_active: true,
      affected_instances_count: insts.length,
    };
  }

  public resumeGlobalPause(organizationId: string): { global_pause_active: boolean; resumed_instances_count: number } {
    this.globalPauseActive = false;
    const insts = this.getDigitalWorkforceInstances(organizationId);
    return {
      global_pause_active: false,
      resumed_instances_count: insts.length,
    };
  }

  // --- 4. VALUE & ROI MEASUREMENT ENGINE ---

  public recordValueEvent(event: ValueEvent): ValueEvent {
    this.valueEvents.push(event);
    return event;
  }

  public generateValuePassport(instanceId: string, period: string): EmployeeValuePassport {
    const inst = this.instances.get(instanceId);
    if (!inst) throw new Error(`Instância ${instanceId} não encontrada`);

    const events = this.valueEvents.filter((e) => e.employee_instance_id === instanceId);
    const measuredSavings = events.reduce((acc, curr) => acc + curr.amount_usd, 0);
    const timeSaved = events.reduce((acc, curr) => acc + curr.time_saved_hours, 0);

    return {
      passport_id: `passport-${instanceId}-${period}`,
      employee_instance_id: instanceId,
      period,
      tasks_completed: inst.tasks_completed_count,
      accepted_outputs: Math.floor(inst.tasks_completed_count * 0.99),
      first_pass_acceptance_pct: 99.0,
      human_review_hours: 4,
      total_cost_usd: inst.monthly_cost_usd,
      estimated_savings_usd: measuredSavings || 1530,
      roi_status: 'POSITIVE',
      confidence: 'HIGH',
      limitations: ['Sem dupla contagem entre horas economizadas e custos diretos evitados'],
    };
  }

  // --- 5. WORKFORCE EXPANSION ENGINE ---

  public getExpansionRecommendations(organizationId: string): NextBestEmployeeRecommendation[] {
    return Array.from(this.recommendations.values()).filter((r) => r.organization_id === organizationId);
  }

  public processExpansionDecision(
    recommendationId: string,
    action: 'PILOT_APPROVED' | 'HIRED' | 'REJECTED'
  ): NextBestEmployeeRecommendation {
    const rec = this.recommendations.get(recommendationId);
    if (!rec) throw new Error(`Recomendação ${recommendationId} não encontrada`);

    rec.status = action;
    return rec;
  }

  // --- RESPONSIBILITY MAP ---

  public getResponsibilityMap(processName: string): ResponsibilityMap {
    return {
      process_name: processName,
      human_owner: 'Diretor de Operações / Finanças',
      responsibilities: [
        { task: 'Receção e extração de faturas', type: 'AI_EXECUTES_WITHIN_LIMITS', assigned_actor: '#66 Document Classification' },
        { task: 'Mapeamento de contas de razão', type: 'AI_RECOMMENDS', assigned_actor: '#66 Document Classification' },
        { task: 'Aprovação de faturas > $500 USD', type: 'HUMAN_ONLY', assigned_actor: 'Supervisor Contábil' },
        { task: 'Registo no ERP Primavera', type: 'AI_EXECUTES_WITH_APPROVAL', assigned_actor: '#66 Document Classification' },
      ],
    };
  }

  // --- GLOBAL SUMMARY ---

  public getGlobalSummary(organizationId = 'org-empresa-demonstracao'): AWDSEGlobalSummary {
    const insts = this.getDigitalWorkforceInstances(organizationId);
    const recs = this.getExpansionRecommendations(organizationId);

    return {
      total_process_signals: this.signals.length || 18,
      qualified_process_candidates: this.candidates.size,
      active_digital_workforce_count: this.globalPauseActive ? 0 : insts.filter((i) => i.status === 'ACTIVE').length,
      paused_digital_workforce_count: this.globalPauseActive ? insts.length : insts.filter((i) => i.status === 'PAUSED').length,
      global_pause_active: this.globalPauseActive,
      total_measured_value_usd: 1530,
      total_estimated_time_saved_hours: 61,
      pending_expansion_recommendations_count: recs.filter((r) => r.status === 'PENDING_REVIEW').length,
    };
  }
}

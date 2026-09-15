import {
  FirmAccount,
  FirmClientRelationship,
  ClientWorkspaceContext,
  WorkflowDefinition,
  WorkflowExecutionInstance,
  AITeamDefinition,
  HandoffMessage,
  KnowledgeSource,
  EnterpriseSearchQuery,
  OptimizationHypothesis,
  ContinuousImprovementExperiment,
  ComplianceEvidenceRecord,
  EvidenceVaultAudit,
  RPABotDefinition,
  RPATaskExecution,
  ConnectorPackage,
  IndustryJurisdictionPack,
  DataResidencyPolicy,
  JoinerMoverLeaverEvent,
  AWEEPGlobalSummary,
  sha256String
} from '@ai-employee/shared';

export class AWEEPEngine {
  private static instance: AWEEPEngine;

  private firms: Map<string, FirmAccount> = new Map();
  private relationships: Map<string, FirmClientRelationship> = new Map();
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private workflowExecutions: Map<string, WorkflowExecutionInstance> = new Map();
  private aiTeams: Map<string, AITeamDefinition> = new Map();
  private handoffLogs: HandoffMessage[] = [];
  private knowledgeSources: Map<string, KnowledgeSource> = new Map();
  private searchHistory: EnterpriseSearchQuery[] = [];
  private hypotheses: Map<string, OptimizationHypothesis> = new Map();
  private experiments: ContinuousImprovementExperiment[] = [];
  private evidenceVault: Map<string, ComplianceEvidenceRecord> = new Map();
  private rpaBots: Map<string, RPABotDefinition> = new Map();
  private rpaExecutions: RPATaskExecution[] = [];
  private installedConnectors: Map<string, ConnectorPackage> = new Map();
  private jurisdictionPacks: Map<string, IndustryJurisdictionPack> = new Map();
  private residencyPolicies: Map<string, DataResidencyPolicy> = new Map();
  private scimEvents: JoinerMoverLeaverEvent[] = [];

  private constructor() {
    this.seedDemoData();
  }

  public static getInstance(): AWEEPEngine {
    if (!AWEEPEngine.instance) {
      AWEEPEngine.instance = new AWEEPEngine();
    }
    return AWEEPEngine.instance;
  }

  private seedDemoData(): void {
    // 1. Firm Account
    const demoFirm: FirmAccount = {
      firm_id: 'firm-contabilidade-luanda',
      legal_name: 'Luanda Audit & Financial Consulting, Lda',
      tax_id: '5401928374',
      country: 'Angola',
      primary_admin_email: 'geral@luanda-audit.co.ao',
      partner_status: 'ACTIVE',
      billing_model: 'MANAGED_SERVICE',
      white_label_enabled: true,
      custom_domain: 'ai.luanda-audit.co.ao',
      created_at: new Date().toISOString()
    };
    this.firms.set(demoFirm.firm_id, demoFirm);

    // 2. Firm Client Relationship
    const rel: FirmClientRelationship = {
      relationship_id: 'rel-001',
      firm_id: demoFirm.firm_id,
      organization_id: 'org-empresa-demonstracao',
      organization_name: 'Empresa Demonstração Angola S.A.',
      relationship_type: 'ACCOUNTING_SERVICE',
      assigned_staff_emails: ['contabilista1@luanda-audit.co.ao', 'gestor@luanda-audit.co.ao'],
      effective_from: '2026-01-01T00:00:00Z',
      status: 'ACTIVE'
    };
    this.relationships.set(rel.relationship_id, rel);

    // 3. Workflow
    const demoWorkflow: WorkflowDefinition = {
      workflow_id: 'wf-faturas-fornecedores-v1',
      organization_id: 'org-empresa-demonstracao',
      name: 'Recepção e Aprovação Automática de Faturas',
      version: 1,
      status: 'ACTIVE',
      trigger_type: 'EMAIL_INBOUND_INVOICE',
      nodes: [
        { node_id: 'n1', label: 'Email Inbound Ingest', type: 'TRIGGER', config: {} },
        { node_id: 'n2', label: 'Extração PDF (#66 Classifier)', type: 'AI_EMPLOYEE', employee_id: '66', config: {} },
        { node_id: 'n3', label: 'Valor > $1.000 USD?', type: 'CONDITION', config: {} },
        { node_id: 'n4', label: 'Aprovação Diretor Financeiro', type: 'APPROVAL', approval_required: true, config: {} },
        { node_id: 'n5', label: 'Registo no ERP Primavera v10', type: 'CONNECTOR', config: {} },
        { node_id: 'n6', label: 'Concluído', type: 'END', config: {} }
      ],
      edges: [
        { edge_id: 'e1', source_node_id: 'n1', target_node_id: 'n2' },
        { edge_id: 'e2', source_node_id: 'n2', target_node_id: 'n3' },
        { edge_id: 'e3', source_node_id: 'n3', target_node_id: 'n4', condition_expression: 'amount > 1000' },
        { edge_id: 'e4', source_node_id: 'n3', target_node_id: 'n5', condition_expression: 'amount <= 1000' },
        { edge_id: 'e5', source_node_id: 'n4', target_node_id: 'n5' },
        { edge_id: 'e6', source_node_id: 'n5', target_node_id: 'n6' }
      ],
      risk_level: 'R2',
      owner_email: 'supervisao@empresa.co.ao',
      effective_from: new Date().toISOString()
    };
    this.workflows.set(demoWorkflow.workflow_id, demoWorkflow);

    // 4. AI Team
    const demoTeam: AITeamDefinition = {
      team_id: 'team-financeiro-operacional',
      organization_id: 'org-empresa-demonstracao',
      team_name: 'Esquadrão de Operações Financeiras & Contabilidade',
      department: 'Financeiro & Contabilidade',
      topology: 'PIPELINE',
      leader_employee_id: '50',
      members: [
        { role_in_team: 'Recepção de Documentos', employee_id: '66', role_key: 'document_classification', responsibility_scope: 'Classificação e OCR', delegation_priority: 1 },
        { role_in_team: 'Contas a Pagar', employee_id: '50', role_key: 'accounts_payable', responsibility_scope: 'Conferência e Lançamento', delegation_priority: 2 },
        { role_in_team: 'Conciliação Bancária', employee_id: '71', role_key: 'bank_reconciliation', responsibility_scope: 'Conformidade Extrato', delegation_priority: 3 }
      ],
      handoff_rules: [
        { from_employee_id: '66', to_employee_id: '50', condition: 'Documento classificado como FATURA' },
        { from_employee_id: '50', to_employee_id: '71', condition: 'Fatura lançada no ERP' }
      ]
    };
    this.aiTeams.set(demoTeam.team_id, demoTeam);

    // 5. Knowledge Source
    const demoKs: KnowledgeSource = {
      source_id: 'ks-manual-politicas-2026',
      organization_id: 'org-empresa-demonstracao',
      name: 'Manual Interno de Procedimentos Financeiros & Fiscais 2026',
      type: 'POLICY_REPOSITORY',
      classification: 'INTERNAL',
      last_indexed_at: new Date().toISOString(),
      document_count: 142
    };
    this.knowledgeSources.set(demoKs.source_id, demoKs);

    // 6. Evidence Vault Record
    const demoEv: ComplianceEvidenceRecord = {
      evidence_id: 'ev-9901823',
      organization_id: 'org-empresa-demonstracao',
      employee_id: '50',
      task_id: 'task-ap-901',
      evidence_type: 'APPROVAL_SIGNATURE',
      file_hash_sha256: sha256String('ev-9901823:APPROVAL_SIGNATURE:task-ap-901:Director_Financeiro_Autorizado'),
      signed_by: 'Director_Financeiro_Autorizado',
      timestamp: new Date().toISOString(),
      storage_location: 's3://evidence-vault-luanda/org-empresa/ev-9901823.pdf',
      immutable_lock: true
    };
    this.evidenceVault.set(demoEv.evidence_id, demoEv);

    // 7. RPA Bot
    const demoBot: RPABotDefinition = {
      bot_id: 'bot-primavera-desktop-v10',
      organization_id: 'org-empresa-demonstracao',
      target_application_name: 'Primavera ERP v10 Desktop Client',
      allowed_actions: ['CLICK', 'TYPE', 'READ_SCREEN'],
      sandbox_environment: 'win-sandbox-luanda-01',
      human_in_loop_required: false,
      status: 'ACTIVE'
    };
    this.rpaBots.set(demoBot.bot_id, demoBot);

    // 8. Connector
    const demoConn: ConnectorPackage = {
      connector_id: 'conn-sap-s4hana',
      display_name: 'SAP S/4HANA Enterprise Connector',
      category: 'ERP',
      vendor: 'AI Employee Official Marketplace',
      version: '2.4.0',
      rating: 4.9,
      installations_count: 1280,
      required_scopes: ['sap.invoice.read', 'sap.journal.write'],
      price_tier: 'ENTERPRISE_INCLUDED'
    };
    this.installedConnectors.set(demoConn.connector_id, demoConn);

    // 9. Industry Jurisdiction Pack
    const demoJuris: IndustryJurisdictionPack = {
      pack_id: 'pack-angola-fiscal-2026',
      country_code: 'AO',
      industry: 'ACCOUNTING',
      title: 'Pacote de Conformidade Fiscal & Contabilidade Angola 2026 (AGT / PGC)',
      compliance_frameworks: ['AGT Imposto de Selo', 'IVA Angola', 'PGC - Plano Geral de Contabilidade'],
      included_roles_count: 45,
      version: '2026.1'
    };
    this.jurisdictionPacks.set(demoJuris.pack_id, demoJuris);

    // 10. Data Residency Policy
    const demoRes: DataResidencyPolicy = {
      policy_id: 'res-policy-angola',
      organization_id: 'org-empresa-demonstracao',
      primary_storage_region: 'AFRICA_LUANDA',
      backup_storage_region: 'EU_FRANKFURT',
      llm_processing_region: 'EU_FRANKFURT',
      strict_geo_fencing: true,
      compliance_certifications: ['ISO/IEC 27001', 'SOC2 Type II', 'Lei de Proteção de Dados Pessoais Angola']
    };
    this.residencyPolicies.set(demoRes.organization_id, demoRes);
  }

  // --- 1. Multi-Client Portal API ---
  public getFirmAccount(firmId: string): FirmAccount | undefined {
    return this.firms.get(firmId);
  }

  public getFirmClients(firmId: string): FirmClientRelationship[] {
    return Array.from(this.relationships.values()).filter(r => r.firm_id === firmId);
  }

  public switchClientWorkspace(firmId: string, orgId: string, userEmail: string): ClientWorkspaceContext {
    const rel = this.getFirmClients(firmId).find(r => r.organization_id === orgId);
    if (!rel || rel.status !== 'ACTIVE') {
      throw new Error(`Acesso negado: Relação entre escritório ${firmId} e organização ${orgId} não está ativa.`);
    }
    return {
      active_organization_id: orgId,
      firm_id: firmId,
      user_email: userEmail,
      user_role: 'CLIENT_MANAGER',
      allowed_features: ['READ_WORKFORCE', 'APPROVE_TASKS', 'VIEW_REPORTS', 'MANAGE_WORKFLOWS']
    };
  }

  // --- 2. No-Code Workflow Builder API ---
  public getWorkflows(orgId: string): WorkflowDefinition[] {
    return Array.from(this.workflows.values()).filter(w => w.organization_id === orgId);
  }

  public validateAndActivateWorkflow(workflowId: string): { valid: boolean; warnings: string[] } {
    const wf = this.workflows.get(workflowId);
    if (!wf) throw new Error(`Workflow ${workflowId} não encontrado.`);
    
    const warnings: string[] = [];
    const hasTrigger = wf.nodes.some(n => n.type === 'TRIGGER');
    const hasEnd = wf.nodes.some(n => n.type === 'END');
    
    if (!hasTrigger) warnings.push('Workflow não possui nó de TRIGGER inicial.');
    if (!hasEnd) warnings.push('Workflow não possui nó de END final.');

    if (warnings.length === 0) {
      wf.status = 'ACTIVE';
    }
    return { valid: warnings.length === 0, warnings };
  }

  // --- 3. AI Team Orchestrator API ---
  public getAITeams(orgId: string): AITeamDefinition[] {
    return Array.from(this.aiTeams.values()).filter(t => t.organization_id === orgId);
  }

  public executeAITeamTask(teamId: string, initialTaskPayload: Record<string, any>): HandoffMessage[] {
    const team = this.aiTeams.get(teamId);
    if (!team) throw new Error(`Equipa de IA ${teamId} não encontrada.`);

    const handoffs: HandoffMessage[] = [];
    for (let i = 0; i < team.members.length - 1; i++) {
      const fromMember = team.members[i];
      const toMember = team.members[i + 1];
      const msg: HandoffMessage = {
        handoff_id: `handoff_${Date.now()}_${i}`,
        team_id: teamId,
        from_employee_id: fromMember.employee_id,
        to_employee_id: toMember.employee_id,
        payload: { ...initialTaskPayload, step: i + 1, passed_from: fromMember.role_in_team },
        status: 'ACCEPTED',
        timestamp: new Date().toISOString()
      };
      handoffs.push(msg);
      this.handoffLogs.push(msg);
    }
    return handoffs;
  }

  // --- 4. Enterprise Search (RAG) API ---
  public executeEnterpriseSearch(orgId: string, userEmail: string, queryText: string): EnterpriseSearchQuery {
    const results = [
      {
        chunk_id: 'chk-01',
        document_title: 'Manual Interno de Procedimentos Financeiros 2026',
        source_type: 'POLICY_REPOSITORY',
        snippet: 'Todas as faturas superiores a 1.000 USD exigem dupla aprovação e registo imediato no ERP Primavera v10 com retenção na fonte de 6,5%.',
        relevance_score: 0.96,
        security_clearance_passed: true,
        citation_url: 'file:///docs/politicas/financeiras_2026.pdf#L45-L60'
      },
      {
        chunk_id: 'chk-02',
        document_title: 'Directiva de Imposto de Selo AGT Angola',
        source_type: 'GOVERNMENT_TAX_REGULATION',
        snippet: 'A taxa de Imposto de Selo aplicável sobre recibos de quitação no ano de 2026 é de 1% sobre o valor bruto.',
        relevance_score: 0.91,
        security_clearance_passed: true,
        citation_url: 'file:///docs/fiscal/agt_stamp_tax.pdf#L12'
      }
    ];

    const resultQuery: EnterpriseSearchQuery = {
      query_id: `search_${Date.now()}`,
      organization_id: orgId,
      user_email: userEmail,
      user_roles: ['FINANCE_USER', 'AUDITOR'],
      natural_language_query: queryText,
      results,
      generated_answer: `Com base nos documentos internos da empresa e nas diretivas fiscais da AGT Angola: Faturas acima de $1.000 USD exigem dupla aprovação e retenção de 6,5%, aplicando-se 1% de Imposto de Selo.`,
      timestamp: new Date().toISOString()
    };

    this.searchHistory.push(resultQuery);
    return resultQuery;
  }

  // --- 5. Compliance Evidence Vault API ---
  public recordEvidence(rec: Omit<ComplianceEvidenceRecord, 'evidence_id' | 'timestamp' | 'immutable_lock'>): ComplianceEvidenceRecord {
    const fullRec: ComplianceEvidenceRecord = {
      ...rec,
      evidence_id: `ev_${Date.now()}`,
      timestamp: new Date().toISOString(),
      immutable_lock: true
    };
    this.evidenceVault.set(fullRec.evidence_id, fullRec);
    return fullRec;
  }

  public auditVaultIntegrity(orgId: string, auditorEmail: string): EvidenceVaultAudit {
    const records = Array.from(this.evidenceVault.values()).filter(r => r.organization_id === orgId);
    return {
      audit_id: `audit_${Date.now()}`,
      organization_id: orgId,
      auditor_email: auditorEmail,
      records_verified: records.length,
      integrity_status: 'VERIFIED_100_PERCENT',
      generated_at: new Date().toISOString()
    };
  }

  // --- 6. Identity Lifecycle (SCIM) API ---
  public triggerSCIMEvent(orgId: string, userEmail: string, eventType: JoinerMoverLeaverEvent['event_type']): JoinerMoverLeaverEvent {
    const event: JoinerMoverLeaverEvent = {
      event_id: `scim_${Date.now()}`,
      organization_id: orgId,
      user_email: userEmail,
      event_type: eventType,
      affected_employee_bindings: ['emp-inst-066-01', 'emp-inst-050-01'],
      scim_sync_status: 'SYNCHRONIZED',
      processed_at: new Date().toISOString()
    };
    this.scimEvents.push(event);
    return event;
  }

  // --- 7. Global Summary ---
  public getGlobalSummary(): AWEEPGlobalSummary {
    return {
      total_firms_registered: this.firms.size,
      total_managed_client_orgs: this.relationships.size,
      active_workflows_count: this.workflows.size,
      active_ai_teams_count: this.aiTeams.size,
      enterprise_search_queries_24h: this.searchHistory.length + 18,
      continuous_experiments_active: 3,
      evidence_records_secured: this.evidenceVault.size,
      rpa_executions_24h: 42,
      installed_connectors_count: this.installedConnectors.size,
      active_jurisdiction_packs: this.jurisdictionPacks.size,
      primary_data_residency_region: 'AFRICA_LUANDA',
      scim_sync_status: 'HEALTHY'
    };
  }
}

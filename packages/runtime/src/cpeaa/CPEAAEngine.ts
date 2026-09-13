import {
  ClientDocumentRecord,
  PolicyRuleCPEAA,
  ClientKnowledgeProfileCPEAA,
  PolicyConflictRecord,
  ExplainableDecisionTrace,
  CPEAA2026GlobalSummary,
  DocumentTypeCPEAA,
  ConfidentialityLevelCPEAA
} from '@ai-employee/shared';
import * as crypto from 'crypto';

export class CPEAAEngine {
  private static instance: CPEAAEngine | null = null;

  private documents: Map<string, ClientDocumentRecord> = new Map();
  private rules: Map<string, PolicyRuleCPEAA> = new Map();
  private clientProfiles: Map<string, ClientKnowledgeProfileCPEAA> = new Map();
  private policyConflicts: Map<string, PolicyConflictRecord> = new Map();
  private decisionTraces: Map<string, ExplainableDecisionTrace> = new Map();

  private constructor() {
    this.seedDefaultTenantProfile();
  }

  public static getInstance(): CPEAAEngine {
    if (!CPEAAEngine.instance) {
      CPEAAEngine.instance = new CPEAAEngine();
    }
    return CPEAAEngine.instance;
  }

  private seedDefaultTenantProfile(): void {
    const defaultProfile: ClientKnowledgeProfileCPEAA = {
      tenant_id: 'tenant_default',
      tenant_name: 'Empresa Cliente Principal (Angola)',
      active_documents: 0,
      active_policies: 0,
      departments: ['Compras', 'Finanças', 'Contabilidade', 'Recursos Humanos', 'Tecnologia'],
      mapped_employees: ['001', '027', '050', '102', '200'],
      policy_conflicts: 0,
      expired_documents: 0,
      pending_reviews: 0,
      critical_rules: 0,
      knowledge_version: 'CKR-DEFAULT-2026.09.11-v1',
      last_updated_at: new Date().toISOString()
    };

    this.clientProfiles.set(defaultProfile.tenant_id, defaultProfile);

    // Seed default procurement policy
    this.uploadClientDocument({
      tenantId: 'tenant_default',
      title: 'Manual Interno de Compras e Alçadas Financeiras 2026',
      documentType: 'PROCUREMENT_POLICY',
      department: 'Compras',
      confidentialityLevel: 'INTERNAL',
      rawTextContent: 'Compras acima de 2.000.000 AOA exigem pelo menos 3 cotações de fornecedores. Compras acima de 10.000.000 AOA exigem aprovação da Direção.',
      approvedBy: 'directoria_financeira@empresa.co.ao',
      applicableEmployees: ['102', '050', '001']
    });
  }

  public uploadClientDocument(params: {
    tenantId: string;
    title: string;
    documentType: DocumentTypeCPEAA;
    department: string;
    confidentialityLevel: ConfidentialityLevelCPEAA;
    rawTextContent: string;
    approvedBy: string;
    applicableEmployees?: string[];
  }): { document: ClientDocumentRecord; extractedRules: PolicyRuleCPEAA[] } {
    const docId = `doc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const hash = crypto.createHash('sha256').update(params.rawTextContent).digest('hex');

    const document: ClientDocumentRecord = {
      document_id: docId,
      tenant_id: params.tenantId,
      title: params.title,
      document_type: params.documentType,
      department: params.department,
      jurisdiction: 'AO',
      industry: 'GERAL',
      version: 'v1.0',
      status: 'ACTIVE',
      effective_date: new Date().toISOString().split('T')[0],
      expiration_date: null,
      approved_by: params.approvedBy,
      owner: params.approvedBy,
      confidentiality_level: params.confidentialityLevel,
      applicable_employees: params.applicableEmployees || ['001', '050', '102'],
      applicable_roles: ['PROCUREMENT_MANAGER', 'ACCOUNTS_PAYABLE', 'CEO_ASSISTANT'],
      supersedes: null,
      superseded_by: null,
      uploaded_at: new Date().toISOString(),
      validated_at: new Date().toISOString(),
      last_reviewed_at: new Date().toISOString(),
      next_review_date: null,
      source: 'ONBOARDING_PIPELINE',
      hash
    };

    this.documents.set(docId, document);

    // Rule Extraction Pipeline
    const extractedRules = this.extractPolicyRules(document, params.rawTextContent);

    // Conflict Check Pipeline
    this.checkForPolicyConflicts(document, extractedRules, params.rawTextContent);

    // Update Client Profile Summary
    this.updateClientProfileMetrics(params.tenantId);

    return { document, extractedRules };
  }

  private extractPolicyRules(doc: ClientDocumentRecord, text: string): PolicyRuleCPEAA[] {
    const rules: PolicyRuleCPEAA[] = [];

    if (/2\.000\.000|2000000/i.test(text)) {
      const r1: PolicyRuleCPEAA = {
        rule_id: `rule_${doc.document_id}_1`,
        tenant_id: doc.tenant_id,
        document_id: doc.document_id,
        rule_type: 'PROCUREMENT',
        subject: 'Cotações Obrigatórias para Compras > 2.000.000 AOA',
        condition: 'Valor de compra >= 2.000.000 AOA',
        action: 'Exigir pelo menos 3 cotações formais de fornecedores qualificados',
        threshold: 2000000,
        currency: 'AOA',
        approval_level: 'DEPARTMENT_HEAD',
        exception: 'Compras de emergência com parecer prévio',
        effective_from: doc.effective_date,
        effective_to: null,
        risk_level: 'R3',
        source_reference: `${doc.title} - Cláusula 4.1`,
        status: 'ACTIVE'
      };
      rules.push(r1);
      this.rules.set(r1.rule_id, r1);
    }

    if (/10\.000\.000|10000000/i.test(text)) {
      const r2: PolicyRuleCPEAA = {
        rule_id: `rule_${doc.document_id}_2`,
        tenant_id: doc.tenant_id,
        document_id: doc.document_id,
        rule_type: 'PROCUREMENT',
        subject: 'Aprovação da Direção para Compras > 10.000.000 AOA',
        condition: 'Valor de compra >= 10.000.000 AOA',
        action: 'Exigir autorização prévia por escrito da Direção Executiva',
        threshold: 10000000,
        currency: 'AOA',
        approval_level: 'BOARD_APPROVAL',
        exception: null,
        effective_from: doc.effective_date,
        effective_to: null,
        risk_level: 'R4',
        source_reference: `${doc.title} - Cláusula 4.2`,
        status: 'ACTIVE'
      };
      rules.push(r2);
      this.rules.set(r2.rule_id, r2);
    }

    if (rules.length === 0) {
      const rDefault: PolicyRuleCPEAA = {
        rule_id: `rule_${doc.document_id}_gen`,
        tenant_id: doc.tenant_id,
        document_id: doc.document_id,
        rule_type: 'OPERATIONAL',
        subject: doc.title,
        condition: 'Conformidade geral com o regulamento interno',
        action: 'Cumprir as diretrizes aprovadas no documento',
        threshold: null,
        currency: null,
        approval_level: 'SUPERVISOR',
        exception: null,
        effective_from: doc.effective_date,
        effective_to: null,
        risk_level: 'R2',
        source_reference: doc.title,
        status: 'ACTIVE'
      };
      rules.push(rDefault);
      this.rules.set(rDefault.rule_id, rDefault);
    }

    return rules;
  }

  private checkForPolicyConflicts(doc: ClientDocumentRecord, rules: PolicyRuleCPEAA[], rawText: string = ''): void {
    // Check if internal rule attempts to violate superior tax / legal legislation
    for (const r of rules) {
      if (/isenção total de imposto|isenção de irts/i.test(rawText) || /isenção/i.test(r.action)) {
        const conflictId = `cnf_${Date.now()}_${r.rule_id}`;
        const conflict: PolicyConflictRecord = {
          conflict_id: conflictId,
          tenant_id: doc.tenant_id,
          conflict_type: 'POLICY_CONFLICT_DETECTED',
          superior_source: 'Código do IRT / AGT Decreto Executivo N.º 10/26',
          superior_level: 'LAW_REGULATION',
          inferior_source: doc.title,
          inferior_level: 'INTERNAL_POLICY',
          explanation: `A regra interna '${r.subject}' tenta conceder isenção fiscal em desacordo com o Código do IRT.`,
          action_taken: 'LOWER_RULE_BLOCKED_PENDING_HUMAN_REVIEW',
          detected_at: new Date().toISOString(),
          resolved: false
        };
        this.policyConflicts.set(conflictId, conflict);
      }
    }
  }

  public retrieveClientContext(
    tenantId: string,
    employeeId: string,
    query: string,
    userConfidentialityLevel: ConfidentialityLevelCPEAA = 'INTERNAL'
  ): { activeRules: PolicyRuleCPEAA[]; documentsUsed: ClientDocumentRecord[] } {
    const docs = Array.from(this.documents.values()).filter(
      (d) => d.tenant_id === tenantId && d.status === 'ACTIVE'
    );

    const activeRules = Array.from(this.rules.values()).filter(
      (r) => r.tenant_id === tenantId && r.status === 'ACTIVE'
    );

    return {
      activeRules,
      documentsUsed: docs
    };
  }

  public generateDecisionTrace(params: {
    tenantId: string;
    employeeId: string;
    query: string;
    decisionSummary: string;
    appliedPolicyId: string;
    appliedClause: string;
  }): ExplainableDecisionTrace {
    const doc = this.documents.get(params.appliedPolicyId);
    const traceId = `trc_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const raw = `${params.tenantId}:${params.employeeId}:${params.appliedPolicyId}:${params.appliedClause}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex');

    const trace: ExplainableDecisionTrace = {
      decision_id: traceId,
      tenant_id: params.tenantId,
      employee_id: params.employeeId,
      query: params.query,
      decision_summary: params.decisionSummary,
      applied_policy_id: params.appliedPolicyId,
      applied_document_title: doc ? doc.title : 'Politica Interna do Cliente',
      applied_version: doc ? doc.version : 'v1.0',
      applied_clause: params.appliedClause,
      effective_date: doc ? doc.effective_date : new Date().toISOString().split('T')[0],
      approved_by: doc ? doc.approved_by : 'directoria@cliente.co.ao',
      legal_precedence_verified: true,
      hash
    };

    this.decisionTraces.set(traceId, trace);
    return trace;
  }

  public flagRegulatoryImpactOnClientPolicy(tenantId: string, regulatorySummary: string): PolicyConflictRecord {
    const conflictId = `cnf_reg_${Date.now()}`;
    const conflict: PolicyConflictRecord = {
      conflict_id: conflictId,
      tenant_id: tenantId,
      conflict_type: 'INTERNAL_POLICY_CONFLICT',
      superior_source: 'Alteração Regulamentar AGT / BNA 2026',
      superior_level: 'LAW_REGULATION',
      inferior_source: 'Manuais Internos do Cliente',
      inferior_level: 'INTERNAL_POLICY',
      explanation: `Nova regulamentação: ${regulatorySummary}. As políticas do cliente requerem revisão obrigatória (POLICY_REVIEW_REQUIRED).`,
      action_taken: 'LOWER_RULE_BLOCKED_PENDING_HUMAN_REVIEW',
      detected_at: new Date().toISOString(),
      resolved: false
    };

    this.policyConflicts.set(conflictId, conflict);
    this.updateClientProfileMetrics(tenantId);
    return conflict;
  }

  private updateClientProfileMetrics(tenantId: string): void {
    let profile = this.clientProfiles.get(tenantId);
    if (!profile) {
      profile = {
        tenant_id: tenantId,
        tenant_name: `Tenant ${tenantId}`,
        active_documents: 0,
        active_policies: 0,
        departments: ['Geral'],
        mapped_employees: ['001'],
        policy_conflicts: 0,
        expired_documents: 0,
        pending_reviews: 0,
        critical_rules: 0,
        knowledge_version: `CKR-${tenantId}-2026.09.11-v1`,
        last_updated_at: new Date().toISOString()
      };
      this.clientProfiles.set(tenantId, profile);
    }

    const docs = Array.from(this.documents.values()).filter((d) => d.tenant_id === tenantId);
    const activeRules = Array.from(this.rules.values()).filter((r) => r.tenant_id === tenantId && r.status === 'ACTIVE');
    const conflicts = Array.from(this.policyConflicts.values()).filter((c) => c.tenant_id === tenantId && !c.resolved);

    profile.active_documents = docs.length;
    profile.active_policies = activeRules.length;
    profile.policy_conflicts = conflicts.length;
    profile.last_updated_at = new Date().toISOString();
  }

  // --- QUERY METHODS ---

  public getGlobalSummary(): CPEAA2026GlobalSummary {
    return {
      total_tenants_configured: this.clientProfiles.size,
      total_client_documents: this.documents.size,
      total_extracted_rules: this.rules.size,
      active_client_releases: this.clientProfiles.size,
      detected_policy_conflicts: this.policyConflicts.size,
      total_explainable_decisions: this.decisionTraces.size,
      last_updated_at: new Date().toISOString()
    };
  }

  public getClientProfile(tenantId: string): ClientKnowledgeProfileCPEAA | undefined {
    return this.clientProfiles.get(tenantId);
  }

  public listDocuments(tenantId?: string): ClientDocumentRecord[] {
    let list = Array.from(this.documents.values());
    if (tenantId) {
      list = list.filter((d) => d.tenant_id === tenantId);
    }
    return list;
  }

  public listRules(tenantId?: string): PolicyRuleCPEAA[] {
    let list = Array.from(this.rules.values());
    if (tenantId) {
      list = list.filter((r) => r.tenant_id === tenantId);
    }
    return list;
  }

  public listConflicts(tenantId?: string): PolicyConflictRecord[] {
    let list = Array.from(this.policyConflicts.values());
    if (tenantId) {
      list = list.filter((c) => c.tenant_id === tenantId);
    }
    return list;
  }

  public listTraces(tenantId?: string): ExplainableDecisionTrace[] {
    let list = Array.from(this.decisionTraces.values());
    if (tenantId) {
      list = list.filter((t) => t.tenant_id === tenantId);
    }
    return list;
  }
}

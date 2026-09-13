import { createHash } from 'crypto';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import {
  KnowledgeState,
  SourceLevel,
  VerificationStatus,
  ChangeCategory,
  KBUEImpactLevel,
  SourceRecord,
  KnowledgeDiffItem,
  EmployeeKnowledgeInventory,
  KnowledgeFreshnessMetrics,
  KBUEGlobalSummary
} from '@ai-employee/shared';

export class KBUEEngine {
  private static instance: KBUEEngine;

  private inventories: Map<string, EmployeeKnowledgeInventory> = new Map();
  private evidencePackages: Map<string, any> = new Map();

  private constructor() {
    this.initializeBaseline2026_09_11();
  }

  public static getInstance(): KBUEEngine {
    if (!KBUEEngine.instance) {
      KBUEEngine.instance = new KBUEEngine();
    }
    return KBUEEngine.instance;
  }

  private normalizeId(employeeId: string | number): string {
    const clean = String(employeeId).replace('#', '').trim();
    return clean.padStart(3, '0');
  }

  private initializeBaseline2026_09_11(): void {
    const cutoffDate = '2026-09-11T00:00:00.000Z';
    const baselineVer = '2026.09.11';

    for (const role of CANONICAL_500_ROLES) {
      const rawId = (role as any).employee_id || role.id;
      const empId = this.normalizeId(rawId);
      const dept = role.department || 'Strategy';
      const title = role.display_name || (role as any).title || role.role_key;
      const rawRisk = (role as any).risk || (role as any).canonical_risk;
      const risk = typeof rawRisk === 'object' && rawRisk?.level ? rawRisk.level : (typeof rawRisk === 'string' ? rawRisk : 'R2');

      const isHighRisk = risk === 'R4' || risk === 'R5';

      // Primary Official Sources (Level 1 Primary)
      const primarySources: SourceRecord[] = [
        {
          source_id: `src_dr_ao_${empId}`,
          source_name: 'Diário da República de Angola',
          source_type: 'OFFICIAL_GAZETTE',
          source_url: 'https://governo.gov.ao/diario-da-republica',
          jurisdiction: 'AO',
          document_title: 'Legislação e Regulamentação Sectorial Angola 2026',
          publication_date: '2026-01-15',
          effective_date: '2026-01-15',
          version: '2026.09.11',
          retrieved_at: cutoffDate,
          applies_to: ['Angola Tax', 'Angola Law', dept],
          evidence_excerpt_or_reference: 'Disposições regulamentares vigentes até 11 de Setembro de 2026.',
          verification_status: 'VERIFIED',
          level: 'LEVEL_1_PRIMARY'
        },
        {
          source_id: `src_agt_ao_${empId}`,
          source_name: 'Administração Geral Tributária (AGT)',
          source_type: 'TAX_AUTHORITY',
          source_url: 'https://agt.minfin.gov.ao',
          jurisdiction: 'AO',
          document_title: 'Código Tributário e Instruções Normativas 2026',
          publication_date: '2026-02-01',
          effective_date: '2026-02-01',
          version: '2026.09.11',
          retrieved_at: cutoffDate,
          applies_to: ['VAT', 'IRT', 'II', 'Stamp Tax'],
          evidence_excerpt_or_reference: 'Requisitos de faturação eletrónica e submissão e-fatura 2026.',
          verification_status: 'VERIFIED',
          level: 'LEVEL_1_PRIMARY'
        }
      ];

      // Initial Seed Diffs for Baseline 2026.09.11
      const initialDiffs: KnowledgeDiffItem[] = [
        {
          diff_id: `diff_2026_01_${empId}`,
          domain: dept,
          subdomain: 'Procedimentos e Regulamentação 2026',
          old_knowledge: 'Normativos e procedimentos da versão 2024/2025',
          current_evidence_at_2026_09_11: 'Atualização integral para o estado regulatório e tecnológico em 11/09/2026',
          difference: 'Inclusão das novas diretivas de faturação eletrónica, regras fiscais OGE 2026 e endpoints API v2026',
          category: 'REGULATORY',
          impact: isHighRisk ? 'HIGH' : 'MEDIUM',
          action_required: 'Atualizar system prompts e tabelas de decisão para a versão 2026.09.11',
          source_id: `src_dr_ao_${empId}`,
          verified: true
        }
      ];

      const inv: EmployeeKnowledgeInventory = {
        employee_id: empId,
        employee_name: title,
        department: dept,
        role: role.role_key,
        description: `Perfil de conhecimento profissional atualizado para ${title}`,
        jurisdictions: ['AO', 'GLOBAL'],
        industries: [dept],
        knowledge_domains: [dept, 'Gestão de Processos', 'Conformidade Legal & Regulamentar'],
        regulatory_domains: ['AGT', 'BNA', 'INSS', 'ARSEG', 'CMC', 'MINFIN', 'ISO_27001'],
        software_dependencies: ['PRIMAVERA_V10', 'EXCEL_2026', 'PHC_CS', 'SAP_S4'],
        api_dependencies: ['META_GRAPH_API_V20', 'LINKEDIN_MARKETING_API_V2026', 'GOOGLE_WORKSPACE_API_V1', 'MICROSOFT_GRAPH_API_V1'],
        data_dependencies: ['Diário da República', 'Instruções AGT/BNA', 'Manuais Técnicos'],
        professional_standards: ['PGC_ANGOLA', 'IFRS', 'ISSA', 'PMBOK_V7'],
        critical_decisions: [`Aprovação Operacional de ${title}`, 'Validação de Conformidade em Angola'],
        risk_level: risk,
        knowledge_sources: primarySources,
        diffs: initialDiffs,
        last_verified_at: cutoffDate,
        knowledge_baseline_version: baselineVer,
        state: 'READY_FOR_TEST',
        critical_gap_locked: false
      };

      this.inventories.set(empId, inv);
    }
  }

  public getInventory(employeeId: string | number): EmployeeKnowledgeInventory | undefined {
    return this.inventories.get(this.normalizeId(employeeId));
  }

  public listInventories(filter?: { department?: string; state?: string; risk?: string }): EmployeeKnowledgeInventory[] {
    let list = Array.from(this.inventories.values());
    if (filter?.department && filter.department !== 'ALL') {
      list = list.filter(i => i.department === filter.department);
    }
    if (filter?.state && filter.state !== 'ALL') {
      list = list.filter(i => i.state === filter.state);
    }
    if (filter?.risk && filter.risk !== 'ALL') {
      list = list.filter(i => i.risk_level === filter.risk);
    }
    return list;
  }

  public registerSource(employeeId: string | number, source: SourceRecord): EmployeeKnowledgeInventory {
    const empId = this.normalizeId(employeeId);
    const inv = this.inventories.get(empId);
    if (!inv) throw new Error(`Employee #${empId} não encontrado no inventário de conhecimento`);

    inv.knowledge_sources.push(source);
    inv.last_verified_at = new Date().toISOString();
    return inv;
  }

  public registerDiff(employeeId: string | number, diffInput: Omit<KnowledgeDiffItem, 'diff_id'>): EmployeeKnowledgeInventory {
    const empId = this.normalizeId(employeeId);
    const inv = this.inventories.get(empId);
    if (!inv) throw new Error(`Employee #${empId} não encontrado no inventário de conhecimento`);

    const diffId = `diff_${empId}_${Date.now()}`;
    const diff: KnowledgeDiffItem = {
      ...diffInput,
      diff_id: diffId
    };

    inv.diffs.push(diff);
    inv.state = 'CHANGE_DETECTED';
    inv.last_verified_at = new Date().toISOString();

    // Check if unverified CRITICAL diff exists to set critical_gap_locked
    const hasUnverifiedCritical = inv.diffs.some(d => d.impact === 'CRITICAL' && !d.verified);
    if (hasUnverifiedCritical) {
      inv.critical_gap_locked = true;
      inv.state = 'BLOCKED';
    }

    return inv;
  }

  public calculateFreshness(employeeId: string | number): KnowledgeFreshnessMetrics {
    const empId = this.normalizeId(employeeId);
    const inv = this.inventories.get(empId);
    if (!inv) {
      return {
        employee_id: empId,
        total_domains: 0,
        verified_domains: 0,
        outdated_domains: 0,
        updated_domains: 0,
        unverified_domains: 0,
        critical_gaps: 0,
        last_verified_at: new Date().toISOString(),
        knowledge_freshness_score: 0,
        critical_gap_locked: true
      };
    }

    const totalDomains = inv.knowledge_domains.length + inv.regulatory_domains.length + inv.software_dependencies.length;
    const unverifiedCritical = inv.diffs.filter(d => d.impact === 'CRITICAL' && !d.verified).length;
    const verifiedSources = inv.knowledge_sources.filter(s => s.verification_status === 'VERIFIED').length;
    const updatedDiffs = inv.diffs.filter(d => d.verified).length;

    const freshnessScore = Math.min(100, Math.round(((verifiedSources + updatedDiffs) / Math.max(1, inv.knowledge_sources.length + inv.diffs.length)) * 100));
    const locked = unverifiedCritical > 0 || inv.state === 'BLOCKED';

    return {
      employee_id: empId,
      total_domains: totalDomains,
      verified_domains: verifiedSources,
      outdated_domains: inv.diffs.filter(d => !d.verified).length,
      updated_domains: updatedDiffs,
      unverified_domains: inv.diffs.filter(d => !d.verified).length,
      critical_gaps: unverifiedCritical,
      last_verified_at: inv.last_verified_at,
      knowledge_freshness_score: freshnessScore,
      critical_gap_locked: locked
    };
  }

  public transitionState(employeeId: string | number, nextState: KnowledgeState): EmployeeKnowledgeInventory {
    const empId = this.normalizeId(employeeId);
    const inv = this.inventories.get(empId);
    if (!inv) throw new Error(`Employee #${empId} não encontrado no inventário`);

    if (nextState === 'READY_FOR_TEST' && inv.critical_gap_locked) {
      throw new Error(`Transição para READY_FOR_TEST bloqueada: Employee #${empId} contém lacuna crítica não verificada (Critical Gap Lock).`);
    }

    inv.state = nextState;
    inv.last_verified_at = new Date().toISOString();
    return inv;
  }

  public generateEvidencePackage(employeeId: string | number): any {
    const empId = this.normalizeId(employeeId);
    const inv = this.inventories.get(empId);
    if (!inv) throw new Error(`Employee #${empId} não encontrado no inventário`);

    const freshness = this.calculateFreshness(empId);
    const payload = `${empId}:${inv.knowledge_baseline_version}:${inv.last_verified_at}:${inv.diffs.length}:${freshness.knowledge_freshness_score}`;
    const packageHash = createHash('sha256').update(payload).digest('hex');

    const pkg = {
      package_path: `/knowledge-baseline/2026-09-11/${empId}/`,
      employee_id: empId,
      employee_name: inv.employee_name,
      department: inv.department,
      baseline_version: inv.knowledge_baseline_version,
      cutoff_date: '2026-09-11',
      package_hash: packageHash,
      files: {
        employee_profile: `${inv.employee_name} Baseline Profile`,
        source_register: inv.knowledge_sources,
        change_log: inv.diffs,
        knowledge_diff: inv.diffs.map(d => ({ domain: d.domain, diff: d.difference, impact: d.impact })),
        freshness_metrics: freshness,
        state: inv.state
      },
      generated_at: new Date().toISOString()
    };

    this.evidencePackages.set(empId, pkg);
    return pkg;
  }

  public getGlobalSummary(): KBUEGlobalSummary {
    let researched = 0;
    let updated = 0;
    let unchanged = 0;
    let criticalChanges = 0;
    let highChanges = 0;
    let criticalGaps = 0;
    let blocked = 0;
    let readyForTest = 0;
    let totalFreshness = 0;

    for (const inv of this.inventories.values()) {
      const f = this.calculateFreshness(inv.employee_id);
      totalFreshness += f.knowledge_freshness_score;

      if (inv.state === 'READY_FOR_TEST') readyForTest++;
      if (inv.state === 'BLOCKED') blocked++;
      if (inv.state === 'RESEARCHED') researched++;
      if (inv.state === 'KNOWLEDGE_UPDATED') updated++;

      for (const d of inv.diffs) {
        if (d.impact === 'CRITICAL') criticalChanges++;
        if (d.impact === 'HIGH') highChanges++;
        if (d.impact === 'CRITICAL' && !d.verified) criticalGaps++;
      }

      if (inv.diffs.length === 0) unchanged++;
    }

    const count = this.inventories.size;

    return {
      total_employees: count,
      baseline_version: '2026.09.11',
      cutoff_date: '2026-09-11',
      researched_count: researched,
      updated_count: updated,
      unchanged_count: unchanged,
      critical_changes_count: criticalChanges,
      high_changes_count: highChanges,
      critical_gaps_count: criticalGaps,
      blocked_count: blocked,
      ready_for_test_count: readyForTest,
      average_freshness_score: Math.round(totalFreshness / Math.max(1, count))
    };
  }
}

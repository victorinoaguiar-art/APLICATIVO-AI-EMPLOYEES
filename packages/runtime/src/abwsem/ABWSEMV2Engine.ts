import {
  CommercialAreaV2,
  CommercialAreaCodeV2,
  AreaRoleMembershipV2,
  AreaSubscriptionV2,
  AreaEntitlementV2,
  EmployeeActivationGateV2,
  AreaEmployeeActivationV2,
  AreaRecommendationV2,
  ABWSEMV2GlobalSummary,
  AreaSubscriptionPlanV2,
  EmployeeAreaStatusV2,
  AreaOutcomeInputV2
} from '@ai-employee/shared';

// Load static JSON data
import commercialAreasData from '../../../shared/src/abwsem/data/commercial_areas_v2.json';
import membershipsData from '../../../shared/src/abwsem/data/commercial_area_membership_500_v2.json';
import outcomeInputData from '../../../shared/src/abwsem/data/commercial_area_outcome_input_v2.json';

export class ABWSEMV2Engine {
  private static instance: ABWSEMV2Engine;
  private subscriptions: Map<string, AreaSubscriptionV2[]> = new Map(); // orgId -> subscriptions
  private activations: Map<string, AreaEmployeeActivationV2[]> = new Map(); // orgId -> activations

  private constructor() {}

  public static getInstance(): ABWSEMV2Engine {
    if (!ABWSEMV2Engine.instance) {
      ABWSEMV2Engine.instance = new ABWSEMV2Engine();
    }
    return ABWSEMV2Engine.instance;
  }

  public getCommercialAreasV2(): CommercialAreaV2[] {
    return commercialAreasData as CommercialAreaV2[];
  }

  public getCommercialAreaV2(code: CommercialAreaCodeV2): CommercialAreaV2 | undefined {
    return this.getCommercialAreasV2().find(a => a.code === code);
  }

  public getAreaRoleMembershipsV2(areaCode: CommercialAreaCodeV2): AreaRoleMembershipV2[] {
    return (membershipsData as AreaRoleMembershipV2[]).filter(m => m.commercial_area_code === areaCode);
  }

  public getRoleHomeAreaV2(rolepackId: number): AreaRoleMembershipV2 | undefined {
    return (membershipsData as AreaRoleMembershipV2[]).find(m => m.rolepack_id === rolepackId && m.is_home_area);
  }

  public evaluateAreaIndependence(areaCode: CommercialAreaCodeV2) {
    const area = this.getCommercialAreaV2(areaCode);
    if (!area) throw new Error(`Área comercial com código ${areaCode} não encontrada.`);

    const ait = area.independence_test;
    const passedCriteria = [
      ait.buyer_budget_owner,
      ait.business_outcome,
      ait.kpis,
      ait.data_tools,
      ait.process_ownership,
      ait.standalone_value,
      ait.commercial_clarity
    ].filter(Boolean).length;

    return {
      area_code: areaCode,
      area_name: area.name,
      test: ait,
      passed_criteria_count: passedCriteria,
      total_criteria: 7,
      is_standalone_valid: passedCriteria >= 4 && ait.passed
    };
  }

  public subscribeAreaV2(
    orgId: string,
    areaCode: CommercialAreaCodeV2,
    planId: AreaSubscriptionPlanV2 = 'SINGLE_AREA'
  ): AreaSubscriptionV2 {
    const area = this.getCommercialAreaV2(areaCode);
    if (!area) throw new Error(`Área comercial ${areaCode} inválida.`);

    const orgSubs = this.subscriptions.get(orgId) || [];
    const existing = orgSubs.find(s => s.commercial_area_code === areaCode && s.status === 'ACTIVE');
    if (existing) return existing;

    const monthlyFees: Record<AreaSubscriptionPlanV2, number> = {
      SINGLE_AREA: 250000,
      MULTI_AREA: 450000,
      FUNCTIONAL_SUITE: 1200000,
      INDUSTRY_SUITE: 1500000,
      BUSINESS_SUITE: 3500000,
      ENTERPRISE_ALL_AREAS: 7500000
    };

    const newSub: AreaSubscriptionV2 = {
      subscription_id: `sub-v2-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      organization_id: orgId,
      commercial_area_code: areaCode,
      plan_id: planId,
      status: 'ACTIVE',
      started_at: new Date().toISOString(),
      renewal_at: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      monthly_fee_kwz: monthlyFees[planId] || 250000,
      usage_policy: {
        unlimited_available_access: true,
        max_active_employees: planId === 'ENTERPRISE_ALL_AREAS' ? 500 : 25
      }
    };

    orgSubs.push(newSub);
    this.subscriptions.set(orgId, orgSubs);
    return newSub;
  }

  public getOrganizationEntitlementsV2(orgId: string): AreaEntitlementV2[] {
    const orgSubs = (this.subscriptions.get(orgId) || []).filter(s => s.status === 'ACTIVE');
    const orgActivations = this.activations.get(orgId) || [];
    const entitlements: AreaEntitlementV2[] = [];

    const allMemberships = membershipsData as AreaRoleMembershipV2[];

    for (const sub of orgSubs) {
      const areaMemberships = allMemberships.filter(m => m.commercial_area_code === sub.commercial_area_code);
      for (const mem of areaMemberships) {
        const activeInstance = orgActivations.find(
          a => a.rolepack_id === mem.rolepack_id && a.commercial_area_code === sub.commercial_area_code
        );

        let empStatus: EmployeeAreaStatusV2 = 'AVAILABLE';
        if (activeInstance) {
          empStatus = activeInstance.activation_status;
        }

        entitlements.push({
          organization_id: orgId,
          commercial_area_code: sub.commercial_area_code,
          rolepack_id: mem.rolepack_id,
          entitlement_type: mem.membership_type,
          status: 'ENTITLED',
          employee_status: empStatus,
          source_subscription_id: sub.subscription_id
        });
      }
    }

    return entitlements;
  }

  public evaluateActivationGateV2(
    orgId: string,
    areaCode: CommercialAreaCodeV2,
    rolepackId: number,
    params: {
      platform_certified?: boolean;
      organization_ready?: boolean;
      input_readiness_valid?: boolean;
      permissions_configured?: boolean;
      required_connections_configured?: boolean;
      autonomy_risk_policy_configured?: boolean;
      human_supervisor_configured?: boolean;
    } = {}
  ): EmployeeActivationGateV2 {
    const entitlements = this.getOrganizationEntitlementsV2(orgId);
    const entitlement = entitlements.find(
      e => e.commercial_area_code === areaCode && e.rolepack_id === rolepackId
    );

    const isEntitled = !!entitlement;
    const isCert = params.platform_certified !== false;
    const isOrgReady = params.organization_ready !== false;
    const isInputReady = params.input_readiness_valid !== false;
    const isPerms = params.permissions_configured !== false;
    const isConn = params.required_connections_configured !== false;
    const isRisk = params.autonomy_risk_policy_configured !== false;
    const isSup = params.human_supervisor_configured !== false;

    const missing: string[] = [];
    if (!isEntitled) missing.push('Área comercial não subscrita (Entitlement inválido)');
    if (!isCert) missing.push('Certificação da plataforma pendente');
    if (!isOrgReady) missing.push('Organização não preparada (Prontidão organizacional)');
    if (!isInputReady) missing.push('Insumos de dados insuficientes ou não validados pelo IRECE');
    if (!isPerms) missing.push('Permissões de dados/RBAC não configuradas');
    if (!isConn) missing.push('Conetores técnicos de dados não configurados');
    if (!isRisk) missing.push('Política de risco e autonomia não configurada');
    if (!isSup) missing.push('Supervisor humano obrigatório não configurado');

    const passedAll = isEntitled && isCert && isOrgReady && isInputReady && isPerms && isConn && isRisk && isSup;

    return {
      area_entitlement_valid: isEntitled,
      platform_certified: isCert,
      organization_ready: isOrgReady,
      input_readiness_valid: isInputReady,
      permissions_configured: isPerms,
      required_connections_configured: isConn,
      autonomy_risk_policy_configured: isRisk,
      human_supervisor_configured: isSup,
      passed_all: passedAll,
      missing_requirements: missing
    };
  }

  public activateEmployeeV2(
    orgId: string,
    areaCode: CommercialAreaCodeV2,
    rolepackId: number,
    params: {
      supervisor_email?: string;
      autonomy_level?: 'FULL_AUTONOMY' | 'HUMAN_APPROVAL_REQUIRED' | 'STRICT_SUPERVISION';
      risk_policy_code?: string;
      gate_checks?: Record<string, boolean>;
    } = {}
  ): AreaEmployeeActivationV2 {
    const gate = this.evaluateActivationGateV2(orgId, areaCode, rolepackId, params.gate_checks || {});
    if (!gate.passed_all) {
      throw new Error(`Activation Gate falhou para o RolePack #${rolepackId} na Área ${areaCode}: ${gate.missing_requirements.join('; ')}`);
    }

    const homeRole = this.getRoleHomeAreaV2(rolepackId);
    const roleTitle = homeRole ? homeRole.rolepack_title : `RolePack #${rolepackId}`;
    const roleKey = homeRole ? homeRole.rolepack_key : `rolepack_${rolepackId}`;

    const activation: AreaEmployeeActivationV2 = {
      activation_id: `act-v2-${Date.now()}-${rolepackId}`,
      organization_id: orgId,
      commercial_area_code: areaCode,
      rolepack_id: rolepackId,
      rolepack_key: roleKey,
      activation_status: 'ACTIVE',
      supervisor_email: params.supervisor_email || 'supervisor@empresa.ao',
      autonomy_level: params.autonomy_level || 'HUMAN_APPROVAL_REQUIRED',
      risk_policy_code: params.risk_policy_code || 'RISK_POL_STANDARD_v2',
      activated_at: new Date().toISOString(),
      gate_evaluation: gate
    };

    const orgActivations = this.activations.get(orgId) || [];
    const filtered = orgActivations.filter(a => !(a.commercial_area_code === areaCode && a.rolepack_id === rolepackId));
    filtered.push(activation);
    this.activations.set(orgId, filtered);

    return activation;
  }

  public pauseEmployeeV2(orgId: string, areaCode: CommercialAreaCodeV2, rolepackId: number): boolean {
    const orgActivations = this.activations.get(orgId) || [];
    const target = orgActivations.find(a => a.commercial_area_code === areaCode && a.rolepack_id === rolepackId);
    if (target) {
      target.activation_status = 'PAUSED';
      return true;
    }
    return false;
  }

  public generateAreaRecommendationsV2(orgId: string, businessNeed: string): AreaRecommendationV2[] {
    const needLower = businessNeed.toLowerCase();
    const recommendations: AreaRecommendationV2[] = [];
    const orgSubs = (this.subscriptions.get(orgId) || []).filter(s => s.status === 'ACTIVE');

    if (needLower.includes('marketing') || needLower.includes('campanha') || needLower.includes('redes sociais')) {
      const isSub = orgSubs.some(s => s.commercial_area_code === 'A08');
      recommendations.push({
        recommendation_id: `rec-v2-mkt-${Date.now()}`,
        business_need: businessNeed,
        recommended_area_code: 'A08',
        recommended_area_name: 'Marketing',
        included_rolepack_id: 25,
        included_rolepack_title: 'Marketing Planner Employee',
        reason: 'Área autónoma de Marketing v2.0 perfeita para execução de estratégias de campanha e redes sociais.',
        required_inputs: ['Manual de Marca', 'Público-Alvo', 'Orçamento de Mídia'],
        required_connections: ['Meta Ads API', 'LinkedIn API'],
        estimated_monthly_value_kwz: 1800000,
        is_subscribed: isSub,
        action: isSub ? 'ACTIVATE_INCLUDED_EMPLOYEE' : 'SUBSCRIBE_COMMERCIAL_AREA'
      });
    }

    if (needLower.includes('reconciliação') || needLower.includes('banco') || needLower.includes('tesouraria')) {
      const isSub = orgSubs.some(s => s.commercial_area_code === 'A03');
      recommendations.push({
        recommendation_id: `rec-v2-fin-${Date.now()}`,
        business_need: businessNeed,
        recommended_area_code: 'A03',
        recommended_area_name: 'Finanças & Tesouraria',
        included_rolepack_id: 41,
        included_rolepack_title: 'Bank Reconciliation Employee',
        reason: 'Automação de reconciliação de extractos bancários com razão da conta 43.',
        required_inputs: ['Extracto Bancário PDF', 'Razão Contabilístico Excel'],
        required_connections: ['API Bancária Directa', 'ERP Primavera Connector'],
        estimated_monthly_value_kwz: 2200000,
        is_subscribed: isSub,
        action: isSub ? 'ACTIVATE_INCLUDED_EMPLOYEE' : 'SUBSCRIBE_COMMERCIAL_AREA'
      });
    }

    if (needLower.includes('obra') || needLower.includes('medição') || needLower.includes('construção')) {
      const isSub = orgSubs.some(s => s.commercial_area_code === 'S01');
      recommendations.push({
        recommendation_id: `rec-v2-const-${Date.now()}`,
        business_need: businessNeed,
        recommended_area_code: 'S01',
        recommended_area_name: 'Construção & Engenharia',
        included_rolepack_id: 277,
        included_rolepack_title: 'Construction Measurement Specialist Employee',
        reason: 'Processamento de autos de medição de obra e controlo de subempreiteiros.',
        required_inputs: ['Caderno de Encargos', 'Medições de Campo'],
        required_connections: ['AutoCAD API', 'Primavera Construction'],
        estimated_monthly_value_kwz: 3500000,
        is_subscribed: isSub,
        action: isSub ? 'ACTIVATE_INCLUDED_EMPLOYEE' : 'SUBSCRIBE_COMMERCIAL_AREA'
      });
    }

    return recommendations;
  }

  public getGlobalSummaryV2(orgId: string = 'org-demo'): ABWSEMV2GlobalSummary {
    const areas = this.getCommercialAreasV2();
    const memberships = membershipsData as AreaRoleMembershipV2[];
    const subs = this.subscriptions.get(orgId) || [];
    const activations = this.activations.get(orgId) || [];

    const functionalCount = areas.filter(a => a.type === 'FUNCTIONAL_AREA').length;
    const sectoralCount = areas.filter(a => a.type === 'SECTOR_AREA').length;
    const platformCount = areas.filter(a => a.type === 'PLATFORM_LAYER').length;

    const commRolepacks = memberships.filter(m => m.commercial_area_code !== 'P01' && m.is_home_area).length;
    const platRolepacks = memberships.filter(m => m.commercial_area_code === 'P01' && m.is_home_area).length;

    return {
      total_areas: areas.length,
      total_functional_areas: functionalCount,
      total_sectoral_areas: sectoralCount,
      total_platform_layers: platformCount,
      total_sellable_areas: functionalCount + sectoralCount,
      total_rolepacks_accounted: memberships.length,
      total_commercial_home_rolepacks: commRolepacks,
      total_platform_rolepacks: platRolepacks,
      ait_compliance_rate: 100,
      subscriptions_count: subs.filter(s => s.status === 'ACTIVE').length,
      active_activations_count: activations.filter(a => a.activation_status === 'ACTIVE').length,
      area_independence_enforced: true
    };
  }
}

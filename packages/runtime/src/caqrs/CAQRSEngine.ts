import {
  AcceptanceState,
  FeedbackCategory,
  ClientFeedbackRecord,
  OrganizationPreferenceRule,
  PreferenceScope,
  RevisionPlan,
  CAQRSGlobalSummary
} from '@ai-employee/shared';
import { EREMSEngine } from '../erems/EREMSEngine.js';

export class CAQRSEngine {
  private static instance: CAQRSEngine;
  private feedbackRecords: Map<string, ClientFeedbackRecord> = new Map();
  private preferenceRules: Map<string, OrganizationPreferenceRule> = new Map();
  private revisionPlans: Map<string, RevisionPlan> = new Map();

  private eremsEngine: EREMSEngine;

  private constructor() {
    this.eremsEngine = EREMSEngine.getInstance();
    this.seedBaselinePreferences();
  }

  public static getInstance(): CAQRSEngine {
    if (!CAQRSEngine.instance) {
      CAQRSEngine.instance = new CAQRSEngine();
    }
    return CAQRSEngine.instance;
  }

  private seedBaselinePreferences(): void {
    const defaultRule: OrganizationPreferenceRule = {
      ruleId: 'pref_default_001',
      organizationId: 'tenant_enterprise_001',
      scope: 'ORGANIZATION_GLOBAL',
      targetCategory: 'FORMAT_PREFERENCE',
      preferenceKey: 'EXECUTIVE_SUMMARY_FORMAT',
      preferenceValue: 'EXECUTIVE_SUMMARY_FIRST_WITH_METRICS_TABLE',
      sourceFeedbackId: 'init_seed',
      learnedAt: new Date().toISOString()
    };
    this.preferenceRules.set(defaultRule.ruleId, defaultRule);
  }

  public processClientFeedback(
    employeeId: number,
    roleKey: string,
    workProductId: string,
    acceptanceState: AcceptanceState,
    category: FeedbackCategory,
    comment: string,
    requestedChanges: string[] = [],
    preferenceScope?: PreferenceScope
  ): { feedback: ClientFeedbackRecord; revisionPlan?: RevisionPlan } {
    const isObjectiveError =
      category === 'OBJECTIVE_ERROR' ||
      category === 'MATERIAL_ERROR' ||
      category === 'INCOMPLETE_WORK' ||
      category === 'INSTRUCTION_MISS';

    const feedbackId = `fb_${employeeId}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    let learnedPreferenceRule: string | undefined = undefined;

    // 1. Controlled Preference Learning if category is preference
    if (
      category === 'CLIENT_PREFERENCE' ||
      category === 'STYLE_PREFERENCE' ||
      category === 'FORMAT_PREFERENCE' ||
      category === 'TONE_PREFERENCE' ||
      category === 'LENGTH_PREFERENCE' ||
      category === 'LAYOUT_PREFERENCE'
    ) {
      const prefRule = this.learnOrganizationPreference(
        'tenant_enterprise_001',
        category,
        `PREF_${category}`,
        comment,
        feedbackId,
        preferenceScope || 'ORGANIZATION_GLOBAL'
      );
      learnedPreferenceRule = prefRule.ruleId;
    }

    // 2. Feed EREMS engine ONLY if it is an objective/material error
    if (isObjectiveError) {
      const severity = category === 'MATERIAL_ERROR' ? 'E3_MATERIAL' : 'E2_OPERATIONAL';
      const taxonomyCat = category === 'MATERIAL_ERROR' ? 'CALCULATION_ERROR' : 'WORKFLOW_ERROR';
      this.eremsEngine.logIncident(
        employeeId,
        severity,
        taxonomyCat,
        `Feedback de cliente com erro objetivo: ${comment}`,
        category === 'MATERIAL_ERROR',
        true // isUndetected (arrived at client)
      );
    }

    const feedback: ClientFeedbackRecord = {
      feedbackId,
      employeeId,
      roleKey,
      workProductId,
      acceptanceState,
      category,
      isObjectiveError,
      comment,
      requestedChanges,
      learnedPreferenceRule,
      preferenceScope,
      timestamp: new Date().toISOString()
    };

    this.feedbackRecords.set(feedbackId, feedback);

    // 3. Generate Revision Plan if Revision Required or Minor Changes requested
    let revisionPlan: RevisionPlan | undefined = undefined;
    if (acceptanceState === 'REVISION_REQUIRED' || acceptanceState === 'ACCEPTED_WITH_MINOR_CHANGES') {
      revisionPlan = this.generateRevisionPlan(workProductId, employeeId, requestedChanges);
    }

    return { feedback, revisionPlan };
  }

  public learnOrganizationPreference(
    organizationId: string,
    category: FeedbackCategory,
    preferenceKey: string,
    preferenceValue: string,
    sourceFeedbackId: string,
    scope: PreferenceScope = 'ORGANIZATION_GLOBAL'
  ): OrganizationPreferenceRule {
    const ruleId = `pref_${organizationId}_${Date.now()}_${Math.floor(Math.random() * 100)}`;
    const rule: OrganizationPreferenceRule = {
      ruleId,
      organizationId,
      scope,
      targetCategory: category,
      preferenceKey,
      preferenceValue,
      sourceFeedbackId,
      learnedAt: new Date().toISOString()
    };

    this.preferenceRules.set(ruleId, rule);
    return rule;
  }

  public generateRevisionPlan(
    workProductId: string,
    employeeId: number,
    requestedChanges: string[]
  ): RevisionPlan {
    const planId = `plan_rev_${workProductId}_${Date.now()}`;
    const plan: RevisionPlan = {
      planId,
      workProductId,
      employeeId,
      revisionNumber: 1,
      preservedSections: ['Enquadramento Geral', 'Sumário de Indicadores', 'Anexos Técnicos'],
      modifiedSections: requestedChanges.length > 0 ? requestedChanges : ['Secção de Conclusões & Formatação'],
      newInputsRequired: [],
      estimatedReworkMinutes: 15,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    this.revisionPlans.set(planId, plan);
    return plan;
  }

  public getLearnedPreferences(organizationId: string = 'tenant_enterprise_001'): OrganizationPreferenceRule[] {
    return Array.from(this.preferenceRules.values()).filter((r) => r.organizationId === organizationId);
  }

  public getGlobalSummary(): CAQRSGlobalSummary {
    const feedbacks = Array.from(this.feedbackRecords.values());
    const totalDeliveries = feedbacks.length > 0 ? feedbacks.length : 50;

    const acceptedFirstPass = feedbacks.filter(
      (f) => f.acceptanceState === 'ACCEPTED' && !f.isObjectiveError
    ).length;

    // Baseline 48 first pass accepted if empty
    const firstPassCount = feedbacks.length === 0 ? 48 : acceptedFirstPass;

    const firstPassAcceptanceRate = Number(((firstPassCount / totalDeliveries) * 100).toFixed(2));
    const totalRevisionsRequested = feedbacks.filter((f) => f.acceptanceState === 'REVISION_REQUIRED').length;
    const revisionRate = Number(((totalRevisionsRequested / totalDeliveries) * 100).toFixed(2));

    const feedbackCategoryBreakdown: Record<string, number> = {};
    feedbacks.forEach((f) => {
      feedbackCategoryBreakdown[f.category] = (feedbackCategoryBreakdown[f.category] || 0) + 1;
    });

    return {
      totalDeliveries,
      acceptedFirstPass: firstPassCount,
      firstPassAcceptanceRate,
      totalRevisionsRequested,
      revisionRate,
      qualityPerceptionIndex: Number((94.5 + (firstPassAcceptanceRate > 90 ? 2 : 0)).toFixed(1)),
      feedbackCategoryBreakdown,
      totalLearnedPreferences: this.preferenceRules.size,
      timestamp: new Date().toISOString()
    };
  }
}

export type AcceptanceState =
  | 'NOT_DELIVERED'
  | 'DELIVERED'
  | 'AWAITING_REVIEW'
  | 'ACCEPTED'
  | 'ACCEPTED_WITH_MINOR_CHANGES'
  | 'REVISION_REQUIRED'
  | 'REJECTED'
  | 'ESCALATED'
  | 'WITHDRAWN'
  | 'SUPERSEDED';

export type FeedbackCategory =
  | 'OBJECTIVE_ERROR'
  | 'MATERIAL_ERROR'
  | 'INCOMPLETE_WORK'
  | 'INSTRUCTION_MISS'
  | 'CLIENT_PREFERENCE'
  | 'STYLE_PREFERENCE'
  | 'FORMAT_PREFERENCE'
  | 'TONE_PREFERENCE'
  | 'LENGTH_PREFERENCE'
  | 'LAYOUT_PREFERENCE'
  | 'TEMPLATE_MISMATCH'
  | 'BRANDING_MISMATCH'
  | 'AUDIENCE_MISMATCH'
  | 'LANGUAGE_MISMATCH'
  | 'DETAIL_LEVEL_MISMATCH'
  | 'NEW_REQUIREMENT'
  | 'SCOPE_CHANGE'
  | 'CLIENT_CHANGED_MIND'
  | 'LATE_REQUIREMENT'
  | 'POLICY_CONFLICT'
  | 'LEGAL_CONSTRAINT'
  | 'UNSUPPORTED_REQUEST'
  | 'DATA_CHANGED'
  | 'SOURCE_CHANGED'
  | 'SYSTEM_CHANGED'
  | 'OTHER';

export type PreferenceScope =
  | 'ORGANIZATION_GLOBAL'
  | 'DEPARTMENT_DEFAULT'
  | 'ROLE_DEFAULT'
  | 'CLIENT_SPECIFIC'
  | 'PROJECT_SPECIFIC';

export interface ClientFeedbackRecord {
  feedbackId: string;
  employeeId: number;
  roleKey: string;
  workProductId: string;
  acceptanceState: AcceptanceState;
  category: FeedbackCategory;
  isObjectiveError: boolean; // True if OBJECTIVE_ERROR or MATERIAL_ERROR
  comment: string;
  requestedChanges: string[];
  learnedPreferenceRule?: string;
  preferenceScope?: PreferenceScope;
  timestamp: string;
}

export interface OrganizationPreferenceRule {
  ruleId: string;
  organizationId: string;
  scope: PreferenceScope;
  targetCategory: FeedbackCategory;
  preferenceKey: string; // e.g. "DOCUMENT_TONE", "REPORT_LENGTH"
  preferenceValue: string; // e.g. "FORMAL_CONCISE", "EXECUTIVE_SUMMARY_FIRST"
  sourceFeedbackId: string;
  learnedAt: string;
}

export interface RevisionPlan {
  planId: string;
  workProductId: string;
  employeeId: number;
  revisionNumber: number;
  preservedSections: string[];
  modifiedSections: string[];
  newInputsRequired: string[];
  estimatedReworkMinutes: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
}

export interface CAQRSGlobalSummary {
  totalDeliveries: number;
  acceptedFirstPass: number;
  firstPassAcceptanceRate: number; // FPAR % (0..100)
  totalRevisionsRequested: number;
  revisionRate: number; // % (0..100)
  qualityPerceptionIndex: number; // 0..100 score
  feedbackCategoryBreakdown: Record<string, number>;
  totalLearnedPreferences: number;
  timestamp: string;
}

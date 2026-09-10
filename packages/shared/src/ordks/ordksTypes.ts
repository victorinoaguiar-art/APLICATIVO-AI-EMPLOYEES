export enum KnowledgePrecedenceLevel {
  PLATFORM_SAFETY_RULES = 1,
  CERTIFIED_ROLE_PACK_CONSTRAINTS = 2,
  APPLICABLE_LAW_REGULATION = 3,
  ORGANIZATION_POLICY = 4,
  APPROVED_SOP_PROCESS = 5,
  CERTIFIED_SYSTEM_DOCUMENTATION = 6,
  VERIFIED_DOMAIN_KNOWLEDGE = 7,
  VERIFIED_INDUSTRY_KNOWLEDGE = 8,
  VALIDATED_CASE_LIBRARY = 9,
  VALIDATED_OPERATIONAL_MEMORY = 10,
  GENERAL_MODEL_KNOWLEDGE = 11
}

export type KnowledgeStatus =
  | 'DRAFT'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'ACTIVE'
  | 'STALE'
  | 'SUPERSEDED'
  | 'DEPRECATED'
  | 'REJECTED'
  | 'QUARANTINED';

export interface KnowledgeItem {
  knowledgeId: string;
  title: string;
  knowledgeType: 'LAW' | 'POLICY' | 'SOP' | 'SYSTEM_DOC' | 'DOMAIN' | 'INDUSTRY' | 'CASE' | 'EXCEPTION' | 'MEMORY';
  domain: string;
  department: string;
  employeeIds: number[];
  industry?: string;
  jurisdiction?: string;
  organizationId?: string;
  systemName?: string;
  processKey?: string;
  sourceType: string;
  sourceReference: string;
  sourceUrlOrFileRef?: string;
  sourceVersion: string;
  effectiveFrom: string;
  effectiveUntil?: string;
  lastVerifiedAt: string;
  verificationStatus: KnowledgeStatus;
  authorityLevel: KnowledgePrecedenceLevel;
  confidence: number;
  sensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'STRICTLY_CONFIDENTIAL';
  classification: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED';
  language: string;
  locale: string;
  tags: string[];
  contentHash: string;
  supersedes?: string;
  supersededBy?: string;
  owner: string;
  reviewer?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExceptionPattern {
  exceptionId: string;
  code: string;
  title: string;
  category: 'MISSING_DATA' | 'DATA_QUALITY' | 'SYSTEM_TIMEOUT' | 'POLICY_BREACH' | 'MONETARY_THRESHOLD' | 'OPERATIONAL_ERROR';
  symptoms: string[];
  rootCauses: string[];
  workaroundProcedure: string[];
  escalationTrigger: string;
  approvalRequired: string;
  preventionControl: string;
  department: string;
  affectedRoleKeys: string[];
}

export interface RoleKnowledgeProfile {
  employeeId: number;
  roleKey: string;
  displayName: string;
  department: string;
  coreConcepts: string[];
  standardTasks: string[];
  commonInputs: string[];
  commonOutputs: string[];
  documentsEncountered: string[];
  systemsUsed: string[];
  normalWorkflow: string[];
  domainRules: string[];
  calculations: string[];
  decisionRules: string[];
  validationRules: string[];
  commonErrors: string[];
  exceptionPatterns: ExceptionPattern[];
  escalationRules: string[];
  evidenceRequirements: string[];
  completionRules: string[];
  relevantKpis: string[];
}

export interface DepartmentKnowledgePack {
  departmentCode: string;
  departmentNamePt: string;
  departmentNameEn: string;
  objectives: string[];
  coreProcesses: string[];
  commonDataProducts: string[];
  commonDocuments: string[];
  commonSystems: string[];
  commonControls: string[];
  commonRisks: string[];
  commonMetrics: string[];
  commonTerminology: Record<string, string>;
}

export interface IndustryPack {
  industryCode: string;
  namePt: string;
  nameEn: string;
  sectorSpecificRules: string[];
  keyTerminology: Record<string, string>;
  commonComplianceFrameworks: string[];
  typicalDocumentSchemas: string[];
}

export interface JurisdictionPack {
  jurisdictionCode: string;
  countryName: string;
  legalFrameworks: {
    code: string;
    title: string;
    authority: string;
    description: string;
  }[];
  taxRegimes: {
    name: string;
    rates: Record<string, number | string>;
    reportingFrequencies: string[];
  }[];
  accountingStandards: string[];
  laborRegulations: string[];
}

export interface ORDKSQueryContext {
  organizationId: string;
  tenantId: string;
  employeeId: number;
  roleKey: string;
  department: string;
  industry?: string;
  jurisdiction?: string;
  queryText: string;
  minPrecedenceLevel?: KnowledgePrecedenceLevel;
}

export interface ORDKSQueryResult {
  matchedKnowledgeItems: KnowledgeItem[];
  appliedPrecedenceHierarchy: string[];
  roleProfile: RoleKnowledgeProfile;
  jurisdictionHighlights?: string[];
  exceptionsIdentified?: ExceptionPattern[];
  synthesisSummary: string;
}

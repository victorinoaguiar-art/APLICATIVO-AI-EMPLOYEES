export type CompetencyCertificationLevel =
  | 'CERTIFIED'
  | 'CERTIFIED_WITH_SUPERVISION'
  | 'READY_FOR_RETRAINING'
  | 'NOT_CERTIFIED'
  | 'DEGRADED'
  | 'NOT_TESTED'
  | 'UNSUPPORTED';

export type CompetencyKnowledgeObjectStatus = 'VERIFIED' | 'UNVERIFIED' | 'DEGRADED';

export type PhysicalSourceVerification =
  | 'VERIFIED'
  | 'PHYSICAL_FILE_PRESENT'
  | 'PHYSICAL_FILE_MISSING'
  | 'HASH_MATCH'
  | 'HASH_MISMATCH'
  | 'DEGRADED';

export type TaskEligibilityDecision =
  | 'TASK_ALLOWED'
  | 'TASK_ALLOWED_WITH_SUPERVISION'
  | 'TASK_BLOCKED_NOT_CERTIFIED'
  | 'TASK_BLOCKED_MISSING_SOURCE'
  | 'TASK_BLOCKED_DEGRADED_KNOWLEDGE'
  | 'TASK_BLOCKED_WRONG_JURISDICTION'
  | 'TASK_BLOCKED_CRITICAL_FAILURE'
  | 'DENIED_CROSS_TENANT';

export interface PhysicalSourceRecord {
  sourceId: string;
  title: string;
  author?: string;
  publisher?: string;
  institution?: string;
  sourceType: 'PDF' | 'TXT' | 'MD' | 'DOCX' | 'JSON';
  physicalPath: string;
  fileName: string;
  fileSize: number;
  declaredSha256: string;
  physicalSha256?: string;
  verificationStatus: PhysicalSourceVerification;
  version: string;
  language: string;
  createdAt: string;
  lastVerifiedAt: string;
}

export interface KnowledgeObjectRecord {
  knowledgeObjectId: string;
  title: string;
  description: string;
  competencyId: string;
  sourceIds: string[];
  sourceFragments: string[];
  rules: string[];
  procedures: string[];
  taskTypes: string[];
  verificationStatus: CompetencyKnowledgeObjectStatus;
  version: string;
  createdAt: string;
}

export interface CompetencyDefinitionRecord {
  competencyId: string;
  name: string;
  description: string;
  domain: string;
  subdomain: string;
  jurisdictionSensitive: boolean;
  taskTypesSupported: string[];
  requiredKnowledgeObjectIds: string[];
  requiredSourceIds: string[];
  requiredTestIds: string[];
  criticalFailureRules: string[];
  minimumScore: number;
  certificationPolicy: string;
  version: string;
  status: 'ACTIVE' | 'DEGRADED' | 'UNSUPPORTED';
  createdAt: string;
}

export interface CompetencyTestRecord {
  testId: string;
  competencyId: string;
  name: string;
  description: string;
  taskType: string;
  rubric: Array<{ criterion: string; weightPercent: number }>;
  scorePercent: number;
  passed: boolean;
  criticalFailureOccurred: boolean;
  criticalFailureReason?: string;
  executedAt: string;
}

export interface CompetencyCertificationRecord {
  certificationId: string;
  instanceId: string;
  competencyId: string;
  jurisdiction: string;
  taskType: string;
  testCount: number;
  passedTests: number;
  failedTests: number;
  criticalFailures: number;
  scorePercent: number;
  certificationLevel: CompetencyCertificationLevel;
  issuedAt: string;
  expiresAt?: string;
  lastRevalidatedAt: string;
}

export interface CompetencyPassport {
  instanceId: string;
  catalogEmployeeId: number;
  displayName: string;
  companyId: string;
  tenantId: string;
  certifications: CompetencyCertificationRecord[];
  updatedAt: string;
}

export interface TaskEligibilityResult {
  taskId?: string;
  instanceId: string;
  companyId: string;
  tenantId: string;
  taskType: string;
  requiredCompetencyId: string;
  competencyName: string;
  knowledgeStatus: CompetencyKnowledgeObjectStatus;
  physicalSourcesCount: number;
  physicalSourcesPresent: number;
  hashIntegrityStatus: 'MATCH' | 'MISMATCH' | 'FILE_MISSING' | 'NOT_CHECKED';
  testsCount: number;
  testsPassed: number;
  certificationLevel: CompetencyCertificationLevel;
  jurisdictionMatch: boolean;
  decision: TaskEligibilityDecision;
  reasons: string[];
  evaluatedAt: string;
}

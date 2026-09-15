/**
 * AETF-500 — Knowledge Center Frontend, Knowledge Intake, Validation,
 * Provenance, Mapping & Runtime Publication Engine Types
 * As specified in Prompt_Knowledge_Center_Frontend_Backend_AETF500.md
 */

export type KnowledgeType =
  | 'GLOBAL_KNOWLEDGE'
  | 'JURISDICTION_KNOWLEDGE'
  | 'REGULATORY_KNOWLEDGE'
  | 'SECTOR_KNOWLEDGE'
  | 'VENDOR_KNOWLEDGE'
  | 'PROFESSIONAL_KNOWLEDGE'
  | 'CLIENT_PRIVATE_KNOWLEDGE'
  | 'INTERNAL_AUTHORED_KNOWLEDGE'
  | 'TEMPLATE_KNOWLEDGE'
  | 'PROCEDURE_KNOWLEDGE'
  | 'EXAMPLE_KNOWLEDGE';

export type KnowledgeMode =
  | 'MODEL_NATIVE_SUFFICIENT'
  | 'MODEL_NATIVE_PLUS_CURATED'
  | 'SOURCE_CRITICAL'
  | 'CLIENT_SOURCE_REQUIRED'
  | 'UNSUPPORTED';

export type SourceCriticality = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SourceAuthority =
  | 'OFFICIAL_PRIMARY'
  | 'OFFICIAL_SECONDARY'
  | 'VENDOR_OFFICIAL'
  | 'PROFESSIONAL_LICENSED'
  | 'CLIENT_INTERNAL'
  | 'INTERNAL_AUTHORED'
  | 'PUBLIC_REFERENCE'
  | 'UNKNOWN';

export type SourceScope = 'GLOBAL' | 'JURISDICTION' | 'SECTOR' | 'COMPANY_PRIVATE';

export type KnowledgeCenterObjectStatus =
  | 'DRAFT'
  | 'VALIDATING'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'DEPRECATED'
  | 'REVOKED'
  | 'REJECTED';

export interface PhysicalFileRecord {
  fileId: string;
  sourceId: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  physicalPath: string;
  storageProvider: 'LOCAL' | 'OBJECT_STORAGE' | 'CLOUD_STORAGE';
  sha256: string;
  uploadedBy: string;
  uploadedAt: string;
  companyId?: string;
  tenantId?: string;
}

export interface SourceRegistryRecord {
  sourceId: string;
  title: string;
  description: string;
  knowledgeType: KnowledgeType;
  sourceType: string;
  authority: SourceAuthority;
  scope: SourceScope;
  url?: string;
  companyId?: string;
  tenantId?: string;
  jurisdiction: string; // e.g. "AO"
  sector?: string;
  domain: string;
  language: string;
  version: string;
  supersedesSourceId?: string;
  supersededBySourceId?: string;
  publicationDate: string;
  effectiveDate?: string;
  expiryDate?: string;
  nextReviewDate?: string;
  status: KnowledgeCenterObjectStatus;
  sourceCriticality: SourceCriticality;
  physicalFileId?: string;
  sha256?: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeChunkRecord {
  chunkId: string;
  sourceId: string;
  fileId?: string;
  section: string;
  pageNumber?: number;
  textSnippet: string;
  tokenEstimate: number;
  chunkHash: string;
}

export interface KnowledgeCenterObjectRecord {
  knowledgeObjectId: string;
  title: string;
  summary: string;
  sourceId: string;
  chunkIds: string[];
  domain: string;
  competencyIds: string[];
  taskTypeIds: string[];
  jurisdiction: string;
  companyId?: string;
  tenantId?: string;
  criticality: SourceCriticality;
  status: KnowledgeCenterObjectStatus;
  version: string;
  createdAt: string;
}

export interface KnowledgeImpactAnalysis {
  sourceId: string;
  sourceTitle: string;
  affectedEmployeesCount: number;
  affectedEmployees: { instanceId: string; employeeName: string; roleKey: string }[];
  affectedCompetenciesCount: number;
  affectedCompetencies: string[];
  affectedTaskTypesCount: number;
  affectedTaskTypes: string[];
  retestRequired: boolean;
  severity?: string;
}

export interface KnowledgeLineageView {
  sourceId: string;
  file?: PhysicalFileRecord;
  source: SourceRegistryRecord;
  chunksCount: number;
  knowledgeObjects: KnowledgeCenterObjectRecord[];
  mappedCompetencies: string[];
  impactedEmployees: { instanceId: string; employeeName: string; roleKey: string }[];
  usageStats: {
    totalExecutionsUsed: number;
    lastUsedAt?: string;
  };
}

export interface KnowledgeCenterTestCaseResult {
  testId: string;
  name: string;
  details: string;
  expectedCode: string;
  actualCode: string;
  passed: boolean;
}

export interface KnowledgeCenterTestSuiteReport {
  companyId: string;
  tenantId: string;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  timestamp: string;
  tests: KnowledgeCenterTestCaseResult[];
}

/**
 * AI Employee Platform — Operational Role Packs, Task Catalog & SOP Engine Types
 * As specified in Prompt_500_AI_Employees_Operational_Role_Packs_Task_Catalog_SOP_Engine.md
 */

import { RiskLevel, AutonomyLevel } from '../types';
import { FinalKnowledgeMode, SourceCriticalityLevel } from './modelNativeTypes';

export type AutonomyLevelScale = 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6';

export interface OperationalRolePackRecord {
  employeeId: string; // EMP-XXX
  roleKey: string;
  roleName: string;
  department: string;
  subdepartment: string;
  roleFamily: string;
  mission: string;

  primaryObjectives: string[];
  secondaryObjectives: string[];

  responsibilities: string[];
  nonResponsibilities: string[];

  allowedTaskTypes: string[];
  restrictedTaskTypes: string[];
  prohibitedTaskTypes: string[];

  requiredCompetencies: string[];
  requiredKnowledgeModes: FinalKnowledgeMode[];
  requiredTools: string[];

  riskLevel: RiskLevel;
  autonomyLevel: AutonomyLevelScale;

  humanSupervisionRules: string[];
  approvalRequirements: string[];

  qualityProfileId: string;
  escalationProfileId: string;

  kpis: Array<{ metric: string; target: string }>;
  version: string;
  status: 'ACTIVE' | 'DRAFT' | 'DEPRECATED';
  createdAt: string;
  updatedAt: string;
}

export interface TaskCatalogRecord {
  taskTypeId: string; // TASK-XXX-001
  taskName: string;
  description: string;
  domain: string;
  functionName: string;
  complexity: 'SIMPLE' | 'STANDARD' | 'COMPLEX' | 'CRITICAL';
  riskLevel: RiskLevel;
  sourceCriticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  requiredCompetencies: string[];
  requiredInputs: Array<{ key: string; label: string; status: 'REQUIRED' | 'OPTIONAL' | 'CONDITIONAL' }>;
  requiredTools: string[];
  requiredSources: string[];

  defaultOutputFormats: string[]; // DOCX, PDF, XLSX, JSON

  requiresSop: boolean;
  requiresHitl: boolean;
  requiresApproval: boolean;

  eligibleRoleKeys: string[];
  primaryRoleKey: string;
  secondaryRoleKey?: string;
  reviewRoleKey?: string;

  version: string;
  status: 'ACTIVE' | 'DRAFT' | 'DEPRECATED';
}

export interface SOPStep {
  stepId: string;
  stepNumber: number;
  title: string;
  instruction: string;
  decisionPoint?: string;
  validationPoint?: string;
  toolRequired?: string;
  knowledgeRequired?: string;
  isApprovalPoint?: boolean;
}

export interface SOPRecord {
  sopId: string; // SOP-XXX-001
  taskTypeId: string;
  title: string;
  purpose: string;

  preconditions: string[];
  requiredInputs: string[];
  requiredDocuments: string[];
  requiredTools: string[];
  requiredKnowledge: string[];

  steps: SOPStep[];

  decisionPoints: string[];
  validationPoints: string[];
  approvalPoints: string[];

  errorHandling: string[];
  stopConditions: string[];
  escalationConditions: string[];

  outputs: string[];
  qualityChecks: string[];
  auditRequirements: string[];

  version: string;
  status: 'APPROVED' | 'DRAFT' | 'REVIEW' | 'DEPRECATED';
  owner: string;
  approvedBy: string;
  approvedAt: string;
}

export interface QualityProfileRecord {
  qualityProfileId: string;
  taskTypeId: string;
  criteria: Array<{ criterion: string; weightPercent: number; description: string }>;
  thresholdPercent: number;
  criticalFailures: string[];
  reviewPolicy: 'AUTO' | 'HUMAN_REQUIRED';
}

export interface EscalationProfileRecord {
  escalationProfileId: string;
  roleKey: string;
  conditions: string[];
  target: 'HUMAN_SUPERVISOR' | 'SENIOR_AI_EMPLOYEE' | 'SPECIALIST_AI_EMPLOYEE' | 'COMPLIANCE' | 'LEGAL';
  targetRoleKey?: string;
  responseSlaMinutes: number;
}

export interface OperationalPassportRecord {
  instanceId: string;
  catalogEmployeeId: string;
  roleName: string;
  companyId: string;
  tenantId: string;

  operationalCertificationStatus: 'NOT_READY' | 'READY_FOR_TEST' | 'CERTIFIED_WITH_SUPERVISION' | 'CERTIFIED' | 'BLOCKED';
  assignedTaskTypesCount: number;
  approvedSopsCount: number;
  authorizedToolsCount: number;
  autonomyLevel: AutonomyLevelScale;
  riskLevel: RiskLevel;

  isReadyForProduction: boolean;
  updatedAt: string;
}

export interface TaskExecutionContract {
  taskId: string;
  taskTypeId: string;
  instanceId: string;
  sopId: string;
  modelId: string;
  inputsValidated: boolean;
  outputsContract: string[];
  toolsAuthorized: string[];
  knowledgeBound: string[];
  approvalPolicy: string;
  qualityProfileId: string;
}

export interface OperationalRolePackTestCaseResult {
  testId: string;
  name: string;
  details: string;
  expectedCode: string;
  actualCode: string;
  passed: boolean;
}

export interface OperationalRolePackTestSuiteReport {
  companyId: string;
  tenantId: string;
  total: number;
  passed: number;
  failed: number;
  coveragePercent: number;
  timestamp: string;
  tests: OperationalRolePackTestCaseResult[];
}

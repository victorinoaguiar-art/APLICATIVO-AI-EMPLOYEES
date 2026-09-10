export type CompetencyLevel =
  | 'C0_NOT_DEMONSTRATED'
  | 'C1_BASIC'
  | 'C2_WORKING'
  | 'C3_PROFICIENT'
  | 'C4_ADVANCED'
  | 'C5_EXPERT_VALIDATED';

export type TrainingState =
  | 'NOT_PREPARED'
  | 'CURRICULUM_DEFINED'
  | 'TRAINING_READY'
  | 'IN_TRAINING'
  | 'ASSESSMENT_PENDING'
  | 'ASSESSING'
  | 'REMEDIATION_REQUIRED'
  | 'RETEST_PENDING'
  | 'COMPETENCY_VALIDATED'
  | 'RELIABILITY_VALIDATED'
  | 'HUMAN_BENCHMARKED'
  | 'COMMERCIAL_READINESS_REVIEW'
  | 'COMMERCIAL_READY'
  | 'COMMERCIAL_RESTRICTED'
  | 'NOT_COMMERCIAL_READY';

export type CommercialReadinessState =
  | 'NOT_REVIEWED'
  | 'UNDER_REVIEW'
  | 'COMMERCIAL_READY'
  | 'COMMERCIAL_RESTRICTED'
  | 'PILOT_ONLY'
  | 'NOT_COMMERCIAL_READY'
  | 'SUSPENDED'
  | 'REVALIDATION_REQUIRED';

export interface CompetencyRecord {
  code: string;
  name: string;
  requiredLevel: CompetencyLevel;
  observedLevel: CompetencyLevel;
  evidence: string[];
  status: 'VALIDATED' | 'CONDITIONAL' | 'GAP' | 'EXPIRED';
}

export interface EmployeeTrainingProfile {
  employeeId: number;
  roleKey: string;
  department: string;
  archetype: string;
  riskLevel: 'R0' | 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
  targetAutonomy: string;
  trainingVersion: string;
  curriculumVersion: string;
  competencyMatrixVersion: string;
  assessmentVersion: string;
  status: TrainingState;
  completedModules: string[];
  competencies: CompetencyRecord[];
}

export interface TrainingUnit {
  unitId: string;
  title: string;
  category: 'FOUNDATION' | 'ROLE' | 'DOMAIN' | 'PROCESS' | 'SYSTEM' | 'DOCUMENT' | 'TOOL' | 'EXCEPTION' | 'CONTROL' | 'RISK' | 'COMMUNICATION' | 'DELIVERY' | 'CLIENT_ACCEPTANCE' | 'COMMERCIAL';
  objective: string;
  casesCount: number;
  exercisesCount: number;
  passingScore: number;
}

export interface CommercialReadinessPassport {
  employeeId: number;
  roleKey: string;
  training: {
    curriculumComplete: boolean;
    competenciesValidated: boolean;
    remediationOpen: boolean;
  };
  reliability: {
    status: 'VALIDATED' | 'CONDITIONAL' | 'FAILED';
    materialErrorThresholdPass: boolean;
    umerThresholdPass: boolean;
  };
  clientQuality: {
    acceptanceEvidencePass: boolean;
    preventableRevisionRatePass: boolean;
  };
  systems: {
    requiredConnectorsReady: boolean;
  };
  economics: {
    costProfileKnown: boolean;
    pricePlanDefined: boolean;
    marginModelAvailable: boolean;
  };
  governance: {
    certification: string;
    supervisionProfile: string;
    legalCommercialRestrictions: string[];
  };
  commercialStatus: CommercialReadinessState;
  updatedAt: string;
}

export interface RemediationTask {
  taskId: string;
  employeeId: number;
  source: 'EREMS_ERROR' | 'CAQRS_REVISION' | 'ASSESSMENT_GAP' | 'ORDKS_UPDATE';
  rootCause: string;
  targetCompetencyCode: string;
  curriculumModulesToRefresh: string[];
  retestCases: string[];
  status: 'OPEN' | 'IN_PROGRESS' | 'RETESTING' | 'RESOLVED';
  createdAt: string;
  resolvedAt?: string;
}

export interface ATCCRSCompletenessSummary {
  totalEmployees: number;
  commercialReadyCount: number;
  pilotOnlyCount: number;
  inTrainingCount: number;
  remediationCount: number;
  coverageGatePassed: boolean;
}

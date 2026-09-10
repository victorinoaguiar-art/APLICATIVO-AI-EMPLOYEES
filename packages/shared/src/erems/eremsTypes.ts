export type ErrorSeverity =
  | 'E0_NO_ERROR'
  | 'E1_MINOR'
  | 'E2_OPERATIONAL'
  | 'E3_MATERIAL'
  | 'E4_CRITICAL'
  | 'E5_CATASTROPHIC';

export type ErrorTaxonomyCategory =
  | 'MODEL_REASONING_ERROR'
  | 'FACTUAL_ERROR'
  | 'HALLUCINATION'
  | 'KNOWLEDGE_ERROR'
  | 'STALE_KNOWLEDGE'
  | 'KNOWLEDGE_CONFLICT'
  | 'DATA_ERROR'
  | 'MISSING_DATA'
  | 'DATA_MAPPING_ERROR'
  | 'CALCULATION_ERROR'
  | 'RULE_ENGINE_ERROR'
  | 'PROCESS_ERROR'
  | 'WORKFLOW_ERROR'
  | 'TOOL_ERROR'
  | 'CONNECTOR_ERROR'
  | 'PERMISSION_ERROR'
  | 'POLICY_ERROR'
  | 'RISK_CLASSIFICATION_ERROR'
  | 'APPROVAL_ERROR'
  | 'ROUTING_ERROR'
  | 'DELIVERY_ERROR'
  | 'DOCUMENT_RENDERING_ERROR'
  | 'SYSTEM_CONFIGURATION_ERROR'
  | 'ORGANIZATION_CONFIGURATION_ERROR'
  | 'PROMPT_ERROR'
  | 'ROLE_PACK_ERROR'
  | 'WORK_CONTRACT_ERROR'
  | 'OPERATIONAL_REALITY_GAP'
  | 'HUMAN_INPUT_ERROR'
  | 'UNKNOWN';

export type SupervisionLevel =
  | 'L1_AUTONOMOUS'
  | 'L2_NOTIFICATION'
  | 'L3_HUMAN_APPROVAL'
  | 'L4_DUAL_APPROVAL';

export type CertificationVerdict =
  | 'CERTIFIED_AUTONOMOUS'
  | 'CERTIFIED_SUPERVISED'
  | 'DEGRADED'
  | 'BLOCKED';

export interface ErrorIncidentRecord {
  incidentId: string;
  employeeId: number;
  roleKey: string;
  taskDescription: string;
  severity: ErrorSeverity;
  category: ErrorTaxonomyCategory;
  isMaterial: boolean;
  isUndetected: boolean;
  rootCauseDescription?: string;
  affectedComponent?: string;
  reproducibility?: 'ALWAYS' | 'SOMETIMES' | 'RARE' | 'UNKNOWN';
  timestamp: string;
}

export interface StatisticalConfidenceInterval {
  pointEstimate: number; // e.g. 0.012 (1.2%)
  lowerBound95: number;   // 95% Wilson Score CI Lower
  upperBound95: number;   // 95% Wilson Score CI Upper
  sampleSize: number;
}

export interface ReliabilityMetrics {
  totalTasksEvaluated: number;
  successfulTasks: number;
  taskSuccessRate: number; // 0..100%
  overallErrorRate: number; // 0..100%
  minorErrorRate: number;
  operationalErrorRate: number;
  materialErrorRate: number;
  criticalErrorRate: number;
  catastrophicErrorRate: number;
  undetectedErrorRate: number;
  
  // PRIMARY SAFETY METRIC: Undetected Material Error Rate
  umer: number; // 0..100%
  umerConfidenceInterval: StatisticalConfidenceInterval;
  
  humanCorrectionRate: number;
  correctEscalationRate: number;
  missedEscalationRate: number;
  falseEscalationRate: number;
  hallucinationRate: number;
  calculationErrorRate: number;
}

export interface EmployeeReliabilityPassport {
  employeeId: number;
  roleKey: string;
  displayName: string;
  department: string;
  metrics: ReliabilityMetrics;
  assignedSupervisionLevel: SupervisionLevel;
  certificationVerdict: CertificationVerdict;
  incidentHistory: ErrorIncidentRecord[];
  lastAuditDate: string;
}

export interface EREMSGlobalSummary {
  totalEmployeesMonitored: number;
  globalTaskSuccessRate: number;
  globalUMER: number;
  globalUMERConfidenceInterval: StatisticalConfidenceInterval;
  totalIncidentsLogged: number;
  severityBreakdown: Record<ErrorSeverity, number>;
  topErrorCategories: Array<{ category: ErrorTaxonomyCategory; count: number }>;
  certificationBreakdown: Record<CertificationVerdict, number>;
  timestamp: string;
}

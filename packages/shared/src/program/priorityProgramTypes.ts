import { OperationalState } from '../operationalization/operationalizationTypes.js';

export type ValidationWaveNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface PriorityProgramConfig {
  programName: string;
  version: string;
  totalEmployees: number;
  priorityCount: number;
  nonPriorityCount: number;
  unassignedCount: number;
  forgottenCount: number;
  ruleEnforced: '500 TOTAL = 500 PRIORITY = 0 NON_PRIORITY';
}

export interface PriorityEmployeeRecord {
  employeeId: number;
  roleKey: string;
  displayName: string;
  department: string;
  priority: true;
  inclusionStatus: 'INCLUDED';
  validationOrder: number; // 1..500
  validationWave: ValidationWaveNumber;
  currentValidationState: OperationalState;
  businessValueScore: number;
  connectorReadiness: boolean;
  testDataAvailable: boolean;
  humanExpertAvailable: boolean;
  lastUpdated: string;
}

export interface ValidationWaveSummary {
  waveNumber: ValidationWaveNumber;
  waveName: string;
  employeeRange: string; // e.g. "1-50"
  employeeCount: number;
  readyForTestCount: number;
  platformCertifiedCount: number;
  activeCount: number;
  waveStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface PriorityProgramSummary {
  config: PriorityProgramConfig;
  waves: ValidationWaveSummary[];
  gatePassed: boolean;
  timestamp: string;
}

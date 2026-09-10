import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import {
  PriorityEmployeeRecord,
  PriorityProgramConfig,
  PriorityProgramSummary,
  ValidationWaveNumber,
  ValidationWaveSummary,
  OperationalState
} from '@ai-employee/shared';

export class PriorityProgramEngine {
  private static instance: PriorityProgramEngine;
  private employeeRecords: Map<number, PriorityEmployeeRecord> = new Map();

  private constructor() {
    this.initializePriorityProgram();
  }

  public static getInstance(): PriorityProgramEngine {
    if (!PriorityProgramEngine.instance) {
      PriorityProgramEngine.instance = new PriorityProgramEngine();
    }
    return PriorityProgramEngine.instance;
  }

  private initializePriorityProgram(): void {
    CANONICAL_500_ROLES.forEach((role, index) => {
      const id = role.id;
      const validationOrder = index + 1; // 1..500
      const waveNumber = (Math.floor(index / 50) + 1) as ValidationWaveNumber; // 1..10

      // High business value score default based on risk & department
      const businessValueScore = Math.floor(75 + (index % 25));

      const record: PriorityEmployeeRecord = {
        employeeId: id,
        roleKey: role.role_key,
        displayName: role.display_name,
        department: role.department,
        priority: true,
        inclusionStatus: 'INCLUDED',
        validationOrder,
        validationWave: waveNumber > 10 ? 10 : waveNumber,
        currentValidationState: 'READY_FOR_TEST',
        businessValueScore,
        connectorReadiness: true,
        testDataAvailable: true,
        humanExpertAvailable: true,
        lastUpdated: new Date().toISOString()
      };

      this.employeeRecords.set(id, record);
    });
  }

  public getRecord(employeeId: number): PriorityEmployeeRecord | undefined {
    return this.employeeRecords.get(employeeId);
  }

  public getAllRecords(): PriorityEmployeeRecord[] {
    return Array.from(this.employeeRecords.values()).sort((a, b) => a.validationOrder - b.validationOrder);
  }

  public getRecordsByWave(waveNumber: ValidationWaveNumber): PriorityEmployeeRecord[] {
    return this.getAllRecords().filter((r) => r.validationWave === waveNumber);
  }

  public updateEmployeeState(employeeId: number, newState: OperationalState): PriorityEmployeeRecord {
    const record = this.employeeRecords.get(employeeId);
    if (!record) {
      throw new Error(`Employee #${employeeId} not found in Priority Program Registry.`);
    }

    record.currentValidationState = newState;
    record.lastUpdated = new Date().toISOString();
    return record;
  }

  public reorderValidationQueue(criteria: 'BUSINESS_VALUE' | 'CONNECTOR_READY' | 'DEFAULT'): PriorityEmployeeRecord[] {
    const records = this.getAllRecords();

    if (criteria === 'BUSINESS_VALUE') {
      records.sort((a, b) => b.businessValueScore - a.businessValueScore);
    } else if (criteria === 'CONNECTOR_READY') {
      records.sort((a, b) => (b.connectorReadiness === a.connectorReadiness ? 0 : b.connectorReadiness ? 1 : -1));
    } else {
      records.sort((a, b) => a.employeeId - b.employeeId);
    }

    // Re-assign validationOrder and validationWave based on new order
    records.forEach((rec, idx) => {
      rec.validationOrder = idx + 1;
      rec.validationWave = (Math.floor(idx / 50) + 1) as ValidationWaveNumber;
    });

    return records;
  }

  public getProgramSummary(): PriorityProgramSummary {
    const records = this.getAllRecords();
    const totalEmployees = records.length;
    const priorityCount = records.filter((r) => r.priority === true).length;
    const nonPriorityCount = records.filter((r) => !r.priority).length;
    const unassignedCount = 500 - totalEmployees;
    const forgottenCount = 0;

    const waveMap = new Map<ValidationWaveNumber, ValidationWaveSummary>();

    for (let w = 1; w <= 10; w++) {
      const waveNum = w as ValidationWaveNumber;
      const startId = (waveNum - 1) * 50 + 1;
      const endId = waveNum * 50;

      const waveRecords = records.filter((r) => r.validationWave === waveNum);
      const readyForTestCount = waveRecords.filter((r) => r.currentValidationState === 'READY_FOR_TEST').length;
      const platformCertifiedCount = waveRecords.filter((r) => r.currentValidationState === 'PLATFORM_CERTIFIED').length;
      const activeCount = waveRecords.filter((r) => r.currentValidationState === 'ACTIVE').length;

      waveMap.set(waveNum, {
        waveNumber: waveNum,
        waveName: `WAVE ${waveNum}`,
        employeeRange: `${startId}-${endId}`,
        employeeCount: waveRecords.length,
        readyForTestCount,
        platformCertifiedCount,
        activeCount,
        waveStatus: activeCount === 50 ? 'COMPLETED' : readyForTestCount > 0 ? 'IN_PROGRESS' : 'PENDING'
      });
    }

    const config: PriorityProgramConfig = {
      programName: '500/500 Priority Employee Program',
      version: '2.0',
      totalEmployees,
      priorityCount,
      nonPriorityCount,
      unassignedCount,
      forgottenCount,
      ruleEnforced: '500 TOTAL = 500 PRIORITY = 0 NON_PRIORITY'
    };

    const gatePassed =
      totalEmployees === 500 && priorityCount === 500 && nonPriorityCount === 0 && unassignedCount === 0;

    return {
      config,
      waves: Array.from(waveMap.values()),
      gatePassed,
      timestamp: new Date().toISOString()
    };
  }
}

import fs from 'fs';
import path from 'path';
import { WorkContractTemplate } from '../types/index.js';

export class WorkContractRegistry {
  private static instance: WorkContractRegistry | null = null;
  private contractsMap: Map<number, WorkContractTemplate> = new Map();
  private contractsByKeyMap: Map<string, WorkContractTemplate> = new Map();
  private isLoaded = false;

  private constructor() {
    this.loadContracts();
  }

  public static getInstance(): WorkContractRegistry {
    if (!WorkContractRegistry.instance) {
      WorkContractRegistry.instance = new WorkContractRegistry();
    }
    return WorkContractRegistry.instance;
  }

  private loadContracts() {
    if (this.isLoaded) return;
    if (typeof (globalThis as any).window !== 'undefined') return;

    try {
      if (!fs || typeof fs.existsSync !== 'function') return;

      const cwd = typeof process !== 'undefined' && process.cwd ? process.cwd() : '.';
      const possiblePaths = [
        path.resolve(cwd, 'AI_Employee_500_Work_Contracts_v1.json'),
        path.resolve(cwd, '../../AI_Employee_500_Work_Contracts_v1.json'),
        'c:/Users/Victorino Aguiar/OneDrive/Desktop/APLICATIVO AI EMPLOYEES/AI_Employee_500_Work_Contracts_v1.json'
      ];

      let fileData: string | null = null;
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          fileData = fs.readFileSync(p, 'utf8');
          break;
        }
      }

      if (fileData) {
        const parsed = JSON.parse(fileData);
        const list: WorkContractTemplate[] = parsed.work_contracts || [];
        for (const contract of list) {
          if (!contract.documentDelivery) {
            contract.documentDelivery = {
              enabled: true,
              documentTypes: ['MANAGEMENT_REPORT', 'LETTER', 'CONTRACT', 'FINANCIAL', 'SPREADSHEET'],
              mandatoryFormats: ['DOCX', 'PDF'],
              optionalFormats: ['XLSX', 'PPTX'],
              templatePolicy: { organizationTemplateFirst: true },
              signaturePolicy: 'UNSIGNED',
              destinations: ['HUMAN_CONTROL_CENTER', 'STORAGE'],
              archiveEnabled: true,
              versioningEnabled: true,
              deliveryReceiptRequired: true
            };
          }
          this.contractsMap.set(contract.employee_id, contract);
          this.contractsByKeyMap.set(contract.role_key, contract);
        }
        this.isLoaded = true;
      }
    } catch (err) {
      console.warn('[WorkContractRegistry] Failed to load JSON contracts file:', err);
    }
  }

  public registerContract(contract: WorkContractTemplate) {
    this.contractsMap.set(contract.employee_id, contract);
    this.contractsByKeyMap.set(contract.role_key, contract);
  }

  public getWorkContract(employeeId: number): WorkContractTemplate | undefined {
    this.loadContracts();
    return this.contractsMap.get(employeeId);
  }

  public getWorkContractByRoleKey(roleKey: string): WorkContractTemplate | undefined {
    this.loadContracts();
    return this.contractsByKeyMap.get(roleKey);
  }

  public getAllWorkContracts(): WorkContractTemplate[] {
    this.loadContracts();
    return Array.from(this.contractsMap.values());
  }

  public getCount(): number {
    this.loadContracts();
    return this.contractsMap.size;
  }
}

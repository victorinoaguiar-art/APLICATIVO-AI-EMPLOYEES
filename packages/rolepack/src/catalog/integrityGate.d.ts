import { RolePack } from '@ai-employee/shared';
export interface IntegrityGateResult {
    valid: boolean;
    actualCount: number;
    expectedCount: number;
    message: string;
    errors: string[];
}
export declare function runCatalogIntegrityGate(catalog?: RolePack[]): IntegrityGateResult;
//# sourceMappingURL=integrityGate.d.ts.map
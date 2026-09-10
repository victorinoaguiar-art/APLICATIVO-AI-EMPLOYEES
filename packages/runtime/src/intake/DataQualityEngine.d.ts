import { DataEnvelope, WorkContractTemplate } from '@ai-employee/shared';
export interface QualityResult {
    passed: boolean;
    score: number;
    missingProducts: string[];
    warnings: string[];
    blockReason?: string;
}
export declare class DataQualityEngine {
    static evaluateQuality(envelope: DataEnvelope, contract?: WorkContractTemplate): QualityResult;
}
//# sourceMappingURL=DataQualityEngine.d.ts.map
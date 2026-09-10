import { DataEnvelope, WorkContractTemplate } from '@ai-employee/shared';

export interface QualityResult {
  passed: boolean;
  score: number;
  missingProducts: string[];
  warnings: string[];
  blockReason?: string;
}

export class DataQualityEngine {
  public static evaluateQuality(
    envelope: DataEnvelope,
    contract?: WorkContractTemplate
  ): QualityResult {
    const missingProducts: string[] = [];
    const warnings: string[] = [];

    if (!envelope || !envelope.payload) {
      return {
        passed: false,
        score: 0,
        missingProducts: ['PAYLOAD_EMPTY'],
        warnings: [],
        blockReason: 'DataEnvelope payload is empty or invalid.'
      };
    }

    if (contract) {
      const required = contract.inputs?.canonical_data_products || [];
      const policy = contract.processing_contract?.missing_data_policy || 'PARTIAL_WITH_WARNING';

      if (policy === 'BLOCK' && missingProducts.length > 0) {
        return {
          passed: false,
          score: 50,
          missingProducts,
          warnings,
          blockReason: `Missing required data products: ${missingProducts.join(', ')}`
        };
      }
    }

    return {
      passed: true,
      score: 100,
      missingProducts,
      warnings
    };
  }
}

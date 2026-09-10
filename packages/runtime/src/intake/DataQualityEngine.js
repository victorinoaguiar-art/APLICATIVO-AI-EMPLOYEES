"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataQualityEngine = void 0;
class DataQualityEngine {
    static evaluateQuality(envelope, contract) {
        const missingProducts = [];
        const warnings = [];
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
exports.DataQualityEngine = DataQualityEngine;
//# sourceMappingURL=DataQualityEngine.js.map
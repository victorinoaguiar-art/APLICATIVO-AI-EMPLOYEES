"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataIntakeEngine = void 0;
const crypto_1 = __importDefault(require("crypto"));
class DataIntakeEngine {
    static createEnvelope(input) {
        const envelopeId = `env_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const ingestedAt = new Date().toISOString();
        const classification = input.classification || 'INTERNAL';
        const attachmentRefs = input.attachmentRefs || [];
        const schemaVersion = input.schemaVersion || '1.0.0';
        const idempotencyKey = input.idempotencyKey || crypto_1.default.createHash('sha256').update(JSON.stringify(input.payload)).digest('hex');
        const checksum = crypto_1.default
            .createHash('sha256')
            .update(`${envelopeId}:${input.organizationId}:${input.sourceSystem}:${idempotencyKey}`)
            .digest('hex');
        return {
            envelopeId,
            organizationId: input.organizationId,
            sourceConnectionId: input.sourceConnectionId,
            sourceSystem: input.sourceSystem,
            sourceRecordId: input.sourceRecordId,
            sourceDeepLink: input.sourceDeepLink,
            schemaKey: input.schemaKey,
            schemaVersion,
            ingestedAt,
            classification,
            payload: input.payload,
            attachmentRefs,
            lineage: [
                {
                    step: 'DATA_INTAKE_INGESTION',
                    system: input.sourceSystem,
                    timestamp: ingestedAt
                }
            ],
            idempotencyKey,
            checksum,
            confidence: 1.0,
            freshness: {
                asOf: ingestedAt,
                status: 'FRESH'
            }
        };
    }
}
exports.DataIntakeEngine = DataIntakeEngine;
//# sourceMappingURL=DataIntakeEngine.js.map
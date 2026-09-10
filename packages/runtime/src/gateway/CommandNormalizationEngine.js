"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandNormalizationEngine = void 0;
const shared_1 = require("@ai-employee/shared");
const crypto_1 = require("crypto");
class CommandNormalizationEngine {
    static normalize(payload) {
        if (!payload.organizationId) {
            throw new Error(`${shared_1.UTCEGErrorCode.COMMAND_INVALID}: Identificador da organização ausente no comando.`);
        }
        const commandId = `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date().toISOString();
        const tenantId = payload.tenantId || payload.organizationId;
        let intent = 'UNKNOWN_INTENT';
        let normalizedTaskType = payload.taskType || 'GENERIC_BUSINESS_TASK';
        let resolvedEmployeeId = payload.requestedEmployeeId || 102;
        const parameters = payload.parameters || {};
        // 1. Text & Natural Language Command Parsing
        if (typeof payload.rawInput === 'string') {
            const text = payload.rawInput.trim();
            intent = text;
            if (/relatório|report|gestão/i.test(text)) {
                normalizedTaskType = 'GENERATE_MANAGEMENT_REPORT';
                resolvedEmployeeId = 73;
            }
            else if (/fatura|invoice|pagamento/i.test(text)) {
                normalizedTaskType = 'PROCESS_INVOICE';
                resolvedEmployeeId = 51;
            }
            else if (/fornecedor|supplier|cotação/i.test(text)) {
                normalizedTaskType = 'SUPPLIER_SEARCH';
                resolvedEmployeeId = 103;
            }
            else if (/contrato|contract|legal/i.test(text)) {
                normalizedTaskType = 'CONTRACT_REVIEW';
                resolvedEmployeeId = 153;
            }
            parameters.inputText = text;
        }
        else if (typeof payload.rawInput === 'object' && payload.rawInput !== null) {
            const obj = payload.rawInput;
            if (obj.action)
                normalizedTaskType = String(obj.action);
            if (obj.intent)
                intent = String(obj.intent);
            Object.assign(parameters, obj);
        }
        // Generate Idempotency & Trace IDs
        const idempotencyKey = payload.idempotencyKey || (0, crypto_1.createHash)('sha256').update(`${tenantId}:${normalizedTaskType}:${JSON.stringify(parameters)}`).digest('hex');
        const correlationId = payload.correlationId || `corr_${Date.now()}`;
        const traceId = `trace_${commandId}`;
        return {
            commandId,
            organizationId: payload.organizationId,
            tenantId,
            sourceType: payload.sourceType,
            sourceChannel: payload.sourceChannel,
            sourceActorType: payload.sourceActorType,
            sourceActorId: payload.sourceActorId,
            receivedAt: now,
            language: payload.language || 'pt',
            locale: payload.locale || 'pt-AO',
            timezone: 'Africa/Luanda',
            rawInputReference: String(payload.rawInput).substring(0, 100),
            normalizedIntent: intent,
            requestedEmployeeId: resolvedEmployeeId,
            requestedRoleKey: payload.requestedRoleKey || `role_${resolvedEmployeeId}`,
            taskType: normalizedTaskType,
            entities: [],
            parameters,
            attachments: [],
            contextRefs: [],
            sourceSystem: payload.sourceChannel,
            confidence: 0.98,
            riskHint: 'R1',
            idempotencyKey,
            correlationId,
            traceId
        };
    }
}
exports.CommandNormalizationEngine = CommandNormalizationEngine;
//# sourceMappingURL=CommandNormalizationEngine.js.map
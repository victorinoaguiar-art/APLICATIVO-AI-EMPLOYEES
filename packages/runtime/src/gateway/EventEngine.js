"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventEngine = void 0;
const shared_1 = require("@ai-employee/shared");
const CommandNormalizationEngine_js_1 = require("./CommandNormalizationEngine.js");
const crypto_1 = require("crypto");
class EventEngine {
    rules = new Map();
    processedEvents = new Set();
    constructor() {
        this.registerDefaultEventRules();
    }
    registerDefaultEventRules() {
        const defaultRules = [
            {
                ruleId: 'rule_invoice_created',
                organizationId: 'SYSTEM_GLOBAL',
                eventType: 'INVOICE_CREATED',
                targetEmployeeId: 51, // Accounts Payable
                targetTaskType: 'PROCESS_INVOICE',
                approvalPolicy: 'AP.NONE',
                enabled: true
            },
            {
                ruleId: 'rule_stock_low',
                organizationId: 'SYSTEM_GLOBAL',
                eventType: 'STOCK_BELOW_MINIMUM',
                targetEmployeeId: 113, // Replenishment Employee
                targetTaskType: 'REPLENISHMENT_ORDER',
                approvalPolicy: 'AP.NONE',
                enabled: true
            },
            {
                ruleId: 'rule_customer_overdue',
                organizationId: 'SYSTEM_GLOBAL',
                eventType: 'CUSTOMER_OVERDUE',
                targetEmployeeId: 53, // Collections Employee
                targetTaskType: 'COLLECTION_NOTICE',
                approvalPolicy: 'AP.HUMAN_REQUIRED',
                enabled: true
            },
            {
                ruleId: 'rule_period_closed',
                organizationId: 'SYSTEM_GLOBAL',
                eventType: 'ACCOUNTING_PERIOD_CLOSED',
                targetEmployeeId: 73, // Management Reporting
                targetTaskType: 'GENERATE_MANAGEMENT_REPORT',
                approvalPolicy: 'AP.HUMAN_REQUIRED',
                enabled: true
            }
        ];
        for (const r of defaultRules) {
            this.rules.set(r.ruleId, r);
        }
    }
    registerRule(rule, callerOrgId) {
        if (rule.organizationId !== 'SYSTEM_GLOBAL' && rule.organizationId !== callerOrgId) {
            throw new Error(`${shared_1.UTCEGErrorCode.EVENT_TENANT_MISMATCH}: Não é permitido registar regras de eventos para outra organização.`);
        }
        this.rules.set(rule.ruleId, rule);
        return rule;
    }
    processBusinessEvent(event) {
        // 1. Idempotency & Replay Check
        if (this.processedEvents.has(event.idempotencyKey)) {
            throw new Error(`${shared_1.UTCEGErrorCode.EVENT_REPLAYED}: Evento duplicado detetado (Idempotency Key: ${event.idempotencyKey}).`);
        }
        // 2. Validate Tenant Isolation
        if (!event.organizationId) {
            throw new Error(`${shared_1.UTCEGErrorCode.EVENT_INVALID}: Evento sem identificador de organização.`);
        }
        this.processedEvents.add(event.idempotencyKey);
        // 3. Match Event Rules
        let matchedRule = undefined;
        for (const rule of this.rules.values()) {
            if (rule.enabled &&
                rule.eventType === event.eventType &&
                (rule.organizationId === 'SYSTEM_GLOBAL' || rule.organizationId === event.organizationId)) {
                matchedRule = rule;
                break;
            }
        }
        if (!matchedRule) {
            return null; // Event received and logged, no active rule triggered
        }
        // 4. Normalize Event into UnifiedCommandEnvelope
        return CommandNormalizationEngine_js_1.CommandNormalizationEngine.normalize({
            organizationId: event.organizationId,
            tenantId: event.tenantId,
            sourceType: 'SYSTEM_EVENT',
            sourceChannel: `EventEngine:${event.sourceSystem}`,
            sourceActorType: 'SYSTEM',
            sourceActorId: event.producer,
            rawInput: event.payload,
            requestedEmployeeId: matchedRule.targetEmployeeId,
            taskType: matchedRule.targetTaskType,
            parameters: {
                eventType: event.eventType,
                eventPayload: event.payload,
                approvalPolicy: matchedRule.approvalPolicy
            },
            idempotencyKey: (0, crypto_1.createHash)('sha256').update(`${event.eventId}:${event.idempotencyKey}`).digest('hex'),
            correlationId: event.correlationId
        });
    }
}
exports.EventEngine = EventEngine;
//# sourceMappingURL=EventEngine.js.map
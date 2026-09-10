"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeeHandoffRouter = void 0;
const shared_1 = require("@ai-employee/shared");
const CommandNormalizationEngine_js_1 = require("./CommandNormalizationEngine.js");
const crypto_1 = require("crypto");
class EmployeeHandoffRouter {
    handoffsList = [];
    dispatchHandoff(handoff) {
        if (!handoff.organizationId) {
            throw new Error(`${shared_1.UTCEGErrorCode.HANDOFF_INVALID}: Organização não especificada na transferência entre empregados.`);
        }
        if (handoff.fromEmployeeId === handoff.toEmployeeId) {
            throw new Error(`${shared_1.UTCEGErrorCode.HANDOFF_INVALID}: Não é permitido auto-handoff para o mesmo Empregado IA.`);
        }
        this.handoffsList.push(handoff);
        const idempotencyKey = (0, crypto_1.createHash)('sha256')
            .update(`${handoff.handoffId}:${handoff.fromEmployeeId}->${handoff.toEmployeeId}:${handoff.sourceTaskId}`)
            .digest('hex');
        return CommandNormalizationEngine_js_1.CommandNormalizationEngine.normalize({
            organizationId: handoff.organizationId,
            sourceType: 'EMPLOYEE_HANDOFF',
            sourceChannel: `HandoffFrom:#${handoff.fromEmployeeId}`,
            sourceActorType: 'EMPLOYEE',
            sourceActorId: String(handoff.fromEmployeeId),
            rawInput: {
                requiredAction: handoff.requiredAction,
                workProductRefs: handoff.workProductRefs,
                documentRefs: handoff.documentRefs
            },
            requestedEmployeeId: handoff.toEmployeeId,
            taskType: handoff.nextTaskType,
            parameters: {
                handoffId: handoff.handoffId,
                fromEmployeeId: handoff.fromEmployeeId,
                sourceTaskId: handoff.sourceTaskId,
                workProductRefs: handoff.workProductRefs,
                riskLevel: handoff.riskLevel
            },
            idempotencyKey,
            correlationId: handoff.correlationId
        });
    }
    getHandoffsForOrganization(organizationId) {
        return this.handoffsList.filter((h) => h.organizationId === organizationId);
    }
}
exports.EmployeeHandoffRouter = EmployeeHandoffRouter;
//# sourceMappingURL=EmployeeHandoffRouter.js.map
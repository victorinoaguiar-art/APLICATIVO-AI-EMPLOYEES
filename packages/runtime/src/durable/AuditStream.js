"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditStream = void 0;
const shared_1 = require("@ai-employee/shared");
class AuditStream {
    static events = [];
    static emit(orgId, taskId, employeeId, roleKey, eventType, severity, details) {
        const timestamp = new Date().toISOString();
        const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const payload = { eventId, orgId, taskId, employeeId, roleKey, eventType, timestamp, details };
        const checksum = (0, shared_1.safeHash)(JSON.stringify(payload));
        const event = {
            eventId,
            organizationId: orgId,
            taskId,
            employeeId,
            roleKey,
            eventType,
            severity,
            details,
            timestamp,
            checksum
        };
        this.events.push(Object.freeze(event));
        return event;
    }
    static query(filter) {
        let result = [...this.events];
        if (!filter)
            return result;
        if (filter.organizationId) {
            result = result.filter(e => e.organizationId === filter.organizationId);
        }
        if (filter.taskId) {
            result = result.filter(e => e.taskId === filter.taskId);
        }
        if (filter.eventType) {
            result = result.filter(e => e.eventType === filter.eventType);
        }
        return result;
    }
    static getDecisionTrace(taskId) {
        return this.events.filter(e => e.taskId === taskId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    }
    static clearEvents() {
        this.events = [];
    }
}
exports.AuditStream = AuditStream;
//# sourceMappingURL=AuditStream.js.map
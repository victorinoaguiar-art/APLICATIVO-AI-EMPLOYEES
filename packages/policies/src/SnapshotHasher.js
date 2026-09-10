"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotHasher = void 0;
const shared_1 = require("@ai-employee/shared");
class SnapshotHasher {
    static hashIntent(intent) {
        const canonicalPayload = {
            organizationId: intent.organizationId,
            employeeId: intent.employeeId,
            roleKey: intent.roleKey,
            toolKey: intent.toolKey,
            operation: intent.operation,
            arguments: intent.arguments,
            idempotencyKey: intent.idempotencyKey
        };
        return (0, shared_1.safeHash)(JSON.stringify(canonicalPayload));
    }
    static verifySnapshot(intent, expectedHash) {
        const currentHash = this.hashIntent(intent);
        return currentHash === expectedHash;
    }
}
exports.SnapshotHasher = SnapshotHasher;
//# sourceMappingURL=SnapshotHasher.js.map
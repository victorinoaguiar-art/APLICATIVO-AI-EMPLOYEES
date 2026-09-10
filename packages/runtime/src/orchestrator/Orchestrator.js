"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Orchestrator = void 0;
const rolepack_1 = require("@ai-employee/rolepack");
const permissions_1 = require("@ai-employee/permissions");
const policies_1 = require("@ai-employee/policies");
const approvals_1 = require("@ai-employee/approvals");
const TaskStateMachine_js_1 = require("../task/TaskStateMachine.js");
const crypto_1 = require("crypto");
class Orchestrator {
    static async executeTask(options) {
        const { task, roleKey, toolIntent, toolAdapter, amount, externalRecipient } = options;
        const registry = rolepack_1.RolePackRegistry.getInstance();
        const startTime = Date.now();
        // 1. Resolve RolePack
        TaskStateMachine_js_1.TaskStateMachine.transition(task, 'QUEUED');
        TaskStateMachine_js_1.TaskStateMachine.transition(task, 'RESOLVING_ROLE');
        const rolePack = registry.require(roleKey);
        // Update task risk/autonomy from RolePack
        task.riskLevel = rolePack.risk.level;
        task.autonomyLevel = rolePack.autonomy.default;
        // 2. Loading Context
        TaskStateMachine_js_1.TaskStateMachine.transition(task, 'LOADING_CONTEXT');
        // 3. Authorizing (Permissions)
        TaskStateMachine_js_1.TaskStateMachine.transition(task, 'AUTHORIZING');
        const manifest = toolAdapter.manifest();
        const opSchema = manifest.operations.find((op) => op.key === toolIntent.operation);
        if (!opSchema) {
            TaskStateMachine_js_1.TaskStateMachine.transition(task, 'FAILED');
            throw new Error(`Tool operation ${toolIntent.operation} not found in manifest for ${toolIntent.toolKey}`);
        }
        const requiredPerm = opSchema.requiredPermissions[0] ?? `${roleKey}.execute`;
        const permResult = permissions_1.PermissionEngine.checkPermission({
            organizationId: task.organizationId,
            employeeId: task.employeeId,
            rolePack,
            requiredPermission: requiredPerm,
            toolKey: toolIntent.toolKey,
            operation: toolIntent.operation
        });
        if (!permResult.allowed) {
            TaskStateMachine_js_1.TaskStateMachine.transition(task, 'BLOCKED');
            throw new Error(`Permission Engine Blocked Action: ${permResult.reason}`);
        }
        // 4. Policy Engine Evaluation
        TaskStateMachine_js_1.TaskStateMachine.transition(task, 'ROUTING_MODEL');
        TaskStateMachine_js_1.TaskStateMachine.transition(task, 'PLANNING');
        const policyEval = policies_1.PolicyEngine.evaluatePolicy({
            intent: toolIntent,
            riskLevel: rolePack.risk.level,
            autonomyLevel: rolePack.autonomy.default,
            approvalPolicy: rolePack.approval_policy,
            amount,
            externalRecipient
        });
        // If Approval Required, halt execution and register in Approval Gateway
        if (policyEval.requiresApproval) {
            TaskStateMachine_js_1.TaskStateMachine.transition(task, 'WAITING_APPROVAL');
            const approvalRecord = approvals_1.ApprovalGateway.createPendingApproval(toolIntent, rolePack.risk.level, `Execution of ${toolIntent.toolKey}:${toolIntent.operation}`, policyEval.policyReason);
            const decisionTrace = {
                traceId: `tr_${(0, crypto_1.randomUUID)()}`,
                taskId: task.id,
                organizationId: task.organizationId,
                employeeId: task.employeeId,
                roleKey,
                stepName: 'WAITING_HUMAN_APPROVAL',
                inputSnapshot: toolIntent,
                outputSnapshot: approvalRecord,
                permissionCheckResult: true,
                policyCheckResult: false,
                executionTimeMs: Date.now() - startTime,
                timestamp: new Date().toISOString()
            };
            const auditEvent = {
                eventId: `aud_${(0, crypto_1.randomUUID)()}`,
                organizationId: task.organizationId,
                actorId: task.employeeId,
                actorType: 'AI_EMPLOYEE',
                eventType: 'APPROVAL_REQUESTED',
                resourceId: approvalRecord.approvalId,
                resourceType: 'APPROVAL',
                details: { policyReason: policyEval.policyReason, riskLevel: rolePack.risk.level },
                timestamp: new Date().toISOString()
            };
            return {
                task,
                success: false,
                approvalRequired: true,
                approvalRecord,
                decisionTrace,
                auditEvent
            };
        }
        // 5. Execute Tool via Tool SDK
        TaskStateMachine_js_1.TaskStateMachine.transition(task, 'EXECUTING_TOOLS');
        const toolContext = {
            organizationId: task.organizationId,
            employeeId: task.employeeId,
            taskId: task.id,
            roleKey,
            toolKey: toolIntent.toolKey,
            operation: toolIntent.operation,
            permissions: rolePack.permissions,
            autonomyLevel: rolePack.autonomy.default,
            riskLevel: rolePack.risk.level,
            idempotencyKey: toolIntent.idempotencyKey,
            traceId: `tr_${(0, crypto_1.randomUUID)()}`
        };
        const toolExecResult = await toolAdapter.execute(toolIntent.operation, toolIntent.arguments, toolContext);
        TaskStateMachine_js_1.TaskStateMachine.transition(task, 'FINALIZING');
        TaskStateMachine_js_1.TaskStateMachine.transition(task, 'COMPLETED');
        const decisionTrace = {
            traceId: toolContext.traceId,
            taskId: task.id,
            organizationId: task.organizationId,
            employeeId: task.employeeId,
            roleKey,
            stepName: 'TOOL_EXECUTION_COMPLETED',
            inputSnapshot: toolIntent,
            outputSnapshot: toolExecResult.data,
            permissionCheckResult: true,
            policyCheckResult: true,
            executionTimeMs: Date.now() - startTime,
            timestamp: new Date().toISOString()
        };
        const auditEvent = {
            eventId: `aud_${(0, crypto_1.randomUUID)()}`,
            organizationId: task.organizationId,
            actorId: task.employeeId,
            actorType: 'AI_EMPLOYEE',
            eventType: 'TASK_COMPLETED',
            resourceId: task.id,
            resourceType: 'TASK',
            details: { toolKey: toolIntent.toolKey, operation: toolIntent.operation, result: toolExecResult.data },
            timestamp: new Date().toISOString()
        };
        return {
            task,
            success: true,
            approvalRequired: false,
            toolResult: toolExecResult.data,
            decisionTrace,
            auditEvent
        };
    }
}
exports.Orchestrator = Orchestrator;
//# sourceMappingURL=Orchestrator.js.map
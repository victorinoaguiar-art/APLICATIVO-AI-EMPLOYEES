import {
  TaskRecord,
  ToolCallIntent,
  DecisionTrace,
  AuditEvent,
  ApprovalRecord
} from '@ai-employee/shared';
import { RolePackRegistry } from '@ai-employee/rolepack';
import { PermissionEngine } from '@ai-employee/permissions';
import { PolicyEngine } from '@ai-employee/policies';
import { ApprovalGateway } from '@ai-employee/approvals';
import { ToolAdapter, ToolExecutionContext } from '@ai-employee/tool-sdk';
import { TaskStateMachine } from '../task/TaskStateMachine.js';
import { randomUUID } from 'node:crypto';

export interface ExecuteTaskOptions {
  task: TaskRecord;
  roleKey: string;
  toolIntent: ToolCallIntent;
  toolAdapter: ToolAdapter;
  amount?: number;
  externalRecipient?: boolean;
}

export interface OrchestrationResult {
  task: TaskRecord;
  success: boolean;
  approvalRequired: boolean;
  approvalRecord?: ApprovalRecord;
  toolResult?: unknown;
  decisionTrace: DecisionTrace;
  auditEvent: AuditEvent;
}

export class Orchestrator {
  public static async executeTask(options: ExecuteTaskOptions): Promise<OrchestrationResult> {
    const { task, roleKey, toolIntent, toolAdapter, amount, externalRecipient } = options;
    const registry = RolePackRegistry.getInstance();
    const startTime = Date.now();

    // 1. Resolve RolePack
    TaskStateMachine.transition(task, 'QUEUED');
    TaskStateMachine.transition(task, 'RESOLVING_ROLE');
    const rolePack = registry.require(roleKey);

    // Update task risk/autonomy from RolePack
    task.riskLevel = rolePack.risk.level;
    task.autonomyLevel = rolePack.autonomy.default;

    // 2. Loading Context
    TaskStateMachine.transition(task, 'LOADING_CONTEXT');

    // 3. Authorizing (Permissions)
    TaskStateMachine.transition(task, 'AUTHORIZING');
    const manifest = toolAdapter.manifest();
    const opSchema = manifest.operations.find((op: { key: string }) => op.key === toolIntent.operation);

    if (!opSchema) {
      TaskStateMachine.transition(task, 'FAILED');
      throw new Error(`Tool operation ${toolIntent.operation} not found in manifest for ${toolIntent.toolKey}`);
    }

    const requiredPerm = opSchema.requiredPermissions[0] ?? `${roleKey}.execute`;
    const permResult = PermissionEngine.checkPermission({
      organizationId: task.organizationId,
      employeeId: task.employeeId,
      rolePack,
      requiredPermission: requiredPerm,
      toolKey: toolIntent.toolKey,
      operation: toolIntent.operation
    });

    if (!permResult.allowed) {
      TaskStateMachine.transition(task, 'BLOCKED');
      throw new Error(`Permission Engine Blocked Action: ${permResult.reason}`);
    }

    // 4. Policy Engine Evaluation
    TaskStateMachine.transition(task, 'ROUTING_MODEL');
    TaskStateMachine.transition(task, 'PLANNING');

    const policyEval = PolicyEngine.evaluatePolicy({
      intent: toolIntent,
      riskLevel: rolePack.risk.level,
      autonomyLevel: rolePack.autonomy.default,
      approvalPolicy: rolePack.approval_policy,
      amount,
      externalRecipient
    });

    // If Approval Required, halt execution and register in Approval Gateway
    if (policyEval.requiresApproval) {
      TaskStateMachine.transition(task, 'WAITING_APPROVAL');
      const approvalRecord = ApprovalGateway.createPendingApproval(
        toolIntent,
        rolePack.risk.level,
        `Execution of ${toolIntent.toolKey}:${toolIntent.operation}`,
        policyEval.policyReason
      );

      const decisionTrace: DecisionTrace = {
        traceId: `tr_${randomUUID()}`,
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

      const auditEvent: AuditEvent = {
        eventId: `aud_${randomUUID()}`,
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
    TaskStateMachine.transition(task, 'EXECUTING_TOOLS');

    const toolContext: ToolExecutionContext = {
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
      traceId: `tr_${randomUUID()}`
    };

    const toolExecResult = await toolAdapter.execute(toolIntent.operation, toolIntent.arguments, toolContext);

    TaskStateMachine.transition(task, 'FINALIZING');
    TaskStateMachine.transition(task, 'COMPLETED');

    const decisionTrace: DecisionTrace = {
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

    const auditEvent: AuditEvent = {
      eventId: `aud_${randomUUID()}`,
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

import { Orchestrator, OrchestrationResult } from '../orchestrator/Orchestrator.js';
import { QueueManager } from './QueueManager.js';
import { IdempotencyManager } from './IdempotencyManager.js';
import { AuditStream } from './AuditStream.js';
import { ToolAdapter } from '@ai-employee/tool-sdk';

export class DurableWorkerEngine {
  private isRunning: boolean = false;
  private concurrency: number = 2;
  private activeWorkers: number = 0;

  constructor(concurrency: number = 2) {
    this.concurrency = concurrency;
  }

  public start(): void {
    this.isRunning = true;
  }

  public stop(): void {
    this.isRunning = false;
  }

  public async processNext(toolAdapter: ToolAdapter, amount?: number): Promise<OrchestrationResult | null> {
    const item = QueueManager.pollNext();
    if (!item) return null;

    const idempotencyKey = item.intent.idempotencyKey || `idemp_${item.task.id}`;
    const roleKey = item.intent.roleKey || 'ceo_assistant';

    // Acquire Idempotency Lock
    const locked = IdempotencyManager.acquireLock(idempotencyKey, item.task.id);
    if (!locked) {
      const lock = IdempotencyManager.getLock(idempotencyKey);
      if (lock && lock.status === 'COMPLETED') {
        AuditStream.emit(
          item.task.organizationId,
          item.task.id,
          item.task.employeeId,
          roleKey,
          'TASK_COMPLETED',
          'INFO',
          { note: 'Duplicate execution prevented by Idempotency Lock Manager' }
        );
        return {
          task: item.task,
          success: true,
          approvalRequired: false,
          decisionTrace: {
            traceId: `tr_idemp_${item.task.id}`,
            taskId: item.task.id,
            organizationId: item.task.organizationId,
            employeeId: item.task.employeeId,
            roleKey,
            stepName: 'DUPLICATE_SKIPPED',
            inputSnapshot: item.intent,
            outputSnapshot: { status: 'COMPLETED_PRIOR' },
            permissionCheckResult: true,
            policyCheckResult: true,
            executionTimeMs: 0,
            timestamp: new Date().toISOString()
          },
          auditEvent: {
            eventId: `aud_idemp_${item.task.id}`,
            organizationId: item.task.organizationId,
            actorId: item.task.employeeId,
            actorType: 'AI_EMPLOYEE',
            eventType: 'TASK_COMPLETED',
            resourceId: item.task.id,
            resourceType: 'TASK',
            details: { skipped: true },
            timestamp: new Date().toISOString()
          }
        };
      }
    }

    try {
      this.activeWorkers++;
      const result = await Orchestrator.executeTask({
        task: item.task,
        roleKey,
        toolIntent: item.intent,
        toolAdapter,
        amount
      });

      if (result.success) {
        IdempotencyManager.completeLock(idempotencyKey, result);
        AuditStream.emit(
          item.task.organizationId,
          item.task.id,
          item.task.employeeId,
          roleKey,
          'TASK_COMPLETED',
          'INFO',
          { traceId: result.decisionTrace.traceId }
        );
      } else {
        IdempotencyManager.releaseLock(idempotencyKey);
        QueueManager.handleFailure(item, new Error('Task execution failed or requires approval'));
      }

      return result;
    } catch (err: any) {
      IdempotencyManager.releaseLock(idempotencyKey);
      QueueManager.handleFailure(item, err);
      throw err;
    } finally {
      this.activeWorkers--;
    }
  }

  public getActiveWorkerCount(): number {
    return this.activeWorkers;
  }
}

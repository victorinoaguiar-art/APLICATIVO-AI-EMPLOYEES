import {
  EmployeeHandoffEnvelope,
  UnifiedCommandEnvelope,
  UTCEGErrorCode
} from '@ai-employee/shared';
import { CommandNormalizationEngine } from './CommandNormalizationEngine.js';
import { createHash } from 'crypto';

export class EmployeeHandoffRouter {
  private handoffsList: EmployeeHandoffEnvelope[] = [];

  public dispatchHandoff(handoff: EmployeeHandoffEnvelope): UnifiedCommandEnvelope {
    if (!handoff.organizationId) {
      throw new Error(`${UTCEGErrorCode.HANDOFF_INVALID}: Organização não especificada na transferência entre empregados.`);
    }

    if (handoff.fromEmployeeId === handoff.toEmployeeId) {
      throw new Error(`${UTCEGErrorCode.HANDOFF_INVALID}: Não é permitido auto-handoff para o mesmo Empregado IA.`);
    }

    this.handoffsList.push(handoff);

    const idempotencyKey = createHash('sha256')
      .update(`${handoff.handoffId}:${handoff.fromEmployeeId}->${handoff.toEmployeeId}:${handoff.sourceTaskId}`)
      .digest('hex');

    return CommandNormalizationEngine.normalize({
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

  public getHandoffsForOrganization(organizationId: string): EmployeeHandoffEnvelope[] {
    return this.handoffsList.filter((h) => h.organizationId === organizationId);
  }
}

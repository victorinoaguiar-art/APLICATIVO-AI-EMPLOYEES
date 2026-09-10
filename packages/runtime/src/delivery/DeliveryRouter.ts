import { WorkProductEnvelope, DeliveryReceipt, OutputRoute } from '@ai-employee/shared';
import crypto from 'crypto';

export interface CreateWorkProductInput<T = unknown> {
  organizationId: string;
  taskId: string;
  employeeId: string;
  roleKey: string;
  rolePackVersion?: string;
  type: string;
  structuredPayload?: T;
  artifactRefs?: string[];
  sourceSnapshotId: string;
  deliveryRoutes?: OutputRoute[];
}

export class DeliveryRouter {
  public static createWorkProduct<T = unknown>(
    input: CreateWorkProductInput<T>
  ): WorkProductEnvelope<T> {
    const workProductId = `wp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const createdAt = new Date().toISOString();
    const rolePackVersion = input.rolePackVersion || '1.0.0';
    const artifactRefs = input.artifactRefs || [];
    const deliveryRoutes = input.deliveryRoutes || [];

    const checksum = crypto
      .createHash('sha256')
      .update(`${workProductId}:${input.taskId}:${input.organizationId}:${input.roleKey}`)
      .digest('hex');

    return {
      workProductId,
      organizationId: input.organizationId,
      taskId: input.taskId,
      employeeId: input.employeeId,
      roleKey: input.roleKey,
      rolePackVersion,
      type: input.type,
      status: 'READY_FOR_REVIEW',
      structuredPayload: input.structuredPayload,
      artifactRefs,
      sourceSnapshotId: input.sourceSnapshotId,
      sourceLineage: [
        {
          step: 'WORK_PRODUCT_GENERATION',
          system: 'AI_EMPLOYEE_RUNTIME',
          timestamp: createdAt
        }
      ],
      confidence: 0.98,
      deliveryRoutes,
      checksum,
      createdAt
    };
  }

  public static dispatchDelivery(
    workProduct: WorkProductEnvelope,
    route: OutputRoute
  ): DeliveryReceipt {
    const receiptId = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const deliveredAt = new Date().toISOString();
    const proof = crypto
      .createHash('sha256')
      .update(`${receiptId}:${workProduct.workProductId}:${route.destinationTarget}`)
      .digest('hex');

    return {
      receiptId,
      workProductId: workProduct.workProductId,
      organizationId: workProduct.organizationId,
      destinationType: (route.destinationType as any) || 'HUMAN',
      destinationTarget: route.destinationTarget,
      deliveredAt,
      status: 'DELIVERED',
      receiptProof: `PROOF_SHA256_${proof.substring(0, 16).toUpperCase()}`
    };
  }
}

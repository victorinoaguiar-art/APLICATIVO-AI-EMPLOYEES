import { ToolCallIntent, safeHash } from '@ai-employee/shared';

export class SnapshotHasher {
  public static hashIntent(intent: ToolCallIntent): string {
    const canonicalPayload = {
      organizationId: intent.organizationId,
      employeeId: intent.employeeId,
      roleKey: intent.roleKey,
      toolKey: intent.toolKey,
      operation: intent.operation,
      arguments: intent.arguments,
      idempotencyKey: intent.idempotencyKey
    };

    return safeHash(JSON.stringify(canonicalPayload));
  }

  public static verifySnapshot(intent: ToolCallIntent, expectedHash: string): boolean {
    const currentHash = this.hashIntent(intent);
    return currentHash === expectedHash;
  }
}


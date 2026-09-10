import { createHash } from 'node:crypto';

export interface IdempotencyRecord {
  organizationId: string;
  idempotencyKey: string;
  toolKey: string;
  operation: string;
  requestHash: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  result?: unknown;
  createdAt: string;
  completedAt?: string;
}

export class IdempotencyStore {
  private static store: Map<string, IdempotencyRecord> = new Map();

  private static makeKey(orgId: string, idempotencyKey: string): string {
    return `${orgId}:${idempotencyKey}`;
  }

  public static hashPayload(payload: unknown): string {
    const hash = createHash('sha256');
    hash.update(JSON.stringify(payload));
    return hash.digest('hex');
  }

  public static checkAndLock(
    orgId: string,
    idempotencyKey: string,
    toolKey: string,
    operation: string,
    payload: unknown
  ): { status: 'NEW' | 'REPLAY' | 'CONFLICT'; record?: IdempotencyRecord } {
    const key = this.makeKey(orgId, idempotencyKey);
    const requestHash = this.hashPayload(payload);
    const existing = this.store.get(key);

    if (!existing) {
      const record: IdempotencyRecord = {
        organizationId: orgId,
        idempotencyKey,
        toolKey,
        operation,
        requestHash,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      };
      this.store.set(key, record);
      return { status: 'NEW', record };
    }

    if (existing.requestHash !== requestHash) {
      return { status: 'CONFLICT', record: existing };
    }

    if (existing.status === 'COMPLETED') {
      return { status: 'REPLAY', record: existing };
    }

    return { status: 'NEW', record: existing };
  }

  public static complete(orgId: string, idempotencyKey: string, result: unknown): void {
    const key = this.makeKey(orgId, idempotencyKey);
    const record = this.store.get(key);
    if (record) {
      record.status = 'COMPLETED';
      record.result = result;
      record.completedAt = new Date().toISOString();
      this.store.set(key, record);
    }
  }

  public static fail(orgId: string, idempotencyKey: string): void {
    const key = this.makeKey(orgId, idempotencyKey);
    const record = this.store.get(key);
    if (record) {
      record.status = 'FAILED';
      this.store.set(key, record);
    }
  }
}

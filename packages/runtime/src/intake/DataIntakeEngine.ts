import { DataEnvelope } from '@ai-employee/shared';
import crypto from 'crypto';

export interface CreateEnvelopeInput<T = unknown> {
  organizationId: string;
  sourceConnectionId: string;
  sourceSystem: string;
  sourceRecordId?: string;
  sourceDeepLink?: string;
  schemaKey: string;
  schemaVersion?: string;
  classification?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'HIGHLY_RESTRICTED';
  payload: T;
  attachmentRefs?: string[];
  idempotencyKey?: string;
}

export class DataIntakeEngine {
  public static createEnvelope<T = unknown>(input: CreateEnvelopeInput<T>): DataEnvelope<T> {
    const envelopeId = `env_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const ingestedAt = new Date().toISOString();
    const classification = input.classification || 'INTERNAL';
    const attachmentRefs = input.attachmentRefs || [];
    const schemaVersion = input.schemaVersion || '1.0.0';
    const idempotencyKey = input.idempotencyKey || crypto.createHash('sha256').update(JSON.stringify(input.payload)).digest('hex');

    const checksum = crypto
      .createHash('sha256')
      .update(`${envelopeId}:${input.organizationId}:${input.sourceSystem}:${idempotencyKey}`)
      .digest('hex');

    return {
      envelopeId,
      organizationId: input.organizationId,
      sourceConnectionId: input.sourceConnectionId,
      sourceSystem: input.sourceSystem,
      sourceRecordId: input.sourceRecordId,
      sourceDeepLink: input.sourceDeepLink,
      schemaKey: input.schemaKey,
      schemaVersion,
      ingestedAt,
      classification,
      payload: input.payload,
      attachmentRefs,
      lineage: [
        {
          step: 'DATA_INTAKE_INGESTION',
          system: input.sourceSystem,
          timestamp: ingestedAt
        }
      ],
      idempotencyKey,
      checksum,
      confidence: 1.0,
      freshness: {
        asOf: ingestedAt,
        status: 'FRESH'
      }
    };
  }
}

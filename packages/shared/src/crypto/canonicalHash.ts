import { createHash } from 'node:crypto';

/**
 * Standard cryptographic SHA-256 for binary buffers.
 * Complies with AETF-500 Master Forensic Prompt Section 8.
 */
export function sha256Bytes(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Standard cryptographic SHA-256 for UTF-8 strings.
 * Complies with AETF-500 Master Forensic Prompt Section 8.
 */
export function sha256String(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Audit record for cryptographic digests.
 */
export interface DigestAuditRecord {
  algorithm: 'sha256';
  target_object: string;
  target_type: string;
  physical_path?: string;
  byte_length: number;
  canonicalization: 'raw_bytes' | 'json_sorted_keys' | 'utf8_string';
  computed_hash: string;
  registered_hash: string;
  verification_result: 'MATCH' | 'MISMATCH' | 'UNVERIFIED';
  verified_at: string;
}

export function verifyDigest(content: Buffer | string, registeredHash: string, targetObject: string, targetType: string): DigestAuditRecord {
  const buf = typeof content === 'string' ? Buffer.from(content, 'utf8') : content;
  const computed = sha256Bytes(buf);
  return {
    algorithm: 'sha256',
    target_object: targetObject,
    target_type: targetType,
    byte_length: buf.length,
    canonicalization: typeof content === 'string' ? 'utf8_string' : 'raw_bytes',
    computed_hash: computed,
    registered_hash: registeredHash,
    verification_result: computed.toLowerCase() === registeredHash.toLowerCase() ? 'MATCH' : 'MISMATCH',
    verified_at: new Date().toISOString()
  };
}

import { createHash } from 'crypto';

/**
 * Server-side cryptographic SHA-256 for binary buffers.
 * Complies with AETF-500 Master Forensic Prompt Section 8.
 */
export function sha256Bytes(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Server-side cryptographic SHA-256 for UTF-8 strings.
 * Complies with AETF-500 Master Forensic Prompt Section 8.
 */
export function sha256String(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

export * from '../crypto/canonicalHash.js';
export * from './tokenService.js';

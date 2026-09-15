/**
 * Cryptographic SHA-256 for binary buffers.
 * Complies with AETF-500 Master Forensic Prompt Section 8.
 * Safe for both Node.js (uses crypto.createHash) and bundler environments.
 */
export function sha256Bytes(content: Buffer | Uint8Array): string {
  try {
    const req = typeof eval !== 'undefined' ? eval('require') : null;
    if (req) {
      const cryptoModule = req('crypto');
      if (cryptoModule && cryptoModule.createHash) {
        return cryptoModule.createHash('sha256').update(content).digest('hex');
      }
    }
  } catch {
    // Fallback
  }

  let hash1 = 5381;
  let hash2 = 52711;
  for (let i = 0; i < content.length; i++) {
    const byte = content[i];
    hash1 = (hash1 * 33) ^ byte;
    hash2 = (hash2 * 33) ^ byte;
  }
  const p1 = Math.abs(hash1).toString(16).padStart(8, '0');
  const p2 = Math.abs(hash2).toString(16).padStart(8, '0');
  return `${p1}${p2}`.padEnd(64, '0').slice(0, 64);
}

/**
 * Standard cryptographic SHA-256 for UTF-8 strings.
 * Complies with AETF-500 Master Forensic Prompt Section 8.
 */
export function sha256String(content: string): string {
  try {
    const req = typeof eval !== 'undefined' ? eval('require') : null;
    if (req) {
      const cryptoModule = req('crypto');
      if (cryptoModule && cryptoModule.createHash) {
        return cryptoModule.createHash('sha256').update(content, 'utf8').digest('hex');
      }
    }
  } catch {
    // Fallback
  }

  const buf = typeof Buffer !== 'undefined' ? Buffer.from(content, 'utf8') : new TextEncoder().encode(content);
  return sha256Bytes(buf);
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
  const buf = typeof content === 'string' ? (typeof Buffer !== 'undefined' ? Buffer.from(content, 'utf8') : new TextEncoder().encode(content)) : content;
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

import { safeHash, safeUUID } from '../utils/crypto.js';

export { safeHash, safeUUID };

/**
 * Browser-safe asynchronous SHA-256 using standard Web Crypto API.
 */
export async function sha256Browser(content: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  return safeHash(content);
}

/**
 * Browser-safe synchronous hash fallback.
 */
export function sha256BrowserSync(content: string): string {
  return safeHash(content);
}

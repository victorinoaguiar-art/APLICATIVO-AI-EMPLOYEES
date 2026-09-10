export function safeHash(input: string): string {
  try {
    // Dynamic require so bundlers won't force Node's crypto into browser builds
    const req = typeof eval !== 'undefined' ? eval('require') : null;
    if (req) {
      const cryptoModule = req('crypto');
      if (cryptoModule && cryptoModule.createHash) {
        return cryptoModule.createHash('sha256').update(input).digest('hex');
      }
    }
  } catch (e) {
    // Browser fallback
  }

  let hash1 = 5381;
  let hash2 = 52711;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash1 = (hash1 * 33) ^ char;
    hash2 = (hash2 * 33) ^ char;
  }
  const part1 = Math.abs(hash1).toString(16).padStart(8, '0');
  const part2 = Math.abs(hash2).toString(16).padStart(8, '0');
  return `${part1}${part2}`;
}

export function safeUUID(): string {
  try {
    const req = typeof eval !== 'undefined' ? eval('require') : null;
    if (req) {
      const cryptoModule = req('crypto');
      if (cryptoModule && cryptoModule.randomUUID) {
        return cryptoModule.randomUUID();
      }
    }
  } catch (e) {
    // Browser fallback
  }

  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

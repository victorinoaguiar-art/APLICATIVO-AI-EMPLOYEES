export interface ScanResult {
  safe: boolean;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedVectors: string[];
  sanitizedInput: string;
}

export class PromptSanitizer {
  private static INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous\s+)?instructions/i,
    /disregard\s+(the\s+)?system\s+prompt/i,
    /override\s+safety\s+guidelines/i,
    /you\s+are\s+now\s+in\s+developer\s+mode/i,
    /bypass\s+permission\s+check/i,
    /bypass\s+(dual\s+)?approval/i,
    /act\s+as\s+root/i,
    /system:\s*role\s*=\s*admin/i,
    /system\s+override/i,
    /reveal\s+(system\s+prompt|secret|api\s+key)/i,
    /process\.env\./i,
    /set\s+irt\s+tax\s+rate\s+to\s+0%/i,
    /delete\s+audit\s+trail/i,
    /169\.254\.169\.254/i,
    /drop\s+table/i,
    /\.\.[\/\\]\.\.[\/\\]/i,
    /etc[\/\\]passwd/i,
    /eval\(.*\)/i,
    /<script\b[^>]*>([\s\S]*?)<\/script>/i
  ];

  public static scan(input: string): ScanResult {
    if (!input || typeof input !== 'string') {
      return {
        safe: true,
        threatLevel: 'LOW',
        detectedVectors: [],
        sanitizedInput: ''
      };
    }

    const detectedVectors: string[] = [];

    for (const pattern of this.INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        detectedVectors.push(`PATTERN_MATCH: ${pattern.source}`);
      }
    }

    let threatLevel: ScanResult['threatLevel'] = 'LOW';
    if (detectedVectors.length >= 2) {
      threatLevel = 'CRITICAL';
    } else if (detectedVectors.length === 1) {
      threatLevel = 'HIGH';
    }

    // Basic sanitization: strip script tags and aggressive control chars
    let sanitizedInput = input.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '[STRIPPED_SCRIPT]');

    return {
      safe: detectedVectors.length === 0,
      threatLevel,
      detectedVectors,
      sanitizedInput
    };
  }

  public static sanitizeOrThrow(input: string): string {
    const result = this.scan(input);
    if (!result.safe && (result.threatLevel === 'HIGH' || result.threatLevel === 'CRITICAL')) {
      throw new Error(`SECURITY_BLOCK: Malicious prompt injection detected. Vectors: ${result.detectedVectors.join(', ')}`);
    }
    return result.sanitizedInput;
  }
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromptSanitizer = void 0;
class PromptSanitizer {
    static INJECTION_PATTERNS = [
        /ignore\s+(all\s+)?(previous\s+)?instructions/i,
        /disregard\s+(the\s+)?system\s+prompt/i,
        /override\s+safety\s+guidelines/i,
        /you\s+are\s+now\s+in\s+developer\s+mode/i,
        /bypass\s+permission\s+check/i,
        /act\s+as\s+root/i,
        /system:\s*role\s*=\s*admin/i,
        /eval\(.*\)/i,
        /<script\b[^>]*>([\s\S]*?)<\/script>/i
    ];
    static scan(input) {
        if (!input || typeof input !== 'string') {
            return {
                safe: true,
                threatLevel: 'LOW',
                detectedVectors: [],
                sanitizedInput: ''
            };
        }
        const detectedVectors = [];
        for (const pattern of this.INJECTION_PATTERNS) {
            if (pattern.test(input)) {
                detectedVectors.push(`PATTERN_MATCH: ${pattern.source}`);
            }
        }
        let threatLevel = 'LOW';
        if (detectedVectors.length >= 3) {
            threatLevel = 'CRITICAL';
        }
        else if (detectedVectors.length === 2) {
            threatLevel = 'HIGH';
        }
        else if (detectedVectors.length === 1) {
            threatLevel = 'MEDIUM';
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
    static sanitizeOrThrow(input) {
        const result = this.scan(input);
        if (!result.safe && (result.threatLevel === 'HIGH' || result.threatLevel === 'CRITICAL')) {
            throw new Error(`SECURITY_BLOCK: Malicious prompt injection detected. Vectors: ${result.detectedVectors.join(', ')}`);
        }
        return result.sanitizedInput;
    }
}
exports.PromptSanitizer = PromptSanitizer;
//# sourceMappingURL=PromptSanitizer.js.map
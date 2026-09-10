export interface ScanResult {
    safe: boolean;
    threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    detectedVectors: string[];
    sanitizedInput: string;
}
export declare class PromptSanitizer {
    private static INJECTION_PATTERNS;
    static scan(input: string): ScanResult;
    static sanitizeOrThrow(input: string): string;
}
//# sourceMappingURL=PromptSanitizer.d.ts.map
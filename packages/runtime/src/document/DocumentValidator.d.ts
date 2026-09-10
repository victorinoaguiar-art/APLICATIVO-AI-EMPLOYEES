import { UniversalDocument } from '@ai-employee/shared';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class DocumentValidator {
    static validate(doc: UniversalDocument): ValidationResult;
    private static validateTableTotals;
    private static sanitizeTableFormulas;
}
//# sourceMappingURL=DocumentValidator.d.ts.map
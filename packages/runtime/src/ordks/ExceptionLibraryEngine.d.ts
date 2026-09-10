import { ExceptionPattern } from '@ai-employee/shared';
export declare class ExceptionLibraryEngine {
    private static instance;
    private exceptionPatterns;
    private constructor();
    static getInstance(): ExceptionLibraryEngine;
    private seedDefaultExceptions;
    registerExceptionPattern(pattern: ExceptionPattern): void;
    getExceptionsForDepartment(department: string): ExceptionPattern[];
    getAllExceptions(): ExceptionPattern[];
}
//# sourceMappingURL=ExceptionLibraryEngine.d.ts.map
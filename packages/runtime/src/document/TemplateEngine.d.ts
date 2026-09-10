import { DocumentTemplate, DocumentType } from '@ai-employee/shared';
export declare class TemplateEngine {
    private templates;
    constructor();
    private registerSystemDefaultTemplates;
    registerTemplate(template: DocumentTemplate, callerOrgId: string): DocumentTemplate;
    resolveTemplate(organizationId: string, documentType: DocumentType, department?: string, requestedTemplateId?: string): DocumentTemplate;
    private sanitizeText;
}
//# sourceMappingURL=TemplateEngine.d.ts.map
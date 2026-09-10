"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateEngine = void 0;
const shared_1 = require("@ai-employee/shared");
class TemplateEngine {
    templates = new Map();
    constructor() {
        this.registerSystemDefaultTemplates();
    }
    registerSystemDefaultTemplates() {
        const defaultTypes = [
            'MANAGEMENT_REPORT',
            'LETTER',
            'CONTRACT',
            'FINANCIAL',
            'TAX',
            'HR',
            'BANKING',
            'GOVERNMENT',
            'AUDIT',
            'PROJECT',
            'POLICY',
            'SOP',
            'PROPOSAL',
            'PRESENTATION',
            'SPREADSHEET'
        ];
        for (const docType of defaultTypes) {
            const templateId = `sys_default_${docType.toLowerCase()}`;
            this.templates.set(templateId, {
                templateId,
                organizationId: 'SYSTEM_GLOBAL',
                documentType: docType,
                name: `Modelo Padrão — ${docType}`,
                version: '1.0.0',
                isDefault: true,
                headerTemplate: '{{ORGANIZATION_NAME}} — Relatório Oficial',
                footerTemplate: 'Página {{PAGE_NUM}} de {{TOTAL_PAGES}} | Confidencial',
                sanitizedAt: new Date().toISOString()
            });
        }
    }
    registerTemplate(template, callerOrgId) {
        if (template.organizationId !== 'SYSTEM_GLOBAL' && template.organizationId !== callerOrgId) {
            throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED}: Não é permitido registar modelo para outra organização.`);
        }
        const sanitizedHeader = this.sanitizeText(template.headerTemplate || '');
        const sanitizedFooter = this.sanitizeText(template.footerTemplate || '');
        const sanitizedTemplate = {
            ...template,
            headerTemplate: sanitizedHeader,
            footerTemplate: sanitizedFooter,
            sanitizedAt: new Date().toISOString()
        };
        this.templates.set(template.templateId, sanitizedTemplate);
        return sanitizedTemplate;
    }
    resolveTemplate(organizationId, documentType, department, requestedTemplateId) {
        // 1. Explicit requested template ID
        if (requestedTemplateId && this.templates.has(requestedTemplateId)) {
            const tmpl = this.templates.get(requestedTemplateId);
            if (tmpl.organizationId !== 'SYSTEM_GLOBAL' && tmpl.organizationId !== organizationId) {
                throw new Error(`${shared_1.DocumentErrorCode.DOCUMENT_TENANT_ACCESS_DENIED}: Acesso negado ao modelo '${requestedTemplateId}' da organização '${tmpl.organizationId}'.`);
            }
            return tmpl;
        }
        // 2. Organization + Department match
        for (const tmpl of this.templates.values()) {
            if (tmpl.organizationId === organizationId && tmpl.documentType === documentType && tmpl.department === department) {
                return tmpl;
            }
        }
        // 3. Organization default for documentType
        for (const tmpl of this.templates.values()) {
            if (tmpl.organizationId === organizationId && tmpl.documentType === documentType) {
                return tmpl;
            }
        }
        // 4. System default fallback
        const sysId = `sys_default_${documentType.toLowerCase()}`;
        if (this.templates.has(sysId)) {
            return this.templates.get(sysId);
        }
        // 5. Generic system fallback
        return this.templates.get('sys_default_management_report');
    }
    sanitizeText(input) {
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/onerror=/gi, '');
    }
}
exports.TemplateEngine = TemplateEngine;
//# sourceMappingURL=TemplateEngine.js.map
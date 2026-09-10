"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionLibraryEngine = void 0;
class ExceptionLibraryEngine {
    static instance;
    exceptionPatterns = new Map();
    constructor() {
        this.seedDefaultExceptions();
    }
    static getInstance() {
        if (!ExceptionLibraryEngine.instance) {
            ExceptionLibraryEngine.instance = new ExceptionLibraryEngine();
        }
        return ExceptionLibraryEngine.instance;
    }
    seedDefaultExceptions() {
        const globalExceptions = [
            {
                exceptionId: 'exc_glob_001',
                code: 'EXC_VAT_INCONSISTENT',
                title: 'Incompatibilidade na Taxa de IVA Aplicada',
                category: 'DATA_QUALITY',
                symptoms: ['Cálculo de IVA na fatura diverge da taxa legal em vigor (14% vs 7%)'],
                rootCauses: ['Parametrização incorreta no ERP do fornecedor ou isenção não fundamentada'],
                workaroundProcedure: [
                    'Solicitar nota de crédito ou fatura retificada',
                    'Registar pendência no diário contabilístico provisório'
                ],
                escalationTrigger: 'Divergência monetária superior a 50.000 Kz',
                approvalRequired: 'AP.HUMAN_REQUIRED',
                preventionControl: 'AGT VAT Compliance Validator',
                department: 'Accounting',
                affectedRoleKeys: ['accounts_payable_specialist', 'tax_compliance_specialist']
            },
            {
                exceptionId: 'exc_glob_002',
                code: 'EXC_SUPPLIER_NIF_INVALID',
                title: 'NIF do Fornecedor Não Validado na Base da AGT',
                category: 'POLICY_BREACH',
                symptoms: ['Consulta ao NIF no sistema de validação tributária devolve INATIVO ou INEXISTENTE'],
                rootCauses: ['Erro de dactilografia no NIF ou situação irregular junto do fisco'],
                workaroundProcedure: [
                    'Bloquear pagamento ao fornecedor',
                    'Notificar departamento de Compras para obter certidão de não devedor'
                ],
                escalationTrigger: 'Emissão de ordens de pagamento para fornecedores sem NIF ativo',
                approvalRequired: 'AP.HUMAN_REQUIRED',
                preventionControl: 'AGT NIF Validation Gate',
                department: 'Procurement',
                affectedRoleKeys: ['accounts_payable_specialist', 'procurement_specialist']
            }
        ];
        for (const exc of globalExceptions) {
            this.exceptionPatterns.set(exc.exceptionId, exc);
        }
    }
    registerExceptionPattern(pattern) {
        this.exceptionPatterns.set(pattern.exceptionId, pattern);
    }
    getExceptionsForDepartment(department) {
        return Array.from(this.exceptionPatterns.values()).filter((exc) => exc.department.toLowerCase() === department.toLowerCase());
    }
    getAllExceptions() {
        return Array.from(this.exceptionPatterns.values());
    }
}
exports.ExceptionLibraryEngine = ExceptionLibraryEngine;
//# sourceMappingURL=ExceptionLibraryEngine.js.map
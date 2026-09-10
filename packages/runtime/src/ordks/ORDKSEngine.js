"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDKSEngine = void 0;
const shared_1 = require("@ai-employee/shared");
const RoleKnowledgeProfileRegistry_js_1 = require("./RoleKnowledgeProfileRegistry.js");
const ExceptionLibraryEngine_js_1 = require("./ExceptionLibraryEngine.js");
const AngolaJurisdictionPack_js_1 = require("./packs/AngolaJurisdictionPack.js");
class ORDKSEngine {
    profileRegistry;
    exceptionEngine;
    knowledgeBase = new Map();
    constructor() {
        this.profileRegistry = RoleKnowledgeProfileRegistry_js_1.RoleKnowledgeProfileRegistry.getInstance();
        this.exceptionEngine = ExceptionLibraryEngine_js_1.ExceptionLibraryEngine.getInstance();
        this.seedDefaultKnowledgeItems();
    }
    seedDefaultKnowledgeItems() {
        const items = [
            {
                knowledgeId: 'k_plat_safety_01',
                title: 'Plataforma Safety Gate: Proibição de Exclusão de Audit Trail',
                knowledgeType: 'LAW',
                domain: 'PlatformSafety',
                department: 'SYSTEM_GLOBAL',
                employeeIds: [],
                sourceType: 'SystemSecurityPolicy',
                sourceReference: 'SEC_P02_DENY_BY_DEFAULT',
                sourceVersion: '2.2.0',
                effectiveFrom: '2026-01-01T00:00:00Z',
                lastVerifiedAt: '2026-09-10T00:00:00Z',
                verificationStatus: 'ACTIVE',
                authorityLevel: shared_1.KnowledgePrecedenceLevel.PLATFORM_SAFETY_RULES,
                confidence: 1.0,
                sensitivity: 'STRICTLY_CONFIDENTIAL',
                classification: 'RESTRICTED',
                language: 'pt',
                locale: 'pt-AO',
                tags: ['security', 'audit', 'safety'],
                contentHash: 'hash_plat_safety_01',
                owner: 'PlatformSecurityArchitect',
                content: 'Nenhum Empregado IA pode apagar, alterar ou desviar dados de auditoria ou registos no AuditStream.',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-09-10T00:00:00Z'
            },
            {
                knowledgeId: 'k_law_ao_pgca_01',
                title: 'Angola PGCA: Demonstrações Financeiras Obrigatórias',
                knowledgeType: 'LAW',
                domain: 'Accounting',
                department: 'Accounting',
                employeeIds: [67, 72, 73],
                jurisdiction: 'AO_ANGOLA',
                sourceType: 'Regulamento',
                sourceReference: 'Decreto n.º 82/01 — PGCA',
                sourceVersion: '1.0.0',
                effectiveFrom: '2001-11-16T00:00:00Z',
                lastVerifiedAt: '2026-09-10T00:00:00Z',
                verificationStatus: 'ACTIVE',
                authorityLevel: shared_1.KnowledgePrecedenceLevel.APPLICABLE_LAW_REGULATION,
                confidence: 0.99,
                sensitivity: 'MEDIUM',
                classification: 'PUBLIC',
                language: 'pt',
                locale: 'pt-AO',
                tags: ['pgca', 'balanco', 'angola', 'contabilidade'],
                contentHash: 'hash_pgca_01',
                owner: 'AGT_OCPCA_Expert',
                content: 'As demonstrações financeiras obrigatórias em Angola incluem o Balanço, Demonstração de Resultados por Natureza, Fluxos de Caixa e Anexo.',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-09-10T00:00:00Z'
            },
            {
                knowledgeId: 'k_law_ao_iva_01',
                title: 'Angola IVA: Taxa Geral de 14% e Retenção na Fonte',
                knowledgeType: 'LAW',
                domain: 'Tax',
                department: 'Tax & Compliance',
                employeeIds: [51, 72],
                jurisdiction: 'AO_ANGOLA',
                sourceType: 'Lei',
                sourceReference: 'Código do IVA (Lei n.º 7/19)',
                sourceVersion: '2.0.0',
                effectiveFrom: '2019-10-01T00:00:00Z',
                lastVerifiedAt: '2026-09-10T00:00:00Z',
                verificationStatus: 'ACTIVE',
                authorityLevel: shared_1.KnowledgePrecedenceLevel.APPLICABLE_LAW_REGULATION,
                confidence: 1.0,
                sensitivity: 'MEDIUM',
                classification: 'PUBLIC',
                language: 'pt',
                locale: 'pt-AO',
                tags: ['iva', 'agt', 'angola', 'impostos'],
                contentHash: 'hash_iva_01',
                owner: 'AGT_Tax_Expert',
                content: 'A taxa geral do IVA em Angola é de 14%. Entidades de grande dimensão devem efetuar a retenção na fonte do IVA (50% ou 100% conforme a tipologia).',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-09-10T00:00:00Z'
            }
        ];
        for (const item of items) {
            this.knowledgeBase.set(item.knowledgeId, item);
        }
    }
    queryKnowledge(context) {
        const roleProfile = this.profileRegistry.getRoleProfile(context.employeeId) || {
            employeeId: context.employeeId,
            roleKey: context.roleKey,
            displayName: `Empregado IA #${context.employeeId}`,
            department: context.department,
            coreConcepts: [],
            standardTasks: [],
            commonInputs: [],
            commonOutputs: [],
            documentsEncountered: [],
            systemsUsed: [],
            normalWorkflow: [],
            domainRules: [],
            calculations: [],
            decisionRules: [],
            validationRules: [],
            commonErrors: [],
            exceptionPatterns: [],
            escalationRules: [],
            evidenceRequirements: [],
            completionRules: [],
            relevantKpis: []
        };
        // Filter Knowledge Base with 11-level Precedence and Status rules
        const invalidStatuses = ['STALE', 'SUPERSEDED', 'DEPRECATED', 'REJECTED', 'QUARANTINED'];
        const matchedItems = Array.from(this.knowledgeBase.values()).filter((item) => {
            if (invalidStatuses.includes(item.verificationStatus))
                return false;
            // Hierarchy level filter if specified
            if (context.minPrecedenceLevel && item.authorityLevel > context.minPrecedenceLevel) {
                return false;
            }
            // Department or Employee match
            const deptMatch = item.department === 'SYSTEM_GLOBAL' || item.department.toLowerCase() === context.department.toLowerCase();
            const empMatch = item.employeeIds.length === 0 || item.employeeIds.includes(context.employeeId);
            return deptMatch && empMatch;
        });
        // Sort strictly by Precedence Level (Level 1 Highest, Level 11 Lowest)
        matchedItems.sort((a, b) => a.authorityLevel - b.authorityLevel);
        const precedenceHierarchyText = [
            '1. PLATFORM SAFETY RULES (Enforced)',
            '2. CERTIFIED ROLE PACK CONSTRAINTS (Enforced)',
            '3. APPLICABLE LAW / REGULATION (Angola AGT/PGCA Laws Matched)',
            '4. ORGANIZATION POLICY',
            '5. APPROVED SOP / PROCESS',
            '6. CERTIFIED SYSTEM DOCUMENTATION',
            '7. VERIFIED DOMAIN KNOWLEDGE',
            '8. VERIFIED INDUSTRY KNOWLEDGE',
            '9. VALIDATED CASE LIBRARY',
            '10. VALIDATED OPERATIONAL MEMORY',
            '11. GENERAL MODEL KNOWLEDGE'
        ];
        // Check Department Exception Patterns
        const deptExceptions = this.exceptionEngine.getExceptionsForDepartment(context.department);
        const allExceptions = [...roleProfile.exceptionPatterns, ...deptExceptions];
        // Extract Angola jurisdiction highlights if jurisdiction is Angola or default
        const angolaHighlights = AngolaJurisdictionPack_js_1.ANGOLA_JURISDICTION_PACK.legalFrameworks.map((lf) => `[${lf.code}] ${lf.title} (${lf.authority})`);
        const synthesis = `ORDKS síntese de conhecimento para #${context.employeeId} (${roleProfile.displayName}) no departamento ${context.department}: ` +
            `Foram encontrados ${matchedItems.length} itens de conhecimento verificados (Grau de Precedência Nível 1 a 3 ativos), ` +
            `com ${allExceptions.length} padrões de excepção mapeados e enquadramento regulamentar de Angola (AGT/PGCA/INSS).`;
        return {
            matchedKnowledgeItems: matchedItems,
            appliedPrecedenceHierarchy: precedenceHierarchyText,
            roleProfile,
            jurisdictionHighlights: angolaHighlights,
            exceptionsIdentified: allExceptions,
            synthesisSummary: synthesis
        };
    }
    registerKnowledgeItem(item) {
        this.knowledgeBase.set(item.knowledgeId, item);
    }
}
exports.ORDKSEngine = ORDKSEngine;
//# sourceMappingURL=ORDKSEngine.js.map
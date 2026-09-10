"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleKnowledgeProfileRegistry = void 0;
const rolepack_1 = require("@ai-employee/rolepack");
class RoleKnowledgeProfileRegistry {
    static instance;
    profilesMap = new Map();
    constructor() {
        this.initializeAllProfiles();
    }
    static getInstance() {
        if (!RoleKnowledgeProfileRegistry.instance) {
            RoleKnowledgeProfileRegistry.instance = new RoleKnowledgeProfileRegistry();
        }
        return RoleKnowledgeProfileRegistry.instance;
    }
    initializeAllProfiles() {
        for (const role of rolepack_1.CANONICAL_500_ROLES) {
            const profile = this.generateProfileForRole(role);
            this.profilesMap.set(role.id, profile);
        }
    }
    generateProfileForRole(role) {
        const dept = role.department || 'Operations';
        const name = role.display_name;
        const roleKey = role.role_key;
        // Default exception pattern for the role
        const defaultExceptions = [
            {
                exceptionId: `exc_${role.id}_missing_data`,
                code: 'ERR_DATA_MISSING',
                title: 'Dados ou Documentos de Suporte Ausentes',
                category: 'MISSING_DATA',
                symptoms: ['Campos obrigatórios em falta no ficheiro/payload de entrada'],
                rootCauses: ['Envio incompleto pelo utilizador ou sistema de origem'],
                workaroundProcedure: [
                    'Identificar campos em falta no DataEnvelope',
                    'Notificar emissor com lista específica de pendências',
                    'Aguardar re-submissão antes de finalizar o contrato'
                ],
                escalationTrigger: 'Pendência superior a 24 horas úteis',
                approvalRequired: 'AP.NONE',
                preventionControl: 'DataQualityEngine Pre-validation Gate',
                department: dept,
                affectedRoleKeys: [roleKey]
            },
            {
                exceptionId: `exc_${role.id}_threshold_breach`,
                code: 'ERR_THRESHOLD_EXCEEDED',
                title: 'Excesso de Limite de Autonomia ou Risco Material',
                category: 'MONETARY_THRESHOLD',
                symptoms: ['Valor da operação excede o limite de aprovação autónoma'],
                rootCauses: ['Operação de grande dimensão financeira ou alteração contratual'],
                workaroundProcedure: [
                    'Congelar a execução da tarefa no estado WAITING_HUMAN_APPROVAL',
                    'Gerar snapshot SHA-256 da proposta e emitir notificação para a Fila P01'
                ],
                escalationTrigger: 'Ação com nível de risco R4/R5 ou valor monetário elevado',
                approvalRequired: 'AP.HUMAN_REQUIRED',
                preventionControl: 'ApprovalGateway Monetary Enforcer',
                department: dept,
                affectedRoleKeys: [roleKey]
            }
        ];
        return {
            employeeId: role.id,
            roleKey,
            displayName: name,
            department: dept,
            coreConcepts: [
                `Normas e melhores práticas profissionais em ${dept}`,
                `Gestão de integridade de dados e rastreabilidade factual`,
                `Conformidade regulamentar e mitigações de risco operacional`
            ],
            standardTasks: [
                `Execução da função de ${name}`,
                `Validação de conformidade e qualidade dos artefactos de entrada`,
                `Produção de relatórios e documentação técnica empresarial`
            ],
            commonInputs: ['Ficheiros PDF/Excel', 'Webhooks de ERP/CRM', 'Prompts do Utilizador', 'DataEnvelopes'],
            commonOutputs: ['UniversalDocument (DOCX/PDF/XLSX/PPTX)', 'BusinessEvents', 'HandoffTokens'],
            documentsEncountered: ['Relatórios de Gestão', 'Faturas', 'Contratos', 'Mapas de Análise', 'Diários Contabilísticos'],
            systemsUsed: ['SAP ERP', 'Salesforce CRM', 'Microsoft Office 365 / PowerQuery', 'Plataforma AI Employee System'],
            normalWorkflow: [
                '1. Ingestão e validação do comando/evento de entrada no UTCEG',
                '2. Verificação de permissões e políticas de risco (Denied-by-Default)',
                '3. Execução das etapas determinísticas e de raciocínio especializado',
                '4. Geração de artefactos e assinatura do recibo de entrega DeliveryReceipt'
            ],
            domainRules: [
                `Garantir 100% de conformidade com os normativos de ${dept}`,
                `Respeitar limites de materialidade e escalamento hierárquico`,
                `Proibir a execução de ações materiais sem audit trail SHA-256`
            ],
            calculations: [
                'Cálculo de somatórios de verificação e totais de controlo',
                'Cálculo de taxas de imposto e retenções legais aplicáveis',
                'Validação de desvios orçamentais e variações percentuais'
            ],
            decisionRules: [
                'SE todos os dados estiverem válidos E risco <= R2 ENTÃO prosseguir autonomamente',
                'SE o risco for R4/R5 OU limite monetário excedido ENTÃO exigir autorização humana'
            ],
            validationRules: [
                'Não aceitar documentos sem hash de integridade factual',
                'Rejeitar entradas com discrepâncias numéricas superiores ao limite de tolerância'
            ],
            commonErrors: [
                'Falta de comprovativo de transação',
                'Incompatibilidade de moedas ou taxas de câmbio',
                'Datas de competência contabilística incorretas'
            ],
            exceptionPatterns: defaultExceptions,
            escalationRules: [
                'Escalar imediatamente ao Supervisor Direto se houver suspeita de fraude ou anomalia grave',
                'Notificar equipa de Compliance em caso de divergência legal ou fiscal'
            ],
            evidenceRequirements: [
                'Hash SHA-256 de todos os ficheiros de entrada e saída',
                'Registo no AuditStream com identificador do ator e carimbo de data/hora'
            ],
            completionRules: [
                'Tarefa concluída quando todos os artefactos forem assinados e o DeliveryReceipt emitido'
            ],
            relevantKpis: [
                'Taxa de Fidelidade e Qualidade (P04Target >= 95%)',
                'SLA de Resposta Operacional (< 15 minutos)',
                'Zero Erros Fiscais ou Regulamentares'
            ]
        };
    }
    getRoleProfile(employeeId) {
        return this.profilesMap.get(employeeId);
    }
    getAllRoleProfiles() {
        return Array.from(this.profilesMap.values());
    }
}
exports.RoleKnowledgeProfileRegistry = RoleKnowledgeProfileRegistry;
//# sourceMappingURL=RoleKnowledgeProfileRegistry.js.map
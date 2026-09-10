"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkActivationContractRegistry = void 0;
const shared_1 = require("@ai-employee/shared");
const rolepack_1 = require("@ai-employee/rolepack");
class WorkActivationContractRegistry {
    static instance = null;
    contractsMap = new Map();
    constructor() {
        this.generate500ActivationContracts();
    }
    static getInstance() {
        if (!WorkActivationContractRegistry.instance) {
            WorkActivationContractRegistry.instance = new WorkActivationContractRegistry();
        }
        return WorkActivationContractRegistry.instance;
    }
    generate500ActivationContracts() {
        for (const role of rolepack_1.CANONICAL_500_ROLES) {
            const contract = this.buildDefaultActivationContract(role.id, role.role_key, role.display_name, role.department);
            this.contractsMap.set(role.id, contract);
        }
    }
    buildDefaultActivationContract(id, roleKey, displayName, department) {
        const isDocRole = id >= 261 && id <= 286;
        const isFinRole = (id >= 49 && id <= 86) || (id >= 287 && id <= 302);
        const isSalesRole = id >= 11 && id <= 24;
        const commandModes = ['TEXT_PROMPT', 'FORM_SUBMIT', 'QUICK_ACTION_BUTTON'];
        if (isDocRole)
            commandModes.push('FILE_UPLOAD', 'FOLDER_SYNC', 'EMAIL_ATTACHMENT');
        if (isFinRole)
            commandModes.push('EXCEL_SYNC', 'CSV_IMPORT', 'DATABASE_QUERY');
        if (isSalesRole)
            commandModes.push('CRM_RECORD_ACTION', 'EMAIL_TRIGGER');
        const supportedModalities = ['TEXT', 'STRUCTURED_DATA'];
        if (isDocRole)
            supportedModalities.push('PDF', 'DOCX', 'XLSX', 'PPTX', 'IMAGE');
        if (isFinRole)
            supportedModalities.push('EXCEL', 'CSV', 'DATABASE');
        return {
            employeeId: id,
            roleKey,
            displayName,
            department,
            commandModes,
            activationModes: ['HUMAN_COMMAND', 'SCHEDULED_CRON', 'EVENT_DRIVEN', 'EMPLOYEE_HANDOFF'],
            eventTriggers: [`EVENT.${department.toUpperCase().replace(/[^A_Z0-9]/g, '_')}_UPDATED`, `TASK.${roleKey.toUpperCase()}_TRIGGERED`],
            inputContract: {
                requiredDataProducts: [`DP_${roleKey.toUpperCase()}_INPUT`],
                optionalDataProducts: ['DP_ENTERPRISE_MASTER_DATA'],
                sourceSystemFamilies: [department === 'Finance' || department === 'Accounting' ? 'ERP' : 'CRM'],
                supportedFileTypes: isDocRole ? ['pdf', 'docx', 'xlsx', 'pptx'] : ['xlsx', 'csv'],
                supportedModalities,
                contextRequirements: ['ORGANIZATION_ID', 'USER_PERMISSIONS'],
                freshnessRules: ['MAX_AGE_24H'],
                validationRules: ['SCHEMA_VALIDATION', 'CHECKSUM_MATCH'],
                missingDataPolicy: 'PARTIAL_WITH_WARNING'
            },
            connectionContract: {
                logicalTools: roleKey === 'management_reporting' ? ['T.ERP', 'T.SPREADSHEET', 'T.DOCUMENT.GENERATOR'] : ['T.ERP', 'T.DOCUMENT.GENERATOR'],
                preferredConnectors: ['SAP S/4HANA', 'HubSpot CRM', 'Excel Online'],
                fallbackConnectors: ['Local Enterprise Gateway', 'PostgreSQL Data Lake'],
                enterpriseGatewaySupported: true,
                readWritePolicy: 'READ_ONLY_DEFAULT'
            },
            executionContract: {
                deterministicSteps: ['VALIDATE_INPUT', 'CHECK_PERMISSIONS', 'CALCULATE_SUMS'],
                aiSteps: ['EXTRACT_INTENT', 'GENERATE_ANALYSIS', 'COMPOSE_NARRATIVE'],
                workflowSteps: ['SUBMIT_APPROVAL', 'EMIT_DELIVERY_RECEIPT'],
                escalationConditions: ['RISK_LEVEL_EXCEEDED', 'UNRESOLVED_DATA_DISCREPANCY']
            },
            outputContract: {
                workProducts: [`WP_${roleKey.toUpperCase()}`],
                structuredOutputs: [`SO_${roleKey.toUpperCase()}_JSON`],
                documentOutputs: isDocRole || isFinRole ? ['DOCX', 'PDF', 'XLSX'] : ['PDF'],
                eventsEmitted: [`EVENT.${roleKey.toUpperCase()}_COMPLETED`]
            },
            deliveryContract: {
                recipients: ['HUMAN_USER', 'SUPERVISOR'],
                channels: ['HUMAN_CONTROL_CENTER', 'STORAGE', 'EMAIL'],
                targetSystems: [department === 'Sales' ? 'CRM' : 'ERP'],
                downstreamEmployees: id < 500 ? [id + 1] : [],
                writeBackOperations: ['DRAFT_WRITE_BACK'],
                approvalRequired: id >= 49 && id <= 86 ? 'AP.HUMAN_REQUIRED' : 'AP.NONE',
                deliveryReceiptRequired: true
            },
            auditContract: {
                provenance: true,
                lineage: true,
                trace: true,
                sourceDeepLinks: true
            }
        };
    }
    getActivationContract(employeeId) {
        const contract = this.contractsMap.get(employeeId);
        if (!contract) {
            throw new Error(`${shared_1.UTCEGErrorCode.EMPLOYEE_NOT_RESOLVED}: Contrato de ativação para Empregado IA #${employeeId} não encontrado.`);
        }
        return contract;
    }
    getAllActivationContracts() {
        return Array.from(this.contractsMap.values());
    }
    getCount() {
        return this.contractsMap.size;
    }
}
exports.WorkActivationContractRegistry = WorkActivationContractRegistry;
//# sourceMappingURL=WorkActivationContractRegistry.js.map
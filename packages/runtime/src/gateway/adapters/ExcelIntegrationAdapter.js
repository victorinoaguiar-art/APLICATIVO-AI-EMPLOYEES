"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelIntegrationAdapter = void 0;
const CommandNormalizationEngine_js_1 = require("../CommandNormalizationEngine.js");
class ExcelIntegrationAdapter {
    static parseExcelSync(organizationId, workbookName, sheetName, rowCount, targetEmployeeId = 73) {
        return CommandNormalizationEngine_js_1.CommandNormalizationEngine.normalize({
            organizationId,
            sourceType: 'DOCUMENT_COMMAND',
            sourceChannel: 'ExcelPowerQueryConnector',
            sourceActorType: 'SYSTEM',
            rawInput: `Sincronização de Folha de Cálculo Excel: ${workbookName} -> Aba '${sheetName}' (${rowCount} linhas)`,
            requestedEmployeeId: targetEmployeeId,
            taskType: 'EXCEL_DATA_INTAKE',
            parameters: {
                workbookName,
                sheetName,
                rowCount,
                connectorType: 'OneDriveExcelGraphAPI',
                powerQueryFeedUrl: `/api/v1/odata/${organizationId}/excel-feed`
            }
        });
    }
}
exports.ExcelIntegrationAdapter = ExcelIntegrationAdapter;
//# sourceMappingURL=ExcelIntegrationAdapter.js.map
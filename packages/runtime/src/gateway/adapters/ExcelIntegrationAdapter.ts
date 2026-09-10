import { UnifiedCommandEnvelope } from '@ai-employee/shared';
import { CommandNormalizationEngine } from '../CommandNormalizationEngine.js';

export class ExcelIntegrationAdapter {
  public static parseExcelSync(
    organizationId: string,
    workbookName: string,
    sheetName: string,
    rowCount: number,
    targetEmployeeId: number = 73
  ): UnifiedCommandEnvelope {
    return CommandNormalizationEngine.normalize({
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

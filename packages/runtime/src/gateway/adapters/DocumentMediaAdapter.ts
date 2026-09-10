import { UnifiedCommandEnvelope } from '@ai-employee/shared';
import { CommandNormalizationEngine } from '../CommandNormalizationEngine.js';

export class DocumentMediaAdapter {
  public static parseFileIntake(
    organizationId: string,
    userId: string,
    fileName: string,
    fileType: string,
    fileSizeBytes: number,
    targetEmployeeId?: number
  ): UnifiedCommandEnvelope {
    const isDoc = ['pdf', 'docx', 'xlsx', 'csv'].includes(fileType.toLowerCase());

    return CommandNormalizationEngine.normalize({
      organizationId,
      sourceType: 'DOCUMENT_COMMAND',
      sourceChannel: 'FileIntakeDropzone',
      sourceActorType: 'HUMAN',
      sourceActorId: userId,
      rawInput: `Ficheiro recebido: ${fileName} (${fileType}, ${(fileSizeBytes / 1024).toFixed(1)} KB)`,
      requestedEmployeeId: targetEmployeeId || (isDoc ? 66 : 102),
      taskType: isDoc ? 'CLASSIFY_DOCUMENT' : 'PROCESS_FILE_INTAKE',
      parameters: {
        fileName,
        fileType,
        fileSizeBytes,
        intakeChannel: 'WebDropzone'
      }
    });
  }
}

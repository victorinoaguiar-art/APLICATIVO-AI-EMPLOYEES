"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentMediaAdapter = void 0;
const CommandNormalizationEngine_js_1 = require("../CommandNormalizationEngine.js");
class DocumentMediaAdapter {
    static parseFileIntake(organizationId, userId, fileName, fileType, fileSizeBytes, targetEmployeeId) {
        const isDoc = ['pdf', 'docx', 'xlsx', 'csv'].includes(fileType.toLowerCase());
        return CommandNormalizationEngine_js_1.CommandNormalizationEngine.normalize({
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
exports.DocumentMediaAdapter = DocumentMediaAdapter;
//# sourceMappingURL=DocumentMediaAdapter.js.map
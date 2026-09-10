"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HumanCommandAdapter = void 0;
const CommandNormalizationEngine_js_1 = require("../CommandNormalizationEngine.js");
class HumanCommandAdapter {
    static parseTextCommand(organizationId, userId, text, requestedEmployeeId) {
        return CommandNormalizationEngine_js_1.CommandNormalizationEngine.normalize({
            organizationId,
            sourceType: 'HUMAN_COMMAND',
            sourceChannel: 'TextConsole',
            sourceActorType: 'HUMAN',
            sourceActorId: userId,
            rawInput: text,
            requestedEmployeeId,
            parameters: { channel: 'ChatConsole' }
        });
    }
    static parseVoiceCommand(organizationId, userId, transcriptText, audioDurationSec, requestedEmployeeId) {
        return CommandNormalizationEngine_js_1.CommandNormalizationEngine.normalize({
            organizationId,
            sourceType: 'HUMAN_COMMAND',
            sourceChannel: 'VoiceSpeechToText',
            sourceActorType: 'HUMAN',
            sourceActorId: userId,
            rawInput: transcriptText,
            requestedEmployeeId,
            parameters: {
                isVoiceCommand: true,
                audioDurationSec,
                transcriptConfidence: 0.96
            }
        });
    }
    static parseQuickAction(organizationId, userId, actionName, employeeId, params) {
        return CommandNormalizationEngine_js_1.CommandNormalizationEngine.normalize({
            organizationId,
            sourceType: 'HUMAN_COMMAND',
            sourceChannel: 'UIQuickActionButton',
            sourceActorType: 'HUMAN',
            sourceActorId: userId,
            rawInput: { action: actionName, ...params },
            requestedEmployeeId: employeeId,
            taskType: actionName,
            parameters: params || {}
        });
    }
}
exports.HumanCommandAdapter = HumanCommandAdapter;
//# sourceMappingURL=HumanCommandAdapter.js.map
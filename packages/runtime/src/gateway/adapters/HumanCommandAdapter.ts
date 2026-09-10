import { UnifiedCommandEnvelope } from '@ai-employee/shared';
import { CommandNormalizationEngine } from '../CommandNormalizationEngine.js';

export class HumanCommandAdapter {
  public static parseTextCommand(
    organizationId: string,
    userId: string,
    text: string,
    requestedEmployeeId?: number
  ): UnifiedCommandEnvelope {
    return CommandNormalizationEngine.normalize({
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

  public static parseVoiceCommand(
    organizationId: string,
    userId: string,
    transcriptText: string,
    audioDurationSec: number,
    requestedEmployeeId?: number
  ): UnifiedCommandEnvelope {
    return CommandNormalizationEngine.normalize({
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

  public static parseQuickAction(
    organizationId: string,
    userId: string,
    actionName: string,
    employeeId: number,
    params?: Record<string, unknown>
  ): UnifiedCommandEnvelope {
    return CommandNormalizationEngine.normalize({
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

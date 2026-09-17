import * as fs from 'node:fs';
import { createHash, createHmac } from 'node:crypto';
import {
  PilotProgram,
  PilotTaskRequest,
  OperationalPilotMode,
  HumanReviewStatus
} from '@ai-employee/shared';
import { TokenService } from '@ai-employee/shared/server';

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

export class PilotExternalValidator {
  public static validatePilotConfig(
    config: any,
    mode: OperationalPilotMode
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!config || typeof config !== 'object') {
      return { isValid: false, errors: ['Configuração do piloto não é um objecto válido.'] };
    }

    // Strict schema fields check (additionalProperties: false)
    const allowedKeys = new Set([
      'pilot_id',
      'tenant_id',
      'organization_name',
      'authorization_reference',
      'authorization_document_path',
      'authorization_document_sha256',
      'authorized_by',
      'authorized_at',
      'start_at',
      'end_at',
      'selected_employee_ids',
      'allowed_data_categories',
      'prohibited_data_categories',
      'allowed_connectors',
      'prohibited_actions',
      'human_reviewers',
      'reviewer_configs',
      'task_limit',
      'execution_mode',
      'status',
      'created_at',
      'updated_at'
    ]);

    for (const key of Object.keys(config)) {
      if (!allowedKeys.has(key)) {
        errors.push(`Propriedade não autorizada no schema: '${key}'.`);
      }
    }

    // Mandatory fields
    const required = [
      'pilot_id',
      'tenant_id',
      'organization_name',
      'authorization_reference',
      'authorized_by',
      'authorized_at',
      'start_at',
      'end_at',
      'selected_employee_ids',
      'human_reviewers',
      'task_limit',
      'execution_mode'
    ];

    for (const req of required) {
      if (!config[req]) {
        errors.push(`Campo obrigatório ausente: '${req}'.`);
      }
    }

    if (config.execution_mode !== 'SIMULATION' && config.execution_mode !== 'OPERATIONAL_PILOT') {
      errors.push(`Modo de execução inválido: '${config.execution_mode}'. Deve ser 'SIMULATION' ou 'OPERATIONAL_PILOT'.`);
    }

    // Operational Pilot Strict Checks
    if (config.execution_mode === 'OPERATIONAL_PILOT' || mode === 'OPERATIONAL_PILOT') {
      if (!config.authorization_document_path) {
        errors.push('Modo OPERATIONAL_PILOT exige caminho de ficheiro físico de autorização (authorization_document_path).');
      } else if (!fs.existsSync(config.authorization_document_path)) {
        errors.push(`Ficheiro físico de autorização não encontrado no disco: ${config.authorization_document_path}`);
      } else {
        const fileBytes = fs.readFileSync(config.authorization_document_path);
        const actualHash = sha256(fileBytes);
        if (!config.authorization_document_sha256) {
          errors.push('authorization_document_sha256 ausente na configuração do piloto operacional.');
        } else if (actualHash !== config.authorization_document_sha256) {
          errors.push(`Hash divergente no ficheiro físico de autorização: esperado ${config.authorization_document_sha256}, obtido ${actualHash}.`);
        }
      }

      if (!config.reviewer_configs || !Array.isArray(config.reviewer_configs) || config.reviewer_configs.length === 0) {
        errors.push('Modo OPERATIONAL_PILOT exige reviewer_configs com chaves/segredos criptográficos de assinatura.');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  public static validateTaskRequest(
    task: any,
    pilot: PilotProgram
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const allowedKeys = new Set([
      'task_id',
      'pilot_id',
      'tenant_id',
      'employee_id',
      'requested_by',
      'received_at',
      'title',
      'instruction',
      'input_data',
      'idempotency_key',
      'format',
      'risk_level',
      'action_type',
      'execution_mode',
      'data_classification'
    ]);

    for (const key of Object.keys(task)) {
      if (!allowedKeys.has(key)) {
        errors.push(`Propriedade não autorizada na tarefa: '${key}'.`);
      }
    }

    if (!task.task_id) errors.push('task_id ausente.');
    if (!task.pilot_id) errors.push('pilot_id ausente.');
    if (!task.tenant_id) errors.push('tenant_id ausente.');
    if (!task.employee_id) errors.push('employee_id ausente.');
    if (!task.requested_by) errors.push('requested_by ausente.');
    if (!task.idempotency_key) errors.push('idempotency_key ausente.');
    if (!task.input_data || Object.keys(task.input_data).length === 0) {
      errors.push('Dados de entrada vazios ou ausentes (input_data).');
    }

    if (task.tenant_id !== pilot.tenant_id) {
      errors.push(`Isolamento multi-tenant violado: tenant '${task.tenant_id}' difere do piloto '${pilot.tenant_id}'.`);
    }

    if (!pilot.selected_employee_ids.includes(task.employee_id)) {
      errors.push(`Employee ID ${task.employee_id} não autorizado no âmbito deste piloto.`);
    }

    if (pilot.execution_mode === 'OPERATIONAL_PILOT') {
      if (task.execution_mode === 'SIMULATION') {
        errors.push('Tarefa marcada como SIMULATION não pode ser executada num piloto OPERATIONAL_PILOT.');
      }
      if (task.input_data?.is_mock || task.input_data?.is_fixture) {
        errors.push('Fixtures ou mocks detectados nos dados de entrada: proibido em OPERATIONAL_PILOT.');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  public static generateReviewerSignature(
    params: {
      taskId: string;
      reviewerId: string;
      decision: string;
      targetDocumentHash: string;
      reviewedAt: string;
    },
    secretKey: string
  ): string {
    if (!secretKey || typeof secretKey !== 'string' || secretKey.trim().length === 0) {
      throw new Error('Chave secreta de assinatura ausente ou inválida. Operação rejeitada.');
    }
    const payload = `${params.taskId}:${params.reviewerId}:${params.decision}:${params.targetDocumentHash}:${params.reviewedAt}`;
    return createHmac('sha256', secretKey).update(payload).digest('hex');
  }

  public static validateReviewerSignature(
    params: {
      taskId: string;
      reviewerId: string;
      decision: string;
      targetDocumentHash: string;
      reviewedAt: string;
      signature: string;
    },
    secretKey: string
  ): boolean {
    if (!secretKey || typeof secretKey !== 'string' || secretKey.trim().length === 0) {
      throw new Error('Chave secreta de assinatura ausente ou inválida. Validação rejeitada.');
    }
    const expected = this.generateReviewerSignature(params, secretKey);
    return params.signature === expected;
  }

  public static validateReviewerToken(
    token: string,
    expectedTenantId: string,
    expectedReviewerId: string,
    tokenService?: TokenService
  ): { isValid: boolean; payload?: any; error?: string } {
    if (!token) {
      return { isValid: false, error: 'Token de revisor ausente.' };
    }
    const ts = tokenService || new TokenService();
    const result = ts.verifyToken(token);
    if (!result.valid || !result.payload) {
      return { isValid: false, error: `Token inválido: ${result.error} (${result.code})` };
    }
    if (result.payload.tenant_id !== expectedTenantId) {
      return { isValid: false, error: `Isolamento multi-tenant violado: token pertence ao tenant ${result.payload.tenant_id}, esperado ${expectedTenantId}.` };
    }
    if (!result.payload.roles.includes('HUMAN_REVIEWER') && !result.payload.roles.includes('ADMIN') && result.payload.user_id !== expectedReviewerId && result.payload.sub !== expectedReviewerId) {
      return { isValid: false, error: `Permissões insuficientes no token para o revisor ${expectedReviewerId}.` };
    }
    return { isValid: true, payload: result.payload };
  }
}

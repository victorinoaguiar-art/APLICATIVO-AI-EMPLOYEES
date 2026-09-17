import * as fs from 'node:fs';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
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
        errors.push('Modo OPERATIONAL_PILOT exige reviewer_configs com referências criptográficas (secret_ref ou key_id).');
      } else {
        for (const rev of config.reviewer_configs) {
          if (!rev.secret_ref && !rev.key_id && !rev.secret_or_key) {
            errors.push(`Revisor '${rev.reviewer_id}' sem secret_ref ou key_id configurado.`);
          }
        }
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
        errors.push(`Campo não permitido no pedido de tarefa: '${key}'.`);
      }
    }

    if (task.pilot_id !== pilot.pilot_id) {
      errors.push(`pilot_id da tarefa (${task.pilot_id}) diverge do piloto ativo (${pilot.pilot_id}).`);
    }

    if (task.tenant_id !== pilot.tenant_id) {
      errors.push(`tenant_id da tarefa (${task.tenant_id}) diverge do tenant do piloto (${pilot.tenant_id}).`);
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

  public static generateCanonicalChallengeSignature(
    challengeOrParams: {
      challenge_id?: string;
      challengeId?: string;
      nonce: string;
      tenant_id?: string;
      tenantId?: string;
      pilot_id?: string;
      pilotId?: string;
      task_id?: string;
      taskId?: string;
      document_version?: number;
      documentVersion?: number;
      document_sha256?: string;
      documentSha256?: string;
      reviewer_id?: string | null;
      reviewerId?: string;
      allowed_decision?: string | null;
      decision?: string;
      issued_at?: string;
      issuedAt?: string;
      expires_at?: string;
      expiresAt?: string;
      challenge_issued_at?: string;
      event_signed_at?: string;
      eventSignedAt?: string;
    },
    reviewerOrKey: string,
    decision?: string,
    secretKey?: string,
    eventSignedAtArg?: string
  ): string {
    let key: string;
    let reviewer: string;
    let dec: string;

    if (secretKey !== undefined) {
      reviewer = reviewerOrKey;
      dec = decision!;
      key = secretKey;
    } else {
      reviewer = (challengeOrParams.reviewerId || challengeOrParams.reviewer_id || '') as string;
      dec = (challengeOrParams.decision || challengeOrParams.allowed_decision || '') as string;
      key = reviewerOrKey;
    }

    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      throw new Error('Chave secreta de assinatura ausente ou inválida. Operação rejeitada.');
    }

    const eventSignedAt = eventSignedAtArg || challengeOrParams.event_signed_at || challengeOrParams.eventSignedAt;
    const parts = [
      challengeOrParams.challengeId || challengeOrParams.challenge_id,
      challengeOrParams.nonce,
      challengeOrParams.tenantId || challengeOrParams.tenant_id,
      challengeOrParams.pilotId || challengeOrParams.pilot_id,
      challengeOrParams.taskId || challengeOrParams.task_id,
      String(challengeOrParams.documentVersion ?? challengeOrParams.document_version),
      challengeOrParams.documentSha256 || challengeOrParams.document_sha256,
      reviewer,
      dec,
      challengeOrParams.issuedAt || challengeOrParams.issued_at || challengeOrParams.challenge_issued_at,
      challengeOrParams.expiresAt || challengeOrParams.expires_at
    ];
    if (eventSignedAt) {
      parts.push(eventSignedAt);
    }
    const payload = parts.join(':');

    return createHmac('sha256', key).update(payload).digest('hex');
  }

  public static validateCanonicalChallengeSignature(
    challengeOrParams: any,
    reviewerOrKey: string,
    decisionOrSignature?: string,
    signatureOrKey?: string,
    secretKeyArg?: string,
    eventSignedAtArg?: string
  ): boolean {
    let expected: string;
    let sig: string;

    if (secretKeyArg !== undefined) {
      expected = this.generateCanonicalChallengeSignature(
        challengeOrParams,
        reviewerOrKey,
        decisionOrSignature,
        secretKeyArg,
        eventSignedAtArg
      );
      sig = signatureOrKey!;
    } else {
      expected = this.generateCanonicalChallengeSignature(
        challengeOrParams,
        reviewerOrKey,
        undefined,
        undefined,
        eventSignedAtArg
      );
      sig = challengeOrParams.signature;
    }

    if (!sig) return false;
    const sigBuf = Buffer.from(sig, 'utf8');
    const expBuf = Buffer.from(expected, 'utf8');
    if (sigBuf.length !== expBuf.length) {
      return false;
    }
    return timingSafeEqual(sigBuf, expBuf);
  }

  public static generateReviewerSignature(
    params: {
      taskId: string;
      reviewerId: string;
      decision: string;
      targetDocumentHash: string;
      reviewedAt: string;
      challengeId?: string;
      nonce?: string;
      tenantId?: string;
      pilotId?: string;
      documentVersion?: number;
      issuedAt?: string;
      expiresAt?: string;
    },
    secretKey: string
  ): string {
    if (!secretKey || typeof secretKey !== 'string' || secretKey.trim().length === 0) {
      throw new Error('Chave secreta de assinatura ausente ou inválida. Operação rejeitada.');
    }
    if (params.challengeId && params.nonce && params.tenantId && params.pilotId) {
      return this.generateCanonicalChallengeSignature(
        {
          challengeId: params.challengeId,
          nonce: params.nonce,
          tenantId: params.tenantId,
          pilotId: params.pilotId,
          taskId: params.taskId,
          documentVersion: params.documentVersion || 1,
          documentSha256: params.targetDocumentHash,
          reviewerId: params.reviewerId,
          decision: params.decision,
          issuedAt: params.issuedAt || params.reviewedAt,
          expiresAt: params.expiresAt || params.reviewedAt
        },
        secretKey
      );
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
      challengeId?: string;
      nonce?: string;
      tenantId?: string;
      pilotId?: string;
      documentVersion?: number;
      issuedAt?: string;
      expiresAt?: string;
    },
    secretKey: string
  ): boolean {
    if (!secretKey || typeof secretKey !== 'string' || secretKey.trim().length === 0) {
      throw new Error('Chave secreta de assinatura ausente ou inválida. Validação rejeitada.');
    }
    const expected = this.generateReviewerSignature(params, secretKey);
    const sigBuf = Buffer.from(params.signature, 'utf8');
    const expBuf = Buffer.from(expected, 'utf8');
    if (sigBuf.length !== expBuf.length) {
      return false;
    }
    return timingSafeEqual(sigBuf, expBuf);
  }

  public static validateReviewerToken(
    token: string,
    expectedTenantId: string,
    expectedReviewerId: string,
    tokenService?: TokenService,
    expectedPilotId?: string
  ): { isValid: boolean; payload?: any; error?: string } {
    if (!token) {
      return { isValid: false, error: 'Token de revisor ausente.' };
    }
    if (!tokenService) {
      return { isValid: false, error: 'Serviço de autenticação TokenService não fornecido ou indisponível.' };
    }
    const result = tokenService.verifyToken(token);
    if (!result.valid || !result.payload) {
      return { isValid: false, error: `Token inválido: ${result.error} (${result.code})` };
    }
    const payload = result.payload;

    // 1. Tenant match
    if (payload.tenant_id !== expectedTenantId) {
      return { isValid: false, error: `Isolamento multi-tenant violado: token pertence ao tenant ${payload.tenant_id}, esperado ${expectedTenantId}.` };
    }

    // 2. Exact user identity match (reject impersonation)
    const tokenUserId = payload.user_id || payload.sub;
    if (tokenUserId !== expectedReviewerId) {
      return { isValid: false, error: `Impersonação detectada e rejeitada: token pertence a '${tokenUserId}', mas a revisão foi declarada como '${expectedReviewerId}'.` };
    }

    // 2b. Pilot ID match if present
    if (expectedPilotId && payload.pilot_id && payload.pilot_id !== expectedPilotId) {
      return { isValid: false, error: `Piloto divergente: token vinculado ao piloto '${payload.pilot_id}', esperado '${expectedPilotId}'.` };
    }

    // 3. Authorized role (HUMAN_REVIEWER or ADMIN)
    const roles: string[] = Array.isArray(payload.roles) ? payload.roles : [];
    const hasAuthorizedRole = roles.includes('HUMAN_REVIEWER') || roles.includes('ADMIN');
    if (!hasAuthorizedRole) {
      return { isValid: false, error: `Função não autorizada no token para o revisor '${expectedReviewerId}'. Requer 'HUMAN_REVIEWER' ou 'ADMIN'.` };
    }

    // 4. Explicit permission
    const perms: string[] = Array.isArray(payload.permissions) ? payload.permissions : [];
    if (!perms.includes('PILOT_REVIEW')) {
      return { isValid: false, error: `Permissão explícita 'PILOT_REVIEW' ausente no token do revisor '${expectedReviewerId}'.` };
    }

    // 5. Persistent identity account verification in identity store (Fail-Closed)
    let account: any;
    try {
      account = tokenService.getAccount(expectedReviewerId);
    } catch (err: any) {
      return { isValid: false, error: `Falha ao aceder ao armazenamento de identidades do revisor '${expectedReviewerId}': ${err.message}` };
    }

    if (!account) {
      return { isValid: false, error: `Vínculo persistente do revisor '${expectedReviewerId}' não encontrado no serviço de identidade.` };
    }
    if (account.status !== 'ACTIVE') {
      return { isValid: false, error: `Vínculo inactivo do utilizador '${expectedReviewerId}': estado actual '${account.status}'.` };
    }
    if (account.tenant_id !== expectedTenantId) {
      return { isValid: false, error: `Vínculo do utilizador '${expectedReviewerId}' pertence a outro tenant ('${account.tenant_id}').` };
    }
    if (account.user_id !== expectedReviewerId) {
      return { isValid: false, error: `Identidade da conta persistente ('${account.user_id}') diverge do revisor esperado ('${expectedReviewerId}').` };
    }

    // 6. Persistent roles & permissions check (claims no token não podem conceder privilégios ausentes na conta)
    const persistentRoles: string[] = Array.isArray(account.roles) ? account.roles : [];
    const hasPersistentAuthorizedRole = persistentRoles.includes('HUMAN_REVIEWER') || persistentRoles.includes('ADMIN');
    if (!hasPersistentAuthorizedRole) {
      return { isValid: false, error: `Função não autorizada na conta persistente do revisor '${expectedReviewerId}'. Requer 'HUMAN_REVIEWER' ou 'ADMIN'.` };
    }

    const persistentPerms: string[] = Array.isArray(account.permissions) ? account.permissions : [];
    if (!persistentPerms.includes('PILOT_REVIEW')) {
      return { isValid: false, error: `Permissão explícita 'PILOT_REVIEW' ausente na conta persistente do revisor '${expectedReviewerId}'.` };
    }

    return { isValid: true, payload };
  }

  public static validateReviewerSession(
    sessionId: string,
    tokenJti: string,
    reviewerId: string,
    tenantId: string,
    pilotId: string,
    store: any
  ): { isValid: boolean; session?: any; error?: string } {
    if (!sessionId) {
      return { isValid: false, error: 'Identificador de sessão de revisão ausente.' };
    }
    const session = store.getReviewerSession(sessionId);
    if (!session) {
      return { isValid: false, error: `Sessão de revisão '${sessionId}' inexistente.` };
    }
    if (session.status !== 'ACTIVE') {
      return { isValid: false, error: `Sessão de revisão '${sessionId}' inactiva (estado: ${session.status}).` };
    }
    if (new Date() > new Date(session.expires_at)) {
      return { isValid: false, error: `Sessão de revisão '${sessionId}' expirou em ${session.expires_at}.` };
    }
    if (session.token_jti !== tokenJti) {
      return { isValid: false, error: `Sessão incompatível: token JTI divergente da sessão.` };
    }
    if (session.reviewer_id !== reviewerId) {
      return { isValid: false, error: `Sessão pertence a outro revisor ('${session.reviewer_id}').` };
    }
    if (session.tenant_id !== tenantId) {
      return { isValid: false, error: `Sessão pertence a outro tenant ('${session.tenant_id}').` };
    }
    if (session.pilot_id !== pilotId) {
      return { isValid: false, error: `Sessão pertence a outro piloto ('${session.pilot_id}').` };
    }
    return { isValid: true, session };
  }
}

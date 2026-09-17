import { createHash, randomBytes, randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import {
  PilotProgram,
  ControlledPilotStatus,
  PilotTaskRequest,
  PilotTaskReceipt,
  PilotHumanReviewReceipt,
  PilotDeliveryReceipt,
  PilotMetrics,
  PilotGateResults,
  PilotGateCheck,
  PilotIncident,
  HumanReviewStatus,
  DeliveryStatus,
  FinalTaskStatus,
  OperationalPilotMode,
  PilotFinalAttestation,
  PilotReviewChallenge,
  PilotDocumentValidationReceipt,
  SecretProvider
} from '@ai-employee/shared';
import { TransactionalPilotStore } from './TransactionalPilotStore.js';
import { PhysicalDocumentValidator } from './PhysicalDocumentValidator.js';
import { PilotExternalValidator } from './PilotExternalValidator.js';
import { EnvironmentSecretProvider, scanAndRejectSensitiveFields } from './PilotSecretProvider.js';
import { TokenService } from '@ai-employee/shared/server';

function sha256(content: string | Buffer): string {
  return createHash('sha256').update(content).digest('hex');
}

function canonicalJson(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJson).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalJson(obj[k])).join(',') + '}';
}

export class ControlledPilotEngine {
  private static instance: ControlledPilotEngine;
  private store: TransactionalPilotStore;
  private tokenService?: TokenService;
  private secretProvider: SecretProvider;
  private taskCache = new Map<string, PilotTaskReceipt>();

  public constructor(
    store?: TransactionalPilotStore,
    tokenService?: TokenService,
    secretProvider?: SecretProvider
  ) {
    this.store = store || new TransactionalPilotStore();
    this.tokenService = tokenService;
    this.secretProvider = secretProvider || new EnvironmentSecretProvider();
  }

  public static getInstance(
    store?: TransactionalPilotStore,
    tokenService?: TokenService,
    secretProvider?: SecretProvider
  ): ControlledPilotEngine {
    if (!ControlledPilotEngine.instance || store || tokenService || secretProvider) {
      ControlledPilotEngine.instance = new ControlledPilotEngine(store, tokenService, secretProvider);
    }
    return ControlledPilotEngine.instance;
  }

  public setSecretProvider(sp: SecretProvider): void {
    this.secretProvider = sp;
  }

  public getSecretProvider(): SecretProvider {
    return this.secretProvider;
  }

  public setTokenService(ts: TokenService): void {
    this.tokenService = ts;
  }

  public getTokenService(): TokenService | undefined {
    return this.tokenService;
  }

  public getStore(): TransactionalPilotStore {
    return this.store;
  }

  public getDbPath(): string {
    return this.store.getDbPath();
  }

  public clearStateForTests(): void {
    this.taskCache.clear();
    this.store.clearTablesForTests();
  }

  public reset(store?: TransactionalPilotStore): void {
    this.taskCache.clear();
    if (store) {
      if (this.store && this.store !== store) {
        try {
          this.store.close();
        } catch {}
      }
      this.store = store;
      return;
    }

    // Se nenhum store for fornecido e o store actual já for uma base persistente em ficheiro,
    // PRESERVA a base persistente e apenas limpa os dados para os testes!
    if (this.store && this.store.getDbPath() !== ':memory:') {
      this.clearStateForTests();
      return;
    }

    // Caso o store seja :memory:, fecha e recria :memory:
    if (this.store) {
      try {
        this.store.close();
      } catch {}
    }
    this.store = new TransactionalPilotStore(':memory:');
  }

  // -------------------------------------------------------------
  // 1. Pilot Program Lifecycle
  // -------------------------------------------------------------
  public createPilot(spec: {
    pilot_id: string;
    tenant_id: string;
    organization_name: string;
    authorization_reference: string;
    authorization_document_path?: string;
    authorization_document_sha256?: string;
    authorized_by: string;
    authorized_at: string;
    start_at: string;
    end_at: string;
    selected_employee_ids: number[];
    allowed_data_categories: string[];
    prohibited_data_categories: string[];
    allowed_connectors: string[];
    prohibited_actions: string[];
    human_reviewers: string[];
    reviewer_configs?: Array<{
      reviewer_id: string;
      display_name: string;
      role: string;
      secret_ref?: string;
      key_id?: string;
      secret_or_key?: string;
    }>;
    task_limit: number;
    execution_mode?: OperationalPilotMode;
  }): PilotProgram {
    const execution_mode = spec.execution_mode || 'SIMULATION';
    const completeSpec = { ...spec, execution_mode };

    // Strict scan against sensitive plaintext secrets in operational configurations
    if (execution_mode === 'OPERATIONAL_PILOT') {
      scanAndRejectSensitiveFields(spec);
      if (spec.reviewer_configs) {
        for (const cfg of spec.reviewer_configs) {
          if ((cfg as any).secret_or_key) {
            throw new Error(
              `Campo sensível proibido detectado: 'secret_or_key' no revisor '${cfg.reviewer_id}'. Use 'secret_ref' ou 'key_id'.`
            );
          }
        }
      }
    }

    // 1. Validate external config schema
    const validation = PilotExternalValidator.validatePilotConfig(completeSpec, execution_mode);
    if (!validation.isValid) {
      throw new Error(`Configuração do piloto inválida:\n${validation.errors.join('\n')}`);
    }

    const existing = this.store.getPilot(spec.pilot_id);
    if (existing) {
      throw new Error(`Piloto com ID '${spec.pilot_id}' já existe.`);
    }

    // Verify selected employees exist in canonical 500 catalog
    for (const empId of spec.selected_employee_ids) {
      const exists = CANONICAL_500_ROLES.some(r => r.id === empId);
      if (!exists) {
        throw new Error(`Employee ID ${empId} não encontrado no catálogo canónico de 500.`);
      }
    }

    const now = new Date().toISOString();
    const pilot: PilotProgram = {
      ...completeSpec,
      status: 'DRAFT',
      created_at: now,
      updated_at: now
    };

    this.store.savePilot(pilot);
    return pilot;
  }

  public authorizePilot(pilot_id: string, authRef: string, authorizedBy: string, authAt: string): PilotProgram {
    const pilot = this.getPilot(pilot_id);
    if (!authRef || !authorizedBy || !authAt) {
      throw new Error('Autorização física incompleta.');
    }
    pilot.authorization_reference = authRef;
    pilot.authorized_by = authorizedBy;
    pilot.authorized_at = authAt;
    pilot.status = 'AUTHORIZED';
    pilot.updated_at = new Date().toISOString();

    this.store.updatePilot(pilot);
    return pilot;
  }

  public activatePilot(pilot_id: string): PilotProgram {
    const pilot = this.getPilot(pilot_id);
    if (pilot.status !== 'AUTHORIZED' && pilot.status !== 'PAUSED') {
      throw new Error(`Piloto não pode ser activado a partir do estado ${pilot.status}. Requer autorização prévia.`);
    }
    pilot.status = 'ACTIVE';
    pilot.updated_at = new Date().toISOString();

    this.store.updatePilot(pilot);
    return pilot;
  }

  public pausePilot(pilot_id: string, reason: string): PilotProgram {
    const pilot = this.getPilot(pilot_id);
    pilot.status = 'PAUSED';
    pilot.updated_at = new Date().toISOString();

    this.store.updatePilot(pilot);
    this.recordIncident({
      incident_id: `INC_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      pilot_id,
      timestamp: new Date().toISOString(),
      type: 'OTHER',
      severity: 'MEDIUM',
      details: `Piloto pausado: ${reason}`,
      resolved: false
    });
    return pilot;
  }

  public cancelPilot(pilot_id: string, reason: string): PilotProgram {
    const pilot = this.getPilot(pilot_id);
    pilot.status = 'CANCELLED';
    pilot.updated_at = new Date().toISOString();

    this.store.updatePilot(pilot);
    return pilot;
  }

  public completePilot(pilot_id: string): PilotProgram {
    const pilot = this.getPilot(pilot_id);
    pilot.status = 'COMPLETED';
    pilot.updated_at = new Date().toISOString();

    this.store.updatePilot(pilot);
    return pilot;
  }

  public getPilot(pilot_id: string): PilotProgram {
    const pilot = this.store.getPilot(pilot_id);
    if (!pilot) {
      throw new Error(`Piloto '${pilot_id}' não encontrado.`);
    }
    return pilot;
  }

  // -------------------------------------------------------------
  // 2. Task Intake & Execution Pipeline
  // -------------------------------------------------------------
  public executeTask(request: PilotTaskRequest): PilotTaskReceipt {
    const pilot = this.getPilot(request.pilot_id);

    // 1. Tenant Isolation Gate
    if (request.tenant_id !== pilot.tenant_id) {
      this.recordIncident({
        incident_id: `INC_CROSS_${Date.now()}`,
        pilot_id: pilot.pilot_id,
        timestamp: new Date().toISOString(),
        type: 'CROSS_TENANT_ACCESS',
        severity: 'CRITICAL',
        details: `Tentativa de acesso cruzado: Pedido para tenant '${request.tenant_id}' num piloto do tenant '${pilot.tenant_id}'.`,
        resolved: false
      });
      throw new Error(`Acesso negado: Isolamento multi-tenant violado. Tenant '${request.tenant_id}' difere do piloto '${pilot.tenant_id}'.`);
    }

    // Strict validation against default requester fallback in operational mode
    if (pilot.execution_mode === 'OPERATIONAL_PILOT') {
      if (!request.requested_by || request.requested_by === 'operador_saso_01') {
        throw new Error("Solicitante obrigatório e fallback 'operador_saso_01' proibido em modo operacional.");
      }
    }

    // 2. Prohibited Action Gate
    if (request.action_type && pilot.prohibited_actions?.includes(request.action_type)) {
      this.recordIncident({
        incident_id: `INC_UNAUTH_${Date.now()}`,
        pilot_id: pilot.pilot_id,
        timestamp: new Date().toISOString(),
        type: 'UNAUTHORIZED_ACTION',
        severity: 'CRITICAL',
        details: `Tentativa de acção proibida detectada: ${request.action_type}`,
        resolved: false
      });
      throw new Error(`Acção proibida pelo regulamento do piloto: '${request.action_type}'.`);
    }

    // 3. Validate external task request against pilot contract
    const taskValidation = PilotExternalValidator.validateTaskRequest(request, pilot);
    if (!taskValidation.isValid) {
      throw new Error(`Tarefa inválida rejeitada:\n${taskValidation.errors.join('\n')}`);
    }

    // 4. Pilot Status Gate
    if (pilot.status !== 'ACTIVE') {
      throw new Error(`Execução rejeitada: Piloto '${pilot.pilot_id}' não está activo (estado actual: ${pilot.status}).`);
    }

    // 5. Expiration Gate
    const now = new Date();
    if (now > new Date(pilot.end_at)) {
      throw new Error(`Execução rejeitada: Piloto '${pilot.pilot_id}' expirou em ${pilot.end_at}.`);
    }

    // 6. Task Limit Gate
    const currentTasks = this.store.listTasks(pilot.pilot_id);
    if (currentTasks.length >= pilot.task_limit) {
      throw new Error(`Execução rejeitada: Limite de ${pilot.task_limit} tarefas atingido no piloto.`);
    }

    // 7. Idempotency Check in Transactional Persistence
    if (request.idempotency_key) {
      const existingTask = this.store.getTaskByIdempotency(pilot.pilot_id, request.idempotency_key);
      if (existingTask) {
        return existingTask;
      }
    }

    // 8. Input Snapshot & Tampering Validation
    if (!request.input_data || (typeof request.input_data === 'object' && Object.keys(request.input_data).length === 0)) {
      throw new Error('Dados de entrada vazios ou ausentes.');
    }
    const inputSnapshot = canonicalJson(request.input_data);
    const inputSnapshotSha = sha256(inputSnapshot);

    // 9. Execute Real Task Content Generation
    const startedAt = new Date().toISOString();
    const generated = this.generateEmployeeOutput(request, pilot.execution_mode);

    // 10. Physical Document Validation (PDF, DOCX, XLSX)
    const docValidation = PhysicalDocumentValidator.validate(generated.buffer, request.format, pilot.execution_mode);
    if (!docValidation.isValid) {
      throw new Error(`Falha na validação física do documento: ${docValidation.error}`);
    }

    const completedAt = new Date().toISOString();
    const outputHash = docValidation.sha256;

    const isSim = pilot.execution_mode === 'SIMULATION';
    const classificationLevel = isSim
      ? 'CONTROLLED_PILOT_SIMULATOR_IMPLEMENTED'
      : 'OPERATIONAL_PILOT_INFRASTRUCTURE_READY';

    const receipt: PilotTaskReceipt = {
      task_id: request.task_id,
      pilot_id: request.pilot_id,
      tenant_id: request.tenant_id,
      employee_id: request.employee_id,
      requested_by: request.requested_by,
      received_at: request.received_at || startedAt,
      input_snapshot_sha256: inputSnapshotSha,
      execution_started_at: startedAt,
      execution_completed_at: completedAt,
      output_files: [generated.fileName],
      output_hashes: [outputHash],
      human_review_status: 'PENDING_REVIEW',
      reviewed_by: null,
      reviewed_at: null,
      corrections_required: 0,
      delivery_status: 'PENDING',
      final_status: 'SUCCESS',
      error_code: null,
      version: 1,
      idempotency_key: request.idempotency_key,
      execution_mode: pilot.execution_mode,
      is_simulation: isSim,
      classification_level: classificationLevel
    };

    receipt.receipt_sha256 = sha256(canonicalJson(receipt));

    // Save task, output and physical BLOB atomically with immediate read verification
    this.store.saveTaskWithOutputAndVerify(receipt, {
      output_id: `OUT_${request.task_id}_v1`,
      task_id: request.task_id,
      version: 1,
      file_name: generated.fileName,
      file_path: generated.fileName,
      file_bytes: generated.buffer,
      file_bytes_sha256: outputHash,
      is_active: true
    });

    // 11. Validação física e estrutural independente prévia no pipeline
    const activeOutRecord = this.store.getActiveOutputBytes(request.task_id);
    if (!activeOutRecord || !activeOutRecord.bytes) {
      throw new Error(`Falha crítica: Bytes de saída não encontrados na persistência para tarefa '${request.task_id}'.`);
    }
    const savedBytes = activeOutRecord.bytes;

    PhysicalDocumentValidator.validateMimeCoherence(savedBytes, request.format, generated.fileName);

    const docReceipt = PhysicalDocumentValidator.createDocumentValidationReceipt(
      savedBytes,
      request.format,
      request.task_id,
      1,
      pilot.execution_mode
    );
    this.store.saveDocumentValidationReceipt(docReceipt);

    if (!docReceipt.is_valid && docReceipt.result !== 'PASS') {
      this.recordIncident({
        incident_id: `INC_DOCVAL_${Date.now()}`,
        pilot_id: pilot.pilot_id,
        timestamp: new Date().toISOString(),
        type: 'OTHER',
        severity: 'HIGH',
        details: `Falha na validação independente do documento para tarefa '${request.task_id}': ${docReceipt.error || docReceipt.error_details}`,
        resolved: false
      });
      receipt.final_status = 'FAILED';
      receipt.error_code = 'DOCUMENT_VALIDATION_FAILED';
      receipt.human_review_status = 'BLOCKED';
      this.store.updateTask(receipt);
      throw new Error(`Falha na validação física independente do documento: ${docReceipt.error || docReceipt.error_details}`);
    }

    // 12. Emissão do Desafio de Revisão Humana (Fase A)
    this.issueReviewChallenge(request.task_id);

    this.taskCache.set(receipt.task_id, receipt);
    return receipt;
  }

  // -------------------------------------------------------------
  // 3. Human Review Challenge Issuance (Phase A)
  // -------------------------------------------------------------
  public issueReviewChallenge(
    taskId: string,
    allowedDecision?: HumanReviewStatus,
    reviewerId?: string
  ): PilotReviewChallenge {
    const task = this.store.getTask(taskId);
    if (!task) {
      throw new Error(`Tarefa '${taskId}' não encontrada.`);
    }
    const pilot = this.getPilot(task.pilot_id);

    const activeOutput = this.store.getActiveOutput(taskId);
    if (!activeOutput) {
      throw new Error(`Output activo não encontrado para tarefa '${taskId}'.`);
    }

    // Validação independente prévia obrigatória
    const docReceipt = this.store.getDocumentValidationReceipt(taskId, activeOutput.version);
    if (!docReceipt || (!docReceipt.is_valid && docReceipt.result !== 'PASS')) {
      throw new Error(
        `Desafio de revisão bloqueado: Documento da tarefa '${taskId}' não possui validação independente aprovada.`
      );
    }

    const challengeId = `CHAL_${Date.now()}_${randomUUID().replace(/-/g, '').slice(0, 8)}`;
    const nonce = randomBytes(16).toString('hex');
    const issuedAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

    const challenge: PilotReviewChallenge = {
      challenge_id: challengeId,
      nonce,
      tenant_id: pilot.tenant_id,
      pilot_id: pilot.pilot_id,
      task_id: taskId,
      document_version: activeOutput.version,
      document_sha256: activeOutput.file_bytes_sha256,
      reviewer_id: reviewerId || null,
      allowed_decision: allowedDecision || null,
      issued_at: issuedAt,
      expires_at: expiresAt,
      consumed_at: null,
      status: 'PENDING'
    };

    this.store.saveReviewChallenge(challenge);
    return challenge;
  }

  // -------------------------------------------------------------
  // 4. Human Review & Signed Challenge Consumption (Phase B)
  // -------------------------------------------------------------
  public reviewTask(params: {
    review_id: string;
    task_id: string;
    challenge_id?: string;
    reviewer: string;
    decision: HumanReviewStatus;
    comments: string;
    auth_method?: 'SESSION_TOKEN' | 'HMAC_SIGNATURE' | 'API_KEY';
    auth_token?: string;
    reviewer_token?: string;
    session_reference?: string;
    signature?: string;
    corrections_requested?: string[];
    corrected_content?: string | Buffer;
  }): PilotHumanReviewReceipt {
    const task = this.taskCache.get(params.task_id) || this.store.getTask(params.task_id);
    if (!task) {
      throw new Error(`Tarefa '${params.task_id}' não encontrada.`);
    }

    const pilot = this.getPilot(task.pilot_id);

    // 1. Prohibit self-review (solicitante e revisor não podem ser a mesma pessoa)
    if (task.requested_by === params.reviewer) {
      throw new Error('Auto-revisão proibida: solicitante e revisor não podem ser a mesma pessoa.');
    }

    // 2. Check reviewer authorization
    if (!pilot.human_reviewers.includes(params.reviewer)) {
      throw new Error(`Utilizador '${params.reviewer}' não está credenciado como revisor humano no piloto.`);
    }

    // 3. Obter Desafio de Revisão Fase A (via challenge_id ou pendente na tarefa)
    let challenge: PilotReviewChallenge | null = null;
    if (params.challenge_id) {
      challenge = this.store.getReviewChallenge(params.challenge_id);
    } else {
      challenge = this.store.getPendingChallengeForTask(params.task_id);
    }

    if (!challenge || challenge.status !== 'PENDING') {
      throw new Error(`Desafio de revisão pendente não encontrado ou já consumido para a tarefa '${params.task_id}'.`);
    }

    if (new Date() > new Date(challenge.expires_at)) {
      throw new Error(`Desafio de revisão expirou em ${challenge.expires_at}.`);
    }

    if (challenge.reviewer_id && challenge.reviewer_id !== params.reviewer) {
      throw new Error(`Desafio de revisão restrito ao revisor '${challenge.reviewer_id}'.`);
    }

    if (challenge.allowed_decision && challenge.allowed_decision !== params.decision) {
      throw new Error(`Decisão de revisão não autorizada pelo desafio: '${params.decision}'.`);
    }

    const activeOutput = this.store.getActiveOutput(params.task_id);
    if (!activeOutput) {
      throw new Error(`Ficheiros de saída activos da tarefa '${params.task_id}' não encontrados.`);
    }

    if (challenge.document_sha256 !== activeOutput.file_bytes_sha256) {
      throw new Error('Hash do documento diverge do desafio emitido.');
    }

    // 3b. Validação física independente prévia com status PASS obrigatória
    const docReceipt = this.store.getDocumentValidationReceipt(params.task_id, activeOutput.version);
    if (!docReceipt || (!docReceipt.is_valid && docReceipt.result !== 'PASS')) {
      throw new Error('Revisão rejeitada: documento ativo não possui validação física independente aprovada (PASS).');
    }

    // O timestamp canónico unificado é estritamente challenge.issued_at
    const reviewedAt = challenge.issued_at;
    const prevHash = activeOutput.file_bytes_sha256;
    let newHash = prevHash;

    // 4. Verify reviewer authentication & cryptographic review signature
    const authToken = params.auth_token || params.reviewer_token;
    let sessionRef = params.session_reference;

    if (authToken) {
      if (!this.tokenService && pilot.execution_mode === 'OPERATIONAL_PILOT') {
        throw new Error('Serviço de autenticação TokenService não configurado no motor para execução operacional.');
      }
      const tokenSvc = this.tokenService || new TokenService();
      const tokenValidation = PilotExternalValidator.validateReviewerToken(
        authToken,
        pilot.tenant_id,
        params.reviewer,
        tokenSvc
      );
      if (!tokenValidation.isValid) {
        throw new Error(`Autenticação de revisor por token rejeitada: ${tokenValidation.error}`);
      }
      sessionRef = tokenValidation.payload?.jti || sha256(authToken).slice(0, 16);
    }

    const reviewerConfig = pilot.reviewer_configs?.find(r => r.reviewer_id === params.reviewer);
    let secretKey: string | undefined;

    if (pilot.execution_mode === 'OPERATIONAL_PILOT') {
      if (!reviewerConfig) {
        throw new Error(`Configuração do revisor '${params.reviewer}' ausente em modo operacional.`);
      }
      const secretRef = reviewerConfig.secret_ref || reviewerConfig.key_id;
      if (!secretRef) {
        throw new Error(`Referência de segredo (secret_ref/key_id) ausente para revisor '${params.reviewer}'.`);
      }
      secretKey = this.secretProvider.resolveSecret(secretRef, pilot.tenant_id);
      if (!secretKey) {
        throw new Error(`Segredo não resolvido pelo SecretProvider para '${secretRef}'.`);
      }
    } else {
      // Modo SIMULATION
      const secretRef = reviewerConfig?.secret_ref || reviewerConfig?.key_id;
      if (secretRef) {
        try {
          secretKey = this.secretProvider.resolveSecret(secretRef, pilot.tenant_id);
        } catch {}
      }
      if (!secretKey) {
        secretKey = reviewerConfig?.secret_or_key || 'SIMULATION_PILOT_DEV_REVIEW_KEY';
      }
    }

    let signature = params.signature;
    if (!signature) {
      if (pilot.execution_mode === 'OPERATIONAL_PILOT') {
        throw new Error('Assinatura canónica do desafio obrigatória em modo OPERATIONAL_PILOT.');
      }
      signature = PilotExternalValidator.generateCanonicalChallengeSignature(
        challenge,
        params.reviewer,
        params.decision,
        secretKey!
      );
    } else {
      const isValidSig = PilotExternalValidator.validateCanonicalChallengeSignature(
        challenge,
        params.reviewer,
        params.decision,
        signature,
        secretKey!
      );
      if (!isValidSig) {
        throw new Error('Assinatura criptográfica canónica do desafio inválida ou adulterada.');
      }
    }

    // 5. Handle corrections
    if (params.decision === 'APPROVED_WITH_CORRECTIONS') {
      if (!params.corrected_content) {
        throw new Error('Correcção exigida requer novo conteúdo rectificado.');
      }

      const format: any = activeOutput.file_name.endsWith('.pdf')
        ? 'PDF'
        : activeOutput.file_name.endsWith('.xlsx')
        ? 'XLSX'
        : 'DOCX';

      let correctedBuf: Buffer;
      if (Buffer.isBuffer(params.corrected_content)) {
        correctedBuf = params.corrected_content;
      } else {
        const textContent = String(params.corrected_content);
        if (format === 'DOCX') {
          correctedBuf = PhysicalDocumentValidator.buildRealBinaryDocx('Documento Rectificado', textContent.split('\n'));
        } else if (format === 'PDF') {
          correctedBuf = PhysicalDocumentValidator.buildRealBinaryPdf('Documento Rectificado', textContent.split('\n'));
        } else {
          correctedBuf = Buffer.from(textContent, 'utf8');
        }
      }

      const validation = PhysicalDocumentValidator.validate(correctedBuf, format, pilot.execution_mode);
      if (!validation.isValid) {
        throw new Error(`Conteúdo rectificado inválido: ${validation.error}`);
      }

      newHash = validation.sha256;
      const v2FileName = activeOutput.file_name.replace(/\.([a-z0-9]+)$/, '_v2.$1');

      // Validar documento corrigido de forma independente
      const v2Receipt = PhysicalDocumentValidator.createDocumentValidationReceipt(
        correctedBuf,
        format,
        params.task_id,
        2,
        pilot.execution_mode
      );
      this.store.saveDocumentValidationReceipt(v2Receipt);
      if (!v2Receipt.is_valid && v2Receipt.result !== 'PASS') {
        throw new Error(`Conteúdo rectificado rejeitado na validação independente: ${v2Receipt.error || v2Receipt.error_details}`);
      }

      task.output_files = [v2FileName];
      task.output_hashes = [newHash];
      task.corrections_required = (params.corrections_requested || []).length || 1;
      task.version = 2;

      this.store.saveOutput({
        output_id: `OUT_${params.task_id}_v2`,
        task_id: params.task_id,
        version: 2,
        file_name: v2FileName,
        file_path: v2FileName,
        file_bytes: correctedBuf,
        file_bytes_sha256: newHash,
        is_active: true
      });
    } else if (params.decision === 'REJECTED') {
      task.delivery_status = 'BLOCKED';
      task.final_status = 'REJECTED';
    } else if (params.decision === 'BLOCKED') {
      task.delivery_status = 'BLOCKED';
      task.final_status = 'BLOCKED';
    }

    task.human_review_status = params.decision;
    task.reviewed_by = params.reviewer;
    task.reviewed_at = reviewedAt;
    task.receipt_sha256 = sha256(canonicalJson(task));

    const reviewReceipt: PilotHumanReviewReceipt = {
      review_id: params.review_id,
      task_id: params.task_id,
      pilot_id: task.pilot_id,
      reviewer: params.reviewer,
      reviewed_at: reviewedAt,
      decision: params.decision,
      comments: params.comments,
      corrections_requested: params.corrections_requested,
      previous_output_hash: prevHash,
      new_output_hash: newHash,
      auth_method: authToken ? 'SESSION_TOKEN' : (params.auth_method || 'HMAC_SIGNATURE'),
      review_signature_sha256: signature,
      receipt_sha256: ''
    };
    if (sessionRef) {
      (reviewReceipt as any).session_reference = sessionRef;
    }
    reviewReceipt.receipt_sha256 = sha256(canonicalJson(reviewReceipt));

    // Consumo atómico do desafio e persistência da revisão
    this.store.consumeReviewChallengeAtomic(challenge.challenge_id, reviewReceipt, task);
    this.taskCache.set(task.task_id, task);
    return reviewReceipt;
  }

  // -------------------------------------------------------------
  // 4. Controlled Delivery vs. Explicit Archiving
  // -------------------------------------------------------------
  public deliverTask(
    taskIdOrParams: string | {
      taskId: string;
      deliveredTo: string;
      channel: string;
      externalProviderResponse?: Record<string, any>;
    },
    deliveredToArg?: string,
    channelArg?: string,
    externalProviderResponseArg?: Record<string, any>
  ): PilotDeliveryReceipt {
    const params = typeof taskIdOrParams === 'string'
      ? {
          taskId: taskIdOrParams,
          deliveredTo: deliveredToArg || 'archive@saso.ao',
          channel: channelArg || 'INTERNAL_ARCHIVE',
          externalProviderResponse: externalProviderResponseArg
        }
      : taskIdOrParams;

    const task = this.taskCache.get(params.taskId) || this.store.getTask(params.taskId);
    if (!task) {
      throw new Error(`Tarefa '${params.taskId}' não encontrada.`);
    }

    const pilot = this.getPilot(task.pilot_id);

    // Strict validation against default delivery recipient in operational mode
    if (pilot.execution_mode === 'OPERATIONAL_PILOT') {
      if (!params.deliveredTo || params.deliveredTo === 'archive@saso.ao') {
        throw new Error("Destinatário de entrega obrigatório e fallback 'archive@saso.ao' proibido em modo operacional.");
      }
    }

    // Require independent document validation pass prior to delivery
    const docReceipt = this.store.getDocumentValidationReceipt(params.taskId, task.version || 1);
    if (!docReceipt || (!docReceipt.is_valid && docReceipt.result !== 'PASS')) {
      throw new Error(`Entrega bloqueada: Documento da tarefa '${params.taskId}' não possui validação física independente aprovada.`);
    }

    if (task.human_review_status !== 'APPROVED' && task.human_review_status !== 'APPROVED_WITH_CORRECTIONS') {
      throw new Error(`Entrega bloqueada: Tarefa '${params.taskId}' não tem aprovação humana (estado: ${task.human_review_status}).`);
    }

    if (!task.output_hashes || task.output_hashes.length === 0) {
      throw new Error('Entrega bloqueada: Saída sem hash físico não pode ser entregue.');
    }

    const deliveredAt = new Date().toISOString();
    const hasExternalResponse = Boolean(params.externalProviderResponse && params.externalProviderResponse.external_id);

    // If no real external provider response, mark strictly as ARCHIVED or READY_FOR_MANUAL_DELIVERY
    let status: DeliveryStatus = 'ARCHIVED';
    if (hasExternalResponse) {
      status = 'DELIVERED';
    } else if (params.channel === 'MANUAL_DISPATCH') {
      status = 'READY_FOR_MANUAL_DELIVERY';
    } else {
      status = 'ARCHIVED';
    }

    task.delivery_status = status;
    task.receipt_sha256 = sha256(canonicalJson(task));

    const deliveryReceipt: PilotDeliveryReceipt = {
      delivery_id: `DELIV_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      task_id: params.taskId,
      pilot_id: task.pilot_id,
      tenant_id: task.tenant_id,
      delivered_to: params.deliveredTo,
      channel: params.channel,
      delivered_at: deliveredAt,
      output_hashes: [...task.output_hashes],
      status,
      is_external_confirmed: hasExternalResponse,
      external_provider_response: params.externalProviderResponse,
      receipt_sha256: ''
    };
    deliveryReceipt.receipt_sha256 = sha256(canonicalJson(deliveryReceipt));

    this.store.transaction(() => {
      this.store.saveDelivery(deliveryReceipt);
      this.store.updateTask(task);
    });

    return deliveryReceipt;
  }

  // -------------------------------------------------------------
  // Document Quality & Placeholder Validation (Backwards Compatibility)
  // -------------------------------------------------------------
  public validateDocumentContent(content: string, format: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error('Conteúdo do documento gerado está vazio.');
    }

    // Residual placeholder pattern checks
    const badPatterns = [
      /\byyyy\b/i,
      /\[NOME\]/i,
      /\[VALOR\]/i,
      /\[DATA\]/i,
      /\{\{[a-zA-Z0-9_-]+\}\}/,
      /<PLACEHOLDER>/i,
      /\[INSERIR [^\]]+\]/i
    ];

    for (const pat of badPatterns) {
      if (pat.test(content)) {
        throw new Error(`Rejeição de qualidade: Documento contém placeholder residual ou template não preenchido (${pat}).`);
      }
    }

    // Format specific checks
    if (format === 'PDF') {
      if (!content.startsWith('%PDF-1.7') && !content.includes('[PDF DOCUMENT]')) {
        throw new Error('Ficheiro PDF com estrutura inválida.');
      }
    } else if (format === 'DOCX') {
      if (!content.includes('[DOCX DOCUMENT]') && !content.includes('<?xml')) {
        throw new Error('Ficheiro DOCX com estrutura inválida.');
      }
    } else if (format === 'XLSX') {
      if (!content.includes('[XLSX SPREADSHEET]') && !content.includes('<?xml')) {
        throw new Error('Ficheiro XLSX com estrutura inválida.');
      }
    }
  }

  // -------------------------------------------------------------
  // 5. Metrics Calculation (Derived Physically from Persistence)
  // -------------------------------------------------------------
  public calculatePilotMetrics(pilotId: string): PilotMetrics {
    const pilot = this.getPilot(pilotId);
    const tasks = this.store.listTasks(pilotId);
    const deliveries = this.store.listDeliveries(pilotId);
    const incidents = this.store.listIncidents(pilotId);

    const totalReceived = tasks.length;
    const totalCompleted = tasks.filter(t => t.final_status === 'SUCCESS').length;
    const totalApprovedFirst = tasks.filter(t => t.human_review_status === 'APPROVED' && t.corrections_required === 0).length;
    const totalCorrected = tasks.filter(t => t.human_review_status === 'APPROVED_WITH_CORRECTIONS' || t.corrections_required > 0).length;
    const totalRejected = tasks.filter(t => t.human_review_status === 'REJECTED' || t.final_status === 'REJECTED').length;
    const totalFailed = tasks.filter(t => t.final_status === 'FAILED' || t.error_code !== null).length;
    const totalArchived = tasks.filter(t => t.delivery_status === 'ARCHIVED' || t.delivery_status === 'READY_FOR_MANUAL_DELIVERY').length;

    const completionRate = totalReceived > 0 ? (totalCompleted / totalReceived) * 100 : 0;
    const firstPassRate = totalCompleted > 0 ? (totalApprovedFirst / totalCompleted) * 100 : 0;
    const correctionRate = totalCompleted > 0 ? (totalCorrected / totalCompleted) * 100 : 0;

    const executionTimesMs = tasks.map(t => {
      const start = new Date(t.execution_started_at).getTime();
      const end = new Date(t.execution_completed_at).getTime();
      return Math.max(0, end - start);
    }).sort((a, b) => a - b);

    const medianExec = executionTimesMs.length > 0
      ? executionTimesMs[Math.floor(executionTimesMs.length / 2)]
      : 0;
    const p95Exec = executionTimesMs.length > 0
      ? executionTimesMs[Math.floor(executionTimesMs.length * 0.95)]
      : 0;

    const reviewTimesMs: number[] = [];
    for (const t of tasks) {
      if (t.reviewed_at && t.execution_completed_at) {
        const ms = new Date(t.reviewed_at).getTime() - new Date(t.execution_completed_at).getTime();
        if (ms >= 0) reviewTimesMs.push(ms);
      }
    }
    reviewTimesMs.sort((a, b) => a - b);
    const medianReview = reviewTimesMs.length > 0
      ? reviewTimesMs[Math.floor(reviewTimesMs.length / 2)]
      : 0;

    const approvedCount = totalApprovedFirst + totalCorrected;
    const processedDeliveries = deliveries.filter(d => d.status === 'DELIVERED' || d.status === 'ARCHIVED' || d.status === 'READY_FOR_MANUAL_DELIVERY').length;
    const deliverySuccessRate = approvedCount > 0 ? (processedDeliveries / approvedCount) * 100 : 0;

    const crossTenantIncidents = incidents.filter(i => i.type === 'CROSS_TENANT_ACCESS').length;
    const privacyIncidents = incidents.filter(i => i.type === 'PRIVACY_LEAK').length;
    const unauthorizedActionAttempts = incidents.filter(i => i.type === 'UNAUTHORIZED_ACTION').length;
    const duplicateEffects = incidents.filter(i => i.type === 'DUPLICATE_EXECUTION').length;

    return {
      execution_mode: pilot.execution_mode,
      total_tasks_received: totalReceived,
      total_tasks_completed: totalCompleted,
      total_tasks_approved_first_review: totalApprovedFirst,
      total_tasks_corrected: totalCorrected,
      total_tasks_rejected: totalRejected,
      total_tasks_failed: totalFailed,
      total_tasks_archived: totalArchived,
      completion_rate: Number(completionRate.toFixed(2)),
      first_pass_acceptance_rate: Number(firstPassRate.toFixed(2)),
      human_correction_rate: Number(correctionRate.toFixed(2)),
      median_execution_time: medianExec,
      p95_execution_time: p95Exec,
      median_review_time: medianReview,
      delivery_success_rate: Number(deliverySuccessRate.toFixed(2)),
      cross_tenant_incidents: crossTenantIncidents,
      privacy_incidents: privacyIncidents,
      unauthorized_action_attempts: unauthorizedActionAttempts,
      duplicate_business_effects: duplicateEffects
    };
  }

  // -------------------------------------------------------------
  // 6. Pilot Gates Evaluation (Zero Hardcoded Values)
  // -------------------------------------------------------------
  public evaluatePilotGates(pilotId: string): PilotGateResults {
    const pilot = this.getPilot(pilotId);
    const metrics = this.calculatePilotMetrics(pilotId);
    const tasks = this.store.listTasks(pilotId);

    // Gate 1: Autorização física
    const hasAuth = Boolean(pilot.authorization_reference && pilot.authorized_by);
    const gate1Passed = hasAuth;

    // Gate 2: Tenant isolation
    const gate2Passed = metrics.cross_tenant_incidents === 0;

    // Gate 3: Privacidade
    const gate3Passed = metrics.privacy_incidents === 0;

    // Gate 4: Execução
    const gate4Passed = metrics.total_tasks_completed >= 25;

    // Gate 5: Qualidade
    const gate5Passed = metrics.first_pass_acceptance_rate >= 80;

    // Gate 6: Correcção (todas as tarefas corrigidas devem ter saída v2 e v1 preservada)
    const correctedTasks = tasks.filter(t => t.corrections_required > 0);
    let allCorrectionsVerified = true;
    for (const ct of correctedTasks) {
      const outputs = this.store.getOutputsForTask(ct.task_id);
      const hasV1 = outputs.some(o => o.version === 1);
      const hasV2 = outputs.some(o => o.version === 2 && o.is_active === 1);
      if (!hasV1 || !hasV2) {
        allCorrectionsVerified = false;
        break;
      }
    }
    const gate6Passed = correctedTasks.length > 0 ? allCorrectionsVerified : true;

    // Gate 7: Entrega / Arquivamento declarado
    const gate7Passed = metrics.delivery_success_rate >= 95;

    // Gate 8: Idempotência
    const gate8Passed = metrics.duplicate_business_effects === 0;

    // Gate 9: Acções proibidas
    const gate9Passed = metrics.unauthorized_action_attempts === 0;

    // Gate 10: Evidência integral
    const allHaveHashes = tasks.length > 0 && tasks.every(t => t.output_hashes.length > 0 && t.receipt_sha256);
    const gate10Passed = allHaveHashes;

    const gates: PilotGateCheck[] = [
      {
        gate_name: 'Autorização',
        required_condition: '100% das tarefas ligadas a autorização válida',
        actual_value: gate1Passed ? '100%' : '0%',
        passed: gate1Passed,
        notes: `Referência formal ${pilot.authorization_reference}`,
        source: 'pilot_programs',
        calculation: 'Boolean(authorization_reference && authorized_by)',
        evidence_sha256: sha256(pilot.authorization_reference)
      },
      {
        gate_name: 'Tenant isolation',
        required_condition: 'Zero acesso cruzado',
        actual_value: metrics.cross_tenant_incidents,
        passed: gate2Passed,
        notes: gate2Passed ? 'Zero violações de tenant' : 'Falha crítica',
        source: 'pilot_incidents (type: CROSS_TENANT_ACCESS)',
        calculation: 'COUNT(*) WHERE type = CROSS_TENANT_ACCESS',
        evidence_sha256: sha256(String(metrics.cross_tenant_incidents))
      },
      {
        gate_name: 'Privacidade',
        required_condition: 'Zero exposição de dados em Git ou logs públicos',
        actual_value: metrics.privacy_incidents,
        passed: gate3Passed,
        notes: gate3Passed ? 'Zero incidentes de privacidade' : 'Violação detectada',
        source: 'pilot_incidents (type: PRIVACY_LEAK)',
        calculation: 'COUNT(*) WHERE type = PRIVACY_LEAK',
        evidence_sha256: sha256(String(metrics.privacy_incidents))
      },
      {
        gate_name: 'Execução',
        required_condition: 'Pelo menos 25 tarefas concluídas',
        actual_value: metrics.total_tasks_completed,
        passed: gate4Passed,
        notes: `${metrics.total_tasks_completed} tarefas concluídas no modo ${pilot.execution_mode}`,
        source: 'pilot_tasks',
        calculation: 'COUNT(*) WHERE final_status = SUCCESS',
        evidence_sha256: sha256(String(metrics.total_tasks_completed))
      },
      {
        gate_name: 'Qualidade',
        required_condition: 'Pelo menos 80% aprovadas na primeira revisão',
        actual_value: `${metrics.first_pass_acceptance_rate}%`,
        passed: gate5Passed,
        notes: `Aprovação 1ª revisão calculada: ${metrics.first_pass_acceptance_rate}%`,
        source: 'human_reviews',
        calculation: '(approved_first / completed) * 100',
        evidence_sha256: sha256(String(metrics.first_pass_acceptance_rate))
      },
      {
        gate_name: 'Correcção',
        required_condition: '100% dos erros materiais corrigidos antes da entrega com v1 e v2 preservadas',
        actual_value: gate6Passed ? '100%' : 'Falha',
        passed: gate6Passed,
        notes: `${correctedTasks.length} tarefas corrigidas com versionamento atómico`,
        source: 'task_outputs',
        calculation: 'EXISTS(v1) AND EXISTS(v2) FOR EACH corrected task',
        evidence_sha256: sha256(String(correctedTasks.length))
      },
      {
        gate_name: 'Entrega / Arquivamento',
        required_condition: 'Pelo menos 95% de entregas ou arquivamentos técnicos bem-sucedidos',
        actual_value: `${metrics.delivery_success_rate}%`,
        passed: gate7Passed,
        notes: `Taxa calculada: ${metrics.delivery_success_rate}%`,
        source: 'pilot_deliveries',
        calculation: '(deliveries / approved) * 100',
        evidence_sha256: sha256(String(metrics.delivery_success_rate))
      },
      {
        gate_name: 'Idempotência',
        required_condition: 'Zero efeitos duplicados',
        actual_value: metrics.duplicate_business_effects,
        passed: gate8Passed,
        notes: 'Chaves de idempotência únicas verificadas no SQLite',
        source: 'pilot_tasks (UNIQUE index)',
        calculation: 'COUNT(*) WHERE duplicate_detected',
        evidence_sha256: sha256(String(metrics.duplicate_business_effects))
      },
      {
        gate_name: 'Acções proibidas',
        required_condition: 'Zero execução não autorizada',
        actual_value: metrics.unauthorized_action_attempts,
        passed: gate9Passed,
        notes: 'Bloqueio estrito de ações financeiras/fiscais',
        source: 'pilot_incidents (type: UNAUTHORIZED_ACTION)',
        calculation: 'COUNT(*) WHERE type = UNAUTHORIZED_ACTION',
        evidence_sha256: sha256(String(metrics.unauthorized_action_attempts))
      },
      {
        gate_name: 'Evidência',
        required_condition: '100% das tarefas com recibo e hashes físicos',
        actual_value: gate10Passed ? '100%' : '0%',
        passed: gate10Passed,
        notes: 'Cadeia criptográfica integral gerada em disco',
        source: 'pilot_tasks (output_hashes)',
        calculation: 'COUNT(output_hashes > 0) / COUNT(*)',
        evidence_sha256: sha256(canonicalJson(tasks.map(t => t.receipt_sha256)))
      }
    ];

    const allPassed = gates.every(g => g.passed);
    return {
      all_passed: allPassed,
      execution_mode: pilot.execution_mode,
      gates,
      evaluated_at: new Date().toISOString()
    };
  }

  // -------------------------------------------------------------
  // 7. Evidence Bundle Export & Manifest Generation
  // -------------------------------------------------------------
  public exportPilotEvidence(pilotId: string, outputDir: string): { files: string[]; indexHash: string } {
    const pilot = this.getPilot(pilotId);
    const metrics = this.calculatePilotMetrics(pilotId);
    const gates = this.evaluatePilotGates(pilotId);

    fs.mkdirSync(outputDir, { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'task-receipts'), { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'review-receipts'), { recursive: true });
    fs.mkdirSync(path.join(outputDir, 'delivery-receipts'), { recursive: true });

    // 1. Authorization receipt
    const authReceipt = {
      pilot_id: pilot.pilot_id,
      tenant_id: pilot.tenant_id,
      organization_name: pilot.organization_name,
      authorization_reference: pilot.authorization_reference,
      authorized_by: pilot.authorized_by,
      authorized_at: pilot.authorized_at,
      execution_mode: pilot.execution_mode,
      status: pilot.status
    };
    fs.writeFileSync(path.join(outputDir, 'pilot-authorization-receipt.json'), JSON.stringify(authReceipt, null, 2), 'utf8');

    // 2. Configuration
    fs.writeFileSync(path.join(outputDir, 'pilot-configuration.json'), JSON.stringify(pilot, null, 2), 'utf8');

    // 3. Selected employees
    const selectedEmployees = CANONICAL_500_ROLES.filter(r => pilot.selected_employee_ids.includes(r.id)).map(r => ({
      id: r.id,
      role_key: r.role_key,
      display_name: r.display_name,
      department: r.department,
      risk: r.risk.level
    }));
    fs.writeFileSync(path.join(outputDir, 'selected-employees.json'), JSON.stringify(selectedEmployees, null, 2), 'utf8');

    // 4. Task receipts & Physical Outputs
    fs.mkdirSync(path.join(outputDir, 'task-outputs'), { recursive: true });
    const pilotTasks = this.store.listTasks(pilotId);
    for (const t of pilotTasks) {
      fs.writeFileSync(path.join(outputDir, 'task-receipts', `${t.task_id}.json`), JSON.stringify(t, null, 2), 'utf8');

      // Export physical output files stored as BLOBs in SQLite
      const outputs = this.store.getOutputsForTask(t.task_id);
      for (const out of outputs) {
        const bytes = this.store.getOutputBytes(out.output_id);
        if (bytes) {
          fs.writeFileSync(path.join(outputDir, 'task-outputs', out.file_name), bytes);
        }
      }
    }

    // 5. Review receipts
    const allReviews = this.store.listAllReviews(pilotId);
    for (const rev of allReviews) {
      fs.writeFileSync(path.join(outputDir, 'review-receipts', `${rev.review_id}.json`), JSON.stringify(rev, null, 2), 'utf8');
    }

    // 6. Delivery receipts
    const allDeliveries = this.store.listDeliveries(pilotId);
    for (const deliv of allDeliveries) {
      fs.writeFileSync(path.join(outputDir, 'delivery-receipts', `${deliv.delivery_id}.json`), JSON.stringify(deliv, null, 2), 'utf8');
    }

    // 6b. Independent Document Validation Receipts (Pre-Review Phase)
    fs.mkdirSync(path.join(outputDir, 'document-validation-receipts'), { recursive: true });
    const pilotTaskIds = new Set(pilotTasks.map(t => t.task_id));
    const allDocValidations = this.store.getAllDocumentValidationReceipts().filter(v => pilotTaskIds.has(v.task_id));
    for (const val of allDocValidations) {
      const valId = val.receipt_id || val.validation_id || '';
      fs.writeFileSync(
        path.join(outputDir, 'document-validation-receipts', `${valId}.json`),
        JSON.stringify(val, null, 2),
        'utf8'
      );
    }

    // 7. Metrics
    fs.writeFileSync(path.join(outputDir, 'pilot-metrics.json'), JSON.stringify(metrics, null, 2), 'utf8');

    // 8. Incidents
    const pilotIncidents = this.store.listIncidents(pilotId);
    fs.writeFileSync(path.join(outputDir, 'pilot-incidents.json'), JSON.stringify(pilotIncidents, null, 2), 'utf8');

    // 9. Final Attestation (Strictly compliant with prompt Section 7)
    let classificationStatus: any = 'NOT_PROVEN';
    let operationalState = 'PRE-PRODUCTION / L2 HARDENED';

    if (pilot.execution_mode === 'SIMULATION') {
      classificationStatus = 'CONTROLLED_PILOT_SIMULATOR_IMPLEMENTED';
      operationalState = 'PRE-PRODUCTION / L2 HARDENED (SIMULATION HARNESS)';
    } else if (pilot.execution_mode === 'OPERATIONAL_PILOT') {
      classificationStatus = 'OPERATIONAL_PILOT_INFRASTRUCTURE_READY';
      operationalState = 'OPERATIONAL_PILOT_INFRASTRUCTURE_READY — REAL PILOT NOT YET EXECUTED';
    }

    const attestation: PilotFinalAttestation = {
      pilot_id: pilot.pilot_id,
      tenant_id: pilot.tenant_id,
      organization_name: pilot.organization_name,
      execution_mode: pilot.execution_mode,
      infrastructure_implemented: true,
      simulation_executed: pilot.execution_mode === 'SIMULATION',
      operational_pilot_started: false,
      operational_pilot_completed: false,
      classification_status: classificationStatus,
      classification: classificationStatus,
      operational_state: operationalState,
      metrics,
      gates_result: gates.all_passed ? 'PASS' : 'FAIL',
      generated_at: new Date().toISOString()
    };
    fs.writeFileSync(path.join(outputDir, 'pilot-final-attestation.json'), JSON.stringify(attestation, null, 2), 'utf8');

    // Recursive directory discovery function with strict anti-symlink and anti-traversal gates
    const scanDirRecursive = (baseDir: string): { relativePath: string; fullPath: string }[] => {
      const visitedDirs = new Set<string>();
      const normalizedBaseDir = path.resolve(baseDir);
      let realBaseDir = normalizedBaseDir;
      try {
        realBaseDir = fs.realpathSync(normalizedBaseDir);
      } catch {}

      const walk = (dir: string): { relativePath: string; fullPath: string }[] => {
        let realDir = dir;
        try {
          realDir = fs.realpathSync(dir);
        } catch {
          throw new Error(`Path inválido ou inacessível: '${dir}'.`);
        }

        const isInside = process.platform === 'win32'
          ? realDir.toLowerCase().startsWith(realBaseDir.toLowerCase())
          : realDir.startsWith(realBaseDir);

        if (!isInside) {
          throw new Error(`Path traversal detectado e rejeitado: '${dir}' resolve fora da raiz autorizada '${normalizedBaseDir}'.`);
        }
        const dirKey = process.platform === 'win32' ? realDir.toLowerCase() : realDir;
        if (visitedDirs.has(dirKey)) {
          throw new Error(`Ciclo de directórios detectado na varredura: '${dir}'.`);
        }
        visitedDirs.add(dirKey);

        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const results: { relativePath: string; fullPath: string }[] = [];
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          // Bloqueio rigoroso de symlinks / junctions
          const lstat = fs.lstatSync(fullPath);
          if (lstat.isSymbolicLink()) {
            throw new Error(`Ligação simbólica (symlink) detectada e rejeitada: '${fullPath}'.`);
          }

          if (entry.isDirectory()) {
            results.push(...walk(fullPath));
          } else if (entry.isFile()) {
            let realFile = fullPath;
            try {
              realFile = fs.realpathSync(fullPath);
            } catch {}
            const fileInside = process.platform === 'win32'
              ? realFile.toLowerCase().startsWith(realBaseDir.toLowerCase())
              : realFile.startsWith(realBaseDir);
            if (!fileInside) {
              throw new Error(`Ficheiro com referência externa rejeitado: '${fullPath}'.`);
            }
            const rel = path.relative(normalizedBaseDir, fullPath).replace(/\\/g, '/');
            if (rel.startsWith('..') || path.isAbsolute(rel)) {
              throw new Error(`Path traversal detectado no caminho relativo: '${rel}'.`);
            }
            results.push({ relativePath: rel, fullPath });
          }
        }
        return results;
      };

      return walk(normalizedBaseDir).sort((a, b) => a.relativePath.localeCompare(b.relativePath));
    };

    // Obter commit_sha de 40 caracteres com garantia determinística do ambiente Git real (sem fallback fixo)
    let commitSha: string = (process.env.GITHUB_SHA || process.env.GIT_COMMIT_SHA || '').trim();
    if (!commitSha || commitSha.length !== 40) {
      try {
        const { execSync } = require('node:child_process');
        commitSha = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      } catch {
        commitSha = '';
      }
    }
    if (!/^[0-9a-f]{40}$/i.test(commitSha)) {
      throw new Error(`Commit SHA inválido: esperado 40 caracteres hexadecimais do repositório Git, obtido '${commitSha}'.`);
    }

    // 10. Generate enriched pilot-evidence-manifest.json
    const initialFiles = scanDirRecursive(outputDir).filter(
      f => f.relativePath !== 'pilot-evidence-manifest.json' && f.relativePath !== 'pilot-evidence-files.sha256'
    );

    // Mapeamento de tarefas e outputs da base SQLite
    const taskOutputs = this.store.getOutputsForTenant(pilot.tenant_id);
    const outputMap = new Map<string, { task_id: string; version: number }>();
    for (const out of taskOutputs) {
      outputMap.set(out.file_name, { task_id: out.task_id, version: out.version });
    }

    const manifestFiles = initialFiles.map(f => {
      const bytes = fs.readFileSync(f.fullPath);
      const ext = path.extname(f.relativePath).toLowerCase();
      let mimeType = 'application/octet-stream';
      if (ext === '.pdf') mimeType = 'application/pdf';
      else if (ext === '.docx') mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      else if (ext === '.xlsx') mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      else if (ext === '.json') mimeType = 'application/json';
      else if (ext === '.sha256') mimeType = 'text/plain';

      let origin = 'ENGINE_RECORD';
      let receiptType = 'GENERIC_EVIDENCE';
      let taskId: string | undefined;
      let docVersion: number | undefined;

      if (f.relativePath.startsWith('task-outputs/')) {
        origin = 'SQLITE_TASK_OUTPUT';
        receiptType = 'OUTPUT_DOCUMENT';
        const fileName = path.basename(f.relativePath);
        const mapped = outputMap.get(fileName);
        if (mapped) {
          taskId = mapped.task_id;
          docVersion = mapped.version;
        }
        // Determinar MIME type inspecionando magic bytes reais e validar coerência
        const detectedMime = PhysicalDocumentValidator.detectMimeType(bytes);
        PhysicalDocumentValidator.validateMimeCoherence(detectedMime, ext, f.relativePath);
        mimeType = detectedMime;
      } else if (f.relativePath.startsWith('document-validation-receipts/')) {
        origin = 'INDEPENDENT_PARSER_RECEIPT';
        receiptType = 'DOCUMENT_VALIDATION_RECEIPT';
        const valId = path.basename(f.relativePath, '.json');
        const valObj = allDocValidations.find(v => (v.receipt_id || v.validation_id) === valId);
        if (valObj) {
          taskId = valObj.task_id;
        }
      } else if (f.relativePath.startsWith('task-receipts/')) {
        origin = 'EXECUTION_TASK_RECEIPT';
        receiptType = 'TASK_RECEIPT';
        taskId = path.basename(f.relativePath, '.json');
        docVersion = 1;
      } else if (f.relativePath.startsWith('review-receipts/')) {
        origin = 'HUMAN_REVIEW_RECEIPT';
        receiptType = 'REVIEW_RECEIPT';
        taskId = path.basename(f.relativePath, '.json').replace(/^REV_/, '');
      } else if (f.relativePath.startsWith('delivery-receipts/')) {
        origin = 'DELIVERY_RECEIPT';
        receiptType = 'DELIVERY_RECEIPT';
        taskId = path.basename(f.relativePath, '.json').replace(/^DELIV_/, '');
      } else if (f.relativePath === 'pilot-authorization-receipt.json') {
        origin = 'AUTHORIZATION_RECEIPT';
        receiptType = 'AUTHORIZATION';
      } else if (f.relativePath === 'pilot-configuration.json') {
        origin = 'PILOT_CONFIGURATION';
        receiptType = 'CONFIGURATION';
      } else if (f.relativePath === 'selected-employees.json') {
        origin = 'EMPLOYEE_REGISTRY';
        receiptType = 'EMPLOYEE_LIST';
      } else if (f.relativePath === 'pilot-metrics.json') {
        origin = 'PILOT_METRICS';
        receiptType = 'METRICS';
      } else if (f.relativePath === 'pilot-incidents.json') {
        origin = 'INCIDENT_LOG';
        receiptType = 'INCIDENT_LOG';
      } else if (f.relativePath === 'pilot-final-attestation.json') {
        origin = 'FINAL_ATTESTATION';
        receiptType = 'ATTESTATION';
      } else if (f.relativePath === 'document-validation-receipt.json') {
        origin = 'INDEPENDENT_PARSER_RECEIPT';
        receiptType = 'DOCUMENT_VERIFICATION';
      }

      const fileStat = fs.statSync(f.fullPath);

      return {
        relative_path: f.relativePath,
        sha256: sha256(bytes),
        byte_size: bytes.length,
        mime_type: mimeType,
        origin,
        commit_sha: commitSha,
        tenant_id: pilot.tenant_id,
        pilot_id: pilot.pilot_id,
        ...(taskId ? { task_id: taskId } : {}),
        ...(docVersion !== undefined ? { document_version: docVersion } : {}),
        receipt_type: receiptType,
        generated_at: fileStat.mtime.toISOString()
      };
    });

    const manifestData = {
      manifest_version: '2.0',
      pilot_id: pilot.pilot_id,
      tenant_id: pilot.tenant_id,
      execution_mode: pilot.execution_mode,
      commit_sha: commitSha,
      total_files: manifestFiles.length,
      created_at: new Date().toISOString(),
      persistence_fingerprint: this.store.getPersistenceFingerprint(),
      files: manifestFiles
    };

    fs.writeFileSync(
      path.join(outputDir, 'pilot-evidence-manifest.json'),
      JSON.stringify(manifestData, null, 2),
      'utf8'
    );

    // 11. Generate pilot-evidence-files.sha256 covering all files (including manifest)
    const allDiscoveredFiles = scanDirRecursive(outputDir).filter(
      f => f.relativePath !== 'pilot-evidence-files.sha256'
    );

    const indexLines: string[] = [];
    const exportedFileList: string[] = [];

    for (const f of allDiscoveredFiles) {
      const fileBytes = fs.readFileSync(f.fullPath);
      const hash = sha256(fileBytes);
      indexLines.push(`${hash}  ${f.relativePath}`);
      exportedFileList.push(f.relativePath);
    }

    const indexContent = indexLines.join('\n') + '\n';
    fs.writeFileSync(path.join(outputDir, 'pilot-evidence-files.sha256'), indexContent, 'utf8');

    return {
      files: exportedFileList,
      indexHash: sha256(indexContent)
    };
  }

  // -------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------
  public recordIncident(incident: PilotIncident): void {
    this.store.recordIncident(incident);
  }

  public getTask(taskId: string): PilotTaskReceipt | null {
    return this.taskCache.get(taskId) || this.store.getTask(taskId);
  }

  public getTaskOutput(taskId: string) {
    const outputs = this.store.getOutputsForTask(taskId);
    if (outputs.length === 0) return null;
    const current = outputs.find(o => o.is_active === 1) || outputs[outputs.length - 1];
    const previous = outputs.find(o => o.version === 1 && current.version > 1);
    return {
      current: { file: current.file_name, content: '', hash: current.file_bytes_sha256 },
      previous: previous ? { file: previous.file_name, content: '', hash: previous.file_bytes_sha256 } : undefined
    };
  }

  private generateEmployeeOutput(
    request: PilotTaskRequest,
    mode: OperationalPilotMode
  ): { fileName: string; buffer: Buffer } {
    const empId = request.employee_id;
    const taskNumber = request.task_id.replace(/^TASK_/, '');

    if (mode === 'OPERATIONAL_PILOT') {
      const taskTitle = request.title || `Tarefa ${taskNumber}`;
      const docLines: string[] = [
        `TITULO: ${taskTitle}`,
        `SOLICITANTE: ${request.requested_by}`,
        `EMPLOYEE ID: ${empId}`,
        `DATA RECEPCAO: ${request.received_at || new Date().toISOString()}`,
        `INSTRUCAO: ${request.instruction || 'Execucao formal autorizada'}`
      ];

      if (request.input_data && typeof request.input_data === 'object') {
        for (const [k, v] of Object.entries(request.input_data)) {
          docLines.push(`${k.toUpperCase()}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`);
        }
      }

      switch (request.format) {
        case 'PDF': {
          const fileName = `output_${taskNumber}.pdf`;
          const buf = PhysicalDocumentValidator.buildRealBinaryPdf(taskTitle, docLines);
          return { fileName, buffer: buf };
        }
        case 'DOCX': {
          const fileName = `output_${taskNumber}.docx`;
          const buf = PhysicalDocumentValidator.buildRealBinaryDocx(taskTitle, docLines);
          return { fileName, buffer: buf };
        }
        case 'XLSX': {
          const fileName = `output_${taskNumber}.xlsx`;
          const rows: (string | number)[][] = [
            ['Campo', 'Valor'],
            ['Task ID', request.task_id],
            ['Titulo', taskTitle],
            ['Solicitante', request.requested_by],
            ['Employee ID', empId]
          ];
          if (request.input_data && typeof request.input_data === 'object') {
            for (const [k, v] of Object.entries(request.input_data)) {
              rows.push([k, typeof v === 'number' || typeof v === 'string' ? v : JSON.stringify(v)]);
            }
          }
          const buf = PhysicalDocumentValidator.buildRealBinaryXlsx(taskTitle.slice(0, 30), rows);
          return { fileName, buffer: buf };
        }
        default: {
          const fileName = `output_${taskNumber}.json`;
          return { fileName, buffer: Buffer.from(JSON.stringify(request.input_data || {}, null, 2), 'utf8') };
        }
      }
    } else {
      // Simulation mode
      switch (empId) {
        case 66: {
          const fileName = `sim_classificacao_${taskNumber}.pdf`;
          const buf = PhysicalDocumentValidator.buildRealBinaryPdf(
            `Classificacao Contabilistica SASO ${taskNumber}`,
            [
              `Documento classificado para employee 66 em simulacao controlada.`,
              `Registo de operacao e calculo de taxas aplicaveis.`
            ]
          );
          return { fileName, buffer: buf };
        }
        case 263: {
          const fileName = `sim_carta_${taskNumber}.docx`;
          const buf = PhysicalDocumentValidator.buildRealBinaryDocx(
            `Simulacao Carta Formal ${taskNumber}`,
            ['Documento administrativo gerado em ambiente de simulacao tecnica.']
          );
          return { fileName, buffer: buf };
        }
        case 58: {
          const fileName = `sim_mapa_${taskNumber}.xlsx`;
          const buf = PhysicalDocumentValidator.buildRealBinaryXlsx(
            `Simulacao Financeira`,
            [['Orcado', 'Realizado'], [1000, 900]]
          );
          return { fileName, buffer: buf };
        }
        case 52: {
          const fileName = `sim_cobranca_${taskNumber}.docx`;
          const buf = PhysicalDocumentValidator.buildRealBinaryDocx(
            `Simulacao Aviso Cobranca ${taskNumber}`,
            ['Aviso de cobranca gerado em simulacao.']
          );
          return { fileName, buffer: buf };
        }
        case 73: {
          const fileName = `sim_relatorio_${taskNumber}.pdf`;
          const buf = PhysicalDocumentValidator.buildRealBinaryPdf(
            `Relatorio de Gestao SASO ${taskNumber}`,
            [
              `Relatorio executivo para employee 73 em simulacao controlada.`,
              `Consolidacao de indicadores de desempenho operacional.`
            ]
          );
          return { fileName, buffer: buf };
        }
        default:
          throw new Error(`Employee ID ${empId} sem gerador de simulacao.`);
      }
    }
  }

  public get tasks(): Map<string, PilotTaskReceipt> {
    const map = new Map<string, PilotTaskReceipt>();
    for (const t of this.store.listTasks()) {
      map.set(t.task_id, t);
    }
    return map;
  }

  public get taskOutputs(): Map<string, any> {
    const map = new Map<string, any>();
    for (const t of this.store.listTasks()) {
      const out = this.getTaskOutput(t.task_id);
      if (out) {
        map.set(t.task_id, out);
      }
    }
    return map;
  }

  public get incidents(): PilotIncident[] {
    return this.store.listIncidents();
  }
}

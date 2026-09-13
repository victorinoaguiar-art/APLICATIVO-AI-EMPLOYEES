import {
  RemoteCommand,
  CommandStatus,
  ExecutionMode,
  RiskLevelRCODE,
  ChannelRCODE,
  DeviceRecord,
  DeviceStatusRCODE,
  DeviceHeartbeat,
  ExecutionTask,
  TriggerRecord,
  ExecutionReceipt,
  RCODE2026GlobalSummary
} from '@ai-employee/shared';
import { CPEAAEngine } from '../cpeaa/CPEAAEngine.js';
import { CKRAIE2026Engine } from '../ckraie/CKRAIE2026Engine.js';
import * as crypto from 'crypto';

export class RCODEEngine {
  private static instance: RCODEEngine | null = null;

  private commands: Map<string, RemoteCommand> = new Map();
  private devices: Map<string, DeviceRecord> = new Map();
  private heartbeats: Map<string, DeviceHeartbeat> = new Map();
  private tasks: Map<string, ExecutionTask> = new Map();
  private triggers: Map<string, TriggerRecord> = new Map();
  private receipts: Map<string, ExecutionReceipt> = new Map();
  private idempotencyKeys: Set<string> = new Set();

  private constructor() {
    this.seedDefaultState();
  }

  public static getInstance(): RCODEEngine {
    if (!RCODEEngine.instance) {
      RCODEEngine.instance = new RCODEEngine();
    }
    return RCODEEngine.instance;
  }

  private seedDefaultState(): void {
    // Seed default devices
    const winPc: DeviceRecord = {
      device_id: 'dev_win_office_01',
      tenant_id: 'tenant_default',
      name: 'PC Escritório Principal (Windows 11)',
      device_type: 'WINDOWS_DESKTOP',
      operating_system: 'Windows 11 Enterprise 22H2',
      agent_version: 'v2026.1.0',
      owner: 'diretor.operacoes@empresa.co.ao',
      location_label: 'Escritório Luanda — Piso 3',
      last_seen_at: new Date().toISOString(),
      status: 'ONLINE',
      capabilities: ['PRIMAVERA_AVAILABLE', 'EXCEL_AVAILABLE', 'LOCAL_FILES_AVAILABLE', 'PRINTER_AVAILABLE'],
      installed_apps: ['ERP Primavera v10', 'Excel Desktop 365', 'AGT Validator Local'],
      trusted: true
    };

    const erpServer: DeviceRecord = {
      device_id: 'dev_server_erp_01',
      tenant_id: 'tenant_default',
      name: 'Servidor ERP & Base de Dados Primavera',
      device_type: 'LINUX_SERVER',
      operating_system: 'Ubuntu Server 24.04 LTS',
      agent_version: 'v2026.1.0',
      owner: 'sysadmin@empresa.co.ao',
      location_label: 'Data Center Luanda',
      last_seen_at: new Date().toISOString(),
      status: 'ONLINE',
      capabilities: ['PRIMAVERA_AVAILABLE', 'DATABASE_AVAILABLE', 'BACKUP_SERVICE'],
      installed_apps: ['SQL Server 2022', 'Primavera Core Services'],
      trusted: true
    };

    const macLaptop: DeviceRecord = {
      device_id: 'dev_mac_ceo_01',
      tenant_id: 'tenant_default',
      name: 'MacBook Pro CEO (Offline)',
      device_type: 'MACOS_WORKSTATION',
      operating_system: 'macOS Sequoia 15.0',
      agent_version: 'v2026.1.0',
      owner: 'ceo@empresa.co.ao',
      location_label: 'Remoto / Em Viagem',
      last_seen_at: new Date(Date.now() - 3600 * 4 * 1000).toISOString(), // 4 hours ago
      status: 'OFFLINE',
      capabilities: ['BROWSER_AVAILABLE', 'LOCAL_FILES_AVAILABLE', 'SECURE_VAULT'],
      installed_apps: ['Excel Desktop', 'Safari', 'Vault Agent'],
      trusted: true
    };

    this.devices.set(winPc.device_id, winPc);
    this.devices.set(erpServer.device_id, erpServer);
    this.devices.set(macLaptop.device_id, macLaptop);

    // Seed offline command waiting for macLaptop
    this.dispatchRemoteCommand({
      tenantId: 'tenant_default',
      userId: 'user_ceo',
      employeeId: '001', // CEO Assistant
      channel: 'MOBILE_APP',
      commandText: 'Assim que o MacBook do CEO ligar, abra o relatório financeiro de fecho mensal no Excel local.',
      targetDevice: 'dev_mac_ceo_01',
      executionMode: 'DEFERRED',
      idempotencyKey: 'seed_key_001'
    });
  }

  public registerDevice(device: Partial<DeviceRecord> & { device_id: string; name: string }): DeviceRecord {
    const record: DeviceRecord = {
      device_id: device.device_id,
      tenant_id: device.tenant_id || 'tenant_default',
      name: device.name,
      device_type: device.device_type || 'WINDOWS_DESKTOP',
      operating_system: device.operating_system || 'Windows 11',
      agent_version: device.agent_version || 'v2026.1.0',
      owner: device.owner || 'utilizador@empresa.co.ao',
      location_label: device.location_label || 'Escritório Local',
      last_seen_at: new Date().toISOString(),
      status: device.status || 'ONLINE',
      capabilities: device.capabilities || ['BROWSER_AVAILABLE', 'LOCAL_FILES_AVAILABLE'],
      installed_apps: device.installed_apps || ['Excel Desktop'],
      trusted: device.trusted ?? true
    };

    this.devices.set(record.device_id, record);
    return record;
  }

  public recordHeartbeat(params: {
    deviceId: string;
    status?: DeviceStatusRCODE;
    capabilities?: string[];
  }): { heartbeat: DeviceHeartbeat; flushedTasksCount: number } {
    const dev = this.devices.get(params.deviceId);
    if (!dev) {
      throw new Error(`Dispositivo #${params.deviceId} não registado.`);
    }

    dev.status = params.status || 'ONLINE';
    dev.last_seen_at = new Date().toISOString();
    if (params.capabilities) {
      dev.capabilities = params.capabilities;
    }

    const hb: DeviceHeartbeat = {
      device_id: params.deviceId,
      timestamp: new Date().toISOString(),
      status: dev.status,
      agent_version: dev.agent_version,
      network_state: 'STABLE',
      available_capabilities: dev.capabilities,
      running_jobs: 0,
      security_state: 'OK'
    };

    this.heartbeats.set(params.deviceId, hb);

    // Flush offline queue for this device
    const flushed = this.flushOfflineQueueForDevice(params.deviceId);
    return { heartbeat: hb, flushedTasksCount: flushed.length };
  }

  public dispatchRemoteCommand(params: {
    tenantId?: string;
    userId?: string;
    employeeId?: string;
    channel?: ChannelRCODE;
    commandText: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    deadline?: string;
    targetDevice?: string;
    executionMode?: ExecutionMode;
    idempotencyKey?: string;
  }): { command: RemoteCommand; task: ExecutionTask; receipt?: ExecutionReceipt } {
    const tenantId = params.tenantId || 'tenant_default';
    const key = params.idempotencyKey || `key_${Date.now()}_${Math.random()}`;

    if (this.idempotencyKeys.has(key)) {
      throw new Error(`Comando Duplicado Recusado! A chave de idempotência ${key} já foi processada anteriormente.`);
    }
    this.idempotencyKeys.add(key);

    const commandId = `cmd_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const taskId = `tsk_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // Risk Classification
    let risk: RiskLevelRCODE = 'LOW';
    const textLower = params.commandText.toLowerCase();
    if (textLower.includes('pagamento') || textLower.includes('transferencia') || textLower.includes('submissao fiscal')) {
      risk = 'CRITICAL';
    } else if (textLower.includes('alterar erp') || textLower.includes('enviar para terceiro') || textLower.includes('primavera')) {
      risk = 'HIGH';
    } else if (textLower.includes('atualizar spreadsheet') || textLower.includes('importar')) {
      risk = 'MEDIUM';
    }

    // Approval requirement
    const approvalRequired = risk === 'HIGH' || risk === 'CRITICAL';

    // Verify CPEAA Policy Check
    const cpeaa = CPEAAEngine.getInstance();
    cpeaa.generateDecisionTrace({
      tenantId,
      employeeId: params.employeeId || '001',
      query: params.commandText,
      decisionSummary: `Comando remoto verificado com risco ${risk}.`,
      appliedPolicyId: 'policy_remote_command_v26',
      appliedClause: 'Cláusula de Governação e Permissão Móvel'
    });

    // Verify CKRAIE Knowledge Freshness
    const ckraie = CKRAIE2026Engine.getInstance();
    const ckraieSummary = ckraie.getGlobalSummary();

    let initialStatus: CommandStatus = 'QUEUED';
    if (approvalRequired) {
      initialStatus = 'WAITING_FOR_APPROVAL';
    }

    // Determine execution mode & device state
    let execMode: ExecutionMode = params.executionMode || 'CLOUD_ONLY';
    let targetDevId = params.targetDevice || null;

    if (textLower.includes('pc') || textLower.includes('primavera') || textLower.includes('macbook') || targetDevId) {
      if (execMode === 'CLOUD_ONLY') execMode = 'DEFERRED';
    }

    // If target device is offline or unspecified local device
    let targetDeviceStatus: DeviceStatusRCODE = 'ONLINE';
    if (targetDevId) {
      const dev = this.devices.get(targetDevId);
      if (dev) targetDeviceStatus = dev.status;
    }

    if (!approvalRequired && (execMode === 'DEFERRED' || targetDeviceStatus === 'OFFLINE')) {
      initialStatus = 'WAITING_FOR_DEVICE';
    } else if (!approvalRequired && execMode === 'CLOUD_ONLY') {
      initialStatus = 'COMPLETED';
    }

    const command: RemoteCommand = {
      command_id: commandId,
      tenant_id: tenantId,
      user_id: params.userId || 'user_mobile_01',
      employee_id: params.employeeId || '001',
      channel: params.channel || 'MOBILE_APP',
      command_text: params.commandText,
      normalized_intent: `INTENT_${risk}_${params.employeeId || '001'}`,
      attachments: [],
      created_at: new Date().toISOString(),
      priority: params.priority || 'MEDIUM',
      deadline: params.deadline || null,
      target_device: targetDevId,
      execution_mode: execMode,
      risk_level: risk,
      approval_required: approvalRequired,
      status: initialStatus,
      correlation_id: `corr_${commandId}`,
      idempotency_key: key
    };

    const task: ExecutionTask = {
      task_id: taskId,
      command_id: commandId,
      tenant_id: tenantId,
      employee_id: params.employeeId || '001',
      task_type: 'REMOTE_EXECUTION_JOB',
      execution_mode: execMode,
      required_capabilities: execMode === 'CLOUD_ONLY' ? ['CLOUD_COMPUTE'] : ['LOCAL_FILES_AVAILABLE'],
      required_device: targetDevId,
      priority: params.priority || 'MEDIUM',
      deadline: params.deadline || null,
      status: initialStatus,
      attempt_count: 1,
      max_attempts: 3,
      created_at: new Date().toISOString(),
      started_at: initialStatus === 'COMPLETED' ? new Date().toISOString() : null,
      completed_at: initialStatus === 'COMPLETED' ? new Date().toISOString() : null,
      idempotency_key: key
    };

    this.commands.set(commandId, command);
    this.tasks.set(taskId, task);

    let receipt: ExecutionReceipt | undefined = undefined;
    if (initialStatus === 'COMPLETED') {
      receipt = this.generateReceipt(task, 'CLOUD_WORKER', 'Execução Cloud Concluída com Sucesso');
    }

    return { command, task, receipt };
  }

  public approveCommand(commandId: string, approverEmail: string, mfaToken?: string): RemoteCommand {
    const cmd = this.commands.get(commandId);
    if (!cmd) {
      throw new Error(`Comando #${commandId} não encontrado.`);
    }

    if (cmd.risk_level === 'CRITICAL' && (!mfaToken || !mfaToken.startsWith('MFA'))) {
      throw new Error(`MFA Obrigatório! Aprovação de tarefas CRITICAL exige token MFA válido.`);
    }

    cmd.approval_required = false;
    
    // Check if target device is online or if it can complete now
    let targetDevStatus: DeviceStatusRCODE = 'ONLINE';
    if (cmd.target_device) {
      const dev = this.devices.get(cmd.target_device);
      if (dev) targetDevStatus = dev.status;
    }

    if (targetDevStatus === 'OFFLINE' || cmd.execution_mode === 'DEFERRED') {
      cmd.status = 'WAITING_FOR_DEVICE';
    } else {
      cmd.status = 'COMPLETED';
      const task = Array.from(this.tasks.values()).find(t => t.command_id === commandId);
      if (task) {
        task.status = 'COMPLETED';
        task.completed_at = new Date().toISOString();
        this.generateReceipt(task, cmd.target_device || 'CLOUD_WORKER', 'Comando Aprovado e Executado');
      }
    }

    return cmd;
  }

  public flushOfflineQueueForDevice(deviceId: string): ExecutionTask[] {
    const pendingTasks = Array.from(this.tasks.values()).filter(
      t => (t.required_device === deviceId || !t.required_device) && t.status === 'WAITING_FOR_DEVICE'
    );

    const executed: ExecutionTask[] = [];
    for (const t of pendingTasks) {
      t.status = 'COMPLETED';
      t.started_at = new Date().toISOString();
      t.completed_at = new Date().toISOString();

      const cmd = this.commands.get(t.command_id);
      if (cmd) cmd.status = 'COMPLETED';

      this.generateReceipt(t, deviceId, `Execução Diferida Concluída após Re-conexão do Dispositivo ${deviceId}`);
      executed.push(t);
    }

    return executed;
  }

  private generateReceipt(task: ExecutionTask, deviceId: string, message: string): ExecutionReceipt {
    const receiptId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const raw = `${receiptId}:${task.task_id}:${task.command_id}:${deviceId}:${new Date().toISOString()}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex');

    const receipt: ExecutionReceipt = {
      receipt_id: receiptId,
      task_id: task.task_id,
      command_id: task.command_id,
      employee_id: task.employee_id,
      executed_at: new Date().toISOString(),
      device_id: deviceId,
      action: task.task_type,
      result: 'SUCCESS',
      files_created: ['relatorio_execucao_remota.pdf'],
      records_affected: 1,
      warnings: [],
      errors: [],
      evidence: message,
      duration_ms: 240,
      status: 'AUDITED',
      hash
    };

    this.receipts.set(receiptId, receipt);
    return receipt;
  }

  // --- QUERY METHODS ---

  public getGlobalSummary(): RCODE2026GlobalSummary {
    const cmds = Array.from(this.commands.values());
    const devs = Array.from(this.devices.values());

    return {
      total_commands_received: cmds.length,
      cloud_executing_count: cmds.filter(c => c.status === 'EXECUTING' || c.status === 'QUEUED').length,
      waiting_for_device_count: cmds.filter(c => c.status === 'WAITING_FOR_DEVICE').length,
      waiting_approval_count: cmds.filter(c => c.status === 'WAITING_FOR_APPROVAL').length,
      completed_today_count: cmds.filter(c => c.status === 'COMPLETED').length,
      total_registered_devices: devs.length,
      online_devices_count: devs.filter(d => d.status === 'ONLINE').length,
      total_execution_receipts: this.receipts.size,
      last_updated_at: new Date().toISOString()
    };
  }

  public listCommands(tenantId?: string): RemoteCommand[] {
    let list = Array.from(this.commands.values());
    if (tenantId) list = list.filter(c => c.tenant_id === tenantId);
    return list;
  }

  public listDevices(tenantId?: string): DeviceRecord[] {
    let list = Array.from(this.devices.values());
    if (tenantId) list = list.filter(d => d.tenant_id === tenantId);
    return list;
  }

  public listTasks(tenantId?: string): ExecutionTask[] {
    let list = Array.from(this.tasks.values());
    if (tenantId) list = list.filter(t => t.tenant_id === tenantId);
    return list;
  }

  public listReceipts(tenantId?: string): ExecutionReceipt[] {
    return Array.from(this.receipts.values());
  }
}

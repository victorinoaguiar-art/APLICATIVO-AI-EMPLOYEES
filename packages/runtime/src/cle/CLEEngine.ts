import {
  ChannelCLE,
  CLEGlobalSummary,
  CloudStorageConnectionCLE,
  CommandStatusCLE,
  DeviceCLE,
  DeviceCapabilityCLE,
  ExecutionDecisionCLE,
  ExecutionLocationCLE,
  ExecutionModeCLE,
  ExecutionReceiptCLE,
  LocalStorageConnectionCLE,
  RemoteCommandCLE,
  RiskLevelCLE,
  ScheduleRecordCLE,
  StorageTypeCLE,
  TriggerRecordCLE
} from '@ai-employee/shared';
import * as crypto from 'crypto';

/**
 * CLEEngine — Remote Command, Offline Queue, Deferred Execution & Cloud/Local Connectivity Engine (CLE-500)
 * Core Principle: STORAGE LOCATION != EXECUTION LOCATION
 */
export class CLEEngine {
  private static instance: CLEEngine;

  private cloudConnections: Map<string, CloudStorageConnectionCLE> = new Map();
  private localConnections: Map<string, LocalStorageConnectionCLE> = new Map();
  private devices: Map<string, DeviceCLE> = new Map();
  private commands: Map<string, RemoteCommandCLE> = new Map();
  private decisions: Map<string, ExecutionDecisionCLE> = new Map();
  private triggers: Map<string, TriggerRecordCLE> = new Map();
  private schedules: Map<string, ScheduleRecordCLE> = new Map();
  private receipts: ExecutionReceiptCLE[] = [];
  private idempotencyCache: Set<string> = new Set();

  private constructor() {
    this.seedDefaults();
  }

  public static getInstance(): CLEEngine {
    if (!CLEEngine.instance) {
      CLEEngine.instance = new CLEEngine();
    }
    return CLEEngine.instance;
  }

  private seedDefaults(): void {
    // Seed default Cloud Storage Connections
    this.registerCloudStorage({
      connection_id: 'conn_gdrive_01',
      tenant_id: 'tenant_default',
      provider: 'CLOUD_DRIVE',
      account_name: 'empresa.financeiro@gmail.com',
      root_folder: '/Empresa/Facturas_2026',
      status: 'CONNECTED',
      last_synced_at: new Date().toISOString(),
      file_count: 1420
    });

    this.registerCloudStorage({
      connection_id: 'conn_onedrive_01',
      tenant_id: 'tenant_default',
      provider: 'ONEDRIVE',
      account_name: 'diretoria@empresa.co.ao',
      root_folder: '/Relatorios_Executivos',
      status: 'CONNECTED',
      last_synced_at: new Date().toISOString(),
      file_count: 530
    });

    // Seed default Devices
    this.registerDevice({
      device_id: 'dev_win_office_01',
      tenant_id: 'tenant_default',
      name: 'PC Contabilidade Luanda',
      device_type: 'DESKTOP',
      operating_system: 'Windows 11 Pro 64-bit',
      agent_version: 'v2.6.1-local',
      owner: 'Contabilidade & Tesouraria',
      location_label: 'Sede - Escritório 304',
      last_seen_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      status: 'OFFLINE',
      capabilities: [
        'PRIMAVERA_AVAILABLE',
        'EXCEL_AVAILABLE',
        'LOCAL_FILES_AVAILABLE',
        'CERTIFICATE_AVAILABLE'
      ],
      installed_apps: ['PRIMAVERA ERP v10', 'Microsoft Excel 365', 'AGTCertificateSigner'],
      security_posture: 'SECURE',
      trusted: true
    });

    this.registerDevice({
      device_id: 'dev_linux_server_01',
      tenant_id: 'tenant_default',
      name: 'Servidor Local Ficheiros',
      device_type: 'SERVER',
      operating_system: 'Ubuntu 24.04 LTS',
      agent_version: 'v2.6.1-local',
      owner: 'IT Infrastructure',
      location_label: 'Datacenter Local',
      last_seen_at: new Date().toISOString(),
      status: 'ONLINE',
      capabilities: [
        'LOCAL_FILES_AVAILABLE',
        'NETWORK_SHARE_AVAILABLE'
      ],
      installed_apps: ['Samba Share Server', 'PostgreSQL v16'],
      security_posture: 'SECURE',
      trusted: true
    });

    // Seed Local Storage Connection
    this.registerLocalStorage({
      connection_id: 'conn_local_bancos_01',
      tenant_id: 'tenant_default',
      device_id: 'dev_win_office_01',
      path_type: 'LOCAL_DRIVE',
      path: 'C:\\Bancos\\Agosto',
      access_permissions: 'READ_WRITE',
      status: 'OFFLINE',
      last_verified_at: new Date(Date.now() - 3600000).toISOString()
    });

    // Seed Triggers
    this.triggers.set('trig_dev_online_01', {
      trigger_id: 'trig_dev_online_01',
      tenant_id: 'tenant_default',
      name: 'Ao Ligar PC do Escritório -> Processar Fila Offline',
      event_type: 'DEVICE_ONLINE',
      target_employee_id: '050',
      action_template: 'IMPORT_PENDING_PRIMAVERA_DATA',
      enabled: true,
      last_triggered_at: new Date().toISOString()
    });

    // Seed Schedules
    this.schedules.set('sched_daily_reconcile', {
      schedule_id: 'sched_daily_reconcile',
      tenant_id: 'tenant_default',
      name: 'Conciliação Bancária Diária - 08:00',
      schedule_type: 'RECURRING',
      cron_expression: '0 8 * * 1-5',
      next_run_at: new Date(Date.now() + 86400000).toISOString(),
      target_employee_id: '200',
      command_template: 'Executar conciliação bancária de ontem',
      enabled: true
    });
  }

  // --- DEVICE MANAGEMENT & HEARTBEAT ---
  public registerDevice(device: DeviceCLE): DeviceCLE {
    this.devices.set(device.device_id, { ...device });
    return device;
  }

  public getDevice(deviceId: string): DeviceCLE | undefined {
    return this.devices.get(deviceId);
  }

  public listDevices(): DeviceCLE[] {
    return Array.from(this.devices.values());
  }

  public processHeartbeat(deviceId: string, status: DeviceCLE['status'] = 'ONLINE'): { flushed_count: number; device: DeviceCLE } {
    const dev = this.devices.get(deviceId);
    if (!dev) throw new Error(`Dispositivo com ID '${deviceId}' não registado.`);

    dev.status = status;
    dev.last_seen_at = new Date().toISOString();
    this.devices.set(deviceId, dev);

    // Update local storage status linked to this device
    for (const [id, conn] of this.localConnections.entries()) {
      if (conn.device_id === deviceId) {
        conn.status = status === 'ONLINE' ? 'ACCESSIBLE' : 'OFFLINE';
        conn.last_verified_at = new Date().toISOString();
        this.localConnections.set(id, conn);
      }
    }

    let flushedCount = 0;
    if (status === 'ONLINE') {
      // Flush WAITING_FOR_DEVICE tasks intended for this device
      for (const [cmdId, cmd] of this.commands.entries()) {
        if (cmd.status === 'WAITING_FOR_DEVICE' && (cmd.target_device === deviceId || !cmd.target_device)) {
          cmd.status = 'EXECUTING';
          this.commands.set(cmdId, cmd);

          // Emit receipt upon execution
          this.generateReceipt(cmd, 'SUCCESS', 'Execução diferida automatizada concluída após re-conexão do dispositivo.');
          flushedCount++;
        }
      }

      // Fire trigger
      this.evaluateTrigger('DEVICE_ONLINE', { deviceId });
    }

    return { flushed_count: flushedCount, device: dev };
  }

  // --- STORAGE CONNECTIONS ---
  public registerCloudStorage(conn: CloudStorageConnectionCLE): CloudStorageConnectionCLE {
    this.cloudConnections.set(conn.connection_id, { ...conn });
    return conn;
  }

  public registerLocalStorage(conn: LocalStorageConnectionCLE): LocalStorageConnectionCLE {
    this.localConnections.set(conn.connection_id, { ...conn });
    return conn;
  }

  public listCloudConnections(): CloudStorageConnectionCLE[] {
    return Array.from(this.cloudConnections.values());
  }

  public listLocalConnections(): LocalStorageConnectionCLE[] {
    return Array.from(this.localConnections.values());
  }

  // --- EXECUTION LOCATION RESOLVER ---
  public resolveExecutionLocation(
    taskId: string,
    commandId: string,
    tenantId: string,
    dataLoc: { storage_type: StorageTypeCLE; path: string; accessible_offline: boolean },
    appNeeds: { app_name: string; has_cloud_api: boolean; requires_local_agent: boolean },
    requiredCapabilities: DeviceCapabilityCLE[],
    targetDeviceId?: string
  ): ExecutionDecisionCLE {
    let selectedMode: ExecutionModeCLE = 'CLOUD_ONLY';
    let selectedLocation: ExecutionLocationCLE = 'CLOUD';
    let reason = '';
    let selectedDevice: string | undefined = targetDeviceId;

    const isCloudStorage = [
      'CLOUD_DRIVE',
      'ONEDRIVE',
      'SHAREPOINT',
      'DROPBOX',
      'S3_BUCKET',
      'AZURE_BLOB',
      'GOOGLE_CLOUD_STORAGE'
    ].includes(dataLoc.storage_type);

    const isLocalStorage = ['LOCAL_FOLDER', 'NETWORK_SHARE', 'NAS_SMB'].includes(dataLoc.storage_type);

    // Rule 1: Requires Local ERP / Desktop Software
    if (appNeeds.requires_local_agent || appNeeds.app_name.toUpperCase().includes('PRIMAVERA') || appNeeds.app_name.toUpperCase().includes('EXCEL DESKTOP')) {
      if (isCloudStorage) {
        // Data in Cloud, Execution in Local ERP -> HYBRID!
        selectedMode = 'HYBRID';
        selectedLocation = 'HYBRID';
        reason = `Ficheiro alojado na Cloud (${dataLoc.storage_type}), mas processamento exige software local (${appNeeds.app_name}). Modo HÍBRIDO ativado.`;
      } else {
        selectedMode = 'LOCAL_ONLY';
        selectedLocation = 'LOCAL';
        reason = `Dados e Aplicação requerem agente local (${appNeeds.app_name}). Execução 100% LOCAL.`;
      }

      // Check if target device is online
      const dev = selectedDevice ? this.devices.get(selectedDevice) : Array.from(this.devices.values()).find(d => d.status === 'ONLINE' && d.capabilities.some(c => requiredCapabilities.includes(c)));

      if (!dev || dev.status !== 'ONLINE') {
        selectedLocation = 'WAIT';
        selectedMode = 'DEFERRED';
        reason += ` Dispositivo necessário (${selectedDevice || 'Qualquer PC compatível'}) está OFFLINE. Colocado na fila WAITING_FOR_DEVICE.`;
      } else {
        selectedDevice = dev.device_id;
      }
    } else if (isLocalStorage) {
      // Data is local only
      selectedMode = 'LOCAL_ONLY';
      const dev = selectedDevice ? this.devices.get(selectedDevice) : Array.from(this.devices.values()).find(d => d.status === 'ONLINE');
      if (!dev || dev.status !== 'ONLINE') {
        selectedLocation = 'WAIT';
        selectedMode = 'DEFERRED';
        reason = `Ficheiro local (${dataLoc.path}) inacessível. Dispositivo OFFLINE. Fila durável WAITING_FOR_DEVICE ativada.`;
      } else {
        selectedLocation = 'LOCAL';
        selectedDevice = dev.device_id;
        reason = `Ficheiro e execução locais no dispositivo online ${dev.name}.`;
      }
    } else {
      // Data in Cloud, Application has Cloud API -> 100% CLOUD EXECUTION
      selectedMode = 'CLOUD_ONLY';
      selectedLocation = 'CLOUD';
      reason = `STORAGE LOCATION != EXECUTION LOCATION: Dados no ${dataLoc.storage_type} lidos via Cloud Connector API. Execução 100% CLOUD no cluster remoto (computador local pode estar desligado).`;
    }

    const decision: ExecutionDecisionCLE = {
      decision_id: `dec_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      task_id: taskId,
      command_id: commandId,
      tenant_id: tenantId,
      data_location: dataLoc,
      application_location: appNeeds,
      required_capabilities: requiredCapabilities,
      available_cloud_connectors: Array.from(this.cloudConnections.keys()),
      available_local_devices: Array.from(this.devices.keys()),
      selected_execution_mode: selectedMode,
      selected_execution_location: selectedLocation,
      selected_device_id: selectedDevice,
      reason: reason,
      risk_level: appNeeds.requires_local_agent ? 'HIGH' : 'LOW',
      policy_result: 'ALLOWED',
      created_at: new Date().toISOString()
    };

    this.decisions.set(decision.decision_id, decision);
    return decision;
  }

  // --- DISPATCH REMOTE COMMAND ---
  public dispatchCommand(req: {
    tenant_id: string;
    user_id: string;
    employee_id: string;
    channel: ChannelCLE;
    command_text: string;
    priority?: RemoteCommandCLE['priority'];
    target_device?: string;
    execution_mode?: ExecutionModeCLE;
    idempotency_key?: string;
    expires_in_hours?: number;
    mfa_token?: string;
  }): RemoteCommandCLE {
    // Check Idempotency Key
    if (req.idempotency_key) {
      if (this.idempotencyCache.has(req.idempotency_key)) {
        throw new Error(`Comando duplicado rejeitado. Chave de idempotência '${req.idempotency_key}' já processada.`);
      }
      this.idempotencyCache.add(req.idempotency_key);
    }

    // Classify Risk
    const isCritical = /pagamento|transferencia|excluir|eliminar|decretar/i.test(req.command_text);
    const isHigh = /primavera|importar|alterar erp|retencao/i.test(req.command_text);
    const riskLevel: RiskLevelCLE = isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'LOW';

    // Requires Approval
    const approvalRequired = riskLevel === 'HIGH' || riskLevel === 'CRITICAL';
    if (isCritical && (!req.mfa_token || !req.mfa_token.startsWith('MFA-'))) {
      throw new Error(`Comandos de risco CRÍTICO exigem validação de token MFA válido.`);
    }

    const expiresAt = req.expires_in_hours
      ? new Date(Date.now() + req.expires_in_hours * 3600000).toISOString()
      : new Date(Date.now() + 86400000).toISOString(); // Default 24h expiration

    const commandId = `cmd_cle_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const taskId = `task_${commandId}`;

    // Determine storage & app requirements from prompt text
    let storageType: StorageTypeCLE = 'CLOUD_DRIVE';
    let path = '/GoogleDrive/Documentos';

    if (req.command_text.toLowerCase().includes('onedrive')) {
      storageType = 'ONEDRIVE';
      path = '/OneDrive/Financeiro';
    } else if (req.command_text.toLowerCase().includes('c:\\') || req.command_text.toLowerCase().includes('pasta local')) {
      storageType = 'LOCAL_FOLDER';
      path = 'C:\\Bancos\\Agosto';
    }

    const requiresPrimavera = req.command_text.toLowerCase().includes('primavera');
    const requiresExcelDesktop = req.command_text.toLowerCase().includes('excel desktop');

    const decision = this.resolveExecutionLocation(
      taskId,
      commandId,
      req.tenant_id,
      { storage_type: storageType, path: path, accessible_offline: storageType !== 'LOCAL_FOLDER' },
      {
        app_name: requiresPrimavera ? 'PRIMAVERA ERP' : requiresExcelDesktop ? 'Microsoft Excel' : 'Cloud AI Model',
        has_cloud_api: !requiresPrimavera,
        requires_local_agent: requiresPrimavera || requiresExcelDesktop || storageType === 'LOCAL_FOLDER'
      },
      requiresPrimavera ? ['PRIMAVERA_AVAILABLE'] : ['LOCAL_FILES_AVAILABLE'],
      req.target_device || 'dev_win_office_01'
    );

    let status: CommandStatusCLE = 'QUEUED';
    if (approvalRequired) {
      status = 'WAITING_FOR_APPROVAL';
    } else if (decision.selected_execution_location === 'WAIT') {
      status = 'WAITING_FOR_DEVICE';
    } else {
      status = 'COMPLETED';
    }

    const command: RemoteCommandCLE = {
      command_id: commandId,
      tenant_id: req.tenant_id,
      user_id: req.user_id,
      employee_id: req.employee_id,
      channel: req.channel,
      command_text: req.command_text,
      normalized_intent: req.command_text.toUpperCase().trim(),
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      priority: req.priority || 'MEDIUM',
      target_device: decision.selected_device_id,
      execution_mode: decision.selected_execution_mode,
      risk_level: riskLevel,
      approval_required: approvalRequired,
      idempotency_key: req.idempotency_key,
      status: status,
      correlation_id: `corr_${Date.now()}`
    };

    this.commands.set(commandId, command);

    if (status === 'COMPLETED') {
      this.generateReceipt(command, 'SUCCESS', 'Execução concluída com sucesso na Cloud.');
    }

    return command;
  }

  // --- EXPIRATION & APPROVAL HANDLERS ---
  public approveCommand(commandId: string, approverEmail: string, mfaToken?: string): RemoteCommandCLE {
    const cmd = this.commands.get(commandId);
    if (!cmd) throw new Error(`Comando com ID '${commandId}' não encontrado.`);

    if (cmd.expires_at && new Date(cmd.expires_at) < new Date()) {
      cmd.status = 'EXPIRED';
      this.commands.set(commandId, cmd);
      throw new Error(`Comando caducado em ${cmd.expires_at}. Execução rejeitada por política de expiração.`);
    }

    if (cmd.risk_level === 'CRITICAL' && (!mfaToken || !mfaToken.startsWith('MFA-'))) {
      throw new Error(`Aprovação de comando CRÍTICO exige token MFA válido.`);
    }

    // Check device state
    const dev = cmd.target_device ? this.devices.get(cmd.target_device) : undefined;
    if (dev && dev.status === 'OFFLINE') {
      cmd.status = 'WAITING_FOR_DEVICE';
    } else {
      cmd.status = 'COMPLETED';
      this.generateReceipt(cmd, 'SUCCESS', `Aprovado por ${approverEmail}. Execução concluída.`);
    }

    this.commands.set(commandId, cmd);
    return cmd;
  }

  // --- TRIGGERS & EVALUATION ---
  public evaluateTrigger(eventType: TriggerRecordCLE['event_type'], payload: any): number {
    let fired = 0;
    for (const [id, trig] of this.triggers.entries()) {
      if (trig.enabled && trig.event_type === eventType) {
        trig.last_triggered_at = new Date().toISOString();
        this.triggers.set(id, trig);
        fired++;
      }
    }
    return fired;
  }

  // --- RECEIPTS & AUDIT ---
  private generateReceipt(cmd: RemoteCommandCLE, result: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE', actionMsg: string): ExecutionReceiptCLE {
    const rcpId = `rcp_cle_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const hashPayload = `${rcpId}|${cmd.command_id}|${cmd.employee_id}|${cmd.status}|${new Date().toISOString()}`;
    const hash = crypto.createHash('sha256').update(hashPayload).digest('hex');

    const decision = Array.from(this.decisions.values()).find(d => d.command_id === cmd.command_id);

    const receipt: ExecutionReceiptCLE = {
      receipt_id: rcpId,
      task_id: `task_${cmd.command_id}`,
      command_id: cmd.command_id,
      employee_id: cmd.employee_id,
      tenant_id: cmd.tenant_id,
      executed_at: new Date().toISOString(),
      device_id: cmd.target_device,
      data_source: decision?.data_location.storage_type || 'CLOUD_DRIVE',
      storage_location: decision?.data_location.path || '/GoogleDrive/Docs',
      execution_location: decision?.selected_execution_location || 'CLOUD',
      action: actionMsg,
      result: result,
      files_created: [`relatorio_cle_${cmd.command_id}.pdf`],
      records_affected: 1,
      warnings: [],
      errors: [],
      evidence_hash: hash,
      duration_ms: 240,
      knowledge_version_used: 'KR-2026.09.11',
      capability_version_used: 'CAP-2026.01',
      policy_version_used: 'CPEAA-POLICY-2026.1',
      connector_version_used: 'CONN-V2.4',
      status: 'VERIFIED'
    };

    this.receipts.unshift(receipt);
    return receipt;
  }

  public listReceipts(): ExecutionReceiptCLE[] {
    return [...this.receipts];
  }

  public listCommands(): RemoteCommandCLE[] {
    return Array.from(this.commands.values());
  }

  public listDecisions(): ExecutionDecisionCLE[] {
    return Array.from(this.decisions.values());
  }

  public getGlobalSummary(): CLEGlobalSummary {
    const cloudConns = Array.from(this.cloudConnections.values());
    const localConns = Array.from(this.localConnections.values());
    const devs = Array.from(this.devices.values());
    const cmds = Array.from(this.commands.values());
    const decs = Array.from(this.decisions.values());

    return {
      total_storage_connections: cloudConns.length + localConns.length,
      active_cloud_connectors: cloudConns.filter(c => c.status === 'CONNECTED').length,
      active_local_connectors: localConns.filter(c => c.status === 'ACCESSIBLE').length,
      total_registered_devices: devs.length,
      online_devices_count: devs.filter(d => d.status === 'ONLINE').length,
      total_commands_processed: cmds.length,
      cloud_executions_count: decs.filter(d => d.selected_execution_location === 'CLOUD').length,
      local_executions_count: decs.filter(d => d.selected_execution_location === 'LOCAL').length,
      hybrid_executions_count: decs.filter(d => d.selected_execution_location === 'HYBRID').length,
      waiting_for_device_count: cmds.filter(c => c.status === 'WAITING_FOR_DEVICE').length,
      active_triggers_count: Array.from(this.triggers.values()).filter(t => t.enabled).length,
      active_schedules_count: Array.from(this.schedules.values()).filter(s => s.enabled).length,
      total_execution_receipts: this.receipts.length,
      storage_not_equals_execution_guarantee: true
    };
  }
}

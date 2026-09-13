/**
 * CLE-500 v1.0 — Remote Command, Offline Queue, Deferred Execution & Cloud/Local Connectivity Engine
 * Storage Location != Execution Location Architecture Contracts
 */

export type StorageTypeCLE =
  | 'CLOUD_DRIVE'
  | 'ONEDRIVE'
  | 'SHAREPOINT'
  | 'DROPBOX'
  | 'S3_BUCKET'
  | 'AZURE_BLOB'
  | 'GOOGLE_CLOUD_STORAGE'
  | 'LOCAL_FOLDER'
  | 'NETWORK_SHARE'
  | 'NAS_SMB';

export type ExecutionLocationCLE =
  | 'CLOUD'
  | 'LOCAL'
  | 'HYBRID'
  | 'WAIT'
  | 'BLOCKED';

export type ExecutionModeCLE =
  | 'CLOUD_ONLY'
  | 'LOCAL_ONLY'
  | 'HYBRID'
  | 'ANY_AVAILABLE'
  | 'DEFERRED'
  | 'SCHEDULED'
  | 'CONDITIONAL';

export type DeviceStatusCLE =
  | 'ONLINE'
  | 'OFFLINE'
  | 'BUSY'
  | 'UNTRUSTED'
  | 'DISABLED'
  | 'UPDATING'
  | 'ERROR';

export type DeviceCapabilityCLE =
  | 'PRIMAVERA_AVAILABLE'
  | 'EXCEL_AVAILABLE'
  | 'BROWSER_AVAILABLE'
  | 'LOCAL_FILES_AVAILABLE'
  | 'NETWORK_SHARE_AVAILABLE'
  | 'PRINTER_AVAILABLE'
  | 'SCANNER_AVAILABLE'
  | 'CERTIFICATE_AVAILABLE';

export type CommandStatusCLE =
  | 'RECEIVED'
  | 'AUTHENTICATING'
  | 'AUTHORIZED'
  | 'REJECTED'
  | 'PARSED'
  | 'VALIDATING'
  | 'QUEUED'
  | 'WAITING_FOR_DEVICE'
  | 'WAITING_FOR_APPROVAL'
  | 'SCHEDULED'
  | 'EXECUTING'
  | 'PARTIALLY_COMPLETED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'EXPIRED';

export type RiskLevelCLE = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ChannelCLE =
  | 'MOBILE_APP'
  | 'WEB_APP'
  | 'DESKTOP_APP'
  | 'REST_API'
  | 'VOICE'
  | 'WHATSAPP_BUSINESS'
  | 'TELEGRAM'
  | 'SMS_LIMITED'
  | 'EMAIL_COMMANDS'
  | 'INTERNAL_CHAT';

export interface ExecutionDecisionCLE {
  decision_id: string;
  task_id: string;
  command_id: string;
  tenant_id: string;
  data_location: {
    storage_type: StorageTypeCLE;
    path: string;
    accessible_offline: boolean;
  };
  application_location: {
    app_name: string;
    has_cloud_api: boolean;
    requires_local_agent: boolean;
  };
  required_capabilities: DeviceCapabilityCLE[];
  available_cloud_connectors: string[];
  available_local_devices: string[];
  selected_execution_mode: ExecutionModeCLE;
  selected_execution_location: ExecutionLocationCLE;
  selected_device_id?: string;
  reason: string;
  risk_level: RiskLevelCLE;
  policy_result: 'ALLOWED' | 'LIMITED' | 'APPROVAL_REQUIRED' | 'BLOCKED';
  created_at: string;
}

export interface CloudStorageConnectionCLE {
  connection_id: string;
  tenant_id: string;
  provider: StorageTypeCLE;
  account_name: string;
  root_folder: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'REAUTHENTICATION_REQUIRED';
  last_synced_at: string;
  file_count: number;
}

export interface LocalStorageConnectionCLE {
  connection_id: string;
  tenant_id: string;
  device_id: string;
  path_type: 'LOCAL_DRIVE' | 'NETWORK_SHARE' | 'NAS_SMB';
  path: string;
  access_permissions: 'READ_ONLY' | 'READ_WRITE';
  status: 'ACCESSIBLE' | 'OFFLINE' | 'PERMISSION_DENIED';
  last_verified_at: string;
}

export interface RemoteCommandCLE {
  command_id: string;
  tenant_id: string;
  user_id: string;
  employee_id: string;
  channel: ChannelCLE;
  command_text: string;
  normalized_intent: string;
  attachments?: string[];
  created_at: string;
  expires_at?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline?: string;
  target_device?: string;
  execution_mode: ExecutionModeCLE;
  risk_level: RiskLevelCLE;
  approval_required: boolean;
  idempotency_key?: string;
  status: CommandStatusCLE;
  correlation_id: string;
}

export interface DeviceCLE {
  device_id: string;
  tenant_id: string;
  name: string;
  device_type: 'DESKTOP' | 'SERVER' | 'LAPTOP' | 'INDUSTRIAL_PC';
  operating_system: string;
  agent_version: string;
  owner: string;
  location_label: string;
  last_seen_at: string;
  status: DeviceStatusCLE;
  capabilities: DeviceCapabilityCLE[];
  installed_apps: string[];
  security_posture: 'SECURE' | 'WARNING' | 'COMPROMISED';
  trusted: boolean;
}

export interface TriggerRecordCLE {
  trigger_id: string;
  tenant_id: string;
  name: string;
  event_type:
    | 'DEVICE_ONLINE'
    | 'FILE_CREATED'
    | 'FILE_UPDATED'
    | 'EMAIL_RECEIVED'
    | 'DOCUMENT_UPLOADED'
    | 'BANK_FILE_AVAILABLE'
    | 'DATE_TIME'
    | 'API_EVENT'
    | 'WEBHOOK'
    | 'APPROVAL_GRANTED'
    | 'REGULATORY_CHANGE';
  target_employee_id: string;
  action_template: string;
  enabled: boolean;
  last_triggered_at?: string;
}

export interface ScheduleRecordCLE {
  schedule_id: string;
  tenant_id: string;
  name: string;
  schedule_type: 'RUN_AT' | 'RUN_AFTER' | 'RUN_BEFORE' | 'RECURRING' | 'ON_EVENT';
  cron_expression?: string;
  next_run_at: string;
  target_employee_id: string;
  command_template: string;
  enabled: boolean;
}

export interface ExecutionReceiptCLE {
  receipt_id: string;
  task_id: string;
  command_id: string;
  employee_id: string;
  tenant_id: string;
  executed_at: string;
  device_id?: string;
  data_source: string;
  storage_location: string;
  execution_location: ExecutionLocationCLE;
  action: string;
  result: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILURE';
  files_created: string[];
  records_affected: number;
  warnings: string[];
  errors: string[];
  evidence_hash: string;
  duration_ms: number;
  knowledge_version_used: string;
  capability_version_used: string;
  policy_version_used: string;
  connector_version_used: string;
  status: 'VERIFIED' | 'REVOKED';
}

export interface CLEGlobalSummary {
  total_storage_connections: number;
  active_cloud_connectors: number;
  active_local_connectors: number;
  total_registered_devices: number;
  online_devices_count: number;
  total_commands_processed: number;
  cloud_executions_count: number;
  local_executions_count: number;
  hybrid_executions_count: number;
  waiting_for_device_count: number;
  active_triggers_count: number;
  active_schedules_count: number;
  total_execution_receipts: number;
  storage_not_equals_execution_guarantee: boolean;
}

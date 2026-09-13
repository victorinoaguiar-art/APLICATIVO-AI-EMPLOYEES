/**
 * Remote Command, Offline Queue & Deferred Execution Engine (RCODE-500)
 * Types & Contracts
 */

export type CommandStatus =
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

export type ExecutionMode =
  | 'CLOUD_ONLY'
  | 'LOCAL_ONLY'
  | 'HYBRID'
  | 'ANY_AVAILABLE'
  | 'DEFERRED'
  | 'SCHEDULED'
  | 'CONDITIONAL';

export type RiskLevelRCODE = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ChannelRCODE =
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

export type DeviceStatusRCODE =
  | 'ONLINE'
  | 'OFFLINE'
  | 'BUSY'
  | 'UNTRUSTED'
  | 'DISABLED'
  | 'UPDATING'
  | 'ERROR';

export interface RemoteCommand {
  command_id: string;
  tenant_id: string;
  user_id: string;
  employee_id: string;
  channel: ChannelRCODE;
  command_text: string;
  normalized_intent: string;
  attachments: string[];
  created_at: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline: string | null;
  target_device: string | null;
  execution_mode: ExecutionMode;
  risk_level: RiskLevelRCODE;
  approval_required: boolean;
  status: CommandStatus;
  correlation_id: string;
  idempotency_key: string;
}

export interface DeviceRecord {
  device_id: string;
  tenant_id: string;
  name: string;
  device_type: 'WINDOWS_DESKTOP' | 'MACOS_WORKSTATION' | 'LINUX_SERVER' | 'MOBILE_DEVICE' | 'OTHER';
  operating_system: string;
  agent_version: string;
  owner: string;
  location_label: string;
  last_seen_at: string;
  status: DeviceStatusRCODE;
  capabilities: string[];
  installed_apps: string[];
  trusted: boolean;
}

export interface DeviceHeartbeat {
  device_id: string;
  timestamp: string;
  status: DeviceStatusRCODE;
  agent_version: string;
  network_state: 'STABLE' | 'DEGRADED' | 'OFFLINE';
  available_capabilities: string[];
  running_jobs: number;
  security_state: 'OK' | 'WARNING' | 'COMPROMISED';
}

export interface ExecutionTask {
  task_id: string;
  command_id: string;
  tenant_id: string;
  employee_id: string;
  task_type: string;
  execution_mode: ExecutionMode;
  required_capabilities: string[];
  required_device: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline: string | null;
  status: CommandStatus;
  attempt_count: number;
  max_attempts: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  idempotency_key: string;
}

export interface TriggerRecord {
  trigger_id: string;
  tenant_id: string;
  trigger_type:
    | 'DEVICE_ONLINE'
    | 'FILE_CREATED'
    | 'FILE_UPDATED'
    | 'EMAIL_RECEIVED'
    | 'DOCUMENT_UPLOADED'
    | 'BANK_FILE_AVAILABLE'
    | 'DATE_TIME'
    | 'APPROVAL_GRANTED'
    | 'REGULATORY_CHANGE';
  condition_expr: string;
  action_command_id: string;
  created_at: string;
  status: 'ACTIVE' | 'TRIGGERED' | 'DISABLED';
}

export interface ExecutionReceipt {
  receipt_id: string;
  task_id: string;
  command_id: string;
  employee_id: string;
  executed_at: string;
  device_id: string | 'CLOUD_WORKER';
  action: string;
  result: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  files_created: string[];
  records_affected: number;
  warnings: string[];
  errors: string[];
  evidence: string;
  duration_ms: number;
  status: string;
  hash: string;
}

export interface RCODE2026GlobalSummary {
  total_commands_received: number;
  cloud_executing_count: number;
  waiting_for_device_count: number;
  waiting_approval_count: number;
  completed_today_count: number;
  total_registered_devices: number;
  online_devices_count: number;
  total_execution_receipts: number;
  last_updated_at: string;
}

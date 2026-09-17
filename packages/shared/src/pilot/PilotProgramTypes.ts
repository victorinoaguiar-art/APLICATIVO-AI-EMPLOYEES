export type OperationalPilotMode = 'SIMULATION' | 'OPERATIONAL_PILOT';

export type ControlledPilotStatus =
  | 'DRAFT'
  | 'AUTHORIZED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export type HumanReviewStatus =
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'APPROVED_WITH_CORRECTIONS'
  | 'REJECTED'
  | 'BLOCKED';

export type DeliveryStatus =
  | 'PENDING'
  | 'ARCHIVED'
  | 'READY_FOR_MANUAL_DELIVERY'
  | 'DELIVERED'
  | 'BLOCKED'
  | 'FAILED';

export type FinalTaskStatus =
  | 'SUCCESS'
  | 'REJECTED'
  | 'FAILED'
  | 'BLOCKED';

export interface PilotReviewerConfig {
  reviewer_id: string;
  display_name: string;
  role: string;
  secret_ref?: string;
  key_id?: string;
  secret_or_key?: string;
}

export interface PilotReviewChallenge {
  challenge_id: string;
  tenant_id: string;
  pilot_id: string;
  task_id: string;
  document_version: number;
  document_sha256: string;
  allowed_decision?: HumanReviewStatus | null;
  reviewer_id?: string | null;
  nonce: string;
  issued_at: string;
  challenge_issued_at?: string;
  expires_at: string;
  status: 'PENDING' | 'CONSUMED' | 'EXPIRED';
  consumed_at?: string | null;
  consumption_receipt_sha256?: string | null;
}

export type PilotDocumentValidationType =
  | 'INTERNAL_STRUCTURAL_VALIDATION'
  | 'INDEPENDENT_LIBRARY_VALIDATION';

export interface PilotDocumentValidationReceipt {
  receipt_id: string;
  validation_id?: string;
  validation_type: PilotDocumentValidationType;
  task_id: string;
  document_version: number;
  tenant_id?: string;
  pilot_id?: string;
  file_path?: string;
  format: 'PDF' | 'DOCX' | 'XLSX' | 'JSON';
  parser_name: string;
  parser_version: string;
  file_bytes_sha256: string;
  result: 'PASS' | 'FAIL';
  is_valid?: boolean;
  page_or_cell_count?: number | null;
  error?: string | null;
  error_details?: string | null;
  execution_started_at?: string;
  execution_completed_at?: string;
  commit_sha?: string;
  receipt_sha256?: string;
  validated_at: string;
}

export interface SecretProvider {
  resolveSecret(secretRef: string, tenantId: string): string;
}

export interface PilotProgram {
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
  reviewer_configs?: PilotReviewerConfig[];
  task_limit: number;
  execution_mode: OperationalPilotMode;
  status: ControlledPilotStatus;
  created_at: string;
  updated_at: string;
}

export interface PilotTaskRequest {
  task_id: string;
  pilot_id: string;
  tenant_id: string;
  employee_id: number;
  requested_by: string;
  received_at: string;
  title: string;
  instruction: string;
  input_data: Record<string, any>;
  idempotency_key: string;
  format: 'DOCX' | 'PDF' | 'XLSX' | 'JSON';
  risk_level?: 'R1' | 'R2' | 'R3' | 'R4' | 'R5';
  action_type?: string;
  execution_mode?: OperationalPilotMode;
  data_classification?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
}

export interface PilotTaskReceipt {
  task_id: string;
  pilot_id: string;
  tenant_id: string;
  employee_id: number;
  requested_by: string;
  received_at: string;
  input_snapshot_sha256: string;
  execution_started_at: string;
  execution_completed_at: string;
  output_files: string[];
  output_hashes: string[];
  human_review_status: HumanReviewStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  corrections_required: number;
  delivery_status: DeliveryStatus;
  final_status: FinalTaskStatus;
  error_code: string | null;
  version?: number;
  idempotency_key?: string;
  commit_sha?: string;
  receipt_sha256?: string;
  execution_mode: OperationalPilotMode;
  is_simulation: boolean;
  classification_level: string;
}

export interface PilotHumanReviewReceipt {
  review_id: string;
  task_id: string;
  pilot_id: string;
  tenant_id?: string;
  commit_sha?: string;
  document_version?: number;
  challenge_id?: string;
  reviewer: string;
  reviewed_at: string;
  decision: HumanReviewStatus;
  comments: string;
  corrections_requested?: string[];
  previous_output_hash?: string;
  new_output_hash?: string;
  auth_method: 'SESSION_TOKEN' | 'HMAC_SIGNATURE' | 'API_KEY';
  review_signature_sha256: string;
  receipt_sha256: string;
  challenge_issued_at?: string;
  event_signed_at?: string;
  review_received_at?: string;
  review_accepted_at?: string;
  challenge_consumed_at?: string;
  auth_token_sha256?: string;
  session_id?: string;
  session_reference?: string;
}

export interface PilotDeliveryReceipt {
  delivery_id: string;
  task_id: string;
  pilot_id: string;
  tenant_id: string;
  commit_sha?: string;
  document_version?: number;
  review_id?: string;
  delivered_to: string;
  channel: string;
  delivered_at: string;
  output_hashes: string[];
  status: DeliveryStatus;
  is_external_confirmed: boolean;
  external_provider_response?: Record<string, any>;
  receipt_sha256: string;
}

export interface PilotTaskForensicRecord {
  rawColumns: Record<string, any>;
  rawReceiptJson: string;
  parsedReceipt: PilotTaskReceipt;
}

export interface PilotOutputForensicRecord {
  rawColumns: Record<string, any>;
  blob: Buffer;
  blobSha256: string;
  storedHash: string;
}

export interface PilotDocValidationForensicRecord {
  rawColumns: Record<string, any>;
  rawReceiptJson?: string;
  parsedReceipt: PilotDocumentValidationReceipt;
}

export interface PilotReviewForensicRecord {
  rawColumns: Record<string, any>;
  rawReceiptJson: string;
  parsedReceipt: PilotHumanReviewReceipt;
}

export interface PilotDeliveryForensicRecord {
  rawColumns: Record<string, any>;
  rawReceiptJson: string;
  parsedReceipt: PilotDeliveryReceipt;
}

export interface PilotMetrics {
  execution_mode: OperationalPilotMode;
  total_tasks_received: number;
  total_tasks_completed: number;
  total_tasks_approved_first_review: number;
  total_tasks_corrected: number;
  total_tasks_rejected: number;
  total_tasks_failed: number;
  total_tasks_archived: number;
  completion_rate: number;
  first_pass_acceptance_rate: number;
  human_correction_rate: number;
  median_execution_time: number;
  p95_execution_time: number;
  median_review_time: number;
  delivery_success_rate: number;
  cross_tenant_incidents: number;
  privacy_incidents: number;
  unauthorized_action_attempts: number;
  duplicate_business_effects: number;
}

export interface PilotGateCheck {
  gate_name: string;
  required_condition: string;
  actual_value: string | number;
  passed: boolean;
  notes: string;
  source: string;
  calculation: string;
  evidence_sha256: string;
}

export interface PilotGateResults {
  all_passed: boolean;
  execution_mode: OperationalPilotMode;
  gates: PilotGateCheck[];
  evaluated_at: string;
}

export interface PilotIncident {
  incident_id: string;
  pilot_id: string;
  timestamp: string;
  type:
    | 'CROSS_TENANT_ACCESS'
    | 'PRIVACY_LEAK'
    | 'UNAUTHORIZED_ACTION'
    | 'DUPLICATE_EXECUTION'
    | 'TAMPER_DETECTED'
    | 'DOCUMENT_CORRUPT'
    | 'DB_FAILURE'
    | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: string;
  resolved: boolean;
  resolution_notes?: string;
}

export interface PilotFinalAttestation {
  pilot_id: string;
  tenant_id: string;
  organization_name: string;
  execution_mode: OperationalPilotMode;
  infrastructure_implemented: boolean;
  simulation_executed: boolean;
  operational_pilot_started: boolean;
  operational_pilot_completed: boolean;
  classification_status:
    | 'CONTROLLED_PILOT_SIMULATOR_IMPLEMENTED'
    | 'OPERATIONAL_PILOT_INFRASTRUCTURE_READY'
    | 'CONTROLLED_OPERATIONAL_PILOT_VALIDATED'
    | 'NOT_PROVEN';
  classification?: string;
  operational_state: string;
  metrics: PilotMetrics;
  gates_result: 'PASS' | 'FAIL' | 'NOT_PROVEN';
  generated_at: string;
}

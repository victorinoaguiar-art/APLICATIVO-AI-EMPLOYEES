export type GoogleWorkspaceConnectionState =
  | 'NOT_CONFIGURED'
  | 'AUTHORIZING'
  | 'AUTHENTICATED'
  | 'SCOPING'
  | 'TESTING'
  | 'TESTED'
  | 'ACTIVE'
  | 'DEGRADED'
  | 'NEEDS_REAUTHORIZATION'
  | 'REVOKED'
  | 'FAILED';

export type GoogleWorkspaceAuthMode =
  | 'user_oauth'
  | 'org_managed_oauth'
  | 'service_account'
  | 'domain_delegation';

export type GoogleWorkspaceServiceType = 'drive' | 'docs' | 'sheets';

export interface GoogleWorkspaceConnectionProfile {
  connection_id: string;
  tenant_id: string;
  organization_id: string;
  auth_mode: GoogleWorkspaceAuthMode;
  credential_ref: string;
  google_workspace_customer_ref: string;
  connected_user_ref: string;
  shared_drive_refs: string[];
  allowed_root_folder_refs: string[];
  enabled_services: GoogleWorkspaceServiceType[];
  scopes: string[];
  status: GoogleWorkspaceConnectionState;
  created_by: string;
  approved_by: string;
  last_health_check: string;
  last_successful_operation?: string;
}

export interface EmployeeGoogleWorkspaceBinding {
  employee_instance_id: string;
  connection_id: string;
  allowed_services: GoogleWorkspaceServiceType[];
  allowed_resources: {
    drive_folders?: string[];
    docs_documents?: string[];
    sheets_spreadsheets?: string[];
  };
  allowed_operations: {
    drive?: string[];
    docs?: string[];
    sheets?: string[];
  };
  read_only: boolean;
  write_requires_approval: boolean;
  external_sharing_allowed: boolean;
}

export interface AuthorizedSheetRange {
  spreadsheet_id: string;
  sheet_id_or_name: string;
  allowed_ranges: string[];
  operations: ('read' | 'write' | 'append' | 'formula')[];
  classification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
}

export interface DriveFileMetadata {
  file_id: string;
  name: string;
  mime_type: string;
  parent_folder_id?: string;
  drive_id?: string;
  created_time: string;
  modified_time: string;
  size_bytes?: number;
  version: number;
  content_hash: string;
  web_view_link: string;
  is_shared_drive: boolean;
}

export interface DocsDocumentMetadata {
  document_id: string;
  title: string;
  revision: number;
  content_hash: string;
  created_time: string;
  modified_time: string;
  author: string;
  template_version?: string;
  brand_version?: string;
  web_view_link: string;
}

export interface DocsOperationIntent {
  operation: 'create' | 'read' | 'update' | 'append' | 'replace_text' | 'export_pdf' | 'export_docx';
  document_id?: string;
  title?: string;
  content_structure?: {
    title?: string;
    sections?: Array<{ heading: string; paragraph: string }>;
    tables?: Array<{ headers: string[]; rows: string[][] }>;
  };
  replacements?: Record<string, string>;
  export_format?: 'pdf' | 'docx';
}

export interface SheetsSpreadsheetMetadata {
  spreadsheet_id: string;
  title: string;
  revision: number;
  created_time: string;
  modified_time: string;
  sheets: Array<{
    sheet_id: number;
    title: string;
    row_count: number;
    column_count: number;
  }>;
  web_view_link: string;
}

export interface SheetsOperationIntent {
  operation: 'create' | 'read_values' | 'update_range' | 'append_rows' | 'write_formula' | 'export_xlsx' | 'export_csv';
  spreadsheet_id?: string;
  title?: string;
  sheet_name?: string;
  range?: string;
  values?: Array<Array<string | number | boolean>>;
  expected_version?: number;
  export_format?: 'xlsx' | 'csv';
}

export interface GWNISOperationReceipt {
  receipt_id: string;
  timestamp: string;
  tenant_id: string;
  organization_id: string;
  employee_instance_id: string;
  service: GoogleWorkspaceServiceType;
  operation: string;
  resource_id: string;
  resource_type: string;
  status: 'SUCCESS' | 'BLOCKED' | 'REQUIRES_APPROVAL' | 'FAILED';
  approval_ref?: string;
  risk_level: 'R1' | 'R2' | 'R3' | 'R4';
  details: string;
}

export interface GWNISGlobalSummary {
  total_connections: number;
  active_connections: number;
  enabled_services_count: {
    drive: number;
    docs: number;
    sheets: number;
  };
  pilots_readiness: {
    doc_creator_261: boolean;
    spreadsheet_employee_286: boolean;
    management_reporting_73: boolean;
  };
  security_status: {
    deleation_blocked: boolean;
    external_sharing_restricted: boolean;
    anti_prompt_injection_active: boolean;
    secrets_isolated: boolean;
  };
}

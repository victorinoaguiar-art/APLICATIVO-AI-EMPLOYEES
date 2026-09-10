export type PilotTaskState =
  | 'CREATED'
  | 'RUNNING'
  | 'WAITING_DATA'
  | 'WAITING_TOOL'
  | 'WAITING_APPROVAL'
  | 'DRAFT_READY'
  | 'READY_FOR_REVIEW'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'READY_FOR_DELIVERY'
  | 'DELIVERED'
  | 'REJECTED'
  | 'FAILED'
  | 'CANCELLED';

export type OmnichannelChannel =
  | 'DOWNLOAD'
  | 'PRINT'
  | 'EMAIL'
  | 'WHATSAPP_BUSINESS'
  | 'DRIVE'
  | 'SHAREPOINT'
  | 'DMS'
  | 'EMPLOYEE_HANDOFF'
  | 'API'
  | 'WEBHOOK'
  | 'SFTP';

export interface EnterprisePilotInstance {
  pilotInstanceId: string;
  tenantId: string;
  organizationId: string;
  organizationName: string;
  employeeId: number;
  roleKey: string;
  roleName: string;
  department: string;
  supervisorId: string;
  supervisorName: string;
  autonomyLimit: 'L1_STRICT_HUMAN_APPROVAL' | 'L2_SHADOW_SUPERVISED' | 'L3_CONDITIONAL_AUTONOMY';
  supervisionLevel: 'H3_MANDATORY_PRE_APPROVAL' | 'H4_FULL_SHADOW_AUDIT';
  mode?: 'READ_FIRST' | 'SHADOW_MODE';
  allowedInputs: string[];
  allowedTools: string[];
  allowedConnections: string[];
  allowedOutputs: string[];
  autoDeliveryEnabled: boolean;
  autoDelivery?: boolean;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface PrintCollisionCheck {
  collisionDetected: boolean;
  logoOverlap: boolean;
  footerOverlap: boolean;
  signatureOverlap: boolean;
  outsideSafeArea: boolean;
  status: 'PASS' | 'WARNING' | 'FAIL';
  details: string[];
}

export interface PrintJobSpec {
  printJobId: string;
  organizationId: string;
  printerName: string;
  location: string;
  paperSize: 'A4' | 'LETTER' | 'LEGAL';
  stationeryMode: 'DIGITAL_LETTERHEAD' | 'PREPRINTED_LETTERHEAD' | 'PLAIN';
  colorMode: 'COLOR' | 'MONO';
  duplex: boolean;
  pagesCount: number;
  status: 'QUEUED' | 'AUTHORIZED' | 'PRINTING' | 'PRINTED' | 'FAILED';
  collisionCheck: PrintCollisionCheck;
  createdAt: string;
}

export interface EmailDeliveryDraft {
  draftId: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyHtml: string;
  attachmentsCount: number;
  attachmentsList: string[];
  confidentialDataDetected: boolean;
  dlpApproved: boolean;
}

export interface BusinessMessagingDraft {
  draftId: string;
  channel: 'WHATSAPP_BUSINESS' | 'TELEGRAM_BUSINESS' | 'SMS_SECURE';
  recipientPhoneNumber: string;
  recipientName: string;
  messageText: string;
  attachmentName?: string;
  secureAuthUrl?: string;
  dlpApproved: boolean;
}

export interface DeliveryIntent {
  intentId: string;
  taskId: string;
  employeeId: number;
  roleKey: string;
  channel: OmnichannelChannel;
  destination: string;
  documentId: string;
  documentVersion: string;
  approvalSnapshotHash: string;
  requestedBy: string;
  requestedAt: string;
}

export interface EPTOWDSDeliveryReceipt {
  deliveryId: string;
  taskId: string;
  employeeId: number;
  roleKey: string;
  channel: OmnichannelChannel;
  destination: string;
  documentTitle: string;
  documentHash: string;
  initiatedBy: string;
  approvedBy: string;
  providerReference: string;
  status: 'DELIVERED' | 'SENDING' | 'FAILED' | 'BOUNCED';
  deliveredAt: string;
}

export interface EPTOWDSGlobalSummary {
  totalPilotInstances: number;
  activePilotsCount: number;
  totalPilotTasksExecuted: number;
  totalDeliveriesCompleted: number;
  deliveriesByChannel: Record<OmnichannelChannel, number>;
  averageHumanReviewTimeMinutes: number;
  readFirstEnforcementRate: number; // 100%
  timestamp: string;
}

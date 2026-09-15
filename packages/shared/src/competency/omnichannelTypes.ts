/**
 * AETF-500 — AI Omnichannel Communications, Social Media Operations,
 * WhatsApp Command, Email Intelligence & Daily Executive Briefing Engine Types
 * As specified in Prompt_AI_Omnichannel_WhatsApp_Social_Email_Daily_Executive_Briefing_AETF500.md
 */

export type OmnichannelChannelType =
  | 'WHATSAPP'
  | 'EMAIL'
  | 'FACEBOOK'
  | 'INSTAGRAM'
  | 'LINKEDIN'
  | 'TIKTOK'
  | 'X_TWITTER'
  | 'YOUTUBE'
  | 'WEBSITE'
  | 'SYSTEM';

export interface ChannelCapabilityRegistryRecord {
  registryId: string;
  channel: OmnichannelChannelType;
  accountId: string;
  accountName: string;
  companyId: string;
  tenantId: string;

  canReadMessages: boolean;
  canSendMessages: boolean;
  canReadComments: boolean;
  canReplyComments: boolean;
  canPublish: boolean;
  canSchedule: boolean;
  canReadAnalytics: boolean;
  canManageAds: boolean;
  canReceiveWebhooks: boolean;

  status: 'ACTIVE' | 'READ_ONLY' | 'DEGRADED' | 'DISCONNECTED' | 'REVOKED';
  permissions: string[];
  lastVerifiedAt: string;
}

export type WhatsAppMessageType = 'TEXT' | 'DOCUMENT' | 'IMAGE' | 'AUDIO_VOICE' | 'VIDEO' | 'LOCATION';

export interface WhatsAppInboundMessage {
  messageId: string;
  senderPhone: string;
  senderName: string;
  receivedAt: string;
  messageType: WhatsAppMessageType;
  text: string;
  mediaUrl?: string;
  audioDurationSec?: number;
  transcription?: string;
  transcriptionConfidence?: number;
  attachments: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
  }[];
  replyToMessageId?: string;
  companyId: string;
  tenantId: string;
  resolvedUserId?: string;
  isAuthorizedSender: boolean;
  resolvedEmployeeAlias?: string;
  resolvedEmployeeInstanceId?: string;
  taskId?: string;
  executionMode?: 'MOCK' | 'REAL_API';
}

export interface WhatsAppOutboundMessage {
  outboundId: string;
  taskId?: string;
  recipientPhone: string;
  companyId: string;
  tenantId: string;
  employeeInstanceId: string;
  messageType: WhatsAppMessageType;
  content: string;
  documentUrl?: string;
  documentFilename?: string;
  replyToMessageId?: string;
  approvalId?: string;
  approvalStatus: 'NOT_REQUIRED' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED';
  deliveryStatus: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  sentAt: string;
}

export type EmailIntentCategory =
  | 'INVOICE'
  | 'CUSTOMER_REQUEST'
  | 'SUPPLIER_REQUEST'
  | 'BANKING'
  | 'TAX'
  | 'HR'
  | 'LEGAL'
  | 'SALES_LEAD'
  | 'COMPLAINT'
  | 'INTERNAL'
  | 'SPAM'
  | 'PHISHING_SUSPECTED'
  | 'OTHER';

export interface EmailInboundRecord {
  emailId: string;
  threadId: string;
  mailboxId: string;
  sender: string;
  senderName: string;
  recipients: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  attachments: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
    hash?: string;
  }[];
  receivedAt: string;
  importance: 'NORMAL' | 'HIGH' | 'LOW';
  category: EmailIntentCategory;
  securityRisk: 'SAFE' | 'SUSPICIOUS' | 'PHISHING_SUSPECTED';
  securityFlags: string[];
  companyId: string;
  tenantId: string;
  taskId?: string;
  assignedEmployeeInstanceId?: string;
}

export interface EmailDraftRecord {
  draftId: string;
  taskId: string;
  threadId: string;
  mailboxId: string;
  companyId: string;
  tenantId: string;
  employeeInstanceId: string;
  recipient: string;
  cc?: string[];
  subject: string;
  bodyHtml: string;
  attachments: string[];
  isHighRisk: boolean;
  highRiskReason?: string;
  approvalStatus: 'DRAFT' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED';
  approvalId?: string;
  sentAt?: string;
  deliveryStatus: 'DRAFT' | 'PENDING' | 'SENT' | 'FAILED';
}

export interface BrandProfileRecord {
  profileId: string;
  companyId: string;
  tenantId: string;
  brandName: string;
  tagline: string;
  tone: 'PROFESSIONAL' | 'CASUAL' | 'AUTHORITATIVE' | 'EMPATHETIC' | 'DYNAMIC';
  logoUrl: string;
  primaryColorHex: string;
  secondaryColorHex: string;
  approvedProducts: string[];
  approvedServices: string[];
  approvedPriceList: Record<string, number>;
  targetAudience: string;
  preferredTerms: string[];
  prohibitedTerms: string[];
  approvedClaims: string[];
}

export type ContentApprovalLevel = 'A1_SUGGESTION' | 'A2_DRAFT' | 'A3_SCHEDULE_WITH_APPROVAL' | 'A4_AUTO_PUBLISH_APPROVED' | 'A5_FULL_AUTONOMOUS';

export interface SocialMediaEventRecord {
  eventId: string;
  platform: OmnichannelChannelType;
  accountId: string;
  companyId: string;
  tenantId: string;
  eventType: 'COMMENT' | 'DIRECT_MESSAGE' | 'MENTION' | 'POST_DRAFT' | 'PUBLISHED_POST' | 'CRISIS_ALERT';
  author: string;
  authorHandle: string;
  content: string;
  postId?: string;
  parentCommentId?: string;
  leadId?: string;
  complaintDetected: boolean;
  crisisDetected: boolean;
  crisisReason?: string;
  assignedEmployeeInstanceId?: string;
  suggestedResponse?: string;
  approvalStatus: 'NOT_REQUIRED' | 'WAITING_APPROVAL' | 'APPROVED' | 'REJECTED';
  publishedAt?: string;
  createdAt: string;
}

export interface LeadRecord {
  leadId: string;
  sourceChannel: OmnichannelChannelType;
  sourceEventId: string;
  companyId: string;
  tenantId: string;
  contactName: string;
  contactDetail: string; // phone or email or social handle
  interest: string;
  estimatedValueAoa?: number;
  status: 'NEW' | 'ASSIGNED' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'WON' | 'LOST';
  assignedEmployeeInstanceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface NeedsYourAttentionItem {
  itemId: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  description: string;
  category: 'APPROVAL' | 'RECONCILIATION' | 'MISSING_DATA' | 'OFFLINE_CONNECTOR' | 'SUSPICIOUS_EMAIL' | 'SOCIAL_CRISIS' | 'LEAD_WAITING';
  taskId?: string;
  approvalId?: string;
  actionLabel: string;
  actionType: 'APPROVE' | 'REVIEW' | 'REPLY' | 'LOCAL_SYNC_REQUIRED' | 'INSPECT';
}

export interface DailyExecutiveBriefingRecord {
  briefingId: string;
  companyId: string;
  companyName: string;
  tenantId: string;
  date: string; // YYYY-MM-DD
  generatedAt: string;
  generatedByEmployeeInstanceId: string; // AI_OPERATIONS_SUPERVISOR

  executiveSummary: string;

  whatsappMetrics: {
    messagesReceived: number;
    commandsDetected: number;
    tasksCreated: number;
    completedTasks: number;
    inProgressTasks: number;
    waitingApprovalTasks: number;
    attachmentsReceived: number;
  };

  emailMetrics: {
    received: number;
    sent: number;
    tasksCreated: number;
    awaitingReply: number;
    awaitingApproval: number;
    attachmentsReceived: number;
    suspiciousCount: number;
    failedSends: number;
  };

  socialMetrics: {
    postsPublished: number;
    postsAwaitingApproval: number;
    commentsCount: number;
    dmsCount: number;
    leadsCaptured: number;
    complaintsCount: number;
    criticalIncidents: number;
  };

  taskMetrics: {
    created: number;
    completed: number;
    failed: number;
    waitingInput: number;
    waitingApproval: number;
    blocked: number;
    inProgress: number;
  };

  employeeActivitySummary: {
    employeeName: string;
    roleKey: string;
    tasksAssigned: number;
    tasksCompleted: number;
    pendingStatus: string;
  }[];

  filesReceived: {
    filename: string;
    sourceChannel: OmnichannelChannelType;
    sender: string;
    taskId: string;
    status: string;
  }[];

  filesGenerated: {
    filename: string;
    taskId: string;
    format: string;
    deliveryChannel: OmnichannelChannelType;
  }[];

  approvalsSummary: {
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
  };

  leadsCapturedList: {
    leadId: string;
    name: string;
    channel: OmnichannelChannelType;
    interest: string;
  }[];

  complaintsList: {
    complaintId: string;
    channel: OmnichannelChannelType;
    customer: string;
    summary: string;
    status: string;
  }[];

  errorsAndIncidents: {
    incidentId: string;
    type: string;
    severity: 'HIGH' | 'CRITICAL';
    message: string;
  }[];

  connectorHealth: {
    channel: OmnichannelChannelType;
    status: 'ONLINE' | 'OFFLINE_PENDING_LOCAL_SYNC' | 'DEGRADED';
    notes: string;
  }[];

  aiCosts: {
    openAiCostUsd: number;
    geminiCostUsd: number;
    claudeCostUsd: number;
    connectorsCostUsd: number;
    totalCostUsd: number;
    totalCostAoa: number;
  };

  needsYourAttention: NeedsYourAttentionItem[];

  deliveryStatus: 'GENERATED' | 'DELIVERED_WHATSAPP' | 'DELIVERED_EMAIL' | 'DELIVERED_IN_APP';
}

export interface OmnichannelTestCaseResult {
  testId: string;
  category: 'WHATSAPP' | 'EMAIL' | 'SOCIAL' | 'DAILY_BRIEF' | 'REAL_PILOT';
  name: string;
  details: string;
  expectedCode: string;
  actualCode: string;
  passed: boolean;
}

export interface OmnichannelTestSuiteReport {
  companyId: string;
  tenantId: string;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  timestamp: string;
  tests: OmnichannelTestCaseResult[];
}

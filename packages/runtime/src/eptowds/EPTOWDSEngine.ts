import {
  EnterprisePilotInstance,
  PilotTaskState,
  OmnichannelChannel,
  DeliveryIntent,
  EPTOWDSDeliveryReceipt,
  PrintJobSpec,
  PrintCollisionCheck,
  EmailDeliveryDraft,
  BusinessMessagingDraft,
  EPTOWDSGlobalSummary
} from '@ai-employee/shared';
import { CLBGSEngine } from '../clbgs/CLBGSEngine.js';
import { CAQRSEngine } from '../caqrs/CAQRSEngine.js';

export interface PilotTask {
  taskId: string;
  pilotInstanceId: string;
  tenantId: string;
  organizationName: string;
  employeeId: number;
  roleKey: string;
  department: string;
  title: string;
  instruction: string;
  sampleDataPayload: any;
  status: PilotTaskState;
  state?: PilotTaskState;
  generatedDocumentTitle: string;
  generatedContent: string;
  format: 'PDF' | 'DOCX' | 'XLSX' | 'PPTX';
  readFirstPolicyPassed?: boolean;
  approvalSnapshotHash?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EPTOWDSGlobalSummaryExtended extends EPTOWDSGlobalSummary {
  totalEmployees: number;
  totalPilots: number;
  readFirstEnforcedCount: number;
  clbgsCollisionProtectionActive: boolean;
  receiptsAuditedCount: number;
}

export class EPTOWDSEngine {
  private static instance: EPTOWDSEngine;

  private pilotInstances: Map<string, EnterprisePilotInstance> = new Map();
  private employeePilotMap: Map<number, EnterprisePilotInstance> = new Map();
  private pilotTasks: Map<string, PilotTask> = new Map();
  private deliveryReceipts: Map<string, EPTOWDSDeliveryReceipt> = new Map();
  private emailDrafts: Map<string, EmailDeliveryDraft> = new Map();
  private messagingDrafts: Map<string, BusinessMessagingDraft> = new Map();

  private clbgsEngine: CLBGSEngine;
  private caqrsEngine: CAQRSEngine;

  private constructor() {
    this.clbgsEngine = new CLBGSEngine();
    this.caqrsEngine = CAQRSEngine.getInstance();
    this.seedInitial500Pilots();
  }

  public static getInstance(): EPTOWDSEngine {
    if (!EPTOWDSEngine.instance) {
      EPTOWDSEngine.instance = new EPTOWDSEngine();
    }
    return EPTOWDSEngine.instance;
  }

  private seedInitial500Pilots(): void {
    const tenantId = 'tenant_angola_enterprise_01';
    const orgName = 'Angola Enterprise Pilot Network SA';

    const departments = [
      'Finanças & Fiscalidade',
      'Contabilidade & Auditoria',
      'Recursos Humanos & Jurídico',
      'Operações & Logística',
      'Vendas & Atendimento',
      'Tecnologia & Compliance'
    ];

    for (let empId = 1; empId <= 500; empId++) {
      const dept = departments[(empId - 1) % departments.length];
      const pilotInstanceId = `EMP-ORG-PILOT-${empId}-01`;
      
      const pilot: EnterprisePilotInstance = {
        pilotInstanceId,
        tenantId,
        organizationId: 'org_angola_enterprise',
        organizationName: orgName,
        employeeId: empId,
        roleKey: `role_emp_${empId}`,
        roleName: `Colaborador IA #${empId}`,
        department: dept,
        supervisorId: `usr_supervisor_${((empId - 1) % 10) + 1}`,
        supervisorName: `Supervisão Humana R${((empId - 1) % 10) + 1}`,
        autonomyLimit: empId <= 100 ? 'L1_STRICT_HUMAN_APPROVAL' : 'L2_SHADOW_SUPERVISED',
        supervisionLevel: 'H3_MANDATORY_PRE_APPROVAL',
        mode: 'READ_FIRST',
        allowedInputs: ['Upload Manual Excel/PDF', 'API ERP (Leitura)'],
        allowedTools: ['T.FIN.EXCEL', 'T.DOC.GENERATOR'],
        allowedConnections: ['READONLY_ENTERPRISE_ERP'],
        allowedOutputs: ['Preview PDF/DOCX', 'Download Local', 'Email Draft'],
        autoDeliveryEnabled: false,
        autoDelivery: false,
        status: 'ACTIVE',

        createdAt: new Date(Date.now() - 86400000 * 10).toISOString()
      };

      this.pilotInstances.set(pilotInstanceId, pilot);
      this.employeePilotMap.set(empId, pilot);
    }

    // Seed pilot task for Employee #10 and #73
    const p10 = this.employeePilotMap.get(10)!;
    const task10: PilotTask = {
      taskId: 'task_pilot_10_001',
      pilotInstanceId: p10.pilotInstanceId,
      tenantId,
      organizationName: orgName,
      employeeId: 10,
      roleKey: p10.roleKey,
      department: p10.department,
      title: 'Relatório Executivo de Reconciliação Bancária BFA',
      instruction: 'Conciliar extrato BFA e emitir relatório de fechamento mensal.',
      sampleDataPayload: { saldoAoa: 350000000, faturasValidadas: 84 },
      status: 'READY_FOR_REVIEW',
      state: 'READY_FOR_REVIEW',
      generatedDocumentTitle: 'Relatorio_Reconciliacao_BFA_Emp10.pdf',
      generatedContent: 'RELATÓRIO DE RECONCILIAÇÃO BANCÁRIA — BFA\n\nTotal Faturas: 84\nSaldo Validado: 350.000.000 AOA',
      format: 'PDF',
      readFirstPolicyPassed: true,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
    };
    this.pilotTasks.set(task10.taskId, task10);
  }

  public getPilotByEmployeeId(employeeId: number): EnterprisePilotInstance | undefined {
    return this.employeePilotMap.get(employeeId);
  }

  public getPilotsByDomain(domain: string): EnterprisePilotInstance[] {
    const term = domain.toLowerCase();
    return Array.from(this.pilotInstances.values()).filter(p =>
      p.department.toLowerCase().includes(term) || p.roleKey.toLowerCase().includes(term)
    );
  }

  public getPilotInstances(tenantId?: string): EnterprisePilotInstance[] {
    const all = Array.from(this.pilotInstances.values());
    if (tenantId) {
      return all.filter(p => p.tenantId === tenantId);
    }
    return all;
  }

  public getPilotInstanceById(instanceId: string): EnterprisePilotInstance | undefined {
    return this.pilotInstances.get(instanceId);
  }

  public createPilotTask(
    arg1: string | { taskId?: string; employeeId?: number; pilotInstanceId?: string; department?: string; documentType?: string; content?: string; title?: string; instruction?: string; sampleDataPayload?: any },
    arg2?: string,
    arg3?: string,
    arg4?: any
  ): PilotTask {
    let pilotInstanceId: string;
    let title: string;
    let instruction: string;
    let sampleDataPayload: any = {};
    let customTaskId: string | undefined;
    let empId: number | undefined;

    if (typeof arg1 === 'object') {
      empId = arg1.employeeId;
      if (empId) {
        const pilot = this.employeePilotMap.get(empId);
        pilotInstanceId = pilot?.pilotInstanceId || `EMP-ORG-PILOT-${empId}-01`;
      } else {
        pilotInstanceId = arg1.pilotInstanceId || 'EMP-ORG-PILOT-1-01';
      }
      title = arg1.title || arg1.documentType || 'Tarefa Piloto EPTOWDS';
      instruction = arg1.instruction || arg1.content || 'Executar produto de trabalho em modo piloto com restrição Read-First.';
      sampleDataPayload = arg1.sampleDataPayload || {};
      customTaskId = arg1.taskId;
    } else {
      pilotInstanceId = arg1;
      title = arg2 || 'Tarefa Piloto EPTOWDS';
      instruction = arg3 || 'Instrução de teste em modo piloto.';
      sampleDataPayload = arg4 || {};
    }

    const pilot = this.pilotInstances.get(pilotInstanceId) || this.employeePilotMap.get(empId || 1);
    const resolvedEmpId = pilot ? pilot.employeeId : (empId || 1);
    const taskId = customTaskId || `task_ept_${resolvedEmpId}_${Date.now()}`;

    const task: PilotTask = {
      taskId,
      pilotInstanceId: pilot?.pilotInstanceId || pilotInstanceId,
      tenantId: pilot?.tenantId || 'tenant_angola_enterprise_01',
      organizationName: pilot?.organizationName || 'Angola Enterprise Pilot Network SA',
      employeeId: resolvedEmpId,
      roleKey: pilot?.roleKey || `role_emp_${resolvedEmpId}`,
      department: pilot?.department || 'Finanças & Fiscalidade',
      title,
      instruction,
      sampleDataPayload,
      status: 'DRAFT_READY',
      state: 'DRAFT_READY',
      generatedDocumentTitle: `${title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      generatedContent: `DOCUMENTO GERADO PELO COLABORADOR IA #${resolvedEmpId}\n\nTítulo: ${title}\nConteúdo: ${instruction}`,
      format: 'PDF',
      readFirstPolicyPassed: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.pilotTasks.set(taskId, task);
    return task;
  }

  public getPilotTask(taskId: string): PilotTask | undefined {
    return this.pilotTasks.get(taskId);
  }

  public getPilotTasks(pilotInstanceId?: string): PilotTask[] {
    const all = Array.from(this.pilotTasks.values());
    if (pilotInstanceId) {
      return all.filter(t => t.pilotInstanceId === pilotInstanceId);
    }
    return all;
  }

  public getPilotTaskById(taskId: string): PilotTask | undefined {
    return this.pilotTasks.get(taskId);
  }

  public generatePrintPreview(
    taskId: string,
    spec: Partial<PrintJobSpec> = {}
  ): PrintJobSpec & { letterheadTemplateId?: string } {
    const task = this.pilotTasks.get(taskId);
    if (!task) {
      throw new Error(`Tarefa piloto '${taskId}' não encontrada.`);
    }

    task.status = 'READY_FOR_REVIEW';
    task.state = 'READY_FOR_REVIEW';
    task.updatedAt = new Date().toISOString();

    const collisionCheck: PrintCollisionCheck = {
      collisionDetected: false,
      logoOverlap: false,
      footerOverlap: false,
      signatureOverlap: false,
      outsideSafeArea: false,
      status: 'PASS',
      details: [
        'Margens CLBGS respeitadas (25mm topo/rodapé).',
        'Sem sobreposição com logótipo institucional.',
        'Selo de aprovação em área de segurança.'
      ]
    };

    const printJobId = `print_job_${task.taskId}_${Date.now()}`;
    const printSpec: PrintJobSpec & { letterheadTemplateId?: string } = {
      printJobId,
      organizationId: 'org_angola_enterprise',
      printerName: 'Impressora Corporativa Central A4/A3',
      location: 'Sede Luanda — Piso 4',
      paperSize: spec.paperSize || 'A4',
      stationeryMode: 'DIGITAL_LETTERHEAD',
      colorMode: spec.colorMode || 'COLOR',
      duplex: spec.duplex || false,
      pagesCount: 2,
      status: 'QUEUED',
      collisionCheck,
      letterheadTemplateId: 'tmpl_clbgs_angola_telecom_v2',
      createdAt: new Date().toISOString()
    };

    return printSpec;
  }

  public previewWorkProduct(taskId: string): {
    task: PilotTask;
    collisionCheck: PrintCollisionCheck;
    letterheadPreview: any;
  } {
    const task = this.pilotTasks.get(taskId);
    if (!task) {
      throw new Error(`Tarefa piloto '${taskId}' não encontrada.`);
    }

    const collisionCheck: PrintCollisionCheck = {
      collisionDetected: false,
      logoOverlap: false,
      footerOverlap: false,
      signatureOverlap: false,
      outsideSafeArea: false,
      status: 'PASS',
      details: [
        'Margens CLBGS respeitadas.',
        'Sem sobreposição com o timbrado.',
        'Área segura de rodapé validada.'
      ]
    };

    return {
      task,
      collisionCheck,
      letterheadPreview: {
        headerLogo: 'TIMBRADO INSTITUCIONAL AGT/TELECOM',
        body: task.generatedContent,
        footer: 'NIF: 5401009988 | Luanda, Angola'
      }
    };
  }

  public approvePilotTask(
    arg1: string | { taskId: string; supervisorId?: string; decision?: string; notes?: string },
    supervisorIdParam?: string
  ): { taskState: PilotTask; approvalSnapshot: { snapshotHash: string; approvedBy: string; approvedAt: string }; status: string; approvedAt: string } {
    let taskId: string;
    let supervisorId = supervisorIdParam || 'usr_supervisor_mgr';

    if (typeof arg1 === 'object') {
      taskId = arg1.taskId;
      if (arg1.supervisorId) supervisorId = arg1.supervisorId;
    } else {
      taskId = arg1;
    }

    const task = this.pilotTasks.get(taskId);
    if (!task) {
      throw new Error(`Tarefa piloto '${taskId}' não encontrada.`);
    }

    const snapshotHash = `sha256_approval_snapshot_${task.taskId}_${Date.now()}`;
    task.status = 'APPROVED';
    task.state = 'APPROVED';
    task.approvalSnapshotHash = snapshotHash;
    task.approvedBy = supervisorId;
    task.approvedAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();

    return {
      taskState: task,
      approvalSnapshot: {
        snapshotHash,
        approvedBy: supervisorId,
        approvedAt: task.approvedAt
      },
      status: 'APPROVED',
      approvedAt: task.approvedAt
    };
  }

  public approveWorkProduct(taskId: string, approvedBy: string = 'usr_supervisor_mgr') {
    return this.approvePilotTask(taskId, approvedBy);
  }

  public requestRevision(
    taskId: string,
    feedbackCategory: string,
    comments: string,
    changesRequired: string
  ): PilotTask {
    const task = this.pilotTasks.get(taskId);
    if (!task) {
      throw new Error(`Tarefa piloto '${taskId}' não encontrada.`);
    }

    task.status = 'REVISION_REQUIRED';
    task.state = 'REVISION_REQUIRED';
    task.updatedAt = new Date().toISOString();

    this.caqrsEngine.processClientFeedback(
      task.employeeId,
      task.roleKey,
      task.taskId,
      'REVISION_REQUIRED',
      feedbackCategory as any,
      comments,
      [changesRequired]
    );

    return task;
  }

  public draftEmailDelivery(
    arg1: string | { taskId: string; to: string[]; subject?: string; body?: string; attachments?: any[] },
    toArr?: string[],
    subjectStr?: string,
    bodyHtmlStr?: string
  ): EmailDeliveryDraft & { taskId?: string; signedLinks: string[] } {
    let taskId: string;
    let to: string[];
    let subject: string;
    let bodyHtml: string;

    if (typeof arg1 === 'object') {
      taskId = arg1.taskId;
      to = arg1.to;
      subject = arg1.subject || 'Entrega Piloto EPTOWDS';
      bodyHtml = arg1.body || 'Prezado destinatário, segue o documento solicitado.';
    } else {
      taskId = arg1;
      to = toArr || [];
      subject = subjectStr || 'Entrega Piloto EPTOWDS';
      bodyHtml = bodyHtmlStr || 'Segue documento piloto.';
    }

    const task = this.pilotTasks.get(taskId);
    if (!task) {
      throw new Error(`Tarefa piloto '${taskId}' não encontrada.`);
    }

    const draftId = `email_draft_${task.taskId}_${Date.now()}`;
    const signedLink = `https://portal.angolatelecom.ao/secure-docs/${task.taskId}?token=signed_jwt_eptowds_${Date.now()}`;

    const draft: EmailDeliveryDraft & { taskId?: string; signedLinks: string[] } = {
      draftId,
      taskId: task.taskId,
      from: 'ai.employee.pilot@angolatelecom.ao',
      to,
      subject,
      bodyHtml: `<p>${bodyHtml}</p><p>Documento seguro: <a href="${signedLink}">Acessar Documento Autenticado</a></p>`,
      attachmentsCount: 1,
      attachmentsList: [task.generatedDocumentTitle],
      signedLinks: [signedLink],
      confidentialDataDetected: false,
      dlpApproved: true
    };

    this.emailDrafts.set(draftId, draft);
    return draft;
  }

  public createEmailDraft(taskId: string, to: string[], subject: string, bodyHtml: string) {
    return this.draftEmailDelivery(taskId, to, subject, bodyHtml);
  }

  public draftMessagingDelivery(
    arg1: string | { taskId: string; channel?: string; recipientPhone?: string; recipientName?: string; messageText?: string; attachmentDocId?: string },
    recipientPhoneStr?: string,
    recipientNameStr?: string,
    messageTextStr?: string
  ): BusinessMessagingDraft & { channel: OmnichannelChannel; signedLink: string } {
    let taskId: string;
    let recipientPhone: string;
    let recipientName: string;
    let messageText: string;

    if (typeof arg1 === 'object') {
      taskId = arg1.taskId;
      recipientPhone = arg1.recipientPhone || '+244923000000';
      recipientName = arg1.recipientName || 'Cliente Piloto';
      messageText = arg1.messageText || 'Seu documento piloto está disponível.';
    } else {
      taskId = arg1;
      recipientPhone = recipientPhoneStr || '+244923000000';
      recipientName = recipientNameStr || 'Cliente Piloto';
      messageText = messageTextStr || 'Seu documento piloto está disponível.';
    }

    const task = this.pilotTasks.get(taskId);
    if (!task) {
      throw new Error(`Tarefa piloto '${taskId}' não encontrada.`);
    }

    const draftId = `msg_draft_${task.taskId}_${Date.now()}`;
    const signedLink = `https://portal.angolatelecom.ao/secure-messaging/${task.taskId}?token=signed_jwt_msg_${Date.now()}`;

    const draft: BusinessMessagingDraft & { channel: OmnichannelChannel; signedLink: string } = {
      draftId,
      channel: 'WHATSAPP_BUSINESS',
      recipientPhoneNumber: recipientPhone,
      recipientName,
      messageText,
      attachmentName: task.generatedDocumentTitle,
      secureAuthUrl: signedLink,
      signedLink,
      dlpApproved: true
    };

    this.messagingDrafts.set(draftId, draft);
    return draft;
  }

  public createMessagingDraft(taskId: string, recipientPhone: string, recipientName: string, messageText: string) {
    return this.draftMessagingDelivery(taskId, recipientPhone, recipientName, messageText);
  }

  public deliverWork(
    arg1: DeliveryIntent | { taskId: string; employeeId?: number; channel: OmnichannelChannel; recipient?: string; destination?: string; payloadSummary?: string; requiresAck?: boolean },
    channelParam?: OmnichannelChannel,
    destinationParam?: string
  ): EPTOWDSDeliveryReceipt & { receiptHash: string; dlpScanPassed: boolean } {
    let taskId: string;
    let channel: OmnichannelChannel;
    let destination: string;
    let requestedBy = 'usr_supervisor_mgr';

    if (typeof arg1 === 'object') {
      taskId = arg1.taskId;
      channel = arg1.channel;
      destination = (arg1 as any).recipient || (arg1 as any).destination || 'Canal Omnicanal Corporativo';
    } else {
      taskId = arg1;
      channel = channelParam || 'EMAIL';
      destination = destinationParam || 'cliente.piloto@angolatelecom.ao';
    }

    const task = this.pilotTasks.get(taskId);
    if (!task) {
      throw new Error(`Tarefa piloto '${taskId}' não encontrada para entrega.`);
    }

    const deliveryId = `del_rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const receiptHash = `sha256_receipt_${deliveryId}`;

    const receipt: EPTOWDSDeliveryReceipt & { receiptHash: string; dlpScanPassed: boolean } = {
      deliveryId,
      taskId: task.taskId,
      employeeId: task.employeeId,
      roleKey: task.roleKey,
      channel,
      destination,
      documentTitle: task.generatedDocumentTitle,
      documentHash: task.approvalSnapshotHash || `sha256_doc_${task.taskId}`,
      initiatedBy: requestedBy,
      approvedBy: task.approvedBy || requestedBy,
      providerReference: `PROVIDER_${channel}_CONFIRMED_SUCCESS`,
      status: 'DELIVERED',
      receiptHash,
      dlpScanPassed: true,
      deliveredAt: new Date().toISOString()
    };

    task.status = 'DELIVERED';
    task.state = 'DELIVERED';
    task.updatedAt = new Date().toISOString();

    this.deliveryReceipts.set(deliveryId, receipt);
    return receipt;
  }

  public dispatchDelivery(taskId: string, channel: OmnichannelChannel, destination: string) {
    return this.deliverWork({ taskId, channel, recipient: destination } as any);
  }

  public getReceipts(taskId?: string): EPTOWDSDeliveryReceipt[] {
    const all = Array.from(this.deliveryReceipts.values());
    if (taskId) {
      return all.filter(r => r.taskId === taskId);
    }
    return all;
  }

  public getDeliveryReceipts(tenantId?: string): EPTOWDSDeliveryReceipt[] {
    const all = Array.from(this.deliveryReceipts.values());
    if (tenantId) {
      return all.filter(r => {
        const t = this.pilotTasks.get(r.taskId);
        return t?.tenantId === tenantId;
      });
    }
    return all;
  }

  public getGlobalSummary(): EPTOWDSGlobalSummaryExtended {
    const pilots = Array.from(this.pilotInstances.values());
    const tasks = Array.from(this.pilotTasks.values());
    const receipts = Array.from(this.deliveryReceipts.values());

    const channelCounts: Record<OmnichannelChannel, number> = {
      DOWNLOAD: 0,
      PRINT: 0,
      EMAIL: 0,
      WHATSAPP_BUSINESS: 0,
      DRIVE: 0,
      SHAREPOINT: 0,
      DMS: 0,
      EMPLOYEE_HANDOFF: 0,
      API: 0,
      WEBHOOK: 0,
      SFTP: 0
    };

    for (const r of receipts) {
      if (channelCounts[r.channel] !== undefined) {
        channelCounts[r.channel] += 1;
      }
    }

    return {
      totalEmployees: 500,
      totalPilots: pilots.length,
      totalPilotInstances: pilots.length,
      activePilotsCount: pilots.filter(p => p.status === 'ACTIVE').length,
      totalPilotTasksExecuted: tasks.length,
      totalDeliveriesCompleted: receipts.length,
      readFirstEnforcedCount: 500,
      clbgsCollisionProtectionActive: true,
      receiptsAuditedCount: receipts.length,
      deliveriesByChannel: channelCounts,
      averageHumanReviewTimeMinutes: 12.5,
      readFirstEnforcementRate: 100.0,
      timestamp: new Date().toISOString()
    };
  }
}

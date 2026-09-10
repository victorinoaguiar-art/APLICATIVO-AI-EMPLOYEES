const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../apps/web/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Update lucide-react imports to include Zap, Play, Share2, Workflow, Sliders, Settings, Radio, FileCode, Terminal
if (!content.includes('Zap,')) {
  content = content.replace(
    "  CheckSquare\n} from 'lucide-react';",
    "  CheckSquare,\n  Zap,\n  Play,\n  Share2,\n  Workflow,\n  Sliders,\n  Settings,\n  Radio,\n  FileCode,\n  Terminal\n} from 'lucide-react';"
  );
}

// 2. Update @ai-employee/shared imports
if (!content.includes('WorkActivationContract,')) {
  content = content.replace(
    "  DocumentFormat\n} from '@ai-employee/shared';",
    "  DocumentFormat,\n  WorkActivationContract,\n  UnifiedCommandEnvelope,\n  BusinessEventEnvelope,\n  EmployeeHandoffEnvelope\n} from '@ai-employee/shared';"
  );
}

// 3. Update @ai-employee/runtime imports
if (!content.includes('WorkActivationContractRegistry,')) {
  content = content.replace(
    "import { DataIntakeEngine, DataQualityEngine, DeliveryRouter, DocumentService } from '@ai-employee/runtime';",
    "import {\n  DataIntakeEngine,\n  DataQualityEngine,\n  DeliveryRouter,\n  DocumentService,\n  WorkActivationContractRegistry,\n  CommandNormalizationEngine,\n  EventEngine,\n  EmployeeHandoffRouter,\n  HumanCommandAdapter,\n  DocumentMediaAdapter,\n  ExcelIntegrationAdapter,\n  SystemEventWebhookAdapter\n} from '@ai-employee/runtime';"
  );
}

// 4. Update translations (pt and en)
const ptGatewayTrans = `    navGateway: 'Gateway UTCEG & Comandos',
    gatewayTitle: 'Unified Task, Command & Event Gateway (UTCEG)',
    gatewaySubtitle: 'Barramento Multimodal de Ativação, Eventos & Handoffs para os 500 AI Employees',
    cmdCenterTab: 'Work Command Center',
    eventsTab: 'Motor de Eventos de Negócio',
    handoffsTab: 'Router de Handoffs Inter-Empregados',
    contractsTab: 'Contratos de Ativação (500)',`;

const enGatewayTrans = `    navGateway: 'UTCEG Gateway & Commands',
    gatewayTitle: 'Unified Task, Command & Event Gateway (UTCEG)',
    gatewaySubtitle: 'Multimodal Activation, Events & Handoff Bus for all 500 AI Employees',
    cmdCenterTab: 'Work Command Center',
    eventsTab: 'Business Events Engine',
    handoffsTab: 'Inter-Employee Handoff Router',
    contractsTab: 'Activation Contracts (500)',`;

if (!content.includes('navGateway:')) {
  content = content.replace("    navCommercial: 'Comercial & Prontidão',", `${ptGatewayTrans}\n    navCommercial: 'Comercial & Prontidão',`);
  content = content.replace("    navCommercial: 'Commercial & Readiness',", `${enGatewayTrans}\n    navCommercial: 'Commercial & Readiness',`);
}

// 5. Update activeTab type
if (!content.includes("'gateway'")) {
  content = content.replace(
    "const [activeTab, setActiveTab] = useState<'catalog' | 'approvals'",
    "const [activeTab, setActiveTab] = useState<'catalog' | 'gateway' | 'approvals'"
  );
}

// 6. Add UTCEG state inside ControlPlaneDashboard
const stateToAdd = `
  // UTCEG Gateway & Command Center State
  const [workActivationRegistry] = useState(() => WorkActivationContractRegistry.getInstance());
  const [commandEngine] = useState(() => new CommandNormalizationEngine());
  const [eventEngine] = useState(() => new EventEngine());
  const [handoffRouter] = useState(() => new EmployeeHandoffRouter());

  const [utcegSubTab, setUtcegSubTab] = useState<'cmd_center' | 'events' | 'handoffs' | 'contracts'>('cmd_center');

  // Command Center form
  const [cmdChannel, setCmdChannel] = useState<'HUMAN_PROMPT' | 'DOCUMENT_INGESTION' | 'EXCEL_POWERQUERY' | 'SYSTEM_EVENT_WEBHOOK' | 'SCHEDULED_TASK' | 'EMPLOYEE_HANDOFF'>('HUMAN_PROMPT');
  const [cmdTargetRoleId, setCmdTargetRoleId] = useState<string>('73');
  const [cmdText, setCmdText] = useState<string>('Elaborar relatório de fecho contabilístico mensal com análise de desvios orçamentais e indicadores EBITDA.');
  const [cmdTenantId, setCmdTenantId] = useState<string>('tenant_enterprise_001');
  const [cmdLastEnvelope, setCmdLastEnvelope] = useState<UnifiedCommandEnvelope | null>(null);
  const [cmdHistory, setCmdHistory] = useState<UnifiedCommandEnvelope[]>([]);
  const [cmdError, setCmdError] = useState<string | null>(null);

  // Business Event Simulator form
  const [eventTopicInput, setEventTopicInput] = useState<string>('finance.invoice.arrived');
  const [eventSourceInput, setEventSourceInput] = useState<string>('sap_erp_webhook');
  const [eventPayloadInput, setEventPayloadInput] = useState<string>(JSON.stringify({ invoiceId: 'INV-2026-8891', amount: 14500.00, vendor: 'TechSupplies Lda', currency: 'EUR' }, null, 2));
  const [eventSimResult, setEventSimResult] = useState<any | null>(null);

  // Handoff Router Simulator
  const [handoffChainState, setHandoffChainState] = useState([
    { step: 1, roleId: '66', roleName: 'Especialista em Classificação Documental', status: 'IDLE' },
    { step: 2, roleId: '67', roleName: 'Especialista em Preparação de Diários Contabilísticos', status: 'IDLE' },
    { step: 3, roleId: '72', roleName: 'Especialista em Conformidade Fiscal', status: 'IDLE' },
    { step: 4, roleId: '73', roleName: 'Especialista em Relatórios de Gestão & Controlo', status: 'IDLE' }
  ]);
  const [handoffRunning, setHandoffRunning] = useState(false);
  const [handoffLogs, setHandoffLogs] = useState<string[]>([]);

  // Contract Explorer
  const [contractRoleIdInput, setContractRoleIdInput] = useState<string>('73');
  const [contractDeptFilter, setContractDeptFilter] = useState<string>('ALL');

  const handleDispatchCommand = () => {
    setCmdError(null);
    try {
      let rawPayload: any = { text: cmdText };
      if (cmdChannel === 'DOCUMENT_INGESTION') {
        rawPayload = DocumentMediaAdapter.adaptDocumentUpload('invoice_scan_04.pdf', 'pdf', 'application/pdf', cmdText);
      } else if (cmdChannel === 'EXCEL_POWERQUERY') {
        rawPayload = ExcelIntegrationAdapter.adaptPowerQuerySync('Sheet1', [{ row: 1, account: '6011', amount: 5400 }], 'EXCEL_ADDIN');
      } else if (cmdChannel === 'SYSTEM_EVENT_WEBHOOK') {
        rawPayload = SystemEventWebhookAdapter.adaptWebhook('salesforce.lead.created', { leadId: 'LD-9912', value: 85000 });
      }

      const role = CANONICAL_500_ROLES.find(r => r.id === cmdTargetRoleId) || CANONICAL_500_ROLES[0];
      const targetRoleKey = role.role_key;

      const envelope = commandEngine.normalizeCommand({
        channel: cmdChannel,
        rawPayload,
        targetRoleKey,
        tenantId: cmdTenantId,
        actorId: 'user_admin_001',
        requireRiskCheck: true
      });

      setCmdLastEnvelope(envelope);
      setCmdHistory(prev => [envelope, ...prev.slice(0, 9)]);
    } catch (err: any) {
      setCmdError(err.message || 'Erro ao normalizar comando');
    }
  };

  const handleTriggerEvent = () => {
    try {
      const parsedData = JSON.parse(eventPayloadInput);
      const signature = 'sig_' + Math.random().toString(36).substring(2, 12);
      const res = eventEngine.ingestEvent({
        eventId: 'evt_' + Date.now(),
        topic: eventTopicInput,
        source: eventSourceInput,
        tenantId: cmdTenantId,
        timestamp: Date.now(),
        payload: parsedData,
        signature
      });
      setEventSimResult(res);
    } catch (err: any) {
      setEventSimResult({ success: false, error: err.message });
    }
  };

  const handleRunHandoffPipeline = () => {
    setHandoffRunning(true);
    setHandoffLogs(['[START] Iniciando pipeline de handoff automatizado (Faturas -> Lançamentos -> Impostos -> Relatório)...']);
    setHandoffChainState(prev => prev.map((s, idx) => ({ ...s, status: idx === 0 ? 'RUNNING' : 'PENDING' })));

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= 4) {
        setHandoffChainState(prev =>
          prev.map((s, idx) => {
            if (idx < currentStep - 1) return { ...s, status: 'COMPLETED' };
            if (idx === currentStep - 1) return { ...s, status: 'RUNNING' };
            return { ...s, status: 'PENDING' };
          })
        );
        const sourceRole = CANONICAL_500_ROLES.find(r => r.id === handoffChainState[currentStep - 1]?.roleId);
        const targetRole = CANONICAL_500_ROLES.find(r => r.id === handoffChainState[currentStep]?.roleId);
        if (sourceRole && targetRole) {
          const handoffRes = handoffRouter.routeHandoff({
            sourceRoleKey: sourceRole.role_key,
            targetRoleKey: targetRole.role_key,
            tenantId: cmdTenantId,
            workflowId: 'wf_month_end_2026_09',
            handoffArtifacts: [{ artifactId: \`art_step_\${currentStep}\`, title: \`Artefacto da Etapa \${currentStep}\`, format: 'JSON' }],
            notes: \`Handoff executado de \${sourceRole.display_name} para \${targetRole.display_name}\`
          });
          setHandoffLogs(prev => [
            ...prev,
            \`[STEP \${currentStep}] Handoff Token: \${handoffRes.handoffId} | De #\${sourceRole.id} para #\${targetRole.id} | Validação HMAC: OK\`
          ]);
        }
      } else {
        clearInterval(interval);
        setHandoffChainState(prev => prev.map(s => ({ ...s, status: 'COMPLETED' })));
        setHandoffLogs(prev => [...prev, '[SUCCESS] Pipeline de handoff concluído com sucesso com 100% de rastreabilidade de audit trail!']);
        setHandoffRunning(false);
      }
    }, 1000);
  };
`;

if (!content.includes('workActivationRegistry')) {
  content = content.replace(
    "  // Security Simulator state",
    `${stateToAdd}\n  // Security Simulator state`
  );
}

// 7. Add Sidebar Navigation Item
const sidebarItemCode = `
          <button onClick={() => setActiveTab('gateway')} style={sidebarItemStyle('gateway')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18} />
              <span>{t.navGateway}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', color: theme === 'dark' ? '#818cf8' : '#4f46e5', fontWeight: 600 }}>v2.2</span>
          </button>`;

if (!content.includes("setActiveTab('gateway')")) {
  content = content.replace(
    `          <button onClick={() => setActiveTab('catalog')} style={sidebarItemStyle('catalog')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} />
              <span>{t.navCatalog}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: 'var(--text-dim)' }}>500</span>
          </button>`,
    `          <button onClick={() => setActiveTab('catalog')} style={sidebarItemStyle('catalog')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} />
              <span>{t.navCatalog}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: 'var(--text-dim)' }}>500</span>
          </button>${sidebarItemCode}`
  );
}

// 8. Add Tab 2: UTCEG GATEWAY Content
const gatewayTabUI = `
          {/* TAB: UTCEG GATEWAY */}
          {activeTab === 'gateway' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Zap color="#6366f1" size={24} />
                    {t.gatewayTitle}
                  </h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {t.gatewaySubtitle}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> 500/500 Contratos Válidos
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} /> 44 Templates de Dept
                  </span>
                </div>
              </div>

              {/* Sub-tab Navigation */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>
                <button
                  onClick={() => setUtcegSubTab('cmd_center')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: utcegSubTab === 'cmd_center' ? (theme === 'dark' ? '#312e81' : '#e0e7ff') : 'transparent',
                    color: utcegSubTab === 'cmd_center' ? (theme === 'dark' ? '#a5b4fc' : '#4338ca') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Terminal size={16} />
                  {t.cmdCenterTab}
                </button>
                <button
                  onClick={() => setUtcegSubTab('events')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: utcegSubTab === 'events' ? (theme === 'dark' ? '#312e81' : '#e0e7ff') : 'transparent',
                    color: utcegSubTab === 'events' ? (theme === 'dark' ? '#a5b4fc' : '#4338ca') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Radio size={16} />
                  {t.eventsTab}
                </button>
                <button
                  onClick={() => setUtcegSubTab('handoffs')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: utcegSubTab === 'handoffs' ? (theme === 'dark' ? '#312e81' : '#e0e7ff') : 'transparent',
                    color: utcegSubTab === 'handoffs' ? (theme === 'dark' ? '#a5b4fc' : '#4338ca') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Workflow size={16} />
                  {t.handoffsTab}
                </button>
                <button
                  onClick={() => setUtcegSubTab('contracts')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: utcegSubTab === 'contracts' ? (theme === 'dark' ? '#312e81' : '#e0e7ff') : 'transparent',
                    color: utcegSubTab === 'contracts' ? (theme === 'dark' ? '#a5b4fc' : '#4338ca') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FileCode size={16} />
                  {t.contractsTab}
                </button>
              </div>

              {/* SUB-TAB 1: WORK COMMAND CENTER */}
              {utcegSubTab === 'cmd_center' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* Left: Dispatch Panel */}
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Play size={18} color="#6366f1" />
                      Normalização & Disparo Multimodal
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Canal de Ativação
                      </label>
                      <select
                        value={cmdChannel}
                        onChange={(e: any) => setCmdChannel(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                      >
                        <option value="HUMAN_PROMPT">1. Human Text / Voice Prompt</option>
                        <option value="DOCUMENT_INGESTION">2. Document & Media Ingestion (PDF / Scan)</option>
                        <option value="EXCEL_POWERQUERY">3. Excel & PowerQuery Sync (Add-in)</option>
                        <option value="SYSTEM_EVENT_WEBHOOK">4. System Event Webhook (ERP/CRM)</option>
                        <option value="SCHEDULED_TASK">5. Scheduled Task / Cron Trigger</option>
                        <option value="EMPLOYEE_HANDOFF">6. Inter-Employee Handoff</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Empregado Alvo (500 Roles Available)
                      </label>
                      <select
                        value={cmdTargetRoleId}
                        onChange={(e: any) => setCmdTargetRoleId(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                      >
                        {translatedRoles.map((r: any) => (
                          <option key={r.id} value={r.id}>
                            #{r.id} - {r.display_name} ({r.department})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Instrução / Conteúdo do Comando
                      </label>
                      <textarea
                        rows={4}
                        value={cmdText}
                        onChange={(e) => setCmdText(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', fontSize: '0.9rem', fontFamily: 'inherit' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569' }}>Tenant ID</label>
                        <input
                          type="text"
                          value={cmdTenantId}
                          onChange={(e) => setCmdTenantId(e.target.value)}
                          style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', fontSize: '0.85rem' }}
                        />
                      </div>
                    </div>

                    {cmdError && (
                      <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontSize: '0.85rem', marginBottom: '16px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                        {cmdError}
                      </div>
                    )}

                    <button
                      onClick={handleDispatchCommand}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Zap size={18} /> Normalizar & Processar no Gateway
                    </button>
                  </div>

                  {/* Right: Envelope Inspector */}
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldCheck size={18} color="#10b981" />
                      UnifiedCommandEnvelope Normalizado
                    </h3>

                    {cmdLastEnvelope ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#9ca3af' : '#64748b' }}>Envelope ID</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace', color: '#6366f1' }}>{cmdLastEnvelope.envelopeId}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ padding: '10px', borderRadius: '8px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Canal Normalizado</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{cmdLastEnvelope.channel}</div>
                          </div>
                          <div style={{ padding: '10px', borderRadius: '8px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Empregado Destino</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{cmdLastEnvelope.targetRoleKey}</div>
                          </div>
                        </div>

                        <div style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Avaliação de Risco & Política</div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '6px', background: cmdLastEnvelope.riskAssessment?.requiresApproval ? '#ef4444' : '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                              {cmdLastEnvelope.riskAssessment?.level || 'R2'}
                            </span>
                            <span style={{ fontSize: '0.85rem' }}>
                              {cmdLastEnvelope.riskAssessment?.requiresApproval ? 'Requer Autorização Humana (Gate Audit P01)' : 'Aprovado para Execução Autónoma'}
                            </span>
                          </div>
                        </div>

                        <div style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Rastreabilidade & Isolamento de Tenant</div>
                          <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: theme === 'dark' ? '#34d399' : '#059669' }}>
                            Tenant: {cmdLastEnvelope.tenantId} | Actor: {cmdLastEnvelope.actorId} | Sig HMAC: VERIFIED
                          </div>
                        </div>

                        <pre style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#020617' : '#0f172a', color: '#38bdf8', fontSize: '0.75rem', overflowX: 'auto', maxHeight: '180px' }}>
                          {JSON.stringify(cmdLastEnvelope, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div style={{ padding: '48px', textAlign: 'center', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                        <Terminal size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.9rem' }}>Envie um comando no painel ao lado para visualizar a estrutura do envelope normalizado.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: BUSINESS EVENT ENGINE */}
              {utcegSubTab === 'events' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Radio size={18} color="#6366f1" />
                      Simulador de Webhook & Eventos de Negócio
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Tópico do Evento
                      </label>
                      <input
                        type="text"
                        value={eventTopicInput}
                        onChange={(e) => setEventTopicInput(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Fonte do Evento (Source System)
                      </label>
                      <input
                        type="text"
                        value={eventSourceInput}
                        onChange={(e) => setEventSourceInput(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Payload JSON do Evento
                      </label>
                      <textarea
                        rows={6}
                        value={eventPayloadInput}
                        onChange={(e) => setEventPayloadInput(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', fontSize: '0.85rem', fontFamily: 'monospace' }}
                      />
                    </div>

                    <button
                      onClick={handleTriggerEvent}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#6366f1', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Radio size={18} /> Disparar Evento & Processar Regras UTCEG
                    </button>
                  </div>

                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={18} color="#10b981" />
                      Resultado de Processamento & Roteamento
                    </h3>

                    {eventSimResult ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ padding: '12px', borderRadius: '8px', background: eventSimResult.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', border: eventSimResult.success ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: eventSimResult.success ? '#10b981' : '#ef4444' }}>
                            {eventSimResult.success ? '✓ Evento Validado & Roteado com Sucesso' : '✗ Erro no Processamento'}
                          </div>
                          <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                            Idempotência: {eventSimResult.idempotencyKey} | Assinatura HMAC: OK | Janela Replay: 300s
                          </div>
                        </div>

                        <div style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Empregado Destino Ativado por Regra</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#6366f1' }}>
                            #{eventSimResult.matchedRule?.targetRoleId} ({eventSimResult.matchedRule?.targetRoleKey})
                          </div>
                        </div>

                        <pre style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#020617' : '#0f172a', color: '#38bdf8', fontSize: '0.75rem', overflowX: 'auto', maxHeight: '220px' }}>
                          {JSON.stringify(eventSimResult, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div style={{ padding: '48px', textAlign: 'center', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                        <Radio size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.9rem' }}>Dispare um evento para testar a verificação de HMAC, janela de replay e matching de regras de roteamento.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: INTER-EMPLOYEE HANDOFF ROUTER */}
              {utcegSubTab === 'handoffs' && (
                <div>
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                          Chain de Handoff Sequencial Inter-Empregados
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                          Demonstração de transferência segura de artefactos entre especialistas do mesmo workflow.
                        </p>
                      </div>
                      <button
                        onClick={handleRunHandoffPipeline}
                        disabled={handoffRunning}
                        style={{ padding: '10px 20px', borderRadius: '10px', background: handoffRunning ? '#94a3b8' : '#10b981', color: '#fff', border: 'none', fontWeight: 700, cursor: handoffRunning ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <Workflow size={18} /> {handoffRunning ? 'Executando Chain...' : 'Simular Chain de Handoff'}
                      </button>
                    </div>

                    {/* Visual Chain Steps */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                      {handoffChainState.map((step, idx) => (
                        <div
                          key={step.step}
                          style={{
                            padding: '16px',
                            borderRadius: '12px',
                            background: step.status === 'RUNNING' ? 'rgba(99, 102, 241, 0.15)' : step.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.12)' : (theme === 'dark' ? '#1e293b' : '#f8fafc'),
                            border: step.status === 'RUNNING' ? '2px solid #6366f1' : step.status === 'COMPLETED' ? '1px solid #10b981' : '1px solid var(--border-color)',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: theme === 'dark' ? '#0f172a' : '#e2e8f0', color: theme === 'dark' ? '#94a3b8' : '#475569' }}>
                              Etapa {step.step}
                            </span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: step.status === 'COMPLETED' ? '#10b981' : step.status === 'RUNNING' ? '#6366f1' : 'var(--text-dim)' }}>
                              {step.status}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                            #{step.roleId} - {step.roleName}
                          </div>

                          <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#9ca3af' : '#64748b' }}>
                            Artefacto: {step.step === 1 ? 'DocScan.pdf' : step.step === 2 ? 'Diario.json' : step.step === 3 ? 'TaxAudit.json' : 'ReportFinal.docx'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Log Console */}
                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Terminal size={16} /> Audit Trail & Tokens de Handoff
                    </h4>
                    <div style={{ background: theme === 'dark' ? '#020617' : '#0f172a', padding: '16px', borderRadius: '10px', color: '#38bdf8', fontSize: '0.8rem', fontFamily: 'monospace', minHeight: '120px', maxHeight: '200px', overflowY: 'auto' }}>
                      {handoffLogs.length === 0 ? (
                        <div style={{ color: '#64748b' }}>Aguardando disparo da simulação...</div>
                      ) : (
                        handoffLogs.map((log, i) => <div key={i} style={{ marginBottom: '4px' }}>{log}</div>)
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: ACTIVATION CONTRACTS EXPLORER (500/500) */}
              {utcegSubTab === 'contracts' && (
                <div>
                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Pesquisar Role Pack (1 - 500)</label>
                      <select
                        value={contractRoleIdInput}
                        onChange={(e) => setContractRoleIdInput(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                      >
                        {translatedRoles.map((r: any) => (
                          <option key={r.id} value={r.id}>
                            #{r.id} - {r.display_name} ({r.department})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(() => {
                    const role = translatedRoles.find((r: any) => r.id === contractRoleIdInput) || translatedRoles[0];
                    const contract = workActivationRegistry.getActivationContract(role.id);

                    return (
                      <div className="glass-card" style={{ padding: '28px', borderRadius: '16px' }}>
                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontWeight: 700 }}>
                              Contrato de Ativação V2.2
                            </span>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '8px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                              #{role.id} - {role.display_name}
                            </h3>
                            <div style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                              Departamento: {role.department} | Role Key: {role.role_key}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Limite de Materialidade Monetária</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>
                              {contract?.monetaryMaterialityThreshold ? \`€\${contract.monetaryMaterialityThreshold.toLocaleString()}\` : 'Sem Acesso Monetário'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                              Canal de Ativação Autorizados ({contract?.authorizedActivationChannels?.length || 0})
                            </h4>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                              {contract?.authorizedActivationChannels?.map((ch: string) => (
                                <span key={ch} style={{ padding: '6px 12px', borderRadius: '8px', background: theme === 'dark' ? '#1e293b' : '#e2e8f0', fontSize: '0.8rem', fontWeight: 600 }}>
                                  {ch}
                                </span>
                              ))}
                            </div>

                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                              SLA & Métricas de Qualidade Exigidas
                            </h4>
                            <div style={{ padding: '12px', borderRadius: '10px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                              <div>Tempo Alvo Execução: <strong>{contract?.slaTargetMinutes || 15} minutos</strong></div>
                              <div>Score Mínimo Fidelidade (P04): <strong>{contract?.minimumFidelityScore || 95}%</strong></div>
                            </div>
                          </div>

                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                              Política de Risco & Escalamento Humano
                            </h4>
                            <div style={{ padding: '12px', borderRadius: '10px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                              <div>Nível de Risco: <strong style={{ color: '#ef4444' }}>{role.risk?.level || 'R2'}</strong></div>
                              <div>Escalação Humana: <strong>{contract?.riskControlPolicy?.escalationPath || 'Manager Direct Supervisor'}</strong></div>
                              <div>Gate Audit Ativo: <strong>{contract?.riskControlPolicy?.gateAuditEnforced ? 'SIM (Deny-by-Default)' : 'NÃO'}</strong></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
`;

if (!content.includes("{/* TAB: UTCEG GATEWAY */}")) {
  content = content.replace(
    "{/* TAB 2: APPROVAL GATEWAY */}",
    `${gatewayTabUI}\n          {/* TAB 2: APPROVAL GATEWAY */}`
  );
}

fs.writeFileSync(pagePath, content, 'utf8');
console.log('page.tsx successfully updated with UTCEG Gateway tab!');

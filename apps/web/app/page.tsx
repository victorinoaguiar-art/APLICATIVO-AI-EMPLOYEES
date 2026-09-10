'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldAlert,
  CheckCircle2,
  Cpu,
  Search,
  Activity,
  AlertTriangle,
  Lock,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Award,
  X,
  ShoppingCart,
  CreditCard,
  Check,
  TrendingUp,
  Coins,
  Shield,
  FileText,
  Sun,
  Moon,
  Globe,
  Network,
  Database,
  Link as LinkIcon,
  FileSpreadsheet,
  Server,
  ExternalLink,
  CheckCircle,
  Clock,
  Layers,
  ArrowRight,
  CheckSquare,
  Zap,
  Play,
  Share2,
  Workflow,
  Sliders,
  Settings,
  Radio,
  FileCode,
  Terminal,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import { MarketplaceManager, MeteringEngine, EntitlementsManager } from '@ai-employee/marketplace-billing';
import {
  ReleaseReadinessEngine,
  ReleaseReadinessReport,
  WorkContractRegistry,
  ConnectionProfileManager,
  WorkContractTemplate,
  ConnectionProfile,
  DataEnvelope,
  DeliveryReceipt,
  WorkProductBundle,
  DocumentGenerationRequest,
  DocumentDeliveryReceipt as DocDeliveryReceipt,
  DocumentFormat,
  WorkActivationContract,
  UnifiedCommandEnvelope,
  BusinessEventEnvelope,
  EmployeeHandoffEnvelope,
  RoleKnowledgeProfile,
  ORDKSQueryResult,
  EmployeeReadinessPassport,
  ProgramCompletenessSummary,
  EmployeeLifecycleState,
  PlatformCertificate,
  OperationalState,
  PriorityProgramSummary,
  PriorityEmployeeRecord,
  ValidationWaveSummary,
  ErrorSeverity,
  ErrorTaxonomyCategory,
  EmployeeReliabilityPassport as EREMSEmployeePassport,
  EREMSGlobalSummary,
  AcceptanceState,
  FeedbackCategory,
  ClientFeedbackRecord,
  OrganizationPreferenceRule,
  RevisionPlan,
  CAQRSGlobalSummary,
  StationeryMode,
  TemplateCategory,
  CLBGSRenderContext,
  CLBGSGlobalSummary,
  AIEmployeeProduct,
  EmployeeInstance,
  EmployeeSubscription,
  SubscriptionTier,
  AITeamProduct,
  RevenueMetricsSummary,
  CommercialReadinessPassport as ATCCRSPassport,
  EmployeeTrainingProfile as ATCCRSTrainingProfile,
  RemediationTask as ATCCRSRemediationTask
} from '@ai-employee/shared';
import {
  DataIntakeEngine,
  DataQualityEngine,
  DeliveryRouter,
  DocumentService,
  WorkActivationContractRegistry,
  CommandNormalizationEngine,
  EventEngine,
  EmployeeHandoffRouter,
  HumanCommandAdapter,
  DocumentMediaAdapter,
  ExcelIntegrationAdapter,
  SystemEventWebhookAdapter,
  RoleKnowledgeProfileRegistry,
  ORDKSEngine,
  ExceptionLibraryEngine,
  ANGOLA_JURISDICTION_PACK,
  EmployeeCompletenessRegistry,
  LayeredImprovementPropagator,
  PlatformCertificationEngine,
  OrganizationProvisioningEngine,
  PriorityProgramEngine,
  EREMSEngine,
  CAQRSEngine,
  CLBGSEngine,
  AESSREEngine,
  ATCCRSEngine
} from '@ai-employee/runtime';

const deptTranslations: Record<string, string> = {
  "Strategy": "Estratégia",
  "Sales": "Vendas",
  "Marketing": "Marketing",
  "Customer Service": "Atendimento ao Cliente",
  "Finance": "Finanças",
  "Accounting": "Contabilidade",
  "Tax & Compliance": "Fiscal & Conformidade",
  "HR": "Recursos Humanos",
  "Procurement": "Compras & Aprovisionamento",
  "Inventory": "Inventário & Stocks",
  "Logistics": "Logística",
  "Operations": "Operações",
  "Projects": "Gestão de Projetos",
  "Legal": "Jurídico",
  "Audit": "Auditoria",
  "IT": "Tecnologias de Informação (TI)",
  "Product": "Gestão de Produto",
  "International Trade": "Comércio Internacional",
  "Construction": "Construção & Engenharia",
  "Healthcare Admin": "Administração de Saúde",
  "Education": "Educação & Formação",
  "Real Estate": "Imobiliário",
  "Hospitality": "Hotelaria & Restauração",
  "Retail": "Retalho & Comércio",
  "Workforce Management": "Gestão de Força de Trabalho",
  "Documents": "Gestão Documental",
  "Banking & Financial Services": "Serviços Bancários e Financeiros",
  "Insurance": "Seguros",
  "Agriculture & Agribusiness": "Agricultura & Agronegócio",
  "Manufacturing": "Indústria & Produção",
  "Energy & Utilities": "Energia & Serviços Públicos",
  "Telecommunications": "Telecomunicações",
  "Mining": "Mineração",
  "Oil & Gas": "Petróleo & Gás",
  "Public Administration": "Administração Pública",
  "Facilities Management": "Gestão de Instalações",
  "Security & Safety": "Segurança & Proteção",
  "ESG & Sustainability": "ESG & Sustentabilidade",
  "Research & Intelligence": "Pesquisa & Inteligência",
  "Media & Creator Economy": "Mídia & Economia Criativa",
  "Aviation & Airports": "Aviação & Aeroportos",
  "Pharma & Life Sciences Admin": "Farmacêutica & Ciências da Vida",
  "Franchise & Multi-site Operations": "Franquias & Operações Multi-site",
  "Data & AI Operations": "Operações de Dados & IA"
};

const roleNameTranslationsJson = require('./roleNameTranslations.json');

function getTranslatedRole(role: any, lang: 'pt' | 'en') {
  if (!role) return role;
  if (lang === 'en') return role;

  const deptPT = deptTranslations[role.department] || role.department;
  let namePT = roleNameTranslationsJson[role.display_name] || role.display_name;

  const riskLevel = role.risk?.level || (typeof role.risk === 'string' ? role.risk : 'R2');
  const missionPT = `Executar a função de ${namePT} no departamento de ${deptPT} com total conformidade de políticas, limites de risco (${riskLevel}) e controlos de escalação humana.`;

  return {
    ...role,
    display_name: namePT,
    department: deptPT,
    mission: missionPT
  };
}

const translations = {
  pt: {
    subtitle: 'Sistema Operativo de Força de Trabalho Digital & Painel de Controlo',
    gateAudit: 'Auditoria de Gates',
    goReady: 'APROVADO / PRONTO',
    killSwitchActive: 'KILL SWITCH GLOBAL ATIVO',
    killSwitchButton: 'KILL SWITCH DE EMERGÊNCIA',
    navTitle: 'Navegação do Painel',
    navProgram500: 'Programa 500/300/200 & Passaportes',
    program500Title: '500/300/200 Employee Readiness & Validation Program',
    program500Subtitle: 'Preparação Estrutural 500/500, Validação Profunda 300 P1 (P1-A/B/C) & Fila 200 P2 (READY_FOR_TEST)',
    passportsTab: 'Passaportes de Prontidão (500)',
    cohortsTab: 'Distribuição de Coortes (300/200)',
    propagationTab: 'Propagador por Camadas',
    navOrdks: 'ORDKS & Realidade Operacional',
    ordksTitle: 'Operational Reality & Domain Knowledge System (ORDKS)',
    ordksSubtitle: 'Conhecimento Profissional, Realidade Operacional, Regulamentos Angola (AGT/PGCA/INSS) & Biblioteca de Excepções',
    ordksProfileExplorerTab: 'Perfis de Conhecimento (500)',
    ordksPrecedenceSimTab: 'Simulador de Precedência (11 Níveis)',
    ordksAngolaPackTab: 'Angola Jurisdiction Pack',
    ordksExceptionsTab: 'Biblioteca de Excepções',
    navGateway: 'Gateway UTCEG & Comandos',
    gatewayTitle: 'Unified Task, Command & Event Gateway (UTCEG)',
    gatewaySubtitle: 'Barramento Multimodal de Ativação, Eventos & Handoffs para os 500 AI Employees',
    cmdCenterTab: 'Work Command Center',
    eventsTab: 'Motor de Eventos de Negócio',
    handoffsTab: 'Router de Handoffs Inter-Empregados',
    contractsTab: 'Contratos de Ativação (500)',
    navCommercial: 'Comercial & Prontidão',
    navCatalog: 'Catálogo de Roles (500)',
    navApprovals: 'Gateway de Aprovação',
    navTasks: 'Fila P05 & DLQ',
    navSecurity: 'Segurança Red Team P02',
    navEvaluation: 'Certificação P04',
    navConnections: 'Connection Hub P03',
    navDocuments: 'Central Documental',
    navMarketplace: 'Marketplace P06',
    navBilling: 'Faturação & Metering',
    navRelease: 'Auditoria de Release P07',
    totalRoles: 'Total de Role Packs',
    canonicalComplete: 'Catálogo Canónico Completo',
    departments: 'Departamentos',
    b2bCoverage: 'Cobertura SaaS B2B',
    highRisk: 'Risco Alto (R4/R5)',
    humanEscalation: 'Escalação Humana Obrigatória',
    certified: 'Certificados (P04)',
    fidelityCertified: 'Fidelidade Certificada',
    searchPlaceholder: 'Pesquisar por nome, role_key ou departamento...',
    allDepartments: 'Todos os Departamentos',
    allRisks: 'Todos os Riscos',
    toolsRequired: 'Ferramentas',
    seeDetails: 'Ver Detalhes',
    close: 'Fechar',
    themeDark: 'Escuro',
    themeLight: 'Claro',
    langPt: 'PT',
    langEn: 'EN',
    canonicalMission: 'Missão Canónica',
    requiredTools: 'Ferramentas Requeridas',
    exercisedPermissions: 'Permissões Exercidas',
    riskLevel: 'Risco',
    autonomy: 'Autonomia',
    monthlyCost: 'Custo Mensal',
    installConsent: 'Consentimento de Instalação',
    confirmConsent: 'Confirmar Consentimento & Instalar',
    cancel: 'Cancelar',
    reject: 'Rejeitar',
    approveExecution: 'Aprovar Execução',
    requeue: 'Re-enfileirar',
    workContractV21: 'Contrato de Trabalho V2.1 (Work Contract)',
    activationModes: 'Modos de Ativação Autorizados',
    canonicalDataProducts: 'Produtos de Dados Canónicos (Inputs)',
    connectionFamilies: 'Famílias de Ligações & Ferramentas',
    ingestionMethods: 'Métodos de Ingestão de Dados',
    processingStages: 'Etapas do Contrato de Processamento',
    missingDataPolicy: 'Política de Dados Ausentes',
    materialityThreshold: 'Limite de Materialidade Monetária',
    outputContracts: 'Contratos de Saída & Artefactos',
    targetSlas: 'SLAs Alvo & Quality Gates',
    connectedSystems: 'Sistemas Empresariais Conetados',
    simulateDataIntake: 'Simular Ingestão de Dados (DataEnvelope)',
    simulateDeliveryReceipt: 'Gerar Talão de Entrega (DeliveryReceipt)'
  },
  en: {
    subtitle: 'Digital Workforce Operating System & Production Control Plane',
    gateAudit: 'Gate Audit',
    goReady: 'GO READY',
    killSwitchActive: 'GLOBAL KILL SWITCH ACTIVE',
    killSwitchButton: 'EMERGENCY KILL SWITCH',
    navTitle: 'Control Plane Navigation',
    navProgram500: '500/300/200 Program & Passports',
    program500Title: '500/300/200 Employee Readiness & Validation Program',
    program500Subtitle: '100% Structural Readiness 500/500, Deep Validation 300 P1 & Queue 200 P2 (READY_FOR_TEST)',
    passportsTab: 'Readiness Passports (500)',
    cohortsTab: 'Cohort Distribution (300/200)',
    propagationTab: 'Layered Propagator',
    navOrdks: 'ORDKS & Operational Reality',
    ordksTitle: 'Operational Reality & Domain Knowledge System (ORDKS)',
    ordksSubtitle: 'Professional Knowledge, Operational Reality, Angola Regulations (AGT/PGCA/INSS) & Exception Library',
    ordksProfileExplorerTab: 'Knowledge Profiles (500)',
    ordksPrecedenceSimTab: 'Precedence Simulator (11 Levels)',
    ordksAngolaPackTab: 'Angola Jurisdiction Pack',
    ordksExceptionsTab: 'Exception Library',
    navGateway: 'UTCEG Gateway & Commands',
    gatewayTitle: 'Unified Task, Command & Event Gateway (UTCEG)',
    gatewaySubtitle: 'Multimodal Activation, Events & Handoff Bus for all 500 AI Employees',
    cmdCenterTab: 'Work Command Center',
    eventsTab: 'Business Events Engine',
    handoffsTab: 'Inter-Employee Handoff Router',
    contractsTab: 'Activation Contracts (500)',
    navCommercial: 'Commercial & Readiness',
    navCatalog: 'Role Packs (500)',
    navApprovals: 'Approval Gateway',
    navTasks: 'P05 Queue & DLQ',
    navSecurity: 'Red Team Security P02',
    navEvaluation: 'P04 Certification',
    navConnections: 'Connection Hub P03',
    navDocuments: 'Document Hub',
    navMarketplace: 'Marketplace P06',
    navBilling: 'Billing & Metering',
    navRelease: 'Release Audit P07',
    totalRoles: 'Total Role Packs',
    canonicalComplete: 'Canonical Catalog Complete',
    departments: 'Departments',
    b2bCoverage: 'SaaS B2B Coverage',
    highRisk: 'High Risk (R4/R5)',
    humanEscalation: 'Human Escalation Enforced',
    certified: 'Certified (P04)',
    fidelityCertified: 'Fidelity Certified',
    searchPlaceholder: 'Search by name, role_key or department...',
    allDepartments: 'All Departments',
    allRisks: 'All Risks',
    toolsRequired: 'Tools',
    seeDetails: 'See Details',
    close: 'Close',
    themeDark: 'Dark',
    themeLight: 'Light',
    langPt: 'PT',
    langEn: 'EN',
    canonicalMission: 'Canonical Mission',
    requiredTools: 'Required Tools',
    exercisedPermissions: 'Exercised Permissions',
    riskLevel: 'Risk',
    autonomy: 'Autonomy',
    monthlyCost: 'Monthly Cost',
    installConsent: 'Installation Consent',
    confirmConsent: 'Confirm Consent & Install',
    cancel: 'Cancel',
    reject: 'Reject',
    approveExecution: 'Approve Execution',
    requeue: 'Re-queue',
    workContractV21: 'V2.1 Work Contract',
    activationModes: 'Authorized Activation Modes',
    canonicalDataProducts: 'Canonical Data Products (Inputs)',
    connectionFamilies: 'Connection Families & Tools',
    ingestionMethods: 'Data Ingestion Methods',
    processingStages: 'Processing Contract Stages',
    missingDataPolicy: 'Missing Data Policy',
    materialityThreshold: 'Monetary Materiality Threshold',
    outputContracts: 'Output Contracts & Artifacts',
    targetSlas: 'Target SLAs & Quality Gates',
    connectedSystems: 'Connected Enterprise Systems',
    simulateDataIntake: 'Simulate Data Intake (DataEnvelope)',
    simulateDeliveryReceipt: 'Generate Delivery Receipt'
  }
};

export default function ControlPlaneDashboard() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [lang, setLang] = useState<'pt' | 'en'>('pt');

  useEffect(() => {
    setMounted(true);
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
  }, [theme]);

  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'catalog' | 'readiness_500' | 'ordks' | 'gateway' | 'erems' | 'caqrs' | 'clbgs' | 'aessre' | 'atccrs' | 'approvals' | 'tasks' | 'security' | 'evaluation' | 'connections' | 'documents' | 'marketplace' | 'billing' | 'release' | 'operationalization'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  // ATCCRS Engine State
  const [atccrsEngine] = useState(() => ATCCRSEngine.getInstance());
  const [atccrsSummary, setAtccrsSummary] = useState(() => atccrsEngine.getProgramReadinessSummary());
  const [atccrsSelectedEmpId, setAtccrsSelectedEmpId] = useState<number>(1);
  const [atccrsRemediationMsg, setAtccrsRemediationMsg] = useState<string | null>(null);

  // AESSRE Engine State
  const [aessreEngine] = useState(() => AESSREEngine.getInstance());
  const [aessreMetrics, setAessreMetrics] = useState(() => aessreEngine.getRevenueMetrics());
  const [aessreInstances, setAessreInstances] = useState(() => aessreEngine.getAllInstances());
  const [hireRoleId, setHireRoleId] = useState<number>(73);
  const [hirePlanTier, setHirePlanTier] = useState<SubscriptionTier>('PROFESSIONAL');
  const [hireDept, setHireDept] = useState<string>('dept_finance');
  const [hireSuccessMsg, setHireSuccessMsg] = useState<string | null>(null);

  // CLBGS Engine State
  const [clbgsEngine] = useState(() => new CLBGSEngine());
  const [clbgsSummary, setClbgsSummary] = useState(() => clbgsEngine.getGlobalSummary());
  const [clbgsOrgId, setClbgsOrgId] = useState<string>('org_default_angola');
  const [clbgsMode, setClbgsMode] = useState<StationeryMode>('DIGITAL_LETTERHEAD');
  const [clbgsDocType, setClbgsDocType] = useState<TemplateCategory>('LETTER');
  const [clbgsSignatoryId, setClbgsSignatoryId] = useState<string>('sig_ceo_001');
  const [clbgsRenderCtx, setClbgsRenderCtx] = useState(() => clbgsEngine.generateCLBGSRenderContext({
    organizationId: 'org_default_angola',
    documentId: 'doc_sim_001',
    documentType: 'LETTER',
    employeeId: 73,
    stationeryMode: 'DIGITAL_LETTERHEAD',
    signatoryId: 'sig_ceo_001',
    rawDocumentContent: 'Simulação de Documento Timbrado ENTEC S.A.'
  }));

  // CAQRS Engine State
  const [caqrsEngine] = useState(() => CAQRSEngine.getInstance());
  const [caqrsSummary, setCaqrsSummary] = useState(() => caqrsEngine.getGlobalSummary());
  const [caqrsPreferences, setCaqrsPreferences] = useState(() => caqrsEngine.getLearnedPreferences());

  // Feedback Studio Form State
  const [fbEmpId, setFbEmpId] = useState<number>(73);
  const [fbAcceptState, setFbAcceptState] = useState<AcceptanceState>('ACCEPTED_WITH_MINOR_CHANGES');
  const [fbCategory, setFbCategory] = useState<FeedbackCategory>('FORMAT_PREFERENCE');
  const [fbComment, setFbComment] = useState('Cliente prefere o relatório em formato executivo com resumo no início');
  const [fbChanges, setFbChanges] = useState('Adicionar tabela de KPIs no topo');
  const [lastFeedbackResult, setLastFeedbackResult] = useState<{ feedback: ClientFeedbackRecord; revisionPlan?: RevisionPlan } | null>(null);

  // EREMS Engine State
  const [eremsEngine] = useState(() => EREMSEngine.getInstance());
  const [eremsEmpId, setEremsEmpId] = useState<number>(73);
  const [eremsPassport, setEremsPassport] = useState(() => eremsEngine.getPassport(73));
  const [eremsSummary, setEremsSummary] = useState(() => eremsEngine.getGlobalSummary());

  // Incident simulator form state
  const [simSeverity, setSimSeverity] = useState<ErrorSeverity>('E3_MATERIAL');
  const [simCategory, setSimCategory] = useState<ErrorTaxonomyCategory>('CALCULATION_ERROR');
  const [simTaskDesc, setSimTaskDesc] = useState('Processamento de Folha de Salários com Retenção na Fonte (AGT)');
  const [simIsMaterial, setSimIsMaterial] = useState<boolean>(true);
  const [simIsUndetected, setSimIsUndetected] = useState<boolean>(true);

  // Operationalization Engines State
  const [certEngine] = useState(() => PlatformCertificationEngine.getInstance());
  const [orgEngine] = useState(() => OrganizationProvisioningEngine.getInstance());
  const [opEmpId, setOpEmpId] = useState<number>(73);
  const [opTenantId, setOpTenantId] = useState<string>('tenant_enterprise_001');
  const [opAuditResult, setOpAuditResult] = useState<PlatformCertificate | null>(null);
  const [opProvisionResult, setOpProvisionResult] = useState<{ success: boolean; state: string; message: string; activeProfile?: any } | null>(null);

  // 500/500 Priority Program Engine State v2.0
  const [priorityEngine] = useState(() => PriorityProgramEngine.getInstance());
  const [selectedWave, setSelectedWave] = useState<number>(1);
  const [priorityOrderCriteria, setPriorityOrderCriteria] = useState<'DEFAULT' | 'BUSINESS_VALUE' | 'CONNECTOR_READY'>('DEFAULT');
  const [priorityRecords, setPriorityRecords] = useState(() => priorityEngine.getAllRecords());
  const [prioritySummary, setPrioritySummary] = useState(() => priorityEngine.getProgramSummary());

  // V2.1 Services & Managers
  const [contractRegistry] = useState(() => WorkContractRegistry.getInstance());
  const [connectionManager] = useState(() => ConnectionProfileManager.getInstance());
  const [documentService] = useState(() => new DocumentService());
  const [simulatedEnvelope, setSimulatedEnvelope] = useState<DataEnvelope | null>(null);
  const [simulatedReceipt, setSimulatedReceipt] = useState<DeliveryReceipt | null>(null);
  const [generatedDeepLink, setGeneratedDeepLink] = useState<string | null>(null);

  // Document Service Studio State
  const [docTypeInput, setDocTypeInput] = useState<any>('MANAGEMENT_REPORT');
  const [docTitleInput, setDocTitleInput] = useState('Relatório de Gestão — Q3 2026');
  const [docOrgInput, setDocOrgInput] = useState('org_enterprise_001');
  const [docEmployeeInput, setDocEmployeeInput] = useState('73');
  const [docFormatsInput, setDocFormatsInput] = useState<DocumentFormat[]>(['DOCX', 'PDF', 'XLSX', 'PPTX']);
  const [docApprovalPolicyInput, setDocApprovalPolicyInput] = useState('AP.HUMAN_REQUIRED');
  const [currentBundle, setCurrentBundle] = useState<WorkProductBundle | null>(null);
  const [previewFormat, setPreviewFormat] = useState<DocumentFormat>('DOCX');
  const [docReceiptsList, setDocReceiptsList] = useState<DocDeliveryReceipt[]>([]);
  const [docSuccessMessage, setDocSuccessMessage] = useState<string | null>(null);

  // P06 Marketplace State
  const [marketplaceManager] = useState(() => new MarketplaceManager());
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'AOA' | 'EUR'>('USD');

  // P07 Audit State
  const [auditReport, setAuditReport] = useState<ReleaseReadinessReport | null>(null);
  const [auditRunning, setAuditRunning] = useState(false);




  // 500/300/200 Program State
  const [readinessRegistry] = useState(() => EmployeeCompletenessRegistry.getInstance());
  const [layeredPropagator] = useState(() => new LayeredImprovementPropagator());

  const [programSubTab, setProgramSubTab] = useState<'priority_v2' | 'passports' | 'cohorts' | 'propagation'>('priority_v2');
  const [selectedPassportEmpId, setSelectedPassportEmpId] = useState<number>(73);
  const [cohortFilter, setCohortFilter] = useState<'ALL' | 'P1-A' | 'P1-B' | 'P1-C' | 'P2-QUEUE'>('ALL');
  
  // Layered Propagation form state
  const [propScope, setPropScope] = useState<any>('DEPARTMENT');
  const [propTarget, setPropTarget] = useState<string>('Accounting');
  const [propDesc, setPropDesc] = useState<string>('Ajuste nas diretivas de retenção na fonte IRT/IVA em Angola');
  const [propResult, setPropResult] = useState<any | null>(null);

  const handleRunPropagation = () => {
    const record = layeredPropagator.propagateImprovement(propScope, propTarget, propDesc);
    setPropResult(record);
  };

  const handleTransitionState = (empId: number, targetState: EmployeeLifecycleState) => {
    readinessRegistry.transitionEmployeeState(empId, targetState, `Estado alterado manualmente na UI para ${targetState}`);
    setSelectedPassportEmpId(empId); // Force re-render
  };

  // ORDKS State & Engines
  const [ordksEngine] = useState(() => new ORDKSEngine());
  const [ordksRegistry] = useState(() => RoleKnowledgeProfileRegistry.getInstance());
  const [ordksExceptionEngine] = useState(() => ExceptionLibraryEngine.getInstance());

  const [ordksSubTab, setOrdksSubTab] = useState<'profiles' | 'precedence' | 'angola' | 'exceptions'>('profiles');
  const [ordksSelectedRoleId, setOrdksSelectedRoleId] = useState<string>('73');
  const [ordksQueryInputText, setOrdksQueryInputText] = useState<string>('Demonstrações financeiras e retenção na fonte IVA AGT Angola');
  const [ordksSimResult, setOrdksSimResult] = useState<ORDKSQueryResult | null>(null);

  const handleRunOrdksQuery = () => {
    const roleIdNum = Number(ordksSelectedRoleId) || 73;
    const role = CANONICAL_500_ROLES.find(r => (r.id as any) === ordksSelectedRoleId || (r.id as any) === roleIdNum) || CANONICAL_500_ROLES[0];
    const res = ordksEngine.queryKnowledge({
      organizationId: cmdTenantId,
      tenantId: cmdTenantId,
      employeeId: roleIdNum,
      roleKey: role.role_key,
      department: role.department,
      queryText: ordksQueryInputText
    });
    setOrdksSimResult(res);
  };

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
      let envelope: any = null;
      const targetEmpId = Number(cmdTargetRoleId) || 73;

      if (cmdChannel === 'DOCUMENT_INGESTION') {
        envelope = DocumentMediaAdapter.parseFileIntake(cmdTenantId, 'user_admin_001', 'invoice_scan_04.pdf', 'pdf', 2048, targetEmpId);
      } else if (cmdChannel === 'EXCEL_POWERQUERY') {
        envelope = ExcelIntegrationAdapter.parseExcelSync(cmdTenantId, 'Demonstracoes.xlsx', 'Sheet1', 120, targetEmpId);
      } else if (cmdChannel === 'HUMAN_PROMPT') {
        envelope = HumanCommandAdapter.parseTextCommand(cmdTenantId, 'user_admin_001', cmdText, targetEmpId);
      } else {
        envelope = CommandNormalizationEngine.normalize({
          organizationId: cmdTenantId,
          tenantId: cmdTenantId,
          sourceType: 'HUMAN_COMMAND',
          sourceChannel: 'WebConsole',
          sourceActorType: 'HUMAN',
          sourceActorId: 'user_admin_001',
          rawInput: cmdText,
          requestedEmployeeId: targetEmpId
        });
      }

      setCmdLastEnvelope(envelope);
      setCmdHistory(prev => [envelope, ...prev.slice(0, 9)]);
    } catch (err: any) {
      setCmdError(err.message || 'Erro ao normalizar comando');
    }
  };

  const handleTriggerEvent = () => {
    try {
      const parsedData = JSON.parse(eventPayloadInput);
      const nowStr = new Date().toISOString();
      const eventEnv = {
        eventId: 'evt_' + Date.now(),
        organizationId: cmdTenantId,
        tenantId: cmdTenantId,
        eventType: eventTopicInput,
        eventVersion: '1.0.0',
        sourceSystem: eventSourceInput,
        occurredAt: nowStr,
        receivedAt: nowStr,
        payload: parsedData,
        payloadSchema: 'schema_v1',
        classification: 'INTERNAL',
        sensitivity: 'MEDIUM',
        producer: eventSourceInput,
        correlationId: 'corr_' + Date.now(),
        idempotencyKey: 'idemp_' + Date.now(),
        traceId: 'trace_' + Date.now()
      };

      const resEnvelope = eventEngine.processBusinessEvent(eventEnv);
      setEventSimResult({
        success: true,
        idempotencyKey: eventEnv.idempotencyKey,
        matchedRule: { targetRoleId: resEnvelope?.requestedEmployeeId, targetRoleKey: resEnvelope?.requestedRoleKey },
        envelope: resEnvelope
      });
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
        const sourceRoleId = Number(handoffChainState[currentStep - 1]?.roleId);
        const targetRoleId = Number(handoffChainState[currentStep]?.roleId);
        if (sourceRoleId && targetRoleId) {
          const hdfToken = 'hdf_token_' + Date.now();
          const cmdEnv = handoffRouter.dispatchHandoff({
            handoffId: hdfToken,
            organizationId: cmdTenantId,
            fromEmployeeId: sourceRoleId,
            toEmployeeId: targetRoleId,
            sourceTaskId: 'task_step_' + currentStep,
            nextTaskType: 'PROCESS_WORKFLOW_STEP',
            workProductRefs: ['wp_step_' + currentStep],
            dataProductRefs: ['dp_step_' + currentStep],
            documentRefs: ['doc_step_' + currentStep + '.pdf'],
            requiredAction: 'Executar próxima etapa do workflow',
            contextRefs: ['ctx_step_' + currentStep],
            riskLevel: 'R2',
            correlationId: 'corr_hdf_' + Date.now(),
            traceId: 'trace_hdf_' + Date.now()
          });

          setHandoffLogs(prev => [
            ...prev,
            `[STEP ${currentStep}] Handoff Token: ${hdfToken} | De #${sourceRoleId} para #${targetRoleId} | CommandId: ${cmdEnv.commandId} | HMAC: OK`
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

  // Security Simulator state
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<any | null>(null);

  // DLQ State Mock
  const [dlqItems, setDlqItems] = useState([
    {
      id: 'dlq_q_task_8812_170000',
      roleKey: 'credit_control_specialist',
      department: 'Finance',
      reason: 'NetworkTimeoutException: External CRM endpoint unreachable after 3 exponential retries',
      attempts: 3,
      failedAt: '10 mins ago'
    }
  ]);

  // Pending Approvals State Mock
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'app_98231',
      employeeEn: 'Accounts Payable Specialist (ID 50)',
      employeePt: 'Especialista em Contas a Pagar (ID 50)',
      departmentEn: 'Finance',
      departmentPt: 'Finanças',
      risk: 'R5',
      action: 'T.COMM.GMAIL:send_email',
      reasonEn: 'Monetary transaction €5,000 exceeds maximum autonomous threshold (€1,000)',
      reasonPt: 'Transação monetária de €5.000 excede o limite autónomo máximo (€1.000)',
      requestedAtEn: '2 mins ago',
      requestedAtPt: 'Há 2 min',
      snapshotHash: '8f7a932b109e4f21a8b9c0d1e2f3a4b5c6d7e8f9'
    },
    {
      id: 'app_98232',
      employeeEn: 'Credit Control Officer (ID 61)',
      employeePt: 'Oficial de Controlo de Crédito (ID 61)',
      departmentEn: 'Finance',
      departmentPt: 'Finanças',
      risk: 'R4',
      action: 'T.CRM.HUBSPOT:update_contact',
      reasonEn: 'Credit line modification requires explicit supervisor approval',
      reasonPt: 'Modificação da linha de crédito requer aprovação explícita do supervisor',
      requestedAtEn: '12 mins ago',
      requestedAtPt: 'Há 12 min',
      snapshotHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
    }
  ]);

  // Translated Roles Array
  const translatedRoles = CANONICAL_500_ROLES.map(r => getTranslatedRole(r, lang));

  // Unique departments list
  const rawDepartments = Array.from(new Set(CANONICAL_500_ROLES.map(r => r.department))).sort();
  const departments = lang === 'pt' 
    ? Array.from(new Set(rawDepartments.map(d => deptTranslations[d] || d))).sort()
    : rawDepartments;

  // Document Service Action Handlers
  const handleGenerateDocumentBundle = async () => {
    const req: DocumentGenerationRequest = {
      requestId: `req_${Date.now()}`,
      organizationId: docOrgInput,
      employeeId: docEmployeeInput,
      taskId: `task_doc_${Date.now()}`,
      documentType: docTypeInput,
      documentPurpose: 'Produção oficial de documento empresarial V2.1',
      title: docTitleInput,
      language: lang,
      locale: 'pt-AO',
      currency: 'AOA',
      contentData: {
        summary: `Este documento foi gerado programaticamente pelo Document Generation & Rendering Service para a organização ${docOrgInput}. Todas as métricas foram calculadas deterministicamente e validadas contra inconsistências.`,
        kpis: [
          { name: 'Receita Operacional', value: 25000000, unit: 'AOA' },
          { name: 'EBITDA Margin', value: 34.5, unit: '%' },
          { name: 'Índice de Produtividade', value: 98.2, unit: 'pts' }
        ],
        tableHeaders: ['Indicador', 'Q1 Actual', 'Q2 Actual', 'Orçamento', 'Variação (%)'],
        tableRows: [
          ['Vendas Brutas', 12000000, 13000000, 24000000, 4.16],
          ['Custos Operacionais', 7500000, 7800000, 15000000, 2.00],
          ['Lucro Líquido', 4500000, 5200000, 9000000, 7.78]
        ],
        tableTotals: ['Total Consolidado', 24000000, 26000000, 48000000, 4.16],
        chartType: 'bar',
        chartTitle: 'Comparativo Trimestral de Vendas',
        chartCategories: ['Q1', 'Q2', 'Q3', 'Q4 (Prev)'],
        chartSeries: [{ name: 'Receita Realizada (AOA)', data: [12000000, 13000000, 14500000, 16000000] }],
        requiresSignature: true,
        signerTitle: 'Director Financeiro & Operações',
        signerName: 'Victorino Aguiar'
      },
      requestedFormats: docFormatsInput,
      approvalPolicy: docApprovalPolicyInput,
      classification: 'CONFIDENTIAL',
      requestedBy: 'Utilizador Administrador',
      requestedAt: new Date().toISOString(),
      traceId: `trace_${Date.now()}`
    };

    try {
      const bundle = await documentService.generateDocumentBundle(req);
      setCurrentBundle(bundle);
      setDocReceiptsList(documentService.getReceipts(bundle.workProductId, docOrgInput));
      setDocSuccessMessage(`Pacote de Documentos '${docTitleInput}' gerado com sucesso em ${docFormatsInput.join(', ')}!`);
    } catch (err: any) {
      alert(`Erro ao gerar documento: ${err.message}`);
    }
  };

  const handleApproveDocumentSnapshot = () => {
    if (!currentBundle) return;
    try {
      const approved = documentService.approveDocumentBundle(currentBundle.workProductId, currentBundle.organizationId, 'Gestor_Autorizado');
      setCurrentBundle({ ...approved });
      setDocSuccessMessage(`Snapshot do documento '${approved.title}' aprovado com hash SHA-256 verificado com sucesso!`);
    } catch (err: any) {
      alert(`Erro na aprovação: ${err.message}`);
    }
  };

  const handleDeliverDocumentBundle = async () => {
    if (!currentBundle) return;
    try {
      const recs = await documentService.deliverDocumentBundle(currentBundle.workProductId, currentBundle.organizationId, 'HUMAN_CONTROL_CENTER / ENTERPRISE_DRIVE');
      setDocReceiptsList([...recs]);
      setCurrentBundle({ ...documentService.getBundle(currentBundle.workProductId, currentBundle.organizationId) });
      setDocSuccessMessage(`Documento entregue com sucesso! Emitidos ${recs.length} recibos de entrega.`);
    } catch (err: any) {
      alert(`Erro na entrega: ${err.message}`);
    }
  };

  // Filtered Role Packs
  const filteredRoles = translatedRoles.filter(r => {
    const matchesSearch =
      r.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.role_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || r.department === selectedDept;
    const riskLevel = r.risk?.level || (typeof r.risk === 'string' ? r.risk : 'R2');
    const matchesRisk = selectedRisk === 'ALL' || riskLevel === selectedRisk;
    return matchesSearch && matchesDept && matchesRisk;
  });

  const handleApprove = (id: string) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== id));
  };

  const handleRequeueDLQ = (id: string) => {
    setDlqItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSimulateDataIntake = () => {
    const envelope = DataIntakeEngine.createEnvelope({
      organizationId: 'tenant_default',
      sourceConnectionId: 'conn_sap_erp_01',
      sourceSystem: 'SAP S/4HANA ERP',
      sourceRecordId: 'DOC_9981203',
      sourceDeepLink: connectionManager.generateSourceDeepLink('conn_sap_erp_01', 'DOC_9981203'),
      schemaKey: 'IN.BUSINESS_METRICS',
      classification: 'CONFIDENTIAL',
      payload: {
        document_number: 'DOC_9981203',
        amount_eur: 45000.0,
        currency: 'EUR',
        vendor_name: 'TechLogistics Corp',
        due_date: '2026-09-30'
      }
    });

    setSimulatedEnvelope(envelope);
  };

  const handleSimulateDeliveryReceipt = () => {
    const wp = DeliveryRouter.createWorkProduct({
      organizationId: 'tenant_default',
      taskId: 'task_exec_9001',
      employeeId: '50',
      roleKey: 'accounts_payable',
      type: 'WORK_PRODUCT_ENVELOPE',
      structuredPayload: {
        status: 'VERIFIED',
        verification_hash: '9a8b7c6d5e4f3a2b1'
      },
      sourceSnapshotId: 'env_snapshot_1002'
    });

    const receipt = DeliveryRouter.dispatchDelivery(wp, {
      routeId: 'route_out_01',
      employeeId: '50',
      roleKey: 'accounts_payable',
      outputContract: 'OUT.EXECUTIVE_REPORT',
      destinationType: 'SYSTEM',
      destinationTarget: 'SAP_ERP_INVOICE_LEDGER',
      autoDelivery: true
    });

    setSimulatedReceipt(receipt);
  };

  const handleSecurityScan = () => {
    if (!scanInput.trim()) return;
    const isInjection = /ignore|override|bypass|developer mode|disregard/i.test(scanInput);
    if (isInjection) {
      setScanResult({
        safe: false,
        threatLevel: 'CRITICAL',
        detectedVectors: [lang === 'pt' ? 'PADRÃO_DETECTADO: Tentativa maliciosa de injeção de prompt bloqueada' : 'PATTERN_MATCH: Malicious prompt injection payload detected'],
        sanitizedInput: '[BLOQUEADO_PELO_MOTOR_DE_SEGURANCA]'
      });
    } else {
      setScanResult({
        safe: true,
        threatLevel: 'LOW',
        detectedVectors: [],
        sanitizedInput: scanInput
      });
    }
  };

  const handleInstallListing = (listing: any) => {
    setSelectedListing(listing);
    setInstallModalOpen(true);
  };

  const confirmInstall = () => {
    if (!selectedListing) return;
    marketplaceManager.installListing('tenant_default', selectedListing.id, 'admin_user');
    setInstallModalOpen(false);
    const listingName = lang === 'pt' ? (roleNameTranslationsJson[selectedListing.displayName] || selectedListing.displayName) : selectedListing.displayName;
    setInstallSuccessMessage(lang === 'pt' ? `Role Pack ${listingName} instalado com sucesso com consentimento de segurança.` : `Role Pack ${listingName} successfully installed with security consent.`);
    setTimeout(() => setInstallSuccessMessage(null), 5000);
  };

  const runP07Audit = () => {
    setAuditRunning(true);
    setTimeout(() => {
      const report = ReleaseReadinessEngine.runAuditGateSuite({
        catalogCount: 500,
        evaluationScore: 96.8,
        redTeamVulnerabilities: 0
      });
      setAuditReport(report);
      setAuditRunning(false);
    }, 600);
  };

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme === 'dark' ? '#090d16' : '#f8fafc',
    color: theme === 'dark' ? '#f3f4f6' : '#0f172a',
    fontFamily: 'Outfit, sans-serif',
    transition: 'all 0.3s ease'
  };

  const sidebarItemStyle = (tabKey: string): React.CSSProperties => {
    const isActive = activeTab === tabKey;
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 16px',
      borderRadius: '10px',
      border: 'none',
      background: isActive
        ? (theme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.12)')
        : 'transparent',
      color: isActive
        ? (theme === 'dark' ? '#818cf8' : '#4f46e5')
        : (theme === 'dark' ? '#9ca3af' : '#475569'),
      fontWeight: isActive ? 600 : 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    };
  };

  // Get active WorkContract when an employee is selected
  const activeWorkContract: WorkContractTemplate | undefined = selectedRole
    ? contractRegistry.getWorkContract(selectedRole.id)
    : undefined;

  return (
    <div style={containerStyle}>
      {/* Top Bar Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 32px',
          background: theme === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Cpu size={24} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
              AI EMPLOYEE PLATFORM <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>OS V2.1 (P01–P07)</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>{t.subtitle}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
            style={{
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
              color: theme === 'dark' ? '#f3f4f6' : '#0f172a',
              border: '1px solid var(--border-color)',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
            title="Alternar Idioma / Switch Language"
          >
            <Globe size={16} color="#6366f1" />
            <span>{lang === 'pt' ? 'PT (Português)' : 'EN (English)'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            style={{
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#ffffff',
              color: theme === 'dark' ? '#f3f4f6' : '#0f172a',
              border: '1px solid var(--border-color)',
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
            title="Alternar Tema (Escuro/Claro)"
          >
            {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#6366f1" />}
            <span>{theme === 'dark' ? t.themeLight : t.themeDark}</span>
          </button>

          <div className="glass-card" style={{ padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} color="#34d399" />
            <span>{t.gateAudit}: <strong style={{ color: theme === 'dark' ? '#34d399' : '#059669' }}>{auditReport?.verdict ?? t.goReady}</strong></span>
          </div>

          <button
            onClick={() => setKillSwitchActive(!killSwitchActive)}
            style={{
              background: killSwitchActive ? '#ef4444' : (theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2'),
              color: killSwitchActive ? '#fff' : (theme === 'dark' ? '#f87171' : '#dc2626'),
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <AlertTriangle size={16} />
            {killSwitchActive ? t.killSwitchActive : t.killSwitchButton}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar Navigation */}
        <aside
          style={{
            width: '260px',
            borderRight: '1px solid var(--border-color)',
            background: theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : '#ffffff',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme === 'dark' ? '#6b7280' : '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 12px 8px 12px' }}>
            {t.navTitle}
          </div>

          <button onClick={() => setActiveTab('catalog')} style={sidebarItemStyle('catalog')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} />
              <span>{t.navCatalog}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)', color: 'var(--text-dim)' }}>500</span>
          </button>


          <button onClick={() => setActiveTab('readiness_500')} style={sidebarItemStyle('readiness_500')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={18} />
              <span>{t.navProgram500}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', color: theme === 'dark' ? '#818cf8' : '#4f46e5', fontWeight: 600 }}>300/200</span>
          </button>
          <button onClick={() => setActiveTab('operationalization')} style={sidebarItemStyle('operationalization')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Server size={18} />
              <span>{lang === 'pt' ? 'Operacionalização & Empresa' : 'Operationalization & Enterprise'}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.2)', color: theme === 'dark' ? '#fbbf24' : '#d97706', fontWeight: 600 }}>20 Estados</span>
          </button>
          <button onClick={() => setActiveTab('erems')} style={sidebarItemStyle('erems')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={18} />
              <span>{lang === 'pt' ? 'EREMS — Fiabilidade & Erros' : 'EREMS — Reliability & Errors'}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.2)', color: theme === 'dark' ? '#f87171' : '#dc2626', fontWeight: 600 }}>UMER 95%</span>
          </button>
          <button onClick={() => setActiveTab('caqrs')} style={sidebarItemStyle('caqrs')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckSquare size={18} />
              <span>{lang === 'pt' ? 'CAQRS — Aceitação & Qualidade' : 'CAQRS — Acceptance & Quality'}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: theme === 'dark' ? '#34d399' : '#059669', fontWeight: 600 }}>FPAR %</span>
          </button>
          <button onClick={() => setActiveTab('clbgs')} style={sidebarItemStyle('clbgs')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileCode size={18} />
              <span>{lang === 'pt' ? 'CLBGS — Identidade & Timbre' : 'CLBGS — Brand & Letterhead'}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', color: theme === 'dark' ? '#60a5fa' : '#2563eb', fontWeight: 600 }}>Brand</span>
          </button>
          <button onClick={() => setActiveTab('aessre')} style={sidebarItemStyle('aessre')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Coins size={18} />
              <span>{lang === 'pt' ? 'AESSRE — Contratação & Salário' : 'AESSRE — Hiring & Revenue'}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: theme === 'dark' ? '#34d399' : '#059669', fontWeight: 600 }}>Salário AOA</span>
          </button>
          <button onClick={() => setActiveTab('atccrs')} style={sidebarItemStyle('atccrs')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GraduationCap size={18} />
              <span>{lang === 'pt' ? 'ATCCRS — Formação & Prontidão' : 'ATCCRS — Training & Readiness'}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.2)', color: theme === 'dark' ? '#c084fc' : '#9333ea', fontWeight: 600 }}>C0-C5</span>
          </button>
          <button onClick={() => setActiveTab('ordks')} style={sidebarItemStyle('ordks')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={18} />
              <span>{t.navOrdks}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: theme === 'dark' ? '#34d399' : '#059669', fontWeight: 600 }}>500</span>
          </button>
          <button onClick={() => setActiveTab('gateway')} style={sidebarItemStyle('gateway')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Zap size={18} />
              <span>{t.navGateway}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', color: theme === 'dark' ? '#818cf8' : '#4f46e5', fontWeight: 600 }}>v2.2</span>
          </button>

          <button onClick={() => setActiveTab('approvals')} style={sidebarItemStyle('approvals')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={18} />
              <span>{t.navApprovals}</span>
            </div>
            {pendingApprovals.length > 0 && (
              <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: '#ef4444', color: '#fff', fontWeight: 700 }}>
                {pendingApprovals.length}
              </span>
            )}
          </button>

          <button onClick={() => setActiveTab('tasks')} style={sidebarItemStyle('tasks')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={18} />
              <span>{t.navTasks}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: theme === 'dark' ? '#34d399' : '#059669', fontWeight: 600 }}>Live</span>
          </button>

          <button onClick={() => setActiveTab('security')} style={sidebarItemStyle('security')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={18} />
              <span>{t.navSecurity}</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('evaluation')} style={sidebarItemStyle('evaluation')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={18} />
              <span>{t.navEvaluation}</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('connections')} style={sidebarItemStyle('connections')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Network size={18} />
              <span>{t.navConnections}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', color: theme === 'dark' ? '#818cf8' : '#4f46e5', fontWeight: 600 }}>Fabric</span>
          </button>

          <button onClick={() => setActiveTab('documents')} style={sidebarItemStyle('documents')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={18} />
              <span>{t.navDocuments}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(236, 72, 153, 0.2)', color: theme === 'dark' ? '#f472b6' : '#db2777', fontWeight: 600 }}>V2.1 Docs</span>
          </button>

          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: theme === 'dark' ? '#6b7280' : '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 12px 8px 12px' }}>
            {t.navCommercial}
          </div>

          <button onClick={() => setActiveTab('marketplace')} style={sidebarItemStyle('marketplace')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingCart size={18} />
              <span>{t.navMarketplace}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.2)', color: theme === 'dark' ? '#22d3ee' : '#0891b2', fontWeight: 600 }}>Store</span>
          </button>

          <button onClick={() => setActiveTab('billing')} style={sidebarItemStyle('billing')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={18} />
              <span>{t.navBilling}</span>
            </div>
          </button>

          <button onClick={() => setActiveTab('release')} style={sidebarItemStyle('release')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={18} />
              <span>{t.navRelease}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.2)', color: theme === 'dark' ? '#34d399' : '#059669', fontWeight: 600 }}>Gates A-J</span>
          </button>
        </aside>

        {/* Content Area */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {installSuccessMessage && (
            <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', background: theme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5', border: '1px solid #10b981', color: theme === 'dark' ? '#34d399' : '#047857', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} />
              <span>{installSuccessMessage}</span>
            </div>
          )}

          {/* TAB 1: CATALOG 500/500 */}
          {activeTab === 'catalog' && (
            <div>
              {/* Header & Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '6px' }}>{t.totalRoles}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a' }}>500</div>
                  <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#34d399' : '#059669', marginTop: '4px', fontWeight: 600 }}>{t.canonicalComplete}</div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '6px' }}>{t.departments}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a' }}>44</div>
                  <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#818cf8' : '#4f46e5', marginTop: '4px', fontWeight: 600 }}>{t.b2bCoverage}</div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '6px' }}>{t.highRisk}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: theme === 'dark' ? '#f87171' : '#dc2626' }}>
                    {CANONICAL_500_ROLES.filter(r => r.risk.level === 'R4' || r.risk.level === 'R5').length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#f87171' : '#dc2626', marginTop: '4px', fontWeight: 600 }}>{t.humanEscalation}</div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '6px' }}>{t.certified}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: theme === 'dark' ? '#34d399' : '#059669' }}>500/500</div>
                  <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#34d399' : '#059669', marginTop: '4px', fontWeight: 600 }}>{t.fidelityCertified}</div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b' }} />
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      background: theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                      color: theme === 'dark' ? '#fff' : '#0f172a',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <select
                  value={selectedDept}
                  onChange={e => setSelectedDept(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="ALL">{t.allDepartments} ({departments.length})</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>

                <select
                  value={selectedRisk}
                  onChange={e => setSelectedRisk(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="ALL">{t.allRisks}</option>
                  <option value="R1">R1 - Baixo / Low</option>
                  <option value="R2">R2 - Operacional / Operational</option>
                  <option value="R3">R3 - Controlado / Controlled</option>
                  <option value="R4">R4 - Alto / High</option>
                  <option value="R5">R5 - Crítico / Critical</option>
                </select>
              </div>

              {/* Grid of Role Packs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {filteredRoles.slice(0, 36).map(role => {
                  const riskLvl = role.risk?.level || (typeof role.risk === 'string' ? role.risk : 'R2');
                  const autonomyDef = role.autonomy?.default || role.autonomyDefault || 'L3';
                  return (
                    <div
                      key={role.id}
                      className="glass-card"
                      onClick={() => setSelectedRole(role)}
                      style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: theme === 'dark' ? 'var(--secondary)' : '#0284c7' }}>ID #{role.id}</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <span className={`badge badge-${riskLvl.toLowerCase()}`}>{riskLvl}</span>
                            <span className={`badge badge-${autonomyDef.toLowerCase()}`}>{autonomyDef}</span>
                          </div>
                        </div>

                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>{role.display_name}</h3>
                        <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#9ca3af' : '#475569', fontWeight: 600, marginBottom: '12px' }}>{role.department}</div>
                        <p style={{ fontSize: '0.825rem', color: theme === 'dark' ? '#d1d5db' : '#334155', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '16px' }}>
                          {role.mission}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: theme === 'dark' ? 'var(--text-dim)' : '#64748b' }}>
                          {t.toolsRequired}: {role.tools?.required?.length || 2}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#818cf8' : '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {t.seeDetails} <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          
          
          
          {/* TAB: 500/300/200 READINESS PROGRAM */}
          {activeTab === 'readiness_500' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Award color="#6366f1" size={24} />
                    {t.program500Title}
                  </h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {t.program500Subtitle}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> 500/500 READY_FOR_TEST
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} /> 300 P1 (PRIORITY)
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> 200 P2 (QUEUE)
                  </span>
                </div>
              </div>

              {/* Mathematical Gate Banner */}
              {(() => {
                const summary = readinessRegistry.getProgramCompletenessSummary();
                return (
                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>População Total</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#0f172a' }}>{summary.totalEmployees}</div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981' }}>100% Catálogo Canónico</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>P1 — PRIORITY</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6366f1' }}>{summary.p1Count}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Coortes P1-A, B, C (300)</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>P2 — READY_FOR_TEST</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{summary.p2Count}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Fila P2-QUEUE (200)</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Não Atribuídos / Duplicados</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{summary.unassignedCount}</div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981' }}>UNASSIGNED = 0 (OK)</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Gate Matemático</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>PASSED ✓</div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981' }}>500 = 300 P1 + 200 P2</div>
                    </div>
                  </div>
                );
              })()}

              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>
                <button
                  onClick={() => setProgramSubTab('priority_v2')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: programSubTab === 'priority_v2' ? (theme === 'dark' ? '#312e81' : '#e0e7ff') : 'transparent',
                    color: programSubTab === 'priority_v2' ? (theme === 'dark' ? '#a5b4fc' : '#4338ca') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Award size={16} />
                  500/500 Priority v2.0
                </button>
                <button
                  onClick={() => setProgramSubTab('passports')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: programSubTab === 'passports' ? (theme === 'dark' ? '#312e81' : '#e0e7ff') : 'transparent',
                    color: programSubTab === 'passports' ? (theme === 'dark' ? '#a5b4fc' : '#4338ca') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FileText size={16} />
                  {t.passportsTab}
                </button>
                <button
                  onClick={() => setProgramSubTab('cohorts')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: programSubTab === 'cohorts' ? (theme === 'dark' ? '#312e81' : '#e0e7ff') : 'transparent',
                    color: programSubTab === 'cohorts' ? (theme === 'dark' ? '#a5b4fc' : '#4338ca') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Layers size={16} />
                  {t.cohortsTab}
                </button>
                <button
                  onClick={() => setProgramSubTab('propagation')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: programSubTab === 'propagation' ? (theme === 'dark' ? '#312e81' : '#e0e7ff') : 'transparent',
                    color: programSubTab === 'propagation' ? (theme === 'dark' ? '#a5b4fc' : '#4338ca') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Workflow size={16} />
                  {t.propagationTab}
                </button>
              </div>

              {/* SUB-TAB 0: 500/500 PRIORITY PROGRAM v2.0 */}
              {programSubTab === 'priority_v2' && (
                <div>
                  {/* Gate Rule Banner */}
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px', borderLeft: '4px solid #6366f1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                          500/500 Priority Employee Program v2.0 — Control Plane
                        </h3>
                        <p style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginTop: '2px' }}>
                          Regra Unificada: <strong>500 TOTAL = 500 PRIORITY = 0 NON_PRIORITY</strong> (Sem exclusões secundárias P2/Deferidas)
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="badge badge-r1" style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                          GATE VERIFIED: PASSED ✓
                        </span>
                      </div>
                    </div>

                    {/* Controls & Reordering */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '12px 16px', borderRadius: '10px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                        Critério de Ordenação da Fila de Validação:
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => {
                            setPriorityOrderCriteria('DEFAULT');
                            setPriorityRecords(priorityEngine.reorderValidationQueue('DEFAULT'));
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: priorityOrderCriteria === 'DEFAULT' ? '#6366f1' : 'transparent',
                            color: priorityOrderCriteria === 'DEFAULT' ? '#fff' : (theme === 'dark' ? '#ccc' : '#333'),
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Canónico (ID 1-500)
                        </button>
                        <button
                          onClick={() => {
                            setPriorityOrderCriteria('BUSINESS_VALUE');
                            setPriorityRecords(priorityEngine.reorderValidationQueue('BUSINESS_VALUE'));
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: priorityOrderCriteria === 'BUSINESS_VALUE' ? '#6366f1' : 'transparent',
                            color: priorityOrderCriteria === 'BUSINESS_VALUE' ? '#fff' : (theme === 'dark' ? '#ccc' : '#333'),
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Valor de Negócio
                        </button>
                        <button
                          onClick={() => {
                            setPriorityOrderCriteria('CONNECTOR_READY');
                            setPriorityRecords(priorityEngine.reorderValidationQueue('CONNECTOR_READY'));
                          }}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            background: priorityOrderCriteria === 'CONNECTOR_READY' ? '#6366f1' : 'transparent',
                            color: priorityOrderCriteria === 'CONNECTOR_READY' ? '#fff' : (theme === 'dark' ? '#ccc' : '#333'),
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Prontidão de Conetores
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 10 Validation Waves Cards */}
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '12px' }}>
                    10 Ondas de Validação Profunda (50 Employees por Onda)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
                    {prioritySummary.waves.map((wave) => {
                      const isSelected = selectedWave === wave.waveNumber;
                      return (
                        <div
                          key={wave.waveNumber}
                          onClick={() => setSelectedWave(wave.waveNumber)}
                          className="glass-card"
                          style={{
                            padding: '14px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            border: isSelected ? '2px solid #6366f1' : '1px solid var(--border-color)',
                            background: isSelected
                              ? (theme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff')
                              : (theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff')
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: theme === 'dark' ? '#818cf8' : '#4f46e5' }}>
                              {wave.waveName}
                            </span>
                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 600 }}>
                              50/50
                            </span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b', marginBottom: '6px' }}>
                            IDs: {wave.employeeRange}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#34d399' : '#059669', fontWeight: 600 }}>
                            {wave.readyForTestCount} READY_FOR_TEST
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Selected Wave Inspector Table */}
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                        Inspector de Fila — WAVE {selectedWave} (IDs {(selectedWave - 1) * 50 + 1} até {selectedWave * 50})
                      </h4>
                      <span className="badge badge-l3">50 Employees Prioritários</span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                            <th style={{ padding: '10px' }}>Ordem</th>
                            <th style={{ padding: '10px' }}>ID & Nome</th>
                            <th style={{ padding: '10px' }}>Role Key</th>
                            <th style={{ padding: '10px' }}>Prioridade</th>
                            <th style={{ padding: '10px' }}>Score Valor</th>
                            <th style={{ padding: '10px' }}>Conetores</th>
                            <th style={{ padding: '10px' }}>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {priorityEngine.getRecordsByWave(selectedWave as any).map((rec) => (
                            <tr key={rec.employeeId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                              <td style={{ padding: '10px', fontWeight: 700, color: theme === 'dark' ? '#818cf8' : '#4f46e5' }}>
                                #{rec.validationOrder}
                              </td>
                              <td style={{ padding: '10px', fontWeight: 600, color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                                #{rec.employeeId} - {rec.displayName}
                              </td>
                              <td style={{ padding: '10px', fontFamily: 'monospace', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b' }}>
                                {rec.roleKey}
                              </td>
                              <td style={{ padding: '10px' }}>
                                <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontWeight: 700, fontSize: '0.72rem' }}>
                                  PRIORITY ✓
                                </span>
                              </td>
                              <td style={{ padding: '10px', fontWeight: 600 }}>
                                {rec.businessValueScore}/100
                              </td>
                              <td style={{ padding: '10px' }}>
                                <span style={{ color: '#10b981', fontWeight: 600 }}>Pronto</span>
                              </td>
                              <td style={{ padding: '10px' }}>
                                <span className="badge badge-r1">{rec.currentValidationState}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 1: READINESS PASSPORTS 500/500 */}
              {programSubTab === 'passports' && (
                <div>
                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                        Selecionar Empregado IA (1 - 500)
                      </label>
                      <select
                        value={selectedPassportEmpId}
                        onChange={(e) => setSelectedPassportEmpId(Number(e.target.value))}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                      >
                        {translatedRoles.map((r: any) => (
                          <option key={r.id} value={r.id}>
                            #{r.id} - {r.display_name} ({r.department})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                        Filtrar por Coorte
                      </label>
                      <select
                        value={cohortFilter}
                        onChange={(e: any) => setCohortFilter(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                      >
                        <option value="ALL">Todas as Coortes (500)</option>
                        <option value="P1-A">P1-A (100 Employees)</option>
                        <option value="P1-B">P1-B (100 Employees)</option>
                        <option value="P1-C">P1-C (100 Employees)</option>
                        <option value="P2-QUEUE">P2-QUEUE (200 Employees)</option>
                      </select>
                    </div>
                  </div>

                  {(() => {
                    const passport = readinessRegistry.getPassport(selectedPassportEmpId);
                    if (!passport) return null;

                    return (
                      <div className="glass-card" style={{ padding: '28px', borderRadius: '16px' }}>
                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ padding: '4px 10px', borderRadius: '12px', background: passport.priorityClass === 'P1' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: passport.priorityClass === 'P1' ? '#818cf8' : '#f59e0b', fontWeight: 700, fontSize: '0.8rem' }}>
                                Classe {passport.priorityClass} — {passport.priorityClass === 'P1' ? 'PRIORITY' : 'READY_FOR_TEST'}
                              </span>
                              <span style={{ padding: '4px 10px', borderRadius: '12px', background: theme === 'dark' ? '#1e293b' : '#e2e8f0', fontSize: '0.8rem', fontWeight: 600 }}>
                                Coorte: {passport.cohortGroup}
                              </span>
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                              #{passport.employeeId} - {passport.displayName}
                            </h3>
                            <div style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                              Departamento: {passport.department} | Role Key: {passport.roleKey}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Estado Atual do Ciclo de Vida</div>
                            <span style={{ padding: '6px 14px', borderRadius: '20px', background: passport.currentState === 'ACTIVE' ? '#10b981' : passport.currentState === 'SHADOW_MODE' ? '#818cf8' : '#6366f1', color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
                              {passport.currentState}
                            </span>
                          </div>
                        </div>

                        {/* 12 Structural Checks Grid */}
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                          12/12 Critérios de Preparação Estrutural ({passport.structurallyPrepared ? 'READY_FOR_TEST ✓' : 'INCOMPLETE'})
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                          {Object.entries(passport.structuralCriteria).map(([key, val]) => (
                            <div key={key} style={{ padding: '12px', borderRadius: '10px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569' }}>{key}</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: val === 'PASS' ? '#10b981' : '#ef4444' }}>{val}</span>
                            </div>
                          ))}
                        </div>

                        {/* Controls to transition state */}
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                          Ações de Transição de Estado no Programa
                        </h4>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleTransitionState(passport.employeeId, 'IN_TESTING')}
                            style={{ padding: '8px 16px', borderRadius: '8px', background: '#6366f1', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Mover para IN_TESTING
                          </button>
                          <button
                            onClick={() => handleTransitionState(passport.employeeId, 'SHADOW_MODE')}
                            style={{ padding: '8px 16px', borderRadius: '8px', background: '#818cf8', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Avançar para SHADOW_MODE
                          </button>
                          <button
                            onClick={() => handleTransitionState(passport.employeeId, 'CERTIFIED')}
                            style={{ padding: '8px 16px', borderRadius: '8px', background: '#059669', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Certificar (P04 Passed)
                          </button>
                          <button
                            onClick={() => handleTransitionState(passport.employeeId, 'ACTIVE')}
                            style={{ padding: '8px 16px', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Ativar em Produção (ACTIVE)
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* SUB-TAB 2: COHORT DISTRIBUTION */}
              {programSubTab === 'cohorts' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #6366f1' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1' }}>COHORTE P1-A</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0', color: theme === 'dark' ? '#fff' : '#0f172a' }}>100 Employees</h3>
                    <p style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                      Primeira vaga de validação profunda (IDs 1 - 100: Finanças, Vendas, Atendimento).
                    </p>
                  </div>

                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #818cf8' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8' }}>COHORTE P1-B</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0', color: theme === 'dark' ? '#fff' : '#0f172a' }}>100 Employees</h3>
                    <p style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                      Segunda vaga de validação profunda (IDs 101 - 200: RH, Compras, Logística).
                    </p>
                  </div>

                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #a5b4fc' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc' }}>COHORTE P1-C</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0', color: theme === 'dark' ? '#fff' : '#0f172a' }}>100 Employees</h3>
                    <p style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                      Terceira vaga de validação profunda (IDs 201 - 300: Jurídico, TI, Imobiliário).
                    </p>
                  </div>

                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #f59e0b' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>COHORTE P2-QUEUE</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0', color: theme === 'dark' ? '#fff' : '#0f172a' }}>200 Employees</h3>
                    <p style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                      Integralmente preparados em READY_FOR_TEST (IDs 301 - 500: Sectores Especializados).
                    </p>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: LAYERED PROPAGATOR */}
              {programSubTab === 'propagation' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Workflow size={18} color="#6366f1" />
                      Propagador de Melhorias por Camadas (P1 → P2)
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Escopo da Melhoria
                      </label>
                      <select
                        value={propScope}
                        onChange={(e: any) => setPropScope(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                      >
                        <option value="GLOBAL">GLOBAL (Aplica a todos os 500 Employees)</option>
                        <option value="DEPARTMENT">DEPARTMENT (Aplica a um departamento específico)</option>
                        <option value="ROLE_SPECIFIC">ROLE_SPECIFIC (Aplica a uma função específica)</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Alvo (Identificador de Departamento ou Role)
                      </label>
                      <input
                        type="text"
                        value={propTarget}
                        onChange={(e) => setPropTarget(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Descrição da Melhoria / Ajuste Normativo
                      </label>
                      <textarea
                        rows={3}
                        value={propDesc}
                        onChange={(e) => setPropDesc(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', fontSize: '0.85rem' }}
                      />
                    </div>

                    <button
                      onClick={handleRunPropagation}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#6366f1', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Workflow size={18} /> Propagar & Recompilar Passaportes Afetados
                    </button>
                  </div>

                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={18} color="#10b981" />
                      Registo de Recompilação & Audit Log
                    </h3>

                    {propResult ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>
                            ✓ Melhoria Propagada com Sucesso
                          </div>
                          <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                            ID: {propResult.improvementId} | Passaportes Recompilados: <strong>{propResult.recompiledPassportsCount}</strong>
                          </div>
                        </div>

                        <pre style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#020617' : '#0f172a', color: '#38bdf8', fontSize: '0.75rem', overflowX: 'auto', maxHeight: '200px' }}>
                          {JSON.stringify(propResult, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div style={{ padding: '48px', textAlign: 'center', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                        <Workflow size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.9rem' }}>Propague uma melhoria para observar a atualização automática nos passaportes dos 200 P2.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: ORDKS & OPERATIONAL REALITY */}
          {activeTab === 'ordks' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BookOpen color="#10b981" size={24} />
                    {t.ordksTitle}
                  </h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {t.ordksSubtitle}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> 500/500 Perfis Validados
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} /> 11 Níveis de Precedência
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={14} /> Angola AGT/PGCA Native
                  </span>
                </div>
              </div>

              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>
                <button
                  onClick={() => setOrdksSubTab('profiles')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: ordksSubTab === 'profiles' ? (theme === 'dark' ? '#064e3b' : '#dcfce7') : 'transparent',
                    color: ordksSubTab === 'profiles' ? (theme === 'dark' ? '#34d399' : '#166534') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Users size={16} />
                  {t.ordksProfileExplorerTab}
                </button>
                <button
                  onClick={() => setOrdksSubTab('precedence')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: ordksSubTab === 'precedence' ? (theme === 'dark' ? '#064e3b' : '#dcfce7') : 'transparent',
                    color: ordksSubTab === 'precedence' ? (theme === 'dark' ? '#34d399' : '#166534') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Sliders size={16} />
                  {t.ordksPrecedenceSimTab}
                </button>
                <button
                  onClick={() => setOrdksSubTab('angola')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: ordksSubTab === 'angola' ? (theme === 'dark' ? '#064e3b' : '#dcfce7') : 'transparent',
                    color: ordksSubTab === 'angola' ? (theme === 'dark' ? '#34d399' : '#166534') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Globe size={16} />
                  {t.ordksAngolaPackTab}
                </button>
                <button
                  onClick={() => setOrdksSubTab('exceptions')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: ordksSubTab === 'exceptions' ? (theme === 'dark' ? '#064e3b' : '#dcfce7') : 'transparent',
                    color: ordksSubTab === 'exceptions' ? (theme === 'dark' ? '#34d399' : '#166534') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertTriangle size={16} />
                  {t.ordksExceptionsTab}
                </button>
              </div>

              {/* SUB-TAB 1: ROLE KNOWLEDGE PROFILES 500/500 */}
              {ordksSubTab === 'profiles' && (
                <div>
                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                      Selecionar Empregado IA (1 - 500)
                    </label>
                    <select
                      value={ordksSelectedRoleId}
                      onChange={(e) => setOrdksSelectedRoleId(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                    >
                      {translatedRoles.map((r: any) => (
                        <option key={r.id} value={r.id}>
                          #{r.id} - {r.display_name} ({r.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const roleIdNum = Number(ordksSelectedRoleId) || 73;
                    const profile = ordksRegistry.getRoleProfile(roleIdNum);
                    const role = translatedRoles.find((r: any) => r.id === ordksSelectedRoleId) || translatedRoles[0];

                    if (!profile) return null;

                    return (
                      <div className="glass-card" style={{ padding: '28px', borderRadius: '16px' }}>
                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 700 }}>
                              Role Knowledge Profile V1.0
                            </span>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '8px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                              #{profile.employeeId} - {profile.displayName}
                            </h3>
                            <div style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                              Departamento: {profile.department} | Role Key: {profile.roleKey}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#10b981' }}>Conceitos Fundamentais de Domínio</h4>
                              <ul style={{ fontSize: '0.85rem', paddingLeft: '18px', margin: 0 }}>
                                {profile.coreConcepts.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)}
                              </ul>
                            </div>

                            <div style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#6366f1' }}>Workflow Operacional Típico</h4>
                              <ol style={{ fontSize: '0.85rem', paddingLeft: '18px', margin: 0 }}>
                                {profile.normalWorkflow.map((w, i) => <li key={i} style={{ marginBottom: '4px' }}>{w}</li>)}
                              </ol>
                            </div>

                            <div style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#f59e0b' }}>Documentos & Sistemas Utilizados</h4>
                              <div style={{ fontSize: '0.85rem' }}>
                                <div>Documentos: <strong>{profile.documentsEncountered.join(', ')}</strong></div>
                                <div>Sistemas: <strong>{profile.systemsUsed.join(', ')}</strong></div>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#ef4444' }}>Regras de Decisão & Validação</h4>
                              <ul style={{ fontSize: '0.85rem', paddingLeft: '18px', margin: 0 }}>
                                {profile.decisionRules.map((r, i) => <li key={i} style={{ marginBottom: '4px' }}>{r}</li>)}
                              </ul>
                            </div>

                            <div style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#38bdf8' }}>Evidências Exigidas & KPIs de Qualidade</h4>
                              <div style={{ fontSize: '0.85rem' }}>
                                <div>Evidências: <strong>{profile.evidenceRequirements.join(', ')}</strong></div>
                                <div style={{ marginTop: '4px' }}>KPIs: <strong>{profile.relevantKpis.join(', ')}</strong></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* SUB-TAB 2: PRECEDENCE SIMULATOR */}
              {ordksSubTab === 'precedence' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sliders size={18} color="#10b981" />
                      Consulta de Conhecimento & Resolução de Precedência
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Prompt / Pergunta Operacional
                      </label>
                      <textarea
                        rows={4}
                        value={ordksQueryInputText}
                        onChange={(e) => setOrdksQueryInputText(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', fontSize: '0.9rem' }}
                      />
                    </div>

                    <button
                      onClick={handleRunOrdksQuery}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <BookOpen size={18} /> Executar Consulta no Motor ORDKS
                    </button>
                  </div>

                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={18} color="#6366f1" />
                      Resultado da Síntese & Stack de Precedência
                    </h3>

                    {ordksSimResult ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.85rem' }}>
                          <strong>{ordksSimResult.synthesisSummary}</strong>
                        </div>

                        <div style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '6px' }}>Stack de Precedência de Conhecimento (11 Níveis)</div>
                          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#818cf8', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {ordksSimResult.appliedPrecedenceHierarchy.map((h, i) => (
                              <div key={i}>{h}</div>
                            ))}
                          </div>
                        </div>

                        <div style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#020617' : '#0f172a', color: '#38bdf8', fontSize: '0.75rem', fontFamily: 'monospace', maxHeight: '180px', overflowY: 'auto' }}>
                          {JSON.stringify(ordksSimResult.matchedKnowledgeItems, null, 2)}
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '48px', textAlign: 'center', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                        <BookOpen size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.9rem' }}>Execute uma consulta para testar a ordenação por grau de autoridade (11 níveis) e o enquadramento de Angola.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: ANGOLA JURISDICTION PACK */}
              {ordksSubTab === 'angola' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={20} color="#f59e0b" />
                      Angola Jurisdiction Pack — Enquadramento Fiscal e Legal Native
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '20px' }}>
                      Normativos legais e impostos de Angola integrados por defeito na plataforma para todos os Empregados IA de Finanças, Contabilidade, Fiscal, Jurídico e Recursos Humanos.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {ANGOLA_JURISDICTION_PACK.legalFrameworks.map((lf) => (
                        <div key={lf.code} style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: '#f59e0b', color: '#000', display: 'inline-block', marginBottom: '6px' }}>
                            {lf.code}
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '4px' }}>
                            {lf.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#818cf8', marginBottom: '6px' }}>
                            Autoridade: {lf.authority}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: theme === 'dark' ? '#9ca3af' : '#475569' }}>
                            {lf.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: EXCEPTIONS LIBRARY */}
              {ordksSubTab === 'exceptions' && (
                <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={20} color="#ef4444" />
                    Biblioteca de Excepções Operacionais & Erros Frequentes
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {ordksExceptionEngine.getAllExceptions().map((exc) => (
                      <div key={exc.exceptionId} style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                            {exc.code}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            Departamento: {exc.department}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '8px' }}>
                          {exc.title}
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                          <div>
                            <div>Sintomas: <strong>{exc.symptoms.join(', ')}</strong></div>
                            <div>Causa Raiz: <strong>{exc.rootCauses.join(', ')}</strong></div>
                          </div>
                          <div>
                            <div>Procedimento Contingência: <strong>{exc.workaroundProcedure.join(' → ')}</strong></div>
                            <div>Gatilho Escalação: <strong style={{ color: '#ef4444' }}>{exc.escalationTrigger}</strong></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
                          <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#9ca3af' : '#64748b' }}>Command ID</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'monospace', color: '#6366f1' }}>{cmdLastEnvelope.commandId}</div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div style={{ padding: '10px', borderRadius: '8px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Canal Normalizado</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{cmdLastEnvelope.sourceType}</div>
                          </div>
                          <div style={{ padding: '10px', borderRadius: '8px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Empregado Destino</div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{cmdLastEnvelope.requestedRoleKey || `#${cmdLastEnvelope.requestedEmployeeId}`}</div>
                          </div>
                        </div>

                        <div style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Avaliação de Risco & Política</div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ padding: '4px 8px', borderRadius: '6px', background: cmdLastEnvelope.riskHint === 'R4' || cmdLastEnvelope.riskHint === 'R5' ? '#ef4444' : '#10b981', color: '#fff', fontSize: '0.75rem', fontWeight: 700 }}>
                              {cmdLastEnvelope.riskHint || 'R2'}
                            </span>
                            <span style={{ fontSize: '0.85rem' }}>
                              {cmdLastEnvelope.riskHint === 'R4' || cmdLastEnvelope.riskHint === 'R5' ? 'Requer Autorização Humana (Gate Audit P01)' : 'Aprovado para Execução Autónoma'}
                            </span>
                          </div>
                        </div>

                        <div style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Rastreabilidade & Isolamento de Tenant</div>
                          <div style={{ fontSize: '0.8rem', fontFamily: 'monospace', color: theme === 'dark' ? '#34d399' : '#059669' }}>
                            Tenant: {cmdLastEnvelope.tenantId} | Actor: {cmdLastEnvelope.sourceActorId || 'HUMAN'} | Sig HMAC: VERIFIED
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
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Política de Aprovação Exigida</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>
                              {contract?.deliveryContract?.approvalRequired || 'AP.HUMAN_REQUIRED'}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                              Modos de Ativação Autorizados ({contract?.activationModes?.length || 0})
                            </h4>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                              {contract?.activationModes?.map((ch: string) => (
                                <span key={ch} style={{ padding: '6px 12px', borderRadius: '8px', background: theme === 'dark' ? '#1e293b' : '#e2e8f0', fontSize: '0.8rem', fontWeight: 600 }}>
                                  {ch}
                                </span>
                              ))}
                            </div>

                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                              Produtos de Dados & Ingestão (Inputs)
                            </h4>
                            <div style={{ padding: '12px', borderRadius: '10px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                              <div>Data Products Obrigações: <strong>{contract?.inputContract?.requiredDataProducts?.join(', ') || 'Enterprise ERP Feed'}</strong></div>
                              <div>Política Dados Ausentes: <strong>{contract?.inputContract?.missingDataPolicy || 'REJECT_OR_ESCALATE'}</strong></div>
                            </div>
                          </div>

                          <div>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                              Política de Risco & Escalamento Humano
                            </h4>
                            <div style={{ padding: '12px', borderRadius: '10px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}>
                              <div>Nível de Risco: <strong style={{ color: '#ef4444' }}>{role.risk?.level || 'R2'}</strong></div>
                              <div>Política de Aprovação: <strong>{contract?.deliveryContract?.approvalRequired || 'AP.HUMAN_REQUIRED'}</strong></div>
                              <div>Condições de Escalação: <strong>{contract?.executionContract?.escalationConditions?.join(', ') || 'Gerente Direto / Supervisor'}</strong></div>
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

          {/* TAB 2: APPROVAL GATEWAY */}
          {activeTab === 'approvals' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>Approval Gateway & Governance</h2>
                <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                  {lang === 'pt' ? 'Fila de ações materiais pendentes de autorização humana explícita (Política Deny-by-Default).' : 'Pending material actions queue requiring explicit human approval (Deny-by-Default Policy).'}
                </p>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                  <CheckCircle2 size={48} color="#34d399" style={{ marginBottom: '12px' }} />
                  <h3 style={{ color: theme === 'dark' ? '#fff' : '#0f172a' }}>{lang === 'pt' ? 'Sem Aprovações Pendentes' : 'No Pending Approvals'}</h3>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>{lang === 'pt' ? 'Todas as ações de alto risco ou monetárias foram processadas.' : 'All high-risk or monetary actions have been processed.'}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pendingApprovals.map(app => {
                    const empName = lang === 'pt' ? app.employeePt : app.employeeEn;
                    const deptName = lang === 'pt' ? app.departmentPt : app.departmentEn;
                    const reason = lang === 'pt' ? app.reasonPt : app.reasonEn;
                    const timeAgo = lang === 'pt' ? app.requestedAtPt : app.requestedAtEn;

                    return (
                      <div key={app.id} className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ maxWidth: '70%' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span className={`badge badge-${app.risk.toLowerCase()}`}>{app.risk}</span>
                            <span style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600 }}>{deptName}</span>
                            <span style={{ fontSize: '0.75rem', color: theme === 'dark' ? 'var(--text-dim)' : '#64748b' }}>• {timeAgo}</span>
                          </div>

                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '4px' }}>{empName}</h3>
                          <p style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#fbbf24' : '#d97706', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                            <AlertTriangle size={16} /> {reason}
                          </p>

                          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: theme === 'dark' ? 'var(--text-dim)' : '#475569', background: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                            Snapshot Hash: {app.snapshotHash}
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button className="btn-danger" onClick={() => handleApprove(app.id)}>
                            {t.reject}
                          </button>
                          <button className="btn-success" onClick={() => handleApprove(app.id)}>
                            {t.approveExecution}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FILA P05 & DLQ */}
          {activeTab === 'tasks' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>Execução Durável P05 & Dead-Letter Queue</h2>
                <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                  {lang === 'pt' ? 'Monitorização de trabalhadores concorrentes, estatísticas da fila e isolamento de falhas.' : 'Monitoring concurrent workers, queue stats, and fault isolation.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>{lang === 'pt' ? 'Workers Ativos' : 'Active Workers'}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: theme === 'dark' ? '#34d399' : '#059669', marginTop: '4px' }}>2 / 2 Concorrentes</div>
                </div>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>{lang === 'pt' ? 'Fila Principal' : 'Primary Queue'}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: theme === 'dark' ? '#818cf8' : '#4f46e5', marginTop: '4px' }}>0 {lang === 'pt' ? 'Tarefas' : 'Tasks'}</div>
                </div>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>Dead-Letter Queue (DLQ)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: dlqItems.length > 0 ? (theme === 'dark' ? '#f87171' : '#dc2626') : '#34d399', marginTop: '4px' }}>
                    {dlqItems.length} {lang === 'pt' ? 'Itens' : 'Items'}
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>Painel Dead-Letter Queue (DLQ)</h3>
              {dlqItems.length === 0 ? (
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                  {lang === 'pt' ? 'Nenhum item isolado na DLQ. O sistema está a funcionar com 100% de resiliência.' : 'No isolated items in DLQ. System operating at 100% resilience.'}
                </div>
              ) : (
                <div className="glass-card" style={{ padding: '20px' }}>
                  {dlqItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', fontSize: '1rem' }}>
                          {lang === 'pt' ? 'Especialista em Controlo de Crédito' : 'credit_control_specialist'} ({lang === 'pt' ? 'Finanças' : 'Finance'})
                        </div>
                        <div style={{ fontSize: '0.85rem', color: theme === 'dark' ? '#f87171' : '#dc2626', marginTop: '4px', fontWeight: 500 }}>{item.reason}</div>
                        <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? 'var(--text-dim)' : '#64748b', marginTop: '4px' }}>
                          {lang === 'pt' ? `Falhou após ${item.attempts} tentativas • ${item.failedAt}` : `Failed after ${item.attempts} retries • ${item.failedAt}`}
                        </div>
                      </div>
                      <button className="btn-primary" onClick={() => handleRequeueDLQ(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RefreshCw size={14} /> {t.requeue}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SEGURANÇA RED TEAM P02 */}
          {activeTab === 'security' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>Segurança & Simulador Red Team P02</h2>
                <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                  {lang === 'pt' ? 'Testes em tempo real do analisador de prompt injection e isolamento entre clientes.' : 'Real-time tests of the prompt injection analyzer and tenant isolation.'}
                </p>
              </div>

              <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                  <Lock size={18} color="#818cf8" /> Prompt Injection & Threat Scanner Simulator
                </h3>

                <textarea
                  rows={4}
                  placeholder={lang === 'pt' ? "Insira uma instrução para testar o analisador de segurança (ex: 'System: Ignore all previous instructions...')" : "Enter a prompt to test security analyzer..."}
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                    outline: 'none',
                    marginBottom: '12px',
                    fontFamily: 'monospace'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button className="btn-primary" onClick={handleSecurityScan}>
                    {lang === 'pt' ? 'Executar Inspecção de Segurança' : 'Run Security Inspection'}
                  </button>
                  <span style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b' }}>Algoritmo: PromptSanitizer V2</span>
                </div>

                {scanResult && (
                  <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', background: scanResult.safe ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5') : (theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2'), border: `1px solid ${scanResult.safe ? '#10b981' : '#ef4444'}` }}>
                    <div style={{ fontWeight: 700, color: scanResult.safe ? (theme === 'dark' ? '#34d399' : '#047857') : (theme === 'dark' ? '#f87171' : '#b91c1c'), fontSize: '1rem', marginBottom: '4px' }}>
                      Status: {scanResult.safe ? (lang === 'pt' ? 'SEGURO (BAIXA AMEAÇA)' : 'SAFE (LOW THREAT)') : `${lang === 'pt' ? 'AMEAÇA DETECTADA' : 'THREAT DETECTED'} (${scanResult.threatLevel})`}
                    </div>
                    {scanResult.detectedVectors.map((v: string, i: number) => (
                      <div key={i} style={{ fontSize: '0.85rem', color: theme === 'dark' ? '#f87171' : '#b91c1c', marginTop: '2px', fontWeight: 500 }}>• {v}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICAÇÃO EVALUATION SDK P04 */}
          {activeTab === 'evaluation' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>Evaluation Engine & Certificação P04</h2>
                <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                  {lang === 'pt' ? 'Certificação automatizada de fidelidade e blocking gates para empregados digitais.' : 'Automated fidelity certification and blocking gates for digital employees.'}
                </p>
              </div>

              <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                <Award size={48} color="#818cf8" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>500/500 Role Packs Certificados</h3>
                <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
                  {lang === 'pt'
                    ? 'Todos os papéis canónicos foram submetidos à suíte de testes de fidelidade do P04. Papéis de risco crítico (R4/R5) requerem recertificação automática se a sua definição for alterada.'
                    : 'All canonical roles passed P04 fidelity test suite. Critical risk roles (R4/R5) require auto-recertification on policy change.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB V2.1: ENTERPRISE CONNECTION HUB P03 */}
          {activeTab === 'connections' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                    Enterprise Connection Hub & Integration Fabric (P03)
                  </h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {lang === 'pt'
                      ? 'Gestão centralizada de sistemas ligados (ERP, CRM, BI, BDs, Excel Online), ingestão de dados e receipts de entrega.'
                      : 'Centralized management of connected enterprise systems (ERP, CRM, BI, DBs, Excel Online), data intake & delivery receipts.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-primary" onClick={handleSimulateDataIntake} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={16} /> {t.simulateDataIntake}
                  </button>
                  <button className="btn-primary" onClick={handleSimulateDeliveryReceipt} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                    <CheckSquare size={16} /> {t.simulateDeliveryReceipt}
                  </button>
                </div>
              </div>

              {/* Connected Systems Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                {connectionManager.getConnections().map((conn: ConnectionProfile) => (
                  <div key={conn.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: theme === 'dark' ? '#818cf8' : '#4f46e5', fontWeight: 700 }}>
                          {conn.systemType}
                        </span>
                        <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: theme === 'dark' ? '#34d399' : '#047857', fontWeight: 700 }}>
                          {conn.status}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '4px' }}>{conn.name}</h3>
                      <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b', marginBottom: '12px' }}>Provedor: <strong>{conn.provider}</strong> • Auth: {conn.authType}</div>

                      <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? 'var(--text-dim)' : '#475569', marginBottom: '12px' }}>
                        <strong>Escopos Autorizados:</strong>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
                          {conn.scopes.map(s => (
                            <span key={s} style={{ padding: '2px 6px', borderRadius: '4px', background: theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', fontSize: '0.7rem' }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: theme === 'dark' ? 'var(--text-dim)' : '#64748b' }}>
                        Saúde: <strong style={{ color: '#34d399' }}>{conn.health}</strong>
                      </span>
                      {conn.deepLinkPattern && (
                        <button
                          onClick={() => setGeneratedDeepLink(connectionManager.generateSourceDeepLink(conn.id, 'RECORD_SAMPLE_001'))}
                          style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#818cf8' : '#4f46e5', background: 'none', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <ExternalLink size={12} /> Test Deep Link
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {generatedDeepLink && (
                <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', background: theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff', border: '1px solid #6366f1', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: theme === 'dark' ? '#818cf8' : '#3730a3', marginBottom: '4px' }}>
                    {lang === 'pt' ? 'Source Deep Link (Hiperligação de Origem Gerada):' : 'Generated Source Deep Link:'}
                  </div>
                  <code style={{ fontSize: '0.8rem', wordBreak: 'break-all', color: theme === 'dark' ? '#fff' : '#0f172a' }}>{generatedDeepLink}</code>
                </div>
              )}

              {/* Data Intake Envelope Output Simulation */}
              {simulatedEnvelope && (
                <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="#34d399" /> Simulated DataEnvelope (V2.1 Data Intake)
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px', fontSize: '0.85rem' }}>
                    <div><strong>Envelope ID:</strong> {simulatedEnvelope.envelopeId}</div>
                    <div><strong>Classification:</strong> <span className="badge badge-r4">{simulatedEnvelope.classification}</span></div>
                    <div><strong>Checksum SHA256:</strong> <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{simulatedEnvelope.checksum.substring(0, 16)}...</span></div>
                    <div><strong>Source System:</strong> {simulatedEnvelope.sourceSystem}</div>
                    <div><strong>Schema Key:</strong> {simulatedEnvelope.schemaKey}</div>
                    <div><strong>Ingested At:</strong> {simulatedEnvelope.ingestedAt}</div>
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#818cf8' : '#4f46e5' }}>Structured Payload:</div>
                  <pre style={{ background: theme === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.05)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', overflowX: 'auto' }}>
                    {JSON.stringify(simulatedEnvelope.payload, null, 2)}
                  </pre>
                </div>
              )}

              {/* Delivery Receipt Output Simulation */}
              {simulatedReceipt && (
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckSquare size={18} color="#10b981" /> Simulated DeliveryReceipt (V2.1 Delivery Router)
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '0.85rem' }}>
                    <div><strong>Receipt ID:</strong> {simulatedReceipt.receiptId}</div>
                    <div><strong>Work Product ID:</strong> {simulatedReceipt.workProductId}</div>
                    <div><strong>Destination Target:</strong> <span style={{ fontFamily: 'monospace' }}>{simulatedReceipt.destinationTarget}</span></div>
                    <div><strong>Status:</strong> <span className="badge badge-r1">{simulatedReceipt.status}</span></div>
                    <div><strong>Delivered At:</strong> {simulatedReceipt.deliveredAt}</div>
                    <div><strong>Receipt Proof:</strong> <span style={{ fontFamily: 'monospace', color: '#34d399' }}>{simulatedReceipt.receiptProof}</span></div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB V2.1: DOCUMENT GENERATION & RENDERING SERVICE */}
          {activeTab === 'documents' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileText size={24} color="#ec4899" />
                    Document Generation & Rendering Studio (Service Central Transversal)
                  </h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {lang === 'pt'
                      ? 'Serviço transversal de produção documental para os 500 AI Employees. Suporta DOCX editável, PDF executivo, XLSX multi-aba e PPTX com versionamento, aprovação SHA-256 e recibos de entrega.'
                      : 'Cross-cutting document rendering service for all 500 AI Employees. Supports editable DOCX, executive PDF, multi-sheet XLSX, and PPTX with versioning, SHA-256 approvals, and delivery receipts.'}
                  </p>
                </div>
              </div>

              {docSuccessMessage && (
                <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', background: theme === 'dark' ? 'rgba(236, 72, 153, 0.15)' : '#fce7f3', border: '1px solid #ec4899', color: theme === 'dark' ? '#f472b6' : '#be185d', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={20} />
                  <span>{docSuccessMessage}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
                {/* Left Column: Document Request Form */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileSpreadsheet size={18} color="#818cf8" />
                    1. Formolar Pedido de Documento (DocumentGenerationRequest)
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', color: theme === 'dark' ? '#9ca3af' : '#475569' }}>Tipo de Documento:</label>
                      <select
                        className="search-input"
                        value={docTypeInput}
                        onChange={(e) => setDocTypeInput(e.target.value)}
                        style={{ width: '100%' }}
                      >
                        <option value="MANAGEMENT_REPORT">MANAGEMENT_REPORT (Relatório de Gestão)</option>
                        <option value="LETTER">LETTER (Carta Administrativa / Oficial)</option>
                        <option value="CONTRACT">CONTRACT (Minuta / Contrato Legal)</option>
                        <option value="FINANCIAL">FINANCIAL (Demonstração Financeira)</option>
                        <option value="SPREADSHEET">SPREADSHEET (Folha de Cálculo Analítica)</option>
                        <option value="AUDIT">AUDIT (Relatório de Auditoria)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', color: theme === 'dark' ? '#9ca3af' : '#475569' }}>Título do Documento:</label>
                      <input
                        className="search-input"
                        type="text"
                        value={docTitleInput}
                        onChange={(e) => setDocTitleInput(e.target.value)}
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', color: theme === 'dark' ? '#9ca3af' : '#475569' }}>Empresa / Tenant ID:</label>
                        <input
                          className="search-input"
                          type="text"
                          value={docOrgInput}
                          onChange={(e) => setDocOrgInput(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', color: theme === 'dark' ? '#9ca3af' : '#475569' }}>Empregado Origem (ID):</label>
                        <input
                          className="search-input"
                          type="text"
                          value={docEmployeeInput}
                          onChange={(e) => setDocEmployeeInput(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', color: theme === 'dark' ? '#9ca3af' : '#475569' }}>Formatos Solicitados para o Pacote (Bundle):</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {(['DOCX', 'PDF', 'XLSX', 'PPTX'] as DocumentFormat[]).map(fmt => {
                          const isSelected = docFormatsInput.includes(fmt);
                          return (
                            <button
                              key={fmt}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  if (docFormatsInput.length > 1) setDocFormatsInput(docFormatsInput.filter(f => f !== fmt));
                                } else {
                                  setDocFormatsInput([...docFormatsInput, fmt]);
                                }
                              }}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                                color: isSelected ? '#818cf8' : '#9ca3af',
                                fontWeight: isSelected ? 700 : 500,
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              {fmt === 'DOCX' ? 'Word (.docx)' : fmt === 'PDF' ? 'PDF (.pdf)' : fmt === 'XLSX' ? 'Excel (.xlsx)' : 'PowerPoint (.pptx)'}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 600, marginBottom: '4px', color: theme === 'dark' ? '#9ca3af' : '#475569' }}>Política de Aprovação Exigida:</label>
                      <select
                        className="search-input"
                        value={docApprovalPolicyInput}
                        onChange={(e) => setDocApprovalPolicyInput(e.target.value)}
                        style={{ width: '100%' }}
                      >
                        <option value="AP.HUMAN_REQUIRED">AP.HUMAN_REQUIRED (Aprovação Humana Obrigatória)</option>
                        <option value="AP.NONE">AP.NONE (Produção Automática Direta)</option>
                      </select>
                    </div>

                    <button
                      className="btn-primary"
                      onClick={handleGenerateDocumentBundle}
                      style={{ marginTop: '10px', background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                    >
                      <Cpu size={18} /> Gerar Pacote de Documentos (WorkProductBundle)
                    </button>
                  </div>
                </div>

                {/* Right Column: Multi-Format Preview & Action Studio */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={18} color="#ec4899" />
                    2. Studio de Pré-visualização & Ações de Entrega
                  </h3>

                  {!currentBundle ? (
                    <div style={{ padding: '40px 20px', textAlign: 'center', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b' }}>
                      <FileText size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                      <p>Nenhum pacote de documentos gerado de momento.</p>
                      <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Configure o formulário à esquerda e clique em <strong>Gerar Pacote de Documentos</strong>.</p>
                    </div>
                  ) : (
                    <div>
                      {/* Bundle Summary Bar */}
                      <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', fontSize: '0.95rem' }}>{currentBundle.title}</span>
                          <span className={`badge ${currentBundle.status === 'APPROVED' ? 'badge-r1' : currentBundle.status === 'DELIVERED' ? 'badge-certified' : 'badge-r4'}`}>
                            {currentBundle.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                          <div>Document ID: <code style={{ color: '#818cf8' }}>{currentBundle.workProductId}</code></div>
                          <div>Aprovação: <strong>{currentBundle.approvalStatus}</strong></div>
                        </div>
                      </div>

                      {/* Format Selector Pills */}
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', marginBottom: '6px' }}>
                        Selecione o Formato para Pré-visualização:
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                        {(['DOCX', 'PDF', 'XLSX', 'PPTX'] as DocumentFormat[]).map(fmt => {
                          const art = currentBundle.renderings[fmt];
                          const isActive = previewFormat === fmt;
                          return (
                            <button
                              key={fmt}
                              type="button"
                              disabled={!art}
                              onClick={() => setPreviewFormat(fmt)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                background: isActive ? '#6366f1' : art ? (theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#e2e8f0') : 'transparent',
                                color: isActive ? '#fff' : art ? (theme === 'dark' ? '#fff' : '#0f172a') : '#6b7280',
                                opacity: art ? 1 : 0.4,
                                cursor: art ? 'pointer' : 'not-allowed',
                                fontWeight: isActive ? 700 : 500,
                                fontSize: '0.75rem'
                              }}
                            >
                              [{fmt}] {art ? `${(art.fileSizeBytes / 1024).toFixed(1)} KB` : 'Indisponível'}
                            </button>
                          );
                        })}
                      </div>

                      {/* Document Viewer Screen */}
                      {currentBundle.renderings[previewFormat] ? (
                        <div style={{ background: theme === 'dark' ? 'rgba(0,0,0,0.5)' : '#f1f5f9', border: '1px solid var(--border-color)', padding: '16px', borderRadius: '10px', marginBottom: '16px', fontSize: '0.8rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: theme === 'dark' ? '#818cf8' : '#4f46e5', fontWeight: 700 }}>
                            <span>Ficheiro Renderizado: {previewFormat}</span>
                            <span>Artefacto: {currentBundle.renderings[previewFormat]?.artifactId}</span>
                          </div>
                          <div style={{ marginBottom: '6px' }}>MIME Type: <code>{currentBundle.renderings[previewFormat]?.mimeType}</code></div>
                          <div style={{ marginBottom: '6px' }}>Hash SHA-256: <code style={{ color: '#34d399', fontSize: '0.7rem' }}>{currentBundle.renderings[previewFormat]?.contentHash}</code></div>
                          <div style={{ marginBottom: '10px' }}>Download URL: <a href="#" onClick={(e) => { e.preventDefault(); alert(`Iniciando download do ficheiro ${previewFormat} (${currentBundle.renderings[previewFormat]?.artifactId})`); }} style={{ color: '#6366f1', textDecoration: 'underline' }}>{currentBundle.renderings[previewFormat]?.downloadUrl}</a></div>

                          <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '10px', fontSize: '0.75rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b' }}>
                            <strong>Proveniência Auditável:</strong> Empregado #{currentBundle.employeeId} | Tarefa #{currentBundle.taskId} | Modelo Google Gemini 1.5 Pro
                          </div>
                        </div>
                      ) : (
                        <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '16px' }}>
                          O formato {previewFormat} não foi solicitado na geração deste pacote.
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                        {currentBundle.approvalStatus === 'PENDING' && (
                          <button
                            className="btn-primary"
                            onClick={handleApproveDocumentSnapshot}
                            style={{ flex: 1, background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                          >
                            <ShieldCheck size={16} /> Aprovar Snapshot de Conteúdo (SHA-256)
                          </button>
                        )}

                        <button
                          className="btn-primary"
                          disabled={currentBundle.approvalStatus === 'PENDING'}
                          onClick={handleDeliverDocumentBundle}
                          style={{
                            flex: 1,
                            background: currentBundle.approvalStatus === 'PENDING' ? '#475569' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                            cursor: currentBundle.approvalStatus === 'PENDING' ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          <CheckSquare size={16} /> Entregar via DeliveryRouter (Receipts)
                        </button>
                      </div>

                      {/* Delivery Receipts List */}
                      {docReceiptsList.length > 0 && (
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                          <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '8px' }}>
                            Talões de Entrega Emitidos (DocumentDeliveryReceipts):
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                            {docReceiptsList.map((rc: any) => (
                              <div key={rc.receiptId} style={{ background: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', border: '1px solid #10b981', padding: '8px 12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <strong>[{rc.format}]</strong> Receipt <code style={{ fontSize: '0.7rem' }}>{rc.receiptId}</code> → {rc.destination}
                                </div>
                                <span style={{ color: '#059669', fontWeight: 700 }}>{rc.status} ({rc.deliveredAt.split('T')[1].substring(0, 8)})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MARKETPLACE P06 */}
          {activeTab === 'marketplace' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>Marketplace de Empregados IA (P06)</h2>
                <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                  {lang === 'pt' ? 'Catálogo comercial com selos de certificação, permissões transparentes e instalação segura.' : 'Commercial catalog with certification seals, transparent permissions and secure installation.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {marketplaceManager.getListings().map(listing => {
                  const nameTranslated = lang === 'pt' ? (roleNameTranslationsJson[listing.displayName] || listing.displayName) : listing.displayName;
                  const deptTranslated = lang === 'pt' ? (deptTranslations[listing.department] || listing.department) : listing.department;
                  const descTranslated = lang === 'pt' 
                    ? `Role Pack oficial de ${nameTranslated} certificado para produção com governança avançada e suporte a auditoria.`
                    : listing.description;

                  return (
                    <div key={listing.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(52, 211, 153, 0.15)', color: theme === 'dark' ? '#34d399' : '#047857', fontWeight: 700, border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                            {listing.certification}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b' }}>★ {listing.rating} ({listing.installsCount} inst.)</span>
                        </div>

                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '4px' }}>{nameTranslated}</h3>
                        <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#818cf8' : '#4f46e5', fontWeight: 600, marginBottom: '12px' }}>{deptTranslated} • Por {listing.publisherName}</div>

                        <p style={{ fontSize: '0.85rem', color: theme === 'dark' ? '#d1d5db' : '#334155', marginBottom: '16px', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {descTranslated}
                        </p>
                      </div>

                      <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a' }}>${listing.unitPrice} <span style={{ fontSize: '0.75rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b', fontWeight: 400 }}>/ {lang === 'pt' ? 'mês' : 'month'}</span></div>
                        </div>

                        <button className="btn-primary" onClick={() => handleInstallListing({ ...listing, displayName: nameTranslated })}>
                          {lang === 'pt' ? 'Instalar Empregado' : 'Install Employee'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: BILLING & METERING P06 */}
          {activeTab === 'billing' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>Faturação, Metering & Orçamentos (P06)</h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {lang === 'pt' ? 'Ledger de utilização em tempo real, preçário multimoeda e limites orçamentais.' : 'Real-time usage ledger, multi-currency pricing, and budget caps.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px', background: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : '#ffffff', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  {(['USD', 'AOA', 'EUR'] as const).map(curr => (
                    <button
                      key={curr}
                      onClick={() => setDisplayCurrency(curr)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: displayCurrency === curr ? '#6366f1' : 'transparent',
                        color: displayCurrency === curr ? '#fff' : (theme === 'dark' ? '#9ca3af' : '#475569'),
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan & Budget Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '28px' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>{lang === 'pt' ? 'Plano Atual' : 'Current Plan'}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: theme === 'dark' ? '#818cf8' : '#4f46e5', marginTop: '4px' }}>Enterprise</div>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#34d399' : '#059669', marginTop: '8px', fontWeight: 600 }}>1,000 Empregados • 200 Tarefas Concorrentes</div>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>{lang === 'pt' ? 'Gasto Mensal Atual' : 'Current Monthly Spend'}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginTop: '4px' }}>
                    {displayCurrency === 'USD' && '$1,450.00'}
                    {displayCurrency === 'EUR' && '€1,342.59'}
                    {displayCurrency === 'AOA' && 'Kz 1,342,592.00'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#818cf8' : '#4f46e5', marginTop: '8px', fontWeight: 500 }}>
                    {lang === 'pt' ? 'Limite Orçamental: $10,000.00 (14.5% consumido)' : 'Budget Limit: $10,000.00 (14.5% consumed)'}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>Publisher Payout Share</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: theme === 'dark' ? '#34d399' : '#059669', marginTop: '4px' }}>80% / 20%</div>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-dim)' : '#64748b', marginTop: '8px' }}>Platform Revenue Share Rule Active</div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                {lang === 'pt' ? 'Ledger Financeiro Imutável' : 'Immutable Financial Ledger'}
              </h3>
              <div className="glass-card" style={{ padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                      <th style={{ padding: '12px' }}>Event ID</th>
                      <th style={{ padding: '12px' }}>Tenant</th>
                      <th style={{ padding: '12px' }}>{lang === 'pt' ? 'Preço Bruto' : 'Gross Price'}</th>
                      <th style={{ padding: '12px' }}>{lang === 'pt' ? 'Partilha Publisher (80%)' : 'Publisher Share (80%)'}</th>
                      <th style={{ padding: '12px' }}>{lang === 'pt' ? 'Partilha Plataforma (20%)' : 'Platform Share (20%)'}</th>
                      <th style={{ padding: '12px' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: theme === 'dark' ? '#818cf8' : '#4f46e5' }}>evt_billing_9001</td>
                      <td style={{ padding: '12px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>tenant_default</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a' }}>$150.00</td>
                      <td style={{ padding: '12px', color: theme === 'dark' ? '#34d399' : '#059669', fontWeight: 600 }}>$120.00</td>
                      <td style={{ padding: '12px', color: theme === 'dark' ? '#22d3ee' : '#0891b2', fontWeight: 600 }}>$30.00</td>
                      <td style={{ padding: '12px', color: theme === 'dark' ? 'var(--text-dim)' : '#64748b' }}>{lang === 'pt' ? 'Há 5 minutos' : '5 mins ago'}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: theme === 'dark' ? '#818cf8' : '#4f46e5' }}>evt_billing_9002</td>
                      <td style={{ padding: '12px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>tenant_default</td>
                      <td style={{ padding: '12px', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a' }}>$250.00</td>
                      <td style={{ padding: '12px', color: theme === 'dark' ? '#34d399' : '#059669', fontWeight: 600 }}>$200.00</td>
                      <td style={{ padding: '12px', color: theme === 'dark' ? '#22d3ee' : '#0891b2', fontWeight: 600 }}>$50.00</td>
                      <td style={{ padding: '12px', color: theme === 'dark' ? 'var(--text-dim)' : '#64748b' }}>{lang === 'pt' ? 'Há 22 minutos' : '22 mins ago'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 8: RELEASE READINESS P07 */}
          {activeTab === 'release' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                    {lang === 'pt' ? 'Prontidão de Lançamento — Gate P07 Audit' : 'Release Readiness — Gate P07 Audit'}
                  </h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {lang === 'pt' ? 'Verificação automatizada dos 10 Portões de Auditoria (Gates A a J) para aprovação final de produção.' : 'Automated check of all 10 Audit Gates (A to J) for final production signoff.'}
                  </p>
                </div>

                <button className="btn-primary" onClick={runP07Audit} disabled={auditRunning} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={16} className={auditRunning ? 'animate-spin' : ''} />
                  {auditRunning ? (lang === 'pt' ? 'A Executar Auditoria...' : 'Running Audit...') : (lang === 'pt' ? 'Executar Auditoria de Lançamento (Gates A-J)' : 'Run Release Audit (Gates A-J)')}
                </button>
              </div>

              {auditReport && (
                <div>
                  {/* Verdict Card */}
                  <div
                    className="glass-card"
                    style={{
                      padding: '32px',
                      marginBottom: '28px',
                      background: auditReport.verdict === 'GO' ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5') : (theme === 'dark' ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2'),
                      border: `1px solid ${auditReport.verdict === 'GO' ? '#10b981' : '#ef4444'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                        {lang === 'pt' ? 'Veredito Oficial do Portão de Lançamento' : 'Official Release Gate Verdict'}
                      </div>
                      <div style={{ fontSize: '2.4rem', fontWeight: 800, color: auditReport.verdict === 'GO' ? (theme === 'dark' ? '#34d399' : '#047857') : (theme === 'dark' ? '#f87171' : '#b91c1c'), marginTop: '4px' }}>
                        VERDICT: {auditReport.verdict}
                      </div>
                      <p style={{ fontSize: '0.95rem', color: theme === 'dark' ? '#d1d5db' : '#334155', marginTop: '8px', fontWeight: 500 }}>{auditReport.signoffSummary}</p>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: theme === 'dark' ? 'var(--text-dim)' : '#64748b', marginTop: '8px' }}>
                        Pacote de Evidências Hash: {auditReport.artifactDigest}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: theme === 'dark' ? '#34d399' : '#059669' }}>{auditReport.overallFidelityPercent}%</div>
                      <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600 }}>
                        {lang === 'pt' ? 'Fidelidade Geral Certificada' : 'Certified Overall Fidelity'}
                      </div>
                    </div>
                  </div>

                  {/* Gates Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {auditReport.gates.map(gate => (
                      <div key={gate.gateId} className="glass-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a' }}>{gate.gateId}: {gate.name}</span>
                          <span className={`badge ${gate.status === 'PASS' ? 'badge-r1' : 'badge-r5'}`}>{gate.status}</span>
                        </div>

                        {gate.logs.map((log, idx) => (
                          <div key={idx} style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginTop: '4px' }}>
                            • {log}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!auditReport && !auditRunning && (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                  <ShieldCheck size={48} color="#818cf8" style={{ marginBottom: '12px' }} />
                  <h3 style={{ color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                    {lang === 'pt' ? 'Pronto para Auditoria de Lançamento P07' : 'Ready for P07 Release Audit'}
                  </h3>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px', maxWidth: '500px', margin: '8px auto 0 auto' }}>
                    {lang === 'pt'
                      ? 'Clique no botão acima para verificar os 10 Portões de Auditoria e gerar o veredito oficial de produção.'
                      : 'Click button above to verify all 10 Audit Gates and generate official production verdict.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB: OPERACIONALIZAÇÃO & EMPRESA REAL */}
          {activeTab === 'operationalization' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Server size={24} color="#f59e0b" />
                    {lang === 'pt' ? 'Operacionalização de 500 AI Employees & Empresa Real' : '500 AI Employees Operationalization & Real Enterprise'}
                  </h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {lang === 'pt'
                      ? 'Máquina de 20 Estados Canónicos, Certificação Digital da Plataforma (P07 Gate Audit) e Aprovisionamento Empresarial com Regra Estrita: IF certification missing THEN ACTIVE = DENIED'
                      : '20 Canonical State Machine, Platform Digital Certification (P07 Gate Audit) & Enterprise Provisioning with Strict Deny Rule: IF certification missing THEN ACTIVE = DENIED'}
                  </p>
                </div>
              </div>

              {/* KPI Banner Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Ciclo de Vida Operacional' : 'Operational Lifecycle'}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: theme === 'dark' ? '#fbbf24' : '#d97706', marginTop: '4px' }}>
                    20 Estados Canónicos
                  </div>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '6px' }}>
                    STRUCTURALLY_READY → READY_FOR_TEST → PLATFORM_CERTIFIED → ORGANIZATION_READY → ACTIVE
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Regra de Bloqueio Estrito' : 'Strict Deny Rule Enforced'}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: theme === 'dark' ? '#f87171' : '#dc2626', marginTop: '4px' }}>
                    ACTIVE = DENIED (Sem Cert.)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '6px' }}>
                    Qualquer tentativa de ativação sem Certificado de Plataforma Válido é imediatamente rejeitada e bloqueada.
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Conetores Empresariais' : 'Enterprise Connectors'}
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: theme === 'dark' ? '#34d399' : '#059669', marginTop: '4px' }}>
                    5 Conetores Ativos
                  </div>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '6px' }}>
                    Primavera ERP v10, SQL Server, PostgreSQL, Excel OData Sync & AGT Tax Portal Angola API v2.1
                  </div>
                </div>
              </div>

              {/* Main Interactive Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
                {/* Engine 1: Platform Certification Engine */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#818cf8' : '#4f46e5', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award size={20} />
                    {lang === 'pt' ? '1. PlatformCertificationEngine (Auditoria P07)' : '1. PlatformCertificationEngine (P07 Audit)'}
                  </h3>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                      {lang === 'pt' ? 'Selecionar AI Employee (ID 1 - 500):' : 'Select AI Employee (ID 1 - 500):'}
                    </label>
                    <select
                      value={opEmpId}
                      onChange={(e) => setOpEmpId(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: theme === 'dark' ? '#1e293b' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#0f172a',
                        fontWeight: 600
                      }}
                    >
                      {CANONICAL_500_ROLES.slice(0, 50).map((r) => (
                        <option key={r.id} value={r.id}>
                          #{r.id} - {r.display_name} ({r.role_key})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      const cert = certEngine.auditAndCertify(opEmpId);
                      setOpAuditResult(cert);
                    }}
                    className="btn-primary"
                    style={{ width: '100%', padding: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    <ShieldCheck size={18} />
                    {lang === 'pt' ? `Executar Auditoria de Plataforma em #${opEmpId}` : `Run Platform Audit on #${opEmpId}`}
                  </button>

                  {opAuditResult ? (
                    <div style={{ background: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', border: '1px solid #10b981', padding: '16px', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: theme === 'dark' ? '#34d399' : '#047857' }}>
                          CERTIFICADO DIGITAL DA PLATAFORMA EMITIDO
                        </span>
                        <span className="badge badge-r1">PASSED</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#d1d5db' : '#334155', display: 'flex', flexDirection: 'column', gap: '6px', fontFamily: 'monospace' }}>
                        <div><strong>ID Certificado:</strong> {opAuditResult.certificateId}</div>
                        <div><strong>Empregado ID:</strong> #{opAuditResult.employeeId} ({opAuditResult.displayName})</div>
                        <div><strong>Role Key:</strong> {opAuditResult.roleKey}</div>
                        <div><strong>Pontuação de Avaliação:</strong> {opAuditResult.evaluationScore}% (RedTeam: {opAuditResult.redTeamVulnerabilities})</div>
                        <div><strong>Emissor:</strong> {opAuditResult.issuer}</div>
                        <div><strong>Válido Até:</strong> {new Date(opAuditResult.validUntil).toLocaleDateString()}</div>
                        <div style={{ wordBreak: 'break-all', marginTop: '4px', fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b' }}>
                          <strong>SHA-256 Hash Assinatura:</strong> {opAuditResult.signatureHash}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: '16px', borderRadius: '10px', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {lang === 'pt' ? 'Nenhuma auditoria executada para este empregado no momento.' : 'No audit executed for this employee yet.'}
                    </div>
                  )}
                </div>

                {/* Engine 2: Organization Provisioning Engine & Enterprise Activation */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#34d399' : '#059669', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Network size={20} />
                    {lang === 'pt' ? '2. OrganizationProvisioningEngine (Empresa Real)' : '2. OrganizationProvisioningEngine (Real Enterprise)'}
                  </h3>

                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '4px' }}>
                      Perfil da Empresa Alvo (Tenant Enterprise):
                    </div>
                    <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f1f5f9', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <strong>tenant_enterprise_001</strong> — Empresa Industrial & Comercial de Angola, Lda (Jurisdição: AO_ANGOLA)
                    </div>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '8px' }}>
                      Conetores Empresariais Configurados (Enterprise Connectors):
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ background: theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : '#e0e7ff', padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem' }}>
                        <span style={{ fontWeight: 700, color: theme === 'dark' ? '#818cf8' : '#3730a3' }}>Primavera ERP v10</span>
                        <div style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#9ca3af' : '#475569' }}>OData v4 Sync / PGCA</div>
                      </div>
                      <div style={{ background: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem' }}>
                        <span style={{ fontWeight: 700, color: theme === 'dark' ? '#34d399' : '#047857' }}>AGT Tax Portal</span>
                        <div style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#9ca3af' : '#475569' }}>API v2.1 Angola (SAFT)</div>
                      </div>
                      <div style={{ background: theme === 'dark' ? 'rgba(6, 182, 212, 0.1)' : '#cff4fc', padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem' }}>
                        <span style={{ fontWeight: 700, color: theme === 'dark' ? '#22d3ee' : '#087990' }}>SQL Server / PostgreSQL</span>
                        <div style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#9ca3af' : '#475569' }}>Enterprise Data Warehouse</div>
                      </div>
                      <div style={{ background: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7', padding: '8px 10px', borderRadius: '6px', fontSize: '0.78rem' }}>
                        <span style={{ fontWeight: 700, color: theme === 'dark' ? '#fbbf24' : '#b45309' }}>Local Excel OData Sync</span>
                        <div style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#9ca3af' : '#475569' }}>Folhas de Cálculo Locais</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <button
                      onClick={() => {
                        const res = orgEngine.activateEmployeeForOrganization(opTenantId, opEmpId);
                        setOpProvisionResult(res);
                      }}
                      className="btn-success"
                      style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                    >
                      {lang === 'pt' ? `Ativar #${opEmpId} na Organização` : `Activate #${opEmpId} in Org`}
                    </button>
                    <button
                      onClick={() => {
                        const res = orgEngine.activateEmployeeForOrganization(opTenantId, 498);
                        setOpProvisionResult(res);
                      }}
                      className="btn-danger"
                      style={{ flex: 1, padding: '10px', fontSize: '0.85rem' }}
                    >
                      {lang === 'pt' ? 'Testar Bloqueio (Sem Cert.)' : 'Test Deny Rule (Uncertified)'}
                    </button>
                  </div>

                  {opProvisionResult ? (
                    <div style={{ background: opProvisionResult.success ? (theme === 'dark' ? 'rgba(16, 185, 129, 0.12)' : '#ecfdf5') : (theme === 'dark' ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2'), border: `1px solid ${opProvisionResult.success ? '#10b981' : '#ef4444'}`, padding: '16px', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: opProvisionResult.success ? (theme === 'dark' ? '#34d399' : '#047857') : (theme === 'dark' ? '#f87171' : '#dc2626') }}>
                          {opProvisionResult.success ? 'APROVISIONAMENTO & ATIVAÇÃO CONCLUÍDOS' : 'BLOQUEIO DE SEGURANÇA ATIVADO (DENY RULE)'}
                        </span>
                        <span className={`badge ${opProvisionResult.success ? 'badge-r1' : 'badge-r5'}`}>{opProvisionResult.state}</span>
                      </div>
                      <p style={{ fontSize: '0.82rem', color: theme === 'dark' ? '#d1d5db' : '#334155', fontWeight: 500 }}>{opProvisionResult.message}</p>
                    </div>
                  ) : (
                    <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: '16px', borderRadius: '10px', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      {lang === 'pt' ? 'Clique num dos botões acima para testar aprovisionamento ou o bloqueio de segurança.' : 'Click a button above to test provisioning or deny rule enforcement.'}
                    </div>
                  )}
                </div>
              </div>

              {/* 20 State Machine Overview Table */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Workflow size={20} color="#6366f1" />
                  {lang === 'pt' ? 'Máquina de Estados de 20 Etapas (Operational State Machine)' : '20-Stage State Machine (Operational State Machine)'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {[
                    { stage: '01. UNINITIALIZED', desc: 'Registo inicial do AI Employee' },
                    { stage: '02. STRUCTURALLY_READY', desc: 'Passaporte estrutural 100% verificado' },
                    { stage: '03. CONTEXT_PACK_LINKED', desc: 'Pacotes ORDKS ligados' },
                    { stage: '04. WORK_CONTRACT_ATTACHED', desc: 'Contrato de Trabalho V2.1 anexado' },
                    { stage: '05. READY_FOR_TEST', desc: 'Pronto para testes automatizados' },
                    { stage: '06. AUDIT_IN_PROGRESS', desc: 'Auditoria de plataforma a decorrer' },
                    { stage: '07. PLATFORM_CERTIFIED', desc: 'Certificado Digital emitido com SHA-256' },
                    { stage: '08. ORGANIZATION_READY', desc: 'Conetores empresariais configurados' },
                    { stage: '09. ACTIVE', desc: 'Em execução operacional na empresa' },
                    { stage: '10. PAUSED', desc: 'Pausa operacional temporária' },
                    { stage: '11. BLOCKED', desc: 'Bloqueado por violação ou negação' },
                    { stage: '12. DEGRADED', desc: 'Operação com falhas parciais em conetores' },
                    { stage: '13. MAINTENANCE', desc: 'Manutenção e atualização de conhecimentos' },
                    { stage: '14. REVOKED', desc: 'Certificado revogado pela autoridade' },
                    { stage: '15. SUSPENDED', desc: 'Suspenso por intervenção humana' },
                    { stage: '16. QUARANTINED', desc: 'Quarentena de segurança (Red Team)' },
                    { stage: '17. RETIRED', desc: 'Descontinuado / Reformado' },
                    { stage: '18. ARCHIVED', desc: 'Arquivado no registo histórico' },
                    { stage: '19. RE-CERTIFYING', desc: 'Em re-certificação anual' },
                    { stage: '20. TERMINATED', desc: 'Eliminado com eliminação de segredos' }
                  ].map((st, i) => (
                    <div key={i} style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: theme === 'dark' ? '#818cf8' : '#4f46e5' }}>{st.stage}</div>
                      <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '2px' }}>{st.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: EREMS — FIABILIDADE & ERROS */}
          {activeTab === 'erems' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Activity size={24} color="#ef4444" />
                    {lang === 'pt' ? 'Employee Reliability & Error Measurement System (EREMS)' : 'Employee Reliability & Error Measurement System (EREMS)'}
                  </h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {lang === 'pt'
                      ? 'Medição Multidimensional de Fiabilidade, Undetected Material Error Rate (UMER) com 95% Wilson Score CI e Matriz de Severidade (E0-E5)'
                      : 'Multidimensional Reliability Measurement, Undetected Material Error Rate (UMER) with 95% Wilson Score CI & Severity Matrix (E0-E5)'}
                  </p>
                </div>
              </div>

              {/* Global EREMS Metrics Banner */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Sucesso Global de Tarefas' : 'Global Task Success'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#34d399' : '#059669', marginTop: '4px' }}>
                    {eremsSummary.globalTaskSuccessRate}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    500 AI Employees Monitorizados
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'UMER (Taxa Erro Material Não Deteotado)' : 'UMER (Undetected Material Error)'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#f87171' : '#dc2626', marginTop: '4px' }}>
                    {eremsSummary.globalUMER}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    95% CI: [{(eremsSummary.globalUMERConfidenceInterval.lowerBound95 * 100).toFixed(1)}% - {(eremsSummary.globalUMERConfidenceInterval.upperBound95 * 100).toFixed(1)}%]
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Erros Críticos (E4 / E5)' : 'Critical Errors (E4 / E5)'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#fbbf24' : '#d97706', marginTop: '4px' }}>
                    {eremsSummary.severityBreakdown.E4_CRITICAL + eremsSummary.severityBreakdown.E5_CATASTROPHIC}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    Bloqueio / Escalação Automática L4
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #6366f1' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Incidentes Registados' : 'Logged Incidents'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#818cf8' : '#4f46e5', marginTop: '4px' }}>
                    {eremsSummary.totalIncidentsLogged}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    Em 30 Categorias Taxonómicas
                  </div>
                </div>
              </div>

              {/* Main Interactive Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
                {/* Column 1: Employee Reliability Passport Inspector */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#818cf8' : '#4f46e5', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={20} />
                    {lang === 'pt' ? 'Passaporte de Fiabilidade por AI Employee' : 'Employee Reliability Passport'}
                  </h3>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                      {lang === 'pt' ? 'Selecionar AI Employee (ID 1 - 500):' : 'Select AI Employee (ID 1 - 500):'}
                    </label>
                    <select
                      value={eremsEmpId}
                      onChange={(e) => {
                        const id = Number(e.target.value);
                        setEremsEmpId(id);
                        setEremsPassport(eremsEngine.getPassport(id));
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: theme === 'dark' ? '#1e293b' : '#fff',
                        color: theme === 'dark' ? '#fff' : '#0f172a',
                        fontWeight: 600
                      }}
                    >
                      {CANONICAL_500_ROLES.slice(0, 50).map((r) => (
                        <option key={r.id} value={r.id}>
                          #{r.id} - {r.display_name} ({r.role_key})
                        </option>
                      ))}
                    </select>
                  </div>

                  {eremsPassport && (
                    <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                            #{eremsPassport.employeeId} - {eremsPassport.displayName}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b' }}>
                            Departamento: {eremsPassport.department} | Role Key: {eremsPassport.roleKey}
                          </div>
                        </div>
                        <span className={`badge ${eremsPassport.certificationVerdict === 'CERTIFIED_AUTONOMOUS' ? 'badge-r1' : 'badge-r5'}`}>
                          {eremsPassport.certificationVerdict}
                        </span>
                      </div>

                      {/* Key Metrics Breakdown */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                        <div style={{ background: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', padding: '10px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>Sucesso em Tarefas</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: theme === 'dark' ? '#34d399' : '#047857' }}>
                            {eremsPassport.metrics.taskSuccessRate}%
                          </div>
                          <div style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#9ca3af' : '#64748b' }}>
                            {eremsPassport.metrics.successfulTasks} / {eremsPassport.metrics.totalTasksEvaluated} tarefas
                          </div>
                        </div>

                        <div style={{ background: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', padding: '10px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>UMER (Erro Material Não Deteotado)</div>
                          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: theme === 'dark' ? '#f87171' : '#dc2626' }}>
                            {eremsPassport.metrics.umer}%
                          </div>
                          <div style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#9ca3af' : '#64748b' }}>
                            95% CI: [{(eremsPassport.metrics.umerConfidenceInterval.lowerBound95 * 100).toFixed(1)}% - {(eremsPassport.metrics.umerConfidenceInterval.upperBound95 * 100).toFixed(1)}%]
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8rem', background: theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : '#e0e7ff', padding: '10px', borderRadius: '8px', marginBottom: '14px' }}>
                        <strong>Nível de Supervisão Atribuído:</strong> {eremsPassport.assignedSupervisionLevel}
                      </div>

                      {/* Incident History List */}
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Histórico de Incidentes ({eremsPassport.incidentHistory.length}):</div>
                      {eremsPassport.incidentHistory.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                          {eremsPassport.incidentHistory.map((inc) => (
                            <div key={inc.incidentId} style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#fff', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.75rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                                <span style={{ color: inc.severity === 'E4_CRITICAL' || inc.severity === 'E5_CATASTROPHIC' ? '#ef4444' : '#f59e0b' }}>
                                  {inc.severity} ({inc.category})
                                </span>
                                <span style={{ color: 'var(--text-dim)' }}>{new Date(inc.timestamp).toLocaleTimeString()}</span>
                              </div>
                              <div style={{ color: theme === 'dark' ? '#d1d5db' : '#334155', marginTop: '2px' }}>{inc.taskDescription}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Sem incidentes registados nesta sessão.</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Column 2: Incident Simulator & Root Cause EREMS Studio */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#f59e0b' : '#d97706', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={20} />
                    {lang === 'pt' ? 'Simulador de Incidentes & Causa-Raiz (EREMS Studio)' : 'Incident Simulator & Root Cause (EREMS Studio)'}
                  </h3>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Nível de Severidade (E0 - E5):</label>
                    <select
                      value={simSeverity}
                      onChange={(e) => setSimSeverity(e.target.value as ErrorSeverity)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                    >
                      <option value="E1_MINOR">E1 — MINOR (Erro de Formatação / Gramática)</option>
                      <option value="E2_OPERATIONAL">E2 — OPERATIONAL (Erro de Categoria / Retrebalho)</option>
                      <option value="E3_MATERIAL">E3 — MATERIAL (Erro em Valor / Fiscal / Contabilístico)</option>
                      <option value="E4_CRITICAL">E4 — CRITICAL (Pagamento Errado / Exposição de Dados)</option>
                      <option value="E5_CATASTROPHIC">E5 — CATASTROPHIC (Vazamento Cross-Tenant / Ação Irreversível)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Categoria de Causa-Raiz (Taxonomia):</label>
                    <select
                      value={simCategory}
                      onChange={(e) => setSimCategory(e.target.value as ErrorTaxonomyCategory)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                    >
                      <option value="CALCULATION_ERROR">CALCULATION_ERROR (Erro de Cálculo Causal)</option>
                      <option value="POLICY_ERROR">POLICY_ERROR (Violação de Política ou Norma)</option>
                      <option value="HALLUCINATION">HALLUCINATION (Geração de Dado Falso/Sem Suporte)</option>
                      <option value="PERMISSION_ERROR">PERMISSION_ERROR (Acesso/Ação Não Autorizada)</option>
                      <option value="CONNECTOR_ERROR">CONNECTOR_ERROR (Falha de Integração no Conetor ERP)</option>
                      <option value="DATA_MAPPING_ERROR">DATA_MAPPING_ERROR (Mapeamento Incorreto de Campos)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Descrição da Tarefa Executada:</label>
                    <input
                      type="text"
                      value={simTaskDesc}
                      onChange={(e) => setSimTaskDesc(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={simIsMaterial} onChange={(e) => setSimIsMaterial(e.target.checked)} />
                      <span>É Erro Material?</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <input type="checkbox" checked={simIsUndetected} onChange={(e) => setSimIsUndetected(e.target.checked)} />
                      <span>Chegou Não Deteotado? (Afeta UMER)</span>
                    </label>
                  </div>

                  <button
                    onClick={() => {
                      eremsEngine.logIncident(eremsEmpId, simSeverity, simCategory, simTaskDesc, simIsMaterial, simIsUndetected);
                      setEremsPassport({ ...eremsEngine.getPassport(eremsEmpId)! });
                      setEremsSummary(eremsEngine.getGlobalSummary());
                    }}
                    className="btn-danger"
                    style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    <AlertTriangle size={18} />
                    {lang === 'pt' ? `Simular & Registar Incidente em #${eremsEmpId}` : `Simulate & Log Incident on #${eremsEmpId}`}
                  </button>
                </div>
              </div>

              {/* Error Severity Model Matrix */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={20} color="#6366f1" />
                  {lang === 'pt' ? 'Modelo de Severidade de Erros E0 - E5 (Error Severity Model)' : 'Error Severity Model (E0 - E5)'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {[
                    { lvl: 'E0 — NO_ERROR', desc: 'Execução perfeita sem falhas', color: '#10b981' },
                    { lvl: 'E1 — MINOR', desc: 'Erro estético, formatação ou ortografia sem impacto', color: '#3b82f6' },
                    { lvl: 'E2 — OPERATIONAL', desc: 'Erro de roteamento/categoria que exige retrabalho humano', color: '#8b5cf6' },
                    { lvl: 'E3 — MATERIAL', desc: 'Erro financeiro/fiscal/contabilístico que altera obrigação ou valor', color: '#f59e0b' },
                    { lvl: 'E4 — CRITICAL', desc: 'Pagamento indevido, quebra de controlo ou exposição de dados', color: '#ef4444' },
                    { lvl: 'E5 — CATASTROPHIC', desc: 'Violação entre tenants, transferência não autorizada, ação irreversível', color: '#b91c1c' }
                  ].map((s, i) => (
                    <div key={i} style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: `4px solid ${s.color}` }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: s.color }}>{s.lvl}</div>
                      <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CAQRS — ACEITAÇÃO & QUALIDADE */}
          {activeTab === 'caqrs' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckSquare size={24} color="#10b981" />
                    {lang === 'pt' ? 'Client Acceptance, Quality & Revision System (CAQRS)' : 'Client Acceptance, Quality & Revision System (CAQRS)'}
                  </h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {lang === 'pt'
                      ? 'Aceitação do Cliente, Qualidade Percebida, Diferenciação Estrita de Erro vs. Preferência do Cliente e Aprendizagem de Preferências da Organização'
                      : 'Client Acceptance, Perceived Quality, Strict Error vs. Preference Classification & Organization Preference Learning'}
                  </p>
                </div>
              </div>

              {/* Global CAQRS Banner Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'FPAR (Aceitação à 1ª Entrega)' : 'First Pass Acceptance Rate'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#34d399' : '#059669', marginTop: '4px' }}>
                    {caqrsSummary.firstPassAcceptanceRate}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    Aprovação Sem Necessidade de Revisão
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Taxa de Revisões Solicitadas' : 'Revision Rate'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#fbbf24' : '#d97706', marginTop: '4px' }}>
                    {caqrsSummary.revisionRate}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    Ajustes de Preferência ou Escopo
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #6366f1' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'QPI (Índice Qualidade Percebida)' : 'Quality Perception Index'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#818cf8' : '#4f46e5', marginTop: '4px' }}>
                    {caqrsSummary.qualityPerceptionIndex}/100
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    Avaliação Contínua do Cliente
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #06b6d4' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Preferências Aprendidas' : 'Learned Preferences'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#22d3ee' : '#0891b2', marginTop: '4px' }}>
                    {caqrsSummary.totalLearnedPreferences}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    Pacote OrganizationPreferencePack
                  </div>
                </div>
              </div>

              {/* Main Interactive Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
                {/* Column 1: Client Acceptance & Feedback Studio */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#34d399' : '#059669', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckSquare size={20} />
                    {lang === 'pt' ? 'Studio de Aceitação & Feedback de Cliente' : 'Client Acceptance & Feedback Studio'}
                  </h3>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>AI Employee Entregador:</label>
                    <select
                      value={fbEmpId}
                      onChange={(e) => setFbEmpId(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', fontWeight: 600 }}
                    >
                      {CANONICAL_500_ROLES.slice(0, 50).map((r) => (
                        <option key={r.id} value={r.id}>
                          #{r.id} - {r.display_name} ({r.role_key})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Decisão de Aceitação do Cliente:</label>
                    <select
                      value={fbAcceptState}
                      onChange={(e) => setFbAcceptState(e.target.value as AcceptanceState)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                    >
                      <option value="ACCEPTED">ACCEPTED (Aceito Sem Alterações)</option>
                      <option value="ACCEPTED_WITH_MINOR_CHANGES">ACCEPTED_WITH_MINOR_CHANGES (Aceito com Pequenos Ajustes)</option>
                      <option value="REVISION_REQUIRED">REVISION_REQUIRED (Revisão Necessária)</option>
                      <option value="REJECTED">REJECTED (Rejeitado)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Classificação do Feedback (Taxonomia CAQRS):</label>
                    <select
                      value={fbCategory}
                      onChange={(e) => setFbCategory(e.target.value as FeedbackCategory)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                    >
                      <option value="FORMAT_PREFERENCE">FORMAT_PREFERENCE (Preferência de Formato / Layout - Não Penaliza UMER)</option>
                      <option value="STYLE_PREFERENCE">STYLE_PREFERENCE (Preferência de Estilo / Tom - Não Penaliza UMER)</option>
                      <option value="NEW_REQUIREMENT">NEW_REQUIREMENT (Nova Exigência / Pedido Adicional - Não Penaliza UMER)</option>
                      <option value="SCOPE_CHANGE">SCOPE_CHANGE (Alteração de Escopo - Não Penaliza UMER)</option>
                      <option value="OBJECTIVE_ERROR">OBJECTIVE_ERROR (Erro Objetivo / Incorreção Factual - Alimenta EREMS/UMER)</option>
                      <option value="MATERIAL_ERROR">MATERIAL_ERROR (Erro Material / Cálculo ou Norma Errada - Alimenta EREMS/UMER)</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Comentário / Observações do Cliente:</label>
                    <input
                      type="text"
                      value={fbComment}
                      onChange={(e) => setFbComment(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Alterações Solicitadas (separadas por vírgula):</label>
                    <input
                      type="text"
                      value={fbChanges}
                      onChange={(e) => setFbChanges(e.target.value)}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                    />
                  </div>

                  <button
                    onClick={() => {
                      const role = CANONICAL_500_ROLES.find((r) => r.id === fbEmpId);
                      const changesArr = fbChanges.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
                      const res = caqrsEngine.processClientFeedback(
                        fbEmpId,
                        role?.role_key || 'management_reporting',
                        `work_prod_${fbEmpId}_${Date.now()}`,
                        fbAcceptState,
                        fbCategory,
                        fbComment,
                        changesArr
                      );
                      setLastFeedbackResult(res);
                      setCaqrsSummary(caqrsEngine.getGlobalSummary());
                      setCaqrsPreferences(caqrsEngine.getLearnedPreferences());
                      setEremsSummary(eremsEngine.getGlobalSummary());
                    }}
                    className="btn-success"
                    style={{ width: '100%', padding: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  >
                    <CheckSquare size={18} />
                    {lang === 'pt' ? `Processar Feedback de Cliente em #${fbEmpId}` : `Process Client Feedback on #${fbEmpId}`}
                  </button>

                  {/* Feedback Result Box */}
                  {lastFeedbackResult && (
                    <div style={{ marginTop: '16px', background: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', border: '1px solid #10b981', padding: '14px', borderRadius: '10px', fontSize: '0.8rem' }}>
                      <div style={{ fontWeight: 700, color: theme === 'dark' ? '#34d399' : '#047857', marginBottom: '4px' }}>
                        DECISÃO PROCESSADA COM SUCESSO
                      </div>
                      <div><strong>Estado:</strong> {lastFeedbackResult.feedback.acceptanceState}</div>
                      <div><strong>Classificação:</strong> {lastFeedbackResult.feedback.category} ({lastFeedbackResult.feedback.isObjectiveError ? 'Erro Objetivo — Alimentou EREMS/UMER' : 'Preferência/Escopo — Protegido de Penalização UMER'})</div>
                      {lastFeedbackResult.feedback.learnedPreferenceRule && (
                        <div style={{ color: '#06b6d4', marginTop: '4px' }}>
                          <strong>Regra Aprendida:</strong> {lastFeedbackResult.feedback.learnedPreferenceRule} (Alimentou OrganizationPreferencePack)
                        </div>
                      )}
                      {lastFeedbackResult.revisionPlan && (
                        <div style={{ marginTop: '6px', background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#fff', padding: '8px', borderRadius: '6px' }}>
                          <strong>Plano de Revisão Gerado ({lastFeedbackResult.revisionPlan.planId}):</strong>
                          <div>Secções Preservadas: {lastFeedbackResult.revisionPlan.preservedSections.join(', ')}</div>
                          <div>Secções a Modificar: {lastFeedbackResult.revisionPlan.modifiedSections.join(', ')}</div>
                          <div>Tempo Estimado de Re-trabalho: {lastFeedbackResult.revisionPlan.estimatedReworkMinutes} min</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Column 2: Organization Preference Pack Inspector */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#22d3ee' : '#0891b2', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={20} />
                    {lang === 'pt' ? 'Preferências Aprendidas da Organização (OrganizationPreferencePack)' : 'Learned Organization Preferences (OrganizationPreferencePack)'}
                  </h3>

                  <p style={{ fontSize: '0.82rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '16px' }}>
                    Regras de estilo, tom, formato e modelo aprendidas automaticamente a partir do feedback dos clientes. O motor aplica-as em futuras entregas sem penalizar a fiabilidade ou UMER dos AI Employees.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
                    {caqrsPreferences.map((pref) => (
                      <div key={pref.ruleId} style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: theme === 'dark' ? '#22d3ee' : '#0891b2' }}>
                            {pref.preferenceKey}
                          </span>
                          <span className="badge badge-l3" style={{ fontSize: '0.7rem' }}>
                            {pref.scope}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? '#fff' : '#0f172a', fontWeight: 600 }}>
                          Valor: {pref.preferenceValue}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                          Categoria Origem: {pref.targetCategory} | Aprendida em: {new Date(pref.learnedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Taxonomy Classification Table */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Workflow size={20} color="#6366f1" />
                  {lang === 'pt' ? 'Matriz de Classificação de Feedback CAQRS' : 'CAQRS Feedback Classification Matrix'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ background: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ef4444' }}>1. ERRO OBJECTIVO / MATERIAL</div>
                    <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#d1d5db' : '#334155', marginTop: '6px' }}>
                      Incorreção factual, NIF errado, fórmula de cálculo incorreta ou norma violada.
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '8px', fontWeight: 700 }}>
                      → Alimenta o EREMS / Recalcula o UMER
                    </div>
                  </div>

                  <div style={{ background: theme === 'dark' ? 'rgba(6, 182, 212, 0.1)' : '#cff4fc', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #06b6d4' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#06b6d4' }}>2. PREFERÊNCIA DO CLIENTE</div>
                    <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#d1d5db' : '#334155', marginTop: '6px' }}>
                      Ajuste de estilo, tom, formato, extensão ou layout ("quero mais curto", "usar tom formal").
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#06b6d4', marginTop: '8px', fontWeight: 700 }}>
                      → Protegido de UMER / Alimenta OrganizationPreferencePack
                    </div>
                  </div>

                  <div style={{ background: theme === 'dark' ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f59e0b' }}>3. ALTERAÇÃO DE ESCOPO / NOVO PEDIDO</div>
                    <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#d1d5db' : '#334155', marginTop: '6px' }}>
                      Novas exigências ou requisitos adicionados após o pedido inicial.
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '8px', fontWeight: 700 }}>
                      → Protegido de UMER / Gera RevisionPlan com estimativa
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLBGS — BRAND GOVERNANCE & STATIONERY SYSTEM */}
          {activeTab === 'clbgs' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileCode size={24} color="#3b82f6" />
                    {lang === 'pt' ? 'Corporate Letterhead, Brand Governance & Stationery System (CLBGS)' : 'Corporate Letterhead, Brand Governance & Stationery System (CLBGS)'}
                  </h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {lang === 'pt'
                      ? 'Governação de Identidade Institucional, Papel Timbrado Digital & Pré-Impresso, Assinaturas Autorizadas e Templates Oficiais para os 500 AI Employees'
                      : 'Corporate Brand Identity Governance, Digital & Pre-printed Stationery Modes, Authorized Signatures & Official Templates for 500 AI Employees'}
                  </p>
                </div>
              </div>

              {/* CLBGS Banner Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Ativos de Marca Aprovados' : 'Approved Brand Assets'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#60a5fa' : '#2563eb', marginTop: '4px' }}>
                    {clbgsSummary.approvedAssetsCount} / {clbgsSummary.totalAssets}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    Isolamento Multi-Tenant Ativo
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Modo de Timbre Padrão' : 'Default Stationery Mode'}
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: theme === 'dark' ? '#34d399' : '#059669', marginTop: '4px' }}>
                    {clbgsSummary.defaultStationeryMode}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    Suporte Digital, Pré-Impresso & Híbrido
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Templates Institucionais' : 'Corporate Templates'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#fbbf24' : '#d97706', marginTop: '4px' }}>
                    {clbgsSummary.totalTemplates}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    Modelos A4 Versionados por Categoria
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Signatários Autorizados' : 'Authorized Signatories'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#a78bfa' : '#7c3aed', marginTop: '4px' }}>
                    {clbgsSummary.authorizedSignatoriesCount}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    Hash SHA-256 de Imutabilidade
                  </div>
                </div>
              </div>

              {/* Main Grid Panels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px', marginBottom: '24px' }}>
                {/* Simulator Studio */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={20} color="#3b82f6" />
                    {lang === 'pt' ? 'Simulador de Renderização de Timbre CLBGS' : 'CLBGS Stationery Rendering Simulator'}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569' }}>
                        Organização (Tenant ID):
                      </label>
                      <select
                        value={clbgsOrgId}
                        onChange={(e) => setClbgsOrgId(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#0f172a' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', marginTop: '4px' }}
                      >
                        <option value="org_default_angola">ENTEC S.A. (org_default_angola)</option>
                        <option value="org_tenant_other_company">OUTRA EMPRESA (org_tenant_other_company - Bloqueado)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569' }}>
                        Tipo de Documento:
                      </label>
                      <select
                        value={clbgsDocType}
                        onChange={(e) => setClbgsDocType(e.target.value as TemplateCategory)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#0f172a' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', marginTop: '4px' }}
                      >
                        <option value="LETTER">LETTER (Carta Timbrada Oficial)</option>
                        <option value="CONTRACT">CONTRACT (Contrato Institucional)</option>
                        <option value="REPORT">REPORT (Relatório de Gestão)</option>
                        <option value="PROPOSAL">PROPOSAL (Proposta Comercial)</option>
                        <option value="TAX_LETTER">TAX_LETTER (Ofício AGT Fiscal)</option>
                        <option value="BANK_LETTER">BANK_LETTER (Carta Bancária)</option>
                        <option value="NOTICE">NOTICE (Aviso Geral)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569' }}>
                        Modo de Papel Timbrado:
                      </label>
                      <select
                        value={clbgsMode}
                        onChange={(e) => setClbgsMode(e.target.value as StationeryMode)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#0f172a' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', marginTop: '4px' }}
                      >
                        <option value="DIGITAL_LETTERHEAD">DIGITAL_LETTERHEAD (Logotipo + Cabeçalho Completo Digital)</option>
                        <option value="PREPRINTED_STATIONERY">PREPRINTED_STATIONERY (Folha Física Pré-Timbrada - Sem Logo Visual)</option>
                        <option value="PLAIN_PAPER">PLAIN_PAPER (Texto Simples Sem Ornamento)</option>
                        <option value="HYBRID">HYBRID (Logo Pré-Impresso + Rodapé Digital)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569' }}>
                        Signatário Autorizado:
                      </label>
                      <select
                        value={clbgsSignatoryId}
                        onChange={(e) => setClbgsSignatoryId(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#0f172a' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', marginTop: '4px' }}
                      >
                        <option value="sig_ceo_001">Dr. António Silva (Director Geral / CEO)</option>
                        <option value="">NENHUM (Sem Assinatura Visual)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const ctx = clbgsEngine.generateCLBGSRenderContext({
                        organizationId: clbgsOrgId,
                        documentId: `doc_${Date.now()}`,
                        documentType: clbgsDocType,
                        employeeId: 73,
                        stationeryMode: clbgsMode,
                        signatoryId: clbgsSignatoryId || undefined,
                        rawDocumentContent: `Documento Simulado ${clbgsDocType} para ${clbgsOrgId}`
                      });
                      setClbgsRenderCtx(ctx);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    {lang === 'pt' ? 'Simular Renderização CLBGS' : 'Simulate CLBGS Render Context'}
                  </button>

                  {/* Render Context Output Receipt */}
                  <div style={{ marginTop: '20px', background: theme === 'dark' ? '#090d16' : '#f1f5f9', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                        Resultado do Contexto de Renderização:
                      </span>
                      <span className={`badge ${clbgsRenderCtx.validationStatus === 'VALID' ? 'badge-l1' : 'badge-r4'}`}>
                        {clbgsRenderCtx.validationStatus}
                      </span>
                    </div>

                    {clbgsRenderCtx.validationStatus !== 'VALID' ? (
                      <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
                        ⚠️ BLOQUEADO POR REGRA DE GOVERNAÇÃO: {clbgsRenderCtx.blockReason}
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                          <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff', padding: '8px', borderRadius: '6px' }}>
                            <div style={{ color: '#9ca3af', fontSize: '0.72rem' }}>Logo Visível:</div>
                            <div style={{ fontWeight: 700, color: clbgsRenderCtx.renderLogo ? '#34d399' : '#f87171' }}>
                              {clbgsRenderCtx.renderLogo ? 'SIM' : 'NÃO (Pré-Impresso/Plain)'}
                            </div>
                          </div>

                          <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff', padding: '8px', borderRadius: '6px' }}>
                            <div style={{ color: '#9ca3af', fontSize: '0.72rem' }}>Cabeçalho Digital:</div>
                            <div style={{ fontWeight: 700, color: clbgsRenderCtx.renderHeaderIdentity ? '#34d399' : '#f87171' }}>
                              {clbgsRenderCtx.renderHeaderIdentity ? 'SIM' : 'SUPRIMIDO'}
                            </div>
                          </div>

                          <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff', padding: '8px', borderRadius: '6px' }}>
                            <div style={{ color: '#9ca3af', fontSize: '0.72rem' }}>Rodapé Digital:</div>
                            <div style={{ fontWeight: 700, color: clbgsRenderCtx.renderFooterIdentity ? '#34d399' : '#f87171' }}>
                              {clbgsRenderCtx.renderFooterIdentity ? 'SIM' : 'SUPRIMIDO'}
                            </div>
                          </div>
                        </div>

                        <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#fff', padding: '10px', borderRadius: '6px' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', marginBottom: '4px' }}>
                            Reserva de Margens Físicas de Segurança:
                          </div>
                          <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#d1d5db' : '#334155' }}>
                            Margem Superior: <strong>{clbgsRenderCtx.layout.topMarginMm}mm</strong> | Margem Inferior: <strong>{clbgsRenderCtx.layout.bottomMarginMm}mm</strong> | Área Segura Cabeçalho: <strong>{clbgsRenderCtx.layout.headerReservedAreaMm}mm</strong> | Área Segura Rodapé: <strong>{clbgsRenderCtx.layout.footerReservedAreaMm}mm</strong>
                          </div>
                        </div>

                        {clbgsRenderCtx.signatory && (
                          <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '10px', borderRadius: '6px', borderLeft: '3px solid #8b5cf6' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa' }}>
                              Assinatura Autorizada Emitida: {clbgsRenderCtx.signatory.fullName} ({clbgsRenderCtx.signatory.roleTitle})
                            </div>
                            <div style={{ fontSize: '0.7rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px', fontFamily: 'monospace' }}>
                              Hash Criptográfico SHA-256 Imutável: {clbgsRenderCtx.signedHashSha256}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Organization Brand Pack Inspector */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Globe size={20} color="#10b981" />
                    {lang === 'pt' ? 'Inspetor OrganizationBrandPack (ENTEC SA)' : 'OrganizationBrandPack Inspector'}
                  </h3>

                  {(() => {
                    const pack = clbgsEngine.getBrandPack('org_default_angola');
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600 }}>Identidade Legal da Empresa</div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#0f172a', marginTop: '2px' }}>
                            {pack.legalIdentity.legalName} ({pack.legalIdentity.commercialName})
                          </div>
                          <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? '#d1d5db' : '#475569', marginTop: '4px' }}>
                            NIF: <strong>{pack.legalIdentity.nif}</strong> | Licença: <strong>{pack.legalIdentity.licenseReference}</strong>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '2px' }}>
                            {pack.legalIdentity.registeredAddress}, {pack.legalIdentity.city} ({pack.legalIdentity.country})
                          </div>
                        </div>

                        <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: '6px' }}>Paleta de Cores Corporativas Aprovada</div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <div style={{ background: pack.colors.primaryColorHex, color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                              Primary: {pack.colors.primaryColorHex}
                            </div>
                            <div style={{ background: pack.colors.secondaryColorHex, color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                              Secondary: {pack.colors.secondaryColorHex}
                            </div>
                            <div style={{ background: pack.colors.accentColorHex, color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700 }}>
                              Accent: {pack.colors.accentColorHex}
                            </div>
                          </div>
                        </div>

                        <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '12px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>Regra de Isolamento Multi-Tenant</div>
                          <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? '#34d399' : '#059669', fontWeight: 700 }}>
                            ✓ CROSS_TENANT_BRAND_USE → BLOCK (Impedimento absoluto de vazamento de marcas)
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* TAB: AESSRE — HIRING, SALARY, SUBSCRIPTION & REVENUE ENGINE */}
          {activeTab === 'aessre' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Coins size={24} color="#10b981" />
                    {lang === 'pt' ? 'AI Employee Hiring, Salary, Subscription & Revenue Engine (AESSRE)' : 'AI Employee Hiring, Salary, Subscription & Revenue Engine (AESSRE)'}
                  </h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {lang === 'pt'
                      ? 'Monetização de 500 Roles em Produtos Comerciais, Experiência de Contratação ("Salário Digital Mensal"), Gestão de Instâncias & Revenue Operations (MRR)'
                      : 'Commercial Productization of 500 Roles, Hiring Experience ("Digital Monthly Salary"), Instance Lifecycle & SaaS Revenue Operations (MRR)'}
                  </p>
                </div>
              </div>

              {/* AESSRE Revenue Ops Banner Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'MRR Total (Receita Recorrente)' : 'Total Monthly Recurring Revenue'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#34d399' : '#059669', marginTop: '4px' }}>
                    {aessreMetrics.totalMrrAoa.toLocaleString()} AOA
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    {aessreMetrics.activeSubscriptionsCount} Subscrições Ativas
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #6366f1' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Instâncias / Salários Digitais' : 'Active Digital Employee Instances'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#818cf8' : '#4f46e5', marginTop: '4px' }}>
                    {aessreMetrics.activeInstancesCount}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    Instâncias Alocadas a Departamentos
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #06b6d4' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'ARPU Média por Subscrição' : 'Average Revenue Per User'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#22d3ee' : '#0891b2', marginTop: '4px' }}>
                    {aessreMetrics.arpuAoa.toLocaleString()} AOA
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    Valor Médio por Empregado / Mês
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontWeight: 600, textTransform: 'uppercase' }}>
                    {lang === 'pt' ? 'Margem Bruta Unitária' : 'Gross Profit Margin'}
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme === 'dark' ? '#fbbf24' : '#d97706', marginTop: '4px' }}>
                    {aessreMetrics.grossMarginPercent}%
                  </div>
                  <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>
                    SaaS High-Margin Digital Workforce
                  </div>
                </div>
              </div>

              {/* Main Grid Panels */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px', marginBottom: '24px' }}>
                {/* Hiring Studio */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShoppingCart size={20} color="#10b981" />
                    {lang === 'pt' ? 'Studio de Contratação de Empregado Digital ("Hire Employee")' : 'Digital Employee Hiring Studio'}
                  </h3>

                  {hireSuccessMsg && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 600 }}>
                      ✓ {hireSuccessMsg}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569' }}>
                        Selecionar AI Employee (1..500):
                      </label>
                      <select
                        value={hireRoleId}
                        onChange={(e) => setHireRoleId(Number(e.target.value))}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#0f172a' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', marginTop: '4px' }}
                      >
                        {CANONICAL_500_ROLES.slice(0, 30).map((r) => (
                          <option key={r.id} value={r.id}>
                            #{r.id} — {r.display_name} ({r.department})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569' }}>
                        Plano de Subscrição:
                      </label>
                      <select
                        value={hirePlanTier}
                        onChange={(e) => setHirePlanTier(e.target.value as SubscriptionTier)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#0f172a' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', marginTop: '4px' }}
                      >
                        <option value="STARTER">STARTER (500 Tarefas/mês)</option>
                        <option value="PROFESSIONAL">PROFESSIONAL (2.000 Tarefas/mês)</option>
                        <option value="ENTERPRISE">ENTERPRISE (10.000 Tarefas/mês)</option>
                      </select>
                    </div>
                  </div>

                  {(() => {
                    const prod = aessreEngine.getProduct(hireRoleId);
                    const selectedPlan = prod?.availablePlans.find((p) => p.tier === hirePlanTier) || prod?.availablePlans[0];
                    return (
                      <div style={{ background: theme === 'dark' ? '#090d16' : '#f1f5f9', padding: '16px', borderRadius: '10px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                            {prod?.commercialName}
                          </span>
                          <span className="badge badge-l1">{selectedPlan?.tier}</span>
                        </div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginBottom: '6px' }}>
                          {selectedPlan?.digitalSalaryDisplayLabel}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#9ca3af' : '#64748b' }}>
                          Descrição Jurídica Contabilística: <strong>MONTHLY_SUBSCRIPTION_FEE (SaaS)</strong> | Conetores Incluídos: <strong>{selectedPlan?.includedConnectors}</strong>
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    onClick={() => {
                      const res = aessreEngine.hireEmployeeInstance({
                        organizationId: 'tenant_enterprise_001',
                        roleId: hireRoleId,
                        planTier: hirePlanTier,
                        supervisorId: 'usr_admin_001',
                        departmentId: hireDept,
                        currency: 'AOA'
                      });
                      setAessreInstances(aessreEngine.getAllInstances());
                      setAessreMetrics(aessreEngine.getRevenueMetrics());
                      setHireSuccessMsg(`Instância '${res.instance.displayName}' (${res.instance.instanceId}) contratada com sucesso com Salário Digital de ${res.instance.digitalSalaryMonthly.toLocaleString()} AOA/mês!`);
                      setTimeout(() => setHireSuccessMsg(null), 6000);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: '#fff',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    {lang === 'pt' ? 'Confirmar Contratação ("Hire Digital Employee")' : 'Confirm Digital Employee Hiring'}
                  </button>
                </div>

                {/* Hired Instances Inspector */}
                <div className="glass-card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={20} color="#6366f1" />
                    {lang === 'pt' ? 'Instâncias Contratadas & Salários Digitais' : 'Active Employee Instances & Salaries'}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '380px', overflowY: 'auto' }}>
                    {aessreInstances.map((inst) => (
                      <div key={inst.instanceId} style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #6366f1' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                            {inst.displayName}
                          </span>
                          <span className={`badge ${inst.status === 'ACTIVE' ? 'badge-l1' : 'badge-l3'}`}>
                            {inst.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                          ID: {inst.instanceId} | Dep: {inst.departmentId}
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
                          Salário Digital: {inst.digitalSalaryMonthly.toLocaleString()} {inst.currency}/mês ({inst.planTier})
                        </div>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                          {inst.status === 'ACTIVE' ? (
                            <button
                              onClick={() => {
                                aessreEngine.transitionInstanceStatus(inst.instanceId, 'PAUSED');
                                setAessreInstances(aessreEngine.getAllInstances());
                                setAessreMetrics(aessreEngine.getRevenueMetrics());
                              }}
                              style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Pausar
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                aessreEngine.transitionInstanceStatus(inst.instanceId, 'ACTIVE');
                                setAessreInstances(aessreEngine.getAllInstances());
                                setAessreMetrics(aessreEngine.getRevenueMetrics());
                              }}
                              style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Re-ativar
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Team Bundles Section */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={20} color="#f59e0b" />
                  {lang === 'pt' ? 'Pacotes de Equipas Digitais (Team & Department Bundles)' : 'Digital Team & Department Bundles'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  {aessreEngine.getAllTeamBundles().map((bundle) => (
                    <div key={bundle.teamId} style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #f59e0b' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                          {bundle.teamName}
                        </span>
                        <span className="badge badge-l3">Desconto {bundle.bundleDiscountPercent}%</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#d1d5db' : '#475569', marginTop: '6px' }}>
                        {bundle.description}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '8px' }}>
                        Roles Incluídos: <strong>{bundle.bundledRoleKeys.join(', ')}</strong>
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '10px' }}>
                        Preço do Pacote: {bundle.totalMonthlyPriceAoa.toLocaleString()} AOA/mês
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'atccrs' && (
            <div>
              <div style={{ background: theme === 'dark' ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)' : 'linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <GraduationCap size={28} color="#9333ea" />
                      <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#0f172a', margin: 0 }}>
                        {lang === 'pt' ? 'AI Employee Training, Competency & Commercial Readiness System (ATCCRS)' : 'AI Employee Training, Competency & Commercial Readiness System (ATCCRS)'}
                      </h2>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#d1d5db' : '#475569', maxWidth: '900px', lineHeight: 1.5, margin: 0 }}>
                      {lang === 'pt'
                        ? 'Motor de formação operacional, matriz de competências (C0-C5), exercícios em sandbox, remediação de falhas (pontes EREMS/CAQRS) e Commercial Readiness Passports para os 500 AI Employees.'
                        : 'Operational training engine, competency matrix (C0-C5), sandbox exercises, failure remediation (EREMS/CAQRS bridges) and Commercial Readiness Passports for 500 AI Employees.'}
                    </p>
                  </div>
                  <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: '0.85rem', fontWeight: 700 }}>
                    GATE 500/500 PASSED ✓
                  </span>
                </div>
              </div>

              {/* KPI Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b', fontWeight: 600 }}>Commercial Ready (500/500)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#9333ea', marginTop: '6px' }}>{atccrsSummary.commercialReadyCount} / 500</div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>100% Elegíveis para AESSRE</div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b', fontWeight: 600 }}>Matriz de Competências</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6', marginTop: '6px' }}>C0 → C5</div>
                  <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>Baseado em Evidências Empíricas</div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b', fontWeight: 600 }}>Módulos Curriculares</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#10b981', marginTop: '6px' }}>{atccrsEngine.getTrainingUnits().length} Unidades</div>
                  <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>Foundation, Process, Risk, Tools</div>
                </div>

                <div className="card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b', fontWeight: 600 }}>Em Remediação</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: atccrsSummary.remediationCount > 0 ? '#ef4444' : '#10b981', marginTop: '6px' }}>{atccrsSummary.remediationCount}</div>
                  <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '4px' }}>EREMS & CAQRS Retraining</div>
                </div>
              </div>

              {/* Passport Inspector Section */}
              <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', margin: 0 }}>
                    {lang === 'pt' ? 'Inspetor de Passaporte de Prontidão Comercial (Commercial Readiness Passport)' : 'Commercial Readiness Passport Inspector'}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>Employee ID:</span>
                    <select
                      value={atccrsSelectedEmpId}
                      onChange={(e) => setAtccrsSelectedEmpId(Number(e.target.value))}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#ffffff', color: theme === 'dark' ? '#ffffff' : '#0f172a', fontWeight: 600 }}
                    >
                      {Array.from({ length: 50 }, (_, i) => i + 1).map((id) => {
                        const p = atccrsEngine.getProfile(id);
                        return (
                          <option key={id} value={id}>
                            #{id} — {p?.roleKey || `Employee ${id}`} ({p?.department})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {atccrsEngine.getPassport(atccrsSelectedEmpId) && (
                  <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <span style={{ fontSize: '1.1rem', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                          Passaporte Comercial #{atccrsSelectedEmpId} — {atccrsEngine.getPassport(atccrsSelectedEmpId)?.roleKey}
                        </span>
                        <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '2px' }}>
                          Versão de Formação: {atccrsEngine.getProfile(atccrsSelectedEmpId)?.trainingVersion} | Nível de Risco: {atccrsEngine.getProfile(atccrsSelectedEmpId)?.riskLevel}
                        </div>
                      </div>
                      <span className={`badge badge-${atccrsEngine.getPassport(atccrsSelectedEmpId)?.commercialStatus === 'COMMERCIAL_READY' ? 'success' : 'danger'}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                        {atccrsEngine.getPassport(atccrsSelectedEmpId)?.commercialStatus}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#9333ea', marginBottom: '8px' }}>Verificação de Formação</div>
                        <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div>Currículo Completo: <strong>{atccrsEngine.getPassport(atccrsSelectedEmpId)?.training.curriculumComplete ? 'SIM ✓' : 'NÃO ✗'}</strong></div>
                          <div>Competências Validadas: <strong>{atccrsEngine.getPassport(atccrsSelectedEmpId)?.training.competenciesValidated ? 'SIM ✓' : 'NÃO ✗'}</strong></div>
                          <div>Remediação Pendente: <strong>{atccrsEngine.getPassport(atccrsSelectedEmpId)?.training.remediationOpen ? 'SIM (Em Curso)' : 'NENHUMA ✓'}</strong></div>
                        </div>
                      </div>

                      <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6', marginBottom: '8px' }}>Fiabilidade & Qualidade</div>
                        <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div>Status EREMS UMER: <strong>{atccrsEngine.getPassport(atccrsSelectedEmpId)?.reliability.status} ✓</strong></div>
                          <div>Erro Material (Wilson 95%): <strong>PASS ✓</strong></div>
                          <div>Qualidade CAQRS (FPAR): <strong>PASS ✓</strong></div>
                        </div>
                      </div>

                      <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#ffffff', padding: '0px' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>Economia & Governação</div>
                          <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div>Margem Unitária (AESSRE): <strong>84.5% ✓</strong></div>
                            <div>Conetores Enterprise: <strong>PRONTOS ✓</strong></div>
                            <div>Certificação Autonomia: <strong>{atccrsEngine.getPassport(atccrsSelectedEmpId)?.governance.certification}</strong></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Remediation & Sandbox Studio */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                {/* Training Sandbox Simulator */}
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={20} color="#9333ea" />
                    {lang === 'pt' ? 'Módulos Curriculares & Exercícios Sandbox' : 'Curriculum Modules & Sandbox Exercises'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginBottom: '16px' }}>
                    Formação em ambiente isolado sem efeitos colaterais reais em pagamentos, ERP ou APIs externas.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
                    {atccrsEngine.getTrainingUnits().map((unit) => (
                      <div key={unit.unitId} style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: theme === 'dark' ? '#818cf8' : '#4f46e5' }}>
                            {unit.title} ({unit.category})
                          </span>
                          <span className="badge badge-l3">{unit.passingScore}% Pass</span>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: theme === 'dark' ? '#d1d5db' : '#475569', marginTop: '4px' }}>
                          {unit.objective}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginTop: '6px' }}>
                          Casos: {unit.casesCount} | Exercícios: {unit.exercisesCount}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Remediation Task Manager */}
                <div className="card" style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RefreshCw size={20} color="#ef4444" />
                    {lang === 'pt' ? 'Tarefas de Remediação & Re-teste' : 'Remediation Tasks & Retest Studio'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#9ca3af' : '#64748b', marginBottom: '16px' }}>
                    Gere tarefas originadas por erros de fiabilidade EREMS e revisões de cliente CAQRS.
                  </p>

                  <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        const task = atccrsEngine.bridgeEREMSToTraining(atccrsSelectedEmpId, `INC-${Date.now().toString().slice(-4)}`, 'CALCULATION_DISCREPANCY');
                        setAtccrsSummary(atccrsEngine.getProgramReadinessSummary());
                        setAtccrsRemediationMsg(`Criada tarefa de remediação EREMS: ${task.taskId}`);
                      }}
                      style={{ fontSize: '0.78rem', padding: '8px 12px' }}
                    >
                      Simular Falha EREMS → Remediação
                    </button>
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        const task = atccrsEngine.bridgeCAQRSToTraining(atccrsSelectedEmpId, `FB-${Date.now().toString().slice(-4)}`, 'MATERIAL_FORMAT_ERROR');
                        setAtccrsSummary(atccrsEngine.getProgramReadinessSummary());
                        setAtccrsRemediationMsg(`Criada tarefa de remediação CAQRS: ${task.taskId}`);
                      }}
                      style={{ fontSize: '0.78rem', padding: '8px 12px' }}
                    >
                      Simular Revisão CAQRS → Remediação
                    </button>
                  </div>

                  {atccrsRemediationMsg && (
                    <div style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', padding: '10px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '14px' }}>
                      {atccrsRemediationMsg}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                    {atccrsEngine.getRemediationTasks(atccrsSelectedEmpId).length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: theme === 'dark' ? '#9ca3af' : '#64748b', fontSize: '0.85rem' }}>
                        Nenhuma tarefa de remediação pendente para este empregado.
                      </div>
                    ) : (
                      atccrsEngine.getRemediationTasks(atccrsSelectedEmpId).map((t) => (
                        <div key={t.taskId} style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '12px', borderRadius: '8px', borderLeft: t.status === 'RESOLVED' ? '4px solid #10b981' : '4px solid #ef4444' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                              {t.taskId} ({t.source})
                            </span>
                            <span className={`badge badge-${t.status === 'RESOLVED' ? 'success' : 'danger'}`}>
                              {t.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: theme === 'dark' ? '#d1d5db' : '#475569', marginTop: '4px' }}>
                            Causa Raiz: {t.rootCause}
                          </div>
                          {t.status !== 'RESOLVED' && (
                            <button
                              className="btn-success"
                              onClick={() => {
                                atccrsEngine.resolveRemediation(t.taskId);
                                setAtccrsSummary(atccrsEngine.getProgramReadinessSummary());
                                setAtccrsRemediationMsg(`Remediação ${t.taskId} resolvida. Status restaurado para COMMERCIAL_READY.`);
                              }}
                              style={{ fontSize: '0.72rem', padding: '4px 10px', marginTop: '8px' }}
                            >
                              Resolver & Restaurar Prontidão Comercial
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Role Detail Drawer Modal */}
      {selectedRole && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '580px', background: theme === 'dark' ? '#0f172a' : '#ffffff', borderLeft: '1px solid var(--border-color)', padding: '32px', overflowY: 'auto', boxShadow: '-8px 0 32px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span className="badge badge-l3">{selectedRole.department}</span>
              <button onClick={() => setSelectedRole(null)} style={{ background: 'none', border: 'none', color: theme === 'dark' ? '#fff' : '#0f172a', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '8px' }}>{selectedRole.display_name}</h2>
            <div style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b', marginBottom: '20px', fontFamily: 'monospace' }}>role_key: {selectedRole.role_key}</div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <span className={`badge badge-${(selectedRole.risk?.level || selectedRole.risk || 'R2').toLowerCase()}`}>{t.riskLevel}: {selectedRole.risk?.level || selectedRole.risk || 'R2'}</span>
              <span className={`badge badge-${(selectedRole.autonomy?.default || selectedRole.autonomyDefault || 'L3').toLowerCase()}`}>{t.autonomy}: {selectedRole.autonomy?.default || selectedRole.autonomyDefault || 'L3'}</span>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '8px' }}>{t.canonicalMission}</h3>
            <p style={{ fontSize: '0.9rem', color: theme === 'dark' ? '#d1d5db' : '#334155', lineHeight: 1.6, marginBottom: '24px' }}>{selectedRole.mission}</p>

            {/* V2.1 WORK CONTRACT SECTION */}
            {activeWorkContract && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme === 'dark' ? '#818cf8' : '#4f46e5', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} /> {t.workContractV21}
                </h3>

                {/* Activation Modes */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '4px' }}>{t.activationModes}:</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {activeWorkContract.activation.modes.map(m => (
                      <span key={m} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff', color: theme === 'dark' ? '#818cf8' : '#3730a3', fontWeight: 600 }}>{m}</span>
                    ))}
                  </div>
                </div>

                {/* Canonical Data Products (Inputs) */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '4px' }}>{t.canonicalDataProducts}:</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {activeWorkContract.inputs.canonical_data_products.map(dp => (
                      <span key={dp} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: theme === 'dark' ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5', color: theme === 'dark' ? '#34d399' : '#047857', fontWeight: 600 }}>{dp}</span>
                    ))}
                  </div>
                </div>

                {/* Connection Families */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '4px' }}>{t.connectionFamilies}:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
                    {activeWorkContract.inputs.connection_families.map((cf, idx) => (
                      <div key={idx} style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                        <strong>{cf.tool}</strong> ({cf.family}): {cf.examples.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ingestion Methods */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '4px' }}>{t.ingestionMethods}:</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {activeWorkContract.inputs.ingestion_methods.map(im => (
                      <span key={im} style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: theme === 'dark' ? 'rgba(6, 182, 212, 0.15)' : '#cff4fc', color: theme === 'dark' ? '#22d3ee' : '#087990' }}>{im}</span>
                    ))}
                  </div>
                </div>

                {/* Processing Contract Stages */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '4px' }}>{t.processingStages}:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem' }}>
                    {activeWorkContract.processing_contract.stages.map((st, idx) => (
                      <div key={idx} style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '6px 10px', borderRadius: '6px' }}>
                        <strong>Stage {st.stage_number} ({st.name}):</strong> {st.objective}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Governance Materiality & Output Contracts */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : '#f1f5f9', padding: '8px 12px', borderRadius: '8px' }}>
                  <div>{t.materialityThreshold}: <strong>${activeWorkContract.governance.risk.materiality_threshold_usd.toLocaleString()} USD</strong></div>
                  <div>{t.missingDataPolicy}: <strong>{activeWorkContract.processing_contract.missing_data_policy}</strong></div>
                </div>
              </div>
            )}

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '8px' }}>{t.requiredTools}</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {(selectedRole.tools?.required || ["T.COMM.GMAIL", "T.DOCS.GENERATOR"]).map((tName: string) => (
                <span key={tName} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: theme === 'dark' ? 'rgba(99, 102, 241, 0.15)' : '#e0e7ff', color: theme === 'dark' ? '#818cf8' : '#3730a3', border: '1px solid rgba(99, 102, 241, 0.3)', fontWeight: 600 }}>
                  {tName}
                </span>
              ))}
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '8px' }}>{t.exercisedPermissions}</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {(selectedRole.permissions || ['read', 'execute']).map((p: string) => (
                <span key={p} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: theme === 'dark' ? 'rgba(6, 182, 212, 0.15)' : '#cff4fc', color: theme === 'dark' ? '#22d3ee' : '#087990', border: '1px solid rgba(6, 182, 212, 0.3)', fontWeight: 600 }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Marketplace Install Modal */}
      {installModalOpen && selectedListing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '560px', background: theme === 'dark' ? '#0f172a' : '#ffffff', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '6px' }}>
              {t.installConsent}: {selectedListing.displayName}
            </h2>
            <p style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '20px' }}>
              {lang === 'pt' ? 'Revisão obrigatória de segurança e permissões de acordo com os requisitos P06.' : 'Mandatory security and permission review under P06 guidelines.'}
            </p>

            <div style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', padding: '16px', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: theme === 'dark' ? '#818cf8' : '#4f46e5', marginBottom: '8px' }}>
                {lang === 'pt' ? 'Permissões Exigidas pelo Empregado:' : 'Permissions Required:'}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selectedListing.requiredPermissions.map((p: string) => (
                  <span key={p} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: theme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : '#e0e7ff', color: theme === 'dark' ? '#818cf8' : '#3730a3', fontWeight: 600 }}>{p}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                {t.monthlyCost}: <strong>${selectedListing.unitPrice}/{lang === 'pt' ? 'mês' : 'month'}</strong>
              </span>
              <span className={`badge badge-${selectedListing.riskLevel.toLowerCase()}`}>{t.riskLevel}: {selectedListing.riskLevel}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-danger" onClick={() => setInstallModalOpen(false)}>{t.cancel}</button>
              <button className="btn-success" onClick={confirmInstall}>{t.confirmConsent}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

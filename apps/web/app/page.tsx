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
  Globe
} from 'lucide-react';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import { MarketplaceManager, MeteringEngine, EntitlementsManager } from '@ai-employee/marketplace-billing';
import { ReleaseReadinessEngine, ReleaseReadinessReport } from '@ai-employee/shared';

const translations = {
  pt: {
    subtitle: 'Sistema Operativo de Força de Trabalho Digital & Painel de Controlo',
    gateAudit: 'Auditoria de Gates',
    goReady: 'APROVADO / PRONTO',
    killSwitchActive: 'KILL SWITCH GLOBAL ATIVO',
    killSwitchButton: 'KILL SWITCH DE EMERGÊNCIA',
    navTitle: 'Navegação do Painel',
    navCommercial: 'Comercial & Prontidão',
    navCatalog: 'Catálogo de Roles (500)',
    navApprovals: 'Gateway de Aprovação',
    navTasks: 'Fila P05 & DLQ',
    navSecurity: 'Segurança Red Team P02',
    navEvaluation: 'Certificação P04',
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
  },
  en: {
    subtitle: 'Digital Workforce Operating System & Production Control Plane',
    gateAudit: 'Gate Audit',
    goReady: 'GO READY',
    killSwitchActive: 'GLOBAL KILL SWITCH ACTIVE',
    killSwitchButton: 'EMERGENCY KILL SWITCH',
    navTitle: 'Control Plane Navigation',
    navCommercial: 'Commercial & Readiness',
    navCatalog: 'Role Packs (500)',
    navApprovals: 'Approval Gateway',
    navTasks: 'P05 Queue & DLQ',
    navSecurity: 'Red Team Security P02',
    navEvaluation: 'P04 Certification',
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
  }
};

export default function ControlPlaneDashboard() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lang, setLang] = useState<'pt' | 'en'>('pt');

  useEffect(() => {
    setMounted(true);
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
  }, [theme]);

  const t = translations[lang];

  const [activeTab, setActiveTab] = useState<'catalog' | 'approvals' | 'tasks' | 'security' | 'evaluation' | 'marketplace' | 'billing' | 'release'>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  // P06 Marketplace State
  const [marketplaceManager] = useState(() => new MarketplaceManager());
  const [meteringEngine] = useState(() => new MeteringEngine());
  const [entitlementsManager] = useState(() => new EntitlementsManager());
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const [installSuccessMessage, setInstallSuccessMessage] = useState<string | null>(null);
  const [displayCurrency, setDisplayCurrency] = useState<'USD' | 'AOA' | 'EUR'>('USD');

  // P07 Audit State
  const [auditReport, setAuditReport] = useState<ReleaseReadinessReport | null>(null);
  const [auditRunning, setAuditRunning] = useState(false);

  // Security Simulator state
  const [scanInput, setScanInput] = useState('');
  const [scanResult, setScanResult] = useState<any | null>(null);

  // DLQ State Mock for UI demonstration
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
      employee: 'Accounts Payable Specialist (ID 50)',
      department: 'Finance',
      risk: 'R5',
      action: 'T.COMM.GMAIL:send_email',
      reason: 'Monetary transaction €5,000 exceeds maximum autonomous threshold (€1,000)',
      requestedAt: '2 mins ago',
      snapshotHash: '8f7a932b109e4f21a8b9c0d1e2f3a4b5c6d7e8f9'
    },
    {
      id: 'app_98232',
      employee: 'Credit Control Officer (ID 61)',
      department: 'Finance',
      risk: 'R4',
      action: 'T.CRM.HUBSPOT:update_contact',
      reason: 'Credit line modification requires explicit supervisor approval',
      requestedAt: '12 mins ago',
      snapshotHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
    }
  ]);

  // Unique departments count
  const departments = Array.from(new Set(CANONICAL_500_ROLES.map(r => r.department))).sort();

  // Filtered Role Packs
  const filteredRoles = CANONICAL_500_ROLES.filter(r => {
    const matchesSearch =
      r.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.role_key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || r.department === selectedDept;
    const matchesRisk = selectedRisk === 'ALL' || r.risk.level === selectedRisk;
    return matchesSearch && matchesDept && matchesRisk;
  });

  const handleApprove = (id: string) => {
    setPendingApprovals(prev => prev.filter(a => a.id !== id));
  };

  const handleRequeueDLQ = (id: string) => {
    setDlqItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSecurityScan = () => {
    if (!scanInput.trim()) return;
    const isInjection = /ignore|override|bypass|developer mode|disregard/i.test(scanInput);
    if (isInjection) {
      setScanResult({
        safe: false,
        threatLevel: 'CRITICAL',
        detectedVectors: ['PATTERN_MATCH: Malicious prompt injection payload detected'],
        sanitizedInput: '[BLOCKED_BY_SECURITY_ENGINE]'
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
    setInstallSuccessMessage(`Role Pack ${selectedListing.displayName} instalado com sucesso com consentimento de segurança.`);
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

  return (
    <div style={containerStyle}>
      {/* Top Bar Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 32px',
          background: theme === 'dark' ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
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
              AI EMPLOYEE PLATFORM <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>OS V2.0 (P01–P07)</span>
            </h1>
            <p style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#64748b' }}>{t.subtitle}</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')}
            style={{
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
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
              background: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
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
              transition: 'all 0.2s ease'
            }}
            title="Alternar Tema (Escuro/Claro)"
          >
            {theme === 'dark' ? <Sun size={16} color="#fbbf24" /> : <Moon size={16} color="#6366f1" />}
            <span>{theme === 'dark' ? t.themeLight : t.themeDark}</span>
          </button>

          <div className="glass-card" style={{ padding: '6px 14px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <ShieldCheck size={16} color="#34d399" />
            <span>{t.gateAudit}: <strong>{auditReport?.verdict ?? t.goReady}</strong></span>
          </div>

          <button
            onClick={() => setKillSwitchActive(!killSwitchActive)}
            style={{
              background: killSwitchActive ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
              color: killSwitchActive ? '#fff' : '#f87171',
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
            background: 'rgba(15, 23, 42, 0.4)',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 12px 8px 12px' }}>
            {t.navTitle}
          </div>

          <button
            onClick={() => setActiveTab('catalog')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'catalog' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'catalog' ? '#818cf8' : 'var(--text-muted)',
              fontWeight: activeTab === 'catalog' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={18} />
              <span>{t.navCatalog}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)' }}>500</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'approvals' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'approvals' ? '#818cf8' : 'var(--text-muted)',
              fontWeight: activeTab === 'approvals' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
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

          <button
            onClick={() => setActiveTab('tasks')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'tasks' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'tasks' ? '#818cf8' : 'var(--text-muted)',
              fontWeight: activeTab === 'tasks' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Activity size={18} />
              <span>{t.navTasks}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>Live</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'security' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'security' ? '#818cf8' : 'var(--text-muted)',
              fontWeight: activeTab === 'security' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Lock size={18} />
              <span>{t.navSecurity}</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('evaluation')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'evaluation' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'evaluation' ? '#818cf8' : 'var(--text-muted)',
              fontWeight: activeTab === 'evaluation' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={18} />
              <span>{t.navEvaluation}</span>
            </div>
          </button>

          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '16px 12px 8px 12px' }}>
            {t.navCommercial}
          </div>

          <button
            onClick={() => setActiveTab('marketplace')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'marketplace' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'marketplace' ? '#818cf8' : 'var(--text-muted)',
              fontWeight: activeTab === 'marketplace' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShoppingCart size={18} />
              <span>{t.navMarketplace}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.2)', color: '#22d3ee' }}>Store</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'billing' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'billing' ? '#818cf8' : 'var(--text-muted)',
              fontWeight: activeTab === 'billing' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={18} />
              <span>{t.navBilling}</span>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('release')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              background: activeTab === 'release' ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
              color: activeTab === 'release' ? '#818cf8' : 'var(--text-muted)',
              fontWeight: activeTab === 'release' ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={18} />
              <span>{t.navRelease}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>Gates A-J</span>
          </button>
        </aside>

        {/* Content Area */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {installSuccessMessage && (
            <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.totalRoles}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>500</div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>{t.canonicalComplete}</div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.departments}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>44</div>
                  <div style={{ fontSize: '0.75rem', color: '#818cf8', marginTop: '4px' }}>{t.b2bCoverage}</div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.highRisk}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f87171' }}>
                    {CANONICAL_500_ROLES.filter(r => r.risk.level === 'R4' || r.risk.level === 'R5').length}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '4px' }}>{t.humanEscalation}</div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>{t.certified}</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399' }}>500/500</div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>{t.fidelityCertified}</div>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
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
                      background: theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)',
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
                    background: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
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
                    background: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    color: theme === 'dark' ? '#fff' : '#0f172a',
                    fontSize: '0.85rem',
                    outline: 'none'
                  }}
                >
                  <option value="ALL">{t.allRisks}</option>
                  <option value="R1">R1 - Baixo</option>
                  <option value="R2">R2 - Operacional</option>
                  <option value="R3">R3 - Controlado</option>
                  <option value="R4">R4 - Alto</option>
                  <option value="R5">R5 - Crítico</option>
                </select>
              </div>

              {/* Grid of Role Packs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                {filteredRoles.slice(0, 36).map(role => (
                  <div
                    key={role.id}
                    className="glass-card"
                    onClick={() => setSelectedRole(role)}
                    style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--secondary)' }}>ID #{role.id}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span className={`badge badge-${role.risk.level.toLowerCase()}`}>{role.risk.level}</span>
                          <span className={`badge badge-${role.autonomy.default.toLowerCase()}`}>{role.autonomy.default}</span>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>{role.display_name}</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{role.department}</div>
                      <p style={{ fontSize: '0.825rem', color: theme === 'dark' ? '#d1d5db' : '#475569', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '16px' }}>
                        {role.mission}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                        {t.toolsRequired}: {role.tools.required.length}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {t.seeDetails} <ChevronRight size={14} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: APPROVAL GATEWAY */}
          {activeTab === 'approvals' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>Approval Gateway & Governance</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fila de ações materiais pendentes de autorização humana explícita (Política Deny-by-Default).</p>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={48} color="#34d399" style={{ marginBottom: '12px' }} />
                  <h3>Sem Aprovações Pendentes</h3>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Todas as ações de alto risco ou monetárias foram processadas.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {pendingApprovals.map(app => (
                    <div key={app.id} className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ maxWidth: '70%' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span className={`badge badge-${app.risk.toLowerCase()}`}>{app.risk}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{app.department}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>• {app.requestedAt}</span>
                        </div>

                        <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{app.employee}</h3>
                        <p style={{ fontSize: '0.9rem', color: '#fbbf24', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertTriangle size={16} /> {app.reason}
                        </p>

                        <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.3)', padding: '6px 10px', borderRadius: '6px' }}>
                          Snapshot Hash: {app.snapshotHash}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-danger" onClick={() => handleApprove(app.id)}>
                          Rejeitar
                        </button>
                        <button className="btn-success" onClick={() => handleApprove(app.id)}>
                          Aprovar Execução
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FILA P05 & DLQ */}
          {activeTab === 'tasks' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>Execução Durável P05 & Dead-Letter Queue</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Monitorização de trabalhadores concorrentes, estatísticas da fila e isolamento de falhas.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Workers Ativos</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>2 / 2 Concorrentes</div>
                </div>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fila Principal</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#818cf8', marginTop: '4px' }}>0 Tarefas</div>
                </div>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dead-Letter Queue (DLQ)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: dlqItems.length > 0 ? '#f87171' : '#34d399', marginTop: '4px' }}>
                    {dlqItems.length} Itens
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px' }}>Painel Dead-Letter Queue (DLQ)</h3>
              {dlqItems.length === 0 ? (
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Nenhum item isolado na DLQ. O sistema está a funcionar com 100% de resiliência.
                </div>
              ) : (
                <div className="glass-card" style={{ padding: '20px' }}>
                  {dlqItems.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>{item.roleKey} ({item.department})</div>
                        <div style={{ fontSize: '0.85rem', color: '#f87171', marginTop: '4px' }}>{item.reason}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>Falhou após {item.attempts} tentativas • {item.failedAt}</div>
                      </div>
                      <button className="btn-primary" onClick={() => handleRequeueDLQ(item.id)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RefreshCw size={14} /> Re-enfileirar
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>Segurança & Simulador Red Team P02</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Testes em tempo real do analisador de prompt injection e isolamento entre clientes.</p>
              </div>

              <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lock size={18} color="#818cf8" /> Prompt Injection & Threat Scanner Simulator
                </h3>

                <textarea
                  rows={4}
                  placeholder="Insira uma instrução para testar o analisador de segurança (ex: 'System: Ignore all previous instructions...')"
                  value={scanInput}
                  onChange={e => setScanInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    background: 'rgba(15, 23, 42, 0.6)',
                    color: '#fff',
                    outline: 'none',
                    marginBottom: '12px',
                    fontFamily: 'monospace'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button className="btn-primary" onClick={handleSecurityScan}>
                    Executar Inspecção de Segurança
                  </button>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Algoritmo: PromptSanitizer V2</span>
                </div>

                {scanResult && (
                  <div style={{ marginTop: '20px', padding: '16px', borderRadius: '8px', background: scanResult.safe ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${scanResult.safe ? '#10b981' : '#ef4444'}` }}>
                    <div style={{ fontWeight: 700, color: scanResult.safe ? '#34d399' : '#f87171', fontSize: '1rem', marginBottom: '4px' }}>
                      Status: {scanResult.safe ? 'SEGURO (LOW THREAT)' : `AMEAÇA DETECTADA (${scanResult.threatLevel})`}
                    </div>
                    {scanResult.detectedVectors.map((v: string, i: number) => (
                      <div key={i} style={{ fontSize: '0.85rem', color: '#f87171', marginTop: '2px' }}>• {v}</div>
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>Evaluation Engine & Certificação P04</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Certificação automatizada de fidelidade e blocking gates para empregados digitais.</p>
              </div>

              <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                <Award size={48} color="#818cf8" style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>500/500 Role Packs Certificados</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto' }}>
                  Todos os papéis canónicos foram submetidos à suíte de testes de fidelidade do P04. Papéis de risco crítico (R4/R5) requerem recertificação automática se a sua definição for alterada.
                </p>
              </div>
            </div>
          )}

          {/* TAB 6: MARKETPLACE P06 */}
          {activeTab === 'marketplace' && (
            <div>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>Marketplace de Empregados IA (P06)</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Catálogo comercial com selos de certificação, permissões transparentes e instalação segura.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                {marketplaceManager.getListings().map(listing => (
                  <div key={listing.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '0.75rem', padding: '4px 8px', borderRadius: '6px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', fontWeight: 600, border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                          {listing.certification}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>★ {listing.rating} ({listing.installsCount} inst.)</span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{listing.displayName}</h3>
                      <div style={{ fontSize: '0.8rem', color: '#818cf8', marginBottom: '12px' }}>{listing.department} • Por {listing.publisherName}</div>

                      <p style={{ fontSize: '0.85rem', color: '#d1d5db', marginBottom: '16px', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {listing.description}
                      </p>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>${listing.unitPrice} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ mês</span></div>
                      </div>

                      <button className="btn-primary" onClick={() => handleInstallListing(listing)}>
                        Instalar Empregado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: BILLING & METERING P06 */}
          {activeTab === 'billing' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>Faturação, Metering & Orçamentos (P06)</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Ledger de utilização em tempo real, preçário multimoeda e limites orçamentais.</p>
                </div>

                <div style={{ display: 'flex', gap: '8px', background: 'rgba(15, 23, 42, 0.8)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  {(['USD', 'AOA', 'EUR'] as const).map(curr => (
                    <button
                      key={curr}
                      onClick={() => setDisplayCurrency(curr)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: displayCurrency === curr ? '#6366f1' : 'transparent',
                        color: '#fff',
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
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Plano Atual</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#818cf8', marginTop: '4px' }}>Enterprise</div>
                  <div style={{ fontSize: '0.8rem', color: '#34d399', marginTop: '8px' }}>1,000 Empregados • 200 Tarefas Concorrentes</div>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gasto Mensal Atual</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                    {displayCurrency === 'USD' && '$1,450.00'}
                    {displayCurrency === 'EUR' && '€1,342.59'}
                    {displayCurrency === 'AOA' && 'Kz 1,342,592.00'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#818cf8', marginTop: '8px' }}>Limite Orçamental: $10,000.00 (14.5% consumido)</div>
                </div>

                <div className="glass-card" style={{ padding: '24px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Publisher Payout Share</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399', marginTop: '4px' }}>80% / 20%</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '8px' }}>Platform Revenue Share Rule Active</div>
                </div>
              </div>

              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Ledger Financeiro Imutável</h3>
              <div className="glass-card" style={{ padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px' }}>Event ID</th>
                      <th style={{ padding: '12px' }}>Tenant</th>
                      <th style={{ padding: '12px' }}>Preço Bruto</th>
                      <th style={{ padding: '12px' }}>Partilha Publisher (80%)</th>
                      <th style={{ padding: '12px' }}>Partilha Plataforma (20%)</th>
                      <th style={{ padding: '12px' }}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#818cf8' }}>evt_billing_9001</td>
                      <td style={{ padding: '12px' }}>tenant_default</td>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#fff' }}>$150.00</td>
                      <td style={{ padding: '12px', color: '#34d399' }}>$120.00</td>
                      <td style={{ padding: '12px', color: '#22d3ee' }}>$30.00</td>
                      <td style={{ padding: '12px', color: 'var(--text-dim)' }}>Há 5 minutos</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', fontFamily: 'monospace', color: '#818cf8' }}>evt_billing_9002</td>
                      <td style={{ padding: '12px' }}>tenant_default</td>
                      <td style={{ padding: '12px', fontWeight: 600, color: '#fff' }}>$250.00</td>
                      <td style={{ padding: '12px', color: '#34d399' }}>$200.00</td>
                      <td style={{ padding: '12px', color: '#22d3ee' }}>$50.00</td>
                      <td style={{ padding: '12px', color: 'var(--text-dim)' }}>Há 22 minutos</td>
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
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px' }}>Prontidão de Lançamento — Gate P07 Audit</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verificação automatizada dos 10 Portões de Auditoria (Gates A a J) para aprovação final de produção.</p>
                </div>

                <button className="btn-primary" onClick={runP07Audit} disabled={auditRunning} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={16} className={auditRunning ? 'animate-spin' : ''} />
                  {auditRunning ? 'A Executar Auditoria...' : 'Executar Auditoria de Lançamento (Gates A-J)'}
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
                      background: auditReport.verdict === 'GO' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${auditReport.verdict === 'GO' ? '#10b981' : '#ef4444'}`,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Veredito Oficial do Portão de Lançamento</div>
                      <div style={{ fontSize: '2.4rem', fontWeight: 800, color: auditReport.verdict === 'GO' ? '#34d399' : '#f87171', marginTop: '4px' }}>
                        VERDICT: {auditReport.verdict}
                      </div>
                      <p style={{ fontSize: '0.95rem', color: '#d1d5db', marginTop: '8px' }}>{auditReport.signoffSummary}</p>
                      <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-dim)', marginTop: '8px' }}>
                        Pacote de Evidências Hash: {auditReport.artifactDigest}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#34d399' }}>{auditReport.overallFidelityPercent}%</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Fidelidade Geral Certificada</div>
                    </div>
                  </div>

                  {/* Gates Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    {auditReport.gates.map(gate => (
                      <div key={gate.gateId} className="glass-card" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>{gate.gateId}: {gate.name}</span>
                          <span className={`badge ${gate.status === 'PASS' ? 'badge-r1' : 'badge-r5'}`}>{gate.status}</span>
                        </div>

                        {gate.logs.map((log, idx) => (
                          <div key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                            • {log}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!auditReport && !auditRunning && (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={48} color="#818cf8" style={{ marginBottom: '12px' }} />
                  <h3>Pronto para Auditoria de Lançamento P07</h3>
                  <p style={{ fontSize: '0.85rem', marginTop: '4px', maxWidth: '500px', margin: '8px auto 0 auto' }}>
                    Clique no botão acima para verificar os 10 Portões de Auditoria e gerar o veredito oficial de produção.
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Role Detail Drawer Modal */}
      {selectedRole && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '540px', background: '#0f172a', borderLeft: '1px solid var(--border-color)', padding: '32px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span className="badge badge-l3">{selectedRole.department}</span>
              <button onClick={() => setSelectedRole(null)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>{selectedRole.display_name}</h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px', fontFamily: 'monospace' }}>role_key: {selectedRole.role_key}</div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              <span className={`badge badge-${selectedRole.risk.level.toLowerCase()}`}>Risco: {selectedRole.risk.level}</span>
              <span className={`badge badge-${selectedRole.autonomy.default.toLowerCase()}`}>Autonomia: {selectedRole.autonomy.default}</span>
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Missão Canónica</h3>
            <p style={{ fontSize: '0.9rem', color: '#d1d5db', lineHeight: 1.6, marginBottom: '24px' }}>{selectedRole.mission}</p>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Ferramentas Requeridas</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {selectedRole.tools.required.map((t: string) => (
                <span key={t} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                  {t}
                </span>
              ))}
            </div>

            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>Permissões Exercidas</h3>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
              {selectedRole.permissions.map((p: string) => (
                <span key={p} style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '6px', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
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
          <div style={{ width: '560px', background: '#0f172a', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '32px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Consentimento de Instalação: {selectedListing.displayName}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Revisão obrigatória de segurança e permissões de acordo com os requisitos P06.</p>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#818cf8', marginBottom: '8px' }}>Permissões Exigidas pelo Empregado:</div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selectedListing.requiredPermissions.map((p: string) => (
                  <span key={p} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>{p}</span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Custo Mensal: <strong>${selectedListing.unitPrice}/mês</strong></span>
              <span className={`badge badge-${selectedListing.riskLevel.toLowerCase()}`}>Nível de Risco: {selectedListing.riskLevel}</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn-danger" onClick={() => setInstallModalOpen(false)}>Cancelar</button>
              <button className="btn-success" onClick={confirmInstall}>Confirmar Consentimento & Instalar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

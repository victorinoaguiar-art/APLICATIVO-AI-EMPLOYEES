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
  ChevronRight,
  ShieldCheck,
  Award,
  X,
  ShoppingCart,
  CreditCard,
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
  CheckCircle,
  Clock,
  Layers,
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
  GraduationCap,
  BarChart3,
  Sparkles,
  ChevronDown,
  Building,
  HelpCircle,
  Bell,
  FileCheck,
  SlidersHorizontal,
  MessageSquare
} from 'lucide-react';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import { NavigationContext, AREA_TO_TAB_MAP } from '../components/NavigationContext';

// Imports of Design System and Screen Components
import {
  ExecutiveDashboardScreen,
  GlobalShellScreen
} from '../components/screens/OverviewScreens';

import {
  CompaniesTenantsScreen,
  CompanyDetail360Screen,
  ProvisioningWizardScreen
} from '../components/screens/OrganizationScreens';

import {
  WorkforceCommandCenterScreen,
  MarketplaceScreen,
  EmployeeDetailScreen,
  RolePackSopScreen
} from '../components/screens/WorkforceScreens';

import {
  WorkCenterScreen,
  TaskDetailScreen,
  RuntimeRouterScreen,
  EvidenceGateScreen,
  RemoteCommandsScreen,
  ApprovalsCenterScreen
} from '../components/screens/WorkScreens';

import {
  KnowledgeCenterScreen,
  AddKnowledgeWizardScreen,
  SourceExplorerScreen,
  KnowledgeNecessityScreen,
  Mnca500Screen,
  PassportsEligibilityScreen,
  RegulatoryWatchScreen,
  ClientPoliciesCpeaaScreen
} from '../components/screens/KnowledgeScreens';

import {
  TrainingCompetencyScreen,
  ReliabilityErrorScreen,
  ClientAcceptanceRevisionScreen,
  MasterValidationCertificationScreen,
  OperationalLabOtctecScreen,
  EnterprisePilotScreen
} from '../components/screens/QualityScreens';

import {
  DocumentStudioScreen,
  BrandStationeryScreen
} from '../components/screens/DocumentScreens';

import {
  OmnichannelScreen,
  WhatsappOperationsScreen,
  EmailIntelligenceScreen,
  SocialMediaOperationsScreen,
  DailyExecutiveBriefingScreen
} from '../components/screens/CommunicationScreens';

import {
  PlansSubscriptionsScreen,
  BillingPaymentsScreen,
  DiscoveryExpansionScreen
} from '../components/screens/CommerceScreens';

import {
  IntegrationsConnectorsScreen,
  SecurityPermissionsScreen,
  AuditEvidenceReceiptsScreen,
  SettingsSchedulerScreen,
  MasterPromptRegistryScreen
} from '../components/screens/PlatformScreens';

export default function PlatformMasterPage() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [tenant, setTenant] = useState('MARVINE, LDA');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTopModal, setActiveTopModal] = useState<string | null>(null);
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);

  const [expandedNav, setExpandedNav] = useState<Record<string, boolean>>({
    mod_inicio: true,
    mod_employees: true,
    mod_trabalho: true,
    mod_conhecimento: true,
    mod_comunicacoes: true,
    mod_administracao: true,
    mod_avancado: false
  });

  useEffect(() => {
    document.body.className = isDark ? 'theme-dark' : 'theme-light';
  }, [isDark]);

  const toggleCategory = (cat: string) => {
    setExpandedNav(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const navItemStyle = (tabKey: string) => {
    const isActive = activeTab === tabKey;
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '10px',
      padding: '8px 14px',
      borderRadius: '8px',
      fontSize: '0.82rem',
      fontWeight: isActive ? 700 : 500,
      color: isActive ? (isDark ? '#60a5fa' : '#1d4ed8') : (isDark ? '#94a3b8' : '#334155'),
      background: isActive ? (isDark ? 'rgba(59, 130, 246, 0.18)' : 'rgba(37, 99, 235, 0.12)') : 'transparent',
      border: 'none',
      width: '100%',
      textAlign: 'left' as const,
      cursor: 'pointer',
      transition: 'all 0.15s ease'
    };
  };

  const categoryHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: isDark ? '#64748b' : '#475569',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    cursor: 'pointer',
    marginTop: '12px'
  };

  const navigateToArea = (codeOrTab: string) => {
    const target = AREA_TO_TAB_MAP[codeOrTab] || codeOrTab;
    setActiveTab(target);
  };

  const navContextValue = {
    activeTab,
    setActiveTab,
    activeTopModal,
    setActiveTopModal,
    openModal: (modal: string) => setActiveTopModal(modal),
    closeModal: () => setActiveTopModal(null),
    navigateToArea
  };

  return (
    <NavigationContext.Provider value={navContextValue}>
      <div style={{ display: 'flex', minHeight: '100vh', background: isDark ? '#090d16' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* TOPBAR MODALS (Empresa, Alerts, Help) */}
      {activeTopModal === 'tenant' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', maxWidth: '420px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>Seleccionar Empresa</div>
              <button onClick={() => setActiveTopModal(null)} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['MARVINE, LDA', 'MINSA — Ministério da Saúde', 'EMPRESA DEMO LDA', 'PILOTO BANCÁRIO'].map((tName, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setTenant(tName);
                    setActiveTopModal(null);
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: tenant === tName ? '2px solid #2563eb' : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1'),
                    background: tenant === tName ? (isDark ? 'rgba(37, 99, 235, 0.2)' : '#eff6ff') : (isDark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc'),
                    color: isDark ? '#f8fafc' : '#0f172a',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  {tName} {tenant === tName && ' (Activa)'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTopModal === 'alerts' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><Bell size={18} color="#eab308" /> Alertas do Sistema</div>
              <button onClick={() => setActiveTopModal(null)} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(234, 179, 8, 0.12)' : '#fef9c3', border: '1px solid rgba(234, 179, 8, 0.3)', fontSize: '0.82rem' }}>
                ⚠️ <b>Aprovação Pendente:</b> 2 submissões fiscais aguardam revisão no Chatbox/Tarefas.
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(34, 197, 94, 0.12)' : '#dcfce7', border: '1px solid rgba(34, 197, 94, 0.3)', fontSize: '0.82rem' }}>
                ✅ <b>Interface Simplificada:</b> 6 Módulos e linguagem limpa de produto activos.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTopModal === 'help' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', maxWidth: '480px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}><HelpCircle size={18} color="#2563eb" /> Centro de Ajuda AI Employee</div>
              <button onClick={() => setActiveTopModal(null)} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: '1.5' }}>
              Bem-vindo à plataforma AI Employee Platform. A experiência de utilização foi simplificada para apresentar linguagem de negócio clara sem prefixos técnicos. Os motores internos continuam a operar no backend e no Modo Avançado.
            </p>
          </div>
        </div>
      )}

      {/* NOVO PEDIDO MODAL */}
      {activeTopModal === 'command' && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={e => {
            e.preventDefault();
            alert(`⚡ Pedido enviado com sucesso para ${tenant}! A instrução está em processamento.`);
            setActiveTopModal(null);
          }} style={{ background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: '16px', padding: '28px', maxWidth: '540px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', color: isDark ? '#f8fafc' : '#0f172a' }}>
                <Zap size={22} color="#eab308" /> Novo Pedido Operacional
              </div>
              <button type="button" onClick={() => setActiveTopModal(null)} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <div style={{ padding: '10px 14px', borderRadius: '8px', background: isDark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff', border: isDark ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid #bfdbfe', fontSize: '0.8rem', color: isDark ? '#93c5fd' : '#1e40af' }}>
              🏢 Empresa Seleccionada: <b>{tenant}</b>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '6px', display: 'block' }}>Seleccionar AI Employee *</label>
                <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.85rem' }}>
                  {CANONICAL_500_ROLES.slice(0, 50).map(role => (
                    <option key={role.role_key} value={role.role_key}>
                      {role.display_name} ({role.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '6px', display: 'block' }}>Instrução Operacional / Pedido *</label>
                <textarea required rows={3} placeholder="Descreva a tarefa ou pedido para o funcionário digital..." style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.85rem', resize: 'none' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '6px', display: 'block' }}>Prioridade</label>
                  <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.85rem' }}>
                    <option value="NORMAL">Normal</option>
                    <option value="LOW">Baixa</option>
                    <option value="HIGH">Alta</option>
                    <option value="URGENT">Urgente</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '6px', display: 'block' }}>Formato do Resultado</label>
                  <select style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.85rem' }}>
                    <option value="CHAT">Conversa no Chat</option>
                    <option value="DOCX">Documento Word (.docx)</option>
                    <option value="PDF">Relatório PDF (.pdf)</option>
                    <option value="XLSX">Planilha Excel (.xlsx)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button type="button" onClick={() => setActiveTopModal(null)} style={{ padding: '9px 18px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: 'transparent', color: isDark ? '#cbd5e1' : '#475569', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
              <button type="submit" style={{ padding: '9px 22px', borderRadius: '8px', background: 'linear-gradient(135deg, #eab308, #ca8a04)', color: '#000000', fontWeight: 800, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(234, 179, 8, 0.3)' }}>Enviar Pedido ⚡</button>
            </div>
          </form>
        </div>
      )}

      {/* GLOBAL SIDEBAR (HUMAN PURIFIED LABELS) */}
      <aside style={{ width: '280px', borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', background: isDark ? 'rgba(15, 23, 42, 0.95)' : '#ffffff', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0, height: '100vh', overflowY: 'auto', boxShadow: isDark ? 'none' : '2px 0 10px rgba(0,0,0,0.03)' }}>
        
        {/* APP BRAND */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px 16px 8px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
            <Cpu size={22} style={{ margin: 'auto' }} />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', letterSpacing: '-0.02em' }}>AI EMPLOYEE</div>
            <div style={{ fontSize: '0.68rem', color: isDark ? '#60a5fa' : '#2563eb', fontWeight: 700 }}>Digital Workforce OS</div>
          </div>
        </div>

        {/* EMPRESA SELECTOR */}
        <div onClick={() => setActiveTopModal('tenant')} style={{ padding: '8px 12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f1f5f9', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={16} color={isDark ? '#60a5fa' : '#1d4ed8'} />
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#e2e8f0' : '#0f172a' }}>{tenant}</div>
              <div style={{ fontSize: '0.65rem', color: isDark ? '#64748b' : '#475569', fontWeight: 500 }}>Empresa Activa</div>
            </div>
          </div>
          <ChevronDown size={14} color={isDark ? '#64748b' : '#475569'} />
        </div>

        {/* NAVIGATION PILLARS — PURIFIED HUMAN LABELS */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
          
          {/* INÍCIO */}
          <div style={categoryHeaderStyle} onClick={() => toggleCategory('mod_inicio')}>
            <span>Início</span>
            <ChevronDown size={12} style={{ transform: expandedNav.mod_inicio ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
          </div>
          {expandedNav.mod_inicio && (
            <>
              <button onClick={() => setActiveTab('dashboard')} style={navItemStyle('dashboard')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BarChart3 size={15} /> Dashboard</span>
              </button>
            </>
          )}

          {/* AI EMPLOYEES */}
          <div style={categoryHeaderStyle} onClick={() => toggleCategory('mod_employees')}>
            <span>AI Employees</span>
            <ChevronDown size={12} style={{ transform: expandedNav.mod_employees ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
          </div>
          {expandedNav.mod_employees && (
            <>
              <button onClick={() => setActiveTab('marketplace')} style={navItemStyle('marketplace')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><ShoppingCart size={15} /> Catálogo</span>
              </button>
              <button onClick={() => setActiveTab('workforce_command')} style={navItemStyle('workforce_command')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={15} /> Meus AI Employees</span>
              </button>
              <button onClick={() => setActiveTab('employee_detail')} style={navItemStyle('employee_detail')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Users size={15} /> Detalhe do AI Employee</span>
              </button>
              <button onClick={() => setActiveTab('role_packs')} style={navItemStyle('role_packs')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FileCode size={15} /> Equipas</span>
              </button>
            </>
          )}

          {/* TRABALHO */}
          <div style={categoryHeaderStyle} onClick={() => toggleCategory('mod_trabalho')}>
            <span>Trabalho</span>
            <ChevronDown size={12} style={{ transform: expandedNav.mod_trabalho ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
          </div>
          {expandedNav.mod_trabalho && (
            <>
              <button onClick={() => setActiveTab('work_center')} style={navItemStyle('work_center')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={15} color="#2563eb" /> Conversas</span>
              </button>
              <button onClick={() => setActiveTab('task_detail')} style={navItemStyle('task_detail')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckSquare size={15} /> Tarefas</span>
              </button>
              <button onClick={() => setActiveTab('approvals_center')} style={navItemStyle('approvals_center')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle2 size={15} /> Resultados & Aprovações</span>
              </button>
            </>
          )}

          {/* CONHECIMENTO */}
          <div style={categoryHeaderStyle} onClick={() => toggleCategory('mod_conhecimento')}>
            <span>Conhecimento</span>
            <ChevronDown size={12} style={{ transform: expandedNav.mod_conhecimento ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
          </div>
          {expandedNav.mod_conhecimento && (
            <>
              <button onClick={() => setActiveTab('knowledge_center')} style={navItemStyle('knowledge_center')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><BookOpen size={15} /> Biblioteca de Conhecimento</span>
              </button>
              <button onClick={() => setActiveTab('source_explorer')} style={navItemStyle('source_explorer')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Search size={15} /> Detalhe da Fonte</span>
              </button>
            </>
          )}

          {/* COMUNICAÇÕES & INTEGRAÇÕES */}
          <div style={categoryHeaderStyle} onClick={() => toggleCategory('mod_comunicacoes')}>
            <span>Comunicações & Integrações</span>
            <ChevronDown size={12} style={{ transform: expandedNav.mod_comunicacoes ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
          </div>
          {expandedNav.mod_comunicacoes && (
            <>
              <button onClick={() => setActiveTab('omnichannel')} style={navItemStyle('omnichannel')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Network size={15} /> Comunicações</span>
              </button>
              <button onClick={() => setActiveTab('integrations')} style={navItemStyle('integrations')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><LinkIcon size={15} /> Integrações</span>
              </button>
            </>
          )}

          {/* EMPRESA & ADMINISTRAÇÃO */}
          <div style={categoryHeaderStyle} onClick={() => toggleCategory('mod_administracao')}>
            <span>Empresa & Administração</span>
            <ChevronDown size={12} style={{ transform: expandedNav.mod_administracao ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
          </div>
          {expandedNav.mod_administracao && (
            <>
              <button onClick={() => setActiveTab('companies')} style={navItemStyle('companies')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Building size={15} /> Empresa</span>
              </button>
              <button onClick={() => setActiveTab('security_permissions')} style={navItemStyle('security_permissions')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={15} /> Utilizadores & Permissões</span>
              </button>
              <button onClick={() => setActiveTab('plans_subscriptions')} style={navItemStyle('plans_subscriptions')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Coins size={15} /> Plano & Facturação</span>
              </button>
              <button onClick={() => setActiveTab('audit_evidence')} style={navItemStyle('audit_evidence')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Lock size={15} /> Segurança & Auditoria</span>
              </button>
              <button onClick={() => setActiveTab('settings_scheduler')} style={navItemStyle('settings_scheduler')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Settings size={15} /> Configurações</span>
              </button>
            </>
          )}

          {/* MODO AVANÇADO (EXPOSIÇÃO CONTROLADA DE CÓDIGOS TÉCNICOS) */}
          {advancedMode && (
            <>
              <div style={{ ...categoryHeaderStyle, color: isDark ? '#eab308' : '#ca8a04' }} onClick={() => toggleCategory('mod_avancado')}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><SlidersHorizontal size={13} /> Modo Avançado (IDs Internos)</span>
                <ChevronDown size={12} style={{ transform: expandedNav.mod_avancado ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
              </div>
              {expandedNav.mod_avancado && (
                <>
                  <button onClick={() => setActiveTab('runtime_router')} style={navItemStyle('runtime_router')}><Cpu size={14} /> Model Router (TASK-03)</button>
                  <button onClick={() => setActiveTab('evidence_gate')} style={navItemStyle('evidence_gate')}><ShieldCheck size={14} /> Evidence Gate (TASK-04)</button>
                  <button onClick={() => setActiveTab('mnca_500')} style={navItemStyle('mnca_500')}><Sparkles size={14} /> MNCA-500 Audit (KNO-05)</button>
                  <button onClick={() => setActiveTab('knowledge_necessity')} style={navItemStyle('knowledge_necessity')}><Sliders size={14} /> Necessity Engine (KNO-04)</button>
                  <button onClick={() => setActiveTab('passports_eligibility')} style={navItemStyle('passports_eligibility')}><Award size={14} /> Passaportes (KNO-06)</button>
                  <button onClick={() => setActiveTab('reliability_measurement')} style={navItemStyle('reliability_measurement')}><AlertTriangle size={14} /> EREMS / Error Rate (QUAL-02)</button>
                  <button onClick={() => setActiveTab('otctec_lab')} style={navItemStyle('otctec_lab')}><FlaskConicalIcon size={14} /> Laboratório OTCTEC (QUAL-05)</button>
                  <button onClick={() => setActiveTab('master_prompt_registry')} style={navItemStyle('master_prompt_registry')}><Database size={14} /> Master Prompt Registry (INT-05)</button>
                </>
              )}
            </>
          )}

        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflowY: 'auto' }}>
        
        {/* TOP GLOBAL BAR */}
        <header style={{ padding: '14px 28px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', background: isDark ? 'rgba(15, 23, 42, 0.85)' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(12px)', boxShadow: isDark ? 'none' : '0 2px 10px rgba(0,0,0,0.04)' }}>
          
          {/* QUICK SELECTOR & SEARCH */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#eff6ff', padding: '6px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #bfdbfe' }}>
              <Layers size={16} color={isDark ? '#60a5fa' : '#1d4ed8'} />
              <select
                value={activeTab}
                onChange={e => setActiveTab(e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: isDark ? '#60a5fa' : '#1d4ed8',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {[
                  { key: 'dashboard', name: 'Dashboard' },
                  { key: 'marketplace', name: 'Catálogo de AI Employees' },
                  { key: 'workforce_command', name: 'Meus AI Employees' },
                  { key: 'employee_detail', name: 'Detalhe do AI Employee' },
                  { key: 'role_packs', name: 'Equipas & Perfis' },
                  { key: 'work_center', name: 'Conversas' },
                  { key: 'task_detail', name: 'Tarefas' },
                  { key: 'approvals_center', name: 'Resultados & Aprovações' },
                  { key: 'knowledge_center', name: 'Biblioteca de Conhecimento' },
                  { key: 'source_explorer', name: 'Detalhe da Fonte' },
                  { key: 'omnichannel', name: 'Comunicações' },
                  { key: 'integrations', name: 'Integrações' },
                  { key: 'companies', name: 'Empresa' },
                  { key: 'security_permissions', name: 'Utilizadores & Permissões' },
                  { key: 'plans_subscriptions', name: 'Plano & Facturação' },
                  { key: 'audit_evidence', name: 'Segurança & Auditoria' },
                  { key: 'settings_scheduler', name: 'Configurações' },
                  ...(advancedMode ? [
                    { key: 'runtime_router', name: '[Modo Avançado] Model Router & Runtime' },
                    { key: 'evidence_gate', name: '[Modo Avançado] Evidence Gate Seal' },
                    { key: 'mnca_500', name: '[Modo Avançado] MNCA-500 RAG Audit' }
                  ] : [])
                ].map(area => (
                  <option key={area.key} value={area.key}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f1f5f9', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', width: '280px' }}>
              <Search size={16} color={isDark ? '#64748b' : '#64748b'} />
              <input
                type="text"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.82rem', width: '100%', fontWeight: 500 }}
              />
              <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', background: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1', color: isDark ? '#94a3b8' : '#334155', fontFamily: 'monospace' }}>⌘K</span>
            </div>
          </div>

          {/* TOP RIGHT CONTROLS & ADVANCED MODE TOGGLE */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            
            {/* ADVANCED MODE TOGGLE */}
            <button
              onClick={() => setAdvancedMode(!advancedMode)}
              title="Ativar visibilidade dos códigos técnicos de arquitetura e identificadores internos"
              style={{
                background: advancedMode ? (isDark ? 'rgba(234, 179, 8, 0.2)' : '#fef9c3') : (isDark ? 'rgba(30, 41, 59, 0.6)' : '#f1f5f9'),
                border: advancedMode ? '1px solid #eab308' : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1'),
                color: advancedMode ? (isDark ? '#fef08a' : '#854d0e') : (isDark ? '#94a3b8' : '#64748b'),
                padding: '6px 12px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <SlidersHorizontal size={14} color={advancedMode ? '#eab308' : undefined} />
              {advancedMode ? 'Modo Avançado (ACTIVO)' : 'Modo Avançado'}
            </button>

            <button onClick={() => setActiveTopModal('command')} style={{ background: isDark ? 'rgba(37, 99, 235, 0.2)' : '#eff6ff', border: '1px solid rgba(37, 99, 235, 0.4)', color: isDark ? '#93c5fd' : '#1d4ed8', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700 }}>
              <Zap size={15} color="#2563eb" /> Novo Pedido
            </button>

            <button onClick={() => setActiveTopModal('help')} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 500 }}>
              <HelpCircle size={16} /> Ajuda
            </button>

            <button onClick={() => setActiveTopModal('alerts')} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', position: 'relative', fontWeight: 500 }}>
              <Bell size={16} /> Alertas
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }}></span>
            </button>

            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f1f5f9', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#f8fafc' : '#0f172a', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '10px', borderLeft: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>
                VA
              </div>
              <div style={{ fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>Victorino Aguiar</div>
                <div style={{ fontSize: '0.68rem', color: isDark ? '#64748b' : '#64748b', fontWeight: 500 }}>Administrador</div>
              </div>
            </div>
          </div>
        </header>

        {/* SCREEN CONTAINER */}
        <div style={{ padding: '28px 32px', flex: 1 }}>
          
          {/* INÍCIO */}
          {activeTab === 'dashboard' && <ExecutiveDashboardScreen />}
          {activeTab === 'shell' && <GlobalShellScreen />}

          {/* AI EMPLOYEES */}
          {activeTab === 'marketplace' && <MarketplaceScreen />}
          {activeTab === 'workforce_command' && <WorkforceCommandCenterScreen />}
          {activeTab === 'employee_detail' && <EmployeeDetailScreen />}
          {activeTab === 'role_packs' && <RolePackSopScreen />}

          {/* TRABALHO */}
          {activeTab === 'work_center' && <WorkCenterScreen />}
          {activeTab === 'task_detail' && <TaskDetailScreen />}
          {activeTab === 'approvals_center' && <ApprovalsCenterScreen />}

          {/* CONHECIMENTO */}
          {activeTab === 'knowledge_center' && <KnowledgeCenterScreen />}
          {activeTab === 'source_explorer' && <SourceExplorerScreen />}
          {activeTab === 'add_knowledge_wizard' && <AddKnowledgeWizardScreen />}

          {/* COMUNICAÇÕES & INTEGRAÇÕES */}
          {activeTab === 'omnichannel' && <OmnichannelScreen />}
          {activeTab === 'integrations' && <IntegrationsConnectorsScreen />}
          {activeTab === 'whatsapp_operations' && <WhatsappOperationsScreen />}
          {activeTab === 'email_intelligence' && <EmailIntelligenceScreen />}
          {activeTab === 'social_media' && <SocialMediaOperationsScreen />}
          {activeTab === 'daily_briefing' && <DailyExecutiveBriefingScreen />}

          {/* EMPRESA & ADMINISTRAÇÃO */}
          {activeTab === 'companies' && <CompaniesTenantsScreen />}
          {activeTab === 'company_detail' && <CompanyDetail360Screen />}
          {activeTab === 'company_provisioning' && <ProvisioningWizardScreen />}
          {activeTab === 'security_permissions' && <SecurityPermissionsScreen />}
          {activeTab === 'plans_subscriptions' && <PlansSubscriptionsScreen />}
          {activeTab === 'billing_payments' && <BillingPaymentsScreen />}
          {activeTab === 'discovery_expansion' && <DiscoveryExpansionScreen />}
          {activeTab === 'audit_evidence' && <AuditEvidenceReceiptsScreen />}
          {activeTab === 'settings_scheduler' && <SettingsSchedulerScreen />}

          {/* MOTORES TÉCNICOS (EXIBIDOS APENAS NO MODO AVANÇADO) */}
          {activeTab === 'runtime_router' && <RuntimeRouterScreen />}
          {activeTab === 'evidence_gate' && <EvidenceGateScreen />}
          {activeTab === 'remote_commands' && <RemoteCommandsScreen />}
          {activeTab === 'knowledge_necessity' && <KnowledgeNecessityScreen />}
          {activeTab === 'mnca_500' && <Mnca500Screen />}
          {activeTab === 'passports_eligibility' && <PassportsEligibilityScreen />}
          {activeTab === 'regulatory_watch' && <RegulatoryWatchScreen />}
          {activeTab === 'client_policies' && <ClientPoliciesCpeaaScreen />}
          {activeTab === 'training_center' && <TrainingCompetencyScreen />}
          {activeTab === 'reliability_measurement' && <ReliabilityErrorScreen />}
          {activeTab === 'client_acceptance' && <ClientAcceptanceRevisionScreen />}
          {activeTab === 'master_certification' && <MasterValidationCertificationScreen />}
          {activeTab === 'otctec_lab' && <OperationalLabOtctecScreen />}
          {activeTab === 'enterprise_pilot' && <EnterprisePilotScreen />}
          {activeTab === 'document_studio' && <DocumentStudioScreen />}
          {activeTab === 'brand_stationery' && <BrandStationeryScreen />}
          {activeTab === 'master_prompt_registry' && <MasterPromptRegistryScreen />}

        </div>
      </main>
    </div>
    </NavigationContext.Provider>
  );
}

function FlaskConicalIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" />
      <path d="M8.5 2h7" />
      <path d="M7 16h10" />
    </svg>
  );
}

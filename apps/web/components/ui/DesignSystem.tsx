import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  X,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useNavigation } from '../NavigationContext';

export const COLORS = {
  operacao: '#2563eb', // Blue
  sucesso: '#16a34a',  // Green
  revisao: '#d97706',  // Amber
  risco: '#dc2626',    // Red
  ia: '#7c3aed',       // Purple
  conhecimento: '#14b8a6', // Teal
};

// Action Types for Action Taxonomy
export type ActionType =
  | 'UI_FILTER'
  | 'UI_SEARCH'
  | 'UI_SORT'
  | 'UI_TAB'
  | 'NAVIGATION'
  | 'OPEN_MODAL'
  | 'CRUD_CREATE'
  | 'CRUD_EDIT'
  | 'RESUME'
  | 'PAUSE'
  | 'CANCEL'
  | 'APPROVAL'
  | 'DOWNLOAD'
  | 'EXPORT';

// Helper to classify action by button label
export function classifyAction(label: string): ActionType {
  const lower = label.toLowerCase();
  if (lower.includes('filtrar') || lower.includes('pesquisar') || lower.includes('mostrar') || lower.includes('procurar')) {
    return 'UI_FILTER';
  }
  if (lower.includes('retomar') || lower.includes('activar') || lower.includes('ativar') || lower.includes('reabrir')) {
    return 'RESUME';
  }
  if (lower.includes('pausar') || lower.includes('suspender')) {
    return 'PAUSE';
  }
  if (lower.includes('abrir') || lower.includes('ver') || lower.includes('detalhe')) {
    return 'NAVIGATION';
  }
  if (lower.includes('baixar') || lower.includes('download')) {
    return 'DOWNLOAD';
  }
  if (lower.includes('exportar')) {
    return 'EXPORT';
  }
  if (lower.includes('aprovar') || lower.includes('rejeitar')) {
    return 'APPROVAL';
  }
  if (lower.includes('criar') || lower.includes('contratar') || lower.includes('adicionar') || lower.includes('ligar') || lower.includes('novo')) {
    return 'CRUD_CREATE';
  }
  return 'NAVIGATION';
}

// Hook to automatically detect theme
export const useIsDark = (overrideIsDark?: boolean) => {
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const checkTheme = () => {
      const isLightClass = document.body.classList.contains('theme-light');
      setIsDark(!isLightClass);
    };
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return overrideIsDark !== undefined ? overrideIsDark : isDark;
};

export interface KpiCardProps {
  label: string;
  value: string | number;
  change?: string;
  statusColor?: string;
  isDark?: boolean;
}

export const KpiCard: React.FC<KpiCardProps> = ({ label, value, change, statusColor = COLORS.operacao, isDark: overrideIsDark }) => {
  const isDark = useIsDark(overrideIsDark);

  return (
    <div
      className="glass-card"
      style={{
        padding: '18px 20px',
        borderRadius: '12px',
        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1',
        background: isDark ? 'rgba(15, 23, 42, 0.85)' : '#ffffff',
        boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.35)' : '0 4px 16px rgba(0,0,0,0.05)',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#475569', marginBottom: '6px', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a', letterSpacing: '-0.02em' }}>{value || '--'}</div>
      {change && (
        <div style={{ fontSize: '0.75rem', color: statusColor, marginTop: '4px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor }}></span>
          {change}
        </div>
      )}
    </div>
  );
};

export interface ContentBoxProps {
  code?: string;
  title: string;
  tag?: string;
  children?: React.ReactNode;
  activeTab?: string;
  isDark?: boolean;
}

export const ContentBox: React.FC<ContentBoxProps> = ({ code, title, tag, children, activeTab, isDark: overrideIsDark }) => {
  const isDark = useIsDark(overrideIsDark);
  return (
    <div
      style={{
        background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '18px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.2)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {code && (
          <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(37, 99, 235, 0.1)', color: isDark ? '#60a5fa' : '#1d4ed8', fontFamily: 'monospace' }}>
            {code}
          </span>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeTab && (
            <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.08)', color: isDark ? '#60a5fa' : '#2563eb' }}>
              Aba: {activeTab}
            </span>
          )}
          {tag && <span style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 500 }}>{tag}</span>}
        </div>
      </div>
      <div style={{ fontSize: '0.98rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>{title}</div>
      {children || (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 14px', borderRadius: '8px', background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={15} color={isDark ? '#60a5fa' : '#2563eb'} />
            <span>Dados e métricas sincronizados para a vista <strong>&ldquo;{activeTab || title}&rdquo;</strong>.</span>
          </div>
          <div style={{ display: 'flex', gap: '14px', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', flexWrap: 'wrap' }}>
            <span>Estado: <strong style={{ color: '#4ade80' }}>● Operacional</strong></span>
            <span>Fluxo: <strong>Tempo Real</strong></span>
            <span>Conformidade: <strong>100% Validado</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

export interface ScreenLayoutProps {
  moduleCode?: string;
  title: string;
  subtitle: string;
  canonicalTag?: string;
  breadcrumbs: string[];
  buttons: Array<{ label: string; primary?: boolean; danger?: boolean; onClick?: () => void }>;
  kpis: KpiCardProps[];
  tabs: string[];
  activeTab: string;
  onSelectTab: (tab: string) => void;
  boxes: Array<{ code?: string; title: string; tag?: string; content?: React.ReactNode; tab?: string }>;
  promptsBase?: string[];
  inventoryButtons?: string[];
  inventoryKpis?: string[];
  inventoryTabs?: string[];
  isDark?: boolean;
}

export const ScreenLayout: React.FC<ScreenLayoutProps> = ({
  moduleCode,
  title,
  subtitle,
  canonicalTag,
  breadcrumbs,
  buttons,
  kpis,
  tabs,
  activeTab,
  onSelectTab,
  boxes,
  isDark: overrideIsDark
}) => {
  const isDark = useIsDark(overrideIsDark);
  const nav = useNavigation();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resumeModalTarget, setResumeModalTarget] = useState<string | null>(null);
  const [pauseModalTarget, setPauseModalTarget] = useState<string | null>(null);
  const [pauseReason, setPauseReason] = useState('');

  // Action Router for buttons
  const handleButtonClick = (btn: { label: string; primary?: boolean; danger?: boolean; onClick?: () => void }) => {
    if (btn.onClick) {
      btn.onClick();
      return;
    }

    const lower = btn.label.toLowerCase();

    // Contextual Smart Navigation Router
    if (lower.includes('novo pedido') || lower.includes('criar pedido')) {
      if (nav) {
        nav.openModal('command');
        return;
      }
    }
    if (lower.includes('contratar')) {
      if (nav) {
        nav.setActiveTab('marketplace');
        return;
      }
    }
    if (lower.includes('adicionar conhecimento') || lower.includes('conhecimento')) {
      if (nav) {
        nav.setActiveTab('add_knowledge_wizard');
        return;
      }
    }
    if (lower.includes('aprova')) {
      if (nav) {
        nav.setActiveTab('approvals_center');
        return;
      }
    }
    if (lower.includes('briefing')) {
      if (nav) {
        nav.setActiveTab('daily_briefing');
        return;
      }
    }
    if (lower.includes('tarefa')) {
      if (nav) {
        nav.setActiveTab('task_detail');
        return;
      }
    }
    if (lower.includes('conversa') || lower.includes('chat')) {
      if (nav) {
        nav.setActiveTab('work_center');
        return;
      }
    }
    if (lower.includes('trocar empresa')) {
      if (nav) {
        nav.openModal('tenant');
        return;
      }
    }
    if (lower.includes('empresa') && (lower.includes('abrir') || lower.includes('detalhe') || lower.includes('ver'))) {
      if (nav) {
        nav.setActiveTab('company_detail');
        return;
      }
    }
    if (lower.includes('configur') || lower.includes('definiç')) {
      if (nav) {
        nav.setActiveTab('settings_scheduler');
        return;
      }
    }
    if (lower.includes('notifica') || lower.includes('alerta')) {
      if (nav) {
        nav.openModal('alerts');
        return;
      }
    }
    if (lower.includes('ajuda')) {
      if (nav) {
        nav.openModal('help');
        return;
      }
    }

    // Wizard step advance
    if (lower.includes('seguinte') || lower.includes('avançar') || lower.includes('próximo')) {
      if (tabs && tabs.length > 0 && onSelectTab) {
        const currIdx = tabs.indexOf(activeTab);
        if (currIdx >= 0 && currIdx < tabs.length - 1) {
          onSelectTab(tabs[currIdx + 1]);
          return;
        }
      }
    }

    // Wizard step back
    if (lower.includes('anterior') || lower.includes('voltar') || lower.includes('recuar')) {
      if (tabs && tabs.length > 0 && onSelectTab) {
        const currIdx = tabs.indexOf(activeTab);
        if (currIdx > 0) {
          onSelectTab(tabs[currIdx - 1]);
          return;
        }
      }
    }

    // Choose file / Anexar / Upload
    if (lower.includes('ficheiro') || lower.includes('escolher') || lower.includes('anexar') || lower.includes('importar') || lower.includes('upload') || lower.includes('carregar')) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.csv,.json,.pdf,.xlsx,.doc,.docx';
      fileInput.onchange = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const file = target?.files?.[0];
        if (file) {
          alert(`Ficheiro "${file.name}" carregado com sucesso.`);
        }
      };
      fileInput.click();
      return;
    }

    // Processar / Validar
    if (lower.includes('processar') || lower.includes('validar') || lower.includes('verificar')) {
      if (tabs && tabs.length > 0 && onSelectTab) {
        const currIdx = tabs.indexOf(activeTab);
        if (currIdx >= 0 && currIdx < tabs.length - 1) {
          onSelectTab(tabs[currIdx + 1]);
          return;
        }
      }
      alert(`Validação concluída: 100% de conformidade com os requisitos.`);
      return;
    }

    // Submeter à Revisão / Enviar
    if (lower.includes('revisão') || lower.includes('submeter')) {
      const revTab = tabs?.find(t => t.toLowerCase().includes('revisão'));
      if (revTab && onSelectTab) {
        onSelectTab(revTab);
        return;
      }
      alert(`Submissão enviada para revisão técnica com sucesso.`);
      return;
    }

    // Publicar / Concluir
    if (lower.includes('publicar') || lower.includes('concluir') || lower.includes('finalizar')) {
      const pubTab = tabs?.find(t => t.toLowerCase().includes('publica'));
      if (pubTab && onSelectTab && activeTab !== pubTab) {
        onSelectTab(pubTab);
        return;
      }
      alert(`Publicação concluída com sucesso! Os registos estão operacionais.`);
      return;
    }

    const actionType = classifyAction(btn.label);

    switch (actionType) {
      case 'UI_FILTER': {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input) {
          input.focus();
        }
        break;
      }

      case 'RESUME':
        setResumeModalTarget(title);
        break;

      case 'PAUSE':
        setPauseModalTarget(title);
        break;

      case 'EXPORT':
      case 'DOWNLOAD': {
        const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_export.csv`;
        const sampleData = `Data,Modulo,Registo,Estado\n${new Date().toISOString().split('T')[0]},${moduleCode || 'APP'},Dados Exportados,ACTIVO\n`;
        const blob = new Blob([sampleData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        break;
      }

      default:
        // Do not display bottom toast bar on button clicks
        break;
    }
  };

  const handleConfirmResume = () => {
    setToastMessage(`AI Employee retomado com sucesso.`);
    setResumeModalTarget(null);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleConfirmPause = () => {
    setToastMessage(`AI Employee pausado com sucesso.`);
    setPauseModalTarget(null);
    setPauseReason('');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000, background: '#10b981', color: '#ffffff', padding: '12px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '2px', marginLeft: '6px', display: 'flex', alignItems: 'center' }} title="Fechar">
            <X size={14} />
          </button>
        </div>
      )}

      {/* CONTEXTUAL RESUME CONFIRMATION MODAL */}
      {resumeModalTarget && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>Retomar AI Employee?</div>
              <button onClick={() => setResumeModalTarget(null)} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: isDark ? '#cbd5e1' : '#475569', margin: 0 }}>
              O AI Employee voltará a receber e a processar tarefas pendentes para a empresa activa.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button onClick={() => setResumeModalTarget(null)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleConfirmResume} style={{ padding: '8px 20px', borderRadius: '8px', background: '#2563eb', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Retomar</button>
            </div>
          </div>
        </div>
      )}

      {/* CONTEXTUAL PAUSE CONFIRMATION MODAL */}
      {pauseModalTarget && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: '16px', padding: '24px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>Pausar AI Employee</div>
              <button onClick={() => setPauseModalTarget(null)} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '6px', display: 'block' }}>Motivo da Pausa *</label>
              <textarea
                rows={2}
                placeholder="Informe a razão..."
                value={pauseReason}
                onChange={e => setPauseReason(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30,41,59,0.8)' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.83rem', resize: 'none' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button onClick={() => setPauseModalTarget(null)} style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={handleConfirmPause} style={{ padding: '8px 20px', borderRadius: '8px', background: '#ef4444', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer' }}>Pausar</button>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumbs & Header */}
      <div>
        <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight size={12} />}
              <span>{crumb}</span>
            </React.Fragment>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>{title}</h1>
              {moduleCode && (
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 9px', borderRadius: '12px', background: isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(126, 34, 206, 0.1)', color: isDark ? '#c084fc' : '#7e22ce', border: isDark ? '1px solid rgba(168, 85, 247, 0.3)' : '1px solid rgba(126, 34, 206, 0.3)' }}>
                  {moduleCode}
                </span>
              )}
              {canonicalTag && (
                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', background: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(22, 163, 74, 0.12)', color: isDark ? '#4ade80' : '#15803d', letterSpacing: '0.05em' }}>
                  {canonicalTag}
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.88rem', color: isDark ? '#94a3b8' : '#475569', marginTop: '6px', marginBottom: 0, fontWeight: 400 }}>{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={() => handleButtonClick(btn)}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: btn.primary ? 'none' : (btn.danger ? '1px solid #ef4444' : (isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1')),
              background: btn.primary ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : (btn.danger ? 'rgba(239, 68, 68, 0.15)' : (isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff')),
              color: btn.primary ? '#ffffff' : (btn.danger ? '#ef4444' : (isDark ? '#f8fafc' : '#0f172a')),
              boxShadow: btn.primary ? '0 4px 14px rgba(37, 99, 235, 0.3)' : '0 2px 6px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(kpis.length, 4)}, 1fr)`, gap: '16px' }}>
        {kpis.map((kpi, idx) => (
          <KpiCard key={idx} {...kpi} isDark={isDark} />
        ))}
      </div>

      {/* Tabs */}
      {tabs.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            {tabs.map((tab, idx) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectTab(tab)}
                  style={{
                    padding: '10px 18px',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 800 : 500,
                    color: isActive ? (isDark ? '#60a5fa' : '#1d4ed8') : (isDark ? '#94a3b8' : '#64748b'),
                    border: 'none',
                    borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                    background: isActive ? (isDark ? 'rgba(37, 99, 235, 0.12)' : 'rgba(37, 99, 235, 0.06)') : 'transparent',
                    borderRadius: '8px 8px 0 0',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isDark ? '#cbd5e1' : '#334155' }}>
              <span style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Vista activa:</span>
              <strong style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }}>{activeTab}</strong>
              {moduleCode && (
                <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(37, 99, 235, 0.1)', color: isDark ? '#60a5fa' : '#2563eb', fontFamily: 'monospace' }}>
                  {moduleCode}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 700 }}>● Sincronizado</span>
          </div>
        </div>
      )}

      {/* Content Boxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {boxes
          .filter(box => !box.tab || box.tab === activeTab)
          .map((box, idx) => (
            <ContentBox key={idx} code={box.code} title={box.title} tag={box.tag} activeTab={activeTab} isDark={isDark}>
              {box.content}
            </ContentBox>
          ))}
      </div>

    </div>
  );
};

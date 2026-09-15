import React, { useState } from 'react';
import { ScreenLayout, COLORS, useIsDark } from '../ui/DesignSystem';
import { useNavigation } from '../NavigationContext';
import { Building, X, ShieldCheck, Search, ChevronRight, UserCheck } from 'lucide-react';

interface CompanyItem {
  id: string;
  name: string;
  nif: string;
  sector: string;
  status: string;
  employees: number;
  readiness: string;
}

export const CompaniesTenantsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFileName, setImportFileName] = useState('');
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [filterText, setFilterText] = useState('');
  const nav = useNavigation();
  
  // Real interactive state for companies
  const [companies, setCompanies] = useState<CompanyItem[]>([
    { id: 'ORG-001', name: 'MARVINE, LDA', nif: '541800912', sector: 'Tecnologia & Consultoria', status: 'Activa', employees: 18, readiness: '100%' },
    { id: 'ORG-002', name: 'MINSA — Ministério da Saúde', nif: '500129384', sector: 'Saúde Pública', status: 'Activa', employees: 42, readiness: '100%' },
    { id: 'ORG-003', name: 'BANCO COMERCIAL ANGOLANO', nif: '540192831', sector: 'Banca & Serviços Financeiros', status: 'Em configuração', employees: 6, readiness: '85%' },
    { id: 'ORG-004', name: 'SONANGOL DISTRIBUIÇÃO LDA', nif: '541092833', sector: 'Energia & Petróleo', status: 'Activa', employees: 24, readiness: '100%' }
  ]);

  const handleExportCompanies = () => {
    const header = ['ID,Nome,NIF,Sector,Estado,Employees,Prontidão'];
    const rows = companies.map(c => `"${c.id}","${c.name}","${c.nif}","${c.sector}","${c.status}","${c.employees}","${c.readiness}"`);
    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent([header, ...rows].join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'empresas_registadas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Wizard Step 1 Form State
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [legalForm, setLegalForm] = useState('Sociedade por Quotas (Lda)');
  const [nif, setNif] = useState('');
  const [country, setCountry] = useState('Angola');
  const [province, setProvince] = useState('Luanda');
  const [sector, setSector] = useState('Tecnologia & Consultoria');

  // Wizard Step 2 Form State
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');

  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Wizard Step 3 Form State
  const [language, setLanguage] = useState('Português');
  const [currency, setCurrency] = useState('AOA (Kwanza)');
  const [timezone, setTimezone] = useState('WAT (UTC+1)');
  const [jurisdiction, setJurisdiction] = useState('Angola (AGT / PGC)');

  const isDark = useIsDark();

  const handleUseMyData = () => {
    setAdminName('Victorino Aguiar');
    setAdminEmail('victorino.aguiar@marvine.co.ao');
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!legalName.trim()) return;

    const newCompany = {
      id: `ORG-00${companies.length + 1}`,
      name: legalName.toUpperCase(),
      nif: nif || `540${Math.floor(100000 + Math.random() * 900000)}`,
      sector: sector,
      status: 'Activa',
      employees: 1,
      readiness: '100%'
    };

    setCompanies([newCompany, ...companies]);
    setLegalName('');
    setTradeName('');
    setNif('');
    setCompanyEmail('');
    setAdminName('');
    setAdminEmail('');
    setWizardStep(1);
    setShowModal(false);
  };

  const filteredCompanies = companies.filter(c => {
    if (activeTab === 'Activas') return c.status === 'Activa';
    if (activeTab === 'Configuração') return c.status === 'Em configuração';
    if (activeTab === 'Suspensas') return c.status === 'Suspensa';
    return true;
  }).filter(c => c.name.toLowerCase().includes(filterText.toLowerCase()) || c.nif.includes(filterText));

  return (
    <div style={{ position: 'relative' }}>
      
      {/* 3-STEP COMPANY CREATION WIZARD MODAL */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={wizardStep === 3 ? handleCreateCompany : (e) => { e.preventDefault(); setWizardStep((wizardStep + 1) as 1 | 2 | 3); }} style={{ background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: '16px', padding: '28px', maxWidth: '640px', width: '100%', boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.6)' : '0 10px 30px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* WIZARD HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Building color="#2563eb" size={24} /> Criar Nova Empresa
                </div>
                <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                  Passo {wizardStep} de 3 — {wizardStep === 1 ? 'Identificação Legal' : wizardStep === 2 ? 'Contactos & Administração' : 'Configuração Inicial'}
                </div>
              </div>
              <button type="button" onClick={() => { setShowModal(false); setWizardStep(1); }} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* WIZARD PROGRESS BAR */}
            <div style={{ display: 'flex', gap: '8px', height: '4px', background: isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ flex: 1, background: wizardStep >= 1 ? '#2563eb' : 'transparent', transition: 'background 0.3s' }} />
              <div style={{ flex: 1, background: wizardStep >= 2 ? '#2563eb' : 'transparent', transition: 'background 0.3s' }} />
              <div style={{ flex: 1, background: wizardStep >= 3 ? '#2563eb' : 'transparent', transition: 'background 0.3s' }} />
            </div>

            {/* PASSO 1: IDENTIFICAÇÃO DA EMPRESA */}
            {wizardStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Razão Social *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: MARVINE TECNOLOGIAS LDA"
                      value={legalName}
                      onChange={e => setLegalName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.83rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Nome Comercial</label>
                    <input
                      type="text"
                      placeholder="Ex: Marvine Tech"
                      value={tradeName}
                      onChange={e => setTradeName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.83rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>NIF / Identificação Fiscal *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 541800912"
                      value={nif}
                      onChange={e => setNif(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.83rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Forma Jurídica *</label>
                    <select
                      value={legalForm}
                      onChange={e => setLegalForm(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.83rem' }}
                    >
                      <option value="Sociedade por Quotas (Lda)">Sociedade por Quotas (Lda)</option>
                      <option value="Sociedade Anónima (S.A.)">Sociedade Anónima (S.A.)</option>
                      <option value="Unipessoal Lda">Unipessoal Lda</option>
                      <option value="Empresa Pública">Empresa Pública</option>
                      <option value="Organismo de Estado / Ministério">Organismo de Estado / Ministério</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>País *</label>
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.82rem' }}
                    >
                      <option value="Angola">Angola</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Moçambique">Moçambique</option>
                      <option value="Brasil">Brasil</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Província / Região</label>
                    <input
                      type="text"
                      value={province}
                      onChange={e => setProvince(e.target.value)}
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Sector *</label>
                    <select
                      value={sector}
                      onChange={e => setSector(e.target.value)}
                      style={{ width: '100%', padding: '9px 10px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.82rem' }}
                    >
                      <option value="Tecnologia & Consultoria">Tecnologia & Consultoria</option>
                      <option value="Contabilidade & Finanças">Contabilidade & Finanças</option>
                      <option value="Banca & Seguros">Banca & Seguros</option>
                      <option value="Saúde Pública">Saúde Pública</option>
                      <option value="Energia & Petróleo">Energia & Petróleo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 2: CONTACTOS E ADMINISTRADOR */}
            {wizardStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#60a5fa' : '#1d4ed8' }}>Contactos Institucionais</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Email Institucional *</label>
                    <input
                      type="email"
                      required
                      placeholder="geral@empresa.co.ao"
                      value={companyEmail}
                      onChange={e => setCompanyEmail(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.83rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Telefone Principal</label>
                    <input
                      type="text"
                      placeholder="+244 923 000 000"
                      value={companyPhone}
                      onChange={e => setCompanyPhone(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.83rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#60a5fa' : '#1d4ed8' }}>Administrador Principal</div>
                  <button
                    type="button"
                    onClick={handleUseMyData}
                    style={{ padding: '4px 10px', borderRadius: '6px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff', border: '1px solid #3b82f6', color: isDark ? '#93c5fd' : '#1d4ed8', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <UserCheck size={14} /> Usar os Meus Dados
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Nome do Administrador *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome completo"
                      value={adminName}
                      onChange={e => setAdminName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.83rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Email do Administrador *</label>
                    <input
                      type="email"
                      required
                      placeholder="admin@empresa.co.ao"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.83rem' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PASSO 3: CONFIGURAÇÃO INICIAL */}
            {wizardStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: isDark ? '#60a5fa' : '#1d4ed8' }}>Preferências Regionais & Fiscais</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Idioma do Sistema *</label>
                    <select
                      value={language}
                      onChange={e => setLanguage(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.83rem' }}
                    >
                      <option value="Português">Português</option>
                      <option value="English">English</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Moeda de Conta *</label>
                    <select
                      value={currency}
                      onChange={e => setCurrency(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.83rem' }}
                    >
                      <option value="AOA (Kwanza)">AOA (Kwanza)</option>
                      <option value="EUR (€)">EUR (€)</option>
                      <option value="USD ($)">USD ($)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Fuso Horário *</label>
                    <select
                      value={timezone}
                      onChange={e => setTimezone(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.83rem' }}
                    >
                      <option value="WAT (UTC+1)">Africa/Luanda (WAT, UTC+1)</option>
                      <option value="WET (UTC+0)">Europe/Lisbon (WET, UTC+0)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Jurisdição Fiscal *</label>
                    <select
                      value={jurisdiction}
                      onChange={e => setJurisdiction(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.83rem' }}
                    >
                      <option value="Angola (AGT / PGC)">Angola (AGT / PGC)</option>
                      <option value="Portugal (AT / SNC)">Portugal (AT / SNC)</option>
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: '0.75rem', padding: '10px 14px', borderRadius: '8px', background: isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7', color: isDark ? '#4ade80' : '#15803d', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={16} /> O ambiente privado da empresa será criado com isolamento de dados e suporte total aos 500 AI Employees.
                </div>
              </div>
            )}

            {/* WIZARD ACTIONS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
              {wizardStep > 1 ? (
                <button type="button" onClick={() => setWizardStep((wizardStep - 1) as 1 | 2 | 3)} style={{ padding: '9px 18px', borderRadius: '8px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600, cursor: 'pointer' }}>
                  Voltar
                </button>
              ) : <div />}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => { setShowModal(false); setWizardStep(1); }} style={{ padding: '9px 18px', borderRadius: '8px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ padding: '9px 22px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {wizardStep === 3 ? 'Criar Empresa' : 'Seguinte'} {wizardStep < 3 && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* IMPORT EMPRESA MODAL */}
      {showImportModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: '16px', padding: '28px', maxWidth: '520px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Importar Empresas em Lote</div>
              <button onClick={() => setShowImportModal(false)} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.84rem', color: isDark ? '#cbd5e1' : '#475569', margin: 0 }}>
              Carregue um ficheiro estruturado (CSV, Excel ou JSON) contendo o NIF, Nome e Sector das empresas a importar.
            </p>
            <div
              style={{
                border: isDark ? '2px dashed rgba(59, 130, 246, 0.4)' : '2px dashed #93c5fd',
                borderRadius: '12px',
                padding: '30px 20px',
                textAlign: 'center',
                background: isDark ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc',
                cursor: 'pointer'
              }}
              onClick={() => {
                const fi = document.getElementById('company-file-input') as HTMLInputElement;
                fi?.click();
              }}
            >
              <Building size={32} color="#3b82f6" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontSize: '0.88rem', fontWeight: 700 }}>{importFileName || 'Clique ou arraste o ficheiro aqui'}</div>
              <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px' }}>Formatos suportados: CSV, XLSX, JSON (máx. 10MB)</div>
              <input
                id="company-file-input"
                type="file"
                accept=".csv,.xlsx,.json"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setImportFileName(f.name);
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button onClick={() => { setShowImportModal(false); setImportFileName(''); }} style={{ padding: '9px 18px', borderRadius: '8px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  setCompanies(prev => [
                    ...prev,
                    { id: `ORG-00${prev.length + 1}`, name: 'TECH NOVA ANGOLA, LDA', nif: '542918230', sector: 'Telecomunicações & TI', status: 'Activa', employees: 12, readiness: '100%' }
                  ]);
                  setShowImportModal(false);
                  setImportFileName('');
                }}
                style={{ padding: '9px 22px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}
              >
                Concluir Importação
              </button>
            </div>
          </div>
        </div>
      )}

      <ScreenLayout
        moduleCode="ADMIN-01"
        title="Empresas"
        subtitle="Gerir empresas, utilizadores, AI Employees, integrações e estado operacional."
        breadcrumbs={['Empresas']}
        buttons={[
          { label: 'Criar Empresa', primary: true, onClick: () => { setWizardStep(1); setShowModal(true); } },
          { label: 'Importar Empresa', onClick: () => setShowImportModal(true) },
          { label: 'Abrir Empresa', onClick: () => nav?.setActiveTab('company_detail') },
          { label: 'Configurar', onClick: () => nav?.setActiveTab('company_provisioning') },
          { label: 'Exportar', onClick: handleExportCompanies }
        ]}
        kpis={[
          { label: 'Empresas activas', value: companies.filter(c => c.status === 'Activa').length, change: '100% isolamento', statusColor: COLORS.sucesso },
          { label: 'Em configuração', value: companies.filter(c => c.status === 'Em configuração').length, change: 'Em onboarding', statusColor: COLORS.operacao },
          { label: 'Employees contratados', value: '90 / 500', change: 'Nas empresas', statusColor: COLORS.ia },
          { label: 'Estado do sistema', value: 'SAUDÁVEL', change: 'Zero bloqueios', statusColor: COLORS.sucesso }
        ]}
        tabs={['Todas', 'Activas', 'Configuração', 'Suspensas']}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        boxes={getBoxesForCompanies(activeTab, isDark, filteredCompanies, filterText, setFilterText, nav)}
        promptsBase={['MPR-003', 'MPR-004']}
        inventoryButtons={['01 Criar Empresa', '02 Importar Empresa', '03 Abrir Empresa', '04 Configurar', '05 Exportar']}
        inventoryKpis={['01 Empresas activas', '02 Em configuração', '03 Employees contratados', '04 Estado do sistema']}
        inventoryTabs={['01 Todas', '02 Activas', '03 Configuração', '04 Suspensas']}
      />
    </div>
  );
};

function getBoxesForCompanies(
  activeTab: string,
  isDark: boolean,
  filteredCompanies: CompanyItem[],
  filterText: string,
  setFilterText: (text: string) => void,
  nav: ReturnType<typeof useNavigation>
) {
  if (activeTab === 'Configuração') {
    const configItems = [
      { id: 'ORG-003', name: 'BANCO COMERCIAL ANGOLANO', nif: '540192831', step: 'Passo 3: Conexão ERP & Core Bancário', progress: '85%', pending: 'Falta autorização de chave API do Core Bancário' },
      { id: 'ORG-005', name: 'LOGÍSTICA TRANS-ANGOLA LDA', nif: '541298410', step: 'Passo 2: Atribuição de 8 AI Employees', progress: '50%', pending: 'Aprovação de limites de crédito pela administração' }
    ];
    return [
      {
        code: 'BOX-ORG-CFG-01',
        title: 'Empresas em Fase de Onboarding & Provisionamento',
        tag: `${configItems.length} Em Configuração`,
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {configItems.map(c => (
              <div key={c.id} style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: isDark ? '#60a5fa' : '#1d4ed8' }}>{c.id}</span>
                    <span style={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>{c.name}</span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(234, 179, 8, 0.15)', color: '#facc15', fontWeight: 700 }}>{c.progress}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Fase: <strong>{c.step}</strong> • Pendência: <strong style={{ color: '#f87171' }}>{c.pending}</strong>
                  </div>
                </div>
                <button onClick={() => nav?.setActiveTab('company_provisioning')} style={{ padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Continuar Setup
                </button>
              </div>
            ))}
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Suspensas') {
    return [
      {
        code: 'BOX-ORG-SUS-01',
        title: 'Empresas Suspensas ou Desactivadas',
        tag: '0 Empresas Suspensas',
        content: (
          <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
            <ShieldCheck size={36} color="#4ade80" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: isDark ? '#f8fafc' : '#0f172a' }}>Todas as empresas encontram-se activas e regulares.</div>
            <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Nenhum tenant foi suspenso por violação de políticas, inadimplência ou ordem judicial.</div>
          </div>
        )
      }
    ];
  }

  // Default: Todas / Activas
  return [
    {
      code: 'BOX-ORG-01-01',
      title: activeTab === 'Activas' ? 'Empresas Activas com Workforce Operacional' : 'Lista Geral de Empresas Registadas no Sistema',
      tag: `${filteredCompanies.length} Empresas`,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f1f5f9', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '8px', flex: 1 }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Pesquisar por nome da empresa ou NIF..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '10px' }}>EMPRESA</th>
                  <th style={{ padding: '10px' }}>NIF</th>
                  <th style={{ padding: '10px' }}>SECTOR DE ACTIVIDADE</th>
                  <th style={{ padding: '10px' }}>ESTADO</th>
                  <th style={{ padding: '10px' }}>EMPLOYEES</th>
                  <th style={{ padding: '10px' }}>PRONTIDÃO</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map(comp => (
                  <tr
                    key={comp.id}
                    onClick={() => nav?.setActiveTab('company_detail')}
                    style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', color: isDark ? '#e2e8f0' : '#1e293b', cursor: 'pointer', transition: 'background 0.15s ease' }}
                    title="Clique para abrir detalhes da empresa"
                  >
                    <td style={{ padding: '12px 10px', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>{comp.name}</td>
                    <td style={{ padding: '12px 10px', fontFamily: 'monospace', color: isDark ? '#60a5fa' : '#1d4ed8' }}>{comp.nif}</td>
                    <td style={{ padding: '12px 10px' }}>{comp.sector}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', background: comp.status === 'Activa' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)', color: comp.status === 'Activa' ? '#4ade80' : '#facc15' }}>
                        {comp.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', fontWeight: 700 }}>{comp.employees} AI Employees</td>
                    <td style={{ padding: '12px 10px', color: '#4ade80', fontWeight: 800 }}>{comp.readiness}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }
  ];
}

export const CompanyDetail360Screen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Resumo 360');
  const nav = useNavigation();
  const isDark = useIsDark();

  return (
    <ScreenLayout
      moduleCode="ADMIN-01"
      title="Detalhe da Empresa — MARVINE, LDA"
      subtitle="Visão 360 da organização: dados legais, colaboradores, AI Employees, consumo e configurações."
      breadcrumbs={['Empresas', 'Detalhe da Empresa']}
      buttons={[
        { label: 'Editar Empresa', primary: true, onClick: () => nav?.setActiveTab('company_provisioning') },
        { label: 'Adicionar AI Employee', onClick: () => nav?.setActiveTab('marketplace') },
        { label: 'Convidar Utilizador', onClick: () => nav?.setActiveTab('security_permissions') },
        { label: 'Ver Facturação', onClick: () => nav?.setActiveTab('billing_payments') },
        { label: 'Exportar Audit Pack', onClick: () => {
          const content = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ empresa: "MARVINE, LDA", nif: "541800912", status: "ACTIVO", data: new Date().toISOString() }, null, 2));
          const dl = document.createElement('a');
          dl.setAttribute('href', content);
          dl.setAttribute('download', 'audit_pack_marvine.json');
          document.body.appendChild(dl);
          dl.click();
          document.body.removeChild(dl);
        }}
      ]}
      kpis={[
        { label: 'Empresa', value: 'MARVINE, LDA', change: 'NIF 541800912', statusColor: COLORS.operacao },
        { label: 'AI Employees', value: '18 contratados', change: '4 áreas', statusColor: COLORS.ia },
        { label: 'Utilizadores', value: '12 humanos', change: 'Activos', statusColor: COLORS.sucesso },
        { label: 'Plano SaaS', value: 'ENTERPRISE 50', change: 'Facturação mensal', statusColor: COLORS.sucesso }
      ]}
      tabs={['Resumo 360', 'AI Employees', 'Utilizadores', 'Conhecimento', 'Integrações', 'Facturação']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForCompanyDetail(activeTab, isDark, nav)}
      promptsBase={['MPR-003', 'MPR-004', 'MPR-005']}
      inventoryButtons={['01 Editar Empresa', '02 Adicionar AI Employee', '03 Convidar Utilizador', '04 Ver Facturação', '05 Exportar Audit Pack']}
      inventoryKpis={['01 Empresa', '02 AI Employees', '03 Utilizadores', '04 Plano SaaS']}
      inventoryTabs={['01 Resumo 360', '02 AI Employees', '03 Utilizadores', '04 Conhecimento', '05 Integrações', '06 Facturação']}
    />
  );
};

function getBoxesForCompanyDetail(activeTab: string, isDark: boolean, nav: ReturnType<typeof useNavigation>) {
  if (activeTab === 'AI Employees') {
    const employees = [
      { key: 'FIN-01', name: 'Contabilista Sénior PGC', dept: 'Finanças', status: 'Activo', tasksToday: 14, efficiency: '99.8%' },
      { key: 'TAX-01', name: 'Perito Fiscal & IVA', dept: 'Fiscalidade', status: 'Activo', tasksToday: 8, efficiency: '100%' },
      { key: 'LEG-01', name: 'Advogado Comercial & Contratos', dept: 'Jurídico', status: 'Activo', tasksToday: 4, efficiency: '98.5%' },
      { key: 'SAL-01', name: 'SDR & Qualificação de Leads', dept: 'Vendas', status: 'Activo', tasksToday: 26, efficiency: '99.2%' },
      { key: 'HR-01', name: 'Técnico de Processamento Salarial', dept: 'Recursos Humanos', status: 'Activo', tasksToday: 12, efficiency: '100%' }
    ];
    return [
      {
        code: 'BOX-ORG-EMP-01',
        title: 'Workforce Digital Activa na Empresa (18 AI Employees)',
        tag: '18 Contratados',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
              {employees.map(e => (
                <div key={e.key} style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem', color: isDark ? '#60a5fa' : '#1d4ed8' }}>{e.key}</span>
                    <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>{e.status}</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{e.name}</div>
                  <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b' }}>{e.dept} • {e.tasksToday} tarefas hoje • {e.efficiency} SLA</div>
                </div>
              ))}
            </div>
            <button onClick={() => nav?.setActiveTab('marketplace')} style={{ alignSelf: 'flex-start', padding: '8px 18px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
              + Contratar Mais AI Employees do Catálogo (500 Roles)
            </button>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Utilizadores') {
    const users = [
      { name: 'Victorino Aguiar', email: 'victorino.aguiar@marvine.co.ao', role: 'Administrador Geral', access: 'Total (Super Admin)', status: 'Activo' },
      { name: 'Marta Silva', email: 'marta.silva@marvine.co.ao', role: 'Directora Financeira', access: 'Aprovações & Financeiro', status: 'Activo' },
      { name: 'João Costa', email: 'joao.costa@marvine.co.ao', role: 'Gestor de Operações', access: 'Tarefas & Workforce', status: 'Activo' }
    ];
    return [
      {
        code: 'BOX-ORG-USR-01',
        title: 'Utilizadores Humanos & Níveis de Acesso',
        tag: '12 Utilizadores',
        content: (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '10px' }}>UTILIZADOR</th>
                  <th style={{ padding: '10px' }}>EMAIL</th>
                  <th style={{ padding: '10px' }}>CARGO</th>
                  <th style={{ padding: '10px' }}>PERMISSÃO</th>
                  <th style={{ padding: '10px' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={i} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    <td style={{ padding: '10px', fontWeight: 800 }}>{u.name}</td>
                    <td style={{ padding: '10px', color: isDark ? '#60a5fa' : '#1d4ed8' }}>{u.email}</td>
                    <td style={{ padding: '10px' }}>{u.role}</td>
                    <td style={{ padding: '10px' }}>{u.access}</td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>{u.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Conhecimento') {
    const docs = [
      { title: 'Manual de Procedimentos Financeiros Marvine 2026', scope: 'Privado', verified: true },
      { title: 'Tabela de Preços & Condições Comerciais Internas', scope: 'Comercial', verified: true },
      { title: 'Política de Viagens & Despesas Reembolsáveis', scope: 'Geral', verified: true }
    ];
    return [
      {
        code: 'BOX-ORG-KNO-01',
        title: 'Bases de Conhecimento Privadas da Empresa',
        tag: '3 Fontes Privadas',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {docs.map((d, i) => (
              <div key={i} style={{ padding: '12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem' }}>📄 {d.title}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Âmbito: {d.scope} • Isolamento de dados garantido</div>
                </div>
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>VALIDADO</span>
              </div>
            ))}
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Integrações') {
    const connectors = [
      { name: 'Primavera ERP v10', status: 'Conectado', sync: 'Sincronizado há 2 min' },
      { name: 'WhatsApp Business Cloud API', status: 'Conectado', sync: 'Online (Webhook activo)' },
      { name: 'Google Workspace & Drive', status: 'Conectado', sync: 'Sincronizado há 15 min' },
      { name: 'Banco BAI Direto API', status: 'Conectado', sync: 'Extractos em tempo real' }
    ];
    return [
      {
        code: 'BOX-ORG-INT-01',
        title: 'Conectores & Integrações Activas na Empresa',
        tag: '4 Conectores Online',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {connectors.map((c, i) => (
              <div key={i} style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{c.name}</div>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>{c.status}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b' }}>{c.sync}</div>
              </div>
            ))}
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Facturação') {
    return [
      {
        code: 'BOX-ORG-BIL-01',
        title: 'Subscrição, Facturação & Consumo de IA',
        tag: 'Plano Enterprise 50',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>PLANO ACTUAL</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: isDark ? '#60a5fa' : '#1d4ed8' }}>ENTERPRISE 50</div>
                <div style={{ fontSize: '0.74rem', color: '#4ade80', marginTop: '2px' }}>Até 50 AI Employees</div>
              </div>
              <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>VALOR MENSAL</div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>Kz 1.850.000 / mês</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Próxima renovação: 01/10/2026</div>
              </div>
            </div>
            <button onClick={() => nav?.setActiveTab('billing_payments')} style={{ alignSelf: 'flex-start', padding: '8px 18px', borderRadius: '8px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
              Ver Facturas & Métodos de Pagamento
            </button>
          </div>
        )
      }
    ];
  }

  // Default: Resumo 360
  return [
    {
      code: 'BOX-ORG-RES-01',
      title: 'Ficha Cadastral da Empresa & Identidade Legal',
      tag: 'Auditado AGT',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>RAZÃO SOCIAL</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginTop: '2px' }}>MARVINE, LDA</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>NIF</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginTop: '2px', color: isDark ? '#60a5fa' : '#1d4ed8' }}>541800912</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>SECTOR</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginTop: '2px' }}>Tecnologia & Consultoria</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>SEDE / PROVÍNCIA</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginTop: '2px' }}>Luanda, Angola</div>
            </div>
          </div>
          <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(34, 197, 94, 0.08)' : '#f0fdf4', border: '1px solid rgba(34, 197, 94, 0.25)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} color="#22c55e" />
            <div style={{ fontSize: '0.82rem', color: isDark ? '#f8fafc' : '#14532d' }}>
              <strong>Isolamento Multi-Tenant Activo:</strong> As operações, documentos e tarefas de MARVINE, LDA encontram-se isoladas criptograficamente e protegidas contra acesso cruzado.
            </div>
          </div>
        </div>
      )
    }
  ];
}

export const ProvisioningWizardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Passo 1 — Empresa');
  const nav = useNavigation();
  const isDark = useIsDark();

  const stepTabs = ['Passo 1 — Empresa', 'Passo 2 — Admin', 'Passo 3 — Employees', 'Passo 4 — Activação'];

  const handleNext = () => {
    const idx = stepTabs.indexOf(activeTab);
    if (idx < stepTabs.length - 1) {
      setActiveTab(stepTabs[idx + 1]);
    } else {
      alert('Configuração concluída com sucesso! Empresa activada e pronta para produção.');
      nav?.setActiveTab('companies');
    }
  };

  const handlePrev = () => {
    const idx = stepTabs.indexOf(activeTab);
    if (idx > 0) {
      setActiveTab(stepTabs[idx - 1]);
    }
  };

  return (
    <ScreenLayout
      moduleCode="ADMIN-01"
      title="Configuração Inicial da Empresa (Provisioning Wizard)"
      subtitle="Wizard de integração: empresa, utilizador admin, associar AI Employees e ativar canais operacionais."
      breadcrumbs={['Empresas', 'Configuração Inicial']}
      buttons={[
        { label: activeTab === 'Passo 4 — Activação' ? 'Concluir & Activar Empresa' : 'Seguinte', primary: true, onClick: handleNext },
        { label: 'Voltar', onClick: handlePrev },
        { label: 'Guardar Rascunho', onClick: () => alert('Rascunho da empresa guardado com sucesso!') },
        { label: 'Cancelar', onClick: () => nav?.setActiveTab('companies') }
      ]}
      kpis={[
        { label: 'Passo actual', value: `${stepTabs.indexOf(activeTab) + 1} / 4`, change: activeTab, statusColor: COLORS.operacao },
        { label: 'Validação NIF', value: 'VÁLIDO (AGT)', change: 'Auto-detectado', statusColor: COLORS.sucesso },
        { label: 'Plano atribuído', value: 'STARTER 5', change: 'Pre-configurado', statusColor: COLORS.ia }
      ]}
      tabs={stepTabs}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForProvisioning(activeTab, isDark, handleNext)}
      promptsBase={['MPR-003', 'MPR-004']}
      inventoryButtons={['01 Seguinte', '02 Voltar', '03 Guardar Rascunho', '04 Cancelar']}
      inventoryKpis={['01 Passo actual', '02 Validação NIF', '03 Plano atribuído']}
      inventoryTabs={['01 Passo 1 — Empresa', '02 Passo 2 — Admin', '03 Passo 3 — Employees', '04 Passo 4 — Activação']}
    />
  );
};

function getBoxesForProvisioning(activeTab: string, isDark: boolean, handleNext: () => void) {
  if (activeTab === 'Passo 2 — Admin') {
    return [
      {
        code: 'BOX-PROV-02',
        title: 'Passo 2: Criação da Conta do Administrador Corporativo',
        tag: 'Segurança & Acesso',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Nome Completo *</label>
                <input type="text" defaultValue="Victorino Aguiar" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Email Corporativo *</label>
                <input type="email" defaultValue="victorino.aguiar@marvine.co.ao" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Cargo na Organização</label>
                <input type="text" defaultValue="Director Geral" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Telefone WhatsApp (para alertas)</label>
                <input type="text" defaultValue="+244 923 000 000" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem' }} />
              </div>
            </div>
            <button onClick={handleNext} style={{ alignSelf: 'flex-end', padding: '9px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>
              Avançar para Passo 3 →
            </button>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Passo 3 — Employees') {
    return [
      {
        code: 'BOX-PROV-03',
        title: 'Passo 3: Selecção dos AI Employees Iniciais da Empresa',
        tag: 'Pacote Inicial (5 Roles)',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569' }}>
              Selecione as primeiras funções digitais a ativar para este tenant:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
              {['Contabilista Sénior PGC', 'Perito Fiscal & IVA', 'SDR & Qualificação de Leads', 'Advogado Comercial & Contratos', 'Técnico de Salários'].map((role, idx) => (
                <div key={idx} style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{role}</div>
                    <div style={{ fontSize: '0.7rem', color: '#4ade80' }}>✓ Incluído no plano</div>
                  </div>
                  <input type="checkbox" defaultChecked style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                </div>
              ))}
            </div>
            <button onClick={handleNext} style={{ alignSelf: 'flex-end', padding: '9px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.82rem', marginTop: '6px' }}>
              Avançar para Passo 4 →
            </button>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Passo 4 — Activação') {
    return [
      {
        code: 'BOX-PROV-04',
        title: 'Passo 4: Verificação Final & Activação do Tenant',
        tag: 'Pronto para Produção',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '16px', borderRadius: '10px', background: isDark ? 'rgba(34, 197, 94, 0.08)' : '#f0fdf4', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
              <div style={{ fontWeight: 800, color: '#22c55e', fontSize: '0.9rem', marginBottom: '8px' }}>✓ Checklist de Validação do Tenant Concluída com Sucesso:</div>
              <div style={{ fontSize: '0.8rem', color: isDark ? '#cbd5e1' : '#14532d', lineHeight: 1.6 }}>
                • NIF 541800912 validado na base de dados fiscal.<br />
                • Ambiente multi-tenant isolado e base de dados encriptada provisionada.<br />
                • 5 AI Employees prontos para inicialização de contexto e SOPs.<br />
                • Chave de webhook e conectores preparados para sincronização.
              </div>
            </div>
            <button onClick={handleNext} style={{ alignSelf: 'flex-start', padding: '10px 24px', borderRadius: '8px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.85rem', boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)' }}>
              🚀 Concluir & Activar Empresa em Produção
            </button>
          </div>
        )
      }
    ];
  }

  // Default: Passo 1 — Empresa
  return [
    {
      code: 'BOX-PROV-01',
      title: 'Passo 1: Identificação Legal da Empresa',
      tag: 'Dados Cadastrais',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Razão Social *</label>
              <input type="text" defaultValue="MARVINE TECNOLOGIAS LDA" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>NIF / Identificação Fiscal *</label>
              <input type="text" defaultValue="541800912" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Sector de Actividade</label>
              <input type="text" defaultValue="Tecnologia & Consultoria" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem' }} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Jurisdição Fiscal</label>
              <input type="text" defaultValue="Angola (AGT / PGC)" style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem' }} />
            </div>
          </div>
          <button onClick={handleNext} style={{ alignSelf: 'flex-end', padding: '9px 20px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>
            Avançar para Passo 2 →
          </button>
        </div>
      )
    }
  ];
}

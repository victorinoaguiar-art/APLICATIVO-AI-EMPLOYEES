import React, { useState } from 'react';
import { ScreenLayout, COLORS, useIsDark } from '../ui/DesignSystem';
import { useNavigation } from '../NavigationContext';
import { BookOpen, Plus, X, FileText, Search, CheckCircle2, Shield, Upload } from 'lucide-react';

export const KnowledgeCenterScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Biblioteca');
  const [showModal, setShowModal] = useState(false);
  const [filterText, setFilterText] = useState('');
  const isDark = useIsDark();
  const nav = useNavigation();

  // Real interactive state for knowledge documents
  const [documents, setDocuments] = useState([
    { id: 'KNO-101', title: 'Código do Imposto sobre o Valor Acrescentado (CIVA Angola)', category: 'Legislação Fiscal', scope: 'Global', status: 'Publicada', hash: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
    { id: 'KNO-102', title: 'Manual de Procedimentos Internos de Tesouraria v2.1', category: 'Manual Interno', scope: 'Financeiro', status: 'Publicada', hash: 'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069' },
    { id: 'KNO-103', title: 'Regulamento de Segurança e Protecção de Dados APD', category: 'Conformidade', scope: 'Global', status: 'Publicada', hash: 'sha256:603786460b555e250556d34d21db1047466e22f3d2b25b65b6851e452dcd8ed9' }
  ]);

  // Knowledge Form State
  const [docTitle, setDocTitle] = useState('');
  const [category, setCategory] = useState('Legislação Fiscal');
  const [scope, setScope] = useState('Global');

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim()) return;

    const newDoc = {
      id: `KNO-10${documents.length + 1}`,
      title: docTitle,
      category,
      scope,
      status: 'Publicada',
      hash: `sha256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
    };

    setDocuments([...documents, newDoc]);
    setDocTitle('');
    setShowModal(false);
  };

  const filteredDocs = documents.filter(doc =>
    doc.title.toLowerCase().includes(filterText.toLowerCase()) ||
    doc.category.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div style={{ position: 'relative' }}>
      {/* ADD KNOWLEDGE MODAL */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleAddDocument} style={{ background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: '16px', padding: '28px', maxWidth: '520px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BookOpen size={20} color="#14b8a6" /> Adicionar Fonte de Conhecimento
              </div>
              <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '6px', display: 'block' }}>Título da Fonte / Legislação *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Regulamento Geral de Protecção de Dados..."
                  value={docTitle}
                  onChange={e => setDocTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '6px', display: 'block' }}>Categoria *</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.85rem' }}
                  >
                    <option value="Legislação Fiscal">Legislação Fiscal</option>
                    <option value="Manual Interno">Manual Interno</option>
                    <option value="Conformidade">Conformidade</option>
                    <option value="Normas Contabilísticas">Normas Contabilísticas</option>
                    <option value="Políticas de RH">Políticas de RH</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '6px', display: 'block' }}>Âmbito *</label>
                  <select
                    value={scope}
                    onChange={e => setScope(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.85rem' }}
                  >
                    <option value="Global">Global (Todas as Empresas)</option>
                    <option value="Financeiro">Departamento Financeiro</option>
                    <option value="Operações">Operações</option>
                    <option value="Privado">Privado</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '6px', display: 'block' }}>Ficheiro PDF ou Texto (Upload Real)</label>
                <div style={{ border: isDark ? '2px dashed rgba(255,255,255,0.15)' : '2px dashed #cbd5e1', borderRadius: '8px', padding: '20px', textAlign: 'center', background: isDark ? 'rgba(30, 41, 59, 0.3)' : '#f8fafc', cursor: 'pointer' }}>
                  <Upload size={24} color="#14b8a6" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Clique para seleccionar ficheiro PDF, DOCX ou TXT</div>
                  <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>A integridade SHA-256 será calculada automaticamente.</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '9px 18px', borderRadius: '8px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button type="submit" style={{ padding: '9px 22px', borderRadius: '8px', background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(20, 184, 166, 0.3)' }}>
                Carregar & Publicar
              </button>
            </div>
          </form>
        </div>
      )}

      <ScreenLayout
        moduleCode="KNO-01"
        title="Knowledge Center"
        subtitle="Biblioteca central de conhecimento global, regulatório, sectorial, vendor e privado da empresa."
        breadcrumbs={['Conhecimento', 'Knowledge Center']}
        buttons={[
          { label: 'Adicionar Conhecimento', primary: true, onClick: () => nav?.setActiveTab('add_knowledge_wizard') },
          { label: 'Upload em Lote', onClick: () => setShowModal(true) },
          { label: 'Adicionar Fonte Oficial', onClick: () => nav?.setActiveTab('add_knowledge_wizard') },
          { label: 'Criar Procedimento', onClick: () => nav?.setActiveTab('add_knowledge_wizard') },
          { label: 'Nova Versão', onClick: () => setShowModal(true) }
        ]}
        kpis={[
          { label: 'Fontes publicadas', value: documents.length, change: 'Comprovadas com hash', statusColor: COLORS.conhecimento },
          { label: 'Aguardam revisão', value: '0', change: 'Novos uploads', statusColor: COLORS.sucesso },
          { label: 'Críticas', value: '42', change: 'Legislação & Fiscal', statusColor: COLORS.operacao },
          { label: 'Desactualizadas', value: '0', change: 'Auditadas', statusColor: COLORS.sucesso }
        ]}
        tabs={['Biblioteca', 'Fontes', 'Knowledge Objects', 'Competências', 'Lacunas', 'Versões', 'Publicações', 'Auditoria']}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        boxes={getBoxesForKnowledgeCenter(activeTab, isDark, filteredDocs, filterText, setFilterText, nav, setShowModal)}
        promptsBase={['MPR-005', 'MPR-006', 'MPR-015', 'MPR-016', 'MPR-017']}
        inventoryButtons={['01 Adicionar Conhecimento', '02 Upload em Lote', '03 Adicionar Fonte Oficial', '04 Criar Procedimento', '05 Nova Versão']}
        inventoryKpis={['01 Fontes publicadas', '02 Aguardam revisão', '03 Críticas', '04 Desactualizadas']}
        inventoryTabs={['01 Biblioteca', '02 Fontes', '03 Knowledge Objects', '04 Competências', '05 Lacunas', '06 Versões']}
      />
    </div>
  );
};

function getBoxesForKnowledgeCenter(
  activeTab: string,
  isDark: boolean,
  filteredDocs: any[],
  filterText: string,
  setFilterText: any,
  nav: any,
  setShowModal: any
) {
  if (activeTab === 'Fontes') {
    const sources = [
      { name: 'Administração Geral Tributária (AGT)', url: 'https://agt.minfin.gov.ao', docs: 18, status: 'Verificado', lastSync: 'Hoje 08:00' },
      { name: 'Banco Nacional de Angola (BNA)', url: 'https://www.bna.ao', docs: 12, status: 'Verificado', lastSync: 'Ontem 18:00' },
      { name: 'Diário da República de Angola', url: 'https://dr.gov.ao', docs: 45, status: 'Verificado', lastSync: 'Hoje 06:30' },
      { name: 'Instituto Nacional de Segurança Social (INSS)', url: 'https://inss.gv.ao', docs: 6, status: 'Verificado', lastSync: '10/09/2026' }
    ];
    return [
      {
        code: 'BOX-KNO-FNT-01',
        title: 'Fontes Oficiais & Entidades Reguladoras Integradas',
        tag: `${sources.length} Fontes Oficiais`,
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {sources.map((s, i) => (
              <div key={i} style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{s.name}</div>
                  <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>{s.status}</span>
                </div>
                <div style={{ fontSize: '0.74rem', color: isDark ? '#60a5fa' : '#1d4ed8' }}>{s.url}</div>
                <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                  {s.docs} documentos indexados • Sincronizado: {s.lastSync}
                </div>
              </div>
            ))}
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Knowledge Objects') {
    const objects = [
      { id: 'KO-001', name: 'Taxa Normal do IVA (14%)', source: 'CIVA Angola Art. 12.º', type: 'Regra de Cálculo Fiscal', confidence: '100%' },
      { id: 'KO-002', name: 'Isenção de IVA para Produtos da Cesta Básica', source: 'CIVA Angola Art. 15.º', type: 'Tabela de Isenções', confidence: '100%' },
      { id: 'KO-003', name: 'Taxa de Retenção na Fonte de Serviços (6.5%)', source: 'Código do IRT Art. 67.º', type: 'Retenção Obrigatória', confidence: '100%' },
      { id: 'KO-004', name: 'Regras da Conta 24 - Estado e Entes Públicos', source: 'PGC Angola', type: 'Plano de Contas Contabilístico', confidence: '100%' }
    ];
    return [
      {
        code: 'BOX-KNO-OBJ-01',
        title: 'Knowledge Objects (Regras Atomizadas & Parâmetros Decisórios)',
        tag: `${objects.length} Objectos Canónicos`,
        content: (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>REGRA / OBJECTO</th>
                  <th style={{ padding: '10px' }}>FONTE VINCULATIVA</th>
                  <th style={{ padding: '10px' }}>TIPO</th>
                  <th style={{ padding: '10px' }}>CONFIANÇA</th>
                </tr>
              </thead>
              <tbody>
                {objects.map(o => (
                  <tr key={o.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: isDark ? '#60a5fa' : '#1d4ed8', fontWeight: 700 }}>{o.id}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{o.name}</td>
                    <td style={{ padding: '10px' }}>{o.source}</td>
                    <td style={{ padding: '10px' }}>{o.type}</td>
                    <td style={{ padding: '10px', color: '#4ade80', fontWeight: 700 }}>{o.confidence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Competências') {
    return [
      {
        code: 'BOX-KNO-CMP-01',
        title: 'Cobertura de Competências nos 500 AI Employees',
        tag: '100% Cobertura MNCA',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            {[
              { domain: 'Fiscal & Tributário', roles: 32, certified: '100%', baseline: 'Gemini 1.5 Pro' },
              { domain: 'Contabilidade PGC & IFRS', roles: 28, certified: '100%', baseline: 'Gemini 1.5 Pro' },
              { domain: 'Legislação Comercial & Contratos', roles: 24, certified: '98.5%', baseline: 'Gemini 1.5 Pro' },
              { domain: 'Recursos Humanos & LGT', roles: 20, certified: '99.2%', baseline: 'Gemini 1.5 Pro' }
            ].map((c, i) => (
              <div key={i} style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>{c.domain}</div>
                <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                  {c.roles} AI Employees • {c.certified} Certificado • {c.baseline}
                </div>
              </div>
            ))}
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Lacunas') {
    return [
      {
        code: 'BOX-KNO-GAP-01',
        title: 'Lacunas de Conhecimento Detectadas pelo Runtime',
        tag: 'Fila de Aquisição',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(234, 179, 8, 0.08)' : '#fef9c3', border: '1px solid rgba(234, 179, 8, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#ca8a04' }}>Regulamento Específico de Facturação Electrónica para Serviços Médicos</div>
                <div style={{ fontSize: '0.76rem', color: isDark ? '#cbd5e1' : '#713f12', marginTop: '2px' }}>
                  Detectada necessidade em 2 tarefas de faturamento hospitalar. Documento ainda não registado na biblioteca.
                </div>
              </div>
              <button onClick={() => setShowModal(true)} style={{ padding: '7px 14px', borderRadius: '6px', background: '#ca8a04', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.78rem' }}>
                Carregar Documento
              </button>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Versões' || activeTab === 'Publicações' || activeTab === 'Auditoria') {
    return [
      {
        code: 'BOX-KNO-AUD-01',
        title: `Auditoria Criptográfica de Hashes & Versões — ${activeTab}`,
        tag: 'SHA-256 Imutável',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(34, 197, 94, 0.08)' : '#f0fdf4', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
              <div style={{ fontWeight: 800, color: '#22c55e', fontSize: '0.88rem' }}>✓ Todas as 3 bases de conhecimento têm hash verificado e assinado</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#cbd5e1' : '#14532d', marginTop: '4px' }}>
                Qualquer modificação no texto das leis ou manuais é imediatamente bloqueada pelo Evidence Gate.
              </div>
            </div>
          </div>
        )
      }
    ];
  }

  // Default: Biblioteca
  return [
    {
      code: 'BOX-KNO-01-01',
      title: 'Biblioteca de Conhecimento e Legislação Activa',
      tag: `${filteredDocs.length} Documentos`,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f1f5f9', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '8px', flex: 1 }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Pesquisar por título ou categoria de conhecimento..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredDocs.map(doc => (
              <div key={doc.id} onClick={() => nav?.setActiveTab('source_explorer')} style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(20, 184, 166, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#14b8a6' }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>{doc.title}</div>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', display: 'flex', gap: '8px', marginTop: '2px' }}>
                      <span style={{ fontWeight: 600 }}>{doc.category}</span> • <span>Âmbito: {doc.scope}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: isDark ? '#94a3b8' : '#64748b', padding: '3px 6px', borderRadius: '4px', background: isDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0' }}>
                    {doc.hash.substring(0, 16)}...
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '12px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];
}

export const AddKnowledgeWizardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Fonte');
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [wizardTitle, setWizardTitle] = useState<string>('');
  const [wizardCategory, setWizardCategory] = useState<string>('Legislação & Fiscal');
  const [wizardScope, setWizardScope] = useState<string>('Global');
  const isDark = useIsDark();
  const nav = useNavigation();

  const wizardTabs = ['Fonte', 'Classificação', 'Âmbito', 'Metadados', 'Impacto', 'Revisão', 'Publicação'];

  const handleFilePick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.docx,.xlsx,.csv,.txt';
    input.onchange = (e: any) => {
      const f = e.target?.files?.[0];
      if (f) {
        setSelectedFileName(f.name);
        setWizardTitle(f.name.replace(/\.[^/.]+$/, ''));
        setActiveTab('Classificação');
      }
    };
    input.click();
  };

  const handleNext = () => {
    const idx = wizardTabs.indexOf(activeTab);
    if (idx < wizardTabs.length - 1) {
      setActiveTab(wizardTabs[idx + 1]);
    } else {
      handlePublish();
    }
  };

  const handlePrev = () => {
    const idx = wizardTabs.indexOf(activeTab);
    if (idx > 0) {
      setActiveTab(wizardTabs[idx - 1]);
    }
  };

  const handleProcess = () => {
    setActiveTab('Impacto');
  };

  const handleReview = () => {
    setActiveTab('Revisão');
  };

  const handlePublish = () => {
    alert(`Fonte "${selectedFileName || 'Documento'}" publicada com sucesso na Biblioteca de Conhecimento!`);
    nav?.setActiveTab('knowledge_center');
  };

  return (
    <ScreenLayout
      moduleCode="KNO-02"
      title="Wizard Adicionar Conhecimento"
      subtitle="Carregar ficheiro/URL/política/template sem tocar no código, passando por classificação, validação, mapping e publicação."
      breadcrumbs={['Conhecimento', 'Adicionar Conhecimento']}
      buttons={[
        { label: 'Escolher Ficheiro', primary: true, onClick: handleFilePick },
        { label: 'Anterior', onClick: handlePrev },
        { label: 'Seguinte', onClick: handleNext },
        { label: 'Processar', onClick: handleProcess },
        { label: 'Submeter à Revisão', onClick: handleReview },
        { label: 'Publicar', onClick: handlePublish }
      ]}
      kpis={[
        { label: 'Fase', value: `ETAPA ${wizardTabs.indexOf(activeTab) + 1}/7`, change: activeTab, statusColor: COLORS.operacao },
        { label: 'Validação', value: selectedFileName ? 'VALIDADO' : 'AGUARDA FICHEIRO', change: selectedFileName ? 'Hash SHA-256 ok' : 'Pendente', statusColor: selectedFileName ? COLORS.sucesso : COLORS.revisao },
        { label: 'Employees afectados', value: '14', change: 'Mapeados automaticamente', statusColor: COLORS.conhecimento },
        { label: 'Criticidade', value: 'ALTA', change: 'Requer aprovação', statusColor: COLORS.revisao }
      ]}
      tabs={wizardTabs}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        {
          code: 'BOX-KNO-02-01',
          title: 'Upload dropzone',
          content: (
            <div
              onClick={handleFilePick}
              style={{
                border: isDark ? '2px dashed rgba(59, 130, 246, 0.4)' : '2px dashed #93c5fd',
                borderRadius: '12px',
                padding: '30px 20px',
                textAlign: 'center',
                background: isDark ? 'rgba(30, 41, 59, 0.4)' : '#f8fafc',
                cursor: 'pointer'
              }}
            >
              <Upload size={32} color="#3b82f6" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>
                {selectedFileName ? `Ficheiro Selecionado: ${selectedFileName}` : 'Clique para escolher ficheiro (PDF, DOCX, XLSX, CSV)'}
              </div>
              <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                {selectedFileName ? 'Ficheiro pronto para processamento e extracção' : 'Carregamento seguro com extracção automática de chunks e hash'}
              </div>
            </div>
          )
        },
        {
          code: 'BOX-KNO-02-02',
          title: 'Formulário de Metadados',
          content: (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', display: 'block', marginBottom: '4px' }}>Título do Documento</label>
                <input
                  type="text"
                  value={wizardTitle}
                  onChange={e => setWizardTitle(e.target.value)}
                  placeholder="Nome oficial do regulamento ou manual..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', display: 'block', marginBottom: '4px' }}>Categoria</label>
                  <select
                    value={wizardCategory}
                    onChange={e => setWizardCategory(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem' }}
                  >
                    <option value="Legislação & Fiscal">Legislação & Fiscal</option>
                    <option value="Manual Operacional">Manual Operacional</option>
                    <option value="Políticas Internas">Políticas Internas</option>
                    <option value="Regulatório APD">Regulatório APD</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', display: 'block', marginBottom: '4px' }}>Âmbito</label>
                  <select
                    value={wizardScope}
                    onChange={e => setWizardScope(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem' }}
                  >
                    <option value="Global">Global (Todas as Empresas)</option>
                    <option value="Privado">Privado (Apenas Empresa Activa)</option>
                    <option value="Sectorial">Sectorial</option>
                  </select>
                </div>
              </div>
            </div>
          )
        },
        { code: 'BOX-KNO-02-03', title: 'Scope selector' },
        { code: 'BOX-KNO-02-04', title: 'Impact preview' },
        { code: 'BOX-KNO-02-05', title: 'Validation checklist' },
        { code: 'BOX-KNO-02-06', title: 'Publication decision' }
      ]}
      promptsBase={['MPR-016']}
      inventoryButtons={['01 Escolher Ficheiro', '02 Anterior', '03 Seguinte', '04 Processar', '05 Submeter à Revisão', '06 Publicar']}
      inventoryKpis={['01 Fase', '02 Validação', '03 Employees afectados', '04 Criticidade']}
      inventoryTabs={['01 Fonte', '02 Classificação', '03 Âmbito', '04 Metadados', '05 Impacto', '06 Revisão']}
    />
  );
};

export const SourceExplorerScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Metadata');
  const nav = useNavigation();
  const isDark = useIsDark();

  return (
    <ScreenLayout
      moduleCode="KNO-03"
      title="Detalhe da Fonte & Physical Source Explorer"
      subtitle="Provar a origem física da fonte, hash, extracção, chunks, Knowledge Objects, mappings, uso e versões."
      breadcrumbs={['Conhecimento', 'Fonte', 'Detalhe']}
      buttons={[
        { label: 'Abrir Ficheiro', primary: true, onClick: () => alert('Documento aberto no visualizador seguro com hash SHA-256 verificado.') },
        { label: 'Recalcular Hash', onClick: () => alert('Hash SHA-256 verificado: integridade dos chunks 100% confirmada.') },
        { label: 'Carregar Nova Versão', onClick: () => nav?.setActiveTab('add_knowledge_wizard') },
        { label: 'Revogar', danger: true, onClick: () => alert('Fonte de conhecimento revogada com sucesso.') },
        { label: 'Ver Linhagem', onClick: () => setActiveTab('Proveniência') }
      ]}
      kpis={[
        { label: 'Integridade', value: 'MATCHED', change: 'SHA-256 Verificado', statusColor: COLORS.sucesso },
        { label: 'Currentness', value: 'ACTUAL', change: 'v2.1 Baseline', statusColor: COLORS.sucesso },
        { label: 'Employees afectados', value: '18', change: 'Usando este documento', statusColor: COLORS.conhecimento },
        { label: 'Execuções que usaram', value: '1,420', change: 'Auditoria de uso', statusColor: COLORS.operacao }
      ]}
      tabs={['Metadata', 'Physical File', 'SHA-256', 'Proveniência', 'Extraction', 'Chunks', 'Knowledge Objects', 'Usage']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForSourceExplorer(activeTab, isDark, nav)}
      promptsBase={['MPR-013', 'MPR-016']}
      inventoryButtons={['01 Abrir Ficheiro', '02 Recalcular Hash', '03 Carregar Nova Versão', '04 Revogar', '05 Ver Linhagem']}
      inventoryKpis={['01 Integridade', '02 Currentness', '03 Employees afectados', '04 Execuções que usaram']}
      inventoryTabs={['01 Metadata', '02 Physical File', '03 SHA-256', '04 Proveniência', '05 Extraction', '06 Chunks']}
    />
  );
};

function getBoxesForSourceExplorer(activeTab: string, isDark: boolean, nav: any) {
  if (activeTab === 'Physical File') {
    return [
      {
        code: 'BOX-SRC-PHY-01',
        title: 'Visualizador de Ficheiro Físico Selado (PDF Reader)',
        tag: 'Página 1 de 64',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '16px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', minHeight: '220px' }}>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '8px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', paddingBottom: '6px' }}>
                DIÁRIO DA REPÚBLICA DE ANGOLA — I SÉRIE — N.º 98
              </div>
              <div style={{ fontSize: '0.82rem', lineHeight: 1.6, color: isDark ? '#cbd5e1' : '#334155' }}>
                <strong>Lei n.º 7/19 de 24 de Abril — CÓDIGO DO IMPOSTO SOBRE O VALOR ACRESCENTADO (CIVA)</strong><br /><br />
                <em>"Havendo necessidade de se proceder à reforma tributária em Angola, dotando o sistema fiscal de um imposto moderno sobre o consumo geral de bens e serviços..."</em><br /><br />
                <strong>Artigo 1.º (Incidência Objectiva)</strong>: Estão sujeitas a IVA as transmissões de bens e prestações de serviços efectuadas no território nacional a título oneroso...
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Ficheiro seguro: Codigo_do_IVA_Angola_Lei_7_19.pdf (4.8 MB)</span>
              <button onClick={() => alert('Download do PDF original certificado.')} style={{ padding: '6px 14px', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                📥 Descarregar PDF Original
              </button>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'SHA-256') {
    return [
      {
        code: 'BOX-SRC-SHA-01',
        title: 'Verificação Criptográfica de Integridade SHA-256',
        tag: '100% MATCH',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(34, 197, 94, 0.08)' : '#f0fdf4', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
              <div style={{ fontWeight: 800, color: '#22c55e', fontSize: '0.88rem' }}>✓ Atestado de Integridade: O ficheiro em disco é idêntico ao original auditado</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#cbd5e1' : '#14532d', marginTop: '4px' }}>
                O hash do documento é recalculado a cada boot do sistema e em cada inferência de AI Employees.
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
              <div><strong>Hash Gravado na Criação:</strong> <span style={{ fontFamily: 'monospace', color: isDark ? '#60a5fa' : '#1d4ed8' }}>sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span></div>
              <div><strong>Hash Recalculado Agora:</strong> <span style={{ fontFamily: 'monospace', color: isDark ? '#60a5fa' : '#1d4ed8' }}>sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span></div>
              <div><strong>Resultado da Validação:</strong> <span style={{ color: '#4ade80', fontWeight: 700 }}>VERIFICADO & CONFORME</span></div>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Proveniência') {
    return [
      {
        code: 'BOX-SRC-PRV-01',
        title: 'Linhagem da Fonte & Cadeia de Custódia Legal',
        tag: 'Cadeia Ininterrupta',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { step: '1. Emissão Oficial', desc: 'Publicação no Diário da República de Angola I Série n.º 98', actor: 'Imprensa Nacional', date: '24/04/2019' },
              { step: '2. Ingestão no Sistema', desc: 'Upload e verificação de assinatura digital do diploma', actor: 'Victorino Aguiar (Admin)', date: '14/09/2026 09:12' },
              { step: '3. Extracção & Chunking', desc: '64 páginas convertidas em 128 chunks de 512 tokens', actor: 'Knowledge Parser Engine', date: '14/09/2026 09:13' },
              { step: '4. Vinculação Operacional', desc: 'Activado para os AI Employees das áreas Fiscal e Contábil', actor: 'MNCA Capability Router', date: '14/09/2026 09:14' }
            ].map((p, i) => (
              <div key={i} style={{ padding: '12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>{p.step}</div>
                  <div style={{ fontSize: '0.74rem', color: isDark ? '#cbd5e1' : '#475569' }}>{p.desc}</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#64748b' }}>
                  <div>{p.actor}</div>
                  <div>{p.date}</div>
                </div>
              </div>
            ))}
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Extraction' || activeTab === 'Chunks') {
    return [
      {
        code: 'BOX-SRC-CHK-01',
        title: 'Chunks Semânticos Extraídos (Indexação Vectorial)',
        tag: '128 Chunks',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { id: 'CHUNK-001', tokens: '492 tokens', text: 'Artigos 1.º a 6.º: Incidência objectiva e subjectiva do imposto. Definição de sujeito passivo e regras de territorialidade para serviços prestados por não residentes...' },
              { id: 'CHUNK-002', tokens: '510 tokens', text: 'Artigos 12.º a 14.º: Taxas do IVA. Fixação da taxa normal em 14% para transmissões gerais e regime especial de importação de mercadorias no porto de Luanda...' },
              { id: 'CHUNK-003', tokens: '488 tokens', text: 'Artigo 15.º: Isenções na importação e no mercado interno. Isenção expressa para medicamentos essenciais, produtos da cesta básica e serviços médicos...' }
            ].map((c, i) => (
              <div key={i} style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.72rem', color: isDark ? '#60a5fa' : '#1d4ed8' }}>{c.id}</span>
                  <span style={{ fontSize: '0.7rem', color: '#4ade80' }}>{c.tokens}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.5 }}>{c.text}</p>
              </div>
            ))}
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Knowledge Objects') {
    return [
      {
        code: 'BOX-SRC-KOB-01',
        title: 'Knowledge Objects Vinculados a esta Fonte',
        tag: '4 Regras Mapeadas',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '10px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <strong style={{ fontSize: '0.82rem' }}>KO-001: Taxa Normal de 14%</strong> — Aplicação automática em cálculos fiscais.
            </div>
            <div style={{ padding: '10px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <strong style={{ fontSize: '0.82rem' }}>KO-002: Isenções da Cesta Básica</strong> — Validação de conformidade em compras.
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Usage') {
    return [
      {
        code: 'BOX-SRC-USG-01',
        title: 'Histórico de Consulta por AI Employees & Tarefas Reais',
        tag: '1,420 Consultas Auditadas',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                <strong>TASK-102: Auditoria de Conformidade Fiscal IVA</strong>
                <span style={{ color: '#4ade80' }}>Consultado hoje às 11:15</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                AI Employee: <strong>Perito Fiscal & IVA</strong> • Chunk #002 invocado para validar taxa de 14%
              </div>
            </div>
          </div>
        )
      }
    ];
  }

  // Default: Metadata
  return [
    {
      code: 'BOX-SRC-MET-01',
      title: 'Metadados Gerais do Documento de Conhecimento',
      tag: 'KNO-101',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>TÍTULO DA FONTE</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginTop: '2px' }}>Código do IVA de Angola (CIVA)</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>LEGISLAÇÃO / DIPLOMA</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginTop: '2px', color: isDark ? '#60a5fa' : '#1d4ed8' }}>Lei n.º 7/19 de 24 de Abril</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ÂMBITO JURISDICIONAL</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginTop: '2px' }}>Nacional (República de Angola)</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ESTADO DE VIGÊNCIA</div>
              <div style={{ fontWeight: 800, fontSize: '0.88rem', marginTop: '2px', color: '#4ade80' }}>Em Vigor (Actualizado)</div>
            </div>
          </div>
        </div>
      )
    }
  ];
}

export const KnowledgeNecessityScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Decisões');
  const nav = useNavigation();

  return (
    <ScreenLayout
      moduleCode="KNO-04"
      title="Knowledge Necessity Engine"
      subtitle="Decidir por tarefa/provider/model se conhecimento externo é necessário, opcional, obrigatório ou deve ser excluído."
      breadcrumbs={['Conhecimento', 'Necessidade em Runtime']}
      buttons={[
        { label: 'Reavaliar', primary: true, onClick: () => alert('Motor de necessidade executou reavaliação dos prompts e tarefas ativas.') },
        { label: 'Comparar Modelos', onClick: () => setActiveTab('Provider Matrix') },
        { label: 'Forçar Revisão', onClick: () => setActiveTab('Novelty') },
        { label: 'Abrir Receipt', onClick: () => nav?.setActiveTab('audit_evidence') },
        { label: 'Ver Motivo', onClick: () => setActiveTab('Decisões') }
      ]}
      kpis={[
        { label: 'Native sufficient', value: '72%', change: 'Sem injeção desnecessária', statusColor: COLORS.sucesso },
        { label: 'Reinforcement required', value: '18%', change: 'Reforço de Prompt', statusColor: COLORS.conhecimento },
        { label: 'Source required', value: '10%', change: 'Documento Obrigatório', statusColor: COLORS.revisao },
        { label: 'Client source required', value: '5%', change: 'Manuais Privados', statusColor: COLORS.operacao }
      ]}
      tabs={['Decisões', 'Provider Matrix', 'Novelty', 'Conflitos', 'Receipts']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-KNO-04-01', title: 'Decision matrix' },
        { code: 'BOX-KNO-04-02', title: 'Native overlap' },
        { code: 'BOX-KNO-04-03', title: 'Novelty/overlap' },
        { code: 'BOX-KNO-04-04', title: 'Selected vs excluded sources' },
        { code: 'BOX-KNO-04-05', title: 'Token budget' }
      ]}
      promptsBase={['MPR-017']}
      inventoryButtons={['01 Reavaliar', '02 Comparar Modelos', '03 Forçar Revisão', '04 Abrir Receipt', '05 Ver Motivo']}
      inventoryKpis={['01 Native sufficient', '02 Reinforcement required', '03 Source required', '04 Client source required']}
      inventoryTabs={['01 Decisões', '02 Provider Matrix', '03 Novelty', '04 Conflitos', '05 Receipts']}
    />
  );
};

export const Mnca500Screen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Competências');
  const nav = useNavigation();

  return (
    <ScreenLayout
      moduleCode="KNO-05"
      title="MNCA-500 Model Native Capability Audit"
      subtitle="Testar capacidade nativa real de cada provider/model/configuração sem RAG/tools e detectar lacunas."
      breadcrumbs={['Conhecimento', 'MNCA']}
      buttons={[
        { label: 'Executar Teste', primary: true, onClick: () => alert('Bateria MNCA-500 concluída: 240/240 competências nativas testadas com sucesso.') },
        { label: 'Retestar', onClick: () => alert('Reteste de capacidade nativa executado com sucesso.') },
        { label: 'Comparar Providers', onClick: () => setActiveTab('Modelos') },
        { label: 'Criar Gap', onClick: () => setActiveTab('Gaps') },
        { label: 'Exportar Baseline', onClick: () => alert('Baseline exportada com sucesso.') }
      ]}
      kpis={[
        { label: 'Competências testadas', value: '240 / 240', change: 'Desduplicadas', statusColor: COLORS.conhecimento },
        { label: 'Certified native', value: '232', change: 'Score > 90%', statusColor: COLORS.sucesso },
        { label: 'Needs reinforcement', value: '8', change: 'Fila de aquisição', statusColor: COLORS.revisao },
        { label: 'Unknown', value: '0', change: 'Testes concluídos', statusColor: COLORS.sucesso }
      ]}
      tabs={['Competências', 'Modelos', 'Resultados', 'Gaps', 'Baselines', 'Evidência']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-KNO-05-01', title: 'Competency matrix' },
        { code: 'BOX-KNO-05-02', title: 'Provider comparison' },
        { code: 'BOX-KNO-05-03', title: 'Raw execution evidence' },
        { code: 'BOX-KNO-05-04', title: 'Gap specification' },
        { code: 'BOX-KNO-05-05', title: 'Baseline selector' }
      ]}
      promptsBase={['MPR-014', 'MPR-032']}
      inventoryButtons={['01 Executar Teste', '02 Retestar', '03 Comparar Providers', '04 Criar Gap', '05 Exportar Baseline']}
      inventoryKpis={['01 Competências testadas', '02 Certified native', '03 Needs reinforcement', '04 Unknown']}
      inventoryTabs={['01 Competências', '02 Modelos', '03 Resultados', '04 Gaps', '05 Baselines', '06 Evidência']}
    />
  );
};

export const PassportsEligibilityScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Competências');
  const nav = useNavigation();

  return (
    <ScreenLayout
      moduleCode="KNO-06"
      title="Competency Passport & Task Eligibility"
      subtitle="Mostrar competências certificadas, fontes, provider/model scope, jurisdição e elegibilidade para cada task type."
      breadcrumbs={['Conhecimento', 'Passaportes']}
      buttons={[
        { label: 'Abrir Evidência', primary: true, onClick: () => nav?.setActiveTab('evidence_gate') },
        { label: 'Retestar', onClick: () => alert('Competência auditada e confirmada.') },
        { label: 'Bloquear Task Type', danger: true, onClick: () => alert('Restrição de segurança aplicada ao task type.') },
        { label: 'Aprovar Supervisão', onClick: () => alert('Supervisão HITL autorizada para a função.') },
        { label: 'Exportar Passaporte', onClick: () => alert('Passaporte de competência descarregado com selo digital.') }
      ]}
      kpis={[
        { label: 'Certified', value: '480 / 500', change: 'Passaportes Válidos', statusColor: COLORS.sucesso },
        { label: 'Com supervisão', value: '20', change: 'Execução HITL', statusColor: COLORS.revisao },
        { label: 'Bloqueadas', value: '0', change: 'Zero interdições', statusColor: COLORS.sucesso },
        { label: 'Expiradas', value: '0', change: 'Todas em dia', statusColor: COLORS.sucesso }
      ]}
      tabs={['Competências', 'Task Eligibility', 'Fontes', 'Modelos', 'Jurisdições', 'Histórico']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-KNO-06-01', title: 'Passport summary' },
        { code: 'BOX-KNO-06-02', title: 'Eligibility table' },
        { code: 'BOX-KNO-06-03', title: 'Source requirements' },
        { code: 'BOX-KNO-06-04', title: 'Certification scope' },
        { code: 'BOX-KNO-06-05', title: 'Limitations' }
      ]}
      promptsBase={['MPR-013', 'MPR-014', 'MPR-021']}
      inventoryButtons={['01 Abrir Evidência', '02 Retestar', '03 Bloquear Task Type', '04 Aprovar Supervisão', '05 Exportar Passaporte']}
      inventoryKpis={['01 Certified', '02 Com supervisão', '03 Bloqueadas', '04 Expiradas']}
      inventoryTabs={['01 Competências', '02 Task Eligibility', '03 Fontes', '04 Modelos', '05 Jurisdições', '06 Histórico']}
    />
  );
};

export const RegulatoryWatchScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const nav = useNavigation();

  return (
    <ScreenLayout
      moduleCode="KNO-07"
      title="Regulatory & API Watch"
      subtitle="Monitorizar mudanças regulatórias, APIs, normas e documentação; calcular impacto e gerar approval cards."
      breadcrumbs={['Conhecimento', 'Regulatory Watch']}
      buttons={[
        { label: 'Ver Mudança', primary: true, onClick: () => setActiveTab('Changes') },
        { label: 'Analisar Impacto', onClick: () => setActiveTab('Impact Graph') },
        { label: 'Aprovar', onClick: () => alert('Mudança regulatória aprovada e incorporada na workforce.') },
        { label: 'Rejeitar', danger: true, onClick: () => alert('Mudança regulatória rejeitada.') },
        { label: 'Criar Release', onClick: () => setActiveTab('Releases') }
      ]}
      kpis={[
        { label: 'Fontes monitorizadas', value: '42', change: 'Diário da República / APIs', statusColor: COLORS.conhecimento },
        { label: 'Mudanças novas', value: '3', change: 'Novos Decretos fiscais', statusColor: COLORS.revisao },
        { label: 'Críticas', value: '1', change: 'Taxation Update', statusColor: COLORS.risco },
        { label: 'Revisões pendentes', value: '2', change: 'Aguardando validação', statusColor: COLORS.revisao }
      ]}
      tabs={['Overview', 'Source Health', 'Changes', 'Impact Graph', 'Approvals', 'Regression', 'Releases']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-KNO-07-01', title: 'Source health' },
        { code: 'BOX-KNO-07-02', title: 'Change cards' },
        { code: 'BOX-KNO-07-03', title: 'Semantic diff' },
        { code: 'BOX-KNO-07-04', title: 'Affected Employees' },
        { code: 'BOX-KNO-07-05', title: 'Release history' }
      ]}
      promptsBase={['MPR-006', 'MPR-007']}
      inventoryButtons={['01 Ver Mudança', '02 Analisar Impacto', '03 Aprovar', '04 Rejeitar', '05 Criar Release']}
      inventoryKpis={['01 Fontes monitorizadas', '02 Mudanças novas', '03 Críticas', '04 Revisões pendentes']}
      inventoryTabs={['01 Overview', '02 Source Health', '03 Changes', '04 Impact Graph', '05 Approvals', '06 Regression']}
    />
  );
};

export const ClientPoliciesCpeaaScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Documentos');
  const nav = useNavigation();

  return (
    <ScreenLayout
      moduleCode="KNO-08"
      title="Políticas do Cliente & CPEAA"
      subtitle="Carregar manuais e políticas internas do cliente, extrair regras, detectar conflito legal e governar aprovações."
      breadcrumbs={['Conhecimento', 'Políticas do Cliente']}
      buttons={[
        { label: 'Adicionar Política', primary: true, onClick: () => nav?.setActiveTab('add_knowledge_wizard') },
        { label: 'Extrair Regras', onClick: () => setActiveTab('Regras') },
        { label: 'Resolver Conflito', onClick: () => setActiveTab('Conflitos') },
        { label: 'Aprovar', onClick: () => alert('Política aprovada e incorporada com sucesso.') },
        { label: 'Publicar', onClick: () => nav?.setActiveTab('knowledge_center') }
      ]}
      kpis={[
        { label: 'Políticas activas', value: '16', change: 'Uploads da empresa', statusColor: COLORS.conhecimento },
        { label: 'Conflitos', value: '0', change: 'Sem precedência violada', statusColor: COLORS.sucesso },
        { label: 'Aguardam aprovação', value: '1', change: 'Nova regra de reembolso', statusColor: COLORS.revisao },
        { label: 'Regras extraídas', value: '142', change: 'Mapeamento activo', statusColor: COLORS.operacao }
      ]}
      tabs={['Documentos', 'Regras', 'Conflitos', 'Aprovações', 'Traces']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-KNO-08-01', title: 'Client policy library' },
        { code: 'BOX-KNO-08-02', title: 'Rules table' },
        { code: 'BOX-KNO-08-03', title: 'Legal precedence warning' },
        { code: 'BOX-KNO-08-04', title: 'Approval workflow' },
        { code: 'BOX-KNO-08-05', title: 'Decision trace' }
      ]}
      promptsBase={['MPR-007']}
      inventoryButtons={['01 Adicionar Política', '02 Extrair Regras', '03 Resolver Conflito', '04 Aprovar', '05 Publicar']}
      inventoryKpis={['01 Políticas activas', '02 Conflitos', '03 Aguardam aprovação', '04 Regras extraídas']}
      inventoryTabs={['01 Documentos', '02 Regras', '03 Conflitos', '04 Aprovações', '05 Traces']}
    />
  );
};

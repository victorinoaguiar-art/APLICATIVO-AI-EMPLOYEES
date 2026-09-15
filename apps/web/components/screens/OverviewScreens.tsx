import React, { useState } from 'react';
import { ScreenLayout, COLORS, useIsDark } from '../ui/DesignSystem';
import { useNavigation } from '../NavigationContext';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import { Search } from 'lucide-react';

const CANONICAL_44_AREAS = [
  { code: 'APP-01', name: 'Dashboard', cat: 'Início' },
  { code: 'APP-02', name: 'Shell Global', cat: 'Início' },
  { code: 'ORG-01', name: 'Empresas', cat: 'Empresas' },
  { code: 'ORG-02', name: 'Detalhe da Empresa', cat: 'Empresas' },
  { code: 'ORG-03', name: 'Configuração Inicial', cat: 'Empresas' },
  { code: 'WF-01', name: 'Meus AI Employees', cat: 'AI Employees' },
  { code: 'WF-02', name: 'Catálogo de AI Employees', cat: 'AI Employees' },
  { code: 'WF-03', name: 'Detalhe do AI Employee', cat: 'AI Employees' },
  { code: 'WF-04', name: 'Equipas & Perfis', cat: 'AI Employees' },
  { code: 'TASK-01', name: 'Conversas & Central de Trabalho', cat: 'Trabalho' },
  { code: 'TASK-02', name: 'Tarefas', cat: 'Trabalho' },
  { code: 'TASK-03', name: 'Execução & Router Engine', cat: 'Trabalho' },
  { code: 'TASK-04', name: 'Verificação de Execução', cat: 'Trabalho' },
  { code: 'TASK-05', name: 'Comandos Remotos', cat: 'Trabalho' },
  { code: 'TASK-06', name: 'Resultados & Aprovações', cat: 'Trabalho' },
  { code: 'KNO-01', name: 'Biblioteca de Conhecimento', cat: 'Conhecimento' },
  { code: 'KNO-02', name: 'Adicionar Fonte de Conhecimento', cat: 'Conhecimento' },
  { code: 'KNO-03', name: 'Detalhe da Fonte de Conhecimento', cat: 'Conhecimento' },
  { code: 'KNO-04', name: 'Análise de Necessidade de Fonte', cat: 'Conhecimento' },
  { code: 'KNO-05', name: 'Conformidade de Conhecimento Autorizado', cat: 'Conhecimento' },
  { code: 'KNO-06', name: 'Passaportes & Elegibilidade', cat: 'Conhecimento' },
  { code: 'KNO-07', name: 'Monitorização Regulatória', cat: 'Conhecimento' },
  { code: 'KNO-08', name: 'Políticas da Empresa', cat: 'Conhecimento' },
  { code: 'QUAL-01', name: 'Formação & Competências', cat: 'Qualidade' },
  { code: 'QUAL-02', name: 'Fiabilidade & Medição de Erro', cat: 'Qualidade' },
  { code: 'QUAL-03', name: 'Revisão e Aceitação do Cliente', cat: 'Qualidade' },
  { code: 'QUAL-04', name: 'Certificação Profissional', cat: 'Qualidade' },
  { code: 'QUAL-05', name: 'Laboratório de Testes', cat: 'Qualidade' },
  { code: 'QUAL-06', name: 'Piloto Enterprise', cat: 'Qualidade' },
  { code: 'DOC-01', name: 'Estúdio de Documentos', cat: 'Documentos' },
  { code: 'DOC-02', name: 'Branding & Papel Timbrado', cat: 'Documentos' },
  { code: 'COM-01', name: 'Comunicações Omnicanal', cat: 'Comunicações' },
  { code: 'COM-02', name: 'WhatsApp Business', cat: 'Comunicações' },
  { code: 'COM-03', name: 'Inteligência de Email', cat: 'Comunicações' },
  { code: 'COM-04', name: 'Redes Sociais', cat: 'Comunicações' },
  { code: 'COM-05', name: 'Briefing Executivo Diário', cat: 'Comunicações' },
  { code: 'COMMERCE-01', name: 'Plano & Subscrições', cat: 'Comercial' },
  { code: 'COMMERCE-02', name: 'Facturação & Pagamentos', cat: 'Comercial' },
  { code: 'COMMERCE-03', name: 'Expansão & Discovery', cat: 'Comercial' },
  { code: 'INT-01', name: 'Integrações & Conectores', cat: 'Plataforma' },
  { code: 'INT-02', name: 'Segurança & Permissões', cat: 'Plataforma' },
  { code: 'INT-03', name: 'Segurança & Auditoria', cat: 'Plataforma' },
  { code: 'INT-04', name: 'Configurações', cat: 'Plataforma' },
  { code: 'INT-05', name: 'Catálogo de Prompts Mestres', cat: 'Plataforma' }
];

export const ExecutiveDashboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Resumo');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const isDark = useIsDark();
  const nav = useNavigation();

  const filteredRoles = CANONICAL_500_ROLES.filter(r =>
    !employeeSearch ||
    r.display_name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    r.department.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    r.role_key.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const getBoxesForActiveTab = () => {
    switch (activeTab) {
      case 'Equipa Digital':
        return [
          {
            code: 'BOX-APP-01-WF',
            title: 'Equipa Digital — Catálogo Integral dos 500 AI Employees',
            tag: `${filteredRoles.length} Funções Disponíveis`,
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f1f5f9', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px', flex: 1 }}>
                    <Search size={15} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Pesquisar entre os 500 AI Employees por cargo, departamento ou sigla..."
                      value={employeeSearch}
                      onChange={e => setEmployeeSearch(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.82rem', width: '100%' }}
                    />
                  </div>
                  <button
                    onClick={() => nav?.setActiveTab('marketplace')}
                    style={{ padding: '8px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 700, fontSize: '0.8rem', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Ver Marketplace Completo
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px', maxHeight: '450px', overflowY: 'auto', paddingRight: '4px' }}>
                  {filteredRoles.slice(0, 48).map((role, idx) => (
                    <div
                      key={idx}
                      onClick={() => nav?.setActiveTab('marketplace')}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title="Clique para abrir no Catálogo"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: isDark ? '#60a5fa' : '#1d4ed8', fontFamily: 'monospace' }}>
                          {role.role_key}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>{role.department}</span>
                      </div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>{role.display_name}</div>
                      <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{role.mission}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        ];

      case 'Operações':
        return [
          {
            code: 'BOX-APP-01-OPS-01',
            title: 'Mapa Operacional das 44 Áreas de Negócio (Navegação Direta)',
            tag: '44 Áreas 100% Operacionais',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569' }}>
                  Clique em qualquer área para abrir diretamente o respectivo módulo de trabalho:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {CANONICAL_44_AREAS.map((area, idx) => (
                    <div
                      key={idx}
                      onClick={() => nav?.navigateToArea(area.code)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: isDark ? '#60a5fa' : '#1d4ed8', fontFamily: 'monospace' }}>
                          {area.code}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4ade80' }}>● ONLINE</span>
                      </div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>{area.name}</div>
                      <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Módulo: {area.cat}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            code: 'BOX-APP-01-OPS-02',
            title: 'Throughput e Fila Global de Trabalho',
            tag: 'SLA 98% Cumprido',
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#eff6ff' }}>
                  <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>Tarefas Concluídas Hoje</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4ade80' }}>1,890</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#eff6ff' }}>
                  <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>Em Processamento</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>18</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#eff6ff' }}>
                  <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>Tempo Médio Resolução</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a855f7' }}>42 seg</div>
                </div>
              </div>
            )
          }
        ];

      case 'Custos':
        return [
          {
            code: 'BOX-APP-01-COSTS',
            title: 'Unit Economics, Consumo de Modelos & Economia Gerada',
            tag: '97% Poupança Financeira',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>Custo Total AI no Mês</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>$142.50</div>
                    <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '4px' }}>1.8M tokens consumidos</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>Custo Humano Equivalente</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f87171', marginTop: '4px' }}>$4,800.00</div>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px' }}>Base 6 funções dedicadas</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>Economia Líquida Gerada</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4ade80', marginTop: '4px' }}>$4,657.50</div>
                    <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '4px' }}>Poupança de 97.0%</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px' }}>Consumo por Provedor LLM</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Gemini 1.5 Pro (Tarefas Complexas)</span>
                        <strong style={{ color: '#60a5fa' }}>$94.20</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Gemini 1.5 Flash (Classificação & Chat)</span>
                        <strong style={{ color: '#60a5fa' }}>$38.40</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Modelos Locais & MNCA</span>
                        <strong style={{ color: '#4ade80' }}>$9.90</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px' }}>Projeção de Faturação Mensal</div>
                    <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.6 }}>
                      O consumo corrente prevê uma fatura de <strong>$168.00</strong> no final do ciclo, correspondendo a menos de <strong>3.5%</strong> do orçamento operacional tradicional.
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        ];

      case 'Riscos':
        return [
          {
            code: 'BOX-APP-01-RISK-01',
            title: 'Matriz de Riscos, Governação & Controlo de Segurança',
            tag: 'Risco Global: BAIXO',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.12)', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#86efac' : '#15803d', fontWeight: 700 }}>Risco Fiscal & Contábil</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#22c55e', marginTop: '4px' }}>0.2% UMER</div>
                    <div style={{ fontSize: '0.68rem', color: isDark ? '#cbd5e1' : '#475569', marginTop: '2px' }}>Zero autuações detectadas</div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#93c5fd' : '#1d4ed8', fontWeight: 700 }}>Risco de Autonomia</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>Nível 3 (Certificado)</div>
                    <div style={{ fontSize: '0.68rem', color: isDark ? '#cbd5e1' : '#475569', marginTop: '2px' }}>HITL activado para acções críticas</div>
                  </div>

                  <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#fde68a' : '#b45309', fontWeight: 700 }}>Aprovações Pendentes</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>2 Itens na Fila</div>
                    <div style={{ fontSize: '0.68rem', color: isDark ? '#cbd5e1' : '#475569', marginTop: '2px' }}>Submissões fiscais de valor elevado</div>
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>Protecção Criptográfica SHA-256 Imutável</div>
                    <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b' }}>68,500 recibos de evidência selados com carimbo de integridade temporal.</div>
                  </div>
                  <button
                    onClick={() => nav?.navigateToArea('INT-03')}
                    style={{ padding: '6px 14px', borderRadius: '6px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff', color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.3)', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Ver Auditoria
                  </button>
                </div>
              </div>
            )
          }
        ];

      case 'Resumo':
      default:
        return [
          {
            code: 'BOX-APP-01-01',
            title: 'Mapa de Cobertura das Áreas Operacionais',
            tag: '44 Áreas de Negócio',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569' }}>
                  Todas as 44 áreas operacionais da plataforma estão activas e integradas:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', maxHeight: '340px', overflowY: 'auto', paddingRight: '4px' }}>
                  {CANONICAL_44_AREAS.map((area, idx) => (
                    <div
                      key={idx}
                      onClick={() => nav?.navigateToArea(area.code)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title={`Abrir área ${area.name}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: isDark ? '#60a5fa' : '#1d4ed8' }}>
                          {area.cat}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4ade80' }}>ACTIVO</span>
                      </div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>{area.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          },
          {
            code: 'BOX-APP-01-02',
            title: 'Resumo da Equipa Digital (500 AI Employees)',
            tag: '500 Funções Disponíveis',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569' }}>
                  Amostra das 500 funções preparadas para atribuição imediata:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                  {CANONICAL_500_ROLES.slice(0, 6).map((role, idx) => (
                    <div
                      key={idx}
                      onClick={() => nav?.setActiveTab('marketplace')}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                      title="Ver no Catálogo"
                    >
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: isDark ? '#60a5fa' : '#1d4ed8' }}>{role.department}</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>{role.display_name}</div>
                      <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{role.mission}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        ];
    }
  };

  return (
    <ScreenLayout
      moduleCode="APP-01"
      title="Dashboard"
      subtitle="Visão executiva consolidada da força de trabalho digital, tarefas, aprovações, custos e alertas."
      breadcrumbs={['Início', 'Dashboard']}
      buttons={[
        { label: 'Novo Pedido', primary: true, onClick: () => nav?.openModal('command') },
        { label: 'Contratar AI Employee', onClick: () => nav?.setActiveTab('marketplace') },
        { label: 'Adicionar Conhecimento', onClick: () => nav?.setActiveTab('add_knowledge_wizard') },
        { label: 'Ver Aprovações', onClick: () => nav?.setActiveTab('approvals_center') },
        { label: 'Gerar Briefing', onClick: () => nav?.setActiveTab('daily_briefing') }
      ]}
      kpis={[
        { label: 'AI Employees activos', value: '500 / 500', change: 'Catálogo Integral', statusColor: COLORS.sucesso },
        { label: 'Áreas de Negócio', value: '48 / 48', change: '100% Operacional', statusColor: COLORS.sucesso },
        { label: 'Tarefas em fila', value: '142', change: '98% taxa sucesso', statusColor: COLORS.operacao },
        { label: 'Alertas críticos', value: '0', change: 'Zero bloqueios', statusColor: COLORS.sucesso }
      ]}
      tabs={['Resumo', 'Equipa Digital', 'Operações', 'Custos', 'Riscos']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForActiveTab()}
      promptsBase={['MPR-001', 'MPR-002', 'MPR-031', 'MPR-033']}
      inventoryButtons={['01 Novo Pedido', '02 Contratar AI Employee', '03 Adicionar Conhecimento', '04 Ver Aprovações', '05 Gerar Briefing']}
      inventoryKpis={['01 Employees activos', '02 Tarefas hoje', '03 Aguardam aprovação', '04 Alertas críticos']}
      inventoryTabs={['01 Resumo', '02 Workforce', '03 Operações', '04 Custos', '05 Riscos']}
    />
  );
};

export const GlobalShellScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Navegação');
  const nav = useNavigation();
  const isDark = useIsDark();

  const getBoxesForShell = () => {
    switch (activeTab) {
      case 'Atalhos':
        return [
          {
            code: 'BOX-APP-02-ATALHOS',
            title: 'Atalhos de Teclado & Comandos Rápidos do Sistema',
            tag: 'Produtividade',
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {[
                  { keys: 'Ctrl + K', label: 'Pesquisa Global & Comandos' },
                  { keys: 'Ctrl + N', label: 'Novo Pedido / Tarefa' },
                  { keys: 'Ctrl + B', label: 'Briefing Executivo do Dia' },
                  { keys: 'Ctrl + E', label: 'Catálogo de AI Employees' },
                  { keys: 'Ctrl + A', label: 'Centro de Aprovações HITL' },
                  { keys: 'Esc', label: 'Fechar Modal ou Painel' }
                ].map((s, idx) => (
                  <div key={idx} style={{ padding: '12px 14px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: isDark ? '#1e293b' : '#e2e8f0', fontFamily: 'monospace', fontWeight: 700 }}>{s.keys}</span>
                  </div>
                ))}
              </div>
            )
          }
        ];

      case 'Favoritos':
        return [
          {
            code: 'BOX-APP-02-FAV',
            title: 'Áreas Favoritas & Acesso Rápido',
            tag: 'Personalizado',
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                {[
                  { code: 'TASK-01', name: 'Conversas & Central de Trabalho', cat: 'Trabalho' },
                  { code: 'WF-01', name: 'Centro de Comando da Workforce', cat: 'AI Employees' },
                  { code: 'COM-02', name: 'WhatsApp Business Operations', cat: 'Comunicações' },
                  { code: 'KNO-02', name: 'Wizard Adicionar Conhecimento', cat: 'Conhecimento' }
                ].map((f, idx) => (
                  <div key={idx} onClick={() => nav?.navigateToArea(f.code)} style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', cursor: 'pointer' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#2563eb' }}>{f.cat}</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>{f.name}</div>
                  </div>
                ))}
              </div>
            )
          }
        ];

      case 'Navegação':
      default:
        return [
          {
            code: 'BOX-APP-02-NAV',
            title: 'Estrutura Completa de Navegação da Plataforma',
            tag: '44 Módulos',
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                {CANONICAL_44_AREAS.map((a, idx) => (
                  <div key={idx} onClick={() => nav?.navigateToArea(a.code)} style={{ padding: '10px 12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', cursor: 'pointer' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#60a5fa' }}>{a.code} — {a.cat}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{a.name}</div>
                  </div>
                ))}
              </div>
            )
          }
        ];
    }
  };

  return (
    <ScreenLayout
      moduleCode="APP-02"
      title="Estrutura Global da Aplicação"
      subtitle="Estrutura comum: navegação lateral, empresa seleccionada, pesquisa, atalhos rápidos, notificações e perfil."
      breadcrumbs={['Início', 'Estrutura Global']}
      buttons={[
        { label: 'Novo Pedido', primary: true, onClick: () => nav?.openModal('command') },
        { label: 'Pesquisar', onClick: () => (document.querySelector('header input') as HTMLInputElement)?.focus() },
        { label: 'Trocar Empresa', onClick: () => nav?.openModal('tenant') },
        { label: 'Notificações', onClick: () => nav?.openModal('alerts') },
        { label: 'Ajuda', onClick: () => nav?.openModal('help') }
      ]}
      kpis={[
        { label: 'Empresa actual', value: 'MARVINE, LDA', change: 'Empresa Principal', statusColor: COLORS.operacao },
        { label: 'Ambiente', value: 'PRIVADO', change: 'Activo', statusColor: COLORS.sucesso },
        { label: 'Modo de Operação', value: 'PRODUÇÃO', change: 'Execução Directa', statusColor: COLORS.sucesso },
        { label: 'Estado da plataforma', value: 'SAUDÁVEL', change: '99.9% Uptime', statusColor: COLORS.sucesso }
      ]}
      tabs={['Navegação', 'Atalhos', 'Favoritos']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForShell()}
      promptsBase={['MPR-001', 'MPR-009', 'MPR-010']}
      inventoryButtons={['01 Novo Pedido', '02 Pesquisar', '03 Trocar Empresa', '04 Notificações', '05 Ajuda']}
      inventoryKpis={['01 Empresa actual', '02 Ambiente', '03 Modo de Operação', '04 Estado da plataforma']}
      inventoryTabs={['01 Navegação', '02 Atalhos', '03 Favoritos']}
    />
  );
};

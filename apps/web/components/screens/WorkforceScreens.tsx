import React, { useState } from 'react';
import { ScreenLayout, COLORS, useIsDark } from '../ui/DesignSystem';
import { useNavigation } from '../NavigationContext';
import {
  Search, UserPlus, CheckCircle2, X, ShieldCheck,
  AlertTriangle, ArrowRight, Pause, Play, Building
} from 'lucide-react';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';

export const WorkforceCommandCenterScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Visão Geral');
  const [_selectedDeptFilter, _setSelectedDeptFilter] = useState('Todos');
  const [pausedEmployees, setPausedEmployees] = useState<string[]>([]);
  const nav = useNavigation();
  const isDark = useIsDark();

  // Active workforce live list
  const activeEmployees = [
    {
      id: 'EMP-001',
      name: 'Contabilista Sénior PGC',
      department: 'Contabilidade & Finanças',
      task: 'Elaboração do Balancete Contabilístico T3',
      progress: 60,
      sla: '12m restantes',
      status: 'Em execução',
      tokens: '4,200',
      reliability: '99.8%'
    },
    {
      id: 'EMP-002',
      name: 'Perito Fiscal & IVA',
      department: 'Fiscalidade & Impostos',
      task: 'Auditoria de Conformidade Fiscal Modelo 1',
      progress: 90,
      sla: 'Aguardam aprovação',
      status: 'Aguardam aprovação',
      tokens: '6,100',
      reliability: '99.9%'
    },
    {
      id: 'EMP-003',
      name: 'Advogado Comercial & Contratos',
      department: 'Jurídico & Compliance',
      task: 'Minuta de Contrato de Prestação de Serviços',
      progress: 40,
      sla: '35m restantes',
      status: 'Em execução',
      tokens: '3,800',
      reliability: '99.5%'
    },
    {
      id: 'EMP-004',
      name: 'SDR & Qualificação de Leads',
      department: 'Comercial & Vendas',
      task: 'Triagem e Qualificação de Leads Inbound WhatsApp',
      progress: 100,
      sla: 'Concluído',
      status: 'Concluídas',
      tokens: '8,400',
      reliability: '99.1%'
    },
    {
      id: 'EMP-005',
      name: 'Gestor de Atendimento SAC Omnichannel',
      department: 'Atendimento ao Cliente',
      task: 'Resolução de 18 Chamados WhatsApp & Email',
      progress: 85,
      sla: 'Em tempo real',
      status: 'Em execução',
      tokens: '12,900',
      reliability: '99.7%'
    },
    {
      id: 'EMP-006',
      name: 'Engenheiro de Integrações ERP & Dados',
      department: 'Tecnologia & TI',
      task: 'Sincronização Primavera ERP x PostgreSQL',
      progress: 95,
      sla: 'Ciclo 15 min',
      status: 'Em execução',
      tokens: '5,300',
      reliability: '100%'
    }
  ];

  const togglePauseEmployee = (name: string) => {
    if (pausedEmployees.includes(name)) {
      setPausedEmployees(pausedEmployees.filter(n => n !== name));
      alert(`AI Employee "${name}" retomado com sucesso.`);
    } else {
      setPausedEmployees([...pausedEmployees, name]);
      alert(`AI Employee "${name}" pausado temporariamente.`);
    }
  };

  // Departments data
  const departmentsData = [
    {
      name: 'Contabilidade & Finanças',
      employeesCount: 12,
      activeTasks: 18,
      load: '78%',
      costMonth: '$28.40',
      roles: ['Contabilista Sénior PGC', 'Analista de Tesouraria', 'Reconciliador Bancário', 'Auditor de Balanços']
    },
    {
      name: 'Fiscalidade & Impostos',
      employeesCount: 8,
      activeTasks: 14,
      load: '82%',
      costMonth: '$24.10',
      roles: ['Perito Fiscal & IVA', 'Gestor de Retenção na Fonte', 'Especialista em Imposto de Selo']
    },
    {
      name: 'Comercial & Vendas',
      employeesCount: 10,
      activeTasks: 42,
      load: '88%',
      costMonth: '$38.90',
      roles: ['SDR Leads Inbound', 'Gerador de Propostas Comerciais', 'Gestor de Pipeline CRM']
    },
    {
      name: 'Jurídico & Compliance',
      employeesCount: 6,
      activeTasks: 8,
      load: '45%',
      costMonth: '$18.20',
      roles: ['Advogado Comercial & Contratos', 'Auditor de Conformidade Regulamentar', 'Especialista em RGPD']
    },
    {
      name: 'Atendimento ao Cliente',
      employeesCount: 8,
      activeTasks: 890,
      load: '84%',
      costMonth: '$31.50',
      roles: ['Gestor SAC WhatsApp', 'Operador de Tickets Email', 'Assistente de Suporte Nível 1']
    },
    {
      name: 'Tecnologia & TI',
      employeesCount: 4,
      activeTasks: 6,
      load: '52%',
      costMonth: '$14.80',
      roles: ['Engenheiro de Conectores ERP', 'Monitor de Integridade de Dados', 'Guardião de Segurança API']
    }
  ];

  // Dynamically compute boxes based on the active tab
  const getBoxesForActiveTab = () => {
    switch (activeTab) {
      case 'Departamentos':
        return [
          {
            code: 'BOX-WF-01-DEPT-01',
            title: 'Distribuição e Capacidade Operacional por Departamento',
            tag: `${departmentsData.length} Departamentos Ativos`,
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: '14px' }}>
                  {departmentsData.map((dept, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isDark ? '#f8fafc' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building size={16} color="#2563eb" />
                          {dept.name}
                        </div>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: 'rgba(37, 99, 235, 0.15)', color: '#60a5fa' }}>
                          {dept.employeesCount} Employees
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '8px 0', borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9' }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>Tarefas Ativas</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>{dept.activeTasks}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>Carga Média</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4ade80' }}>{dept.load}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>Custo Mês</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa' }}>{dept.costMonth}</div>
                        </div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', marginBottom: '6px' }}>Principais Funções:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {dept.roles.map((r, ri) => (
                            <span key={ri} style={{ fontSize: '0.68rem', padding: '2px 7px', borderRadius: '6px', background: isDark ? 'rgba(15, 23, 42, 0.8)' : '#f1f5f9', color: isDark ? '#cbd5e1' : '#475569' }}>
                              {r}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                        <button
                          onClick={() => nav?.setActiveTab('work_center')}
                          style={{ background: 'transparent', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          Ver Tarefas no Work Center <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        ];

      case 'Carga':
        return [
          {
            code: 'BOX-WF-01-LOAD-01',
            title: 'Heatmap & Distribuição da Capacidade de Processamento',
            tag: '72% Carga Global',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#eff6ff', border: isDark ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isDark ? '#60a5fa' : '#1d4ed8' }}>Utilização de Capacidade por Hora (08:00 - 18:00)</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4ade80' }}>Pico: 11:00 (88% capacidade)</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: '6px', alignItems: 'flex-end', height: '110px' }}>
                    {[
                      { h: '08h', p: 35 }, { h: '09h', p: 65 }, { h: '10h', p: 80 }, { h: '11h', p: 88 },
                      { h: '12h', p: 55 }, { h: '13h', p: 50 }, { h: '14h', p: 75 }, { h: '15h', p: 82 },
                      { h: '16h', p: 78 }, { h: '17h', p: 60 }, { h: '18h', p: 40 }
                    ].map((slot, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px' }}>{slot.p}%</span>
                        <div style={{ width: '100%', height: `${slot.p}%`, background: slot.p > 80 ? 'linear-gradient(180deg, #f59e0b, #d97706)' : 'linear-gradient(180deg, #3b82f6, #1d4ed8)', borderRadius: '4px' }} />
                        <span style={{ fontSize: '0.68rem', color: isDark ? '#cbd5e1' : '#475569', marginTop: '6px' }}>{slot.h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '10px' }}>Top 5 Employees com Maior Consumo de Tokens</div>
                    {activeEmployees.slice(0, 4).map((e, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', fontSize: '0.8rem' }}>
                        <span>{e.name}</span>
                        <span style={{ fontWeight: 700, color: '#60a5fa' }}>{e.tokens} tokens</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '10px' }}>Capacidade Ociosa & Escalabilidade</div>
                    <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.6 }}>
                      O cluster de AI Employees está a operar com <strong>28% de capacidade livre</strong>, permitindo absorver até <strong>120 novas tarefas simultâneas</strong> sem impacto na latência ou violação de SLA.
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        ];

      case 'Custos':
        return [
          {
            code: 'BOX-WF-01-COST-01',
            title: 'Unit Economics, Consumo de Modelos & Economia Gerada',
            tag: '97% Economia Estimada',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Custo Total do Mês (AI)</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>$142.50</div>
                    <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '4px' }}>+1.8M tokens processados</div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Custo Humano Equivalente</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#f87171', marginTop: '4px' }}>$4,800.00</div>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px' }}>Base: 6 funções especializadas</div>
                  </div>

                  <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>Poupança Financeira Líquida</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#4ade80', marginTop: '4px' }}>$4,657.50</div>
                    <div style={{ fontSize: '0.72rem', color: '#4ade80', marginTop: '4px' }}>Economia de 97.0%</div>
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(15, 23, 42, 0.6)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '8px' }}>Repartição de Custos por Provedor de Modelo</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Google Gemini 1.5 Pro (Raciocínio & Balancetes)</span>
                      <span style={{ fontWeight: 700 }}>$94.20 (66%)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Google Gemini 1.5 Flash (Classificação & WhatsApp)</span>
                      <span style={{ fontWeight: 700 }}>$38.40 (27%)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Modelos Locais / Embeddings MNCA</span>
                      <span style={{ fontWeight: 700 }}>$9.90 (7%)</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        ];

      case 'Fiabilidade':
        return [
          {
            code: 'BOX-WF-01-REL-01',
            title: 'Métricas de Fiabilidade Operacional & Governação SLA',
            tag: 'SLA 99.8% Cumprido',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                  <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>Taxa de Sucesso</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4ade80' }}>99.4%</div>
                    <div style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>1ª execução sem erro</div>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>UMER (Erros Materiais)</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8' }}>0.2%</div>
                    <div style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>Limite máximo: 1.0%</div>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>Escalação HITL</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a855f7' }}>100%</div>
                    <div style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>Conformidade de política</div>
                  </div>
                  <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>Certificação de Autonomia</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>L3 Ready</div>
                    <div style={{ fontSize: '0.68rem', color: isDark ? '#94a3b8' : '#64748b' }}>Governação activa</div>
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem', marginBottom: '6px' }}>Registo de Evidência Criptográfica Imutável</div>
                  <div style={{ fontSize: '0.8rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.5 }}>
                    Todas as decisões tomadas pelos AI Employees contêm rastreabilidade SHA-256 com carimbo de data/hora, garantindo auditoria jurídica sem precedentes em caso de inspeção fiscal ou contábil.
                  </div>
                </div>
              </div>
            )
          }
        ];

      case 'Alertas':
        return [
          {
            code: 'BOX-WF-01-ALERT-01',
            title: 'Central de Incidentes, Conectores e Alertas Operacionais',
            tag: '3 Alertas Ativos',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle color="#f59e0b" size={20} />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: isDark ? '#fde68a' : '#b45309' }}>Renovação Periódica de Token WhatsApp Cloud API</div>
                      <div style={{ fontSize: '0.74rem', color: isDark ? '#cbd5e1' : '#64748b' }}>O token de longa duração expira em 48 horas. Recomenda-se reautenticação preventiva.</div>
                    </div>
                  </div>
                  <button onClick={() => nav?.setActiveTab('integrations')} style={{ padding: '6px 12px', borderRadius: '6px', background: '#f59e0b', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer' }}>
                    Reautorizar
                  </button>
                </div>

                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CheckCircle2 color="#3b82f6" size={20} />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: isDark ? '#93c5fd' : '#1d4ed8' }}>2 Tarefas com Aprovação HITL Pendente</div>
                      <div style={{ fontSize: '0.74rem', color: isDark ? '#cbd5e1' : '#64748b' }}>Minutas contratuais de valor superior a Kz 5.000.000 aguardam validação do Administrador.</div>
                    </div>
                  </div>
                  <button onClick={() => nav?.setActiveTab('approvals_center')} style={{ padding: '6px 12px', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer' }}>
                    Abrir Aprovações
                  </button>
                </div>

                <div style={{ padding: '12px 16px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ShieldCheck color="#22c55e" size={20} />
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: isDark ? '#86efac' : '#15803d' }}>Segurança & Integridade 100% Estáveis</div>
                      <div style={{ fontSize: '0.74rem', color: isDark ? '#cbd5e1' : '#64748b' }}>Zero tentativas de invasão, zero vazamento de dados e isolamento de tenant mantido.</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e' }}>SAUDÁVEL</span>
                </div>
              </div>
            )
          }
        ];

      case 'Visão Geral':
      default:
        return [
          {
            code: 'BOX-WF-01-01',
            title: 'Mapa Operacional da Workforce Ativa (AI Employees em Tempo Real)',
            tag: `${activeEmployees.length} AI Employees Ativos`,
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '12px' }}>
                  {activeEmployees.map(emp => {
                    const isPaused = pausedEmployees.includes(emp.name);
                    return (
                      <div
                        key={emp.id}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff',
                          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>{emp.name}</div>
                            <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', fontWeight: 600 }}>{emp.department}</div>
                          </div>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              background: isPaused ? 'rgba(239, 68, 68, 0.15)' : (emp.status === 'Em execução' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.15)'),
                              color: isPaused ? '#f87171' : (emp.status === 'Em execução' ? '#60a5fa' : '#4ade80')
                            }}
                          >
                            {isPaused ? 'Pausado' : emp.status}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: isDark ? '#cbd5e1' : '#334155' }}>
                          <span style={{ fontWeight: 700 }}>Tarefa: </span>{emp.task}
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b', marginBottom: '4px' }}>
                            <span>Progresso</span>
                            <span style={{ fontWeight: 700, color: '#4ade80' }}>{emp.progress}%</span>
                          </div>
                          <div style={{ width: '100%', height: '6px', background: isDark ? '#1e293b' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${emp.progress}%`, height: '100%', background: 'linear-gradient(90deg, #2563eb, #38bdf8)', borderRadius: '3px' }} />
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                          <span>Fiabilidade: <strong style={{ color: '#4ade80' }}>{emp.reliability}</strong></span>
                          <span>SLA: <strong>{emp.sla}</strong></span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <button
                            onClick={() => togglePauseEmployee(emp.name)}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1',
                              background: 'transparent',
                              color: isPaused ? '#4ade80' : '#f87171',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px'
                            }}
                          >
                            {isPaused ? <Play size={12} /> : <Pause size={12} />}
                            {isPaused ? 'Retomar' : 'Pausar'}
                          </button>
                          <button
                            onClick={() => nav?.setActiveTab('work_center')}
                            style={{
                              flex: 1,
                              padding: '6px 10px',
                              borderRadius: '6px',
                              border: 'none',
                              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                              color: '#fff',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Ver no Chatbox
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          },
          {
            code: 'BOX-WF-01-02',
            title: 'Fila de Trabalho Global & SLA em Tempo Real',
            tag: 'Throughput Contínuo',
            content: (
              <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.6 }}>
                Fila única sincronizada com a Central de Trabalho. <strong>18 tarefas em processamento activo</strong>, com tempo médio de resposta de <strong>420ms</strong> e taxa de erro material de apenas <strong>0.2%</strong>.
              </div>
            )
          }
        ];
    }
  };

  return (
    <ScreenLayout
      moduleCode="WF-01"
      title="Centro de Comando da Workforce"
      subtitle="Controlar todos os AI Employees activos, pausados, em espera, degradados ou bloqueados."
      breadcrumbs={['Força de Trabalho', 'AI Employees']}
      buttons={[
        {
          label: 'Pausar',
          primary: true,
          onClick: () => {
            alert('Modo de pausa temporária ativado. Selecione os Employees ou tarefas a congelar.');
          }
        },
        {
          label: 'Retomar',
          onClick: () => {
            setPausedEmployees([]);
            alert('Todos os AI Employees foram retomados e estão operacionais.');
          }
        },
        { label: 'Reatribuir', onClick: () => nav?.setActiveTab('work_center') },
        { label: 'Take Over', onClick: () => nav?.setActiveTab('work_center') },
        {
          label: 'Parar Todos',
          danger: true,
          onClick: () => {
            if (confirm('Atenção: Deseja colocar toda a equipa de AI Employees em pausa preventiva imediata?')) {
              setPausedEmployees(activeEmployees.map(e => e.name));
              alert('Comando executado: todos os AI Employees foram colocados em modo de pausa de segurança.');
            }
          }
        }
      ]}
      kpis={[
        { label: 'Activos', value: '48', change: 'Em execução', statusColor: COLORS.sucesso },
        { label: 'A trabalhar', value: '18', change: 'Processamento activo', statusColor: COLORS.operacao },
        { label: 'Aguardam dados', value: '2', change: 'Input necessário', statusColor: COLORS.revisao },
        { label: 'Aguardam aprovação', value: '5', change: 'Fila HITL', statusColor: COLORS.revisao }
      ]}
      tabs={['Visão Geral', 'Departamentos', 'Carga', 'Custos', 'Fiabilidade', 'Alertas']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForActiveTab()}
      promptsBase={['MPR-002', 'MPR-031', 'MPR-019']}
      inventoryButtons={['01 Pausar', '02 Retomar', '03 Reatribuir', '04 Take Over', '05 Parar Todos']}
      inventoryKpis={['01 Activos', '02 A trabalhar', '03 Aguardam dados', '04 Aguardam aprovação']}
      inventoryTabs={['01 Visão Geral', '02 Departamentos', '03 Carga', '04 Custos', '05 Fiabilidade', '06 Alertas']}
    />
  );
};

export const MarketplaceScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('Todas as Áreas');
  const [displayLimit, setDisplayLimit] = useState(60);
  const [selectedRoleForHire, setSelectedRoleForHire] = useState<(typeof CANONICAL_500_ROLES)[number] | null>(null);
  const [hiredRoles, setHiredRoles] = useState<string[]>(['Contabilista Sénior PGC', 'Perito Fiscal & IVA']);
  const isDark = useIsDark();
  const nav = useNavigation();

  const allDepartments = ['Todas as Áreas', ...Array.from(new Set(CANONICAL_500_ROLES.map(r => r.department))).sort()];

  const filteredRoles = CANONICAL_500_ROLES.filter(role => {
    const matchesSearch = !searchTerm || role.display_name.toLowerCase().includes(searchTerm.toLowerCase()) || role.role_key.toLowerCase().includes(searchTerm.toLowerCase()) || role.mission.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'Todas as Áreas' || role.department.toLowerCase() === selectedDepartment.toLowerCase();
    if (activeTab === 'Contratados' || activeTab === 'Equipas') {
      return matchesSearch && matchesDept && (hiredRoles.includes(role.display_name) || hiredRoles.length > 0);
    }
    return matchesSearch && matchesDept;
  });

  const visibleRoles = filteredRoles.slice(0, displayLimit);

  const handleHireConfirm = () => {
    if (selectedRoleForHire) {
      setHiredRoles([...hiredRoles, selectedRoleForHire.display_name]);
      setSelectedRoleForHire(null);
    }
  };

  const getBoxesForMarketplace = () => {
    switch (activeTab) {
      case 'Equipas':
        return [
          {
            code: 'BOX-WF-02-SQUADS',
            title: 'Equipas Pré-Configuradas & Squads de AI Employees',
            tag: 'Automação Multidisciplinar',
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                {[
                  {
                    name: 'Squad Fiscal & Contábil PGC',
                    desc: 'Equipa integrada para encerramento de mês, balancetes, IVA, retenção e conformidade tributária AGT.',
                    roles: ['Contabilista Sénior PGC', 'Perito Fiscal & IVA', 'Analista de Tesouraria'],
                    price: '$850 / mês',
                    savings: 'Poupança de 94%'
                  },
                  {
                    name: 'Squad Comercial & Qualificação WhatsApp',
                    desc: 'Atendimento contínuo 24/7 de leads inbound, qualificação SDR, emissão de orçamentos e follow-up.',
                    roles: ['SDR Leads Inbound', 'Gestor WhatsApp SAC', 'Gerador de Propostas Comerciais'],
                    price: '$720 / mês',
                    savings: 'Poupança de 96%'
                  },
                  {
                    name: 'Squad Jurídico, Contratos & Compliance',
                    desc: 'Análise de minutas contratuais, verificação de conformidade de fornecedores e alertas regulatórios.',
                    roles: ['Advogado Comercial & Contratos', 'Auditor de Conformidade', 'Especialista em RGPD'],
                    price: '$950 / mês',
                    savings: 'Poupança de 92%'
                  }
                ].map((squad, i) => (
                  <div key={i} style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isDark ? '#f8fafc' : '#0f172a' }}>{squad.name}</div>
                    <div style={{ fontSize: '0.78rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.5 }}>{squad.desc}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {squad.roles.map((r, ri) => (
                        <span key={ri} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '6px', background: 'rgba(37, 99, 235, 0.12)', color: '#60a5fa' }}>{r}</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '8px', borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9' }}>
                      <div>
                        <span style={{ fontWeight: 800, color: '#38bdf8' }}>{squad.price}</span>
                        <span style={{ fontSize: '0.7rem', color: '#4ade80', marginLeft: '6px' }}>({squad.savings})</span>
                      </div>
                      <button onClick={() => alert(`Squad "${squad.name}" activado com sucesso.`)} style={{ padding: '6px 14px', borderRadius: '6px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}>
                        Contratar Squad
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        ];

      case 'Recomendados':
        return [
          {
            code: 'BOX-WF-02-REC',
            title: 'AI Employees Recomendados pelo Motor de Discovery de Processos',
            tag: 'Baseado no Perfil da Empresa',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569' }}>
                  Com base no histórico e nas operações ativas de <strong>MARVINE, LDA</strong>, estes são os funcionários digitais de maior impacto recomendados:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  {CANONICAL_500_ROLES.slice(0, 6).map((r, idx) => (
                    <div key={idx} style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 700 }}>● 98% MATCH DE NECESSIDADE</span>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{r.display_name}</div>
                      <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b' }}>{r.department}</div>
                      <button onClick={() => setSelectedRoleForHire(r)} style={{ marginTop: '4px', padding: '6px 12px', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer' }}>
                        Contratar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
        ];

      case 'Todos':
      case 'Por Área':
      case 'Mais usados':
      default:
        return [
          {
            code: 'BOX-WF-02-01',
            title: `Catálogo de 500 AI Employees Canónicos (${activeTab})`,
            tag: `${filteredRoles.length} de 500 Roles`,
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f1f5f9', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '8px' }}>
                    <Search size={16} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Pesquisar entre as 500 funções por nome, código ou missão..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      style={{ background: 'transparent', border: 'none', outline: 'none', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.85rem', width: '100%' }}
                    />
                  </div>

                  <select
                    value={selectedDepartment}
                    onChange={e => setSelectedDepartment(e.target.value)}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.82rem', fontWeight: 600 }}
                  >
                    {allDepartments.map((dept, idx) => (
                      <option key={idx} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
                  {visibleRoles.map(role => {
                    const isHired = hiredRoles.includes(role.display_name);
                    return (
                      <div key={role.role_key} style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '10px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '6px', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: isDark ? '#60a5fa' : '#1d4ed8', fontFamily: 'monospace' }}>
                                {role.role_key}
                              </span>
                              <span style={{ fontSize: '0.65rem', fontWeight: 600, padding: '2px 6px', borderRadius: '4px', background: isDark ? 'rgba(147, 51, 234, 0.15)' : 'rgba(126, 34, 206, 0.1)', color: isDark ? '#c084fc' : '#7e22ce' }}>
                                {role.department}
                              </span>
                            </div>
                            {isHired && (
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#4ade80', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <CheckCircle2 size={12} /> Contratado
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: isDark ? '#f8fafc' : '#0f172a' }}>{role.display_name}</div>
                          <div style={{ fontSize: '0.75rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{role.mission}</div>
                        </div>

                        <button
                          onClick={() => setSelectedRoleForHire(role)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            background: isHired ? 'rgba(34, 197, 94, 0.2)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            color: isHired ? (isDark ? '#4ade80' : '#15803d') : '#ffffff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                          }}
                        >
                          {isHired ? 'Ver Instância' : 'Contratar Employee'}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {displayLimit < filteredRoles.length && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                    <button
                      onClick={() => setDisplayLimit(displayLimit + 60)}
                      style={{ padding: '8px 20px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#e2e8f0', color: isDark ? '#60a5fa' : '#1d4ed8', border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #cbd5e1', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                    >
                      Carregar Mais AI Employees ({filteredRoles.length - displayLimit} restantes de 500)
                    </button>
                  </div>
                )}
              </div>
            )
          }
        ];
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      
      {/* HIRE EMPLOYEE MODAL */}
      {selectedRoleForHire && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: '16px', padding: '28px', maxWidth: '540px', width: '100%', boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.6)' : '0 10px 30px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <UserPlus color="#2563eb" size={22} /> Contratar AI Employee
              </div>
              <button onClick={() => setSelectedRoleForHire(null)} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: isDark ? '#60a5fa' : '#1d4ed8', width: 'fit-content', fontFamily: 'monospace' }}>
                {selectedRoleForHire.role_key}
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>{selectedRoleForHire.display_name}</div>
              <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569' }}>{selectedRoleForHire.mission}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9' }}>
                <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>Nível de Autonomia</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4ade80' }}>Nível L3 (Certificado)</div>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9' }}>
                <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b' }}>Custo Operacional</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#38bdf8' }}>$35 / mês</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button onClick={() => setSelectedRoleForHire(null)} style={{ padding: '9px 18px', borderRadius: '8px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button onClick={handleHireConfirm} style={{ padding: '9px 22px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}>
                Confirmar Contratação
              </button>
            </div>
          </div>
        </div>
      )}

      <ScreenLayout
        moduleCode="WF-02"
        title="Catálogo & Marketplace de 500 AI Employees"
        subtitle="Explorar, comparar e contratar AI Employees prontos para produção em mais de 48 áreas de negócio."
        breadcrumbs={['Força de Trabalho', 'Catálogo']}
        buttons={[
          { label: 'Contratar AI Employee', primary: true, onClick: () => setSelectedRoleForHire(filteredRoles[0]) },
          { label: 'Comparar', onClick: () => alert('Selecione 2 funções no catálogo para abrir o comparador lado a lado.') },
          { label: 'Adicionar à Equipa', onClick: () => handleHireConfirm() },
          { label: 'Iniciar Piloto', onClick: () => nav?.navigateToArea('QUAL-06') }
        ]}
        kpis={[
          { label: '500 funções', value: '500 / 500', change: 'Catálogo canónico', statusColor: COLORS.sucesso },
          { label: 'Áreas', value: '48', change: 'Departamentos', statusColor: COLORS.operacao },
          { label: 'Planos', value: '3', change: 'Pro / Enterprise', statusColor: COLORS.ia },
          { label: 'Pilotos disponíveis', value: '100%', change: 'Sem risco', statusColor: COLORS.sucesso }
        ]}
        tabs={['Todos', 'Por Área', 'Mais usados', 'Recomendados', 'Equipas']}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        boxes={getBoxesForMarketplace()}
        promptsBase={['MPR-026', 'MPR-027', 'MPR-031']}
        inventoryButtons={['01 Ver Employee', '02 Comparar', '03 Adicionar à Equipa', '04 Contratar', '05 Iniciar Piloto']}
        inventoryKpis={['01 500 funções', '02 Áreas', '03 Planos', '04 Pilotos disponíveis']}
        inventoryTabs={['01 Todos', '02 Por Área', '03 Mais usados', '04 Recomendados', '05 Equipas']}
      />
    </div>
  );
};

export const EmployeeDetailScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Visão Geral');
  const nav = useNavigation();
  const isDark = useIsDark();

  const getBoxesForEmployeeDetail = () => {
    switch (activeTab) {
      case 'Tarefas':
        return [
          {
            code: 'BOX-WF-03-TASKS',
            title: 'Fila de Tarefas Atribuídas ao Employee',
            tag: '4 Tarefas',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { id: 'TASK-101', title: 'Elaboração do Balancete Contabilístico T3', status: 'Em execução', progress: '60%' },
                  { id: 'TASK-098', title: 'Reconciliação Bancária BFA / BAI Mensal', status: 'Concluído', progress: '100%' },
                  { id: 'TASK-087', title: 'Apuramento e Fecho de Contas Modelo 1', status: 'Concluído', progress: '100%' }
                ].map((t, idx) => (
                  <div key={idx} style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563eb', fontFamily: 'monospace' }}>{t.id}</span>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{t.title}</div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: t.status === 'Concluído' ? '#4ade80' : '#60a5fa' }}>{t.status} ({t.progress})</span>
                  </div>
                ))}
              </div>
            )
          }
        ];

      case 'Competências':
        return [
          {
            code: 'BOX-WF-03-COMP',
            title: 'Scorecard de Competências & Avaliação Técnica',
            tag: 'Score 99.6%',
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {[
                  { name: 'Normas PGC & IFRS', score: '99.8%', status: 'Certificado' },
                  { name: 'Código Geral Tributário Angolano', score: '99.5%', status: 'Certificado' },
                  { name: 'Conciliação de Razão & Balanço', score: '100%', status: 'Mestre' }
                ].map((c, i) => (
                  <div key={i} style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#4ade80', marginTop: '4px' }}>{c.score}</div>
                    <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>{c.status}</div>
                  </div>
                ))}
              </div>
            )
          }
        ];

      case 'Conhecimento':
        return [
          {
            code: 'BOX-WF-03-KNO',
            title: 'Bases de Conhecimento Vinculadas & Procedimentos SOP',
            tag: '14 Documentos',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {['Manual de Contabilidade PGC Angolano 2024', 'Regulamento do IVA e Retenção na Fonte AGT', 'Plano Geral de Contas Explicado'].map((k, i) => (
                  <div key={i} style={{ padding: '10px 14px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{k}</span>
                    <span style={{ fontSize: '0.68rem', color: '#4ade80', fontWeight: 700 }}>● SHA-256 OK</span>
                  </div>
                ))}
              </div>
            )
          }
        ];

      case 'Tools':
        return [
          {
            code: 'BOX-WF-03-TOOLS',
            title: 'Ferramentas & Conectores Autorizados para o Employee',
            tag: '4 Tools Ativas',
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { name: 'Conector Primavera ERP', desc: 'Leitura de extratos e contas correntes' },
                  { name: 'Motor de Extração OCR PDF', desc: 'Processamento de faturas e recibos' },
                  { name: 'Validador Fiscal AGT', desc: 'Checagem de NIF e retenções' },
                  { name: 'Exportador Excel / CSV', desc: 'Geração de mapas contábeis' }
                ].map((tool, idx) => (
                  <div key={idx} style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{tool.name}</div>
                    <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b' }}>{tool.desc}</div>
                  </div>
                ))}
              </div>
            )
          }
        ];

      case 'Permissões':
        return [
          {
            code: 'BOX-WF-03-PERM',
            title: 'Políticas de Permissão, Autonomia & Escopo RBAC',
            tag: 'Nível L3',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9' }}>
                  <span>Acesso a Dados Financeiros:</span>
                  <strong style={{ color: '#4ade80' }}>Autorizado (Leitura/Escrita)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #f1f5f9' }}>
                  <span>Disparo de Pagamentos Bancários:</span>
                  <strong style={{ color: '#f59e0b' }}>Exige Dupla Aprovação HITL</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px' }}>
                  <span>Submissão Fiscal Direta:</span>
                  <strong style={{ color: '#f59e0b' }}>Requer Assinatura Digital do Gestor</strong>
                </div>
              </div>
            )
          }
        ];

      case 'Modelo':
        return [
          {
            code: 'BOX-WF-03-MODEL',
            title: 'Configuração do Modelo de Inteligência Artificial',
            tag: 'Google Gemini 1.5 Pro',
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc' }}>
                  <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Modelo Primário</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>gemini-1.5-pro</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc' }}>
                  <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Temperatura</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>0.1 (Precisão Estrita)</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc' }}>
                  <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Latência Média</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4ade80' }}>420 ms</div>
                </div>
              </div>
            )
          }
        ];

      case 'Fiabilidade':
        return [
          {
            code: 'BOX-WF-03-REL',
            title: 'Métricas de Fiabilidade & Auditoria de Decisão',
            tag: '99.8% Precisão',
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc' }}>
                  <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Taxa de Sucesso</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4ade80' }}>99.8%</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc' }}>
                  <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>UMER</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>0.1%</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc' }}>
                  <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Escalação Correta</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#a855f7' }}>100%</div>
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc' }}>
                  <div style={{ fontSize: '0.7rem', color: isDark ? '#94a3b8' : '#64748b' }}>Hashes Verificados</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#4ade80' }}>100%</div>
                </div>
              </div>
            )
          }
        ];

      case 'Visão Geral':
      default:
        return [
          {
            code: 'BOX-WF-03-01',
            title: 'Cartão de Identidade 360 do AI Employee',
            tag: 'READY_FOR_PRODUCTION',
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>Contabilista Sénior PGC</div>
                  <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569' }}>
                    Responsável pelo apuramento contábil, conciliações, balancetes de verificação e conformidade integral com as normas angolanas.
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                  <div>Departamento: <strong>Contabilidade & Finanças</strong></div>
                  <div>Autonomia: <strong style={{ color: '#4ade80' }}>Nível 3 (Certificado)</strong></div>
                  <div>Instância: <strong>Ativa e Operacional</strong></div>
                </div>
              </div>
            )
          },
          {
            code: 'BOX-WF-03-02',
            title: 'Estado Actual de Execução & Tarefa Ativa',
            tag: 'Processamento em Tempo Real',
            content: (
              <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>TAREFA ACTIVA: TASK-101</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '2px' }}>Elaboração do Balancete Contabilístico T3</div>
                <div style={{ fontSize: '0.78rem', color: isDark ? '#cbd5e1' : '#475569', marginTop: '4px' }}>Progresso: 60% — SLA restante: 12 minutos.</div>
              </div>
            )
          }
        ];
    }
  };

  return (
    <ScreenLayout
      moduleCode="WF-03"
      title="Detalhe do AI Employee 360"
      subtitle="Painel 360 do Employee: identidade, competências, tarefas, modelo, conhecimento, ferramentas, permissões, certificação e histórico."
      breadcrumbs={['Força de Trabalho', 'AI Employee', 'Detalhe']}
      buttons={[
        { label: 'Nova Tarefa', primary: true, onClick: () => nav?.openModal('command') },
        { label: 'Pausar', onClick: () => alert('AI Employee pausado temporariamente.') },
        { label: 'Configurar', onClick: () => nav?.setActiveTab('settings_scheduler') },
        { label: 'Retestar', onClick: () => alert('Bateria de testes de competência executada com sucesso.') },
        { label: 'Abrir Passaporte', onClick: () => nav?.setActiveTab('passports_eligibility') }
      ]}
      kpis={[
        { label: 'Readiness', value: '100%', change: 'READY_FOR_PRODUCTION', statusColor: COLORS.sucesso },
        { label: 'Fiabilidade', value: '99.4%', change: 'Score de erro baixo', statusColor: COLORS.sucesso },
        { label: 'Tarefas concluídas', value: '342', change: '+28 esta semana', statusColor: COLORS.operacao },
        { label: 'Custo do mês', value: '$42.50', change: '52,400 tokens', statusColor: COLORS.ia }
      ]}
      tabs={['Visão Geral', 'Tarefas', 'Competências', 'Conhecimento', 'Tools', 'Permissões', 'Modelo', 'Fiabilidade']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForEmployeeDetail()}
      promptsBase={['MPR-011', 'MPR-012', 'MPR-013', 'MPR-014', 'MPR-019']}
      inventoryButtons={['01 Nova Tarefa', '02 Pausar', '03 Configurar', '04 Retestar', '05 Abrir Passaporte']}
      inventoryKpis={['01 Readiness', '02 Fiabilidade', '03 Tarefas concluídas', '04 Custo do mês']}
      inventoryTabs={['01 Visão Geral', '02 Tarefas', '03 Competências', '04 Conhecimento', '05 Tools', '06 Permissões']}
    />
  );
};

export const RolePackSopScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Role Profile');
  const nav = useNavigation();
  const isDark = useIsDark();

  const getBoxesForRolePack = () => {
    switch (activeTab) {
      case 'Tasks':
        return [
          {
            code: 'BOX-WF-04-TASKS',
            title: 'Catálogo de Tipos de Tarefas Padronizadas (Task Types)',
            tag: '8 Task Types',
            content: (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {[
                  { name: 'Balancete de Verificação', sla: '15 min', risk: 'Baixo' },
                  { name: 'Reconciliação Bancária', sla: '10 min', risk: 'Baixo' },
                  { name: 'Apuramento Modelo 1 IVA', sla: '30 min', risk: 'Médio' },
                  { name: 'Relatório Contábil Trimestral', sla: '45 min', risk: 'Médio' }
                ].map((t, idx) => (
                  <div key={idx} style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.name}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                      <span>SLA: {t.sla}</span>
                      <span>Risco: {t.risk}</span>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        ];

      case 'SOPs':
        return [
          {
            code: 'BOX-WF-04-SOPS',
            title: 'Procedimentos Operacionais Padrão (SOPs)',
            tag: 'SOP Aprovado v2.4',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                <div style={{ padding: '10px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc' }}>
                  <strong>Passo 1:</strong> Recepção e conferência de extratos bancários e faturas de fornecedores.
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc' }}>
                  <strong>Passo 2:</strong> Classificação contábil de acordo com o Plano Geral de Contas angolano.
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc' }}>
                  <strong>Passo 3:</strong> Validação de saldos e cálculo do balancete preliminar.
                </div>
                <div style={{ padding: '10px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc' }}>
                  <strong>Passo 4:</strong> Emissão de recibo de auditoria com hash SHA-256 e entrega ao revisor.
                </div>
              </div>
            )
          }
        ];

      case 'Inputs':
      case 'Outputs':
        return [
          {
            code: 'BOX-WF-04-CONTRACT',
            title: `Contrato de Dados de ${activeTab}`,
            tag: 'Especificação Estrita',
            content: (
              <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.6 }}>
                Formatos aceites: <strong>PDF, XLSX, CSV, JSON</strong>. Todas as variáveis de entrada são validadas contra o schema do SOP antes do disparo do motor de execução.
              </div>
            )
          }
        ];

      case 'Qualidade':
      case 'Escalação':
      case 'Versões':
        return [
          {
            code: 'BOX-WF-04-GOV',
            title: `Governação, ${activeTab} & Controlo de Risco`,
            tag: '100% Conforme',
            content: (
              <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.6 }}>
                Regras de paragem e condições de escalação humana (HITL) definidas para divergências contábeis superiores a <strong>0.01%</strong> ou valores monetários acima de <strong>Kz 1.000.000</strong>.
              </div>
            )
          }
        ];

      case 'Role Profile':
      default:
        return [
          {
            code: 'BOX-WF-04-01',
            title: 'Perfil & Missão do Role Pack',
            tag: 'Norma Técnica Angolana',
            content: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.6 }}>
                <div><strong>Missão Principal:</strong> Garantir a contabilidade patrimonial e fiscal com exatidão matemática, cumprimento estrito de prazos legais e zero inconformidades tributárias.</div>
                <div><strong>Nível de Especialização:</strong> Sénior / Especialista em PGC.</div>
                <div><strong>Governação:</strong> Homologado pela plataforma com evidência imutável.</div>
              </div>
            )
          }
        ];
    }
  };

  return (
    <ScreenLayout
      moduleCode="WF-04"
      title="Role Pack, Task Catalog & SOPs"
      subtitle="Definir quem é o Employee, o que faz, como faz, inputs, outputs, SOPs, quality rules, stop conditions e escalation."
      breadcrumbs={['Força de Trabalho', 'Role Packs']}
      buttons={[
        { label: 'Criar Task Type', primary: true, onClick: () => nav?.openModal('command') },
        { label: 'Criar SOP', onClick: () => alert('Editor de Procedimento Operacional Padrão (SOP) aberto.') },
        { label: 'Editar Role Pack', onClick: () => alert('Perfil do Role Pack em modo de edição.') },
        { label: 'Publicar Versão', onClick: () => alert('Nova versão do Role Pack registada.') },
        { label: 'Comparar Versões', onClick: () => alert('Comparação de versões carregada.') }
      ]}
      kpis={[
        { label: 'Tasks catalogadas', value: '1,240', change: 'Standardizadas', statusColor: COLORS.operacao },
        { label: 'SOPs aprovados', value: '480', change: 'Com validação', statusColor: COLORS.sucesso },
        { label: 'Excepções', value: '14', change: 'Mapeadas', statusColor: COLORS.revisao },
        { label: 'Stop conditions', value: '38', change: 'Regras de segurança', statusColor: COLORS.risco }
      ]}
      tabs={['Role Profile', 'Tasks', 'SOPs', 'Inputs', 'Outputs', 'Qualidade', 'Escalação', 'Versões']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForRolePack()}
      promptsBase={['MPR-012']}
      inventoryButtons={['01 Criar Task Type', '02 Criar SOP', '03 Editar Role Pack', '04 Publicar Versão', '05 Comparar Versões']}
      inventoryKpis={['01 Tasks catalogadas', '02 SOPs aprovados', '03 Excepções', '04 Stop conditions']}
      inventoryTabs={['01 Role Profile', '02 Tasks', '03 SOPs', '04 Inputs', '05 Outputs', '06 Qualidade']}
    />
  );
};

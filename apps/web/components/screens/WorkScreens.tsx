import React, { useState } from 'react';
import { ScreenLayout, COLORS, useIsDark } from '../ui/DesignSystem';
import { CheckSquare, Plus, X, Play, Clock, AlertCircle, FileText, Search, UserCheck, MessageSquare } from 'lucide-react';
import { CANONICAL_500_ROLES } from '@ai-employee/rolepack';
import { ChatboxWorkspace } from '../ui/ChatboxWorkspace';
import { useNavigation } from '../NavigationContext';

export const WorkCenterScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Workspace de Conversa CHAT-01');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [filterText, setFilterText] = useState('');
  const nav = useNavigation();
  const isDark = useIsDark();

  // Real interactive state for tasks
  const [tasks, setTasks] = useState([
    { id: 'TASK-101', title: 'Elaboração do Balancete Contabilístico T3', employee: 'Contabilista Sénior PGC', priority: 'Alta', status: 'Em execução', progress: '60%', deadline: 'Hoje às 18:00' },
    { id: 'TASK-102', title: 'Auditoria de Conformidade Fiscal IVA & Retenção', employee: 'Perito Fiscal & IVA', priority: 'Crítica', status: 'Aguardam aprovação', progress: '90%', deadline: 'Amanhã às 12:00' },
    { id: 'TASK-103', title: 'Triagem e Qualificação de Leads Inbound WhatsApp', employee: 'SDR & Qualificação de Leads', priority: 'Média', status: 'Concluídas', progress: '100%', deadline: 'Concluído' },
    { id: 'TASK-104', title: 'Minuta do Contrato de Prestação de Serviços', employee: 'Advogado Comercial & Contratos', priority: 'Alta', status: 'Em execução', progress: '40%', deadline: '15/09 às 10:00' }
  ]);

  // Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [selectedRole, setSelectedRole] = useState(CANONICAL_500_ROLES[0]?.display_name || 'Contabilista Sénior PGC');
  const [instruction, setInstruction] = useState('');
  const [priority, setPriority] = useState('Alta');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask = {
      id: `TASK-10${tasks.length + 1}`,
      title: taskTitle,
      employee: selectedRole,
      priority,
      status: 'Em execução',
      progress: '10%',
      deadline: 'Hoje às 19:00'
    };

    setTasks([newTask, ...tasks]);
    setTaskTitle('');
    setInstruction('');
    setShowTaskModal(false);
  };

  const filteredTasks = tasks.filter(t => {
    if (activeTab === 'Equipa' || activeTab === 'Minha Caixa' || activeTab.includes('CHAT-01')) return true;
    if (activeTab === 'Concluídas') return t.status === 'Concluídas';
    if (activeTab === 'Bloqueadas') return t.status === 'Bloqueadas';
    return true;
  }).filter(t => t.title.toLowerCase().includes(filterText.toLowerCase()) || t.employee.toLowerCase().includes(filterText.toLowerCase()));

  return (
    <div style={{ position: 'relative' }}>
      
      {/* REAL CREATE TASK MODAL */}
      {showTaskModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000, background: 'rgba(15, 23, 42, 0.55)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleCreateTask} style={{ background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', borderRadius: '16px', padding: '28px', maxWidth: '580px', width: '100%', boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.6)' : '0 10px 30px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckSquare color="#2563eb" size={22} /> Criar & Atribuir Nova Tarefa
              </div>
              <button type="button" onClick={() => setShowTaskModal(false)} style={{ background: 'transparent', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '6px', display: 'block' }}>Título da Tarefa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Auditoria de Declaração Modelo 1 do IVA"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '6px', display: 'block' }}>Seleccionar AI Employee (500 Roles)</label>
                  <select
                    value={selectedRole}
                    onChange={e => setSelectedRole(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.82rem' }}
                  >
                    {CANONICAL_500_ROLES.map((r, i) => (
                      <option key={i} value={r.display_name}>{r.role_key} — {r.display_name} ({r.department})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '6px', display: 'block' }}>Prioridade</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.85rem' }}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '6px', display: 'block' }}>Instrução / Descrição da Tarefa</label>
                <textarea
                  rows={3}
                  placeholder="Especifique os requisitos, regras do SOP, ficheiros anexos e o formato do trabalho a entregar..."
                  value={instruction}
                  onChange={e => setInstruction(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? 'rgba(30, 41, 59, 0.8)' : '#f8fafc', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.85rem', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button type="button" onClick={() => setShowTaskModal(false)} style={{ padding: '9px 18px', borderRadius: '8px', background: 'transparent', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', color: isDark ? '#cbd5e1' : '#475569', fontWeight: 600, cursor: 'pointer' }}>
                Cancelar
              </button>
              <button type="submit" style={{ padding: '9px 22px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)' }}>
                Disparar Execução
              </button>
            </div>
          </form>
        </div>
      )}

      <ScreenLayout
        moduleCode="TASK-01"
        title="Central de Trabalho"
        subtitle="Criar e acompanhar trabalho real dos Employees numa fila única por empresa."
        breadcrumbs={['Trabalho', 'Central de Trabalho']}
        buttons={[
          { label: 'Nova Tarefa', primary: true, onClick: () => setShowTaskModal(true) },
          { label: 'Atribuir', onClick: () => setShowTaskModal(true) },
          {
            label: 'Anexar',
            onClick: () => {
              const input = document.createElement('input');
              input.type = 'file';
              input.onchange = (e: any) => {
                const file = e.target?.files?.[0];
                if (file) alert(`Ficheiro "${file.name}" anexado com sucesso.`);
              };
              input.click();
            }
          },
          { label: 'Agendar', onClick: () => nav?.navigateToArea('INT-04') },
          {
            label: 'Filtrar',
            onClick: () => {
              const input = document.querySelector('input[placeholder*="Pesquisar tarefas"]') as HTMLInputElement;
              if (input) input.focus();
            }
          },
          {
            label: 'Exportar',
            onClick: () => {
              const csv = 'ID,Tarefa,Employee,Prioridade,Estado,Progresso\n' + tasks.map(t => `"${t.id}","${t.title}","${t.employee}","${t.priority}","${t.status}","${t.progress}"`).join('\n');
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = 'tarefas_workcenter.csv';
              link.click();
              URL.revokeObjectURL(url);
            }
          }
        ]}
        kpis={[
          { label: 'Abertas', value: tasks.length, change: 'Na fila', statusColor: COLORS.operacao },
          { label: 'Em execução', value: tasks.filter(t => t.status === 'Em execução').length, change: 'Processando agora', statusColor: COLORS.ia },
          { label: 'Aguardam aprovação', value: tasks.filter(t => t.status === 'Aguardam aprovação').length, change: 'Pendentes HITL', statusColor: COLORS.revisao },
          { label: 'Concluídas', value: '1,890', change: 'Histórico acumulado', statusColor: COLORS.sucesso }
        ]}
        tabs={['Workspace de Conversa CHAT-01', 'Minha Caixa', 'Equipa', 'Agendadas', 'Recorrentes', 'Bloqueadas', 'Concluídas']}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        promptsBase={['MPR-010', 'MPR-009', 'MPR-011']}
        inventoryButtons={['01 Nova Tarefa', '02 Atribuir', '03 Anexar', '04 Agendar', '05 Filtrar', '06 Exportar']}
        inventoryKpis={['01 Abertas', '02 Em execução', '03 Aguardam aprovação', '04 Concluídas']}
        inventoryTabs={['01 Minha Caixa', '02 Equipa', '03 Agendadas', '04 Recorrentes', '05 Bloqueadas', '06 Concluídas']}
        boxes={getBoxesForWorkCenter(activeTab, isDark, filteredTasks, handleCreateTask, taskTitle, setTaskTitle, selectedRole, setSelectedRole, priority, setPriority, instruction, setInstruction, filterText, setFilterText, nav)}
      />
    </div>
  );
};

function getBoxesForWorkCenter(
  activeTab: string,
  isDark: boolean,
  filteredTasks: any[],
  handleCreateTask: any,
  taskTitle: string,
  setTaskTitle: any,
  selectedRole: string,
  setSelectedRole: any,
  priority: string,
  setPriority: any,
  instruction: string,
  setInstruction: any,
  filterText: string,
  setFilterText: any,
  nav: any
) {
  if (activeTab === 'Workspace de Conversa CHAT-01') {
    return [
      {
        code: 'CHAT-01',
        title: 'Workspace de Conversa Operacional com AI Employee (Real-Time Execution & SOP Engine)',
        tag: 'CHAT-01 CANÓNICO',
        content: <ChatboxWorkspace isDark={isDark} />
      }
    ];
  }

  if (activeTab === 'Agendadas') {
    const scheduled = [
      { id: 'SCH-01', name: 'Fecho Diário de Caixa & Reconciliação Bancária', employee: 'Contabilista Sénior PGC', nextRun: 'Hoje às 18:00', periodicity: 'Diário (Seg-Sex)', canal: 'ERP Primavera' },
      { id: 'SCH-02', name: 'Relatório Executivo Matinal de Operações & Vendas', employee: 'COO / Operações & Eficiência', nextRun: 'Amanhã às 08:30', periodicity: 'Diário às 08:30', canal: 'WhatsApp Executivo' },
      { id: 'SCH-03', name: 'Varredura de Conformidade Fiscal & Retenções', employee: 'Perito Fiscal & IVA', nextRun: 'Sexta-feira às 17:00', periodicity: 'Semanal', canal: 'Portal AGT' },
      { id: 'SCH-04', name: 'Envio de Alertas de Vencimento a Clientes Inadimplentes', employee: 'Especialista em Cobranças & Crédito', nextRun: '15/09 às 09:00', periodicity: 'Quinzenal', canal: 'Email & WhatsApp' }
    ];
    return [
      {
        code: 'BOX-TASK-SCH-01',
        title: 'Fila de Tarefas Agendadas no Tempo',
        tag: `${scheduled.length} Tarefas Programadas`,
        content: (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>ROUTINE NAME</th>
                  <th style={{ padding: '10px' }}>AI EMPLOYEE RESPONSÁVEL</th>
                  <th style={{ padding: '10px' }}>PRÓXIMA EXECUÇÃO</th>
                  <th style={{ padding: '10px' }}>PERIODICIDADE</th>
                  <th style={{ padding: '10px' }}>CANAL / DESTINO</th>
                </tr>
              </thead>
              <tbody>
                {scheduled.map(s => (
                  <tr key={s.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: isDark ? '#60a5fa' : '#1d4ed8', fontWeight: 700 }}>{s.id}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{s.name}</td>
                    <td style={{ padding: '10px' }}>{s.employee}</td>
                    <td style={{ padding: '10px', color: '#38bdf8', fontWeight: 600 }}>{s.nextRun}</td>
                    <td style={{ padding: '10px' }}>{s.periodicity}</td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '3px 8px', borderRadius: '6px', background: isDark ? 'rgba(59, 130, 246, 0.15)' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8', fontWeight: 600 }}>{s.canal}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Recorrentes') {
    const recurring = [
      { id: 'REC-01', name: 'Apuração do IVA Mensal Modelo 1', schedule: 'Todo dia 25 do mês', employee: 'Perito Fiscal & IVA', sla: '< 2 horas', status: 'Ativo' },
      { id: 'REC-02', name: 'Processamento de Salários & Folha IRT/INSS', schedule: 'Todo dia 28 do mês', employee: 'Técnico de Processamento Salarial', sla: '< 4 horas', status: 'Ativo' },
      { id: 'REC-03', name: 'Backup & Sincronização de Recibos Auditados SHA-256', schedule: 'Todas as noites às 02:00', employee: 'Auditor de Sistemas & Evidência', sla: '< 30 min', status: 'Ativo' },
      { id: 'REC-04', name: 'Sincronização de Facturas SAFT-AO com AGT', schedule: 'Diário às 23:59', employee: 'Especialista em Integrações ERP', sla: '< 15 min', status: 'Ativo' }
    ];
    return [
      {
        code: 'BOX-TASK-REC-01',
        title: 'Routines & Automações Recorrentes (Cron System)',
        tag: `${recurring.length} Automações Activas`,
        content: (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>AUTOMAÇÃO RECORRENTE</th>
                  <th style={{ padding: '10px' }}>FREQUÊNCIA CRON</th>
                  <th style={{ padding: '10px' }}>AI EMPLOYEE</th>
                  <th style={{ padding: '10px' }}>SLA ESTIMADO</th>
                  <th style={{ padding: '10px' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {recurring.map(r => (
                  <tr key={r.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: isDark ? '#60a5fa' : '#1d4ed8', fontWeight: 700 }}>{r.id}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{r.name}</td>
                    <td style={{ padding: '10px', color: isDark ? '#cbd5e1' : '#475569' }}>{r.schedule}</td>
                    <td style={{ padding: '10px' }}>{r.employee}</td>
                    <td style={{ padding: '10px' }}>{r.sla}</td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '3px 8px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Bloqueadas') {
    const blocked = [
      { id: 'TASK-098', title: 'Validação de Factura Fornecedor Estrangeiro', employee: 'Perito Fiscal & IVA', reason: 'Falta comprovativo de liquidação aduaneira DU', blockedSince: 'Há 2 dias', action: 'Solicitar DU ao Fornecedor' },
      { id: 'TASK-099', title: 'Assinatura Digital de Adenda Contratual', employee: 'Advogado Comercial & Contratos', reason: 'Aguardando aprovação de procuração pelo Conselho', blockedSince: 'Há 4 horas', action: 'Notificar Administrador' }
    ];
    return [
      {
        code: 'BOX-TASK-BLK-01',
        title: 'Tarefas Bloqueadas & Impedimentos Operacionais',
        tag: `${blocked.length} Bloqueadas`,
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {blocked.map(b => (
              <div key={b.id} style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(239, 68, 68, 0.08)' : '#fef2f2', border: isDark ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#f87171' }}>{b.id}</span>
                    <span style={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>{b.title}</span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', fontWeight: 700 }}>Bloqueada</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                    <strong>Motivo do bloqueio:</strong> {b.reason} • <strong>Employee:</strong> {b.employee} • {b.blockedSince}
                  </div>
                </div>
                <button onClick={() => alert(`Ação de desbloqueio disparada para a tarefa ${b.id}: "${b.action}"`)} style={{ padding: '7px 14px', borderRadius: '6px', background: '#ef4444', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.78rem' }}>
                  {b.action}
                </button>
              </div>
            ))}
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Concluídas') {
    const completed = [
      { id: 'TASK-091', title: 'Declaração Modelo 1 IVA - Mês Anterior', employee: 'Perito Fiscal & IVA', duration: '14 min', completedAt: 'Hoje 14:20', hash: 'sha256:7f83b165...9069', output: 'Comprovativo_AGT.pdf' },
      { id: 'TASK-092', title: 'Reconciliação de 4 Contas à Ordem BAI / BFA', employee: 'Contabilista Sénior PGC', duration: '8 min', completedAt: 'Hoje 11:45', hash: 'sha256:a8f9c1b2...e4f1', output: 'Mapa_Reconciliacao.xlsx' },
      { id: 'TASK-093', title: 'Triagem de 14 Leads Recebidas via WhatsApp', employee: 'SDR & Qualificação de Leads', duration: '22 min', completedAt: 'Ontem 18:30', hash: 'sha256:c3d4e5f6...3b21', output: 'CRM_Leads_Report.csv' },
      { id: 'TASK-094', title: 'Minuta de Acordo de Confidencialidade (NDA)', employee: 'Advogado Comercial & Contratos', duration: '6 min', completedAt: 'Ontem 16:10', hash: 'sha256:e3b0c442...855', output: 'NDA_Parceiro_Tecnologico.docx' }
    ];
    return [
      {
        code: 'BOX-TASK-CMP-01',
        title: 'Histórico de Tarefas Concluídas & Recibos de Evidência',
        tag: `${completed.length} Tarefas Recentes`,
        content: (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>TAREFA</th>
                  <th style={{ padding: '10px' }}>AI EMPLOYEE</th>
                  <th style={{ padding: '10px' }}>TEMPO EXECUÇÃO</th>
                  <th style={{ padding: '10px' }}>DATA / HORA</th>
                  <th style={{ padding: '10px' }}>RECIBO SHA-256</th>
                  <th style={{ padding: '10px' }}>OUTPUT ENTREGUE</th>
                </tr>
              </thead>
              <tbody>
                {completed.map(c => (
                  <tr key={c.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: isDark ? '#60a5fa' : '#1d4ed8', fontWeight: 700 }}>{c.id}</td>
                    <td style={{ padding: '10px', fontWeight: 700 }}>{c.title}</td>
                    <td style={{ padding: '10px' }}>{c.employee}</td>
                    <td style={{ padding: '10px', color: '#4ade80', fontWeight: 700 }}>{c.duration}</td>
                    <td style={{ padding: '10px' }}>{c.completedAt}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b' }}>{c.hash}</td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => alert(`Download do ficheiro ${c.output} iniciado.`)} style={{ padding: '4px 10px', borderRadius: '6px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#eff6ff', border: isDark ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid #bfdbfe', color: isDark ? '#60a5fa' : '#1d4ed8', fontWeight: 700, fontSize: '0.74rem', cursor: 'pointer' }}>
                        📥 {c.output}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Equipa') {
    const departments = [
      { name: 'Finanças & Contabilidade', activeRoles: 8, pendingTasks: 4, efficiency: '99.4%', leadRole: 'Contabilista Sénior PGC' },
      { name: 'Fiscalidade & Tributação', activeRoles: 6, pendingTasks: 3, efficiency: '100%', leadRole: 'Perito Fiscal & IVA' },
      { name: 'Jurídico & Compliance', activeRoles: 4, pendingTasks: 2, efficiency: '98.8%', leadRole: 'Advogado Comercial & Contratos' },
      { name: 'Vendas & Atendimento Omnichannel', activeRoles: 10, pendingTasks: 8, efficiency: '99.1%', leadRole: 'SDR & Qualificação de Leads' },
      { name: 'Operações & Logística', activeRoles: 5, pendingTasks: 1, efficiency: '100%', leadRole: 'Gestor de Frotas & Rastreio' }
    ];
    return [
      {
        code: 'BOX-TASK-EQ-01',
        title: 'Distribuição Operacional da Equipa Digital (500 Roles)',
        tag: '5 Departamentos em Produção',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {departments.map((d, i) => (
              <div key={i} style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: isDark ? '#f8fafc' : '#0f172a' }}>{d.name}</div>
                <div style={{ fontSize: '0.76rem', color: isDark ? '#94a3b8' : '#64748b' }}>AI Employee Líder: <strong style={{ color: isDark ? '#60a5fa' : '#1d4ed8' }}>{d.leadRole}</strong></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginTop: '6px', paddingTop: '8px', borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
                  <span>Employees: <strong>{d.activeRoles}</strong></span>
                  <span>Tarefas: <strong>{d.pendingTasks}</strong></span>
                  <span style={{ color: '#4ade80', fontWeight: 700 }}>{d.efficiency} SLA</span>
                </div>
              </div>
            ))}
          </div>
        )
      }
    ];
  }

  // Default: Minha Caixa / Fila Operacional
  return [
    {
      code: 'BOX-TASK-01-01',
      title: 'Área de Atribuição Directa & Fila de Tarefas Operacionais',
      tag: `${filteredTasks.length} Tarefas`,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* INLINE TASK ASSIGNMENT AREA */}
          <form onSubmit={handleCreateTask} style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#eff6ff', border: isDark ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 800, color: isDark ? '#60a5fa' : '#1d4ed8', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={18} /> Área de Atribuição Directa de Tarefas a AI Employees (500 Roles)
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 0.8fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Título da Tarefa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Auditoria de Imposto Modelo 1 do IVA..."
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.82rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Atribuir ao AI Employee (500 Roles) *</label>
                <select
                  value={selectedRole}
                  onChange={e => setSelectedRole(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  {CANONICAL_500_ROLES.map((r, i) => (
                    <option key={i} value={r.display_name}>{r.role_key} — {r.display_name} ({r.department})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: isDark ? '#cbd5e1' : '#475569', marginBottom: '4px', display: 'block' }}>Prioridade SLA</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.82rem' }}
                >
                  <option value="Alta">Alta (SLA &lt; 15 min)</option>
                  <option value="Normal">Normal (SLA &lt; 1h)</option>
                  <option value="Crítica">Crítica (SLA Imediato)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Instruções adicionais & regras do SOP para o funcionário digital..."
                value={instruction}
                onChange={e => setInstruction(e.target.value)}
                style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a', outline: 'none', fontSize: '0.82rem' }}
              />
              <button type="submit" style={{ padding: '8px 18px', borderRadius: '6px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' }}>
                🚀 Atribuir & Disparar Tarefa
              </button>
            </div>
          </form>

          {/* TASKS TABLE SEARCH & HEADER */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f1f5f9', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', flex: 1 }}>
              <Search size={14} color="#64748b" />
              <input
                type="text"
                placeholder="Pesquisar tarefas na fila por nome ou AI Employee..."
                value={filterText}
                onChange={e => setFilterText(e.target.value)}
                style={{ background: 'transparent', border: 'none', outline: 'none', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.8rem', width: '100%' }}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '8px' }}>ID</th>
                  <th style={{ padding: '8px' }}>TAREFA</th>
                  <th style={{ padding: '8px' }}>AI EMPLOYEE ATRIBUÍDO</th>
                  <th style={{ padding: '8px' }}>PRIORIDADE</th>
                  <th style={{ padding: '8px' }}>ESTADO</th>
                  <th style={{ padding: '8px' }}>PROGRESSO</th>
                  <th style={{ padding: '8px' }}>ACÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    <td style={{ padding: '10px 8px', fontFamily: 'monospace', color: isDark ? '#60a5fa' : '#1d4ed8', fontWeight: 700 }}>{task.id}</td>
                    <td style={{ padding: '10px 8px', fontWeight: 700 }}>{task.title}</td>
                    <td style={{ padding: '10px 8px' }}>{task.employee}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: task.priority === 'Crítica' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: task.priority === 'Crítica' ? '#f87171' : '#60a5fa' }}>
                        {task.priority}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: 600 }}>{task.status}</td>
                    <td style={{ padding: '10px 8px', color: '#4ade80', fontWeight: 700 }}>{task.progress}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <button onClick={() => nav?.navigateToArea('TASK-02')} style={{ padding: '4px 8px', borderRadius: '4px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8', border: 'none', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>
                        Ver Detalhe
                      </button>
                    </td>
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

export const TaskDetailScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Resumo');
  const nav = useNavigation();
  const isDark = useIsDark();

  return (
    <ScreenLayout
      moduleCode="TASK-02"
      title="Detalhe da Tarefa"
      subtitle="Visão integral da tarefa, com input, anexos, Employee, SOP, fontes, execução, output, revisão e entrega."
      breadcrumbs={['Trabalho', 'Tarefa', 'Detalhe']}
      buttons={[
        { label: 'Executar', primary: true, onClick: () => setActiveTab('Execuções') },
        { label: 'Pausar', onClick: () => alert('Tarefa TASK-02 pausada temporariamente.') },
        { label: 'Fornecer Dados', onClick: () => setActiveTab('Inputs') },
        { label: 'Aprovar', onClick: () => nav?.navigateToArea('TASK-06') },
        { label: 'Pedir Revisão', onClick: () => setActiveTab('Revisões') },
        { label: 'Cancelar', danger: true, onClick: () => { if (confirm('Deseja realmente cancelar esta tarefa?')) alert('Tarefa cancelada.'); } }
      ]}
      kpis={[
        { label: 'Estado', value: 'IN_PROGRESS', change: 'Passo 3/5', statusColor: COLORS.operacao },
        { label: 'Risco', value: 'BAIXO', change: 'Conforme SOP', statusColor: COLORS.sucesso },
        { label: 'Progresso', value: '60%', change: 'Em andamento', statusColor: COLORS.ia },
        { label: 'SLA', value: '12m restantes', change: 'Dentro do prazo', statusColor: COLORS.sucesso }
      ]}
      tabs={['Resumo', 'Inputs', 'Execuções', 'Conhecimento', 'Tools', 'Output', 'Aprovações', 'Revisões']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForTaskDetail(activeTab, isDark, nav)}
      promptsBase={['MPR-010', 'MPR-011', 'MPR-013', 'MPR-017', 'MPR-020']}
      inventoryButtons={['01 Executar', '02 Pausar', '03 Fornecer Dados', '04 Aprovar', '05 Pedir Revisão', '06 Cancelar']}
      inventoryKpis={['01 Estado', '02 Risco', '03 Progresso', '04 SLA']}
      inventoryTabs={['01 Resumo', '02 Inputs', '03 Execuções', '04 Conhecimento', '05 Tools', '06 Output']}
    />
  );
};

function getBoxesForTaskDetail(activeTab: string, isDark: boolean, nav: any) {
  if (activeTab === 'Inputs') {
    return [
      {
        code: 'BOX-TD-INP-01',
        title: 'Dados de Entrada & Ficheiros Anexados',
        tag: '2 Ficheiros Carregados',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.6)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '0.85rem' }}>Prompt Original / Instrução:</div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.5 }}>
                "Por favor, proceda à auditoria das facturas emitidas em Agosto de 2026, conferindo o cálculo do IVA à taxa de 14%, verificando o preenchimento dos campos obrigatórios da declaração Modelo 1 e confrontando os valores com o balancete de razão da conta 24."
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>📄 Facturacao_Agosto_2026.xlsx</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>2.4 MB • SHA-256 verificado</div>
                </div>
                <button onClick={() => alert('Ficheiro aberto para inspecção.')} style={{ padding: '4px 10px', borderRadius: '4px', background: '#3b82f6', color: '#fff', border: 'none', fontSize: '0.74rem', cursor: 'pointer' }}>Ver</button>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>📑 Balancete_Razao_Conta24.pdf</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>1.1 MB • Certificado digital</div>
                </div>
                <button onClick={() => alert('Ficheiro aberto para inspecção.')} style={{ padding: '4px 10px', borderRadius: '4px', background: '#3b82f6', color: '#fff', border: 'none', fontSize: '0.74rem', cursor: 'pointer' }}>Ver</button>
              </div>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Execuções') {
    return [
      {
        code: 'BOX-TD-EXE-01',
        title: 'Timeline de Execuções & Runtime Gemini Router',
        tag: '3 Passos Executados',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(34, 197, 94, 0.1)' : '#dcfce7', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.84rem' }}>✓ Passo 1: Extracção e Parsing de Ficheiros (OCR & Sheets)</div>
                <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b' }}>Executado em 420ms • 142 facturas identificadas com sucesso</div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#22c55e', color: '#fff' }}>CONCLUÍDO</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(34, 197, 94, 0.1)' : '#dcfce7', border: '1px solid rgba(34, 197, 94, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.84rem' }}>✓ Passo 2: Confrontação com Tabela de Taxas CIVA Angola (14% e Isenções)</div>
                <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b' }}>Executado em 880ms • 100% de conformidade com artigo 12.º do CIVA</div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#22c55e', color: '#fff' }}>CONCLUÍDO</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#dbeafe', border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: '0.84rem' }}>⟳ Passo 3: Geração da Minuta da Declaração Modelo 1 e Mapa de Retenções</div>
                <div style={{ fontSize: '0.74rem', color: isDark ? '#94a3b8' : '#64748b' }}>Em processamento pelo AI Employee (Perito Fiscal & IVA)...</div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#3b82f6', color: '#fff' }}>EM CURSO</span>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Conhecimento') {
    return [
      {
        code: 'BOX-TD-KNO-01',
        title: 'Bases de Conhecimento & Regulamentação Aplicada nesta Tarefa',
        tag: '3 Fontes Canónicas',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>Código do IVA de Angola (CIVA) — Lei n.º 7/19</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Artigos 12.º a 18.º (Regime Geral e Isenções) • Hash verificado</div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>OFICIAL AGT</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>Plano Geral de Contabilidade (PGC Angola)</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Regras de movimentação da Conta 24 (Estado e Outros Entes Públicos)</div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>NORMA VINCULATIVA</span>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>Manual Interno de Fecho Fiscal & Procedimentos da Empresa</div>
                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Regras de retenção na fonte de 6.5% sobre serviços prestados</div>
              </div>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>INTERNO PRIVADO</span>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Tools') {
    return [
      {
        code: 'BOX-TD-TLS-01',
        title: 'Ferramentas de Execução & APIs Convocadas',
        tag: '4 Tools Invocadas',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>🔧 primavera_erp_connector.fetch_entries()</div>
              <div style={{ fontSize: '0.74rem', color: '#4ade80', marginTop: '4px' }}>Status: 200 OK • 142 registos lidos</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>🔧 agt_tax_validator.verify_nif()</div>
              <div style={{ fontSize: '0.74rem', color: '#4ade80', marginTop: '4px' }}>Status: 100% NIFs válidos na base AGT</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>🔧 pdf_engine.compile_audit_report()</div>
              <div style={{ fontSize: '0.74rem', color: '#38bdf8', marginTop: '4px' }}>Status: Relatório pronto para preview</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>🔧 evidence_hasher.generate_sha256()</div>
              <div style={{ fontSize: '0.74rem', color: '#a78bfa', marginTop: '4px' }}>Hash: 7f83b165...9069 selado</div>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Output') {
    return [
      {
        code: 'BOX-TD-OUT-01',
        title: 'Resultado Final Produzido & Ficheiros de Entrega',
        tag: 'Pronto para Aprovação',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '16px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px' }}>Resumo Executivo do Relatório de IVA:</div>
              <div style={{ fontSize: '0.82rem', color: isDark ? '#cbd5e1' : '#475569', lineHeight: 1.6 }}>
                • Total de Facturação Bruta Auditada: <strong>Kz 48.250.000,00</strong><br />
                • IVA Liquidado à taxa normal de 14%: <strong>Kz 6.755.000,00</strong><br />
                • IVA Suportado em Aquisições Dedutíveis: <strong>Kz 2.140.000,00</strong><br />
                • Retenção na Fonte de IVA Sofrida (Clientes Públicos): <strong>Kz 1.200.000,00</strong><br />
                • <strong>IVA Líquido a Entregar ao Estado: Kz 3.415.000,00</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => alert('Download do Relatório de Auditoria de IVA iniciado.')} style={{ padding: '8px 16px', borderRadius: '6px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                📥 Descarregar Relatório Completo (PDF)
              </button>
              <button onClick={() => nav?.navigateToArea('TASK-06')} style={{ padding: '8px 16px', borderRadius: '6px', background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
                ✓ Submeter para Aprovação HITL
              </button>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Aprovações') {
    return [
      {
        code: 'BOX-TD-APR-01',
        title: 'Controlo de Aprovação Humana (Human-In-The-Loop)',
        tag: 'Pendente Aprovação',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(234, 179, 8, 0.1)' : '#fef9c3', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
              <div style={{ fontWeight: 800, color: '#ca8a04', fontSize: '0.88rem' }}>⚠️ Esta acção requer validação de um Director Financeiro ou Sócio-Gerente</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#cbd5e1' : '#713f12', marginTop: '4px' }}>
                O envio da declaração fiscal à AGT tem efeitos fiscais imediatos e vinculativos sobre o NIF da empresa.
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button onClick={() => alert('Aprovado com sucesso! A declaração foi autorizada para submissão.')} style={{ padding: '9px 20px', borderRadius: '8px', background: '#16a34a', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>
                ✓ Aprovar Agora
              </button>
              <button onClick={() => alert('Item devolvido ao AI Employee para correcção.')} style={{ padding: '9px 20px', borderRadius: '8px', background: '#ef4444', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.82rem' }}>
                ✕ Rejeitar & Pedir Ajuste
              </button>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Revisões') {
    return [
      {
        code: 'BOX-TD-REV-01',
        title: 'Histórico de Notas, Revisões & Feedback Humano',
        tag: '2 Revisões Registadas',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b' }}>
                <strong>Victorino Aguiar (Gestor)</strong>
                <span>Hoje 11:15</span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
                "Favor verificar se as facturas dos prestadores de serviços de TI do exterior foram devidamente sujeitas a retenção de 6.5%."
              </p>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', border: isDark ? '1px solid rgba(59, 130, 246, 0.25)' : '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#3b82f6' }}>
                <strong>AI Employee (Perito Fiscal & IVA)</strong>
                <span>Hoje 11:18</span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.82rem', color: isDark ? '#f8fafc' : '#0f172a' }}>
                "Revisto. Foram localizadas 3 facturas de prestadores não residentes. Aplicado o artigo 67.º do Código do IRT com taxa liberatória de 6.5% sobre o valor tributável."
              </p>
            </div>
          </div>
        )
      }
    ];
  }

  // Default: Resumo
  return [
    {
      code: 'BOX-TD-RES-01',
      title: 'Resumo Geral da Tarefa & Estado do Workflow',
      tag: 'TASK-102 • Em Execução',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>AI EMPLOYEE RESPONSÁVEL</div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginTop: '2px', color: isDark ? '#60a5fa' : '#1d4ed8' }}>Perito Fiscal & IVA</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>SLA RESTANTE</div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginTop: '2px', color: '#4ade80' }}>12 minutos</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>NÍVEL DE AUTONOMIA</div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', marginTop: '2px', color: '#facc15' }}>L3 — Semi-Autónomo (HITL)</div>
            </div>
          </div>
          <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.3)' : '#ffffff', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #cbd5e1' }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '8px' }}>Checklist de Execução do Procedimento (SOP):</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
              <div>✅ 1. Recepção dos ficheiros e validação de assinatura digital</div>
              <div>✅ 2. Parsing das facturas emitidas e recebidas</div>
              <div>🔄 3. Confrontação com regras fiscais do CIVA e PGC (60% concluído)</div>
              <div style={{ color: '#64748b' }}>⏳ 4. Geração da declaração e mapa de suporte</div>
              <div style={{ color: '#64748b' }}>⏳ 5. Submissão para aprovação humana e arquivo auditado</div>
            </div>
          </div>
        </div>
      )
    }
  ];
}

export const RuntimeRouterScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Routing');

  return (
    <ScreenLayout
      moduleCode="RUN-01"
      title="Runtime & Model Router"
      subtitle="Controlar provider/model, routing mode, fallback, contexto, tools e recibo de execução."
      breadcrumbs={['Trabalho', 'Execução', 'Runtime']}
      buttons={[
        { label: 'Executar Agora', primary: true, onClick: () => setActiveTab('Receipt') },
        { label: 'Trocar Modelo', onClick: () => setActiveTab('Routing') },
        { label: 'Testar Fallback', onClick: () => setActiveTab('Fallback') },
        { label: 'Ver Contexto', onClick: () => setActiveTab('Contexto') },
        { label: 'Abrir Receipt', onClick: () => setActiveTab('Receipt') }
      ]}
      kpis={[
        { label: 'Provider', value: 'GOOGLE_GEMINI', change: 'Primário activo', statusColor: COLORS.sucesso },
        { label: 'Modelo', value: 'gemini-1.5-pro', change: 'v1.5 Baseline', statusColor: COLORS.ia },
        { label: 'Latência', value: '420 ms', change: 'Rápido', statusColor: COLORS.sucesso },
        { label: 'Custo', value: '$0.0014', change: '1,200 tokens', statusColor: COLORS.operacao }
      ]}
      tabs={['Routing', 'Contexto', 'Tools', 'Fallback', 'Usage', 'Receipt']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-RUN-01-01', title: 'Model Binding' },
        { code: 'BOX-RUN-01-02', title: 'Routing Rules' },
        { code: 'BOX-RUN-01-03', title: 'Knowledge Context' },
        { code: 'BOX-RUN-01-04', title: 'Tool Calls' },
        { code: 'BOX-RUN-01-05', title: 'Token/Cost Breakdown' }
      ]}
      promptsBase={['MPR-011', 'MPR-014', 'MPR-017']}
      inventoryButtons={['01 Executar Agora', '02 Trocar Modelo', '03 Testar Fallback', '04 Ver Contexto', '05 Abrir Receipt']}
      inventoryKpis={['01 Provider', '02 Modelo', '03 Latência', '04 Custo']}
      inventoryTabs={['01 Routing', '02 Contexto', '03 Tools', '04 Fallback', '05 Usage', '06 Receipt']}
    />
  );
};

export const EvidenceGateScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Execuções');

  return (
    <ScreenLayout
      moduleCode="RUN-02"
      title="Evidence Gate: MOCK vs REAL_API"
      subtitle="Separar execução simulada de execução real e impedir certificação ou custo baseado em mocks disfarçados."
      breadcrumbs={['Trabalho', 'Execução', 'Evidência']}
      buttons={[
        { label: 'Filtrar REAL_API', primary: true, onClick: () => setActiveTab('Execuções') },
        { label: 'Filtrar MOCK', onClick: () => setActiveTab('Evidence Gate') },
        { label: 'Revalidar', onClick: () => alert('Revalidação concluída: 100% de conformidade com Evidence Gate.') },
        { label: 'Abrir Evidência', onClick: () => setActiveTab('Certificação') },
        {
          label: 'Exportar Receipt',
          onClick: () => {
            const csv = 'Execucao_ID,Modo,Provider,Status,Evidence_Hash\nRUN-801,REAL_API,GOOGLE_GEMINI,VERIFIED,a8f9c1b2\nRUN-802,REAL_API,GOOGLE_GEMINI,VERIFIED,c3d4e5f6';
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'evidence_receipts.csv';
            link.click();
            URL.revokeObjectURL(url);
          }
        }
      ]}
      kpis={[
        { label: 'REAL_API', value: '3,410', change: 'Execuções Reais', statusColor: COLORS.sucesso },
        { label: 'MOCK', value: '142', change: 'Modo Simulação', statusColor: COLORS.revisao },
        { label: 'UNKNOWN', value: '0', change: 'Zero inconsistências', statusColor: COLORS.sucesso },
        { label: 'Falhas de evidence gate', value: '0', change: 'Certificado PASS', statusColor: COLORS.sucesso }
      ]}
      tabs={['Execuções', 'Evidence Gate', 'Legacy', 'Custos', 'Certificação']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-RUN-02-01', title: 'Execution Mode badge' },
        { code: 'BOX-RUN-02-02', title: 'Provider evidence' },
        { code: 'BOX-RUN-02-03', title: 'Usage metadata' },
        { code: 'BOX-RUN-02-04', title: 'Legacy unknown queue' },
        { code: 'BOX-RUN-02-05', title: 'Evidence exceptions' }
      ]}
      promptsBase={['MPR-032']}
      inventoryButtons={['01 Filtrar REAL_API', '02 Filtrar MOCK', '03 Revalidar', '04 Abrir Evidência', '05 Exportar Receipt']}
      inventoryKpis={['01 REAL_API', '02 MOCK', '03 UNKNOWN', '04 Falhas de evidence gate']}
      inventoryTabs={['01 Execuções', '02 Evidence Gate', '03 Legacy', '04 Custos', '05 Certificação']}
    />
  );
};

export const RemoteCommandsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Comandos');

  return (
    <ScreenLayout
      moduleCode="RCODE-01"
      title="Comandos Remotos & Fila Offline"
      subtitle="Receber comandos de telefone/mensageria, executar em cloud ou aguardar dispositivo local ficar online."
      breadcrumbs={['Trabalho', 'Comandos Remotos']}
      buttons={[
        { label: 'Novo Comando', primary: true, onClick: () => setActiveTab('Comandos') },
        { label: 'Aprovar Comando', onClick: () => setActiveTab('Receipts') },
        { label: 'Cancelar', danger: true, onClick: () => { if (confirm('Deseja cancelar o comando seleccionado?')) alert('Comando cancelado.'); } },
        { label: 'Reprocessar', onClick: () => alert('Fila offline reprocessada. 3 comandos sincronizados com sucesso.') },
        { label: 'Registar Dispositivo', onClick: () => setActiveTab('Dispositivos') }
      ]}
      kpis={[
        { label: 'Recebidos', value: '84', change: 'Comandos remotos', statusColor: COLORS.operacao },
        { label: 'WAITING_FOR_DEVICE', value: '3', change: 'Fila Offline', statusColor: COLORS.revisao },
        { label: 'Em execução', value: '5', change: 'Processando em Cloud', statusColor: COLORS.ia },
        { label: 'Falhados', value: '0', change: 'Zero falhas', statusColor: COLORS.sucesso }
      ]}
      tabs={['Comandos', 'Dispositivos', 'Fila Offline', 'Heartbeats', 'Receipts']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-RCODE-01-01', title: 'Command composer' },
        { code: 'BOX-RCODE-01-02', title: 'Device list' },
        { code: 'BOX-RCODE-01-03', title: 'Offline queue' },
        { code: 'BOX-RCODE-01-04', title: 'Risk badge' },
        { code: 'BOX-RCODE-01-05', title: 'Execution receipt' }
      ]}
      promptsBase={['MPR-008', 'MPR-009']}
      inventoryButtons={['01 Novo Comando', '02 Aprovar Comando', '03 Cancelar', '04 Reprocessar', '05 Registar Dispositivo']}
      inventoryKpis={['01 Recebidos', '02 WAITING_FOR_DEVICE', '03 Em execução', '04 Falhados']}
      inventoryTabs={['01 Comandos', '02 Dispositivos', '03 Fila Offline', '04 Heartbeats', '05 Receipts']}
    />
  );
};

export const ApprovalsCenterScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Pendentes');
  const isDark = useIsDark();
  const nav = useNavigation();

  const [approvalList, setApprovalList] = useState([
    { id: 'APR-501', title: 'Submissão de Declaração Modelo 1 IVA à AGT', employee: 'Perito Fiscal & IVA', requestedBy: 'AI Employee', risk: 'Crítica', value: 'Kz 3.415.000', deadline: 'Hoje às 17:30', isMine: true, status: 'Pendente' },
    { id: 'APR-502', title: 'Transferência Bancária para Liquidação de Fornecedor', employee: 'Gestor de Contas a Pagar', requestedBy: 'AI Employee', risk: 'Crítica', value: 'Kz 8.200.000', deadline: 'Hoje às 16:00', isMine: true, status: 'Pendente' },
    { id: 'APR-503', title: 'Publicação de Comunicado Institucional no LinkedIn', employee: 'Social Media & Brand Voice', requestedBy: 'AI Employee', risk: 'Média', value: 'N/A', deadline: 'Amanhã às 09:00', isMine: false, status: 'Pendente' },
    { id: 'APR-504', title: 'Envio de Proposta Comercial a Cliente Enterprise', employee: 'SDR & Qualificação de Leads', requestedBy: 'AI Employee', risk: 'Alta', value: 'Kz 14.500.000', deadline: 'Hoje às 19:00', isMine: true, status: 'Pendente' },
    { id: 'APR-505', title: 'Admissão e Emissão de Contrato de Trabalho CLT/LGT', employee: 'Especialista em Admissão & Onboarding', requestedBy: 'AI Employee', risk: 'Alta', value: 'Kz 650.000/mês', deadline: '16/09 às 12:00', isMine: false, status: 'Pendente' }
  ]);

  const handleApprove = (id: string) => {
    setApprovalList(prev => prev.map(a => a.id === id ? { ...a, status: 'Aprovado' } : a));
    alert(`Item ${id} aprovado com sucesso com assinatura digital e hash de auditoria.`);
  };

  const handleReject = (id: string) => {
    setApprovalList(prev => prev.map(a => a.id === id ? { ...a, status: 'Rejeitado' } : a));
    alert(`Item ${id} rejeitado e encaminhado ao AI Employee com nota de revisão.`);
  };

  const pendingItems = approvalList.filter(a => a.status === 'Pendente');
  const criticalItems = approvalList.filter(a => a.risk === 'Crítica' && a.status === 'Pendente');
  const myItems = approvalList.filter(a => a.isMine && a.status === 'Pendente');
  const historyItems = approvalList.filter(a => a.status !== 'Pendente');

  return (
    <ScreenLayout
      moduleCode="APR-01"
      title="Centro de Aprovações & Human-In-The-Loop (HITL)"
      subtitle="Fila central de decisões executivas: documentos, mensagens, pagamentos, submissões fiscais e mudanças críticas."
      breadcrumbs={['Trabalho', 'Aprovações']}
      buttons={[
        { label: 'Aprovar Todos Elegíveis', primary: true, onClick: () => {
          setApprovalList(prev => prev.map(a => a.status === 'Pendente' ? { ...a, status: 'Aprovado' } : a));
          alert('Todas as decisões pendentes elegíveis foram aprovadas com evidência auditada.');
        }},
        { label: 'Rejeitar Seleccionado', danger: true, onClick: () => {
          if (pendingItems.length > 0) handleReject(pendingItems[0].id);
        }},
        { label: 'Modificar Limites', onClick: () => nav?.navigateToArea('INT-02') },
        { label: 'Ver Histórico Completo', onClick: () => setActiveTab('Histórico') },
        { label: 'Exportar Audit Log', onClick: () => {
          const csv = 'ID,Titulo,Employee,Risco,Valor,Estado\n' + approvalList.map(a => `"${a.id}","${a.title}","${a.employee}","${a.risk}","${a.value}","${a.status}"`).join('\n');
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'aprovacoes_audit_log.csv';
          link.click();
          URL.revokeObjectURL(url);
        }}
      ]}
      kpis={[
        { label: 'Pendentes', value: pendingItems.length, change: 'Aguardando decisão', statusColor: COLORS.revisao },
        { label: 'Críticas', value: criticalItems.length, change: 'Submissão fiscal / PG', statusColor: COLORS.risco },
        { label: 'Minhas', value: myItems.length, change: 'Atribuídas a si', statusColor: COLORS.operacao },
        { label: 'Decididas', value: historyItems.length + 148, change: 'Histórico auditado', statusColor: COLORS.sucesso }
      ]}
      tabs={['Pendentes', 'Minhas', 'Críticas', 'Histórico']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForApprovals(activeTab, isDark, pendingItems, criticalItems, myItems, historyItems, handleApprove, handleReject)}
      promptsBase={['MPR-007', 'MPR-011', 'MPR-023', 'MPR-033']}
      inventoryButtons={['01 Aprovar', '02 Rejeitar', '03 Modificar', '04 Escalar', '05 Abrir Evidência']}
      inventoryKpis={['01 Pendentes', '02 Críticas', '03 Expiram hoje', '04 Rejeitadas']}
      inventoryTabs={['01 Pendentes', '02 Minhas', '03 Críticas', '04 Histórico']}
    />
  );
};

function getBoxesForApprovals(
  activeTab: string,
  isDark: boolean,
  pendingItems: any[],
  criticalItems: any[],
  myItems: any[],
  historyItems: any[],
  handleApprove: (id: string) => void,
  handleReject: (id: string) => void
) {
  let displayList: any[] = [];
  let title = '';
  let tag = '';

  if (activeTab === 'Minhas') {
    displayList = myItems;
    title = 'Minhas Decisões Pendentes de Validação';
    tag = `${myItems.length} Itens Directos`;
  } else if (activeTab === 'Críticas') {
    displayList = criticalItems;
    title = 'Decisões Críticas com Alto Impacto Fiscal ou Financeiro';
    tag = `${criticalItems.length} Itens Críticos`;
  } else if (activeTab === 'Histórico') {
    displayList = [
      ...historyItems,
      { id: 'APR-490', title: 'Envio de Proposta Comercial Marvine Tech', employee: 'SDR & Leads', risk: 'Alta', value: 'Kz 8.500.000', deadline: 'Hoje 10:15', status: 'Aprovado' },
      { id: 'APR-489', title: 'Liquidação de Fatura de Energia ENDE', employee: 'Contas a Pagar', risk: 'Média', value: 'Kz 1.250.000', deadline: 'Ontem 17:00', status: 'Aprovado' },
      { id: 'APR-488', title: 'Modificação de Política de Descontos', employee: 'Pricing Manager', risk: 'Crítica', value: 'N/A', deadline: 'Ontem 14:00', status: 'Rejeitado' }
    ];
    title = 'Histórico de Decisões Auditadas & Evidência HITL';
    tag = `${displayList.length} Registos Passados`;
  } else {
    displayList = pendingItems;
    title = 'Fila Geral de Aprovações Pendentes (Human-in-the-loop)';
    tag = `${pendingItems.length} Pendentes`;
  }

  return [
    {
      code: 'BOX-APR-01-01',
      title,
      tag,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {displayList.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontSize: '0.88rem' }}>
              🎉 Nenhuma aprovação pendente nesta categoria no momento.
            </div>
          ) : (
            displayList.map(item => (
              <div key={item.id} style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: isDark ? '#60a5fa' : '#1d4ed8' }}>{item.id}</span>
                    <span style={{ fontWeight: 800, color: isDark ? '#f8fafc' : '#0f172a' }}>{item.title}</span>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: item.risk === 'Crítica' ? 'rgba(239, 68, 68, 0.15)' : item.risk === 'Alta' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: item.risk === 'Crítica' ? '#f87171' : item.risk === 'Alta' ? '#facc15' : '#60a5fa', fontWeight: 700 }}>
                      Risco {item.risk}
                    </span>
                    {item.status !== 'Pendente' && (
                      <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', background: item.status === 'Aprovado' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: item.status === 'Aprovado' ? '#4ade80' : '#f87171', fontWeight: 700 }}>
                        {item.status}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>
                    Proposto por: <strong>{item.employee}</strong> • Impacto financeiro: <strong>{item.value}</strong> • Prazo SLA: <strong>{item.deadline}</strong>
                  </div>
                </div>

                {item.status === 'Pendente' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleApprove(item.id)} style={{ padding: '8px 16px', borderRadius: '8px', background: '#16a34a', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.8rem', boxShadow: '0 2px 8px rgba(22, 163, 74, 0.3)' }}>
                      ✓ Aprovar
                    </button>
                    <button onClick={() => handleReject(item.id)} style={{ padding: '8px 14px', borderRadius: '8px', background: 'transparent', border: isDark ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid #fca5a5', color: '#ef4444', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                      ✕ Rejeitar
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )
    }
  ];
}

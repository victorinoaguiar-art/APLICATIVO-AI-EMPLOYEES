import React, { useState } from 'react';
import { ScreenLayout, COLORS, useIsDark } from '../ui/DesignSystem';
import { useNavigation } from '../NavigationContext';

export const OmnichannelScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const nav = useNavigation();
  const isDark = useIsDark();

  return (
    <ScreenLayout
      moduleCode="COM-01"
      title="Comunicações Omnichannel"
      subtitle="Visão única de WhatsApp, email, redes sociais, leads, reclamações, ficheiros e tarefas geradas por canais."
      breadcrumbs={['Comunicações', 'Omnichannel']}
      buttons={[
        {
          label: 'Nova Mensagem',
          primary: true,
          onClick: () => {
            const dest = prompt('Destinatário ou Canal (Ex: +244 923 000 000 ou cliente@empresa.ao):');
            if (dest) alert(`Canal aberto para envio para ${dest}.`);
          }
        },
        { label: 'Criar Tarefa', onClick: () => nav?.navigateToArea('TASK-01') },
        { label: 'Filtrar Canal', onClick: () => setActiveTab('Threads') },
        { label: 'Abrir Inbox', onClick: () => setActiveTab('Inbox') },
        {
          label: 'Gerar Relatório',
          onClick: () => {
            const csv = 'Canal,Mensagens,Leads,Resolucao,Status\nWhatsApp,890,28,99.2%,Activo\nEmail,380,14,100%,Activo\nRedes Sociais,840,42,98.5%,Activo';
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'relatorio_omnichannel.csv';
            link.click();
            URL.revokeObjectURL(url);
          }
        }
      ]}
      kpis={[
        { label: 'Mensagens', value: '1,420', change: 'Todas as plataformas', statusColor: COLORS.operacao },
        { label: 'Emails', value: '380', change: 'Inbound / Outbound', statusColor: COLORS.ia },
        { label: 'Eventos sociais', value: '840', change: 'Comments & DMs', statusColor: COLORS.conhecimento },
        { label: 'Leads', value: '42', change: 'Captadas por AI', statusColor: COLORS.sucesso }
      ]}
      tabs={['Overview', 'Inbox', 'Threads', 'Leads', 'Complaints', 'Files', 'Analytics']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForOmnichannel(activeTab, isDark, nav)}
      promptsBase={['MPR-033', 'MPR-009']}
      inventoryButtons={['01 Nova Mensagem', '02 Criar Tarefa', '03 Filtrar Canal', '04 Abrir Inbox', '05 Gerar Relatório']}
      inventoryKpis={['01 Mensagens', '02 Emails', '03 Eventos sociais', '04 Leads']}
      inventoryTabs={['01 Overview', '02 Inbox', '03 Threads', '04 Leads', '05 Complaints', '06 Files']}
    />
  );
};

function getBoxesForOmnichannel(activeTab: string, isDark: boolean, _nav?: ReturnType<typeof useNavigation>) {
  if (activeTab === 'Inbox') {
    const messages = [
      { id: 'MSG-01', channel: 'WhatsApp', sender: '+244 923 111 222 (Cliente Luanda)', text: 'Boa tarde, poderiam enviar o catálogo atualizado dos serviços?', time: 'Há 5 min', handledBy: 'SDR Leads Inbound', status: 'Respondido por AI' },
      { id: 'MSG-02', channel: 'Email', sender: 'compras@petroangola.ao', text: 'Solicitação de cotação para auditoria tributária anual.', time: 'Há 22 min', handledBy: 'Especialista em Cotações', status: 'Draft Pronto' },
      { id: 'MSG-03', channel: 'LinkedIn', sender: 'Carlos Mendes (Director TI)', text: 'Gostaria de agendar uma reunião sobre os AI Employees.', time: 'Há 1 hora', handledBy: 'SDR Outbound', status: 'Reunião Marcada' }
    ];
    return [
      {
        code: 'BOX-COM-INB-01',
        title: 'Inbox Unificada Multicanal (Live Feed)',
        tag: `${messages.length} Novas Mensagens`,
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map(m => (
              <div key={m.id} style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '4px', background: m.channel === 'WhatsApp' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)', color: m.channel === 'WhatsApp' ? '#4ade80' : '#60a5fa', fontWeight: 700 }}>
                      {m.channel}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '0.86rem', color: isDark ? '#f8fafc' : '#0f172a' }}>{m.sender}</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>• {m.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: isDark ? '#cbd5e1' : '#475569' }}>"{m.text}"</p>
                  <div style={{ fontSize: '0.72rem', color: isDark ? '#94a3b8' : '#64748b', marginTop: '4px' }}>
                    Processado por: <strong>{m.handledBy}</strong>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Leads') {
    const leads = [
      { name: 'Sonangol Distribuição', contact: 'compras@sonangol.co.ao', channel: 'Email Corporativo', estValue: 'Kz 18.000.000', score: '95/100 (Alta Qualificação)', nextAction: 'Envio de Proposta Formal' },
      { name: 'Clínica Sagrada Esperança', contact: '+244 912 334 455', channel: 'WhatsApp Business', estValue: 'Kz 6.500.000', score: '88/100 (Quente)', nextAction: 'Agendamento de Demonstração' },
      { name: 'Grupo Carrinho', contact: '+244 923 889 900', channel: 'LinkedIn Inbound', estValue: 'Kz 24.000.000', score: '92/100 (Enterprise)', nextAction: 'Reunião com Conselho' }
    ];
    return [
      {
        code: 'BOX-COM-LED-01',
        title: 'Leads Inbound Captadas & Qualificadas por AI Employees',
        tag: `${leads.length} Leads Quentes`,
        content: (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '10px' }}>EMPRESA / LEAD</th>
                  <th style={{ padding: '10px' }}>CANAL DE ORIGEM</th>
                  <th style={{ padding: '10px' }}>VALOR ESTIMADO</th>
                  <th style={{ padding: '10px' }}>QUALIFICAÇÃO</th>
                  <th style={{ padding: '10px' }}>PRÓXIMA ACÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l, i) => (
                  <tr key={i} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    <td style={{ padding: '10px', fontWeight: 800 }}>{l.name}</td>
                    <td style={{ padding: '10px' }}>{l.channel}</td>
                    <td style={{ padding: '10px', color: '#4ade80', fontWeight: 700 }}>{l.estValue}</td>
                    <td style={{ padding: '10px' }}>{l.score}</td>
                    <td style={{ padding: '10px' }}><button onClick={() => alert(`Ação "${l.nextAction}" iniciada.`)} style={{ padding: '4px 10px', borderRadius: '6px', background: '#2563eb', color: '#fff', border: 'none', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 700 }}>{l.nextAction}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Complaints') {
    return [
      {
        code: 'BOX-COM-CMP-01',
        title: 'Fila de Reclamações & Escalamento Prioritário',
        tag: '0 Reclamações Pendentes',
        content: (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isDark ? '#f8fafc' : '#0f172a' }}>Zero reclamações em aberto no canal de atendimento.</div>
            <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>Tempo médio de primeira resposta: <strong>1.4 segundos</strong> com satisfação CSAT de 98.4%.</div>
          </div>
        )
      }
    ];
  }

  // Default: Overview / Threads / Files / Analytics
  return [
    {
      code: 'BOX-COM-OVR-01',
      title: 'Resumo Operacional de Comunicações Multicanal',
      tag: 'Canais Sincronizados',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>WHATSAPP BUSINESS</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#4ade80' }}>890 conversas</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Tempo médio resposta: 2s</div>
            </div>
            <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>EMAIL CORPORATIVO</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isDark ? '#60a5fa' : '#1d4ed8' }}>380 emails</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Classificação por IA: 100%</div>
            </div>
            <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>REDES SOCIAIS (IG / LI)</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#c084fc' }}>840 interacções</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>DMs e Comentários triados</div>
            </div>
          </div>
        </div>
      )
    }
  ];
}

export const WhatsappOperationsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Inbox');
  const nav = useNavigation();
  const isDark = useIsDark();

  return (
    <ScreenLayout
      moduleCode="COM-02"
      title="Operações WhatsApp Business API"
      subtitle="Receber comandos, anexos e voz; resolver identidade; criar tarefas; enviar resultados e approvals."
      breadcrumbs={['Comunicações', 'WhatsApp']}
      buttons={[
        {
          label: 'Enviar Mensagem',
          primary: true,
          onClick: () => {
            const msg = prompt('Mensagem WhatsApp a enviar:');
            if (msg) alert(`Mensagem disparada com sucesso via WhatsApp Business API: "${msg}"`);
          }
        },
        { label: 'Criar Tarefa', onClick: () => nav?.navigateToArea('TASK-01') },
        { label: 'Aprovar Comando', onClick: () => setActiveTab('Aprovações') },
        { label: 'Ver Anexos', onClick: () => setActiveTab('Anexos') },
        { label: 'Responder', onClick: () => setActiveTab('Inbox') }
      ]}
      kpis={[
        { label: 'Mensagens', value: '890', change: 'Conversas activas', statusColor: COLORS.sucesso },
        { label: 'Comandos', value: '64', change: 'Executados por voz/texto', statusColor: COLORS.operacao },
        { label: 'Anexos', value: '124', change: 'Documentos recebidos', statusColor: COLORS.conhecimento },
        { label: 'Falhas', value: '0', change: 'Conexão estável', statusColor: COLORS.sucesso }
      ]}
      tabs={['Inbox', 'Comandos', 'Anexos', 'Tarefas', 'Aprovações', 'Delivery']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForWhatsapp(activeTab, isDark, nav)}
      promptsBase={['MPR-033', 'MPR-008']}
      inventoryButtons={['01 Enviar Mensagem', '02 Criar Tarefa', '03 Aprovar Comando', '04 Ver Anexos', '05 Responder']}
      inventoryKpis={['01 Mensagens', '02 Comandos', '03 Anexos', '04 Falhas']}
      inventoryTabs={['01 Inbox', '02 Comandos', '03 Anexos', '04 Tarefas', '05 Aprovações', '06 Delivery']}
    />
  );
};

function getBoxesForWhatsapp(activeTab: string, isDark: boolean, _nav?: ReturnType<typeof useNavigation>) {
  if (activeTab === 'Comandos') {
    const commands = [
      { id: 'CMD-01', from: '+244 923 000 000 (Victorino Aguiar)', text: 'Envia o balanço do IVA apurado para este mês', parsedIntent: 'TASK_QUERY_IVA_BALANCE', status: 'Executado', result: 'PDF enviado via WhatsApp' },
      { id: 'CMD-02', from: '+244 923 000 000 (Victorino Aguiar)', text: 'Aprova a transferência de Kz 8.200.000 para a Endiama', parsedIntent: 'HITL_APPROVE_PAYMENT', status: 'Executado', result: 'Pagamento autorizado e assinado' },
      { id: 'CMD-03', from: '+244 912 445 566 (Marta Silva)', text: 'Qual o total facturado hoje em Kwanzas?', parsedIntent: 'ANALYTICS_DAILY_REVENUE', status: 'Executado', result: 'Kz 48.250.000 reportados' }
    ];
    return [
      {
        code: 'BOX-WA-CMD-01',
        title: 'Comandos Remotos Recebidos por Mensagem / Áudio',
        tag: `${commands.length} Comandos Processados`,
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {commands.map(c => (
              <div key={c.id} style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Remetente: <strong style={{ color: isDark ? '#f8fafc' : '#0f172a' }}>{c.from}</strong></div>
                  <div style={{ fontWeight: 800, fontSize: '0.86rem', margin: '3px 0' }}>"{c.text}"</div>
                  <div style={{ fontSize: '0.74rem', color: isDark ? '#60a5fa' : '#1d4ed8' }}>Intent reconhecido: {c.parsedIntent} • Resultado: {c.result}</div>
                </div>
                <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>
                  {c.status}
                </span>
              </div>
            ))}
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Anexos') {
    const attachments = [
      { name: 'Comprovativo_Transferencia_BFA_490.pdf', size: '1.2 MB', from: '+244 923 111 222', time: 'Hoje 10:45', hash: 'sha256:7f83b165...9069' },
      { name: 'Factura_Fornecedor_Equipamentos.xlsx', size: '2.8 MB', from: '+244 912 334 455', time: 'Hoje 09:30', hash: 'sha256:a8f9c1b2...e4f1' }
    ];
    return [
      {
        code: 'BOX-WA-ANX-01',
        title: 'Ficheiros & Documentos Recebidos via WhatsApp',
        tag: `${attachments.length} Anexos Processados`,
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {attachments.map((a, i) => (
              <div key={i} style={{ padding: '12px', borderRadius: '8px', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>📎 {a.name}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{a.size} • De: {a.from} • {a.time}</div>
                </div>
                <button onClick={() => alert(`Ficheiro ${a.name} descarregado com integridade validada.`)} style={{ padding: '4px 10px', borderRadius: '4px', background: '#2563eb', color: '#fff', border: 'none', fontSize: '0.74rem', cursor: 'pointer' }}>
                  Descarregar
                </button>
              </div>
            ))}
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Aprovações') {
    return [
      {
        code: 'BOX-WA-APR-01',
        title: 'Notificações de Decisões & Aprovações via WhatsApp',
        tag: 'Canal de Resposta Imediata',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(34, 197, 94, 0.08)' : '#f0fdf4', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
              <div style={{ fontWeight: 800, color: '#22c55e', fontSize: '0.88rem' }}>✓ Notificações WhatsApp Activas para Administradores</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#cbd5e1' : '#14532d', marginTop: '4px' }}>
                Quando uma tarefa crítica exige aprovação humana (ex: pagamento de fornecedor ou submissão fiscal), um alerta com botões interativos "Aprovar" / "Rejeitar" é disparado directamente para o WhatsApp dos directores autorizados.
              </div>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Delivery') {
    return [
      {
        code: 'BOX-WA-DLV-01',
        title: 'Telemetria de Entrega & Status da API WhatsApp Cloud',
        tag: 'Meta Cloud API Conectada',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>TAXA DE ENTREGA</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#4ade80' }}>99.8%</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>LATÊNCIA MÉDIA</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isDark ? '#60a5fa' : '#1d4ed8' }}>240 ms</div>
            </div>
            <div style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>STATUS DO WEBHOOK</div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#4ade80' }}>ACTIVO (200 OK)</div>
            </div>
          </div>
        )
      }
    ];
  }

  // Default: Inbox
  return [
    {
      code: 'BOX-WA-INB-01',
      title: 'Conversas Recentes WhatsApp Business',
      tag: '890 Conversas Activas',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { phone: '+244 923 000 000 (Administrador)', lastMsg: 'Balancete do IVA gerado com sucesso.', time: '11:18', unread: 0 },
            { phone: '+244 912 445 566 (Directoria Financeira)', lastMsg: 'Aprovado o pagamento do fornecedor de TI.', time: '10:45', unread: 0 },
            { phone: '+244 933 778 899 (Cliente Sonangol)', lastMsg: 'Agradecemos o envio rápido da cotação.', time: '09:20', unread: 0 }
          ].map((c, i) => (
            <div key={i} style={{ padding: '12px', borderRadius: '8px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>{c.phone}</div>
                <div style={{ fontSize: '0.76rem', color: isDark ? '#cbd5e1' : '#475569', marginTop: '2px' }}>"{c.lastMsg}"</div>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{c.time}</span>
            </div>
          ))}
        </div>
      )
    }
  ];
}

export const EmailIntelligenceScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Inbox');
  const nav = useNavigation();

  return (
    <ScreenLayout
      moduleCode="COM-03"
      title="Email Intelligence"
      subtitle="Classificar email, anexos, intents, risco, tarefas, drafts, approvals, phishing e relatório diário."
      breadcrumbs={['Comunicações', 'Email']}
      buttons={[
        { label: 'Responder', primary: true, onClick: () => setActiveTab('Inbox') },
        {
          label: 'Criar Draft',
          onClick: () => {
            alert('Novo rascunho de email criado pelo AI Employee com tom formal corporativo.');
            setActiveTab('Threads');
          }
        },
        { label: 'Converter em Tarefa', onClick: () => nav?.navigateToArea('TASK-01') },
        { label: 'Aprovar Envio', onClick: () => setActiveTab('Approvals') },
        {
          label: 'Marcar Suspeito',
          danger: true,
          onClick: () => {
            if (confirm('Marcar este email como suspeito de phishing / engenharia social?')) {
              alert('Email isolado em quarentena e encaminhado para o módulo de Segurança SEC-01.');
              setActiveTab('Security');
            }
          }
        }
      ]}
      kpis={[
        { label: 'Recebidos', value: '380', change: 'Hoje', statusColor: COLORS.operacao },
        { label: 'Aguardam resposta', value: '12', change: 'Drafts gerados por AI', statusColor: COLORS.revisao },
        { label: 'Aguardam aprovação', value: '4', change: 'Envio externo HITL', statusColor: COLORS.revisao },
        { label: 'Suspeitos', value: '0', change: 'Zero Phishing', statusColor: COLORS.sucesso }
      ]}
      tabs={['Inbox', 'Threads', 'Tasks', 'Attachments', 'Approvals', 'Security', 'Report']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-COM-03-01', title: 'Email list' },
        { code: 'BOX-COM-03-02', title: 'Thread view' },
        { code: 'BOX-COM-03-03', title: 'Intent/risk card' },
        { code: 'BOX-COM-03-04', title: 'Attachment intake' },
        { code: 'BOX-COM-03-05', title: 'Needs Attention' }
      ]}
      promptsBase={['MPR-033']}
      inventoryButtons={['01 Responder', '02 Criar Draft', '03 Converter em Tarefa', '04 Aprovar Envio', '05 Marcar Suspeito']}
      inventoryKpis={['01 Recebidos', '02 Aguardam resposta', '03 Aguardam aprovação', '04 Suspeitos']}
      inventoryTabs={['01 Inbox', '02 Threads', '03 Tasks', '04 Attachments', '05 Approvals', '06 Security']}
    />
  );
};

export const SocialMediaOperationsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Calendar');

  return (
    <ScreenLayout
      moduleCode="COM-04"
      title="Social Media Operations"
      subtitle="Gerir conteúdo, calendário, posts, comentários, DMs, leads, complaints, social listening e crises."
      breadcrumbs={['Comunicações', 'Redes Sociais']}
      buttons={[
        { label: 'Criar Post', primary: true, onClick: () => setActiveTab('Content') },
        { label: 'Agendar', onClick: () => setActiveTab('Calendar') },
        { label: 'Publicar', onClick: () => alert('Post enviado para publicação imediata nas redes sociais configuradas.') },
        { label: 'Responder', onClick: () => setActiveTab('Inbox') },
        { label: 'Criar Lead', onClick: () => setActiveTab('Leads') },
        {
          label: 'Escalar Crise',
          danger: true,
          onClick: () => {
            if (confirm('Deseja ativar o protocolo de crise de redes sociais? Todos os posts agendados serão pausados.')) {
              alert('Protocolo de crise ativado: agendamento congelado e directores alertados.');
              setActiveTab('Complaints');
            }
          }
        }
      ]}
      kpis={[
        { label: 'Posts', value: '42', change: 'Agendados este mês', statusColor: COLORS.operacao },
        { label: 'Comentários', value: '620', change: 'Respondidos por AI', statusColor: COLORS.sucesso },
        { label: 'DMs', value: '180', change: 'Mensagens diretas', statusColor: COLORS.ia },
        { label: 'Leads', value: '28', change: 'Captadas em posts', statusColor: COLORS.sucesso }
      ]}
      tabs={['Calendar', 'Content', 'Inbox', 'Leads', 'Complaints', 'Listening', 'Campaigns', 'Analytics']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-COM-04-01', title: 'Content calendar' },
        { code: 'BOX-COM-04-02', title: 'Post composer' },
        { code: 'BOX-COM-04-03', title: 'Community inbox' },
        { code: 'BOX-COM-04-04', title: 'Lead capture' },
        { code: 'BOX-COM-04-05', title: 'Crisis banner' }
      ]}
      promptsBase={['MPR-033']}
      inventoryButtons={['01 Criar Post', '02 Agendar', '03 Publicar', '04 Responder', '05 Criar Lead', '06 Escalar Crise']}
      inventoryKpis={['01 Posts', '02 Comentários', '03 DMs', '04 Leads']}
      inventoryTabs={['01 Calendar', '02 Content', '03 Inbox', '04 Leads', '05 Complaints', '06 Listening']}
    />
  );
};

export const DailyExecutiveBriefingScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Hoje');

  return (
    <ScreenLayout
      moduleCode="COM-05"
      title="Daily Executive Briefing"
      subtitle="Resumo diário de WhatsApp, email, social, tasks, files, approvals, risks, costs e needs your attention."
      breadcrumbs={['Comunicações', 'Briefing Executivo']}
      buttons={[
        {
          label: 'Gerar Agora',
          primary: true,
          onClick: () => {
            alert('Briefing executivo do dia compilado com sucesso com dados das últimas 24 horas.');
            setActiveTab('Hoje');
          }
        },
        { label: 'Enviar por WhatsApp', onClick: () => alert('Briefing resumido enviado para o WhatsApp do executivo.') },
        { label: 'Enviar por Email', onClick: () => alert('Relatório analítico em PDF enviado para o email institucional.') },
        { label: 'Configurar Horário', onClick: () => setActiveTab('Configuração') },
        { label: 'Arquivar', onClick: () => setActiveTab('Histórico') }
      ]}
      kpis={[
        { label: 'Itens críticos', value: '2', change: 'Requer atenção imediata', statusColor: COLORS.revisao },
        { label: 'Aprovações', value: '5', change: 'Pendentes do CEO', statusColor: COLORS.revisao },
        { label: 'Falhas', value: '0', change: 'Operação regular', statusColor: COLORS.sucesso },
        { label: 'Custos', value: '$12.40', change: 'Consumo do dia', statusColor: COLORS.operacao }
      ]}
      tabs={['Hoje', 'Histórico', 'Semanal', 'Mensal', 'Configuração']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-COM-05-01', title: 'Executive summary' },
        { code: 'BOX-COM-05-02', title: 'Needs Your Attention' },
        { code: 'BOX-COM-05-03', title: 'Channel summaries' },
        { code: 'BOX-COM-05-04', title: 'Files received/generated' },
        { code: 'BOX-COM-05-05', title: 'Cost & risk' }
      ]}
      promptsBase={['MPR-033']}
      inventoryButtons={['01 Gerar Agora', '02 Enviar por WhatsApp', '03 Enviar por Email', '04 Configurar Horário', '05 Arquivar']}
      inventoryKpis={['01 Itens críticos', '02 Aprovações', '03 Falhas', '04 Custos']}
      inventoryTabs={['01 Hoje', '02 Histórico', '03 Semanal', '04 Mensal', '05 Configuração']}
    />
  );
};

import React, { useState } from 'react';
import { ScreenLayout, COLORS, useIsDark } from '../ui/DesignSystem';
import { useNavigation } from '../NavigationContext';

export const PlansSubscriptionsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Planos');
  const nav = useNavigation();
  const isDark = useIsDark();

  return (
    <ScreenLayout
      moduleCode="COMMERCE-01"
      title="Planos, Subscrições & Receita"
      subtitle="Gerir planos, preços, subscrições, entitlements, usage, MRR/ARR, unit economics e contratos."
      breadcrumbs={['Comercial', 'Planos & Subscrições']}
      buttons={[
        {
          label: 'Novo Plano',
          primary: true,
          onClick: () => {
            const planName = prompt('Nome do novo plano corporativo (Ex: Enterprise Plus):');
            if (planName) alert(`Plano "${planName}" adicionado com sucesso ao catálogo comercial.`);
          }
        },
        { label: 'Contratar', onClick: () => nav?.navigateToArea('WF-02') },
        { label: 'Upgrade', onClick: () => alert('Upgrade de subscrição solicitado. Entitlements atualizados em tempo real.') },
        { label: 'Downgrade', onClick: () => alert('Solicitação de downgrade enviada para revisão da equipa de contas.') },
        {
          label: 'Cancelar',
          danger: true,
          onClick: () => {
            if (confirm('Tem a certeza que deseja cancelar a subscrição activa?')) {
              alert('Cancelamento programado para o final do ciclo de facturação corrente.');
            }
          }
        },
        {
          label: 'Emitir Cotação',
          onClick: () => {
            const csv = 'Item,Preco,Quantidade,Total\nAI Employee Contabilista PGC,$400,1,$400\nAI Employee Fiscal IVA,$450,1,$450\nPlataforma Core Enterprise,$1200,1,$1200';
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'cotacao_comercial.csv';
            link.click();
            URL.revokeObjectURL(url);
          }
        }
      ]}
      kpis={[
        { label: 'MRR', value: '$14,200', change: '+18% MoM', statusColor: COLORS.sucesso },
        { label: 'ARR', value: '$170,400', change: 'Receita Anual Runrate', statusColor: COLORS.sucesso },
        { label: 'Subscrições activas', value: '48', change: 'Clientes pagantes', statusColor: COLORS.operacao },
        { label: 'Margem', value: '78%', change: 'Unit Economics Positivo', statusColor: COLORS.sucesso }
      ]}
      tabs={['Planos', 'Subscrições', 'Usage', 'Receita', 'Custos', 'Contratos', 'Economics']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForPlans(activeTab, isDark, nav)}
      promptsBase={['MPR-026', 'MPR-027']}
      inventoryButtons={['01 Novo Plano', '02 Contratar', '03 Upgrade', '04 Downgrade', '05 Cancelar', '06 Emitir Cotação']}
      inventoryKpis={['01 MRR', '02 ARR', '03 Subscrições activas', '04 Margem']}
      inventoryTabs={['01 Planos', '02 Subscrições', '03 Usage', '04 Receita', '05 Custos', '06 Contratos']}
    />
  );
};

function getBoxesForPlans(activeTab: string, isDark: boolean, nav: ReturnType<typeof useNavigation>) {
  if (activeTab === 'Subscrições') {
    const subscriptions = [
      { client: 'MARVINE, LDA', plan: 'Enterprise 50', employees: '18 / 50', value: '$1,850 / mês', status: 'Activa', renewal: '01/10/2026' },
      { client: 'MINSA — Ministério da Saúde', plan: 'Enterprise 50', employees: '42 / 50', value: '$2,200 / mês', status: 'Activa', renewal: '15/10/2026' },
      { client: 'SONANGOL DISTRIBUIÇÃO', plan: 'Custom 500', employees: '24 / 100', value: '$4,500 / mês', status: 'Activa', renewal: '20/10/2026' },
      { client: 'BANCO COMERCIAL ANGOLANO', plan: 'Pro 20', employees: '6 / 20', value: '$800 / mês', status: 'Em Setup', renewal: '01/11/2026' }
    ];
    return [
      {
        code: 'BOX-PLN-SUB-01',
        title: 'Subscrições Corporativas Activas & Contratos Recorrentes',
        tag: `${subscriptions.length} Subscrições`,
        content: (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '10px' }}>CLIENTE / EMPRESA</th>
                  <th style={{ padding: '10px' }}>PLANO</th>
                  <th style={{ padding: '10px' }}>EMPLOYEES</th>
                  <th style={{ padding: '10px' }}>VALOR MENSAL</th>
                  <th style={{ padding: '10px' }}>RENOVAÇÃO</th>
                  <th style={{ padding: '10px' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((s, i) => (
                  <tr key={i} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    <td style={{ padding: '10px', fontWeight: 800 }}>{s.client}</td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: isDark ? '#60a5fa' : '#1d4ed8', fontWeight: 700 }}>{s.plan}</span></td>
                    <td style={{ padding: '10px' }}>{s.employees}</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#4ade80' }}>{s.value}</td>
                    <td style={{ padding: '10px' }}>{s.renewal}</td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '2px 6px', borderRadius: '4px', background: s.status === 'Activa' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)', color: s.status === 'Activa' ? '#4ade80' : '#facc15', fontWeight: 700 }}>{s.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Economics' || activeTab === 'Custos') {
    return [
      {
        code: 'BOX-PLN-ECO-01',
        title: 'Unit Economics & Comparador de Custo: AI Employee vs Custo Humano',
        tag: 'Margem Bruta 78%',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>CUSTO MÉDIO POR TAREFA EXECUTADA</div>
              <div style={{ fontWeight: 800, fontSize: '1.4rem', color: '#4ade80', margin: '4px 0' }}>$0.0012</div>
              <div style={{ fontSize: '0.76rem', color: isDark ? '#cbd5e1' : '#475569' }}>Inferência Gemini 1.5 Flash + Pro Routing</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '12px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>POUPANÇA CLIENTE ESTIMADA</div>
              <div style={{ fontWeight: 800, fontSize: '1.4rem', color: isDark ? '#60a5fa' : '#1d4ed8', margin: '4px 0' }}>94.2%</div>
              <div style={{ fontSize: '0.76rem', color: isDark ? '#cbd5e1' : '#475569' }}>Comparado a salários + encargos fiscais tradicionais</div>
            </div>
          </div>
        )
      }
    ];
  }

  // Default: Planos
  const plans = [
    { name: 'STARTER 5', price: '$250', period: '/ mês', desc: 'Até 5 AI Employees dedicados para pequenas empresas e escritórios.', feats: ['5 AI Employees à escolha', 'Até 2.000 tarefas/mês', 'Conector WhatsApp & Email', 'Suporte em horário comercial'] },
    { name: 'PRO 20', price: '$800', period: '/ mês', desc: 'Para empresas em crescimento que precisam de equipas multidisciplinares.', feats: ['20 AI Employees à escolha', 'Até 10.000 tarefas/mês', 'Conector ERP Primavera & Bancos', 'Motor de Auditoria SHA-256', 'SLA < 15 minutos'] },
    { name: 'ENTERPRISE 50', price: '$1,850', period: '/ mês', desc: 'Workforce digital completa com governança corporativa e multi-tenant.', feats: ['50 AI Employees à escolha', 'Tarefas ilimitadas', 'Conectores locais & Cloud híbrida', 'Controle HITL e Segregação de Funções', 'Gestor de Contas Dedicado'] }
  ];
  return [
    {
      code: 'BOX-PLN-CRD-01',
      title: 'Planos de Subscrição Corporativa Disponíveis',
      tag: 'Tabela de Preços Activa',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {plans.map((p, i) => (
            <div key={i} style={{ padding: '20px', borderRadius: '14px', background: isDark ? 'rgba(30, 41, 59, 0.5)' : '#ffffff', border: isDark ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: isDark ? '#60a5fa' : '#1d4ed8' }}>{p.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', margin: '8px 0' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800 }}>{p.price}</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{p.period}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: isDark ? '#cbd5e1' : '#475569', margin: '0 0 12px 0' }}>{p.desc}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.76rem' }}>
                  {p.feats.map((f, fi) => (
                    <div key={fi}>✓ {f}</div>
                  ))}
                </div>
              </div>
              <button onClick={() => nav?.navigateToArea('WF-02')} style={{ padding: '9px 16px', borderRadius: '8px', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                Subscrever Plano
              </button>
            </div>
          ))}
        </div>
      )
    }
  ];
}

export const BillingPaymentsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Invoices');
  const nav = useNavigation();
  const isDark = useIsDark();

  return (
    <ScreenLayout
      moduleCode="COMMERCE-02"
      title="Billing, Facturação & Pagamentos"
      subtitle="Hardening de pricing, facturação, pagamentos, anti-fraude, reconciliação, subledger e readiness de cliente pagante."
      breadcrumbs={['Comercial', 'Billing & Pagamentos']}
      buttons={[
        {
          label: 'Emitir Factura',
          primary: true,
          onClick: () => {
            alert('Factura proforma certificada emitida com sucesso em formato PDF com QR Code fiscal.');
            setActiveTab('Invoices');
          }
        },
        { label: 'Registar Pagamento', onClick: () => setActiveTab('Payments') },
        { label: 'Reconciliar', onClick: () => setActiveTab('Reconciliation') },
        {
          label: 'Reembolsar',
          onClick: () => {
            if (confirm('Iniciar procedimento de estorno / reembolso?')) {
              alert('Reembolso processado na conta de liquidação bancária.');
            }
          }
        },
        {
          label: 'Abrir Incident',
          danger: true,
          onClick: () => {
            if (confirm('Registar incidente no módulo de billing?')) {
              alert('Incidente de billing registado com SLA Crítico.');
              setActiveTab('Fraud');
            }
          }
        }
      ]}
      kpis={[
        { label: 'Facturado', value: 'Kz 14.2M', change: 'Em Kwanzas (AOA)', statusColor: COLORS.operacao },
        { label: 'Recebido', value: 'Kz 13.8M', change: 'Via ExpressPay / Stripe', statusColor: COLORS.sucesso },
        { label: 'Por reconciliar', value: 'Kz 400K', change: 'Pendente verificação bancária', statusColor: COLORS.revisao },
        { label: 'Past due', value: 'Kz 0', change: 'Zero inadimplência', statusColor: COLORS.sucesso }
      ]}
      tabs={['Invoices', 'Payments', 'Reconciliation', 'Subledger', 'Entitlements', 'Fraud', 'Readiness']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForBilling(activeTab, isDark, nav)}
      promptsBase={['MPR-028', 'MPR-026']}
      inventoryButtons={['01 Emitir Factura', '02 Registar Pagamento', '03 Reconciliar', '04 Reembolsar', '05 Abrir Incident']}
      inventoryKpis={['01 Facturado', '02 Recebido', '03 Por reconciliar', '04 Past due']}
      inventoryTabs={['01 Invoices', '02 Payments', '03 Reconciliation', '04 Subledger', '05 Entitlements', '06 Fraud']}
    />
  );
};

function getBoxesForBilling(activeTab: string, isDark: boolean, _nav?: ReturnType<typeof useNavigation>) {
  if (activeTab === 'Payments') {
    const payments = [
      { id: 'PAY-801', client: 'MARVINE, LDA', method: 'Multicaixa Express (EMIS)', amount: 'Kz 1.850.000', date: 'Hoje 09:14', status: 'Liquidado' },
      { id: 'PAY-802', client: 'MINSA', method: 'Ordem de Transferência BNA', amount: 'Kz 2.200.000', date: 'Ontem 16:30', status: 'Liquidado' },
      { id: 'PAY-803', client: 'SONANGOL DISTRIBUIÇÃO', method: 'Transferência Bancária BAI', amount: 'Kz 4.500.000', date: '12/09/2026', status: 'Liquidado' }
    ];
    return [
      {
        code: 'BOX-BIL-PAY-01',
        title: 'Eventos de Pagamento & Liquidação em Tempo Real',
        tag: `${payments.length} Pagamentos Recentes`,
        content: (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '10px' }}>ID PAGAMENTO</th>
                  <th style={{ padding: '10px' }}>CLIENTE</th>
                  <th style={{ padding: '10px' }}>MÉTODO</th>
                  <th style={{ padding: '10px' }}>MONTANTE</th>
                  <th style={{ padding: '10px' }}>DATA</th>
                  <th style={{ padding: '10px' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: isDark ? '#60a5fa' : '#1d4ed8', fontWeight: 700 }}>{p.id}</td>
                    <td style={{ padding: '10px', fontWeight: 800 }}>{p.client}</td>
                    <td style={{ padding: '10px' }}>{p.method}</td>
                    <td style={{ padding: '10px', fontWeight: 700, color: '#4ade80' }}>{p.amount}</td>
                    <td style={{ padding: '10px' }}>{p.date}</td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>{p.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Reconciliation') {
    return [
      {
        code: 'BOX-BIL-REC-01',
        title: 'Fila de Reconciliação Bancária Automatizada',
        tag: '97.2% Reconciliado',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '14px', borderRadius: '10px', background: isDark ? 'rgba(34, 197, 94, 0.08)' : '#f0fdf4', border: '1px solid rgba(34, 197, 94, 0.25)' }}>
              <div style={{ fontWeight: 800, color: '#22c55e', fontSize: '0.88rem' }}>✓ 14 facturas reconciliadas automaticamente com extractos bancários</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#cbd5e1' : '#14532d', marginTop: '2px' }}>
                Apenas 1 transferência pendente de matching (Kz 400.000 com referência não informada no comprovativo).
              </div>
            </div>
          </div>
        )
      }
    ];
  }

  // Default: Invoices
  const invoices = [
    { id: 'FAC-2026-0042', client: 'MARVINE, LDA', date: '01/09/2026', total: 'Kz 1.850.000', status: 'Pago', tax: 'Kz 259.000 (14% IVA)' },
    { id: 'FAC-2026-0043', client: 'MINSA', date: '01/09/2026', total: 'Kz 2.200.000', status: 'Pago', tax: 'Isento IVA' },
    { id: 'FAC-2026-0044', client: 'SONANGOL DISTRIBUIÇÃO', date: '05/09/2026', total: 'Kz 4.500.000', status: 'Pago', tax: 'Kz 630.000 (14% IVA)' }
  ];
  return [
    {
      code: 'BOX-BIL-INV-01',
      title: 'Livro de Facturas Comerciais Certificadas (SAFT-AO)',
      tag: `${invoices.length} Facturas Emitidas`,
      content: (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                <th style={{ padding: '10px' }}>N.º FACTURA</th>
                <th style={{ padding: '10px' }}>CLIENTE</th>
                <th style={{ padding: '10px' }}>DATA EMISSÃO</th>
                <th style={{ padding: '10px' }}>TOTAL LÍQUIDO</th>
                <th style={{ padding: '10px' }}>ENQUADRAMENTO IVA</th>
                <th style={{ padding: '10px' }}>ESTADO</th>
                <th style={{ padding: '10px' }}>DOWNLOAD</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(f => (
                <tr key={f.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9', color: isDark ? '#e2e8f0' : '#1e293b' }}>
                  <td style={{ padding: '10px', fontFamily: 'monospace', color: isDark ? '#60a5fa' : '#1d4ed8', fontWeight: 700 }}>{f.id}</td>
                  <td style={{ padding: '10px', fontWeight: 800 }}>{f.client}</td>
                  <td style={{ padding: '10px' }}>{f.date}</td>
                  <td style={{ padding: '10px', fontWeight: 700 }}>{f.total}</td>
                  <td style={{ padding: '10px', fontSize: '0.74rem', color: '#64748b' }}>{f.tax}</td>
                  <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>{f.status}</span></td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => alert(`Download da Factura ${f.id} em PDF certificada com QR Code fiscal.`)} style={{ padding: '4px 8px', borderRadius: '4px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8', border: 'none', fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer' }}>
                      📥 PDF AGT
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

export const DiscoveryExpansionScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Discovery');
  const nav = useNavigation();

  return (
    <ScreenLayout
      moduleCode="EXP-01"
      title="Discovery & Workforce Expansion"
      subtitle="Detectar processos repetitivos/ineficientes, recomendar Employees, calcular business case e expandir workforce."
      breadcrumbs={['Comercial', 'Expansão']}
      buttons={[
        {
          label: 'Nova Análise',
          primary: true,
          onClick: () => {
            alert('Análise de oportunidades de automação iniciada nos processos da empresa.');
            setActiveTab('Discovery');
          }
        },
        { label: 'Recomendar Employee', onClick: () => setActiveTab('Recommendations') },
        { label: 'Criar Business Case', onClick: () => setActiveTab('Business Cases') },
        { label: 'Iniciar Piloto', onClick: () => setActiveTab('Pilots') },
        { label: 'Contratar', onClick: () => nav?.navigateToArea('WF-02') }
      ]}
      kpis={[
        { label: 'Oportunidades', value: '14', change: 'Processos ineficientes', statusColor: COLORS.operacao },
        { label: 'Business cases', value: '8', change: 'ROI médio 4.2x', statusColor: COLORS.sucesso },
        { label: 'Pilotos sugeridos', value: '5', change: 'Baixo risco', statusColor: COLORS.conhecimento },
        { label: 'Expansões', value: '+6 Employees', change: 'Projeção de contratação', statusColor: COLORS.sucesso }
      ]}
      tabs={['Discovery', 'Recommendations', 'Business Cases', 'Pilots', 'Expansion', 'ROI']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-EXP-01-01', title: 'Opportunity map' },
        { code: 'BOX-EXP-01-02', title: 'Employee recommendation' },
        { code: 'BOX-EXP-01-03', title: 'ROI assumptions' },
        { code: 'BOX-EXP-01-04', title: 'Pilot-first option' },
        { code: 'BOX-EXP-01-05', title: 'Expansion pipeline' }
      ]}
      promptsBase={['MPR-031']}
      inventoryButtons={['01 Nova Análise', '02 Recomendar Employee', '03 Criar Business Case', '04 Iniciar Piloto', '05 Contratar']}
      inventoryKpis={['01 Oportunidades', '02 Business cases', '03 Pilotos sugeridos', '04 Expansões']}
      inventoryTabs={['01 Discovery', '02 Recommendations', '03 Business Cases', '04 Pilots', '05 Expansion', '06 ROI']}
    />
  );
};

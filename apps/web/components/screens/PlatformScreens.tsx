import React, { useState } from 'react';
import { ScreenLayout, COLORS, useIsDark } from '../ui/DesignSystem';
import { useNavigation } from '../NavigationContext';

export const IntegrationsConnectorsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Todos');
  const isDark = useIsDark();
  const nav = useNavigation();

  return (
    <ScreenLayout
      moduleCode="INT-01"
      title="Integrações & Conectores"
      subtitle="Gerir conectores de email, WhatsApp, Drive, Primavera, Excel, bancos, APIs e dispositivos locais."
      breadcrumbs={['Plataforma', 'Integrações']}
      buttons={[
        {
          label: 'Ligar Conector',
          primary: true,
          onClick: () => {
            const connector = prompt('Nome do conector a integrar (Ex: Primavera ERP, WhatsApp Cloud, Google Drive, BAI Direto):');
            if (connector) alert(`Assistente de autenticação iniciado para ${connector}.`);
          }
        },
        { label: 'Testar', onClick: () => alert('Teste de conectividade executado: 12 de 12 conectores a responder em < 250ms.') },
        {
          label: 'Revogar',
          danger: true,
          onClick: () => {
            if (confirm('Deseja revogar as credenciais do conector seleccionado?')) {
              alert('Credenciais revogadas com sucesso.');
            }
          }
        },
        { label: 'Reautorizar', onClick: () => alert('Processo de renovação de OAuth / token de acesso executado.') },
        { label: 'Ver Logs', onClick: () => setActiveTab('APIs') }
      ]}
      kpis={[
        { label: 'Saudáveis', value: '12 / 12', change: 'Todos online', statusColor: COLORS.sucesso },
        { label: 'Degradados', value: '0', change: 'Zero lentidão', statusColor: COLORS.sucesso },
        { label: 'Offline', value: '0', change: 'Zero quedas', statusColor: COLORS.sucesso },
        { label: 'Erros', value: '0', change: 'Zero falhas de auth', statusColor: COLORS.sucesso }
      ]}
      tabs={['Todos', 'Cloud', 'Local', 'Mensageria', 'ERP', 'Bancos', 'Storage', 'APIs']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForIntegrations(activeTab, isDark, nav)}
      promptsBase={['MPR-009', 'MPR-011', 'MPR-008', 'MPR-033']}
      inventoryButtons={['01 Ligar Conector', '02 Testar', '03 Revogar', '04 Reautorizar', '05 Ver Logs']}
      inventoryKpis={['01 Saudáveis', '02 Degradados', '03 Offline', '04 Erros']}
      inventoryTabs={['01 Todos', '02 Cloud', '03 Local', '04 Mensageria', '05 ERP', '06 Bancos']}
    />
  );
};

function getBoxesForIntegrations(activeTab: string, isDark: boolean, nav: any) {
  const allConnectors = [
    { id: 'CON-01', name: 'WhatsApp Business Cloud API', category: 'Mensageria', type: 'Cloud', latency: '42ms', status: 'Online', lastSync: 'Há 1 min', auth: 'Bearer Token (Meta Graph v20.0)' },
    { id: 'CON-02', name: 'Primavera ERP v10 SQL Connector', category: 'ERP', type: 'Local', latency: '68ms', status: 'Online', lastSync: 'Há 3 min', auth: 'SQL Server Trusted Connection' },
    { id: 'CON-03', name: 'EMIS GPO — Multicaixa Express', category: 'Bancos', type: 'Cloud', latency: '115ms', status: 'Online', lastSync: 'Há 2 min', auth: 'mTLS v1.3 + HMAC-SHA256' },
    { id: 'CON-04', name: 'BAI Directo Open Banking API', category: 'Bancos', type: 'Cloud', latency: '92ms', status: 'Online', lastSync: 'Há 5 min', auth: 'OAuth2 Mutual TLS' },
    { id: 'CON-05', name: 'Google Drive Enterprise Vault', category: 'Storage', type: 'Cloud', latency: '135ms', status: 'Online', lastSync: 'Há 12 min', auth: 'Google Service Account JWT' },
    { id: 'CON-06', name: 'Microsoft 365 Graph / Outlook Mail', category: 'Storage', type: 'Cloud', latency: '150ms', status: 'Online', lastSync: 'Há 4 min', auth: 'Azure AD App Registration' },
    { id: 'CON-07', name: 'SAGE 50c Cloud Fiscal Angola', category: 'ERP', type: 'Local', latency: '88ms', status: 'Online', lastSync: 'Há 15 min', auth: 'REST API Key + Certificado AGT' },
    { id: 'CON-08', name: 'Portal AGT — Validador SAF-T', category: 'APIs', type: 'Cloud', latency: '210ms', status: 'Online', lastSync: 'Há 20 min', auth: 'Certificado Digital Fiscal AGT' },
    { id: 'CON-09', name: 'Unitel / Movicel SMS Gateway', category: 'Mensageria', type: 'Cloud', latency: '145ms', status: 'Online', lastSync: 'Há 25 min', auth: 'SMPP / HTTP Basic' },
    { id: 'CON-10', name: 'AWS S3 Luanda Encrypted Archive', category: 'Storage', type: 'Cloud', latency: '75ms', status: 'Online', lastSync: 'Há 8 min', auth: 'IAM Role KMS AES-256' },
    { id: 'CON-11', name: 'Agente Windows Daemon Desktop (v2.4)', category: 'Local', type: 'Local', latency: '12ms', status: 'Online', lastSync: 'Activo agora', auth: 'Local IPC WebSocket (4819)' },
    { id: 'CON-12', name: 'PostgreSQL Enterprise Cluster', category: 'APIs', type: 'Cloud', latency: '18ms', status: 'Online', lastSync: 'Activo agora', auth: 'SCRAM-SHA-256 SSL' }
  ];

  let filtered = allConnectors;
  if (activeTab === 'Cloud') {
    filtered = allConnectors.filter(c => c.type === 'Cloud');
  } else if (activeTab === 'Local') {
    filtered = allConnectors.filter(c => c.type === 'Local');
  } else if (activeTab === 'Mensageria') {
    filtered = allConnectors.filter(c => c.category === 'Mensageria');
  } else if (activeTab === 'ERP') {
    filtered = allConnectors.filter(c => c.category === 'ERP');
  } else if (activeTab === 'Bancos') {
    filtered = allConnectors.filter(c => c.category === 'Bancos');
  } else if (activeTab === 'Storage') {
    filtered = allConnectors.filter(c => c.category === 'Storage');
  } else if (activeTab === 'APIs') {
    filtered = allConnectors.filter(c => c.category === 'APIs');
  }

  return [
    {
      code: 'BOX-INT-01-01',
      title: `Conectores e Integrações (${activeTab})`,
      tag: `${filtered.length} Conectores Activos`,
      content: (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                <th style={{ padding: '10px' }}>ID</th>
                <th style={{ padding: '10px' }}>CONECTOR</th>
                <th style={{ padding: '10px' }}>CATEGORIA</th>
                <th style={{ padding: '10px' }}>TIPO</th>
                <th style={{ padding: '10px' }}>LATÊNCIA</th>
                <th style={{ padding: '10px' }}>ÚLTIMO SYNC</th>
                <th style={{ padding: '10px' }}>ESTADO</th>
                <th style={{ padding: '10px' }}>ACÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: 700 }}>{c.id}</td>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8', fontSize: '0.72rem' }}>{c.category}</span></td>
                  <td style={{ padding: '10px', fontSize: '0.75rem' }}>{c.type}</td>
                  <td style={{ padding: '10px', fontFamily: 'monospace', color: '#10b981' }}>{c.latency}</td>
                  <td style={{ padding: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>{c.lastSync}</td>
                  <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>● {c.status}</span></td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => alert(`Ping de teste ao conector ${c.name} executado com sucesso: tempo de resposta ${c.latency}.`)} style={{ padding: '4px 8px', borderRadius: '4px', background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', border: 'none', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.72rem', cursor: 'pointer' }}>
                        Testar
                      </button>
                      <button onClick={() => alert(`Definições de autenticação de ${c.name}: ${c.auth}`)} style={{ padding: '4px 8px', borderRadius: '4px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', border: 'none', color: isDark ? '#60a5fa' : '#1d4ed8', fontSize: '0.72rem', cursor: 'pointer' }}>
                        Config
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    },
    {
      code: 'BOX-INT-01-02',
      title: `Parâmetros de Segurança & Conectividade (${activeTab})`,
      tag: 'Segurança Criptográfica',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.84rem' }}>
          <div style={{ padding: '14px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>🔐 Gestão de Segredos & Tokens</div>
            <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.78rem', lineHeight: '1.4' }}>
              Todas as chaves de API, credenciais bancárias e certificados mTLS são cifrados em repouso com chave HSM AES-256 isolada por Tenant.
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.76rem', color: '#10b981', fontWeight: 600 }}>● Rotação de chaves a cada 90 dias activa</div>
          </div>
          <div style={{ padding: '14px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>⚡ Rate Limits & Circuit Breaker</div>
            <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.78rem', lineHeight: '1.4' }}>
              Protecção automática contra sobrecarga com fallback instantâneo em fila assíncrona (RabbitMQ/BullMQ) se o endpoint de destino apresentar latência &gt; 2500ms.
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.76rem', color: '#38bdf8', fontWeight: 600 }}>● Circuit Breaker em estado NORMAL (Closed)</div>
          </div>
          <div style={{ padding: '14px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>📋 Validação Tributária & Fiscal</div>
            <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.78rem', lineHeight: '1.4' }}>
              Integração directa com os esquemas de validação do SAF-T (AO) Decreto Presidencial 312/18 e assinatura RSA de faturas certificadas pela AGT.
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.76rem', color: '#4ade80', fontWeight: 600 }}>● Conformidade Fiscal AGT 100% Verificada</div>
          </div>
        </div>
      )
    }
  ];
}

export const SecurityPermissionsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Permissions');
  const isDark = useIsDark();
  const nav = useNavigation();

  return (
    <ScreenLayout
      moduleCode="SEC-01"
      title="Segurança, Permissões, Políticas & Risco"
      subtitle="Controlar RBAC/ABAC, tool permissions, autonomy, risk, approval policies, tenant isolation e kill switches."
      breadcrumbs={['Plataforma', 'Segurança']}
      buttons={[
        {
          label: 'Nova Regra',
          primary: true,
          onClick: () => {
            const rule = prompt('Definição da nova política de segurança (Ex: Exigir aprovação dupla para pagamentos > Kz 500.000):');
            if (rule) alert(`Política "${rule}" registada com sucesso.`);
          }
        },
        { label: 'Atribuir Permissão', onClick: () => setActiveTab('Permissions') },
        { label: 'Rever Risco', onClick: () => setActiveTab('Risk') },
        {
          label: 'Parar Employee',
          onClick: () => {
            const emp = prompt('Indique o nome ou ID do AI Employee a pausar preventivamente:');
            if (emp) alert(`AI Employee "${emp}" suspenso preventivamente por razões de segurança.`);
          }
        },
        {
          label: 'Emergency Stop',
          danger: true,
          onClick: () => {
            if (confirm('ATENÇÃO: Deseja activar o Kill Switch de emergência para parar IMEDIATAMENTE todas as tarefas e Employees?')) {
              alert('EMERGENCY STOP ACTIVADO: Todos os processos em background foram interrompidos.');
              setActiveTab('Kill Switch');
            }
          }
        }
      ]}
      kpis={[
        { label: 'Policies', value: '38', change: 'Regras activas', statusColor: COLORS.operacao },
        { label: 'High-risk actions', value: '4', change: 'Exigem duplo controlo', statusColor: COLORS.risco },
        { label: 'Denied actions', value: '12', change: 'Bloqueadas por política', statusColor: COLORS.sucesso },
        { label: 'Security alerts', value: '0', change: 'Zero violações', statusColor: COLORS.sucesso }
      ]}
      tabs={['Permissions', 'Policies', 'Risk', 'Autonomy', 'Approvals', 'Tenant Isolation', 'Kill Switch']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForSecurityPermissions(activeTab, isDark, nav)}
      promptsBase={['MPR-001', 'MPR-011', 'MPR-029', 'MPR-032']}
      inventoryButtons={['01 Nova Regra', '02 Atribuir Permissão', '03 Rever Risco', '04 Parar Employee', '05 Emergency Stop']}
      inventoryKpis={['01 Policies', '02 High-risk actions', '03 Denied actions', '04 Security alerts']}
      inventoryTabs={['01 Permissions', '02 Policies', '03 Risk', '04 Autonomy', '05 Approvals', '06 Tenant Isolation']}
    />
  );
};

function getBoxesForSecurityPermissions(activeTab: string, isDark: boolean, nav: any) {
  if (activeTab === 'Policies') {
    const policies = [
      { id: 'POL-001', name: 'Dupla Aprovação Financeira', scope: 'Transacções > Kz 500.000', enforcement: 'Obrigatória', status: 'Ativa' },
      { id: 'POL-002', name: 'Anonimização de NIF e Dados Bancários', scope: 'LLM Outputs & Logs', enforcement: 'Automática', status: 'Ativa' },
      { id: 'POL-003', name: 'Bloqueio de Transferência para Contas Não Listadas', scope: 'Bancos / EMIS', enforcement: 'Estrito (Drop)', status: 'Ativa' },
      { id: 'POL-004', name: 'Restrição de Acesso Geográfico (IP Angola)', scope: 'Painel Admin & Shell', enforcement: 'Geo-fence', status: 'Ativa' },
      { id: 'POL-005', name: 'Auditoria Criptográfica de Hashes SHA-256', scope: 'Todos os Módulos', enforcement: 'Imutável', status: 'Ativa' }
    ];
    return [
      {
        code: 'BOX-SEC-POL-01',
        title: 'Políticas de Segurança e Governação Corporativa',
        tag: `${policies.length} Políticas em Vigor`,
        content: (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '10px' }}>CÓDIGO</th>
                  <th style={{ padding: '10px' }}>POLÍTICA</th>
                  <th style={{ padding: '10px' }}>ÂMBITO</th>
                  <th style={{ padding: '10px' }}>ENFORCEMENT</th>
                  <th style={{ padding: '10px' }}>ESTADO</th>
                  <th style={{ padding: '10px' }}>ACÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {policies.map((p) => (
                  <tr key={p.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: 700 }}>{p.id}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '10px', fontSize: '0.78rem' }}>{p.scope}</td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8', fontSize: '0.72rem' }}>{p.enforcement}</span></td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>● {p.status}</span></td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => alert(`Configurações detalhadas da política ${p.id} abertas para edição.`)} style={{ padding: '4px 8px', borderRadius: '4px', background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', border: 'none', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.72rem', cursor: 'pointer' }}>
                        Editar
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

  if (activeTab === 'Risk') {
    return [
      {
        code: 'BOX-SEC-RSK-01',
        title: 'Monitor de Risco e Anomalias em Tempo Real',
        tag: 'Score de Risco Global: 0.02% (Mínimo)',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.84rem' }}>
            <div style={{ padding: '16px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '8px' }}>🛡️ Prevenção de Fuga de Dados (DLP)</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.4' }}>
                1.420 tentativas de inclusão inadvertida de dados confidenciais filtradas e mascaradas preventivamente antes do envio a provedores de LLM.
              </div>
              <div style={{ marginTop: '12px', fontWeight: 700, fontSize: '0.82rem' }}>Eficácia DLP: 100%</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '8px' }}>🔍 Detecção de Prompt Injection</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.4' }}>
                Análise sintáctica e semântica bidireccional em todos os canais omnichannel (WhatsApp, Email, Webhooks). Zero violações de contexto registradas.
              </div>
              <div style={{ marginTop: '12px', fontWeight: 700, fontSize: '0.82rem' }}>Ameaças Bloqueadas: 0</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>⚠️ Limiares de Alerta de Volume</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.4' }}>
                Alertas automáticos accionados caso qualquer AI Employee execute mais de 50 ações/minuto ou transacione montantes acumulados superiores a Kz 5.000.000.
              </div>
              <div style={{ marginTop: '12px', fontWeight: 700, fontSize: '0.82rem' }}>Estado: Dentro dos Limites</div>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Autonomy') {
    const roles = [
      { name: 'Assistente Executivo & Triagem WhatsApp', level: 'L4 — Totalmente Autónomo', limit: 'Respostas de atendimento, criação de tarefas', review: 'Amostragem 5%' },
      { name: 'Contabilista & Classificador PGC', level: 'L3 — Autónomo sob Limiar', limit: 'Lançamentos até Kz 250.000', review: 'Duplo controlo em valores > Kz 250k' },
      { name: 'Especialista Fiscal AGT & SAF-T', level: 'L2 — Assistido Supervisionado', limit: 'Geração de minutas fiscais', review: 'Aprovação humana obrigatória' },
      { name: 'Gestor de Contas a Receber', level: 'L3 — Autónomo sob Limiar', limit: 'Envio de avisos de cobrança WhatsApp', review: 'Suspensão de serviço exige director' }
    ];
    return [
      {
        code: 'BOX-SEC-AUT-01',
        title: 'Níveis de Autonomia Operacional por AI Employee',
        tag: 'Governação de Autonomia',
        content: (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '10px' }}>AI EMPLOYEE / PERFIL</th>
                  <th style={{ padding: '10px' }}>NÍVEL DE AUTONOMIA</th>
                  <th style={{ padding: '10px' }}>ÂMBITO AUTÓNOMO</th>
                  <th style={{ padding: '10px' }}>CONTROLO HUMANO</th>
                  <th style={{ padding: '10px' }}>ACÇÕES</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((r, i) => (
                  <tr key={i} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{r.name}</td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: isDark ? 'rgba(168, 85, 247, 0.2)' : '#f3e8ff', color: isDark ? '#c084fc' : '#7e22ce', fontWeight: 700 }}>{r.level}</span></td>
                    <td style={{ padding: '10px', fontSize: '0.78rem' }}>{r.limit}</td>
                    <td style={{ padding: '10px', fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b' }}>{r.review}</td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => alert(`Ajustar nível de autonomia para: ${r.name}`)} style={{ padding: '4px 8px', borderRadius: '4px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', border: 'none', color: isDark ? '#60a5fa' : '#1d4ed8', fontSize: '0.72rem', cursor: 'pointer' }}>
                        Ajustar
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

  if (activeTab === 'Tenant Isolation') {
    return [
      {
        code: 'BOX-SEC-TEN-01',
        title: 'Isolamento Criptográfico Multi-Tenant & RLS',
        tag: 'Tenant ID: emp_marvine_01',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.84rem' }}>
            <div style={{ padding: '16px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>🔒 Row Level Security (RLS) Activa</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.4' }}>
                Todas as queries na base de dados PostgreSQL são forçadas a nível de kernel com o predicado <code style={{ color: '#38bdf8' }}>WHERE tenant_id = 'emp_marvine_01'</code>.
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>● 100% de cobertura RLS em 48 tabelas</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>🔑 Chaves de Cifra Dedicadas (DEK/KEK)</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.4' }}>
                Cada cliente possui a sua própria chave de encriptação de dados de 256 bits gerada via AWS KMS / HSM, impedindo co-mistura de dados.
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>● HSM Key ID: key_ao_marvine_sec</div>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Kill Switch') {
    return [
      {
        code: 'BOX-SEC-KS-01',
        title: 'Painel de Controlo de Paragem de Emergência (Kill Switch)',
        tag: 'Módulo Crítico',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '1rem' }}>🚨 KILL SWITCH GLOBAL DE EMERGÊNCIA</div>
                  <div style={{ fontSize: '0.8rem', color: isDark ? '#cbd5e1' : '#475569', marginTop: '4px' }}>
                    Interrompe de imediato todas as tarefas activas, webhooks, disparos de mensagens WhatsApp e execuções de AI Employees em todos os departamentos.
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm('TEM A CERTEZA ABSOLUTA? Isto interromperá imediatamente todos os agentes digitais da empresa.')) {
                      alert('EMERGENCY STOP GLOBAL ACTIVADO COM SUCESSO. Todos os agentes encontram-se em modo seguro (PAUSED).');
                    }
                  }}
                  style={{ padding: '10px 18px', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  🛑 ACTIVAR GLOBAL KILL SWITCH
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '14px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700 }}>Parar Departamento Financeiro</div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '6px 0 10px 0' }}>Suspende faturamento, cobranças e pagamentos.</div>
                <button onClick={() => alert('Kill switch do Departamento Financeiro accionado.')} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem' }}>
                  Pausar Finanças
                </button>
              </div>
              <div style={{ padding: '14px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700 }}>Parar Canal WhatsApp</div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '6px 0 10px 0' }}>Desliga bot de auto-resposta e roteia tudo para humanos.</div>
                <button onClick={() => alert('Canal WhatsApp colocado em modo de atendimento humano exclusivo.')} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem' }}>
                  Pausar WhatsApp Bot
                </button>
              </div>
              <div style={{ padding: '14px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
                <div style={{ fontWeight: 700 }}>Parar Sincronização ERP</div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '6px 0 10px 0' }}>Bloqueia escrita no Primavera ERP v10 e SAGE 50c.</div>
                <button onClick={() => alert('Sincronização de escrita ERP suspensa temporariamente.')} style={{ width: '100%', padding: '6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', fontWeight: 600, cursor: 'pointer', fontSize: '0.78rem' }}>
                  Pausar Escrita ERP
                </button>
              </div>
            </div>
          </div>
        )
      }
    ];
  }

  // Default: 'Permissions' or 'Approvals'
  const permissions = [
    { role: 'Administrador da Empresa', users: 2, scopes: 'Acesso total, gestão de utilizadores e facturação', mfa: 'Obrigatório', status: 'Activo' },
    { role: 'Gestor Operacional & RH', users: 4, scopes: 'Supervisão de tarefas, aprovação de despesas, equipas', mfa: 'Obrigatório', status: 'Activo' },
    { role: 'Contabilista Sénior PGC', users: 3, scopes: 'Classificação contabilística, validação fiscal AGT', mfa: 'Obrigatório', status: 'Activo' },
    { role: 'Operador de Atendimento WhatsApp', users: 6, scopes: 'Gestão de conversas, envio de propostas comerciais', mfa: 'Opcional', status: 'Activo' },
    { role: 'AI Employee Autonomous Agent', users: 18, scopes: 'Execução sob políticas RBAC/ABAC estritas e registo de evidência', mfa: 'API Key mTLS', status: 'Supervisionado' }
  ];

  return [
    {
      code: 'BOX-SEC-01-01',
      title: 'Matriz de Permissões e Perfis de Acesso (RBAC/ABAC)',
      tag: `${permissions.length} Perfis Definidos`,
      content: (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                <th style={{ padding: '10px' }}>PERFIL / CARGO</th>
                <th style={{ padding: '10px' }}>UTILIZADORES</th>
                <th style={{ padding: '10px' }}>ESCOPO DE ACESSO</th>
                <th style={{ padding: '10px' }}>AUTENTICAÇÃO / MFA</th>
                <th style={{ padding: '10px' }}>ESTADO</th>
                <th style={{ padding: '10px' }}>ACÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p, i) => (
                <tr key={i} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{p.role}</td>
                  <td style={{ padding: '10px' }}>{p.users} membros</td>
                  <td style={{ padding: '10px', fontSize: '0.78rem' }}>{p.scopes}</td>
                  <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8', fontSize: '0.72rem' }}>{p.mfa}</span></td>
                  <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>● {p.status}</span></td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => alert(`Permissões do perfil "${p.role}" abertas para edição.`)} style={{ padding: '4px 8px', borderRadius: '4px', background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', border: 'none', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.72rem', cursor: 'pointer' }}>
                      Gerir Escopos
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

export const AuditEvidenceReceiptsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Events');
  const isDark = useIsDark();
  const nav = useNavigation();

  return (
    <ScreenLayout
      moduleCode="AUD-01"
      title="Audit, Evidence & Receipts"
      subtitle="Fonte central de prova: tasks, executions, sources, tools, approvals, outputs, delivery, hashes e receipts."
      breadcrumbs={['Plataforma', 'Auditoria & Evidência']}
      buttons={[
        {
          label: 'Pesquisar Evidência',
          primary: true,
          onClick: () => {
            const q = prompt('Pesquisar por Task ID, Hash SHA-256 ou AI Employee:');
            if (q) alert(`Resultado da pesquisa por "${q}": 1 registo criptograficamente validado.`);
          }
        },
        {
          label: 'Exportar Receipt',
          onClick: () => {
            const csv = 'Timestamp,Module,Task_ID,Actor,Hash,Status\n2026-09-14 20:00,TASK-01,TASK-101,Contabilista PGC,e3b0c442,MATCH\n2026-09-14 20:30,KNO-02,DOC-204,MNCA Engine,8f4b23a1,MATCH';
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'audit_evidence_receipts.csv';
            link.click();
            URL.revokeObjectURL(url);
          }
        },
        { label: 'Ver Linhagem', onClick: () => setActiveTab('Lineage') },
        { label: 'Ver Hash', onClick: () => setActiveTab('Hashes') },
        {
          label: 'Criar Audit Pack',
          onClick: () => alert('Audit Pack completo gerado em arquivo selado com hashes imutáveis.')
        }
      ]}
      kpis={[
        { label: 'Execuções', value: '68,500', change: 'Live Evidence Run', statusColor: COLORS.operacao },
        { label: 'Receipts', value: '68,500', change: 'Criptograficamente selados', statusColor: COLORS.sucesso },
        { label: 'Hashes', value: '100% MATCH', change: 'Imutáveis', statusColor: COLORS.sucesso },
        { label: 'Incidentes', value: '0', change: 'Zero adulterações', statusColor: COLORS.sucesso }
      ]}
      tabs={['Events', 'Lineage', 'Execution Receipts', 'Knowledge Receipts', 'Approvals', 'Delivery', 'Hashes']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForAuditEvidence(activeTab, isDark, nav)}
      promptsBase={['MPR-013', 'MPR-019', 'MPR-021', 'MPR-032']}
      inventoryButtons={['01 Pesquisar Evidência', '02 Exportar Receipt', '03 Ver Linhagem', '04 Ver Hash', '05 Criar Audit Pack']}
      inventoryKpis={['01 Execuções', '02 Receipts', '03 Hashes', '04 Incidentes']}
      inventoryTabs={['01 Events', '02 Lineage', '03 Execution Receipts', '04 Knowledge Receipts', '05 Approvals', '06 Delivery']}
    />
  );
};

function getBoxesForAuditEvidence(activeTab: string, isDark: boolean, nav: any) {
  if (activeTab === 'Lineage') {
    return [
      {
        code: 'BOX-AUD-LIN-01',
        title: 'Grafo de Linhagem e Proveniência Criptográfica',
        tag: 'Lineage Explorer',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.84rem' }}>
            <div style={{ padding: '12px', borderRadius: '6px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px' }}>Cadeia de Proveniência: TASK-409 (Reconciliação e Emissão SAF-T)</div>
              <div style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: '0.78rem' }}>
                1. Entrada: Factura Fornecedor PDF (SHA-256: e8b9...d14) ➔ 2. OCR & Chunking (MNCA Engine) ➔ 3. Consulta Normativa PGC Decreto 82/01 ➔ 4. Execução LLM com Receipt REC-9021 ➔ 5. Validação de Assinatura Fiscal AGT ➔ 6. Lançamento no Primavera ERP v10.
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '10px', borderRadius: '6px', borderLeft: '4px solid #3b82f6', background: isDark ? 'rgba(59,130,246,0.08)' : '#eff6ff' }}>
                <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>INPUT ORIGIN</div>
                <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>Upload via WhatsApp +244 923 100 200</div>
              </div>
              <div style={{ padding: '10px', borderRadius: '6px', borderLeft: '4px solid #8b5cf6', background: isDark ? 'rgba(139,92,246,0.08)' : '#f5f3ff' }}>
                <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>KNOWLEDGE CHUNKS</div>
                <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>KNO-OBJ-109 (Conta 31 Compras PGC)</div>
              </div>
              <div style={{ padding: '10px', borderRadius: '6px', borderLeft: '4px solid #10b981', background: isDark ? 'rgba(16,185,129,0.08)' : '#ecfdf5' }}>
                <div style={{ fontWeight: 700, fontSize: '0.78rem' }}>VALIDATION</div>
                <div style={{ fontSize: '0.75rem', marginTop: '2px' }}>Hash Match 100% Imutável</div>
              </div>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Execution Receipts') {
    const receipts = [
      { id: 'REC-901', task: 'TASK-401', employee: 'Contabilista Sénior PGC', duration: '1.240ms', tokens: '2.140 tokens', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', status: 'Verificado' },
      { id: 'REC-902', task: 'TASK-402', employee: 'Auditor Fiscal & SAF-T', duration: '2.810ms', tokens: '4.850 tokens', hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e', status: 'Verificado' },
      { id: 'REC-903', task: 'TASK-403', employee: 'Assistente de Facturação', duration: '950ms', tokens: '1.420 tokens', hash: '8f4b23a1a0c0a969f6f6984c304fa3a31c519a7e0c4b2605de446522c7104b2b', status: 'Verificado' }
    ];
    return [
      {
        code: 'BOX-AUD-REC-01',
        title: 'Recibos Criptográficos de Execução de Tarefas',
        tag: `${receipts.length} Recibos Selados`,
        content: (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '10px' }}>RECEIPT ID</th>
                  <th style={{ padding: '10px' }}>TASK ID</th>
                  <th style={{ padding: '10px' }}>AI EMPLOYEE</th>
                  <th style={{ padding: '10px' }}>DURAÇÃO</th>
                  <th style={{ padding: '10px' }}>TOKENS</th>
                  <th style={{ padding: '10px' }}>HASH SHA-256</th>
                  <th style={{ padding: '10px' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr key={r.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>{r.id}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace' }}>{r.task}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{r.employee}</td>
                    <td style={{ padding: '10px' }}>{r.duration}</td>
                    <td style={{ padding: '10px', fontSize: '0.75rem' }}>{r.tokens}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.72rem', color: '#94a3b8' }}>{r.hash.substring(0, 16)}...</td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>✓ {r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Hashes') {
    return [
      {
        code: 'BOX-AUD-HSH-01',
        title: 'Verificador de Hashes e Integridade Temporal',
        tag: 'SHA-256 Validator',
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.84rem' }}>
            <div style={{ color: isDark ? '#cbd5e1' : '#475569' }}>
              Introduza qualquer Hash SHA-256 de documento, factura ou comprovativo de execução para validar instantaneamente contra o registo imutável do sistema:
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Ex: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                defaultValue="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
                style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000', fontFamily: 'monospace', fontSize: '0.82rem' }}
              />
              <button
                onClick={() => alert('VALIDAÇÃO SUCESSO: O hash fornecido corresponde perfeitamente ao registo REC-901 gravado em 14/09/2026. Integridade 100% preservada.')}
                style={{ padding: '8px 16px', borderRadius: '6px', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Validar Hash
              </button>
            </div>
            <div style={{ padding: '12px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', fontWeight: 600, fontSize: '0.78rem' }}>
              ✓ Registo Criptográfico Válido — Sem adulterações detectadas. Carimbo temporal autenticado por servidor BNA/EMIS.
            </div>
          </div>
        )
      }
    ];
  }

  // Default: 'Events'
  const events = [
    { timestamp: '14/09/2026 21:04:12', actor: 'AI Employee Contabilista PGC', action: 'Classificação Factura #FT2026/89', entity: 'DOC-8892', status: 'Concluído (Audit OK)' },
    { timestamp: '14/09/2026 20:58:30', actor: 'Victorino Aguiar (Admin)', action: 'Aprovação de Pagamento Kz 1.850.000', entity: 'APR-402', status: 'Aprovado' },
    { timestamp: '14/09/2026 20:45:10', actor: 'AI Employee Triagem WhatsApp', action: 'Atendimento e Lead Capturada (+244 923...)', entity: 'LEAD-104', status: 'Roteado' },
    { timestamp: '14/09/2026 20:30:05', actor: 'Sistema (Scheduler)', action: 'Backup Criptográfico de Receipts', entity: 'VAULT-01', status: 'Sincronizado' }
  ];

  return [
    {
      code: 'BOX-AUD-01-01',
      title: 'Linha Temporal de Eventos de Auditoria Imutável',
      tag: 'Event Stream',
      content: (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                <th style={{ padding: '10px' }}>DATA / HORA</th>
                <th style={{ padding: '10px' }}>ACTOR</th>
                <th style={{ padding: '10px' }}>ACÇÃO EXECUTADA</th>
                <th style={{ padding: '10px' }}>ENTIDADE</th>
                <th style={{ padding: '10px' }}>RESULTADO</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, idx) => (
                <tr key={idx} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: '0.75rem' }}>{e.timestamp}</td>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{e.actor}</td>
                  <td style={{ padding: '10px' }}>{e.action}</td>
                  <td style={{ padding: '10px', fontFamily: 'monospace', color: '#38bdf8' }}>{e.entity}</td>
                  <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }
  ];
}

export const SettingsSchedulerScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Geral');
  const isDark = useIsDark();
  const nav = useNavigation();

  return (
    <ScreenLayout
      moduleCode="SET-01"
      title="Configurações, Notificações & Scheduler"
      subtitle="Configurar notificações, horários, resumos, preferências, SLA, recorrências e delivery."
      breadcrumbs={['Plataforma', 'Configurações']}
      buttons={[
        { label: 'Guardar', primary: true, onClick: () => alert('Configurações do sistema guardadas com sucesso.') },
        { label: 'Testar Notificação', onClick: () => alert('Notificação de teste enviada com sucesso para os canais configurados.') },
        { label: 'Nova Recorrência', onClick: () => setActiveTab('Scheduler') },
        {
          label: 'Desactivar',
          onClick: () => {
            if (confirm('Deseja desactivar os agendamentos automáticos seleccionados?')) {
              alert('Agendamentos desactivados.');
            }
          }
        },
        {
          label: 'Restaurar Defaults',
          onClick: () => {
            if (confirm('Restaurar todas as configurações de fábrica?')) {
              alert('Configurações de fábrica restauradas com sucesso.');
            }
          }
        }
      ]}
      kpis={[
        { label: 'Automações', value: '14', change: 'Ativas', statusColor: COLORS.operacao },
        { label: 'Notificações activas', value: '8', change: 'Canais ativos', statusColor: COLORS.sucesso },
        { label: 'Schedules', value: '24', change: 'Briefings & Cron', statusColor: COLORS.ia },
        { label: 'Falhas', value: '0', change: 'Zero erros de disparo', statusColor: COLORS.sucesso }
      ]}
      tabs={['Geral', 'Notificações', 'Scheduler', 'Briefings', 'SLA', 'Delivery', 'Preferências']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForSettingsScheduler(activeTab, isDark, nav)}
      promptsBase={['MPR-033', 'MPR-008', 'MPR-010']}
      inventoryButtons={['01 Guardar', '02 Testar Notificação', '03 Nova Recorrência', '04 Desactivar', '05 Restaurar Defaults']}
      inventoryKpis={['01 Automações', '02 Notificações activas', '03 Schedules', '04 Falhas']}
      inventoryTabs={['01 Geral', '02 Notificações', '03 Scheduler', '04 Briefings', '05 SLA', '06 Delivery']}
    />
  );
};

function getBoxesForSettingsScheduler(activeTab: string, isDark: boolean, nav: any) {
  if (activeTab === 'Scheduler') {
    const schedules = [
      { id: 'CRON-01', task: 'Fecho Diário de Caixa & Facturação', cron: '0 18 * * 1-5', freq: 'Dias úteis às 18:00', nextRun: 'Hoje 18:00', status: 'Activo' },
      { id: 'CRON-02', task: 'Reconciliação Bancária Matinal (EMIS/BAI)', cron: '30 7 * * 1-5', freq: 'Dias úteis às 07:30', nextRun: 'Amanhã 07:30', status: 'Activo' },
      { id: 'CRON-03', task: 'Auditoria de Conformidade Fiscal SAF-T', cron: '0 8 * * 1', freq: 'Segundas-feiras às 08:00', nextRun: 'Segunda 08:00', status: 'Activo' },
      { id: 'CRON-04', task: 'Backup Criptográfico Imutável de Evidências', cron: '0 23 * * *', freq: 'Diariamente às 23:00', nextRun: 'Hoje 23:00', status: 'Activo' }
    ];
    return [
      {
        code: 'BOX-SET-SCH-01',
        title: 'Agendador de Tarefas Periódicas (Cron Engine)',
        tag: `${schedules.length} Tarefas Agendadas`,
        content: (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>TAREFA AUTOMATIZADA</th>
                  <th style={{ padding: '10px' }}>CRON EXPRESSION</th>
                  <th style={{ padding: '10px' }}>FREQUÊNCIA</th>
                  <th style={{ padding: '10px' }}>PRÓXIMA EXECUÇÃO</th>
                  <th style={{ padding: '10px' }}>ESTADO</th>
                  <th style={{ padding: '10px' }}>ACÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: 700 }}>{s.id}</td>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{s.task}</td>
                    <td style={{ padding: '10px', fontFamily: 'monospace', color: '#38bdf8' }}>{s.cron}</td>
                    <td style={{ padding: '10px' }}>{s.freq}</td>
                    <td style={{ padding: '10px', fontSize: '0.78rem', color: '#94a3b8' }}>{s.nextRun}</td>
                    <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>● {s.status}</span></td>
                    <td style={{ padding: '10px' }}>
                      <button onClick={() => alert(`Tarefa ${s.id} executada manualmente com sucesso.`)} style={{ padding: '4px 8px', borderRadius: '4px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', border: 'none', color: isDark ? '#60a5fa' : '#1d4ed8', fontSize: '0.72rem', cursor: 'pointer' }}>
                        Executar Agora
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

  if (activeTab === 'Notificações') {
    return [
      {
        code: 'BOX-SET-NOT-01',
        title: 'Canais e Alertas de Notificação',
        tag: 'WhatsApp & Email Activos',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.84rem' }}>
            <div style={{ padding: '16px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>📲 Alertas WhatsApp para Gestores</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.4' }}>
                Notificações instantâneas de pedidos de aprovação urgente (despesas &gt; Kz 500k) e incidentes operacionais enviadas directamente para o WhatsApp dos diretores.
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>● Canal: +244 923 000 000 (Activo)</div>
            </div>
            <div style={{ padding: '16px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700, marginBottom: '6px' }}>📧 Resumos Executivos por Email</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', lineHeight: '1.4' }}>
                Envio automatizado de relatório PDF com métricas diárias às 08:00 e fecho semanal às sextas-feiras às 18:30 para os sócios e gerentes.
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600 }}>● Destinatários: gerencia@marvine.ao</div>
            </div>
          </div>
        )
      }
    ];
  }

  if (activeTab === 'Briefings') {
    return [
      {
        code: 'BOX-SET-BRI-01',
        title: 'Configuração de Briefings & Resumos Inteligentes',
        tag: 'Executive AI Briefings',
        content: (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.84rem' }}>
            <div style={{ padding: '14px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700 }}>🌅 Morning Briefing (08:00)</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', margin: '6px 0 10px 0' }}>
                Resumo de caixa recebido no dia anterior, novos leads de WhatsApp por atender e aprovações financeiras pendentes para o dia.
              </div>
              <button onClick={() => alert('Disparo de Morning Briefing de teste enviado.')} style={{ padding: '6px 12px', borderRadius: '4px', background: isDark ? 'rgba(59,130,246,0.2)' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.76rem' }}>
                Gerar Briefing Matinal Agora
              </button>
            </div>
            <div style={{ padding: '14px', borderRadius: '8px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
              <div style={{ fontWeight: 700 }}>🌆 Evening Recap (18:30)</div>
              <div style={{ fontSize: '0.78rem', color: isDark ? '#94a3b8' : '#64748b', margin: '6px 0 10px 0' }}>
                Consolidação de tarefas fechadas pelos AI Employees, faturamento emitido e conformidade fiscal validada com o portal AGT.
              </div>
              <button onClick={() => alert('Disparo de Evening Recap de teste enviado.')} style={{ padding: '6px 12px', borderRadius: '4px', background: isDark ? 'rgba(59,130,246,0.2)' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.76rem' }}>
                Gerar Recap Noturno Agora
              </button>
            </div>
          </div>
        )
      }
    ];
  }

  // Default: 'Geral' or 'Preferências' or 'SLA'
  return [
    {
      code: 'BOX-SET-01-01',
      title: 'Configurações Gerais da Organização & Regionalização',
      tag: 'Localização Angola (AO)',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', fontSize: '0.84rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 700, fontSize: '0.78rem' }}>Nome da Organização</label>
            <input type="text" defaultValue="MARVINE, LDA" style={{ padding: '8px 10px', borderRadius: '6px', border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 700, fontSize: '0.78rem' }}>Número de Identificação Fiscal (NIF)</label>
            <input type="text" defaultValue="5412984928" style={{ padding: '8px 10px', borderRadius: '6px', border: isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid #cbd5e1', background: isDark ? '#1e293b' : '#fff', color: isDark ? '#fff' : '#000' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 700, fontSize: '0.78rem' }}>Fuso Horário</label>
            <input type="text" defaultValue="África/Luanda (WAT, GMT+1)" disabled style={{ padding: '8px 10px', borderRadius: '6px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', background: isDark ? '#0f172a' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 700, fontSize: '0.78rem' }}>Moeda Padrão</label>
            <input type="text" defaultValue="Kwanza Angolano (AOA, Kz)" disabled style={{ padding: '8px 10px', borderRadius: '6px', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e2e8f0', background: isDark ? '#0f172a' : '#f1f5f9', color: isDark ? '#94a3b8' : '#64748b' }} />
          </div>
        </div>
      )
    },
    {
      code: 'BOX-SET-01-02',
      title: 'Limiares de SLA Operacional',
      tag: 'Tempos de Resposta',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', fontSize: '0.82rem' }}>
          <div style={{ padding: '12px', borderRadius: '6px', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 600 }}>Triagem de Mensagens WhatsApp</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>&lt; 2 minutos</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '6px', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 600 }}>Aprovação de Despesas</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>&lt; 30 minutos</div>
          </div>
          <div style={{ padding: '12px', borderRadius: '6px', background: isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e2e8f0' }}>
            <div style={{ fontWeight: 600 }}>Resolução de Incidentes Críticos</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px' }}>&lt; 15 minutos</div>
          </div>
        </div>
      )
    }
  ];
}

export const MasterPromptRegistryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Registry');
  const isDark = useIsDark();
  const nav = useNavigation();

  return (
    <ScreenLayout
      moduleCode="ADMIN-01"
      title="Master Prompt Registry & System Governance"
      subtitle="Governação dos 33 prompts canónicos, versões, dependências, supersession, implementação e ordem arquitectural."
      breadcrumbs={['Plataforma', 'Prompt Registry']}
      buttons={[
        {
          label: 'Adicionar Prompt',
          primary: true,
          onClick: () => {
            const p = prompt('Código e Título do novo Prompt (Ex: MPR-034 - Autonomous Reconciliation):');
            if (p) alert(`Prompt "${p}" adicionado ao registo.`);
          }
        },
        {
          label: 'Nova Versão',
          onClick: () => alert('Nova revisão de prompt versionada (v2.1) com histórico de alterações guardado.')
        },
        { label: 'Marcar Substituído', onClick: () => setActiveTab('Supersession') },
        { label: 'Comparar', onClick: () => setActiveTab('Conflitos') },
        { label: 'Abrir Ficheiro', onClick: () => alert('Prompt canónico aberto no inspector de templates do sistema.') }
      ]}
      kpis={[
        { label: 'Prompts activos', value: '33 / 33', change: '100% Implementados', statusColor: COLORS.sucesso },
        { label: 'Legacy', value: '2', change: 'Substituídos (ex: 500/300/200)', statusColor: COLORS.revisao },
        { label: 'Sobreposições', value: '0', change: 'Zero conflitos de escopo', statusColor: COLORS.sucesso },
        { label: 'Dependências quebradas', value: '0', change: 'Grafos consistentes', statusColor: COLORS.sucesso }
      ]}
      tabs={['Registry', 'Dependências', 'Supersession', 'Implementação', 'Conflitos', 'Histórico']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={getBoxesForPromptRegistry(activeTab, isDark, nav)}
      promptsBase={['MPR-001', 'MPR-002']}
      inventoryButtons={['01 Adicionar Prompt', '02 Nova Versão', '03 Marcar Substituído', '04 Comparar', '05 Abrir Ficheiro']}
      inventoryKpis={['01 Prompts activos', '02 Legacy', '03 Sobreposições', '04 Dependências quebradas']}
      inventoryTabs={['01 Registry', '02 Dependências', '03 Supersession', '04 Implementação', '05 Conflitos', '06 Histórico']}
    />
  );
};

function getBoxesForPromptRegistry(activeTab: string, isDark: boolean, nav: any) {
  const prompts = [
    { code: 'MPR-001', title: 'Operational Center & Global Shell', version: 'v2.1', category: 'Overview', status: 'Ativo' },
    { code: 'MPR-002', title: 'Employee Workforce & 500 Role Catalog', version: 'v2.1', category: 'Workforce', status: 'Ativo' },
    { code: 'MPR-003', title: 'WorkCenter, Conversations & Tasks', version: 'v2.1', category: 'Operations', status: 'Ativo' },
    { code: 'MPR-004', title: 'Knowledge Base & Evidence Lineage (MNCA)', version: 'v2.1', category: 'Knowledge', status: 'Ativo' },
    { code: 'MPR-005', title: 'Omnichannel & WhatsApp Customer Experience', version: 'v2.1', category: 'Communications', status: 'Ativo' },
    { code: 'MPR-006', title: 'Integrations, Connectors & Local Daemons', version: 'v2.1', category: 'Platform', status: 'Ativo' },
    { code: 'MPR-007', title: 'Security, Autonomy, Risk & Kill Switch', version: 'v2.1', category: 'Platform', status: 'Ativo' },
    { code: 'MPR-008', title: 'Audit Evidence Receipts & SHA-256 Hashes', version: 'v2.1', category: 'Platform', status: 'Ativo' },
    { code: 'MPR-009', title: 'Commerce, Billing, Invoices & Subscriptions', version: 'v2.1', category: 'Commerce', status: 'Ativo' }
  ];

  return [
    {
      code: 'BOX-ADMIN-01-01',
      title: `Registo de Prompts Canónicos (${activeTab})`,
      tag: '33 Master Prompts Catalogados',
      content: (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #cbd5e1', color: isDark ? '#94a3b8' : '#64748b' }}>
                <th style={{ padding: '10px' }}>CÓDIGO</th>
                <th style={{ padding: '10px' }}>TÍTULO DO MASTER PROMPT</th>
                <th style={{ padding: '10px' }}>CATEGORIA</th>
                <th style={{ padding: '10px' }}>VERSÃO</th>
                <th style={{ padding: '10px' }}>ESTADO</th>
                <th style={{ padding: '10px' }}>ACÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {prompts.map((p) => (
                <tr key={p.code} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8' }}>{p.code}</td>
                  <td style={{ padding: '10px', fontWeight: 600 }}>{p.title}</td>
                  <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', color: isDark ? '#60a5fa' : '#1d4ed8', fontSize: '0.72rem' }}>{p.category}</span></td>
                  <td style={{ padding: '10px', fontFamily: 'monospace' }}>{p.version}</td>
                  <td style={{ padding: '10px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', fontWeight: 700 }}>● {p.status}</span></td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => alert(`Prompt ${p.code} aberto no inspector de templates.`)} style={{ padding: '4px 8px', borderRadius: '4px', background: isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9', border: 'none', color: isDark ? '#f8fafc' : '#0f172a', fontSize: '0.72rem', cursor: 'pointer' }}>
                      Inspeccionar
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

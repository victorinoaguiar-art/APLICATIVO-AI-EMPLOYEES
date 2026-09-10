const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../apps/web/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Update lucide-react imports to include BookOpen
if (!content.includes('BookOpen,')) {
  content = content.replace(
    "  Terminal\n} from 'lucide-react';",
    "  Terminal,\n  BookOpen\n} from 'lucide-react';"
  );
}

// 2. Update @ai-employee/shared imports
if (!content.includes('RoleKnowledgeProfile,')) {
  content = content.replace(
    "  EmployeeHandoffEnvelope\n} from '@ai-employee/shared';",
    "  EmployeeHandoffEnvelope,\n  RoleKnowledgeProfile,\n  ORDKSQueryResult\n} from '@ai-employee/shared';"
  );
}

// 3. Update @ai-employee/runtime imports
if (!content.includes('RoleKnowledgeProfileRegistry,')) {
  content = content.replace(
    "  SystemEventWebhookAdapter\n} from '@ai-employee/runtime';",
    "  SystemEventWebhookAdapter,\n  RoleKnowledgeProfileRegistry,\n  ORDKSEngine,\n  ExceptionLibraryEngine,\n  ANGOLA_JURISDICTION_PACK\n} from '@ai-employee/runtime';"
  );
}

// 4. Update translations
const ptOrdksTrans = `    navOrdks: 'ORDKS & Realidade Operacional',
    ordksTitle: 'Operational Reality & Domain Knowledge System (ORDKS)',
    ordksSubtitle: 'Conhecimento Profissional, Realidade Operacional, Regulamentos Angola (AGT/PGCA/INSS) & Biblioteca de Excepções',
    ordksProfileExplorerTab: 'Perfis de Conhecimento (500)',
    ordksPrecedenceSimTab: 'Simulador de Precedência (11 Níveis)',
    ordksAngolaPackTab: 'Angola Jurisdiction Pack',
    ordksExceptionsTab: 'Biblioteca de Excepções',`;

const enOrdksTrans = `    navOrdks: 'ORDKS & Operational Reality',
    ordksTitle: 'Operational Reality & Domain Knowledge System (ORDKS)',
    ordksSubtitle: 'Professional Knowledge, Operational Reality, Angola Regulations (AGT/PGCA/INSS) & Exception Library',
    ordksProfileExplorerTab: 'Knowledge Profiles (500)',
    ordksPrecedenceSimTab: 'Precedence Simulator (11 Levels)',
    ordksAngolaPackTab: 'Angola Jurisdiction Pack',
    ordksExceptionsTab: 'Exception Library',`;

if (!content.includes('navOrdks:')) {
  content = content.replace("    navGateway: 'Gateway UTCEG & Comandos',", `${ptOrdksTrans}\n    navGateway: 'Gateway UTCEG & Comandos',`);
  content = content.replace("    navGateway: 'UTCEG Gateway & Commands',", `${enOrdksTrans}\n    navGateway: 'UTCEG Gateway & Commands',`);
}

// 5. Update activeTab state type
if (!content.includes("'ordks'")) {
  content = content.replace(
    "const [activeTab, setActiveTab] = useState<'catalog' | 'gateway'",
    "const [activeTab, setActiveTab] = useState<'catalog' | 'ordks' | 'gateway'"
  );
}

// 6. Add ORDKS State inside ControlPlaneDashboard
const ordksStateCode = `
  // ORDKS State & Engines
  const [ordksEngine] = useState(() => new ORDKSEngine());
  const [ordksRegistry] = useState(() => RoleKnowledgeProfileRegistry.getInstance());
  const [ordksExceptionEngine] = useState(() => ExceptionLibraryEngine.getInstance());

  const [ordksSubTab, setOrdksSubTab] = useState<'profiles' | 'precedence' | 'angola' | 'exceptions'>('profiles');
  const [ordksSelectedRoleId, setOrdksSelectedRoleId] = useState<string>('73');
  const [ordksQueryInputText, setOrdksQueryInputText] = useState<string>('Demonstrações financeiras e retenção na fonte IVA AGT Angola');
  const [ordksSimResult, setOrdksSimResult] = useState<ORDKSQueryResult | null>(null);

  const handleRunOrdksQuery = () => {
    const roleIdNum = Number(ordksSelectedRoleId) || 73;
    const role = CANONICAL_500_ROLES.find(r => r.id === String(roleIdNum)) || CANONICAL_500_ROLES[0];
    const res = ordksEngine.queryKnowledge({
      organizationId: cmdTenantId,
      tenantId: cmdTenantId,
      employeeId: roleIdNum,
      roleKey: role.role_key,
      department: role.department,
      queryText: ordksQueryInputText
    });
    setOrdksSimResult(res);
  };
`;

if (!content.includes('ordksEngine')) {
  content = content.replace(
    "  // UTCEG Gateway & Command Center State",
    `${ordksStateCode}\n  // UTCEG Gateway & Command Center State`
  );
}

// 7. Add Sidebar Nav Item
const sidebarOrdksItem = `
          <button onClick={() => setActiveTab('ordks')} style={sidebarItemStyle('ordks')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <BookOpen size={18} />
              <span>{t.navOrdks}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: theme === 'dark' ? '#34d399' : '#059669', fontWeight: 600 }}>500</span>
          </button>`;

if (!content.includes("setActiveTab('ordks')")) {
  content = content.replace(
    "          <button onClick={() => setActiveTab('catalog')} style={sidebarItemStyle('catalog')}>",
    `          <button onClick={() => setActiveTab('catalog')} style={sidebarItemStyle('catalog')}>`
  );
  content = content.replace(
    `          <button onClick={() => setActiveTab('gateway')} style={sidebarItemStyle('gateway')}>`,
    `${sidebarOrdksItem}\n          <button onClick={() => setActiveTab('gateway')} style={sidebarItemStyle('gateway')}>`
  );
}

// 8. Add ORDKS Tab UI Block
const ordksTabUI = `
          {/* TAB: ORDKS & OPERATIONAL REALITY */}
          {activeTab === 'ordks' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BookOpen color="#10b981" size={24} />
                    {t.ordksTitle}
                  </h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {t.ordksSubtitle}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> 500/500 Perfis Validados
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} /> 11 Níveis de Precedência
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Globe size={14} /> Angola AGT/PGCA Native
                  </span>
                </div>
              </div>

              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>
                <button
                  onClick={() => setOrdksSubTab('profiles')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: ordksSubTab === 'profiles' ? (theme === 'dark' ? '#064e3b' : '#dcfce7') : 'transparent',
                    color: ordksSubTab === 'profiles' ? (theme === 'dark' ? '#34d399' : '#166534') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Users size={16} />
                  {t.ordksProfileExplorerTab}
                </button>
                <button
                  onClick={() => setOrdksSubTab('precedence')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: ordksSubTab === 'precedence' ? (theme === 'dark' ? '#064e3b' : '#dcfce7') : 'transparent',
                    color: ordksSubTab === 'precedence' ? (theme === 'dark' ? '#34d399' : '#166534') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Sliders size={16} />
                  {t.ordksPrecedenceSimTab}
                </button>
                <button
                  onClick={() => setOrdksSubTab('angola')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: ordksSubTab === 'angola' ? (theme === 'dark' ? '#064e3b' : '#dcfce7') : 'transparent',
                    color: ordksSubTab === 'angola' ? (theme === 'dark' ? '#34d399' : '#166534') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Globe size={16} />
                  {t.ordksAngolaPackTab}
                </button>
                <button
                  onClick={() => setOrdksSubTab('exceptions')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: ordksSubTab === 'exceptions' ? (theme === 'dark' ? '#064e3b' : '#dcfce7') : 'transparent',
                    color: ordksSubTab === 'exceptions' ? (theme === 'dark' ? '#34d399' : '#166534') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertTriangle size={16} />
                  {t.ordksExceptionsTab}
                </button>
              </div>

              {/* SUB-TAB 1: ROLE KNOWLEDGE PROFILES 500/500 */}
              {ordksSubTab === 'profiles' && (
                <div>
                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px' }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                      Selecionar Empregado IA (1 - 500)
                    </label>
                    <select
                      value={ordksSelectedRoleId}
                      onChange={(e) => setOrdksSelectedRoleId(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                    >
                      {translatedRoles.map((r: any) => (
                        <option key={r.id} value={r.id}>
                          #{r.id} - {r.display_name} ({r.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const roleIdNum = Number(ordksSelectedRoleId) || 73;
                    const profile = ordksRegistry.getRoleProfile(roleIdNum);
                    const role = translatedRoles.find((r: any) => r.id === ordksSelectedRoleId) || translatedRoles[0];

                    if (!profile) return null;

                    return (
                      <div className="glass-card" style={{ padding: '28px', borderRadius: '16px' }}>
                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 700 }}>
                              Role Knowledge Profile V1.0
                            </span>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '8px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                              #{profile.employeeId} - {profile.displayName}
                            </h3>
                            <div style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                              Departamento: {profile.department} | Role Key: {profile.roleKey}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#10b981' }}>Conceitos Fundamentais de Domínio</h4>
                              <ul style={{ fontSize: '0.85rem', paddingLeft: '18px', margin: 0 }}>
                                {profile.coreConcepts.map((c, i) => <li key={i} style={{ marginBottom: '4px' }}>{c}</li>)}
                              </ul>
                            </div>

                            <div style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#6366f1' }}>Workflow Operacional Típico</h4>
                              <ol style={{ fontSize: '0.85rem', paddingLeft: '18px', margin: 0 }}>
                                {profile.normalWorkflow.map((w, i) => <li key={i} style={{ marginBottom: '4px' }}>{w}</li>)}
                              </ol>
                            </div>

                            <div style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#f59e0b' }}>Documentos & Sistemas Utilizados</h4>
                              <div style={{ fontSize: '0.85rem' }}>
                                <div>Documentos: <strong>{profile.documentsEncountered.join(', ')}</strong></div>
                                <div>Sistemas: <strong>{profile.systemsUsed.join(', ')}</strong></div>
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#ef4444' }}>Regras de Decisão & Validação</h4>
                              <ul style={{ fontSize: '0.85rem', paddingLeft: '18px', margin: 0 }}>
                                {profile.decisionRules.map((r, i) => <li key={i} style={{ marginBottom: '4px' }}>{r}</li>)}
                              </ul>
                            </div>

                            <div style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                              <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '8px', color: '#38bdf8' }}>Evidências Exigidas & KPIs de Qualidade</h4>
                              <div style={{ fontSize: '0.85rem' }}>
                                <div>Evidências: <strong>{profile.evidenceRequirements.join(', ')}</strong></div>
                                <div style={{ marginTop: '4px' }}>KPIs: <strong>{profile.relevantKpis.join(', ')}</strong></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* SUB-TAB 2: PRECEDENCE SIMULATOR */}
              {ordksSubTab === 'precedence' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sliders size={18} color="#10b981" />
                      Consulta de Conhecimento & Resolução de Precedência
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Prompt / Pergunta Operacional
                      </label>
                      <textarea
                        rows={4}
                        value={ordksQueryInputText}
                        onChange={(e) => setOrdksQueryInputText(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', fontSize: '0.9rem' }}
                      />
                    </div>

                    <button
                      onClick={handleRunOrdksQuery}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <BookOpen size={18} /> Executar Consulta no Motor ORDKS
                    </button>
                  </div>

                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Layers size={18} color="#6366f1" />
                      Resultado da Síntese & Stack de Precedência
                    </h3>

                    {ordksSimResult ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.85rem' }}>
                          <strong>{ordksSimResult.synthesisSummary}</strong>
                        </div>

                        <div style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9' }}>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '6px' }}>Stack de Precedência de Conhecimento (11 Níveis)</div>
                          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#818cf8', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {ordksSimResult.appliedPrecedenceHierarchy.map((h, i) => (
                              <div key={i}>{h}</div>
                            ))}
                          </div>
                        </div>

                        <div style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#020617' : '#0f172a', color: '#38bdf8', fontSize: '0.75rem', fontFamily: 'monospace', maxHeight: '180px', overflowY: 'auto' }}>
                          {JSON.stringify(ordksSimResult.matchedKnowledgeItems, null, 2)}
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '48px', textAlign: 'center', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                        <BookOpen size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.9rem' }}>Execute uma consulta para testar a ordenação por grau de autoridade (11 níveis) e o enquadramento de Angola.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: ANGOLA JURISDICTION PACK */}
              {ordksSubTab === 'angola' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={20} color="#f59e0b" />
                      Angola Jurisdiction Pack — Enquadramento Fiscal e Legal Native
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569', marginBottom: '20px' }}>
                      Normativos legais e impostos de Angola integrados por defeito na plataforma para todos os Empregados IA de Finanças, Contabilidade, Fiscal, Jurídico e Recursos Humanos.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      {ANGOLA_JURISDICTION_PACK.legalFrameworks.map((lf) => (
                        <div key={lf.code} style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '8px', background: '#f59e0b', color: '#000', display: 'inline-block', marginBottom: '6px' }}>
                            {lf.code}
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '4px' }}>
                            {lf.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#818cf8', marginBottom: '6px' }}>
                            Autoridade: {lf.authority}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: theme === 'dark' ? '#9ca3af' : '#475569' }}>
                            {lf.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: EXCEPTIONS LIBRARY */}
              {ordksSubTab === 'exceptions' && (
                <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertTriangle size={20} color="#ef4444" />
                    Biblioteca de Excepções Operacionais & Erros Frequentes
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {ordksExceptionEngine.getAllExceptions().map((exc) => (
                      <div key={exc.exceptionId} style={{ padding: '16px', borderRadius: '12px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '4px 10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                            {exc.code}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                            Departamento: {exc.department}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a', marginBottom: '8px' }}>
                          {exc.title}
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.85rem' }}>
                          <div>
                            <div>Sintomas: <strong>{exc.symptoms.join(', ')}</strong></div>
                            <div>Causa Raiz: <strong>{exc.rootCauses.join(', ')}</strong></div>
                          </div>
                          <div>
                            <div>Procedimento Contingência: <strong>{exc.workaroundProcedure.join(' → ')}</strong></div>
                            <div>Gatilho Escalação: <strong style={{ color: '#ef4444' }}>{exc.escalationTrigger}</strong></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
`;

if (!content.includes("{/* TAB: ORDKS & OPERATIONAL REALITY */}")) {
  content = content.replace(
    "{/* TAB: UTCEG GATEWAY */}",
    `${ordksTabUI}\n          {/* TAB: UTCEG GATEWAY */}`
  );
}

fs.writeFileSync(pagePath, content, 'utf8');
console.log('page.tsx successfully updated with ORDKS tab!');

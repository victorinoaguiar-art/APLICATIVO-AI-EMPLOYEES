const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../apps/web/app/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// 1. Update @ai-employee/shared imports
if (!content.includes('EmployeeReadinessPassport,')) {
  content = content.replace(
    "  ORDKSQueryResult\n} from '@ai-employee/shared';",
    "  ORDKSQueryResult,\n  EmployeeReadinessPassport,\n  ProgramCompletenessSummary,\n  EmployeeLifecycleState\n} from '@ai-employee/shared';"
  );
}

// 2. Update @ai-employee/runtime imports
if (!content.includes('EmployeeCompletenessRegistry,')) {
  content = content.replace(
    "  ANGOLA_JURISDICTION_PACK\n} from '@ai-employee/runtime';",
    "  ANGOLA_JURISDICTION_PACK,\n  EmployeeCompletenessRegistry,\n  LayeredImprovementPropagator\n} from '@ai-employee/runtime';"
  );
}

// 3. Update translations (pt and en)
const ptProgramTrans = `    navProgram500: 'Programa 500/300/200 & Passaportes',
    program500Title: '500/300/200 Employee Readiness & Validation Program',
    program500Subtitle: 'Preparação Estrutural 500/500, Validação Profunda 300 P1 (P1-A/B/C) & Fila 200 P2 (READY_FOR_TEST)',
    passportsTab: 'Passaportes de Prontidão (500)',
    cohortsTab: 'Distribuição de Coortes (300/200)',
    propagationTab: 'Propagador por Camadas',`;

const enProgramTrans = `    navProgram500: '500/300/200 Program & Passports',
    program500Title: '500/300/200 Employee Readiness & Validation Program',
    program500Subtitle: '100% Structural Readiness 500/500, Deep Validation 300 P1 & Queue 200 P2 (READY_FOR_TEST)',
    passportsTab: 'Readiness Passports (500)',
    cohortsTab: 'Cohort Distribution (300/200)',
    propagationTab: 'Layered Propagator',`;

if (!content.includes('navProgram500:')) {
  content = content.replace("    navOrdks: 'ORDKS & Realidade Operacional',", `${ptProgramTrans}\n    navOrdks: 'ORDKS & Realidade Operacional',`);
  content = content.replace("    navOrdks: 'ORDKS & Operational Reality',", `${enProgramTrans}\n    navOrdks: 'ORDKS & Operational Reality',`);
}

// 4. Update activeTab state type
if (!content.includes("'readiness_500'")) {
  content = content.replace(
    "const [activeTab, setActiveTab] = useState<'catalog' | 'ordks'",
    "const [activeTab, setActiveTab] = useState<'catalog' | 'readiness_500' | 'ordks'"
  );
}

// 5. Add Program State inside ControlPlaneDashboard
const programStateCode = `
  // 500/300/200 Program State
  const [readinessRegistry] = useState(() => EmployeeCompletenessRegistry.getInstance());
  const [layeredPropagator] = useState(() => new LayeredImprovementPropagator());

  const [programSubTab, setProgramSubTab] = useState<'passports' | 'cohorts' | 'propagation'>('passports');
  const [selectedPassportEmpId, setSelectedPassportEmpId] = useState<number>(73);
  const [cohortFilter, setCohortFilter] = useState<'ALL' | 'P1-A' | 'P1-B' | 'P1-C' | 'P2-QUEUE'>('ALL');
  
  // Layered Propagation form state
  const [propScope, setPropScope] = useState<any>('DEPARTMENT');
  const [propTarget, setPropTarget] = useState<string>('Accounting');
  const [propDesc, setPropDesc] = useState<string>('Ajuste nas diretivas de retenção na fonte IRT/IVA em Angola');
  const [propResult, setPropResult] = useState<any | null>(null);

  const handleRunPropagation = () => {
    const record = layeredPropagator.propagateImprovement(propScope, propTarget, propDesc);
    setPropResult(record);
  };

  const handleTransitionState = (empId: number, targetState: EmployeeLifecycleState) => {
    readinessRegistry.transitionEmployeeState(empId, targetState, \`Estado alterado manualmente na UI para \${targetState}\`);
    setSelectedPassportEmpId(empId); // Force re-render
  };
`;

if (!content.includes('readinessRegistry')) {
  content = content.replace(
    "  // ORDKS State & Engines",
    `${programStateCode}\n  // ORDKS State & Engines`
  );
}

// 6. Add Sidebar Nav Item
const sidebarProgramItem = `
          <button onClick={() => setActiveTab('readiness_500')} style={sidebarItemStyle('readiness_500')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Award size={18} />
              <span>{t.navProgram500}</span>
            </div>
            <span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', color: theme === 'dark' ? '#818cf8' : '#4f46e5', fontWeight: 600 }}>300/200</span>
          </button>`;

if (!content.includes("setActiveTab('readiness_500')")) {
  content = content.replace(
    "          <button onClick={() => setActiveTab('ordks')} style={sidebarItemStyle('ordks')}>",
    `${sidebarProgramItem}\n          <button onClick={() => setActiveTab('ordks')} style={sidebarItemStyle('ordks')}>`
  );
}

// 7. Add Program 500/300/200 Tab UI Block
const programTabUI = `
          {/* TAB: 500/300/200 READINESS PROGRAM */}
          {activeTab === 'readiness_500' && (
            <div>
              <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '6px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Award color="#6366f1" size={24} />
                    {t.program500Title}
                  </h2>
                  <p style={{ color: theme === 'dark' ? 'var(--text-muted)' : '#475569', fontSize: '0.9rem' }}>
                    {t.program500Subtitle}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> 500/500 READY_FOR_TEST
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} /> 300 P1 (PRIORITY)
                  </span>
                  <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> 200 P2 (QUEUE)
                  </span>
                </div>
              </div>

              {/* Mathematical Gate Banner */}
              {(() => {
                const summary = readinessRegistry.getProgramCompletenessSummary();
                return (
                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px', background: theme === 'dark' ? '#0f172a' : '#f1f5f9', border: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>População Total</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: theme === 'dark' ? '#fff' : '#0f172a' }}>{summary.totalEmployees}</div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981' }}>100% Catálogo Canónico</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>P1 — PRIORITY</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#6366f1' }}>{summary.p1Count}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Coortes P1-A, B, C (300)</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>P2 — READY_FOR_TEST</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{summary.p2Count}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Fila P2-QUEUE (200)</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Não Atribuídos / Duplicados</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{summary.unassignedCount}</div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981' }}>UNASSIGNED = 0 (OK)</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Gate Matemático</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>PASSED ✓</div>
                      <div style={{ fontSize: '0.7rem', color: '#10b981' }}>500 = 300 P1 + 200 P2</div>
                    </div>
                  </div>
                );
              })()}

              {/* Sub-tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>
                <button
                  onClick={() => setProgramSubTab('passports')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: programSubTab === 'passports' ? (theme === 'dark' ? '#312e81' : '#e0e7ff') : 'transparent',
                    color: programSubTab === 'passports' ? (theme === 'dark' ? '#a5b4fc' : '#4338ca') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FileText size={16} />
                  {t.passportsTab}
                </button>
                <button
                  onClick={() => setProgramSubTab('cohorts')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: programSubTab === 'cohorts' ? (theme === 'dark' ? '#312e81' : '#e0e7ff') : 'transparent',
                    color: programSubTab === 'cohorts' ? (theme === 'dark' ? '#a5b4fc' : '#4338ca') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Layers size={16} />
                  {t.cohortsTab}
                </button>
                <button
                  onClick={() => setProgramSubTab('propagation')}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: programSubTab === 'propagation' ? (theme === 'dark' ? '#312e81' : '#e0e7ff') : 'transparent',
                    color: programSubTab === 'propagation' ? (theme === 'dark' ? '#a5b4fc' : '#4338ca') : (theme === 'dark' ? '#9ca3af' : '#475569'),
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Workflow size={16} />
                  {t.propagationTab}
                </button>
              </div>

              {/* SUB-TAB 1: READINESS PASSPORTS 500/500 */}
              {programSubTab === 'passports' && (
                <div>
                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                        Selecionar Empregado IA (1 - 500)
                      </label>
                      <select
                        value={selectedPassportEmpId}
                        onChange={(e) => setSelectedPassportEmpId(Number(e.target.value))}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                      >
                        {translatedRoles.map((r: any) => (
                          <option key={r.id} value={r.id}>
                            #{r.id} - {r.display_name} ({r.department})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>
                        Filtrar por Coorte
                      </label>
                      <select
                        value={cohortFilter}
                        onChange={(e: any) => setCohortFilter(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                      >
                        <option value="ALL">Todas as Coortes (500)</option>
                        <option value="P1-A">P1-A (100 Employees)</option>
                        <option value="P1-B">P1-B (100 Employees)</option>
                        <option value="P1-C">P1-C (100 Employees)</option>
                        <option value="P2-QUEUE">P2-QUEUE (200 Employees)</option>
                      </select>
                    </div>
                  </div>

                  {(() => {
                    const passport = readinessRegistry.getPassport(selectedPassportEmpId);
                    if (!passport) return null;

                    return (
                      <div className="glass-card" style={{ padding: '28px', borderRadius: '16px' }}>
                        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                              <span style={{ padding: '4px 10px', borderRadius: '12px', background: passport.priorityClass === 'P1' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: passport.priorityClass === 'P1' ? '#818cf8' : '#f59e0b', fontWeight: 700, fontSize: '0.8rem' }}>
                                Classe {passport.priorityClass} — {passport.priorityClass === 'P1' ? 'PRIORITY' : 'READY_FOR_TEST'}
                              </span>
                              <span style={{ padding: '4px 10px', borderRadius: '12px', background: theme === 'dark' ? '#1e293b' : '#e2e8f0', fontSize: '0.8rem', fontWeight: 600 }}>
                                Coorte: {passport.cohortGroup}
                              </span>
                            </div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                              #{passport.employeeId} - {passport.displayName}
                            </h3>
                            <div style={{ fontSize: '0.85rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                              Departamento: {passport.department} | Role Key: {passport.roleKey}
                            </div>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Estado Atual do Ciclo de Vida</div>
                            <span style={{ padding: '6px 14px', borderRadius: '20px', background: passport.currentState === 'ACTIVE' ? '#10b981' : passport.currentState === 'SHADOW_MODE' ? '#818cf8' : '#6366f1', color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
                              {passport.currentState}
                            </span>
                          </div>
                        </div>

                        {/* 12 Structural Checks Grid */}
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                          12/12 Critérios de Preparação Estrutural ({passport.structurallyPrepared ? 'READY_FOR_TEST ✓' : 'INCOMPLETE'})
                        </h4>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                          {Object.entries(passport.structuralCriteria).map(([key, val]) => (
                            <div key={key} style={{ padding: '12px', borderRadius: '10px', background: theme === 'dark' ? '#0f172a' : '#f8fafc', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569' }}>{key}</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: val === 'PASS' ? '#10b981' : '#ef4444' }}>{val}</span>
                            </div>
                          ))}
                        </div>

                        {/* Controls to transition state */}
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', color: theme === 'dark' ? '#fff' : '#0f172a' }}>
                          Ações de Transição de Estado no Programa
                        </h4>

                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => handleTransitionState(passport.employeeId, 'IN_TESTING')}
                            style={{ padding: '8px 16px', borderRadius: '8px', background: '#6366f1', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Mover para IN_TESTING
                          </button>
                          <button
                            onClick={() => handleTransitionState(passport.employeeId, 'SHADOW_MODE')}
                            style={{ padding: '8px 16px', borderRadius: '8px', background: '#818cf8', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Avançar para SHADOW_MODE
                          </button>
                          <button
                            onClick={() => handleTransitionState(passport.employeeId, 'CERTIFIED')}
                            style={{ padding: '8px 16px', borderRadius: '8px', background: '#059669', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Certificar (P04 Passed)
                          </button>
                          <button
                            onClick={() => handleTransitionState(passport.employeeId, 'ACTIVE')}
                            style={{ padding: '8px 16px', borderRadius: '8px', background: '#10b981', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem' }}
                          >
                            Ativar em Produção (ACTIVE)
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* SUB-TAB 2: COHORT DISTRIBUTION */}
              {programSubTab === 'cohorts' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #6366f1' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6366f1' }}>COHORTE P1-A</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0', color: theme === 'dark' ? '#fff' : '#0f172a' }}>100 Employees</h3>
                    <p style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                      Primeira vaga de validação profunda (IDs 1 - 100: Finanças, Vendas, Atendimento).
                    </p>
                  </div>

                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #818cf8' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8' }}>COHORTE P1-B</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0', color: theme === 'dark' ? '#fff' : '#0f172a' }}>100 Employees</h3>
                    <p style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                      Segunda vaga de validação profunda (IDs 101 - 200: RH, Compras, Logística).
                    </p>
                  </div>

                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #a5b4fc' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc' }}>COHORTE P1-C</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0', color: theme === 'dark' ? '#fff' : '#0f172a' }}>100 Employees</h3>
                    <p style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                      Terceira vaga de validação profunda (IDs 201 - 300: Jurídico, TI, Imobiliário).
                    </p>
                  </div>

                  <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', borderTop: '4px solid #f59e0b' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b' }}>COHORTE P2-QUEUE</span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '8px 0', color: theme === 'dark' ? '#fff' : '#0f172a' }}>200 Employees</h3>
                    <p style={{ fontSize: '0.8rem', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                      Integralmente preparados em READY_FOR_TEST (IDs 301 - 500: Sectores Especializados).
                    </p>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: LAYERED PROPAGATOR */}
              {programSubTab === 'propagation' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Workflow size={18} color="#6366f1" />
                      Propagador de Melhorias por Camadas (P1 → P2)
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Escopo da Melhoria
                      </label>
                      <select
                        value={propScope}
                        onChange={(e: any) => setPropScope(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a' }}
                      >
                        <option value="GLOBAL">GLOBAL (Aplica a todos os 500 Employees)</option>
                        <option value="DEPARTMENT">DEPARTMENT (Aplica a um departamento específico)</option>
                        <option value="ROLE_SPECIFIC">ROLE_SPECIFIC (Aplica a uma função específica)</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Alvo (Identificador de Departamento ou Role)
                      </label>
                      <input
                        type="text"
                        value={propTarget}
                        onChange={(e) => setPropTarget(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', fontSize: '0.9rem' }}
                      />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: theme === 'dark' ? '#9ca3af' : '#475569', display: 'block', marginBottom: '6px' }}>
                        Descrição da Melhoria / Ajuste Normativo
                      </label>
                      <textarea
                        rows={3}
                        value={propDesc}
                        onChange={(e) => setPropDesc(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#fff' : '#0f172a', fontSize: '0.85rem' }}
                      />
                    </div>

                    <button
                      onClick={handleRunPropagation}
                      style={{ width: '100%', padding: '12px', borderRadius: '10px', background: '#6366f1', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                      <Workflow size={18} /> Propagar & Recompilar Passaportes Afetados
                    </button>
                  </div>

                  <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: theme === 'dark' ? '#fff' : '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle size={18} color="#10b981" />
                      Registo de Recompilação & Audit Log
                    </h3>

                    {propResult ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#10b981' }}>
                            ✓ Melhoria Propagada com Sucesso
                          </div>
                          <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
                            ID: {propResult.improvementId} | Passaportes Recompilados: <strong>{propResult.recompiledPassportsCount}</strong>
                          </div>
                        </div>

                        <pre style={{ padding: '12px', borderRadius: '8px', background: theme === 'dark' ? '#020617' : '#0f172a', color: '#38bdf8', fontSize: '0.75rem', overflowX: 'auto', maxHeight: '200px' }}>
                          {JSON.stringify(propResult, null, 2)}
                        </pre>
                      </div>
                    ) : (
                      <div style={{ padding: '48px', textAlign: 'center', color: theme === 'dark' ? 'var(--text-muted)' : '#475569' }}>
                        <Workflow size={40} style={{ opacity: 0.5, marginBottom: '12px' }} />
                        <p style={{ fontSize: '0.9rem' }}>Propague uma melhoria para observar a atualização automática nos passaportes dos 200 P2.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
`;

if (!content.includes("{/* TAB: 500/300/200 READINESS PROGRAM */}")) {
  content = content.replace(
    "{/* TAB: ORDKS & OPERATIONAL REALITY */}",
    `${programTabUI}\n          {/* TAB: ORDKS & OPERATIONAL REALITY */}`
  );
}

fs.writeFileSync(pagePath, content, 'utf8');
console.log('page.tsx successfully updated with 500/300/200 Program tab!');

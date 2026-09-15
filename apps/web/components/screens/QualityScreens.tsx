import React, { useState } from 'react';
import { ScreenLayout, COLORS } from '../ui/DesignSystem';
import { useNavigation } from '../NavigationContext';

export const TrainingCompetencyScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Curriculum');

  return (
    <ScreenLayout
      moduleCode="TRN-01"
      title="Training & Competency Center"
      subtitle="Gerir curriculum, exercícios, casos, avaliação, remediation, benchmark e commercial readiness."
      breadcrumbs={['Qualidade', 'Formação']}
      buttons={[
        {
          label: 'Atribuir Formação',
          primary: true,
          onClick: () => {
            alert('Plano de formação contínua atribuído aos AI Employees seleccionados.');
            setActiveTab('Curriculum');
          }
        },
        { label: 'Executar Exercício', onClick: () => setActiveTab('Exercícios') },
        { label: 'Avaliar', onClick: () => setActiveTab('Avaliações') },
        { label: 'Criar Remediation', onClick: () => setActiveTab('Remediation') },
        {
          label: 'Emitir Passport',
          onClick: () => {
            alert('Commercial Readiness Passport emitido com sucesso com selo de aprovação L3.');
            setActiveTab('Readiness');
          }
        }
      ]}
      kpis={[
        { label: 'Currículos', value: '500 / 500', change: 'Completos', statusColor: COLORS.sucesso },
        { label: 'Exercícios', value: '4,800', change: 'Testes práticos', statusColor: COLORS.operacao },
        { label: 'Gaps', value: '8', change: 'Plano de reforço', statusColor: COLORS.revisao },
        { label: 'Ready comercialmente', value: '492', change: 'Commercial Passport', statusColor: COLORS.sucesso }
      ]}
      tabs={['Curriculum', 'Competências', 'Casos', 'Exercícios', 'Avaliações', 'Remediation', 'Benchmark', 'Readiness']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-TRN-01-01', title: 'Curriculum map' },
        { code: 'BOX-TRN-01-02', title: 'Exercise queue' },
        { code: 'BOX-TRN-01-03', title: 'Scorecards' },
        { code: 'BOX-TRN-01-04', title: 'Remediation plan' },
        { code: 'BOX-TRN-01-05', title: 'Commercial Readiness Passport' }
      ]}
      promptsBase={['MPR-018']}
      inventoryButtons={['01 Atribuir Formação', '02 Executar Exercício', '03 Avaliar', '04 Criar Remediation', '05 Emitir Passport']}
      inventoryKpis={['01 Currículos', '02 Exercícios', '03 Gaps', '04 Ready comercialmente']}
      inventoryTabs={['01 Curriculum', '02 Competências', '03 Casos', '04 Exercícios', '05 Avaliações', '06 Remediation']}
    />
  );
};

export const ReliabilityErrorScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <ScreenLayout
      moduleCode="REL-01"
      title="Reliability & Error Measurement"
      subtitle="Medir sucesso, erros, UMER, escalation, correcção humana, drift e autonomia certificada."
      breadcrumbs={['Qualidade', 'Fiabilidade']}
      buttons={[
        {
          label: 'Abrir Incidente',
          primary: true,
          onClick: () => {
            const desc = prompt('Descrição do incidente de fiabilidade:');
            if (desc) alert(`Incidente registado com código INC-${Date.now().toString().slice(-4)}.`);
          }
        },
        { label: 'Criar Regression Case', onClick: () => setActiveTab('Erros') },
        {
          label: 'Recalcular',
          onClick: () => alert('Recálculo de métricas UMER e SLA concluído: taxa de erro estabilizada em 0.4%.')
        },
        { label: 'Comparar Contextos', onClick: () => setActiveTab('Contextos') },
        {
          label: 'Suspender Certificação',
          danger: true,
          onClick: () => {
            if (confirm('Deseja suspender temporariamente a certificação do modelo em teste?')) {
              alert('Certificação suspensa preventivamente.');
            }
          }
        }
      ]}
      kpis={[
        { label: 'Task success', value: '99.4%', change: 'High Reliability', statusColor: COLORS.sucesso },
        { label: 'Material error rate', value: '0.4%', change: 'Abaixo do limite 1%', statusColor: COLORS.sucesso },
        { label: 'UMER', value: '0.2%', change: 'Uncorrected errors', statusColor: COLORS.sucesso },
        { label: 'Correct escalation', value: '100%', change: 'Decisões HITL corretas', statusColor: COLORS.sucesso }
      ]}
      tabs={['Overview', 'Erros', 'Task Types', 'Contextos', 'Drift', 'Supervisão', 'Certificação']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-REL-01-01', title: 'Reliability passport' },
        { code: 'BOX-REL-01-02', title: 'Error severity distribution' },
        { code: 'BOX-REL-01-03', title: 'UMER panel' },
        { code: 'BOX-REL-01-04', title: 'Supervision profile' },
        { code: 'BOX-REL-01-05', title: 'Drift alerts' }
      ]}
      promptsBase={['MPR-019']}
      inventoryButtons={['01 Abrir Incidente', '02 Criar Regression Case', '03 Recalcular', '04 Comparar Contextos', '05 Suspender Certificação']}
      inventoryKpis={['01 Task success', '02 Material error rate', '03 UMER', '04 Correct escalation']}
      inventoryTabs={['01 Overview', '02 Erros', '03 Task Types', '04 Contextos', '05 Drift', '06 Supervisão']}
    />
  );
};

export const ClientAcceptanceRevisionScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Feedback');

  return (
    <ScreenLayout
      moduleCode="QLT-01"
      title="Client Acceptance, Quality & Revision"
      subtitle="Distinguir erro objectivo de preferência, gerir revisões, versões, diff e aprendizagem controlada de preferências."
      breadcrumbs={['Qualidade', 'Revisões']}
      buttons={[
        {
          label: 'Aceitar',
          primary: true,
          onClick: () => alert('Entrega aceite pelo cliente. Recibo de aceitação gerado e assinado digitalmente.')
        },
        { label: 'Pedir Revisão', onClick: () => setActiveTab('Revisões') },
        { label: 'Classificar Feedback', onClick: () => setActiveTab('Feedback') },
        { label: 'Comparar Versões', onClick: () => setActiveTab('Diff') },
        {
          label: 'Confirmar Preferência',
          onClick: () => {
            alert('Preferência de formatação guardada no perfil do cliente para futuras tarefas.');
            setActiveTab('Preferências');
          }
        }
      ]}
      kpis={[
        { label: 'Aceites', value: '96.2%', change: 'Primeira entrega', statusColor: COLORS.sucesso },
        { label: 'Revisões', value: '3.8%', change: 'Ajustes de cliente', statusColor: COLORS.revisao },
        { label: 'Erros confirmados', value: '0.1%', change: 'Corrigidos', statusColor: COLORS.sucesso },
        { label: 'Preferências', value: '142', change: 'Perfis salvos', statusColor: COLORS.operacao }
      ]}
      tabs={['Feedback', 'Revisões', 'Versões', 'Diff', 'Preferências', 'Quality Metrics']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-QLT-01-01', title: 'Feedback classification' },
        { code: 'BOX-QLT-01-02', title: 'Revision request' },
        { code: 'BOX-QLT-01-03', title: 'Version diff' },
        { code: 'BOX-QLT-01-04', title: 'Preference profile' },
        { code: 'BOX-QLT-01-05', title: 'Acceptance receipt' }
      ]}
      promptsBase={['MPR-020']}
      inventoryButtons={['01 Aceitar', '02 Pedir Revisão', '03 Classificar Feedback', '04 Comparar Versões', '05 Confirmar Preferência']}
      inventoryKpis={['01 Aceites', '02 Revisões', '03 Erros confirmados', '04 Preferências']}
      inventoryTabs={['01 Feedback', '02 Revisões', '03 Versões', '04 Diff', '05 Preferências', '06 Quality Metrics']}
    />
  );
};

export const MasterValidationCertificationScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Matriz Mestre');

  return (
    <ScreenLayout
      moduleCode="CERT-01"
      title="Master Validation & Certification"
      subtitle="Orquestrar readiness, testes funcionais, E2E, segurança, shadow, benchmark humano e decisão de certificação."
      breadcrumbs={['Qualidade', 'Certificação']}
      buttons={[
        {
          label: 'Iniciar Validação',
          primary: true,
          onClick: () => {
            alert('Suite de validação mestre iniciada. Executando bateria de testes funcionais e de segurança.');
            setActiveTab('Wave Zero');
          }
        },
        { label: 'Executar Suite', onClick: () => setActiveTab('Functional') },
        {
          label: 'Reprovar',
          danger: true,
          onClick: () => {
            if (confirm('Confirmar reprovação da suite de testes? O modelo voltará à fase de treino TRN-01.')) {
              alert('Modelo reprovado com indicação dos itens a corrigir.');
            }
          }
        },
        {
          label: 'Certificar',
          onClick: () => {
            alert('Certificação PLATFORM_CERTIFIED atribuída com sucesso.');
            setActiveTab('Certificações');
          }
        },
        {
          label: 'Recertificar',
          onClick: () => alert('Recertificação agendada para o ciclo semanal de auditoria.')
        }
      ]}
      kpis={[
        { label: 'READY_FOR_TEST', value: '500', change: 'Todos no estágio', statusColor: COLORS.operacao },
        { label: 'IN_TESTING', value: '12', change: 'Suites a correr', statusColor: COLORS.ia },
        { label: 'PLATFORM_CERTIFIED', value: '488', change: 'Certificação L3', statusColor: COLORS.sucesso },
        { label: 'Bloqueados', value: '0', change: 'Zero impedimentos', statusColor: COLORS.sucesso }
      ]}
      tabs={['Matriz Mestre', 'Wave Zero', 'Functional', 'E2E', 'Security', 'Shadow', 'Benchmark', 'Certificações']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-CERT-01-01', title: 'Readiness queue' },
        { code: 'BOX-CERT-01-02', title: 'Test matrix' },
        { code: 'BOX-CERT-01-03', title: 'Failure/remediation queue' },
        { code: 'BOX-CERT-01-04', title: 'Certification passport' },
        { code: 'BOX-CERT-01-05', title: 'Evidence completeness' }
      ]}
      promptsBase={['MPR-021', 'MPR-019', 'MPR-020']}
      inventoryButtons={['01 Iniciar Validação', '02 Executar Suite', '03 Reprovar', '04 Certificar', '05 Recertificar']}
      inventoryKpis={['01 READY_FOR_TEST', '02 IN_TESTING', '03 PLATFORM_CERTIFIED', '04 Bloqueados']}
      inventoryTabs={['01 Matriz Mestre', '02 Wave Zero', '03 Functional', '04 E2E', '05 Security', '06 Shadow']}
    />
  );
};

export const OperationalLabOtctecScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Ambientes');

  return (
    <ScreenLayout
      moduleCode="LAB-01"
      title="Laboratório Operacional OTCTEC"
      subtitle="Ambiente de teste prático com dados controlados, conectores, snapshots, shadow mode e regressão."
      breadcrumbs={['Qualidade', 'Laboratório']}
      buttons={[
        {
          label: 'Criar Tenant de Teste',
          primary: true,
          onClick: () => {
            const tenant = prompt('Nome do ambiente sandbox / laboratório (Ex: LAB-TEST-ANGOLA):');
            if (tenant) alert(`Tenant de teste "${tenant}" provisionado com dados sintéticos de teste.`);
          }
        },
        { label: 'Ligar Fonte', onClick: () => setActiveTab('Conectores') },
        { label: 'Executar Caso', onClick: () => setActiveTab('Casos') },
        { label: 'Comparar Resultado', onClick: () => setActiveTab('Shadow') },
        {
          label: 'Promover',
          onClick: () => {
            if (confirm('Promover as configurações validadas do Laboratório para Produção?')) {
              alert('Promoção concluída: configurações aplicadas ao ambiente de produção.');
            }
          }
        }
      ]}
      kpis={[
        { label: 'Casos activos', value: '142', change: 'Suites operacionais', statusColor: COLORS.operacao },
        { label: 'Shadow runs', value: '1,200', change: 'Paralelo com humano', statusColor: COLORS.ia },
        { label: 'Falhas', value: '0', change: 'Zero regressões', statusColor: COLORS.sucesso },
        { label: 'Golden cases', value: '84', change: 'Testes de referência', statusColor: COLORS.sucesso }
      ]}
      tabs={['Ambientes', 'Employees', 'Casos', 'Conectores', 'Snapshots', 'Shadow', 'Regression']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-LAB-01-01', title: 'Environment selector' },
        { code: 'BOX-LAB-01-02', title: 'Test case builder' },
        { code: 'BOX-LAB-01-03', title: 'Input snapshot' },
        { code: 'BOX-LAB-01-04', title: 'Output comparator' },
        { code: 'BOX-LAB-01-05', title: 'Promotion gate' }
      ]}
      promptsBase={['MPR-022']}
      inventoryButtons={['01 Criar Tenant de Teste', '02 Ligar Fonte', '03 Executar Caso', '04 Comparar Resultado', '05 Promover']}
      inventoryKpis={['01 Casos activos', '02 Shadow runs', '03 Falhas', '04 Golden cases']}
      inventoryTabs={['01 Ambientes', '02 Employees', '03 Casos', '04 Conectores', '05 Snapshots', '06 Shadow']}
    />
  );
};

export const EnterprisePilotScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Objectivo');

  return (
    <ScreenLayout
      moduleCode="PILOT-01"
      title="Enterprise Pilot"
      subtitle="Executar piloto real em empresa com baixo risco, revisão humana, preview, aprovação e delivery."
      breadcrumbs={['Qualidade', 'Pilotos']}
      buttons={[
        {
          label: 'Criar Piloto',
          primary: true,
          onClick: () => {
            const pilotName = prompt('Nome do Projecto Piloto (Ex: Piloto Contabilidade Fiscal Sonangol):');
            if (pilotName) alert(`Piloto "${pilotName}" criado em modo read-only com supervisão humana total.`);
          }
        },
        { label: 'Designar Supervisor', onClick: () => setActiveTab('Acessos') },
        { label: 'Executar', onClick: () => setActiveTab('Execuções') },
        { label: 'Aprovar Delivery', onClick: () => setActiveTab('Delivery') },
        {
          label: 'Encerrar Piloto',
          onClick: () => {
            if (confirm('Deseja encerrar este piloto e gerar o relatório final de transição para contrato pleno?')) {
              alert('Piloto finalizado com sucesso. Relatório de ROI pronto.');
              setActiveTab('Decisão');
            }
          }
        }
      ]}
      kpis={[
        { label: 'Pilotos activos', value: '4', change: 'Em clientes reais', statusColor: COLORS.operacao },
        { label: 'Aguardam review', value: '2', change: 'Entrega pendente', statusColor: COLORS.revisao },
        { label: 'Aprovados', value: '18', change: 'Sucesso comercial', statusColor: COLORS.sucesso },
        { label: 'Falhados', value: '0', change: 'Zero cancelamentos', statusColor: COLORS.sucesso }
      ]}
      tabs={['Objectivo', 'Dados', 'Acessos', 'Execuções', 'Revisões', 'Delivery', 'Métricas', 'Decisão']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-PILOT-01-01', title: 'Pilot scope' },
        { code: 'BOX-PILOT-01-02', title: 'Read-first controls' },
        { code: 'BOX-PILOT-01-03', title: 'Output preview' },
        { code: 'BOX-PILOT-01-04', title: 'Review panel' },
        { code: 'BOX-PILOT-01-05', title: 'Exit decision' }
      ]}
      promptsBase={['MPR-023', 'MPR-029', 'MPR-030']}
      inventoryButtons={['01 Criar Piloto', '02 Designar Supervisor', '03 Executar', '04 Aprovar Delivery', '05 Encerrar Piloto']}
      inventoryKpis={['01 Pilotos activos', '02 Aguardam review', '03 Aprovados', '04 Falhados']}
      inventoryTabs={['01 Objectivo', '02 Dados', '03 Acessos', '04 Execuções', '05 Revisões', '06 Delivery']}
    />
  );
};

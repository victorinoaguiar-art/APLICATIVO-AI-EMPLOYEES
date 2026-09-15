import React, { useState } from 'react';
import { ScreenLayout, COLORS } from '../ui/DesignSystem';

export const DocumentStudioScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Conteúdo');

  return (
    <ScreenLayout
      moduleCode="DOC-01"
      title="Document Studio"
      subtitle="Materializar work products em DOCX, PDF, XLSX e PPTX com template, validação, preview, aprovação e delivery."
      breadcrumbs={['Documentos', 'Document Studio']}
      buttons={[
        {
          label: 'Gerar Documento',
          primary: true,
          onClick: () => {
            alert('Documento gerado com sucesso pelo Document Studio nos formatos PDF e DOCX.');
            setActiveTab('Preview');
          }
        },
        { label: 'Escolher Template', onClick: () => setActiveTab('Template') },
        { label: 'Pré-visualizar', onClick: () => setActiveTab('Preview') },
        { label: 'Validar', onClick: () => alert('Validação completa: Todas as variáveis de template e regras de branding foram verificadas sem erros.') },
        { label: 'Aprovar', onClick: () => alert('Documento aprovado e carimbado digitalmente com sucesso.') },
        { label: 'Entregar', onClick: () => setActiveTab('Delivery') }
      ]}
      kpis={[
        { label: 'Documentos hoje', value: '84', change: 'Gerados', statusColor: COLORS.operacao },
        { label: 'Aguardam aprovação', value: '3', change: 'Pendentes HITL', statusColor: COLORS.revisao },
        { label: 'Falhas de render', value: '0', change: '100% validado', statusColor: COLORS.sucesso },
        { label: 'Entregues', value: '81', change: 'Enviados por Email/WhatsApp/Drive', statusColor: COLORS.sucesso }
      ]}
      tabs={['Conteúdo', 'Template', 'Branding', 'Preview', 'Versões', 'Delivery', 'Audit']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-DOC-01-01', title: 'Structured content' },
        { code: 'BOX-DOC-01-02', title: 'Template picker' },
        { code: 'BOX-DOC-01-03', title: 'Render preview' },
        { code: 'BOX-DOC-01-04', title: 'Validation checklist' },
        { code: 'BOX-DOC-01-05', title: 'Delivery router' }
      ]}
      promptsBase={['MPR-024', 'MPR-020']}
      inventoryButtons={['01 Gerar Documento', '02 Escolher Template', '03 Pré-visualizar', '04 Validar', '05 Aprovar', '06 Entregar']}
      inventoryKpis={['01 Documentos hoje', '02 Aguardam aprovação', '03 Falhas de render', '04 Entregues']}
      inventoryTabs={['01 Conteúdo', '02 Template', '03 Branding', '04 Preview', '05 Versões', '06 Delivery']}
    />
  );
};

export const BrandStationeryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Brand Pack');

  return (
    <ScreenLayout
      moduleCode="DOC-02"
      title="Brand & Stationery Governance"
      subtitle="Gerir Brand Pack, logótipos, cabeçalhos, rodapés, papel timbrado, assinaturas, carimbos e perfis de impressão."
      breadcrumbs={['Documentos', 'Brand & Stationery']}
      buttons={[
        {
          label: 'Adicionar Logo',
          primary: true,
          onClick: () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e: Event) => {
              const target = e.target as HTMLInputElement;
              const file = target?.files?.[0];
              if (file) alert(`Logótipo "${file.name}" carregado com sucesso no Brand Pack.`);
            };
            input.click();
          }
        },
        { label: 'Novo Template', onClick: () => setActiveTab('Templates') },
        { label: 'Aprovar Brand Pack', onClick: () => alert('Brand Pack aprovado e sincronizado para todos os documentos da organização.') },
        { label: 'Testar Impressão', onClick: () => setActiveTab('Print Preview') },
        { label: 'Definir Signatário', onClick: () => setActiveTab('Assinaturas') }
      ]}
      kpis={[
        { label: 'Assets aprovados', value: '24', change: 'Logos / Carimbos', statusColor: COLORS.sucesso },
        { label: 'Templates activos', value: '12', change: 'Letterhead & Invoices', statusColor: COLORS.operacao },
        { label: 'Signatários', value: '4', change: 'Chaves digitais', statusColor: COLORS.ia },
        { label: 'Alertas de branding', value: '0', change: 'Conforme manual', statusColor: COLORS.sucesso }
      ]}
      tabs={['Brand Pack', 'Assets', 'Templates', 'Stationery', 'Assinaturas', 'Selos', 'Print Preview', 'Versões']}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      boxes={[
        { code: 'BOX-DOC-02-01', title: 'Legal identity' },
        { code: 'BOX-DOC-02-02', title: 'Asset registry' },
        { code: 'BOX-DOC-02-03', title: 'Stationery mode' },
        { code: 'BOX-DOC-02-04', title: 'Signatory matrix' },
        { code: 'BOX-DOC-02-05', title: 'Print calibration' }
      ]}
      promptsBase={['MPR-025']}
      inventoryButtons={['01 Adicionar Logo', '02 Novo Template', '03 Aprovar Brand Pack', '04 Testar Impressão', '05 Definir Signatário']}
      inventoryKpis={['01 Assets aprovados', '02 Templates activos', '03 Signatários', '04 Alertas de branding']}
      inventoryTabs={['01 Brand Pack', '02 Assets', '03 Templates', '04 Stationery', '05 Assinaturas', '06 Selos']}
    />
  );
};

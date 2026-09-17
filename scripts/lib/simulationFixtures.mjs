import { PhysicalDocumentValidator } from '../../packages/runtime/dist/pilot/PhysicalDocumentValidator.js';

export function getSimulationPilotConfig() {
  return {
    pilot_id: 'PILOT_SASO_2026_09',
    tenant_id: 'tenant_pilot_angola_ops_01',
    organization_name: 'Sociedade Angolana de Servicos & Operacoes Lda (SASO)',
    authorization_reference: 'AUTH-SASO-PILOT-2026-09-001',
    authorized_by: 'dr_antonio_silva_dir_executivo',
    authorized_at: '2026-09-15T08:30:00Z',
    start_at: '2026-09-15T09:00:00Z',
    end_at: '2026-10-15T18:00:00Z',
    selected_employee_ids: [66, 263, 58, 52, 73],
    allowed_data_categories: ['ACCOUNTING', 'INVOICES', 'LETTERS', 'BUDGET', 'KPI'],
    prohibited_data_categories: ['RAW_CREDIT_CARD', 'PERSONAL_HEALTH_DATA'],
    allowed_connectors: ['T.DOCS.CLASSIFIER', 'T.DOCS.GENERATOR', 'T.EXCEL.ANALYZER'],
    prohibited_actions: ['DIRECT_WIRE_TRANSFER', 'UNAPPROVED_TAX_AMENDMENT', 'MASS_DATA_DELETION'],
    human_reviewers: ['rev_maria_santos', 'rev_joao_manuel'],
    task_limit: 50,
    execution_mode: 'SIMULATION'
  };
}

export function getSimulationTaskDefinitions() {
  const rawTasks = [
    // Employee 66: Document Classification (Accounting)
    {
      id: 'TASK_SASO_001',
      empId: 66,
      format: 'PDF',
      title: 'Classificacao Factura Fornecedor Papelaria Central',
      instruction: 'Classificar factura de materiais de escritorio e apurar IVA',
      input: { document_title: 'Factura FT 2026/891 - Papelaria Central Lda', detected_type: 'FACTURA_FORNECEDOR' }
    },
    {
      id: 'TASK_SASO_002',
      empId: 66,
      format: 'PDF',
      title: 'Classificacao Recibo de Renda Armazem Viana',
      instruction: 'Classificar recibo de arrendamento e retencao predial',
      input: { document_title: 'Recibo Quitacao Renda Viana 08/2026', detected_type: 'RECIBO_RENDA' }
    },
    {
      id: 'TASK_SASO_003',
      empId: 66,
      format: 'PDF',
      title: 'Classificacao Factura Manutencao Frotas',
      instruction: 'Classificar factura de pecas e servicos automoveis',
      input: { document_title: 'Factura Manutencao Frotas Viatura LD-45-88-HA', detected_type: 'FACTURA_FORNECEDOR' }
    },
    {
      id: 'TASK_SASO_004',
      empId: 66,
      format: 'PDF',
      title: 'Classificacao Guia de Liquidacao Portuaria',
      instruction: 'Classificar taxas aduaneiras e desembaraço de carga',
      input: { document_title: 'Despacho Aduaneiro DU-2026-9041 - Porto de Luanda', detected_type: 'TAXA_ADUANEIRA' }
    },
    {
      id: 'TASK_SASO_005',
      empId: 66,
      format: 'PDF',
      title: 'Classificacao Factura Telecomunicacoes e Internet',
      instruction: 'Classificar consumo de links dedicados e voz',
      input: { document_title: 'Factura Telecomunicacoes Angola Telecom 08/2026', detected_type: 'FACTURA_FORNECEDOR' }
    },
    {
      id: 'TASK_SASO_006',
      empId: 66,
      format: 'PDF',
      title: 'Classificacao Factura Fornecimento Energia Electrica',
      instruction: 'Classificar consumo de media tensao posto Viana',
      input: { document_title: 'Factura Energia ENDE Setembro 2026', detected_type: 'FACTURA_FORNECEDOR' }
    },

    // Employee 263: Letter Employee (Documents)
    {
      id: 'TASK_SASO_007',
      empId: 263,
      format: 'DOCX',
      title: 'Carta Formal Notificacao Aditamento Contratual Fornecedor Logistica',
      instruction: 'Redigir notificacao formal de prorrogacao contratual',
      input: { letter_ref: 'SASO/DIR-LOG/2026/041', recipient: 'Transportes Rapidos de Viana Lda', subject: 'Prorrogacao de Prestacao de Servicos' },
      needsCorrection: true,
      correctionText: PhysicalDocumentValidator.buildRealBinaryDocx(
        'SASO - Notificacao de Aditamento',
        [
          'Ref: SASO/DIR-LOG/2026/041-REV',
          'Para: Transportes Rapidos de Viana Lda',
          'Assunto: Prorrogacao de Prestacao de Servicos ate 31/12/2026',
          'Confirmamos a prorrogacao formal do contrato de transportes ate 31 de Dezembro de 2026.',
          'Com os melhores cumprimentos, A Administracao Executiva'
        ]
      )
    },
    {
      id: 'TASK_SASO_008',
      empId: 263,
      format: 'DOCX',
      title: 'Carta Administrativa Pedido de Esclarecimento a Direccao Municipal',
      instruction: 'Redigir pedido formal de informacao previa sobre licenca',
      input: { letter_ref: 'SASO/ADM/2026/102', recipient: 'Administracao Municipal de Viana', subject: 'Pedido de Esclarecimento sobre Licenciamento' }
    },
    {
      id: 'TASK_SASO_009',
      empId: 263,
      format: 'DOCX',
      title: 'Certificado de Acreditacao de Prestador Tecnico',
      instruction: 'Emitir comprovativo formal de idoneidade tecnica',
      input: { letter_ref: 'SASO/RH/2026/088', recipient: 'Engenharia & Obras Civis Lda', subject: 'Declaracao de Acreditacao Tecnica' }
    },
    {
      id: 'TASK_SASO_010',
      empId: 263,
      format: 'DOCX',
      title: 'Oficio de Resposta a Consulta de Fornecedor',
      instruction: 'Redigir esclarecimento formal a proponente em concurso fechado',
      input: { letter_ref: 'SASO/COMPRAS/2026/055', recipient: 'Consorcio Metalurgico do Sul', subject: 'Esclarecimento a Concurso SASO-09/2026' }
    },
    {
      id: 'TASK_SASO_011',
      empId: 263,
      format: 'DOCX',
      title: 'Comunicacao Interna de Deliberacao da Administracao',
      instruction: 'Redigir memorando de implementacao de politicas de seguranca',
      input: { letter_ref: 'SASO/ADM/2026/119', recipient: 'Todas as Direccoes Operacionais', subject: 'Implementacao do Protocolo de Seguranca 2026' }
    },
    {
      id: 'TASK_SASO_012',
      empId: 263,
      format: 'DOCX',
      title: 'Declaracao de Efetividade e Funcao para Fins Oficiais',
      instruction: 'Redigir declaracao institucional de colaborador',
      input: { letter_ref: 'SASO/RH/2026/145', recipient: 'Consulado Geral de Portugal em Luanda', subject: 'Declaracao de Funcao e Vinculo Laboral' }
    },

    // Employee 58: Financial Analysis (Finance)
    {
      id: 'TASK_SASO_013',
      empId: 58,
      format: 'XLSX',
      title: 'Mapa de Varianca de Custos Operacionais Q3',
      instruction: 'Analisar desvio entre despesas orcadas e reais de Julho a Setembro',
      input: { budget_kz: 38000000, actual_kz: 34500000 }
    },
    {
      id: 'TASK_SASO_014',
      empId: 58,
      format: 'XLSX',
      title: 'Reconciliacao de Fluxo de Caixa Mensal Agosto 2026',
      instruction: 'Confrontar entradas bancarias com saidas de tesouraria',
      input: { budget_kz: 52000000, actual_kz: 51200000 }
    },
    {
      id: 'TASK_SASO_015',
      empId: 58,
      format: 'XLSX',
      title: 'Analise de Margem de Contribuicao por Linha de Servico',
      instruction: 'Calcular EBITDA e margem unitaria dos servicos de logistica',
      input: { budget_kz: 21000000, actual_kz: 22800000 },
      needsCorrection: true,
      correctionText: PhysicalDocumentValidator.buildRealBinaryXlsx(
        'Margem_Contribuicao_v2',
        [
          ['Rubrica', 'Orcado (KZ)', 'Realizado (KZ)', 'Desvio (KZ)', 'Varianca %'],
          ['Custos de Transporte', 21000000, 22800000, -1800000, '-8.57%'],
          ['Margem Contribuicao Ajustada', 30000000, 32500000, 2500000, '+8.33%']
        ]
      )
    },
    {
      id: 'TASK_SASO_016',
      empId: 58,
      format: 'XLSX',
      title: 'Modelo de Previsao de Tesouraria a 60 Dias',
      instruction: 'Projetar recebimentos e desembolsos operacionais',
      input: { budget_kz: 45000000, actual_kz: 44100000 }
    },
    {
      id: 'TASK_SASO_017',
      empId: 58,
      format: 'XLSX',
      title: 'Mapa de Reparticao de Custos Fixos Departamentais',
      instruction: 'Alocar custos de estrutura pelas 5 unidades de negocio',
      input: { budget_kz: 18000000, actual_kz: 17650000 }
    },
    {
      id: 'TASK_SASO_018',
      empId: 58,
      format: 'XLSX',
      title: 'Avaliacao de Racio de Liquidez Geral e Reduzida',
      instruction: 'Apurar solvabilidade a curto prazo com base no balancete',
      input: { budget_kz: 60000000, actual_kz: 58900000 }
    },

    // Employee 52: Collections (Finance)
    {
      id: 'TASK_SASO_019',
      empId: 52,
      format: 'DOCX',
      title: 'Aviso de Cobranca 1º Grau Cliente Mecanica do Sul',
      instruction: 'Elaborar primeiro lembrete amigavel de liquidacao',
      input: { client_name: 'Mecanica e Servicos do Sul Lda', invoice_number: 'FT 2026/0412', amount_kz: 1850000.00 }
    },
    {
      id: 'TASK_SASO_020',
      empId: 52,
      format: 'DOCX',
      title: 'Aviso de Cobranca 2º Grau Cliente Empreendimentos Benguela',
      instruction: 'Elaborar aviso formal de mora com calculo de juros legais',
      input: { client_name: 'Empreendimentos Turisticos de Benguela Lda', invoice_number: 'FT 2026/0290', amount_kz: 4200000.00 },
      needsCorrection: true,
      correctionText: PhysicalDocumentValidator.buildRealBinaryDocx(
        'SASO - Aviso de Regularizacao Grau 2',
        [
          'SASO - Departamento Financeiro & Cobrancas',
          'Data: 17 de Setembro de 2026',
          'Destinatario: Empreendimentos Turisticos de Benguela Lda',
          'Factura em Mora: FT 2026/0290',
          'Valor Pendente Atualizado: 4.200.000,00 KZ',
          'Vencimento Original: 15 de Julho de 2026',
          'Com os melhores cumprimentos, Departamento de Cobrancas'
        ]
      )
    },
    {
      id: 'TASK_SASO_021',
      empId: 52,
      format: 'DOCX',
      title: 'Proposta de Plano de Pagamento Prestacional Construtora Cazenga',
      instruction: 'Elaborar acordo amigavel em 3 prestacoes mensais',
      input: { client_name: 'Sociedade de Construcao do Cazenga Lda', invoice_number: 'FT 2026/0188', amount_kz: 6500000.00 }
    },
    {
      id: 'TASK_SASO_022',
      empId: 52,
      format: 'DOCX',
      title: 'Aviso de Cobranca 1º Grau Distribuidora Kilamba',
      instruction: 'Elaborar aviso de regularizacao de fornecimento',
      input: { client_name: 'Distribuidora Alimentar do Kilamba Lda', invoice_number: 'FT 2026/0511', amount_kz: 980000.00 }
    },
    {
      id: 'TASK_SASO_023',
      empId: 52,
      format: 'DOCX',
      title: 'Declaracao de Quitacao Total de Divida Auto Reparadora',
      instruction: 'Emitir comprovativo formal de liquidacao e extincao de mora',
      input: { client_name: 'Auto Reparadora Central Lda', invoice_number: 'FT 2026/0333', amount_kz: 3100000.00 }
    },
    {
      id: 'TASK_SASO_024',
      empId: 52,
      format: 'DOCX',
      title: 'Notificacao Pre-Contencioso Factura em Mora Prolongada',
      instruction: 'Elaborar interpelacao final antes de reencaminhamento juridico',
      input: { client_name: 'Agro-Industria do Cuanza Sul SA', invoice_number: 'FT 2026/0095', amount_kz: 7850000.00 }
    },

    // Employee 73: Management Reporting (Accounting)
    {
      id: 'TASK_SASO_025',
      empId: 73,
      format: 'PDF',
      title: 'Relatorio Executivo de Gestao Operacional Agosto 2026',
      instruction: 'Consolidar KPIs de execucao, SLAs e incidentes',
      input: { period: 'Agosto 2026' }
    },
    {
      id: 'TASK_SASO_026',
      empId: 73,
      format: 'PDF',
      title: 'Painel de Controlo de Produtividade Administrativa Q3',
      instruction: 'Apresentar volumetria processada e tempos medios de resposta',
      input: { period: 'Q3 2026' },
      needsCorrection: true,
      correctionText: PhysicalDocumentValidator.buildRealBinaryPdf(
        'Relatorio Executivo de Produtividade Q3 - SASO Lda',
        [
          'SASO LDA - RELATORIO DE GESTAO Q3 2026 AUDITADO',
          'Taxa de Cumprimento SLA: 98.9%',
          'Total Processos: 1480 | Indice Eficiencia: 95.5%',
          'Margem Operacional Bruta: 34.1%'
        ]
      )
    },
    {
      id: 'TASK_SASO_027',
      empId: 73,
      format: 'PDF',
      title: 'Relatorio de Auditoria Interna de Procedimentos de Compras',
      instruction: 'Aferir conformidade com matriz de aprovacoes previas',
      input: { period: 'Semestre 1 2026' }
    },
    {
      id: 'TASK_SASO_028',
      empId: 73,
      format: 'PDF',
      title: 'Relatorio de Eficiencia Logistica e Gestao de Frotas',
      instruction: 'Apurar custos por quilometro e tempo de paragem de veiculos',
      input: { period: 'Setembro 2026' }
    },
    {
      id: 'TASK_SASO_029',
      empId: 73,
      format: 'PDF',
      title: 'Sumario Executivo para o Conselho de Administracao',
      instruction: 'Sintese de encerramento mensal de contas e balanco provisional',
      input: { period: 'Mes de Agosto 2026' }
    },
    {
      id: 'TASK_SASO_030',
      empId: 73,
      format: 'PDF',
      title: 'Relatorio de Avaliacao de Conformidade Fiscal & Retencoes',
      instruction: 'Verificar tempestividade das declaracoes Modelo 1 e IVA',
      input: { period: 'Exercicio 2026 - Trimestre 2' }
    }
  ];

  return rawTasks.map((t, idx) => ({
    task_id: t.id,
    id: t.id,
    pilot_id: 'PILOT_SASO_2026_09',
    tenant_id: 'tenant_pilot_angola_ops_01',
    employee_id: t.empId,
    empId: t.empId,
    requested_by: 'operador_saso_01',
    received_at: `2026-09-15T09:${String(10 + Math.floor(idx / 2)).padStart(2, '0')}:${String((idx % 2) * 30).padStart(2, '0')}.000Z`,
    idempotency_key: `IDEMP_${t.id}_2026`,
    title: t.title,
    instruction: t.instruction,
    input_data: t.input,
    input: t.input,
    format: t.format,
    execution_mode: 'SIMULATION',
    needsCorrection: t.needsCorrection,
    correctionText: t.correctionText
  }));
}
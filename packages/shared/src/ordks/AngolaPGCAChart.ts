/**
 * Angola PGCA — Plano Geral de Contabilidade de Angola
 * Legislação: Decreto n.º 82/01 de 16 de Novembro & Decreto Presidencial n.º 180/19 de 24 de Maio (IVA)
 */

export interface PGCAAccount {
  code: string;
  name: string;
  subaccounts?: PGCAAccount[];
}

export interface PGCAAccountClass {
  code: string;
  name: string;
  accounts: PGCAAccount[];
}

export const ANGOLA_PGCA_FULL_CHART: PGCAAccountClass[] = [
  {
    code: '1',
    name: 'Classe 1 — Meios Fixos e Investimentos',
    accounts: [
      { code: '11', name: 'Imobilizações Corpóreas' },
      { code: '12', name: 'Imobilizações Incorpóreas' },
      { code: '13', name: 'Investimentos Financeiros' },
      { code: '14', name: 'Imobilizações em Curso' },
      { code: '18', name: 'Amortizações Acumuladas' },
      { code: '19', name: 'Provisões para Investimentos Financeiros' }
    ]
  },
  {
    code: '2',
    name: 'Classe 2 — Existências',
    accounts: [
      { code: '21', name: 'Compras' },
      { code: '22', name: 'Matérias-Primas, Subsidiárias e de Consumo' },
      { code: '23', name: 'Produtos e Trabalhos em Curso' },
      { code: '24', name: 'Produtos Acabados e Intermédios' },
      { code: '25', name: 'Sub-produtos, Desperdícios, Resíduos e Refugos' },
      { code: '26', name: 'Mercadorias' },
      { code: '27', name: 'Matérias-Primas, Mercadorias e Outros Materiais em Trânsito' },
      { code: '28', name: 'Adiantamentos por Conta de Compras' },
      { code: '29', name: 'Provisão para Depreciação de Existências' }
    ]
  },
  {
    code: '3',
    name: 'Classe 3 — Terceiros',
    accounts: [
      { code: '31', name: 'Clientes' },
      { code: '32', name: 'Fornecedores' },
      { code: '33', name: 'Empréstimos' },
      {
        code: '34',
        name: 'Estado e Outras Entidades Públicas',
        subaccounts: [
          { code: '34.1', name: 'Imposto Industrial' },
          { code: '34.2', name: 'Impostos de Produção e Consumo' },
          { code: '34.3', name: 'Imposto de Rendimento do Trabalho (IRT)' },
          { code: '34.4', name: 'Imposto de Selo / Circulação' },
          {
            code: '34.5',
            name: 'Imposto sobre o Valor Acrescentado (IVA — Decreto Presidencial n.º 180/19)',
            subaccounts: [
              {
                code: '34.5.1',
                name: 'IVA Suportado',
                subaccounts: [
                  { code: '34.5.1.1', name: 'Existências' },
                  { code: '34.5.1.2', name: 'Meios fixos e investimentos' },
                  { code: '34.5.1.3', name: 'Outros bens e serviços' }
                ]
              },
              {
                code: '34.5.2',
                name: 'IVA Dedutível',
                subaccounts: [
                  { code: '34.5.2.1', name: 'Existências' },
                  { code: '34.5.2.2', name: 'Meios fixos e investimentos' },
                  { code: '34.5.2.3', name: 'Outros bens e serviços' }
                ]
              },
              {
                code: '34.5.3',
                name: 'IVA Liquidado',
                subaccounts: [
                  { code: '34.5.3.1', name: 'Operações gerais' },
                  { code: '34.5.3.2', name: 'Operações abrangidas pelo regime de IVA de caixa' },
                  { code: '34.5.3.3', name: 'Autoconsumo e operações gratuitas' },
                  { code: '34.5.3.4', name: 'Operações especiais' }
                ]
              },
              {
                code: '34.5.4',
                name: 'IVA Regularizações',
                subaccounts: [
                  { code: '34.5.4.1', name: 'Mensais a favor do sujeito passivo' },
                  { code: '34.5.4.2', name: 'Mensais a favor do Estado' },
                  { code: '34.5.4.3', name: 'Anual por cálculo do pró-rata definitivo' },
                  { code: '34.5.4.4', name: 'Outras regularizações anuais' }
                ]
              },
              {
                code: '34.5.5',
                name: 'IVA Apuramento',
                subaccounts: [
                  { code: '34.5.5.1', name: 'Apuramento do regime de IVA normal' },
                  { code: '34.5.5.2', name: 'Apuramento do regime de IVA de caixa' }
                ]
              },
              {
                code: '34.5.6',
                name: 'IVA a Pagar',
                subaccounts: [
                  { code: '34.5.6.1', name: 'IVA a pagar de apuramento' },
                  { code: '34.5.6.2', name: 'IVA a pagar de cativo' },
                  { code: '34.5.6.3', name: 'IVA a pagar de liquidações oficiosas' }
                ]
              },
              {
                code: '34.5.7',
                name: 'IVA a Recuperar',
                subaccounts: [
                  { code: '34.5.7.1', name: 'IVA a recuperar de apuramentos' },
                  { code: '34.5.7.2', name: 'IVA a recuperar de cativo' }
                ]
              },
              {
                code: '34.5.8',
                name: 'IVA Reembolsos Pedidos',
                subaccounts: [
                  { code: '34.5.8.1', name: 'Reembolsos pedidos' },
                  { code: '34.5.8.2', name: 'Reembolsos deferidos' },
                  { code: '34.5.8.3', name: 'Reembolsos indeferidos' },
                  { code: '34.5.8.4', name: 'Reembolsos reclamados, recorridos ou impugnados' }
                ]
              },
              { code: '34.5.9', name: 'IVA Liquidações Oficiosas' }
            ]
          },
          { code: '34.6', name: 'Certificado de Crédito Fiscal a Compensar' }
        ]
      },
      { code: '35', name: 'Entidades Participantes e Participadas' },
      { code: '36', name: 'Pessoal' },
      { code: '37', name: 'Outros Valores a Receber e a Pagar' },
      { code: '38', name: 'Provisões para Cobranças Duvidosas' },
      { code: '39', name: 'Provisões para Outros Riscos e Encargos' }
    ]
  },
  {
    code: '4',
    name: 'Classe 4 — Meios Monetários',
    accounts: [
      { code: '41', name: 'Títulos Negociáveis' },
      { code: '42', name: 'Depósitos a Prazo' },
      { code: '43', name: 'Depósitos à Ordem' },
      { code: '44', name: 'Outros Depósitos' },
      { code: '45', name: 'Caixa' },
      { code: '48', name: 'Conta Transitória' },
      { code: '49', name: 'Provisões para Aplicações de Tesouraria' }
    ]
  },
  {
    code: '5',
    name: 'Classe 5 — Capital e Reservas',
    accounts: [
      { code: '51', name: 'Capital' },
      { code: '52', name: 'Acções/Quotas Próprias' },
      { code: '53', name: 'Prémios de Emissão' },
      { code: '54', name: 'Prestações Suplementares' },
      { code: '55', name: 'Reservas Legais' },
      { code: '56', name: 'Reservas de Reavaliação' },
      { code: '57', name: 'Reservas com Fins Especiais' },
      { code: '58', name: 'Reservas Livres' }
    ]
  },
  {
    code: '6',
    name: 'Classe 6 — Proveitos e Ganhos por Natureza',
    accounts: [
      { code: '61', name: 'Vendas' },
      { code: '62', name: 'Prestações de Serviço' },
      { code: '63', name: 'Outros Proveitos Operacionais (63.5 IVA)' },
      { code: '64', name: 'Variação nos Inventários de Produtos Acabados e de Produção em Curso' },
      { code: '65', name: 'Trabalhos para a Própria Empresa' },
      { code: '66', name: 'Proveitos e Ganhos Financeiros Gerais' },
      { code: '67', name: 'Proveitos e Ganhos Financeiros em Filiais e Associadas' },
      { code: '68', name: 'Outros Proveitos e Ganhos Não Operacionais' },
      { code: '69', name: 'Proveitos e Ganhos Extraordinários' }
    ]
  },
  {
    code: '7',
    name: 'Classe 7 — Custos e Perdas por Natureza',
    accounts: [
      { code: '71', name: 'Custo das Existências Vendidas e das Matérias Consumidas (CMVMC)' },
      { code: '72', name: 'Custos com o Pessoal' },
      { code: '73', name: 'Amortizações do Exercício' },
      { code: '75', name: 'Outros Custos e Perdas Operacionais (FST / 75.3.1.2 IVA)' },
      { code: '76', name: 'Custos e Perdas Financeiros Gerais' },
      { code: '77', name: 'Custos e Perdas Financeiros em Filiais e Associadas' },
      { code: '78', name: 'Outros Custos e Perdas Não Operacionais' },
      { code: '79', name: 'Custos e Perdas Extraordinários' }
    ]
  },
  {
    code: '8',
    name: 'Classe 8 — Resultados',
    accounts: [
      { code: '81', name: 'Resultados Transitados' },
      { code: '82', name: 'Resultados Operacionais' },
      { code: '83', name: 'Resultados Financeiros' },
      { code: '84', name: 'Resultados em Filiais e Associadas' },
      { code: '85', name: 'Resultados Não Operacionais' },
      { code: '86', name: 'Resultados Extraordinários' },
      { code: '87', name: 'Imposto sobre Lucros / Imposto Industrial' },
      { code: '88', name: 'Resultado Líquido do Exercício' },
      { code: '89', name: 'Dividendos Antecipados' }
    ]
  }
];

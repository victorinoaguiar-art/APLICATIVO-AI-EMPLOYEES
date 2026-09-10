"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANGOLA_JURISDICTION_PACK = void 0;
exports.ANGOLA_JURISDICTION_PACK = {
    jurisdictionCode: 'AO_ANGOLA',
    countryName: 'República de Angola',
    legalFrameworks: [
        {
            code: 'PGCA',
            title: 'Plano Geral de Contabilidade de Angola (PGCA)',
            authority: 'OCPCA — Ordem dos Contabilistas e Peritos Contabilistas de Angola',
            description: 'Estrutura concetual, mapa de contas e demonstrações financeiras obrigatórias para empresas em Angola.'
        },
        {
            code: 'CII',
            title: 'Código do Imposto Industrial (Lei n.º 19/14 e alterações)',
            authority: 'AGT — Administração Geral Tributária',
            description: 'Regulamentação sobre a tributação dos lucros comerciais e industriais e retenções na fonte (6.5% serviços).'
        },
        {
            code: 'CIVA',
            title: 'Código do Imposto sobre o Valor Acrescentado (IVA)',
            authority: 'AGT — Administração Geral Tributária',
            description: 'Regime geral de IVA (14%), taxa reduzida (5% ou 7% em bens essenciais/hotelaria) e regras de retenção na fonte.'
        },
        {
            code: 'CIRT',
            title: 'Código do Imposto de Rendimento do Trabalho (IRT)',
            authority: 'AGT — Administração Geral Tributária',
            description: 'Tabela progressiva de retenção de IRT sobre remunerações de trabalhadores por conta de outrem e conta própria.'
        },
        {
            code: 'INSS',
            title: 'Regulamento da Segurança Social de Angola (INSS)',
            authority: 'Instituto Nacional de Segurança Social',
            description: 'Contribuição obrigatória de 11% sobre a folha salarial (8% pela entidade patronal e 3% pelo trabalhador).'
        },
        {
            code: 'LGT',
            title: 'Lei Geral do Trabalho de Angola (Lei n.º 12/23)',
            authority: 'Ministério do Trabalho, Desporto e Segurança Social',
            description: 'Regime jurídico dos contratos de trabalho, horários, férias, compensações por despedimento e direitos laborais.'
        }
    ],
    taxRegimes: [
        {
            name: 'Imposto sobre o Valor Acrescentado (IVA)',
            rates: {
                geral: '14%',
                reduzida: '7%',
                isento: '0%'
            },
            reportingFrequencies: ['Mensal (até ao dia 15 do mês seguinte)']
        },
        {
            name: 'Imposto de Rendimento do Trabalho (IRT)',
            rates: {
                isencao: 'Até 100.000 Kz',
                escaloes: 'Tabela progressiva de 10% a 25%',
                grupoB_C: '6.5% retenção na fonte em serviços'
            },
            reportingFrequencies: ['Mensal (até ao dia 15 do mês seguinte)']
        },
        {
            name: 'Imposto Industrial',
            rates: {
                taxaGeral: '25%',
                sectorAgricola: '10%',
                retencaoServicos: '6.5%'
            },
            reportingFrequencies: ['Anual (Modelo 1) e Retenção Mensal']
        }
    ],
    accountingStandards: [
        'PGCA (Plano Geral de Contabilidade de Angola)',
        'Normas de Relato Financeiro para Grandes Empresas (IFRS adaptadas)',
        'Demonstrações Financeiras Obrigatórias: Balanço, Demonstração de Resultados por Natureza, Demonstração de Fluxos de Caixa e Anexo'
    ],
    laborRegulations: [
        'Lei n.º 12/23 — Nova Lei Geral do Trabalho',
        'Duração normal do trabalho: 44 horas semanais (máximo 8h/dia)',
        'Período anual de férias pago: 22 dias úteis',
        'Subsídio de Natal obrigatoriamente 50% do salário base acumulado'
    ]
};
//# sourceMappingURL=AngolaJurisdictionPack.js.map
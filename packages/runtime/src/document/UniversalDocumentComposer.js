"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniversalDocumentComposer = void 0;
const crypto_1 = require("crypto");
class UniversalDocumentComposer {
    static compose(request) {
        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const now = new Date().toISOString();
        const sections = [];
        // Title Section
        const introElements = [
            {
                type: 'heading',
                level: 1,
                text: request.title
            },
            {
                type: 'paragraph',
                text: `Documento oficial gerado por Empregado IA #${request.employeeId} para ${request.organizationId}. Propósito: ${request.documentPurpose}`
            }
        ];
        if (request.confidentialityMarking) {
            introElements.push({
                type: 'callout',
                variant: 'important',
                text: `CLASSIFICAÇÃO DE CONFIDENCIALIDADE: ${request.confidentialityMarking}`
            });
        }
        sections.push({
            title: 'Introdução & Metadados',
            elements: introElements
        });
        // Content processing from request.contentData
        const data = request.contentData || {};
        if (data.summary) {
            sections.push({
                title: 'Sumário Executivo',
                elements: [
                    {
                        type: 'paragraph',
                        text: String(data.summary)
                    }
                ]
            });
        }
        if (data.kpis && Array.isArray(data.kpis)) {
            const kpiItems = data.kpis.map((k) => `${k.name || 'KPI'}: ${k.value} ${k.unit || ''}`);
            sections.push({
                title: 'Indicadores-Chave de Desempenho (KPIs)',
                elements: [
                    {
                        type: 'list',
                        ordered: false,
                        items: kpiItems
                    }
                ]
            });
        }
        if (data.tableHeaders && data.tableRows) {
            sections.push({
                title: 'Dados Detalhados',
                elements: [
                    {
                        type: 'table',
                        headers: data.tableHeaders,
                        rows: data.tableRows,
                        caption: data.tableCaption || undefined,
                        totalsRow: data.tableTotals || undefined
                    }
                ]
            });
        }
        if (data.chartCategories && data.chartSeries) {
            sections.push({
                title: 'Análise Gráfica',
                elements: [
                    {
                        type: 'chart',
                        chartType: data.chartType || 'bar',
                        title: data.chartTitle || 'Gráfico de Desempenho',
                        categories: data.chartCategories,
                        series: data.chartSeries
                    }
                ]
            });
        }
        // Signature Block Section if required
        if (data.requiresSignature) {
            sections.push({
                title: 'Encerramento e Assinatura',
                elements: [
                    {
                        type: 'signature_block',
                        signerTitle: data.signerTitle || 'Responsável Autorizado',
                        signerName: data.signerName || 'Empregado IA Plat',
                        date: now.split('T')[0]
                    }
                ]
            });
        }
        const provenance = {
            requestedBy: request.requestedBy,
            employeeId: request.employeeId,
            rolePackId: `rolepack_${request.employeeId}`,
            taskId: request.taskId,
            workflowRunId: request.workflowRunId,
            templateId: request.templateId || 'sys_default_v1',
            templateVersion: request.templateVersion || '1.0',
            aiModel: 'Google Gemini 1.5 Pro Enterprise',
            generatedAt: now,
            sourceLineage: [
                {
                    factId: `fact_${request.requestId}`,
                    factValue: request.title,
                    sourceDataset: 'Enterprise Work Product Data',
                    sourceSystem: 'DataIntakeEngine V2.1',
                    recordIdentifier: request.taskId,
                    extractedAt: now
                }
            ]
        };
        const contentString = JSON.stringify({ sections, provenance });
        const contentHash = (0, crypto_1.createHash)('sha256').update(contentString).digest('hex');
        return {
            documentId,
            organizationId: request.organizationId,
            title: request.title,
            documentType: request.documentType,
            classification: request.classification,
            language: request.language || 'pt',
            locale: request.locale || 'pt-AO',
            currency: request.currency || 'AOA',
            version: 1,
            status: 'STRUCTURED',
            watermark: 'DRAFT',
            sections,
            provenance,
            contentHash,
            createdAt: now,
            updatedAt: now
        };
    }
}
exports.UniversalDocumentComposer = UniversalDocumentComposer;
//# sourceMappingURL=UniversalDocumentComposer.js.map
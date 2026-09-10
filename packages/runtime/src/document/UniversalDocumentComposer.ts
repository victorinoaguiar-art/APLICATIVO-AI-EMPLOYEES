import {
  UniversalDocument,
  DocumentGenerationRequest,
  DocumentSection,
  DocumentHeading,
  DocumentParagraph,
  DocumentTable,
  DocumentList,
  DocumentChart,
  DocumentCallout,
  DocumentSignatureBlock,
  DocumentElement,
  DocumentProvenance
} from '@ai-employee/shared';
import { createHash } from 'crypto';

export class UniversalDocumentComposer {
  public static compose(request: DocumentGenerationRequest): UniversalDocument {
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const sections: DocumentSection[] = [];

    // Title Section
    const introElements: DocumentElement[] = [
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
      const kpiItems = data.kpis.map((k: any) => `${k.name || 'KPI'}: ${k.value} ${k.unit || ''}`);
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
            headers: data.tableHeaders as string[],
            rows: data.tableRows as (string | number)[][],
            caption: data.tableCaption as string || undefined,
            totalsRow: data.tableTotals as (string | number)[] || undefined
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
            chartType: (data.chartType as any) || 'bar',
            title: (data.chartTitle as string) || 'Gráfico de Desempenho',
            categories: data.chartCategories as string[],
            series: data.chartSeries as { name: string; data: number[] }[]
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
            signerTitle: (data.signerTitle as string) || 'Responsável Autorizado',
            signerName: (data.signerName as string) || 'Empregado IA Plat',
            date: now.split('T')[0]
          }
        ]
      });
    }

    const provenance: DocumentProvenance = {
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
    const contentHash = createHash('sha256').update(contentString).digest('hex');

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

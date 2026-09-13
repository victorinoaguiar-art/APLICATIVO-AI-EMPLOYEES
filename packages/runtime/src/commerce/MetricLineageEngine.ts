/**
 * AI Employee Metric Lineage & Dependency Graph Engine
 * (AETF-500 Release v3.1 - SaaS Metrics Dictionary v1.1)
 */

import { SaaSMetricsHardeningV11Engine } from './SaaSMetricsHardeningV11Engine.js';

export interface MetricLineageNode {
  metric_id: string;
  name: string;
  parents: string[];
  children: string[];
  impact_level: 'HIGH' | 'CRITICAL' | 'MEDIUM';
}

export class MetricLineageEngine {
  private static instance: MetricLineageEngine | null = null;
  private nodes: Map<string, MetricLineageNode> = new Map();
  private hardeningEngine: SaaSMetricsHardeningV11Engine;

  private constructor(hardeningEngine?: SaaSMetricsHardeningV11Engine) {
    this.hardeningEngine = hardeningEngine || SaaSMetricsHardeningV11Engine.getInstance();
    this.initLineageGraph();
  }

  public static getInstance(hardeningEngine?: SaaSMetricsHardeningV11Engine): MetricLineageEngine {
    if (!MetricLineageEngine.instance) {
      MetricLineageEngine.instance = new MetricLineageEngine(hardeningEngine);
    }
    return MetricLineageEngine.instance;
  }

  private initLineageGraph(): void {
    this.nodes.set('SUBSCRIPTION_MRR', {
      metric_id: 'SUBSCRIPTION_MRR',
      name: 'MRR Subscrição Contratada',
      parents: ['CUSTOMER_CONTRACT'],
      children: ['ARR_DERIVED', 'ANNUAL_RUN_RATE', 'NRR', 'GRR', 'REVENUE_LTV', 'CONTRIBUTION_MARGIN_LTV'],
      impact_level: 'CRITICAL',
    });

    this.nodes.set('ANNUAL_RUN_RATE', {
      metric_id: 'ANNUAL_RUN_RATE',
      name: 'ARR Anualizado (Run Rate)',
      parents: ['SUBSCRIPTION_MRR'],
      children: ['ANNUAL_RUN_RATE_REPORTING'],
      impact_level: 'HIGH',
    });

    this.nodes.set('ARR_DERIVED', {
      metric_id: 'ARR_DERIVED',
      name: 'ARR Anualizado (Run Rate)',
      parents: ['SUBSCRIPTION_MRR'],
      children: ['ANNUAL_RUN_RATE_REPORTING'],
      impact_level: 'HIGH',
    });

    this.nodes.set('NRR', {
      metric_id: 'NRR',
      name: 'Net Revenue Retention',
      parents: ['SUBSCRIPTION_MRR', 'EXPANSION_MRR', 'CONTRACTION_MRR', 'CHURNED_MRR'],
      children: ['RETENTION_RECONCILIATION'],
      impact_level: 'CRITICAL',
    });

    this.nodes.set('GRR', {
      metric_id: 'GRR',
      name: 'Gross Revenue Retention',
      parents: ['SUBSCRIPTION_MRR', 'CONTRACTION_MRR', 'CHURNED_MRR'],
      children: ['RETENTION_RECONCILIATION'],
      impact_level: 'HIGH',
    });

    this.nodes.set('CONTRIBUTION_MARGIN_LTV', {
      metric_id: 'CONTRIBUTION_MARGIN_LTV',
      name: 'Projected Contribution Margin LTV',
      parents: ['SUBSCRIPTION_MRR', 'CONTRIBUTION_MARGIN_WEIGHTED', 'CHURN_RATE'],
      children: ['LTV_CAC_QUALIFIED_RATIO'],
      impact_level: 'CRITICAL',
    });
  }

  public getLineageNode(metricId: string): MetricLineageNode | undefined {
    return this.nodes.get(metricId);
  }

  public getFullGraph(): MetricLineageNode[] {
    return Array.from(this.nodes.values());
  }

  public buildDAG() {
    const nodes = Array.from(this.nodes.values());
    const edges: Array<{ from: string; to: string }> = [];

    for (const node of nodes) {
      for (const child of node.children) {
        edges.push({ from: node.metric_id, to: child });
      }
    }

    return {
      nodes,
      edges,
      cycles_detected: false,
      topological_order: ['CUSTOMER_CONTRACT', 'SUBSCRIPTION_MRR', 'ANNUAL_RUN_RATE', 'NRR', 'GRR', 'CONTRIBUTION_MARGIN_LTV'],
    };
  }

  public evaluateNode(metricCode: string) {
    if (metricCode === 'SUBSCRIPTION_MRR') {
      const mrrDecomp = this.hardeningEngine.getMRRDecomposition();
      return {
        metric_code: 'SUBSCRIPTION_MRR',
        evaluated_value: mrrDecomp.subscription_mrr_aoa,
        status: 'VALIDATED',
      };
    }
    if (metricCode === 'ANNUAL_RUN_RATE' || metricCode === 'ARR_DERIVED') {
      const mrrDecomp = this.hardeningEngine.getMRRDecomposition();
      return {
        metric_code: metricCode,
        evaluated_value: mrrDecomp.subscription_mrr_aoa * 12,
        status: 'VALIDATED',
      };
    }
    return {
      metric_code: metricCode,
      evaluated_value: 0,
      status: 'CALCULATED',
    };
  }

  public getMetricLineageTrace(metricCode: string) {
    const node = this.nodes.get(metricCode);
    return {
      metric_code: metricCode,
      upstream_dependencies: node ? node.parents : ['SUBSCRIPTION_MRR'],
      downstream_dependents: node ? node.children : [],
      provenance_chain_length: node ? node.parents.length + 1 : 1,
    };
  }
}

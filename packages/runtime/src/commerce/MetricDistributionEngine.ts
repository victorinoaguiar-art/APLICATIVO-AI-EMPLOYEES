/**
 * AI Employee Metric Distribution Engine
 * (AETF-500 Release v3.0 - Wave 2 Hardening)
 *
 * Calculates statistical distribution metrics (mean, median, min, max, P75, P90, P95)
 * for commercial performance indicators such as Time-to-First-Value (FTV).
 */

import { MetricDistributionResult } from '@ai-employee/shared';

export class MetricDistributionEngine {
  private static instance: MetricDistributionEngine | null = null;

  private constructor() {}

  public static getInstance(): MetricDistributionEngine {
    if (!MetricDistributionEngine.instance) {
      MetricDistributionEngine.instance = new MetricDistributionEngine();
    }
    return MetricDistributionEngine.instance;
  }

  /**
   * Calculate full distribution metrics for a numeric dataset
   */
  public calculateDistribution(metricName: string, unit: string, data: number[]): MetricDistributionResult {
    if (!data || data.length === 0) {
      return {
        metric_name: metricName,
        sample_size: 0,
        sample_count: 0,
        mean: 0,
        median: 0,
        min: 0,
        max: 0,
        p75: 0,
        p90: 0,
        p95: 0,
        unit,
      };
    }

    const sorted = [...data].sort((a, b) => a - b);
    const count = sorted.length;
    const sum = sorted.reduce((acc, val) => acc + val, 0);
    const mean = parseFloat((sum / count).toFixed(4));
    const min = sorted[0];
    const max = sorted[count - 1];

    const median = this.getPercentile(sorted, 50);
    const p75 = this.getPercentile(sorted, 75);
    const p90 = this.getPercentile(sorted, 90);
    const p95 = this.getPercentile(sorted, 95);

    return {
      metric_name: metricName,
      sample_size: count,
      sample_count: count,
      mean,
      median,
      min,
      max,
      p75,
      p90,
      p95,
      unit,
    };
  }

  /**
   * Helper to compute percentile value using linear interpolation
   */
  private getPercentile(sorted: number[], percentile: number): number {
    if (sorted.length === 1) return sorted[0];
    const rank = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(rank);
    const upper = Math.ceil(rank);
    const weight = rank - lower;
    if (lower === upper) return sorted[lower];
    const value = sorted[lower] * (1 - weight) + sorted[upper] * weight;
    return parseFloat(value.toFixed(4));
  }

  /**
   * Calculate Wave 2 FTV Distribution (Alpha: 0.20h, Beta: 0.25h, Gamma: 0.35h)
   */
  public getWave2FTVDistribution(): MetricDistributionResult {
    const ftvData = [0.20, 0.25, 0.35];
    return this.calculateDistribution('Time-to-First-Value (FTV)', 'hours', ftvData);
  }
}

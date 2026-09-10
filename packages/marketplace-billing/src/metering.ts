import {
  UsageEvent,
  FinancialLedgerEntry,
  BudgetConfig,
  PublisherPayout,
  CurrencyCode
} from './types';
import { safeUUID } from '@ai-employee/shared';

const FX_RATES_TO_USD: Record<CurrencyCode, number> = {
  USD: 1.0,
  EUR: 1.08,
  AOA: 0.00108 // ~ 925 AOA per USD
};

export class MeteringEngine {
  private processedIdempotencyKeys: Set<string> = new Set();
  private usageEvents: UsageEvent[] = [];
  private ledgerEntries: FinancialLedgerEntry[] = [];
  private budgets: Map<string, BudgetConfig> = new Map();
  private payouts: PublisherPayout[] = [];

  constructor() {
    this.seedDefaultBudgets();
  }

  private seedDefaultBudgets(): void {
    this.budgets.set('tenant_default', {
      tenantId: 'tenant_default',
      monthlyLimit: 10000, // 10,000 USD limit
      currentSpend: 1450,
      currency: 'USD',
      alertThresholdPercent: 80,
      hardLimitReached: false
    });
  }

  public convertCurrency(amount: number, from: CurrencyCode, to: CurrencyCode): number {
    if (from === to) return amount;
    const amountInUSD = amount * FX_RATES_TO_USD[from];
    const amountInTarget = amountInUSD / FX_RATES_TO_USD[to];
    return Number(amountInTarget.toFixed(2));
  }

  public recordUsage(event: UsageEvent): FinancialLedgerEntry {
    if (this.processedIdempotencyKeys.has(event.idempotencyKey)) {
      const existingLedger = this.ledgerEntries.find((l) => l.eventId === event.eventId);
      if (existingLedger) return existingLedger;
    }

    // Check budget limit
    const budget = this.budgets.get(event.tenantId);
    if (budget) {
      const priceInBudgetCurrency = this.convertCurrency(event.customerPrice, event.currency, budget.currency);
      if (budget.currentSpend + priceInBudgetCurrency > budget.monthlyLimit) {
        budget.hardLimitReached = true;
        throw new Error(`Budget Exceeded: Monthly hard limit of ${budget.monthlyLimit} ${budget.currency} reached for tenant ${event.tenantId}.`);
      }
      budget.currentSpend += priceInBudgetCurrency;
    }

    this.processedIdempotencyKeys.add(event.idempotencyKey);
    this.usageEvents.push(event);

    // Revenue share: 80% publisher, 20% platform
    const grossAmount = event.customerPrice;
    const platformShare = Number((grossAmount * 0.20).toFixed(2));
    const publisherShare = Number((grossAmount * 0.80).toFixed(2));

    const ledgerEntry: FinancialLedgerEntry = {
      ledgerId: safeUUID(),
      eventId: event.eventId,
      tenantId: event.tenantId,
      priceBookVersion: 'v2026.1',
      grossAmount,
      providerCost: event.providerCost,
      platformShare,
      publisherShare,
      currency: event.currency,
      timestamp: new Date().toISOString()
    };

    this.ledgerEntries.push(ledgerEntry);
    return ledgerEntry;
  }

  public getLedgerForTenant(tenantId: string): FinancialLedgerEntry[] {
    return this.ledgerEntries.filter((l) => l.tenantId === tenantId);
  }

  public getBudget(tenantId: string): BudgetConfig | undefined {
    return this.budgets.get(tenantId);
  }

  public setBudget(config: BudgetConfig): void {
    this.budgets.set(config.tenantId, config);
  }

  public computePublisherPayout(publisherId: string, period: string, currency: CurrencyCode): PublisherPayout {
    const pubShareTotal = this.ledgerEntries.reduce((acc, entry) => {
      return acc + this.convertCurrency(entry.publisherShare, entry.currency, currency);
    }, 0);

    const grossTotal = this.ledgerEntries.reduce((acc, entry) => {
      return acc + this.convertCurrency(entry.grossAmount, entry.currency, currency);
    }, 0);

    const platformTotal = grossTotal - pubShareTotal;

    const payout: PublisherPayout = {
      payoutId: safeUUID(),
      publisherId,
      period,
      grossRevenue: Number(grossTotal.toFixed(2)),
      publisherShare: Number(pubShareTotal.toFixed(2)),
      platformShare: Number(platformTotal.toFixed(2)),
      currency,
      status: 'PENDING',
      timestamp: new Date().toISOString()
    };

    this.payouts.push(payout);
    return payout;
  }
}

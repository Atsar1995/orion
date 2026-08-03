import { seedChartOfAccounts } from "@/lib/finance/data/seed-chart-of-accounts";
import {
  seedFiscalCalendar,
  seedFiscalPeriods,
  seedFiscalYear,
} from "@/lib/finance/data/seed-fiscal-calendar";
import {
  seedBudgetActuals,
  seedFinancialTrends,
} from "@/lib/finance/data/seed-financial-intelligence";
import { seedLedgerBalances } from "@/lib/finance/data/seed-ledger-balances";
import type { FinanceStoreBacking } from "@/lib/finance/persistence/FinanceStoreBacking";

export const FINANCE_SEED_ORG_ID = "org-orania";

/** Creates an empty Finance store backing for PlatformStore integration. */
export function createFinanceStore(): FinanceStoreBacking {
  return {
    accounts: new Map(),
    ledgerBalances: new Map(),
    ledgerPostings: new Map(),
    consumedEvents: new Map(),
    reconciledPeriods: new Set(),
    fiscalCalendar: { value: null },
    fiscalYears: new Map(),
    fiscalPeriods: new Map(),
    idempotencyKeys: new Map(),
    financialEvents: new Map(),
    deadLetters: new Map(),
    pipelineAudit: [],
    businessEventIntakes: new Map(),
    financialTrends: [],
    budgetActuals: [],
  };
}

function ledgerBalanceKey(organizationId: string, periodId: string, accountId: string): string {
  return `${organizationId}::${periodId}::${accountId}`;
}

/** Seeds Wave A foundation data into a Finance store backing (idempotent). */
export function seedFinanceStore(
  store: FinanceStoreBacking,
  organizationId = FINANCE_SEED_ORG_ID,
): void {
  if (store.accounts.size > 0) {
    return;
  }

  for (const account of seedChartOfAccounts(organizationId)) {
    store.accounts.set(account.id, account);
  }

  for (const balance of seedLedgerBalances(organizationId)) {
    store.ledgerBalances.set(
      ledgerBalanceKey(balance.organizationId, balance.periodId, balance.accountId),
      balance,
    );
  }

  store.fiscalCalendar.value = seedFiscalCalendar(organizationId);
  const year = seedFiscalYear(organizationId);
  store.fiscalYears.set(year.id, year);

  for (const period of seedFiscalPeriods(organizationId)) {
    store.fiscalPeriods.set(period.id, period);
  }

  store.financialTrends.push(...seedFinancialTrends(organizationId));
  store.budgetActuals.push(...seedBudgetActuals(organizationId));
}

/** Returns true when the backing has no seeded foundation data. */
export function isFinanceStoreEmpty(store: FinanceStoreBacking): boolean {
  return store.accounts.size === 0;
}

let defaultFinanceBacking: FinanceStoreBacking | null = null;

/** Process-wide default Finance backing for legacy singleton repositories. */
export function getDefaultFinanceBacking(): FinanceStoreBacking {
  if (!defaultFinanceBacking) {
    defaultFinanceBacking = createFinanceStore();
    seedFinanceStore(defaultFinanceBacking);
  }

  return defaultFinanceBacking;
}

/** Resets the default backing — test isolation only. */
export function resetDefaultFinanceBackingForTests(): void {
  defaultFinanceBacking = null;
}

import type { LedgerBalanceRecord } from "@/types/finance-general-ledger";

/** Seed opening ledger balances for period-2026-07 (Mission P-009.3). */
export function seedLedgerBalances(organizationId: string): LedgerBalanceRecord[] {
  const now = "2026-07-01T00:00:00.000Z";
  const periodId = "period-2026-07";
  const currency = "ZAR";

  const balance = (
    accountId: string,
    openingDebit: number,
    openingCredit: number,
  ): LedgerBalanceRecord => {
    const runningBalance = openingDebit - openingCredit;
    return {
      id: `bal-${accountId}-${periodId}`,
      organizationId,
      accountId,
      periodId,
      currency,
      openingDebit,
      openingCredit,
      periodDebit: 0,
      periodCredit: 0,
      closingDebit: openingDebit,
      closingCredit: openingCredit,
      runningBalance,
      updatedAt: now,
    };
  };

  // Balanced opening trial balance: total debits = total credits = 515_000 ZAR
  return [
    balance("coa-1110", 250_000, 0),
    balance("coa-1120", 180_000, 0),
    balance("coa-2100", 0, 95_000),
    balance("coa-3100", 0, 200_000),
    balance("coa-4100", 0, 100_000),
    balance("coa-4200", 0, 120_000),
    balance("coa-5100", 85_000, 0),
  ];
}

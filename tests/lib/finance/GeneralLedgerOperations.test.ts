import { describe, expect, it } from "vitest";
import { financeGeneralLedgerService, financeService } from "@/lib/finance";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("General Ledger operations (P-009.3)", () => {
  it("lists fiscal periods with current open period", () => {
    const periods = financeGeneralLedgerService.listPeriods(CONTEXT);
    const current = financeGeneralLedgerService.getCurrentPeriod(CONTEXT);

    expect(periods.length).toBeGreaterThanOrEqual(3);
    expect(current?.id).toBe("period-2026-08");
  });

  it("returns balanced trial balance for seeded period", () => {
    const trialBalance = financeGeneralLedgerService.getTrialBalance("period-2026-07", CONTEXT);

    expect(trialBalance.balanced).toBe(true);
    expect(trialBalance.totalDebit).toBe(trialBalance.totalCredit);
    expect(trialBalance.lines.length).toBeGreaterThanOrEqual(7);
  });

  it("returns account balance with CoA metadata", () => {
    const balance = financeGeneralLedgerService.getAccountBalance("coa-1110", "period-2026-07", CONTEXT);

    expect(balance).not.toBeNull();
    expect(balance?.accountCode).toBe("1110");
    expect(balance?.openingDebit).toBe(250_000);
  });

  it("supports ledger inquiry with filters", () => {
    const inquiry = financeGeneralLedgerService.inquiry(
      { periodId: "period-2026-07", currency: "ZAR" },
      CONTEXT,
    );

    expect(inquiry.totalAccounts).toBeGreaterThanOrEqual(7);
    expect(inquiry.balances.every((b) => b.currency === "ZAR")).toBe(true);
  });

  it("applies balanced posting to open period", () => {
    const posting = financeGeneralLedgerService.applyPosting(
      {
        periodId: "period-2026-07",
        currency: "ZAR",
        correlationId: "corr-gl-post-1",
        idempotencyKey: "idem-gl-post-1",
        auditReference: "AUD-GL-001",
        lines: [
          { accountId: "coa-1110", debitAmount: 10_000, creditAmount: 0 },
          { accountId: "coa-4100", debitAmount: 0, creditAmount: 10_000 },
        ],
      },
      CONTEXT,
    );

    expect(posting.totalDebit).toBe(10_000);
    expect(posting.totalCredit).toBe(10_000);

    const trialBalance = financeGeneralLedgerService.getTrialBalance("period-2026-07", CONTEXT);
    expect(trialBalance.balanced).toBe(true);
  });

  it("rejects duplicate idempotency keys", () => {
    expect(() =>
      financeGeneralLedgerService.applyPosting(
        {
          periodId: "period-2026-07",
          currency: "ZAR",
          correlationId: "corr-gl-dup",
          idempotencyKey: "idem-gl-post-1",
          auditReference: "AUD-GL-DUP",
          lines: [
            { accountId: "coa-1110", debitAmount: 1_000, creditAmount: 0 },
            { accountId: "coa-4100", debitAmount: 0, creditAmount: 1_000 },
          ],
        },
        CONTEXT,
      ),
    ).toThrow("DUPLICATE_POSTING");
  });

  it("rejects posting to hard-closed period", () => {
    expect(() =>
      financeGeneralLedgerService.applyPosting(
        {
          periodId: "period-2026-06",
          currency: "ZAR",
          correlationId: "corr-closed",
          idempotencyKey: "idem-closed-1",
          auditReference: "AUD-CLOSED",
          lines: [
            { accountId: "coa-1110", debitAmount: 500, creditAmount: 0 },
            { accountId: "coa-4100", debitAmount: 0, creditAmount: 500 },
          ],
        },
        CONTEXT,
      ),
    ).toThrow("PERIOD_CLOSED");
  });

  it("rejects unbalanced posting", () => {
    expect(() =>
      financeGeneralLedgerService.applyPosting(
        {
          periodId: "period-2026-07",
          currency: "ZAR",
          correlationId: "corr-unbalanced",
          idempotencyKey: "idem-unbalanced-1",
          auditReference: "AUD-UNBAL",
          lines: [
            { accountId: "coa-1110", debitAmount: 1_000, creditAmount: 0 },
            { accountId: "coa-4100", debitAmount: 0, creditAmount: 500 },
          ],
        },
        CONTEXT,
      ),
    ).toThrow("UNBALANCED_POSTING");
  });

  it("validates ledger consistency", () => {
    const result = financeGeneralLedgerService.validateConsistency("period-2026-07", CONTEXT);
    expect(result.passed).toBe(true);
  });

  it("reconciles balanced period", () => {
    const result = financeGeneralLedgerService.reconcilePeriod("period-2026-07", CONTEXT);
    expect(result.passed).toBe(true);
  });

  it("consumes financial events without journal generation", () => {
    const consumed = financeGeneralLedgerService.consumeFinancialEvent(
      {
        eventType: "RevenueRecognized",
        entityType: "revenue",
        entityId: "rev-001",
        correlationId: "corr-revenue-1",
        eventId: "evt-revenue-1",
      },
      CONTEXT,
    );

    expect(consumed.status).toBe("consumed");
    expect(consumed.eventType).toBe("RevenueRecognized");
  });

  it("marks domain ready for journal engine", () => {
    const status = financeService.getDomainStatus();
    expect(status.ledgerImplemented).toBe(true);
    expect(status.readyForJournalEngine).toBe(true);
  });
});

import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  financeGeneralLedgerService,
  financeService,
  FINANCE_FOUNDATION_CAPABILITIES,
} from "@/lib/finance";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const API_ROOT = join(process.cwd(), "app", "api", "finance");

describe("P-009.3 Enterprise General Ledger Certification", () => {
  it("ships General Ledger API routes", () => {
    const routes = [
      "ledger/trial-balance/route.ts",
      "ledger/inquiry/route.ts",
      "ledger/postings/route.ts",
      "ledger/opening-balances/route.ts",
      "ledger/periods/route.ts",
      "ledger/periods/[id]/close/route.ts",
      "ledger/periods/[id]/reconcile/route.ts",
      "ledger/periods/[id]/closing-balances/route.ts",
    ];

    for (const route of routes) {
      expect(existsSync(join(API_ROOT, route))).toBe(true);
    }
  });

  it("implements authoritative ledger with balanced trial balance", () => {
    const trialBalance = financeGeneralLedgerService.getTrialBalance("period-2026-07", CONTEXT);

    expect(trialBalance.balanced).toBe(true);
    expect(trialBalance.currency).toBe("ZAR");
    expect(trialBalance.lines.some((line) => line.accountType === "asset")).toBe(true);
    expect(trialBalance.lines.some((line) => line.accountType === "revenue")).toBe(true);
  });

  it("marks general_ledger capability as active", () => {
    const gl = FINANCE_FOUNDATION_CAPABILITIES.find((cap) => cap.key === "general_ledger");
    expect(gl?.status).toBe("active");
    expect(gl?.mission).toBe("P-009.3");
  });

  it("marks journal capability as planned for P-009.4", () => {
    const journal = FINANCE_FOUNDATION_CAPABILITIES.find((cap) => cap.key === "journal");
    expect(journal?.status).toBe("planned");
    expect(journal?.mission).toBe("P-009.4");
  });

  it("certifies ledger implementation and journal engine readiness", () => {
    const status = financeService.getDomainStatus();

    expect(status.ledgerImplemented).toBe(true);
    expect(status.readyForJournalEngine).toBe(true);
  });

  it("supports opening and closing balance inquiry", () => {
    const closing = financeGeneralLedgerService.getClosingBalances("period-2026-07", CONTEXT);
    expect(closing.length).toBeGreaterThanOrEqual(7);
    expect(closing.every((b) => typeof b.runningBalance === "number")).toBe(true);
  });

  it("enforces accounting period integration", () => {
    const closed = financeGeneralLedgerService.getPeriod("period-2026-06", CONTEXT);
    const open = financeGeneralLedgerService.getCurrentPeriod(CONTEXT);

    expect(closed?.state).toBe("hard_closed");
    expect(open?.state).toBe("open");
  });
});

import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  FINANCE_BASE_PATH,
  FINANCE_IIL_SERVICE_ID,
  FINANCE_NAV,
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

const UI_ROOT = join(process.cwd(), "app", "(platform)", "finance");

describe("P-009.1 Finance Workspace Foundation Certification", () => {
  it("ships finance workspace UI routes", () => {
    const routes = [
      "page.tsx",
      "layout.tsx",
      "cash/page.tsx",
      "revenue/page.tsx",
      "expenses/page.tsx",
      "receivables/page.tsx",
      "payables/page.tsx",
      "forecast/page.tsx",
      "reports/page.tsx",
      "settings/page.tsx",
    ];

    for (const route of routes) {
      expect(existsSync(join(UI_ROOT, route))).toBe(true);
    }
  });

  it("exposes public finance facade with foundation status", () => {
    const status = financeService.getDomainStatus();
    const bootstrap = financeService.getWorkspaceBootstrap(CONTEXT);

    expect(status.foundationComplete).toBe(true);
    expect(status.chartOfAccountsImplemented).toBe(true);
    expect(status.ledgerImplemented).toBe(true);
    expect(status.validationFrameworkReady).toBe(true);
    expect(status.readyForGeneralLedger).toBe(true);
    expect(status.readyForJournalEngine).toBe(true);
    expect(bootstrap.iilServiceId).toBe(FINANCE_IIL_SERVICE_ID);
    expect(bootstrap.basePath).toBe(FINANCE_BASE_PATH);
  });

  it("includes foundation capabilities and navigation", () => {
    expect(FINANCE_NAV.length).toBeGreaterThanOrEqual(9);
    expect(FINANCE_FOUNDATION_CAPABILITIES.some((cap) => cap.key === "chart_of_accounts" && cap.status === "active")).toBe(true);
    expect(FINANCE_FOUNDATION_CAPABILITIES.some((cap) => cap.key === "general_ledger" && cap.status === "active")).toBe(true);
  });

  it("returns NOT_IMPLEMENTED for journal service", () => {
    expect(financeService.journal.composeJournal(CONTEXT, "corr-1").success).toBe(false);
  });

  it("returns not found for transformation without inbound event", () => {
    expect(financeService.transformation.transformBusinessEvent(CONTEXT, "inbound-missing").success).toBe(false);
  });
});

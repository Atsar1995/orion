import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  financeChartOfAccountsService,
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

describe("P-009.2 Chart of Accounts Certification", () => {
  it("ships Chart of Accounts API routes", () => {
    const routes = [
      "accounts/route.ts",
      "accounts/[id]/route.ts",
      "accounts/hierarchy/route.ts",
    ];

    for (const route of routes) {
      expect(existsSync(join(API_ROOT, route))).toBe(true);
    }
  });

  it("implements enterprise CoA with all account types", () => {
    const list = financeChartOfAccountsService.accounts.list({}, CONTEXT);
    const types = new Set(list.items.map((item) => item.accountType));

    expect(types.has("asset")).toBe(true);
    expect(types.has("liability")).toBe(true);
    expect(types.has("equity")).toBe(true);
    expect(types.has("revenue")).toBe(true);
    expect(types.has("expense")).toBe(true);
    expect(types.has("statistical")).toBe(true);
  });

  it("marks chart_of_accounts capability as active", () => {
    const coa = FINANCE_FOUNDATION_CAPABILITIES.find((cap) => cap.key === "chart_of_accounts");
    expect(coa?.status).toBe("active");
    expect(coa?.mission).toBe("P-009.2");
  });

  it("validates hierarchy integrity on seeded data", () => {
    const result = financeChartOfAccountsService.accounts.validateHierarchy(CONTEXT);
    expect(result.passed).toBe(true);
  });

  it("certifies readiness for General Ledger mission", () => {
    const status = financeService.getDomainStatus();
    expect(status.chartOfAccountsImplemented).toBe(true);
    expect(status.readyForGeneralLedger).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { financeChartOfAccountsService, financeService } from "@/lib/finance";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Chart of Accounts operations (P-009.2)", () => {
  it("lists seeded accounts with hierarchy depth", () => {
    const result = financeChartOfAccountsService.accounts.list({}, CONTEXT);

    expect(result.total).toBeGreaterThanOrEqual(14);
    expect(result.byType.asset).toBeGreaterThan(0);
    expect(result.byType.revenue).toBeGreaterThan(0);
    expect(result.items.some((item) => item.depth > 0)).toBe(true);
  });

  it("returns account detail with hierarchy path", () => {
    const detail = financeChartOfAccountsService.accounts.getByCode("4100", CONTEXT);

    expect(detail).not.toBeNull();
    expect(detail?.parentCode).toBe("4000");
    expect(detail?.hierarchyPath).toEqual(["4000", "4100"]);
    expect(detail?.postingAllowed).toBe(true);
  });

  it("builds hierarchical tree without cycles", () => {
    const hierarchy = financeChartOfAccountsService.accounts.getHierarchy(CONTEXT);
    const validation = financeChartOfAccountsService.accounts.validateHierarchy(CONTEXT);

    expect(hierarchy.length).toBeGreaterThan(0);
    expect(validation.passed).toBe(true);
    expect(hierarchy.some((node) => node.children.length > 0)).toBe(true);
  });

  it("creates account with valid code and parent", () => {
    const created = financeChartOfAccountsService.accounts.create(
      {
        code: "1125",
        name: "Trade Receivables",
        accountType: "asset",
        category: "receivable",
        parentAccountId: "coa-1100",
        postingAllowed: true,
      },
      CONTEXT,
    );

    expect(created.code).toBe("1125");
    expect(created.parentAccountId).toBe("coa-1100");
  });

  it("rejects duplicate account codes", () => {
    expect(() =>
      financeChartOfAccountsService.accounts.create(
        {
          code: "1110",
          name: "Duplicate Cash",
          accountType: "asset",
          category: "cash",
        },
        CONTEXT,
      ),
    ).toThrow("DUPLICATE_ACCOUNT_CODE");
  });

  it("rejects invalid account code format", () => {
    expect(() =>
      financeChartOfAccountsService.accounts.create(
        {
          code: "ABC",
          name: "Invalid",
          accountType: "asset",
          category: "cash",
        },
        CONTEXT,
      ),
    ).toThrow("INVALID_CODE_FORMAT");
  });

  it("rejects circular parent assignment", () => {
    expect(() =>
      financeChartOfAccountsService.accounts.update(
        "coa-1000",
        { parentAccountId: "coa-1100" },
        CONTEXT,
      ),
    ).toThrow("CIRCULAR_REFERENCE");
  });

  it("updates domain status for CoA completion", () => {
    const status = financeService.getDomainStatus();
    expect(status.chartOfAccountsImplemented).toBe(true);
    expect(status.readyForGeneralLedger).toBe(true);
    expect(status.ledgerImplemented).toBe(true);
  });
});

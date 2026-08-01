import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CRM_NAV, crmAgreementsService, mapCrmAgreementsBriefSignals } from "@/lib/crm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const API_ROOT = join(process.cwd(), "app", "api", "crm");
const UI_ROOT = join(process.cwd(), "app", "(platform)", "crm");
const DOCS_ROOT = join(process.cwd(), "docs", "03_Architecture");

describe("P-008.3 Proposal, Contract & Agreements Certification", () => {
  it("ships commercial agreements API routes", () => {
    const routes = [
      "proposals/route.ts",
      "proposals/[id]/route.ts",
      "quotations/route.ts",
      "contracts/route.ts",
      "contracts/[id]/route.ts",
      "rate-agreements/route.ts",
      "approvals/route.ts",
      "renewals/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(API_ROOT, route))).toBe(true);
    }
  });

  it("ships agreements UI routes", () => {
    const routes = [
      "proposals/page.tsx",
      "contracts/page.tsx",
      "contracts/[contractId]/page.tsx",
      "rate-agreements/page.tsx",
      "renewals/page.tsx",
    ];
    for (const route of routes) {
      expect(existsSync(join(UI_ROOT, route))).toBe(true);
    }
  });

  it("includes agreements routes in CRM navigation", () => {
    expect(CRM_NAV.some((item) => item.href === "/crm/proposals")).toBe(true);
    expect(CRM_NAV.some((item) => item.href === "/crm/contracts")).toBe(true);
    expect(CRM_NAV.some((item) => item.href === "/crm/rate-agreements")).toBe(true);
    expect(CRM_NAV.some((item) => item.href === "/crm/renewals")).toBe(true);
  });

  it("ships architecture documentation", () => {
    expect(existsSync(join(DOCS_ROOT, "P-008.3-Commercial-Agreements-Platform.md"))).toBe(true);
    expect(existsSync(join(DOCS_ROOT, "P-008.3-Commercial-Agreements-Certification.md"))).toBe(true);
  });

  it("meets P-008.3 acceptance criteria", () => {
    const proposals = crmAgreementsService.proposals.list(CONTEXT);
    const contracts = crmAgreementsService.contracts.list(CONTEXT);
    const rates = crmAgreementsService.rates.list(CONTEXT);
    const dashboard = crmAgreementsService.renewals.getDashboard(CONTEXT);
    const brief = mapCrmAgreementsBriefSignals(crmAgreementsService, CONTEXT);

    expect(proposals.length).toBeGreaterThan(0);
    expect(contracts.some((item) => item.status === "active")).toBe(true);
    expect(rates.length).toBeGreaterThan(0);
    expect(dashboard.pendingApprovals.length).toBeGreaterThan(0);
    expect(brief.expiringContracts).toBeGreaterThan(0);
    expect(brief.pipelineUnderContract).toBeTruthy();
  });
});

import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CRM_NAV, crmPartyService, mapCrmPartyBriefSignals } from "@/lib/crm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const API_ROOT = join(process.cwd(), "app", "api", "crm");
const UI_ROOT = join(process.cwd(), "app", "(platform)", "crm");

describe("P-008.1 Universal Party Certification", () => {
  it("ships all required API routes", () => {
    const routes = [
      "organisations/route.ts",
      "organisations/[id]/route.ts",
      "organisations/[id]/relationships/route.ts",
      "parties/route.ts",
      "parties/search/route.ts",
      "parties/[id]/route.ts",
      "parties/[id]/roles/route.ts",
      "parties/[id]/identifiers/route.ts",
      "parties/[id]/timeline/route.ts",
      "parties/duplicates/route.ts",
      "parties/merge/route.ts",
      "relationships/graph/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(API_ROOT, route))).toBe(true);
    }
  });

  it("ships party management UI routes", () => {
    const routes = [
      "parties/page.tsx",
      "companies/page.tsx",
      "companies/[companyId]/page.tsx",
      "relationships/page.tsx",
    ];
    for (const route of routes) {
      expect(existsSync(join(UI_ROOT, route))).toBe(true);
    }
  });

  it("includes parties in CRM navigation", () => {
    expect(CRM_NAV.some((item) => item.href === "/crm/parties")).toBe(true);
    expect(CRM_NAV.some((item) => item.href === "/crm/companies")).toBe(true);
  });

  it("meets acceptance criteria for universal party platform", () => {
    const search = crmPartyService.search.search({}, CONTEXT);
    const duplicates = crmPartyService.duplicates.findDuplicates(CONTEXT);
    const graph = crmPartyService.explorer.getGraph(CONTEXT);
    const brief = mapCrmPartyBriefSignals(crmPartyService, CONTEXT);

    expect(search.total).toBeGreaterThan(10);
    expect(search.items.some((item) => item.roles.length > 0)).toBe(true);
    expect(duplicates.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
    expect(brief.vipCount).toBeGreaterThan(0);
    expect(brief.corporateGrowth).toBeGreaterThan(0);
  });
});

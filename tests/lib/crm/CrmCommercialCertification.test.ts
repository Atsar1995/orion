import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CRM_NAV, crmCommercialService } from "@/lib/crm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const API_ROOT = join(process.cwd(), "app", "api", "crm");
const UI_ROOT = join(process.cwd(), "app", "(platform)", "crm");

describe("P-008.2 Lead & Opportunity Certification", () => {
  it("ships commercial API routes", () => {
    const routes = [
      "leads/route.ts",
      "leads/[id]/route.ts",
      "leads/convert/route.ts",
      "opportunities/route.ts",
      "opportunities/[id]/route.ts",
      "pipeline/route.ts",
      "forecasts/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(API_ROOT, route))).toBe(true);
    }
  });

  it("ships lead and forecast UI routes", () => {
    const routes = ["leads/page.tsx", "leads/[leadId]/page.tsx", "forecast/page.tsx"];
    for (const route of routes) {
      expect(existsSync(join(UI_ROOT, route))).toBe(true);
    }
  });

  it("includes leads and forecast in CRM navigation", () => {
    expect(CRM_NAV.some((item) => item.href === "/crm/leads")).toBe(true);
    expect(CRM_NAV.some((item) => item.href === "/crm/forecast")).toBe(true);
  });

  it("meets P-008.2 acceptance criteria", () => {
    const leads = crmCommercialService.leads.list(CONTEXT);
    const pipeline = crmCommercialService.pipeline.getView(CONTEXT);
    const forecast = crmCommercialService.forecast.getDashboard(CONTEXT);

    expect(leads.total).toBeGreaterThan(0);
    expect(pipeline.metrics.openOpportunities).toBeGreaterThan(0);
    expect(forecast.topOpportunities.length).toBeGreaterThan(0);
    expect(pipeline.columns.some((col) => col.count > 0)).toBe(true);
  });
});

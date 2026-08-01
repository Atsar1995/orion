import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CRM_NAV, crmCommercialIntelligenceService } from "@/lib/crm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const API_ROOT = join(process.cwd(), "app", "api", "crm", "intelligence");
const UI_ROOT = join(process.cwd(), "app", "(platform)", "crm");
const DOCS_ROOT = join(process.cwd(), "docs", "03_Architecture");

describe("P-008.5 Commercial Intelligence Certification", () => {
  it("ships commercial intelligence API routes", () => {
    const routes = [
      "kpis/route.ts",
      "forecasts/route.ts",
      "insights/route.ts",
      "recommendations/route.ts",
      "benchmarks/route.ts",
      "dashboard/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(API_ROOT, route))).toBe(true);
    }
  });

  it("ships analytics UI route", () => {
    expect(existsSync(join(UI_ROOT, "analytics/page.tsx"))).toBe(true);
  });

  it("includes analytics in CRM navigation", () => {
    expect(CRM_NAV.some((item) => item.href === "/crm/analytics")).toBe(true);
  });

  it("ships architecture documentation", () => {
    expect(existsSync(join(DOCS_ROOT, "P-008.5-Commercial-Intelligence-Platform.md"))).toBe(true);
    expect(existsSync(join(DOCS_ROOT, "P-008.5-Commercial-Intelligence-Certification.md"))).toBe(true);
  });

  it("meets P-008.5 acceptance criteria", () => {
    const dashboard = crmCommercialIntelligenceService.executive.getExecutiveDashboard(CONTEXT);
    expect(dashboard.kpis.length).toBeGreaterThanOrEqual(8);
    expect(dashboard.forecasts.length).toBe(4);
    expect(dashboard.insights.length).toBeGreaterThan(0);
    expect(dashboard.recommendations.length).toBeGreaterThan(0);
    expect(dashboard.relationshipHealth.length).toBeGreaterThan(0);
  });
});

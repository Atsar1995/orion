import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CRM_NAV, crmCustomerIntelligenceService } from "@/lib/crm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const API_ROOT = join(process.cwd(), "app", "api", "crm", "customer-intelligence");
const UI_ROOT = join(process.cwd(), "app", "(platform)", "crm");
const DOCS_ROOT = join(process.cwd(), "docs", "03_Architecture");

describe("P-008.6 Customer Analytics Certification", () => {
  it("ships customer intelligence API routes", () => {
    const routes = [
      "profiles/route.ts",
      "profiles/[id]/route.ts",
      "journey/route.ts",
      "segments/route.ts",
      "retention/route.ts",
      "growth/route.ts",
      "insights/route.ts",
      "dashboard/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(API_ROOT, route))).toBe(true);
    }
  });

  it("ships customer analytics UI routes", () => {
    expect(existsSync(join(UI_ROOT, "customer-analytics/page.tsx"))).toBe(true);
    expect(existsSync(join(UI_ROOT, "customer-analytics/[partyId]/page.tsx"))).toBe(true);
  });

  it("includes customer analytics in CRM navigation", () => {
    expect(CRM_NAV.some((item) => item.href === "/crm/customer-analytics")).toBe(true);
  });

  it("ships architecture documentation", () => {
    expect(existsSync(join(DOCS_ROOT, "P-008.6-Customer-Analytics-Platform.md"))).toBe(true);
    expect(existsSync(join(DOCS_ROOT, "P-008.6-Customer-Analytics-Certification.md"))).toBe(true);
  });

  it("meets P-008.6 acceptance criteria", () => {
    const dashboard = crmCustomerIntelligenceService.executive.getDashboard(CONTEXT);
    expect(dashboard.hub.profiles.length).toBeGreaterThan(0);
    expect(dashboard.segments.length).toBeGreaterThan(0);
    expect(dashboard.retention.length).toBeGreaterThan(0);
    expect(dashboard.growth.length).toBeGreaterThan(0);
    expect(dashboard.journeySummary.length).toBe(6);
  });
});

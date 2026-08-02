import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CRM_NAV, crmExecutiveDashboardService } from "@/lib/crm";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const API_ROOT = join(process.cwd(), "app", "api", "crm", "executive");
const UI_ROOT = join(process.cwd(), "app", "(platform)", "crm");
const ARCH_DOCS = join(process.cwd(), "docs", "03_Architecture");
const CERT_DOCS = join(process.cwd(), "docs", "11_Governance", "Certification");

describe("P-008.7 Commercial Executive Dashboard Certification", () => {
  it("ships executive dashboard API routes", () => {
    const routes = [
      "dashboard/route.ts",
      "kpis/route.ts",
      "alerts/route.ts",
      "widgets/route.ts",
      "reports/route.ts",
      "snapshots/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(API_ROOT, route))).toBe(true);
    }
  });

  it("ships executive dashboard UI route", () => {
    expect(existsSync(join(UI_ROOT, "executive/page.tsx"))).toBe(true);
  });

  it("includes executive dashboard in CRM navigation", () => {
    expect(CRM_NAV.some((item) => item.href === "/crm/executive")).toBe(true);
  });

  it("ships architecture documentation", () => {
    expect(existsSync(join(ARCH_DOCS, "P-008.7-CRM-Executive-Dashboard-Platform.md"))).toBe(true);
    expect(existsSync(join(CERT_DOCS, "P-008.7-CRM-Executive-Dashboard-Certification.md"))).toBe(true);
  });

  it("meets P-008.7 acceptance criteria", () => {
    const dashboard = crmExecutiveDashboardService.executive.getDashboard(CONTEXT);
    expect(dashboard.summary.pipelineValue).toBeTruthy();
    expect(dashboard.alerts.length).toBeGreaterThan(0);
    expect(dashboard.widgets.length).toBeGreaterThan(0);
    expect(dashboard.drillDowns.length).toBeGreaterThan(0);
    expect(dashboard.trends.length).toBeGreaterThan(0);
    expect(crmExecutiveDashboardService.executive.getReport(CONTEXT).sections.length).toBeGreaterThan(0);
  });
});

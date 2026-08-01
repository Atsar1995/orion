import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  financeExecutiveIntelligenceService,
  financeService,
  FINANCE_FOUNDATION_CAPABILITIES,
  FINANCE_MISSION_EXECUTIVE_INTELLIGENCE,
} from "@/lib/finance";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const API_ROOT = join(process.cwd(), "app", "api", "finance");

describe("P-009.7 Executive Financial Intelligence Certification", () => {
  it("ships Executive Financial Intelligence API routes", () => {
    const routes = [
      "intelligence/dashboard/route.ts",
      "intelligence/kpis/route.ts",
      "intelligence/alerts/route.ts",
      "intelligence/recommendations/route.ts",
      "intelligence/trends/route.ts",
      "intelligence/summary/route.ts",
      "intelligence/variance/route.ts",
    ];

    for (const route of routes) {
      expect(existsSync(join(API_ROOT, route))).toBe(true);
    }
  });

  it("implements read-only executive dashboard", () => {
    const dashboard = financeExecutiveIntelligenceService.getDashboard(CONTEXT);

    expect(dashboard.insights.length).toBeGreaterThan(0);
    expect(dashboard.forecasts.length).toBe(3);
    expect(dashboard.generatedAt).toBeTruthy();
  });

  it("marks executive_intelligence capability as active", () => {
    const capability = FINANCE_FOUNDATION_CAPABILITIES.find((cap) => cap.key === "executive_intelligence");
    expect(capability?.status).toBe("active");
    expect(capability?.mission).toBe("P-009.7");
  });

  it("certifies executive intelligence and finance certification readiness", () => {
    const status = financeService.getDomainStatus();
    const bootstrap = financeService.getWorkspaceBootstrap(CONTEXT);

    expect(status.executiveIntelligenceImplemented).toBe(true);
    expect(status.readyForCertification).toBe(true);
    expect(bootstrap.mission).toBe(FINANCE_MISSION_EXECUTIVE_INTELLIGENCE);
  });

  it("does not modify accounting records — analytics only", () => {
    const before = financeExecutiveIntelligenceService.getDashboard(CONTEXT, "period-2026-07");
    financeExecutiveIntelligenceService.getDashboard(CONTEXT, "period-2026-07");
    const trialBalance = financeService.generalLedger.getTrialBalance("period-2026-07", CONTEXT);

    expect(trialBalance.balanced).toBe(true);
    expect(before.profitability.revenue).toBe(trialBalance.lines
      .filter((line) => line.accountType === "revenue")
      .reduce((sum, line) => sum + line.creditTotal - line.debitTotal, 0));
  });
});

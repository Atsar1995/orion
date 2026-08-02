import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  financeFiscalPeriodService,
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

describe("P-009.5 Enterprise Fiscal Period Management Certification", () => {
  it("ships Fiscal Period API routes", () => {
    const routes = [
      "periods/calendar/route.ts",
      "periods/inquiry/route.ts",
      "periods/[id]/route.ts",
      "periods/[id]/open/route.ts",
      "periods/[id]/soft-close/route.ts",
      "periods/[id]/hard-close/route.ts",
      "periods/[id]/reopen/route.ts",
      "periods/years/[year]/close/route.ts",
    ];

    for (const route of routes) {
      expect(existsSync(join(API_ROOT, route))).toBe(true);
    }
  });

  it("implements all period lifecycle states", () => {
    const inquiry = financeFiscalPeriodService.inquiry({}, CONTEXT);
    const states = new Set(inquiry.periods.map((period) => period.state));

    expect(states.has("future")).toBe(true);
    expect(states.has("open")).toBe(true);
    expect(states.has("hard_closed")).toBe(true);
  });

  it("marks fiscal_period capability as active", () => {
    const capability = FINANCE_FOUNDATION_CAPABILITIES.find((cap) => cap.key === "fiscal_period");
    expect(capability?.status).toBe("active");
    expect(capability?.mission).toBe("P-009.5");
  });

  it("certifies fiscal period implementation and event pipeline readiness", () => {
    const status = financeService.getDomainStatus();
    const bootstrap = financeService.getWorkspaceBootstrap(CONTEXT);

    expect(status.fiscalPeriodImplemented).toBe(true);
    expect(status.readyForEventPipeline).toBe(true);
    expect(bootstrap.mission).toBe(FINANCE_MISSION_EXECUTIVE_INTELLIGENCE);
  });

  it("supports period inquiry with fiscal year filter", () => {
    const inquiry = financeFiscalPeriodService.inquiry({ fiscalYear: 2026 }, CONTEXT);
    expect(inquiry.periods.length).toBe(12);
    expect(inquiry.openPeriodCount).toBeGreaterThanOrEqual(1);
  });

  it("exposes period detail with posting flags", () => {
    const detail = financeFiscalPeriodService.getPeriod("period-2026-08", CONTEXT);
    expect(detail?.postingAllowed).toBe(true);
    expect(detail?.adjustmentAllowed).toBe(true);
    expect(detail?.reversalAllowed).toBe(true);
  });
});

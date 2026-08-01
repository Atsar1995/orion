import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  financeEventPipelineService,
  financeService,
  FINANCE_FOUNDATION_CAPABILITIES,
  FINANCE_MISSION_EVENT_PIPELINE,
} from "@/lib/finance";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const API_ROOT = join(process.cwd(), "app", "api", "finance");

describe("P-009.6 Enterprise Financial Event Pipeline Certification", () => {
  it("ships Financial Event Pipeline API routes", () => {
    const routes = [
      "events/pipeline/intake/route.ts",
      "events/pipeline/inquiry/route.ts",
      "events/pipeline/dead-letters/route.ts",
      "events/pipeline/registration/route.ts",
      "events/pipeline/[id]/route.ts",
    ];

    for (const route of routes) {
      expect(existsSync(join(API_ROOT, route))).toBe(true);
    }
  });

  it("implements pipeline as enterprise finance gateway", () => {
    const result = financeEventPipelineService.processIntake(
      {
        businessEventType: "ReservationConfirmed",
        sourceService: "hospitality-workspace",
        sourceEntityType: "reservation",
        sourceEntityId: "res-001",
        correlationId: "corr-cert-1",
        idempotencyKey: "idem-cert-res-1",
        periodId: "period-2026-08",
        currency: { transactionCurrency: "ZAR" },
      },
      CONTEXT,
    );

    expect(result.success).toBe(true);
    expect(result.financialEvent?.pipelineStage).toBe("processed");
  });

  it("marks event_pipeline capability as active", () => {
    const capability = FINANCE_FOUNDATION_CAPABILITIES.find((cap) => cap.key === "event_pipeline");
    expect(capability?.status).toBe("active");
    expect(capability?.mission).toBe("P-009.6");
  });

  it("certifies pipeline implementation and executive intelligence readiness", () => {
    const status = financeService.getDomainStatus();
    const bootstrap = financeService.getWorkspaceBootstrap(CONTEXT);

    expect(status.eventPipelineImplemented).toBe(true);
    expect(status.readyForExecutiveIntelligence).toBe(true);
    expect(bootstrap.mission).toBe(FINANCE_MISSION_EVENT_PIPELINE);
  });

  it("provides dead letter queue contracts", () => {
    const deadLetters = financeEventPipelineService.listDeadLetters(CONTEXT);
    expect(Array.isArray(deadLetters)).toBe(true);
  });
});

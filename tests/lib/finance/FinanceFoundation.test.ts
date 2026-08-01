import { describe, expect, it, beforeEach } from "vitest";
import {
  FINANCE_IIL_SERVICE_ID,
  financeService,
  financeValidationEngine,
  publishFinanceEvent,
  registerFinanceEventSubscriptions,
} from "@/lib/finance";
import { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { ServiceRegistry } from "@/lib/platform/intelligence/ServiceRegistry";
import { WebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
import { registerIntelligenceHandlers } from "@/lib/platform/intelligence/register-intelligence-handlers";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

describe("Finance validation framework (P-009.1)", () => {
  it("passes valid foundation input", () => {
    const result = financeValidationEngine.validate({
      context: CONTEXT,
      idempotencyKey: "evt-001",
      sourceEntityType: "contract",
      sourceEntityId: "contract-001",
      correlationId: "corr-001",
      currency: { transactionCurrency: "ZAR" },
      period: { periodId: "period-2026-07" },
    });

    expect(result.passed).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("rejects duplicate idempotency keys", () => {
    const input = {
      context: CONTEXT,
      idempotencyKey: "evt-dup",
      sourceEntityType: "contract",
      sourceEntityId: "contract-001",
    };

    financeValidationEngine.markIdempotent(input);
    const result = financeValidationEngine.validate(input);

    expect(result.passed).toBe(false);
    expect(result.issues.some((issue) => issue.code === "DUPLICATE_EVENT")).toBe(true);
  });

  it("rejects invalid currency codes", () => {
    const result = financeValidationEngine.validate({
      context: CONTEXT,
      idempotencyKey: "evt-currency",
      currency: { transactionCurrency: "INVALID" },
    });

    expect(result.passed).toBe(false);
    expect(result.issues.some((issue) => issue.stage === "currency")).toBe(true);
  });
});

describe("Finance IIL integration (P-009.1)", () => {
  let service: IntelligenceIntegrationService;

  beforeEach(() => {
    service = new IntelligenceIntegrationService({
      serviceRegistry: new ServiceRegistry(),
      webhookGateway: new WebhookGateway(),
    });
    registerIntelligenceHandlers(service);
  });

  it("registers finance-workspace as authorized publisher and subscriber", () => {
    const registry = new ServiceRegistry();
    const entry = registry.find(FINANCE_IIL_SERVICE_ID);

    expect(entry?.serviceId).toBe("finance-workspace");
    expect(entry?.canPublish).toBe(true);
    expect(entry?.canSubscribe).toBe(true);
  });

  it("publishes financial events through finance-workspace", () => {
    const event = publishFinanceEvent(
      {
        eventType: "FinancialKpiUpdated",
        entityType: "kpi",
        entityId: "kpi-cash",
      },
      CONTEXT,
    );

    expect(event.sourceService).toBe("finance-workspace");
    expect(event.payload.financeEvent).toBe("FinancialKpiUpdated");
  });

  it("registers finance business event subscriptions", () => {
    registerFinanceEventSubscriptions(service);
    expect(financeService.events.getSubscriptionCount()).toBeGreaterThan(0);
  });
});

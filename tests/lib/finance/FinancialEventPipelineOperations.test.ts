import { describe, expect, it } from "vitest";
import { financeEventPipelineService, financeService } from "@/lib/finance";
import type { ServiceContext } from "@/types/services";

const CONTEXT: ServiceContext = {
  organizationId: "org-orania",
  workspaceId: "workspace-orania",
  userId: "user-executive",
  role: "executive",
};

const BASE_INTAKE = {
  sourceService: "hospitality-workspace",
  sourceEntityType: "folio",
  sourceEntityId: "folio-001",
  correlationId: "corr-pipeline-1",
  periodId: "period-2026-07",
  currency: { transactionCurrency: "ZAR" },
} as const;

describe("Financial Event Pipeline operations (P-009.6)", () => {
  it("registers supported business event types", () => {
    const registration = financeEventPipelineService.getRegistration();

    expect(registration.businessEventTypes).toContain("SalesCompleted");
    expect(registration.businessEventTypes).toContain("PaymentReceived");
    expect(registration.businessEventTypes).toContain("PayrollApproved");
    expect(registration.policyRules.length).toBeGreaterThan(0);
  });

  it("processes sales completed through full pipeline", () => {
    const result = financeEventPipelineService.processIntake(
      {
        ...BASE_INTAKE,
        businessEventType: "SalesCompleted",
        idempotencyKey: "idem-sales-1",
      },
      CONTEXT,
    );

    expect(result.success).toBe(true);
    expect(result.financialEvent?.financialEventType).toBe("RevenueRecognized");
    expect(result.financialEvent?.classification).toBe("revenue");
    expect(result.financialEvent?.status).toBe("processed");
    expect(result.stage).toBe("processed");
  });

  it("processes payment received events", () => {
    const result = financeEventPipelineService.processIntake(
      {
        ...BASE_INTAKE,
        businessEventType: "PaymentReceived",
        idempotencyKey: "idem-payment-1",
        sourceService: "crm-workspace",
      },
      CONTEXT,
    );

    expect(result.success).toBe(true);
    expect(result.financialEvent?.financialEventType).toBe("PaymentReceived");
  });

  it("rejects duplicate idempotency keys", () => {
    financeEventPipelineService.processIntake(
      {
        ...BASE_INTAKE,
        businessEventType: "ExpenseApproved",
        idempotencyKey: "idem-dup-1",
      },
      CONTEXT,
    );

    const duplicate = financeEventPipelineService.processIntake(
      {
        ...BASE_INTAKE,
        businessEventType: "ExpenseApproved",
        idempotencyKey: "idem-dup-1",
      },
      CONTEXT,
    );

    expect(duplicate.success).toBe(false);
    expect(duplicate.errorCode).toMatch(/DUPLICATE/);
  });

  it("rejects unauthorized event sources", () => {
    const result = financeEventPipelineService.processIntake(
      {
        ...BASE_INTAKE,
        businessEventType: "ManualFinancialEvent",
        idempotencyKey: "idem-unauth-1",
        sourceService: "unknown-workspace",
      },
      CONTEXT,
    );

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe("AUTHORIZED_SOURCE");
  });

  it("rejects events for closed periods", () => {
    const result = financeEventPipelineService.processIntake(
      {
        ...BASE_INTAKE,
        businessEventType: "PayrollApproved",
        idempotencyKey: "idem-closed-period-1",
        periodId: "period-2026-06",
      },
      CONTEXT,
    );

    expect(result.success).toBe(false);
    expect(result.errorCode).toMatch(/PERIOD/);
  });

  it("records audit trail for processed events", () => {
    const result = financeEventPipelineService.processIntake(
      {
        ...BASE_INTAKE,
        businessEventType: "InventoryAdjustment",
        idempotencyKey: "idem-audit-1",
      },
      CONTEXT,
    );

    expect(result.financialEvent).toBeDefined();
    const audit = financeEventPipelineService.getAuditTrail(result.financialEvent!.id, CONTEXT);
    expect(audit.totalEntries).toBeGreaterThanOrEqual(4);
    expect(audit.entries.some((entry) => entry.stage === "processed")).toBe(true);
  });

  it("supports pipeline inquiry", () => {
    const inquiry = financeEventPipelineService.inquiry({}, CONTEXT);
    expect(inquiry.totalEvents).toBeGreaterThan(0);
  });

  it("marks domain ready for executive intelligence", () => {
    const status = financeService.getDomainStatus();
    expect(status.eventPipelineImplemented).toBe(true);
    expect(status.readyForExecutiveIntelligence).toBe(true);
    expect(status.readyForCertification).toBe(true);
  });
});

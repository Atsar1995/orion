import { beforeEach, describe, expect, it } from "vitest";
import { createFinanceWiring } from "@/lib/finance/createFinanceWiring";
import { registerFinanceEventSubscriptions } from "@/lib/finance/events/register-finance-subscribers";
import {
  FinanceEventConsumer,
  resetFinanceEventConsumerForTests,
  resetFinanceIntegrationForTests,
} from "@/lib/finance/integration";
import {
  setFinanceEventConsumer,
  setFinanceInboundProcessor,
} from "@/lib/finance/integration/financeIntegrationRegistry";
import { FINANCE_SEED_ORG_ID } from "@/lib/finance/persistence/createFinanceStore";
import { HCM_SEED_ORG_ID } from "@/lib/hcm/data/seed-hcm-time";
import { InMemoryHcmStore } from "@/lib/hcm/data/InMemoryHcmStore";
import {
  HCM_CANONICAL_EVENT_VERSION,
  buildHcmCanonicalIdempotencyKey,
  publishExpenseApproved,
  publishWorkforceCostRecorded,
} from "@/lib/hcm/events/HcmCanonicalFinancePublisher";
import { HCM_IIL_SERVICE_ID } from "@/lib/hcm/constants";
import { InMemoryExpenseRepository } from "@/lib/hcm/expense/repositories/InMemoryExpenseRepository";
import { ExpenseApprovalService } from "@/lib/hcm/expense/services/ExpenseApprovalService";
import {
  InMemoryPayrollRepository,
  InMemoryPayrollRunRepository,
} from "@/lib/hcm/payroll/repositories/InMemoryPayrollRepository";
import { PayrollService } from "@/lib/hcm/payroll/services/PayrollService";
import { createPayrollEntryId, createPayrollRunId } from "@/lib/hcm/common/ids";
import { nowIso } from "@/lib/hcm/common/time";
import { getIntelligenceIntegrationService, resetIntelligenceIntegrationForTests } from "@/lib/platform/intelligence";
import { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { ServiceRegistry } from "@/lib/platform/intelligence/ServiceRegistry";
import { WebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import type { PayrollEntryRecord, PayrollPeriodRecord, PayrollRunRecord } from "@/types/hcm-payroll";
import type { ServiceContext } from "@/types/services";

const ORG = FINANCE_SEED_ORG_ID;

const serviceContext: ServiceContext = {
  organizationId: ORG,
  userId: "user-hcm-publisher",
  workspaceId: "hcm",
  role: "organization_admin",
};

function createPayrollFixture(store: InMemoryHcmStore) {
  const payrollRepository = new InMemoryPayrollRepository(store);
  const runRepository = new InMemoryPayrollRunRepository(store);
  const payrollService = new PayrollService(payrollRepository, runRepository);

  const now = nowIso();
  const period: PayrollPeriodRecord = {
    id: "period-2026-07",
    organizationId: ORG,
    calendarId: "pcal-orania-monthly",
    periodCode: "2026-07",
    periodStart: "2026-07-01",
    periodEnd: "2026-07-31",
    payDate: "2026-07-31",
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
  payrollRepository.savePeriod(period);

  const run: PayrollRunRecord = {
    id: createPayrollRunId(),
    organizationId: ORG,
    periodId: period.id,
    runNumber: 1,
    status: "approved",
    currency: "ZAR",
    approvedAt: now,
    createdAt: now,
    updatedAt: now,
    createdBy: "user-hcm-publisher",
  };
  runRepository.create(run);

  const entries: PayrollEntryRecord[] = [
    {
      id: createPayrollEntryId(),
      organizationId: ORG,
      runId: run.id,
      employeeId: "emp-001",
      employmentId: "emp-001-employment",
      departmentId: "cc-hcm-001",
      lines: [],
      grossPay: { value: 5000, currency: "ZAR" },
      totalDeductions: { value: 0, currency: "ZAR" },
      netPay: { value: 5000, currency: "ZAR" },
      createdAt: now,
      updatedAt: now,
    },
    {
      id: createPayrollEntryId(),
      organizationId: ORG,
      runId: run.id,
      employeeId: "emp-002",
      employmentId: "emp-002-employment",
      departmentId: "cc-hcm-002",
      lines: [],
      grossPay: { value: 3200, currency: "ZAR" },
      totalDeductions: { value: 0, currency: "ZAR" },
      netPay: { value: 3200, currency: "ZAR" },
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const entry of entries) {
    runRepository.saveEntry(entry);
  }

  return { payrollService, run, period, entries };
}

function createIntegrationStack() {
  const platformStore = new InMemoryPlatformStore();
  const wiring = createFinanceWiring(platformStore);
  const consumer = new FinanceEventConsumer(wiring.financeInboundProcessor);
  setFinanceInboundProcessor(wiring.financeInboundProcessor);
  setFinanceEventConsumer(consumer);

  const iil = new IntelligenceIntegrationService({
    serviceRegistry: new ServiceRegistry(),
    webhookGateway: new WebhookGateway(),
  });
  registerFinanceEventSubscriptions(iil);

  return { platformStore, wiring, consumer, iil };
}

describe("HCMCanonicalPublisher (P-009.15)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetFinanceIntegrationForTests();
    resetFinanceEventConsumerForTests();
    resetIntelligenceIntegrationForTests();
  });

  it("publishes native hcm.workforce.cost.recorded with ADR-014 envelope fields", () => {
    const event = publishWorkforceCostRecorded(
      {
        employeeId: "emp-001",
        costPeriodId: "period-2026-07",
        amount: { value: 5000, currency: "ZAR" },
        costCentreId: "cc-hcm-001",
        correlationId: "run-native-001",
      },
      serviceContext,
    );

    expect(event.eventId).toBeTruthy();
    expect(event.correlationId).toBe("run-native-001");
    expect(event.organizationId).toBe(ORG);
    expect(event.payload.canonicalEventType).toBe("hcm.workforce.cost.recorded");
    expect(event.payload.eventVersion).toBe(HCM_CANONICAL_EVENT_VERSION);
    expect(event.payload.sourceDomain).toBe("hcm");
    expect(event.payload.idempotencyKey).toBe(
      buildHcmCanonicalIdempotencyKey(ORG, "hcm.workforce.cost.recorded", {
        employeeId: "emp-001",
        costPeriodId: "period-2026-07",
      }),
    );
    expect(event.sourceService).toBe(HCM_IIL_SERVICE_ID);
    expect(event.auditMetadata.sourceDomain).toBe("hcm");
  });

  it("preserves legacy PayrollFinalized alongside canonical workforce cost events", () => {
    const store = new InMemoryHcmStore();
    const { payrollService, run } = createPayrollFixture(store);

    payrollService.finalize(run.id, serviceContext);

    const recent = getIntelligenceIntegrationService().listEvents(serviceContext, 100);
    const runEvents = recent.filter((entry) => entry.correlationId === run.id);

    expect(runEvents.some((entry) => entry.payload.hcmEventType === "PayrollFinalized")).toBe(true);
    expect(
      runEvents.filter((entry) => entry.payload.canonicalEventType === "hcm.workforce.cost.recorded"),
    ).toHaveLength(2);
  });

  it("finalizes payroll and publishes one canonical event per employee entry", () => {
    const store = new InMemoryHcmStore();
    const { payrollService, run } = createPayrollFixture(store);

    payrollService.finalize(run.id, serviceContext);

    const canonical = getIntelligenceIntegrationService()
      .listEvents(serviceContext, 50)
      .filter(
        (entry) =>
          entry.correlationId === run.id &&
          entry.payload.canonicalEventType === "hcm.workforce.cost.recorded",
      );

    expect(canonical).toHaveLength(2);
    expect(canonical.map((entry) => entry.payload.employeeId).sort()).toEqual(["emp-001", "emp-002"]);
  });

  it("approves expense and publishes hcm.expense.approved", () => {
    const store = new InMemoryHcmStore();
    const expenseRepository = new InMemoryExpenseRepository(store);
    const expenseApproval = new ExpenseApprovalService(expenseRepository);

    const expense = expenseRepository.create(
      {
        employeeId: "emp-001",
        amount: { value: 1200, currency: "ZAR" },
        costCentreId: "cc-hcm-001",
        costPeriodId: "period-2026-07",
      },
      ORG,
      "user-hcm-publisher",
    );

    expenseApproval.approve({ expenseId: expense.id }, serviceContext);

    const published = getIntelligenceIntegrationService()
      .listEvents(serviceContext, 20)
      .find((entry) => entry.payload.canonicalEventType === "hcm.expense.approved");

    expect(published).toBeTruthy();
    expect(published?.payload.expenseId).toBe(expense.id);
    expect(published?.payload.amount).toBe("1200");
    expect(published?.payload.hcmEventType).toBe("ExpenseApproved");
  });

  it("short-circuits duplicate finance processing for repeated canonical delivery", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();

    const event = publishWorkforceCostRecorded(
      {
        employeeId: "emp-dup-001",
        costPeriodId: "period-2026-07",
        amount: { value: 5000, currency: "ZAR" },
        correlationId: "corr-dup-001",
      },
      serviceContext,
    );

    const first = await consumer.consume(event, serviceContext);
    const second = await consumer.consume(
      { ...event, eventId: "evt-dup-second" },
      serviceContext,
    );

    expect(first.status).toBe("processed");
    expect(second.status).toBe("duplicate");
    expect(wiring.generalLedger.getEntries(ORG, { journalId: first.journalId! })).toHaveLength(2);
  });

  it("isolates organization context on native publication", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();

    const event = publishWorkforceCostRecorded(
      {
        employeeId: "emp-org-001",
        costPeriodId: "period-2026-07",
        amount: { value: 5000, currency: "ZAR" },
        correlationId: "corr-org-001",
      },
      { ...serviceContext, organizationId: "org-other" },
    );

    const result = await consumer.consume(event, serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("ORGANIZATION_MISMATCH");
    expect(wiring.generalLedger.getEntries(ORG)).toHaveLength(0);
  });

  it("validates canonical envelope fields required by FinanceEventConsumer", async () => {
    const { consumer } = createIntegrationStack();

    const event = publishExpenseApproved(
      {
        expenseId: "expense-env-001",
        employeeId: "emp-001",
        amount: { value: 900, currency: "ZAR" },
        costPeriodId: "period-2026-07",
        correlationId: "corr-env-001",
      },
      serviceContext,
    );

    const stripped = {
      ...event,
      payload: { ...event.payload, amount: "0" },
    };

    const result = await consumer.consume(stripped, serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("AMOUNT_REQUIRED");
  });

  it("registers through IIL and processes published HCM canonical events", async () => {
    const platformStore = new InMemoryPlatformStore();
    await platformStore.initialize();
    const wiring = createFinanceWiring(platformStore);
    setFinanceInboundProcessor(wiring.financeInboundProcessor);
    setFinanceEventConsumer(new FinanceEventConsumer(wiring.financeInboundProcessor));

    const iil = new IntelligenceIntegrationService({
      serviceRegistry: new ServiceRegistry(),
      webhookGateway: new WebhookGateway(),
    });
    registerFinanceEventSubscriptions(iil);

    iil.publish(
      {
        eventType: "CustomEvent",
        sourceService: HCM_IIL_SERVICE_ID,
        sourceWorkspace: "HCM",
        entityType: "employee",
        entityId: "emp-iil-native",
        actorId: "user-hcm-publisher",
        correlationId: "corr-iil-native",
        payload: {
          canonicalEventType: "hcm.workforce.cost.recorded",
          eventVersion: "1",
          sourceDomain: "hcm",
          employeeId: "emp-iil-native",
          costPeriodId: "period-2026-07",
          amount: "4500",
          currencyCode: "ZAR",
          idempotencyKey: `${ORG}:${HCM_IIL_SERVICE_ID}:hcm.workforce.cost.recorded:emp-iil-native:period-2026-07`,
        },
        auditMetadata: { sourceDomain: "hcm" },
      },
      serviceContext,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    const posted = wiring.journalRepository.listByOrganization(ORG).filter((entry) => entry.status === "posted");
    expect(posted.length).toBeGreaterThan(0);
  });

  it("does not publish canonical workforce events for foreign organization payroll runs", () => {
    const store = new InMemoryHcmStore();
    const { payrollService, run } = createPayrollFixture(store);

    expect(HCM_SEED_ORG_ID).toBe(ORG);

    expect(() =>
      payrollService.finalize(run.id, { ...serviceContext, organizationId: "org-foreign" }),
    ).toThrow("PAYROLL_RUN_NOT_FOUND");

    const canonical = getIntelligenceIntegrationService()
      .listEvents({ ...serviceContext, organizationId: "org-foreign" }, 20)
      .filter((entry) => entry.payload.canonicalEventType === "hcm.workforce.cost.recorded");

    expect(canonical).toHaveLength(0);
  });
});

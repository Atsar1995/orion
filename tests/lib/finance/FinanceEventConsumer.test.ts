import { beforeEach, describe, expect, it } from "vitest";
import { createFinanceWiring } from "@/lib/finance/createFinanceWiring";
import { FINANCE_SEED_ORG_ID } from "@/lib/finance/persistence/createFinanceStore";
import {
  FinanceEventConsumer,
  resetFinanceEventConsumerForTests,
  resetFinanceIntegrationForTests,
} from "@/lib/finance/integration";
import {
  setFinanceEventConsumer,
  setFinanceInboundProcessor,
} from "@/lib/finance/integration/financeIntegrationRegistry";
import { registerFinanceEventSubscriptions } from "@/lib/finance/events/register-finance-subscribers";
import { HCM_IIL_SERVICE_ID } from "@/lib/hcm/constants";
import { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { ServiceRegistry } from "@/lib/platform/intelligence/ServiceRegistry";
import { WebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { PostgresPlatformStore } from "@/lib/platform/store/PostgresPlatformStore";
import { StoreProvider } from "@/lib/platform/store/StoreConfiguration";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

const ORG = FINANCE_SEED_ORG_ID;

const serviceContext: ServiceContext = {
  organizationId: ORG,
  userId: "user-hcm-finance",
  workspaceId: "finance",
  role: "organization_admin",
};

function buildWorkforceCostEvent(
  eventId = "evt-hcm-cost-001",
  overrides: Partial<IntelligenceEvent["payload"]> = {},
): IntelligenceEvent {
  return {
    eventId,
    eventType: "CustomEvent",
    sourceService: HCM_IIL_SERVICE_ID,
    sourceWorkspace: "HCM",
    organizationId: ORG,
    entityType: "employee",
    entityId: "emp-001",
    timestamp: "2026-07-15T10:00:00.000Z",
    actorId: "user-hcm-finance",
    priority: "normal",
    correlationId: "corr-hcm-cost-001",
    payload: {
      canonicalEventType: "hcm.workforce.cost.recorded",
      eventVersion: "1",
      sourceDomain: "hcm",
      employeeId: "emp-001",
      costPeriodId: "period-2026-07",
      amount: "5000",
      currencyCode: "ZAR",
      costCentreId: "cc-hcm-001",
      idempotencyKey: `${ORG}:${HCM_IIL_SERVICE_ID}:hcm.workforce.cost.recorded:emp-001:period-2026-07`,
      ...overrides,
    },
    version: "1",
    securityClassification: "internal",
    auditMetadata: { sourceDomain: "hcm" },
  };
}

function buildExpenseApprovedEvent(
  eventId = "evt-hcm-expense-001",
  overrides: Partial<IntelligenceEvent["payload"]> = {},
): IntelligenceEvent {
  return {
    eventId,
    eventType: "CustomEvent",
    sourceService: HCM_IIL_SERVICE_ID,
    sourceWorkspace: "HCM",
    organizationId: ORG,
    entityType: "expense",
    entityId: "expense-001",
    timestamp: "2026-07-16T10:00:00.000Z",
    actorId: "user-hcm-finance",
    priority: "normal",
    correlationId: "corr-hcm-expense-001",
    payload: {
      canonicalEventType: "hcm.expense.approved",
      eventVersion: "1",
      sourceDomain: "hcm",
      expenseId: "expense-001",
      employeeId: "emp-001",
      costPeriodId: "period-2026-07",
      amount: "1200",
      currencyCode: "ZAR",
      costCentreId: "cc-hcm-001",
      approvalReference: "appr-expense-001",
      idempotencyKey: `${ORG}:${HCM_IIL_SERVICE_ID}:hcm.expense.approved:expense-001:1`,
      ...overrides,
    },
    version: "1",
    securityClassification: "internal",
    auditMetadata: { sourceDomain: "hcm" },
  };
}

function createIntegrationStack() {
  const platformStore = new InMemoryPlatformStore();
  const wiring = createFinanceWiring(platformStore);
  const consumer = new FinanceEventConsumer(wiring.financeInboundProcessor);
  setFinanceInboundProcessor(wiring.financeInboundProcessor);
  setFinanceEventConsumer(consumer);
  return { platformStore, wiring, consumer };
}

describe("FinanceEventConsumer (P-009.9)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetFinanceIntegrationForTests();
    resetFinanceEventConsumerForTests();
  });

  it("processes hcm.workforce.cost.recorded through posting and ledger mutation", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();

    const result = await consumer.consume(buildWorkforceCostEvent(), serviceContext);

    expect(result.status).toBe("processed");
    expect(result.journalId).toBeTruthy();
    expect(wiring.journalRepository.getById(ORG, result.journalId!)?.status).toBe("posted");
    expect(wiring.generalLedger.getEntries(ORG, { journalId: result.journalId! })).toHaveLength(2);
  });

  it("processes hcm.expense.approved through posting and ledger mutation", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();

    const result = await consumer.consume(buildExpenseApprovedEvent(), serviceContext);

    expect(result.status).toBe("processed");
    expect(result.journalId).toBeTruthy();
    expect(wiring.journalRepository.getById(ORG, result.journalId!)?.status).toBe("posted");
    expect(wiring.generalLedger.getAccountBalance(ORG, "coa-2100", "period-2026-07")?.periodCredit).toBe(
      1200,
    );
  });

  it("short-circuits duplicate delivery without duplicate ledger entries", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();
    const event = buildWorkforceCostEvent("evt-hcm-cost-dup");

    const first = await consumer.consume(event, serviceContext);
    const second = await consumer.consume(event, serviceContext);

    expect(first.status).toBe("processed");
    expect(second.status).toBe("duplicate");
    expect(wiring.generalLedger.getEntries(ORG, { journalId: first.journalId! })).toHaveLength(2);
  });

  it("rejects unsupported canonical event types", async () => {
    const { consumer } = createIntegrationStack();
    const event = buildWorkforceCostEvent("evt-hcm-unsupported", {
      canonicalEventType: "hcm.leave.approved",
    });

    const result = await consumer.consume(event, serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("UNSUPPORTED_EVENT");
  });

  it("rejects version mismatch", async () => {
    const { consumer } = createIntegrationStack();
    const event = buildWorkforceCostEvent("evt-hcm-version", { eventVersion: "2" });

    const result = await consumer.consume(event, serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("VERSION_MISMATCH");
  });

  it("rejects organization mismatch without ledger mutation", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();
    const event = {
      ...buildWorkforceCostEvent("evt-hcm-org"),
      organizationId: "org-other",
    };

    const result = await consumer.consume(event, {
      ...serviceContext,
      organizationId: ORG,
    });

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("ORGANIZATION_MISMATCH");
    expect(wiring.generalLedger.getEntries(ORG)).toHaveLength(0);
  });

  it("rolls back when contract validation fails", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();
    const event = buildWorkforceCostEvent("evt-hcm-fail", { amount: "0" });

    const result = await consumer.consume(event, serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("AMOUNT_REQUIRED");
    expect(wiring.journalRepository.listByOrganization(ORG)).toHaveLength(0);
  });

  it("registers through IIL and processes published HCM events", async () => {
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
        entityId: "emp-iil-001",
        actorId: "user-hcm-finance",
        correlationId: "corr-iil-hcm",
        payload: buildWorkforceCostEvent("evt-iil-hcm", {
          employeeId: "emp-iil-001",
          idempotencyKey: `${ORG}:${HCM_IIL_SERVICE_ID}:hcm.workforce.cost.recorded:emp-iil-001:period-2026-07`,
        }).payload,
      },
      serviceContext,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    const posted = wiring.journalRepository.listByOrganization(ORG).filter((entry) => entry.status === "posted");
    expect(posted.length).toBeGreaterThan(0);
  });
});

describe("FinanceEventConsumer PostgreSQL persistence (P-009.9)", () => {
  it("survives restart with posted journal and duplicate short-circuit", async () => {
    const connection = new MockDatabaseConnection();
    const migrationRunner = new MigrationRunner(
      connection,
      new MigrationRegistry([bootstrapMigration]),
    );

    const store = new PostgresPlatformStore({
      configuration: {
        provider: StoreProvider.PostgreSQL,
        databaseUrl: "postgresql://mock:5432/orion",
        migrationReady: true,
      },
      connection,
      migrationRunner,
    });

    await store.initialize();
    const wiring = createFinanceWiring(store);
    const consumer = new FinanceEventConsumer(wiring.financeInboundProcessor);
    const event = buildWorkforceCostEvent("evt-hcm-pg-restart");

    const first = await consumer.consume(event, serviceContext);
    expect(first.status).toBe("processed");
    await store.shutdown();

    const restarted = new PostgresPlatformStore({
      configuration: {
        provider: StoreProvider.PostgreSQL,
        databaseUrl: "postgresql://mock:5432/orion",
        migrationReady: true,
      },
      connection,
      migrationRunner,
    });
    await restarted.initialize();
    const rewired = createFinanceWiring(restarted);
    const restartedConsumer = new FinanceEventConsumer(rewired.financeInboundProcessor);

    expect(rewired.journalRepository.getById(ORG, first.journalId!)?.status).toBe("posted");

    const duplicate = await restartedConsumer.consume(event, serviceContext);
    expect(duplicate.status).toBe("duplicate");

    await restarted.shutdown();
  });
});

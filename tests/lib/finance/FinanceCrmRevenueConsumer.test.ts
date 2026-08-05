import { beforeEach, describe, expect, it } from "vitest";
import { CRM_IIL_SERVICE_ID } from "@/lib/crm/constants";
import { createFinanceWiring } from "@/lib/finance/createFinanceWiring";
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
import { FINANCE_SEED_ORG_ID } from "@/lib/finance/persistence/createFinanceStore";
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
  userId: "user-crm-finance",
  workspaceId: "finance",
  role: "organization_admin",
};

function buildRevenueRecognizedEvent(
  eventId = "evt-crm-revenue-001",
  overrides: Partial<IntelligenceEvent["payload"]> = {},
): IntelligenceEvent {
  const salesOrderId = overrides.salesOrderId ?? "so-001";
  return {
    eventId,
    eventType: "CustomEvent",
    sourceService: CRM_IIL_SERVICE_ID,
    sourceWorkspace: "Customer Intelligence",
    organizationId: ORG,
    entityType: "revenue",
    entityId: salesOrderId,
    timestamp: "2026-07-20T10:00:00.000Z",
    actorId: "user-crm-finance",
    priority: "normal",
    correlationId: "corr-crm-revenue-001",
    payload: {
      canonicalEventType: "crm.revenue.recognized",
      eventVersion: "1",
      sourceDomain: "crm",
      salesOrderId,
      amount: "5000",
      currencyCode: "ZAR",
      period: "period-2026-07",
      idempotencyKey: `${ORG}:${CRM_IIL_SERVICE_ID}:crm-revenue-${salesOrderId}-recognized-v1`,
      causationId: "cause-so-confirmed-001",
      ...overrides,
    },
    version: "1",
    securityClassification: "internal",
    auditMetadata: { sourceDomain: "crm" },
  };
}

function buildSalesOrderConfirmedEvent(
  eventId = "evt-crm-so-001",
  overrides: Partial<IntelligenceEvent["payload"]> = {},
): IntelligenceEvent {
  const salesOrderId = overrides.salesOrderId ?? "so-002";
  return {
    eventId,
    eventType: "CustomEvent",
    sourceService: CRM_IIL_SERVICE_ID,
    sourceWorkspace: "Customer Intelligence",
    organizationId: ORG,
    entityType: "salesorder",
    entityId: salesOrderId,
    timestamp: "2026-07-19T10:00:00.000Z",
    actorId: "user-crm-finance",
    priority: "normal",
    correlationId: "corr-crm-so-001",
    payload: {
      canonicalEventType: "crm.salesorder.confirmed",
      eventVersion: "1",
      sourceDomain: "crm",
      salesOrderId,
      quoteId: "quote-001",
      amount: "5000",
      currencyCode: "ZAR",
      idempotencyKey: `${ORG}:${CRM_IIL_SERVICE_ID}:crm-salesorder-${salesOrderId}-confirmed-v1`,
      causationId: "cause-quote-accepted-001",
      ...overrides,
    },
    version: "1",
    securityClassification: "internal",
    auditMetadata: { sourceDomain: "crm" },
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

describe("FinanceCrmRevenueConsumer (P-009.19)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetFinanceIntegrationForTests();
    resetFinanceEventConsumerForTests();
  });

  it("processes crm.revenue.recognized through posting and ledger mutation", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();

    const result = await consumer.consumeCrm(buildRevenueRecognizedEvent(), serviceContext);

    expect(result.status).toBe("processed");
    expect(result.journalId).toBeTruthy();
    expect(wiring.journalRepository.getById(ORG, result.journalId!)?.status).toBe("posted");
    expect(wiring.generalLedger.getEntries(ORG, { journalId: result.journalId! })).toHaveLength(2);
    expect(
      wiring.generalLedger.getAccountBalance(ORG, "coa-4200", "period-2026-07")?.periodCredit,
    ).toBe(5000);
  });

  it("processes crm.salesorder.confirmed through posting and ledger mutation", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();

    const result = await consumer.consumeCrm(buildSalesOrderConfirmedEvent(), serviceContext);

    expect(result.status).toBe("processed");
    expect(result.journalId).toBeTruthy();
    expect(wiring.journalRepository.getById(ORG, result.journalId!)?.status).toBe("posted");
    expect(wiring.generalLedger.getEntries(ORG, { journalId: result.journalId! })).toHaveLength(2);
  });

  it("short-circuits duplicate delivery without duplicate ledger entries", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();
    const event = buildRevenueRecognizedEvent("evt-crm-revenue-dup");

    const first = await consumer.consumeCrm(event, serviceContext);
    const second = await consumer.consumeCrm(event, serviceContext);

    expect(first.status).toBe("processed");
    expect(second.status).toBe("duplicate");
    expect(wiring.generalLedger.getEntries(ORG, { journalId: first.journalId! })).toHaveLength(2);
  });

  it("rejects unsupported crm.* canonical event types gracefully", async () => {
    const { consumer } = createIntegrationStack();
    const event: IntelligenceEvent = {
      ...buildRevenueRecognizedEvent("evt-crm-unsupported", {
        canonicalEventType: "crm.lead.created",
        idempotencyKey: `${ORG}:${CRM_IIL_SERVICE_ID}:crm-lead-lead-001-created-v1`,
      }),
      entityType: "lead",
      entityId: "lead-001",
    };

    const result = await consumer.consumeCrm(event, serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("UNSUPPORTED_EVENT");
  });

  it("rejects version mismatch", async () => {
    const { consumer } = createIntegrationStack();
    const event = buildRevenueRecognizedEvent("evt-crm-version", { eventVersion: "2" });

    const result = await consumer.consumeCrm(event, serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("VERSION_MISMATCH");
  });

  it("rejects organization mismatch without ledger mutation", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();
    const event = {
      ...buildRevenueRecognizedEvent("evt-crm-org"),
      organizationId: "org-other",
    };

    const result = await consumer.consumeCrm(event, {
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
    const event = buildRevenueRecognizedEvent("evt-crm-fail", { amount: "0" });

    const result = await consumer.consumeCrm(event, serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("AMOUNT_REQUIRED");
    expect(wiring.journalRepository.listByOrganization(ORG)).toHaveLength(0);
  });

  it("rejects invalid envelopes missing idempotency key", async () => {
    const { consumer } = createIntegrationStack();
    const event = buildRevenueRecognizedEvent("evt-crm-no-idem", { idempotencyKey: "" });

    const result = await consumer.consumeCrm(event, serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("IDEMPOTENCY_KEY_REQUIRED");
  });

  it("registers through IIL and processes published CRM events", async () => {
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
        sourceService: CRM_IIL_SERVICE_ID,
        sourceWorkspace: "Customer Intelligence",
        entityType: "revenue",
        entityId: "so-iil-001",
        actorId: "user-crm-finance",
        correlationId: "corr-iil-crm",
        payload: buildRevenueRecognizedEvent("evt-iil-crm", {
          salesOrderId: "so-iil-001",
        }).payload,
      },
      serviceContext,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    const posted = wiring.journalRepository.listByOrganization(ORG).filter((entry) => entry.status === "posted");
    expect(posted.length).toBeGreaterThan(0);
  });
});

describe("FinanceCrmRevenueConsumer PostgreSQL persistence (P-009.19)", () => {
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
    const event = buildRevenueRecognizedEvent("evt-crm-pg-restart");

    const first = await consumer.consumeCrm(event, serviceContext);
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

    const duplicate = await restartedConsumer.consumeCrm(event, serviceContext);
    expect(duplicate.status).toBe("duplicate");

    await restarted.shutdown();
  });
});

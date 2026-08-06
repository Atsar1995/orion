import { beforeEach, describe, expect, it } from "vitest";
import { PROCUREMENT_IIL_SERVICE_ID } from "@/lib/procurement/constants";
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
  userId: "user-proc-finance",
  workspaceId: "finance",
  role: "organization_admin",
};

function buildInvoiceApprovedEvent(
  eventId = "evt-proc-inv-001",
  overrides: Partial<IntelligenceEvent["payload"]> = {},
): IntelligenceEvent {
  const invoiceId = overrides.invoiceId ?? "inv-001";
  return {
    eventId,
    eventType: "CustomEvent",
    sourceService: PROCUREMENT_IIL_SERVICE_ID,
    sourceWorkspace: "Source to Pay",
    organizationId: ORG,
    entityType: "invoice",
    entityId: invoiceId,
    timestamp: "2026-07-21T10:00:00.000Z",
    actorId: "user-proc-finance",
    priority: "normal",
    correlationId: "corr-proc-inv-001",
    payload: {
      canonicalEventType: "procurement.invoice.approved",
      eventVersion: "1",
      sourceDomain: "procurement",
      invoiceId,
      vendorId: "vendor-001",
      purchaseOrderId: "po-001",
      amount: "5000",
      currencyCode: "ZAR",
      period: "period-2026-07",
      approvedBy: "user-approver",
      idempotencyKey: `${ORG}:${PROCUREMENT_IIL_SERVICE_ID}:procurement-invoice-${invoiceId}-approved-v1`,
      ...overrides,
    },
    version: "1",
    securityClassification: "internal",
    auditMetadata: { sourceDomain: "procurement" },
  };
}

function buildPurchaseOrderApprovedEvent(
  eventId = "evt-proc-po-001",
  overrides: Partial<IntelligenceEvent["payload"]> = {},
): IntelligenceEvent {
  const purchaseOrderId = overrides.purchaseOrderId ?? "po-002";
  return {
    eventId,
    eventType: "CustomEvent",
    sourceService: PROCUREMENT_IIL_SERVICE_ID,
    sourceWorkspace: "Source to Pay",
    organizationId: ORG,
    entityType: "purchaseorder",
    entityId: purchaseOrderId,
    timestamp: "2026-07-20T10:00:00.000Z",
    actorId: "user-proc-finance",
    priority: "normal",
    correlationId: "corr-proc-po-001",
    payload: {
      canonicalEventType: "procurement.purchaseorder.approved",
      eventVersion: "1",
      sourceDomain: "procurement",
      purchaseOrderId,
      vendorId: "vendor-001",
      amount: "5000",
      currencyCode: "ZAR",
      period: "period-2026-07",
      approvedBy: "user-director",
      idempotencyKey: `${ORG}:${PROCUREMENT_IIL_SERVICE_ID}:procurement-purchaseorder-${purchaseOrderId}-approved-v1`,
      ...overrides,
    },
    version: "1",
    securityClassification: "internal",
    auditMetadata: { sourceDomain: "procurement" },
  };
}

function buildGoodsReceivedEvent(
  eventId = "evt-proc-gr-001",
  overrides: Partial<IntelligenceEvent["payload"]> = {},
): IntelligenceEvent {
  const goodsReceiptId = overrides.goodsReceiptId ?? "gr-001";
  return {
    eventId,
    eventType: "CustomEvent",
    sourceService: PROCUREMENT_IIL_SERVICE_ID,
    sourceWorkspace: "Source to Pay",
    organizationId: ORG,
    entityType: "goodsreceipt",
    entityId: goodsReceiptId,
    timestamp: "2026-07-19T10:00:00.000Z",
    actorId: "user-proc-finance",
    priority: "normal",
    correlationId: "corr-proc-gr-001",
    payload: {
      canonicalEventType: "procurement.goods.received",
      eventVersion: "1",
      sourceDomain: "procurement",
      goodsReceiptId,
      purchaseOrderId: "po-001",
      idempotencyKey: `${ORG}:${PROCUREMENT_IIL_SERVICE_ID}:procurement-goods-${goodsReceiptId}-received-v1`,
      ...overrides,
    },
    version: "1",
    securityClassification: "internal",
    auditMetadata: { sourceDomain: "procurement" },
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

describe("FinanceProcurementApConsumer (P-010.19)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetFinanceIntegrationForTests();
    resetFinanceEventConsumerForTests();
  });

  it("processes procurement.invoice.approved through posting and ledger mutation", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();

    const result = await consumer.consumeProcurement(buildInvoiceApprovedEvent(), serviceContext);

    expect(result.status).toBe("processed");
    expect(result.journalId).toBeTruthy();
    expect(wiring.journalRepository.getById(ORG, result.journalId!)?.status).toBe("posted");
    expect(wiring.generalLedger.getEntries(ORG, { journalId: result.journalId! })).toHaveLength(2);
    expect(
      wiring.generalLedger.getAccountBalance(ORG, "coa-2100", "period-2026-07")?.periodCredit,
    ).toBe(5000);
  });

  it("processes procurement.purchaseorder.approved through posting and ledger mutation", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();

    const result = await consumer.consumeProcurement(
      buildPurchaseOrderApprovedEvent(),
      serviceContext,
    );

    expect(result.status).toBe("processed");
    expect(result.journalId).toBeTruthy();
    expect(wiring.generalLedger.getEntries(ORG, { journalId: result.journalId! })).toHaveLength(2);
  });

  it("accepts procurement.goods.received envelope but returns NOT_IMPLEMENTED mapping", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();

    const result = await consumer.consumeProcurement(buildGoodsReceivedEvent(), serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("NOT_IMPLEMENTED");
    expect(wiring.journalRepository.listByOrganization(ORG)).toHaveLength(0);
  });

  it("short-circuits duplicate delivery without duplicate ledger entries", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();
    const event = buildInvoiceApprovedEvent("evt-proc-inv-dup");

    const first = await consumer.consumeProcurement(event, serviceContext);
    const second = await consumer.consumeProcurement(event, serviceContext);

    expect(first.status).toBe("processed");
    expect(second.status).toBe("duplicate");
    expect(wiring.generalLedger.getEntries(ORG, { journalId: first.journalId! })).toHaveLength(2);
  });

  it("rejects unsupported procurement.* canonical event types gracefully", async () => {
    const { consumer } = createIntegrationStack();
    const event: IntelligenceEvent = {
      ...buildInvoiceApprovedEvent("evt-proc-unsupported", {
        canonicalEventType: "procurement.vendor.created",
        idempotencyKey: `${ORG}:${PROCUREMENT_IIL_SERVICE_ID}:procurement-vendor-vendor-001-created-v1`,
      }),
      entityType: "vendor",
      entityId: "vendor-001",
    };

    const result = await consumer.consumeProcurement(event, serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("UNSUPPORTED_EVENT");
  });

  it("rejects version mismatch", async () => {
    const { consumer } = createIntegrationStack();
    const event = buildInvoiceApprovedEvent("evt-proc-version", { eventVersion: "2" });

    const result = await consumer.consumeProcurement(event, serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("VERSION_MISMATCH");
  });

  it("rejects organization mismatch without ledger mutation", async () => {
    const { wiring, consumer } = createIntegrationStack();
    await wiring.platformStore.initialize();
    const event = {
      ...buildInvoiceApprovedEvent("evt-proc-org"),
      organizationId: "org-other",
    };

    const result = await consumer.consumeProcurement(event, {
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
    const event = buildInvoiceApprovedEvent("evt-proc-fail", { amount: "0" });

    const result = await consumer.consumeProcurement(event, serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("AMOUNT_REQUIRED");
    expect(wiring.journalRepository.listByOrganization(ORG)).toHaveLength(0);
  });

  it("rejects invalid envelopes missing idempotency key", async () => {
    const { consumer } = createIntegrationStack();
    const event = buildInvoiceApprovedEvent("evt-proc-no-idem", { idempotencyKey: "" });

    const result = await consumer.consumeProcurement(event, serviceContext);

    expect(result.status).toBe("rejected");
    expect(result.code).toBe("INVALID_ENVELOPE");
  });

  it("registers through IIL and processes published Procurement events", async () => {
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
        sourceService: PROCUREMENT_IIL_SERVICE_ID,
        sourceWorkspace: "Source to Pay",
        entityType: "invoice",
        entityId: "inv-iil-001",
        actorId: "user-proc-finance",
        correlationId: "corr-iil-proc",
        payload: buildInvoiceApprovedEvent("evt-iil-proc", {
          invoiceId: "inv-iil-001",
        }).payload,
      },
      serviceContext,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    const posted = wiring.journalRepository
      .listByOrganization(ORG)
      .filter((entry) => entry.status === "posted");
    expect(posted.length).toBeGreaterThan(0);
  });
});

describe("FinanceProcurementApConsumer PostgreSQL persistence (P-010.19)", () => {
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
    const event = buildInvoiceApprovedEvent("evt-proc-pg-restart");

    const first = await consumer.consumeProcurement(event, serviceContext);
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

    const duplicate = await restartedConsumer.consumeProcurement(event, serviceContext);
    expect(duplicate.status).toBe("duplicate");

    await restarted.shutdown();
  });
});

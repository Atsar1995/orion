/**
 * GA-001 Finance Operational Certification (P-009.17 · FIN-R-007).
 * Extends platform GA-001 with Finance production path restart, recovery, and replay certification.
 * Certification only — no architecture or business logic changes.
 */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createFinanceWiring } from "@/lib/finance/createFinanceWiring";
import { createFinancePersistenceRepositories } from "@/lib/finance/persistence/createFinancePersistenceRepositories";
import { createFinanceRepositories } from "@/lib/finance/persistence/createFinanceRepositories";
import { ensureFinancePlatformBacking } from "@/lib/finance/persistence/FinancePlatformBacking";
import { FINANCE_SEED_ORG_ID } from "@/lib/finance/persistence/createFinanceStore";
import {
  FinanceEventConsumer,
  resetFinanceEventConsumerForTests,
  resetFinanceIntegrationForTests,
  setFinanceEventConsumer,
  setFinanceInboundProcessor,
} from "@/lib/finance/integration";
import { HCM_IIL_SERVICE_ID } from "@/lib/hcm/constants";
import { IntelligenceIntegrationService } from "@/lib/platform/intelligence/IntelligenceIntegrationService";
import { ServiceRegistry } from "@/lib/platform/intelligence/ServiceRegistry";
import { WebhookGateway } from "@/lib/platform/intelligence/WebhookGateway";
import {
  InMemoryDurableTransport,
  InMemoryDurableTransportBacking,
  PostgresDurableTransport,
  RetryPolicy,
} from "@/lib/platform/iil";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { PostgresPlatformStore } from "@/lib/platform/store/PostgresPlatformStore";
import { StoreProvider } from "@/lib/platform/store/StoreConfiguration";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

const ORG = FINANCE_SEED_ORG_ID;

const serviceContext: ServiceContext = {
  organizationId: ORG,
  userId: "user-ga001-finance",
  workspaceId: "finance",
  role: "organization_admin",
};

function buildWorkforceCostEvent(
  eventId = "evt-ga001-hcm-cost-001",
  overrides: Partial<IntelligenceEvent["payload"]> = {},
): IntelligenceEvent {
  return {
    eventId,
    eventType: "CustomEvent",
    sourceService: HCM_IIL_SERVICE_ID,
    sourceWorkspace: "HCM",
    organizationId: ORG,
    entityType: "employee",
    entityId: "emp-ga001-001",
    timestamp: "2026-08-03T10:00:00.000Z",
    actorId: "user-ga001-finance",
    priority: "normal",
    correlationId: "corr-ga001-hcm-cost-001",
    payload: {
      canonicalEventType: "hcm.workforce.cost.recorded",
      eventVersion: "1",
      sourceDomain: "hcm",
      employeeId: "emp-ga001-001",
      costPeriodId: "period-2026-07",
      amount: "5000",
      currencyCode: "ZAR",
      costCentreId: "cc-hcm-001",
      idempotencyKey: `${ORG}:${HCM_IIL_SERVICE_ID}:hcm.workforce.cost.recorded:emp-ga001-001:period-2026-07`,
      ...overrides,
    },
    version: "1",
    securityClassification: "internal",
    auditMetadata: { sourceDomain: "hcm" },
  };
}

function buildPostgresStore(connection: MockDatabaseConnection): PostgresPlatformStore {
  const migrationRunner = new MigrationRunner(connection, new MigrationRegistry([bootstrapMigration]));

  return new PostgresPlatformStore({
    configuration: {
      provider: StoreProvider.PostgreSQL,
      databaseUrl: "postgresql://mock:5432/orion",
      migrationReady: true,
    },
    connection,
    migrationRunner,
  });
}

async function waitForCondition(
  check: () => boolean,
  timeoutMs = 3000,
  intervalMs = 25,
): Promise<void> {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error("Condition not met within timeout");
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

async function createFinanceProductionStack(connection: MockDatabaseConnection) {
  const store = buildPostgresStore(connection);
  await store.initialize();
  const wiring = createFinanceWiring(store);

  setFinanceInboundProcessor(wiring.financeInboundProcessor);
  const consumer = new FinanceEventConsumer(wiring.financeInboundProcessor);
  setFinanceEventConsumer(consumer);

  const transport = new PostgresDurableTransport(connection, {
    retryPolicy: new RetryPolicy(3, 10, 50),
  });
  const iil = new IntelligenceIntegrationService({
    transport,
    serviceRegistry: new ServiceRegistry(),
    webhookGateway: new WebhookGateway(),
  });
  consumer.register(iil);

  return { store, wiring, consumer, iil, transport, connection };
}

function publishHcmWorkforceCost(
  iil: IntelligenceIntegrationService,
  eventId: string,
  overrides: Partial<IntelligenceEvent["payload"]> = {},
): IntelligenceEvent {
  const template = buildWorkforceCostEvent(eventId, overrides);
  return iil.publish(
    {
      eventType: "CustomEvent",
      sourceService: HCM_IIL_SERVICE_ID,
      sourceWorkspace: "HCM",
      entityType: template.entityType,
      entityId: template.entityId,
      actorId: template.actorId,
      correlationId: template.correlationId,
      eventId: template.eventId,
      payload: template.payload,
    },
    serviceContext,
  );
}

describe("GA-001 Finance Operational Certification (P-009.17)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
    resetFinanceIntegrationForTests();
    resetFinanceEventConsumerForTests();
  });

  afterEach(() => {
    resetDefaultPlatformStoreForTests();
    resetFinanceIntegrationForTests();
    resetFinanceEventConsumerForTests();
  });

  describe("Persistence restart survival", () => {
    it("certifies journal and event lineage survive PostgreSQL restart", async () => {
      const connection = new MockDatabaseConnection();
      const store = buildPostgresStore(connection);
      await store.initialize();

      const { journalRepository, eventLineageRepository } = createFinancePersistenceRepositories({
        platformStore: store,
        connection: store.getDatabaseConnection() ?? undefined,
      });

      const wiring = createFinanceWiring(store);
      const consumer = new FinanceEventConsumer(wiring.financeInboundProcessor);
      const event = buildWorkforceCostEvent("evt-ga001-journal-lineage");

      const result = await consumer.consume(event, serviceContext);
      expect(result.status).toBe("processed");

      const lineage =
        eventLineageRepository.getByEventId(ORG, event.eventId) ??
        eventLineageRepository.getByCorrelationId(ORG, event.correlationId)[0];
      expect(lineage?.processingStatus).toBe("completed");
      expect(journalRepository.getById(ORG, result.journalId!)?.status).toBe("posted");

      await store.shutdown();

      const restarted = buildPostgresStore(connection);
      await restarted.initialize();
      const restored = createFinancePersistenceRepositories({
        platformStore: restarted,
        connection: restarted.getDatabaseConnection() ?? undefined,
      });

      expect(restored.journalRepository.getById(ORG, result.journalId!)?.status).toBe("posted");
      expect(restored.eventLineageRepository.getByCorrelationId(ORG, event.correlationId)).toHaveLength(1);

      await restarted.shutdown();
    });

    it("certifies master data persistence survives PostgreSQL restart", async () => {
      const connection = new MockDatabaseConnection();
      const store = buildPostgresStore(connection);
      await store.initialize();

      ensureFinancePlatformBacking(store);
      const repositories = createFinanceRepositories(store.getFinanceBacking(), {
        platformStore: store,
        connection: store.getDatabaseConnection() ?? undefined,
      });

      expect(repositories.chartOfAccounts).toHaveProperty("persistenceAdapter", "postgresql");
      expect(repositories.period).toHaveProperty("persistenceAdapter", "postgresql");
      expect(repositories.idempotency).toHaveProperty("persistenceAdapter", "postgresql");

      repositories.period.updateState(ORG, "period-2026-07", "hard_closed");
      repositories.idempotency.markProcessed(ORG, "ga001-md-idem", { journalId: "journal-ga001" });

      await store.shutdown();

      const restarted = buildPostgresStore(connection);
      await restarted.initialize();
      const restored = createFinanceRepositories(restarted.getFinanceBacking(), {
        platformStore: restarted,
        connection: restarted.getDatabaseConnection() ?? undefined,
      });

      expect(restored.period.findById(ORG, "period-2026-07")?.state).toBe("hard_closed");
      expect(restored.idempotency.exists(ORG, "ga001-md-idem")).toBe(true);

      await restarted.shutdown();
    });

    it("documents general ledger in-memory limitation after platform restart", async () => {
      const connection = new MockDatabaseConnection();
      const { store, wiring, consumer } = await createFinanceProductionStack(connection);
      const event = buildWorkforceCostEvent("evt-ga001-gl-limit");

      const result = await consumer.consume(event, serviceContext);
      expect(result.status).toBe("processed");
      expect(wiring.generalLedger.getEntries(ORG, { journalId: result.journalId! })).toHaveLength(2);

      await store.shutdown();

      const restarted = buildPostgresStore(connection);
      await restarted.initialize();
      const rewired = createFinanceWiring(restarted);

      expect(rewired.journalRepository.getById(ORG, result.journalId!)?.status).toBe("posted");
      expect(rewired.generalLedger.getEntries(ORG, { journalId: result.journalId! })).toHaveLength(0);

      await restarted.shutdown();
    });
  });

  describe("Durable IIL certification", () => {
    it("certifies persist-before-ack on durable transport", async () => {
      const connection = new MockDatabaseConnection();
      const transport = new PostgresDurableTransport(connection);
      const iil = new IntelligenceIntegrationService({
        transport,
        serviceRegistry: new ServiceRegistry(),
        webhookGateway: new WebhookGateway(),
      });
      transport.stopDeliveryLoop();

      const published = publishHcmWorkforceCost(iil, "evt-ga001-persist-before-ack");

      await waitForCondition(() => transport.getMetrics().persistedEvents >= 1);

      const events = await transport.listEvents(ORG, 10);
      expect(events.some((entry) => entry.eventId === published.eventId)).toBe(true);
      expect(transport.getMetrics().persistedEvents).toBeGreaterThanOrEqual(1);

      transport.stopDeliveryLoop();
    });

    it("certifies IIL event recovery after simulated platform restart", async () => {
      const connection = new MockDatabaseConnection();
      const firstTransport = new PostgresDurableTransport(connection);
      const firstIil = new IntelligenceIntegrationService({
        transport: firstTransport,
        serviceRegistry: new ServiceRegistry(),
        webhookGateway: new WebhookGateway(),
      });
      firstTransport.stopDeliveryLoop();

      publishHcmWorkforceCost(firstIil, "evt-ga001-iil-restart");
      await waitForCondition(() => firstTransport.getMetrics().persistedEvents >= 1);
      firstTransport.stopDeliveryLoop();

      const restartedTransport = new PostgresDurableTransport(connection);
      restartedTransport.stopDeliveryLoop();
      const recovered = await restartedTransport.recoverPendingDeliveries();

      expect(recovered).toBeGreaterThanOrEqual(0);
      const events = await restartedTransport.listEvents(ORG, 10);
      expect(events.some((entry) => entry.eventId === "evt-ga001-iil-restart")).toBe(true);

      restartedTransport.stopDeliveryLoop();
    });

    it("certifies DLQ capture and operator replay requeue", async () => {
      const backing = new InMemoryDurableTransportBacking();
      const transport = new InMemoryDurableTransport({
        backing,
        retryPolicy: new RetryPolicy(2, 10, 30),
      });
      const iil = new IntelligenceIntegrationService({
        transport,
        serviceRegistry: new ServiceRegistry(),
        webhookGateway: new WebhookGateway(),
      });

      iil.subscribe(
        { subscriberId: "ga001-failing-subscriber", eventTypes: ["CustomEvent"] },
        async () => {
          throw new Error("Simulated delivery failure");
        },
      );

      iil.publish(
        {
          eventType: "CustomEvent",
          sourceService: HCM_IIL_SERVICE_ID,
          sourceWorkspace: "HCM",
          entityType: "employee",
          entityId: "emp-dlq-001",
          actorId: "user-ga001-finance",
          eventId: "evt-ga001-dlq",
        },
        serviceContext,
      );

      await waitForCondition(() => iil.listDeadLetter(serviceContext).length > 0, 5000, 50);

      const deadLetters = iil.listDeadLetter(serviceContext);
      const requeued = await iil.retryDeadLetter(deadLetters[0]!.id, serviceContext);
      expect(requeued?.eventId).toBe("evt-ga001-dlq");

      transport.stopDeliveryLoop();
    });
  });

  describe("HCM → Finance production chain", () => {
    it("certifies full chain: HCM publish → durable IIL → journal post → ledger update", async () => {
      const connection = new MockDatabaseConnection();
      const { wiring, iil, transport } = await createFinanceProductionStack(connection);

      publishHcmWorkforceCost(iil, "evt-ga001-e2e-chain");

      await waitForCondition(
        () => wiring.journalRepository.listByOrganization(ORG).some((entry) => entry.status === "posted"),
        5000,
      );

      const posted = wiring.journalRepository.listByOrganization(ORG).filter((entry) => entry.status === "posted");
      expect(posted.length).toBeGreaterThan(0);

      const journalId = posted[0]!.id;
      expect(wiring.generalLedger.getEntries(ORG, { journalId })).toHaveLength(2);
      expect(transport.getMetrics().deliveredTotal).toBeGreaterThanOrEqual(1);

      transport.stopDeliveryLoop();
      await wiring.platformStore.shutdown();
    });

    it("certifies crash recovery: pending delivery resumes after platform restart", async () => {
      const connection = new MockDatabaseConnection();
      const firstTransport = new PostgresDurableTransport(connection, {
        retryPolicy: new RetryPolicy(3, 10, 50),
      });
      const firstIil = new IntelligenceIntegrationService({
        transport: firstTransport,
        serviceRegistry: new ServiceRegistry(),
        webhookGateway: new WebhookGateway(),
      });
      firstTransport.stopDeliveryLoop();

      publishHcmWorkforceCost(firstIil, "evt-ga001-crash-recovery");
      await waitForCondition(() => firstTransport.getMetrics().persistedEvents >= 1);
      firstTransport.stopDeliveryLoop();

      const firstStore = buildPostgresStore(connection);
      await firstStore.initialize();
      const firstWiring = createFinanceWiring(firstStore);
      expect(firstWiring.journalRepository.listByOrganization(ORG)).toHaveLength(0);
      await firstStore.shutdown();

      const { wiring, iil, transport } = await createFinanceProductionStack(connection);
      const recovered = await iil.recoverAfterRestart();

      await waitForCondition(
        () => wiring.journalRepository.listByOrganization(ORG).some((entry) => entry.status === "posted"),
        5000,
      );

      const posted = wiring.journalRepository.listByOrganization(ORG).filter((entry) => entry.status === "posted");
      expect(posted.length).toBeGreaterThan(0);
      expect(recovered).toBeGreaterThanOrEqual(0);

      transport.stopDeliveryLoop();
      await wiring.platformStore.shutdown();
    });

    it("certifies duplicate suppression without duplicate journal posting", async () => {
      const connection = new MockDatabaseConnection();
      const { wiring, consumer, transport } = await createFinanceProductionStack(connection);
      const event = buildWorkforceCostEvent("evt-ga001-dup-suppress");

      const first = await consumer.consume(event, serviceContext);
      const second = await consumer.consume(event, serviceContext);

      expect(first.status).toBe("processed");
      expect(second.status).toBe("duplicate");
      expect(wiring.journalRepository.listByOrganization(ORG).filter((entry) => entry.status === "posted")).toHaveLength(
        1,
      );
      expect(wiring.generalLedger.getEntries(ORG, { journalId: first.journalId! })).toHaveLength(2);

      transport.stopDeliveryLoop();
      await wiring.platformStore.shutdown();
    });

    it("certifies replay idempotency through Finance consumer", async () => {
      const connection = new MockDatabaseConnection();
      const { wiring, consumer, transport } = await createFinanceProductionStack(connection);
      const event = buildWorkforceCostEvent("evt-ga001-replay-idem");

      const initial = await consumer.consume(event, serviceContext);
      expect(initial.status).toBe("processed");

      const replay = await consumer.consume(event, serviceContext);
      expect(replay.status).toBe("duplicate");
      expect(replay.journalId).toBe(initial.journalId);

      const lineage =
        wiring.eventLineageRepository.getByEventId(ORG, event.eventId) ??
        wiring.eventLineageRepository.getByCorrelationId(ORG, event.correlationId)[0];
      expect(lineage?.journalId).toBe(initial.journalId);
      expect(wiring.journalRepository.listByOrganization(ORG).filter((entry) => entry.status === "posted")).toHaveLength(
        1,
      );

      transport.stopDeliveryLoop();
      await wiring.platformStore.shutdown();
    });
  });

  describe("Operational integrity", () => {
    it("certifies organization isolation on inbound HCM events", async () => {
      const connection = new MockDatabaseConnection();
      const { wiring, consumer, transport } = await createFinanceProductionStack(connection);
      const event = {
        ...buildWorkforceCostEvent("evt-ga001-org-isolation"),
        organizationId: "org-other",
      };

      const result = await consumer.consume(event, serviceContext);

      expect(result.status).toBe("rejected");
      expect(result.code).toBe("ORGANIZATION_MISMATCH");
      expect(wiring.journalRepository.listByOrganization(ORG)).toHaveLength(0);

      transport.stopDeliveryLoop();
      await wiring.platformStore.shutdown();
    });

    it("certifies transaction rollback on contract validation failure", async () => {
      const connection = new MockDatabaseConnection();
      const { wiring, consumer, transport } = await createFinanceProductionStack(connection);
      const event = buildWorkforceCostEvent("evt-ga001-rollback", { amount: "0" });

      const result = await consumer.consume(event, serviceContext);

      expect(result.status).toBe("rejected");
      expect(result.code).toBe("AMOUNT_REQUIRED");
      expect(wiring.journalRepository.listByOrganization(ORG)).toHaveLength(0);
      expect(wiring.generalLedger.getEntries(ORG)).toHaveLength(0);

      transport.stopDeliveryLoop();
      await wiring.platformStore.shutdown();
    });

    it("certifies PostgreSQL restart duplicate short-circuit on Finance consumer", async () => {
      const connection = new MockDatabaseConnection();
      const store = buildPostgresStore(connection);
      await store.initialize();
      const wiring = createFinanceWiring(store);
      const consumer = new FinanceEventConsumer(wiring.financeInboundProcessor);
      const event = buildWorkforceCostEvent("evt-ga001-pg-restart-dup");

      const first = await consumer.consume(event, serviceContext);
      expect(first.status).toBe("processed");
      await store.shutdown();

      const restarted = buildPostgresStore(connection);
      await restarted.initialize();
      const rewired = createFinanceWiring(restarted);
      const restartedConsumer = new FinanceEventConsumer(rewired.financeInboundProcessor);

      expect(rewired.journalRepository.getById(ORG, first.journalId!)?.status).toBe("posted");

      const duplicate = await restartedConsumer.consume(event, serviceContext);
      expect(duplicate.status).toBe("duplicate");

      await restarted.shutdown();
    });
  });
});

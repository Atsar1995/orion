import { beforeEach, describe, expect, it } from "vitest";
import { ensureCrmPlatformBacking } from "@/lib/crm/persistence/CrmPlatformBacking";
import { createCrmPersistenceRepositories } from "@/lib/crm/persistence/createCrmPersistenceRepositories";
import { CRM_SEED_ORG_ID } from "@/lib/crm/persistence/createCrmStore";
import type { CrmAggregateRecord } from "@/lib/crm/persistence/CrmStoreBacking";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { PostgresPlatformStore } from "@/lib/platform/store/PostgresPlatformStore";
import { StoreProvider } from "@/lib/platform/store/StoreConfiguration";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

const ORG_A = CRM_SEED_ORG_ID;
const ORG_B = "org-other";

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

function buildAggregate(organizationId: string, id: string): CrmAggregateRecord {
  const timestamp = "2026-08-05T00:00:00.000Z";
  return {
    id,
    organizationId,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function createPersistenceRepositories(store: PostgresPlatformStore) {
  ensureCrmPlatformBacking(store);
  const connection = store.getDatabaseConnection() ?? undefined;
  return createCrmPersistenceRepositories({ platformStore: store, connection });
}

async function flushScheduledPersistence(): Promise<void> {
  await new Promise<void>((resolve) => {
    queueMicrotask(resolve);
  });
}

describe("CRM PostgreSQL Persistence & Restart Certification (P-008.17)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("activates postgres persistence adapter when relational PlatformStore is initialized", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const { crmRepository } = createPersistenceRepositories(store);
    expect(crmRepository.persistenceAdapter).toBe("postgresql");

    await store.shutdown();
  });

  it("persists a single aggregate across PlatformStore shutdown and restart", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const { crmRepository } = createPersistenceRepositories(store);
    const lead = buildAggregate(ORG_A, "lead-restart-001");

    crmRepository.upsert("leads", lead);
    await flushScheduledPersistence();
    await store.shutdown();

    const restarted = buildPostgresStore(connection);
    await restarted.initialize();
    const restored = createPersistenceRepositories(restarted);

    expect(restored.crmRepository.getById(ORG_A, "leads", lead.id)).toEqual(lead);

    await restarted.shutdown();
  });

  it("hydrates multiple aggregate collections after restart", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const { crmRepository } = createPersistenceRepositories(store);
    const records = {
      lead: buildAggregate(ORG_A, "lead-md-001"),
      opportunity: buildAggregate(ORG_A, "opp-md-001"),
      quote: buildAggregate(ORG_A, "quote-md-001"),
      case: buildAggregate(ORG_A, "case-md-001"),
      salesOrder: buildAggregate(ORG_A, "so-md-001"),
      account: buildAggregate(ORG_A, "acct-md-001"),
      contact: buildAggregate(ORG_A, "contact-md-001"),
      organization: buildAggregate(ORG_A, "org-md-001"),
      activity: buildAggregate(ORG_A, "activity-md-001"),
      note: buildAggregate(ORG_A, "note-md-001"),
      attachment: buildAggregate(ORG_A, "attachment-md-001"),
    };

    crmRepository.upsert("leads", records.lead);
    crmRepository.upsert("opportunities", records.opportunity);
    crmRepository.upsert("quotes", records.quote);
    crmRepository.upsert("cases", records.case);
    crmRepository.upsert("salesOrders", records.salesOrder);
    crmRepository.upsert("accounts", records.account);
    crmRepository.upsert("contacts", records.contact);
    crmRepository.upsert("organizations", records.organization);
    crmRepository.upsert("activities", records.activity);
    crmRepository.upsert("notes", records.note);
    crmRepository.upsert("attachments", records.attachment);

    await flushScheduledPersistence();
    await store.shutdown();

    const restarted = buildPostgresStore(connection);
    await restarted.initialize();
    const restored = createPersistenceRepositories(restarted);

    expect(restored.crmRepository.getById(ORG_A, "leads", records.lead.id)).toEqual(records.lead);
    expect(restored.crmRepository.getById(ORG_A, "opportunities", records.opportunity.id)).toEqual(
      records.opportunity,
    );
    expect(restored.crmRepository.getById(ORG_A, "quotes", records.quote.id)).toEqual(records.quote);
    expect(restored.crmRepository.getById(ORG_A, "cases", records.case.id)).toEqual(records.case);
    expect(restored.crmRepository.getById(ORG_A, "salesOrders", records.salesOrder.id)).toEqual(
      records.salesOrder,
    );
    expect(restored.crmRepository.getById(ORG_A, "accounts", records.account.id)).toEqual(
      records.account,
    );
    expect(restored.crmRepository.getById(ORG_A, "contacts", records.contact.id)).toEqual(
      records.contact,
    );
    expect(restored.crmRepository.getById(ORG_A, "organizations", records.organization.id)).toEqual(
      records.organization,
    );
    expect(restored.crmRepository.getById(ORG_A, "activities", records.activity.id)).toEqual(
      records.activity,
    );
    expect(restored.crmRepository.getById(ORG_A, "notes", records.note.id)).toEqual(records.note);
    expect(restored.crmRepository.getById(ORG_A, "attachments", records.attachment.id)).toEqual(
      records.attachment,
    );

    await restarted.shutdown();
  });

  it("enforces organization isolation across restart", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const { crmRepository } = createPersistenceRepositories(store);
    const orgBLead = buildAggregate(ORG_B, "lead-org-b-001");

    crmRepository.upsert("leads", orgBLead);
    crmRepository.registerIdempotencyKey(ORG_B, "crm-idem-org-b", "processed");

    expect(crmRepository.getById(ORG_A, "leads", orgBLead.id)).toBeNull();
    expect(crmRepository.getIdempotencyKey(ORG_A, "crm-idem-org-b")).toBeNull();

    await flushScheduledPersistence();
    await store.shutdown();

    const restarted = buildPostgresStore(connection);
    await restarted.initialize();
    const restored = createPersistenceRepositories(restarted);

    expect(restored.crmRepository.getById(ORG_B, "leads", orgBLead.id)).toEqual(orgBLead);
    expect(restored.crmRepository.getById(ORG_A, "leads", orgBLead.id)).toBeNull();
    expect(restored.crmRepository.getIdempotencyKey(ORG_B, "crm-idem-org-b")).toBe("processed");
    expect(restored.crmRepository.getIdempotencyKey(ORG_A, "crm-idem-org-b")).toBeNull();

    await restarted.shutdown();
  });

  it("persists idempotency keys and entity registry across restart", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const { crmRepository } = createPersistenceRepositories(store);
    const lead = buildAggregate(ORG_A, "lead-idem-001");

    crmRepository.upsert("leads", lead);
    crmRepository.registerIdempotencyKey(ORG_A, "crm-idem-restart", "lead-idem-001");

    await flushScheduledPersistence();
    await store.shutdown();

    const restarted = buildPostgresStore(connection);
    await restarted.initialize();
    const restored = createPersistenceRepositories(restarted);

    expect(restored.crmRepository.getIdempotencyKey(ORG_A, "crm-idem-restart")).toBe("lead-idem-001");
    expect(restarted.getCrmBacking().entityRegistry.has("leads::lead-idem-001")).toBe(true);

    await restarted.shutdown();
  });

  it("persists aggregate removal across restart", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const { crmRepository } = createPersistenceRepositories(store);
    const quote = buildAggregate(ORG_A, "quote-delete-001");

    crmRepository.upsert("quotes", quote);
    await flushScheduledPersistence();
    await store.shutdown();

    const restarted = buildPostgresStore(connection);
    await restarted.initialize();
    const restored = createPersistenceRepositories(restarted);

    expect(restored.crmRepository.remove(ORG_A, "quotes", quote.id)).toBe(true);
    await flushScheduledPersistence();
    await restarted.shutdown();

    const finalStore = buildPostgresStore(connection);
    await finalStore.initialize();
    const finalRepos = createPersistenceRepositories(finalStore);

    expect(finalRepos.crmRepository.getById(ORG_A, "quotes", quote.id)).toBeNull();

    await finalStore.shutdown();
  });

  it("discards uncommitted CRM writes on transaction rollback", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const { crmRepository } = createPersistenceRepositories(store);
    const opportunity = buildAggregate(ORG_A, "opp-rollback-001");
    const transactionManager = store.getTransactionManager();
    const beginResult = await transactionManager.beginTransaction();

    expect(beginResult.success).toBe(true);
    if (!beginResult.success) {
      throw new Error("Expected transaction begin to succeed.");
    }

    crmRepository.upsert("opportunities", opportunity);
    crmRepository.registerIdempotencyKey(ORG_A, "crm-rollback-idem", "rolled-back");

    const rollbackResult = await transactionManager.rollback(beginResult.data);
    expect(rollbackResult.success).toBe(true);

    await store.shutdown();

    const restarted = buildPostgresStore(connection);
    await restarted.initialize();
    const restored = createPersistenceRepositories(restarted);

    expect(restored.crmRepository.getById(ORG_A, "opportunities", opportunity.id)).toBeNull();
    expect(restored.crmRepository.getIdempotencyKey(ORG_A, "crm-rollback-idem")).toBeNull();

    await restarted.shutdown();
  });

  it("commits CRM writes inside a transaction and survives restart", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const { crmRepository } = createPersistenceRepositories(store);
    const salesOrder = buildAggregate(ORG_A, "so-commit-001");
    const transactionManager = store.getTransactionManager();
    const beginResult = await transactionManager.beginTransaction();

    expect(beginResult.success).toBe(true);
    if (!beginResult.success) {
      throw new Error("Expected transaction begin to succeed.");
    }

    crmRepository.upsert("salesOrders", salesOrder);
    const commitResult = await transactionManager.commit(beginResult.data);
    expect(commitResult.success).toBe(true);

    await store.shutdown();

    const restarted = buildPostgresStore(connection);
    await restarted.initialize();
    const restored = createPersistenceRepositories(restarted);

    expect(restored.crmRepository.getById(ORG_A, "salesOrders", salesOrder.id)).toEqual(salesOrder);

    await restarted.shutdown();
  });
});

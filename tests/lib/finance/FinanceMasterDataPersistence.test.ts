import { beforeEach, describe, expect, it } from "vitest";
import { createFinanceRepositories } from "@/lib/finance/persistence/createFinanceRepositories";
import { ensureFinancePlatformBacking } from "@/lib/finance/persistence/FinancePlatformBacking";
import { FINANCE_SEED_ORG_ID } from "@/lib/finance/persistence/createFinanceStore";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { PostgresPlatformStore } from "@/lib/platform/store/PostgresPlatformStore";
import { StoreProvider } from "@/lib/platform/store/StoreConfiguration";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";
import type { ChartOfAccountRecord } from "@/types/finance-chart-of-accounts";

const ORG_A = FINANCE_SEED_ORG_ID;
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

function buildAccount(organizationId: string, id: string): ChartOfAccountRecord {
  const now = "2026-08-03T00:00:00.000Z";
  return {
    id,
    organizationId,
    code: `9${id.slice(-3)}`,
    name: `Test Account ${id}`,
    accountType: "expense",
    category: "operating_expense",
    postingAllowed: true,
    isControlAccount: false,
    currencyRule: "functional_only",
    taxApplicable: false,
    costCentreRequired: false,
    profitCentreRequired: false,
    status: "active",
    effectiveFrom: "2026-01-01",
    createdAt: now,
    updatedAt: now,
  };
}

function createRepositories(store: PostgresPlatformStore) {
  ensureFinancePlatformBacking(store);
  const connection = store.getDatabaseConnection() ?? undefined;
  const backing = store.getFinanceBacking();
  return createFinanceRepositories(backing, { platformStore: store, connection });
}

describe("Finance Master Data PostgreSQL Persistence (P-009.13)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("activates postgres adapters for chart of accounts, period, and idempotency", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const repositories = createRepositories(store);

    expect(repositories.chartOfAccounts).toHaveProperty("persistenceAdapter", "postgresql");
    expect(repositories.period).toHaveProperty("persistenceAdapter", "postgresql");
    expect(repositories.idempotency).toHaveProperty("persistenceAdapter", "postgresql");

    await store.shutdown();
  });

  it("persists chart of accounts create, update, and delete across restart", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const repositories = createRepositories(store);
    const account = buildAccount(ORG_A, "coa-md-test-001");

    repositories.chartOfAccounts.create(account);
    repositories.chartOfAccounts.update({
      ...account,
      name: "Updated Master Data Account",
      updatedAt: "2026-08-03T01:00:00.000Z",
    });

    await store.shutdown();

    const restarted = buildPostgresStore(connection);
    await restarted.initialize();
    const restored = createRepositories(restarted);

    expect(restored.chartOfAccounts.findById(ORG_A, account.id)?.name).toBe(
      "Updated Master Data Account",
    );

    restarted.getFinanceBacking().accounts.delete(account.id);
    await restarted.shutdown();

    const finalStore = buildPostgresStore(connection);
    await finalStore.initialize();
    const finalRepos = createRepositories(finalStore);

    expect(finalRepos.chartOfAccounts.findById(ORG_A, account.id)).toBeNull();

    await finalStore.shutdown();
  });

  it("persists fiscal period state updates across restart", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const repositories = createRepositories(store);
    const periodId = "period-2026-07";

    repositories.period.updateState(ORG_A, periodId, "hard_closed");

    await store.shutdown();

    const restarted = buildPostgresStore(connection);
    await restarted.initialize();
    const restored = createRepositories(restarted);

    expect(restored.period.findById(ORG_A, periodId)?.state).toBe("hard_closed");

    await restarted.shutdown();
  });

  it("persists idempotency keys across restart", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const repositories = createRepositories(store);
    const idempotencyKey = "finance-md-idem-001";

    repositories.idempotency.markProcessed(ORG_A, idempotencyKey, { journalId: "journal-001" });

    await store.shutdown();

    const restarted = buildPostgresStore(connection);
    await restarted.initialize();
    const restored = createRepositories(restarted);

    expect(restored.idempotency.exists(ORG_A, idempotencyKey)).toBe(true);

    await restarted.shutdown();
  });

  it("enforces organization isolation for master data", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const repositories = createRepositories(store);
    const orgBAccount = buildAccount(ORG_B, "coa-md-org-b-001");

    repositories.chartOfAccounts.create(orgBAccount);
    repositories.idempotency.markProcessed(ORG_B, "finance-md-org-b-idem", { source: "test" });

    expect(repositories.chartOfAccounts.findById(ORG_A, orgBAccount.id)).toBeNull();
    expect(repositories.idempotency.exists(ORG_A, "finance-md-org-b-idem")).toBe(false);

    await store.shutdown();

    const restarted = buildPostgresStore(connection);
    await restarted.initialize();
    const restored = createRepositories(restarted);

    expect(restored.chartOfAccounts.findById(ORG_B, orgBAccount.id)?.organizationId).toBe(ORG_B);
    expect(restored.chartOfAccounts.findById(ORG_A, orgBAccount.id)).toBeNull();

    await restarted.shutdown();
  });

  it("discards uncommitted master data writes on transaction rollback", async () => {
    const connection = new MockDatabaseConnection();
    const store = buildPostgresStore(connection);
    await store.initialize();

    const repositories = createRepositories(store);
    const account = buildAccount(ORG_A, "coa-md-rollback-001");
    const transactionManager = store.getTransactionManager();
    const beginResult = await transactionManager.beginTransaction();

    expect(beginResult.success).toBe(true);
    if (!beginResult.success) {
      throw new Error("Expected transaction begin to succeed.");
    }

    repositories.chartOfAccounts.create(account);
    repositories.idempotency.markProcessed(ORG_A, "finance-md-rollback-idem", { rolledBack: "true" });

    const rollbackResult = await transactionManager.rollback(beginResult.data);
    expect(rollbackResult.success).toBe(true);

    await store.shutdown();

    const restarted = buildPostgresStore(connection);
    await restarted.initialize();
    const restored = createRepositories(restarted);

    expect(restored.chartOfAccounts.findById(ORG_A, account.id)).toBeNull();
    expect(restored.idempotency.exists(ORG_A, "finance-md-rollback-idem")).toBe(false);

    await restarted.shutdown();
  });
});

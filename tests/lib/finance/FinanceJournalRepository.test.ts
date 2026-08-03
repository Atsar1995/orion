import { beforeEach, describe, expect, it } from "vitest";
import { createFinanceWiring } from "@/lib/finance/createFinanceWiring";
import { FINANCE_SEED_ORG_ID } from "@/lib/finance/persistence/createFinanceStore";
import { createFinancePersistenceRepositories } from "@/lib/finance/persistence/createFinancePersistenceRepositories";
import { createIsolatedFinanceBacking } from "@/lib/finance/persistence/FinancePlatformBacking";
import { InMemoryEventLineageRepository } from "@/lib/finance/persistence/InMemoryEventLineageRepository";
import { InMemoryJournalRepository } from "@/lib/finance/persistence/InMemoryJournalRepository";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { PostgresPlatformStore } from "@/lib/platform/store/PostgresPlatformStore";
import { StoreProvider } from "@/lib/platform/store/StoreConfiguration";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

const ORG_A = FINANCE_SEED_ORG_ID;
const ORG_B = "org-other";

function buildDraft(orgId = ORG_A) {
  return {
    entry: {
      id: "journal-draft-001",
      organizationId: orgId,
      periodId: "period-2026-07",
      status: "draft" as const,
      correlationId: "corr-journal-001",
    },
    lines: [
      {
        id: "line-001",
        journalId: "journal-draft-001",
        accountId: "acct-1000",
        debitAmount: 100,
        creditAmount: 0,
        currency: "ZAR",
      },
      {
        id: "line-002",
        journalId: "journal-draft-001",
        accountId: "acct-2000",
        debitAmount: 0,
        creditAmount: 100,
        currency: "ZAR",
      },
    ],
  };
}

describe("Finance Journal Repository (P-009.7B)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("supports journal draft CRUD with organization isolation", () => {
    const backing = createIsolatedFinanceBacking(false);
    const repository = new InMemoryJournalRepository(backing);
    const draft = buildDraft();

    repository.createDraft(draft);
    expect(repository.exists(ORG_A, draft.entry.id)).toBe(true);
    expect(repository.getById(ORG_A, draft.entry.id)?.status).toBe("draft");
    expect(repository.listLines(ORG_A, draft.entry.id)).toHaveLength(2);
    expect(repository.listByOrganization(ORG_A)).toHaveLength(1);
    expect(repository.getById(ORG_B, draft.entry.id)).toBeNull();

    repository.updateStatus(ORG_A, draft.entry.id, "posted");
    expect(repository.getById(ORG_A, draft.entry.id)?.status).toBe("posted");
    expect(repository.deleteDraft(ORG_A, draft.entry.id)).toBe(false);

    repository.updateStatus(ORG_A, draft.entry.id, "draft");
    expect(repository.deleteDraft(ORG_A, draft.entry.id)).toBe(true);
    expect(repository.exists(ORG_A, draft.entry.id)).toBe(false);
  });

  it("finds journals by correlation and period", () => {
    const backing = createIsolatedFinanceBacking(false);
    const repository = new InMemoryJournalRepository(backing);
    repository.createDraft(buildDraft());

    expect(repository.findByCorrelationId(ORG_A, "corr-journal-001")).toHaveLength(1);
    expect(repository.listByPeriod(ORG_A, "period-2026-07")).toHaveLength(1);
  });

  it("persists lineage metadata with replay and processing status", () => {
    const backing = createIsolatedFinanceBacking(false);
    const repository = new InMemoryEventLineageRepository(backing);

    repository.record({
      id: "lineage-001",
      organizationId: ORG_A,
      correlationId: "corr-lineage-001",
      financialEventId: "event-001",
      createdAt: "2026-08-03T00:00:00.000Z",
    });

    expect(repository.exists(ORG_A, "lineage-001")).toBe(true);
    expect(repository.getByEventId(ORG_A, "event-001")?.id).toBe("lineage-001");
    expect(repository.getByCorrelationId(ORG_A, "corr-lineage-001")).toHaveLength(1);
    expect(repository.listByOrganization(ORG_A)).toHaveLength(1);
    expect(repository.incrementReplayCount(ORG_A, "lineage-001")?.replayCount).toBe(1);
    expect(
      repository.updateProcessingStatus(ORG_A, "lineage-001", "completed")?.processingStatus,
    ).toBe("completed");
  });

  it("wires repositories through createFinanceWiring", async () => {
    const platformStore = new InMemoryPlatformStore();
    await platformStore.initialize();
    const wiring = createFinanceWiring(platformStore);
    const draft = buildDraft();
    wiring.journalRepository.createDraft(draft);

    expect(wiring.journalRepository.getById(ORG_A, draft.entry.id)).not.toBeNull();
    expect(wiring.eventLineageRepository.listByOrganization(ORG_A)).toEqual([]);
  });
});

describe("Finance PostgreSQL Repository Persistence (P-009.7B)", () => {
  it("activates postgres repositories and survives restart", async () => {
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

    const { journalRepository, eventLineageRepository } = createFinancePersistenceRepositories({
      platformStore: store,
      connection: store.getDatabaseConnection() ?? undefined,
    });

    expect(journalRepository).toHaveProperty("persistenceAdapter", "postgresql");

    const draft = buildDraft();
    journalRepository.createDraft(draft);
    eventLineageRepository.record({
      id: "lineage-pg-001",
      organizationId: ORG_A,
      correlationId: "corr-pg-001",
      journalId: draft.entry.id,
      createdAt: "2026-08-03T00:00:00.000Z",
    });

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

    const restored = createFinancePersistenceRepositories({
      platformStore: restarted,
      connection: restarted.getDatabaseConnection() ?? undefined,
    });

    expect(restored.journalRepository.getById(ORG_A, draft.entry.id)?.status).toBe("draft");
    expect(restored.journalRepository.listLines(ORG_A, draft.entry.id)).toHaveLength(2);
    expect(restored.eventLineageRepository.getByCorrelationId(ORG_A, "corr-pg-001")).toHaveLength(1);

    await restarted.shutdown();
  });
});

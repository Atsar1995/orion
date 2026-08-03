import { beforeEach, describe, expect, it } from "vitest";
import { createFinanceWiring } from "@/lib/finance/createFinanceWiring";
import { createFinanceRepositories } from "@/lib/finance/persistence/createFinanceRepositories";
import { FINANCE_SEED_ORG_ID } from "@/lib/finance/persistence/createFinanceStore";
import { createIsolatedFinanceBacking } from "@/lib/finance/persistence/FinancePlatformBacking";
import { InMemoryEventLineageRepository } from "@/lib/finance/persistence/InMemoryEventLineageRepository";
import { InMemoryGeneralLedgerRepository } from "@/lib/finance/repositories/InMemoryGeneralLedgerRepository";
import { InMemoryJournalRepository } from "@/lib/finance/persistence/InMemoryJournalRepository";
import { GeneralLedgerPostingService } from "@/lib/finance/services/GeneralLedgerPostingService";
import { JournalPostingService } from "@/lib/finance/services/JournalPostingService";
import { createPostingContext } from "@/lib/finance/services/PostingContext";
import { PostingValidationPipeline } from "@/lib/finance/services/PostingValidationPipeline";
import { PostingValidationService } from "@/lib/finance/services/PostingValidationService";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { NoOpTransactionManager } from "@/lib/persistence/services/shared";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { PostgresPlatformStore } from "@/lib/platform/store/PostgresPlatformStore";
import { StoreProvider } from "@/lib/platform/store/StoreConfiguration";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import type { ServiceContext } from "@/types/services";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

const ORG = FINANCE_SEED_ORG_ID;

const serviceContext: ServiceContext = {
  organizationId: ORG,
  userId: "user-finance-001",
  workspaceId: "finance",
  role: "organization_admin",
};

function buildDraft(journalId = "journal-post-001") {
  return {
    entry: {
      id: journalId,
      organizationId: ORG,
      periodId: "period-2026-07",
      status: "draft" as const,
      correlationId: "corr-post-001",
    },
    lines: [
      {
        id: "line-post-debit",
        journalId,
        accountId: "coa-1110",
        debitAmount: 50,
        creditAmount: 0,
        currency: "ZAR",
      },
      {
        id: "line-post-credit",
        journalId,
        accountId: "coa-4200",
        debitAmount: 0,
        creditAmount: 50,
        currency: "ZAR",
      },
    ],
  };
}

function createPostingValidationPipeline(backing: ReturnType<typeof createIsolatedFinanceBacking>) {
  const repositories = createFinanceRepositories(backing);
  const eventLineageRepository = new InMemoryEventLineageRepository(backing);
  const validationService = new PostingValidationService(
    repositories.chartOfAccounts,
    repositories.idempotency,
    eventLineageRepository,
    repositories.generalLedger,
    repositories.financialIntelligence,
    repositories.period,
  );
  return new PostingValidationPipeline(validationService);
}

function createJournalPostingService(backing: ReturnType<typeof createIsolatedFinanceBacking>) {
  const journalRepository = new InMemoryJournalRepository(backing);
  const generalLedgerRepository = new InMemoryGeneralLedgerRepository(backing);
  const eventLineageRepository = new InMemoryEventLineageRepository(backing);
  return new JournalPostingService(
    journalRepository,
    eventLineageRepository,
    new GeneralLedgerPostingService(journalRepository, generalLedgerRepository),
    createPostingValidationPipeline(backing),
    new NoOpTransactionManager(),
  );
}

describe("JournalPostingService (P-009.7C)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("posts a draft journal within a transaction and records lineage metadata", async () => {
    const backing = createIsolatedFinanceBacking();
    const journalRepository = new InMemoryJournalRepository(backing);
    const eventLineageRepository = new InMemoryEventLineageRepository(backing);
    const postingService = createJournalPostingService(backing);

    const draft = buildDraft();
    journalRepository.createDraft(draft);

    const result = await postingService.post(
      createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-post-001",
        idempotencyKey: "idem-post-001",
        eventId: "event-post-001",
        serviceContext,
        requestMetadata: { journalDate: "2026-07-15" },
      }),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.status).toBe("posted");
    expect(result.data.processingStatus).toBe("completed");
    expect(journalRepository.getById(ORG, draft.entry.id)?.status).toBe("posted");
    expect(
      eventLineageRepository.getByEventId(ORG, "event-post-001")?.processingStatus,
    ).toBe("completed");
  });

  it("returns duplicate result for repeated idempotency keys without re-posting", async () => {
    const backing = createIsolatedFinanceBacking();
    const journalRepository = new InMemoryJournalRepository(backing);
    const postingService = createJournalPostingService(backing);

    const draft = buildDraft("journal-post-dup");
    journalRepository.createDraft(draft);

    const context = createPostingContext({
      organizationId: ORG,
      journalId: draft.entry.id,
      correlationId: "corr-post-dup",
      idempotencyKey: "idem-post-dup",
      serviceContext,
      requestMetadata: { journalDate: "2026-07-15" },
    });

    const first = await postingService.post(context);
    const second = await postingService.post(context);

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    if (!first.success || !second.success) return;

    expect(first.data.status).toBe("posted");
    expect(second.data.status).toBe("duplicate");
    expect(second.data.journalId).toBe(draft.entry.id);
  });

  it("rolls back transaction metadata on missing journal failure", async () => {
    const backing = createIsolatedFinanceBacking();
    const postingService = createJournalPostingService(backing);
    const eventLineageRepository = new InMemoryEventLineageRepository(backing);

    const result = await postingService.post(
      createPostingContext({
        organizationId: ORG,
        journalId: "journal-missing",
        correlationId: "corr-post-fail",
        idempotencyKey: "idem-post-fail",
        serviceContext,
      }),
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.message).toBe("JOURNAL_NOT_FOUND");
    expect(eventLineageRepository.listByOrganization(ORG)).toHaveLength(0);
  });

  it("wires posting through createFinanceWiring DefaultPostingService", async () => {
    const platformStore = new InMemoryPlatformStore();
    await platformStore.initialize();
    const wiring = createFinanceWiring(platformStore);

    const draft = buildDraft("journal-wiring-post");
    wiring.journalRepository.createDraft(draft);

    const result = await wiring.posting.postJournal(serviceContext, draft.entry.id, {
      correlationId: "corr-wiring-post",
      idempotencyKey: "idem-wiring-post",
      requestMetadata: { journalDate: "2026-07-15" },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.status).toBe("posted");
    expect(wiring.journalRepository.getById(ORG, draft.entry.id)?.status).toBe("posted");
  });
});

describe("JournalPostingService PostgreSQL persistence (P-009.7C)", () => {
  it("survives restart with posted journal and idempotency metadata", async () => {
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
    const draft = buildDraft("journal-pg-post");
    wiring.journalRepository.createDraft(draft);

    const postResult = await wiring.journalPosting.post(
      createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-pg-post",
        idempotencyKey: "idem-pg-post",
        serviceContext,
        requestMetadata: { journalDate: "2026-07-15" },
      }),
    );

    expect(postResult.success).toBe(true);
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

    expect(rewired.journalRepository.getById(ORG, draft.entry.id)?.status).toBe("posted");

    const duplicate = await rewired.journalPosting.post(
      createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-pg-post",
        idempotencyKey: "idem-pg-post",
        serviceContext,
      }),
    );

    expect(duplicate.success).toBe(true);
    if (duplicate.success) {
      expect(duplicate.data.status).toBe("duplicate");
    }

    await restarted.shutdown();
  });
});

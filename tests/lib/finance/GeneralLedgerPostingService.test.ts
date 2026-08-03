import { beforeEach, describe, expect, it } from "vitest";
import { FINANCE_SEED_ORG_ID } from "@/lib/finance/persistence/createFinanceStore";
import { createIsolatedFinanceBacking } from "@/lib/finance/persistence/FinancePlatformBacking";
import { InMemoryGeneralLedgerRepository } from "@/lib/finance/repositories/InMemoryGeneralLedgerRepository";
import { InMemoryJournalRepository } from "@/lib/finance/persistence/InMemoryJournalRepository";
import { GeneralLedgerPostingService } from "@/lib/finance/services/GeneralLedgerPostingService";
import { createFinanceWiring } from "@/lib/finance/createFinanceWiring";
import { createPostingContext } from "@/lib/finance/services/PostingContext";
import { JournalPostingService } from "@/lib/finance/services/JournalPostingService";
import { InMemoryEventLineageRepository } from "@/lib/finance/persistence/InMemoryEventLineageRepository";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { NoOpTransactionManager } from "@/lib/persistence/services/shared";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";
import { PostgresPlatformStore } from "@/lib/platform/store/PostgresPlatformStore";
import { StoreProvider } from "@/lib/platform/store/StoreConfiguration";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

const ORG = FINANCE_SEED_ORG_ID;
const PERIOD = "period-2026-07";

function buildDraft(journalId = "journal-gl-001") {
  return {
    entry: {
      id: journalId,
      organizationId: ORG,
      periodId: PERIOD,
      status: "draft" as const,
      correlationId: "corr-gl-001",
    },
    lines: [
      {
        id: "line-gl-debit",
        journalId,
        accountId: "acct-1000",
        debitAmount: 250,
        creditAmount: 0,
        currency: "ZAR",
      },
      {
        id: "line-gl-credit",
        journalId,
        accountId: "acct-2000",
        debitAmount: 0,
        creditAmount: 250,
        currency: "ZAR",
      },
    ],
  };
}

function createPostingStack() {
  const backing = createIsolatedFinanceBacking(false);
  const journalRepository = new InMemoryJournalRepository(backing);
  const generalLedgerRepository = new InMemoryGeneralLedgerRepository(backing);
  const eventLineageRepository = new InMemoryEventLineageRepository(backing);
  const generalLedgerPostingService = new GeneralLedgerPostingService(
    journalRepository,
    generalLedgerRepository,
  );
  const journalPostingService = new JournalPostingService(
    journalRepository,
    eventLineageRepository,
    generalLedgerPostingService,
    new NoOpTransactionManager(),
  );

  return {
    backing,
    journalRepository,
    generalLedgerRepository,
    journalPostingService,
  };
}

describe("GeneralLedgerPostingService (P-009.7D)", () => {
  beforeEach(() => {
    resetDefaultPlatformStoreForTests();
  });

  it("creates ledger entries and updates account balances from posted journal lines", async () => {
    const { journalRepository, generalLedgerRepository, journalPostingService } =
      createPostingStack();
    const draft = buildDraft();
    journalRepository.createDraft(draft);

    const result = await journalPostingService.post(
      createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-gl-001",
        idempotencyKey: "idem-gl-001",
      }),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.ledgerPosting?.mutationCount).toBe(2);
    expect(result.data.ledgerPosting?.entries).toHaveLength(2);
    expect(
      generalLedgerRepository.getEntries(ORG, { journalId: draft.entry.id }),
    ).toHaveLength(2);
    expect(generalLedgerRepository.getAccountBalance(ORG, "acct-1000", PERIOD)?.periodDebit).toBe(
      250,
    );
    expect(generalLedgerRepository.getAccountBalance(ORG, "acct-2000", PERIOD)?.periodCredit).toBe(
      250,
    );
  });

  it("enforces organization isolation for ledger entries", async () => {
    const { journalRepository, generalLedgerRepository, journalPostingService } =
      createPostingStack();
    const draft = buildDraft("journal-gl-org");
    journalRepository.createDraft(draft);

    await journalPostingService.post(
      createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-gl-org",
        idempotencyKey: "idem-gl-org",
      }),
    );

    expect(generalLedgerRepository.getEntries("org-other", { journalId: draft.entry.id })).toHaveLength(
      0,
    );
    expect(generalLedgerRepository.getAccountBalance("org-other", "acct-1000", PERIOD)).toBeNull();
  });

  it("returns duplicate ledger state without double mutation", async () => {
    const { journalRepository, generalLedgerRepository, journalPostingService } =
      createPostingStack();
    const draft = buildDraft("journal-gl-dup");
    journalRepository.createDraft(draft);

    const context = createPostingContext({
      organizationId: ORG,
      journalId: draft.entry.id,
      correlationId: "corr-gl-dup",
      idempotencyKey: "idem-gl-dup",
    });

    await journalPostingService.post(context);
    const second = await journalPostingService.post(context);

    expect(second.success).toBe(true);
    if (!second.success) return;
    expect(second.data.status).toBe("duplicate");
    expect(generalLedgerRepository.getEntries(ORG, { journalId: draft.entry.id })).toHaveLength(2);
  });

  it("rolls back when journal lines are missing", async () => {
    const backing = createIsolatedFinanceBacking(false);
    const journalRepository = new InMemoryJournalRepository(backing);
    const generalLedgerRepository = new InMemoryGeneralLedgerRepository(backing);
    const eventLineageRepository = new InMemoryEventLineageRepository(backing);
    const generalLedgerPostingService = new GeneralLedgerPostingService(
      journalRepository,
      generalLedgerRepository,
    );
    const journalPostingService = new JournalPostingService(
      journalRepository,
      eventLineageRepository,
      generalLedgerPostingService,
      new NoOpTransactionManager(),
    );

    journalRepository.createDraft({
      entry: {
        id: "journal-no-lines",
        organizationId: ORG,
        periodId: PERIOD,
        status: "draft",
      },
      lines: [],
    });

    const result = await journalPostingService.post(
      createPostingContext({
        organizationId: ORG,
        journalId: "journal-no-lines",
        correlationId: "corr-gl-fail",
        idempotencyKey: "idem-gl-fail",
      }),
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.message).toBe("JOURNAL_LINES_NOT_FOUND");
    expect(journalRepository.getById(ORG, "journal-no-lines")?.status).toBe("draft");
    expect(generalLedgerRepository.getEntries(ORG)).toHaveLength(0);
  });
});

describe("GeneralLedgerPostingService PostgreSQL persistence (P-009.7D)", () => {
  it("creates ledger entries within a postgres-backed posting session", async () => {
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
    const draft = buildDraft("journal-pg-gl");
    wiring.journalRepository.createDraft(draft);

    const result = await wiring.journalPosting.post(
      createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-pg-gl",
        idempotencyKey: "idem-pg-gl",
      }),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ledgerPosting?.entries).toHaveLength(2);
      expect(wiring.generalLedger.getEntries(ORG, { journalId: draft.entry.id })).toHaveLength(2);
    }

    await store.shutdown();
  });
});

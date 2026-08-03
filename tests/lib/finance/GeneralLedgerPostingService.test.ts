import { beforeEach, describe, expect, it } from "vitest";
import { createFinanceWiring } from "@/lib/finance/createFinanceWiring";
import { createFinanceRepositories } from "@/lib/finance/persistence/createFinanceRepositories";
import { FINANCE_SEED_ORG_ID } from "@/lib/finance/persistence/createFinanceStore";
import { createIsolatedFinanceBacking } from "@/lib/finance/persistence/FinancePlatformBacking";
import { InMemoryGeneralLedgerRepository } from "@/lib/finance/repositories/InMemoryGeneralLedgerRepository";
import { InMemoryJournalRepository } from "@/lib/finance/persistence/InMemoryJournalRepository";
import { GeneralLedgerPostingService } from "@/lib/finance/services/GeneralLedgerPostingService";
import { createPostingContext } from "@/lib/finance/services/PostingContext";
import { JournalPostingService } from "@/lib/finance/services/JournalPostingService";
import { InMemoryEventLineageRepository } from "@/lib/finance/persistence/InMemoryEventLineageRepository";
import { PostingValidationPipeline } from "@/lib/finance/services/PostingValidationPipeline";
import { PostingValidationService } from "@/lib/finance/services/PostingValidationService";
import { MigrationRegistry } from "@/lib/platform/persistence/MigrationRegistry";
import { MigrationRunner } from "@/lib/platform/persistence/MigrationRunner";
import { bootstrapMigration } from "@/lib/platform/persistence/migrations/bootstrapMigration";
import { NoOpTransactionManager } from "@/lib/persistence/services/shared";
import { PostgresPlatformStore } from "@/lib/platform/store/PostgresPlatformStore";
import { StoreProvider } from "@/lib/platform/store/StoreConfiguration";
import { resetDefaultPlatformStoreForTests } from "@/lib/platform/store/PlatformStoreFactory";
import type { ServiceContext } from "@/types/services";
import { MockDatabaseConnection } from "@/tests/lib/platform/persistence/MockDatabaseConnection";

const ORG = FINANCE_SEED_ORG_ID;
const PERIOD = "period-2026-07";

const serviceContext: ServiceContext = {
  organizationId: ORG,
  userId: "user-finance-001",
  workspaceId: "finance",
  role: "organization_admin",
};

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
        accountId: "coa-1110",
        debitAmount: 250,
        creditAmount: 0,
        currency: "ZAR",
      },
      {
        id: "line-gl-credit",
        journalId,
        accountId: "coa-4200",
        debitAmount: 0,
        creditAmount: 250,
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

function createPostingStack() {
  const backing = createIsolatedFinanceBacking();
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
    createPostingValidationPipeline(backing),
    new NoOpTransactionManager(),
  );

  return {
    backing,
    journalRepository,
    generalLedgerRepository,
    journalPostingService,
  };
}

function postingContextFor(journalId: string, correlationId: string, idempotencyKey: string) {
  return createPostingContext({
    organizationId: ORG,
    journalId,
    correlationId,
    idempotencyKey,
    serviceContext,
    requestMetadata: { journalDate: "2026-07-15" },
  });
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
      postingContextFor(draft.entry.id, "corr-gl-001", "idem-gl-001"),
    );

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.ledgerPosting?.mutationCount).toBe(2);
    expect(result.data.ledgerPosting?.entries).toHaveLength(2);
    expect(
      generalLedgerRepository.getEntries(ORG, { journalId: draft.entry.id }),
    ).toHaveLength(2);
    expect(generalLedgerRepository.getAccountBalance(ORG, "coa-1110", PERIOD)?.periodDebit).toBe(
      250,
    );
    expect(generalLedgerRepository.getAccountBalance(ORG, "coa-4200", PERIOD)?.periodCredit).toBe(
      250,
    );
  });

  it("enforces organization isolation for ledger entries", async () => {
    const { journalRepository, generalLedgerRepository, journalPostingService } =
      createPostingStack();
    const draft = buildDraft("journal-gl-org");
    journalRepository.createDraft(draft);

    await journalPostingService.post(
      postingContextFor(draft.entry.id, "corr-gl-org", "idem-gl-org"),
    );

    expect(generalLedgerRepository.getEntries("org-other", { journalId: draft.entry.id })).toHaveLength(
      0,
    );
    expect(generalLedgerRepository.getAccountBalance("org-other", "coa-1110", PERIOD)).toBeNull();
  });

  it("returns duplicate ledger state without double mutation", async () => {
    const { journalRepository, generalLedgerRepository, journalPostingService } =
      createPostingStack();
    const draft = buildDraft("journal-gl-dup");
    journalRepository.createDraft(draft);

    const context = postingContextFor(draft.entry.id, "corr-gl-dup", "idem-gl-dup");

    await journalPostingService.post(context);
    const second = await journalPostingService.post(context);

    expect(second.success).toBe(true);
    if (!second.success) return;
    expect(second.data.status).toBe("duplicate");
    expect(generalLedgerRepository.getEntries(ORG, { journalId: draft.entry.id })).toHaveLength(2);
  });

  it("rolls back when journal lines are missing", async () => {
    const backing = createIsolatedFinanceBacking();
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
      createPostingValidationPipeline(backing),
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
      postingContextFor("journal-no-lines", "corr-gl-fail", "idem-gl-fail"),
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.message).toBe("NO_LINES");
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
      postingContextFor(draft.entry.id, "corr-pg-gl", "idem-pg-gl"),
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.ledgerPosting?.entries).toHaveLength(2);
      expect(wiring.generalLedger.getEntries(ORG, { journalId: draft.entry.id })).toHaveLength(2);
    }

    await store.shutdown();
  });
});

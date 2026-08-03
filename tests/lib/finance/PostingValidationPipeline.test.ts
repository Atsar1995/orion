import { beforeEach, describe, expect, it } from "vitest";
import { createFinanceRepositories } from "@/lib/finance/persistence/createFinanceRepositories";
import { FINANCE_SEED_ORG_ID } from "@/lib/finance/persistence/createFinanceStore";
import { createIsolatedFinanceBacking } from "@/lib/finance/persistence/FinancePlatformBacking";
import { InMemoryEventLineageRepository } from "@/lib/finance/persistence/InMemoryEventLineageRepository";
import { InMemoryJournalRepository } from "@/lib/finance/persistence/InMemoryJournalRepository";
import { POSTING_VALIDATION_STAGE_ORDER } from "@/lib/finance/services/PostingValidationStage";
import { PostingValidationPipeline } from "@/lib/finance/services/PostingValidationPipeline";
import { PostingValidationService } from "@/lib/finance/services/PostingValidationService";
import { createPostingContext } from "@/lib/finance/services/PostingContext";
import type { ServiceContext } from "@/types/services";

const ORG = FINANCE_SEED_ORG_ID;
const PERIOD_OPEN = "period-2026-07";
const PERIOD_CLOSED = "period-2026-01";

const postingActor: ServiceContext = {
  organizationId: ORG,
  userId: "user-finance-001",
  workspaceId: "finance",
  role: "organization_admin",
};

const readOnlyActor: ServiceContext = {
  organizationId: ORG,
  userId: "user-readonly-001",
  workspaceId: "finance",
  role: "executive",
};

function createValidationPipeline(backing: ReturnType<typeof createIsolatedFinanceBacking>) {
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
  return {
    pipeline: new PostingValidationPipeline(validationService),
    repositories,
    eventLineageRepository,
  };
}

function buildBalancedDraft(
  journalId = "journal-val-001",
  periodId = PERIOD_OPEN,
  organizationId = ORG,
) {
  return {
    entry: {
      id: journalId,
      organizationId,
      periodId,
      status: "draft" as const,
      correlationId: "corr-val-001",
    },
    lines: [
      {
        id: "line-val-debit",
        journalId,
        accountId: "coa-1110",
        debitAmount: 100,
        creditAmount: 0,
        currency: "ZAR",
      },
      {
        id: "line-val-credit",
        journalId,
        accountId: "coa-4200",
        debitAmount: 0,
        creditAmount: 100,
        currency: "ZAR",
      },
    ],
  };
}

describe("PostingValidationPipeline (P-009.8)", () => {
  beforeEach(() => {
    // isolated backing per test
  });

  it("executes validation stages in P-009.3 order", () => {
    const backing = createIsolatedFinanceBacking();
    const { pipeline } = createValidationPipeline(backing);
    const draft = buildBalancedDraft();

    const result = pipeline.validate({
      serviceContext: postingActor,
      postingContext: createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-val-order",
        idempotencyKey: "idem-val-order",
        serviceContext: postingActor,
      }),
      journal: draft.entry,
      lines: draft.lines,
    });

    expect(result.passed).toBe(true);
    expect(result.stagesExecuted).toEqual([...POSTING_VALIDATION_STAGE_ORDER]);
  });

  it("short-circuits on validation failure without running later stages", () => {
    const backing = createIsolatedFinanceBacking();
    const { pipeline } = createValidationPipeline(backing);
    const draft = buildBalancedDraft("journal-unbalanced", PERIOD_OPEN);
    const unbalancedLines = [
      { ...draft.lines[0]!, debitAmount: 100, creditAmount: 0 },
      { ...draft.lines[1]!, debitAmount: 0, creditAmount: 50 },
    ];

    const result = pipeline.validate({
      serviceContext: postingActor,
      postingContext: createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-val-short",
        idempotencyKey: "idem-val-short",
        serviceContext: postingActor,
      }),
      journal: draft.entry,
      lines: unbalancedLines,
    });

    expect(result.passed).toBe(false);
    expect(result.stoppedAt).toBe("journal_balance");
    expect(result.stagesExecuted).not.toContain("authorization");
    expect(result.stagesExecuted).not.toContain("budget");
    expect(result.blockingResult?.code).toBe("BALANCE_MISMATCH");
  });

  it("passes a valid balanced journal through all stages", () => {
    const backing = createIsolatedFinanceBacking();
    const { pipeline } = createValidationPipeline(backing);
    const draft = buildBalancedDraft();

    const result = pipeline.validate({
      serviceContext: postingActor,
      postingContext: createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-val-pass",
        idempotencyKey: "idem-val-pass",
        serviceContext: postingActor,
        requestMetadata: { journalDate: "2026-07-15" },
      }),
      journal: draft.entry,
      lines: draft.lines,
    });

    expect(result.passed).toBe(true);
    expect(result.stageResults.every((stage) => stage.outcome === "pass" || stage.outcome === "warning")).toBe(
      true,
    );
  });

  it("fails authorization when actor lacks posting permission", () => {
    const backing = createIsolatedFinanceBacking();
    const { pipeline } = createValidationPipeline(backing);
    const draft = buildBalancedDraft();

    const result = pipeline.validate({
      serviceContext: readOnlyActor,
      postingContext: createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-val-auth",
        idempotencyKey: "idem-val-auth",
        serviceContext: readOnlyActor,
        requestMetadata: { journalDate: "2026-07-15" },
      }),
      journal: draft.entry,
      lines: draft.lines,
    });

    expect(result.passed).toBe(false);
    expect(result.stoppedAt).toBe("authorization");
    expect(result.blockingResult?.code).toBe("UNAUTHORIZED");
  });

  it("records budget warning when category exceeds soft limit", () => {
    const backing = createIsolatedFinanceBacking();
    const { pipeline } = createValidationPipeline(backing);
    const draft = buildBalancedDraft();

    const result = pipeline.validate({
      serviceContext: postingActor,
      postingContext: createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-val-budget",
        idempotencyKey: "idem-val-budget",
        serviceContext: postingActor,
        requestMetadata: { journalDate: "2026-07-15" },
      }),
      journal: draft.entry,
      lines: draft.lines,
    });

    expect(result.passed).toBe(true);
    expect(result.warnings.some((warning) => warning.code === "BUDGET_SOFT_LIMIT")).toBe(true);
  });

  it("stops posting when fiscal period is closed", () => {
    const backing = createIsolatedFinanceBacking();
    const { pipeline } = createValidationPipeline(backing);
    const draft = buildBalancedDraft("journal-closed-period", PERIOD_CLOSED);

    const result = pipeline.validate({
      serviceContext: postingActor,
      postingContext: createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-val-period",
        idempotencyKey: "idem-val-period",
        serviceContext: postingActor,
        requestMetadata: { journalDate: "2026-01-15" },
      }),
      journal: draft.entry,
      lines: draft.lines,
    });

    expect(result.passed).toBe(false);
    expect(result.stoppedAt).toBe("fiscal_period");
    expect(result.blockingResult?.code).toBe("PERIOD_NOT_OPEN");
  });

  it("stops duplicate journal when idempotency key is already processed", () => {
    const backing = createIsolatedFinanceBacking();
    const { pipeline, repositories } = createValidationPipeline(backing);
    const draft = buildBalancedDraft();
    const idempotencyKey = "idem-val-duplicate";

    repositories.idempotency.markProcessed(ORG, idempotencyKey);

    const result = pipeline.validate({
      serviceContext: postingActor,
      postingContext: createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-val-dup",
        idempotencyKey,
        serviceContext: postingActor,
        requestMetadata: { journalDate: "2026-07-15" },
      }),
      journal: draft.entry,
      lines: draft.lines,
    });

    expect(result.passed).toBe(false);
    expect(result.stoppedAt).toBe("idempotency");
    expect(result.blockingResult?.code).toBe("DUPLICATE_EVENT");
  });

  it("fails organization validation when journal organization mismatches context", () => {
    const backing = createIsolatedFinanceBacking();
    const { pipeline } = createValidationPipeline(backing);
    const draft = buildBalancedDraft("journal-org-mismatch", PERIOD_OPEN, "org-other");

    const result = pipeline.validate({
      serviceContext: postingActor,
      postingContext: createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-val-org",
        idempotencyKey: "idem-val-org",
        serviceContext: postingActor,
      }),
      journal: draft.entry,
      lines: draft.lines,
    });

    expect(result.passed).toBe(false);
    expect(result.stoppedAt).toBe("organization");
    expect(result.blockingResult?.code).toBe("ORGANIZATION_MISMATCH");
  });
});

describe("PostingValidationPipeline integration with JournalPostingService", () => {
  it("prevents ledger mutation when validation fails", async () => {
    const backing = createIsolatedFinanceBacking();
    const journalRepository = new InMemoryJournalRepository(backing);
    const { pipeline, eventLineageRepository } = createValidationPipeline(backing);
    const generalLedgerRepository = createFinanceRepositories(backing).generalLedger;

    const { JournalPostingService } = await import("@/lib/finance/services/JournalPostingService");
    const { GeneralLedgerPostingService } = await import(
      "@/lib/finance/services/GeneralLedgerPostingService"
    );
    const { NoOpTransactionManager } = await import("@/lib/persistence/services/shared");

    const postingService = new JournalPostingService(
      journalRepository,
      eventLineageRepository,
      new GeneralLedgerPostingService(journalRepository, generalLedgerRepository),
      pipeline,
      new NoOpTransactionManager(),
    );

    const draft = buildBalancedDraft("journal-no-post");
    journalRepository.createDraft(draft);

    const result = await postingService.post(
      createPostingContext({
        organizationId: ORG,
        journalId: draft.entry.id,
        correlationId: "corr-val-nopost",
        idempotencyKey: "idem-val-nopost",
        serviceContext: readOnlyActor,
      }),
    );

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.error.message).toBe("UNAUTHORIZED");
    expect(journalRepository.getById(ORG, draft.entry.id)?.status).toBe("draft");
    expect(eventLineageRepository.listByOrganization(ORG)).toHaveLength(0);
    expect(generalLedgerRepository.getEntries(ORG, { journalId: draft.entry.id })).toHaveLength(0);
  });
});

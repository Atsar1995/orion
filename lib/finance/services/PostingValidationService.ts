import { defaultFinanceAuthorizationService } from "@/lib/finance/security/FinanceAuthorizationService";
import { PeriodRulesEngine } from "@/lib/finance/fiscal-period/PeriodRulesEngine";
import type { ChartOfAccountsRepository } from "@/lib/finance/repositories/ChartOfAccountsRepository";
import type { EventLineageRepository } from "@/lib/finance/repositories/EventLineageRepository";
import type { FinancialIntelligenceRepository } from "@/lib/finance/repositories/FinancialIntelligenceRepository";
import type { GeneralLedgerRepository } from "@/lib/finance/repositories/GeneralLedgerRepository";
import type { IdempotencyRepository } from "@/lib/finance/repositories/IdempotencyRepository";
import type { PostingContext } from "@/lib/finance/services/PostingContext";
import type {
  PostingValidationOutcome,
  PostingValidationStageName,
  PostingValidationStageResult,
} from "@/lib/finance/services/PostingValidationStage";
import type { JournalEntryRecord, JournalLineRecord } from "@/types/finance-ledger";
import type { ServiceContext } from "@/types/services";

/** Input bundle for a single posting validation run. */
export type PostingValidationInput = {
  readonly serviceContext: ServiceContext;
  readonly postingContext: PostingContext;
  readonly journal: JournalEntryRecord;
  readonly lines: readonly JournalLineRecord[];
};

const ISO_CURRENCY = /^[A-Z]{3}$/;

/** Independent posting validators — one method per stage (P-009.8). */
export class PostingValidationService {
  private readonly periodRules: PeriodRulesEngine;

  constructor(
    private readonly chartOfAccountsRepository: ChartOfAccountsRepository,
    private readonly idempotencyRepository: IdempotencyRepository,
    private readonly eventLineageRepository: EventLineageRepository,
    private readonly generalLedgerRepository: GeneralLedgerRepository,
    private readonly financialIntelligenceRepository: FinancialIntelligenceRepository,
    periodRepository: ConstructorParameters<typeof PeriodRulesEngine>[0],
  ) {
    this.periodRules = new PeriodRulesEngine(periodRepository);
  }

  /** Executes one validation stage — no cross-stage calls. */
  validateStage(
    stage: PostingValidationStageName,
    input: PostingValidationInput,
  ): PostingValidationStageResult {
    switch (stage) {
      case "organization":
        return this.validateOrganization(input);
      case "fiscal_period":
        return this.validateFiscalPeriod(input);
      case "idempotency":
        return this.validateIdempotency(input);
      case "account":
        return this.validateAccount(input);
      case "currency":
        return this.validateCurrency(input);
      case "journal_balance":
        return this.validateJournalBalance(input);
      case "authorization":
        return this.validateAuthorization(input);
      case "budget":
        return this.validateBudget(input);
      default: {
        const exhaustive: never = stage;
        return this.stageResult(exhaustive, "fail", "UNKNOWN_STAGE", "Unknown validation stage");
      }
    }
  }

  private validateOrganization(input: PostingValidationInput): PostingValidationStageResult {
    const stage: PostingValidationStageName = "organization";

    if (input.journal.organizationId !== input.serviceContext.organizationId) {
      return this.stageResult(
        stage,
        "fail",
        "ORGANIZATION_MISMATCH",
        "Journal organization does not match service context",
        "organizationId",
      );
    }

    if (input.postingContext.organizationId !== input.serviceContext.organizationId) {
      return this.stageResult(
        stage,
        "fail",
        "ORGANIZATION_MISMATCH",
        "Posting context organization does not match service context",
        "organizationId",
      );
    }

    const companyId = input.postingContext.requestMetadata?.companyId;
    if (companyId && companyId !== input.serviceContext.organizationId) {
      return this.stageResult(
        stage,
        "fail",
        "INVALID_COMPANY",
        "Company is not valid for organization",
        "companyId",
      );
    }

    return this.stageResult(stage, "pass", "VAL-ORG-001");
  }

  private validateFiscalPeriod(input: PostingValidationInput): PostingValidationStageResult {
    const stage: PostingValidationStageName = "fiscal_period";
    const periodIssues = this.periodRules.validatePosting(
      input.serviceContext.organizationId,
      input.journal.periodId,
    );

    if (periodIssues.length > 0) {
      const issue = periodIssues[0]!;
      const outcome: PostingValidationOutcome =
        issue.code === "PERIOD_NOT_OPEN" || issue.code === "PERIOD_CLOSED"
          ? "stop"
          : "fail";
      return this.stageResult(stage, outcome, issue.code, issue.message, issue.field);
    }

    const resolvedDate = this.resolveJournalDate(input);
    const dateIssues = this.periodRules.validateDateInPeriod(
      input.serviceContext.organizationId,
      resolvedDate,
      input.journal.periodId,
    );

    if (dateIssues.length > 0) {
      const issue = dateIssues[0]!;
      return this.stageResult(stage, "fail", issue.code, issue.message, issue.field);
    }

    return this.stageResult(stage, "pass", "VAL-PER-001");
  }

  private validateIdempotency(input: PostingValidationInput): PostingValidationStageResult {
    const stage: PostingValidationStageName = "idempotency";
    const { organizationId } = input.serviceContext;
    const { idempotencyKey, eventId } = input.postingContext;

    if (this.idempotencyRepository.exists(organizationId, idempotencyKey)) {
      return this.stageResult(
        stage,
        "stop",
        "DUPLICATE_EVENT",
        "Idempotency key already processed",
        "idempotencyKey",
      );
    }

    const lineageByKey = this.eventLineageRepository.getByEventId(organizationId, idempotencyKey);
    if (
      lineageByKey &&
      (lineageByKey.processingStatus === "completed" ||
        lineageByKey.processingStatus === "processing")
    ) {
      return this.stageResult(
        stage,
        "stop",
        "DUPLICATE_EVENT",
        "Posting already recorded for idempotency key",
        "idempotencyKey",
      );
    }

    if (eventId) {
      const lineageByEvent = this.eventLineageRepository.getByEventId(organizationId, eventId);
      if (
        lineageByEvent &&
        (lineageByEvent.processingStatus === "completed" ||
          lineageByEvent.processingStatus === "processing")
      ) {
        return this.stageResult(
          stage,
          "fail",
          "DUPLICATE_EVENT_ID",
          "Event identifier already processed",
          "eventId",
        );
      }
    }

    if (this.generalLedgerRepository.findPostingByIdempotencyKey(organizationId, idempotencyKey)) {
      return this.stageResult(
        stage,
        "stop",
        "DUPLICATE_POSTING",
        "Ledger posting already exists for idempotency key",
        "idempotencyKey",
      );
    }

    return this.stageResult(stage, "pass", "VAL-IDP-001");
  }

  private validateAccount(input: PostingValidationInput): PostingValidationStageResult {
    const stage: PostingValidationStageName = "account";
    const { organizationId } = input.serviceContext;

    for (const line of input.lines) {
      const account = this.chartOfAccountsRepository.findById(organizationId, line.accountId);
      if (!account) {
        return this.stageResult(
          stage,
          "fail",
          "ACCOUNT_NOT_FOUND",
          `Account ${line.accountId} not found`,
          "accountId",
        );
      }

      if (account.status !== "active") {
        return this.stageResult(
          stage,
          "fail",
          "ACCOUNT_INACTIVE",
          `Account ${account.code} is not active`,
          "accountId",
        );
      }

      if (!account.postingAllowed) {
        return this.stageResult(
          stage,
          "stop",
          "NON_POSTING_ACCOUNT",
          `Account ${account.code} does not allow posting`,
          "accountId",
        );
      }
    }

    return this.stageResult(stage, "pass", "VAL-ACC-001");
  }

  private validateCurrency(input: PostingValidationInput): PostingValidationStageResult {
    const stage: PostingValidationStageName = "currency";

    if (input.lines.length === 0) {
      return this.stageResult(stage, "fail", "NO_LINES", "Journal has no lines", "lines");
    }

    const currencies = new Set(input.lines.map((line) => line.currency));
    if (currencies.size > 1) {
      return this.stageResult(
        stage,
        "fail",
        "CURRENCY_MISMATCH",
        "All journal lines must share the same currency",
        "currency",
      );
    }

    const currency = input.lines[0]!.currency;
    if (!ISO_CURRENCY.test(currency)) {
      return this.stageResult(
        stage,
        "fail",
        "INVALID_CURRENCY",
        "Currency must be a 3-letter ISO code",
        "currency",
      );
    }

    if (currency === "XXX") {
      return this.stageResult(
        stage,
        "fail",
        "INACTIVE_CURRENCY",
        "Currency is not active for posting",
        "currency",
      );
    }

    const foreignCurrency = input.postingContext.requestMetadata?.foreignCurrency === "true";
    if (foreignCurrency && !input.postingContext.requestMetadata?.exchangeRate) {
      return this.stageResult(
        stage,
        "fail",
        "EXCHANGE_RATE_REQUIRED",
        "Exchange rate required for foreign currency journal",
        "exchangeRate",
      );
    }

    return this.stageResult(stage, "pass", "VAL-CUR-001");
  }

  private validateJournalBalance(input: PostingValidationInput): PostingValidationStageResult {
    const stage: PostingValidationStageName = "journal_balance";

    if (input.lines.length < 2) {
      return this.stageResult(
        stage,
        "fail",
        "MIN_LINES",
        "Journal requires at least two lines",
        "lines",
      );
    }

    for (const line of input.lines) {
      if (line.debitAmount < 0 || line.creditAmount < 0) {
        return this.stageResult(
          stage,
          "fail",
          "NEGATIVE_AMOUNT",
          "Line amounts cannot be negative",
          "lines",
        );
      }

      if (line.debitAmount > 0 && line.creditAmount > 0) {
        return this.stageResult(
          stage,
          "fail",
          "INVALID_LINE",
          "Line cannot have both debit and credit",
          "lines",
        );
      }

      if (line.debitAmount === 0 && line.creditAmount === 0) {
        return this.stageResult(
          stage,
          "fail",
          "ZERO_LINE",
          "Line must have a debit or credit amount",
          "lines",
        );
      }
    }

    const totalDebit = input.lines.reduce((sum, line) => sum + line.debitAmount, 0);
    const totalCredit = input.lines.reduce((sum, line) => sum + line.creditAmount, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.0001) {
      return this.stageResult(
        stage,
        "stop",
        "BALANCE_MISMATCH",
        "Total debits must equal total credits",
        "lines",
      );
    }

    return this.stageResult(stage, "pass", "VAL-BAL-001");
  }

  private validateAuthorization(input: PostingValidationInput): PostingValidationStageResult {
    const stage: PostingValidationStageName = "authorization";
    const { userId } = input.serviceContext;

    if (!userId.trim()) {
      return this.stageResult(
        stage,
        "fail",
        "ACTOR_REQUIRED",
        "Posting actor is required",
        "userId",
      );
    }

    if (!defaultFinanceAuthorizationService.canPostJournal(input.serviceContext)) {
      return this.stageResult(
        stage,
        "stop",
        "UNAUTHORIZED",
        "Actor does not have permission to post journals",
        "role",
      );
    }

    const requiresApproval = input.postingContext.requestMetadata?.requiresApproval === "true";
    if (requiresApproval && !input.postingContext.requestMetadata?.approvalReference) {
      return this.stageResult(
        stage,
        "fail",
        "APPROVAL_REQUIRED",
        "Approval reference required for material journal",
        "approvalReference",
      );
    }

    return this.stageResult(stage, "pass", "VAL-AUTH-001");
  }

  private validateBudget(input: PostingValidationInput): PostingValidationStageResult {
    const stage: PostingValidationStageName = "budget";
    const { organizationId } = input.serviceContext;
    const budgetActuals = this.financialIntelligenceRepository.listBudgetActuals(
      organizationId,
      input.journal.periodId,
    );

    if (budgetActuals.length === 0) {
      return this.stageResult(
        stage,
        "warning",
        "NO_ACTIVE_BUDGET",
        "No active budget version for period",
      );
    }

    for (const line of input.lines) {
      const account = this.chartOfAccountsRepository.findById(organizationId, line.accountId);
      if (account?.costCentreRequired) {
        const costCentre =
          input.postingContext.requestMetadata?.[`costCentre:${line.id}`] ??
          input.postingContext.requestMetadata?.costCentre;
        if (!costCentre?.trim()) {
          return this.stageResult(
            stage,
            "stop",
            "COST_CENTRE_REQUIRED",
            `Cost centre required for account ${account.code}`,
            "costCentre",
          );
        }
      }
    }

    const postingAmount = input.lines.reduce(
      (sum, line) => sum + Math.max(line.debitAmount, line.creditAmount),
      0,
    );

    let softLimitHit = false;

    for (const record of budgetActuals) {
      const softLimit = record.budgetAmount;
      const hardLimit = record.budgetAmount * 1.2;
      const projected = record.actualAmount + postingAmount;

      if (record.actualAmount < hardLimit && projected > hardLimit) {
        return this.stageResult(
          stage,
          "stop",
          "BUDGET_EXCEEDED",
          `Budget hard limit exceeded for ${record.category}`,
          "budget",
        );
      }

      if (record.actualAmount > softLimit || projected > softLimit) {
        softLimitHit = true;
      }
    }

    if (softLimitHit) {
      return this.stageResult(
        stage,
        "warning",
        "BUDGET_SOFT_LIMIT",
        "Budget soft limit exceeded for one or more categories",
      );
    }

    void postingAmount;
    return this.stageResult(stage, "pass", "BUD-001");
  }

  private resolveJournalDate(input: PostingValidationInput): string {
    if (input.postingContext.requestMetadata?.journalDate) {
      return input.postingContext.requestMetadata.journalDate;
    }

    const period = input.journal.periodId.match(/period-(\d{4})-(\d{2})/);
    if (period) {
      return `${period[1]}-${period[2]}-15`;
    }

    return "2026-07-15";
  }

  private stageResult(
    stage: PostingValidationStageName,
    outcome: PostingValidationOutcome,
    code?: string,
    message?: string,
    field?: string,
  ): PostingValidationStageResult {
    return {
      stage,
      outcome,
      code,
      message,
      field,
    };
  }
}

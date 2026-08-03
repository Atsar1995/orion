import type { GeneralLedgerRepository } from "@/lib/finance/repositories/GeneralLedgerRepository";
import type { JournalRepository } from "@/lib/finance/repositories/JournalRepository";
import type { GeneralLedgerMutation } from "@/lib/finance/services/GeneralLedgerMutation";
import type { LedgerPostingContext } from "@/lib/finance/services/LedgerPostingContext";
import type { LedgerPostingResult } from "@/lib/finance/services/LedgerPostingResult";
import type { JournalLineRecord } from "@/types/finance-ledger";
import type { ServiceResult } from "@/types/services";
import { ServiceErrorCode } from "@/types/services";

/** Applies posted journal lines to the general ledger within the posting UoW (P-009.7D). */
export class GeneralLedgerPostingService {
  constructor(
    private readonly journalRepository: JournalRepository,
    private readonly generalLedgerRepository: GeneralLedgerRepository,
  ) {}

  /** Mutates ledger entries and balances for a posted journal — no validation rules. */
  postToLedger(context: LedgerPostingContext): ServiceResult<LedgerPostingResult> {
    const existingPosting = this.generalLedgerRepository.findPostingByIdempotencyKey(
      context.organizationId,
      context.idempotencyKey,
    );
    if (existingPosting) {
      const entries = this.generalLedgerRepository.getEntries(context.organizationId, {
        journalId: context.journalId,
        periodId: context.periodId,
      });
      return {
        success: true,
        data: {
          organizationId: context.organizationId,
          journalId: context.journalId,
          postingId: existingPosting.id,
          mutationCount: entries.length,
          accountIds: [...new Set(entries.map((entry) => entry.accountId))],
          entries,
        },
      };
    }

    const lines = this.journalRepository.listLines(context.organizationId, context.journalId);
    if (lines.length === 0) {
      return {
        success: false,
        error: {
          code: ServiceErrorCode.Validation,
          message: "JOURNAL_LINES_NOT_FOUND",
          details: { journalId: context.journalId },
        },
      };
    }

    const mutations = lines.map((line) =>
      this.createMutationFromLine(line, context),
    );
    const entries = this.generalLedgerRepository.applyMutations(mutations);

    return {
      success: true,
      data: {
        organizationId: context.organizationId,
        journalId: context.journalId,
        postingId: `posting-${context.journalId}`,
        mutationCount: mutations.length,
        accountIds: [...new Set(mutations.map((mutation) => mutation.accountId))],
        entries,
      },
    };
  }

  private createMutationFromLine(
    line: JournalLineRecord,
    context: LedgerPostingContext,
  ): GeneralLedgerMutation {
    return {
      organizationId: context.organizationId,
      accountId: line.accountId,
      periodId: context.periodId,
      journalId: context.journalId,
      journalLineId: line.id,
      debitAmount: line.debitAmount,
      creditAmount: line.creditAmount,
      currency: line.currency,
      postedAt: context.postedAt,
      correlationId: context.correlationId,
      idempotencyKey: context.idempotencyKey,
      metadata: context.requestMetadata,
    };
  }
}

import type { EventLineageRepository } from "@/lib/finance/repositories/EventLineageRepository";
import type { JournalRepository } from "@/lib/finance/repositories/JournalRepository";
import { GeneralLedgerPostingService } from "@/lib/finance/services/GeneralLedgerPostingService";
import {
  createPostingContext,
  resolvePostingLineageId,
  type PostingContext,
} from "@/lib/finance/services/PostingContext";
import type { PostingResult } from "@/lib/finance/services/PostingResult";
import type { PostingTransaction } from "@/lib/finance/services/PostingTransaction";
import { PostingValidationPipeline } from "@/lib/finance/services/PostingValidationPipeline";
import type { TransactionManager } from "@/lib/persistence/services/shared";
import type { ServiceContext } from "@/types/services";
import type { ServiceResult } from "@/types/services";
import { ServiceErrorCode } from "@/types/services";

/** Finance journal posting orchestration — repository UoW (P-009.7C · P-009.7D · P-009.8). */
export class JournalPostingService {
  constructor(
    private readonly journalRepository: JournalRepository,
    private readonly eventLineageRepository: EventLineageRepository,
    private readonly generalLedgerPostingService: GeneralLedgerPostingService,
    private readonly postingValidationPipeline: PostingValidationPipeline,
    private readonly transactionManager: TransactionManager,
  ) {}

  /** Executes the posting pipeline within a PlatformStore transaction boundary. */
  async post(input: PostingContext): Promise<ServiceResult<PostingResult>> {
    const context = createPostingContext(input);
    const duplicate = this.findCompletedDuplicate(context);
    if (duplicate) {
      return {
        success: true,
        data: duplicate,
      };
    }

    const beginResult = await this.transactionManager.beginTransaction();
    if (!beginResult.success) {
      return {
        success: false,
        error: {
          code: ServiceErrorCode.Dependency,
          message: beginResult.error.message,
        },
      };
    }

    const postingTransaction: PostingTransaction = {
      persistenceTransaction: beginResult.data,
      context,
      lineageId: resolvePostingLineageId(context),
    };

    try {
      const outcome = this.executePostingPipeline(postingTransaction);
      if (!outcome.success) {
        await this.transactionManager.rollback(postingTransaction.persistenceTransaction);
        return outcome;
      }

      const commitResult = await this.transactionManager.commit(
        postingTransaction.persistenceTransaction,
      );
      if (!commitResult.success) {
        await this.transactionManager.rollback(postingTransaction.persistenceTransaction);
        return {
          success: false,
          error: {
            code: ServiceErrorCode.Dependency,
            message: commitResult.error.message,
          },
        };
      }

      return outcome;
    } catch (error) {
      await this.transactionManager.rollback(postingTransaction.persistenceTransaction);
      return {
        success: false,
        error: {
          code: ServiceErrorCode.Unknown,
          message: error instanceof Error ? error.message : "POSTING_TRANSACTION_FAILED",
        },
      };
    }
  }

  private findCompletedDuplicate(context: PostingContext): PostingResult | null {
    const lineageId = resolvePostingLineageId(context);
    const byIdempotency =
      this.eventLineageRepository.getByEventId(context.organizationId, context.idempotencyKey) ??
      this.eventLineageRepository.getByEventId(
        context.organizationId,
        context.eventId ?? context.idempotencyKey,
      );

    const completed =
      byIdempotency?.processingStatus === "completed"
        ? byIdempotency
        : this.eventLineageRepository.exists(context.organizationId, lineageId)
          ? this.eventLineageRepository
              .listByOrganization(context.organizationId)
              .find(
                (record) =>
                  record.id === lineageId &&
                  record.processingStatus === "completed" &&
                  record.correlationId === context.correlationId,
              )
          : undefined;

    if (!completed?.journalId) {
      return null;
    }

    const journal = this.journalRepository.getById(context.organizationId, completed.journalId);
    if (!journal) {
      return null;
    }

    const ledgerResult = this.generalLedgerPostingService.postToLedger({
      organizationId: context.organizationId,
      journalId: completed.journalId,
      periodId: journal.periodId,
      correlationId: context.correlationId,
      idempotencyKey: context.idempotencyKey,
      postedAt: completed.createdAt,
      journal,
      requestMetadata: context.requestMetadata,
    });

    return {
      organizationId: context.organizationId,
      journalId: completed.journalId,
      correlationId: context.correlationId,
      idempotencyKey: context.idempotencyKey,
      lineageId: completed.id,
      transactionId: "duplicate",
      status: "duplicate",
      processingStatus: "completed",
      ledgerPosting: ledgerResult.success ? ledgerResult.data : undefined,
    };
  }

  private executePostingPipeline(
    postingTransaction: PostingTransaction,
  ): ServiceResult<PostingResult> {
    const { context, lineageId } = postingTransaction;

    const journal = this.journalRepository.getById(context.organizationId, context.journalId);
    if (!journal) {
      return {
        success: false,
        error: {
          code: ServiceErrorCode.Validation,
          message: "JOURNAL_NOT_FOUND",
          details: { journalId: context.journalId },
        },
      };
    }

    if (journal.status !== "draft") {
      return {
        success: false,
        error: {
          code: ServiceErrorCode.Validation,
          message: "JOURNAL_NOT_DRAFT",
          details: { journalId: context.journalId, status: journal.status },
        },
      };
    }

    const lines = this.journalRepository.listLines(context.organizationId, context.journalId);
    const serviceContext = this.resolveServiceContext(context);
    const validationResult = this.postingValidationPipeline.validate({
      serviceContext,
      postingContext: context,
      journal,
      lines,
    });

    if (!validationResult.passed) {
      const blocking = validationResult.blockingResult;
      return {
        success: false,
        error: {
          code: ServiceErrorCode.Validation,
          message: blocking?.code ?? "POSTING_VALIDATION_FAILED",
          details: {
            stage: validationResult.stoppedAt ?? "unknown",
            ...(blocking?.field ? { field: blocking.field } : {}),
            ...(blocking?.message ? { validationMessage: blocking.message } : {}),
          },
        },
      };
    }

    const now = new Date().toISOString();
    this.eventLineageRepository.record({
      id: lineageId,
      organizationId: context.organizationId,
      correlationId: context.correlationId,
      financialEventId: context.eventId ?? context.idempotencyKey,
      journalId: context.journalId,
      createdAt: now,
      replayCount: 0,
      processingStatus: "processing",
    });

    const updated = this.journalRepository.updateStatus(
      context.organizationId,
      context.journalId,
      "posted",
    );
    if (!updated) {
      return {
        success: false,
        error: {
          code: ServiceErrorCode.Dependency,
          message: "JOURNAL_STATUS_UPDATE_FAILED",
        },
      };
    }

    const ledgerResult = this.generalLedgerPostingService.postToLedger({
      organizationId: context.organizationId,
      journalId: updated.id,
      periodId: updated.periodId,
      correlationId: context.correlationId,
      idempotencyKey: context.idempotencyKey,
      postedAt: now,
      postedBy: context.requestMetadata?.postedBy,
      journal: updated,
      requestMetadata: context.requestMetadata,
    });

    if (!ledgerResult.success) {
      this.journalRepository.updateStatus(context.organizationId, context.journalId, "draft");
      return ledgerResult;
    }

    this.eventLineageRepository.updateProcessingStatus(
      context.organizationId,
      lineageId,
      "completed",
    );

    return {
      success: true,
      data: {
        organizationId: context.organizationId,
        journalId: context.journalId,
        correlationId: context.correlationId,
        idempotencyKey: context.idempotencyKey,
        lineageId,
        transactionId: postingTransaction.persistenceTransaction.transactionId,
        status: "posted",
        processingStatus: "completed",
        ledgerPosting: ledgerResult.data,
        validation: validationResult,
      },
    };
  }

  private resolveServiceContext(context: PostingContext): ServiceContext {
    if (context.serviceContext) {
      return context.serviceContext;
    }

    return {
      organizationId: context.organizationId,
      userId: context.requestMetadata?.postedBy ?? "system-posting",
      workspaceId: "finance",
      role: "service_account",
    };
  }
}

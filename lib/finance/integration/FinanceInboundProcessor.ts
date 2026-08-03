import {
  buildHcmFinanceIdempotencyKey,
  mapHcmEventToJournalDraft,
  mapHcmEventToPostingContext,
  validateHcmContractPayload,
  type HcmFinanceEventType,
} from "@/lib/finance/integration/FinanceEventMapper";
import type { FinanceEventResult } from "@/lib/finance/integration/FinanceEventResult";
import type { EventLineageRepository } from "@/lib/finance/repositories/EventLineageRepository";
import type { JournalRepository } from "@/lib/finance/repositories/JournalRepository";
import type { JournalPostingService } from "@/lib/finance/services/JournalPostingService";
import type { IntelligenceEvent } from "@/types/intelligence-integration";
import type { ServiceContext } from "@/types/services";

/** Executes the governed HCM → Finance posting pipeline (P-009.9). */
export class FinanceInboundProcessor {
  constructor(
    private readonly journalRepository: JournalRepository,
    private readonly eventLineageRepository: EventLineageRepository,
    private readonly journalPostingService: JournalPostingService,
  ) {}

  /** Processes an inbound HCM event through journal creation and posting. */
  async process(
    event: IntelligenceEvent,
    context: ServiceContext,
    eventType: HcmFinanceEventType,
  ): Promise<FinanceEventResult> {
    if (event.organizationId !== context.organizationId) {
      return this.reject(event, eventType, "ORGANIZATION_MISMATCH", "Event organization mismatch");
    }

    const contractIssue = validateHcmContractPayload(event, eventType);
    if (contractIssue) {
      return this.reject(event, eventType, contractIssue, "Contract validation failed");
    }

    const idempotencyKey = buildHcmFinanceIdempotencyKey(event, eventType);
    const duplicateLineage = this.eventLineageRepository.getByEventId(
      context.organizationId,
      idempotencyKey,
    );
    if (duplicateLineage?.processingStatus === "completed") {
      return {
        status: "duplicate",
        eventId: event.eventId,
        eventType,
        journalId: duplicateLineage.journalId,
        lineageId: duplicateLineage.id,
        code: "DUPLICATE_EVENT",
        message: "Inbound event already processed",
      };
    }

    const draft = mapHcmEventToJournalDraft(event, eventType);
    if (!this.journalRepository.exists(context.organizationId, draft.entry.id)) {
      this.journalRepository.createDraft(draft);
    }

    const postingContext = mapHcmEventToPostingContext(
      draft.entry.id,
      event,
      eventType,
      this.resolveServiceContext(event, context),
    );

    const postResult = await this.journalPostingService.post(postingContext);
    if (!postResult.success) {
      return {
        status: "failed",
        eventId: event.eventId,
        eventType,
        journalId: draft.entry.id,
        code: postResult.error.message,
        message: postResult.error.message,
      };
    }

    if (postResult.data.status === "duplicate") {
      return {
        status: "duplicate",
        eventId: event.eventId,
        eventType,
        journalId: postResult.data.journalId,
        lineageId: postResult.data.lineageId,
        transactionId: postResult.data.transactionId,
        code: "DUPLICATE_EVENT",
        message: "Duplicate inbound event short-circuited",
      };
    }

    return {
      status: "processed",
      eventId: event.eventId,
      eventType,
      journalId: postResult.data.journalId,
      lineageId: postResult.data.lineageId,
      transactionId: postResult.data.transactionId,
    };
  }

  private resolveServiceContext(
    event: IntelligenceEvent,
    context: ServiceContext,
  ): ServiceContext {
    return {
      organizationId: context.organizationId,
      userId: event.actorId || context.userId,
      workspaceId: context.workspaceId ?? "finance",
      role: "service_account",
      correlationId: event.correlationId,
    };
  }

  private reject(
    event: IntelligenceEvent,
    eventType: HcmFinanceEventType,
    code: string,
    message: string,
  ): FinanceEventResult {
    return {
      status: "rejected",
      eventId: event.eventId,
      eventType,
      code,
      message,
    };
  }
}

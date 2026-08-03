import type { JournalPostingService } from "@/lib/finance/services/JournalPostingService";
import type { PostingContext } from "@/lib/finance/services/PostingContext";
import {
  createPostingContext,
  createPostingCorrelationId,
} from "@/lib/finance/services/PostingContext";
import type { PostingResult } from "@/lib/finance/services/PostingResult";
import type { ServiceContext, ServiceResult } from "@/types/services";
import { ServiceErrorCode } from "@/types/services";

/** Posting service contract — delegates to {@link JournalPostingService}. */
export type PostingService = {
  postJournal(
    context: ServiceContext,
    journalId: string,
    options?: PostingRequestOptions,
  ): Promise<ServiceResult<PostingResult>>;
};

export type PostingRequestOptions = {
  readonly correlationId?: string;
  readonly idempotencyKey?: string;
  readonly eventId?: string;
  readonly requestMetadata?: Readonly<Record<string, string>>;
};

export class DefaultPostingService implements PostingService {
  constructor(private readonly journalPostingService: JournalPostingService) {}

  postJournal(
    context: ServiceContext,
    journalId: string,
    options: PostingRequestOptions = {},
  ): Promise<ServiceResult<PostingResult>> {
    const postingContext: PostingContext = createPostingContext({
      organizationId: context.organizationId,
      journalId,
      correlationId: options.correlationId ?? createPostingCorrelationId(),
      idempotencyKey: options.idempotencyKey ?? `${journalId}:${options.correlationId ?? journalId}`,
      eventId: options.eventId,
      requestMetadata: options.requestMetadata,
      serviceContext: context,
    });

    return this.journalPostingService.post(postingContext);
  }
}

export class StubPostingService implements PostingService {
  async postJournal(): Promise<ServiceResult<PostingResult>> {
    return {
      success: false,
      error: {
        code: ServiceErrorCode.NotImplemented,
        message: "Posting not implemented until P-009.7C wiring",
      },
    };
  }
}

export const stubPostingService = new StubPostingService();

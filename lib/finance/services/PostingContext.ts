import { randomUUID } from "crypto";

/** Posting orchestration input — infrastructure metadata only (P-009.7C). */
export type PostingContext = {
  readonly organizationId: string;
  readonly journalId: string;
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly eventId?: string;
  readonly requestMetadata?: Readonly<Record<string, string>>;
};

/** Creates a posting context with required correlation and idempotency fields. */
export function createPostingContext(
  input: PostingContext,
): PostingContext {
  return {
    organizationId: input.organizationId,
    journalId: input.journalId,
    correlationId: input.correlationId,
    idempotencyKey: input.idempotencyKey.trim(),
    eventId: input.eventId,
    requestMetadata: input.requestMetadata,
  };
}

/** Resolves the lineage identifier used for idempotency tracking. */
export function resolvePostingLineageId(context: PostingContext): string {
  return `lineage-post-${context.idempotencyKey}`;
}

/** Generates a correlation identifier when callers do not supply one. */
export function createPostingCorrelationId(): string {
  return randomUUID();
}

import type { LedgerPostingResult } from "@/lib/finance/services/LedgerPostingResult";

/** Outcome of a journal posting unit-of-work (P-009.7C · P-009.7D). */
export type PostingResult = {
  readonly organizationId: string;
  readonly journalId: string;
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly lineageId: string;
  readonly transactionId: string;
  readonly status: "posted" | "duplicate";
  readonly processingStatus: "completed";
  readonly ledgerPosting?: LedgerPostingResult;
};

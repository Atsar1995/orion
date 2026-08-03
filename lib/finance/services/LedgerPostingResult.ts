import type { LedgerEntryRecord } from "@/types/finance-general-ledger";

/** Outcome of general ledger mutation for a posted journal (P-009.7D). */
export type LedgerPostingResult = {
  readonly organizationId: string;
  readonly journalId: string;
  readonly postingId: string;
  readonly mutationCount: number;
  readonly accountIds: readonly string[];
  readonly entries: readonly LedgerEntryRecord[];
};

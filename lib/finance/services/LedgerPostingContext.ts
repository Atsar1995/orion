import type { JournalEntryRecord } from "@/types/finance-ledger";

/** General ledger posting input for a posted journal (P-009.7D). */
export type LedgerPostingContext = {
  readonly organizationId: string;
  readonly journalId: string;
  readonly periodId: string;
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly postedAt: string;
  readonly postedBy?: string;
  readonly journal: JournalEntryRecord;
  readonly requestMetadata?: Readonly<Record<string, string>>;
};

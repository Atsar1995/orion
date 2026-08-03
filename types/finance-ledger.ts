/**
 * Finance Domain — ledger types (Mission P-009.1+).
 * Chart of Accounts: types/finance-chart-of-accounts.ts
 * @see docs/Finance/Blueprints/D-009_Enterprise_Ledger_Principles.md
 */

export type { ChartOfAccountRecord } from "@/types/finance-chart-of-accounts";

/** Journal entry — implementation P-009.3+. */
export type JournalEntryRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly periodId: string;
  readonly status: "draft" | "posted" | "reversed";
  readonly correlationId?: string;
  readonly idempotencyKey?: string;
};

/** Journal line — interface placeholder only. */
export type JournalLineRecord = {
  readonly id: string;
  readonly journalId: string;
  readonly accountId: string;
  readonly debitAmount: number;
  readonly creditAmount: number;
  readonly currency: string;
};

export type EventLineageProcessingStatus = "pending" | "processing" | "completed" | "failed";

/** Event lineage link — traces business event to future journal. */
export type EventLineageRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly correlationId: string;
  readonly businessEventId?: string;
  readonly financialEventId?: string;
  readonly journalId?: string;
  readonly createdAt: string;
  readonly replayCount?: number;
  readonly processingStatus?: EventLineageProcessingStatus;
};

/** Journal draft aggregate input — persistence layer only (P-009.7B). */
export type JournalDraftInput = {
  readonly entry: JournalEntryRecord;
  readonly lines: readonly JournalLineRecord[];
};

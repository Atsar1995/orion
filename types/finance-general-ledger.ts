/**
 * Finance Domain — General Ledger types (Mission P-009.3).
 * @see docs/Finance/Blueprints/D-009_Enterprise_Ledger_Principles.md
 */

/** Ledger-produced event types (D-008 extension). */
export type LedgerEventType =
  | "LedgerUpdated"
  | "LedgerBalanced"
  | "LedgerClosed"
  | "LedgerReconciled"
  | "LedgerValidationFailed";

/** Authoritative ledger balance for an account in a period. */
export type LedgerBalanceRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly accountId: string;
  readonly periodId: string;
  readonly currency: string;
  readonly openingDebit: number;
  readonly openingCredit: number;
  readonly periodDebit: number;
  readonly periodCredit: number;
  readonly closingDebit: number;
  readonly closingCredit: number;
  readonly runningBalance: number;
  readonly updatedAt: string;
};

/** Single line in a ledger posting (not a journal — P-009.4). */
export type LedgerPostingLineInput = {
  readonly accountId: string;
  readonly debitAmount: number;
  readonly creditAmount: number;
};

/** Balanced posting applied directly to the ledger. */
export type LedgerPostingInput = {
  readonly periodId: string;
  readonly currency: string;
  readonly lines: readonly LedgerPostingLineInput[];
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly auditReference: string;
  readonly sourceEventId?: string;
};

/** Immutable ledger posting audit record. */
export type LedgerPostingRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly periodId: string;
  readonly currency: string;
  readonly lines: readonly LedgerPostingLineInput[];
  readonly totalDebit: number;
  readonly totalCredit: number;
  readonly correlationId: string;
  readonly idempotencyKey: string;
  readonly auditReference: string;
  readonly sourceEventId?: string;
  readonly postedBy: string;
  readonly postedAt: string;
};

/** Opening balance initialization for a period. */
export type LedgerOpeningBalanceInput = {
  readonly periodId: string;
  readonly accountId: string;
  readonly currency: string;
  readonly debitAmount: number;
  readonly creditAmount: number;
};

/** Consumed financial event awaiting journal engine (P-009.4). */
export type ConsumedFinancialEventRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly eventType: string;
  readonly eventId: string;
  readonly correlationId: string;
  readonly consumedAt: string;
  readonly status: "consumed" | "applied" | "rejected";
};

export type LedgerInquiryQuery = {
  readonly periodId?: string;
  readonly accountId?: string;
  readonly currency?: string;
};

export type PublishLedgerEventInput = {
  readonly eventType: LedgerEventType;
  readonly entityType: string;
  readonly entityId: string;
  readonly correlationId?: string;
  readonly payload?: Readonly<Record<string, string>>;
};

/** Immutable ledger entry created from a posted journal line (P-009.7D). */
export type LedgerEntryRecord = {
  readonly id: string;
  readonly organizationId: string;
  readonly accountId: string;
  readonly periodId: string;
  readonly journalId: string;
  readonly journalLineId: string;
  readonly debitAmount: number;
  readonly creditAmount: number;
  readonly currency: string;
  readonly postedAt: string;
  readonly correlationId: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type LedgerEntryQuery = {
  readonly periodId?: string;
  readonly accountId?: string;
  readonly journalId?: string;
};

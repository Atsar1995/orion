/** Single general ledger mutation derived from a posted journal line (P-009.7D). */
export type GeneralLedgerMutation = {
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
  readonly idempotencyKey: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

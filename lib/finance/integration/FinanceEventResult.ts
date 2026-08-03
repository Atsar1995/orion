/** Outcome status for inbound Finance event processing (P-009.9). */
export type FinanceEventProcessingStatus =
  | "processed"
  | "duplicate"
  | "rejected"
  | "failed";

/** Result envelope returned by the HCM → Finance inbound processor. */
export type FinanceEventResult = {
  readonly status: FinanceEventProcessingStatus;
  readonly eventId: string;
  readonly eventType: string;
  readonly journalId?: string;
  readonly lineageId?: string;
  readonly transactionId?: string;
  readonly code?: string;
  readonly message?: string;
};

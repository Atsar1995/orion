/** Posting validation stage identifiers — order fixed by P-009.3 §4.2. */
export const POSTING_VALIDATION_STAGE_ORDER = [
  "organization",
  "fiscal_period",
  "idempotency",
  "account",
  "currency",
  "journal_balance",
  "authorization",
  "budget",
] as const;

export type PostingValidationStageName = (typeof POSTING_VALIDATION_STAGE_ORDER)[number];

/** Stage outcome — PASS and WARNING allow continuation; FAIL and STOP halt posting. */
export type PostingValidationOutcome = "pass" | "fail" | "warning" | "stop";

/** Result emitted by a single validation stage. */
export type PostingValidationStageResult = {
  readonly stage: PostingValidationStageName;
  readonly outcome: PostingValidationOutcome;
  readonly code?: string;
  readonly message?: string;
  readonly field?: string;
};

/** Returns true when the outcome blocks posting. */
export function isPostingValidationBlocking(
  outcome: PostingValidationOutcome,
): boolean {
  return outcome === "fail" || outcome === "stop";
}

/** ADR-013 retry policy for durable IIL delivery (P-009.16). */
export class RetryPolicy {
  constructor(
    readonly maxAttempts = 5,
    readonly baseDelayMs = 1000,
    readonly maxDelayMs = 300_000,
  ) {}

  shouldRetry(attempts: number): boolean {
    return attempts < this.maxAttempts;
  }

  getDelayMs(attempts: number): number {
    const exponential = this.baseDelayMs * 2 ** attempts;
    const capped = Math.min(exponential, this.maxDelayMs);
    const jitter = Math.floor(Math.random() * Math.min(250, capped * 0.1));
    return capped + jitter;
  }

  isRetryableError(code?: string): boolean {
    if (!code) return true;
    const nonRetryable = [
      "UNAUTHORIZED_PUBLISHER",
      "INVALID_PAYLOAD",
      "UNSUPPORTED_EVENT",
      "VERSION_MISMATCH",
      "ORGANIZATION_MISMATCH",
      "AMOUNT_REQUIRED",
      "SCHEMA_VALIDATION_FAILED",
    ];
    return !nonRetryable.includes(code);
  }
}

export const defaultRetryPolicy = new RetryPolicy();

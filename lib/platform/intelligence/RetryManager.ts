/** Retry policy for intelligence event delivery (Mission P-006). */
export class RetryManager {
  constructor(
    private readonly maxAttempts = 3,
    private readonly baseDelayMs = 250,
    private readonly maxDelayMs = 5000,
  ) {}

  shouldRetry(attempts: number): boolean {
    return attempts < this.maxAttempts;
  }

  getDelayMs(attempts: number): number {
    return Math.min(this.baseDelayMs * 2 ** attempts, this.maxDelayMs);
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }
}

export const defaultRetryManager = new RetryManager();

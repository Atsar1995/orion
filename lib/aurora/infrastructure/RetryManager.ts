export type RetryPolicyName =
  | "platform.default"
  | "schedule.dispatch"
  | "event.handler"
  | "integration.sync";

export type RetryPolicy = {
  readonly name: string;
  readonly maxRetries: number;
  readonly backoff: "immediate" | "fixed" | "exponential";
  readonly baseDelayMs?: number;
  readonly maxDelayMs?: number;
};

export interface RetryManager {
  getPolicy(name: RetryPolicyName): RetryPolicy;
  execute<T>(policy: RetryPolicyName, fn: () => Promise<T>): Promise<T>;
}

const POLICIES: Record<RetryPolicyName, RetryPolicy> = {
  "platform.default": {
    name: "platform.default",
    maxRetries: 3,
    backoff: "exponential",
    baseDelayMs: 1_000,
    maxDelayMs: 30_000,
  },
  "schedule.dispatch": {
    name: "schedule.dispatch",
    maxRetries: 2,
    backoff: "fixed",
    baseDelayMs: 10_000,
  },
  "event.handler": {
    name: "event.handler",
    maxRetries: 2,
    backoff: "fixed",
    baseDelayMs: 10_000,
  },
  "integration.sync": {
    name: "integration.sync",
    maxRetries: 3,
    backoff: "exponential",
    baseDelayMs: 30_000,
    maxDelayMs: 600_000,
  },
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeDelay(policy: RetryPolicy, attempt: number): number {
  if (policy.backoff === "immediate") {
    return 0;
  }
  if (policy.backoff === "fixed") {
    return policy.baseDelayMs ?? 0;
  }
  const base = policy.baseDelayMs ?? 1_000;
  const max = policy.maxDelayMs ?? 30_000;
  return Math.min(base * 2 ** attempt, max);
}

export class DefaultRetryManager implements RetryManager {
  getPolicy(name: RetryPolicyName): RetryPolicy {
    return POLICIES[name];
  }

  async execute<T>(policyName: RetryPolicyName, fn: () => Promise<T>): Promise<T> {
    const policy = this.getPolicy(policyName);
    let lastError: unknown;

    for (let attempt = 0; attempt <= policy.maxRetries; attempt += 1) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt >= policy.maxRetries) {
          break;
        }
        await delay(computeDelay(policy, attempt));
      }
    }

    throw lastError;
  }
}

import { AURORA_ERR_5030, AuroraError } from "@/lib/aurora/errors/AuroraError";
import type { HealthStatus } from "@/types/aurora-platform";

export type CircuitState = "closed" | "open" | "half-open";

export type CircuitBreakerConfig = {
  readonly failureThreshold: number;
  readonly windowMs: number;
  readonly openDurationMs: number;
};

export interface CircuitBreaker {
  readonly name: string;
  readonly state: CircuitState;
  execute<T>(fn: () => Promise<T>): Promise<T>;
  reset(): void;
}

class DefaultCircuitBreaker implements CircuitBreaker {
  private failures = 0;
  private openedAt = 0;
  private stateInternal: CircuitState = "closed";

  constructor(
    readonly name: string,
    private readonly config: CircuitBreakerConfig,
  ) {}

  get state(): CircuitState {
    if (this.stateInternal === "open") {
      if (Date.now() - this.openedAt >= this.config.openDurationMs) {
        this.stateInternal = "half-open";
      }
    }
    return this.stateInternal;
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      throw new AuroraError(
        AURORA_ERR_5030,
        `Circuit breaker open: ${this.name}`,
        503,
      );
    }

    try {
      const result = await fn();
      this.failures = 0;
      this.stateInternal = "closed";
      return result;
    } catch (error) {
      this.failures += 1;
      if (this.failures >= this.config.failureThreshold) {
        this.stateInternal = "open";
        this.openedAt = Date.now();
      }
      throw error;
    }
  }

  reset(): void {
    this.failures = 0;
    this.openedAt = 0;
    this.stateInternal = "closed";
  }
}

export interface CircuitBreakerRegistry {
  get(name: string): CircuitBreaker;
  register(name: string, config: CircuitBreakerConfig): CircuitBreaker;
  getAllStates(): Readonly<Record<string, CircuitState>>;
  healthCheck(): Promise<HealthStatus>;
}

const DEFAULT_BREAKERS: Record<string, CircuitBreakerConfig> = {
  redis: { failureThreshold: 3, windowMs: 10_000, openDurationMs: 15_000 },
  postgresql: { failureThreshold: 3, windowMs: 10_000, openDurationMs: 30_000 },
  google: { failureThreshold: 5, windowMs: 60_000, openDurationMs: 60_000 },
  meta: { failureThreshold: 5, windowMs: 60_000, openDurationMs: 60_000 },
};

export class DefaultCircuitBreakerRegistry implements CircuitBreakerRegistry {
  private readonly breakers = new Map<string, CircuitBreaker>();

  constructor() {
    for (const [name, config] of Object.entries(DEFAULT_BREAKERS)) {
      this.register(name, config);
    }
  }

  get(name: string): CircuitBreaker {
    const breaker = this.breakers.get(name);
    if (!breaker) {
      throw new AuroraError("AURORA_ERR_0404", `Circuit breaker not found: ${name}`, 404);
    }
    return breaker;
  }

  register(name: string, config: CircuitBreakerConfig): CircuitBreaker {
    const breaker = new DefaultCircuitBreaker(name, config);
    this.breakers.set(name, breaker);
    return breaker;
  }

  getAllStates(): Readonly<Record<string, CircuitState>> {
    const states: Record<string, CircuitState> = {};
    for (const [name, breaker] of this.breakers.entries()) {
      states[name] = breaker.state;
    }
    return states;
  }

  async healthCheck(): Promise<HealthStatus> {
    const states = this.getAllStates();
    const open = Object.values(states).some((state) => state === "open");
    return {
      status: open ? "degraded" : "healthy",
      message: open ? "One or more circuit breakers are open." : "Circuit breakers operational.",
      checkedAt: new Date().toISOString(),
    };
  }
}

export { DefaultCircuitBreaker as DefaultCircuitBreakerImpl };

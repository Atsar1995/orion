import type { HealthStatus } from "@/types/aurora-platform";
import type { RetryManager } from "@/lib/aurora/infrastructure/RetryManager";

export type AuroraQueueName = "aurora:platform:tasks" | "aurora:schedule:tasks";

export type JobId = string;

export type QueueJob<T> = {
  readonly id?: JobId;
  readonly tenantId: string;
  readonly payload: T;
};

export type DrainResult = {
  readonly drained: number;
  readonly cancelled: number;
};

export type QueueHandler<T = unknown> = (job: QueueJob<T>) => Promise<void>;

export type QueueHandlerRegistry = Partial<Record<AuroraQueueName, QueueHandler>>;

export interface QueueManager {
  enqueue<T>(queue: AuroraQueueName, job: QueueJob<T>): Promise<JobId>;
  startWorkers(handlers: QueueHandlerRegistry): Promise<void>;
  stopAccepting(): void;
  drain(timeoutMs: number): Promise<DrainResult>;
  getQueueHealth(queue: AuroraQueueName): Promise<HealthStatus & { depth: number; activeWorkers: number }>;
  healthCheck(): Promise<HealthStatus>;
}

type StoredJob = {
  readonly id: JobId;
  readonly queue: AuroraQueueName;
  readonly tenantId: string;
  readonly payload: unknown;
};

export class InMemoryQueueManager implements QueueManager {
  private accepting = true;
  private workersStarted = false;
  private readonly queues = new Map<AuroraQueueName, StoredJob[]>();
  private readonly handlers: QueueHandlerRegistry = {};

  constructor(private readonly retryManager: RetryManager) {
    this.queues.set("aurora:platform:tasks", []);
    this.queues.set("aurora:schedule:tasks", []);
  }

  async enqueue<T>(queue: AuroraQueueName, job: QueueJob<T>): Promise<JobId> {
    if (!this.accepting) {
      throw new Error("Queue is not accepting jobs.");
    }

    const id = job.id ?? crypto.randomUUID();
    const stored: StoredJob = {
      id,
      queue,
      tenantId: job.tenantId,
      payload: job.payload,
    };
    this.queues.get(queue)?.push(stored);
    return id;
  }

  async startWorkers(handlers: QueueHandlerRegistry): Promise<void> {
    Object.assign(this.handlers, handlers);
    this.workersStarted = true;
  }

  stopAccepting(): void {
    this.accepting = false;
  }

  async drain(timeoutMs: number): Promise<DrainResult> {
    const deadline = Date.now() + timeoutMs;
    let drained = 0;
    let cancelled = 0;

    for (const [queueName, jobs] of this.queues.entries()) {
      const handler = this.handlers[queueName];
      while (jobs.length > 0) {
        if (Date.now() > deadline) {
          cancelled += jobs.length;
          jobs.splice(0, jobs.length);
          break;
        }

        const job = jobs.shift();
        if (!job) {
          break;
        }

        if (handler) {
          await this.retryManager.execute("platform.default", () =>
            handler({
              id: job.id,
              tenantId: job.tenantId,
              payload: job.payload,
            }),
          );
        }
        drained += 1;
      }
    }

    return { drained, cancelled };
  }

  async getQueueHealth(queue: AuroraQueueName) {
    const depth = this.queues.get(queue)?.length ?? 0;
    return {
      status: depth > 100 ? "degraded" as const : "healthy" as const,
      message: `Queue ${queue} depth ${depth}`,
      checkedAt: new Date().toISOString(),
      depth,
      activeWorkers: this.workersStarted ? 1 : 0,
    };
  }

  async healthCheck(): Promise<HealthStatus> {
    return {
      status: this.accepting ? "healthy" : "degraded",
      message: this.accepting ? "Queue manager accepting jobs." : "Queue manager draining.",
      checkedAt: new Date().toISOString(),
    };
  }
}

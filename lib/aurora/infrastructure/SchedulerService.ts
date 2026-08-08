import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { ScheduleRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { QueueManager } from "@/lib/aurora/infrastructure/QueueManager";
import { AURORA_ERR_0403, AURORA_ERR_0503, AuroraError } from "@/lib/aurora/errors/AuroraError";
import { isActiveLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import type { HealthStatus } from "@/types/aurora-platform";
import type { ScheduleEntryRecord } from "@/lib/aurora/persistence/AuroraStoreBacking";

export type ScheduleId = string;

export type ScheduleEntry = {
  readonly brandId?: string;
  readonly scheduledAt: string;
  readonly payload: Readonly<Record<string, unknown>>;
};

export interface SchedulerService {
  schedule(ctx: AuroraRuntimeContext, entry: ScheduleEntry): Promise<ScheduleId>;
  cancel(ctx: AuroraRuntimeContext, scheduleId: ScheduleId): Promise<void>;
  cancelAll(ctx: AuroraRuntimeContext): Promise<number>;
  listPending(ctx: AuroraRuntimeContext): Promise<readonly ScheduleEntryRecord[]>;
  start(): Promise<void>;
  stop(): Promise<void>;
  healthCheck(): Promise<HealthStatus>;
}

export class DefaultSchedulerService implements SchedulerService {
  private running = false;

  constructor(
    private readonly queueManager: QueueManager,
    private readonly scheduleRepository: ScheduleRepository,
  ) {}

  private assertMutable(ctx: AuroraRuntimeContext): void {
    if (!isActiveLifecycleState(ctx.platformState)) {
      throw new AuroraError(AURORA_ERR_0503, "Platform not ready.", 503);
    }
  }

  private assertAdmin(ctx: AuroraRuntimeContext): void {
    if (!ctx.roles.includes("aurora.admin")) {
      throw new AuroraError(AURORA_ERR_0403, "Admin role required.", 403);
    }
  }

  async schedule(ctx: AuroraRuntimeContext, entry: ScheduleEntry): Promise<ScheduleId> {
    this.assertMutable(ctx);
    const scheduledAt = new Date(entry.scheduledAt);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
      throw new AuroraError("AURORA_ERR_0400", "Schedule must be in the future.", 400);
    }

    const id = crypto.randomUUID();
    const record: ScheduleEntryRecord = {
      id,
      tenantId: ctx.tenantId,
      brandId: entry.brandId ?? (ctx.brandId || undefined),
      scheduledAt: entry.scheduledAt,
      payload: entry.payload,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    await this.scheduleRepository.create(record);
    await this.queueManager.enqueue("aurora:schedule:tasks", {
      tenantId: ctx.tenantId,
      payload: { scheduleId: id },
    });
    return id;
  }

  async cancel(ctx: AuroraRuntimeContext, scheduleId: ScheduleId): Promise<void> {
    this.assertMutable(ctx);
    const existing = await this.scheduleRepository.getById(ctx.tenantId, scheduleId);
    if (!existing) {
      throw new AuroraError("AURORA_ERR_0404", "Schedule not found.", 404);
    }
    await this.scheduleRepository.update({ ...existing, status: "cancelled" });
  }

  async cancelAll(ctx: AuroraRuntimeContext): Promise<number> {
    this.assertMutable(ctx);
    this.assertAdmin(ctx);
    const pending = await this.scheduleRepository.listPending(ctx.tenantId);
    for (const entry of pending) {
      await this.scheduleRepository.update({ ...entry, status: "cancelled" });
    }
    return pending.length;
  }

  async listPending(ctx: AuroraRuntimeContext): Promise<readonly ScheduleEntryRecord[]> {
    return this.scheduleRepository.listPending(ctx.tenantId);
  }

  async start(): Promise<void> {
    this.running = true;
  }

  async stop(): Promise<void> {
    this.running = false;
  }

  async healthCheck(): Promise<HealthStatus> {
    return {
      status: this.running ? "healthy" : "degraded",
      message: this.running ? "Scheduler running." : "Scheduler stopped.",
      checkedAt: new Date().toISOString(),
    };
  }
}

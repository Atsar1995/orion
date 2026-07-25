import type { ScheduledExecution } from "@/types/orchestrator";

/** Prepares orchestrator execution scheduling for future background jobs. */
export class ExecutionScheduler {
  private readonly schedules: ScheduledExecution[] = [
    {
      id: "dashboard-manual",
      scheduledFor: new Date().toISOString(),
      cadence: "manual",
      enabled: true,
    },
    {
      id: "dashboard-interval",
      scheduledFor: new Date(Date.now() + 300000).toISOString(),
      cadence: "interval",
      enabled: false,
    },
  ];

  listSchedules(): ScheduledExecution[] {
    return this.schedules;
  }

  getNextScheduledRun(): ScheduledExecution | undefined {
    return this.schedules.find((schedule) => schedule.enabled);
  }

  shouldRunBackgroundJob(lastRunAt?: string, intervalMs = 300000): boolean {
    if (!lastRunAt) {
      return true;
    }

    return Date.now() - new Date(lastRunAt).getTime() >= intervalMs;
  }
}

export const executionScheduler = new ExecutionScheduler();

import type { PipelineLogEntry } from "@/types/orchestrator";

/** In-memory pipeline execution logger (observability · Sprint 4). */
class ExecutionLoggerStore {
  private readonly entries: PipelineLogEntry[] = [];
  private readonly maxEntries = 200;

  log(entry: Omit<PipelineLogEntry, "timestamp">): void {
    this.entries.unshift({
      ...entry,
      timestamp: new Date().toISOString(),
    });

    if (this.entries.length > this.maxEntries) {
      this.entries.length = this.maxEntries;
    }
  }

  info(message: string, stageId?: string, engineId?: string): void {
    this.log({ level: "info", message, stageId, engineId });
  }

  warn(message: string, stageId?: string, engineId?: string): void {
    this.log({ level: "warn", message, stageId, engineId });
  }

  error(message: string, stageId?: string, engineId?: string): void {
    this.log({ level: "error", message, stageId, engineId });
  }

  getRecent(limit = 50): PipelineLogEntry[] {
    return this.entries.slice(0, limit);
  }

  clear(): void {
    this.entries.length = 0;
  }
}

export const executionLogger = new ExecutionLoggerStore();

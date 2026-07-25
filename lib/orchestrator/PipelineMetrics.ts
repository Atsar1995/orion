import type { ExecutionMetrics, PipelineExecution } from "@/types/orchestrator";

/** Tracks orchestrator pipeline observability metrics. */
class PipelineMetricsStore {
  private executionCount = 0;
  private failureCount = 0;
  private warningCount = 0;
  private lastExecution: PipelineExecution | undefined;
  private lastMetrics: ExecutionMetrics | undefined;

  recordExecution(execution: PipelineExecution): void {
    this.executionCount += 1;
    this.failureCount += execution.errors.length;
    this.warningCount += execution.warnings.length;
    this.lastExecution = execution;
    this.lastMetrics = execution.metrics;
  }

  getExecutionCount(): number {
    return this.executionCount;
  }

  getFailureCount(): number {
    return this.failureCount;
  }

  getWarningCount(): number {
    return this.warningCount;
  }

  getLastExecution(): PipelineExecution | undefined {
    return this.lastExecution;
  }

  getLastMetrics(): ExecutionMetrics | undefined {
    return this.lastMetrics;
  }
}

export const pipelineMetrics = new PipelineMetricsStore();

export function buildExecutionMetrics(
  stageDurationsMs: Record<string, number>,
  engineDurationsMs: Record<string, number>,
  errors: PipelineExecution["errors"],
  warnings: PipelineExecution["warnings"],
  executionCount: number,
  wallClockDurationMs?: number,
): ExecutionMetrics {
  const summedStageDurationMs = Object.values(stageDurationsMs).reduce(
    (total, value) => total + value,
    0,
  );

  return {
    pipelineDurationMs: wallClockDurationMs ?? summedStageDurationMs,
    stageDurationsMs,
    engineDurationsMs,
    failureCount: errors.length,
    warningCount: warnings.length,
    executionCount,
  };
}

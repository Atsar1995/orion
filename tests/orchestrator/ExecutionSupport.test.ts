import { describe, expect, it } from "vitest";
import {
  addError,
  addWarning,
  createExecutionContext,
  recordStageResult,
} from "@/lib/orchestrator/ExecutionContext";
import { executionLogger } from "@/lib/orchestrator/ExecutionLogger";
import { ExecutionScheduler } from "@/lib/orchestrator/ExecutionScheduler";

describe("Orchestrator execution support", () => {
  it("tracks stage results, warnings, and errors in execution context", () => {
    const context = createExecutionContext("exec-test-1");

    recordStageResult(context, {
      stageId: "refresh-providers",
      success: true,
      durationMs: 12,
      warnings: ["Provider sync delayed"],
    });

    addWarning(context, "Fallback metrics applied");
    addError(context, "aggregate-metrics", "Missing marketing provider", true);

    expect(context.stageResults).toHaveLength(1);
    expect(context.warnings).toEqual(["Provider sync delayed", "Fallback metrics applied"]);
    expect(context.errors[0]?.stageId).toBe("aggregate-metrics");
    expect(context.errors[0]?.recoverable).toBe(true);
  });

  it("logs pipeline events and trims history", () => {
    executionLogger.clear();
    executionLogger.info("Pipeline started", "initialize");
    executionLogger.warn("Slow provider response", "refresh-providers");
    executionLogger.error("Stage failed", "produce-dashboard-snapshot");

    const recent = executionLogger.getRecent(3);

    expect(recent).toHaveLength(3);
    expect(recent.map((entry) => entry.level)).toEqual(["error", "warn", "info"]);
  });

  it("schedules dashboard runs and evaluates background intervals", () => {
    const scheduler = new ExecutionScheduler();
    const schedules = scheduler.listSchedules();

    expect(schedules.some((schedule) => schedule.cadence === "manual")).toBe(true);
    expect(scheduler.getNextScheduledRun()?.enabled).toBe(true);
    expect(scheduler.shouldRunBackgroundJob()).toBe(true);
    expect(scheduler.shouldRunBackgroundJob(new Date().toISOString(), 300000)).toBe(false);
  });
});

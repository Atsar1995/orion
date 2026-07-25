import { describe, expect, it } from "vitest";
import { listRegisteredEngines } from "@/lib/orchestrator/EngineRegistry";
import { getOrderedStages } from "@/lib/orchestrator/OrchestratorPipeline";
import {
  intelligenceOrchestrator,
  runDashboardPipeline,
} from "@/lib/orchestrator/Orchestrator";

describe("Intelligence Orchestrator", () => {
  it("registers all sprint intelligence engines", () => {
    const engines = listRegisteredEngines();
    const ids = engines.map((engine) => engine.id);

    expect(ids).toEqual(
      expect.arrayContaining([
        "provider-framework",
        "executive-brief-engine",
        "recommendation-engine",
        "alert-engine",
        "business-health-service",
        "trend-service",
      ]),
    );
  });

  it("defines pipeline stages in required execution order", () => {
    const stages = getOrderedStages();

    expect(stages[0]?.id).toBe("refresh-providers");
    expect(stages.at(-1)?.id).toBe("produce-dashboard-snapshot");
    expect(stages.map((stage) => stage.order)).toEqual(
      stages.map((_, index) => index + 1),
    );
  });

  it("runs dashboard pipeline and returns complete snapshot", async () => {
    const output = await runDashboardPipeline();

    expect(output.execution.success).toBe(true);
    expect(output.execution.metrics.pipelineDurationMs).toBeGreaterThan(0);
    expect(output.snapshot.metrics.revenue).toBeDefined();
    expect(output.snapshot.brief.headline).toBeTruthy();
    expect(output.snapshot.recommendations.length).toBeGreaterThan(0);
    expect(output.snapshot.alertPanel.counts.total).toBeGreaterThan(0);
    expect(output.snapshot.tasks.length).toBeGreaterThan(0);
    expect(output.snapshot.trends.length).toBeGreaterThan(0);
  });

  it("exposes observability through orchestrator facade", async () => {
    await intelligenceOrchestrator.getDashboardSnapshot();

    expect(intelligenceOrchestrator.getLastExecution()?.success).toBe(true);
    expect(intelligenceOrchestrator.getRecentLogs(5).length).toBeGreaterThan(0);
    expect(intelligenceOrchestrator.getExecutionScheduler().listSchedules().length).toBeGreaterThan(
      0,
    );
  });
});

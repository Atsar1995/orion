import {
  buildAlertPanelSnapshot,
} from "@/lib/intelligence/alerts/AlertEngine";
import {
  buildDailyExecutiveBrief,
} from "@/lib/intelligence/brief/ExecutiveBriefEngine";
import { executiveBriefFormatter } from "@/lib/intelligence/brief/ExecutiveBriefFormatter";
import { buildDashboardRecommendations } from "@/lib/intelligence/recommendations/RecommendationEngine";
import {
  aggregateBusinessHealth,
  aggregateMetrics,
  aggregateTasks,
  aggregateTrends,
  normalizeContributions,
} from "@/lib/intelligence/shared/provider-aggregation";
import { engineRegistry } from "@/lib/orchestrator/EngineRegistry";
import {
  addWarning,
  createExecutionContext,
  recordStageResult,
} from "@/lib/orchestrator/ExecutionContext";
import { executionLogger } from "@/lib/orchestrator/ExecutionLogger";
import { getOrderedStages } from "@/lib/orchestrator/OrchestratorPipeline";
import {
  buildExecutionMetrics,
  pipelineMetrics,
} from "@/lib/orchestrator/PipelineMetrics";
import { fetchProviderContributions } from "@/lib/providers/provider-data";
import { providerManager } from "@/lib/providers/ProviderManager";
import type {
  ExecutionContext,
  OrchestratorPipelineOutput,
  PipelineError,
  PipelineExecution,
  PipelineResult,
} from "@/types/orchestrator";
import type { DashboardSnapshot } from "@/types/intelligence";

function measureAsync<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = performance.now();
  return fn().then((result) => [result, Math.round(performance.now() - start)] as [T, number]);
}

function createStageError(stageId: string, message: string, recoverable: boolean): PipelineError {
  return {
    stageId,
    message,
    timestamp: new Date().toISOString(),
    recoverable,
  };
}

async function runStage<T>(
  context: ExecutionContext,
  stageId: string,
  engineId: string,
  required: boolean,
  execute: () => Promise<T>,
): Promise<PipelineResult<T>> {
  engineRegistry.setStatus(engineId, "running");
  executionLogger.info(`Stage started: ${stageId}`, stageId, engineId);

  try {
    const [data, durationMs] = await measureAsync(execute);
    const result: PipelineResult<T> = {
      stageId,
      success: true,
      durationMs,
      data,
    };

    recordStageResult(context, result);
    engineRegistry.setStatus(engineId, "ready");
    executionLogger.info(`Stage completed in ${durationMs}ms`, stageId, engineId);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown pipeline stage error";
    const pipelineError = createStageError(stageId, message, !required);
    const result: PipelineResult<T> = {
      stageId,
      success: false,
      durationMs: 0,
      error: pipelineError,
    };

    recordStageResult(context, result);
    engineRegistry.setStatus(engineId, "error");
    executionLogger.error(message, stageId, engineId);

    if (required) {
      throw error;
    }

    addWarning(context, `${stageId}: ${message}`);
    return result;
  }
}

/** Executes the dashboard intelligence pipeline with observability and error isolation. */
export class PipelineRunner {
  async runDashboardPipeline(): Promise<OrchestratorPipelineOutput> {
    const executionId = `exec-${Date.now()}`;
    const context = createExecutionContext(executionId);
    const stageDurationsMs: Record<string, number> = {};
    const engineDurationsMs: Record<string, number> = {};
    const startedAt = new Date().toISOString();
    const pipelineStartedAt = performance.now();

    executionLogger.info("Pipeline execution started", undefined, "orchestrator");

    const setupStageIds = [
      "refresh-providers",
      "collect-provider-data",
      "normalize-data",
      "update-business-metrics",
    ];

    for (const stageId of setupStageIds) {
      const stage = getOrderedStages().find((item) => item.id === stageId);

      if (!stage) {
        continue;
      }

      const result = await this.executeStage(context, stage.id, stage.required);
      stageDurationsMs[stage.id] = result.durationMs;
    }

    const intelligenceResults = await Promise.all([
      this.executeStage(context, "generate-executive-brief", true),
      this.executeStage(context, "generate-recommendations", true),
      this.executeStage(context, "evaluate-alerts", true),
    ]);

    for (const result of intelligenceResults) {
      stageDurationsMs[result.stageId] = result.durationMs;
    }

    const insightsResults = await Promise.all([
      this.executeStage(context, "calculate-business-health", true),
      this.executeStage(context, "generate-trends", false),
    ]);

    for (const result of insightsResults) {
      stageDurationsMs[result.stageId] = result.durationMs;
    }

    const snapshotResult = await this.executeStage(
      context,
      "produce-dashboard-snapshot",
      true,
    );
    stageDurationsMs[snapshotResult.stageId] = snapshotResult.durationMs;

    engineDurationsMs["provider-framework"] =
      (stageDurationsMs["refresh-providers"] ?? 0) +
      (stageDurationsMs["collect-provider-data"] ?? 0);
    engineDurationsMs["executive-brief-engine"] =
      stageDurationsMs["generate-executive-brief"] ?? 0;
    engineDurationsMs["recommendation-engine"] =
      stageDurationsMs["generate-recommendations"] ?? 0;
    engineDurationsMs["alert-engine"] = stageDurationsMs["evaluate-alerts"] ?? 0;
    engineDurationsMs["business-health-service"] =
      stageDurationsMs["calculate-business-health"] ?? 0;
    engineDurationsMs["trend-service"] = stageDurationsMs["generate-trends"] ?? 0;

    const completedAt = new Date().toISOString();
    const wallClockDurationMs = Math.round(performance.now() - pipelineStartedAt);
    const execution: PipelineExecution = {
      id: executionId,
      startedAt,
      completedAt,
      success: context.errors.filter((error) => !error.recoverable).length === 0,
      metrics: buildExecutionMetrics(
        stageDurationsMs,
        engineDurationsMs,
        context.errors,
        context.warnings,
        pipelineMetrics.getExecutionCount() + 1,
        wallClockDurationMs,
      ),
      errors: context.errors,
      warnings: context.warnings,
      stageResults: context.stageResults,
    };

    pipelineMetrics.recordExecution(execution);
    executionLogger.info(
      `Pipeline completed in ${execution.metrics.pipelineDurationMs}ms`,
      undefined,
      "orchestrator",
    );

    if (!context.snapshot) {
      throw new Error("Dashboard snapshot was not produced by pipeline");
    }

    return {
      execution,
      snapshot: context.snapshot,
    };
  }

  private async executeStage(
    context: ExecutionContext,
    stageId: string,
    required: boolean,
  ): Promise<PipelineResult> {
    const contributions = context.normalizedContributions;

    switch (stageId) {
      case "refresh-providers":
        return runStage(context, stageId, "provider-framework", required, async () => {
          await providerManager.connectAll();
          await providerManager.syncAll();
          return true;
        });

      case "collect-provider-data":
        return runStage(context, stageId, "provider-framework", required, async () => {
          context.contributions = await fetchProviderContributions({ skipConnect: true });
          return context.contributions;
        });

      case "normalize-data":
        return runStage(context, stageId, "provider-framework", required, async () => {
          context.normalizedContributions = normalizeContributions(context.contributions);
          return context.normalizedContributions;
        });

      case "update-business-metrics":
        return runStage(context, stageId, "provider-framework", required, async () => {
          context.metrics = aggregateMetrics(context.normalizedContributions);
          return context.metrics;
        });

      case "generate-executive-brief":
        return runStage(context, stageId, "executive-brief-engine", required, async () => {
          const dailyBrief = await buildDailyExecutiveBrief(undefined, contributions);
          context.dailyBrief = dailyBrief;
          context.brief = executiveBriefFormatter.toDashboardBrief(dailyBrief);
          return context.brief;
        });

      case "generate-recommendations":
        return runStage(context, stageId, "recommendation-engine", required, async () => {
          context.recommendations = await buildDashboardRecommendations(contributions);
          return context.recommendations;
        });

      case "evaluate-alerts":
        return runStage(context, stageId, "alert-engine", required, async () => {
          context.alertPanel = await buildAlertPanelSnapshot(contributions);
          return context.alertPanel;
        });

      case "calculate-business-health":
        return runStage(context, stageId, "business-health-service", required, async () => {
          context.businessHealth = aggregateBusinessHealth(context.normalizedContributions);
          return context.businessHealth;
        });

      case "generate-trends":
        return runStage(context, stageId, "trend-service", required, async () => {
          context.trends = aggregateTrends(context.normalizedContributions);
          context.tasks = aggregateTasks(context.normalizedContributions);
          return context.trends;
        });

      case "produce-dashboard-snapshot":
        return runStage(context, stageId, "orchestrator", required, async () => {
          if (
            !context.metrics ||
            !context.brief ||
            !context.businessHealth ||
            !context.alertPanel
          ) {
            throw new Error("Pipeline context incomplete — cannot produce dashboard snapshot");
          }

          const snapshot: DashboardSnapshot = {
            businessHealth: context.businessHealth,
            metrics: context.metrics,
            brief: context.brief,
            recommendations: context.recommendations,
            alerts: context.alertPanel.recent,
            alertPanel: context.alertPanel,
            tasks: context.tasks,
            trends: context.trends,
          };

          context.snapshot = snapshot;
          return snapshot;
        });

      default:
        throw new Error(`Unknown pipeline stage: ${stageId}`);
    }
  }
}

export const pipelineRunner = new PipelineRunner();

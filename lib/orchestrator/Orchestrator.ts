import { cache } from "react";
import { listRegisteredEngines } from "@/lib/orchestrator/EngineRegistry";
import { executionLogger } from "@/lib/orchestrator/ExecutionLogger";
import { executionScheduler } from "@/lib/orchestrator/ExecutionScheduler";
import { pipelineRunner } from "@/lib/orchestrator/PipelineRunner";
import { pipelineMetrics } from "@/lib/orchestrator/PipelineMetrics";
import type { DashboardSnapshot } from "@/types/intelligence";
import type {
  EngineRegistration,
  OrchestratorPipelineOutput,
  PipelineExecution,
  PipelineLogEntry,
} from "@/types/orchestrator";

const runCachedDashboardPipeline = cache(async () => {
  return pipelineRunner.runDashboardPipeline();
});

/**
 * ORION Intelligence Orchestrator (ES-065 · Sprint 4).
 *
 * Central coordination layer for providers and intelligence engines.
 * Dashboard and UI surfaces should consume `getDashboardSnapshot()` only.
 */
export class IntelligenceOrchestrator {
  async getDashboardSnapshot(): Promise<DashboardSnapshot> {
    const output = await runCachedDashboardPipeline();
    return output.snapshot;
  }

  async runDashboardPipeline(): Promise<OrchestratorPipelineOutput> {
    return runCachedDashboardPipeline();
  }

  getRegisteredEngines(): EngineRegistration[] {
    return listRegisteredEngines();
  }

  getLastExecution(): PipelineExecution | undefined {
    return pipelineMetrics.getLastExecution();
  }

  getRecentLogs(limit = 50): PipelineLogEntry[] {
    return executionLogger.getRecent(limit);
  }

  getExecutionScheduler() {
    return executionScheduler;
  }
}

export const intelligenceOrchestrator = new IntelligenceOrchestrator();

/** Primary dashboard entry point — coordinates all engines internally. */
export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  return intelligenceOrchestrator.getDashboardSnapshot();
}

export async function runDashboardPipeline(): Promise<OrchestratorPipelineOutput> {
  return intelligenceOrchestrator.runDashboardPipeline();
}

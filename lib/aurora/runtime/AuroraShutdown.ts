import type { ShutdownOptions } from "@/lib/aurora/runtime/AuroraRuntime";
import type { AuroraWiring } from "@/lib/aurora/wiring/AuroraWiring";
import type { ShutdownPhaseResult, ShutdownResult } from "@/types/aurora-platform";

export class AuroraShutdown {
  async run(wiring: AuroraWiring, options: ShutdownOptions): Promise<ShutdownResult> {
    const startedAt = Date.now();
    const phases: ShutdownPhaseResult[] = [];
    let drainedJobs = 0;
    let forceCancelledJobs = 0;

    const runStep = async (step: number, name: string, fn: () => Promise<void>) => {
      const stepStarted = Date.now();
      try {
        await fn();
        phases.push({ step, name, success: true, durationMs: Date.now() - stepStarted });
      } catch (error) {
        phases.push({
          step,
          name,
          success: false,
          durationMs: Date.now() - stepStarted,
        });
        if (!options.force) {
          throw error;
        }
      }
    };

    await runStep(1, "set-draining", async () => {
      wiring.lifecycle = "draining";
    });

    await runStep(2, "stop-scheduler", async () => {
      await wiring.scheduler.stop();
    });

    await runStep(3, "stop-accepting", async () => {
      wiring.queueManager.stopAccepting();
    });

    await runStep(4, "drain-queue", async () => {
      const drain = await wiring.queueManager.drain(options.queueDrainTimeoutMs ?? 30_000);
      drainedJobs = drain.drained;
      forceCancelledJobs = drain.cancelled;
    });

    await runStep(5, "shutdown-admin-module", async () => {
      await wiring.moduleRegistry.shutdownAll();
    });

    await runStep(6, "shutdown-connectors", async () => {
      await wiring.connectorRegistry.shutdown();
    });

    await runStep(7, "close-redis", async () => {
      // Redis connection managed externally in A-007
    });

    await runStep(8, "set-shutdown", async () => {
      wiring.lifecycle = "shutdown";
    });

    await runStep(9, "log-metrics", async () => {
      wiring.metricsCollector.recordHistogram(
        "aurora_shutdown_duration_seconds",
        (Date.now() - startedAt) / 1000,
      );
    });

    return {
      success: true,
      durationMs: Date.now() - startedAt,
      drainedJobs,
      forceCancelledJobs,
      phases,
    };
  }
}

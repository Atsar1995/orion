import { createAuroraWiring } from "@/lib/aurora/createAuroraWiring";
import {
  AURORA_EVENT_PLATFORM_DEGRADED,
  AURORA_EVENT_PLATFORM_READY,
} from "@/lib/aurora/events/aurora-event-catalog";
import {
  AURORA_BOOT_PHASE_NAMES,
} from "@/lib/aurora/constants";
import type { AuroraRuntime } from "@/lib/aurora/runtime/AuroraRuntime";
import {
  AuroraRuntimeConfiguration,
  validateAuroraConfig,
  type AuroraWiringConfig,
} from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import type { PlatformLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import type { AuroraWiring } from "@/lib/aurora/wiring/AuroraWiring";
import type { BootPhase, BootResult, PhaseResult } from "@/types/aurora-platform";
import {
  ensureDefaultPlatformStoreInitialized,
  getDefaultPlatformStore,
} from "@/lib/platform/store/PlatformStoreFactory";

export class AuroraBootstrap {
  constructor(
    private readonly config: AuroraWiringConfig,
    private readonly runtime: AuroraRuntime,
  ) {}

  async run(): Promise<BootResult> {
    const startedAt = Date.now();
    const phaseResults: PhaseResult[] = [];
    const degradedReasons: string[] = [];
    let wiring: AuroraWiring | null = null;
    let state: PlatformLifecycleState = "failed";

    const runPhase = async (phase: BootPhase, fn: () => Promise<void>): Promise<boolean> => {
      const phaseStarted = Date.now();
      try {
        await fn();
        phaseResults.push({
          phase,
          success: true,
          durationMs: Date.now() - phaseStarted,
        });
        return true;
      } catch (error) {
        phaseResults.push({
          phase,
          success: false,
          durationMs: Date.now() - phaseStarted,
          error: error instanceof Error ? error.message : String(error),
        });
        return false;
      }
    };

    if (!(await runPhase(0, async () => {
      await ensureDefaultPlatformStoreInitialized();
      if (!getDefaultPlatformStore().isInitialized()) {
        throw new Error("ORION PlatformStore not initialized.");
      }
    }))) {
      return this.result(false, "failed", wiring, phaseResults, startedAt, degradedReasons);
    }

    if (!(await runPhase(1, async () => {
      const validation = validateAuroraConfig(this.config);
      if (!validation.valid) {
        throw new Error(validation.errors.join("; "));
      }
    }))) {
      return this.result(false, "failed", wiring, phaseResults, startedAt, degradedReasons);
    }

    await runPhase(2, async () => {
      if (this.config.enabled && !this.config.skipExternalConnections && !this.config.redisUrl) {
        if (this.config.environment !== "test") {
          degradedReasons.push("Redis URL not configured — running degraded.");
        }
      }
    });

    let criticalFailure = false;
    criticalFailure ||= !(await runPhase(3, async () => {
      wiring = createAuroraWiring(this.config, this.runtime);
    }));

    await runPhase(4, async () => {
      degradedReasons.push("Knowledge module stubbed.");
    });

    if (wiring) {
      const bootWiring: AuroraWiring = wiring;
      criticalFailure ||= !(await runPhase(5, async () => {
        const configValidation = bootWiring.configurationService.validateConfig();
        if (!configValidation.valid) {
          throw new Error(configValidation.errors.join("; "));
        }
      }));

      await runPhase(6, async () => {
        const logger = bootWiring.loggingService.createLogger({ module: "admin" });
        const initResults = await bootWiring.moduleRegistry.initializeAll({
          wiring: bootWiring,
          config: this.config,
          logger,
        });
        const adminResult = initResults.find((result) => !result.success);
        if (adminResult) {
          throw new Error(adminResult.reason ?? "Admin module initialization failed.");
        }
      });

      await runPhase(7, async () => {
        degradedReasons.push("Agent runtime stubbed.");
      });

      await runPhase(8, async () => {
        if (this.config.skipWorkers) {
          degradedReasons.push("Background workers skipped.");
        }
      });

      await runPhase(9, async () => {
        if (!bootWiring.facade) {
          throw new Error("AuroraFacade not wired.");
        }
      });

      const verificationOk = await runPhase(10, async () => {
        const health = await bootWiring.healthCheck();
        if (health.lifecycle === "shutdown" || health.lifecycle === "failed") {
          throw new Error("Health verification failed.");
        }
      });

      if (criticalFailure) {
        state = "failed";
      } else if (!verificationOk || degradedReasons.length > 0) {
        state = "degraded";
        await bootWiring.eventPublisher.publish({
          name: AURORA_EVENT_PLATFORM_DEGRADED,
          tenantId: "system",
          payload: { reasons: degradedReasons.join(";") },
          metadata: { emittedAt: new Date().toISOString() },
        });
      } else {
        state = "ready";
        await bootWiring.eventPublisher.publish({
          name: AURORA_EVENT_PLATFORM_READY,
          tenantId: "system",
          payload: { phases: String(phaseResults.length) },
          metadata: { emittedAt: new Date().toISOString() },
        });
      }

      bootWiring.lifecycle = state;
      this.runtime.attachWiring(bootWiring);
    }

    return this.result(!criticalFailure, state, wiring, phaseResults, startedAt, degradedReasons);
  }

  private result(
    success: boolean,
    state: PlatformLifecycleState,
    wiring: AuroraWiring | null,
    phaseResults: PhaseResult[],
    startedAt: number,
    degradedReasons: readonly string[],
  ): BootResult {
    if (!wiring) {
      wiring = createAuroraWiring(
        { ...AuroraRuntimeConfiguration.forTest(), ...this.config, enabled: false },
        this.runtime,
      );
      wiring.lifecycle = state;
    }

    return {
      success,
      state,
      wiring,
      phaseResults,
      totalDurationMs: Date.now() - startedAt,
      degradedReasons,
    };
  }
}

export { AURORA_BOOT_PHASE_NAMES };

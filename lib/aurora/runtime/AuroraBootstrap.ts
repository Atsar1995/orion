import { createAuroraWiring } from "@/lib/aurora/createAuroraWiring";
import {
  AURORA_EVENT_PLATFORM_DEGRADED,
  AURORA_EVENT_PLATFORM_READY,
} from "@/lib/aurora/events/aurora-event-catalog";
import { AURORA_BOOT_PHASE_NAMES } from "@/lib/aurora/constants";
import type { AuroraRuntime } from "@/lib/aurora/runtime/AuroraRuntime";
import {
  AuroraRuntimeConfiguration,
  validateAuroraConfig,
  type AuroraWiringConfig,
} from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import { isCriticalBootPhase } from "@/lib/aurora/runtime/bootPhasePolicy";
import type { PlatformLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import type { AuroraWiring } from "@/lib/aurora/wiring/AuroraWiring";
import type { BootPhase, BootResult, PhaseResult } from "@/types/aurora-platform";
import {
  ensureDefaultPlatformStoreInitialized,
  getDefaultPlatformStore,
} from "@/lib/platform/store/PlatformStoreFactory";

function syncDegradedReasons(wiring: AuroraWiring, reasons: readonly string[]): void {
  wiring.degradedReasons.splice(0, wiring.degradedReasons.length, ...reasons);
}

function finalizeFailedBoot(
  wiring: AuroraWiring | null,
  runtime: AuroraRuntime,
  degradedReasons: readonly string[],
): void {
  if (!wiring) {
    return;
  }
  wiring.lifecycle = "failed";
  syncDegradedReasons(wiring, degradedReasons);
  runtime.attachWiring(wiring);
}

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
    let criticalFailure = false;

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
        if (isCriticalBootPhase(phase)) {
          criticalFailure = true;
        }
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

    if (!(await runPhase(3, async () => {
      wiring = createAuroraWiring(this.config, this.runtime);
      if (wiring.lifecycle !== "initializing") {
        throw new Error("Wiring lifecycle must remain initializing until bootstrap completes.");
      }
    }))) {
      return this.result(false, "failed", wiring, phaseResults, startedAt, degradedReasons);
    }

    await runPhase(4, async () => {
      degradedReasons.push("Knowledge module stubbed.");
    });

    const bootWiring: AuroraWiring = wiring!;

    if (!(await runPhase(5, async () => {
      const configValidation = bootWiring.configurationService.validateConfig();
      if (!configValidation.valid) {
        throw new Error(configValidation.errors.join("; "));
      }
    }))) {
      finalizeFailedBoot(bootWiring, this.runtime, degradedReasons);
      return this.result(false, "failed", bootWiring, phaseResults, startedAt, degradedReasons);
    }

    if (!(await runPhase(6, async () => {
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
    }))) {
      finalizeFailedBoot(bootWiring, this.runtime, degradedReasons);
      return this.result(false, "failed", bootWiring, phaseResults, startedAt, degradedReasons);
    }

    await runPhase(7, async () => {
      degradedReasons.push("Agent runtime stubbed.");
    });

    await runPhase(8, async () => {
      if (this.config.skipWorkers) {
        degradedReasons.push("Background workers skipped.");
      }
    });

    if (!(await runPhase(9, async () => {
      if (!bootWiring.facade) {
        throw new Error("AuroraFacade not wired.");
      }
    }))) {
      finalizeFailedBoot(bootWiring, this.runtime, degradedReasons);
      return this.result(false, "failed", bootWiring, phaseResults, startedAt, degradedReasons);
    }

    let state: PlatformLifecycleState = "failed";
    const verificationOk = await runPhase(10, async () => {
      syncDegradedReasons(bootWiring, degradedReasons);
      const health = await bootWiring.healthCheck();
      if (health.lifecycle !== "initializing") {
        throw new Error("Health verification failed: premature lifecycle state.");
      }
    });

    if (criticalFailure) {
      state = "failed";
    } else if (!verificationOk) {
      state = "failed";
      degradedReasons.push("Phase 10 health verification failed.");
    } else if (degradedReasons.length > 0) {
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
    syncDegradedReasons(bootWiring, degradedReasons);
    this.runtime.attachWiring(bootWiring);

    if ((state === "ready" || state === "degraded") && !this.config.skipWorkers) {
      await bootWiring.startBackgroundWorkers();
    }

    return this.result(!criticalFailure && state !== "failed", state, bootWiring, phaseResults, startedAt, degradedReasons);
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
      syncDegradedReasons(wiring, degradedReasons);
    } else if (state === "failed") {
      wiring.lifecycle = state;
      syncDegradedReasons(wiring, degradedReasons);
      this.runtime.attachWiring(wiring);
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

import { AURORA_ERR_0503, AURORA_ERR_0509, AuroraError } from "@/lib/aurora/errors/AuroraError";
import { AuroraBootstrap } from "@/lib/aurora/runtime/AuroraBootstrap";
import { AuroraShutdown } from "@/lib/aurora/runtime/AuroraShutdown";
import type {
  AuroraRuntimeConfiguration,
  AuroraWiringConfig,
} from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import type { PlatformLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import { isActiveLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import type { AuroraWiring } from "@/lib/aurora/wiring/AuroraWiring";
import type { BootResult, AuroraHealthReport, ShutdownResult } from "@/types/aurora-platform";

export type ShutdownOptions = {
  readonly reason: "sigterm" | "admin" | "orion_shutdown" | "restart";
  readonly publishDrainTimeoutMs?: number;
  readonly agentDrainTimeoutMs?: number;
  readonly queueDrainTimeoutMs?: number;
  readonly force?: boolean;
};

export class AuroraRuntime {
  private state: PlatformLifecycleState = "created";
  private wiring: AuroraWiring | null = null;
  private readonly degradedReasons: string[] = [];

  constructor(private readonly config: AuroraRuntimeConfiguration | AuroraWiringConfig) {}

  getLifecycleState(): PlatformLifecycleState {
    return this.state;
  }

  getWiring(): AuroraWiring {
    if (!this.wiring || !isActiveLifecycleState(this.state)) {
      throw new AuroraError(AURORA_ERR_0503, "Platform not ready.", 503);
    }
    return this.wiring;
  }

  async getHealthReport(): Promise<AuroraHealthReport | null> {
    if (!this.wiring) {
      return null;
    }
    return this.wiring.healthCheck();
  }

  attachWiring(wiring: AuroraWiring): void {
    this.wiring = wiring;
    this.state = wiring.lifecycle;
  }

  async boot(): Promise<BootResult> {
    if (this.state === "ready" || this.state === "degraded") {
      return {
        success: true,
        state: this.state,
        wiring: this.getWiring(),
        phaseResults: [],
        totalDurationMs: 0,
        degradedReasons: [...this.degradedReasons],
      };
    }

    this.state = "initializing";
    const bootstrap = new AuroraBootstrap(this.config as AuroraWiringConfig, this);
    const result = await bootstrap.run();
    this.wiring = result.wiring;
    this.state = result.state;
    this.degradedReasons.splice(0, this.degradedReasons.length, ...result.degradedReasons);

    if (!result.success && result.state === "failed") {
      throw new AuroraError(AURORA_ERR_0509, "Aurora boot failed.", 503, result.phaseResults);
    }

    return result;
  }

  async shutdown(options: ShutdownOptions = { reason: "admin" }): Promise<ShutdownResult> {
    if (this.state === "shutdown" || this.state === "created") {
      return {
        success: true,
        durationMs: 0,
        drainedJobs: 0,
        forceCancelledJobs: 0,
        phases: [],
      };
    }

    if (!this.wiring) {
      this.state = "shutdown";
      return {
        success: true,
        durationMs: 0,
        drainedJobs: 0,
        forceCancelledJobs: 0,
        phases: [],
      };
    }

    this.state = "draining";
    const shutdown = new AuroraShutdown();
    const result = await shutdown.run(this.wiring, options);
    this.wiring = null;
    this.state = "shutdown";
    return result;
  }

  async restart(): Promise<BootResult> {
    await this.shutdown({ reason: "restart" });
    return this.boot();
  }
}

export function createTestAuroraRuntime(config: AuroraWiringConfig): AuroraRuntime {
  return new AuroraRuntime(config);
}

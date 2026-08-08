import type { ShutdownOptions } from "@/lib/aurora/runtime/AuroraRuntime";
import type { PlatformLifecycleState } from "@/lib/aurora/runtime/PlatformLifecycleState";
import type { AuroraWiring } from "@/lib/aurora/wiring/AuroraWiring";
import type { AuroraHealthReport, ShutdownResult } from "@/types/aurora-platform";

/** Minimal runtime surface required by the composition root (breaks import cycle). */
export interface AuroraRuntimeLike {
  attachWiring(wiring: AuroraWiring): void;
  shutdown(options?: ShutdownOptions): Promise<ShutdownResult>;
  getLifecycleState(): PlatformLifecycleState;
  getHealthReport(): Promise<AuroraHealthReport | null>;
}

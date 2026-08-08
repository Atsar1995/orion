import type { BootPhase } from "@/types/aurora-platform";

/** Critical boot phases abort to `failed` per ES-AURORA-005 §3.4 and REG-5. */
export const CRITICAL_BOOT_PHASES: ReadonlySet<BootPhase> = new Set([0, 1, 3, 5, 6, 9]);

export function isCriticalBootPhase(phase: BootPhase): boolean {
  return CRITICAL_BOOT_PHASES.has(phase);
}

/** Phases permitted to contribute degraded reasons without aborting. */
export const DEGRADED_BOOT_PHASES: ReadonlySet<BootPhase> = new Set([2, 4, 7, 8]);

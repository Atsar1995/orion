import { AuroraRuntime } from "@/lib/aurora/runtime/AuroraRuntime";
import { AuroraRuntimeConfiguration } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";

let auroraRuntime: AuroraRuntime | null = null;

export async function initializeAuroraModule(): Promise<AuroraRuntime> {
  if (!process.env.AURORA_ENABLED || process.env.AURORA_ENABLED === "false") {
    auroraRuntime = new AuroraRuntime(AuroraRuntimeConfiguration.forTest({ enabled: false }));
    return auroraRuntime;
  }

  if (!auroraRuntime) {
    auroraRuntime = new AuroraRuntime(AuroraRuntimeConfiguration.fromEnvironment());
  }

  const state = auroraRuntime.getLifecycleState();
  if (state === "created" || state === "shutdown") {
    await auroraRuntime.boot();
  }

  return auroraRuntime;
}

export function resetAuroraModuleForTests(): void {
  auroraRuntime = null;
}

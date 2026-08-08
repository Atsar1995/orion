import { createAuroraWiring } from "@/lib/aurora/createAuroraWiring";
import { AuroraRuntime } from "@/lib/aurora/runtime/AuroraRuntime";
import { AuroraRuntimeConfiguration } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import type { AuroraWiringConfig } from "@/lib/aurora/wiring/AuroraWiring";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";

export function createTestAuroraWiring(
  overrides: Partial<AuroraWiringConfig> = {},
) {
  const config: AuroraWiringConfig = {
    ...AuroraRuntimeConfiguration.forTest(),
    platformStore: new InMemoryPlatformStore(),
    skipWorkers: true,
    skipExternalConnections: true,
    enabled: true,
    initialLifecycle: "ready",
    ...overrides,
  };
  const runtime = new AuroraRuntime(config);
  return createAuroraWiring(config, runtime);
}

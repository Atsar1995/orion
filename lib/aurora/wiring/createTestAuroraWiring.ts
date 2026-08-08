import { createAuroraWiring } from "@/lib/aurora/createAuroraWiring";
import { AuroraRuntimeConfiguration } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import type { AuroraWiringConfig } from "@/lib/aurora/wiring/AuroraWiring";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";

export function createTestAuroraWiring(
  overrides: Partial<AuroraWiringConfig> = {},
) {
  return createAuroraWiring({
    ...AuroraRuntimeConfiguration.forTest(),
    platformStore: new InMemoryPlatformStore(),
    skipWorkers: true,
    skipExternalConnections: true,
    enabled: true,
    ...overrides,
  });
}

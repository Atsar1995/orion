import { createAuroraRepositories } from "@/lib/aurora/persistence/createAuroraRepositories";
import { ensureAuroraPlatformBacking } from "@/lib/aurora/persistence/AuroraPlatformBacking";
import type { AuroraWiringConfig } from "@/lib/aurora/wiring/AuroraWiring";
import { InMemoryPlatformStore } from "@/lib/platform/store/InMemoryPlatformStore";

export function createAuroraPersistenceWiring(config: AuroraWiringConfig) {
  const platformStore = config.platformStore ?? new InMemoryPlatformStore();
  const backing = ensureAuroraPlatformBacking(platformStore);
  const repositories = createAuroraRepositories(backing);
  return { platformStore, backing, repositories };
}

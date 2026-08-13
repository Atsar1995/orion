import type { AuroraRepositories } from "@/lib/aurora/admin/repositories/TenantRepository";
import {
  InMemoryBrandRepository,
  InMemoryConfigurationRepository,
  InMemoryBusinessEntityRepository,
  InMemoryScheduleRepository,
  InMemoryTenantRepository,
  InMemoryWorkspaceConfigRepository,
} from "@/lib/aurora/persistence/InMemoryAuroraRepository";
import type { AuroraStoreBacking } from "@/lib/aurora/persistence/AuroraStoreBacking";

/** Creates Aurora admin repositories from shared backing. */
export function createAuroraRepositories(backing: AuroraStoreBacking): AuroraRepositories {
  return {
    tenant: new InMemoryTenantRepository(backing),
    business: new InMemoryBusinessEntityRepository(backing),
    brand: new InMemoryBrandRepository(backing),
    configuration: new InMemoryConfigurationRepository(backing),
    schedule: new InMemoryScheduleRepository(backing),
    workspaceConfig: new InMemoryWorkspaceConfigRepository(backing),
  };
}

export type { AuroraRepositories };

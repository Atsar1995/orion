import type { AuroraRepositories } from "@/lib/aurora/admin/repositories/TenantRepository";
import {
  InMemoryBrandRepository,
  InMemoryBusinessEntityRepository,
  InMemoryScheduleRepository,
  InMemoryTenantRepository,
} from "@/lib/aurora/persistence/InMemoryAuroraRepository";
import type { AuroraStoreBacking } from "@/lib/aurora/persistence/AuroraStoreBacking";

/** Creates Aurora admin repositories from shared backing. */
export function createAuroraRepositories(backing: AuroraStoreBacking): AuroraRepositories {
  return {
    tenant: new InMemoryTenantRepository(backing),
    business: new InMemoryBusinessEntityRepository(backing),
    brand: new InMemoryBrandRepository(backing),
    schedule: new InMemoryScheduleRepository(backing),
  };
}

export type { AuroraRepositories };

import type { AuroraRepositories } from "@/lib/aurora/admin/repositories/TenantRepository";
import { PostgresTenantRepository } from "@/lib/aurora/persistence/PostgresTenantRepository";
import { PostgresBusinessEntityRepository } from "@/lib/aurora/persistence/PostgresBusinessEntityRepository";
import { PostgresBrandRepository } from "@/lib/aurora/persistence/PostgresBrandRepository";
import { PostgresConfigurationRepository } from "@/lib/aurora/persistence/PostgresConfigurationRepository";
import { PostgresScheduleRepository } from "@/lib/aurora/persistence/PostgresScheduleRepository";
import { PostgresWorkspaceConfigRepository } from "@/lib/aurora/persistence/PostgresWorkspaceConfigRepository";
import type { AuroraSystemDbScope } from "@/lib/aurora/persistence/AuroraSystemDbScope";
import type { AuroraTenantDbScope } from "@/lib/aurora/persistence/AuroraTenantDbScope";

/**
 * Creates the PostgreSQL-backed Aurora repository set.
 *
 * The tenant repository uses the controlled system scope.
 * All tenant-owned repositories use the application tenant scope.
 */
export function createAuroraPostgresRepositories(
  systemDbScope: AuroraSystemDbScope,
  tenantDbScope: AuroraTenantDbScope,
  tenantId: string,
): AuroraRepositories {
  return {
    tenant: new PostgresTenantRepository(systemDbScope),
    business: new PostgresBusinessEntityRepository(tenantDbScope),
    brand: new PostgresBrandRepository(tenantDbScope),
    configuration: new PostgresConfigurationRepository(tenantDbScope),
    schedule: new PostgresScheduleRepository(tenantDbScope),
    workspaceConfig: new PostgresWorkspaceConfigRepository(tenantDbScope),
  };
}

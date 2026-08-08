import type { AuroraRepositories } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { BusinessEntity } from "@/types/aurora-admin";

/** Creates an active default business for admin integration tests. */
export async function createTestBusiness(
  repositories: AuroraRepositories,
  tenantId: string,
  overrides: Partial<{ id: string; name: string; slug: string }> = {},
): Promise<BusinessEntity> {
  return repositories.business.create(overrides.id ?? crypto.randomUUID(), {
    tenantId,
    name: overrides.name ?? "Default Business",
    slug: overrides.slug ?? "default-business",
  });
}

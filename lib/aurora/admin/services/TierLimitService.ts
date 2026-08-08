/**
 * Single enforcement point for commercial tier limits (ES-AURORA-006 §3.1).
 * Permission mapping for structural admin ops uses existing catalog permissions only.
 */
import type { BrandRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { TenantRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import { AURORA_ERR_0429, AuroraError } from "@/lib/aurora/errors/AuroraError";
import type { ConfigurationService } from "@/lib/aurora/platform/services/ConfigurationService";

export class TierLimitService {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly brandRepository: BrandRepository,
    private readonly configurationService: ConfigurationService,
  ) {}

  async assertCanCreateBrand(tenantId: string): Promise<void> {
    const tenant = await this.tenantRepository.getById(tenantId);
    const tier = tenant?.tier ?? "starter";
    const limits = this.configurationService.getTierLimits(tier);
    const brands = await this.brandRepository.listByTenant(tenantId);
    const activeBrandCount = brands.filter((brand) => brand.status === "active").length;

    if (activeBrandCount >= limits.maxBrands) {
      throw new AuroraError(AURORA_ERR_0429, "Tier brand limit exceeded.", 429, {
        tenantId,
        tier,
        maxBrands: limits.maxBrands,
      });
    }
  }
}

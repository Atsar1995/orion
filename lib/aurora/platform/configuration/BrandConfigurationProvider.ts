import type {
  ConfigKey,
  ConfigurationProvider,
} from "@/lib/aurora/platform/configuration/ConfigurationProvider";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { BrandRepository } from "@/lib/aurora/admin/repositories/TenantRepository";

export class BrandConfigurationProvider
  implements ConfigurationProvider
{
  readonly priority = 300;
  readonly scope = "brand" as const;

  constructor(
    private readonly repository: BrandRepository,
  ) {}

  async get(
    key: ConfigKey,
    ctx: AuroraRuntimeContext,
  ): Promise<unknown | undefined> {
    const brand = await this.repository.getById(
      ctx.tenantId,
      ctx.brandId,
    );

    if (!brand) {
      return undefined;
    }

    switch (key) {
      case "brand":
        return brand;
      case "brandId":
        return brand.id;
      case "brandName":
        return brand.name;
      case "brandSlug":
        return brand.slug;
      case "brandLocale":
        return brand.locale;
      case "brandTimezone":
        return brand.timezone;
      case "brandStatus":
        return brand.status;
      default:
        return undefined;
    }
  }
}

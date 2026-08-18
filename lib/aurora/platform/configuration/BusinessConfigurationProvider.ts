import type {
  ConfigKey,
  ConfigurationProvider,
} from "@/lib/aurora/platform/configuration/ConfigurationProvider";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { BusinessEntityRepository } from "@/lib/aurora/admin/repositories/BusinessEntityRepository";

export class BusinessConfigurationProvider
  implements ConfigurationProvider
{
  readonly priority = 400;
  readonly scope = "business" as const;

  constructor(
    private readonly repository: BusinessEntityRepository,
  ) {}

  async get(
    key: ConfigKey,
    ctx: AuroraRuntimeContext,
  ): Promise<unknown | undefined> {
    const business = await this.repository.getById(
      ctx.tenantId,
      ctx.businessId,
    );

    if (!business) {
      return undefined;
    }

    switch (key) {
      case "business":
        return business;
      case "businessId":
        return business.id;
      case "businessName":
        return business.name;
      case "businessSlug":
        return business.slug;
      case "businessStatus":
        return business.status;
      default:
        return undefined;
    }
  }
}

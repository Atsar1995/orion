import type {
  ConfigKey,
  ConfigurationProvider,
} from "@/lib/aurora/platform/configuration/ConfigurationProvider";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { ConfigurationRepository } from "@/lib/aurora/admin/repositories/TenantRepository";

export class TenantConfigurationProvider
  implements ConfigurationProvider
{
  readonly priority = 500;
  readonly scope = "tenant" as const;

  constructor(
    private readonly repository: ConfigurationRepository,
  ) {}

  async get(
    key: ConfigKey,
    ctx: AuroraRuntimeContext,
  ): Promise<unknown | undefined> {
    const config = await this.repository.get(ctx.tenantId);

    if (!config) {
      return undefined;
    }

    switch (key) {
      case "tier":
        return config.tier;
      case "approvalPolicy":
        return config.approvalPolicy;
      case "tokenBudget":
        return config.tokenBudget;
      case "featureOverrides":
        return config.featureOverrides;
      case "limits":
        return config.limits;
      default:
        return undefined;
    }
  }
}

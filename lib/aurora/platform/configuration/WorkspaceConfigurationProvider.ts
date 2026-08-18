import type {
  ConfigKey,
  ConfigurationProvider,
} from "@/lib/aurora/platform/configuration/ConfigurationProvider";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { WorkspaceConfigRepository } from "@/lib/aurora/admin/repositories/TenantRepository";

export class WorkspaceConfigurationProvider
  implements ConfigurationProvider
{
  readonly priority = 200;
  readonly scope = "workspace" as const;

  constructor(
    private readonly repository: WorkspaceConfigRepository,
  ) {}

  async get(
    key: ConfigKey,
    ctx: AuroraRuntimeContext,
  ): Promise<unknown | undefined> {
    const config = await this.repository.get(
      ctx.tenantId,
      ctx.userId,
    );

    if (!config) {
      return undefined;
    }

    switch (key) {
      case "workspace":
        return config;
      case "activeBrandId":
        return config.activeBrandId;
      case "dashboardLayout":
        return config.dashboardLayout;
      case "notificationPreferences":
        return config.notificationPreferences;
      default:
        return undefined;
    }
  }
}

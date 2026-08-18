import type {
  ConfigKey,
  ConfigurationProvider,
} from "@/lib/aurora/platform/configuration/ConfigurationProvider";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

export class EnvironmentConfigurationProvider
  implements ConfigurationProvider
{
  readonly priority = 600;
  readonly scope = "environment" as const;

  constructor(
    private readonly values: Readonly<Record<string, unknown>> = {},
  ) {}

  async get(
    key: ConfigKey,
    _ctx: AuroraRuntimeContext,
  ): Promise<unknown | undefined> {
    return this.values[key];
  }
}

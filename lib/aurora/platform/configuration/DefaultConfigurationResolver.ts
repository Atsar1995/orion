import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type {
  ConfigKey,
  ConfigurationProvider,
} from "@/lib/aurora/platform/configuration/ConfigurationProvider";
import type {
  ConfigurationResolution,
  ConfigurationResolver,
} from "@/lib/aurora/platform/configuration/ConfigurationResolver";

export class DefaultConfigurationResolver
  implements ConfigurationResolver
{
  private readonly providers: readonly ConfigurationProvider[];

  constructor(providers: readonly ConfigurationProvider[]) {
    this.providers = [...providers].sort(
      (left, right) => right.priority - left.priority,
    );
  }

  async resolve(
    key: ConfigKey,
    ctx: AuroraRuntimeContext,
  ): Promise<ConfigurationResolution> {
    for (const provider of this.providers) {
      const value = await provider.get(key, ctx);

      if (value !== undefined) {
        return {
          key,
          value,
          providerScope: provider.scope,
          providerPriority: provider.priority,
        };
      }
    }

    return {
      key,
      value: undefined,
    };
  }
}

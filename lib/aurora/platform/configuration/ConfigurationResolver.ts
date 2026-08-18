import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type {
  ConfigKey,
  ConfigurationProvider,
} from "@/lib/aurora/platform/configuration/ConfigurationProvider";

export type ConfigurationResolution = {
  readonly key: ConfigKey;
  readonly value: unknown | undefined;
  readonly providerScope?: ConfigurationProvider["scope"];
  readonly providerPriority?: number;
};

export interface ConfigurationResolver {
  resolve(
    key: ConfigKey,
    ctx: AuroraRuntimeContext,
  ): Promise<ConfigurationResolution>;
}

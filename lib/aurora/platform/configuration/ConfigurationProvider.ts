import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

export type ConfigProviderScope =
  | "environment"
  | "workspace"
  | "brand"
  | "business"
  | "tenant"
  | "global";

export type ConfigKey = string;

export interface ConfigurationProvider {
  readonly priority: number;
  readonly scope: ConfigProviderScope;

  get(
    key: ConfigKey,
    ctx: AuroraRuntimeContext,
  ): Promise<unknown | undefined>;
}

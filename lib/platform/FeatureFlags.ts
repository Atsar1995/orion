import type { FeatureFlagScope } from "@/types/services";

/** Feature flag evaluation scope for the executive platform. */
export type PlatformFeatureFlagScope = FeatureFlagScope;

/** Static feature flag definition for EP-001 configuration. */
export type PlatformFeatureFlagDefinition = {
  readonly key: string;
  readonly description: string;
  readonly defaultEnabled: boolean;
  readonly scope: PlatformFeatureFlagScope;
};

/**
 * EP-001 feature flag contract.
 *
 * Runtime evaluation is provided by platform services in later epics.
 */
export interface FeatureFlags {
  isEnabled(key: string, scope?: PlatformFeatureFlagScope, scopeId?: string): boolean;
  getDefinition(key: string): PlatformFeatureFlagDefinition | undefined;
  list(): readonly PlatformFeatureFlagDefinition[];
}

/** Default EP-001 feature flag catalogue — configuration only. */
export const DEFAULT_PLATFORM_FEATURE_FLAGS: readonly PlatformFeatureFlagDefinition[] = [
  {
    key: "executive.brief.enabled",
    description: "Enable Morning Executive Brief surface",
    defaultEnabled: true,
    scope: "organization",
  },
  {
    key: "executive.command-center.enabled",
    description: "Enable Command Center surface",
    defaultEnabled: true,
    scope: "organization",
  },
  {
    key: "executive.ai-summary.enabled",
    description: "Enable async AI summary lane on executive surfaces",
    defaultEnabled: false,
    scope: "organization",
  },
] as const;

/** Static feature flag evaluator for EP-001 — no remote configuration. */
export class StaticFeatureFlags implements FeatureFlags {
  private readonly definitions: readonly PlatformFeatureFlagDefinition[];

  constructor(definitions: readonly PlatformFeatureFlagDefinition[] = DEFAULT_PLATFORM_FEATURE_FLAGS) {
    this.definitions = definitions;
  }

  isEnabled(key: string): boolean {
    return this.getDefinition(key)?.defaultEnabled ?? false;
  }

  getDefinition(key: string): PlatformFeatureFlagDefinition | undefined {
    return this.definitions.find((definition) => definition.key === key);
  }

  list(): readonly PlatformFeatureFlagDefinition[] {
    return this.definitions;
  }
}

export const defaultFeatureFlags = new StaticFeatureFlags();

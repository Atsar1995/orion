import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { AuroraRuntimeConfiguration, AuroraWiringConfig } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import {
  AURORA_MAX_BRANDS_PROFESSIONAL,
  AURORA_MAX_BRANDS_STARTER,
} from "@/lib/aurora/constants";
import type { CommercialTier, TenantConfig, TierLimits } from "@/types/aurora-admin";
import type { ConfigValidationResult } from "@/types/aurora-platform";
import { validateAuroraConfig } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import type { AuroraStoreBacking } from "@/lib/aurora/persistence/AuroraStoreBacking";
import type { ConfigurationCache } from "@/lib/aurora/platform/cache/ConfigurationCache";

export interface ConfigurationService {
  getTenantConfig(ctx: AuroraRuntimeContext): Promise<TenantConfig>;
  getFeatureFlags(ctx: AuroraRuntimeContext): Promise<Readonly<Record<string, boolean>>>;
  getTierLimits(tier: CommercialTier): TierLimits;
  validateConfig(): ConfigValidationResult;
}

const TIER_LIMITS: Record<CommercialTier, TierLimits> = {
  starter: {
    maxBrands: AURORA_MAX_BRANDS_STARTER,
    maxStorageMb: 256,
    dailyAgentTokens: 10_000,
  },
  professional: {
    maxBrands: AURORA_MAX_BRANDS_PROFESSIONAL,
    maxStorageMb: 1024,
    dailyAgentTokens: 50_000,
  },
  agency: {
    maxBrands: 25,
    maxStorageMb: 5120,
    dailyAgentTokens: 100_000,
  },
  enterprise: {
    maxBrands: 100,
    maxStorageMb: 20_480,
    dailyAgentTokens: 500_000,
  },
};

export class DefaultConfigurationService implements ConfigurationService {
  constructor(
    private readonly config: AuroraRuntimeConfiguration,
    private readonly backing: AuroraStoreBacking,
    private readonly cache: ConfigurationCache,
  ) {}

  async getTenantConfig(ctx: AuroraRuntimeContext): Promise<TenantConfig> {
    const cached = this.cache.get(ctx.tenantId);
    if (cached) {
      return cached;
    }

    const existing = this.backing.tenantConfigs.get(ctx.tenantId);
    if (existing) {
      this.cache.set(ctx.tenantId, existing);
      return existing;
    }

    const tenant = this.backing.tenants.get(ctx.tenantId);
    const tier = tenant?.tier ?? "starter";
    const fallback: TenantConfig = {
      tenantId: ctx.tenantId,
      tier,
      approvalPolicy: {},
      tokenBudget: this.config.maxAgentTokensPerTenantDay,
      featureOverrides: {},
      limits: this.getTierLimits(tier),
    };
    this.backing.tenantConfigs.set(ctx.tenantId, fallback);
    this.cache.set(ctx.tenantId, fallback);
    return fallback;
  }

  async getFeatureFlags(ctx: AuroraRuntimeContext): Promise<Readonly<Record<string, boolean>>> {
    const tenantConfig = await this.getTenantConfig(ctx);
    return {
      ...this.config.featureFlags,
      ...tenantConfig.featureOverrides,
    };
  }

  getTierLimits(tier: CommercialTier): TierLimits {
    return TIER_LIMITS[tier];
  }

  validateConfig(): ConfigValidationResult {
    const wiringConfig = this.config as AuroraWiringConfig;
    if (wiringConfig.forceConfigValidationFailure) {
      return { valid: false, errors: ["Forced configuration validation failure."] };
    }
    return validateAuroraConfig(this.config);
  }
}

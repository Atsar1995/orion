import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { AuroraRuntimeConfiguration, AuroraWiringConfig } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import {
  AURORA_MAX_BRANDS_PROFESSIONAL,
  AURORA_MAX_BRANDS_STARTER,
} from "@/lib/aurora/constants";
import type { CommercialTier, TenantConfig, TierLimits } from "@/types/aurora-admin";
import type { ConfigValidationResult } from "@/types/aurora-platform";
import { validateAuroraConfig } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import type {
  ConfigurationRepository,
  TenantRepository,
} from "@/lib/aurora/admin/repositories/TenantRepository";
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

const CONFIG_CACHE_TTL_SECONDS = 300;

function isTenantConfig(value: unknown): value is TenantConfig {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Partial<TenantConfig>;
  return typeof candidate.tenantId === "string" && typeof candidate.tier === "string";
}

export class DefaultConfigurationService implements ConfigurationService {
  constructor(
    private readonly config: AuroraRuntimeConfiguration,
    private readonly tenantRepository: TenantRepository,
    private readonly repository: ConfigurationRepository,
    private readonly cache: ConfigurationCache,
  ) {}

  async getTenantConfig(ctx: AuroraRuntimeContext): Promise<TenantConfig> {
    const cacheKey = `tenant:${ctx.tenantId}:config`;
    const cached = await this.cache.get(cacheKey);
    if (isTenantConfig(cached)) {
      return cached;
    }

    const existing = await this.repository.get(ctx.tenantId);
    if (existing) {
      await this.cache.set(cacheKey, existing, CONFIG_CACHE_TTL_SECONDS);
      return existing;
    }

    const tenant = await this.tenantRepository.getById(ctx.tenantId);
    const tier = tenant?.tier ?? "starter";
    const fallback: TenantConfig = {
      tenantId: ctx.tenantId,
      tier,
      approvalPolicy: {},
      tokenBudget: this.config.maxAgentTokensPerTenantDay,
      featureOverrides: {},
      limits: this.getTierLimits(tier),
    };
    await this.repository.upsert(fallback);
    await this.cache.set(cacheKey, fallback, CONFIG_CACHE_TTL_SECONDS);
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

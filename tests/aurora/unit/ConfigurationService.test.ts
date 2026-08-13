import { describe, expect, it } from "vitest";
import { DefaultConfigurationService } from "@/lib/aurora/platform/services/ConfigurationService";
import { InMemoryConfigurationCache } from "@/lib/aurora/platform/cache/InMemoryConfigurationCache";
import { AuroraRuntimeConfiguration } from "@/lib/aurora/runtime/AuroraRuntimeConfiguration";
import { createAuroraStore } from "@/lib/aurora/persistence/createAuroraStore";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

function createContext(tenantId: string): AuroraRuntimeContext {
  return {
    tenantId,
  } as AuroraRuntimeContext;
}

describe("DefaultConfigurationService", () => {
  function createService() {
    const backing = createAuroraStore();
    const cache = new InMemoryConfigurationCache();
    const config = {
      ...AuroraRuntimeConfiguration.forTest(),
      featureFlags: {
        ...AuroraRuntimeConfiguration.forTest().featureFlags,
        globalFeature: true,
        overriddenFeature: true,
      },
    };

    return {
      service: new DefaultConfigurationService(config, backing, cache),
      backing,
      cache,
      config,
    };
  }

  it("returns an existing tenant configuration from backing", async () => {
    const { service, backing } = createService();

    backing.tenantConfigs.set("tenant-a", {
      tenantId: "tenant-a",
      tier: "professional",
      approvalPolicy: {},
      tokenBudget: 50_000,
      featureOverrides: {},
      limits: {
        maxBrands: 5,
        maxStorageMb: 1024,
        dailyAgentTokens: 50_000,
      },
    });

    const result = await service.getTenantConfig(createContext("tenant-a"));

    expect(result.tenantId).toBe("tenant-a");
    expect(result.tier).toBe("professional");
  });

  it("populates the cache when loading configuration from backing", async () => {
    const { service, backing, cache } = createService();

    const config = {
      tenantId: "tenant-a",
      tier: "professional" as const,
      approvalPolicy: {},
      tokenBudget: 50_000,
      featureOverrides: {},
      limits: {
        maxBrands: 5,
        maxStorageMb: 1024,
        dailyAgentTokens: 50_000,
      },
    };

    backing.tenantConfigs.set("tenant-a", config);

    await service.getTenantConfig(createContext("tenant-a"));

    expect(await cache.get("tenant:tenant-a:config")).toEqual(config);
  });

  it("returns cached configuration before consulting backing", async () => {
    const { service, backing, cache } = createService();

    const config = {
      tenantId: "tenant-a",
      tier: "professional" as const,
      approvalPolicy: {},
      tokenBudget: 50_000,
      featureOverrides: {},
      limits: {
        maxBrands: 5,
        maxStorageMb: 1024,
        dailyAgentTokens: 50_000,
      },
    };

    await cache.set("tenant:tenant-a:config", config, 300);

    const result = await service.getTenantConfig(createContext("tenant-a"));

    expect(result).toEqual(config);
    expect(backing.tenantConfigs.has("tenant-a")).toBe(false);
  });

  it("creates a starter fallback when no tenant or config exists", async () => {
    const { service, backing } = createService();

    const result = await service.getTenantConfig(createContext("tenant-a"));

    expect(result).toEqual({
      tenantId: "tenant-a",
      tier: "starter",
      approvalPolicy: {},
      tokenBudget: 50_000,
      featureOverrides: {},
      limits: {
        maxBrands: 1,
        maxStorageMb: 256,
        dailyAgentTokens: 10_000,
      },
    });

    expect(backing.tenantConfigs.get("tenant-a")).toEqual(result);
  });

  it("derives the fallback tier from the existing tenant", async () => {
    const { service, backing } = createService();

    const now = new Date().toISOString();

    backing.tenants.set("tenant-a", {
      id: "tenant-a",
      name: "Tenant A",
      slug: "tenant-a",
      tier: "enterprise",
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    const result = await service.getTenantConfig(createContext("tenant-a"));

    expect(result.tenantId).toBe("tenant-a");
    expect(result.tier).toBe("enterprise");
    expect(result.limits).toEqual({
      maxBrands: 100,
      maxStorageMb: 20_480,
      dailyAgentTokens: 500_000,
    });
  });

  it("merges global feature flags with tenant overrides", async () => {
    const { service, backing, config } = createService();

    backing.tenantConfigs.set("tenant-a", {
      tenantId: "tenant-a",
      tier: "professional",
      approvalPolicy: {},
      tokenBudget: 50_000,
      featureOverrides: {
        tenantFeature: true,
        overriddenFeature: false,
      },
      limits: {
        maxBrands: 5,
        maxStorageMb: 1024,
        dailyAgentTokens: 50_000,
      },
    });

    const result = await service.getFeatureFlags(createContext("tenant-a"));

    expect(result).toEqual({
      globalFeature: true,
      overriddenFeature: false,
      tenantFeature: true,
    });
  });
});

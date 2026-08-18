import { describe, expect, it, vi } from "vitest";
import { TenantConfigurationProvider } from "@/lib/aurora/platform/configuration/TenantConfigurationProvider";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { ConfigurationRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { TenantConfig } from "@/types/aurora-admin";

function createContext(
  overrides: Partial<AuroraRuntimeContext> = {},
): AuroraRuntimeContext {
  return {
    tenantId: "tenant-a",
    userId: "user-a",
    orionOrganizationId: "org-a",
    workspaceId: "workspace-a",
    roles: [],
    auroraPermissions: [],
    brandId: "brand-a",
    businessId: "business-a",
    locale: "en-US",
    timezone: "UTC",
    requestId: "request-a",
    correlationId: "correlation-a",
    contextSource: "test-manual",
    platformState: "ready",
    featureFlags: {},
    ...overrides,
  };
}

function createConfig(): TenantConfig {
  return {
    tenantId: "tenant-a",
    tier: "professional",
    approvalPolicy: {
      "content.publish": 1,
    },
    tokenBudget: 50_000,
    featureOverrides: {
      "tenant.feature": true,
    },
    limits: {
      maxBrands: 5,
      maxStorageMb: 1024,
      dailyAgentTokens: 50_000,
    },
  };
}

function createRepository(
  config: TenantConfig | null,
): ConfigurationRepository {
  return {
    get: vi.fn(async (tenantId: string) => {
      if (tenantId !== config?.tenantId) {
        return null;
      }
      return config;
    }),
    upsert: vi.fn(async (value: TenantConfig) => value),
  };
}

describe("TenantConfigurationProvider", () => {
  it("returns tenant configuration values by key", async () => {
    const config = createConfig();
    const repository = createRepository(config);
    const provider = new TenantConfigurationProvider(repository);

    const ctx = createContext();

    expect(await provider.get("tier", ctx)).toBe("professional");
    expect(await provider.get("approvalPolicy", ctx)).toEqual({
      "content.publish": 1,
    });
    expect(await provider.get("tokenBudget", ctx)).toBe(50_000);
    expect(await provider.get("featureOverrides", ctx)).toEqual({
      "tenant.feature": true,
    });
    expect(await provider.get("limits", ctx)).toEqual({
      maxBrands: 5,
      maxStorageMb: 1024,
      dailyAgentTokens: 50_000,
    });
  });

  it("reads configuration using the context tenant id", async () => {
    const config = createConfig();
    const repository = createRepository(config);
    const provider = new TenantConfigurationProvider(repository);

    await provider.get("tier", createContext({ tenantId: "tenant-a" }));

    expect(repository.get).toHaveBeenCalledWith("tenant-a");
    expect(repository.get).toHaveBeenCalledTimes(1);
  });

  it("returns undefined when the tenant has no configuration", async () => {
    const repository = createRepository(null);
    const provider = new TenantConfigurationProvider(repository);

    expect(
      await provider.get("tier", createContext()),
    ).toBeUndefined();
  });

  it("returns undefined for an unsupported configuration key", async () => {
    const config = createConfig();
    const repository = createRepository(config);
    const provider = new TenantConfigurationProvider(repository);

    expect(
      await provider.get("unknown.key", createContext()),
    ).toBeUndefined();
  });

  it("has tenant scope and priority 500", () => {
    const repository = createRepository(null);
    const provider = new TenantConfigurationProvider(repository);

    expect(provider.scope).toBe("tenant");
    expect(provider.priority).toBe(500);
  });

  it("propagates repository failures", async () => {
    const repository: ConfigurationRepository = {
      get: vi.fn(async () => {
        throw new Error("repository failure");
      }),
      upsert: vi.fn(async (value: TenantConfig) => value),
    };

    const provider = new TenantConfigurationProvider(repository);

    await expect(
      provider.get("tier", createContext()),
    ).rejects.toThrow("repository failure");
  });
});

import { describe, expect, it } from "vitest";
import { InMemoryConfigurationCache } from "@/lib/aurora/platform/cache/InMemoryConfigurationCache";
import type { TenantConfig } from "@/types/aurora-admin";

function createConfig(tenantId: string): TenantConfig {
  return {
    tenantId,
    tier: "professional",
    approvalPolicy: {},
    tokenBudget: 50_000,
    featureOverrides: {},
    limits: {
      maxBrands: 5,
      maxStorageMb: 1024,
      dailyAgentTokens: 50_000,
    },
  };
}

describe("InMemoryConfigurationCache", () => {
  it("returns null for a tenant that is not cached", () => {
    const cache = new InMemoryConfigurationCache();

    expect(cache.get("tenant-a")).toBeNull();
  });

  it("stores and retrieves tenant configuration", () => {
    const cache = new InMemoryConfigurationCache();
    const config = createConfig("tenant-a");

    cache.set("tenant-a", config);

    expect(cache.get("tenant-a")).toEqual(config);
  });

  it("invalidates one tenant without affecting another", () => {
    const cache = new InMemoryConfigurationCache();
    const configA = createConfig("tenant-a");
    const configB = createConfig("tenant-b");

    cache.set("tenant-a", configA);
    cache.set("tenant-b", configB);

    cache.invalidate("tenant-a");

    expect(cache.get("tenant-a")).toBeNull();
    expect(cache.get("tenant-b")).toEqual(configB);
  });

  it("clears all cached configuration", () => {
    const cache = new InMemoryConfigurationCache();

    cache.set("tenant-a", createConfig("tenant-a"));
    cache.set("tenant-b", createConfig("tenant-b"));

    cache.clear();

    expect(cache.get("tenant-a")).toBeNull();
    expect(cache.get("tenant-b")).toBeNull();
  });

  it("replaces an existing tenant configuration", () => {
    const cache = new InMemoryConfigurationCache();
    const first = createConfig("tenant-a");
    const second = {
      ...createConfig("tenant-a"),
      tokenBudget: 75_000,
    };

    cache.set("tenant-a", first);
    cache.set("tenant-a", second);

    expect(cache.get("tenant-a")).toEqual(second);
  });
});
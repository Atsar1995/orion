import { describe, expect, it } from "vitest";
import { InMemoryConfigurationCache } from "@/lib/aurora/platform/cache/InMemoryConfigurationCache";

describe("InMemoryConfigurationCache", () => {
  it("returns undefined for a missing key", async () => {
    const cache = new InMemoryConfigurationCache();

    expect(await cache.get("tenant:tenant-a:config")).toBeUndefined();
  });

  it("stores and retrieves a value", async () => {
    const cache = new InMemoryConfigurationCache();
    const config = { tenantId: "tenant-a", tier: "professional" };

    await cache.set("tenant:tenant-a:config", config, 300);

    expect(await cache.get("tenant:tenant-a:config")).toEqual(config);
  });

  it("expires values after the TTL", async () => {
    const cache = new InMemoryConfigurationCache();

    await cache.set("tenant:tenant-a:config", { value: true }, 0);

    expect(await cache.get("tenant:tenant-a:config")).toBeUndefined();
  });

  it("invalidates matching wildcard keys", async () => {
    const cache = new InMemoryConfigurationCache();

    await cache.set("tenant:tenant-a:config", { value: 1 }, 300);
    await cache.set("tenant:tenant-a:flags", { value: 2 }, 300);
    await cache.set("tenant:tenant-b:config", { value: 3 }, 300);

    const removed = await cache.invalidate("tenant:tenant-a:*");

    expect(removed).toBe(2);
    expect(await cache.get("tenant:tenant-a:config")).toBeUndefined();
    expect(await cache.get("tenant:tenant-a:flags")).toBeUndefined();
    expect(await cache.get("tenant:tenant-b:config")).toEqual({ value: 3 });
  });

  it("invalidates only one tenant", async () => {
    const cache = new InMemoryConfigurationCache();

    await cache.set("tenant:tenant-a:config", { tenantId: "tenant-a" }, 300);
    await cache.set("tenant:tenant-a:flags", { tenantId: "tenant-a" }, 300);
    await cache.set("tenant:tenant-b:config", { tenantId: "tenant-b" }, 300);

    await cache.invalidateTenant("tenant-a");

    expect(await cache.get("tenant:tenant-a:config")).toBeUndefined();
    expect(await cache.get("tenant:tenant-a:flags")).toBeUndefined();
    expect(await cache.get("tenant:tenant-b:config")).toEqual({
      tenantId: "tenant-b",
    });
  });
});
import { describe, expect, it } from "vitest";
import { ProviderRegistry } from "@/lib/providers/ProviderRegistry";
import { CRMProvider } from "@/lib/providers/MockProvider";
import type { Provider } from "@/types/providers";

describe("ProviderRegistry", () => {
  it("registers default mock providers on construction", () => {
    const registry = new ProviderRegistry(true);
    const providers = registry.getAllProviders();

    expect(providers.length).toBeGreaterThanOrEqual(7);
    expect(registry.getProvider("crm")).toBeDefined();
    expect(registry.getProvider("finance")).toBeDefined();
  });

  it("prevents duplicate provider registration", () => {
    const registry = new ProviderRegistry(false);
    const provider = new CRMProvider();

    registry.register(provider);
    expect(() => registry.register(provider)).toThrow(/already registered/);
  });

  it("unregisters providers by id", () => {
    const registry = new ProviderRegistry(false);
    const provider = new CRMProvider();

    registry.register(provider);
    expect(registry.unregister("crm")).toBe(true);
    expect(registry.getProvider("crm")).toBeUndefined();
  });

  it("returns only enabled providers as healthy", () => {
    const registry = new ProviderRegistry(false);
    const enabled: Provider = {
      id: "enabled",
      name: "Enabled",
      config: { id: "enabled", name: "Enabled", enabled: true },
      connect: async () => ({ success: true, providerId: "enabled", timestamp: "" }),
      disconnect: async () => ({ success: true, providerId: "enabled", timestamp: "" }),
      healthCheck: async () => ({
        success: true,
        providerId: "enabled",
        timestamp: "",
        data: { status: "connected", healthy: true, lastCheckedAt: "" },
      }),
      sync: async () => ({ success: true, providerId: "enabled", timestamp: "" }),
      refresh: async () => ({ success: true, providerId: "enabled", timestamp: "" }),
      getCapabilities: () => ["metrics"],
    };

    registry.register(enabled);
    expect(registry.getHealthyProviders()).toHaveLength(1);
  });
});

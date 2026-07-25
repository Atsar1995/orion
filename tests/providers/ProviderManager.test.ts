import { describe, expect, it } from "vitest";
import { ProviderManager } from "@/lib/providers/ProviderManager";
import { ProviderRegistry } from "@/lib/providers/ProviderRegistry";
import { CRMProvider } from "@/lib/providers/MockProvider";

describe("ProviderManager", () => {
  it("connects, syncs, and refreshes all registered providers", async () => {
    const registry = new ProviderRegistry(false);
    registry.register(new CRMProvider());
    const manager = new ProviderManager(registry);

    await manager.connectAll();
    await manager.syncAll();
    await manager.refreshAll();

    const report = await manager.healthReport();
    expect(report.total).toBe(1);
    expect(report.healthy).toBe(1);
  });

  it("reports provider health after lifecycle operations", async () => {
    const registry = new ProviderRegistry(true);
    const manager = new ProviderManager(registry);

    await manager.connectAll();
    const report = await manager.healthReport();

    expect(report.total).toBeGreaterThan(0);
    expect(report.providers.every((entry) => entry.health.healthy)).toBe(true);
  });
});

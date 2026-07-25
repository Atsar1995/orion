import { buildHealthReport } from "@/lib/providers/ProviderHealth";
import { providerRegistry, ProviderRegistry } from "@/lib/providers/ProviderRegistry";
import type { Provider, ProviderHealthReport } from "@/types/providers";

/** Orchestrates provider lifecycle, sync, and health operations (ES-060). */
export class ProviderManager {
  constructor(private readonly registry: ProviderRegistry = providerRegistry) {}

  register(provider: Provider): void {
    this.registry.register(provider);
  }

  unregister(id: string): boolean {
    return this.registry.unregister(id);
  }

  getProvider(id: string): Provider | undefined {
    return this.registry.getProvider(id);
  }

  getAllProviders(): Provider[] {
    return this.registry.getAllProviders();
  }

  getHealthyProviders(): Provider[] {
    return this.registry.getHealthyProviders();
  }

  async syncAll(): Promise<void> {
    await Promise.all(this.getAllProviders().map((provider) => provider.sync()));
  }

  async refreshAll(): Promise<void> {
    await Promise.all(this.getAllProviders().map((provider) => provider.refresh()));
  }

  async healthReport(): Promise<ProviderHealthReport> {
    return buildHealthReport(this.getAllProviders());
  }

  async connectAll(): Promise<void> {
    await Promise.all(this.getAllProviders().map((provider) => provider.connect()));
  }
}

export const providerManager = new ProviderManager();

import { createDefaultProviders } from "@/lib/providers/ProviderFactory";
import type { Provider } from "@/types/providers";

/** In-memory provider registry with automatic mock provider registration (ES-060). */
export class ProviderRegistry {
  private readonly providers = new Map<string, Provider>();

  constructor(autoRegisterDefaults = true) {
    if (autoRegisterDefaults) {
      for (const provider of createDefaultProviders()) {
        this.register(provider);
      }
    }
  }

  register(provider: Provider): void {
    if (this.providers.has(provider.id)) {
      throw new Error(`Provider already registered: ${provider.id}`);
    }

    this.providers.set(provider.id, provider);
  }

  unregister(id: string): boolean {
    return this.providers.delete(id);
  }

  getProvider(id: string): Provider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): Provider[] {
    return Array.from(this.providers.values());
  }

  getHealthyProviders(): Provider[] {
    return this.getAllProviders().filter((provider) => {
      const configHealthy = provider.config.enabled;
      return configHealthy;
    });
  }

  clear(): void {
    this.providers.clear();
  }
}

export const providerRegistry = new ProviderRegistry(true);

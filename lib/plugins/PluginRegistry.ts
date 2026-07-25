import type {
  Plugin,
  PluginConfiguration,
  PluginExtensionPoint,
  PluginExtensionRegistration,
  PluginHealth,
  PluginIntegrationRegistration,
  PluginIntegrationSurface,
  PluginStatus,
} from "@/types/plugins";

/** In-memory registry for installed plugins and extension contributions. */
export class PluginRegistry {
  private readonly plugins = new Map<string, Plugin>();
  private readonly configurations = new Map<string, PluginConfiguration>();
  private readonly health = new Map<string, PluginHealth>();
  private readonly extensions = new Map<string, PluginExtensionRegistration[]>();
  private readonly integrations = new Map<PluginIntegrationSurface, PluginIntegrationRegistration[]>();

  register(plugin: Plugin, configuration: PluginConfiguration): void {
    const id = plugin.manifest.metadata.id;

    if (this.plugins.has(id)) {
      throw new Error(`Plugin already registered: ${id}`);
    }

    this.plugins.set(id, plugin);
    this.configurations.set(id, configuration);
    this.health.set(id, createInitialHealth(id, configuration.enabled ? "enabled" : "installed"));
    this.extensions.set(id, []);
  }

  unregister(pluginId: string): boolean {
    this.extensions.delete(pluginId);
    this.configurations.delete(pluginId);
    this.health.delete(pluginId);
    return this.plugins.delete(pluginId);
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  getConfiguration(pluginId: string): PluginConfiguration | undefined {
    return this.configurations.get(pluginId);
  }

  updateConfiguration(pluginId: string, patch: Partial<PluginConfiguration>): PluginConfiguration {
    const current = this.configurations.get(pluginId);

    if (!current) {
      throw new Error(`Plugin configuration not found: ${pluginId}`);
    }

    const next: PluginConfiguration = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    this.configurations.set(pluginId, next);
    return next;
  }

  setStatus(pluginId: string, status: PluginStatus): void {
    const record = this.health.get(pluginId);

    if (!record) {
      return;
    }

    this.health.set(pluginId, {
      ...record,
      status,
      lastCheckedAt: new Date().toISOString(),
      healthy: status !== "error",
    });
  }

  recordError(pluginId: string, message: string): void {
    const record = this.health.get(pluginId);

    if (!record) {
      return;
    }

    this.health.set(pluginId, {
      ...record,
      status: "error",
      healthy: false,
      message,
      errorCount: record.errorCount + 1,
      lastCheckedAt: new Date().toISOString(),
    });
  }

  getHealth(pluginId: string): PluginHealth | undefined {
    return this.health.get(pluginId);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getEnabledPlugins(): Plugin[] {
    return this.getAllPlugins().filter((plugin) => {
      const config = this.configurations.get(plugin.manifest.metadata.id);
      return config?.enabled;
    });
  }

  registerExtension(registration: PluginExtensionRegistration): void {
    const list = this.extensions.get(registration.pluginId) ?? [];
    list.push(registration);
    this.extensions.set(registration.pluginId, list);
  }

  getExtensions(pluginId: string): PluginExtensionRegistration[] {
    return this.extensions.get(pluginId) ?? [];
  }

  getExtensionsByPoint(extensionPoint: PluginExtensionPoint): PluginExtensionRegistration[] {
    return this.getAllPlugins().flatMap((plugin) =>
      (this.extensions.get(plugin.manifest.metadata.id) ?? []).filter(
        (ext) => ext.extensionPoint === extensionPoint,
      ),
    );
  }

  registerIntegration(registration: PluginIntegrationRegistration): void {
    const list = this.integrations.get(registration.surface) ?? [];
    list.push(registration);
    this.integrations.set(registration.surface, list);
  }

  getIntegrations(surface: PluginIntegrationSurface): PluginIntegrationRegistration[] {
    return this.integrations.get(surface) ?? [];
  }

  clear(): void {
    this.plugins.clear();
    this.configurations.clear();
    this.health.clear();
    this.extensions.clear();
    this.integrations.clear();
  }
}

function createInitialHealth(pluginId: string, status: PluginStatus): PluginHealth {
  return {
    pluginId,
    status,
    healthy: true,
    lastCheckedAt: new Date().toISOString(),
    errorCount: 0,
  };
}

export const pluginRegistry = new PluginRegistry();

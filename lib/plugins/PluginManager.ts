import { compareSemver } from "@/lib/plugins/PluginManifest";
import { pluginInstaller } from "@/lib/plugins/PluginInstaller";
import { pluginLifecycleRunner } from "@/lib/plugins/PluginLifecycle";
import { pluginLoader, type PluginModuleFactory } from "@/lib/plugins/PluginLoader";
import {
  PLUGIN_LIFECYCLE_EVENTS,
  pluginEventBus,
} from "@/lib/plugins/PluginEvents";
import { pluginPermissionGuard } from "@/lib/plugins/PluginPermissions";
import { pluginRegistry } from "@/lib/plugins/PluginRegistry";
import { pluginSandbox } from "@/lib/plugins/PluginSandbox";
import type {
  MarketplaceListing,
  Plugin,
  PluginCapability,
  PluginDiscoveryResult,
  PluginExtensionPoint,
  PluginExtensionRegistration,
  PluginHealth,
  PluginIntegrationRegistration,
  PluginIntegrationSurface,
  PluginManifest,
  PluginMarketplaceCatalog,
  PluginPermissionScope,
  PluginResult,
} from "@/types/plugins";
import { ORION_PLATFORM_VERSION } from "@/types/plugins";

/** Central facade for ORION plugin discovery, lifecycle, health, and integration (ES-060 · Sprint 5). */
export class PluginManager {
  constructor(private readonly registerBuiltins = true) {
    if (registerBuiltins) {
      this.registerBuiltinFactories();
    }
  }

  discover(manifests: PluginManifest[]): PluginDiscoveryResult {
    return pluginLoader.discover(manifests);
  }

  registerLoaderFactory(entryModule: string, factory: PluginModuleFactory): void {
    pluginLoader.registerFactory(entryModule, factory);
  }

  async install(manifest: PluginManifest): Promise<PluginResult<Plugin>> {
    return pluginInstaller.install(manifest);
  }

  async uninstall(pluginId: string): Promise<PluginResult> {
    return pluginInstaller.uninstall(pluginId);
  }

  async update(pluginId: string, manifest: PluginManifest): Promise<PluginResult<Plugin>> {
    return pluginInstaller.update(pluginId, manifest);
  }

  async enable(pluginId: string): Promise<PluginResult> {
    const timestamp = new Date().toISOString();
    const plugin = pluginRegistry.getPlugin(pluginId);
    const configuration = pluginRegistry.getConfiguration(pluginId);

    if (!plugin || !configuration) {
      return { success: false, error: `Plugin not installed: ${pluginId}`, pluginId, timestamp };
    }

    if (configuration.enabled) {
      return { success: true, pluginId, timestamp };
    }

    const updated = pluginRegistry.updateConfiguration(pluginId, { enabled: true });
    await pluginLifecycleRunner.onEnable(plugin, updated);
    this.registerPluginExtensions(plugin);

    return { success: true, pluginId, timestamp };
  }

  async disable(pluginId: string): Promise<PluginResult> {
    const timestamp = new Date().toISOString();
    const plugin = pluginRegistry.getPlugin(pluginId);
    const configuration = pluginRegistry.getConfiguration(pluginId);

    if (!plugin || !configuration) {
      return { success: false, error: `Plugin not installed: ${pluginId}`, pluginId, timestamp };
    }

    if (!configuration.enabled) {
      return { success: true, pluginId, timestamp };
    }

    await pluginLifecycleRunner.onDisable(plugin);
    pluginRegistry.updateConfiguration(pluginId, { enabled: false });

    return { success: true, pluginId, timestamp };
  }

  getPlugin(pluginId: string): Plugin | undefined {
    return pluginRegistry.getPlugin(pluginId);
  }

  getInstalledPlugins(): Plugin[] {
    return pluginRegistry.getAllPlugins();
  }

  getEnabledPlugins(): Plugin[] {
    return pluginRegistry.getEnabledPlugins();
  }

  getHealth(pluginId: string): PluginHealth | undefined {
    return pluginRegistry.getHealth(pluginId);
  }

  async monitorHealth(): Promise<PluginHealth[]> {
    const results: PluginHealth[] = [];

    for (const plugin of pluginRegistry.getAllPlugins()) {
      const pluginId = plugin.manifest.metadata.id;
      const result = await pluginSandbox.run(pluginId, null, "health-check", async () => {
        if (plugin.getCapabilities) {
          return plugin.getCapabilities().length >= 0;
        }
        return true;
      });

      if (!result.success) {
        pluginRegistry.recordError(pluginId, result.error ?? "Health check failed");
      }

      const health = pluginRegistry.getHealth(pluginId);
      if (health) {
        results.push(health);
      }
    }

    return results;
  }

  getExtensions(extensionPoint: PluginExtensionPoint): PluginExtensionRegistration[] {
    return pluginRegistry.getExtensionsByPoint(extensionPoint);
  }

  getIntegrations(surface: PluginIntegrationSurface): PluginIntegrationRegistration[] {
    return pluginRegistry.getIntegrations(surface);
  }

  assertPermission(pluginId: string, scope: PluginPermissionScope): void {
    pluginPermissionGuard.assertPermission(pluginId, scope);
  }

  /** Registers plugin contributions against platform integration surfaces. */
  registerIntegrations(plugin: Plugin): void {
    const pluginId = plugin.manifest.metadata.id;
    const surfaces = this.mapExtensionPointsToSurfaces(plugin.manifest.extensionPoints);

    for (const surface of surfaces) {
      pluginRegistry.registerIntegration({
        surface,
        pluginId,
        handlerId: `${pluginId}@${surface}`,
      });
    }
  }

  /** Builds marketplace catalog from registry + available listings. */
  buildMarketplaceCatalog(available: MarketplaceListing[]): PluginMarketplaceCatalog {
    const installed = pluginRegistry.getAllPlugins().map((plugin) => {
      const pluginId = plugin.manifest.metadata.id;
      return {
        plugin,
        configuration: pluginRegistry.getConfiguration(pluginId)!,
        health: pluginRegistry.getHealth(pluginId)!,
        extensions: pluginRegistry.getExtensions(pluginId),
      };
    });

    const pendingUpdates = installed
      .map(({ plugin, configuration }) => {
        const listing = available.find(
          (item) => item.manifest.metadata.id === plugin.manifest.metadata.id,
        );

        if (!listing) {
          return null;
        }

        return compareSemver(listing.latestVersion, configuration.installedVersion) > 0
          ? plugin.manifest.metadata.id
          : null;
      })
      .filter((id): id is string => Boolean(id));

    return {
      generatedAt: new Date().toISOString(),
      installed,
      available,
      categories: [
        "analytics",
        "integration",
        "productivity",
        "ai",
        "finance",
        "hospitality",
        "crm",
        "marketing",
        "operations",
      ],
      pendingUpdates,
    };
  }

  async shutdownAll(): Promise<void> {
    for (const plugin of pluginRegistry.getAllPlugins()) {
      await pluginSandbox.runSafe(
        plugin.manifest.metadata.id,
        "shutdown",
        () => pluginLifecycleRunner.onShutdown(plugin),
        undefined,
      );
    }
  }

  private registerPluginExtensions(plugin: Plugin): void {
    const capabilities = plugin.getCapabilities?.() ?? this.inferCapabilities(plugin);

    for (const capability of capabilities) {
      const requiredScopes = pluginPermissionGuard.requiredScopesForExtension(
        capability.extensionPoint,
      );
      const missingScope = requiredScopes.find(
        (scope) => !pluginPermissionGuard.hasPermission(plugin.manifest.metadata.id, scope),
      );

      if (missingScope) {
        continue;
      }

      pluginRegistry.registerExtension({
        id: capability.id,
        pluginId: plugin.manifest.metadata.id,
        extensionPoint: capability.extensionPoint,
        label: capability.label,
        handlerId: `${plugin.manifest.metadata.id}:${capability.id}`,
        metadata: { description: capability.description },
      });
    }

    this.registerIntegrations(plugin);

    void pluginEventBus.publish({
      type: PLUGIN_LIFECYCLE_EVENTS.ENABLED,
      pluginId: plugin.manifest.metadata.id,
      payload: { extensions: capabilities.length },
    });
  }

  private inferCapabilities(plugin: Plugin): PluginCapability[] {
    return plugin.manifest.extensionPoints.map((extensionPoint, index) => ({
      id: `${plugin.manifest.metadata.id}-${extensionPoint}-${index}`,
      extensionPoint,
      label: `${plugin.manifest.metadata.name} · ${extensionPoint}`,
    }));
  }

  private mapExtensionPointsToSurfaces(
    extensionPoints: PluginExtensionPoint[],
  ): PluginIntegrationSurface[] {
    const surfaces = new Set<PluginIntegrationSurface>();

    for (const point of extensionPoints) {
      if (point === "dashboard-widget" || point === "executive-panel") {
        surfaces.add("dashboard");
        surfaces.add("command-center");
      }

      if (point === "provider-integration") {
        surfaces.add("provider-framework");
        surfaces.add("orchestrator");
      }

      if (point === "ai-skill") {
        surfaces.add("ai-services");
      }

      if (point === "background-job") {
        surfaces.add("orchestrator");
      }
    }

    return Array.from(surfaces);
  }

  private registerBuiltinFactories(): void {
    pluginLoader.registerFactory("@orion/plugin-sample/command-center-panel", (manifest) => ({
      manifest,
      hooks: {
        onInstall: ({ logger }) => logger.info("Sample Command Center panel installed"),
        onEnable: ({ logger }) => logger.info("Sample Command Center panel enabled"),
        onDisable: ({ logger }) => logger.info("Sample Command Center panel disabled"),
      },
      getCapabilities: () => [
        {
          id: "executive-kpi-panel",
          extensionPoint: "executive-panel",
          label: "Executive KPI Panel",
          description: "Sample executive panel extension",
        },
      ],
    }));
  }
}

export const pluginManager = new PluginManager(true);

/** Integration helpers for platform surfaces — read-only views of enabled extensions. */
export function getCommandCenterPluginPanels(): PluginExtensionRegistration[] {
  return pluginManager.getExtensions("executive-panel");
}

export function getDashboardPluginWidgets(): PluginExtensionRegistration[] {
  return pluginManager.getExtensions("dashboard-widget");
}

export function getPluginProviderIntegrations(): PluginExtensionRegistration[] {
  return pluginManager.getExtensions("provider-integration");
}

export function getPluginOrchestratorJobs(): PluginExtensionRegistration[] {
  return pluginManager.getExtensions("background-job");
}

export { ORION_PLATFORM_VERSION };

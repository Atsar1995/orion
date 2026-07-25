import { satisfiesVersionRange } from "@/lib/plugins/PluginManifest";
import { pluginLifecycleRunner } from "@/lib/plugins/PluginLifecycle";
import { pluginLoader } from "@/lib/plugins/PluginLoader";
import { pluginPermissionGuard } from "@/lib/plugins/PluginPermissions";
import { pluginRegistry } from "@/lib/plugins/PluginRegistry";
import type { Plugin, PluginConfiguration, PluginManifest, PluginResult } from "@/types/plugins";

/** Handles plugin installation, uninstallation, and updates with dependency validation. */
export class PluginInstaller {
  async install(manifest: PluginManifest): Promise<PluginResult<Plugin>> {
    const pluginId = manifest.metadata.id;
    const timestamp = new Date().toISOString();

    try {
      if (pluginRegistry.getPlugin(pluginId)) {
        return {
          success: false,
          error: `Plugin already installed: ${pluginId}`,
          pluginId,
          timestamp,
        };
      }

      const dependencyErrors = this.validateDependencies(manifest);
      if (dependencyErrors.length > 0) {
        return {
          success: false,
          error: dependencyErrors.join("; "),
          pluginId,
          timestamp,
        };
      }

      const permissionCheck = pluginPermissionGuard.validateRequested(manifest.permissions);
      if (!permissionCheck.valid) {
        return {
          success: false,
          error: permissionCheck.errors.join("; "),
          pluginId,
          timestamp,
        };
      }

      const plugin = await pluginLoader.load(manifest);
      const configuration = this.createConfiguration(plugin);
      pluginRegistry.register(plugin, configuration);
      await pluginLifecycleRunner.onInstall(plugin);

      return { success: true, data: plugin, pluginId, timestamp };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Install failed";
      return { success: false, error: message, pluginId, timestamp };
    }
  }

  async uninstall(pluginId: string): Promise<PluginResult> {
    const timestamp = new Date().toISOString();

    try {
      const plugin = pluginRegistry.getPlugin(pluginId);

      if (!plugin) {
        return { success: false, error: `Plugin not installed: ${pluginId}`, pluginId, timestamp };
      }

      const dependents = this.findDependents(pluginId);
      if (dependents.length > 0) {
        return {
          success: false,
          error: `Cannot uninstall — required by: ${dependents.join(", ")}`,
          pluginId,
          timestamp,
        };
      }

      await pluginLifecycleRunner.onUnload(plugin);
      await pluginLifecycleRunner.onShutdown(plugin);
      pluginPermissionGuard.revoke(pluginId);
      pluginRegistry.unregister(pluginId);

      return { success: true, pluginId, timestamp };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Uninstall failed";
      return { success: false, error: message, pluginId, timestamp };
    }
  }

  async update(pluginId: string, nextManifest: PluginManifest): Promise<PluginResult<Plugin>> {
    const timestamp = new Date().toISOString();

    try {
      const existing = pluginRegistry.getPlugin(pluginId);
      const config = pluginRegistry.getConfiguration(pluginId);

      if (!existing || !config) {
        return { success: false, error: `Plugin not installed: ${pluginId}`, pluginId, timestamp };
      }

      const previousVersion = config.installedVersion;
      const wasEnabled = config.enabled;

      if (wasEnabled) {
        await pluginLifecycleRunner.onDisable(existing);
      }

      await pluginLifecycleRunner.onUnload(existing);
      pluginRegistry.unregister(pluginId);

      const installResult = await this.install(nextManifest);
      if (!installResult.success || !installResult.data) {
        return installResult;
      }

      const updatedConfig = pluginRegistry.updateConfiguration(pluginId, {
        installedVersion: nextManifest.metadata.version,
        enabled: wasEnabled,
      });

      await pluginLifecycleRunner.onUpdate(installResult.data, updatedConfig, previousVersion);

      if (wasEnabled) {
        await pluginLifecycleRunner.onEnable(installResult.data, updatedConfig);
      }

      return { success: true, data: installResult.data, pluginId, timestamp };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Update failed";
      return { success: false, error: message, pluginId, timestamp };
    }
  }

  validateDependencies(manifest: PluginManifest): string[] {
    const errors: string[] = [];

    for (const dependency of manifest.dependencies) {
      const installed = pluginRegistry.getPlugin(dependency.pluginId);
      const config = pluginRegistry.getConfiguration(dependency.pluginId);

      if (!installed || !config) {
        errors.push(`Missing dependency: ${dependency.pluginId}`);
        continue;
      }

      if (!satisfiesVersionRange(config.installedVersion, dependency.versionRange)) {
        errors.push(
          `Dependency ${dependency.pluginId} version ${config.installedVersion} does not satisfy ${dependency.versionRange}`,
        );
      }
    }

    return errors;
  }

  private findDependents(pluginId: string): string[] {
    return pluginRegistry
      .getAllPlugins()
      .filter((plugin) =>
        plugin.manifest.dependencies.some((dep) => dep.pluginId === pluginId),
      )
      .map((plugin) => plugin.manifest.metadata.id);
  }

  private createConfiguration(plugin: Plugin): PluginConfiguration {
    const now = new Date().toISOString();
    return {
      pluginId: plugin.manifest.metadata.id,
      enabled: false,
      settings: {},
      installedAt: now,
      updatedAt: now,
      installedVersion: plugin.manifest.metadata.version,
    };
  }
}

export const pluginInstaller = new PluginInstaller();

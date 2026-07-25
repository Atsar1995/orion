import { ORION_PLATFORM_VERSION } from "@/types/plugins";
import type {
  Plugin,
  PluginConfiguration,
  PluginContext,
  PluginLifecycleHooks,
} from "@/types/plugins";
import { PLUGIN_LIFECYCLE_EVENTS, pluginEventBus } from "@/lib/plugins/PluginEvents";
import { pluginPermissionGuard } from "@/lib/plugins/PluginPermissions";
import { pluginRegistry } from "@/lib/plugins/PluginRegistry";
import { pluginSandbox } from "@/lib/plugins/PluginSandbox";

type LifecyclePhase = keyof PluginLifecycleHooks;

/** Executes plugin lifecycle hooks inside the sandbox. */
export class PluginLifecycleRunner {
  async onInstall(plugin: Plugin): Promise<void> {
    await this.runHook(plugin, "onInstall", PLUGIN_LIFECYCLE_EVENTS.INSTALLED);
    pluginRegistry.setStatus(plugin.manifest.metadata.id, "installed");
  }

  async onEnable(plugin: Plugin, configuration: PluginConfiguration): Promise<void> {
    pluginPermissionGuard.grant(
      plugin.manifest.metadata.id,
      plugin.manifest.permissions.map((p) => p.scope),
    );
    await this.runHook(plugin, "onEnable", PLUGIN_LIFECYCLE_EVENTS.ENABLED, configuration);
    pluginRegistry.setStatus(plugin.manifest.metadata.id, "enabled");
  }

  async onDisable(plugin: Plugin): Promise<void> {
    await this.runHook(plugin, "onDisable", PLUGIN_LIFECYCLE_EVENTS.DISABLED);
    pluginPermissionGuard.revoke(plugin.manifest.metadata.id);
    pluginRegistry.setStatus(plugin.manifest.metadata.id, "disabled");
  }

  async onUpdate(
    plugin: Plugin,
    configuration: PluginConfiguration,
    previousVersion: string,
  ): Promise<void> {
    pluginRegistry.setStatus(plugin.manifest.metadata.id, "updating");
    await this.runHook(
      plugin,
      "onUpdate",
      PLUGIN_LIFECYCLE_EVENTS.UPDATED,
      configuration,
      previousVersion,
    );
    pluginRegistry.setStatus(plugin.manifest.metadata.id, configuration.enabled ? "enabled" : "installed");
  }

  async onUnload(plugin: Plugin): Promise<void> {
    await this.runHook(plugin, "onUnload", PLUGIN_LIFECYCLE_EVENTS.UNLOADED);
  }

  async onShutdown(plugin: Plugin): Promise<void> {
    await this.runHook(plugin, "onShutdown", PLUGIN_LIFECYCLE_EVENTS.UNLOADED);
  }

  private async runHook(
    plugin: Plugin,
    phase: LifecyclePhase,
    eventType: string,
    configuration?: PluginConfiguration,
    previousVersion?: string,
  ): Promise<void> {
    const pluginId = plugin.manifest.metadata.id;
    const hook = plugin.hooks?.[phase];

    if (!hook) {
      return;
    }

    const config =
      configuration ?? pluginRegistry.getConfiguration(pluginId) ?? createDefaultConfig(plugin);
    const context = this.createContext(plugin, config);

    const execute = async () => {
      if (phase === "onUpdate") {
        await plugin.hooks?.onUpdate?.(context, previousVersion ?? "0.0.0");
        return;
      }

      await (hook as (ctx: PluginContext) => Promise<void> | void)(context);
    };

    const result = await pluginSandbox.run(pluginId, null, phase, execute);

    if (!result.success) {
      pluginRegistry.recordError(pluginId, result.error ?? `${phase} failed`);
      await pluginEventBus.publish({
        type: PLUGIN_LIFECYCLE_EVENTS.ERROR,
        pluginId,
        payload: { phase, error: result.error },
      });
      return;
    }

    await pluginEventBus.publish({
      type: eventType,
      pluginId,
      payload: { phase },
    });
  }

  createContext(plugin: Plugin, configuration: PluginConfiguration): PluginContext {
    return {
      pluginId: plugin.manifest.metadata.id,
      manifest: plugin.manifest,
      configuration,
      grantedPermissions: pluginPermissionGuard.getGrantedScopes(plugin.manifest.metadata.id),
      platformVersion: ORION_PLATFORM_VERSION,
      logger: pluginEventBus.createLogger(plugin.manifest.metadata.id),
    };
  }
}

function createDefaultConfig(plugin: Plugin): PluginConfiguration {
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

export const pluginLifecycleRunner = new PluginLifecycleRunner();

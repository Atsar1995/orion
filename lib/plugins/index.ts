export { pluginManager, getCommandCenterPluginPanels, getDashboardPluginWidgets, getPluginProviderIntegrations, getPluginOrchestratorJobs, ORION_PLATFORM_VERSION } from "@/lib/plugins/PluginManager";
export { pluginRegistry } from "@/lib/plugins/PluginRegistry";
export { pluginLoader } from "@/lib/plugins/PluginLoader";
export { pluginInstaller } from "@/lib/plugins/PluginInstaller";
export { pluginLifecycleRunner } from "@/lib/plugins/PluginLifecycle";
export { pluginSandbox } from "@/lib/plugins/PluginSandbox";
export { pluginPermissionGuard } from "@/lib/plugins/PluginPermissions";
export { pluginEventBus, PLUGIN_LIFECYCLE_EVENTS } from "@/lib/plugins/PluginEvents";
export { pluginMarketplace, ensureSampleCommandCenterPlugin } from "@/lib/plugins/PluginMarketplace";
export {
  validatePluginManifest,
  isVersionCompatible,
  compareSemver,
  satisfiesVersionRange,
  createPluginManifest,
} from "@/lib/plugins/PluginManifest";

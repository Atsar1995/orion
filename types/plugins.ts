/** ORION platform semver used for plugin compatibility checks. */
export const ORION_PLATFORM_VERSION = "0.4.0";

/** Lifecycle state of an installed plugin. */
export type PluginStatus =
  | "discovered"
  | "installed"
  | "enabled"
  | "disabled"
  | "updating"
  | "error"
  | "uninstalled";

/** Permission scopes a plugin may request (ES-060 · Sprint 5). */
export type PluginPermissionScope =
  | "providers"
  | "dashboard-widgets"
  | "reports"
  | "notifications"
  | "storage"
  | "ai"
  | "external-apis"
  | "files"
  | "user-data";

/** Extension points plugins may register against. */
export type PluginExtensionPoint =
  | "dashboard-widget"
  | "report"
  | "provider-integration"
  | "ai-skill"
  | "command"
  | "navigation-item"
  | "executive-panel"
  | "background-job";

/** Marketplace category for discoverability. */
export type PluginCategory =
  | "analytics"
  | "integration"
  | "productivity"
  | "ai"
  | "finance"
  | "hospitality"
  | "crm"
  | "marketing"
  | "operations"
  | "developer";

/** Declared permission request from a plugin manifest. */
export type PluginPermission = {
  scope: PluginPermissionScope;
  reason: string;
  optional?: boolean;
};

/** Capability advertised by a plugin at runtime. */
export type PluginCapability = {
  id: string;
  extensionPoint: PluginExtensionPoint;
  label: string;
  description?: string;
};

/** Authorship and listing metadata. */
export type PluginMetadata = {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: PluginCategory;
  homepage?: string;
  license?: string;
  tags?: string[];
};

/** Semver dependency on another plugin. */
export type PluginDependency = {
  pluginId: string;
  versionRange: string;
};

/** Plugin manifest — required package descriptor (ES-060). */
export type PluginManifest = {
  metadata: PluginMetadata;
  orionVersion: string;
  entryModule: string;
  permissions: PluginPermission[];
  dependencies: PluginDependency[];
  extensionPoints: PluginExtensionPoint[];
  configurationSchema?: Record<string, unknown>;
  marketplaceId?: string;
  signature?: string;
};

/** Runtime configuration persisted for an installed plugin. */
export type PluginConfiguration = {
  pluginId: string;
  enabled: boolean;
  settings: Record<string, unknown>;
  installedAt: string;
  updatedAt: string;
  installedVersion: string;
};

/** Health signal for monitoring. */
export type PluginHealth = {
  pluginId: string;
  status: PluginStatus;
  healthy: boolean;
  lastCheckedAt: string;
  message?: string;
  errorCount: number;
};

/** Plugin domain event envelope. */
export type PluginEvent<TPayload = Record<string, unknown>> = {
  id: string;
  type: string;
  pluginId: string;
  payload: TPayload;
  timestamp: string;
};

/** Standard async result for plugin operations. */
export type PluginResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
  pluginId: string;
  timestamp: string;
};

/** Runtime context passed to plugin hooks and extensions. */
export type PluginContext = {
  pluginId: string;
  manifest: PluginManifest;
  configuration: PluginConfiguration;
  grantedPermissions: PluginPermissionScope[];
  platformVersion: string;
  logger: PluginContextLogger;
};

export type PluginContextLogger = {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
};

/** Lifecycle hooks implemented by a plugin module. */
export type PluginLifecycleHooks = {
  onInstall?(context: PluginContext): Promise<void> | void;
  onEnable?(context: PluginContext): Promise<void> | void;
  onDisable?(context: PluginContext): Promise<void> | void;
  onUpdate?(context: PluginContext, previousVersion: string): Promise<void> | void;
  onUnload?(context: PluginContext): Promise<void> | void;
  onShutdown?(context: PluginContext): Promise<void> | void;
};

/** Registered extension contribution from a plugin. */
export type PluginExtensionRegistration = {
  id: string;
  pluginId: string;
  extensionPoint: PluginExtensionPoint;
  label: string;
  handlerId: string;
  metadata?: Record<string, unknown>;
};

/** Core plugin contract — manifest + lifecycle + optional capabilities. */
export type Plugin = {
  manifest: PluginManifest;
  hooks?: PluginLifecycleHooks;
  getCapabilities?(): PluginCapability[];
};

/** Marketplace listing for an available plugin. */
export type MarketplaceListing = {
  manifest: PluginManifest;
  rating: number;
  ratingCount: number;
  installCount: number;
  latestVersion: string;
  updateAvailable?: boolean;
};

/** Installed plugin record in the marketplace model. */
export type InstalledPluginRecord = {
  plugin: Plugin;
  configuration: PluginConfiguration;
  health: PluginHealth;
  extensions: PluginExtensionRegistration[];
};

/** Marketplace catalog snapshot. */
export type PluginMarketplaceCatalog = {
  generatedAt: string;
  installed: InstalledPluginRecord[];
  available: MarketplaceListing[];
  categories: PluginCategory[];
  pendingUpdates: string[];
};

/** Compatibility validation outcome. */
export type PluginCompatibilityReport = {
  compatible: boolean;
  errors: string[];
  warnings: string[];
};

/** Discovery result from scanning manifests. */
export type PluginDiscoveryResult = {
  discovered: PluginManifest[];
  rejected: Array<{ manifest: Partial<PluginManifest>; errors: string[] }>;
};

/** Integration surfaces plugins may attach to. */
export type PluginIntegrationSurface =
  | "orchestrator"
  | "provider-framework"
  | "command-center"
  | "dashboard"
  | "ai-services";

export type PluginIntegrationRegistration = {
  surface: PluginIntegrationSurface;
  pluginId: string;
  handlerId: string;
};

import type { PluginPermission, PluginPermissionScope } from "@/types/plugins";

const ALL_SCOPES: PluginPermissionScope[] = [
  "providers",
  "dashboard-widgets",
  "reports",
  "notifications",
  "storage",
  "ai",
  "external-apis",
  "files",
  "user-data",
];

const HIGH_RISK_SCOPES = new Set<PluginPermissionScope>([
  "external-apis",
  "files",
  "user-data",
  "ai",
]);

/** Validates and normalizes plugin permission declarations. */
export class PluginPermissionGuard {
  private readonly granted = new Map<string, Set<PluginPermissionScope>>();

  validateRequested(permissions: PluginPermission[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const seen = new Set<PluginPermissionScope>();

    for (const permission of permissions) {
      if (!ALL_SCOPES.includes(permission.scope)) {
        errors.push(`Unknown permission scope: ${permission.scope}`);
        continue;
      }

      if (seen.has(permission.scope)) {
        errors.push(`Duplicate permission scope: ${permission.scope}`);
      }

      seen.add(permission.scope);

      if (!permission.reason?.trim()) {
        errors.push(`Permission ${permission.scope} requires a reason`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  grant(pluginId: string, scopes: PluginPermissionScope[]): void {
    this.granted.set(pluginId, new Set(scopes));
  }

  revoke(pluginId: string): void {
    this.granted.delete(pluginId);
  }

  hasPermission(pluginId: string, scope: PluginPermissionScope): boolean {
    return this.granted.get(pluginId)?.has(scope) ?? false;
  }

  assertPermission(pluginId: string, scope: PluginPermissionScope): void {
    if (!this.hasPermission(pluginId, scope)) {
      throw new PluginPermissionError(pluginId, scope);
    }
  }

  getGrantedScopes(pluginId: string): PluginPermissionScope[] {
    return Array.from(this.granted.get(pluginId) ?? []);
  }

  isHighRisk(scope: PluginPermissionScope): boolean {
    return HIGH_RISK_SCOPES.has(scope);
  }

  requiredScopesForExtension(
    extensionPoint: import("@/types/plugins").PluginExtensionPoint,
  ): PluginPermissionScope[] {
    const map: Partial<
      Record<import("@/types/plugins").PluginExtensionPoint, PluginPermissionScope[]>
    > = {
      "dashboard-widget": ["dashboard-widgets"],
      report: ["reports"],
      "provider-integration": ["providers", "external-apis"],
      "ai-skill": ["ai", "user-data"],
      command: ["dashboard-widgets"],
      "navigation-item": ["dashboard-widgets"],
      "executive-panel": ["dashboard-widgets"],
      "background-job": ["storage"],
    };

    return map[extensionPoint] ?? [];
  }
}

export class PluginPermissionError extends Error {
  constructor(
    public readonly pluginId: string,
    public readonly scope: PluginPermissionScope,
  ) {
    super(`Plugin ${pluginId} lacks permission: ${scope}`);
    this.name = "PluginPermissionError";
  }
}

export const pluginPermissionGuard = new PluginPermissionGuard();

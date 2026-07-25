import type { PluginPermissionScope } from "@/types/plugins";
import {
  PluginPermissionGuard,
  pluginPermissionGuard,
} from "@/lib/plugins/PluginPermissions";

export type SandboxExecutionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  isolated: boolean;
};

/** In-process sandbox — wraps plugin code with permission checks and failure isolation. */
export class PluginSandbox {
  constructor(private readonly permissions: PluginPermissionGuard = pluginPermissionGuard) {}

  async run<T>(
    pluginId: string,
    requiredScope: PluginPermissionScope | null,
    operation: string,
    fn: () => Promise<T> | T,
  ): Promise<SandboxExecutionResult<T>> {
    try {
      if (requiredScope) {
        this.permissions.assertPermission(pluginId, requiredScope);
      }

      const data = await fn();

      return {
        success: true,
        data,
        isolated: true,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : `Plugin sandbox failure: ${operation}`;

      console.error(`[PluginSandbox] ${pluginId} · ${operation}:`, message);

      return {
        success: false,
        error: message,
        isolated: true,
      };
    }
  }

  /** Ensures plugin failures never propagate uncaught to core platform callers. */
  async runSafe<T>(
    pluginId: string,
    operation: string,
    fn: () => Promise<T> | T,
    fallback: T,
  ): Promise<T> {
    const result = await this.run(pluginId, null, operation, fn);
    return result.success ? (result.data as T) : fallback;
  }
}

export const pluginSandbox = new PluginSandbox();

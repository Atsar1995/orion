/**
 * Permission evaluator — inheritance and composition (Mission P-015.6 · ADR-009).
 */

import { canAccess } from "@/lib/auth/permissions";
import type { PermissionCode } from "@/lib/platform/security/Permission";
import type { IdentityContext } from "@/lib/platform/security/IdentityContext";
import type { PermissionRegistry } from "@/lib/platform/security/PermissionRegistry";
import { defaultPermissionRegistry } from "@/lib/platform/security/PermissionRegistry";
import type { RoleRegistry } from "@/lib/platform/security/RoleRegistry";
import { defaultRoleRegistry } from "@/lib/platform/security/RoleRegistry";

export type PermissionEvaluationInput = {
  readonly identity: IdentityContext;
  readonly permission: PermissionCode;
};

/** Evaluates effective permissions for an identity context. */
export class PermissionEvaluator {
  constructor(
    private readonly permissionRegistry: PermissionRegistry = defaultPermissionRegistry,
    private readonly roleRegistry: RoleRegistry = defaultRoleRegistry,
  ) {}

  evaluate(input: PermissionEvaluationInput): boolean {
    const { identity, permission } = input;
    const granted = this.roleRegistry.resolveEffectivePermissions(identity);

    if (this.hasPermission(granted, permission)) {
      return true;
    }

    const [domain] = permission.split(":");
    if (domain === "platform" || domain === "finance") {
      return false;
    }

    const moduleName = domain === "hcm" ? "executive" : domain;
    const action = permission.endsWith(":read") ? "read" : "write";
    return canAccess({ permissions: [...identity.modulePermissions] }, moduleName, action);
  }

  listEffectivePermissions(identity: IdentityContext): readonly PermissionCode[] {
    const granted = this.roleRegistry.resolveEffectivePermissions(identity);
    const expanded = new Set<PermissionCode>();

    for (const code of granted) {
      expanded.add(code);
      for (const inherited of this.permissionRegistry.expand(code)) {
        expanded.add(inherited);
      }
    }

    return [...expanded].sort();
  }

  private hasPermission(granted: Set<PermissionCode>, permission: PermissionCode): boolean {
    if (granted.has(permission)) {
      return true;
    }

    for (const held of granted) {
      if (this.permissionRegistry.expand(held).has(permission)) {
        return true;
      }
    }

    return false;
  }
}

export const defaultPermissionEvaluator = new PermissionEvaluator();

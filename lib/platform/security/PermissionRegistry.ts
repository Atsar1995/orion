/**
 * Platform permission registry with inheritance (Mission P-015.6 · ADR-009).
 */

import { buildPermissionCode, type PermissionCode, type PermissionDefinition } from "@/lib/platform/security/Permission";

const PLATFORM_PERMISSIONS: readonly PermissionDefinition[] = [
  {
    code: buildPermissionCode("platform", "system", "admin"),
    description: "Full platform administration.",
    scope: "platform",
    inherits: [
      buildPermissionCode("platform", "users", "write"),
      buildPermissionCode("platform", "organizations", "write"),
      buildPermissionCode("platform", "audit", "read"),
    ],
  },
  {
    code: buildPermissionCode("platform", "users", "read"),
    description: "Read platform users.",
    scope: "platform",
  },
  {
    code: buildPermissionCode("platform", "users", "write"),
    description: "Manage platform users.",
    scope: "platform",
    inherits: [buildPermissionCode("platform", "users", "read")],
  },
  {
    code: buildPermissionCode("platform", "organizations", "read"),
    description: "Read organizations.",
    scope: "organization",
  },
  {
    code: buildPermissionCode("platform", "organizations", "write"),
    description: "Manage organizations.",
    scope: "organization",
    inherits: [buildPermissionCode("platform", "organizations", "read")],
  },
  {
    code: buildPermissionCode("platform", "audit", "read"),
    description: "Read audit records.",
    scope: "platform",
  },
  {
    code: buildPermissionCode("platform", "security", "read"),
    description: "Read security configuration.",
    scope: "platform",
  },
  {
    code: buildPermissionCode("platform", "security", "write"),
    description: "Manage security configuration.",
    scope: "platform",
    inherits: [buildPermissionCode("platform", "security", "read")],
  },
];

/** Permission registry — default deny for unknown codes. */
export class PermissionRegistry {
  private readonly definitions = new Map<PermissionCode, PermissionDefinition>();
  private readonly inheritance = new Map<PermissionCode, Set<PermissionCode>>();

  constructor(extraDefinitions: readonly PermissionDefinition[] = []) {
    for (const definition of [...PLATFORM_PERMISSIONS, ...extraDefinitions]) {
      this.register(definition);
    }
  }

  register(definition: PermissionDefinition): void {
    this.definitions.set(definition.code, definition);
    if (!this.inheritance.has(definition.code)) {
      this.inheritance.set(definition.code, new Set());
    }

    for (const parent of definition.inherits ?? []) {
      if (!this.inheritance.has(parent)) {
        this.inheritance.set(parent, new Set());
      }
      this.inheritance.get(parent)!.add(definition.code);
    }
  }

  get(code: PermissionCode): PermissionDefinition | undefined {
    return this.definitions.get(code);
  }

  has(code: PermissionCode): boolean {
    return this.definitions.has(code);
  }

  list(): readonly PermissionDefinition[] {
    return [...this.definitions.values()];
  }

  /** Expands a permission code to include inherited child permissions. */
  expand(code: PermissionCode): Set<PermissionCode> {
    const expanded = new Set<PermissionCode>([code]);
    const queue = [code];

    while (queue.length > 0) {
      const current = queue.pop()!;
      for (const child of this.inheritance.get(current) ?? []) {
        if (!expanded.has(child)) {
          expanded.add(child);
          queue.push(child);
        }
      }
    }

    return expanded;
  }
}

export const defaultPermissionRegistry = new PermissionRegistry();

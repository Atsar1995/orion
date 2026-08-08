import {
  getPermissionsForAuroraRole,
  resolveAuroraPermissions,
  resolveAuroraRolesFromOrionRole,
} from "@/lib/aurora/identity/aurora-role-permissions";
import { describe, expect, it } from "vitest";

describe("resolveAuroraRolesFromOrionRole", () => {
  it.each([
    ["super_admin", ["aurora.admin"]],
    ["organization_admin", ["aurora.admin"]],
    ["administrator", ["aurora.admin"]],
    ["founder", ["aurora.director"]],
    ["executive", ["aurora.director"]],
    ["manager", ["aurora.manager"]],
    ["analyst", ["aurora.editor"]],
    ["staff", ["aurora.editor"]],
    ["read_only", ["aurora.viewer"]],
    ["guest", ["aurora.viewer"]],
    ["service_account", ["aurora.agent.service"]],
  ] as const)("maps ORION role %s to Aurora roles", (orionRole, expected) => {
    expect(resolveAuroraRolesFromOrionRole(orionRole)).toEqual(expected);
  });
});

describe("getPermissionsForAuroraRole", () => {
  it("grants full admin permissions to aurora.admin", () => {
    const permissions = getPermissionsForAuroraRole("aurora.admin");
    expect(permissions).toContain("aurora.admin.tenant");
    expect(permissions).toContain("aurora.integration.manage");
  });

  it("withholds tenant admin from aurora.director", () => {
    const permissions = getPermissionsForAuroraRole("aurora.director");
    expect(permissions).not.toContain("aurora.admin.tenant");
    expect(permissions).toContain("aurora.content.publish");
  });

  it("grants operational permissions to aurora.manager", () => {
    const permissions = getPermissionsForAuroraRole("aurora.manager");
    expect(permissions).toContain("aurora.approval.override");
    expect(permissions).not.toContain("aurora.admin.users");
  });

  it("limits aurora.viewer to read permissions", () => {
    const permissions = getPermissionsForAuroraRole("aurora.viewer");
    expect(permissions.every((permission) => permission.endsWith(".read"))).toBe(true);
  });

  it("allows agent service write without admin permissions", () => {
    const permissions = getPermissionsForAuroraRole("aurora.agent.service");
    expect(permissions).toContain("aurora.content.write");
    expect(permissions.some((permission) => permission.startsWith("aurora.admin."))).toBe(false);
  });
});

describe("resolveAuroraPermissions", () => {
  it("unions permissions across multiple Aurora roles", () => {
    const permissions = resolveAuroraPermissions(["aurora.viewer", "aurora.approver"]);
    expect(permissions.has("aurora.content.read")).toBe(true);
    expect(permissions.has("aurora.content.approve")).toBe(true);
    expect(permissions.has("aurora.content.write")).toBe(false);
  });
});

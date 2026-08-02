import { describe, expect, it } from "vitest";
import { defaultPermissionRegistry } from "@/lib/platform/security/PermissionRegistry";
import { buildPermissionCode } from "@/lib/platform/security/Permission";
import "@/lib/hcm/auth";

describe("PermissionRegistry", () => {
  it("registers platform permissions", () => {
    expect(defaultPermissionRegistry.has(buildPermissionCode("platform", "system", "admin"))).toBe(true);
  });

  it("registers HCM domain permissions", () => {
    expect(defaultPermissionRegistry.has(buildPermissionCode("hcm", "employee", "read"))).toBe(true);
    expect(defaultPermissionRegistry.has(buildPermissionCode("hcm", "employee", "write"))).toBe(true);
  });

  it("expands inherited permissions from read to write", () => {
    const expanded = defaultPermissionRegistry.expand(buildPermissionCode("hcm", "employee", "read"));
    expect(expanded.has(buildPermissionCode("hcm", "employee", "write"))).toBe(true);
  });

  it("default denies unknown permissions", () => {
    expect(defaultPermissionRegistry.has("unknown:permission:code")).toBe(false);
  });
});

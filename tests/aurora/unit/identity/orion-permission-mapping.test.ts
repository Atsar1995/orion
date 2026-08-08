import {
  mapOrionPermissionToAurora,
  mapOrionPermissionsToAurora,
  resolveEffectiveAuroraPermissions,
} from "@/lib/aurora/identity/orion-permission-mapping";
import { describe, expect, it } from "vitest";

describe("resolveEffectiveAuroraPermissions", () => {
  it("returns only role-derived permissions when ORION grants are absent", () => {
    const permissions = resolveEffectiveAuroraPermissions(["aurora.viewer"], []);
    expect(permissions.has("aurora.content.read")).toBe(true);
    expect(permissions.has("aurora.content.write")).toBe(false);
  });

  it("returns only ORION-mapped permissions when roles grant none", () => {
    const permissions = resolveEffectiveAuroraPermissions([], [
      { module: "aurora", action: "content.write" },
    ]);
    expect(permissions.has("aurora.content.write")).toBe(true);
    expect(permissions.has("aurora.content.read")).toBe(false);
  });

  it("unions role-derived and ORION session permissions", () => {
    const permissions = resolveEffectiveAuroraPermissions(["aurora.editor"], [
      { module: "aurora", action: "approval.override" },
    ]);
    expect(permissions.has("aurora.content.write")).toBe(true);
    expect(permissions.has("aurora.approval.override")).toBe(true);
  });

  it("deduplicates overlapping permissions", () => {
    const permissions = resolveEffectiveAuroraPermissions(["aurora.manager"], [
      { module: "aurora", action: "content.read" },
      { module: "aurora", action: "content.read" },
    ]);
    expect([...permissions].filter((permission) => permission === "aurora.content.read")).toHaveLength(1);
  });

  it("preserves an empty permission set when role and ORION grants are absent", () => {
    const permissions = resolveEffectiveAuroraPermissions([], []);
    expect(permissions.size).toBe(0);
  });
});

describe("mapOrionPermissionToAurora", () => {
  it("maps aurora module grants using full permission slugs", () => {
    expect(mapOrionPermissionToAurora({ module: "aurora", action: "aurora.admin.brand" })).toBe(
      "aurora.admin.brand",
    );
  });

  it("maps aurora module grants using short action slugs", () => {
    expect(mapOrionPermissionToAurora({ module: "aurora", action: "content.write" })).toBe(
      "aurora.content.write",
    );
  });

  it("ignores non-aurora module grants", () => {
    expect(mapOrionPermissionsToAurora([{ module: "marketing", action: "write" }]).size).toBe(0);
  });
});

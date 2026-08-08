import { isAuroraAdminPermission } from "@/lib/aurora/identity/aurora-permission-catalog";
import { describe, expect, it } from "vitest";

describe("aurora-permission-catalog", () => {
  it("identifies admin permissions by prefix", () => {
    expect(isAuroraAdminPermission("aurora.admin.tenant")).toBe(true);
    expect(isAuroraAdminPermission("aurora.content.read")).toBe(false);
  });
});

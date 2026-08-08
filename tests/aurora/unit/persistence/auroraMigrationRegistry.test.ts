import { AuroraMigrationRegistry } from "@/lib/aurora/persistence/AuroraMigrationRegistry";
import { describe, expect, it } from "vitest";

describe("AuroraMigrationRegistry", () => {
  it("registers ADR-001 migration sequence without migration 004", () => {
    const registry = new AuroraMigrationRegistry();
    expect(registry.getLatestVersion()).toBe(5);
    expect(registry.getPending(0).map((migration) => migration.id)).toEqual([
      "001_aurora_admin_tables",
      "002_aurora_business_entity",
      "003_aurora_config_tables",
      "005_aurora_rls_policies",
    ]);
    expect(registry.getPending(3).map((migration) => migration.id)).toEqual([
      "005_aurora_rls_policies",
    ]);
  });
});

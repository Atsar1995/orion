import { AuroraMigrationRegistry } from "@/lib/aurora/persistence/AuroraMigrationRegistry";
import { describe, expect, it } from "vitest";

describe("AuroraMigrationRegistry", () => {
  it("registers ADR-001 migration sequence without migration 004", () => {
    const registry = new AuroraMigrationRegistry();
    expect(registry.getLatestVersion()).toBe(9);
    expect(registry.getPending(0).map((migration) => migration.id)).toEqual([
      "001_aurora_admin_tables",
      "002_aurora_business_entity",
      "003_aurora_config_tables",
      "005_aurora_rls_policies",
      "007_knowledge_memory",
      "008_knowledge_relationship",
      "009_knowledge_embedding",
    ]);
    expect(registry.getPending(3).map((migration) => migration.id)).toEqual([
      "005_aurora_rls_policies",
      "007_knowledge_memory",
      "008_knowledge_relationship",
      "009_knowledge_embedding",
    ]);
    expect(registry.getPending(5).map((migration) => migration.id)).toEqual([
      "007_knowledge_memory",
      "008_knowledge_relationship",
      "009_knowledge_embedding",
    ]);
    expect(registry.getPending(7).map((migration) => migration.id)).toEqual([
      "008_knowledge_relationship",
      "009_knowledge_embedding",
    ]);
    expect(registry.getPending(8).map((migration) => migration.id)).toEqual([
      "009_knowledge_embedding",
    ]);
    expect(registry.getByVersion(7)?.id).toBe("007_knowledge_memory");
    expect(registry.getByVersion(8)?.id).toBe("008_knowledge_relationship");
    expect(registry.getByVersion(9)?.id).toBe("009_knowledge_embedding");
  });
});

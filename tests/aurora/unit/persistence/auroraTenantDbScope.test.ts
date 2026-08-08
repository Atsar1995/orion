import { assertAuroraTenantDbScopeId } from "@/lib/aurora/persistence/AuroraTenantDbScope";
import { AURORA_ERR_0403, AuroraError } from "@/lib/aurora/errors/AuroraError";
import { describe, expect, it } from "vitest";

describe("assertAuroraTenantDbScopeId", () => {
  it("accepts UUID tenant ids", () => {
    expect(() =>
      assertAuroraTenantDbScopeId("550e8400-e29b-41d4-a716-446655440000"),
    ).not.toThrow();
  });

  it("rejects non-UUID tenant ids such as the platform system sentinel", () => {
    try {
      assertAuroraTenantDbScopeId("system");
      throw new Error("expected failure");
    } catch (error) {
      expect(error).toBeInstanceOf(AuroraError);
      expect((error as AuroraError).code).toBe(AURORA_ERR_0403);
    }
  });
});

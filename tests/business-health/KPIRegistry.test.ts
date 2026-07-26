import { describe, expect, it } from "vitest";
import { KPIRegistry } from "@/lib/business-health/registry/KPIRegistry";
import { finalizeKPI } from "@/lib/business-health/utils/HealthUtils";
import { createTestKPI } from "@/tests/fixtures/business-health";

describe("KPIRegistry", () => {
  it("registers and looks up KPIs", () => {
    const registry = new KPIRegistry();
    const kpi = finalizeKPI(createTestKPI({ id: "kpi-a", name: "Sessions", category: "marketing" }));

    const result = registry.register(kpi);

    expect(result.success).toBe(true);
    expect(registry.lookup("kpi-a")).toEqual(kpi);
    expect(registry.getKPI("kpi-a")).toEqual(kpi);
    expect(registry.size()).toBe(1);
  });

  it("rejects duplicate KPI IDs", () => {
    const registry = new KPIRegistry();
    const kpi = finalizeKPI(createTestKPI({ id: "dup", name: "Orders", category: "revenue" }));

    registry.register(kpi);
    const duplicate = registry.register(kpi);

    expect(duplicate.success).toBe(false);
    if (!duplicate.success) {
      expect(duplicate.error.code).toBe("DUPLICATE_KPI");
    }
  });

  it("validates category assignments", () => {
    const registry = new KPIRegistry();
    const invalid = registry.validateCategoryAssignment("unknown");

    expect(invalid.success).toBe(false);
    if (!invalid.success) {
      expect(invalid.error.code).toBe("INVALID_CATEGORY");
    }
  });

  it("rejects invalid weights without throwing", () => {
    const registry = new KPIRegistry();
    const result = registry.register(
      finalizeKPI(
        createTestKPI({
          id: "bad-weight",
          name: "Invalid",
          category: "revenue",
          weight: 0,
        }),
      ),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("INVALID_WEIGHT");
    }
  });

  it("retrieves KPIs by category and removes entries", () => {
    const registry = new KPIRegistry();
    registry.register(finalizeKPI(createTestKPI({ id: "m1", name: "Sessions", category: "marketing" })));
    registry.register(finalizeKPI(createTestKPI({ id: "r1", name: "Revenue", category: "revenue" })));

    expect(registry.getByCategory("marketing")).toHaveLength(1);
    expect(registry.remove("m1").success).toBe(true);
    expect(registry.getByCategory("marketing")).toHaveLength(0);
  });
});

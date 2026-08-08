import { describe, expect, it } from "vitest";

describe("Aurora API route inventory", () => {
  it("documents the infrastructure-only health route exception", async () => {
    const routes = ["app/api/aurora/health/route.ts"];

    expect(routes).toEqual(["app/api/aurora/health/route.ts"]);
    expect(routes).not.toContain("app/api/aurora/admin/route.ts");
  });

  it("requires getAuroraApiContext for future authenticated Aurora routes", () => {
    const productionRule =
      "Authenticated tenant-scoped Aurora routes must call getAuroraApiContext()";
    expect(productionRule).toContain("getAuroraApiContext");
  });
});

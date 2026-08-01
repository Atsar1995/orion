import { describe, expect, it } from "vitest";
import { buildBreadcrumbs } from "@/lib/navigation/BreadcrumbBuilder";
import { NavigationRegistry } from "@/lib/navigation/NavigationRegistry";

describe("NavigationRegistry", () => {
  it("returns configured executive navigation sections", () => {
    const registry = new NavigationRegistry();
    const executive = registry.getSections().find((section) => section.id === "executive");

    expect(executive?.items.map((item) => item.href)).toEqual([
      "/brief",
      "/memory",
      "/decisions",
      "/command-center",
      "/mission-control",
    ]);
  });

  it("finds the most specific route for nested paths", () => {
    const registry = new NavigationRegistry();
    const route = registry.findRouteByHref("/finance/revenue");

    expect(route?.label).toBe("Finance");
    expect(route?.href).toBe("/finance");
  });
});

describe("BreadcrumbBuilder", () => {
  it("builds deterministic breadcrumbs for nested routes", () => {
    expect(buildBreadcrumbs("/finance/revenue")).toEqual([
      { label: "Morning Brief", href: "/brief" },
      { label: "Finance", href: "/finance" },
      { label: "Revenue", href: "/finance/revenue" },
    ]);
  });

  it("returns brief root breadcrumb for platform home redirect target", () => {
    expect(buildBreadcrumbs("/brief")).toEqual([{ label: "Morning Brief", href: "/brief" }]);
  });
});

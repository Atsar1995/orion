import { describe, expect, it } from "vitest";
import { buildBreadcrumbs } from "@/lib/navigation/BreadcrumbBuilder";
import { NavigationRegistry } from "@/lib/navigation/NavigationRegistry";
import { executiveNav } from "@/lib/navigation/NavigationConfig";

describe("NavigationRegistry", () => {
  it("returns configured executive navigation sections", () => {
    const registry = new NavigationRegistry();
    const executive = registry.getSections().find((section) => section.id === "executive");

    expect(executive?.items).toEqual(executiveNav);
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
      { label: "ORION", href: "/" },
      { label: "Finance", href: "/finance" },
      { label: "Revenue", href: "/finance/revenue" },
    ]);
  });

  it("returns root breadcrumb for platform home", () => {
    expect(buildBreadcrumbs("/")).toEqual([{ label: "ORION", href: "/" }]);
  });
});

import { describe, expect, it } from "vitest";
import {
  DEFAULT_PLATFORM_FEATURE_FLAGS,
  InMemoryFeatureRegistry,
  StaticFeatureFlags,
} from "@/lib/platform";

describe("EP-001 platform contracts", () => {
  it("evaluates static feature flags from defaults", () => {
    const flags = new StaticFeatureFlags();

    expect(flags.isEnabled("executive.brief.enabled")).toBe(true);
    expect(flags.isEnabled("executive.ai-summary.enabled")).toBe(false);
    expect(flags.list()).toEqual(DEFAULT_PLATFORM_FEATURE_FLAGS);
  });

  it("registers platform features by category", () => {
    const registry = new InMemoryFeatureRegistry();
    registry.register({
      id: "brief",
      name: "Morning Brief",
      description: "Executive brief surface",
      category: "executive",
      enabledByDefault: true,
      routeHref: "/brief",
    });

    expect(registry.listByCategory("executive")).toHaveLength(1);
    expect(registry.get("brief")?.routeHref).toBe("/brief");
  });
});

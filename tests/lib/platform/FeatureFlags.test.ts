import { describe, expect, it } from "vitest";

import {
  DEFAULT_PLATFORM_FEATURE_FLAGS,
  StaticFeatureFlags,
} from "@/lib/platform/FeatureFlags";

import {
  InMemoryFeatureRegistry,
} from "@/lib/platform/FeatureRegistry";

describe("StaticFeatureFlags", () => {
  it("exposes the default ORION feature flag catalogue", () => {
    const flags = new StaticFeatureFlags();

    expect(flags.list()).toEqual(DEFAULT_PLATFORM_FEATURE_FLAGS);
    expect(flags.list()).toHaveLength(3);
  });

  it("returns the correct definition for a known feature flag", () => {
    const flags = new StaticFeatureFlags();

    expect(flags.getDefinition("executive.brief.enabled")).toEqual({
      key: "executive.brief.enabled",
      description: "Enable Morning Executive Brief surface",
      defaultEnabled: true,
      scope: "organization",
    });
  });

  it("evaluates enabled and disabled default flags correctly", () => {
    const flags = new StaticFeatureFlags();

    expect(flags.isEnabled("executive.brief.enabled")).toBe(true);
    expect(flags.isEnabled("executive.command-center.enabled")).toBe(true);
    expect(flags.isEnabled("executive.ai-summary.enabled")).toBe(false);
  });

  it("returns false for an unknown feature flag", () => {
    const flags = new StaticFeatureFlags();

    expect(flags.isEnabled("feature.does-not-exist")).toBe(false);
    expect(flags.getDefinition("feature.does-not-exist")).toBeUndefined();
  });

  it("supports a custom feature flag catalogue", () => {
    const flags = new StaticFeatureFlags([
      {
        key: "test.feature.enabled",
        description: "Test feature",
        defaultEnabled: true,
        scope: "organization",
      },
    ]);

    expect(flags.list()).toHaveLength(1);
    expect(flags.isEnabled("test.feature.enabled")).toBe(true);
    expect(flags.isEnabled("executive.brief.enabled")).toBe(false);
  });
});

describe("InMemoryFeatureRegistry", () => {
  it("registers and retrieves feature definitions", () => {
    const registry = new InMemoryFeatureRegistry();

    const feature = {
      id: "executive.brief",
      name: "Executive Brief",
      description: "Morning executive briefing",
      category: "executive" as const,
      enabledByDefault: true,
      routeHref: "/executive",
    };

    registry.register(feature);

    expect(registry.get("executive.brief")).toEqual(feature);
  });

  it("returns undefined for an unknown feature", () => {
    const registry = new InMemoryFeatureRegistry();

    expect(registry.get("feature.does-not-exist")).toBeUndefined();
  });

  it("lists registered features alphabetically by name", () => {
    const registry = new InMemoryFeatureRegistry();

    registry.register({
      id: "feature.z",
      name: "Zeta Feature",
      description: "Zeta",
      category: "platform",
      enabledByDefault: true,
    });

    registry.register({
      id: "feature.a",
      name: "Alpha Feature",
      description: "Alpha",
      category: "workspace",
      enabledByDefault: false,
    });

    registry.register({
      id: "feature.m",
      name: "Middle Feature",
      description: "Middle",
      category: "integration",
      enabledByDefault: true,
    });

    expect(registry.list().map((feature) => feature.name)).toEqual([
      "Alpha Feature",
      "Middle Feature",
      "Zeta Feature",
    ]);
  });

  it("filters registered features by category", () => {
    const registry = new InMemoryFeatureRegistry();

    registry.register({
      id: "executive.brief",
      name: "Executive Brief",
      description: "Brief",
      category: "executive",
      enabledByDefault: true,
    });

    registry.register({
      id: "executive.command",
      name: "Command Center",
      description: "Command",
      category: "executive",
      enabledByDefault: true,
    });

    registry.register({
      id: "shopify.integration",
      name: "Shopify",
      description: "Shopify integration",
      category: "integration",
      enabledByDefault: false,
    });

    expect(
      registry.listByCategory("executive").map((feature) => feature.id),
    ).toEqual([
      "executive.command",
      "executive.brief",
    ]);

    expect(registry.listByCategory("integration").map((feature) => feature.id))
      .toEqual(["shopify.integration"]);

    expect(registry.listByCategory("workspace")).toEqual([]);
  });

  it("replaces an existing feature definition with the same id", () => {
    const registry = new InMemoryFeatureRegistry();

    registry.register({
      id: "executive.brief",
      name: "Executive Brief",
      description: "Original",
      category: "executive",
      enabledByDefault: true,
    });

    registry.register({
      id: "executive.brief",
      name: "Executive Brief Updated",
      description: "Updated",
      category: "executive",
      enabledByDefault: false,
    });

    expect(registry.list()).toHaveLength(1);
    expect(registry.get("executive.brief")?.name).toBe(
      "Executive Brief Updated",
    );
    expect(registry.get("executive.brief")?.enabledByDefault).toBe(false);
  });
});



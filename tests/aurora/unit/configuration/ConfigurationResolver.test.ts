import { describe, expect, it } from "vitest";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type {
  ConfigKey,
  ConfigProviderScope,
  ConfigurationProvider,
} from "@/lib/aurora/platform/configuration/ConfigurationProvider";
import { DefaultConfigurationResolver } from "@/lib/aurora/platform/configuration/DefaultConfigurationResolver";

function createContext(): AuroraRuntimeContext {
  return {
    tenantId: "tenant-a",
    userId: "user-a",
    orionOrganizationId: "org-a",
    workspaceId: "workspace-a",
    roles: [],
    auroraPermissions: [],
    brandId: "brand-a",
    businessId: "business-a",
    locale: "en-US",
    timezone: "UTC",
    requestId: "request-a",
    correlationId: "correlation-a",
    contextSource: "test-manual",
    platformState: "ready",
    featureFlags: {},
  };
}

function provider(
  scope: ConfigProviderScope,
  priority: number,
  values: Readonly<Record<string, unknown>>,
): ConfigurationProvider {
  return {
    scope,
    priority,
    async get(key: ConfigKey, _ctx: AuroraRuntimeContext) {
      return values[key];
    },
  };
}

describe("DefaultConfigurationResolver", () => {
  it("resolves the highest-priority defined value", async () => {
    const resolver = new DefaultConfigurationResolver([
      provider("global", 100, { locale: "global" }),
      provider("tenant", 500, { locale: "tenant" }),
      provider("environment", 600, { locale: "environment" }),
    ]);

    const result = await resolver.resolve("locale", createContext());

    expect(result).toEqual({
      key: "locale",
      value: "environment",
      providerScope: "environment",
      providerPriority: 600,
    });
  });

  it("falls through providers with undefined values", async () => {
    const resolver = new DefaultConfigurationResolver([
      provider("global", 100, { locale: "global" }),
      provider("tenant", 500, { locale: "tenant" }),
      provider("environment", 600, {}),
    ]);

    const result = await resolver.resolve("locale", createContext());

    expect(result).toEqual({
      key: "locale",
      value: "tenant",
      providerScope: "tenant",
      providerPriority: 500,
    });
  });

  it("returns undefined when no provider defines the key", async () => {
    const resolver = new DefaultConfigurationResolver([
      provider("global", 100, {}),
      provider("tenant", 500, {}),
      provider("environment", 600, {}),
    ]);

    const result = await resolver.resolve("missing.key", createContext());

    expect(result).toEqual({
      key: "missing.key",
      value: undefined,
    });
  });

  it("sorts providers independently of constructor order", async () => {
    const resolver = new DefaultConfigurationResolver([
      provider("global", 100, { locale: "global" }),
      provider("brand", 300, { locale: "brand" }),
      provider("workspace", 200, { locale: "workspace" }),
      provider("environment", 600, { locale: "environment" }),
      provider("business", 400, { locale: "business" }),
      provider("tenant", 500, { locale: "tenant" }),
    ]);

    const result = await resolver.resolve("locale", createContext());

    expect(result.providerScope).toBe("environment");
    expect(result.providerPriority).toBe(600);
    expect(result.value).toBe("environment");
  });
});

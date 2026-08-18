import { describe, expect, it } from "vitest";
import { DefaultConfigurationResolver } from "@/lib/aurora/platform/configuration/DefaultConfigurationResolver";
import { EnvironmentConfigurationProvider } from "@/lib/aurora/platform/configuration/EnvironmentConfigurationProvider";
import { GlobalConfigurationProvider } from "@/lib/aurora/platform/configuration/GlobalConfigurationProvider";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";

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
    timezone: "America/New_York",
    requestId: "request-a",
    correlationId: "correlation-a",
    contextSource: "test-manual",
    platformState: "ready",
    featureFlags: {},
  };
}

describe("DefaultConfigurationResolver integration", () => {
  it("resolves environment configuration before global configuration", async () => {
    const resolver = new DefaultConfigurationResolver([
      new GlobalConfigurationProvider({
        locale: "global",
      }),
      new EnvironmentConfigurationProvider({
        locale: "environment",
      }),
    ]);

    const result = await resolver.resolve("locale", createContext());

    expect(result).toEqual({
      key: "locale",
      value: "environment",
      providerScope: "environment",
      providerPriority: 600,
    });
  });

  it("falls through to global configuration when environment is undefined", async () => {
    const resolver = new DefaultConfigurationResolver([
      new GlobalConfigurationProvider({
        locale: "global",
      }),
      new EnvironmentConfigurationProvider(),
    ]);

    const result = await resolver.resolve("locale", createContext());

    expect(result).toEqual({
      key: "locale",
      value: "global",
      providerScope: "global",
      providerPriority: 100,
    });
  });

  it("returns an unresolved result when no provider defines the key", async () => {
    const resolver = new DefaultConfigurationResolver([
      new EnvironmentConfigurationProvider(),
      new GlobalConfigurationProvider(),
    ]);

    const result = await resolver.resolve("locale", createContext());

    expect(result).toEqual({
      key: "locale",
      value: undefined,
    });
  });

  it("is independent of provider constructor order", async () => {
    const resolver = new DefaultConfigurationResolver([
      new GlobalConfigurationProvider({
        locale: "global",
      }),
      new EnvironmentConfigurationProvider({
        locale: "environment",
      }),
    ]);

    const result = await resolver.resolve("locale", createContext());

    expect(result.providerScope).toBe("environment");
    expect(result.providerPriority).toBe(600);
    expect(result.value).toBe("environment");
  });
});

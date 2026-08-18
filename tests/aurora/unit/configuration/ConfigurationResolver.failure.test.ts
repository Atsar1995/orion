import { describe, expect, it } from "vitest";
import { DefaultConfigurationResolver } from "@/lib/aurora/platform/configuration/DefaultConfigurationResolver";
import type { ConfigurationProvider } from "@/lib/aurora/platform/configuration/ConfigurationProvider";
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
    timezone: "UTC",
    requestId: "request-a",
    correlationId: "correlation-a",
    contextSource: "test-manual",
    platformState: "ready",
    featureFlags: {},
  };
}

describe("DefaultConfigurationResolver provider failures", () => {
  it("fails fast when the highest-priority provider throws", async () => {
    const failingProvider: ConfigurationProvider = {
      priority: 600,
      scope: "environment",
      async get() {
        throw new Error("environment provider unavailable");
      },
    };

    const fallbackProvider: ConfigurationProvider = {
      priority: 500,
      scope: "tenant",
      async get() {
        return "tenant-value";
      },
    };

    const resolver = new DefaultConfigurationResolver([
      fallbackProvider,
      failingProvider,
    ]);

    await expect(
      resolver.resolve("locale", createContext()),
    ).rejects.toThrow("environment provider unavailable");
  });

  it("does not consult lower-priority providers after a provider failure", async () => {
    let fallbackCalls = 0;

    const failingProvider: ConfigurationProvider = {
      priority: 600,
      scope: "environment",
      async get() {
        throw new Error("provider failure");
      },
    };

    const fallbackProvider: ConfigurationProvider = {
      priority: 500,
      scope: "tenant",
      async get() {
        fallbackCalls += 1;
        return "tenant-value";
      },
    };

    const resolver = new DefaultConfigurationResolver([
      failingProvider,
      fallbackProvider,
    ]);

    await expect(
      resolver.resolve("locale", createContext()),
    ).rejects.toThrow("provider failure");

    expect(fallbackCalls).toBe(0);
  });
});

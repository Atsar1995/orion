import { describe, expect, it } from "vitest";
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
    timezone: "UTC",
    requestId: "request-a",
    correlationId: "correlation-a",
    contextSource: "test-manual",
    platformState: "ready",
    featureFlags: {},
  };
}

describe("EnvironmentConfigurationProvider", () => {
  it("exposes environment values by key", async () => {
    const provider = new EnvironmentConfigurationProvider({
      locale: "en-US",
      timezone: "America/New_York",
      "aurora.publish.enabled": true,
    });

    const ctx = createContext();

    expect(await provider.get("locale", ctx)).toBe("en-US");
    expect(await provider.get("timezone", ctx)).toBe("America/New_York");
    expect(await provider.get("aurora.publish.enabled", ctx)).toBe(true);
  });

  it("returns undefined for an unknown key", async () => {
    const provider = new EnvironmentConfigurationProvider({
      locale: "en-US",
    });

    expect(await provider.get("missing.key", createContext())).toBeUndefined();
  });

  it("has environment priority 600", () => {
    const provider = new EnvironmentConfigurationProvider();

    expect(provider.scope).toBe("environment");
    expect(provider.priority).toBe(600);
  });
});

describe("GlobalConfigurationProvider", () => {
  it("exposes global values by key", async () => {
    const provider = new GlobalConfigurationProvider({
      "platform.name": "ORION",
      "aurora.platform.enabled": true,
    });

    const ctx = createContext();

    expect(await provider.get("platform.name", ctx)).toBe("ORION");
    expect(await provider.get("aurora.platform.enabled", ctx)).toBe(true);
  });

  it("returns undefined for an unknown key", async () => {
    const provider = new GlobalConfigurationProvider({
      "platform.name": "ORION",
    });

    expect(await provider.get("missing.key", createContext())).toBeUndefined();
  });

  it("has global priority 100", () => {
    const provider = new GlobalConfigurationProvider();

    expect(provider.scope).toBe("global");
    expect(provider.priority).toBe(100);
  });
});

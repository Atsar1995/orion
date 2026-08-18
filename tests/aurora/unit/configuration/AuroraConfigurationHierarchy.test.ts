import { describe, expect, it, vi } from "vitest";
import { DefaultConfigurationResolver } from "@/lib/aurora/platform/configuration/DefaultConfigurationResolver";
import { EnvironmentConfigurationProvider } from "@/lib/aurora/platform/configuration/EnvironmentConfigurationProvider";
import { GlobalConfigurationProvider } from "@/lib/aurora/platform/configuration/GlobalConfigurationProvider";
import { TenantConfigurationProvider } from "@/lib/aurora/platform/configuration/TenantConfigurationProvider";
import { BusinessConfigurationProvider } from "@/lib/aurora/platform/configuration/BusinessConfigurationProvider";
import { BrandConfigurationProvider } from "@/lib/aurora/platform/configuration/BrandConfigurationProvider";
import { WorkspaceConfigurationProvider } from "@/lib/aurora/platform/configuration/WorkspaceConfigurationProvider";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { ConfigurationRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { BusinessEntityRepository } from "@/lib/aurora/admin/repositories/BusinessEntityRepository";

import type { WorkspaceConfigRepository } from "@/lib/aurora/admin/repositories/TenantRepository";

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

function createTenantConfigurationRepository(): ConfigurationRepository {
  return {
    get: vi.fn(async () => null),
    upsert: vi.fn(async (value) => value),
  };
}

function createBusinessRepository(): BusinessEntityRepository {
  return {
    getById: vi.fn(async () => null),
    getBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    listByTenant: vi.fn(),
    delete: vi.fn(),
  };
}

function createBrandRepository() {
  return {
    getById: vi.fn(async () => null),
    getBySlug: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    listByTenant: vi.fn(),
    delete: vi.fn(),
  };
}

function createWorkspaceRepository(): WorkspaceConfigRepository {
  return {
    get: vi.fn(async () => null),
    upsert: vi.fn(async (value) => ({
      tenantId: value.tenantId,
      userId: value.userId,
      activeBrandId: value.activeBrandId,
      dashboardLayout: value.dashboardLayout,
      notificationPreferences: value.notificationPreferences,
    })),
  };
}

describe("Aurora configuration hierarchy", () => {
  it("resolves the highest-priority defined configuration value", async () => {
    const resolver = new DefaultConfigurationResolver([
      new GlobalConfigurationProvider({
        locale: "global",
      }),
      new WorkspaceConfigurationProvider(createWorkspaceRepository()),
      new BrandConfigurationProvider(createBrandRepository()),
      new BusinessConfigurationProvider(createBusinessRepository()),
      new TenantConfigurationProvider(createTenantConfigurationRepository()),
      new EnvironmentConfigurationProvider({
        locale: "environment",
      }),
    ]);

    const result = await resolver.resolve("locale", createContext());

    expect(result.value).toBe("environment");
    expect(result.providerScope).toBe("environment");
    expect(result.providerPriority).toBe(600);
  });

  it("falls through every undefined scope until global configuration", async () => {
    const resolver = new DefaultConfigurationResolver([
      new EnvironmentConfigurationProvider(),
      new TenantConfigurationProvider(createTenantConfigurationRepository()),
      new BusinessConfigurationProvider(createBusinessRepository()),
      new BrandConfigurationProvider(createBrandRepository()),
      new WorkspaceConfigurationProvider(createWorkspaceRepository()),
      new GlobalConfigurationProvider({
        locale: "global",
      }),
    ]);

    const result = await resolver.resolve("locale", createContext());

    expect(result.value).toBe("global");
    expect(result.providerScope).toBe("global");
    expect(result.providerPriority).toBe(100);
  });
});



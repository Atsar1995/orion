import { describe, expect, it, vi } from "vitest";
import { BusinessConfigurationProvider } from "@/lib/aurora/platform/configuration/BusinessConfigurationProvider";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { BusinessEntityRepository } from "@/lib/aurora/admin/repositories/BusinessEntityRepository";
import type { BusinessEntity } from "@/types/aurora-admin";

function createContext(
  overrides: Partial<AuroraRuntimeContext> = {},
): AuroraRuntimeContext {
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
    ...overrides,
  };
}

function createBusiness(): BusinessEntity {
  return {
    id: "business-a",
    tenantId: "tenant-a",
    name: "Business A",
    slug: "business-a",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createRepository(
  business: BusinessEntity | null,
): BusinessEntityRepository {
  return {
    create: vi.fn(async (businessId: string, input) => ({
      ...business,
      id: businessId,
      ...input,
    })) as BusinessEntityRepository["create"],

    getById: vi.fn(async (tenantId: string, businessId: string) => {
      if (
        business &&
        business.tenantId === tenantId &&
        business.id === businessId
      ) {
        return business;
      }
      return null;
    }),

    getBySlug: vi.fn(async () => null),
    update: vi.fn(async () => business as BusinessEntity),
    listByTenant: vi.fn(async () => []),
    delete: vi.fn(async () => undefined),
  };
}

describe("BusinessConfigurationProvider", () => {
  it("returns supported business configuration values", async () => {
    const business = createBusiness();
    const repository = createRepository(business);
    const provider = new BusinessConfigurationProvider(repository);

    const ctx = createContext();

    expect(await provider.get("business", ctx)).toEqual(business);
    expect(await provider.get("businessId", ctx)).toBe("business-a");
    expect(await provider.get("businessName", ctx)).toBe("Business A");
    expect(await provider.get("businessSlug", ctx)).toBe("business-a");
    expect(await provider.get("businessStatus", ctx)).toBe("active");
  });

  it("uses both tenant id and business id from the runtime context", async () => {
    const business = createBusiness();
    const repository = createRepository(business);
    const provider = new BusinessConfigurationProvider(repository);

    await provider.get("business", createContext());

    expect(repository.getById).toHaveBeenCalledWith(
      "tenant-a",
      "business-a",
    );
    expect(repository.getById).toHaveBeenCalledTimes(1);
  });

  it("does not return a business belonging to another tenant", async () => {
    const business = createBusiness();
    const repository = createRepository(business);
    const provider = new BusinessConfigurationProvider(repository);

    const result = await provider.get(
      "business",
      createContext({ tenantId: "tenant-b" }),
    );

    expect(result).toBeUndefined();
  });

  it("returns undefined when the business does not exist", async () => {
    const repository = createRepository(null);
    const provider = new BusinessConfigurationProvider(repository);

    expect(
      await provider.get("business", createContext()),
    ).toBeUndefined();
  });

  it("returns undefined for an unsupported configuration key", async () => {
    const business = createBusiness();
    const repository = createRepository(business);
    const provider = new BusinessConfigurationProvider(repository);

    expect(
      await provider.get("unknown.key", createContext()),
    ).toBeUndefined();
  });

  it("has business scope and priority 250", () => {
    const provider = new BusinessConfigurationProvider(
      createRepository(null),
    );

    expect(provider.scope).toBe("business");
    expect(provider.priority).toBe(250);
  });

  it("propagates repository failures", async () => {
    const repository: BusinessEntityRepository = {
      create: vi.fn(),
      getById: vi.fn(async () => {
        throw new Error("repository failure");
      }),
      getBySlug: vi.fn(),
      update: vi.fn(),
      listByTenant: vi.fn(),
      delete: vi.fn(),
    };

    const provider = new BusinessConfigurationProvider(repository);

    await expect(
      provider.get("business", createContext()),
    ).rejects.toThrow("repository failure");
  });
});

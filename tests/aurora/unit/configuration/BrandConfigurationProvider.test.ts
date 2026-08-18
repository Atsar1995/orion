import { describe, expect, it, vi } from "vitest";
import { BrandConfigurationProvider } from "@/lib/aurora/platform/configuration/BrandConfigurationProvider";
import type { AuroraRuntimeContext } from "@/lib/aurora/runtime/AuroraRuntimeContext";
import type { BrandRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
import type { Brand } from "@/types/aurora-admin";

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

function createBrand(): Brand {
  return {
    id: "brand-a",
    tenantId: "tenant-a",
    businessId: "business-a",
    name: "Brand A",
    slug: "brand-a",
    locale: "en-US",
    timezone: "America/New_York",
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function createRepository(
  brand: Brand | null,
): BrandRepository {
  return {
    create: vi.fn(async (brandId: string, input) => ({
      ...brand,
      id: brandId,
      ...input,
    })) as BrandRepository["create"],

    getById: vi.fn(async (tenantId: string, brandId: string) => {
      if (
        brand &&
        brand.tenantId === tenantId &&
        brand.id === brandId
      ) {
        return brand;
      }
      return null;
    }),

    update: vi.fn(async () => brand as Brand),
    listByTenant: vi.fn(async () => []),
    delete: vi.fn(async () => undefined),
  };
}

describe("BrandConfigurationProvider", () => {
  it("returns supported brand configuration values", async () => {
    const brand = createBrand();
    const repository = createRepository(brand);
    const provider = new BrandConfigurationProvider(repository);

    const ctx = createContext();

    expect(await provider.get("brand", ctx)).toEqual(brand);
    expect(await provider.get("brandId", ctx)).toBe("brand-a");
    expect(await provider.get("brandName", ctx)).toBe("Brand A");
    expect(await provider.get("brandSlug", ctx)).toBe("brand-a");
    expect(await provider.get("brandLocale", ctx)).toBe("en-US");
    expect(await provider.get("brandTimezone", ctx)).toBe(
      "America/New_York",
    );
    expect(await provider.get("brandStatus", ctx)).toBe("active");
  });

  it("uses both tenant id and brand id from the runtime context", async () => {
    const brand = createBrand();
    const repository = createRepository(brand);
    const provider = new BrandConfigurationProvider(repository);

    await provider.get("brand", createContext());

    expect(repository.getById).toHaveBeenCalledWith(
      "tenant-a",
      "brand-a",
    );
    expect(repository.getById).toHaveBeenCalledTimes(1);
  });

  it("does not return a brand belonging to another tenant", async () => {
    const brand = createBrand();
    const repository = createRepository(brand);
    const provider = new BrandConfigurationProvider(repository);

    const result = await provider.get(
      "brand",
      createContext({ tenantId: "tenant-b" }),
    );

    expect(result).toBeUndefined();
  });

  it("returns undefined when the brand does not exist", async () => {
    const repository = createRepository(null);
    const provider = new BrandConfigurationProvider(repository);

    expect(
      await provider.get("brand", createContext()),
    ).toBeUndefined();
  });

  it("returns undefined for an unsupported configuration key", async () => {
    const brand = createBrand();
    const repository = createRepository(brand);
    const provider = new BrandConfigurationProvider(repository);

    expect(
      await provider.get("unknown.key", createContext()),
    ).toBeUndefined();
  });

  it("has brand scope and priority 300", () => {
    const provider = new BrandConfigurationProvider(
      createRepository(null),
    );

    expect(provider.scope).toBe("brand");
    expect(provider.priority).toBe(300);
  });

  it("propagates repository failures", async () => {
    const repository: BrandRepository = {
      create: vi.fn(),
      getById: vi.fn(async () => {
        throw new Error("repository failure");
      }),
      update: vi.fn(),
      listByTenant: vi.fn(),
      delete: vi.fn(),
    };

    const provider = new BrandConfigurationProvider(repository);

    await expect(
      provider.get("brand", createContext()),
    ).rejects.toThrow("repository failure");
  });
});

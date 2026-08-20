import { describe, expect, it, vi } from "vitest";
import { WorkspaceConfigurationProvider } from "@/lib/aurora/platform/configuration/WorkspaceConfigurationProvider";
import type { WorkspaceConfigRepository } from "@/lib/aurora/admin/repositories/TenantRepository";
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

function createRepository(
  get: WorkspaceConfigRepository["get"],
): WorkspaceConfigRepository {
  return {
    get,
    upsert: vi.fn(async (value) => ({
      tenantId: value.tenantId,
      userId: value.userId,
      activeBrandId: value.activeBrandId ?? null,
      dashboardLayout: value.dashboardLayout ?? {},
      notificationPreferences: value.notificationPreferences ?? {},
    })),
  };
}

describe("WorkspaceConfigurationProvider", () => {
  it("returns supported workspace configuration values", async () => {
    const repository = createRepository(
      vi.fn(async () => ({
        tenantId: "tenant-a",
        userId: "user-a",
        activeBrandId: "brand-a",
        dashboardLayout: {
          columns: 3,
        },
        notificationPreferences: {
          email: true,
        },
      })),
    );

    const provider = new WorkspaceConfigurationProvider(repository);
    const ctx = createContext();

    await expect(provider.get("workspace", ctx)).resolves.toEqual({
      tenantId: "tenant-a",
      userId: "user-a",
      activeBrandId: "brand-a",
      dashboardLayout: {
        columns: 3,
      },
      notificationPreferences: {
        email: true,
      },
    });

    await expect(provider.get("activeBrandId", ctx)).resolves.toBe("brand-a");

    await expect(provider.get("dashboardLayout", ctx)).resolves.toEqual({
      columns: 3,
    });

    await expect(
      provider.get("notificationPreferences", ctx),
    ).resolves.toEqual({
      email: true,
    });
  });

  it("reads workspace configuration using tenant and user from context", async () => {
    const get = vi.fn(async () => null);
    const repository = createRepository(get);

    const provider = new WorkspaceConfigurationProvider(repository);
    const ctx = createContext();

    await provider.get("workspace", ctx);

    expect(get).toHaveBeenCalledWith("tenant-a", "user-a");
  });

  it("returns undefined when workspace configuration does not exist", async () => {
    const repository = createRepository(
      vi.fn(async () => null),
    );

    const provider = new WorkspaceConfigurationProvider(repository);

    await expect(
      provider.get("workspace", createContext()),
    ).resolves.toBeUndefined();
  });

  it("returns undefined for an unsupported configuration key", async () => {
    const repository = createRepository(
      vi.fn(async () => ({
        tenantId: "tenant-a",
        userId: "user-a",
        activeBrandId: "brand-a",
        dashboardLayout: {},
        notificationPreferences: {},
      })),
    );

    const provider = new WorkspaceConfigurationProvider(repository);

    await expect(
      provider.get("unsupported.key", createContext()),
    ).resolves.toBeUndefined();
  });

  it("has workspace scope and priority 500", () => {
    const repository = createRepository(
      vi.fn(async () => null),
    );

    const provider = new WorkspaceConfigurationProvider(repository);

    expect(provider.scope).toBe("workspace");
    expect(provider.priority).toBe(500);
  });

  it("propagates repository failures", async () => {
    const repository = createRepository(
      vi.fn(async () => {
        throw new Error("repository failure");
      }),
    );

    const provider = new WorkspaceConfigurationProvider(repository);

    await expect(
      provider.get("workspace", createContext()),
    ).rejects.toThrow("repository failure");
  });
});

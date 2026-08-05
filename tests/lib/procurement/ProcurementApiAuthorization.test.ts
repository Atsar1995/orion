import fs from "fs";
import path from "path";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { procurementFacade } from "@/lib/procurement";
import { PROCUREMENT_PERMISSIONS } from "@/lib/procurement/security/procurement-permission-catalog";
import { getProcurementApiContextForRequest } from "@/lib/procurement/security/ProcurementPermissionGuards";
import { UserStatus } from "@/types/auth";
import { SystemRole } from "@/lib/auth/roles";

vi.mock("@/lib/identity/server-session", () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from "@/lib/identity/server-session";
import { GET as getVendors, POST as createVendor } from "@/app/api/procurement/vendors/route";
import { GET as getExecutiveDashboard } from "@/app/api/procurement/executive/dashboard/route";

const ORG_A = "org-orania";

function walkRouteFiles(dir: string, files: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkRouteFiles(full, files);
    else if (entry.name === "route.ts") files.push(full);
  }
  return files;
}

function sessionFor(role: SystemRole) {
  return {
    session: {
      user: {
        id: `user-${role}`,
        email: `${role}@orion.local`,
        name: role,
        status: UserStatus.Active,
        organizationId: ORG_A,
        workspaceId: "workspace-orania",
        role,
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      expiresAt: new Date(Date.now() + 60_000),
      activeWorkspace: {
        id: "workspace-orania",
        organizationId: ORG_A,
        name: "Default",
        slug: "default",
        modules: ["procurement"],
      },
    },
    profile: null,
  };
}

describe("Procurement API Authorization Convergence (P-010.12)", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
  });

  afterEach(() => {
    delete process.env.ORION_AUTH_FAIL_CLOSED;
  });

  it("reports Procurement domain as RBAC-ready", () => {
    expect(procurementFacade.getDomainStatus().readyForRbac).toBe(true);
  });

  it("converges all Procurement REST routes onto getProcurementApiContextForRequest", () => {
    const routesRoot = path.join(process.cwd(), "app/api/procurement");
    const routeFiles = walkRouteFiles(routesRoot);

    expect(routeFiles.length).toBe(38);

    for (const file of routeFiles) {
      const source = fs.readFileSync(file, "utf8");
      expect(source, path.relative(process.cwd(), file)).toContain("getProcurementApiContextForRequest");
    }
  });

  it("returns 401 for unauthenticated Procurement API requests when fail-closed is enabled", async () => {
    process.env.ORION_AUTH_FAIL_CLOSED = "true";
    vi.mocked(getServerSession).mockResolvedValue({ session: null, profile: null });

    const request = new Request("http://localhost/api/procurement/vendors", { method: "GET" });
    const result = await getProcurementApiContextForRequest(request);

    expect(result.errorResponse).not.toBeNull();
    expect(result.errorResponse?.status).toBe(401);
  });

  it("returns 403 for authenticated users without explicit Procurement grants", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.ReadOnly));

    const request = new Request("http://localhost/api/procurement/vendors", { method: "POST" });
    const result = await getProcurementApiContextForRequest(request);

    expect(result.errorResponse).not.toBeNull();
    expect(result.errorResponse?.status).toBe(403);
  });

  it("returns 403 for unknown mutating Procurement routes", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.Executive));

    const request = new Request("http://localhost/api/procurement/unknown/action", { method: "POST" });
    const result = await getProcurementApiContextForRequest(request);

    expect(result.errorResponse).not.toBeNull();
    expect(result.errorResponse?.status).toBe(403);
  });

  it("authorizes vendor read routes for organization administrators", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.OrganizationAdmin));

    const request = new Request("http://localhost/api/procurement/vendors", { method: "GET" });
    const result = await getProcurementApiContextForRequest(request);

    expect(result.errorResponse).toBeNull();
    if (result.errorResponse) return;
    expect(result.context.organizationId).toBe(ORG_A);
  });

  it("authorizes executive dashboard routes with intelligence read permission", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.Executive));

    const request = new Request("http://localhost/api/procurement/executive/dashboard", {
      method: "GET",
    });
    const result = await getProcurementApiContextForRequest(request);

    expect(result.errorResponse).toBeNull();
    if (result.errorResponse) return;
    expect(result.context.role).toBe(SystemRole.Executive);
    expect(PROCUREMENT_PERMISSIONS.intelligenceRead).toBe("procurement:intelligence:read");
  });

  it("wires vendor routes through fail-closed guards", async () => {
    process.env.ORION_AUTH_FAIL_CLOSED = "true";
    vi.mocked(getServerSession).mockResolvedValue({ session: null, profile: null });

    const response = await getVendors(new Request("http://localhost/api/procurement/vendors"));
    expect(response.status).toBe(401);
  });

  it("allows vendor creation for authorized administrators via route handler", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.OrganizationAdmin));

    const response = await createVendor(
      new Request("http://localhost/api/procurement/vendors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vendorCode: `API-VND-${Date.now()}`,
          displayName: "API Vendor",
        }),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.displayName).toBe("API Vendor");
  });

  it("returns executive dashboard through ProcurementFacade", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.Executive));

    const response = await getExecutiveDashboard(
      new Request("http://localhost/api/procurement/executive/dashboard"),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.domainStatus.readyForRbac).toBe(true);
  });

  it("resolves POST purchase order approve to approve permission", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.Manager));

    const request = new Request("http://localhost/api/procurement/purchase-orders/po-001/approve", {
      method: "POST",
    });
    const result = await getProcurementApiContextForRequest(request);

    expect(result.errorResponse).toBeNull();
    if (result.errorResponse) return;
    expect(result.context.role).toBe(SystemRole.Manager);
  });
});

import fs from "fs";
import path from "path";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { crmFacade } from "@/lib/crm";
import { CRM_PERMISSIONS } from "@/lib/crm/security/crm-permission-catalog";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { UserStatus } from "@/types/auth";
import { SystemRole } from "@/lib/auth/roles";

vi.mock("@/lib/identity/server-session", () => ({
  getServerSession: vi.fn(),
}));

import { getServerSession } from "@/lib/identity/server-session";
import { GET as getLeads, POST as createLead } from "@/app/api/crm/leads/route";

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
        modules: ["crm"],
      },
    },
    profile: null,
  };
}

describe("CRM API Authorization Convergence (P-008.13)", () => {
  beforeEach(() => {
    vi.mocked(getServerSession).mockReset();
  });

  afterEach(() => {
    delete process.env.ORION_AUTH_FAIL_CLOSED;
  });

  it("reports CRM API routes as RBAC-ready", () => {
    expect(crmFacade.getDomainStatus().readyForRbac).toBe(true);
  });

  it("converges all CRM REST routes onto getCrmApiContextForRequest", () => {
    const routesRoot = path.join(process.cwd(), "app/api/crm");
    const routeFiles = walkRouteFiles(routesRoot);

    expect(routeFiles.length).toBe(47);

    for (const file of routeFiles) {
      const source = fs.readFileSync(file, "utf8");
      expect(source, path.relative(process.cwd(), file)).toContain("getCrmApiContextForRequest");
      expect(source, path.relative(process.cwd(), file)).not.toContain("getDecisionServiceContext");
    }
  });

  it("returns 401 for unauthenticated CRM API requests when fail-closed is enabled", async () => {
    process.env.ORION_AUTH_FAIL_CLOSED = "true";
    vi.mocked(getServerSession).mockResolvedValue({ session: null, profile: null });

    const request = new Request("http://localhost/api/crm/leads", { method: "GET" });
    const result = await getCrmApiContextForRequest(request);

    expect(result.errorResponse).not.toBeNull();
    expect(result.errorResponse?.status).toBe(401);
  });

  it("returns 403 for authenticated users without explicit CRM grants", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.ReadOnly));

    const request = new Request("http://localhost/api/crm/leads", { method: "POST" });
    const result = await getCrmApiContextForRequest(request);

    expect(result.errorResponse).not.toBeNull();
    expect(result.errorResponse?.status).toBe(403);
  });

  it("returns 403 for unknown mutating CRM routes", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.Executive));

    const request = new Request("http://localhost/api/crm/unknown/action", { method: "POST" });
    const result = await getCrmApiContextForRequest(request);

    expect(result.errorResponse).not.toBeNull();
    expect(result.errorResponse?.status).toBe(403);
  });

  it("authorizes read routes with lead read permission for sales executives", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.Staff));

    const request = new Request("http://localhost/api/crm/leads", { method: "GET" });
    const result = await getCrmApiContextForRequest(request);

    expect(result.errorResponse).toBeNull();
    if (result.errorResponse) return;
    expect(result.context.organizationId).toBe(ORG_A);
  });

  it("authorizes intelligence routes with intelligence read permission", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.Executive));

    const request = new Request("http://localhost/api/crm/intelligence/dashboard", { method: "GET" });
    const result = await getCrmApiContextForRequest(request);

    expect(result.errorResponse).toBeNull();
    if (result.errorResponse) return;
    expect(result.context.role).toBe(SystemRole.Executive);
  });

  it("wires CRM lead routes through fail-closed guards", async () => {
    process.env.ORION_AUTH_FAIL_CLOSED = "true";
    vi.mocked(getServerSession).mockResolvedValue({ session: null, profile: null });

    const response = await getLeads(new Request("http://localhost/api/crm/leads"));
    expect(response.status).toBe(401);
  });

  it("allows lead creation for authorized sales executives via route handler", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.Staff));

    const response = await createLead(
      new Request("http://localhost/api/crm/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: "Acme Prospect",
          source: "web",
          owner: "user-staff",
        }),
      }),
    );

    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data.displayName).toBe("Acme Prospect");
  });

  it("resolves POST lead convert to qualify permission", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.Manager));

    const request = new Request("http://localhost/api/crm/leads/convert", { method: "POST" });
    const result = await getCrmApiContextForRequest(request);

    expect(result.errorResponse).toBeNull();
    if (result.errorResponse) return;
    expect(result.context.role).toBe(SystemRole.Manager);
  });

  it("maps audit-compatible read permissions for executive reporting routes", async () => {
    vi.mocked(getServerSession).mockResolvedValue(sessionFor(SystemRole.Executive));

    const request = new Request("http://localhost/api/crm/executive/reports", { method: "GET" });
    const result = await getCrmApiContextForRequest(request);

    expect(result.errorResponse).toBeNull();
    expect(CRM_PERMISSIONS.intelligenceRead).toBe("crm:intelligence:read");
  });
});

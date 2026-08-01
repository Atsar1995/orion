import { describe, expect, it, vi } from "vitest";
import { HcmFacade, hcmFacade } from "@/lib/hcm";
import {
  hcmError,
  hcmOk,
  hcmPaginated,
  resolveHcmErrorStatus,
  resolvePagination,
} from "@/lib/hcm/api";
import type { ServiceContext } from "@/types/services";

vi.mock("@/lib/hcm/api/hcm-api-context", () => ({
  getHcmApiContext: vi.fn(async () => ({
    context: {
      organizationId: "org-orania",
      workspaceId: "workspace-orania",
      userId: "user-executive",
      role: "executive",
    } satisfies ServiceContext,
    executiveName: "Executive",
  })),
}));

import { GET as getAttendance } from "@/app/api/hcm/attendance/route";
import { POST as createEmployee } from "@/app/api/hcm/employees/route";
import { GET as getEmployeeById } from "@/app/api/hcm/employees/[id]/route";
import { GET as getOrgUnits, POST as createOrgUnit } from "@/app/api/hcm/organization/units/route";

const CONTEXT_A: ServiceContext = {
  organizationId: "org-hcm-api-a",
  workspaceId: "ws-a",
  userId: "user-a",
  role: "executive",
};

const CONTEXT_B: ServiceContext = {
  organizationId: "org-hcm-api-b",
  workspaceId: "ws-b",
  userId: "user-b",
  role: "executive",
};

const FOUNDATION_ROUTES = [
  "GET /api/hcm/organization/units",
  "POST /api/hcm/organization/units",
  "PATCH /api/hcm/organization/units/[id]",
  "POST /api/hcm/organization/units/[id]/deactivate",
  "GET /api/hcm/organization/positions",
  "POST /api/hcm/organization/positions",
  "PATCH /api/hcm/organization/positions/[id]",
  "GET /api/hcm/organization/hierarchy",
  "POST /api/hcm/organization/hierarchy",
  "GET /api/hcm/employees",
  "POST /api/hcm/employees",
  "GET /api/hcm/employees/[id]",
  "PATCH /api/hcm/employees/[id]",
  "POST /api/hcm/employees/[id]/activate",
  "POST /api/hcm/employees/[id]/suspend",
  "GET /api/hcm/employment",
  "POST /api/hcm/employment",
  "GET /api/hcm/employment/[id]",
  "POST /api/hcm/employment/transfer",
  "POST /api/hcm/employment/promote",
  "POST /api/hcm/employment/terminate",
  "POST /api/hcm/employment/rehire",
  "POST /api/hcm/recruitment/candidates",
  "GET /api/hcm/recruitment/candidates/[id]",
  "POST /api/hcm/recruitment/applications",
  "POST /api/hcm/recruitment/applications/[id]/submit",
  "POST /api/hcm/recruitment/applications/[id]/advance",
  "POST /api/hcm/recruitment/applications/[id]/interview",
  "POST /api/hcm/recruitment/offers",
  "POST /api/hcm/recruitment/offers/[id]/hire",
  "GET /api/hcm/onboarding",
  "POST /api/hcm/onboarding",
  "GET /api/hcm/onboarding/[id]/readiness",
  "POST /api/hcm/onboarding/documents",
  "POST /api/hcm/onboarding/documents/verify",
  "POST /api/hcm/onboarding/tasks",
  "POST /api/hcm/onboarding/provisioning",
] as const;

const TIME_ROUTES = [
  "GET /api/hcm/attendance",
  "POST /api/hcm/attendance",
  "POST /api/hcm/attendance/correct",
  "GET /api/hcm/leave",
  "POST /api/hcm/leave",
  "POST /api/hcm/leave/actions",
  "GET /api/hcm/leave/balance",
  "GET /api/hcm/roster",
  "POST /api/hcm/roster",
  "POST /api/hcm/roster/publish",
  "GET /api/hcm/calendars",
] as const;

describe("HCM API Rationalization (S-002.7)", () => {
  it("reports foundation API routes as implemented", () => {
    expect(hcmFacade.getDomainStatus().foundationApiRoutesImplemented).toBe(true);
    expect(hcmFacade.getDomainStatus().timeApiRoutesImplemented).toBe(true);
  });

  it("catalogues foundation and time route inventory", () => {
    expect(FOUNDATION_ROUTES.length).toBe(37);
    expect(TIME_ROUTES.length).toBe(11);
    expect(FOUNDATION_ROUTES.length + TIME_ROUTES.length).toBe(48);
  });

  it("maps domain errors to consistent HTTP status codes", () => {
    expect(resolveHcmErrorStatus("EMPLOYEE_NOT_FOUND")).toBe(404);
    expect(resolveHcmErrorStatus("DUPLICATE_EMPLOYEE_NUMBER")).toBe(409);
    expect(resolveHcmErrorStatus("INVALID_EMPLOYEE_NUMBER")).toBe(400);
    expect(resolveHcmErrorStatus("CIRCULAR_HIERARCHY")).toBe(422);
    expect(resolveHcmErrorStatus("MISSING_PARAMS")).toBe(400);
  });

  it("builds standardized success and error envelopes", async () => {
    const success = hcmOk({ id: "test" });
    const successBody = await success.json();
    expect(successBody).toEqual({ success: true, data: { id: "test" } });

    const paginated = hcmPaginated([{ id: "1" }], { page: 1, pageSize: 50, total: 1 });
    const paginatedBody = await paginated.json();
    expect(paginatedBody.success).toBe(true);
    expect(paginatedBody.data.items).toHaveLength(1);
    expect(paginatedBody.data.pagination.total).toBe(1);

    const failure = hcmError("EMPLOYEE_NOT_FOUND", 404);
    const failureBody = await failure.json();
    expect(failureBody).toEqual({ success: false, error: "EMPLOYEE_NOT_FOUND" });
    expect(failure.status).toBe(404);
  });

  it("resolves pagination defaults", () => {
    expect(resolvePagination({}, 120)).toEqual({ page: 1, pageSize: 50, total: 120 });
    expect(resolvePagination({ page: 2, pageSize: 10 }, 25)).toEqual({
      page: 2,
      pageSize: 10,
      total: 25,
    });
  });

  it("isolates foundation inquiry data by organization", () => {
    const facade = new HcmFacade();

    const employeeA = facade.createEmployee(
      {
        employeeNumber: "ISO-A-001",
        identity: {
          legalName: { givenName: "Org", familyName: "Alpha" },
          governmentIdentifiers: [],
        },
        effectiveFrom: "2026-01-01",
      },
      CONTEXT_A,
    );

    facade.createEmployee(
      {
        employeeNumber: "ISO-B-001",
        identity: {
          legalName: { givenName: "Org", familyName: "Beta" },
          governmentIdentifiers: [],
        },
        effectiveFrom: "2026-01-01",
      },
      CONTEXT_B,
    );

    const resultsA = facade.searchEmployees({ employeeNumber: "ISO-A-001" }, CONTEXT_A);
    const resultsB = facade.searchEmployees({ employeeNumber: "ISO-A-001" }, CONTEXT_B);
    const crossLookup = facade.getEmployee(employeeA.id, CONTEXT_B);

    expect(resultsA).toHaveLength(1);
    expect(resultsA[0]?.organizationId).toBe(CONTEXT_A.organizationId);
    expect(resultsB).toHaveLength(0);
    expect(crossLookup).toBeNull();
  });

  it("returns paginated attendance responses through the route handler", async () => {
    const response = await getAttendance(new Request("http://localhost/api/hcm/attendance?page=1&pageSize=10"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data.items).toBeDefined();
    expect(body.data.pagination).toMatchObject({
      page: 1,
      pageSize: 10,
    });
    expect(typeof body.data.pagination.total).toBe("number");
  });

  it("returns paginated organization units through the route handler", async () => {
    await createOrgUnit(
      new Request("http://localhost/api/hcm/organization/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitType: "department",
          code: "API-ORG-001",
          name: "API Org Unit",
          effectiveFrom: "2026-01-01",
        }),
      }),
    );

    const response = await getOrgUnits(new Request("http://localhost/api/hcm/organization/units"));
    const body = await response.json();

    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.items)).toBe(true);
    expect(body.data.pagination.page).toBe(1);
  });

  it("creates and retrieves employees through route handlers", async () => {
    const createResponse = await createEmployee(
      new Request("http://localhost/api/hcm/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeNumber: `API-E-${Date.now()}`,
          identity: {
            legalName: { givenName: "Route", familyName: "Tester" },
            governmentIdentifiers: [],
          },
          effectiveFrom: "2026-01-01",
        }),
      }),
    );
    const created = await createResponse.json();

    expect(createResponse.status).toBe(201);
    expect(created.success).toBe(true);
    expect(created.data.id).toBeDefined();

    const getResponse = await getEmployeeById(
      new Request(`http://localhost/api/hcm/employees/${created.data.id}`),
      { params: Promise.resolve({ id: created.data.id }) },
    );
    const fetched = await getResponse.json();

    expect(getResponse.status).toBe(200);
    expect(fetched.data.id).toBe(created.data.id);
  });

  it("returns 404 for missing employees via standardized error envelope", async () => {
    const response = await getEmployeeById(
      new Request("http://localhost/api/hcm/employees/emp-missing"),
      { params: Promise.resolve({ id: "emp-missing" }) },
    );
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({ success: false, error: "EMPLOYEE_NOT_FOUND" });
  });

  it("paginates employee search through facade inquiry methods", () => {
    const facade = new HcmFacade();
    const suffix = Date.now();

    facade.createEmployee(
      {
        employeeNumber: `PG-A-${suffix}`,
        identity: {
          legalName: { givenName: "Page", familyName: "One" },
          governmentIdentifiers: [],
        },
        effectiveFrom: "2026-01-01",
      },
      CONTEXT_A,
    );
    facade.createEmployee(
      {
        employeeNumber: `PG-B-${suffix}`,
        identity: {
          legalName: { givenName: "Page", familyName: "Two" },
          governmentIdentifiers: [],
        },
        effectiveFrom: "2026-01-01",
      },
      CONTEXT_A,
    );

    const pageOne = facade.searchEmployees({ page: 1, pageSize: 1 }, CONTEXT_A);
    const total = facade.countEmployees({}, CONTEXT_A);

    expect(pageOne.length).toBeLessThanOrEqual(1);
    expect(total).toBeGreaterThanOrEqual(2);
  });
});

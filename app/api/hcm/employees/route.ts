import { hcmFacade } from "@/lib/hcm";
import {
  getHcmApiContext,
  hcmCreated,
  hcmFromError,
  hcmPaginated,
  parseOptionalString,
  parsePagination,
  resolvePagination,
} from "@/lib/hcm/api";
import type { CreateEmployeeInput, EmployeeSearchQuery, EmployeeStatus } from "@/types/hcm-employee";

export const dynamic = "force-dynamic";

function buildEmployeeQuery(url: URL): EmployeeSearchQuery {
  const pagination = parsePagination(url);
  return {
    employeeNumber: parseOptionalString(url, "employeeNumber"),
    name: parseOptionalString(url, "name"),
    email: parseOptionalString(url, "email"),
    departmentId: parseOptionalString(url, "departmentId"),
    businessUnitId: parseOptionalString(url, "businessUnitId"),
    organizationUnitId: parseOptionalString(url, "organizationUnitId"),
    status: parseOptionalString(url, "status") as EmployeeStatus | undefined,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
}

export async function GET(request: Request) {
  const { context } = await getHcmApiContext(request);
  const url = new URL(request.url);
  const query = buildEmployeeQuery(url);
  const items = hcmFacade.searchEmployees(query, context);
  const total = hcmFacade.countEmployees(query, context);
  const pagination = resolvePagination(parsePagination(url), total);

  return hcmPaginated(items, pagination);
}

export async function POST(request: Request) {
  const { context } = await getHcmApiContext(request);

  try {
    const body = (await request.json()) as CreateEmployeeInput;
    const employee = hcmFacade.createEmployee(body, context);
    return hcmCreated(employee);
  } catch (error) {
    return hcmFromError(error, "EMPLOYEE_CREATE_ERROR");
  }
}

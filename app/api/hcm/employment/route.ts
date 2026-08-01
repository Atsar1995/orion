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
import type {
  CreateEmploymentInput,
  EmploymentLifecycleStatus,
  EmploymentSearchQuery,
  EmploymentType,
} from "@/types/hcm-employment";

export const dynamic = "force-dynamic";

function buildEmploymentQuery(url: URL): EmploymentSearchQuery {
  const pagination = parsePagination(url);
  return {
    employmentNumber: parseOptionalString(url, "employmentNumber"),
    employeeId: parseOptionalString(url, "employeeId"),
    departmentId: parseOptionalString(url, "departmentId"),
    managerPositionId: parseOptionalString(url, "managerPositionId"),
    positionId: parseOptionalString(url, "positionId"),
    status: parseOptionalString(url, "status") as EmploymentLifecycleStatus | undefined,
    employmentType: parseOptionalString(url, "employmentType") as EmploymentType | undefined,
    legalEntityId: parseOptionalString(url, "legalEntityId"),
    page: pagination.page,
    pageSize: pagination.pageSize,
  };
}

export async function GET(request: Request) {
  const { context } = await getHcmApiContext();
  const url = new URL(request.url);
  const query = buildEmploymentQuery(url);
  const items = hcmFacade.searchEmployment(query, context);
  const total = hcmFacade.countEmployment(query, context);
  const pagination = resolvePagination(parsePagination(url), total);

  return hcmPaginated(items, pagination);
}

export async function POST(request: Request) {
  const { context } = await getHcmApiContext();

  try {
    const body = (await request.json()) as CreateEmploymentInput;
    const employment = hcmFacade.createEmployment(body, context);
    return hcmCreated(employment);
  } catch (error) {
    return hcmFromError(error, "EMPLOYMENT_CREATE_ERROR");
  }
}

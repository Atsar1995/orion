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
import type { CreateLeaveRequestInput, LeaveRequestStatus } from "@/types/hcm-time";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getHcmApiContext();
  const url = new URL(request.url);
  const pagination = parsePagination(url);

  const items = hcmFacade.leave.searchRequests(
    {
      employeeId: parseOptionalString(url, "employeeId"),
      leaveStatus: parseOptionalString(url, "status") as LeaveRequestStatus | undefined,
      dateFrom: parseOptionalString(url, "dateFrom"),
      dateTo: parseOptionalString(url, "dateTo"),
      page: pagination.page,
      pageSize: pagination.pageSize,
    },
    context,
  );

  return hcmPaginated(items, resolvePagination(pagination, items.length));
}

export async function POST(request: Request) {
  const { context } = await getHcmApiContext();

  try {
    const body = (await request.json()) as CreateLeaveRequestInput;
    const record = hcmFacade.leave.createRequest(body, context);
    return hcmCreated(record);
  } catch (error) {
    return hcmFromError(error, "LEAVE_ERROR");
  }
}

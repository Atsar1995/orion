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
import type { AttendanceStatus, RecordAttendanceInput } from "@/types/hcm-time";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getHcmApiContext(request);
  const url = new URL(request.url);
  const pagination = parsePagination(url);

  const query = {
    employeeId: parseOptionalString(url, "employeeId"),
    departmentId: parseOptionalString(url, "departmentId"),
    dateFrom: parseOptionalString(url, "dateFrom"),
    dateTo: parseOptionalString(url, "dateTo"),
    shiftId: parseOptionalString(url, "shiftId"),
    attendanceStatus: parseOptionalString(url, "status") as AttendanceStatus | undefined,
    page: pagination.page,
    pageSize: pagination.pageSize,
  };

  const items = hcmFacade.attendance.search(query, context);
  const total = hcmFacade.attendance.count(
    {
      employeeId: query.employeeId,
      departmentId: query.departmentId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
    },
    context,
  );

  return hcmPaginated(items, resolvePagination(pagination, total));
}

export async function POST(request: Request) {
  const { context } = await getHcmApiContext(request);

  try {
    const body = (await request.json()) as RecordAttendanceInput;
    const record = hcmFacade.attendance.record(body, context);
    return hcmCreated(record);
  } catch (error) {
    return hcmFromError(error, "ATTENDANCE_ERROR");
  }
}

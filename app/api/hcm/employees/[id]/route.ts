import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmError, hcmFromError, hcmOk } from "@/lib/hcm/api";
import type { UpdateEmployeeInput } from "@/types/hcm-employee";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getHcmApiContext(_request);
  const employee = hcmFacade.getEmployee(id, context);

  if (!employee) {
    return hcmError("EMPLOYEE_NOT_FOUND", 404);
  }

  return hcmOk(employee);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getHcmApiContext(request);

  try {
    const body = (await request.json()) as Omit<UpdateEmployeeInput, "employeeId">;
    const employee = hcmFacade.updateEmployee({ ...body, employeeId: id }, context);
    return hcmOk(employee);
  } catch (error) {
    return hcmFromError(error, "EMPLOYEE_UPDATE_ERROR");
  }
}

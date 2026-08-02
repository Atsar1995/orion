import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getHcmApiContext(_request);

  try {
    const employee = hcmFacade.suspendEmployee(id, context);
    return hcmOk(employee);
  } catch (error) {
    return hcmFromError(error, "EMPLOYEE_SUSPEND_ERROR");
  }
}

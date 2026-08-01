import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmError, hcmOk } from "@/lib/hcm/api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getHcmApiContext();
  const url = new URL(request.url);
  const employeeId = url.searchParams.get("employeeId");
  const leaveType = url.searchParams.get("leaveType");

  if (!employeeId || !leaveType) {
    return hcmError("MISSING_PARAMS", 400);
  }

  const balance = hcmFacade.leave.getBalance(employeeId, leaveType, context);
  const policies = hcmFacade.leave.listPolicies(context);

  return hcmOk({ balance, policies });
}

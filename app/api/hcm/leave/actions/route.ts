import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";

export const dynamic = "force-dynamic";

type ActionBody = {
  readonly action: "approve" | "reject" | "cancel";
  readonly requestId: string;
  readonly approverId?: string;
};

export async function POST(request: Request) {
  const { context } = await getHcmApiContext(request);
  const body = (await request.json()) as ActionBody;

  try {
    let record;
    if (body.action === "approve") {
      record = hcmFacade.leave.approve(body.requestId, context, body.approverId);
    } else if (body.action === "reject") {
      record = hcmFacade.leave.reject(body.requestId, context, body.approverId);
    } else {
      record = hcmFacade.leave.cancel(body.requestId, context);
    }
    return hcmOk(record);
  } catch (error) {
    return hcmFromError(error, "LEAVE_ACTION_ERROR");
  }
}

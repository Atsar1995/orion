import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getHcmApiContext();

  try {
    const application = hcmFacade.scheduleInterview(id, context);
    return hcmOk(application);
  } catch (error) {
    return hcmFromError(error, "INTERVIEW_SCHEDULE_ERROR");
  }
}

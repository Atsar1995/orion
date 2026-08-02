import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getHcmApiContext(_request);

  try {
    const application = hcmFacade.advanceApplication(id, context);
    return hcmOk(application);
  } catch (error) {
    return hcmFromError(error, "APPLICATION_ADVANCE_ERROR");
  }
}

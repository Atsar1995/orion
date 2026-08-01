import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getHcmApiContext();

  try {
    const offer = hcmFacade.hireCandidate(id, context);
    return hcmOk(offer);
  } catch (error) {
    return hcmFromError(error, "CANDIDATE_HIRE_ERROR");
  }
}

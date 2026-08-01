import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmError, hcmOk } from "@/lib/hcm/api";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getHcmApiContext();
  const candidate = hcmFacade.getCandidate(id, context);

  if (!candidate) {
    return hcmError("CANDIDATE_NOT_FOUND", 404);
  }

  return hcmOk(candidate);
}

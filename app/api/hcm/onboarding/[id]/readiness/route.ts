import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmOk } from "@/lib/hcm/api";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getHcmApiContext();
  const ready = hcmFacade.determineActivationReadiness(id, context);

  return hcmOk({ processId: id, ready });
}

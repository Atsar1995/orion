import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";
import type { CreatePositionInput } from "@/types/hcm-organization";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getHcmApiContext();

  try {
    const body = (await request.json()) as Partial<CreatePositionInput>;
    const position = hcmFacade.updatePosition(id, body, context);
    return hcmOk(position);
  } catch (error) {
    return hcmFromError(error, "POSITION_UPDATE_ERROR");
  }
}

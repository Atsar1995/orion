import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmFromError, hcmOk } from "@/lib/hcm/api";
import type { CreateOrgUnitInput } from "@/types/hcm-organization";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getHcmApiContext();

  try {
    const body = (await request.json()) as Partial<CreateOrgUnitInput>;
    const unit = hcmFacade.updateOrgUnit(id, body, context);
    return hcmOk(unit);
  } catch (error) {
    return hcmFromError(error, "ORG_UNIT_UPDATE_ERROR");
  }
}

import { hcmFacade } from "@/lib/hcm";
import { getHcmApiContext, hcmError, hcmOk } from "@/lib/hcm/api";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { context } = await getHcmApiContext(_request);
  const employment = hcmFacade.getEmployment(id, context);

  if (!employment) {
    return hcmError("EMPLOYMENT_NOT_FOUND", 404);
  }

  return hcmOk(employment);
}

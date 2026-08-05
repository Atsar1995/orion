import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementVendorScorecardService } from "@/lib/procurement";
import { procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { UpdateVendorScorecardInput } from "@/lib/procurement/types/supplier";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; scorecardId: string }> },
) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id, scorecardId } = await params;
    const body = (await request.json()) as UpdateVendorScorecardInput;
    const data = procurementVendorScorecardService.updateScorecard(id, scorecardId, body, auth.context);
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

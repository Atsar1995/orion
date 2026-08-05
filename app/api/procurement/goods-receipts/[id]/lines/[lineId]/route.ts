import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementReceivingLineService } from "@/lib/procurement";
import { procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { UpdateReceivingLineInput } from "@/lib/procurement/types/goods-receipt";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; lineId: string }> },
) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id, lineId } = await params;
    const body = (await request.json()) as UpdateReceivingLineInput;
    const data = procurementReceivingLineService.updateLine(id, lineId, body, auth.context);
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementRequisitionService } from "@/lib/procurement";
import { procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { UpdateRequisitionInput } from "@/lib/procurement/types/requisition";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const data = procurementRequisitionService.getRequisition(id, auth.context);
    if (!data) {
      return procurementFromError(new Error("REQUISITION_NOT_FOUND"));
    }
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const body = (await request.json()) as UpdateRequisitionInput;
    const data = procurementRequisitionService.updateRequisition(id, body, auth.context);
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

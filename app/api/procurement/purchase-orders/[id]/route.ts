import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementPurchaseOrderService } from "@/lib/procurement";
import { procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { AmendPurchaseOrderInput, UpdatePurchaseOrderInput } from "@/lib/procurement/types/purchase-order";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const data = procurementPurchaseOrderService.getPurchaseOrder(id, auth.context);
    if (!data) {
      return procurementFromError(new Error("PURCHASE_ORDER_NOT_FOUND"));
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
    const body = (await request.json()) as (UpdatePurchaseOrderInput | AmendPurchaseOrderInput) & {
      action?: "amend";
    };

    const data =
      body.action === "amend"
        ? procurementPurchaseOrderService.amendPurchaseOrder(id, body, auth.context)
        : procurementPurchaseOrderService.updatePurchaseOrder(id, body, auth.context);

    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

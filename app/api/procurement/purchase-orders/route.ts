import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementPurchaseOrderService } from "@/lib/procurement";
import { procurementCreated, procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { CreatePurchaseOrderInput, PurchaseOrderListFilter } from "@/lib/procurement/types/purchase-order";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const url = new URL(request.url);
    const filter: PurchaseOrderListFilter = {
      status: (url.searchParams.get("status") as PurchaseOrderListFilter["status"]) ?? undefined,
      vendorId: url.searchParams.get("vendorId") ?? undefined,
      query: url.searchParams.get("query") ?? undefined,
    };
    const data = procurementPurchaseOrderService.listPurchaseOrders(auth.context, filter);
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

export async function POST(request: Request) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await request.json()) as CreatePurchaseOrderInput;
    const data = procurementPurchaseOrderService.createPurchaseOrder(body, auth.context);
    return procurementCreated(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

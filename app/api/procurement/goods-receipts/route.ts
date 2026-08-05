import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementGoodsReceiptService } from "@/lib/procurement";
import { procurementCreated, procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { CreateGoodsReceiptInput, GoodsReceiptListFilter } from "@/lib/procurement/types/goods-receipt";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const url = new URL(request.url);
    const filter: GoodsReceiptListFilter = {
      status: (url.searchParams.get("status") as GoodsReceiptListFilter["status"]) ?? undefined,
      purchaseOrderId: url.searchParams.get("purchaseOrderId") ?? undefined,
      query: url.searchParams.get("query") ?? undefined,
    };
    const data = procurementGoodsReceiptService.listGoodsReceipts(auth.context, filter);
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

export async function POST(request: Request) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await request.json()) as CreateGoodsReceiptInput;
    const data = procurementGoodsReceiptService.createGoodsReceipt(body, auth.context);
    return procurementCreated(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

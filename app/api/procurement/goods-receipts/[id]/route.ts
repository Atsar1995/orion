import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementGoodsReceiptService } from "@/lib/procurement";
import { procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { UpdateGoodsReceiptInput } from "@/lib/procurement/types/goods-receipt";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const data = procurementGoodsReceiptService.getGoodsReceipt(id, auth.context);
    if (!data) {
      return procurementFromError(new Error("GOODS_RECEIPT_NOT_FOUND"));
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
    const body = (await request.json()) as UpdateGoodsReceiptInput;
    const data = procurementGoodsReceiptService.updateGoodsReceipt(id, body, auth.context);
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

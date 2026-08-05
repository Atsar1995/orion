import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementGoodsReceiptService } from "@/lib/procurement";
import { procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { ReceiveItemsInput } from "@/lib/procurement/types/goods-receipt";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const body = (await request.json()) as ReceiveItemsInput;
    const data = procurementGoodsReceiptService.partialReceipt(id, body, auth.context);
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementPurchaseContractService } from "@/lib/procurement";
import { procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { UpdatePurchaseContractInput } from "@/lib/procurement/types/purchase-order";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const data = procurementPurchaseContractService.getContract(id, auth.context);
    if (!data) {
      return procurementFromError(new Error("CONTRACT_NOT_FOUND"));
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
    const body = (await request.json()) as UpdatePurchaseContractInput;
    const data = procurementPurchaseContractService.updateContract(id, body, auth.context);
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

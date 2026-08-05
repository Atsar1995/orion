import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementPurchaseContractService } from "@/lib/procurement";
import { procurementCreated, procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { CreatePurchaseContractInput } from "@/lib/procurement/types/purchase-order";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await request.json()) as CreatePurchaseContractInput;
    const data = procurementPurchaseContractService.createContract(body, auth.context);
    return procurementCreated(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

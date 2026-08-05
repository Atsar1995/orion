import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementRequisitionService } from "@/lib/procurement";
import { procurementCreated, procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { CreateRequisitionInput, RequisitionListFilter } from "@/lib/procurement/types/requisition";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const url = new URL(request.url);
    const filter: RequisitionListFilter = {
      status: (url.searchParams.get("status") as RequisitionListFilter["status"]) ?? undefined,
      query: url.searchParams.get("query") ?? undefined,
    };
    const data = procurementRequisitionService.listRequisitions(auth.context, filter);
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

export async function POST(request: Request) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await request.json()) as CreateRequisitionInput;
    const data = procurementRequisitionService.createRequisition(body, auth.context);
    return procurementCreated(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

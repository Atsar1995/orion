import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementSupplierService } from "@/lib/procurement";
import { procurementCreated, procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { CreateSupplierInput, SupplierListFilter } from "@/lib/procurement/types/supplier";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const url = new URL(request.url);
    const filter: SupplierListFilter = {
      status: (url.searchParams.get("status") as SupplierListFilter["status"]) ?? undefined,
      query: url.searchParams.get("query") ?? undefined,
    };
    const data = procurementSupplierService.listSuppliers(auth.context, filter);
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

export async function POST(request: Request) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = (await request.json()) as CreateSupplierInput;
    const data = procurementSupplierService.createSupplier(body, auth.context);
    return procurementCreated(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

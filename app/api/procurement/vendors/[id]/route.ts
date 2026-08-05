import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementSupplierService } from "@/lib/procurement";
import { procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { UpdateSupplierInput } from "@/lib/procurement/types/supplier";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const data = procurementSupplierService.getSupplier(id, auth.context);
    if (!data) {
      return procurementFromError(new Error("VENDOR_NOT_FOUND"));
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
    const body = (await request.json()) as UpdateSupplierInput;
    const data = procurementSupplierService.updateSupplier(id, body, auth.context);
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

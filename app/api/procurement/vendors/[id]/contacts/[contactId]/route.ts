import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementVendorContactService } from "@/lib/procurement";
import { procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { UpdateVendorContactInput } from "@/lib/procurement/types/supplier";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; contactId: string }> },
) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id, contactId } = await params;
    const body = (await request.json()) as UpdateVendorContactInput;
    const data = procurementVendorContactService.updateContact(id, contactId, body, auth.context);
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

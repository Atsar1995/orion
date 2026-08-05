import { getProcurementApiContextForRequest } from "@/lib/procurement";
import { procurementVendorContactService } from "@/lib/procurement";
import { procurementCreated, procurementFromError, procurementOk } from "@/lib/procurement/api/procurementApiResponse";
import type { CreateVendorContactInput } from "@/lib/procurement/types/supplier";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const data = procurementVendorContactService.listContacts(id, auth.context);
    return procurementOk(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const body = (await request.json()) as CreateVendorContactInput;
    const data = procurementVendorContactService.createContact(id, body, auth.context);
    return procurementCreated(data);
  } catch (error) {
    return procurementFromError(error);
  }
}

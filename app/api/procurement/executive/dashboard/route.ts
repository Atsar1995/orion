import { getProcurementApiContextForRequest, procurementFacade } from "@/lib/procurement";
import { procurementOk } from "@/lib/procurement/api/procurementApiResponse";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await getProcurementApiContextForRequest(request);
  if (auth.errorResponse) return auth.errorResponse;

  const data = procurementFacade.getWorkspaceView(auth.context);
  return procurementOk({
    workspace: data,
    domainStatus: data.domainStatus,
  });
}

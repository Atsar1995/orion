import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmPartyService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? undefined;
  const kind = url.searchParams.get("kind") as "person" | "organisation" | null;
  const result = crmPartyService.search.search(
    {
      query,
      kind: kind ?? undefined,
    },
    context,
  );
  return NextResponse.json({ success: true, data: result });
}

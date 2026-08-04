import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmCustomerIntelligenceService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const crmAuth = await getCrmApiContextForRequest(_request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const profile = crmCustomerIntelligenceService.profiles.get(id, context);

  if (!profile) {
    return NextResponse.json({ success: false, error: "PROFILE_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: profile });
}

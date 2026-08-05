import { NextResponse } from "next/server";
import { crmRepository } from "@/lib/crm";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const snapshots = crmRepository.listDashboardSnapshots(context.organizationId);
  return NextResponse.json({ success: true, data: snapshots });
}

import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmCommercialIntelligenceService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const dashboard = crmCommercialIntelligenceService.executive.getExecutiveDashboard(context);
  return NextResponse.json({
    success: true,
    data: {
      benchmarks: dashboard.benchmarks,
      analytics: crmCommercialIntelligenceService.analytics.getAnalytics(context),
    },
  });
}

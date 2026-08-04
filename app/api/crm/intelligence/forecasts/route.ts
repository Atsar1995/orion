import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmCommercialIntelligenceService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const forecasts = crmCommercialIntelligenceService.forecasts.getForecasts(context);
  const history = crmCommercialIntelligenceService.forecasts.getHistory(context);
  return NextResponse.json({ success: true, data: { forecasts, history } });
}

export async function POST(request: Request) {
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context, executiveName } = crmAuth;
  const forecasts = crmCommercialIntelligenceService.forecasts.runForecast(context, executiveName);
  return NextResponse.json({ success: true, data: forecasts }, { status: 201 });
}

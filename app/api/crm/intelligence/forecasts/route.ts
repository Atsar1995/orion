import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmCommercialIntelligenceService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const forecasts = crmCommercialIntelligenceService.forecasts.getForecasts(context);
  const history = crmCommercialIntelligenceService.forecasts.getHistory(context);
  return NextResponse.json({ success: true, data: { forecasts, history } });
}

export async function POST() {
  const { context, executiveName } = await getDecisionServiceContext();
  const forecasts = crmCommercialIntelligenceService.forecasts.runForecast(context, executiveName);
  return NextResponse.json({ success: true, data: forecasts }, { status: 201 });
}

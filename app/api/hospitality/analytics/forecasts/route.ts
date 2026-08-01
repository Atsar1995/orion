import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { DEFAULT_PROPERTY_ID, hospitalityAnalyticsService } from "@/lib/hospitality";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;
  const propertyId = params.get("propertyId") ?? DEFAULT_PROPERTY_ID;

  return NextResponse.json({
    success: true,
    data: {
      forecasts: hospitalityAnalyticsService.forecasts.getForecasts(context, propertyId),
      trends: hospitalityAnalyticsService.trends.getTrends(),
    },
  });
}

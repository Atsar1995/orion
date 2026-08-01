import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const service = getIntelligenceIntegrationService();
  const health = service.getHealth(context);
  const services = service.serviceRegistry.list();

  return NextResponse.json({ success: true, data: { health, services } });
}

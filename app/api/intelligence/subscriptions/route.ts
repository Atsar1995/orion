import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { CreateIntelligenceSubscriptionInput } from "@/types/intelligence-integration";

export const dynamic = "force-dynamic";

export async function GET() {
  const service = getIntelligenceIntegrationService();
  const subscriptions = service.subscriptionManager.list();

  return NextResponse.json({ success: true, data: { subscriptions } });
}

export async function POST(request: Request) {
  await getDecisionServiceContext();
  const body = (await request.json()) as CreateIntelligenceSubscriptionInput;

  const service = getIntelligenceIntegrationService();
  const subscription = service.subscribe(body, async () => {
    /* API-managed subscriptions are observability-only in v1 */
  });

  return NextResponse.json({ success: true, data: { subscription } }, { status: 201 });
}

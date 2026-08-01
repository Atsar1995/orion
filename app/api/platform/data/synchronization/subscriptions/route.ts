import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { subscriptionService } from "@/lib/platform/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const subscriptions = subscriptionService.listSubscriptions(context);
  return NextResponse.json({ success: true, data: subscriptions });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as import("@/types/enterprise-data-synchronization").RegisterSubscriptionInput;

  try {
    const subscription = subscriptionService.registerSubscription(body, context);
    return NextResponse.json({ success: true, data: subscription }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ success: false, error: code }, { status: 400 });
  }
}

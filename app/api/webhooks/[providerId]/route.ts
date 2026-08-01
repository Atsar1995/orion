import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishIntelligenceEventInput } from "@/types/intelligence-integration";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ providerId: string }> };

export async function POST(request: Request, { params }: RouteParams) {
  const { context } = await getDecisionServiceContext();
  const { providerId } = await params;
  const payloadText = await request.text();
  const signature = request.headers.get("x-orion-signature") ?? "";

  const service = getIntelligenceIntegrationService();
  const subscriptions = service.webhookGateway.list(context.organizationId).filter(
    (entry) => entry.providerId === providerId,
  );

  const subscription = subscriptions[0];

  if (!subscription) {
    return NextResponse.json({ success: false, error: { message: "Webhook not registered." } }, { status: 404 });
  }

  if (!service.webhookGateway.verifyInboundSignature(payloadText, signature, subscription.secret)) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED_PUBLISHER", message: "Invalid webhook signature." } },
      { status: 403 },
    );
  }

  try {
    const body = JSON.parse(payloadText) as PublishIntelligenceEventInput;
    const event = service.publish(
      {
        ...body,
        sourceService: body.sourceService || providerId,
      },
      {
        ...context,
        userId: body.actorId || context.userId,
      },
    );

    return NextResponse.json({ success: true, data: { event } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_EVENT") {
      return NextResponse.json(
        { success: false, error: { code: "DUPLICATE_EVENT", message: "Duplicate event." } },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: false, error: { message: "Invalid webhook payload." } }, { status: 400 });
  }
}

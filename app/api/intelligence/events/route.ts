import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { getIntelligenceIntegrationService } from "@/lib/platform/intelligence";
import type { PublishIntelligenceEventInput } from "@/types/intelligence-integration";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const service = getIntelligenceIntegrationService();
  const params = new URL(request.url).searchParams;
  const limit = Number(params.get("limit") ?? "50");

  const events = service.listEvents(context, Number.isFinite(limit) ? limit : 50);

  return NextResponse.json({ success: true, data: { events } });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();

  try {
    const body = (await request.json()) as PublishIntelligenceEventInput;
    const service = getIntelligenceIntegrationService();
    const event = service.publish(body, context);

    return NextResponse.json({ success: true, data: { event } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED_PUBLISHER") {
        return NextResponse.json(
          { success: false, error: { code: "UNAUTHORIZED_PUBLISHER", message: "Unauthorized publisher." } },
          { status: 403 },
        );
      }

      if (error.message === "DUPLICATE_EVENT") {
        return NextResponse.json(
          { success: false, error: { code: "DUPLICATE_EVENT", message: "Duplicate event." } },
          { status: 409 },
        );
      }

      if (error.message === "INVALID_PAYLOAD") {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_PAYLOAD", message: "Invalid event payload." } },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ success: false, error: { message: "Invalid request." } }, { status: 400 });
  }
}

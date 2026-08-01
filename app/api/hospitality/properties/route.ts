import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityInventoryService, publishInventoryEvent } from "@/lib/hospitality";
import type { CreatePropertyInput } from "@/types/hospitality-inventory";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const properties = hospitalityInventoryService.properties.listProperties(context);
  const portfolio = hospitalityInventoryService.properties.getPortfolio(context);

  return NextResponse.json({ success: true, data: { properties, portfolio } });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as CreatePropertyInput;

  try {
    const property = hospitalityInventoryService.properties.createProperty(body, context);
    publishInventoryEvent(
      { eventType: "PropertyUpdated", entityId: property.id, actorId: context.userId, actorName: executiveName },
      context,
    );
    return NextResponse.json({ success: true, data: { property } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_FAILED";
    const status = message === "DUPLICATE_PROPERTY" ? 409 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityInventoryService, publishInventoryEvent } from "@/lib/hospitality";
import type { CreateInventoryItemInput } from "@/types/hospitality-inventory";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;
  const propertyId = params.get("propertyId") ?? undefined;
  const items = hospitalityInventoryService.inventory.listInventory(propertyId, context);

  return NextResponse.json({ success: true, data: { items } });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as CreateInventoryItemInput;

  try {
    const item = hospitalityInventoryService.inventory.createInventoryItem(body, context);
    publishInventoryEvent(
      { eventType: "InventoryUpdated", entityId: item.id, actorId: context.userId, actorName: executiveName },
      context,
    );
    return NextResponse.json({ success: true, data: { item } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_FAILED";
    const status =
      message === "DUPLICATE_ROOM_NUMBER" ? 409 : message === "INVALID_CAPACITY" ? 422 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

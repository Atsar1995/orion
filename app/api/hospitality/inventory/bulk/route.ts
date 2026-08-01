import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityInventoryService, publishInventoryEvent } from "@/lib/hospitality";
import type { BulkInventoryOperation } from "@/types/hospitality-inventory";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as BulkInventoryOperation;

  try {
    const result = hospitalityInventoryService.inventory.executeBulkOperation(body, context);
    if (body.action === "update_status") {
      for (const id of body.ids) {
        publishInventoryEvent(
          {
            eventType: "InventoryStatusChanged",
            entityId: id,
            actorId: context.userId,
            actorName: executiveName,
            payload: { status: body.status },
          },
          context,
        );
      }
    }
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "BULK_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

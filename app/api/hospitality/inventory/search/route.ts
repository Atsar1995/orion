import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityInventoryService } from "@/lib/hospitality";
import type { InventorySearchFilter } from "@/types/hospitality-inventory";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;

  const filter: InventorySearchFilter = {
    propertyId: params.get("propertyId") ?? undefined,
    kind: (params.get("kind") as InventorySearchFilter["kind"]) ?? undefined,
    status: (params.get("status") as InventorySearchFilter["status"]) ?? undefined,
    zoneId: params.get("zoneId") ?? undefined,
    buildingId: params.get("buildingId") ?? undefined,
    query: params.get("query") ?? undefined,
    accessibleOnly: params.get("accessibleOnly") === "true",
    availableOnly: params.get("availableOnly") === "true",
  };

  const items = hospitalityInventoryService.inventory.searchInventory(filter, context);
  return NextResponse.json({ success: true, data: { items } });
}

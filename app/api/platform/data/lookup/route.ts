import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { entityLookupService } from "@/lib/platform/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);
  const globalId = url.searchParams.get("globalId");
  const entityType = url.searchParams.get("entityType") as import("@/types/enterprise-data").CanonicalEntityType | null;
  const businessKey = url.searchParams.get("businessKey");

  if (globalId) {
    const entity = entityLookupService.getByGlobalId(globalId, context);
    return NextResponse.json({ success: true, data: entity });
  }

  if (entityType && businessKey) {
    const entity = entityLookupService.getByBusinessKey(entityType, businessKey, context);
    return NextResponse.json({ success: true, data: entity });
  }

  return NextResponse.json({ success: false, error: "INVALID_LOOKUP_PARAMS" }, { status: 400 });
}

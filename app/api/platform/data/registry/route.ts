import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { registryQueryService } from "@/lib/platform/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);
  const entityType = url.searchParams.get("entityType") as import("@/types/enterprise-data").CanonicalEntityType | null;

  if (entityType) {
    const registration = registryQueryService.getEntityType(entityType, context);
    return NextResponse.json({ success: true, data: registration });
  }

  const types = registryQueryService.listEntityTypes({
    domainKey: url.searchParams.get("domainKey") ?? undefined,
    includeInactive: url.searchParams.get("includeInactive") === "true",
  });

  const stats = registryQueryService.getStats(context);
  return NextResponse.json({ success: true, data: { types, stats } });
}

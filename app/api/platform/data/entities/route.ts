import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { entityDiscoveryService, masterDataRegistryService } from "@/lib/platform/data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);

  const result = entityDiscoveryService.discover(context, {
    entityType: (url.searchParams.get("entityType") as import("@/types/enterprise-data").CanonicalEntityType) ?? undefined,
    domainKey: url.searchParams.get("domainKey") ?? undefined,
    status: (url.searchParams.get("status") as import("@/types/enterprise-data").MasterEntityStatus) ?? undefined,
    search: url.searchParams.get("search") ?? undefined,
    page: Number(url.searchParams.get("page") ?? 1),
    pageSize: Number(url.searchParams.get("pageSize") ?? 50),
  });

  return NextResponse.json({ success: true, data: result });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as import("@/types/enterprise-data").RegisterMasterEntityInput;

  try {
    const entity = masterDataRegistryService.register(body, context);
    return NextResponse.json({ success: true, data: entity }, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN_ERROR";
    return NextResponse.json({ success: false, error: code }, { status: 400 });
  }
}

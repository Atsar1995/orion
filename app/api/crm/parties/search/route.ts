import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmPartyService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const url = new URL(request.url);
  const query = url.searchParams.get("query") ?? undefined;
  const kind = url.searchParams.get("kind") as "person" | "organisation" | null;
  const result = crmPartyService.search.search(
    {
      query,
      kind: kind ?? undefined,
    },
    context,
  );
  return NextResponse.json({ success: true, data: result });
}

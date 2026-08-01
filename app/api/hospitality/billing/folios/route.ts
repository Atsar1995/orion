import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { DEFAULT_PROPERTY_ID, hospitalityBillingService } from "@/lib/hospitality";
import type { CreateFolioInput } from "@/types/hospitality-billing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;
  const propertyId = params.get("propertyId") ?? DEFAULT_PROPERTY_ID;

  const folios = hospitalityBillingService.folios.list(context, propertyId);
  return NextResponse.json({ success: true, data: folios });
}

export async function POST(request: Request) {
  const { context } = await getDecisionServiceContext();
  const body = (await request.json()) as CreateFolioInput;

  try {
    const folio = hospitalityBillingService.folios.create(
      { ...body, propertyId: body.propertyId ?? DEFAULT_PROPERTY_ID },
      context,
    );
    return NextResponse.json({ success: true, data: folio });
  } catch (error) {
    const message = error instanceof Error ? error.message : "FOLIO_CREATE_FAILED";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

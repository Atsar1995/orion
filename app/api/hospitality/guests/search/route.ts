import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityGuestService } from "@/lib/hospitality";
import type { GuestSearchFilter } from "@/types/hospitality-guest";
import type { LoyaltyTier } from "@/types/hospitality";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { context } = await getDecisionServiceContext();
  const params = new URL(request.url).searchParams;

  const filter: GuestSearchFilter = {
    query: params.get("query") ?? undefined,
    email: params.get("email") ?? undefined,
    phone: params.get("phone") ?? undefined,
    passport: params.get("passport") ?? undefined,
    loyaltyNumber: params.get("loyaltyNumber") ?? undefined,
    company: params.get("company") ?? undefined,
    reservationNumber: params.get("reservationNumber") ?? undefined,
    loyaltyTier: (params.get("loyaltyTier") as LoyaltyTier) ?? undefined,
    isVip: params.get("isVip") === "true" ? true : params.get("isVip") === "false" ? false : undefined,
    tag: params.get("tag") ?? undefined,
  };

  const result = hospitalityGuestService.guests.search(filter, context);
  return NextResponse.json({ success: true, data: result });
}

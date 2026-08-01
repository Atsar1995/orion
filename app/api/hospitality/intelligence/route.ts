import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityService } from "@/lib/hospitality";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const intelligence = hospitalityService.getIntelligence(context);
  const briefContribution = hospitalityService.getBriefContribution(context);

  return NextResponse.json({
    success: true,
    data: { intelligence, briefContribution },
  });
}

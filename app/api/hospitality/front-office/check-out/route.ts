import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { hospitalityFrontOfficeService } from "@/lib/hospitality";
import type { CheckOutInput } from "@/types/hospitality-front-office";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as CheckOutInput;

  try {
    const stay = hospitalityFrontOfficeService.checkOut.execute(body, context, executiveName);
    return NextResponse.json({ success: true, data: stay });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CHECK_OUT_FAILED";
    const status =
      message === "STAY_NOT_FOUND" ? 404 : message === "OUTSTANDING_BALANCE" ? 409 : message === "INVALID_STAY_STATUS" ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { delegationService } from "@/lib/platform/organization";
import type { CreateDelegationInput } from "@/types/organization";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
  const delegations = delegationService.list(context);

  return NextResponse.json({ success: true, data: { delegations } });
}

export async function POST(request: Request) {
  const { context, executiveName } = await getDecisionServiceContext();

  try {
    const body = (await request.json()) as CreateDelegationInput;
    const delegation = delegationService.create(body, context, executiveName);
    return NextResponse.json({ success: true, data: { delegation } }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "DELEGATE_NOT_FOUND") {
      return NextResponse.json(
        { success: false, error: { code: "DELEGATE_NOT_FOUND", message: "Delegate not found." } },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: false, error: { message: "Invalid request." } }, { status: 400 });
  }
}

import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { crmAgreementsService } from "@/lib/crm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { context } = await getDecisionServiceContext();
  const contract = crmAgreementsService.contracts.get(id, context);

  if (!contract) {
    return NextResponse.json({ success: false, error: "CONTRACT_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: contract });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { context, executiveName } = await getDecisionServiceContext();
  const body = (await request.json()) as {
    action?: "sign" | "amend" | "expire";
    changeSummary?: string;
  };

  try {
    if (body.action === "sign") {
      const contract = crmAgreementsService.contracts.sign(id, context, executiveName);
      return NextResponse.json({ success: true, data: contract });
    }
    if (body.action === "amend") {
      const contract = crmAgreementsService.contracts.createAmendment(
        id,
        body.changeSummary ?? "Amendment",
        context,
        executiveName,
      );
      return NextResponse.json({ success: true, data: contract });
    }
    if (body.action === "expire") {
      const contract = crmAgreementsService.contracts.markExpired(id, context);
      return NextResponse.json({ success: true, data: contract });
    }

    return NextResponse.json({ success: false, error: "INVALID_ACTION" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CONTRACT_UPDATE_FAILED";
    const status =
      message === "CONTRACT_NOT_FOUND" ? 404 : message === "CONTRACT_ALREADY_EXECUTED" ? 409 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

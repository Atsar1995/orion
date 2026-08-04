import { NextResponse } from "next/server";
import { getCrmApiContextForRequest } from "@/lib/crm/security/CrmPermissionGuards";
import { crmAgreementsService } from "@/lib/crm";
import type { AgreementLifecycleStatus } from "@/types/crm-agreements";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const crmAuth = await getCrmApiContextForRequest(_request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context } = crmAuth;
  const proposal = crmAgreementsService.proposals.get(id, context);

  if (!proposal) {
    return NextResponse.json({ success: false, error: "PROPOSAL_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: proposal });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const crmAuth = await getCrmApiContextForRequest(request);
  if (crmAuth.errorResponse) return crmAuth.errorResponse;
  const { context, executiveName } = crmAuth;
  const body = (await request.json()) as {
    action?: "transition" | "version";
    status?: AgreementLifecycleStatus;
    changeSummary?: string;
  };

  try {
    if (body.action === "version") {
      const proposal = crmAgreementsService.proposals.createVersion(
        id,
        body.changeSummary ?? "Revision",
        context,
        executiveName,
      );
      return NextResponse.json({ success: true, data: proposal });
    }

    if (body.status) {
      const proposal = crmAgreementsService.proposals.transition(id, body.status, context, executiveName);
      return NextResponse.json({ success: true, data: proposal });
    }

    return NextResponse.json({ success: false, error: "INVALID_ACTION" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PROPOSAL_UPDATE_FAILED";
    const status = message === "PROPOSAL_NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

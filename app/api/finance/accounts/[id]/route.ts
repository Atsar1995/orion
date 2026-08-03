import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeChartOfAccountsService } from "@/lib/finance";
import type { ModifyChartOfAccountInput } from "@/types/finance-chart-of-accounts";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const financeAuth = await getFinanceApiContextForRequest(_request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const { id } = await params;
  const account = financeChartOfAccountsService.accounts.getDetail(id, context);

  if (!account) {
    return NextResponse.json({ success: false, error: "ACCOUNT_NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: account });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const financeAuth = await getFinanceApiContextForRequest(request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const { id } = await params;
  const body = (await request.json()) as ModifyChartOfAccountInput;

  try {
    const account = financeChartOfAccountsService.accounts.update(id, body, context);
    return NextResponse.json({ success: true, data: account });
  } catch (error) {
    const message = error instanceof Error ? error.message : "COA_UPDATE_FAILED";
    const status =
      message === "ACCOUNT_NOT_FOUND"
        ? 404
        : message.includes("INVALID") || message.includes("CIRCULAR") || message.includes("ARCHIVE")
          ? 400
          : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

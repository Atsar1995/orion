import { NextResponse } from "next/server";
import { getFinanceApiContextForRequest } from "@/lib/finance/security/FinancePermissionGuards";
import { financeChartOfAccountsService } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const financeAuth = await getFinanceApiContextForRequest(request);
  if (financeAuth.errorResponse) return financeAuth.errorResponse;
  const { context } = financeAuth;
  const hierarchy = financeChartOfAccountsService.accounts.getHierarchy(context);
  const validation = financeChartOfAccountsService.accounts.validateHierarchy(context);

  return NextResponse.json({
    success: true,
    data: {
      hierarchy,
      validation,
    },
  });
}

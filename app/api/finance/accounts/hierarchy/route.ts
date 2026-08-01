import { NextResponse } from "next/server";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";
import { financeChartOfAccountsService } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const { context } = await getDecisionServiceContext();
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

import { FinanceAlerts } from "@/components/finance/FinanceAlerts";
import { FinanceCashFlowSummary } from "@/components/finance/FinanceCashFlowSummary";
import { FinanceEnhancedKpiCards } from "@/components/finance/FinanceEnhancedKpiCards";
import { FinanceExecutiveInsights } from "@/components/finance/FinanceExecutiveInsights";
import { FinanceExecutiveNotes } from "@/components/finance/FinanceExecutiveNotes";
import { FinanceExecutiveSummary } from "@/components/finance/FinanceExecutiveSummary";
import { FinanceExpenseBreakdown } from "@/components/finance/FinanceExpenseBreakdown";
import { FinanceHealthScore } from "@/components/finance/FinanceHealthScore";
import { FinancePayablesSnapshot } from "@/components/finance/FinancePayablesSnapshot";
import { FinanceReceivablesSnapshot } from "@/components/finance/FinanceReceivablesSnapshot";
import { FinanceRecentActivity } from "@/components/finance/FinanceRecentActivity";
import { FinanceRevenueTrendChart } from "@/components/finance/FinanceRevenueTrendChart";
import { WorkspacePageHeader } from "@/components/workspace/WorkspacePageHeader";
import { FOUNDER_NAME } from "@/lib/command-center-data";
import { WORKSPACE_GRID_2_COL, WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import {
  formatWorkspaceDateLabel,
  getWorkspaceGreetingPeriod,
} from "@/lib/workspace-format";

export default function FinanceOverviewPage() {
  return (
    <>
      <WorkspacePageHeader
        greetingPeriod={getWorkspaceGreetingPeriod()}
        executiveName={FOUNDER_NAME}
        title="Finance"
        dateLabel={formatWorkspaceDateLabel()}
      />

      <section aria-label="Finance Overview" className={WORKSPACE_SECTION_CLASS}>
        <FinanceExecutiveSummary />
        <FinanceHealthScore />
        <FinanceEnhancedKpiCards />
        <div className={WORKSPACE_GRID_2_COL}>
          <FinanceRevenueTrendChart />
          <FinanceExpenseBreakdown />
        </div>
        <FinanceCashFlowSummary />
        <div className={WORKSPACE_GRID_2_COL}>
          <FinanceExecutiveInsights />
          <FinanceAlerts />
        </div>
        <div className={WORKSPACE_GRID_2_COL}>
          <FinanceReceivablesSnapshot />
          <FinancePayablesSnapshot />
        </div>
        <FinanceRecentActivity />
        <FinanceExecutiveNotes />
      </section>
    </>
  );
}

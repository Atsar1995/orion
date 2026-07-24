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
import { FOUNDER_NAME } from "@/lib/command-center-data";
import {
  WORKSPACE_GREETING_CLASS,
  WORKSPACE_GRID_2_COL,
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_SECTION_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";

function getGreetingPeriod(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function FinanceOverviewPage() {
  return (
    <>
      <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
        <p className={WORKSPACE_GREETING_CLASS}>
          {getGreetingPeriod()}, {FOUNDER_NAME}
        </p>
        <h1 className={WORKSPACE_TITLE_CLASS}>Finance</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>{formatTodayDate()}</p>
      </header>

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

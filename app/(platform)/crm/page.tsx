import { CustomerAlerts } from "@/components/crm/CustomerAlerts";
import { CustomerHealthScore } from "@/components/crm/CustomerHealthScore";
import { CrmEnhancedKpiCards } from "@/components/crm/CrmEnhancedKpiCards";
import { CrmExecutiveInsights } from "@/components/crm/CrmExecutiveInsights";
import { CrmExecutiveNotes } from "@/components/crm/CrmExecutiveNotes";
import { CrmExecutiveSummary } from "@/components/crm/CrmExecutiveSummary";
import { CrmOpportunityPipeline } from "@/components/crm/CrmOpportunityPipeline";
import { CrmRecentActivity } from "@/components/crm/CrmRecentActivity";
import { RelationshipHealth } from "@/components/crm/RelationshipHealth";
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

export default function CustomerIntelligenceOverviewPage() {
  return (
    <>
      <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
        <p className={WORKSPACE_GREETING_CLASS}>
          {getGreetingPeriod()}, {FOUNDER_NAME}
        </p>
        <h1 className={WORKSPACE_TITLE_CLASS}>Customer Intelligence</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>{formatTodayDate()}</p>
      </header>

      <section
        aria-label="Customer Intelligence Overview"
        className={WORKSPACE_SECTION_CLASS}
      >
        <CrmExecutiveSummary />
        <CustomerHealthScore />
        <CrmEnhancedKpiCards />
        <CrmOpportunityPipeline />
        <RelationshipHealth />
        <div className={WORKSPACE_GRID_2_COL}>
          <CrmExecutiveInsights />
          <CustomerAlerts />
        </div>
        <CrmRecentActivity />
        <CrmExecutiveNotes />
      </section>
    </>
  );
}

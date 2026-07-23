import { BusinessHealth } from "@/components/advisor/BusinessHealth";
import { BusinessMemory } from "@/components/advisor/BusinessMemory";
import { BusinessSnapshot } from "@/components/advisor/BusinessSnapshot";
import { CriticalRisks } from "@/components/advisor/CriticalRisks";
import { CrossWorkspaceInsights } from "@/components/advisor/CrossWorkspaceInsights";
import { ExecutiveBrief } from "@/components/advisor/ExecutiveBrief";
import { OrionIntelligence } from "@/components/advisor/OrionIntelligence";
import { PriorityTimeline } from "@/components/advisor/PriorityTimeline";
import { QuickActions } from "@/components/advisor/QuickActions";
import { RecommendedDecisions } from "@/components/advisor/RecommendedDecisions";
import { TodaysFocus } from "@/components/advisor/TodaysFocus";
import { TopOpportunities } from "@/components/advisor/TopOpportunities";
import { FOUNDER_NAME } from "@/lib/command-center-data";
import {
  WORKSPACE_GREETING_CLASS,
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_PAGE_CLASS,
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

export default function OrionAdvisorPage() {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
        <p className={WORKSPACE_GREETING_CLASS}>
          {getGreetingPeriod()}, {FOUNDER_NAME}
        </p>
        <h1 className={WORKSPACE_TITLE_CLASS}>ORION Advisor</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>{formatTodayDate()}</p>
      </header>

      <section aria-label="ORION Advisor" className={WORKSPACE_SECTION_CLASS}>
        <BusinessHealth />
        <ExecutiveBrief />
        <BusinessSnapshot />
        <TopOpportunities />
        <CriticalRisks />
        <RecommendedDecisions />
        <OrionIntelligence />
        <CrossWorkspaceInsights />
        <BusinessMemory />
        <PriorityTimeline />
        <TodaysFocus />
        <QuickActions />
      </section>
    </div>
  );
}

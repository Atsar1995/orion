import { CampaignInsights } from "@/components/marketing/CampaignInsights";
import { ChannelPerformance } from "@/components/marketing/ChannelPerformance";
import { CriticalIssues } from "@/components/marketing/CriticalIssues";
import { ExecutiveBriefing } from "@/components/marketing/ExecutiveBriefing";
import { MarketingHealth } from "@/components/marketing/MarketingHealth";
import { MarketingSummary } from "@/components/marketing/MarketingSummary";
import { QuickActions } from "@/components/marketing/QuickActions";
import { RecentActivity } from "@/components/marketing/RecentActivity";
import { RecommendedActions } from "@/components/marketing/RecommendedActions";
import { TopOpportunities } from "@/components/marketing/TopOpportunities";
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

export default function MarketingWorkspacePage() {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
        <p className={WORKSPACE_GREETING_CLASS}>
          {getGreetingPeriod()}, {FOUNDER_NAME}
        </p>
        <h1 className={WORKSPACE_TITLE_CLASS}>Marketing</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>{formatTodayDate()}</p>
      </header>

      <section aria-label="Marketing Workspace" className={WORKSPACE_SECTION_CLASS}>
        <MarketingSummary />
        <MarketingHealth />
        <ExecutiveBriefing />
        <ChannelPerformance />
        <CampaignInsights />
        <TopOpportunities />
        <CriticalIssues />
        <RecommendedActions />
        <RecentActivity />
        <QuickActions />
      </section>
    </div>
  );
}

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
import { WorkspacePageHeader } from "@/components/workspace/WorkspacePageHeader";
import { FOUNDER_NAME } from "@/lib/command-center-data";
import { WORKSPACE_PAGE_CLASS, WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import {
  formatWorkspaceDateLabel,
  getWorkspaceGreetingPeriod,
} from "@/lib/workspace-format";

export default function MarketingWorkspacePage() {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <WorkspacePageHeader
        greetingPeriod={getWorkspaceGreetingPeriod()}
        executiveName={FOUNDER_NAME}
        title="Marketing"
        dateLabel={formatWorkspaceDateLabel()}
      />

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

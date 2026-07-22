import { BusinessHealthOverview } from "@/components/command-center/BusinessHealthOverview";
import { CommandCenterQuickActionsCard } from "@/components/command-center/CommandCenterQuickActionsCard";
import { CriticalAttentionCard } from "@/components/command-center/CriticalAttentionCard";
import { ExecutiveBriefingSection } from "@/components/command-center/ExecutiveBriefingSection";
import { ExecutiveGreeting } from "@/components/command-center/ExecutiveGreeting";
import { ExecutiveSummaryCard } from "@/components/command-center/ExecutiveSummaryCard";
import { InsightOfTheDayCard } from "@/components/command-center/InsightOfTheDayCard";
import { RecentActivityCard } from "@/components/command-center/RecentActivityCard";
import { RecommendedActionsCard } from "@/components/command-center/RecommendedActionsCard";
import { TodaysPrioritiesCard } from "@/components/command-center/TodaysPrioritiesCard";
import { Divider } from "@/components/ui/Divider";
import {
  WORKSPACE_GRID_2_COL,
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_CLASS,
} from "@/lib/constants";

export default function ExecutiveCommandCenterPage() {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <ExecutiveGreeting />

      <section aria-label="Executive Command Center" className={WORKSPACE_SECTION_CLASS}>
        <ExecutiveSummaryCard />

        <BusinessHealthOverview />

        <Divider />

        <div className={WORKSPACE_GRID_2_COL}>
          <ExecutiveBriefingSection />
          <CriticalAttentionCard />
        </div>

        <InsightOfTheDayCard />

        <div className={WORKSPACE_GRID_2_COL}>
          <TodaysPrioritiesCard />
          <RecommendedActionsCard />
        </div>

        <RecentActivityCard />

        <CommandCenterQuickActionsCard />
      </section>
    </div>
  );
}

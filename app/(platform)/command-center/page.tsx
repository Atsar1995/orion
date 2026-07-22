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

export default function ExecutiveCommandCenterPage() {
  return (
    <div className="space-y-6">
      <ExecutiveGreeting />

      <section aria-label="Executive Command Center" className="space-y-8">
        <ExecutiveSummaryCard />

        <BusinessHealthOverview />

        <Divider />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ExecutiveBriefingSection />
          <CriticalAttentionCard />
        </div>

        <InsightOfTheDayCard />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <TodaysPrioritiesCard />
          <RecommendedActionsCard />
        </div>

        <RecentActivityCard />

        <CommandCenterQuickActionsCard />
      </section>
    </div>
  );
}

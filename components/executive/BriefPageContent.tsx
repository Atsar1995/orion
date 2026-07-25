import { AiExecutiveSummaryCard } from "@/components/executive/AiExecutiveSummary";
import { BriefEndSummary } from "@/components/executive/BriefEndSummary";
import { BriefLayout } from "@/components/executive/BriefLayout";
import { BriefSection } from "@/components/executive/BriefSection";
import { BriefStatusBanner } from "@/components/executive/BriefStatusBanner";
import { BusinessHealthCard } from "@/components/executive/BusinessHealthCard";
import { CriticalAlertsSection } from "@/components/executive/CriticalAlertsSection";
import { ExecutiveGreeting } from "@/components/executive/ExecutiveGreeting";
import { ExecutiveRecommendationCard } from "@/components/executive/ExecutiveRecommendationCard";
import { OvernightChangesStrip } from "@/components/executive/OvernightChangesStrip";
import { TodaysPrioritiesSection } from "@/components/executive/TodaysPrioritiesSection";
import { WORKSPACE_GRID_2_COL, WORKSPACE_PAGE_CLASS, WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import type { BriefView } from "@/types/executive";

type BriefPageContentProps = {
  brief: BriefView;
};

/** EC-001 Morning Executive Brief composed surface. */
export function BriefPageContent({ brief }: BriefPageContentProps) {
  const [featuredRecommendation, ...additionalRecommendations] = brief.recommendations;

  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <BriefLayout>
        <ExecutiveGreeting greeting={brief.greeting} lastSyncedAt={brief.lastSyncedAt} />

        <BriefStatusBanner
          lifecycle={brief.lifecycle}
          changesSinceLastView={brief.changesSinceLastView}
          lastSyncedAt={brief.lastSyncedAt}
        />

        <section aria-label="Morning Executive Brief" className={WORKSPACE_SECTION_CLASS}>
          <div className={WORKSPACE_GRID_2_COL}>
            <BusinessHealthCard health={brief.businessHealth} />
            <CriticalAlertsSection alerts={brief.criticalAlerts} />
          </div>

          <OvernightChangesStrip changes={brief.overnightChanges} />

          {featuredRecommendation ? (
            <BriefSection title="Top Recommendation">
              <ExecutiveRecommendationCard
                recommendation={featuredRecommendation}
                featured
              />
            </BriefSection>
          ) : null}

          {additionalRecommendations.length > 0 ? (
            <BriefSection title="Recommendations">
              <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {additionalRecommendations.map((recommendation) => (
                  <li key={recommendation.id}>
                    <ExecutiveRecommendationCard recommendation={recommendation} />
                  </li>
                ))}
              </ul>
            </BriefSection>
          ) : null}

          <TodaysPrioritiesSection priorities={brief.priorities} />

          <AiExecutiveSummaryCard summary={brief.aiSummary} />

          <BriefEndSummary summary={brief.endSummary} />
        </section>
      </BriefLayout>
    </div>
  );
}

import { IntelligenceFeedSection } from "@/components/intelligence/IntelligenceFeedSection";
import { HospitalityHealthBriefSection } from "@/components/hospitality/HospitalityHealthBriefSection";
import { OrganizationHealthBriefSection } from "@/components/organization/OrganizationHealthBriefSection";
import { AiExecutiveSummaryCard } from "@/components/executive/AiExecutiveSummary";
import { BriefAdditionalRecommendations } from "@/components/executive/BriefAdditionalRecommendations";
import { BriefBusinessHealthSection, BriefBusinessHealthRiskOpportunitiesSection } from "@/components/executive/BriefBusinessHealthSection";
import { BriefEndSummary } from "@/components/executive/BriefEndSummary";
import { BriefKeyboardShortcuts } from "@/components/executive/BriefKeyboardShortcuts";
import { BriefLayout } from "@/components/executive/BriefLayout";
import { BriefPrioritiesSection } from "@/components/executive/BriefPrioritiesSection";
import { BriefQuickNav } from "@/components/executive/BriefQuickNav";
import { BriefSkipToRecommendation } from "@/components/executive/BriefSkipToRecommendation";
import { BriefStatusBanner } from "@/components/executive/BriefStatusBanner";
import { BriefSection } from "@/components/executive/BriefSection";
import { BusinessTrendsSection } from "@/components/executive/BusinessTrendsSection";
import { CrossWorkspaceIntelligenceSection } from "@/components/executive/CrossWorkspaceIntelligenceSection";
import { CriticalAlertsSection } from "@/components/executive/CriticalAlertsSection";
import { ExecutiveDecisionsSection } from "@/components/executive/ExecutiveDecisionsSection";
import { ExecutiveGreeting } from "@/components/executive/ExecutiveGreeting";
import { ExecutiveMemorySection } from "@/components/executive/ExecutiveMemorySection";
import { ExecutiveRecommendationCard } from "@/components/executive/ExecutiveRecommendationCard";
import { MorningBriefSummarySection } from "@/components/executive/MorningBriefSummarySection";
import { OvernightChangesStrip } from "@/components/executive/OvernightChangesStrip";
import { DecisionIntelligencePanel } from "@/components/decisions/DecisionIntelligencePanel";
import { DataFreshnessIndicator } from "@/components/data/DataFreshnessIndicator";
import {
  BRIEF_SECTION_SCROLL_MT_CLASS,
  WORKSPACE_GRID_2_COL,
  WORKSPACE_PAGE_CLASS,
} from "@/lib/constants";
import type { BriefView } from "@/types/executive";
import type { DecisionBriefIntelligence } from "@/types/decisions";
import type { DataStatus } from "@/lib/data/types";

type BriefPageContentProps = {
  brief: BriefView;
  dataSources?: readonly string[];
  dataStatus?: DataStatus;
  lastUpdatedAt?: string;
  decisionIntelligence?: DecisionBriefIntelligence;
};

/** Executive Brief v1.0 — calm, decision-first executive workspace (Mission P-002). */
export function BriefPageContent({
  brief,
  dataSources = [],
  dataStatus = "ready",
  lastUpdatedAt,
  decisionIntelligence,
}: BriefPageContentProps) {
  const [featuredRecommendation, ...additionalRecommendations] = brief.recommendations;
  const skipTarget = featuredRecommendation ? "#brief-top-rec-heading" : "#brief-overview";

  return (
    <div className={`${WORKSPACE_PAGE_CLASS} orion-scroll-smooth`}>
      <BriefSkipToRecommendation href={skipTarget} />
      <BriefKeyboardShortcuts featuredActionHref={featuredRecommendation?.href} />
      <BriefLayout className="space-y-4">
        <BriefQuickNav />

        <ExecutiveGreeting
          greeting={brief.greeting}
          lastSyncedAt={brief.lastSyncedAt}
          showSyncStatus={false}
          compact
        />

        <BriefStatusBanner
          lifecycle={brief.lifecycle}
          changesSinceLastView={brief.changesSinceLastView}
          lastSyncedAt={brief.lastSyncedAt}
        />

        {lastUpdatedAt && brief.lifecycle !== "fresh" ? (
          <DataFreshnessIndicator
            freshness={{
              generatedAt: brief.generatedAt,
              lastUpdatedAt,
              ttlSeconds: 60,
              isStale: brief.lifecycle === "stale",
              sourceCount: dataSources.length,
            }}
            status={dataStatus}
          />
        ) : null}

        <section aria-label="Executive Brief" className="space-y-4">
          <div id="brief-overview" className={`${BRIEF_SECTION_SCROLL_MT_CLASS} space-y-4`}>
            <div className={`${WORKSPACE_GRID_2_COL} items-start gap-3`}>
              <BriefBusinessHealthSection health={brief.businessHealth} />
              <CriticalAlertsSection alerts={brief.criticalAlerts} />
            </div>

            {featuredRecommendation ? (
              <div
                id="brief-top-rec-heading"
                className={BRIEF_SECTION_SCROLL_MT_CLASS}
              >
                <BriefSection title="Recommendations" className="space-y-2">
                  <ExecutiveRecommendationCard
                    recommendation={featuredRecommendation}
                    featured
                  />
                </BriefSection>
              </div>
            ) : null}

            <MorningBriefSummarySection summary={brief.morningSummary} />

            <BriefBusinessHealthRiskOpportunitiesSection health={brief.businessHealth} />

            <OvernightChangesStrip changes={brief.overnightChanges} />

            {brief.organizationHealth && brief.hospitalityHealth ? (
              <div className={`${WORKSPACE_GRID_2_COL} items-start`}>
                <OrganizationHealthBriefSection health={brief.organizationHealth} />
                <HospitalityHealthBriefSection health={brief.hospitalityHealth} />
              </div>
            ) : (
              <>
                {brief.organizationHealth ? (
                  <OrganizationHealthBriefSection health={brief.organizationHealth} />
                ) : null}
                {brief.hospitalityHealth ? (
                  <HospitalityHealthBriefSection health={brief.hospitalityHealth} />
                ) : null}
              </>
            )}

            {brief.intelligenceFeed && brief.intelligenceFeed.length > 0 ? (
              <IntelligenceFeedSection items={brief.intelligenceFeed} />
            ) : null}
          </div>

          <div
            id="brief-attention"
            className={`${BRIEF_SECTION_SCROLL_MT_CLASS} mt-8 space-y-6 rounded-orion-lg border border-orion-gold/12 bg-gradient-to-br from-orion-gold/[0.04] via-orion-surface/20 to-transparent p-4 md:p-5`}
          >
            <BriefPrioritiesSection priorities={brief.priorityDecisions} />

            <div id="brief-actions">
              <BriefAdditionalRecommendations recommendations={additionalRecommendations} />
            </div>
          </div>

          <div id="brief-decisions-block" className={`${BRIEF_SECTION_SCROLL_MT_CLASS} space-y-6`}>
            <ExecutiveDecisionsSection decisions={brief.executiveDecisions} />

            {decisionIntelligence ? (
              <DecisionIntelligencePanel intelligence={decisionIntelligence} />
            ) : null}
          </div>

          <div id="brief-intelligence" className={`${BRIEF_SECTION_SCROLL_MT_CLASS} space-y-6`}>
            <CrossWorkspaceIntelligenceSection signals={brief.crossWorkspaceSignals} />
            <BusinessTrendsSection trends={brief.businessTrends} />
            <ExecutiveMemorySection items={brief.executiveMemory} />
          </div>

          <div id="brief-context" className={`${BRIEF_SECTION_SCROLL_MT_CLASS} space-y-6`}>
            <AiExecutiveSummaryCard summary={brief.aiSummary} />
            <BriefEndSummary summary={brief.endSummary} />
          </div>
        </section>
      </BriefLayout>
    </div>
  );
}

import type {
  CrmOpportunityDetailView,
  CrmOpportunityListResult,
  CrmOpportunityMetrics,
  CrmOpportunityPipelineView,
  CrmOpportunityWorkspaceView,
  OpportunityListQuery,
} from "@/lib/crm/models/opportunities";
import { OPPORTUNITY_STAGES } from "@/lib/crm/data/opportunity-records";
import type { CrmRepository } from "@/lib/crm/repositories/CrmRepository";
import {
  findOpportunityRecordById,
  getOpenOpportunityRecords,
  groupOpportunitiesByStage,
  queryOpportunityRecords,
} from "@/lib/crm/services/opportunities/opportunity-query";
import type { Recommendation } from "@/types/intelligence";

function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1).replace(/\.0$/, "")}Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1).replace(/\.0$/, "")}L`;
  }

  return `₹${Math.round(amount / 1000)}K`;
}

function buildOpportunityRecommendations(): Recommendation[] {
  return [
    {
      id: "opp-rec-1",
      priority: 1,
      title: "Proposal awaiting approval",
      description:
        "Commerce Partner platform expansion and ABC Industries equipment upgrade blocked on internal approval.",
      category: "executive",
    },
    {
      id: "opp-rec-2",
      priority: 2,
      title: "High-value deal nearing close",
      description:
        "OranIA Group ₹18L enterprise renewal in final negotiation — closes 28 Jul 2026.",
      category: "executive",
    },
    {
      id: "opp-rec-3",
      priority: 3,
      title: "Opportunity stalled for 14 days",
      description:
        "Retail Channel retention package has no activity in 14 days. Founder re-engagement required.",
      category: "risk",
    },
    {
      id: "opp-rec-4",
      priority: 4,
      title: "Deal at risk",
      description:
        "Retail Channel Co VIP account shows elevated churn risk. Immediate intervention recommended.",
      category: "risk",
    },
  ];
}

function buildPipelineMetrics(records: ReturnType<CrmRepository["getOpportunityRecords"]>): CrmOpportunityMetrics {
  const openRecords = getOpenOpportunityRecords(records);
  const totalOpenValue = openRecords.reduce((sum, record) => sum + record.valueAmount, 0);
  const averageDealSize =
    openRecords.length > 0 ? Math.round(totalOpenValue / openRecords.length) : 0;
  const expectedMonthlyRevenue = openRecords.reduce(
    (sum, record) => sum + Math.round((record.valueAmount * record.probability) / 100),
    0,
  );

  const wonCount = records.filter((record) => record.stage === "Won").length;
  const lostCount = records.filter((record) => record.stage === "Lost").length;
  const closedCount = wonCount + lostCount;
  const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

  return {
    totalPipelineValue: formatCurrency(totalOpenValue),
    openOpportunities: openRecords.length,
    averageDealSize: formatCurrency(averageDealSize),
    expectedMonthlyRevenue: formatCurrency(expectedMonthlyRevenue),
    winRate: `${winRate}%`,
  };
}

/** CRM opportunities module service — placeholder data only (Mission 16A.4). */
export class CrmOpportunitiesService {
  constructor(private readonly repository: CrmRepository) {}

  listOpportunities(query: OpportunityListQuery = {}): CrmOpportunityListResult {
    return queryOpportunityRecords(this.repository.getOpportunityRecords(), query);
  }

  getPipelineView(query: OpportunityListQuery = {}): CrmOpportunityPipelineView {
    return {
      stages: OPPORTUNITY_STAGES,
      columns: groupOpportunitiesByStage(this.repository.getOpportunityRecords(), query),
    };
  }

  getPipelineMetrics(): CrmOpportunityMetrics {
    return buildPipelineMetrics(this.repository.getOpportunityRecords());
  }

  getWorkspaceView(): CrmOpportunityWorkspaceView {
    return {
      metrics: this.getPipelineMetrics(),
      recommendations: buildOpportunityRecommendations(),
      records: this.repository.getOpportunityRecords(),
    };
  }

  getOpportunityDetail(opportunityId: string): CrmOpportunityDetailView | null {
    const opportunity = findOpportunityRecordById(
      this.repository.getOpportunityRecords(),
      opportunityId,
    );

    if (!opportunity) {
      return null;
    }

    const recentActivity = this.repository
      .getRecentActivity()
      .filter((item) => item.description.includes(opportunity.customer.split(" ")[0] ?? opportunity.customer))
      .slice(0, 5);

    return {
      opportunity,
      recentActivity:
        recentActivity.length > 0
          ? recentActivity
          : [
              {
                time: opportunity.lastUpdated,
                type: "Note" as const,
                description: opportunity.nextAction,
              },
            ],
      recommendations: buildOpportunityRecommendations().slice(0, 2),
    };
  }

  getOpportunityCatalog() {
    return this.repository.getOpportunityRecords();
  }
}

export function createCrmOpportunitiesService(repository: CrmRepository): CrmOpportunitiesService {
  return new CrmOpportunitiesService(repository);
}

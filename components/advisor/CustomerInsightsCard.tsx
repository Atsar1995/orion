import Link from "next/link";
import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { CrmKpiSummaryRow } from "@/components/crm/CrmEnhancedKpiCards";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_GRID_2_COL, WORKSPACE_SUMMARY_CLASS } from "@/lib/constants";
import type { CrmCustomerProfile } from "@/lib/crm-insights";
import {
  getProvider,
  getProviderBriefingLine,
  getProviderCardSnapshot,
} from "@/lib/intelligence/intelligence-bus";
import type { CrmAdvisorSnapshot } from "@/lib/crm/crm-intelligence-types";
import type {
  PriorityOpportunity,
  PriorityRelationship,
} from "@/lib/crm-relationships-opportunities";

function CustomerProfileBlock({
  label,
  profile,
}: {
  label: string;
  profile: CrmCustomerProfile;
}) {
  return (
    <div className="rounded-orion-md border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-white/40 uppercase">{label}</p>
        <StatusIndicator status={profile.status} showLabel={false} />
      </div>
      <p className="mt-2 text-sm font-medium text-white/85">{profile.name}</p>
      <p className="mt-1 text-sm font-light text-white/55">{profile.value}</p>
      <p className="mt-2 text-sm font-light text-white/50">{profile.detail}</p>
    </div>
  );
}

function PriorityRelationshipBlock({
  label,
  relationship,
  href,
}: {
  label: string;
  relationship: PriorityRelationship;
  href: string;
}) {
  return (
    <div className="rounded-orion-md border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-white/40 uppercase">{label}</p>
        <StatusIndicator status={relationship.status} showLabel={false} />
      </div>
      <p className="mt-2 text-sm font-medium text-white/85">{relationship.name}</p>
      <p className="mt-1 text-sm font-light text-white/55">
        {relationship.industry} · {relationship.lifetimeValue}
      </p>
      <p className="mt-2 text-sm font-light text-white/50">{relationship.reason}</p>
      <p className="mt-1 text-sm font-light text-white/45">{relationship.action}</p>
      <Link
        href={href}
        className="mt-3 inline-block text-xs font-medium text-orion-gold/90 transition-colors hover:text-orion-gold"
      >
        View relationships →
      </Link>
    </div>
  );
}

function PriorityOpportunityBlock({
  label,
  opportunity,
  href,
}: {
  label: string;
  opportunity: PriorityOpportunity;
  href: string;
}) {
  return (
    <div className="rounded-orion-md border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-white/40 uppercase">{label}</p>
        <StatusIndicator status={opportunity.status} showLabel={false} />
      </div>
      <p className="mt-2 text-sm font-medium text-white/85">{opportunity.name}</p>
      <p className="mt-1 text-sm font-light text-white/55">
        {opportunity.value} · {opportunity.stage} · {opportunity.probability}%
      </p>
      <p className="mt-2 text-sm font-light text-white/50">
        Close {opportunity.expectedClose} — {opportunity.action}
      </p>
      <Link
        href={href}
        className="mt-3 inline-block text-xs font-medium text-orion-gold/90 transition-colors hover:text-orion-gold"
      >
        View opportunities →
      </Link>
    </div>
  );
}

/** Customer Intelligence insights integrated into the daily Executive Brief (ADR-006). */
export function CustomerInsightsCard() {
  const provider = getProvider("crm");
  const snapshot = getProviderCardSnapshot<CrmAdvisorSnapshot>("crm");
  const briefingLine = getProviderBriefingLine("crm");

  if (!provider || !snapshot) {
    return null;
  }

  return (
    <Card
      title="Customer Intelligence"
      variant="premium"
      action={
        <Link
          href="/crm"
          className="text-xs font-medium text-orion-gold/90 transition-colors hover:text-orion-gold"
        >
          Open CRM →
        </Link>
      }
    >
      <div className="space-y-5">
        <p className={WORKSPACE_SUMMARY_CLASS}>{briefingLine}</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
              Customer Health
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {snapshot.healthScore}
              <span className="text-base font-light text-white/40">/100</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusIndicator status={snapshot.status} />
            <StatCard label="Trend" value={snapshot.trend} />
          </div>
        </div>
        <CrmKpiSummaryRow />
        <div className={WORKSPACE_GRID_2_COL}>
          <PriorityRelationshipBlock
            label="Highest Priority Relationship"
            relationship={snapshot.highestPriorityRelationship}
            href="/crm/relationships"
          />
          <PriorityOpportunityBlock
            label="Highest Priority Opportunity"
            opportunity={snapshot.highestPriorityOpportunity}
            href="/crm/opportunities"
          />
        </div>
        <div className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
              Weekly Relationship Health
            </p>
            <StatusIndicator status={snapshot.weeklyRelationshipHealth.status} showLabel={false} />
          </div>
          <p className="mt-2 text-sm font-light text-white/60">
            {snapshot.weeklyRelationshipHealth.summary}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <StatCard label="Trend" value={snapshot.weeklyRelationshipHealth.trend} />
            <StatCard
              label="Engagement"
              value={snapshot.weeklyRelationshipHealth.engagementChange}
            />
            <StatCard label="At Risk" value={snapshot.weeklyRelationshipHealth.atRiskChange} />
          </div>
        </div>
        <div className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
            Customer Portfolio Summary
          </p>
          <p className="mt-2 text-sm font-light text-white/60">
            {snapshot.portfolioSummary.executiveSummary}
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {snapshot.portfolioSummary.categories.map((category) => (
              <li
                key={category.label}
                className="rounded-orion-sm border border-white/[0.05] bg-white/[0.02] px-2 py-2 text-center"
              >
                <p className="text-[10px] font-medium tracking-wide text-white/35 uppercase">
                  {category.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-white/80">{category.customerCount}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className={WORKSPACE_GRID_2_COL}>
          <CustomerProfileBlock
            label="Highest-Value Customer"
            profile={snapshot.highestValueCustomer}
          />
          <CustomerProfileBlock
            label="Highest-Risk Customer"
            profile={snapshot.highestRiskCustomer}
          />
        </div>
        <div className="rounded-orion-md border border-amber-400/15 bg-amber-400/[0.06] px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-amber-400/80 uppercase">
            Recommended Executive Action
          </p>
          <p className="mt-1 text-sm font-medium text-white/85">
            {snapshot.recommendedAction.title}
          </p>
          <p className="mt-1 text-sm font-light text-white/55">
            {snapshot.recommendedAction.description}
          </p>
        </div>
      </div>
    </Card>
  );
}

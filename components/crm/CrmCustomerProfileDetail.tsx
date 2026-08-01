import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { WORKSPACE_GRID_2_COL, WORKSPACE_GRID_3_COL } from "@/lib/constants";
import { formatCommercialCurrency } from "@/lib/crm/commercial";
import type { CustomerProfileDetailView } from "@/lib/crm/models/customer-intelligence";

type CrmCustomerProfileDetailProps = {
  profile: CustomerProfileDetailView;
};

/** Unified customer profile with journey timeline (Mission P-008.6). */
export function CrmCustomerProfileDetail({ profile }: CrmCustomerProfileDetailProps) {
  return (
    <div className="space-y-6">
      <div className={`${WORKSPACE_GRID_3_COL} md:grid-cols-2 xl:grid-cols-5`}>
        <StatCard label="Relationship Score" value={`${profile.relationshipScore}/100`} />
        <StatCard label="Lifetime Value" value={formatCommercialCurrency(profile.lifetimeValue)} />
        <StatCard label="Loyalty Index" value={`${profile.loyaltyIndex}/100`} />
        <StatCard label="Engagement" value={`${profile.engagementScore}/100`} />
        <StatCard label="Growth Potential" value={`${profile.growthPotential}/100`} />
      </div>

      <div className={WORKSPACE_GRID_2_COL}>
        <Card title="Profile Summary" subtitle={`Segment: ${profile.segment.replace(/_/g, " ")}`}>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Industry</dt>
              <dd>{profile.industry ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Retention Risk</dt>
              <dd className="capitalize">{profile.retentionRisk}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Commercial</dt>
              <dd className="text-right">{profile.commercialSummary}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Hospitality</dt>
              <dd className="text-right">{profile.hospitalitySummary ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Financial</dt>
              <dd className="text-right">{profile.financialSummary}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Preferred Channel</dt>
              <dd className="capitalize">{profile.communicationPreferences.preferredChannel.replace(/_/g, " ")}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Relationship Milestones" subtitle="Executive memory">
          {profile.milestones.length === 0 ? (
            <p className="text-sm text-muted-foreground">No milestones recorded.</p>
          ) : (
            <ol className="space-y-3 text-sm">
              {profile.milestones.map((entry, index) => (
                <li key={`${entry.recordedAt}-${index}`} className="rounded-md border border-border/60 p-3">
                  <p className="font-medium">{entry.milestone}</p>
                  {entry.outcome ? <p className="mt-1 text-muted-foreground">{entry.outcome}</p> : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(entry.recordedAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>

      <Card title="Customer Journey" subtitle="Operational events feeding strategic timeline">
        {profile.journey.length === 0 ? (
          <p className="text-sm text-muted-foreground">No journey events.</p>
        ) : (
          <ol className="space-y-3 text-sm">
            {profile.journey.map((event) => (
              <li key={event.id} className="rounded-md border border-border/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{event.title}</span>
                  <span className="text-xs capitalize text-muted-foreground">
                    {event.stage.replace(/_/g, " ")} · {event.sourceDomain}
                  </span>
                </div>
                <p className="mt-1 text-muted-foreground">{event.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(event.occurredAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}

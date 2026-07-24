import { StatusIndicator } from "@/components/command-center/StatusIndicator";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import {
  WORKSPACE_GRID_2_COL,
} from "@/lib/constants";
import type { CustomerProfileDetail } from "@/lib/crm-relationships-opportunities";

type CustomerProfileCardProps = {
  profile: CustomerProfileDetail;
};

/** Customer profile dashboard card — presentation only. */
export function CustomerProfileCard({ profile }: CustomerProfileCardProps) {
  return (
    <Card title={profile.name} variant="premium">
      <div className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
              Customer Health
            </p>
            <p className="mt-1 text-3xl font-semibold tracking-tight text-white">
              {profile.healthScore}
              <span className="text-base font-light text-white/40">/100</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusIndicator status={profile.healthStatus} />
            <StatCard label="Rank" value={`#${profile.rank}`} />
          </div>
        </div>
        <div className={WORKSPACE_GRID_2_COL}>
          <StatCard label="Industry" value={profile.industry} />
          <StatCard label="Lifetime Value" value={profile.lifetimeValue} />
          <StatCard label="Relationship Status" value={profile.relationshipStatus} />
          <StatCard label="Open Opportunities" value={String(profile.openOpportunities)} />
          <StatCard label="Last Interaction" value={profile.lastInteraction} />
          <StatCard label="Next Follow-up" value={profile.nextFollowUp} />
        </div>
        <div className="rounded-orion-md border border-white/[0.05] bg-white/[0.02] px-4 py-3">
          <p className="text-xs font-medium tracking-wide text-white/40 uppercase">
            Executive Notes
          </p>
          <p className="mt-2 text-sm font-light text-white/60">{profile.executiveNotes}</p>
        </div>
      </div>
    </Card>
  );
}

type CustomerProfileListProps = {
  title: string;
  profiles: CustomerProfileDetail[];
};

/** Renders a list of customer profile cards. */
export function CustomerProfileList({ title, profiles }: CustomerProfileListProps) {
  return (
    <div className="space-y-6" aria-label={title}>
      {profiles.map((profile) => (
        <CustomerProfileCard key={profile.name} profile={profile} />
      ))}
    </div>
  );
}

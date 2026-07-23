import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WORKSPACE_SECTION_GROUP_CLASS } from "@/lib/constants";
import { BUSINESS_SNAPSHOT } from "@/lib/advisor-data";

/** Cross-domain business snapshot synthesizing all workspaces. */
export function BusinessSnapshot() {
  return (
    <div className={WORKSPACE_SECTION_GROUP_CLASS}>
      <SectionHeader
        title="Business Snapshot"
        subtitle="Key metrics across marketing, hospitality, finance, CRM, and commerce."
      />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {BUSINESS_SNAPSHOT.map((domain) => (
          <Card key={domain.domain} title={domain.domain}>
            <div className="grid grid-cols-2 gap-2.5">
              {domain.metrics.map((metric) => (
                <StatCard key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

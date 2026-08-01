import { DashboardLayout, buildDashboardHeaderLabels } from "@/app/(platform)/dashboard/DashboardLayout";
import { DataFreshnessIndicator } from "@/components/data/DataFreshnessIndicator";
import { EmptyState } from "@/components/ui/EmptyState";
import { composeExecutiveDashboard } from "@/lib/data/services/ExecutiveDashboardService";

export const dynamic = "force-dynamic";

/** EP-002 Executive Dashboard — provider-backed composition (Mission S1C). */
export default async function ExecutiveDashboardPage() {
  const composition = await composeExecutiveDashboard();
  const header = buildDashboardHeaderLabels(composition.state.generatedAt);

  if (composition.status === "error" || composition.sections.length === 0) {
    return (
      <div className="space-y-4">
        <EmptyState
          title="Executive dashboard unavailable"
          description={
            composition.errors[0]?.message ??
            "Registered workspace providers did not return dashboard data."
          }
        />
        <DataFreshnessIndicator
          freshness={{
            generatedAt: composition.lastUpdatedAt,
            lastUpdatedAt: composition.lastUpdatedAt,
            ttlSeconds: 60,
            isStale: true,
            sourceCount: composition.sources.length,
          }}
          status="error"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataFreshnessIndicator
        freshness={{
          generatedAt: composition.state.generatedAt,
          lastUpdatedAt: composition.lastUpdatedAt,
          ttlSeconds: 60,
          isStale: false,
          sourceCount: composition.sources.length,
        }}
        status={composition.status}
      />
      <DashboardLayout
        greeting={header.greeting}
        dateLabel={header.dateLabel}
        sections={composition.sections}
      />
    </div>
  );
}

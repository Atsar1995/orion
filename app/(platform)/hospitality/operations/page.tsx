import { ExecutiveAnalyticsDashboard } from "@/components/hospitality/ExecutiveAnalyticsDashboard";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { OperationalAnalyticsPanel } from "@/components/hospitality/OperationalAnalyticsPanel";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { DEFAULT_PROPERTY_ID, hospitalityAnalyticsService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

/** Hospitality operational analytics dashboard (Mission P-007.7). */
export default async function HospitalityOperationsPage() {
  const { context } = await getDecisionServiceContext();
  const analytics = hospitalityAnalyticsService.getFullAnalytics(context, DEFAULT_PROPERTY_ID);

  return (
    <>
      <HospitalitySectionHeader
        title="Operations & Analytics"
        subtitle="Real-time operational metrics, housekeeping progress, maintenance status, and executive health scores."
      />
      <section aria-label="Hospitality Operations Analytics" className={`${WORKSPACE_SECTION_CLASS} space-y-6`}>
        <OperationalAnalyticsPanel operational={analytics.operational} />
        <ExecutiveAnalyticsDashboard dashboard={analytics.executive} />
      </section>
    </>
  );
}

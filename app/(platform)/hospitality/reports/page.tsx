import { ExecutiveAnalyticsDashboard } from "@/components/hospitality/ExecutiveAnalyticsDashboard";
import { HospitalityInsightsPanel } from "@/components/hospitality/HospitalityInsightsPanel";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_GRID_2_COL, WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { DEFAULT_PROPERTY_ID, hospitalityAnalyticsService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

/** Hospitality executive intelligence & analytics reports (Mission P-007.7). */
export default async function HospitalityReportsPage() {
  const { context } = await getDecisionServiceContext();
  const analytics = hospitalityAnalyticsService.getFullAnalytics(context, DEFAULT_PROPERTY_ID);

  return (
    <>
      <HospitalitySectionHeader
        title="Executive Intelligence"
        subtitle="KPIs, forecasts, trends, commercial analytics, guest intelligence, and actionable recommendations."
      />
      <section aria-label="Hospitality Executive Reports" className={`${WORKSPACE_SECTION_CLASS} space-y-6`}>
        <ExecutiveAnalyticsDashboard dashboard={analytics.executive} />
        <HospitalityInsightsPanel analytics={analytics} />
        <div className={WORKSPACE_GRID_2_COL}>
          <Card title="Guest Intelligence">
            <dl className="space-y-2 text-sm text-white/70">
              <div className="flex justify-between"><dt>Repeat guests</dt><dd>{analytics.guest.repeatGuests}</dd></div>
              <div className="flex justify-between"><dt>VIP guests</dt><dd>{analytics.guest.vipGuests}</dd></div>
              <div className="flex justify-between"><dt>Loyalty growth</dt><dd>{analytics.guest.loyaltyGrowth}</dd></div>
              <div className="flex justify-between"><dt>Satisfaction</dt><dd>{analytics.guest.satisfactionScore}/5</dd></div>
              <div className="flex justify-between"><dt>Service recovery</dt><dd>{analytics.guest.serviceRecoverySuccess}%</dd></div>
            </dl>
          </Card>
          <Card title="Commercial Analytics">
            <dl className="space-y-2 text-sm text-white/70">
              <div className="flex justify-between"><dt>Lead time</dt><dd>{analytics.commercial.leadTimeDays} days</dd></div>
              <div className="flex justify-between"><dt>Conversion rate</dt><dd>{analytics.commercial.conversionRate}%</dd></div>
              {analytics.commercial.bookingSources.slice(0, 3).map((entry) => (
                <div key={entry.source} className="flex justify-between">
                  <dt>{entry.source}</dt>
                  <dd>{entry.share}%</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </section>
    </>
  );
}

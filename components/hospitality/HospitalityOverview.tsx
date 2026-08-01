import { ArrivalsDepartures } from "@/components/hospitality/ArrivalsDepartures";
import { BookingChannels } from "@/components/hospitality/BookingChannels";
import { BookingPerformance } from "@/components/hospitality/BookingPerformance";
import { CriticalIssues } from "@/components/hospitality/CriticalIssues";
import { ExecutiveBriefing } from "@/components/hospitality/ExecutiveBriefing";
import { GuestExperience } from "@/components/hospitality/GuestExperience";
import { HospitalitySummary } from "@/components/hospitality/HospitalitySummary";
import { HotelHealth } from "@/components/hospitality/HotelHealth";
import { OccupancyRevenue } from "@/components/hospitality/OccupancyRevenue";
import { OrionInsights } from "@/components/hospitality/OrionInsights";
import { QuickActions } from "@/components/hospitality/QuickActions";
import { RecentActivity } from "@/components/hospitality/RecentActivity";
import { RecommendedActions } from "@/components/hospitality/RecommendedActions";
import { RevenueOpportunities } from "@/components/hospitality/RevenueOpportunities";
import { TodayOperations } from "@/components/hospitality/TodayOperations";
import type { HospitalityDashboardView } from "@/lib/hospitality/models/dashboard";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";

type HospitalityOverviewProps = {
  dashboard: HospitalityDashboardView;
};

/** Service-driven hospitality overview (Mission P-007). */
export function HospitalityOverview({ dashboard }: HospitalityOverviewProps) {
  return (
    <section aria-label="Hospitality overview" className={WORKSPACE_SECTION_CLASS}>
      <HospitalitySummary summary={dashboard.summary} />
      <HotelHealth health={dashboard.hotelHealth} kpis={dashboard.kpis} />
      <ExecutiveBriefing briefing={dashboard.executiveBriefing} />
      <TodayOperations
        operations={dashboard.todayOperations}
        detail={dashboard.operationsDetail}
      />
      <OccupancyRevenue metrics={dashboard.occupancyRevenue} />
      <BookingPerformance metrics={dashboard.bookingPerformance} />
      <ArrivalsDepartures items={dashboard.arrivalsDepartures} />
      <GuestExperience data={dashboard.guestExperience} />
      <BookingChannels channels={dashboard.bookingChannels} />
      <RevenueOpportunities opportunities={dashboard.revenueOpportunities} />
      <OrionInsights insights={dashboard.orionInsights} />
      <CriticalIssues issues={dashboard.criticalIssues} />
      <RecommendedActions actions={dashboard.recommendedActions} />
      <RecentActivity activities={dashboard.recentActivity} />
      <QuickActions actions={dashboard.quickActions} />
    </section>
  );
}

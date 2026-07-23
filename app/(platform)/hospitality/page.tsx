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
import { FOUNDER_NAME } from "@/lib/command-center-data";
import {
  WORKSPACE_GREETING_CLASS,
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";

function getGreetingPeriod(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HospitalityWorkspacePage() {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
        <p className={WORKSPACE_GREETING_CLASS}>
          {getGreetingPeriod()}, {FOUNDER_NAME}
        </p>
        <h1 className={WORKSPACE_TITLE_CLASS}>Hospitality</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>{formatTodayDate()}</p>
      </header>

      <section aria-label="Hospitality Workspace" className={WORKSPACE_SECTION_CLASS}>
        <HospitalitySummary />
        <HotelHealth />
        <ExecutiveBriefing />
        <TodayOperations />
        <OccupancyRevenue />
        <BookingPerformance />
        <ArrivalsDepartures />
        <GuestExperience />
        <BookingChannels />
        <RevenueOpportunities />
        <OrionInsights />
        <CriticalIssues />
        <RecommendedActions />
        <RecentActivity />
        <QuickActions />
      </section>
    </div>
  );
}

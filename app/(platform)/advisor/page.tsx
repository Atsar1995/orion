import { BusinessHealthCard } from "@/components/advisor/BusinessHealthCard";
import { BusinessSnapshotCard } from "@/components/advisor/BusinessSnapshotCard";
import { CalendarCard } from "@/components/advisor/CalendarCard";
import { DecisionCard } from "@/components/advisor/DecisionCard";
import { ExecutiveBrief } from "@/components/advisor/ExecutiveBrief";
import { OpportunitiesCard } from "@/components/advisor/OpportunitiesCard";
import { PrioritiesCard } from "@/components/advisor/PrioritiesCard";
import { QuickActionsCard } from "@/components/advisor/QuickActionsCard";
import { RisksCard } from "@/components/advisor/RisksCard";
import { WeatherCard } from "@/components/advisor/WeatherCard";
import { Card } from "@/components/ui/Card";
import { FOUNDER_NAME } from "@/lib/command-center-data";
import { RECOMMENDED_DECISIONS } from "@/lib/advisor-data";
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

export default function ExecutiveBriefPage() {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
        <p className={WORKSPACE_GREETING_CLASS}>
          {getGreetingPeriod()}, {FOUNDER_NAME}
        </p>
        <h1 className={WORKSPACE_TITLE_CLASS}>Executive Brief</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>Today&apos;s Brief · {formatTodayDate()}</p>
      </header>

      <section aria-label="Executive Brief" className={WORKSPACE_SECTION_CLASS}>
        <ExecutiveBrief />
        <BusinessHealthCard />
        <PrioritiesCard />
        <RisksCard />
        <OpportunitiesCard />
        <Card title="Recommended Decisions">
          <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {RECOMMENDED_DECISIONS.map((item) => (
              <li key={item.priority}>
                <DecisionCard decision={item} />
              </li>
            ))}
          </ul>
        </Card>
        <BusinessSnapshotCard />
        <CalendarCard />
        <WeatherCard />
        <QuickActionsCard />
      </section>
    </div>
  );
}

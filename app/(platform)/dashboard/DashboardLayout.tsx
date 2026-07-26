import { WidgetGrid, WidgetGridItem } from "@/components/dashboard";
import type { ComposedDashboardSection } from "@/lib/dashboard/DashboardComposer";
import {
  WORKSPACE_GREETING_CLASS,
  WORKSPACE_HEADER_BLOCK_CLASS,
  WORKSPACE_PAGE_CLASS,
  WORKSPACE_SECTION_GROUP_CLASS,
  WORKSPACE_SUBTITLE_CLASS,
  WORKSPACE_TITLE_CLASS,
} from "@/lib/constants";
import { FOUNDER_NAME } from "@/lib/command-center-data";

type DashboardLayoutProps = {
  greeting: string;
  dateLabel: string;
  sections: readonly ComposedDashboardSection[];
};

const SECTION_TITLE_CLASS = "text-sm font-medium tracking-[0.12em] text-white/50 uppercase";

/** EP-002 executive dashboard layout shell using the EP-001 widget framework. */
export function DashboardLayout({ greeting, dateLabel, sections }: DashboardLayoutProps) {
  return (
    <div className={WORKSPACE_PAGE_CLASS}>
      <header className={WORKSPACE_HEADER_BLOCK_CLASS}>
        <p className={WORKSPACE_GREETING_CLASS}>
          {greeting}, {FOUNDER_NAME}
        </p>
        <h1 className={WORKSPACE_TITLE_CLASS}>Executive Dashboard</h1>
        <p className={WORKSPACE_SUBTITLE_CLASS}>{dateLabel}</p>
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          aria-label={section.title ?? section.id}
          className={WORKSPACE_SECTION_GROUP_CLASS}
        >
          {section.title ? (
            <div className="space-y-1">
              <h2 className={SECTION_TITLE_CLASS}>{section.title}</h2>
              {section.subtitle ? (
                <p className="text-sm font-light text-white/45">{section.subtitle}</p>
              ) : null}
            </div>
          ) : null}

          <WidgetGrid columns={section.columns}>
            {section.widgets.map((widget) => (
              <WidgetGridItem key={widget.id} span={widget.span}>
                {widget.node}
              </WidgetGridItem>
            ))}
          </WidgetGrid>
        </section>
      ))}
    </div>
  );
}

function getGreetingPeriod(referenceDate: Date): string {
  const hour = referenceDate.getHours();

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  return "Good Evening";
}

function formatDashboardDate(referenceDate: Date): string {
  return referenceDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Builds greeting and date labels from the dashboard snapshot timestamp. */
export function buildDashboardHeaderLabels(generatedAt: string): {
  greeting: string;
  dateLabel: string;
} {
  const referenceDate = new Date(generatedAt);

  return {
    greeting: getGreetingPeriod(referenceDate),
    dateLabel: formatDashboardDate(referenceDate),
  };
}

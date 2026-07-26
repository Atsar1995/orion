import { DashboardLayout, buildDashboardHeaderLabels } from "@/app/(platform)/dashboard/DashboardLayout";
import { composeDashboard } from "@/lib/dashboard";

/** EP-002 Executive Dashboard — configuration-driven composition with mock data. */
export default function ExecutiveDashboardPage() {
  const composition = composeDashboard();
  const header = buildDashboardHeaderLabels(composition.state.generatedAt);

  return (
    <DashboardLayout
      greeting={header.greeting}
      dateLabel={header.dateLabel}
      sections={composition.sections}
    />
  );
}

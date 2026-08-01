import { FrontOfficeDashboard } from "@/components/hospitality/FrontOfficeDashboard";
import { FrontOfficeQueue } from "@/components/hospitality/FrontOfficeQueue";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { DEFAULT_PROPERTY_ID, hospitalityFrontOfficeService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

/** Front office operations platform (Mission P-007.4). */
export default async function HospitalityFrontOfficePage() {
  const { context } = await getDecisionServiceContext();
  const dashboard = hospitalityFrontOfficeService.dashboard.getDashboard(context, DEFAULT_PROPERTY_ID);

  return (
    <>
      <HospitalitySectionHeader
        title="Front Office"
        subtitle="Operational control center — arrivals, in-house guests, departures, and accommodation movements."
      />
      <section aria-label="Hospitality Front Office" className={`${WORKSPACE_SECTION_CLASS} space-y-6`}>
        <FrontOfficeDashboard dashboard={dashboard} />
        <div className="grid gap-6 lg:grid-cols-2">
          <FrontOfficeQueue title="Arrival Queue" items={dashboard.queues.arrivals} />
          <FrontOfficeQueue title="In-House Guests" items={dashboard.queues.inHouse} />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <FrontOfficeQueue title="Departure Queue" items={dashboard.queues.departures} />
          <FrontOfficeQueue title="Unassigned Arrivals" items={dashboard.queues.unassigned} />
        </div>
      </section>
    </>
  );
}

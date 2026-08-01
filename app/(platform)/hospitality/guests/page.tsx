import { GuestDirectory } from "@/components/hospitality/GuestDirectory";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { hospitalityGuestService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

/** Hospitality guest directory (Mission P-007.3). */
export default async function HospitalityGuestsPage() {
  const { context } = await getDecisionServiceContext();
  const search = hospitalityGuestService.guests.search({}, context);

  return (
    <>
      <HospitalitySectionHeader
        title="Guests"
        subtitle="Guest intelligence & relationship platform — lifelong guest profiles independent of reservations."
      />
      <section aria-label="Hospitality Guests" className={WORKSPACE_SECTION_CLASS}>
        <GuestDirectory guests={search.items} total={search.total} />
      </section>
    </>
  );
}

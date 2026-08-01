import Link from "next/link";
import { ReservationDirectory } from "@/components/hospitality/ReservationDirectory";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { hospitalityReservationService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

/** Hospitality reservations — canonical booking engine UI (Mission P-007.2). */
export default async function HospitalityReservationsPage() {
  const { context } = await getDecisionServiceContext();
  const search = hospitalityReservationService.reservations.search({}, context);

  return (
    <>
      <HospitalitySectionHeader
        title="Reservations"
        subtitle="Complete reservation lifecycle — direct, OTA, corporate, group, and walk-in."
      />
      <div className="flex gap-3">
        <Link
          href="/hospitality/reservations/calendar"
          className="rounded-orion-md border border-orion-gold/25 px-4 py-2 text-sm text-orion-gold hover:bg-orion-gold/10"
        >
          Open Calendar
        </Link>
      </div>
      <section aria-label="Hospitality Reservations" className={WORKSPACE_SECTION_CLASS}>
        <ReservationDirectory items={search.items} />
      </section>
    </>
  );
}

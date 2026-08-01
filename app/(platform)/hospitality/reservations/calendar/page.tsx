import { ReservationCalendar } from "@/components/hospitality/ReservationCalendar";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { hospitalityReservationService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

export const dynamic = "force-dynamic";

/** Reservation calendar views (Mission P-007.2). */
export default async function HospitalityReservationsCalendarPage() {
  const { context } = await getDecisionServiceContext();
  const anchorDate = "2026-07-30";
  const weekly = hospitalityReservationService.calendar.getCalendarView(context, "weekly", anchorDate);
  const monthly = hospitalityReservationService.calendar.getCalendarView(context, "monthly", anchorDate);

  return (
    <>
      <HospitalitySectionHeader
        title="Reservation Calendar"
        subtitle="Daily, weekly, monthly, and timeline views with availability grid."
      />
      <section aria-label="Reservation Calendar" className={WORKSPACE_SECTION_CLASS}>
        <ReservationCalendar calendar={weekly} />
        <ReservationCalendar calendar={{ ...monthly, mode: "monthly" }} />
      </section>
    </>
  );
}

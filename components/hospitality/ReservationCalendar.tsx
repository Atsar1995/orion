import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { WORKSPACE_CAPTION_CLASS } from "@/lib/constants";
import type { ReservationCalendarView } from "@/types/hospitality-reservation";

type ReservationCalendarProps = {
  calendar: ReservationCalendarView;
};

/** Reservation calendar — daily/weekly/monthly timeline (Mission P-007.2). */
export function ReservationCalendar({ calendar }: ReservationCalendarProps) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card title="Arrivals">
          <p className="text-2xl font-semibold text-orion-gold">{calendar.summary.arrivals}</p>
        </Card>
        <Card title="Departures">
          <p className="text-2xl font-semibold text-orion-gold">{calendar.summary.departures}</p>
        </Card>
        <Card title="In-House">
          <p className="text-2xl font-semibold text-orion-gold">{calendar.summary.inHouse}</p>
        </Card>
        <Card title="VIP Arrivals">
          <p className="text-2xl font-semibold text-orion-gold">{calendar.summary.vipArrivals}</p>
        </Card>
      </div>

      <Card title={`Calendar · ${calendar.mode} view`}>
        <p className={`mb-4 ${WORKSPACE_CAPTION_CLASS}`}>
          {calendar.startDate} → {calendar.endDate} · {calendar.entries.length} reservation(s)
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <caption className="sr-only">Reservation calendar</caption>
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Number", "Guest", "Property", "Unit", "Arrival", "Departure", "Status", "Source"].map(
                  (header) => (
                    <th key={header} scope="col" className={`px-3 py-2 ${WORKSPACE_CAPTION_CLASS}`}>
                      {header}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {calendar.entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-sm text-white/45">
                    No reservations in this period.
                  </td>
                </tr>
              ) : (
                calendar.entries.map((entry) => (
                  <tr key={entry.reservationId} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-3 py-3">
                      <Link
                        href={`/hospitality/reservations/${entry.reservationId}`}
                        className="font-medium text-orion-gold hover:underline"
                      >
                        {entry.reservationNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-white/70">
                      {entry.guestName}
                      {entry.isVip ? " · VIP" : ""}
                    </td>
                    <td className="px-3 py-3 text-white/70">{entry.propertyName}</td>
                    <td className="px-3 py-3 text-white/70">{entry.inventoryLabel ?? "Unassigned"}</td>
                    <td className="px-3 py-3 text-white/70">{entry.arrival}</td>
                    <td className="px-3 py-3 text-white/70">{entry.departure}</td>
                    <td className="px-3 py-3 text-white/70">{entry.status.replaceAll("_", " ")}</td>
                    <td className="px-3 py-3 text-white/70">{entry.source.replaceAll("_", " ")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { hospitalityService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

type ReservationDetailPageProps = {
  params: Promise<{ reservationId: string }>;
};

export const dynamic = "force-dynamic";

/** Hospitality reservation detail — engine-backed (Mission P-007.2). */
export default async function HospitalityReservationDetailPage({ params }: ReservationDetailPageProps) {
  const { reservationId } = await params;
  const { context } = await getDecisionServiceContext();
  const detail = hospitalityService.getReservation(reservationId, context);

  if (!detail?.engine) {
    notFound();
  }

  const { guest, room, roomType, engine } = detail;
  const { record } = engine;

  return (
    <>
      <HospitalitySectionHeader
        title={record.reservationNumber}
        subtitle={`${engine.guestName} · ${record.status.replaceAll("_", " ")} · ${engine.propertyName}`}
      />
      <section aria-label="Reservation Detail" className={WORKSPACE_SECTION_CLASS}>
        <Card title="Reservation Details">
          <dl className={WORKSPACE_FIELD_LIST_CLASS}>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Guest</dt>
              <dd className="text-sm text-white/80">
                {guest ? (
                  <Link href={`/hospitality/guests/${guest.id}`} className="text-orion-gold hover:underline">
                    {guest.name}
                  </Link>
                ) : (
                  "Unknown"
                )}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Accommodation</dt>
              <dd className="text-sm text-white/80">
                {roomType?.name ?? engine.accommodationTypeName}
                {engine.inventoryLabel ? ` · ${engine.inventoryLabel}` : " · Unassigned"}
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Arrival</dt>
              <dd className="text-sm text-white/80">{record.arrival}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Departure</dt>
              <dd className="text-sm text-white/80">{record.departure}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Length of stay</dt>
              <dd className="text-sm text-white/80">{record.lengthOfStay} night(s)</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Source</dt>
              <dd className="text-sm text-white/80">{record.source.replaceAll("_", " ")}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Payment</dt>
              <dd className="text-sm text-white/80">{record.paymentStatus.replaceAll("_", " ")}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-sm text-white/45">Rate</dt>
              <dd className="text-sm text-white/80">₹{record.rate.toLocaleString("en-IN")}</dd>
            </div>
          </dl>
        </Card>

        {engine.conflicts.hasConflict ? (
          <Card title="Conflict Detection">
            <ul className="space-y-2">
              {engine.conflicts.conflicts.map((conflict) => (
                <li key={`${conflict.reservationId}-${conflict.severity}`} className="text-sm text-orion-gold/85">
                  {conflict.severity}: {conflict.reservationNumber ?? record.reservationNumber} · {conflict.arrival} →{" "}
                  {conflict.departure}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {record.notes || record.internalComments ? (
          <Card title="Notes">
            {record.notes ? <p className="text-sm text-white/70">{record.notes}</p> : null}
            {record.internalComments ? (
              <p className="mt-2 text-sm text-white/45">Internal: {record.internalComments}</p>
            ) : null}
          </Card>
        ) : null}
      </section>
    </>
  );
}

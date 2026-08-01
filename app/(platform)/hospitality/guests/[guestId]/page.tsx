import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { GuestPreferencesPanel } from "@/components/hospitality/GuestPreferencesPanel";
import { GuestRelationshipPanel } from "@/components/hospitality/GuestRelationshipPanel";
import { GuestTimeline } from "@/components/hospitality/GuestTimeline";
import { HospitalitySectionHeader } from "@/components/hospitality/HospitalitySectionHeader";
import { WORKSPACE_FIELD_LIST_CLASS, WORKSPACE_SECTION_CLASS } from "@/lib/constants";
import { hospitalityGuestService } from "@/lib/hospitality";
import { getDecisionServiceContext } from "@/lib/decisions/server-context";

type GuestDetailPageProps = {
  params: Promise<{ guestId: string }>;
};

export const dynamic = "force-dynamic";

/** Hospitality guest detail with timeline and relationships (Mission P-007.3). */
export default async function HospitalityGuestDetailPage({ params }: GuestDetailPageProps) {
  const { guestId } = await params;
  const { context } = await getDecisionServiceContext();
  const detail = hospitalityGuestService.guests.getDetail(guestId, context);

  if (!detail) {
    notFound();
  }

  const { record, timeline, stayHistory, duplicateCandidates, analytics } = detail;

  return (
    <>
      <HospitalitySectionHeader
        title={record.fullName}
        subtitle={`${record.loyaltyTier}${record.isVip ? " · VIP" : ""} · ${record.stayCount} stay(s) · LTV ${analytics.lifetimeValue}`}
      />
      <section aria-label="Guest Detail" className={`${WORKSPACE_SECTION_CLASS} grid gap-6 lg:grid-cols-2`}>
        <Card title="Profile">
          <dl className={WORKSPACE_FIELD_LIST_CLASS}>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Preferred name</dt>
              <dd className="text-sm text-white/80">{record.preferredName ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Email</dt>
              <dd className="text-sm text-white/80">{record.contact.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Phone</dt>
              <dd className="text-sm text-white/80">{record.contact.phone ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Nationality</dt>
              <dd className="text-sm text-white/80">{record.nationality ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Loyalty number</dt>
              <dd className="text-sm text-white/80">{record.loyaltyNumber ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Company</dt>
              <dd className="text-sm text-white/80">{record.company ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Satisfaction</dt>
              <dd className="text-sm text-white/80">
                {record.satisfactionScore ? `${record.satisfactionScore}% (${analytics.satisfactionTrend})` : "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-sm text-white/45">Revenue rank</dt>
              <dd className="text-sm text-white/80">#{analytics.revenueRank}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Analytics">
          <dl className={WORKSPACE_FIELD_LIST_CLASS}>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Lifetime value</dt>
              <dd className="text-sm text-white/80">{analytics.lifetimeValue}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Average stay value</dt>
              <dd className="text-sm text-white/80">{analytics.averageStayValue}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/[0.04] pb-3">
              <dt className="text-sm text-white/45">Repeat rate</dt>
              <dd className="text-sm text-white/80">{analytics.repeatRate}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-sm text-white/45">Cancellation rate</dt>
              <dd className="text-sm text-white/80">{analytics.cancellationRate}</dd>
            </div>
          </dl>
        </Card>

        <Card title="Preferences & Consent">
          <GuestPreferencesPanel
            preferences={record.preferences}
            dietaryPreferences={record.dietaryPreferences}
            consents={record.consents}
            accessibilityRequirements={record.accessibilityRequirements}
          />
        </Card>

        <Card title="Relationships">
          <GuestRelationshipPanel relationships={record.relationships} />
        </Card>

        <Card title="Stay History">
          <ul className={WORKSPACE_FIELD_LIST_CLASS}>
            {stayHistory.map((stay) => (
              <li key={stay.reservationId} className="border-b border-white/[0.04] pb-3 text-sm last:border-b-0">
                <Link href={`/hospitality/reservations/${stay.reservationId}`} className="text-orion-gold hover:underline">
                  {stay.reservationNumber}
                </Link>
                {" · "}
                {stay.arrival.slice(0, 10)} → {stay.departure.slice(0, 10)} · {stay.status.replaceAll("_", " ")}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Communication Timeline">
          <GuestTimeline entries={timeline} />
        </Card>

        {duplicateCandidates.length > 0 && (
          <Card title="Potential Duplicates">
            <ul className={WORKSPACE_FIELD_LIST_CLASS}>
              {duplicateCandidates.map((candidate) => (
                <li key={candidate.guestId} className="flex justify-between text-sm text-white/70">
                  <Link href={`/hospitality/guests/${candidate.guestId}`} className="text-orion-gold hover:underline">
                    {candidate.fullName}
                  </Link>
                  <span className="text-white/45">{candidate.score}% match</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </section>
    </>
  );
}

import type { GuestTimelineEntry } from "@/types/hospitality-guest";
import { WORKSPACE_FIELD_LIST_CLASS } from "@/lib/constants";

type GuestTimelineProps = {
  readonly entries: readonly GuestTimelineEntry[];
};

const TYPE_LABELS: Record<string, string> = {
  reservation: "Reservation",
  stay: "Stay",
  cancellation: "Cancellation",
  no_show: "No-show",
  feedback: "Feedback",
  complaint: "Complaint",
  compliment: "Compliment",
  service_recovery: "Service Recovery",
  call: "Call",
  email: "Email",
  message: "Message",
  note: "Note",
  special_occasion: "Special Occasion",
  preference_change: "Preference",
  consent_change: "Consent",
  merge: "Merge",
};

/** Guest communication and history timeline (Mission P-007.3). */
export function GuestTimeline({ entries }: GuestTimelineProps) {
  if (entries.length === 0) {
    return <p className="text-sm text-white/50">No timeline entries recorded.</p>;
  }

  return (
    <ol className={WORKSPACE_FIELD_LIST_CLASS} aria-label="Guest timeline">
      {entries.map((entry) => (
        <li key={entry.id} className="border-b border-white/[0.04] pb-3 last:border-b-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-white/90">{entry.title}</p>
              <p className="mt-1 text-sm text-white/60">{entry.summary}</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="rounded bg-white/[0.06] px-2 py-0.5 text-xs text-white/50">
                {TYPE_LABELS[entry.type] ?? entry.type}
              </span>
              <p className="mt-1 text-xs text-white/40">{entry.occurredAt.slice(0, 10)}</p>
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
